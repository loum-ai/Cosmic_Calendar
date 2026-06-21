import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download } from "lucide-react";
import { ChartWheel } from "@/components/ChartWheel";
import { resolveSheet, type SheetDescriptor } from "@/lib/sheets";
import { CHART, PROFILE, HOUSE, signName, computeAspects, IS_DEMO } from "@/lib/data";
import { ASPECT_TEXT } from "@/lib/readings";
import { aiSummary, aiAspect, aiSign } from "@/lib/interpret";
import { useApp } from "@/store/useApp";

const COL: Record<string, string> = {
  sun: "#ffce6e", moon: "#d7e3ff", mercury: "#8fd0e6", venus: "#46e8c4", mars: "#ff6a52",
  jupiter: "#ffce5e", saturn: "#cda6ff", uranus: "#79e6d6", neptune: "#9db6ff", pluto: "#d39aea",
  chiron: "#8fd0ff", lilith: "#e3a8d6", asc: "#c9b6ff",
};
const col = (k: string) => COL[k] ?? "#cbb9ff";
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

        {/* ── ASPEKTE ── */}
        <Section title="Aspekte" hint={`${aspects.length} Verbindungen`} sub="Wie deine Kräfte zusammenspielen — tippe für die Deutung.">
          <div className="grid gap-2 sm:grid-cols-2">
            {aspects.map((a) => {
              const txt = aiAspect(a.A.key, a.B.key) || (IS_DEMO && ASPECT_TEXT[a.key]) || a.def.plain;
              const on = highlight === a.key;
              return (
                <button
                  key={a.key}
                  onClick={() => select({ kind: "aspect", key: a.key })}
                  style={{ borderColor: on ? a.def.c : undefined }}
                  className={`group flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
                    on ? "bg-surface-2" : "border-[rgba(255,255,255,0.1)] bg-surface hover:border-line-accent hover:bg-surface-2"
                  }`}
                >
                  <span className="flex shrink-0 items-center font-glyph text-[17px]" style={{ color: a.def.c }}>
                    <span style={{ color: col(a.A.key) }}>{a.A.glyph}</span>
                    <span className="mx-1 opacity-90">{a.def.g}</span>
                    <span style={{ color: col(a.B.key) }}>{a.B.glyph}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-[13px] font-semibold text-txt">
                        {a.A.name} <span style={{ color: a.def.c }}>{a.def.type}</span> {a.B.name}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-txt-3">{a.orb.toFixed(1)}°</span>
                    </span>
                    <span className="mt-0.5 line-clamp-1 font-body text-[12px] text-txt-3">{txt}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── PLANETEN ── */}
        <Section title="Planeten" hint={`${planets.length}`} sub="Wo die Kräfte deines Bildes stehen.">
          <div className="grid gap-2 sm:grid-cols-2">
            {planets.map((p) => {
              const h = p.house ?? 1;
              const on = highlight === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => select({ kind: "planet", key: p.key })}
                  className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
                    on ? "border-line-accent bg-surface-2" : "border-[rgba(255,255,255,0.1)] bg-surface hover:border-line-accent hover:bg-surface-2"
                  }`}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border font-glyph text-[18px]"
                    style={{ color: col(p.key), borderColor: `${col(p.key)}55`, background: `${col(p.key)}12` }}
                  >
                    {p.glyph}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[13.5px] font-semibold text-txt">{p.name}</span>
                    <span className="block font-body text-[12px] text-txt-3">
                      {signName(p.lon)} · {h}. Haus · {HOUSE[h - 1]}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── DEUTUNG ── */}
        <Section title="Deine Deutung" sub="Dein Bild in Worten.">
          <div className="rounded-card border border-[rgba(150,120,255,0.16)] bg-glasswash p-5 lg:p-6">
            {aiSummary() && <p className="font-body text-[14.5px] leading-relaxed text-txt">{aiSummary()}</p>}
            <div className={`${aiSummary() ? "mt-4 border-t border-line pt-4" : ""} space-y-3`}>
              {planets.map((p) => {
                const t = aiSign(p.key) || p.txt;
                if (!t) return null;
                return (
                  <button key={p.key} onClick={() => select({ kind: "planet", key: p.key })} className="flex w-full gap-3 text-left">
                    <span className="mt-0.5 font-glyph text-[15px]" style={{ color: col(p.key) }}>{p.glyph}</span>
                    <span className="font-body text-[13.5px] leading-relaxed text-txt-2">
                      <span className="font-semibold text-txt">{p.name}: </span>
                      {t}
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
