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
      className="relative mx-auto min-h-full w-full max-w-[480px] px-[max(16px,4vw)] pb-[110px] pt-14"
    >
      {children}
    </motion.main>
  );
}

/** A consistent, editorial section header used across all screens. */
export function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="mb-4">
      <h2 className="font-serif text-[2rem] font-medium leading-none tracking-tight text-ink">
        {title}
      </h2>
      {sub && <p className="vela-sub mt-1.5">{sub}</p>}
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
