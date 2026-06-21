/**
 * Real interpretation layer. Pulls the authoritative chart facts + verification
 * from the `compute-chart` edge function, then the grounded German interpretation
 * from the `interpret` (Gemini) function. Result is cached in localStorage per
 * chart, and exposed via module accessors that the sheet engine prefers over the
 * generic per-sign one-liners. The chart wheel/positions still render instantly
 * from the client compute; this only upgrades the *texts*.
 */
import { supabase } from "./supabase";
import { signName } from "./data";
import type { BirthInput } from "./compute";

export interface AIPlacement { sign_text: string; house_text: string }
export interface AIInterp {
  summary: string;
  placements: Record<string, AIPlacement>;
  aspects: Record<string, string>;
}
export interface ChartVerification {
  status: string;
  reference?: string;
  max_dev_arcsec?: number;
  sun?: { dev_arcsec: number };
  moon?: { dev_arcsec: number };
}

let AI: AIInterp | null = null;
let VERIFY: ChartVerification | null = null;

export const getAI = () => AI;
export const getVerification = () => VERIFY;
export const aiSign = (key: string) => AI?.placements[key]?.sign_text || null;
export const aiHouse = (key: string) => AI?.placements[key]?.house_text || null;
export const aiSummary = () => AI?.summary || null;
const pairKey = (a: string, b: string) => [a, b].sort().join("_");
export const aiAspect = (a: string, b: string) => AI?.aspects[pairKey(a, b)] || null;

function cacheKeyFor(b: { date: string; time: string; lat: number; lon: number }) {
  return `vela_interp_${b.date}_${b.time}_${b.lat.toFixed(3)}_${b.lon.toFixed(3)}`;
}

function loadCache(key: string): { ai: AIInterp; verify: ChartVerification | null } | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalize(interp: any): AIInterp {
  const placements: Record<string, AIPlacement> = {};
  for (const p of interp?.placements ?? []) {
    if (p?.key) placements[p.key] = { sign_text: p.sign_text || "", house_text: p.house_text || "" };
  }
  const aspects: Record<string, string> = {};
  for (const a of interp?.aspects ?? []) {
    if (a?.a && a?.b && a?.text) aspects[pairKey(a.a, a.b)] = a.text;
  }
  return { summary: interp?.summary || "", placements, aspects };
}

export interface InterpResult { ok: boolean; cached: boolean; error?: string }

/**
 * Ensure the AI interpretation for this birth is loaded into the module state.
 * Returns quickly from cache, otherwise runs the two edge functions (~15s).
 */
export async function ensureInterpretation(birth: BirthInput, name: string): Promise<InterpResult> {
  const key = cacheKeyFor(birth);
  const cached = loadCache(key);
  if (cached?.ai) {
    AI = cached.ai;
    VERIFY = cached.verify ?? null;
    return { ok: true, cached: true };
  }

  // 1) authoritative facts + verification
  const compute = await supabase.functions.invoke("compute-chart", { body: { birth } });
  if (compute.error || !compute.data?.data) {
    return { ok: false, cached: false, error: compute.error?.message || "compute failed" };
  }
  const cd = compute.data.data;
  VERIFY = compute.data.verification ?? null;

  // 2) build a focused facts object (tightest aspects keep the prompt sharp)
  const aspects = [...(cd.aspects ?? [])].sort((a: any, b: any) => a.orb - b.orb).slice(0, 14);
  const facts = {
    profile_name: name,
    asc_sign: signName(cd.asc),
    mc_sign: signName(cd.mc),
    planets: (cd.planets ?? []).map((p: any) => ({
      key: p.key, name: p.name, sign: p.sign, deg_in_sign: p.deg_in_sign, house: p.house, retro: p.retro, dignity: p.dignity,
    })),
    aspects: aspects.map((a: any) => ({ a: a.a, b: a.b, type: a.type, orb: a.orb })),
  };

  // 3) grounded German interpretation
  const interp = await supabase.functions.invoke("interpret", { body: { facts } });
  if (interp.error || !interp.data?.interpretation) {
    return { ok: false, cached: false, error: interp.error?.message || "interpret failed" };
  }
  AI = normalize(interp.data.interpretation);
  try {
    localStorage.setItem(key, JSON.stringify({ ai: AI, verify: VERIFY }));
  } catch {
    /* ignore quota */
  }
  return { ok: true, cached: false };
}

export function clearInterpretation() {
  AI = null;
  VERIFY = null;
}
