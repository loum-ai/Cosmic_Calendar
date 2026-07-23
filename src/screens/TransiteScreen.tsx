import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, X, Sparkles, Loader2 } from "lucide-react";
import { ScreenShell, SectionHead, PageHead } from "@/components/ScreenShell";
import { useReading } from "@/lib/genReadings";
import { useApp } from "@/store/useApp";
import { CHART, SN, SIGNWHAT, SIGNMEAN, signName } from "@/lib/data";
import { computeTransits, skySummary, transitingBodies, SIGN_GLYPH, type TransitHit } from "@/lib/transits";
import { EASE } from "@/lib/tokens";

const IMPACT_COLOR: Record<string, string> = { "+": "#20F0D0", "-": "#ff8fb0", "~": "#c9b6ff" };
const IMPACT_LABEL: Record<string, string> = { "+": "fördernd", "-": "fordernd", "~": "gemischt" };

/** One transit, cinematic & full-bleed; swipe left/right to move between them. */
function TransitStage({ tr, onPrev, onNext }: { tr: TransitHit; onPrev: () => void; onNext: () => void }) {
  const c = IMPACT_COLOR[tr.impact];
  const vk = `transit:${tr.tKey}_${tr.nKey}_${tr.type}`;
  const task = `Deute den aktuellen Transit: Der laufende ${tr.tName} bildet ${tr.type === "Konjunktion" ? "eine" : "ein"} ${tr.type} zu ${tr.nName} im Geburtsbild (Orbis ${tr.orb.toFixed(1)}°, ${IMPACT_LABEL[tr.impact]}). Was bedeutet diese Phase konkret für die Person, worauf darf sie achten? 4–5 Sätze, Du-Form.`;
  const { text, loading } = useReading(vk, task);
  return (
    <motion.div
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.45}
      onDragEnd={(_, info) => { if (info.offset.x < -90) onNext(); else if (info.offset.x > 90) onPrev(); }}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.32, ease: EASE.smooth }}
      className="absolute inset-0 flex cursor-grab flex-col overflow-y-auto px-7 pb-32 pt-[calc(env(safe-area-inset-top,0px)+4.75rem)] text-left active:cursor-grabbing lg:px-12"
    >
      <span className="pointer-events-none absolute -right-10 top-[14%] font-glyph leading-none opacity-[0.06]" style={{ color: c, fontSize: "min(52vw, 300px)" }}>{tr.tGlyph}</span>
      <div className="relative w-full max-w-[640px]">
        <div className="font-mono text-[11px] tracking-[0.12em]" style={{ color: c }}>TRANSIT · {IMPACT_LABEL[tr.impact].toUpperCase()} · {tr.orb.toFixed(1)}° ORBIS</div>
        <h2 className="mt-4 font-cinzel font-semibold leading-[1.06] text-white" style={{ fontSize: "clamp(30px,8vw,52px)" }}>{tr.title}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-pill border border-line bg-[rgba(255,255,255,0.05)] px-3 py-1 font-body text-[11px] text-txt-2">laufend: {tr.tName}{tr.tRetro ? " ℞" : ""}</span>
          <span className="rounded-pill border border-line bg-[rgba(255,255,255,0.05)] px-3 py-1 font-body text-[11px] text-txt-2">dein {tr.nName}</span>
        </div>
        <div className="mt-7 max-w-[58ch]">
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-mint"><Sparkles className="h-3.5 w-3.5" /> Vela deutet · für dich</div>
          {text ? (
            <p className="font-body text-[16px] leading-relaxed text-txt">{text}</p>
          ) : loading ? (
            <div className="flex items-center gap-2 text-txt-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="font-body text-[13px]">Vela liest den Transit …</span></div>
          ) : (
            <p className="font-body text-[15px] leading-relaxed text-txt-2">{tr.txt}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/** Zeit-Regler (Konzept): Slider −7…+14 Tage — die Planeten wandern sichtbar. */
function TimeScrubber({ value, onChange, date }: { value: number; onChange: (v: number) => void; date: Date }) {
  const label = value === 0 ? "Heute" : date.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="v-eyebrow">Zeit-Regler</span>
        <span className="font-body text-[12.5px] font-medium" style={{ color: value === 0 ? "#F8F7F2" : "#97B5FF" }}>
          {label}
          {value !== 0 && <span className="font-normal text-white/40"> · {value > 0 ? "+" : ""}{value} Tage</span>}
        </span>
      </div>
      <input className="vela-scrub" type="range" min={-7} max={14} step={1} value={value} onChange={(e) => onChange(+e.target.value)} aria-label="Durch die Tage scrubben" />
      <div className="flex justify-between font-body text-[9.5px] uppercase tracking-[1px] text-white/[0.35]"><span>−7</span><span>Heute</span><span>+14</span></div>
    </div>
  );
}

/** Transit-Rad (Konzept): Geburtspunkte innen statisch, die laufenden Planeten
 *  wandern außen — echt gerechnet pro Tag (transitingBodies). */
function TransitWheel({ date, size = 260 }: { date: Date; size?: number }) {
  const bodies = useMemo(() => transitingBodies(date), [date]);
  const c = size / 2;
  const rOut = c - 4;
  const rT = rOut - 18;
  const rN = rOut - 46;
  const pos = (lon: number, r: number) => {
    const a = ((180 - lon) * Math.PI) / 180;
    return { x: c + r * Math.cos(a), y: c - r * Math.sin(a) };
  };
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" aria-label="Transit-Rad">
        <circle cx={c} cy={c} r={rOut} fill="rgba(248,247,242,.015)" stroke="rgba(255,255,255,.13)" strokeWidth="1" />
        <circle cx={c} cy={c} r={rN + 14} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1" />
        {Array.from({ length: 12 }, (_, k) => {
          const p1 = pos(k * 30, rOut);
          const p2 = pos(k * 30, rOut - 6);
          return <line key={k} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,.22)" strokeWidth="1" />;
        })}
        {CHART.map((p) => {
          const q = pos(p.lon, rN);
          return <circle key={p.key} cx={q.x} cy={q.y} r="2.2" fill="rgba(248,247,242,.35)" />;
        })}
      </svg>
      {bodies.map((b) => {
        const q = pos(b.lon, rT);
        return (
          <span
            key={b.key}
            title={`${b.name} · ${signName(b.lon)}${b.retro ? " · rückläufig" : ""}`}
            className="vela-glyph absolute flex items-center justify-center rounded-full text-[11px]"
            style={{ left: q.x - 12, top: q.y - 12, width: 24, height: 24, background: "rgba(120,150,255,.16)", boxShadow: "inset 0 0 0 1px rgba(151,181,255,.6), 0 0 10px rgba(120,150,255,.5)", color: "#EDE6FF", transition: "left .25s ease-out, top .25s ease-out" }}
          >
            {b.glyph}
          </span>
        );
      })}
    </div>
  );
}

