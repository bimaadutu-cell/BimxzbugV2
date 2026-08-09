export const dynamic = "force-dynamic";

// Mapping Juz 1-30 to surah ranges (simplified, but equran.id provides per ayat juz)
// We'll provide juz overview by querying all surah and grouping
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const juz = searchParams.get("juz");
  try {
    // Fetch all surah
    const r = await fetch(`https://equran.id/api/v2/surat`, { next: { revalidate: 3600 } });
    const j = await r.json();
    if (!r.ok) return Response.json({ ok: false, error: j }, { status: r.status });
    const all: any[] = j.data;

    // Juz definition (standard)
    const juzMap: Record<string, { start: string; end: string; surahs: string[] }> = {
      "1": { start: "Al-Fatihah:1", end: "Al-Baqarah:141", surahs: ["Al-Fatihah", "Al-Baqarah"] },
      "2": { start: "Al-Baqarah:142", end: "Al-Baqarah:252", surahs: ["Al-Baqarah"] },
      "3": { start: "Al-Baqarah:253", end: "Ali Imran:92", surahs: ["Al-Baqarah", "Ali Imran"] },
      "4": { start: "Ali Imran:93", end: "An-Nisa:23", surahs: ["Ali Imran", "An-Nisa"] },
      "5": { start: "An-Nisa:24", end: "An-Nisa:147", surahs: ["An-Nisa"] },
      "6": { start: "An-Nisa:148", end: "Al-Maidah:81", surahs: ["An-Nisa", "Al-Maidah"] },
      "7": { start: "Al-Maidah:82", end: "Al-An'am:110", surahs: ["Al-Maidah", "Al-An'am"] },
      "8": { start: "Al-An'am:111", end: "Al-A'raf:87", surahs: ["Al-An'am", "Al-A'raf"] },
      "9": { start: "Al-A'raf:88", end: "Al-Anfal:40", surahs: ["Al-A'raf", "Al-Anfal"] },
      "10": { start: "Al-Anfal:41", end: "At-Tawbah:92", surahs: ["Al-Anfal", "At-Tawbah"] },
      "11": { start: "At-Tawbah:93", end: "Hud:5", surahs: ["At-Tawbah", "Yunus", "Hud"] },
      "12": { start: "Hud:6", end: "Yusuf:52", surahs: ["Hud", "Yusuf"] },
      "13": { start: "Yusuf:53", end: "Ibrahim:52", surahs: ["Yusuf", "Ar-Ra'd", "Ibrahim"] },
      "14": { start: "Al-Hijr:1", end: "An-Nahl:128", surahs: ["Al-Hijr", "An-Nahl"] },
      "15": { start: "Al-Isra:1", end: "Al-Kahf:74", surahs: ["Al-Isra", "Al-Kahf"] },
      "16": { start: "Al-Kahf:75", end: "Ta-Ha:135", surahs: ["Al-Kahf", "Maryam", "Ta-Ha"] },
      "17": { start: "Al-Anbiya:1", end: "Al-Hajj:78", surahs: ["Al-Anbiya", "Al-Hajj"] },
      "18": { start: "Al-Mu'minun:1", end: "Al-Furqan:20", surahs: ["Al-Mu'minun", "An-Nur", "Al-Furqan"] },
      "19": { start: "Al-Furqan:21", end: "An-Naml:55", surahs: ["Al-Furqan", "Ash-Shu'ara", "An-Naml"] },
      "20": { start: "An-Naml:56", end: "Al-Ankabut:45", surahs: ["An-Naml", "Al-Qasas", "Al-Ankabut"] },
      "21": { start: "Al-Ankabut:46", end: "Al-Ahzab:30", surahs: ["Al-Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab"] },
      "22": { start: "Al-Ahzab:31", end: "Ya-Sin:27", surahs: ["Al-Ahzab", "Saba", "Fatir", "Ya-Sin"] },
      "23": { start: "Ya-Sin:28", end: "Az-Zumar:31", surahs: ["Ya-Sin", "As-Saffat", "Sad", "Az-Zumar"] },
      "24": { start: "Az-Zumar:32", end: "Fussilat:46", surahs: ["Az-Zumar", "Ghafir", "Fussilat"] },
      "25": { start: "Fussilat:47", end: "Al-Jathiyah:37", surahs: ["Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah"] },
      "26": { start: "Al-Ahqaf:1", end: "Adh-Dhariyat:30", surahs: ["Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Adh-Dhariyat"] },
      "27": { start: "Adh-Dhariyat:31", end: "Al-Hadid:29", surahs: ["Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqiah", "Al-Hadid"] },
      "28": { start: "Al-Mujadilah:1", end: "At-Tahrim:12", surahs: ["Al-Mujadilah", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim"] },
      "29": { start: "Al-Mulk:1", end: "Al-Mursalat:50", surahs: ["Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat"] },
      "30": { start: "An-Naba:1", end: "An-Nas:6", surahs: ["An-Naba", "An-Nazi'at", "Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Lail", "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat", "Al-Qari'ah", "At-Takathur", "Al-Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"] },
    };

    if (juz) {
      const n = String(parseInt(juz));
      if (!juzMap[n]) return Response.json({ ok: false, message: "Juz 1-30 saja" }, { status: 400 });
      // filter surah that belong to juz
      const juzSurahs = juzMap[n].surahs;
      const filtered = all.filter((s: any) => juzSurahs.some(js => s.namaLatin.toLowerCase().includes(js.toLowerCase().slice(0, 4)) || juzSurahs.includes(s.namaLatin)));
      // More accurate: just return map info + all surahs for juz
      return Response.json({ ok: true, juz: parseInt(n), info: juzMap[n], surahs: filtered, allCount: all.length });
    }

    // Return all juz overview
    const overview = Object.entries(juzMap).map(([num, info]) => ({ juz: parseInt(num), ...info, surahCount: info.surahs.length }));
    return Response.json({ ok: true, data: overview, totalJuz: 30, totalSurah: all.length, surahs: all, note: "Al-Qur'an 30 Juz lengkap, real-time equran.id" });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
