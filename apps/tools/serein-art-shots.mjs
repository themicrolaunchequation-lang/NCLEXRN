// Serein artwork pages at desktop/mobile, light/dark. usage: node serein-art-shots.mjs <outdir> [port]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const out = process.argv[2], port = process.argv[3] || 8443; fs.mkdirSync(out, { recursive: true });
const AXE = fs.readFileSync('/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8');
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--ignore-certificate-errors', `--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`] });
const ROUTES = ['today', 'library/practices', 'library/guides', 'library/journeys', 'toolkit', 'infographics', 'me/journal', 'me/saved', 'me/routine', 'me/insights', 'me/data', 'support'];
let bad = 0;
for (const [w, h, dark] of [[1440, 900, false], [1440, 900, true], [390, 844, false], [390, 844, true]]) {
  const tag = `${w}${dark ? 'd' : 'l'}`; const ctx = await br.newContext({ viewport: { width: w, height: h }, colorScheme: dark ? 'dark' : 'light', ignoreHTTPSErrors: true });
  const p = await ctx.newPage(), errs = [], broken = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
  p.on('response', r => { if (r.url().includes('/art/') && r.status() >= 400) broken.push(r.url()); });
  await p.goto('https://serein.healthcarecrownacademy.co.uk/#today'); await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/hook-${tag}.png` });
  for (let i = 0; i < 4; i++) { const s = p.locator('dialog[open] [data-sh="skip"], dialog[open] [data-v5="welcome-skip"]'); if (!(await s.count())) { if (i == 2) await p.screenshot({ path: `${out}/onb-${tag}.png` }); break; } await s.first().click({ force: true }); await p.waitForTimeout(600); }
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  for (const r of ROUTES) {
    await p.evaluate(x => { location.hash = x; }, r); await p.waitForTimeout(1100);
    await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager')); await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(300);
    const st = await p.evaluate(() => ({ n: document.querySelectorAll('.sa-img,.sa-swapped,.sa-pic').length, bad: [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0 && i.src).length, ov: document.documentElement.scrollWidth > innerWidth + 1 }));
    await p.screenshot({ path: `${out}/${r.replace('/', '-')}-${tag}.png`, fullPage: true });
    await p.evaluate(AXE); const ax = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] })).violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => v.id + ':' + v.nodes.length));
    if (st.bad || st.ov || ax.length) bad++; console.log(tag, r, JSON.stringify(st), ax.join(','));
  }
  if (errs.length || broken.length) bad++; console.log(tag, 'errors:', errs.slice(0, 3), 'broken:', broken);
  await ctx.close();
}
await br.close(); console.log(bad ? 'ISSUES ' + bad : 'ALL OK');
