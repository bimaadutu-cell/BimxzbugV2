import { getPool } from "@/db";

let ensured = false;

export async function ensureDb() {
  if (ensured) return;
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_URL belum diatur. Atur di Vercel > Settings > Environment Variables, lalu Redeploy. Pastikan format: postgresql://user:pass@host/db?sslmode=require");
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'PENGGUNA',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP,
        is_active BOOLEAN NOT NULL DEFAULT true,
        paired_number VARCHAR(32),
        paired_at TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS message_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_number VARCHAR(32) NOT NULL,
        bug_types JSONB NOT NULL,
        sender_mode VARCHAR(20) NOT NULL,
        target_mode VARCHAR(20) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'BERHASIL',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(64) NOT NULL,
        role VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS app_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(64) NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS uploads (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(127) NOT NULL,
        size INTEGER NOT NULL,
        url VARCHAR(512) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        key VARCHAR(128) NOT NULL UNIQUE,
        name VARCHAR(64) NOT NULL DEFAULT 'Bot Key',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_used TIMESTAMP,
        is_active BOOLEAN NOT NULL DEFAULT true
      );
      CREATE TABLE IF NOT EXISTS backgrounds (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        type VARCHAR(20) NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    ensured = true;
  } catch (e: any) {
    // If fails, still throw with helpful message
    throw new Error("Gagal inisialisasi database: " + (e?.message || String(e)) + ". Periksa DATABASE_URL & pastikan Postgres Neon/Supabase aktif.");
  }
}
