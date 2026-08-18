import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function mimeFor(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".mp3": "audio/mpeg", ".mp4": "video/mp4", ".m4a": "audio/mp4",
    ".mov": "video/quicktime", ".webm": "video/webm", ".ogg": "video/ogg",
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".webp": "image/webp", ".gif": "image/gif", ".pdf": "application/pdf",
    ".txt": "text/plain", ".zip": "application/zip", ".json": "application/json",
  };
  return mimeMap[ext] || "application/octet-stream";
}

export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) return new Response("Invalid", { status: 400 });

  const possiblePaths = [
    path.join("/tmp", "uploads", filename),
    path.join(process.cwd(), "public", "uploads", filename),
    path.join(process.cwd(), "uploads", filename),
  ];
  const filePath = possiblePaths.find((p) => fs.existsSync(p));
  if (!filePath) return new Response("File tidak ditemukan. Pada Vercel, filesystem lokal bersifat sementara; gunakan storage/object storage persisten untuk file besar.", { status: 404 });

  const stat = fs.statSync(filePath);
  const size = stat.size;
  const mime = mimeFor(filename);
  const range = req.headers.get("range");
  const baseHeaders: Record<string,string> = {
    "Content-Type": mime,
    "Accept-Ranges": "bytes",
    "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  if (!range) {
    const stream = fs.createReadStream(filePath);
    return new Response(stream as any, { status: 200, headers: { ...baseHeaders, "Content-Length": String(size) } });
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) return new Response(null, { status: 416, headers: { ...baseHeaders, "Content-Range": `bytes */${size}` } });
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2] || 0));
  const end = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start >= size) {
    return new Response(null, { status: 416, headers: { ...baseHeaders, "Content-Range": `bytes */${size}` } });
  }
  const safeEnd = Math.min(end, size - 1);
  const stream = fs.createReadStream(filePath, { start, end: safeEnd });
  return new Response(stream as any, {
    status: 206,
    headers: { ...baseHeaders, "Content-Length": String(safeEnd - start + 1), "Content-Range": `bytes ${start}-${safeEnd}/${size}` },
  });
}
