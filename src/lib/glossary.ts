/**
 * Klartext glossary — every astro term the user objected to ("nicht
 * astrologie sprache") maps to a plain-German equivalent. The Klartext
 * toggle swaps `term` -> `plain` app-wide.
 */
export interface GlossaryEntry {
  term: string;
  plain: string;
  short: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  aszendent: { term: "Aszendent", plain: "Auftreten", short: "Wie du auf andere wirkst — dein erster Eindruck." },
  transit: { term: "Transit", plain: "Was die Planeten heute in deinem Chart auslösen", short: "Wie die Planeten gerade dein Geburtsbild berühren." },
  synastrie: { term: "Synastrie", plain: "Wie ihr zusammenklingt", short: "Der Vergleich zweier Geburtsbilder." },
  konjunktion: { term: "Konjunktion", plain: "eng zusammen", short: "Zwei Kräfte wirken wie eine." },
  sextil: { term: "Sextil", plain: "leichte Chance", short: "Wirkt, wenn du sie nutzt." },
  quadrat: { term: "Quadrat", plain: "Spannung", short: "Reibung, die dich antreibt." },
  trigon: { term: "Trigon", plain: "müheloser Fluss", short: "Ein eingebautes Talent." },
  opposition: { term: "Opposition", plain: "Gegenpole", short: "Zwei Pole, die Balance suchen." },
  mondknoten: { term: "Mondknoten", plain: "dein Weg", short: "Woher du kommst und wohin du wächst." },
  aspekt: { term: "Aspekt", plain: "Verbindung", short: "Wie zwei Kräfte miteinander sprechen." },
  haus: { term: "Haus", plain: "Lebensbereich", short: "Ein Bereich, in dem dein Leben geschieht." },
};

/** Translate a term to plain language when Klartext mode is on. */
export function klartext(term: string, on: boolean): string {
  if (!on) return term;
  const e = GLOSSARY[term.toLowerCase()];
  return e ? e.plain : term;
}
