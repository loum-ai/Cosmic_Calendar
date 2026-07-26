import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// interpret — { facts } returns a grounded German interpretation (no DB);
// { client_id, publish? } is admin-only: loads the client's stored chart,
// generates the interpretation, and stores it in interpretations.
//
// TWO layers: portrait (deep whole-chart, SYSTEM_PORTRAIT, core model, RAG)
// + summary/placements/aspects cards (structured JSON detail layer). Both are
// grounded in the curated knowledge base via match_knowledge (RAG). Theme-
// neutral by design. Resilient: on Gemini failure the structured layer falls
// back to a facts-composed draft; the portrait is best-effort.
//
// PUNKTE (2026-07): Der Detail-Layer deckt neben den Planeten auch den
// Aszendenten und die beiden Mondknoten ab. Ohne sie fielen deren Sheets in
// der App auf die generische Zeichen-Zeile zurück, die jeder Mensch mit
// diesem Zeichen wortgleich liest.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const BASE = "https://generativelanguage.googleapis.com/v1beta";
const EMBED_MODEL = "gemini-embedding-001";
const DIGNITY_DE: Record<string, string> = { domicile: "Herrscher (Domizil)", exaltation: "Erhöhung", detriment: "Exil", fall: "Fall" };
const SIGNS = ["Widder", "Stier", "Zwillinge", "Krebs", "Löwe", "Jungfrau", "Waage", "Skorpion", "Schütze", "Steinbock", "Wassermann", "Fische"];
const signOf = (lon: number) => SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30)];

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

const SYSTEM_PORTRAIT = `Du bist Vela — eine herausragende, sehr erfahrene Astrologin und Meisterin der DEUTUNG, nicht der Beschreibung. Du arbeitest in der Tiefenastrologie-Tradition (Liz Greene, Howard Sasportas): das Geburtsbild ist ein psychologisches System, kein Merkmalskatalog.
Du schreibst das PORTRAIT dieses Menschen — den Kopf seiner persönlichen Horoskop-Seite: ein tiefes, warmes, synthetisiertes Gesamtbild in klarem Deutsch, Du-Form, ohne Fachjargon (oder im selben Satz übersetzt).
Nutze AUSSCHLIESSLICH die bereitgestellten FAKTEN — erfinde keine Stellungen. Das FACHWISSEN wendest du an, ohne es zu zitieren.

DEIN AUFTRAG: ein zusammenhängendes Portrait, das sich anfühlt, als würdest du diesen Menschen kennen — niemals Sätze, die in jedes Horoskop passen. Es soll das GANZE Leben umspannen, kein einzelnes Lebensthema bevorzugen.

HARTE REGELN:
- SYNTHETISIERE über das GANZE Chart. Verbinde Sonne, Mond, Aszendent, die prägenden Aspekte und die Mondknoten zu EINEM Bild — nicht Planet für Planet.
- Finde den ROTEN FADEN: das eine Grundthema, das sich durch dieses Leben zieht.
- Benenne die zentrale Spannung PRÄZISE am Chart (z. B. „dein Sonne-Saturn-Quadrat"), nicht vage.
- HALTE DAS PARADOX: benenne die Abwehr UND die Gabe zusammen. Saturn ist nicht „Disziplin", sondern die Angst, die über die Jahre zur Reife wird.
- TIMING & LEBENSVERLAUF: was reift früh, was erst spät; wohin sich dieses Leben entwickelt. Saturn reift über Jahre; Uranus/Neptun/Pluto sind große, langsame Lebensthemen.
- MONDKNOTEN als gewählte Bestimmung, nicht als Schicksal: Nordknoten = gewählte Wachstumsrichtung, Südknoten = das Vertraute zum Loslassen.
- TON: möglichkeits-orientiert, ehrlich UND warm. Kein Kitsch, keine Floskeln.
- VERBOTEN sind generische Sätze, die auf jeden zutreffen. Jeder Satz muss aus DIESEN Fakten folgen.
- FORMEL-VERBOT: nie „Das merkst du, wenn …", nie ein Satzanfang mit „Gleichzeitig", nie „im selben Atemzug", „deine Gabe ist", „die Falle ist", „genau hier liegt".
- Kein Aufzählen von Positionen. Ein fließender Text.

Keine Vorhersagen zu Tod, schwerer Krankheit oder Schwangerschaft.
Aufbau (verwoben, ohne Zwischenüberschriften): ein Einstieg, der sofort etwas Wahres sagt · die tragenden Kräfte als Geschichte, mit gehaltenem Paradox · die zentrale Spannung, exakt benannt · Richtung & Timing (mit den Mondknoten) · ein Schlusssatz, der bleibt und Mut macht.
5–7 dichte Absätze, durch Leerzeilen getrennt. Schreibe IMMER bis zum Satzende — brich niemals mitten im Satz ab.`;

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

