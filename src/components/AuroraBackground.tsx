import { Starfield } from "./Starfield";

/**
 * Atmospheric backdrop — deep steel-teal night sky (byheart-matched) with soft
 * cyan/teal nebula blooms, a faint warm accent (like the glow inside the hero),
 * a vignette for cinematic depth, and the drifting starfield on top.
 */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#111019]">
      <div className="absolute inset-0 bg-[#111019]" />
      {/* cool cyan bloom, upper right */}
      <div className="absolute inset-0 bg-[radial-gradient(58%_45%_at_84%_4%,rgba(120,150,255,0.20),transparent_62%)]" />
      {/* steel-teal depth, lower left */}
      <div className="absolute inset-0 bg-[radial-gradient(58%_48%_at_6%_100%,rgba(46,150,190,0.18),transparent_64%)]" />
      {/* faint warm accent, center — the hero's inner glow */}
      <div className="absolute inset-0 bg-[radial-gradient(46%_36%_at_54%_46%,rgba(255,140,120,0.06),transparent_66%)]" />
      {/* vignette = depth toward the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_28%,transparent_40%,rgba(3,10,14,0.86)_100%)]" />
      <Starfield />
    </div>
  );
}
