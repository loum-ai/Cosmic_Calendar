import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Staggered fade-in. Each section reveals as it scrolls into view, gently rising
 * a few pixels. Index `i` staggers siblings. Fully static under
 * prefers-reduced-motion (renders a plain div, no transform). One primitive,
 * used on every screen — the same entrance discipline everywhere.
 */
export function Reveal({
  children,
  i = 0,
  className,
}: {
  children: ReactNode;
  i?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 8) * 0.07 }}
    >
      {children}
    </motion.div>
  );
}
