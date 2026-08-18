export const dynamic = "force-dynamic";

// Server-side Gemini 2.5 Flash Lite proxy
// Key is read from process.env.GEMINI_API_KEY to avoid exposure on GitHub/Vercel logs
export async function POST(req: Request) {
  try {
    const { prompt, history } = await req.json();
    if (!prompt || !String(prompt).trim()) return Response.json({ ok: false, message: "Prompt diperlukan" }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (!apiKey) {
      return Response.json({ ok: false, message: "GEMINI_API_KEY belum diatur di environment. Atur di Vercel Environment Variables." }, { status: 500 });
    }

    // Use Google Generative AI REST API directly to avoid SDK version issues
    // Model: gemini-2.5-flash-lite (user requested)
    const model = "gemini-2.5-flash-lite";
    // fallback to gemini-2.0-flash if 2.5 not available
    const tryModels = [model, "gemini-2.0-flash", "gemini-1.5-flash"];

    let lastError: any = null;
    let textResult = "";

    for (const m of tryModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
        const body = {
          contents: [
            ...(Array.isArray(history) ? history.slice(-6).map((h: any) => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.text }] })) : []),
            { role: "user", parts: [{ text: String(prompt) }] },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
          systemInstruction: {
            parts: [{ text: "Kamu adalah BimzAI, asisten cerdas dari BIMXZBUGXZ by BimzOfficial. Jawab dengan ramah, membantu, menggunakan bahasa Indonesia, dan jika tidak tahu katakan jujur. Selalu berikan jawaban yang berguna." }],
          },
        };

        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const j = await r.json();
        if (!r.ok) {
          lastError = j;
          // try next model if 404
          if (r.status === 404) continue;
          return Response.json({ ok: false, message: j.error?.message || "Gemini error", error: j }, { status: r.status });
        }
        const parts = j.candidates?.[0]?.content?.parts;
        if (parts && parts.length > 0) {
          textResult = parts.map((p: any) => p.text).join("\n");
          break;
        } else {
          textResult = j.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(j);
          break;
        }
      } catch (e: any) {
        lastError = e;
        continue;
      }
    }

    if (!textResult) {
      return Response.json({ ok: false, message: "Gagal mendapatkan respons dari Gemini", error: lastError }, { status: 500 });
    }

    return Response.json({ ok: true, text: textResult, model: tryModels[0] });
  } catch (e: any) {
    return Response.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}
