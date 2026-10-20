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
async function session({ w = 1440, h = 900, dark = false, touch = false, rail = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', colorScheme: dark ? 'dark' : 'light', hasTouch: touch, isMobile: touch, deviceScaleFactor: touch ? 2 : 1 });
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
await browser.close();
const bad = rows.filter(r => !r.pass); console.log(`\n${rows.length - bad.length}/${rows.length} checks passed`); if (bad.length) { console.log('FAILED:\n' + bad.map(b => ' - ' + b.name).join('\n')); process.exit(1); }
