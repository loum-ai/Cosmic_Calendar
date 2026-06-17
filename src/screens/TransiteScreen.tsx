import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ScreenShell, SectionHead } from "@/components/ScreenShell";
import { GlassPanel } from "@/components/GlassPanel";
import { OrbImage } from "@/components/OrbImage";
import { useApp } from "@/store/useApp";
import { COSMIC_EVENTS, TRANSITS } from "@/lib/data";
import { EASE } from "@/lib/tokens";

const IMPACT_COLOR: Record<string, string> = { "+": "#2fde8c", "-": "#ff8fb0", "~": "#f8c050" };

function DateScrubber() {
  const [offset, setOffset] = useState(0);
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const label = d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="flex items-center gap-2 rounded-pill border border-white/10 bg-white/[0.05] px-1.5 py-1.5 backdrop-blur-md">
      <button
        onClick={() => setOffset((o) => o - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft/70 active:scale-90"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="flex-1 text-center font-body text-xs text-ink-soft/85">
        {offset === 0 ? "Heute" : label}
      </span>
      <button
        onClick={() => setOffset((o) => o + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft/70 active:scale-90"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Cinematic full-bleed transit detail. Close works via X, backdrop, ESC. */
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
          initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }}
          transition={{ duration: 0.42, ease: EASE.smooth }}
          className="fixed inset-0 z-[80] flex flex-col"
        >
          <div className="absolute inset-0 bg-[#01000b]" />
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse 90% 55% at 50% 0%,${tr.c}28,transparent 60%)` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,0,11,0.3)_0%,transparent_30%,transparent_60%,rgba(1,0,11,0.98)_100%)]" />

          {/* top bar */}
          <div className="relative z-10 flex items-center justify-end px-4 pt-12">
            <button
              onClick={() => setFull(null)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-ink-soft/80 active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* hero orb */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-7">
            <OrbImage size={170} />
          </div>

          {/* content */}
          <div className="relative z-10 px-7 pb-16">
            <h2 className="font-display text-3xl font-extrabold leading-tight text-ink text-balance">
              {tr.title}
            </h2>
            <p className="mt-3.5 font-body text-sm font-light leading-relaxed text-ink/70">{tr.txt}</p>
            <div className="my-5 h-px" style={{ background: `linear-gradient(90deg,${tr.c}66,transparent)` }} />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFull(((i ?? 0) - 1 + n) % n)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-ink-soft/80 active:scale-90"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex flex-1 justify-center gap-1.5">
                {TRANSITS.map((_, di) => (
                  <span
                    key={di}
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: di === i ? 24 : 6, background: di === i ? tr.c : "rgba(255,255,255,0.22)" }}
                  />
                ))}
              </div>
              <button
                onClick={() => setFull(((i ?? 0) + 1) % n)}
                className="flex h-12 w-12 items-center justify-center rounded-full active:scale-90"
                style={{ background: `${tr.c}22`, border: `1px solid ${tr.c}55`, color: "#f3eefe" }}
              >
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="vela-label">Heute am Himmel</div>
          <h1 className="vela-name mt-1.5">Transite</h1>
          <p className="vela-sub mt-1.5">Was der Himmel heute auslöst</p>
        </div>
      </div>

      <div className="mt-4">
        <DateScrubber />
      </div>

      {/* hero — first/strongest transit */}
      <GlassPanel className="mt-5 flex items-center gap-4 p-5" interactive onClick={() => setFull(0)}>
        <OrbImage size={88} float={false} />
        <div className="min-w-0">
          <div className="vela-eyebrow mb-1.5" style={{ color: TRANSITS[0].c }}>
            Stärkster Einfluss
          </div>
          <div className="font-display text-lg font-bold leading-tight text-ink">{TRANSITS[0].title}</div>
          <p className="mt-1.5 line-clamp-2 font-body text-xs font-light text-ink/65">{TRANSITS[0].txt}</p>
        </div>
      </GlassPanel>

      {/* transit list */}
      <section className="mt-8">
        <SectionHead title="Deine Transite" sub="Tippe für die ganze Geschichte" />
        <div className="flex flex-col gap-2.5">
          {TRANSITS.map((tr, i) => (
            <GlassPanel key={i} className="flex items-center gap-3.5 p-3.5" interactive onClick={() => setFull(i)}>
              <span className="vela-glyph text-2xl" style={{ color: tr.c }}>
                {tr.tg}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-semibold text-ink">{tr.title}</div>
              </div>
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                style={{ color: IMPACT_COLOR[tr.impact], background: `${IMPACT_COLOR[tr.impact]}1f` }}
              >
                {tr.impact}
              </span>
            </GlassPanel>
          ))}
        </div>
      </section>

      {/* cosmic newsfeed */}
      <section className="mt-8">
        <SectionHead title="Am Himmel" sub="Größere kosmische Wetterlagen" />
        <div className="flex flex-col gap-2.5">
          {COSMIC_EVENTS.map((e, i) => (
            <GlassPanel key={i} className="flex items-start gap-3.5 p-3.5">
              <span className="vela-glyph mt-0.5 text-xl text-lilac">{e.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-semibold text-ink">{e.label}</div>
                <div className="font-body text-[11px] text-ink-soft/50">{e.sub}</div>
                <p className="mt-1 font-body text-xs font-light leading-relaxed text-ink/65">{e.txt}</p>
              </div>
            </GlassPanel>
          ))}
        </div>
      </section>

      <TransitFull />
    </ScreenShell>
  );
}
