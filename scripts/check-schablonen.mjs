#!/usr/bin/env node
/**
 * check-schablonen.mjs — findet Sätze, die in JEDES Horoskop passen.
 *
 * Anlass (Laura, 2026-07-26, mit Screenshot): zwei verschiedene Aspektmuster,
 * ein und derselbe Absatz — nur die Planetennamen getauscht.
 *
 *   „Saturn ist dein Hebel: … löst sich der Druck zwischen SONNE und MOND …"
 *   „Saturn ist dein Hebel: … löst sich der Druck zwischen MOND und VENUS …"
 *
 * Ihre Regel, wörtlich: NIRGENDS an der App dürfen Schablonen stehen, weder
 * bei ihr noch bei sonst wem, auch künftig nicht.
 *
 * VERFAHREN — messbar statt nach Gefühl:
 * Für viele verschiedene Geburtsbilder wird jeder lokal erzeugte Text geholt.
 * Aus jedem Text wird ein „Skelett" gebildet: Planeten-, Zeichen- und
 * Hausnamen, Zahlen und Gradangaben werden ausgestanzt. Bleiben zwei Skelette
 * aus VERSCHIEDENEN Bildern identisch, ist der Satz nicht aus dem Chart
 * gefolgert — er ist eine Schablone mit Platzhaltern.
 *
 * Was ausdrücklich ERLAUBT ist: die reine Beobachtung („Mond und Venus stehen
 * sich gegenüber") — das ist gerechnete Tatsache, kein Deutungstext. Geprüft
 * werden die Felder, die als Deutung gelesen werden.
 *
 * Lauf: npm run check:schablonen
 */
import { execFileSync, } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const tmp = mkdtempSync(path.join(tmpdir(), "vela-schablonen-"));
const bundle = path.join(tmp, "bundle.mjs");
const entry = path.join(tmp, "entry.ts");

writeFileSync(entry, `
export { chartPatterns } from "@/lib/patterns";
export { computeTransits } from "@/lib/transits";
export { applyChart, CHART } from "@/lib/data";
export { computeChart } from "@/lib/compute";
export { resolveSheet } from "@/lib/sheets";
export { CHART as CHART2, NODES } from "@/lib/data";
`);
execFileSync("npx", ["esbuild", entry, "--bundle", "--format=esm", "--platform=node", "--alias:@=./src", "--define:import.meta.env={}", `--outfile=${bundle}`, "--log-level=error"], { stdio: "inherit" });

const { chartPatterns, computeTransits, applyChart, CHART, computeChart, resolveSheet, NODES } = await import(bundle);

/** Geburtsbilder, die sich wirklich unterscheiden — Jahrzehnte, Orte, Zeiten. */
const GEBURTEN = [
  { date: "1987-09-07", time: "18:50", lat: 48.0, lon: 11.35 },
  { date: "1961-02-14", time: "04:05", lat: 52.52, lon: 13.4 },
  { date: "1994-11-30", time: "23:40", lat: 40.71, lon: -74.0 },
  { date: "1975-06-21", time: "12:00", lat: -33.87, lon: 151.2 },
  { date: "2003-03-03", time: "09:15", lat: 35.68, lon: 139.69 },
  { date: "1948-12-25", time: "16:30", lat: -23.55, lon: -46.63 },
];

const PLANETEN = "Sonne|Mond|Merkur|Venus|Mars|Jupiter|Saturn|Uranus|Neptun|Pluto|Chiron|Lilith|Aszendent|Medium Coeli|Mondknoten";
const ZEICHEN = "Widder|Stier|Zwillinge|Krebs|Löwe|Jungfrau|Waage|Skorpion|Schütze|Steinbock|Wassermann|Fische";
const ELEMENTE = "Feuer|Erde|Luft|Wasser";
const ASPEKTE = "Konjunktion|Sextil|Quadrat|Trigon|Opposition";

