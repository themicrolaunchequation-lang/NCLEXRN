import{modernToday,modernLibrary,modernProgress,modernTerm}from'../modern/views.js';
import { selectDueCount } from '../../state/pure-selectors.js';
import { renderPage } from "../../ui/page.js";
// Phase 1: canonical features/learn/legacy-tools implementation.
import { CASE_CONTEXTS, COURSE_DETAILS, FOCUS_GUIDES, SUBJECTS } from '../../data/config.js';
import { CHAPTERS, COURSE_MODULES, LESSONS, PREFIXES, SUFFIXES, TERMS } from '../../data/index.js';
import { modulePractice } from './index.js';
import { filterLibrary, matches, openTerm } from '../library/index.js';
import { groupedSearch } from '../practice/additional.js';
import { createQuestions, progress, renderFlash, renderQuiz, startExercise } from '../practice/index.js';
import { profile, profileMarkup } from '../settings/index.js';
import { readingControls, recordLearning, xp } from '../studios/index.js';
import { home } from '../today/index.js';
import { updateWorksheetSaveStatus } from '../worksheet/index.js';
import { flushPendingSave, saveV3, streak, trackItem, validateImport } from '../../state/actions.js';
import { initial } from '../../state/defaults.js';
import { app, store } from '../../state/runtime.js';
import { bankFor, chapter, courseDefaults, getModule, passedModule, pct, termBy } from '../../state/selectors.js';
import { closeModal, header, showModal, toast } from '../../ui/components/index.js';
import { $, $$, esc, main, modal, modalContent } from '../../ui/dom.js';
export function add(term, chapter, definition, plain, parts, example, aliases = '', note = '') {
  TERMS.push({
    id: term.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    term,
    chapter,
    definition,
    plain,
    parts: parts ? parts.split(';').map(p => {
      const [text, type, meaning] = p.split('|');
      return {
        text,
        type,
        meaning
      };
    }) : [],
    example,
    aliases: aliases ? aliases.split('|') : [],
    note
  });
}
export function unpackTermTable([dictionary, rows]) {
  const unpack = v => Array.isArray(v) ? v.map(unpack) : v && typeof v === 'object' ? Object.keys(v).length === 1 && Number.isInteger(v.$) ? dictionary[v.$] : Object.fromEntries(Object.entries(v).map(([k, a]) => [k, unpack(a)])) : v;
  return unpack(rows);
}
export function createModule(c) {
  const s = SUBJECTS[c.id],
    bank = c.id < 3 ? TERMS.filter(t => t.parts.length).slice(0, 20) : TERMS.filter(t => t.chapter === c.id),
    selected = s.slice(3).map(n => TERMS.find(t => t.term.toLowerCase() === n.toLowerCase()) || TERMS.find(t => t.id === n)).filter(Boolean);
  const examples = selected.length ? selected : bank.slice(0, 3),
    words = examples.map(t => t.term),
    key = 'ch' + c.id;
  const guides = FOCUS_GUIDES[c.id] || [`Begin with ${s[0].toLowerCase()}. Locate structures and functions before interpreting a condition. Read the definitions in the term bank and compare related concepts.`, `Study ${s[1].toLowerCase()}. Separate a symptom, observed sign and established diagnosis. A word ending is a clue; the complete definition and context determine meaning.`, `Connect ${s[2].toLowerCase()} to the term bank. Distinguish a test or procedure from its result, indication and clinical interpretation.`];
  const sections = s.slice(0, 3).map((title, i) => ({
    id: `${key}-s${i + 1}`,
    title,
    minutes: [15, 20, 20][i],
    read: guides[i],
    terms: i === 0 ? bank.filter(t => t.category === 'Structure').slice(0, 5) : i === 1 ? examples : bank.filter(t => ['Test', 'Procedure'].includes(t.category)).slice(0, 5)
  }));
  sections.push({
    id: `${key}-s4`,
    title: 'Clinical language, documentation and coding literacy',
    minutes: 15,
    read: 'Identify the documented concept first. Separate conditions, symptoms, procedures and negative findings. A word part does not establish a diagnosis or determine a code. Use the correct jurisdiction, edition, index, tabular instructions and applicable standards.',
    terms: examples
  });
  const outcomes = [{
    id: `${key}-LO1`,
    text: `Identify key structures and concepts in ${c.name.toLowerCase()} and explain their roles.`,
    evidence: 'Label five structures or concepts and explain each in one sentence.',
    section: 1
  }, {
    id: `${key}-LO2`,
    text: `Recognise word components and interpret selected ${c.name.toLowerCase()} terms without relying only on literal translation.`,
    evidence: `Analyse ${words.slice(0, 2).join(' and ') || 'five module terms'} and verify whole-word meaning.`,
    section: 2
  }, {
    id: `${key}-LO3`,
    text: 'Write and spell module terminology accurately, using AU/NZ forms and recognising common alternatives.',
    evidence: 'Complete a five-word spelling check and correct errors using the glossary.',
    section: 2
  }, {
    id: `${key}-LO4`,
    text: 'Distinguish symptoms, conditions, tests and procedures in a fictional clinical passage.',
    evidence: 'Annotate a note and justify how each expression is classified.',
    section: 3
  }, {
    id: `${key}-LO5`,
    text: 'Recognise documentation requirements and the different roles of clinical terminology and classification systems.',
    evidence: 'Identify one documentation gap and explain an appropriate verification step.',
    section: 4
  }];
  const classroom = [{
    section: 1,
    mode: 'Individual · 10 min',
    title: 'Label, define, explain',
    task: `On paper, draw a simple concept map for ${s[0].toLowerCase()}. Add five terms from this module, a definition for each and one relationship between terms.`,
    evidence: 'A labelled concept map; educator checks the five definitions.'
  }, {
    section: 2,
    mode: 'Pairs · 15 min',
    title: 'Word-component detective',
    task: `Take turns choosing ${words.join(', ') || 'five terms'}. Underline recognisable components, identify their roles and verify meaning in the reference. Leave eponyms and unsplittable terms whole.`,
    evidence: 'Five annotated terms; explain any difference between literal and clinical meaning.'
  }, {
    section: 2,
    mode: 'Individual, then pairs · 10 min',
    title: 'Look, cover, write, check',
    task: 'Choose five words from the term bank. Read each, cover it, write it from memory and compare carefully. Discuss the spelling pattern with a partner.',
    evidence: 'A five-word spelling sheet with corrections highlighted.'
  }, {
    section: 3,
    mode: 'Groups of 3 · 20 min',
    title: 'Clinical-note sort',
    task: `Use this fictional passage: ${CASE_CONTEXTS[c.id]?.[0] || 'The teaching glossary lists ' + words.join(', ') + '.'} Sort the expressions into structure, symptom or sign, condition, test, or procedure. Explain uncertainty rather than inventing missing facts.`,
    evidence: 'A sorted table and a brief reason for each classification.'
  }, {
    section: 4,
    mode: 'Pairs or individual · 15 min',
    title: 'Documentation-to-classification workshop',
    task: 'Select a documented condition and a procedure from the module. Identify what additional detail is needed before classification. With an educator-provided current codebook, locate the index entry, verify the tabular instructions, then record the edition and source used. Compare ICD-10-AM, ACHI, ACS and SNOMED CT roles.',
    evidence: 'A paper audit trail including missing information, index route, verification and rationale. Code accuracy is educator-reviewed.'
  }];
  const independent = [{
    title: 'Pocket glossary walk',
    minutes: 15,
    task: `Away from screens, make five paper cards using module terms. Put a term on one side and its meaning on the other. Walk or sit somewhere quiet and retrieve the meanings before turning the cards.`,
    evidence: 'Bring five cards and mark which words needed another attempt.'
  }, {
    title: 'Explain it to a non-clinician',
    minutes: 10,
    task: `Choose ${words[0] || 'one term'} and explain it aloud in everyday language to a study partner or an imaginary listener. Then write a two-sentence explanation on paper.`,
    evidence: 'A plain-language explanation with one accurate distinction.'
  }, {
    title: 'Paper case reflection',
    minutes: 15,
    task: 'Using only the printed fictional note, circle words you recognise, list two you need to verify, and write one question about missing context. Do this away from the classroom and course website.',
    evidence: 'One annotated paper note and a reflection to discuss next session.'
  }];
  return {
    id: key,
    chapter: c.id,
    title: c.name,
    track: c.module,
    subtitle: c.tagline,
    minutes: 70,
    words: bank.map(t => t.id),
    sections,
    outcomes,
    classroom,
    independent,
    case: CASE_CONTEXTS[c.id] || ['A fictional glossary compares ' + words.join(', ') + '.', 'Check each complete definition and explain the distinctions.'],
    reference: `Walker, Wood & Nicol, Mastering Medical Terminology, 3rd ed., Chapter ${c.id}, printed p. ${c.page}${CHAPTERS[c.id] ? `–${CHAPTERS[c.id].page - 1}` : ''}.`,
    status: 'Proposed outcomes · curriculum mapping pending'
  };
}
export function affixModule(kind) {
  const prefix = kind === 'prefix',
    id = prefix ? 'prefixes' : 'suffixes',
    bank = prefix ? PREFIXES : SUFFIXES;
  return {
    id,
    title: prefix ? '100 prefix forms' : '100 suffixes & clinical endings',
    chapter: 1,
    track: 1,
    subtitle: prefix ? 'Modifiers of place, time, number and degree.' : 'Recognise conditions, procedures, functions and descriptive endings.',
    minutes: 70,
    affixKind: kind,
    words: [],
    sections: [{
      title: prefix ? 'Direction, position and timing' : 'Conditions, symptoms and functions',
      minutes: 15,
      read: prefix ? 'Prefixes modify an existing word. Compare pre- and post-, sub- and supra-, inter- and intra-. Their meaning depends on the complete term.' : 'Compare -algia (pain), -itis (inflammation), -pathy (disorder) and -plegia (paralysis). Similar endings do not make the whole clinical concepts interchangeable.',
      terms: []
    }, {
      title: prefix ? 'Quantity, degree and negation' : 'Procedures, tests and instruments',
      minutes: 20,
      read: prefix ? 'Compare hyper- and hypo-, tachy- and brady-, poly- and oligo-. A- or an- may indicate absence. These clues require a full clinical definition.' : 'Compare -ectomy (removal), -otomy (incision), -ostomy (created opening), -scopy (visual examination), -graphy (recording process) and -gram (record).',
      terms: []
    }, {
      title: 'Spelling, variants and context',
      minutes: 20,
      read: prefix ? 'This bank contains 100 clinically encountered prefix forms, including variants and less-common extensions. They are not a frequency-ranked top 100. Greek number forms are extension learning.' : 'This bank contains 100 suffixes and clinical endings. Some are compound endings or adjective endings; a standalone ending is not enough to establish the definition of a term.',
      terms: []
    }, {
      title: 'Apply and verify',
      minutes: 15,
      read: 'Find a familiar part in a real term, verify the complete meaning and explain it plainly. Do not create an assumed diagnosis or assign a code by word parts alone.',
      terms: []
    }],
    outcomes: [{
      id: id + '-LO1',
      text: `Recognise the function of ${kind} forms in clinical words.`,
      evidence: 'Classify ten examples by meaning.',
      section: 1
    }, {
      id: id + '-LO2',
      text: 'Distinguish easily confused word elements and explain their effect on meaning.',
      evidence: 'Compare five pairs with examples.',
      section: 2
    }, {
      id: id + '-LO3',
      text: 'Spell selected word elements accurately and identify variants.',
      evidence: 'Complete five retrieval and spelling prompts.',
      section: 3
    }, {
      id: id + '-LO4',
      text: 'Apply components to whole clinical terms and verify their definitions.',
      evidence: 'Explain five complete words using a reference.',
      section: 4
    }],
    classroom: [{
      section: 1,
      mode: 'Groups of 3 · 15 min',
      title: 'Meaning families',
      task: `Print 20 ${kind} cards and sort them by meaning. Each group explains two difficult choices.`,
      evidence: 'A sorted set with two explanations.'
    }, {
      section: 2,
      mode: 'Pairs · 15 min',
      title: 'Spot the switch',
      task: `Compare ${prefix ? 'hyper-/hypo-, tachy-/brady-, inter-/intra-' : '-ectomy/-otomy/-ostomy, -algia/-itis, -graphy/-gram'}. Write a complete term for each and verify its meaning.`,
      evidence: 'Three comparison pairs with definitions.'
    }, {
      section: 3,
      mode: 'Individual · 10 min',
      title: 'Cover and write',
      task: 'Write ten word elements from memory, then self-correct using the reference.',
      evidence: 'Ten forms with corrected spellings.'
    }, {
      section: 4,
      mode: 'Pairs · 15 min',
      title: 'Explain the limits',
      task: 'Discuss why word parts alone cannot determine a clinical diagnosis or a classification code. Give one example.',
      evidence: 'A two-sentence explanation and example.'
    }],
    independent: [{
      title: 'Paper retrieval set',
      minutes: 15,
      task: `Create ten ${kind} cards on paper. Practise from both directions: form to meaning and meaning to form.`,
      evidence: 'Ten paper cards and a written error log.'
    }, {
      title: 'Teach five forms aloud',
      minutes: 10,
      task: 'Away from screens, explain five forms and their example words to a study partner or an imaginary listener.',
      evidence: 'Five written examples and their meanings.'
    }, {
      title: 'Spaced paper recall',
      minutes: 10,
      task: 'Revisit the cards on the next day and after three days. Put difficult cards in a separate pile.',
      evidence: 'Paper review dates and difficult-card list.'
    }],
    case: [`A fictional glossary contrasts ${prefix ? 'hyperglycaemia and hypoglycaemia' : 'nephrectomy, nephrotomy and nephrostomy'}.`, prefix ? 'Hyper- means excessive or above; hypo- means deficient or below. Check the complete glucose-related definitions.' : '-ectomy indicates removal; -otomy indicates incision; -ostomy indicates a created opening. Verify the complete procedure and anatomical site.'],
    reference: 'Walker, Wood & Nicol, 3rd ed., Chapters 1–2 and relevant body-system chapters; MedlinePlus word-parts reference.',
    status: 'Proposed outcomes · curriculum mapping pending',
    bank
  };
}
export function persist() {
  store.set({
    state: app.state,
    v3: app.v3,
    course: app.course
  });
  try {
    if (app.v3) {
      clearTimeout(app.saveTimer);
      app.storageState.pending = true;
      app.storageState.dirty = true;
      app.storageState.error = null;
      updateWorksheetSaveStatus();
      app.saveTimer = setTimeout(flushPendingSave, 250);
    }
    return true;
  } catch {
    if (!app.storageFailed) {
      app.storageFailed = true;
      toast('Browser storage is unavailable. Progress will last for this session.');
    }
    return false;
  }
}
export function today() {
  return new Date().toLocaleDateString('en-CA');
}
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function dueCount() {
  return selectDueCount(app.state.reviews, TERMS.map(t => t.id), Date.now());
}
export function answer(i) {
  if (!app.quiz || app.quiz.answered || !app.quiz.items[app.quiz.index].answers[i]) return;
  app.quiz.answered = true;
  app.quiz.selection = i;
  recordLearning(app.quiz.items[app.quiz.index].term, app.quiz.mode === 'context' ? 'context' : 'meaning', app.quiz.items[app.quiz.index].answers[i].correct, {
    source: 'practice-quiz'
  });
  trackItem();
  if (app.quiz.items[app.quiz.index].answers[i].correct) app.quiz.score++;else app.quiz.wrong.push(app.quiz.items[app.quiz.index].term);
  renderQuiz();
}
export function nextQuestion() {
  if (!app.quiz || !app.quiz.answered) return;
  if (++app.quiz.index < app.quiz.items.length) {
    app.quiz.answered = false;
    app.quiz.selection = null;
    renderQuiz();
  } else {
    app.state.history.unshift({
      date: Date.now(),
      mode: app.quiz.mode,
      score: app.quiz.score,
      total: app.quiz.items.length,
      durationMs: Date.now() - app.sessionStarted
    });
    app.state.history = app.state.history.slice(0, 500);
    persist();
    const missed = [...new Set(app.quiz.wrong)].map(termBy).filter(Boolean);
    renderPage(header('ONE MORE CONNECTION MADE', 'A little more confident.', 'Each retrieval strengthens your familiarity. Return after a gap to see what stays.') + `<div class="practice-panel surface"><div class="score"><div class="score-orb">${app.quiz.score}<small>/ ${app.quiz.items.length}</small></div><h2>${app.quiz.score === 5 ? 'Everything connected.' : app.quiz.score >= 3 ? 'A strong step forward.' : 'Every attempt is a beginning.'}</h2><p>${Math.max(1, Math.round((Date.now() - app.sessionStarted) / 60000))} minutes · ${app.quiz.score * 10} XP · ${streak()} day streak</p><p>Your result is a practice snapshot, not a measure of clinical competence.</p><a class="btn" href="#today">Back to Today</a><button class="btn primary" data-action="quiz" data-id="${app.quiz.mode}">Try a fresh set →</button> <button class="btn" data-action="exitpractice">Back to practice</button></div>${missed.length ? `<h3>Revisit these connections</h3><div class="related">${missed.map(t => `<button class="filter-pill" data-action="term" data-id="${t.id}">${t.term} ↗</button>`).join('')}</div>` : '<div class="achievement"><span>✦</span><div><h3>Five clear connections</h3><p>Let them settle, then revisit them another day.</p></div></div>'}</div>`, {
      overview: false
    });
    app.quiz = null;
  }
}
export function toggleSave(id) {
  const t = termBy(id);
  if (!t) return;
  const focusWasSave=document.activeElement?.matches('[data-action=save][data-id="'+id+'"]');
  const was = app.state.saved.includes(id);
  app.state.saved = was ? app.state.saved.filter(x => x !== id) : [...app.state.saved, id];
  persist();
  if (modal.open && app.activeTerm === id) openTerm(id);
  refreshBehindModal();
  if(focusWasSave)document.querySelector('[data-action=save][data-id="'+id+'"]')?.focus({preventScroll:true});
  toast(was ? t.term + ' removed from saved words.' : t.term + ' saved to your collection.');
  if (was) {
    const el = $('#toast'),
      undo = document.createElement('button');
    undo.className = 'btn small';
    undo.textContent = 'Undo';
    undo.onclick = () => {
      if (!app.state.saved.includes(id)) app.state.saved.push(id);
      persist();
      refreshBehindModal();
      if (modal.open && app.activeTerm === id) openTerm(id);
      el.classList.remove('show');
    };
    el.append(undo);
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 5000);
  }
}
export function refreshBehindModal() {
  if(app.route==='home')modernToday();else if(app.route==='library')modernLibrary();else if(app.route==='termpage')modernTerm(app.activeTerm);else if(app.route==='progress')modernProgress();
}
export function markLearned(id) {
  if (!termBy(id)) return;
  app.state.learned = app.state.learned.includes(id) ? app.state.learned.filter(x => x !== id) : [...app.state.learned, id];
  persist();
  openTerm(id);
  refreshBehindModal();
}
export function legacySearchResults(q) {
  const clean = q.trim().replace(/^-/, '');
  const terms = (clean ? TERMS.filter(t => matches(t, clean) || t.parts.some(p => p.text.includes(clean.toLowerCase()))) : [termBy('pericarditis'), termBy('dyspnoea'), termBy('thrombocytopenia'), termBy('pharmacokinetics')]).slice(0, 10);
  $('#globalResults').innerHTML = terms.length ? terms.map(t => `<button class="search-result" data-action="term" data-id="${t.id}"><span><strong>${t.term}</strong><small>${esc(t.definition)}</small></span><span>↗</span></button>`).join('') : '<div class="empty"><h3 style="font-size:25px">No connection yet.</h3><p>Try a shorter word, a body structure or a different spelling.</p></div>';
}
export function persistCourse() {
  return persist();
}
export function setCourseChrome(page, title) {
  app.route = page;
  app.quiz = null;
  app.flash = null;
  app.exercise = null;
  if (modal.open) closeModal();
  $$('nav a').forEach(a => {
    const on = a.dataset.page === (page === 'module' ? 'modules' : page);
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page');else a.removeAttribute('aria-current');
  });
  $('#crumb').textContent = title;
  document.title = title + ' · MedLex';
  $('#sidebar').classList.remove('open');
}
export function enhancePractice() {
  return `<section class="course-invite"><div><span class="eyebrow">NEW · MODULE PRACTICE</span><h2>Practise with a purpose.</h2><p>Spelling, components, classification, meaning and clinical-note reflection.</p></div><a class="btn primary" href="#module?id=${app.course.last}&tab=practice">Choose a module exercise →</a></section>`;
}
export function enhanceProgress() {
  return `<section class="course-invite"><div><span class="eyebrow">COURSE RECORD</span><h2>${COURSE_MODULES.filter(passedModule).length} / 26 knowledge checks passed.</h2><p>Knowledge checks, self-rated outcomes and self-rated term familiarity are recorded separately.</p></div><a class="btn" href="#toolkit">Open course record →</a></section>`;
}
export function attemptTable(id) {
  const rows = app.course.attempts.filter(a => !id || a.module === id).slice(-10).reverse();
  return `<section class="surface attempt-section"><div class="section-head"><div><span class="eyebrow">LOCAL LEARNING RECORD</span><h3>Recent practice</h3></div></div>${rows.length ? `<div class="table-scroll"><table class="course-table"><thead><tr><th>Date</th>${id ? '' : '<th>Module</th>'}<th>Exercise</th><th>Result</th></tr></thead><tbody>${rows.map(a => `<tr><td>${new Date(a.date).toLocaleDateString('en-AU')}</td>${id ? '' : `<td>${esc(getModule(a.module).title)}</td>`}<td>${esc(a.mode)}</td><td>${a.mode === 'case' ? 'Reflection reviewed · unscored' : `${a.score}/${a.total} · ${pct(a.score, a.total)}%`}</td></tr>`).join('')}</tbody></table></div>` : '<p>Your completed exercises will appear here.</p>'}</section>`;
}
export function normalSpelling(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/^[-\s]+|[-\s]+$/g, '').replace(/\s+/g, ' ');
}
export function mcq(prompt, label, pool, explain, term) {
  const distractors = shuffle([...new Set(pool.filter(x => x !== label))]).slice(0, 3);
  return {
    prompt,
    options: shuffle([label, ...distractors]),
    correct: label,
    explain,
    term
  };
}
export function finishExercise() {
  const e = app.exercise,
    m = getModule(e.module);
  app.course.attempts.push({
    module: m.id,
    mode: e.mode,
    date: Date.now(),
    score: e.score,
    total: e.items.length,
    errors: e.results.filter(x => !x.right).map(x => ({
      prompt: x.prompt,
      correct: x.correct,
      given: x.given,
      term: x.term
    }))
  });
  app.course.attempts = app.course.attempts.slice(-300);
  persistCourse();
  const knowledge = e.mode === 'meaning' && e.items.length >= 10,
    passed = knowledge && pct(e.score, e.items.length) >= 80;
  $('#moduleBody').innerHTML = `<section class="surface exercise-results"><span class="eyebrow">${knowledge ? 'MODULE KNOWLEDGE CHECK' : 'PRACTICE COMPLETE'}</span><h2>${e.score} / ${e.items.length}</h2><p>${pct(e.score, e.items.length)}% correct · ${knowledge ? passed ? 'Knowledge check passed.' : 'Aim for 80% on a 10-question check. Review the explanations and try again.' : 'Practice result recorded. This is a skill exercise, separate from the module knowledge check.'}</p><div class="term-actions"><button class="btn primary" data-course="exercise" data-id="${m.id}" data-mode="${e.mode}">Try a fresh set ↻</button><button class="btn" data-course="exitexercise" data-id="${m.id}">Back to Practice Exercises →</button></div>${e.results.some(r => !r.right) ? `<h3>Review your missed connections</h3><div class="error-list">${e.results.filter(r => !r.right).map(r => `<article><strong>${esc(r.prompt)}</strong><p>Your answer: ${esc(r.given)}</p><p>Correct connection: ${esc(r.correct)}</p>${r.term ? `<button class="text-button" data-action="term" data-id="${r.term}">Explore and save ↗</button>` : ''}</article>`).join('')}</div>` : '<p class="callout">Every connection in this set was correct. Test again later to check retention.</p>'}</section>`;
  app.exercise = null;
}
export function renderCaseExercise() {
  const m = getModule(app.exercise.module);
  $('#moduleBody').innerHTML = `<section class="surface case-workspace"><div class="exercise-header"><span class="eyebrow">FICTIONAL CLINICAL LANGUAGE EXERCISE</span><button class="text-button" data-course="exitexercise" data-id="${m.id}">Exit reflection ×</button></div><h2>Read. Interpret. Clarify.</h2><blockquote>${esc(m.case[0])}</blockquote><p>Explain the terminology in everyday language. Separate what is documented from what remains unknown, and name one verification step.</p><label class="field"><span>Your interpretation · not automatically marked</span><textarea id="caseResponse" rows="5" maxlength="4000" placeholder="Write a short interpretation of the words in this fictional note…">${esc(app.exercise.draft)}</textarea></label><button class="btn primary" data-course="revealcase">Compare a model answer ↓</button><div id="caseModel"></div></section>`;
}
export function revealCase() {
  if (!app.exercise || app.exercise.mode !== 'case') return;
  app.exercise.draft = $('#caseResponse').value;
  const m = getModule(app.exercise.module);
  $('#caseModel').innerHTML = `<div class="feedback"><span class="eyebrow">MODEL INTERPRETATION · SELF OR EDUCATOR REVIEW</span><p>${esc(m.case[1])}</p><p>Verification step: check the complete definitions, clarify missing context and consult the appropriate current reference before classification.</p></div><p>Compare meaning, precision and assumptions. This exercise has no automatic score.</p><button class="btn" data-course="completecase">I have reviewed my reflection ✓</button>`;
}
export function completeCase() {
  if (!app.exercise || app.exercise.mode !== 'case') return;
  const m = getModule(app.exercise.module);
  app.course.attempts.push({
    module: m.id,
    mode: 'case',
    date: Date.now(),
    reflection: $('#caseResponse').value.slice(0, 4000)
  });
  app.course.attempts = app.course.attempts.slice(-300);
  persistCourse();
  modulePractice(m);
  toast('Reflection reviewed. Recorded without a score.');
}
export function moduleFlash(m) {
  if (m.affixKind) {
    startExercise(m, 'meaning');
    return;
  }
  const list = shuffle(bankFor(m)).slice(0, 20);
  if (!list.length) return;
  app.quiz = null;
  app.exercise = null;
  app.flash = {
    list,
    index: 0,
    revealed: false,
    rated: []
  };
  renderFlash(`<a class="back-link" href="#module?id=${m.id}&tab=practice">← Return to module practice</a>`);
}
export function downloadText(name, content, type = 'text/plain') {
  if (import.meta.env.MODE === 'test' && app.testDownloads) return app.testDownloads(name, content, type);
  const url = URL.createObjectURL(new Blob([content], {
      type
    })),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function csv(rows) {
  return '\uFEFF' + rows.map(r => r.map(x => {
    let v = String(x ?? '');
    if (/^[=+@\-\t\r]/.test(v)) v = "'" + v;
    return '"' + v.replaceAll('"', '""') + '"';
  }).join(',')).join('\r\n');
}
export function exportProgress() {
  try {
    saveV3();
  } catch (e) {
    app.storageState.error = e.name;
    app.storageState.dirty = true;
  }
  downloadText('MedLex-Learning-Record-v4.json', JSON.stringify({
    app: 'MedLex',
    version: 4,
    data: {...app.v3,schemaVersion:4}
  }, null, 2), 'application/json');
  toast('Your learning record has been exported.');
}
export function exportMapping() {
  downloadText('MedLex-Curriculum-Mapping.csv', csv([['Module', 'Topic sections', 'Proposed outcome ID', 'Proposed outcome', 'Suggested evidence', 'Educator curriculum reference', 'Alignment status'], ...COURSE_MODULES.flatMap(m => m.outcomes.map(o => [m.title, m.sections.map(s => s.title).join('; '), o.id, o.text, o.evidence, app.course.mapping[o.id] || '', 'Pending curriculum document and educator verification']))]), 'text/csv');
}
export function exportTermBank(m) {
  downloadText('MedLex-' + m.id + '-Terms.csv', csv([['Term', 'Definition', 'Category', 'Relevant chapter'], ...bankFor(m).map(t => [t.term, t.definition, t.category || 'See complete definition', t.chapter])]), 'text/csv');
}
export function exportAffixBank(kind) {
  const bank = kind === 'prefix' ? PREFIXES : SUFFIXES;
  downloadText('MedLex-' + kind + '-Forms.csv', csv([['Form', 'Meaning', 'Example', 'Learning label'], ...bank.map(a => [a.form, a.meaning, a.example, a.tier])]), 'text/csv');
}
export function studySessions() {
  const start = new Date(app.course.planStart + 'T12:00:00');
  if (Number.isNaN(+start)) return [];
  let day = 0;
  const unfinished = COURSE_MODULES.filter(m => !passedModule(m));
  return unfinished.slice(0, 6).flatMap(m => {
    const portions = Math.ceil(m.minutes / +app.course.planMinutes);
    return Array.from({
      length: portions
    }, (_, i) => {
      const date = new Date(+start + day++ * 86400000);
      return {
        module: m,
        date: date.toLocaleDateString('en-AU', {
          day: 'numeric',
          month: 'short'
        }),
        section: i % 4,
        title: m.sections[Math.min(Math.floor(i * 4 / portions), 3)].title,
        minutes: Math.min(+app.course.planMinutes, m.minutes - i * +app.course.planMinutes)
      };
    });
  }).slice(0, 12);
}
export function renderStudySessions() {
  $('#studySessions').innerHTML = studySessions().map((s, i) => `<a href="#module?id=${s.module.id}" class="study-session"><span class="session-date">${s.date}</span><span><strong>${esc(s.module.title)}</strong><small>${esc(s.title)} · block ${i + 1}</small></span><span>${s.minutes} min ↗</span></a>`).join('') || '<p>All module knowledge checks are passed. Revisit your recall cards or select any module for revision.</p>';
}
export function renderMapping(m) {
  $('#mappingRows').innerHTML = m.outcomes.map(o => `<div class="mapping-row"><div><span class="eyebrow">${o.id} · SECTION ${o.section}</span><p>${esc(o.text)}</p></div><label class="field"><span>Curriculum code / page / prescribed outcome reference</span><input data-mapping="${o.id}" maxlength="400" value="${esc(app.course.mapping[o.id] || '')}" placeholder="Awaiting curriculum reference"></label></div>`).join('');
}
export function validateV2Import(x) {
  if (!x || x.app !== 'MedLex' || x.version !== 2 || !x.studio || !x.course) throw Error('Choose a version 2 MedLex learning-record export.');
  const c = x.course,
    s = x.studio;
  for (const key of ['outcomes', 'activities', 'notes', 'mapping']) if (!c[key] || typeof c[key] !== 'object' || Array.isArray(c[key])) throw Error('This record has invalid course data.');
  if (!Array.isArray(c.attempts) || c.attempts.length > 300) throw Error('This record has invalid exercise history.');
  const ids = new Set(COURSE_MODULES.flatMap(m => m.outcomes.map(o => o.id)));
  const clean = courseDefaults();
  for (const [key, value] of Object.entries(c.outcomes)) if (ids.has(key) && typeof value === 'boolean') clean.outcomes[key] = value;
  for (const [key, value] of Object.entries(c.mapping)) if (ids.has(key) && typeof value === 'string') clean.mapping[key] = value.slice(0, 400);
  for (const m of COURSE_MODULES) {
    if (typeof c.notes[m.id] === 'string') clean.notes[m.id] = c.notes[m.id].slice(0, 6000);
    for (const type of ['classroom', 'independent']) m[type].forEach((a, i) => {
      const id = m.id + '-' + type + '-' + i;
      if (typeof c.activities[id] === 'boolean') clean.activities[id] = c.activities[id];
    });
  }
  clean.attempts = c.attempts.filter(a => a && COURSE_MODULES.some(m => m.id === a.module) && Number.isFinite(a.date) && ['meaning', 'spelling', 'components', 'classify', 'coding', 'case'].includes(a.mode) && (a.mode === 'case' || Number.isFinite(a.score) && Number.isFinite(a.total) && a.total > 0 && a.total <= 100 && a.score >= 0 && a.score <= a.total)).map(a => ({
    module: a.module,
    mode: a.mode,
    date: a.date,
    ...(a.mode === 'case' ? {
      reflection: String(a.reflection || '').slice(0, 4000)
    } : {
      score: a.score,
      total: a.total,
      errors: Array.isArray(a.errors) ? a.errors.slice(0, 100).filter(e => e && typeof e.prompt === 'string' && typeof e.correct === 'string').map(e => ({
        prompt: e.prompt.slice(0, 1000),
        correct: e.correct.slice(0, 1000),
        given: String(e.given || '').slice(0, 1000),
        term: termBy(e.term) ? e.term : undefined
      })) : []
    })
  }));
  if (COURSE_MODULES.some(m => m.id === c.last)) clean.last = c.last;
  if ([10, 20, 30, 45].includes(+c.planMinutes)) clean.planMinutes = +c.planMinutes;
  if (/^\d{4}-\d{2}-\d{2}$/.test(c.planStart || '')) clean.planStart = c.planStart;
  const studio = {
    ...initial,
    name: typeof s.name === 'string' ? s.name.slice(0, 40) : '',
    theme: s.theme === 'dark' ? 'dark' : 'light',
    reduced: !!s.reduced
  };
  for (const k of ['saved', 'learned']) studio[k] = Array.isArray(s[k]) ? s[k].filter(id => termBy(id)) : [];
  studio.lessons = Array.isArray(s.lessons) ? s.lessons.filter(n => Number.isInteger(n) && LESSONS[n]) : [];
  studio.visits = Array.isArray(s.visits) ? s.visits.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-365) : [];
  studio.history = Array.isArray(s.history) ? s.history.filter(h => h && Number.isFinite(h.date) && Number.isFinite(h.score) && Number.isFinite(h.total) && h.total > 0 && h.score >= 0 && h.score <= h.total).slice(0, 300) : [];
  studio.reviews = {};
  if (s.reviews && typeof s.reviews === 'object') for (const [id, r] of Object.entries(s.reviews)) if (termBy(id) && r && Number.isFinite(r.due) && Number.isFinite(r.reps)) studio.reviews[id] = {
    ...r,
    due: r.due,
    reps: Math.max(0, Math.min(100, r.reps))
  };
  return {
    studio,
    course: clean
  };
}
export async function previewImport(file) {
  try {
    if (file.size > 50e6) throw Error('Choose a MedLex export smaller than 50 MB.');
    app.pendingImport = validateImport(JSON.parse(await file.text()));
    $('#importPreview').innerHTML = `<div class="callout"><strong>Ready to restore</strong><p>${app.pendingImport.studio.saved.length} saved terms · ${app.pendingImport.course.attempts.length} course attempts. Restoring will replace this browser’s current learning record.</p><div class="term-actions"><button class="btn primary" data-course="confirmimport">Restore this record</button><button class="btn" data-course="cancelimport">Cancel</button></div></div>`;
  } catch (error) {
    app.pendingImport = null;
    toast(error.message);
  }
}
export function printPack(m, teacher) {
  if (modal.open) closeModal();
  $('#printPack')?.remove();
  const element = document.createElement('section');
  element.id = 'printPack';
  element.setAttribute('aria-label', 'Printable module learning pack');
  const bank = bankFor(m),
    qs = createQuestions(m, 'meaning').slice(0, 5),
    spell = createQuestions(m, 'spelling').slice(0, 5);
  element.innerHTML = `<div class="print-controls"><button class="btn primary" data-course="printnow">Print / Save as PDF</button><button class="btn" data-course="closeprint">Close preview ×</button><span>${teacher ? 'Educator guide · includes model answers' : 'Learner pack · includes writing space'}</span></div><article class="print-document"><header class="hca-print-header"><div>${document.querySelector('.hca-crest')?.innerHTML||''}</div><strong>HEALTHCARE CROWN ACADEMY<br><small>MedLex · Learning, with distinction.</small></strong></header><span class="eyebrow">MEDLEX · ${teacher ? 'EDUCATOR GUIDE' : 'LEARNER PACK'}</span><h1>${esc(m.title)}</h1><p>${esc(m.subtitle)}</p><p>Name: ______________________________ &nbsp; Date: __________________</p><p><strong>Reference:</strong> ${esc(m.reference)}</p><p><strong>Alignment status:</strong> Proposed course outcomes; curriculum document pending.</p><h2>Outline</h2><ol>${m.sections.map(s => `<li><strong>${esc(s.title)}</strong> · ${s.minutes} min<p>${esc(s.read)}</p></li>`).join('')}</ol><h2>Learning Outcomes</h2><ol>${m.outcomes.map(o => `<li><strong>${o.id}</strong> ${esc(o.text)}<p>Evidence: ${esc(o.evidence)}</p></li>`).join('')}</ol><h2>Classroom Activities</h2>${m.classroom.map(a => `<div class="print-block"><h3>Section ${a.section}: ${esc(a.title)} · ${esc(a.mode)}</h3><p>${esc(a.task)}</p><p><strong>Evidence:</strong> ${esc(a.evidence)}</p></div>`).join('')}<h2>Independent Study · Away from the classroom and website</h2>${m.independent.map(a => `<div class="print-block"><h3>${esc(a.title)} · ${a.minutes} min</h3><p>${esc(a.task)}</p><p><strong>Bring back:</strong> ${esc(a.evidence)}</p></div>`).join('')}<div class="print-break"></div><h2>Practice Exercises</h2><h3>A. Explain the meaning</h3><ol>${qs.map(q => `<li>${esc(q.prompt)}<div class="writing-lines"></div></li>`).join('')}</ol><h3>B. Spelling retrieval</h3><ol>${spell.map(q => `<li>${esc(q.prompt)}<p>Answer: ____________________________________________________</p></li>`).join('')}</ol><h3>C. Word-component recognition</h3><p>Choose five terms with recognisable components. Label prefix, root, combining vowel and suffix where present. Verify the complete meaning.</p><div class="writing-lines tall"></div><h3>D. Clinical-note interpretation</h3><blockquote>${esc(m.case[0])}</blockquote><p>Explain the words, distinguish documented information from assumptions, and record a verification step.</p><div class="writing-lines tall"></div><h3>E. Coding-structure and documentation analysis</h3><p>Compare ICD-10-AM, ACHI, ACS and SNOMED CT roles. With your educator’s current codebook, follow an index entry to tabular verification and record any relevant instructions. Do not infer an unrecorded diagnosis.</p><p>Documented concept: ____________________________________________</p><p>Missing context: ________________________________________________</p><p>Source / edition: _________________________________________________</p><p>Index route / tabular checks / rationale: _____________________________</p><div class="writing-lines"></div>${teacher ? `<div class="print-break"></div><h2>Educator Answer & Review Guide</h2><h3>A. Meanings</h3><ol>${qs.map(q => `<li>${esc(q.correct)}</li>`).join('')}</ol><h3>B. Spelling</h3><ol>${spell.map(q => `<li>${esc(q.correct)}</li>`).join('')}</ol><h3>C. Word components</h3><p>Accept only reference-supported components. Check that the parts reconstruct the original word, and that the learner differentiates literal and clinical meaning. Do not require artificial splitting of eponyms.</p><h3>D. Model interpretation</h3><p>${esc(m.case[1])}</p><h3>E. Coding-literacy guide</h3><p>ICD-10-AM: diagnosis classification. ACHI: intervention classification. ACS: application standards. SNOMED CT: detailed clinical terminology. Require current local resources, clarification of ambiguity, index and tabular verification, and documentation of the applicable edition. Actual code assignments require educator review.</p><h3>Suggested review criteria</h3><ul><li>Meaning is accurate and context is preserved.</li><li>Spelling is correct or an accepted regional form.</li><li>Word components are identified without forced splits.</li><li>Symptoms, conditions and procedures are distinguished.</li><li>Missing documentation is identified without assumptions.</li></ul>${app.course.notes[m.id] ? `<h3>Local educator notes</h3><p>${esc(app.course.notes[m.id])}</p>` : ''}` : ''}<div class="print-break"></div><h2>${m.affixKind ? 'Word-element reference bank' : 'Module term reference bank'}</h2><table><thead><tr><th>${m.affixKind ? 'Form' : 'Term'}</th><th>Meaning</th></tr></thead><tbody>${(m.bank || bank).map(t => `<tr><td>${esc(t.form || t.term)}</td><td>${esc(t.meaning || t.definition)}${t.example && m.affixKind ? ' · Example: ' + esc(t.example) : ''}</td></tr>`).join('')}</tbody></table><p class="print-footnote">MedLex · Original companion learning material · ${COURSE_DETAILS.reviewed}. Terminology education; fictional cases. Primary book not redistributed. Official supplementary sources: medlineplus.gov/appendixa.html; ihacpa.gov.au; snomed.org.</p><footer class="print-footnote">HEALTHCARE CROWN ACADEMY LTD · Company 17501904 · Educational terminology support; not a clinical competence certificate.</footer></article>`;
  document.body.append(element);
  document.body.classList.add('printing-pack');
  element.scrollTop = 0;
}
export function renderSearch(q) {
  groupedSearch(q);
}
export function debouncedSearch(q) {
  clearTimeout(app.searchTimer);
  app.searchTimer = setTimeout(() => groupedSearch(q), 80);
}
export function addPracticeModes() {
  return `<section class="continue-card"><div><span class="eyebrow">TODAY’S SESSION</span><h2>Ten clear connections.</h2><p>Alternate between terms and meanings, using clinically related distractors.</p><button class="btn primary" data-v3="special" data-id="mixed">Start today’s session →</button></div><div><span class="eyebrow">MORE WAYS TO LEARN</span><div class="term-actions"><button class="btn" data-v3="build">Build a word</button><button class="btn" data-v3="special" data-id="spell">Listen & spell</button><button class="btn" data-v3="special" data-id="match">Match pairs</button></div></div></section>`;
}
export function guardSessionExit(e) {
  const b = e.target.closest('a[href^="#"],[data-action="exitpractice"],[data-course="exitexercise"]');
  if (!b || modal.open) return false;
  const running = app.quiz && (app.quiz.index > 0 || app.quiz.answered) || app.flash && app.flash.rated.length > 0 || app.exercise && (app.exercise.index > 0 || app.exercise.answered) || app.special && app.special.index > 0;
  if (!running) return false;
  e.preventDefault();
  app.pendingExit = b.getAttribute('href') || (b.dataset.course === 'exitexercise' ? '#module?id=' + app.exercise.module + '&tab=practice' : '#practice');
  showModal('<h2 id="modalTitle" class="modal-title">Leave this practice session?</h2><p>Completed recall ratings are saved. An unfinished quiz will not receive a session score.</p><div class="term-actions"><button class="btn primary" data-action="close">Keep practising</button><button class="btn" data-v3="leavesession">Leave session</button></div>', 'PAUSE & RETURN');
  return true;
}
export function studioCallout() {
  return `<section class="studio-quick-access"><div><span class="eyebrow">YOUR NEXT LEVEL OF LEARNING</span><h2>Explore. Apply. Explain.</h2><p>Connect a system, its words, fictional notes and your own explanation.</p></div><div class="term-actions"><a class="btn primary" href="#studio/hub">Open interactive studios</a><a class="btn" href="#studio/adaptive">My adaptive pathway</a></div></section>`;
}
export function studioTools() {
  return `<section class="surface"><h2>Teach, review and keep the evidence.</h2><div class="term-actions"><a class="btn primary" href="#studio/educator">Educator assignments</a><a class="btn" href="#studio/editor">Editorial review</a><a class="btn" href="#studio/portfolio">Evidence & encrypted backups</a></div>${readingControls()}</section>`;
}
export function studioProgress() {
  const events = xp().events.filter(e => e.objective),
    delayed = events.filter(e => e.gapDays >= 7);
  return `<section class="surface"><div class="section-head"><div><span class="eyebrow">EVIDENCE, NOT JUST COMPLETION</span><h2>Know what your progress means.</h2></div><a class="btn" href="#studio/portfolio">Inspect learning evidence</a></div><div class="data-facts"><div><strong>${app.state.learned.length}</strong><span>self-rated familiar</span></div><div><strong>${events.length}</strong><span>objective responses</span></div><div><strong>${delayed.length ? Math.round(delayed.filter(e => e.correct).length / delayed.length * 100) + '%' : '—'}</strong><span>accuracy after ≥7-day gap (${delayed.length} responses)</span></div></div><p class="access-note">Delayed recall uses the gap since the previous objective response in the same skill. It is not an estimate of clinical competence.</p></section>`;
}
export function validateExpansion(x) {
  if (!x || typeof x !== 'object' || Array.isArray(x)) throw Error('Invalid studio records.');
  for (const [key, cap] of [['events', 4000], ['artifacts', 500], ['assignments', 50]]) if (!Array.isArray(x[key]) || x[key].length > cap) throw Error('Invalid studio ' + key + '.');
  for (const key of ['drafts', 'editorial', 'feedback', 'reading']) if (!x[key] || typeof x[key] !== 'object' || Array.isArray(x[key])) throw Error('Invalid studio ' + key + '.');
  for (const e of x.events) if (!e || !termBy(e.termId) || !Number.isFinite(e.at) || typeof e.correct !== 'boolean' || typeof e.objective !== 'boolean') throw Error('Invalid learning response.');
  for (const a of x.artifacts) if (!a || typeof a.id !== 'string' || typeof a.title !== 'string' || !Number.isFinite(a.date)) throw Error('Invalid evidence item.');
  if (x.active && (!Array.isArray(x.active.items) || x.active.items.length > 20 || !Number.isInteger(x.active.index) || x.active.index < 0 || x.active.index >= x.active.items.length)) throw Error('Invalid saved session.');
}
export function originalRecordReport() {
  return `<section><h2>Original course and practice records</h2><p>Self-assessed outcomes: ${Object.values(app.course.outcomes).filter(Boolean).length}. Classroom / independent activities marked complete: ${Object.values(app.course.activities).filter(Boolean).length}. Completion and self-assessment are not automatic correctness scores.</p><h3>Module exercise records</h3><table><tr><th>Date</th><th>Module / mode</th><th>Evidence</th></tr>${app.course.attempts.map(a => `<tr><td>${new Date(a.date).toLocaleDateString('en-AU')}</td><td>${esc(getModule(a.module).title)} · ${esc(a.mode)}</td><td>${a.mode === 'case' ? 'Written reflection · human review<br>' + esc(a.reflection || '') : a.score + '/' + a.total + ' correct<br>' + esc((a.errors || []).map(e => e.prompt + ': ' + e.given + '; companion answer: ' + e.correct).join('\n'))}</td></tr>`).join('')}</table><h3>Practice session history</h3><table><tr><th>Date</th><th>Mode</th><th>Record</th></tr>${app.state.history.map(h => `<tr><td>${new Date(h.date).toLocaleDateString('en-AU')}</td><td>${esc(h.mode || 'Practice')}</td><td>${h.mode === 'recall' ? h.total + ' self-rated recall cards' : h.score + '/' + h.total + ' correct'}</td></tr>`).join('')}</table></section>`;
}
export function accountMenu(){showModal(`<h2 id="modalTitle">Your learning space</h2><nav class="account-links" aria-label="Account and preferences"><a class="btn" href="#settings">Profile & preferences</a><a class="btn" href="#settings/data">Data, backups & offline app</a><a class="btn" href="#progress/portfolio">Evidence portfolio</a>${app.v3.profile.role==='Educator'||app.v3.profile.teachMode?'<a class="btn" href="#teach">Teach</a>':''}<button class="btn" data-modern="shortcuts">Keyboard shortcuts</button><button class="btn" data-action="sources">About & original sources</button></nav><p class="access-note">Learning records stay on this device.</p>`,'MEDLEX SETTINGS');}

export function renderSettings() {
  const html = profileMarkup(false);
  renderPage(header('MEDLEX', 'Settings', 'Preferences, appearance and portable learning records.') + `<section class="surface settings-page">${html}</section><section class="surface" id="dataSettings"><h2>Data and backups</h2><p>Export a backup before moving to another browser or device.</p><div class="term-actions"><button class="btn" data-action="export">Export progress backup</button><a class="btn" href="#tools">Import a backup & teaching tools</a><a class="btn" href="#studio/portfolio">Encrypted backup tools</a></div></section>`, {
    overview: false
  });
  if (app.params.get('section') === 'data') (window.requestAnimationFrame || setTimeout)(() => $('#dataSettings').scrollIntoView({
    block: 'start'
  }));
}
