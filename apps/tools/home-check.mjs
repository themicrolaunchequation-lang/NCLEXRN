// Home page: shots, axe, console, overflow. usage: node home-check.mjs <outdir> [port]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const out = process.argv[2], port = process.argv[3] || 8443; fs.mkdirSync(out, { recursive: true });
const AXE = fs.readFileSync('/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8');
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--ignore-certificate-errors', `--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}, MAP healthcarecrownacademy.co.uk 127.0.0.1:${port}`] });
let bad = 0;
for (const [w, h, dark, rm] of [[1440, 900, false, false], [1440, 900, true, false], [390, 844, false, false], [390, 844, true, true]]) {
  const tag = `${w}${dark ? 'd' : 'l'}`; const ctx = await br.newContext({ viewport: { width: w, height: h }, colorScheme: dark ? 'dark' : 'light', reducedMotion: rm ? 'reduce' : 'no-preference', ignoreHTTPSErrors: true });
  const p = await ctx.newPage(), errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
  await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto('https://healthcarecrownacademy.co.uk/'); await p.waitForTimeout(1200);
  await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager')); await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 8000 }).catch(() => {});
  const st = await p.evaluate(() => ({ ov: document.documentElement.scrollWidth > innerWidth + 1, h1: document.querySelectorAll('h1').length, brokenImg: [...document.images].filter(i => i.complete && !i.naturalWidth).length, small: [...document.querySelectorAll('a,button')].filter(e => { const r = e.getBoundingClientRect(); return r.width && innerWidth < 500 && r.height < 40 && getComputedStyle(e).display !== 'inline'; }).length }));
  await p.screenshot({ path: `${out}/home-${tag}.png`, fullPage: true });
  await p.evaluate(AXE); const ax = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] })).violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => v.id + ':' + v.nodes.length + ':' + v.nodes[0].target));
  if (errs.length || ax.length || st.ov || st.brokenImg) bad++; console.log(tag, JSON.stringify(st), 'axe:', ax.join(' | '), 'errors:', errs.slice(0, 3));
  await ctx.close();
}
await br.close(); console.log(bad ? 'ISSUES ' + bad : 'ALL OK');
