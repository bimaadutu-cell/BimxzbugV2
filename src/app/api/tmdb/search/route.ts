export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const page = searchParams.get("page") || "1";
  const apiKey = process.env.TMDB_API_KEY || "1ae110e6c988152ee842b46b77656d27";
  if (!q) return Response.json({ ok: false, message: "q diperlukan" }, { status: 400 });
  try {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=id-ID&query=${encodeURIComponent(q)}&page=${page}&include_adult=false`;
    const r = await fetch(url, { next: { revalidate: 30 } });
    const j = await r.json();
    if (!r.ok) return Response.json({ ok: false, error: j }, { status: r.status });
    return Response.json({ ok: true, data: j });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
