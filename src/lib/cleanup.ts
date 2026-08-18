import { db } from "@/db";
import { users } from "@/db/schema";
import { lt, and, isNotNull, eq } from "drizzle-orm";

export async function cleanupExpiredUsers() {
  try {
    const now = new Date();
    // delete users where expiresAt is not null and < now
    // we use raw sql for simplicity via drizzle
    const expired = await db.select().from(users);
    let deleted = 0;
    for (const u of expired) {
      if (u.expiresAt && new Date(u.expiresAt) < now) {
        // don't delete if isActive already false? still delete per spec "otomatis menghapus"
        await db.delete(users).where(eq(users.id, u.id));
        deleted++;
      }
    }
    return { deleted, checked: expired.length };
  } catch (e) {
    return { error: String(e), deleted: 0 };
  }
}
