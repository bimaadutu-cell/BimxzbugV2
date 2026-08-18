import { resetWA } from "@/lib/wa";

export async function POST() {
  try {
    await resetWA();
    return Response.json({ ok: true, message: "WA direset, silakan scan QR baru" });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e) }, { status: 500 });
  }
}
export async function GET() { return POST(); }
