export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

import { requestPairingCode } from "@/lib/wa";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) return Response.json({ ok: false, message: "Nomor diperlukan" }, { status: 400 });
    const cleaned = phone.replace(/\s/g, "");
    if (!/^\+\d{8,16}$/.test(cleaned) && !/^\d{8,16}$/.test(cleaned)) {
      return Response.json({ ok: false, message: "Format nomor harus +[kode negara][nomor] contoh +6281234567890" }, { status: 400 });
    }
    const code = await requestPairingCode(cleaned);
    return Response.json({ ok: true, code, phone: cleaned, real: true, engine: "Baileys 6.7.18", note: "Kode ASLI dari WhatsApp, expired 20 detik, masukkan cepat di WA → Perangkat Tertaut → Tautkan dengan nomor telepon" });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e), real: true }, { status: 500 });
  }
}
