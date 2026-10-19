// Browser check of the Serein Toolkit (local preview: node apps/tools/serve-site.mjs 8448).
// usage: node apps/tools/serein-check.mjs [out-dir] [--port 8448]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const a = process.argv.slice(2), out = a[0] && !a[0].startsWith('--') ? a[0] : '/tmp/serein-check', pi = a.indexOf('--port'), port = pi < 0 ? 8448 : a[pi + 1];
const AXE = fs.readFileSync(process.env.AXE || '/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8'); fs.mkdirSync(out, { recursive: true });
const rows = []; const ok = (name, cond, detail = '') => { rows.push({ name, pass: !!cond, detail: cond ? '' : String(detail) }); if (!cond) console.log('FAIL', name, detail); };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] });
const URL = 'https://serein.healthcarecrownacademy.co.uk/';
const IDS = ['shift-start', 'reset', 'break-plan', 'decompress', 'handover-self', 'wind-down', 'boundary', 'peer', 'workload', 'load-check'];
async function session({ w = 1440, h = 900, dark = false, reduced = false } = {}, ctxOpt) {
  const touch = w < 600, ctx = ctxOpt || await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', colorScheme: dark ? 'dark' : 'light', reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: touch, isMobile: touch, deviceScaleFactor: touch ? 2 : 1 });
  const p = await ctx.newPage(), errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto(URL + '#toolkit', { waitUntil: 'load' }); await p.waitForTimeout(1600);
  for (let i = 0; i < 5; i++) { const hit = await p.evaluate(() => { const b = [...document.querySelectorAll('dialog[open] button')].find(x => /^skip/i.test(x.textContent.trim())); if (b) { b.click(); return true; } return false; }); if (!hit) break; await p.waitForTimeout(700); }
  return { ctx, p, errs };
}
const axe = async (p, scope) => { await p.evaluate(src => { if (!window.axe) (0, eval)(src); }, AXE); return p.evaluate(async scope => (await axe.run(document.querySelector(scope), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'], rules: { region: { enabled: false } } })).violations.map(v => `${v.id}: ${v.nodes.length} (${v.nodes[0].target.join(' ')}) ${(v.nodes[0].failureSummary || '').split('\n')[1] || ''}`), scope); };
const fits = p => p.evaluate(() => { const d = document.querySelector('.tk-sheet[open]'); if (!d) return ['no sheet']; const r = d.getBoundingClientRect(), o = []; if (r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1) o.push('off-screen ' + [r.left, r.top, r.right, r.bottom].map(Math.round)); const x = d.querySelector('[data-tk=close]').getBoundingClientRect(); if (x.width < 43 || x.height < 43 || x.bottom > innerHeight || x.top < 0) o.push('close ' + Math.round(x.width) + 'x' + Math.round(x.height)); if (d.scrollWidth > d.clientWidth + 1) o.push('h-scroll'); return o; });
const small = p => p.evaluate(() => [...document.querySelectorAll('.tk button, .tk a, .tk-sheet button, .tk-sheet input:not([type=radio]):not([type=checkbox]), .tk-sheet textarea')].filter(e => e.offsetParent && !e.closest('[hidden]')).map(e => [e, e.getBoundingClientRect()]).filter(([e, r]) => r.height && r.height < 43.5).map(([e, r]) => `${(e.className || e.tagName).toString().slice(0, 28)}:${Math.round(r.height)}`));

/* ---------- behaviour (desktop) ---------- */
{
  const { ctx, p, errs } = await session();
  ok('hub shows six moment groups', await p.evaluate(() => document.querySelectorAll('.tk-group').length === 6));
  ok('hub lists ten tools and six guided studios', await p.evaluate(() => document.querySelectorAll('.tk-card[data-tool]').length === 10 && document.querySelectorAll('.tk-card[data-guided]').length === 6));
  ok('Support is one tap away on the hub', await p.evaluate(() => /Support is one tap away/i.test(document.querySelector('.tk-help').textContent) && !!document.querySelector('.tk-help [data-v5=help]')));
  for (const id of IDS) {
    await p.click(`.tk-open[data-id="${id}"]`); await p.waitForTimeout(500);
    ok(`${id}: opens with a live plan`, await p.evaluate(() => !!document.querySelector('.tk-sheet[open] .tk-plan-card h3')));
    ok(`${id}: Get help and Close visible`, await p.evaluate(() => !!document.querySelector('.tk-sheet[open] .tk-sh-head [data-v5=help]') && !!document.querySelector('.tk-sheet[open] [data-tk=close]')));
    const before = await p.evaluate(() => document.querySelector('#tk-plan').textContent);
    const ta = await p.$('.tk-sheet textarea');
    if (ta) { await ta.fill('Testing words for ' + id); } else { const r = await p.$$('.tk-sheet .tk-opt input'); if (r.length > 2) await r[2].click({ force: true }); else { const t = await p.$('.tk-sheet input[type=time]'); if (t) await t.fill('06:45'); } }
    await p.waitForTimeout(250);
    const after = await p.evaluate(() => document.querySelector('#tk-plan').textContent); ok(`${id}: plan updates live`, before !== after);
    const f = await fits(p); ok(`${id}: dialog fits viewport`, !f.length, f.join());
    await p.click('#tk-save'); await p.waitForTimeout(250);
    ok(`${id}: saves to this device`, await p.evaluate(id => JSON.parse(localStorage.getItem('serein-toolkit-v1')).plans.some(x => x.tool === id), id));
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    ok(`${id}: Esc closes and returns to #toolkit`, await p.evaluate(() => !document.querySelector('.tk-sheet[open]') && location.hash === '#toolkit'), await p.evaluate(() => location.hash));
  }
  ok('saved list shows all ten plans', await p.evaluate(() => document.querySelectorAll('[data-plan]').length === 10), await p.evaluate(() => document.querySelectorAll('[data-plan]').length));
  ok('saved plans survive reload', await (async () => { await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1500); return p.evaluate(() => document.querySelectorAll('[data-plan]').length === 10); })());
  await p.click('[data-tk=plan-open] >> nth=0'); await p.waitForTimeout(400);
  ok('saved plan reopens with its words', await p.evaluate(() => /Update saved plan/.test(document.querySelector('#tk-save').textContent)));
  await p.click('[data-tk=close]'); await p.waitForTimeout(300);
  await p.click('[data-tk=del] >> nth=0'); await p.waitForTimeout(200); ok('delete then undo restores', await (async () => { const n = await p.evaluate(() => document.querySelectorAll('[data-plan]').length); await p.click('[data-tk=undo]'); await p.waitForTimeout(200); return n === 9 && (await p.evaluate(() => document.querySelectorAll('[data-plan]').length)) === 10; })());
  await p.evaluate(() => { location.hash = '#toolkit/boundary'; }); await p.waitForTimeout(900);
  ok('deep link #toolkit/boundary opens the tool', await p.evaluate(() => document.querySelector('.tk-sheet[open] #tk-title')?.textContent === 'Say no or ask for help'));
  await p.click('[data-tk=close]'); await p.waitForTimeout(300);
  await p.click('.tk-open[data-id="reset"]'); await p.waitForTimeout(400); await p.goBack(); await p.waitForTimeout(400);
  ok('browser Back closes the sheet', await p.evaluate(() => !document.querySelector('.tk-sheet[open]')));
  await p.click('.tk-open[data-id="reset"]'); await p.waitForTimeout(400);
  ok('reset offers a practice to start', await p.evaluate(() => !!document.querySelector('.tk-sheet [data-practice]')));
  ok('print host fills', await (async () => { await p.evaluate(() => { window.print = () => { window.__printed = true; }; }); await p.click('[data-tk=print]'); await p.waitForTimeout(300); return p.evaluate(() => window.__printed && /Reset|reset/.test(document.querySelector('#tk-print').textContent)); })());
  ok('copy text has no raw markup', await p.evaluate(() => !/[<>]/.test(SereinToolkit._text('workload'))));
  await p.keyboard.press('Escape');
  await p.click('.search-launch'); await p.waitForTimeout(500); await p.keyboard.type('workload'); await p.waitForTimeout(700);
  ok('search finds the toolkit tools', await p.evaluate(() => /Workload conversation planner/.test(document.querySelector('#search-results').textContent)));
  await p.click('#search-results button:has-text("Workload conversation planner")'); await p.waitForTimeout(900);
  ok('search result opens the tool', await p.evaluate(() => document.querySelector('.tk-sheet[open] #tk-title')?.textContent === 'Workload conversation planner'));
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok('no console errors (behaviour)', !errs.length, errs.join(' | ')); await ctx.close();
}
/* ---------- accessibility, themes, mobile ---------- */
for (const [tag, opts] of [['light', {}], ['dark', { dark: true }], ['mobile', { w: 390, h: 844 }], ['mobile-dark', { w: 390, h: 844, dark: true }], ['reduced', { reduced: true }]]) {
  const { ctx, p, errs } = await session(opts); const mob = opts.w === 390;
  { const bad = await axe(p, '#main'); ok(`axe ${tag}: hub`, !bad.length, bad.join(' | ')); }
  if (mob) { ok('mobile hub: no horizontal overflow', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); const s = await small(p); ok('mobile hub: touch targets', !s.length, s.slice(0, 5).join(', ')); }
  await p.screenshot({ path: `${out}/${tag}-hub.png`, fullPage: true });
  for (const id of IDS) {
    await p.evaluate(id => SereinToolkit.open(id), id); await p.waitForTimeout(500);
    const panes = mob ? ['build', 'plan'] : ['both'];
    for (const pane of panes) {
      if (mob) { await p.click(`.tk-pane-toggle [data-pane=${pane}]`); await p.waitForTimeout(150); }
      const bad = await axe(p, '.tk-sheet'); ok(`axe ${tag}: ${id} ${pane}`, !bad.length, bad.join(' | '));
      if (mob) { const s = await small(p); ok(`mobile ${id} ${pane}: touch targets`, !s.length, s.slice(0, 5).join(', ')); }
      const f = await fits(p); ok(`${tag}: ${id} ${pane} fits`, !f.length, f.join());
      if (['shift-start', 'break-plan', 'load-check', 'workload'].includes(id)) await p.screenshot({ path: `${out}/${tag}-${id}-${pane}.png` });
    }
    await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  }
  ok(`no console errors (${tag})`, !errs.length, errs.join(' | ')); await ctx.close();
}
/* other pages that were audited: every popup fits and has a close button */
{
  const { ctx, p, errs } = await session({ w: 390, h: 844 });
  const trips = [['#toolkit', () => p.click('[data-adv=studio][data-id=support]')], ['#library/guides', () => p.click('[data-resource] >> nth=0')], ['#today', () => p.evaluate(() => document.querySelector('[data-v5=help]').click())]];
  for (const [h, fn] of trips) { await p.evaluate(h => { document.querySelectorAll('dialog[open]').forEach(d => d.close()); location.hash = h; }, h); await p.waitForTimeout(800); await fn(); await p.waitForTimeout(700);
    const r = await p.evaluate(() => { const d = document.querySelector('dialog[open]'); if (!d) return 'none'; const b = d.getBoundingClientRect(), c = d.querySelector('[data-action="close-modal"], .icon-btn[aria-label], button[aria-label*="lose"]'); return (b.right <= innerWidth + 1 && b.bottom <= innerHeight + 1 && b.left >= -1 && !!c) ? 'ok' : 'bad ' + [b.left, b.top, b.right, b.bottom].map(Math.round) + ' close:' + !!c; });
    ok(`mobile popup ${h}`, r === 'ok', r); }
  ok('no console errors (popups)', !errs.length, errs.join(' | ')); await ctx.close();
}
await browser.close();
const fail = rows.filter(r => !r.pass); console.log(`\n${rows.length - fail.length}/${rows.length} checks passed`); fs.writeFileSync(`${out}/results.json`, JSON.stringify(rows, null, 1)); process.exit(fail.length ? 1 : 0);
