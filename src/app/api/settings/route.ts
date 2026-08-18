import { db } from "@/db";
import { appSettings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureDb } from "@/lib/ensureDb";

export async function GET() {
  try {
    await ensureDb();
    const rows = await db.select().from(appSettings);
    const obj: Record<string, string> = {};
    for (const r of rows) obj[r.key] = r.value;
    return Response.json({ ok: true, settings: obj });
  } catch (e: any) {
    return Response.json({ ok: true, settings: {}, fallback: true, error: String(e?.message || e) });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDb();
    const body = await req.json();
    const { token, key, value } = body;
    if (!token || !key) return Response.json({ ok: false, message: "Token & key diperlukan" }, { status: 400 });
    let uid: number;
    try { uid = parseInt(Buffer.from(token, "base64").toString("utf-8"), 10); } catch { return Response.json({ ok: false, message: "Token tidak valid" }, { status: 401 }); }
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!user || (user.role !== "DEVELOPER" && user.role !== "OWNER")) return Response.json({ ok: false, message: "Hanya DEVELOPER & OWNER boleh mengubah pengaturan" }, { status: 403 });
    const strValue = String(value);
    if (strValue.length > 5_000_000) {
      return Response.json({ ok: false, message: "File terlalu besar untuk disimpan di database (maks 5MB untuk Vercel). Gunakan file <5MB atau compress." }, { status: 400 });
    }
    const existing = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);
    if (existing.length === 0) {
      await db.insert(appSettings).values({ key, value: strValue });
    } else {
      await db.update(appSettings).set({ value: strValue, updatedAt: new Date() }).where(eq(appSettings.key, key));
    }
    return Response.json({ ok: true, persisted: "db" });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}
