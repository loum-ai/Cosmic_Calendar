import * as React from "react";
import { motion } from "framer-motion";
import { useApp } from "@/store/useApp";
import { EASE } from "@/lib/tokens";

/**
 * Wraps every screen so they share identical padding, max-width and the
 * directional slide transition (right when moving forward through tabs,
 * left when moving back). This is what guarantees the screens can never
 * drift apart in styling again.
 */
export function ScreenShell({ children }: { children: React.ReactNode }) {
  const dir = useApp((s) => s.tabDir);
  return (
    <motion.main
      initial={{ opacity: 0, x: dir * 64, filter: "blur(5px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: dir * -48, filter: "blur(4px)" }}
      transition={{ duration: 0.38, ease: EASE.smooth }}
      className="relative mx-auto min-h-full w-full max-w-[480px] px-[max(20px,5vw)] pb-[136px] pt-[calc(env(safe-area-inset-top,0px)+4rem)]"
    >
      {children}
    </motion.main>
  );
}

/**
 * Consistent section header — a calm sans title + quiet sub, with generous
 * top air. Matches the prototype (NOT a giant serif). Optional caps label.
 */
export function SectionHead({
  title,
  sub,
  label,
}: {
  title: string;
  sub?: string;
  label?: string;
}) {
  return (
    <header className="mb-4 mt-10 first:mt-0">
      {label && <div className="vela-label mb-2">{label}</div>}
      <h2 className="vela-title">{title}</h2>
      {sub && <p className="vela-sub mt-1">{sub}</p>}
    </header>
  );
}

/** Skeleton placeholder block for not-yet-fleshed content. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={
        "animate-pulse rounded-card border border-white/[0.06] bg-white/[0.035] " + className
      }
    />
  );
}
