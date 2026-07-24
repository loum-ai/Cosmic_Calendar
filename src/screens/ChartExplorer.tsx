import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Sparkles, Loader2, ChevronDown, ArrowLeft } from "lucide-react";
import { subjectTask, useReading, useReadings, storedReading } from "@/lib/genReadings";
import { chartContext } from "@/lib/factsContext";
import { ChartWheel } from "@/components/ChartWheel";
import { Reveal } from "@/components/Reveal";
import { resolveSheet, type SheetDescriptor } from "@/lib/sheets";
import { CHART, ASC, PROFILE, SN, THEME, signName, computeAspects, IS_DEMO } from "@/lib/data";
import { ASPECT_TEXT } from "@/lib/readings";
import { aiSummary, aiAspect, aiSign } from "@/lib/interpret";
import { chartPatterns, type Pattern } from "@/lib/patterns";
import { PLANET_PHOTO, PLANET_GLOW, PLANET_SCALE } from "@/lib/planetPhotos";
import { useApp } from "@/store/useApp";

const KIND_LABEL: Record<string, string> = { muster: "Aspektmuster", fokus: "Fokus", balance: "Balance", rhythmus: "Rhythmus" };
const KIND_COL: Record<string, string> = { muster: "#c9bcff", fokus: "#ffce6e", balance: "#46e8c4", rhythmus: "#9db6ff" };

/** Bricht einen Fließtext in ruhige Absätze: erster Satz als Lede, Rest in
 *  2–3-Satz-Blöcken. Rein darstellend — der Text selbst bleibt unangetastet. */
