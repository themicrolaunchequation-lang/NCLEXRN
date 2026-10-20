/* MedLex Visual Atlas: a browsable shelf of the 56 illustrated guides and one shared viewer (the Learning Studio's poster tour:
   fit the whole guide, step through it, enlarge it, annotate it, test yourself). */
(function () {
  'use strict';
  const L = window.MedlexLib; if (!L) return;
  const { D, st, save, esc, $, $$, ic, header, mount } = L;
  const CATS = ['Decode & pronounce', 'Memory cues', 'Common pitfalls', 'Directions & position', 'Body systems', 'Clinical concepts'];
  const BLURB = { 'Decode & pronounce': 'How to take a word apart and say it', 'Memory cues': 'Hooks that make word parts stick', 'Common pitfalls': 'Look-alikes and traps to avoid', 'Directions & position': 'Planes, positions and body language', 'Body systems': 'One illustrated guide per system', 'Clinical concepts': 'Terms you meet in notes and reports' };
  const order = [...D.atlas].sort((a, b) => CATS.indexOf(a.cat) - CATS.indexOf(b.cat));
  const AS = { cat: 'All', q: '' };
  const slideFor = p => ({
    id: p.id, type: 'visual', nav: p.title, cat: p.cat, eyebrow: p.cat, title: p.title, img: p.src, aspect: 1086 / 1448, download: 'medlex-' + p.id,
    alt: `${p.title}. ${p.outcome} The full text of this illustrated guide is listed below the viewer.`,
    regions: [{ label: 'The whole guide', text: p.outcome, rect: [0, 0, 1, 1] }, { label: 'Top: title and callouts', text: 'Start with the title, then read the labelled callouts around the illustration. Each one names a word and gives its meaning.', rect: [0, 0, 1, .5] }, { label: 'Bottom: more callouts and a question', text: `${p.caution ? 'Keep in mind: ' + p.caution + ' ' : ''}Then try the recall question below.`, rect: [0, .5, 1, .5] }],
    recall: p.q ? { q: p.q, a: p.a } : null,
    blocks: [{ title: p.title, text: p.outcome }, ...p.terms.map(t => ({ title: t.term, text: t.def })), ...(p.caution ? [{ title: 'Keep in mind', text: p.caution }] : []), ...(p.q ? [{ title: 'Recall question', text: `${p.q} ${p.a || ''}`.trim() }] : [])]
  });
  /* One guide in a clean pop-up with markup tools (poster.js). The Learning Studio tour stays available as L.openAtlasTour. */
  L.openAtlas = id => L.openPoster(order, id, {
    onClose: pid => { if (pid) { st.atlasLast = pid; save(); } if (/[?&]topic=/.test(location.hash)) { try { history.replaceState(null, '', '#infographics'); } catch { } } if (L.atlasRefresh) L.atlasRefresh(); }
  });
  L.openAtlasTour = id => {
    const start = Math.max(0, order.findIndex(p => p.id === id));
    return L.openStudio({
      app: 'medlex-atlas', id: 'all', title: 'Visual Atlas', kicker: `${order.length} illustrated guides`, accent: '#3557D6', accentDark: '#2541A8', accentLight: '#8FA7FF', secPerSlide: 30, slides: order.map(slideFor),
      onClose: () => { if (/[?&]topic=/.test(location.hash)) { try { history.replaceState(null, '', '#infographics'); } catch { } } try { const cur = window.HCAStudio.progress('medlex-atlas', 'all'); st.atlasLast = (order[Math.min(cur.last, order.length - 1)] || order[0]).id; save(); } catch { } if (L.atlasRefresh) L.atlasRefresh(); }
    }, { start });
  };
  /* ---------- flip book ---------- */
  const INK = 'medlex.atlas.ink.v1';
  const inked = () => { try { const o = JSON.parse(localStorage.getItem(INK) || '{}'); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; } catch { return {}; } };
  const hasInk = id => { const a = inked()[id]; return Array.isArray(a) && a.length > 0; };
  const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
  const I = { prev: svg('M15 5l-7 7 7 7'), next: svg('M9 5l7 7-7 7'), grid: svg('M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'), pen: svg('M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z') };
  const FB = { i: Math.max(0, order.findIndex(p => p.id === st.atlasLast)), single: false, busy: false, list: order };
  const match = p => (AS.cat === 'All' || p.cat === AS.cat) && (!AS.q.trim() || (p.title + ' ' + p.outcome + ' ' + p.terms.map(t => t.term).join(' ')).toLowerCase().includes(AS.q.trim().toLowerCase()));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.hsMotion === 'off';
  const pageHTML = (p, n, side) => {
    if (!p) return `<div class="fb-pg fb-pg-${side} fb-blank"><div class="fb-end"><b>${side === 'l' ? 'The Visual Atlas' : 'End of the atlas'}</b><span>${side === 'l' ? 'Turn the page to begin.' : 'Use Contents to jump to any guide.'}</span></div></div>`;
    const has = hasInk(p.id);
    return `<figure class="fb-pg fb-pg-${side}"><div class="fb-art"><img src="${p.src}" alt="${esc(p.title)}. ${esc(p.outcome)}" draggable="false" decoding="async"></div><figcaption><span class="fb-cap"><span class="fb-cat">${esc(p.cat)}${has ? `<i class="fb-mark" title="You have marked up this page">${I.pen}Marked up</i>` : ''}</span><b>${esc(p.title)}</b></span><span class="fb-n">${n}</span><button type="button" class="fb-enl" data-lx="atlasopen" data-id="${p.id}" aria-label="Enlarge and mark up: ${esc(p.title)}">${ic('expand')}<span>Enlarge</span></button></figcaption></figure>`;
  };
  const step = () => FB.single ? 1 : 2;
  const clampI = i => { const n = FB.list.length; i = Math.max(0, Math.min(n - 1, i)); return FB.single ? i : i - (i % 2); };
  const pages = i => FB.single ? [FB.list[i]] : [FB.list[i], FB.list[i + 1]];
  const counter = () => { const n = FB.list.length; if (!n) return 'No guides'; const a = FB.i + 1, b = Math.min(n, FB.i + step()); return (FB.single || a === b ? `Page ${a}` : `Pages ${a}–${b}`) + ` of ${n}`; };
  function fill(root, i) { const [l, r] = pages(i); root.innerHTML = FB.single ? pageHTML(l, i + 1, 'r') : pageHTML(l, i + 1, 'l') + pageHTML(r, i + 2, 'r'); }
  function ctl() {
    const n = FB.list.length, pos = $('#fb-pos'); if (!pos) return;
    pos.textContent = counter();
    $('[data-lx=fbprev]').disabled = FB.i <= 0; $('[data-lx=fbnext]').disabled = FB.i + step() >= n;
    const cur = FB.list[FB.i]; if (cur) { st.atlasLast = cur.id; save(); }
  }
  function render() {
    const book = $('#fb-book'); if (!book) return;
    book.classList.toggle('is-single', FB.single); book.classList.toggle('is-empty', !FB.list.length);
    let none = book.querySelector('.fb-none'); if (none) none.remove();
    if (!FB.list.length) { $('#fb-pages').innerHTML = ''; book.insertAdjacentHTML('beforeend', '<div class="lx-empty fb-none"><b>No guide matches.</b><span>Try a body system, or a word such as “prefix”.</span></div>'); ctl(); return; }
    FB.i = clampI(FB.i); const pg = $('#fb-pages'); fill(pg, FB.i); ctl();
  }
  function turn(to) {
    to = clampI(to); if (FB.busy) { FB.queued = to; return; } if (to === FB.i || !FB.list.length) return;
    const pg = $('#fb-pages'), from = FB.i, fwd = to > from;
    if (reduced() || FB.single) { FB.i = to; fill(pg, to); ctl(); if (FB.single) { pg.classList.remove('fb-fade'); void pg.offsetWidth; if (!reduced()) pg.classList.add('fb-fade'); } return; }
    FB.busy = true;
    const oldPgs = [...pg.children], leaf = document.createElement('div'); leaf.className = 'fb-leaf ' + (fwd ? 'fwd' : 'back');
    const front = document.createElement('div'), back = document.createElement('div'); front.className = 'fb-face fb-front'; back.className = 'fb-face fb-back';
    const tmp = document.createElement('div');
    /* forward: the right page lifts and lands on the left; back: the left page lifts and lands on the right */
    const [nl, nr] = pages(to), [ol, or] = pages(from);
    if (fwd) { front.innerHTML = pageHTML(or, from + 2, 'r'); back.innerHTML = pageHTML(nl, to + 1, 'l'); tmp.innerHTML = pageHTML(nr, to + 2, 'r'); oldPgs[1].replaceWith(tmp.firstElementChild); }
    else { front.innerHTML = pageHTML(ol, from + 1, 'l'); back.innerHTML = pageHTML(nr, to + 2, 'r'); tmp.innerHTML = pageHTML(nl, to + 1, 'l'); oldPgs[0].replaceWith(tmp.firstElementChild); }
    leaf.append(front, back); pg.append(leaf);
    const done = () => { if (!FB.busy) return; FB.busy = false; FB.i = to; fill(pg, to); ctl(); const q = FB.queued; FB.queued = null; if (q != null && q !== FB.i) turn(q); };
    leaf.addEventListener('animationend', done); setTimeout(done, 900);
    FB.i = to; { const pos = $('#fb-pos'); if (pos) pos.textContent = counter(); }
  }
  function applyFilter() {
    const keep = (FB.list[FB.i] || {}).id; FB.list = order.filter(match); const k = FB.list.findIndex(p => p.id === keep); FB.i = k >= 0 ? k : 0; FB.i = FB.list.length ? clampI(FB.i) : 0; render();
    const c = $('#fb-count'); if (c) c.textContent = `${FB.list.length} of ${order.length} guides`;
  }
  function size() {
    const wrap = $('.fb'); if (!wrap) return;
    const top = wrap.getBoundingClientRect().top + scrollY, bn = document.querySelector('.bottom-nav'), bh = bn && getComputedStyle(bn).position === 'fixed' && bn.offsetHeight ? bn.offsetHeight : 0, h = Math.max(380, innerHeight - top - bh - 12);
    wrap.style.height = h + 'px';
    const stage = $('#fb-stage'); if (!stage) return;
    const single = stage.clientWidth < 600 || stage.clientWidth / Math.max(1, stage.clientHeight) < 0.95;
    if (single !== FB.single) { FB.single = single; render(); }
  }
  function toc() {
    const dlg = document.createElement('dialog'); dlg.className = 'fb-toc'; dlg.setAttribute('aria-label', 'Contents of the Visual Atlas');
    const mk = inked(), hasInkIn = (o, id) => Array.isArray(o[id]) && o[id].length > 0, cur = (FB.list[FB.i] || {}).id;
    dlg.innerHTML = `<div class="fb-toc-h"><h2>Contents</h2><button type="button" class="btn" data-fbt="x">Close</button></div><div class="fb-toc-b">${FB.list.map((p, k) => ({ p, k })).reduce((h, { p, k }, j, arr) => (j && arr[j - 1].p.cat === p.cat ? h : h + `${j ? '</div>' : ''}<h3>${esc(p.cat)}</h3><div class="fb-toc-g">`) + `<button type="button" class="fb-th" data-fbt="go" data-k="${k}"${p.id === cur ? ' aria-current="true"' : ''}><img src="${p.thumb}" alt="" loading="lazy" width="340" height="453"><span><i>${k + 1}</i> ${esc(p.title)}${hasInkIn(mk, p.id) ? ' <em class="fb-dot" title="Marked up">' + I.pen + '<span class="sr-only">Marked up</span></em>' : ''}</span></button>`, '') + '</div>'}</div>`;
    document.body.appendChild(dlg);
    const shut = () => { try { dlg.close(); } catch { } dlg.remove(); const b = $('[data-lx=fbtoc]'); b && b.focus(); };
    dlg.addEventListener('click', e => { const t = e.target.closest('[data-fbt]'); if (e.target === dlg) return shut(); if (!t) return; if (t.dataset.fbt === 'x') return shut(); FB.i = clampI(+t.dataset.k); render(); shut(); });
    dlg.addEventListener('cancel', e => { e.preventDefault(); shut(); });
    dlg.showModal(); const c = dlg.querySelector('[aria-current]') || dlg.querySelector('.fb-th'); c && c.scrollIntoView({ block: 'center' }); c && c.focus({ preventScroll: true });
  }
  function view() {
    mount(`<div class="fb"><div class="fb-bar"><div class="fb-tt"><h1 tabindex="-1">Visual Atlas</h1><span id="fb-count" class="lx-s" role="status">${order.length} of ${order.length} guides</span></div>
      <label class="fb-sel"><span class="sr-only">Topic</span><select data-lx-change="acatsel" aria-label="Topic"><option value="All">All guides (${order.length})</option>${CATS.map(c => `<option value="${esc(c)}"${AS.cat === c ? ' selected' : ''}>${esc(c)} (${order.filter(p => p.cat === c).length})</option>`).join('')}</select></label>
      <label class="lx-search fb-search">${ic('search')}<span class="sr-only">Search the guides</span><input type="search" data-lx-input="asearch" placeholder="Search a topic or a word…" value="${esc(AS.q)}" autocomplete="off"></label>
      <button type="button" class="btn fb-toc-btn" data-lx="fbtoc" aria-haspopup="dialog" aria-label="Contents: jump to a guide">${I.grid}<span>Contents</span></button></div>
      <div class="fb-stage" id="fb-stage" tabindex="-1"><div class="fb-book" id="fb-book" role="group" aria-roledescription="book" aria-label="Visual Atlas flip book. Use the left and right arrow keys to turn the page."><div class="fb-spine" aria-hidden="true"></div><div class="fb-pages" id="fb-pages"></div></div></div>
      <div class="fb-nav"><button type="button" class="btn fb-pb" data-lx="fbprev" aria-label="Previous page">${I.prev}<span>Previous</span></button><span class="fb-pos" id="fb-pos" role="status" aria-live="polite"></span><button type="button" class="btn fb-pb" data-lx="fbnext" aria-label="Next page"><span>Next</span>${I.next}</button></div></div>`);
    AS.q = AS.q || ''; FB.list = order.filter(match); const k = FB.list.findIndex(p => p.id === st.atlasLast); FB.i = Math.max(0, k);
    size(); applyFilter(); size(); requestAnimationFrame(size);
    if (FB.ro) FB.ro.disconnect(); FB.ro = new ResizeObserver(() => { if ($('.fb')) size(); }); FB.ro.observe(document.body); FB.ro.observe($('.fb-bar'));
    const stage = $('#fb-stage'); let sx = null, sy = 0;
    stage.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; sx = e.clientX; sy = e.clientY; });
    stage.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) turn(FB.i + (dx < 0 ? step() : -step())); });
    stage.addEventListener('pointercancel', () => { sx = null; });
  }
  L.atlasRefresh = () => { if ($('.fb')) { const cur = (FB.list[FB.i] || {}).id, id = st.atlasLast, k = FB.list.findIndex(p => p.id === id); if (k >= 0 && id !== cur) FB.i = clampI(k); render(); } };
  L.act('acatsel', t => { AS.cat = t.value; applyFilter(); });
  L.act('fbprev', () => turn(FB.i - step()));
  L.act('fbnext', () => turn(FB.i + step()));
  L.act('fbtoc', () => toc());
  L.act('asearch', t => { AS.q = t.value; clearTimeout(AS.t); AS.t = setTimeout(applyFilter, 120); });
  addEventListener('resize', () => { if ($('.fb')) size(); });
  document.addEventListener('keydown', e => {
    if (!$('.fb') || !location.hash.startsWith('#infographics') || document.querySelector('dialog[open]') || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target, tag = t && t.tagName; if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    const k = e.key, base = FB.busy && FB.queued != null ? FB.queued : FB.i;
    if (k === 'ArrowRight' || k === 'PageDown') { e.preventDefault(); turn(base + step()); } else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); turn(base - step()); } else if (k === 'Home') { e.preventDefault(); turn(0); } else if (k === 'End') { e.preventDefault(); turn(FB.list.length - 1); }
  });
  L.on('atlas', (path, params) => {
    const t0 = params && params.get && params.get('topic'); if (t0 && order.some(p => p.id === t0)) { st.atlasLast = t0; }
    view();
    /* deep links such as #infographics?topic=decode-1 (from My Day) open that guide straight away */
    const t = params && params.get && params.get('topic');
    if (t && order.some(p => p.id === t)) setTimeout(() => { if (location.hash.startsWith('#infographics')) L.openAtlas(t); }, 0);
  });
})();
