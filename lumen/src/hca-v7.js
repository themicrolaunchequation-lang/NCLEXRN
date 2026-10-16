/* HCA v7 — Lumen reader tools layer, injected after v6 (see lumen/tools/build.mjs).
   Everything here works offline and uses no AI:
   - more pen colours, a marker (see-through) pen, more widths, more highlight colours
   - sticky notes that can be dragged to a new spot, and placed by clicking the page
   - Snip (drag a box, then copy, download or keep the image) and a Magnifier lens
   - Stickers: drag clinical emoji and labels onto a page, move them, resize them
   - a floating calculator with clinical formulas, which stays open while you read
   - Meaning: select text for a plain definition (offline glossary, then dictionary and Simple Wikipedia)
   - Present and Export: slides from your highlights, notes and snips; PowerPoint, Word, Markdown, print, CSV
   - PowerPoint import: .pptx files become image pages in the Library
   New workspace keys (optional, ignored by older versions): hcaStamps, hcaSnips. */

/* ---------- Floating UI store (calculator, stickers tray, meaning card, presenter, status) ---------- */
const HCA7UI = { state: { calc: false, tray: false, define: null, present: null, progress: null, choose: null }, subs: new Set() };
function HCA7Set(patch) { HCA7UI.state = { ...HCA7UI.state, ...(typeof patch === 'function' ? patch(HCA7UI.state) : patch) }; HCA7UI.subs.forEach(f => f()); }
function HCA7Use() {
  const [, force] = _.useState(0);
  _.useEffect(() => { const f = () => force(n => n + 1); HCA7UI.subs.add(f); return () => HCA7UI.subs.delete(f); }, []);
  return HCA7UI.state;
}
const HCA7Reader = { bookId: null };
HCAReaderPageWidth = function HCA7ReaderPageWidth(width, height, spread, fit, ratio = 1.414) {
  const cols = spread ? 2 : 1, w = Math.max(140, (width - 24) / cols);
  return fit === 'page' ? Math.max(140, Math.min(w, (height - 20) / ratio)) : w;
};

/* Floating windows: drag by the header, resize from the corner, and they reopen where you left them. */
const HCA7_WIN_KEY = 'lumen.windows';
const HCA7WinStore = () => { try { return JSON.parse(localStorage.getItem(HCA7_WIN_KEY) || '{}'); } catch { return {}; } };
function HCA7Win(id) {
  const ref = _.useRef(null), drag = _.useRef(null), [geo, setGeo] = _.useState(() => HCA7WinStore()[id] || null);
  const save = g => { try { const all = HCA7WinStore(); all[id] = g; localStorage.setItem(HCA7_WIN_KEY, JSON.stringify(all)); } catch {} };
  const clamp = g => ({ ...g, left: HCABound(g.left, 0, Math.max(0, innerWidth - 120)), top: HCABound(g.top, 0, Math.max(0, innerHeight - 48)) });
  _.useEffect(() => {
    const el = ref.current; if (!el || !window.ResizeObserver) return;
    let t = null;
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => { const r = el.getBoundingClientRect(); if (el.dataset.resized) save({ ...(HCA7WinStore()[id] || {}), left: r.left, top: r.top, width: r.width, height: r.height }); }, 250); });
    ro.observe(el);
    const mark = () => { el.dataset.resized = '1'; };
    el.addEventListener('pointerdown', mark);
    return () => { ro.disconnect(); el.removeEventListener('pointerdown', mark); clearTimeout(t); };
  }, []);
  const header = {
    onPointerDown: e => { if (e.target.closest('button,input,select')) return; const r = ref.current.getBoundingClientRect(); drag.current = { x0: e.clientX, y0: e.clientY, r }; e.currentTarget.setPointerCapture?.(e.pointerId); },
    onPointerMove: e => { const d = drag.current; if (!d) return; setGeo(g => clamp({ ...(g || {}), left: d.r.left + e.clientX - d.x0, top: d.r.top + e.clientY - d.y0, width: d.r.width, height: g?.height })); },
    onPointerUp: () => { if (!drag.current) return; drag.current = null; const r = ref.current.getBoundingClientRect(); const g = clamp({ left: r.left, top: r.top, width: r.width, height: geo?.height || undefined }); setGeo(g); save({ ...g, height: r.height }); },
    onDoubleClick: () => { setGeo(null); save(null); },
  };
  const style = geo ? { left: geo.left, top: geo.top, right: 'auto', bottom: 'auto', width: geo.width, height: geo.height } : undefined;
  return { ref, style, header };
}

/* ---------- Colours ---------- */
const HCA7PenColors = [['#10253a', 'Navy'], ['#111111', 'Black'], ['#1f6feb', 'Blue'], ['#087d7a', 'Teal'], ['#2f8f46', 'Green'], ['#7a4fd1', 'Purple'], ['#d03b8c', 'Pink'], ['#9e3e3e', 'Red'], ['#e0711b', 'Orange'], ['#bd764a', 'Copper']];
const HCA7HighlightColors = ['#f1d98e', '#fff27a', '#b9d8bd', '#a9d4f5', '#c9c6e9', '#f5b8d0', '#f0bd9f', '#d9d9d9'];
const HCA7ColorNames = { '#f1d98e': 'amber', '#fff27a': 'lemon', '#b9d8bd': 'sage', '#a9d4f5': 'sky', '#c9c6e9': 'lavender', '#f5b8d0': 'rose', '#f0bd9f': 'peach', '#d9d9d9': 'grey' };
const HCA7ColorName = c => HCA7ColorNames[c] || c;
const HCA7StickyColors = [['#ffe2a3', 'Amber'], ['#bfe1d9', 'Teal'], ['#e0d7ef', 'Lavender'], ['#cfe6fb', 'Sky'], ['#fbd3e2', 'Rose'], ['#dff0c8', 'Lime']];
const HCA7Stroke = settings => {
  const color = settings.penColor || '#10253a', width = settings.penWidth || 3;
  return settings.penMarker ? { color: color.slice(0, 7) + '59', width: Math.max(10, width * 4) } : { color, width };
};

HCAPenSettings = function HCA7PenSettings({ book, page, tool, onTool }) {
  const ctx = y(), st = ctx.state.settings, inks = (ctx.state.ink || []).filter(i => i.bookId === book.id && i.page === page);
  const color = st.penColor || '#10253a', marker = !!st.penMarker;
  const set = patch => ctx.setState(s => ({ ...s, settings: { ...s.settings, ...patch } }));
  const title = ({ pen: marker ? 'Marker is active' : 'Pen is active', sticky: 'Click the page to place your note', 'note-area': 'Drag a region, then add your note', highlight: 'Select a passage to highlight', erase: 'Click a pen stroke to erase it', snip: 'Drag a box to snip', magnify: 'Move over the page to magnify' })[tool] || 'Page tools';
  const clear = () => ctx.setModal({ type: 'confirm', title: `Clear all ink on page ${page}?`, text: 'Pen and marker strokes on this page are removed. Notes, highlights and stickers stay.', onConfirm: () => ctx.setState(s => ({ ...s, ink: (s.ink || []).filter(i => !(i.bookId === book.id && i.page === page)) })) });
  return HC('section', { className: 'hca-pen-settings hca7-pen' },
    HC('div', { className: 'hca-sidecar-section-title' }, HC('strong', {}, title), HC('span', {}, `${inks.length} ink stroke${inks.length === 1 ? '' : 's'}`)),
    HC('div', { className: 'hca7-seg', role: 'group', 'aria-label': 'Pen type' },
      HC('button', { type: 'button', 'aria-pressed': !marker, onClick: () => { set({ penMarker: false }); onTool('pen'); } }, HCAIcon('edit-line'), 'Pen'),
      HC('button', { type: 'button', 'aria-pressed': marker, onClick: () => { set({ penMarker: true }); onTool('pen'); } }, HCAIcon('mark-pen-line'), 'Marker')),
    HC('div', { className: 'hca7-swatches', role: 'group', 'aria-label': 'Pen colour' },
      HCA7PenColors.map(([c, label]) => HC('button', { key: c, type: 'button', style: { background: c }, 'aria-label': `${label} ${marker ? 'marker' : 'pen'}`, title: label, 'aria-pressed': color === c, onClick: () => { set({ penColor: c }); onTool('pen'); } }, color === c ? HCAIcon('check-line') : null)),
      HC('label', { className: 'hca7-custom', title: 'Any colour' }, HC('input', { type: 'color', value: color.slice(0, 7), 'aria-label': 'Choose any pen colour', onChange: e => { set({ penColor: e.target.value }); onTool('pen'); } }))),
    HC('div', { className: 'hca7-row' },
      HC('label', {}, 'Width', HC('select', { 'aria-label': 'Pen width', value: st.penWidth || 3, onChange: e => set({ penWidth: Number(e.target.value) }) }, [1, 2, 3, 5, 8].map(v => HC('option', { value: v, key: v }, `${v}px${marker ? ` (marker ${Math.max(10, v * 4)}px)` : ''}`)))),
      HC('span', { className: 'hca7-preview', 'aria-hidden': 'true' }, HC('svg', { viewBox: '0 0 80 20' }, HC('path', { d: 'M4 14 Q 24 2 40 10 T 76 8', fill: 'none', stroke: HCA7Stroke(st).color, strokeWidth: Math.min(16, HCA7Stroke(st).width), strokeLinecap: 'round' })))),
    HC('div', { className: 'hca-sidecar-actions' },
      HCABtn('Undo ink', () => HCACurrentInkUndo(ctx, book.id, page), 'secondary', 'arrow-go-back-line', { disabled: !inks.length }),
      HCABtn('Eraser', () => onTool(tool === 'erase' ? 'select' : 'erase'), 'secondary', 'delete-bin-line'),
      HCABtn('Clear page', clear, 'secondary', 'close-line', { disabled: !inks.length })),
    HC('p', { className: 'hca-small' }, 'Draw with a mouse, touch or stylus. Drag a sticky note to move it. Escape returns to selecting text.'));
};

/* ---------- Page layer: ink, marker, movable sticky pins, snip, magnifier, stickers ---------- */
function HCA7SourceImage(wrap) {
  // The page bitmap only: a PDF canvas or a page image that spans the page width (not a photo inside an HTML page).
  const ww = wrap?.getBoundingClientRect().width || 0;
  const wide = el => el.getBoundingClientRect().width >= ww * .9;
  const canvases = [...(wrap?.querySelectorAll('.hca-source-render canvas') || [])].filter(c => c.width > 50 && c.height > 50 && wide(c));
  if (canvases.length) return canvases.sort((a, b) => b.width * b.height - a.width * a.height)[0];
  const img = [...(wrap?.querySelectorAll('.hca-source-render img') || [])].find(i => i.naturalWidth && wide(i));
  return img || null;
}

const HCA7_LENS = 260;
function HCA7LensClone(wrap) {
  const clone = wrap.cloneNode(true);
  clone.querySelectorAll('.hca7-capture, .hca7-lens, .hca7-stamp-bar, .hca7-stamp-handle').forEach(n => n.remove());
  const from = wrap.querySelectorAll('canvas'), to = clone.querySelectorAll('canvas');
  to.forEach((c, i) => { const o = from[i]; if (!o) return; c.width = o.width; c.height = o.height; try { c.getContext('2d').drawImage(o, 0, 0); } catch {} });
  clone.removeAttribute('data-hca-page'); clone.setAttribute('aria-hidden', 'true'); clone.setAttribute('inert', '');
  Object.assign(clone.style, { position: 'absolute', left: '0', top: '0', margin: '0', width: `${wrap.offsetWidth}px`, height: `${wrap.offsetHeight}px`, transform: 'none' });
  return clone;
}

/* Where the page bitmap is drawn on screen (handles letterboxed images shown with object-fit: contain). */
function HCA7Content(src) {
  const r = src.getBoundingClientRect(), nw = src.naturalWidth || src.width, nh = src.naturalHeight || src.height;
  const fit = getComputedStyle(src).objectFit;
  if (src.tagName === 'IMG' && (fit === 'contain' || fit === 'scale-down')) {
    const k = Math.min(r.width / nw, r.height / nh), w = nw * k, h = nh * k;
    return { left: r.left + (r.width - w) / 2, top: r.top + (r.height - h) / 2, width: w, height: h, nw, nh };
  }
  return { left: r.left, top: r.top, width: r.width, height: r.height, nw, nh };
}

