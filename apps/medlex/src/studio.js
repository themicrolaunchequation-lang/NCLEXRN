/* MedLex Learning Studio, deck builder. Loaded lazily (with hca-studio.js and the module data) the first time a learner opens the studio.
   Every slide is made from the course's own records; the three checks are generated from the module's terms with a seeded shuffle,
   so a saved answer always lines up with the same options after a reload. */
(function () {
  'use strict';
  const D = window.MEDLEX_STUDIO, ST = window.HCAStudio; if (!D || !ST) return;
  const mods = D.modules, byId = Object.fromEntries(mods.map(m => [m.id, m]));
  const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const shuffle = (a, r) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const uniq = a => [...new Set(a)];
  const lc = s => s.charAt(0).toLowerCase() + s.slice(1);
  const KIND = { p: 'Prefix', r: 'Root', s: 'Suffix', c: 'Linking vowel' };
  const allTerms = mods.flatMap(m => m.terms), allParts = allTerms.flatMap(t => t.parts.map(p => ({ t: t.term, text: p[0], k: p[1], m: p[2] })));

  /* ----- generated checks (seeded: same module, same question, same option order) ----- */
  function mc(id, label, question, correct, wrongs, why, hint) {
    const r = rng(hash(id)), opts = shuffle(uniq([correct, ...wrongs]).slice(0, 4), r);
    return { id, type: 'check', eyebrow: label, question, hint: hint || '', options: opts, correct: opts.indexOf(correct), rationales: opts.map(o => why(o)), takeaway: why(correct) };
  }
  const pick = (arr, n, avoid, r) => shuffle(arr.filter(x => !avoid.includes(x)), r).slice(0, n);
  function decodeCheck(m, used) {
    const dec = m.terms.filter(t => t.parts.length > 1 && !t.form); if (!dec.length) return null;
    const r = rng(hash(m.id + 'decode')), t = dec[Math.floor(r() * dec.length)], p = t.parts.find(x => x[1] === 'r') || t.parts[0]; used.push(t.id);
    const same = allParts.filter(x => x.k === p[1] && x.m !== p[2]), wrongs = uniq(pick(same.map(x => x.m), 6, [p[2]], r)).slice(0, 3);
    if (wrongs.length < 3) return null;
    return mc(m.id + '-chk1', 'Check 1 of 3', `In “${t.term}”, what does the word part “${p[0]}” mean?`, p[2], wrongs, o => {
      if (o === p[2]) return `“${p[0]}” means ${p[2]}. Put the parts together and ${t.term} is ${lc(t.plain.replace(/\.$/, ''))}.`;
      const x = allParts.find(y => y.m === o); return x ? `That is what “${x.text}” means, in ${x.t}.` : '';
    }, 'Take the word apart before you guess. The parts are clues, and the whole-word meaning is the check.');
  }
  function meaningCheck(m, used, n, label) {
    const pool = m.terms.filter(t => !used.includes(t.id) && !t.form); if (!pool.length) return null;
    const r = rng(hash(m.id + 'meaning' + n)), t = pool[Math.floor(r() * pool.length)]; used.push(t.id);
    const near = a => a.filter(x => x.id !== t.id && !x.form && x.plain !== t.plain).sort((x, y) => Math.abs(x.plain.length - t.plain.length) - Math.abs(y.plain.length - t.plain.length));
    const others = uniq([...near(m.terms), ...near(allTerms)]), wrong = pick(others.slice(0, 12), 3, [], r);
    return mc(m.id + '-chk' + n, label, `Which plain-language meaning fits “${t.term}”?`, t.plain, wrong.map(x => x.plain), o => {
      if (o === t.plain) return `${t.def}${t.ex ? ' In practice: ' + t.ex : ''}`;
      const x = others.find(y => y.plain === o); return x ? `That describes “${x.term}”.` : '';
    });
  }
  function thirdCheck(m, used) {
    if (m.caseq && m.caseq.a.length > 1) {
      const c = m.caseq, ans = c.a[c.c];
      return mc(m.id + '-chk3', 'Check 3 of 3', c.q, ans, c.a.filter((_, i) => i !== c.c), o => o === ans ? c.x : '', 'Read the note as it is written, then choose the interpretation it actually supports.');
    }
    const pool = m.terms.filter(t => !used.includes(t.id)); if (!pool.length) return null;
    const r = rng(hash(m.id + 'reverse')), t = pool[Math.floor(r() * pool.length)];
    const wrong = pick([...m.terms, ...allTerms].filter(x => x.id !== t.id && x.term !== t.term && x.plain !== t.plain).slice(0, 40), 3, [], r);
    return mc(m.id + '-chk3', 'Check 3 of 3', `Which word means “${lc(t.plain.replace(/\.$/, ''))}”?`, t.term, wrong.map(x => x.term), o => {
      if (o === t.term) return `${t.term}: ${t.def}`;
      const x = wrong.find(y => y.term === o); return x ? `${x.term} means ${lc(x.plain.replace(/\.$/, ''))}.` : '';
    }, 'Go the other way round: from the meaning back to the word.');
  }

  /* ----- slides ----- */
  function posterSlide(m, p, id, eyebrow) {
    if (!p) return null;
    const regions = [{ label: 'The big picture', text: p.outcome, rect: [0, 0, 1, 1] }, { label: 'Top: title and callouts', text: 'Start with the title, then read the labelled callouts around the illustration. Each one names a word and gives its meaning.', rect: [0, 0, 1, .5] }, { label: 'Bottom: more callouts and a question', text: `${p.caution ? 'Keep in mind: ' + p.caution + ' ' : ''}Then try the recall question: ${p.question}`, rect: [0, .5, 1, .5] }];
    return { id, type: 'visual', nav: p.title, eyebrow, title: p.title, img: p.src, alt: `${p.title}. ${p.outcome} The full text of this illustrated guide is available below the tour.`, aspect: 1086 / 1448, regions, download: 'medlex-' + p.id,
      blocks: [{ title: p.title, text: p.outcome }, ...p.terms.map(t => ({ title: t.term, text: t.def })), ...(p.caution ? [{ title: 'Keep in mind', text: p.caution }] : []), { title: 'Recall question', text: `${p.question} ${p.answer || ''}`.trim() }] };
  }
  const part = t => t.parts.length ? t.parts.map(x => ({ t: x[0], k: x[1], m: x[2] })) : undefined;

  function deck(id, ctl) {
    const m = byId[id]; if (!m) return null;
    const i = mods.indexOf(m), nxt = mods[(i + 1) % mods.length], kicker = m.id === 'prefixes' || m.id === 'suffixes' ? 'Word parts' : 'Chapter ' + m.n;
    const used = [], c1 = decodeCheck(m, used) || meaningCheck(m, used, 1, 'Check 1 of 3'), c2 = meaningCheck(m, used, 2, 'Check 2 of 3'), c3 = thirdCheck(m, used);
    if (c1) c1.eyebrow = 'Check 1 of 3'; const checks = [c1, c2, c3].filter(Boolean);
    checks.forEach((c, k) => { c.eyebrow = `Check ${k + 1} of ${checks.length}`; });
    const sec = n => { const s = m.sections[n], o = m.outcomes.find(x => x.s === n + 1), c = m.classroom.find(x => x.s === n + 1);
      return { id: 'sec' + (n + 1), type: 'idea', eyebrow: `Part ${n + 1} of ${m.sections.length}`, n: n + 1, rail: m.sections.map(x => x.t), title: s.t, body: s.r, pull: o ? o.t : '', pullLabel: 'You will be able to', cards: c ? [{ icon: 'pencil', label: `Try it · ${c.mode}`, text: `${c.title}. ${c.ev}` }] : [] }; };
    const terms = m.terms.slice(0, 6), dec = terms.filter(t => t.parts.length > 1).length;
    const ind = m.independent[0], first = ind ? ind.task.split(/(?<=[.!?])\s/)[0] : '';
    const slides = [
      { id: 'cover', type: 'cover', kicker: `${kicker} · MedLex`, title: m.title, subtitle: m.sub, meta: [{ icon: 'layers', text: '__N__ slides' }, { icon: 'book', text: m.count }, { icon: 'target', text: `${checks.length} checks` }, { icon: 'image', text: 'Illustrated guide' }], outcomes: m.outcomes.slice(0, 3).map(o => o.t), art: m.poster ? { src: m.poster.src, alt: `Preview of the ${m.poster.title} illustrated guide` } : null },
      sec(0), sec(1),
      posterSlide(m, m.poster, 'vis1', 'Illustrated guide'),
      terms.length ? { id: 'terms', type: 'terms', eyebrow: dec >= 3 ? 'Take it apart' : 'Key words', title: dec >= 3 ? 'Decode these words.' : 'Words to know.', lead: dec >= 3 ? 'Tap a card to see what each part means.' : 'Tap a card to reveal its plain meaning.', terms: terms.map(t => ({ term: t.term, plain: t.plain, parts: part(t) })) } : null,
      checks[0], sec(2), sec(3),
      m.confusion ? { id: 'conf', type: 'compare', neutral: true, eyebrow: 'Often confused', title: `${m.confusion.a} or ${m.confusion.b}?`, situation: 'These two words are easy to mix up. What separates them?', left: { label: m.confusion.a, text: m.confusion.left }, right: { label: m.confusion.b, text: m.confusion.right }, why: [m.confusion.diff], revealLabel: `Reveal ${m.confusion.b}` } : null,
      m.case && m.case.length > 1 ? { id: 'case', type: 'notes', eyebrow: 'Case in context', title: 'A short fictional case.', lead: 'Read the note first. Then compare it with the explanation.', items: [{ label: 'The note', text: m.case[0] }, { label: 'What to notice', text: m.case[1] }] } : null,
      checks[1], posterSlide(m, m.bonus, 'vis2', 'A second illustrated guide'), checks[2],
      { id: 'reflect', type: 'reflect', eyebrow: 'Make it yours', prompt: `Which word from “${m.title}” will you try to decode first the next time you meet it in a clinical note?`, hint: 'Name the word and the part you will look for. One honest sentence is enough.', action: ind ? `${ind.title}: ${first}` : '', saveLabel: 'Save reflection and action' },
      { id: 'recap', type: 'recap', takeaway: m.poster ? m.poster.outcome : m.sub, points: m.sections.map(x => x.t), finishLabel: 'Finish this module journey', full: 'Open the module page', onFull: () => { location.hash = '#learn/module/' + id + '/overview'; }, next: { label: 'Next: ' + nxt.title, open: () => (window.MedlexStudioEntry || ctl).open(nxt.id, { start: 0 }) } }
    ].filter(Boolean);
    slides[0].meta[0].text = slides.length + ' slides';
    return { app: 'medlex', id, title: m.title, kicker: `Learning Studio · ${kicker}`, accent: '#3557D6', accentDark: '#2541A8', accentLight: '#8FA7FF', secPerSlide: 38, slides,
      onComplete: () => 'Journey complete. Well done.', onClose: () => { window.dispatchEvent(new Event('medlex-studio-closed')); } };
  }
  const ctl = { open(id, opts) { const d = deck(id, ctl); return d ? ST.open(d, opts || {}) : null; }, slides(id) { const d = deck(id, ctl); return d ? d.slides.length : 0; } };
  window.MedlexStudio = Object.assign(ctl, { ready: true });
})();
