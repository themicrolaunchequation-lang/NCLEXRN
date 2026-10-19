/*HCA11:BEGIN*/
/* HCA v11 — shared HCA shell + "My Day". Shares the bundle's module scope like the earlier layers
   (y = workspace context hook, HC = createElement, O = icon button, E = icon, we = due cards, ke = Today).
   The sidebar keeps its React markup (class names patched in by build-web.mjs); the shell script adds the Crown
   apps switcher, the account dock and the collapsible rail. */

const HCA11S = () => globalThis.HCAShell;
const HCA11GsKey = 'lumen.gs.dismissed', HCA11FoldKey = 'lumen.deskfold';
const HCA11Get = k => { try { return localStorage.getItem(k); } catch { return null; } };
const HCA11Put = (k, v) => { try { localStorage.setItem(k, v); } catch { } };
const HCA11FoldOpen = () => { const v = HCA11Get(HCA11FoldKey); return v === null ? innerHeight >= 1000 : v !== '0'; };
function HCA11Fold(open) { HCA11Put(HCA11FoldKey, open ? '1' : '0'); }

if (HCA11S()) HCA11S().init({
  app: 'lumen', name: 'Lumen', dayName: 'My Day', observe: 'body',
  sel: { side: '.app-sidebar', navs: ['.main-navigation'], content: '.app-main' },
  groups: [{ first: 'My Day', label: 'Start' }, { first: 'Library', label: 'Study' }, { first: 'Methods', label: 'Insights' }],
  motionOff: '[data-motion=reduced]'
});

const HCA11Tips = [
  ['Spaced retrieval', 'Test yourself a little each day. Cards return just before you would forget them.'],
  ['Interleaving', 'Mix topics inside one session. It feels harder and helps the ideas stick.'],
  ['Blurt it out', 'Write everything you remember on a blank page, then check what you missed.'],
  ['Explain it simply', 'If you can teach it in plain words, you probably understand it.'],
  ['Short, steady sessions', 'Twenty-five focused minutes beat a long, tired evening.']
];

function HCA11Data(s) {
  const goals = HCA3Goals(s), due = we(s.cards), days = HCA3Activity(s), streak = HCA3Streaks(days);
  const book = s.books.find(b => b.id === s.lastBookId) || s.books.find(b => b.kind !== 'demo') || s.books[0];
  const done = HCA3ReviewsSince(s, HCA3StartOfDay().getTime()), focus = HCA9FocusToday(s);
  const mine = s.books.filter(b => b.kind !== 'demo').length, made = s.cards.filter(c => !c.starter).length;
  return { goals, due, days, streak, book, done, focus, mine, made, examIn: HCA3DaysUntil(goals.examDate), reviews: (s.reviewLog || []).length, highlights: (s.highlights || []).length, notes: (s.notes || []).length };
}

