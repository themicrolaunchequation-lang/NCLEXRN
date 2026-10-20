// Browser check of the Lumen Reading room (local preview: node apps/tools/serve-site.mjs 8444).
// usage: node apps/tools/lumen-check.mjs [out-dir] [--port 8444] [--only 7,8]   (--only runs just those numbered sections)
// Covers: rail fold/restore, close and exit controls, fit-page for PDF / slides / images / PowerPoint / samples,
// no console errors, axe, mobile overflow, touch targets; 7 = side-bar auto-collapse, 8 = customisable toolbar.
import { createRequire } from 'node:module'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const a = process.argv.slice(2), out = a[0] && !a[0].startsWith('--') ? a[0] : path.join(os.tmpdir(), 'lumen-check'), pi = a.indexOf('--port'), port = pi < 0 ? 8444 : a[pi + 1];
const oi = a.indexOf('--only'), only = oi < 0 ? null : a[oi + 1].split(',').map(Number), want = n => !only || only.includes(n);
const AXE = fs.readFileSync(process.env.AXE || '/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8'); fs.mkdirSync(out, { recursive: true });
const rows = []; const ok = (name, cond, detail = '') => { rows.push({ name, pass: !!cond }); console.log(cond ? 'ok  ' : 'FAIL', name, cond ? '' : String(detail)); };
const D = fs.mkdtempSync(path.join(os.tmpdir(), 'lumen-docs-'));

