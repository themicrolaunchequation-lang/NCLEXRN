// MedLex lesson decks: layout audit. Opens every deck in the lesson viewer (the iframe, `html.hca-embed`), goes through every slide and every
// interactive state (reveal / recall cards / builders / detail pages / quizzes / flash cards, Reading view, Illustrated terms, overview, Edit, Notes,
// shapes, text note, Day/Night, full screen, hide tools) and reports layout faults:
//   overlap   two pieces of text (or a control and text, or a rule through text) share space           -> fails the run
//   clip      text cut off by an overflow:hidden box, or outside the slide (the stage clips it)         -> fails the run
//   broken    an image that did not load                                                                -> fails the run
//   pagescroll the frame itself scrolls (desktop sizes only)                                            -> fails the run
//   offscreen a button / field outside the visible frame                                                -> fails the run
//   scrolls   a box inside the slide that has to scroll to show its content (the content is not lost, but it is not all in view)
//   small-img a meaningful image under 56px            small-cue a term picture under 90px            small-text effective text size under 12px   -> warnings (--strict makes them fail)
// usage: node apps/tools/medlex-deck-audit.mjs <outdir> [port] [options]
//   --size 1920x940,1558x839,1366x650   viewport sizes (default: those three; add 390x844 for the phone)
//   --night                              also run the deck in Night mode (the default run is Day)
//   --night-only                         only Night
//   --decks history,nervous              only these lessons (ids as in [data-ms-open]; default all 29)
//   --slides 12,15                       only these slide numbers (1-based)
//   --no-states                          first state of each slide only (fast)
//   --chrome-only / --no-chrome          only the viewer/deck controls and pop-ups / skip them
//   --dialogs-only                       per slide only the pop-up states (Reading view, picture pop-up); the in-slide layout does not change with the window size, so the smaller sizes can use this
//   --standalone                         audit each deck opened on its own (no iframe, not embedded) at the given sizes
//   --shots N                            save screenshots of the first N faulty states (default 0)
//   --strict                             also fail on small-img / small-cue / small-text
//   --css file                           try a replacement for shared/embed.css without rebuilding (the deck's own embed.css is switched off)
//   --types                              also print a roll-up of the slide COMPONENT TYPES met (cover, cards, recall cards, reveal rows, tables, quizzes, builders, step explorers, flash-card banks, ...) so a fix is made by component, not by slide
//   --json file                          write all findings as JSON (default <outdir>/audit-<size>-<mode>.json)
// Needs the local server (node apps/tools/serve-site.mjs <port>); Playwright from /opt/node22/lib/node_modules. Exit code 1 when a failing fault is found.
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const argv = process.argv.slice(2), flags = {}, pos = [];
for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (a.startsWith('--')) { const k = a.slice(2); if (['size', 'decks', 'slides', 'shots', 'json', 'top', 'css'].includes(k)) flags[k] = argv[++i]; else flags[k] = true; } else pos.push(a); }
const out = pos[0] || '/tmp/medlex-deck-audit', port = pos[1] || 8443; fs.mkdirSync(out, { recursive: true });
const SIZES = (flags.size || '1920x940,1558x839,1366x650').split(',').map(s => s.split('x').map(Number));
const MODES = flags['night-only'] ? ['night'] : flags.night ? ['day', 'night'] : ['day'];
const ONLY_SLIDES = flags.slides ? flags.slides.split(',').map(Number) : null;
const SHOTS = +(flags.shots || 0);
const ORIGIN = 'https://medlex.healthcarecrownacademy.co.uk/';
const FAIL = new Set(['overlap', 'clip', 'broken', 'pagescroll', 'offscreen', ...(flags.strict ? ['small-img', 'small-cue', 'small-text'] : [])]);

