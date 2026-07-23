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
      className="relative mx-auto min-h-full w-full max-w-[480px] px-[max(22px,5vw)] pb-[136px] pt-[calc(env(safe-area-inset-top,0px)+2.5rem)] lg:max-w-[880px] lg:px-12 lg:pb-24 lg:pt-10 xl:max-w-[1180px]"
    >
      {children}
    </motion.main>
  );
}

/**
 * Seiten-Kopf — jetzt strikt auf der Type-Ramp aus claude.ai/design:
 * .v-eyebrow → .v-h1 (Cinzel 400, VERSALIEN) → .v-lede.
 *
 * Wichtig: KEIN farbiger Text-Glow mehr. Das loum-System erlaubt den Halo
 * ausschließlich auf dem „lit word" (.highlight) und auf .card-name — die
 * Basis-Display-Zeile bleibt flach. Vorher stand hier Cinzel Semibold mit
 * blauem text-shadow; das war der auffälligste Bruch gegen das System.
 * Ein Baustein, alle Screens: Kopfzeilen können nicht mehr auseinanderlaufen.
 */
export function PageHead({ label, title, sub }: { label?: string; title: string; sub?: string }) {
  return (
    <header className="mb-6">
      {label && <div className="v-eyebrow mb-2">{label}</div>}
      <h1 className="v-h1">{title}</h1>
      {sub && <p className="v-lede mt-2.5">{sub}</p>}
    </header>
  );
}

/**
 * Abschnitts-Kopf — dieselbe Ramp eine Stufe kleiner: .v-eyebrow → .v-h2
 * (Cinzel 400, VERSALIEN) → .v-body. Ersetzt den alten Sans-Semibold-Titel,
 * der nicht aus dem Design stammte.
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
      {label && <div className="v-eyebrow mb-2">{label}</div>}
      <h2 className="v-h2">{title}</h2>
      {sub && <p className="v-body mt-1.5">{sub}</p>}
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
