/**
 * Vela sample data — ported verbatim from the Claude Design prototype
 * (vela.dc.html). Hardcoded birth chart for "Amelie Sturm" (14.03.1996).
 * All copy in plain German ("Klartext"), no astro jargon without explanation.
 *
 * A later phase swaps this for real ephemeris computation; the shapes stay.
 */

export interface Planet {
  key: string;
  name: string;
  glyph: string;
  lon: number;
  txt: string;
  house?: number;
  retro?: boolean;
}

export interface AspectDef {
  a: number;
  type: string;
  g: string;
  c: string;
  w: number;
  nat: string;
  verb: string;
  plain: string;
}

export interface Aspect {
  key: string;
  A: Planet;
  B: Planet;
  def: AspectDef;
  orb: number;
}

export const PROFILE = {
  name: "Laura",
  birth: "7. September 1987 · 18:50 · Starnberg",
  memberSince: "Wassermann-Aszendent · 48°00′ N · 11°21′ E",
};

// Aszendent Wassermann 21°00′, MC Schütze 11°36′
export const ASC = 321.0;
export const MC = 251.6;

// Placidus house cusps (longitudes), house 1..12 — from the real chart
export const CUSPS = [321.0, 16.05, 49.4, 71.6, 90.43, 110.77, 141.0, 196.05, 229.4, 251.6, 270.43, 290.77];

export const CHART: Planet[] = [
  { key: "sun", name: "Sonne", glyph: "☉", lon: 164.52, house: 7, txt: "Dein Kern wirkt über das Gegenüber — Klarheit, Sorgfalt, ein Dienst an der Beziehung." },
  { key: "moon", name: "Mond", glyph: "☽", lon: 343.73, house: 1, txt: "Dein Gefühl ist durchlässig und sofort sichtbar — du spürst Räume, bevor du sie betrittst." },
  { key: "mercury", name: "Merkur", glyph: "☿", lon: 180.2, house: 7, txt: "Du denkst in Abwägung und Dialog — Sprache ist deine Brücke zum anderen." },
  { key: "venus", name: "Venus", glyph: "♀", lon: 168.73, house: 7, txt: "Du liebst genau und im Detail — Zuneigung zeigt sich bei dir als Sorgfalt." },
  { key: "mars", name: "Mars", glyph: "♂", lon: 160.1, house: 7, txt: "Deine Kraft arbeitet präzise und im Miteinander, selten im Alleingang." },
  { key: "jupiter", name: "Jupiter", glyph: "♃", lon: 29.13, house: 2, retro: true, txt: "Wachstum durch mutiges Anfangen — und über das Vertrauen in den eigenen Wert." },
  { key: "saturn", name: "Saturn", glyph: "♄", lon: 254.83, house: 10, txt: "Deine Aufgabe: aus Überzeugung Struktur bauen — sichtbar im Beruf." },
  { key: "uranus", name: "Uranus", glyph: "♅", lon: 262.73, house: 10, txt: "Dein Eigensinn zeigt sich im Beruf — unabhängig, vorausdenkend, ungern geführt." },
  { key: "neptune", name: "Neptun", glyph: "♆", lon: 275.25, house: 11, retro: true, txt: "Deine Träume binden sich an Gemeinschaft und Zukunft." },
  { key: "pluto", name: "Pluto", glyph: "♇", lon: 217.87, house: 8, txt: "Wandlung im Tiefen — Macht, Bindung, Regeneration." },
  { key: "chiron", name: "Chiron", glyph: "⚷", lon: 88.25, house: 4, txt: "Deine wunde Stelle liegt in Herkunft und Verstandenwerden — und genau dort heilst du andere." },
  { key: "lilith", name: "Lilith", glyph: "⚸", lon: 122.27, house: 6, txt: "Dein Ungezähmtes will im Alltag gesehen werden — auf deine eigene Art." },
];

export const NODES: Planet[] = [
  { key: "node_n", name: "Aufsteigender Knoten", glyph: "☊", lon: 3.27, house: 1, retro: true, txt: "" },
  { key: "node_s", name: "Absteigender Knoten", glyph: "☋", lon: 183.27, house: 7, retro: true, txt: "" },
];

export const SN = ["Widder", "Stier", "Zwillinge", "Krebs", "Löwe", "Jungfrau", "Waage", "Skorpion", "Schütze", "Steinbock", "Wassermann", "Fische"];
export const SG = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

export const HOUSE = ["Ich & Auftreten", "Besitz & Werte", "Denken & Austausch", "Wurzeln & Zuhause", "Schöpfung & Liebe", "Alltag & Gesundheit", "Partnerschaft", "Wandel & Tiefe", "Sinn & Ferne", "Beruf & Berufung", "Freunde & Zukunft", "Rückzug & Seele"];

