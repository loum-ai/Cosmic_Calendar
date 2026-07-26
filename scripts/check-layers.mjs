#!/usr/bin/env node
/**
 * check-layers.mjs — hält die Stapelordnung der App ehrlich.
 *
 * Der Fehler, der das hier ausgelöst hat: Burger-Menü und mobiles Sheet lagen
 * beide auf `z-[60]`. Wer zuletzt gezeichnet wurde, gewann — der Burger stand
 * über dem offenen Sheet und verdeckte dessen Schließen-Knopf; im
 * Zeichen-Portal (ebenfalls 60) war das X überhaupt nicht erreichbar, weil der
 * Burger exakt dieselbe Stelle oben rechts belegt.
 *
 * Statisch prüfbar und deshalb hier geprüft:
 *   1. Die Skala in src/lib/layers.ts steigt streng an — keine zwei Ebenen
 *      teilen sich eine Zahl, sonst entscheidet wieder die DOM-Reihenfolge.
 *   2. Keine Datei setzt an einem Overlay eine eigene Zahl (`z-[40]` und
 *      höher). Alles ab der Composer-Ebene läuft über LAYER.
 *   3. Jede Ebene aus LAYER wird auch benutzt — tote Ebenen laden dazu ein,
 *      daneben eine neue Zahl zu erfinden.
 *
 * Lauf: npm run check:layers
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = "src";
const LAYERS_FILE = join(SRC, "lib", "layers.ts");
/** Unter dieser Zahl sind z-Werte lokales Stapeln innerhalb einer Karte, kein Overlay. */
const OVERLAY_FLOOR = 40;

const fail = [];
const note = [];

// ── 1. Die Skala selbst ────────────────────────────────────────────────────
const layersSrc = readFileSync(LAYERS_FILE, "utf8");
const entries = [...layersSrc.matchAll(/^\s{2}(\w+):\s*(\d+),/gm)].map((m) => [m[1], +m[2]]);
if (entries.length === 0) fail.push(`${LAYERS_FILE}: keine Ebenen gefunden — ist das Format noch "name: zahl,"?`);

for (let i = 1; i < entries.length; i++) {
  const [prevName, prev] = entries[i - 1];
  const [name, value] = entries[i];
  if (value <= prev) {
    fail.push(`Skala nicht aufsteigend: ${name} (${value}) liegt nicht über ${prevName} (${prev}).`);
  }
}
const byValue = new Map();
for (const [name, value] of entries) {
  if (byValue.has(value)) fail.push(`Doppelte Ebene ${value}: ${byValue.get(value)} und ${name} — dann entscheidet die DOM-Reihenfolge.`);
  byValue.set(value, name);
}

// ── 2. Keine eigenen Zahlen an Overlays ────────────────────────────────────
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}

const used = new Set();
for (const file of walk(SRC)) {
  if (file.endsWith("layers.ts")) continue;
  const text = readFileSync(file, "utf8");

  text.split("\n").forEach((line, i) => {
    for (const m of line.matchAll(/z-\[(\d+)\]/g)) {
      const value = +m[1];
      if (value >= OVERLAY_FLOOR) {
        const known = byValue.get(value);
        fail.push(
          `${file}:${i + 1} setzt z-[${value}] von Hand` +
            (known ? ` — nimm LAYER.${known}.` : ` — trag die Ebene in ${LAYERS_FILE} ein und nimm sie von dort.`),
        );
      }
    }
  });

  for (const m of text.matchAll(/LAYER\.(\w+)/g)) used.add(m[1]);
}

// ── 3. Tote Ebenen ─────────────────────────────────────────────────────────
for (const [name] of entries) {
  if (!used.has(name)) note.push(`Ebene "${name}" ist definiert, wird aber nirgends benutzt.`);
}

// ── Bericht ────────────────────────────────────────────────────────────────
console.log("Stapelordnung:");
for (const [name, value] of entries) {
  console.log(`  ${String(value).padStart(3)}  ${name}${used.has(name) ? "" : "   (ungenutzt)"}`);
}
if (note.length) {
  console.log("\nHinweise:");
  for (const n of note) console.log(`  · ${n}`);
}
if (fail.length) {
  console.log(`\n${fail.length} Verstoß${fail.length === 1 ? "" : "e"}:`);
  for (const f of fail) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log("\nOK — eine Quelle, streng aufsteigend, keine handgesetzten Overlay-Zahlen.");
