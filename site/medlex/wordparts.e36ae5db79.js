/* MedLex Word parts: its own sidebar page (#wordparts). A landing page with three studio cards (prefixes, roots, suffixes); each opens its
   interactive quest in a frame inside the app (#wordparts/prefix|root|suffix) with a switcher and a way back. Old #library/parts links redirect here. */
(function () {
  'use strict';
  const LN = window.MEDLEX_LEARN; if (!LN) return;
  if (window.MedlexWordparts) { const lib = window.MedlexLib; if (lib) { lib.oldParts = window.MedlexWordparts.oldParts; lib.on('wordparts', window.MedlexWordparts.views.wordparts); } return; }
  // A studio needs neither the slide engine nor the full Library data and tools.
  const L = window.MedlexWordparts = (() => {
    const $ = s => document.querySelector(s), views = { cleanup: [] };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;'}[c]));
    return { $, esc, views, partById: {},
      header: (title, lead) => `<header class="view-header modern-header"><div><h1 tabindex="-1">${esc(title)}</h1><p>${esc(lead)}</p></div></header>`,
      mount: (text, focus) => { views.cleanup.splice(0).forEach(f => f()); const main = $('#main'); main.innerHTML = text; if (focus) $('h1')?.focus({preventScroll:true}); scrollTo(0,0); },
      ic: () => '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
      reduced: () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.hsMotion === 'off',
      on: (name, fn) => { views[name] = fn; },
      route: (path, params) => { views.wordparts(path, params); return true; }
    };
  })();
  const { esc, $, header, mount, ic } = L;
  const KINDS = ['prefix', 'root', 'suffix'];
  /* each quest keeps its own progress in this browser (same origin as the frame): key and the lists it stores */
  const INFO = {
    prefix: { n: 66, key: 'prefixQuest66', c: '#3557D6', dk: '#8FA7FF', glyph: 'pre-', blurb: 'Small openers that change a word’s direction, size, number or time, such as hyper-, sub- and peri-.', eg: 'hyper- + tension' },
    root: { n: 60, key: 'rootQuest60v1', c: '#0F7B78', dk: '#5FD0CB', glyph: 'root', blurb: 'The core of a word: the body part, organ or process it is about, such as cardi-, hepat- and nephr-.', eg: 'cardio + megaly' },
    suffix: { n: 100, key: 'suffixQuest_v1', c: '#B4533A', dk: '#F0A58F', glyph: '-itis', blurb: 'Endings that say what happens or is done: inflammation, removal, study, a record or a procedure.', eg: 'gastr + itis' }
  };
  const norm = k => ({ p: 'prefix', r: 'root', s: 'suffix', prefix: 'prefix', prefixes: 'prefix', root: 'root', roots: 'root', suffix: 'suffix', suffixes: 'suffix' }[String(k || '').toLowerCase()] || '');
  const progress = k => { try { const s = JSON.parse(localStorage.getItem(INFO[k].key) || 'null') || {}; return { done: Math.min((s.mastered || []).length, INFO[k].n), badges: (s.badges || []).length, xp: s.xp || 0 }; } catch { return { done: 0, badges: 0, xp: 0 }; } };
  const url = k => LN.base + LN.quests[k][1] + '.html';
  const tone = k => `style="--wp-c:${INFO[k].c};--wp-dk:${INFO[k].dk}"`;
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  const prefetched = new Set();
  document.addEventListener('pointerover', warm); document.addEventListener('focusin', warm);
  function warm(event) {
    const a = event.target.closest?.('a[href^="#wordparts/"]'), k = a && norm(a.hash.split('/')[1]);
    if (!k || prefetched.has(k) || navigator.connection?.saveData) return; prefetched.add(k);
    const link = document.createElement('link'); link.rel = 'prefetch'; link.href = url(k); document.head.append(link);
  }
  function landing() {
    const card = k => {
      const p = progress(k), I = INFO[k], name = LN.quests[k][0], pct = Math.round(100 * p.done / I.n);
      const state = p.done ? `${p.done} of ${I.n} mastered` : 'Not started yet';
      return `<article class="wp-card" ${tone(k)}><div class="wp-glyph" aria-hidden="true">${esc(I.glyph)}</div>
        <h2>${esc(name)}</h2><p class="wp-blurb">${esc(I.blurb)}</p>
        <p class="wp-eg"><span>For example</span> ${esc(I.eg)}</p>
        <p class="wp-count"><b>${I.n}</b> ${esc(name.toLowerCase())} to learn</p>
        <div class="wp-prog"><div class="wp-meter" role="img" aria-label="${esc(state)}"><i style="width:${pct}%"></i></div><p>${esc(state)}${p.badges ? ` · ${plural(p.badges, 'badge')}` : ''}</p></div>
        <a class="wp-open" href="#wordparts/${k}" aria-label="Open the ${esc(name.toLowerCase())} studio">Open studio ${ic('arrow')}</a></article>`;
    };
    mount(header('Word parts', 'Medical words are built from prefixes, roots and suffixes. Pick a studio and learn them by playing.')
      + `<div class="wp-grid">${KINDS.map(card).join('')}</div><p class="wp-note">Your progress stays on this device. Each studio opens right here, and you can switch between them any time.</p>`, true);
  }

  /* ---------- the studio: a quest page in a frame inside the app ----------
   The frame is as tall as the quest, so the app page scrolls once and the frame never has a scrollbar of its own.
   While a pop-up is open (the quest tells us through HCAQuestHost.modal) the frame becomes exactly the part of itself that is on screen, fixed in place and
   scrolled so that nothing moves; the pop-up inside it is then fixed to a frame that is the size of what you see, so it always fits, scrolls on its own when it
   is taller, and never jumps the page. The page behind is locked (scroll), dimmed (scrim) and inert (keyboard and screen reader).
   Toasts and confetti are drawn here, on the screen, because a position:fixed element inside a very tall frame is not where you are looking.
   The quest's side of this is learn/shared/js/quest-embed.js (source: apps/tools/medlex-quest-embed.js). */
  const THEME_KEY = 'medlex-display-mode-v1';   /* the quests' own Day / Night setting; same origin as the frame, so the frame hears changes through "storage" */
  const html = document.documentElement, motionOff = () => L.reduced();
  const appDark = () => html.getAttribute('data-theme') === 'dark';
  const pushTheme = () => { try { localStorage.setItem(THEME_KEY, appDark() ? 'dark' : 'light'); } catch { } };
  /* Day / Night inside the quest sets the app's theme too, so the two never disagree (the app button cycles System, Light, Dark) */
  const setAppTheme = mode => { const b = document.getElementById('themeButton'); if (!b) return; for (let i = 0; i < 3 && (appDark() ? 'dark' : 'light') !== mode; i++) b.click(); };
  const topBar = () => { const b = document.querySelector('.topbar, header.hs-top, .hs-topbar'), c = b && getComputedStyle(b); return c && (c.position === 'sticky' || c.position === 'fixed') ? b.offsetHeight : 0; };
  const bottomNav = () => { const n = $('.bottom-nav'); return n && getComputedStyle(n).position === 'fixed' ? n.offsetHeight : 0; };
  const safeNodes = (src, dst) => { for (const n of src.childNodes) { if (n.nodeType === 3) dst.append(n.textContent); else if (n.nodeType === 1) { const t = n.tagName.toLowerCase(); if (/^(b|strong|i|em)$/.test(t)) { const e = document.createElement(t); safeNodes(n, e); dst.append(e); } else if (t === 'br') dst.append(document.createElement('br')); else safeNodes(n, dst); } } return dst; };
  const CONFETTI = ['#D4A445', '#3557D6', '#0F8A86', '#5FB89E', '#8B6CF0', '#E8A33D', '#FFFFFF'];
  let cur = null;   /* the studio on screen, if any */

  function studio(k) {
    const name = LN.quests[k][0];
    document.querySelectorAll('.wp-scrim,.wp-hold,.wp-toasts,.wp-fx').forEach(e => e.remove()); html.classList.remove('wp-lock');
    pushTheme();   /* before the frame loads, so it opens in the app's colours */
    mount(`<div class="wp-studio" ${tone(k)}><div class="wp-bar"><a class="wp-back" href="#wordparts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 12H5M11 6l-6 6 6 6"/></svg> All word studios</a>
      <nav class="wp-switch" aria-label="Word studios">${KINDS.map(x => `<a href="#wordparts/${x}" class="wp-sw${x === k ? ' is-on' : ''}"${x === k ? ' aria-current="page"' : ''} ${tone(x)}>${esc(LN.quests[x][0])}</a>`).join('')}</nav></div>
      <h1 class="wp-h1" tabindex="-1">${esc(name)} studio</h1>
      <div class="wp-loading" role="status">Opening ${esc(name.toLowerCase())} studio…<i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i></div>
      <iframe class="wp-frame" aria-busy="true" scrolling="no" title="${esc(name)} studio" src="${url(k)}"></iframe></div>`, true);
    const fr = $('.wp-frame'), ro = new ResizeObserver(() => fit()), seen = new WeakSet();
    const S = cur = { fr, modal: null, timer: 0, last: 0, wait: null, fx: null, toastBox: null, gone: false };
    const win = () => { try { return fr.contentWindow; } catch (e) { return null; } };
    const doc = () => { try { return fr.contentDocument; } catch (e) { return null; } };

    /* ----- size: the frame is as tall as the quest (measured from its in-flow children, so the frame's own height never feeds back) ----- */
    function fit() {
      if (S.gone || S.modal) return;
      const d = doc(); if (!d || !d.body || !d.documentElement) return;
      const v = d.defaultView; let bottom = 0;
      for (const e of d.body.children) {
        if (!seen.has(e)) { seen.add(e); ro.observe(e); }
        if (/^(SCRIPT|STYLE|LINK|CANVAS)$/.test(e.tagName)) continue;
        const cs = v.getComputedStyle(e); if (cs.position === 'fixed' || cs.position === 'absolute' || cs.display === 'none') continue;
        bottom = Math.max(bottom, e.getBoundingClientRect().bottom + v.scrollY + (parseFloat(cs.marginBottom) || 0));
      }
      if (!bottom) return;
      const h = Math.max(480, Math.ceil(bottom));
      if (Math.abs(h - S.last) > 1) { S.last = h; fr.style.height = h + 'px'; }
    }
    function watch() {
      const d = doc(); if (!d || !d.body) return;
      exitModal(); ro.disconnect(); ro.observe(d.documentElement); ro.observe(d.body); fit(); fr.setAttribute('aria-busy', 'false'); const skeleton = $('.wp-loading'); if (skeleton) skeleton.hidden = true;
    }

    /* ----- pop-up: the frame takes the part of itself that is on screen ----- */
    function place(r) {   /* r: where the frame sits in the page (its own box, or the placeholder that holds its room) */
      const vh = innerHeight; let top = Math.max(r.top, 0), bottom = Math.min(r.bottom, vh);
      if (bottom - top < 360) { top = 0; bottom = vh; }   /* only a sliver of the frame is on screen: use the whole screen */
      fr.style.setProperty('--wp-l', r.left + 'px'); fr.style.setProperty('--wp-w', r.width + 'px'); fr.style.setProperty('--wp-t', top + 'px'); fr.style.setProperty('--wp-h', (bottom - top) + 'px');
      scrollFrame(Math.max(0, top - r.top));   /* same content, same place on screen */
    }
    /* the frame's own document (not window.scrollTo: the quest has replaced that with a call to us) */
    function scrollFrame(y) { const d = doc(), e = d && (d.scrollingElement || d.documentElement); if (e) e.scrollTo({ top: y, behavior: 'instant' }); }
    function enterModal() {
      if (S.modal || S.gone) return; const w = win(), d = doc(); if (!w || !d) return;
      const r = fr.getBoundingClientRect(), hold = document.createElement('div'), scrim = document.createElement('div');
      hold.className = 'wp-hold'; hold.style.height = fr.offsetHeight + 'px'; hold.setAttribute('aria-hidden', 'true');
      scrim.className = 'wp-scrim'; scrim.setAttribute('aria-hidden', 'true');
      scrim.addEventListener('click', closeTop); scrim.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
      fr.before(hold); document.body.append(scrim);
      const inert = []; for (let n = fr; n && n !== document.body; n = n.parentElement) for (const sib of n.parentElement.children) if (sib !== n && sib !== scrim && sib !== hold && !sib.inert && !/^(SCRIPT|STYLE|LINK)$/.test(sib.tagName) && !sib.classList.contains('wp-toasts') && !sib.classList.contains('wp-fx')) { sib.inert = true; inert.push(sib); }
      S.modal = { hold, scrim, inert };
      html.classList.add('wp-lock'); fr.classList.add('is-modal'); place(r);
      d.documentElement.classList.add('hca-modal');
    }
    function exitModal() {
      const m = S.modal; if (!m) return; S.modal = null;
      m.inert.forEach(e => { e.inert = false; }); m.scrim.remove(); m.hold.remove();
      fr.classList.remove('is-modal'); html.classList.remove('wp-lock');
      ['--wp-l', '--wp-w', '--wp-t', '--wp-h'].forEach(p => fr.style.removeProperty(p));
      scrollFrame(0); const d = doc(); if (d) d.documentElement.classList.remove('hca-modal');
      fit(); const go = S.wait; S.wait = null; if (go) go();
    }
    function closeTop() { const w = win(); try { if (w && w.HCAQuest) w.HCAQuest.close(); } catch (e) { } }
    function relayout() { if (S.modal) place(S.modal.hold.getBoundingClientRect()); else fit(); }

    /* ----- toasts and confetti on the screen ----- */
    function toast(msg, ms) {
      if (!S.toastBox) { const b = document.createElement('div'); b.className = 'wp-toasts'; b.setAttribute('role', 'status'); b.setAttribute('aria-live', 'polite'); document.body.append(b); S.toastBox = b; }
      const b = S.toastBox, t = document.createElement('div'), tpl = document.createElement('template'); tpl.innerHTML = String(msg);
      t.className = 'wp-toast'; safeNodes(tpl.content, t);
      while (b.children.length >= 3) b.firstChild.remove();
      b.style.bottom = (bottomNav() + 16) + 'px'; b.append(t);
      const life = ms > 0 ? ms : Math.max(3200, 1800 + t.textContent.length * 40);
      setTimeout(() => { t.classList.add('is-out'); setTimeout(() => t.remove(), motionOff() ? 0 : 400); }, life);
      return true;
    }
    const screen = (x, y) => { const r = fr.getBoundingClientRect(); return { x: r.left + x, y: r.top + y }; };   /* x, y: viewport coordinates inside the frame (what getBoundingClientRect gives there) */
    function confetti(o) {
      if (motionOff()) return true;
      if (!S.fx) {
        const cv = document.createElement('canvas'); cv.className = 'wp-fx'; cv.setAttribute('aria-hidden', 'true'); document.body.append(cv);
        S.fx = { cv, c: cv.getContext('2d'), parts: [], on: false };
      }
      const f = S.fx, cv = f.cv, dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const r = fr.getBoundingClientRect(), top = Math.max(r.top, topBar()), n = Math.min(o.n || 60, 180), pick = () => CONFETTI[Math.floor(Math.random() * CONFETTI.length)];
      if (o.rain || typeof o.x !== 'number' || typeof o.y !== 'number') {
        const from = Math.max(0, r.left), to = Math.min(W, r.right);
        for (let i = 0; i < n; i++) f.parts.push({ x: from + Math.random() * (to - from), y: top - 10 - Math.random() * 160, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 3.5, w: 5 + Math.random() * 6, h: 7 + Math.random() * 7, c: pick(), r: Math.random() * 3, vr: (Math.random() - .5) * .3, life: 150 + Math.random() * 70 });
      } else {
        const p = screen(o.x, o.y);
        for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 2.5 + Math.random() * 6; f.parts.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3, w: 5 + Math.random() * 6, h: 7 + Math.random() * 7, c: pick(), r: Math.random() * 3, vr: (Math.random() - .5) * .3, life: 70 + Math.random() * 40 }); }
      }
      if (f.on) return true; f.on = true;
      (function frame() {
        if (S.gone) return; const c = f.c; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
        f.parts = f.parts.filter(p => p.life > 0 && p.y < H + 30);
        for (const p of f.parts) { p.x += p.vx; p.y += p.vy; p.vy += .12; p.vx *= .99; p.r += p.vr; p.life--; c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.globalAlpha = Math.min(1, p.life / 40); c.fillStyle = p.c; c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c.restore(); }
        if (f.parts.length) requestAnimationFrame(frame); else { f.on = false; c.clearRect(0, 0, W, H); }
      })();
      return true;
    }

    /* ----- what the quest may ask of us ----- */
    S.api = {
      modal: open => { open ? enterModal() : exitModal(); },
      ready: () => fit(),
      scrollTo: (top, how) => {   /* the quest scrolled itself to `top` (its own coordinates); we scroll the app page to the same place */
        const go = () => { const r = fr.getBoundingClientRect(); scrollTo({ top: Math.max(0, r.top + scrollY + top - topBar()), behavior: how === 'smooth' && !motionOff() ? 'smooth' : 'instant' }); };
        S.modal ? (S.wait = go) : go();
      },
      docY: f => { const r = fr.getBoundingClientRect(), top = Math.max(r.top, topBar(), 0), bottom = Math.min(r.bottom, innerHeight - bottomNav()); return top + f * Math.max(120, bottom - top) - r.top; },   /* a point on the visible part of the frame, in the frame's own viewport coordinates */
      toast, confetti
    };

    /* ----- wiring ----- */
    const onKey = e => { if (e.key === 'Escape' && S.modal && !e.defaultPrevented) { e.preventDefault(); closeTop(); } };
    const onStorage = e => { if (e.key === THEME_KEY && (e.newValue === 'dark' || e.newValue === 'light') && e.newValue !== (appDark() ? 'dark' : 'light')) setAppTheme(e.newValue); };
    const themeWatch = new MutationObserver(pushTheme); themeWatch.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    const teardown = () => {
      if (S.gone) return; exitModal(); S.gone = true; if (cur === S) cur = null;
      removeEventListener('resize', relayout); removeEventListener('keydown', onKey); removeEventListener('storage', onStorage); removeEventListener('hashchange', onHash); document.removeEventListener('visibilitychange', onVis);
      clearInterval(S.timer); ro.disconnect(); themeWatch.disconnect();
      if (S.toastBox) S.toastBox.remove(); if (S.fx) S.fx.cv.remove();
      html.style.removeProperty('scroll-padding-top');
      try { speechSynthesis.cancel(); } catch { }
    };
    const onHash = () => { if (!/^#?wordparts(\/|$)/.test(location.hash)) teardown(); };
    const onVis = () => { if (!document.hidden) fit(); };
    fr.addEventListener('load', watch);
    html.style.scrollPaddingTop = (topBar() + 12) + 'px';   /* links and buttons that scroll the quest into view stop below the app's top bar */
    addEventListener('resize', relayout); addEventListener('keydown', onKey); addEventListener('storage', onStorage); addEventListener('hashchange', onHash); document.addEventListener('visibilitychange', onVis);
    S.timer = setInterval(() => { if (!fr.isConnected) teardown(); else if (!document.hidden) fit(); }, 1500);
    L.views.cleanup.push(teardown);
    if (window.MedlexFrame) window.MedlexFrame.wire(fr, { sibling: slug => { const n = KINDS.find(x => LN.quests[x][1] === slug); if (n) location.hash = '#wordparts/' + n; }, leave: () => { } });
  }
  /* the quest calls these with its own window first, so a frame that is no longer on screen is ignored */
  const asks = w => { try { return !!cur && !cur.gone && cur.fr.isConnected && cur.fr.contentWindow === w; } catch (e) { return false; } };
  window.HCAQuestHost = {}; ['modal', 'ready', 'scrollTo', 'docY', 'toast', 'confetti'].forEach(m => { window.HCAQuestHost[m] = (w, ...a) => asks(w) ? cur.api[m](...a) : undefined; });

  L.on('wordparts', (path, params) => {
    const k = norm(path.split('/')[1]) || norm(params && params.get && params.get('kind'));
    if (k) studio(k); else landing();
    document.title = (k ? LN.quests[k][0] + ' studio · ' : '') + 'Word parts · MedLex';
  });
  /* old Library links: #library/parts, #library/parts?kind=root, #library/part/<id> */
  L.oldParts = (path, params) => {
    const part = (window.MedlexLib || L).partById[path.split('/')[2]], k = norm(params && params.get && params.get('kind')) || norm(part && part.k), to = 'wordparts' + (k ? '/' + k : '');
    history.replaceState(null, '', '#' + to); L.route(to, new URLSearchParams());
  };
  if (window.MedlexLib) { window.MedlexLib.oldParts = L.oldParts; window.MedlexLib.on('wordparts', L.views.wordparts); }
})();
