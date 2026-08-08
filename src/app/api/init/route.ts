import { db } from "@/db";
import { users, appSettings } from "@/db/schema";
import { sql } from "drizzle-orm";
import { cleanupExpiredUsers } from "@/lib/cleanup";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }

  // auto cleanup expired users every init
  await cleanupExpiredUsers().catch(()=>{});

  const existing = await db.select().from(users).limit(1);
  if (existing.length === 0) {
    const now = new Date();
    const far = new Date();
    far.setFullYear(now.getFullYear() + 5);
    // PENGGUNA 7 hari, RESELLER 30, OWNER 90, DEVELOPER lifetime
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
    // ensure admin exists and fix developer lifetime
    const { eq } = await import("drizzle-orm");
    const [admin] = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
    if (admin && admin.expiresAt) {
      await db.update(users).set({ expiresAt: null }).where(eq(users.id, admin.id));
    }
  }

  const settingsCheck = await db.select().from(appSettings).limit(1);
  if (settingsCheck.length === 0) {
    await db.insert(appSettings).values([
      { key: "background_type", value: "none" },
      { key: "background_url", value: "" },
      { key: "tmdb_key", value: "1ae110e6c988152ee842b46b77656d27" },
      { key: "rapid_key", value: "" },
      { key: "app_version", value: "V1 BimzOfficial Edition" },
    ]);
  }

  return Response.json({ ok: true, seeded: true, note: "PENGGUNA 7d • RESELLER 30d • OWNER 90d • DEVELOPER lifetime • auto delete via /api/cron" });
}
export async function POST() { return GET(); }
