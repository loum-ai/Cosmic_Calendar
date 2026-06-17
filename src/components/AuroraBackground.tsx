import { Starfield } from "./Starfield";

/**
 * Deep-space backdrop — ONE restrained ambient glow (violet upper-left,
 * faint emerald lower-right), like the prototype. A subtle feTurbulence
 * smoke layer adds photographic wisp without the loud per-card blobs.
 * Identical on every screen.
 */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#070814]">
      {/* deep cool indigo base */}
      <div className="absolute inset-0 bg-[#070814]" />
      {/* luminous amethyst glow, top — airy and bright (loum.ai) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_46%_at_22%_-8%,rgba(140,90,255,0.5),transparent_60%)]" />
      {/* cool cyan/ice breath, lower-right */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_56%_42%_at_104%_104%,rgba(70,160,255,0.3),transparent_62%)]" />
      {/* soft ice halo, centre — keeps the field luminous, not flat black */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_34%_at_60%_44%,rgba(150,170,255,0.12),transparent_70%)]" />

      {/* photographic smoke — cool violet/blue wisp */}
      <svg
        className="absolute -inset-[20%] h-[140%] w-[140%] opacity-[0.2] mix-blend-screen"
        style={{ filter: "blur(9px) saturate(1.3)", animation: "velaNebulaDrift 48s ease-in-out infinite alternate" }}
        preserveAspectRatio="none"
      >
        <filter id="velaSmoke">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="3" seed="7" stitchTiles="stitch" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 1.0  0 0 0 1.0 -0.5"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#velaSmoke)" />
      </svg>

      {/* gentle edge vignette — airy, not crushing */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_92%_at_50%_38%,transparent_54%,rgba(3,4,12,0.7)_100%)]" />

      <Starfield />
    </div>
  );
}
