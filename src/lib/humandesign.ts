/**
 * Human Design engine. Computes the Bodygraph from birth data:
 *   Personality = planet longitudes at birth
 *   Design      = planet longitudes at the moment the Sun was exactly 88° of arc
 *                 earlier (~88 days before birth)
 * Each activation maps to a Gate + Line via the canonical 64-gate I-Ching wheel
 * (Gate 41 begins at 302° = 2° Aquarius). Defined channels → defined centers →
 * Type, Authority, Profile, Definition, Incarnation Cross.
 *
 * VERIFIED against Laura's official jovianarchive chart (07.09.1987 18:50
 * Starnberg): Projector · Splenic · Split · Profile 4/6 · Cross gates 64/63|35/5
 * — all match exactly.
 *
 * Runs fully offline in the browser (no network) via the same ephemeris the
 * natal chart uses. The reference tables are constants → correct for every chart.
 */
import { computeChart, type BirthInput } from "./compute";

// gate wheel: order of the 64 gates from 302° (Gate 41 = 2° Aquarius), each 5.625°
const WHEEL = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60];
const START = 302;
const GW = 360 / 64; // 5.625° per gate
const LW = GW / 6; // line width

function gateLine(lon: number): { gate: number; line: number } {
  const off = (((lon - START) % 360) + 360) % 360;
  const i = Math.floor(off / GW);
  const within = off - i * GW;
  return { gate: WHEEL[i], line: Math.floor(within / LW) + 1 };
}

export const CENTERS: Record<string, number[]> = {
  Kopf: [64, 61, 63],
  Ajna: [47, 24, 4, 17, 43, 11],
  Kehle: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
  G: [7, 1, 13, 10, 25, 15, 46, 2],
  Ego: [21, 40, 26, 51],
  Sakral: [34, 5, 14, 29, 59, 9, 3, 42, 27],
  Solarplexus: [6, 37, 30, 55, 49, 22, 36],
  Milz: [48, 57, 44, 50, 32, 28, 18],
  Wurzel: [58, 38, 54, 53, 60, 52, 19, 39, 41],
};
const GATE2C: Record<number, string> = {};
for (const c in CENTERS) for (const g of CENTERS[c]) GATE2C[g] = c;

const CHANNELS: [number, number][] = [
  [1, 8], [2, 14], [3, 60], [4, 63], [5, 15], [6, 59], [7, 31], [9, 52], [10, 20], [10, 34],
  [10, 57], [11, 56], [12, 22], [13, 33], [16, 48], [17, 62], [18, 58], [19, 49], [20, 34], [20, 57],
  [21, 45], [23, 43], [24, 61], [25, 51], [26, 44], [27, 50], [28, 38], [29, 46], [30, 41], [32, 54],
  [34, 57], [35, 36], [37, 40], [39, 55], [42, 53], [47, 64],
];
const MOTORS = ["Wurzel", "Sakral", "Solarplexus", "Ego"];

const TYPE_INFO: Record<string, { strategy: string; signature: string; notSelf: string }> = {
  "Manifestor": { strategy: "Informieren, dann handeln", signature: "Frieden", notSelf: "Wut" },
  "Generator": { strategy: "Warten, um zu reagieren", signature: "Zufriedenheit", notSelf: "Frustration" },
  "Manifestierender Generator": { strategy: "Warten, um zu reagieren — dann informieren", signature: "Zufriedenheit & Frieden", notSelf: "Frustration & Wut" },
  "Projektor": { strategy: "Warten auf die Anerkennung & Einladung", signature: "Erfolg", notSelf: "Bitterkeit" },
  "Reflektor": { strategy: "Einen Mondzyklus abwarten", signature: "Überraschung", notSelf: "Enttäuschung" },
};

const AUTH_LABEL: Record<string, string> = {
  emotional: "Emotional (Solarplexus)",
  sakral: "Sakral",
  milz: "Milz (splenisch)",
  ego: "Ego / Herz",
  selbst: "Selbst-projiziert (G)",
  mental: "Mental / Umgebung (keine innere)",
  lunar: "Lunar (Mondzyklus)",
};

export interface HDResult {
  type: string;
  strategy: string;
  signature: string;
  notSelf: string;
  authority: string;
  profile: string;
  profileAngle: string;
  definition: string;
  definedCenters: string[];
  channels: string[];
  crossGates: string;
  designDate: string;
  activations: { key: string; label: string; p: string; d: string }[];
}

const BODIES: { key: string; label: string }[] = [
  { key: "sun", label: "Sonne" }, { key: "earth", label: "Erde" }, { key: "moon", label: "Mond" },
  { key: "node_n", label: "N-Knoten" }, { key: "node_s", label: "S-Knoten" }, { key: "mercury", label: "Merkur" },
  { key: "venus", label: "Venus" }, { key: "mars", label: "Mars" }, { key: "jupiter", label: "Jupiter" },
  { key: "saturn", label: "Saturn" }, { key: "uranus", label: "Uranus" }, { key: "neptune", label: "Neptun" }, { key: "pluto", label: "Pluto" },
];

const pad = (n: number) => String(n).padStart(2, "0");

function lonFrom(chart: ReturnType<typeof computeChart>, key: string): number {
  if (key === "earth") return (chart.planets.find((p) => p.key === "sun")!.lon + 180) % 360;
  const all = [...chart.planets, ...chart.nodes];
  const b = all.find((p) => p.key === key);
  return b ? b.lon : 0;
}

/** Right Angle (personal), Juxtaposition, or Left Angle (transpersonal), from the profile. */
function angleFor(pLine: number, dLine: number): string {
  const p = `${pLine}/${dLine}`;
  if (p === "4/1") return "Juxtaposition";
  if (["5/1", "5/2", "6/2", "6/3"].includes(p)) return "Linkswinkel";
  return "Rechtswinkel";
}

