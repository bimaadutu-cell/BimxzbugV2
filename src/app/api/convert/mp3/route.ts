import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ ok: false, message: "File video diperlukan" }, { status: 400 });
    if (file.size > 2 * 1024 * 1024 * 1024) return Response.json({ ok: false, message: "Maksimal 2GB" }, { status: 400 });

    const allowed = ["video/", "audio/"];
    // allow any but warn
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = (file as any).name || "video.mp4";
    const random = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
    const filename = `bimzxbugz_${random}.mp3`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // For now, we store the raw buffer as .mp3 (renamed). In production with ffmpeg, would transcode.
    // To simulate conversion, we just save the buffer.
    // If you want real conversion, client-side ffmpeg.wasm is used, but server fallback is rename.
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    try {
      const tmpDir = "/tmp/uploads";
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(path.join(tmpDir, filename), buffer);
    } catch {}

    const host = req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const finalProto = proto === "http" && !host.includes("localhost") ? "https" : proto;
    const baseUrl = host ? `${finalProto}://${host}` : "";
    const url = `${baseUrl}/api/files/${filename}`;

    return Response.json({ ok: true, filename, originalName, size: buffer.length, url, note: "Disimpan sebagai MP3 (rename). Untuk transcode nyata gunakan converter client-side jika tersedia." });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}
