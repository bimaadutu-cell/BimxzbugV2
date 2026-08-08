import { db } from "@/db";
import { chats, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const list = await db.select().from(chats).orderBy(desc(chats.createdAt)).limit(50);
  // return reverse chronological -> oldest first for display
  return Response.json({ ok: true, chats: list.reverse() });
}

export async function POST(req: Request) {
  try {
    const { token, message } = await req.json();
    if (!token || !message) return Response.json({ ok: false, message: "Token & pesan diperlukan" }, { status: 400 });
    if (String(message).trim().length === 0) return Response.json({ ok: false, message: "Pesan kosong" }, { status: 400 });
    if (String(message).length > 500) return Response.json({ ok: false, message: "Pesan maksimal 500 karakter" }, { status: 400 });

    let uid: number;
    try { uid = parseInt(Buffer.from(token, "base64").toString("utf-8"), 10); } catch { return Response.json({ ok: false, message: "Token salah" }, { status: 401 }); }
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!user) return Response.json({ ok: false, message: "User tidak ditemukan" }, { status: 404 });
    if (!user.isActive) return Response.json({ ok: false, message: "Akun nonaktif" }, { status: 403 });

    const [chat] = await db.insert(chats).values({
      userId: uid,
      username: user.username,
      role: user.role,
      message: String(message).trim(),
    }).returning();

    return Response.json({ ok: true, chat });
  } catch (e) {
    return Response.json({ ok: false, message: String(e) }, { status: 500 });
  }
}
