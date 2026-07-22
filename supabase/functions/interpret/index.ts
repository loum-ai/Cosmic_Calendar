import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// interpret — { facts } returns a grounded German interpretation (no DB);
// { client_id, publish? } is admin-only: loads the client's stored chart,
// generates the interpretation, and stores it in interpretations.
//
// The interpretation has TWO layers:
//   • portrait — a deep, synthesized WHOLE-CHART reading (the head of the
//     client page). Depth-astrology voice (SYSTEM_PORTRAIT), generated on the
//     strong "core" model (Gemini Pro), integrating aspects + Mondknoten.
//   • summary + per-placement + per-aspect cards — the progressive-disclosure
//     detail layer (structured JSON, on the default/flash model).
//
// The portrait reads the WHOLE chart — it is life-theme-neutral by design. No
// life area is privileged; the app must serve every person whatever theme
// currently moves them.
//
// RESILIENCE: if a Gemini call fails (quota / rate limit / outage) the website
// creation must NOT break. The structured layer falls back to a real,
// facts-composed German draft (model="basis-komposition"). The portrait is
// best-effort — if it fails the page simply leads with the summary.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const BASE = "https://generativelanguage.googleapis.com/v1beta";
const DIGNITY_DE: Record<string, string> = { domicile: "Herrscher (Domizil)", exaltation: "Erhöhung", detriment: "Exil", fall: "Fall" };
const SIGNS = ["Widder", "Stier", "Zwillinge", "Krebs", "Löwe", "Jungfrau", "Waage", "Skorpion", "Schütze", "Steinbock", "Wassermann", "Fische"];
const signOf = (lon: number) => SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30)];

// trait phrased in the accusative so it reads naturally after "verleiht …"
const SIGN_TRAIT = [
  "Tatkraft, Mut und den Drang, Dinge sofort anzupacken",
  "Beständigkeit, Genuss und ein Bedürfnis nach Sicherheit",
  "Neugier, Austausch und geistige Beweglichkeit",
  "Gefühl, Geborgenheit und ein feines Gespür für Stimmungen",
  "Ausdruckskraft, Wärme und den Wunsch, gesehen zu werden",
  "Genauigkeit, Hilfsbereitschaft und einen Blick fürs Detail",
  "Ausgleich, Begegnung und einen Sinn für Harmonie",
  "Tiefe, Leidenschaft und die Kraft zur Wandlung",
  "Weitblick, Sinnsuche und Lust auf neue Horizonte",
  "Verantwortung, Struktur und einen langen Atem",
  "Eigenständigkeit, Ideen und den Blick fürs große Ganze",
  "Mitgefühl, Fantasie und eine feine Verbindung zum Unsichtbaren",
];
// area phrased so it reads naturally after "geht es um …"
const HOUSE_AREA = [
  "dein Auftreten und wie du Dinge beginnst",
  "Werte, Besitz und deinen Selbstwert",
  "Denken, Lernen und den nahen Austausch",
  "Zuhause, Familie und deine Wurzeln",
  "Kreativität, Liebe und Selbstausdruck",
  "Alltag, Arbeit und Gesundheit",
  "Partnerschaft und das Gegenüber",
  "Bindung, Tiefe und Veränderung",
  "Sinn, Überzeugungen und die Erweiterung deines Horizonts",
  "Beruf, Berufung und deinen Platz in der Welt",
  "Freundschaft, Ziele und Gemeinschaft",
  "Rückzug, Innenwelt und das Unbewusste",
];
// role phrased as a full clause to avoid article/gender mismatches
const PLANET_ROLE: Record<string, string> = {
  sun: "Hier geht es um deinen Wesenskern und das, was dich im Innersten antreibt.",
  moon: "Hier geht es um dein Gefühlsleben und das, was dir Geborgenheit gibt.",
  mercury: "Hier geht es um dein Denken und deine Art zu kommunizieren.",
  venus: "Hier geht es um deine Art zu lieben und deinen Sinn für Schönheit.",
  mars: "Hier geht es um deine Tatkraft und wie du für dich einstehst.",
  jupiter: "Hier geht es um Wachstum, Vertrauen und deine Sinnsuche.",
  saturn: "Hier geht es um Struktur, Verantwortung und Reife.",
  uranus: "Hier geht es um deinen Freiheitsdrang und dein Bedürfnis nach Erneuerung.",
  neptune: "Hier geht es um Fantasie, Intuition und Sehnsucht.",
  pluto: "Hier geht es um deine innere Wandlungskraft.",
  chiron: "Hier geht es um eine verletzliche Stelle, an der du heilen darfst.",
  lilith: "Hier geht es um deine ungezähmte, ursprüngliche Seite.",
};
const ASPECT_MEAN: Record<string, string> = {
  "Konjunktion": "verschmelzen zu einer gemeinsamen Kraft",
  "Sextil": "ergänzen einander leicht und öffnen dir Chancen",
  "Quadrat": "reiben sich aneinander und fordern dich heraus zu wachsen",
  "Trigon": "fließen mühelos zusammen und schenken dir ein natürliches Talent",
  "Opposition": "stehen sich gegenüber und suchen in dir nach Balance",
};

