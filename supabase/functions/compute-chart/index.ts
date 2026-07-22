import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// CommonJS packages → default-import then destructure (named imports fail in edge runtime)
import cnh from "npm:circular-natal-horoscope-js@1.1.0";        // CJS: default export only
import * as Astronomy from "npm:astronomy-engine@2.1.19";        // named exports, no default
import { createClient } from "jsr:@supabase/supabase-js@2";
const { Origin, Horoscope } = cnh as any;

// ── compute-chart ────────────────────────────────────────────────────────────
// Two modes:
//   { birth:{date,time,lat,lon} }  → dry-run: compute + verify, no DB write.
//                                     (Pure astronomy on caller-supplied data.)
//   { client_id }                  → admin-only: load birth from DB, compute,
//                                     cross-verify, store chart row.
//
// Engine: circular-natal-horoscope-js (MIT, ~0.01° vs astro.com). Independent
// cross-check of Sun & Moon via astronomy-engine (NOVAS) — these two fastest
// bodies are the most sensitive to a wrong birth time / timezone, so agreement
// here is the strongest cheap signal that the date/time/TZ pipeline is correct.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const META: Record<string, { key: string; name: string; glyph: string }> = {
  sun: { key: "sun", name: "Sonne", glyph: "☉" }, moon: { key: "moon", name: "Mond", glyph: "☽" },
  mercury: { key: "mercury", name: "Merkur", glyph: "☿" }, venus: { key: "venus", name: "Venus", glyph: "♀" },
  mars: { key: "mars", name: "Mars", glyph: "♂" }, jupiter: { key: "jupiter", name: "Jupiter", glyph: "♃" },
  saturn: { key: "saturn", name: "Saturn", glyph: "♄" }, uranus: { key: "uranus", name: "Uranus", glyph: "♅" },
  neptune: { key: "neptune", name: "Neptun", glyph: "♆" }, pluto: { key: "pluto", name: "Pluto", glyph: "♇" },
  chiron: { key: "chiron", name: "Chiron", glyph: "⚷" }, lilith: { key: "lilith", name: "Lilith", glyph: "⚸" },
  northnode: { key: "node_n", name: "Aufsteigender Knoten", glyph: "☊" },
  southnode: { key: "node_s", name: "Absteigender Knoten", glyph: "☋" },
};
const PLANET_ORDER = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "chiron", "lilith"];

const SIGNS = ["Widder", "Stier", "Zwillinge", "Krebs", "Löwe", "Jungfrau", "Waage", "Skorpion", "Schütze", "Steinbock", "Wassermann", "Fische"];
// Traditional domicile / exaltation rulers by sign index (0 = Widder)
const DOMICILE = ["mars", "venus", "mercury", "moon", "sun", "mercury", "venus", "mars", "jupiter", "saturn", "saturn", "jupiter"];
const EXALT: Record<number, string> = { 0: "sun", 1: "moon", 5: "mercury", 6: "saturn", 3: "jupiter", 9: "mars", 11: "venus" };

const norm = (d: number) => ((d % 360) + 360) % 360;
const r4 = (n: number) => Math.round(n * 10000) / 10000;
const r2 = (n: number) => Math.round(n * 100) / 100;

function dignity(planetKey: string, signIdx: number): string | null {
  const opp = (signIdx + 6) % 12;
  if (DOMICILE[signIdx] === planetKey) return "domicile";       // Herrscher
  if (DOMICILE[opp] === planetKey) return "detriment";          // Exil
  if (EXALT[signIdx] === planetKey) return "exaltation";        // Erhöhung
  if (EXALT[opp] === planetKey) return "fall";                  // Fall
  return null;
}

const ASPECTS: { name: string; angle: number; orb: number }[] = [
  { name: "Konjunktion", angle: 0, orb: 8 }, { name: "Sextil", angle: 60, orb: 4 },
  { name: "Quadrat", angle: 90, orb: 7 }, { name: "Trigon", angle: 120, orb: 7 },
  { name: "Opposition", angle: 180, orb: 8 },
];

function houseFromCusps(lon: number, cusps: number[]): number {
  const L = norm(lon);
  for (let i = 0; i < 12; i++) {
    const a = cusps[i], b = cusps[(i + 1) % 12];
    const span = norm(b - a), off = norm(L - a);
    if (off < span) return i + 1;
  }
  return 1;
}

