import{modernTerm}from'./features/modern/views.js';
import { renderPage } from "./ui/page.js";
import { EXTRA_LANGUAGE_GUIDES } from './data/config.js';
import { COURSE_MODULES, LESSONS, PREFIXES, QUOTES, SUFFIXES, TERMS } from './data/index.js';
import { filterAffixes, filterModuleBank, filterModules, modulePractice, openAffix, renderToolkit } from './features/learn/index.js';
import { accountMenu, answer, completeCase, debouncedSearch, exportAffixBank, exportMapping, exportProgress, exportTermBank, guardSessionExit, markLearned, moduleFlash, nextQuestion, persist, persistCourse, previewImport, printPack, refreshBehindModal, renderMapping, renderStudySessions, revealCase, shuffle, today, toggleSave } from './features/learn/legacy-tools.js';
import { filterLibrary, openChapter, openTerm } from './features/library/index.js';
import { compare, lesson, lessons, shortcuts, showPart, sources, wordlab } from './features/library/resources.js';
import { installVisualSymbols } from './features/library/visuals.js';
import { answerSpecial, groupedSearch, nextSpecial, startSpecial } from './features/practice/additional.js';
import { answerExercise, drawBuild, nextExercise, practice, rateFlash, renderFlash, startBuild, startExercise, startFlash, startQuiz } from './features/practice/index.js';
import { search } from './features/search/index.js';
import { profile } from './features/settings/index.js';
import { ASSIST_LANGUAGES, MEANING_GUIDES, assistLanguage, hideMeaningTip, meaningTarget, partTranslation, pinMeaningGuide, pinPartMeaning, showMeaningTip, translatedLine } from './features/settings/language.js';
import { englishVoices, listenEnglish, refreshVoiceControls, saveLiveVoice, speak, stopEnglishAudio, voiceOptions, voicePreferencesFrom } from './features/settings/voice.js';
import { aboutStudio, adaptiveAnswer, adaptiveNext, adaptivePage, addArtifact, applyReading, assignmentPack, atlasPage, clinicalPage, codingPage, confirmEvidence, confusionAnswer, confusionQuiz, confusionsPage, connectedJourney, createAssignment, decryptBackup, drawPairs, editorPage, encryptBackup, evidenceJSON, evidenceList, explainCompare, explainPage, exportFeedbackCSV, importEvidence, noteCompare, pairMeaning, portfolioPage, portfolioReport, pronunciationPage, recordLearning, renderAdaptive, reviewEvidence, saveCoding, saveEditorial, saveExplanation, saveFeedback, saveNote, savePronunciation, startAdaptive, startOnboarding, startPairs, startRecording, stopRecording, submitOnboarding, viewArtifact, xp } from './features/studios/index.js';
import { activityDrafts, changeSheetStep, currentSheet, openWorksheet, renderWorksheet, sheetExport, sheetKey, sheetMeta, touchWorksheet, updateWorksheetSaveStatus, worksheetURL } from './features/worksheet/index.js';
import { applyLearnView, navigate, render, setNav } from './router/index.js';
import { blankV3, calendar, flushPendingSave, hydrateV3, initializeV3, migrate, saveV3, trackItem } from './state/actions.js';
import { initial } from './state/defaults.js';
import { applyPreferences } from './state/preferences.js';
import { app } from './state/runtime.js';
import { bankFor, courseDefaults, getModule, termBy } from './state/selectors.js';
import { closeModal, header, showModal, toast } from './ui/components/index.js';
import { $, $$, main, modal } from './ui/dom.js';
import { eventHandlers } from './ui/events.js';
import { PAGE_GUIDES, guideContent, hideGuide, showGuide } from './ui/guidance.js';
export function bootstrap() {
  app.state = undefined;
  try {
    app.state = {
      ...initial,
      ...JSON.parse(localStorage.getItem('medlex-v1') || '{}')
    };
  } catch {
    app.state = {
      ...initial
    };
  }
  for (const k of ['saved', 'learned', 'lessons', 'history', 'visits']) if (!Array.isArray(app.state[k])) app.state[k] = [];
  if (!app.state.reviews || typeof app.state.reviews !== 'object' || Array.isArray(app.state.reviews)) app.state.reviews = {};
  app.state.name = typeof app.state.name === 'string' ? app.state.name.slice(0, 40) : '';
  app.state.history = app.state.history.filter(h => h && Number.isFinite(h.date) && Number.isFinite(h.score) && Number.isFinite(h.total) && h.total > 0 && h.score >= 0 && h.score <= h.total);
  app.state.reviews = Object.fromEntries(Object.entries(app.state.reviews).filter(([id, r]) => TERMS.some(t => t.id === id) && r && Number.isFinite(r.due) && Number.isFinite(r.reps)));
  app.state.saved = app.state.saved.filter(id => TERMS.some(t => t.id === id));
  app.state.learned = app.state.learned.filter(id => TERMS.some(t => t.id === id));
  app.state.lessons = app.state.lessons.filter(i => Number.isInteger(i) && LESSONS[i]);
  app.storageFailed = false;
  app.saveTimer = undefined;
  if (!app.state.visits.includes(today())) {
    app.state.visits.push(today());
    app.state.visits = app.state.visits.slice(-365);
    persist();
  }
  app.route = 'home';
  app.params = new URLSearchParams();
  app.quoteIndex = 0;
  app.activeTerm = null;
  app.quiz = null;
  app.flash = null;
  app.labTerm = 'pericarditis';
  app.libraryFilter = 'all';
  app.libraryQuery = '';
  app.libraryChapter = 'all';
  app.returnFocus = null;
  app.pendingQuiz = null;
  eventHandlers.click.push(e => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    const a = b.dataset.action,
      id = b.dataset.id,
      i = Number(b.dataset.index);
    switch (a) {
      case 'menu':
        $('#sidebar').classList.toggle('open');
        break;
      case 'theme':
        app.state.theme = {
          light: 'dark',
          dark: 'system',
          system: 'light'
        }[app.state.theme] || 'light';
        applyPreferences();
        persist();
        break;
      case 'search':
        search();
        break;
      case 'close':
        closeModal();
        break;
      case 'term':
        openTerm(id);
        break;
      case 'save':
        toggleSave(id);
        break;
      case 'learned':
        markLearned(id);
        break;
      case 'speak':
        speak(id);
        break;
      case 'chapter':
        openChapter(Number(id));
        break;
      case 'part':
        app.activeTerm = null;
        showPart(id, i);
        break;
      case 'partinline':
        {
          const p = termBy(id)?.parts[i];
          if (p) $('#partInline').textContent = `${p.text} · ${p.type === 'vowel' ? 'combining vowel' : p.type}: ${p.meaning}.`;
          break;
        }
      case 'labpart':
        {
          const p = termBy(app.labTerm)?.parts[i],detail=$('#labPartDetail');
          if(!p||!detail)break;
          detail.innerHTML = `<span class="eyebrow">${p.type === 'vowel' ? 'COMBINING VOWEL' : p.type.toUpperCase()}</span><h3>${p.text}</h3><p>${p.meaning}${p.type === 'vowel' ? '. It connects parts without adding a separate clinical meaning.' : '.'}</p>`;
          $('#labPartDetail').insertAdjacentHTML('beforeend', translatedLine(partTranslation(p)));
          break;
        }
      case 'libfilter':
        app.libraryFilter = id;
        filterLibrary();
        break;
      case 'clearlib':
        app.libraryFilter = 'all';
        app.libraryChapter = 'all';
        app.libraryQuery = '';
        $('#librarySearch').value = '';
        $('#chapterFilter').value = 'all';
        filterLibrary();
        break;
      case 'chapterlibrary':
        closeModal();
        navigate('#library?chapter=' + id);
        break;
      case 'lessons':
        lessons();
        break;
      case 'startlearning':
        {
          const next = LESSONS.findIndex((_, j) => !app.state.lessons.includes(j));
          lesson(next < 0 ? 0 : next);
          break;
        }
      case 'lesson':
        lesson(i);
        break;
      case 'completelesson':
        if (!app.state.lessons.includes(i)) app.state.lessons.push(i);
        persist();
        refreshBehindModal();
        if (i < 6) lesson(i + 1);else {
          lessons();
          toast('All seven foundations complete. Explore a body system next.');
        }
        break;
      case 'compare':
        compare(i);
        break;
      case 'nextquote':
        app.quoteIndex = (app.quoteIndex + 1) % QUOTES.length;
        $('#homeQuote').textContent = QUOTES[app.quoteIndex];
        $('#quoteCount').textContent = `0${app.quoteIndex + 1} / 04`;
        break;
      case 'quiz':
        if (app.route !== 'practice') {
          app.pendingQuiz = id || 'meaning';
          navigate('#practice');
        } else startQuiz(id || 'meaning');
        break;
      case 'quickquiz':
        if (modal.open) closeModal();
        if (app.route !== 'practice') {
          app.pendingQuiz = 'meaning';
          navigate('#practice');
        } else startQuiz('meaning');
        break;
      case 'answer':
        answer(i);
        break;
      case 'nextquestion':
        nextQuestion();
        break;
      case 'exitpractice':
        navigate('#practice');
        break;
      case 'flashstart':
        startFlash(id || 'due');
        break;
      case 'flip':
        if (app.flash) {
          app.flash.revealed = !app.flash.revealed;
          renderFlash();
        }
        break;
      case 'rate':
        rateFlash(Number(id));
        break;
      case 'profile':
        profile();
        break;
      case 'sources':
        sources();
        break;
      case 'export':
        exportProgress();
        break;
      case 'resetprompt':
        showModal(`<h2 id="modalTitle" class="modal-title">Start a fresh chapter?</h2><p class="modal-subtitle">This removes saved words, familiarity ratings, completed lessons, recall schedules and quiz history from this browser. Your display preferences stay in place.</p><div class="term-actions"><button class="btn" data-action="profile">Keep my progress</button><button class="btn primary" data-action="resetconfirm">Reset learning progress</button></div>`, 'YOUR LOCAL LEARNING DATA');
        break;
      case 'resetconfirm':
        app.state = {
          ...initial,
          name: app.state.name,
          theme: app.state.theme,
          reduced: app.state.reduced,
          saved: [],
          learned: [],
          lessons: [],
          history: [],
          reviews: {},
          visits: [today()]
        };
        persist();
        closeModal();
        render();
        toast('Your learning progress has been reset.');
        break;
    }
  });
  eventHandlers.input.push(e => {
    if (e.target.id === 'librarySearch') {
      app.libraryQuery = e.target.value;
      filterLibrary();
    }
    if (e.target.id === 'globalSearch') debouncedSearch(e.target.value);
  });
  eventHandlers.change.push(e => {
    if (e.target.id === 'chapterFilter') {
      app.libraryChapter = e.target.value;
      filterLibrary();
    }
    if (e.target.id === 'labSelect') {
      app.labTerm = e.target.value;
      wordlab();
    }
  });
  eventHandlers.submit.push(e => {
    if (e.target.id === 'profileForm') {
      e.preventDefault();
      const f = new FormData(e.target);
      app.state.name = String(f.get('name') || '').trim().slice(0, 40);
      app.state.reduced = f.get('motion') === 'system' ? null : f.get('motion') === 'reduce';
      app.state.theme = f.get('theme');
      app.v3.profile = {
        ...app.v3.profile,
        role: f.get('role'),
        dailyGoalMin: +f.get('goal'),
        textScale: +f.get('scale'),
        highContrast: f.has('contrast'),
        teachMode:f.has('teachMode'),
        scheduler:f.get('scheduler')==='fsrs'?'fsrs':'classic',
        ...voicePreferencesFrom(e.target),
        assistingLanguage: ASSIST_LANGUAGES[f.get('assistingLanguage')] ? f.get('assistingLanguage') : ''
      };
      persist();
      applyPreferences();
      closeModal();
      refreshBehindModal();
      toast('Your learning space is ready.');
    }
  });
  eventHandlers.keydown.push(e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      search();
      return;
    }
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
    if (typing || modal.open || e.ctrlKey || e.metaKey || e.altKey) return;
    if (app.quiz) {
      if (!app.quiz.answered && /^[abcd]$/i.test(e.key)) {
        e.preventDefault();
        answer(e.key.toLowerCase().charCodeAt(0) - 97);
      } else if (app.quiz.answered && e.key === 'Enter') {
        e.preventDefault();
        nextQuestion();
      }
    }
    if (app.flash) {
      if (e.code === 'Space' && !['BUTTON', 'A'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        app.flash.revealed = !app.flash.revealed;
        renderFlash();
      }
      if (app.flash.revealed && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        rateFlash(e.key === 'ArrowRight' ? 3 : 1);
      }
    }
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      const r = modal.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeModal();
    }
  });
  modal.addEventListener('cancel', () => {
    app.activeTerm = null;
  });
  eventHandlers.click.push(e => {
    if (!e.target.closest('.sidebar') && !e.target.closest('[data-action="menu"]')) $('#sidebar').classList.remove('open');
  });
  window.addEventListener('hashchange', () => {
    render();
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  });
  app.course = undefined;
  try {
    app.course = {
      ...courseDefaults(),
      ...JSON.parse(localStorage.getItem('medlex-course-v2') || '{}')
    };
  } catch {
    app.course = courseDefaults();
  }
  for (const k of ['outcomes', 'activities', 'notes', 'mapping']) if (!app.course[k] || typeof app.course[k] !== 'object' || Array.isArray(app.course[k])) app.course[k] = {};
  if (!Array.isArray(app.course.attempts)) app.course.attempts = [];
  app.course.attempts = app.course.attempts.filter(a => a && COURSE_MODULES.some(m => m.id === a.module) && Number.isFinite(a.date) && typeof a.mode === 'string' && (a.mode === 'case' || Number.isFinite(a.score) && Number.isFinite(a.total) && a.total > 0 && a.score >= 0 && a.score <= a.total)).slice(-300);
  if (!COURSE_MODULES.some(m => m.id === app.course.last)) app.course.last = 'ch1';
  if (![10, 20, 30, 45].includes(+app.course.planMinutes)) app.course.planMinutes = 20;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(app.course.planStart || '')) app.course.planStart = new Date().toISOString().slice(0, 10);
  app.moduleTab = 'outline';
  app.moduleQuery = '';
  app.moduleTrack = 'all';
  app.moduleBankQuery = '';
  app.affixKind = 'prefix';
  app.affixQuery = '';
  app.affixTier = 'all';
  app.exercise = null;
  app.moduleDisplayLimit = 24;
  eventHandlers.click.push(e => {
    const b = e.target.closest('[data-module-tab]');
    if (b) navigate('#learn/module/' + b.dataset.module + '/' + b.dataset.moduleTab);
  });
  eventHandlers.keydown.push(e => {
    const b = e.target.closest('[data-module-tab]');
    if (!b || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const list = [...main.querySelectorAll('[data-module-tab]')],
      at = list.indexOf(b),
      next = e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : (at + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length,
      target = list[next];
    history.pushState(null, '', '#learn/module/' + target.dataset.module + '/' + target.dataset.moduleTab);
    render();
    main.querySelector('[data-module-tab="' + target.dataset.moduleTab + '"]')?.focus();
  });
  app.pendingImport = null;
  app.globalLimit = 60;
  ;
  eventHandlers.click.push(e => {
    const b = e.target.closest('[data-course]');
    if (!b) {
      if (e.target.closest('[data-action="resetconfirm"]')) {
        app.course = courseDefaults();
        persistCourse();
        render();
      }
      return;
    }
    const action = b.dataset.course,
      id = b.dataset.id,
      m = getModule(id);
    switch (action) {
      case 'exercise':
        startExercise(m, b.dataset.mode);
        break;
      case 'exitexercise':
        modulePractice(m);
        break;
      case 'exerciseanswer':
        if (app.exercise) answerExercise(app.exercise.items[app.exercise.index].options[Number(b.dataset.index)]);
        break;
      case 'exercisenext':
        nextExercise();
        break;
      case 'revealcase':
        revealCase();
        break;
      case 'completecase':
        completeCase();
        break;
      case 'moduleflash':
        moduleFlash(m);
        break;
      case 'moreterms':
        app.moduleDisplayLimit += 24;
        filterModuleBank(m);
        break;
      case 'globalmore':
        app.globalLimit += 60;
        filterLibrary();
        break;
      case 'affix':
        openAffix(id);
        break;
      case 'exportmapping':
        exportMapping();
        break;
      case 'exportterms':
        exportTermBank(m);
        break;
      case 'exportaffixes':
        exportAffixBank(b.dataset.kind);
        break;
      case 'print':
        printPack(m, b.dataset.style === 'teacher');
        break;
      case 'printnow':
        window.print();
        break;
      case 'closeprint':
        $('#printPack')?.remove();
        document.body.classList.remove('printing-pack');
        break;
      case 'confirmimport':
        if (app.pendingImport) {
          app.v3 = app.pendingImport.v3 || migrate(app.pendingImport.studio, app.pendingImport.course);
          app.state = app.pendingImport.studio;
          app.course = app.pendingImport.course;
          app.pendingImport = null;
          persist();
          persistCourse();
          applyPreferences();
          render();
          toast('Learning record restored.');
        }
        break;
      case 'cancelimport':
        app.pendingImport = null;
        $('#importPreview').innerHTML = '';
        $('#importProgress').value = '';
        break;
    }
  });
  eventHandlers.submit.push(e => {
    if (e.target.id === 'spellingForm') {
      e.preventDefault();
      if ($('#spellingAnswer').value.trim()) answerExercise($('#spellingAnswer').value);
    }
  });
  eventHandlers.input.push(e => {
    const el = e.target;
    if (el.id === 'moduleSearch') {
      app.moduleQuery = el.value;
      filterModules();
    }
    if (el.id === 'moduleBankSearch') {
      app.moduleBankQuery = el.value;
      app.moduleDisplayLimit = 24;
      filterModuleBank(getModule(app.params.get('id')));
    }
    if (el.id === 'affixSearch') {
      app.affixQuery = el.value;
      filterAffixes(app.route === 'module' ? getModule(app.params.get('id')).bank : app.affixKind === 'prefix' ? PREFIXES : SUFFIXES);
    }
    if (el.id === 'educatorNotes') {
      app.course.notes[el.dataset.module] = el.value.slice(0, 6000);
      persistCourse();
    }
    if (el.dataset.mapping) {
      app.course.mapping[el.dataset.mapping] = el.value.slice(0, 400);
      persistCourse();
    }
    if (el.id === 'librarySearch') {
      app.globalLimit = 60;
      filterLibrary();
    }
  });
  eventHandlers.change.push(e => {
    const el = e.target;
    if (el.id === 'moduleTrack') {
      app.moduleTrack = el.value;
      filterModules();
    }
    if (el.id === 'affixTier') {
      app.affixTier = el.value;
      filterAffixes(app.route === 'module' ? getModule(app.params.get('id')).bank : PREFIXES);
    }
    if (el.dataset.courseCheck === 'outcome') {
      app.course.outcomes[el.dataset.id] = el.checked;
      persistCourse();
    }
    if (el.dataset.courseCheck === 'activity') {
      app.course.activities[el.dataset.id] = el.checked;
      persistCourse();
    }
    if (el.id === 'mappingModule') renderMapping(getModule(el.value));
    if (el.id === 'planMinutes' || el.id === 'planStart') {
      app.course.planMinutes = +$('#planMinutes').value;
      app.course.planStart = $('#planStart').value;
      persistCourse();
      renderStudySessions();
    }
    if (el.id === 'importProgress' && el.files[0]) previewImport(el.files[0]);
  });
  eventHandlers.keydown.push(e => {
    if (e.key === 'Escape' && $('#printPack')) {
      $('#printPack').remove();
      document.body.classList.remove('printing-pack');
    }
  });
  app.v3 = undefined;
  app.storageState = {
    pending: false,
    dirty: false,
    error: null,
    savedAt: 0
  };
  app.sessionStarted = Date.now();
  app.lastInteraction = Date.now();
  app.build = null;
  app.learnView = 'path';
  document.addEventListener('pointerdown', () => {
    app.lastInteraction = Date.now();
  }, {
    passive: true
  });
  eventHandlers.click.push(e => {
    const old = e.target.closest('[data-action]');
    if (old?.dataset.action === 'menu') setNav($('#sidebar').classList.contains('open'));
    const b = e.target.closest('[data-v3]');
    if (!b) return;
    const id = b.dataset.id;
    switch (b.dataset.v3) {
      case 'learnview':
        app.learnView = id;
        filterModules();
        applyLearnView();
        break;
      case 'randomword':
        app.labTerm = shuffle(TERMS.filter(t => t.parts.length))[0].id;
        wordlab();
        break;
      case 'calendar':
        calendar();
        break;
      case 'shortcuts':
        shortcuts();
        break;
      case 'build':
        startBuild();
        break;
      case 'buildpart':
        if (app.build && !app.build.checked && !app.build.chosen.includes(+id)) {
          app.build.chosen.push(+id);
          drawBuild();
        }
        break;
      case 'unbuild':
        if (!app.build.checked) {
          app.build.chosen.splice(+id, 1);
          drawBuild();
        }
        break;
      case 'checkbuild':
        app.build.checked = true;
        recordLearning(app.build.terms[app.build.index].id, 'components', app.build.chosen.every((n, i) => n === i), {
          source: 'build-a-word'
        });
        if (app.build.chosen.every((n, i) => n === i)) app.build.score++;
        trackItem();
        persist();
        drawBuild();
        break;
      case 'buildnext':
        if (++app.build.index < 5) {
          app.build.chosen = [];
          app.build.checked = false;
          drawBuild();
        } else {
          app.state.history.unshift({
            date: Date.now(),
            mode: 'build',
            score: app.build.score,
            total: 5
          });
          persist();
          renderPage(header('SESSION COMPLETE', 'A word, assembled.', 'Every part is a clue. Always check the full clinical meaning.') + `<section class="surface score"><div class="score-orb">${app.build.score}/5</div><h2>Connections made.</h2><a href="#today" class="btn primary">Back to Today</a></section>`, {
            overview: false
          });
          app.build = null;
        }
        break;
      case 'reset':
        showModal('<h2 id="modalTitle" class="modal-title">Reset your learning record?</h2><p>Export a backup first if you want to keep your progress. Type RESET to remove the learning records on this device.</p><form id="resetForm" class="profile-form"><label>Confirmation<input name="confirmation" autocomplete="off" required pattern="RESET"></label><button class="btn primary" type="submit">Reset learning record</button></form>');
        break;
    }
  });
  eventHandlers.submit.push(e => {
    if (e.target.id !== 'resetForm') return;
    e.preventDefault();
    if (new FormData(e.target).get('confirmation') !== 'RESET') return;
    saveV3();
    const previous = JSON.stringify(app.v3);
    app.v3 = blankV3();
    hydrateV3();
    persist();
    applyPreferences();
    closeModal();
    render();
    const el = $('#toast');
    el.innerHTML = 'Learning record reset. <button id="undoReset" class="btn small">Undo</button>';
    el.classList.add('show');
    $('#undoReset').onclick = () => {
      app.v3 = JSON.parse(previous);
      hydrateV3();
      persist();
      render();
      el.classList.remove('show');
    };
    setTimeout(() => el.classList.remove('show'), 5000);
  });
  eventHandlers.keydown.push(e => {
    app.lastInteraction = Date.now();
    const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
    if (e.key === 'Escape' && $('#sidebar').classList.contains('open')) {
      setNav(false);
      $('.menu-toggle').focus();
    }
    if ($('#sidebar').classList.contains('open') && e.key === 'Tab') {
      const list = $$('#sidebar a,#sidebar button'),
        first = list[0],
        last = list.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    if (typing || modal.open) return;
    if (e.key === '?') {
      e.preventDefault();
      shortcuts();
    }
    if (e.key === '/') {
      e.preventDefault();
      search();
    }
    if (app.flash?.revealed && /^[1-4]$/.test(e.key)) {
      e.preventDefault();
      rateFlash(+e.key);
    }
  });
  window.addEventListener('visibilitychange', () => {
    if (document.hidden && app.storageState.pending) flushPendingSave();
  });
  window.addEventListener('beforeunload', e => {
    if (app.storageState.pending) flushPendingSave();
    if ((app.route==='worksheet'&&app.storageState.pending)||(app.storageState.dirty && app.storageState.error)) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
  app.searchFocus = -1;
  app.special = null;
  app.searchTimer = undefined;
  eventHandlers.click.push(e => {
    const b = e.target.closest('[data-v3]');
    if (b?.dataset.v3 === 'special') startSpecial(b.dataset.id);
    if (b?.dataset.v3 === 'specialanswer') answerSpecial(b.dataset.id);
    if (b?.dataset.v3 === 'specialnext') nextSpecial();
    if (b?.dataset.v3 === 'reviewmistakes') {
      for (const id of app.special.wrong) app.state.reviews[id] = {
        reps: 0,
        due: Date.now(),
        interval: 0,
        ease: 2.5,
        lapses: 0
      };
      persist();
      toast('These words are ready for recall review.');
    }
    if (b?.dataset.v3 === 'recentsearch') {
      $('#globalSearch').value = b.dataset.id;
      groupedSearch(b.dataset.id);
    }
    if (e.target.closest('#globalResults [data-action],#globalResults [data-course],#globalResults a')) {
      const q = $('#globalSearch')?.value.trim();
      if (q) {
        app.v3.search.recent = [q, ...app.v3.search.recent.filter(x => x !== q)].slice(0, 8);
        persist();
      }
    }
  });
  eventHandlers.submit.push(e => {
    if (e.target.id === 'listenSpell') {
      e.preventDefault();
      answerSpecial(new FormData(e.target).get('answer'));
    }
  });
  eventHandlers.keydown.push(e => {
    if (modal.open && e.target.id === 'globalSearch' && ['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
      const list = $$('#globalResults button,#globalResults a');
      if (e.key === 'Enter' && app.searchFocus >= 0) {
        e.preventDefault();
        list[app.searchFocus]?.click();
      } else if (e.key !== 'Enter') {
        e.preventDefault();
        app.searchFocus = (app.searchFocus + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length;
        list.forEach((el, i) => el.classList.toggle('search-focused', i === app.searchFocus));
        list[app.searchFocus]?.scrollIntoView?.({
          block: 'nearest'
        });
      }
    }
    if (app.special && !modal.open && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) {
      if (/^[a-d]$/i.test(e.key) && !app.special.answered && app.special.mode !== 'spell') answerSpecial(e.key.toLowerCase().charCodeAt(0) - 97);else if (e.key === 'Enter' && app.special.answered) nextSpecial();
    }
  });
  app.pendingExit = null;
  eventHandlers.click.push(e => {
    if (e.target.closest('[data-v3="leavesession"]')) {
      const target = app.pendingExit;
      app.quiz = null;
      app.flash = null;
      app.exercise = null;
      app.special = null;
      app.pendingExit = null;
      closeModal();
      if (location.hash === target) render();else navigate(target);
    }
  });
  app.adaptiveRun = null;
  app.noteModule = 'ch9';
  app.explainTerm = 'pericarditis';
  app.atlasChapter = 9;
  app.confusionIndex = 0;
  app.confusionRun = null;
  app.pronounceTerm = 'pericarditis';
  app.editorTerm = 'pericarditis';
  app.lastClip = null;
  app.mediaRecorder = null;
  app.mediaStream = null;
  app.recordingTimer = null;
  app.recordingSeconds = 0;
  app.reviewArtifact = null;
  app.pendingEvidence = null;
  app.pendingEncrypted = null;
  eventHandlers.click.push(e => {
    const b = e.target.closest('[data-advance]');
    if (!b) return;
    const id = b.dataset.id;
    switch (b.dataset.advance) {
      case 'help':
        aboutStudio(id);
        break;
      case 'focus':
        xp().reading.focus = !xp().reading.focus;
        applyReading();
        persist();
        $$('[data-advance=focus]').forEach(el => {
          el.textContent = xp().reading.focus ? 'Leave focus mode' : 'Focus mode';
          el.setAttribute('aria-pressed', String(!!xp().reading.focus));
        });
        break;
      case 'adaptiveStart':
        startAdaptive(id);
        break;
      case 'adaptiveHome':
        app.adaptiveRun = null;
        adaptivePage();
        break;
      case 'resumeAdaptive':
        if (xp().active) {
          app.adaptiveRun = xp().active;
          renderAdaptive();
        }
        break;
      case 'confidence':
        if (app.adaptiveRun && !app.adaptiveRun.answered) {
          app.adaptiveRun.confidence = id;
          xp().active = app.adaptiveRun;
          persist();
          renderAdaptive();
        }
        break;
      case 'adaptiveAnswer':
        adaptiveAnswer(+id);
        break;
      case 'adaptiveNext':
        adaptiveNext();
        break;
      case 'noteCompare':
        noteCompare();
        break;
      case 'saveNote':
        saveNote();
        break;
      case 'explainCompare':
        explainCompare();
        break;
      case 'saveExplanation':
        saveExplanation();
        break;
      case 'confusionSelect':
        app.confusionIndex = +id;
        app.confusionRun = null;
        confusionsPage();
        break;
      case 'confusionQuiz':
        confusionQuiz();
        break;
      case 'confusionAnswer':
        confusionAnswer(+id);
        break;
      case 'atlasSelect':
        app.atlasChapter = +id;
        atlasPage();
        break;
      case 'atlasJourney':
        connectedJourney();
        break;
      case 'recordStart':
        startRecording();
        break;
      case 'recordStop':
        stopRecording();
        break;
      case 'savePronunciation':
        savePronunciation();
        break;
      case 'saveCoding':
        saveCoding();
        break;
      case 'editTerm':
        app.editorTerm = id;
        closeModal();
        if (location.hash === '#studio/editor') editorPage();else navigate('#studio/editor');
        break;
      case 'journeyTerm':
        {
          const t = termBy(id);
          app.atlasChapter = t.chapter;
          app.noteModule = 'ch' + t.chapter;
          if (t.plain !== t.definition && t.parts.length) {
            app.explainTerm = t.id;
            app.pronounceTerm = t.id;
            app.labTerm = t.id;
          }
          connectedJourney();
          break;
        }
      case 'assignmentPack':
        assignmentPack(id, false);
        break;
      case 'assignmentGuide':
        assignmentPack(id, true);
        break;
      case 'viewArtifact':
        viewArtifact(id);
        break;
      case 'reviewArtifact':
        reviewEvidence(id);
        break;
      case 'portfolioHTML':
        portfolioReport();
        break;
      case 'portfolioJSON':
        evidenceJSON();
        break;
      case 'feedbackCSV':
        exportFeedbackCSV();
        break;
      case 'confirmEvidence':
        confirmEvidence();
        break;
      case 'confirmEncrypted':
        if (app.pendingEncrypted) {
          app.v3 = app.pendingEncrypted.v3;
          app.state = app.pendingEncrypted.studio;
          app.course = app.pendingEncrypted.course;
          app.pendingEncrypted = null;
          xp();
          persist();
          applyPreferences();
          applyReading();
          navigate('#progress/portfolio');
          toast('Encrypted backup restored.');
        }
        break;
      case 'cancelEncrypted':
        app.pendingEncrypted = null;
        $('#encryptedPreview').innerHTML = '';
        break;
    }
  });
  eventHandlers.input.push(e => {
    const el = e.target;
    if (el.dataset.studioDraft) {
      xp().drafts[el.dataset.studioDraft] = el.value.slice(0, +el.maxLength || 4000);
      persist();
      const s = $('#studioSaveStatus');
      if (s) s.textContent = 'Draft saved on this device.';
    }
    if (el.id === 'adaptiveSpellingInput' && app.adaptiveRun) {
      app.adaptiveRun.draft = el.value;
      xp().active = app.adaptiveRun;
      persist();
    }
  });
  eventHandlers.change.push(e => {
    const el = e.target;
    switch (el.id) {
      case 'clinicalModule':
        app.noteModule = el.value;
        clinicalPage();
        break;
      case 'codingModule':
        app.noteModule = el.value;
        codingPage();
        break;
      case 'explainTerm':
        app.explainTerm = el.value;
        explainPage();
        break;
      case 'pronunciationTerm':
        stopRecording();
        app.pronounceTerm = el.value;
        pronunciationPage();
        break;
      case 'editorSearch':
        {
          const matches = TERMS.filter(t => t.term.toLowerCase() === el.value.trim().toLowerCase());
          if (matches.length) {
            app.editorTerm = matches[0].id;
            editorPage();
          } else toast('Choose a term in the existing library.');
          break;
        }
      case 'evidenceFilter':
        $('#evidenceList').innerHTML = evidenceList(el.value);
        break;
      case 'importEvidence':
        if (el.files?.[0]) importEvidence(el.files[0]);
        break;
      case 'readingSpacing':
        xp().reading.spacing = +el.value;
        applyReading();
        persist();
        break;
    }
  });
  eventHandlers.submit.push(e => {
    const id = e.target.id;
    if (!['adaptiveSpelling', 'editorForm', 'assignmentForm', 'feedbackForm', 'encryptedExport', 'encryptedImport'].includes(id)) return;
    e.preventDefault();
    if (id === 'adaptiveSpelling') adaptiveAnswer($('#adaptiveSpellingInput').value);
    if (id === 'editorForm') saveEditorial(e.target);
    if (id === 'assignmentForm') createAssignment(e.target);
    if (id === 'feedbackForm') saveFeedback(e.target);
    if (id === 'encryptedExport') encryptBackup(e.target);
    if (id === 'encryptedImport') decryptBackup(e.target);
  });
  eventHandlers.keydown.push(e => {
    if (modal.open || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (app.adaptiveRun && $('#adaptiveSpellingInput') === null) {
      if (!app.adaptiveRun.answered && /^[a-d]$/i.test(e.key)) adaptiveAnswer(e.key.toLowerCase().charCodeAt(0) - 97);else if (app.adaptiveRun.answered && e.key === 'Enter') adaptiveNext();
    }
  });
  window.addEventListener('pagehide', stopRecording);
  app.pairRun = null;
  app.onboardingStep = 0;
  eventHandlers.click.push(e => {
    const b = e.target.closest('[data-advance]');
    if (!b) return;
    if (b.dataset.advance === 'startPairs') startPairs();
    if (b.dataset.advance === 'pairTerm' && app.pairRun && !app.pairRun.matched.includes(b.dataset.id)) {
      app.pairRun.selected = b.dataset.id;
      drawPairs();
    }
    if (b.dataset.advance === 'pairMeaning') pairMeaning(b.dataset.id);
    if (b.dataset.advance === 'onboardBack') startOnboarding(Math.max(0, app.onboardingStep - 1));
  });
  eventHandlers.submit.push(e => {
    if (e.target.id === 'onboardingForm') {
      e.preventDefault();
      submitOnboarding(e.target);
    }
  });
  eventHandlers.change.push(e => {
    if (e.target.id === 'labCombo') {
      const t = TERMS.find(t => t.parts.length && t.term.toLowerCase() === e.target.value.trim().toLowerCase());
      if (t) {
        app.labTerm = t.id;
        wordlab();
      } else toast('Choose a term with curated components from the suggestions.');
    }
  });
  app.guidePopup = null;
  app.guideTimer = undefined;
  document.addEventListener('pointerover', e => {
    const el = e.target.closest('[data-hint]');
    if (el) {
      clearTimeout(app.guideTimer);
      app.guideTimer = setTimeout(() => showGuide(el), 350);
    }
  });
  document.addEventListener('pointerout', e => {
    if (e.target.closest('[data-hint]') && !e.relatedTarget?.closest('#workspaceGuide')) {
      clearTimeout(app.guideTimer);
      app.guideTimer = setTimeout(hideGuide, 180);
    }
  });
  document.addEventListener('focusin', e => {
    const el = e.target.closest('[data-hint]');
    if (el) showGuide(el);else hideGuide();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideGuide();
  });
  window.addEventListener('scroll', hideGuide, true);
  document.querySelectorAll('#sidebar [data-guide],#sidebar [data-hint]').forEach(e => {
    e.removeAttribute('data-guide');
    e.removeAttribute('data-hint');
    e.removeAttribute('aria-describedby');
  });
  $('#themeButton').dataset.hint = 'Change appearance. Your preference is saved on this device.';
  app.activeWorksheet = null;
  PAGE_GUIDES.home = PAGE_GUIDES.today;
  window.addEventListener('hashchange', hideGuide);
  app.deletedSheet = null;
  app.removedSheetRow = null;
  eventHandlers.input.push(e => {
    const el = e.target.closest('[data-worksheet-field]');
    if (!el || !app.activeWorksheet || app.route !== 'worksheet') return;
    currentSheet()[el.dataset.worksheetField] = el.type === 'checkbox' ? el.checked ? 'yes' : 'no' : el.value;
    touchWorksheet();
    if (el.tagName === 'TEXTAREA') {
      el.style.height = 'auto';
      el.style.height = Math.max(80, el.scrollHeight) + 'px';
    }
  });
  eventHandlers.click.push(e => {
    const info = e.target.closest('button[data-guide]');
    if (info) {
      hideGuide();
      showModal(guideContent(info), 'LEARNING GUIDE');
      return;
    }
    const b = e.target.closest('[data-workspace],[data-sheet]');
    if (!b) return;
    if (b.dataset.workspace) {
      openWorksheet(getModule(b.dataset.module), b.dataset.type, Number(b.dataset.index), b.dataset.workspace === 'blank');
      return;
    }
    if (!app.activeWorksheet) return;
    const s = app.activeWorksheet,
      action = b.dataset.sheet,
      m = getModule(s.module);
    if (['next', 'previous', 'step'].includes(action)) {
      changeSheetStep(action === 'step' ? Number(b.dataset.step) : s.step + (action === 'next' ? 1 : -1));
      return;
    }
    if (action === 'new') {
      openWorksheet(m, s.type, s.index, true);
      return;
    }
    if (action === 'openDraft') {
      s.key = b.dataset.key;
      s.step = sheetMeta(s.key).step || 0;
      navigate(worksheetURL());
      return;
    }
    if (action === 'duplicate') {
      const original = b.dataset.key;
      openWorksheet(m, s.type, s.index, true);
      xp().drafts[app.activeWorksheet.key] = JSON.parse(JSON.stringify(xp().drafts[original]));
      touchWorksheet();
      return;
    }
    if (action === 'delete') {
      const key = b.dataset.key;
      app.deletedSheet = {
        key,
        data: xp().drafts[key],
        meta: sheetMeta(key)
      };
      delete xp().drafts[key];
      delete xp().worksheetMeta[key];
      persist();
      toast('Worksheet deleted.');
      $('#toast').insertAdjacentHTML('beforeend', ' <button class="btn small" data-sheet="undoDelete">Undo</button>');
      if (key === sheetKey()) {
        if (activityDrafts(s.module, s.type, s.index).length) openWorksheet(m, s.type, s.index);else navigate('#learn/module/' + m.id + '/' + s.type);
      } else renderWorksheet();
      return;
    }
    if (action === 'undoDelete' && app.deletedSheet) {
      xp().drafts[app.deletedSheet.key] = app.deletedSheet.data;
      xp().worksheetMeta[app.deletedSheet.key] = app.deletedSheet.meta;
      s.key = app.deletedSheet.key;
      s.step = app.deletedSheet.meta.step || 0;
      app.deletedSheet = null;
      persist();
      navigate(worksheetURL());
      return;
    }
    if (action === 'seed') {
      bankFor(m).slice(0, 5).forEach((t, i) => {
        const key = 'grid' + i + '_0';
        if (!currentSheet()[key]) currentSheet()[key] = t.term || t.form || t.element || t.text || '';
      });
      touchWorksheet();
      toast('Module words added only to empty grid cells.');
      return;
    }
    if (action === 'addRow' && sheetMeta(sheetKey()).rows < 10) {
      sheetMeta(sheetKey()).rows++;
      touchWorksheet();
      renderWorksheet();
    }
    if (action === 'removeRow' && sheetMeta(sheetKey()).rows > 1) {
      const row = --sheetMeta(sheetKey()).rows,
        data = {};
      for (const key of Object.keys(currentSheet())) if (key.startsWith('grid' + row + '_')) {
        data[key] = currentSheet()[key];
        delete currentSheet()[key];
      }
      app.removedSheetRow = {
        key: sheetKey(),
        row,
        data
      };
      touchWorksheet();
      renderWorksheet();
    }
    if (action === 'undoRow' && app.removedSheetRow?.key === sheetKey()) {
      Object.assign(currentSheet(), app.removedSheetRow.data);
      sheetMeta(sheetKey()).rows = Math.max(sheetMeta(sheetKey()).rows, app.removedSheetRow.row + 1);
      app.removedSheetRow = null;
      touchWorksheet();
      renderWorksheet();
    }
    if (action === 'filled' || action === 'blankExport') sheetExport(action === 'filled');
    if (action === 'save') {
      const d = currentSheet();
      if (!Object.entries(d).some(([k, v]) => !k.startsWith('check_') && k !== 'nextRecall' && String(v).trim())) {
        toast('Add your attempt before saving evidence.');
        return;
      }
      addArtifact('activity', m[s.type][s.index].title, Object.entries(d).map(([k, v]) => k + ': ' + v).join('\n\n'), {
        module: s.module,
        basis: 'self-review'
      });
      toast('Evidence added to your portfolio.');
      updateWorksheetSaveStatus();
    }
  });
  eventHandlers.keydown.push(e => {
    if (app.route === 'worksheet' && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (app.activeWorksheet.step < 3) changeSheetStep(app.activeWorksheet.step + 1);
    }
    if (e.key === 'Escape' && app.route === 'worksheet' && !modal.open) {
      for (const d of main.querySelectorAll('details[open]')) d.open = false;
    }
  });
  document.addEventListener('focusin', e => {
    if (app.route !== 'worksheet' || !e.target.matches('[data-worksheet-field]')) return;
    const r = e.target.getBoundingClientRect();
    if (r.bottom > innerHeight - 155 || r.top < 280) e.target.scrollIntoView({
      block: 'center',
      behavior: 'instant'
    });
  });
  eventHandlers.keydown.push(e => {
    if (!modal.open || !$('#globalSearch') || !e.target.closest('#globalResults')) return;
    if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      const list = $$('#globalResults button,#globalResults a'),
        at = list.indexOf(document.activeElement),
        next = (at + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length;
      list[next]?.focus();
    }
    if (e.key === 'Escape') {
      closeModal();
    }
  });
  eventHandlers.click.push(e => {
    if (e.target.closest('[data-palette=theme]')) {
      app.state.theme = app.state.theme === 'dark' ? 'light' : 'dark';
      applyPreferences();
      persist();
      closeModal();
    }
  });
  eventHandlers.keydown.push(e => {
    if (e.key !== 'Tab' || !$('#globalSearch') || !modal.open || !e.target.closest('.command-palette')) return;
    const groups = [...modal.querySelectorAll('.palette-group')],
      current = e.target.closest('.palette-group'),
      at = groups.indexOf(current),
      next = (at + (e.shiftKey ? -1 : 1) + groups.length) % groups.length,
      target = groups[next]?.querySelector('button,a');
    if (target) {
      e.preventDefault();
      target.focus();
    }
  });
  eventHandlers.click.push(e => {
    if (e.target.closest('[data-action=account]')) accountMenu();
  });
  app.meaningTip = null;
  app.meaningTipTarget = null;
  app.meaningTipTimer = undefined;
  app.meaningLeaveTimer = undefined;
  document.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch') return;
    const el = e.target.closest(meaningTarget);
    if (!el || el.contains(e.relatedTarget)) return;
    clearTimeout(app.meaningLeaveTimer);
    clearTimeout(app.meaningTipTimer);
    app.meaningTipTimer = setTimeout(() => showMeaningTip(el), 250);
  });
  document.addEventListener('pointerout', e => {
    const el = e.target.closest(meaningTarget);
    if (el && !el.contains(e.relatedTarget)) {
      clearTimeout(app.meaningTipTimer);
      if (!e.relatedTarget?.closest('#meaningTooltip')) app.meaningLeaveTimer = setTimeout(hideMeaningTip, 180);
    }
  });
  document.addEventListener('focusin', e => {
    const el = e.target.closest(meaningTarget);
    if (el) showMeaningTip(el);else hideMeaningTip();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && app.meaningTip) {
      hideMeaningTip();
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
  window.addEventListener('scroll', hideMeaningTip, true);
  window.addEventListener('resize', hideMeaningTip);
  window.addEventListener('hashchange', hideMeaningTip);
  eventHandlers.click.push(e => {
    const b = e.target.closest('[data-word-help]');
    if (b) {
      if (b.dataset.wordHelp === 'part') pinPartMeaning(b.dataset.id, +b.dataset.index);else if (b.dataset.wordHelp === 'clear') {
        const index = $('#partInline')?.dataset.index;
        $('#partInline').hidden = true;
        $$('[data-word-help="part"]').forEach(x => x.setAttribute('aria-pressed', 'false'));
        $(`[data-word-help="part"][data-index="${index}"]`)?.focus();
        hideMeaningTip();
      }
    }
    const guide = e.target.closest('[data-meaning-guide]');
    if (guide) pinMeaningGuide(guide.dataset.meaningGuide);
  });
  eventHandlers.change.push(e => {
    if (!e.target.matches('[data-assist-language]')) return;
    const value = e.target.value;
    app.v3.profile.assistingLanguage = ASSIST_LANGUAGES[value] ? value : '';
    persist();
    const id = app.activeTerm,
      scroll = modal.scrollTop,
      part = $('#partInline:not([hidden])')?.dataset.index,
      guide = $('#meaningGuideInline:not([hidden])')?.dataset.key;
    if(app.route==='termpage')modernTerm(id);else openTerm(id);
    if (part != null) pinPartMeaning(id, +part);
    if (guide) pinMeaningGuide(guide);
    modal.scrollTop = scroll;
    (app.route==='termpage'?main:modal).querySelector('[data-assist-language]')?.focus({
      preventScroll: true
    });
    toast(assistLanguage() ? ASSIST_LANGUAGES[assistLanguage()].short + ' learning help enabled.' : 'English-only learning help enabled.');
  });
  app.audioSequence = 0;
  app.englishAudioActive = false;
  eventHandlers.change.push(e => {
    const root = e.target.closest('.voice-controls');
    if (!root) return;
    if (e.target.matches('[data-voice-accent]')) {
      root.querySelector('[data-voice-select]').innerHTML = voiceOptions(englishVoices(), '', e.target.value);
    }
    saveLiveVoice(root);
  });
  eventHandlers.input.push(e => {
    if (!e.target.matches('[data-voice-rate]')) return;
    const root = e.target.closest('.voice-controls');
    root.querySelector('output').value = Number(e.target.value).toFixed(2) + '×';
    saveLiveVoice(root);
  });
  eventHandlers.click.push(e => {
    const root = e.target.closest('.voice-controls');
    if (!root) return;
    const play = e.target.closest('[data-voice-play]');
    if (play) {
      const t = termBy(root.dataset.voiceTerm),
        kind = play.dataset.voicePlay;
      listenEnglish(kind === 'term' && t ? t.term : kind === 'definition' && t ? t.definition : 'Welcome to MedLex. Listen, repeat, and connect each word with its meaning.', voicePreferencesFrom(root));
    }
    if (e.target.closest('[data-voice-stop]')) stopEnglishAudio('Audio stopped.', true);
    if (e.target.closest('[data-voice-refresh]')) refreshVoiceControls();
    const speed = e.target.closest('[data-voice-speed]');
    if (speed) {
      const input = root.querySelector('[data-voice-rate]');
      input.value = speed.dataset.voiceSpeed;
      root.querySelector('output').value = Number(input.value).toFixed(2) + '×';
      saveLiveVoice(root);
    }
  });
  if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', refreshVoiceControls);
  window.addEventListener('pagehide', () => stopEnglishAudio());
  window.addEventListener('hashchange', () => stopEnglishAudio());
  installVisualSymbols();
  for (const [code, strings] of Object.entries(EXTRA_LANGUAGE_GUIDES)) {
    ['prefix', 'root', 'suffix', 'vowel', 'precise', 'everyday', 'fictional'].forEach((key, i) => {
      MEANING_GUIDES[key][ASSIST_LANGUAGES[code].index + 2] = strings[i];
    });
  }
  for (const [type, handlers] of Object.entries(eventHandlers)) document.addEventListener(type, e => {
    if(type==='keydown'&&document.querySelector('#medlexWelcomeGuide[open],#infographicViewer[open]'))return;
    if (type === 'click' && guardSessionExit(e)) return;
    if (type === 'click' && e.target.closest('#globalResults button,#globalResults a')) {
      const q = $('#globalSearch')?.value.trim();
      if (q) {
        app.v3.search.recent = [q, ...app.v3.search.recent.filter(x => x !== q)].slice(0, 8);
        persist();
      }
    }
    for (const handler of handlers) handler(e);
  });
  window.addEventListener('pagehide', () => {
    try {
      saveV3();
    } catch {}
  });
  initializeV3();
}
