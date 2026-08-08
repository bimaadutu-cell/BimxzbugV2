import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ ok: false, message: "File diperlukan" }, { status: 400 });

    if (file.size > 2 * 1024 * 1024 * 1024) {
      return Response.json({ ok: false, message: "Maksimal 2GB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = (file as any).name || "file";
    const ext = path.extname(originalName) || "";
    const random = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
    // For generic URL converter, keep original ext but prefix bimxzbug
    const filename = `bimzxbug_${random}${ext || ""}`;
    
    // Ensure uploads dir
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Also ensure /tmp fallback for vercel read-only? public is okay in sandbox
    // Try also write to tmp for safety
    try {
      const tmpDir = "/tmp/uploads";
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(path.join(tmpDir, filename), buffer);
    } catch {}

    // Build URL - use request origin or relative
    const host = req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    // Force https for e2b/vercel public URLs
    const finalProto = proto === "http" && !host.includes("localhost") ? "https" : proto;
    const baseUrl = host ? `${finalProto}://${host}` : "";
    // Use /api/files for guaranteed serving (works before & after publish, vs /uploads static)
    const url = `${baseUrl}/api/files/${filename}`;

    return Response.json({ ok: true, filename, originalName, size: file.size, mimeType: file.type || "application/octet-stream", url });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}
