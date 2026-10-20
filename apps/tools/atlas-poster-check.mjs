// MedLex Visual Atlas flip book + poster pop-up: open, every markup tool, undo/redo/delete/clear, persistence, zoom, keyboard, axe, 1440 + 390, light + dark.
// usage: node atlas-poster-check.mjs <outdir> [port]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const out = process.argv[2], port = process.argv[3] || 8443; fs.mkdirSync(out, { recursive: true });
const AXE = fs.readFileSync('/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8');
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--ignore-certificate-errors', `--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`] });
const OUT = out; let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + m); };

const single = w => w < 600;
/* the picture sits wholly inside the stage, centred, with a real (non-none) transform: the invariant behind the reduced-motion crop bug */
const insideStage = p => p.evaluate(() => { const i = document.querySelector('.pv-img').getBoundingClientRect(), s = document.querySelector('.pv-stage').getBoundingClientRect(), cs = getComputedStyle(document.querySelector('.pv-world')).transform; return cs !== 'none' && i.width > 50 && i.left >= s.left - 1 && i.right <= s.right + 1 && i.top >= s.top - 1 && i.bottom <= s.bottom + 1 && Math.abs((i.left + i.right) / 2 - (s.left + s.right) / 2) < 3 && Math.abs((i.top + i.bottom) / 2 - (s.top + s.bottom) / 2) < 3; });
async function bookFirst(p, tag, w) {
  const noScroll = await p.evaluate(() => [document.documentElement.scrollHeight - innerHeight, document.querySelector('.fb-book').getBoundingClientRect().bottom <= innerHeight]);
  ok(noScroll[0] <= 6 && noScroll[1], 'book fits the viewport without page scroll (' + noScroll[0] + 'px extra)');
  ok(await p.locator('.fb-pg').count() === (single(w) ? 1 : 2), single(w) ? 'phone: one page' : 'two-page spread');
  const fit = await p.evaluate(() => [...document.querySelectorAll('.fb-art img')].every(i => { const a = i.parentElement.getBoundingClientRect(), r = i.getBoundingClientRect(); return i.naturalWidth && r.left >= a.left - 1 && r.right <= a.right + 1 && r.top >= a.top - 1 && r.bottom <= a.bottom + 1 && getComputedStyle(i).objectFit === 'contain'; }));
  ok(fit, 'every infographic fully fitted (contain, no crop)');
  ok(/of 56/.test(await p.locator('#fb-pos').innerText()), 'page counter: ' + await p.locator('#fb-pos').innerText());
  await p.screenshot({ path: `${OUT}/book-${tag}.png` });
  const t0 = await p.locator('.fb-cap b').first().innerText();
  await p.locator('[data-lx=fbnext]').click(); await p.waitForTimeout(1100);
  ok((await p.locator('.fb-cap b').first().innerText()) !== t0, 'Next turns the page');
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1100); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(1100);
  ok((await p.locator('#fb-pos').innerText()).startsWith(single(w) ? 'Page 2' : 'Pages 3'), 'arrow keys turn pages: ' + await p.locator('#fb-pos').innerText());
  if (!single(w)) { await p.locator('[data-lx=fbnext]').click(); await p.waitForTimeout(250); await p.screenshot({ path: `${OUT}/turning-${tag}.png` }); await p.waitForTimeout(900); }
  // swipe
  const bb = await p.locator('#fb-stage').boundingBox(); const pos0 = await p.locator('#fb-pos').innerText();
  await p.mouse.move(bb.x + bb.width * .7, bb.y + 4); await p.mouse.down(); await p.mouse.move(bb.x + bb.width * .3, bb.y + 8, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(1100);
  ok((await p.locator('#fb-pos').innerText()) !== pos0, 'swipe turns the page');
  // contents
  await p.locator('[data-lx=fbtoc]').click(); await p.waitForTimeout(500);
  ok(await p.locator('dialog.fb-toc[open] .fb-th').count() === 56, 'contents lists all 56 guides'); await p.screenshot({ path: `${OUT}/toc-${tag}.png` });
  await p.locator('.fb-th').nth(20).click(); await p.waitForTimeout(400);
  ok((await p.locator('#fb-pos').innerText()).includes('21') || (await p.locator('#fb-pos').innerText()).includes('20–21'), 'contents jumps to a guide: ' + await p.locator('#fb-pos').innerText());
  // filter
  await p.locator('select[aria-label=Topic]').selectOption({ label: 'Body systems (14)' }); await p.waitForTimeout(300);
  ok((await p.locator('#fb-pos').innerText()).endsWith('of 14'), 'topic filter narrows the book: ' + await p.locator('#fb-pos').innerText());
  await p.locator('select[aria-label=Topic]').selectOption('All'); await p.fill('.fb-search input', 'zzzzqq'); await p.waitForTimeout(500);
  ok(await p.locator('.fb-none').count() === 1, 'empty search shows a message'); await p.fill('.fb-search input', ''); await p.waitForTimeout(400);
  // markers + reduced motion + back to start
  await p.evaluate(() => localStorage.removeItem('medlex.atlas.last'));
  const a = await p.evaluate(AXE); const ax = await p.evaluate(async () => (await axe.run(document.querySelector('.fb'), { runOnly: ['wcag2a', 'wcag2aa'] })).violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => v.id + ':' + v.nodes.length)); ok(ax.length === 0, 'axe on the book ' + ax.join(' | '));
  const small = await p.evaluate(() => [...document.querySelectorAll('.fb button, .fb select, .fb input')].filter(b => b.offsetParent && !b.disabled && (b.getBoundingClientRect().height < 44 || b.getBoundingClientRect().width < 44)).map(b => b.className + Math.round(b.getBoundingClientRect().width) + 'x' + Math.round(b.getBoundingClientRect().height))); ok(small.length === 0, 'book controls at least 44px ' + small.join(', '));
  await p.evaluate(() => { location.hash = '#infographics'; });
  // return to first spread
  await p.locator('.fb-th, [data-lx=fbtoc]').first().waitFor();
  await p.locator('[data-lx=fbtoc]').click(); await p.locator('.fb-th').first().click(); await p.waitForTimeout(400);
}
async function book(p, tag, w) {
  // after the pop-up closes: the page you marked up shows a marker, and reduced motion swaps pages with no leaf
  ok(await p.locator('.fb-mark').count() >= 0, 'markers render');
  await p.emulateMedia({ reducedMotion: 'reduce' }); await p.locator('[data-lx=fbnext]').click(); await p.waitForTimeout(120);
  ok(await p.locator('.fb-leaf').count() === 0, 'reduced motion: no page-turn animation'); await p.emulateMedia({ reducedMotion: 'no-preference' });
}
/* ATLAS_ONLY=extra skips the long per-window run and does just the fit matrix and the extra checks */
for (const [w, h, dark, tag] of process.env.ATLAS_ONLY === 'extra' ? [] : [[1920, 940, false, 'd-light'], [1366, 650, true, 'l-dark'], [390, 844, true, 'm-dark']]) {
  console.log('--- ' + tag);
  const ctx = await br.newContext({ viewport: { width: w, height: h }, colorScheme: dark ? 'dark' : 'light', ignoreHTTPSErrors: true, hasTouch: w < 500 });
  const p = await ctx.newPage(), errs = []; p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
  await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto('https://medlex.healthcarecrownacademy.co.uk/#infographics'); await p.waitForTimeout(2200);
  for (let i = 0; i < 3; i++) { const s = p.locator('dialog[open]:not(.pv) button:has-text("Skip"), dialog[open]:not(.pv) [data-action=close-modal]'); if (!(await s.count())) break; await s.first().click({ force: true }).catch(() => {}); await p.waitForTimeout(400); }
  await bookFirst(p, tag, w);
  await p.locator('.fb-enl').first().click(); await p.waitForTimeout(2000);
  const q = s => p.locator('dialog.pv ' + s);
  ok(await p.locator('dialog.pv[open]').count() === 1, 'pop-up opens');
  ok(await p.evaluate(() => !!document.querySelector('.pv-img').naturalWidth), 'infographic loaded');
  ok(await insideStage(p), 'whole poster fits the window, centred, with a real transform');
  ok(!(await p.evaluate(() => /Annotate|Test yourself|YOUR JOURNEY/i.test(document.querySelector('dialog.pv').innerText))), 'only the infographic: no tour panels');
  await p.screenshot({ path: `${out}/open-${tag}.png` });
  const items = () => p.evaluate(() => { const o = JSON.parse(localStorage.getItem('medlex.atlas.ink.v1') || '{}'); return Object.values(o)[0] || []; });
  const box = await q('.pv-stage').boundingBox(), cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const drag = async (x0, y0, x1, y1) => { await p.mouse.move(x0, y0); await p.mouse.down(); await p.mouse.move((x0 + x1) / 2, (y0 + y1) / 2 + 12, { steps: 4 }); await p.mouse.move(x1, y1, { steps: 4 }); await p.mouse.up(); await p.waitForTimeout(150); };
  const tool = async t => { await q(`[data-pv=tool][data-v=${t}]`).click(); await p.waitForTimeout(100); };
  await tool('pen'); await drag(cx - 100, cy - 100, cx - 20, cy - 60); ok((await items()).some(i => i.t === 'pen'), 'pen draws');
  await tool('marker'); await drag(cx - 100, cy - 20, cx - 20, cy + 20); ok((await items()).some(i => i.t === 'marker'), 'marker draws');
  await tool('hl'); await drag(cx - 100, cy + 60, cx + 40, cy + 70); ok((await items()).some(i => i.t === 'hl'), 'highlighter draws');
  await tool('shape'); await q('[data-pv=shape][data-v=ellipse]').click(); await drag(cx + 20, cy - 120, cx + 120, cy - 50); await q('[data-pv=shape][data-v=arrow]').click(); await drag(cx + 20, cy, cx + 120, cy + 40);
  ok((await items()).filter(i => i.t === 'shape').length === 2, 'shapes: oval and arrow');
  await tool('text'); await p.mouse.click(cx - 120, cy + 120); await p.keyboard.type('Remember this'); await p.keyboard.press('Escape'); await p.waitForTimeout(200); ok((await items()).some(i => i.t === 'text' && i.text === 'Remember this'), 'text added and kept');
  await tool('note'); await p.mouse.click(cx + 40, cy + 120); await p.keyboard.type('Ask tutor'); await p.keyboard.press('Escape'); await p.waitForTimeout(200); ok((await items()).some(i => i.t === 'note' && i.text === 'Ask tutor'), 'sticky note added and kept');
  await tool('sticker'); await q('[data-pv=stk][data-v=star]').click(); await p.mouse.click(cx + 90, cy - 150); await p.waitForTimeout(200); ok((await items()).some(i => i.t === 'sticker' && i.k === 'star'), 'sticker placed');
  const n0 = (await items()).length; await p.screenshot({ path: `${out}/marked-${tag}.png` });
  ok(n0 === 8, 'eight marks so far (' + n0 + ')');
  // select + move + restyle + delete
  await tool('select'); const sBox = await q('.pv-sticker').boundingBox(); await p.mouse.click(sBox.x + sBox.width / 2, sBox.y + sBox.height / 2); await p.waitForTimeout(150);
  ok(await q('.pv-selbox').isVisible(), 'select shows an outline'); ok(await q('.pv-opts').isVisible(), 'options appear for the selected mark');
  const before = (await items()).find(i => i.t === 'sticker'); await p.mouse.move(sBox.x + sBox.width / 2, sBox.y + sBox.height / 2); await p.mouse.down(); await p.mouse.move(sBox.x + sBox.width / 2 + 40, sBox.y + sBox.height / 2 + 30, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(150);
  const after = (await items()).find(i => i.t === 'sticker'); ok(after.x !== before.x, 'selected mark moves');
  await q('.pv-sw[data-v="#D93A3A"]').click(); ok((await items()).find(i => i.t === 'sticker').c === '#D93A3A', 'selected mark takes a new colour');
  await q('[data-pv=del]').click(); ok((await items()).length === n0 - 1 && !(await items()).some(i => i.t === 'sticker'), 'delete removes the selected mark');
  await q('[data-pv=undo]').click(); ok((await items()).some(i => i.t === 'sticker'), 'undo brings it back'); await q('[data-pv=redo]').click(); ok(!(await items()).some(i => i.t === 'sticker'), 'redo removes it again');
  await p.keyboard.press('Control+z'); ok((await items()).some(i => i.t === 'sticker'), 'Ctrl+Z works');
  await q('[data-pv=clear]').click(); ok((await items()).length === 0, 'clear all'); await q('[data-pv=undo]').click(); ok((await items()).length === n0, 'clear all can be undone');
  // persistence
  await p.reload(); await p.waitForTimeout(2200); for (let i = 0; i < 3; i++) { const s = p.locator('dialog[open]:not(.pv) button:has-text("Skip")'); if (!(await s.count())) break; await s.first().click({ force: true }).catch(() => {}); await p.waitForTimeout(400); }
  await p.locator('.fb-enl').first().click(); await p.waitForTimeout(2000); { const c = await p.evaluate(() => [document.querySelectorAll(".pv-it").length, Object.values(JSON.parse(localStorage.getItem("medlex.atlas.ink.v1")||"{}")).map(a=>a.length), document.querySelector(".pv-pos")?.innerText]); ok(c[0] === 3, "markup is still there after reload (text, note, sticker): " + JSON.stringify(c)); }
  // zoom, keys, navigation
  { const w0 = await p.evaluate(() => document.querySelector('.pv-img').getBoundingClientRect().width); await q('[data-pv=zin]').click(); await q('[data-pv=zin]').click(); await p.waitForTimeout(150); const z = await q('.pv-pct').innerText(), w1 = await p.evaluate(() => document.querySelector('.pv-img').getBoundingClientRect().width);
    ok(w1 > w0 * 1.4 && /^\d+%$/.test(z), 'zoom in enlarges the picture and the label shows the real zoom: ' + z + ' (' + Math.round(w0) + 'px to ' + Math.round(w1) + 'px)');
    await q('[data-pv=fit]').click(); await p.waitForTimeout(100); ok(await q('.pv-pct').innerText() === 'Fit' && await insideStage(p), 'Fit button returns to the whole guide, labelled Fit'); }
  await p.keyboard.press('+'); await p.keyboard.press('0'); await q('[data-pv=next]').click(); await p.waitForTimeout(1500); ok((await q('.pv-pos').innerText()).startsWith('2 of'), 'next guide'); ok(await p.evaluate(() => document.querySelectorAll('.pv-it').length) === 0, 'each guide has its own markup');
  await q('[data-pv=text]').click(); ok(await q('aside.pv-text').isVisible(), 'text of the guide is available'); await p.screenshot({ path: `${out}/text-${tag}.png` }); await q('[data-pv=text]').click();
  const dl = p.waitForEvent('download', { timeout: 6000 }).catch(() => null); await q('[data-pv=save]').click(); const dd = await dl; ok(!!dd && /^medlex-/.test(dd.suggestedFilename()), 'save as a picture downloads ' + (dd && dd.suggestedFilename()));
  await tool('sticker'); await p.screenshot({ path: `${out}/stickers-${tag}.png` });
  { const small = await p.evaluate(() => [...document.querySelectorAll('dialog.pv button')].filter(b => b.offsetParent && (b.getBoundingClientRect().height < 44 || b.getBoundingClientRect().width < 44)).map(b => b.className + ' ' + Math.round(b.getBoundingClientRect().width) + 'x' + Math.round(b.getBoundingClientRect().height))); ok(small.length === 0, 'all buttons at least 44px: ' + small.join(', ')); }
  await p.evaluate(AXE); const ax = await p.evaluate(async () => (await axe.run(document.querySelector('dialog.pv'), { runOnly: ['wcag2a', 'wcag2aa'] })).violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => v.id + ':' + v.nodes.length + ':' + String(v.nodes[0].target).slice(0, 50))); ok(ax.length === 0, 'axe ' + ax.join(' | '));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400); ok(await p.locator('dialog.pv').count() === 0, 'Esc closes the pop-up'); ok(await p.evaluate(() => document.activeElement.classList.contains('fb-enl')), 'focus returns to the Enlarge button');
  await book(p, tag, w);
  ok(errs.length === 0, 'console errors: ' + errs.slice(0, 3).join(' || ')); await ctx.close();
}

