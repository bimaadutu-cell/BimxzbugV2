import { ensureWA, getQRWithWait, getWAStatus } from "@/lib/wa";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureWA();
    const result = await getQRWithWait(7000);
    const s = getWAStatus();
    // if no QR but status is connecting, try one more time
    if (!result.qrImage && result.status === "connecting") {
      await new Promise(r => setTimeout(r, 1500));
      const retry = await getQRWithWait(3000);
      if (retry.qrImage) return Response.json({ ok: true, status: retry.status, qrImage: retry.qrImage, hasQR: true, qr: retry.qr });
    }
    return Response.json({ ok: true, status: result.status, qrImage: result.qrImage, hasQR: !!result.qrImage, qr: result.qr, fallback: s });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
