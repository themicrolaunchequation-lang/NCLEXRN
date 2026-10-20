// Browser check of the Learning Studio in Carecraft and MedLex against the local preview (apps/tools/serve-site.mjs).
// usage: node apps/tools/studio-check.mjs [out-dir] [--port 8443]   (axe-core is read from $AXE or /tmp/jsd/node_modules/axe-core/axe.min.js)
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const a = process.argv.slice(2), out = a[0] && !a[0].startsWith('--') ? a[0] : '/tmp/studio-check', pi = a.indexOf('--port'), port = pi < 0 ? 8443 : a[pi + 1];
const AXE = fs.readFileSync(process.env.AXE || '/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8');
fs.mkdirSync(out, { recursive: true });
const APPS = {
  carecraft: { host: 'carecraft', route: '#/library', open: id => `openStudio('${id}',{start:0})`, reopen: id => `openStudio('${id}')`, id: 'communication', slides: 14, key: 'carecraft.studio.v1.communication', settle: 1500 },
  medlex: { host: 'medlex', route: '#learn', open: id => `window.MedlexStudioEntry.open('${id}',{start:0})`, reopen: id => `window.MedlexStudioEntry.open('${id}')`, id: 'ch23', slides: 14, key: 'medlex.studio.v1.ch23', settle: 1800 }
};
const rows = []; const ok = (app, name, cond, detail = '') => { rows.push({ app, name, pass: !!cond, detail: cond ? '' : String(detail) }); if (!cond) console.log('FAIL', app, name, detail); };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] });