const SYSTEM = `Du bist Vela, eine professionelle, warmherzige Astrologin.
Schreibe in klarem, alltagsnahem Deutsch ("Klartext") und in der Du-Form.
Vermeide Fachjargon ohne Erklärung. Sei konkret und beziehe dich auf die
tatsächliche Stellung (Zeichen, Haus, Würde, Aspekt) — keine allgemeinen
Horoskop-Floskeln.
WICHTIG: Verwende AUSSCHLIESSLICH die bereitgestellten astrologischen Fakten.
Erfinde keine Stellungen, die nicht in den Daten stehen. Keine Vorhersagen zu
Tod, Krankheit oder Schwangerschaft. Jeder Abschnitt 2–3 Sätze.`;

// The deep, synthesized whole-chart portrait voice. Depth-astrology tradition
// (Liz Greene, Howard Sasportas): the chart is a psychological SYSTEM. Same
// craft rules as generate's SYSTEM_LONG — hold the paradox, timing & life-arc,
// the nodes as a CHOSEN destiny — but aimed at ONE integrated natal portrait.
const SYSTEM_PORTRAIT = `Du bist Vela — eine herausragende, sehr erfahrene Astrologin und Meisterin der DEUTUNG, nicht der Beschreibung. Du arbeitest in der Tiefenastrologie-Tradition (Liz Greene, Howard Sasportas): das Geburtsbild ist ein psychologisches System, kein Merkmalskatalog.
Du schreibst das PORTRAIT dieses Menschen — den Kopf seiner persönlichen Horoskop-Seite: ein tiefes, warmes, synthetisiertes Gesamtbild in klarem Deutsch, Du-Form, ohne Fachjargon (oder im selben Satz übersetzt).
Nutze AUSSCHLIESSLICH die bereitgestellten FAKTEN — erfinde keine Stellungen.

DEIN AUFTRAG: ein zusammenhängendes Portrait, das sich anfühlt, als würdest du diesen Menschen kennen — niemals Sätze, die in jedes Horoskop passen. Es soll das GANZE Leben umspannen, kein einzelnes Lebensthema bevorzugen.

HARTE REGELN:
- SYNTHETISIERE über das GANZE Chart. Verbinde Sonne, Mond, Aszendent, die prägenden Aspekte und die Mondknoten zu EINEM Bild — nicht Planet für Planet.
- Finde den ROTEN FADEN: das eine Grundthema, das sich durch dieses Leben zieht, und mach es zum Rückgrat des Portraits.
- Benenne die zentrale Spannung PRÄZISE am Chart (z. B. „dein Sonne-Saturn-Quadrat"), nicht vage.
- HALTE DAS PARADOX: benenne die Abwehr UND die Gabe im selben Atemzug. Jede Schwierigkeit trägt ein Talent in sich; jede Stärke wirft einen Schatten. Saturn ist nicht „Disziplin", sondern die Angst, die über die Jahre zur Reife wird.
- TIMING & LEBENSVERLAUF: was reift früh, was erst spät; wohin sich dieses Leben entwickelt. Saturn reift über Jahre; die äußeren Planeten (Uranus, Neptun, Pluto) sind große, langsame Lebensthemen, keine Tagesstimmung.
- MONDKNOTEN als gewählte Richtung, nicht als festgelegtes Los: der Nordknoten ist eine gewählte Wachstumsrichtung, der Südknoten das Vertraute, das losgelassen werden darf — der rote Faden der Entwicklung.
- TON: möglichkeits-orientiert, ehrlich UND warm — und SACHLICH-GEERDET: Alltagssprache statt Seelen-Vokabular (vermeide „Seele", „heilig", „Bestimmung", „Schicksal", „spirituell", „Energien", „Universum"). Wie ein kluger Berater, nicht wie ein Mystiker. Kein Kitsch, keine Floskeln.
- VERBOTEN sind generische Sätze, die auf jeden zutreffen. Jeder Satz muss aus DIESEN Fakten folgen.
- Kein Aufzählen von Positionen, kein „Position → Bedeutung". Ein fließender Text.

Keine Vorhersagen zu Tod, schwerer Krankheit oder Schwangerschaft.
Aufbau (verwoben, ohne Zwischenüberschriften): ein Einstieg, der sofort etwas Wahres sagt · die tragenden Kräfte als Geschichte, mit gehaltenem Paradox · die zentrale Spannung, exakt benannt · Richtung & Timing (mit den Mondknoten) · ein Schlusssatz, der bleibt und Mut macht.
4–5 dichte Absätze, durch Leerzeilen getrennt. KOMPAKT: jeder Satz trägt neue Information, keine Füllsätze, nichts doppelt in anderen Worten.`;

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