/* ---------------------------------------------------------------- in the page (runs inside the deck frame) */
function install() {
  if (window.__aud) return;
  const A = window.__aud = {};
  const desc = el => { let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id; const c = [...el.classList].filter(x => !/^(has-term-cue|visual-enhanced|active)$/.test(x)).slice(0, 2); if (c.length) s += '.' + c.join('.'); return s; };
  const where = el => { const p = []; for (let x = el; x && p.length < 3 && x.tagName !== 'BODY'; x = x.parentElement) { if (x.classList.contains('slide') || x.id === 'stage') break; p.push(desc(x)); } return p.join(' < '); };
  const hid = v => v === 'hidden' || v === 'clip', scr = v => v === 'auto' || v === 'scroll';
  const area = r => Math.max(0, r.r - r.l) * Math.max(0, r.b - r.t);
  const inter = (a, b) => ({ l: Math.max(a.l, b.l), r: Math.min(a.r, b.r), t: Math.max(a.t, b.t), b: Math.min(a.b, b.b) });
  const csCache = new Map(); const cs = el => { let c = csCache.get(el); if (!c) { c = getComputedStyle(el); csCache.set(el, c); } return c; };
  const clipCache = new Map();
  // boxes that clip an element's content: overflow hidden/clip (hard) and scroll containers (soft); absolutely positioned content is only clipped by its containing block chain
  function clipBoxes(el) {
    if (clipCache.has(el)) return clipCache.get(el);
    const boxes = []; let mode = 'flow';
    for (let x = el; x && x !== document.documentElement; x = x.parentElement) {
      const c = cs(x); const isCB = mode === 'flow' || (mode === 'abs' && (c.position !== 'static' || c.transform !== 'none')) || (mode === 'fixed' && c.transform !== 'none');
      if (isCB) {
        if (hid(c.overflowX) || hid(c.overflowY) || scr(c.overflowX) || scr(c.overflowY)) {
          const r = x.getBoundingClientRect(), s = r.width / (x.offsetWidth || r.width || 1);
          boxes.push({ l: r.left + x.clientLeft * s, t: r.top + x.clientTop * s, r: r.left + (x.clientLeft + x.clientWidth) * s, b: r.top + (x.clientTop + x.clientHeight) * s, hard: hid(c.overflowX) || hid(c.overflowY), el: x });
        }
        mode = c.position === 'absolute' ? 'abs' : c.position === 'fixed' ? 'fixed' : 'flow';
      }
    }
    clipCache.set(el, boxes); return boxes;
  }
  A.scan = (cfg) => {
    csCache.clear(); clipCache.clear();
    const st = document.getElementById('stage'), sr = st && st.getBoundingClientRect(), sscale = st ? sr.width / (st.offsetWidth || 1280) : 1;
    const dlg = [...document.querySelectorAll('dialog[open]')].pop(), root = dlg || document.body, inDlg = !!dlg;
    const out = { issues: [], scale: +sscale.toFixed(3), dialog: dlg ? desc(dlg) : null };
    const dlgRoot = b => inDlg && (b.el === dlg || b.el.matches('.reading-view,.term-atlas-grid,.term-atlas-detail,#dialogBody,.art-inspector'));
    const sc = el => (st && st.contains(el)) ? sscale : 1, lg = (el, v) => +(v / sc(el)).toFixed(0);
    const texts = [], ctls = [], imgs = [], borders = [];
    // Skip inactive panels as subtrees; inspecting every hidden text node makes full-deck audits slow.
    // display:contents exposes children, while visibility:hidden can be overridden by a child.
    const rng = document.createRange(), walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT;
        if (node.matches('script,style,noscript,svg,option,template')) return NodeFilter.FILTER_REJECT;
        const style = cs(node);
        if (style.display !== 'contents' && (style.display === 'none' || style.opacity === '0' || style.contentVisibility === 'hidden')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_SKIP;
      }
    }); let n;
    while ((n = walker.nextNode())) {
      if (!/\S/.test(n.nodeValue)) continue;
      const el = n.parentElement; if (!el || el.closest('script,style,noscript,svg,option,template,#toast:not(.visible),[aria-hidden=true] .sr-only')) continue;
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      rng.selectNodeContents(n);
      const rects = [...rng.getClientRects()].filter(r => r.width >= 2 && r.height >= 4); if (!rects.length) continue;
      const c = cs(el), fs = parseFloat(c.fontSize), boxes = clipBoxes(el), snippet = n.nodeValue.trim().replace(/\s+/g, ' ').slice(0, 28);
      if (boxes.some(b => b.hard && (b.r - b.l <= 2 || b.b - b.t <= 2))) continue; // visually hidden (screen-reader only) text
      for (const r of rects) {
        const full = { l: r.left, r: r.right, t: r.top, b: r.bottom }, h = r.height, ink = { l: r.left, r: r.right, t: r.top + h * .18, b: r.bottom - h * .18 };
        // visible parts: hard clips always, scroll containers only outside pop-ups
        let vis = ink, hardFull = full, hardLost = null, softSeen = false;
        for (const b of boxes) {
          if (!b.hard) { if (inDlg && (b.el === dlg || b.el.matches('.reading-view,.term-atlas-grid,.term-atlas-detail,#dialogBody,.art-inspector'))) continue; softSeen = true; vis = inter(vis, b); continue; }
          vis = inter(vis, b);
          if (softSeen) continue; // scrolled out of a scroll container is not a clip
          hardFull = inter(hardFull, b); const lw = (full.r - full.l) - (hardFull.r - hardFull.l), lh = (full.b - full.t) - (hardFull.b - hardFull.t); if ((lw > 2 || lh > 3 || area(hardFull) <= 0) && !hardLost) hardLost = { el: b.el, lw: Math.max(0, lw), lh: Math.max(0, lh), all: area(hardFull) <= 0 };
        }
        texts.push({ node: n, el, snippet, full, ink, vis, fs, eff: fs * sc(el), hardLost, empty: area(vis) <= 0 });
      }
    }
    // controls
    root.querySelectorAll('button,select,input:not([type=hidden]),textarea,summary,a[href],[role=button]').forEach(el => {
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return;
      const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
      let box = { l: r.left, r: r.right, t: r.top, b: r.bottom }; for (const b of clipBoxes(el)) if (b.hard || !dlgRoot(b)) box = inter(box, b);
      if (area(box) <= 0) return; ctls.push({ el, box, full: { l: r.left, r: r.right, t: r.top, b: r.bottom } });
    });
    // images
    root.querySelectorAll('img').forEach(el => {
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return;
      const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return;
      let box = { l: r.left, r: r.right, t: r.top, b: r.bottom }; for (const b of clipBoxes(el)) if (b.hard || !dlgRoot(b)) box = inter(box, b);
      imgs.push({ el, w: r.width, h: r.height, box, full: { l: r.left, r: r.right, t: r.top, b: r.bottom }, broken: el.complete && !el.naturalWidth && !!el.getAttribute('src') });
    });
    // visible rules (borders) that could cut through other text
    root.querySelectorAll('*').forEach(el => {
      if (el.closest('svg') || el === document.body || el.tagName === 'IMG') return;
      const c = cs(el); if (c.display === 'none' || c.visibility === 'hidden') return;
      if (st && st.contains(el) && (scr(c.overflowY) || scr(c.overflowX)) && (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2) && el.clientHeight > 20) out.issues.push({ type: 'scrolls', a: desc(el), wa: where(el), by: [el.scrollWidth, el.scrollHeight, el.clientWidth, el.clientHeight].join('/') });
      const sides = []; for (const s of ['Left', 'Right', 'Top', 'Bottom']) { if (parseFloat(c['border' + s + 'Width']) >= 1 && c['border' + s + 'Style'] !== 'none' && !/rgba\(\d+, \d+, \d+, 0\)|transparent/.test(c['border' + s + 'Color'])) sides.push(s); }
      if (!sides.length || el.id === 'stage' || el.classList.contains('stage-wrap') || el.classList.contains('slide')) return;
      const r0 = el.getBoundingClientRect(); if (r0.width < 1 || r0.height < 1 || !el.checkVisibility({ checkOpacity: true })) return;
      let r = { left: r0.left, right: r0.right, top: r0.top, bottom: r0.bottom }; const pb = el.parentElement ? clipBoxes(el.parentElement) : [];
      for (const b of [...clipBoxes(el).filter(b => b.el !== el), ...pb.filter(b => !clipBoxes(el).includes(b))]) if (b.hard || !dlgRoot(b)) { r = { left: Math.max(r.left, b.l), right: Math.min(r.right, b.r), top: Math.max(r.top, b.t), bottom: Math.min(r.bottom, b.b) }; }
      if (r.right - r.left < 1 || r.bottom - r.top < 1) return;
      borders.push({ el, sides, r, r0 });
    });
    const push = (type, o) => out.issues.push({ type, ...o });
    // 1. text over text
    const T = texts.filter(t => !t.empty);
    for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
      const a = T[i], b = T[j]; if (a.node === b.node) continue;
      const x = inter(a.vis, b.vis), iw = x.r - x.l, ih = x.b - x.t; if (iw < 3 || ih < 2) continue;
      const ar = area(x); if (ar < .12 * Math.min(area(a.vis), area(b.vis))) continue;
      push('overlap', { a: desc(a.el) + ' "' + a.snippet + '"', b: desc(b.el) + ' "' + b.snippet + '"', wa: where(a.el), wb: where(b.el), iw: lg(a.el, iw), ih: lg(a.el, ih), at: [lg(a.el, x.l - (sr ? sr.left : 0)), lg(a.el, x.t - (sr ? sr.top : 0))] });
    }
    // 2. controls over controls / text
    for (let i = 0; i < ctls.length; i++) for (let j = i + 1; j < ctls.length; j++) {
      const a = ctls[i], b = ctls[j]; if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const x = inter(a.box, b.box), iw = x.r - x.l, ih = x.b - x.t; if (iw < 4 || ih < 4 || area(x) < .12 * Math.min(area(a.box), area(b.box))) continue;
      push('overlap', { a: 'ctl ' + desc(a.el) + ' "' + (a.el.textContent || a.el.getAttribute('aria-label') || '').trim().slice(0, 20) + '"', b: 'ctl ' + desc(b.el) + ' "' + (b.el.textContent || b.el.getAttribute('aria-label') || '').trim().slice(0, 20) + '"', wa: where(a.el), wb: where(b.el), iw: lg(a.el, iw), ih: lg(a.el, ih) });
    }
    for (const c of ctls) for (const t of T) {
      if (c.el.contains(t.el) || t.el.contains(c.el)) continue; if (c.el.tagName === 'SELECT' || c.el.tagName === 'INPUT') { /* value text is not a text node: still compare the box */ }
      const x = inter(c.box, t.vis), iw = x.r - x.l, ih = x.b - x.t; if (iw < 3 || ih < 2 || area(x) < .12 * area(t.vis)) continue;
      push('overlap', { a: 'ctl ' + desc(c.el) + ' "' + (c.el.textContent || c.el.getAttribute('aria-label') || '').trim().slice(0, 20) + '"', b: desc(t.el) + ' "' + t.snippet + '"', wa: where(c.el), wb: where(t.el), iw: lg(t.el, iw), ih: lg(t.el, ih) });
    }
    // 3. rules through other text
    for (const bd of borders) for (const t of T) {
      if (bd.el.contains(t.el) || t.el.contains(bd.el)) continue;
      const k = t.ink, r = bd.r; let hit = false;
      for (const s of bd.sides) {
        if (s === 'Left' || s === 'Right') { const x = s === 'Left' ? bd.r0.left : bd.r0.right; if (x < r.left - .5 || x > r.right + .5) continue; if (k.l + 1.5 < x && k.r - 1.5 > x && Math.min(k.b, r.bottom) - Math.max(k.t, r.top) > .5 * (k.b - k.t)) hit = true; }
        else { const y = s === 'Top' ? bd.r0.top : bd.r0.bottom; if (y < r.top - .5 || y > r.bottom + .5) continue; if (k.t + 1 < y && k.b - 1 > y && Math.min(k.r, r.right) - Math.max(k.l, r.left) > 6) hit = true; }
      }
      if (hit) push('overlap', { a: 'rule ' + desc(bd.el) + ' (' + bd.sides.join('') + ')', b: desc(t.el) + ' "' + t.snippet + '"', wa: where(bd.el), wb: where(t.el), iw: 0, ih: 0 });
    }
    // 3b. text over a picture (a caption inside its own figure / button is meant to sit there)
    for (const m of imgs) for (const t of T) {
      if (t.el.contains(m.el) || m.el.closest('figure,.slide-art,.hero-figure')?.contains(t.el)) continue;
      const x = inter(m.box, t.vis), iw = x.r - x.l, ih = x.b - x.t; if (iw < 3 || ih < 2 || area(x) < .12 * area(t.vis)) continue;
      push('overlap', { a: 'img ' + desc(m.el), b: desc(t.el) + ' "' + t.snippet + '"', wa: 'img ' + where(m.el), wb: where(t.el), iw: lg(t.el, iw), ih: lg(t.el, ih) });
    }
    // 4. clipped / outside
    for (const t of texts) {
      if (t.hardLost) push('clip', { a: desc(t.el) + ' "' + t.snippet + '"', wa: where(t.el), by: desc(t.hardLost.el), all: t.hardLost.all, lw: lg(t.el, t.hardLost.lw), lh: lg(t.el, t.hardLost.lh) });
    }
    for (const m of imgs) {
      let hb = m.full, by = null, softSeen = false;
      for (const b of clipBoxes(m.el)) { if (b.el === m.el) continue; if (!b.hard) { softSeen = true; continue; } if (softSeen) continue; const nb = inter(hb, b); if ((hb.r - hb.l) - (nb.r - nb.l) > 3 || (hb.b - hb.t) - (nb.b - nb.t) > 3 || area(nb) <= 0) by = by || b.el; hb = nb; }
      const lw = (m.full.r - m.full.l) - (hb.r - hb.l), lh = (m.full.b - m.full.t) - (hb.b - hb.t);
      if (by) push('clip', { a: 'img ' + desc(m.el), wa: where(m.el), by: desc(by), lw: lg(m.el, Math.max(0, lw)), lh: lg(m.el, Math.max(0, lh)), img: true });
    }
    // 5. images
    for (const m of imgs) {
      const el = m.el, alt = el.getAttribute('alt'), meaningful = alt !== null && alt.trim() !== '' && !el.closest('.slide-brand,.slide-academy,.brand,.academy,.ml-bar');
      if (m.broken) push('broken', { a: 'img ' + desc(el), wa: where(el), src: (el.getAttribute('src') || '').slice(-50) });
      const cue = el.closest('.term-cue'), sd = Math.min(m.w, m.h);
      if (meaningful && !m.broken) {
        if (cue) { if (sd < 56) push('small-img', { a: 'img ' + where(el), wa: where(el), size: [Math.round(m.w), Math.round(m.h)] }); else if (m.w < 90 && m.h < 90) push('small-cue', { a: 'img ' + where(el), wa: where(el), size: [Math.round(m.w), Math.round(m.h)] }); }
        else if (sd < 56 && !el.closest('.annotation-toolbar')) push('small-img', { a: 'img ' + where(el), wa: where(el), size: [Math.round(m.w), Math.round(m.h)] });
      }
    }
    // 6. text size
    const seen = new Set();
    for (const t of texts) { if (t.empty || t.eff >= 11.95) continue; const k = desc(t.el) + '|' + t.fs; if (seen.has(k)) continue; seen.add(k); push('small-text', { a: desc(t.el) + ' "' + t.snippet + '"', wa: where(t.el), eff: +t.eff.toFixed(1), fs: t.fs }); }
    // 7. page scroll / controls outside the frame
    const de = document.documentElement;
    out.pageScroll = de.scrollHeight > de.clientHeight + 1 || de.scrollWidth > de.clientWidth + 1; out.sh = [de.scrollWidth, de.scrollHeight, de.clientWidth, de.clientHeight];
    for (const c of ctls) { const f = c.box; if (f.r > innerWidth + 2 || f.b > innerHeight + 2 || f.l < -2 || f.t < -2) { if (c.el.closest('.sidebar,.annotation-scroll,.reading-view,.term-atlas-grid,dialog')) { if (!inDlg) { /* inside a scroller */ } continue; } push('offscreen', { a: 'ctl ' + desc(c.el) + ' "' + (c.el.textContent || c.el.getAttribute('aria-label') || '').trim().slice(0, 20) + '"', wa: where(c.el), r: [Math.round(f.l), Math.round(f.t), Math.round(f.r), Math.round(f.b)] }); } }
    out.nText = texts.length; return out;
  };
  // images lazy-load: make the visible slide's pictures real before looking
  A.settle = async () => {
    const root = [...document.querySelectorAll('dialog[open]')].pop() || document.body;
    const im = [...root.querySelectorAll('img')]; im.forEach(i => { if (i.loading === 'lazy') i.loading = 'eager'; });
    const t0 = performance.now(); while (performance.now() - t0 < 1500 && im.some(i => i.getAttribute('src') && !i.complete)) await new Promise(r => setTimeout(r, 40));
    await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  };
  // interactive states of the current slide: each action performs one step; the plan is rebuilt per slide
  A.plan = () => {
    const slide = document.querySelector('.slide:not([hidden])'); const acts = []; A.acts = acts; if (!slide) return [];
    const add = (label, run, extra) => acts.push({ label, run, ...extra });
    const click = (sel, root = slide) => { const e = root.querySelector(sel); if (e) e.click(); return !!e; };
    slide.querySelectorAll('[data-reveal]').forEach((b, i) => add('reveal part ' + (i + 1), () => b.click()));
    slide.querySelectorAll('.curated-builder').forEach((box, bi) => {
      const sel = box.querySelector('.builder-select'), n = sel ? sel.options.length : 0;
      for (let k = 0; k < n; k++) { add(`builder ${bi + 1} example ${k + 1} chosen`, () => { sel.value = String(k); sel.dispatchEvent(new Event('change', { bubbles: true })); }); add(`builder ${bi + 1} example ${k + 1} revealed`, () => box.querySelector('.build-reveal').click()); }
    });
    slide.querySelectorAll('.reveal-grid').forEach((g, gi) => g.querySelectorAll('details').forEach((d, i) => add(`reveal-grid ${gi + 1} item ${i + 1}`, () => { d.open = true; })));
    slide.querySelectorAll('.detail-deck').forEach((box, di) => {
      const pages = box.querySelectorAll('.detail-page');
      pages.forEach((pg, p) => {
        if (p > 0) add(`detail ${di + 1} page ${p + 1}`, () => box.querySelector('.detail-next').click());
        pg.querySelectorAll('.recall-card').forEach((c, ci) => add(`d${di + 1}p${p + 1} recall ${ci + 1}`, () => c.click()));
        pg.querySelectorAll('.course-quiz').forEach((q, qi) => { let m = 1; try { m = JSON.parse(q.dataset.quiz).length; } catch (e) {} for (let k = 0; k < m; k++) { add(`d${di + 1}p${p + 1} quiz ${qi + 1} q${k + 1} answered`, () => { const bs = [...q.querySelectorAll('[data-option]')]; bs.sort((a, b) => b.textContent.length - a.textContent.length); if (bs[0]) bs[0].click(); }); if (k < m - 1) add(`d${di + 1}p${p + 1} quiz ${qi + 1} next`, () => q.querySelector('.quiz-next').click()); } });
        pg.querySelectorAll('.study-bank').forEach((sb, si) => { add(`d${di + 1}p${p + 1} bank ${si + 1} revealed`, () => sb.querySelector('.bank-flip').click()); add(`d${di + 1}p${p + 1} bank ${si + 1} next`, () => sb.querySelector('.bank-next').click()); add(`d${di + 1}p${p + 1} bank ${si + 1} next revealed`, () => { const f = sb.querySelector('.bank-flip'); if (f.getAttribute('aria-expanded') !== 'true') f.click(); }); });
        pg.querySelectorAll('.sequence-lab button,.source-desk button,.model-panel button').forEach((b, bi) => { if (bi < 6) add(`d${di + 1}p${p + 1} lab button ${bi + 1}`, () => b.click()); });
      });
      add(`detail ${di + 1} Reading view`, () => box.querySelector('.detail-read').click(), { dialog: true });
    });
    slide.querySelectorAll('.course-flips .recall-card').forEach((c, i) => { if (!c.closest('.detail-deck')) add('recall card ' + (i + 1), () => c.click()); });
    slide.querySelectorAll('.course-quiz').forEach((q, qi) => { if (q.closest('.detail-deck')) return; let m = 1; try { m = JSON.parse(q.dataset.quiz).length; } catch (e) {} for (let k = 0; k < m; k++) { add(`quiz ${qi + 1} q${k + 1} answered`, () => { const bs = [...q.querySelectorAll('[data-option]')]; bs.sort((a, b) => b.textContent.length - a.textContent.length); if (bs[0]) bs[0].click(); }); if (k < m - 1) add(`quiz ${qi + 1} next`, () => q.querySelector('.quiz-next').click()); } });
    slide.querySelectorAll('.study-bank').forEach((sb, si) => { if (sb.closest('.detail-deck')) return; add(`bank ${si + 1} revealed`, () => sb.querySelector('.bank-flip').click()); add(`bank ${si + 1} next`, () => sb.querySelector('.bank-next').click()); add(`bank ${si + 1} next revealed`, () => { const f = sb.querySelector('.bank-flip'); if (f.getAttribute('aria-expanded') !== 'true') f.click(); }); });
    slide.querySelectorAll('input[type=range],input[type=number],input[type=date],select:not(.builder-select):not(.bank-category)').forEach((inp, i) => {
      if (inp.closest('.study-bank')) return;
      const set = v => { inp.value = v; inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true })); };
      if (inp.type === 'range' || inp.type === 'number') { add(`input ${i + 1} max`, () => set(inp.max || inp.value)); add(`input ${i + 1} min`, () => set(inp.min || inp.value)); }
      else if (inp.tagName === 'SELECT') [...inp.options].slice(0, 5).forEach((o, k) => add(`select ${i + 1} option ${k + 1}`, () => set(o.value)));
    });
    slide.querySelectorAll('.slide-art').forEach((b, i) => add('picture pop-up ' + (i + 1), () => b.click(), { dialog: true }));
    return acts.map(a => ({ label: a.label, dialog: !!a.dialog }));
  };
  A.run = i => { const a = A.acts[i]; a.run(); };
  A.closeDialogs = () => { let n = 0; document.querySelectorAll('dialog[open]').forEach(d => { d.close(); n++; }); return n; };
}

