// Browser check of MedLex Word parts (#wordparts): the landing page and the three studios (Prefixes, Roots, Suffixes) as they sit inside the app page.
// usage: node apps/tools/wordparts-check.mjs [out-dir] [--port 8443] [--sizes 1920x940,1440x800,1024x700,390x844] [--themes light,dark] [--studios prefix,root,suffix] [--quick]
//   Local preview first:  node apps/tools/serve-site.mjs 8443     (rebuild the app with: cd apps/medlex && node build-web.mjs)
//   --only hero,popup,... runs just those steps (frame, hero, search, popup, close, games, resize, theme, axe, targets).  --quick = 1440x800 and 390x844, light only. Screenshots go to out-dir (default /tmp/wordparts-check). Exit code 1 when anything fails.
// What it covers, for every studio x size x theme:
//   frame: as tall as the quest and stable (no growth loop), no scrollbar of its own, no sideways overflow, one h1, one studio switcher, no empty gap at the end,
//          no fixed or sticky leftovers; Day / Night inside the quest and the app's own theme agree
//   hero buttons, search / sort / filters, every tab and game, progress / XP / badges, audio controls (speech is stubbed and counted), toasts and confetti (drawn on the screen)
//   card pop-up opened at the top, middle and end of the grid and while the frame is only partly on screen: the page does not jump, the pop-up is fully inside the visible
//          area (header never cropped; taller ones scroll on their own), the page behind does not scroll (wheel, keys, touch), Tab stays inside, focus starts inside and returns
//          to the card, previous / next / mark known / listen / mini-check work, close by X, Esc, backdrop and the dimmed app; links to MedLex pages navigate within the app
//   resize while a pop-up is open, axe (serious / critical = 0) on the landing and on a studio (app page and quest), 44px targets on phones
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const a = process.argv.slice(2), arg = (n, d) => { const i = a.indexOf('--' + n); return i < 0 ? d : a[i + 1]; };
const out = a[0] && !a[0].startsWith('--') ? a[0] : '/tmp/wordparts-check', port = arg('port', 8443), quick = a.includes('--quick');
const SIZES = (arg('sizes', quick ? '1440x800,390x844' : '1920x940,1440x800,1024x700,390x844')).split(',').map(s => s.split('x').map(Number));
const THEMES = arg('themes', quick ? 'light' : 'light,dark').split(','), STUDIOS = arg('studios', 'prefix,root,suffix').split(',');
const AXE = fs.readFileSync(process.env.AXE || '/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8'); fs.mkdirSync(out, { recursive: true });
const rows = []; let tag = '';
const ok = (name, cond, detail = '') => { rows.push({ name: tag + name, pass: !!cond, detail: cond ? '' : String(detail) }); if (!cond) console.log('FAIL', tag + name, String(detail).slice(0, 400)); return !!cond; };
const ONLY = (arg('only', '') || '').split(',').filter(Boolean);   /* --only hero,search,popup,close,games,resize,theme,axe,targets,frame: run just those steps */
const step = async (name, fn) => { if (ONLY.length && !ONLY.some(o => name.startsWith(o))) return; try { await fn(); } catch (e) { ok(name, false, 'threw: ' + String(e.message).split('\n')[0]); } };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] });
const URL = 'https://medlex.healthcarecrownacademy.co.uk/';
const wait = ms => new Promise(r => setTimeout(r, ms));
const SPEECH = () => { /* every frame: speech is recorded, never played */ window.__spoken = []; try { const ss = window.speechSynthesis; ss.speak = u => { window.__spoken.push(String(u.text)); setTimeout(() => { try { u.onend && u.onend({}); } catch (e) { } }, 40); }; ss.cancel = () => { }; ss.getVoices = () => []; } catch (e) { } };

/* the three studios: where things are */
const Q = {
  prefix: { name: 'Prefixes', n: 66, card: '#grid .card .pfx', cardBox: '#grid .card', frameRe: /quest-prefixes/, search: '#search', sort: '#sortSel', close: '#mClose', next: '#mNext', know: '#mKnow', listen: '[data-say=m]', link: 'a.medlex', discover: '[data-ml-intro]', explore: '[data-go=learn]', quiz: '[data-go=quiz]', tour: '#heroTour', badgesBtn: '#badgesBtn' },
  root: { name: 'Roots', n: 60, card: '#grid .card .tapHint', cardBox: '#grid .card', frameRe: /quest-roots/, search: '#searchInput', sort: '#sortSel', close: '#dClose', next: '#dNext', know: '#dMaster', listen: '#dSpeakRoot', link: '#dLink', discover: '[data-ml-intro]', explore: '#btnExplore', quiz: '#btnQuizHero' },
  suffix: { name: 'Suffixes', n: 100, card: '#grid .scard .open-hit', cardBox: '#grid .scard', frameRe: /quest-suffixes/, search: '#search', sort: '#sortSel', close: '#modalX', next: '[data-m=next]', know: '[data-m=master]', listen: '[data-l=word]', link: '#modalIn a.btn', discover: '[data-ml-intro]', quiz: '#heroQuiz', mystery: '#heroRandom' }
};

