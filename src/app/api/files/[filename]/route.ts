import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!filename || filename.includes("..")) return new Response("Invalid", { status: 400 });

  const possiblePaths = [
    path.join(process.cwd(), "public", "uploads", filename),
    path.join("/tmp", "uploads", filename),
  ];

  let filePath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) { filePath = p; break; }
  }
  if (!filePath) return new Response("File tidak ditemukan", { status: 404 });

  const stat = fs.statSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".m4a": "audio/mp4",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".zip": "application/zip",
  };
  const mime = mimeMap[ext] || "application/octet-stream";

  const stream = fs.createReadStream(filePath);
  // @ts-ignore
  return new Response(stream as any, {
    headers: {
      "Content-Type": mime,
      "Content-Length": String(stat.size),
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=31536000",
    },
  });
}
