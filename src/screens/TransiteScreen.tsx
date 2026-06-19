import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScreenShell, SectionHead } from "@/components/ScreenShell";
import { useApp } from "@/store/useApp";
import { COSMIC_EVENTS, TRANSITS } from "@/lib/data";
import { EASE } from "@/lib/tokens";

const IMPACT_COLOR: Record<string, string> = { "+": "#2dd4bf", "-": "#ff8fb0", "~": "#c9b6ff" };
const IMPACT_LABEL: Record<string, string> = { "+": "fördernd", "-": "fordernd", "~": "gemischt" };

function DateScrubber() {
  const [offset, setOffset] = useState(0);
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const label = d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="flex items-center gap-2 rounded-pill border border-line bg-surface px-1.5 py-1.5">
      <button onClick={() => setOffset((o) => o - 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-txt-2 active:scale-90">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="flex-1 text-center font-mono text-[12px] text-txt-2">{offset === 0 ? "Heute" : label}</span>
      <button onClick={() => setOffset((o) => o + 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-txt-2 active:scale-90">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Full-page transit detail. Close via X, backdrop, ESC. */
function TransitFull() {
  const i = useApp((s) => s.fullTransit);
  const setFull = useApp((s) => s.setFullTransit);
  if (i === null || !TRANSITS[i]) return null;
  const tr = TRANSITS[i];
  const n = TRANSITS.length;

  return (
    <AnimatePresence>
      {i !== null && (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.32, ease: EASE.smooth }}
          className="fixed inset-0 z-[80] overflow-y-auto bg-[#050509]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_46%_26%_at_50%_-6%,rgba(116,96,200,0.12),transparent_55%)]" />
          <div className="relative mx-auto w-full max-w-[680px] px-[max(22px,6vw)] pb-24 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
            <button onClick={() => setFull(null)} className="mb-8 flex items-center gap-2 font-body text-sm text-txt-2 transition hover:text-txt">
              <ChevronLeft className="h-4 w-4" /> Zurück
            </button>

            <div className="font-mono text-[11px]" style={{ color: IMPACT_COLOR[tr.impact] }}>
              TRANSIT · {IMPACT_LABEL[tr.impact]}
            </div>
            <h2 className="mt-3 font-display text-[clamp(28px,7vw,40px)] font-extrabold leading-[1.05] tracking-[-0.02em] text-txt text-balance">
              {tr.title}
            </h2>
            <p className="mt-5 max-w-[56ch] font-body text-[15px] leading-relaxed text-txt-2">{tr.txt}</p>

            <div className="mt-10 flex items-center gap-3">
              <button onClick={() => setFull(((i ?? 0) - 1 + n) % n)} className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-txt-2 active:scale-90">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex flex-1 justify-center gap-1.5">
                {TRANSITS.map((_, di) => (
                  <span key={di} className="h-1.5 rounded-full transition-all" style={{ width: di === i ? 22 : 6, background: di === i ? "#8b5cf6" : "rgba(255,255,255,0.22)" }} />
                ))}
              </div>
              <button onClick={() => setFull(((i ?? 0) + 1) % n)} className="flex h-11 w-11 items-center justify-center rounded-full bg-cta-gradient text-white active:scale-90">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TransiteScreen() {
  const setFull = useApp((s) => s.setFullTransit);
  return (
    <ScreenShell>
      <div className="vela-label">Heute am Himmel</div>
      <h1 className="mt-1.5 font-display text-2xl font-bold leading-tight text-txt">Transite</h1>
      <p className="mt-1 font-mono text-[12px] text-txt-2">Was der Himmel gerade in deinem Chart auslöst</p>

      <div className="mt-5 max-w-[360px]">
        <DateScrubber />
      </div>

      {/* strongest influence — editorial, no box */}
      <button onClick={() => setFull(0)} className="mt-9 block w-full text-left transition hover:opacity-90">
        <div className="font-mono text-[11px]" style={{ color: IMPACT_COLOR[TRANSITS[0].impact] }}>
          STÄRKSTER EINFLUSS · {IMPACT_LABEL[TRANSITS[0].impact]}
        </div>
        <h2 className="mt-3 font-display text-[clamp(24px,3vw,34px)] font-extrabold leading-[1.08] tracking-[-0.02em] text-txt">
          {TRANSITS[0].title}
        </h2>
        <p className="mt-3 max-w-[46ch] font-body text-[14px] leading-relaxed text-txt-2">{TRANSITS[0].txt}</p>
        <span className="mt-3 inline-flex items-center gap-1 font-body text-[12px] text-lilac">
          Ganze Geschichte <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </button>

      {/* transit list — plain rows */}
      <section className="mt-12">
        <SectionHead label="Deine Transite" title="Was dich gerade bewegt" sub="Tippe für die ganze Geschichte" />
        <div>
          {TRANSITS.map((tr, i) => (
            <button key={i} onClick={() => setFull(i)} className="flex w-full items-center gap-3.5 border-b border-line-soft py-3.5 text-left transition hover:opacity-80">
              <span className="vela-glyph text-xl text-lilac">{tr.tg}</span>
              <div className="min-w-0 flex-1 font-display text-sm font-semibold text-txt">{tr.title}</div>
              <span className="font-mono text-[11px]" style={{ color: IMPACT_COLOR[tr.impact] }}>{tr.impact}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-txt-3" />
            </button>
          ))}
        </div>
      </section>

      {/* cosmic weather — plain rows */}
      <section className="mt-10">
        <SectionHead label="Am Himmel" title="Kosmische Wetterlage" sub="Größere Bewegungen über allen" />
        <div>
          {COSMIC_EVENTS.map((e, i) => (
            <div key={i} className="flex items-start gap-3.5 border-b border-line-soft py-3.5">
              <span className="vela-glyph mt-0.5 text-lg text-lilac">{e.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-semibold text-txt">{e.label}</div>
                <div className="font-mono text-[10px] text-txt-3">{e.sub}</div>
                <p className="mt-1 font-body text-xs leading-relaxed text-txt-2">{e.txt}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <TransitFull />
    </ScreenShell>
  );
}
