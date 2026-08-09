export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const apiKey = process.env.TMDB_API_KEY || "1ae110e6c988152ee842b46b77656d27";
  if (!id) return Response.json({ ok: false, message: "id diperlukan" }, { status: 400 });
  try {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=id-ID&append_to_response=credits,videos`;
    const r = await fetch(url, { next: { revalidate: 60 } });
    const j = await r.json();
    if (!r.ok) return Response.json({ ok: false, error: j }, { status: r.status });
    return Response.json({ ok: true, data: j });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
