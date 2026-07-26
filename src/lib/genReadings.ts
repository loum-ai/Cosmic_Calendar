import { useEffect } from "react";
import { create } from "zustand";
import { supabase, AI_MODEL_CORE } from "./supabase";
import { kontingentAus, kontingentText, fehlerKoerper } from "./kontingent";
import { chartContext, chartHash } from "./factsContext";
import { ASC, CHART, NODES, HOUSE, signName, houseOf, computeAspects } from "./data";
import { aiSign, aiHouse, aiAspect } from "./interpret";
import type { SheetDescriptor } from "./sheets";

/** Already-generated reading for a subject, from the stored interpretation
 *  (one cockpit generation covers summary + every placement + aspect). Prefer
 *  this over calling `generate` again — saves the daily quota and is instant. */
export function storedReading(d: SheetDescriptor | null): string | null {
  if (!d) return null;
  // Planeten UND Punkte (Aszendent, Mondknoten) — der Cockpit-Lauf deckt sie
  // ab, sobald die Deutung mit asc/node_n/node_s erzeugt wurde. Ältere
  // Deutungen haben sie nicht; dann greift die Live-Generierung unten.
  if (d.kind === "planet" || d.kind === "node") {
    const s = aiSign(String(d.key));
    const h = aiHouse(String(d.key));
    return s || h ? [s, h].filter(Boolean).join(" ") : null;
  }
  if (d.kind === "aspect") {
    const a = computeAspects().find((x) => x.key === d.key);
    return a ? aiAspect(a.A.key, a.B.key) : null;
  }
  return null;
}

/**
 * Generated-readings layer. Every personal interpretation is produced on demand
 * by the `generate` agent (grounded in the chart facts) and cached — in memory
 * here and server-side in readings_cache — so re-opens are instant and "überall
 * echt" stays cheap. One path for every view.
 */
interface ReadingsState {
  cache: Record<string, string>;
  loading: Record<string, boolean>;
  /** Warum keine Deutung da ist — z. B. „Kontingent aufgebraucht". Leer = unbekannt. */
  hinweis: Record<string, string>;
  request: (viewKey: string, context: string, task: string) => void;
}

export const useReadings = create<ReadingsState>((set, get) => ({
  cache: {},
  loading: {},
  hinweis: {},
  request: async (viewKey, context, task) => {
    if (!viewKey || !task) return;
    const full = chartHash() + "|" + viewKey;
    const s = get();
    if (s.cache[full] || s.loading[full]) return;
    set((st) => ({ loading: { ...st.loading, [full]: true }, hinweis: { ...st.hinweis, [full]: "" } }));
    try {
      const { data, error } = await supabase.functions.invoke("generate", {
        body: { chart_hash: chartHash(), cacheKey: viewKey, context, task, model: AI_MODEL_CORE },
      });
      if (error || !data?.text) {
        // Den Grund NICHT verschlucken: ist das Tageskontingent erschöpft, soll
        // die Oberfläche das sagen, statt eine Schablone einzublenden.
        const k = kontingentAus(await fehlerKoerper(error));
        throw Object.assign(new Error("no text"), { hinweis: kontingentText(k) });
      }
      set((st) => ({ cache: { ...st.cache, [full]: data.text }, loading: { ...st.loading, [full]: false } }));
    } catch (e) {
      const hinweis = (e as { hinweis?: string })?.hinweis ?? "";
      set((st) => ({ loading: { ...st.loading, [full]: false }, hinweis: { ...st.hinweis, [full]: hinweis } }));
    }
  },
}));

/** React hook: returns the generated reading for a view, fetching on mount. */
export function useReading(viewKey: string, task: string, enabled = true) {
  const full = chartHash() + "|" + viewKey;
  const text = useReadings((s) => s.cache[full]);
  const loading = useReadings((s) => s.loading[full]);
  const hinweis = useReadings((s) => s.hinweis[full]);
  const request = useReadings((s) => s.request);
  useEffect(() => {
    if (enabled && viewKey && task) request(viewKey, chartContext(), task);
  }, [full, enabled, viewKey, task, request]);
  return { text, loading: !!loading, hinweis: hinweis ?? "" };
}