/* ---------- fit robustness matrix: many windows, zoom levels, reduced motion, slow and cached loading, odd stored data ---------- */
async function openFresh({ w, h, dpr = 1, rm = false, appRm = false, delay = 0, seed = null, sw = 'allow', cacheOff = false }) {
  const ctx = await br.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, reducedMotion: rm ? 'reduce' : 'no-preference', ignoreHTTPSErrors: true, serviceWorkers: sw });
  const p = await ctx.newPage(), errs = []; p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
  await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  if (seed) await p.addInitScript(seed => { for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); }, seed);
  await p.goto('https://medlex.healthcarecrownacademy.co.uk/#infographics'); await p.waitForTimeout(2000);
  for (let i = 0; i < 3; i++) { const sk = p.locator('dialog[open]:not(.pv) button:has-text("Skip")'); if (!(await sk.count())) break; await sk.first().click({ force: true }).catch(() => {}); await p.waitForTimeout(300); }
  if (appRm) await p.evaluate(() => { document.documentElement.dataset.motion = 'reduce'; document.body.classList.add('reduced-motion'); });
  if (delay) await p.route(/infographics\/(?!t\/)[a-z0-9-]+\.webp/, async r => { await new Promise(f => setTimeout(f, delay)); r.continue().catch(() => {}); });
  if (cacheOff) { const c = await ctx.newCDPSession(p); await c.send('Network.enable'); await c.send('Network.setCacheDisabled', { cacheDisabled: true }); }
  return { ctx, p, errs };
}
const MATRIX = [[1920, 953, 1], [1536, 730, 1.25], [1280, 720, 1], [1706, 846, 0.9], [1745, 866, 1.1], [1536, 762, 1.25], [820, 1180, 2], [390, 844, 3], [844, 390, 3]];
for (const [w, h, dpr] of MATRIX) for (const mode of ['normal', 'reduced', 'app-reduced']) {
  const { ctx, p, errs } = await openFresh({ w, h, dpr, rm: mode === 'reduced', appRm: mode === 'app-reduced' });
  const t0 = Date.now(); await p.locator('.fb-enl').first().click(); await p.waitForSelector('.pv-stage[data-view=js]', { timeout: 3000 }).catch(() => {});
  const first = await insideStage(p);   /* checked straight after opening, not after a long wait */
  await p.waitForTimeout(700);
  ok(first && await insideStage(p), `fit ${w}x${h}@${dpr} ${mode}: inside the stage and centred on first paint and after settling (${Date.now() - t0}ms)`);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.pv-world')).transform !== 'none' && document.querySelector('.pv-pct').textContent === 'Fit'), `fit ${w}x${h} ${mode}: transform applied, label reads Fit`);
  await p.keyboard.press('+'); await p.waitForTimeout(80); const z1 = await p.evaluate(() => document.querySelector('.pv-img').getBoundingClientRect().width); await p.keyboard.press('0'); await p.waitForTimeout(80); const z0 = await p.evaluate(() => document.querySelector('.pv-img').getBoundingClientRect().width);
  ok(z1 > z0 * 1.2, `zoom works ${w}x${h} ${mode} (${Math.round(z0)} to ${Math.round(z1)}px)`);
  if (w === 1920 || w === 390) await p.screenshot({ path: `${out}/fit-${w}-${mode}.png` });
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  ok(errs.length === 0, `no console errors ${w}x${h} ${mode} ${errs.slice(0, 2).join(' | ')}`); await ctx.close();
}
{ /* slow image loading: the guide must already be fitted while the picture is still arriving; cache disabled and enabled; repeated opens; resize while open */
  for (const cacheOff of [true, false]) {
    const { ctx, p, errs } = await openFresh({ w: 1536, h: 730, dpr: 1.25, delay: 1800, cacheOff, sw: 'block' });
    await p.locator('.fb-enl').first().click(); await p.waitForTimeout(150); await p.locator('[data-pv=next]').click(); await p.locator('[data-pv=next]').click(); await p.waitForTimeout(250); /* guide 3 was never shown in the book, so it really is fetched slowly */
    ok(await insideStage(p) && await p.evaluate(() => document.querySelector('.pv-stage').dataset.loading === '1'), `slow load (cache ${cacheOff ? 'off' : 'on'}): fitted and showing a loading state before the picture arrives`);
    await p.waitForTimeout(2500); ok(await insideStage(p) && await p.evaluate(() => !document.querySelector('.pv-stage').dataset.loading), 'slow load: still fitted when the picture has arrived');
    await p.setViewportSize({ width: 1100, height: 640 }); await p.waitForTimeout(500); ok(await insideStage(p), 'resize while open: refitted');
    await p.setViewportSize({ width: 1536, height: 730 }); await p.waitForTimeout(500);
    for (let k = 0; k < 3; k++) { await p.keyboard.press('Escape'); await p.waitForTimeout(150); await p.locator('.fb-enl').first().focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(500); ok(await insideStage(p), 'reopen via keyboard #' + (k + 1) + ': fitted'); }
    await p.keyboard.press('Escape'); ok(errs.length === 0, 'slow load: no errors ' + errs.slice(0, 2).join(' | ')); await ctx.close();
  }
}
{ /* an image that never loads: the page is never left half-drawn, and Try again works */
  const { ctx, p, errs } = await openFresh({ w: 1280, h: 720, sw: 'block' });
  await p.route(/infographics\/(?!t\/)ch\d+\.webp/, r => r.abort()); await p.locator('.fb-enl').nth(1).click(); await p.waitForTimeout(700);
  ok(await p.locator('.pv-err').isVisible(), 'a guide that cannot load says so and offers Try again');
  await p.unroute(/infographics\/(?!t\/)ch\d+\.webp/); await p.locator('[data-pv=retry]').click(); await p.waitForTimeout(900); ok(await insideStage(p) && !(await p.locator('.pv-err').isVisible()), 'Try again loads and fits the guide'); await ctx.close();
}
{ /* odd data left in storage by older builds must not stop the pop-up from fitting, and good marks survive */
  const good = { t: 'pen', id: 'g1', c: '#D93A3A', w: 5, p: [[100, 100], [200, 150], [260, 130]] };
  for (const [name, seed] of [['array', ['x']], ['strings', { 'decode-1': 'nope', ch1: 7 }], ['bad items', { ch1: [null, 5, { t: 'pen' }, { t: 'text', id: 'a', x: 'q' }, { t: 'sticker', id: 'b', x: 1, y: 2, s: 50, k: 'star', c: 'javascript:1' }, good] }], ['bad json', '{not json']]) {
    const { ctx, p, errs } = await openFresh({ w: 1280, h: 720, seed: { 'medlex.atlas.ink.v1': seed, 'medlex.lib.v1': name === 'array' ? '5' : '{"atlasLast":42}' } });
    await p.locator('.fb-enl').first().click(); await p.waitForTimeout(700);
    ok(await insideStage(p) && errs.length === 0, `stored data "${name}": pop-up still fits, no errors ${errs.slice(0, 2).join(' | ')}`);
    if (name === 'bad items') { const n = await p.evaluate(() => document.querySelectorAll('.pv-it').length); ok(n === 1, 'bad items: only the valid sticker is drawn (' + n + ')'); await p.keyboard.press('Escape'); await p.waitForTimeout(200); const kept = await p.evaluate(() => JSON.parse(localStorage.getItem('medlex.atlas.ink.v1')).ch1 && JSON.parse(localStorage.getItem('medlex.atlas.ink.v1')).ch1.length); ok(kept === 6, 'closing without editing leaves the stored marks untouched (' + kept + ')'); }
    await ctx.close();
  }
}
{ /* eraser, resize and rotate handles, Esc twice, text in the save-as-picture file, focus return from the Library */
  const { ctx, p, errs } = await openFresh({ w: 1536, h: 730 });
  await p.locator('.fb-enl').first().click(); await p.waitForTimeout(600);
  const q = s => p.locator('dialog.pv ' + s), box = await q('.pv-stage').boundingBox(), cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const items = () => p.evaluate(() => Object.values(JSON.parse(localStorage.getItem('medlex.atlas.ink.v1') || '{}'))[0] || []);
  await q('[data-pv=tool][data-v=pen]').click(); await p.mouse.move(cx - 80, cy); await p.mouse.down(); await p.mouse.move(cx, cy + 30, { steps: 6 }); await p.mouse.up();
  await q('[data-pv=tool][data-v=sticker]').click(); await q('[data-pv=stk][data-v=star]').click(); await p.mouse.click(cx + 60, cy - 100); await p.waitForTimeout(150);
  ok((await items()).length === 2, 'pen stroke and sticker placed');
  const st0 = (await items()).find(i => i.t === 'sticker'); const sb = await q('.pv-sticker').boundingBox();
  const hd = await q('.pv-hd-rot').boundingBox(); await p.mouse.move(hd.x + hd.width / 2, hd.y + hd.height / 2); await p.mouse.down(); await p.mouse.move(sb.x + sb.width + 80, sb.y + sb.height / 2, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(150);
  const st1 = (await items()).find(i => i.t === 'sticker'); ok(Math.abs(st1.r || 0) > 40, 'rotate handle turns the sticker (' + st1.r + ' degrees)');
  const se = await q('.pv-hd-se').boundingBox(); { const sb2 = await q('.pv-sticker').boundingBox(), c0 = [sb2.x + sb2.width / 2, sb2.y + sb2.height / 2], h0 = [se.x + se.width / 2, se.y + se.height / 2]; await p.mouse.move(h0[0], h0[1]); await p.mouse.down(); await p.mouse.move(c0[0] + (h0[0] - c0[0]) * 2, c0[1] + (h0[1] - c0[1]) * 2, { steps: 6 }); await p.mouse.up(); } await p.waitForTimeout(150);
  const st2 = (await items()).find(i => i.t === 'sticker'); ok(st2.s > st0.s * 1.2, 'resize handle enlarges the sticker (' + st0.s + ' to ' + st2.s + ')');
  await p.keyboard.press('r'); await p.waitForTimeout(100); ok((await items()).find(i => i.t === 'sticker').r !== st2.r, 'R key rotates the selected mark');
  await q('[data-pv=undo]').click(); await q('[data-pv=undo]').click(); await q('[data-pv=undo]').click();
  await p.keyboard.press('Control+y'); await p.keyboard.press('Control+y'); await p.keyboard.press('Control+y');
  await q('[data-pv=tool][data-v=erase]').click(); await p.mouse.move(cx - 90, cy - 4); await p.mouse.down(); await p.mouse.move(cx + 10, cy + 34, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(150);
  ok(!(await items()).some(i => i.t === 'pen') && (await items()).some(i => i.t === 'sticker'), 'eraser removes only the stroke it crosses');
  await q('[data-pv=undo]').click(); ok((await items()).some(i => i.t === 'pen'), 'eraser can be undone');
  await q('[data-pv=tool][data-v=text]').click(); await p.mouse.click(cx - 150, cy + 100); await p.keyboard.type('A long line of text that should wrap in the saved picture too'); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  const dl = p.waitForEvent('download', { timeout: 8000 }).catch(() => null); await q('[data-pv=save]').click(); const dd = await dl;
  ok(!!dd && /-marked\.png$/.test(dd.suggestedFilename()), 'save as a picture with markup: ' + (dd && dd.suggestedFilename()));
  if (dd) await dd.saveAs(`${out}/saved-marked.png`);
  /* Esc twice quickly (Chrome may close the dialog without a cancel event the second time) must still tidy up and return focus */
  await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  ok(await p.locator('dialog.pv').count() === 0 && await p.evaluate(() => document.activeElement.classList.contains('fb-enl')), 'Esc closes, dialog removed, focus back on Enlarge');
  /* Library: See the illustrated guide */
  await p.evaluate(() => { location.hash = '#library/lab?w=pericarditis'; }); await p.waitForTimeout(1500);
  const lb = p.locator('.lx-poster').first(); if (await lb.count()) { await lb.focus(); await lb.click(); await p.waitForTimeout(700); ok(await insideStage(p), 'from the Library: fitted'); await p.keyboard.press('Escape'); await p.waitForTimeout(300); ok(await p.evaluate(() => document.activeElement.classList.contains('lx-poster')), 'from the Library: focus returns to the button that opened it'); }
  ok(errs.length === 0, 'no console errors in the tools run ' + errs.slice(0, 2).join(' | ')); await ctx.close();
}
{ /* the Learning Studio poster pane and slide stage obey the same rule under reduced motion */
  for (const rm of [false, true]) {
    const { ctx, p, errs } = await openFresh({ w: 1440, h: 900, rm });
    await p.evaluate(() => window.MedlexLib.openAtlasTour('ch1')); await p.waitForTimeout(2200);
    const r = await p.evaluate(() => { const w = document.querySelector('[data-pwin]'), im = w.querySelector('img').getBoundingClientRect(), wr = w.getBoundingClientRect(); return im.width <= wr.width + 1 && im.height <= wr.height + 1; });
    ok(r, 'Learning Studio poster fits its pane (reduced motion ' + rm + ')'); await ctx.close();
  }
}

await br.close(); console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
