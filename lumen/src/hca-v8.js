/* HCA v8 — Study desk, injected after v7 (see lumen/tools/build.mjs).
   A "Study desk" group in the sidebar opens four tools as floating windows (drag, resize, maximise):
   - Board: a Kanban board for study tasks, linked to source pages
   - Canvas: a whiteboard for concept maps and flows, with nursing templates
   - Focus timer: Pomodoro-style sessions with a log and weekly totals
   - Planner: exam countdown, today at a glance, a weekly study timetable, calendar export
   All offline, no AI. New optional workspace keys: hcaBoard, hcaCanvases, hcaFocusLog, hcaTimer, hcaPlanner. */

/* ---------- Window shell (drag, resize, maximise, remembered place) ---------- */
function HCA8Window({ id, title, icon, onClose, children, className = '', actions = null }) {
  const win = HCA7Win(id), [max, setMax] = _.useState(false);
  return HC('section', { ref: win.ref, className: `hca7-float hca8-win ${className} ${max ? 'max' : ''}`, style: max ? undefined : win.style, 'aria-label': title, role: 'dialog' },
    HC('header', { ...(max ? {} : win.header), title: max ? undefined : 'Drag to move · double-click to reset' },
      !max && HCAIcon('draggable'), HCAIcon(icon), HC('strong', {}, title), HC('span', { className: 'grow' }), actions,
      typeof HCA9Guide !== 'undefined' && HCA9Guide.some(g => g.id === id) && HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': `How to use ${title}`, title: 'How to use this', onClick: () => HCA9OpenGuide(id) }, HCAIcon('question-line')),
      HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': max ? 'Restore window size' : 'Maximise window', onClick: () => setMax(!max) }, HCAIcon(max ? 'fullscreen-exit-line' : 'fullscreen-line')),
      HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': `Close ${title}`, onClick: onClose }, HCAIcon('close-line'))),
    HC('div', { className: 'hca8-body' }, children));
}
const HCA8Open = name => HCA7Set(s => ({ desk: { ...(s.desk || {}), [name]: !(s.desk || {})[name] } }));
const HCA8Close = name => HCA7Set(s => ({ desk: { ...(s.desk || {}), [name]: false } }));
const HCA8Today = () => new Date().toLocaleDateString('en-CA');
const HCA8Days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HCA8Colors = ['#087d7a', '#1f6feb', '#7a4fd1', '#d03b8c', '#9e3e3e', '#e0711b', '#bd764a', '#2f8f46', '#10253a'];
const HCA8Fmt = sec => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

/* ---------- Sidebar: Study desk ---------- */
function HCA8SideDesk() {
  const ui = HCA7Use(), t = HCA8UseTimer(), desk = ui.desk || {};
  const item = (key, icon, label, hint, extra) => HC('button', { type: 'button', title: hint, 'aria-pressed': !!desk[key], className: desk[key] ? 'hca8-on' : '', onClick: () => key === 'calc' ? HCA7Set(s => ({ calc: !s.calc })) : HCA8Open(key) },
    HCAIcon(icon), HC('span', {}, label), extra);
  return HC(_.Fragment, {},
    HC('div', { className: 'sidebar-divider' }),
    HC('div', { className: 'sidebar-label' }, 'STUDY DESK'),
    HC('nav', { className: 'secondary-navigation hca8-desk-nav', 'aria-label': 'Study desk' },
      item('board', 'layout-column-line', 'Board', 'Kanban board for your study tasks'),
      item('canvas', 'edit-line', 'Canvas', 'Whiteboard for concept maps and flows'),
      item('timer', 'timer-line', 'Focus timer', 'Pomodoro focus sessions and breaks', t.running ? HC('b', { className: 'hca8-badge' }, HCA8Fmt(t.left)) : null),
      item('planner', 'time-line', 'Planner', 'Exam countdown and weekly timetable'),
      item('blurt', 'brain-line', 'Blurt pad', 'Write from memory, then check what you missed'),
      item('labs', 'heart-pulse-line', 'Lab values', 'Reference ranges with a quiz mode'),
      item('techniques', 'lightbulb-line', 'Techniques', 'Proven study techniques, told as a story'),
      item('calc', 'stethoscope-line', 'Calculator', 'Clinical and scientific calculator'),
      HC('button', { type: 'button', className: `hca9-guide-link ${desk.guide ? 'hca8-on' : ''}`, title: 'What each tool is, how and when to use it', onClick: () => desk.guide ? HCA8Close('guide') : HCA9OpenGuide('overview') }, HCAIcon('question-line'), HC('span', {}, 'How to use the desk'))));
}

/* ---------- Focus timer (keeps running when its window is closed) ---------- */
const HCA8T = { state: { phase: 'focus', running: false, endsAt: 0, left: 25 * 60, round: 1, label: '' }, subs: new Set(), events: [] };
const HCA8TimerCfg = s => ({ focus: 25, short: 5, long: 15, every: 4, sound: true, notify: false, ...(s.hcaTimer || {}) });
function HCA8TSet(patch) { HCA8T.state = { ...HCA8T.state, ...patch }; HCA8T.subs.forEach(f => f()); }
function HCA8UseTimer() {
  const [, force] = _.useState(0);
  _.useEffect(() => { const f = () => force(n => n + 1); HCA8T.subs.add(f); return () => HCA8T.subs.delete(f); }, []);
  return HCA8T.state;
}
setInterval(() => {
  const s = HCA8T.state; if (!s.running) return;
  const left = Math.max(0, Math.round((s.endsAt - Date.now()) / 1000));
  if (left > 0) { HCA8TSet({ left }); return; }
  HCA8T.events.push({ phase: s.phase, label: s.label, round: s.round });
  HCA8TSet({ running: false, left: 0 });
  HCA8T.subs.forEach(f => f());
}, 1000);
function HCA8Beep() {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)();
    [0, .35, .7].forEach(t => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.0001, a.currentTime + t); g.gain.exponentialRampToValueAtTime(.25, a.currentTime + t + .02); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + t + .3); o.connect(g).connect(a.destination); o.start(a.currentTime + t); o.stop(a.currentTime + t + .32); });
    setTimeout(() => a.close(), 1500);
  } catch {}
}
/* Always mounted: records finished sessions, plays the chime and starts the next phase. */
function HCA8TimerHost() {
  const ctx = y(), t = HCA8UseTimer(), cfg = HCA8TimerCfg(ctx.state);
  _.useEffect(() => {
    if (!HCA8T.events.length) return;
    const done = HCA8T.events.splice(0);
    for (const e of done) {
      if (e.phase === 'focus' && !e.skipped) ctx.setState(s => ({ ...s, hcaFocusLog: [...(s.hcaFocusLog || []).slice(-999), { id: ue(), day: HCA8Today(), at: Date.now(), minutes: cfg.focus, label: e.label || '' }] }));
      if (cfg.sound) HCA8Beep();
      const next = e.phase === 'focus' ? (e.round % cfg.every === 0 ? 'long' : 'short') : 'focus';
      const msg = e.phase === 'focus' ? `Focus session done. Time for a ${next === 'long' ? 'long' : 'short'} break.` : 'Break over. Ready for the next focus session?';
      ctx.toast(msg);
      if (cfg.notify && 'Notification' in window && Notification.permission === 'granted') { try { new Notification('Lumen focus timer', { body: msg }); } catch {} }
      HCA8TSet({ phase: next, left: cfg[next] * 60, round: e.phase === 'focus' ? e.round : e.round + 1 });
    }
  }, [t.running, t.left]);
  _.useEffect(() => {
    const base = document.title.replace(/^⏱ \S+ · /, '');
    document.title = t.running ? `⏱ ${HCA8Fmt(t.left)} · ${base}` : base;
  }, [t.running, t.left]);
  return null;
}

