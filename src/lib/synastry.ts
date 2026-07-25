import type { Planet } from "./data";

/**
 * Real synastry — cross-aspects between two charts. The "Resonanz" is the
 * share of harmonious contacts among the personal-planet pairs, shown together
 * with the raw counts so the number is always sourced and honest (never a
 * made-up score).
 */
const ASP = [
  { type: "Konjunktion", angle: 0, orb: 7, harmon: 0 },
  { type: "Sextil", angle: 60, orb: 4, harmon: 1 },
  { type: "Quadrat", angle: 90, orb: 6, harmon: -1 },
  { type: "Trigon", angle: 120, orb: 6, harmon: 1 },
  { type: "Opposition", angle: 180, orb: 7, harmon: -1 },
];
const norm = (d: number) => ((d % 360) + 360) % 360;
const PERSONAL = ["sun", "moon", "mercury", "venus", "mars"];

export interface CrossHit {
  aKey: string; aName: string; aGlyph: string;
  bKey: string; bName: string; bGlyph: string;
  type: string; orb: number; harmon: number;
}
/**
 * Genitiv eines Vornamens. Namen auf s/ß/x/z bekommen im Deutschen nur einen
 * Apostroph — sonst stand da „Jonass Merkur".
 */
export function possessive(name: string): string {
  const n = (name ?? "").trim();
  if (!n) return "";
  return /[sßxzS]$/.test(n) ? `${n}'` : `${n}s`;
}

/**
 * Ein Berührungspunkt zwischen zwei Charts.
 *  key   — der Planet, der das Thema trägt (die Karte zeigt sein Foto)
 *  fakt  — die nackte Beobachtung: „Deine Mars Trigon Darius' Sonne (1.7°)"
 *  text  — Schablone, nur noch Rückfallebene solange die Deutung lädt
 *  Die Rohwerte stehen dabei, damit der Deutungs-Auftrag präzise wird.
 */
export interface Touchpoint {
  key: string; glyph: string; title: string;
  fakt: string; text: string;
  aName: string; bName: string; type: string; orb: number; harmon: number;
}
export interface SynResult {
  hits: CrossHit[];
  resonance: number;
  harmonious: number;
  challenging: number;
  total: number;
  touchpoints: Touchpoint[];
}

export function synastry(a: Planet[], b: Planet[], partnerName: string): SynResult {
  const hits: CrossHit[] = [];
  for (const pa of a)
    for (const pb of b) {
      let diff = Math.abs(norm(pa.lon) - norm(pb.lon));
      if (diff > 180) diff = 360 - diff;
      for (const x of ASP) {
        const orb = Math.abs(diff - x.angle);
        if (orb <= x.orb) {
          hits.push({ aKey: pa.key, aName: pa.name, aGlyph: pa.glyph, bKey: pb.key, bName: pb.name, bGlyph: pb.glyph, type: x.type, orb: Math.round(orb * 10) / 10, harmon: x.harmon });
          break;
        }
      }
    }

  const sig = hits.filter((h) => PERSONAL.includes(h.aKey) && PERSONAL.includes(h.bKey)).sort((x, y) => x.orb - y.orb);
  const harmonious = sig.filter((h) => h.harmon > 0).length;
  const challenging = sig.filter((h) => h.harmon < 0).length;
  const neutral = sig.filter((h) => h.harmon === 0).length; // conjunctions count as connection
  const total = sig.length;
  // resonance = share of flowing contacts (conjunction counts half-flowing)
  const resonance = total ? Math.round(((harmonious + neutral * 0.5) / total) * 100) : 0;

  const flow = (h: CrossHit) => (h.harmon > 0 ? "fließt leicht zusammen — ein müheloses Verstehen" : h.harmon < 0 ? "reibt sich — Spannung, die anzieht und fordert" : "verschmilzt eng — ihr verstärkt euch gegenseitig hier");
  // Jeder Kontakt darf nur EINMAL auftauchen. Vorher konnte derselbe Aspekt
  // unter zwei Überschriften stehen (Venus–Merkur passt sowohl auf „Nähe &
  // Gefühl" als auch auf „Wie ihr redet") — das las sich wie ein Fehler.
  const used = new Set<CrossHit>();
  const mk = (pred: (h: CrossHit) => boolean, title: string, glyph: string, key: string): Touchpoint | null => {
    const h = sig.find((x) => !used.has(x) && pred(x));
    if (!h) return null;
    used.add(h);
    const fakt = `Deine ${h.aName} ${h.type} ${possessive(partnerName)} ${h.bName} (${h.orb}°)`;
    return {
      key, glyph, title, fakt,
      text: `${fakt} — ${flow(h)}.`,
      aName: h.aName, bName: h.bName, type: h.type, orb: h.orb, harmon: h.harmon,
    };
  };

  const touchpoints = [
    mk((h) => h.aKey === "sun" || h.bKey === "sun", "Eure Kerne", "☉", "sun"),
    mk((h) => ["moon", "venus"].includes(h.aKey) || ["moon", "venus"].includes(h.bKey), "Nähe & Gefühl", "☽", "moon"),
    mk((h) => h.aKey === "mercury" || h.bKey === "mercury", "Wie ihr redet", "☿", "mercury"),
    mk((h) => h.aKey === "mars" || h.bKey === "mars", "Reibung & Anziehung", "♂", "mars"),
  ].filter(Boolean) as Touchpoint[];

  return { hits: sig, resonance, harmonious, challenging, total, touchpoints };
}
