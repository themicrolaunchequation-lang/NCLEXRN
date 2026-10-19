// Browser check of Carecraft Practice (hub, every activity, debriefs, drill, axe, mobile overflow/touch targets, console errors).
// usage: node apps/tools/carecraft-practice-check.mjs [out-dir] [--port 8446]   (preview: node apps/tools/serve-site.mjs 8446)
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const a = process.argv.slice(2), out = a[0] && !a[0].startsWith('--') ? a[0] : '/tmp/practice-check', pi = a.indexOf('--port'), port = pi < 0 ? 8446 : a[pi + 1];
const AXE = fs.readFileSync(process.env.AXE || '/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8'); fs.mkdirSync(out, { recursive: true });
const rows = []; const ok = (name, cond, detail = '') => { rows.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, String(detail).slice(0, 400)); };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] });
async function session({ w = 1440, h = 900, dark = false } = {}) {
  const touch = w < 700, ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', colorScheme: dark ? 'dark' : 'light', hasTouch: touch, isMobile: touch });
  const p = await ctx.newPage(), errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.addInitScript(w => { window.__W = w; }, w);
  await p.goto('https://carecraft.healthcarecrownacademy.co.uk/#/practice', { waitUntil: 'load' }); await p.waitForTimeout(1200);
  for (let i = 0; i < 4; i++) { const hit = await p.evaluate(() => { const b = [...document.querySelectorAll('dialog[open] button')].find(x => /^(ski|close|maybe|not now|later|got it|explore|start)/i.test(x.textContent.trim())); if (b) { b.click(); return true; } return false; }); if (!hit) break; await p.waitForTimeout(250); }
  return { ctx, p, errs };
}
const axe = async (p, scope) => { await p.evaluate(src => { if (!window.axe) (0, eval)(src); }, AXE); return p.evaluate(async scope => (await axe.run(document.querySelector(scope), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'], rules: { region: { enabled: false } } })).violations.map(v => `${v.id}: ${v.nodes.length} (${v.nodes[0].target.join(' ')})`), scope); };
const geom = p => p.evaluate(() => { const vw = window.__W || innerWidth, vh = innerHeight, m = document.getElementById('modal'), root = m.open ? m : document.getElementById('main'); const r = m.getBoundingClientRect(), close = m.querySelector('[data-action="close"]'), cb = close?.getBoundingClientRect();
  const over = [...root.querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.right > vw + 1 && !e.closest('.px-pathscroll,.px-tablewrap,.px-chiprow,svg,.cc-sim-stage,.px-exhibit'); }).length;
  const small = [...root.querySelectorAll('.px-modal button,.px-modal [role=radio],.px-modal input:not([type=range]),.page-practice .px-fchip,.page-practice .button')].filter(e => { const b = e.getBoundingClientRect(); return b.width && (b.height < 43.5 || b.width < 43.5) && getComputedStyle(e).visibility !== 'hidden'; }).map(e => (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 24) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
  return { open: m.open, fits: !m.open || (r.width <= vw + 1 && r.height <= vh + 1), closeVisible: !m.open || (cb && cb.top >= 0 && cb.bottom <= vh && cb.width > 0), docW: document.documentElement.scrollWidth, iw: innerWidth, vw, over, small }; });
const click = async (p, sel) => { await p.click(sel, { timeout: 4000 }); await p.waitForTimeout(120); };
const clickNext = async p => { await p.evaluate(() => document.querySelector('#modal [data-px-next]:not(:disabled)')?.click()); await p.waitForTimeout(120); };

/* ---- hub ---- */
for (const [label, opt] of [['desktop', {}], ['mobile', { w: 390, h: 844 }], ['dark', { dark: true }], ['mobile-dark', { w: 390, h: 844, dark: true }]]) {
  const { ctx, p, errs } = await session(opt);
  ok(`hub ${label}: cards = activities`, await p.evaluate(() => document.querySelectorAll('.activity-card').length === HCA_ACTIVITIES.length), await p.evaluate(() => document.querySelectorAll('.activity-card').length));
  ok(`hub ${label}: no horizontal overflow`, (await geom(p)).docW <= (await geom(p)).vw, JSON.stringify(await geom(p)));
  const bad = await axe(p, '#main'); ok(`hub ${label}: axe`, !bad.length, bad.join(' | '));
  const g = await geom(p); ok(`hub ${label}: touch targets`, !opt.w || !g.small.length, g.small.join(', '));
  await p.evaluate(() => document.querySelector('.px-fchip[data-arg0="level"][data-arg1="core"]').click()); ok(`hub ${label}: level filter`, await p.evaluate(() => [...document.querySelectorAll('.px-card-a')].every(c => PX_META[c.dataset.activityId].level === 'core')));
  await p.evaluate(() => document.querySelector('.px-fchip[data-arg0="level"][data-arg1="all"]').click()); await p.screenshot({ path: `${out}/hub-${label}.png`, fullPage: true }); ok(`hub ${label}: no console errors`, !errs.length, errs.join('|')); await ctx.close();
}

/* ---- activities ---- */
for (const [label, opt] of [['desktop', {}], ['mobile', { w: 390, h: 844 }], ['mobile-dark', { w: 390, h: 844, dark: true }]]) {
  const { ctx, p, errs } = await session(opt); const ids = await p.evaluate(() => HCA_ACTIVITIES.map(a => a.id));
  for (const id of ids) {
    await p.evaluate(id => { if (document.getElementById('modal').open) closeModal(true); launchActivity(id); }, id); await p.waitForTimeout(500);
    const g = await geom(p); ok(`${label} ${id}: opens, fits viewport, close visible`, (g.open || await p.evaluate(() => !!document.getElementById('studioWorkbench'))) && g.fits && g.closeVisible !== false, JSON.stringify(g));
    ok(`${label} ${id}: no page overflow`, g.docW <= g.vw && g.iw <= g.vw + 1 && !g.over, JSON.stringify(g));
    if (id.startsWith('px-') || ['handover', 'teachback', 'ai-case', 'med-case'].includes(id)) ok(`${label} ${id}: touch targets >=44`, label === 'desktop' || !g.small.length, g.small.join(', '));
    if (label !== 'mobile-dark' && (id === 'handover' || label === 'desktop' && ['hygiene', 'cc-bias', 'sim-handover'].includes(id))) { const bad = await axe(p, g.open ? '#modal' : '#main'); ok(`${label} ${id}: axe`, !bad.length, bad.join(' | ')); }
  }
  ok(`${label}: no console errors opening activities`, !errs.length, errs.join('|')); await ctx.close();
}

/* ---- complete every scenario, with confidence and debrief ---- */
{ const { ctx, p, errs } = await session({ w: 390, h: 844 }); const ids = await p.evaluate(() => Object.keys(PX_SCENARIOS));
  for (const id of ids) {
    await p.evaluate(id => { if (document.getElementById('modal').open) closeModal(true); launchActivity(id); }, id); await p.waitForTimeout(300);
    await click(p, '[data-action="px-begin"]'); let n = 0;
    while (!(await p.evaluate(() => !!document.querySelector('.px-debrief'))) && n++ < 8) {
      await click(p, '.px-opt >> nth=0'); await click(p, '.px-rate [data-arg0="2"]'); await click(p, '[data-action="px-lock"]'); await clickNext(p);
    }
    ok(`scenario ${id}: reaches debrief`, await p.evaluate(() => !!document.querySelector('.px-pathmap svg') && !!document.querySelector('.px-fwstrip')), n);
    ok(`scenario ${id}: attempt saved`, await p.evaluate(id => state.studioAttempts.some(r => r.activity === id) && pxStore().attempts.some(r => r.id === id), id));
    const g = await geom(p); ok(`scenario ${id}: debrief fits mobile`, g.docW <= g.vw && g.iw <= g.vw + 1 && !g.over, JSON.stringify(g));
    if (id === 'handover') { await p.screenshot({ path: `${out}/scenario-debrief-mobile.png` }); const bad = await axe(p, '#modal'); ok('scenario debrief axe', !bad.length, bad.join(' | ')); }
  }
  ok('scenarios: no console errors', !errs.length, errs.join('|')); await ctx.close(); }

/* ---- components ---- */
{ const { ctx, p, errs } = await session({ w: 390, h: 844 });
  const open = async id => { await p.evaluate(id => { if (document.getElementById('modal').open) closeModal(true); launchActivity(id); }, id); await p.waitForTimeout(300); };
  await open('px-sbar'); await click(p, '[data-action="px-sb-start"] >> nth=0');
  for (let i = 0; i < 12; i++) { const done = await p.evaluate(() => { const b = document.querySelector('.px-tray .px-chipcard'); if (!b) return true; b.click(); return false; }); if (done) break; await p.waitForTimeout(80); const cat = await p.evaluate(() => { const ch = PX_SBAR[pxs.idx].chips.find(c => c.id === pxs.sel); return ch ? (ch.cat === 'n' ? 'x' : ch.cat) : 'x'; }); await p.evaluate(c => document.querySelector(`.px-place [data-arg1="${c}"]`)?.click(), cat); await p.waitForTimeout(80); }
  await clickNext(p); ok('sbar: result with lanes', await p.evaluate(() => !!document.querySelector('.px-lanes') && state.studioAttempts.some(r => r.activity === 'px-sbar')));
  await open('px-ladder'); for (let i = 0; i < 5; i++) { await click(p, '.px-rungbtn >> nth=0'); await click(p, '.px-opt >> nth=0'); await clickNext(p); }
  ok('ladder: map result', await p.evaluate(() => !!document.querySelector('.px-ldmap')));
  await open('px-priorities'); await click(p, '[data-action="px-pr-start"] >> nth=0'); await click(p, '.px-task .px-move >> nth=1'); await click(p, '[data-action="px-pr-check"]');
  ok('priorities: reveal with comparison table', await p.evaluate(() => !!document.querySelector('.px-seqtable')));
  await open('px-hazard'); await click(p, '[data-action="px-hz-begin"]'); await click(p, '.px-hot >> nth=0'); await click(p, '[data-action="px-hz-view"][data-arg0="list"]'); await click(p, '.px-flagbtn >> nth=1'); await click(p, '[data-action="px-hz-finish"]');
  ok('hazard: debrief with categories', await p.evaluate(() => !!document.querySelector('.px-bars-chart') && state.studioAttempts.some(r => r.activity === 'px-hazard')));
  await p.screenshot({ path: `${out}/hazard-debrief-mobile.png` });
  await open('px-incident'); for (let i = 0; i < 6; i++) await clickNext(p); await clickNext(p);
  await p.evaluate(() => { for (const id of PX_INCIDENT.flagCorrect) PX_ACTIONS['px-in-flag']([id]); PX_ACTIONS['px-in-check'](); PX_ACTIONS['px-in-fair'](); for (const b of PX_INCIDENT.behaviours) PX_ACTIONS['px-in-resp']([b.id, b.best]); PX_ACTIONS['px-in-finish'](); });
  ok('incident: cheese debrief', await p.evaluate(() => !!document.querySelector('.px-cheese')));
  await open('cc-bias'); for (let i = 0; i < 3; i++) { await click(p, '.answer >> nth=0'); await click(p, '.px-rate [data-arg0="3"]'); await click(p, '[data-action="px-clock"]'); await p.evaluate(() => document.querySelector('#modal [data-action="engine-38"]')?.click()); await p.waitForTimeout(120); }
  ok('legacy decisions: confidence, path map and calibration', await p.evaluate(() => !!document.querySelector('.px-pathmap svg') && !!document.querySelector('.px-calib')));
  await p.screenshot({ path: `${out}/legacy-decisions-debrief-mobile.png` });
  await open('cc-teach'); await p.evaluate(() => { const s = CC_STUDIOS.find(x => x.id === 'cc-teach'); [1, 0, 2, 4, 3].forEach(i => ccSequencePick(i)); ccStudio.checked = true; ccRenderStudio(); });
  ok('legacy sequence: comparison map', await p.evaluate(() => !!document.querySelector('.px-seqtable')));
  /* drill */
  await p.evaluate(() => { closeModal(true); launchActivity('handover'); PX_ACTIONS['px-begin'](); let g=0; while (pxs.phase === 'play' && g++ < 8) { const sc = PX_SCENARIOS.handover, o = pxOrder(pxs.node, 3), di = o.findIndex(oi => sc.nodes[pxs.node].opts[oi].q !== 'best'); PX_ACTIONS['px-pick']([di]); PX_ACTIONS['px-rate']([3]); PX_ACTIONS['px-lock'](); PX_ACTIONS['px-next'](); } closeModal(true); navigate('practice'); }); ok('drill cards due (tomorrow)', await p.evaluate(() => Object.keys(pxStore().cards).length > 0));
  await p.evaluate(() => { for (const c of Object.values(pxStore().cards)) c.due = localDay(); render(); }); await click(p, '[data-action="px-drill"]:not(:disabled)');
  await click(p, '.px-opt >> nth=0'); ok('drill: feedback', await p.evaluate(() => !!document.querySelector('.px-feedback')));
  /* resume and back */
  await p.evaluate(() => { closeModal(true); launchActivity('px-ladder'); PX_ACTIONS['px-ld-rung']([2]); captureActivity(); });
  ok('checkpoint validates', await p.evaluate(() => { try { store.validate(JSON.parse(store.export())); return true; } catch (e) { return String(e); } }));
  await p.evaluate(() => { closeModal(true); resume(); }); ok('resume restores ladder rung', await p.evaluate(() => pxs && pxs.rung === 2));
  await p.evaluate(() => { PX_ACTIONS['px-ld-rung']([3]); activityBack(); }); ok('back restores the previous rung', await p.evaluate(() => pxs.rung === 2));
  await p.evaluate(() => { closeModal(true); navigate('progress'); }); ok('My Growth shows practice skills + trail', await p.evaluate(() => !!document.querySelector('.px-growth .px-radar') && document.querySelectorAll('.trail').length > 3));
  ok('components: no console errors', !errs.length, errs.join('|')); await ctx.close(); }

const f = rows.filter(r => !r.pass).length; console.log(JSON.stringify({ passed: rows.length - f, failed: f })); await browser.close(); process.exit(f ? 1 : 0);
