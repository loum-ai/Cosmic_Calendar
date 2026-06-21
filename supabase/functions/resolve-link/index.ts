import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// resolve-link — public client view. Takes an unguessable access_token and
// returns that client's chart + the PUBLISHED interpretation. No auth: the
// secret is the token itself. Clients never touch the DB directly; this runs
// with the service role and only ever exposes published readings.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { token } = await req.json().catch(() => ({}));
    if (!token || typeof token !== "string" || token.length < 16) return json({ error: "invalid token" }, 400);

    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: client } = await svc
      .from("clients")
      .select("id, name, birth_date, birth_time, birth_place")
      .eq("access_token", token)
      .maybeSingle();
    if (!client) return json({ error: "not_found" }, 404);

    const { data: chart } = await svc.from("charts").select("data, verification, house_system, zodiac").eq("client_id", client.id).maybeSingle();
    const { data: interp } = await svc
      .from("interpretations")
      .select("draft, edited, status, published_at")
      .eq("client_id", client.id)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return json({
      ok: true,
      client: { name: client.name, birth_date: client.birth_date, birth_time: client.birth_time, birth_place: client.birth_place },
      chart: chart?.data ?? null,
      verification: chart?.verification ?? null,
      interpretation: interp ? (interp.edited ?? interp.draft) : null,
      has_reading: !!interp,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
