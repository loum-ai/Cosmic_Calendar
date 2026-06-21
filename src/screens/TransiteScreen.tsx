import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";
import { ScreenShell, SectionHead, PageHead } from "@/components/ScreenShell";
import { useApp } from "@/store/useApp";
import { CHART } from "@/lib/data";
import { computeTransits, skySummary, SIGN_GLYPH, type TransitHit } from "@/lib/transits";
import { EASE } from "@/lib/tokens";

const IMPACT_COLOR: Record<string, string> = { "+": "#2dd4bf", "-": "#ff8fb0", "~": "#c9b6ff" };
const IMPACT_LABEL: Record<string, string> = { "+": "fördernd", "-": "fordernd", "~": "gemischt" };

function DateScrubber({ offset, setOffset, date }: { offset: number; setOffset: (f: (o: number) => number) => void; date: Date }) {
  const label = date.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
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

/** Full-page transit detail. Close via Zurück. */
function TransitFull({ hits }: { hits: TransitHit[] }) {
  const i = useApp((s) => s.fullTransit);
  const setFull = useApp((s) => s.setFullTransit);
  if (i === null || !hits[i]) return null;
  const tr = hits[i];
  const n = hits.length;

  const c = IMPACT_COLOR[tr.impact];
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setFull(null)}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(4,4,10,0.72)] p-4 backdrop-blur-md lg:pl-[120px]"
      >
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.28, ease: EASE.smooth }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-card border border-[rgba(150,120,255,0.28)] bg-stage p-6 shadow-glass lg:p-8"
        >
          <span className="pointer-events-none absolute -right-6 -top-10 font-glyph text-[150px] leading-none opacity-[0.08]" style={{ color: c }}>{tr.tGlyph}</span>
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="font-mono text-[11px]" style={{ color: c }}>TRANSIT · {IMPACT_LABEL[tr.impact]} · {tr.orb.toFixed(1)}° Orbis</div>
              <button onClick={() => setFull(null)} className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-txt-3 transition hover:text-txt">
                <X className="h-4 w-4" />
              </button>
            </div>
            <h2 className="mt-3 font-cinzel text-[28px] font-semibold leading-tight text-white lg:text-[34px]">{tr.title}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-pill border border-line bg-surface px-2.5 py-1 font-body text-[11px] text-txt-2">laufend: {tr.tName}{tr.tRetro ? " ℞" : ""}</span>
              <span className="rounded-pill border border-line bg-surface px-2.5 py-1 font-body text-[11px] text-txt-2">dein {tr.nName}</span>
            </div>
            <p className="mt-4 font-body text-[15px] leading-relaxed text-txt-2">{tr.txt}</p>

            <div className="mt-7 flex items-center gap-3">
              <button onClick={() => setFull((i - 1 + n) % n)} className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-txt-2 active:scale-90">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex flex-1 flex-wrap justify-center gap-1.5">
                {hits.slice(0, 12).map((_, di) => (
                  <span key={di} className="h-1.5 rounded-full transition-all" style={{ width: di === i ? 22 : 6, background: di === i ? "#8b5cf6" : "rgba(255,255,255,0.22)" }} />
                ))}
              </div>
              <button onClick={() => setFull((i + 1) % n)} className="flex h-11 w-11 items-center justify-center rounded-full bg-cta-gradient text-white active:scale-90">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function TransiteScreen() {
  const setFull = useApp((s) => s.setFullTransit);
  const chartVersion = useApp((s) => s.chartVersion);
  const [offset, setOffset] = useState(0);

  const date = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d;
  }, [offset]);

  const hits = useMemo(() => computeTransits(CHART, date), [date, chartVersion]);
  const sky = useMemo(() => skySummary(date), [date]);
  const strongest = hits[0];

  return (
    <ScreenShell>
      <PageHead label="Heute am Himmel" title="Transite" sub="Was der Himmel gerade in deinem Chart auslöst" />

      <div className="max-w-[360px]">
        <DateScrubber offset={offset} setOffset={setOffset} date={date} />
      </div>

      {strongest ? (
        <>
          {/* strongest influence — editorial, no box */}
          <button onClick={() => setFull(0)} className="mt-9 block w-full text-left transition hover:opacity-90">
            <div className="font-mono text-[11px]" style={{ color: IMPACT_COLOR[strongest.impact] }}>
              STÄRKSTER EINFLUSS · {IMPACT_LABEL[strongest.impact]}
            </div>
            <h2 className="mt-3 font-display text-[clamp(24px,3vw,34px)] font-extrabold leading-[1.08] tracking-[-0.02em] text-txt">
              {strongest.title}
            </h2>
            <p className="mt-3 max-w-[46ch] font-body text-[14px] leading-relaxed text-txt-2">{strongest.txt}</p>
            <span className="mt-3 inline-flex items-center gap-1 font-body text-[12px] text-lilac">
              Ganze Geschichte <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </button>

          {/* transit list — plain rows */}
          <section className="mt-12">
            <SectionHead label="Deine Transite" title="Was dich gerade bewegt" sub={`${hits.length} aktive Verbindungen · tippe für die ganze Geschichte`} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {hits.slice(0, 12).map((tr, i) => (
                <button key={i} onClick={() => setFull(i)} className="vela-tile vela-tile-hover flex items-center gap-4 p-4 text-left">
                  <span className="vela-glyph text-2xl text-lilac">{tr.tGlyph}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-sm font-semibold leading-snug text-txt">{tr.title}</div>
                    <div className="mt-1 font-mono text-[10px]" style={{ color: IMPACT_COLOR[tr.impact] }}>
                      {IMPACT_LABEL[tr.impact]} · {tr.orb.toFixed(1)}°{tr.tRetro ? " · rückläufig" : ""}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-txt-3" />
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <p className="mt-9 font-body text-[14px] text-txt-2">An diesem Tag bilden die laufenden Planeten keine engen Aspekte zu deinem Geburtsbild — eine ruhige Phase.</p>
      )}

      {/* cosmic weather — real sky summary */}
      <section className="mt-12">
        <SectionHead label="Am Himmel" title="Kosmische Wetterlage" sub="Größere Bewegungen über allen" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="vela-tile flex items-start gap-3.5 p-4">
            <span className="vela-glyph mt-0.5 text-xl text-lilac">{SIGN_GLYPH(sky.moonSign)}</span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-semibold text-txt">Mond in {sky.moonSign}</div>
              <div className="mt-0.5 font-mono text-[10px] text-txt-3">Gefühlslage des Tages</div>
              <p className="mt-1.5 font-body text-xs leading-relaxed text-txt-2">Die Stimmung trägt heute die Färbung von {sky.moonSign}.</p>
            </div>
          </div>
          <div className="vela-tile flex items-start gap-3.5 p-4">
            <span className="vela-glyph mt-0.5 text-xl text-lilac">{SIGN_GLYPH(sky.sunSign)}</span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-semibold text-txt">Sonne in {sky.sunSign}</div>
              <div className="mt-0.5 font-mono text-[10px] text-txt-3">Jahreszeit-Thema</div>
              <p className="mt-1.5 font-body text-xs leading-relaxed text-txt-2">Das aktuelle Grundthema am Himmel.</p>
            </div>
          </div>
          <div className="vela-tile flex items-start gap-3.5 p-4 sm:col-span-2">
            <span className="vela-glyph mt-0.5 text-xl text-lilac"><RotateCcw className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-semibold text-txt">
                {sky.retro.length ? `Rückläufig: ${sky.retro.map((r) => r.name).join(", ")}` : "Keine rückläufigen Planeten"}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-txt-3">Phasen zum Innehalten & Überarbeiten</div>
              <p className="mt-1.5 font-body text-xs leading-relaxed text-txt-2">
                {sky.retro.length
                  ? "Diese Themen laufen gerade nach innen — gut zum Überdenken statt Vorpreschen."
                  : "Alle Planeten laufen vorwärts — günstig, um Dinge nach außen zu bringen."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <TransitFull hits={hits} />
    </ScreenShell>
  );
}