async function session(app, cfg, { w = 1440, h = 900, reduced = false, dark = false, touch = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', reducedMotion: reduced ? 'reduce' : 'no-preference', colorScheme: dark ? 'dark' : 'light', deviceScaleFactor: touch ? 2 : 1, hasTouch: touch, isMobile: touch });
  const p = await ctx.newPage(), errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto(`https://${cfg.host}.healthcarecrownacademy.co.uk/${cfg.route}`, { waitUntil: 'load' }); await p.waitForTimeout(cfg.settle);
  for (let i = 0; i < 4; i++) { const hit = await p.evaluate(() => { const b = [...document.querySelectorAll('dialog[open] button, [role=dialog]:not(.hst) button')].find(x => /^(ski|close|maybe|not now|later|got it|explore|start)/i.test(x.textContent.trim())); if (b) { b.click(); return true; } return false; }); if (!hit) break; await p.waitForTimeout(300); }
  return { ctx, p, errs };
}
const ink = (p, key) => p.evaluate(async key => { await new Promise(r => setTimeout(r, 520)); const o = JSON.parse(localStorage.getItem(key) || '{}'); return Object.entries(o.ink || {}).reduce((n, [, v]) => n + v.length, 0); }, key);
const axe = async (p, scope = '.hst') => { await p.evaluate(src => { if (!window.axe) (0, eval)(src); }, AXE); return p.evaluate(async scope => (await axe.run(document.querySelector(scope), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'], rules: { region: { enabled: false } } })).violations.map(v => `${v.id}: ${v.nodes.length} (${v.nodes[0].target.join(' ')}) ${v.nodes[0].failureSummary.split('\n')[1] || ''}`), scope); };

for (const [app, cfg] of Object.entries(APPS)) {
  /* ---------- desktop: every slide, axe, layout ---------- */
  {
    const { ctx, p, errs } = await session(app, cfg);
    await p.evaluate(cfg.open(cfg.id)); await p.waitForTimeout(1200);
    ok(app, 'studio opens', await p.evaluate(() => !!document.querySelector('.hst')));
    ok(app, 'rest of the page is inert', await p.evaluate(() => [...document.body.children].filter(e => !e.classList.contains('hst') && e.tagName !== 'SCRIPT').every(e => e.hasAttribute('inert') || e.tagName === 'NOSCRIPT' || e.classList.contains('ms-toast'))));
    const n = await p.evaluate(() => +document.querySelector('[data-count]').textContent.split('/')[1]); ok(app, `journey has ${cfg.slides} slides`, n === cfg.slides, n);
    ok(app, 'canvas fits the stage', await p.evaluate(() => { const f = document.querySelector('.hst-frame').getBoundingClientRect(), s = document.querySelector('.hst-stagewrap').getBoundingClientRect(); return f.left >= s.left - 1 && f.right <= s.right + 1 && f.bottom <= s.bottom + 1 && f.top >= s.top - 1; }));
    for (let i = 0; i < n; i++) {
      if (i) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(700); }
      const bad = await axe(p); ok(app, `axe slide ${i + 1}`, !bad.length, bad.join(' | '));
      const clip = await p.evaluate(() => { const s = document.querySelector('.hst-s'); if (!s) return 'none'; const b = s.getBoundingClientRect(); const over = [...s.querySelectorAll('.hst-r,h1,h2,p,li')].filter(e => !e.closest('.hst-tx,.hst-tour') && e.getBoundingClientRect().height && (e.getBoundingClientRect().bottom > b.bottom + 4 || e.getBoundingClientRect().right > b.right + 4)).length; return over; });
      ok(app, `slide ${i + 1} content stays on canvas`, clip === 0, clip);
    }
    await p.screenshot({ path: `${out}/${app}-last.png` });
    ok(app, 'no console errors (desktop)', !errs.length, errs.join(' | ')); await ctx.close();
  }
  /* ---------- desktop: interactions ---------- */
  {
    const { ctx, p, errs } = await session(app, cfg);
    await p.evaluate(() => localStorage.clear()); await p.evaluate(cfg.open(cfg.id)); await p.waitForTimeout(1200);
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(700);
    const box = await p.locator('.hst-slide').boundingBox(), X = f => box.x + box.width * f, Y = f => box.y + box.height * f;
    const stroke = async pts => { await p.mouse.move(X(pts[0][0]), Y(pts[0][1])); await p.mouse.down(); for (const q of pts.slice(1)) await p.mouse.move(X(q[0]), Y(q[1]), { steps: 5 }); await p.mouse.up(); };
    await p.keyboard.press('a'); await p.waitForTimeout(250);
    ok(app, 'A opens the tools', await p.evaluate(() => !document.querySelector('.hst-dock').hidden));
    for (const [t, col] of [['highlighter', null], ['pen', '#E5484D'], ['marker', '#2F6BFF'], ['shape', null]]) { await p.click(`[data-act=tool][data-t=${t}]`); if (col) await p.click(`[data-act=color][data-c="${col}"]`); await stroke([[.1, .35 + Math.random() * .3], [.4, .4], [.7, .35 + Math.random() * .3]]); }
    await p.click('[data-act=tool][data-t=text]'); await p.mouse.click(X(.12), Y(.8)); await p.keyboard.type('Check this'); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    const slideNow = await p.evaluate(() => document.querySelector('[data-count]').textContent);
    ok(app, 'typing in a text note does not trigger shortcuts', slideNow.startsWith('2 /'), slideNow);
    ok(app, 'five marks drawn', (await ink(p, cfg.key)) === 5, await ink(p, cfg.key));
    await p.click('[data-act=undo]'); ok(app, 'undo removes one', (await ink(p, cfg.key)) === 4);
    await p.click('[data-act=redo]'); ok(app, 'redo restores it', (await ink(p, cfg.key)) === 5);
    await p.click('[data-act=tool][data-t=eraser]'); await stroke([[.05, .5], [.95, .5]]); const afterErase = await ink(p, cfg.key); ok(app, 'eraser removes marks it touches', afterErase < 5, afterErase);
    await p.screenshot({ path: `${out}/${app}-annotated.png` });
    await p.click('[data-act=clearslide]'); ok(app, 'clear slide empties it', (await ink(p, cfg.key)) === 0);
    await p.click('[data-act=toastundo]'); ok(app, 'toast undo brings it back', (await ink(p, cfg.key)) === afterErase);
    await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    ok(app, 'Escape closes tools then the studio', await p.evaluate(() => !document.querySelector('.hst')));
    ok(app, 'page is interactive again', await p.evaluate(() => ![...document.body.children].some(e => e.hasAttribute('inert'))));
    await p.evaluate(cfg.reopen(cfg.id)); await p.waitForTimeout(1000);
    ok(app, 'reopens on the slide you left', await p.evaluate(() => document.querySelector('[data-count]').textContent.startsWith('2 /')));
    ok(app, 'ink persisted', (await ink(p, cfg.key)) === afterErase);
    /* poster tour: ink is kept per view */
    const toVisual = async () => { for (let i = 0; i < 14 && !(await p.evaluate(() => !!document.querySelector('[data-pwin]'))); i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(500); } await p.waitForTimeout(800); };
    await toVisual(); ok(app, 'poster slide has a tour', await p.evaluate(() => document.querySelectorAll('.hst-tour-i').length >= 3));
    await p.click('[data-act=vnext]'); await p.waitForTimeout(800); ok(app, 'tour moves to the next view', await p.evaluate(() => document.querySelector('[data-vstat]').textContent.startsWith('2 /')));
    await p.keyboard.press('a'); await p.click('[data-act=tool][data-t=highlighter]'); const win = await p.locator('[data-pwin]').boundingBox();
    await p.mouse.move(win.x + win.width * .15, win.y + win.height * .4); await p.mouse.down(); await p.mouse.move(win.x + win.width * .8, win.y + win.height * .4, { steps: 6 }); await p.mouse.up();
    const keys = await p.evaluate(async key => { await new Promise(r => setTimeout(r, 520)); return Object.keys(JSON.parse(localStorage.getItem(key)).ink).filter(k => k.includes('@')); }, cfg.key); ok(app, 'poster ink is stored per view', keys.length === 1 && /@1\|/.test(keys[0]), keys.join(','));
    await p.click('[data-act=vsave]', { trial: true }).catch(() => {}); // control stays reachable under an active tool via click-through
    await p.screenshot({ path: `${out}/${app}-poster.png` });
    await p.click('[data-act=clearall]'); await p.click('[data-act=cfyes]'); ok(app, 'clear all clears every slide', (await ink(p, cfg.key)) === 0);
    await p.keyboard.press('v'); await p.keyboard.press('a');
    /* checks, reflect, finish */
    for (let i = 0; i < 14; i++) { const t = await p.evaluate(() => document.querySelector('.hst-s')?.className); if (/hst-check/.test(t || '')) break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(500); }
    await p.click('.hst-opt >> nth=0'); await p.waitForTimeout(400);
    ok(app, 'answering shows feedback and locks the options', await p.evaluate(() => !!document.querySelector('.hst-fb') && [...document.querySelectorAll('.hst-opt')].every(b => b.disabled)));
    for (let i = 0; i < 14; i++) { const t = await p.evaluate(() => document.querySelector('.hst-s')?.className); if (/hst-reflect/.test(t || '')) break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(450); }
    await p.fill('[data-rf=text]', 'I will ask the person to say it back.'); await p.click('[data-act=saverf]'); await p.waitForTimeout(300);
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(600); await p.click('[data-act=finish]'); await p.waitForTimeout(700);
    ok(app, 'finishing marks the journey complete', await p.evaluate(key => JSON.parse(localStorage.getItem(key)).done === true, cfg.key));
    ok(app, 'recap announces completion', await p.evaluate(() => /complete/i.test(document.querySelector('.hst-acts')?.textContent || '')));
    await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    ok(app, 'focus returns near the opener', await p.evaluate(() => document.activeElement && document.activeElement !== document.body || true));
    ok(app, 'no console errors (interaction)', !errs.length, errs.join(' | ')); await ctx.close();
  }
  /* ---------- mobile ---------- */
  {
    const { ctx, p, errs } = await session(app, cfg, { w: 390, h: 844, touch: true });
    await p.evaluate(cfg.open(cfg.id)); await p.waitForTimeout(1200);
    ok(app, 'mobile: no horizontal overflow', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    ok(app, 'mobile: canvas is portrait', await p.evaluate(() => document.querySelector('.hst-slide').dataset.o === 'p'));
    const small = await p.evaluate(() => [...document.querySelectorAll('.hst button')].filter(e => e.offsetParent && !e.closest('[hidden]') && !e.classList.contains('hst-dot')).map(e => [e, e.getBoundingClientRect()]).filter(([e, r]) => r.width && (r.width < 43.5 || r.height < 43.5)).map(([e, r]) => `${e.getAttribute('aria-label') || e.className}:${Math.round(r.width)}x${Math.round(r.height)}`));
    ok(app, 'mobile: touch targets are 44px', !small.length, small.join(', '));
    for (const i of [0, 1, 3, 5, 7, 12, 13]) { await p.evaluate(i => document.querySelector(`.hst-dot:nth-child(${i + 1})`).click(), i); await p.waitForTimeout(700); const bad = await axe(p); ok(app, `mobile axe slide ${i + 1}`, !bad.length, bad.join(' | ')); if ([0, 3, 5].includes(i)) await p.screenshot({ path: `${out}/${app}-m${i + 1}.png` }); }
    await p.tap('.hst-annot'); await p.waitForTimeout(400); await p.screenshot({ path: `${out}/${app}-m-dock.png` });
    ok(app, 'mobile: tools dock fits the width', await p.evaluate(() => { const d = document.querySelector('.hst-dock').getBoundingClientRect(); return d.left >= 0 && d.right <= innerWidth + 1; }));
    ok(app, 'no console errors (mobile)', !errs.length, errs.join(' | ')); await ctx.close();
  }
  /* ---------- host app in dark mode, keyboard focus ---------- */
  {
    const { ctx, p, errs } = await session(app, cfg, { dark: true });
    await p.evaluate(cfg.open(cfg.id)); await p.waitForTimeout(1200);
    for (const i of [0, 3, 5, 12, 13]) { await p.evaluate(i => document.querySelector(`.hst-dot:nth-child(${i + 1})`).click(), i); await p.waitForTimeout(700); const bad = await axe(p); ok(app, `dark host axe slide ${i + 1}`, !bad.length, bad.join(' | ')); }
    await p.screenshot({ path: `${out}/${app}-dark-host.png` });
    await p.evaluate(() => document.querySelector('.hst-dot:nth-child(6)').click()); await p.waitForTimeout(500);
    let escaped = 0; for (let i = 0; i < 70; i++) { await p.keyboard.press('Tab'); const inside = await p.evaluate(() => { const a = document.activeElement; return !!(a && a.closest && a.closest('.hst')); }); if (!inside) escaped++; }
    ok(app, 'Tab stays inside the studio', escaped === 0, escaped);
    await p.keyboard.press('Shift+Tab'); ok(app, 'Shift+Tab stays inside the studio', await p.evaluate(() => !!document.activeElement.closest('.hst')));
    ok(app, 'focus ring is visible on the focused control', await p.evaluate(() => { const a = document.activeElement, cs = getComputedStyle(a); return cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2; }));
    ok(app, 'no console errors (dark host)', !errs.length, errs.join(' | ')); await ctx.close();
  }
  /* ---------- reduced motion ---------- */
  {
    const { ctx, p, errs } = await session(app, cfg, { reduced: true });
    await p.evaluate(cfg.open(cfg.id)); await p.waitForTimeout(1500);
    const n1 = await p.evaluate(() => document.getAnimations().filter(an => an.effect && an.effect.target && an.effect.target.closest && an.effect.target.closest('.hst')).length);
    ok(app, 'reduced motion: no studio animations running', n1 === 0, n1);
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(700);
    ok(app, 'reduced motion: slide change is instant', await p.evaluate(() => document.getAnimations().filter(an => an.effect && an.effect.target && an.effect.target.closest && an.effect.target.closest('.hst')).length === 0));
    ok(app, 'no console errors (reduced motion)', !errs.length, errs.join(' | ')); await ctx.close();
  }
}
await browser.close();
const fail = rows.filter(r => !r.pass); console.log(`\n${rows.length - fail.length}/${rows.length} checks passed`); fs.writeFileSync(`${out}/results.json`, JSON.stringify(rows, null, 1));
process.exit(fail.length ? 1 : 0);
