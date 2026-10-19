/* Healthcare Crown Academy Learning Studio: a slide-journey player with an annotation layer.
   Shared by Carecraft (lessons) and MedLex (modules). No dependencies; CSP-safe (no eval, no inline handlers).
   HCAStudio.open(deck, opts) -> controller.  Deck/slide shapes are documented at the top of each renderer below. */
(function (global) {
  'use strict';
  const d = document;
  const $ = (s, r) => (r || d).querySelector(s), $$ = (s, r) => [...(r || d).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } } };

  const IC = {
    cursor: 'M5 3l14 7-6 2-2 6z', pen: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
    marker: 'M4 20l1-4 10-10 3 3-10 10-4 1zM15 6l3-3 3 3-3 3', highlighter: 'M9 11l-6 6v3h9l3-3M22 5.5L18.5 2 9 11.5l3.5 3.5z',
    eraser: 'M7 21h13M5.5 13.5l7-7a2 2 0 0 1 3 0l3 3a2 2 0 0 1 0 3L11 20H8l-2.5-2.5a2 2 0 0 1 0-3z', shapes: 'M3 3h8v8H3zM18 13a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z',
    text: 'M4 7V4h16v3M9 20h6M12 4v16', laser: 'M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1',
    undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3', redo: 'M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3', trash: 'M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', eyeoff: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM3 3l18 18',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z', notes: 'M4 4h16v13H8l-4 4zM8 9h8M8 13h5', full: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    close: 'M6 6l12 12M18 6L6 18', left: 'M15 6l-6 6 6 6', right: 'M9 6l6 6-6 6', check: 'M5 12.5l4.5 4.5L19 7', bulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z',
    play: 'M7 4l13 8-13 8z', expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7', down: 'M12 3v12M7 10l5 5 5-5M4 21h16', zin: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3M11 8v6M8 11h6', zout: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3M8 11h6',
    fit: 'M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3', arrow: 'M5 12h14M13 6l6 6-6 6', sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2', layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5M12 17.5h.01',
    image: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21', flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
    book: 'M4 19.5V5a2 2 0 0 1 2-2h14v16H6.5A2.5 2.5 0 0 0 4 21.5M4 19.5A2.5 2.5 0 0 1 6.5 17H20', target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    pencil: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', repeat: 'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3'
  };
  const ic = (n, c) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${c ? ` class="${c}"` : ''}><path d="${IC[n] || IC.sparkle}"/></svg>`;

  const PEN_COLORS = ['#10253A', '#E5484D', '#2F6BFF', '#1FA971', '#8B5CF6', '#F59E0B', '#FFFFFF'];
  const HL_COLORS = ['#FFE45C', '#8DF0B2', '#FF9EC4', '#8CD3FF', '#FFC27A', '#D6B8FF'];
  const SIZES = { pen: [2.5, 4.5, 8], marker: [6, 10, 16], highlighter: [14, 22, 34], shape: [3, 5, 8], eraser: [16, 28, 46] };
  const LAND = { w: 1280, h: 720 }, PORT = { w: 640, h: 1000 };

  /* ---------- stroke geometry ---------- */
  function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = clamp(t, 0, 1); const x = ax + t * dx, y = ay + t * dy; return Math.hypot(px - x, py - y); }
  function bbox(it) {
    if (it.t === 'text') return [it.x, it.y, it.x + 260, it.y + 70];
    if (it.t === 'shape') { const [a, b] = it.p; return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; }
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of it.p) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; } return [x0, y0, x1, y1];
  }
  function hit(it, x, y, r) {
    const b = bbox(it), m = r + (it.w || 4); if (x < b[0] - m || x > b[2] + m || y < b[1] - m || y > b[3] + m) return false;
    if (it.t === 'text') return true;
    if (it.t === 'shape') {
      const [a, c] = it.p;
      if (it.k === 'rect') { const x0 = Math.min(a[0], c[0]), x1 = Math.max(a[0], c[0]), y0 = Math.min(a[1], c[1]), y1 = Math.max(a[1], c[1]); return segDist(x, y, x0, y0, x1, y0) < m || segDist(x, y, x1, y0, x1, y1) < m || segDist(x, y, x1, y1, x0, y1) < m || segDist(x, y, x0, y1, x0, y0) < m; }
      if (it.k === 'ellipse') { const cx = (a[0] + c[0]) / 2, cy = (a[1] + c[1]) / 2, rx = Math.abs(c[0] - a[0]) / 2 || 1, ry = Math.abs(c[1] - a[1]) / 2 || 1, v = Math.hypot((x - cx) / rx, (y - cy) / ry); return Math.abs(v - 1) * Math.min(rx, ry) < m; }
      return segDist(x, y, a[0], a[1], c[0], c[1]) < m;
    }
    for (let i = 1; i < it.p.length; i++) if (segDist(x, y, it.p[i - 1][0], it.p[i - 1][1], it.p[i][0], it.p[i][1]) < m) return true;
    return it.p.length === 1 && Math.hypot(x - it.p[0][0], y - it.p[0][1]) < m;
  }
  function path(ctx, pts) {
    ctx.beginPath(); if (!pts.length) return; ctx.moveTo(pts[0][0], pts[0][1]);
    if (pts.length === 1) { ctx.lineTo(pts[0][0] + .01, pts[0][1] + .01); return; }
    for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
    const l = pts[pts.length - 1]; ctx.lineTo(l[0], l[1]);
  }
  function paint(ctx, it) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = it.c; ctx.fillStyle = it.c; ctx.lineWidth = it.w;
    if (it.t === 'shape') {
      const [a, b] = it.p; ctx.beginPath();
      if (it.k === 'rect') ctx.rect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
      else if (it.k === 'ellipse') ctx.ellipse((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.abs(b[0] - a[0]) / 2, Math.abs(b[1] - a[1]) / 2, 0, 0, Math.PI * 2);
      else {
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
        if (it.k === 'arrow') { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), h = 14 + it.w * 2; ctx.moveTo(b[0], b[1]); ctx.lineTo(b[0] - h * Math.cos(ang - .45), b[1] - h * Math.sin(ang - .45)); ctx.moveTo(b[0], b[1]); ctx.lineTo(b[0] - h * Math.cos(ang + .45), b[1] - h * Math.sin(ang + .45)); }
      }
      ctx.stroke(); return;
    }
    if (it.t === 'hl') { ctx.lineCap = 'butt'; ctx.lineJoin = 'round'; }
    path(ctx, it.p); ctx.stroke();
  }

  /* ---------- progress store ---------- */
  const key = (app, id) => `${app}.studio.v1.${id}`;
  function load(app, id) { try { return JSON.parse(store.get(key(app, id)) || 'null') || {}; } catch { return {}; } }
  function progress(app, id) { const p = load(app, id), n = p.total || 0, v = (p.visited || []).length; return { started: !!p.started, last: p.last || 0, at: p.at || 0, done: !!p.done, total: n, visited: v, pct: n ? Math.round(100 * Math.min(v, n) / n) : 0, checks: p.checks || {}, hasInk: Object.values(p.ink || {}).some(a => a && a.length) }; }

  /* ---------- slide renderers (all return HTML strings; logical canvas 1280x720 or 640x1000) ---------- */
  const r = (html, i) => `<div class="hst-r" style="--i:${i}">${html}</div>`;
  function chips(meta) { return (meta || []).map(m => `<span class="hst-chip">${m.icon ? ic(m.icon) : ''}${esc(m.text)}</span>`).join(''); }
  function artHTML(a, cls) { return a && a.src ? `<div class="hst-art ${cls || ''}"><img src="${esc(a.src)}" alt="${esc(a.alt || '')}" decoding="async"></div>` : ''; }

  /* a saved answer is matched by its text, so a reshuffled option order never turns it into a different choice */
  const ckIdx = (s, rec) => { if (!rec) return null; const k = rec.ct != null ? s.options.indexOf(rec.ct) : -1; return k >= 0 ? k : rec.choice; };

  const T = {
    cover(s, S) {
      const rs = S.resume, resume = rs > 0 && rs < S.deck.slides.length - 1;
      return `<div class="hst-s hst-cover"><div class="hst-aurora" aria-hidden="true"><i></i><i></i></div><div class="hst-cv-copy">
        ${r(`<span class="hst-kicker">${esc(s.kicker || '')}</span>`, 0)}${r(`<h1${String(s.title).length > 34 ? ' class="is-long"' : ''}>${esc(s.title)}</h1>`, 1)}${r(`<p class="hst-sub">${esc(s.subtitle || '')}</p>`, 2)}
        ${r(`<div class="hst-chips">${chips(s.meta)}</div>`, 3)}
        ${s.outcomes && s.outcomes.length ? r(`<div class="hst-outcomes"><b>By the end you can</b><ul>${s.outcomes.map(o => `<li>${ic('check')}<span>${esc(o)}</span></li>`).join('')}</ul></div>`, 4) : ''}
        ${r(`<div class="hst-cta"><button type="button" class="hst-btn is-primary" data-act="next">${esc(s.cta || 'Begin the journey')}${ic('arrow')}</button>${resume ? `<button type="button" class="hst-btn is-ghost" data-act="go" data-i="${rs}">Pick up at slide ${rs + 1}</button>` : ''}</div>`, 5)}
      </div><div class="hst-cv-art" aria-hidden="${s.art ? 'false' : 'true'}">${s.art && s.art.src ? `<div class="hst-poster-card"><img src="${esc(s.art.src)}" alt="${esc(s.art.alt || '')}" decoding="async"></div>` : ''}</div></div>`;
    },
    idea(s) {
      const cards = (s.cards || []).map(c => `<div class="hst-card"><span class="hst-card-l">${c.icon ? ic(c.icon) : ''}${esc(c.label)}</span><p>${esc(c.text)}</p></div>`).join('');
      return `<div class="hst-s hst-idea">${s.n ? `<div class="hst-bignum" aria-hidden="true">${esc(String(s.n).padStart(2, '0'))}</div>` : ''}<div class="hst-id-copy">
        ${r(`<span class="hst-eyebrow">${esc(s.eyebrow || '')}</span>`, 0)}
        ${r(`<h2>${esc(s.title)}</h2>`, 1)}${r(`<p class="hst-p">${esc(s.body)}</p>`, 2)}
        ${s.more ? r(`<p class="hst-p hst-more">${esc(s.more)}</p>`, 3) : ''}</div>
        <div class="hst-id-side">${s.pull ? r(`<blockquote class="hst-pull">${s.art && s.art.src ? `<span class="hst-pull-art" style="background-image:url('${esc(s.art.src)}')"></span>` : ''}${s.pullLabel ? `<span class="hst-pull-l">${esc(s.pullLabel)}</span>` : ''}<span class="hst-pull-q">${esc(s.pull)}</span></blockquote>`, 2) : ''}${cards ? r(`<div class="hst-cards">${cards}</div>`, 3) : ''}</div>${s.rail ? `<ol class="hst-rail${s.rail.length > 4 ? ' is-many' : ''}" aria-label="Steps in this journey">${s.rail.map((t, i) => `<li class="${i + 1 === s.n ? 'is-on' : i + 1 < s.n ? 'is-past' : ''}"${i + 1 === s.n ? ' aria-current="step"' : ''}><b>${i + 1}</b><span>${esc(t)}</span></li>`).join('')}</ol>` : ''}</div>`;
    },
    notes(s) {
      return `<div class="hst-s hst-notes-s"><div class="hst-hd">${r(`<span class="hst-eyebrow">${esc(s.eyebrow || '')}</span><h2>${esc(s.title)}</h2>${s.lead ? `<p class="hst-lead">${esc(s.lead)}</p>` : ''}`, 0)}</div>
        <div class="hst-pair">${(s.items || []).map((it, i) => r(`<section class="hst-pcard"><span class="hst-pcard-k">${esc(it.label)}</span><p>${esc(it.text)}</p></section>`, i + 1)).join('')}</div>
        ${s.chips && s.chips.length ? r(`<div class="hst-strip">${s.chips.map(c => `<div><b>${esc(c.label)}</b><span>${esc(c.text)}</span></div>`).join('')}</div>`, 4) : ''}</div>`;
    },
    terms(s, S) {
      const st = S.ss[s.id] || (S.ss[s.id] = { flipped: {} });
      return `<div class="hst-s hst-terms"><div class="hst-hd">${r(`<span class="hst-eyebrow">${esc(s.eyebrow || 'Key words')}</span><h2>${esc(s.title)}</h2>${s.lead ? `<p class="hst-lead">${esc(s.lead)}</p>` : ''}`, 0)}</div>
        <div class="hst-tgrid">${(s.terms || []).map((t, i) => { const on = !!st.flipped[i]; return r(`<button type="button" class="hst-term${on ? ' is-on' : ''}" data-act="flip" data-i="${i}" aria-pressed="${on}"><span class="hst-term-parts">${(t.parts || [{ t: t.term }]).map(p => `<i class="k-${esc(p.k || 'r')}"><b>${esc(p.t)}</b>${on && p.m ? `<span class="hst-sm">${esc(p.m)}</span>` : ''}</i>`).join('')}</span><span class="hst-term-name">${esc(t.term)}</span><span class="hst-term-def">${on ? esc(t.plain || '') : 'Tap to decode'}</span></button>`, i + 1); }).join('')}</div></div>`;
    },
    visual(s, S) {
      const v = S.view(s), reg = s.regions || [], cur = reg[v.step] || {}, blocks = s.blocks || [];
      const tall = (s.aspect || 1) < .9;
      return `<div class="hst-s hst-visual${tall ? ' is-tall' : ''}"><div class="hst-vhead">${r(`<span class="hst-eyebrow">${esc(s.eyebrow || 'Visual guide')}</span><h2>${esc(s.title)}</h2>`, 0)}</div>
        <div class="hst-vbody"><div class="hst-pwin" data-pwin tabindex="0" aria-label="Infographic. Use the view buttons to tour it, or drag to pan."><img class="hst-pimg is-raw" data-pimg src="${esc(s.img)}" alt="${esc(s.alt || s.title)}" draggable="false" decoding="async"><div class="hst-spot" data-spot aria-hidden="true"></div><div class="hst-pctl" role="group" aria-label="Poster controls">
            <button type="button" data-act="vprev" aria-label="Previous view">${ic('left')}</button><span data-vstat>${v.step + 1} / ${reg.length}</span><button type="button" data-act="vnext" aria-label="Next view">${ic('right')}</button><i></i>
            <button type="button" data-act="vzout" aria-label="Zoom out">${ic('zout')}</button><button type="button" data-act="vzin" aria-label="Zoom in">${ic('zin')}</button><button type="button" data-act="vfit" aria-label="Fit whole poster">${ic('fit')}</button><button type="button" data-act="venlarge" aria-label="Enlarge the infographic">${ic('expand')}</button><button type="button" data-act="vsave" aria-label="Save this view as an image">${ic('down')}</button></div></div>
          <div class="hst-vside">
            <div class="hst-vtitle"><span class="hst-eyebrow">${esc(s.eyebrow || 'Visual guide')}</span><h2>${esc(s.title)}</h2></div>
            <div class="hst-vcap" data-vcap><span class="hst-eyebrow">${esc(String(cur.label || '').replace(/^\d+\.\s*/, ''))}</span><p>${esc(cur.text || '')}</p></div>
            <div class="hst-tour" role="group" aria-label="Tour the infographic">${reg.map((g, i) => `<button type="button" class="hst-tour-i${i === v.step ? ' is-on' : ''}" data-act="vgo" data-i="${i}"><b>${i + 1}</b><span>${esc(String(g.label).replace(/^\d+\.\s*/, ''))}</span></button>`).join('')}</div>
            ${s.recall ? `<details class="hst-recall"><summary>Test yourself: ${esc(s.recall.q)}</summary><p>${esc(s.recall.a)}</p></details>` : ''}
            ${blocks.length ? `<details class="hst-tx"><summary>Read the text of this poster</summary>${blocks.map(b => `<h4>${esc(b.title)}</h4><p>${esc(b.text)}</p>`).join('')}</details>` : ''}
          </div></div></div>`;
    },
    compare(s, S) {
      const st = S.ss[s.id] || (S.ss[s.id] = { shown: false });
      return `<div class="hst-s hst-compare"><div class="hst-hd">${r(`<span class="hst-eyebrow">${esc(s.eyebrow || 'Worked example')}</span><h2>${esc(s.title)}</h2>`, 0)}</div>
        ${r(`<p class="hst-situation">${ic('flag')}<span>${esc(s.situation)}</span></p>`, 1)}
        <div class="hst-cmp${s.neutral ? ' is-neutral' : ''}"><section class="hst-cmp-a">${r(`<span class="hst-cmp-k">${esc(s.left.label)}</span><p>${s.neutral ? esc(s.left.text) : '“' + esc(s.left.text) + '”'}</p>`, 2)}</section>
          <section class="hst-cmp-b${st.shown ? ' is-on' : ''}"><span class="hst-cmp-k">${esc(s.right.label)}</span>${st.shown ? `<p>${s.neutral ? esc(s.right.text) : '“' + esc(s.right.text) + '”'}</p>` : `<button type="button" class="hst-btn is-primary" data-act="reveal">${ic('sparkle')}${esc(s.revealLabel || 'Reveal a stronger approach')}</button>`}</section></div>
        ${st.shown ? `<div class="hst-why">${(s.why || []).map((w, i) => r(`<span>${ic('check')}${esc(w)}</span>`, i)).join('')}</div>` : ''}</div>`;
    },
    check(s, S) {
      const rec = S.p.checks && S.p.checks[s.id], chosen = rec ? ckIdx(s, rec) : null, done = chosen !== null;
      return `<div class="hst-s hst-check"><div class="hst-ck-q">${r(`<span class="hst-eyebrow">${esc(s.eyebrow || 'Check your thinking')}</span>`, 0)}${r(`<h2>${esc(s.question)}</h2>`, 1)}${s.hint ? r(`<p class="hst-lead">${esc(s.hint)}</p>`, 2) : ''}</div>
        <div class="hst-ck-a" role="group" aria-label="Answer options">${s.options.map((o, i) => { const cls = !done ? '' : i === s.correct ? ' is-right' : i === chosen ? ' is-wrong' : ' is-dim'; return r(`<button type="button" class="hst-opt${cls}" data-act="answer" data-i="${i}" ${done ? 'disabled' : ''}><span class="hst-opt-l">${'ABCD'[i]}</span><span class="hst-opt-t"><span>${esc(o)}</span>${done && (i === chosen || i === s.correct) && s.rationales && s.rationales[i] ? `<span class="hst-sm">${i === s.correct ? '<b>Strongest choice. </b>' : ''}${esc(s.rationales[i])}</span>` : ''}</span></button>`, i + 1); }).join('')}
          ${done ? `<div class="hst-fb ${chosen === s.correct ? 'is-right' : 'is-wrong'}" role="status"><b>${chosen === s.correct ? 'Well chosen.' : 'A useful comparison.'}</b><span>${esc(s.takeaway || '')}</span></div>` : ''}</div></div>`;
    },
    reflect(s, S) {
      const rf = (S.p.reflect && S.p.reflect[s.id]) || s.initial || {};
      return `<div class="hst-s hst-reflect"><div class="hst-rf-l">${r(`<span class="hst-eyebrow">${esc(s.eyebrow || 'Make it yours')}</span>`, 0)}${r(`<h2>${esc(s.prompt)}</h2>`, 1)}${s.hint ? r(`<p class="hst-lead">${esc(s.hint)}</p>`, 2) : ''}</div>
        <div class="hst-rf-r">${r(`<label class="hst-lbl" for="hst-rf-t">Your reflection</label><textarea id="hst-rf-t" class="hst-ta" data-rf="text" rows="5" maxlength="1200" placeholder="Write a sentence or two. It stays on this device.">${esc(rf.text || '')}</textarea>`, 2)}
          ${s.action ? r(`<label class="hst-lbl" for="hst-rf-a">One action to rehearse</label><textarea id="hst-rf-a" class="hst-ta is-short" data-rf="action" rows="2" maxlength="300">${esc(rf.action != null ? rf.action : s.action)}</textarea>
          <div class="hst-due" role="group" aria-label="When to revisit"><span>Revisit</span>${[[1, 'Tomorrow'], [3, 'In 3 days'], [7, 'In a week']].map(([n, l]) => `<button type="button" data-act="due" data-n="${n}" aria-pressed="${(rf.dueDays || 3) === n}">${l}</button>`).join('')}</div>` , 3) : ''}
          ${r(`<button type="button" class="hst-btn is-primary" data-act="saverf">${ic('check')}${esc(s.saveLabel || 'Save my reflection')}</button><span class="hst-saved" data-saved aria-live="polite">${rf.saved ? 'Saved ✓' : ''}</span>`, 4)}</div></div>`;
    },
    recap(s, S) {
      const checks = S.deck.slides.filter(x => x.type === 'check'), got = checks.filter(x => S.p.checks && S.p.checks[x.id] && S.p.checks[x.id].correct).length, answered = checks.filter(x => S.p.checks && S.p.checks[x.id]).length;
      return `<div class="hst-s hst-recap"><div class="hst-rc-l">${r(`<span class="hst-eyebrow">One thing to remember</span>`, 0)}${r(`<h2 class="hst-take">${esc(s.takeaway)}</h2>`, 1)}
        ${s.points && s.points.length ? r(`<ul class="hst-points">${s.points.map(p => `<li>${ic('check')}<span>${esc(p)}</span></li>`).join('')}</ul>`, 2) : ''}</div>
        <div class="hst-rc-r">${r(`<div class="hst-score"><div class="hst-ring" style="--p:${checks.length ? Math.round(100 * got / checks.length) : 100}"><b>${checks.length ? got + '/' + checks.length : '✓'}</b></div><div><b>${checks.length ? 'Strongest choices' : 'Journey complete'}</b><span>${answered < checks.length ? `${checks.length - answered} check${checks.length - answered === 1 ? '' : 's'} left, whenever you’re ready.` : 'Comparing the reasoning is what makes it stick.'}</span></div></div>`, 2)}
        ${r(`<div class="hst-acts"><button type="button" class="hst-btn is-primary" data-act="finish">${ic('flag')}${esc(S.p.done ? 'Journey complete ✓' : s.finishLabel || 'Finish this journey')}</button>
          ${s.next ? `<button type="button" class="hst-btn is-ghost" data-act="nextdeck">${esc(s.next.label)}${ic('arrow')}</button>` : ''}${s.full ? `<button type="button" class="hst-btn is-ghost" data-act="fullopen">${esc(s.full)}</button>` : ''}<button type="button" class="hst-btn is-ghost" data-act="export">${ic('down')}Export my notes</button>${S.p.done ? `<button type="button" class="hst-btn is-ghost" data-act="replay">${ic('repeat')}Replay the journey</button>` : ''}</div>`, 3)}</div>
        <div class="hst-confetti" aria-hidden="true">${S.p.done && S.celebrate ? Array.from({ length: 28 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 7) * .12}s;--c:${i % 4}"></i>`).join('') : ''}</div></div>`;
    }
  };

  /* ---------- controller ---------- */
  let current = null;

  function open(deck, opts) {
    if (current) current.close(true);
    opts = opts || {};
    const app = deck.app || 'hca', P = Object.assign({ visited: [], checks: {}, reflect: {}, notes: {}, ink: {}, prefs: {} }, load(app, deck.id));
    const S = { deck, app, p: P, idx: clamp(opts.start != null ? opts.start : (P.last || 0), 0, deck.slides.length - 1), resume: P.last || 0, ss: {}, vs: {}, tool: 'none', shape: 'arrow', dockOpen: false, hidden: false, film: matchMedia('(min-width:1100px)').matches, notes: false, grid: false, scale: 1, orient: '', undo: {}, redo: {}, celebrate: false, opener: d.activeElement, prog: null };
    P.total = deck.slides.length; P.started = P.started || Date.now();
    S.prog = progress(app, deck.id);
    const accent = deck.accent || '#3557D6';
    const root = d.createElement('div'); root.className = 'hst'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', `${deck.title}: Learning Studio`); root.style.setProperty('--st-j', accent); root.style.setProperty('--st-jd', deck.accentDark || accent); root.style.setProperty('--st-jl', deck.accentLight || accent); root.tabIndex = -1;
    root.innerHTML = `<div class="hst-top"><button type="button" class="hst-ib" data-act="close" aria-label="Close the studio">${ic('close')}</button><div class="hst-tt"><b>${esc(deck.title)}</b><span>${esc(deck.kicker || 'Learning Studio')}</span></div><div class="hst-tc"><span data-count aria-live="polite"></span><span data-left class="hst-left"></span></div>
        <div class="hst-tb"><button type="button" class="hst-ib" data-act="film" aria-label="Show slide list" aria-pressed="false" title="Slide list">${ic('layers')}</button><button type="button" class="hst-ib" data-act="grid" aria-label="Slide overview (G)" title="Overview (G)">${ic('grid')}</button><button type="button" class="hst-ib" data-act="notes" aria-label="My notes (N)" aria-pressed="false" title="My notes (N)">${ic('notes')}</button><button type="button" class="hst-ib hst-hide-sm" data-act="full" aria-label="Full screen (F)" title="Full screen (F)">${ic('full')}</button><button type="button" class="hst-ib" data-act="keys" aria-label="Keyboard shortcuts (?)" title="Shortcuts (?)">${ic('help')}</button></div></div>
      <div class="hst-body"><div class="hst-film" role="navigation" aria-label="Slides"></div><div class="hst-main" role="group" aria-label="Slide"><div class="hst-stagewrap"><div class="hst-frame"><div class="hst-slide" data-slide><div class="hst-content" data-content></div>
        <canvas class="hst-ink hst-ink-hl" aria-hidden="true"></canvas><canvas class="hst-ink hst-ink-pen" aria-hidden="true"></canvas><div class="hst-tx-layer" data-txl></div><canvas class="hst-ink hst-ink-fx" aria-hidden="true"></canvas></div></div></div>
        <div class="hst-dock-wrap"><button type="button" class="hst-annot" data-act="annot" aria-expanded="false" aria-label="Annotate: pen, highlighter, shapes and more">${ic('pencil')}<span>Annotate</span></button><div class="hst-dock" role="toolbar" aria-label="Annotation tools" hidden></div></div>
        <div class="hst-bot"><button type="button" class="hst-nav" data-act="prev" aria-label="Previous slide">${ic('left')}<span>Back</span></button><div class="hst-journey" role="group" aria-label="Journey progress"></div><button type="button" class="hst-nav is-next" data-act="next" aria-label="Next slide"><span>Next</span>${ic('right')}</button></div></div>
        <div class="hst-notes" role="complementary" aria-label="My notes for this slide" hidden><div class="hst-nh"><b>My notes</b><span data-nslide></span></div><textarea class="hst-nta" data-nta placeholder="Type anything you want to remember about this slide. Notes stay on this device." maxlength="3000"></textarea><div class="hst-nf"><span>Saved automatically</span><button type="button" class="hst-btn is-ghost is-sm" data-act="export">${ic('down')}Export all notes</button></div></div></div>
      <div class="hst-overlay" data-ov hidden></div><div class="hst-toast" role="status" aria-live="polite"></div>`;
    d.body.append(root);
    const inerts = [...d.body.children].filter(e => e !== root && !e.hasAttribute('inert')); inerts.forEach(e => e.setAttribute('inert', ''));
    d.documentElement.classList.add('hst-lock');
    const el = { frame: $('.hst-frame', root), slide: $('[data-slide]', root), content: $('[data-content]', root), hl: $('.hst-ink-hl', root), pen: $('.hst-ink-pen', root), fx: $('.hst-ink-fx', root), txl: $('[data-txl]', root), film: $('.hst-film', root), dock: $('.hst-dock', root), jr: $('.hst-journey', root), ov: $('[data-ov]', root), toast: $('.hst-toast', root), wrap: $('.hst-stagewrap', root) };
    let saveT = 0, toastT = 0, motionOff = false;
    const save = () => { clearTimeout(saveT); saveT = setTimeout(flush, 350); };
    const flush = () => { clearTimeout(saveT); P.last = S.idx; P.at = Date.now(); store.set(key(app, deck.id), JSON.stringify(P)); S.prog = progress(app, deck.id); };
    const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || d.documentElement.dataset.hsMotion === 'off' || d.documentElement.matches('[data-motion=reduce],[data-motion=reduced]') || d.body.classList.contains('reduce-motion') || d.body.classList.contains('reduced-motion');
    const toast = (msg, undo) => { clearTimeout(toastT); el.toast.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button type="button" data-act="toastundo">Undo</button>' : ''}`; el.toast.classList.add('is-on'); S.toastUndo = undo || null; toastT = setTimeout(() => el.toast.classList.remove('is-on'), undo ? 9000 : 3200); };
    const slide = () => deck.slides[S.idx];
    const inkKey = () => { const s = slide(); return `${s.id}${s.type === 'visual' ? '@' + S.view(s).step : ''}|${S.orient}`; };
    const items = () => P.ink[inkKey()] || (P.ink[inkKey()] = []);

    S.view = s => { const v = S.vs[s.id] || (S.vs[s.id] = { step: 0, s: 1, tx: 0, ty: 0, free: false }); return v; };

    /* ----- layout & scale ----- */
    function layout() {
      const cs = getComputedStyle(el.wrap), w = el.wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), h = el.wrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom); if (w < 40 || h < 40) return;
      const o = (w / h < .95) ? 'p' : 'l', L = o === 'l' ? LAND : PORT, s = Math.min(w / L.w, h / L.h);
      const changed = o !== S.orient; S.orient = o; S.scale = s;
      el.frame.style.width = L.w * s + 'px'; el.frame.style.height = L.h * s + 'px';
      el.slide.style.width = L.w + 'px'; el.slide.style.height = L.h + 'px'; el.slide.style.transform = `scale(${s})`; el.slide.dataset.o = o;
      sizeCanvas();
      if (changed) { renderSlide(false); } else { fitContent(); applyVisual(true); redraw(); }
    }
    function sizeCanvas() {
      const L = S.orient === 'l' ? LAND : PORT, dpr = Math.min(2, devicePixelRatio || 1), k = S.scale * dpr;
      for (const c of [el.hl, el.pen, el.fx]) { c.width = Math.round(L.w * k); c.height = Math.round(L.h * k); c.style.width = L.w + 'px'; c.style.height = L.h + 'px'; c._k = k; }
    }
    function redraw() {
      const items_ = P.ink[inkKey()] || [], hctx = el.hl.getContext('2d'), pctx = el.pen.getContext('2d');
      hctx.setTransform(1, 0, 0, 1, 0, 0); hctx.clearRect(0, 0, el.hl.width, el.hl.height); pctx.setTransform(1, 0, 0, 1, 0, 0); pctx.clearRect(0, 0, el.pen.width, el.pen.height);
      hctx.setTransform(el.hl._k, 0, 0, el.hl._k, 0, 0); pctx.setTransform(el.pen._k, 0, 0, el.pen._k, 0, 0);
      for (const it of items_) { if (it.t === 'text') continue; paint(it.t === 'hl' ? hctx : pctx, it); }
      el.txl.innerHTML = ''; items_.forEach((it, i) => { if (it.t === 'text') addTextNode(it, i); });
    }
    function addTextNode(it, i) {
      const n = d.createElement('div'); n.className = 'hst-txn'; n.style.left = it.x + 'px'; n.style.top = it.y + 'px'; n.style.color = it.c; n.style.fontSize = it.w + 'px'; n.dataset.i = i; n.setAttribute('role', 'textbox'); n.setAttribute('aria-label', 'Text note'); n.contentEditable = 'true'; n.textContent = it.text || '';
      n.addEventListener('blur', () => { const arr = items(); const o = arr[+n.dataset.i]; if (!o) return; const t = n.textContent.trim(); if (!t) { if (!o.text) { const k = inkKey(); (S.undo[k] || []).pop(); } else snapshot(); arr.splice(+n.dataset.i, 1); redraw(); save(); refreshDock(); return; } if (o.text !== t) { if (o.text) snapshot(); o.text = t; save(); } });
      n.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') n.blur(); });
      el.txl.append(n); return n;
    }

    /* ----- undo / redo (per ink key) ----- */
    const snapshot = () => { const k = inkKey(); (S.undo[k] ||= []).push(JSON.stringify(P.ink[k] || [])); if (S.undo[k].length > 60) S.undo[k].shift(); S.redo[k] = []; refreshDock(); };
    function undo() { const k = inkKey(), u = S.undo[k]; if (!u || !u.length) return; (S.redo[k] ||= []).push(JSON.stringify(P.ink[k] || [])); P.ink[k] = JSON.parse(u.pop()); redraw(); save(); refreshDock(); }
    function redo() { const k = inkKey(), u = S.redo[k]; if (!u || !u.length) return; (S.undo[k] ||= []).push(JSON.stringify(P.ink[k] || [])); P.ink[k] = JSON.parse(u.pop()); redraw(); save(); refreshDock(); }

    /* ----- render a slide ----- */
    function renderSlide(animate) {
      const s = slide(); const html = T[s.type] ? T[s.type](s, S) : `<div class="hst-s"><h2>${esc(s.title || '')}</h2></div>`;
      el.content.className = 'hst-content' + (animate && !reduced() ? ` is-enter ${S.dir > 0 ? 'fwd' : 'back'}` : '');
      el.content.innerHTML = html; fitContent(); el.slide.dataset.type = s.type; el.slide.dataset.dark = s.type === 'cover' ? '1' : '0'; el.slide.dataset.free = '0';
      if (!S.p.visited.includes(S.idx)) { S.p.visited.push(S.idx); save(); }
      $('[data-count]', root).textContent = `${S.idx + 1} / ${deck.slides.length}`;
      const left = deck.slides.length - S.idx - 1; $('[data-left]', root).textContent = left ? `${Math.max(1, Math.round(left * (deck.secPerSlide || 40) / 60))} min left` : 'Last slide';
      $('[data-act=prev]', root).disabled = S.idx === 0; $('[data-act=next]', root).disabled = S.idx === deck.slides.length - 1;
      const nta = $('[data-nta]', root); nta.value = P.notes[s.id] || ''; $('[data-nslide]', root).textContent = `Slide ${S.idx + 1}`;
      journey(); filmstrip(); redraw(); applyVisual(false); refreshDock(); defaultColor();
      el.content.scrollTop = 0; $('[data-act=next]', root).classList.toggle('is-pulse', s.type !== 'check' || !!(P.checks[s.id]));
      announce();
    }
    /* a slide whose content runs past its padded canvas steps down in size (CSS zoom) until it fits */
    const ZOOM = [1, .92, .84, .76];
    function overflowing(n, k) {
      const box = n.getBoundingClientRect(), cs = getComputedStyle(n), sc = S.scale || 1, padB = (parseFloat(cs.paddingBottom) || 0) * k * sc, padT = (parseFloat(cs.paddingTop) || 0) * k * sc;
      if (n.scrollHeight > n.clientHeight + 2) return true;
      for (const e of n.querySelectorAll('.hst-r,h1,h2,p,li,.hst-card,.hst-pull,.hst-opt,.hst-term,.hst-pcard,.hst-cmp section,.hst-score,.hst-acts')) {
        if (e.closest('.hst-tx,.hst-tour,.hst-confetti')) continue; const r = e.getBoundingClientRect(); if (!r.height) continue;
        if (r.bottom > box.bottom - padB + 3 || r.top < box.top + Math.min(padT, 24 * sc) - 3) return true;
      }
      return false;
    }
    function fitContent() {
      const n = $('.hst-s', el.content); if (!n) return; n.removeAttribute('data-tight');
      const cls = el.content.className; el.content.className = 'hst-content';   /* measure at rest, not mid-entrance */
      for (let k = 1; k <= 3 && overflowing(n, ZOOM[k - 1]); k++) n.dataset.tight = String(k);
      el.content.className = cls;
    }
    function announce() { const s = slide(); root.setAttribute('aria-label', `${deck.title}: slide ${S.idx + 1} of ${deck.slides.length}, ${s.title || s.kicker || s.prompt || s.question || s.type}`); }
    function go(i, dir) { i = clamp(i, 0, deck.slides.length - 1); if (i === S.idx && el.content.innerHTML) return; blurText(); S.dir = dir || (i > S.idx ? 1 : -1); S.idx = i; { const t = deck.slides[i]; if (t && t.type === 'visual') S.view(t).free = false; } /* a guide always opens fitted, never at an old zoom */ renderSlide(true); save(); }
    function blurText() { const a = d.activeElement; if (a && a.classList && a.classList.contains('hst-txn')) a.blur(); }

    function journey() {
      if (deck.slides.length > 24) { const pc = Math.round(100 * (S.idx + 1) / deck.slides.length); el.jr.innerHTML = `<div class="hst-pbar" role="progressbar" aria-label="Journey progress" aria-valuemin="1" aria-valuemax="${deck.slides.length}" aria-valuenow="${S.idx + 1}"><i style="width:${pc}%"></i></div>`; return; }
      el.jr.innerHTML = deck.slides.map((s, i) => { const cls = i === S.idx ? 'is-cur' : S.p.visited.includes(i) ? 'is-seen' : ''; const ok = s.type === 'check' && P.checks[s.id]; return `<button type="button" class="hst-dot ${cls}${ok ? ' is-chk' : ''}" data-act="go" data-i="${i}" aria-label="Slide ${i + 1}: ${esc(slideTitle(s))}" aria-current="${i === S.idx ? 'step' : 'false'}" title="${esc(slideTitle(s))}"></button>`; }).join('');
    }
    const TYPE_LABEL = { cover: 'Welcome', idea: 'Idea', notes: 'Notice', terms: 'Words', visual: 'Visual', compare: 'Example', check: 'Check', reflect: 'Reflect', recap: 'Recap' };
    function slideTitle(s) { return s.nav || s.title || s.prompt || s.question || s.kicker || TYPE_LABEL[s.type] || 'Slide'; }
    function filmstrip() {
      el.film.innerHTML = `<div class="hst-fh"><b>Your journey</b><span>${S.p.visited.length} of ${deck.slides.length} seen</span></div>` + deck.slides.map((s, i) => { const chk = s.type === 'check' && P.checks[s.id]; return `<button type="button" class="hst-fi${i === S.idx ? ' is-cur' : ''}" data-act="go" data-i="${i}" ${i === S.idx ? 'aria-current="step"' : ''}><span class="hst-fn">${S.p.visited.includes(i) && i !== S.idx ? ic('check') : i + 1}</span><span class="hst-ft"><span class="hst-sm">${esc(s.cat || TYPE_LABEL[s.type] || '')}${chk ? (chk.correct ? ' · strongest' : ' · compared') : ''}</span><b>${esc(slideTitle(s))}</b></span>${hasInk(s) ? '<i class="hst-fink" title="Has annotations"></i>' : ''}</button>`; }).join('');
      root.classList.toggle('has-film', S.film);
    }
    const hasInk = s => Object.keys(P.ink).some(k => k.startsWith(s.id + '|') || k.startsWith(s.id + '@')) && Object.entries(P.ink).some(([k, v]) => (k.startsWith(s.id + '|') || k.startsWith(s.id + '@')) && v && v.length);

    /* ----- visual (poster tour) ----- */
    function applyVisual(instant) {
      const s = slide(); if (s.type !== 'visual') return; const win = $('[data-pwin]', el.content), img = $('[data-pimg]', el.content); if (!win || !img) return;
      const place = (inst) => {
        const v = S.view(s); el.slide.dataset.free = v.free ? '1' : '0'; const iw = img.naturalWidth || 1000, ih = img.naturalHeight || (iw / (s.aspect || .6)), Ww = win.clientWidth, Wh = win.clientHeight - 0;
        img.style.width = iw + 'px'; img.style.height = ih + 'px';
        const reg = (s.regions || [])[v.step], rect = reg && reg.rect || [0, 0, 1, 1];
        if (!v.free) { const top = 10, bot = 74, Hh = Math.max(60, Wh - top - bot), sc = Math.min(Ww / (rect[2] * iw), Hh / (rect[3] * ih)); v.s = sc; v.tx = Ww / 2 - (rect[0] + rect[2] / 2) * iw * sc; v.ty = top + Hh / 2 - (rect[1] + rect[3] / 2) * ih * sc; }
        const quick = inst === true || instant || reduced(); img.style.transition = quick ? 'none' : 'transform .6s cubic-bezier(.22,.8,.26,1)';
        img.style.transform = `translate(${v.tx}px,${v.ty}px) scale(${v.s})`;
        const sp = $('[data-spot]', win);
        if (sp) { const full = !reg || (rect[2] >= .99 && rect[3] >= .99), pad = 8; sp.hidden = full; sp.style.transition = quick ? 'none' : 'left .6s cubic-bezier(.22,.8,.26,1),top .6s cubic-bezier(.22,.8,.26,1),width .6s cubic-bezier(.22,.8,.26,1),height .6s cubic-bezier(.22,.8,.26,1)'; sp.style.left = v.tx + rect[0] * iw * v.s - pad + 'px'; sp.style.top = v.ty + rect[1] * ih * v.s - pad + 'px'; sp.style.width = rect[2] * iw * v.s + pad * 2 + 'px'; sp.style.height = rect[3] * ih * v.s + pad * 2 + 'px'; }
      };
      let tries = 0; const go_ = () => { if (!img.isConnected) return; if (img.naturalWidth) { try { place(); img.classList.remove('is-raw'); } catch (e) { console.warn(e); } } else if (tries++ < 80) { requestAnimationFrame(go_); } };
      img.addEventListener('load', go_, { once: true }); go_();
      /* Re-fit whenever the poster window changes size (the journey list opening, a rotated phone, a resized browser), so the whole poster never ends up cropped or tiny. */
      if (win._hstRO) win._hstRO.disconnect();
      if (typeof ResizeObserver !== 'undefined') { let w0 = win.clientWidth, h0 = win.clientHeight; win._hstRO = new ResizeObserver(() => { if (!img.isConnected || !img.naturalWidth) return; if (win.clientWidth === w0 && win.clientHeight === h0) return; w0 = win.clientWidth; h0 = win.clientHeight; if (S.view(slide()).free || slide().id !== s.id) return; try { place(true); } catch (e) { console.warn(e); } }); win._hstRO.observe(win); }
    }
    function setStep(i) {
      const s = slide(), reg = s.regions || [], v = S.view(s); const n = clamp(i, 0, reg.length - 1); if (n === v.step && !v.free) return; blurText();
      v.step = n; v.free = false; applyVisual(false); redraw();
      $$('.hst-tour-i', el.content).forEach((b, k) => b.classList.toggle('is-on', k === n)); const st = $('[data-vstat]', el.content); if (st) st.textContent = `${n + 1} / ${reg.length}`;
      const cap = $('[data-vcap]', el.content); if (cap) cap.innerHTML = `<span class="hst-eyebrow">${esc(String(reg[n].label).replace(/^\d+\.\s*/, ''))}</span><p>${esc(reg[n].text)}</p>`;
      if (S.tool !== 'none') {/* ink belongs to the view that was drawn on */ }
    }
    /* ----- enlarged infographic: a full-stage viewer with zoom, pan and pinch ----- */
    function closeLightbox() { if (!S.lb) return; S.lb.el.remove(); S.lb = null; $('.hst-top', root).removeAttribute('inert'); $('.hst-body', root).removeAttribute('inert'); const b = $('[data-act=venlarge]', root); b && b.focus(); }
    function openLightbox() {
      const s = slide(); if (s.type !== 'visual' || S.lb) return; const lb = d.createElement('div'); lb.className = 'hst-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', `${s.title}, enlarged`);
      lb.innerHTML = `<div class="hst-lb-bar"><b>${esc(s.title)}</b><span>Scroll or pinch to zoom, drag to move, double-click to zoom in</span><div><button type="button" class="hst-ib" data-act="lbout" aria-label="Zoom out">${ic('zout')}</button><button type="button" class="hst-ib" data-act="lbin" aria-label="Zoom in">${ic('zin')}</button><button type="button" class="hst-ib" data-act="lbfit" aria-label="Fit to screen">${ic('fit')}</button><button type="button" class="hst-ib" data-act="lbsave" aria-label="Save the infographic">${ic('down')}</button><button type="button" class="hst-ib" data-act="lbclose" aria-label="Close the enlarged view">${ic('close')}</button></div></div><div class="hst-lb-stage" data-lbs tabindex="0" aria-label="Enlarged infographic. Use plus and minus to zoom, arrow keys to move."><img src="${esc(s.img)}" alt="${esc(s.alt || s.title)}" draggable="false"></div>`;
      root.append(lb); $('.hst-top', root).setAttribute('inert', ''); $('.hst-body', root).setAttribute('inert', '');
      const st = $('[data-lbs]', lb), im = $('img', lb), L = S.lb = { el: lb, st, im, s: 1, tx: 0, ty: 0, fit: 1, pts: new Map() };
      const apply = () => { im.style.transform = `translate(${L.tx}px,${L.ty}px) scale(${L.s})`; };
      const clampPan = () => { const w = im.naturalWidth * L.s, h = im.naturalHeight * L.s, W = st.clientWidth, H = st.clientHeight; L.tx = w <= W ? (W - w) / 2 : clamp(L.tx, W - w, 0); L.ty = h <= H ? (H - h) / 2 : clamp(L.ty, H - h, 0); };
      L.fitTo = () => { const W = st.clientWidth, H = st.clientHeight; L.fit = Math.min(W / im.naturalWidth, H / im.naturalHeight); L.s = L.fit; clampPan(); apply(); };
      L.zoom = (f, cx, cy) => { cx = cx == null ? st.clientWidth / 2 : cx; cy = cy == null ? st.clientHeight / 2 : cy; const ns = clamp(L.s * f, L.fit * .98, L.fit * 6), k = ns / L.s; L.tx = cx - (cx - L.tx) * k; L.ty = cy - (cy - L.ty) * k; L.s = ns; clampPan(); apply(); };
      const ready = () => { im.style.width = im.naturalWidth + 'px'; im.style.height = im.naturalHeight + 'px'; L.fitTo(); }; if (im.complete && im.naturalWidth) ready(); else im.addEventListener('load', ready, { once: true });
      L.ro = new ResizeObserver(() => { if (im.naturalWidth) { const was = L.s <= L.fit * 1.001; L.fitTo(); if (!was) { /* keep fitted */ } } }); L.ro.observe(st);
      st.addEventListener('wheel', e => { e.preventDefault(); const r = st.getBoundingClientRect(); L.zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
      st.addEventListener('dblclick', e => { const r = st.getBoundingClientRect(); if (L.s > L.fit * 1.05) L.fitTo(); else L.zoom(2.4, e.clientX - r.left, e.clientY - r.top); });
      let last = 0;
      st.addEventListener('pointerdown', e => { st.setPointerCapture(e.pointerId); L.pts.set(e.pointerId, [e.clientX, e.clientY]); st.classList.add('is-pan'); last = L.pts.size === 2 ? Math.hypot(...[...L.pts.values()].reduce((a, b) => [a[0] - b[0], a[1] - b[1]])) : 0; });
      st.addEventListener('pointermove', e => { const pt = L.pts.get(e.pointerId); if (!pt) return;
        if (L.pts.size === 2) { L.pts.set(e.pointerId, [e.clientX, e.clientY]); const [a, b] = [...L.pts.values()], dd = Math.hypot(a[0] - b[0], a[1] - b[1]), r = st.getBoundingClientRect(); if (last) L.zoom(dd / last, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top); last = dd; return; }
        L.tx += e.clientX - pt[0]; L.ty += e.clientY - pt[1]; L.pts.set(e.pointerId, [e.clientX, e.clientY]); clampPan(); apply(); });
      const up = e => { L.pts.delete(e.pointerId); last = 0; if (!L.pts.size) st.classList.remove('is-pan'); }; st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
      st.addEventListener('keydown', e => { const k = e.key; if (k === '+' || k === '=') L.zoom(1.25); else if (k === '-') L.zoom(1 / 1.25); else if (k === '0') L.fitTo(); else if (k.startsWith('Arrow')) { const m = 60; L.tx += k === 'ArrowLeft' ? m : k === 'ArrowRight' ? -m : 0; L.ty += k === 'ArrowUp' ? m : k === 'ArrowDown' ? -m : 0; clampPan(); apply(); } else return; e.preventDefault(); e.stopPropagation(); });
      st.focus();
    }
    function zoomBy(f) { const s = slide(), v = S.view(s), win = $('[data-pwin]', el.content); if (!win) return; const cx = win.clientWidth / 2, cy = win.clientHeight / 2, ns = clamp(v.s * f, .15, 6), k = ns / v.s; v.tx = cx - (cx - v.tx) * k; v.ty = cy - (cy - v.ty) * k; v.s = ns; v.free = true; applyVisual(false); }
    function saveView() {
      const s = slide(), win = $('[data-pwin]', el.content), img = $('[data-pimg]', el.content); if (!win || !img || !img.naturalWidth) return;
      const v = S.view(s), k = 2, c = d.createElement('canvas'); c.width = win.clientWidth * k; c.height = win.clientHeight * k; const x = c.getContext('2d'); x.fillStyle = '#FBF8F1'; x.fillRect(0, 0, c.width, c.height);
      x.save(); x.scale(k, k); x.translate(v.tx, v.ty); x.scale(v.s, v.s); try { x.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight); } catch { } x.restore();
      const wr = win.getBoundingClientRect(), sr = el.slide.getBoundingClientRect(), ox = (wr.left - sr.left) / S.scale, oy = (wr.top - sr.top) / S.scale;
      for (const cv of [el.hl, el.pen]) { x.save(); if (cv === el.hl) { x.globalAlpha = .42; x.globalCompositeOperation = 'multiply'; } x.drawImage(cv, ox * cv._k, oy * cv._k, win.clientWidth * cv._k, win.clientHeight * cv._k, 0, 0, c.width, c.height); x.restore(); }
      c.toBlob(b => { if (!b) return; const a = d.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${(s.download || deck.id)}-view${v.step + 1}.png`; d.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); toast('Saved this view with your annotations.'); }, 'image/png');
    }

    /* ----- annotation dock ----- */
    const TOOLS = [['none', 'cursor', 'Interact', 'V'], ['pen', 'pen', 'Pen', 'P'], ['marker', 'marker', 'Marker', 'M'], ['highlighter', 'highlighter', 'Highlighter', 'H'], ['eraser', 'eraser', 'Eraser', 'E'], ['shape', 'shapes', 'Shapes', 'S'], ['text', 'text', 'Text', 'T'], ['laser', 'laser', 'Laser pointer', 'L']];
    const prefs = () => P.prefs;
    const toolColor = t => (prefs()['c_' + t]) || (t === 'highlighter' ? HL_COLORS[0] : PEN_COLORS[S.slideDark() ? 6 : 1]);
    const toolSize = t => (prefs()['s_' + (t === 'shape' ? 'shape' : t)] ?? 1);
    S.slideDark = () => el.slide.dataset.dark === '1';
    function defaultColor() { if (S.tool === 'pen' || S.tool === 'marker' || S.tool === 'shape') { /* keep user choice */ } }
    function buildDock() {
      const pal = (S.tool === 'highlighter') ? HL_COLORS : PEN_COLORS, hasColor = ['pen', 'marker', 'highlighter', 'shape', 'text'].includes(S.tool), hasSize = ['pen', 'marker', 'highlighter', 'shape', 'eraser', 'text'].includes(S.tool);
      const k = inkKey(), u = (S.undo[k] || []).length, rd = (S.redo[k] || []).length, any = items().length, cc = toolColor(S.tool).toLowerCase();
      el.dock.innerHTML = `<div class="hst-row"><div class="hst-dg hst-g-tools" role="group" aria-label="Tools"><button type="button" class="hst-tool is-close" data-act="annot" aria-label="Hide annotation tools" title="Hide tools (A)">${ic('close')}</button>${TOOLS.map(([id, icn, label, sc]) => `<button type="button" class="hst-tool${S.tool === id ? ' is-on' : ''}" data-act="tool" data-t="${id}" aria-pressed="${S.tool === id}" aria-label="${label} (${sc})" title="${label} (${sc})">${ic(icn)}</button>`).join('')}</div>
        </div>
        <div class="hst-row">${S.tool === 'shape' ? `<div class="hst-dg hst-g-shape" role="group" aria-label="Shape">${[['arrow', 'Arrow'], ['line', 'Line'], ['rect', 'Box'], ['ellipse', 'Circle']].map(([id, l]) => `<button type="button" class="hst-chipb${S.shape === id ? ' is-on' : ''}" data-act="shape" data-s="${id}" aria-pressed="${S.shape === id}">${l}</button>`).join('')}</div>` : ''}<div class="hst-dg hst-g-edit" role="group" aria-label="Undo and redo"><button type="button" class="hst-tool" data-act="undo" aria-label="Undo (Ctrl Z)" title="Undo" ${u ? '' : 'disabled'}>${ic('undo')}</button><button type="button" class="hst-tool" data-act="redo" aria-label="Redo (Ctrl Shift Z)" title="Redo" ${rd ? '' : 'disabled'}>${ic('redo')}</button></div>
        ${hasColor ? `<div class="hst-dg hst-sw hst-g-color" role="group" aria-label="Colour">${pal.map(c => `<button type="button" class="hst-swatch${cc === c.toLowerCase() ? ' is-on' : ''}" style="--c:${c}" data-act="color" data-c="${c}" aria-label="Colour ${c}" aria-pressed="${cc === c.toLowerCase()}"></button>`).join('')}</div>` : ''}
        ${hasSize ? `<div class="hst-dg hst-g-size" role="group" aria-label="Size">${[0, 1, 2].map(i => `<button type="button" class="hst-sz${toolSize(S.tool) === i ? ' is-on' : ''}" data-act="size" data-n="${i}" aria-label="${['Thin', 'Medium', 'Thick'][i]}" aria-pressed="${toolSize(S.tool) === i}"><i style="--s:${[4, 8, 13][i]}px"></i></button>`).join('')}</div>` : ''}
        <div class="hst-dg hst-g-clear" role="group" aria-label="Clear"><button type="button" class="hst-tool" data-act="hideink" aria-label="${S.hidden ? 'Show annotations' : 'Hide annotations'}" aria-pressed="${S.hidden}" title="${S.hidden ? 'Show' : 'Hide'} annotations">${ic(S.hidden ? 'eyeoff' : 'eye')}</button>
          <button type="button" class="hst-tool is-warn" data-act="clearslide" aria-label="Clear this slide" title="Clear this slide" ${any ? '' : 'disabled'}>${ic('trash')}<span>Clear</span></button><button type="button" class="hst-tool is-warn" data-act="clearall" aria-label="Clear all annotations on every slide" title="Clear all slides">${ic('trash')}<span>Clear all</span></button></div></div>`;
    }
    function refreshDock() { if (!el.dock.hidden) buildDock(); }
    function setTool(t) { S.tool = t; el.slide.dataset.tool = t; root.dataset.tool = t; el.fx.style.pointerEvents = 'none'; $$('.hst-ink', el.slide).forEach(c => { c.style.pointerEvents = 'none'; }); blurText(); if (t !== 'none') { el.fx.style.pointerEvents = 'auto'; el.fx.style.touchAction = 'none'; } el.txl.classList.toggle('is-active', t === 'text' || t === 'eraser'); refreshDock(); }
    function toggleDock(on) { S.dockOpen = on == null ? !S.dockOpen : on; el.dock.hidden = !S.dockOpen; const b = $('.hst-annot', root); b.setAttribute('aria-expanded', String(S.dockOpen)); root.classList.toggle('dock-open', S.dockOpen); if (S.dockOpen) { if (S.tool === 'none') setTool('pen'); buildDock(); } else { setTool('none'); if (d.activeElement === d.body || !root.contains(d.activeElement)) b.focus(); } layoutSoon(); }

    /* ----- pointer drawing on the FX canvas ----- */
    let cur = null, laser = null, raf = 0, pendingText = null;
    const pt = e => { const b = el.fx.getBoundingClientRect(); return [(e.clientX - b.left) / S.scale, (e.clientY - b.top) / S.scale]; };
    function style(t) {
      const si = toolSize(t); let c = toolColor(t), w;
      if (t === 'pen') w = SIZES.pen[si]; else if (t === 'marker') w = SIZES.marker[si]; else if (t === 'highlighter') w = SIZES.highlighter[si]; else if (t === 'shape') w = SIZES.shape[si]; else if (t === 'text') w = [22, 32, 46][si]; else w = SIZES.eraser[si];
      return { c, w };
    }
    el.fx.addEventListener('pointerdown', e => {
      if (S.tool === 'none' || e.button > 0) return; e.preventDefault();
      const under = d.elementsFromPoint(e.clientX, e.clientY).find(x => x.closest && x.closest('.hst-pctl,.hst-tour')); if (under) { const ub = under.closest('button'); if (ub) ub.click(); return; }
      if (S.hidden) { S.hidden = false; root.classList.remove('ink-off'); buildDock(); }
      { const s = slide(); if (s.type === 'visual' && S.view(s).free) { S.view(s).free = false; applyVisual(true); redraw(); } }
      el.fx.setPointerCapture(e.pointerId); const p = pt(e), st = style(S.tool);
      if (S.tool === 'text') { snapshot(); const it = { t: 'text', x: Math.max(8, p[0] - 4), y: Math.max(8, p[1] - st.w / 2), c: st.c, w: st.w, text: '' }; items().push(it); pendingText = addTextNode(it, items().length - 1); return; }
      if (S.tool === 'laser') { laser = { pts: [[p[0], p[1], performance.now()]], on: true }; loop(); return; }
      if (S.tool === 'eraser') { cur = { t: 'er', snap: false, r: st.w / 2 }; erase(p, st); drawCursor(p, st.w / 2); return; }
      if (S.tool === 'shape') { cur = { t: 'shape', k: S.shape, c: st.c, w: st.w, p: [p, p] }; }
      else cur = { t: S.tool === 'highlighter' ? 'hl' : 'pen', c: st.c, w: st.w, p: [p], kind: S.tool };
      if (cur.kind === 'marker') cur.w = st.w * 1.0;
      preview();
    });
    el.fx.addEventListener('pointermove', e => {
      const p = pt(e);
      if (S.tool === 'laser') { if (!laser) laser = { pts: [], on: false }; laser.pts.push([p[0], p[1], performance.now()]); if (laser.pts.length > 60) laser.pts.shift(); loop(); return; }
      if (S.tool === 'eraser') { const st = style('eraser'); if (cur) erase(p, st); drawCursor(p, st.w / 2); return; }
      if (!cur) return; const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      if (cur.t === 'shape') { let q = p; if (e.shiftKey && cur.k !== 'rect' && cur.k !== 'ellipse') { const a = cur.p[0], dx = p[0] - a[0], dy = p[1] - a[1], ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 12)) * (Math.PI / 12), l = Math.hypot(dx, dy); q = [a[0] + l * Math.cos(ang), a[1] + l * Math.sin(ang)]; } cur.p[1] = q; }
      else for (const ev of evs) { const q = pt(ev), l = cur.p[cur.p.length - 1]; if (Math.hypot(q[0] - l[0], q[1] - l[1]) > .8) cur.p.push(q); }
      preview();
    });
    const end = e => {
      if (pendingText) { const n = pendingText; pendingText = null; n.focus(); return; }   /* focus after the click's own focus change */
      if (S.tool === 'laser') { if (laser) laser.on = false; return; }
      if (S.tool === 'eraser') { cur = null; const fx = el.fx.getContext('2d'); fx.setTransform(1, 0, 0, 1, 0, 0); fx.clearRect(0, 0, el.fx.width, el.fx.height); if (e && e.type === 'pointerleave') return; return; }
      if (!cur) return; const it = cur; cur = null; if (it.t === 'shape' && Math.hypot(it.p[1][0] - it.p[0][0], it.p[1][1] - it.p[0][1]) < 6) { clearFx(); return; }
      if (it.p.length > 2 && it.t !== 'shape') it.p = it.p.length > 400 ? it.p.filter((_, i) => i % 2 === 0 || i === it.p.length - 1) : it.p;
      snapshot(); const keep = { t: it.t, c: it.c, w: it.w, p: it.p.map(q => [Math.round(q[0] * 10) / 10, Math.round(q[1] * 10) / 10]) }; if (it.k) keep.k = it.k; items().push(keep); clearFx(); redraw(); save(); flushSoon();
    };
    const flushSoon = () => { buildDockMaybe(); };
    const buildDockMaybe = () => refreshDock();
    el.fx.addEventListener('pointerup', end); el.fx.addEventListener('pointercancel', end);
    el.fx.addEventListener('pointerleave', e => { if (S.tool === 'eraser' || S.tool === 'laser') clearFx(); });
    function clearFx() { const c = el.fx.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, el.fx.width, el.fx.height); }
    function preview() {
      const c = el.fx.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, el.fx.width, el.fx.height); c.setTransform(el.fx._k, 0, 0, el.fx._k, 0, 0);
      if (cur.t === 'hl') { c.globalAlpha = .42; c.globalCompositeOperation = 'multiply'; } paint(c, cur); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    }
    function drawCursor(p, r) { const c = el.fx.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, el.fx.width, el.fx.height); c.setTransform(el.fx._k, 0, 0, el.fx._k, 0, 0); c.strokeStyle = 'rgba(16,37,58,.7)'; c.fillStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; c.beginPath(); c.arc(p[0], p[1], r, 0, Math.PI * 2); c.fill(); c.stroke(); }
    function erase(p, st) {
      const arr = items(); let removed = false; for (let i = arr.length - 1; i >= 0; i--) if (hit(arr[i], p[0], p[1], st.w / 2)) { if (!cur.snap) { snapshot(); cur.snap = true; } arr.splice(i, 1); removed = true; }
      if (removed) { redraw(); save(); }
    }
    function loop() {
      if (raf) return; raf = requestAnimationFrame(function tick() {
        raf = 0; const c = el.fx.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, el.fx.width, el.fx.height); if (!laser) return; c.setTransform(el.fx._k, 0, 0, el.fx._k, 0, 0); const now = performance.now(); laser.pts = laser.pts.filter(q => now - q[2] < 900);
        const col = prefs().c_laser || '#FF3B3B'; for (let i = 1; i < laser.pts.length; i++) { const a = laser.pts[i - 1], b = laser.pts[i], age = clamp(1 - (now - b[2]) / 900, 0, 1); c.strokeStyle = col; c.globalAlpha = age * .55; c.lineWidth = 6 * age + 1; c.lineCap = 'round'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
        const l = laser.pts[laser.pts.length - 1]; if (l && now - l[2] < 900) { c.globalAlpha = 1; const g = c.createRadialGradient(l[0], l[1], 0, l[0], l[1], 22); g.addColorStop(0, col); g.addColorStop(.25, col); g.addColorStop(1, 'rgba(255,59,59,0)'); c.fillStyle = g; c.beginPath(); c.arc(l[0], l[1], 22, 0, Math.PI * 2); c.fill(); }
        c.globalAlpha = 1; if (laser.pts.length && now - laser.pts[laser.pts.length - 1][2] < 900) raf = requestAnimationFrame(tick);
      });
    }
    /* pan the poster by dragging when no ink tool is active */
    el.content.addEventListener('pointerdown', e => {
      const win = e.target.closest('[data-pwin]'); if (!win || S.tool !== 'none' || e.target.closest('.hst-pctl')) return; const s = slide(), v = S.view(s); let sx = e.clientX, sy = e.clientY; win.setPointerCapture(e.pointerId); win.classList.add('is-pan');
      const mv = ev => { el.slide.dataset.free = '1'; v.tx += (ev.clientX - sx) / S.scale; v.ty += (ev.clientY - sy) / S.scale; sx = ev.clientX; sy = ev.clientY; v.free = true; const img = $('[data-pimg]', el.content); img.style.transition = 'none'; img.style.transform = `translate(${v.tx}px,${v.ty}px) scale(${v.s})`; };
      const up = () => { win.classList.remove('is-pan'); win.removeEventListener('pointermove', mv); win.removeEventListener('pointerup', up); win.removeEventListener('pointercancel', up); }; win.addEventListener('pointermove', mv); win.addEventListener('pointerup', up); win.addEventListener('pointercancel', up);
    });
    el.content.addEventListener('wheel', e => { const win = e.target.closest('[data-pwin]'); if (!win || !(e.ctrlKey || e.metaKey)) return; e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.12 : .89); }, { passive: false });

    /* ----- overview grid, keys, export ----- */
    function showGrid(on) {
      S.grid = on; el.ov.hidden = !on; if (!on) { el.ov.innerHTML = ''; root.focus(); return; }
      el.ov.innerHTML = `<div class="hst-ovh"><b>All slides</b><span>Pick one to jump to it</span><button type="button" class="hst-ib" data-act="grid" aria-label="Close overview">${ic('close')}</button></div><div class="hst-ovg">${deck.slides.map((s, i) => `<button type="button" class="hst-ovi${i === S.idx ? ' is-cur' : ''}" data-act="go" data-i="${i}" data-close="1"><span class="hst-ovn">${i + 1}</span><span class="hst-sm">${TYPE_LABEL[s.type] || ''}</span><b>${esc(slideTitle(s))}</b>${S.p.visited.includes(i) ? `<i class="hst-ovs">${ic('check')}</i>` : ''}${hasInk(s) ? '<i class="hst-fink"></i>' : ''}</button>`).join('')}</div>`;
      const c = $('.hst-ovi.is-cur', el.ov); c && c.focus();
    }
    function showKeys() {
      el.ov.hidden = false; S.grid = true; el.ov.innerHTML = `<div class="hst-ovh"><b>Keyboard shortcuts</b><span></span><button type="button" class="hst-ib" data-act="grid" aria-label="Close">${ic('close')}</button></div><div class="hst-keys">${[['← →  / Space', 'Previous · next slide'], ['Home · End', 'First · last slide'], ['G', 'Slide overview'], ['N', 'My notes'], ['F', 'Full screen'], ['A', 'Show or hide annotation tools'], ['P M H', 'Pen · marker · highlighter'], ['E', 'Eraser'], ['S T L', 'Shapes · text · laser'], ['V', 'Interact (stop drawing)'], ['Ctrl/⌘ Z', 'Undo · Shift for redo'], ['Esc', 'Close the studio']].map(([k, v]) => `<div><kbd>${k}</kbd><span>${v}</span></div>`).join('')}</div>`;
      const b = $('.hst-ib', el.ov); b && b.focus();
    }
    function exportNotes() {
      const lines = [`# ${deck.title}`, `_${deck.kicker || 'Learning Studio'} · exported ${new Date().toLocaleDateString('en-GB')}_`, ''];
      deck.slides.forEach((s, i) => { const t = P.notes[s.id], rf = P.reflect[s.id], ck = P.checks[s.id], n = Object.entries(P.ink).filter(([k, v]) => (k.startsWith(s.id + '|') || k.startsWith(s.id + '@')) && v && v.length).reduce((a, [, v]) => a + v.length, 0); if (!t && !rf && !ck && !n) return; lines.push(`## ${i + 1}. ${slideTitle(s)}`); if (ck) lines.push(`- Check: ${s.options[ckIdx(s, ck)]} (${ck.correct ? 'strongest choice' : 'compared with: ' + s.options[s.correct]})`); if (rf) { if (rf.text) lines.push(`- Reflection: ${rf.text}`); if (rf.action) lines.push(`- Action: ${rf.action}`); } if (t) lines.push('', t); if (n) lines.push(`- ${n} annotation${n === 1 ? '' : 's'} on this slide`); lines.push(''); });
      const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' }), a = d.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${deck.id}-studio-notes.md`; d.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); toast('Notes exported.');
    }
    function clearSlide() { const k = inkKey(), arr = P.ink[k]; if (!arr || !arr.length) return; snapshot(); P.ink[k] = []; redraw(); save(); refreshDock(); toast('Cleared this slide.', () => undo()); }
    function clearAll() {
      const total = Object.values(P.ink).reduce((a, v) => a + (v ? v.length : 0), 0); if (!total) { toast('There is nothing to clear.'); return; }
      el.ov.hidden = false; S.grid = true; el.ov.innerHTML = `<div class="hst-confirm" role="alertdialog" aria-labelledby="hst-cf-t"><h3 id="hst-cf-t">Clear all annotations?</h3><p>This removes ${total} mark${total === 1 ? '' : 's'} from every slide in this journey. You can undo straight afterwards.</p><div><button type="button" class="hst-btn is-ghost" data-act="cfno">Keep them</button><button type="button" class="hst-btn is-danger" data-act="cfyes">${ic('trash')}Clear all</button></div></div>`; $('[data-act=cfno]', el.ov).focus();
    }
    function doClearAll() { const keep = JSON.stringify(P.ink); P.ink = {}; S.undo = {}; S.redo = {}; showGrid(false); redraw(); filmstrip(); save(); refreshDock(); toast('Cleared every slide.', () => { P.ink = JSON.parse(keep); redraw(); filmstrip(); save(); refreshDock(); }); }
    async function fullscreen() { try { if (d.fullscreenElement) await d.exitFullscreen(); else await root.requestFullscreen(); } catch { root.classList.toggle('is-present'); } layoutSoon(); }
    const layoutSoon = () => requestAnimationFrame(() => requestAnimationFrame(layout));

    function finish() {
      if (S.p.done) { toast('This journey is already complete.'); return; }
      const checks = deck.slides.filter(x => x.type === 'check'), got = checks.filter(x => P.checks[x.id] && P.checks[x.id].correct).length;
      const sum = { checks: checks.length, strongest: got, visited: S.p.visited.length, total: deck.slides.length, answered: Object.keys(P.checks).length };
      try { const block = deck.canFinish && deck.canFinish(sum); if (block) { toast(block); return; } } catch (e) { console.warn(e); }
      S.p.done = true; S.p.finished = Date.now(); S.celebrate = true; save(); flush(); renderSlide(false); setTimeout(() => { S.celebrate = false; }, 4000);
      try { const msg = deck.onComplete && deck.onComplete(sum); if (typeof msg === 'string') toast(msg); } catch (e) { console.warn(e); }
    }

    /* ----- events ----- */
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b || !root.contains(b)) return; const a = b.dataset.act, i = +b.dataset.i;
      switch (a) {
        case 'close': close(); break; case 'next': go(S.idx + 1, 1); break; case 'prev': go(S.idx - 1, -1); break;
        case 'go': if (b.dataset.close) showGrid(false); go(i); break;
        case 'film': S.film = !S.film; b.setAttribute('aria-pressed', String(S.film)); root.classList.toggle('has-film', S.film); layoutSoon(); break;
        case 'grid': if (S.grid) showGrid(false); else showGrid(true); break;
        case 'keys': showKeys(); break;
        case 'notes': S.notes = !S.notes; $('.hst-notes', root).hidden = !S.notes; root.classList.toggle('has-notes', S.notes); b.setAttribute('aria-pressed', String(S.notes)); layoutSoon(); if (S.notes) setTimeout(() => $('[data-nta]', root).focus(), 60); break;
        case 'full': fullscreen(); break; case 'export': exportNotes(); break;
        case 'annot': toggleDock(); break;
        case 'tool': setTool(b.dataset.t); break;
        case 'shape': S.shape = b.dataset.s; buildDock(); break;
        case 'color': prefs()['c_' + S.tool] = b.dataset.c; save(); buildDock(); break;
        case 'size': prefs()['s_' + (S.tool === 'shape' ? 'shape' : S.tool)] = +b.dataset.n; save(); buildDock(); break;
        case 'undo': undo(); break; case 'redo': redo(); break;
        case 'hideink': S.hidden = !S.hidden; root.classList.toggle('ink-off', S.hidden); buildDock(); break;
        case 'clearslide': clearSlide(); break; case 'clearall': clearAll(); break; case 'cfno': showGrid(false); break; case 'cfyes': doClearAll(); break;
        case 'toastundo': if (S.toastUndo) { S.toastUndo(); S.toastUndo = null; el.toast.classList.remove('is-on'); } break;
        case 'flip': { const s = slide(), st = S.ss[s.id] || (S.ss[s.id] = { flipped: {} }); st.flipped[i] = !st.flipped[i]; renderSlide(false); const nb = $(`[data-act=flip][data-i="${i}"]`, el.content); nb && nb.focus(); break; }
        case 'reveal': { const s = slide(); (S.ss[s.id] ||= {}).shown = true; renderSlide(false); const f = $('.hst-why', el.content); f && f.scrollIntoView({ block: 'nearest' }); break; }
        case 'answer': { const s = slide(); if (P.checks[s.id]) break; const correct = i === s.correct; P.checks[s.id] = { choice: i, correct, at: Date.now(), ct: s.options[i] }; try { deck.onCheck && deck.onCheck(s, i, correct); } catch (er) { console.warn(er); } save(); renderSlide(false); journey(); break; }
        case 'due': { const s = slide(), rf = (P.reflect[s.id] ||= {}); rf.dueDays = +b.dataset.n; $$('[data-act=due]', el.content).forEach(x => x.setAttribute('aria-pressed', String(x === b))); save(); break; }
        case 'saverf': { const s = slide(), rf = (P.reflect[s.id] ||= {}); rf.text = ($('[data-rf=text]', el.content) || {}).value || ''; const at = $('[data-rf=action]', el.content); if (at) rf.action = at.value.trim(); rf.dueDays = rf.dueDays || 3; rf.saved = true; save(); try { deck.onReflect && deck.onReflect(s, rf); } catch (er) { console.warn(er); } const sv = $('[data-saved]', el.content); if (sv) sv.textContent = 'Saved ✓'; toast('Reflection saved on this device.'); break; }
        case 'vprev': setStep(S.view(slide()).step - 1); break; case 'vnext': setStep(S.view(slide()).step + 1); break; case 'vgo': setStep(i); break;
        case 'venlarge': openLightbox(); break; case 'lbclose': closeLightbox(); break; case 'lbin': S.lb && S.lb.zoom(1.3); break; case 'lbout': S.lb && S.lb.zoom(1 / 1.3); break; case 'lbfit': S.lb && S.lb.fitTo(); break;
        case 'lbsave': { const sl = slide(), a = d.createElement('a'); a.href = sl.img; a.download = (sl.download || sl.id) + '.' + (/\.(png|webp|jpe?g)(\?|$)/i.exec(sl.img) || [0, 'png'])[1]; d.body.append(a); a.click(); a.remove(); break; }
        case 'vzin': zoomBy(1.3); break; case 'vzout': zoomBy(1 / 1.3); break; case 'vfit': { const v = S.view(slide()); v.step = 0; v.free = false; setStep(0); applyVisual(false); break; } case 'vsave': saveView(); break;
        case 'finish': finish(); break;
        case 'replay': S.p.done = false; S.p.checks = {}; S.p.visited = [0]; S.ss = {}; save(); flush(); go(0, -1); renderSlide(false); toast('Journey reset. Your notes and annotations are kept.'); break;
        case 'nextdeck': { const n = slide().next; flush(); close(); n && n.open && n.open(); break; }
        case 'fullopen': { const fn = slide().onFull; flush(); close(); fn && fn(); break; }
      }
    });
    root.addEventListener('input', e => {
      const t = e.target; if (t.matches('[data-nta]')) { P.notes[slide().id] = t.value; save(); }
      if (t.matches('[data-rf]')) { const rf = (P.reflect[slide().id] ||= {}); rf[t.dataset.rf] = t.value; rf.saved = false; const sv = $('[data-saved]', el.content); if (sv) sv.textContent = ''; save(); }
    });
    const onKey = e => {
      if (!root.isConnected) return; e.stopPropagation(); const tag = (e.target.tagName || '').toLowerCase(), typing = tag === 'textarea' || tag === 'input' || e.target.isContentEditable;
      if (e.key === 'Tab') { const f = $$('button:not([disabled]):not([hidden]),textarea,input,[tabindex="0"],summary,[contenteditable=true]', root).filter(x => x.offsetParent !== null && !x.closest('[hidden]')); if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && (d.activeElement === a || d.activeElement === root)) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && d.activeElement === z) { e.preventDefault(); a.focus(); } return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (e.key === 'Escape') { e.preventDefault(); if (S.lb) closeLightbox(); else if (S.grid) showGrid(false); else if (typing) d.activeElement.blur(); else if (d.fullscreenElement) d.exitFullscreen(); else if (S.dockOpen) toggleDock(false); else close(); return; }
      if (typing || e.altKey || e.ctrlKey || e.metaKey) return;
      const k = e.key.toLowerCase();
      if (['arrowright', 'pagedown'].includes(k) || (k === ' ' && !e.target.closest('button'))) { e.preventDefault(); go(S.idx + 1, 1); }
      else if (['arrowleft', 'pageup'].includes(k)) { e.preventDefault(); go(S.idx - 1, -1); }
      else if (k === 'home') { e.preventDefault(); go(0, -1); } else if (k === 'end') { e.preventDefault(); go(deck.slides.length - 1, 1); }
      else if (k === 'g') showGrid(!S.grid); else if (k === 'n') $('[data-act=notes]', root).click(); else if (k === 'f') fullscreen(); else if (k === '?') showKeys();
      else if (k === 'a') toggleDock();
      else { const m = { v: 'none', p: 'pen', m: 'marker', h: 'highlighter', e: 'eraser', s: 'shape', t: 'text', l: 'laser' }[k]; if (m) { if (!S.dockOpen) toggleDock(true); setTool(m); } }
    };
    window.addEventListener('keydown', onKey, true); const onPop = () => close(); window.addEventListener('popstate', onPop);
    const ro = new ResizeObserver(() => layout()); ro.observe(el.wrap);
    const onFs = () => layoutSoon(); d.addEventListener('fullscreenchange', onFs);
    // swipe between slides (when not drawing)
    let sw = null; el.wrap.addEventListener('touchstart', e => { if (S.tool !== 'none' || e.touches.length !== 1 || e.target.closest('[data-pwin],textarea,input,.hst-opt')) { sw = null; return; } sw = [e.touches[0].clientX, e.touches[0].clientY]; }, { passive: true });
    el.wrap.addEventListener('touchend', e => { if (!sw) return; const t = e.changedTouches[0], dx = t.clientX - sw[0], dy = t.clientY - sw[1]; sw = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) go(S.idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); }, { passive: true });

    function close(silent) {
      flush(); if (S.lb && S.lb.ro) S.lb.ro.disconnect(); window.removeEventListener('keydown', onKey, true); window.removeEventListener('popstate', onPop); d.removeEventListener('fullscreenchange', onFs); ro.disconnect(); cancelAnimationFrame(raf); if (d.fullscreenElement) d.exitFullscreen().catch(() => { });
      root.remove(); inerts.forEach(e => e.removeAttribute('inert')); d.documentElement.classList.remove('hst-lock'); current = null;
      if (!silent) { try { deck.onClose && deck.onClose(progress(app, deck.id)); } catch (e) { console.warn(e); } const o = S.opener; if (o && o.isConnected) { try { o.focus({ preventScroll: true }); } catch { } } }
    }
    const ctl = { close, go, root, get index() { return S.idx; }, toggleDock, setTool };
    current = ctl;
    layout(); if (!el.content.firstChild) renderSlide(false);
    if (!P.prefs.tip) { P.prefs.tip = 1; save(); setTimeout(() => { if (root.isConnected && !S.dockOpen) toast('Tip: press A, or tap Annotate, for the pen, highlighter, shapes and laser pointer.'); }, 2600); }
    requestAnimationFrame(() => { layout(); root.focus(); });
    return ctl;
  }

  global.HCAStudio = { open, progress, close: () => current && current.close(), get isOpen() { return !!current; }, icon: ic };
})(window);
