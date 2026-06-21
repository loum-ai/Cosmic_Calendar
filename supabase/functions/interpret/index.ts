import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ── interpret ────────────────────────────────────────────────────────────────
// Turns the deterministically computed chart FACTS into a grounded German
// interpretation via Gemini. Input: { facts }. Output: structured JSON
// (summary + per-placement sign/house text + aspect texts). The model is told
// to use ONLY the supplied facts — the math is solved upstream, the LLM only
// writes prose. This is the draft the astrologer reviews.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const BASE = "https://generativelanguage.googleapis.com/v1beta";
const DIGNITY_DE: Record<string, string> = { domicile: "Herrscher (Domizil)", exaltation: "Erhöhung", detriment: "Exil", fall: "Fall" };

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
    summary: { type: "string", description: "3–4 Sätze Gesamtbild der Person" },
    placements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          sign_text: { type: "string", description: "Planet im Zeichen, 2–3 Sätze" },
          house_text: { type: "string", description: "Planet im Haus, 2–3 Sätze" },
        },
        required: ["key", "sign_text", "house_text"],
      },
    },
    aspects: {
      type: "array",
      items: {
        type: "object",
        properties: { a: { type: "string" }, b: { type: "string" }, text: { type: "string" } },
        required: ["a", "b", "text"],
      },
    },
  },
  required: ["summary", "placements"],
};

function factsToPrompt(f: any): string {
  const name = f.profile_name || "die Person";
  const lines: string[] = [];
  lines.push(`Geburtsbild von ${name}. Aszendent in ${f.asc_sign ?? "?"}, MC in ${f.mc_sign ?? "?"}.`);
  lines.push("");
  lines.push("PLANETEN (nur diese Fakten verwenden):");
  for (const p of f.planets ?? []) {
    const dig = p.dignity ? `, ${DIGNITY_DE[p.dignity] ?? p.dignity}` : "";
    const retro = p.retro ? ", rückläufig" : "";
    lines.push(`- ${p.name} (key=${p.key}): ${p.sign} ${p.deg_in_sign ?? ""}°, Haus ${p.house}${retro}${dig}`);
  }
  if (f.aspects?.length) {
    lines.push("");
    lines.push("ASPEKTE (Orbis in Grad):");
    for (const a of f.aspects) lines.push(`- ${a.a} ${a.type} ${a.b} (Orbis ${a.orb}°)`);
  }
  lines.push("");
  lines.push(`Aufgabe: Schreibe (1) eine 'summary' (Gesamtbild, 3–4 Sätze), (2) für JEDEN Planeten oben`);
  lines.push(`einen 'sign_text' (Planet im Zeichen) und 'house_text' (Planet im Haus), key exakt wie angegeben,`);
  lines.push(`und (3) zu JEDEM Aspekt einen kurzen 'text'. Alles auf Deutsch, Du-Form, konkret.`);
  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { facts, model } = await req.json().catch(() => ({}));
    if (!facts?.planets?.length) return json({ error: "missing facts.planets" }, 400);
    if (facts.planets.length > 24) return json({ error: "too many placements" }, 400);

    const key = (Deno.env.get("Gemini_API_Key") || Deno.env.get("GEMINI_API_KEY") || "").trim();
    if (!key) return json({ error: "Gemini key not configured" }, 500);
    const mdl = model || Deno.env.get("GEMINI_MODEL") || "gemini-3.5-flash";

    const r = await fetch(`${BASE}/models/${mdl}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: factsToPrompt(facts) }] }],
        generationConfig: {
          temperature: 0.55,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseJsonSchema: SCHEMA,
        },
      }),
    });
    const data = await r.json();
    if (!r.ok) return json({ error: "gemini_error", status: r.status, detail: data }, 502);

    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
    let parsed: any = null;
    try { parsed = JSON.parse(text); } catch { /* fall through */ }
    if (!parsed) return json({ error: "parse_failed", raw: text.slice(0, 500) }, 502);

    return json({ ok: true, model: mdl, interpretation: parsed });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