HCAAnnotations = function HCA7Annotations({ book, page, width, height, tool, hcaTool, onTool }) {
  const ctx = y(), mode = hcaTool || tool, rootRef = _.useRef(null), svgRef = _.useRef(null), drawing = _.useRef(null), lensRef = _.useRef(null), lensInner = _.useRef(null), [zoom, setZoom] = _.useState(() => { try { return Number(localStorage.getItem('lumen.lensZoom')) || 2.5; } catch { return 2.5; } });
  const [draft, setDraft] = _.useState(null), [box, setBox] = _.useState(null), [lens, setLens] = _.useState(null), [moving, setMoving] = _.useState(null), [picked, setPicked] = _.useState(null);
  const boxStart = _.useRef(null), pinDrag = _.useRef(null), stampDrag = _.useRef(null);
  HCA7Reader.bookId = book.id;
  const inks = (ctx.state.ink || []).filter(i => i.bookId === book.id && i.page === page);
  const notes = ctx.state.notes.filter(n => n.bookId === book.id && n.page === page && n.anchor);
  const stamps = (ctx.state.hcaStamps || []).filter(s => s.bookId === book.id && s.page === page);
  const stroke = HCA7Stroke(ctx.state.settings);
  const rel = e => { const r = rootRef.current.getBoundingClientRect(); return { x: Math.round(HCABound((e.clientX - r.left) / r.width) * 10000) / 10000, y: Math.round(HCABound((e.clientY - r.top) / r.height) * 10000) / 10000 }; };
  const finish = cancel => {
    const s = drawing.current; drawing.current = null; setDraft(null);
    if (cancel || !s?.points.length) return;
    if ((ctx.state.ink || []).length >= 800) { ctx.toast('This workspace has 800 pen strokes. Back up your work and clear some pages before adding more.', 'warning'); return; }
    ctx.setState(st => ({ ...st, ink: [...(st.ink || []), { id: ue(), bookId: book.id, page, points: s.points, color: s.color, width: s.width, createdAt: Date.now() }] }));
  };
  const remove = id => ctx.setState(s => ({ ...s, ink: (s.ink || []).filter(i => i.id !== id) }));
  const down = e => {
    if (mode !== 'pen' && mode !== 'sticky') return;
    e.preventDefault(); e.stopPropagation();
    if (mode === 'sticky') { const anchor = rel(e); onTool?.('select'); ctx.setModal({ type: 'hca-sticky', bookId: book.id, page, anchor }); return; }
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drawing.current = { points: [rel(e)], color: stroke.color, width: stroke.width, pointerId: e.pointerId };
    setDraft({ ...drawing.current });
  };
  const move = e => {
    if (!drawing.current || drawing.current.pointerId !== e.pointerId) return;
    e.preventDefault(); e.stopPropagation();
    const p = rel(e), pts = drawing.current.points, last = pts.at(-1);
    if (Math.hypot(p.x - last.x, p.y - last.y) < .0008) return;
    if (pts.length < 800) pts.push(p);
    setDraft({ ...drawing.current, points: [...pts] });
  };
  _.useEffect(() => { drawing.current = null; setDraft(null); setBox(null); setLens(null); }, [mode, page]);
  // Learn the source's page shape from its first rendered page, so wide slides get a wide page.
  _.useEffect(() => {
    if (page !== 1 || book.kind === 'demo') return;
    const t = setTimeout(() => {
      const src = HCA7SourceImage(rootRef.current?.closest('[data-hca-page]')); if (!src) return;
      const w = src.naturalWidth || src.width, h = src.naturalHeight || src.height; if (!w || !h) return;
      const r = Math.round(h / w * 1000) / 1000;
      if (r > .3 && r < 3 && Math.abs(r - (book.hcaRatio || 1.414)) > .03) ctx.setState(s => ({ ...s, books: s.books.map(b => b.id === book.id ? { ...b, hcaRatio: r } : b) }));
    }, 900);
    return () => clearTimeout(t);
  }, [book.id, page, width]);

  /* Snip and magnifier share one capture surface. */
  const capDown = e => {
    if (mode === 'snip') { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); boxStart.current = rel(e); setBox({ x: boxStart.current.x, y: boxStart.current.y, w: 0, h: 0 }); }
  };
  const capMove = e => {
    if (mode === 'magnify') { const r = rootRef.current.getBoundingClientRect(); setLens({ px: e.clientX - r.left, py: e.clientY - r.top }); return; }
    if (mode === 'snip' && boxStart.current) { const p = rel(e), a = boxStart.current; setBox({ x: Math.min(a.x, p.x), y: Math.min(a.y, p.y), w: Math.abs(p.x - a.x), h: Math.abs(p.y - a.y) }); }
  };
  const capUp = () => {
    if (mode !== 'snip' || !boxStart.current) return;
    boxStart.current = null;
    const b = box; setBox(null);
    if (!b || b.w < .02 || b.h < .02) return;
    HCA7Snip(ctx, book, page, rootRef.current.closest('[data-hca-page]'), b);
  };
  /* Magnifier: a live copy of the whole page (text, images, PDF canvas, ink, stickers) shown enlarged in the lens. */
  _.useEffect(() => {
    if (mode !== 'magnify' || !lens || !lensInner.current) return;
    const inner = lensInner.current;
    if (!inner.firstChild) {
      const wrap = rootRef.current?.closest('[data-hca-page]'); if (!wrap) return;
      inner.appendChild(HCA7LensClone(wrap));
    }
    const R = HCA7_LENS / 2;
    inner.style.transform = `translate(${R - lens.px * zoom}px, ${R - lens.py * zoom}px) scale(${zoom})`;
  }, [lens, mode, zoom]);
  _.useEffect(() => { if (lensInner.current) lensInner.current.textContent = ''; }, [mode, page]);
  const wheel = e => { if (mode !== 'magnify') return; e.preventDefault(); setZoom(z => { const v = Math.round(HCABound(z + (e.deltaY < 0 ? .5 : -.5), 1.5, 6) * 10) / 10; try { localStorage.setItem('lumen.lensZoom', v); } catch {} return v; }); };

  /* Sticky pins: drag to move, click to open. */
  const pinDown = (e, note) => {
    if (mode !== 'select' && mode !== 'highlight' && mode) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pinDrag.current = { id: note.id, x0: e.clientX, y0: e.clientY, moved: false };
  };
  const pinMove = e => {
    const d = pinDrag.current; if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 5) return;
    d.moved = true; setMoving({ id: d.id, ...rel(e) });
  };
  const pinUp = (e, note) => {
    const d = pinDrag.current; pinDrag.current = null;
    if (!d) return;
    if (!d.moved) { ctx.setModal({ type: 'hca-sticky', note }); return; }
    const p = rel(e); setMoving(null);
    ctx.setState(s => ({ ...s, notes: s.notes.map(n => n.id === note.id ? { ...n, anchor: { x: p.x, y: p.y }, updatedAt: Date.now() } : n) }));
  };

  /* Stickers: drag to move, corner handle to resize, small bar to resize or remove. */
  const setStamp = (id, patch) => ctx.setState(s => ({ ...s, hcaStamps: (s.hcaStamps || []).map(t => t.id === id ? { ...t, ...patch } : t) }));
  const stampDown = (e, t, kind) => {
    if (mode === 'pen' || mode === 'erase') return;
    e.stopPropagation(); e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setPicked(t.id);
    stampDrag.current = { id: t.id, kind, x0: e.clientX, y0: e.clientY, start: { ...t }, w: rootRef.current.clientWidth, h: rootRef.current.clientHeight };
  };
  const stampMove = e => {
    const d = stampDrag.current; if (!d) return;
    const dx = (e.clientX - d.x0) / d.w, dy = (e.clientY - d.y0) / d.h;
    if (d.kind === 'move') setStamp(d.id, { x: HCABound(d.start.x + dx, 0, .98), y: HCABound(d.start.y + dy, 0, .98) });
    else setStamp(d.id, { size: HCABound(d.start.size + Math.max(dx, dy * d.h / d.w), .02, .5) });
  };
  const stampUp = () => { stampDrag.current = null; };
  _.useEffect(() => {
    if (!picked) return;
    const off = e => { if (!e.target.closest?.('.hca7-stamp')) setPicked(null); };
    document.addEventListener('pointerdown', off);
    return () => document.removeEventListener('pointerdown', off);
  }, [picked]);

  const pageW = width || rootRef.current?.clientWidth || 600;
  const capture = mode === 'snip' || mode === 'magnify';
  return HC('div', { ref: rootRef, className: `hca-annotations tool-${mode}` },
    HC('svg', { ref: svgRef, className: 'hca-ink-layer', viewBox: '0 0 1000 1000', preserveAspectRatio: 'none', 'aria-label': mode === 'pen' ? 'Draw on the page' : mode === 'sticky' ? 'Click to place a sticky note' : 'Page annotations', onPointerDown: down, onPointerMove: move, onPointerUp: e => { if (drawing.current) { e.preventDefault(); e.stopPropagation(); finish(false); } }, onPointerCancel: () => finish(true) },
      inks.map((ink, i) => HC('path', { key: ink.id, d: HCAInkPath(ink.points), fill: 'none', stroke: ink.color, strokeWidth: ink.width, strokeLinecap: 'round', strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke', role: mode === 'erase' ? 'button' : undefined, tabIndex: mode === 'erase' ? 0 : undefined, 'aria-label': mode === 'erase' ? `Erase pen stroke ${i + 1}` : undefined, onClick: mode === 'erase' ? e => { e.stopPropagation(); remove(ink.id); } : undefined, onKeyDown: mode === 'erase' ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); remove(ink.id); } } : undefined })),
      draft && HC('path', { d: HCAInkPath(draft.points), fill: 'none', stroke: draft.color, strokeWidth: draft.width, strokeLinecap: 'round', strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke' })),
    stamps.map(t => HC('div', { key: t.id, className: `hca7-stamp ${t.kind} ${picked === t.id ? 'picked' : ''}`, style: { left: `${t.x * 100}%`, top: `${t.y * 100}%`, '--s': `${t.size * pageW}px`, ...(t.kind === 'tag' ? { '--c': t.color || '#9e3e3e' } : {}) }, role: 'img', 'aria-label': `Sticker: ${t.label || t.value}`, title: 'Drag to move. Drag the corner to resize.', tabIndex: 0,
      onPointerDown: e => stampDown(e, t, 'move'), onPointerMove: stampMove, onPointerUp: stampUp,
      onKeyDown: e => { if (e.key === 'Delete' || e.key === 'Backspace') ctx.setState(s => ({ ...s, hcaStamps: (s.hcaStamps || []).filter(x => x.id !== t.id) })); } },
      HC('span', { className: 'hca7-stamp-face' }, t.value),
      picked === t.id && HC(_.Fragment, {},
        HC('span', { className: 'hca7-stamp-handle', onPointerDown: e => stampDown(e, t, 'size'), onPointerMove: stampMove, onPointerUp: stampUp, 'aria-hidden': 'true' }),
        HC('span', { className: 'hca7-stamp-bar', onPointerDown: e => e.stopPropagation() },
          HC('button', { type: 'button', 'aria-label': 'Smaller', onClick: () => setStamp(t.id, { size: Math.max(.02, t.size * .8) }) }, HCAIcon('subtract-line')),
          HC('button', { type: 'button', 'aria-label': 'Larger', onClick: () => setStamp(t.id, { size: Math.min(.5, t.size * 1.25) }) }, HCAIcon('add-line')),
          HC('button', { type: 'button', 'aria-label': 'Remove sticker', onClick: () => ctx.setState(s => ({ ...s, hcaStamps: (s.hcaStamps || []).filter(x => x.id !== t.id) })) }, HCAIcon('delete-bin-line')))))),
    notes.map((note, i) => {
      const at = moving?.id === note.id ? moving : note.anchor;
      return HC(_.Fragment, { key: note.id },
        note.region && HC('button', { className: 'hca-note-region', style: { left: `${note.region.x * 100}%`, top: `${note.region.y * 100}%`, width: `${note.region.w * 100}%`, height: `${note.region.h * 100}%` }, 'aria-label': `Open marked note: ${note.title || note.text.slice(0, 60)}`, onClick: () => ctx.setModal({ type: 'hca-sticky', note }) }),
        HC('button', { className: `hca-sticky-pin hca7-pin ${moving?.id === note.id ? 'moving' : ''}`, style: { left: `${HCABound(at.x, .02, .95) * 100}%`, top: `${HCABound(at.y, .02, .95) * 100}%`, background: note.color || '#ffe2a3' }, 'aria-label': `Sticky note on page ${page}: ${note.title || note.text.slice(0, 60)}. Drag to move.`, title: `${note.title || note.text.slice(0, 150)}\n(drag to move)`,
          onPointerDown: e => pinDown(e, note), onPointerMove: pinMove, onPointerUp: e => pinUp(e, note), onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ctx.setModal({ type: 'hca-sticky', note }); } } },
          HCAIcon('sticky-note-line'), HC('span', {}, i + 1)));
    }),
    capture && HC('div', { className: `hca7-capture ${mode}`, onPointerDown: capDown, onPointerMove: capMove, onPointerUp: capUp, onWheel: wheel, onPointerEnter: () => { if (lensInner.current) lensInner.current.textContent = ''; }, onPointerLeave: () => mode === 'magnify' && setLens(null), 'aria-label': mode === 'snip' ? 'Drag a box to snip this part of the page' : 'Magnifier: move over the page. Scroll to change the zoom.' },
      box && HC('div', { className: 'hca7-snipbox', style: { left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%` } }),
      mode === 'magnify' && lens && HC('div', { ref: lensRef, className: 'hca7-lens', style: { left: lens.px - HCA7_LENS / 2, top: lens.py - HCA7_LENS / 2, width: HCA7_LENS, height: HCA7_LENS } },
        HC('div', { ref: lensInner, className: 'hca7-lens-inner' }), HC('span', { className: 'hca7-lens-zoom' }, `${zoom}×`))));
};

/* ---------- Snip ---------- */
async function HCA7Snip(ctx, book, page, wrap, b) {
  const src = HCA7SourceImage(wrap);
  if (!src) { ctx.toast('Snip works on PDF and image pages. For this page, use your device’s screenshot tool.', 'warning'); return; }
  // Work in screen coordinates, then scale up to the page image's own resolution.
  const wr = wrap.getBoundingClientRect(), box = HCA7Content(src);
  const sel = { left: wr.left + b.x * wr.width, top: wr.top + b.y * wr.height, width: b.w * wr.width, height: b.h * wr.height };
  const f = Math.min(box.nw / box.width, 1600 / sel.width, 4);
  const out = document.createElement('canvas'); out.width = Math.max(1, Math.round(sel.width * f)); out.height = Math.max(1, Math.round(sel.height * f));
  const g = out.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, out.width, out.height);
  g.drawImage(src, (box.left - sel.left) * f, (box.top - sel.top) * f, box.width * f, box.height * f);
  // Draw the learner's ink and stickers on top.
  const svg = wrap.querySelector('svg.hca-ink-layer');
  if (svg && svg.querySelector('path')) {
    try {
      const copy = svg.cloneNode(true); copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); copy.setAttribute('width', wr.width * f); copy.setAttribute('height', wr.height * f);
      copy.querySelectorAll('path').forEach(p => { const w = Number(p.getAttribute('stroke-width')) || 3; p.setAttribute('stroke-width', w * f); });
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }));
      const img = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
      g.drawImage(img, (wr.left - sel.left) * f, (wr.top - sel.top) * f, wr.width * f, wr.height * f);
      URL.revokeObjectURL(url);
    } catch {}
  }
  wrap.querySelectorAll('.hca7-stamp').forEach(el => {
    const r = el.getBoundingClientRect(), face = el.querySelector('.hca7-stamp-face'), cs = getComputedStyle(face);
    if (el.classList.contains('tag')) { g.fillStyle = cs.backgroundColor; g.fillRect((r.left - sel.left) * f, (r.top - sel.top) * f, r.width * f, r.height * f); g.fillStyle = '#fff'; }
    g.font = `${cs.fontWeight} ${parseFloat(cs.fontSize) * f}px ${cs.fontFamily}`; g.textBaseline = 'middle'; g.textAlign = 'center';
    g.fillText(face.textContent, (r.left + r.width / 2 - sel.left) * f, (r.top + r.height / 2 - sel.top) * f);
  });
  const image = out.toDataURL('image/jpeg', .88);
  ctx.setModal({ type: 'hca7-snip', image, bookId: book.id, page, rect: b, title: book.title });
}

function HCA7SnipDialog({ image, bookId, page, rect, title, onClose }) {
  const ctx = y(), [caption, setCaption] = _.useState(''), [saved, setSaved] = _.useState(false);
  const blob = () => fetch(image).then(r => r.blob()).then(b => new Promise(ok => { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; c.getContext('2d').drawImage(i, 0, 0); c.toBlob(ok, 'image/png'); }; i.src = URL.createObjectURL(b); }));
  const copy = async () => { try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': await blob() })]); ctx.toast('Snip copied. Paste it into Word, PowerPoint or a message.'); } catch { ctx.toast('This browser blocked copying images. Use Download instead.', 'warning'); } };
  const download = async () => HCA7Download(await blob(), `${(title || 'Lumen').slice(0, 40)} p${page} snip.png`);
  const save = () => {
    if ((ctx.state.hcaSnips || []).length >= 300) { ctx.toast('You have 300 snips. Remove some before keeping more.', 'warning'); return; }
    ctx.setState(s => ({ ...s, hcaSnips: [...(s.hcaSnips || []), { id: ue(), bookId, page, rect, image, caption: caption.trim(), createdAt: Date.now() }] }));
    setSaved(true); ctx.toast('Snip kept with its page. Find it under Notes & pen, and in Present and Export.');
  };
  return HC(A, { title: 'Your snip.', eyebrow: `PAGE ${page}`, onClose, className: 'hca7-snip-dialog',
    footer: HC(_.Fragment, {}, HCABtn('Copy', copy, 'secondary', 'file-copy-line'), HCABtn('Download', download, 'secondary', 'download-line'), HCABtn(saved ? 'Kept' : 'Keep with this page', save, 'primary', 'check-line', { disabled: saved })) },
    HC('img', { src: image, alt: `Snip from page ${page}`, className: 'hca7-snip-preview' }),
    HC('label', { className: 'hca-field' }, 'Caption (optional)', HC('input', { value: caption, maxLength: 200, onChange: e => setCaption(e.target.value), placeholder: 'For example: Six Sigma DMAIC phases' })));
}

function HCA7Download(blob, name) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name.replace(/[\\/:*?"<>|]+/g, ' ').trim();
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ---------- Reader toolbar: one "Tools" menu holds the new tools, so the page keeps its size ---------- */
const HCA7Prev = { Toolbar: HCAReaderToolbar, List: HCAAnnotationList, Commands: HCA3Commands, Dialogs: rs };
HCAReaderToolbar = function HCA7ReaderToolbar(props) {
  const el = HCA7Prev.Toolbar(props);
  const kids = _.Children.toArray(el.props.children);
  kids.splice(Math.max(0, kids.length - 1), 0, HC(HCA7ToolsMenu, { key: 'hca7-tools', ...props }), HC(HCALabelTool, { key: 'hca7-refresh', icon: 'refresh-line', label: 'Refresh', onClick: HCA7Refresh, title: 'Refresh: reload Lumen if a page looks stuck. Your work is saved first.' }));
  return _.cloneElement(el, {}, ...kids);
};

function HCA7ToolsMenu({ book, page, tool, onTool, readMode }) {
  const ctx = y(), ui = HCA7Use(), ref = _.useRef(null);
  const close = () => { if (ref.current) ref.current.open = false; };
  const pick = name => { onTool(tool === name ? 'select' : name); close(); };
  const imageMode = readMode !== 'text';
  const item = (icon, label, hint, onClick, opts = {}) => HC('button', { type: 'button', onClick: () => { onClick(); close(); }, disabled: opts.disabled, 'aria-pressed': opts.pressed, className: opts.pressed ? 'on' : '' }, HCAIcon(icon), HC('span', {}, HC('strong', {}, label), HC('small', {}, hint)));
  const active = ['snip', 'magnify'].includes(tool) || ui.tray || ui.calc;
  return HC('details', { ref, className: `hca-reader-more hca7-tools ${active ? 'active' : ''}`, onKeyDown: e => { if (e.key === 'Escape') { close(); e.stopPropagation(); } } },
    HC('summary', { title: 'Snip, magnifier, stickers, calculator, meaning, present and export' }, HCAIcon('grid-line'), HC('span', {}, 'Tools')),
    HC('div', { className: 'hca-reader-more-menu hca7-tools-menu' },
      item('scissors-cut-line', 'Snip', 'Drag a box; copy, download or keep it', () => pick('snip'), { disabled: !imageMode, pressed: tool === 'snip' }),
      item('zoom-in-line', 'Magnifier', 'A lens that follows your pointer', () => pick('magnify'), { disabled: !imageMode, pressed: tool === 'magnify' }),
      item('gallery-line', 'Stickers', 'Drag clinical icons and labels onto the page', () => HCA7Set(s => ({ tray: !s.tray })), { pressed: ui.tray }),
      item('sticky-note-line', 'Pin a sticky note', 'Click the exact spot on the page', () => pick('sticky'), { disabled: !imageMode, pressed: tool === 'sticky' }),
      item('stethoscope-line', 'Calculator', 'Clinical formulas and a scientific keypad', () => HCA7Set(s => ({ calc: !s.calc })), { pressed: ui.calc }),
      item('search-line', 'Meaning', 'Plain definition of a word or term', () => HCA7Set({ define: { text: '', page, bookId: book.id } })),
      item('play-fill', 'Present', 'Slides from your highlights, notes and snips', () => ctx.setModal({ type: 'hca7-export', bookId: book.id, page, present: true })),
      item('download-line', 'Export', 'PowerPoint, Word, Markdown, print, cards', () => ctx.setModal({ type: 'hca7-export', bookId: book.id, page }))));
}

async function HCA7Refresh() {
  HCA7Set({ progress: { title: 'Refreshing Lumen', label: 'Saving your work, then reloading', value: null } });
  window.dispatchEvent(new Event('pagehide'));
  await new Promise(r => setTimeout(r, 900));
  location.reload();
}

/* Remember which page the learner last touched, for click-to-add stickers. */
document.addEventListener('pointerdown', e => { const w = e.target.closest?.('[data-hca-page]'); if (w) HCA7Reader.page = Number(w.dataset.hcaPage); }, true);

/* ---------- Stickers ---------- */
const HCA7Stickers = [
  ['Body', [['🫀', 'Heart'], ['🫁', 'Lungs'], ['🧠', 'Brain'], ['🦴', 'Bone'], ['🩸', 'Blood'], ['👁️', 'Eye'], ['👂', 'Ear'], ['🦷', 'Tooth'], ['🦠', 'Microbe'], ['🧬', 'DNA'], ['🤰', 'Pregnancy'], ['👶', 'Infant'], ['🧒', 'Child'], ['🧓', 'Older adult']]],
  ['Care', [['💊', 'Medication'], ['💉', 'Injection'], ['🩺', 'Assessment'], ['🌡️', 'Temperature'], ['🩹', 'Wound care'], ['🧪', 'Lab test'], ['🔬', 'Microscopy'], ['🩻', 'Imaging'], ['💧', 'Fluids'], ['🍎', 'Nutrition'], ['🧼', 'Hand hygiene'], ['😷', 'Mask'], ['🧤', 'Gloves'], ['🛏️', 'Bed rest'], ['🦽', 'Mobility'], ['🚑', 'Emergency'], ['🏥', 'Hospital'], ['📋', 'Documentation']]],
  ['Marks', [['⭐', 'Key point'], ['⚠️', 'Caution'], ['❗', 'Important'], ['❓', 'Question'], ['✅', 'Correct'], ['❌', 'Wrong'], ['🚩', 'Red flag'], ['🛑', 'Stop'], ['🔑', 'Key'], ['💡', 'Idea'], ['🎯', 'Goal'], ['📌', 'Pin'], ['⏰', 'Timing'], ['🔥', 'Hot topic'], ['⬆️', 'Increase'], ['⬇️', 'Decrease'], ['➡️', 'Leads to'], ['🔁', 'Repeat']]],
];
const HCA7Tags = [['KEY', '#087d7a'], ['EXAM', '#1f6feb'], ['HIGH-YIELD', '#7a4fd1'], ['REVIEW', '#bd764a'], ['PRIORITY', '#9e3e3e'], ['SAFETY', '#d03b8c'], ['RED FLAG', '#c62828'], ['MNEMONIC', '#2f8f46'], ['NORMAL', '#2f8f46'], ['ABNORMAL', '#c62828'], ['ASSESS', '#10253a'], ['INTERVENE', '#e0711b'], ['EVALUATE', '#087d7a'], ['ASK TUTOR', '#555555']];

function HCA7AddStamp(ctx, stamp, at) {
  const bookId = HCA7Reader.bookId;
  const page = at?.page || HCA7Reader.page || Number(document.querySelector('[data-hca-page]')?.dataset.hcaPage);
  if (!bookId || !page) { ctx.toast('Open a source in the reader first, then add stickers to its pages.', 'warning'); return; }
  if ((ctx.state.hcaStamps || []).length >= 1500) { ctx.toast('You have 1,500 stickers. Remove some before adding more.', 'warning'); return; }
  const n = (ctx.state.hcaStamps || []).filter(s => s.bookId === bookId && s.page === page).length;
  ctx.setState(s => ({ ...s, hcaStamps: [...(s.hcaStamps || []), { id: ue(), bookId, page, x: at?.x ?? HCABound(.42 + (n % 5) * .03, 0, .9), y: at?.y ?? HCABound(.3 + (n % 5) * .04, 0, .9), size: stamp.kind === 'tag' ? .032 : .06, ...stamp, createdAt: Date.now() }] }));
}

function HCA7Tray() {
  const ctx = y(), [cat, setCat] = _.useState('Marks'), win = HCA7Win('stickers');
  const drop = _.useRef(null);
  _.useEffect(() => {
    // Drops land on the page under the pointer, at that exact spot.
    const over = e => { if (e.dataTransfer?.types?.includes('application/x-lumen-sticker') && e.target.closest?.('[data-hca-page]')) e.preventDefault(); };
    const onDrop = e => {
      const raw = e.dataTransfer?.getData('application/x-lumen-sticker'); const wrap = e.target.closest?.('[data-hca-page]');
      if (!raw || !wrap) return;
      e.preventDefault();
      const r = wrap.getBoundingClientRect(), stamp = JSON.parse(raw);
      HCA7AddStamp(drop.current, stamp, { page: Number(wrap.dataset.hcaPage), x: HCABound((e.clientX - r.left) / r.width - .02, 0, .95), y: HCABound((e.clientY - r.top) / r.height - .02, 0, .95) });
    };
    document.addEventListener('dragover', over); document.addEventListener('drop', onDrop);
    return () => { document.removeEventListener('dragover', over); document.removeEventListener('drop', onDrop); };
  }, []);
  drop.current = ctx;
  const item = (stamp, label, face) => HC('button', { key: label, type: 'button', draggable: true, title: `${label}: drag onto the page, or click to add`, 'aria-label': `Add sticker: ${label}`,
    onDragStart: e => { e.dataTransfer.setData('application/x-lumen-sticker', JSON.stringify(stamp)); e.dataTransfer.effectAllowed = 'copy'; },
    onClick: () => HCA7AddStamp(ctx, stamp) }, face);
  return HC('section', { ref: win.ref, className: 'hca7-float hca7-tray', style: win.style, 'aria-label': 'Stickers' },
    HC('header', { ...win.header, title: 'Drag to move · double-click to reset' },
      HCAIcon('draggable'), HC('strong', {}, 'Stickers'), HC('span', { className: 'hca-small' }, 'drag onto the page'),
      HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': 'Close stickers', onClick: () => HCA7Set({ tray: false }) }, HCAIcon('close-line'))),
    HC('div', { className: 'hca7-tabs', role: 'tablist' }, [...HCA7Stickers.map(c => c[0]), 'Labels'].map(c => HC('button', { key: c, role: 'tab', 'aria-selected': cat === c, onClick: () => setCat(c) }, c))),
    cat === 'Labels'
      ? HC('div', { className: 'hca7-grid tags' }, HCA7Tags.map(([t, c]) => item({ kind: 'tag', value: t, label: t, color: c }, t, HC('span', { className: 'hca7-tag', style: { '--c': c } }, t))))
      : HC('div', { className: 'hca7-grid' }, HCA7Stickers.find(c => c[0] === cat)[1].map(([e, l]) => item({ kind: 'emoji', value: e, label: l }, l, HC('span', { className: 'hca7-emoji' }, e)))),
    HC('p', { className: 'hca-small' }, 'On the page: drag to move, drag the corner to resize, Delete to remove.'));
}

/* ---------- Notes & pen list: snips first ---------- */
HCAAnnotationList = function HCA7AnnotationList(props) {
  const ctx = y(), { book, page, onPage, scope } = props;
  const snips = (ctx.state.hcaSnips || []).filter(s => s.bookId === book.id && (scope === 'source' || s.page === page)).sort((a, b) => b.createdAt - a.createdAt);
  const stamps = (ctx.state.hcaStamps || []).filter(s => s.bookId === book.id && (scope === 'source' || s.page === page)).length;
  return HC(_.Fragment, {},
    snips.length > 0 && HC('div', { className: 'hca7-snips' }, snips.map(s => HC('figure', { key: s.id },
      HC('img', { src: s.image, alt: s.caption || `Snip from page ${s.page}`, loading: 'lazy' }),
      HC('figcaption', {}, HC('span', {}, s.caption || 'Snip'), HC('button', { className: 'text-link', onClick: () => onPage(s.page) }, `p. ${s.page}`),
        HC('button', { className: 'hca3-icon-btn', 'aria-label': 'Download snip', onClick: () => fetch(s.image).then(r => r.blob()).then(b => HCA7Download(b, `${book.title.slice(0, 40)} p${s.page} snip.jpg`)) }, HCAIcon('download-line')),
        HC('button', { className: 'hca3-icon-btn', 'aria-label': 'Delete snip', onClick: () => ctx.setModal({ type: 'confirm', title: 'Delete this snip?', text: 'The image is removed from this workspace.', onConfirm: () => ctx.setState(st => ({ ...st, hcaSnips: (st.hcaSnips || []).filter(x => x.id !== s.id) })) }) }, HCAIcon('delete-bin-line')))))),
    stamps > 0 && HC('p', { className: 'hca-small' }, `${stamps} sticker${stamps === 1 ? '' : 's'} ${scope === 'source' ? 'in this source' : 'on this page'}.`),
    HC(HCA7Prev.List, props));
};

/* ---------- Calculator ---------- */
/* A small, safe expression parser (no eval): + − × ÷ ^ %, brackets, sqrt ln log sin cos tan abs round, pi, e. */
function HCA7Eval(src, degrees) {
  const s = String(src).replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, 'pi').replace(/,/g, '').toLowerCase();
  let i = 0;
  const ws = () => { while (s[i] === ' ') i++; };
  const peek = () => { ws(); return s[i]; };
  const fn = { sqrt: Math.sqrt, ln: Math.log, log: Math.log10, abs: Math.abs, round: Math.round, exp: Math.exp,
    sin: x => Math.sin(degrees ? x * Math.PI / 180 : x), cos: x => Math.cos(degrees ? x * Math.PI / 180 : x), tan: x => Math.tan(degrees ? x * Math.PI / 180 : x) };
  function primary() {
    const c = peek();
    if (c === '(') { i++; const v = expr(); if (peek() !== ')') throw Error('Missing )'); i++; return v; }
    const num = s.slice(i).match(/^\d*\.?\d+(e[+-]?\d+)?/);
    if (num) { i += num[0].length; return parseFloat(num[0]); }
    const word = s.slice(i).match(/^[a-z]+/);
    if (word) {
      i += word[0].length;
      if (word[0] === 'pi') return Math.PI;
      if (word[0] === 'e') return Math.E;
      if (fn[word[0]]) { if (peek() !== '(') throw Error(`${word[0]} needs brackets`); i++; const v = expr(); if (peek() !== ')') throw Error('Missing )'); i++; return fn[word[0]](v); }
      throw Error(`Unknown: ${word[0]}`);
    }
    throw Error('Incomplete expression');
  }
  function postfix() { let v = primary(); while (peek() === '%') { i++; v /= 100; } return v; }
  function unary() { if (peek() === '-') { i++; return -unary(); } if (peek() === '+') { i++; return unary(); } return postfix(); }
  function power() { const b = unary(); if (peek() === '^') { i++; return Math.pow(b, power()); } return b; }
  function term() { let v = power(); for (;;) { const c = peek(); if (c === '*') { i++; v *= power(); } else if (c === '/') { i++; const d = power(); if (d === 0) throw Error('Cannot divide by zero'); v /= d; } else if (c === '(' || /[a-z\d.]/.test(c || '')) { v *= power(); } else return v; } }
  function expr() { let v = term(); for (;;) { const c = peek(); if (c === '+') { i++; v += term(); } else if (c === '-') { i++; v -= term(); } else return v; } }
  const v = expr(); ws();
  if (i < s.length) throw Error(`Unexpected “${s[i]}”`);
  if (!Number.isFinite(v)) throw Error('Result is not a number');
  return v;
}
const HCA7Fmt = (v, dp = 2) => (Number.isFinite(v) ? Number(v.toFixed(dp)).toLocaleString(undefined, { maximumFractionDigits: dp }) : '—');

/* Each clinical calculator: inputs, a formula line, and the result. */
const HCA7Clinical = [
  { id: 'dose', group: 'Dosage', name: 'Dose by weight', fields: [['kg', 'Weight', 'kg'], ['perkg', 'Prescribed dose', 'mg/kg'], ['times', 'Doses per day (optional)', '']],
    run: v => { const total = v.kg * v.perkg; return { out: `${HCA7Fmt(total)} mg`, more: v.times ? `${HCA7Fmt(total / v.times)} mg per dose if ${v.perkg} mg/kg is the daily total` : '', formula: 'weight × dose per kg' }; } },
  { id: 'dha', group: 'Dosage', name: 'Desired ÷ have × quantity', fields: [['d', 'Desired dose (D)', ''], ['h', 'Dose on hand (H)', ''], ['q', 'Quantity it comes in (Q)', 'tablets or mL']],
    run: v => ({ out: HCA7Fmt(v.d / v.h * v.q), more: 'tablets or mL to give (same units for D and H)', formula: '(D ÷ H) × Q' }) },
  { id: 'rate', group: 'IV', name: 'Infusion rate (mL/h)', fields: [['ml', 'Volume', 'mL'], ['h', 'Time', 'hours']],
    run: v => ({ out: `${HCA7Fmt(v.ml / v.h, 1)} mL/h`, formula: 'volume ÷ hours' }) },
  { id: 'drip', group: 'IV', name: 'Drip rate (gtt/min)', fields: [['ml', 'Volume', 'mL'], ['min', 'Time', 'minutes'], ['df', 'Drop factor', 'gtt/mL (10, 15, 20 or 60)']],
    run: v => ({ out: `${HCA7Fmt(v.ml * v.df / v.min, 0)} gtt/min`, more: 'rounded to the nearest whole drop', formula: '(volume × drop factor) ÷ minutes' }) },
  { id: 'time', group: 'IV', name: 'Infusion time', fields: [['ml', 'Volume', 'mL'], ['rate', 'Rate', 'mL/h']],
    run: v => { const h = v.ml / v.rate; return { out: `${Math.floor(h)} h ${Math.round((h % 1) * 60)} min`, formula: 'volume ÷ rate' }; } },
  { id: 'mcg', group: 'IV', name: 'Weight-based infusion (mL/h)', fields: [['dose', 'Ordered dose', 'mcg/kg/min'], ['kg', 'Weight', 'kg'], ['mg', 'Drug in bag', 'mg'], ['bag', 'Bag volume', 'mL']],
    run: v => { const conc = v.mg * 1000 / v.bag; return { out: `${HCA7Fmt(v.dose * v.kg * 60 / conc, 1)} mL/h`, more: `concentration ${HCA7Fmt(conc, 1)} mcg/mL`, formula: '(dose × kg × 60) ÷ (mg × 1000 ÷ mL)' }; } },
  { id: 'bmi', group: 'Body', name: 'Body mass index (BMI)', fields: [['kg', 'Weight', 'kg'], ['cm', 'Height', 'cm']],
    run: v => { const b = v.kg / Math.pow(v.cm / 100, 2); return { out: `${HCA7Fmt(b, 1)} kg/m²`, more: b < 18.5 ? 'below 18.5: underweight range' : b < 25 ? '18.5–24.9: healthy range' : b < 30 ? '25–29.9: overweight range' : '30 or more: obesity range', formula: 'kg ÷ m²' }; } },
  { id: 'bsa', group: 'Body', name: 'Body surface area (Mosteller)', fields: [['kg', 'Weight', 'kg'], ['cm', 'Height', 'cm']],
    run: v => ({ out: `${HCA7Fmt(Math.sqrt(v.cm * v.kg / 3600), 2)} m²`, formula: '√(cm × kg ÷ 3600)' }) },
  { id: 'map', group: 'Body', name: 'Mean arterial pressure', fields: [['sbp', 'Systolic', 'mmHg'], ['dbp', 'Diastolic', 'mmHg']],
    run: v => ({ out: `${HCA7Fmt((v.sbp + 2 * v.dbp) / 3, 0)} mmHg`, formula: '(systolic + 2 × diastolic) ÷ 3' }) },
  { id: 'fluid', group: 'Body', name: 'Maintenance fluids (4-2-1 rule)', fields: [['kg', 'Weight', 'kg']],
    run: v => { const k = v.kg, r = Math.min(k, 10) * 4 + Math.max(0, Math.min(k, 20) - 10) * 2 + Math.max(0, k - 20); return { out: `${HCA7Fmt(r, 0)} mL/h`, more: `${HCA7Fmt(r * 24, 0)} mL per day`, formula: '4 mL/kg for first 10 kg + 2 for next 10 + 1 for each kg above 20' }; } },
  { id: 'crcl', group: 'Body', name: 'Creatinine clearance (Cockcroft-Gault)', fields: [['age', 'Age', 'years'], ['kg', 'Weight', 'kg'], ['scr', 'Serum creatinine', 'mg/dL'], ['female', 'Female? (1 = yes, 0 = no)', '']],
    run: v => ({ out: `${HCA7Fmt((140 - v.age) * v.kg / (72 * v.scr) * (v.female ? .85 : 1), 0)} mL/min`, formula: '((140 − age) × kg) ÷ (72 × creatinine) × 0.85 if female' }) },
  { id: 'io', group: 'Body', name: 'Fluid balance', fields: [['in', 'Total intake', 'mL'], ['out', 'Total output', 'mL']],
    run: v => { const b = v.in - v.out; return { out: `${b >= 0 ? '+' : ''}${HCA7Fmt(b, 0)} mL`, more: b >= 0 ? 'positive balance' : 'negative balance', formula: 'intake − output' }; } },
];
const HCA7Units = [
  ['kg', 'lb', 2.20462], ['lb', 'kg', 1 / 2.20462], ['g', 'mg', 1000], ['mg', 'g', .001], ['mg', 'mcg', 1000], ['mcg', 'mg', .001],
  ['L', 'mL', 1000], ['mL', 'L', .001], ['cm', 'in', 1 / 2.54], ['in', 'cm', 2.54], ['oz', 'mL', 29.5735], ['tsp', 'mL', 4.92892], ['tbsp', 'mL', 14.7868],
  ['°C', '°F', null], ['°F', '°C', null], ['glucose mmol/L', 'mg/dL', 18.016], ['glucose mg/dL', 'mmol/L', 1 / 18.016],
];

function HCA7Calculator() {
  const [tab, setTab] = _.useState('keypad'), [expr, setExpr] = _.useState(''), [hist, setHist] = _.useState([]), [deg, setDeg] = _.useState(true), [err, setErr] = _.useState('');
  const [calc, setCalc] = _.useState('dose'), [vals, setVals] = _.useState({}), [conv, setConv] = _.useState({ i: 0, v: '' });
  const win = HCA7Win('calculator'), input = _.useRef(null);
  const run = () => { if (!expr.trim()) return; try { const v = HCA7Eval(expr, deg); setHist(h => [{ e: expr, v }, ...h].slice(0, 8)); setExpr(String(Number(v.toPrecision(12)))); setErr(''); } catch (e) { setErr(e.message); } };
  const key = k => { setErr(''); if (k === 'C') setExpr(''); else if (k === '⌫') setExpr(x => x.slice(0, -1)); else if (k === '=') run(); else setExpr(x => x + k); input.current?.focus(); };
  const c = HCA7Clinical.find(x => x.id === calc), nums = Object.fromEntries(c.fields.map(([k]) => [k, Number(vals[`${calc}.${k}`])]));
  const optional = k => k === 'times' || k === 'female';
  const ready = c.fields.every(([k]) => optional(k) || ((vals[`${calc}.${k}`] ?? '') !== '' && Number.isFinite(nums[k])));
  let result = null; try { if (ready) result = c.run({ ...nums, female: nums.female || 0, times: nums.times || 0 }); } catch {}
  const [from, to, f] = HCA7Units[conv.i], cv = Number(conv.v);
  const convOut = conv.v === '' || !Number.isFinite(cv) ? '' : f ? HCA7Fmt(cv * f, 3) : from === '°C' ? HCA7Fmt(cv * 9 / 5 + 32, 1) : HCA7Fmt((cv - 32) * 5 / 9, 1);
  const keys = ['(', ')', '%', '⌫', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '^', '+'];
  return HC('section', { ref: win.ref, className: 'hca7-float hca7-calc', style: win.style, 'aria-label': 'Calculator' },
    HC('header', { ...win.header, title: 'Drag to move · double-click to reset' },
      HCAIcon('draggable'), HC('strong', {}, 'Calculator'),
      HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': 'Close calculator', onClick: () => HCA7Set({ calc: false }) }, HCAIcon('close-line'))),
    HC('div', { className: 'hca7-tabs', role: 'tablist' }, [['keypad', 'Keypad'], ['clinical', 'Clinical'], ['convert', 'Convert']].map(([id, l]) => HC('button', { key: id, role: 'tab', 'aria-selected': tab === id, onClick: () => setTab(id) }, l))),
    tab === 'keypad' && HC('div', { className: 'hca7-keypad' },
      HC('input', { ref: input, className: 'hca7-display', value: expr, 'aria-label': 'Expression', placeholder: 'e.g. 500 × 0.2 ÷ 4', onChange: e => { setExpr(e.target.value); setErr(''); }, onKeyDown: e => { if (e.key === 'Enter') { e.preventDefault(); run(); } e.stopPropagation(); } }),
      err && HC('p', { className: 'hca-studio-error', role: 'alert' }, err),
      HC('div', { className: 'hca7-fns' }, ['sqrt(', 'ln(', 'log(', 'sin(', 'cos(', 'tan(', 'pi', 'abs('].map(k => HC('button', { key: k, type: 'button', onClick: () => key(k) }, k.replace('(', ''))),
        HC('button', { type: 'button', onClick: () => setDeg(!deg), title: 'Angle unit for sin, cos and tan' }, deg ? 'DEG' : 'RAD')),
      HC('div', { className: 'hca7-keys' }, keys.map(k => HC('button', { key: k, type: 'button', className: /[÷×−+^%]/.test(k) ? 'op' : '', onClick: () => key(k) }, k)),
        HC('button', { type: 'button', className: 'clear', onClick: () => key('C') }, 'C'), HC('button', { type: 'button', className: 'eq', onClick: run }, '=')),
      hist.length > 0 && HC('ol', { className: 'hca7-hist' }, hist.map((h, i) => HC('li', { key: i }, HC('button', { type: 'button', onClick: () => setExpr(String(Number(h.v.toPrecision(12)))) }, `${h.e} = `, HC('strong', {}, HCA7Fmt(h.v, 6))))))),
    tab === 'clinical' && HC('div', { className: 'hca7-clinical' },
      HC('select', { value: calc, 'aria-label': 'Choose a calculation', onChange: e => setCalc(e.target.value) },
        ['Dosage', 'IV', 'Body'].map(g => HC('optgroup', { key: g, label: g }, HCA7Clinical.filter(x => x.group === g).map(x => HC('option', { key: x.id, value: x.id }, x.name))))),
      c.fields.map(([k, label, unit]) => HC('label', { key: calc + k }, HC('span', {}, label, unit && HC('small', {}, ` ${unit}`)),
        HC('input', { type: 'number', inputMode: 'decimal', step: 'any', value: vals[`${calc}.${k}`] ?? '', onKeyDown: e => e.stopPropagation(), onChange: e => setVals(v => ({ ...v, [`${calc}.${k}`]: e.target.value })) }))),
      HC('div', { className: 'hca7-result', 'aria-live': 'polite' }, result ? HC(_.Fragment, {}, HC('strong', {}, result.out), result.more && HC('span', {}, result.more), HC('small', {}, `Formula: ${result.formula}`)) : HC('span', { className: 'hca-small' }, 'Fill in the boxes to see the answer and its formula.')),
      HC('p', { className: 'hca-small' }, 'For study practice. Always follow your local policy, and double-check real doses with a colleague.')),
    tab === 'convert' && HC('div', { className: 'hca7-clinical' },
      HC('select', { value: conv.i, 'aria-label': 'Conversion', onChange: e => setConv(c2 => ({ ...c2, i: Number(e.target.value) })) }, HCA7Units.map(([a, b], i) => HC('option', { key: i, value: i }, `${a} → ${b}`))),
      HC('label', {}, HC('span', {}, from), HC('input', { type: 'number', inputMode: 'decimal', step: 'any', value: conv.v, onKeyDown: e => e.stopPropagation(), onChange: e => setConv(c2 => ({ ...c2, v: e.target.value })) })),
      HC('div', { className: 'hca7-result' }, convOut ? HC('strong', {}, `${convOut} ${to}`) : HC('span', { className: 'hca-small' }, 'Type a value.'))));
}

/* ---------- Meaning: offline glossary first, then dictionary and Simple Wikipedia (no AI) ---------- */
const HCA7Glossary = {
  'abg': 'Arterial blood gas: a blood test from an artery that measures oxygen, carbon dioxide and acid–base balance (pH).',
  'adl': 'Activities of daily living: everyday self-care tasks such as washing, dressing, eating, toileting and moving about.',
  'adls': 'Activities of daily living: everyday self-care tasks such as washing, dressing, eating, toileting and moving about.',
  'ama': 'Against medical advice: when a patient leaves or refuses care the team recommends.',
  'bid': 'Twice a day (from Latin “bis in die”).',
  'bmi': 'Body mass index: weight in kilograms divided by height in metres squared; a rough screen of weight for height.',
  'bp': 'Blood pressure: the pressure of blood on artery walls, written as systolic over diastolic (for example 120/80 mmHg).',
  'bpm': 'Beats per minute: the unit for heart rate.',
  'bun': 'Blood urea nitrogen: a blood test that helps show how well the kidneys clear waste.',
  'cbc': 'Complete blood count: a blood test of red cells, white cells, haemoglobin and platelets.',
  'fbc': 'Full blood count: the UK name for a complete blood count (red cells, white cells, haemoglobin, platelets).',
  'chf': 'Congestive heart failure: the heart cannot pump enough blood for the body’s needs, so fluid can build up.',
  'copd': 'Chronic obstructive pulmonary disease: long-term lung disease (such as emphysema or chronic bronchitis) that narrows the airways.',
  'cpr': 'Cardiopulmonary resuscitation: chest compressions and rescue breaths when the heart has stopped.',
  'csf': 'Cerebrospinal fluid: the clear fluid around the brain and spinal cord.',
  'ct': 'Computed tomography: a scan that uses X-rays to make cross-section pictures of the body.',
  'cva': 'Cerebrovascular accident: an older term for stroke.',
  'cvp': 'Central venous pressure: the pressure in the large veins near the heart; a guide to fluid status.',
  'dka': 'Diabetic ketoacidosis: a dangerous complication of diabetes with high blood sugar, ketones and acid in the blood.',
  'dnr': 'Do not resuscitate: an order that CPR should not be attempted if the heart stops.',
  'dnacpr': 'Do not attempt cardiopulmonary resuscitation: the UK term for a do-not-resuscitate decision.',
  'dvt': 'Deep vein thrombosis: a blood clot in a deep vein, usually in the leg.',
  'ecg': 'Electrocardiogram: a recording of the heart’s electrical activity.',
  'ekg': 'Electrocardiogram (US spelling ECG/EKG): a recording of the heart’s electrical activity.',
  'eeg': 'Electroencephalogram: a recording of the brain’s electrical activity.',
  'gcs': 'Glasgow Coma Scale: a 3–15 score of eye, verbal and motor responses used to assess consciousness.',
  'gi': 'Gastrointestinal: relating to the stomach and intestines (the digestive tract).',
  'hba1c': 'Glycated haemoglobin: a blood test showing average blood sugar over about the last 2–3 months.',
  'hr': 'Heart rate: the number of heartbeats per minute.',
  'htn': 'Hypertension: high blood pressure.',
  'i&o': 'Intake and output: a record of all fluids a patient takes in and passes out.',
  'icu': 'Intensive care unit: a hospital area for very unwell patients who need close monitoring.',
  'im': 'Intramuscular: given into a muscle (for example an injection).',
  'iv': 'Intravenous: given into a vein.',
  'ivp': 'Intravenous push: a medicine given directly into a vein over a short time.',
  'kvo': 'Keep vein open: a very slow infusion that keeps an IV line from blocking.',
  'loc': 'Level of consciousness: how awake and responsive a person is.',
  'map': 'Mean arterial pressure: the average pressure in the arteries during one heartbeat; about (systolic + 2 × diastolic) ÷ 3.',
  'mi': 'Myocardial infarction: a heart attack, when part of the heart muscle loses its blood supply.',
  'mri': 'Magnetic resonance imaging: a scan that uses a strong magnet and radio waves, not X-rays.',
  'mrsa': 'Methicillin-resistant Staphylococcus aureus: a bacterium resistant to many common antibiotics.',
  'npo': 'Nothing by mouth (from Latin “nil per os”): no food or drink.',
  'nbm': 'Nil by mouth: the UK term for no food or drink.',
  'nsaid': 'Non-steroidal anti-inflammatory drug, such as ibuprofen; reduces pain, fever and inflammation.',
  'nsaids': 'Non-steroidal anti-inflammatory drugs, such as ibuprofen; reduce pain, fever and inflammation.',
  'o2': 'Oxygen.',
  'otc': 'Over the counter: medicines bought without a prescription.',
  'pe': 'Pulmonary embolism: a blood clot that blocks an artery in the lungs.',
  'peep': 'Positive end-expiratory pressure: pressure kept in the lungs at the end of breathing out, used on ventilators.',
  'picc': 'Peripherally inserted central catheter: a long IV line put in an arm vein that ends near the heart.',
  'po': 'By mouth (from Latin “per os”).',
  'ppe': 'Personal protective equipment: gloves, aprons, gowns, masks and eye protection.',
  'prn': 'As needed (from Latin “pro re nata”).',
  'pt': 'Patient; or physiotherapy; or prothrombin time (a clotting test), depending on context.',
  'qid': 'Four times a day (from Latin “quater in die”).',
  'rbc': 'Red blood cell (or red blood cell count).',
  'rr': 'Respiratory rate: breaths per minute.',
  'sbar': 'Situation, Background, Assessment, Recommendation: a structured way to hand over or escalate concerns.',
  'sc': 'Subcutaneous: given into the fat layer under the skin.',
  'subq': 'Subcutaneous: given into the fat layer under the skin.',
  'spo2': 'Peripheral oxygen saturation: the percentage of haemoglobin carrying oxygen, measured with a pulse oximeter.',
  'stat': 'Immediately (from Latin “statim”).',
  'tid': 'Three times a day (from Latin “ter in die”).',
  'tpn': 'Total parenteral nutrition: complete nutrition given into a vein.',
  'uti': 'Urinary tract infection: an infection of the bladder, urethra or kidneys.',
  'vs': 'Vital signs: temperature, pulse, breathing rate, blood pressure and oxygen saturation.',
  'wbc': 'White blood cell (or white blood cell count); white cells fight infection.',
  'news2': 'National Early Warning Score 2: a UK score from vital signs that helps spot patients who are getting worse.',
  'pdsa': 'Plan, Do, Study, Act: a cycle for testing a change on a small scale before spreading it.',
  'dmaic': 'Define, Measure, Analyze, Improve, Control: the five phases of a Six Sigma improvement project.',
  'kpi': 'Key performance indicator: a measure used to track how well a goal is being met.',
  'kpis': 'Key performance indicators: measures used to track how well goals are being met.',
  'sop': 'Standard operating procedure: written step-by-step instructions for doing a task the same way each time.',
  'qi': 'Quality improvement: systematic work to make care safer, more effective and more efficient.',
  'tachycardia': 'A fast heart rate, usually over 100 beats per minute in adults.',
  'bradycardia': 'A slow heart rate, usually under 60 beats per minute in adults.',
  'tachypnoea': 'Fast breathing, faster than normal for age.',
  'tachypnea': 'Fast breathing, faster than normal for age.',
  'dyspnoea': 'Difficulty breathing or shortness of breath.',
  'dyspnea': 'Difficulty breathing or shortness of breath.',
  'apnoea': 'A pause in breathing.',
  'apnea': 'A pause in breathing.',
  'hypoxia': 'Too little oxygen reaching the body’s tissues.',
  'hypoxaemia': 'Too little oxygen in the blood.',
  'hypoxemia': 'Too little oxygen in the blood.',
  'hypotension': 'Low blood pressure.',
  'hypertension': 'High blood pressure.',
  'hypoglycaemia': 'Low blood sugar.',
  'hypoglycemia': 'Low blood sugar.',
  'hyperglycaemia': 'High blood sugar.',
  'hyperglycemia': 'High blood sugar.',
  'hyperkalaemia': 'Too much potassium in the blood.',
  'hyperkalemia': 'Too much potassium in the blood.',
  'hypokalaemia': 'Too little potassium in the blood.',
  'hypokalemia': 'Too little potassium in the blood.',
  'hyponatraemia': 'Too little sodium in the blood.',
  'hyponatremia': 'Too little sodium in the blood.',
  'oedema': 'Swelling caused by fluid building up in the body’s tissues.',
  'edema': 'Swelling caused by fluid building up in the body’s tissues.',
  'cyanosis': 'A bluish colour of the skin or lips caused by low oxygen.',
  'diaphoresis': 'Heavy sweating.',
  'pallor': 'Unusually pale skin.',
  'syncope': 'Fainting: a brief loss of consciousness from reduced blood flow to the brain.',
  'sepsis': 'A life-threatening reaction to infection that damages the body’s own organs.',
  'anaphylaxis': 'A severe, life-threatening allergic reaction that needs emergency treatment.',
  'aseptic': 'Free from germs; aseptic technique keeps microorganisms out of wounds and sterile equipment.',
  'nosocomial': 'Acquired in hospital or another healthcare setting (a healthcare-associated infection).',
  'iatrogenic': 'Caused by medical treatment or care.',
  'contraindication': 'A reason not to give a treatment because it could be harmful.',
  'contraindicated': 'Should not be given because it could be harmful.',
  'prophylaxis': 'Treatment given to prevent a disease or problem.',
  'prognosis': 'The likely course and outcome of an illness.',
  'etiology': 'The cause of a disease.',
  'aetiology': 'The cause of a disease.',
  'pathophysiology': 'How a disease changes the body’s normal functions.',
  'auscultation': 'Listening to body sounds, usually with a stethoscope.',
  'palpation': 'Examining the body by touch.',
  'percussion': 'Tapping on the body to judge what lies underneath by the sound.',
  'afebrile': 'Without a fever.',
  'febrile': 'Having a fever.',
  'bolus': 'A single dose given quickly, or a rounded mass of chewed food.',
  'titrate': 'Adjust a dose step by step until the desired effect is reached.',
  'perfusion': 'Blood flow through tissues, bringing oxygen and nutrients.',
  'ischaemia': 'Reduced blood supply to a part of the body.',
  'ischemia': 'Reduced blood supply to a part of the body.',
  'infarction': 'Tissue death caused by a lack of blood supply.',
  'thrombus': 'A blood clot that forms inside a blood vessel.',
  'embolus': 'Something (often a clot) that travels in the blood and blocks a vessel.',
  'haemoglobin': 'The protein in red blood cells that carries oxygen.',
  'hemoglobin': 'The protein in red blood cells that carries oxygen.',
  'electrolytes': 'Minerals in the blood such as sodium, potassium and chloride that carry electrical charges.',
  'standardization': 'Making a process follow one agreed method, so everyone does it the same way.',
  'standardisation': 'Making a process follow one agreed method, so everyone does it the same way.',
  'triage': 'Sorting patients by how urgently they need care.',
};
const HCA7Clean = t => String(t || '').replace(/\s+/g, ' ').trim();
function HCA7GlossaryHits(text) {
  // Short keys (BP, MAP, IV…) only count when written in capitals, so “map” or “stat” in prose is not misread.
  const tokens = HCA7Clean(text).match(/[A-Za-z0-9&]+/g) || [];
  const seen = new Set(), out = [];
  for (const t of tokens) {
    const w = t.toLowerCase();
    if (!HCA7Glossary[w] || seen.has(w)) continue;
    if (w.length <= 5 && (t.match(/[A-Z]/g) || []).length < 2) continue;
    seen.add(w); out.push([w, HCA7Glossary[w]]);
  }
  return out.slice(0, 12);
}
async function HCA7Fetch(url, ms = 8000) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(url, { signal: ctl.signal }); return r.ok ? await r.json() : null; } catch { return null; } finally { clearTimeout(t); }
}
const HCA7Stop = new Set('a an and are as at be been but by can could did do does for from had has have he her his how i if in into is it its may me more most must my no not of on or our she should so some such than that the their them then there these they this those to too up us was we were what when where which while who why will with would you your also very just only each other about after before between during over under within without'.split(' '));
/* Words worth looking up in a selection: longer, non-trivial words first, plus any glossary terms. */
function HCA7Candidates(text) {
  const seen = new Set(), out = [];
  for (const t of HCA7Clean(text).match(/[A-Za-z][A-Za-z0-9'-]*[A-Za-z0-9]|[A-Za-z]{2,}/g) || []) {
    const w = t.replace(/'s$/i, ''), k = w.toLowerCase();
    if (seen.has(k) || HCA7Stop.has(k) || (w.length < 4 && !HCA7Glossary[k])) continue;
    seen.add(k); out.push(w);
  }
  return out.sort((a, b) => Number(!!HCA7Glossary[b.toLowerCase()]) - Number(!!HCA7Glossary[a.toLowerCase()]) || b.length - a.length).slice(0, 14);
}
const HCA7StripHtml = h => String(h || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

/* Free sources, no keys: Lumen glossary → Wiktionary → Free Dictionary → Simple Wikipedia → Wikipedia (with search for the closest article). */
async function HCA7LookUp(term) {
  const q = HCA7Clean(term).replace(/[“”"'.,;:!?()]/g, '').trim();
  const out = { term: q, glossary: HCA7Glossary[q.toLowerCase()] || null, dictionary: null, wiki: null, offline: !navigator.onLine };
  if (!q || out.offline) return out;
  const enc = encodeURIComponent(q), lower = encodeURIComponent(q.toLowerCase()), words = q.split(' ').length;
  const [wikt, dict, simple] = await Promise.all([
    words <= 3 ? HCA7Fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${lower}`) : null,
    words <= 2 ? HCA7Fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${lower}`) : null,
    HCA7Fetch(`https://simple.wikipedia.org/api/rest_v1/page/summary/${enc}?redirect=true`),
  ]);
  const defs = [];
  for (const sec of wikt?.en || []) for (const d of (sec.definitions || []).slice(0, 2)) { const text = HCA7StripHtml(d.definition); if (text) defs.push({ part: sec.partOfSpeech?.toLowerCase(), text }); }
  if (!defs.length && Array.isArray(dict)) for (const m of dict[0]?.meanings || []) { const text = m.definitions?.[0]?.definition; if (text) defs.push({ part: m.partOfSpeech, text }); }
  if (defs.length) out.dictionary = defs.slice(0, 3);
  let wiki = simple?.type === 'standard' ? { ...simple, simple: true } : null;
  if (!wiki) {
    let en = await HCA7Fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${enc}?redirect=true`);
    if (en?.type !== 'standard') {
      const hit = await HCA7Fetch(`https://en.wikipedia.org/w/rest.php/v1/search/title?q=${enc}&limit=1`);
      const key = hit?.pages?.[0]?.key;
      en = key ? await HCA7Fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(key)}?redirect=true`) : null;
    }
    if (en?.type === 'standard') wiki = en;
  }
  if (wiki) out.wiki = { title: wiki.title, text: (wiki.extract || '').split(/(?<=\.)\s/).slice(0, 3).join(' '), url: wiki.content_urls?.desktop?.page, simple: !!wiki.simple };
  return out;
}

/* Help language: on-device translation in Chrome when available; otherwise MyMemory (free, no key).
   The term's own Wikipedia article in the learner's language is shown when one exists. */
const HCA7Langs = [['', 'Off'], ['ar', 'العربية · Arabic'], ['bn', 'বাংলা · Bengali'], ['zh', '中文 · Chinese'], ['tl', 'Filipino'], ['fr', 'Français · French'], ['de', 'Deutsch · German'], ['hi', 'हिन्दी · Hindi'], ['id', 'Bahasa Indonesia'], ['it', 'Italiano · Italian'], ['ja', '日本語 · Japanese'], ['ko', '한국어 · Korean'], ['ml', 'മലയാളം · Malayalam'], ['ne', 'नेपाली · Nepali'], ['fa', 'فارسی · Persian'], ['pl', 'Polski · Polish'], ['pt', 'Português · Portuguese'], ['pa', 'ਪੰਜਾਬੀ · Punjabi'], ['ro', 'Română · Romanian'], ['ru', 'Русский · Russian'], ['so', 'Soomaali · Somali'], ['es', 'Español · Spanish'], ['sw', 'Kiswahili · Swahili'], ['ta', 'தமிழ் · Tamil'], ['tr', 'Türkçe · Turkish'], ['uk', 'Українська · Ukrainian'], ['ur', 'اردو · Urdu'], ['vi', 'Tiếng Việt · Vietnamese'], ['yo', 'Yorùbá · Yoruba']];
const HCA7Lang = { get: () => { try { return localStorage.getItem('lumen.helpLang') || ''; } catch { return ''; } }, set: v => { try { localStorage.setItem('lumen.helpLang', v); } catch {} } };
const HCA7Translators = {};
async function HCA7Translate(text, to) {
  const t = HCA7Clean(text).slice(0, 480);
  if (!t || !to) return null;
  try {
    if (window.Translator?.create) {
      // Use Chrome's on-device translator only when its language pack is already installed;
      // otherwise start the download quietly for next time and use the online service now.
      const ok = await Promise.race([Translator.availability({ sourceLanguage: 'en', targetLanguage: to }), new Promise(r => setTimeout(() => r('slow'), 1500))]);
      if (ok === 'available') {
        HCA7Translators[to] ??= Translator.create({ sourceLanguage: 'en', targetLanguage: to });
        const out = await Promise.race([HCA7Translators[to].then(tr => tr.translate(t)), new Promise(r => setTimeout(() => r(null), 6000))]);
        if (out) return { text: out, via: 'on this device (Chrome)' };
      } else if (ok === 'downloadable' && navigator.userActivation?.isActive) {
        Translator.create({ sourceLanguage: 'en', targetLanguage: to }).catch(() => {});
      }
    }
  } catch {}
  const r = await HCA7Fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(t)}&langpair=en|${to}`);
  const out = r?.responseData?.translatedText;
  return out && !/MYMEMORY WARNING|INVALID|QUERY LENGTH/i.test(out) ? { text: HCA7StripHtml(out), via: 'MyMemory' } : null;
}
async function HCA7WikiInLang(title, lang) {
  if (!title || !lang) return null;
  const r = await HCA7Fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&titles=${encodeURIComponent(title)}&lllang=${lang}&format=json&origin=*`);
  const page = Object.values(r?.query?.pages || {})[0], local = page?.langlinks?.[0]?.['*'];
  if (!local) return null;
  const sum = await HCA7Fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(local)}`);
  return sum?.type === 'standard' ? { title: sum.title, text: (sum.extract || '').split(/(?<=[.。؟?!])\s/).slice(0, 2).join(' '), url: sum.content_urls?.desktop?.page } : { title: local, text: '', url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(local)}` };
}

function HCA7Meaning({ text, page, bookId }) {
  const ctx = y(), [query, setQuery] = _.useState(''), [res, setRes] = _.useState(null), [busy, setBusy] = _.useState(false), win = HCA7Win('meaning');
  const [lang, setLang] = _.useState(HCA7Lang.get), [help, setHelp] = _.useState(null), [helpBusy, setHelpBusy] = _.useState(false), [passage, setPassageT] = _.useState(null), run = _.useRef(0);
  const sel = HCA7Clean(text), short = sel && sel.split(' ').length <= 3;
  const cands = sel && !short ? HCA7Candidates(sel) : [];
  const go = async term => {
    if (!HCA7Clean(term)) return;
    const id = ++run.current; setQuery(term); setBusy(true); setHelp(null);
    const r = await HCA7LookUp(term); if (id !== run.current) return;
    setRes(r); setBusy(false);
  };
  _.useEffect(() => {
    setRes(null); setHelp(null); setPassageT(null);
    if (short) go(sel.replace(/[“”"'.,;:!?()]/g, ''));
    else { const g = cands.find(w => HCA7Glossary[w.toLowerCase()]); setQuery(g || ''); if (g) go(g); }
  }, [text]);
  const meaning = res && (res.glossary || res.dictionary?.[0]?.text || res.wiki?.text);
  _.useEffect(() => {
    if (!lang || !res?.term) return;
    let live = true; setHelpBusy(true);
    Promise.all([HCA7Translate(res.term, lang), meaning ? HCA7Translate(meaning, lang) : null, HCA7WikiInLang(res.wiki?.title, lang)])
      .then(([term, mean, wiki]) => { if (live) { setHelp({ term, mean, wiki }); setHelpBusy(false); } });
    return () => { live = false; };
  }, [res, lang]);
  const translatePassage = async () => { setPassageT({ busy: true }); setPassageT((await HCA7Translate(sel, lang)) || { text: '', failed: true }); };
  const card = () => {
    if (!bookId || !meaning) return;
    ctx.setState(s => ({ ...s, cards: [...s.cards, { id: ue(), bookId, page, question: `What does “${res.term}” mean?`, answer: meaning + (help?.term?.text ? `\n(${help.term.text})` : ''), sourceText: sel.slice(0, 600), createdAt: Date.now(), due: Date.now(), step: -1, reviews: 0 }] }));
    ctx.toast('Recall card made. It will come up in your reviews.');
  };
  const rtl = ['ar', 'fa', 'ur'].includes(lang);
  return HC('section', { ref: win.ref, className: 'hca7-float hca7-meaning', style: win.style, 'aria-label': 'Meaning' },
    HC('header', { ...win.header, title: 'Drag to move · double-click to reset' }, HCAIcon('search-line'), HC('strong', {}, 'Meaning'),
      HC('label', { className: 'hca7-lang', title: 'Help language: translations and articles in your language' }, HC('span', { className: 'sr-only' }, 'Help language'),
        HC('select', { value: lang, onChange: e => { setLang(e.target.value); HCA7Lang.set(e.target.value); setPassageT(null); } }, HCA7Langs.map(([v, l]) => HC('option', { key: v, value: v }, v ? l : 'Help language: off')))),
      HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': 'Close meaning', onClick: () => HCA7Set({ define: null }) }, HCAIcon('close-line'))),
    HC('form', { className: 'hca7-lookup', onSubmit: e => { e.preventDefault(); go(query); } },
      HC('input', { value: query, onChange: e => setQuery(e.target.value), onKeyDown: e => e.stopPropagation(), placeholder: 'Type a word or term', 'aria-label': 'Word or term to look up' }),
      HCABtn(busy ? 'Looking…' : 'Look up', () => go(query), 'primary', busy ? 'loader-4-line' : 'search-line', { disabled: busy || !query.trim() })),
    cands.length > 0 && HC('div', { className: 'hca7-cands' }, HC('p', { className: 'hca-small' }, 'Choose a word from your selection'),
      HC('div', {}, cands.map(w => HC('button', { key: w, type: 'button', className: `hca4-tag ${res?.term?.toLowerCase() === w.toLowerCase() ? 'on' : ''} ${HCA7Glossary[w.toLowerCase()] ? 'gloss' : ''}`, onClick: () => go(w) }, w)))),
    cands.length > 0 && lang && HC('div', { className: 'hca7-passage' },
      passage?.text ? HC('p', { dir: 'auto', lang }, passage.text, HC('small', {}, ` · translated ${passage.via}`)) : passage?.failed ? HC('p', { className: 'hca-small' }, 'Translation is not available right now.') : null,
      !passage?.text && HCABtn(passage?.busy ? 'Translating…' : 'Translate the whole selection', translatePassage, 'secondary', 'refresh-line', { disabled: !!passage?.busy })),
    busy && HC('div', { className: 'hca7-progress indeterminate', role: 'progressbar', 'aria-label': 'Looking up' }, HC('span', {})),
    res && !busy && HC('div', { className: 'hca7-def', 'aria-live': 'polite' },
      HC('h4', {}, res.term),
      res.glossary && HC('p', {}, HC('span', { className: 'hca7-src' }, 'Lumen glossary'), res.glossary),
      res.dictionary && HC('div', {}, HC('span', { className: 'hca7-src' }, 'Dictionary'), HC('ul', {}, res.dictionary.map((d, i) => HC('li', { key: i }, d.part && HC('em', {}, d.part), ' ', d.text)))),
      res.wiki && HC('p', {}, HC('span', { className: 'hca7-src' }, res.wiki.simple ? 'Simple Wikipedia · plain English' : `Wikipedia · ${res.wiki.title}`), res.wiki.text, ' ', res.wiki.url && HC('a', { href: res.wiki.url, target: '_blank', rel: 'noopener noreferrer', className: 'text-link inline' }, 'Read more', HCAIcon('external-link-line'))),
      !meaning && HC('p', { className: 'hca-small' }, res.offline ? 'You are offline, and this term is not in the Lumen glossary.' : 'No definition found for this exact wording. Pick one word above, or try a shorter term.'),
      lang && HC('div', { className: 'hca7-help', dir: 'auto', lang },
        HC('span', { className: 'hca7-src' }, `In ${HCA7Langs.find(l => l[0] === lang)?.[1]}`),
        helpBusy ? HC('div', { className: 'hca7-progress indeterminate' }, HC('span', {})) : HC(_.Fragment, {},
          help?.term?.text && HC('p', { className: 'hca7-help-term', style: { textAlign: rtl ? 'right' : undefined } }, help.term.text),
          help?.mean?.text && HC('p', { style: { textAlign: rtl ? 'right' : undefined } }, help.mean.text),
          help?.wiki && HC('p', { style: { textAlign: rtl ? 'right' : undefined } }, help.wiki.text, ' ', HC('a', { href: help.wiki.url, target: '_blank', rel: 'noopener noreferrer', className: 'text-link inline' }, help.wiki.title, HCAIcon('external-link-line'))),
          !help?.term && !help?.mean && !help?.wiki && HC('p', { className: 'hca-small' }, 'No translation available right now.'),
          (help?.term || help?.mean) && HC('small', { className: 'hca-small' }, `Machine translation ${help.term?.via || help.mean?.via}. Check important terms with your tutor.`))),
      meaning && HC('div', { className: 'hca5-row' }, HCABtn('Make a recall card', card, 'secondary', 'stack-line', { disabled: !bookId }), HCABtn('Copy', () => navigator.clipboard?.writeText(`${res.term}: ${meaning}`).then(() => ctx.toast('Copied.')), 'secondary', 'file-copy-line'), HCABtn('Look up again', () => go(res.term), 'secondary', 'refresh-line'))),
    HC('p', { className: 'hca-small' }, 'General definitions for study, not clinical advice. Sources: Lumen glossary, Wiktionary, Free Dictionary, Wikipedia', lang ? '; translations on your device (Chrome) or by MyMemory, which receives the words you translate.' : '.'));
}
window.HCA7Define = (text, page, bookId) => HCA7Set({ define: { text, page, bookId } });

/* ---------- PowerPoint library (PptxGenJS with JSZip), stored compressed and unpacked on first use ---------- */
let HCA7PptxReady = null;
function HCA7LoadPptx() {
  if (window.PptxGenJS && window.JSZip) return Promise.resolve();
  HCA7PptxReady ??= (async () => {
    const tag = document.getElementById('lumen-pptx');
    if (!tag) throw Error('The PowerPoint tools are missing from this copy of Lumen.');
    const bytes = Uint8Array.from(atob(tag.textContent.trim()), c => c.charCodeAt(0));
    const text = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
    const url = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
    await new Promise((ok, bad) => { const s = document.createElement('script'); s.src = url; s.onload = ok; s.onerror = () => bad(Error('The PowerPoint tools could not start.')); document.head.appendChild(s); });
    URL.revokeObjectURL(url);
  })().catch(e => { HCA7PptxReady = null; throw e; });
  return HCA7PptxReady;
}

/* ---------- Collect a source's study items (for Present and Export) ---------- */
function HCA7Collect(state, bookId, onlyPage, include) {
  const book = state.books.find(b => b.id === bookId);
  const inPage = x => x.bookId === bookId && (!onlyPage || x.page === onlyPage);
  const items = [];
  if (include.highlights) state.highlights.filter(inPage).forEach(h => h.text && items.push({ kind: 'Highlight', page: h.page, text: h.text, color: h.color, at: h.createdAt }));
  if (include.notes) state.notes.filter(inPage).forEach(n => items.push({ kind: n.anchor ? 'Sticky note' : n.kind === 'recall' ? 'Recall reflection' : 'Note', page: n.page, title: n.title, text: n.text, at: n.createdAt }));
  if (include.snips) (state.hcaSnips || []).filter(inPage).forEach(s => items.push({ kind: 'Snip', page: s.page, title: s.caption, image: s.image, at: s.createdAt }));
  if (include.cards) state.cards.filter(inPage).forEach(c => items.push({ kind: 'Recall card', page: c.page, title: c.question, text: c.answer, at: c.createdAt }));
  items.sort((a, b) => (a.page || 0) - (b.page || 0) || a.at - b.at);
  return { book, items };
}
const HCA7Esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const HCA7Slug = t => String(t || 'Lumen').replace(/[\\/:*?"<>|]+/g, ' ').slice(0, 60).trim();

function HCA7Html({ book, items }, forPrint) {
  const body = items.map(it => `<section class="it"><p class="k">${HCA7Esc(it.kind)} · page ${it.page}</p>${it.title ? `<h3>${HCA7Esc(it.title)}</h3>` : ''}${it.image ? `<img src="${it.image}" alt="">` : ''}${it.text ? `<${it.kind === 'Highlight' ? 'blockquote' : 'p'}>${HCA7Esc(it.text).replace(/\n/g, '<br>')}</${it.kind === 'Highlight' ? 'blockquote' : 'p'}>` : ''}</section>`).join('\n');
  const H = ['he', 'ad', 'bo', 'dy'];
  return `<!doctype html><html><${H[0]}${H[1]}><meta charset="utf-8"><title>${HCA7Esc(book.title)} · study notes</title><style>body{font:12pt/1.5 Georgia,serif;color:#10253a;max-width:46em;margin:2em auto;padding:0 1em}h1{font-size:20pt;margin:0}h3{margin:.2em 0}.sub{color:#555;margin:.2em 0 1.5em}.it{border-top:1px solid #ccc;padding:.8em 0;page-break-inside:avoid}.k{font:600 9pt Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#087d7a;margin:0}blockquote{margin:.3em 0;padding:.2em .8em;border-left:4px solid #e4c25a;background:#fdf7e3}img{max-width:100%;border:1px solid #ddd}</style></${H[0]}${H[1]}><${H[2]}${H[3]}><h1>${HCA7Esc(book.title)}</h1><p class="sub">Study notes from Lumen · ${items.length} item${items.length === 1 ? '' : 's'} · ${new Date().toLocaleDateString()}</p>${body}${forPrint ? '<scr' + 'ipt>onload=()=>setTimeout(()=>print(),300)</scr' + 'ipt>' : ''}</${H[2]}${H[3]}></html>`;
}
function HCA7Markdown({ book, items }) {
  return `# ${book.title}\n\nStudy notes from Lumen · ${new Date().toLocaleDateString()}\n\n` + items.map(it => `## ${it.kind} · page ${it.page}${it.title ? `: ${it.title}` : ''}\n\n${it.image ? '_(snip image: see the Word, PowerPoint or print export)_\n\n' : ''}${it.text ? (it.kind === 'Highlight' ? `> ${it.text.replace(/\n/g, '\n> ')}` : it.text) : ''}\n`).join('\n');
}
async function HCA7Pptx(data) {
  HCA7Set({ progress: { title: 'Making your PowerPoint', label: 'Preparing slides', value: null } });
  try { await HCA7PptxBuild(data); HCA7Set({ progress: null }); }
  catch (e) { HCA7Set({ progress: null }); throw e; }
}
async function HCA7PptxBuild({ book, items }) {
  await HCA7LoadPptx();
  const p = new window.PptxGenJS();
  p.layout = 'LAYOUT_WIDE'; p.title = book.title; p.company = 'Healthcare Crown Academy';
  const navy = '10253A', teal = '087D7A';
  let s = p.addSlide(); s.background = { color: 'F7F4EC' };
  s.addText(book.title, { x: .7, y: 2.2, w: 12, h: 1.4, fontFace: 'Georgia', fontSize: 40, color: navy, bold: true });
  s.addText(`Study notes · ${items.length} slide${items.length === 1 ? '' : 's'} · ${new Date().toLocaleDateString()}`, { x: .7, y: 3.7, w: 12, h: .6, fontSize: 18, color: '555555' });
  s.addText('Made with Lumen · Healthcare Crown Academy', { x: .7, y: 6.6, w: 12, h: .4, fontSize: 12, color: teal });
  for (const it of items) {
    s = p.addSlide(); s.background = { color: 'FFFFFF' };
    s.addText(`${it.kind.toUpperCase()} · PAGE ${it.page}`, { x: .6, y: .35, w: 12, h: .4, fontSize: 12, bold: true, color: teal, charSpacing: 2 });
    if (it.title) s.addText(it.title, { x: .6, y: .8, w: 12.1, h: .9, fontFace: 'Georgia', fontSize: 28, color: navy, bold: true, fit: 'shrink' });
    const top = it.title ? 1.8 : 1;
    if (it.image) {
      const dims = await new Promise(ok => { const i = new Image(); i.onload = () => ok([i.width, i.height]); i.onerror = () => ok([4, 3]); i.src = it.image; });
      const maxW = 12.1, maxH = 7.5 - top - .4, r = Math.min(maxW / dims[0], maxH / dims[1]);
      s.addImage({ data: it.image, x: .6 + (maxW - dims[0] * r) / 2, y: top, w: dims[0] * r, h: dims[1] * r });
    } else if (it.text) {
      s.addText(it.text.slice(0, 1500), { x: .6, y: top, w: 12.1, h: 7.5 - top - .5, fontSize: it.text.length > 600 ? 16 : 22, color: '222222', valign: 'top', fit: 'shrink', ...(it.kind === 'Highlight' ? { fill: { color: 'FDF7E3' }, line: { color: 'E4C25A', width: 1 }, margin: 12 } : {}) });
    }
    s.addText(book.title, { x: .6, y: 7, w: 12, h: .3, fontSize: 10, color: '888888' });
  }
  await p.writeFile({ fileName: `${HCA7Slug(book.title)} study notes.pptx` });
}

function HCA7ExportDialog({ bookId, page, present, onClose }) {
  const ctx = y(), books = ctx.state.books;
  const [bid, setBid] = _.useState(bookId || books[0]?.id), [scope, setScope] = _.useState('all'), [busy, setBusy] = _.useState('');
  const [inc, setInc] = _.useState({ highlights: true, notes: true, snips: true, cards: false });
  if (!books.length) return HC(A, { title: 'Nothing to export yet.', onClose }, HC('p', {}, 'Add a source and make some highlights or notes first.'));
  const data = HCA7Collect(ctx.state, bid, scope === 'page' && bid === bookId ? page : null, inc);
  const counts = ['highlights', 'notes', 'snips', 'cards'].map(k => [k, HCA7Collect(ctx.state, bid, scope === 'page' && bid === bookId ? page : null, { [k]: true }).items.length]);
  const act = async (name, fn) => { setBusy(name); try { await fn(); } catch (e) { ctx.toast(e.message || 'Export failed.', 'warning'); } setBusy(''); };
  const none = !data.items.length;
  const cardsCsv = () => {
    const cards = ctx.state.cards.filter(c => c.bookId === bid);
    const q = t => `"${String(t ?? '').replace(/"/g, '""')}"`;
    HCA7Download(new Blob(['﻿Question,Answer,Page\n' + cards.map(c => [q(c.question), q(c.answer), c.page || ''].join(',')).join('\n')], { type: 'text/csv' }), `${HCA7Slug(data.book.title)} recall cards.csv`);
  };
  return HC(A, { title: present ? 'Present your notes.' : 'Export your study notes.', eyebrow: 'SLIDES AND FILES · NOTHING LEAVES YOUR DEVICE', onClose, className: 'hca7-export',
    footer: HC(_.Fragment, {}, HCABtn('Close', onClose, 'secondary', 'close-line'), HCABtn('Present', () => { onClose(); HCA7Set({ present: data }); }, 'primary', 'play-fill', { disabled: none })) },
    HC('div', { className: 'hca7-export-grid' },
      HC('label', { className: 'hca-field' }, 'Source', HC('select', { value: bid, onChange: e => setBid(e.target.value) }, books.map(b => HC('option', { key: b.id, value: b.id }, b.title)))),
      HC('label', { className: 'hca-field' }, 'Pages', HC('select', { value: scope, onChange: e => setScope(e.target.value) }, HC('option', { value: 'all' }, 'Whole source'), HC('option', { value: 'page', disabled: bid !== bookId }, `Page ${page || ''} only`)))),
    HC('fieldset', { className: 'hca7-include' }, HC('legend', {}, 'Include'),
      counts.map(([k, n]) => HC('label', { key: k, className: 'hca4-check' }, HC('input', { type: 'checkbox', checked: inc[k], onChange: e => setInc(v => ({ ...v, [k]: e.target.checked })) }), `${{ highlights: 'Highlights', notes: 'Notes and sticky notes', snips: 'Snips', cards: 'Recall cards' }[k]} (${n})`))),
    none && HC('p', { className: 'hca-small' }, 'Nothing selected yet for this source. Highlight passages, add notes or keep snips first.'),
    HC('div', { className: 'hca7-export-actions' },
      HCABtn(busy === 'pptx' ? 'Making slides…' : 'PowerPoint (.pptx)', () => act('pptx', () => HCA7Pptx(data)), 'secondary', 'gallery-line', { disabled: none || !!busy }),
      HCABtn('Word (.doc)', () => act('doc', () => HCA7Download(new Blob(['﻿' + HCA7Html(data)], { type: 'application/msword' }), `${HCA7Slug(data.book.title)} study notes.doc`)), 'secondary', 'file-text-line', { disabled: none || !!busy }),
      HCABtn('Print or save as PDF', () => act('print', () => { const w = window.open(URL.createObjectURL(new Blob([HCA7Html(data, true)], { type: 'text/html' })), '_blank'); if (!w) throw Error('Allow pop-ups for this page to print.'); }), 'secondary', 'file-pdf-2-line', { disabled: none || !!busy }),
      HCABtn('Markdown (.md)', () => act('md', () => HCA7Download(new Blob([HCA7Markdown(data)], { type: 'text/markdown' }), `${HCA7Slug(data.book.title)} study notes.md`)), 'secondary', 'list-unordered', { disabled: none || !!busy }),
      HCABtn('Recall cards (.csv)', () => act('csv', cardsCsv), 'secondary', 'stack-line', { disabled: !ctx.state.cards.some(c => c.bookId === bid) || !!busy })),
    HC('p', { className: 'hca-small' }, 'PowerPoint and Word files open in Microsoft Office, Google Slides and Docs, and Keynote. The CSV works with Anki and spreadsheets.'));
}

/* ---------- Presenter: full-screen slides, arrow keys, Esc to leave ---------- */
function HCA7Presenter({ data }) {
  const [i, setI] = _.useState(0), slides = [{ cover: true }, ...data.items], n = slides.length, ref = _.useRef(null);
  const go = d => setI(x => Math.max(0, Math.min(n - 1, x + d)));
  _.useEffect(() => {
    ref.current?.requestFullscreen?.().catch(() => {});
    const key = e => { if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); go(1); } else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); go(-1); } else if (e.key === 'Escape') { HCA7Set({ present: null }); } else if (e.key === 'Home') setI(0); else if (e.key === 'End') setI(n - 1); e.stopPropagation(); };
    window.addEventListener('keydown', key, true);
    const exit = () => { if (!document.fullscreenElement) HCA7Set({ present: null }); };
    document.addEventListener('fullscreenchange', exit);
    return () => { window.removeEventListener('keydown', key, true); document.removeEventListener('fullscreenchange', exit); if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); };
  }, []);
  const s = slides[i];
  return HC('div', { ref, className: 'hca7-present', role: 'dialog', 'aria-label': 'Presentation', onClick: e => { if (!e.target.closest('button')) go(e.clientX > innerWidth / 3 ? 1 : -1); } },
    HC('div', { className: 'hca7-slide' }, s.cover
      ? HC(_.Fragment, {}, HC('p', { className: 'k' }, 'STUDY NOTES'), HC('h1', {}, data.book.title), HC('p', { className: 'sub' }, `${data.items.length} slides · press → to begin`))
      : HC(_.Fragment, {}, HC('p', { className: 'k' }, `${s.kind} · page ${s.page}`), s.title && HC('h2', {}, s.title), s.image && HC('img', { src: s.image, alt: s.title || `Snip from page ${s.page}` }), s.text && HC(s.kind === 'Highlight' ? 'blockquote' : 'p', { className: s.text.length > 500 ? 'long' : '' }, s.text))),
    HC('footer', {}, HC('button', { type: 'button', onClick: () => go(-1), disabled: i === 0, 'aria-label': 'Previous slide' }, HCAIcon('arrow-left-s-line')), HC('span', {}, `${i + 1} / ${n}`), HC('button', { type: 'button', onClick: () => go(1), disabled: i === n - 1, 'aria-label': 'Next slide' }, HCAIcon('arrow-right-s-line')), HC('button', { type: 'button', onClick: () => HCA7Set({ present: null }), 'aria-label': 'Leave presentation' }, HCAIcon('close-line'))));
}

