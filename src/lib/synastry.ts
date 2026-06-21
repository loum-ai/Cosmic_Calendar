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
export interface Touchpoint { glyph: string; title: string; text: string }
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
  const mk = (pred: (h: CrossHit) => boolean, title: string, glyph: string): Touchpoint | null => {
    const h = sig.find(pred);
    if (!h) return null;
    return { glyph, title, text: `Deine ${h.aName} ${h.type} ${partnerName}s ${h.bName} (${h.orb}°) — ${flow(h)}.` };
  };

  const touchpoints = [
    mk((h) => h.aKey === "sun" || h.bKey === "sun", "Eure Kerne", "☉"),
    mk((h) => ["moon", "venus"].includes(h.aKey) || ["moon", "venus"].includes(h.bKey), "Nähe & Gefühl", "☽"),
    mk((h) => h.aKey === "mercury" || h.bKey === "mercury", "Wie ihr redet", "☿"),
    mk((h) => h.aKey === "mars" || h.bKey === "mars", "Reibung & Anziehung", "♂"),
  ].filter(Boolean) as Touchpoint[];

  return { hits: sig, resonance, harmonious, challenging, total, touchpoints };
}