/* ---------- fixtures: hand-built PDFs, canvas PNG, python-pptx deck when available ---------- */
function pdf(file, w, h, pages) {
  const objs = []; const add = s => objs.push(s) && objs.length;
  add('<< /Type /Catalog /Pages 2 0 R >>'); add(`<< /Type /Pages /Kids [${Array.from({ length: pages }, (_, i) => `${4 + i * 2} 0 R`).join(' ')}] /Count ${pages} >>`); add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  for (let i = 0; i < pages; i++) {
    const body = `0.9 0.93 1 rg 0 0 ${w} ${h} re f 0.8 0.15 0.15 rg 0 0 ${w} 12 re f BT /F1 24 Tf 30 ${h - 50} Td (Page ${i + 1} of ${file}) Tj ET`;
    add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Contents ${5 + i * 2} 0 R /Resources << /Font << /F1 3 0 R >> >> >>`); add(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`);
  }
  let s = '%PDF-1.4\n', off = []; objs.forEach((o, i) => { off.push(s.length); s += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = s.length; s += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + off.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;
  fs.writeFileSync(path.join(D, file), s);
}
pdf('portrait.pdf', 595, 842, 4); pdf('slides.pdf', 960, 540, 4);
let hasPptx = false;
try { execFileSync('python3', ['-I', '-c', `from pptx import Presentation\nfrom pptx.util import Inches\np=Presentation();p.slide_width=Inches(13.333);p.slide_height=Inches(7.5)\nfor i in range(3):\n s=p.slides.add_slide(p.slide_layouts[5]);s.shapes.title.text='Slide %d'%(i+1)\np.save(${JSON.stringify(path.join(D, 'deck.pptx'))})`]); hasPptx = true; } catch { }

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] });
async function session({ w = 1440, h = 900, dark = false, touch = false, rail = null, ls = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', colorScheme: dark ? 'dark' : 'light', hasTouch: touch, isMobile: touch, deviceScaleFactor: touch ? 2 : 1 });
  if (rail !== null) await ctx.addInitScript(r => { try { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('lumen.rail', r); sessionStorage.setItem('seeded', '1'); } } catch { } }, rail);
  if (ls) await ctx.addInitScript(o => { try { if (!sessionStorage.getItem('seeded2')) { for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v); sessionStorage.setItem('seeded2', '1'); } } catch { } }, ls);
  const p = await ctx.newPage(), errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('https://lumen.healthcarecrownacademy.co.uk/#library', { waitUntil: 'load' }); await p.waitForTimeout(2200);
  for (let i = 0; i < 4; i++) { const sk = p.getByRole('button', { name: /^(Skip|Skip for now)$/ }); if (await sk.count()) { await sk.first().click().catch(() => { }); await p.waitForTimeout(300); } else break; }
  return { ctx, p, errs };
}
async function importFiles(p, names) {
  await p.getByRole('button', { name: /Add a source/ }).first().click(); await p.waitForTimeout(500);
  await p.locator('input[type=file]').first().setInputFiles(names.map(n => path.join(D, n))); await p.waitForTimeout(400);
  await p.locator('.modal input[type=checkbox]').first().check({ timeout: 4000 }).catch(() => { });
  const pick = async () => { await p.waitForTimeout(700); const c = p.locator('.hca7-choice'); if (await c.count()) await c.first().click(); };
  if (names.some(n => /pptx$/.test(n))) await pick();
  if (await p.locator('.modal input[type=checkbox]').count()) { await p.locator('.modal input[type=checkbox]').first().check(); await p.getByRole('button', { name: /^Add \d+ source file/ }).click(); await pick(); }
  await p.waitForSelector('.reader-root', { timeout: 60000 }); await p.waitForTimeout(2500);
  await p.evaluate(() => document.querySelectorAll('.toast-container').forEach(e => e.remove()));
}
const back = async p => { await p.getByRole('button', { name: 'Back to library' }).click(); await p.waitForTimeout(700); };
const rail = p => p.evaluate(() => document.body.classList.contains('hs-rail'));
const box = p => p.evaluate(() => { const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; }; return { stage: r('.reader-stage'), book: r('.book-object'), st: (() => { const s = document.querySelector('.reader-stage'); return s ? { sw: s.scrollWidth - s.clientWidth, sh: s.scrollHeight - s.clientHeight } : null; })(), doc: [document.documentElement.scrollHeight - innerHeight, document.documentElement.scrollWidth - innerWidth] }; });
const fits = async (p, label) => { const m = await box(p); ok(`${label}: whole page inside the stage`, m.book && m.stage && m.book.l >= m.stage.l - 1 && m.book.r <= m.stage.r + 1 && m.book.t >= m.stage.t - 1 && m.book.b <= m.stage.b + 1, JSON.stringify(m)); ok(`${label}: no scrolling needed (stage and window)`, m.st.sw <= 1 && m.st.sh <= 1 && m.doc[0] <= 0 && m.doc[1] <= 0, JSON.stringify(m)); };
const axe = async (p, scope) => { await p.evaluate(s => { if (!window.axe) (0, eval)(s); }, AXE); return p.evaluate(async scope => (await axe.run(document.querySelector(scope), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'], rules: { region: { enabled: false } } })).violations.map(v => `${v.id}: ${v.nodes.length} (${v.nodes[0].target.join(' ')})`), scope); };
const small = (p, sel, min = 44) => p.evaluate(([sel, min]) => [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length && !e.closest('.hca-reader-more-menu')).map(e => { const r = e.getBoundingClientRect(); return { n: (e.getAttribute('aria-label') || e.textContent || e.className).trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) }; }).filter(x => x.w < min - 1 || x.h < min - 1), [sel, min]);
const sample = async p => { for (let i = 0; i < 3; i++) { for (let k = 0; k < 3; k++) { const sk = p.getByRole('button', { name: /^(Skip|Skip for now|Maybe later)$/ }); if (await sk.count()) { await sk.first().click().catch(() => { }); await p.waitForTimeout(300); } } await p.locator('.book-card').first().evaluate(e => (e.querySelector('button, a') || e).click()).catch(() => { }); if (await p.waitForSelector('.reader-root', { timeout: 8000 }).catch(() => null)) break; } await p.waitForTimeout(2200); };

/* ---------- 1. rail: fold on open, restore on leave; a manual toggle lasts only for that reading session ---------- */
if (want(1)) {
  const { p, errs } = await session({ rail: '0' });
  ok('rail starts expanded on the library', !(await rail(p)));
  await sample(p); ok('opening a source folds the rail', await rail(p));
  await p.locator('.hs-rail-toggle').click(); await p.waitForTimeout(300); ok('a manual toggle while reading expands it', !(await rail(p)));
  ok('...without touching the saved choice', await p.evaluate(() => localStorage.getItem('lumen.rail')) === '0');
  await back(p); ok('leaving restores the saved (expanded) rail', !(await rail(p)));
  await sample(p); ok('next read folds again (opening it by hand lasted only for that session)', await rail(p));
  await back(p); ok('leaving restores expanded rail again', !(await rail(p)));
  await p.locator('.hs-rail-toggle').click(); await p.waitForTimeout(300); ok('library rail can be folded by the learner', await rail(p));
  await sample(p); ok('read: still folded', await rail(p)); await back(p); ok('leave: restores the learner\'s folded rail', await rail(p));
  ok('no console errors (rail)', errs.length === 0, errs.join(' | '));
  const m = await session({ w: 390, h: 844, touch: true }); await sample(m.p);
  ok('mobile: drawer closed while reading', await m.p.evaluate(() => !document.body.classList.contains('hs-drawer')));
  ok('mobile: top bar and tab bar are out of the way', await m.p.evaluate(() => ['.hs-top', '.mobile-bottom-nav', '.hs-tabs'].every(s => { const e = document.querySelector(s); return !e || getComputedStyle(e).display === 'none'; })));
  await m.ctx.close(); await p.context().close();
}

if (want(2)) {
/* ---------- 2. fit-page for every page-like source, desktop and mobile ---------- */
for (const [label, w, h, touch] of [['desktop', 1440, 900, false], ['laptop', 1100, 700, false], ['phone', 390, 844, true]]) {
  const { p, errs, ctx } = await session({ w, h, touch });
  await sample(p); await fits(p, `${label} sample`); await back(p);
  await importFiles(p, ['portrait.pdf']); await fits(p, `${label} PDF`);
  ok(`${label}: PDF opens on Fit page`, await p.locator('.hl-fit-l').first().evaluate(e => /Fit page/.test(e.textContent)).catch(() => w < 600 ? true : false));
  if (w >= 1100) { const sp = await p.locator('.book-object.spread').count(); ok(`${label}: PDF shows a two-page spread when wide`, w >= 1400 ? sp === 1 : true); } else ok(`${label}: single page on a narrow screen`, (await p.locator('.book-object.spread').count()) === 0);
  await p.screenshot({ path: `${out}/${label}-pdf.png` }); await back(p);
  await importFiles(p, ['slides.pdf']); await fits(p, `${label} slides`); await p.screenshot({ path: `${out}/${label}-slides.png` }); await back(p);
  if (hasPptx) { await importFiles(p, ['deck.pptx']); await fits(p, `${label} PowerPoint`); await back(p); }
  await ctx.close(); ok(`no console errors (${label})`, errs.length === 0, errs.join(' | '));
}
{ // images, in the browser's own canvas
  const { p, errs, ctx } = await session();
  for (const [n, W, H] of [['wide.png', 1600, 900], ['tall.png', 900, 1600]]) {
    const b64 = await p.evaluate(([W, H]) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.fillStyle = '#9cf'; g.fillRect(0, 0, W, H); g.strokeStyle = '#c00'; g.lineWidth = 12; g.strokeRect(6, 6, W - 12, H - 12); return c.toDataURL('image/png').split(',')[1]; }, [W, H]);
    fs.writeFileSync(path.join(D, n), Buffer.from(b64, 'base64')); await importFiles(p, [n]); await fits(p, `image ${n}`); await back(p);
  }
  ok('no console errors (images)', errs.length === 0, errs.join(' | ')); await ctx.close();
}
}

if (want(3)) {
/* ---------- 3. fit control: remembered per source type; zoom; present ---------- */
{
  const { p, errs, ctx } = await session();
  await importFiles(p, ['portrait.pdf']);
  await p.locator('.hl-fit > summary').click(); await p.getByRole('menuitemradio', { name: /Fit width/ }).click(); await p.waitForTimeout(600);
  const m = await box(p); ok('Fit width fills the width (page may scroll)', m.st.sh > 0 || m.book.b > m.stage.b);
  await back(p); await importFiles(p, ['portrait.pdf']); await p.waitForTimeout(500);
  ok('the choice is remembered for PDFs', await p.locator('.hl-fit-l').first().evaluate(e => /Fit width/.test(e.textContent)));
  await back(p); await importFiles(p, ['slides.pdf']); await p.waitForTimeout(500);
  ok('another source type still opens on Fit page', await p.locator('.hl-fit-l').first().evaluate(e => /Fit page/.test(e.textContent)));
  await p.keyboard.press('+'); await p.waitForTimeout(300); ok('+ zooms in', await p.locator('.hl-fit-p').first().evaluate(e => parseInt(e.textContent) > 0));
  await p.locator('.hl-present-btn').click(); await p.waitForTimeout(700);
  ok('Present: slides fill the screen with a labelled Exit', await p.locator('.hl-present-hud .hl-exit').isVisible());
  ok('Present: thumbnails strip is shown', (await p.locator('.hl-strip .hl-thumb').count()) === 4);
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(400); ok('Present: arrow key moves on', await p.locator('.hl-ph-title b').textContent().then(t => /2 \/ 4/.test(t)));
  await fits(p, 'present slide');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400); ok('Esc leaves the presentation', (await p.locator('.hl-present-hud').count()) === 0);
  ok('no console errors (fit)', errs.length === 0, errs.join(' | ')); await ctx.close();
}
}

if (want(4)) {
/* ---------- 4. close / exit controls ---------- */
for (const [label, w, h, touch] of [['desktop', 1440, 900, false], ['phone', 390, 844, true]]) {
  const { p, errs, ctx } = await session({ w, h, touch }); await sample(p);
  ok(`${label}: study panel is closed by default`, (await p.locator('.hl-sidecar').count()) === 0);
  await p.getByRole('button', { name: /Study panel/ }).first().click(); await p.waitForTimeout(500);
  const cl = p.locator('.hl-close'); const bb = await cl.boundingBox();
  ok(`${label}: panel has a labelled Close ≥44px`, bb && bb.width >= 44 && bb.height >= 44 && /Close/.test(await cl.textContent()), JSON.stringify(bb));
  const pr = await p.locator('.hl-sidecar').boundingBox(); ok(`${label}: panel fits the viewport`, pr.x >= -1 && pr.y >= -1 && pr.x + pr.width <= w + 1 && pr.y + pr.height <= h + 1, JSON.stringify(pr));
  const tabs = await p.evaluate(() => [...document.querySelectorAll('.hl-tab')].map(t => { const r = t.getBoundingClientRect(); return [r.left, r.right]; }));
  ok(`${label}: four tabs do not overlap`, tabs.length === 4 && tabs.every((t, i) => i === 0 || t[0] >= tabs[i - 1][1] - 1), JSON.stringify(tabs));
  ok(`${label}: tab text is not clipped`, await p.evaluate(() => [...document.querySelectorAll('.hl-tab')].every(t => t.scrollWidth <= t.clientWidth + 1 && [...t.querySelectorAll('span')].every(s => s.scrollWidth <= s.clientWidth + 1))));
  for (const t of ['Explain', 'Quiz & summary', 'Look up']) { await p.getByRole('tab', { name: t }).click(); await p.waitForTimeout(250); ok(`${label}: ${t} tab fits`, await p.evaluate(() => { const r = document.querySelector('.hl-sidecar').getBoundingClientRect(), c = document.querySelector('.hca-sidecar-content'); return c.scrollWidth <= c.clientWidth + 2 && r.right <= innerWidth + 1; })); }
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  if (w < 1180) ok(`${label}: Esc closes the overlay panel`, (await p.locator('.hl-sidecar').count()) === 0);
  else { await p.locator('.hl-close').click(); await p.waitForTimeout(300); ok(`${label}: Close closes the docked panel`, (await p.locator('.hl-sidecar').count()) === 0); }
  if ((await p.locator('.hl-sidecar').count()) === 1) await p.locator('.hl-close').click();
  // focus mode
  await p.locator('.hl-more > summary').click(); await p.getByRole('button', { name: /^Fullscreen/ }).click(); await p.waitForTimeout(500);
  const ex = p.locator('.hl-exit'); const eb = await ex.boundingBox();
  ok(`${label}: focus mode has a labelled "Exit full screen" top-right, ≥44px`, eb && eb.height >= 44 && eb.x + eb.width > w * .5 && eb.y < 80 && /Exit full screen/.test(await ex.textContent()), JSON.stringify(eb));
  ok(`${label}: focus mode hides the rail`, await p.evaluate(() => getComputedStyle(document.querySelector('.hs-side')).display === 'none'));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400); ok(`${label}: Esc leaves focus mode`, (await p.locator('.hl-exit').count()) === 0 && !(await p.evaluate(() => document.body.classList.contains('hl-focus'))));
  await p.locator('.hl-more > summary').click(); await p.getByRole('button', { name: /^Fullscreen/ }).click(); await p.waitForTimeout(400); await p.locator('.hl-exit').click(); await p.waitForTimeout(400);
  ok(`${label}: the Exit button leaves focus mode`, (await p.locator('.hl-exit').count()) === 0);
  // menus fit the viewport and have a way out
  await p.locator('.hl-more > summary').click(); await p.waitForTimeout(200);
  const mb = await p.locator('.hl-more-menu').boundingBox(); ok(`${label}: More menu fits the viewport`, mb.x >= -1 && mb.y >= -1 && mb.x + mb.width <= w + 1 && mb.y + mb.height <= h + 1, JSON.stringify(mb));
  await p.keyboard.press('Escape'); ok(`${label}: Esc closes More`, (await p.locator('.hl-more[open]').count()) === 0);
  await p.locator('.hl-fit > summary').click(); await p.waitForTimeout(200);
  const fb = await p.locator('.hl-fit-menu').boundingBox(); ok(`${label}: Fit menu fits the viewport`, fb.x >= -1 && fb.y >= -1 && fb.x + fb.width <= w + 1 && fb.y + fb.height <= h + 1, JSON.stringify(fb)); await p.keyboard.press('Escape');
  await p.screenshot({ path: `${out}/${label}-reader.png` });
  ok(`no console errors (${label} controls)`, errs.length === 0, errs.join(' | ')); await ctx.close();
}
}

