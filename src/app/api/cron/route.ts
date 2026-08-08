import { cleanupExpiredUsers } from "@/lib/cleanup";
import { ensureDb } from "@/lib/ensureDb";
export const dynamic = "force-dynamic";
export async function GET() {
  try { await ensureDb(); } catch(e:any){ return Response.json({ok:false,message:String(e.message||e)}, {status:500}); }
  const res = await cleanupExpiredUsers();
  return Response.json({ ok: true, ...res, message: `Cleanup selesai. ${res.deleted || 0} akun expired terhapus.` });
}
export async function POST() { return GET(); }
