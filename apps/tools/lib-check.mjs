// Browser check of the reorganised MedLex Library, Visual Atlas and Practice (local preview: node apps/tools/serve-site.mjs).
// usage: node apps/tools/lib-check.mjs [out-dir] [--port 8443]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const a = process.argv.slice(2), out = a[0] && !a[0].startsWith('--') ? a[0] : '/tmp/lib-check', pi = a.indexOf('--port'), port = pi < 0 ? 8443 : a[pi + 1];
const AXE = fs.readFileSync(process.env.AXE || '/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8'); fs.mkdirSync(out, { recursive: true });
const rows = []; const ok = (name, cond, detail = '') => { rows.push({ name, pass: !!cond, detail: cond ? '' : String(detail) }); if (!cond) console.log('FAIL', name, detail); };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] });
const URL = 'https://medlex.healthcarecrownacademy.co.uk/';
async function session({ w = 1440, h = 900, dark = false, touch = false, reduced = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', colorScheme: dark ? 'dark' : 'light', reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: touch, isMobile: touch, deviceScaleFactor: touch ? 2 : 1 });
  const p = await ctx.newPage(), errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto(URL + '#today', { waitUntil: 'load' }); await p.waitForTimeout(1800);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Skip'); b && b.click(); }); await p.waitForTimeout(300);
  return { ctx, p, errs };
}
const go = async (p, h, ms = 1300) => { await p.evaluate(h => { location.hash = h; }, h); await p.waitForTimeout(ms); };
const axe = async (p, scope = '#main') => { await p.evaluate(src => { if (!window.axe) (0, eval)(src); }, AXE); return p.evaluate(async scope => (await axe.run(document.querySelector(scope), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'], rules: { region: { enabled: false } } })).violations.map(v => `${v.id}: ${v.nodes.length} (${v.nodes[0].target.join(' ')}) ${(v.nodes[0].failureSummary || '').split('\n')[1] || ''}`), scope); };
const PAGES = ['library', 'library/lab?w=angioplasty', 'library/systems', 'library/system/ch9', 'library/glossary?sys=9', 'infographics', 'practice'];

/* ---------- behaviour (desktop) ---------- */
{
  const { ctx, p, errs } = await session();
  await go(p, 'library');
  ok('Library opens on word parts', await p.evaluate(() => document.querySelector('.lx-tab.is-on')?.textContent === 'Word parts'));
  /* word parts: the three quests (prefixes, roots, suffixes) replace the old reference page */
  ok('Word parts shows the three quest tabs', await p.evaluate(() => document.querySelectorAll('.wq-tab').length === 3));
  ok('a quest is loaded in a frame', await p.evaluate(() => /quest-/.test(document.querySelector('.wq-frame')?.getAttribute('src') || '')));
  await p.click('[data-wq=root]'); await p.waitForTimeout(800); ok('Roots tab switches the quest', await p.evaluate(() => /quest-roots/.test(document.querySelector('.wq-frame').getAttribute('src'))));
  /* word lab: the old dropdown trap */
  await go(p, 'library/lab');
  const total = await p.evaluate(() => document.querySelectorAll('.lx-pick').length); ok('word lab lists all 75 decoded words', total === 75, total);
  await p.fill('[data-lx-input=lsearch]', 'card'); await p.waitForTimeout(350); const few = await p.evaluate(() => document.querySelectorAll('.lx-pick').length); ok('typing narrows the list', few > 0 && few < total, few);
  await p.fill('[data-lx-input=lsearch]', ''); await p.waitForTimeout(350); ok('clearing the search brings every word back (no stale filter)', (await p.evaluate(() => document.querySelectorAll('.lx-pick').length)) === 75);
  await p.click('.lx-pick >> nth=5'); await p.waitForTimeout(300); ok('picking a word shows its parts', await p.evaluate(() => document.querySelectorAll('.lx-lab-card .lx-tile').length >= 2));
  await p.click('[data-lx=quiz]'); await p.click('.lx-opt >> nth=0'); await p.waitForTimeout(300); ok('mini quiz gives feedback', await p.evaluate(() => !!document.querySelector('.lx-quizbox .lx-fb')));
  await p.screenshot({ path: `${out}/lab.png` });
  /* systems, glossary */
  await go(p, 'library/systems'); ok('22 body systems', (await p.evaluate(() => document.querySelectorAll('.lx-sys-card').length)) === 22);
  await p.click('.lx-sys-card >> nth=6'); await p.waitForTimeout(1500); ok('system page lists its key terms', await p.evaluate(() => document.querySelectorAll('.lx-tlist li').length > 5));
  await go(p, 'library/glossary');
  ok('glossary starts empty of rows (search first)', await p.evaluate(() => document.querySelectorAll('.lx-term').length === 0 && /1,480/.test(document.querySelector('.lx-gloss-start')?.textContent || '')));
  await p.fill('[data-lx-input=gsearch]', 'dyspn'); await p.waitForTimeout(500); ok('glossary search finds variants', await p.evaluate(() => document.querySelectorAll('.lx-term').length > 0));
  await p.click('.lx-term-h >> nth=0'); ok('a term opens inline', await p.evaluate(() => !document.querySelector('.lx-term.is-open .lx-term-b').hidden));
  await p.fill('[data-lx-input=gsearch]', 'heart'); await p.waitForTimeout(500);
  ok('generated filler is gone from the glossary', await p.evaluate(() => !/fictional teaching glossary|Concise companion definition/.test(document.querySelector('#main').textContent)));
  /* atlas */
  await go(p, 'infographics'); ok('atlas flip book shows a spread of 56 guides', await p.evaluate(() => document.querySelectorAll('.fb-pg').length >= 1 && /of 56/.test(document.querySelector('#fb-pos').textContent)));
  await p.selectOption('select[aria-label=Topic]', 'Memory cues'); await p.waitForTimeout(300); ok('category filter works', /of 8$/.test(await p.locator('#fb-pos').innerText()));
  await p.click('.fb-enl >> nth=0'); await p.waitForTimeout(1800);
  const fit = await p.evaluate(() => { const i = document.querySelector('.pv-img').getBoundingClientRect(), w = document.querySelector('.pv-stage').getBoundingClientRect(); return i.left >= w.left - 1 && i.right <= w.right + 1 && i.top >= w.top - 1 && i.bottom <= w.bottom + 1; });
  ok('the whole infographic fits the pop-up', fit);
  ok('the text of the guide (with its recall question) is offered', await p.evaluate(() => { document.querySelector('[data-pv=text]').click(); return !!document.querySelector('.pv-text details'); }));
  await p.click('[data-pv=zin]'); await p.waitForTimeout(200); ok('zoom in works', await p.evaluate(() => parseInt(document.querySelector('.pv-pct').textContent) > 100));
  await p.keyboard.press('Escape'); await p.waitForTimeout(500); ok('Esc closes the pop-up back to the shelf', await p.evaluate(() => !document.querySelector('dialog.pv') && !!document.querySelector('.fb-book')));
  /* practice: complete every mode */
  await go(p, 'practice'); ok('practice offers eight modes', (await p.evaluate(() => document.querySelectorAll('.lx-mode').length)) === 8);
  for (const mode of ['decode', 'explain', 'look', 'notes', 'coding', 'build', 'match', 'daily', 'review']) {
    await go(p, 'practice/run/' + mode, 700);
    let n = 0; for (; n < 14; n++) {
      const t = await p.evaluate(() => document.querySelector('.lx-result') ? 'result' : document.querySelector('.lx-opt') ? 'mc' : document.querySelector('.lx-tray') ? 'build' : document.querySelector('.lx-match') ? 'match' : document.querySelector('.lx-flash') ? 'flash' : 'none');
      if (t === 'result' || t === 'none') break;
      if (t === 'mc') await p.click('.lx-opt >> nth=0');
      else if (t === 'build') { const pcs = await p.$$('.lx-tray .lx-pc'); for (const b of pcs.slice(0, 3)) await b.click(); await p.click('[data-lx=rcheck]'); }
      else if (t === 'match') { const lefts = await p.$$('.lx-mp'); for (let i = 0; i < lefts.length; i++) { for (const r of await p.$$('.lx-mm:not(.is-done)')) { await p.click(`.lx-mp[data-i="${i}"]`); await r.click(); if (await p.evaluate(i => document.querySelector(`.lx-mp[data-i="${i}"]`).disabled, i)) break; } } }
      else if (t === 'flash') { await p.click('[data-lx=rshow]'); await p.click('[data-lx=rflash][data-ok="1"]'); }
      await p.waitForTimeout(120); const nx = await p.$('#lx-next'); if (nx) await nx.click(); await p.waitForTimeout(120);
    }
    ok(`practice "${mode}" runs to a result`, await p.evaluate(() => !!document.querySelector('.lx-result') || document.querySelector('#main').textContent.includes('Nothing is ready')), n);
  }
  const srs = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('medlex.lib.v1')).srs).length); ok('answers feed the spaced-review queue', srs > 5, srs);
  await go(p, 'practice'); ok('practice home reflects progress', await p.evaluate(() => /You know|ready for review|streak/.test(document.querySelector('.lx-prog-card').textContent)));
  ok('legacy practice links still work', await (async () => { await go(p, 'practice/clinical', 900); return p.evaluate(() => !!document.querySelector('.lx-q')); })());
  await go(p, 'library/terms'); ok('legacy library/terms opens the glossary', await p.evaluate(() => document.querySelector('.lx-tab.is-on')?.textContent === 'Glossary'));
  ok('no console errors (behaviour)', !errs.length, errs.join(' | ')); await ctx.close();
}
/* ---------- accessibility, both themes, and mobile ---------- */
for (const [tag, opts] of [['light', {}], ['dark', { dark: true }], ['mobile', { w: 390, h: 844, touch: true }]]) {
  const { ctx, p, errs } = await session(opts);
  for (const pg of PAGES) {
    await go(p, pg, 1500); const bad = await axe(p); ok(`axe ${tag}: ${pg}`, !bad.length, bad.join(' | '));
    if (tag === 'mobile') {
      ok(`mobile no horizontal overflow: ${pg}`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      const small = await p.evaluate(() => [...document.querySelectorAll('#main [data-lx], #main .lx-tab, #main .lx-chip, #main .lx-pick, #main a.lx-mode, #main .lx-sys-card')].filter(e => e.offsetParent).map(e => [e, e.getBoundingClientRect()]).filter(([e, r]) => r.height && r.height < 43.5).map(([e, r]) => `${e.className.toString().slice(0, 30)}:${Math.round(r.height)}`));
      ok(`mobile touch targets: ${pg}`, !small.length, small.slice(0, 4).join(', '));
    }
    if (pg === 'practice' || pg === 'library') await p.screenshot({ path: `${out}/${tag}-${pg.replace(/\W+/g, '_')}.png` });
  }
  await go(p, 'practice/run/decode', 800); { const bad = await axe(p); ok(`axe ${tag}: practice question`, !bad.length, bad.join(' | ')); await p.click('.lx-opt >> nth=1'); await p.waitForTimeout(300); const bad2 = await axe(p); ok(`axe ${tag}: practice feedback`, !bad2.length, bad2.join(' | ')); await p.screenshot({ path: `${out}/${tag}-run.png` }); }
  await go(p, 'practice/run/build', 800); { const bad = await axe(p); ok(`axe ${tag}: build`, !bad.length, bad.join(' | ')); }
  await go(p, 'practice/run/match', 800); { const bad = await axe(p); ok(`axe ${tag}: match`, !bad.length, bad.join(' | ')); }
  ok(`no console errors (${tag})`, !errs.length, errs.join(' | ')); await ctx.close();
}
await browser.close();
const fail = rows.filter(r => !r.pass); console.log(`\n${rows.length - fail.length}/${rows.length} checks passed`); fs.writeFileSync(`${out}/results.json`, JSON.stringify(rows, null, 1)); process.exit(fail.length ? 1 : 0);
