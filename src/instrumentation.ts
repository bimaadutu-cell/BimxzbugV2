export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { ensureWA } = await import("@/lib/wa");
    await ensureWA();
    console.log("[BIMZ WA] Long-lived Baileys service initialized");
  } catch (e: any) {
    console.error("[BIMZ WA] Startup initialization failed:", e?.message || e);
    // Do not crash Next.js. Pairing/QR endpoints can initialize it later.
  }
}
