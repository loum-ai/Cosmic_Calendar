#!/usr/bin/env node
/**
 * check-ux.mjs — der Regressionslauf für die Bedienung, nicht für das Aussehen.
 *
 * Prüft in einem echten Browser die drei Zusagen, an denen die App zuletzt
 * gescheitert ist. Jede davon steht hier, WEIL sie einmal gebrochen war:
 *
 *   1. Ein Tipp, ein Punkt. Jeder Punkt im Rad öffnet sein eigenes Blatt —
 *      keine Zwischenfrage, und nie das Blatt des Nachbarn. (Vorher öffnete
 *      ein Tipp auf eng stehende Planeten nur "WÄHLE EINEN PUNKT", und beim
 *      Auflösen über die Trefferfläche bekam man den Mondknoten statt Venus.)
 *
 *   2. Immer nur EIN Ausgang. Solange ein Blatt offen ist, gibt es keinen
 *      zweiten Knopf daneben. (Vorher blieb der Burger stehen.)
 *
 *   3. Der Ausgang ist wirklich anklickbar. Nicht "im DOM vorhanden",
 *      sondern: an seiner Stelle liegt auch er ganz oben. Genau das war im
 *      Zeichen-Portal falsch — dort lag der Burger exakt auf dem X.
 *
 * Lauf (Dev-Server oder Preview muss laufen):
 *   npm run check:ux                       # gegen http://127.0.0.1:5173
 *   node scripts/check-ux.mjs http://…     # gegen eine andere Adresse
 */
import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.cwd(), "node_modules/playwright-core"));

const BASE = process.argv[2] || "http://127.0.0.1:5173";
/** Jeder Lauf legt ab, was er gesehen hat — sonst glaubt man dem grünen Haken zu schnell. */
const SHOTS = process.argv[3] || "screenshots/check";
fs.mkdirSync(SHOTS, { recursive: true });
let shotNr = 0;
const shot = async (page, name) => {
  await page.screenshot({ path: path.join(SHOTS, `${String(++shotNr).padStart(2, "0")}-${name}.png`) });
};

/** Ein installiertes Chromium finden — ohne Download. */
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = path.join(process.env.HOME ?? "", "Library/Caches/ms-playwright");
  if (fs.existsSync(cache)) {
    for (const dir of fs.readdirSync(cache).filter((d) => d.startsWith("chromium-")).sort().reverse()) {
      for (const rel of [
        "chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
        "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
        "chrome-linux/chrome",
      ]) {
        const p = path.join(cache, dir, rel);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return fs.existsSync(chrome) ? chrome : undefined;
}

const results = [];
const ok = (name, detail = "") => results.push({ pass: true, name, detail });
const bad = (name, detail = "") => results.push({ pass: false, name, detail });

/**
 * Liegt das Element an seiner eigenen Mitte auch wirklich obenauf?
 * Das ist der Unterschied zwischen "ist da" und "ist bedienbar".
 */
async function isTopmost(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { found: false };
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return { found: true, visible: false };
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const covered = hit && !el.contains(hit) && hit !== el;
    const blocker = covered
      ? `${hit.tagName.toLowerCase()}` +
        `${hit.getAttribute("aria-label") ? `[${hit.getAttribute("aria-label")}]` : ""}` +
        `${typeof hit.className === "string" && hit.className ? `.${hit.className.split(/\s+/).slice(0, 3).join(".")}` : ""}` +
        ` (z-index ${getComputedStyle(hit).zIndex}, pointer-events ${getComputedStyle(hit).pointerEvents})`
      : null;
    return { found: true, visible: true, topmost: !covered, blocker };
  }, selector);
}

