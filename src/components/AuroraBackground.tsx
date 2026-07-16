import { Starfield } from "./Starfield";

/**
 * Atmospheric cosmos backdrop — deep indigo/violet night sky with soft nebula
 * blooms (violet + cool blue), a vignette for depth, and the drifting starfield
 * on top. Cinematic depth, not flat. The mood is a night sky you could fall into.
 */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0a0813]">
      <div className="absolute inset-0 bg-[#0a0813]" />
      {/* violet nebula bloom, upper right */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_82%_6%,rgba(139,92,246,0.22),transparent_60%)]" />
      {/* cool-blue counter bloom, lower left */}
      <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_8%_100%,rgba(70,120,255,0.16),transparent_62%)]" />
      {/* faint magenta depth, center */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_38%,rgba(190,90,220,0.07),transparent_66%)]" />
      {/* vignette = depth toward the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_28%,transparent_40%,rgba(3,2,10,0.85)_100%)]" />
      <Starfield />
    </div>
  );
}
