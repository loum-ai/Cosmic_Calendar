import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, X, Sparkles, Loader2 } from "lucide-react";
import { ScreenShell, SectionHead, PageHead } from "@/components/ScreenShell";
import { useReading } from "@/lib/genReadings";
import { useApp } from "@/store/useApp";
import { CHART, HOUSE, signName } from "@/lib/data";
import { computeTransits, skySummary, transitingBodies, SIGN_GLYPH, type TransitHit } from "@/lib/transits";
import { PLANET_PHOTO, PLANET_GLOW } from "@/lib/planetPhotos";
import { EASE } from "@/lib/tokens";

const IMPACT_COLOR: Record<string, string> = { "+": "#20F0D0", "-": "#ff8fb0", "~": "#c9b6ff" };
/** dieselben drei Töne als rgb-Tripel — für Inset-Hairlines und Innen-Glows */
const IMPACT_RGB: Record<string, string> = { "+": "32,240,208", "-": "255,143,176", "~": "201,182,255" };
const IMPACT_LABEL: Record<string, string> = { "+": "fördernd", "-": "fordernd", "~": "gemischt" };

/** EIN Auftrag pro Transit — Detailbühne und Hero-Karte teilen ihn sich, damit
 *  beide dieselbe (server-gecachte) Deutung zeigen statt zweier Varianten. */
function transitReading(tr: TransitHit) {
  return {
    viewKey: `transit:${tr.tKey}_${tr.nKey}_${tr.type}`,
    task: `Deute den aktuellen Transit: Der laufende ${tr.tName} bildet ${tr.type === "Konjunktion" ? "eine" : "ein"} ${tr.type} zu ${tr.nName} im Geburtsbild (Orbis ${tr.orb.toFixed(1)}°, ${IMPACT_LABEL[tr.impact]}). Was bedeutet diese Phase konkret für die Person, worauf darf sie achten? 4–5 Sätze, Du-Form.`,
  };
}

/** loum-Kartenchemie: SOLIDE Ink-Fläche, kein Blur, kein äußerer Schatten.
 *  Tiefe entsteht von INNEN durch einen radialen Glow; die einzige Kante ist
 *  die 1px-Inset-Hairline (shadow-glass / hover:shadow-lift). */
const cardFill = (rgb: string, a = 0.1) =>
  `radial-gradient(122% 96% at 84% -16%, rgba(${rgb},${a}) 0%, transparent 58%), linear-gradient(180deg,#16161F 0%,#12121D 100%)`;
const CARD_FILL = cardFill("120,150,255");

/** Textwand auflösen (Regel 5): der erste Satz wird zur Lede, der Rest fällt in
 *  ruhige Absätze zu je zwei Sätzen. Rein visuell — der Text bleibt unberührt. */
function paragraphs(text: string, group = 2): string[] {
  const t = (text ?? "").trim();
  if (!t) return [];
  const s = (t.match(/[^.!?…]+[.!?…]*/g) ?? [t]).map((x) => x.trim()).filter(Boolean);
  if (s.length <= 1) return [t];
  const out = [s[0]];
  for (let i = 1; i < s.length; i += group) out.push(s.slice(i, i + group).join(" "));
  return out;
}

/** Deutungstext als Lede + ruhige Folgeabsätze. */
function Prose({ text, lede = 17, rest = 15 }: { text: string; lede?: number; rest?: number }) {
  const parts = paragraphs(text);
  return (
    <div className="space-y-3.5">
      {parts.map((p, i) => (
        <p
          key={i}
          className={i === 0 ? "font-body leading-[1.6] text-txt" : "font-body leading-[1.7] text-txt-2"}
          style={{ fontSize: i === 0 ? lede : rest }}
        >
          {p}
        </p>
      ))}
    </div>
  );
}

