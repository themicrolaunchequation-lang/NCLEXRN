import {scene3DFrame} from '../library/scene3d.js';
import { renderPage } from "../../ui/page.js";
// Phase 1: canonical features/studios/index implementation.
import { CASES, CHAPTERS, CONFUSIONS, COURSE_MODULES, TERMS } from '../../data/index.js';
import { csv, downloadText, normalSpelling, originalRecordReport, persist, shuffle } from '../learn/legacy-tools.js';
import { createQuestions } from '../practice/index.js';
import { ASSIST_LANGUAGES, assistingLanguageField } from '../settings/language.js';
import { voiceControls } from '../settings/voice.js';
import { navigate } from '../../router/index.js';
import { distractors, saveV3, trackItem, validateImport } from '../../state/actions.js';
import { applyPreferences } from '../../state/preferences.js';
import { app } from '../../state/runtime.js';
import { bankFor, chapter, getModule, pct, termBy, termCount } from '../../state/selectors.js';
import { closeModal, header, showModal, toast } from '../../ui/components/index.js';
import { $, esc, main } from '../../ui/dom.js';
import { guideButton, researchHTML } from '../../ui/guidance.js';
export const STUDIO_INFO = {
  matching: {
    title: 'Match Pairs Studio',
    what: 'A five-pair board connecting terms with their companion meanings.',
    why: 'Work through several distinct concepts in one visible workspace.',
    when: 'After exploring definitions or as a short revision activity.',
    how: 'Choose a term and then its meaning. Feedback records first-attempt accuracy and retries separately.',
    who: 'All learners. This is objective terminology practice.'
  },
  hub: {
    title: 'Interactive studios',
    what: 'Connected activities for understanding, application and reflection.',
    why: 'Practise one idea in several useful forms.',
    when: 'After reading a chapter, or when you want focused revision.',
    how: 'Choose a studio, complete its task and keep the evidence in your portfolio.',
    who: 'Healthcare learners, practitioners and educators.'
  },
  adaptive: {
    title: 'Your adaptive pathway',
    what: 'A short assessment and practice queue organised by learning need.',
    why: 'Recognition, spelling, components and context are different skills.',
    when: 'Start here, then return for your next targeted session.',
    how: 'Answer questions, rate confidence and review the feedback. The next queue prioritises missed and overdue words.',
    who: 'Any learner. Results describe these exercises, not clinical competence.'
  },
  clinical: {
    title: 'Clinical Note Studio',
    what: 'A workspace for interpreting fictional clinical language.',
    why: 'Correct terminology needs context, precision and recognition of uncertainty.',
    when: 'After studying a system or before a classroom case discussion.',
    how: 'Explore highlighted terms, write an interpretation and compare the existing companion model.',
    who: 'Learners and educators. Written work uses self or educator review.'
  },
  explain: {
    title: 'Patient Explanation Studio',
    what: 'Practise explaining a medical term in everyday language.',
    why: 'A definition is useful when its meaning can be communicated clearly.',
    when: 'After understanding the term and its scope.',
    how: 'Write an explanation, compare the companion wording and complete the clarity checklist.',
    who: 'Healthcare learners and communication educators.'
  },
  confusions: {
    title: 'Confusable Terms Studio',
    what: 'Focused comparisons of similar terms from the original course.',
    why: 'A familiar-looking word can represent a different concept.',
    when: 'When a distinction is unclear or repeatedly missed.',
    how: 'Compare both meanings, answer a distinction question and revisit errors.',
    who: 'All learners. Questions assess terminology only.'
  },
  atlas: {
    title: 'Body-system atlas',
    what: 'A schematic navigator connecting systems, chapters, roots and terms.',
    why: 'Connect a word to the system it describes.',
    when: 'Explore a new system or connect topics across modules.',
    how: 'Select a system marker or its accessible text button, then explore terms or start a learning journey.',
    who: 'All learners. The schematic is not a detailed anatomical or diagnostic image.'
  },
  pronunciation: {
    title: 'Pronunciation Studio',
    what: 'Listen, repeat, record and compare using device audio tools.',
    why: 'Make deliberate listening and speaking part of vocabulary practice.',
    when: 'After checking the written meaning of the word.',
    how: 'Choose a voice and speed. Optionally record up to one minute and assess your own delivery.',
    who: 'Any learner. No automatic pronunciation score or invented phonetic spelling is provided.'
  },
  coding: {
    title: 'Documentation & Coding Studio',
    what: 'A structured worksheet for documentation and classification literacy.',
    why: 'Terminology, documentation and classification have different roles.',
    when: 'During coding-literacy activities with the correct local references.',
    how: 'Identify the documented concept, missing information, reference edition and verification route.',
    who: 'Learners and educators. No automatic code assignment is performed.'
  },
  educator: {
    title: 'Educator workspace',
    what: 'Build assignments, distribute offline packs and record feedback.',
    why: 'Connect activities with proposed outcomes and visible evidence.',
    when: 'When planning a lesson, independent task or reviewed assessment.',
    how: 'Choose modules and activities, create a pack and review saved evidence using a rubric.',
    who: 'Educators. Review records are entered locally; reviewer identities are not independently verified.'
  },
  portfolio: {
    title: 'Learning evidence portfolio',
    what: 'A record of objective practice, reflections and educator-entered feedback.',
    why: 'Completion, self-rating and demonstrated recall should remain distinguishable.',
    when: 'Review progress, prepare feedback or export a learning record.',
    how: 'Filter the evidence, inspect its basis and download a report or encrypted backup.',
    who: 'Learners and educators. This is a learning record, not professional certification.'
  },
  editor: {
    title: 'Editorial review workspace',
    what: 'A local overlay for enriching terms without changing the original dataset.',
    why: 'Plain wording, realistic examples and verified components need accountable review.',
    when: 'During planned medical-editor or educator review.',
    how: 'Add notes and source details, then record who reviewed them and when. Drafts never become graded content automatically.',
    who: 'Educators and qualified medical editors. Review status is a local declaration.'
  }
};
export const STUDIO_ROUTES = ['matching', 'hub', 'adaptive', 'clinical', 'explain', 'confusions', 'atlas', 'pronunciation', 'coding', 'educator', 'portfolio', 'editor'];
export function xp() {
  if (!app.v3.expansion) app.v3.expansion = {
    version: 1,
    events: [],
    artifacts: [],
    drafts: {},
    editorial: {},
    assignments: [],
    feedback: {},
    reading: {
      focus: false,
      spacing: 1.7
    },
    active: null,
    lastBackup: null
  };
  const x = app.v3.expansion;
  for (const k of ['events', 'artifacts', 'assignments']) if (!Array.isArray(x[k])) x[k] = [];
  for (const k of ['drafts', 'editorial', 'feedback', 'reading']) if (!x[k] || typeof x[k] !== 'object' || Array.isArray(x[k])) x[k] = {};
  return x;
}
export function uid(prefix = 'e') {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}
export function sourceFor(t) {
  const c = chapter(t.chapter);
  return `Companion reference: Walker, Wood & Nicol, Mastering Medical Terminology, 3rd edition (2021), Chapter ${c.id}: ${c.name}. Original companion wording; independent medical-editor review is not recorded.`;
}
export function studioHeader(key, description = '') {
  const h = STUDIO_INFO[key];
  return `<div class="studio-topline"><a class="back-link" href="#studio/hub">← All studios</a><div>${helpButton(key)} <button class="btn small" data-advance="focus" aria-pressed="${!!xp().reading.focus}">${xp().reading.focus ? 'Leave focus mode' : 'Focus mode'}</button></div></div>` + header('HCA · CONNECTED LEARNING', esc(h.title), description || h.what);
}
export function studioLinks() {
  return `<div class="studio-links"><a href="#studio/hub">Studios</a><a href="#studio/adaptive">My pathway</a><a href="#studio/atlas">Body atlas</a><a href="#studio/portfolio">Portfolio</a></div>`;
}
export function renderStudio(key) {
  stopRecording();
  key = STUDIO_ROUTES.includes(key) ? key : 'hub';
  app.route = 'studio';
  renderPage('', {
    overview: false
  });
  $('#crumb').textContent = STUDIO_INFO[key].title;
  document.title = STUDIO_INFO[key].title + ' · MedLex';
  ({
    matching: matchingPage,
    hub: studioHub,
    adaptive: adaptivePage,
    clinical: clinicalPage,
    explain: explainPage,
    confusions: confusionsPage,
    atlas: atlasPage,
    pronunciation: pronunciationPage,
    coding: codingPage,
    educator: educatorPage,
    portfolio: portfolioPage,
    editor: editorPage
  })[key]();
  applyReading();
}
export function studioHub() {
  renderPage(studioHeader('hub', 'Explore. Apply. Explain. Keep the evidence of your learning.') + `<section class="journey-banner"><div><span class="eyebrow">ONE CONNECTED LEARNING JOURNEY</span><h2>Follow a word from structure to understanding.</h2><p>Atlas → term profile → word components → clinical note → everyday explanation → delayed recall.</p><a class="btn primary" href="#studio/adaptive">Find my next learning step →</a></div><div class="journey-emblem" aria-hidden="true"><span>Learn</span><span>Apply</span><span>Explain</span></div></section><div class="studio-grid">${['clinical', 'explain', 'confusions', 'matching', 'atlas', 'pronunciation', 'coding', 'educator', 'portfolio', 'editor'].map((key, i) => `<article class="studio-card"><div class="studio-card-top"><span class="tile-number">${String(i + 1).padStart(2, '0')}</span>${helpButton(key)}</div><h2><a href="#studio/${key}">${esc(STUDIO_INFO[key].title)} <span aria-hidden="true">→</span></a></h2><p>${esc(STUDIO_INFO[key].what)}</p><span class="evidence-badge">${['clinical', 'explain', 'coding'].includes(key) ? 'Reflection + rubric' : key === 'confusions' ? 'Objective practice' : key === 'editor' ? 'Human review workflow' : 'Explore & connect'}</span></article>`).join('')}</div>`, {
    overview: false
  });
}
export function recordLearning(termId, dimension, correct, {
  objective = true,
  confidence = null,
  source = 'practice'
} = {}) {
  if (!termBy(termId)) return;
  const x = xp(),
    old = [...x.events].reverse().find(e => e.termId === termId && e.dimension === dimension && e.objective),
    gap = old ? (Date.now() - old.at) / 86400000 : null;
  const event = {
    id: uid(),
    termId,
    dimension,
    correct: !!correct,
    objective,
    confidence,
    source,
    at: Date.now(),
    gapDays: gap
  };
  x.events.push(event);
  x.events = x.events.slice(-4000);
  if (!correct && objective) app.state.reviews[termId] = {
    ...(app.state.reviews[termId] || {
      reps: 0,
      ease: 2.5,
      lapses: 0,
      interval: 0
    }),
    due: Date.now()
  };
  persist();
  return event;
}
export function addArtifact(kind, title, body, {
  module = null,
  terms = [],
  basis = 'self-review',
  score = null,
  total = null
} = {}) {
  const item = {
    id: uid('a'),
    kind,
    title,
    body,
    module,
    terms,
    basis,
    score,
    total,
    date: Date.now()
  };
  xp().artifacts.unshift(item);
  xp().artifacts = xp().artifacts.slice(0, 500);
  persist();
  return item;
}
export function dimensionStats() {
  return ['meaning', 'spelling', 'components', 'context'].map(d => {
    const list = xp().events.filter(e => e.objective && e.dimension === d);
    return {
      dimension: d,
      total: list.length,
      correct: list.filter(e => e.correct).length,
      accuracy: list.length ? pct(list.filter(e => e.correct).length, list.length) : null
    };
  });
}
export function weaknessScore(t, dimension) {
  const e = xp().events.filter(e => e.termId === t.id && e.dimension === dimension && e.objective);
  if (!e.length) return 3;
  const recent = e.slice(-5),
    errors = recent.filter(e => !e.correct).length,
    high = recent.filter(e => !e.correct && e.confidence === 'sure').length,
    days = (Date.now() - e.at(-1).at) / 86400000;
  return errors * 3 + high * 2 + Math.min(days / 2, 7) + (app.state.reviews[t.id]?.due <= Date.now() ? 2 : 0);
}
export function adaptivePage() {
  const stats = dimensionStats(),
    x = xp(),
    latest = x.artifacts.find(a => a.kind === 'baseline');
  renderPage(studioHeader('adaptive', 'Track meaning, spelling, word components and context separately.') + `<section class="surface"><div class="section-head"><div><span class="eyebrow">A CLEAR NEXT STEP</span><h2>${latest ? 'Practise the connections that need attention.' : 'Start with a learning snapshot.'}</h2></div>${helpButton('adaptive')}</div><p>${latest ? 'Your queue uses recent mistakes, confidence, time since practice and due reviews.' : 'A 12-question starting assessment samples four skills. It is a planning aid, not a measure of clinical competence.'}</p><label class="field"><span>Focus chapter</span><select class="select" id="adaptiveChapter"><option value="all">Across the course</option>${CHAPTERS.filter(c => termCount(c.id)).map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label><div class="term-actions"><button class="btn primary" data-advance="adaptiveStart" data-id="${latest ? 'adaptive' : 'baseline'}">${latest ? 'Start targeted practice · 10 items' : 'Take starting assessment · 12 items'}</button><button class="btn" data-advance="adaptiveStart" data-id="baseline">Retake starting assessment</button>${x.active ? '<button class="btn" data-advance="resumeAdaptive">Resume saved session</button>' : ''}</div><p class="access-note">A correct answer is recorded for that question and skill. A self-rating never counts as an objective answer.</p></section><div class="skill-grid">${stats.map(s => `<article class="surface"><span class="eyebrow">${s.dimension}</span><strong class="metric-number">${s.accuracy === null ? '—' : s.accuracy + '%'}</strong><p>${s.total ? s.correct + ' correct of ' + s.total + ' responses' : 'No objective responses yet'}</p></article>`).join('')}</div><section class="surface"><h2>Why these words?</h2><p>Highest-priority terms from your recent activity. Untested terms remain available to broaden learning.</p><div class="priority-list">${TERMS.filter(t => xp().events.some(e => e.termId === t.id)).sort((a, b) => weaknessScore(b, 'meaning') - weaknessScore(a, 'meaning')).slice(0, 8).map(t => `<button data-action="term" data-id="${t.id}" class="search-result"><strong>${esc(t.term)}</strong><small>${esc(chapter(t.chapter).name)} · ${app.state.reviews[t.id]?.due <= Date.now() ? 'Review due' : 'Recent practice'}</small></button>`).join('') || '<p class="muted">Complete a few responses to build your personal practice priorities.</p>'}</div></section>`, {
    overview: false
  });
}
export function createAdaptive(mode, chapterId = 'all') {
  const dimensions = ['meaning', 'spelling', 'components', 'context'],
    stats = dimensionStats(),
    ordered = [...dimensions].sort((a, b) => (stats.find(x => x.dimension === a).accuracy ?? -1) - (stats.find(x => x.dimension === b).accuracy ?? -1));
  const count = mode === 'baseline' ? 12 : 10,
    items = [],
    rich = TERMS.filter(t => t.parts.length && t.plain !== t.definition),
    pool = chapterId === 'all' ? rich : rich.filter(t => t.chapter === +chapterId);
  for (let i = 0; i < count; i++) {
    const dimension = mode === 'baseline' ? dimensions[i % 4] : ordered[i % 4];
    if (dimension === 'context') {
      const cases = chapterId === 'all' ? CASES : CASES.filter(c => termBy(c.term)?.chapter === +chapterId),
        c = shuffle([...(cases.length ? cases : CASES), ...CASES].filter(c => !items.some(q => q.prompt === c.prompt)))[0] || CASES[0];
      items.push({
        termId: c.term,
        dimension,
        prompt: c.prompt,
        options: shuffle(c.answers.map((label, j) => ({
          label,
          correct: j === c.correct
        }))),
        explanation: c.explanation
      });
      continue;
    }
    let candidates = (pool.length ? pool : rich).filter(t => !items.some(q => q.termId === t.id && q.dimension === dimension));
    if (!candidates.length) candidates = rich;
    const ranked = shuffle(candidates).sort((a, b) => weaknessScore(b, dimension) - weaknessScore(a, dimension));
    const t = ranked[0];
    if (dimension === 'components') {
      const part = shuffle(t.parts.filter(p => p.type !== 'vowel'))[0],
        wrong = shuffle([...new Set(rich.flatMap(v => v.parts).filter(p => p.text !== part.text).map(p => p.text))]).slice(0, 3);
      items.push({
        termId: t.id,
        dimension,
        prompt: `In “${t.term}”, which component means “${part.meaning}”?`,
        options: shuffle([{
          label: part.text,
          correct: true
        }, ...wrong.map(label => ({
          label,
          correct: false
        }))]),
        explanation: t.parts.map(p => p.text + ' · ' + p.type + ': ' + p.meaning).join('; ')
      });
    } else if (dimension === 'spelling') items.push({
      termId: t.id,
      dimension,
      prompt: 'Write the term for: ' + t.definition,
      accepted: [t.term, ...t.aliases],
      explanation: t.term + ': ' + t.definition
    });else items.push({
      termId: t.id,
      dimension,
      prompt: 'What does “' + t.term + '” mean?',
      options: shuffle([{
        label: t.definition,
        correct: true
      }, ...distractors(t).map(v => ({
        label: v.definition,
        correct: false
      }))]),
      explanation: t.term + ': ' + t.definition
    });
  }
  return {
    id: uid('s'),
    mode,
    chapter: chapterId,
    items,
    index: 0,
    score: 0,
    results: [],
    answered: false,
    selected: null,
    draft: '',
    confidence: 'unsure',
    started: Date.now()
  };
}
export function startAdaptive(mode) {
  const chapterId = $('#adaptiveChapter')?.value || 'all';
  app.adaptiveRun = createAdaptive(mode, chapterId);
  xp().active = app.adaptiveRun;
  app.quiz = null;
  app.flash = null;
  app.exercise = null;
  app.special = null;
  persist();
  renderAdaptive();
}
export function renderAdaptive() {
  const s = app.adaptiveRun,
    q = s.items[s.index];
  renderPage(studioHeader('adaptive', `${s.mode === 'baseline' ? 'Starting assessment' : 'Targeted practice'} · Question ${s.index + 1} of ${s.items.length}`) + `<section class="surface adaptive-panel"><div class="session-segments" role="group" aria-label="${s.results.length} of ${s.items.length} answered">${s.items.map((_, i) => `<span class="${s.results[i] ? s.results[i].correct ? 'right' : 'wrong' : i === s.index ? 'current' : ''}"></span>`).join('')}</div><span class="eyebrow">${q.dimension} · ${q.dimension === 'context' ? 'FICTIONAL CLINICAL LANGUAGE' : 'TERMINOLOGY PRACTICE'}</span><h2>${esc(q.prompt)}</h2><div class="confidence-row"><span>Before checking:</span>${[['unsure', 'Unsure'], ['partly', 'Partly sure'], ['sure', 'Sure']].map(([id, label]) => `<button class="filter-pill ${s.confidence === id ? 'active' : ''}" data-advance="confidence" data-id="${id}" aria-pressed="${s.confidence === id}" ${s.answered ? 'disabled' : ''}>${label}</button>`).join('')}</div>${q.dimension === 'spelling' ? `<form id="adaptiveSpelling"><label class="field"><span>Your term</span><input id="adaptiveSpellingInput" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="120" value="${esc(s.draft)}" ${s.answered ? 'disabled' : ''} required></label><button class="btn primary" type="submit" ${s.answered ? 'disabled' : ''}>Check spelling</button></form>` : `<div class="answer-grid">${q.options.map((o, i) => `<button class="answer ${s.answered ? o.correct ? 'correct' : s.selected === i ? 'incorrect' : '' : ''}" data-advance="adaptiveAnswer" data-id="${i}" ${s.answered ? 'disabled' : ''}><span>${String.fromCharCode(65 + i)}</span>${esc(o.label)}</button>`).join('')}</div>`}${s.answered ? `<div class="feedback" role="status"><strong>${s.results.at(-1).correct ? 'Correct connection.' : 'A distinction to revisit.'}</strong><p>${esc(q.explanation)}</p><button class="text-button" data-action="term" data-id="${q.termId}">Explore the term →</button></div><button class="btn primary" data-advance="adaptiveNext">${s.index === s.items.length - 1 ? 'See learning snapshot' : 'Continue →'}</button>` : ''}<p class="access-note">Each checked answer is saved. You can return to this session from My pathway.</p></section>`, {
    overview: false
  });
  const focusTarget = s.answered ? $('[data-advance=adaptiveNext]') : q.dimension === 'spelling' ? $('#adaptiveSpellingInput') : $('.adaptive-panel h2');
  if (focusTarget) {
    if (focusTarget.tagName === 'H2') focusTarget.tabIndex = -1;
    focusTarget.focus({
      preventScroll: true
    });
  }
}
export function adaptiveAnswer(value) {
  const s = app.adaptiveRun;
  if (!s || s.answered) return;
  const q = s.items[s.index],
    correct = q.dimension === 'spelling' ? q.accepted.some(a => normalSpelling(a) === normalSpelling(value)) : !!q.options[+value]?.correct;
  s.answered = true;
  s.selected = q.dimension === 'spelling' ? null : +value;
  s.results.push({
    termId: q.termId,
    dimension: q.dimension,
    correct,
    confidence: s.confidence
  });
  if (correct) s.score++;
  recordLearning(q.termId, q.dimension, correct, {
    confidence: s.confidence,
    source: s.mode
  });
  trackItem();
  xp().active = s;
  persist();
  renderAdaptive();
}
export function adaptiveNext() {
  if (!app.adaptiveRun?.answered) return;
  const s = app.adaptiveRun;
  if (++s.index < s.items.length) {
    s.answered = false;
    s.selected = null;
    s.draft = '';
    s.confidence = 'unsure';
    xp().active = s;
    persist();
    renderAdaptive();
  } else {
    const breakdown = Object.fromEntries(['meaning', 'spelling', 'components', 'context'].map(d => {
      const list = s.results.filter(r => r.dimension === d);
      return [d, {
        correct: list.filter(r => r.correct).length,
        total: list.length
      }];
    }));
    addArtifact(s.mode, s.mode === 'baseline' ? 'Starting learning snapshot' : 'Adaptive practice session', {
      breakdown,
      results: s.results,
      durationMs: Date.now() - s.started
    }, {
      basis: 'objective',
      score: s.score,
      total: s.items.length,
      terms: [...new Set(s.results.map(r => r.termId))]
    });
    app.state.history.unshift({
      date: Date.now(),
      mode: s.mode,
      score: s.score,
      total: s.items.length,
      durationMs: Date.now() - s.started
    });
    xp().active = null;
    persist();
    renderPage(studioHeader('adaptive', 'A snapshot of the connections you demonstrated in this session.') + `<section class="surface"><span class="eyebrow">SESSION COMPLETE</span><h2>${s.score} / ${s.items.length} correct</h2><div class="skill-grid">${Object.entries(breakdown).map(([d, r]) => `<div><strong class="metric-number">${r.correct}/${r.total}</strong><p>${d}</p></div>`).join('')}</div><p>Focus next on ${Object.entries(breakdown).filter(([d, r]) => r.total).sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)[0]?.[0] || 'your current chapter'}. Mistakes have been added to your due-review queue.</p><div class="term-actions"><button class="btn primary" data-advance="adaptiveHome">View my pathway</button><a class="btn" href="#studio/portfolio">Open evidence portfolio</a></div></section>`, {
      overview: false
    });
    app.adaptiveRun = null;
  }
}
export function matchingTerms(text) {
  const clean = text.toLowerCase();
  return TERMS.filter(t => [t.term, ...t.aliases].some(v => v.length > 3 && new RegExp('\\b' + v.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(clean))).sort((a, b) => b.term.length - a.term.length).slice(0, 12);
}
export function highlightNote(text) {
  const list = matchingTerms(text),
    names = [...new Set(list.flatMap(t => [t.term, ...t.aliases]).filter(v => v.length > 3))].sort((a, b) => b.length - a.length);
  if (!names.length) return esc(text);
  const re = new RegExp('\\b(' + names.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'gi');
  let out = '',
    last = 0;
  for (const match of text.matchAll(re)) {
    const t = list.find(t => [t.term, ...t.aliases].some(v => v.toLowerCase() === match[0].toLowerCase()));
    out += esc(text.slice(last, match.index)) + `<button class="note-term" data-action="term" data-id="${t.id}">${esc(match[0])}</button>`;
    last = match.index + match[0].length;
  }
  return out + esc(text.slice(last));
}
export function modulePicker(id, selected) {
  return `<label class="field"><span>Choose chapter or module</span><select id="${id}" class="select">${COURSE_MODULES.filter(m => !m.affixKind).map(m => `<option value="${m.id}" ${m.id === selected ? 'selected' : ''}>Chapter ${m.chapter} · ${esc(m.title)}</option>`).join('')}</select></label>`;
}
export function draftField(label, key, {
  rows = 4,
  max = 4000,
  placeholder = ''
} = {}) {
  return `<label class="field"><span>${label}</span><textarea data-studio-draft="${esc(key)}" rows="${rows}" maxlength="${max}" placeholder="${esc(placeholder)}">${esc(xp().drafts[key] || '')}</textarea></label>`;
}
export function clinicalPage() {
  const m = getModule(app.noteModule),
    key = 'note:' + m.id;
  renderPage(studioHeader('clinical', 'Read closely. Explain the words. Identify what is unknown.') + modulePicker('clinicalModule', m.id) + `<div class="studio-two-col"><section class="surface"><div class="section-head"><span class="eyebrow">FICTIONAL TEACHING NOTE</span>${helpButton('clinical')}</div><blockquote class="clinical-note">${highlightNote(m.case[0])}</blockquote><p class="access-note">Highlighted words open their original term profiles. This note is an existing fictional course example.</p>${draftField('Explain the terminology in everyday language', key + ':meaning')}${draftField('What is documented, and what remains unknown?', key + ':unknown', {
    rows: 3
  })}${draftField('What would you verify, and in which reference?', key + ':verify', {
    rows: 3
  })}<div class="autosave" role="status" id="studioSaveStatus">Drafts save on this device.</div><button class="btn primary" data-advance="noteCompare">Compare the companion model</button><div id="noteComparison"></div></section><aside class="surface" aria-label="Clinical note learning journey"><span class="eyebrow">CONNECT THIS CHAPTER</span><h2>${esc(m.title)}</h2><p>${esc(m.subtitle)}</p><div class="journey-list"><a href="#studio/atlas">1 · Locate the system</a><a href="#module?id=${m.id}&tab=bank">2 · Explore the term bank</a><a href="#studio/explain">3 · Explain a term</a><a href="#module?id=${m.id}&tab=practice">4 · Practise the chapter</a></div><p class="source-line">${esc(m.reference)}</p><p class="access-note">Clinical interpretation is reviewed by you or your educator; text is not automatically graded.</p></aside></div>`, {
    overview: false
  });
}
export const NOTE_RUBRIC = ['I preserved the meaning of the terminology.', 'I separated stated facts from assumptions.', 'I identified uncertainty or missing context.', 'I named an appropriate verification step.'];
export function rubricChecks(items, prefix) {
  return `<fieldset class="rubric-checks"><legend>Self-review checklist</legend>${items.map((v, i) => `<label><input type="checkbox" id="${prefix}-${i}"><span>${esc(v)}</span></label>`).join('')}</fieldset>`;
}
export function noteCompare() {
  const m = getModule(app.noteModule),
    key = 'note:' + m.id;
  if (!(xp().drafts[key + ':meaning'] || '').trim()) {
    toast('Write your interpretation before comparing the model.');
    return;
  }
  $('#noteComparison').innerHTML = `<div class="feedback"><span class="eyebrow">COMPANION MODEL · SELF / EDUCATOR REVIEW</span><p>${esc(m.case[1])}</p></div>${rubricChecks(NOTE_RUBRIC, 'noteRubric')}<button class="btn" data-advance="saveNote">Save reflection to portfolio</button>`;
}
export function saveNote() {
  const m = getModule(app.noteModule),
    key = 'note:' + m.id;
  addArtifact('clinical', 'Clinical interpretation · ' + m.title, {
    note: m.case[0],
    interpretation: xp().drafts[key + ':meaning'] || '',
    uncertainty: xp().drafts[key + ':unknown'] || '',
    verification: xp().drafts[key + ':verify'] || '',
    checklist: NOTE_RUBRIC.map((v, i) => ({
      criterion: v,
      checked: !!$('#noteRubric-' + i)?.checked
    }))
  }, {
    module: m.id,
    terms: matchingTerms(m.case[0]).map(t => t.id)
  });
  toast('Reflection saved as self-reviewed evidence.');
  $('#noteComparison').insertAdjacentHTML('beforeend', '<p role="status">Saved. <a class="text-button" href="#studio/portfolio">View portfolio →</a></p>');
}
export function curatedPicker(id, selected) {
  return `<label class="field"><span>Choose a term with companion context</span><select class="select" id="${id}">${TERMS.filter(t => t.parts.length && t.plain !== t.definition).sort((a, b) => a.term.localeCompare(b.term)).map(t => `<option value="${t.id}" ${t.id === selected ? 'selected' : ''}>${esc(t.term)} · ${esc(chapter(t.chapter).name)}</option>`).join('')}</select></label>`;
}
export const EXPLAIN_RUBRIC = ['The core meaning is preserved.', 'I explained unfamiliar wording instead of adding jargon.', 'I preserved qualifiers and uncertainty.', 'I did not add a diagnosis, prognosis or treatment claim.', 'I invited the listener to explain their understanding back.'];
export function explainPage() {
  const t = termBy(app.explainTerm) || TERMS.find(t => t.parts.length),
    key = 'explain:' + t.id;
  renderPage(studioHeader('explain', 'Turn understanding into a clear, respectful explanation.') + curatedPicker('explainTerm', t.id) + `<div class="studio-two-col"><section class="surface"><span class="eyebrow">YOUR COMMUNICATION TASK</span><h2>${esc(t.term)}</h2><div class="meaning-box"><span class="eyebrow">ORIGINAL COMPANION DEFINITION</span><p>${esc(t.definition)}</p></div>${draftField('How would you explain this term to someone without healthcare training?', key, {
    placeholder: 'Use a short explanation, preserve the meaning and avoid assumptions.'
  })}<p class="access-note">Use a fictional explanation. Do not enter patient information.</p><button class="btn primary" data-advance="explainCompare">Compare & reflect</button><div id="explainComparison"></div></section><aside class="surface" aria-label="Explanation guidance"><h2>A clearer explanation</h2><ol class="reading-list"><li>Check the full meaning.</li><li>Use familiar words.</li><li>Keep important qualifiers.</li><li>Separate the word’s meaning from a person’s diagnosis.</li><li>Invite questions and check understanding.</li></ol><button class="btn" data-action="term" data-id="${t.id}">Explore word anatomy</button><p class="source-line">${esc(sourceFor(t))}</p></aside></div>`, {
    overview: false
  });
}
export function explainCompare() {
  const t = termBy(app.explainTerm),
    draft = xp().drafts['explain:' + t.id] || '';
  if (!draft.trim()) {
    toast('Write your explanation before comparing.');
    return;
  }
  $('#explainComparison').innerHTML = `<div class="feedback"><span class="eyebrow">COMPANION WORDING FOR COMPARISON</span><p>${esc(t.plain)}</p><p class="access-note">A comparison aid, not an automatic assessment of your explanation.</p></div>${rubricChecks(EXPLAIN_RUBRIC, 'explainRubric')}<button class="btn" data-advance="saveExplanation">Save self-review</button>`;
}
export function saveExplanation() {
  const t = termBy(app.explainTerm);
  addArtifact('explanation', 'Everyday explanation · ' + t.term, {
    term: t.term,
    definition: t.definition,
    explanation: xp().drafts['explain:' + t.id] || '',
    comparison: t.plain,
    checklist: EXPLAIN_RUBRIC.map((v, i) => ({
      criterion: v,
      checked: !!$('#explainRubric-' + i)?.checked
    }))
  }, {
    module: 'ch' + t.chapter,
    terms: [t.id]
  });
  toast('Explanation saved to your portfolio.');
  $('#explainComparison').insertAdjacentHTML('beforeend', '<p role="status">Saved as self-review. <a href="#studio/portfolio">Open portfolio →</a></p>');
}
export function confusionsPage() {
  const c = CONFUSIONS[app.confusionIndex],
    a = TERMS.find(t => t.term.toLowerCase() === c.a.toLowerCase()),
    b = TERMS.find(t => t.term.toLowerCase() === c.b.toLowerCase());
  renderPage(studioHeader('confusions', 'Learn the exact distinction, then practise recognising it.') + `<div class="pill-row">${CONFUSIONS.map((c, i) => `<button class="filter-pill ${i === app.confusionIndex ? 'active' : ''}" data-advance="confusionSelect" data-id="${i}">${esc(c.a)} / ${esc(c.b)}</button>`).join('')}</div><div class="comparison-grid"><section class="surface"><span class="eyebrow">FIRST CONCEPT</span><h2>${esc(c.a)}</h2><p class="comparison-meaning">${esc(c.left)}</p>${a ? `<button class="btn" data-action="term" data-id="${a.id}">Explore this term</button>` : ''}</section><section class="surface"><span class="eyebrow">SECOND CONCEPT</span><h2>${esc(c.b)}</h2><p class="comparison-meaning">${esc(c.right)}</p>${b ? `<button class="btn" data-action="term" data-id="${b.id}">Explore this term</button>` : ''}</section></div><section class="surface"><span class="eyebrow">THE DISTINCTION THAT MATTERS</span><h2>${esc(c.difference)}</h2><p>Compare the full concepts before relying on a familiar-looking word part.</p><button class="btn primary" data-advance="confusionQuiz">Test this distinction</button><div id="confusionQuestion"></div></section>`, {
    overview: false
  });
}
export function confusionQuiz() {
  const c = CONFUSIONS[app.confusionIndex],
    side = Math.random() < .5 ? 0 : 1;
  app.confusionRun = {
    index: app.confusionIndex,
    side,
    answered: false
  };
  $('#confusionQuestion').innerHTML = `<h3>Which term corresponds to “${esc(side ? c.right : c.left)}”?</h3><div class="answer-grid">${[c.a, c.b].map((v, i) => `<button class="answer" data-advance="confusionAnswer" data-id="${i}"><span>${i ? 'B' : 'A'}</span>${esc(v)}</button>`).join('')}</div>`;
}
export function confusionAnswer(i) {
  if (!app.confusionRun || app.confusionRun.answered) return;
  app.confusionRun.answered = true;
  const c = CONFUSIONS[app.confusionRun.index],
    correct = +i === app.confusionRun.side,
    t = TERMS.find(t => t.term === (app.confusionRun.side ? c.b : c.a));
  if (t) recordLearning(t.id, 'context', correct, {
    source: 'confusable-terms'
  });
  trackItem();
  addArtifact('distinction', c.a + ' / ' + c.b, {
    prompt: app.confusionRun.side ? c.right : c.left,
    answer: +i ? c.b : c.a,
    explanation: c.difference
  }, {
    basis: 'objective',
    score: correct ? 1 : 0,
    total: 1,
    terms: t ? [t.id] : []
  });
  $('#confusionQuestion').innerHTML = `<div class="feedback" role="status"><strong>${correct ? 'Correct distinction.' : 'Revisit the distinction.'}</strong><p>${esc(app.confusionRun.side ? c.b : c.a)} · ${esc(c.difference)}</p></div><button class="btn" data-advance="confusionQuiz">Try another question</button>`;
}
export const ATLAS_NODES = [{
  chapter: 4,
  x: 90,
  y: 215
}, {
  chapter: 5,
  x: 72,
  y: 175
}, {
  chapter: 6,
  x: 139,
  y: 260
}, {
  chapter: 7,
  x: 171,
  y: 130
}, {
  chapter: 8,
  x: 150,
  y: 112
}, {
  chapter: 9,
  x: 151,
  y: 166
}, {
  chapter: 10,
  x: 125,
  y: 148
}, {
  chapter: 11,
  x: 150,
  y: 220
}, {
  chapter: 12,
  x: 150,
  y: 50
}, {
  chapter: 13,
  x: 170,
  y: 50
}, {
  chapter: 14,
  x: 177,
  y: 239
}, {
  chapter: 15,
  x: 137,
  y: 291
}, {
  chapter: 16,
  x: 165,
  y: 291
}];
export function atlasSVG() {
  return `<svg viewBox="0 0 300 440" class="body-atlas" role="img" aria-labelledby="atlasSvgTitle atlasSvgDesc"><title id="atlasSvgTitle">Schematic body-system navigator</title><desc id="atlasSvgDesc">Approximate system markers. The numbered text buttons provide the same navigation. Distributed systems are represented by one marker, not their anatomical extent.</desc><defs><linearGradient id="bodyShade" x2="1" y2="1"><stop stop-color="var(--sage)"/><stop offset="1" stop-color="var(--hero-bg)"/></linearGradient></defs><path d="M150 20c-19 0-29 15-29 33 0 14 6 23 16 28v16l-36 12c-11 4-14 15-18 29L55 230q-4 16 7 18 10 2 15-11l24-73 1 107-14 130q-2 17 10 18 12 1 14-14l28-109h20l28 109q2 15 14 14 12-1 10-18l-14-130 1-107 24 73q5 13 15 11 11-2 7-18l-28-92c-4-14-7-25-18-29l-36-12V81c10-5 16-14 16-28 0-18-10-33-29-33Z" fill="url(#bodyShade)" stroke="var(--control-line)" stroke-width="1.5"/>${ATLAS_NODES.map((n, i) => `<g class="atlas-node ${n.chapter === app.atlasChapter ? 'selected' : ''}" data-advance="atlasSelect" data-id="${n.chapter}" aria-hidden="true"><circle cx="${n.x}" cy="${n.y}" r="12"/><text x="${n.x}" y="${n.y + 4}" text-anchor="middle">${i + 1}</text></g>`).join('')}<path d="M150 95V275" stroke="var(--line)" stroke-dasharray="3 5" fill="none"/></svg>`;
}
export function atlasPage() {
  const c = chapter(app.atlasChapter),
    m = getModule('ch' + c.id),
    terms = TERMS.filter(t => t.chapter === c.id),
    curated = terms.filter(t => t.parts.length),
    roots = [...new Map(curated.flatMap(t => t.parts.filter(p => p.type === 'root')).map(p => [p.text, p])).values()].slice(0, 8);
  renderPage(studioHeader('atlas', 'Connect a system to its chapter, word roots and learning activities.') + `<div class="atlas-layout"><section class="surface atlas-visual">${scene3DFrame('atlas',atlasSVG(),{label:'Draggable 3D body-system navigator',markers:ATLAS_NODES})}<p class="access-note">3D schematic navigation only; this simplified figure is not a detailed anatomical model. Locations are approximate; several systems are distributed throughout the body.</p></section><section class="surface"><div class="pill-row atlas-system-list">${ATLAS_NODES.map((n, i) => `<button class="filter-pill ${n.chapter === c.id ? 'active' : ''}" data-advance="atlasSelect" data-id="${n.chapter}" aria-pressed="${n.chapter === c.id}">${i + 1} · ${esc(chapter(n.chapter).name)}</button>`).join('')}</div><span class="eyebrow">CHAPTER ${c.id}</span><h2>${esc(c.name)}</h2><p>${esc(c.tagline || m.subtitle)}</p><div class="data-facts"><div><strong>${terms.length}</strong><span>term records</span></div><div><strong>${curated.length}</strong><span>with companion word parts</span></div><div><strong>${pct(terms.filter(t => app.state.learned.includes(t.id)).length, terms.length)}%</strong><span>self-rated familiar</span></div></div><h3>Roots in this chapter</h3><div class="anatomy-inline">${roots.map(p => `<span class="root">${esc(p.text)}<small>${esc(p.meaning)}</small></span>`).join('') || '<p class="muted">No curated roots are recorded for this chapter yet.</p>'}</div><div class="term-actions"><a class="btn primary" href="#module?id=${m.id}">Open chapter</a><button class="btn" data-advance="atlasJourney">Start connected journey</button><a class="btn" href="#library?chapter=${c.id}">Explore terms</a></div></section></div><section class="surface"><h2>Explore a term</h2><div class="related">${(curated.length ? curated : terms).slice(0, 10).map(t => `<button class="filter-pill" data-action="term" data-id="${t.id}">${esc(t.term)}</button>`).join('')}</div></section>`, {
    overview: false
  });
}
export function connectedJourney() {
  const t = TERMS.find(t => t.chapter === app.atlasChapter && t.parts.length && t.plain !== t.definition);
  app.noteModule = 'ch' + app.atlasChapter;
  if (t) {
    app.explainTerm = t.id;
    app.pronounceTerm = t.id;
    app.labTerm = t.id;
  }
  showModal(`<h2 id="modalTitle" class="modal-title">Your ${esc(chapter(app.atlasChapter).name)} journey</h2><ol class="journey-list"><li><a href="#module?id=ch${app.atlasChapter}&tab=bank">Explore the chapter’s terminology</a></li>${t ? `<li><button class="text-button" data-action="term" data-id="${t.id}">Understand ${esc(t.term)}</button></li><li><a href="#wordlab">Explore the word components</a></li>` : ''}<li><a href="#studio/clinical">Interpret a fictional note</a></li><li><a href="#studio/explain">Explain a term in everyday language</a></li><li><a href="#studio/adaptive">Practise and schedule another review</a></li></ol><p class="access-note">These activities share your portfolio and practice history. Written reflections remain self- or educator-reviewed.</p>`, 'CONNECTED LEARNING');
}
export function pronunciationPage() {
  const t = termBy(app.pronounceTerm);
  renderPage(studioHeader('pronunciation', 'Listen deliberately. Repeat comfortably. Compare your own recording.') + curatedPicker('pronunciationTerm', t.id) + `<section class="surface pronunciation-stage"><span class="eyebrow">${esc(chapter(t.chapter).name)}</span><h2>${esc(t.term)}</h2><p>${esc(t.definition)}</p><div class="anatomy-inline">${t.parts.map(p => `<span class="${p.type}">${esc(p.text)}<small>${esc(p.type)}</small></span>`).join('')}</div><p class="access-note">These are word components, not phonetic syllables. Pronunciation spelling is not invented when a reviewed source is unavailable.</p><div class="term-actions"><button class="btn primary" data-action="speak" data-id="${t.id}">Listen to term</button></div>${voiceControls('studio', t.id, true)}<hr class="divider"><h3>Listen · repeat · compare</h3><p>Say the term at a comfortable pace. You may record yourself and compare with your selected device voice.</p><div class="term-actions"><button class="btn" data-advance="recordStart" id="recordStart">Record my voice</button><button class="btn" data-advance="recordStop" id="recordStop" disabled>Stop recording</button><span id="recordStatus" role="status">Optional · up to 60 seconds</span></div><div id="recordPlayback"></div><p class="access-note">Microphone access is requested only when you press Record. Audio stays in this tab unless you download it. Voice availability and browser audio support vary.</p>${rubricChecks(['I listened before repeating.', 'I compared my recording or spoken attempt.', 'I identified a sound or word to revisit.'], 'pronunciationRubric')}<button class="btn" data-advance="savePronunciation">Save practice reflection</button></section>`, {
    overview: false
  });
}
export async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    toast('Recording is unavailable in this browser. You can still listen and practise aloud.');
    return;
  }
  try {
    stopRecording();
    app.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    const chunks = [];
    app.mediaRecorder = new MediaRecorder(app.mediaStream);
    app.mediaRecorder.ondataavailable = e => {
      if (e.data.size) chunks.push(e.data);
    };
    app.mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, {
        type: app.mediaRecorder?.mimeType || 'audio/webm'
      });
      if (app.lastClip) URL.revokeObjectURL(app.lastClip.url);
      app.lastClip = {
        url: URL.createObjectURL(blob),
        type: blob.type
      };
      if ($('#recordPlayback')) $('#recordPlayback').innerHTML = `<audio controls src="${app.lastClip.url}" aria-label="Your pronunciation recording"></audio><a class="btn small" download="MedLex-Pronunciation.${blob.type.includes('mp4') ? 'm4a' : 'webm'}" href="${app.lastClip.url}">Download recording</a><p class="access-note">This recording is temporary and is not included in progress backups.</p>`;
      app.mediaStream?.getTracks().forEach(t => t.stop());
      if ($('#recordStatus')) $('#recordStatus').textContent = 'Recording stopped. Compare and reflect.';
    };
    app.mediaRecorder.start();
    app.recordingSeconds = 0;
    $('#recordStart').disabled = true;
    $('#recordStop').disabled = false;
    $('#recordStatus').textContent = 'Recording · 0 seconds';
    app.recordingTimer = setInterval(() => {
      app.recordingSeconds++;
      if ($('#recordStatus')) $('#recordStatus').textContent = 'Recording · ' + app.recordingSeconds + ' seconds';
      if (app.recordingSeconds >= 60) stopRecording();
    }, 1000);
  } catch {
    app.mediaStream?.getTracks().forEach(t => t.stop());
    toast('Microphone access was unavailable. Listening and spoken practice are still available.');
  }
}
export function stopRecording() {
  clearInterval(app.recordingTimer);
  if (app.mediaRecorder && app.mediaRecorder.state !== 'inactive') app.mediaRecorder.stop();
  app.mediaStream?.getTracks().forEach(t => t.stop());
  if ($('#recordStart')) $('#recordStart').disabled = false;
  if ($('#recordStop')) $('#recordStop').disabled = true;
}
export function savePronunciation() {
  const t = termBy(app.pronounceTerm);
  addArtifact('pronunciation', 'Pronunciation practice · ' + t.term, {
    term: t.term,
    voice: app.v3.profile.ttsVoice || 'Device default',
    rate: app.v3.profile.ttsRate || .85,
    recordingIncluded: false,
    checklist: ['Listened', 'Compared', 'Identified next step'].map((v, i) => ({
      criterion: v,
      checked: !!$('#pronunciationRubric-' + i)?.checked
    }))
  }, {
    terms: [t.id]
  });
  toast('Self-reviewed pronunciation practice saved. No automatic score was assigned.');
}
export const CODE_RUBRIC = ['The concept is explicitly documented.', 'Missing or ambiguous information is identified.', 'Jurisdiction, reference and edition are recorded.', 'Index and tabular verification steps are described.', 'A code is not inferred from a word alone.'];
export function codingPage() {
  const m = getModule(app.noteModule),
    key = 'coding:' + m.id;
  renderPage(studioHeader('coding', 'Practise documentation analysis and a traceable verification process.') + modulePicker('codingModule', m.id) + `<div class="studio-two-col"><section class="surface"><span class="eyebrow">FICTIONAL DOCUMENTATION</span><blockquote class="clinical-note">${highlightNote(m.case[0])}</blockquote>${draftField('Documented concept or intervention', key + ':concept', {
    rows: 2
  })}${draftField('Missing detail or clarification needed', key + ':missing', {
    rows: 3
  })}<div class="settings-grid">${draftField('Jurisdiction / setting', key + ':jurisdiction', {
    rows: 2
  })}${draftField('Classification / edition / source date', key + ':edition', {
    rows: 2
  })}</div>${draftField('Proposed index route and tabular checks', key + ':route', {
    rows: 4
  })}${draftField('Rationale and educator questions', key + ':rationale', {
    rows: 3
  })}${rubricChecks(CODE_RUBRIC, 'codingRubric')}<button class="btn primary" data-advance="saveCoding">Save verification worksheet</button></section><aside class="surface" aria-label="Coding references"><h2>Separate the roles.</h2><dl class="help-details"><div><dt>ICD-10-AM</dt><dd>Diagnosis classification.</dd></div><div><dt>ACHI</dt><dd>Intervention classification.</dd></div><div><dt>ACS</dt><dd>Standards for applying the classifications.</dd></div><div><dt>SNOMED CT</dt><dd>Clinical terminology; it has a different role from an episode classification.</dd></div></dl><p class="access-note">These summaries are retained from the original companion course. Use the applicable licensed references and current advice with your educator.</p><div class="journey-list"><a href="https://www.ihacpa.gov.au/resources/icd-10-amachiacs-thirteenth-edition" target="_blank" rel="noopener">IHACPA edition resources ↗</a><a href="https://www.ihacpa.gov.au/resources/national-coding-advice" target="_blank" rel="noopener">National Coding Advice ↗</a><a href="https://www.snomed.org/what-is-snomed-ct" target="_blank" rel="noopener">SNOMED International ↗</a><a href="#module?id=${m.id}&tab=practice">Original coding-literacy questions →</a></div><p class="access-note">No codes are assigned automatically. Online reference changes are not synchronised into this offline file.</p></aside></div>`, {
    overview: false
  });
}
export function saveCoding() {
  const m = getModule(app.noteModule),
    key = 'coding:' + m.id;
  if (!(xp().drafts[key + ':concept'] || '').trim()) {
    toast('Record the documented concept before saving.');
    return;
  }
  const body = {
    note: m.case[0]
  };
  for (const f of ['concept', 'missing', 'jurisdiction', 'edition', 'route', 'rationale']) body[f] = xp().drafts[key + ':' + f] || '';
  body.checklist = CODE_RUBRIC.map((v, i) => ({
    criterion: v,
    checked: !!$('#codingRubric-' + i)?.checked
  }));
  addArtifact('coding', 'Documentation verification · ' + m.title, body, {
    module: m.id,
    terms: matchingTerms(m.case[0]).map(t => t.id)
  });
  toast('Verification worksheet saved for self or educator review.');
}
export function editorialStatus(id) {
  const r = xp().editorial[id];
  return !r ? 'Original companion · review not recorded' : r.status === 'draft' ? 'Local enrichment draft' : r.status === 'educator' ? 'Educator review recorded' : 'Medical-editor review recorded';
}
export function termEnrichment(id) {
  const t = termBy(id);
  if (!t) return '';
  const r = xp().editorial[id],
    ev = xp().events.filter(e => e.termId === id && e.objective),
    delayed = ev.filter(e => e.correct && e.gapDays >= 7);
  return `<section class="profile-enrichment"><div class="section-head"><div><span class="eyebrow">CONTENT & LEARNING RECORD</span><h3>${editorialStatus(id)}</h3></div><button class="info-button" data-advance="help" data-id="editor" aria-label="About editorial review">i</button></div>${r ? `<div class="callout"><strong>Local editorial overlay · ${esc(r.status)}</strong>${r.plain ? `<p><strong>Everyday explanation:</strong> ${esc(r.plain)}</p>` : ''}${r.example ? `<p><strong>Fictional example:</strong> ${esc(r.example)}</p>` : ''}${r.confusion ? `<p><strong>Common confusion:</strong> ${esc(r.confusion)}</p>` : ''}${r.components ? `<p><strong>Component review notes:</strong> ${esc(r.components)}</p>` : ''}<p class="source-line">${esc(r.reviewer || 'Reviewer not recorded')} · ${esc(r.reviewedAt || 'Review date not recorded')}<br>${esc(r.source || 'Source not recorded')}</p><p class="access-note">Review details are entered locally. They are not independently verified, and overlays are not used to grade questions.</p></div>` : '<p class="access-note">The original term is preserved. Missing enrichment remains an editorial task; no artificial word split is added.</p>'}<div class="data-facts"><div><strong>${app.state.saved.includes(id) ? 'Yes' : 'No'}</strong><span>saved</span></div><div><strong>${app.state.learned.includes(id) ? 'Yes' : 'No'}</strong><span>self-rated familiar</span></div><div><strong>${ev.filter(e => e.correct).length}/${ev.length}</strong><span>objective responses correct</span></div><div><strong>${delayed.length}</strong><span>correct after ≥7-day gap</span></div></div><div class="term-actions"><button class="btn small" data-advance="journeyTerm" data-id="${id}">Continue learning journey</button><button class="btn small" data-advance="editTerm" data-id="${id}">Editorial notes</button></div></section>`;
}
export function editorPage() {
  const t = termBy(app.editorTerm) || TERMS[0],
    r = xp().editorial[t.id] || {},
    count = Object.keys(xp().editorial).length;
  renderPage(studioHeader('editor', 'Enrich a term while preserving its original medical record.') + `<div class="data-facts"><div><strong>${count}</strong><span>local overlays</span></div><div><strong>${Object.values(xp().editorial).filter(r => r.status !== 'draft').length}</strong><span>review declarations</span></div><div><strong>${TERMS.filter(t => !t.parts.length || t.plain === t.definition).length}</strong><span>terms with enrichment gaps</span></div></div><label class="field"><span>Find a term</span><input id="editorSearch" list="editorOptions" placeholder="Enter a term name" value="${esc(t.term)}"><datalist id="editorOptions">${TERMS.map(t => `<option value="${esc(t.term)}">${esc(chapter(t.chapter).name)}</option>`).join('')}</datalist></label><div class="studio-two-col"><section class="surface"><span class="eyebrow">PRESERVED ORIGINAL</span><h2>${esc(t.term)}</h2><p>${esc(t.definition)}</p>${t.plain !== t.definition ? `<p><strong>Companion explanation:</strong> ${esc(t.plain)}</p>` : ''}<p class="source-line">${esc(sourceFor(t))}</p><button class="btn" data-action="term" data-id="${t.id}">Inspect original term sheet</button><p class="access-note">The form creates a labelled overlay. It does not replace the original definition or add unreviewed material to graded questions.</p></section><section class="surface"><h2>Local enrichment & review</h2><form id="editorForm"><label class="field"><span>Plain-language explanation</span><textarea name="plain" rows="3" maxlength="2000">${esc(r.plain || '')}</textarea></label><label class="field"><span>Useful fictional example</span><textarea name="example" rows="3" maxlength="2000">${esc(r.example || '')}</textarea></label><label class="field"><span>Common confusion / important qualifier</span><textarea name="confusion" rows="3" maxlength="2000">${esc(r.confusion || '')}</textarea></label><label class="field"><span>Verified component notes and source (optional)</span><textarea name="components" rows="3" maxlength="2000">${esc(r.components || '')}</textarea></label><label class="field"><span>Source URL or bibliographic citation</span><input name="source" maxlength="800" value="${esc(r.source || '')}"></label><div class="settings-grid"><label class="field"><span>Reviewer name / role</span><input name="reviewer" maxlength="100" value="${esc(r.reviewer || '')}"></label><label class="field"><span>Review date</span><input name="reviewedAt" type="date" value="${esc(r.reviewedAt || '')}"></label></div><label class="field"><span>Local status declaration</span><select name="status" class="select">${[['draft', 'Draft · not reviewed'], ['educator', 'Educator review recorded'], ['medical', 'Medical-editor review recorded']].map(([v, l]) => `<option value="${v}" ${r.status === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label><label class="inline-check"><input type="checkbox" name="attest"> I am recording an actual review against the stated source.</label><p class="access-note">A named review is a local declaration, not independent verification or accreditation.</p><button class="btn primary" type="submit">Save editorial overlay</button></form></section></div>`, {
    overview: false
  });
}
export function saveEditorial(form) {
  const f = new FormData(form),
    r = Object.fromEntries(['plain', 'example', 'confusion', 'components', 'source', 'reviewer', 'reviewedAt', 'status'].map(k => [k, String(f.get(k) || '').trim()]));
  if (r.status !== 'draft' && (!r.source || !r.reviewer || !r.reviewedAt || !f.has('attest'))) {
    toast('A review declaration needs a source, reviewer, date and confirmation of actual review. Otherwise save as Draft.');
    return;
  }
  if (r.reviewedAt && new Date(r.reviewedAt + 'T23:59:59') > new Date(Date.now() + 86400000)) {
    toast('Use the actual review date, not a future date.');
    return;
  }
  xp().editorial[app.editorTerm] = {
    ...r,
    updated: Date.now()
  };
  persist();
  toast('Labelled editorial overlay saved. The original term is unchanged.');
  editorPage();
}
export const ASSIGN_TYPES = [['meaning', 'Knowledge check'], ['spelling', 'Spelling retrieval'], ['components', 'Word components'], ['clinical', 'Clinical note reflection'], ['explain', 'Everyday explanation'], ['coding', 'Documentation verification'], ['independent', 'Independent study']];
export function educatorPage() {
  const x = xp();
  renderPage(studioHeader('educator', 'Create purposeful assignments and give traceable, rubric-based feedback.') + `<div class="studio-two-col"><section class="surface"><h2>Build an assignment</h2><form id="assignmentForm"><label class="field"><span>Assignment title</span><input name="title" maxlength="120" required placeholder="e.g. Cardiovascular terminology in context"></label><div class="settings-grid"><label class="field"><span>Audience / group label</span><input name="audience" maxlength="80" placeholder="Use a group label, not sensitive records"></label><label class="field"><span>Due date (optional)</span><input name="due" type="date"></label></div><fieldset class="assignment-modules"><legend>Choose up to four modules</legend>${COURSE_MODULES.filter(m => !m.affixKind).map(m => `<label><input type="checkbox" name="modules" value="${m.id}" ${m.id === app.course.last ? 'checked' : ''}><span>${esc(m.title)}</span></label>`).join('')}</fieldset><fieldset class="rubric-checks"><legend>Activities to include</legend>${ASSIGN_TYPES.map(([v, l], i) => `<label><input type="checkbox" name="activities" value="${v}" ${[0, 3, 6].includes(i) ? 'checked' : ''}><span>${l}</span></label>`).join('')}</fieldset><label class="field"><span>Educator instructions</span><textarea name="instructions" rows="3" maxlength="2000" placeholder="Describe the learning task and evidence expected."></textarea></label><button class="btn primary" type="submit">Create assignment</button></form></section><aside class="surface" aria-label="Assignments and educator feedback"><h2>Your assignment library</h2><div id="assignmentList">${x.assignments.map(a => assignmentRow(a)).join('') || '<p class="muted">Assignments you create will appear here.</p>'}</div><hr class="divider"><h3>Review learning evidence</h3><p>Use your educator judgement to record feedback. Local reviewer names are declarations, not authenticated accounts.</p><a href="#studio/portfolio" class="btn">Open evidence portfolio</a><label class="btn file-label">Import learner evidence JSON<input type="file" id="importEvidence" accept=".json,application/json"></label><button class="btn" data-advance="feedbackCSV">Export feedback CSV</button><p class="access-note">Packs are downloaded for you to distribute. This offline app does not send messages, authenticate reviewers or provide a shared class dashboard.</p></aside></div>`, {
    overview: false
  });
}
export function assignmentRow(a) {
  return `<article class="assignment-row"><h3>${esc(a.title)}</h3><p>${a.modules.length} modules · ${a.activities.length} activity types${a.due ? ' · Due ' + esc(a.due) : ''}</p><div class="term-actions"><button class="btn small" data-advance="assignmentPack" data-id="${a.id}">Learner pack</button><button class="btn small" data-advance="assignmentGuide" data-id="${a.id}">Educator guide</button></div></article>`;
}
export function createAssignment(form) {
  const f = new FormData(form),
    modules = f.getAll('modules').filter(id => COURSE_MODULES.some(m => m.id === id)),
    activities = f.getAll('activities').filter(id => ASSIGN_TYPES.some(t => t[0] === id));
  if (!modules.length || modules.length > 4 || !activities.length) {
    toast('Choose one to four modules and at least one activity type.');
    return;
  }
  const a = {
    id: uid('assignment'),
    title: String(f.get('title')).slice(0, 120),
    audience: String(f.get('audience') || '').slice(0, 80),
    due: String(f.get('due') || ''),
    instructions: String(f.get('instructions') || '').slice(0, 2000),
    modules,
    activities,
    created: Date.now(),
    questions: {}
  };
  for (const id of modules) {
    const m = getModule(id);
    a.questions[id] = Object.fromEntries(['meaning', 'spelling', 'components'].filter(mode => activities.includes(mode)).map(mode => [mode, createQuestions(m, mode).slice(0, 5)]));
  }
  xp().assignments.unshift(a);
  xp().assignments = xp().assignments.slice(0, 50);
  persist();
  educatorPage();
  toast('Assignment created. Download a learner pack or educator guide.');
}
export function printableHTML(title, body) {
  let fontCSS='';try{fontCSS=[...document.styleSheets].flatMap(s=>[...s.cssRules]).filter(r=>r.type===5).map(r=>r.cssText).join('');}catch{}
  return `<!doctype html><html lang="en-AU"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · MedLex</title><style>${fontCSS}.print-crest svg{width:100%;height:100%}:root{color-scheme:light}*{box-sizing:border-box}body{max-width:900px;margin:36px auto;padding:24px;font:16px/1.7 Studio,Arial,sans-serif;color:#10253a;background:#fffdf9}h1{font-family:Editorial,Georgia,serif;line-height:1.25}h2,h3{font-family:Studio,Arial,sans-serif;line-height:1.3}h1{font-size:36px}h2{font-size:27px;margin-top:36px}h3{font-size:22px}a{color:#08706d}header{border-bottom:3px solid #c9a24a}article,section{break-inside:auto;margin-block:24px}tr{break-inside:avoid}thead{display:table-header-group}td,th{overflow-wrap:anywhere}table{width:100%;border-collapse:collapse}th,td{border:1px solid #7a8484;padding:10px;text-align:left;vertical-align:top}button{font:inherit;padding:12px 20px;min-height:44px;color:#fff;background:#08706d;border:0}.writing-space{min-height:100px;border-bottom:1px solid #7a8484;margin-bottom:24px}.meta{font-size:14px;color:#526168}blockquote{border-left:3px solid #08706d;padding-left:20px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}@media print{button{display:none}body{margin:0;padding:0;background:white}}@page{margin:18mm}</style><header><div style="display:flex;gap:16px;align-items:center"><div class="print-crest" style="width:56px;height:56px;flex:none">${document.querySelector('.hca-crest')?.innerHTML||''}</div><p class="meta">HEALTHCARE CROWN ACADEMY · MEDLEX</p></div><h1>${esc(title)}</h1></header><p><button onclick="window.print()">Print / Save as PDF</button></p>${body}<footer class="meta">Educational terminology support. Fictional cases. Proposed curriculum alignment requires educator verification. This record does not certify clinical competence or accreditation.<br>By HEALTHCARE CROWN ACADEMY LTD · Company 17501904</footer></html>`;
}
export function assignmentPack(id, teacher = false) {
  const a = xp().assignments.find(a => a.id === id);
  if (!a) return;
  let body = `<p class="meta">Assignment ${esc(a.id)} · ${esc(a.audience)}${a.due ? ' · Due ' + esc(a.due) : ''}</p><p>${esc(a.instructions)}</p><p>Learner / group identifier: __________________________</p>`;
  for (const id of a.modules) {
    const m = getModule(id),
      q = a.questions[id] || {};
    body += `<section><h2>${esc(m.title)}</h2><p>${esc(m.subtitle)}</p><h3>Proposed learning outcomes</h3><ul>${m.outcomes.map(o => `<li>${esc(o.id)}: ${esc(o.text)}</li>`).join('')}</ul><p class="meta">${esc(m.reference)}</p>`;
    for (const mode of ['meaning', 'spelling', 'components']) if (q[mode]) body += `<h3>${esc(ASSIGN_TYPES.find(t => t[0] === mode)[1])}</h3><ol>${q[mode].map(item => `<li><p>${esc(item.prompt)}</p>${teacher ? `<p><strong>Companion answer:</strong> ${esc(item.correct)}</p><p>${esc(item.explain)}</p>` : '<div class="writing-space"></div>'}</li>`).join('')}</ol>`;
    if (a.activities.includes('clinical')) body += `<h3>Clinical note interpretation</h3><blockquote>${esc(m.case[0])}</blockquote><p>Explain the words, separate facts from assumptions and identify a verification step.</p>${teacher ? `<p><strong>Companion model:</strong> ${esc(m.case[1])}</p>` : '<div class="writing-space"></div>'}`;
    if (a.activities.includes('explain')) {
      const t = bankFor(m).find(t => t.plain !== t.definition) || bankFor(m)[0];
      if (t) body += `<h3>Everyday explanation</h3><p>Explain “${esc(t.term)}”: ${esc(t.definition)}</p>${teacher && t.plain !== t.definition ? `<p>Comparison wording: ${esc(t.plain)}</p>` : '<div class="writing-space"></div>'}`;
    }
    if (a.activities.includes('coding')) body += '<h3>Documentation verification</h3><p>Record the documented concept, missing information, jurisdiction, reference edition, index route and tabular verification checks. Do not infer a diagnosis or code from a word alone.</p><div class="writing-space"></div>';
    if (a.activities.includes('independent')) body += `<h3>Independent study away from the screen</h3>${m.independent.slice(0, 2).map(v => `<h4>${esc(v.title)}</h4><p>${esc(v.task)}</p><p>Bring back: ${esc(v.evidence)}</p>`).join('')}`;
    body += '</section>';
  }
  body += `<section><h2>Review rubric</h2><table><tr><th>Criterion</th><th>Evidence / educator feedback</th></tr>${['Meaning accuracy', 'Context and uncertainty', 'Clear communication', 'Verification and reference use'].map(v => `<tr><td>${v}</td><td>Not yet / Developing / Meets task / Extends task<br>Evidence: ____________________</td></tr>`).join('')}</table><p class="meta">Qualitative written tasks need human judgement. A completion tick is not an automatic correctness score.</p></section>`;
  downloadText(`MedLex-${teacher ? 'Educator' : 'Learner'}-${id}.html`, printableHTML(a.title, body), 'text/html');
}
export function evidenceTitle(a) {
  return a.basis === 'objective' ? 'Objective task result' : a.basis === 'imported' ? 'Imported learner evidence' : 'Self-reviewed reflection';
}
export function bodyHTML(body) {
  if (body == null) return '';
  if (typeof body !== 'object') return `<p>${esc(body)}</p>`;
  return Object.entries(body).map(([k, v]) => `<div class="evidence-field"><strong>${esc(k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()))}</strong>${typeof v === 'string' ? `<p>${esc(v)}</p>` : `<pre>${esc(JSON.stringify(v, null, 2))}</pre>`}</div>`).join('');
}
export function feedbackHTML(id) {
  const f = xp().feedback[id];
  return f ? `<div class="callout"><strong>Educator-entered feedback</strong><p>${esc(f.reviewer)} · ${new Date(f.date).toLocaleDateString('en-AU')}</p><p>${esc(f.comments)}</p><p>${Object.entries(f.ratings || {}).map(([k, v]) => esc(k) + ': ' + esc(v)).join(' · ')}</p><p class="access-note">Local review declaration; reviewer identity is not authenticated.</p></div>` : '';
}
export function portfolioPage() {
  const x = xp(),
    objective = x.events.filter(e => e.objective),
    delayed = objective.filter(e => e.gapDays >= 7),
    retained = new Set(delayed.filter(e => e.correct).map(e => e.termId)).size;
  renderPage(studioHeader('portfolio', 'Keep the basis of every learning claim visible.') + `<div class="skill-grid"><article class="surface"><strong class="metric-number">${app.state.learned.length}</strong><p>Self-rated familiar</p></article><article class="surface"><strong class="metric-number">${objective.length ? pct(objective.filter(e => e.correct).length, objective.length) + '%' : '—'}</strong><p>Objective response accuracy<br>${objective.length} responses</p></article><article class="surface"><strong class="metric-number">${retained}</strong><p>Terms answered correctly after a gap of ≥7 days</p></article><article class="surface"><strong class="metric-number">${x.artifacts.length}</strong><p>Saved evidence items</p></article></div><section class="surface"><div class="section-head"><div><h2>Evidence you can inspect</h2><p>Saved words and self-ratings remain separate from objective answers and written reflections.</p></div>${helpButton('portfolio')}</div><div class="toolbar"><label class="field"><span>Evidence type</span><select id="evidenceFilter" class="select"><option value="all">All evidence</option><option value="objective">Objective task results</option><option value="self-review">Self-reviewed reflections</option><option value="feedback">With educator feedback</option></select></label><button class="btn primary" data-advance="portfolioHTML">Download portfolio report</button><button class="btn" data-advance="portfolioJSON">Download learner evidence JSON</button><button class="btn" data-action="export">Full progress backup</button></div><div id="evidenceList">${evidenceList('all')}</div></section><section class="surface"><h2>Portable encrypted backup</h2><p>Protect a full progress export with a passphrase before transferring it yourself to another device. This is an offline handoff, not automatic account synchronisation.</p><form id="encryptedExport" class="settings-grid"><label class="field"><span>Passphrase · at least 12 characters</span><input type="password" name="passphrase" minlength="12" maxlength="200" autocomplete="new-password" required></label><label class="field"><span>Repeat passphrase</span><input type="password" name="confirm" minlength="12" maxlength="200" autocomplete="new-password" required></label><button class="btn" type="submit">Download encrypted backup</button></form><details><summary>Restore an encrypted backup</summary><form id="encryptedImport"><label class="field"><span>Encrypted MedLex file</span><input type="file" name="backup" accept=".medlex,.json" required></label><label class="field"><span>Passphrase</span><input type="password" name="passphrase" autocomplete="current-password" required></label><button class="btn" type="submit">Decrypt & preview</button></form><div id="encryptedPreview"></div></details><p class="access-note">Keep the passphrase separately. It cannot be recovered by the app. Audio recordings are not part of the backup.</p></section>`, {
    overview: false
  });
}
export function evidenceList(filter) {
  const list = xp().artifacts.filter(a => filter === 'all' || filter === 'feedback' ? filter !== 'feedback' || xp().feedback[a.id] : a.basis === filter);
  return list.slice(0, 100).map(a => `<article class="evidence-row"><div><span class="evidence-badge">${evidenceTitle(a)}</span><h3>${esc(a.title)}</h3><p>${a.importedFrom ? 'Imported from ' + esc(a.importedFrom) + ' · ' : ''}${new Date(a.date).toLocaleString('en-AU')}${a.score !== null ? ' · ' + a.score + '/' + a.total + ' correct' : ''}${xp().feedback[a.id] ? ' · Educator feedback recorded' : ''}</p></div><div class="term-actions"><button class="btn small" data-advance="viewArtifact" data-id="${a.id}">Inspect evidence</button><button class="btn small" data-advance="reviewArtifact" data-id="${a.id}">Add educator feedback</button></div></article>`).join('') || '<p class="muted">No evidence matches this view. Complete a studio task and save its reflection or assessment result.</p>';
}
export function viewArtifact(id) {
  const a = xp().artifacts.find(a => a.id === id);
  if (!a) return;
  showModal(`<h2 id="modalTitle" class="modal-title">${esc(a.title)}</h2><p class="modal-subtitle">${evidenceTitle(a)}${a.importedFrom ? ' · Imported from ' + esc(a.importedFrom) : ''} · ${new Date(a.date).toLocaleString('en-AU')}${a.score !== null ? ' · ' + a.score + '/' + a.total + ' correct' : ''}</p>${bodyHTML(a.body)}${feedbackHTML(id)}<p class="access-note">This records the listed learning task. It does not certify clinical competence.</p>`, 'INSPECTABLE LEARNING EVIDENCE');
}
export function reviewEvidence(id) {
  const a = xp().artifacts.find(a => a.id === id);
  if (!a) return;
  app.reviewArtifact = id;
  const f = xp().feedback[id] || {};
  showModal(`<h2 id="modalTitle" class="modal-title">Feedback · ${esc(a.title)}</h2><p class="modal-subtitle">Record human judgement against the task. Names are local declarations.</p><details><summary>Inspect learner evidence</summary>${bodyHTML(a.body)}</details><form id="feedbackForm"><label class="field"><span>Link feedback to an assignment · optional</span><select class="select" name="assignment"><option value="">No assignment selected</option>${xp().assignments.map(a => `<option value="${a.id}" ${f.assignmentId === a.id ? 'selected' : ''}>${esc(a.title)}</option>`).join('')}</select></label><label class="field"><span>Educator / reviewer name and role</span><input name="reviewer" maxlength="100" value="${esc(f.reviewer || '')}" required></label>${['Meaning accuracy', 'Context and uncertainty', 'Communication', 'Verification'].map(k => `<label class="field"><span>${k}</span><select class="select" name="${k}">${['Not assessed', 'Not yet', 'Developing', 'Meets this task', 'Extends this task'].map(v => `<option ${(f.ratings || {})[k] === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>`).join('')}<label class="field"><span>Evidence, feedback and next step</span><textarea name="comments" rows="4" maxlength="3000" required>${esc(f.comments || '')}</textarea></label><label class="inline-check"><input type="checkbox" name="attest" required> I have reviewed this evidence and am recording my own judgement.</label><button class="btn primary" type="submit">Save educator feedback</button></form>`, 'HUMAN REVIEW');
}
export function saveFeedback(form) {
  const f = new FormData(form);
  if (!f.has('attest')) return;
  xp().feedback[app.reviewArtifact] = {
    assignmentId: String(f.get('assignment') || ''),
    reviewer: String(f.get('reviewer')).slice(0, 100),
    comments: String(f.get('comments')).slice(0, 3000),
    date: Date.now(),
    ratings: Object.fromEntries(['Meaning accuracy', 'Context and uncertainty', 'Communication', 'Verification'].map(k => [k, String(f.get(k))]))
  };
  persist();
  closeModal();
  portfolioPage();
  toast('Educator-entered feedback saved with its review declaration.');
}
export function portfolioReport() {
  let body = `<p>Prepared ${new Date().toLocaleString('en-AU')} · ${esc(app.state.name || 'Learner')}</p><p>Objective task results, self-reviewed reflections and educator-entered feedback are identified separately. This report is not a qualification or clinical competence certificate.</p>`;
  for (const a of xp().artifacts) body += `<article><h2>${esc(a.title)}</h2><p class="meta">${evidenceTitle(a)}${a.importedFrom ? ' · Imported from ' + esc(a.importedFrom) : ''} · ${new Date(a.date).toLocaleString('en-AU')}${a.score !== null ? ' · ' + a.score + '/' + a.total + ' correct' : ''}</p>${bodyHTML(a.body)}${feedbackHTML(a.id)}</article>`;
  body += originalRecordReport();
  downloadText('MedLex-Learning-Evidence.html', printableHTML('Learning evidence portfolio', body), 'text/html');
}
export function evidenceJSON() {
  downloadText('MedLex-Learner-Evidence.json', JSON.stringify({
    app: 'MedLexEvidence',
    version: 1,
    label: app.state.name || 'Learner',
    exported: new Date().toISOString(),
    artifacts: xp().artifacts,
    feedback: xp().feedback
  }, null, 2), 'application/json');
}
export async function importEvidence(file) {
  try {
    if (file.size > 3e6) throw Error('Choose an evidence file smaller than 3 MB.');
    const data = JSON.parse(await file.text());
    if (data.app !== 'MedLexEvidence' || data.version !== 1 || !Array.isArray(data.artifacts) || data.artifacts.length > 500) throw Error('Choose a MedLex learner evidence export.');
    const valid = data.artifacts.every(a => a && typeof a.id === 'string' && typeof a.title === 'string' && a.title.length <= 300 && Number.isFinite(a.date) && a.body && typeof a.body === 'object' && !Array.isArray(a.body));
    if (!valid) throw Error('This file has invalid evidence records.');
    app.pendingEvidence = data;
    showModal(`<h2 id="modalTitle" class="modal-title">Import learner evidence?</h2><p>${data.artifacts.length} items from ${esc(String(data.label || 'Learner').slice(0, 100))}. Imported records keep their original basis and are labelled with their source. Existing IDs are skipped.</p><button class="btn primary" data-advance="confirmEvidence">Import these items</button><button class="btn" data-action="close">Cancel</button>`, 'EVIDENCE IMPORT PREVIEW');
  } catch (e) {
    toast(e.message);
  }
}
export function confirmEvidence() {
  if (!app.pendingEvidence) return;
  const ids = new Set(xp().artifacts.map(a => a.id));
  let count = 0;
  for (const a of app.pendingEvidence.artifacts) if (!ids.has(a.id)) {
    xp().artifacts.push({
      ...a,
      title: a.title.slice(0, 300),
      importedFrom: String(app.pendingEvidence.label || 'Learner').slice(0, 100),
      originalBasis: a.basis,
      basis: 'imported'
    });
    ids.add(a.id);
    count++;
  }
  xp().artifacts = xp().artifacts.sort((a, b) => b.date - a.date).slice(0, 500);
  app.pendingEvidence = null;
  persist();
  closeModal();
  portfolioPage();
  toast(count + ' learner evidence items imported. Existing feedback was not overwritten.');
}
export function exportFeedbackCSV() {
  downloadText('MedLex-Educator-Feedback.csv', csv([['Evidence ID', 'Title', 'Basis', 'Reviewer declaration', 'Review date', 'Comments', ...['Meaning accuracy', 'Context and uncertainty', 'Communication', 'Verification']], ...xp().artifacts.filter(a => xp().feedback[a.id]).map(a => {
    const f = xp().feedback[a.id];
    return [a.id, a.title, a.basis, f.reviewer, new Date(f.date).toISOString(), f.comments, ...['Meaning accuracy', 'Context and uncertainty', 'Communication', 'Verification'].map(k => f.ratings[k])];
  })]), 'text/csv');
}
export function b64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 16384) s += String.fromCharCode(...bytes.subarray(i, i + 16384));
  return btoa(s);
}
export function unb64(s) {
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}
export async function backupKey(passphrase, salt, usage) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({
    name: 'PBKDF2',
    salt,
    iterations: 250000,
    hash: 'SHA-256'
  }, base, {
    name: 'AES-GCM',
    length: 256
  }, false, usage);
}
export async function encryptBackup(form) {
  const f = new FormData(form),
    password = String(f.get('passphrase'));
  if (password.length < 12 || password !== String(f.get('confirm'))) {
    toast('Use matching passphrases with at least 12 characters.');
    return;
  }
  if (!crypto.subtle) {
    toast('Encrypted backups require a browser with Web Crypto support. Use a full progress export instead.');
    return;
  }
  const button = form.querySelector('button');
  button.disabled = true;
  try {
    saveV3();
    const salt = crypto.getRandomValues(new Uint8Array(16)),
      iv = crypto.getRandomValues(new Uint8Array(12)),
      key = await backupKey(password, salt, ['encrypt']),
      data = new TextEncoder().encode(JSON.stringify({
        app: 'MedLex',
        version: 4,
        data: {
          ...app.v3,
          schemaVersion: 4
        }
      })),
      cipher = await crypto.subtle.encrypt({
        name: 'AES-GCM',
        iv
      }, key, data);
    downloadText('MedLex-Encrypted-Backup.medlex', JSON.stringify({
      app: 'MedLexEncrypted',
      version: 1,
      algorithm: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA256',
      iterations: 250000,
      salt: b64(salt),
      iv: b64(iv),
      cipher: b64(new Uint8Array(cipher))
    }), 'application/json');
    form.reset();
    toast('Encrypted backup downloaded. Keep its passphrase separately.');
  } catch {
    toast('The encrypted export could not be created. Your local learning record is unchanged.');
  } finally {
    button.disabled = false;
  }
}
export async function decryptBackup(form) {
  const f = new FormData(form),
    file = f.get('backup'),
    button = form.querySelector('button');
  button.disabled = true;
  try {
    if (!file || file.size > 50e6) throw Error('Choose an encrypted backup smaller than 50 MB.');
    const envelope = JSON.parse(await file.text());
    if (envelope.app !== 'MedLexEncrypted' || envelope.version !== 1 || envelope.iterations !== 250000 || envelope.algorithm !== 'AES-256-GCM') throw Error('Choose a supported MedLex encrypted backup.');
    const salt = unb64(envelope.salt),
      iv = unb64(envelope.iv);
    if (salt.length !== 16 || iv.length !== 12) throw Error('Invalid backup encryption parameters.');
    const key = await backupKey(String(f.get('passphrase')), salt, ['decrypt']),
      plain = await crypto.subtle.decrypt({
        name: 'AES-GCM',
        iv
      }, key, unb64(envelope.cipher));
    app.pendingEncrypted = validateImport(JSON.parse(new TextDecoder().decode(plain)));
    $('#encryptedPreview').innerHTML = `<div class="callout"><h3>Backup decrypted</h3><p>${app.pendingEncrypted.studio.saved.length} saved words · ${app.pendingEncrypted.v3?.expansion?.artifacts?.length || 0} evidence items. Restoring replaces this browser’s current record. Export a backup first if needed.</p><button class="btn primary" data-advance="confirmEncrypted">Restore this record</button><button class="btn" data-advance="cancelEncrypted">Cancel</button></div>`;
    form.reset();
  } catch (e) {
    app.pendingEncrypted = null;
    $('#encryptedPreview')?.replaceChildren();
    toast(e.message.includes('backup') ? e.message : 'The file could not be decrypted. Check the passphrase and choose the original backup file.');
  } finally {
    button.disabled = false;
  }
}
export function applyReading() {
  document.body.classList.toggle('focus-reading', !!xp().reading.focus);
  document.documentElement.style.setProperty('--reading-leading', String(xp().reading.spacing || 1.7));
}
export function readingControls() {
  return `<div class="reading-controls"><button class="btn small" data-advance="focus">${xp().reading.focus ? 'Leave focus mode' : 'Focus mode'}</button><label>Reading spacing<select class="select" id="readingSpacing"><option value="1.7" ${xp().reading.spacing === 1.7 ? 'selected' : ''}>Comfortable</option><option value="1.9" ${xp().reading.spacing === 1.9 ? 'selected' : ''}>Spacious</option><option value="2.1" ${xp().reading.spacing === 2.1 ? 'selected' : ''}>Extra spacious</option></select></label></div>`;
}
export function matchingPage() {
  renderPage(studioHeader('matching', 'Match five terms with their complete companion meanings.') + `<section class="surface"><h2>Find the connection.</h2><p>Select a term, then select its meaning. The board keeps matched pairs in place so you can inspect every connection.</p><button class="btn primary" data-advance="startPairs">Start a five-pair board</button><div id="pairsBoard"></div></section>`, {
    overview: false
  });
}
export function startPairs() {
  const list = shuffle(TERMS.filter(t => t.parts.length && t.plain !== t.definition)).slice(0, 5);
  app.pairRun = {
    terms: list,
    definitions: shuffle(list),
    selected: null,
    matched: [],
    wrong: {},
    attempts: 0
  };
  app.quiz = null;
  app.flash = null;
  app.exercise = null;
  app.special = null;
  if (location.hash === '#studio/matching') {
    drawPairs();
  } else {
    history.pushState(null, '', '#studio/matching');
    renderStudio('matching');
    drawPairs();
  }
}
export function drawPairs() {
  const p = app.pairRun;
  if (!$('#pairsBoard')) matchingPage();
  $('#pairsBoard').innerHTML = `<div class="pairs-progress" role="status">${p.matched.length} of ${p.terms.length} pairs matched · ${p.attempts} attempts</div><div class="pair-columns"><div><h3>Terms</h3>${p.terms.map(t => `<button class="pair-tile ${p.selected === t.id ? 'selected' : ''} ${p.matched.includes(t.id) ? 'matched' : ''}" data-advance="pairTerm" data-id="${t.id}" aria-pressed="${p.selected === t.id}" ${p.matched.includes(t.id) ? 'disabled' : ''}>${esc(t.term)}${p.matched.includes(t.id) ? ' ✓' : ''}</button>`).join('')}</div><div><h3>Meanings</h3>${p.definitions.map(t => `<button class="pair-tile ${p.matched.includes(t.id) ? 'matched' : ''}" data-advance="pairMeaning" data-id="${t.id}" ${p.matched.includes(t.id) ? 'disabled' : ''}>${esc(t.definition)}${p.matched.includes(t.id) ? ' ✓' : ''}</button>`).join('')}</div></div><div id="pairFeedback" aria-live="polite"></div>${p.matched.length === p.terms.length ? `<div class="feedback"><h3>All five connections matched.</h3><p>${p.terms.filter(t => !p.wrong[t.id]).length} matched correctly on the first attempt. The evidence records both first-attempt results and your total attempts.</p><a class="btn" href="#studio/portfolio">View evidence</a><button class="btn" data-advance="startPairs">Try a fresh board</button></div>` : ''}`;
}
export function pairMeaning(id) {
  const p = app.pairRun;
  if (!p?.selected) {
    toast('Choose a term first, then its meaning.');
    return;
  }
  if (p.matched.includes(id)) return;
  const selected = p.selected,
    correct = selected === id;
  p.attempts++;
  recordLearning(selected, 'meaning', correct, {
    source: 'pair-matching'
  });
  trackItem();
  if (correct) {
    p.matched.push(id);
    p.selected = null;
  } else p.wrong[selected] = (p.wrong[selected] || 0) + 1;
  drawPairs();
  $('#pairFeedback').innerHTML = `<div class="feedback">${correct ? 'Correct connection. Choose another term.' : 'These are different concepts. Re-read both meanings and try again.'}</div>`;
  if (p.matched.length === p.terms.length) addArtifact('matching', 'Five-pair terminology board', {
    attempts: p.attempts,
    firstAttemptCorrect: p.terms.filter(t => !p.wrong[t.id]).length,
    terms: p.terms.map(t => t.id)
  }, {
    basis: 'objective',
    score: p.terms.filter(t => !p.wrong[t.id]).length,
    total: p.terms.length,
    terms: p.terms.map(t => t.id)
  });
}
export function aboutStudio(key) {
  const h = STUDIO_INFO[key];
  showModal(`<h2 id="modalTitle" class="modal-title">${esc(h.title)}</h2><dl class="guide-five">${[['What', h.what], ['Why', h.why], ['When', h.when], ['How', h.how], ['Who', h.who]].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${researchHTML(['educator', 'hub'].includes(key) ? 'active' : 'recall')}`, 'WHAT · WHY · WHEN · HOW · WHO');
}
export function helpButton(key) {
  return guideButton('studio:' + key, STUDIO_INFO[key].title);
}
export function startOnboarding(step = 0) {
  app.onboardingStep = Math.min(1, step);
  const p = app.v3.profile,
    n = app.onboardingStep;
  showModal(`<span class="eyebrow">STEP ${n + 1} OF 2</span><h2 id="modalTitle">${n ? 'A manageable daily habit.' : 'Make this your learning space.'}</h2><form id="onboardingForm" class="profile-form">${n === 0 ? `<label>Your name · optional<input name="name" maxlength="40" autocomplete="given-name" value="${esc(app.state.name)}"></label><label>Your learning role<select name="role">${['Doctor', 'Trainee', 'Nurse', 'Allied health', 'Clinical coder', 'Educator', 'Other'].map(v => `<option ${p.role === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>${assistingLanguageField()}` : `<label>Daily learning goal<select name="goal">${[5, 10, 15, 20].map(v => `<option value="${v}" ${p.dailyGoalMin === v ? 'selected' : ''}>${v} minutes</option>`).join('')}</select></label><label>Appearance<select name="theme">${['system', 'light', 'dark'].map(v => `<option value="${v}" ${app.state.theme === v ? 'selected' : ''}>${v[0].toUpperCase() + v.slice(1)}</option>`).join('')}</select></label><details><summary>More options</summary><label>Motion<select name="motion"><option value="system">Follow device</option><option value="reduce">Reduce motion</option><option value="full">Full motion</option></select></label><label>Text size<select name="scale">${[[1, '100%'], [1.125, '112.5%'], [1.25, '125%'], [1.5, '150%']].map(([v, label]) => `<option value="${v}" ${p.textScale === v ? 'selected' : ''}>${label}</option>`).join('')}</select></label></details>`}<p class="access-note">Your work stays on this device. Every preference can be changed later.</p><div class="term-actions"><button class="btn primary" type="submit">${n ? 'Start learning' : 'Continue'}</button>${n ? '<button class="btn" type="button" data-advance="onboardBack">Back</button>' : ''}<button class="text-button" type="button" data-modern="skipSetup">Skip for now</button></div></form>`, 'WELCOME · HEALTHCARE CROWN ACADEMY');
  $('#onboardingForm input,#onboardingForm select')?.focus({
    preventScroll: true
  });
}
export function submitOnboarding(form) {
  const f = new FormData(form);
  if (app.onboardingStep === 0) {
    app.state.name = String(f.get('name') || '').trim().slice(0, 40);
    app.v3.profile.role = String(f.get('role'));
    app.v3.profile.assistingLanguage = ASSIST_LANGUAGES[f.get('assistingLanguage')] ? f.get('assistingLanguage') : '';
    persist();
    startOnboarding(1);
    return;
  }
  app.v3.profile.dailyGoalMin = +f.get('goal') || 10;
  app.state.theme = String(f.get('theme') || 'system');
  app.state.reduced = f.get('motion') === 'system' ? null : f.get('motion') === 'reduce';
  app.v3.profile.textScale = +f.get('scale') || 1;
  app.v3.profile.onboardingComplete = true;
  persist();
  applyPreferences();
  closeModal();
  navigate('#today');
  showModal('<h2 id="modalTitle">A quick starting snapshot?</h2><p>The optional 12-item check samples meaning, spelling, components and context. It helps you choose a starting point; it does not assess clinical competence.</p><div class="term-actions"><button class="btn" data-modern="placement">Take the check · about 2 minutes</button><button class="btn" data-modern="placementLater">Not now</button></div>', 'OPTIONAL PLACEMENT');
}