export const SIGNMEAN = ["Feuer · Aufbruch & Mut", "Erde · Beständigkeit & Genuss", "Luft · Neugier & Austausch", "Wasser · Gefühl & Geborgenheit", "Feuer · Ausdruck & Stolz", "Erde · Genauigkeit & Dienst", "Luft · Harmonie & Ausgleich", "Wasser · Tiefe & Wandlung", "Feuer · Weite & Sinn", "Erde · Struktur & Ziel", "Luft · Freiheit & Idee", "Wasser · Hingabe & Traum"];

export const SIGNWHAT = ["Widder ist mutig, direkt und voller Tatendrang — fängt gern Neues an.", "Stier ist ruhig, beständig und genussvoll — mag Sicherheit und Schönes.", "Zwillinge sind neugierig, gesprächig und flink im Kopf.", "Krebs ist gefühlvoll, fürsorglich und sucht Geborgenheit.", "Löwe ist herzlich, stolz und will gesehen werden.", "Jungfrau ist genau, hilfsbereit und liebt Ordnung.", "Waage sucht Harmonie, Fairness und das Miteinander.", "Skorpion ist tief, intensiv und geht den Dingen auf den Grund.", "Schütze ist freiheitsliebend, optimistisch und sucht den Sinn.", "Steinbock ist zielstrebig, verantwortungsvoll und ausdauernd.", "Wassermann ist eigenständig, ideenreich und denkt voraus.", "Fische sind einfühlsam, träumerisch und mit allem verbunden."];

export const HOUSEWHAT = ["Wie du wirkst und auftrittst — dein erster Eindruck.", "Geld, Besitz und was dir wirklich wertvoll ist.", "Reden, Lernen, Alltag und nahe Kontakte.", "Zuhause, Familie und woher du kommst.", "Kreativität, Spiel, Romantik und Selbstausdruck.", "Arbeit, Gewohnheiten und Gesundheit.", "Partnerschaft und enge Beziehungen auf Augenhöhe.", "Tiefe Bindung, Wandel und gemeinsame Werte.", "Reisen, Sinn, Glauben und der weite Horizont.", "Beruf, Berufung und was du in der Welt erreichst.", "Freunde, Gruppen und Zukunftsträume.", "Rückzug, Innenwelt und das Unbewusste."];

export const THEME: Record<string, string> = {
  sun: "Dein Wesenskern",
  moon: "Dein Gefühl",
  mercury: "Dein Denken",
  venus: "Deine Art zu lieben",
  mars: "Deine Energie",
  jupiter: "Dein Wachstum",
  saturn: "Deine Disziplin",
};

export const ASPDEF: AspectDef[] = [
  { a: 0, type: "Konjunktion", g: "☌", c: "#e7dcff", w: 1.2, nat: "vereint", verb: "verschmelzen zu einer Kraft", plain: "Zwei Kräfte stehen eng zusammen und wirken wie eine." },
  { a: 60, type: "Sextil", g: "⚹", c: "#4fd6ef", w: 1, nat: "Chance", verb: "unterstützen sich, wenn du es zulässt", plain: "Eine leichte Chance — sie wirkt, wenn du sie nutzt." },
  { a: 90, type: "Quadrat", g: "□", c: "#aa5cff", w: 1, nat: "Spannung", verb: "reiben sich — eine Spannung, die dich antreibt", plain: "Reibung, die Druck macht — und dich wachsen lässt." },
  { a: 120, type: "Trigon", g: "△", c: "#2fde8c", w: 1, nat: "Fluss", verb: "fließen mühelos zusammen", plain: "Fließt mühelos — ein eingebautes Talent." },
  { a: 180, type: "Opposition", g: "☍", c: "#ff8fb0", w: 1.1, nat: "Balance", verb: "ziehen in Gegenrichtung und suchen Balance", plain: "Zwei Pole, die nach Balance suchen." },
];

export const PINFO: Record<string, { role: string; what: string }> = {
  sun: { role: "dein Kern", what: "Die Sonne ist dein innerster Antrieb — wer du im Grunde bist und was dich lebendig macht." },
  moon: { role: "dein Gefühl", what: "Der Mond ist deine Gefühlswelt — was du brauchst, um dich sicher und geborgen zu fühlen." },
  mercury: { role: "dein Denken", what: "Merkur steht fürs Denken und Reden — wie du verstehst und dich mitteilst." },
  venus: { role: "deine Liebe", what: "Venus zeigt, was du schön findest und wie du liebst, genießt und dich verbindest." },
  mars: { role: "dein Antrieb", what: "Mars ist deine Energie und dein Mut — wie du handelst und dich durchsetzt." },
  jupiter: { role: "dein Wachstum", what: "Jupiter steht für Wachstum, Vertrauen und Sinn — wo du dich weitest." },
  saturn: { role: "deine Struktur", what: "Saturn ist Disziplin und Reife — wo du lernst, dranbleibst und stabil wirst." },
  uranus: { role: "dein Eigensinn", what: "Uranus ist die Kraft des Erwachens — Originalität, Freiheit, plötzliche Wendung. Wo du anders bist und es sein darfst." },
  neptune: { role: "deine Sehnsucht", what: "Neptun steht für Fantasie, Spiritualität und Auflösung — das, was sich den Sinnen entzieht und in Bildern spricht." },
  pluto: { role: "deine Wandlung", what: "Pluto ist Transformation, Tiefe und Macht — was stirbt, damit Neues entstehen kann." },
  asc: { role: "dein Auftreten", what: "Der Aszendent ist, wie du auf andere wirkst — dein erster Eindruck nach außen." },
  chiron: { role: "deine Wunde & Gabe", what: "Chiron ist die verletzliche Stelle, an der du Schmerz kennst — und gerade dadurch andere heilen und verstehen kannst." },
  lilith: { role: "dein Wildes", what: "Lilith (der schwarze Mond) steht für das Ungezähmte und Tabuisierte in dir — wo du dich nicht anpassen willst." },
  node_n: { role: "deine Richtung", what: "Der aufsteigende Mondknoten zeigt, wohin du dich entwickelst — dein Wachstumsweg in diesem Leben." },
  node_s: { role: "dein Vertrautes", what: "Der absteigende Mondknoten ist das Vertraute, das dir leichtfällt — und das du nach und nach loslassen darfst." },
};