if (want(5)) {
/* ---------- 5. axe, touch targets, overflow, light and dark ---------- */
for (const [label, w, h, touch, dark] of [['desktop light', 1440, 900, false, false], ['desktop dark', 1440, 900, false, true], ['phone light', 390, 844, true, false], ['phone dark', 390, 844, true, true]]) {
  const { p, errs, ctx } = await session({ w, h, touch, dark }); await sample(p);
  ok(`${label}: no horizontal overflow`, (await box(p)).doc[1] <= 0);
  const v = await axe(p, '.reader-root'); ok(`${label}: axe reader (${v.join('; ') || 'clean'})`, v.length === 0);
  if (touch) { const s = await small(p, '.hca-reader-root .reader-toolbar button, .hca-reader-root .reader-toolbar summary, .hca-reader-root .reader-bottom-toolbar button, .hca-reader-root .reader-bottom-toolbar summary, .hca-reader-root .reader-heading-actions button, .hca-reader-root .reader-title-group button'); ok(`${label}: reader controls ≥44px`, s.length === 0, JSON.stringify(s)); }
  await p.getByRole('button', { name: /Study panel/ }).first().click(); await p.waitForTimeout(500);
  const v2 = await axe(p, '.hl-sidecar'); ok(`${label}: axe study panel (${v2.join('; ') || 'clean'})`, v2.length === 0);
  if (touch) { const s = await small(p, '.hl-sidecar .hl-close, .hl-sidecar .hl-tab, .hl-sidecar .hl-pop'); ok(`${label}: panel controls ≥44px`, s.length === 0, JSON.stringify(s)); }
  await p.screenshot({ path: `${out}/${label.replace(' ', '-')}-panel.png` });
  ok(`no console errors (${label})`, errs.length === 0, errs.join(' | ')); await ctx.close();
}
}