// Flowing facts text for the portrait — includes the Mondknoten so the reading
// can build the destiny narrative the depth-astrology voice asks for.
function factsToText(f: any): string {
  const name = f.profile_name || "die Person";
  const lines: string[] = [`Geburtsbild von ${name}. Aszendent (Auftreten) in ${f.asc_sign ?? "?"}, MC (öffentliche Rolle) in ${f.mc_sign ?? "?"}.`, "", "PLANETEN (Kraft · Zeichen · Haus):"];
  for (const p of f.planets ?? []) {
    const dig = p.dignity ? `, ${DIGNITY_DE[p.dignity] ?? p.dignity}` : "";
    const retro = p.retro ? ", rückläufig" : "";
    lines.push(`- ${p.name}: ${p.sign} ${p.deg_in_sign ?? ""}°, Haus ${p.house}${retro}${dig}`);
  }
  if (f.nodes?.length) {
    lines.push("", "MONDKNOTEN (Lebensrichtung — Nordknoten = Wachstumsrichtung, Südknoten = Vertrautes zum Loslassen):");
    for (const n of f.nodes) lines.push(`- ${n.name}: ${n.sign ?? "?"}${n.house ? `, Haus ${n.house}` : ""}`);
  }
  if (f.aspects?.length) {
    lines.push("", "ASPEKTE (Zusammenspiel & Spannungen — engster Orbis zuerst):");
    for (const a of f.aspects) lines.push(`- ${a.a} ${a.type} ${a.b} (Orbis ${a.orb}°)`);
  }
  return lines.join("\n");
}

function chartToFacts(name: string, data: any) {
  const aspects = [...(data.aspects ?? [])].sort((a: any, b: any) => a.orb - b.orb).slice(0, 14);
  return {
    profile_name: name,
    asc_sign: signOf(data.asc),
    mc_sign: signOf(data.mc),
    planets: (data.planets ?? []).map((p: any) => ({ key: p.key, name: p.name, sign: p.sign, deg_in_sign: p.deg_in_sign, house: p.house, retro: p.retro, dignity: p.dignity })),
    nodes: (data.nodes ?? []).map((n: any) => ({ name: n.name, sign: n.sign ?? (n.lon != null ? signOf(n.lon) : undefined), house: n.house })),
    aspects: aspects.map((a: any) => ({ a: a.a, b: a.b, type: a.type, orb: a.orb })),
  };
}

