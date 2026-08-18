import { db } from "@/db";
import { appSettings, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(appSettings);
  const obj: Record<string, string> = {};
  for (const r of rows) obj[r.key] = r.value;
  return Response.json({ ok: true, settings: obj });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, key, value } = body;
    if (!token || !key) return Response.json({ ok: false, message: "Token & key diperlukan" }, { status: 400 });
    let uid: number;
    try { uid = parseInt(Buffer.from(token, "base64").toString("utf-8"), 10); } catch { return Response.json({ ok: false, message: "Token tidak valid" }, { status: 401 }); }
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!user || user.role !== "DEVELOPER") return Response.json({ ok: false, message: "Hanya PENGEMBANG boleh mengubah pengaturan" }, { status: 403 });

    const existing = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);
    if (existing.length === 0) {
      await db.insert(appSettings).values({ key, value: String(value) });
    } else {
      await db.update(appSettings).set({ value: String(value), updatedAt: new Date() }).where(eq(appSettings.key, key));
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, message: String(e) }, { status: 500 });
  }
}
