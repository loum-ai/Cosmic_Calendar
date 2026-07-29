/**
 * Design tokens as JS constants, for use in inline styles / SVG / canvas
 * where Tailwind classes don't reach. Mirrors tailwind.config.ts.
 */
export const COLORS = {
  space: "#111019", // void-950
  space2: "#1A1829", // void-900
  ink: "#F8F7F2",
  inkSoft: "rgba(238,245,248,0.80)",
  violet: "#A78BFA", // aura-400
  azure: "#5599FF", // azure-400
  solar: "#FFAC89", // solar-400
  // Alt-Namen aus der Zeit vor der Grün/Pink-Entscheidung. Sie zeigen jetzt
  // dorthin, wo ihre Rolle hingewandert ist — die NAMEN stimmen nicht mehr,
  // die Werte schon. Neue Verwendungen nehmen die Namen darunter.
  cyan: "#72C4FF", // war mint · jetzt celestial-300
  mint: "#72C4FF", // war mint · jetzt celestial-300
  mintSoft: "#A9DCFF", // war #7defd6 · jetzt celestial-200
  lilac: "#A78BFA", // war #BBA8FF · jetzt aura-400
} as const;

/* Aspekt-Töne als rgb-Tripel für rgba(). Müssen zu ASPECT_TONE passen. */
export const TONE_RGB = {
  iris: "167,139,250", // aura-400
  mystic: "114,196,255", // celestial-300 — war Mint 32,240,208
  solar: "255,172,137", // solar-400
  azure: "85,153,255", // azure-400
} as const;

/* ────────────────────────────────────────────────────────────────
 * Die Chart-Palette. EINE Quelle — vorher lagen vier im Repo
 * (hier, ChartWheel, ChartExplorer, PrintView) und keine stimmte
 * mit einer anderen überein.
 *
 * Regel: FARBE KODIERT DIE GRUPPE, NICHT DEN EINZELNEN PLANETEN.
 *
 * Grund: loums v6 trennt in der Violett-Familie nur vier Töne
 * sicher voneinander (ΔE ≥ 15), nicht dreizehn. Dreizehn Töne
 * vorzutäuschen hiess, elf davon verwechselbar zu machen — Jupiter
 * und Sonne lagen bei ΔE 2,3, AC und der Fallback bei ΔE 0,9.
 *
 * Den einzelnen Planeten unterscheidet sein GLYPH. Das wird in
 * ChartWheel ohnehin gerendert; die Farbe lag bisher redundant
 * obendrauf. Dritte Achse: gefüllt (Planet) gegen offener Ring
 * (rechnerischer Punkt).
 *
 * Alle Werte aus src/styles/loum/colors.css, geprüft am 2026-07-29.
 * ──────────────────────────────────────────────────────────────── */

/** Die vier Gruppen. Entsprechen PLANET_GROUPS in ChartExplorer. */
export const GROUP_COLORS = {
  persoenlich: "#E8E5F2", // moon-300 — Sonne bis Mars, das tägliche Ich
  sozial: "#A78BFA", // aura-400 — Jupiter, Saturn
  transpersonal: "#72C4FF", // celestial-300 — Uranus, Neptun, Pluto
  punkt: "#DA8FFF", // orchid-400 — Chiron, Lilith, AC, Knoten
  unbekannt: "#ABABBC", // void-300 — neutral, nie Violett
} as const;

const G = GROUP_COLORS;

export const PLANET_COLORS: Record<string, string> = {
  sun: G.persoenlich,
  moon: G.persoenlich,
  mercury: G.persoenlich,
  venus: G.persoenlich,
  mars: G.persoenlich,
  jupiter: G.sozial,
  saturn: G.sozial,
  uranus: G.transpersonal,
  neptune: G.transpersonal,
  pluto: G.transpersonal,
  chiron: G.punkt,
  lilith: G.punkt,
  asc: G.punkt,
  node_n: G.punkt,
  node_s: G.punkt,
};

export const PLANET_FALLBACK = G.unbekannt;

/** Rechnerische Punkte stehen als offener Ring, Planeten gefüllt. */
const PUNKTE = new Set(["chiron", "lilith", "asc", "node_n", "node_s"]);
export const istPunkt = (key: string) => PUNKTE.has(key);

/** Elemente — eine Helligkeitsleiter, nie neben Planeten gezeigt. */
export const ELEMENT_COLORS: string[] = [
  "#F3EEFF", // aura-50   · Feuer
  "#D4C8FF", // aura-200  · Erde
  "#A78BFA", // aura-400  · Luft
  "#6E52D8", // aura-600  · Wasser
];

/** Modalitäten — eigene Rampe, damit die zwei Balkenblöcke sich nicht mischen. */
export const MODE_COLORS: string[] = [
  "#F5C5FF", // orchid-200 · kardinal
  "#DA8FFF", // orchid-400 · fix
  "#A840D8", // orchid-600 · veränderlich
];

/**
 * Aspekte: zwei Farben statt fünf — Fluss gegen Spannung.
 * Welcher Aspekt es genau ist, sagt das Glyph und die Strichart.
 * Mindestdeckkraft 0,55: darunter reissen die Linien WCAG 1.4.11 (3:1).
 */
export const ASPECT_TONE = {
  neutral: "#E8E5F2", // moon-300      · Konjunktion
  fluss: "#72C4FF", // celestial-300 · Sextil, Trigon
  spannung: "#DA8FFF", // orchid-400    · Quadrat, Opposition
} as const;

export const ASPECT_MIN_OPACITY = 0.55;

export const CTA_GRADIENT = "linear-gradient(135deg,#5599FF 0%,#7241FF 100%)"; /* --grad-halo */

/** spring-ish easings used across the prototype */
export const EASE = {
  spring: [0.34, 1.56, 0.64, 1] as const,
  smooth: [0.22, 1, 0.36, 1] as const,
};