/**
 * Formel-Verbot. Gemessen an den 203 gecachten Deutungen (2026-07): „Das merkst
 * du …" stand in 21,7 %, „Gleichzeitig …" in 26,1 %, „im Alltag" in 33,5 %,
 * eine „nicht X, sondern Y"-Konstruktion in 50,7 %. Ursache war der alte
 * CRAFT-Block, der jedem Auftrag DIESELBE Rhetorik vorschrieb — dadurch klang
 * jede Karte gleich gebaut, egal welcher Planet darüberstand. Diese Formeln
 * sind jetzt ausdrücklich verboten; die Bausteine dahinter (Alltagsbeleg, beide
 * Seiten) bleiben Pflicht, nur eben jedes Mal anders gesagt.
 */
const VERBOTENE_FORMELN = `FORMEL-VERBOT (wichtig, sonst klingt jede Karte gleich):
- NIE „Das merkst du, wenn …" / „Das zeigt sich im Alltag, wenn …" / „Du kennst das, wenn …". Zeig die Situation einfach, ohne sie anzukündigen.
- NIE einen Satz mit „Gleichzeitig" beginnen. Setz die zweite Seite anders daneben.
- HÖCHSTENS EINMAL im ganzen Text eine „nicht X, sondern Y"-Konstruktion.
- NIE die Wendungen „im selben Atemzug", „deine Gabe ist", „die Falle ist", „der reife Umgang", „genau hier liegt".
- Beginne NICHT mit „Dein/Deine <Planet> in <Zeichen> im <n>. Haus …" — die Stellung steht bereits über deinem Text.`;

/** Sechs verschiedene Einstiege. Welcher genommen wird, entscheidet der
 *  viewKey — gleicher View also immer gleiche Variante (der Cache bleibt
 *  stabil), aber Sonne, Mond und Saturn beginnen garantiert verschieden. */
const EINSTIEGE = [
  "EINSTIEG: Fang mitten in einer Situation an — was dieser Mensch konkret tut, wenn diese Kraft anspringt.",
  "EINSTIEG: Fang beim Widerspruch an — zwei Dinge, die bei diesem Menschen beide wahr sind und sich beißen.",
  "EINSTIEG: Fang bei dem an, was andere an diesem Menschen sehen — und was sie dabei regelmäßig übersehen.",
  "EINSTIEG: Fang beim Bedürfnis darunter an — wonach dieser Mensch hier eigentlich sucht.",
  "EINSTIEG: Fang beim Preis an — was diese Kraft kostet, wenn sie ungebremst läuft.",
  "EINSTIEG: Fang mit einem Satz an, den dieser Mensch vermutlich selbst über sich sagt.",
];

/** Fünf verschiedene Alltagsbelege — damit nicht jede Karte im Büro spielt. */
const BELEGE = [
  "BELEG: Verankere es in einer Situation aus der Arbeit oder dem, was dieser Mensch den ganzen Tag tut.",
  "BELEG: Verankere es in einer Situation mit nahen Menschen — Familie, Freundschaft, Partnerschaft.",
  "BELEG: Verankere es in einer Entscheidung, die dieser Mensch immer wieder zu treffen hat.",
  "BELEG: Verankere es in einer Reaktion unter Druck — Streit, Zeitnot, Kritik.",
  "BELEG: Verankere es in etwas, das dieser Mensch aufschiebt, vermeidet oder heimlich zu viel tut.",
];

/** Deterministischer Index aus dem viewKey. */
function pick<T>(seed: string, list: T[]): T {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  return list[h % list.length];
}

