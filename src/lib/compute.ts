import { Origin, Horoscope } from "circular-natal-horoscope-js";
import type { Planet } from "./data";

/**
 * Real natal-chart computation. Verified against astro.com for the reference
 * chart to ~0.01° (Sun/Moon/Mercury/ASC/MC). The library resolves the
 * historical timezone + DST from the given local time and coordinates, so we
 * pass the local civil birth time directly.
 */

const META: Record<string, { key: string; name: string; glyph: string }> = {
  sun: { key: "sun", name: "Sonne", glyph: "☉" },
  moon: { key: "moon", name: "Mond", glyph: "☽" },
  mercury: { key: "mercury", name: "Merkur", glyph: "☿" },
  venus: { key: "venus", name: "Venus", glyph: "♀" },
  mars: { key: "mars", name: "Mars", glyph: "♂" },
  jupiter: { key: "jupiter", name: "Jupiter", glyph: "♃" },
  saturn: { key: "saturn", name: "Saturn", glyph: "♄" },
  uranus: { key: "uranus", name: "Uranus", glyph: "♅" },
  neptune: { key: "neptune", name: "Neptun", glyph: "♆" },
  pluto: { key: "pluto", name: "Pluto", glyph: "♇" },
  chiron: { key: "chiron", name: "Chiron", glyph: "⚷" },
  lilith: { key: "lilith", name: "Lilith", glyph: "⚸" },
  northnode: { key: "node_n", name: "Aufsteigender Knoten", glyph: "☊" },
  southnode: { key: "node_s", name: "Absteigender Knoten", glyph: "☋" },
};
const PLANET_ORDER = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "chiron", "lilith"];

export interface ComputedChart {
  planets: Planet[];
  nodes: Planet[];
  asc: number;
  mc: number;
  cusps: number[];
}

export interface BirthInput {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (local civil time at birth place)
  lat: number;
  lon: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

function houseFromCusps(lon: number, cusps: number[]): number {
  const L = ((lon % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const a = cusps[i];
    const b = cusps[(i + 1) % 12];
    const span = (((b - a) % 360) + 360) % 360;
    const off = (((L - a) % 360) + 360) % 360;
    if (off < span) return i + 1;
  }
  return 1;
}

export function computeChart(input: BirthInput): ComputedChart {
  const [y, mo, d] = input.date.split("-").map(Number);
  const [hh, mm] = input.time.split(":").map(Number);
  const origin = new Origin({ year: y, month: mo - 1, date: d, hour: hh, minute: mm, latitude: input.lat, longitude: input.lon });
  const h = new Horoscope({ origin, houseSystem: "placidus", zodiac: "tropical", aspectPoints: ["bodies"], aspectTypes: ["major"], language: "en" });

  const cusps = h.Houses.map((house: any) => r2(house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees));
  const asc = r2(h.Ascendant.ChartPosition.Ecliptic.DecimalDegrees);
  const mc = r2(h.Midheaven.ChartPosition.Ecliptic.DecimalDegrees);

  const all: any[] = [...h.CelestialBodies.all, ...((h.CelestialPoints && h.CelestialPoints.all) || [])];
  const byKey: Record<string, any> = {};
  all.forEach((b) => (byKey[b.key] = b));

  const mk = (libKey: string): Planet | null => {
    const b = byKey[libKey];
    const m = META[libKey];
    if (!b || !m) return null;
    const lon = r2(b.ChartPosition.Ecliptic.DecimalDegrees);
    return {
      key: m.key,
      name: m.name,
      glyph: m.glyph,
      lon,
      house: b.House?.id ?? houseFromCusps(lon, cusps),
      retro: !!b.isRetrograde,
      txt: "",
    };
  };

  const planets = PLANET_ORDER.map(mk).filter((p): p is Planet => !!p);
  const nodes = ["northnode", "southnode"].map(mk).filter((p): p is Planet => !!p);

  return { planets, nodes, asc, mc, cusps };
}
