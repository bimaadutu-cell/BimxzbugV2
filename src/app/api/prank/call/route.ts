import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureDb } from "@/lib/ensureDb";
import { sendPrankCall, ensureWA, getWAStatus } from "@/lib/wa";

export async function POST(req: Request) {
  try {
    await ensureDb();
    const { token, targetNumber, prankType, count } = await req.json();
    if (!token) return Response.json({ ok: false, message: "Token diperlukan" }, { status: 401 });
    let uid: number;
    try { uid = parseInt(Buffer.from(token, "base64").toString("utf-8"), 10); } catch { return Response.json({ ok: false, message: "Token tidak valid" }, { status: 401 }); }
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!user) return Response.json({ ok: false, message: "Akun tidak ditemukan" }, { status: 404 });
    if (!user.isActive) return Response.json({ ok: false, message: "Akun nonaktif" }, { status: 403 });
    await ensureWA();
    const wa = getWAStatus();
    if (wa.status !== "open") return Response.json({ ok: false, message: "WhatsApp belum terhubung. Hubungkan QR dulu untuk prank call asli via WA." }, { status: 400 });
    if (!targetNumber || !/^\+\d{8,16}$/.test(targetNumber.replace(/\s/g, ""))) {
      return Response.json({ ok: false, message: "Nomor tujuan tidak valid +[kode negara][nomor]" }, { status: 400 });
    }
    if (!prankType) return Response.json({ ok: false, message: "Pilih tipe prank call" }, { status: 400 });
    const cnt = Math.min(Math.max(1, parseInt(count) || 1), 20);
    const results = await sendPrankCall(targetNumber.replace(/\s/g, ""), prankType, cnt);
    return Response.json({ ok: true, message: `Prank call ${prankType} x${cnt} berhasil dikirim via WA asli Baileys`, results, count: cnt, note: "Prank call asli via WhatsApp text + voice simulation. Harus dengan izin pemilik nomor tujuan. Jangan disalahgunakan." });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}
