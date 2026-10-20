/*HCA12:BEGIN*/
/* HCA v12 — the Reading room. Shares the bundle's module scope like the earlier layers
   (y = workspace context hook, HC = createElement, _ = React, E = icon, O = icon button, ys = reader,
   HCAReaderToolbar / HCAReaderSidecar = the layers wrapped below). build-web.mjs adds a few asserted hooks
   into the minified reader (HCA12Probe, HCA12PageWidth, HCA12Spread, HCA12FitOf, HCA12ThumbsInit/Save, HCA12PanelInit).

   What it does
   - Opening a source folds the navy rail (the learner's own rail choice comes back on leaving; a manual toggle while
     reading is remembered for the next time) and hides the top bar so the page owns the screen.
   - Every page-like source opens "Fit page": the whole page or slide is visible without scrolling, a spread when the
     stage is wide enough, one page otherwise. The fit choice is remembered per source type.
   - One compact toolbar (grouped tools, the rest under More), a docked page rail, a study panel that stays closed
     until asked for (side panel, overlay or bottom sheet) and a labelled Close/Exit on every expanded state. */

const HCA12 = { present: false, setPresent: null, nat: new Map(), pr: new Map(), thumbs: new Map(), live: null, subs: new Set() };
const HCA12Keys = { rail: 'lumen.rail', pre: 'lumen.rail.pre', read: 'lumen.rail.read', thumbs: 'lumen.reader.thumbs.v1' };
const HCA12Del = k => { try { localStorage.removeItem(k); } catch { } };
const HCA12Body = (name, on) => document.body.classList.toggle(name, !!on);

/* ---------- Rail: fold while reading, give the learner's own choice back afterwards ---------- */
function HCA12Rail() { try { HCAShell?.normalize(); } catch { } }
function HCA12Enter() {
  HCA12Body('hl-reading', true);
  let pre = HCA11Get(HCA12Keys.pre);                        // a leftover value means the tab closed mid-read: keep the original
  if (pre === null) { pre = HCA11Get(HCA12Keys.rail) === '1' ? '1' : '0'; HCA11Put(HCA12Keys.pre, pre); }
  HCA11Put(HCA12Keys.rail, HCA11Get(HCA12Keys.read) === '0' ? '0' : '1');
  HCA12Rail();
  try { HCAShell?.toggleDrawer(false); } catch { }           // phones: the drawer stays shut while reading
}
function HCA12Leave() {
  HCA12Body('hl-reading', false); HCA12Body('hl-focus', false); HCA12Body('hl-present', false);
  const pre = HCA11Get(HCA12Keys.pre);
  if (pre !== null) { HCA11Put(HCA12Keys.rail, pre); HCA12Del(HCA12Keys.pre); }
  HCA12Rail();
}
if (HCA11Get(HCA12Keys.pre) !== null) { HCA11Put(HCA12Keys.rail, HCA11Get(HCA12Keys.pre)); HCA12Del(HCA12Keys.pre); }   // crash recovery on load
// a manual toggle while reading wins, and is what the next reading session starts with
document.addEventListener('click', e => {
  if (!document.body.classList.contains('hl-reading') || !e.target.closest?.('.hs-rail-toggle')) return;
  setTimeout(() => HCA11Put(HCA12Keys.read, HCA11Get(HCA12Keys.rail) === '1' ? '1' : '0'), 0);
});