if (want(6)) {
/* ---------- 6. Quick tour tab, tour steps, clear toolbar and menu names ---------- */
for (const [label, w, h, touch] of [['desktop', 1440, 900, false], ['phone', 390, 844, true]]) {
  const { p, errs, ctx } = await session({ w, h, touch });
  await p.evaluate(() => { location.hash = '#home'; }); await p.waitForTimeout(800);
  const tab = p.locator('.hl-tour-tab'); ok(`${label}: Quick tour tab on My Day`, await tab.count() === 1);
  const tb = await tab.boundingBox(); ok(`${label}: tab floats inside the screen, ≥44px`, tb && tb.height >= 44 && tb.y + tb.height <= h && tb.x + tb.width <= w && tb.y > h / 3, JSON.stringify(tb));
  await p.evaluate(() => { location.hash = '#library'; }); await p.waitForTimeout(600); ok(`${label}: tab on the library`, await p.locator('.hl-tour-tab').count() === 1);
  await p.evaluate(() => { location.hash = '#progress'; }); await p.waitForTimeout(600); ok(`${label}: no tab on other pages`, await p.locator('.hl-tour-tab').count() === 0);
  await p.evaluate(() => { location.hash = '#home'; }); await p.waitForTimeout(600);
  await p.locator('.hl-tour-tab').click(); await p.waitForTimeout(600);
  ok(`${label}: the tab opens the tour`, /A little tour of Lumen/.test(await p.locator('[role=dialog]').first().innerText().catch(() => '')));
  const v = await axe(p, '[role=dialog]'); ok(`${label}: axe tour (${v.join('; ') || 'clean'})`, v.length === 0);
  let steps = 1; for (; steps < 8; steps++) { const nx = p.locator('.modal').getByRole('button', { name: /^(A little further|Next)/ }); if (!(await nx.count())) break; await nx.first().click(); await p.waitForTimeout(250); }
  ok(`${label}: tour has 5 steps`, /OF 5/i.test(await p.locator('[role=dialog]').first().innerText()) && steps === 5, 'steps ' + steps);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok(`no console errors (${label} tour)`, errs.length === 0, errs.join(' | ')); await ctx.close();
}
{
  const { p, errs, ctx } = await session({ w: 1440, h: 900 }); await importFiles(p, ['portrait.pdf']);
  ok('reader: no Quick tour tab over the reader', await p.locator('.hl-tour-tab:visible').count() === 0);
  const names = await p.evaluate(() => [...document.querySelectorAll('.hca-reader-root .reader-toolbar button, .hca-reader-root .reader-toolbar summary')].map(e => (e.getAttribute('aria-label') || e.textContent).trim()));
  for (const n of ['Mark a region', 'Explain', 'Quiz & summary', 'Tools']) ok(`reader toolbar has "${n}"`, names.some(x => x.includes(n)), names.join(' | '));
  ok('reader toolbar has no look-alike names', !names.some(x => /Recall page|Page studio|Study tools/.test(x)), names.join(' | '));
  await p.locator('.reader-root summary').filter({ hasText: 'Tools' }).first().click(); await p.waitForTimeout(500);
  const menu = await p.evaluate(() => { const m = document.querySelector('details[open]'); return m ? m.innerText : ''; });
  ok('Tools menu is grouped and has no duplicate sticky note', /CAPTURE/i.test(menu) && /SHARE/i.test(menu) && !/Pin a sticky note/.test(menu), menu.slice(0, 200)); await p.keyboard.press('Escape');
  ok('no console errors (reader names)', errs.length === 0, errs.join(' | ')); await ctx.close();
}
}