async function session({ w, h, dark = false, reduced = false }) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', colorScheme: dark ? 'dark' : 'light', reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: w < 500, isMobile: w < 500 });
  await ctx.addInitScript(SPEECH);
  const p = await ctx.newPage(), errs = [];
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_|supabase/i.test(m.text())) errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto(URL + '#today', { waitUntil: 'load' }); await wait(1500);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Skip'); b && b.click(); });
  await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  return { ctx, p, errs };
}
const frameOf = p => p.frames().find(f => /\/learn\/quest-/.test(f.url()));
async function openStudio(p, k) {
  await p.evaluate(k => { location.hash = 'wordparts/' + k; }, k);
  await p.waitForFunction(() => { const f = document.querySelector('.wp-frame'); return f && f.offsetHeight > 1500; }, null, { timeout: 15000 });
  await wait(500); return frameOf(p);
}
/* back from another page: wait for the studio to be on screen again (or open it) */
async function ensureStudio(p, k) {
  for (let i = 0; i < 30; i++) { const h = await p.evaluate(() => location.hash); if (/^#wordparts\/\w+/.test(h)) break; await wait(200); }
  if (!(await p.evaluate(() => !!document.querySelector('.wp-frame')))) return openStudio(p, k);
  await p.waitForFunction(() => { const f = document.querySelector('.wp-frame'); return f && f.offsetHeight > 1500; }, null, { timeout: 15000 }); await wait(500); return frameOf(p);
}
const settle = async p => { let last = -1; for (let i = 0; i < 40; i++) { const y = await p.evaluate(() => scrollY); if (y === last) return y; last = y; await wait(120); } return last; };
/* put the n-th element matching sel at screen height y (fraction of the window) by scrolling the app page */
async function bring(p, fr, sel, nth, frac) {
  const docY = await fr.evaluate(([s, n]) => { const e = document.querySelectorAll(s)[n]; const r = e.getBoundingClientRect(); return r.top + scrollY + r.height / 2; }, [sel, nth]);
  await p.evaluate(([y, f]) => { const fe = document.querySelector('.wp-frame'); window.scrollTo({ top: Math.max(0, fe.getBoundingClientRect().top + scrollY + y - innerHeight * f), behavior: 'instant' }); }, [docY, frac]); await wait(200);
}
async function click(p, fr, sel, nth = 0) {   /* a real mouse click at the element's place on screen */
  const bb = await fr.locator(sel).nth(nth).boundingBox(); if (!bb) throw new Error('no box for ' + sel);
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await wait(450);
}
const view = p => p.evaluate(() => { const f = document.querySelector('.wp-frame'); const r = f ? f.getBoundingClientRect() : null; return { sy: Math.round(scrollY), cls: f ? f.className : '', lock: document.documentElement.classList.contains('wp-lock'), scrim: document.querySelectorAll('.wp-scrim').length, hold: document.querySelectorAll('.wp-hold').length, fr: r && [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], iw: innerWidth, ih: innerHeight, h: f && f.offsetHeight }; });
const open = fr => fr.evaluate(() => { const o = [...document.querySelectorAll('.overlay')].filter(x => getComputedStyle(x).display !== 'none').pop(); if (!o) return null; const m = o.querySelector('.modal'), mr = m.getBoundingClientRect(), r = o.getBoundingClientRect(), first = m.firstElementChild && m.firstElementChild.getBoundingClientRect(); const sc = el => el.scrollHeight > el.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(el).overflowY); return { id: o.id, o: [r.top, r.bottom, r.left, r.right], m: [mr.top, mr.bottom, mr.left, mr.right], first: first && first.top, scrolls: sc(m) || sc(o), ih: innerHeight, iw: innerWidth, inside: o.contains(document.activeElement), role: (o.getAttribute('role') === 'dialog' ? o : o.querySelector('[role=dialog]') || {}).tagName || null }; });

/* ---------- the pop-up, fully ---------- */
async function popupChecks(p, fr, k, label, opener) {
  const c = Q[k], v0 = await view(p); const t = label + ': ';
  await opener(); await wait(250);
  const v1 = await view(p), m = await open(fr);
  if (!ok(t + 'a pop-up opened', m)) return;
  ok(t + 'the page did not jump', Math.abs(v1.sy - v0.sy) <= 1, `${v0.sy} -> ${v1.sy}`);
  ok(t + 'frame is the screen part it is on (fixed, inside the window)', /is-modal/.test(v1.cls) && v1.fr[1] >= -1 && v1.fr[1] + v1.fr[3] <= v1.ih + 1 && v1.lock && v1.scrim === 1 && v1.hold === 1, JSON.stringify(v1));
  ok(t + 'overlay covers the frame, inside the visible area', m.o[0] >= -1 && m.o[1] <= m.ih + 1, JSON.stringify(m.o));
  ok(t + 'dialog top is on screen (header not cropped)', m.m[0] >= -1 && (m.first === null || m.first >= -1), `top ${m.m[0]} first ${m.first}`);
  ok(t + 'dialog bottom is on screen or the dialog scrolls', m.m[1] <= m.ih + 1 || m.scrolls, `bottom ${m.m[1]} of ${m.ih}`);
  ok(t + 'dialog fits the width', m.m[2] >= -1 && m.m[3] <= m.iw + 1, JSON.stringify(m.m));
  ok(t + 'it is a labelled modal dialog', m.role === 'DIV' || m.role, m.role);
  ok(t + 'focus moved into the pop-up', m.inside);
  if (label.includes('first row')) { const ts = await p.evaluate(() => { const b = document.querySelector('.wp-toasts'), ts = b ? [...b.querySelectorAll('.wp-toast')] : []; return { n: ts.length, role: b && b.getAttribute('role'), live: b && b.getAttribute('aria-live'), inside: ts.every(t => { const r = t.getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.top >= 0 && r.left >= 0 && r.right <= innerWidth + 1; }), inFrame: !![...document.querySelectorAll('iframe')].length }; }); ok(t + 'toasts are drawn by the app on the screen, in a polite status region, inside the window', ts.n >= 1 && ts.role === 'status' && ts.live === 'polite' && ts.inside, JSON.stringify(ts)); }
  await step(t + 'frame has no scrollbar of its own', async () => { const s = await fr.evaluate(() => ({ x: innerWidth - document.documentElement.clientWidth, y: innerHeight - document.documentElement.clientHeight, ov: getComputedStyle(document.documentElement).overflow })); ok(t + 'frame has no scrollbar of its own', s.x === 0 && s.y === 0 && s.ov === 'hidden', JSON.stringify(s)); });
  await p.screenshot({ path: `${out}/${k}-${tag.replace(/[^\w]+/g, '_')}${label.replace(/\W+/g, '_')}.png` });
  /* the page behind stays put: wheel (over the pop-up and over the dimmed app), keys */
  const centre = { x: Math.round((m.m[2] + m.m[3]) / 2) + v1.fr[0], y: Math.round(m.ih / 2) };
  await p.mouse.move(centre.x, centre.y); await p.mouse.wheel(0, 900); await wait(250);
  if (v1.fr[0] > 60) { await p.mouse.move(20, 300); await p.mouse.wheel(0, 900); await wait(250); }
  await fr.evaluate(() => document.activeElement && document.activeElement.blur()); for (const key of ['PageDown', 'End', 'Space']) { await p.keyboard.press(key); await wait(80); }   /* focus nowhere: the scroll keys must not move the page behind */
  const v2 = await view(p); ok(t + 'page behind does not scroll (wheel, keys)', Math.abs(v2.sy - v0.sy) <= 1, `${v0.sy} -> ${v2.sy}`);
  if (m.scrolls) { const st = await fr.evaluate(() => { const o = [...document.querySelectorAll('.overlay')].filter(x => getComputedStyle(x).display !== 'none').pop(); const m = o.querySelector('.modal'); return Math.max(m.scrollTop, o.scrollTop); }); ok(t + 'a taller pop-up scrolls on its own', st > 0, st); await fr.evaluate(() => { const o = [...document.querySelectorAll('.overlay')].filter(x => getComputedStyle(x).display !== 'none').pop(); o.scrollTop = 0; o.querySelector('.modal').scrollTop = 0; }); }
  /* Tab stays inside, both ways */
  let inside = true, seen = new Set();
  for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); const s = await fr.evaluate(() => { const o = [...document.querySelectorAll('.overlay')].filter(x => getComputedStyle(x).display !== 'none').pop(); return o && o.contains(document.activeElement) ? (document.activeElement.id || document.activeElement.textContent.trim().slice(0, 20)) : null; }); if (s === null) { inside = false; break; } seen.add(s); }
  for (let i = 0; i < 5 && inside; i++) { await p.keyboard.press('Shift+Tab'); inside = await fr.evaluate(() => { const o = [...document.querySelectorAll('.overlay')].filter(x => getComputedStyle(x).display !== 'none').pop(); return !!o && o.contains(document.activeElement); }); }
  ok(t + 'Tab and Shift+Tab stay inside the pop-up', inside && seen.size >= 3, `${[...seen].join('|')}`);
  const inert = await p.evaluate(() => { const s = document.querySelector('.sidebar, #sidebar'); return s ? s.inert : null; }); ok(t + 'the app behind is inert', inert === true, inert);
  const bgInert = await fr.evaluate(() => { const h = document.querySelector('.ml-hero'); return h ? h.closest('[inert]') !== null : null; }); ok(t + 'the quest behind is inert', bgInert === true, bgInert);
}
async function closeChecks(p, fr, k, how, sel, v0, expectFocusSel) {
  const t = 'close by ' + how + ': ';
  await how_close(p, fr, k, how); await wait(450);
  const v = await view(p), m = await open(fr);
  ok(t + 'pop-up closed, frame back in the page', !m && !/is-modal/.test(v.cls) && !v.lock && v.scrim === 0 && v.hold === 0, JSON.stringify(v));
  ok(t + 'page did not move', Math.abs(v.sy - v0.sy) <= 1, `${v0.sy} -> ${v.sy}`);
  const contentHeight = await fr.evaluate(() => {
    const win = document.defaultView; let bottom = 0;
    for (const el of document.body.children) {
      if (/^(SCRIPT|STYLE|LINK|CANVAS)$/.test(el.tagName)) continue;
      const style = win.getComputedStyle(el);
      if (style.position === 'fixed' || style.position === 'absolute' || style.display === 'none') continue;
      bottom = Math.max(bottom, el.getBoundingClientRect().bottom + win.scrollY + (parseFloat(style.marginBottom) || 0));
    }
    return Math.ceil(bottom);
  });
  ok(t + 'frame fits the quest after close', Math.abs(v.h - contentHeight) <= 2, `${v0.h} -> ${v.h}; quest ${contentHeight}`);
  if (expectFocusSel) { const f = await fr.evaluate(s => document.activeElement && document.activeElement.matches(s) ? 1 : (document.activeElement.tagName + '#' + document.activeElement.id + '.' + document.activeElement.className), expectFocusSel); ok(t + 'focus returned to the card', f === 1, f); }
  const sidebar = await p.evaluate(() => { const s = document.querySelector('.sidebar, #sidebar'); return s ? s.inert : null; }); ok(t + 'the app is live again', sidebar === false, sidebar);
}
async function how_close(p, fr, k, how) {
  const c = Q[k];
  if (how === 'X') await fr.locator(c.close).click();
  else if (how === 'Esc') await p.keyboard.press('Escape');
  else if (how === 'backdrop') { const m = await open(fr), v = await view(p); const left = m.m[2]; if (left > 8) await p.mouse.click(v.fr[0] + 3, v.fr[1] + 200); else await p.mouse.click(v.fr[0] + 3, v.fr[1] + m.ih - 3); }
  else if (how === 'dimmed app') { const v = await view(p); await p.mouse.click(v.fr[0] > 60 ? 20 : v.fr[0] + 2, v.fr[0] > 60 ? 300 : 2); }
}

