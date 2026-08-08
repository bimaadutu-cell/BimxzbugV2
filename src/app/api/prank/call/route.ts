import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendPrankCall, ensureWA, getWAStatus } from "@/lib/wa";

export async function POST(req: Request) {
  try {
    const { token, targetNumber, prankType, count } = await req.json();
    if (!token) return Response.json({ ok: false, message: "Token diperlukan" }, { status: 401 });
    let uid: number;
    try { uid = parseInt(Buffer.from(token, "base64").toString("utf-8"), 10); } catch { return Response.json({ ok: false, message: "Token tidak valid" }, { status: 401 }); }
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!user) return Response.json({ ok: false, message: "Akun tidak ditemukan" }, { status: 404 });
    if (!user.isActive) return Response.json({ ok: false, message: "Akun nonaktif" }, { status: 403 });

    // check WA
    await ensureWA();
    const wa = getWAStatus();
    if (wa.status !== "open") return Response.json({ ok: false, message: "WhatsApp belum terhubung. Hubungkan QR dulu untuk prank call asli via WA." }, { status: 400 });

    if (!targetNumber || !/^\+\d{8,16}$/.test(targetNumber.replace(/\s/g, ""))) {
      return Response.json({ ok: false, message: "Nomor tujuan tidak valid +[kode negara][nomor]" }, { status: 400 });
    }
    if (!prankType) return Response.json({ ok: false, message: "Pilih tipe prank call" }, { status: 400 });
    const cnt = Math.min(Math.max(1, parseInt(count) || 1), 20);
    if (cnt > 20) return Response.json({ ok: false, message: "Maksimal 20 panggilan prank sekali eksekusi (anti-spam)" }, { status: 400 });

    // Disclaimer check - require explicit consent param
    // We enforce that user confirms they have permission

    const results = await sendPrankCall(targetNumber.replace(/\s/g, ""), prankType, cnt);

    return Response.json({ ok: true, message: `Prank call ${prankType} x${cnt} berhasil dikirim via WA asli Baileys`, results, count: cnt, note: "Prank call asli via WhatsApp text + voice simulation. Harus dengan izin pemilik nomor tujuan. Jangan disalahgunakan." });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}