function HCA11Day() {
  const ctx = y(), s = ctx.state, ref = _.useRef(null), live = _.useRef(ctx);
  live.current = ctx;
  const D = HCA11Data(s);
  const sig = [D.due.length, D.done, D.streak.current, D.focus, D.book?.id, D.book?.page, D.mine, D.made, D.highlights, D.goals.dailyReviews, D.examIn, [...D.days.keys()].join(',')].join('|');
  _.useEffect(() => {
    const S0 = HCA11S(), host = ref.current; if (!S0 || !host) return;
    const c = () => live.current, wh = S0.when(), first = '';
    const dueN = D.due.length, book = D.book, pct = book ? Math.round(((book.page || 1) / Math.max(1, book.count || 1)) * 100) : 0;
    const resuming = !dueN && book && (book.page || 1) > 1 && (book.page || 1) < (book.count || 1);
    const finished = (dueN === 0 && D.done > 0) || D.done >= D.goals.dailyReviews;
    const state = dueN ? 'start' : resuming ? 'resume' : finished ? 'done' : 'start';
    const h1 = state === 'done' ? 'That’s today <em>done.</em>' : state === 'resume' ? 'Pick up <em>where you stopped.</em>' : dueN ? 'Your next <em>moment of clarity.</em>' : D.mine ? 'A calm <em>place to begin.</em>' : 'Bring in <em>something to study.</em>';
    const lead = state === 'done' ? 'Lovely work. A focus session or a few practice questions keeps things warm.' : dueN ? `${dueN} recall ${dueN === 1 ? 'card is' : 'cards are'} ready, about ${Math.max(1, Math.ceil(dueN * 10 / 60))} min. Answer in your head first.` : resuming ? `You are on page ${book.page} of ${book.count} in ${book.title}.` : D.mine ? 'Choose where to start: read, mark what matters, then turn it into recall.' : 'Add a PDF or photos of your notes. Everything stays private on this device.';
    const primary = state === 'done' ? { label: 'Done ✓', arrow: false, onClick: () => { } }
      : dueN ? { label: `Review ${dueN} ${dueN === 1 ? 'card' : 'cards'}`, icon: 'play', onClick: () => c().startReview(D.due) }
      : resuming ? { label: `Resume · p.${book.page}/${book.count}`, icon: 'play', onClick: () => c().openBook(book.id) }
      : D.mine || book ? { label: 'Continue reading', icon: 'play', onClick: () => c().openBook(book.id) } : { label: 'Add a source', icon: 'play', onClick: () => c().setModal({ type: 'upload' }) };
    const secondary = state === 'done' ? { label: 'Bonus round', arrow: false, onClick: () => HCA9Show('timer') } : { label: 'Focus session', arrow: false, onClick: () => HCA9Show('timer') };
    const q = D.due[0]?.question;
    const art = `<div class="lm-scene" role="img" aria-label="An open book with a recall card lifting out of it"><div class="lm-book"><i class="lm-page lm-l"></i><i class="lm-page lm-r"></i><i class="lm-spine"></i><i class="lm-lines lm-ll"></i><i class="lm-lines lm-rl"></i></div><div class="lm-card"><span>RECALL CARD</span><b>${S0.esc(q ? q.slice(0, 80) : 'Your next card appears here')}</b><small>${q ? 'Think first · tap to reveal' : 'Highlight a sentence to make one'}</small></div><i class="lm-glint lm-g1"></i><i class="lm-glint lm-g2"></i></div>`;
    const hero = { eyebrow: wh.eyebrow, h1, lead, primary, secondary, art, meta: [{ icon: 'clock', text: dueN ? `${Math.max(1, Math.ceil(dueN * 10 / 60))} min` : '25 min focus' }, { icon: 'layers', text: `${dueN} due` }, ...(D.examIn !== null && D.examIn >= 0 ? [{ icon: 'target', text: `${D.examIn} days to ${D.goals.examName}` }] : [])] };
    const keys = new Set(D.days.keys()), week = S0.week(keys), fresh = !D.reviews && !D.streak.current && !D.focus && !D.notes && !D.highlights;
    const progress = {
      eyebrow: 'Today’s goal', streak: D.streak.current > 0 ? D.streak.current : null, pct: Math.min(1, D.done / Math.max(1, D.goals.dailyReviews)), main: fresh ? D.goals.dailyReviews : D.done, sub: fresh ? 'review goal' : `of ${D.goals.dailyReviews}`,
      ringLabel: `${D.done} of ${D.goals.dailyReviews} reviews today`, title: fresh ? 'Your first step today starts your streak' : D.done >= D.goals.dailyReviews ? 'Goal reached. Well done.' : 'Small sessions. Steady recall.',
      empty: fresh ? 'One recall card is enough to begin.' : null, text: `${D.focus} focus min today · ${week.filter(w => w.done).length} active days this week.`, week,
      strip: [{ v: String(D.mine), l: D.mine === 1 ? 'source' : 'sources' }, { v: String(s.cards.length), l: 'cards' }, { v: String(D.highlights + D.notes), l: 'notes & highlights' }]
    };
    const next = D.book;
    const items = [
      { kind: 'act', icon: 'layers', eyebrow: 'Due cards', title: dueN ? `${dueN} ${dueN === 1 ? 'card' : 'cards'} ready` : 'You’re all caught up', body: dueN ? 'Recall them now, before they fade.' : 'Nothing is due. Make a card from a highlight to keep going.', cta: dueN ? { label: 'Review now', onClick: () => c().startReview(D.due) } : { label: 'Open Study', onClick: () => c().navigate('studio') } },
      { kind: 'act', icon: 'book', eyebrow: 'Continue reading', title: next ? S0.esc(next.title) : 'No source yet', body: next ? `Page ${next.page || 1} of ${next.count}.` : 'Add a PDF or photos of notes. They stay on this device.', progress: next ? pct : null, progressLabel: 'Reading progress', sub: next ? `${pct}% through` : null, cta: next ? { label: 'Continue reading', onClick: () => c().openBook(next.id) } : { label: 'Add a source', onClick: () => c().setModal({ type: 'upload' }) } },
      { kind: 'act', icon: 'highlight', eyebrow: 'Highlights to review', title: D.highlights ? `${D.highlights} ${D.highlights === 1 ? 'highlight' : 'highlights'} saved` : 'Nothing highlighted yet', body: D.highlights ? 'Turn the ones that matter into recall cards.' : 'Select text in the reader to highlight it, add a note or make a card.', cta: { label: D.highlights ? 'Review highlights' : 'Open Notes', onClick: () => c().navigate('notes') } },
      { kind: 'path', eyebrow: 'Your plan', title: 'Three small steps', items: [
        { title: dueN ? `Review ${dueN} due ${dueN === 1 ? 'card' : 'cards'}` : 'Recall cards are up to date', sub: dueN ? `About ${Math.max(1, Math.ceil(dueN * 10 / 60))} min` : 'Nothing due right now', done: !dueN && D.done > 0, cta: dueN ? { label: 'Start', onClick: () => c().startReview(D.due) } : null },
        { title: next ? `Read “${next.title}”` : 'Add something to read', sub: next ? `Page ${next.page || 1} of ${next.count}` : 'PDF, slides or photos of notes', cta: next ? { label: 'Open', onClick: () => c().openBook(next.id) } : { label: 'Add', onClick: () => c().setModal({ type: 'upload' }) } },
        { title: 'One focused session', sub: `25 minutes${D.focus ? ` · ${D.focus} min done today` : ''}`, done: D.focus >= 25, cta: { label: 'Begin', onClick: () => HCA9Show('timer') } }
      ] }
    ];
    // side card: getting started while it is useful, otherwise a study tip
    const steps = [['Choose a goal', !!HCA11Get('lumen.hook.v1')], ['Add a source', D.mine > 0], ['Make a recall card', D.made > 0], ['Review it', D.reviews > 0]];
    const showGs = HCA11Get(HCA11GsKey) !== '1' && !steps.every(x => x[1]);
    const tip = HCA11Tips[new Date().getDate() % HCA11Tips.length];
    const side = document.createElement('aside'); side.className = 'hs-card hs-c4 is-static ' + (showGs ? 'hs-check' : 'hs-quote'); side.setAttribute('aria-label', showGs ? 'Getting started' : 'Study tip');
    if (showGs) {
      side.innerHTML = `<button type="button" class="hs-x" aria-label="Dismiss getting started">${S0.icon('x')}</button><p class="hs-eyebrow">Getting started</p><h3>Four small firsts</h3><ul>${steps.map(([t, d]) => `<li class="${d ? 'is-done' : ''}"><span class="lm-step"><i class="ck"></i><span>${S0.esc(t)}</span></span></li>`).join('')}</ul>`;
      side.querySelector('.hs-x').addEventListener('click', () => { HCA11Put(HCA11GsKey, '1'); side.remove(); });
    } else {
      side.innerHTML = `<p class="hs-eyebrow">Study technique</p><h3>${S0.esc(tip[0])}</h3><blockquote>${S0.esc(tip[1])}</blockquote>`;
      side.append(S0.link({ label: 'Read the story', onClick: () => HCA9Show('techniques') }));
    }
    items.push({ kind: 'raw', el: side });
    const day = S0.day({ hero, progress, items, daily: { app: 'lumen', done: D.done > 0 } });
    host.replaceChildren(day); S0.animate(day); const hh = day.querySelector('.hs-hero'); if (hh) S0.tilt(hh, 10);
    return () => { host.replaceChildren(); };
  }, [sig]);
  return HC('div', { ref, className: 'hca11-host', 'data-hs-host': '' });
}

