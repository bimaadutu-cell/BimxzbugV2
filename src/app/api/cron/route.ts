import { cleanupExpiredUsers } from "@/lib/cleanup";

export const dynamic = "force-dynamic";

export async function GET() {
  const res = await cleanupExpiredUsers();
  return Response.json({ ok: true, ...res, message: `Cleanup selesai. ${res.deleted || 0} akun expired terhapus.` });
}
export async function POST() { return GET(); }