/** The interpretive craft applied to EVERY single-factor reading — the
 *  mechanics that make a reading worth money instead of a textbook line:
 *  synthesis, the explained WHY, one everyday anchor, gift AND shadow,
 *  cross-references to tight aspects — in plain, warm German. Einstieg und
 *  Alltagsbeleg rotieren über den viewKey, damit sich die Karten einer Seite
 *  nicht gegenseitig nachplappern. */
export function craft(seed: string): string {
  return `So deutest du (wichtig):
- SYNTHESE: Verwebe alles zu EINER Aussage über den Menschen — nicht Planet, Zeichen und Haus einzeln erklären.
- WARUM: Erkläre in einem Halbsatz, warum dieser Lebensbereich dazugehört (z. B. warum dieses Haus für dieses Thema steht) — setze nichts voraus.
- BEIDE SEITEN: Benenne die Stärke UND ihren Schatten — ehrlich, aber ermutigend.
- ZUSAMMENSPIEL: Wenn ein enger Aspekt aus den FAKTEN diese Kraft deutlich färbt, nenne ihn kurz und sag, was er verändert.
${pick(seed, EINSTIEGE)}
${pick(seed + "#b", BELEGE)}
${VERBOTENE_FORMELN}
Sprache: kurze Sätze. Warmes, leicht verständliches Deutsch, Du-Form. Keine Fachbegriffe ohne sofortige Übersetzung. Kein Satz, der in jedes Horoskop passen könnte. KOMPAKT: Schreibe dicht — jeder Satz trägt neue Information, keine Füllsätze, nichts doppelt. Lieber ein starker Satz als drei mittelmäßige. Schreib den Text zu Ende — kein angefangener letzter Satz. TONFÄRBUNG: Sachlich-geerdet, wie ein kluger Berufs- und Lebensberater, der Astrologie als präzises Werkzeug nutzt — nicht wie ein Mystiker. Alltagssprache statt Seelen-Vokabular: VERMEIDE Wörter wie „Seele", „heilig", „Bestimmung", „Schicksal", „Energien", „Universum", „spirituell", „Erwachen", „Dunkelheit", „verborgene Kräfte", „Transformation". Sprich stattdessen von Bedürfnissen, Mustern, Stärken, konkretem Verhalten und Situationen. Tiefe ja — aber am Alltag belegt, nie raunend. Warm und klar, ohne Pathos.`;
}

const dignityHint = (p: { dignity?: string | null } | undefined): string => {
  const d = p && (p as { dignity?: string | null }).dignity;
  if (d === "domicile" || d === "exaltation") return " Diese Stellung ist besonders kraftvoll und stimmig — lass das im Ton mitschwingen (ohne Fachbegriff).";
  if (d === "detriment" || d === "fall") return " Diese Stellung ist herausgefordert — die Kraft muss erst ihren eigenen Weg finden; deute das als Lernweg, nicht als Schwäche (ohne Fachbegriff).";
  return "";
};