/* ---------- PowerPoint import: each slide becomes a page image ----------
   Text boxes, pictures, filled shapes and simple tables are drawn; charts, SmartArt, video and
   animations are not. For an exact copy, save the deck as PDF in PowerPoint and upload that. */
const HCA7NS = { a: 'http://schemas.openxmlformats.org/drawingml/2006/main', p: 'http://schemas.openxmlformats.org/presentationml/2006/main', r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships' };
const HCA7Kids = (el, ns, name) => [...(el?.children || [])].filter(c => c.localName === name && (!ns || c.namespaceURI === HCA7NS[ns]));
const HCA7Kid = (el, ns, name) => HCA7Kids(el, ns, name)[0] || null;
const HCA7Deep = (el, name) => el ? [...el.getElementsByTagNameNS('*', name)] : [];
function HCA7Rels(xml) { const m = {}; if (!xml) return m; new DOMParser().parseFromString(xml, 'application/xml').querySelectorAll('Relationship').forEach(r => { m[r.getAttribute('Id')] = { target: r.getAttribute('Target'), type: r.getAttribute('Type') || '' }; }); return m; }
function HCA7Resolve(base, target) { const parts = base.split('/').slice(0, -1); for (const seg of target.split('/')) { if (seg === '..') parts.pop(); else if (seg !== '.') parts.push(seg); } return parts.join('/'); }
function HCA7Xfrm(el) { const x = HCA7Deep(el, 'xfrm')[0]; if (!x) return null; const off = HCA7Kid(x, 'a', 'off'), ext = HCA7Kid(x, 'a', 'ext'); if (!off || !ext) return null; return { x: +off.getAttribute('x'), y: +off.getAttribute('y'), w: +ext.getAttribute('cx'), h: +ext.getAttribute('cy') }; }
function HCA7Color(el) {
  const srgb = el && HCA7Deep(el, 'srgbClr')[0]; if (srgb) return '#' + srgb.getAttribute('val');
  const scheme = el && HCA7Deep(el, 'schemeClr')[0];
  if (scheme) return ({ bg1: '#ffffff', lt1: '#ffffff', tx1: '#111111', dk1: '#111111', tx2: '#1f3864', dk2: '#1f3864', accent1: '#4472c4', accent2: '#ed7d31', accent3: '#a5a5a5', accent4: '#ffc000', accent5: '#5b9bd5', accent6: '#70ad47' })[scheme.getAttribute('val')] || null;
  return null;
}
function HCA7PhKey(sp) { const ph = HCA7Deep(sp, 'ph')[0]; return ph ? { type: ph.getAttribute('type') || 'body', idx: ph.getAttribute('idx') } : null; }

async function HCA7PptxRender(file, onProgress) {
  await HCA7LoadPptx();
  const zip = await window.JSZip.loadAsync(file);
  const read = path => zip.file(path)?.async('string');
  const parse = xml => new DOMParser().parseFromString(xml, 'application/xml');
  const pres = parse(await read('ppt/presentation.xml')), presRels = HCA7Rels(await read('ppt/_rels/presentation.xml.rels'));
  const sz = HCA7Deep(pres, 'sldSz')[0], EW = +(sz?.getAttribute('cx') || 12192000), EH = +(sz?.getAttribute('cy') || 6858000);
  const ids = HCA7Deep(pres, 'sldId').map(s => s.getAttributeNS(HCA7NS.r, 'id') || s.getAttribute('r:id'));
  const paths = ids.map(id => presRels[id] && HCA7Resolve('ppt/presentation.xml', presRels[id].target)).filter(Boolean);
  if (!paths.length) throw Error(`“${file.name}” has no slides Lumen can read.`);
  const W = 1600, H = Math.round(W * EH / EW), k = W / EW, ptPx = W / (EW / 12700);
  const base = file.name.replace(/\.pptx$/i, ''), out = [];
  const layoutCache = {};
  async function placeholders(path) {
    if (layoutCache[path]) return layoutCache[path];
    const xml = await read(path); if (!xml) return (layoutCache[path] = { map: {}, rels: {} });
    const doc = parse(xml), rels = HCA7Rels(await read(path.replace(/([^/]+)$/, '_rels/$1.rels'))), map = {};
    HCA7Deep(doc, 'sp').forEach(sp => { const ph = HCA7PhKey(sp), xf = HCA7Xfrm(sp); if (ph && xf) { map[`t:${ph.type}`] ??= xf; if (ph.idx) map[`i:${ph.idx}`] ??= xf; } });
    return (layoutCache[path] = { map, rels, doc });
  }
  for (let n = 0; n < paths.length; n++) {
    if (HCA7UI.state.progress?.cancelled) throw Error('Cancelled.');
    onProgress?.(`Drawing slide ${n + 1} of ${paths.length}`, (n + .5) / paths.length);
    const path = paths[n], doc = parse(await read(path)), rels = HCA7Rels(await read(path.replace(/([^/]+)$/, '_rels/$1.rels')));
    const layoutRel = Object.values(rels).find(r => r.type.endsWith('/slideLayout'));
    const layoutPath = layoutRel && HCA7Resolve(path, layoutRel.target), layout = layoutPath ? await placeholders(layoutPath) : { map: {}, rels: {} };
    const masterRel = Object.values(layout.rels || {}).find(r => r.type.endsWith('/slideMaster'));
    const master = masterRel ? await placeholders(HCA7Resolve(layoutPath, masterRel.target)) : { map: {} };
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), words = [];
    const bg = HCA7Color(HCA7Deep(doc, 'bg')[0]) || HCA7Color(HCA7Deep(layout.doc, 'bg')[0]) || HCA7Color(HCA7Deep(master.doc, 'bg')[0]) || '#ffffff';
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const where = (sp, t) => {
      let xf = HCA7Xfrm(sp); const ph = HCA7PhKey(sp);
      if (!xf && ph) xf = (ph.idx && (layout.map[`i:${ph.idx}`] || master.map[`i:${ph.idx}`])) || layout.map[`t:${ph.type}`] || master.map[`t:${ph.type}`] || (ph.type === 'ctrTitle' && (layout.map['t:title'] || master.map['t:title']));
      if (!xf) xf = ph && /title/i.test(ph.type) ? { x: EW * .06, y: EH * .05, w: EW * .88, h: EH * .17 } : { x: EW * .06, y: EH * .25, w: EW * .88, h: EH * .68 };
      return { x: t.ox + (xf.x - t.cx) * t.sx, y: t.oy + (xf.y - t.cy) * t.sy, w: xf.w * t.sx, h: xf.h * t.sy };
    };
    const drawText = (txBody, box, ph) => {
      if (!txBody) return;
      const title = ph && /title/i.test(ph.type), scale = +(HCA7Deep(txBody, 'normAutofit')[0]?.getAttribute('fontScale') || 100000) / 100000;
      const pad = 8, maxW = box.w * k - pad * 2; let yy = box.y * k + pad;
      const anchor = HCA7Deep(txBody, 'bodyPr')[0]?.getAttribute('anchor');
      const lines = [];
      for (const p of HCA7Kids(txBody, 'a', 'p')) {
        const runs = [...HCA7Kids(p, 'a', 'r'), ...HCA7Kids(p, 'a', 'fld')];
        const text = runs.map(r => HCA7Kid(r, 'a', 't')?.textContent || '').join('');
        const rPr = runs.map(r => HCA7Kid(r, 'a', 'rPr')).find(Boolean) || HCA7Deep(p, 'endParaRPr')[0];
        const size = (+(rPr?.getAttribute('sz')) / 100 || (title ? 36 : 20)) * scale * ptPx;
        const lvl = +(HCA7Kid(p, 'a', 'pPr')?.getAttribute('lvl') || 0), bullet = !title && ph && ph.type === 'body' && text.trim() && !HCA7Deep(p, 'buNone').length;
        const font = `${rPr?.getAttribute('i') === '1' ? 'italic ' : ''}${rPr?.getAttribute('b') === '1' || title ? 'bold ' : ''}${Math.max(8, size)}px Calibri, Arial, sans-serif`;
        const align = HCA7Kid(p, 'a', 'pPr')?.getAttribute('algn');
        lines.push({ text: (bullet ? '• ' : '') + text, font, size: Math.max(8, size), indent: lvl * size * 1.2, color: HCA7Color(rPr) || (title ? '#1f2937' : '#222222'), align });
      }
      const wrapped = [];
      for (const l of lines) {
        g.font = l.font; const words = l.text.split(' '); let cur = '';
        if (!l.text) { wrapped.push({ ...l, text: '' }); continue; }
        for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW - l.indent && cur) { wrapped.push({ ...l, text: cur }); cur = w; } else cur = t; }
        wrapped.push({ ...l, text: cur });
      }
      const total = wrapped.reduce((s2, l) => s2 + l.size * 1.2, 0);
      if (anchor === 'ctr') yy = box.y * k + Math.max(pad, (box.h * k - total) / 2); else if (anchor === 'b') yy = box.y * k + Math.max(pad, box.h * k - total - pad);
      g.textBaseline = 'top';
      for (const l of wrapped) {
        g.font = l.font; g.fillStyle = l.color;
        const tw = g.measureText(l.text).width, x0 = box.x * k + pad + l.indent;
        const xx = l.align === 'ctr' ? box.x * k + (box.w * k - tw) / 2 : l.align === 'r' ? box.x * k + box.w * k - pad - tw : x0;
        g.fillText(l.text, xx, yy);
        if (l.text.trim()) words.push({ text: l.text, x: xx, y: yy, size: l.size, width: tw });
        yy += l.size * 1.2;
      }
    };
    const walk = async (tree, t) => {
      for (const el of [...tree.children]) {
        const name = el.localName;
        if (name === 'sp') {
          const box = where(el, t), spPr = HCA7Kid(el, 'p', 'spPr'), fill = spPr && HCA7Kid(spPr, 'a', 'solidFill'), ln = spPr && HCA7Kid(spPr, 'a', 'ln');
          if (fill) { g.fillStyle = HCA7Color(fill) || '#dddddd'; g.fillRect(box.x * k, box.y * k, box.w * k, box.h * k); }
          if (ln && HCA7Kid(ln, 'a', 'solidFill')) { g.strokeStyle = HCA7Color(ln) || '#999'; g.lineWidth = 2; g.strokeRect(box.x * k, box.y * k, box.w * k, box.h * k); }
          drawText(HCA7Kid(el, 'p', 'txBody'), box, HCA7PhKey(el));
        } else if (name === 'pic') {
          const box = where(el, t), blip = HCA7Deep(el, 'blip')[0], rid = blip?.getAttributeNS(HCA7NS.r, 'embed') || blip?.getAttribute('r:embed'), rel = rels[rid];
          const media = rel && zip.file(HCA7Resolve(path, rel.target));
          let drawn = false;
          if (media && /\.(png|jpe?g|gif|bmp|webp)$/i.test(rel.target)) {
            try { const bmp = await createImageBitmap(await media.async('blob')); g.drawImage(bmp, box.x * k, box.y * k, box.w * k, box.h * k); drawn = true; } catch {}
          }
          if (!drawn) { g.fillStyle = '#eef0f3'; g.fillRect(box.x * k, box.y * k, box.w * k, box.h * k); g.fillStyle = '#667085'; g.font = '20px Arial'; g.fillText('Picture not shown', box.x * k + 10, box.y * k + 10); }
        } else if (name === 'grpSp') {
          const gp = HCA7Kid(el, 'p', 'grpSpPr'), x = gp && HCA7Kid(gp, 'a', 'xfrm');
          if (x) {
            const off = HCA7Kid(x, 'a', 'off'), ext = HCA7Kid(x, 'a', 'ext'), cOff = HCA7Kid(x, 'a', 'chOff'), cExt = HCA7Kid(x, 'a', 'chExt');
            const sx = cExt && +cExt.getAttribute('cx') ? +ext.getAttribute('cx') / +cExt.getAttribute('cx') : 1, sy = cExt && +cExt.getAttribute('cy') ? +ext.getAttribute('cy') / +cExt.getAttribute('cy') : 1;
            await walk(el, { ox: t.ox + (+off.getAttribute('x') - t.cx) * t.sx, oy: t.oy + (+off.getAttribute('y') - t.cy) * t.sy, cx: +(cOff?.getAttribute('x') || 0), cy: +(cOff?.getAttribute('y') || 0), sx: sx * t.sx, sy: sy * t.sy });
          } else await walk(el, t);
        } else if (name === 'graphicFrame') {
          const tbl = HCA7Deep(el, 'tbl')[0], box = where(el, t);
          if (tbl) {
            const rows = HCA7Kids(tbl, 'a', 'tr'), rh = box.h / Math.max(1, rows.length);
            rows.forEach((tr, ri) => { const cells = HCA7Kids(tr, 'a', 'tc'), cw = box.w / Math.max(1, cells.length);
              cells.forEach((tc, ci) => { const cb = { x: box.x + ci * cw, y: box.y + ri * rh, w: cw, h: rh }; g.strokeStyle = '#9aa4b2'; g.lineWidth = 1; g.strokeRect(cb.x * k, cb.y * k, cb.w * k, cb.h * k); drawText(HCA7Kid(tc, 'a', 'txBody'), cb, null); }); });
          } else { g.fillStyle = '#eef0f3'; g.fillRect(box.x * k, box.y * k, box.w * k, box.h * k); g.fillStyle = '#667085'; g.font = '20px Arial'; g.fillText('Chart or diagram not shown', box.x * k + 10, box.y * k + 10); }
        }
      }
    };
    const tree = HCA7Deep(doc, 'spTree')[0];
    if (tree) await walk(tree, { ox: 0, oy: 0, cx: 0, cy: 0, sx: 1, sy: 1 });
    out.push({ canvas: c, words, W, H, ptW: EW / 12700, ptH: EH / 12700 });
    await new Promise(r => setTimeout(r, 0));
  }
  return { base, slides: out };
}

