import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureDb } from "@/lib/ensureDb";

export async function POST(req: Request) {
  try {
    await ensureDb();
    const { username, password } = await req.json();
    if (!username || !password) return Response.json({ ok: false, message: "Lengkapi username & password" }, { status: 400 });

    // Auto-seed if no users
    try {
      const c = await db.select().from(users).limit(1);
      if (c.length === 0) {
        await fetch(new URL("/api/init", req.url).toString()).catch(()=>{});
        // fallback seed manually
        const { sql } = await import("drizzle-orm");
        await db.execute(sql`select 1`).catch(()=>{});
      }
    } catch {}

    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!user) return Response.json({ ok: false, message: "Akun tidak ditemukan. Hubungi admin untuk order akun." }, { status: 401 });
    if (user.password !== password) return Response.json({ ok: false, message: "Kata sandi salah" }, { status: 401 });
    if (!user.isActive) return Response.json({ ok: false, message: "Akun nonaktif / kadaluarsa. Hubungi admin." }, { status: 403 });

    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      await db.update(users).set({ isActive: false }).where(eq(users.id, user.id));
      return Response.json({ ok: false, message: "Masa aktif telah habis, akun dinonaktifkan. Order lagi ke admin." }, { status: 403 });
    }

    const token = Buffer.from(String(user.id)).toString("base64");
    return Response.json({
      ok: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        expiresAt: user.expiresAt,
        pairedNumber: user.pairedNumber,
        isActive: user.isActive,
      },
    });
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (msg.includes("DATABASE_URL") || msg.includes("database") || msg.includes("connect") || msg.includes("Failed query")) {
      return Response.json({ ok: false, message: "Database belum siap: " + msg + " — Pastikan DATABASE_URL sudah di set di Vercel > Settings > Environment Variables > lalu Redeploy (bukan hanya Save). Tunggu 30 detik setelah redeploy." }, { status: 500 });
    }
    return Response.json({ ok: false, message: "Gagal masuk: " + msg }, { status: 500 });
  }
}
