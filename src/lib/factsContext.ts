import { CHART, NODES, ASC, MC, signName } from "./data";

/** Compact, grounded facts string for the active chart — the context every
 *  generated reading is built on. Inputs → facts → generation. */
export function chartContext(): string {
  const lines = [`Aszendent in ${signName(ASC)}, MC in ${signName(MC)}.`];
  for (const p of CHART) lines.push(`${p.name} in ${signName(p.lon)}, ${p.house ?? "?"}. Haus${p.retro ? " (rückläufig)" : ""}.`);
  for (const n of NODES) lines.push(`${n.name} in ${signName(n.lon)}.`);
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
