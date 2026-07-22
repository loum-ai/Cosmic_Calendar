import { useState } from "react";
import { X, Printer, Check, Download, Loader2 } from "lucide-react";
import { PrintView, ALL_CHAPTERS, type PrintInclude } from "./PrintView";
import { useApp } from "@/store/useApp";
import { FUNCTIONS_URL, SUPABASE_ANON } from "@/lib/supabase";
import { CHART, PROFILE, signName, computeAspects } from "@/lib/data";
import { computeTransits } from "@/lib/transits";
import { aiSummary, aiSign } from "@/lib/interpret";
import { useReadings } from "@/lib/genReadings";
import { chartHash } from "@/lib/factsContext";

const ALL_ON: PrintInclude = { planets: true, houses: true, aspects: true, balance: true, reading: true, points: true, transits: true, forecast: true, glossary: true };

function buildSections(inc: PrintInclude): { heading: string; body: string }[] {
  const cache = useReadings.getState().cache;
  const ch = chartHash();
  const g = (vk: string) => cache[ch + "|" + vk];
  const secs: { heading: string; body: string }[] = [];
  const ov = g("natal:overview") || aiSummary();
  if (inc.reading && ov) secs.push({ heading: "Dein Gesamtbild", body: ov });
  if (inc.reading) for (const p of CHART) {
    const t = g(`planet:${p.key}`) || aiSign(p.key) || p.txt;
    if (t) secs.push({ heading: `${p.name} — ${signName(p.lon)} · ${p.house ?? "?"}. Haus`, body: t });
  }
  if (inc.aspects) {
    const lines = [...computeAspects()].sort((a, b) => a.orb - b.orb).map((a) => `${a.A.name} ${a.def.type} ${a.B.name} (${a.orb.toFixed(1)}°)`).join("\n");
    if (lines) secs.push({ heading: "Aspekte", body: lines });
  }
  if (inc.transits) {
    const tr = computeTransits(CHART, new Date()).slice(0, 8).map((t) => `${t.tName} ${t.type} ${t.nName} — ${t.txt}`).join("\n\n");
    if (tr) secs.push({ heading: "Aktuelle Transite", body: tr });
  }
  return secs;
}

/** Step 1: pick which chapters go into the PDF. Step 2: preview or direct download. */
export function PrintFlow() {
  const setPrintOpen = useApp((s) => s.setPrintOpen);
  const [inc, setInc] = useState<PrintInclude>({ ...ALL_ON });
  const [go, setGo] = useState(false);
  const [busy, setBusy] = useState(false);

  if (go) return <PrintView include={inc} />;

  const toggle = (k: keyof PrintInclude) => setInc((s) => ({ ...s, [k]: !s[k] }));
  const setAll = (v: boolean) => setInc({ planets: v, houses: v, aspects: v, balance: v, reading: v, points: v, transits: v, forecast: v, glossary: v });
  const count = Object.values(inc).filter(Boolean).length;

  async function downloadPdf() {
    setBusy(true);
    try {
      const res = await fetch(`${FUNCTIONS_URL}/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
        body: JSON.stringify({ name: PROFILE.name, birth: PROFILE.birth, sections: buildSections(inc) }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Horoskop-${String(PROFILE.name).replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(4,4,10,0.74)] p-4 backdrop-blur-md lg:pl-[120px]">
      <div className="max-h-[88vh] w-full max-w-[440px] overflow-y-auto rounded-card border border-[rgba(167,139,250,0.25)] bg-[#0e0c1a] p-6 shadow-glass">
        <div className="flex items-start justify-between">
          <div>
            <div className="vela-label">Horoskop · PDF</div>
            <h2 className="mt-1 font-cinzel text-[24px] font-semibold leading-tight text-white">Was soll rein?</h2>
          </div>
          <button onClick={() => setPrintOpen(false)} className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-txt-3 hover:text-txt">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 font-body text-[12.5px] text-txt-2">Deckblatt mit Chart-Rad + Datencheck sind immer dabei. Wähle die Kapitel:</p>

        <div className="mt-4 space-y-1.5">
          {ALL_CHAPTERS.map((ch) => {
            const on = inc[ch.key];
            return (
              <button key={ch.key} onClick={() => toggle(ch.key)} className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition ${on ? "border-line-accent bg-surface-2" : "border-line bg-surface"}`}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${on ? "border-mint bg-mint/25 text-mint" : "border-line text-transparent"}`}>
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="font-body text-[13.5px] text-txt">{ch.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={() => setAll(true)} className="rounded-pill border border-line px-3 py-1.5 font-body text-[12px] text-txt-2 hover:bg-surface">Alle</button>
          <button onClick={() => setAll(false)} className="rounded-pill border border-line px-3 py-1.5 font-body text-[12px] text-txt-2 hover:bg-surface">Keine</button>
        </div>

        <button
          onClick={downloadPdf}
          disabled={count === 0 || busy}
          className="mt-5 flex w-full items-center justify-center gap-2 btn-moon px-5 py-3 font-display text-sm font-semibold disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {busy ? "PDF wird erstellt …" : "PDF herunterladen"}
        </button>
        <button
          onClick={() => setGo(true)}
          disabled={count === 0}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-line px-5 py-2.5 font-body text-[13px] text-txt-2 hover:bg-surface-2 disabled:opacity-40"
        >
          <Printer className="h-4 w-4" /> Vorschau / Drucken
        </button>
      </div>
    </div>
  );
}
