/**
 * Design tokens as JS constants, for use in inline styles / SVG / canvas
 * where Tailwind classes don't reach. Mirrors tailwind.config.ts.
 */
export const COLORS = {
  space: "#111019",
  space2: "#1A1829",
  ink: "#F8F7F2",
  inkSoft: "rgba(238,245,248,0.80)",
  violet: "#7896FF",
  cyan: "#20F0D0",
  mint: "#20F0D0",
  lilac: "#97B5FF",
  mintSoft: "#7defd6",
  azure: "#5599FF",
  solar: "#FFAC89",
} as const;

/* Aspekt-Töne (cinematic-Konzept): Fluss = mystic, Spannung = solar */
export const TONE_RGB = {
  iris: "120,150,255",
  mystic: "32,240,208",
  solar: "255,172,137",
  azure: "85,153,255",
} as const;

export const PLANET_COLORS: Record<string, string> = {
  sun: "#ffd9a0",
  moon: "#cfe0ff",
  mercury: "#7ab0cc",
  venus: "#00e8c0",
  mars: "#ff5535",
  jupiter: "#f8c050",
  saturn: "#c898f8",
  chiron: "#80c8ff",
  lilith: "#d9a0ff",
  asc: "#c4a6ff",
  node_n: "#9bc0ff",
  node_s: "#9bc0ff",
};

export const CTA_GRADIENT = "linear-gradient(135deg,#5599FF 0%,#7241FF 100%)"; /* --grad-halo */

/** spring-ish easings used across the prototype */
export const EASE = {
  spring: [0.34, 1.56, 0.64, 1] as const,
  smooth: [0.22, 1, 0.36, 1] as const,
};
