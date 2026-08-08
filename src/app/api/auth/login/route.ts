import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) return Response.json({ ok: false, message: "Lengkapi username & password" }, { status: 400 });

    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!user) return Response.json({ ok: false, message: "Akun tidak ditemukan" }, { status: 401 });
    if (user.password !== password) return Response.json({ ok: false, message: "Kata sandi salah" }, { status: 401 });
    if (!user.isActive) return Response.json({ ok: false, message: "Akun nonaktif / kadaluarsa" }, { status: 403 });

    // check expiry
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      await db.update(users).set({ isActive: false }).where(eq(users.id, user.id));
      return Response.json({ ok: false, message: "Masa aktif telah habis, akun dinonaktifkan" }, { status: 403 });
    }

    // create simple token = id
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
  } catch (e) {
    return Response.json({ ok: false, message: "Gagal masuk: " + String(e) }, { status: 500 });
  }
}
