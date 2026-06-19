import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/store/useApp";
import { resolveSheet } from "@/lib/sheets";
import { EASE } from "@/lib/tokens";

/**
 * Full-page detail view for a position (planet / node). Replaces the cramped
 * bottom sheet with a real "page" you navigate into and back out of.
 * Editorial, no boxes — the interpretation breathes.
 */
export function DetailView() {
  const detail = useApp((s) => s.detail);
  const close = useApp((s) => s.closeDetail);
  const openDetail = useApp((s) => s.openDetail);
  const content = detail ? resolveSheet(detail) : null;

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          key="detail"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.32, ease: EASE.smooth }}
          className="fixed inset-0 z-[88] overflow-y-auto bg-[#06060F]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(120,80,255,0.16),transparent_60%)]" />

          <div className="relative mx-auto w-full max-w-[680px] px-[max(22px,6vw)] pb-24 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
            <button
              onClick={close}
              className="mb-8 flex items-center gap-2 font-body text-sm text-txt-2 transition hover:text-txt"
            >
              <ArrowLeft className="h-4 w-4" /> Zurück
            </button>

            {/* title */}
            <div className="flex items-center gap-4">
              <span className="vela-glyph text-5xl" style={{ color: content.color, textShadow: "0 0 24px rgba(139,92,246,0.4)" }}>
                {content.glyph}
              </span>
              <h1 className="font-display text-[clamp(28px,7vw,40px)] font-extrabold leading-[1.05] tracking-[-0.02em] text-txt">
                {content.title}
              </h1>
            </div>

            {/* sections — editorial, no boxes */}
            <div className="mt-10 flex flex-col gap-8">
              {content.sections.map((sec) => (
                <div key={sec.label}>
                  <div className="vela-data-dim mb-2 uppercase" style={{ color: sec.accent || "var(--accent-primary)" }}>
                    {sec.label}
                  </div>
                  <p className="max-w-[58ch] font-body text-[15px] leading-relaxed text-txt-2">{sec.body}</p>
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
                      onClick={() => openDetail({ kind: "aspect", key: r.key })}
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
