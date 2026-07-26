/**
 * Real current transits: where the planets are *now* (or on a scrubbed date),
 * and which aspects they form to the natal chart. Computed client-side with the
 * same engine as the natal chart (circular-natal-horoscope-js), so the numbers
 * are consistent with everything else in the app. Texts are templated from the
 * planet themes + aspect nature (instant, no network) — the heavier Gemini
 * interpretation is reserved for the natal reading.
 */
import { Origin, Horoscope } from "circular-natal-horoscope-js";
import { THEME, signName, SG, houseOfCusps } from "./data";
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

/** Der laufende Himmel — und wo er in DIESEM Geburtsbild landet. Die
 *  Haus-Angaben machen aus einer allgemeinen Himmelslage eine persönliche. */
export interface SkySummary {
  moonSign: string; moonHouse: number;
  sunSign: string; sunHouse: number;
  retro: { name: string; glyph: string; house: number }[];
}

const norm = (d: number) => ((d % 360) + 360) % 360;

export function transitingBodies(date: Date) {
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

// The transiting (sky) planet acts on YOUR natal point. Name the sky planet,
// theme the natal point — never confuse the two. Each aspect type gets its own
// mechanic and each transit its tempo (slow = development, fast = passing mood),
// so no two hit texts read like the same sentence with swapped nouns.
const SLOW_T = new Set(["jupiter", "saturn", "uranus", "neptune", "pluto"]);

/**
 * Was am Himmel steht — die BEOBACHTUNG plus die Mechanik des Aspekts.
 *
 * Bewusst ohne Anrede. Der Satz galt vorher als Deutung („eine Gelegenheit,
 * die wirkt, wenn DU sie aktiv nutzt") und stand doch bei jedem Menschen mit
 * demselben Transit identisch da — eine Schablone (check:schablonen). Was ein
 * Quadrat mechanisch tut, ist Lexikonwissen und darf sich gleichen; was es
 * für EINEN Menschen bedeutet, kommt aus seiner erzeugten Deutung.
 */
function hitText(tKey: string, tName: string, aspType: string, nKey: string, nName: string): string {
  // THEME ist in der Du-Form gehalten („Deine Sehnsucht") — hier wird daraus
  // die neutrale Benennung, sonst trüge dieser Lexikonsatz eine Anrede, die
  // bei jedem Menschen identisch dasteht.
  const thema = THEME[nKey]?.replace(/^(dein|deine|deinen|deiner)\s+/i, "");
  const nT = thema ? `${nName} im Geburtsbild (${lc(thema)})` : `${nName} im Geburtsbild`;
  const tempo = SLOW_T.has(tKey)
    ? `${tName} ist langsam — das zieht sich über Wochen bis Monate.`
    : `${tName} ist schnell — das dauert wenige Tage.`;
  const mech: Record<string, string> = {
    Konjunktion: `Der laufende ${tName} steht genau auf ${nT}. Eine Konjunktion legt beide Kräfte übereinander und stößt das Thema neu an.`,
    Sextil: `Der laufende ${tName} bildet ein Sextil zu ${nT}. Ein Sextil öffnet eine Gelegenheit, die Zutun braucht, um zu wirken.`,
    Quadrat: `Der laufende ${tName} steht im Quadrat zu ${nT}. Ein Quadrat erzeugt Reibung und drängt auf eine Entscheidung.`,
    Trigon: `Der laufende ${tName} bildet ein Trigon zu ${nT}. Ein Trigon lässt beide Kräfte mühelos ineinandergreifen.`,
    Opposition: `Der laufende ${tName} steht ${nT} gegenüber. Eine Opposition stellt zwei Pole einander gegenüber; sichtbar wird das meist über andere Menschen.`,
  };
  return `${mech[aspType] ?? `Der laufende ${tName} berührt ${nT}.`} ${tempo}`;
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
            title: `${t.name} ${a.type} ${n.name}`, txt: hitText(t.key, t.name, a.type, n.key, n.name),
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
    moonHouse: houseOfCusps(byKey.moon.lon),
    sunSign: signName(byKey.sun.lon),
    sunHouse: houseOfCusps(byKey.sun.lon),
    retro: trans
      .filter((t) => t.retro && t.key !== "sun" && t.key !== "moon")
      .map((t) => ({ name: t.name, glyph: t.glyph, house: houseOfCusps(t.lon) })),
  };
}

// ── year-ahead forecast: the big slow transits over the next 12 months ──
const SLOW = new Set(["jupiter", "saturn", "uranus", "neptune", "pluto", "chiron"]);
export interface ForecastHit { date: Date; tName: string; tGlyph: string; nName: string; type: string; impact: "+" | "-" | "~" }

export function yearAhead(natal: Planet[], from: Date): ForecastHit[] {
  const best: Record<string, { orb: number; date: Date; t: any; n: Planet; a: typeof ASPECTS[number] }> = {};
  for (let d = 0; d <= 366; d += 5) {
    const date = new Date(from);
    date.setDate(date.getDate() + d);
    const trans = transitingBodies(date).filter((t) => SLOW.has(t.key));
    for (const t of trans)
      for (const n of natal) {
        let diff = Math.abs(t.lon - norm(n.lon));
        if (diff > 180) diff = 360 - diff;
        for (const a of ASPECTS) {
          const orb = Math.abs(diff - a.angle);
          if (orb <= 1.2) {
            const key = `${t.key}|${n.key}|${a.type}`;
            if (!best[key] || orb < best[key].orb) best[key] = { orb, date, t, n, a };
          }
        }
      }
  }
  return Object.values(best)
    .sort((x, y) => x.date.getTime() - y.date.getTime())
    .map((b) => ({ date: b.date, tName: b.t.name, tGlyph: b.t.glyph, nName: b.n.name, type: b.a.type, impact: b.a.impact }));
}

