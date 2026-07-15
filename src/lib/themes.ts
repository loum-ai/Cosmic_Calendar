/**
 * Life-themes — the core mechanic of vela (per the product briefing).
 *
 * It is always the SAME chart. A theme is a *lens*: it decides which positions
 * step into the foreground and in which language they are read. The same Sun in
 * Virgo sounds different under "Berufung" than under "Liebe". One dataset → six
 * highly relevant readings, no six datasets needed.
 *
 * Each theme foregrounds a set of chart factors (planets / houses / points) and
 * carries a `lens` instruction that steers the reading's voice and focus. The
 * generator (theme-reading) uses these to build the 5-level dramaturgy:
 *   1) der rote Faden  2) die Kräfte, narrativ  3) die Spannung
 *   4) die Richtung    5) die persönliche Wahrheit
 */

export interface LifeTheme {
  key: string;
  /** short, human tile label — no astro jargon */
  label: string;
  /** one-line promise shown under the label on the hub */
  teaser: string;
  /** glyph/emoji-free symbol drawn from the chart vocabulary */
  glyph: string;
  accent: string;
  /** planets foregrounded under this lens (by chart key) */
  planets: string[];
  /** houses foregrounded under this lens */
  houses: number[];
  /** points foregrounded (asc, mc, ic, dsc, node_n, node_s, chiron, lilith) */
  points: string[];
  /** voice/focus instruction handed to the generator for this lens */
  lens: string;
}

export const THEMES: LifeTheme[] = [
  {
    key: "berufung",
    label: "Berufung",
    teaser: "Beruf, Rolle in der Welt, Sinn",
    glyph: "♄",
    accent: "#ffce6e",
    planets: ["sun", "saturn"],
    houses: [10, 6, 2],
    points: ["mc", "ic"],
    lens: "Lies das Chart auf die Frage: Wofür bist du gemacht, welche Rolle willst du in der Welt einnehmen, wo liegt Sinn in deiner Arbeit? Sprich über Sichtbarkeit, Verantwortung, Selbstwert im Tun — nicht über Karriere-Taktik.",
  },
  {
    key: "liebe",
    label: "Liebe & Bindung",
    teaser: "Nähe, Partnerschaft, Intimität",
    glyph: "♀",
    accent: "#ff8fb0",
    planets: ["venus", "mars", "moon"],
    houses: [7, 8],
    points: ["dsc"],
    lens: "Lies das Chart auf die Frage: Wie liebst du, wie gehst du Nähe und Bindung ein, was brauchst du in Beziehung? Sprich über Anziehung, Verletzlichkeit, Muster in Partnerschaft — konkret, nicht kitschig.",
  },
  {
    key: "selbst",
    label: "Ich & Selbstwert",
    teaser: "Wer bin ich, was bin ich mir wert",
    glyph: "☉",
    accent: "#ffd9a0",
    planets: ["sun", "jupiter"],
    houses: [1],
    points: ["asc"],
    lens: "Lies das Chart auf die Frage: Wer bist du im Kern, wie trittst du auf, was ist dein Selbstwert? Sprich über Identität, Ausstrahlung, das Verhältnis zu dir selbst.",
  },
  {
    key: "gefuehl",
    label: "Gefühl & Innenwelt",
    teaser: "Wie ich fühle, was mich nährt",
    glyph: "☽",
    accent: "#cfe0ff",
    planets: ["moon", "neptune"],
    houses: [4, 8, 12],
    points: ["ic"],
    lens: "Lies das Chart auf die Frage: Wie fühlst du, was gibt dir Geborgenheit, was spielt sich in deiner Innenwelt ab? Sprich über emotionale Bedürfnisse, Rückzug, das Unbewusste — behutsam und tief.",
  },
  {
    key: "wandel",
    label: "Wandel & Tiefe",
    teaser: "Krisen, Transformation, das Verborgene",
    glyph: "♇",
    accent: "#c898f8",
    planets: ["pluto", "chiron"],
    houses: [8],
    points: ["chiron"],
    lens: "Lies das Chart auf die Frage: Wo wandelst du dich durch Krisen, was ist deine verletzliche Gabe, was liegt im Verborgenen? Sprich über Transformation, Macht, Heilung — schonungslos ehrlich, aber tragend.",
  },
  {
    key: "weg",
    label: "Weg & Bestimmung",
    teaser: "Wohin führt mein Leben",
    glyph: "☊",
    accent: "#9bc0ff",
    planets: ["chiron"],
    houses: [],
    points: ["node_n", "node_s"],
    lens: "Lies das Chart auf die Frage: Wohin führt dein Lebensweg, was willst du entwickeln, was darfst du loslassen? Sprich über Wachstumsrichtung entlang der Mondknoten-Achse — als Einladung, nicht als Schicksal.",
  },
];

export const themeByKey = (k: string) => THEMES.find((t) => t.key === k) ?? null;
