import { db } from "@/db";
import { users, apiKeys } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

function genKey() {
  const random = crypto.randomBytes(32).toString("hex"); // 64 chars
  const extra = crypto.randomBytes(8).toString("hex"); // 16 chars
  return `bimzxbugx_api_${random}_${extra}`;
}

function getUserIdFromToken(token: string): number | null {
  try { return parseInt(Buffer.from(token, "base64").toString("utf-8"), 10); } catch { return null; }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return Response.json({ ok: false, message: "Token diperlukan" }, { status: 401 });
  const uid = getUserIdFromToken(token);
  if (!uid) return Response.json({ ok: false, message: "Token tidak valid" }, { status: 401 });
  const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  if (!user) return Response.json({ ok: false, message: "User tidak ditemukan" }, { status: 404 });
  if (user.role !== "DEVELOPER" && user.role !== "OWNER") return Response.json({ ok: false, message: "Hanya DEVELOPER & OWNER yang boleh akses APIKEY" }, { status: 403 });

  const keys = await db.select().from(apiKeys).where(eq(apiKeys.userId, uid)).orderBy(desc(apiKeys.createdAt));
  return Response.json({ ok: true, keys });
}

export async function POST(req: Request) {
  try {
    const { token, name } = await req.json();
    if (!token) return Response.json({ ok: false, message: "Token diperlukan" }, { status: 401 });
    const uid = getUserIdFromToken(token);
    if (!uid) return Response.json({ ok: false, message: "Token tidak valid" }, { status: 401 });
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!user) return Response.json({ ok: false, message: "User tidak ditemukan" }, { status: 404 });
    if (user.role !== "DEVELOPER" && user.role !== "OWNER") return Response.json({ ok: false, message: "Hanya DEVELOPER & OWNER" }, { status: 403 });

    const key = genKey();
    const [created] = await db.insert(apiKeys).values({
      userId: uid,
      key,
      name: name || "Bot Key",
      isActive: true,
    }).returning();

    return Response.json({ ok: true, apiKey: created, key: created.key, message: "APIKEY berhasil dibuat. Simpan baik-baik, key hanya tampil sekali!" });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const id = url.searchParams.get("id");
    if (!token || !id) return Response.json({ ok: false, message: "Token & id diperlukan" }, { status: 400 });
    const uid = getUserIdFromToken(token);
    if (!uid) return Response.json({ ok: false, message: "Token tidak valid" }, { status: 401 });
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!user) return Response.json({ ok: false, message: "User tidak ditemukan" }, { status: 404 });
    // allow owner/developer to delete own keys
    const [key] = await db.select().from(apiKeys).where(eq(apiKeys.id, parseInt(id))).limit(1);
    if (!key) return Response.json({ ok: false, message: "Key tidak ditemukan" }, { status: 404 });
    if (key.userId !== uid && user.role !== "DEVELOPER") return Response.json({ ok: false, message: "Tidak berhak" }, { status: 403 });
    await db.delete(apiKeys).where(eq(apiKeys.id, parseInt(id)));
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e) }, { status: 500 });
  }
}
