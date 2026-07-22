import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

// pdf — server-rendered horoscope PDF (real downloadable file, works on mobile).
// The client posts { name, birth, sections:[{heading, body}] }; we lay it out
// with pdf-lib (auto-paginated, word-wrapped) and return application/pdf bytes.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// pdf-lib StandardFonts only handle Latin-1 — normalise typography, drop glyphs.
function san(s: string): string {
  return (s || "")
    .replace(/—|–/g, "-").replace(/’|‘|′/g, "'")
    .replace(/[“”„]/g, '"').replace(/…/g, "...").replace(/·/g, "·")
    .replace(/[^\x00-\xFF]/g, "").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { name, birth, sections } = await req.json().catch(() => ({}));
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const A4 = [595.28, 841.89] as const;
    const M = 54;
    const W = A4[0] - M * 2;
    const ink = rgb(0.1, 0.1, 0.18);
    const soft = rgb(0.42, 0.4, 0.5);
    const accent = rgb(0.42, 0.32, 0.7);

    let page = doc.addPage([A4[0], A4[1]]);
    let y = A4[1] - M;

    const wrap = (text: string, f: any, size: number): string[] => {
      const out: string[] = [];
      for (const para of san(text).split("\n")) {
        const words = para.split(/\s+/);
        let line = "";
        for (const w of words) {
          const t = line ? line + " " + w : w;
          if (f.widthOfTextAtSize(t, size) > W && line) { out.push(line); line = w; } else line = t;
        }
        out.push(line);
      }
      return out;
    };
    const need = (h: number) => { if (y - h < M) { page = doc.addPage([A4[0], A4[1]]); y = A4[1] - M; } };
    const draw = (text: string, f: any, size: number, color = ink, gap = 4) => {
      for (const ln of wrap(text, f, size)) { need(size + gap); page.drawText(ln, { x: M, y: y - size, size, font: f, color }); y -= size + gap; }
    };

    page.drawText(san("VELA · GEBURTSHOROSKOP"), { x: M, y: y - 10, size: 9, font: bold, color: accent });
    y -= 26;
    draw(name || "Dein Horoskop", bold, 26, ink, 6);
    if (birth) draw(birth, font, 11, soft, 4);
    y -= 10;
    page.drawLine({ start: { x: M, y }, end: { x: A4[0] - M, y }, thickness: 1, color: rgb(0.85, 0.83, 0.9) });
    y -= 22;

    for (const sec of sections || []) {
      need(40);
      draw(san(sec.heading || ""), bold, 14, accent, 8);
      draw(sec.body || "", font, 11, ink, 5);
      y -= 14;
    }

    need(30);
    y -= 6;
    draw("Erstellt mit Vela. Dieses Horoskop dient der Selbstreflexion und ersetzt keine medizinische, psychologische oder finanzielle Beratung.", font, 8, soft, 3);

    const bytes = await doc.save();
    return new Response(bytes, { status: 200, headers: { ...CORS, "Content-Type": "application/pdf" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
