import { Starfield } from "./Starfield";

/**
 * Deep-space backdrop — ONE restrained ambient glow (violet upper-left,
 * faint emerald lower-right), like the prototype. A subtle feTurbulence
 * smoke layer adds photographic wisp without the loud per-card blobs.
 * Identical on every screen.
 */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#06060F]">
      {/* deep-space near-black anthracite base */}
      <div className="absolute inset-0 bg-[#06060F]" />
      {/* violet wash bleeding down from above the hero */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,80,255,0.18),transparent_60%)]" />
      {/* faint teal pool, lower-right — the secondary accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_82%,rgba(45,212,191,0.07),transparent_55%)]" />

      {/* whisper of photographic smoke, cool violet */}
      <svg
        className="absolute -inset-[20%] h-[140%] w-[140%] opacity-[0.12] mix-blend-screen"
        style={{ filter: "blur(10px) saturate(1.1)", animation: "velaNebulaDrift 52s ease-in-out infinite alternate" }}
        preserveAspectRatio="none"
      >
        <filter id="velaSmoke">
          <feTurbulence type="fractalNoise" baseFrequency="0.013 0.02" numOctaves="3" seed="7" stitchTiles="stitch" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.55  0 0 0 0 0.4  0 0 0 0 0.95  0 0 0 1.0 -0.55"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#velaSmoke)" />
      </svg>

      {/* gentle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_95%_at_50%_36%,transparent_56%,rgba(3,3,8,0.72)_100%)]" />

      <Starfield />
    </div>
  );
}
