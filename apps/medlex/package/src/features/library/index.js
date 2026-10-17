import { renderPage } from "../../ui/page.js";
// Phase 1: canonical features/library/index implementation.
import { INLINE_ASSETS, MODULES } from '../../data/config.js';
import { CHAPTERS, TERMS } from '../../data/index.js';
import { termVisualIcon, termVisualPanel } from './visuals.js';
import { assistingLanguageField, definitionTranslationLink, meaningGuideHTML, meaningLabel } from '../settings/language.js';
import { voiceControls, voiceSpeakerIcon } from '../settings/voice.js';
import { termEnrichment } from '../studios/index.js';
import { app } from '../../state/runtime.js';
import { chapter, termBy, termCount } from '../../state/selectors.js';
import { header, showModal, systemCard, termCard, renderKeyedList } from '../../ui/components/index.js';
import { $, $$, esc, main, modalContent } from '../../ui/dom.js';
import { uiIcon } from '../../ui/guidance.js';
export function systems() {
  renderPage(header('EXPLORE THE ATLAS', 'A body of understanding.', 'Follow the reference book’s 24-chapter structure. Each chapter opens a concise focus guide and the selected terms available in this companion.') + `<div class="system-grid">${[9, 10, 12].map(systemCard).join('')}</div>` + Array.from({
    length: 5
  }, (_, i) => i + 1).map(m => `<h2 class="module-heading"><span>MODULE ${m}</span>${MODULES[m]}</h2><div class="chapter-grid">${CHAPTERS.filter(c => c.module === m).map(c => `<button class="chapter-card" data-action="chapter" data-id="${c.id}"><span class="chapter-no">${String(c.id).padStart(2, '0')}</span><span class="arrow">↗</span><h3>${esc(c.name)}</h3><p>${c.id < 3 ? 'Foundation learning path' : termCount(c.id) + ' selected terms'} · Book p. ${c.page}</p></button>`).join('')}</div>`).join(''), {
    overview: false
  });
}
export function library() {
  app.libraryChapter = app.params.get('chapter') || 'all';
  app.libraryFilter = app.params.get('filter') || 'all';
  app.libraryQuery = '';
  renderPage(header('YOUR CLINICAL VOCABULARY', 'A little clarity, on demand.', 'Search selected terms, explore their word anatomy, and connect precise language to everyday understanding.') + `<div class="toolbar"><label class="input-wrap"><span aria-hidden="true">⌕</span><input id="librarySearch" aria-label="Search medical terms" placeholder="Search a term, meaning or spelling variant…" autocomplete="off"></label><select id="chapterFilter" class="select" aria-label="Filter by chapter"><option value="all">All chapters</option>${CHAPTERS.filter(c => termCount(c.id)).map(c => `<option value="${c.id}" ${String(c.id) === app.libraryChapter ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div><div class="pill-row" role="group" aria-label="Collection filter">${[['all', 'All terms'], ['saved', 'Saved words'], ['learned', 'Familiar terms'], ['new', 'Still to explore']].map(([id, label]) => `<button class="filter-pill ${app.libraryFilter === id ? 'active' : ''}" data-action="libfilter" data-id="${id}" aria-pressed="${app.libraryFilter === id}">${label}</button>`).join('')}</div><p class="results-label" id="resultsCount" aria-live="polite"></p><div class="term-grid" id="termResults"></div><p class="access-note">Selected companion vocabulary, not a complete transcription of the book. Common AU/NZ and US spelling variants are searchable.</p>`, {
    overview: true
  });
  filterLibrary();
}
export function matches(t, q) {
  return [t.term, t.definition, t.plain, ...t.aliases, ...t.parts.map(p => p.meaning)].join(' ').toLowerCase().includes(q.toLowerCase().trim());
}
export function openTerm(id) {
  app.activeTerm = id;
  showModal(termDetailMarkup(id), "EXPLORE & UNDERSTAND");
}
export function openChapter(id) {
  const c = chapter(id);
  if (!c) return;
  const terms = TERMS.filter(t => t.chapter === c.id);
  const lessonMode = id < 3;
  showModal(`<p style="margin-bottom:20px"><a class="btn primary" href="#module?id=ch${id}">Open full teaching module →</a></p>` + `<h2 id="modalTitle" class="modal-title">${esc(c.name)}</h2><p class="modal-subtitle">Module ${c.module} · ${esc(MODULES[c.module])} · Book Chapter ${c.id}, p. ${c.page}</p>${c.image ? `<div class="wide-system"><img src="${INLINE_ASSETS[c.image]}" alt="Illustrative ${c.image} anatomy"><div><span class="eyebrow muted">THE CHAPTER IN FOCUS</span><h3 style="font-family:Editorial,serif;font-size:26px;margin:10px 0">${c.tagline}</h3><p>${c.focus}</p></div></div>` : `<div class="meaning-box"><span class="eyebrow">THE CHAPTER IN FOCUS</span><p>${c.focus}</p></div>`}${lessonMode ? `<p class="modal-subtitle">Build a foundation with seven original micro-lessons informed by Chapters 1 and 2.</p><button class="btn primary" data-action="lessons">Open the foundation path →</button>` : `<div class="toggle-row"><span class="eyebrow muted">${terms.length} SELECTED COMPANION TERMS</span><button class="text-button" data-action="chapterlibrary" data-id="${id}">Open in term library ↗</button></div><div class="term-grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">${terms.map(termCard).join('')}</div>`}<div class="source-line">This guide follows the book’s chapter structure. Selected definitions and examples are original learning summaries; the full chapter contains additional content.</div>`, 'EXPLORE CHAPTER ' + String(id).padStart(2, '0'));
}
export function filterLibrary() {
  const terms = TERMS.filter(t => (app.libraryChapter === 'all' || t.chapter === Number(app.libraryChapter)) && matches(t, app.libraryQuery) && (app.libraryFilter === 'saved' ? app.state.saved.includes(t.id) : app.libraryFilter === 'learned' ? app.state.learned.includes(t.id) : app.libraryFilter === 'new' ? !app.state.learned.includes(t.id) : true)).sort((a, b) => a.term.localeCompare(b.term));
  $('#resultsCount').textContent = `${terms.length} terms found · showing ${Math.min(app.globalLimit, terms.length)}`;
  terms.length ? renderKeyedList($('#termResults'), terms.slice(0, app.globalLimit).map(t => ({
    key: t.id,
    html: termCard(t)
  })), terms.length > app.globalLimit ? '<button class="btn library-more" data-course="globalmore">Show 60 more terms ↓</button>' : '') : renderKeyedList($('#termResults'), [], `<div class="empty"><h3>${app.libraryFilter === 'saved' ? 'Your collection starts with a word.' : 'No terms found.'}</h3><p>Try another spelling or a different chapter.</p><button class="btn" data-action="clearlib">Explore all terms →</button></div>`);
  $$('button[data-action=libfilter]').forEach(b => {
    b.classList.toggle('active', b.dataset.id === app.libraryFilter);
    b.setAttribute('aria-pressed', b.dataset.id === app.libraryFilter);
  });
}
export function termDetailMarkup(id) {
  const t = termBy(id);
  if (!t) return;
  app.activeTerm = id;
  const c = chapter(t.chapter),
    related = TERMS.filter(x => x.chapter === t.chapter && x.id !== t.id).slice(0, 4);
  return `<article class="term-detail"><header class="term-detail-header"><div><span class="term-header-symbol" aria-hidden="true">${termVisualIcon(t)}</span><h2 id="modalTitle" class="modal-title">${esc(t.term)}</h2><p class="modal-subtitle">${esc(c.name)}${t.aliases.length ? ' · Also searchable as ' + esc(t.aliases.join(', ')) : ''}</p></div><div class="term-actions"><button class="btn small" data-action="save" data-id="${id}" aria-pressed="${app.state.saved.includes(id)}">${app.state.saved.includes(id) ? '◆ Saved' : '◇ Save word'}</button><button class="btn small" data-action="speak" data-id="${id}">${voiceSpeakerIcon()} Hear the word</button><button class="btn small" data-action="learned" data-id="${id}" aria-pressed="${app.state.learned.includes(id)}">${app.state.learned.includes(id) ? '✓ Marked familiar' : '✓ Mark as familiar'}</button></div></header><details class="term-voice-options"><summary>Voice & listening options</summary>${voiceControls('term', id, true)}</details>
 <section class="term-learning-help" aria-label="Meaning and language help"><div class="hover-guide">${uiIcon('help')}<div><strong>A little help as you explore</strong><p>Hover or focus a word part for meaning. Click or tap to keep it open. Use the question-mark labels for a short guide.</p></div></div><div class="term-language">${assistingLanguageField(true)}</div></section>
 <div id="meaningGuideInline" class="pinned-meaning guide-inline" hidden role="status"></div>
 <section class="meaning-box term-definition">${meaningLabel('precise')}<p lang="en">${esc(t.definition)}</p>${definitionTranslationLink(t)}</section>
 ${termVisualPanel(t)}
 <div class="term-detail-grid"><section class="term-anatomy"><h3 class="eyebrow muted">${t.parts.length ? 'WORD ANATOMY' : 'A NOTE ON THIS TERM'}</h3>${t.parts.length ? `<div class="term-parts">${t.parts.map((p, i) => `<button type="button" class="term-part ${p.type}" data-word-help="part" data-id="${id}" data-index="${i}" aria-controls="partInline" aria-pressed="false"><strong>${esc(p.text)}</strong><small>${p.type === 'vowel' ? 'combining vowel' : p.type}<span class="part-hint" aria-hidden="true">${uiIcon('help')}</span></small></button>`).join('')}</div><div id="partInline" class="pinned-meaning" hidden role="status"></div><p class="language-note">Explore each part, then check how the complete word is used.</p>` : '<p class="access-note">Learn this as a complete clinical concept. Not every term benefits from a simple prefix–root–suffix split.</p>'}${meaningGuideHTML()}</section>
 <section class="term-context" aria-label="Meaning in context">${t.plain !== t.definition ? `<div class="context-box">${meaningLabel('everyday')}<p lang="en">${esc(t.plain)}</p></div>` : ''}${t.example && !/^In a fictional teaching glossary/.test(t.example) ? `<div class="context-box">${meaningLabel('fictional', 'In a clinical note · fictional example')}<p lang="en">“${esc(t.example)}”</p></div>` : ''}${t.note && !/^Concise companion definition/.test(t.note) ? `<div class="callout">${esc(t.note)}</div>` : ''}${related.length ? `<div class="term-connections"><h3 class="eyebrow muted">MAKE ANOTHER CONNECTION</h3><div class="related">${related.map(x => `<button class="filter-pill" data-action="term" data-id="${x.id}">${esc(x.term)} ↗</button>`).join('')}</div></div>` : ''}</section></div>
 <div class="source-line">Book alignment: Walker, Wood & Nicol, <em>Mastering Medical Terminology</em>, 3rd ed. (2021), Chapter ${c.id}: ${esc(c.name)} (chapter begins p. ${c.page}).<br>Original, concise companion explanation. <button class="text-button" data-action="sources">View sources & learning notes ↗</button></div>${termEnrichment(id)}</article>`;
}