function paragraphs(t: string): string[] {
  const lines = t.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  const src = lines[0] ?? "";
  const sentences = src.match(/[^.!?…]+[.!?…]+["»“)]?\s*/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
  if (sentences.length < 3) return src ? [src] : [];
  const step = sentences.length > 6 ? 3 : 2;
  const out = [sentences[0]];
  for (let i = 1; i < sentences.length; i += step) out.push(sentences.slice(i, i + step).join(" "));
  return out;
}

/** Editorial-Absatz: Lede vorn (heller, größer), der Rest ruhiger. */
function Prose({ text, className = "", lede = "text-[17px]", rest = "text-[15.5px]" }: { text: string; className?: string; lede?: string; rest?: string }) {
  const parts = useMemo(() => paragraphs(text), [text]);
  if (!parts.length) return null;
  return (
    <div className={className}>
      {parts.map((para, i) => (
        <p
          key={i}
          className={i === 0 ? `font-body ${lede} leading-[1.6] text-txt` : `mt-3.5 font-body ${rest} leading-[1.7] text-txt-2`}
        >
          {para}
        </p>
      ))}
    </div>
  );
}

/** A "Besondere Muster" card — tap to expand the deeper, chart-specific reading.
 *  „Für dich konkret" ist eine erzeugte Deutung zu genau dieser Konfiguration;
 *  p.detail (die alte Schablone) steht nur noch, solange sie lädt. */
function PatternCard({ p }: { p: Pattern }) {
  const [open, setOpen] = useState(false);
  // erst beim Aufklappen erzeugen — sonst feuert eine Chart-Seite bis zu neun
  // Anfragen auf einmal
  const { text: gen, loading: genLoading } = useReading(p.viewKey, p.task, !IS_DEMO && open);
  const konkret = gen || (genLoading ? "" : p.detail);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
      className={`relative w-full overflow-hidden rounded-[18px] p-6 text-left transition duration-300 ${
        open
          ? "shadow-[inset_0_0_0_1px_rgba(120,150,255,0.34)]"
          : "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] hover:shadow-[inset_0_0_0_1px_rgba(120,150,255,0.34)]"
      }`}
      style={{ background: "linear-gradient(180deg,#16161F 0%,#12121D 100%)" }}
    >
      {/* Tiefe kommt von INNEN: radialer Glow in der Musterfarbe, kein Drop-Shadow */}
      <span aria-hidden className="pointer-events-none absolute -right-14 -top-20 h-64 w-64 rounded-full" style={{ background: `radial-gradient(circle, ${KIND_COL[p.kind]}22 0%, ${KIND_COL[p.kind]}09 42%, transparent 70%)` }} />
      <span aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(120,150,255,0.09)_0%,transparent_68%)]" />
      <span className="pointer-events-none absolute -right-2 -top-4 font-glyph text-[68px] leading-none opacity-[0.07]" style={{ color: KIND_COL[p.kind] }}>{p.glyphs[0] ?? "✦"}</span>
      <div className="relative">
        <div className="mb-3 flex items-center gap-2.5">
          {p.glyphs.length > 0 && <span className="font-glyph text-[18px]" style={{ color: KIND_COL[p.kind] }}>{p.glyphs.join(" ")}</span>}
          {/* meaning-first (canonical): jargon lives up here in the eyebrow … */}
          <span className="font-body text-[10.5px] font-medium uppercase tracking-[0.18em]" style={{ color: KIND_COL[p.kind] }}>{KIND_LABEL[p.kind]} · {p.title}</span>
        </div>
        <div className="flex items-start justify-between gap-3">
          {/* … and the headline says what it MEANS */}
          <h3 className="font-cinzel text-[20px] font-normal uppercase leading-[1.28] tracking-[0.02em] text-txt lg:text-[21px]">{p.human}</h3>
          <ChevronDown className={`mt-1.5 h-5 w-5 shrink-0 text-txt-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </div>
        {/* collapsed: a single calm teaser line — no wall of text */}
        {!open && <p className="mt-3 line-clamp-1 font-body text-[15px] leading-relaxed text-txt-3">{p.text}</p>}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              {/* Lede + ruhige Folgeabsätze statt einer Textwand */}
              <Prose text={p.text} className="mt-3.5" lede="text-[16.5px]" />
              <div className="mt-5 border-t border-line-soft pt-4">
                <div className="mb-2 flex items-center gap-1.5 font-body text-[10.5px] font-medium uppercase tracking-[0.18em]" style={{ color: KIND_COL[p.kind] }}>
                  <Sparkles className="h-3.5 w-3.5" /> Für dich konkret
                </div>
                {konkret ? (
                  <Prose text={konkret} lede="text-[16px] text-txt" rest="text-[15px]" />
                ) : (
                  <div className="space-y-2.5 py-1">
                    {[100, 92, 76].map((w, i) => (
                      <div key={i} className="h-3 animate-pulse rounded-full bg-white/[0.06]" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}

const COL: Record<string, string> = {
  sun: "#ffce6e", moon: "#d7e3ff", mercury: "#8fd0e6", venus: "#46e8c4", mars: "#ff6a52",
  jupiter: "#ffce5e", saturn: "#cda6ff", uranus: "#79e6d6", neptune: "#9db6ff", pluto: "#d39aea",
  chiron: "#8fd0ff", lilith: "#e3a8d6", asc: "#c9b6ff",
};
const col = (k: string) => COL[k] ?? "#cbb9ff";

// meaning verbs for the signature headline — what the connection DOES
const SIG_VERB: Record<string, string> = {
  Konjunktion: "wirken als eine Kraft",
  Sextil: "beflügeln einander",
  Quadrat: "fordern einander heraus",
  Trigon: "fließen zusammen",
  Opposition: "suchen Balance",
};
const FLOW = ["Trigon", "Sextil", "Konjunktion"];
const PLANET_GROUPS: { label: string; keys: string[] }[] = [
  { label: "Persönlich", keys: ["sun", "moon", "mercury", "venus", "mars"] },
  { label: "Sozial", keys: ["jupiter", "saturn"] },
  { label: "Transpersonal", keys: ["uranus", "neptune", "pluto"] },
  { label: "Weitere Punkte", keys: ["chiron", "lilith"] },
];
const ELEM = ["Feuer", "Erde", "Luft", "Wasser"];
const ELEM_COL = ["#ff6a52", "#46e8c4", "#8fd0e6", "#9db6ff"];
const MODE = ["kardinal", "fix", "veränderlich"];
const MODE_COL = ["#cda6ff", "#ffce6e", "#79e6d6"];

function balance() {
  const e = [0, 0, 0, 0];
  const m = [0, 0, 0];
  for (const p of CHART) {
    const si = SN.indexOf(signName(p.lon));
    if (si < 0) continue;
    e[si % 4]++;
    m[si % 3]++;
  }
  return { e, m, total: CHART.length };
}
const selKey = (d: SheetDescriptor | null) => (d ? `${d.kind}:${d.key}` : "overview");
const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width:1024px)").matches;

/** Chart explorer — the natal chart as a browsable, scrolling page. */
export function ChartExplorer() {
  useApp((s) => s.aiVersion); // re-render when a reading lands
  const openInfo = useApp((s) => s.openInfo);
  const setPrintOpen = useApp((s) => s.setPrintOpen);
  const viewer = useApp((s) => s.viewerMode);
  const setHomeView = useApp((s) => s.setHomeView);
  const [sel, setSel] = useState<SheetDescriptor | null>(null);
  const [morePat, setMorePat] = useState(false);
  // land at the top (the chart wheel) when entering the full-chart view
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  // selecting drives the desktop side-panel; on mobile it opens the native sheet
  const select = (d: SheetDescriptor) => {
    setSel(d);
    if (!isDesktop()) openInfo(d);
  };

  const aspects = useMemo(() => [...computeAspects()].sort((a, b) => b.def.w - a.def.w || a.orb - b.orb), []);
  const highlight = sel && (sel.kind === "aspect" || sel.kind === "planet" || sel.kind === "node") ? String(sel.key) : null;
  const content = sel ? resolveSheet(sel) : null;
  const planets = CHART;

  const sun = CHART.find((p) => p.key === "sun");
  const moon = CHART.find((p) => p.key === "moon");
  const big3 = [
    { key: "sun", glyph: "☉", role: "Sonne · Wesenskern", sign: signName(sun?.lon ?? 0), sub: `${sun?.house ?? "?"}. Haus`, color: col("sun") },
    { key: "moon", glyph: "☽", role: "Mond · Gefühl", sign: signName(moon?.lon ?? 0), sub: `${moon?.house ?? "?"}. Haus`, color: col("moon") },
    { key: "asc", glyph: "AC", role: "Aszendent · Auftreten", sign: signName(ASC), sub: "Wie du wirkst", color: col("asc") },
  ];
  const flow = aspects.filter((a) => FLOW.includes(a.def.type));
  const tension = aspects.filter((a) => !FLOW.includes(a.def.type));
  const bal = balance();

  // canonical hero: the chart's most defining note, derived (not hardcoded) —
  // the most exact major aspect + the dominant element.
  const tightest = [...aspects].sort((a, b) => a.orb - b.orb)[0];
  const domIdx = bal.e.indexOf(Math.max(...bal.e));
  const domElem = ELEM[domIdx];
  // Die Signatur-Karte trug bisher als Rückfall `def.plain` — die Lexikon-Zeile
  // des Aspekt-Typs, identisch für jeden Menschen mit diesem Winkel. Jetzt:
  // gespeicherte Deutung, sonst live generiert (gleicher Cache wie das Sheet).
  const heroTask = tightest ? subjectTask({ kind: "aspect", key: tightest.key }) : null;
  const heroGen = useReading(heroTask?.viewKey ?? "", heroTask?.task ?? "", !!heroTask && !IS_DEMO);
  const heroTxt = tightest
    ? aiAspect(tightest.A.key, tightest.B.key) || (IS_DEMO && ASPECT_TEXT[tightest.key]) || heroGen.text || (heroGen.loading ? "" : tightest.def.plain)
    : "";
  const patterns = chartPatterns();
  // hybrid "core": generate a holistic overview — only when we don't already
  // have a stored summary (client) and not on the bespoke demo, to spare quota.
  const overview = useReading(
    "natal:overview",
    "Schreibe ein einfühlsames, konkretes Gesamtbild dieser Person aus ihrem Geburtsbild — Kernpersönlichkeit, größte Stärken, zentrale Herausforderung und der rote Faden ihrer Entwicklung. 5–7 Sätze, Du-Form, Klartext, ohne Aufzählung.",
    !IS_DEMO && !aiSummary(),
  );

  // pre-warm Sonne/Mond/Aszendent only when needed (not demo, not already stored)
  useEffect(() => {
    if (IS_DEMO) return;
    const req = useReadings.getState().request;
    const ctx = chartContext();
    for (const k of ["sun", "moon", "asc"]) {
      if (storedReading({ kind: "planet", key: k })) continue;
      const st = subjectTask({ kind: "planet", key: k });
      if (st) req(st.viewKey, ctx, st.task);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="animate-slideUp px-6 pb-28 pt-[calc(env(safe-area-inset-top,0px)+2.5rem)] lg:px-10 lg:pt-10">
      <div className="mx-auto w-full max-w-[1180px]">
        <button onClick={() => setHomeView("hub")} className="mb-7 flex items-center gap-2 font-body text-[14px] text-txt-2 transition hover:text-txt">
          <ArrowLeft className="h-4 w-4" /> Themen
        </button>
        {/* compact header — the chart itself is the hero, right at the top */}
        <header className="mb-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="vela-label flex items-center gap-2">
              {viewer ? "Dein Geburtsbild" : "Geburtsbild"}
              {!viewer && IS_DEMO && <span className="rounded-pill border border-line px-2 py-0.5 font-body text-[9px] tracking-[0.12em] text-txt-3">BEISPIEL</span>}
            </div>
            <h1 className="mt-1.5 truncate font-cinzel text-[25px] font-normal uppercase leading-tight tracking-[0.02em] text-txt lg:text-[31px]">
              {viewer ? `Willkommen, ${String(PROFILE.name).split(" ")[0]}` : PROFILE.name}
            </h1>
          </div>
          <button
            onClick={() => setPrintOpen(true)}
            title={viewer ? "Mein Horoskop als PDF" : "Horoskop als PDF"}
            className="flex shrink-0 items-center gap-2 rounded-pill border border-line-accent bg-surface px-4 py-2.5 font-display text-[13px] font-semibold text-txt transition hover:bg-surface-2"
          >
            <Download className="h-4 w-4 text-lilac" /> <span className="hidden sm:inline">PDF</span>
          </button>
        </header>

        {/* chart stage + live reading (desktop) — the tappable chart, up top */}
        <Reveal>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(330px,380px)] lg:gap-8">
          {/* solide Ink-Fläche, einzige Kante = Inset-Hairline; Tiefe von innen */}
          <section className="relative overflow-hidden rounded-[30px] bg-stage p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09)] lg:p-10">
            {/* glowing aura behind the wheel — the glass centrepiece breathes */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(120,150,255,0.28),rgba(120,150,255,0.06)_45%,transparent_66%)] blur-2xl animate-breath" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[rgba(120,150,255,0.12)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[rgba(32,240,208,0.10)] blur-3xl" />
            <div className="relative mx-auto w-full max-w-[480px] drop-shadow-[0_0_40px_rgba(120,150,255,0.22)]">
              <ChartWheel onPick={select} highlight={highlight} />
            </div>
            <p className="relative mt-6 text-center font-body text-[14px] leading-relaxed text-txt-3">
              Tippe einen Planeten oder eine Aspektlinie — oder nutze die Listen unten.
            </p>
          </section>

          {/* desktop reading panel */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-card bg-glasswash p-6 shadow-[inset_0_0_0_1px_rgba(120,150,255,0.18)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selKey(sel)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  {content && sel ? <DetailView content={content} sel={sel} onPick={select} /> : <Overview onPick={select} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </aside>
        </div>
        </Reveal>

        {/* ── HERO: the chart's single most defining note (computed) ── */}
        {tightest && (
          <Reveal className="mt-16">
          <section>
            <button
              onClick={() => select({ kind: "aspect", key: tightest.key })}
              className="relative w-full overflow-hidden rounded-[26px] bg-stage p-7 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09)] transition duration-300 hover:shadow-[inset_0_0_0_1px_rgba(151,181,255,0.45)] lg:p-10"
            >
              {/* innerer Glow im Aspektton — Tiefe ohne Drop-Shadow */}
              <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full" style={{ background: `radial-gradient(circle, ${tightest.def.c}26 0%, ${tightest.def.c}0a 44%, transparent 70%)` }} />
              <span className="pointer-events-none absolute -right-6 -top-10 font-glyph text-[150px] leading-none opacity-[0.07]" style={{ color: tightest.def.c }}>{tightest.def.g}</span>
              <div className="relative">
                {/* meaning-first (canonical): the aspect jargon is the eyebrow … */}
                <div className="vela-label">Deine Signatur · {domElem}-betont · {tightest.A.name} {tightest.def.type} {tightest.B.name} · {tightest.orb.toFixed(1)}°</div>
                {/* … and the headline says what it MEANS for this person */}
                <h2 className="mt-4 font-cinzel text-[27px] font-normal uppercase leading-[1.22] tracking-[0.01em] text-txt lg:text-[37px]">
                  <span style={{ color: col(tightest.A.key) }}>{THEME[tightest.A.key] ?? tightest.A.name}</span>
                  <span className="text-txt-2"> und </span>
                  <span style={{ color: col(tightest.B.key) }}>{(THEME[tightest.B.key] ?? tightest.B.name).charAt(0).toLowerCase() + (THEME[tightest.B.key] ?? tightest.B.name).slice(1)}</span>
                  <span className="text-txt-2"> {SIG_VERB[tightest.def.type] ?? "wirken zusammen"}</span>
                </h2>
                {heroTxt && <Prose text={heroTxt} className="mt-5 max-w-[60ch]" lede="text-[17px]" rest="text-[15.5px]" />}
              </div>
            </button>
          </section>
          </Reveal>
        )}

        {/* ── BESONDERE MUSTER (whole-chart synthesis) ── */}
        {patterns.length > 0 && (
          <Section title="Besondere Muster" hint={`${patterns.length}`} sub="Was dein Bild als Ganzes auszeichnet — über die einzelnen Stellungen hinaus.">
            <div className="grid items-start gap-4 sm:grid-cols-2">
              {(morePat ? patterns : patterns.slice(0, 4)).map((p) => (
                <PatternCard key={p.id} p={p} />
              ))}
            </div>
            {patterns.length > 4 && (
              <button
                onClick={() => setMorePat((v) => !v)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-pill border border-line px-4 py-2 font-body text-[13px] text-txt-2 transition hover:text-txt"
              >
                {morePat ? "Weniger anzeigen" : `${patterns.length - 4} weitere Muster`}
                <ChevronDown className={`h-4 w-4 transition-transform ${morePat ? "rotate-180" : ""}`} />
              </button>
            )}
          </Section>
        )}

        {/* ── DIE GROSSEN DREI ── */}
        <Section title="Die großen Drei" sub="Kern, Gefühl, Auftreten — deine Identitäts-Achse.">
          <div className="grid gap-4 sm:grid-cols-3">
            {big3.map((b) => (
              <button
                key={b.key}
                onClick={() => select({ kind: "planet", key: b.key })}
                className="group relative overflow-hidden rounded-[18px] p-5 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition duration-300 hover:shadow-[inset_0_0_0_1px_rgba(120,150,255,0.38)]"
                style={{ background: "linear-gradient(180deg,#16161F 0%,#12121D 100%)" }}
              >
                {/* Tiefe von innen: tonaler Glow in der Planetenfarbe */}
                <span aria-hidden className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full" style={{ background: `radial-gradient(circle, ${b.color}24 0%, ${b.color}0a 44%, transparent 70%)` }} />
                <span className="pointer-events-none absolute -right-5 -top-9 font-glyph text-[110px] leading-none opacity-[0.08]" style={{ color: b.color }}>{b.glyph}</span>
                {/* top row: label + glowing glyph chip (byheart stat-card language) */}
                <div className="relative flex items-start justify-between gap-2">
                  <div className="vela-label pt-1">{b.role}</div>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-glyph text-[19px]" style={{ color: b.color, background: `radial-gradient(circle, ${b.color}2b, transparent 72%)`, boxShadow: `0 0 20px -6px ${b.color}66`, border: `1px solid ${b.color}33` }}>{b.glyph}</span>
                </div>
                {/* big value = the sign */}
                <div className="relative mt-3.5 font-cinzel text-[29px] font-normal uppercase leading-[1.04] tracking-[0.02em] text-txt">{b.sign}</div>
                {/* decorative sparkline in the card's accent */}
                <svg className="relative mt-3 h-7 w-full" viewBox="0 0 120 28" preserveAspectRatio="none" fill="none" aria-hidden>
                  <path d="M1 22 C 18 22, 24 11, 40 13 S 70 21, 90 10 S 110 5, 118 4" stroke={b.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
                  <circle cx="118" cy="4" r="2.6" fill={b.color} />
                  <circle cx="118" cy="4" r="5.5" fill={b.color} opacity="0.22" />
                </svg>
                <div className="relative mt-1.5 font-body text-[13px] leading-relaxed text-txt-3">{b.sub}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* ── ASPEKTE (grouped) ── */}
        <Section title="Aspekte" hint={`${aspects.length}`} sub="Wie deine Kräfte zusammenspielen.">
          <div className="grid gap-4 lg:grid-cols-2">
            <AspectGroup title="Im Fluss" tone="leicht & unterstützend" accent="#20F0D0" items={flow} sel={highlight} onPick={select} />
            <AspectGroup title="Unter Spannung" tone="Reibung & Antrieb" accent="#aa5cff" items={tension} sel={highlight} onPick={select} />
          </div>
        </Section>

        {/* ── PLANETEN (banded by reach) ── */}
        <Section title="Planeten" sub="Von persönlich nah bis transpersonal weit.">
          <div className="space-y-6">
            {PLANET_GROUPS.map((g) => {
              const items = g.keys.map((k) => CHART.find((p) => p.key === k)).filter(Boolean) as typeof CHART;
              if (!items.length) return null;
              return (
                <div key={g.label}>
                  <div className="mb-2.5 flex items-center gap-3">
                    <span className="vela-label">{g.label}</span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                    {items.map((p) => <PlanetCard key={p.key} p={p} on={highlight === p.key} onPick={select} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── VERTEILUNG ── */}
        <Section title="Verteilung" sub="Die Mischung aus Elementen und Modi in deinem Bild.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Bars title="Elemente" labels={ELEM} values={bal.e} total={bal.total} colors={ELEM_COL} />
            <Bars title="Modi" labels={MODE} values={bal.m} total={bal.total} colors={MODE_COL} />
          </div>
        </Section>

        {/* ── DEUTUNG (editorial) ── */}
        <Section title="Deine Deutung" sub="Dein Bild in Worten.">
          <div className="relative overflow-hidden rounded-card bg-glasswash p-5 shadow-[inset_0_0_0_1px_rgba(120,150,255,0.16)] lg:p-8">
            <span aria-hidden className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(120,150,255,0.13)_0%,transparent_68%)]" />
            <span aria-hidden className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(32,240,208,0.07)_0%,transparent_68%)]" />
            <div className="relative">
              {/* Regel 5: das Gesamtbild als Lede + ruhige Absätze, nie als Textwand */}
              {aiSummary() ? (
                <Prose text={aiSummary() as string} className="max-w-[64ch]" lede="text-[17.5px]" rest="text-[15.5px]" />
              ) : overview.text ? (
                <Prose text={overview.text} className="max-w-[64ch]" lede="text-[17.5px]" rest="text-[15.5px]" />
              ) : overview.loading ? (
                <div className="flex items-center gap-2 text-txt-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="font-body text-[13.5px]">Vela schreibt dein Gesamtbild …</span></div>
              ) : null}
              <div className={`${aiSummary() || overview.text ? "mt-8 border-t border-line pt-7" : ""} grid gap-x-8 gap-y-6 sm:grid-cols-2`}>
                {planets.map((p) => {
                  const t = aiSign(p.key) || p.txt;
                  if (!t) return null;
                  return (
                    <button key={p.key} onClick={() => select({ kind: "planet", key: p.key })} className="group flex gap-3.5 text-left">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-glyph text-[17px]" style={{ color: col(p.key), boxShadow: `inset 0 0 0 1px ${col(p.key)}44`, background: `radial-gradient(circle, ${col(p.key)}1f, transparent 74%)` }}>{p.glyph}</span>
                      <span className="min-w-0">
                        <span className="block font-cinzel text-[13px] font-normal uppercase tracking-[0.06em] text-txt transition group-hover:text-lilac">{p.name} · {signName(p.lon)}</span>
                        <span className="mt-1.5 block font-body text-[13.5px] leading-[1.65] text-txt-2">{t}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function GeneratedReading({ sel, fallback, folded }: { sel: SheetDescriptor; fallback?: string; folded?: { label: string; body: string }[] }) {
  const st = subjectTask(sel);
  const stored = storedReading(sel);
  const { text, loading } = useReading(st?.viewKey ?? "", st?.task ?? "", !!st && !IS_DEMO);
  const shown = text || stored;
  if (!st) {
    return fallback ? (
      <div className="rounded-2xl border border-mint/25 bg-mint/[0.06] p-3.5">
        <div className="mb-1.5 flex items-center gap-1.5 font-body text-[9.5px] font-medium uppercase tracking-[0.18em] text-mint"><span className="inline-block h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_6px_#20F0D0]" /> Bei dir</div>
        <p className="font-body text-[15px] font-medium leading-[1.55] text-white">{fallback}</p>
      </div>
    ) : null;
  }
  return (
    <div className="rounded-2xl border border-mint/30 bg-mint/[0.07] p-3.5">
      <div className="mb-1.5 flex items-center gap-1.5 font-body text-[9.5px] font-medium uppercase tracking-[0.18em] text-mint"><Sparkles className="h-3.5 w-3.5" /> Vela deutet · für dich</div>
      {folded && folded.length > 0 ? (
        <div className="space-y-3">
          {folded.map((sec) => (
            <div key={sec.label}>
              <div className="mb-1 font-display text-[11.5px] font-bold tracking-tight text-mint/90">{sec.label}</div>
              <p className="font-body text-[15px] font-medium leading-[1.55] text-white">{sec.body}</p>
            </div>
          ))}
        </div>
      ) : shown ? (
        <Prose text={shown} lede="text-[15.5px]" rest="text-[14.5px]" />
      ) : loading ? (
        <div className="flex items-center gap-2 text-txt-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="font-body text-[13px]">Vela liest dein Bild …</span></div>
      ) : (
        <p className="font-body text-[14px] leading-[1.55] text-white">{fallback ?? "—"}</p>
      )}
    </div>
  );
}

function AspectGroup({ title, tone, accent, items, sel, onPick }: { title: string; tone: string; accent: string; items: ReturnType<typeof computeAspects>; sel: string | null; onPick: (d: SheetDescriptor) => void }) {
  const [more, setMore] = useState(false);
  const list = more ? items : items.slice(0, 5);
  return (
    <div className="relative overflow-hidden rounded-card p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" style={{ background: "linear-gradient(180deg,#16161F 0%,#12121D 100%)" }}>
      {/* innerer Ton der Gruppe (Fluss = mystic, Spannung = violett) */}
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full" style={{ background: `radial-gradient(circle, ${accent}1c 0%, ${accent}08 44%, transparent 70%)` }} />
      <div className="relative mb-4 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <span className="font-cinzel text-[16px] font-normal uppercase leading-tight tracking-[0.02em] text-txt sm:text-[17px]">{title}</span>
        <span className="font-body text-[12px] text-txt-3">{tone}</span>
      </div>
      <div className="relative space-y-1">
        {items.length ? (
          list.map((a) => {
            const on = sel === a.key;
            const strength = Math.max(0.14, 1 - a.orb / 8);
            return (
              <button key={a.key} onClick={() => onPick({ kind: "aspect", key: a.key })} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${on ? "bg-surface-2" : "hover:bg-surface-2"}`}>
                <span className="shrink-0 font-glyph text-[16px]">
                  <span style={{ color: col(a.A.key) }}>{a.A.glyph}</span>
                  <span className="mx-0.5" style={{ color: accent }}>{a.def.g}</span>
                  <span style={{ color: col(a.B.key) }}>{a.B.glyph}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-body text-[14px] text-txt-2">{a.A.name} {a.def.type} {a.B.name}</span>
                  <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full" style={{ width: `${strength * 100}%`, background: accent }} />
                  </span>
                </span>
                <span className="shrink-0 font-body text-[10.5px] tracking-[0.04em] text-txt-3">{a.orb.toFixed(1)}°</span>
              </button>
            );
          })
        ) : (
          <p className="py-1 font-body text-[13px] text-txt-3">Keine in dieser Gruppe.</p>
        )}
      </div>
      {items.length > 5 && (
        <button onClick={() => setMore((v) => !v)} className="mt-3 inline-flex items-center gap-1.5 font-body text-[13px] text-txt-2 transition hover:text-txt">
          {more ? "Weniger" : `${items.length - 5} weitere`}
          <ChevronDown className={`h-4 w-4 transition-transform ${more ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}

function PlanetCard({ p, on, onPick }: { p: (typeof CHART)[number]; on: boolean; onPick: (d: SheetDescriptor) => void }) {
  const h = p.house ?? 1;
  const deg = Math.floor((((p.lon % 30) + 30) % 30));
  const photo = PLANET_PHOTO[p.key];
  const glow = PLANET_GLOW[p.key] ?? "120,150,255";
  // Foto-Kachel: Planet full-bleed (angeschnitten), Glyph oben, Name/Zeichen/
  // Grad/Haus unten über einem Scrim — App-Konzept PlanetPhotoCard.
  // Die KACHEL bleibt für alle gleich groß (sauberes Grid) — die gefühlte
  // Planetengröße entsteht allein über den Bild-Zoom: PLANET_SCALE (0.36 Pluto
  // … 1.10 Saturn) wird auf 0..1 normalisiert und auf Zoom, Halo und Glyph
  // gelegt. So wirken Jupiter/Saturn wuchtig, Merkur/Pluto klein.
  const scale = PLANET_SCALE[p.key] ?? 0.6;
  const size = Math.min(1, Math.max(0, (scale - 0.36) / 0.74));
  const zoom = 1.06 + size * 0.62;
  const halo = Math.round(126 + size * 128);
  return (
    <button
      onClick={() => onPick({ kind: "planet", key: p.key })}
      className="group relative aspect-[4/5] overflow-hidden rounded-[18px] text-left transition"
      style={{
        background: "linear-gradient(180deg,#191728 0%,#141221 58%,#100E1A 100%)",
        boxShadow: `inset 0 0 0 1px rgba(${glow},${on ? 0.42 : 0.16})${on ? `, 0 0 26px -8px rgba(${glow},.55)` : ""}`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
        style={{ width: halo, height: halo, borderRadius: "50%", background: `radial-gradient(circle, rgba(${glow},.36) 0%, rgba(${glow},.09) 46%, transparent 68%)`, mixBlendMode: "screen" }}
      />
      {photo ? (
        // Wrapper trägt den Hover-Lift, das Bild den größenabhängigen Zoom
        <span aria-hidden className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.05]">
          <img
            src={photo}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            style={{ mixBlendMode: "screen", transform: `scale(${zoom.toFixed(3)})`, transformOrigin: "50% 38%" }}
          />
        </span>
      ) : (
        <span
          aria-hidden
          className="vela-glyph absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2"
          style={{ fontSize: Math.round(34 + size * 20), color: `rgba(${glow},.85)`, filter: `drop-shadow(0 0 16px rgba(${glow},.6))` }}
        >
          {p.glyph}
        </span>
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%]"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(11,9,16,.55) 50%, rgba(11,9,16,.95) 100%)" }}
      />
      <span
        aria-hidden
        className="vela-glyph absolute left-3 top-2.5 text-[15px]"
        style={{ color: `rgba(${glow},.95)`, filter: "drop-shadow(0 1px 5px rgba(0,0,0,.7))" }}
      >
        {p.glyph}
      </span>
      <span className="absolute inset-x-3 bottom-2.5">
        <span className="block font-cinzel text-[14px] font-normal uppercase leading-tight tracking-[0.05em] text-txt">{p.name}</span>
        <span className="mt-1 block font-body text-[11.5px] text-txt-2">
          {signName(p.lon)} <span className="font-body text-[10.5px] text-txt-3">{deg}°</span>
        </span>
        <span className="mt-px block font-body text-[10.5px] text-txt-3">{h}. Haus</span>
      </span>
    </button>
  );
}

function Bars({ title, labels, values, total, colors }: { title: string; labels: string[]; values: number[]; total: number; colors: string[] }) {
  return (
    <div className="relative overflow-hidden rounded-card p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" style={{ background: "linear-gradient(180deg,#16161F 0%,#12121D 100%)" }}>
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(120,150,255,0.12)_0%,transparent_68%)]" />
      <div className="vela-label relative mb-3.5">{title}</div>
      <div className="relative space-y-2.5">
        {labels.map((l, i) => (
          <div key={l} className="flex items-center gap-3">
            <span className="w-24 font-body text-[12.5px] text-txt-2">{l}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
              <span className="block h-full rounded-full" style={{ width: `${total ? (values[i] / total) * 100 : 0}%`, background: colors[i] }} />
            </span>
            <span className="w-4 text-right font-body text-[11.5px] text-txt-3">{values[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, hint, sub, children }: { title: string; hint?: string; sub?: string; children: ReactNode }) {
  return (
    <Reveal className="mt-16">
      <section>
        <div className="mb-4 flex items-baseline gap-3">
          <h2 className="font-cinzel text-[25px] font-normal uppercase leading-tight tracking-[0.02em] text-txt lg:text-[32px]">{title}</h2>
          {hint && <span className="rounded-pill border border-line px-2.5 py-0.5 font-body text-[11px] text-txt-3">{hint}</span>}
        </div>
        {sub && <p className="mb-6 max-w-[62ch] font-body text-[15px] leading-relaxed text-txt-3">{sub}</p>}
        {children}
      </section>
    </Reveal>
  );
}

function Overview({ onPick }: { onPick: (d: SheetDescriptor) => void }) {
  const summary = aiSummary();
  return (
    <div>
      <div className="vela-label">Überblick</div>
      <h3 className="mt-1.5 font-display text-[14px] font-semibold uppercase tracking-[0.1em] text-txt-2">Dein Bild auf einen Blick</h3>
      <p className="mt-3 font-body text-[14px] leading-relaxed text-txt-2">
        {summary || "Tippe oben im Rad auf einen Planeten oder eine Aspektlinie — die Deutung erscheint hier."}
      </p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {[{ k: "sun", l: "Sonne", g: "☉" }, { k: "moon", l: "Mond", g: "☽" }, { k: "asc", l: "Aszendent", g: "AC" }].map((b) => (
          <button
            key={b.k}
            onClick={() => onPick({ kind: "planet", key: b.k })}
            className="flex flex-col items-center gap-1 rounded-2xl border border-line bg-surface px-2 py-3 transition hover:border-line-accent hover:bg-surface-2"
          >
            <span className="font-glyph text-[18px]" style={{ color: col(b.k) }}>{b.g}</span>
            <span className="font-body text-[11px] text-txt-3">{b.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailView({ content, sel, onPick }: { content: NonNullable<ReturnType<typeof resolveSheet>>; sel: SheetDescriptor; onPick: (d: SheetDescriptor) => void }) {
  // for an aspect, surface its two endpoints as quick links
  const endpoints = sel.kind === "aspect" ? computeAspects().find((a) => a.key === sel.key) : null;
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl font-glyph text-[20px]" style={{ color: content.color, boxShadow: `inset 0 0 0 1px ${content.color}3d`, background: `radial-gradient(circle, ${content.color}1f, transparent 74%)` }}>
          {content.glyph}
        </span>
        <h3 className="font-cinzel text-[19px] font-normal uppercase leading-tight tracking-[0.02em] text-txt">{content.title}</h3>
      </div>

      {endpoints && (
        <div className="mt-3 flex gap-2">
          {[endpoints.A, endpoints.B].map((pl) => (
            <button key={pl.key} onClick={() => onPick({ kind: "planet", key: pl.key })} className="flex items-center gap-1.5 rounded-pill border border-line bg-surface px-2.5 py-1.5 font-body text-[12px] text-txt-2 hover:bg-surface-2">
              <span className="font-glyph text-[13px]" style={{ color: col(pl.key) }}>{pl.glyph}</span>
              {pl.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {/* general — die Definition, ruhig gesetzt (nie kursiv) */}
        {content.sections.filter((s) => !s.accent && s.source !== "ai" && /^was/i.test(s.label)).map((s, i) => (
          <div key={`g${i}`}>
            <div className="mb-1.5 font-body text-[9.5px] font-medium uppercase tracking-[0.18em] text-txt-3">{s.label}</div>
            <Prose text={s.body} lede="text-[15px]" rest="text-[14px]" />
          </div>
        ))}
        {/* Lehrstoff-Zeilen bleiben Zeilen; nur ECHTE Deutungen (source: "ai")
            wandern in den Deutungs-Block. */}
        {(() => {
          const notes = content.sections.filter((s) => !s.accent && s.source !== "ai" && !/^was/i.test(s.label));
          const readings = content.sections.filter((s) => !s.accent && s.source === "ai");
          return (
            <>
              {notes.map((s, i) => (
                <div key={`p${i}`} className="grid grid-cols-[auto_1fr] gap-x-3 border-t border-line pt-3.5 first:border-t-0 first:pt-0">
                  <div className="mt-1 h-full w-[3px] rounded-full bg-gradient-to-b from-lilac/80 to-violet/30" />
                  <div>
                    <div className="mb-1.5 font-body text-[10px] font-medium uppercase tracking-[0.18em] text-lilac">{s.label}</div>
                    <p className="font-body text-[13.5px] leading-[1.65] text-txt-2">{s.body}</p>
                  </div>
                </div>
              ))}
              {/* personal — Vela's generated reading (grounded), template as fallback */}
              <GeneratedReading sel={sel} fallback={content.sections.find((s) => s.accent)?.body} folded={readings.length ? readings : undefined} />
            </>
          );
        })()}
      </div>

      {content.relations && content.relations.length > 0 && (
        <div className="mt-5">
          <div className="vela-label mb-2">Verbindungen</div>
          <div className="flex flex-wrap gap-1.5">
            {content.relations.map((r) => (
              <button key={r.key} onClick={() => onPick({ kind: "aspect", key: r.key })} className="flex items-center gap-1.5 rounded-pill border border-line bg-surface px-2.5 py-1.5 font-body text-[11px] text-txt-2 transition hover:bg-surface-2">
                <span className="font-glyph text-[13px]" style={{ color: r.color }}>{r.glyph}</span>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
