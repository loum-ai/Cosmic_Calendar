import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// interpret — two modes:
//   { facts }                 → returns a grounded German interpretation (no DB).
//   { client_id, publish? }   → admin-only: loads the client's stored chart,
//                               generates the interpretation, and stores it in
//                               `interpretations` (status published by default).

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const BASE = "https://generativelanguage.googleapis.com/v1beta";
const DIGNITY_DE: Record<string, string> = { domicile: "Herrscher (Domizil)", exaltation: "Erhöhung", detriment: "Exil", fall: "Fall" };
const SIGNS = ["Widder", "Stier", "Zwillinge", "Krebs", "Löwe", "Jungfrau", "Waage", "Skorpion", "Schütze", "Steinbock", "Wassermann", "Fische"];
const signOf = (lon: number) => SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30)];

const SYSTEM = `Du bist Vela, eine professionelle, warmherzige Astrologin.
Schreibe in klarem, alltagsnahem Deutsch ("Klartext") und in der Du-Form.
Vermeide Fachjargon ohne Erklärung. Sei konkret und beziehe dich auf die
tatsächliche Stellung (Zeichen, Haus, Würde, Aspekt) — keine allgemeinen
Horoskop-Floskeln.
WICHTIG: Verwende AUSSCHLIESSLICH die bereitgestellten astrologischen Fakten.
Erfinde keine Stellungen, die nicht in den Daten stehen. Keine Vorhersagen zu
Tod, Krankheit oder Schwangerschaft. Jeder Abschnitt 2–3 Sätze.`;

const SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    placements: {
      type: "array",
      items: { type: "object", properties: { key: { type: "string" }, sign_text: { type: "string" }, house_text: { type: "string" } }, required: ["key", "sign_text", "house_text"] },
    },
    aspects: {
      type: "array",
      items: { type: "object", properties: { a: { type: "string" }, b: { type: "string" }, text: { type: "string" } }, required: ["a", "b", "text"] },
    },
  },
  required: ["summary", "placements"],
};

function factsToPrompt(f: any): string {
  const name = f.profile_name || "die Person";
  const lines: string[] = [`Geburtsbild von ${name}. Aszendent in ${f.asc_sign ?? "?"}, MC in ${f.mc_sign ?? "?"}.`, "", "PLANETEN (nur diese Fakten verwenden):"];
  for (const p of f.planets ?? []) {
    const dig = p.dignity ? `, ${DIGNITY_DE[p.dignity] ?? p.dignity}` : "";
    const retro = p.retro ? ", rückläufig" : "";
    lines.push(`- ${p.name} (key=${p.key}): ${p.sign} ${p.deg_in_sign ?? ""}°, Haus ${p.house}${retro}${dig}`);
  }
  if (f.aspects?.length) {
    lines.push("", "ASPEKTE (Orbis in Grad):");
    for (const a of f.aspects) lines.push(`- ${a.a} ${a.type} ${a.b} (Orbis ${a.orb}°)`);
  }
  lines.push("", "Aufgabe: Schreibe (1) eine 'summary' (Gesamtbild, 3–4 Sätze), (2) für JEDEN Planeten oben",
    "einen 'sign_text' und 'house_text', key exakt wie angegeben, und (3) zu JEDEM Aspekt einen 'text'. Deutsch, Du-Form, konkret.");
  return lines.join("\n");
}

function chartToFacts(name: string, data: any) {
  const aspects = [...(data.aspects ?? [])].sort((a: any, b: any) => a.orb - b.orb).slice(0, 14);
  return {
    profile_name: name,
    asc_sign: signOf(data.asc),
    mc_sign: signOf(data.mc),
    planets: (data.planets ?? []).map((p: any) => ({ key: p.key, name: p.name, sign: p.sign, deg_in_sign: p.deg_in_sign, house: p.house, retro: p.retro, dignity: p.dignity })),
    aspects: aspects.map((a: any) => ({ a: a.a, b: a.b, type: a.type, orb: a.orb })),
  };
}

async function generate(facts: any, model: string, key: string) {
  const r = await fetch(`${BASE}/models/${model}:generateContent?key=${key}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: factsToPrompt(facts) }] }],
      generationConfig: { temperature: 0.55, maxOutputTokens: 8192, responseMimeType: "application/json", responseJsonSchema: SCHEMA },
    }),
  });
  const data = await r.json();
  if (!r.ok) return { error: { status: r.status, detail: data } };
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  try { return { interpretation: JSON.parse(text) }; } catch { return { error: { parse: text.slice(0, 400) } }; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const { client_id, model, publish } = body;
    const key = (Deno.env.get("Gemini_API_Key") || Deno.env.get("GEMINI_API_KEY") || "").trim();
    if (!key) return json({ error: "Gemini key not configured" }, 500);
    const mdl = model || Deno.env.get("GEMINI_MODEL") || "gemini-3.5-flash";
    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // ── admin mode: by client_id ──
    if (client_id) {
      const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
      const { data: u } = await svc.auth.getUser(token);
      const uid = u?.user?.id;
      const { data: adm } = uid ? await svc.from("app_admins").select("user_id").eq("user_id", uid).maybeSingle() : { data: null };
      if (!adm) return json({ error: "forbidden — admin only" }, 403);

      const { data: client } = await svc.from("clients").select("name").eq("id", client_id).single();
      const { data: chart } = await svc.from("charts").select("data").eq("client_id", client_id).single();
      if (!client || !chart?.data) return json({ error: "client or chart not found (compute the chart first)" }, 404);

      const facts = chartToFacts(client.name, chart.data);
      const res = await generate(facts, mdl, key);
      if (res.error) return json({ error: "gemini_error", detail: res.error }, 502);

      const status = publish === false ? "draft" : "published";
      const row = {
        client_id, kind: "natal", status, model: mdl, temperature: 0.55,
        facts, draft: res.interpretation, published_at: status === "published" ? new Date().toISOString() : null,
      };
      // one natal interpretation per client: replace any existing
      await svc.from("interpretations").delete().eq("client_id", client_id).eq("kind", "natal");
      const { error } = await svc.from("interpretations").insert(row);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, stored: true, status, model: mdl, interpretation: res.interpretation });
    }

    // ── facts mode ──
    const facts = body.facts;
    if (!facts?.planets?.length) return json({ error: "missing facts.planets or client_id" }, 400);
    const res = await generate(facts, mdl, key);
    if (res.error) return json({ error: "gemini_error", detail: res.error }, 502);
    return json({ ok: true, model: mdl, interpretation: res.interpretation });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