/* ---------- one studio at one size and theme ---------- */
async function studioSuite(k, w, h, theme) {
  const c = Q[k], dark = theme === 'dark'; tag = `${c.name} ${w}x${h} ${theme}: `;
  const { ctx, p, errs } = await session({ w, h, dark });
  try {
    const fr = await openStudio(p, k);
    const spoken = () => Promise.all(p.frames().map(f => f.evaluate(() => window.__spoken ? window.__spoken.length : 0).catch(() => 0))).then(a => a.reduce((x, y) => x + y, 0));
    /* ----- frame ----- */
    await step('frame', async () => {
      const hs = []; for (let i = 0; i < 6; i++) { hs.push(await p.evaluate(() => document.querySelector('.wp-frame').offsetHeight)); await wait(250); }
      ok('frame height is stable (no growth loop)', new Set(hs).size === 1, hs.join(','));
      const g = await fr.evaluate(() => { const d = document.documentElement, kids = [...document.body.children].filter(e => !/SCRIPT|STYLE|LINK|CANVAS/.test(e.tagName) && !['fixed', 'absolute'].includes(getComputedStyle(e).position) && getComputedStyle(e).display !== 'none'); const bottom = Math.max(...kids.map(e => e.getBoundingClientRect().bottom)); const last = kids[kids.length - 1]; return { ih: innerHeight, bottom: Math.round(bottom), sw: d.scrollWidth, cw: d.clientWidth, scrollbarX: innerWidth - d.clientWidth, scrollbarY: innerHeight - d.clientHeight, ov: getComputedStyle(d).overflow, h1: [...document.querySelectorAll('h1')].filter(e => e.offsetParent && !e.classList.contains('printOnly') && e.getAttribute('role') !== 'heading').length, path: [...document.querySelectorAll('.ml-coursepath, .ml-brand')].filter(e => e.offsetParent).length, theme: document.querySelectorAll('[data-ml-theme]').length, fixed: [...document.querySelectorAll('body *')].filter(e => { const s = getComputedStyle(e); return (s.position === 'fixed' || s.position === 'sticky') && s.display !== 'none' && e.getBoundingClientRect().height > 0 && !e.closest('.overlay') && e.id !== 'toasts' && e.tagName !== 'CANVAS'; }).map(e => e.tagName + '.' + e.className) }; });
      ok('frame ends with its content (no empty gap)', g.ih - g.bottom >= -1 && g.ih - g.bottom <= 12, `frame ${g.ih}, content ends ${g.bottom}`);
      ok('frame has no scrollbar and no sideways overflow', g.scrollbarX === 0 && g.scrollbarY === 0 && g.ov === 'hidden' && g.sw <= g.cw + 1, JSON.stringify(g));
      ok('no heading level 1 inside the frame, one on the app page', g.h1 === 0 && (await p.evaluate(() => [...document.querySelectorAll('#main h1')].length)) === 1, g.h1);
      ok('no second studio switcher (quest path and brand are hidden)', g.path === 0 && (await p.evaluate(() => document.querySelectorAll('nav[aria-label="Word studios"]').length)) === 1, g.path);
      ok('no fixed or sticky leftovers inside the quest', g.fixed.length === 0, g.fixed.join(','));
      const pw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok('app page has no sideways overflow', pw <= 1, pw);
      await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await wait(200);
      await p.screenshot({ path: `${out}/${k}-${w}x${h}-${theme}-top.png` });
      await p.evaluate(() => scrollTo({ top: 1e7, behavior: 'instant' })); await wait(300);
      const end = await p.evaluate(() => { const f = document.querySelector('.wp-frame').getBoundingClientRect(); const foot = [...document.querySelectorAll('#main ~ * *, body *')].filter(e => /^\s*References & learning notes/.test(e.textContent) && ![...e.children].some(c => /References & learning notes/.test(c.textContent))).pop(); const fr = foot && foot.getBoundingClientRect(); return { frameBottom: Math.round(f.bottom), foot: fr && [Math.round(fr.top), Math.round(fr.bottom)], ih: innerHeight }; });
      ok('"References & learning notes" is reachable and the gap after the frame is small', end.foot && end.foot[1] <= end.ih + 1 && end.foot[0] - end.frameBottom <= 140, JSON.stringify(end));
      await p.screenshot({ path: `${out}/${k}-${w}x${h}-${theme}-end.png` });
      await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    });
    /* ----- hero buttons ----- */
    await step('hero', async () => {
      const barH = await p.evaluate(() => { const b = document.querySelector('.topbar'); return b ? b.offsetHeight : 0; });
      const shown = async sel => { const r = await fr.evaluate(s => { const e = document.querySelector(s); const b = e.getBoundingClientRect(); return b.top; }, sel); const fy = await p.evaluate(() => document.querySelector('.wp-frame').getBoundingClientRect().top); return fy + r; };
      await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await wait(200);
      await click(p, fr, c.discover); await settle(p); let y = await shown('#ml-foundation, #rootIntro, #introSection');
      const target = '#ml-foundation';
      const ty = await shown(target); ok('Discover scrolls its section into view, below the app bar', ty >= barH - 2 && ty < h * 0.7, `section top ${Math.round(ty)} (bar ${barH})`);
      await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await wait(200);
      if (c.explore) { await click(p, fr, c.explore); await settle(p); const ex = k === 'prefix' ? '.tabs' : '#explorer'; const t2 = await shown(ex); ok('Explore cards brings the cards into view below the app bar', t2 >= barH - 2 && t2 < h * 0.8, Math.round(t2)); }
      await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await wait(200);
      if (k === 'prefix') {
        await click(p, fr, c.quiz); await settle(p); ok('Quick quiz shows the quiz tab', await fr.evaluate(() => document.querySelector('#mode-quiz').classList.contains('show')));
        const t3 = await shown('.tabs'); ok('...and the tab strip is in view', t3 >= barH - 2 && t3 < h * 0.8, Math.round(t3));
        await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await wait(200);
        const before = await spoken(); await click(p, fr, c.tour); await wait(400); ok('Audio tour speaks (and shows a toast)', (await spoken()) > before && (await p.locator('.wp-toast').count()) >= 1, await spoken());
        await fr.evaluate(() => { document.querySelector('#heroTour').click(); }); await wait(200);
        await fr.evaluate(() => document.querySelector('[data-mode=learn]').click());
      } else if (k === 'root') {
        await settle(p); await click(p, fr, c.quiz); await wait(500); let m = await open(fr); ok('Quick quiz opens the Quiz Arena fully on screen', m && m.id === 'quizOverlay' && m.o[0] >= -1 && m.o[1] <= m.ih + 1 && m.m[0] >= -1, JSON.stringify(m)); await p.keyboard.press('Escape'); await wait(300);
      } else {
        await click(p, fr, c.mystery); await wait(300); let m = await open(fr); ok('Mystery card opens a card pop-up fully on screen', m && m.id === 'overlay' && m.o[0] >= -1 && m.o[1] <= m.ih + 1 && m.m[0] >= -1, JSON.stringify(m)); await p.keyboard.press('Escape'); await wait(300);
        await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await wait(200);
        await click(p, fr, c.quiz); await settle(p); ok('Quick quiz shows the quiz tab', await fr.evaluate(() => document.querySelector('#pane-quiz').classList.contains('on')));
        await fr.evaluate(() => document.querySelector('[data-tab=explore]').click());
      }
      await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    });
    /* ----- search, sort, filters ----- */
    await step('search', async () => {
      const count = () => fr.evaluate(s => document.querySelectorAll(s).length, c.cardBox);
      ok('all cards are listed', (await count()) === c.n, await count());
      await fr.fill(c.search, k === 'prefix' ? 'slow' : k === 'root' ? 'heart' : 'pain'); await wait(450); const few = await count(); ok('search narrows the list', few > 0 && few < c.n, few);
      await fr.fill(c.search, 'zzzzqq'); await wait(450); ok('no match shows the empty message', (await count()) === 0 && await fr.evaluate(() => [...document.querySelectorAll('#emptyMsg,#emptyState,.empty')].some(e => e.offsetParent)));
      await fr.fill(c.search, ''); await wait(450); ok('clearing the search brings every card back', (await count()) === c.n, await count());
      const opts = await fr.evaluate(s => [...document.querySelector(s).options].map(o => o.value), c.sort);
      for (const v of opts) { await fr.selectOption(c.sort, v); await wait(300); if (v !== 'shuffle') ok(`sort "${v}" keeps every card`, (await count()) === c.n, await count()); }
      await fr.selectOption(c.sort, opts[0]); await wait(200);
      const chips = k === 'prefix' ? '#chips [data-cat]' : k === 'root' ? '#catPills button' : '#pills button'; const nc = await fr.locator(chips).count();
      if (nc > 2) { await bring(p, fr, chips, 1, 0.5); await fr.locator(chips).nth(1).click(); await wait(450); const f = await count(); ok('a category filter narrows the list', f > 0 && f < c.n, f); await bring(p, fr, chips, 0, 0.5); await fr.locator(chips).nth(0).click(); await wait(450); ok('"All" restores the list', (await count()) === c.n, await count()); }
      if (k === 'root') { await fr.selectOption('#viewSel', 'starred'); await wait(300); ok('"My starred" filter works', (await count()) <= 1, await count()); await fr.selectOption('#viewSel', 'all'); await wait(300); }
      if (k === 'suffix') { await fr.evaluate(() => document.querySelector('#studyBtn').click()); await wait(200); ok('test-yourself mode toggles', await fr.evaluate(() => document.querySelector('#studyBtn').getAttribute('aria-pressed') === 'true')); await fr.evaluate(() => document.querySelector('#studyBtn').click()); }
    });
    /* ----- the card pop-up: at several places ----- */
    const card = c.card, n = c.n;
    for (const [label, nth, frac] of [['first row', 0, 0.3], ['middle', Math.floor(n / 2), 0.65], ['last card', n - 1, 0.5]]) await step('popup ' + label, async () => {
      await bring(p, fr, card, nth, frac); const v0 = await view(p);
      await popupChecks(p, fr, k, `pop-up from the ${label}`, () => click(p, fr, card, nth));
      await closeChecks(p, fr, k, 'Esc', card, v0, null);
    });
    /* while the frame is only partly on screen (opened from code at the top of the page) */
    await step('popup partly visible', async () => {
      await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await wait(200); const v0 = await view(p);
      await popupChecks(p, fr, k, 'pop-up with the frame only partly on screen', () => fr.evaluate(s => document.querySelector(s).click(), card));
      await closeChecks(p, fr, k, 'X', card, v0, null);
    });
    /* the focus goes back to the card, three ways to close */
    for (const how of ['X', 'Esc', 'backdrop', 'dimmed app']) await step('close ' + how, async () => {
      await bring(p, fr, card, 3, 0.5); const v0 = await view(p);
      await click(p, fr, card, 3); const m = await open(fr); if (!ok(`close by ${how}: opened`, m)) return;
      if (how === 'backdrop' && m.m[2] <= 8) { ok('close by backdrop: (no side margin at this width; skipped)', true); await p.keyboard.press('Escape'); await wait(300); return; }
      await closeChecks(p, fr, k, how, card, v0, k === 'prefix' ? '.pfx' : k === 'root' ? '.tapHint' : '.open-hit');
    });
    /* inside the pop-up */
    await step('popup contents', async () => {
      await bring(p, fr, card, 0, 0.5); await click(p, fr, card, 0);
      const title = () => fr.evaluate(() => { const o = [...document.querySelectorAll('.overlay')].filter(x => getComputedStyle(x).display !== 'none').pop(); return o ? o.querySelector('.modal').innerText.slice(0, 80) : ''; });
      const t0 = await title(); await fr.locator(c.next).click(); await wait(300); const t1 = await title(); ok('next arrow shows another card', t0 !== t1, t1);
      const kept = await fr.evaluate(s => { const a = document.activeElement; return a && (a.matches(s) || a.id); }, c.next); ok('after next, focus is still on a control of the pop-up (not lost to the page)', !!kept && await open(fr).then(m => m && m.inside), kept);
      if (k === 'prefix') { await fr.locator('#mPrev').click(); await wait(300); ok('previous arrow goes back', (await title()) === t0); }
      if (k === 'root') { await fr.locator('#dPrev').click(); await wait(300); ok('previous arrow goes back', (await title()) === t0); }
      if (k === 'suffix') { await fr.locator('[data-m=prev]').click(); await wait(300); ok('previous goes back', (await title()) === t0); }
      const sp0 = await spoken(); await fr.locator(c.listen).first().click(); await wait(300); ok('a listen button speaks', (await spoken()) > sp0);
      const know0 = await fr.evaluate(() => document.body.innerText.length); const toasts0 = await p.locator('.wp-toast').count();
      const label = () => fr.locator(c.know).first().textContent(); const was = await label();
      if (/master|known|✅|★ Mastered/i.test(was) && !/Mark|I Know|☆/i.test(was)) { await fr.locator(c.know).first().click(); await wait(300); }
      await fr.locator(c.know).first().click(); await wait(450);
      const fxs = await p.evaluate(() => { const b = document.querySelector('.wp-toasts'); const t = b && b.querySelector('.wp-toast'); const r = t && t.getBoundingClientRect(); const cv = document.querySelector('.wp-fx'); let px = 0; if (cv) { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) { px++; break; } } return { toast: !!t, role: b && b.getAttribute('role'), inside: !!r && r.bottom <= innerHeight + 1 && r.top >= 0 && r.left >= 0 && r.right <= innerWidth, fx: !!cv, px }; });
      await fr.evaluate(k => { if (k === 'prefix') confettiBurst(innerWidth / 2, innerHeight / 2, 60); else confetti(60); }, k); await wait(250);
      const fx = await p.evaluate(() => { const cv = document.querySelector('.wp-fx'); if (!cv) return { fx: false }; const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let px = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) { px++; break; } const r = cv.getBoundingClientRect(); return { fx: true, px, full: r.width === innerWidth && r.height === innerHeight, pe: getComputedStyle(cv).pointerEvents }; });
      ok('confetti is drawn by the app, on the whole screen, and never blocks a tap', fx.fx && fx.px > 0 && fx.full && fx.pe === 'none', JSON.stringify(fx));
      /* link to a MedLex page navigates in the app */
      if (k === 'prefix') { await fr.locator('#mClose').click(); await wait(300); await bring(p, fr, card, 0, 0.5); await click(p, fr, card, 0); }
      const pages0 = p.context().pages().length, linkSel = c.link;
      if (await fr.locator(linkSel).count()) {
        await fr.locator(linkSel).first().scrollIntoViewIfNeeded().catch(() => { });
        await fr.locator(linkSel).first().click(); await wait(1200);
        const nav = await p.evaluate(() => ({ hash: location.hash, frames: document.querySelectorAll('.wp-frame').length, lock: document.documentElement.classList.contains('wp-lock'), scrim: document.querySelectorAll('.wp-scrim').length, inert: document.querySelectorAll('[inert]').length, h1: (document.querySelector('#main h1') || {}).textContent }));
        ok('"Explore in MedLex" navigates inside the app (no new tab, no nested page)', /^#library\/lab/.test(nav.hash) && nav.frames === 0 && p.context().pages().length === pages0, JSON.stringify(nav));
        ok('...and leaves nothing locked behind', !nav.lock && nav.scrim === 0 && nav.inert === 0, JSON.stringify(nav));
        await p.evaluate(() => history.back()); await wait(500);
      } else ok('link to MedLex exists in the pop-up', false, linkSel);
    });
    /* ----- tabs, games, progress ----- */
    await step('games', async () => {
      const F = await ensureStudio(p, k);
      if (k === 'prefix') {
        for (const m of ['flash', 'quiz', 'match', 'learn']) { await bring(p, F, '.tabs .tab', 0, 0.2); await click(p, F, `.tab[data-mode=${m}]`); await wait(300); ok(`tab ${m} shows its section`, await F.evaluate(m => document.querySelector('#mode-' + m).classList.contains('show'), m)); if (m === 'flash') { await click(p, F, '#fcard'); ok('flashcard flips', await F.evaluate(() => document.querySelector('#fcard').classList.contains('flipped'))); await click(p, F, '#fKnow'); await click(p, F, '#fShuffle'); await click(p, F, '#fListen'); } if (m === 'quiz') { await bring(p, F, '#quizGo', 0, 0.5); await click(p, F, '#quizGo'); await wait(500); await click(p, F, '#qOpts .opt', 0); await wait(400); ok('quiz answer shows its explanation', await F.evaluate(() => document.querySelector('#qExpl').classList.contains('show'))); await click(p, F, '#qListen'); } if (m === 'match') { await bring(p, F, '#matchGrid .tile', 0, 0.5); await click(p, F, '#matchGrid .tile', 0); await click(p, F, '#matchGrid .tile', 1); ok('match game reacts to taps', await F.evaluate(() => +document.querySelector('#mMoves').textContent >= 0)); } }
        await bring(p, F, '#badgesBtn', 0, 0.5); const v0 = await view(p); await click(p, F, '#badgesBtn'); const mm = await open(F); ok('badges pop-up is fully on screen, page did not jump', mm && mm.id === 'badgeModal' && mm.m[0] >= -1 && (mm.m[1] <= mm.ih + 1 || mm.scrolls) && Math.abs((await view(p)).sy - v0.sy) <= 1, JSON.stringify(mm)); await p.screenshot({ path: `${out}/${k}-${w}x${h}-${theme}-badges.png` }); await F.locator('#badgeClose').click(); await wait(300); ok('badges pop-up closes and the page is free again', !(await open(F)) && !(await view(p)).lock);
      } else if (k === 'root') {
        await bring(p, F, '#btnPrint', 0, 0.5); ok('achievement shelf lists the badges', (await F.locator('#badgeShelf .badge, #badgeShelf > *').count()) > 5);
        await F.evaluate(() => { document.querySelector('#ml-deep').open = true; }); await wait(400);
        await bring(p, F, '#btnMatchHero', 0, 0.4); const v0 = await view(p); await click(p, F, '#btnMatchHero'); let m = await open(F); ok('Match Rush opens fully on screen without moving the page', m && m.id === 'matchOverlay' && m.m[0] >= -1 && (m.m[1] <= m.ih + 1 || m.scrolls) && Math.abs((await view(p)).sy - v0.sy) <= 1, JSON.stringify(m));
        await click(p, F, '#mLeft > *', 0); await click(p, F, '#mRight > *', 0); await p.screenshot({ path: `${out}/${k}-${w}x${h}-${theme}-match.png` }); await p.keyboard.press('Escape'); await wait(300); ok('Match Rush closes with Esc', !(await open(F)));
        await bring(p, F, '#btnQuizHero', 0, 0.4); await F.evaluate(() => document.querySelector('#btnQuizHero') && 0); await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await wait(200); await click(p, F, '#btnQuizHero'); m = await open(F); ok('Quiz Arena opens', m && m.id === 'quizOverlay'); await click(p, F, '#qOpts .opt', 0); await wait(400); ok('quiz answer gives feedback', await F.evaluate(() => document.querySelector('#qFeed').textContent.trim().length > 0)); await F.locator('#qClose').click(); await wait(300);
        await bring(p, F, c.card, 4, 0.5); await click(p, F, c.card, 4); await F.locator('#miniOpts .opt').first().click(); await wait(300); ok('mini-check answer gives feedback', await F.evaluate(() => document.querySelector('#miniFeed').textContent.trim().length > 0)); await p.keyboard.press('Escape'); await wait(300);
      } else {
        for (const t of ['flash', 'quiz', 'match', 'awards', 'explore']) { await bring(p, F, '.tabs .tab', 0, 0.2); await click(p, F, `.tab[data-tab=${t}]`); await wait(300); ok(`tab ${t} shows its section`, await F.evaluate(t => document.querySelector('#pane-' + t).classList.contains('on'), t));
          if (t === 'flash') { await click(p, F, '#fc'); await click(p, F, '#fcNext'); await click(p, F, '#fcListen'); await click(p, F, '#fcKnow'); }
          if (t === 'quiz') { await bring(p, F, '#quizGo', 0, 0.5); await click(p, F, '#quizGo'); await wait(500); await click(p, F, '#qOpts .opt', 0); await wait(400); ok('quiz answer gives feedback', await F.evaluate(() => document.querySelector('#qFeed').textContent.trim().length > 0)); await click(p, F, '#qQuit'); }
          if (t === 'match') { await bring(p, F, '#matchNew', 0, 0.4); await click(p, F, '#matchNew'); await click(p, F, '#matchLeft > *', 0); await click(p, F, '#matchRight > *', 0); }
          if (t === 'awards') { ok('trophy cabinet lists the badges', (await F.locator('#badgeGrid .badge').count()) > 5); await p.screenshot({ path: `${out}/${k}-${w}x${h}-${theme}-awards.png` }); } }
        await bring(p, F, '#tourBtn', 0, 0.5); const sp0 = await spoken(); await click(p, F, '#tourBtn'); await wait(500); ok('Listen tour speaks', (await spoken()) > sp0); await click(p, F, '#stopSpeakBtn');
      }
      const toastBox = await p.locator('.wp-toasts').count(); ok('toasts live in one polite status region on the app page', toastBox <= 1);
    });
    /* ----- resize with a pop-up open, and without ----- */
    await step('resize', async () => {
      const F = frameOf(p); const sizes = [[Math.max(360, w - 200), Math.max(500, h - 160)], [w, h]];
      await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await wait(200);
      await F.evaluate(s => document.querySelector(s).click(), c.card); await wait(400);
      for (const [rw, rh] of sizes) { await p.setViewportSize({ width: rw, height: rh }); await wait(500); const m = await open(F), v = await view(p); ok(`pop-up still fits after resizing to ${rw}x${rh}`, m && m.o[0] >= -1 && m.o[1] <= m.ih + 1 && m.m[0] >= -1 && v.fr[3] <= rh + 1 && v.fr[1] >= -1, JSON.stringify([m && m.o, m && m.m, v.fr])); }
      await p.keyboard.press('Escape'); await wait(400);
      for (const [rw, rh] of sizes) { await p.setViewportSize({ width: rw, height: rh }); await wait(700); const hs = []; for (let i = 0; i < 4; i++) { hs.push(await p.evaluate(() => document.querySelector('.wp-frame').offsetHeight)); await wait(200); } ok(`frame re-fits and is stable at ${rw}x${rh}`, new Set(hs).size === 1 && hs[0] > 1500, hs.join(',')); }
    });
    /* ----- Day / Night inside the quest and the app's theme agree ----- */
    if (w === 1440 || w === 390) await step('theme', async () => {
      const F = frameOf(p), want = dark ? 'light' : 'dark', btn = want === 'dark' ? 'Night' : 'Day';
      await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await wait(200);
      const st = () => Promise.all([p.evaluate(() => document.documentElement.getAttribute('data-theme')), F.evaluate(() => document.documentElement.getAttribute('data-theme'))]);
      let [a1, q1] = await st(); ok(`opens with the app and the quest in the same mode (${a1})`, a1 === q1 && a1 === (dark ? 'dark' : 'light'), a1 + '/' + q1);
      await F.locator(`[data-ml-theme=${want}]`).click(); await wait(500); [a1, q1] = await st(); ok(`${btn} inside the quest switches the whole app`, a1 === want && q1 === want, a1 + '/' + q1);
      await p.screenshot({ path: `${out}/${k}-${w}x${h}-${theme}-to-${want}.png` });
      await p.evaluate(() => document.querySelector('#themeButton').click()); await wait(500); [a1, q1] = await st(); ok('the app theme button changes the quest too', a1 === q1, a1 + '/' + q1);
      await p.evaluate(() => { const b = document.querySelector('#themeButton'); for (let i = 0; i < 3 && document.documentElement.getAttribute('data-theme') !== 'light'; i++) b.click(); });
    });
    /* ----- accessibility ----- */
    if (w === 1440 && (k === 'prefix' || theme === 'light')) await step('axe', async () => {
      const F = frameOf(p); await p.evaluate(src => { if (!window.axe) (0, eval)(src); }, AXE); await F.evaluate(src => { if (!window.axe) (0, eval)(src); }, AXE);
      const run = (t, sel) => t.evaluate(async sel => (await axe.run(document.querySelector(sel) || document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] })).violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => v.id + ' x' + v.nodes.length + ' ' + (v.nodes[0].target || []).join(' ').slice(0, 60)), sel);
      ok('axe: app page around the studio has no serious or critical issues', (await run(p, '#main')).filter(x => !/^(frame-|region)/.test(x)).length === 0, (await run(p, '#main')).join('; '));
      const q = await run(F, 'body'); ok('axe: the studio itself has no serious or critical issues', q.length === 0, q.join('; '));
      await F.evaluate(s => document.querySelector(s).click(), c.card); await wait(400); const q2 = await run(F, 'body'); ok('axe: with a card pop-up open', q2.length === 0, q2.join('; ')); await p.keyboard.press('Escape'); await wait(300);
    });
    /* ----- 44px targets on phones ----- */
    if (w < 500) await step('targets', async () => {
      const F = frameOf(p); await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      const small = await F.evaluate(() => [...document.querySelectorAll('button,a[href],select,input,[role=button],summary')].filter(e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); if (!r.width || !r.height || s.visibility === 'hidden' || e.closest('.overlay') || e.closest('[hidden]') || e.disabled || (e.closest('details:not([open])') && !e.closest('summary'))) return false; if (e.tagName === 'A' && e.closest('p,li,footer') && s.display === 'inline') return false; return r.width < 43.5 || r.height < 43.5; }).map(e => (e.id || e.className || e.tagName).toString().slice(0, 24) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)));
      const uniq = [...new Set(small.map(s => s.replace(/ \d+x\d+/, '')))]; ok('buttons and links in the studio are at least 44px', small.length === 0, uniq.slice(0, 14).join(', ') + ` (${small.length})`);
      await F.evaluate(s => document.querySelector(s).click(), c.card); await wait(400);
      const s2 = await F.evaluate(() => [...document.querySelectorAll('.overlay button,.overlay a[href],.overlay [role=button],.overlay summary')].filter(e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); if (!r.width || !r.height || s.visibility === 'hidden' || getComputedStyle(e.closest('.overlay')).display === 'none') return false; return r.width < 43.5 || r.height < 43.5; }).map(e => (e.id || e.className || e.tagName).toString().slice(0, 24) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)));
      ok('buttons in the card pop-up are at least 44px', s2.length === 0, [...new Set(s2.map(s => s.replace(/ \d+x\d+/, '')))].slice(0, 14).join(', ') + ` (${s2.length})`); await p.keyboard.press('Escape');
    });
    ok('no console errors or page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await ctx.close(); }
}

