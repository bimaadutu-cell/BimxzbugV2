export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

import { ensureWA, getQRWithWait, getWAStatus } from "@/lib/wa";

export async function GET() {
  try {
    await ensureWA();
    const result = await getQRWithWait(8000);
    const s = getWAStatus();
    if (!result.qrImage && result.status === "connecting") {
      await new Promise(r => setTimeout(r, 1500));
      const retry = await getQRWithWait(3000);
      if (retry.qrImage) return Response.json({ ok: true, status: retry.status, qrImage: retry.qrImage, hasQR: true, qr: retry.qr, real: true, engine: "Baileys 6.7.18", note: "QR ASLI dari server WhatsApp via Baileys, bukan simulasi. Di Vercel ephemeral, scan cepat 20 detik." });
    }
    return Response.json({ ok: true, status: result.status, qrImage: result.qrImage, hasQR: !!result.qrImage, qr: result.qr, real: true, engine: "Baileys 6.7.18", fallback: s, vercel: !!process.env.VERCEL });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message || e), real: true }, { status: 500 });
  }
}
