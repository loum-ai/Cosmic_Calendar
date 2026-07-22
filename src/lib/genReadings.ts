import { useEffect } from "react";
import { create } from "zustand";
import { supabase, AI_MODEL_CORE } from "./supabase";
import { chartContext, chartHash } from "./factsContext";
import { ASC, CHART, NODES, HOUSE, signName, computeAspects } from "./data";
import { aiSign, aiHouse, aiAspect } from "./interpret";
import type { SheetDescriptor } from "./sheets";

/** Already-generated reading for a subject, from the stored interpretation
 *  (one cockpit generation covers summary + every placement + aspect). Prefer
 *  this over calling `generate` again — saves the daily quota and is instant. */
export function storedReading(d: SheetDescriptor | null): string | null {
  if (!d) return null;
  if (d.kind === "planet") {
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
  request: (viewKey: string, context: string, task: string) => void;
}

export const useReadings = create<ReadingsState>((set, get) => ({
  cache: {},
  loading: {},
  request: async (viewKey, context, task) => {
    if (!viewKey || !task) return;
    const full = chartHash() + "|" + viewKey;
    const s = get();
    if (s.cache[full] || s.loading[full]) return;
    set((st) => ({ loading: { ...st.loading, [full]: true } }));
    try {
      const { data, error } = await supabase.functions.invoke("generate", {
        body: { chart_hash: chartHash(), cacheKey: viewKey, context, task, model: AI_MODEL_CORE },
      });
      if (error || !data?.text) throw new Error("no text");
      set((st) => ({ cache: { ...st.cache, [full]: data.text }, loading: { ...st.loading, [full]: false } }));
    } catch {
      set((st) => ({ loading: { ...st.loading, [full]: false } }));
    }
  },
}));

/** React hook: returns the generated reading for a view, fetching on mount. */
export function useReading(viewKey: string, task: string, enabled = true) {
  const full = chartHash() + "|" + viewKey;
  const text = useReadings((s) => s.cache[full]);
  const loading = useReadings((s) => s.loading[full]);
  const request = useReadings((s) => s.request);
  useEffect(() => {
    if (enabled && viewKey && task) request(viewKey, chartContext(), task);
  }, [full, enabled, viewKey, task, request]);
  return { text, loading: !!loading };
}

/** The interpretive craft applied to EVERY single-factor reading — the
 *  mechanics that make a reading worth money instead of a textbook line:
 *  synthesis, the explained WHY, one everyday anchor, gift AND shadow,
 *  cross-references to tight aspects — in plain, warm German. */
const CRAFT = `So deutest du (wichtig):
- SYNTHESE: Verwebe alles zu EINER Aussage über den Menschen — nicht Planet, Zeichen und Haus einzeln erklären.
- WARUM: Erkläre in einem Halbsatz, warum dieser Lebensbereich dazugehört (z. B. warum dieses Haus für dieses Thema steht) — setze nichts voraus.
- ALLTAG: Nenne EINE konkrete Alltagssituation, in der sich das zeigt („Das merkst du, wenn …").
- BEIDE SEITEN: Benenne die Gabe UND die Schattenseite im selben Atemzug — ehrlich, aber ermutigend.
- ZUSAMMENSPIEL: Wenn ein enger Aspekt aus den FAKTEN diese Kraft deutlich färbt, nenne ihn kurz und sag, was er verändert.
Sprache: kurze Sätze. Warmes, leicht verständliches Deutsch, Du-Form. Keine Fachbegriffe ohne sofortige Übersetzung. Kein Satz, der in jedes Horoskop passen könnte. KOMPAKT: Schreibe dicht — jeder Satz trägt neue Information, keine Füllsätze, nichts doppelt. Lieber ein starker Satz als drei mittelmäßige. TONFÄRBUNG: Sachlich-geerdet, wie ein kluger Berufs- und Lebensberater, der Astrologie als präzises Werkzeug nutzt — nicht wie ein Mystiker. Alltagssprache statt Seelen-Vokabular: VERMEIDE Wörter wie „Seele", „heilig", „Bestimmung", „Schicksal", „Energien", „Universum", „spirituell", „Erwachen", „Dunkelheit", „verborgene Kräfte", „Transformation". Sprich stattdessen von Bedürfnissen, Mustern, Stärken, konkretem Verhalten und Situationen. Tiefe ja — aber am Alltag belegt, nie raunend. Warm und klar, ohne Pathos.`;

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
      return {
        viewKey: "asc:v4",
        task: `Deute den Aszendenten in ${signName(ASC)} für diese Person — EIN Absatz, 4–5 kurze Sätze.
Der Aszendent ist das Zeichen, das bei der Geburt am Osthorizont aufstieg — deshalb steht er für den ersten Eindruck und das Auftreten. Sag, wie diese Person auf andere wirkt, bevor sie ein Wort sagt, und was hinter dieser Fassade oft übersehen wird.
${CRAFT}`,
      };
    }
    const p = CHART.find((x) => x.key === d.key);
    if (!p) return null;
    const h = p.house ?? 1;
    return {
      viewKey: `planet:${d.key}:v4`,
      task: `Deute ${p.name} in ${signName(p.lon)} im ${h}. Haus (${HOUSE[h - 1]})${p.retro ? " — rückläufig: diese Kraft wirkt zuerst nach innen, die Person macht sie erst mit sich selbst aus —" : ""} für diese Person. EIN Absatz, 4–5 kurze Sätze.${dignityHint(p as { dignity?: string | null })}
Zusätzlich ein Satz zur Reifung: Wirkt diese Kraft von Anfang an, oder wächst sie erst über die Jahre ins Volle?
${CRAFT}`,
    };
  }
  if (d.kind === "node") {
    const n = NODES.find((x) => x.key === d.key);
    if (!n) return null;
    const isNorth = d.key === "node_n";
    return {
      viewKey: `node:${d.key}:v4`,
      task: `Deute den ${n.name} in ${signName(n.lon)}${n.house ? `, ${n.house}. Haus (${HOUSE[n.house - 1]})` : ""} für diese Person — EIN Absatz, 3–4 kurze Sätze.
${isNorth
  ? "Der Nordknoten ist die gewählte Wachstumsrichtung — wohin sich dieses Leben entwickeln WILL. Es fühlt sich anfangs ungewohnt an, ist aber die Richtung, in der alles leichter wird. Eine wählbare Entwicklung, kein festgelegtes Los."
  : "Der Südknoten ist das Vertraute und Mitgebrachte — Gaben, die schon da sind, aber auch die Komfortzone, in der man sich versteckt. Was davon darf diese Person würdigen und trotzdem langsam loslassen?"}
${CRAFT}`,
    };
  }
  if (d.kind === "aspect") {
    const a = computeAspects().find((x) => x.key === d.key);
    if (!a) return null;
    return {
      viewKey: `aspect:${d.key}:v4`,
      task: `Deute den Aspekt ${a.A.name} ${a.def.type} ${a.B.name} (Orbis ${a.orb.toFixed(1)}° — ${a.orb < 2 ? "sehr eng, eine der prägendsten Verbindungen dieses Charts" : "spürbar im Alltag"}) für diese Person. EIN Absatz, 4–5 kurze Sätze.
Sag, welche zwei Kräfte hier verbunden sind (in Alltagssprache), wie sich dieses Zusammenspiel von INNEN anfühlt, und woran die Person es in einer typischen Situation erkennt. Gabe und Falle dieser Verbindung im selben Atemzug — und was der reife Umgang damit ist.
${CRAFT}`,
    };
  }
  return null;
}
