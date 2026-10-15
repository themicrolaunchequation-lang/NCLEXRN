/* HCA v3 — Lumen experience layer.
   Injected by lumen/tools/build.mjs just before the app's createRoot().render() call,
   so it shares the bundle's module scope (y = workspace context hook, HC = createElement,
   A = dialog, k = button, E = icon, we = due cards, Te = scheduler, ke/rs/HCAProgress = views).
   Everything here wraps existing components; nothing in the original bundle is edited. */

const HCA3 = { ladder: Te, Dashboard: ke, Progress: HCAProgress, Dialogs: rs };
HCA3.scheduler = (() => {
  try { return JSON.parse(localStorage.getItem('lumen.workspace.v1'))?.settings?.hcaScheduler || 'fsrs'; } catch { return 'fsrs'; }
})();
HCA3.isMac = /Mac|iPhone|iPad/.test(navigator.platform);
HCA3.DAY = 864e5;

/* ---------- Adaptive scheduler: FSRS-4.5 with default parameters ----------
   Ratings map to FSRS grades: again = 1, hard = 2, good = 3, easy = 4. Target retention 90%,
   where the next interval equals the memory stability S (in days). Cards scheduled by the
   old 1/3/7/14/30/60 ladder are seeded from their ladder step on their next review. */
const HCA3W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
const HCA3Ladder = [1, 3, 7, 14, 30, 60];
const HCA3Clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const HCA3Grade = rating => ({ again: 1, hard: 2, good: 3, easy: 4 })[rating] || 3;
const HCA3InitialDifficulty = g => HCA3Clamp(HCA3W[4] - (g - 3) * HCA3W[5], 1, 10);
const HCA3Retrievability = (days, s) => Math.pow(1 + (19 / 81) * days / s, -0.5);

function HCA3Memory(card) {
  if (card.fsrs && Number.isFinite(card.fsrs.s)) return card.fsrs;
  if (!(card.reviews > 0) || card.step == null || card.step < 0) return null;
  const ivl = HCA3Ladder[Math.min(card.step, HCA3Ladder.length - 1)];
  return { s: ivl, d: 5, last: (card.due || Date.now()) - ivl * HCA3.DAY };
}

function HCA3Fsrs(card, rating) {
  const now = Date.now(), g = HCA3Grade(rating), w = HCA3W, prev = HCA3Memory(card);
  let s, d;
  if (!prev) {
    s = w[g - 1];
    d = HCA3InitialDifficulty(g);
  } else {
    const r = HCA3Retrievability(Math.max(0, (now - prev.last) / HCA3.DAY), prev.s);
    d = HCA3Clamp(w[7] * HCA3InitialDifficulty(4) + (1 - w[7]) * (prev.d - w[6] * (g - 3)), 1, 10);
    if (g === 1) s = Math.min(prev.s, w[11] * Math.pow(prev.d, -w[12]) * (Math.pow(prev.s + 1, w[13]) - 1) * Math.exp(w[14] * (1 - r)));
    else s = prev.s * (1 + Math.exp(w[8]) * (11 - prev.d) * Math.pow(prev.s, -w[9]) * (Math.exp(w[10] * (1 - r)) - 1) * (g === 2 ? w[15] : g === 4 ? w[16] : 1));
  }
  s = HCA3Clamp(s, 0.1, 36500);
  const ivl = g === 1 ? 0 : HCA3Clamp(Math.round(s), 1, 3650);
  let step = -1;
  if (g !== 1) HCA3Ladder.forEach((v, i) => { if (ivl >= v) step = i; });
  return {
    ...card,
    step: g === 1 ? -1 : Math.max(0, step),
    due: g === 1 ? now + 6e5 : now + ivl * HCA3.DAY,
    reviews: (card.reviews || 0) + 1,
    lapses: (card.lapses || 0) + (g === 1 && prev ? 1 : 0),
    fsrs: { s: +s.toFixed(4), d: +d.toFixed(4), last: now },
  };
}

Te = function HCA3Schedule(card, rating) {
  if (HCA3.scheduler !== 'ladder') return HCA3Fsrs(card, rating);
  if (rating !== 'hard') return HCA3.ladder(card, rating);
  // The ladder has no "hard" step: repeat the current step's interval instead of moving up.
  const step = Math.max(0, card.step ?? 0);
  return { ...card, step, due: Date.now() + HCA3Ladder[step] * HCA3.DAY, reviews: (card.reviews || 0) + 1 };
};

/* ---------- Activity, streaks and goals ---------- */
const HCA3DayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const HCA3StartOfDay = (offset = 0) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + offset); return d; };

function HCA3Activity(s) {
  const days = new Map();
  const add = (t, kind) => {
    if (!Number.isFinite(t)) return;
    const key = HCA3DayKey(t), day = days.get(key) || { reviews: 0, notes: 0, practice: 0 };
    day[kind]++;
    days.set(key, day);
  };
  (s.reviewLog || []).forEach(l => add(l.at, 'reviews'));
  (s.notes || []).forEach(n => add(n.createdAt, 'notes'));
  (s.highlights || []).forEach(h => add(h.createdAt, 'notes'));
  (s.practiceSessions || []).forEach(p => add(p.createdAt ?? p.at, 'practice'));
  return days;
}

