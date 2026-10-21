/*HCA13:BEGIN*/
/* HCA v13 — a reader toolbar the learner can arrange. Shares the bundle's module scope (y = workspace context hook,
   HC = createElement, _ = React, HCAIcon, HCALabelTool, HCABtn, A = dialog shell, HCAReaderContext, HCA7Use/HCA7Set = the tools'
   own state) and the helpers in reader.js (HCA12ToolsMenu, HCA12MenuHead, HCA12Type, HCA12.setPresent).

   What it does
   - Every reader tool is one entry in HCA13Meta. The learner pins the ones that stay on the bar and orders them; the rest
     live under More (or Tools, for the tools that already sit in that menu). The choice is saved in localStorage
     ('lumen.toolbar.v1', tolerant of bad JSON) and applied live.
   - The bar always fits: when the pinned buttons do not fit with their names, names turn into icons (the name stays as the
     accessible name and tooltip); when icons do not fit either, buttons from the right move under More. HCA13Measure tries
     each layout in the real DOM before paint, so nothing flashes or overflows.
   - "Customise toolbar" (More menu and the gear at the end of the bar) opens HCA13Dialog: pinned list with Up / Down / To More
     buttons (no drag-only), the rest with Add, the tool active when a source opens, pen colour and width, icons-only labels,
     the side-bar setting and Reset to suggested. */

const HCA13 = { key: 'lumen.toolbar.v1', max: 12, prefs: null, subs: new Set(), ret: null };
const HCA13Cats = [['mark', 'Mark up'], ['study', 'Study'], ['tools', 'Tools'], ['page', 'This page'], ['view', 'View'], ['files', 'Your files']];
// id, category, icon, name (as the dialog lists it), what it does, member = lives in the Tools menu
const HCA13Meta = [
  { id: 'pen', cat: 'mark', icon: 'mark-pen-line', name: 'Pen', hint: 'Draw on the page (P)' },
  { id: 'highlight', cat: 'mark', icon: 'mark-pen-line', name: 'Highlight', hint: 'Save the text you select (H)' },
  { id: 'sticky', cat: 'mark', icon: 'sticky-note-line', name: 'Sticky note', hint: 'Pin a note to a spot on the page (N)' },
  { id: 'region', cat: 'mark', icon: 'crop-line', name: 'Mark a region', hint: 'Drag a box, then write a note (M)' },
  { id: 'select', cat: 'mark', icon: 'text', name: 'Select text', hint: 'Stop drawing and go back to reading' },
  { id: 'erase', cat: 'mark', icon: 'delete-bin-line', name: 'Eraser', hint: 'Click a pen stroke to remove it' },
  { id: 'explain', cat: 'study', icon: 'brain-line', name: 'Explain', hint: 'Hide the page, explain it from memory, then reveal' },
  { id: 'quiz', cat: 'study', icon: 'sparkling-2-line', name: 'Quiz & summary', hint: 'Summaries and practice questions for this page' },
  { id: 'tools', cat: 'tools', icon: 'grid-line', name: 'Tools', hint: 'A menu with the seven tools below', menu: true },
  { id: 'snip', cat: 'tools', icon: 'scissors-cut-line', name: 'Copy a region', hint: 'Drag a box; copy, download or keep it', member: true },
  { id: 'magnify', cat: 'tools', icon: 'zoom-in-line', name: 'Magnifier', hint: 'A lens that follows your pointer', member: true },
  { id: 'stickers', cat: 'tools', icon: 'gallery-line', name: 'Clinical stickers', hint: 'Drag clinical icons and labels onto the page', member: true },
  { id: 'calc', cat: 'tools', icon: 'stethoscope-line', name: 'Calculator', hint: 'Clinical formulas and a scientific keypad', member: true },
  { id: 'define', cat: 'tools', icon: 'search-line', name: 'Define a word', hint: 'A plain definition of a word or term', member: true },
  { id: 'present', cat: 'tools', icon: 'play-fill', name: 'Present notes', hint: 'Slides from your highlights, notes and snips', member: true },
  { id: 'export', cat: 'tools', icon: 'download-line', name: 'Export', hint: 'PowerPoint, Word, Markdown, print and cards', member: true },
  { id: 'bookmark', cat: 'page', icon: 'bookmark-line', name: 'Bookmark', hint: 'Mark this page to come back to (B)' },
  { id: 'speak', cat: 'page', icon: 'volume-up-line', name: 'Read aloud', hint: 'An on-device voice reads the page' },
  { id: 'compare', cat: 'page', icon: 'layout-column-line', name: 'Compare pages', hint: 'Pin this page and read another beside it' },
  { id: 'views', cat: 'view', icon: 'book-open-line', name: 'Reading view', hint: 'Flipbook, Single page or Text' },
  { id: 'slides', cat: 'view', icon: 'play-fill', name: 'Present slides', hint: 'Full-screen slide show (slide decks only)' },
  { id: 'resize', cat: 'view', icon: 'layout-row-line', name: 'Resize reader', hint: 'Give the page or the study panel more room' },
  { id: 'appearance', cat: 'view', icon: 'font-size', name: 'Appearance', hint: 'Theme, page surround and text size' },
  { id: 'fullscreen', cat: 'view', icon: 'expand-diagonal-line', name: 'Fullscreen', hint: 'Hide everything except the page' },
  { id: 'download', cat: 'files', icon: 'download-line', name: 'Download original', hint: 'Save the file you added' },
  { id: 'backup', cat: 'files', icon: 'download-line', name: 'Back up annotations', hint: 'Save a copy of your notes and highlights' },
  { id: 'refresh', cat: 'files', icon: 'refresh-line', name: 'Refresh Lumen', hint: 'Reload if a page looks stuck; your work is saved first' }
];
const HCA13ById = Object.fromEntries(HCA13Meta.map(m => [m.id, m]));
// the suggested bar: mark up, tools, study, then the view buttons (the right-hand ones move under More first when the bar is short of room)
const HCA13Suggested = ['pen', 'highlight', 'sticky', 'region', 'tools', 'explain', 'quiz', 'slides', 'views'];
const HCA13StartTools = [
  ['select', 'Select text', 'Read and select text; nothing draws until you pick a tool'],
  ['pen', 'Pen', 'Draw as soon as the page opens. Selecting text needs Select text (or Esc)'],
  ['highlight', 'Highlight', 'Text you select is saved as a highlight'],
  ['sticky', 'Sticky note', 'Click the page to place a note'],
  ['note-area', 'Mark a region', 'Drag a box on the page, then write a note']
];
const HCA13Inks = [['#10253a', 'Navy'], ['#087d7a', 'Teal'], ['#bd764a', 'Copper'], ['#9e3e3e', 'Red']];

