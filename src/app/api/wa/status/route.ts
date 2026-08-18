export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getWAStatus, isWAFeatureClosed } from "@/lib/wa";

export async function GET() {
  try {
    // IMPORTANT: this endpoint is READ-ONLY. It must never create/restart a
    // Baileys socket on every browser poll. The long-lived socket is started
    // by the Railway Node process / pairing / QR endpoints.
    const s = getWAStatus();
    const pairingClosed = await isWAFeatureClosed("wa_pairing_closed");
    const qrClosed = await isWAFeatureClosed("wa_qr_closed");
    return Response.json({
      ok: true,
      status: s.status,
      hasQR: s.hasQR,
      qrImage: s.qrImage,
      pairingCode: s.pairingCode,
      connectedNumber: s.connectedNumber,
      connectedAt: s.connectedAt,
      reconnectAttempts: s.reconnectAttempts,
      lastError: s.lastError,
      pairingClosed,
      qrClosed,
      real: true,
      engine: "Baileys 6.7.22",
      vercel: !!process.env.VERCEL
    });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
