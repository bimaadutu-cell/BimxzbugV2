import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __bimxDbUrl?: string;
};

// Lazy pool - don't throw at import, handle in runtime
export function getPool(): Pool | null {
  if (!databaseUrl) return null;
  // Recreate if URL changed (vercel env switch)
  if (globalForDb.__bimxDbUrl !== databaseUrl || !globalForDb.__arenaNextJsPostgresqlPool) {
    try {
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: databaseUrl.includes("sslmode=require") || databaseUrl.includes("vercel") || databaseUrl.includes("neon") || databaseUrl.includes("supabase") ? { rejectUnauthorized: false } : undefined,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 8000,
      });
      pool.on("error", (err) => console.error("PG pool error", err));
      globalForDb.__arenaNextJsPostgresqlPool = pool;
      globalForDb.__bimxDbUrl = databaseUrl;
    } catch (e) {
      console.error("Create pool failed", e);
      return null;
    }
  }
  return globalForDb.__arenaNextJsPostgresqlPool!;
}

export const pool = getPool();

// drizzle instance - may be null if no URL, handle gracefully
export const db: any = (() => {
  const p = getPool();
  if (!p) {
    // Return a dummy that will throw clear error when used
    return new Proxy({}, {
      get: () => () => { throw new Error("DATABASE_URL belum diatur. Set DATABASE_URL di Vercel Environment Variables & redeploy. Lihat Vercel Dashboard > Settings > Environment Variables."); }
    }) as any;
  }
  return drizzle(p);
})();