function computeChart(birth: { date: string; time: string; lat: number; lon: number }) {
  const [y, mo, d] = birth.date.split("-").map(Number);
  const [hh, mm] = (birth.time || "12:00").split(":").map(Number);
  const origin = new Origin({ year: y, month: mo - 1, date: d, hour: hh, minute: mm, latitude: birth.lat, longitude: birth.lon });
  const h = new Horoscope({ origin, houseSystem: "placidus", zodiac: "tropical", aspectPoints: ["bodies"], aspectTypes: ["major"], language: "en" });

  const cusps = h.Houses.map((house: any) => r4(house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees));
  const asc = r4(h.Ascendant.ChartPosition.Ecliptic.DecimalDegrees);
  const mc = r4(h.Midheaven.ChartPosition.Ecliptic.DecimalDegrees);

  const all: any[] = [...h.CelestialBodies.all, ...((h.CelestialPoints && h.CelestialPoints.all) || [])];
  const byKey: Record<string, any> = {};
  all.forEach((b) => (byKey[b.key] = b));

  const mk = (libKey: string) => {
    const b = byKey[libKey]; const m = META[libKey];
    if (!b || !m) return null;
    const lon = r4(b.ChartPosition.Ecliptic.DecimalDegrees);
    const signIdx = Math.floor(norm(lon) / 30);
    const house = b.House?.id ?? houseFromCusps(lon, cusps);
    const isPlanet = PLANET_ORDER.includes(libKey);
    return {
      key: m.key, name: m.name, glyph: m.glyph, lon, house, retro: !!b.isRetrograde,
      sign: SIGNS[signIdx], sign_idx: signIdx, deg_in_sign: r2(norm(lon) - signIdx * 30),
      dignity: isPlanet ? dignity(m.key, signIdx) : null, txt: "",
    };
  };

  const planets = PLANET_ORDER.map(mk).filter(Boolean) as any[];
  const nodes = ["northnode", "southnode"].map(mk).filter(Boolean) as any[];

  // Aspects between the 12 bodies
  const aspects: any[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let diff = Math.abs(planets[i].lon - planets[j].lon); if (diff > 180) diff = 360 - diff;
      for (const a of ASPECTS) {
        const orb = Math.abs(diff - a.angle);
        if (orb <= a.orb) { aspects.push({ a: planets[i].key, b: planets[j].key, type: a.name, angle: a.angle, orb: r2(orb) }); break; }
      }
    }
  }

  // UTC instant the engine resolved (for the independent cross-check + TZ sanity)
  let utc: Date | null = null;
  try { utc = origin.utcTime ? new Date(origin.utcTime) : null; } catch { /* ignore */ }

  return { planets, nodes, asc, mc, cusps, aspects, utc, sun: byKey.sun, moon: byKey.moon };
}

// Independent Sun/Moon longitude check (of-date ecliptic, tropical) via astronomy-engine
function crossCheck(utc: Date | null, sunLon: number, moonLon: number) {
  if (!utc || isNaN(utc.getTime())) return { status: "skipped", reason: "no UTC instant from engine" };
  const sun = Astronomy.SunPosition(utc);              // apparent geocentric ecliptic of-date
  const moon = Astronomy.EclipticGeoMoon(utc);         // geocentric ecliptic of-date
  const dSun = Math.min(norm(sun.elon - sunLon), 360 - norm(sun.elon - sunLon));
  const dMoon = Math.min(norm(moon.lon - moonLon), 360 - norm(moon.lon - moonLon));
  const maxArcsec = Math.round(Math.max(dSun, dMoon) * 3600);
  return {
    status: maxArcsec <= 360 ? "ok" : maxArcsec <= 1800 ? "warn" : "fail", // 360"=0.1°, 1800"=0.5°
    reference: "astronomy-engine (NOVAS) — of-date ecliptic",
    utc_used: utc.toISOString(),
    sun: { engine: r4(sunLon), reference: r4(sun.elon), dev_arcsec: Math.round(dSun * 3600) },
    moon: { engine: r4(moonLon), reference: r4(moon.lon), dev_arcsec: Math.round(dMoon * 3600) },
    max_dev_arcsec: maxArcsec,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    let birth = body.birth as { date: string; time: string; lat: number; lon: number } | undefined;
    let clientId = body.client_id as string | undefined;

    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Admin path: resolve birth from the client row, after verifying admin.
    if (clientId) {
      const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
      const { data: u } = await svc.auth.getUser(token);
      const uid = u?.user?.id;
      const { data: adm } = uid ? await svc.from("app_admins").select("user_id").eq("user_id", uid).maybeSingle() : { data: null };
      if (!adm) return json({ error: "forbidden — admin only" }, 403);
      const { data: c, error } = await svc.from("clients").select("*").eq("id", clientId).single();
      if (error || !c) return json({ error: "client not found" }, 404);
      birth = { date: c.birth_date, time: c.birth_time ?? "12:00", lat: c.lat, lon: c.lon };
    }

    if (!birth?.date || birth.lat == null || birth.lon == null) return json({ error: "missing birth data" }, 400);

    const ch = computeChart(birth);
    const verification = crossCheck(ch.utc, ch.planets[0].lon, ch.planets[1].lon);
    const data = { planets: ch.planets, nodes: ch.nodes, asc: ch.asc, mc: ch.mc, cusps: ch.cusps, aspects: ch.aspects };

    if (clientId) {
      const { error } = await svc.from("charts").upsert({
        client_id: clientId, engine: "circular-natal-horoscope-js@1.1.0",
        house_system: "placidus", zodiac: "tropical", data, verification, computed_at: new Date().toISOString(),
      }, { onConflict: "client_id" });
      if (error) return json({ error: error.message }, 500);
    }

    return json({ ok: true, mode: clientId ? "stored" : "dry_run", data, verification });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
