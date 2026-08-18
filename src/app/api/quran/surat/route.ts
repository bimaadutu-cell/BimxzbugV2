export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nomor = searchParams.get("nomor");
  try {
    if (nomor) {
      // Detail surah
      const r = await fetch(`https://equran.id/api/v2/surat/${nomor}`, { next: { revalidate: 3600 } });
      const j = await r.json();
      if (!r.ok) return Response.json({ ok: false, error: j }, { status: r.status });
      return Response.json({ ok: true, data: j.data });
    } else {
      // List all surah 114
      const r = await fetch(`https://equran.id/api/v2/surat`, { next: { revalidate: 3600 } });
      const j = await r.json();
      if (!r.ok) return Response.json({ ok: false, error: j }, { status: r.status });
      // j.data is array 114
      return Response.json({ ok: true, data: j.data, count: j.data.length, juzCoverage: "1-30", note: "Al-Qur'an lengkap 114 surah, 30 juz, real-time dari equran.id" });
    }
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