/* ---------- Saved choices (localStorage, tolerant of anything it finds there) ---------- */
function HCA13Clean(raw) {
  const out = { v: 1, pinned: HCA13Suggested.slice(), tool: 'select', labels: 'auto' };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  if (Array.isArray(raw.pinned)) {
    const seen = new Set(), list = raw.pinned.filter(id => typeof id === 'string' && HCA13ById[id] && !seen.has(id) && seen.add(id)).slice(0, HCA13.max);
    if (list.length || !raw.pinned.length) out.pinned = list;     // an empty list is a real choice; a list of nothing we know is not
  }
  if (HCA13StartTools.some(t => t[0] === raw.tool)) out.tool = raw.tool;
  if (raw.labels === 'icons') out.labels = 'icons';
  return out;
}
function HCA13Read() { try { return JSON.parse(localStorage.getItem(HCA13.key) || 'null'); } catch { return null; } }
function HCA13Get() { return HCA13.prefs ??= HCA13Clean(HCA13Read()); }
function HCA13Save(next) {
  HCA13.prefs = HCA13Clean(next);
  try { localStorage.setItem(HCA13.key, JSON.stringify(HCA13.prefs)); } catch { }
  HCA13.subs.forEach(f => f());
}
function HCA13Use() {
  const [, t] = _.useState(0);
  _.useEffect(() => { const f = () => t(n => n + 1); HCA13.subs.add(f); return () => HCA13.subs.delete(f); }, []);
  return HCA13Get();
}
addEventListener('storage', e => { if (e.key === HCA13.key || e.key === null) { HCA13.prefs = null; HCA13.subs.forEach(f => f()); } });
// the tool that is active when a source opens (pen and mark-a-region need a visual page; a sticky note in text view asks straight away)
function HCA13StartTool(mode) {
  const t = HCA13Get().tool;
  return mode === 'text' && (t === 'pen' || t === 'note-area' || t === 'sticky') ? 'select' : t;
}

