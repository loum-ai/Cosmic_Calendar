import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const BASE = "https://generativelanguage.googleapis.com/v1beta";
const EMBED_MODEL = "gemini-embedding-001";

const SYSTEM_SHORT = `Du bist Vela, eine professionelle, warmherzige Astrologin.
Schreibe klares, alltagsnahes Deutsch ("Klartext") in der Du-Form.
Nutze AUSSCHLIESSLICH die bereitgestellten FAKTEN — erfinde keine Stellungen.
Das FACHWISSEN dient nur zur fachlich korrekten Orientierung; zitiere es nicht
wörtlich, sondern wende es auf die konkreten Fakten an.
Sei konkret, beziehe dich auf die echten Daten (Zeichen, Haus, Aspekt).
Keine Vorhersagen zu Tod, schwerer Krankheit oder Schwangerschaft.
Antworte knapp und auf den Punkt, ohne Floskeln.
Schreibe IMMER bis zum Satzende — brich niemals mitten im Satz ab.`;

// The expensive-core reading voice. Depth-astrology tradition (Liz Greene,
// Howard Sasportas): the chart is a psychological SYSTEM, not a trait list.
// Craft rules distilled from the astro.com analysis — hold the paradox
// (defense AND gift), timing/life-phase as a duty, the nodes as a CHOSEN
// destiny rather than fate. Selected by `long: true`.
const SYSTEM_LONG = `Du bist Vela — eine herausragende, sehr erfahrene Astrologin und Meisterin der DEUTUNG, nicht der Beschreibung. Du arbeitest in der Tiefenastrologie-Tradition (Liz Greene, Howard Sasportas): das Chart ist ein psychologisches System, kein Merkmalskatalog.
Schreibe warmes, klares Deutsch in der Du-Form, ohne Fachjargon (oder übersetze ihn im selben Satz).
Nutze AUSSCHLIESSLICH die bereitgestellten FAKTEN — erfinde keine Stellungen. Das FACHWISSEN wendest du an, ohne es zu zitieren.

DEIN AUFTRAG: eine tiefe, sehr persönliche Deutung, die sich anfühlt, als würdest du DIESEN Menschen kennen — niemals Sätze, die in jedes Horoskop passen.

HARTE REGELN:
- SYNTHETISIERE statt zu beschreiben. Verbinde mehrere Faktoren (Planet + Zeichen + Haus + der EXAKTE Aspekt + Mondknoten) zu EINER zusammenhängenden Aussage über den Menschen.
- Benenne die zentrale Spannung PRÄZISE am Chart (z. B. „dein Sonne-Saturn-Quadrat"), nicht vage („manchmal streng zu dir").
- HALTE DAS PARADOX: benenne die Abwehr UND die Gabe zusammen. Jede Schwierigkeit trägt ein Talent in sich; jede Stärke wirft einen Schatten. Nie nur Diagnose, nie nur Lob — beide Seiten zusammen. Saturn ist nicht „Disziplin", sondern die Angst, die über die Jahre zur Reife wird.
- TIMING & LEBENSVERLAUF sind Pflicht, nicht Kür: was reift früh, was erst spät; wann im Leben eine Kraft anspringt oder eine Wende reif wird. Saturn reift über Jahre; die äußeren Planeten (Uranus, Neptun, Pluto) sind große, langsame Lebensthemen, keine Tagesstimmung. Sag, WANN — nicht nur, DASS.
- MONDKNOTEN als Bestimmung, nicht als Schicksal: der Nordknoten ist eine GEWÄHLTE Wachstumsrichtung (wohin es sich entwickeln will), der Südknoten das Vertraute, Mitgebrachte, das losgelassen werden darf. Deute die Knotenachse als roten Faden der Entwicklung in genau diesem Thema — als Richtung, die der Mensch wählen kann, nicht als vorbestimmtes Los.
- TON: möglichkeits-orientiert. Zeige latentes Potenzial, öffne Hoffnung — ohne zu beschönigen. Ehrlich UND warm.
- VERBOTEN sind generische Floskeln, die auf jeden zutreffen. Jeder Satz muss zwingend aus DIESEN Fakten folgen.
- Kein Aufzählen von Positionen, kein „Position → Bedeutung". Ein flüssiger Text.
- FORMEL-VERBOT: nie „Das merkst du, wenn …", nie ein Satzanfang mit „Gleichzeitig", nie „im selben Atemzug", „deine Gabe ist", „die Falle ist", „genau hier liegt". Höchstens einmal pro Abschnitt eine „nicht X, sondern Y"-Konstruktion. Variiere den Satzbau.

DRAMATURGIE (fünf Ebenen, ineinander verwoben, ohne Zwischenüberschriften):
1) Der rote Faden: ein Einstieg, der sofort etwas Wahres über die Person sagt.
2) Die Kräfte, narrativ: nur die für das Thema relevanten Stellungen als Geschichte, mit gehaltenem Paradox.
3) Die Spannung: der zentrale innere Konflikt/die Falle, exakt am Chart benannt.
4) Die Richtung & das Timing: wohin die Entwicklung geht, wann im Leben — die Mondknoten als gewählte Richtung.
5) Die persönliche Wahrheit: ein Schlusssatz, der bleibt, Mut macht und die Person meint.

Keine Vorhersagen zu Tod, schwerer Krankheit oder Schwangerschaft.
6–9 dichte Absätze. Nimm dir Raum — sei nicht knapp. Schreibe IMMER bis zum Satzende — brich niemals mitten im Satz ab.`;

/** Nur die sichtbaren Teile der Antwort. Denk-Modelle liefern zusätzlich
 *  `thought`-Parts — die gehören nicht in den Text des Kunden. */