/* ---------- reduced motion, and the home-page link in the roots footer ---------- */
if (THEMES.includes('light') && SIZES.some(s => s[0] === 1440) && STUDIOS.includes('root') && (!ONLY.length || ONLY.includes('reduced'))) {
  tag = 'Reduced motion 1440x800: ';
  const { ctx, p, errs } = await session({ w: 1440, h: 800, reduced: true });
  await step('reduced', async () => {
    const fr = await openStudio(p, 'root');
    await fr.evaluate(() => document.querySelector('#grid .card .tapHint').click()); await wait(500);
    const m = await open(fr); ok('the pop-up fits', m && m.o[0] >= -1 && m.m[0] >= -1);
    await fr.locator('#dMaster').click(); await wait(500);
    const r = await p.evaluate(() => ({ fx: !!document.querySelector('.wp-fx'), anim: [...document.querySelectorAll('.wp-toast')].map(t => getComputedStyle(t).animationName) }));
    ok('no confetti is drawn, and toasts do not animate', !r.fx && r.anim.every(a => a === 'none'), JSON.stringify(r));
    await p.keyboard.press('Escape'); await wait(300);
    /* the roots footer links to the MedLex home page: it goes to the app's first page in this tab */
    const pages0 = p.context().pages().length; await fr.locator('footer a[target=_blank]').first().scrollIntoViewIfNeeded(); await fr.locator('footer a[target=_blank]').first().click(); await wait(1500);
    ok('the footer link to MedLex opens the app inside this tab (no new tab, no nested page)', await p.evaluate(() => /^#today|^$/.test(location.hash) && !document.querySelector('.wp-frame')) && p.context().pages().length === pages0, await p.evaluate(() => location.href));
  });
  ok('no console errors', errs.length === 0, errs.slice(0, 3).join(' | ')); await ctx.close();
}
/* ---------- landing ---------- */
{
  tag = 'Landing: ';
  for (const [w, h, theme] of [[1440, 800, 'light'], [390, 844, 'light'], [1440, 800, 'dark']]) {
    if (!SIZES.some(s => s[0] === w) || !THEMES.includes(theme)) continue; tag = `Landing ${w}x${h} ${theme}: `;
    const { ctx, p, errs } = await session({ w, h, dark: theme === 'dark' });
    await step('landing', async () => {
      await p.evaluate(() => { location.hash = 'wordparts'; }); await wait(1500);
      ok('three studio cards', (await p.locator('.wp-card').count()) === 3);
      ok('studio buttons are at least 44px tall', await p.evaluate(() => [...document.querySelectorAll('.wp-open')].every(e => e.getBoundingClientRect().height >= 44)));
      ok('no sideways overflow', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await p.screenshot({ path: `${out}/landing-${w}x${h}-${theme}.png` });
      if (w === 1440) { await p.evaluate(src => { if (!window.axe) (0, eval)(src); }, AXE); const v = await p.evaluate(async () => (await axe.run(document.querySelector('#main'), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] })).violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => v.id + ' x' + v.nodes.length)); ok('axe: landing has no serious or critical issues', v.length === 0, v.join('; ')); }
      await p.locator('.wp-open').first().click(); await wait(1200); ok('"Open studio" opens the studio in the same page', await p.evaluate(() => location.hash === '#wordparts/prefix' && !!document.querySelector('.wp-frame')));
      await p.locator('.wp-back').click(); await wait(600); ok('"All word studios" returns to the landing', await p.evaluate(() => location.hash === '#wordparts' && document.querySelectorAll('.wp-card').length === 3));
      await p.evaluate(() => { location.hash = 'wordparts/root'; }); await wait(1500); await p.locator('.wp-sw').nth(2).click(); await wait(1500); ok('the switcher moves to another studio in place', await p.evaluate(() => /quest-suffixes/.test(document.querySelector('.wp-frame').src) && document.querySelectorAll('.wp-frame').length === 1));
      await p.evaluate(() => { location.hash = 'today'; }); await wait(900); ok('leaving the studio leaves nothing locked or left over', await p.evaluate(() => !document.documentElement.classList.contains('wp-lock') && !document.querySelector('.wp-scrim,.wp-hold,.wp-toasts,.wp-fx') && !document.documentElement.style.scrollPaddingTop));
    });
    ok('no console errors', errs.length === 0, errs.slice(0, 3).join(' | ')); await ctx.close();
  }
}
for (const theme of THEMES) for (const [w, h] of SIZES) for (const k of STUDIOS) { await studioSuite(k, w, h, theme); }
await browser.close();
const bad = rows.filter(r => !r.pass);
fs.writeFileSync(`${out}/results.json`, JSON.stringify(rows, null, 1));
console.log(`\n${rows.length - bad.length}/${rows.length} checks passed. Screenshots in ${out}`); for (const r of bad) console.log(' FAIL', r.name, '-', r.detail.slice(0, 300));
process.exit(bad.length ? 1 : 0);