/* ---------- What each tool does right now (rebuilt every render from the reader's own props) ---------- */
function HCA13Build(props, ctx, rd, ui) {
  const { book, page, tool, onTool, readMode } = props, text = readMode === 'text', L = HCA12.live, a = {};
  const pick = name => { rd.setHidden(false); onTool(tool === name ? 'select' : name); rd.setTab('annotations'); };
  a.pen = { label: 'Pen', icon: 'mark-pen-line', active: tool === 'pen', disabled: text, run: () => pick('pen'), title: 'Pen (P): draw directly on the page' };
  a.highlight = { label: 'Highlight', icon: 'mark-pen-line', active: tool === 'highlight', run: () => props.selection ? props.onHighlight() : pick('highlight'), title: 'Highlight (H): select text to save it' };
  a.sticky = { label: 'Sticky note', icon: 'sticky-note-line', active: tool === 'sticky', run: () => text ? ctx.setModal({ type: 'hca-sticky', bookId: book.id, page, anchor: { x: .82, y: .15 } }) : pick('sticky'), title: 'Sticky note (N): click the page to place a note' };
  a.region = { label: 'Mark a region', icon: 'crop-line', active: tool === 'note-area', disabled: text, run: () => pick('note-area'), title: 'Mark a region (M): drag a box, then write a note' };
  a.select = { label: 'Select text', menu: 'Select text / navigate', icon: 'text', active: tool === 'select', run: () => pick('select'), title: 'Select text: stop drawing and go back to reading' };
  a.erase = { label: 'Eraser', menu: 'Erase a pen stroke', icon: 'delete-bin-line', active: tool === 'erase', disabled: text, run: () => pick('erase'), title: 'Eraser: click a pen stroke to remove it' };
  a.explain = { label: rd.hidden ? 'Reveal page' : 'Explain', icon: 'brain-line', active: rd.hidden, run: () => { rd.setTab('recall'); rd.setHidden(!rd.hidden); onTool('select'); window.dispatchEvent(new Event('hca-show-study-tools')); }, title: 'Hide the source, explain from memory, then reveal and verify' };
  a.quiz = { label: 'Quiz & summary', icon: 'sparkling-2-line', active: rd.tab === 'studio', run: () => { rd.setTab('studio'); window.dispatchEvent(new Event('hca-show-study-tools')); }, title: 'Summarize, make a practice exam, or edit extracted text' };
  a.tools = { kind: 'menu' };
  a.snip = { label: 'Copy a region', icon: 'scissors-cut-line', active: tool === 'snip', disabled: text, run: () => pick('snip'), title: 'Copy a region: drag a box; copy, download or keep it' };
  a.magnify = { label: 'Magnifier', icon: 'zoom-in-line', active: tool === 'magnify', disabled: text, run: () => pick('magnify'), title: 'Magnifier: a lens that follows your pointer' };
  a.stickers = { label: 'Clinical stickers', icon: 'gallery-line', active: !!ui.tray, run: () => HCA7Set(s => ({ tray: !s.tray })), title: 'Clinical stickers: drag clinical icons and labels onto the page' };
  a.calc = { label: 'Calculator', icon: 'stethoscope-line', active: !!ui.calc, run: () => HCA7Set(s => ({ calc: !s.calc })), title: 'Calculator: clinical formulas and a scientific keypad' };
  a.define = { label: 'Define a word', icon: 'search-line', run: () => HCA7Set({ define: { text: '', page, bookId: book.id } }), title: 'Define a word: a plain definition of a word or term' };
  a.present = { label: 'Present notes', menu: 'Present', icon: 'play-fill', run: () => ctx.setModal({ type: 'hca7-export', bookId: book.id, page, present: true }), title: 'Present: slides from your highlights, notes and snips' };
  a.export = { label: 'Export', icon: 'download-line', run: () => ctx.setModal({ type: 'hca7-export', bookId: book.id, page }), title: 'Export: PowerPoint, Word, Markdown, print and cards' };
  a.bookmark = { label: 'Bookmark', menu: 'Bookmark page', icon: 'bookmark-line', active: (book.bookmarks || []).includes(page), run: props.onBookmark, title: 'Bookmark this page (B)' };
  a.speak = { label: props.speaking ? 'Stop reading' : 'Read aloud', menu: props.speaking ? 'Stop reading aloud' : 'Read aloud', icon: 'volume-up-line', active: !!props.speaking, run: props.onSpeak, title: 'Read this page aloud with an on-device voice' };
  a.compare = { label: props.comparing ? 'Leave comparison' : 'Compare pages', icon: 'layout-column-line', active: !!props.comparing, disabled: book.count < 2 || text, run: props.onCompare, title: 'Pin this page and read another beside it' };
  a.views = { kind: 'views' };
  a.slides = { label: 'Present', menu: 'Present as slides', icon: 'play-fill', run: () => HCA12.setPresent?.(true), title: 'Present these slides full screen', off: HCA12Type(book) !== 'slides' };
  a.resize = { label: 'Resize reader', icon: 'layout-row-line', run: () => ctx.setModal({ type: 'hca-resize' }), title: 'Resize reader: give the page or the study panel more room' };
  a.appearance = { label: 'Appearance', icon: 'font-size', run: () => ctx.setModal({ type: 'settings' }), title: 'Appearance: theme, page surround and text size' };
  a.fullscreen = { label: 'Fullscreen', menu: props.focused ? 'Leave fullscreen' : 'Fullscreen', icon: props.focused ? 'fullscreen-exit-line' : 'expand-diagonal-line', active: !!props.focused, run: props.onFocus, title: 'Fullscreen: hide everything except the page' };
  a.download = { label: 'Download', menu: book.kind === 'images' ? 'Download this image' : 'Download original', icon: 'download-line', disabled: book.kind === 'demo' || !L?.download, run: () => L?.download?.(), title: 'Download the file you added' };
  a.backup = { label: 'Back up', menu: 'Back up annotations', icon: 'download-line', run: ctx.backupWorkspace, title: 'Back up annotations: save a copy of your notes and highlights' };
  a.refresh = { label: 'Refresh', menu: 'Refresh Lumen', icon: 'refresh-line', run: HCA7Refresh, title: 'Refresh Lumen: reload if a page looks stuck. Your work is saved first.' };
  return a;
}