const browser = await chromium.launch({ executablePath: findChrome(), args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

try {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(1800);
  await page.getByText("Überspringen", { exact: false }).first().click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(600);

  // ── 1. Ein Tipp, ein Punkt ───────────────────────────────────────────────
  await shot(page, "home");
  const points = await page.$$eval("[data-point]", (els) => els.map((e) => e.getAttribute("data-point")));
  if (points.length < 10) bad("Punkte im Rad", `nur ${points.length} gefunden — rendert das Rad überhaupt?`);

  const opened = new Map();
  for (const id of points) {
    const el = await page.$(`[data-point="${id}"]`);
    if (!el) { bad(`Tipp auf ${id}`, "Punkt verschwunden"); continue; }
    await el.click({ force: true });
    await page.waitForTimeout(450);

    const title = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      if (!dlg) return null;
      const h = dlg.querySelector("h1, h2, h3");
      return (h?.textContent || dlg.textContent || "").trim().slice(0, 60);
    });

    if (!title) bad(`Tipp auf ${id}`, "kein Blatt geöffnet");
    else opened.set(id, title);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }

  if (opened.size === points.length && points.length > 0) {
    ok("Jeder Punkt öffnet ein Blatt", `${opened.size}/${points.length}`);
  }

  // Kein Punkt darf das Blatt eines anderen öffnen.
  const seen = new Map();
  let collision = false;
  for (const [id, title] of opened) {
    if (seen.has(title)) {
      bad("Punkt öffnet fremdes Blatt", `${id} und ${seen.get(title)} zeigen beide „${title}"`);
      collision = true;
    } else seen.set(title, id);
  }
  if (!collision && opened.size > 0) ok("Jeder Punkt öffnet SEIN Blatt", `${seen.size} verschiedene Blätter`);

  // ── 2. + 3. Ein Ausgang, und der liegt obenauf ───────────────────────────
  const first = await page.$(`[data-point="${points[0]}"]`);
  if (first) {
    await first.click({ force: true });
    await page.waitForTimeout(500);

    const burger = await page.$('[aria-label="Menü öffnen"]');
    if (burger) bad("Nur ein Ausgang (Blatt)", "der Burger steht neben dem Schließen-Knopf");
    else ok("Nur ein Ausgang (Blatt)", "Burger ist weg, solange das Blatt offen ist");

    await shot(page, "blatt-offen");
    const close = await isTopmost(page, '[role="dialog"] button');
    if (!close.found) bad("Schließen-Knopf im Blatt", "nicht vorhanden");
    else if (!close.visible) bad("Schließen-Knopf im Blatt", "unsichtbar (0×0)");
    else if (!close.topmost) bad("Schließen-Knopf im Blatt", `verdeckt von ${close.blocker}`);
    else ok("Schließen-Knopf im Blatt", "liegt obenauf");

    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
  }

  // ── 4. Das Zeichen-Portal ────────────────────────────────────────────────
  await page.$('[aria-label="Menü öffnen"]').then((b) => b?.click());
  await page.waitForTimeout(400);
  await page.getByText("Lernen", { exact: true }).first().click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(700);
  const portalCard = await page.getByText("ZEICHEN-PORTAL", { exact: false }).first();
  if (await portalCard.count().catch(() => 0)) {
    await portalCard.click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(800);

    await shot(page, "zeichen-portal");
    const x = await isTopmost(page, '[aria-label="Schließen"]');
    if (!x.found) bad("Zeichen-Portal: Ausgang", "kein X vorhanden");
    else if (!x.topmost) bad("Zeichen-Portal: Ausgang", `X ist verdeckt von ${x.blocker}`);
    else {
      await page.click('[aria-label="Schließen"]');
      await page.waitForTimeout(500);
      const stillOpen = await page.$('[aria-label="Schließen"]');
      if (stillOpen) bad("Zeichen-Portal: Ausgang", "X liegt obenauf, schließt aber nicht");
      else ok("Zeichen-Portal: Ausgang", "X liegt obenauf und schließt");
    }
  } else {
    bad("Zeichen-Portal", "Einstieg nicht gefunden");
  }
} catch (e) {
  bad("Lauf abgebrochen", e.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.pass);
for (const r of results) console.log(`  ${r.pass ? "ok " : "✗  "}${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
console.log(failed.length ? `\n${failed.length} von ${results.length} gebrochen.` : `\nAlle ${results.length} Zusagen halten.`);
process.exit(failed.length ? 1 : 0);
