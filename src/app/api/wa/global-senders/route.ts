import { getGlobalSenderPool, getWAStatus, ensureWA } from "@/lib/wa";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureWA();
    const wa = getWAStatus();
    const pool = await getGlobalSenderPool();
    return Response.json({ ok: true, waStatus: wa.status, pool, count: pool.length, note: "Sender Global mengacak sender aktif real-time dari pool pengguna yang sudah pairing" });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e) }, { status: 500 });
  }
}
