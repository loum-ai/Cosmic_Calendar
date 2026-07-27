import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// embed-knowledge — trägt Vektoren für die Wissensbasis nach.
//
// Ablauf: alle Zeilen in `knowledge` ohne `embedding` holen (max. 200 pro
// Lauf), Titel + Body einbetten, Vektor zurückschreiben. Danach findet
// `match_knowledge` sie, und `interpret`/`generate` ziehen sie als FACHWISSEN
// in die Deutung.
//
// AUFRUF: POST ohne Body. Läuft ohne JWT (verify_jwt: false) — der Schlüssel
// liegt serverseitig, geschrieben wird nur in die eigene Tabelle.
//
// EINGELESEN AUS DER PRODUKTION (27.07.2026): Diese Funktion lief als v4 in
// Supabase, ohne je im Repo zu stehen. Damit war der Weg, über den Lauras
// Material in die App kommt, für niemanden sichtbar oder änderbar. Jetzt
// versioniert — Repo und Deployment sagen wieder dasselbe.
//
// GRENZE, die beim Anreichern zählt: `gemini-embedding-001` mit 768
// Dimensionen ist hier UND in interpret/generate fest verdrahtet. Beide Seiten
// müssen dasselbe Modell benutzen, sonst passen die Vektoren nicht mehr
// zusammen. Ein Modellwechsel heißt: die ganze Wissensbasis neu einbetten.

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "gemini-embedding-001";

async function embed(text: string, key: string) {
  const r = await fetch(`${BASE}/models/${MODEL}:embedContent?key=${key}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: `models/${MODEL}`, content: { parts: [{ text }] }, outputDimensionality: 768 }),
  });
  const data = await r.json();
  return { ok: r.ok, status: r.status, values: data?.embedding?.values ?? null, raw: data };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const key = (Deno.env.get("Gemini_API_Key") || Deno.env.get("GEMINI_API_KEY") || "").trim();
    if (!key) return json({ error: "no gemini key" }, 500);
    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: rows } = await svc.from("knowledge").select("id, title, body").is("embedding", null).limit(200);
    if (!rows?.length) return json({ ok: true, embedded: 0, note: "nothing to embed" });
    const probe = await embed(`${rows[0].title}. ${rows[0].body}`, key);
    if (!probe.ok || !probe.values) return json({ error: "embed failed", status: probe.status, raw: probe.raw }, 502);
    let n = 0;
    for (const row of rows) {
      const e = await embed(`${row.title}. ${row.body}`, key);
      if (!e.values) continue;
      const { error } = await svc.from("knowledge").update({ embedding: `[${e.values.join(",")}]` }).eq("id", row.id);
      if (!error) n++;
    }
    return json({ ok: true, embedded: n, of: rows.length, dims: probe.values.length });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { ...CORS, "Content-Type": "application/json" } }); }