function HCA8Timer() {
  const ctx = y(), t = HCA8UseTimer(), cfg = HCA8TimerCfg(ctx.state), log = ctx.state.hcaFocusLog || [];
  const total = cfg[t.phase] * 60, pct = total ? 1 - t.left / total : 0;
  const setCfg = patch => ctx.setState(s => ({ ...s, hcaTimer: { ...HCA8TimerCfg(s), ...patch } }));
  const start = () => HCA8TSet({ running: true, endsAt: Date.now() + (t.left || cfg[t.phase] * 60) * 1000 });
  const pause = () => HCA8TSet({ running: false, left: Math.max(0, Math.round((t.endsAt - Date.now()) / 1000)) });
  const reset = phase => HCA8TSet({ running: false, phase: phase || t.phase, left: cfg[phase || t.phase] * 60 });
  _.useEffect(() => { if (!t.running && t.left === HCA8T.state.left && !t.endsAt) reset(); }, []);
  const today = log.filter(l => l.day === HCA8Today()), weekStart = new Date(); weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); weekStart.setHours(0, 0, 0, 0);
  const week = log.filter(l => l.at >= weekStart.getTime());
  const byDay = HCA8Days.map((d, i) => { const day = new Date(weekStart); day.setDate(day.getDate() + i); const k = day.toLocaleDateString('en-CA'); return [d, log.filter(l => l.day === k).reduce((a, l) => a + l.minutes, 0)]; });
  const peak = Math.max(60, ...byDay.map(d => d[1]));
  const R = 70, C = 2 * Math.PI * R;
  return HC(HCA8Window, { id: 'timer', title: 'Focus timer', icon: 'timer-line', onClose: () => HCA8Close('timer'), className: 'hca8-timer' },
    HC('div', { className: 'hca7-tabs', role: 'tablist', 'aria-label': 'Timer phase' }, [['focus', 'Focus'], ['short', 'Short break'], ['long', 'Long break']].map(([p, l]) => HC('button', { key: p, role: 'tab', 'aria-selected': t.phase === p, onClick: () => reset(p) }, l))),
    HC('div', { className: `hca8-dial ${t.phase}` },
      HC('svg', { viewBox: '0 0 160 160', 'aria-hidden': 'true' }, HC('circle', { cx: 80, cy: 80, r: R, className: 'track' }), HC('circle', { cx: 80, cy: 80, r: R, className: 'bar', style: { strokeDasharray: C, strokeDashoffset: C * (1 - pct) } })),
      HC('div', { className: 'hca8-time', role: 'timer', 'aria-live': 'off' }, HC('strong', {}, HCA8Fmt(t.left || cfg[t.phase] * 60)), HC('span', {}, t.phase === 'focus' ? `Round ${t.round} of ${cfg.every}` : 'Break'))),
    HC('input', { className: 'hca8-label', value: t.label, onChange: e => HCA8TSet({ label: e.target.value }), onKeyDown: e => e.stopPropagation(), placeholder: 'What are you focusing on? (optional)', maxLength: 80, 'aria-label': 'Focus label' }),
    HC('div', { className: 'hca8-row center' },
      t.running ? HCABtn('Pause', pause, 'secondary', 'pause-fill') : HCABtn(t.left && t.left < cfg[t.phase] * 60 ? 'Resume' : 'Start', start, 'primary', 'play-fill'),
      HCABtn('Reset', () => reset(), 'secondary', 'restart-line'),
      HCABtn('Skip', () => { HCA8T.events.push({ phase: t.phase, label: t.label, round: t.round, skipped: true }); HCA8TSet({ running: false, left: 0 }); }, 'secondary', 'arrow-right-line')),
    HC('div', { className: 'hca8-stats' },
      HC('div', {}, HC('strong', {}, `${today.reduce((a, l) => a + l.minutes, 0)} min`), HC('span', {}, `today · ${today.length} session${today.length === 1 ? '' : 's'}`)),
      HC('div', {}, HC('strong', {}, `${(week.reduce((a, l) => a + l.minutes, 0) / 60).toFixed(1)} h`), HC('span', {}, 'this week'))),
    HC('div', { className: 'hca8-bars', role: 'img', 'aria-label': `Focus minutes this week: ${byDay.map(([d, m]) => `${d} ${m}`).join(', ')}` },
      byDay.map(([d, m]) => HC('div', { key: d }, HC('span', { style: { height: `${Math.round(m / peak * 100)}%` }, title: `${m} min` }), HC('small', {}, d)))),
    HC(HCA9SoundRow),
    HC('details', { className: 'hca8-settings' }, HC('summary', {}, 'Timer settings'),
      HC('div', { className: 'hca8-grid4' }, [['focus', 'Focus', 5, 120], ['short', 'Short break', 1, 30], ['long', 'Long break', 5, 60], ['every', 'Long break every', 2, 8]].map(([k, l, min, max]) => HC('label', { key: k }, l, HC('input', { type: 'number', min, max, value: cfg[k], onKeyDown: e => e.stopPropagation(), onChange: e => setCfg({ [k]: HCABound(Math.round(Number(e.target.value) || min), min, max) }) }), HC('small', {}, k === 'every' ? 'rounds' : 'min')))),
      HC('div', { className: 'hca8-row' }, [25, 50, 90].map(m => HC('button', { key: m, type: 'button', className: 'hca4-tag', onClick: () => { setCfg({ focus: m, short: m >= 50 ? 10 : 5, long: m >= 50 ? 20 : 15 }); if (!t.running) HCA8TSet({ phase: 'focus', left: m * 60 }); } }, `${m} / ${m >= 50 ? 10 : 5}`))),
      HC('label', { className: 'hca4-check' }, HC('input', { type: 'checkbox', checked: cfg.sound, onChange: e => setCfg({ sound: e.target.checked }) }), 'Chime when a session ends'),
      HC('label', { className: 'hca4-check' }, HC('input', { type: 'checkbox', checked: cfg.notify, onChange: async e => { const on = e.target.checked; if (on && 'Notification' in window && Notification.permission !== 'granted') await Notification.requestPermission().catch(() => {}); setCfg({ notify: on }); } }), 'Desktop notification (needs your permission)')));
}

