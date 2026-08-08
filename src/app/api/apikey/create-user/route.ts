import { db } from "@/db";
import { users, apiKeys } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cleanupExpiredUsers } from "@/lib/cleanup";

function roleToDays(role: string): number | null {
  switch (role) {
    case "PENGGUNA": return 7;
    case "RESELLER": return 30;
    case "OWNER": return 90;
    case "DEVELOPER": return null; // seumur hidup
    default: return 7;
  }
}

export async function POST(req: Request) {
  // cleanup first
  await cleanupExpiredUsers().catch(()=>{});

  const apiKeyHeader = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  let keyValue = apiKeyHeader.trim();
  // also allow ?apikey= in url or body apikey
  const url = new URL(req.url);
  const qpKey = url.searchParams.get("apikey") || url.searchParams.get("key");
  if (!keyValue && qpKey) keyValue = qpKey.trim();

  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }
  if (!keyValue && body.apikey) keyValue = String(body.apikey).trim();
  if (!keyValue && body.apiKey) keyValue = String(body.apiKey).trim();

  if (!keyValue || !keyValue.startsWith("bimzxbugx_api_")) {
    return Response.json({ ok: false, message: "APIKEY tidak valid. Header: x-api-key: bimzxbugx_api_..." }, { status: 401 });
  }

  const [keyRow] = await db.select().from(apiKeys).where(eq(apiKeys.key, keyValue)).limit(1);
  if (!keyRow) return Response.json({ ok: false, message: "APIKEY tidak ditemukan" }, { status: 401 });
  if (!keyRow.isActive) return Response.json({ ok: false, message: "APIKEY nonaktif" }, { status: 403 });

  // update lastUsed
  await db.update(apiKeys).set({ lastUsed: new Date() }).where(eq(apiKeys.id, keyRow.id));

  // get owner of key
  const [owner] = await db.select().from(users).where(eq(users.id, keyRow.userId)).limit(1);
  if (!owner || !owner.isActive) return Response.json({ ok: false, message: "Pemilik APIKEY nonaktif" }, { status: 403 });
  if (owner.role !== "OWNER" && owner.role !== "DEVELOPER") return Response.json({ ok: false, message: "Hanya APIKEY dari OWNER/DEVELOPER yang valid" }, { status: 403 });

  const { username, password, role, name } = body;
  // support both name and username
  const uname = username || name;
  if (!uname || !password || !role) {
    return Response.json({ ok: false, message: "Wajib isi: username, password, role (PENGGUNA/RESELLER/OWNER/DEVELOPER)" }, { status: 400 });
  }
  const validRoles = ["PENGGUNA", "RESELLER", "OWNER", "DEVELOPER"];
  if (!validRoles.includes(role)) return Response.json({ ok: false, message: "Role tidak valid. Pilih: PENGGUNA, RESELLER, OWNER, DEVELOPER" }, { status: 400 });

  // owner cannot create DEVELOPER? allow but only DEVELOPER can create DEVELOPER for safety
  if (role === "DEVELOPER" && owner.role !== "DEVELOPER") {
    return Response.json({ ok: false, message: "Hanya DEVELOPER yang boleh membuat akun DEVELOPER" }, { status: 403 });
  }

  const [exists] = await db.select().from(users).where(eq(users.username, uname)).limit(1);
  if (exists) return Response.json({ ok: false, message: "Username sudah dipakai" }, { status: 409 });

  const days = roleToDays(role);
  const expiresAt = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null;

  const [newUser] = await db.insert(users).values({
    username: uname,
    password: String(password),
    role,
    expiresAt,
    isActive: true,
  }).returning();

  return Response.json({
    ok: true,
    message: `Akun ${role} berhasil dibuat via APIKEY. Berlaku ${days ? days + " hari" : "seumur hidup"} — otomatis terhapus saat expired.`,
    user: {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      expiresAt: newUser.expiresAt,
      createdAt: newUser.createdAt,
    },
    expiresInDays: days,
    autoDelete: days ? `Otomatis terhapus pada ${newUser.expiresAt?.toLocaleString("id-ID")}` : "Tidak pernah expired",
  });
}

// GET for bot to test key
export async function GET(req: Request) {
  const key = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || new URL(req.url).searchParams.get("apikey") || "";
  if (!key) return Response.json({ ok: false, message: "Kirim x-api-key header untuk cek" }, { status: 400 });
  const [row] = await db.select().from(apiKeys).where(eq(apiKeys.key, String(key).trim())).limit(1);
  if (!row) return Response.json({ ok: false, message: "APIKEY tidak valid" }, { status: 401 });
  const [owner] = await db.select().from(users).where(eq(users.id, row.userId)).limit(1);
  return Response.json({ ok: true, valid: true, owner: owner?.username, role: owner?.role, key: { id: row.id, name: row.name, createdAt: row.createdAt, lastUsed: row.lastUsed } });
}
