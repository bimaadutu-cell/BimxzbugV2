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
    return Response.json({ ok: true, code, phone: cleaned });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}