/* ---------- Board (Kanban) ---------- */
const HCA8BoardOf = s => s.hcaBoard?.columns ? s.hcaBoard : { columns: [{ id: 'todo', title: 'To learn' }, { id: 'doing', title: 'Learning' }, { id: 'review', title: 'Review' }, { id: 'done', title: 'Mastered' }], cards: [] };
function HCA8Board() {
  const ctx = y(), board = HCA8BoardOf(ctx.state), [open, setOpen] = _.useState(null), [drag, setDrag] = _.useState(null), [over, setOver] = _.useState(null), [filter, setFilter] = _.useState('');
  const save = fn => ctx.setState(s => ({ ...s, hcaBoard: fn(HCA8BoardOf(s)) }));
  const add = (col, title) => { if (!title.trim()) return; save(b => ({ ...b, cards: [...b.cards, { id: ue(), col, title: title.trim().slice(0, 200), note: '', due: '', cat: '', color: '', createdAt: Date.now() }] })); };
  const setCard = (id, patch) => save(b => ({ ...b, cards: b.cards.map(c => c.id === id ? { ...c, ...patch, ...(patch.col === 'done' ? { doneAt: Date.now() } : {}) } : c) }));
  const moveTo = (id, col, beforeId) => save(b => { const card = b.cards.find(c => c.id === id); if (!card) return b; const rest = b.cards.filter(c => c.id !== id), moved = { ...card, col, ...(col === 'done' && card.col !== 'done' ? { doneAt: Date.now() } : {}) }; const at = beforeId ? rest.findIndex(c => c.id === beforeId) : -1; if (at < 0) rest.push(moved); else rest.splice(at, 0, moved); return { ...b, cards: rest }; });
  const colIdx = id => board.columns.findIndex(c => c.id === id);
  const step = (card, d) => { const i = colIdx(card.col) + d; if (board.columns[i]) moveTo(card.id, board.columns[i].id); };
  const reader = HCA7Reader.bookId && ctx.state.books.find(b => b.id === HCA7Reader.bookId);
  const today = HCA8Today(), q = filter.toLowerCase();
  const visible = c => !q || `${c.title} ${c.note}`.toLowerCase().includes(q);
  const addColumn = () => { if (board.columns.length >= 6) return ctx.toast('A board can have up to 6 columns.', 'warning'); save(b => ({ ...b, columns: [...b.columns, { id: ue(), title: 'New column' }] })); };
  return HC(HCA8Window, { id: 'board', title: 'Board', icon: 'layout-column-line', onClose: () => HCA8Close('board'), className: 'hca8-board-win',
    actions: HC('input', { className: 'hca8-search', value: filter, onChange: e => setFilter(e.target.value), onKeyDown: e => e.stopPropagation(), placeholder: 'Filter cards', 'aria-label': 'Filter cards' }) },
    HC('div', { className: 'hca8-board' },
      board.columns.map((col, ci) => {
        const cards = board.cards.filter(c => c.col === col.id);
        return HC('section', { key: col.id, className: `hca8-col ${over === col.id ? 'over' : ''}`, 'aria-label': `${col.title}: ${cards.length} cards`,
          onDragOver: e => { if (drag) { e.preventDefault(); setOver(col.id); } }, onDragLeave: () => setOver(null),
          onDrop: e => { e.preventDefault(); const before = e.target.closest?.('[data-card]')?.dataset.card; if (drag && before !== drag) moveTo(drag, col.id, before); setDrag(null); setOver(null); } },
          HC('header', {},
            HC('input', { className: 'hca8-col-title', value: col.title, 'aria-label': 'Column name', onKeyDown: e => e.stopPropagation(), onChange: e => save(b => ({ ...b, columns: b.columns.map(c => c.id === col.id ? { ...c, title: e.target.value.slice(0, 40) } : c) })) }),
            HC('span', { className: 'hca8-count' }, cards.length),
            !cards.length && board.columns.length > 1 && HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': `Delete column ${col.title}`, onClick: () => save(b => ({ ...b, columns: b.columns.filter(c => c.id !== col.id) })) }, HCAIcon('delete-bin-line'))),
          HC('div', { className: 'hca8-cards' }, cards.filter(visible).map(card => {
            const overdue = card.due && card.due < today && col.id !== 'done', book = card.link && ctx.state.books.find(b => b.id === card.link.bookId);
            return HC('article', { key: card.id, 'data-card': card.id, className: `hca8-card ${drag === card.id ? 'dragging' : ''}`, style: card.color ? { borderLeftColor: card.color } : undefined, draggable: open !== card.id, onDragStart: e => { setDrag(card.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', card.title); }, onDragEnd: () => { setDrag(null); setOver(null); } },
              open === card.id
                ? HC('div', { className: 'hca8-card-edit' },
                    HC('input', { value: card.title, 'aria-label': 'Card title', autoFocus: true, onKeyDown: e => e.stopPropagation(), onChange: e => setCard(card.id, { title: e.target.value.slice(0, 200) }) }),
                    HC('textarea', { rows: 3, value: card.note, placeholder: 'Notes, steps, links…', 'aria-label': 'Card notes', onKeyDown: e => e.stopPropagation(), onChange: e => setCard(card.id, { note: e.target.value.slice(0, 2000) }) }),
                    HC('div', { className: 'hca8-row' },
                      HC('label', {}, 'Due', HC('input', { type: 'date', value: card.due, onChange: e => setCard(card.id, { due: e.target.value }) })),
                      HC('label', {}, 'NCLEX area', HC('select', { value: card.cat, onChange: e => setCard(card.id, { cat: e.target.value }) }, HC('option', { value: '' }, '—'), HCA4Categories.map(([k, l]) => HC('option', { key: k, value: k }, l))))),
                    HC('div', { className: 'hca8-swatch-row' }, ['', ...HCA8Colors].map(c => HC('button', { key: c || 'none', type: 'button', 'aria-label': c ? `Colour ${c}` : 'No colour', 'aria-pressed': card.color === c, style: { background: c || 'transparent' }, onClick: () => setCard(card.id, { color: c }) }))),
                    HC('div', { className: 'hca8-row' },
                      reader && HCABtn(card.link ? 'Relink to this page' : 'Link to the page I am reading', () => setCard(card.id, { link: { bookId: reader.id, page: HCA7Reader.page || reader.page || 1 } }), 'secondary', 'links-line'),
                      HCABtn('Delete', () => { save(b => ({ ...b, cards: b.cards.filter(c => c.id !== card.id) })); setOpen(null); }, 'secondary', 'delete-bin-line'),
                      HCABtn('Done', () => setOpen(null), 'primary', 'check-line')))
                : HC(_.Fragment, {},
                    HC('button', { type: 'button', className: 'hca8-card-main', onClick: () => setOpen(card.id) }, HC('strong', {}, card.title), card.note && HC('span', {}, card.note.slice(0, 90))),
                    HC('div', { className: 'hca8-chips' },
                      card.due && HC('span', { className: `chip ${overdue ? 'late' : card.due === today ? 'today' : ''}` }, overdue ? `Overdue · ${card.due}` : card.due === today ? 'Due today' : `Due ${card.due}`),
                      card.cat && HC('span', { className: 'chip' }, card.cat.toUpperCase()),
                      book && HC('button', { type: 'button', className: 'chip link', onClick: () => ctx.openBook(book.id, card.link.page), title: `Open ${book.title}, page ${card.link.page}` }, HCAIcon('book-open-line'), ` p. ${card.link.page}`),
                      HC('span', { className: 'grow' }),
                      HC('button', { type: 'button', className: 'hca3-icon-btn', disabled: ci === 0, 'aria-label': 'Move left', onClick: () => step(card, -1) }, HCAIcon('arrow-left-s-line')),
                      HC('button', { type: 'button', className: 'hca3-icon-btn', disabled: ci === board.columns.length - 1, 'aria-label': 'Move right', onClick: () => step(card, 1) }, HCAIcon('arrow-right-s-line')))));
          })),
          HC('form', { className: 'hca8-add', onSubmit: e => { e.preventDefault(); const i = e.currentTarget.elements[0]; add(col.id, i.value); i.value = ''; } },
            HC('input', { placeholder: '+ Add a card', 'aria-label': `Add a card to ${col.title}`, onKeyDown: e => e.stopPropagation(), maxLength: 200 })));
      }),
      board.columns.length < 6 && HC('button', { type: 'button', className: 'hca8-add-col', onClick: addColumn }, HCAIcon('add-line'), 'Add column')));
}

/* ---------- Canvas (whiteboard, concept maps) ---------- */
const HCA8Fills = ['#fff6d6', '#dff3ef', '#e6eefb', '#efe7fb', '#fde4ee', '#fde9df', '#e8f5e2', '#ffffff'];
const HCA8Node = (x, y, text, color = '#fff6d6', w = 180, h = 70) => ({ id: ue(), x, y, w, h, text, color });
const HCA8Templates = [
  ['blank', 'Blank canvas', () => ({ nodes: [], edges: [] })],
  ['concept', 'Concept map (condition)', () => {
    const c = HCA8Node(400, 260, 'Condition', '#dff3ef', 200, 80);
    const around = ['Pathophysiology', 'Risk factors', 'Signs and symptoms', 'Diagnostics and labs', 'Nursing interventions', 'Patient education', 'Complications', 'Medications'];
    const nodes = around.map((t, i) => { const a = i / around.length * Math.PI * 2 - Math.PI / 2; return HCA8Node(400 + Math.cos(a) * 330, 260 + Math.sin(a) * 210, t, HCA8Fills[(i % 6) + 2] || '#fff6d6'); });
    return { nodes: [c, ...nodes], edges: nodes.map(n => ({ id: ue(), from: c.id, to: n.id })) };
  }],
  ['patho', 'Pathophysiology flow', () => {
    const steps = ['Cause or trigger', 'What happens in the body', 'Signs and symptoms', 'Complications', 'Nursing priorities'];
    const nodes = steps.map((t, i) => HCA8Node(60 + i * 230, 200 + (i % 2) * 40, t, HCA8Fills[i]));
    return { nodes, edges: nodes.slice(1).map((n, i) => ({ id: ue(), from: nodes[i].id, to: n.id })) };
  }],
  ['sbar', 'SBAR handover', () => {
    const rows = [['S · Situation', 'What is happening now?'], ['B · Background', 'Relevant history, diagnosis, treatment'], ['A · Assessment', 'Vital signs, findings, your concern'], ['R · Recommendation', 'What you need and by when']];
    const nodes = rows.flatMap(([h, q], i) => [HCA8Node(80, 60 + i * 120, h, '#dff3ef', 200, 90), HCA8Node(320, 60 + i * 120, q, '#ffffff', 420, 90)]);
    return { nodes, edges: [] };
  }],
  ['compare', 'Compare two conditions', () => {
    const rows = ['Cause', 'Key signs', 'Labs and tests', 'Treatment', 'Nursing focus'];
    const nodes = [HCA8Node(260, 30, 'Condition A', '#e6eefb', 220, 60), HCA8Node(500, 30, 'Condition B', '#fde4ee', 220, 60), ...rows.flatMap((r, i) => [HCA8Node(40, 110 + i * 100, r, '#fff6d6', 200, 80), HCA8Node(260, 110 + i * 100, '', '#ffffff', 220, 80), HCA8Node(500, 110 + i * 100, '', '#ffffff', 220, 80)])];
    return { nodes, edges: [] };
  }],
  ['drug', 'Medication card', () => {
    const c = HCA8Node(380, 250, 'Medication name', '#efe7fb', 220, 80);
    const around = ['Class', 'How it works', 'Uses', 'Side effects', 'Nursing checks before giving', 'Patient teaching'];
    const nodes = around.map((t, i) => { const a = i / around.length * Math.PI * 2 - Math.PI / 2; return HCA8Node(380 + Math.cos(a) * 320, 250 + Math.sin(a) * 200, t, '#ffffff'); });
    return { nodes: [c, ...nodes], edges: nodes.map(n => ({ id: ue(), from: c.id, to: n.id })) };
  }],
];
function HCA8NewCanvas(kind, title) { const t = HCA8Templates.find(x => x[0] === kind) || HCA8Templates[0]; return { id: ue(), title: title || t[1], ...t[2](), ink: [], view: { x: 40, y: 40, z: .8 }, updatedAt: Date.now() }; }
function HCA8Clip(a, b) {
  // Point where the line from a's centre towards b's centre leaves a's box.
  const ax = a.x + a.w / 2, ay = a.y + a.h / 2, dx = b.x + b.w / 2 - ax, dy = b.y + b.h / 2 - ay;
  if (!dx && !dy) return [ax, ay];
  const t = Math.min(Math.abs((a.w / 2 + 6) / (dx || 1e-9)), Math.abs((a.h / 2 + 6) / (dy || 1e-9)));
  return [ax + dx * t, ay + dy * t];
}

function HCA8Canvas() {
  const ctx = y(), list = ctx.state.hcaCanvases || [];
  const [activeId, setActive] = _.useState(() => list[0]?.id || null), [doc, setDoc] = _.useState(null);
  const [tool, setTool] = _.useState('select'), [sel, setSel] = _.useState(null), [edit, setEdit] = _.useState(null), [from, setFrom] = _.useState(null), [draft, setDraft] = _.useState(null);
  const [penColor, setPenColor] = _.useState('#10253a'), stage = _.useRef(null), act = _.useRef(null), timer = _.useRef(null);
  _.useEffect(() => { const c = list.find(x => x.id === activeId) || list[0]; if (c) { setDoc(c); setActive(c.id); } else setDoc(null); setSel(null); setEdit(null); setFrom(null); }, [activeId, list.length]);
  const persist = next => { clearTimeout(timer.current); timer.current = setTimeout(() => ctx.setState(s => ({ ...s, hcaCanvases: (s.hcaCanvases || []).map(c => c.id === next.id ? { ...next, updatedAt: Date.now() } : c) })), 400); };
  const update = (fn, save = true) => setDoc(d => { const next = fn(d); if (save) persist(next); return next; });
  const create = kind => { if (list.length >= 30) return ctx.toast('You have 30 canvases. Delete one to make another.', 'warning'); const c = HCA8NewCanvas(kind); ctx.setState(s => ({ ...s, hcaCanvases: [...(s.hcaCanvases || []), c] })); setActive(c.id); setDoc(c); };
  const remove = () => doc && ctx.setModal({ type: 'confirm', title: `Delete “${doc.title}”?`, text: 'This canvas and everything on it is removed.', onConfirm: () => { ctx.setState(s => ({ ...s, hcaCanvases: (s.hcaCanvases || []).filter(c => c.id !== doc.id) })); setActive(null); } });
  const v = doc?.view || { x: 0, y: 0, z: 1 };
  const world = e => { const r = stage.current.getBoundingClientRect(); return { x: (e.clientX - r.left - v.x) / v.z, y: (e.clientY - r.top - v.y) / v.z }; };
  const bgDown = e => {
    if (!doc || e.target.closest('.hca8-node')) return;
    const p = world(e); e.currentTarget.setPointerCapture?.(e.pointerId);
    if (tool === 'note') { if (doc.nodes.length >= 300) return ctx.toast('A canvas holds up to 300 notes.', 'warning'); const n = HCA8Node(p.x - 90, p.y - 35, '', HCA8Fills[0]); update(d => ({ ...d, nodes: [...d.nodes, n] })); setSel({ kind: 'node', id: n.id }); setEdit(n.id); setTool('select'); return; }
    if (tool === 'pen') { act.current = { kind: 'ink', points: [[p.x, p.y]] }; setDraft([[p.x, p.y]]); return; }
    setSel(null); setEdit(null); setFrom(null);
    act.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, vx: v.x, vy: v.y };
  };
  const nodeDown = (e, n) => {
    e.stopPropagation();
    if (tool === 'erase') { update(d => ({ ...d, nodes: d.nodes.filter(x => x.id !== n.id), edges: d.edges.filter(x => x.from !== n.id && x.to !== n.id) })); return; }
    if (tool === 'connect') { if (!from) setFrom(n.id); else if (from !== n.id) { update(d => ({ ...d, edges: [...d.edges, { id: ue(), from, to: n.id }] })); setFrom(null); } return; }
    if (edit === n.id) return;
    setSel({ kind: 'node', id: n.id });
    e.currentTarget.setPointerCapture?.(e.pointerId);
    act.current = { kind: e.target.classList.contains('hca8-resize') ? 'size' : 'move', id: n.id, sx: e.clientX, sy: e.clientY, n0: { ...n } };
  };
  const move = e => {
    const a = act.current; if (!a) return;
    if (a.kind === 'pan') update(d => ({ ...d, view: { ...d.view, x: a.vx + e.clientX - a.sx, y: a.vy + e.clientY - a.sy } }), false);
    else if (a.kind === 'ink') { const p = world(e); a.points.push([Math.round(p.x), Math.round(p.y)]); setDraft([...a.points]); }
    else { const dx = (e.clientX - a.sx) / v.z, dy = (e.clientY - a.sy) / v.z; update(d => ({ ...d, nodes: d.nodes.map(n => n.id !== a.id ? n : a.kind === 'move' ? { ...n, x: Math.round(a.n0.x + dx), y: Math.round(a.n0.y + dy) } : { ...n, w: Math.max(80, Math.round(a.n0.w + dx)), h: Math.max(40, Math.round(a.n0.h + dy)) }) }), false); }
  };
  const up = () => {
    const a = act.current; act.current = null; if (!a) return;
    if (a.kind === 'ink') { setDraft(null); if (a.points.length > 1) update(d => ({ ...d, ink: [...(d.ink || []).slice(-399), { id: ue(), points: a.points, color: penColor, width: 3 }] })); return; }
    update(d => d);
  };
  const wheel = e => { if (!doc) return; e.preventDefault(); const r = stage.current.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, z = HCABound(v.z * (e.deltaY < 0 ? 1.12 : 1 / 1.12), .2, 3); update(d => ({ ...d, view: { z, x: mx - (mx - v.x) * z / v.z, y: my - (my - v.y) * z / v.z } })); };
  const zoomBy = f => { const r = stage.current.getBoundingClientRect(), mx = r.width / 2, my = r.height / 2, z = HCABound(v.z * f, .2, 3); update(d => ({ ...d, view: { z, x: mx - (mx - v.x) * z / v.z, y: my - (my - v.y) * z / v.z } })); };
  const bounds = () => { const xs = [], ys = []; doc.nodes.forEach(n => { xs.push(n.x, n.x + n.w); ys.push(n.y, n.y + n.h); }); (doc.ink || []).forEach(s => s.points.forEach(([x, y2]) => { xs.push(x); ys.push(y2); })); return xs.length ? { x0: Math.min(...xs) - 30, y0: Math.min(...ys) - 30, x1: Math.max(...xs) + 30, y1: Math.max(...ys) + 30 } : null; };
  const fit = () => { const b = bounds(); if (!b) return; const r = stage.current.getBoundingClientRect(), z = HCABound(Math.min(r.width / (b.x1 - b.x0), r.height / (b.y1 - b.y0)), .2, 2); update(d => ({ ...d, view: { z, x: -b.x0 * z + (r.width - (b.x1 - b.x0) * z) / 2, y: -b.y0 * z + (r.height - (b.y1 - b.y0) * z) / 2 } })); };
  const delSel = () => { if (!sel) return; update(d => sel.kind === 'node' ? { ...d, nodes: d.nodes.filter(x => x.id !== sel.id), edges: d.edges.filter(x => x.from !== sel.id && x.to !== sel.id) } : sel.kind === 'edge' ? { ...d, edges: d.edges.filter(x => x.id !== sel.id) } : { ...d, ink: d.ink.filter(x => x.id !== sel.id) }); setSel(null); };
  const exportPng = async () => {
    const b = bounds(); if (!b) return ctx.toast('The canvas is empty.', 'warning');
    const k = 2, c = document.createElement('canvas'); c.width = Math.min(8000, (b.x1 - b.x0) * k); c.height = Math.min(8000, (b.y1 - b.y0) * k);
    const g = c.getContext('2d'); g.scale(k, k); g.translate(-b.x0, -b.y0); g.fillStyle = '#fbfaf6'; g.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
    g.strokeStyle = '#5b6b7a'; g.fillStyle = '#5b6b7a'; g.lineWidth = 2;
    for (const ed of doc.edges) { const a = doc.nodes.find(n => n.id === ed.from), z2 = doc.nodes.find(n => n.id === ed.to); if (!a || !z2) continue; const [x1, y1] = HCA8Clip(a, z2), [x2, y2] = HCA8Clip(z2, a); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); const ang = Math.atan2(y2 - y1, x2 - x1); g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - 10 * Math.cos(ang - .4), y2 - 10 * Math.sin(ang - .4)); g.lineTo(x2 - 10 * Math.cos(ang + .4), y2 - 10 * Math.sin(ang + .4)); g.fill(); }
    for (const s of doc.ink || []) { g.strokeStyle = s.color; g.lineWidth = s.width; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); s.points.forEach(([x, y2], i) => i ? g.lineTo(x, y2) : g.moveTo(x, y2)); g.stroke(); }
    for (const n of doc.nodes) {
      g.fillStyle = n.color; g.strokeStyle = '#c9c3b5'; g.lineWidth = 1; g.beginPath(); g.roundRect?.(n.x, n.y, n.w, n.h, 8) ?? g.rect(n.x, n.y, n.w, n.h); g.fill(); g.stroke();
      g.fillStyle = '#10253a'; g.font = '15px system-ui, sans-serif'; g.textBaseline = 'top';
      const words = (n.text || '').split(/\s+/); let line = '', yy = n.y + 10;
      for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > n.w - 20 && line) { g.fillText(line, n.x + 10, yy); yy += 19; line = w; } else line = t; }
      g.fillText(line, n.x + 10, yy);
    }
    c.toBlob(blob => HCA7Download(blob, `${HCA7Slug(doc.title)}.png`), 'image/png');
  };
  _.useEffect(() => {
    const key = e => { if (edit || !sel || e.target.closest?.('input,textarea')) return; if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); delSel(); } };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [sel, edit]);
  const toolBtn = (id, icon, label) => HC('button', { key: id, type: 'button', className: `hca8-tool ${tool === id ? 'on' : ''}`, 'aria-pressed': tool === id, title: label, onClick: () => { setTool(id); setFrom(null); } }, HCAIcon(icon), HC('span', {}, label));
  const selNode = sel?.kind === 'node' && doc?.nodes.find(n => n.id === sel.id);
  return HC(HCA8Window, { id: 'canvas', title: 'Canvas', icon: 'edit-line', onClose: () => HCA8Close('canvas'), className: 'hca8-canvas-win' },
    HC('div', { className: 'hca8-canvas-bar' },
      HC('select', { value: doc?.id || '', 'aria-label': 'Choose a canvas', onChange: e => setActive(e.target.value) }, !list.length && HC('option', { value: '' }, 'No canvas yet'), list.map(c => HC('option', { key: c.id, value: c.id }, c.title))),
      doc && HC('input', { className: 'hca8-canvas-name', value: doc.title, 'aria-label': 'Canvas name', onKeyDown: e => e.stopPropagation(), onChange: e => update(d => ({ ...d, title: e.target.value.slice(0, 60) })) }),
      HC('select', { value: '', 'aria-label': 'New canvas from a template', onChange: e => { if (e.target.value) create(e.target.value); } }, HC('option', { value: '' }, '+ New canvas…'), HCA8Templates.map(([k, l]) => HC('option', { key: k, value: k }, l))),
      doc && HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': 'Delete this canvas', onClick: remove }, HCAIcon('delete-bin-line'))),
    !doc ? HC('div', { className: 'hca8-empty' }, HC('h3', {}, 'Think on a canvas.'), HC('p', {}, 'Map a condition, trace a pathophysiology flow, prepare an SBAR handover or compare two conditions.'),
        HC('div', { className: 'hca8-row center' }, HCA8Templates.slice(1).map(([k, l]) => HCABtn(l, () => create(k), 'secondary', 'add-line')), HCABtn('Blank canvas', () => create('blank'), 'primary', 'add-line')))
      : HC(_.Fragment, {},
        HC('div', { className: 'hca8-tools', role: 'toolbar', 'aria-label': 'Canvas tools' },
          toolBtn('select', 'focus-2-line', 'Move'), toolBtn('note', 'sticky-note-line', 'Note'), toolBtn('connect', 'links-line', 'Connect'), toolBtn('pen', 'edit-line', 'Draw'), toolBtn('erase', 'delete-bin-line', 'Erase'),
          tool === 'pen' && HC('span', { className: 'hca8-swatch-row' }, ['#10253a', '#9e3e3e', '#087d7a', '#1f6feb', '#e0711b'].map(c => HC('button', { key: c, type: 'button', style: { background: c }, 'aria-label': `Pen colour ${c}`, 'aria-pressed': penColor === c, onClick: () => setPenColor(c) }))),
          selNode && HC('span', { className: 'hca8-swatch-row' }, HCA8Fills.map(c => HC('button', { key: c, type: 'button', style: { background: c }, 'aria-label': `Note colour ${c}`, 'aria-pressed': selNode.color === c, onClick: () => update(d => ({ ...d, nodes: d.nodes.map(n => n.id === selNode.id ? { ...n, color: c } : n) })) }))),
          sel && HC('button', { type: 'button', className: 'hca8-tool', onClick: delSel }, HCAIcon('close-line'), HC('span', {}, 'Delete')),
          HC('span', { className: 'grow' }),
          HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': 'Zoom out', onClick: () => zoomBy(1 / 1.2) }, HCAIcon('zoom-out-line')),
          HC('span', { className: 'hca8-zoom' }, `${Math.round(v.z * 100)}%`),
          HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': 'Zoom in', onClick: () => zoomBy(1.2) }, HCAIcon('zoom-in-line')),
          HC('button', { type: 'button', className: 'hca8-tool', onClick: fit }, HCAIcon('focus-3-line'), HC('span', {}, 'Fit')),
          HC('button', { type: 'button', className: 'hca8-tool', onClick: exportPng }, HCAIcon('download-line'), HC('span', {}, 'PNG'))),
        HC('div', { ref: stage, className: `hca8-stage tool-${tool}`, onPointerDown: bgDown, onPointerMove: move, onPointerUp: up, onPointerCancel: up, onWheel: wheel, 'aria-label': 'Canvas. Double-click a note to edit it.' },
          HC('div', { className: 'hca8-world', style: { transform: `translate(${v.x}px, ${v.y}px) scale(${v.z})` } },
            HC('svg', { className: 'hca8-links', width: 1, height: 1 },
              HC('defs', {}, HC('marker', { id: 'hca8-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto-start-reverse' }, HC('path', { d: 'M0 0L10 5L0 10z', fill: '#5b6b7a' }))),
              doc.edges.map(ed => { const a = doc.nodes.find(n => n.id === ed.from), b = doc.nodes.find(n => n.id === ed.to); if (!a || !b) return null; const [x1, y1] = HCA8Clip(a, b), [x2, y2] = HCA8Clip(b, a);
                return HC('g', { key: ed.id, className: sel?.id === ed.id ? 'on' : '', onPointerDown: e => { e.stopPropagation(); if (tool === 'erase') update(d => ({ ...d, edges: d.edges.filter(x => x.id !== ed.id) })); else setSel({ kind: 'edge', id: ed.id }); } },
                  HC('line', { x1, y1, x2, y2, className: 'hit' }), HC('line', { x1, y1, x2, y2, markerEnd: 'url(#hca8-arrow)' })); }),
              (doc.ink || []).map(s => HC('polyline', { key: s.id, points: s.points.map(p => p.join(',')).join(' '), stroke: s.color, strokeWidth: s.width, className: sel?.id === s.id ? 'ink on' : 'ink', onPointerDown: e => { e.stopPropagation(); if (tool === 'erase') update(d => ({ ...d, ink: d.ink.filter(x => x.id !== s.id) })); else if (tool === 'select') setSel({ kind: 'ink', id: s.id }); } })),
              draft && HC('polyline', { points: draft.map(p => p.join(',')).join(' '), stroke: penColor, strokeWidth: 3, className: 'ink' })),
            doc.nodes.map(n => HC('div', { key: n.id, className: `hca8-node ${sel?.id === n.id ? 'on' : ''} ${from === n.id ? 'from' : ''}`, style: { left: n.x, top: n.y, width: n.w, minHeight: n.h, background: n.color }, onPointerDown: e => nodeDown(e, n), onDoubleClick: () => { setEdit(n.id); setSel({ kind: 'node', id: n.id }); } },
              edit === n.id
                ? HC('textarea', { autoFocus: true, defaultValue: n.text, 'aria-label': 'Note text', onKeyDown: e => { e.stopPropagation(); if (e.key === 'Escape') e.currentTarget.blur(); }, onBlur: e => { const t = e.target.value.slice(0, 600); update(d => ({ ...d, nodes: d.nodes.map(x => x.id === n.id ? { ...x, text: t } : x) })); setEdit(null); } })
                : HC('div', { className: 'hca8-node-text' }, n.text || HC('span', { className: 'ph' }, 'Double-click to write')),
              sel?.id === n.id && edit !== n.id && HC('span', { className: 'hca8-resize', 'aria-hidden': 'true' }))))),
        HC('p', { className: 'hca-small hca8-hint' }, tool === 'connect' ? (from ? 'Now click the note to connect to.' : 'Click the first note, then the second.') : tool === 'note' ? 'Click anywhere to add a note.' : tool === 'pen' ? 'Draw freely. Switch to Move to pan.' : tool === 'erase' ? 'Click a note, arrow or drawing to remove it.' : 'Drag the background to pan, scroll to zoom. Double-click a note to edit. Select something and press Delete to remove it.')));
}

