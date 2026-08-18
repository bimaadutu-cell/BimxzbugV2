import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return Response.json({ ok: false, message: "Token diperlukan" }, { status: 401 });
  let uid: number;
  try { uid = parseInt(Buffer.from(token, "base64").toString("utf-8"), 10); } catch { return Response.json({ ok: false, message: "Token salah" }, { status: 401 }); }
  const [me] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  if (!me || me.role !== "DEVELOPER") return Response.json({ ok: false, message: "Akses ditolak" }, { status: 403 });

  // auto-deactivate expired
  const all = await db.select().from(users).orderBy(desc(users.createdAt));
  const now = new Date();
  for (const u of all) {
    if (u.expiresAt && new Date(u.expiresAt) < now && u.isActive) {
      await db.update(users).set({ isActive: false }).where(eq(users.id, u.id));
      u.isActive = false;
    }
  }
  const refreshed = await db.select().from(users).orderBy(desc(users.createdAt));
  return Response.json({ ok: true, users: refreshed });
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const id = url.searchParams.get("id");
    if (!token || !id) return Response.json({ ok: false, message: "Token & id diperlukan" }, { status: 400 });
    let uid: number;
    try { uid = parseInt(Buffer.from(token, "base64").toString("utf-8"), 10); } catch { return Response.json({ ok: false, message: "Token salah" }, { status: 401 }); }
    const [me] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!me || me.role !== "DEVELOPER") return Response.json({ ok: false, message: "Hanya PENGEMBANG" }, { status: 403 });
    await db.delete(users).where(eq(users.id, parseInt(id, 10)));
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, message: String(e) }, { status: 500 });
  }
}
