import{spellingDiff}from'./daily.js';
import { renderPage } from "../../ui/page.js";
// Phase 1: canonical features/practice/index implementation.
import { CASES, CHAPTERS, CODE_QUESTIONS, TERMS } from '../../data/index.js';
import { modulePractice } from '../learn/index.js';
import { dueCount, finishExercise, mcq, normalSpelling, persist, renderCaseExercise, shuffle } from '../learn/legacy-tools.js';
import { recordLearning } from '../studios/index.js';
import { distractors, intervalLabel, reviewPrediction, streak, trackItem } from '../../state/actions.js';
import { app } from '../../state/runtime.js';
import { bankFor, chapter, getModule, pct, termBy, termCount } from '../../state/selectors.js';
import { closeModal, header, toast } from '../../ui/components/index.js';
import { $, esc, main } from '../../ui/dom.js';
export function practice() {
  app.quiz = null;
  app.flash = null;
  renderPage(header('RECALL. CONNECT. REPEAT.', 'Make understanding stick.', 'A few focused minutes can build a lasting connection. Choose how you want to practise today.') + `<div class="mode-grid"><button class="mode-card" data-action="quiz" data-id="meaning"><span class="mode-icon">◈</span><h3>Meaning check</h3><p>Connect five terms with their definitions. Immediate feedback helps each connection settle.</p><span class="text-button">5 questions · untimed <span>→</span></span></button><button class="mode-card" data-action="quiz" data-id="context"><span class="mode-icon">◎</span><h3>In clinical context</h3><p>Interpret terminology in short, fictional clinical notes. Focus on meaning and precise language.</p><span class="text-button">5 scenarios · untimed <span>→</span></span></button><button class="mode-card" data-action="flashstart"><span class="mode-icon">✧</span><h3>Recall cards</h3><p>Reveal a meaning, rate your recall, and revisit the words that need a little more attention.</p><span class="text-button">${dueCount()} due for review <span>→</span></span></button></div><section class="surface"><div class="toggle-row"><div><h2>Your words, your pace.</h2><p class="progress-subhead">Save a word anywhere in the studio to create your own recall set.</p></div><a class="btn small" href="#library?filter=saved">View ${app.state.saved.length} saved words ↗</a></div><p>Recall cards start with terms due for review, followed by new words. Rate each recall Again, Hard, Good or Easy. Each button shows the next interval, adapted to your review history. Progress stays in this browser.</p><div class="term-actions"><button class="btn" data-action="flashstart" data-id="saved">Practise saved words →</button><button class="btn" data-action="flashstart" data-id="all">Explore all recall cards →</button></div></section><div class="quote-banner"><span class="quote-sign">“</span><div><blockquote>Every unfamiliar word is an invitation to make a connection.</blockquote><cite>MEDLEX FIELD NOTES · ORIGINAL LEARNING REFLECTION</cite></div></div>`, {
    overview: true
  });
}
export function startQuiz(mode) {
  app.sessionStarted = Date.now();
  app.quiz = {
    mode,
    index: 0,
    score: 0,
    answered: false,
    selection: null,
    items: [],
    wrong: []
  };
  app.flash = null;
  if (mode === 'context') {
    app.quiz.items = shuffle(CASES).slice(0, 5).map(c => {
      const answers = shuffle(c.answers.map((label, i) => ({
        label,
        correct: i === c.correct
      })));
      return {
        prompt: c.prompt,
        answers,
        explanation: c.explanation,
        term: c.term
      };
    });
  } else {
    app.quiz.items = shuffle(TERMS.filter(t => t.chapter > 2)).slice(0, 5).map(t => ({
      prompt: `What does “${t.term.toLowerCase()}” mean?`,
      answers: shuffle([{
        label: t.definition,
        correct: true
      }, ...distractors(t).map(x => ({
        label: x.definition,
        correct: false
      }))]),
      explanation: `${t.term}: ${t.definition} ${t.note || ''}`,
      term: t.id
    }));
  }
  renderQuiz();
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}
export function renderQuiz() {
  if (!app.quiz) return;
  const q = app.quiz.items[app.quiz.index];
  renderPage(header('PRACTICE STUDIO', app.quiz.mode === 'context' ? 'Words in the real world.' : 'A moment for meaning.', 'Take your time. Each answer is a chance to strengthen a connection.', `<button class="btn small" data-action="exitpractice">Exit practice ×</button>`) + `<div class="practice-panel"><div class="practice-progress"><span>QUESTION ${app.quiz.index + 1} OF ${app.quiz.items.length}</span><span>${app.quiz.score} correct so far</span></div><div class="progress-track"><i style="width:${app.quiz.index / app.quiz.items.length * 100}%"></i></div><section class="quiz-card"><span class="eyebrow muted">${app.quiz.mode === 'context' ? 'FICTIONAL CLINICAL LANGUAGE EXERCISE' : 'CONNECT THE TERM & ITS MEANING'}</span><h2>${esc(q.prompt)}</h2><div class="answer-grid">${q.answers.map((a, i) => `<button class="answer ${app.quiz.answered ? a.correct ? 'correct' : app.quiz.selection === i ? 'incorrect' : '' : ''}" data-action="answer" data-index="${i}" ${app.quiz.answered ? 'disabled' : ''}><span>${app.quiz.answered && a.correct ? '✓' : String.fromCharCode(65 + i)}</span>${esc(a.label)}</button>`).join('')}</div>${app.quiz.answered ? `<div class="feedback" role="status"><strong>${q.answers[app.quiz.selection].correct ? 'A clear connection. ✓' : 'A useful distinction to remember.'}</strong>${esc(q.explanation)}<div style="margin-top:10px"><button class="text-button" data-action="term" data-id="${q.term}">Explore this word ↗</button></div></div>` : ''}<div class="quiz-footer"><small>${app.quiz.answered ? 'Read the explanation before moving on.' : 'No timer. Focus on understanding.'}</small><button class="btn primary" data-action="nextquestion" ${app.quiz.answered ? '' : 'disabled'}>${app.quiz.index === app.quiz.items.length - 1 ? 'See my results' : 'Next question'} →</button></div></section><p class="key-hint">${app.quiz.answered ? 'Press Enter to continue.' : 'Keyboard: A, B, C or D to choose an answer.'}</p></div>`, {
    overview: false
  });
}
export function startFlash(mode = 'due') {
  let list = mode === 'saved' ? TERMS.filter(t => app.state.saved.includes(t.id)) : mode === 'all' ? TERMS : TERMS.filter(t => !app.state.reviews[t.id] || app.state.reviews[t.id].due <= Date.now());
  if (!list.length) {
    toast(mode === 'saved' ? 'Save a few words in the term library to build your set.' : 'Nothing is due yet. Your review dates are in My progress.');
    return;
  }
  list = shuffle(list).sort((a, b) => Number(!!app.state.reviews[b.id]) - Number(!!app.state.reviews[a.id])).slice(0, 20);
  app.sessionStarted = Date.now();
  app.flash = {
    list,
    index: 0,
    revealed: false,
    rated: [],
    mode
  };
  app.quiz = null;
  renderFlash();
}
export function renderFlash(prefix = '') {
  const t = app.flash.list[app.flash.index];
  renderPage(prefix + header('ACTIVE RECALL', 'Pause. Recall. Reveal.', 'Bring the meaning to mind before you turn the card. A little effort is part of the learning.', `<button class="btn small" data-action="exitpractice">Exit cards ×</button>`) + `<div class="practice-panel"><div class="practice-progress"><span>CARD ${app.flash.index + 1} OF ${app.flash.list.length}</span><span>${app.flash.rated.length} reviewed this session</span></div><div class="progress-track"><i style="width:${app.flash.index / app.flash.list.length * 100}%"></i></div><button class="flashcard ${app.flash.revealed ? 'revealed' : ''}" data-action="flip"><span class="eyebrow">${esc(chapter(t.chapter).name)}</span><h2>${t.term}</h2>${app.flash.revealed ? `<p>${t.definition}</p>${t.plain !== t.definition ? `<small class="muted">In everyday words: ${esc(t.plain)}</small>` : ''}` : ''}<span class="hint">${app.flash.revealed ? 'Click to return to the word' : 'Think of the meaning, then click to reveal'} <span>↻</span></span></button><div class="flash-controls">${app.flash.revealed ? `${[1, 2, 3, 4].map(n => `<button class="btn ${n === 3 ? 'primary' : ''}" data-action="rate" data-id="${n}">${['Again', 'Hard', 'Good', 'Easy'][n - 1]}<small>${intervalLabel(t.id, n)}</small></button>`).join('')}` : `<button class="btn primary" data-action="flip">Reveal meaning ↻</button>`}<button class="btn" data-action="term" data-id="${t.id}">Explore word ↗</button></div><p class="key-hint">Space to reveal · 1 Again · 2 Hard · 3 Good · 4 Easy</p></div>`, {
    overview: false
  });
}
export function rateFlash(rating) {
  if (!app.flash || !app.flash.revealed) return;
  const t = app.flash.list[app.flash.index],
    prediction = reviewPrediction(t.id, rating),
    r = {
      ...prediction,
      last: Date.now(),
      due: Date.now() + prediction.interval * 86400000
    };
  app.state.reviews[t.id] = r;
  recordLearning(t.id, 'recall', rating >= 3, {
    objective: false,
    source: 'self-rated-recall'
  });
  if (rating >= 3 && !app.state.learned.includes(t.id)) app.state.learned.push(t.id);
  if (!app.flash.rated.includes(t.id)) app.flash.rated.push(t.id);
  trackItem();
  persist();
  if (app.flash.index + 1 < app.flash.list.length) {
    app.flash.index++;
    app.flash.revealed = false;
    renderFlash();
  } else {
    const count = app.flash.rated.length;
    app.state.history.unshift({
      date: Date.now(),
      mode: 'recall',
      score: count,
      total: count,
      durationMs: Date.now() - app.sessionStarted
    });
    app.state.history = app.state.history.slice(0, 500);
    persist();
    renderPage(header('RECALL SESSION COMPLETE', 'Connections, strengthened.', 'Your review dates are saved. Give the words time, then return.') + `<section class="surface score"><div class="score-orb">${count}</div><h2>Words revisited.</h2><p>${Math.max(1, Math.round((Date.now() - app.sessionStarted) / 60000))} min · ${count * 5} XP · ${streak()} day streak</p><p>Your next reviews adapt to how each word felt.</p><a class="btn primary" href="#today">Back to Today →</a><a class="btn" href="#progress">View progress</a></section>`, {
      overview: false
    });
    app.flash = null;
  }
}
export function progress() {
  const totalAnswered = app.state.history.filter(h => h.mode !== 'recall').reduce((a, h) => a + (Number(h.total) || 0), 0),
    correct = app.state.history.filter(h => h.mode !== 'recall').reduce((a, h) => a + (Number(h.score) || 0), 0),
    reviewed = Object.keys(app.state.reviews).length;
  renderPage(header('YOUR LEARNING, TAKING SHAPE', 'See the small steps add up.', 'Progress is personal. These numbers reflect your practice and self-rated familiarity on this browser.', `<button class="btn small" data-action="export">Export my progress ↓</button>`) + `<div class="stats-grid"><div class="stat"><span class="eyebrow">FAMILIAR TERMS</span><strong>${app.state.learned.length}<small> / ${TERMS.length}</small></strong><small>Self-rated familiarity</small></div><div class="stat"><span class="eyebrow">FOUNDATIONS</span><strong>${app.state.lessons.length}<small> / 7</small></strong><small>Lessons marked complete</small></div><div class="stat"><span class="eyebrow">PRACTICE ACCURACY</span><strong>${totalAnswered ? pct(correct, totalAnswered) + '%' : '—'}</strong><small>${totalAnswered ? `${correct} of ${totalAnswered} answers` : 'Complete a quiz to begin'}</small></div><div class="stat"><span class="eyebrow">WORDS DUE</span><strong>${dueCount()}</strong><small>${reviewed} words in your review schedule</small></div></div><div class="split-grid"><section class="surface"><h2>Connections by chapter</h2><p>Familiar terms are those you marked yourself or recalled with “Got it”.</p><div class="system-progress">${CHAPTERS.filter(c => termCount(c.id)).map(c => {
    const total = termCount(c.id),
      n = TERMS.filter(t => t.chapter === c.id && app.state.learned.includes(t.id)).length;
    return `<div class="system-progress-row"><div class="labels"><a href="#library?chapter=${c.id}">${c.name} ↗</a><small>${n} / ${total}</small></div><div class="progress-track"><i style="width:${pct(n, total)}%"></i></div></div>`;
  }).join('')}</div></section><aside><section class="surface"><h2>Recent practice</h2><p>Completed quiz sets, most recent first.</p>${app.state.history.length ? app.state.history.slice(0, 7).map(h => `<div class="history-row"><span>${h.mode === 'context' ? 'Clinical context' : 'Meaning check'}<small style="display:block">${new Date(h.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })}</small></span><strong>${h.score} / ${h.total}</strong></div>`).join('') : `<div class="empty" style="margin-top:20px;padding:35px 15px"><h3 style="font-size:25px">Your first step is waiting.</h3><p>Complete a five-question set to see your practice history here.</p><a href="#practice" class="btn small">Start a practice set →</a></div>`}</section><section class="surface" style="margin-top:20px"><h2>Next reviews</h2><p>Scheduled by your recall ratings.</p>${Object.entries(app.state.reviews).length ? Object.entries(app.state.reviews).filter(([id]) => termBy(id)).sort((a, b) => a[1].due - b[1].due).slice(0, 6).map(([id, r]) => `<div class="history-row"><button class="text-button" data-action="term" data-id="${id}">${termBy(id).term}</button><small>${r.due <= Date.now() ? 'Due now' : new Date(r.due).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })}</small></div>`).join('') : '<p class="access-note">Rate your recall on a flashcard to create your first review date.</p>'}<a href="#practice" class="btn small" style="margin-top:18px">Return to recall cards →</a></section><div class="achievement"><span>✦</span><div><h3>${app.state.lessons.length === 7 ? 'A foundation to build on.' : app.state.learned.length ? 'A vocabulary in motion.' : 'A fresh beginning.'}</h3><p>${app.state.lessons.length === 7 ? 'All seven foundation lessons are complete.' : 'Every connection counts. Keep returning with curiosity.'}</p></div></div><p class="access-note">Saved locally on this device and browser. Export a copy if you want to keep a record. These are learning indicators, not certification.</p></aside></div>`, {
    overview: true
  });
}
export function createQuestions(m, mode) {
  const bank = bankFor(m),
    affixes = m.bank;
  if (mode === 'coding') return shuffle(CODE_QUESTIONS).map(q => ({
    prompt: q.prompt,
    options: q.options,
    correct: q.options[q.correct],
    explain: q.explain
  }));
  if (mode === 'components') {
    if (affixes) return shuffle(affixes).slice(0, 10).map(a => mcq(`What does ${a.form} contribute to a word?`, a.meaning, affixes.map(x => x.meaning), `${a.form}: ${a.meaning}. Example: ${a.example}.`));
    const local = bank.filter(t => t.parts.length);
    const pool = local.length ? local : TERMS.filter(t => t.parts.length).slice(0, 20);
    return shuffle(pool.flatMap(t => t.parts.map(p => {
      const role = p.type === 'vowel' ? 'Combining vowel' : p.type === 'root' ? 'Word root' : p.type === 'prefix' ? 'Prefix' : 'Suffix';
      return {
        prompt: `In ${t.term}, what role does “${p.text}” have?${local.length ? '' : ' (Foundation transfer exercise)'}`,
        options: ['Prefix', 'Word root', 'Combining vowel', 'Suffix'],
        correct: role,
        explain: `${p.text} is a ${role.toLowerCase()}: ${p.meaning}. Complete meaning: ${t.definition}`,
        term: t.id
      };
    }))).slice(0, 10);
  }
  if (mode === 'classify') {
    const pool = bank.filter(t => t.category);
    return shuffle(pool).slice(0, 10).map(t => mcq(`How is “${t.term}” classified in this learning bank?`, t.category, ['Structure', 'Process', 'Condition', 'Symptom', 'Sign', 'Test', 'Procedure', 'Measurement', 'Device', 'Medicine', 'Specialty', 'Movement', 'Function', 'Descriptor', 'Concept', 'Lesion', 'Organism'], `${t.category}: ${t.definition}`, t.id));
  }
  if (mode === 'spelling') return shuffle(affixes || bank).slice(0, 5).map(t => affixes ? {
    prompt: `Write the ${t.kind} form meaning: ${t.meaning}.`,
    correct: t.form,
    accepted: affixes.filter(x => x.meaning === t.meaning).map(x => x.form),
    explain: `${t.form} · ${t.meaning}. Example: ${t.example}.`
  } : {
    prompt: `Write the clinical term: ${t.definition}`,
    correct: t.term,
    accepted: [t.term, ...t.aliases],
    explain: `${t.term}: ${t.definition}`,
    term: t.id
  });
  return shuffle(affixes || bank).slice(0, 10).map(t => affixes ? mcq(`What does ${t.form} mean?`, t.meaning, affixes.map(x => x.meaning), `${t.form}: ${t.meaning}. Example: ${t.example}.`) : mcq(`What does “${t.term}” mean?`, t.definition, bank.map(x => x.definition), `${t.term}: ${t.definition}`, t.id));
}
export function startExercise(m, mode) {
  app.quiz = null;
  app.flash = null;
  app.exercise = {
    module: m.id,
    mode,
    items: mode === 'case' ? [] : createQuestions(m, mode),
    index: 0,
    score: 0,
    answered: false,
    selection: null,
    results: [],
    draft: ''
  };
  if (mode === 'case') renderCaseExercise();else if (!app.exercise.items.length) {
    app.exercise = null;
    toast('This module has no suitable items for that exercise yet.');
    modulePractice(m);
  } else renderExercise();
}
export function renderExercise() {
  const e = app.exercise,
    m = getModule(e.module),
    q = e.items[e.index];
  $('#moduleBody').innerHTML = `<div class="exercise-shell"><div class="exercise-header"><span class="eyebrow">${esc(e.mode)} · ${esc(m.title)}</span><button class="text-button" data-course="exitexercise" data-id="${m.id}">Exit exercise ×</button></div><div class="practice-progress"><span>QUESTION ${e.index + 1} OF ${e.items.length}</span><span>${e.score} correct</span></div><div class="progress-track"><i style="width:${pct(e.index, e.items.length)}%"></i></div><section class="quiz-card"><h2>${esc(q.prompt)}</h2>${e.mode === 'spelling' ? `<form id="spellingForm"><label class="field"><span>Your answer</span><input id="spellingAnswer" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="120" ${e.answered ? 'disabled' : ''} value="${esc(e.selection || '')}" required autofocus></label><button class="btn primary" type="submit" ${e.answered ? 'disabled' : ''}>Check spelling ✓</button></form>` : `<div class="answer-grid">${q.options.map((o, i) => `<button data-course="exerciseanswer" data-index="${i}" class="answer ${e.answered ? o === q.correct ? 'correct' : e.selection === o ? 'incorrect' : '' : ''}" ${e.answered ? 'disabled' : ''}><span>${String.fromCharCode(65 + i)}</span>${esc(o)}</button>`).join('')}</div>`}${e.answered ? `<div class="feedback" role="status"><strong>${e.results.at(-1).right ? 'Correct ✓' : 'A useful distinction to revisit.'}</strong><p>${esc(q.explain)}</p>${e.mode === 'spelling' ? `<p class="spelling-diff" aria-label="Spelling comparison">${spellingDiff(e.selection,q.correct)}</p><p>Accepted: <strong>${[...new Set([q.correct,...(q.accepted||[])])].map(esc).join(' · ')}</strong></p>` : ''}${q.term ? `<button class="text-button" data-action="term" data-id="${q.term}">Explore the term ↗</button>` : ''}</div><button class="btn primary" data-course="exercisenext">${e.index === e.items.length - 1 ? 'See results' : 'Next question'} →</button>` : '<p class="access-note">Untimed practice. Read the whole prompt before answering.</p>'}</section></div>`;
  if (e.mode === 'spelling' && !e.answered) $('#spellingAnswer')?.focus();
}
export function answerExercise(value) {
  const e = app.exercise;
  if (!e || e.answered || e.mode === 'case') return;
  const q = e.items[e.index];
  e.selection = value;
  const right = e.mode === 'spelling' ? [q.correct, ...(q.accepted || [])].some(x => normalSpelling(x) === normalSpelling(value)) : value === q.correct;
  e.answered = true;
  recordLearning(q.term, e.mode === 'components' ? 'components' : e.mode === 'spelling' ? 'spelling' : e.mode === 'classify' ? 'context' : 'meaning', right, {
    source: 'module-' + e.mode
  });
  trackItem();
  if (right) e.score++;
  e.results.push({
    prompt: q.prompt,
    right,
    correct: q.correct,
    given: value,
    term: q.term
  });
  renderExercise();
}
export function nextExercise() {
  if (!app.exercise || !app.exercise.answered) return;
  if (app.exercise.index + 1 < app.exercise.items.length) {
    app.exercise.index++;
    app.exercise.answered = false;
    app.exercise.selection = null;
    renderExercise();
  } else finishExercise();
}
export function startBuild() {
  app.build = {
    terms: shuffle(TERMS.filter(t => t.parts.length > 1 && t.parts.length < 7)).slice(0, 5),
    index: 0,
    chosen: [],
    score: 0,
    checked: false
  };
  closeModal();
  drawBuild();
}
export function drawBuild() {
  const t = app.build.terms[app.build.index];
  renderPage(header('BUILD A WORD', 'Connect the pieces.', `Round ${app.build.index + 1} of 5 · Use the curated components to assemble the term.`) + `<section class="surface"><h2>${esc(t.definition)}</h2><div class="build-answer" aria-label="Your answer">${app.build.chosen.map((i, j) => `<button class="${t.parts[i].type}" data-v3="unbuild" data-id="${j}">${esc(t.parts[i].text)}</button>`).join('') || '<span class="muted">Choose the parts in order below.</span>'}</div><div class="build-tray">${shuffle(t.parts.map((p, i) => ({
    p,
    i
  }))).map(({
    p,
    i
  }) => `<button class="${p.type}" data-v3="buildpart" data-id="${i}" ${app.build.chosen.includes(i) || app.build.checked ? 'disabled' : ''}>${esc(p.text)}<small> ${p.type}</small></button>`).join('')}</div>${app.build.checked ? `<div class="feedback" role="status">${app.build.chosen.every((n, i) => n === i) && app.build.chosen.length === t.parts.length ? 'Correct connection.' : 'The reference order is:'} ${esc(t.term)} · ${t.parts.map(p => esc(p.text)).join(' + ')}</div><button class="btn primary" data-v3="buildnext">${app.build.index === 4 ? 'See summary' : 'Next word'}</button>` : `<button class="btn primary" data-v3="checkbuild" ${app.build.chosen.length !== t.parts.length ? 'disabled' : ''}>Check word</button>`}<a class="btn" href="#today">Back to Today</a></section>`, {
    overview: false
  });
}