export const SIGN_GLYPH = (sign: string) => {
  const SN = ["Widder", "Stier", "Zwillinge", "Krebs", "Löwe", "Jungfrau", "Waage", "Skorpion", "Schütze", "Steinbock", "Wassermann", "Fische"];
  const i = SN.indexOf(sign);
  return i >= 0 ? SG[i] : "";
};

/**
 * Wie lange hält ein Transit — als Zeitraum, nicht als Stimmungsbild.
 *
 * Warum das hier steht und nicht im Sprachmodell: „Wie lange hält dieser
 * Transit?" ist keine Deutungsfrage, sondern eine Rechenfrage. Die Antwort
 * steht in der Ephemeride. Vorher fiel genau diese Frage durch den
 * Notfall-Zweig und wurde mit einem Text über die Sonne beantwortet.
 *
 * Verfahren: die Fenstergrenzen per Verdopplung und Halbierung suchen, nicht
 * Tag für Tag — jede Abfrage kostet ein volles Horoskop (~30 ms), die
 * tageweise Variante brauchte 37 Sekunden und fror die Oberfläche ein.
 * Reicht das Fenster über den geprüften Zeitraum hinaus, wird das gemeldet
 * statt gerundet.
 */
export interface TransitWindow {
  von: Date;
  bis: Date;
  exakt: Date | null;
  /** Fenster reicht über den geprüften Zeitraum hinaus — bei Pluto & Co. normal. */
  offenVorn: boolean;
  offenHinten: boolean;
  tage: number;
}

/** Wie weit wird überhaupt gesucht. Alles darüber wird als "länger als" gemeldet. */
export const MAX_TAGE = 400;

/** Ein Horoskop pro Tag, nicht pro Abfrage — die Suche fragt Tage mehrfach. */
const tagCache = new Map<string, ReturnType<typeof transitingBodies>>();
function bodiesAt(date: Date) {
  const key = date.toISOString().slice(0, 10);
  let v = tagCache.get(key);
  if (!v) { v = transitingBodies(date); tagCache.set(key, v); }
  return v;
}

function orbAt(natalLon: number, tKey: string, angle: number, date: Date): number {
  const t = bodiesAt(date).find((b) => b.key === tKey);
  if (!t) return 99;
  let diff = Math.abs(t.lon - norm(natalLon));
  if (diff > 180) diff = 360 - diff;
  return Math.abs(diff - angle);
}

export function transitWindow(
  natalLon: number,
  tKey: string,
  aspectType: string,
  around: Date = new Date(),
): TransitWindow | null {
  const a = ASPECTS.find((x) => x.type === aspectType);
  if (!a) return null;

  const tag = (d: number) => {
    const x = new Date(around);
    x.setUTCDate(x.getUTCDate() + d);
    return x;
  };
  const drin = (d: number) => orbAt(natalLon, tKey, a.angle, tag(d)) <= a.orb;
  if (!drin(0)) return null;

  /**
   * Die Grenze suchen, ohne jeden Tag anzufassen: erst die Schrittweite
   * verdoppeln, bis der Aspekt aus dem Orbis fällt, dann zwischen dem letzten
   * Treffer und dem ersten Fehlschlag halbieren. Rund 17 Abfragen je Richtung
   * statt bis zu 400 — die tageweise Variante brauchte 37 Sekunden und hat
   * die Oberfläche eingefroren.
   */
  function grenze(richtung: 1 | -1): { tage: number; offen: boolean } {
    let letzterTreffer = 0;
    let schritt = 1;
    while (schritt <= MAX_TAGE && drin(richtung * schritt)) {
      letzterTreffer = schritt;
      schritt *= 2;
    }
    if (letzterTreffer >= MAX_TAGE) return { tage: MAX_TAGE, offen: true };
    let lo = letzterTreffer;
    let hi = Math.min(schritt, MAX_TAGE + 1);
    if (hi > MAX_TAGE && drin(richtung * MAX_TAGE)) return { tage: MAX_TAGE, offen: true };
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (drin(richtung * mid)) lo = mid; else hi = mid;
    }
    return { tage: lo, offen: false };
  }

  const vor = grenze(-1);
  const nach = grenze(1);

  /**
   * Der exakte Moment — NUR bei kurzen Fenstern.
   *
   * Die Suche geht davon aus, dass der Orbis zur Mitte hin genau ein Minimum
   * hat. Bei den langsamen Planeten stimmt das nicht: durch die
   * Rückläufigkeit läuft derselbe Aspekt oft dreimal exakt. Eine einzelne
   * Zahl wäre dort schlicht falsch, also wird keine genannt.
   */
  let exakt: Date | null = null;
  const spanne = vor.tage + nach.tage;
  if (!vor.offen && !nach.offen && spanne <= 90) {
    let lo = -vor.tage;
    let hi = nach.tage;
    for (let i = 0; i < 20 && hi - lo > 1; i++) {
      const m1 = Math.floor(lo + (hi - lo) / 3);
      const m2 = Math.ceil(hi - (hi - lo) / 3);
      if (orbAt(natalLon, tKey, a.angle, tag(m1)) <= orbAt(natalLon, tKey, a.angle, tag(m2))) hi = m2; else lo = m1;
    }
    exakt = tag(orbAt(natalLon, tKey, a.angle, tag(lo)) <= orbAt(natalLon, tKey, a.angle, tag(hi)) ? lo : hi);
  }

  return {
    von: tag(-vor.tage),
    bis: tag(nach.tage),
    exakt,
    offenVorn: vor.offen,
    offenHinten: nach.offen,
    tage: vor.tage + nach.tage + 1,
  };
}
