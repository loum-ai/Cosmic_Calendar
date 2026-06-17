import { Starfield } from "./Starfield";

/**
 * Deep-space backdrop — ONE restrained ambient glow (violet upper-left,
 * faint emerald lower-right), like the prototype. A subtle feTurbulence
 * smoke layer adds photographic wisp without the loud per-card blobs.
 * Identical on every screen.
 */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0b0b13]">
      {/* near-neutral dark charcoal-navy base (loum.ai) */}
      <div className="absolute inset-0 bg-[#0b0b13]" />
      {/* one soft cool halo, top-centre behind the hero orb — restrained */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_56%_30%_at_50%_6%,rgba(126,96,214,0.34),transparent_60%)]" />
      {/* very faint cool wash, lower — keeps it from going dead flat */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_120%,rgba(60,70,130,0.18),transparent_64%)]" />

      {/* whisper of photographic smoke, cool/neutral */}
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
            values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.85  0 0 0 1.0 -0.55"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#velaSmoke)" />
      </svg>

      {/* gentle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_95%_at_50%_36%,transparent_56%,rgba(4,4,9,0.68)_100%)]" />

      <Starfield />
    </div>
  );
}