function partsText(d: unknown): string {
  const parts = (d as any)?.candidates?.[0]?.content?.parts ?? [];
  return parts.filter((p: any) => !p?.thought).map((p: any) => p?.text ?? "").join("").trim();
}
const finishOf = (d: unknown) => String((d as any)?.candidates?.[0]?.finishReason ?? "");
const ENDS = /[.!?…»"“)\]]$/;

/** Ein mitten im Satz abgebrochener Text wird auf den letzten vollständigen
 *  Satz zurückgeschnitten — lieber kürzer als abgehackt. Bleibt danach weniger
 *  als die Hälfte übrig, ist der Rest wertlos und der Text kommt roh zurück
 *  (dann greift oben der zweite Versuch). */
function trimToSentence(t: string): string {
  const m = t.match(/^[\s\S]*[.!?…»"“](?=\s|$)/);
  const cut = m ? m[0].trim() : "";
  return cut.length >= t.length * 0.5 ? cut : t;
}

/**
 * Denk-Budget und Ausgabe-Budget.
 *
 * WARUM SO: Bei Gemini zählen die Denk-Tokens GEGEN `maxOutputTokens` — beides
 * teilt sich EIN Budget. Mit den alten 2048 fraß das Nachdenken fast alles auf;
 * übrig blieben ~120 sichtbare Tokens, und der Text brach mitten im Wort ab
 * (gemessen: 25 von 203 gecachten Deutungen ohne Satzende). Deshalb: knappes
 * Denk-Budget für die kurzen Tap-Deutungen, großzügiges Gesamt-Budget überall.
 * Pro-Modelle akzeptieren kein Budget 0 — 128 ist dort das Minimum.
 */
function genConfig(long: boolean, mdl: string) {
  const pro = /pro/i.test(mdl);
  return {
    temperature: long ? 0.8 : 0.75,
    topP: 0.95,
    maxOutputTokens: long ? 16384 : 4096,
    thinkingConfig: { thinkingBudget: long ? (pro ? 4096 : 2048) : pro ? 128 : 0 },
  };
}

async function embed(text: string, key: string): Promise<number[] | null> {
  try {
    const r = await fetch(`${BASE}/models/${EMBED_MODEL}:embedContent?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: `models/${EMBED_MODEL}`, content: { parts: [{ text }] }, outputDimensionality: 768 }),
    });
    const d = await r.json();
    return r.ok ? (d?.embedding?.values ?? null) : null;
  } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const { chart_hash, cacheKey, context, task, model, long } = body;
    if (!task) return json({ error: "missing task" }, 400);

    const key = (Deno.env.get("Gemini_API_Key") || Deno.env.get("GEMINI_API_KEY") || "").trim();
    if (!key) return json({ error: "Gemini key not configured" }, 500);
    const mdl = model || Deno.env.get("GEMINI_MODEL") || "gemini-3.5-flash";
    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (chart_hash && cacheKey) {
      const { data: hit } = await svc.from("readings_cache").select("data").eq("chart_hash", chart_hash).eq("view", cacheKey).maybeSingle();
      if (hit?.data?.text) return json({ ok: true, text: hit.data.text, cached: true });
    }

    let wissen = "";
    const qv = await embed(task, key);
    if (qv) {
      const { data: matches } = await svc.rpc("match_knowledge", { query_embedding: `[${qv.join(",")}]`, match_count: long ? 6 : 4 });
      if (matches?.length) wissen = matches.map((m: any) => `- ${m.title}: ${m.body}`).join("\n");
    }

    const prompt = `${wissen ? `FACHWISSEN (zur Orientierung, nicht zitieren):\n${wissen}\n\n` : ""}FAKTEN:\n${context || "(keine)"}\n\nAUFGABE:\n${task}`;
    const gen = async (cfg: Record<string, unknown>) => {
      const r = await fetch(`${BASE}/models/${mdl}:generateContent?key=${key}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: long ? SYSTEM_LONG : SYSTEM_SHORT }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: cfg,
        }),
      });
      return { ok: r.ok, status: r.status, data: await r.json() };
    };

    const cfg = genConfig(!!long, mdl);
    let res = await gen(cfg);
    // Modelle ohne Denk-Steuerung lehnen `thinkingConfig` ab — dann ohne.
    if (!res.ok && res.status === 400 && /thinking/i.test(JSON.stringify(res.data))) {
      const { thinkingConfig: _drop, ...plain } = cfg;
      res = await gen(plain);
    }
    if (!res.ok) return json({ error: "gemini_error", detail: res.data }, 502);

    let text = partsText(res.data);
    let abgebrochen = finishOf(res.data) === "MAX_TOKENS" || (!!text && !ENDS.test(text));
    // Zweiter Versuch mit doppeltem Budget, statt einen halben Satz auszuliefern.
    if (abgebrochen || !text) {
      const retry = await gen({ ...cfg, maxOutputTokens: cfg.maxOutputTokens * 2 });
      const t2 = partsText(retry.data);
      if (retry.ok && t2.length > text.length) {
        text = t2;
        abgebrochen = finishOf(retry.data) === "MAX_TOKENS" || !ENDS.test(t2);
      }
    }
    if (!text) return json({ error: "empty", detail: res.data }, 502);
    if (abgebrochen) text = trimToSentence(text);

    // Ein weiterhin abgeschnittener Text darf NICHT in den Cache — sonst liest
    // ihn jeder Kunde mit demselben Chart für immer.
    if (chart_hash && cacheKey && ENDS.test(text)) {
      await svc.from("readings_cache").upsert({ chart_hash, view: cacheKey, data: { text }, model: mdl });
    }
    return json({ ok: true, text, cached: false, grounded: !!wissen, truncated: !ENDS.test(text) });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
