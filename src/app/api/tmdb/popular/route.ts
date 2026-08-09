export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "popular"; // popular, now_playing, upcoming
  const page = searchParams.get("page") || "1";
  const apiKey = process.env.TMDB_API_KEY || "1ae110e6c988152ee842b46b77656d27";
  try {
    const url = `https://api.themoviedb.org/3/movie/${type}?api_key=${apiKey}&language=id-ID&page=${page}`;
    const r = await fetch(url, { next: { revalidate: 60 } });
    const j = await r.json();
    if (!r.ok) return Response.json({ ok: false, error: j }, { status: r.status });
    return Response.json({ ok: true, data: j });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