/** Alles ausstanzen, was aus dem Chart eingesetzt wird. Bleibt Prosa übrig, ist sie geschablont. */
function skelett(text) {
  return text
    .replace(new RegExp(`\\b(${PLANETEN})\\b`, "g"), "§")
    .replace(new RegExp(`\\b(${ZEICHEN})\\b`, "g"), "§")
    .replace(new RegExp(`\\b(${ELEMENTE})\\b`, "g"), "§")
    .replace(new RegExp(`\\b(${ASPEKTE})\\b`, "g"), "§")
    .replace(/\d+([.,]\d+)?°?/g, "#")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Nur echte Prosa vergleichen — Überschriften und Etiketten sind zu Recht knapp. */
const istProsa = (s) => typeof s === "string" && s.split(" ").length >= 12;

const funde = new Map(); // skelett → [{ geburt, feld, text }]

for (const geburt of GEBURTEN) {
  const c = computeChart(geburt);
  applyChart({ ...c, profile: { name: "Test", birth: "", memberSince: "" } });

  for (const p of chartPatterns()) {
    // `text` ist die gerechnete Beobachtung und darf sich gleichen.
    // `detail` wird als Deutung gelesen — der muss aus dem Bild folgen.
    for (const feld of ["detail", "human"]) {
      const wert = p[feld];
      if (!istProsa(wert)) continue;
      const k = feld + "::" + skelett(wert);
      if (!funde.has(k)) funde.set(k, []);
      funde.get(k).push({ geburt: geburt.date, feld, id: p.id, text: wert });
    }
  }

  // Die Erklär-Blätter: „Was — der Planet", „Warum — das Haus" und die
  // Deutungsabschnitte. Das ist der Text, den man beim Antippen zuerst liest.
  const blaetter = [
    ...CHART.map((pl) => ({ kind: "planet", key: pl.key })),
    ...NODES.map((n) => ({ kind: "node", key: n.key })),
    ...Array.from({ length: 12 }, (_, i) => ({ kind: "sign", key: String(i) })),
    ...Array.from({ length: 12 }, (_, i) => ({ kind: "house", key: String(i + 1) })),
  ];
  for (const d of blaetter) {
    const blatt = resolveSheet(d);
    if (!blatt) continue;
    for (const [i, abschnitt] of (blatt.sections ?? []).entries()) {
      if (!istProsa(abschnitt.body)) continue;
      const k = `sheet.${d.kind}[${i}]::` + skelett(abschnitt.body);
      if (!funde.has(k)) funde.set(k, []);
      funde.get(k).push({ geburt: geburt.date, feld: `sheet.${d.kind}`, id: `${d.key}/${abschnitt.label ?? i}`, text: abschnitt.body });
    }
  }

  for (const h of computeTransits(CHART, new Date()).slice(0, 6)) {
    if (!istProsa(h.txt)) continue;
    const k = "transit.txt::" + skelett(h.txt);
    if (!funde.has(k)) funde.set(k, []);
    funde.get(k).push({ geburt: geburt.date, feld: "transit.txt", id: h.title, text: h.txt });
  }
}

const schablonen = [...funde.values()].filter((v) => new Set(v.map((x) => x.geburt)).size > 1);

console.log(`Geprüft: ${GEBURTEN.length} Geburtsbilder, ${funde.size} verschiedene Textskelette.\n`);

if (schablonen.length) {
  console.log(`${schablonen.length} Schablone${schablonen.length === 1 ? "" : "n"} — derselbe Satz für verschiedene Menschen:\n`);
  for (const gruppe of schablonen.slice(0, 12)) {
    const bilder = [...new Set(gruppe.map((g) => g.geburt))];
    console.log(`  ✗ ${gruppe[0].feld} · ${gruppe[0].id}`);
    console.log(`    trifft ${bilder.length} Bilder: ${bilder.join(", ")}`);
    console.log(`    „${gruppe[0].text.slice(0, 100)}…"\n`);
  }
  if (schablonen.length > 12) console.log(`  … und ${schablonen.length - 12} weitere.\n`);
}

rmSync(tmp, { recursive: true, force: true });

if (schablonen.length) {
  console.log("Regel: Ein Text, der für zwei verschiedene Geburtsbilder gleich lautet, ist keine Deutung.");
  process.exit(1);
}
console.log("Keine Schablonen — jeder Deutungstext folgt aus seinem Bild.");
