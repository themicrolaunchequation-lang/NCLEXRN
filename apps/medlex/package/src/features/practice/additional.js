import{spellingDiff}from'./daily.js';
import {getSearchIndex} from '../search/search-index.js';
import { renderPage } from "../../ui/page.js";
// Phase 1: canonical features/practice/additional implementation.
import { COURSE_MODULES, PREFIXES, SUFFIXES, TERMS } from '../../data/index.js';
import { normalSpelling, persist, shuffle } from '../learn/legacy-tools.js';
import { matches } from '../library/index.js';
import { editDistance, paletteHighlight } from '../search/index.js';
import { speak } from '../settings/voice.js';
import { STUDIO_INFO, recordLearning, startPairs, xp } from '../studios/index.js';
import { worksheetURL } from '../worksheet/index.js';
import { distractors, streak, trackItem } from '../../state/actions.js';
import { app } from '../../state/runtime.js';
import { chapter, pct, termBy } from '../../state/selectors.js';
import { closeModal, header } from '../../ui/components/index.js';
import { $, esc, main, modal } from '../../ui/dom.js';
export function startSpecial(mode) {
  if (mode === 'match') {
    startPairs();
    return;
  }
  app.quiz = null;
  app.flash = null;
  app.exercise = null;
  app.sessionStarted = Date.now();
  const rich = TERMS.filter(t => t.parts.length);
  app.special = {
    mode,
    index: 0,
    score: 0,
    terms: shuffle(rich).slice(0, mode === 'mixed' ? 10 : 5),
    answered: false,
    wrong: [],
    pairs: [],
    matched: []
  };
  if (modal.open) closeModal();
  prepareSpecial();
}
export function drawSpecial() {
  const s = app.special,
    t = s.terms[s.index];
  renderPage(header(s.mode === 'mixed' ? 'TODAY’S SESSION' : 'FOCUSED PRACTICE', {
    spell: 'Listen & spell',
    match: 'Match the meanings',
    mixed: 'One session. Clearer connections.'
  }[s.mode], `Question ${s.index + 1} of ${s.terms.length} · Untimed · Educational terminology practice`) + `<section class="surface practice-panel"><div class="progress-track"><i style="width:${s.index / s.terms.length * 100}%"></i></div>${s.mode === 'spell' ? `<h2>Listen, then write the term.</h2><button class="btn" data-action="speak" data-id="${t.id}">Play term</button><p class="access-note">Audio uses the voices available on your device. If no voice is available, use Meaning check instead.</p><form id="listenSpell" class="profile-form"><label>Your spelling<input name="answer" autocomplete="off" autocapitalize="off" spellcheck="false" required ${s.answered ? 'disabled' : ''}></label><button class="btn primary" ${s.answered ? 'disabled' : ''}>Check spelling</button></form>` : `<h2>${s.mode === 'match' ? 'Choose the matching meaning for “' + esc(t.term) + '”.' : s.index % 2 ? 'Which term means: ' + esc(t.definition) + '?' : 'What does “' + esc(t.term) + '” mean?'}</h2><div class="answer-grid">${s.options.map((x, i) => `<button class="answer ${s.answered ? x.correct ? 'correct' : s.selection === i ? 'incorrect' : '' : ''}" data-v3="specialanswer" data-id="${i}" ${s.answered ? 'disabled' : ''}><span>${String.fromCharCode(65 + i)}</span>${esc(x.label)}</button>`).join('')}</div>`}${s.answered ? `<div class="feedback" role="status">${s.correct ? 'Correct connection.' : 'A useful distinction to revisit.'} ${esc(t.term)}: ${esc(t.definition)}${s.mode==='spell'?`<p class="spelling-diff" aria-label="Spelling comparison">${spellingDiff(s.given,t.term)}</p><p>Accepted: ${[t.term,...t.aliases].map(esc).join(' · ')}</p>`:''}</div><button class="btn primary" data-v3="specialnext">${s.index === s.terms.length - 1 ? 'See summary' : 'Continue'} →</button>` : ''}<div class="term-actions"><a class="btn" href="#practice">Back to practice</a></div></section>`, {
    overview: false
  });
  if (s.mode === 'spell' && !s.answered) speak(t.id);
}
export function prepareSpecial() {
  const s = app.special,
    t = s.terms[s.index],
    opts = [t, ...distractors(t)];
  s.options = shuffle(opts).map(x => ({
    label: s.mode === 'mixed' && s.index % 2 ? x.term : x.definition,
    correct: x.id === t.id
  }));
  drawSpecial();
}
export function answerSpecial(value) {
  const s = app.special;
  if (!s || s.answered) return;
  const t = s.terms[s.index];
  s.answered = true;
  s.selection = +value;
  s.given=String(value);
  s.correct = s.mode === 'spell' ? [t.term, ...t.aliases].some(a => normalSpelling(a) === normalSpelling(value)) : s.options[+value].correct;
  recordLearning(t.id, s.mode === 'spell' ? 'spelling' : 'meaning', s.correct, {
    source: s.mode
  });
  if (s.correct) s.score++;else s.wrong.push(t.id);
  trackItem();
  persist();
  drawSpecial();
}
export function nextSpecial() {
  const s = app.special;
  if (!s?.answered) return;
  if (++s.index < s.terms.length) {
    s.answered = false;
    prepareSpecial();
  } else {
    app.state.history.unshift({
      date: Date.now(),
      mode: s.mode,
      score: s.score,
      total: s.terms.length,
      durationMs: Date.now() - app.sessionStarted
    });
    persist();
    renderPage(header('SESSION COMPLETE', 'A little more confident.', 'Review the connections you want to strengthen next.') + `<section class="surface score"><div class="score-orb">${s.score}/${s.terms.length}</div><h2>${pct(s.score, s.terms.length)}% accuracy</h2><p>${s.score * 10} XP · ${Math.max(1, Math.round((Date.now() - app.sessionStarted) / 60000))} minutes · ${streak()} day streak</p><div class="related">${s.wrong.map(id => `<button class="filter-pill" data-action="term" data-id="${id}">${esc(termBy(id).term)}</button>`).join('')}</div>${s.wrong.length ? '<button class="btn" data-v3="reviewmistakes">Add mistakes to review</button>' : ''}<a href="#today" class="btn primary">Back to Today</a></section>`, {
      overview: false
    });
  }
}
export function searchScore(text, q) {
  text = text.toLowerCase();
  q = q.toLowerCase();
  if (text.startsWith(q)) return 100;
  if (text.includes(q)) return 70;
  let at = 0;
  for (const ch of text) if (ch === q[at]) at++;
  if (at === q.length) return 30;
  if (q.length >= 4 && text.length < 50) {
    const d = editDistance(text, q);
    if (d <= Math.min(2, Math.floor(q.length / 4))) return 25 - d;
  }
  return 0;
}
export function groupedSearch(q) {
  if (!$('#globalResults')) return;
  const clean = q.trim().replace(/^-/, '').toLowerCase();
  app.searchFocus = -1;
  let html = '',
    count = 0;
  function group(title, rows) {
    if (!rows.length) return;
    count += rows.length;
    html += '<section class="palette-group"><h3>' + title + '</h3>' + rows.join('') + '</section>';
  }
  if (!clean && app.v3.search.recent.length) group('Recent searches', app.v3.search.recent.map(x => `<button class="search-result" data-v3="recentsearch" data-id="${esc(x)}">${esc(x)}</button>`));
  const terms = (clean ? getSearchIndex().map(({t,term,aliases,text}) => ({t,s:Math.max(searchScore(term,clean),...aliases.map(x=>searchScore(x,clean)),text.includes(clean)?15:0)})).filter(x => x.s).sort((a, b) => b.s - a.s).map(x => x.t) : TERMS.filter(t => t.parts.length).slice(0, 4)).slice(0, 8);
  group('Terms', terms.map(t => `<button class="search-result" data-action="term" data-id="${t.id}"><span><strong>${paletteHighlight(t.term, clean)}</strong><small>${esc(chapter(t.chapter).name)} · ${esc(t.definition)}</small></span><span aria-hidden="true">→</span></button>`));
  if (clean) {
    group('Word parts', [...PREFIXES, ...SUFFIXES].filter(a => [a.form, a.meaning].some(v => searchScore(v, clean))).slice(0, 4).map(a => `<button class="search-result" data-course="affix" data-id="${a.id}"><strong>${esc(a.form)}</strong><small>${esc(a.meaning)}</small></button>`));
    group('Modules', COURSE_MODULES.filter(m => searchScore(m.title + ' ' + m.subtitle, clean)).slice(0, 4).map(m => `<a class="search-result" href="#learn/module/${m.id}/outline">${esc(m.title)}</a>`));
    group('Activities', COURSE_MODULES.flatMap(m => ['classroom', 'independent'].flatMap(type => m[type].map((a, i) => ({
      m,
      type,
      a,
      i
    })))).filter(x => searchScore(x.a.title, clean)).slice(0, 4).map(x => `<a class="search-result" href="#learn/module/${x.m.id}/${x.type}">${esc(x.a.title)}<small>${esc(x.m.title)}</small></a>`));
    group('Studios', Object.entries(STUDIO_INFO).filter(([k, h]) => searchScore(h.title, clean)).slice(0, 4).map(([k, h]) => `<a class="search-result" href="#studio/${k}">${esc(h.title)}</a>`));
  }
  const latest = Object.keys(xp().drafts).filter(k => /^activity:[^:]+:(classroom|independent):\d+/.test(k) && xp().drafts[k] && typeof xp().drafts[k] === 'object').sort((a, b) => (xp().worksheetMeta?.[b]?.updated || 0) - (xp().worksheetMeta?.[a]?.updated || 0))[0];
  if (latest && (!clean || searchScore('Continue last worksheet', clean))) {
    const match = latest.match(/^activity:([^:]+):(classroom|independent):(\d+)/);
    group('Continue', [`<a class="search-result" href="${worksheetURL({
      module: match[1],
      type: match[2],
      index: Number(match[3]),
      key: latest,
      step: xp().worksheetMeta?.[latest]?.step || 0
    })}">Continue last worksheet</a>`]);
  }
  const chapterQuery = clean.match(/(?:chapter|ch)\s*(\d+)/);
  if (chapterQuery) {
    const m = COURSE_MODULES.find(m => m.chapter === Number(chapterQuery[1]));
    if (m) group('Go to chapter', [`<a class="search-result" href="#learn/module/${m.id}/outline">Chapter ${m.chapter}: ${esc(m.title)}</a>`]);
  }
  const actions = [['Start today’s session', '<button class="search-result" data-v3="special" data-id="mixed">Start today’s session</button>'], ['Settings', '<a class="search-result" href="#settings">Open Settings</a>'], ['Toggle dark mode theme light', '<button class="search-result" data-palette="theme">Toggle dark mode</button>'], ['Export backup progress', '<button class="search-result" data-action="export">Export backup</button>']];
  group('Actions', actions.filter(([name]) => !clean || searchScore(name, clean)).map(x => x[1]));
  if (!count) html = `<p class="empty-state">No results for “${esc(q)}”. Try a word part such as “cardi”.</p>`;
  $('#globalResults').innerHTML = html;
  $('#globalResults').dataset.query=clean;
  $('#globalSearch').removeAttribute('aria-expanded');
  if ($('#paletteCount')) $('#paletteCount').textContent = count + ' search results';
}
