import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChartWheel } from "@/components/ChartWheel";
import { resolveSheet, type SheetDescriptor } from "@/lib/sheets";
import { CHART, ASC, PROFILE, signName, computeAspects } from "@/lib/data";
import { aiSummary } from "@/lib/interpret";
import { useApp } from "@/store/useApp";

const selKey = (d: SheetDescriptor | null) => (d ? `${d.kind}:${d.key}` : "overview");

/**
 * Chart explorer — the centrepiece. A floating instrument: the main aspects
 * sit on a bar up top, the wheel fills a deep glass "stage", and tapping any
 * aspect / planet swaps the reading panel on the right (astro.com, but calm).
 */
export function ChartExplorer() {
  useApp((s) => s.aiVersion); // re-render when the AI reading lands
  const [sel, setSel] = useState<SheetDescriptor | null>(null);

  const aspects = useMemo(
    () => [...computeAspects()].sort((a, b) => b.def.w - a.def.w || a.orb - b.orb).slice(0, 8),
    [],
  );
  const highlight = sel && (sel.kind === "aspect" || sel.kind === "planet" || sel.kind === "node") ? String(sel.key) : null;
  const content = sel ? resolveSheet(sel) : null;

  return (
    <div className="animate-slideUp px-5 pb-28 pt-[calc(env(safe-area-inset-top,0px)+1.4rem)] lg:px-10 lg:pt-10">
      <div className="mx-auto w-full max-w-[1180px]">
        {/* header */}
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="vela-label">Geburtsbild</div>
            <h1 className="font-cinzel text-[26px] font-semibold tracking-wide text-txt lg:text-[34px]">{PROFILE.name}</h1>
            <p className="mt-0.5 font-body text-[12.5px] text-txt-3">{PROFILE.birth}</p>
          </div>
          <div className="flex gap-2">
            {[
              { k: "sun", g: "☉", l: signName(CHART.find((p) => p.key === "sun")?.lon ?? 0) },
              { k: "moon", g: "☽", l: signName(CHART.find((p) => p.key === "moon")?.lon ?? 0) },
              { k: "asc", g: "AC", l: signName(ASC) },
            ].map((b) => (
              <button
                key={b.k}
                onClick={() => setSel({ kind: "planet", key: b.k })}
                className="flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 font-glyph text-[13px] text-txt-2 transition hover:border-line-accent hover:bg-surface-2"
              >
                <span className="text-lilac">{b.g}</span>
                <span className="font-body text-[11px] text-txt-3">{b.l}</span>
              </button>
            ))}
          </div>
        </header>

        {/* main aspects bar */}
        <div className="mb-4">
          <div className="vela-label mb-2">Hauptaspekte</div>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {aspects.map((a) => {
              const on = highlight === a.key;
              return (
                <button
                  key={a.key}
                  onClick={() => setSel({ kind: "aspect", key: a.key })}
                  style={{ borderColor: on ? a.def.c : undefined }}
                  className={`flex shrink-0 items-center gap-2 rounded-pill border px-3 py-2 transition ${
                    on ? "bg-surface-2" : "border-line bg-surface hover:bg-surface-2"
                  }`}
                >
                  <span className="font-glyph text-[15px] text-txt" style={{ color: a.def.c }}>
                    {a.A.glyph}
                    <span className="mx-0.5 opacity-80">{a.def.g}</span>
                    {a.B.glyph}
                  </span>
                  <span className="font-body text-[11px] text-txt-3">{a.orb.toFixed(1)}°</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* stage + detail */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(340px,400px)]">
          {/* chart stage */}
          <section className="relative overflow-hidden rounded-card border border-line bg-stage p-5 shadow-glass lg:p-8">
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-violet/20 blur-3xl" />
            <div className="relative mx-auto w-full max-w-[460px]">
              <ChartWheel onPick={setSel} highlight={highlight} />
            </div>
            {/* planet legend */}
            <div className="relative mt-4 flex flex-wrap justify-center gap-1.5">
              {CHART.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setSel({ kind: "planet", key: p.key })}
                  title={p.name}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border font-glyph text-[14px] transition ${
                    highlight === p.key ? "border-lilac bg-surface-2 text-ink" : "border-line bg-surface text-txt-2 hover:text-ink"
                  }`}
                >
                  {p.glyph}
                </button>
              ))}
            </div>
          </section>

          {/* detail panel */}
          <aside className="rounded-card border border-line bg-glasswash p-5 shadow-glass backdrop-blur-xl lg:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selKey(sel)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                {content ? <DetailView content={content} onPick={setSel} /> : <Overview onPick={setSel} />}
              </motion.div>
            </AnimatePresence>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Overview({ onPick }: { onPick: (d: SheetDescriptor) => void }) {
  const summary = aiSummary();
  return (
    <div>
      <div className="vela-label">Überblick</div>
      <h2 className="mt-1 font-serif text-[24px] font-semibold leading-tight text-txt">Dein Bild auf einen Blick</h2>
      <p className="mt-3 font-body text-[13.5px] leading-relaxed text-txt-2">
        {summary ||
          "Tippe oben auf einen Aspekt oder im Rad auf einen Planeten — die Deutung erscheint hier. So liest du dein Chart Stück für Stück, in Klartext."}
      </p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { k: "sun", l: "Sonne", g: "☉" },
          { k: "moon", l: "Mond", g: "☽" },
          { k: "asc", l: "Aszendent", g: "AC" },
        ].map((b) => (
          <button
            key={b.k}
            onClick={() => onPick({ kind: "planet", key: b.k })}
            className="flex flex-col items-center gap-1 rounded-2xl border border-line bg-surface px-2 py-3 transition hover:border-line-accent hover:bg-surface-2"
          >
            <span className="font-glyph text-[18px] text-lilac">{b.g}</span>
            <span className="font-body text-[11px] text-txt-3">{b.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailView({ content, onPick }: { content: NonNullable<ReturnType<typeof resolveSheet>>; onPick: (d: SheetDescriptor) => void }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line font-glyph text-[20px]"
          style={{ color: content.color, background: "rgba(255,255,255,0.04)" }}
        >
          {content.glyph}
        </span>
        <h2 className="font-serif text-[22px] font-semibold leading-tight text-txt">{content.title}</h2>
      </div>

      <div className="mt-4 space-y-3.5">
        {content.sections.map((s, i) => (
          <div key={i}>
            <div className="font-body text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: s.accent || "rgba(255,255,255,0.42)" }}>
              {s.label}
            </div>
            <p className="mt-1 font-body text-[13px] leading-relaxed text-txt-2">{s.body}</p>
          </div>
        ))}
      </div>

      {content.relations && content.relations.length > 0 && (
        <div className="mt-5">
          <div className="vela-label mb-2">Verbindungen</div>
          <div className="flex flex-wrap gap-1.5">
            {content.relations.map((r) => (
              <button
                key={r.key}
                onClick={() => onPick({ kind: "aspect", key: r.key })}
                className="flex items-center gap-1.5 rounded-pill border border-line bg-surface px-2.5 py-1.5 font-body text-[11px] text-txt-2 transition hover:bg-surface-2"
              >
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