/** Build {viewKey, task} for an explainable subject so it can be generated. */
export function subjectTask(d: SheetDescriptor | null): { viewKey: string; task: string } | null {
  if (!d) return null;
  if (d.kind === "planet") {
    if (d.key === "asc") {
      const viewKey = "asc:v5";
      return {
        viewKey,
        task: `Deute den Aszendenten in ${signName(ASC)} für diese Person — EIN Absatz, 4–5 kurze Sätze.
Der Aszendent ist das Zeichen, das bei der Geburt am Osthorizont aufstieg — deshalb steht er für den ersten Eindruck und das Auftreten. Sag, wie diese Person auf andere wirkt, bevor sie ein Wort sagt, und was hinter dieser Fassade oft übersehen wird.
${craft(viewKey)}`,
      };
    }
    const p = CHART.find((x) => x.key === d.key);
    if (!p) return null;
    const h = p.house ?? 1;
    const viewKey = `planet:${d.key}:v5`;
    return {
      viewKey,
      task: `Deute ${p.name} in ${signName(p.lon)} im ${h}. Haus (${HOUSE[h - 1]})${p.retro ? " — rückläufig: diese Kraft wirkt zuerst nach innen, die Person macht sie erst mit sich selbst aus —" : ""} für diese Person. EIN Absatz, 4–5 kurze Sätze.${dignityHint(p as { dignity?: string | null })}
Zusätzlich ein Satz zur Reifung: Wirkt diese Kraft von Anfang an, oder wächst sie erst über die Jahre ins Volle?
${craft(viewKey)}`,
    };
  }
  if (d.kind === "node") {
    const n = NODES.find((x) => x.key === d.key);
    if (!n) return null;
    const isNorth = d.key === "node_n";
    const viewKey = `node:${d.key}:v5`;
    return {
      viewKey,
      task: `Deute den ${n.name} in ${signName(n.lon)}${n.house ? `, ${n.house}. Haus (${HOUSE[n.house - 1]})` : ""} für diese Person — EIN Absatz, 3–4 kurze Sätze.
${isNorth
  ? "Der Nordknoten ist die gewählte Wachstumsrichtung — wohin sich dieses Leben entwickeln WILL. Es fühlt sich anfangs ungewohnt an, ist aber die Richtung, in der alles leichter wird. Eine wählbare Entwicklung, kein festgelegtes Los."
  : "Der Südknoten ist das Vertraute und Mitgebrachte — Gaben, die schon da sind, aber auch die Komfortzone, in der man sich versteckt. Was davon darf diese Person würdigen und trotzdem langsam loslassen?"}
${craft(viewKey)}`,
    };
  }
  if (d.kind === "house") {
    const h = Number(d.key);
    if (!(h >= 1 && h <= 12)) return null;
    const inside = CHART.filter((p) => (p.house ?? houseOf(p.lon)) === h);
    const besetzt = inside.length
      ? `In diesem Haus stehen: ${inside.map((p) => `${p.name} in ${signName(p.lon)}`).join(", ")}.`
      : "In diesem Haus steht kein Planet. Deute es deshalb über den Herrscher seines Zeichens und über die Planeten, die aus anderen Häusern per Aspekt hierher wirken — und sag ehrlich, dass dieser Bereich eher leise mitläuft, statt ein Dauerthema zu sein. Das ist kein Mangel.";
    const viewKey = `house:${h}:v2`;
    return {
      viewKey,
      task: `Deute das ${h}. Haus (${HOUSE[h - 1]}) für DIESEN Menschen — EIN Absatz, 4–5 kurze Sätze.
${besetzt}
Erkläre in einem Halbsatz, warum dieses Haus für genau diesen Lebensbereich steht (die Logik des Horoskop-Kreises), und sag dann, wie dieser Bereich bei DIESEM Menschen konkret aussieht — nicht, was das Haus allgemein bedeutet.
${craft(viewKey)}`,
    };
  }
  if (d.kind === "aspect") {
    const a = computeAspects().find((x) => x.key === d.key);
    if (!a) return null;
    const viewKey = `aspect:${d.key}:v5`;
    return {
      viewKey,
      task: `Deute den Aspekt ${a.A.name} ${a.def.type} ${a.B.name} (Orbis ${a.orb.toFixed(1)}° — ${a.orb < 2 ? "sehr eng, eine der prägendsten Verbindungen dieses Charts" : "spürbar im Alltag"}) für diese Person. EIN Absatz, 4–5 kurze Sätze.
Sag, welche zwei Kräfte hier verbunden sind (in Alltagssprache), wie sich dieses Zusammenspiel von INNEN anfühlt, und woran die Person es in einer typischen Situation erkennt. Stärke und Falle dieser Verbindung gehören beide hinein — und was ein erwachsener Umgang damit ist.
${craft(viewKey)}`,
    };
  }
  return null;
}