/* ---------- What is open right now (written by the hook the build adds inside the reader) ---------- */
function HCA12Probe(p) {
  const [, tick] = _.useState(0), ctx = y();
  HCA12.live = { ...p, ctx, tick: () => tick(n => n + 1) };
  _.useEffect(() => { HCA12.subs.forEach(f => f()); });
  const book = p.book;
  _.useEffect(() => {
    // learn the page shape (and its natural size) as soon as the source opens, so the first paint is already the right shape
    if (book.kind === 'demo') { HCA12.nat.set(book.id, 820); return; }
    let dead = false;
    (async () => {
      let w = 0, h = 0;
      try {
        if (book.kind === 'pdf' && p.doc) { const pg = await p.doc.getPage(1), v = pg.getViewport({ scale: 1 }); w = v.width * 96 / 72; h = v.height * 96 / 72; }
        else if (book.kind === 'images' && p.record?.images?.[0]) { const bm = await createImageBitmap(p.record.images[0].viewBlob || p.record.images[0].blob); w = bm.width; h = bm.height; bm.close?.(); }
      } catch { }
      if (dead || !w || !h) return;
      HCA12.nat.set(book.id, Math.round(w));
      const r = Math.round(h / w * 1000) / 1000;
      if (r > .3 && r < 3 && Math.abs(r - (book.hcaRatio || 1.414)) > .03) ctx.setState(s => ({ ...s, books: s.books.map(b => b.id === book.id ? { ...b, hcaRatio: r } : b) }));
      else tick(n => n + 1);
    })();
    return () => { dead = true; };
  }, [book.id, p.doc, p.record]);
  _.useEffect(() => {
    if (book.kind !== 'images' || !p.record?.images) return;
    let dead = false;
    [p.page, p.page + 1].forEach(n => {
      const im = p.record.images[n - 1], k = book.id + ':' + n; if (!im || HCA12.pr.has(k)) return;
      createImageBitmap(im.viewBlob || im.blob).then(bm => { if (bm.width && bm.height) HCA12.pr.set(k, Math.round(bm.height / bm.width * 1000) / 1000); bm.close?.(); if (!dead) tick(x => x + 1); }).catch(() => { HCA12.pr.set(k, 0); });
    });
    return () => { dead = true; };
  }, [book.id, p.page, p.record]);
}
function HCA12UseLive() {
  const [, t] = _.useState(0);
  _.useEffect(() => { const f = () => t(n => n + 1); HCA12.subs.add(f); return () => HCA12.subs.delete(f); }, []);
  return HCA12.live;
}

/* ---------- Fit: whole page by default, remembered per source type ---------- */
const HCA12Type = b => !b ? 'pdf' : b.kind === 'demo' ? 'sample' : (b.hcaRatio && b.hcaRatio < .9) ? 'slides' : b.kind === 'images' ? 'images' : 'pdf';
const HCA12TypeName = { pdf: 'PDFs', slides: 'slide decks', images: 'images', sample: 'the samples' };
function HCA12FitOf(settings, b) {
  if (HCA12.present) return 'page';
  const v = settings?.readerFitBy?.[HCA12Type(b)];
  return v === 'width' || v === 'actual' ? v : 'page';
}
/* an image collection can mix shapes: each page is fitted by its own shape (learned as it is reached) */
const HCA12Ratio = (b, page) => (b.kind === 'images' && HCA12.pr.get(b.id + ':' + page)) || b.hcaRatio || 1.414;
function HCA12PageWidth(width, height, spread, fit, ratio, nat) {
  ratio = ratio || 1.414;
  const cols = spread ? 2 : 1, byW = Math.max(140, (width - 24) / cols), byH = Math.max(140, (height - 20) / ratio);
  const w = fit === 'actual' ? (nat || 794) : fit === 'width' ? byW : Math.min(byW, byH);
  return Math.floor(w);
}
function HCA12Spread(mode, compact, book, stage, pinned, settings, page) {
  if (pinned !== null) return true;
  const ratio = HCA12Ratio(book, page);
  if (mode !== 'flip' || compact || HCA12.present || ratio < .9) return false;
  if (book.kind === 'images' && page < book.count && Math.abs(HCA12Ratio(book, page + 1) - ratio) > .08) return false;
  const fit = HCA12FitOf(settings, book);
  if (fit === 'actual') return stage.width >= 1700;
  const one = HCA12PageWidth(stage.width, stage.height, false, fit, ratio), two = HCA12PageWidth(stage.width, stage.height, true, fit, ratio);
  return stage.width >= 680 && two >= 300 && two >= one * .72;
}
const HCA12PageW = (stage, spread, settings, book, zoom, page) => Math.max(140, HCA12PageWidth(stage.width, stage.height, spread, HCA12FitOf(settings, book), HCA12Ratio(book, page), HCA12.nat.get(book.id))) * zoom;