async function HCA7PptxToImages(file, onProgress) {
  const { base, slides } = await HCA7PptxRender(file, (m, v) => onProgress?.(m, v * .9));
  const files = [];
  for (const [n, s] of slides.entries()) {
    onProgress?.(`Saving slide ${n + 1} of ${slides.length}`, .9 + .1 * n / slides.length);
    files.push(new File([await new Promise(ok => s.canvas.toBlob(ok, 'image/png'))], `${base} - slide ${String(n + 1).padStart(2, '0')}.png`, { type: 'image/png' }));
  }
  return files;
}

/* A small PDF writer: one landscape page per slide, the slide picture, and the slide's words as
   invisible text in the right places, so the reader can select, search, highlight and quiz on them. */
const HCA7HelvW = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const HCA7WinAnsi = { '€': 128, '‚': 130, '„': 132, '…': 133, '•': 149, '–': 150, '—': 151, '‘': 145, '’': 146, '“': 147, '”': 148, '™': 153, '·': 183, '°': 176, '±': 177, '×': 215, '÷': 247, 'µ': 181, '²': 178, '³': 179, '½': 189, '¼': 188, '¾': 190 };
function HCA7PdfText(str) {
  let out = '', width = 0;
  for (const ch of str.normalize('NFC')) {
    let code = ch.charCodeAt(0);
    if (HCA7WinAnsi[ch]) code = HCA7WinAnsi[ch];
    else if (code > 255) { const plain = ch.normalize('NFKD').replace(/[\u0300-\u036f]/g, ''); code = plain && plain.charCodeAt(0) < 256 ? plain.charCodeAt(0) : 63; }
    width += code >= 32 && code <= 126 ? HCA7HelvW[code - 32] : 556;
    out += code === 40 || code === 41 || code === 92 ? '\\' + String.fromCharCode(code) : code < 32 || code > 126 ? '\\' + code.toString(8).padStart(3, '0') : String.fromCharCode(code);
  }
  return { out, width };
}
async function HCA7SlidesToPdf(slides, title, onProgress) {
  const enc = new TextEncoder(), parts = [], offsets = [];
  let size = 0;
  const push = b => { const u = typeof b === 'string' ? enc.encode(b) : b; parts.push(u); size += u.length; };
  const obj = (n, body) => { offsets[n] = size; push(`${n} 0 obj\n`); body(); push('\nendobj\n'); };
  push('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n');
  const kids = slides.map((_, i) => `${4 + i * 3} 0 R`).join(' ');
  obj(1, () => push(`<< /Type /Catalog /Pages 2 0 R >>`));
  obj(2, () => push(`<< /Type /Pages /Kids [${kids}] /Count ${slides.length} >>`));
  obj(3, () => push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'));
  for (const [i, s] of slides.entries()) {
    onProgress?.(`Building PDF page ${i + 1} of ${slides.length}`, .85 + .15 * i / slides.length);
    const jpg = new Uint8Array(await (await new Promise(ok => s.canvas.toBlob(ok, 'image/jpeg', .86))).arrayBuffer());
    const pw = +s.ptW.toFixed(2), ph = +s.ptH.toFixed(2), k = pw / s.W;
    let text = 'BT 3 Tr\n';
    for (const w of s.words) {
      const { out, width } = HCA7PdfText(w.text), fs = Math.max(1, w.size * k), natural = width / 1000 * fs, target = w.width * k;
      const tz = natural > 0 ? Math.max(20, Math.min(400, target / natural * 100)) : 100;
      text += `/F1 ${fs.toFixed(2)} Tf ${tz.toFixed(1)} Tz 1 0 0 1 ${(w.x * k).toFixed(2)} ${(ph - (w.y + w.size * .8) * k).toFixed(2)} Tm (${out}) Tj\n`;
    }
    text += 'ET';
    const content = `q ${pw} 0 0 ${ph} 0 0 cm /Im${i} Do Q\n${text}`;
    const pageN = 4 + i * 3, contN = pageN + 1, imgN = pageN + 2;
    obj(pageN, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /Font << /F1 3 0 R >> /XObject << /Im${i} ${imgN} 0 R >> >> /Contents ${contN} 0 R >>`));
    const cb = enc.encode(content);
    obj(contN, () => { push(`<< /Length ${cb.length} >>\nstream\n`); push(cb); push('\nendstream'); });
    obj(imgN, () => { push(`<< /Type /XObject /Subtype /Image /Width ${s.canvas.width} /Height ${s.canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`); push(jpg); push('\nendstream'); });
  }
  const infoN = 4 + slides.length * 3, t = HCA7PdfText(title).out;
  obj(infoN, () => push(`<< /Title (${t}) /Producer (Lumen by Healthcare Crown Academy) >>`));
  const xref = size, count = infoN + 1;
  push(`xref\n0 ${count}\n0000000000 65535 f \n` + Array.from({ length: count - 1 }, (_, i) => `${String(offsets[i + 1]).padStart(10, '0')} 00000 n \n`).join(''));
  push(`trailer\n<< /Size ${count} /Root 1 0 R /Info ${infoN} 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts, { type: 'application/pdf' });
}
async function HCA7PptxToPdf(file, onProgress) {
  const { base, slides } = await HCA7PptxRender(file, (m, v) => onProgress?.(m, v * .85));
  return [new File([await HCA7SlidesToPdf(slides, base, onProgress)], `${base}.pdf`, { type: 'application/pdf' })];
}

/* Called by the Library upload (build patch): PowerPoint files are converted, everything else passes through. */
function HCA7AskImportMode(name) {
  let remembered = ''; try { remembered = localStorage.getItem('lumen.pptxMode') || ''; } catch {}
  if (remembered) return Promise.resolve(remembered);
  return new Promise(resolve => HCA7Set({ choose: { name, resolve: (mode, remember) => { if (remember) { try { localStorage.setItem('lumen.pptxMode', mode); } catch {} } HCA7Set({ choose: null }); resolve(mode); } } }));
}
const HCA7Progress = (label, value) => HCA7Set(s => ({ progress: { ...(s.progress || {}), label, value } }));
async function HCA7Expand(files) {
  const out = [];
  for (const f of files) {
    if (/\.pptx$/i.test(f.name) || f.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      const mode = await HCA7AskImportMode(f.name);
      if (mode === 'cancel') continue;
      HCA7Set({ progress: { title: `Importing ${f.name}`, label: 'Opening the presentation', value: 0 } });
      try { out.push(...await (mode === 'images' ? HCA7PptxToImages : HCA7PptxToPdf)(f, HCA7Progress)); HCA7Set({ progress: null }); }
      catch (e) { HCA7Set({ progress: { title: `Could not import ${f.name}`, label: e.message === 'Cancelled.' ? 'Import cancelled.' : `${e.message || 'Unknown error'} In PowerPoint, choose File → Save as → PDF, then upload the PDF.`, value: null, error: true } }); }
    } else if (/\.(ppt|key|odp)$/i.test(f.name)) {
      HCA7Set({ progress: { title: f.name, label: 'Older or other slide formats cannot be read. Save it as .pptx or PDF first.', value: null, error: true } });
    } else out.push(f);
  }
  return out;
}
window.HCA7Expand = HCA7Expand;

/* ---------- Mount floating tools, dialogs and commands ---------- */
function HCA7Floats() {
  const ui = HCA7Use();
  // Rendered into <body> so pop-ups sit above the reader and any open dialog.
  return S.createPortal(HC(_.Fragment, {},
    ui.tray && HC(HCA7Tray), ui.calc && HC(HCA7Calculator), ui.define && HC(HCA7Meaning, ui.define),
    ui.present && HC(HCA7Presenter, { data: ui.present }),
    ui.progress && HC('div', { className: `hca7-progress-card ${ui.progress.error ? 'error' : ''}`, role: 'status', 'aria-live': 'polite' },
      HC('div', { className: 'hca7-progress-head' }, HCAIcon(ui.progress.error ? 'error-warning-line' : 'loader-4-line'), HC('strong', {}, ui.progress.title || 'Working'),
        ui.progress.error ? HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': 'Close', onClick: () => HCA7Set({ progress: null }) }, HCAIcon('close-line'))
          : HC('button', { type: 'button', className: 'text-link', onClick: () => HCA7Set(s => ({ progress: { ...s.progress, cancelled: true, label: 'Cancelling…' } })) }, 'Cancel')),
      HC('p', {}, ui.progress.label, typeof ui.progress.value === 'number' ? ` · ${Math.round(ui.progress.value * 100)}%` : ''),
      !ui.progress.error && HC('div', { className: `hca7-progress ${typeof ui.progress.value === 'number' ? '' : 'indeterminate'}`, role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': typeof ui.progress.value === 'number' ? Math.round(ui.progress.value * 100) : undefined }, HC('span', { style: typeof ui.progress.value === 'number' ? { width: `${Math.max(2, ui.progress.value * 100)}%` } : undefined }))),
    ui.choose && HC(HCA7ImportChoice, ui.choose)), document.body);
}
function HCA7ImportChoice({ name, resolve }) {
  const [remember, setRemember] = _.useState(false);
  return HC('div', { className: 'hca7-choose-backdrop', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Import a PowerPoint' },
    HC('div', { className: 'hca7-choose' },
      HC('p', { className: 'eyebrow' }, 'POWERPOINT'), HC('h3', {}, `How should “${name}” open?`),
      HC('button', { type: 'button', className: 'hca7-choice', autoFocus: true, onClick: () => resolve('pdf', remember) }, HCAIcon('file-pdf-2-line'), HC('span', {}, HC('strong', {}, 'As a PDF (recommended)'), HC('small', {}, 'Wide landscape pages that fill the reader. The slide text can be selected, searched, highlighted and used in Page studio.'))),
      HC('button', { type: 'button', className: 'hca7-choice', onClick: () => resolve('images', remember) }, HCAIcon('gallery-line'), HC('span', {}, HC('strong', {}, 'As page images'), HC('small', {}, 'One picture per slide, like scanned pages. Use OCR later if you need the text.'))),
      HC('label', { className: 'hca4-check' }, HC('input', { type: 'checkbox', checked: remember, onChange: e => setRemember(e.target.checked) }), 'Remember my choice'),
      HC('div', { className: 'hca5-row' }, HCABtn('Cancel', () => resolve('cancel', false), 'secondary', 'close-line'))));
}
rs = function HCA7DialogRouter() {
  const ctx = y(), m = ctx.modal, close = () => ctx.setModal(null);
  const own = m?.type === 'hca7-snip' ? HC(HCA7SnipDialog, { ...m, onClose: close }) : m?.type === 'hca7-export' ? HC(HCA7ExportDialog, { ...m, onClose: close }) : null;
  return HC(_.Fragment, {}, HC(HCA7Prev.Dialogs), own, HC(HCA7Floats));
};
HCA3Commands = function HCA7Commands(ctx) {
  return [...HCA7Prev.Commands(ctx),
    { group: 'Tools', icon: 'stethoscope-line', label: 'Calculator (clinical and scientific)', run: () => HCA7Set({ calc: true }) },
    { group: 'Tools', icon: 'gallery-line', label: 'Stickers', run: () => HCA7Set({ tray: true }) },
    { group: 'Tools', icon: 'search-line', label: 'Meaning of a word or term', run: () => HCA7Set({ define: { text: '' } }) },
    { group: 'Tools', icon: 'play-fill', label: 'Present my notes', run: () => ctx.setModal({ type: 'hca7-export', bookId: HCA7Reader.bookId, present: true }) },
    { group: 'Tools', icon: 'refresh-line', label: 'Refresh Lumen (reload, work is saved)', run: HCA7Refresh },
    { group: 'Tools', icon: 'download-line', label: 'Export notes (PowerPoint, Word, PDF)', run: () => ctx.setModal({ type: 'hca7-export', bookId: HCA7Reader.bookId }) }];
};

/* ---------- Study panel: dock it beside the page, or pop it out as a floating window ----------
   Popped out, the page uses the full reader width; drag the panel by its header and resize it from the corner. */
const HCA7PrevSidecar = HCAReaderSidecar;
HCAReaderSidecar = function HCA7ReaderSidecar(props) {
  const ctx = y(), floating = !!ctx.state.settings.hcaPanelFloat && innerWidth > 760, win = HCA7Win('panel');
  const el = HCA7PrevSidecar(props);
  _.useEffect(() => { document.body.classList.toggle('hca7-panel-float', floating); return () => document.body.classList.remove('hca7-panel-float'); }, [floating]);
  const toggle = () => ctx.setState(s => ({ ...s, settings: { ...s.settings, hcaPanelFloat: !s.settings.hcaPanelFloat } }));
  const kids = _.Children.toArray(el.props.children).map(child => {
    if (child?.props?.className !== 'hca-sidecar-header') return child;
    const hk = _.Children.toArray(child.props.children);
    hk.splice(hk.length - 1, 0, HC('button', { key: 'hca7-pop', type: 'button', className: 'hca3-icon-btn hca7-pop', onClick: toggle, 'aria-label': floating ? 'Dock the study panel beside the page' : 'Pop out the study panel as a floating window', title: floating ? 'Dock beside the page' : 'Pop out: float this panel and give the page full width' }, HCAIcon(floating ? 'side-bar-line' : 'fullscreen-line')));
    return _.cloneElement(child, floating ? { ...win.header, title: 'Drag to move · double-click to reset' } : {}, ...hk);
  });
  return _.cloneElement(el, floating ? { ref: win.ref, style: win.style } : {}, ...kids);
};
