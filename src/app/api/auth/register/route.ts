import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, role, expiresInDays, requesterToken } = body;

    if (!username || !password || !role) return Response.json({ ok: false, message: "Lengkapi data" }, { status: 400 });

    // verify requester is DEVELOPER
    if (!requesterToken) return Response.json({ ok: false, message: "Token pengembang diperlukan" }, { status: 401 });
    let requesterId: number;
    try { requesterId = parseInt(Buffer.from(requesterToken, "base64").toString("utf-8"), 10); } catch { return Response.json({ ok: false, message: "Token tidak valid" }, { status: 401 }); }
    const [requester] = await db.select().from(users).where(eq(users.id, requesterId)).limit(1);
    if (!requester || requester.role !== "DEVELOPER") return Response.json({ ok: false, message: "Hanya PENGEMBANG yang boleh membuat akun" }, { status: 403 });

    const validRoles = ["PENGGUNA", "RESELLER", "OWNER", "DEVELOPER"];
    if (!validRoles.includes(role)) return Response.json({ ok: false, message: "Peran tidak valid" }, { status: 400 });

    const [exists] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (exists) return Response.json({ ok: false, message: "Nama pengguna sudah dipakai" }, { status: 409 });

    const expiresAt = expiresInDays ? new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000) : null;

    const [newUser] = await db.insert(users).values({
      username,
      password,
      role,
      expiresAt,
      isActive: true,
    }).returning();

    return Response.json({ ok: true, user: newUser });
  } catch (e) {
    return Response.json({ ok: false, message: String(e) }, { status: 500 });
  }
}
