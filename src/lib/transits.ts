/**
 * Real current transits: where the planets are *now* (or on a scrubbed date),
 * and which aspects they form to the natal chart. Computed client-side with the
 * same engine as the natal chart (circular-natal-horoscope-js), so the numbers
 * are consistent with everything else in the app. Texts are templated from the
 * planet themes + aspect nature (instant, no network) — the heavier Gemini
 * interpretation is reserved for the natal reading.
 */
import { Origin, Horoscope } from "circular-natal-horoscope-js";
import { THEME, signName, SG } from "./data";
import type { Planet } from "./data";

const TBODIES: { key: string; name: string; glyph: string }[] = [
  { key: "sun", name: "Sonne", glyph: "☉" }, { key: "moon", name: "Mond", glyph: "☽" },
  { key: "mercury", name: "Merkur", glyph: "☿" }, { key: "venus", name: "Venus", glyph: "♀" },
  { key: "mars", name: "Mars", glyph: "♂" }, { key: "jupiter", name: "Jupiter", glyph: "♃" },
  { key: "saturn", name: "Saturn", glyph: "♄" }, { key: "uranus", name: "Uranus", glyph: "♅" },
  { key: "neptune", name: "Neptun", glyph: "♆" }, { key: "pluto", name: "Pluto", glyph: "♇" },
];

const ASPECTS: { type: string; angle: number; orb: number; impact: "+" | "-" | "~" }[] = [
  { type: "Konjunktion", angle: 0, orb: 6, impact: "~" },
  { type: "Sextil", angle: 60, orb: 3, impact: "+" },
  { type: "Quadrat", angle: 90, orb: 5, impact: "-" },
  { type: "Trigon", angle: 120, orb: 5, impact: "+" },
  { type: "Opposition", angle: 180, orb: 6, impact: "-" },
];

export interface TransitHit {
  tKey: string; tName: string; tGlyph: string; tRetro: boolean;
  nKey: string; nName: string;
  type: string; orb: number; impact: "+" | "-" | "~";
  title: string; txt: string;
}

export interface SkySummary { moonSign: string; sunSign: string; retro: { name: string; glyph: string }[] }

const norm = (d: number) => ((d % 360) + 360) % 360;

function transitingBodies(date: Date) {
  const origin = new Origin({
    year: date.getUTCFullYear(), month: date.getUTCMonth(), date: date.getUTCDate(),
    hour: date.getUTCHours(), minute: date.getUTCMinutes(),
    latitude: 51.48, longitude: 0, // geocentric ecliptic longitude is ~location-independent
  });
  const h = new Horoscope({ origin, houseSystem: "placidus", zodiac: "tropical", aspectPoints: ["bodies"], aspectTypes: ["major"], language: "en" });
  const byKey: Record<string, any> = {};
  h.CelestialBodies.all.forEach((b: any) => (byKey[b.key] = b));
  return TBODIES.map((tb) => {
    const b = byKey[tb.key];
    return { ...tb, lon: b ? norm(b.ChartPosition.Ecliptic.DecimalDegrees) : 0, retro: !!b?.isRetrograde };
  });
}

const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function hitText(tKey: string, nKey: string, impact: string): string {
  const tT = THEME[tKey] || tKey;
  const nT = lc(THEME[nKey] || nKey);
  if (impact === "+") return `${tT} unterstützt gerade ${nT} — eine Phase, in der hier vieles leichter fließt.`;
  if (impact === "-") return `${tT} fordert gerade ${nT} heraus — Reibung, die dich wachsen lässt, wenn du hinschaust.`;
  return `${tT} verbindet sich gerade mit ${nT} — ein Neuanfang in diesem Bereich, der Thema wird.`;
}

export function computeTransits(natal: Planet[], date: Date): TransitHit[] {
  const trans = transitingBodies(date);
  const hits: TransitHit[] = [];
  for (const t of trans) {
    for (const n of natal) {
      let diff = Math.abs(t.lon - norm(n.lon));
      if (diff > 180) diff = 360 - diff;
      for (const a of ASPECTS) {
        const orb = Math.abs(diff - a.angle);
        if (orb <= a.orb) {
          hits.push({
            tKey: t.key, tName: t.name, tGlyph: t.glyph, tRetro: t.retro,
            nKey: n.key, nName: n.name, type: a.type, orb: Math.round(orb * 10) / 10, impact: a.impact,
            title: `${t.name} ${a.type} ${n.name}`, txt: hitText(t.key, n.key, a.impact),
          });
          break;
        }
      }
    }
  }
  // Slow transiting planets (outer) weigh more; otherwise tighter orb = stronger.
  const WEIGHT: Record<string, number> = { pluto: 0, neptune: 0, uranus: 0, saturn: 1, jupiter: 1, mars: 2, sun: 2, venus: 3, mercury: 3, moon: 4 };
  return hits.sort((a, b) => (WEIGHT[a.tKey] - WEIGHT[b.tKey]) || (a.orb - b.orb));
}

export function skySummary(date: Date): SkySummary {
  const trans = transitingBodies(date);
  const byKey: Record<string, any> = {};
  trans.forEach((t) => (byKey[t.key] = t));
  return {
    moonSign: signName(byKey.moon.lon),
    sunSign: signName(byKey.sun.lon),
    retro: trans.filter((t) => t.retro && t.key !== "sun" && t.key !== "moon").map((t) => ({ name: t.name, glyph: t.glyph })),
  };
}

export const SIGN_GLYPH = (sign: string) => {
  const SN = ["Widder", "Stier", "Zwillinge", "Krebs", "Löwe", "Jungfrau", "Waage", "Skorpion", "Schütze", "Steinbock", "Wassermann", "Fische"];
  const i = SN.indexOf(sign);
  return i >= 0 ? SG[i] : "";
};