/* ---------------------------------------------------------------- node side */
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--ignore-certificate-errors', `--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`] });
const decksAll = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../medlex/learn/decks.json'), 'utf8')).map(d => ({ file: d.file.replace(/\.html$/, ''), slides: d.slides, title: d.title }));
let failing = 0, shotCount = 0; const allFindings = []; const typeRoll = {};
// component classes of the slide on screen (used by --types)
const compSig = () => { const s = document.querySelector('.slide.active'); if (!s) return []; const q = sel => !!s.querySelector(sel); const out = []; if (q('.hero-copy')) out.push('cover'); if (q('.quiz-intro,.quiz-panel')) out.push('quiz-slide'); for (const [k, sel] of Object.entries({ 'detail-deck': '.detail-deck', 'numbered-cards': '.course-cards', 'recall-cards': '.recall-card', 'reveal-rows': '.reveal-grid', 'station-tiles': '.era-grid', 'word-part-chips': '.word-parts', 'picture+points': '.image-split', 'table': '.course-table', 'quiz': '.course-quiz', 'word-builder': '.curated-builder', 'step-explorer': '.sequence-lab', 'flash-bank': '.study-bank', 'reference-tiles': '.course-refs', 'source-desk': '.source-desk', 'picture-panel': '.model-panel', 'map-key': '.map-key', 'callout': '.course-callout', 'term-pictures': '.term-cue' })) if (q(sel)) out.push(k); return out; };
const detailKinds = () => { const k = new Set(); document.querySelectorAll('.slide.active .detail-card').forEach(c => { k.add(c.querySelector('.recall-card') ? 'card:recall' : c.querySelector('.course-quiz') ? 'card:quiz' : c.querySelector('.curated-builder') ? 'card:builder' : c.querySelector('.sequence-lab') ? 'card:steps' : c.querySelector('.study-bank') ? 'card:flash-bank' : c.querySelector('table') ? 'card:table' : c.querySelector('.source-desk') ? 'card:sources' : c.querySelector('.model-panel') ? 'card:picture' : c.querySelector('details') ? 'card:details' : c.classList.contains('sd-card') ? 'card:numbered' : c.querySelector('.term-shelf') ? 'card:text+pictures' : 'card:text'); }); return [...k]; };