/* ---------- 7. side bar: folds on every way of opening a source; the learner's own choice is never overwritten ---------- */
if (want(7)) {
  const lsGet = (p, k) => p.evaluate(k => localStorage.getItem(k), k);
  { // an old "remember the expanded rail" value and a saved expanded choice must not defeat the fold
    const { p, errs, ctx } = await session({ w: 1920, h: 940, ls: { 'lumen.rail': '0', 'lumen.rail.read': '0', 'lumen.rail.pre': '0' } });
    await p.waitForTimeout(500);
    ok('rail: a leftover lumen.rail.pre is put back and lumen.rail.read is dropped', (await lsGet(p, 'lumen.rail.read')) === null && (await lsGet(p, 'lumen.rail.pre')) === null && (await lsGet(p, 'lumen.rail')) === '0');
    ok('rail: library shows the saved expanded rail', !(await rail(p)));
    await sample(p); ok('rail: sample from the library folds it (saved choice expanded, old read value 0)', await rail(p));
    ok('rail: saved choice is untouched while reading', (await lsGet(p, 'lumen.rail')) === '0');
    ok('rail: toggle says "Expand sidebar" while folded', (await p.locator('.hs-rail-toggle').getAttribute('aria-label')) === 'Expand sidebar');
    await p.locator('.hs-rail-toggle').click(); await p.waitForTimeout(300); ok('rail: opened by hand while reading', !(await rail(p)));
    await p.screenshot({ path: `${out}/rail-opened-by-hand.png` });
    ok('rail: ...still not saved', (await lsGet(p, 'lumen.rail')) === '0');
    await back(p); ok('rail: leaving brings back the saved choice', !(await rail(p)));
    // Home: Continue reading
    await p.evaluate(() => { location.hash = '#home'; }); await p.waitForTimeout(900);
    await p.locator('button.hs-link', { hasText: 'Continue reading' }).first().click(); await p.waitForSelector('.reader-root'); await p.waitForTimeout(1200);
    ok('rail: Home "Continue reading" folds it (the manual open did not stick)', await rail(p));
    await p.screenshot({ path: `${out}/rail-continue-reading.png` });
    await back(p);
    await importFiles(p, ['portrait.pdf']); ok('rail: an uploaded PDF folds it', await rail(p));
    // another source opened from inside the reader is a new reading session
    await p.locator('.hs-rail-toggle').click(); await p.waitForTimeout(250); ok('rail: opened by hand again', !(await rail(p)));
    await p.evaluate(() => { const h = HCAShell; return h && h.normalize(); });
    await back(p);
    ok('rail: no console errors', errs.length === 0, errs.join(' | ')); await ctx.close();
  }
  { // the setting: Settings has a row, the Customise dialog has the same switch; off = follow the saved choice
    const { p, errs, ctx } = await session({ w: 1440, h: 900, ls: { 'lumen.rail': '0' } });
    await p.getByRole('button', { name: /^Settings$/ }).first().click(); await p.waitForTimeout(600);
    const sw = p.getByRole('switch', { name: 'Collapse the side bar while reading' });
    ok('rail setting: a switch in Settings, on by default', (await sw.count()) === 1 && (await sw.getAttribute('aria-checked')) === 'true');
    const sb = await sw.boundingBox(); ok('rail setting: switch is in view', !!sb && sb.width > 0);
    const v = await axe(p, '[role=dialog]'); ok(`rail setting: axe Settings (${v.join('; ') || 'clean'})`, v.length === 0);
    await sw.scrollIntoViewIfNeeded(); await p.screenshot({ path: `${out}/rail-setting.png` });
    await sw.click(); await p.waitForTimeout(200);
    ok('rail setting: turning it off is saved', (await lsGet(p, 'lumen.rail.auto')) === '0' && (await sw.getAttribute('aria-checked')) === 'false');
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    await sample(p); ok('rail setting off: opening a source leaves the rail as the learner has it (expanded)', !(await rail(p)));
    await p.locator('.hs-rail-toggle').click(); await p.waitForTimeout(250); ok('rail setting off: a toggle while reading is the learner\'s own choice and is saved', (await rail(p)) && (await lsGet(p, 'lumen.rail')) === '1');
    await back(p); ok('rail setting off: still folded after leaving', await rail(p));
    // turn it back on from inside the reader (Customise toolbar): folds immediately, own choice stays saved
    await p.locator('.hs-rail-toggle').click(); await p.waitForTimeout(250);
    await sample(p); ok('rail setting off: expanded when reading', !(await rail(p)));
    await p.locator('.hl-gear').click(); await p.waitForTimeout(500);
    await p.getByRole('switch', { name: /Collapse the side bar while reading/ }).click(); await p.waitForTimeout(400);
    ok('rail setting on again (from the Customise dialog): folds at once', await rail(p) && (await lsGet(p, 'lumen.rail.auto')) === '1');
    ok('rail setting: the saved choice is still expanded', (await lsGet(p, 'lumen.rail')) === '0');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok('rail: no console errors (setting)', errs.length === 0, errs.join(' | ')); await ctx.close();
  }
  for (const [label, w, h, touch] of [['tablet', 1000, 700, false], ['phone', 390, 844, true]]) { // drawer widths: unchanged
    const { p, ctx } = await session({ w, h, touch, ls: { 'lumen.rail': '0' } }); await sample(p);
    ok(`rail: ${label} keeps the drawer behaviour (closed while reading, no rail class)`, await p.evaluate(() => !document.body.classList.contains('hs-drawer') && !document.body.classList.contains('hs-rail')));
    await ctx.close();
  }
}

