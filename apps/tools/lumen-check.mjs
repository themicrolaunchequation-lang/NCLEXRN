// Browser check of the Lumen Reading room (local preview: node apps/tools/serve-site.mjs 8444).
// usage: node apps/tools/lumen-check.mjs [out-dir] [--port 8444]
// Covers: rail fold/restore, close and exit controls, fit-page for PDF / slides / images / PowerPoint / samples,
// no console errors, axe, mobile overflow, touch targets.
import { createRequire } from 'node:module'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const a = process.argv.slice(2), out = a[0] && !a[0].startsWith('--') ? a[0] : path.join(os.tmpdir(), 'lumen-check'), pi = a.indexOf('--port'), port = pi < 0 ? 8444 : a[pi + 1];
const AXE = fs.readFileSync(process.env.AXE || '/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8'); fs.mkdirSync(out, { recursive: true });
const rows = []; const ok = (name, cond, detail = '') => { rows.push({ name, pass: !!cond }); console.log(cond ? 'ok  ' : 'FAIL', name, cond ? '' : String(detail)); };
const D = fs.mkdtempSync(path.join(os.tmpdir(), 'lumen-docs-'));

/* ---------- fixtures: hand-built PDFs, canvas PNG, python-pptx deck when available ---------- */
function pdf(file, w, h, pages, pad = 0) {
  const objs = []; const add = s => objs.push(s) && objs.length;
  add('<< /Type /Catalog /Pages 2 0 R >>'); add(`<< /Type /Pages /Kids [${Array.from({ length: pages }, (_, i) => `${4 + i * 2} 0 R`).join(' ')}] /Count ${pages} >>`); add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  for (let i = 0; i < pages; i++) {
    const body = `0.9 0.93 1 rg 0 0 ${w} ${h} re f 0.8 0.15 0.15 rg 0 0 ${w} 12 re f BT /F1 24 Tf 30 ${h - 50} Td (Page ${i + 1} of ${file}) Tj ET`;
    add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Contents ${5 + i * 2} 0 R /Resources << /Font << /F1 3 0 R >> >> >>`); add(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`);
  }
  if (pad) add(`<< /Length ${pad} >>\nstream\n${'x'.repeat(pad)}\nendstream`); // unused object: makes the file as big as a real deck
  let s = '%PDF-1.4\n', off = []; objs.forEach((o, i) => { off.push(s.length); s += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = s.length; s += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + off.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;
  fs.writeFileSync(path.join(D, file), s);
}
pdf('portrait.pdf', 595, 842, 4); pdf('slides.pdf', 960, 540, 4);
let hasPptx = false;
try { execFileSync('python3', ['-I', '-c', `from pptx import Presentation\nfrom pptx.util import Inches\np=Presentation();p.slide_width=Inches(13.333);p.slide_height=Inches(7.5)\nfor i in range(3):\n s=p.slides.add_slide(p.slide_layouts[5]);s.shapes.title.text='Slide %d'%(i+1)\np.save(${JSON.stringify(path.join(D, 'deck.pptx'))})`]); hasPptx = true; } catch { }

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] });
async function session({ w = 1440, h = 900, dark = false, touch = false, rail = null, init = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', colorScheme: dark ? 'dark' : 'light', hasTouch: touch, isMobile: touch, deviceScaleFactor: touch ? 2 : 1 });
  if (init) await ctx.addInitScript(init);
  if (rail !== null) await ctx.addInitScript(r => { try { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('lumen.rail', r); sessionStorage.setItem('seeded', '1'); } } catch { } }, rail);
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

/* ---------- 1. rail: fold on open, restore on leave, manual toggle wins ---------- */
{
  const { p, errs } = await session({ rail: '0' });
  ok('rail starts expanded on the library', !(await rail(p)));
  await sample(p); ok('opening a source folds the rail', await rail(p));
  await p.locator('.hs-rail-toggle').click(); await p.waitForTimeout(300); ok('a manual toggle while reading expands it', !(await rail(p)));
  await back(p); ok('leaving restores the previous (expanded) rail', !(await rail(p)));
  await sample(p); ok('next read starts with the rail choice made while reading (expanded)', !(await rail(p)));
  await p.locator('.hs-rail-toggle').click(); await p.waitForTimeout(300); ok('toggle folds it again', await rail(p));
  await back(p); ok('leaving restores expanded rail again', !(await rail(p)));
  await p.locator('.hs-rail-toggle').click(); await p.waitForTimeout(300); ok('library rail can be folded by the learner', await rail(p));
  await sample(p); ok('read: still folded', await rail(p)); await back(p); ok('leave: restores the learner\'s folded rail', await rail(p));
  ok('no console errors (rail)', errs.length === 0, errs.join(' | '));
  const m = await session({ w: 390, h: 844, touch: true }); await sample(m.p);
  ok('mobile: drawer closed while reading', await m.p.evaluate(() => !document.body.classList.contains('hs-drawer')));
  ok('mobile: top bar and tab bar are out of the way', await m.p.evaluate(() => ['.hs-top', '.mobile-bottom-nav', '.hs-tabs'].every(s => { const e = document.querySelector(s); return !e || getComputedStyle(e).display === 'none'; })));
  await m.ctx.close(); await p.context().close();
}

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

/* ---------- 7. Workspace storage: "Your learning space" (meter, sources, folder, limit, protection, backup) ---------- */
{
  pdf('space-big.pdf', 595, 842, 6, 3_000_000); pdf('space-mid.pdf', 960, 540, 12, 1_200_000); pdf('space-small.pdf', 595, 842, 3, 150_000); pdf('space-four.pdf', 595, 842, 4, 4_200_000);
  // browser mocks (installed before the page loads; flags are read at call time)
  const mocks = () => {
    const real = navigator.storage; if (!real) return;
    const cfg = () => { try { return JSON.parse(localStorage.getItem('test.storage') || '{}'); } catch { return {}; } };
    let persisted = !!cfg().persisted;
    const fake = { estimate: async () => ({ usage: (cfg().usageMB ?? 190) * 1048576, quota: 92315 * 1048576 }), persisted: async () => persisted, persist: async () => { if (cfg().deny) return false; persisted = true; return true; }, getDirectory: real.getDirectory && real.getDirectory.bind(real) };
    if (cfg().noapi) Object.defineProperty(navigator, 'storage', { value: undefined, configurable: true }); else Object.defineProperty(navigator, 'storage', { value: fake, configurable: true });
    if (typeof FileSystemHandle !== 'undefined') {
      FileSystemHandle.prototype.queryPermission = async function () { return window.__perm || 'granted'; };
      FileSystemHandle.prototype.requestPermission = async function () { if (window.__perm === 'prompt') window.__perm = 'granted'; return window.__perm || 'granted'; };
    }
    if (cfg().nofolder) delete window.showDirectoryPicker; else window.showDirectoryPicker = async () => { const r = await real.getDirectory(); return r.getDirectoryHandle('Lumen test folder', { create: true }); };
    if (cfg().nols) { const f = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'lumen.probe') throw new DOMException('blocked', 'SecurityError'); return f.call(this, k, v); }; }
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...a) { if (this.name === 'files' && cfg().quota) throw new DOMException('The quota has been exceeded.', 'QuotaExceededError'); return put.apply(this, a); };
  };
  const boot2 = async (cfg = {}, opts = {}) => {
    const init = `try{if(!localStorage.getItem('test.storage.set')){localStorage.setItem('test.storage',${JSON.stringify(JSON.stringify(cfg))});localStorage.setItem('test.storage.set','1')}}catch(e){};(${mocks})();`;
    const s = await session({ ...opts, init }); return s;
  };
  const pill = p => p.locator('.local-first-pill, .hs-privacy').first();
  const openPrivacy = async p => { if (await pill(p).isVisible()) await pill(p).click(); else { await p.getByRole('button', { name: 'Open navigation' }).click(); await p.waitForTimeout(500); await p.locator('.storage-status').click(); } await p.waitForTimeout(500); };
  const openSpace = async p => { await openPrivacy(p); await p.getByRole('button', { name: 'Manage your learning space' }).click(); await p.waitForTimeout(1000); };
  const addOne = async (p, name) => { await p.getByRole('button', { name: /Add a source/ }).first().click(); await p.waitForTimeout(500); await p.locator('input[type=file]').first().setInputFiles(path.join(D, name)); await p.waitForTimeout(400); await p.locator('.modal input[type=checkbox]').first().check({ timeout: 4000 }).catch(() => { }); await p.getByRole('button', { name: /^Add \d+ source file/ }).click(); };
  const addToReader = async (p, name) => { await addOne(p, name); await p.waitForSelector('.reader-root', { timeout: 60000 }); await p.waitForTimeout(1500); await p.getByRole('button', { name: 'Back to library' }).click(); await p.waitForTimeout(700); };
  const dlg = p => p.locator('.space-modal');
  const row = (p, t) => p.locator('.sp-src', { hasText: t });
  const live = p => p.locator('.sp-live').innerText();
  const tree = p => p.evaluate(async () => { const r = await navigator.storage.getDirectory(); const walk = async (d, pre) => { let o = []; for await (const [n, h] of d.entries()) { if (h.kind === 'directory') o = o.concat(await walk(h, pre + n + '/')); else o.push(pre + n + ' ' + (await h.getFile()).size); } return o; }; try { return await walk(await r.getDirectoryHandle('Lumen test folder'), ''); } catch { return []; } });

  /* 7a. nothing added yet; the privacy dialog leads here; everyday wording; persistence */
  for (const [label, w, h, touch, dark] of [['desktop', 1440, 900, false, false], ['phone', 390, 844, true, false]]) {
    const { p, errs, ctx } = await boot2({}, { w, h, touch, dark });
    await openPrivacy(p);
    const pv = await p.locator('.modal').innerText();
    ok(`${label}: privacy dialog opens with a storage card, not the old quota line`, /Workspace storage/.test(pv) && /Manage your learning space/.test(pv) && !/approximately|92315/.test(pv), pv.slice(0, 300));
    await p.screenshot({ path: `${out}/space-${label}-privacy.png` });
    await p.getByRole('button', { name: 'Manage your learning space' }).click(); await p.waitForTimeout(1000);
    const t = await dlg(p).innerText();
    ok(`${label}: titled "Your learning space" with a chosen limit (1 GB), not the browser quota`, /Your learning space/.test(t) && /of 1 GB/.test(t) && !/92315|90 GB of/.test(t.split('How much to keep')[0]), t.slice(0, 200));
    ok(`${label}: nothing is uploaded is stated`, /Nothing is uploaded anywhere/.test(t));
    ok(`${label}: empty state says so and offers Add a source`, /Nothing here yet/.test(t) && /No files yet/.test(t) && await p.getByRole('button', { name: 'Add a source' }).count() >= 1);
    ok(`${label}: breakdown lists the five kinds`, ['Original files', 'Page images and previews', 'Notes and highlights', 'Cards and reviews', 'Other'].every(k => t.includes(k)));
    ok(`${label}: default choices are This browser and 1 GB`, await p.locator('.sp-radio[data-id=browser]').getAttribute('aria-checked') === 'true' && await p.locator('.sp-limits .sp-radio.on').innerText() === '1 GB');
    ok(`${label}: Session only is shown but not selectable when storage works`, await p.locator('.sp-radio[data-id=session]').getAttribute('aria-disabled') === 'true');
    ok(`${label}: protection is plain (may be cleared)`, /The browser may clear this if the device is short of space/.test(t));
    await p.screenshot({ path: `${out}/space-${label}-empty.png` });
    await p.getByRole('button', { name: 'Ask the browser to protect it' }).click(); await p.waitForTimeout(700);
    ok(`${label}: after asking: Protected from automatic clean-up`, /Protected from automatic clean-up/.test(await dlg(p).innerText()) && /keep your learning space/.test(await live(p)));
    const v = await axe(p, '.space-modal'); ok(`${label}: axe space dialog (${v.join('; ') || 'clean'})`, v.length === 0);
    if (touch) { const s = await small(p, '.space-modal button, .space-modal input:not(.sp-hidden-input), .space-modal select, .space-modal label.button'); ok(`${label}: every control in the dialog ≥44px`, s.length === 0, JSON.stringify(s)); }
    ok(`${label}: no horizontal overflow`, await p.evaluate(() => { const b = document.querySelector('.space-modal .modal-body'), mr = document.querySelector('.space-modal').getBoundingClientRect().right; return b.scrollWidth <= b.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.space-modal *')].every(e => e.getBoundingClientRect().right <= mr + 1); }));
    ok(`no console errors (${label} space, empty)`, errs.filter(e => !/FileSystemHandle|sessionStorage/.test(e)).length === 0, errs.join(' | ')); await ctx.close();
  }

  /* 7b. sources: sizes, order, per-source actions, confirmations, backup prompt, re-adding */
  for (const [label, w, h, touch, dark] of [['desktop', 1440, 900, false, false], ['phone', 390, 844, true, true]]) {
    const { p, errs, ctx } = await boot2({ usageMB: 120 }, { w, h, touch, dark });
    await addToReader(p, 'space-big.pdf'); await addToReader(p, 'space-mid.pdf'); await addToReader(p, 'space-small.pdf');
    await openSpace(p);
    const t = await dlg(p).innerText();
    const names = await p.locator('.sp-src .sp-src-main strong').allInnerTexts();
    ok(`${label}: sources listed largest first with sizes`, names.join() === 'space-big,space-mid,space-small' && /2\.9 MB/.test(t) && /1\.1 MB/.test(t) && /146 KB|147 KB|148 KB/.test(t), names.join() + ' ' + t.slice(t.indexOf('Your sources'), t.indexOf('Your sources') + 400));
    const orig = await p.locator('.sp-legend li').first().innerText();
    ok(`${label}: Original files total is the sum (about 4.2 MB)`, /4\.[12] MB/.test(orig), orig);
    ok(`${label}: Make room suggests the biggest and says how much it frees`, /Frees 2\.9 MB/.test(await p.locator('#sp-room').locator('xpath=..').innerText()));
    ok(`${label}: app files shown apart and not counted`, /App files for offline use/.test(t) && /not counted in your limit/.test(t));
    await p.screenshot({ path: `${out}/space-${label}-sources.png` });
    await p.evaluate(() => document.getElementById('sp-sources').scrollIntoView());
    await p.screenshot({ path: `${out}/space-${label}-sources2.png` });
    const before = await p.locator('.sp-meter-num').innerText();
    await row(p, 'space-big').getByRole('button', { name: /Keep notes only/ }).click(); await p.waitForTimeout(300);
    ok(`${label}: Keep notes only asks first and explains`, /stays? here, and you can add the same file again/.test(await row(p, 'space-big').locator('.sp-confirm').innerText()));
    await row(p, 'space-big').getByRole('button', { name: 'Keep it' }).click(); await p.waitForTimeout(200);
    ok(`${label}: "Keep it" changes nothing`, (await p.locator('.sp-meter-num').innerText()) === before && /Original kept/.test(await row(p, 'space-big').innerText()));
    await row(p, 'space-big').getByRole('button', { name: /Keep notes only/ }).click(); await p.waitForTimeout(300);
    await row(p, 'space-big').getByRole('button', { name: 'Remove the original' }).click(); await p.waitForTimeout(1500);
    ok(`${label}: original removed, space freed, notes kept`, /Notes only/.test(await row(p, 'space-big').innerText()) && /Add the file again/.test(await row(p, 'space-big').innerText()) && /about 2\.9 MB is free/.test(await live(p)), await live(p));
    ok(`${label}: focus stays inside the dialog after the action`, await p.evaluate(() => !!document.activeElement.closest('.space-modal')));
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    ok(`${label}: Escape closes the dialog`, await dlg(p).count() === 0);
    await p.getByRole('button', { name: /Read space-big/ }).first().click(); await p.waitForTimeout(1500);
    const gap = await p.locator('.reader-load-error').innerText();
    ok(`${label}: opening it explains and offers to add the file again`, /The original file is not on this device/.test(gap) && /Add the file again/.test(gap) && /6 pages/.test(gap), gap);
    await p.screenshot({ path: `${out}/space-${label}-gap.png` });
    await p.locator('.sp-gap input[type=file]').setInputFiles(path.join(D, 'space-small.pdf')); await p.waitForTimeout(1500);
    ok(`${label}: a different file is refused with a plain reason`, /has 3 pages, but this source has 6/.test(await p.locator('.reader-load-error').innerText()));
    await p.locator('.sp-gap input[type=file]').setInputFiles(path.join(D, 'space-big.pdf')); await p.waitForTimeout(3500);
    ok(`${label}: the right file brings the source back`, await p.locator('.reader-load-error').count() === 0 && await p.locator('.reader-root canvas').count() > 0);
    await p.getByRole('button', { name: 'Back to library' }).click(); await p.waitForTimeout(600);
    await openSpace(p);
    await row(p, 'space-small').getByRole('button', { name: /Remove .* from this device/ }).click(); await p.waitForTimeout(300);
    const cf = await row(p, 'space-small').locator('.sp-confirm').innerText();
    ok(`${label}: Remove explains what goes and offers a backup first`, /deletes the file/.test(cf) && /Back up, then remove/.test(cf) && /Remove without a backup/.test(cf), cf);
    await p.screenshot({ path: `${out}/space-${label}-remove.png` });
    const dl = p.waitForEvent('download', { timeout: 20000 }).catch(() => null);
    await row(p, 'space-small').getByRole('button', { name: 'Back up, then remove' }).click();
    const d = await dl; ok(`${label}: a backup file is saved, then the source is removed`, !!d && /^Lumen-workspace-.*\.json$/.test(d.suggestedFilename()), d && d.suggestedFilename());
    await p.waitForTimeout(1500); ok(`${label}: source gone from the list`, await row(p, 'space-small').count() === 0);
    ok(`${label}: the dialog shows when the last backup was made`, /Last backup: \d/.test(await dlg(p).innerText()));
    const v = await axe(p, '.space-modal'); ok(`${label}: axe space dialog with sources (${v.join('; ') || 'clean'})`, v.length === 0);
    if (touch) { const s = await small(p, '.space-modal button, .space-modal input:not(.sp-hidden-input), .space-modal select, .space-modal label.button'); ok(`${label}: sources dialog controls ≥44px`, s.length === 0, JSON.stringify(s)); }
    ok(`no console errors (${label} space, sources)`, errs.filter(e => !/FileSystemHandle|sessionStorage/.test(e)).length === 0, errs.join(' | ')); await ctx.close();
  }

  /* 7c. a limit of your own: 80% warning, 100% asks first (never a silent failure), custom limit, raise */
  {
    const { p, errs, ctx } = await boot2({ usageMB: 20 });
    await openSpace(p);
    await p.locator('.sp-limits .sp-radio', { hasText: 'Custom' }).click(); await p.waitForTimeout(200);
    await p.locator('.sp-custom select').selectOption('MB'); await p.locator('#sp-cv').fill('0.5'); await p.getByRole('button', { name: 'Set limit' }).click(); await p.waitForTimeout(200);
    ok('custom limit under 5 MB is refused kindly', /at least 5 MB/.test(await p.locator('#sp-cerr').innerText()));
    await p.locator('#sp-cv').fill('5'); await p.getByRole('button', { name: 'Set limit' }).click(); await p.waitForTimeout(500);
    ok('custom 5 MB is set and shown', /of 5 MB/.test(await p.locator('.sp-meter-num').innerText()) && await p.locator('.sp-limits .sp-radio.on').innerText() === 'Custom');
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    await addOne(p, 'space-four.pdf'); await p.waitForSelector('.reader-root', { timeout: 60000 }); await p.waitForTimeout(800);
    const toast = await p.locator('.toast-container').innerText().catch(() => '');
    await p.getByRole('button', { name: 'Back to library' }).click(); await p.waitForTimeout(700);
    ok('at 80% the learner is warned when adding', /used about \d+% of your 5 MB limit/.test(toast) || /8\d% of your 5 MB/.test(toast), toast);
    await openSpace(p);
    ok('meter says getting full (not colour alone)', /Getting full: you have used 8\d%/.test(await dlg(p).innerText()));
    await p.screenshot({ path: `${out}/space-near.png` });
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    await addOne(p, 'space-mid.pdf'); await p.waitForTimeout(1200);
    const ask = await p.locator('.space-ask').innerText().catch(() => '');
    ok('over the limit: Lumen asks first and shows the numbers', /go over your space limit/.test(ask) && /Adding 1\.1 MB/.test(ask) && /Make room/.test(ask) && /Add anyway/.test(ask) && /Not now/.test(ask), ask);
    await p.screenshot({ path: `${out}/space-over.png` });
    const sources = () => p.evaluate(() => JSON.parse(localStorage.getItem('lumen.workspace.v1')).books.filter(b => b.kind !== 'demo').length);
    const n0 = await sources();
    await p.getByRole('button', { name: 'Not now' }).click(); await p.waitForTimeout(800);
    ok('Not now adds nothing', await sources() === n0);
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    await addOne(p, 'space-mid.pdf'); await p.waitForTimeout(1200);
    await p.getByRole('button', { name: 'Make room' }).first().click(); await p.waitForTimeout(900);
    { const at = await p.evaluate(() => document.activeElement.id || document.activeElement.outerHTML.slice(0, 80)); ok('Make room opens the storage dialog on top of the upload, at the Make room section', await dlg(p).count() === 1 && /sp-room/.test(at), `${await dlg(p).count()} ${at}`); }
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    ok('the upload dialog is still there with its files', await p.locator('.modal', { hasText: 'Add 1 source file' }).count() === 1 || await p.getByRole('button', { name: /^Add \d+ source file/ }).count() === 1);
    await p.getByRole('button', { name: /^Add \d+ source file/ }).click(); await p.waitForTimeout(1200);
    await p.getByRole('button', { name: /Raise my limit to/ }).click(); await p.waitForSelector('.reader-root', { timeout: 60000 }); await p.waitForTimeout(1500);
    ok('Raise my limit lets it in', await sources() === n0 + 1);
    ok('the limit was raised', await p.evaluate(() => JSON.parse(localStorage.getItem('lumen.space.v1')).limit) > 5 * 1048576);
    ok('no console errors (limit)', errs.filter(e => !/FileSystemHandle|sessionStorage/.test(e)).length === 0, errs.join(' | ')); await ctx.close();
  }

  /* 7d. the browser itself says no (quota exceeded): a plain message and the way to make room, not a silent failure */
  {
    const { p, errs, ctx } = await boot2({ quota: true });
    await addOne(p, 'space-small.pdf'); await p.waitForTimeout(2500);
    const q = await p.locator('.space-ask').innerText().catch(() => '');
    ok('quota exceeded: "no room left" dialog, notes are safe, Make room offered', /no room left to keep that file/.test(q) && /notes and cards are safe/.test(q) && /Make room/.test(q), q);
    await p.screenshot({ path: `${out}/space-quota.png` });
    const v = await axe(p, '.space-ask'); ok(`quota dialog axe (${v.join('; ') || 'clean'})`, v.length === 0);
    await p.getByRole('button', { name: 'Make room' }).click(); await p.waitForTimeout(900);
    ok('Make room from the message opens the storage dialog', await dlg(p).count() === 1);
    ok('no uncaught errors (quota)', errs.filter(e => !/FileSystemHandle|sessionStorage|quota/i.test(e)).length === 0, errs.join(' | ')); await ctx.close();
  }

  /* 7e. a folder on this device: choose it, mirror, move, back up into it, permission asked again after a restart, bring back */
  for (const [label, w, h, touch] of [['desktop', 1440, 900, false], ['phone', 390, 844, true]]) {
    const { p, errs, ctx } = await boot2({}, { w, h, touch });
    await addToReader(p, 'space-mid.pdf'); await openSpace(p);
    await p.locator('.sp-radio[data-id=folder]').click(); await p.waitForTimeout(300);
    ok(`${label}: folder choice explains itself before asking`, /Choose a folder, for example in Documents/.test(await dlg(p).innerText()));
    await p.screenshot({ path: `${out}/space-${label}-folder-choose.png` });
    await p.getByRole('button', { name: 'Choose a folder' }).click(); await p.waitForTimeout(1500);
    ok(`${label}: folder ready, named`, /Lumen test folder/.test(await live(p)) && /Folder: Lumen test folder/.test(await dlg(p).innerText()));
    await p.getByRole('button', { name: 'Copy all originals now' }).click(); await p.waitForTimeout(1500);
    let tr = await tree(p); ok(`${label}: original copied into Lumen/originals`, tr.some(x => /^Lumen\/originals\/space-mid \([0-9a-f]{8}\)\/space-mid\.pdf 12\d{5}/.test(x)), tr.join(' | '));
    await p.screenshot({ path: `${out}/space-${label}-folder.png` });
    await p.evaluate(() => document.getElementById('sp-sources').scrollIntoView());
    await row(p, 'space-mid').getByRole('button', { name: /Move .* to your folder/ }).click(); await p.waitForTimeout(2000);
    ok(`${label}: moved: shows In your folder, browser copy released`, /In your folder/.test(await row(p, 'space-mid').innerText()) && /0 KB/.test(await p.locator('.sp-legend li').first().innerText()), await p.locator('.sp-legend li').first().innerText());
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    await p.evaluate(() => { try { sessionStorage.setItem('perm', 'prompt'); } catch { } }); await p.addInitScript(() => { window.__perm = 'prompt'; });
    await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(2500); await p.evaluate(() => { location.hash = '#library'; }); await p.waitForTimeout(500);
    await p.getByRole('button', { name: /Read space-mid/ }).first().click(); await p.waitForTimeout(1500);
    const lk = await p.locator('.reader-load-error').innerText().catch(() => '');
    ok(`${label}: after a restart it asks to allow the folder, calmly`, /Allow Lumen to open your folder/.test(lk) && /Nothing has been lost/.test(lk), lk);
    await p.screenshot({ path: `${out}/space-${label}-locked.png` });
    await p.getByRole('button', { name: /Allow access to my folder/ }).click(); await p.waitForTimeout(3500);
    ok(`${label}: allowing opens the source from the folder`, await p.locator('.reader-load-error').count() === 0 && await p.locator('.reader-root canvas').count() > 0);
    await p.getByRole('button', { name: 'Back to library' }).click(); await p.waitForTimeout(600);
    await openSpace(p); await p.locator('.sp-radio[data-id=folder]').click().catch(() => { });
    await p.getByRole('button', { name: 'Back up now' }).first().click(); await p.waitForTimeout(2500);
    tr = await tree(p); ok(`${label}: backup saved into Lumen/backups in the folder`, tr.some(x => /^Lumen\/backups\/Lumen-workspace-.*\.json \d+/.test(x)), tr.join(' | '));
    await p.evaluate(() => document.getElementById('sp-sources').scrollIntoView());
    await row(p, 'space-mid').getByRole('button', { name: /Bring .* back/ }).click(); await p.waitForTimeout(2500);
    ok(`${label}: bring back into this browser`, /Original kept/.test(await row(p, 'space-mid').innerText()) && /Back in this browser/.test(await live(p)));
    const v = await axe(p, '.space-modal'); ok(`${label}: axe space dialog with a folder (${v.join('; ') || 'clean'})`, v.length === 0);
    ok(`no console errors (${label} folder)`, errs.filter(e => !/FileSystemHandle|sessionStorage/.test(e)).length === 0, errs.join(' | ')); await ctx.close();
  }

  /* 7f. graceful states: no folder support, no storage API, persistence denied, storage blocked (Session only) */
  {
    let { p, errs, ctx } = await boot2({ nofolder: true }); await openSpace(p);
    await p.locator('.sp-radio[data-id=folder]').click(); await p.waitForTimeout(300);
    const t = await dlg(p).innerText();
    ok('no folder support: says so, names Safari and Firefox, offers an exported backup file', /cannot open a folder for Lumen/.test(t) && /Safari and Firefox/.test(t) && /Export a backup file/.test(t));
    await p.screenshot({ path: `${out}/space-nofolder.png` });
    let v = await axe(p, '.space-modal'); ok(`no-folder axe (${v.join('; ') || 'clean'})`, v.length === 0); await ctx.close();
    ({ p, errs, ctx } = await boot2({ noapi: true })); await openSpace(p);
    const n = await dlg(p).innerText();
    ok('no storage API: still works, goes by your limit, protection says it cannot tell', /does not report how much room/.test(n) && /does not say whether your space is protected/.test(n) && await p.getByRole('button', { name: 'Ask the browser to protect it' }).count() === 0, n.slice(-900));
    v = await axe(p, '.space-modal'); ok(`no-API axe (${v.join('; ') || 'clean'})`, v.length === 0);
    ok('no console errors (no storage API)', errs.filter(e => !/FileSystemHandle|sessionStorage/.test(e)).length === 0, errs.join(' | ')); await ctx.close();
    ({ p, errs, ctx } = await boot2({ deny: true })); await openSpace(p);
    await p.getByRole('button', { name: 'Ask the browser to protect it' }).click(); await p.waitForTimeout(700);
    const dn = await dlg(p).innerText();
    ok('persistence denied: calm explanation, backup suggested, button still there', /did not agree this time/.test(await live(p)) && /not now/.test(dn) && /The browser may clear this/.test(dn) && await p.getByRole('button', { name: 'Ask the browser to protect it' }).count() === 1);
    await ctx.close();
    ({ p, errs, ctx } = await boot2({ nols: true }));
    ok('storage blocked: the pill says Session only', /Session only/.test(await pill(p).innerText()));
    await openSpace(p);
    ok('storage blocked: the Session only choice is the selected one and explained', await p.locator('.sp-radio[data-id=session]').getAttribute('aria-checked') === 'true' && /lives in this tab only/.test(await dlg(p).innerText()));
    await p.screenshot({ path: `${out}/space-session.png` });
    v = await axe(p, '.space-modal'); ok(`session-only axe (${v.join('; ') || 'clean'})`, v.length === 0); await ctx.close();
  }

  /* 7g. reachable from Settings; keyboard; dark; phone screenshots */
  {
    const { p, errs, ctx } = await boot2({ usageMB: 80 }, { dark: true });
    await addToReader(p, 'space-mid.pdf');
    await p.getByRole('button', { name: /^Settings$/ }).first().click(); await p.waitForTimeout(500);
    await p.getByRole('button', { name: /Workspace storage and space limit/ }).click(); await p.waitForTimeout(900);
    ok('Settings links to Workspace storage', await dlg(p).count() === 1 && /Your learning space/.test(await dlg(p).innerText()));
    await p.locator('.sp-radio[data-id=browser]').focus(); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(200);
    ok('arrow keys move through the where-choices', await p.locator('.sp-radio[data-id=folder]').getAttribute('aria-checked') === 'true');
    await p.locator('.sp-radio[data-id=browser]').click();
    await p.screenshot({ path: `${out}/space-desktop-dark.png` });
    const v = await axe(p, '.space-modal'); ok(`dark: axe space dialog (${v.join('; ') || 'clean'})`, v.length === 0, v.join('; '));
    await p.evaluate(() => document.getElementById('sp-where').scrollIntoView()); await p.screenshot({ path: `${out}/space-desktop-dark-where.png` });
    ok('no console errors (settings, dark)', errs.filter(e => !/FileSystemHandle|sessionStorage/.test(e)).length === 0, errs.join(' | ')); await ctx.close();
    const m = await boot2({ usageMB: 80 }, { w: 390, h: 844, touch: true, dark: true });
    await addToReader(m.p, 'space-mid.pdf'); await openSpace(m.p);
    await m.p.screenshot({ path: `${out}/space-phone-dark.png` });
    for (const id of ['sp-sources', 'sp-where', 'sp-limit']) { await m.p.evaluate(id => document.getElementById(id).scrollIntoView(), id); await m.p.waitForTimeout(150); await m.p.screenshot({ path: `${out}/space-phone-dark-${id}.png` }); }
    const v2 = await axe(m.p, '.space-modal'); ok(`phone dark: axe space dialog (${v2.join('; ') || 'clean'})`, v2.length === 0, v2.join('; '));
    const s = await small(m.p, '.space-modal button, .space-modal input:not(.sp-hidden-input), .space-modal select, .space-modal label.button'); ok('phone dark: controls ≥44px', s.length === 0, JSON.stringify(s));
    await m.ctx.close();
  }
}
await browser.close();
const bad = rows.filter(r => !r.pass); console.log(`\n${rows.length - bad.length}/${rows.length} checks passed`); if (bad.length) { console.log('FAILED:\n' + bad.map(b => ' - ' + b.name).join('\n')); process.exit(1); }