/* ---------- Page rail and study panel defaults ---------- */
function HCA12ThumbsInit() { return innerWidth >= 1100 && HCA11Get(HCA12Keys.thumbs) === '1' ? 'contents' : null; }
function HCA12ThumbsSave(open) { HCA11Put(HCA12Keys.thumbs, open ? '1' : '0'); }
const HCA12PanelInit = () => false;    // the page owns the screen; the study panel opens when asked for

/* ---------- The reader wrapper: enter/leave, focus and present modes, Esc ---------- */
const HCA12PrevReader = ys;
ys = function HCA12Reader(props) {
  const ctx = y(), focus = !!ctx.readerFocus, [present, setPresent] = _.useState(false), fsMode = _.useRef('');
  HCA12.present = present; HCA12.setPresent = setPresent;
  _.useEffect(() => { HCA12Enter(); return HCA12Leave; }, []);
  _.useEffect(() => { HCA12Body('hl-focus', focus); }, [focus]);
  _.useEffect(() => {
    HCA12Body('hl-present', present);
    if (present) { HCA12.live?.setZoom?.(1); HCA12.live?.setTool?.('select'); HCA12.live?.setDrawer?.(null); if (document.documentElement.requestFullscreen) { fsMode.current = 'present'; document.documentElement.requestFullscreen().catch(() => { fsMode.current = ''; }); } }
    return () => { if (fsMode.current === 'present' && document.fullscreenElement) document.exitFullscreen?.().catch(() => { }); if (fsMode.current === 'present') fsMode.current = ''; };
  }, [present]);
  _.useEffect(() => {
    if (focus && document.fullscreenElement) fsMode.current = 'focus';
    const fs = () => {
      if (!document.fullscreenElement) { if (fsMode.current === 'present') setPresent(false); else if (fsMode.current === 'focus') ctx.setReaderFocus(false); fsMode.current = ''; }
      else if (focus && !fsMode.current) fsMode.current = 'focus';
    };
    document.addEventListener('fullscreenchange', fs);
    return () => document.removeEventListener('fullscreenchange', fs);
  }, [focus]);
  _.useEffect(() => {
    const key = e => {
      if (e.key === 'Escape') {
        if (HCA12.present) { e.stopImmediatePropagation(); e.preventDefault(); setPresent(false); return; }
        if (document.querySelector('[role="dialog"]')) return;
        const menu = document.querySelector('.hca-reader-more[open]'); if (menu) { menu.open = false; menu.querySelector('summary')?.focus(); e.stopImmediatePropagation(); return; }
        const panel = document.querySelector('.hl-sidecar[data-hl-overlay="1"]'); if (panel) { panel.querySelector('.hl-close')?.click(); e.stopImmediatePropagation(); return; }
        const drawer = document.querySelector('.reader-drawer'); if (drawer && !e.target.closest?.('input,textarea,select')) { drawer.querySelector('.drawer-header .icon-button')?.click(); e.stopImmediatePropagation(); return; }
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input,textarea,select,[contenteditable="true"]') || document.querySelector('[role="dialog"]')) return;
      const L = HCA12.live; if (!L) return;
      if (e.key === 'Home') { e.preventDefault(); L.setPage(1); }
      else if (e.key === 'End') { e.preventDefault(); L.setPage(L.book.count); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); L.setZoom(z => Math.min(4, +(z * 1.2).toFixed(3))); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); L.setZoom(z => Math.max(.5, +(z / 1.2).toFixed(3))); }
      else if (e.key === '0') { e.preventDefault(); L.setZoom(1); }
    };
    document.addEventListener('keydown', key, true);
    const outside = e => { document.querySelectorAll('.hca-reader-more[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; }); };
    document.addEventListener('pointerdown', outside, true);
    return () => { document.removeEventListener('keydown', key, true); document.removeEventListener('pointerdown', outside, true); };
  }, []);
  // zoom and pan: Ctrl+wheel and pinch zoom, drag (images, or hold Space) to pan, double-click an image to zoom
  _.useEffect(() => {
    let pan = null, space = false, pinch = null;
    const stageOf = e => e.target.closest?.('.reader-stage');
    const canPan = st => st && (st.scrollWidth > st.clientWidth + 2 || st.scrollHeight > st.clientHeight + 2);
    const clamp = z => Math.min(4, Math.max(.5, +z.toFixed(3)));
    const typing = e => e.target.closest?.('input,textarea,select,[contenteditable="true"]');
    const skip = e => e.target.closest?.('button,a,input,textarea,select,.hca-sticky-pin,.hca-note-region,.hca7-sticker,.hl-present-hud');
    const down = e => {
      const st = stageOf(e), L = HCA12.live; if (!st || !L || HCA12.present || e.pointerType === 'touch' || !canPan(st)) return;
      const ok = e.button === 1 || (e.button === 0 && !skip(e) && L.tool === 'select' && (space || L.book.kind === 'images'));
      if (!ok) return;
      pan = { x: e.clientX, y: e.clientY, l: st.scrollLeft, t: st.scrollTop, st };
      st.classList.add('is-panning'); e.preventDefault(); try { st.setPointerCapture(e.pointerId); } catch { }
    };
    const move = e => {
      if (pan) { pan.st.scrollLeft = pan.l - (e.clientX - pan.x); pan.st.scrollTop = pan.t - (e.clientY - pan.y); return; }
      const st = stageOf(e); if (!st) return;
      const L = HCA12.live, can = !!L && !HCA12.present && canPan(st) && L.tool === 'select' && (space || L.book.kind === 'images') && !skip(e);
      if (st.classList.contains('is-pannable') !== can) st.classList.toggle('is-pannable', can);
    };
    const up = () => { if (!pan) return; pan.st.classList.remove('is-panning'); pan = null; };
    const wheel = e => { const L = HCA12.live; if (!e.ctrlKey || !stageOf(e) || !L) return; e.preventDefault(); L.setZoom(z => clamp(z * (e.deltaY < 0 ? 1.1 : 1 / 1.1))); };
    const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const ts = e => { if (e.touches.length === 2 && stageOf(e) && HCA12.live) pinch = { d: dist(e.touches), z: HCA12.live.zoom }; };
    const tm = e => { if (!pinch || e.touches.length !== 2) return; e.preventDefault(); HCA12.live.setZoom(clamp(pinch.z * dist(e.touches) / pinch.d)); };
    const te = e => { if (e.touches.length < 2) pinch = null; };
    const dbl = e => { const L = HCA12.live; if (!L || !stageOf(e) || skip(e) || L.book.kind !== 'images' || L.tool !== 'select') return; L.setZoom(z => z > 1.05 ? 1 : 2.5); };
    const kd = e => { if (e.code !== 'Space' || typing(e)) return; if (!document.querySelector('.reader-stage:hover')) return; space = true; document.body.classList.add('hl-space'); e.preventDefault(); };
    const ku = e => { if (e.code === 'Space') { space = false; document.body.classList.remove('hl-space'); } };
    document.addEventListener('pointerdown', down, true); document.addEventListener('pointermove', move, true); document.addEventListener('pointerup', up, true); document.addEventListener('pointercancel', up, true);
    document.addEventListener('wheel', wheel, { passive: false, capture: true });
    document.addEventListener('touchstart', ts, { passive: true, capture: true }); document.addEventListener('touchmove', tm, { passive: false, capture: true }); document.addEventListener('touchend', te, true);
    document.addEventListener('dblclick', dbl, true); document.addEventListener('keydown', kd, true); document.addEventListener('keyup', ku, true);
    return () => {
      document.removeEventListener('pointerdown', down, true); document.removeEventListener('pointermove', move, true); document.removeEventListener('pointerup', up, true); document.removeEventListener('pointercancel', up, true);
      document.removeEventListener('wheel', wheel, true); document.removeEventListener('touchstart', ts, true); document.removeEventListener('touchmove', tm, true); document.removeEventListener('touchend', te, true);
      document.removeEventListener('dblclick', dbl, true); document.removeEventListener('keydown', kd, true); document.removeEventListener('keyup', ku, true);
      document.body.classList.remove('hl-space');
    };
  }, []);
  return HC(_.Fragment, {},
    HC(HCA12PrevReader, props),
    present && HC(HCA12PresentHud, { onExit: () => setPresent(false) }));
};

/* ---------- Thumbnails (also used by the page rail) ---------- */
function HCA12Thumb({ book, page, doc, record, active, onClick, big }) {
  const key = `${book.id}:${page}`, [src, setSrc] = _.useState(() => HCA12.thumbs.get(key) || ''), ref = _.useRef(null);
  _.useEffect(() => {
    if (src || book.kind === 'demo') return;
    let dead = false, url = '';
    const io = new IntersectionObserver(es => {
      if (!es.some(x => x.isIntersecting)) return; io.disconnect();
      if (book.kind === 'pdf' && doc) Bo(doc, page, big ? 220 : 130).then(u => { HCA12.thumbs.set(key, u); if (!dead) setSrc(u); }).catch(() => { });
      else if (book.kind === 'images' && record?.images?.[page - 1]) { url = URL.createObjectURL(record.images[page - 1].viewBlob || record.images[page - 1].blob); if (!dead) setSrc(url); }
    }, { rootMargin: '200px' });
    if (ref.current) io.observe(ref.current);
    return () => { dead = true; io.disconnect(); if (url) setTimeout(() => URL.revokeObjectURL(url), 2000); };
  }, [book.id, page, doc, record]);
  const dp = book.kind === 'demo' ? oe[book.id]?.[page - 1] : null;
  return HC('button', { ref, type: 'button', className: `hl-thumb ${active ? 'on' : ''}`, onClick, 'aria-label': `Go to page ${page}`, 'aria-current': active ? 'page' : undefined, style: { aspectRatio: String(1 / (book.hcaRatio || 1.414)) } },
    src ? HC('img', { src, alt: '', loading: 'lazy', decoding: 'async' })
      : dp ? (dp.cover && dp.image ? HC('img', { src: dp.image, alt: '' }) : HC('span', { className: 'hl-thumb-t' }, dp.title))
        : HC('span', { className: 'hl-thumb-t' }, HCAIcon('file-text-line')),
    HC('span', { className: 'hl-thumb-n' }, page));
}

/* the page rail: replace the library's icon tiles for image sources with real previews */
function HCA12RailThumb(props) {
  const L = HCA12.live;
  if (!props.book || props.book.kind === 'pdf') return HC(HCA12RailOrig, props);
  return HC(HCA12Thumb, { book: props.book, page: props.page, doc: props.doc, record: L?.record, active: props.active, onClick: props.onClick, big: true });
}

/* ---------- Presentation mode: fit-page slides, thumbnails strip, a visible exit ---------- */
function HCA12PresentHud({ onExit }) {
  const L = HCA12UseLive(), strip = _.useRef(null);
  const page = L?.page, count = L?.book?.count || 1;
  _.useEffect(() => { strip.current?.querySelector('.hl-thumb.on')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' }); }, [page]);
  _.useEffect(() => { requestAnimationFrame(() => document.querySelector('.hl-present-hud .hl-exit')?.focus()); }, []);
  if (!L) return null;
  const next = () => L.setPage(Math.min(count, page + 1)), prev = () => L.setPage(Math.max(1, page - 1));
  return HC('div', { className: 'hl-present-hud', role: 'region', 'aria-label': 'Presentation controls' },
    HC('div', { className: 'hl-ph-top' },
      HC('span', { className: 'hl-ph-title' }, L.book.title, HC('b', {}, ` · ${page} / ${count}`)),
      HC('button', { type: 'button', className: 'hl-exit', onClick: onExit }, HCAIcon('close-line'), HC('span', {}, 'Exit presentation'))),
    HC('button', { type: 'button', className: 'hl-ph-nav prev', onClick: prev, disabled: page <= 1, 'aria-label': 'Previous slide' }, HCAIcon('arrow-left-s-line')),
    HC('button', { type: 'button', className: 'hl-ph-nav next', onClick: next, disabled: page >= count, 'aria-label': 'Next slide' }, HCAIcon('arrow-right-s-line')),
    HC('div', { className: 'hl-strip', ref: strip, role: 'list', 'aria-label': 'Slides' },
      Array.from({ length: count }, (_x, i) => HC('div', { role: 'listitem', key: i + 1 }, HC(HCA12Thumb, { book: L.book, page: i + 1, doc: L.doc, record: L.record, active: page === i + 1, onClick: () => L.setPage(i + 1) })))));
}
/* ---------- Toolbar: grouped tools, the rest under More ---------- */
function HCA12UseMQ(q) {
  const [m, set] = _.useState(() => matchMedia(q).matches);
  _.useEffect(() => { const mq = matchMedia(q), f = () => set(mq.matches); mq.addEventListener('change', f); f(); return () => mq.removeEventListener('change', f); }, [q]);
  return m;
}
const HCA12CloseMenu = e => { const d = e.currentTarget.closest('details'); if (d) { d.open = false; d.querySelector('summary')?.focus(); } };
const HCA12MenuHead = title => HC('div', { className: 'hl-menu-head', key: 'head' }, HC('strong', {}, title), HC('button', { type: 'button', className: 'hl-menu-x', onClick: HCA12CloseMenu }, HCAIcon('close-line'), HC('span', {}, 'Close')));

function HCA12ToolsMenu(props) {
  const el = HCA7ToolsMenu(props), [summary, menu] = _.Children.toArray(el.props.children);
  return _.cloneElement(el, { className: `${el.props.className} hl-menu` }, summary, _.cloneElement(menu, {}, HCA12MenuHead('Tools'), ..._.Children.toArray(menu.props.children)));
}
const HCA12PrevToolbar = HCAReaderToolbar;
HCAReaderToolbar = function HCA12Toolbar(props) {
  const el = HCA12PrevToolbar(props), kids = _.Children.toArray(el.props.children), L = HCA12.live;
  const tools = kids.filter(k => k.type === HCALabelTool && k.props.label !== 'Refresh'), [pen, hi, sticky, mark, recall, studio] = tools;
  const more = kids.find(k => k.type === 'details' && !String(k.props.className).includes('hca7-tools'));
  const origItems = _.Children.toArray(more.props.children[1].props.children);
  const item = (t, label, icon, cls = '') => HC('button', { key: label, type: 'button', className: cls, onClick: t.props.onClick, disabled: t.props.disabled, 'aria-pressed': t.props.active }, HCAIcon(icon), t.props.label === 'Reveal page' ? 'Reveal page' : label);
  const slides = HCA12Type(props.book) === 'slides', views = [['flip', 'book-open-line', 'Flipbook'], ['single', 'file-text-line', 'Single page'], ['text', 'text', 'Text view']];
  /* More: grouped under plain headings; the three study/markup buttons repeat here only where the toolbar is too narrow for them. */
  const mapItem = it => { const ic = it.props.children?.[0]; return ic?.props?.name === 'expand-horizontal-line' ? _.cloneElement(it, {}, HCAIcon('layout-column-line'), ...it.props.children.slice(1)) : it; };
  const rest = origItems.slice(1).map(mapItem), used = new Set(), seen = new Set();
  const lab = it => String(_.Children.toArray(it.props.children).find(k => typeof k === 'string') || '');
  const group = (title, re, extra = []) => {
    const items = [...rest.filter(it => !used.has(it) && re.test(lab(it))), ...extra.filter(Boolean)].filter(it => { const l = lab(it) || it.key; if (seen.has(l)) return false; seen.add(l); return true; });
    rest.forEach(it => { if (items.includes(it)) used.add(it); });
    return items.length ? [HC('p', { key: 'sec-' + title, className: 'hl-menu-sec' }, title), ...items] : [];
  };
  const dl = L?.download && HC('button', { key: 'dl', type: 'button', disabled: props.book.kind === 'demo', onClick: L.download }, HCAIcon('download-line'), props.book.kind === 'images' ? 'Download this image' : 'Download original');
  const present = slides && HC('button', { key: 'present', type: 'button', onClick: () => HCA12.setPresent?.(true) }, HCAIcon('play-fill'), 'Present as slides');
  const refresh = HC('button', { key: 'refresh', type: 'button', onClick: HCA7Refresh }, HCAIcon('refresh-line'), 'Refresh Lumen');
  const appMenu = HC('button', { key: 'menu', type: 'button', className: 'hl-ovf-xs', onClick: () => HCAShell?.toggleDrawer(true) }, HCAIcon('menu-line'), 'Open the app menu');
  const viewItems = group('View', /Resize|Appearance|Fullscreen|focus|Compar|comparison/i);
  const pageItems = group('This page', /Bookmark|Read aloud|Stop reading|Select text|Erase/i, [present]);
  const fileItems = group('Your files', /Back up|Download|Export/i, [dl, refresh]);
  const leftover = group('More', /./);
  const menu = HC('div', { className: 'hca-reader-more-menu hl-more-menu' },
    HCA12MenuHead('More'),
    HC('p', { key: 'sec-ovf', className: 'hl-menu-sec hl-ovf' }, 'Mark up and study'),
    item(mark, 'Mark a region', 'crop-line', 'hl-ovf'), item(recall, recall.props.label, 'brain-line', 'hl-ovf'), item(studio, 'Quiz & summary', 'sparkling-2-line', 'hl-ovf'),
    ...views.map(([id, icon, label]) => HC('button', { key: id, type: 'button', className: 'hl-ovf-xs', 'aria-pressed': props.readMode === id, onClick: () => props.onMode(id) }, HCAIcon(icon), label)),
    ...viewItems, ...pageItems, ...fileItems, ...leftover, appMenu);
  return HC('div', { className: 'hca-reader-tools hl-tools', 'aria-label': 'Page annotation tools' },
    HC('div', { className: 'hl-group', role: 'group', 'aria-label': 'Mark up the page' }, pen, hi, sticky, HC('span', { className: 'hl-wide' }, mark)),
    HC('div', { className: 'hl-group hl-g-study', role: 'group', 'aria-label': 'Study this page' }, recall, studio),
    slides && HC('button', { type: 'button', className: 'hca-reader-tool hl-present-btn', onClick: () => HCA12.setPresent?.(true), title: 'Present these slides full screen' }, HCAIcon('play-fill'), HC('span', {}, 'Present')),
    HC(HCA12ToolsMenu, props),
    HC('details', { className: 'hca-reader-more hl-menu hl-more', onClick: e => { if (e.target.closest('.hl-more-menu button:not(.hl-menu-x)')) e.currentTarget.open = false; }, onKeyDown: e => { if (e.key === 'Escape') { e.currentTarget.open = false; e.stopPropagation(); } } },
      HC('summary', { title: 'More: views, bookmark, compare, read aloud, appearance and more' }, HCAIcon('more-2-fill'), HC('span', {}, 'More')), menu));
};

/* ---------- Bottom bar: fit menu and zoom ---------- */
function HCA12ViewControls({ book, zoom, setZoom, width }) {
  const ctx = y(), fit = HCA12FitOf(ctx.state.settings, book), type = HCA12Type(book), nat = HCA12.nat.get(book.id);
  const set = f => { ctx.setState(s => ({ ...s, settings: { ...s.settings, readerFitBy: { ...(s.settings.readerFitBy || {}), [type]: f } } })); setZoom(1); };
  const pct = nat ? Math.round(width / nat * 100) : Math.round(zoom * 100), label = zoom === 1 ? ({ page: 'Fit page', width: 'Fit width', actual: 'Actual size' })[fit] : `${pct}%`;
  const opt = (id, icon, name, hint) => HC('button', { key: id, type: 'button', role: 'menuitemradio', 'aria-checked': fit === id && zoom === 1, className: fit === id && zoom === 1 ? 'on' : '', onClick: e => { set(id); HCA12CloseMenu(e); } }, HCAIcon(icon), HC('span', {}, HC('strong', {}, name), HC('small', {}, hint)), fit === id && zoom === 1 && HCAIcon('check-line'));
  return HC('div', { className: 'hl-view', role: 'group', 'aria-label': 'Zoom and fit' },
    HC(O, { icon: 'subtract-line', label: 'Zoom out', disabled: zoom <= .5, onClick: () => setZoom(z => Math.max(.5, +(z / 1.2).toFixed(3))) }),
    HC('details', { className: 'hca-reader-more hl-menu hl-fit', onKeyDown: e => { if (e.key === 'Escape') { e.currentTarget.open = false; e.stopPropagation(); } } },
      HC('summary', { title: 'Fit page, fit width or actual size', 'aria-label': `Page size: ${label}. Change` }, HCAIcon(fit === 'width' ? 'layout-row-line' : fit === 'actual' ? 'zoom-in-line' : 'fullscreen-line'), HC('span', { className: 'hl-fit-l' }, label), HC('span', { className: 'hl-fit-p' }, `${pct}%`)),
      HC('div', { className: 'hca-reader-more-menu hl-fit-menu', role: 'menu' },
        HCA12MenuHead('Page size'),
        opt('page', 'fullscreen-line', 'Fit page', 'The whole page, no scrolling'),
        opt('width', 'layout-row-line', 'Fit width', 'Fill the width, scroll down the page'),
        opt('actual', 'zoom-in-line', 'Actual size', 'One screen pixel per page pixel'),
        HC('p', { className: 'hl-fit-note' }, `Remembered for ${HCA12TypeName[type]}. Use + and − to zoom, 0 to reset.`))),
    HC(O, { icon: 'add-line', label: 'Zoom in', disabled: zoom >= 4, onClick: () => setZoom(z => Math.min(4, +(z * 1.2).toFixed(3))) }));
}

/* ---------- Study panel: labelled Close, readable tabs, overlay on narrow screens ---------- */
const HCA12TabIcons = { annotations: 'mark-pen-line', recall: 'brain-line', studio: 'sparkling-2-line', companion: 'search-line' };
const HCA12PrevSidecar = HCAReaderSidecar;
HCAReaderSidecar = function HCA12Sidecar(props) {
  const ctx = y(), el = HCA12PrevSidecar(props), overlay = HCA12UseMQ('(max-width:1179px)'), floating = !!ctx.state.settings.hcaPanelFloat && innerWidth > 760;
  const kids = _.Children.toArray(el.props.children).map(child => {
    const cls = child?.props?.className;
    if (cls === 'hca-sidecar-header') {
      const hk = _.Children.toArray(child.props.children).map(k => {
        if (String(k.props?.className || '').includes('hca7-pop')) return _.cloneElement(k, { className: 'hca3-icon-btn hca7-pop hl-pop' }, HCAIcon(floating ? 'side-bar-line' : 'expand-diagonal-line'), HC('span', {}, floating ? 'Dock' : 'Pop out'));
        if (k.type === O) return HC('button', { key: 'hl-close', type: 'button', className: 'hl-close', onClick: props.onClose, 'aria-label': 'Close study panel' }, HCAIcon('close-line'), HC('span', {}, 'Close'));
        return k;
      });
      return _.cloneElement(child, { className: 'hca-sidecar-header hl-sh' }, ...hk);
    }
    if (cls === 'hca-sidecar-tabs') {
      return _.cloneElement(child, { className: 'hl-tabs' }, ..._.Children.toArray(child.props.children).map(b => {
        const id = String(b.props.id || '').replace('hca-tab-', '');
        return _.cloneElement(b, { className: 'hl-tab' }, HCAIcon(HCA12TabIcons[id] || 'file-text-line'), HC('span', {}, b.props.children));
      }));
    }
    return child;
  });
  const aside = _.cloneElement(el, { className: `${el.props.className} hl-sidecar`, 'data-hl-overlay': overlay && !floating ? '1' : undefined, 'data-hl-float': floating ? '1' : undefined }, ...kids);
  return HC(_.Fragment, {}, overlay && !floating && HC('button', { type: 'button', className: 'hl-scrim', tabIndex: -1, 'aria-label': 'Close study panel', onClick: props.onClose }), aside);
};
/*HCA12:END*/