/** One transit, cinematic & full-bleed; swipe left/right to move between them. */
function TransitStage({ tr, onPrev, onNext }: { tr: TransitHit; onPrev: () => void; onNext: () => void }) {
  const c = IMPACT_COLOR[tr.impact];
  const rgb = IMPACT_RGB[tr.impact];
  const photo = PLANET_PHOTO[tr.tKey];
  const pGlow = PLANET_GLOW[tr.tKey] ?? rgb;
  const { viewKey, task } = transitReading(tr);
  const { text, loading } = useReading(viewKey, task);
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
      {/* laufender Planet als angeschnittenes Foto — der Himmel selbst */}
      <span aria-hidden className="pointer-events-none absolute -right-[16%] top-[4%] aspect-square w-[74vw] max-w-[400px]">
        <span
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, rgba(${pGlow},.24) 0%, rgba(${rgb},.07) 46%, transparent 70%)`, mixBlendMode: "screen" }}
        />
        {photo ? (
          <img
            src={photo}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ mixBlendMode: "screen", opacity: 0.42, transform: "scale(1.08)" }}
          />
        ) : (
          <span className="vela-glyph absolute inset-0 flex items-center justify-center leading-none" style={{ color: c, opacity: 0.07, fontSize: "min(46vw, 260px)" }}>
            {tr.tGlyph}
          </span>
        )}
      </span>
      {/* Scrim — der Text bleibt jederzeit lesbar */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(17,16,25,.18) 0%, rgba(17,16,25,.62) 46%, rgba(17,16,25,.94) 100%)" }}
      />

      <div className="relative w-full max-w-[640px]">
        <div className="font-body text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: c }}>
          Transit · {IMPACT_LABEL[tr.impact]} · {tr.orb.toFixed(1)}° Orbis
        </div>
        <h2 className="mt-4 font-cinzel font-normal uppercase leading-[1.08] tracking-[0.01em] text-txt" style={{ fontSize: "clamp(28px,7.4vw,48px)" }}>{tr.title}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-pill border border-line bg-surface px-3 py-1 font-body text-[11px] text-txt-2">laufend: {tr.tName}{tr.tRetro ? " ℞" : ""}</span>
          <span className="rounded-pill border border-line bg-surface px-3 py-1 font-body text-[11px] text-txt-2">dein {tr.nName}</span>
        </div>
        <div className="mt-7 max-w-[58ch]">
          <div className="mb-3 flex items-center gap-1.5 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-mint"><Sparkles className="h-3.5 w-3.5" /> Vela deutet · für dich</div>
          {text ? (
            <Prose text={text} />
          ) : loading ? (
            <div className="flex items-center gap-2 text-txt-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="font-body text-[13px]">Vela liest den Transit …</span></div>
          ) : (
            <Prose text={tr.txt} lede={16} rest={14.5} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * „Am Himmel" — eine Karte der aktuellen Planetenlage, aber IN DIESEM Chart.
 *
 * Vorher stand hier die Zeichen-Lexikonzeile („Schütze ist freiheitsliebend,
 * optimistisch und sucht den Sinn"), die jeder Mensch mit demselben Datum
 * wortgleich las und die mit seinem Geburtsbild nichts zu tun hatte. Jetzt
 * wird gerechnet, durch WELCHES Haus dieses Charts der laufende Körper gerade
 * zieht — und die Deutung dazu erzeugt. Der Cache-Schlüssel enthält Haus und
 * Zeitraum, damit der Mond täglich und die Sonne monatlich neu gedeutet wird.
 */
function HimmelKarte({
  glyph, titel, eyebrow, fakt, viewKey, task, fill, span,
}: {
  glyph: ReactNode; titel: string; eyebrow: string; fakt: string;
  viewKey: string; task: string; fill: string; span?: boolean;
}) {
  const { text, loading } = useReading(viewKey, task);
  return (
    <div className={`relative flex items-start gap-3.5 overflow-hidden rounded-card p-4 shadow-glass ${span ? "sm:col-span-2" : ""}`} style={{ background: fill }}>
      <span className="vela-glyph mt-0.5 text-xl text-lilac">{glyph}</span>
      <div className="min-w-0 flex-1">
        <div className="font-cinzel text-[15px] font-normal uppercase leading-[1.2] tracking-[0.02em] text-txt">{titel}</div>
        <div className="mt-1 font-body text-[11px] uppercase tracking-[0.18em] text-txt-3">{eyebrow}</div>
        <p className="mt-2 font-body text-[13px] leading-[1.62] text-txt-2">{fakt}</p>
        {text ? (
          <p className="mt-2 font-body text-[13px] leading-[1.62] text-txt">{text}</p>
        ) : loading ? (
          <div className="mt-2.5 space-y-2">
            {[96, 82].map((w, i) => (
              <div key={i} className="h-2.5 animate-pulse rounded-full bg-white/[0.06]" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Zeit-Regler (Konzept): Slider −7…+14 Tage — die Planeten wandern sichtbar. */
function TimeScrubber({ value, onChange, date }: { value: number; onChange: (v: number) => void; date: Date }) {
  const label = value === 0 ? "Heute" : date.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="v-eyebrow">Zeit-Regler</span>
        <span className={`font-body text-[13px] font-medium ${value === 0 ? "text-txt" : "text-lilac"}`}>
          {label}
          {value !== 0 && <span className="font-normal text-txt-3"> · {value > 0 ? "+" : ""}{value} Tage</span>}
        </span>
      </div>
      <input className="vela-scrub" type="range" min={-7} max={14} step={1} value={value} onChange={(e) => onChange(+e.target.value)} aria-label="Durch die Tage scrubben" />
      <div className="flex justify-between font-body text-[9.5px] uppercase tracking-[0.18em] text-txt-3"><span>−7</span><span>Heute</span><span>+14</span></div>
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
        <circle cx={c} cy={c} r={rOut} fill="rgba(248,247,242,.015)" stroke="var(--card-hairline)" strokeWidth="1" />
        <circle cx={c} cy={c} r={rN + 14} fill="none" stroke="var(--hairline-soft)" strokeWidth="1" />
        {Array.from({ length: 12 }, (_, k) => {
          const p1 = pos(k * 30, rOut);
          const p2 = pos(k * 30, rOut - 6);
          return <line key={k} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--fg-faint)" strokeWidth="1" />;
        })}
        {CHART.map((p) => {
          const q = pos(p.lon, rN);
          return <circle key={p.key} cx={q.x} cy={q.y} r="2.2" fill="var(--fg-low)" />;
        })}
      </svg>
      {bodies.map((b) => {
        const q = pos(b.lon, rT);
        return (
          <span
            key={b.key}
            title={`${b.name} · ${signName(b.lon)}${b.retro ? " · rückläufig" : ""}`}
            className="vela-glyph absolute flex items-center justify-center rounded-full text-[11px]"
            style={{ left: q.x - 12, top: q.y - 12, width: 24, height: 24, background: "rgba(120,150,255,.16)", boxShadow: "inset 0 0 0 1px rgba(151,181,255,.6), 0 0 10px rgba(120,150,255,.5)", color: "var(--fg)", transition: "left .25s ease-out, top .25s ease-out" }}
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
      <button onClick={() => setFull(null)} className="absolute right-5 top-[calc(env(safe-area-inset-top,0px)+1.1rem)] z-20 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface-2 text-txt-2 backdrop-blur active:scale-90">
        <X className="h-5 w-5" />
      </button>

      <AnimatePresence mode="wait">
        <TransitStage key={i} tr={tr} onPrev={() => go(-1)} onNext={() => go(1)} />
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+5.2rem)] z-10 text-center font-body text-[11px] uppercase tracking-[0.18em] text-txt-3">‹ wische für mehr ›</div>
      <div className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+1.6rem)] z-20 flex items-center justify-center gap-4 px-6">
        <button onClick={() => go(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface-2 text-txt-2 backdrop-blur active:scale-90">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex max-w-[55vw] flex-wrap justify-center gap-1.5">
          {hits.slice(0, 12).map((_, di) => (
            <button key={di} onClick={() => setFull(di)} className={`h-1.5 rounded-full transition-all ${di === i ? "bg-violet" : "bg-ink/25"}`} style={{ width: di === i ? 22 : 6 }} />
          ))}
        </div>
        <button onClick={() => go(1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-cta-gradient text-white active:scale-90">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}

/** „Stärkster Einfluss" — zeigt die ECHTE Deutung dieses Transits (dieselbe,
 *  die die Detailbühne ausklappt). Die Schablone aus `computeTransits` steht
 *  nur noch da, solange die Deutung lädt oder wenn sie nicht kommt. */
function StrongestCard({ tr, onOpen }: { tr: TransitHit; onOpen: () => void }) {
  const rgb = IMPACT_COLOR[tr.impact];
  const toneRgb = IMPACT_RGB[tr.impact];
  const photo = PLANET_PHOTO[tr.tKey];
  const pGlow = PLANET_GLOW[tr.tKey] ?? toneRgb;
  const { viewKey, task } = transitReading(tr);
  const { text, loading } = useReading(viewKey, task);
  return (
    <button
      onClick={onOpen}
      className="group relative mt-9 block w-full overflow-hidden rounded-[18px] px-4 pb-[15px] pt-4 text-left"
      style={{ background: "linear-gradient(180deg,#201D2C 0%,#1B1926 52%,#17141F 100%)", boxShadow: `inset 0 0 0 1px ${rgb}4d` }}
    >
      {/* laufender Planet als echtes Foto — oben rechts angeschnitten */}
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-14 h-[196px] w-[196px]">
        <span
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, rgba(${pGlow},.28) 0%, rgba(${toneRgb},.10) 46%, transparent 70%)`, mixBlendMode: "screen" }}
        />
        {photo ? (
          <img
            src={photo}
            alt=""
            className="absolute inset-0 h-full w-full scale-[1.02] object-cover transition-transform duration-700 group-hover:scale-[1.08]"
            style={{ mixBlendMode: "screen", opacity: 0.62 }}
          />
        ) : (
          <span className="vela-glyph absolute inset-0 flex items-center justify-center leading-none" style={{ fontSize: 120, color: `rgba(${toneRgb},.16)` }}>
            {tr.tGlyph}
          </span>
        )}
      </span>
      {/* Scrim — Lesbarkeit über dem Foto */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(17,16,25,.30) 0%, rgba(17,16,25,.76) 52%, rgba(17,16,25,.96) 100%)" }}
      />
      <span className="relative flex items-center justify-between gap-3">
        <span className="v-eyebrow" style={{ color: rgb }}>Stärkster Einfluss</span>
        <span className="v-meta shrink-0" style={{ color: rgb }}>{IMPACT_LABEL[tr.impact]} · {tr.orb.toFixed(1)}°</span>
      </span>
      <span className="v-h2 relative mt-3 block text-[17px]">{tr.title}</span>
      {text || !loading ? (
        <p className="relative mt-1.5 line-clamp-4 font-body text-[13px] leading-[1.55] text-[rgba(238,245,248,0.66)]">{text || tr.txt}</p>
      ) : (
        <span className="relative mt-2.5 block space-y-2">
          {[100, 92, 68].map((w, i) => (
            <span key={i} className="block h-2.5 animate-pulse rounded-full bg-white/[0.06]" style={{ width: `${w}%` }} />
          ))}
        </span>
      )}
      <span className="relative mt-3 inline-flex items-center gap-1 font-body text-[13px] text-lilac">
        Ganze Geschichte <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </button>
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
  // Cache-Zeitfenster: der Mond wechselt alle zwei bis drei Tage, die Sonne
  // braucht einen Monat pro Haus — entsprechend wird neu gedeutet.
  const tag = date.toISOString().slice(0, 10);
  const monat = date.toISOString().slice(0, 7);
  const strongest = hits[0];

  return (
    <ScreenShell>
      <PageHead label="Heute am Himmel" title="Transite" sub="Was die aktuellen Planetenstände in deinem Chart auslösen" />

      <div className="mt-1 flex flex-col items-center gap-4">
        <TransitWheel date={date} />
        <div className="w-full max-w-[420px]">
          <TimeScrubber value={offset} onChange={(v) => setOffset(() => v)} date={date} />
        </div>
        <span className="text-center font-body text-[11px] uppercase tracking-[0.18em] text-txt-3">Zieh am Regler — die Planeten wandern sichtbar</span>
      </div>

      {strongest ? (
        <>
          {/* Stärkster Einfluss — Hero-Karte nach dem Konzept: getönte
              Hairline in der Ton-Farbe, Eck-Glow, Cinzel-Titel (NICHT der
              fette Sans von vorher), kompakter Body. */}
          <StrongestCard tr={strongest} onOpen={() => setFull(0)} />

          {/* transit list — solide Kacheln, einzige Kante = Inset-Hairline */}
          <section className="mt-12">
            <SectionHead label="Deine Transite" title="Was dich gerade bewegt" sub={`${hits.length} aktive Verbindungen · tippe für die ganze Geschichte`} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {hits.slice(0, 12).map((tr, i) => (
                <button
                  key={i}
                  onClick={() => setFull(i)}
                  className="relative flex items-center gap-4 overflow-hidden rounded-card p-4 text-left shadow-glass transition-shadow hover:shadow-lift"
                  style={{ background: CARD_FILL }}
                >
                  <span className="vela-glyph text-2xl text-lilac">{tr.tGlyph}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-body text-[15px] font-semibold leading-snug text-txt">{tr.title}</span>
                    <span className="mt-1 block font-body text-[11px] uppercase tracking-[0.16em]" style={{ color: IMPACT_COLOR[tr.impact] }}>
                      {IMPACT_LABEL[tr.impact]} · {tr.orb.toFixed(1)}°{tr.tRetro ? " · rückläufig" : ""}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-txt-3" />
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="mt-9 rounded-card p-5 shadow-glass" style={{ background: CARD_FILL }}>
          <p className="font-body text-[15px] leading-[1.62] text-txt">An diesem Tag bilden die laufenden Planeten keine engen Aspekte zu deinem Geburtsbild.</p>
          <p className="mt-2 font-body text-[13px] leading-[1.65] text-txt-2">Eine ruhige Phase — nichts drängt von außen.</p>
        </div>
      )}

      {/* cosmic weather — real sky summary */}
      <section className="mt-12">
        <SectionHead label="Am Himmel" title="Aktuelle Planetenlage" sub="Größere Bewegungen über allen" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <HimmelKarte
            glyph={SIGN_GLYPH(sky.moonSign)}
            titel={`Mond in ${sky.moonSign}`}
            eyebrow="Gefühlslage des Tages"
            fakt={`Der laufende Mond steht heute in deinem ${sky.moonHouse}. Haus — ${HOUSE[sky.moonHouse - 1]}.`}
            viewKey={`sky:moon:${sky.moonSign}:h${sky.moonHouse}:${tag}`}
            task={`Der laufende Mond steht heute in ${sky.moonSign} und damit im ${sky.moonHouse}. Haus dieses Geburtsbildes (${HOUSE[sky.moonHouse - 1]}).
Sag in 2 kurzen Sätzen, was dieser Tag für DIESEN Menschen gefühlsmäßig bereithält — woran er es merkt, wo seine Aufmerksamkeit heute hinzieht. Der Mond wechselt alle zwei bis drei Tage: also eine Tagesfärbung, kein Lebensthema. Du-Form, konkret, keine Zeichen-Allgemeinplätze.`}
            fill={cardFill(PLANET_GLOW.moon, 0.12)}
          />
          <HimmelKarte
            glyph={SIGN_GLYPH(sky.sunSign)}
            titel={`Sonne in ${sky.sunSign}`}
            eyebrow="Thema dieser Wochen"
            fakt={`Sie zieht gerade durch dein ${sky.sunHouse}. Haus — ${HOUSE[sky.sunHouse - 1]}.`}
            viewKey={`sky:sun:${sky.sunSign}:h${sky.sunHouse}:${monat}`}
            task={`Die laufende Sonne steht in ${sky.sunSign} und damit im ${sky.sunHouse}. Haus dieses Geburtsbildes (${HOUSE[sky.sunHouse - 1]}).
Sag in 2 kurzen Sätzen, welcher Lebensbereich bei DIESEM Menschen in diesen vier Wochen im Licht steht und was das praktisch heißt. Die Sonne braucht rund einen Monat pro Haus — also ein Kapitel, kein Tag. Du-Form, konkret.`}
            fill={cardFill(PLANET_GLOW.sun, 0.12)}
          />
          {sky.retro.length ? (
            <HimmelKarte
              span
              glyph={<RotateCcw className="h-4 w-4" />}
              titel={`Rückläufig: ${sky.retro.map((r) => r.name).join(", ")}`}
              eyebrow="Phasen zum Innehalten & Überarbeiten"
              fakt={sky.retro.map((r) => `${r.name} im ${r.house}. Haus (${HOUSE[r.house - 1]})`).join(" · ") + "."}
              viewKey={`sky:retro:${sky.retro.map((r) => `${r.name}${r.house}`).join("-")}:${monat}`}
              task={`Rückläufig sind gerade: ${sky.retro.map((r) => `${r.name} im ${r.house}. Haus dieses Geburtsbildes (${HOUSE[r.house - 1]})`).join("; ")}.
Sag in 2–3 kurzen Sätzen, was das für DIESEN Menschen bedeutet: in welchem Lebensbereich gerade etwas nach innen geht, was sich dort lohnt zu überdenken statt neu anzufangen. Erkläre rückläufig in einem Halbsatz (scheinbare Rückwärtsbewegung von der Erde aus). Du-Form, nüchtern — keine Warnungen, keine Dramatik.`}
              fill={CARD_FILL}
            />
          ) : (
            <div className="relative flex items-start gap-3.5 overflow-hidden rounded-card p-4 shadow-glass sm:col-span-2" style={{ background: CARD_FILL }}>
              <span className="vela-glyph mt-0.5 text-xl text-lilac"><RotateCcw className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="font-cinzel text-[15px] font-normal uppercase leading-[1.2] tracking-[0.02em] text-txt">Keine rückläufigen Planeten</div>
                <div className="mt-1 font-body text-[11px] uppercase tracking-[0.18em] text-txt-3">Alles läuft vorwärts</div>
                <p className="mt-2 font-body text-[13px] leading-[1.62] text-txt-2">Ein guter Moment für Dinge, die sonst gern verschoben werden: Verträge klären, Gespräche beginnen, Neues starten.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <TransitFull hits={hits} />
    </ScreenShell>
  );
}