async function openViewer(ctx, deckId) {
  const p = await ctx.newPage(); await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(ORIGIN + '#learn'); await p.waitForTimeout(1800);
  for (let i = 0; i < 3; i++) { const s = p.locator('dialog[open]:not(.ml):not(.pv) button:has-text("Skip")'); if (!(await s.count())) break; await s.first().click({ force: true }).catch(() => {}); await p.waitForTimeout(300); }
  return p;
}
const deckFrame = p => p.frames().find(f => /\/medlex\/learn\/[^/]+\.html/.test(f.url()));

for (const [W, H] of SIZES) for (const mode of MODES) {
  const tag = `${W}x${H}-${mode}${flags.standalone ? '-standalone' : ''}`; const findings = []; const t0 = Date.now();
  const ctx = await br.newContext({ viewport: { width: W, height: H }, ignoreHTTPSErrors: true, colorScheme: mode === 'night' ? 'dark' : 'light', reducedMotion: 'reduce', hasTouch: W < 500 });
  let page = null;
  const decks = decksAll.filter(d => !flags.decks || flags.decks.split(',').includes(d.file));
  console.log(`=== ${tag}: ${decks.length} decks`);
  for (const d of decks) {
    let p, f; const issuesHere = []; let nStates = 0;
    try {
      if (flags.standalone) { p = await ctx.newPage(); await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' })); await p.goto(`${ORIGIN}medlex/learn/${d.file}.html`); f = p.mainFrame(); await f.waitForFunction(() => window.MedLexCourse, null, { timeout: 8000 }); }
      else {
        if (!page || page.isClosed()) page = await openViewer(ctx, d.file); p = page;
        const rid = await p.evaluate(file => { const L = window.MEDLEX_LEARN || {}; return Object.entries(L.map || {}).find(([k, v]) => v === file)?.[0] || file; }, d.file);
        const row = p.locator(`[data-ms-open="${rid}"]`).first(); if (!(await row.count())) { console.log('no row for', d.file); continue; }
        await row.click(); await p.waitForFunction(() => { const fr = document.querySelector('.ml-frame'); return fr && fr.contentWindow && fr.contentWindow.MedLexCourse; }, null, { timeout: 12000 }); await p.waitForTimeout(500); f = deckFrame(p);
      }
      if (flags.css) { await f.evaluate(css => { const l = document.querySelector('link[href*="embed.css"]'); if (l) l.disabled = true; const s = new CSSStyleSheet(); s.replaceSync(css); document.adoptedStyleSheets = [...document.adoptedStyleSheets, s]; window.dispatchEvent(new Event('resize')); }, fs.readFileSync(flags.css, 'utf8')); await p.waitForTimeout(100); }
      await f.evaluate(install);
      if (mode === 'night') { await f.evaluate(() => { if (document.documentElement.dataset.mode !== 'night') document.getElementById('modeToggle').click(); }); await p.waitForTimeout(150); }
      const total = await f.evaluate(() => document.querySelectorAll('.slide').length);
      const scan = async (slide, state) => {
        await f.evaluate(() => window.__aud.settle()); const r = await f.evaluate(() => window.__aud.scan()); nStates++;
        const bad = []; const seen = new Set();
        for (const is of r.issues) { const key = is.type + '|' + (is.a || '') + '|' + (is.b || ''); if (seen.has(key)) continue; seen.add(key); const rec = { deck: d.file, slide, state, scale: r.scale, ...is }; issuesHere.push(rec); if (FAIL.has(is.type)) bad.push(rec); }
        if (r.pageScroll && W >= 1000 && !flags.standalone) { const rec = { deck: d.file, slide, state, type: 'pagescroll', a: 'frame scrolls ' + r.sh.join('/') }; issuesHere.push(rec); bad.push(rec); }
        if (bad.length && SHOTS && shotCount < SHOTS) { shotCount++; await p.screenshot({ path: `${out}/shot-${tag}-${d.file}-s${slide}-${state.replace(/\W+/g, '_').slice(0, 30)}.png` }).catch(() => {}); }
        return r;
      };
      const closeAll = async () => { await f.evaluate(() => window.__aud.closeDialogs()); await p.waitForTimeout(60); };
      if (!flags['chrome-only']) for (let i = 0; i < total; i++) {
        if (ONLY_SLIDES && !ONLY_SLIDES.includes(i + 1)) continue;
        await f.evaluate(i => window.MedLexCourse.go(i), i); await p.waitForTimeout(120);
        if (flags.types) { const sg = (await f.evaluate(compSig)).concat(await f.evaluate(detailKinds)); for (const c of sg) (typeRoll[c] ||= { n: 0, ex: `${d.file}#${i + 1}` }).n++; }
        if (!flags['dialogs-only']) await scan(i + 1, 'initial');
        if (flags['no-states']) continue;
        const plan = await f.evaluate(() => window.__aud.plan());
        for (let k = 0; k < plan.length; k++) { if (flags['dialogs-only'] && !plan[k].dialog) { await f.evaluate(k => window.__aud.run(k), k).catch(() => {}); continue; } await f.evaluate(k => window.__aud.run(k), k).catch(e => issuesHere.push({ deck: d.file, slide: i + 1, state: plan[k].label, type: 'driver', a: String(e).slice(0, 100) })); await p.waitForTimeout(plan[k].dialog ? 160 : 70); await scan(i + 1, plan[k].label); if (plan[k].dialog) await closeAll(); }
      }
      if (!flags['no-chrome'] && !ONLY_SLIDES) {
        const at = Math.min(5, total - 1); await f.evaluate(i => window.MedLexCourse.go(i), at); await p.waitForTimeout(150);
        const chrome = [
          ['overview (slide grid)', () => document.getElementById('overviewButton').click()],
          ['edit panel', () => document.getElementById('editButton').click()],
          ['notes', () => document.getElementById('notesButton').click()],
          ['shapes', () => document.querySelector('[data-tool=shapes]').click()],
          ['clear all dialog', () => document.querySelector('[data-action=clearAll]').click()],
          ['text tool dialog', () => { document.querySelector('[data-tool=text]').click(); const l = document.getElementById('inkLayer'), r = document.getElementById('stage').getBoundingClientRect(); l.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + 200, clientY: r.top + 200, bubbles: true })); }],
          ['illustrated terms list', () => document.querySelector('.term-atlas-open') && document.querySelector('.term-atlas-open').click()],
        ];
        for (const [label, fn] of chrome) { await f.evaluate(fn).catch(() => {}); await p.waitForTimeout(250); if (await f.evaluate(() => !!document.querySelector('dialog[open]'))) await scan(at + 1, 'chrome: ' + label); await closeAll(); await f.evaluate(() => { const t = document.querySelector('[data-tool=pointer]'); t && t.click(); }); }
        // Illustrated terms: a term's own page
        await f.evaluate(() => { const o = document.querySelector('.term-atlas-open'); o && o.click(); }).catch(() => {}); await p.waitForTimeout(250);
        if (await f.evaluate(() => !!document.querySelector('.term-atlas[open] .term-atlas-card'))) { await f.evaluate(() => document.querySelector('.term-atlas[open] .term-atlas-card').click()); await p.waitForTimeout(250); await scan(at + 1, 'chrome: illustrated term page'); }
        await closeAll();
        // full screen, Day/Night, hide tools
        for (const [label, on, off] of [
          ['full screen', () => document.getElementById('focusButton').click(), () => document.getElementById('focusButton').click()],
          ['tools hidden', () => document.getElementById('annotationToggle') && document.getElementById('annotationToggle').click(), () => document.getElementById('annotationToggle') && document.getElementById('annotationToggle').click()],
          ['other mode', () => document.getElementById('modeToggle').click(), () => document.getElementById('modeToggle').click()],
        ]) { await f.evaluate(on); await p.waitForTimeout(300); await scan(at + 1, 'chrome: ' + label); await f.evaluate(off); await p.waitForTimeout(250); }
        // the slide-list itself and the pop-up open on the first and last slide
        for (const i of [0, total - 1]) { await f.evaluate(i => window.MedLexCourse.go(i), i); await p.waitForTimeout(120); await scan(i + 1, 'chrome: slide ' + (i + 1) + ' with list'); }
      }
      await p.screenshot({ path: `${out}/last-${tag}-${d.file}.png` }).catch(() => {});
    } catch (e) { issuesHere.push({ deck: d.file, slide: 0, state: 'setup', type: 'driver', a: String(e).slice(0, 300) }); }
    if (flags.standalone && p) await p.close(); else if (page && !flags.standalone) { await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(250); if (await page.locator('dialog.ml').count()) { await page.reload().catch(() => {}); page = null; await new Promise(r => setTimeout(r, 100)); } }
    const cnt = {}; for (const i of issuesHere) cnt[i.type] = (cnt[i.type] || 0) + 1;
    const fails = issuesHere.filter(i => FAIL.has(i.type) || i.type === 'driver').length; failing += fails;
    console.log(`${fails ? 'FAIL' : 'ok  '} ${d.file.padEnd(24)} states ${String(nStates).padStart(3)}  ` + Object.entries(cnt).map(([k, v]) => k + ':' + v).join(' '));
    findings.push(...issuesHere);
    fs.writeFileSync(flags.json && SIZES.length * MODES.length === 1 ? flags.json : `${out}/audit-${tag}.json`, JSON.stringify(findings, null, 1));
  }
  await ctx.close();
  fs.writeFileSync(flags.json && SIZES.length * MODES.length === 1 ? flags.json : `${out}/audit-${tag}.json`, JSON.stringify(findings, null, 1));
  allFindings.push(...findings.map(x => ({ size: `${W}x${H}`, mode, ...x })));
  // roll-up by component so a root cause shows up once
  const g = {}; for (const x of findings) { if (x.type === 'driver') continue; const k = x.type + ' | ' + [x.wa || x.a, x.wb || x.b].filter(Boolean).sort().join('  x  '); (g[k] ||= { n: 0, decks: new Set(), ex: x }).n++; g[k].decks.add(x.deck); }
  console.log(`--- ${tag} roll-up (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  for (const [k, v] of Object.entries(g).sort((a, b) => b[1].decks.size - a[1].decks.size || b[1].n - a[1].n).slice(0, +(flags.top || 40))) console.log(`${String(v.n).padStart(4)} in ${String(v.decks.size).padStart(2)} decks  ${k.slice(0, 190)}   e.g. ${v.ex.deck}#${v.ex.slide} [${v.ex.state}]`);
  for (const x of findings.filter(x => x.type === 'driver')) console.log('DRIVER', x.deck, x.slide, x.state, x.a);
}
await br.close();
if (flags.types) { console.log('--- slide component types (slides containing each)'); for (const [k, v] of Object.entries(typeRoll).sort((a, b) => b[1].n - a[1].n)) console.log(`${String(v.n).padStart(5)}  ${k.padEnd(20)} e.g. ${v.ex}`); }
const bad = failing; console.log(bad ? `\n${bad} failing findings (overlap / clip / broken / page scroll / off-screen${flags.strict ? ' / small' : ''})` : '\nno failing findings'); process.exit(bad ? 1 : 0);