/** Full-bleed cinematic transit detail — covers the screen, swipe left/right. */
function TransitFull({ hits }: { hits: TransitHit[] }) {
  const i = useApp((s) => s.fullTransit);
  const setFull = useApp((s) => s.setFullTransit);
  if (i === null || !hits[i]) return null;
  const tr = hits[i];
  const n = hits.length;
  const go = (d: number) => setFull((((i + d) % n) + n) % n);

  return (
    <motion.div key="tfull" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[95] overflow-hidden bg-stage">
      <button onClick={() => setFull(null)} className="absolute right-5 top-[calc(env(safe-area-inset-top,0px)+1.1rem)] z-20 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-[rgba(255,255,255,0.06)] text-txt-2 backdrop-blur active:scale-90">
        <X className="h-5 w-5" />
      </button>

      <AnimatePresence mode="wait">
        <TransitStage key={i} tr={tr} onPrev={() => go(-1)} onNext={() => go(1)} />
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+5.2rem)] z-10 text-center font-body text-[11px] text-txt-3">‹ wische für mehr ›</div>
      <div className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+1.6rem)] z-20 flex items-center justify-center gap-4 px-6">
        <button onClick={() => go(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-[rgba(255,255,255,0.06)] text-txt-2 backdrop-blur active:scale-90">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex max-w-[55vw] flex-wrap justify-center gap-1.5">
          {hits.slice(0, 12).map((_, di) => (
            <button key={di} onClick={() => setFull(di)} className="h-1.5 rounded-full transition-all" style={{ width: di === i ? 22 : 6, background: di === i ? "#7896FF" : "rgba(255,255,255,0.25)" }} />
          ))}
        </div>
        <button onClick={() => go(1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-cta-gradient text-white active:scale-90">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
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
      <PageHead label="Heute am Himmel" title="Transite" sub="Was die aktuellen Planetenstände in deinem Chart auslösen" />

      <div className="mt-1 flex flex-col items-center gap-4">
        <TransitWheel date={date} />
        <div className="w-full max-w-[420px]">
          <TimeScrubber value={offset} onChange={(v) => setOffset(() => v)} date={date} />
        </div>
        <span className="text-center font-body text-[10.5px] uppercase tracking-[1.4px] text-white/[0.35]">Zieh am Regler — die Planeten wandern sichtbar</span>
      </div>

      {strongest ? (
        <>
          {/* Stärkster Einfluss — Hero-Karte nach dem Konzept: getönte
              Hairline in der Ton-Farbe, Eck-Glow, Cinzel-Titel (NICHT der
              fette Sans von vorher), kompakter Body. */}
          {(() => {
            const rgb = IMPACT_COLOR[strongest.impact];
            return (
              <button
                onClick={() => setFull(0)}
                className="relative mt-9 block w-full overflow-hidden rounded-[18px] px-4 pb-[15px] pt-4 text-left"
                style={{ background: "linear-gradient(180deg,#1B1926 0%,#141320 100%)", boxShadow: `inset 0 0 0 1px ${rgb}4d` }}
              >
                <span aria-hidden className="pointer-events-none absolute -right-10 -top-11 h-[170px] w-[170px] rounded-full" style={{ background: `radial-gradient(circle, ${rgb}29, transparent 68%)` }} />
                <span className="relative flex items-center justify-between gap-3">
                  <span className="v-eyebrow" style={{ color: rgb }}>Stärkster Einfluss</span>
                  <span className="v-meta shrink-0" style={{ color: rgb }}>{IMPACT_LABEL[strongest.impact]} · {strongest.orb.toFixed(1)}°</span>
                </span>
                <span className="v-h2 relative mt-3 block text-[17px]">{strongest.title}</span>
                <p className="relative mt-1.5 font-body text-[12.5px] leading-[1.55] text-[rgba(238,245,248,0.66)]">{strongest.txt}</p>
                <span className="relative mt-3 inline-flex items-center gap-1 font-body text-[12px] text-lilac">
                  Ganze Geschichte <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })()}

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
        <SectionHead label="Am Himmel" title="Aktuelle Planetenlage" sub="Größere Bewegungen über allen" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="vela-tile vela-gradient-card flex items-start gap-3.5 p-4">
            <span className="vela-glyph mt-0.5 text-xl text-lilac">{SIGN_GLYPH(sky.moonSign)}</span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-semibold text-txt">Mond in {sky.moonSign}</div>
              <div className="mt-0.5 font-mono text-[10px] text-txt-3">Gefühlslage des Tages</div>
              <p className="mt-1.5 font-body text-xs leading-relaxed text-txt-2">Der Mond läuft heute durch {sky.moonSign} — {SIGNWHAT[SN.indexOf(sky.moonSign)]} So fühlt sich der Tag kollektiv an.</p>
            </div>
          </div>
          <div className="vela-tile vela-gradient-card flex items-start gap-3.5 p-4">
            <span className="vela-glyph mt-0.5 text-xl text-lilac">{SIGN_GLYPH(sky.sunSign)}</span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-semibold text-txt">Sonne in {sky.sunSign}</div>
              <div className="mt-0.5 font-mono text-[10px] text-txt-3">Jahreszeit-Thema</div>
              <p className="mt-1.5 font-body text-xs leading-relaxed text-txt-2">Solange die Sonne durch {sky.sunSign} läuft, ist „{SIGNMEAN[SN.indexOf(sky.sunSign)].split(" · ")[1]}" das Grundthema dieser Wochen.</p>
            </div>
          </div>
          <div className="vela-tile vela-gradient-card flex items-start gap-3.5 p-4 sm:col-span-2">
            <span className="vela-glyph mt-0.5 text-xl text-lilac"><RotateCcw className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-semibold text-txt">
                {sky.retro.length ? `Rückläufig: ${sky.retro.map((r) => r.name).join(", ")}` : "Keine rückläufigen Planeten"}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-txt-3">Phasen zum Innehalten & Überarbeiten</div>
              <p className="mt-1.5 font-body text-xs leading-relaxed text-txt-2">
                {sky.retro.length
                  ? "Diese Themen laufen gerade nach innen — gut zum Überdenken statt Vorpreschen."
                  : "Alle Planeten laufen vorwärts — ein guter Moment für Dinge, die sonst gern verschoben werden: Verträge klären, Gespräche beginnen, Neues starten."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <TransitFull hits={hits} />
    </ScreenShell>
  );
}
