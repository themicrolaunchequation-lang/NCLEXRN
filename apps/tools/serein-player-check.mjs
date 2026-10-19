// Serein player: behaviour, visual shots, axe, console errors. Usage: node serein-player-check.mjs <outdir>
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const out = process.argv[2] || '/tmp/sp'; fs.mkdirSync(out, { recursive: true });
const axeSrc = fs.readFileSync('/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8');
const URL = 'https://serein.healthcarecrownacademy.co.uk/#today';
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--ignore-certificate-errors', '--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:8443, MAP healthcarecrownacademy.co.uk 127.0.0.1:8443', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
for (const [vw, vh, scheme, motion, tag] of [[1440, 900, 'light', 'no-preference', 'd-light'], [1440, 900, 'dark', 'no-preference', 'd-dark'], [390, 844, 'light', 'no-preference', 'm-light'], [390, 844, 'dark', 'reduce', 'm-dark-rm']]) {
  console.log('--- ' + tag);
  const ctx = await br.newContext({ viewport: { width: vw, height: vh }, colorScheme: scheme, reducedMotion: motion, ignoreHTTPSErrors: true });
  const page = await ctx.newPage(); const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
  await page.route(/supabase\.co|lumen-ai/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.goto(URL); await page.waitForTimeout(800);
  const dismiss = async () => { for (let i = 0; i < 3; i++) { const sk = page.locator('[data-v5="welcome-skip"], dialog.serein-hook [data-sh="skip"]'); if (!(await sk.count())) break; await sk.first().click({ force: true }).catch(() => {}); await page.waitForTimeout(500); } };
  await dismiss();
  for (const id of ['tide', 'box']) {
    await dismiss();
    await page.locator(`[data-practice="${id}"]`).first().click({ timeout: 8000 }); await page.waitForTimeout(1800);
    const has = async s => (await page.locator(s).count()) > 0 && await page.locator(s).first().isVisible();
    ok(await has('#sp-timeline'), id + ': timeline'); ok(await has('#sp-caption') || await has('#sp-now'), id + ': caption/now');
    ok(await has('#sp-voice') || (await page.locator('#sp-voice').count()) > 0, id + ': voice toggle');
    ok((await page.locator('#sp-music').count()) > 0, id + ': music toggle');
    if (id === 'tide') { const c = await page.evaluate(() => { const c = document.querySelector('canvas'); return c && c.getBoundingClientRect().width; }); ok(c > 100, 'lungs canvas width ' + c); }
    const t = page.locator('#sp-music'); if (await t.count()) { const a = await t.getAttribute('aria-pressed'); await t.click(); const b = await t.getAttribute('aria-pressed'); ok(a !== b, id + ': music toggles'); await t.click(); }
    const sz = await page.evaluate(() => [...document.querySelectorAll('.sp-toggle')].map(e => Math.round(e.getBoundingClientRect().height)));
    if (vw < 500) ok(sz.every(h => h >= 44), id + ': targets >=44 ' + sz);
    await page.screenshot({ path: `${out}/${id}-${tag}.png` });
    await page.evaluate(axeSrc); const ax = await page.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] })).violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => v.id + ':' + v.nodes.length + ':' + v.nodes[0].target));
    ok(ax.length === 0, id + ': axe ' + ax.join(' | '));
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    const close = page.locator('#player-close, [data-close-player], button:has-text("End")'); if (await page.locator('#player:visible, .player:visible').count()) { if (await close.count()) await close.first().click().catch(() => {}); }
    await page.goto(URL); await page.waitForTimeout(800); await dismiss();
  }
  ok(errs.length === 0, 'console errors: ' + errs.slice(0, 3).join(' || '));
  await ctx.close();
}
await br.close(); console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
