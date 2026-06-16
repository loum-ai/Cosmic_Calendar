import { useMemo } from "react";

/**
 * Data-driven twinkling starfield (instead of 30 hand-written divs).
 * Deterministic via a seeded RNG so it doesn't reshuffle on every render.
 */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Star {
  left: string;
  top: string;
  size: number;
  dur: number;
  delay: number;
  glow: string;
}

const GLOWS = [
  "0 0 4px #fff",
  "0 0 7px rgba(196,166,255,0.9)",
  "0 0 5px rgba(120,220,200,0.8)",
  "0 0 6px rgba(80,210,180,0.7)",
  "",
];

export function Starfield() {
  const stars = useMemo<Star[]>(() => {
    const rnd = mulberry32(42);
    return Array.from({ length: 46 }, () => ({
      left: `${(rnd() * 96 + 2).toFixed(1)}%`,
      top: `${(rnd() * 92 + 2).toFixed(1)}%`,
      size: +(rnd() * 2.5 + 1).toFixed(1),
      dur: +(rnd() * 3.5 + 3.5).toFixed(1),
      delay: +(rnd() * 3).toFixed(1),
      glow: GLOWS[Math.floor(rnd() * GLOWS.length)],
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            boxShadow: s.glow || undefined,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      {/* a single comet streak */}
      <span
        className="absolute h-[1.5px] w-20 origin-left rounded-sm"
        style={{
          left: "6%",
          top: "16%",
          transform: "rotate(42deg)",
          background: "linear-gradient(90deg,transparent,rgba(196,166,255,0.6))",
          animation: "velaComet 14s ease-in-out infinite 5s",
        }}
      />
    </div>
  );
}