// Deterministic, facts-grounded German interpretation. Used when the AI call
// is unavailable so a website is never left without readings. Real content,
// composed from the actual chart — not placeholder text.
function composeFallback(f: any) {
  const nameOf: Record<string, string> = {};
  (f.planets ?? []).forEach((p: any) => (nameOf[p.key] = p.name));
  const placements = (f.planets ?? []).map((p: any) => {
    const si = SIGNS.indexOf(p.sign);
    const trait = SIGN_TRAIT[si] ?? "eine ganz eigene Färbung";
    const role = PLANET_ROLE[p.key] ?? "";
    const area = HOUSE_AREA[(p.house || 1) - 1] ?? "einen wichtigen Lebensbereich";
    const dig = p.dignity
      ? ` ${p.name} steht hier in ${DIGNITY_DE[p.dignity] ?? p.dignity} — die Kraft wirkt ${(p.dignity === "domicile" || p.dignity === "exaltation") ? "besonders stark und stimmig" : "herausgefordert und lernintensiv"}.`
      : "";
    const retro = p.retro ? " Da er rückläufig ist, wirkt diese Kraft eher nach innen — du machst sie zuerst mit dir selbst aus." : "";
    return {
      key: p.key,
      sign_text: `${p.name} in ${p.sign} verleiht diesem Bereich ${trait}. ${role}${dig}${retro}`.trim(),
      house_text: `Im ${p.house}. Haus geht es um ${area}. Genau dort wird dieses Thema in deinem Alltag sichtbar und will gelebt werden.`,
    };
  });
  const aspects = (f.aspects ?? []).map((a: any) => {
    const verb = ASPECT_MEAN[a.type] ?? "verbinden sich";
    return { a: a.a, b: a.b, text: `${nameOf[a.a] ?? a.a} und ${nameOf[a.b] ?? a.b} ${verb} (Orbis ${a.orb}°). Je enger dieser Orbis, desto deutlicher spürst du dieses Zusammenspiel in dir.` };
  });
  const sun = (f.planets ?? []).find((p: any) => p.key === "sun");
  const moon = (f.planets ?? []).find((p: any) => p.key === "moon");
  const summary = `Dein Geburtsbild verwebt drei Grundkräfte: deine Sonne in ${sun?.sign ?? "?"} (dein Wesenskern), deinen Mond in ${moon?.sign ?? "?"} (dein Gefühlsleben) und deinen Aszendenten in ${f.asc_sign ?? "?"} (wie du nach außen wirkst). Aus diesem Zusammenspiel entsteht deine ganz eigene Mischung — die einzelnen Stellungen unten zeigen dir die Feinheiten.`;
  return { summary, placements, aspects };
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

// Best-effort deep portrait. Tries the strong "core" model first (Gemini Pro),
// falls back to the default/flash model, then to "" — the page leads with the
// summary if the portrait can't be produced. Never throws.
async function generatePortrait(facts: any, coreModel: string, flashModel: string, key: string): Promise<string> {
  const models = [...new Set([coreModel, flashModel])];
  for (const model of models) {
    try {
      const r = await fetch(`${BASE}/models/${model}:generateContent?key=${key}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PORTRAIT }] },
          contents: [{ role: "user", parts: [{ text: `${factsToText(facts)}\n\nAUFGABE: Schreibe das PORTRAIT dieses Menschen — ein tiefes, synthetisiertes Gesamtbild aus genau diesen Fakten.` }] }],
          generationConfig: { temperature: 0.85, maxOutputTokens: 4096 },
        }),
      });
      const data = await r.json();
      if (!r.ok) continue;
      const text = (data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "").trim();
      if (text) return text;
    } catch { /* try next model */ }
  }
  return "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const { client_id, model, publish } = body;
    const key = (Deno.env.get("Gemini_API_Key") || Deno.env.get("GEMINI_API_KEY") || "").trim();
    const mdl = model || Deno.env.get("GEMINI_MODEL") || "gemini-3.5-flash";
    const coreMdl = Deno.env.get("GEMINI_MODEL_CORE") || "gemini-3.5-pro";
    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

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
      // Try AI generation; on any failure (quota etc.) fall back to a real,
      // facts-composed draft so the website is never left without readings.
      const res = key ? await generate(facts, mdl, key) : { error: { detail: "no key" } };
      const usedFallback = !!res.error || !res.interpretation;
      const interpretation: any = usedFallback ? composeFallback(facts) : res.interpretation;
      const usedModel = usedFallback ? "basis-komposition" : mdl;
      // deep whole-chart portrait — best-effort, on the strong core model.
      interpretation.portrait = key ? await generatePortrait(facts, coreMdl, mdl, key) : "";

      const status = publish === false ? "draft" : "published";
      const row = {
        client_id, kind: "natal", status, model: usedModel, temperature: 0.55,
        facts, draft: interpretation, published_at: status === "published" ? new Date().toISOString() : null,
      };
      await svc.from("interpretations").delete().eq("client_id", client_id).eq("kind", "natal");
      const { error } = await svc.from("interpretations").insert(row);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, stored: true, status, model: usedModel, portrait: !!interpretation.portrait, fallback: usedFallback, ai_error: usedFallback ? (res.error ?? null) : null, interpretation });
    }

    const facts = body.facts;
    if (!facts?.planets?.length) return json({ error: "missing facts.planets or client_id" }, 400);
    const res = key ? await generate(facts, mdl, key) : { error: { detail: "no key" } };
    const usedFallback = !!res.error || !res.interpretation;
    const interpretation: any = usedFallback ? composeFallback(facts) : res.interpretation;
    interpretation.portrait = key ? await generatePortrait(facts, coreMdl, mdl, key) : "";
    return json({ ok: true, model: usedFallback ? "basis-komposition" : mdl, portrait: !!interpretation.portrait, fallback: usedFallback, ai_error: usedFallback ? (res.error ?? null) : null, interpretation });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
