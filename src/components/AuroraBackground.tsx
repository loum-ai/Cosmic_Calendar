import { Starfield } from "./Starfield";

/**
 * Backdrop — neutral anthracite (no blue/violet cast) with quiet depth from a
 * single very soft neutral lift up top and a gentle vignette. The mood lives in
 * the drifting starfield, not in a colored haze. Restraint over spectacle.
 */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0d0d0d]">
      <div className="absolute inset-0 bg-[#0d0d0d]" />
      {/* one barely-there neutral lift up top — depth, not color */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_28%_at_50%_-8%,rgba(255,255,255,0.04),transparent_60%)]" />
      {/* soft vignette = depth toward the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_115%_90%_at_50%_30%,transparent_46%,rgba(0,0,0,0.85)_100%)]" />
      <Starfield />
    </div>
  );
}
