import { getGroups, ensureWA, getWAStatus } from "@/lib/wa";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureWA();
    const status = getWAStatus();
    if (status.status !== "open") return Response.json({ ok: false, message: "WhatsApp belum terhubung", status: status.status }, { status: 400 });
    const groups = await getGroups();
    return Response.json({ ok: true, groups: groups.map((g: any) => ({ id: g.id, subject: g.subject, participants: g.participants?.length || 0 })) });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
