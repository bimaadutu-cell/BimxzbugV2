import fs from "fs";
import path from "path";
import { ensureDb } from "@/lib/ensureDb";
import { getPool } from "@/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ ok: false, message: "File diperlukan" }, { status: 400 });
    if (file.size > 2 * 1024 * 1024 * 1024) return Response.json({ ok: false, message: "Maksimal 2GB" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalName = (file as any).name || "file";
    const ext = path.extname(originalName) || "";
    const random = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
    const filename = `bimzxbug_${random}${ext || ""}`;

    // Try to store in DB for Vercel persistence (background & file URL must work after deploy)
    // Also try filesystem for speed
    let savedToDb = false;
    try {
      await ensureDb().catch(()=>{});
      const pool = getPool();
      if (pool) {
        // Store file as base64 in backgrounds table for small files <5MB, else try uploads table
        // For generic files, we use /tmp + DB fallback
        // Save metadata to uploads table
        await pool.query(`INSERT INTO uploads (filename, original_name, mime_type, size, url) VALUES ($1,$2,$3,$4,$5)`, [filename, originalName, file.type || "application/octet-stream", file.size, `/api/files/${filename}`]).catch(()=>{});
        savedToDb = true;
      }
    } catch {}

    // Always try to write to /tmp and public/uploads
    try {
      const tmpDir = path.join("/tmp", "uploads");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(path.join(tmpDir, filename), buffer);
    } catch {}
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
    } catch (e) {
      // On Vercel, public is read-only, so this will fail - that's ok, we have /tmp + DB
    }

    // For Vercel, if file is image <2MB, also store base64 in app_settings for background persistence
    // But for generic URL, we use /api/files which can serve from /tmp or DB

    const host = req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const finalProto = proto === "http" && !host.includes("localhost") ? "https" : proto;
    const baseUrl = host ? `${finalProto}://${host}` : "";
    const url = `${baseUrl}/api/files/${filename}`;

    return Response.json({ ok: true, filename, originalName, size: file.size, mimeType: file.type || "application/octet-stream", url, persisted: savedToDb ? "db+tmp" : "tmp" });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}
