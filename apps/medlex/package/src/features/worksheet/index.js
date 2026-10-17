import { renderPage } from "../../ui/page.js";
// Phase 1: canonical features/worksheet/index implementation.
import { COURSE_MODULES } from '../../data/index.js';
import { downloadText, persist } from '../learn/legacy-tools.js';
import { printableHTML, xp } from '../studios/index.js';
import { navigate } from '../../router/index.js';
import { app } from '../../state/runtime.js';
import { bankFor, getModule } from '../../state/selectors.js';
import { header } from '../../ui/components/index.js';
import { $, esc, main } from '../../ui/dom.js';
import { activityFields, activityScene, uiIcon, worksheetColumns } from '../../ui/guidance.js';
export const SHEET_STEPS = ['Prepare', 'Work', 'Verify', 'Keep'];
export function activityBase(module, type, index) {
  return 'activity:' + module + ':' + type + ':' + index;
}
export function activityDrafts(module, type, index) {
  const base = activityBase(module, type, index);
  return Object.keys(xp().drafts).filter(k => (k === base || k.startsWith(base + ':sheet:')) && xp().drafts[k] && typeof xp().drafts[k] === 'object');
}
export function latestActivityDraft(module, type, index) {
  const base = activityBase(module, type, index),
    keys = activityDrafts(module, type, index),
    latest = xp().drafts[base + ':latest'];
  return keys.includes(latest) ? latest : keys.sort((a, b) => (xp().worksheetMeta?.[b]?.updated || 0) - (xp().worksheetMeta?.[a]?.updated || 0))[0] || null;
}
export function sheetMeta(key) {
  const all = xp().worksheetMeta || (xp().worksheetMeta = {});
  return all[key] || (all[key] = {
    created: Number(key.split(':sheet:')[1]) || null,
    updated: null,
    step: 0,
    rows: Math.max(5, ...Object.keys(xp().drafts[key] || {}).filter(k => /^grid\d+_/.test(k)).map(k => Number(k.match(/^grid(\d+)/)[1]) + 1))
  });
}
export function relativeTime(at) {
  const mins = Math.max(0, Math.floor((Date.now() - at) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + ' min ago';
  if (mins < 1440) return Math.floor(mins / 60) + ' h ago';
  return Math.floor(mins / 1440) + ' d ago';
}
export function sheetKey() {
  return app.activeWorksheet.key;
}
export function currentSheet() {
  return xp().drafts[sheetKey()] || (xp().drafts[sheetKey()] = {});
}
export function worksheetDrafts() {
  const s = app.activeWorksheet;
  return activityDrafts(s.module, s.type, s.index);
}
export function worksheetURL(s = app.activeWorksheet, step = s.step) {
  return '#learn/module/' + encodeURIComponent(s.module) + '/activity/' + s.type + '/' + s.index + '/sheet/' + encodeURIComponent(s.key) + '?step=' + SHEET_STEPS[step].toLowerCase();
}
export function openWorksheet(m, type, i, fresh = false) {
  if (!m[type]?.[i]) return;
  const base = activityBase(m.id, type, i);
  let key = !fresh && latestActivityDraft(m.id, type, i);
  if (!key) {
    key = base + ':sheet:' + Date.now();
    while (xp().drafts[key]) key += '1';
    xp().drafts[key] = {};
  }
  const meta = sheetMeta(key);
  app.activeWorksheet = {
    module: m.id,
    type,
    index: i,
    key,
    step: meta.step || 0
  };
  xp().drafts[base + ':latest'] = key;
  persist();
  navigate(worksheetURL());
}
export function renderWorksheetRoute(match, query) {
  const module = decodeURIComponent(match[1]),
    type = match[2],
    index = Number(match[3]),
    key = decodeURIComponent(match[4]),
    m = COURSE_MODULES.find(m => m.id === module);
  if (!m || !m[type]?.[index] || !activityDrafts(module, type, index).includes(key)) {
    app.activeWorksheet = null;
    renderPage(header('WORKSHEET', 'Worksheet not on this device', 'This link identifies a locally saved worksheet. Import your progress backup on this device, or return to the activity to start a new sheet.') + '<a class="btn primary" href="#learn">Open the course</a>', {
      overview: false
    });
    return;
  }
  const step = Math.max(0, SHEET_STEPS.map(x => x.toLowerCase()).indexOf(query.get('step'))),
    meta = sheetMeta(key);
  app.activeWorksheet = {
    module,
    type,
    index,
    key,
    step: query.has('step') ? step : meta.step || 0
  };
  meta.step = app.activeWorksheet.step;
  xp().drafts[activityBase(module, type, index) + ':latest'] = key;
  renderWorksheet();
}
export function changeSheetStep(step) {
  app.activeWorksheet.step = Math.max(0, Math.min(3, step));
  sheetMeta(sheetKey()).step = app.activeWorksheet.step;
  persist();
  navigate(worksheetURL());
}
export function worksheetMatrix(a, d = {}, print = false) {
  const cols = worksheetColumns(a),
    rows = Math.min(10, sheetMeta(sheetKey()).rows || 5);
  return `<div class="worksheet-table-wrap"><table class="worksheet-table"><caption>Working grid · ${esc(a.title)}</caption><thead><tr>${cols.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${Array.from({
    length: rows
  }, (_, r) => `<tr>${print ? '' : `<th class="mobile-row-title" scope="row">Row ${r + 1}</th>`}${cols.map((c, k) => {
    const id = 'grid' + r + '_' + k;
    return `<td>${print ? esc(d[id] || ' ') : `<label class="mobile-cell-label" for="sheet_${id}">${esc(c)}</label><textarea id="sheet_${id}" aria-label="Row ${r + 1}, ${esc(c)}" rows="2" maxlength="1500" data-worksheet-field="${id}">${esc(d[id] || '')}</textarea>`}</td>`;
  }).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export function sheetField(key, label, hint, rows = 3) {
  return `<label class="field"><span>${label}</span><small id="hint_${key}">${hint}</small><textarea rows="${rows}" aria-describedby="hint_${key}" maxlength="6000" data-worksheet-field="${key}">${esc(currentSheet()[key] || '')}</textarea></label>`;
}
export function companionMarkup(m){return `<p class="access-note">Original learning records, not an automatic grade. Verify against your course reference when needed.</p><dl>${bankFor(m).slice(0,5).map(t=>`<div><dt>${esc(t.term||t.form||t.element||t.text||'Word element')}</dt><dd>${esc(t.definition||t.meaning||'Refer to the word-element bank.')}</dd></div>`).join('')}</dl><p class="source-line">${esc(m.reference||'Use the module Resources tab.')}</p>`;}
export function worksheetReference(m){return innerWidth<720&&app.route==='worksheet'?`<button class="btn" data-modern="reference">${uiIcon('book')} Open companion records</button>`:`<details class="companion-reference"><summary>${uiIcon('book')} Companion records</summary>${companionMarkup(m)}</details>`;}

export function draftsMenu() {
  return `<details class="sheet-drafts"><summary class="btn">Drafts · ${worksheetDrafts().length}</summary><div class="sheet-drafts-panel"><h2>Your worksheets</h2>${worksheetDrafts().map((key, i) => {
    const meta = sheetMeta(key);
    return `<article><strong>Worksheet ${i + 1}${key === sheetKey() ? ' · current' : ''}</strong><p>${meta.updated ? 'Edited ' + relativeTime(meta.updated) : 'Not edited yet'} · ${SHEET_STEPS[meta.step || 0]}<br>${meta.created ? 'Created ' + new Date(meta.created).toLocaleDateString('en-AU') : 'Creation date unavailable'}</p><div><button class="btn small" data-sheet="openDraft" data-key="${esc(key)}">Open</button><button class="btn small" data-sheet="duplicate" data-key="${esc(key)}">Duplicate</button><button class="text-button" data-sheet="delete" data-key="${esc(key)}">Delete</button></div></article>`;
  }).join('')}<button class="btn" data-sheet="new">New blank worksheet</button><button class="btn" data-modern="versions">Version history · last 10 saves</button>${app.deletedSheet ? '<button class="btn" data-sheet="undoDelete">Undo last deletion</button>' : ''}</div></details>`;
}
export function renderWorksheet() {
  const s = app.activeWorksheet,
    m = getModule(s.module),
    a = m[s.type][s.index],
    d = currentSheet(),
    n = s.step;
  let body = '';
  if (n === 0) body = `${sheetField('words', 'Words / focus', 'Choose a manageable set of words or components. No answers are filled automatically.')}${s.type === 'classroom' ? sheetField('roles', 'Group roles', 'Choose an explainer, a checker and someone to record the evidence.') : sheetField('plan', 'My study plan', 'Where will you work? How long will you spend?')}<button class="btn" data-sheet="seed">${uiIcon('book')} Add five module words to empty grid cells</button>`;
  if (n === 1) body = worksheetMatrix(a, d) + `<div class="term-actions"><button class="btn" data-sheet="addRow" ${sheetMeta(sheetKey()).rows >= 10 ? 'disabled' : ''}>Add row</button><button class="btn" data-sheet="removeRow" ${sheetMeta(sheetKey()).rows <= 1 ? 'disabled' : ''}>Remove last row</button>${app.removedSheetRow?.key === sheetKey() ? '<button class="text-button" data-sheet="undoRow">Undo removal</button>' : ''}<span>${sheetMeta(sheetKey()).rows} of 10 rows</span></div>` + sheetField('attempt', 'My attempt and reasoning', 'Try from memory. Explain the spelling, components, category or wording you chose.', 4);
  if (n === 2) body = `<div class="verify-compare"><section><h3>My attempt</h3><p class="attempt-preview">${esc(d.attempt || 'No written attempt yet. Return to Work whenever you need.')}</p></section><section><h3>Check deliberately</h3>${worksheetReference(m)}</section></div>${sheetField('verification', 'What I checked and corrected', 'Record the reference, the correction and anything still uncertain.', 5)}`;
  if (n === 3) body = `${sheetField('evidence', 'Evidence and next step', 'State the evidence you can bring back and what you will try again.', 4)}<label class="field"><span>Next recall date · optional</span><small>For your own plan; no reminder is sent.</small><input type="date" data-worksheet-field="nextRecall" value="${esc(d.nextRecall || '')}"></label><section class="sheet-checklist"><h3>Before you keep it</h3>${[['attempted', 'I made an attempt before checking.'], ['verified', 'I recorded what I verified or corrected.'], ['questions', 'I noted questions for my educator.']].map(([key, label]) => `<label class="inline-check"><input type="checkbox" data-worksheet-field="check_${key}" ${d['check_' + key] === 'yes' ? 'checked' : ''}>${label}</label>`).join('')}</section><p class="access-note">Written work is not automatically graded. Saving never marks the activity complete; completion is recorded separately on the activity card.</p><div class="term-actions"><button class="btn" data-sheet="filled">Download / print my worksheet</button><details class="export-menu"><summary class="btn">More exports</summary><button class="btn" data-sheet="blankExport">Download blank copy</button></details></div>`;
  renderPage(`<div class="worksheet-page"><a class="back-link" href="#learn/module/${m.id}/${s.type}">← ${esc(m.title)} / ${s.type === 'classroom' ? 'Classroom' : 'Independent study'}</a><header class="worksheet-sticky-head"><div class="sheet-heading"><div><span class="eyebrow">GUIDED WORKSHEET · ${s.type === 'classroom' ? 'CLASSROOM' : 'INDEPENDENT'}</span><h1>${esc(a.title)}</h1></div>${draftsMenu()}</div><nav class="sheet-steps" aria-label="Worksheet steps">${SHEET_STEPS.map((label, i) => `<button type="button" data-sheet="step" data-step="${i}" class="${i<n?'completed':''}" ${n === i ? 'aria-current="step"' : ''}><span>${i + 1}</span>${label}</button>`).join('')}</nav><div id="worksheetStatus" class="worksheet-save" role="status"></div></header><div class="worksheet-page-grid"><aside class="worksheet-task" aria-label="Worksheet task"><details ${innerWidth >= 1100 ? 'open' : ''}><summary>Task and evidence</summary>${activityScene(s.type, s.index)}<h2>Your task</h2><p>${esc(a.task)}</p><h3>Evidence to keep</h3><p>${esc(a.evidence)}</p></details>${n !== 2 ? worksheetReference(m) : ''}</aside><section class="sheet-stage" aria-labelledby="sheetStageTitle"><h2 id="sheetStageTitle">${SHEET_STEPS[n]}</h2>${body}</section></div><footer class="sheet-footer worksheet-sticky-footer"><span>Step ${n + 1} of 4 · ${n === 3 ? 'Keep your work' : 'Ctrl / ⌘ + Enter to continue'}</span><div>${n ? '<button class="btn" data-sheet="previous">Back</button>' : ''}${n < 3 ? `<button class="btn primary" data-sheet="next">Next: ${SHEET_STEPS[n + 1]} ${uiIcon('arrow')}</button>` : '<button class="btn primary" data-sheet="save">Save to portfolio</button><a class="btn" href="#learn/module/' + m.id + '/' + s.type + '">Finish</a>'}</div></footer></div>`, {
    overview: false
  });
  document.title = a.title + ' / ' + m.title + ' / Learn · MedLex';
  $('#crumb').textContent = 'Learn / ' + m.title + ' / ' + SHEET_STEPS[n];
  updateWorksheetSaveStatus();
  growWorksheetFields();
}
export function updateWorksheetSaveStatus() {
  const el = $('#worksheetStatus');
  if (!el) return;
  if (app.storageState.error) {
    el.dataset.state = 'error';
    el.innerHTML = '<strong>Not saved: browser storage is full or blocked.</strong> <button class="text-button" data-sheet="filled">Export now</button>';
  } else if (app.storageState.pending) {
    el.dataset.state = 'pending';
    el.textContent = 'Saving…';
  } else {
    el.dataset.state = 'saved';
    el.textContent = app.storageState.savedAt ? 'Saved · ' + new Date(app.storageState.savedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }) : 'No pending changes';
  }
}
export function growWorksheetFields() {
  for (const el of main.querySelectorAll('[data-worksheet-field]')) if (el.tagName === 'TEXTAREA') {
    el.style.height = 'auto';
    el.style.height = Math.max(80, el.scrollHeight) + 'px';
  }
}
export function touchWorksheet() {
  const meta = sheetMeta(sheetKey());
  meta.updated = Date.now();
  meta.step = app.activeWorksheet.step;
  persist();
}
export function sheetExport(filled) {
  const s = app.activeWorksheet,
    m = getModule(s.module),
    a = m[s.type][s.index],
    d = filled ? currentSheet() : {};
  let body = `<p>${esc(m.title)} · ${s.type === 'classroom' ? 'Classroom' : 'Independent study'}</p><p><b>Task:</b> ${esc(a.task)}</p><p><b>Evidence:</b> ${esc(a.evidence)}</p>` + worksheetMatrix(a, d, true);
  body += activityFields(a, s.type).map(([key, label, hint]) => `<section style="break-inside:avoid"><h2>${label}</h2><p>${hint}</p><div style="white-space:pre-wrap;min-height:90px;border:1px solid #9aa;padding:16px;margin-bottom:24px">${esc(d[key] || '\n\n')}</div></section>`).join('');
  if (d.nextRecall) body += '<p>Next recall: ' + esc(d.nextRecall) + '</p>';
  downloadText('MedLex-' + s.type + '-worksheet.html', printableHTML(a.title, body), 'text/html');
}
export function snapshotCurrentWorksheet(){if(!app.activeWorksheet||app.route!=='worksheet')return;const key=sheetKey(),data=currentSheet(),all=xp().worksheetVersions||(xp().worksheetVersions={}),list=all[key]||(all[key]=[]),meta=sheetMeta(key),serialized=JSON.stringify(data);if(list.at(-1)?.serialized===serialized)return;list.push({at:Date.now(),step:app.activeWorksheet.step,rows:meta.rows,serialized,data:JSON.parse(serialized)});all[key]=list.slice(-10);}
export function worksheetVersions(){return xp().worksheetVersions?.[sheetKey()]||[];}
