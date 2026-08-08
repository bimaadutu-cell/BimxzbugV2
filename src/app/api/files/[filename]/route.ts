import fs from "fs";
import path from "path";
import { getPool } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!filename || filename.includes("..") || filename.includes("/")) return new Response("Invalid", { status: 400 });

  const possiblePaths = [
    path.join("/tmp", "uploads", filename),
    path.join(process.cwd(), "public", "uploads", filename),
    path.join(process.cwd(), "uploads", filename),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const stat = fs.statSync(p);
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
        ".json": "application/json",
      };
      const mime = mimeMap[ext] || "application/octet-stream";
      const stream = fs.createReadStream(p);
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
  }

  // Fallback: try DB? For now 404
  return new Response("File tidak ditemukan. Di Vercel file /tmp hilang setelah cold start, upload ulang atau gunakan URL base64 untuk background.", { status: 404 });
}
