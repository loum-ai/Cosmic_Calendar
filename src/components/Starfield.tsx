import { useMemo } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Neutral, understated starfield — plain white stars on anthracite, no colored
 * glow. Two layers drift very slowly in opposite directions (subtle parallax)
 * via Framer Motion, giving the sky quiet life without spectacle. Motion is
 * fully disabled under prefers-reduced-motion. Deterministic via a seeded RNG
 * so the field never reshuffles on re-render.
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
  glow: boolean;
}

function makeStars(seed: number, count: number, min: number, max: number): Star[] {
  const rnd = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    left: `${(rnd() * 100).toFixed(2)}%`,
    top: `${(rnd() * 100).toFixed(2)}%`,
    size: +(rnd() * (max - min) + min).toFixed(2),
    dur: +(rnd() * 4 + 4).toFixed(1),
    delay: +(rnd() * 5).toFixed(1),
    glow: rnd() > 0.7,
  }));
}

function Layer({
  stars,
  drift,
  duration,
  opacity,
  parallax,
  reduce,
}: {
  stars: Star[];
  drift: [number, number];
  duration: number;
  opacity: number;
  parallax: import("framer-motion").MotionValue<number>;
  reduce: boolean | null;
}) {
  return (
    // outer: subtle scroll parallax (background trails the content)
    <motion.div className="absolute inset-[-8%]" style={{ opacity, y: reduce ? 0 : parallax }}>
      {/* inner: very slow ambient drift */}
      <motion.div
        className="absolute inset-0"
        animate={reduce ? undefined : { x: [0, drift[0], 0], y: [0, drift[1], 0] }}
        transition={reduce ? undefined : { duration, ease: "easeInOut", repeat: Infinity }}
      >
      {stars.map((s, i) => (
        <span
          key={i}
          className={reduce ? "absolute rounded-full bg-white" : "absolute rounded-full bg-white animate-twinkle"}
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            boxShadow: s.glow ? "0 0 4px rgba(255,255,255,0.55)" : undefined,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      </motion.div>
    </motion.div>
  );
}

export function Starfield() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  // background trails the content on scroll — subtle, layered parallax
  const farY = useTransform(scrollY, [0, 1200], [0, -28]);
  const nearY = useTransform(scrollY, [0, 1200], [0, -64]);
  // far, faint layer + nearer, brighter layer — drift in opposite directions
  const far = useMemo(() => makeStars(7, 64, 0.5, 1.3), []);
  const near = useMemo(() => makeStars(42, 28, 1.2, 2.3), []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Layer stars={far} drift={[12, -9]} duration={130} opacity={0.42} parallax={farY} reduce={reduce} />
      <Layer stars={near} drift={[-16, 11]} duration={95} opacity={0.72} parallax={nearY} reduce={reduce} />
    </div>
  );
}