ke = function HCA11Today() {
  return HC('div', { className: 'page-content hca-dashboard hs-todayhost' }, HC(HCA11Day), HC(HCAFooter));
};

/* top bar: search pill, streak, theme, help (How to use Lumen), text size and back up */
function HCA11TopActions({ theme, setTheme, privacy, session }) {
  const ctx = y(), s = ctx.state, streak = HCA3Streaks(HCA3Activity(s)).current, I = HCA11S()?.icon;
  return HC(_.Fragment, {},
    HC('button', { className: 'global-search-button hs-search', onClick: () => ctx.setModal({ type: 'search' }), 'aria-label': 'Search sources and notes' }, HC(E, { name: 'search-line' }), HC('span', {}, 'Search sources and notes'), HC('kbd', {}, /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K')),
    HC('div', { className: 'topbar-actions hs-right' },
      HC('a', { className: 'hs-streak', href: '#home', 'aria-label': streak ? `${streak}-day streak` : 'Start a streak today', title: streak ? `${streak}-day streak` : 'Start a streak today', onClick: e => { e.preventDefault(); ctx.navigate('progress'); }, dangerouslySetInnerHTML: { __html: `${I ? I('flame') : ''}<span>${streak}</span>` } }),
      HC(HCAWorkspaceRuntime),
      HC('button', { type: 'button', className: 'local-first-pill hs-privacy', onClick: () => ctx.setModal({ type: 'privacy' }), 'aria-label': session ? 'Session only: storage details' : 'Local-first: storage details', title: 'Your work stays in this browser' }, HC(E, { name: 'shield-check-line' }), HC('span', {}, session ? 'Session only' : 'Local-first')),
      HC(O, { className: 'hs-ibtn hs-theme-btn', icon: s.settings.theme === 'light' ? 'moon-line' : 'sun-line', label: s.settings.theme === 'light' ? 'Switch to evening theme' : 'Switch to daylight theme', onClick: () => ctx.setState(x => ({ ...x, settings: { ...x.settings, theme: x.settings.theme === 'light' ? 'dark' : 'light' } })) }),
      HC('button', { type: 'button', className: 'hs-ibtn hs-help-btn', onClick: () => HCA9Show('appguide'), 'aria-label': 'How to use Lumen', title: 'How to use Lumen' }, HC(E, { name: 'question-line' }), HC('span', { className: 'hs-lbl' }, 'Help')),
      HC('button', { className: 'profile-dot hs-hide', title: 'A personal, local workspace. No account required.', 'aria-label': 'About your private workspace', onClick: () => ctx.setModal({ type: 'privacy' }) }, 'L'),
      HC('div', { className: 'hs-acct-top' })));
}
function HCA11Mount() { _.useEffect(() => { HCA11S()?.normalize(); }); return null; }
const HCA11PrevDialogs = rs;
rs = function HCA11DialogRouter() { return HC(_.Fragment, {}, HC(HCA11PrevDialogs), HC(HCA11Mount)); };
/*HCA11:END*/