function HCA13Views({ readMode, onMode }) {
  const modes = [['flip', 'book-open-line', 'Flipbook', 'Flipbook: two pages side by side when there is room'], ['single', 'file-text-line', 'Single', 'Single page'], ['text', 'text', 'Text', 'Text view: the extracted text']];
  return HC('div', { className: 'hl-views', role: 'group', 'aria-label': 'Reading view' },
    modes.map(([id, icon, label, title]) => HC('button', { key: id, type: 'button', className: 'hca-reader-tool hl-view-btn', 'aria-pressed': readMode === id, 'aria-label': `${label} reading mode`, title, onClick: () => onMode(id) }, HCAIcon(icon), HC('span', {}, label))));
}

/* ---------- Fit: try each layout in the real DOM (before paint) and keep the best that fits ---------- */
// Names go first, from the right-most button inwards (the first m buttons keep their names); when even all icons do not fit,
// the right-most buttons move under More (n buttons stay). Returns { m, n }.
function HCA13Measure(bar, iconsOnly) {
  if (!bar || !bar.clientWidth) return null;
  const its = [...bar.querySelectorAll('.hl-it')], groups = [...bar.querySelectorAll('.hl-group')], tail = bar.querySelector('.hl-tail');
  if (!tail) return null;
  const fits = () => tail.getBoundingClientRect().right <= bar.getBoundingClientRect().right + .5;
  const names = m => { its.forEach((e, i) => { e.dataset.hlTry = i < m ? 'lab' : 'ico'; }); tail.dataset.hlTry = m >= its.length ? 'lab' : 'ico'; };
  const show = n => { its.forEach((e, i) => { e.style.display = i < n ? 'flex' : 'none'; }); groups.forEach(g => { g.style.display = [...g.children].some(c => c.style.display !== 'none') ? 'flex' : 'none'; }); };
  try {
    show(its.length);
    for (let m = iconsOnly ? 0 : its.length; m >= 0; m--) { names(m); if (fits()) return { m, n: its.length }; }
    for (let n = its.length - 1; n >= 0; n--) { show(n); if (fits()) return { m: 0, n }; }
    return { m: 0, n: 0 };
  } finally {
    its.forEach(e => { e.style.display = ''; delete e.dataset.hlTry; }); groups.forEach(g => { g.style.display = ''; }); delete tail.dataset.hlTry;
  }
}

