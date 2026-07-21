import { useEffect } from "react";
import { create } from "zustand";
import { supabase, AI_MODEL } from "./supabase";
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
        body: { chart_hash: chartHash(), cacheKey: viewKey, context, task, model: AI_MODEL },
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

/** Build {viewKey, task} for an explainable subject so it can be generated. */
export function subjectTask(d: SheetDescriptor | null): { viewKey: string; task: string } | null {
  if (!d) return null;
  if (d.kind === "planet") {
    if (d.key === "asc") return { viewKey: "asc", task: `Deute den Aszendenten in ${signName(ASC)} für diese Person — wie wirkt sie nach außen, welchen ersten Eindruck macht sie? 3–4 Sätze, Du-Form, konkret.` };
    const p = CHART.find((x) => x.key === d.key);
    if (!p) return null;
    const h = p.house ?? 1;
    return { viewKey: `planet:${d.key}`, task: `Deute ${p.name} in ${signName(p.lon)}, ${h}. Haus (${HOUSE[h - 1]})${p.retro ? ", rückläufig," : ""} für diese Person. Was bedeutet diese Stellung konkret für sie? 3–4 Sätze, Du-Form.` };
  }
  if (d.kind === "node") {
    const n = NODES.find((x) => x.key === d.key);
    if (!n) return null;
    return { viewKey: `node:${d.key}`, task: `Deute ${n.name} in ${signName(n.lon)} für diese Person — welches Entwicklungsthema zeigt sich? 2–3 Sätze, Du-Form.` };
  }
  if (d.kind === "aspect") {
    const a = computeAspects().find((x) => x.key === d.key);
    if (!a) return null;
    return { viewKey: `aspect:${d.key}`, task: `Deute den Aspekt ${a.A.name} ${a.def.type} ${a.B.name} (Orbis ${a.orb.toFixed(1)}°) für diese Person. Wie spielt das in ihrem Leben zusammen? 3–4 Sätze, Du-Form, konkret.` };
  }
  return null;
}
