/**
 * Visual smoke test — drives the built app in a real browser and asserts the
 * birth-chart wheel actually renders (rings + planets + aspects), then saves a
 * screenshot. Catches "kein Chart" regressions that a unit test can't see.
 *
 * Usage:
 *   npm run build && npm run preview &   # serve dist on :4173
 *   node scripts/smoke-chart.cjs [http://127.0.0.1:4173] [out-dir]
 *
 * Exit code 0 = wheel rendered; 1 = it did not (with reason).
 */
const path = require('path');
const { chromium } = require(path.join(process.cwd(), 'node_modules/playwright-core'));

const BASE = process.argv[2] || 'http://127.0.0.1:4173';
const OUT = process.argv[3] || '/tmp';
// Chromium: honour Playwright's install dir, else fall back to a channel.
const EXE = process.env.CHROME_PATH ||
  (process.env.PLAYWRIGHT_BROWSERS_PATH
    ? require('fs').readdirSync(process.env.PLAYWRIGHT_BROWSERS_PATH)
        .filter((d) => d.startsWith('chromium-'))
        .map((d) => path.join(process.env.PLAYWRIGHT_BROWSERS_PATH, d, 'chrome-linux/chrome'))
        .find((p) => require('fs').existsSync(p))
    : undefined);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 1300 } });
  const fail = (msg) => { console.error('SMOKE FAIL: ' + msg); process.exitCode = 1; };
  try {
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    // demo shows onboarding — skip it
    await page.getByText('Überspringen', { exact: false }).first().click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.getByText('Ganzes Geburtsrad', { exact: false }).first().click({ timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT, 'smoke-chart.png') });

    const info = await page.evaluate(() => {
      const svgs = Array.from(document.querySelectorAll('svg'));
      let best = null, max = 0;
      for (const s of svgs) { const n = s.querySelectorAll('circle,line').length; if (n > max) { max = n; best = s; } }
      const r = best && best.getBoundingClientRect();
      return { circles: best ? best.querySelectorAll('circle').length : 0, lines: best ? best.querySelectorAll('line').length : 0, w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0 };
    });
    console.log('WHEEL:', JSON.stringify(info));
    if (info.circles < 10 || info.lines < 20 || info.w < 100) fail('wheel not rendered — ' + JSON.stringify(info));
    else console.log('SMOKE OK — chart wheel rendered.');
  } catch (e) {
    fail(e.message);
  } finally {
    await browser.close();
  }
})();
