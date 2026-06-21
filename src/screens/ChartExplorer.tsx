import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download } from "lucide-react";
import { ChartWheel } from "@/components/ChartWheel";
import { resolveSheet, type SheetDescriptor } from "@/lib/sheets";
import { CHART, ASC, PROFILE, SN, PINFO, signName, computeAspects, IS_DEMO } from "@/lib/data";
import { ASPECT_TEXT } from "@/lib/readings";
import { aiSummary, aiAspect, aiSign } from "@/lib/interpret";
import { useApp } from "@/store/useApp";

const COL: Record<string, string> = {
  sun: "#ffce6e", moon: "#d7e3ff", mercury: "#8fd0e6", venus: "#46e8c4", mars: "#ff6a52",
  jupiter: "#ffce5e", saturn: "#cda6ff", uranus: "#79e6d6", neptune: "#9db6ff", pluto: "#d39aea",
  chiron: "#8fd0ff", lilith: "#e3a8d6", asc: "#c9b6ff",
};
const col = (k: string) => COL[k] ?? "#cbb9ff";

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
  const [sel, setSel] = useState<SheetDescriptor | null>(null);

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
  const heroTxt = tightest ? aiAspect(tightest.A.key, tightest.B.key) || (IS_DEMO && ASPECT_TEXT[tightest.key]) || tightest.def.plain : "";

  return (
    <div className="animate-slideUp px-5 pb-28 pt-[calc(env(safe-area-inset-top,0px)+1.4rem)] lg:px-10 lg:pt-10">
      <div className="mx-auto w-full max-w-[1180px]">
        {/* header */}
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="vela-label mb-1.5">Geburtsbild</div>
            <h1 className="font-cinzel text-[34px] font-semibold leading-none tracking-wide text-white [text-shadow:0_0_26px_rgba(139,92,246,0.4)] lg:text-[52px]">
              {PROFILE.name}
            </h1>
            <p className="mt-2.5 font-body text-[13px] text-txt-2">{PROFILE.birth}</p>
          </div>
          <button
            onClick={() => setPrintOpen(true)}
            className="flex items-center gap-2 rounded-pill border border-line-accent bg-surface px-4 py-2.5 font-display text-[13px] font-semibold text-txt transition hover:bg-surface-2"
          >
            <Download className="h-4 w-4 text-lilac" /> Horoskop herunterladen
          </button>
        </header>

        {/* chart stage + live reading (desktop) */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(330px,380px)] lg:gap-5">
          <section className="relative overflow-hidden rounded-card border border-[rgba(150,120,255,0.22)] bg-stage p-5 shadow-glass lg:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-violet/20 blur-3xl" />
            <div className="relative mx-auto w-full max-w-[480px]">
              <ChartWheel onPick={select} highlight={highlight} />
            </div>
            <p className="relative mt-3 text-center font-body text-[12px] text-txt-3">
              Tippe einen Planeten oder eine Aspektlinie — oder nutze die Listen unten.
            </p>
          </section>

          {/* desktop reading panel */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-card border border-[rgba(150,120,255,0.18)] bg-glasswash p-6 shadow-glass backdrop-blur-xl">
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

        {/* ── HERO: the chart's single most defining note (computed) ── */}
        {tightest && (
          <section className="mt-7">
            <button
              onClick={() => select({ kind: "aspect", key: tightest.key })}
              className="relative w-full overflow-hidden rounded-card border border-[rgba(150,120,255,0.35)] bg-stage p-6 text-left shadow-glass transition hover:border-lilac/60 lg:p-8"
            >
              <span className="pointer-events-none absolute -right-6 -top-10 font-glyph text-[150px] leading-none opacity-[0.07]" style={{ color: tightest.def.c }}>{tightest.def.g}</span>
              <div className="relative">
                <div className="vela-label">Deine Signatur · {domElem}-betont</div>
                <h2 className="mt-2 font-cinzel text-[26px] font-semibold leading-tight text-white lg:text-[34px]">
                  <span style={{ color: col(tightest.A.key) }}>{tightest.A.name}</span>{" "}
                  <span className="text-txt-2">{tightest.def.type}</span>{" "}
                  <span style={{ color: col(tightest.B.key) }}>{tightest.B.name}</span>
                </h2>
                <div className="mt-1 font-mono text-[11px] text-txt-3">exaktester Aspekt · {tightest.orb.toFixed(1)}° Orbis</div>
                {heroTxt && <p className="mt-3 max-w-[60ch] font-body text-[14px] leading-relaxed text-txt-2">{heroTxt}</p>}
              </div>
            </button>
          </section>
        )}

        {/* ── DIE GROSSEN DREI ── */}
        <Section title="Die großen Drei" sub="Kern, Gefühl, Auftreten — deine Identitäts-Achse.">
          <div className="grid gap-3 sm:grid-cols-3">
            {big3.map((b) => (
              <button
                key={b.key}
                onClick={() => select({ kind: "planet", key: b.key })}
                className="group relative overflow-hidden rounded-card border border-[rgba(150,120,255,0.2)] bg-glasswash p-5 text-left transition hover:border-line-accent"
              >
                <span className="pointer-events-none absolute -right-3 -top-7 font-glyph text-[92px] leading-none opacity-[0.08]" style={{ color: b.color }}>{b.glyph}</span>
                <span className="relative font-glyph text-[24px]" style={{ color: b.color }}>{b.glyph}</span>
                <div className="relative mt-2 vela-label">{b.role}</div>
                <div className="relative mt-0.5 font-cinzel text-[24px] font-semibold leading-none text-white">{b.sign}</div>
                <div className="relative mt-1.5 font-body text-[12px] text-txt-3">{b.sub}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* ── ASPEKTE (grouped) ── */}
        <Section title="Aspekte" hint={`${aspects.length}`} sub="Wie deine Kräfte zusammenspielen.">
          <div className="grid gap-4 lg:grid-cols-2">
            <AspectGroup title="Im Fluss" tone="leicht & unterstützend" accent="#2fde8c" items={flow} sel={highlight} onPick={select} />
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
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="rounded-card border border-[rgba(150,120,255,0.16)] bg-glasswash p-5 lg:p-7">
            {aiSummary() && <p className="font-serif text-[18px] italic leading-[1.6] text-txt">{aiSummary()}</p>}
            <div className={`${aiSummary() ? "mt-6 border-t border-line pt-6" : ""} grid gap-x-6 gap-y-5 sm:grid-cols-2`}>
              {planets.map((p) => {
                const t = aiSign(p.key) || p.txt;
                if (!t) return null;
                return (
                  <button key={p.key} onClick={() => select({ kind: "planet", key: p.key })} className="flex gap-3 text-left">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-glyph text-[17px]" style={{ color: col(p.key), borderColor: `${col(p.key)}55`, background: `${col(p.key)}12` }}>{p.glyph}</span>
                    <span>
                      <span className="block font-display text-[12.5px] font-semibold text-txt">{p.name} · {signName(p.lon)}</span>
                      <span className="mt-0.5 block font-body text-[13px] leading-relaxed text-txt-2">{t}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function AspectGroup({ title, tone, accent, items, sel, onPick }: { title: string; tone: string; accent: string; items: ReturnType<typeof computeAspects>; sel: string | null; onPick: (d: SheetDescriptor) => void }) {
  return (
    <div className="rounded-card border border-[rgba(255,255,255,0.08)] bg-surface p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="font-display text-[14px] font-bold text-txt">{title}</span>
        <span className="font-body text-[11px] text-txt-3">{tone}</span>
      </div>
      <div className="space-y-1">
        {items.length ? (
          items.map((a) => {
            const on = sel === a.key;
            const strength = Math.max(0.14, 1 - a.orb / 8);
            return (
              <button key={a.key} onClick={() => onPick({ kind: "aspect", key: a.key })} className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${on ? "bg-surface-2" : "hover:bg-surface-2"}`}>
                <span className="shrink-0 font-glyph text-[15px]">
                  <span style={{ color: col(a.A.key) }}>{a.A.glyph}</span>
                  <span className="mx-0.5" style={{ color: accent }}>{a.def.g}</span>
                  <span style={{ color: col(a.B.key) }}>{a.B.glyph}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-body text-[12.5px] text-txt-2">{a.A.name} {a.def.type} {a.B.name}</span>
                  <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full" style={{ width: `${strength * 100}%`, background: accent }} />
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[10px] text-txt-3">{a.orb.toFixed(1)}°</span>
              </button>
            );
          })
        ) : (
          <p className="py-1 font-body text-[12px] text-txt-3">Keine in dieser Gruppe.</p>
        )}
      </div>
    </div>
  );
}

function PlanetCard({ p, on, onPick }: { p: (typeof CHART)[number]; on: boolean; onPick: (d: SheetDescriptor) => void }) {
  const h = p.house ?? 1;
  const role = PINFO[p.key]?.role ?? "";
  return (
    <button onClick={() => onPick({ kind: "planet", key: p.key })} className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${on ? "border-line-accent bg-surface-2" : "border-[rgba(255,255,255,0.1)] bg-surface hover:border-line-accent hover:bg-surface-2"}`}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-glyph text-[19px]" style={{ color: col(p.key), borderColor: `${col(p.key)}55`, background: `${col(p.key)}12` }}>{p.glyph}</span>
      <span className="min-w-0">
        <span className="block font-display text-[13.5px] font-semibold text-txt">{p.name}</span>
        <span className="block font-body text-[12px] text-txt-2">{signName(p.lon)} · {h}. Haus</span>
        {role && <span className="block truncate font-body text-[11px] text-txt-3">{role}</span>}
      </span>
    </button>
  );
}

function Bars({ title, labels, values, total, colors }: { title: string; labels: string[]; values: number[]; total: number; colors: string[] }) {
  return (
    <div className="rounded-card border border-[rgba(255,255,255,0.08)] bg-surface p-5">
      <div className="vela-label mb-3">{title}</div>
      <div className="space-y-2.5">
        {labels.map((l, i) => (
          <div key={l} className="flex items-center gap-3">
            <span className="w-24 font-body text-[12.5px] text-txt-2">{l}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full" style={{ width: `${total ? (values[i] / total) * 100 : 0}%`, background: colors[i] }} />
            </span>
            <span className="w-4 text-right font-mono text-[11px] text-txt-3">{values[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, hint, sub, children }: { title: string; hint?: string; sub?: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-baseline gap-2.5">
        <h2 className="font-cinzel text-[20px] font-semibold tracking-wide text-white lg:text-[24px]">{title}</h2>
        {hint && <span className="rounded-pill border border-line bg-surface px-2 py-0.5 font-mono text-[10px] text-txt-3">{hint}</span>}
      </div>
      {sub && <p className="mb-4 font-body text-[12.5px] text-txt-3">{sub}</p>}
      {children}
    </section>
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
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line font-glyph text-[20px]" style={{ color: content.color, background: "rgba(255,255,255,0.05)" }}>
          {content.glyph}
        </span>
        <h3 className="font-serif text-[22px] font-semibold leading-tight text-txt">{content.title}</h3>
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
        {/* general — italic serif definition */}
        {content.sections.filter((s) => !s.accent && /^was/i.test(s.label)).map((s, i) => (
          <div key={`g${i}`}>
            <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-txt-3">{s.label}</div>
            <p className="font-serif text-[16px] italic leading-[1.5] text-txt-2">{s.body}</p>
          </div>
        ))}
        {/* placements — data-point rows */}
        {content.sections.filter((s) => !s.accent && !/^was/i.test(s.label)).map((s, i) => (
          <div key={`p${i}`} className="grid grid-cols-[auto_1fr] gap-x-3 border-t border-line pt-3.5 first:border-t-0 first:pt-0">
            <div className="mt-1 h-full w-[3px] rounded-full bg-gradient-to-b from-lilac/80 to-violet/30" />
            <div>
              <div className="mb-1 font-display text-[12px] font-bold text-lilac">{s.label}</div>
              <p className="font-body text-[13.5px] leading-[1.6] text-txt-2">{s.body}</p>
            </div>
          </div>
        ))}
        {/* personal — accent card */}
        {content.sections.filter((s) => s.accent).map((s, i) => (
          <div key={`a${i}`} className="rounded-2xl border border-mint/25 bg-mint/[0.06] p-3.5">
            <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-mint">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_6px_#2dd4bf]" />
              {s.label}
            </div>
            <p className="font-body text-[15px] font-medium leading-[1.55] text-white">{s.body}</p>
          </div>
        ))}
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
