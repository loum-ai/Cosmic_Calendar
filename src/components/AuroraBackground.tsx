import { Starfield } from "./Starfield";

/**
 * Deep-space backdrop — ONE restrained ambient glow (violet upper-left,
 * faint emerald lower-right), like the prototype. A subtle feTurbulence
 * smoke layer adds photographic wisp without the loud per-card blobs.
 * Identical on every screen.
 */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#08060f]">
      {/* base */}
      <div className="absolute inset-0 bg-[#08060f]" />
      {/* ambient violet, upper-left — the single key light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_56%_at_8%_-4%,rgba(96,40,180,0.42),transparent_60%)]" />
      {/* faint emerald, lower-right */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_104%,rgba(10,140,104,0.26),transparent_62%)]" />

      {/* photographic smoke — feTurbulence wisp, very subtle */}
      <svg
        className="absolute -inset-[20%] h-[140%] w-[140%] opacity-[0.28] mix-blend-screen"
        style={{ filter: "blur(8px) saturate(1.3)", animation: "velaNebulaDrift 44s ease-in-out infinite alternate" }}
        preserveAspectRatio="none"
      >
        <filter id="velaSmoke">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.017" numOctaves="3" seed="7" stitchTiles="stitch" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.5  0 0 0 0 0.28  0 0 0 0 0.95  0 0 0 1.05 -0.42"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#velaSmoke)" />
      </svg>

      {/* edge vignette — crushes corners for contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_50%,transparent_55%,rgba(4,2,9,0.7)_100%)]" />

      <Starfield />
    </div>
  );
}
