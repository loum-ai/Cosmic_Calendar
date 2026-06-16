import { Starfield } from "./Starfield";

/**
 * Deep-space backdrop — ONE restrained ambient glow (violet upper-left,
 * faint emerald lower-right), like the prototype. A subtle feTurbulence
 * smoke layer adds photographic wisp without the loud per-card blobs.
 * Identical on every screen.
 */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#040208]">
      {/* true-black base */}
      <div className="absolute inset-0 bg-[#040208]" />
      {/* contained amethyst glow, top-left corner only — most of the screen stays black */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_48%_36%_at_0%_-8%,rgba(150,58,224,0.55),transparent_52%)]" />
      {/* deep magenta-indigo breath, bottom-right corner (no muddy green) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_42%_32%_at_104%_106%,rgba(108,40,190,0.32),transparent_56%)]" />

      {/* photographic smoke — feTurbulence wisp, only near the glow, very subtle */}
      <svg
        className="absolute -inset-[20%] h-[140%] w-[140%] opacity-[0.18] mix-blend-screen"
        style={{ filter: "blur(9px) saturate(1.35)", animation: "velaNebulaDrift 48s ease-in-out infinite alternate" }}
        preserveAspectRatio="none"
      >
        <filter id="velaSmoke">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="3" seed="7" stitchTiles="stitch" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.62  0 0 0 0 0.20  0 0 0 0 0.90  0 0 0 1.0 -0.46"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#velaSmoke)" />
      </svg>

      {/* strong edge vignette — crush corners to true black for contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_110%_80%_at_50%_42%,transparent_42%,rgba(2,1,6,0.85)_100%)]" />

      <Starfield />
    </div>
  );
}
