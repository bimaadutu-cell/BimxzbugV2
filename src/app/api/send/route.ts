import { db } from "@/db";
import { users, messageLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const ALL_BUGS_OLD = [
  "BimxzBugxz Delay","BimxzBugxz C1","Bimzbugxzz ForceClose","BimxBugz Freezer","BimxzBugxz Heavy","BimxzBugxz Flood","BimxzBugxz Burst","BimxzBugxz Overflow","BimxzBugxz Stack","BimxzBugxz Blast","BimxzBugxz Wave","BimxzBugxz Surge","BimxzBugxz CrashTxt","BimxzBugxz LagMsg","BimxzBugxz Hang","BimxzBugxz LockTxt","BimxzBugxz Jam","BimxzBugxz Bulk","BimxzBugxz Mass","BimxzBugxz Ultra","BimxzBugxz GroupMsg","BimxzBugxz GroupWipe","BimxzBugxz GroupHeavy","BimxzBugxz GroupKill","BimxzBugxz GlobalSend",
];
const ALL_BUGS = [
  "BIMXZBUGXZ Delay","BIMXZBUGXZ C1","BIMXZBUGXZ ForceClose","BIMXZBUGXZ Freezer","BIMXZBUGXZ Heavy","BIMXZBUGXZ Flood","BIMXZBUGXZ Burst","BIMXZBUGXZ Overflow","BIMXZBUGXZ Stack","BIMXZBUGXZ Blast","BIMXZBUGXZ Wave","BIMXZBUGXZ Surge","BIMXZBUGXZ CrashTxt","BIMXZBUGXZ LagMsg","BIMXZBUGXZ Hang","BIMXZBUGXZ LockTxt","BIMXZBUGXZ Jam","BIMXZBUGXZ Bulk","BIMXZBUGXZ Mass","BIMXZBUGXZ Ultra","BIMXZBUGXZ GroupMsg","BIMXZBUGXZ GroupWipe","BIMXZBUGXZ GroupHeavy","BIMXZBUGXZ GroupKill","BIMXZBUGXZ GlobalSend",
];
const ALL = [...ALL_BUGS, ...ALL_BUGS_OLD];

export async function POST(req: Request) {
  try {
    const { token, targetNumber, bugTypes, senderMode, targetMode } = await req.json();
    if (!token) return Response.json({ ok: false, message: "Token diperlukan" }, { status: 401 });
    let uid: number;
    try { uid = parseInt(Buffer.from(token, "base64").toString("utf-8"), 10); } catch { return Response.json({ ok: false, message: "Token tidak valid" }, { status: 401 }); }
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!user) return Response.json({ ok: false, message: "Akun tidak ditemukan" }, { status: 404 });
    if (!user.isActive) return Response.json({ ok: false, message: "Akun nonaktif" }, { status: 403 });
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      await db.update(users).set({ isActive: false }).where(eq(users.id, uid));
      return Response.json({ ok: false, message: "Masa aktif habis" }, { status: 403 });
    }
    if (!user.pairedNumber) return Response.json({ ok: false, message: "Harap pasangkan nomor WhatsApp terlebih dahulu" }, { status: 400 });
    if (!targetNumber || (!/^\+\d{8,16}$/.test(targetNumber.replace(/\s/g, "")) && !targetNumber.includes("@g.us"))) {
      return Response.json({ ok: false, message: "Nomor tujuan tidak valid, gunakan format +[kode negara][nomor] atau ID Grup" }, { status: 400 });
    }
    if (!Array.isArray(bugTypes) || bugTypes.length === 0) return Response.json({ ok: false, message: "Pilih minimal 1 jenis pesan" }, { status: 400 });
    if (bugTypes.length > 3) return Response.json({ ok: false, message: "Maksimal 3 jenis pesan sekaligus" }, { status: 400 });
    for (const b of bugTypes) if (!ALL.includes(b)) return Response.json({ ok: false, message: `Jenis pesan tidak dikenal: ${b}` }, { status: 400 });
    if (user.role === "PENGGUNA") {
      const allowed = ["BimxzBugxz Delay","BIMXZBUGXZ Delay"];
      const illegal = bugTypes.filter((b: string) => !allowed.includes(b));
      if (illegal.length > 0) return Response.json({ ok: false, message: "PENGGUNA hanya boleh memakai BIMXZBUGXZ Delay. Tingkatkan peran Anda." }, { status: 403 });
    }
    const [log] = await db.insert(messageLogs).values({
      userId: uid,
      targetNumber: targetNumber.replace(/\s/g, ""),
      bugTypes,
      senderMode: senderMode || "PRIVATE",
      targetMode: targetMode || "NOMOR",
      status: "BERHASIL",
    }).returning();
    return Response.json({ ok: true, log, pairedSender: user.pairedNumber });
  } catch (e) {
    return Response.json({ ok: false, message: String(e) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return Response.json({ ok: false }, { status: 400 });
  let uid: number;
  try { uid = parseInt(Buffer.from(token, "base64").toString("utf-8"), 10); } catch { return Response.json({ ok: false }, { status: 401 }); }
  const logs = await db.select().from(messageLogs).where(eq(messageLogs.userId, uid)).orderBy(desc(messageLogs.createdAt)).limit(20);
  return Response.json({ ok: true, logs });
}
