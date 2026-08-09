export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { ensureWA, getWAStatus, isWAFeatureClosed } from "@/lib/wa";

export async function GET() {
  try {
    await ensureWA();
    const s = getWAStatus();
    const pairingClosed = await isWAFeatureClosed("wa_pairing_closed");
    const qrClosed = await isWAFeatureClosed("wa_qr_closed");
    return Response.json({ ok: true, status: s.status, hasQR: s.hasQR, qrImage: s.qrImage, pairingCode: s.pairingCode, connectedNumber: s.connectedNumber, pairingClosed, qrClosed, real: true, engine: "Baileys 6.7.22", vercel: !!process.env.VERCEL, note: s.status==="close" ? "WA belum connect" : "WA status" });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