export function computeHumanDesign(birth: BirthInput): HDResult {
  const [y, mo, d] = birth.date.split("-").map(Number);
  const [hh, mm] = birth.time.split(":").map(Number);
  const birthMs = Date.UTC(y, mo - 1, d, hh, mm);
  const bChart = computeChart(birth);
  const bSun = bChart.planets.find((p) => p.key === "sun")!.lon;
  const target = (((bSun - 88) % 360) + 360) % 360;

  const partsAt = (ms: number) => {
    const dt = new Date(ms);
    return { date: `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`, time: `${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}` };
  };
  const sunAt = (ms: number) => {
    const p = partsAt(ms);
    return computeChart({ date: p.date, time: p.time, lat: birth.lat, lon: birth.lon }).planets.find((x) => x.key === "sun")!.lon;
  };
  const f = (ms: number) => (((sunAt(ms) - target + 540) % 360) - 180);
  let lo = birthMs - 92 * 864e5, hi = birthMs - 85 * 864e5, flo = f(lo);
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2, fm = f(mid);
    if (flo < 0 === fm < 0) { lo = mid; flo = fm; } else { hi = mid; }
  }
  const designMs = (lo + hi) / 2;
  const dParts = partsAt(designMs);
  const dChart = computeChart({ date: dParts.date, time: dParts.time, lat: birth.lat, lon: birth.lon });

  const P: Record<string, { gate: number; line: number }> = {};
  const D: Record<string, { gate: number; line: number }> = {};
  const activated = new Set<number>();
  for (const b of BODIES) {
    P[b.key] = gateLine(lonFrom(bChart, b.key));
    D[b.key] = gateLine(lonFrom(dChart, b.key));
    activated.add(P[b.key].gate);
    activated.add(D[b.key].gate);
  }

  const defChannels = CHANNELS.filter(([a, b]) => activated.has(a) && activated.has(b));
  const defCenters = new Set<string>();
  defChannels.forEach(([a, b]) => { defCenters.add(GATE2C[a]); defCenters.add(GATE2C[b]); });

  const adj: Record<string, string[]> = {};
  [...defCenters].forEach((c) => (adj[c] = []));
  defChannels.forEach(([a, b]) => {
    const c1 = GATE2C[a], c2 = GATE2C[b];
    if (c1 !== c2) { adj[c1].push(c2); adj[c2].push(c1); }
  });
  const connected = (a: string, b: string) => {
    const seen = new Set([a]); const st = [a];
    while (st.length) { const x = st.pop()!; if (x === b) return true; (adj[x] || []).forEach((y) => { if (!seen.has(y)) { seen.add(y); st.push(y); } }); }
    return false;
  };

  const sacral = defCenters.has("Sakral");
  const motorThroat = defCenters.has("Kehle") && MOTORS.some((m) => defCenters.has(m) && connected(m, "Kehle"));
  let type: string;
  if (defCenters.size === 0) type = "Reflektor";
  else if (sacral) type = motorThroat ? "Manifestierender Generator" : "Generator";
  else if (motorThroat) type = "Manifestor";
  else type = "Projektor";

  let authKey: string;
  if (defCenters.size === 0) authKey = "lunar";
  else if (defCenters.has("Solarplexus")) authKey = "emotional";
  else if (sacral) authKey = "sakral";
  else if (defCenters.has("Milz")) authKey = "milz";
  else if (defCenters.has("Ego")) authKey = "ego";
  else if (defCenters.has("G")) authKey = "selbst";
  else authKey = "mental";

  // definition = number of connected components among defined centers
  let comps = 0; const seen = new Set<string>();
  [...defCenters].forEach((c) => {
    if (!seen.has(c)) { comps++; const st = [c]; seen.add(c); while (st.length) { const x = st.pop()!; (adj[x] || []).forEach((y) => { if (!seen.has(y)) { seen.add(y); st.push(y); } }); } }
  });
  const defLabel = defCenters.size === 0 ? "Keine Definition" : comps <= 1 ? "Einfache Definition" : comps === 2 ? "Split-Definition" : comps === 3 ? "Dreifach-Split" : "Vierfach-Split";

  const info = TYPE_INFO[type];
  const profile = `${P.sun.line}/${D.sun.line}`;
  const SG = ["Wid", "Sti", "Zwi", "Kre", "Löw", "Jun", "Waa", "Sko", "Sch", "Ste", "Was", "Fis"];
  const fmt = (chart: ReturnType<typeof computeChart>, key: string, gl: { gate: number; line: number }) => {
    const l = ((lonFrom(chart, key) % 360) + 360) % 360;
    return `${SG[Math.floor(l / 30)]} ${(l % 30).toFixed(1)}° · ${gl.gate}.${gl.line}`;
  };

  return {
    type,
    strategy: info.strategy,
    signature: info.signature,
    notSelf: info.notSelf,
    authority: AUTH_LABEL[authKey],
    profile,
    profileAngle: angleFor(P.sun.line, D.sun.line),
    definition: defLabel,
    definedCenters: [...defCenters],
    channels: defChannels.map(([a, b]) => `${a}-${b}`),
    crossGates: `${P.sun.gate}/${P.earth.gate} | ${D.sun.gate}/${D.earth.gate}`,
    designDate: `${dParts.date} ${dParts.time}`,
    activations: BODIES.map((b) => ({ key: b.key, label: b.label, p: fmt(bChart, b.key, P[b.key]), d: fmt(dChart, b.key, D[b.key]) })),
  };
}
