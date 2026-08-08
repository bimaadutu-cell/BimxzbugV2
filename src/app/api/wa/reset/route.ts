export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { resetWA } from "@/lib/wa";

export async function POST() {
  try {
    await resetWA();
    return Response.json({ ok: true, message: "WA direset, silakan scan QR ASLI baru. Auth folder /tmp dibersihkan, Baileys akan generate QR real baru.", real: true });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}
export async function GET() { return POST(); }
