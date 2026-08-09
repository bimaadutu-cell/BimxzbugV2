import fs from "fs";
import path from "path";
import { ensureDb } from "@/lib/ensureDb";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  try {
    await ensureDb();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ ok: false, message: "File video diperlukan" }, { status: 400 });
    if (file.size > 2 * 1024 * 1024 * 1024) return Response.json({ ok: false, message: "Maksimal 2GB" }, { status: 400 });
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalName = (file as any).name || "video.mp4";
    const random = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
    const filename = `bimzxbugz_${random}.mp3`;
    const uploadDir = path.join("/tmp", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    try {
      const pubDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
      fs.writeFileSync(path.join(pubDir, filename), buffer);
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
