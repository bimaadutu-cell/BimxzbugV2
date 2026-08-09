export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { ensureWA, getWAStatus } from "@/lib/wa";

export async function POST() {
  try {
    await ensureWA();
    const s = getWAStatus();
    if (s.status === "open") {
      return Response.json({ ok: true, message: "WhatsApp sudah terhubung.", status: s.status, connectedNumber: s.connectedNumber, real: true });
    }
    return Response.json({ ok: false, message: "Belum terhubung. Gunakan pairing code yang diberikan WhatsApp atau scan QR.", status: s.status }, { status: 400 });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}
