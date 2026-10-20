/* MedLex Word parts: its own sidebar page (#wordparts). A landing page with three studio cards (prefixes, roots, suffixes); each opens its
   interactive quest in a frame inside the app (#wordparts/prefix|root|suffix) with a switcher and a way back. Old #library/parts links redirect here. */
(function () {
  'use strict';
  const L = window.MedlexLib, LN = window.MEDLEX_LEARN; if (!L || !LN) return;
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

  function studio(k) {
    const name = LN.quests[k][0];
    mount(`<div class="wp-studio" ${tone(k)}><div class="wp-bar"><a class="wp-back" href="#wordparts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 12H5M11 6l-6 6 6 6"/></svg> All word studios</a>
      <nav class="wp-switch" aria-label="Word studios">${KINDS.map(x => `<a href="#wordparts/${x}" class="wp-sw${x === k ? ' is-on' : ''}"${x === k ? ' aria-current="page"' : ''} ${tone(x)}>${esc(LN.quests[x][0])}</a>`).join('')}</nav></div>
      <h1 class="wp-h1" tabindex="-1">${esc(name)} studio</h1>
      <iframe class="wp-frame" scrolling="no" title="${esc(name)} studio" src="${url(k)}"></iframe></div>`, true);
    /* The quest is shown at its full height, so the page scrolls once. The frame is sized to the quest, and the part of it that is on screen is passed in so its pop-ups stay in view. */
    const fr = $('.wp-frame'); let ro = null, tid = 0;
    const doc = () => { try { return fr.contentDocument; } catch (e) { return null; } };
    const fit = () => {
      const d = doc(); if (!d || !d.documentElement) return;
      const sy = d.defaultView.scrollY || 0; let content = 0;
      for (const e of d.body.children) { if (/^(SCRIPT|STYLE|CANVAS)$/.test(e.tagName)) continue; const cs = d.defaultView.getComputedStyle(e); if (cs.position === 'fixed' || cs.position === 'absolute' || cs.display === 'none') continue; content = Math.max(content, e.getBoundingClientRect().bottom + sy + (parseFloat(cs.marginBottom) || 0)); }
      const h = Math.max(520, Math.ceil(content) + 24); if (Math.abs(h - fr.offsetHeight) > 1) fr.style.height = h + 'px';
      const r = fr.getBoundingClientRect(), nav = $('.bottom-nav'), nb = nav && getComputedStyle(nav).position === 'fixed' && nav.offsetHeight ? nav.offsetHeight : 0;
      const bar = (() => { const b = document.querySelector('.topbar, header.hs-top, .hs-topbar'); const c = b && getComputedStyle(b); return c && (c.position === 'sticky' || c.position === 'fixed') ? b.offsetHeight : 0; })();
      const vt0 = Math.max(r.top, bar), top = vt0 - r.top, vis = Math.max(320, Math.min(innerHeight - nb, r.bottom) - vt0);
      d.documentElement.style.setProperty('--hca-vt', Math.min(top, Math.max(0, h - vis)) + 'px'); d.documentElement.style.setProperty('--hca-vh', vis + 'px');
    };
    const watch = () => { const d = doc(); if (!d || !d.body) return; if (ro) ro.disconnect(); ro = new ResizeObserver(fit); ro.observe(d.body); ro.observe(d.documentElement); fit(); };
    fr.addEventListener('load', () => { watch(); clearInterval(tid); tid = setInterval(fit, 400); });
    fit(); addEventListener('resize', fit); addEventListener('scroll', fit, true);
    L.views.cleanup.push(() => { removeEventListener('resize', fit); removeEventListener('scroll', fit, true); clearInterval(tid); if (ro) ro.disconnect(); });
    if (window.MedlexFrame) window.MedlexFrame.wire(fr, { sibling: slug => { const n = KINDS.find(x => LN.quests[x][1] === slug); if (n) location.hash = '#wordparts/' + n; }, leave: () => { } });
  }

  L.on('wordparts', (path, params) => {
    const k = norm(path.split('/')[1]) || norm(params && params.get && params.get('kind'));
    if (k) studio(k); else landing();
    document.title = (k ? LN.quests[k][0] + ' studio · ' : '') + 'Word parts · MedLex';
  });
  /* old Library links: #library/parts, #library/parts?kind=root, #library/part/<id> */
  L.oldParts = (path, params) => {
    const part = L.partById[path.split('/')[2]], k = norm(params && params.get && params.get('kind')) || norm(part && part.k), to = 'wordparts' + (k ? '/' + k : '');
    history.replaceState(null, '', '#' + to); L.route(to, new URLSearchParams());
  };
})();
