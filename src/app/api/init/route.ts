import { db } from "@/db";
import { users, appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureDb } from "@/lib/ensureDb";
import { cleanupExpiredUsers } from "@/lib/cleanup";

export async function GET(req: Request) {
  try {
    await ensureDb();
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }

  try {
    await cleanupExpiredUsers().catch(()=>{});
    const existing = await db.select().from(users).limit(1);
    if (existing.length === 0) {
      const exp7 = new Date(Date.now() + 7*24*60*60*1000);
      const exp30 = new Date(Date.now() + 30*24*60*60*1000);
      const exp90 = new Date(Date.now() + 90*24*60*60*1000);
      await db.insert(users).values([
        { username: "admin", password: "admin123", role: "DEVELOPER", isActive: true, expiresAt: null },
        { username: "owner", password: "owner123", role: "OWNER", isActive: true, expiresAt: exp90 },
        { username: "reseller", password: "reseller123", role: "RESELLER", isActive: true, expiresAt: exp30 },
        { username: "user", password: "user123", role: "PENGGUNA", isActive: true, expiresAt: exp7 },
      ]);
    } else {
      const [admin] = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
      if (admin && admin.expiresAt) {
        await db.update(users).set({ expiresAt: null }).where(eq(users.id, admin.id));
      }
    }

    const settingsCheck = await db.select().from(appSettings).limit(1);
    if (settingsCheck.length === 0) {
      await db.insert(appSettings).values([
        { key: "background_type", value: "none" },
        { key: "wa_pairing_closed", value: "false" },
        { key: "wa_qr_closed", value: "false" },
        { key: "background_url", value: "" },
        { key: "tmdb_key", value: "1ae110e6c988152ee842b46b77656d27" },
        { key: "rapid_key", value: "" },
        { key: "app_version", value: "V1 BimzOfficial Edition" },
      ]);
    }

    return Response.json({ ok: true, seeded: true, note: "PENGGUNA 7d • RESELLER 30d • OWNER 90d • DEVELOPER lifetime • auto delete via /api/cron" });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
export async function POST(req: Request) { return GET(req); }
