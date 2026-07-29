import type { CSSProperties, ReactNode } from "react";

/**
 * DIE Kartenkomponente (Plan „Nutzerführung", Schritt B).
 *
 * Vorher standen sechs Bauarten nebeneinander: `inkSurface()` in ThemenHub,
 * `vela-card-soft`, die Muster-Karte und die Planeten-Fotokarte in
 * ChartExplorer, die Kachel unter „Auf einen Blick" und die Deutungsbox im
 * Sheet. Unterschiedliche Radien (14/16/18/20/24/26/30 px), mal Inset-Hairline
 * und mal `border`, mal Drop-Shadow und mal nicht. Genau das lässt eine Seite
 * unruhig wirken — nicht die einzelne Karte, sondern dass keine zwei gleich
 * gebaut sind.
 *
 * Die Regeln, jetzt an EINER Stelle:
 *   · drei Größen, drei feste Radien — lead 20, row 16, tile 14
 *   · EINE Kante: die 1px-Inset-Hairline. Kein äußerer Schatten.
 *   · Tiefe kommt von INNEN: ein radialer Glow in der Farbe des Inhalts
 *   · Aufbau immer gleich: Eyebrow → Überschrift → Inhalt
 *
 * `tone` ist ein Hex (#RRGGBB) oder ein „r,g,b"-Tripel; ohne Angabe das
 * neutrale Violett.
 */
export type VelaCardSize = "lead" | "row" | "tile";

const RADIUS: Record<VelaCardSize, string> = { lead: "20px", row: "16px", tile: "14px" };
const PADDING: Record<VelaCardSize, string> = { lead: "p-6", row: "px-4 py-3.5", tile: "p-3.5" };

/** Farbe mit Alpha — nimmt „#A78BFA" wie auch „167,139,250" entgegen. */
export function tint(tone: string | undefined, alpha: number): string {
  const t = tone ?? "167,139,250";
  if (t.startsWith("#")) return `${t}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
  return `rgba(${t},${alpha})`;
}

export function cardSurface(tone?: string, size: VelaCardSize = "row", glow = 0.13): CSSProperties {
  return {
    borderRadius: RADIUS[size],
    background: `radial-gradient(82% 62% at 50% 108%, ${tint(tone, glow)} 0%, transparent 66%), linear-gradient(180deg,#16161F 0%,#12121D 100%)`,
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.13), inset 0 1px 0 rgba(255,255,255,.05)",
  };
}

export interface VelaCardProps {
  size?: VelaCardSize;
  /** Akzentfarbe des Inhalts — färbt Glow, Eyebrow und die Hover-Kante */
  tone?: string;
  /** Fachbegriff / Kategorie — steht klein und oben, nie als Überschrift */
  eyebrow?: ReactNode;
  /** Die Bedeutung — das, was ein Mensch liest */
  title?: ReactNode;
  /** großes Glyph als Hintergrund-Dekoration */
  glyph?: string;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  /** ARIA für aufklappbare Karten */
  expanded?: boolean;
  style?: CSSProperties;
}

export function VelaCard({
  size = "row",
  tone,
  eyebrow,
  title,
  glyph,
  children,
  onClick,
  className = "",
  expanded,
  style,
}: VelaCardProps) {
  const interaktiv = !!onClick;
  const inhalt = (
    <>
      {glyph && (
        <span
          aria-hidden
          className={`pointer-events-none absolute -right-2 -top-4 font-glyph leading-none opacity-[0.07] ${size === "lead" ? "text-[92px]" : "text-[46px]"}`}
          style={{ color: tint(tone, 1) }}
        >
          {glyph}
        </span>
      )}
      <div className="relative">
        {eyebrow && (
          <div className="mb-2 font-body text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: tint(tone, 1) }}>
            {eyebrow}
          </div>
        )}
        {title && (
          <div className={`font-body font-semibold text-txt ${size === "lead" ? "text-h4 leading-[1.24]" : size === "row" ? "text-[17px] leading-[1.3]" : "text-[15px] leading-[1.3]"}`}>
            {title}
          </div>
        )}
        {children}
      </div>
    </>
  );

  const klassen = `relative overflow-hidden text-left ${PADDING[size]} ${
    interaktiv ? "transition duration-300 hover:-translate-y-0.5 active:scale-[0.995]" : ""
  } ${className}`;
  const flaeche = { ...cardSurface(tone, size), ...style };

  if (!interaktiv) return <div className={klassen} style={flaeche}>{inhalt}</div>;
  return (
    <button type="button" onClick={onClick} aria-expanded={expanded} className={`${klassen} w-full`} style={flaeche}>
      {inhalt}
    </button>
  );
}
