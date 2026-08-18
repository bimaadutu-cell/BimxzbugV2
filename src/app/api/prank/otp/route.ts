import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendSpamOTP, ensureWA, getWAStatus } from "@/lib/wa";

export async function POST(req: Request) {
  try {
    const { token, targetNumber, service, count } = await req.json();
    if (!token) return Response.json({ ok: false, message: "Token diperlukan" }, { status: 401 });
    let uid: number;
    try { uid = parseInt(Buffer.from(token, "base64").toString("utf-8"), 10); } catch { return Response.json({ ok: false, message: "Token tidak valid" }, { status: 401 }); }
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!user) return Response.json({ ok: false, message: "Akun tidak ditemukan" }, { status: 404 });

    await ensureWA();
    const wa = getWAStatus();
    if (wa.status !== "open") return Response.json({ ok: false, message: "WhatsApp belum terhubung. Hubungkan QR dulu untuk OTP asli via WA." }, { status: 400 });

    if (!targetNumber || !/^\+\d{8,16}$/.test(targetNumber.replace(/\s/g, ""))) {
      return Response.json({ ok: false, message: "Nomor tujuan tidak valid" }, { status: 400 });
    }
    const svc = service || "duniagames";
    const allowed = ["duniagames", "facebook", "gopay", "dana", "shopee", "tokopedia"];
    if (!allowed.includes(svc)) return Response.json({ ok: false, message: "Layanan tidak valid" }, { status: 400 });
    const cnt = Math.min(Math.max(1, parseInt(count) || 1), 20);
    if (cnt > 20) return Response.json({ ok: false, message: "Maksimal 20 OTP sekali eksekusi" }, { status: 400 });

    const results = await sendSpamOTP(targetNumber.replace(/\s/g, ""), svc, cnt);

    return Response.json({
      ok: true,
      message: `OTP ${svc} x${cnt} berhasil dikirim via WA resmi BIMXZBUGXZ (centang jika akun bisnis). Bukan impersonasi, dikirim dari nomor terhubung Anda.`,
      results,
      count: cnt,
      disclaimer: "OTP prank harus dengan izin pemilik nomor. Jangan gunakan untuk mengganggu. Semua pesan dikirim atas nama nomor WA Anda yang terhubung, bukan mengatasnamakan perusahaan resmi tanpa izin.",
    });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}
