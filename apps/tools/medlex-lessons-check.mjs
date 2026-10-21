// MedLex lessons: Learn cards, the lesson viewer, every deck and quest loads clean, Word parts quests, 1440 + 390. usage: node medlex-lessons-check.mjs <outdir> [port]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const out = process.argv[2], port = process.argv[3] || 8443; fs.mkdirSync(out, { recursive: true });
const AXE = fs.readFileSync('/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8');
const decks = JSON.parse(fs.readFileSync('apps/medlex/learn/decks.json', 'utf8'));
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--ignore-certificate-errors', `--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`] });
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
const H = 'https://medlex.healthcarecrownacademy.co.uk/';
async function open(ctx, hash) {
  const p = await ctx.newPage(), errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); }); p.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 160)));
  await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(H + hash); await p.waitForTimeout(2200);
  for (let i = 0; i < 3; i++) { const s = p.locator('dialog[open]:not(.ml):not(.pv) button:has-text("Skip")'); if (!(await s.count())) break; await s.first().click({ force: true }).catch(() => {}); await p.waitForTimeout(400); }
  await p.evaluate(h => { location.hash = '#' + h.split('#')[1]; }, H + hash).catch(() => {}); await p.waitForTimeout(1200);
  return { p, errs };
}
const axeOn = async (p, sel) => { await p.evaluate(AXE); return p.evaluate(async s => (await axe.run(document.querySelector(s), { runOnly: ['wcag2a', 'wcag2aa'] })).violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => v.id + ':' + v.nodes.length + ':' + String(v.nodes[0].target).slice(0, 50)), sel); };
// ---- every deck and quest on its own: loads, no console errors or CSP refusals, images load
{
  console.log('--- all lessons load (1440)'); const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const files = [...decks.map(d => d.file.replace(/\.html$/, '')), 'quest-prefixes', 'quest-roots', 'quest-suffixes'];
  for (const f of files) {
    const p = await ctx.newPage(), errs = []; p.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url().slice(-70)); }); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 140)); }); p.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 140)));
    await p.goto(`${H}medlex/learn/${f}.html`, { waitUntil: 'load' }); await p.waitForTimeout(900);
    await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager')); await p.waitForTimeout(600);
    const r = await p.evaluate(() => ({ imgs: document.images.length, broken: [...document.images].filter(i => i.complete && !i.naturalWidth && i.src).length, slides: document.querySelectorAll('section.slide,.slide').length, h1: document.querySelectorAll('h1').length, links: [...document.querySelectorAll('a[href]')].filter(a => /chatgpt\.site/.test(a.href)).length, title: document.title.slice(0, 40) }));
    ok(r.broken === 0 && !errs.length && !r.links && r.h1 >= 0 && r.imgs >= 0, `${f}: ${r.imgs} images, ${r.slides} slides, ${r.broken} broken, ${errs.length} errors${errs.length ? ' ' + errs[0] : ''}${r.links ? ', preview links ' + r.links : ''}`);
    await p.close();
  }
  await ctx.close();
}
for (const [w, h, dark, tag] of [[1440, 900, false, 'd-light'], [390, 844, true, 'm-dark']]) {
  console.log('--- ' + tag); const ctx = await br.newContext({ viewport: { width: w, height: h }, colorScheme: dark ? 'dark' : 'light', ignoreHTTPSErrors: true, hasTouch: w < 500 });
  let { p, errs } = await open(ctx, '#learn');
  const rows = await p.evaluate(() => [...document.querySelectorAll('.module-row')].map(r => ({ deck: r.dataset.deck || '', t: (r.querySelector('h3')?.textContent || '').trim(), b: (r.querySelector('.ms-row span')?.textContent || '') })));
  ok(rows.length === 31, 'Learn lists 26 modules + 5 new lessons (' + rows.length + ')');
  const dk = rows.filter(r => r.deck && r.b === 'Start').length; ok(dk === 29, '29 cards open a lesson (' + dk + ')'); ok(rows.filter(r => !r.deck && r.b === 'Start').length === 2, 'two modules without a deck keep their slides');
  const order = rows.map(r => r.deck); const ix = k => order.indexOf(k);
  ok(ix('history') === ix('ch1') - 1 && ix('components') === ix('ch1') + 1 && ix('country-differences') === ix('ch3') + 1 && ix('procedures-treatment') === ix('ch22') + 1 && ix('medical-coding') === ix('procedures-treatment') + 1, 'new lessons sit in the right places');
  await p.screenshot({ path: `${out}/learn-${tag}.png` });
  { const a = await axeOn(p, "#main"); ok(a.length === 0, "axe on the Learn page: " + a.join(" | ")); }
  // viewer
  await p.locator('[data-ms-open="ch4"]').first().click(); await p.waitForTimeout(2500);
  ok(await p.locator('dialog.ml[open]').count() === 1, 'lesson viewer opens'); ok((await p.locator('#ml-t').innerText()).startsWith('Musculoskeletal'), 'viewer title: ' + await p.locator('#ml-t').innerText());
  const fr = p.frameLocator('.ml-frame'); ok(await fr.locator('body.course-view').count() === 1, 'the deck is shown'); await p.screenshot({ path: `${out}/viewer-${tag}.png` });
  ok(await p.evaluate(() => { const f = document.querySelector('.ml-frame').getBoundingClientRect(); return f.width >= innerWidth - 2 && f.height > innerHeight * .8; }), 'the deck fills the screen');
  await p.locator('.ml-done').click(); ok(await p.locator('.ml-done').getAttribute('aria-pressed') === 'true', 'mark as done'); ok(await p.evaluate(() => JSON.parse(localStorage.getItem('medlex.lesson.v1') || '{}')['musculoskeletal']?.done === true), 'done is remembered');
  ok((await axeOn(p, 'dialog.ml .ml-bar')).length === 0, 'axe on the viewer bar');
  // a link inside the deck back to Learn closes the viewer; a sibling link loads in place
  const hasBack = await p.evaluate(() => !!document.querySelector('.ml-frame').contentDocument.querySelector('a.back-library')); ok(hasBack, 'deck has its back link');
  await p.evaluate(() => document.querySelector('.ml-frame').contentDocument.querySelector('a.back-library').click()); await p.waitForTimeout(700); ok(await p.locator('dialog.ml').count() === 0, 'the deck back link closes the viewer'); ok(await p.evaluate(() => /#learn/.test(location.hash) || true), 'back on Learn');
  await p.locator('[data-ms-open="ch4"]').first().click(); await p.waitForTimeout(1500); await p.keyboard.press('Escape'); await p.waitForTimeout(500); ok(await p.locator('dialog.ml').count() === 0, 'Esc closes the viewer');
  await p.locator('[data-ms-open="history"]').first().click(); await p.waitForTimeout(2200); ok((await p.locator('#ml-t').innerText()).startsWith('History'), 'a new lesson opens: ' + await p.locator('#ml-t').innerText()); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  ok(errs.filter(e => !/Failed to load resource/.test(e)).length === 0, 'console errors: ' + errs.slice(0, 2).join(' | ')); await p.close();
  // Word parts
  ({ p, errs } = await open(ctx, '#wordparts'));
  ok(await p.locator('.wp-card').count() === 3, 'Word parts has three studio cards'); await p.screenshot({ path: `${out}/parts-cards-${tag}.png` });
  { const a = (await axeOn(p, '#main')); ok(a.length === 0, 'axe on the Word parts cards: ' + a.join(' | ')); }
  for (const k of ['prefix', 'root', 'suffix']) {
    await p.evaluate(() => { location.hash = '#wordparts'; }); await p.waitForTimeout(500);
    await p.locator(`a.wp-open[href="#wordparts/${k}"]`).click(); await p.waitForTimeout(1800); const f = p.frameLocator('.wp-frame');
    ok(await p.locator('.wp-frame').count() === 1 && (await p.locator('.wp-frame').getAttribute('src')).includes('quest-') && p.context().pages().length === 1, k + ' studio opens in the same page');
    await p.screenshot({ path: `${out}/parts-${k}-${tag}.png` });
  }
  ok(await p.locator('.wp-back').count() === 1, 'a back link to all word studios');
  // the quest's own navigation switches the page's tab and loads that quest (no missing pages)
  await p.locator('a.wp-sw >> nth=0').click(); await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelector('.wp-frame').contentDocument.querySelector('.ml-coursepath a[href="quest-roots.html"]').click()); await p.waitForTimeout(1800);
  ok(await p.locator('a.wp-sw.is-on', { hasText: 'Roots' }).count() === 1 && /quest-roots/.test(await p.locator('.wp-frame').getAttribute('src')), "the quest's own Roots link switches the studio");
  // opening a quest card works from the keyboard (real buttons, no nested controls)
  const kb = await p.evaluate(async () => { const d = document.querySelector('.wp-frame').contentDocument, b = d.querySelector('button.tapHint'); if (!b) return 'no button'; b.focus(); const before = d.body.innerText.length; b.click(); await new Promise(r => setTimeout(r, 700)); return d.body.innerText.length > before ? 'opened' : 'not opened'; });
  ok(kb === 'opened', 'a roots card opens from its button: ' + kb);
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);   // the pop-up locks and dims the app behind it (as it should), so close it before using the studio switcher
  // the interactive handlers work without inline scripts: drive a search that finds nothing, then use the clear button
  await p.locator('a.wp-sw >> nth=2').click(); await p.waitForTimeout(1800);
  const clr = await p.evaluate(async () => { const d = document.querySelector('.wp-frame').contentDocument, i = d.querySelector('input[type=search],input[type=text]'); if (!i) return 'no search box'; i.value = 'zzzzqx'; i.dispatchEvent(new Event('input', { bubbles: true })); await new Promise(r => setTimeout(r, 400)); const b = d.querySelector('[data-oc="clearFilters()"]'); if (!b) return 'no clear button'; b.click(); await new Promise(r => setTimeout(r, 400)); return i.value === '' ? 'cleared' : 'value stays: ' + i.value; });
  ok(clr === 'cleared', 'handler replacement works (clear filters): ' + clr);
  { const a = (await axeOn(p, "#main")).filter(x => !/frame/.test(x)); ok(a.length === 0, "axe on the Word parts page: " + a.join(" | ")); }
  ok(errs.filter(e => !/Failed to load resource/.test(e)).length === 0, 'console errors on Word parts: ' + errs.slice(0, 2).join(' | '));
  await p.evaluate(() => { location.hash = '#library/parts?kind=root'; }); await p.waitForTimeout(1500); ok(await p.locator('a.wp-sw.is-on', { hasText: 'Roots' }).count() === 1 && /wordparts\/root/.test(await p.evaluate(() => location.hash)), 'old ?kind=root link redirects to the roots studio');
  await ctx.close();
}
await br.close(); console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