/**
 * Ausgabe-Budget — zweimal am 25.07. falsch gewählt, hier die Chronik.
 *
 * 1) Ein `thinkingConfig` kam dazu. Elf Minuten später wurde der erste neue
 *    Kunde (Marco) gedeutet: beide Gemini-Aufrufe scheiterten, die
 *    Notfall-Schablone übernahm, kein Portrait.
 * 2) Das Feld raus, aber `maxOutputTokens` blieb auf 16384 — der zweite Lauf
 *    scheiterte genauso. Die Logs zeigten HTTP 200 in 1,3–3,2 s; eine echte
 *    Erzeugung dauert 10–30 s. Das war die Zeit für einen abgelehnten Aufruf
 *    plus Schablone. Auch der Rückfall-Anlauf schleppte die 16384 mit und
 *    scheiterte deshalb identisch.
 *
 * 3) NACHTRAG 26.07., gemessen statt vermutet: Beide Diagnosen oben waren
 *    falsch. Marcos Läufe scheiterten an der Abrechnung — erst 429
 *    (Tageskontingent 250 für gemini-3.1-pro), dann "prepayment credits are
 *    depleted". Ein abgelehnter Aufruf kommt in 1–3 s zurück, genau die
 *    Laufzeiten, die als Beleg für die Budget-Theorie gedient hatten.
 *
 *    Nach dem Aufladen zeigte sich der ECHTE Budget-Fehler, und er lief in die
 *    andere Richtung: `finishReason: MAX_TOKENS`. Das Modell hatte bereits
 *    einen persönlichen Text begonnen ("Marco, dein Horoskop zeigt eine starke
 *    Betonung des Erd-Elements …") und wurde mittendrin abgeschnitten. Bei
 *    gemini-3.1-pro zählen die Denk-Tokens gegen dasselbe Budget; 8192 reichen
 *    für Denken + strukturiertes JSON nicht. Das Absenken von 16384 auf 8192
 *    war also die falsche Konsequenz aus einer falschen Ursache.
 *
 * Lehre: erst den Fehlertext lesen, dann an Zahlen drehen. `ai_error` trägt
 * bei einem abgeschnittenen 200 kein `detail.error.message`, sondern
 * `parse` + `finishReason` — wer nur auf die Fehlermeldung schaut, sieht "kein
 * Fehler" und dreht am falschen Rad.
 */
const BUDGET_STRUKTUR = 24576;
const BUDGET_PORTRAIT = 8192;

/** Bricht der Text mitten im Satz ab, lieber auf den letzten ganzen Satz
 *  zurückschneiden als einen halben ausliefern. */
