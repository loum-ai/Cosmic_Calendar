import { Starfield } from "./Starfield";

/**
 * Deep-space backdrop — true near-black with depth from a strong vignette
 * and crisp stars, NOT a blurry violet haze. One tight, very low cool glow
 * up top, nothing mushy.
 */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050509]">
      <div className="absolute inset-0 bg-[#050509]" />
      {/* one tight, restrained cool glow up top — controlled, not a wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_46%_26%_at_50%_-6%,rgba(116,96,200,0.10),transparent_55%)]" />
      {/* strong vignette = depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_110%_85%_at_50%_28%,transparent_42%,rgba(0,0,0,0.9)_100%)]" />
      <Starfield />
    </div>
  );
}
