/**
 * A refined astrological glyph badge — a thin luminous ring with a crisp
 * glyph. Replaces the cheap-looking gradient "orbs". Elegant, not a toy.
 */
export function GlyphBadge({ glyph, size = 40, className }: { glyph: string; size?: number; className?: string }) {
  return (
    <span
      className={"vela-glyph flex shrink-0 items-center justify-center rounded-full " + (className ?? "")}
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 34% 28%, rgba(196,181,255,0.20), rgba(255,255,255,0.025) 72%)",
        border: "1px solid rgba(184,164,255,0.3)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 3px 10px -3px rgba(0,0,0,0.55)",
        color: "#e2dbff",
        fontSize: size * 0.44,
      }}
    >
      {glyph}
    </span>
  );
}