function trimToSentence(t: string): string {
  if (/[.!?…»"“)\]]$/.test(t)) return t;
  const m = t.match(/^[\s\S]*[.!?…»"“](?=\s|$)/);
  const cut = m ? m[0].trim() : "";
  return cut.length >= t.length * 0.5 ? cut : t;
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

// RAG: pull the most relevant curated knowledge for this chart, so every
// reading is grounded in the validated Signifikationen base.
async function fachwissen(query: string, key: string, svc: any): Promise<string> {
  const qv = await embed(query, key);
  if (!qv) return "";
  const { data: matches } = await svc.rpc("match_knowledge", { query_embedding: `[${qv.join(",")}]`, match_count: 8 });
  return matches?.length ? matches.map((m: any) => `- ${m.title}: ${m.body}`).join("\n") : "";
}

/** Aszendent + Mondknoten als eigene Punkte — key exakt so, wie die App sie
 *  nachschlägt (asc, node_n, node_s). */
function pointsOf(f: any): { key: string; label: string; sign: string; house: number | null; rolle: string }[] {
  const out: { key: string; label: string; sign: string; house: number | null; rolle: string }[] = [];
  if (f.asc_sign) out.push({ key: "asc", label: "Aszendent", sign: f.asc_sign, house: 1, rolle: "wie diese Person auftritt, bevor sie ein Wort sagt — der erste Eindruck" });
  for (const n of f.nodes ?? []) {
    const north = /auf|nord|north/i.test(n.name ?? "");
    out.push({
      key: north ? "node_n" : "node_s",
      label: n.name,
      sign: n.sign ?? "?",
      house: n.house ?? null,
      rolle: north
        ? "Wachstumsrichtung — wohin sich dieses Leben entwickeln will; eine wählbare Entwicklung, kein festgelegtes Los"
        : "das Vertraute, Mitgebrachte — Gaben, die schon da sind, und zugleich die Komfortzone, die nach und nach gelockert werden darf",
    });
  }
  return out;
}

function factsToPrompt(f: any): string {
  const name = f.profile_name || "die Person";
  const lines: string[] = [`Geburtsbild von ${name}. Aszendent in ${f.asc_sign ?? "?"}, MC in ${f.mc_sign ?? "?"}.`, "", "PLANETEN (nur diese Fakten verwenden):"];
  for (const p of f.planets ?? []) {
    const dig = p.dignity ? `, ${DIGNITY_DE[p.dignity] ?? p.dignity}` : "";
    const retro = p.retro ? ", rückläufig" : "";
    lines.push(`- ${p.name} (key=${p.key}): ${p.sign} ${p.deg_in_sign ?? ""}°, Haus ${p.house}${retro}${dig}`);
  }
  const points = pointsOf(f);
  if (points.length) {
    lines.push("", "WEITERE PUNKTE (dieselbe Behandlung wie ein Planet — key exakt übernehmen):");
    for (const pt of points) lines.push(`- ${pt.label} (key=${pt.key}): ${pt.sign}${pt.house ? `, Haus ${pt.house}` : ""} — ${pt.rolle}`);
  }
  if (f.aspects?.length) {
    lines.push("", "ASPEKTE (Orbis in Grad):");
    for (const a of f.aspects) lines.push(`- ${a.a} ${a.type} ${a.b} (Orbis ${a.orb}°)`);
  }
  lines.push(
    "",
    "Aufgabe: Schreibe (1) eine 'summary' (Gesamtbild, 3–4 Sätze), (2) für JEDEN Planeten UND",
    "JEDEN weiteren Punkt oben einen 'sign_text' und 'house_text', key exakt wie angegeben,",
    "und (3) zu JEDEM Aspekt einen 'text'. Deutsch, Du-Form, konkret.",
    "Antworte AUSSCHLIESSLICH mit einem JSON-Objekt dieser Form, ohne Text davor oder danach:",
    '{"summary":"…","placements":[{"key":"sun","sign_text":"…","house_text":"…"}],"aspects":[{"a":"sun","b":"moon","text":"…"}]}',
  );
  return lines.join("\n");
}

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
  // Die App zeigt JEDEN Aspekt innerhalb 6° Orbis. Bei 14 blieben gemessen
  // 13 von 27 Verbindungen (Kunde Max) ohne Deutung und fielen auf die
  // Schablone zurück. 30 deckt auch dicht besetzte Charts ab.
  const aspects = [...(data.aspects ?? [])].sort((a: any, b: any) => a.orb - b.orb).slice(0, 30);
  return {
    profile_name: name,
    asc_sign: signOf(data.asc),
    mc_sign: signOf(data.mc),
    planets: (data.planets ?? []).map((p: any) => ({ key: p.key, name: p.name, sign: p.sign, deg_in_sign: p.deg_in_sign, house: p.house, retro: p.retro, dignity: p.dignity })),
    nodes: (data.nodes ?? []).map((n: any) => ({ name: n.name, sign: n.sign ?? (n.lon != null ? signOf(n.lon) : undefined), house: n.house })),
    aspects: aspects.map((a: any) => ({ a: a.a, b: a.b, type: a.type, orb: a.orb })),
  };
}

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
  // Aszendent + Mondknoten auch im Notfall-Pfad, sonst fallen ihre Sheets auf
  // die generische Zeichen-Zeile zurück.
  for (const pt of pointsOf(f)) {
    const si = SIGNS.indexOf(pt.sign);
    const trait = si >= 0 ? SIGN_TRAIT[si] : "eine ganz eigene Färbung";
    const area = pt.house ? HOUSE_AREA[pt.house - 1] ?? "einen wichtigen Lebensbereich" : null;
    placements.push({
      key: pt.key,
      sign_text: pt.key === "asc"
        ? `Dein Aszendent steht in ${pt.sign}: So trittst du auf, bevor du ein Wort sagst — nach außen wirkst du über ${trait}.`
        : pt.key === "node_n"
          ? `Dein aufsteigender Mondknoten in ${pt.sign} zeigt deine Wachstumsrichtung: ${trait} zu entwickeln fühlt sich anfangs ungewohnt an — und ist doch die Richtung, in der vieles leichter wird.`
          : `Dein absteigender Mondknoten in ${pt.sign} ist dein vertrautes Terrain: ${trait} fällt dir leicht. Genau das darfst du würdigen und nach und nach lockern, statt dich darin einzurichten.`,
      house_text: area
        ? `Im ${pt.house}. Haus geht es um ${area}. Dort wird dieser Teil von dir im Alltag sichtbar.`
        : "",
    });
  }
  const aspects = (f.aspects ?? []).map((a: any) => {
    const verb = ASPECT_MEAN[a.type] ?? "verbinden sich";
    return { a: a.a, b: a.b, text: `${nameOf[a.a] ?? a.a} und ${nameOf[a.b] ?? a.b} ${verb} (Orbis ${a.orb}°). Je enger dieser Orbis, desto deutlicher spürst du dieses Zusammenspiel in dir.` };
  });
  const sun = (f.planets ?? []).find((p: any) => p.key === "sun");
  const moon = (f.planets ?? []).find((p: any) => p.key === "moon");
  const summary = `Dein Geburtsbild verwebt drei Grundkräfte: deine Sonne in ${sun?.sign ?? "?"} (dein Wesenskern), deinen Mond in ${moon?.sign ?? "?"} (dein Gefühlsleben) und deinen Aszendenten in ${f.asc_sign ?? "?"} (wie du nach außen wirkst). Aus diesem Zusammenspiel entsteht deine ganz eigene Mischung.`;
  return { summary, placements, aspects };
}

/**
 * Die strukturierte Ebene. Zwei Anläufe, bevor die Notfall-Schablone greift —
 * ein einzelner 429/503/400 darf einen Kunden nicht in generische Texte
 * kippen lassen (genau das ist Marco am 25.07. passiert).
 */
async function generate(facts: any, model: string, key: string, wissen: string) {
  const sys = wissen ? `${SYSTEM}\n\nFACHWISSEN (zur Orientierung, nicht zitieren):\n${wissen}` : SYSTEM;
  const versuch = async (cfg: Record<string, unknown>) => {
    const r = await fetch(`${BASE}/models/${model}:generateContent?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sys }] },
        contents: [{ role: "user", parts: [{ text: factsToPrompt(facts) }] }],
        generationConfig: cfg,
      }),
    });
    return { ok: r.ok, status: r.status, data: await r.json() };
  };
  // Drei Anläufe mit steigendem Budget. Wichtig: ein Anlauf gilt auch dann als
  // gescheitert, wenn HTTP 200 kam, der Text aber abgeschnitten und damit kein
  // gültiges JSON ist (finishReason MAX_TOKENS). Vorher wurde nur auf !r.ok
  // geprüft — ein abgeschnittener Erfolg löste keinen Neuversuch aus und fiel
  // still in die Schablone.
  const stufen = [
    { temperature: 0.55, maxOutputTokens: BUDGET_STRUKTUR, responseMimeType: "application/json", responseJsonSchema: SCHEMA },
    { temperature: 0.55, maxOutputTokens: BUDGET_STRUKTUR * 2, responseMimeType: "application/json" },
    { temperature: 0.55, maxOutputTokens: BUDGET_STRUKTUR * 3 },
  ];

  let letzterFehler: Record<string, unknown> = { detail: "kein Anlauf ausgeführt" };
  for (let i = 0; i < stufen.length; i++) {
    const r = await versuch(stufen[i]);
    if (!r.ok) {
      console.error(`interpret: Anlauf ${i} abgelehnt, Status ${r.status}`, JSON.stringify(r.data).slice(0, 400));
      letzterFehler = { status: r.status, detail: r.data };
      continue;
    }
    let text = (r.data?.candidates?.[0]?.content?.parts?.filter((p: any) => !p?.thought).map((p: any) => p.text ?? "").join("") ?? "").trim();
    // Ohne Schema kann Gemini das JSON in einen Code-Block packen.
    const zaun = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (zaun) text = zaun[1].trim();
    try {
      return { interpretation: JSON.parse(text) };
    } catch {
      const grund = r.data?.candidates?.[0]?.finishReason;
      console.error(`interpret: Anlauf ${i} unlesbar (${grund}), Budget ${stufen[i].maxOutputTokens}`, text.slice(0, 300));
      letzterFehler = { parse: text.slice(0, 400), finishReason: grund, budget: stufen[i].maxOutputTokens };
    }
  }
  console.error("interpret: alle Anläufe gescheitert", JSON.stringify(letzterFehler).slice(0, 700));
  return { error: letzterFehler };
}

async function generatePortrait(facts: any, coreModel: string, flashModel: string, key: string, wissen: string): Promise<string> {
  const sys = wissen ? `${SYSTEM_PORTRAIT}\n\nFACHWISSEN (zur Orientierung, nicht zitieren):\n${wissen}` : SYSTEM_PORTRAIT;
  const models = [...new Set([coreModel, flashModel])];
  for (const model of models) {
    for (const budget of [BUDGET_PORTRAIT, 2048]) {
      try {
        const r = await fetch(`${BASE}/models/${model}:generateContent?key=${key}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: sys }] },
            contents: [{ role: "user", parts: [{ text: `${factsToText(facts)}\n\nAUFGABE: Schreibe das PORTRAIT dieses Menschen — ein tiefes, synthetisiertes Gesamtbild aus genau diesen Fakten.` }] }],
            generationConfig: { temperature: 0.85, maxOutputTokens: budget },
          }),
        });
        const data = await r.json();
        if (!r.ok) { console.error(`interpret/portrait: ${model} @${budget} Status ${r.status}`, JSON.stringify(data).slice(0, 400)); continue; }
        const text = (data?.candidates?.[0]?.content?.parts?.filter((p: any) => !p?.thought).map((p: any) => p.text ?? "").join("") ?? "").trim();
        if (text) return trimToSentence(text);
      } catch (e) { console.error(`interpret/portrait: ${model} Ausnahme`, String(e)); }
    }
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
      const wissen = key ? await fachwissen(factsToText(facts), key, svc) : "";
      const res = key ? await generate(facts, mdl, key, wissen) : { error: { detail: "no key" } };
      const usedFallback = !!res.error || !res.interpretation;
      const interpretation: any = usedFallback ? composeFallback(facts) : res.interpretation;
      const usedModel = usedFallback ? "basis-komposition" : mdl;
      interpretation.portrait = key ? await generatePortrait(facts, coreMdl, mdl, key, wissen) : "";

      // SCHUTZ (nach dem Vorfall vom 25.07.): Eine fehlgeschlagene Erzeugung
      // darf eine vorhandene, echte Deutung NICHT durch die Notfall-Schablone
      // ersetzen. Vorher wurde erst gelöscht und dann eingefügt — wer schon
      // eine gute Deutung hatte, verlor sie bei jedem misslungenen Neulauf.
      if (usedFallback) {
        const { data: alt } = await svc
          .from("interpretations").select("id, model").eq("client_id", client_id).eq("kind", "natal").maybeSingle();
        if (alt && alt.model !== "basis-komposition") {
          return json({
            error: "generation_failed",
            hinweis: "Die Erzeugung ist fehlgeschlagen. Die vorhandene Deutung bleibt unangetastet — bitte erneut versuchen.",
            ai_error: res.error ?? null,
          }, 502);
        }
      }

      // Eine Schablone wird NIE veröffentlicht — auch dann nicht, wenn der
      // Kunde noch gar keine Deutung hatte. Genau so ist Marco am 25.07. zu
      // einem Baukasten-Text gekommen, der dann live stand: die Erzeugung
      // scheiterte an den Token-Budgets, der Notfall sprang ein, und weil
      // keine ältere Deutung existierte, ging er als "published" durch.
      // Sie wird als Entwurf abgelegt, damit im Cockpit sichtbar bleibt, was
      // schiefging — aber der Klienten-Link liefert sie nicht aus.
      const status = publish === false || usedFallback ? "draft" : "published";
      const row = {
        client_id, kind: "natal", status, model: usedModel, temperature: 0.55,
        facts, draft: interpretation, published_at: status === "published" ? new Date().toISOString() : null,
      };
      await svc.from("interpretations").delete().eq("client_id", client_id).eq("kind", "natal");
      const { error } = await svc.from("interpretations").insert(row);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, stored: true, status, model: usedModel, portrait: !!interpretation.portrait, grounded: !!wissen, fallback: usedFallback, ai_error: usedFallback ? (res.error ?? null) : null, interpretation });
    }

    const facts = body.facts;
    if (!facts?.planets?.length) return json({ error: "missing facts.planets or client_id" }, 400);
    const wissen = key ? await fachwissen(factsToText(facts), key, svc) : "";
    const res = key ? await generate(facts, mdl, key, wissen) : { error: { detail: "no key" } };
    const usedFallback = !!res.error || !res.interpretation;
    const interpretation: any = usedFallback ? composeFallback(facts) : res.interpretation;
    interpretation.portrait = key ? await generatePortrait(facts, coreMdl, mdl, key, wissen) : "";
    return json({ ok: true, model: usedFallback ? "basis-komposition" : mdl, portrait: !!interpretation.portrait, grounded: !!wissen, fallback: usedFallback, ai_error: usedFallback ? (res.error ?? null) : null, interpretation });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
