import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/store/useApp";
import { resolveSheet } from "@/lib/sheets";
import { subjectTask, useReading, storedReading } from "@/lib/genReadings";
import { IS_DEMO } from "@/lib/data";
import { EASE } from "@/lib/tokens";

/**
 * Full-page detail view for a position (planet / node). Replaces the cramped
 * bottom sheet with a real "page" you navigate into and back out of.
 * Editorial, no boxes — the interpretation breathes.
 */
export function DetailView() {
  const detail = useApp((s) => s.detail);
  const close = useApp((s) => s.closeDetail);
  const openInfo = useApp((s) => s.openInfo);
  const content = detail ? resolveSheet(detail) : null;
  // "Bei dir" is a REAL reading: the stored cockpit interpretation if present,
  // else generated live with the interpretive craft — template only as fallback.
  const st = subjectTask(detail);
  const stored = detail ? storedReading(detail) : null;
  const { text: genText, loading: genLoading } = useReading(st?.viewKey ?? "", st?.task ?? "", !!st && !IS_DEMO);
  const personal = genText || stored;

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          key="detail"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.32, ease: EASE.smooth }}
          className="fixed inset-0 z-[88] overflow-y-auto bg-[#0d0d0d]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_46%_24%_at_50%_-6%,rgba(116,96,200,0.09),transparent_55%)]" />

          <div className="relative mx-auto w-full max-w-[680px] px-[max(22px,6vw)] pb-24 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
            <button
              onClick={close}
              className="mb-8 flex items-center gap-2 font-body text-sm text-txt-2 transition hover:text-txt"
            >
              <ArrowLeft className="h-4 w-4" /> Zurück
            </button>

            {/* title */}
            <div className="flex items-center gap-4">
              <span className="vela-glyph text-5xl" style={{ color: content.color, textShadow: "0 0 24px rgba(79,214,239,0.4)" }}>
                {content.glyph}
              </span>
              <h1 className="font-display text-[clamp(28px,7vw,40px)] font-extrabold leading-[1.05] tracking-[-0.02em] text-txt">
                {content.title}
              </h1>
            </div>

            {/* sections — editorial, no boxes */}
            <div className="mt-10 flex flex-col gap-9">
              {content.sections.map((sec) => (
                <div key={sec.label} className={sec.accent ? "border-l-2 border-violet/45 pl-5" : ""}>
                  <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-violet/65">{sec.label}</div>
                  {sec.accent && !personal && genLoading ? (
                    <div className="max-w-[60ch] space-y-2.5 py-1">
                      {[100, 92, 78].map((w, i) => (
                        <div key={i} className="h-3 animate-pulse rounded-full bg-white/[0.06]" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  ) : (
                    <p className="max-w-[60ch] font-body text-[16.5px] leading-[1.72] text-[rgba(255,255,255,0.86)]">
                      {sec.accent ? personal || sec.body : sec.body}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* connections */}
            {content.relations && content.relations.length > 0 && (
              <div className="mt-12">
                <div className="vela-data-dim mb-4 uppercase">Verbindungen</div>
                <div className="flex flex-col">
                  {content.relations.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => openInfo({ kind: "aspect", key: r.key })}
                      className="flex items-start gap-3 border-t border-line-soft py-4 text-left transition first:border-t-0 hover:opacity-80"
                    >
                      <span className="vela-glyph mt-0.5 text-lg" style={{ color: r.color }}>
                        {r.glyph}
                      </span>
                      <div>
                        <div className="font-body text-[14px] text-txt">{r.label}</div>
                        <p className="mt-0.5 max-w-[52ch] font-body text-[13px] leading-relaxed text-txt-3">{r.text}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
