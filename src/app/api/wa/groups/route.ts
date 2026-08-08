export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { getGroups, ensureWA, getWAStatus } from "@/lib/wa";

export async function GET() {
  try {
    await ensureWA();
    const status = getWAStatus();
    if (status.status !== "open") return Response.json({ ok: false, message: "WhatsApp belum terhubung (status: "+status.status+"). Scan QR ASLI dulu. QR asli Baileys, bukan simulasi.", status: status.status, real: true }, { status: 400 });
    const groups = await getGroups();
    return Response.json({ ok: true, groups: groups.map((g: any) => ({ id: g.id, subject: g.subject, participants: g.participants?.length || 0 })), real: true });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