// a menu opens beside its button: left edge to left edge when there is room, otherwise right edge to right edge
document.addEventListener('toggle', e => {
  const d = e.target; if (!(d instanceof HTMLDetailsElement) || !d.open || !d.matches('.hl-tools .hl-menu')) return;
  const r = d.getBoundingClientRect(), w = Math.min(320, innerWidth - 16);
  d.dataset.hlAlign = r.left + w <= innerWidth - 8 ? 'left' : 'right';
}, true);

function HCA13Open(ret) { HCA13.ret = ret || null; HCA13Ctx?.setModal({ type: 'hca-toolbar' }); }
let HCA13Ctx = null;

/* ---------- The toolbar ---------- */
HCAReaderToolbar = function HCA13Toolbar(props) {
  const ctx = y(), rd = _.useContext(HCAReaderContext), ui = HCA7Use(), prefs = HCA13Use(), barRef = _.useRef(null);
  HCA13Ctx = ctx;
  const a = HCA13Build(props, ctx, rd, ui), [fit, setFit] = _.useState({ m: 99, n: 99 }), [tick, setTick] = _.useState(0);
  const pinned = prefs.pinned.filter(id => a[id] && !a[id].off), n = Math.min(fit.n, pinned.length), m = Math.min(fit.m, n), onBar = new Set(pinned.slice(0, n));
  // the bar is measured again when the pinned set, a label, the text size or the available width changes
  const sig = [pinned.join(), pinned.map(id => a[id].label || '').join(), prefs.labels, ctx.state.settings.interfaceScale || '', ctx.state.settings.fontSize || ''].join('|');
  _.useLayoutEffect(() => {
    const r = HCA13Measure(barRef.current, prefs.labels === 'icons');
    if (r && (r.m !== fit.m || r.n !== fit.n)) setFit(r);
  }, [sig, tick]);
  _.useEffect(() => {
    const bar = barRef.current; if (!bar || typeof ResizeObserver === 'undefined') return undefined;
    let raf = 0; const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setTick(t => t + 1)); });
    ro.observe(bar); const tail = bar.querySelector('.hl-tail'); if (tail) ro.observe(tail);
    document.fonts?.ready?.then(() => setTick(t => t + 1));
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const barItem = id => {
    const x = a[id];
    if (x.kind === 'menu') return HC(HCA12ToolsMenu, props);
    if (x.kind === 'views') return HC(HCA13Views, props);
    if (id === 'slides') return HC('button', { type: 'button', className: 'hca-reader-tool hl-present-btn', onClick: x.run, title: x.title }, HCAIcon(x.icon), HC('span', {}, x.label));
    return HC(HCALabelTool, { icon: x.icon, label: x.label, active: x.active, disabled: x.disabled, onClick: x.run, title: x.title });
  };
  // consecutive buttons of one kind share a raised group; the Tools menu stands alone
  const groups = [];
  pinned.forEach((id, i) => {
    const key = a[id].kind === 'menu' ? 'menu:' + id : HCA13ById[id].cat, g = groups.at(-1);
    if (g && g.key === key) g.ids.push(i); else groups.push({ key, cat: HCA13ById[id].cat, ids: [i] });
  });
  const items = groups.map(g => HC('div', { key: g.key + g.ids[0], className: `hl-group hl-g-${g.cat}${g.key.startsWith('menu:') ? ' hl-solo' : ''}${g.ids.every(i => i >= n) ? ' hl-empty' : ''}`, role: 'group', 'aria-label': g.key.startsWith('menu:') ? 'Tools menu' : (HCA13Cats.find(c => c[0] === g.cat) || [])[1] },
    g.ids.map(i => HC('div', { key: pinned[i], className: `hl-it${i >= n ? ' hl-spill' : ''}`, 'data-hl-id': pinned[i], 'data-ico': i >= m ? '1' : undefined }, barItem(pinned[i])))));

  /* More: everything that is not on the bar right now, under plain headings; the Tools menu already holds its own tools */
  const toolsOnBar = onBar.has('tools');
  const inMore = HCA13Meta.filter(m => a[m.id] && !a[m.id].off && !onBar.has(m.id) && m.id !== 'tools' && !(m.member && toolsOnBar));
  const moreBtn = (id, extra = {}) => { const x = a[id]; return HC('button', { key: id, type: 'button', 'aria-pressed': id === 'select' ? undefined : x.active, disabled: x.disabled, title: x.title, onClick: x.run, ...extra }, HCAIcon(x.icon), x.menu || x.label); };
  const sections = HCA13Cats.map(([cat, title]) => {
    const list = inMore.filter(m => m.cat === cat); if (!list.length) return [];
    const btns = list.map(m => m.id === 'views'
      ? ['flip', 'single', 'text'].map(v => HC('button', { key: 'v-' + v, type: 'button', 'aria-pressed': props.readMode === v, onClick: () => props.onMode(v) }, HCAIcon({ flip: 'book-open-line', single: 'file-text-line', text: 'text' }[v]), { flip: 'Flipbook', single: 'Single page', text: 'Text view' }[v]))
      : moreBtn(m.id));
    return [HC('p', { key: 'sec-' + cat, className: 'hl-menu-sec' }, cat === 'tools' ? 'Tools' : title), ...btns.flat()];
  }).flat();
  const hidden = HCA13Meta.find(m => a[m.id] && !a[m.id].off && a[m.id].active && inMore.includes(m) && m.id !== 'views' && m.id !== 'select');
  const customise = HC('button', { key: 'customise', type: 'button', className: 'hl-cz-open', onClick: () => HCA13Open(document.querySelector('.hl-tools .hl-more > summary')) }, HCAIcon('settings-4-line'), 'Customise toolbar…');
  const appMenu = HC('button', { key: 'menu', type: 'button', className: 'hl-ovf-nav', onClick: () => HCAShell?.toggleDrawer(true) }, HCAIcon('menu-line'), 'Open the app menu');
  const menu = HC('div', { className: 'hca-reader-more-menu hl-more-menu' }, HCA12MenuHead('More'), ...sections, HC('div', { key: 'foot', className: 'hl-more-foot' }, customise, appMenu));

  return HC('div', { className: 'hca-reader-tools hl-tools', 'aria-label': 'Reader tools', ref: barRef },
    HC('div', { className: 'hl-items' }, items),
    HC('div', { className: 'hl-tail', 'data-ico': m < pinned.length ? '1' : undefined },
      HC('details', { className: `hca-reader-more hl-menu hl-more${hidden ? ' has-active' : ''}`, onClick: e => { if (e.target.closest('.hl-more-menu button:not(.hl-menu-x)')) e.currentTarget.open = false; }, onKeyDown: e => { if (e.key === 'Escape') { e.currentTarget.open = false; e.stopPropagation(); } } },
        HC('summary', { title: 'More: views, bookmark, compare, read aloud, appearance and more' }, HCAIcon('more-2-fill'), HC('span', {}, 'More'), hidden && HC('b', { className: 'hl-dot', 'aria-hidden': 'true' }), hidden && HC('span', { className: 'hl-sr' }, ` (${a[hidden.id].label} is on)`)),
        menu),
      HC('button', { type: 'button', className: 'hl-gear', 'aria-label': 'Customise toolbar', title: 'Customise toolbar', onClick: e => HCA13Open(e.currentTarget) }, HCAIcon('settings-4-line'))));
};