/* ---------- 8. customisable toolbar ---------- */
if (want(8)) {
  const ids = p => p.evaluate(() => [...document.querySelectorAll('.hl-tools .hl-it')].filter(e => e.getClientRects().length).map(e => e.dataset.hlId));
  const bar = p => p.evaluate(() => { const b = document.querySelector('.hl-tools'), r = b.getBoundingClientRect(), t = b.querySelector('.hl-tail').getBoundingClientRect(), its = [...b.querySelectorAll('.hl-it')].filter(e => e.getClientRects().length), rs = its.map(e => e.getBoundingClientRect());
    const ov = rs.some((x, i) => i && x.left < rs[i - 1].right - 1 && Math.abs(x.top - rs[i - 1].top) < 10);
    const tb = document.querySelector('.reader-toolbar'); const mid = e => { const q = e.getBoundingClientRect(); return q.top + q.height / 2; }; const lines = its.every(e => Math.abs(mid(e) - mid(its[0])) < 8) ? 1 : 2;
    return { vis: its.map(e => e.dataset.hlId), ico: its.map(e => !!e.dataset.ico), tailOk: t.right <= r.right + 1, rowFits: tb.scrollWidth <= tb.clientWidth + 1, ov, lines, doc: document.documentElement.scrollWidth - innerWidth, itemsLeft: rs[0]?.left }; });
  const openCz = async p => { await p.locator('.hl-gear').click(); await p.waitForSelector('.hl-cz'); await p.waitForTimeout(300); };
  const moreText = async p => { await p.locator('.hl-more > summary').click(); await p.waitForTimeout(250); const t = await p.locator('.hl-more-menu').innerText(); await p.keyboard.press('Escape'); await p.waitForTimeout(150); return t; };
  const SUGGESTED = ['pen', 'highlight', 'sticky', 'region', 'tools', 'explain', 'quiz', 'views'];

  { // the default bar, and how it adapts to width
    const labelOf = { pen: 'Pen', highlight: 'Highlight', sticky: 'Sticky note', region: 'Mark a region', tools: 'Magnifier', explain: 'Explain', quiz: 'Quiz & summary', views: 'Flipbook' };
    let prevCount = 99, prevIco = -1;
    for (const [w, h] of [[1920, 940], [1440, 900], [1280, 800], [1024, 768], [768, 1024], [390, 844]]) {
      const { p, errs, ctx } = await session({ w, h, touch: w < 600 }); await sample(p);
      const b = await bar(p);
      ok(`toolbar ${w}: the bar fits (no overflow, one row, no overlap, page does not scroll sideways)`, b.tailOk && b.rowFits && !b.ov && b.lines === 1 && b.doc <= 0, JSON.stringify(b));
      ok(`toolbar ${w}: the visible buttons are the first of the suggested order`, b.vis.every((id, i) => id === SUGGESTED[i]) && b.vis.length >= 3, b.vis.join());
      const ico = b.ico.filter(Boolean).length;
      ok(`toolbar ${w}: names turn into icons from the right before anything moves to More`, (b.vis.length === SUGGESTED.length) || b.ico.every(Boolean), JSON.stringify(b));
      ok(`toolbar ${w}: narrower never shows more buttons or more names`, b.vis.length <= prevCount && (b.vis.length < prevCount || ico >= prevIco), `${b.vis.length}/${ico} after ${prevCount}/${prevIco}`);
      prevCount = b.vis.length; prevIco = b.vis.length < SUGGESTED.length ? 99 : ico;
      const more = await moreText(p);
      ok(`toolbar ${w}: everything that left the bar is under More`, SUGGESTED.filter(id => !b.vis.includes(id)).every(id => more.includes(labelOf[id])), more.replace(/\n+/g, ' | ').slice(0, 300));
      ok(`toolbar ${w}: icon buttons keep a name for screen readers and a tooltip`, await p.evaluate(() => [...document.querySelectorAll('.hl-tools .hl-it[data-ico="1"] > button, .hl-tools .hl-it[data-ico="1"] .hl-views > button, .hl-tools .hl-it[data-ico="1"] > details > summary')].filter(e => e.getClientRects().length).every(e => (e.getAttribute('aria-label') || e.textContent).trim() && (e.title || e.getAttribute('aria-label')))));
      await p.screenshot({ path: `${out}/toolbar-${w}.png`, clip: { x: 0, y: 0, width: w, height: Math.min(h, 170) } });
      ok(`no console errors (toolbar ${w})`, errs.length === 0, errs.join(' | ')); await ctx.close();
    }
  }
  { // slide deck: Present joins the bar
    const { p, ctx } = await session({ w: 1440, h: 900 }); await importFiles(p, ['slides.pdf']);
    ok('toolbar: a slide deck shows Present on the bar', (await ids(p)).includes('slides')); await ctx.close();
  }
  { // customise: unpin, reorder, add, default tool, persistence, limits, reset, bad JSON
    const { p, errs, ctx } = await session({ w: 1440, h: 900 }); await sample(p);
    ok('toolbar: gear at the end of the bar with a name', (await p.locator('.hl-gear').getAttribute('aria-label')) === 'Customise toolbar');
    await p.locator('.hl-more > summary').click(); await p.locator('.hl-cz-open').click(); await p.waitForTimeout(500);
    ok('customise: More has a "Customise toolbar" item that opens the dialog', (await p.getByRole('dialog', { name: 'Customise toolbar' }).count()) === 1);
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    await openCz(p);
    const v = await axe(p, '.hl-cz'); ok(`customise: axe dialog (${v.join('; ') || 'clean'})`, v.length === 0);
    ok('customise: pinned list shows the suggested bar in order', await p.locator('.hl-cz ol .hl-cz-name b').allInnerTexts().then(t => t.join() === 'Pen,Highlight,Sticky note,Mark a region,Tools,Explain,Quiz & summary,Present slides,Reading view'));
    await p.getByRole('button', { name: 'Move Pen to More' }).click(); await p.waitForTimeout(250);
    ok('customise: unpinning Pen takes it off the bar at once', !(await ids(p)).includes('pen') && (await ids(p))[0] === 'highlight');
    ok('customise: ...and it is offered under More', (await p.getByRole('button', { name: 'Add Pen to the toolbar' }).count()) === 1);
    ok('customise: keyboard focus stays in the pinned list', await p.evaluate(() => document.activeElement?.closest('ol.hl-cz-list') !== null));
    ok('customise: the change is announced', /Pen moved to the More menu/.test(await p.locator('.hl-cz [role=status]').innerText()));
    await p.getByRole('button', { name: 'Move Sticky note up' }).click(); await p.waitForTimeout(250);
    ok('customise: Move up reorders the bar', (await ids(p)).slice(0, 2).join() === 'sticky,highlight', (await ids(p)).join());
    ok('customise: focus follows the moved item (to its Move down button, as Move up is now unavailable)', await p.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Move Sticky note down'));
    await p.getByRole('button', { name: 'Move Sticky note down' }).click(); await p.waitForTimeout(200);
    ok('customise: Move down puts it back', (await ids(p))[0] === 'highlight');
    const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('lumen.toolbar.v1')));
    ok('customise: saved as lumen.toolbar.v1', saved && saved.v === 1 && !saved.pinned.includes('pen') && saved.pinned[0] === 'highlight', JSON.stringify(saved));
    await p.getByRole('radio', { name: /^Pen/ }).check(); await p.waitForTimeout(200);
    await p.getByRole('button', { name: 'Teal pen' }).click(); await p.waitForTimeout(150);
    ok('customise: pen colour can be chosen', (await p.getByRole('button', { name: 'Teal pen' }).getAttribute('aria-pressed')) === 'true');
    await p.screenshot({ path: `${out}/customise-1440.png` });
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    ok('customise: Esc closes it and focus returns to the gear', await p.evaluate(() => document.activeElement?.classList.contains('hl-gear')));
    await back(p); await sample(p);
    ok('default tool: Pen is active when a source opens (it lives under More)', await p.evaluate(() => document.querySelector('.hl-more')?.classList.contains('has-active')));
    ok('default tool: the More button says so for screen readers', /Pen is on/.test(await p.locator('.hl-more > summary').innerText().catch(() => '')) || (await p.locator('.hl-more > summary .hl-sr').count()) === 1);
    ok('default tool: the page is in pen mode', (await p.locator('.hca-annotations.tool-pen').count()) > 0);
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok('default tool: Esc goes back to selecting', (await p.locator('.hca-annotations.tool-pen').count()) === 0);
    // persistence across a reload
    await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(2200); await sample(p);
    ok('customise: the arrangement survives a reload', !(await ids(p)).includes('pen') && (await ids(p))[0] === 'highlight', (await ids(p)).join());
    // pin Pen again with a pinned default tool, check pressed
    await openCz(p); await p.getByRole('button', { name: 'Add Pen to the toolbar' }).click(); await p.waitForTimeout(250);
    ok('customise: Add puts Pen at the end of the bar list', (await p.locator('.hl-cz ol .hl-cz-name b').allInnerTexts()).at(-1) === 'Pen');
    ok('customise: focus lands on the added item', await p.evaluate(() => /Pen/.test(document.activeElement?.getAttribute('aria-label') || '')));
    // limit: pin everything
    for (let i = 0; i < 40; i++) { const add = p.locator('.hl-cz button[data-hl-act=pin]:not(:disabled)'); if (!(await add.count())) break; await add.first().click(); await p.waitForTimeout(60); }
    ok('customise: the bar holds at most 12 buttons', (await p.locator('.hl-cz ol .hl-cz-row').count()) === 12 && (await p.locator('.hl-cz button[data-hl-act=pin]:not(:disabled)').count()) === 0);
    ok('customise: the limit is explained', /holds up to 12/.test(await p.locator('.hl-cz-note').innerText()));
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    for (const w of [1920, 1440, 1280, 1024]) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(500); const b = await bar(p); ok(`toolbar 12 buttons at ${w}: still fits on one row`, b.tailOk && b.rowFits && b.lines === 1 && b.doc <= 0, JSON.stringify(b)); if (w === 1280) await p.screenshot({ path: `${out}/toolbar-12-1280.png`, clip: { x: 0, y: 0, width: 1280, height: 170 } }); }
    await p.setViewportSize({ width: 1440, height: 900 });
    // icons only + reset
    await openCz(p); await p.getByRole('radio', { name: /^Icons only/ }).check(); await p.waitForTimeout(300);
    ok('customise: "Icons only" drops every name from the bar', (await bar(p)).ico.every(Boolean));
    await p.getByRole('button', { name: 'Reset to suggested' }).click(); await p.waitForTimeout(300);
    const r = await bar(p); ok('customise: Reset to suggested brings back the suggested bar, names and Select text', r.vis.join() === SUGGESTED.join() && !r.ico.some(Boolean) && (await p.getByRole('radio', { name: /^Select text/ }).isChecked()), JSON.stringify(r));
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    ok('no console errors (customise)', errs.length === 0, errs.join(' | ')); await ctx.close();
  }
  { // bad JSON and unknown ids
    for (const [label, raw] of [['bad JSON', '{not json'], ['wrong type', '"pen"'], ['unknown ids', JSON.stringify({ v: 1, pinned: ['nope', 'pen', 'pen', 7], tool: 'laser', labels: 'x' })]]) {
      const { p, errs, ctx } = await session({ w: 1440, h: 900, ls: { 'lumen.toolbar.v1': raw } }); await sample(p);
      const b = await bar(p);
      ok(`toolbar saved data (${label}): the bar still works`, label === 'unknown ids' ? b.vis.join() === 'pen' : b.vis.join() === SUGGESTED.join(), b.vis.join());
      ok(`toolbar saved data (${label}): no console errors`, errs.length === 0, errs.join(' | ')); await ctx.close();
    }
  }
  { // touch: 44px targets in the bar, More and the dialog; the dialog fits the phone; axe
    const { p, errs, ctx } = await session({ w: 390, h: 844, touch: true }); await sample(p);
    const s1 = await small(p, '.hl-tools button, .hl-tools summary'); ok('phone: bar buttons are at least 44px', s1.length === 0, JSON.stringify(s1));
    ok('phone: no gear on the bar (Customise is in More)', (await p.locator('.hl-gear:visible').count()) === 0);
    await p.locator('.hl-more > summary').click(); await p.waitForTimeout(250);
    const s2 = await p.evaluate(() => [...document.querySelectorAll('.hl-more-menu button')].filter(e => e.getClientRects().length).map(e => ({ n: e.textContent.trim().slice(0, 24), h: Math.round(e.getBoundingClientRect().height) })).filter(x => x.h < 44));
    ok('phone: More menu items are at least 44px', s2.length === 0, JSON.stringify(s2));
    await p.locator('.hl-cz-open').click(); await p.waitForSelector('.hl-cz'); await p.waitForTimeout(400);
    const s3 = await small(p, '.hl-cz button, .hl-cz select, .hl-cz .hl-cz-opt'); ok('phone: Customise controls are at least 44px', s3.length === 0, JSON.stringify(s3));
    const mb = await p.locator('.modal.hl-cz').boundingBox(); ok('phone: the dialog fits the screen', mb.x >= 0 && mb.y >= 0 && mb.x + mb.width <= 391 && mb.y + mb.height <= 845 && (await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)), JSON.stringify(mb));
    ok('phone: nothing in the dialog is wider than the dialog', await p.evaluate(() => { const m = document.querySelector('.hl-cz .modal-body'); return m.scrollWidth <= m.clientWidth + 1; }));
    const v = await axe(p, '.hl-cz'); ok(`phone: axe dialog (${v.join('; ') || 'clean'})`, v.length === 0);
    await p.screenshot({ path: `${out}/customise-390.png` });
    await p.getByRole('button', { name: 'Move Highlight down' }).tap(); await p.waitForTimeout(250);
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    ok('phone: reordering works by touch', (await ids(p))[0] === 'pen' && (await ids(p))[1] === 'sticky', (await ids(p)).join());
    ok('no console errors (phone customise)', errs.length === 0, errs.join(' | ')); await ctx.close();
  }
  { // dark mode dialog and keyboard-only reorder
    const { p, errs, ctx } = await session({ w: 1280, h: 800, dark: true }); await sample(p); await openCz(p);
    const v = await axe(p, '.hl-cz'); ok(`dark: axe dialog (${v.join('; ') || 'clean'})`, v.length === 0);
    await p.screenshot({ path: `${out}/customise-dark.png` });
    await p.getByRole('button', { name: 'Move Pen down' }).focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
    ok('keyboard: Enter on Move down reorders, focus stays on the button', (await ids(p))[0] === 'highlight' && await p.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Move Pen down'));
    await p.keyboard.press('Enter'); await p.waitForTimeout(250); ok('keyboard: and again', (await ids(p))[1] === 'sticky');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok('no console errors (dark customise)', errs.length === 0, errs.join(' | ')); await ctx.close();
  }
}
await browser.close();
const bad = rows.filter(r => !r.pass); console.log(`\n${rows.length - bad.length}/${rows.length} checks passed`); if (bad.length) { console.log('FAILED:\n' + bad.map(b => ' - ' + b.name).join('\n')); process.exit(1); }
