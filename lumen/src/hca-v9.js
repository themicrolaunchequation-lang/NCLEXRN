/* HCA v9 — Welcome and learning layer, injected after v8 (see lumen/tools/build.mjs).
   - Today: an animated welcome hero, live stats, a tour of what Lumen can do, and where your work is saved
   - "Your work and where it lives": a window that explains browser storage, backups and persistence
   - Study desk: a guide (what, how, when) for every tool, study techniques told as a story,
     a Blurt pad (write from memory, then check), lab values with a quiz mode, and focus sounds
   All offline, no AI. New optional workspace keys: hcaBlurts. */

const HCA9Prev = { Today: ke };
const HCA9Show = name => HCA7Set(s => ({ desk: { ...(s.desk || {}), [name]: true } }));
const HCA9Reduce = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ---------- Small helpers ---------- */
function HCA9CountUp({ value, suffix = '' }) {
  const [n, setN] = _.useState(HCA9Reduce() ? value : 0);
  _.useEffect(() => {
    if (HCA9Reduce() || typeof value !== 'number') { setN(value); return; }
    let raf, start;
    const step = t => { start ??= t; const p = Math.min(1, (t - start) / 900); setN(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return HC(_.Fragment, {}, n, suffix);
}
const HCA9Greeting = () => { const h = new Date().getHours(); return h < 5 ? 'Studying late' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
const HCA9FocusToday = s => (s.hcaFocusLog || []).filter(l => l.day === HCA8Today()).reduce((a, l) => a + l.minutes, 0);

/* ---------- Today ---------- */
function HCA9Hero() {
  const ctx = y(), s = ctx.state, goals = HCA3Goals(s), due = we(s.cards);
  const streak = HCA3Streaks(HCA3Activity(s)), examIn = HCA3DaysUntil(goals.examDate);
  const book = s.books.find(b => b.id === s.lastBookId) || s.books[0];
  const photo = typeof HCAPHoto !== 'undefined' ? HCAPHoto : null;
  const words = ['clarity.', 'confidence.', 'calm.', 'mastery.'];
  const stats = [
    { icon: 'heart-pulse-line', value: streak.current, label: streak.current === 1 ? 'day streak' : 'day streak', go: () => ctx.navigate('progress') },
    { icon: 'stack-line', value: due.length, label: due.length === 1 ? 'card due' : 'cards due', go: () => due.length ? ctx.startReview(due) : ctx.navigate('studio') },
    { icon: 'timer-line', value: HCA9FocusToday(s), label: 'focus min today', go: () => HCA9Show('timer') },
    examIn !== null && examIn >= 0
      ? { icon: 'graduation-cap-line', value: examIn, label: `days to ${goals.examName}`, go: () => ctx.setModal({ type: 'hca3-goals' }) }
      : { icon: 'graduation-cap-line', value: '—', label: 'exam date', go: () => ctx.setModal({ type: 'hca3-goals' }) },
  ];
  return HC('section', { className: 'hca9-hero', 'aria-labelledby': 'hca9-hero-title' },
    HC('div', { className: 'hca9-aurora', 'aria-hidden': 'true' }, HC('span'), HC('span'), HC('span')),
    HC('div', { className: 'hca9-hero-grid', 'aria-hidden': 'true' }),
    HC('div', { className: 'hca9-hero-copy' },
      HC('span', { className: 'hca9-kicker' }, HC('span', { className: 'hca9-pulse' }), new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase(), ' · ', HCA9Greeting()),
      HC('h1', { id: 'hca9-hero-title' }, 'Your next moment of ',
        HC('span', { className: 'hca9-rotator', 'aria-hidden': 'true' }, HC('span', {}, words.map(w => HC('em', { key: w }, w)))),
        HC('span', { className: 'sr-only hca9-sr' }, 'clarity.')),
      HC('p', {}, 'Read your sources, mark what matters, turn it into recall, and walk into your exam calm. Everything stays private on this device.'),
      HC('div', { className: 'hca9-cta' },
        due.length
          ? HCABtn(`Review ${due.length} card${due.length === 1 ? '' : 's'}`, () => ctx.startReview(due), 'primary', 'play-fill')
          : book ? HCABtn('Continue reading', () => ctx.openBook(book.id), 'primary', 'book-open-line')
            : HCABtn('Add a source', () => ctx.setModal({ type: 'upload' }), 'primary', 'add-line'),
        HC('button', { type: 'button', className: 'hca9-ghost', onClick: () => HCA9Show('timer') }, HCAIcon('timer-line'), 'Start a focus session'),
        HC('button', { type: 'button', className: 'hca9-ghost', onClick: () => ctx.setModal({ type: 'upload' }) }, HCAIcon('upload-2-line'), 'Add a source')),
      HC('ul', { className: 'hca9-stats' }, stats.map((st, i) => HC('li', { key: i, style: { '--i': i } },
        HC('button', { type: 'button', onClick: st.go }, HCAIcon(st.icon), HC('strong', {}, typeof st.value === 'number' ? HC(HCA9CountUp, { value: st.value }) : st.value), HC('span', {}, st.label)))))),
    HC('div', { className: 'hca9-hero-visual', 'aria-hidden': 'true' },
      photo ? HC('img', { src: photo, alt: '', className: 'hca9-photo' }) : HC('div', { className: 'hca9-photo hca9-photo-empty' }),
      HC('div', { className: 'hca9-float f1' }, HC('span', { className: 'eyebrow' }, 'RECALL CARD'), HC('strong', {}, 'Which side of the heart feeds the lungs?'), HC('small', {}, 'Think first · tap to reveal')),
      HC('div', { className: 'hca9-float f2' }, HCAIcon('timer-line'), HC('strong', {}, '25:00'), HC('small', {}, 'Focus')),
      HC('div', { className: 'hca9-float f3' }, HCAIcon('heart-pulse-line'), HC('strong', {}, streak.current ? `${streak.current}-day streak` : 'Start your streak'))));
}

const HCA9Features = [
  { key: 'reader', icon: 'mark-pen-line', tone: 'teal', title: 'A reading room that thinks with you', text: 'Highlight in 12 colours, draw, pin sticky notes, snip, magnify and drop clinical stickers on any page.', cta: 'Open a source', go: ctx => { const s = ctx.state, b = s.books.find(x => x.id === s.lastBookId) || s.books[0]; b ? ctx.openBook(b.id) : ctx.setModal({ type: 'upload' }); } },
  { key: 'recall', icon: 'stack-line', tone: 'navy', title: 'Recall that adapts to your memory', text: 'Cards return just before you would forget them, scheduled by a modern memory model (FSRS).', cta: 'Open Study', go: ctx => ctx.navigate('studio') },
  { key: 'questions', icon: 'list-check', tone: 'copper', title: 'NCLEX-style practice from your pages', text: 'Turn a page into multiple choice, select all, ordering, true or false and highlight questions.', cta: 'Practise', go: ctx => ctx.navigate('studio') },
  { key: 'desk', icon: 'layout-column-line', tone: 'blue', title: 'A complete study desk', text: 'Board, canvas, focus timer, planner, blurt pad and lab values: in windows beside your reading.', cta: 'See the guide', go: () => HCA9OpenGuide('overview') },
  { key: 'meaning', icon: 'search-line', tone: 'purple', title: 'Meaning in 30 languages', text: 'Select a word for a plain definition from free, trusted sources, translated into your language.', cta: 'Try in the reader', go: ctx => { const s = ctx.state, b = s.books.find(x => x.id === s.lastBookId) || s.books[0]; b && ctx.openBook(b.id); } },
  { key: 'slides', icon: 'gallery-line', tone: 'pink', title: 'Slides become study pages', text: 'Open a PowerPoint as a searchable PDF, then present or export your work to PowerPoint and Word.', cta: 'Upload slides', go: ctx => ctx.setModal({ type: 'upload' }) },
  { key: 'techniques', icon: 'lightbulb-line', tone: 'green', title: 'Proven study techniques', text: 'Ten evidence-based methods told as one nurse’s story, each with a way to try it today.', cta: 'Read the story', go: () => HCA9Show('techniques') },
  { key: 'progress', icon: 'dashboard-line', tone: 'sand', title: 'See your learning take shape', text: 'Streaks, recall rate, NCLEX areas and a forecast of what is coming up next.', cta: 'View progress', go: ctx => ctx.navigate('progress') },
];

function HCA9FeatureTour() {
  const ctx = y();
  return HC('section', { className: 'hca9-features', 'aria-labelledby': 'hca9-features-title' },
    HC('div', { className: 'hca9-section-head' },
      HC('div', {}, HCAEyebrow('WHAT LUMEN CAN DO'), HC('h2', { id: 'hca9-features-title' }, 'Everything a clinical learner needs, ', HC('em', {}, 'in one quiet place.'))),
      HC('button', { type: 'button', className: 'hca3-chip action', onClick: () => ctx.setModal({ type: 'tour' }) }, HCAIcon('play-fill'), HC('span', {}, 'Take the tour'))),
    HC('ul', { className: 'hca9-bento' }, HCA9Features.map((f, i) => HC('li', { key: f.key, className: `hca9-tile tone-${f.tone} ${[0, 3, 6, 7].includes(i) ? 'wide' : ''}`, style: { '--i': i } },
      HC('button', { type: 'button', onClick: () => f.go(ctx) },
        HC('span', { className: 'hca9-tile-icon' }, HCAIcon(f.icon)),
        HC('strong', {}, f.title), HC('span', { className: 'hca9-tile-text' }, f.text),
        HC('span', { className: 'hca9-tile-cta' }, f.cta, HCAIcon('arrow-right-line')))))));
}

function HCA9SavedStrip() {
  const ctx = y(), s = ctx.state, [est, setEst] = _.useState(null);
  _.useEffect(() => { navigator.storage?.estimate?.().then(setEst).catch(() => {}); }, [s.books.length]);
  const items = s.notes.length + s.highlights.length + s.cards.length;
  return HC('section', { className: 'hca9-saved', 'aria-label': 'Where your work is saved' },
    HC('span', { className: 'hca9-saved-icon' }, HCAIcon('shield-check-line')),
    HC('div', { className: 'hca9-saved-copy' },
      HC('strong', {}, 'Your work is saved automatically, privately, in this browser.'),
      HC('span', {}, `${s.books.length} source${s.books.length === 1 ? '' : 's'} · ${items} notes, highlights and cards`, est?.usage ? ` · ${HCA9Bytes(est.usage)} used` : '', '. Back up now and then to keep a copy you can move to another computer.')),
    HC('div', { className: 'hca9-saved-actions' },
      HCABtn('Where is it saved?', () => HCA9Show('saved'), 'secondary', 'question-line'),
      HCABtn('Back up now', () => ctx.backupWorkspace(), 'secondary', 'download-line')));
}
const HCA9Bytes = n => n > 1e9 ? `${(n / 1e9).toFixed(1)} GB` : n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`;

ke = function HCA9Today() {
  const el = HCA9Prev.Today();
  const kids = [].concat(el.props.children).filter(k => !(k && k.props && /hca3-hero-toggle/.test(k.props.className || '')));
  return _.cloneElement(el, { className: `${el.props.className} hca9-today` }, HC(HCA9Hero, { key: 'hero' }), ...kids, HC(HCA9FeatureTour, { key: 'tour' }), HC(HCA9SavedStrip, { key: 'saved' }));
};

/* ---------- Your work and where it lives ---------- */
function HCA9Saved() {
  const ctx = y(), s = ctx.state, [est, setEst] = _.useState(null), [persisted, setPersisted] = _.useState(null);
  _.useEffect(() => { navigator.storage?.estimate?.().then(setEst).catch(() => {}); navigator.storage?.persisted?.().then(setPersisted).catch(() => {}); }, []);
  const protect = async () => {
    try { const ok = await navigator.storage.persist(); setPersisted(ok); ctx.toast(ok ? 'This browser will keep your Lumen work when it clears space.' : 'The browser said no for now. It often agrees after you use Lumen more, or bookmark it.'); }
    catch { ctx.toast('This browser does not offer this option.'); }
  };
  const rows = [
    ['book-2-line', 'Library files', 'Your PDFs, images and slides', `${s.books.length} source${s.books.length === 1 ? '' : 's'}`, 'Browser storage on this computer ("lumen.documents")'],
    ['sticky-note-line', 'Notes and highlights', 'Everything you mark, with its page', `${s.notes.length + s.highlights.length}`, 'Browser storage on this computer ("lumen.workspace")'],
    ['stack-line', 'Recall cards and reviews', 'Your cards and every rating', `${s.cards.length} cards`, 'Same workspace store'],
    ['layout-column-line', 'Study desk', 'Board, canvases, planner, focus log, blurts', `${(s.hcaBoard?.cards || []).length} tasks · ${(s.hcaCanvases || []).length} canvases`, 'Same workspace store'],
    ['edit-line', 'Ink, stickers and snips', 'Drawings and marks on pages', '', 'Same workspace store'],
    ['download-line', 'Backup file', 'One .json file with all of the above, files included', '', 'Your Downloads folder, when you press Back up'],
  ];
  return HC(HCA8Window, { id: 'saved', title: 'Your work and where it lives', icon: 'shield-check-line', className: 'hca9-saved-win', onClose: () => HCA8Close('saved') },
    HC('div', { className: 'hca9-store-diagram', 'aria-hidden': 'true' },
      HC('div', { className: 'node you' }, HCAIcon('edit-line'), HC('strong', {}, 'You study'), HC('small', {}, 'notes, cards, files')),
      HC('div', { className: 'flow' }, HC('span'), HC('small', {}, 'saved instantly')),
      HC('div', { className: 'node device' }, HCAIcon('shield-check-line'), HC('strong', {}, 'This browser'), HC('small', {}, 'private, on this computer')),
      HC('div', { className: 'flow' }, HC('span'), HC('small', {}, 'when you back up')),
      HC('div', { className: 'node file' }, HCAIcon('download-line'), HC('strong', {}, 'Backup file'), HC('small', {}, 'move it anywhere'))),
    HC('table', { className: 'hca9-store-table' },
      HC('thead', {}, HC('tr', {}, HC('th', {}, 'What'), HC('th', {}, 'You have'), HC('th', {}, 'Where it lives'))),
      HC('tbody', {}, rows.map(r => HC('tr', { key: r[1] }, HC('td', {}, HCAIcon(r[0]), HC('span', {}, HC('strong', {}, r[1]), HC('small', {}, r[2]))), HC('td', {}, r[3]), HC('td', {}, r[4]))))),
    HC('div', { className: 'hca9-callouts' },
      HC('div', { className: 'ok' }, HC('strong', {}, 'Good to know'),
        HC('ul', {}, HC('li', {}, 'Nothing is uploaded. Lumen has no account and no server copy of your study.'), HC('li', {}, 'Every change saves within a second. There is no Save button to forget.'), HC('li', {}, 'Close the tab or restart the computer: your work is still here next time.'))),
      HC('div', { className: 'warn' }, HC('strong', {}, 'When work can seem to disappear'),
        HC('ul', {}, HC('li', {}, 'Opening Lumen in a different browser, profile or computer: each has its own empty space. Restore your backup there.'), HC('li', {}, 'Clearing "cookies and site data" or "all browsing data" deletes it.'), HC('li', {}, 'Private or incognito windows forget everything when closed.'), HC('li', {}, 'Moving the Lumen file usually keeps your work in Chrome and Edge. Back up first to be safe.')))),
    HC('div', { className: 'hca9-store-meter' },
      HC('span', {}, est?.quota ? `Using ${HCA9Bytes(est.usage || 0)} of about ${HCA9Bytes(est.quota)} this browser allows.` : 'Storage size is not reported by this browser.'),
      est?.quota && HC('span', { className: 'hca3-meter wide' }, HC('span', { style: { width: `${Math.max(1, Math.min(100, (est.usage || 0) / est.quota * 100))}%` } })),
      HC('span', { className: 'hca-small' }, persisted === true ? 'Protected: the browser will not clear Lumen to free space.' : 'Not yet protected from automatic clean-up when the disk is nearly full.')),
    HC('div', { className: 'hca8-row' },
      HCABtn('Back up now', () => ctx.backupWorkspace(), 'primary', 'download-line'),
      HCABtn('Restore a backup', () => { HCA8Close('saved'); ctx.setModal({ type: 'settings' }); }, 'secondary', 'upload-2-line'),
      persisted !== true && navigator.storage?.persist && HCABtn('Protect from clean-up', protect, 'secondary', 'lock-line')),
    HC('p', { className: 'hca-small' }, 'Tip: back up once a week, and before changing computer or browser. Keep the file in your cloud drive or email it to yourself.'));
}

/* ---------- Study desk guide ---------- */
const HCA9Guide = [
  { id: 'board', icon: 'layout-column-line', name: 'Board', what: 'A Kanban board: cards for study tasks that move from To learn to Mastered.', how: ['Type a task in "Add a card" and press Enter.', 'Drag a card to the next column as you progress, or use the arrows.', 'Open a card to add a due date, an NCLEX area, a colour or a link to a page.'], when: ['Breaking a big topic (for example "Cardiac") into small tasks.', 'Tracking weak areas from a practice exam.', 'Seeing at a glance what is late or due today.'], tip: 'Keep "Learning" to 3 cards or fewer. Finishing beats starting.' },
  { id: 'canvas', icon: 'edit-line', name: 'Canvas', what: 'A whiteboard for concept maps, pathophysiology flows, SBAR and comparisons.', how: ['Pick a template, or start blank.', 'Double-click a note to write. Use Connect to draw arrows between notes.', 'Drag the background to move around, scroll to zoom, and export a PNG.'], when: ['After reading a chapter, to map how ideas connect.', 'Comparing two conditions that are easy to confuse.', 'Preparing a handover or a care plan.'], tip: 'Draw the map from memory first, then check the source. That is retrieval and elaboration together.' },
  { id: 'timer', icon: 'timer-line', name: 'Focus timer', what: 'Pomodoro-style focus sessions and breaks, with a log of your minutes.', how: ['Write what you will focus on (optional) and press Start.', 'Work until the chime, then take the break it offers.', 'Turn on focus sounds if silence or noise distracts you.'], when: ['Starting is hard: commit to just one session.', 'Long study days, to avoid fatigue.', 'Measuring real study time, not time at the desk.'], tip: 'The countdown shows in the sidebar and the browser tab, so you can close the window.' },
  { id: 'planner', icon: 'time-line', name: 'Planner', what: 'Your exam countdown, today at a glance, and a weekly study timetable.', how: ['Set your exam date.', 'Add study blocks for each day: time, length, subject and colour.', 'Export to your calendar (.ics) so reminders reach your phone.'], when: ['At the start of each week (Sunday evening works well).', 'When a shift pattern changes.', 'When the countdown says you need to speed up.'], tip: 'Plan short blocks you can keep. Four 30-minute blocks beat one 2-hour block you skip.' },
  { id: 'blurt', icon: 'brain-line', name: 'Blurt pad', what: 'Write everything you remember about a topic, then check what you missed against your own notes.', how: ['Type a topic, choose a time, and press Start.', 'Write fast, without looking anything up.', 'Check: Lumen shows key terms from your notes, which you recalled and which you missed.'], when: ['Right after reading, to lock it in.', 'The day before a quiz, to find gaps.', 'When rereading feels easy (that feeling misleads).'], tip: 'Send missed terms to your Board, then blurt again tomorrow.' },
  { id: 'labs', icon: 'heart-pulse-line', name: 'Lab values', what: 'Common adult reference ranges for NCLEX, with clinical cues and a quiz mode.', how: ['Search a value or browse by group.', 'Switch units between conventional (US) and SI (UK and international).', 'Turn on Quiz me to hide the numbers and test yourself.'], when: ['Answering a question that quotes a lab result.', 'A quick daily drill of 5 values.', 'Before a clinical shift.'], tip: 'Ranges vary between labs. In practice, always use your facility’s range.' },
  { id: 'techniques', icon: 'lightbulb-line', name: 'Techniques', what: 'Ten proven study techniques, told through one nurse’s story, with the evidence and a way to try each.', how: ['Read one chapter at a time.', 'Press "Try it in Lumen" to practise it straight away.', 'Come back when a method stops working for you.'], when: ['Starting your NCLEX preparation.', 'Feeling busy but not improving.', 'Planning how to study a hard topic.'], tip: 'Rereading and highlighting feel productive but help little on their own. Turn them into questions.' },
  { id: 'calc', icon: 'stethoscope-line', name: 'Calculator', what: 'A scientific and clinical calculator: dosage, drip rates, BMI and more.', how: ['Pick a clinical formula, or use the keypad.', 'Check the units shown next to each field.', 'Copy the result into a note.'], when: ['Dosage calculation practice.', 'Checking your working on a practice question.'], tip: 'Always estimate first, then calculate. A wildly different answer means a unit slipped.' },
];
const HCA9OpenGuide = topic => { HCA7Set(s => ({ desk: { ...(s.desk || {}), guide: true }, guideTopic: topic })); };

function HCA9GuideWin() {
  const ui = HCA7Use(), topic = ui.guideTopic || 'overview', ctx = y();
  const set = t => HCA7Set({ guideTopic: t });
  const g = HCA9Guide.find(x => x.id === topic);
  const open = id => id === 'calc' ? HCA7Set({ calc: true }) : HCA9Show(id);
  const flow = [
    ['time-line', 'Plan', 'planner', 'Pick today’s block'], ['timer-line', 'Focus', 'timer', '25 minutes, phone away'], ['book-open-line', 'Read and mark', null, 'Highlight what matters'],
    ['edit-line', 'Map it', 'canvas', 'Connect the ideas'], ['brain-line', 'Blurt', 'blurt', 'Recall without looking'], ['layout-column-line', 'Track', 'board', 'Move cards, log gaps'], ['stack-line', 'Recall', 'studio', 'Review due cards']];
  return HC(HCA8Window, { id: 'guide', title: 'Study desk guide', icon: 'question-line', className: 'hca9-guide-win', onClose: () => HCA8Close('guide') },
    HC('nav', { className: 'hca9-guide-tabs', 'aria-label': 'Guide topics' },
      HC('button', { type: 'button', 'aria-pressed': topic === 'overview', onClick: () => set('overview') }, HCAIcon('home-5-line'), 'Start here'),
      HCA9Guide.map(x => HC('button', { key: x.id, type: 'button', 'aria-pressed': topic === x.id, onClick: () => set(x.id) }, HCAIcon(x.icon), x.name))),
    !g ? HC('div', { className: 'hca9-guide-overview' },
      HC('div', { className: 'hca9-guide-intro' },
        HC('h3', {}, 'What is the Study desk?'),
        HC('p', {}, 'The tools a learner keeps next to their books: a board for tasks, a whiteboard, a timer, a timetable, a blurt pad, lab values and a calculator. Each opens in a window you can drag, resize or maximise, so your page stays in view.')),
      HC('h4', {}, 'A study session, start to finish'),
      HC('ol', { className: 'hca9-flow' }, flow.map(([icon, label, id, hint], i) => HC('li', { key: label, style: { '--i': i } },
        HC('button', { type: 'button', onClick: () => id === 'studio' ? ctx.navigate('studio') : id ? open(id) : ctx.navigate('library') },
          HC('span', { className: 'hca9-flow-dot' }, HCAIcon(icon)), HC('strong', {}, `${i + 1}. ${label}`), HC('small', {}, hint))))),
      HC('div', { className: 'hca9-when-grid' },
        [['Ten minutes free', 'Review due cards, or one blurt.'], ['An hour', 'Plan → two focus sessions → blurt → review.'], ['A study day', 'Planner first, then focus sessions with a canvas per topic, and a board check at the end.'], ['Exam week', 'Lab values drill, review only, light canvases. Sleep counts as study.']]
          .map(([h, p]) => HC('div', { key: h }, HC('strong', {}, h), HC('span', {}, p)))))
      : HC('article', { className: 'hca9-guide-topic' },
        HC('header', {}, HC('span', { className: 'hca9-guide-icon' }, HCAIcon(g.icon)), HC('div', {}, HC('h3', {}, g.name), HC('p', {}, g.what)), HCABtn(`Open ${g.name}`, () => open(g.id), 'primary', 'arrow-right-up-line')),
        HC('div', { className: 'hca9-guide-cols' },
          HC('section', {}, HC('h4', {}, HCAIcon('list-ordered'), 'How to use it'), HC('ol', {}, g.how.map(t => HC('li', { key: t }, t)))),
          HC('section', {}, HC('h4', {}, HCAIcon('time-line'), 'When to use it'), HC('ul', {}, g.when.map(t => HC('li', { key: t }, t))))),
        HC('p', { className: 'hca9-tip' }, HCAIcon('lightbulb-line'), HC('span', {}, HC('strong', {}, 'Tip: '), g.tip))));
}

/* ---------- Study techniques: one learner's story ---------- */
const HCA9Tech = [
  { id: 'retrieval', name: 'Retrieval practice', tag: 'Pull it out of memory', evidence: 'High', story: 'Amira had read the cardiac chapter three times. It felt familiar, so she felt ready. Then a practice question asked which heart failure causes pulmonary oedema, and her mind went blank. Familiar is not the same as remembered. So she closed the book and wrote down everything she could recall. It was half a page. It was also the moment she started learning.', why: 'Each time you pull an idea out of memory, the path to it gets stronger. Testing yourself beats rereading for long-term memory, even when it feels harder.', cite: 'Roediger and Karpicke, 2006; Dunlosky et al., 2013 (rated high utility).', steps: ['Close the source.', 'Write, say or draw everything you remember.', 'Check, and fix what you missed.'], tries: [['Blurt pad', 'blurt'], ['Review cards', 'review']] },
  { id: 'spacing', name: 'Spaced repetition', tag: 'Little and often, over days', evidence: 'High', story: 'Her old habit was the night-before cram. Now Amira reviews twenty cards with her morning coffee. Some come back tomorrow, others in two weeks. The cards she nearly forgot return just in time, so each review costs less, and the knowledge lasts past the exam into her first ward.', why: 'Memory fades on a curve. Reviewing just as it fades resets the curve at a higher level. The same total time spread over days beats one long session.', cite: 'Cepeda et al., 2006; Dunlosky et al., 2013 (rated high utility).', steps: ['Make a card for each key fact.', 'Review whatever is due, every day.', 'Rate honestly: Again when you forgot.'], tries: [['Open Study', 'studio']] },
  { id: 'interleave', name: 'Interleaving', tag: 'Mix the topics', evidence: 'Moderate', story: 'Blocks of 30 cardiac questions felt smooth. Then the mock exam mixed cardiac with renal and endocrine, and Amira kept picking the wrong frame. So she started mixing on purpose: one cardiac, one renal, one diabetes. Harder at first. But now she asks herself "what kind of problem is this?", and that is the skill the exam tests.', why: 'Mixing related topics trains you to tell them apart and to choose the right approach, not just repeat the last one.', cite: 'Rohrer and Taylor, 2007; Dunlosky et al., 2013 (moderate utility).', steps: ['Pick 2 or 3 related topics.', 'Alternate questions between them.', 'Before answering, name the topic first.'], tries: [['Practice in Study', 'studio']] },
  { id: 'elaborate', name: 'Elaboration', tag: 'Ask why and how', evidence: 'Moderate', story: 'Instead of memorising "furosemide: watch potassium", Amira asked why. It blocks reabsorption in the loop of Henle; more sodium reaches the distal tubule, where it is swapped for potassium, and potassium is lost. Now the fact has roots, and she can work out the next question too.', why: 'Linking a new fact to what you already know gives it more ways back into memory, and builds the understanding clinical questions need.', cite: 'Pressley et al., 1987; Dunlosky et al., 2013 (moderate utility).', steps: ['Read a fact.', 'Ask "why is this true?" and "how does it connect?".', 'Draw the chain on a canvas.'], tries: [['Pathophysiology canvas', 'canvas']] },
  { id: 'explain', name: 'Explain it simply', tag: 'The Feynman way', evidence: 'Moderate', story: 'Amira tried to explain acid–base balance to her younger brother. She got stuck at "compensation" and realised she only knew the words. She went back, simplified, and tried again until a 14-year-old could follow. The gaps she found were the exact questions she later met in the exam.', why: 'Explaining in your own words exposes gaps you cannot see while reading. Expecting to teach also makes you organise ideas better.', cite: 'Chi et al., 1994 (self-explanation); Nestojko et al., 2014.', steps: ['Pick one concept.', 'Explain it in plain words, as if to a beginner.', 'Where you stumble, go back to the source.'], tries: [['Blurt pad', 'blurt'], ['Methods', 'methods']] },
  { id: 'dual', name: 'Dual coding', tag: 'Words and pictures together', evidence: 'Moderate', story: 'Pages of text on heart blood flow blurred together. So Amira drew it: four boxes, arrows, blue for deoxygenated, red for oxygenated. In the exam she did not recall a sentence; she saw her drawing, and followed the arrows to the answer.', why: 'Memory has separate routes for words and for images. Using both gives two ways to recall the same idea.', cite: 'Paivio, 1986; Mayer, 2009 (multimedia learning).', steps: ['Turn a process into a simple diagram.', 'Label it in your own words.', 'Redraw it from memory later.'], tries: [['Canvas', 'canvas']] },
  { id: 'examples', name: 'Concrete cases', tag: 'From rule to patient', evidence: 'Promising', story: '"Hyperkalaemia causes arrhythmias" stayed abstract until Amira wrote a mini case: Mr B, 68, kidney failure, potassium 6.2, peaked T waves. What do you do first? Cases turn rules into decisions, which is exactly how NCLEX asks its questions.', why: 'Varied, concrete examples help you recognise a principle in new situations, instead of only in the words you learned it in.', cite: 'Rawson et al., 2015.', steps: ['Take one rule.', 'Write two short patient cases where it applies.', 'Add one case where it does not.'], tries: [['SBAR canvas', 'canvas']] },
  { id: 'focus', name: 'Focused sessions', tag: 'Short sprints, real breaks', evidence: 'Practical', story: 'After night shifts, three-hour sessions turned into scrolling. Amira switched to 25 minutes of focus with the phone in another room, then five minutes to stretch. Four sessions a day felt possible, and her real study time doubled.', why: 'Attention fades with time on task. Short, planned breaks restore it, and a timer makes it easier to start.', cite: 'Ariga and Lleras, 2011 (brief breaks and vigilance); Cirillo, Pomodoro Technique.', steps: ['Choose one task.', 'Focus until the chime, no switching.', 'Take the break away from the screen.'], tries: [['Focus timer', 'timer']] },
  { id: 'calibrate', name: 'Know what you know', tag: 'Predict, then check', evidence: 'Moderate', story: 'Amira used to rate cards "Good" if the answer looked familiar. Now she says her answer out loud first, then checks. Her ratings dropped, then her scores rose, because she finally studied what she did not know.', why: 'Learners often overestimate what they know. Judging after a real attempt, not after a glance, makes your study time go where it is needed.', cite: 'Dunlosky and Rawson, 2012.', steps: ['Answer before you reveal.', 'Rate honestly: Again, Hard, Good or Easy.', 'Check Progress for weak NCLEX areas.'], tries: [['Progress', 'progress']] },
  { id: 'plan', name: 'If–then plans', tag: 'Decide when and where', evidence: 'Moderate', story: '"I will study more" never happened. "If I finish my shift on Tuesday, then I review cards on the bus" did. Amira put the blocks in her calendar, and on hard days the plan decided for her.', why: 'Linking a study task to a specific time and place makes it far more likely to happen, because the cue triggers the action.', cite: 'Gollwitzer and Sheeran, 2006 (meta-analysis).', steps: ['Write: "If [time and place], then I [task]".', 'Add it as a block in the Planner.', 'Export it to your phone calendar.'], tries: [['Planner', 'planner']] },
];

function HCA9TechArt({ id }) {
  const P = (d, cls = '') => HC('path', { d, className: cls });
  const art = {
    retrieval: [HC('rect', { key: 1, x: 40, y: 30, width: 70, height: 100, rx: 8, className: 'fill-soft' }), P('M55 55h40M55 72h30M55 89h36', 'line'), HC('circle', { key: 2, cx: 170, cy: 80, r: 38, className: 'fill-teal' }), P('M150 80h40M178 66l14 14-14 14', 'line white'), P('M112 80h22', 'line dash')],
    spacing: [P('M30 130V30M30 130h190', 'axis'), P('M34 40 Q60 110 80 118', 'line draw'), P('M80 50 Q110 100 130 108', 'line draw d2'), P('M130 58 Q165 88 210 92', 'line draw d3'), HC('circle', { key: 3, cx: 80, cy: 50, r: 6, className: 'fill-teal' }), HC('circle', { key: 4, cx: 130, cy: 58, r: 6, className: 'fill-teal' })],
    interleave: [0, 1, 2, 3, 4, 5].map(i => HC('rect', { key: i, x: 30 + i * 32, y: 60, width: 26, height: 40, rx: 5, className: ['fill-teal', 'fill-copper', 'fill-navy'][i % 3] + ' bob', style: { animationDelay: `${i * .15}s` } })),
    elaborate: [HC('circle', { key: 1, cx: 120, cy: 80, r: 22, className: 'fill-teal' }), ...[[50, 40], [190, 40], [50, 125], [190, 125]].map(([x, yy], i) => HC('g', { key: i }, HC('line', { x1: 120, y1: 80, x2: x, y2: yy, className: 'line' }), HC('circle', { cx: x, cy: yy, r: 14, className: 'fill-soft pop', style: { animationDelay: `${i * .2}s` } })))],
    explain: [HC('rect', { key: 1, x: 30, y: 30, width: 120, height: 80, rx: 6, className: 'fill-navy' }), P('M45 55h60M45 72h80M45 89h40', 'line white'), HC('circle', { key: 2, cx: 190, cy: 70, r: 18, className: 'fill-copper' }), P('M170 130c0-22 40-22 40 0', 'fill-copper')],
    dual: [HC('rect', { key: 1, x: 30, y: 40, width: 80, height: 80, rx: 8, className: 'fill-soft' }), P('M45 60h50M45 76h40M45 92h46', 'line'), P('M118 80h16', 'line'), P('M150 60 l20 -15 l20 15 v35 h-40z', 'fill-teal'), HC('circle', { key: 2, cx: 205, cy: 60, r: 12, className: 'fill-copper' })],
    examples: [HC('rect', { key: 1, x: 30, y: 45, width: 70, height: 70, rx: 35, className: 'fill-soft' }), P('M120 80h30M140 70l10 10-10 10', 'line'), HC('rect', { key: 2, x: 165, y: 40, width: 50, height: 80, rx: 6, className: 'fill-teal' }), P('M175 60h30M175 76h22M175 92h28', 'line white')],
    focus: [HC('circle', { key: 1, cx: 120, cy: 82, r: 50, className: 'fill-soft' }), HC('circle', { key: 2, cx: 120, cy: 82, r: 50, className: 'ring draw' }), P('M120 82V50M120 82l20 12', 'line'), HC('rect', { key: 3, x: 110, y: 20, width: 20, height: 10, rx: 3, className: 'fill-teal' })],
    calibrate: [P('M50 120a70 70 0 0 1 140 0', 'axis'), P('M120 120 L160 70', 'line needle'), HC('circle', { key: 1, cx: 120, cy: 120, r: 7, className: 'fill-navy' }), HC('text', { key: 2, x: 50, y: 140, className: 'lbl' }, 'guess'), HC('text', { key: 3, x: 165, y: 140, className: 'lbl' }, 'know')],
    plan: [HC('rect', { key: 1, x: 40, y: 30, width: 160, height: 110, rx: 8, className: 'fill-soft' }), P('M40 55h160', 'line'), ...[0, 1, 2, 3].map(i => HC('rect', { key: `b${i}`, x: 52 + i * 37, y: 68 + (i % 2) * 28, width: 30, height: 20, rx: 4, className: (i % 2 ? 'fill-copper' : 'fill-teal') + ' pop', style: { animationDelay: `${i * .15}s` } }))],
  }[id] || [];
  return HC('svg', { viewBox: '0 0 240 160', className: 'hca9-art', 'aria-hidden': 'true' }, art);
}

function HCA9Techniques() {
  const ctx = y(), [i, setI] = _.useState(0), t = HCA9Tech[i];
  const go = target => {
    if (target === 'review') { const due = we(ctx.state.cards); return due.length ? ctx.startReview(due) : ctx.navigate('studio'); }
    if (['studio', 'progress', 'methods'].includes(target)) return ctx.navigate(target);
    HCA9Show(target);
  };
  return HC(HCA8Window, { id: 'techniques', title: 'Study techniques that work', icon: 'lightbulb-line', className: 'hca9-tech-win', onClose: () => HCA8Close('techniques') },
    HC('ol', { className: 'hca9-chapters', 'aria-label': 'Chapters' }, HCA9Tech.map((x, n) => HC('li', { key: x.id },
      HC('button', { type: 'button', 'aria-current': n === i ? 'step' : undefined, className: n < i ? 'seen' : '', onClick: () => setI(n), title: x.name }, HC('span', {}, n + 1), HC('em', {}, x.name))))),
    HC('article', { className: 'hca9-chapter', key: t.id, onKeyDown: e => { if (e.key === 'ArrowRight') setI(Math.min(HCA9Tech.length - 1, i + 1)); if (e.key === 'ArrowLeft') setI(Math.max(0, i - 1)); } },
      HC('div', { className: 'hca9-chapter-art' }, HC(HCA9TechArt, { id: t.id }), HC('span', { className: `hca9-evidence ${t.evidence.toLowerCase()}` }, `Evidence: ${t.evidence}`)),
      HC('div', { className: 'hca9-chapter-copy' },
        HC('span', { className: 'eyebrow' }, `CHAPTER ${i + 1} OF ${HCA9Tech.length} · ${t.tag.toUpperCase()}`),
        HC('h3', {}, t.name),
        HC('p', { className: 'hca9-story' }, t.story),
        HC('div', { className: 'hca9-why' }, HC('strong', {}, 'Why it works'), HC('p', {}, t.why), HC('small', {}, t.cite)),
        HC('ol', { className: 'hca9-steps3' }, t.steps.map((s, n) => HC('li', { key: s, style: { '--i': n } }, s))),
        HC('div', { className: 'hca8-row' }, t.tries.map(([label, target], n) => HCABtn(`Try it: ${label}`, () => go(target), n ? 'secondary' : 'primary', 'arrow-right-up-line', { key: label }))))),
    HC('div', { className: 'hca9-chapter-nav' },
      HCABtn('Previous', () => setI(Math.max(0, i - 1)), 'secondary', 'arrow-left-line', { disabled: i === 0 }),
      HC('span', { className: 'hca-small' }, i === HCA9Tech.length - 1 ? 'Myth check: rereading and highlighting feel productive but were rated low utility on their own. Use them as a start, then test yourself.' : 'Use ← and → to move between chapters.'),
      HCABtn(i === HCA9Tech.length - 1 ? 'Back to the start' : 'Next chapter', () => setI(i === HCA9Tech.length - 1 ? 0 : i + 1), 'primary', 'arrow-right-line')));
}

/* ---------- Blurt pad: write from memory, then check against your own notes ---------- */
const HCA9Stop = new Set('about above after again against because been before being below between both cannot could does doing down during each from further have having here into itself just more most other over same should some such than that their them then there these they this those through under until very were what when where which while will with would your yours patient patients nurse nursing client clients often usually also therefore however page note notes source supplies supply determine determines variables variable basic equation considered consider describe explain define means meaning called known example important following correct answer question'.split(' '));
function HCA9Terms(texts) {
  const counts = new Map();
  for (const t of texts) for (const w of String(t).toLowerCase().match(/[a-z][a-z-]{4,}/g) || []) if (!HCA9Stop.has(w)) counts.set(w, (counts.get(w) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18).map(e => e[0]);
}
function HCA9Related(s, topic) {
  const words = topic.toLowerCase().match(/[a-z0-9]{3,}/g) || [];
  if (!words.length) return [];
  const fields = x => ['text', 'note', 'body', 'content', 'quote', 'question', 'answer', 'comment', 'title'].map(k => typeof x[k] === 'string' ? x[k] : '').join(' ');
  return [...s.notes, ...s.highlights, ...s.cards].map(fields).filter(t => { const l = t.toLowerCase(); return words.some(w => l.includes(w)); });
}
function HCA9Blurt() {
  const ctx = y(), s = ctx.state;
  const [topic, setTopic] = _.useState(''), [mins, setMins] = _.useState(5), [text, setText] = _.useState('');
  const [phase, setPhase] = _.useState('setup'), [endsAt, setEndsAt] = _.useState(0), [, tick] = _.useState(0);
  _.useEffect(() => { if (phase !== 'write') return; const t = setInterval(() => { tick(n => n + 1); if (Date.now() >= endsAt) { setPhase('check'); HCA8Beep(); } }, 500); return () => clearInterval(t); }, [phase, endsAt]);
  const related = phase === 'check' ? HCA9Related(s, topic) : [];
  const terms = phase === 'check' ? HCA9Terms(related).filter(w => !topic.toLowerCase().includes(w)) : [];
  const lower = text.toLowerCase(), hit = terms.filter(w => lower.includes(w.slice(0, Math.max(5, w.length - 2)))), miss = terms.filter(w => !hit.includes(w));
  const pct = terms.length ? Math.round(hit.length / terms.length * 100) : null;
  const finish = () => {
    ctx.setState(st => ({ ...st, hcaBlurts: [...(st.hcaBlurts || []).slice(-49), { id: ue(), at: Date.now(), topic: topic.trim(), text, coverage: pct, missed: miss }] }));
    ctx.toast('Blurt saved.'); setPhase('setup'); setText('');
  };
  const toBoard = () => {
    ctx.setState(st => { const b = HCA8BoardOf(st); return { ...st, hcaBoard: { ...b, cards: [...b.cards, { id: ue(), col: b.columns[0].id, title: `Revisit: ${topic.trim()}`.slice(0, 200), note: `Missed in blurt: ${miss.join(', ')}`, due: '', cat: '', color: '#e0711b', createdAt: Date.now() }] } }; });
    ctx.toast('Added to your Board.');
  };
  const history = (s.hcaBlurts || []).slice(-5).reverse();
  return HC(HCA8Window, { id: 'blurt', title: 'Blurt pad', icon: 'brain-line', className: 'hca9-blurt-win', onClose: () => HCA8Close('blurt') },
    phase === 'setup' && HC(_.Fragment, {},
      HC('p', { className: 'hca9-lead' }, 'Write everything you remember about one topic, without looking. Then Lumen compares it with your own notes, highlights and cards.'),
      HC('div', { className: 'hca8-row' },
        HC('input', { className: 'hca8-label grow', value: topic, placeholder: 'Topic, e.g. heart failure', 'aria-label': 'Topic', onKeyDown: e => e.stopPropagation(), onChange: e => setTopic(e.target.value) }),
        HC('select', { value: mins, 'aria-label': 'Time', className: 'hca8-label', onChange: e => setMins(Number(e.target.value)) }, [2, 3, 5, 10].map(m => HC('option', { key: m, value: m }, `${m} min`))),
        HCABtn('Start', () => { setEndsAt(Date.now() + mins * 60000); setPhase('write'); }, 'primary', 'play-fill', { disabled: !topic.trim() })),
      history.length > 0 && HC('div', { className: 'hca9-history' }, HC('strong', {}, 'Recent blurts'),
        HC('ul', {}, history.map(h => HC('li', { key: h.id }, HC('span', {}, h.topic), HC('small', {}, new Date(h.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })), h.coverage != null && HC('b', {}, `${h.coverage}%`)))))),
    phase === 'write' && HC(_.Fragment, {},
      HC('div', { className: 'hca8-row' }, HC('strong', { className: 'grow' }, topic), HC('span', { className: 'hca9-clock' }, HCA8Fmt(Math.max(0, (endsAt - Date.now()) / 1000))), HCABtn('Check now', () => setPhase('check'), 'secondary', 'check-line')),
      HC('textarea', { className: 'hca9-blurt-text', autoFocus: true, value: text, placeholder: 'Write fast. Key words, causes, signs, nursing actions, drugs… anything.', onKeyDown: e => e.stopPropagation(), onChange: e => setText(e.target.value) }),
      HC('span', { className: 'hca-small' }, `${(text.match(/\S+/g) || []).length} words`)),
    phase === 'check' && HC(_.Fragment, {},
      HC('div', { className: 'hca9-coverage' },
        pct === null ? HC('p', {}, related.length ? 'Not enough key terms in your notes to compare.' : `No notes, highlights or cards mention "${topic}" yet. Compare with your source instead, then add a note so next time Lumen can check for you.`)
          : HC(_.Fragment, {}, HC('div', { className: 'hca9-ring', style: { '--p': pct } }, HC('strong', {}, `${pct}%`)),
            HC('div', {}, HC('strong', {}, `You recalled ${hit.length} of ${terms.length} key terms from ${related.length} of your notes and cards.`), HC('span', { className: 'hca-small' }, pct >= 70 ? 'Strong recall. Blurt again in a few days.' : 'Gaps are where learning happens. Review the missed terms, then blurt again tomorrow.')))),
      terms.length > 0 && HC('div', { className: 'hca9-terms' }, hit.map(w => HC('span', { key: w, className: 'hit' }, HCAIcon('check-line'), w)), miss.map(w => HC('span', { key: w, className: 'miss' }, w))),
      HC('details', { className: 'hca8-settings' }, HC('summary', {}, 'What you wrote'), HC('p', { className: 'hca9-wrote' }, text || '—')),
      HC('div', { className: 'hca8-row' },
        HCABtn('Save and finish', finish, 'primary', 'check-line'),
        miss.length > 0 && HCABtn('Add missed terms to Board', toBoard, 'secondary', 'layout-column-line'),
        HCABtn('Try again', () => { setText(''); setEndsAt(Date.now() + mins * 60000); setPhase('write'); }, 'secondary', 'restart-line'))));
}

/* ---------- Lab values ---------- */
const HCA9LabNote = 'Typical adult reference ranges as commonly taught for NCLEX. Ranges vary by laboratory, textbook and country: in practice, always use your facility’s reference range.';
const HCA9Labs = [
  ['Electrolytes', [
    ['Sodium (Na⁺)', '135–145 mEq/L', '135–145 mmol/L', 'Low or high: confusion, seizures. Correct slowly.'],
    ['Potassium (K⁺)', '3.5–5.0 mEq/L', '3.5–5.0 mmol/L', 'Low or high: arrhythmias. Check the ECG. Never IV push.'],
    ['Chloride (Cl⁻)', '98–106 mEq/L', '98–106 mmol/L', 'Usually moves with sodium.'],
    ['Calcium, total', '9.0–10.5 mg/dL', '2.25–2.62 mmol/L', 'Low: tetany, Chvostek and Trousseau signs.'],
    ['Magnesium', '1.3–2.1 mEq/L', '0.65–1.05 mmol/L', 'High: weak reflexes, slow breathing.'],
    ['Phosphate', '3.0–4.5 mg/dL', '0.97–1.45 mmol/L', 'Moves opposite to calcium.']]],
  ['Kidney', [
    ['BUN / urea', '10–20 mg/dL', '3.6–7.1 mmol/L (urea)', 'Rises with dehydration, bleeding, kidney injury.'],
    ['Creatinine', '0.6–1.2 mg/dL', '53–106 µmol/L', 'The key routine marker of kidney function.'],
    ['Urine specific gravity', '1.005–1.030', '1.005–1.030', 'High: concentrated (dehydration).']]],
  ['Blood count', [
    ['Haemoglobin (male)', '14–18 g/dL', '140–180 g/L', 'Low: anaemia, bleeding.'],
    ['Haemoglobin (female)', '12–16 g/dL', '120–160 g/L', 'Low: anaemia, bleeding.'],
    ['Haematocrit (male)', '42–52%', '0.42–0.52', 'High with dehydration.'],
    ['Haematocrit (female)', '37–47%', '0.37–0.47', 'High with dehydration.'],
    ['White cells (WBC)', '5,000–10,000/mm³', '5–10 × 10⁹/L', 'Low: infection risk. High: infection, inflammation.'],
    ['Platelets', '150,000–400,000/mm³', '150–400 × 10⁹/L', 'Below 50,000: bleeding precautions.']]],
  ['Clotting', [
    ['PT', '11–12.5 seconds', '11–12.5 seconds', 'Monitors warfarin, with the INR.'],
    ['INR', '0.8–1.1', '0.8–1.1', 'On warfarin, a usual target is 2–3.'],
    ['aPTT', '30–40 seconds', '30–40 seconds', 'Monitors heparin: often 1.5–2.5 × control.']]],
  ['Blood gases (arterial)', [
    ['pH', '7.35–7.45', '7.35–7.45', 'Below 7.35 acidosis, above 7.45 alkalosis.'],
    ['PaCO₂', '35–45 mmHg', '4.7–6.0 kPa', 'The respiratory part. Opposite direction to pH means respiratory.'],
    ['HCO₃⁻', '22–26 mEq/L', '22–26 mmol/L', 'The metabolic part. Same direction as pH means metabolic.'],
    ['PaO₂', '80–100 mmHg', '10.7–13.3 kPa', 'Oxygenation.'],
    ['SaO₂', '95–100%', '95–100%', 'Lower targets apply in some COPD patients.']]],
  ['Glucose and metabolic', [
    ['Glucose, fasting', '70–100 mg/dL', '3.9–5.6 mmol/L', 'Below 70 mg/dL (3.9): treat hypoglycaemia (rule of 15).'],
    ['HbA1c', 'Below 5.7%', 'Below 39 mmol/mol', '6.5% (48) or more: diabetes range.'],
    ['Albumin', '3.5–5.0 g/dL', '35–50 g/L', 'Low: oedema, poor nutrition, liver disease.']]],
  ['Liver', [
    ['Bilirubin, total', '0.3–1.0 mg/dL', '5–17 µmol/L', 'High: jaundice.'],
    ['ALT', '4–36 U/L', '4–36 U/L', 'Liver cell injury.'],
    ['AST', '0–35 U/L', '0–35 U/L', 'Liver and muscle injury.'],
    ['Ammonia', '15–45 µg/dL', '11–32 µmol/L', 'High: confusion (hepatic encephalopathy). Lactulose.']]],
  ['Lipids', [
    ['Total cholesterol', 'Below 200 mg/dL', 'Below 5.2 mmol/L', ''],
    ['LDL', 'Below 100 mg/dL (optimal)', 'Below 2.6 mmol/L', '"Lousy": lower is better.'],
    ['HDL', '40 mg/dL or more', '1.0 mmol/L or more', '"Healthy": higher is better.'],
    ['Triglycerides', 'Below 150 mg/dL', 'Below 1.7 mmol/L', '']]],
  ['Drug levels', [
    ['Digoxin', '0.5–2.0 ng/mL', '0.6–2.6 nmol/L', 'Toxicity: nausea, visual halos, bradycardia. Check apical pulse.'],
    ['Lithium', '0.6–1.2 mEq/L', '0.6–1.2 mmol/L', 'Above 1.5: toxicity (vomiting, tremor, confusion).'],
    ['Phenytoin', '10–20 mcg/mL', '40–80 µmol/L', 'Toxicity: nystagmus, ataxia.'],
    ['Theophylline', '10–20 mcg/mL', '55–110 µmol/L', 'Toxicity: tachycardia, seizures.'],
    ['Magnesium sulfate (pre-eclampsia)', '4–7 mEq/L', '2–3.5 mmol/L', 'Check reflexes and breathing. Antidote: calcium gluconate.']]],
  ['Vital signs (adult)', [
    ['Heart rate', '60–100 /min', '60–100 /min', ''],
    ['Respiratory rate', '12–20 /min', '12–20 /min', 'Count for a full minute if irregular.'],
    ['Blood pressure', 'Below 120/80 mmHg', 'Below 120/80 mmHg', ''],
    ['Temperature', '36.5–37.5 °C', '97.7–99.5 °F', ''],
    ['SpO₂', '95–100%', '95–100%', '']]],
];
function HCA9LabsWin() {
  const [q, setQ] = _.useState(''), [si, setSi] = _.useState(false), [quiz, setQuiz] = _.useState(false), [shown, setShown] = _.useState({});
  const ql = q.trim().toLowerCase();
  const groups = HCA9Labs.map(([g, rows]) => [g, rows.filter(r => !ql || `${g} ${r.join(' ')}`.toLowerCase().includes(ql))]).filter(g => g[1].length);
  return HC(HCA8Window, { id: 'labs', title: 'Lab values', icon: 'heart-pulse-line', className: 'hca9-labs-win', onClose: () => HCA8Close('labs') },
    HC('div', { className: 'hca8-row' },
      HC('input', { className: 'hca8-search grow', value: q, placeholder: 'Search: potassium, INR, ABG…', 'aria-label': 'Search lab values', onKeyDown: e => e.stopPropagation(), onChange: e => setQ(e.target.value) }),
      HC('div', { className: 'hca9-seg', role: 'group', 'aria-label': 'Units' },
        HC('button', { type: 'button', 'aria-pressed': !si, onClick: () => setSi(false) }, 'US units'), HC('button', { type: 'button', 'aria-pressed': si, onClick: () => setSi(true) }, 'SI units')),
      HC('button', { type: 'button', className: `hca8-tool ${quiz ? 'on' : ''}`, 'aria-pressed': quiz, onClick: () => { setQuiz(!quiz); setShown({}); } }, HCAIcon(quiz ? 'eye-off-line' : 'eye-line'), 'Quiz me')),
    HC('p', { className: 'hca9-labnote' }, HCAIcon('information-line'), HCA9LabNote),
    groups.map(([g, rows]) => HC('section', { key: g, className: 'hca9-labgroup' }, HC('h4', {}, g),
      HC('table', {}, HC('tbody', {}, rows.map(r => {
        const k = `${g}|${r[0]}`, hidden = quiz && !shown[k];
        return HC('tr', { key: r[0] }, HC('th', {}, r[0]),
          HC('td', { className: 'val' }, hidden ? HC('button', { type: 'button', className: 'hca9-reveal', onClick: () => setShown(x => ({ ...x, [k]: true })) }, 'Reveal') : (si ? r[2] : r[1])),
          HC('td', { className: 'cue' }, r[3]));
      }))))),
    !groups.length && HC('p', { className: 'hca-small' }, 'No match. Try another name.'));
}

/* ---------- Focus sounds (generated on the device, no downloads) ---------- */
const HCA9Snd = { ctx: null, src: null, gain: null, kind: 'off', vol: 0.35, subs: new Set() };
try { const saved = JSON.parse(localStorage.getItem('lumen.focusSound') || '{}'); if (saved.vol) HCA9Snd.vol = saved.vol; } catch { }
function HCA9Noise(ac, kind) {
  const len = ac.sampleRate * 4, buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch); let last = 0, b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else if (kind === 'white') d[i] = w * 0.5;
      else { b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11; }
    }
    // Fade the loop seam.
    for (let i = 0; i < 2000; i++) { d[i] *= i / 2000; d[len - 1 - i] *= i / 2000; }
  }
  return buf;
}
function HCA9SoundSet(kind, vol = HCA9Snd.vol) {
  HCA9Snd.vol = vol;
  try { localStorage.setItem('lumen.focusSound', JSON.stringify({ vol })); } catch { }
  if (HCA9Snd.gain) HCA9Snd.gain.gain.value = vol;
  if (kind !== HCA9Snd.kind) {
    try { HCA9Snd.src?.stop(); } catch { }
    HCA9Snd.src = null;
    if (kind !== 'off') {
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (AC) {
        HCA9Snd.ctx ||= new AC(); HCA9Snd.ctx.resume?.();
        const ac = HCA9Snd.ctx, src = ac.createBufferSource(); src.buffer = HCA9Noise(ac, kind === 'rain' ? 'pink' : kind); src.loop = true;
        HCA9Snd.gain ||= ac.createGain(); HCA9Snd.gain.gain.value = vol;
        let node = src;
        if (kind === 'rain') { const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 900; src.connect(f); node = f; }
        node.connect(HCA9Snd.gain); HCA9Snd.gain.connect(ac.destination); src.start(); HCA9Snd.src = src;
      }
    }
    HCA9Snd.kind = kind;
  }
  HCA9Snd.subs.forEach(f => f());
}
function HCA9SoundRow() {
  const [, force] = _.useState(0);
  _.useEffect(() => { const f = () => force(n => n + 1); HCA9Snd.subs.add(f); return () => HCA9Snd.subs.delete(f); }, []);
  const kinds = [['off', 'Off'], ['brown', 'Brown noise'], ['pink', 'Pink noise'], ['rain', 'Soft rain'], ['white', 'White noise']];
  return HC('div', { className: 'hca9-sounds' },
    HC('span', { className: 'hca9-sounds-label' }, HCAIcon(HCA9Snd.kind === 'off' ? 'volume-mute-line' : 'volume-up-line'), 'Focus sounds'),
    HC('div', { className: 'hca9-seg wrap', role: 'group', 'aria-label': 'Focus sound' }, kinds.map(([k, l]) => HC('button', { key: k, type: 'button', 'aria-pressed': HCA9Snd.kind === k, onClick: () => HCA9SoundSet(k) }, l))),
    HCA9Snd.kind !== 'off' && HC('input', { type: 'range', min: 0, max: 1, step: 0.05, value: HCA9Snd.vol, 'aria-label': 'Sound volume', onChange: e => HCA9SoundSet(HCA9Snd.kind, Number(e.target.value)) }));
}

/* ---------- Mount ---------- */
function HCA9Floats() {
  const d = HCA7Use().desk || {};
  return S.createPortal(HC(_.Fragment, {}, d.saved && HC(HCA9Saved), d.guide && HC(HCA9GuideWin), d.techniques && HC(HCA9Techniques), d.blurt && HC(HCA9Blurt), d.labs && HC(HCA9LabsWin)), document.body);
}
const HCA9PrevCommands = HCA3Commands;
HCA3Commands = function HCA9Commands(ctx) {
  return [...HCA9PrevCommands(ctx),
    { group: 'Study desk', icon: 'question-line', label: 'Study desk guide (what, how, when)', run: () => HCA9OpenGuide('overview') },
    { group: 'Study desk', icon: 'lightbulb-line', label: 'Study techniques that work', run: () => HCA9Show('techniques') },
    { group: 'Study desk', icon: 'brain-line', label: 'Blurt pad (write from memory)', run: () => HCA9Show('blurt') },
    { group: 'Study desk', icon: 'heart-pulse-line', label: 'Lab values (reference and quiz)', run: () => HCA9Show('labs') },
    { group: 'Your data', icon: 'shield-check-line', label: 'Where is my work saved?', run: () => HCA9Show('saved') }];
};
