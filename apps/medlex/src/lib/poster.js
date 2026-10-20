/* MedLex Visual Atlas poster pop-up: just the illustrated guide in a clean dialog, with a standard set of markup tools.
   Pen, marker, highlighter, text, sticky notes, shapes and stickers; select and move, undo, redo, delete, clear all; zoom and pan; save as a picture.
   Markup is kept in image coordinates (so it stays put when you zoom or resize) and is stored on this device only. */
(function () {
  'use strict';
  const L = window.MedlexLib; if (!L) return;
  const d = document, esc = L.esc;
  const KEY = 'medlex.atlas.ink.v1', HIST = 60;
  const COLORS = ['#10253A', '#D93A3A', '#E8872B', '#2E9E5B', '#3557D6', '#8B6CF0', '#111111', '#FFFFFF'];
  const HL = ['#FFE14A', '#7BE495', '#FF9EC4', '#7FD0FF'];
  const NOTE = ['#FFE98A', '#BFF0C5', '#FFC7DC', '#C5E3FF'];
  const WIDTHS = { pen: [3, 5, 9], marker: [9, 14, 22], hl: [26, 38, 56], shape: [3, 5, 9] };
  const SIZES = { text: [26, 36, 52], note: [22, 28, 38], sticker: [70, 100, 150] };
  const ICON = {
    select: 'M5 3l13 8-6 1.5L9.5 19z', pen: 'M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z', marker: 'M5 19l3-1 9-9-2-2-9 9zM15 7l2 2M13 21h8', hl: 'M4 20h8M8 16l-1 4 4-1 8-8-3-3z',
    text: 'M5 6V4h14v2M12 4v16M9 20h6', note: 'M4 4h16v11l-5 5H4zM15 20v-5h5', shape: 'M4 5h10v10H4zM12 11h8v8h-8z', sticker: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z',
    undo: 'M9 7L4 12l5 5M4 12h10a6 6 0 0 1 0 12', redo: 'M15 7l5 5-5 5M20 12H10a6 6 0 0 0 0 12', trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6', clear: 'M5 5l14 14M19 5L5 19',
    zin: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3M8 11h6M11 8v6', zout: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3M8 11h6', fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    x: 'M6 6l12 12M18 6L6 18', prev: 'M15 5l-7 7 7 7', next: 'M9 5l7 7-7 7', dl: 'M12 4v11M7 11l5 5 5-5M5 20h14', info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.5'
  };
  const ic = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${ICON[n] || ''}"/></svg>`;
  /* stickers: 24x24 paths, drawn filled in the chosen colour (some with a white detail) */
  const STICKERS = [
    ['check', 'Tick', 'M4 12.5l5 5L20 6.5', 'stroke'], ['cross', 'Cross', 'M5 5l14 14M19 5L5 19', 'stroke'], ['warn', 'Important', 'M12 3l10 18H2zM12 10v5M12 17.5v.5', 'warn'],
    ['q', 'Question', 'M9 9a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.2-1.5 2.4M12 17.5v.5', 'stroke'], ['star', 'Star', 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z', 'fill'],
    ['heart', 'Heart', 'M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z', 'fill'], ['bulb', 'Idea', 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.8c.6.5 1 1.3 1 2.2h5c0-.9.4-1.7 1-2.2A6 6 0 0 0 12 3z', 'stroke'],
    ['pin', 'Pin', 'M12 21s-6-6.2-6-11a6 6 0 0 1 12 0c0 4.8-6 11-6 11zM12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z', 'stroke'], ['arrowd', 'Arrow down', 'M12 4v15M6 13l6 6 6-6', 'stroke'],
    ['arrowr', 'Arrow right', 'M4 12h15M13 6l6 6-6 6', 'stroke'], ['circle', 'Circle', 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'stroke'], ['smile', 'Smile', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 14a4.5 4.5 0 0 0 7 0M9 9.5v.5M15 9.5v.5', 'stroke']
  ];
  const STK = Object.fromEntries(STICKERS.map(s => [s[0], s]));

  /* ---------- storage ---------- */
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; } };
  const saveAll = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch { } };

  let V = null;   /* the open viewer */
  L.openPoster = (list, id, opts) => {
    if (V) V.close(true);
    const start = Math.max(0, list.findIndex(p => p.id === id));
    V = makeViewer(list, start, opts); return V;
  };

  function makeViewer(list, idx, opts) {
    const dlg = d.createElement('dialog'); dlg.className = 'pv'; dlg.setAttribute('aria-label', 'Illustrated guide viewer');
    const sw = (arr, name) => arr.map((c, i) => `<button type="button" class="pv-sw" data-pv="${name}" data-v="${c}" style="--c:${c}" aria-label="Colour ${i + 1}" aria-pressed="false"></button>`).join('');
    dlg.innerHTML = `
      <div class="pv-top">
        <button type="button" class="pv-ib" data-pv="close" aria-label="Close the guide" title="Close (Esc)">${ic('x')}</button>
        <div class="pv-ttl"><span class="pv-cat"></span><b class="pv-name"></b></div>
        <div class="pv-nav"><button type="button" class="pv-ib" data-pv="prev" aria-label="Previous guide" title="Previous guide">${ic('prev')}</button><span class="pv-pos" aria-live="polite"></span><button type="button" class="pv-ib" data-pv="next" aria-label="Next guide" title="Next guide">${ic('next')}</button></div>
        <div class="pv-acts"><button type="button" class="pv-ib" data-pv="text" aria-label="Read the text of this guide" aria-pressed="false" title="Read the text">${ic('info')}</button><button type="button" class="pv-ib" data-pv="save" aria-label="Save as a picture" title="Save as a picture">${ic('dl')}</button></div>
      </div>
      <div class="pv-stage" tabindex="0" aria-label="Guide. Use the tools below to mark it up. Plus and minus zoom, zero fits.">
        <div class="pv-world"><img class="pv-img" alt="" draggable="false"><canvas class="pv-ink" aria-hidden="true"></canvas><div class="pv-dom"></div><div class="pv-selbox" hidden></div></div>
        <div class="pv-zoom" role="group" aria-label="Zoom"><button type="button" class="pv-ib" data-pv="zout" aria-label="Zoom out" title="Zoom out (-)">${ic('zout')}</button><button type="button" class="pv-pct" data-pv="fit" aria-label="Fit to the screen" title="Fit to the screen (0)">100%</button><button type="button" class="pv-ib" data-pv="zin" aria-label="Zoom in" title="Zoom in (+)">${ic('zin')}</button></div>
      </div>
      <aside class="pv-text" hidden aria-label="Text of this guide"></aside>
      <div class="pv-opts" data-for="none" hidden>
        <div class="pv-og pv-og-col" role="group" aria-label="Colour">${sw(COLORS, 'color')}</div>
        <div class="pv-og pv-og-hl" role="group" aria-label="Highlighter colour">${sw(HL, 'color')}</div>
        <div class="pv-og pv-og-note" role="group" aria-label="Note colour">${sw(NOTE, 'color')}</div>
        <div class="pv-og pv-og-size" role="group" aria-label="Size"><button type="button" class="pv-sz" data-pv="size" data-v="0" aria-label="Small" aria-pressed="false"><i style="--d:5px"></i></button><button type="button" class="pv-sz" data-pv="size" data-v="1" aria-label="Medium" aria-pressed="false"><i style="--d:9px"></i></button><button type="button" class="pv-sz" data-pv="size" data-v="2" aria-label="Large" aria-pressed="false"><i style="--d:14px"></i></button></div>
        <div class="pv-og pv-og-shape" role="group" aria-label="Shape">${[['rect', 'Box'], ['ellipse', 'Oval'], ['arrow', 'Arrow'], ['line', 'Line']].map(s => `<button type="button" class="pv-chip" data-pv="shape" data-v="${s[0]}" aria-pressed="false">${s[1]}</button>`).join('')}</div>
        <div class="pv-og pv-og-stk" role="group" aria-label="Stickers">${STICKERS.map(s => `<button type="button" class="pv-stkb" data-pv="stk" data-v="${s[0]}" aria-label="${s[1]} sticker" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true">${stkSvg(s)}</svg></button>`).join('')}</div>
      </div>
      <div class="pv-bar" role="toolbar" aria-label="Markup tools">
        <div class="pv-tg" role="group" aria-label="Tools">${[['select', 'Select and move', 'V'], ['pen', 'Pen', 'P'], ['marker', 'Marker', 'M'], ['hl', 'Highlighter', 'H'], ['text', 'Add text', 'T'], ['note', 'Sticky note', 'N'], ['shape', 'Shapes', 'S'], ['sticker', 'Stickers', 'E']].map(t => `<button type="button" class="pv-tool" data-pv="tool" data-v="${t[0]}" aria-pressed="false" aria-label="${t[1]} (${t[2]})" title="${t[1]} (${t[2]})">${ic(t[0])}<span>${t[1].replace('Select and move', 'Select').replace('Add text', 'Text').replace('Sticky note', 'Note')}</span></button>`).join('')}</div>
        <div class="pv-tg" role="group" aria-label="Edit">
          <button type="button" class="pv-tool" data-pv="undo" aria-label="Undo (Ctrl+Z)" title="Undo (Ctrl+Z)">${ic('undo')}<span>Undo</span></button>
          <button type="button" class="pv-tool" data-pv="redo" aria-label="Redo (Ctrl+Y)" title="Redo (Ctrl+Y)">${ic('redo')}<span>Redo</span></button>
          <button type="button" class="pv-tool" data-pv="del" aria-label="Delete the selected mark (Delete)" title="Delete selected (Delete)">${ic('trash')}<span>Delete</span></button>
          <button type="button" class="pv-tool" data-pv="clear" aria-label="Clear all markup" title="Clear all (you can undo)">${ic('clear')}<span>Clear all</span></button>
        </div>
      </div>
      <p class="pv-live sr-only" role="status" aria-live="polite"></p>`;
    d.body.append(dlg);
    const $ = (s, r) => (r || dlg).querySelector(s), $$ = (s, r) => [...(r || dlg).querySelectorAll(s)];
    const stage = $('.pv-stage'), world = $('.pv-world'), img = $('.pv-img'), cv = $('.pv-ink'), dom = $('.pv-dom'), selbox = $('.pv-selbox'), ctx = cv.getContext('2d');
    const S = { i: idx, items: [], undo: [], redo: [], sel: null, tool: 'select', color: COLORS[0], hl: HL[0], note: NOTE[0], size: 1, shape: 'rect', stk: 'check', W: 1086, H: 1448, s: 1, tx: 0, ty: 0, fit: 1, cur: null, pts: new Map(), edit: null };
    const reduced = L.reduced;
    const say = m => { const l = $('.pv-live'); l.textContent = ''; setTimeout(() => { l.textContent = m; }, 30); };
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const poster = () => list[S.i];
    const uid = () => Math.random().toString(36).slice(2, 9);
    function stkSvg(s) { return s[3] === 'fill' ? `<path d="${s[2]}" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>` : s[3] === 'warn' ? `<path d="${s[2].split('M12 10')[0]}" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M12 10v5M12 17.5v.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>` : `<path d="${s[2]}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`; }

    /* ---------- persistence and history ---------- */
    const persist = () => { const o = load(), id = poster().id; if (S.items.length) o[id] = S.items; else delete o[id]; saveAll(o); };
    const snap = () => { S.undo.push(JSON.stringify(S.items)); if (S.undo.length > HIST) S.undo.shift(); S.redo = []; updateBtns(); };
    const restore = js => { S.items = JSON.parse(js); S.sel = null; paint(); persist(); updateBtns(); };
    function undo() { if (!S.undo.length) return; S.redo.push(JSON.stringify(S.items)); restore(S.undo.pop()); say('Undone'); }
    function redo() { if (!S.redo.length) return; S.undo.push(JSON.stringify(S.items)); restore(S.redo.pop()); say('Redone'); }
    function updateBtns() { $('[data-pv=undo]').disabled = !S.undo.length; $('[data-pv=redo]').disabled = !S.redo.length; $('[data-pv=del]').disabled = !S.sel; $('[data-pv=clear]').disabled = !S.items.length; const a = d.activeElement; if (a && a.disabled && dlg.contains(a)) stage.focus({ preventScroll: true }); }

    /* ---------- drawing ---------- */
    function drawItem(c, it) {
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      if (it.t === 'pen' || it.t === 'marker' || it.t === 'hl') {
        c.strokeStyle = it.c; c.lineWidth = it.w; c.globalAlpha = it.t === 'hl' ? .38 : it.t === 'marker' ? .92 : 1; if (it.t === 'hl') c.globalCompositeOperation = 'multiply';
        c.beginPath(); const p = it.p; c.moveTo(p[0][0], p[0][1]);
        if (p.length === 1) c.lineTo(p[0][0] + .1, p[0][1]); else for (let i = 1; i < p.length - 1; i++) { const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2; c.quadraticCurveTo(p[i][0], p[i][1], mx, my); }
        if (p.length > 1) c.lineTo(p[p.length - 1][0], p[p.length - 1][1]); c.stroke();
      } else if (it.t === 'shape') {
        c.strokeStyle = it.c; c.lineWidth = it.w; const [a, b] = it.p;
        if (it.k === 'rect') c.strokeRect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
        else if (it.k === 'ellipse') { c.beginPath(); c.ellipse((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.abs(b[0] - a[0]) / 2 || 1, Math.abs(b[1] - a[1]) / 2 || 1, 0, 0, Math.PI * 2); c.stroke(); }
        else { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); if (it.k === 'arrow') { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), h = Math.max(16, it.w * 4); c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[0] - h * Math.cos(ang - .45), b[1] - h * Math.sin(ang - .45)); c.moveTo(b[0], b[1]); c.lineTo(b[0] - h * Math.cos(ang + .45), b[1] - h * Math.sin(ang + .45)); c.stroke(); } }
      }
      c.restore();
    }
    const inkItems = () => S.items.filter(i => i.t === 'pen' || i.t === 'marker' || i.t === 'hl' || i.t === 'shape');
    function paint() {
      ctx.clearRect(0, 0, cv.width, cv.height); inkItems().forEach(i => drawItem(ctx, i));
      if (S.cur) drawItem(ctx, S.cur);
      dom.textContent = ''; S.items.forEach(it => { if (it.t === 'text' || it.t === 'note' || it.t === 'sticker') dom.append(domNode(it)); });
      placeSel(); updateBtns();
    }
    function domNode(it) {
      const n = d.createElement('div'); n.className = 'pv-it pv-' + it.t; n.dataset.id = it.id; n.style.left = it.x + 'px'; n.style.top = it.y + 'px';
      if (it.t === 'sticker') { n.style.width = n.style.height = it.s + 'px'; n.style.color = it.c; n.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${stkSvg(STK[it.k] || STICKERS[0])}</svg>`; n.setAttribute('role', 'img'); n.setAttribute('aria-label', (STK[it.k] || STICKERS[0])[1] + ' sticker'); return n; }
      n.style.fontSize = it.s + 'px'; n.textContent = it.text || ''; n.setAttribute('role', 'note'); n.tabIndex = -1;
      if (it.t === 'text') n.style.color = it.c; else { n.style.background = it.c; n.style.width = it.w + 'px'; }
      return n;
    }
    const bbox = it => {
      if (it.t === 'text' || it.t === 'note' || it.t === 'sticker') { const n = dom.querySelector(`[data-id="${it.id}"]`); return n ? [it.x, it.y, it.x + n.offsetWidth, it.y + n.offsetHeight] : [it.x, it.y, it.x + 40, it.y + 40]; }
      if (it.t === 'shape') { const [a, b] = it.p; return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; }
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; it.p.forEach(q => { x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); }); const h = it.w / 2; return [x0 - h, y0 - h, x1 + h, y1 + h];
    };
    function placeSel() {
      updateOpts();
      const it = S.items.find(i => i.id === S.sel); if (!it || S.tool !== 'select' && !S.edit) { selbox.hidden = true; return; }
      const b = bbox(it), pad = 6; selbox.hidden = false; selbox.style.left = b[0] - pad + 'px'; selbox.style.top = b[1] - pad + 'px'; selbox.style.width = b[2] - b[0] + pad * 2 + 'px'; selbox.style.height = b[3] - b[1] + pad * 2 + 'px'; selbox.style.setProperty('--k', 1 / S.s);
    }
    const dseg = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy || 1, t = clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l, 0, 1); return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy)); };
    function hit(p) {
      const tol = 12 / S.s;
      for (let k = S.items.length - 1; k >= 0; k--) {
        const it = S.items[k];
        if (it.t === 'text' || it.t === 'note' || it.t === 'sticker') { const b = bbox(it); if (p[0] >= b[0] && p[0] <= b[2] && p[1] >= b[1] && p[1] <= b[3]) return it; continue; }
        if (it.t === 'shape') { const [a, b] = it.p; if (it.k === 'rect' || it.k === 'ellipse') { const b2 = bbox(it); const inside = p[0] > b2[0] + tol && p[0] < b2[2] - tol && p[1] > b2[1] + tol && p[1] < b2[3] - tol; if (p[0] >= b2[0] - tol && p[0] <= b2[2] + tol && p[1] >= b2[1] - tol && p[1] <= b2[3] + tol && !inside) return it; } else if (dseg(p, a, b) < tol + it.w) return it; continue; }
        for (let i = 0; i < it.p.length - 1 || i === 0; i++) if (dseg(p, it.p[i], it.p[Math.min(i + 1, it.p.length - 1)]) < tol + it.w / 2) return it;
      }
      return null;
    }

    /* ---------- view: fit, zoom, pan ---------- */
    function applyView() {
      world.style.transform = `translate(${S.tx}px,${S.ty}px) scale(${S.s})`; $('.pv-pct').textContent = Math.round(S.s / S.fit * 100) + '%'; selbox.style.setProperty('--k', 1 / S.s);
    }
    function clampPan() {
      const W = stage.clientWidth, H = stage.clientHeight, w = S.W * S.s, h = S.H * S.s, m = 80;
      S.tx = w <= W ? (W - w) / 2 : clamp(S.tx, W - w - m, m); S.ty = h <= H ? (H - h) / 2 : clamp(S.ty, H - h - m, m);
    }
    function fitView(keepZoom) { const W = stage.clientWidth, H = stage.clientHeight, was = Math.abs(S.s - S.fit) < .002; S.fit = Math.min((W - 24) / S.W, (H - 24) / S.H); if (!keepZoom || was || S.s < S.fit) S.s = S.fit; clampPan(); applyView(); }
    function zoomTo(ns, cx, cy) { ns = clamp(ns, S.fit * .6, 4); const k = ns / S.s; cx = cx == null ? stage.clientWidth / 2 : cx; cy = cy == null ? stage.clientHeight / 2 : cy; S.tx = cx - (cx - S.tx) * k; S.ty = cy - (cy - S.ty) * k; S.s = ns; clampPan(); applyView(); }
    const toWorld = e => { const r = stage.getBoundingClientRect(); return [(e.clientX - r.left - S.tx) / S.s, (e.clientY - r.top - S.ty) / S.s]; };

    /* ---------- tools ---------- */
    const isInk = t => t === 'pen' || t === 'marker' || t === 'hl';
    const curColor = () => S.tool === 'hl' ? S.hl : S.tool === 'note' ? S.note : S.color;
    const curWidth = t => (WIDTHS[t === 'shape' ? 'shape' : t] || WIDTHS.pen)[S.size];
    const selTool = () => { const it = S.items.find(i => i.id === S.sel); return it ? (it.t === 'shape' ? 'shape' : it.t === 'sticker' ? 'sticker' : it.t) : null; };
    function setTool(t, silent) {
      if (S.edit) endEdit(); S.tool = t; stage.dataset.tool = t;
      $$('[data-pv=tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === t)));
      updateOpts(); placeSel(); if (!silent) say($(`[data-pv=tool][data-v=${t}]`).getAttribute('aria-label'));
    }
    /* the option bar follows the active tool, or the selected mark when you are in Select */
    function updateOpts() {
      const o = $('.pv-opts'), t = S.tool === 'select' ? selTool() : S.tool, it = S.items.find(i => i.id === S.sel); o.hidden = !t;
      if (!t) return; o.dataset.for = t;
      $$('.pv-og', o).forEach(g => { const k = g.classList; g.hidden = !(k.contains('pv-og-col') && ['pen', 'marker', 'text', 'shape', 'sticker'].includes(t) || k.contains('pv-og-hl') && (t === 'hl') || k.contains('pv-og-note') && t === 'note' || k.contains('pv-og-size') || k.contains('pv-og-shape') && t === 'shape' || k.contains('pv-og-stk') && t === 'sticker'); });
      const col = it && S.tool === 'select' ? it.c : t === 'hl' ? S.hl : t === 'note' ? S.note : S.color;
      $$('.pv-sw').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v.toLowerCase() === String(col).toLowerCase())));
      let sz = S.size; if (it && S.tool === 'select') { const arr = it.t === 'text' || it.t === 'note' || it.t === 'sticker' ? SIZES[it.t] : WIDTHS[it.t === 'shape' ? 'shape' : it.t]; const v = it.t === 'text' || it.t === 'note' || it.t === 'sticker' ? it.s : it.w; sz = arr.reduce((b, x, i) => Math.abs(x - v) < Math.abs(arr[b] - v) ? i : b, 0); }
      $$('[data-pv=size]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === sz)));
      const sh = it && S.tool === 'select' && it.t === 'shape' ? it.k : S.shape, sk = it && S.tool === 'select' && it.t === 'sticker' ? it.k : S.stk;
      $$('[data-pv=shape]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === sh)));
      $$('[data-pv=stk]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === sk)));
    }
    const syncOpts = updateOpts;
    function changeSelected(fn) { const it = S.items.find(i => i.id === S.sel); if (!it) return false; snap(); fn(it); paint(); persist(); return true; }

    /* text and sticky notes: edit in place */
    function beginEdit(it) {
      const n = dom.querySelector(`[data-id="${it.id}"]`); if (!n) return; S.edit = it.id; S.sel = it.id; n.contentEditable = 'plaintext-only'; if (n.contentEditable !== 'plaintext-only') n.contentEditable = 'true';
      n.classList.add('is-edit'); n.setAttribute('aria-label', it.t === 'note' ? 'Sticky note text' : 'Text'); n.focus(); const r = d.createRange(); r.selectNodeContents(n); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); placeSel();
      n.addEventListener('blur', () => endEdit(), { once: true });
      n.addEventListener('input', placeSel);
    }
    function endEdit() {
      if (!S.edit) return; const id = S.edit; S.edit = null; const n = dom.querySelector(`[data-id="${id}"]`), it = S.items.find(i => i.id === id); if (!it) return;
      const txt = n ? n.innerText.replace(/ /g, ' ').replace(/\n+$/, '') : it.text; n && (n.contentEditable = 'false', n.classList.remove('is-edit'));
      if (!txt.trim()) { S.items = S.items.filter(i => i.id !== id); if (it.fresh) { S.undo.pop(); } else { } S.sel = null; paint(); persist(); return; }
      if (txt !== it.text) { if (!it.fresh) snap(); it.text = txt; }
      delete it.fresh; paint(); persist();
    }

    /* ---------- pointer handling ---------- */
    stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.pv-zoom')) return;
      stage.setPointerCapture(e.pointerId); S.pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (S.edit && !e.target.closest('.is-edit')) endEdit();
      if (S.pts.size === 2) { S.cur = null; S.drag = null; const [a, b] = [...S.pts.values()]; S.pinch = { dist: Math.hypot(a[0] - b[0], a[1] - b[1]), s: S.s }; paint(); return; }
      if (e.button > 0) return; const p = toWorld(e);
      if (e.target.closest('.is-edit')) return;
      const t = S.tool, spacePan = S.space;
      if (spacePan) { S.drag = { k: 'pan', x: e.clientX, y: e.clientY, tx: S.tx, ty: S.ty }; return; }
      if (t === 'select') {
        const it = hit(p);
        if (it) { S.sel = it.id; S.drag = { k: 'move', p0: p, orig: JSON.stringify(it), it, moved: false }; paint(); }
        else { S.sel = null; paint(); S.drag = { k: 'pan', x: e.clientX, y: e.clientY, tx: S.tx, ty: S.ty }; }
        return;
      }
      e.preventDefault();
      if (isInk(t)) { S.cur = { t, id: uid(), c: curColor(), w: curWidth(t), p: [p] }; paint(); return; }
      if (t === 'shape') { S.cur = { t: 'shape', id: uid(), k: S.shape, c: S.color, w: curWidth('shape'), p: [p, p] }; paint(); return; }
      if (t === 'text' || t === 'note') {
        snap(); const sz = SIZES[t][S.size], it = t === 'text' ? { t, id: uid(), x: p[0] - 4, y: p[1] - sz / 2, c: S.color, s: sz, text: '', fresh: true } : { t, id: uid(), x: p[0] - 90, y: p[1] - 40, c: S.note, s: sz, w: Math.round(sz * 8.5), text: '', fresh: true };
        S.items.push(it); paint(); beginEdit(it); return;
      }
      if (t === 'sticker') { snap(); const sz = SIZES.sticker[S.size], it = { t: 'sticker', id: uid(), k: S.stk, x: p[0] - sz / 2, y: p[1] - sz / 2, s: sz, c: S.color }; S.items.push(it); S.sel = it.id; paint(); persist(); say((STK[S.stk] || STICKERS[0])[1] + ' sticker added'); setTool('select', true); }
    });
    stage.addEventListener('pointermove', e => {
      if (S.pts.has(e.pointerId)) S.pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (S.pinch && S.pts.size === 2) { const [a, b] = [...S.pts.values()], dist = Math.hypot(a[0] - b[0], a[1] - b[1]), r = stage.getBoundingClientRect(); zoomTo(S.pinch.s * dist / S.pinch.dist, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top); return; }
      if (S.cur) {
        const p = toWorld(e); if (S.cur.t === 'shape') { S.cur.p[1] = e.shiftKey && S.cur.k !== 'arrow' && S.cur.k !== 'line' ? [S.cur.p[0][0] + Math.max(p[0] - S.cur.p[0][0], p[1] - S.cur.p[0][1]), S.cur.p[0][1] + Math.max(p[0] - S.cur.p[0][0], p[1] - S.cur.p[0][1])] : p; } else { const l = S.cur.p[S.cur.p.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) * S.s > 1.5) S.cur.p.push(p); }
        ctx.clearRect(0, 0, cv.width, cv.height); inkItems().forEach(i => drawItem(ctx, i)); drawItem(ctx, S.cur); return;
      }
      const g = S.drag; if (!g) return;
      if (g.k === 'pan') { S.tx = g.tx + e.clientX - g.x; S.ty = g.ty + e.clientY - g.y; clampPan(); applyView(); }
      else if (g.k === 'move') {
        const p = toWorld(e), dx = p[0] - g.p0[0], dy = p[1] - g.p0[1]; if (!g.moved && Math.hypot(dx, dy) * S.s < 3) return; if (!g.moved) { g.moved = true; snap(); }
        const o = JSON.parse(g.orig), it = g.it; if (o.p) it.p = o.p.map(q => [q[0] + dx, q[1] + dy]); else { it.x = o.x + dx; it.y = o.y + dy; }
        paint();
      }
    });
    const up = e => {
      S.pts.delete(e.pointerId); if (S.pts.size < 2) S.pinch = null;
      if (S.cur) { const c = S.cur; S.cur = null; const tiny = c.t === 'shape' && Math.hypot(c.p[1][0] - c.p[0][0], c.p[1][1] - c.p[0][1]) < 6; if (!tiny) { snap(); S.items.push(c); S.sel = null; persist(); } paint(); }
      const g = S.drag; S.drag = null; if (g && g.k === 'move' && g.moved) { persist(); updateBtns(); }
    };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('dblclick', e => { if (S.tool !== 'select') return; const it = hit(toWorld(e)); if (it && (it.t === 'text' || it.t === 'note')) beginEdit(it); else if (!it) { fitView(); } });
    stage.addEventListener('wheel', e => { e.preventDefault(); const r = stage.getBoundingClientRect(); zoomTo(S.s * (e.deltaY < 0 ? 1.12 : .89), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    new ResizeObserver(() => { if (img.naturalWidth) fitView(true); }).observe(stage);

    /* ---------- poster loading ---------- */
    function open(i, first) {
      if (!first) { if (S.edit) endEdit(); persist(); } S.i = clamp(i, 0, list.length - 1); const p = poster();
      $('.pv-cat').textContent = p.cat; $('.pv-name').textContent = p.title; $('.pv-pos').textContent = `${S.i + 1} of ${list.length}`; dlg.setAttribute('aria-label', `${p.title}. Illustrated guide viewer`);
      $('[data-pv=prev]').disabled = S.i === 0; $('[data-pv=next]').disabled = S.i === list.length - 1;
      img.alt = `${p.title}. ${p.outcome}`; S.items = (load()[p.id] || []); S.undo = []; S.redo = []; S.sel = null;
      const ready = () => { S.W = img.naturalWidth || 1086; S.H = img.naturalHeight || 1448; img.style.width = S.W + 'px'; img.style.height = S.H + 'px'; cv.width = S.W; cv.height = S.H; cv.style.width = S.W + 'px'; cv.style.height = S.H + 'px'; dom.style.width = S.W + 'px'; dom.style.height = S.H + 'px'; S.s = 0; fitView(); paint(); };
      world.dataset.loading = '1'; img.onload = () => { delete world.dataset.loading; ready(); }; img.onerror = () => { delete world.dataset.loading; }; img.src = p.src; if (img.complete && img.naturalWidth) { delete world.dataset.loading; ready(); }
      renderText(); st.atlasLast = p.id; L.save(); updateBtns();
      if (!first) say(`${p.title}, ${S.i + 1} of ${list.length}`);
    }
    const st = L.st;
    function renderText() {
      const p = poster(), t = $('.pv-text');
      t.innerHTML = `<h2>${esc(p.title)}</h2><p>${esc(p.outcome)}</p>${p.terms && p.terms.length ? `<h3>Key words</h3><ul>${p.terms.map(x => `<li><b>${esc(x.term)}</b> ${esc(x.def)}</li>`).join('')}</ul>` : ''}${p.caution ? `<h3>Keep in mind</h3><p>${esc(p.caution)}</p>` : ''}${p.q ? `<details><summary>Test yourself: ${esc(p.q)}</summary><p>${esc(p.a || '')}</p></details>` : ''}`;
    }

    /* ---------- save as a picture ---------- */
    function wrap(c, text, maxW) { const out = []; String(text).split('\n').forEach(par => { let line = ''; par.split(' ').forEach(w => { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }); out.push(line); }); return out; }
    function savePicture() {
      if (!img.naturalWidth) return; const c = d.createElement('canvas'); c.width = S.W; c.height = S.H; const x = c.getContext('2d'); x.drawImage(img, 0, 0, S.W, S.H); x.drawImage(cv, 0, 0);
      S.items.forEach(it => {
        if (it.t === 'text') { x.fillStyle = it.c; x.font = `600 ${it.s}px Inter,system-ui,sans-serif`; x.textBaseline = 'top'; const n = dom.querySelector(`[data-id="${it.id}"]`), maxW = n ? n.offsetWidth + 4 : 1e4; wrap(x, it.text, maxW).forEach((l, k) => x.fillText(l, it.x, it.y + k * it.s * 1.25)); }
        else if (it.t === 'note') { const pad = it.s * .5; x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(it.x + 3, it.y + 5, it.w, bbox(it)[3] - it.y); x.fillStyle = it.c; x.fillRect(it.x, it.y, it.w, bbox(it)[3] - it.y); x.fillStyle = '#10253A'; x.font = `500 ${it.s}px Inter,system-ui,sans-serif`; x.textBaseline = 'top'; wrap(x, it.text, it.w - pad * 2).forEach((l, k) => x.fillText(l, it.x + pad, it.y + pad + k * it.s * 1.3)); }
        else if (it.t === 'sticker') { const s = STK[it.k] || STICKERS[0], k = it.s / 24; x.save(); x.translate(it.x, it.y); x.scale(k, k); x.strokeStyle = x.fillStyle = it.c; x.lineCap = x.lineJoin = 'round'; if (s[3] === 'fill') { const p = new Path2D(s[2]); x.lineWidth = 1.2; x.fill(p); x.stroke(p); } else if (s[3] === 'warn') { const p = new Path2D(s[2].split('M12 10')[0]); x.lineWidth = 1.2; x.fill(p); x.stroke(p); x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke(new Path2D('M12 10v5M12 17.5v.5')); } else { x.lineWidth = 2.4; x.stroke(new Path2D(s[2])); } x.restore(); }
      });
      c.toBlob(b => { if (!b) return; const u = URL.createObjectURL(b), a = d.createElement('a'); a.href = u; a.download = 'medlex-' + poster().id + (S.items.length ? '-marked' : '') + '.png'; d.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); say('Saved as a picture'); }, 'image/png');
    }

    /* ---------- controls ---------- */
    dlg.addEventListener('click', e => {
      const b = e.target.closest('[data-pv]'); if (!b) return; const a = b.dataset.pv, v = b.dataset.v;
      if (a === 'close') close(); else if (a === 'prev') open(S.i - 1); else if (a === 'next') open(S.i + 1);
      else if (a === 'tool') setTool(v); else if (a === 'undo') undo(); else if (a === 'redo') redo();
      else if (a === 'del') { if (S.sel) { snap(); S.items = S.items.filter(i => i.id !== S.sel); S.sel = null; paint(); persist(); say('Deleted'); } }
      else if (a === 'clear') { if (S.items.length) { snap(); S.items = []; S.sel = null; paint(); persist(); say('All markup cleared. Undo brings it back.'); } }
      else if (a === 'zin') zoomTo(S.s * 1.25); else if (a === 'zout') zoomTo(S.s / 1.25); else if (a === 'fit') fitView();
      else if (a === 'save') savePicture();
      else if (a === 'text') { const t = $('.pv-text'); t.hidden = !t.hidden; b.setAttribute('aria-pressed', String(!t.hidden)); dlg.classList.toggle('has-text', !t.hidden); setTimeout(() => fitView(true), 60); }
      else if (a === 'color') { if (!S.sel || S.tool !== 'select') { if (S.tool === 'hl') S.hl = v; else if (S.tool === 'note') S.note = v; else S.color = v; } if (S.sel) changeSelected(x => { x.c = v; }); updateOpts(); }
      else if (a === 'size') { S.size = +v; if (S.sel) changeSelected(x => { if (x.t === 'text' || x.t === 'note' || x.t === 'sticker') { x.s = SIZES[x.t][+v]; if (x.t === 'note') x.w = Math.round(x.s * 8.5); } else x.w = (WIDTHS[x.t === 'shape' ? 'shape' : x.t] || WIDTHS.pen)[+v]; }); updateOpts(); }
      else if (a === 'shape') { S.shape = v; if (S.sel) changeSelected(x => { if (x.t === 'shape') x.k = v; }); updateOpts(); }
      else if (a === 'stk') { S.stk = v; if (S.sel) changeSelected(x => { if (x.t === 'sticker') x.k = v; }); updateOpts(); }
    });
    dlg.addEventListener('cancel', e => { e.preventDefault(); if (S.edit) { endEdit(); return; } if (S.sel) { S.sel = null; placeSel(); updateBtns(); return; } close(); });
    const onKey = e => {
      if (!dlg.isConnected) return;
      const typing = S.edit || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName); const k = e.key, mod = e.ctrlKey || e.metaKey;
      if (k === ' ' && !typing && e.target === stage) { S.space = true; e.preventDefault(); }
      if (typing) return;
      if (mod && k.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (mod && k.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
      if ((k === 'Delete' || k === 'Backspace') && S.sel) { e.preventDefault(); $('[data-pv=del]').click(); return; }
      if (mod || e.altKey) return;
      const map = { v: 'select', p: 'pen', m: 'marker', h: 'hl', t: 'text', n: 'note', s: 'shape', e: 'sticker' };
      if (map[k.toLowerCase()] && !e.target.closest('input')) { e.preventDefault(); setTool(map[k.toLowerCase()]); return; }
      if (k === '+' || k === '=') { e.preventDefault(); zoomTo(S.s * 1.25); } else if (k === '-') { e.preventDefault(); zoomTo(S.s / 1.25); } else if (k === '0') { e.preventDefault(); fitView(); }
      else if ((k === 'ArrowLeft' || k === 'PageUp') && !S.sel) { open(S.i - 1); } else if ((k === 'ArrowRight' || k === 'PageDown') && !S.sel) { open(S.i + 1); }
      else if (S.sel && k.startsWith('Arrow')) { e.preventDefault(); const st2 = e.shiftKey ? 20 : 4, dx = k === 'ArrowLeft' ? -st2 : k === 'ArrowRight' ? st2 : 0, dy = k === 'ArrowUp' ? -st2 : k === 'ArrowDown' ? st2 : 0; changeSelected(x => { if (x.p) x.p = x.p.map(q => [q[0] + dx, q[1] + dy]); else { x.x += dx; x.y += dy; } }); }
      else if (k === 'Enter' && S.sel) { const it = S.items.find(i => i.id === S.sel); if (it && (it.t === 'text' || it.t === 'note')) { e.preventDefault(); beginEdit(it); } }
    };
    const onKeyUp = e => { if (e.key === ' ') S.space = false; };
    d.addEventListener('keydown', onKey); d.addEventListener('keyup', onKeyUp);

    function close(silent) {
      const cb = opts && opts.onClose;
      if (S.edit) endEdit(); persist();
      d.removeEventListener('keydown', onKey); d.removeEventListener('keyup', onKeyUp); try { dlg.close(); } catch { } dlg.remove(); V = null; if (!silent) { if (cb) { try { cb(); } catch { } } if (L.atlasRefresh) L.atlasRefresh(); const back = d.querySelector(`.lx-atl[data-id="${poster().id}"]`) || d.querySelector('[data-lx=atlasopen]'); back && back.focus && back.focus({ preventScroll: true }); }
    }
    dlg.showModal(); setTool('select', true); open(S.i, true); $('.pv-stage').focus({ preventScroll: true });
    return { close, open };
  }
})();
