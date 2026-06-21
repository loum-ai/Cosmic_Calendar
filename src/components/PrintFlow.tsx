import { useState } from "react";
import { X, Printer, Check } from "lucide-react";
import { PrintView, ALL_CHAPTERS, type PrintInclude } from "./PrintView";
import { useApp } from "@/store/useApp";

const ALL_ON: PrintInclude = { planets: true, houses: true, aspects: true, balance: true, reading: true, points: true, transits: true, forecast: true, glossary: true };

/** Step 1: pick which chapters go into the PDF. Step 2: the printable preview. */
export function PrintFlow() {
  const setPrintOpen = useApp((s) => s.setPrintOpen);
  const [inc, setInc] = useState<PrintInclude>({ ...ALL_ON });
  const [go, setGo] = useState(false);

  if (go) return <PrintView include={inc} />;

  const toggle = (k: keyof PrintInclude) => setInc((s) => ({ ...s, [k]: !s[k] }));
  const setAll = (v: boolean) => setInc({ planets: v, houses: v, aspects: v, balance: v, reading: v, points: v, transits: v, forecast: v, glossary: v });
  const count = Object.values(inc).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(4,4,10,0.74)] p-4 backdrop-blur-md lg:pl-[120px]">
      <div className="max-h-[88vh] w-full max-w-[440px] overflow-y-auto rounded-card border border-[rgba(150,120,255,0.25)] bg-[#0e0c1a] p-6 shadow-glass">
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
          onClick={() => setGo(true)}
          disabled={count === 0}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cta-gradient px-5 py-3 font-display text-sm font-semibold text-white shadow-glow disabled:opacity-40"
        >
          <Printer className="h-4 w-4" /> PDF-Vorschau erstellen
        </button>
      </div>
    </div>
  );
}
