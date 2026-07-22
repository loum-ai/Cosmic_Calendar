import { CHART, NODES, ASC, MC, HOUSE, signName, houseOf, computeAspects } from "./data";
import { computeTransits } from "./transits";

/** Current-sky facts: the tightest transits touching this natal chart today —
 *  slow movers first (they carry the real developmental weight). Lets any
 *  reading say what is happening for this person RIGHT NOW. */
export function transitContext(): string {
  try {
    const SLOW = ["jupiter", "saturn", "uranus", "neptune", "pluto"];
    const hits = computeTransits(CHART, new Date())
      .sort((a, b) => (SLOW.includes(b.tKey) ? 1 : 0) - (SLOW.includes(a.tKey) ? 1 : 0) || a.orb - b.orb)
      .slice(0, 10);
    if (!hits.length) return "";
    const lines = ["AKTUELLE TRANSITE (wo die Planeten HEUTE laufen und welche Punkte des Geburtsbilds sie gerade berühren — langsame Planeten wirken über Monate bis Jahre, je enger der Orbis, desto spürbarer):"];
    for (const h of hits) lines.push(`- ${h.tName} (laufend${h.tRetro ? ", rückläufig" : ""}) ${h.type} ${h.nName} im Geburtsbild (Orbis ${h.orb.toFixed(1)}°)`);
    return lines.join("\n");
  } catch {
    return "";
  }
}

/** Rich, grounded facts string for the active chart — the context every
 *  generated reading is built on. Includes the ASPECTS (the tensions), so the
 *  reading can name the exact configuration (e.g. the Sun–Saturn square) instead
 *  of staying generic. Inputs → facts → generation. */
export function chartContext(): string {
  const lines: string[] = [];
  lines.push(`Aszendent (Auftreten) in ${signName(ASC)}; MC / Himmelsmitte (öffentliche Rolle) in ${signName(MC)}.`);
  lines.push("");
  lines.push("PLANETEN (Kraft · Zeichen/Färbung · Haus/Lebensbereich):");
  for (const p of CHART) {
    const h = p.house ?? houseOf(p.lon);
    lines.push(`- ${p.name} in ${signName(p.lon)}, ${h}. Haus (${HOUSE[h - 1]})${p.retro ? ", rückläufig" : ""}.`);
  }
  lines.push("");
  lines.push("MONDKNOTEN (Lebensrichtung / Bestimmung — Nordknoten = Wachstumsrichtung, Südknoten = Vertrautes zum Loslassen):");
  for (const n of NODES) {
    const h = n.house ?? houseOf(n.lon);
    lines.push(`- ${n.name} in ${signName(n.lon)}, ${h}. Haus (${HOUSE[h - 1]}).`);
  }
  const asp = computeAspects().slice().sort((a, b) => a.orb - b.orb).slice(0, 14);
  if (asp.length) {
    lines.push("");
    lines.push("ASPEKTE (Zusammenspiel & Spannungen — engste zuerst, je kleiner der Orbis desto stärker):");
    for (const a of asp) lines.push(`- ${a.A.name} ${a.def.type} ${a.B.name} (${a.orb.toFixed(1)}° Orbis)`);
  }
  return lines.join("\n");
}

/** Deterministic id for the active chart, so generated readings cache once. */
export function chartHash(): string {
  const s = CHART.map((p) => `${p.key}${Math.round(p.lon * 10)}`).join("") + `a${Math.round(ASC * 10)}m${Math.round(MC * 10)}`;
  return "c" + fnv(s);
}

/** Short stable hash for arbitrary strings (e.g. a question), for cache keys. */
export function shortHash(s: string): string {
  return fnv(s.trim().toLowerCase());
}

function fnv(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}
