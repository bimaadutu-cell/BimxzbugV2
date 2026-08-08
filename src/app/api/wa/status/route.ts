import { ensureWA, getWAStatus } from "@/lib/wa";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureWA();
    const s = getWAStatus();
    // also try to get paired number from auth folder?
    return Response.json({ ok: true, status: s.status, hasQR: s.hasQR, pairingCode: s.pairingCode });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