function HCA3Streaks(days) {
  const cursor = HCA3StartOfDay();
  const todayActive = days.has(HCA3DayKey(cursor));
  if (!todayActive) cursor.setDate(cursor.getDate() - 1);
  let current = 0;
  while (days.has(HCA3DayKey(cursor))) { current++; cursor.setDate(cursor.getDate() - 1); }
  const sorted = [...days.keys()].map(k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).getTime(); }).sort((a, b) => a - b);
  let best = 0, run = 0, prev = null;
  sorted.forEach(t => { run = prev !== null && Math.round((t - prev) / HCA3.DAY) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = t; });
  return { current, best, todayActive };
}

const HCA3ReviewsSince = (s, t) => (s.reviewLog || []).filter(l => l.at >= t).length;
const HCA3Goals = s => ({ examName: 'NCLEX-RN', dailyReviews: 20, ...(s.hcaGoals || {}) });

function HCA3DaysUntil(date) {
  if (!date) return null;
  const [y, m, d] = String(date).split('-').map(Number);
  if (!y || !m || !d) return null;
  return Math.round((new Date(y, m - 1, d).getTime() - HCA3StartOfDay().getTime()) / HCA3.DAY);
}

function HCA3Relative(t) {
  const days = Math.round((t - HCA3StartOfDay().getTime()) / HCA3.DAY);
  if (t <= Date.now()) return 'now';
  if (days <= 0) return 'later today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

function HCA3SetSettings(ctx, patch) {
  ctx.setState(s => ({ ...s, settings: { ...s.settings, ...patch } }));
}

/* ---------- Today: plan strip and getting-started checklist ---------- */
function HCA3Step({ index, done, icon, title, meta, action, children }) {
  return HC('li', { className: `hca3-step ${done ? 'done' : ''}` },
    HC('span', { className: 'hca3-step-index', 'aria-hidden': 'true' }, done ? HCAIcon('check-line') : index),
    HC('div', { className: 'hca3-step-body' },
      HC('span', { className: 'hca3-step-title' }, HCAIcon(icon), title),
      HC('span', { className: 'hca3-step-meta' }, meta),
      children),
    action);
}

function HCA3TodayPlan() {
  const ctx = y(), s = ctx.state, goals = HCA3Goals(s);
  const due = we(s.cards), book = s.books.find(b => b.id === s.lastBookId) || s.books[0];
  const days = HCA3Activity(s), streak = HCA3Streaks(days);
  const doneToday = HCA3ReviewsSince(s, HCA3StartOfDay().getTime());
  const examIn = HCA3DaysUntil(goals.examDate);
  const nextDue = s.cards.filter(c => c.due > Date.now()).sort((a, b) => a.due - b.due)[0];
  const minutes = Math.max(1, Math.ceil(due.length * 10 / 60));
  const pct = book ? Math.round(((book.page || 1) / Math.max(1, book.count)) * 100) : 0;
  const goalPct = Math.min(100, Math.round(doneToday / Math.max(1, goals.dailyReviews) * 100));

  let review;
  if (due.length) review = HC(HCA3Step, { index: 1, icon: 'stack-line', title: `Review ${due.length} due card${due.length === 1 ? '' : 's'}`, meta: `About ${minutes} min · answer before you reveal`, action: HCABtn('Start review', () => ctx.startReview(due), 'primary', 'play-fill') });
  else if (s.cards.length) review = HC(HCA3Step, { index: 1, done: true, icon: 'stack-line', title: 'Reviews are clear', meta: nextDue ? `Next card is due ${HCA3Relative(nextDue.due)}` : 'Nothing scheduled', action: HCABtn('New card', () => ctx.setModal({ type: 'card', bookId: book?.id, page: book?.page || 1 }), 'secondary', 'add-line') });
  else review = HC(HCA3Step, { index: 1, icon: 'stack-line', title: 'Make your first recall card', meta: 'Cards bring ideas back just before you forget them', action: HCABtn('Open Study', () => ctx.navigate('studio'), 'secondary', 'arrow-right-line') });

  const read = book && HC(HCA3Step, { index: 2, icon: 'book-open-line', title: `Continue “${book.title}”`, meta: `Page ${book.page || 1} of ${book.count} · ${pct}% through`, action: HCABtn('Continue', () => ctx.openBook(book.id), 'secondary', 'arrow-right-line') },
    HC('span', { className: 'hca3-meter', 'aria-hidden': 'true' }, HC('span', { style: { width: `${pct}%` } })));

  const exam = goals.examDate && examIn !== null
    ? HC(HCA3Step, { index: 3, done: doneToday >= goals.dailyReviews, icon: 'graduation-cap-line', title: examIn > 0 ? `${examIn} day${examIn === 1 ? '' : 's'} to ${goals.examName}` : examIn === 0 ? `${goals.examName} is today` : `${goals.examName} date has passed`, meta: `${doneToday} of ${goals.dailyReviews} reviews done today`, action: HCABtn('Edit goal', () => ctx.setModal({ type: 'hca3-goals' }), 'secondary', 'time-line') },
      HC('span', { className: 'hca3-meter', role: 'progressbar', 'aria-label': 'Daily review goal', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': goalPct }, HC('span', { style: { width: `${goalPct}%` } })))
    : HC(HCA3Step, { index: 3, icon: 'graduation-cap-line', title: 'Set your exam date', meta: 'See the countdown and a daily review target', action: HCABtn('Set goal', () => ctx.setModal({ type: 'hca3-goals' }), 'secondary', 'time-line') });

  return HC('section', { className: 'hca3-plan', 'aria-labelledby': 'hca3-plan-title' },
    HC('div', { className: 'hca3-plan-head' },
      HC('div', {}, HCAEyebrow('TODAY’S PLAN'), HC('h2', { id: 'hca3-plan-title' }, 'Three steps, in order.')),
      HC('div', { className: 'hca3-plan-chips' },
        HC('span', { className: `hca3-chip ${streak.current ? 'warm' : ''}`, title: `Best streak: ${streak.best} day${streak.best === 1 ? '' : 's'}` }, HCAIcon('heart-pulse-line'),
          streak.current ? `${streak.current}-day streak${streak.todayActive ? '' : ' · study today to keep it'}` : 'Start a streak today'),
        HC('button', { className: 'hca3-chip action', onClick: () => ctx.setModal({ type: 'search' }) }, HCAIcon('command-line'), HC('span', {}, 'Quick actions'), HC('kbd', {}, HCA3.isMac ? '⌘K' : 'Ctrl K')))),
    HC('ol', { className: 'hca3-steps' }, review, read, exam));
}

function HCA3GetStarted() {
  const ctx = y(), s = ctx.state;
  if (s.hcaOnboard?.dismissed) return null;
  const steps = [
    ['Open a source in the reading room', !!s.hcaOnboard?.opened || s.books.some(b => (b.page || 1) > 1), () => { const b = s.books.find(x => x.id === s.lastBookId) || s.books[0]; b && ctx.openBook(b.id); }],
    ['Save a highlight or a note', s.highlights.length + s.notes.length > 0, () => ctx.navigate('notes')],
    ['Create a recall card', s.cards.length > 0, () => ctx.navigate('studio')],
    ['Finish a short review', (s.reviewLog || []).length > 0, () => { const due = we(s.cards); due.length ? ctx.startReview(due) : ctx.navigate('studio'); }],
    ['Set your exam date', !!s.hcaGoals?.examDate, () => ctx.setModal({ type: 'hca3-goals' })],
    ['Add your own PDF or images', s.books.some(b => b.kind !== 'demo'), () => ctx.setModal({ type: 'upload' })],
  ];
  const done = steps.filter(x => x[1]).length;
  if (done === steps.length) return null;
  const dismiss = () => ctx.setState(st => ({ ...st, hcaOnboard: { ...st.hcaOnboard, dismissed: true } }));
  return HC('section', { className: 'hca3-onboard', 'aria-labelledby': 'hca3-onboard-title' },
    HC('div', { className: 'hca3-onboard-head' },
      HC('div', {}, HCAEyebrow(`GETTING STARTED · ${done} OF ${steps.length}`), HC('h2', { id: 'hca3-onboard-title' }, 'Learn Lumen in six small steps.')),
      HC('button', { className: 'hca3-icon-btn', onClick: dismiss, 'aria-label': 'Hide the getting started checklist', title: 'Hide' }, HCAIcon('close-line'))),
    HC('span', { className: 'hca3-meter wide', 'aria-hidden': 'true' }, HC('span', { style: { width: `${done / steps.length * 100}%` } })),
    HC('ul', { className: 'hca3-onboard-list' }, steps.map(([label, ok, go]) =>
      HC('li', { key: label }, HC('button', { className: ok ? 'done' : '', onClick: go, 'aria-label': `${label}${ok ? ' (done)' : ''}` },
        HCAIcon(ok ? 'checkbox-circle-line' : 'checkbox-blank-circle-line'), HC('span', {}, label), !ok && HCAIcon('arrow-right-s-line'))))));
}

// Unless the learner has chosen, the welcome banner is only for newcomers: it steps aside after the first review or upload.
function HCA3HeroOff(s) {
  const choice = s.settings.hcaHero;
  return choice === 'off' || (choice !== 'on' && ((s.reviewLog || []).length > 0 || s.books.some(b => b.kind !== 'demo')));
}

ke = function HCA3Today() {
  const ctx = y(), heroOff = HCA3HeroOff(ctx.state);
  return HC('div', { className: `page-content hca-dashboard hca3-shell hca3-today ${heroOff ? 'hero-off' : ''}` },
    HC(HCA3TodayPlan), HC(HCA3GetStarted),
    HC('div', { className: 'hca3-hero-toggle' },
      HC('button', { className: 'text-link', onClick: () => HCA3SetSettings(ctx, { hcaHero: heroOff ? 'on' : 'off' }) },
        HCAIcon(heroOff ? 'eye-line' : 'eye-off-line'), heroOff ? 'Show the welcome banner' : 'Hide the welcome banner')),
    HC(HCA3.Dashboard));
};

/* ---------- Progress: streaks, heatmap, recall rate, forecast ---------- */
function HCA3Heatmap({ days }) {
  const weeks = 18, end = HCA3StartOfDay(), start = HCA3StartOfDay(-(weeks * 7 - 1));
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const cells = [], counts = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const v = days.get(HCA3DayKey(d)), n = v ? v.reviews + v.notes + v.practice : 0;
    cells.push({ date: new Date(d), v, n });
    if (n) counts.push(n);
  }
  counts.sort((a, b) => a - b);
  const q = p => counts[Math.floor((counts.length - 1) * p)] || 1;
  const level = n => (!n ? 0 : n <= q(0.25) ? 1 : n <= q(0.5) ? 2 : n <= q(0.75) ? 3 : 4);
  const months = [];
  cells.forEach((c, i) => { if (c.date.getDate() <= 7 && c.date.getDay() === 1) months.push({ col: Math.floor(i / 7) + 1, label: c.date.toLocaleDateString('en-GB', { month: 'short' }) }); });
  const active = cells.filter(c => c.n).reverse();
  return HC('div', { className: 'hca3-heatmap-wrap' },
    HC('div', { className: 'hca3-heatmap-months', 'aria-hidden': 'true', style: { gridTemplateColumns: `repeat(${Math.ceil(cells.length / 7)}, 1fr)` } },
      months.map(m => HC('span', { key: m.col, style: { gridColumn: m.col } }, m.label))),
    HC('div', { className: 'hca3-heatmap', role: 'img', 'aria-label': `Study activity over the last ${weeks} weeks: ${active.length} active days.` },
      cells.map(c => HC('span', { key: c.date.getTime(), className: `l${level(c.n)}`, title: `${c.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}: ${c.v ? `${c.v.reviews} reviews, ${c.v.notes} notes & highlights, ${c.v.practice} guided sessions` : 'no activity'}` }))),
    HC('div', { className: 'hca3-legend', 'aria-hidden': 'true' }, 'Less', [0, 1, 2, 3, 4].map(l => HC('span', { key: l, className: `l${l}` })), 'More'),
    HC('details', { className: 'hca-data-details' }, HC('summary', {}, 'View activity as a table'),
      active.length ? HC('table', {}, HC('thead', {}, HC('tr', {}, HC('th', {}, 'Date'), HC('th', {}, 'Reviews'), HC('th', {}, 'Notes & highlights'), HC('th', {}, 'Guided sessions'))),
        HC('tbody', {}, active.map(c => HC('tr', { key: c.date.getTime() }, HC('td', {}, c.date.toLocaleDateString()), HC('td', {}, c.v.reviews), HC('td', {}, c.v.notes), HC('td', {}, c.v.practice)))))
        : HC('p', { className: 'hca-small' }, 'No recorded activity yet.')));
}

function HCA3Insights() {
  const ctx = y(), s = ctx.state, days = HCA3Activity(s), streak = HCA3Streaks(days);
  const since = HCA3StartOfDay(-29).getTime(), recent = (s.reviewLog || []).filter(l => l.at >= since);
  const recalled = recent.filter(l => l.rating !== 'again').length;
  const rate = recent.length ? Math.round(recalled / recent.length * 100) : null;
  const forecast = Array.from({ length: 7 }, (_, i) => {
    const from = i === 0 ? -Infinity : HCA3StartOfDay(i).getTime(), to = HCA3StartOfDay(i + 1).getTime();
    return { label: i === 0 ? 'Today' : HCA3StartOfDay(i).toLocaleDateString('en-GB', { weekday: 'short' }), n: s.cards.filter(c => (c.due || 0) >= from && (c.due || 0) < to).length };
  });
  const fmax = Math.max(1, ...forecast.map(f => f.n));
  const stability = c => c.fsrs?.s ?? (c.reviews > 0 && c.step >= 0 ? HCA3Ladder[c.step] : 0);
  const fresh = s.cards.filter(c => !(c.reviews > 0)).length, mature = s.cards.filter(c => stability(c) >= 21).length, learning = s.cards.length - fresh - mature;
  const total = Math.max(1, s.cards.length);
  const tile = (icon, label, value, detail) => HC('div', { className: 'hca3-tile' }, HC('span', { className: 'hca3-tile-label' }, HCAIcon(icon), label), HC('strong', {}, value), HC('span', { className: 'hca3-tile-detail' }, detail));
  return HC('section', { className: 'hca-panel hca3-insights', 'aria-labelledby': 'hca3-insights-title' },
    HC('div', { className: 'hca-section-head' }, HC('div', {}, HCAEyebrow('LEARNING INSIGHTS'), HC('h2', { id: 'hca3-insights-title' }, 'Consistency beats intensity.'))),
    HC('div', { className: 'hca3-tiles' },
      tile('heart-pulse-line', 'Current streak', `${streak.current} day${streak.current === 1 ? '' : 's'}`, `Best: ${streak.best} day${streak.best === 1 ? '' : 's'}`),
      tile('checkbox-circle-line', 'Recall rate · 30 days', rate === null ? '—' : `${rate}%`, recent.length ? `${recalled} of ${recent.length} answers recalled` : 'Rate a few cards to see this'),
      tile('history-line', 'Due in the next 7 days', forecast.reduce((n, f) => n + f.n, 0), 'Including anything overdue'),
      tile('leaf-line', 'Long-term cards', `${mature} of ${s.cards.length}`, 'Stable for 21+ days')),
    HC('div', { className: 'hca3-insight-grid' },
      HC('div', {}, HC('h3', {}, 'Activity'), HC(HCA3Heatmap, { days })),
      HC('div', {},
        HC('h3', {}, 'Review forecast'),
        HC('div', { className: 'hca3-forecast', role: 'list' }, forecast.map(f => HC('div', { key: f.label, role: 'listitem', 'aria-label': `${f.label}: ${f.n} cards due` },
          HC('span', {}, f.label), HC('span', { className: 'hca3-forecast-bar' }, HC('span', { style: { width: `${f.n / fmax * 100}%` } })), HC('strong', {}, f.n)))),
        HC('h3', {}, 'Card maturity'),
        HC('div', { className: 'hca3-stack', role: 'img', 'aria-label': `${fresh} new, ${learning} learning, ${mature} long-term cards` },
          HC('span', { className: 'new', style: { flexGrow: fresh / total } }), HC('span', { className: 'learning', style: { flexGrow: learning / total } }), HC('span', { className: 'mature', style: { flexGrow: mature / total } })),
        HC('div', { className: 'hca3-stack-legend' }, HC('span', { className: 'new' }, `New ${fresh}`), HC('span', { className: 'learning' }, `Learning ${learning}`), HC('span', { className: 'mature' }, `Long-term ${mature}`)),
        HC('p', { className: 'hca-small' }, s.settings.hcaScheduler === 'ladder' ? 'Scheduler: simple 1 / 3 / 7 / 14 / 30 / 60-day ladder.' : 'Scheduler: adaptive (FSRS-4.5, default parameters, 90% target recall).', ' ',
          HC('button', { className: 'text-link inline', onClick: () => ctx.setModal({ type: 'hca3-goals' }) }, 'Change')))));
}

HCAProgress = function HCA3Progress() {
  return HC('div', { className: 'page-content hca-progress-page hca3-shell hca3-progress' }, HC(HCA3Insights), HC(HCA3.Progress));
};

/* ---------- Goals and scheduling dialog ---------- */
function HCA3GoalsDialog({ onClose }) {
  const ctx = y(), goals = HCA3Goals(ctx.state);
  const [name, setName] = _.useState(goals.examName), [date, setDate] = _.useState(goals.examDate || ''), [daily, setDaily] = _.useState(goals.dailyReviews);
  const [sched, setSched] = _.useState(ctx.state.settings.hcaScheduler || 'fsrs');
  const save = () => {
    ctx.setState(s => ({ ...s, hcaGoals: { examName: name.trim() || 'NCLEX-RN', examDate: date || null, dailyReviews: HCA3Clamp(Math.round(Number(daily) || 20), 5, 500) }, settings: { ...s.settings, hcaScheduler: sched } }));
    ctx.toast('Your study goal is saved.');
    onClose();
  };
  return HC(A, { title: 'Your exam and daily goal.', eyebrow: 'STUDY GOALS · SCHEDULING', onClose, className: 'hca3-goals',
    footer: HC(_.Fragment, {}, HCABtn('Cancel', onClose, 'secondary', 'close-line'), HCABtn('Save goal', save, 'primary', 'check-line')) },
    HC('div', { className: 'hca3-form' },
      HC('label', {}, 'Exam', HC('input', { value: name, onChange: e => setName(e.target.value), maxLength: 60, placeholder: 'NCLEX-RN' })),
      HC('label', {}, 'Exam date', HC('input', { type: 'date', value: date, onChange: e => setDate(e.target.value) })),
      HC('label', {}, 'Daily review target', HC('input', { type: 'number', min: 5, max: 500, step: 5, value: daily, onChange: e => setDaily(e.target.value) }),
        HC('span', { className: 'hca-small' }, 'Most learners do well with 20–60 reviews a day. Today shows your progress against this number.')),
      HC('fieldset', {}, HC('legend', {}, 'How cards are scheduled'),
        [['fsrs', 'Adaptive (recommended)', 'FSRS-4.5 with default parameters. Each card’s next review is set from how well you recalled it, aiming for 90% recall. Easy cards spread out fast; hard ones come back sooner.'],
          ['ladder', 'Simple ladder', 'Fixed steps of 1, 3, 7, 14, 30 and 60 days. “Again” returns after 10 minutes.']].map(([v, label, text]) =>
          HC('label', { key: v, className: `hca3-radio ${sched === v ? 'checked' : ''}` },
            HC('input', { type: 'radio', name: 'hca3-sched', value: v, checked: sched === v, onChange: () => setSched(v) }),
            HC('span', {}, HC('strong', {}, label), HC('span', { className: 'hca-small' }, text))))),
      HC('p', { className: 'hca-small' }, 'Goals and schedules are study aids. They do not predict exam results or measure clinical competence.')));
}

/* ---------- Command palette (replaces the search dialog; ⌘K, Ctrl K or /) ---------- */
function HCA3Match(text, tokens) {
  if (!tokens.length) return 1;
  const t = (text || '').toLowerCase();
  let score = 0;
  for (const tok of tokens) {
    const i = t.indexOf(tok);
    if (i < 0) return 0;
    score += i === 0 ? 30 : /\W/.test(t[i - 1]) ? 20 : 10;
  }
  return score;
}

function HCA3Snippet(text, tokens, size = 110) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  const at = tokens.length ? Math.max(0, t.toLowerCase().indexOf(tokens[0])) : 0;
  const from = Math.max(0, at - 30), slice = (from ? '…' : '') + t.slice(from, from + size) + (from + size < t.length ? '…' : '');
  if (!tokens.length) return slice;
  const re = new RegExp(`(${tokens.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'ig');
  return slice.split(re).map((part, i) => (i % 2 ? HC('mark', { key: i }, part) : part));
}

function HCA3Commands(ctx) {
  const s = ctx.state, due = we(s.cards), book = s.books.find(b => b.id === s.lastBookId) || s.books[0];
  const nav = (label, route, icon, key) => ({ group: 'Go to', icon, label, keys: ['G', key], run: () => ctx.navigate(route) });
  return [
    { group: 'Actions', icon: 'stack-line', label: due.length ? `Review ${due.length} due card${due.length === 1 ? '' : 's'}` : 'Review cards (none due)', keys: ['R'], run: () => (due.length ? ctx.startReview(due) : ctx.navigate('studio')) },
    book && { group: 'Actions', icon: 'book-open-line', label: `Continue reading: ${book.title}`, hint: `Page ${book.page || 1} of ${book.count}`, run: () => ctx.openBook(book.id) },
    { group: 'Actions', icon: 'upload-2-line', label: 'Add a source (PDF or images)', keys: ['U'], run: () => ctx.setModal({ type: 'upload' }) },
    { group: 'Actions', icon: 'add-circle-line', label: 'New recall card', keys: ['C'], run: () => ctx.setModal({ type: 'card', bookId: book?.id, page: book?.page || 1 }) },
    { group: 'Actions', icon: 'sticky-note-line', label: 'New note', keys: ['N'], run: () => ctx.setModal({ type: 'note', bookId: book?.id, page: book?.page || 1 }) },
    { group: 'Actions', icon: 'timer-line', label: ctx.timer?.running ? 'Pause the focus timer' : 'Start the focus timer', run: () => (ctx.timer?.running ? ctx.pauseTimer() : ctx.startTimer()) },
    { group: 'Actions', icon: 'graduation-cap-line', label: 'Set exam date and daily goal', run: () => ctx.setModal({ type: 'hca3-goals' }) },
    nav('Today', 'home', 'home-5-line', 'T'), nav('Library', 'library', 'book-2-line', 'L'), nav('Study', 'studio', 'stack-line', 'S'),
    nav('Notes & highlights', 'notes', 'sticky-note-line', 'N'), nav('Methods', 'methods', 'lightbulb-line', 'M'), nav('Progress', 'progress', 'dashboard-line', 'P'),
    { group: 'Preferences', icon: 'contrast-drop-line', label: s.settings.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme', keys: ['D'], run: () => HCA3SetSettings(ctx, { theme: s.settings.theme === 'dark' ? 'light' : 'dark' }) },
    { group: 'Preferences', icon: 'font-size', label: s.settings.interfaceScale === 'large' ? 'Use standard interface text' : 'Use larger interface text', run: () => HCA3SetSettings(ctx, { interfaceScale: s.settings.interfaceScale === 'large' ? 'comfortable' : 'large' }) },
    { group: 'Preferences', icon: 'layout-row-line', label: HCA3HeroOff(s) ? 'Show the welcome banner on Today' : 'Hide the welcome banner on Today', run: () => HCA3SetSettings(ctx, { hcaHero: HCA3HeroOff(s) ? 'on' : 'off' }) },
    { group: 'Preferences', icon: 'settings-4-line', label: 'Open settings', run: () => ctx.setModal({ type: 'settings' }) },
    { group: 'Your data', icon: 'file-text-line', label: 'Export study pack (Markdown)', run: () => ctx.exportStudyPack() },
    { group: 'Your data', icon: 'download-line', label: 'Back up the whole workspace', run: () => ctx.backupWorkspace() },
    { group: 'Help', icon: 'keyboard-box-line', label: 'Keyboard shortcuts', keys: ['?'], run: () => ctx.setModal({ type: 'hca3-keys' }) },
    { group: 'Help', icon: 'question-line', label: 'Help and guided tour', run: () => ctx.setModal({ type: 'help' }) },
  ].filter(Boolean);
}

function HCA3PaletteItems(ctx, query) {
  const s = ctx.state, tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const titleOf = id => s.books.find(b => b.id === id)?.title || 'Source';
  const ranked = (list, limit) => list.filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
  const cmds = HCA3Commands(ctx).map(c => ({ ...c, kind: 'cmd', score: HCA3Match(`${c.label} ${c.group}`, tokens) }));
  if (!tokens.length) {
    const recent = s.books.slice().sort((a, b) => (b.id === s.lastBookId) - (a.id === s.lastBookId)).slice(0, 3)
      .map(b => ({ group: 'Sources', kind: 'source', icon: 'book-2-line', label: b.title, hint: `${b.kind === 'demo' ? 'Sample' : 'Your source'} · p. ${b.page || 1}/${b.count}`, run: () => ctx.openBook(b.id) }));
    return [...cmds.filter(c => c.group === 'Actions'), ...recent, ...cmds.filter(c => c.group !== 'Actions')];
  }
  const sources = ranked(s.books.map(b => ({ group: 'Sources', kind: 'source', icon: 'book-2-line', label: b.title, hint: `${b.subject || b.category || (b.kind === 'demo' ? 'Sample' : 'Your source')} · ${b.count} pages`, score: HCA3Match(`${b.title} ${b.subject || ''} ${b.category || ''} ${b.description || ''}`, tokens) + 15, run: () => ctx.openBook(b.id) })), 5);
  const notes = ranked([
    ...s.notes.map(n => ({ group: 'Notes & highlights', kind: 'note', icon: 'sticky-note-line', label: n.title || HCA3Snippet(n.text, [], 70), detail: HCA3Snippet(n.text, tokens), hint: `${titleOf(n.bookId)} · p. ${n.page || 1}`, score: HCA3Match(`${n.title || ''} ${n.text || ''}`, tokens), run: () => ctx.openBook(n.bookId, n.page) })),
    ...s.highlights.filter(h => h.text).map(h => ({ group: 'Notes & highlights', kind: 'note', icon: 'mark-pen-line', label: HCA3Snippet(h.text, tokens, 90), hint: `Highlight · ${titleOf(h.bookId)} · p. ${h.page || 1}`, score: HCA3Match(h.text, tokens), run: () => ctx.openBook(h.bookId, h.page) })),
  ], 6);
  const cards = ranked(s.cards.map(c => ({ group: 'Recall cards', kind: 'card', icon: 'stack-line', label: HCA3Snippet(c.question, tokens, 90), detail: HCA3Snippet(c.answer, tokens), hint: `${titleOf(c.bookId)} · p. ${c.page || 1}`, score: HCA3Match(`${c.question || ''} ${c.answer || ''}`, tokens), run: () => ctx.setModal({ type: 'card', card: c, bookId: c.bookId, page: c.page }) })), 5);
  return [...ranked(cmds, 6), ...sources, ...notes, ...cards];
}

function HCA3Palette({ onClose }) {
  const ctx = y(), [query, setQuery] = _.useState(''), [active, setActive] = _.useState(0);
  const input = _.useRef(null), list = _.useRef(null), opener = _.useRef(document.activeElement);
  const items = _.useMemo(() => HCA3PaletteItems(ctx, query), [query, ctx.state, ctx.timer?.running]);
  _.useEffect(() => { setActive(0); }, [query]);
  _.useEffect(() => {
    input.current?.focus();
    document.body.classList.add('hca3-lock');
    return () => { document.body.classList.remove('hca3-lock'); if (opener.current?.isConnected) opener.current.focus?.({ preventScroll: true }); };
  }, []);
  _.useEffect(() => { list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }); }, [active, items]);
  const run = item => { if (!item) return; opener.current = null; onClose(); setTimeout(item.run, 0); };
  const onKey = e => {
    if (e.key === 'ArrowDown' || (e.key === 'n' && e.ctrlKey)) { e.preventDefault(); setActive(i => (i + 1) % Math.max(1, items.length)); }
    else if (e.key === 'ArrowUp' || (e.key === 'p' && e.ctrlKey)) { e.preventDefault(); setActive(i => (i - 1 + items.length) % Math.max(1, items.length)); }
    else if (e.key === 'Enter') { e.preventDefault(); run(items[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(); }
    else if (e.key === 'Tab') e.preventDefault();
  };
  let lastGroup = null;
  return HC('div', { className: 'hca3-palette-backdrop', onMouseDown: e => e.target === e.currentTarget && onClose() },
    HC('div', { className: 'hca3-palette', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search and quick actions' },
      HC('div', { className: 'hca3-palette-input' }, HCAIcon('search-line'),
        HC('input', { ref: input, value: query, onChange: e => setQuery(e.target.value), onKeyDown: onKey, placeholder: 'Search sources, notes and cards, or type a command…', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': 'hca3-palette-list', 'aria-activedescendant': items.length ? `hca3-opt-${active}` : undefined, 'aria-autocomplete': 'list', spellCheck: false }),
        HC('kbd', {}, 'esc')),
      HC('ul', { className: 'hca3-palette-list', id: 'hca3-palette-list', role: 'listbox', ref: list, 'aria-label': 'Results' },
        items.length ? items.map((it, i) => {
          const head = it.group !== lastGroup ? HC('li', { key: `g-${it.group}`, role: 'presentation', className: 'hca3-palette-group' }, it.group) : null;
          lastGroup = it.group;
          return [head, HC('li', { key: `${it.group}-${i}`, id: `hca3-opt-${i}`, role: 'option', 'aria-selected': i === active, className: `hca3-palette-item ${i === active ? 'active' : ''}`, onMouseMove: () => i !== active && setActive(i), onClick: () => run(it) },
            HC('span', { className: 'hca3-palette-icon' }, HCAIcon(it.icon)),
            HC('span', { className: 'hca3-palette-text' }, HC('span', { className: 'hca3-palette-label' }, it.label), it.detail && HC('span', { className: 'hca3-palette-detail' }, it.detail)),
            it.hint && HC('span', { className: 'hca3-palette-hint' }, it.hint),
            it.keys && HC('span', { className: 'hca3-palette-keys' }, it.keys.map(k2 => HC('kbd', { key: k2 }, k2))))];
        }) : HC('li', { className: 'hca3-palette-empty', role: 'presentation' }, HCAIcon('search-line'), HC('strong', {}, `Nothing matches “${query}”.`), HC('span', {}, 'Try a shorter word, or search inside a source from the reading room.'))),
      HC('div', { className: 'hca3-palette-foot', 'aria-hidden': 'true' },
        HC('span', {}, HC('kbd', {}, '↑'), HC('kbd', {}, '↓'), ' move'), HC('span', {}, HC('kbd', {}, '↵'), ' open'), HC('span', {}, HC('kbd', {}, 'esc'), ' close'),
        HC('span', { className: 'grow' }), HC('span', {}, 'Searches sources, notes, highlights and cards on this device'))));
}

/* ---------- Keyboard shortcuts ---------- */
const HCA3Keymap = [
  ['Search and quick actions', [HCA3.isMac ? '⌘' : 'Ctrl', 'K'], 'or /'],
  ['Go to Today', ['G', 'T']], ['Go to Library', ['G', 'L']], ['Go to Study', ['G', 'S']],
  ['Go to Notes', ['G', 'N']], ['Go to Methods', ['G', 'M']], ['Go to Progress', ['G', 'P']],
  ['Review due cards', ['R']], ['New recall card', ['C']], ['New note', ['N']], ['Add a source', ['U']],
  ['Switch light or dark theme', ['D']], ['Show these shortcuts', ['?']],
  ['In a review: reveal the answer', ['Space']], ['In a review: Again · Hard · Good · Easy', ['1', '2', '3', '4']],
];

function HCA3KeysDialog({ onClose }) {
  return HC(A, { title: 'Keyboard shortcuts.', eyebrow: 'MOVE FASTER', onClose, className: 'hca3-keys' },
    HC('p', { className: 'hca-small' }, 'Single-key shortcuts work outside text fields and are paused in the reading room, where its own keys apply.'),
    HC('dl', { className: 'hca3-keylist' }, HCA3Keymap.map(([label, keys, extra]) => HC(_.Fragment, { key: label },
      HC('dt', {}, label), HC('dd', {}, keys.map((k2, i) => HC(_.Fragment, { key: i }, i > 0 && HC('span', { className: 'then' }, keys[0] === 'Ctrl' || keys[0] === '⌘' ? '+' : keys[0] === 'G' ? 'then' : '·'), HC('kbd', {}, k2))), extra && HC('span', { className: 'then' }, extra))))));
}

/* ---------- Runtime: global shortcuts, scheduler sync, onboarding tracking ---------- */
function HCA3Runtime() {
  const ctx = y(), s = ctx.state, latest = _.useRef(ctx);
  latest.current = ctx;
  HCA3.scheduler = s.settings.hcaScheduler || 'fsrs';
  _.useEffect(() => {
    if (ctx.route === 'reader' && !s.hcaOnboard?.opened) ctx.setState(st => ({ ...st, hcaOnboard: { ...st.hcaOnboard, opened: true } }));
  }, [ctx.route]);
  _.useEffect(() => {
    let pendingG = 0;
    const onKey = e => {
      const c = latest.current;
      if (c.modal?.type === 'review' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.target.closest?.('input,textarea,select,[contenteditable="true"]')) {
        const buttons = [...document.querySelectorAll('.modal-backdrop button')];
        const find = re => buttons.find(b => re.test(b.innerText.trim()));
        const target = e.key === ' ' ? find(/^I have an answer/) : e.key === '1' ? find(/^Again/) : e.key === '2' ? find(/^Hard/) : e.key === '3' ? find(/^Good/) : e.key === '4' ? find(/^Easy/) : null;
        if (target) { e.preventDefault(); e.stopPropagation(); target.click(); }
        return;
      }
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || c.route === 'reader' || c.modal) return;
      if (document.querySelector('[role="dialog"]') || e.target.closest?.('input,textarea,select,[contenteditable="true"],[contenteditable=""]')) return;
      const key = e.key.toLowerCase(), routes = { t: 'home', l: 'library', s: 'studio', n: 'notes', m: 'methods', p: 'progress' };
      if (Date.now() - pendingG < 1200 && routes[key]) { e.preventDefault(); pendingG = 0; c.navigate(routes[key]); return; }
      pendingG = 0;
      const book = c.state.books.find(b => b.id === c.state.lastBookId) || c.state.books[0];
      if (key === 'g') { pendingG = Date.now(); return; }
      if (e.key === '?') { e.preventDefault(); e.stopImmediatePropagation(); c.setModal({ type: 'hca3-keys' }); return; }
      if (key === 'r') { e.preventDefault(); const due = we(c.state.cards); due.length ? c.startReview(due) : c.toast('No cards are due right now. Nice work.'); return; }
      if (key === 'c') { e.preventDefault(); c.setModal({ type: 'card', bookId: book?.id, page: book?.page || 1 }); return; }
      if (key === 'n') { e.preventDefault(); c.setModal({ type: 'note', bookId: book?.id, page: book?.page || 1 }); return; }
      if (key === 'u') { e.preventDefault(); c.setModal({ type: 'upload' }); return; }
      if (key === 'd') { e.preventDefault(); HCA3SetSettings(c, { theme: c.state.settings.theme === 'dark' ? 'light' : 'dark' }); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);
  return null;
}

rs = function HCA3DialogRouter() {
  const ctx = y(), type = ctx.modal?.type, close = () => ctx.setModal(null);
  const own = type === 'search' ? HC(HCA3Palette, { onClose: close })
    : type === 'hca3-goals' ? HC(HCA3GoalsDialog, { onClose: close })
    : type === 'hca3-keys' ? HC(HCA3KeysDialog, { onClose: close })
    : HC(HCA3.Dialogs);
  return HC(_.Fragment, {}, HC(HCA3Runtime), own);
};
