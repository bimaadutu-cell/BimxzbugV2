export const dynamic = "force-dynamic";

// 15 Cobalt servers - active instances 2025/2026
const COBALT_SERVERS = [
  "https://co.otomir23.me/",
  "https://cobalt.canine.tools/",
  "https://api.cobalt.tools/",
  "https://cobalt.timelessnesses.me/",
  "https://cobalt-api.kwiatekmiki.com/",
  "https://caucasus.link/api/cobalt/",
  "https://co.wuk.sh/",
  "https://cobalt.247420.xyz/",
  "https://cobalt.backend.wuk.sh/",
  "https://cobalt-api.404.mn/",
  "https://cobalt.akinao.moe/",
  "https://cobalt.chemeng.club/",
  "https://cobalt.missuo.ru/",
  "https://cobalt.velor.example.com/", // placeholder fallback
  "https://cobalt.synack.me/",
];

async function tryCobalt(server: string, url: string, log: any, downloadMode = "auto") {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12000);
  try {
    const cleanServer = server.endsWith("/") ? server : server + "/";
    const r = await fetch(cleanServer, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "BIMXZBUGXZ/1.0",
      },
      body: JSON.stringify({
        url: String(url).trim(),
        videoQuality: "1080",
        filenameStyle: "basic",
        downloadMode: downloadMode || "auto",
        alwaysProxy: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(t);
    const text = await r.text();
    let j: any;
    try { j = JSON.parse(text); } catch { j = { raw: text }; }
    log.push({ server, status: r.status, ok: r.ok, response: j });
    if (!r.ok) return { ok: false, server, error: j };
    if (j.status === "error") return { ok: false, server, error: j };
    if (j.status === "tunnel" || j.status === "redirect" || j.status === "picker") {
      return { ok: true, server, data: j };
    }
    // unknown but treat as ok if has url
    if (j.url) return { ok: true, server, data: j };
    return { ok: false, server, error: j };
  } catch (e: any) {
    clearTimeout(t);
    log.push({ server, error: String(e?.message || e), ok: false });
    return { ok: false, server, error: String(e?.message || e) };
  }
}

export async function POST(req: Request) {
  try {
    const { url, downloadMode } = await req.json();
    if (!url) return Response.json({ ok: false, message: "URL diperlukan" }, { status: 400 });
    try { new URL(url); } catch { return Response.json({ ok: false, message: "URL tidak valid" }, { status: 400 }); }

    // Use env override if set, else try 15
    const envServer = process.env.COBALT_API_URL;
    const servers = envServer ? [envServer, ...COBALT_SERVERS.filter(s => s !== envServer)] : COBALT_SERVERS;

    const attempts: any[] = [];
    let success: any = null;

    for (let i = 0; i < Math.min(15, servers.length); i++) {
      const server = servers[i];
      const res = await tryCobalt(server, url, attempts, downloadMode);
      if (res.ok) { success = res; break; }
      // small delay between retries
      await new Promise(r => setTimeout(r, 300));
    }

    if (success) {
      const j = success.data;
      const random = Math.random().toString(36).slice(2, 10);
      // Determine extension
      let ext = ".mp4";
      if (j.filename) {
        const m = j.filename.match(/\.(\w+)$/);
        if (m) ext = "." + m[1];
      } else if (j.output?.filename) {
        const m = j.output.filename.match(/\.(\w+)$/);
        if (m) ext = "." + m[1];
      }
      const filename = `bimxzbug_${random}${ext}`;

      // For direct auto-download, we return tunnel URL with download headers
      // Client will create <a download> automatically
      if (j.status === "tunnel" || j.status === "redirect") {
        return Response.json({
          ok: true,
          provider: "cobalt",
          server: success.server,
          url: j.url,
          filename,
          downloadUrl: j.url, // for auto download
          attempts: attempts.length,
          logs: attempts,
          raw: j,
        });
      } else if (j.status === "picker") {
        return Response.json({
          ok: true,
          provider: "cobalt",
          server: success.server,
          picker: j.picker,
          audio: j.audio,
          attempts: attempts.length,
          logs: attempts,
          raw: j,
        });
      } else {
        return Response.json({ ok: true, provider: "cobalt", server: success.server, raw: j, attempts: attempts.length, logs: attempts });
      }
    } else {
      return Response.json({
        ok: false,
        message: "Semua 15 server gagal memproses link. Coba link lain atau cek apakah link public.",
        attempts,
        serversTried: servers.slice(0, 15),
      }, { status: 400 });
    }
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ ok: true, servers: COBALT_SERVERS, count: 15, engine: "co.otomir23.me Cobalt 11.7.1 multi-fallback" });
}