/* ---------- Customise toolbar ---------- */
function HCA13Dialog({ onClose }) {
  const ctx = y(), prefs = HCA13Use(), root = _.useRef(null), want = _.useRef(null), [msg, setMsg] = _.useState('');
  const full = prefs.pinned.length >= HCA13.max, pinned = prefs.pinned, name = id => HCA13ById[id].name;
  const set = patch => HCA13Save({ ...prefs, ...patch });
  const say = t => setMsg(m => m === t ? t + ' ' : t);
  // keep keyboard focus on the button just used (or its neighbour, when that button has just become unavailable)
  _.useLayoutEffect(() => {
    const w = want.current; if (!w) return; want.current = null;
    const find = act => root.current?.querySelector(`[data-hl-id="${w.id}"][data-hl-act="${act}"]:not(:disabled)`);
    (find(w.act) || (w.alt && find(w.alt)) || root.current?.querySelector('.hl-cz-reset'))?.focus();
  }, [prefs]);
  _.useEffect(() => () => { const r = HCA13.ret; HCA13.ret = null; setTimeout(() => { if (r?.isConnected) r.focus(); }, 0); }, []);
  const move = (id, d) => {
    const list = pinned.slice(), i = list.indexOf(id), j = i + d; if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]]; want.current = { id, act: d < 0 ? 'up' : 'down', alt: d < 0 ? 'down' : 'up' };
    set({ pinned: list }); say(`${name(id)} moved ${d < 0 ? 'up' : 'down'}. Now ${j + 1} of ${list.length}.`);
  };
  const unpin = id => { const left = pinned.filter(x => x !== id), i = pinned.indexOf(id); want.current = { id: left[i] || left[i - 1] || '', act: 'unpin', alt: 'up' }; set({ pinned: left }); say(`${name(id)} moved to the More menu.`); };
  const pin = id => {
    if (full) { say(`The toolbar holds up to ${HCA13.max} buttons. Move one to More first.`); return; }
    want.current = { id, act: 'up', alt: 'unpin' }; set({ pinned: [...pinned, id] }); say(`${name(id)} added to the toolbar. Now ${pinned.length + 1} of ${pinned.length + 1}.`);
  };
  const reset = () => { want.current = { id: '', act: 'x' }; HCA13Save({ ...prefs, pinned: HCA13Suggested.slice(), tool: 'select', labels: 'auto' }); say('The toolbar is back to the suggested layout.'); };
  const ink = ctx.state.settings.penColor || '#10253a', width = ctx.state.settings.penWidth || 3;
  const setSetting = (k, v) => ctx.setState(s => ({ ...s, settings: { ...s.settings, [k]: v } }));
  const rest = HCA13Meta.filter(m => !pinned.includes(m.id));
  const radio = (grp, val, cur, label, hint, onPick) => HC('label', { key: val, className: `hl-cz-opt${cur === val ? ' on' : ''}` }, HC('input', { type: 'radio', name: grp, value: val, checked: cur === val, onChange: () => onPick(val) }), HC('span', {}, HC('b', {}, label), HC('small', {}, hint)));
  return HC(A, { title: 'Customise toolbar', eyebrow: 'YOUR READING TOOLS', onClose, className: 'hl-cz', footer: HC(_.Fragment, {},
    HCABtn('Reset to suggested', reset, 'secondary', 'restart-line', { className: 'hl-cz-reset' }), HCABtn('Done', onClose, 'primary', 'check-line')) },
    HC('div', { ref: root, className: 'hl-cz-body' },
      HC('p', { className: 'hl-cz-intro' }, `Choose what stays on the bar, and in what order. Everything else lives under More. When the bar runs out of room, names turn into icons first, then buttons from the right move under More. The bar holds up to ${HCA13.max}.`),
      HC('p', { className: 'hl-sr', role: 'status', 'aria-live': 'polite' }, msg),
      HC('section', { className: 'hl-cz-sec', 'aria-labelledby': 'hl-cz-h1' },
        HC('h3', { id: 'hl-cz-h1' }, 'On the toolbar ', HC('span', { className: 'hl-cz-count' }, `${pinned.length} of ${HCA13.max}`)),
        pinned.length ? HC('ol', { className: 'hl-cz-list', role: 'list', 'aria-labelledby': 'hl-cz-h1' }, pinned.map((id, i) => {
          const m = HCA13ById[id];
          return HC('li', { key: id, className: 'hl-cz-row' },
            HC('span', { className: 'hl-cz-ico', 'aria-hidden': 'true' }, HCAIcon(m.icon)),
            HC('span', { className: 'hl-cz-name' }, HC('b', {}, m.name), HC('small', {}, m.hint)),
            HC('span', { className: 'hl-cz-btns' },
              HC('button', { type: 'button', 'data-hl-id': id, 'data-hl-act': 'up', disabled: i === 0, 'aria-label': `Move ${m.name} up`, title: 'Move up', onClick: () => move(id, -1) }, HCAIcon('arrow-up-line')),
              HC('button', { type: 'button', 'data-hl-id': id, 'data-hl-act': 'down', disabled: i === pinned.length - 1, 'aria-label': `Move ${m.name} down`, title: 'Move down', onClick: () => move(id, 1) }, HCAIcon('arrow-down-line')),
              HC('button', { type: 'button', className: 'hl-cz-txt', 'data-hl-id': id, 'data-hl-act': 'unpin', 'aria-label': `Move ${m.name} to More`, title: 'Move to the More menu', onClick: () => unpin(id) }, HCAIcon('subtract-line'), HC('span', {}, 'To More'))));
        })) : HC('p', { className: 'hl-cz-empty' }, 'Nothing is pinned. Everything is under More.')),
      HC('section', { className: 'hl-cz-sec', 'aria-labelledby': 'hl-cz-h2' },
        HC('h3', { id: 'hl-cz-h2' }, 'Under More'),
        full && HC('p', { className: 'hl-cz-note' }, `The bar holds up to ${HCA13.max} buttons. Move one to More to add another.`),
        rest.length ? HCA13Cats.map(([cat, title]) => { const list = rest.filter(m => m.cat === cat); return list.length ? HC('div', { key: cat, className: 'hl-cz-cat' },
          HC('h4', {}, title, cat === 'tools' && pinned.includes('tools') && HC('span', {}, ' · also in the Tools menu')),
          HC('ul', { className: 'hl-cz-pills', role: 'list', 'aria-label': title }, list.map(m => HC('li', { key: m.id },
            HC('button', { type: 'button', className: 'hl-cz-pill', 'data-hl-id': m.id, 'data-hl-act': 'pin', disabled: full, 'aria-label': `Add ${m.name} to the toolbar`, 'aria-describedby': undefined, title: full ? 'The toolbar is full' : `${m.hint}. Add to the toolbar`, onClick: () => pin(m.id) }, HCAIcon(m.icon), HC('span', {}, m.name), HCAIcon('add-line')))))) : null; }) : HC('p', { className: 'hl-cz-empty' }, 'Everything is on the toolbar.')),
      HC('fieldset', { className: 'hl-cz-sec hl-cz-set' }, HC('legend', {}, 'When a source opens, start with'),
        HC('div', { className: 'hl-cz-opts' }, HCA13StartTools.map(([id, label, hint]) => radio('hl-cz-tool', id, prefs.tool, label, hint, v => { set({ tool: v }); say(`${label} will be active when a source opens.`); })))),
      HC('div', { className: 'hl-cz-sec hl-cz-pen' }, HC('h3', {}, 'Pen'),
        HC('div', { className: 'hl-cz-penrow' },
          HC('div', { role: 'group', 'aria-label': 'Pen colour', className: 'hl-cz-inks' }, HCA13Inks.map(([c, label]) => HC('button', { key: c, type: 'button', style: { background: c }, 'aria-label': `${label} pen`, 'aria-pressed': ink === c, onClick: () => setSetting('penColor', c) }, ink === c ? HCAIcon('check-line') : null))),
          HC('label', { className: 'hl-cz-width' }, 'Width ', HC('select', { 'aria-label': 'Pen width', value: width, onChange: e => setSetting('penWidth', Number(e.target.value)) }, [2, 3, 5].map(v => HC('option', { key: v, value: v }, `${v}px`)))))),
      HC('fieldset', { className: 'hl-cz-sec hl-cz-set' }, HC('legend', {}, 'Button names'),
        HC('div', { className: 'hl-cz-opts' },
          radio('hl-cz-labels', 'auto', prefs.labels, 'Show names when there is room', 'Names turn into icons on a narrow screen', v => { set({ labels: v }); say('Button names show when there is room.'); }),
          radio('hl-cz-labels', 'icons', prefs.labels, 'Icons only', 'A compact bar with more room for the page; hover or long-press for a name', v => { set({ labels: v }); say('The toolbar shows icons only.'); }))),
      HC('div', { className: 'hl-cz-sec' }, HC('h3', {}, 'Side bar'), HC(HCA13RailRow, {}))));
}
// the whole row is the switch (a 44px-high target); it is the same saved choice as the one in Settings
function HCA13RailRow() {
  const on = HCA12UseRailAuto();
  return HC('button', { type: 'button', role: 'switch', 'aria-checked': on, 'aria-labelledby': 'hl-cz-rail-l', 'aria-describedby': 'hl-cz-rail-d', className: `hl-cz-swrow${on ? ' on' : ''}`, onClick: () => HCA12RailSet(!on) },
    HC('span', {}, HC('b', { id: 'hl-cz-rail-l' }, 'Collapse the side bar while reading'), HC('small', { id: 'hl-cz-rail-d' }, 'On wide screens the left menu folds to icons when a source opens. You can open it again while reading; it folds again next time.')),
    HC('i', { className: 'hl-cz-sw', 'aria-hidden': 'true' }));
}
const HCA13PrevDialogs = rs;
rs = function HCA13DialogRouter() { const ctx = y(); return HC(_.Fragment, {}, HC(HCA13PrevDialogs), ctx.modal?.type === 'hca-toolbar' && HC(HCA13Dialog, { onClose: () => ctx.setModal(null) })); };
/*HCA13:END*/
