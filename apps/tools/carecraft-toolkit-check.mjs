// Browser check of the Carecraft Toolkit against the local preview (node apps/tools/serve-site.mjs 8447).
// usage: node apps/tools/carecraft-toolkit-check.mjs [out-dir] [--port 8447]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const a = process.argv.slice(2), out = a[0] && !a[0].startsWith('--') ? a[0] : '/tmp/toolkit-check', pi = a.indexOf('--port'), port = pi < 0 ? 8447 : a[pi + 1];
const AXE = fs.readFileSync(process.env.AXE || '/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8');
fs.mkdirSync(out, { recursive: true });
const rows = []; const ok = (name, cond, detail = '') => { rows.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, String(detail).slice(0, 400)); };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] });
async function session({ w = 1440, h = 900, dark = false, reduced = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', colorScheme: dark ? 'dark' : 'light', reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: w < 500, isMobile: w < 500, permissions: ['clipboard-read', 'clipboard-write'] });
  const p = await ctx.newPage(), errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('https://carecraft.healthcarecrownacademy.co.uk/#/tools', { waitUntil: 'load' }); await p.waitForTimeout(1200);
  for (let i = 0; i < 4; i++) { const hit = await p.evaluate(() => { const b = [...document.querySelectorAll('dialog[open] button')].find(x => /^(ski|close|maybe|not now|later|got it|explore|start)/i.test(x.textContent.trim())); if (b) { b.click(); return true; } return false; }); if (!hit) break; await p.waitForTimeout(300); }
  return { ctx, p, errs };
}
const axe = async (p, scope) => { await p.evaluate(src => { if (!window.axe) (0, eval)(src); }, AXE); return p.evaluate(async scope => (await axe.run(document.querySelector(scope), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'], rules: { region: { enabled: false } } })).violations.map(v => `${v.id}: ${v.nodes.length} (${v.nodes[0].target.join(' ')})`), scope); };
const small = (p, scope) => p.evaluate(scope => [...document.querySelectorAll(scope + ' button, ' + scope + ' a[href], ' + scope + ' input:not([type=hidden]), ' + scope + ' select, ' + scope + ' summary')].filter(e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; const lab = e.closest('label'); const rr = lab && (e.type === 'checkbox' || e.type === 'radio') ? lab.getBoundingClientRect() : r; return rr.height < 43.5 || rr.width < 43.5; }).map(e => (e.className || e.tagName) + ':' + (e.textContent || '').trim().slice(0, 20)).slice(0, 6), scope);
const overflow = (p, scope) => p.evaluate(scope => { const s = document.querySelector(scope); const r = s.getBoundingClientRect(); const bad = [...s.querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.width && !e.closest('svg') && !e.closest('.tk-offscreen') && (b.right > r.right + 2 || b.left < r.left - 2); }).length; return { bad, docX: document.documentElement.scrollWidth > innerWidth + 1, sx: s.scrollWidth > s.clientWidth + 1 }; }, scope);
const IDS = await (async () => { const { ctx, p } = await session(); const ids = await p.evaluate(() => TOOLS.map(t => t[0])); await ctx.close(); return ids; })();
ok('18 tools registered', IDS.length === 18, IDS.length);

for (const [label, opts] of [['desktop-light', { w: 1440, h: 900 }], ['desktop-dark', { w: 1440, h: 900, dark: true }], ['mobile-light', { w: 390, h: 844 }], ['mobile-dark', { w: 390, h: 844, dark: true }]]) {
  const { ctx, p, errs } = await session(opts); const mobile = opts.w < 500;
  /* hub */
  let bad = await axe(p, '#main'); ok(`${label} hub axe`, !bad.length, bad.join(' | '));
  ok(`${label} hub touch targets`, !(await small(p, '#main')).length, (await small(p, '#main')).join(','));
  const ov = await overflow(p, '#main'); ok(`${label} hub no overflow`, !ov.bad && !ov.docX, JSON.stringify(ov));
  await p.screenshot({ path: `${out}/hub-${label}.png`, fullPage: true });
  await p.fill('#tkSearch', 'speak'); await p.waitForTimeout(150);
  ok(`${label} search filters`, (await p.locator('.tk-card').count()) >= 1 && (await p.locator('.tk-card').count()) < 6);
  await p.fill('#tkSearch', 'zzzz'); await p.waitForTimeout(100); ok(`${label} empty state`, await p.locator('.tk-empty').count() === 1);
  await p.click('[data-tk="clearfilters"]'); await p.click('[data-tk="group"][data-v="reflect"]'); ok(`${label} group filter`, await p.locator('.tk-card').count() === 2);
  await p.click('[data-tk="group"][data-v="all"]');
  await p.click('.tk-card[data-tool="risk"] [data-tk="fav"]'); await p.click('[data-tk="favonly"]'); ok(`${label} favourites filter`, await p.locator('.tk-card').count() === 1);
  await p.click('[data-tk="favonly"]');
  /* every tool */
  for (const id of IDS) {
    await p.evaluate(id => openTool(id), id); await p.waitForTimeout(250);
    const legacy = ['pause', 'movement'].includes(id);
    ok(`${label} ${id} opens`, await p.evaluate(() => !!document.querySelector('#modal[open],#studioWorkbench')));
    const fits = await p.evaluate(() => { const m = document.querySelector('#modal[open]'); if (!m) return true; const r = m.getBoundingClientRect(); return r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1; });
    ok(`${label} ${id} dialog fits viewport`, fits);
    ok(`${label} ${id} close button visible`, await p.evaluate(() => { const b = document.querySelector('#modal[open] [aria-label="Close dialog"]'); if (!b) return !document.querySelector('#modal[open]'); const r = b.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.right <= innerWidth && r.width >= 44 && r.height >= 44; }));
    if (legacy) { await p.evaluate(() => closeModal(true)); continue; }
    for (const tab of ['build', 'examples', 'learn']) {
      if (tab !== 'build') { await p.click('#tkTab-' + tab); await p.waitForTimeout(120); }
      bad = await axe(p, '#modal'); ok(`${label} ${id}/${tab} axe`, !bad.length, bad.join(' | '));
      const sm = await small(p, '#modal'); ok(`${label} ${id}/${tab} touch targets${mobile ? '' : ' (desktop)'}`, !sm.length, sm.join(','));
      const o = await overflow(p, '#modalBody'); ok(`${label} ${id}/${tab} no overflow`, !o.bad && !o.docX && !o.sx, JSON.stringify(o));
      if (id === 'sbar' || id === 'priority' || id === 'risk') await p.screenshot({ path: `${out}/${id}-${tab}-${label}.png` });
    }
    await p.click('#tkTab-build');
    /* edit, preview, persistence */
    if (!['priority'].includes(id)) { const f = await p.$('#toolField0'); if (f && (await f.evaluate(e => e.tagName)) === 'TEXTAREA') { await f.fill('Persist check ' + id); await p.waitForTimeout(150); ok(`${label} ${id} live preview updates`, (await p.textContent('#tkPreview')).includes('Persist check')); } }
    await p.evaluate(() => closeModal(true));
  }
  ok(`${label} no console errors`, !errs.length, errs.join(' | ')); await ctx.close();
}

/* behaviour: every spec loads each example, exports, persists across reload */
{
  const { ctx, p, errs } = await session();
  const res = await p.evaluate(async () => {
    const out = [];
    for (const id of Object.keys(TK_SPECS)) {
      const s = TK_SPECS[id];
      for (const [mi, m] of s.modes.entries()) {
        openTool(id); if (mi) { state.toolDrafts['tk-mode-' + id] = [m.id]; tkPaint(); }
        for (const e of m.examples || []) { if (e.v.length !== m.fields.length) out.push(`${id}/${m.id}: example length ${e.v.length}/${m.fields.length}`); tkLoad(id, e.v, 'x'); const t = tkText(id); if (!t.includes('CARECRAFT TOOLKIT')) out.push(id + ' text'); if (!tkPrintHTML(id).includes('tk-print')) out.push(id + ' print'); tkDiagram(id, m, tkVals(m)); }
        if (m.weak && m.weak.v.length !== m.fields.length) out.push(`${id}/${m.id}: weak length`);
        if (m.weak && m.weak.why.length !== m.fields.length && s.custom !== 'risk') out.push(`${id}/${m.id}: why length ${m.weak.why.length}/${m.fields.length}`);
        tkCues(m, tkVals(m));
      }
      closeModal(true);
    }
    return out;
  });
  ok('all examples match field counts, export, print and diagram render', !res.length, res.join('; '));
  await p.evaluate(() => { state.toolDrafts = {}; openTool('sbar'); }); await p.fill('#toolField0', 'Saved across reload'); await p.click('#tkc0', { force: true }); await p.waitForTimeout(800); await p.evaluate(() => store.flush && store.flush());
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1200);
  await p.evaluate(() => openTool('sbar')); await p.waitForTimeout(200);
  ok('draft text persists after reload', (await p.inputValue('#toolField0')) === 'Saved across reload');
  ok('checklist tick persists after reload', await p.isChecked('#tkc0'));
  ok('opened tool appears under recently used', await p.evaluate(() => { closeModal(true); navigate('tools'); return !!document.querySelector('.tk-sec h2') && document.querySelector('.tk-sec h2').textContent.includes('Pick up'); }));
  await p.evaluate(() => openTool('sbar')); await p.click('[data-tk="mode"][data-v="isbar"]'); ok('ISBAR mode has Identify', (await p.locator('label:has-text("Identify")').count()) >= 1);
  await p.click('[data-tk="mode"][data-v="sbar"]');
  await p.click('[data-tk="copy"]'); await p.waitForTimeout(200); ok('copy puts the draft on the clipboard', (await p.evaluate(() => navigator.clipboard.readText())).includes('Saved across reload'));
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-tk="download"]')]); ok('download produces a txt file', dl.suggestedFilename().endsWith('.txt'));
  await p.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; }); await p.click('[data-tk="print"]'); ok('print fills the record and calls print', await p.evaluate(() => window.__printed === 1 && document.getElementById('learningRecord').textContent.includes('Saved across reload')));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200); ok('Escape closes the tool', await p.evaluate(() => !document.querySelector('#modal[open]')));
  /* risk and priority maths */
  await p.evaluate(() => { state.toolDrafts = {}; openTool('risk'); loadWorkspaceExample('risk', 'good2'); });
  ok('risk calculator reports absolute change', (await p.textContent('#tkSide')).includes('1 fewer in 1,000'));
  await p.evaluate(() => closeModal(true));
  ok('no console errors (behaviour)', !errs.length, errs.join(' | ')); await ctx.close();
}
/* reduced motion */
{ const { ctx, p } = await session({ reduced: true }); await p.evaluate(() => openTool('qi')); ok('reduced motion: no running transitions on progress bar', await p.evaluate(() => getComputedStyle(document.querySelector('.tk-bar-track i')).transitionDuration.split(',').every(x => parseFloat(x) === 0))); await ctx.close(); }
await browser.close();
const failed = rows.filter(r => !r.pass); console.log(`${rows.length - failed.length}/${rows.length} checks passed`); if (failed.length) { console.log(failed.map(f => f.name).join('\n')); process.exit(1); }
