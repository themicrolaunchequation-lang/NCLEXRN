/* MedLex Visual Atlas: a browsable shelf of the 56 illustrated guides and one shared viewer (the Learning Studio's poster tour:
   fit the whole guide, step through it, enlarge it, annotate it, test yourself). */
(function () {
  'use strict';
  const L = window.MedlexLib; if (!L) return;
  const { D, st, save, esc, $, $$, ic, header, mount } = L;
  const CATS = ['Decode & pronounce', 'Memory cues', 'Common pitfalls', 'Directions & position', 'Body systems', 'Clinical concepts'];
  const BLURB = { 'Decode & pronounce': 'How to take a word apart and say it', 'Memory cues': 'Hooks that make word parts stick', 'Common pitfalls': 'Look-alikes and traps to avoid', 'Directions & position': 'Planes, positions and body language', 'Body systems': 'One illustrated guide per system', 'Clinical concepts': 'Terms you meet in notes and reports' };
  const order = [...D.atlas].sort((a, b) => CATS.indexOf(a.cat) - CATS.indexOf(b.cat));
  const AS = { cat: 'All', q: '', shown: 24 };
  const slideFor = p => ({
    id: p.id, type: 'visual', nav: p.title, cat: p.cat, eyebrow: p.cat, title: p.title, img: p.src, aspect: 1086 / 1448, download: 'medlex-' + p.id,
    alt: `${p.title}. ${p.outcome} The full text of this illustrated guide is listed below the viewer.`,
    regions: [{ label: 'The whole guide', text: p.outcome, rect: [0, 0, 1, 1] }, { label: 'Top: title and callouts', text: 'Start with the title, then read the labelled callouts around the illustration. Each one names a word and gives its meaning.', rect: [0, 0, 1, .5] }, { label: 'Bottom: more callouts and a question', text: `${p.caution ? 'Keep in mind: ' + p.caution + ' ' : ''}Then try the recall question below.`, rect: [0, .5, 1, .5] }],
    recall: p.q ? { q: p.q, a: p.a } : null,
    blocks: [{ title: p.title, text: p.outcome }, ...p.terms.map(t => ({ title: t.term, text: t.def })), ...(p.caution ? [{ title: 'Keep in mind', text: p.caution }] : []), ...(p.q ? [{ title: 'Recall question', text: `${p.q} ${p.a || ''}`.trim() }] : [])]
  });
  /* One guide in a clean pop-up with markup tools (poster.js). The Learning Studio tour stays available as L.openAtlasTour. */
  L.openAtlas = id => L.openPoster(order, id, {
    onClose: () => { if (/[?&]topic=/.test(location.hash)) { try { history.replaceState(null, '', '#infographics'); } catch { } } if (L.atlasRefresh) L.atlasRefresh(); }
  });
  L.openAtlasTour = id => {
    const start = Math.max(0, order.findIndex(p => p.id === id));
    return L.openStudio({
      app: 'medlex-atlas', id: 'all', title: 'Visual Atlas', kicker: `${order.length} illustrated guides`, accent: '#3557D6', accentDark: '#2541A8', accentLight: '#8FA7FF', secPerSlide: 30, slides: order.map(slideFor),
      onClose: () => { if (/[?&]topic=/.test(location.hash)) { try { history.replaceState(null, '', '#infographics'); } catch { } } try { const cur = window.HCAStudio.progress('medlex-atlas', 'all'); st.atlasLast = (order[Math.min(cur.last, order.length - 1)] || order[0]).id; save(); } catch { } if (L.atlasRefresh) L.atlasRefresh(); }
    }, { start });
  };
  const match = p => (AS.cat === 'All' || p.cat === AS.cat) && (!AS.q.trim() || (p.title + ' ' + p.outcome + ' ' + p.terms.map(t => t.term).join(' ')).toLowerCase().includes(AS.q.trim().toLowerCase()));
  const card = p => `<button type="button" class="lx-atl" data-lx="atlasopen" data-id="${p.id}"><img src="${p.thumb}" alt="" loading="lazy" width="340" height="453"><span class="lx-atl-b"><span class="lx-s">${esc(p.cat)}</span><b>${esc(p.title)}</b><em>${esc(p.outcome)}</em></span><span class="lx-atl-open" aria-hidden="true">${ic('expand')}</span></button>`;
  function draw() {
    const out = $('#lx-atl-out'); if (!out) return;
    $$('[data-lx=acat]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.c === AS.cat)));
    const list = order.filter(match), shown = list.slice(0, AS.shown);
    out.innerHTML = `<p class="lx-count" role="status">${list.length} of ${order.length} guides${AS.cat !== 'All' ? ` · ${esc(AS.cat)}` : ''}</p>` + (shown.length ? `<div class="lx-atlgrid">${shown.map(card).join('')}</div>${list.length > shown.length ? `<button type="button" class="btn lx-showmore" data-lx="amore">Show ${Math.min(24, list.length - shown.length)} more</button>` : ''}` : '<div class="lx-empty"><b>No guide matches.</b><span>Try a body system, or a word such as “prefix”.</span></div>');
  }
  function view() {
    const last = D.atlas.find(p => p.id === st.atlasLast);
    mount(header('Visual Atlas', `${order.length} illustrated guides. Open one to see it whole, zoom in, and mark it up with a pen, highlighter, notes and stickers.`, `<button type="button" class="btn primary" data-lx="atlasopen" data-id="${(last || order[0]).id}">${ic('play')}${last ? 'Continue the atlas' : 'Start the atlas'}</button>`) +
      `<div class="lx-cats" role="group" aria-label="Guide topics"><button type="button" class="lx-cat" data-lx="acat" data-c="All" aria-pressed="true"><b>All guides</b><span class="lx-s">${order.length}</span></button>${CATS.map(c => `<button type="button" class="lx-cat" data-lx="acat" data-c="${esc(c)}" aria-pressed="false"><b>${esc(c)}</b><span class="lx-s">${order.filter(p => p.cat === c).length} · ${esc(BLURB[c])}</span></button>`).join('')}</div>
      <div class="lx-bar"><label class="lx-search">${ic('search')}<span class="sr-only">Search the guides</span><input type="search" data-lx-input="asearch" placeholder="Search a topic or a word…" value="${esc(AS.q)}" autocomplete="off"></label></div><div id="lx-atl-out"></div>`);
    draw();
  }
  L.atlasRefresh = () => { if (location.hash.startsWith('#infographics')) { const b = $('.header-actions [data-lx=atlasopen]'); const last = D.atlas.find(p => p.id === st.atlasLast); if (b && last) { b.dataset.id = last.id; b.lastChild.textContent = 'Continue the atlas'; } } };
  L.act('acat', b => { AS.cat = b.dataset.c; AS.shown = 24; draw(); });
  L.act('amore', () => { AS.shown += 24; draw(); });
  L.act('asearch', t => { AS.q = t.value; AS.shown = 24; clearTimeout(AS.t); AS.t = setTimeout(draw, 100); });
  L.on('atlas', (path, params) => {
    view();
    /* deep links such as #infographics?topic=decode-1 (from My Day) open that guide straight away */
    const t = params && params.get && params.get('topic');
    if (t && order.some(p => p.id === t)) setTimeout(() => { if (location.hash.startsWith('#infographics')) L.openAtlas(t); }, 0);
  });
})();
