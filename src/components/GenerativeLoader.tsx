import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * A tasteful "content is being written by Vela" state — for every place a
 * reading is generated live. A breathing, glowing glyph + a gently cycling
 * poetic line + shimmering skeleton lines in the accent colour, so the reading
 * feels like it's materialising from the chart. Not a flat spinner. Fully calm
 * under prefers-reduced-motion.
 */
export function GenerativeLoader({
  glyph = "✦",
  accent = "#7896FF",
  messages,
  widths = [100, 94, 97, 86, 72],
}: {
  glyph?: string;
  accent?: string;
  messages: string[];
  widths?: number[];
}) {
  const reduce = useReducedMotion();
  const [mi, setMi] = useState(0);
  useEffect(() => {
    if (reduce || messages.length < 2) return;
    const id = setInterval(() => setMi((m) => (m + 1) % messages.length), 2600);
    return () => clearInterval(id);
  }, [reduce, messages.length]);

  return (
    <div className="py-2">
      <div className="flex items-center gap-3.5">
        <span
          className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-glyph text-[22px]"
          style={{ color: accent, background: `radial-gradient(circle, ${accent}2b, transparent 72%)`, border: `1px solid ${accent}3a` }}
        >
          {!reduce && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 22px -4px ${accent}` }}
              animate={{ opacity: [0.35, 1, 0.35], scale: [0.95, 1.07, 0.95] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <span className="relative">{glyph}</span>
        </span>
        <AnimatePresence mode="wait">
          <motion.p
            key={mi}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-[16px] italic leading-snug text-txt-2"
          >
            {messages[mi]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-5 space-y-3">
        {widths.map((w, i) => (
          <div key={i} className="relative h-3 overflow-hidden rounded-full bg-white/[0.05]" style={{ width: `${w}%` }}>
            {!reduce && (
              <motion.div
                className="absolute inset-y-0 w-1/3"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }}
                animate={{ x: ["-120%", "340%"] }}
                transition={{ duration: 1.7, repeat: Infinity, ease: "linear", delay: i * 0.14 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
