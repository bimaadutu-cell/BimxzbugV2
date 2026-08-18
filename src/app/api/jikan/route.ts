export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "top";
  const q = searchParams.get("q");
  const page = searchParams.get("page") || "1";
  try {
    let url = "";
    if (type === "top") url = `https://api.jikan.moe/v4/top/anime?page=${page}&limit=18&sfw=true`;
    else if (type === "season") url = `https://api.jikan.moe/v4/seasons/now?page=${page}&limit=18&sfw=true`;
    else if (type === "upcoming") url = `https://api.jikan.moe/v4/seasons/upcoming?page=${page}&limit=18&sfw=true`;
    else if (type === "search" && q) url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&page=${page}&limit=18&order_by=popularity&sort=asc&sfw=true`;
    else if (type === "detail" && q) url = `https://api.jikan.moe/v4/anime/${q}/full`;
    else return Response.json({ ok: false, message: "type tidak valid" }, { status: 400 });

    const r = await fetch(url, { 
      headers: { "User-Agent": "BIMXZBUGXZ/1.0" },
      next: { revalidate: 30 } 
    });
    const j = await r.json().catch(()=> ({}));
    if (!r.ok) {
      return Response.json({ 
        ok: true, 
        data: { data: mockAnime.slice(0, 18) },
        fallback: true,
        error: j
      });
    }
    // also fallback if data empty
    if (!j.data || (Array.isArray(j.data) && j.data.length===0)) {
      return Response.json({ ok: true, data: { data: mockAnime.slice(0, 18) }, fallback: true });
    }
    return Response.json({ ok: true, data: j });
  } catch (e) {
    // fallback on error
    return Response.json({ ok: true, data: { data: mockAnime.slice(0, 12) }, fallback: true });
  }
}

const mockAnime = [
  { mal_id: 5114, title: "Fullmetal Alchemist: Brotherhood", score: 9.1, status: "Finished Airing", episodes: 64, images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1208/94745.jpg", image_url: "https://cdn.myanimelist.net/images/anime/1208/94745.jpg" } }, synopsis: "Alchemist brothers search for Philosopher's Stone.", genres: [{name:"Action"},{name:"Adventure"}] },
  { mal_id: 11061, title: "Hunter x Hunter (2011)", score: 9.03, status: "Finished Airing", episodes: 148, images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1337/99013.jpg", image_url: "https://cdn.myanimelist.net/images/anime/1337/99013.jpg" } }, synopsis: "Gon seeks his father.", genres: [{name:"Action"}] },
  { mal_id: 9253, title: "Steins;Gate", score: 9.07, status: "Finished Airing", episodes: 24, images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1935/127974.jpg", image_url: "https://cdn.myanimelist.net/images/anime/1935/127974.jpg" } }, synopsis: "Time travel thriller.", genres: [{name:"Sci-Fi"}] },
  { mal_id: 16498, title: "Shingeki no Kyojin", score: 8.54, status: "Finished Airing", episodes: 25, images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg" } }, synopsis: "Humanity vs Titans.", genres: [{name:"Action"},{name:"Drama"}] },
  { mal_id: 820, title: "Gintama", score: 9.0, status: "Finished Airing", episodes: 201, images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/3/72078.jpg", image_url: "https://cdn.myanimelist.net/images/anime/3/72078.jpg" } }, synopsis: "Samurai comedy.", genres: [{name:"Comedy"}] },
  { mal_id: 1575, title: "Code Geass", score: 8.7, status: "Finished Airing", episodes: 25, images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/5/50331.jpg", image_url: "https://cdn.myanimelist.net/images/anime/5/50331.jpg" } }, synopsis: "Lelouch rebellion.", genres: [{name:"Mecha"}] },
  { mal_id: 9969, title: "Gintama'", score: 9.02, status: "Finished Airing", episodes: 51, images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/4/50361.jpg", image_url: "https://cdn.myanimelist.net/images/anime/4/50361.jpg" } }, synopsis: "More Gintama.", genres: [{name:"Comedy"}] },
  { mal_id: 1535, title: "Death Note", score: 8.62, status: "Finished Airing", episodes: 37, images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/9/9453.jpg", image_url: "https://cdn.myanimelist.net/images/anime/9/9453.jpg" } }, synopsis: "Notebook of death.", genres: [{name:"Mystery"}] },
  { mal_id: 2904, title: "Code Geass R2", score: 8.91, status: "Finished Airing", episodes: 25, images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1088/135524.jpg", image_url: "https://cdn.myanimelist.net/images/anime/1088/135524.jpg" } }, synopsis: "Rebellion continues.", genres: [{name:"Action"}] },
  { mal_id: 22135, title: "Ping Pong the Animation", score: 8.64, status: "Finished Airing", episodes: 11, images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/10/73274.jpg", image_url: "https://cdn.myanimelist.net/images/anime/10/73274.jpg" } }, synopsis: "Ping pong drama.", genres: [{name:"Sports"}] },
  { mal_id: 28851, title: "Koe no Katachi", score: 8.93, status: "Finished Airing", episodes: 1, images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1122/96435.jpg", image_url: "https://cdn.myanimelist.net/images/anime/1122/96435.jpg" } }, synopsis: "Silent voice.", genres: [{name:"Drama"}] },
  { mal_id: 37520, title: "Dororo", score: 8.25, status: "Finished Airing", episodes: 24, images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1701/96173.jpg", image_url: "https://cdn.myanimelist.net/images/anime/1701/96173.jpg" } }, synopsis: "Demon hunter.", genres: [{name:"Action"}] },
];
