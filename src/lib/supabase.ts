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

// The Gemini models the app asks the edge functions to use. Central constants
// so all call sites stay in sync.
// AI_MODEL — fast tier: chat, single-factor tap readings. gemini-2.5-flash
// (3.5-flash was sustained-503 overloaded).
// AI_MODEL_CORE — quality tier for the one-time deep readings (theme
// sections, portrait): gemini-pro-latest, chosen via a real A/B on the
// client's own chart (more concrete, more tangible, more logical output).
export const AI_MODEL = "gemini-2.5-flash";
export const AI_MODEL_CORE = "gemini-pro-latest";