/* ---------- Planner ---------- */
const HCA8PlanOf = s => ({ blocks: [], ...(s.hcaPlanner || {}) });
function HCA8Ics(blocks) {
  // Weekly repeating events, starting from this week's matching day.
  const pad = n => String(n).padStart(2, '0'), now = new Date(), monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const stamp = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const esc = t => String(t).replace(/[\\,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
  const ev = blocks.map(b => { const [h, m] = b.start.split(':').map(Number), d = new Date(monday); d.setDate(monday.getDate() + b.day); d.setHours(h, m, 0, 0); const e = new Date(d.getTime() + b.mins * 60000);
    return ['BEGIN:VEVENT', `UID:${b.id}@lumen`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(d)}`, `DTEND:${stamp(e)}`, 'RRULE:FREQ=WEEKLY', `SUMMARY:${esc(b.title)}`, 'DESCRIPTION:Study block from Lumen', 'END:VEVENT'].join('\r\n'); });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Healthcare Crown Academy//Lumen//EN', ...ev, 'END:VCALENDAR'].join('\r\n');
}
function HCA8Planner() {
  const ctx = y(), s = ctx.state, plan = HCA8PlanOf(s), goals = HCA3Goals(s), days = HCA3DaysUntil(goals.examDate);
  const [form, setForm] = _.useState({ day: (new Date().getDay() + 6) % 7, start: '18:00', mins: 45, title: '', color: HCA8Colors[0] });
  const save = fn => ctx.setState(st => ({ ...st, hcaPlanner: fn(HCA8PlanOf(st)) }));
  const add = e => { e.preventDefault(); if (!form.title.trim()) return; if (plan.blocks.length >= 120) return ctx.toast('The planner holds up to 120 blocks.', 'warning'); save(p => ({ ...p, blocks: [...p.blocks, { id: ue(), ...form, title: form.title.trim().slice(0, 80) }] })); setForm(f => ({ ...f, title: '' })); };
  const now = Date.now(), today = HCA8Today(), todayIdx = (new Date().getDay() + 6) % 7;
  const due = s.cards.filter(c => (c.due || 0) <= now).length;
  const board = HCA8BoardOf(s), tasks = board.cards.filter(c => c.col !== 'done' && c.due && c.due <= today);
  const focusToday = (s.hcaFocusLog || []).filter(l => l.day === today).reduce((a, l) => a + l.minutes, 0);
  const plannedToday = plan.blocks.filter(b => b.day === todayIdx).reduce((a, b) => a + Number(b.mins), 0);
  const weekMins = plan.blocks.reduce((a, b) => a + Number(b.mins), 0);
  const end = b => { const [h, m] = b.start.split(':').map(Number), t = h * 60 + m + Number(b.mins); return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
  return HC(HCA8Window, { id: 'planner', title: 'Planner', icon: 'time-line', onClose: () => HCA8Close('planner'), className: 'hca8-planner-win' },
    HC('div', { className: 'hca8-plan-top' },
      HC('div', { className: 'hca8-countdown' }, goals.examDate && days !== null
        ? HC(_.Fragment, {}, HC('strong', {}, days < 0 ? 'Exam passed' : days === 0 ? 'Exam today' : `${days} day${days === 1 ? '' : 's'}`), HC('span', {}, `to ${goals.examName} · ${goals.examDate}`))
        : HC(_.Fragment, {}, HC('strong', {}, 'No exam date'), HC('span', {}, 'Set one to see your countdown')),
        HC('button', { type: 'button', className: 'text-link', onClick: () => ctx.setModal({ type: 'hca3-goals' }) }, goals.examDate ? 'Change' : 'Set exam date')),
      HC('ul', { className: 'hca8-today' },
        HC('li', {}, HCAIcon('stack-line'), HC('span', {}, HC('strong', {}, due), ' recall card', due === 1 ? '' : 's', ' due'), due > 0 && HC('button', { type: 'button', className: 'text-link', onClick: () => { HCA8Close('planner'); ctx.navigate('studio'); } }, 'Review')),
        HC('li', {}, HCAIcon('layout-column-line'), HC('span', {}, HC('strong', {}, tasks.length), ' board task', tasks.length === 1 ? '' : 's', ' due or overdue'), HC('button', { type: 'button', className: 'text-link', onClick: () => HCA8Open('board') }, 'Open board')),
        HC('li', {}, HCAIcon('timer-line'), HC('span', {}, HC('strong', {}, focusToday), ' of ', plannedToday || '—', ' planned minutes focused today'), HC('button', { type: 'button', className: 'text-link', onClick: () => HCA8Open('timer') }, 'Start timer')))),
    HC('div', { className: 'hca8-week' }, HCA8Days.map((d, i) => {
      const blocks = plan.blocks.filter(b => b.day === i).sort((a, b) => a.start.localeCompare(b.start));
      return HC('section', { key: d, className: i === todayIdx ? 'today' : '' }, HC('h4', {}, d, i === todayIdx && HC('small', {}, ' · today')),
        blocks.map(b => HC('div', { key: b.id, className: 'hca8-block', style: { borderLeftColor: b.color } }, HC('small', {}, `${b.start}–${end(b)}`), HC('span', {}, b.title),
          HC('button', { type: 'button', className: 'hca3-icon-btn', 'aria-label': `Remove ${b.title}`, onClick: () => save(p => ({ ...p, blocks: p.blocks.filter(x => x.id !== b.id) })) }, HCAIcon('close-line')))),
        !blocks.length && HC('p', { className: 'hca-small' }, '—'));
    })),
    HC('form', { className: 'hca8-plan-form', onSubmit: add },
      HC('select', { value: form.day, 'aria-label': 'Day', onChange: e => setForm(f => ({ ...f, day: Number(e.target.value) })) }, HCA8Days.map((d, i) => HC('option', { key: d, value: i }, d))),
      HC('input', { type: 'time', value: form.start, 'aria-label': 'Start time', onChange: e => setForm(f => ({ ...f, start: e.target.value || '18:00' })) }),
      HC('select', { value: form.mins, 'aria-label': 'Length', onChange: e => setForm(f => ({ ...f, mins: Number(e.target.value) })) }, [25, 30, 45, 60, 90, 120].map(m => HC('option', { key: m, value: m }, `${m} min`))),
      HC('input', { value: form.title, placeholder: 'What will you study? e.g. Cardiac meds', 'aria-label': 'Study block title', onKeyDown: e => e.stopPropagation(), onChange: e => setForm(f => ({ ...f, title: e.target.value })) }),
      HC('span', { className: 'hca8-swatch-row' }, HCA8Colors.slice(0, 5).map(c => HC('button', { key: c, type: 'button', style: { background: c }, 'aria-label': `Colour ${c}`, 'aria-pressed': form.color === c, onClick: () => setForm(f => ({ ...f, color: c })) }))),
      HCABtn('Add block', add, 'primary', 'add-line', { disabled: !form.title.trim() })),
    HC('div', { className: 'hca8-row' },
      HC('span', { className: 'hca-small' }, `${(weekMins / 60).toFixed(1)} hours planned each week.`), HC('span', { className: 'grow' }),
      HCABtn('Add to my calendar (.ics)', () => HCA7Download(new Blob([HCA8Ics(plan.blocks)], { type: 'text/calendar' }), 'Lumen study plan.ics'), 'secondary', 'download-line', { disabled: !plan.blocks.length })));
}

/* ---------- Mount ---------- */
function HCA8Floats() {
  const ui = HCA7Use(), d = ui.desk || {};
  return HC(_.Fragment, {}, HC(HCA8TimerHost), S.createPortal(HC(_.Fragment, {}, d.board && HC(HCA8Board), d.canvas && HC(HCA8Canvas), d.timer && HC(HCA8Timer), d.planner && HC(HCA8Planner)), document.body), HC(HCA9Floats));
}
const HCA8Prev = { Dialogs: rs, Commands: HCA3Commands };
rs = function HCA8DialogRouter() { return HC(_.Fragment, {}, HC(HCA8Prev.Dialogs), HC(HCA8Floats)); };
HCA3Commands = function HCA8Commands(ctx) {
  return [...HCA8Prev.Commands(ctx),
    { group: 'Study desk', icon: 'layout-column-line', label: 'Board (Kanban)', run: () => HCA8Open('board') },
    { group: 'Study desk', icon: 'edit-line', label: 'Canvas (concept map, whiteboard)', run: () => HCA8Open('canvas') },
    { group: 'Study desk', icon: 'timer-line', label: 'Focus timer (Pomodoro)', run: () => HCA8Open('timer') },
    { group: 'Study desk', icon: 'time-line', label: 'Planner (timetable, exam countdown)', run: () => HCA8Open('planner') }];
};
