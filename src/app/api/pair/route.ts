import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { token, phone } = await req.json();
    if (!token || !phone) return Response.json({ ok: false, message: "Token & nomor diperlukan" }, { status: 400 });
    let uid: number;
    try { uid = parseInt(Buffer.from(token, "base64").toString("utf-8"), 10); } catch { return Response.json({ ok: false, message: "Token tidak valid" }, { status: 401 }); }
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!user) return Response.json({ ok: false, message: "User tidak ada" }, { status: 404 });
    if (!user.isActive) return Response.json({ ok: false, message: "Akun nonaktif" }, { status: 403 });

    // validate phone: must start with + and digits, 8-16 digits after +
    const cleaned = phone.replace(/\s/g, "");
    if (!/^\+\d{8,16}$/.test(cleaned)) return Response.json({ ok: false, message: "Format nomor harus +[kode negara][nomor] contoh +6281234567890" }, { status: 400 });

    await db.update(users).set({ pairedNumber: cleaned, pairedAt: new Date() }).where(eq(users.id, uid));
    return Response.json({ ok: true, pairedNumber: cleaned });
  } catch (e) {
    return Response.json({ ok: false, message: String(e) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return Response.json({ ok: false }, { status: 400 });
  let uid: number;
  try { uid = parseInt(Buffer.from(token, "base64").toString("utf-8"), 10); } catch { return Response.json({ ok: false }, { status: 401 }); }
  const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  if (!user) return Response.json({ ok: false }, { status: 404 });
  return Response.json({ ok: true, pairedNumber: user.pairedNumber, pairedAt: user.pairedAt });
}