export interface Transit {
  tg: string;
  nk: string;
  c: string;
  title: string;
  txt: string;
  impact: "+" | "-" | "~";
}

export const TRANSITS: Transit[] = [
  { tg: "♃", nk: "sun", c: "#2fde8c", title: "Jupiter im Trigon zu deiner Sonne", txt: "Eine offene, großzügige Phase — vieles fällt dir gerade leichter zu. Ein guter Moment, etwas zu beginnen, das du dir lange vorgenommen hast.", impact: "+" },
  { tg: "♄", nk: "mars", c: "#aa5cff", title: "Saturn im Quadrat zu deinem Mars", txt: "Dein Tatendrang trifft auf Widerstand und Verzögerung. Nicht dagegen anrennen — geduldig dranbleiben zahlt sich jetzt mehr aus als Tempo.", impact: "-" },
  { tg: "♀", nk: "moon", c: "#e7dcff", title: "Venus auf deinem Mond", txt: "Ein weicher, verbindender Tag. Nähe, Versöhnung und kleine Schönheiten tun dir heute besonders gut.", impact: "+" },
];

export const COSMIC_EVENTS = [
  { icon: "☽", label: "Neumond in Krebs", sub: "21. Juni · Emotionaler Neuanfang", impact: "+", txt: "Idealer Moment, um etwas loszulassen und neu zu setzen." },
  { icon: "☿", label: "Merkur rückläufig", sub: "18.–Jul 11. · Kommunikation langsam", impact: "-", txt: "Verträge & wichtige Gespräche lieber verschieben." },
  { icon: "♃", label: "Jupiter in Zwillinge", sub: "Bis Nov · Wissen & Reisen", impact: "+", txt: "Dein Geist öffnet sich — Kurse und Reisen bringen dir jetzt viel." },
  { icon: "♅", label: "Uranus nah am Mond", sub: "23. Juni · Überraschungen", impact: "~", txt: "Unerwartetes trifft dein Gefühlsleben — bleib offen." },
];

export const IMPULSE = {
  glyph: "♓",
  sign: "Fische",
  title: "Vertraue der Weite",
  txt: "Dein Geist ist heute größer als deine Grenzen. Lass die Unschärfe sein — sie trägt dich weiter als jede Antwort.",
  sub: "Jupiter weitet deinen Horizont · Neptun löst die Konturen auf",
};

// ── derived helpers ──────────────────────────────────────────────

export function signName(lon: number): string {
  return SN[Math.floor((((lon % 360) + 360) % 360) / 30)];
}

export function houseOf(lon: number): number {
  return Math.floor(((((lon - ASC) % 360) + 360) % 360) / 30) + 1;
}

export function computeAspects(): Aspect[] {
  const orb = 6;
  const out: Aspect[] = [];
  for (let i = 0; i < CHART.length; i++) {
    for (let j = i + 1; j < CHART.length; j++) {
      let d = Math.abs(CHART[i].lon - CHART[j].lon);
      d = Math.min(d, 360 - d);
      for (const def of ASPDEF) {
        if (Math.abs(d - def.a) <= orb) {
          out.push({ key: CHART[i].key + "_" + CHART[j].key, A: CHART[i], B: CHART[j], def, orb: Math.abs(d - def.a) });
          break;
        }
      }
    }
  }
  return out;
}

/** Plain-language summary of the chart, used as context for the Q&A. */
export function chartFacts(): string {
  const pl = CHART.map((p) => `${p.name} in ${signName(p.lon)} (Haus ${houseOf(p.lon)})`).join("; ");
  const asp = computeAspects().map((a) => `${a.A.name} ${a.def.type} ${a.B.name}`).join("; ");
  return `Aszendent ${signName(ASC)}. ${pl}. Verbindungen: ${asp}.`;
}
