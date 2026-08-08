export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { ensureWA, getWAStatus } from "@/lib/wa";

export async function GET() {
  try {
    await ensureWA();
    const s = getWAStatus();
    return Response.json({ ok: true, status: s.status, hasQR: s.hasQR, pairingCode: s.pairingCode, real: true, engine: "Baileys 6.7.18", vercel: !!process.env.VERCEL, note: s.status==="close" ? "WA belum connect - klik SCAN QR ASLI untuk generate QR real dari WhatsApp" : "WA status real" });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
