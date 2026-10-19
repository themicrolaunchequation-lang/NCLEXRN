// Evinca light/dark pass: shots, axe contrast, console, overflow. usage: node evinca-dark-check.mjs <outdir> [base]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const out = process.argv[2], base = process.argv[3] || 'http://localhost:3111'; fs.mkdirSync(out, { recursive: true });
const AXE = fs.readFileSync('/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8');
const PAGES = (process.argv[4] || 'en,en/apply,en/recognitions,en/fees,en/faq,en/how-we-review,en/countries,en/magazine,en/contact,ar,apply-guide.html').split(',');
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
let bad = 0;
for (const [w, h, scheme, theme] of [[1440, 900, 'light', null], [1440, 900, 'dark', null], [390, 844, 'dark', null], [390, 844, 'light', 'dark']]) {
  const tag = `${w}-${scheme}${theme ? '-forced' : ''}`; const ctx = await br.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
  if (theme) await ctx.addInitScript(t => localStorage.setItem('evinca-theme', t), theme);
  for (const pg of PAGES) {
    const p = await ctx.newPage(), errs = []; p.on('console', m => { if (m.type() === 'error' && !/fonts|favicon|supabase|Failed to load resource/i.test(m.text())) errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
    await p.goto(`${base}/${pg}`, { waitUntil: 'load' }).catch(() => {}); await p.waitForTimeout(900);
    await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager')); await p.waitForTimeout(400);
    const st = await p.evaluate(() => ({ ov: document.documentElement.scrollWidth > innerWidth + 1, bg: getComputedStyle(document.body).backgroundColor }));
    await p.screenshot({ path: `${out}/${pg.replace(/[\/.]/g, '_')}-${tag}.png`, fullPage: true });
    await p.evaluate(AXE); const ax = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] })).violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => v.id + ':' + v.nodes.length + ':' + String(v.nodes[0].target).slice(0, 60)));
    if (ax.length || errs.length || st.ov) bad++; console.log(tag, pg, st.bg, st.ov ? 'OVERFLOW' : '', ax.join(' | '), errs.slice(0, 2).join(' || '));
    await p.close();
  }
  await ctx.close();
}
await br.close(); console.log(bad ? 'ISSUES ' + bad : 'ALL OK');
