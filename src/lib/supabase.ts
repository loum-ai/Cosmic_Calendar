import { createClient } from "@supabase/supabase-js";
import type { Database } from "./db.types";

// Vela-Astrology project (EU / eu-west-1). The publishable (anon) key is safe
// to ship in the client — all sensitive access is gated by RLS (admin-only) and
// by edge functions that hold the service role + Gemini key server-side.
const URL = import.meta.env.VITE_SUPABASE_URL || "https://khcwkssirzqcwboaisco.supabase.co";
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_yjqSH_SLK_VG7XJbGheSxQ_jqAyB9vK";

export const supabase = createClient<Database>(URL, ANON, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const FUNCTIONS_URL = `${URL}/functions/v1`;
export const SUPABASE_ANON = ANON;

/**
 * Die Gemini-Modelle, um die die App ihre Edge Functions bittet. Eine Stelle,
 * damit alle Aufrufe zusammenbleiben.
 *
 * NUR `-latest`-ALIASE, keine festgenagelten Versionen. Grund, gemessen am
 * 26.07.2026: `gemini-2.5-pro` antwortete mit 404 — "no longer available to
 * new users". Eine festgenagelte Version war einfach verschwunden. Hier stand
 * bis dahin `gemini-2.5-flash`; wäre die genauso zurückgezogen worden, wären
 * Chat und Nachlade-Deutungen still auf die Notfalltexte gefallen — dieselbe
 * Kette, die Marco eine Schablone beschert hat. Die Aliase wandern mit.
 *
 * AI_MODEL — schnelle Stufe: Chat, Deutungen beim Antippen, Musterkarten.
 * AI_MODEL_CORE — Tiefe: das Portrait. Das ist der einzige Pro-Aufruf pro
 * Kunde; die kurzen Kartentexte schreibt die Edge Function selbst mit Flash
 * (rund zehnmal günstiger, im A/B ohne erkennbaren Abstand).
 */
export const AI_MODEL = "gemini-flash-latest";
export const AI_MODEL_CORE = "gemini-pro-latest";
