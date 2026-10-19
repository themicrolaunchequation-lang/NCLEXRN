// Browser check of Carecraft Learn (library, lesson tabs, components, pathways, saved, popups) against the local preview (node apps/tools/serve-site.mjs 8445).
// usage: node apps/tools/carecraft-learn-check.mjs [out-dir] [--port 8445]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const a = process.argv.slice(2), out = a[0] && !a[0].startsWith('--') ? a[0] : '/tmp/learn-check', pi = a.indexOf('--port'), port = pi < 0 ? 8445 : a[pi + 1];
const AXE = fs.readFileSync(process.env.AXE || '/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8'); fs.mkdirSync(out, { recursive: true });
const rows = []; const ok = (name, cond, detail = '') => { rows.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, String(detail).slice(0, 400)); };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] });
const URL = 'https://carecraft.healthcarecrownacademy.co.uk/';
async function session({ w = 1440, h = 900, dark = false, touch = false, reduced = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', colorScheme: dark ? 'dark' : 'light', reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
  const p = await ctx.newPage(), errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto(URL + '#/library', { waitUntil: 'load' }); await p.waitForTimeout(1500);
  for (let i = 0; i < 4; i++) { const hit = await p.evaluate(() => { const b = [...document.querySelectorAll('dialog[open] button')].find(x => /^(skip|close|not now|maybe later|got it)/i.test(x.textContent.trim())); if (b) { b.click(); return true; } return false; }); if (!hit) break; await p.waitForTimeout(300); }
  return { ctx, p, errs };
}
const go = async (p, h) => { await p.evaluate(h => { location.hash = h; }, h); await p.waitForTimeout(700); };
const axe = async (p, scope = '#main') => { await p.evaluate(src => { if (!window.axe) (0, eval)(src); }, AXE); return p.evaluate(async scope => (await axe.run(document.querySelector(scope), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'], rules: { region: { enabled: false } } })).violations.map(v => `${v.id}: ${v.nodes.length} (${v.nodes[0].target.join(' ')})`), scope); };
const layout = p => p.evaluate(() => { const de = document.documentElement; const over = de.scrollWidth > innerWidth + 1; const small = [...document.querySelectorAll('#main button,#main a,#main input:not([type=hidden]),#main select,#main summary,dialog[open] button')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && (r.height < 43.5 || r.width < 43.5) && getComputedStyle(e).visibility !== 'hidden' && !e.closest('.lx-vh') && !(e.tagName === 'INPUT' && e.closest('label')) && r.width > 2; }).map(e => (e.className || e.tagName) + ':' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)); return { over, small: [...new Set(small)].slice(0, 12) }; });
const LESSONS = await (async () => { const { ctx, p } = await session(); const ids = await p.evaluate(() => lessons.map(l => l.id)); await ctx.close(); return ids; })();

/* ---------- behaviour (desktop) ---------- */
{
  const { ctx, p, errs } = await session();
  ok('library shows 30 cards in 3 groups', await p.evaluate(() => document.querySelectorAll('.lesson-card').length === 30 && document.querySelectorAll('.learning-group').length === 3));
  await p.fill('#lxSearch', 'teach'); await p.waitForTimeout(300);
  ok('search narrows lessons', await p.evaluate(() => { const n = document.querySelectorAll('.lesson-card').length; return n > 0 && n < 30; }));
  await p.fill('#lxSearch', ''); await p.click('[data-action=lx-level][data-arg0=Advanced]'); await p.waitForTimeout(300);
  ok('level filter works', await p.evaluate(() => [...document.querySelectorAll('.lesson-card .lx-lv')].every(e => e.textContent === 'Advanced') && document.querySelectorAll('.lesson-card').length > 0));
  await p.click('[data-action=reset-filters]'); await p.waitForTimeout(400);
  await go(p, '#/lesson/sbar/overview');
  ok('overview renders path, viz, why', await p.evaluate(() => !!document.querySelector('.lx-path') && !!document.querySelector('.lx-viz') && !!document.querySelector('.lx-why')));
  await p.click('#tab-learn'); await p.waitForTimeout(300);
  await p.click('.lx-tile >> nth=2'); ok('framework tile switches detail', await p.evaluate(() => /Assessment/.test(document.querySelector('.lx-tile-detail h4').textContent)));
  await p.click('.lx-flip >> nth=0'); ok('flip card turns', await p.evaluate(() => document.querySelector('.lx-flip').getAttribute('aria-pressed') === 'true'));
  await p.click('#tab-scenario'); await p.waitForTimeout(300);
  await p.click('[data-action=lx-sc][data-arg1=start]'); await p.click('.lx-opt >> nth=0'); ok('scenario shows feedback', await p.evaluate(() => !!document.querySelector('.lx-fb')));
  await p.click('[data-action=lx-sc][data-arg1=next]'); await p.click('.lx-opt >> nth=0'); await p.click('[data-action=lx-sc][data-arg1=next]'); await p.waitForTimeout(300);
  ok('scenario outcome and saved best score', await p.evaluate(() => !!document.querySelector('.lx-outcome') && state.lx.sbar.sc >= 0));
  await p.click('.lx-line-btn >> nth=1'); await p.click('[data-action=lx-spot-check]'); ok('spot check scores', await p.evaluate(() => /of 5 judged/.test(document.querySelector('.lx-score').textContent)));
  await p.focus('.lx-lad input[type=range]'); await p.keyboard.press('End'); ok('slider moves', await p.evaluate(() => /Closed loop/.test(document.querySelector('.lx-lad-label').textContent)));
  await p.click('#tab-practice'); await p.waitForTimeout(300);
  await p.click('.lx-check input >> nth=0'); await p.click('.lx-check input >> nth=1');
  ok('checklist ticks persist', await p.evaluate(() => state.lx.sbar.tk.length === 2 && /2 of/.test(document.querySelector('.lx-check-count').textContent)));
  await go(p, '#/lesson/risk-evidence/scenario'); await p.fill('.lx-calc input[data-arg1=base]', '20').catch(() => {}); await p.evaluate(() => { const i = document.querySelector('.lx-calc input[data-arg1=base]'); i.value = 20; i.dispatchEvent(new Event('input', { bubbles: true })); });
  ok('risk calculator separates relative and absolute', await p.evaluate(() => /10 in 100/.test(document.querySelector('.lx-calc-txt').textContent)));
  await go(p, '#/pathways'); ok('pathways list steps with levels', await p.evaluate(() => document.querySelectorAll('.lx-path-card').length === 5 && document.querySelectorAll('.lx-path-steps button').length > 20));
  await go(p, '#/saved'); ok('saved page renders', await p.evaluate(() => !!document.querySelector('#lxResults')));
  ok('no console errors (behaviour)', !errs.length, errs.join('|')); await ctx.close();
}

/* ---------- every lesson, every tab, both viewports, light and dark ---------- */
const VPS = [['desktop', { w: 1440, h: 900 }], ['mobile', { w: 390, h: 844, touch: true }]];
for (const [vn, vp] of VPS) for (const dark of [false, true]) {
  const { ctx, p, errs } = await session({ ...vp, dark }); const tag = `${vn}-${dark ? 'dark' : 'light'}`;
  const need = { overview: ['.lx-viz', '.lx-path', '.lx-why', '.learning-brief'], learn: ['[data-lxc=fw]', '.lx-flip', '.lx-myth', '.worked-example', '.learning-step'], scenario: ['[data-lxc=sc]', '[data-lxc=spot]', '[data-lxc=lad]'], practice: ['[data-lxc=chk]', '.lx-good', '.answer'], reflect: ['.lx-rel', '.lx-prompt', '#reflection'] };
  const lessons = dark || vn === 'mobile' ? LESSONS.filter((_, i) => i % 6 === 0) : LESSONS;
  for (const id of lessons) for (const tab of Object.keys(need)) {
    await go(p, `#/lesson/${id}/${tab}`);
    const miss = await p.evaluate(sel => sel.filter(s => !document.querySelector(s)), need[tab]); ok(`${tag} ${id}/${tab} components render`, !miss.length, miss.join(','));
    if (id === lessons[0] || id === 'risk-evidence') { const v = await axe(p); ok(`${tag} ${id}/${tab} axe`, !v.length, v.join(' | ')); const l = await layout(p); ok(`${tag} ${id}/${tab} no horizontal overflow`, !l.over); if (vn === 'mobile') ok(`${tag} ${id}/${tab} touch targets`, !l.small.length, l.small.join(',')); }
    if (id === lessons[0]) await p.screenshot({ path: `${out}/${id}-${tab}-${tag}.png`, fullPage: true });
  }
  for (const route of ['library', 'pathways', 'saved']) { await go(p, '#/' + route); const v = await axe(p); ok(`${tag} ${route} axe`, !v.length, v.join(' | ')); const l = await layout(p); ok(`${tag} ${route} no overflow`, !l.over); if (vn === 'mobile') ok(`${tag} ${route} touch targets`, !l.small.length, l.small.join(',')); await p.screenshot({ path: `${out}/${route}-${tag}.png`, fullPage: route === 'library' ? false : true }); }
  /* popups */
  await go(p, '#/library');
  const popups = [['quick look', () => p.evaluate(() => previewLesson('sbar'))], ['infographic viewer', () => p.evaluate(() => openInfographics('sbar'))], ['evidence', () => p.evaluate(() => lessonEvidence('sbar'))], ['notes editor', () => p.evaluate(() => { openLesson('sbar'); noteEditor(); })]];
  for (const [name, open] of popups) {
    await open(); await p.waitForTimeout(500);
    const m = await p.evaluate(() => { const d = document.querySelector('#modal'); const r = d.getBoundingClientRect(), c = d.querySelector('[data-action=close]')?.getBoundingClientRect(); return { open: d.open, fit: r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1, close: !!c && c.top >= 0 && c.bottom <= innerHeight && c.width >= 43 && c.height >= 43, over: d.scrollWidth > d.clientWidth + 1 }; });
    ok(`${tag} popup ${name} fits viewport, visible 44px close, no sideways scroll`, m.open && m.fit && m.close && !m.over, JSON.stringify(m));
    const v = await axe(p, '#modal'); ok(`${tag} popup ${name} axe`, !v.length, v.join(' | '));
    await p.screenshot({ path: `${out}/popup-${name.replace(/ /g, '-')}-${tag}.png` }); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  }
  ok(`no console errors ${tag}`, !errs.length, errs.join('|')); await ctx.close();
}
/* reduced motion */
{ const { ctx, p } = await session({ reduced: true }); await go(p, '#/lesson/sbar/learn'); await p.click('.lx-flip >> nth=0'); ok('reduced motion: flip shows definition without 3D transform', await p.evaluate(() => getComputedStyle(document.querySelector('.lx-flip-in')).transform === 'none' && getComputedStyle(document.querySelector('.lx-back')).visibility === 'visible')); await ctx.close(); }
await browser.close();
const bad = rows.filter(r => !r.pass); console.log(`${rows.length - bad.length}/${rows.length} checks passed`); process.exit(bad.length ? 1 : 0);
