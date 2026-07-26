#!/usr/bin/env node
/**
 * check-antworten.mjs — antwortet die App auf die Frage, die gestellt wurde?
 *
 * Anlass (Laura, 2026-07-26): „ich fragte: wie lange hält dieser Transit und
 * die KI antwortet etwas über meine Sonne". Genau so war es — jede Frage, die
 * durch sechs Stichwortregeln fiel, endete im Default `answerFor("sun")` und
 * wurde als „Vela deutet · aus deinem Chart" ausgegeben.
 *
 * Geprüft wird deshalb dreierlei:
 *   1. Eine Zeitfrage zu einem Transit wird GERECHNET — mit Datum, nicht mit
 *      Stimmung, und in einer Zeit, die den Browser nicht einfriert.
 *   2. Fragen, für die es keine Rechnung gibt, geben null zurück und laufen
 *      in die normale Deutung. Der Fakten-Zweig kapert nichts.
 *   3. Der Notfall ohne Backend erfindet nichts: passt keine Regel, ist die
 *      Antwort null — der Aufrufer sagt das ehrlich.
 *
 * Lauf: npm run check:antworten
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const tmp = mkdtempSync(path.join(tmpdir(), "vela-antworten-"));
const bundle = path.join(tmp, "bundle.mjs");
const entry = path.join(tmp, "entry.ts");

import { writeFileSync } from "node:fs";
writeFileSync(entry, `export { faktenAntwort } from "@/lib/factAnswers";\nexport { localOracle } from "@/lib/oracle";\n`);
execFileSync("npx", ["esbuild", entry, "--bundle", "--format=esm", "--platform=node", "--alias:@=./src", "--define:import.meta.env={}", `--outfile=${bundle}`, "--log-level=error"], { stdio: "inherit" });

const { faktenAntwort, localOracle } = await import(bundle);

const results = [];
const pruefe = (name, bedingung, detail = "") => results.push({ pass: !!bedingung, name, detail });

// ── 1. Die Frage, an der es aufgefallen ist ────────────────────────────────
// Der erste Aufruf zahlt die Initialisierung der Ephemeride mit; gemessen wird
// deshalb ein zweiter Lauf auf einem anderen Stichtag (der Tages-Cache greift
// dort nicht). Die Schwelle soll die Klasse des Fehlers fangen — die tageweise
// Suche brauchte 37 Sekunden —, nicht die Tagesform der Maschine.
const kalt0 = Date.now();
const antwort = faktenAntwort("Wie lange hält dieser Transit?");
const kalt = Date.now() - kalt0;

const t0 = Date.now();
faktenAntwort("Wie lange hält dieser Transit?", new Date(Date.now() + 86400000));
const dauer = Date.now() - t0;

pruefe("Zeitfrage wird beantwortet", typeof antwort === "string" && antwort.length > 40, antwort ? `„${antwort.slice(0, 70)}…"` : "null");
pruefe(
  "Antwort nennt einen Zeitraum",
  antwort && /(seit dem \d|noch \d+ Tage?|mindestens \d+ Monate)/.test(antwort),
  antwort ? "" : "keine Antwort",
);
pruefe("Antwort weist sich als Rechnung aus", antwort && /Gerechnet aus den Planetenständen/.test(antwort));
pruefe("Antwort redet NICHT über die Sonne", !antwort || !/Die Sonne ist dein innerster Antrieb/.test(antwort));
pruefe("Schnell genug für die Oberfläche", dauer < 2500, `${dauer} ms warm, ${kalt} ms kalt`);

// ── 2. Der Fakten-Zweig kapert nichts ──────────────────────────────────────
for (const frage of ["Was macht mich aus?", "Wie liebe ich?", "Was ist mein Talent?", "Erzähl mir von meinem Mond"]) {
  pruefe(`Deutungsfrage bleibt Deutung: „${frage}"`, faktenAntwort(frage) === null);
}

// ── 3. Der Notfall erfindet nichts ─────────────────────────────────────────
pruefe("Notfall schweigt bei unbekannter Frage", localOracle("Wie lange hält dieser Transit?") === null,
  String(localOracle("Wie lange hält dieser Transit?")).slice(0, 60));
pruefe("Notfall antwortet, wo er wirklich passt", typeof localOracle("Wie liebe ich?") === "string");

rmSync(tmp, { recursive: true, force: true });

const failed = results.filter((r) => !r.pass);
for (const r of results) console.log(`  ${r.pass ? "ok " : "✗  "}${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
console.log(failed.length ? `\n${failed.length} von ${results.length} gebrochen.` : `\nAlle ${results.length} Zusagen halten.`);
process.exit(failed.length ? 1 : 0);
