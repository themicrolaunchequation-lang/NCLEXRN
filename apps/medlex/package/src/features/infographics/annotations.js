import catalog from './catalog.json';

const IDS = new Set(catalog.map(item => item.id));
const KEY = 'medlex-infographic-annotations-v1';
const LIMITS = {strokes: 120, points: 600, notes: 30, text: 1400};
const clone = value => JSON.parse(JSON.stringify(value));
const clamp = value => Math.round(Math.max(0, Math.min(1, value)) * 10000) / 10000;
const validColor = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
const fresh = id => ({id, strokes: [], notes: [], updatedAt: Date.now()});
export const annotationRecords = new Map();
export const INFO_ANNOTATION = {tool: 'pan', color: '#1659c7', size: 4, noteColor: '#fff0a6', topic: null};
let database, loading, writeQueue = Promise.resolve(), storageFailed = false, controller;

function openAnnotationDB() {
  if (!globalThis.indexedDB) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MedLex-Infographic-Annotations', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('boards', {keyPath: 'id'});
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(Error('Annotation storage is blocked.'));
  });
}

export function validateAnnotationRecord(record) {
  if (!record || !IDS.has(record.id) || !Array.isArray(record.strokes) || !Array.isArray(record.notes) || record.strokes.length > LIMITS.strokes || record.notes.length > LIMITS.notes) throw Error('Unsupported annotation board.');
  const strokes = record.strokes.map(stroke => {
    if (!stroke || !['pen', 'marker', 'highlighter'].includes(stroke.tool) || !validColor(stroke.color) || !Number.isFinite(stroke.width) || stroke.width < .0005 || stroke.width > .08 || !Array.isArray(stroke.points) || !stroke.points.length || stroke.points.length > LIMITS.points) throw Error('Unsupported drawing in annotation backup.');
    const points = stroke.points.map(point => {
      if (!Array.isArray(point) || point.length !== 2 || point.some(n => !Number.isFinite(n) || n < 0 || n > 1)) throw Error('Invalid drawing coordinates.');
      return [...point];
    });
    return {tool: stroke.tool, color: stroke.color, width: stroke.width, points};
  });
  const notes = record.notes.map(note => {
    if (!note || typeof note.id !== 'string' || !/^[\w-]{1,80}$/.test(note.id) || !Number.isFinite(note.x) || !Number.isFinite(note.y) || note.x < 0 || note.x > 1 || note.y < 0 || note.y > 1 || !validColor(note.color) || typeof note.text !== 'string' || note.text.length > LIMITS.text) throw Error('Unsupported sticky note in annotation backup.');
    return {id: note.id, x: note.x, y: note.y, color: note.color, text: note.text};
  });
  if (new Set(notes.map(note => note.id)).size !== notes.length) throw Error('Duplicate sticky notes.');
  return {id: record.id, strokes, notes, updatedAt: Number.isFinite(record.updatedAt) ? record.updatedAt : Date.now()};
}

export function validateAnnotationPack(pack) {
  if (pack?.app !== 'MedLexInfographicAnnotations' || pack.version !== 1 || !Array.isArray(pack.boards) || pack.boards.length > catalog.length) throw Error('Choose a supported MedLex notes backup.');
  const rows = pack.boards.map(validateAnnotationRecord);
  if (new Set(rows.map(row => row.id)).size !== rows.length) throw Error('Duplicate poster IDs in notes backup.');
  return rows;
}

export async function loadInfographicAnnotations() {
  return loading ||= (async () => {
    let rows = [];
    try {
      database = await openAnnotationDB();
      if (database) rows = await new Promise((resolve, reject) => {
        const request = database.transaction('boards').objectStore('boards').getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      else rows = JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      database = null;
      try { rows = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { rows = []; }
    }
    for (const row of Array.isArray(rows) ? rows : []) {
      try { const valid = validateAnnotationRecord(row); if (!annotationRecords.has(valid.id)) annotationRecords.set(valid.id, valid); } catch {}
    }
    return annotationRecords;
  })();
}

function setSaveStatus(message) {
  const element = document.getElementById('infoAnnotationStatus');
  if (element) { element.textContent = message; element.dataset.unsaved = storageFailed ? 'true' : 'false'; }
}

export function saveAnnotationRecord(record) {
  const row = validateAnnotationRecord(record);
  annotationRecords.set(row.id, row);
  setSaveStatus('Saving…');
  // Ordered snapshots prevent an older edit overwriting a newer one.
  writeQueue = writeQueue.catch(() => {}).then(async () => {
    await loadInfographicAnnotations();
    if (database) await new Promise((resolve, reject) => {
      const tx = database.transaction('boards', 'readwrite');
      tx.objectStore('boards').put(row);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || Error('Save interrupted.'));
    });
    else localStorage.setItem(KEY, JSON.stringify([...annotationRecords.values()]));
    storageFailed = false;
    setSaveStatus('Saved on this device');
    return true;
  }).catch(() => {
    storageFailed = true;
    setSaveStatus('Not saved · export notes');
    return false;
  });
  return writeQueue;
}

export async function flushInfographicAnnotations() { return writeQueue; }
export function infographicAnnotationPack() {
  return {app: 'MedLexInfographicAnnotations', version: 1, exportedAt: new Date().toISOString(), boards: [...annotationRecords.values()].map(clone)};
}
export async function restoreInfographicAnnotations(rows) {
  for (const row of rows) {
    if (!await saveAnnotationRecord(row)) throw Error('Notes are available this session, but storage could not save them. Export a notes backup.');
  }
  controller?.select(INFO_ANNOTATION.topic);
}

function paintStroke(context, stroke, width, height) {
  context.save();
  context.strokeStyle = context.fillStyle = stroke.color;
  context.globalAlpha = stroke.tool === 'highlighter' ? .28 : stroke.tool === 'marker' ? .68 : 1;
  context.lineWidth = stroke.width * width;
  context.lineJoin = context.lineCap = 'round';
  context.beginPath();
  const first = stroke.points[0];
  if (stroke.points.length === 1) {
    context.arc(first[0] * width, first[1] * height, context.lineWidth / 2, 0, Math.PI * 2);
    context.fill();
  } else {
    context.moveTo(first[0] * width, first[1] * height);
    for (const point of stroke.points.slice(1)) context.lineTo(point[0] * width, point[1] * height);
    context.stroke();
  }
  context.restore();
}

export function installAnnotationCanvas(dialog) {
  const canvas = dialog.querySelector('#infoInkCanvas'), layer = dialog.querySelector('#infoNotesLayer');
  const sheet = dialog.querySelector('#infoSheet'), stage = dialog.querySelector('#infoImageStage');
  const image = dialog.querySelector('#infoFullImage');
  let record = fresh(catalog[0].id), undo = [], redo = [], stroke, drag, activeNote = null, textEdit = null;
  let context;
  try { context = canvas.getContext('2d'); } catch {}
  const colors = {pen: '#1659c7', marker: '#be3c5b', highlighter: '#f2ca32'};
  const currentRect = () => {
    const rect = sheet.getBoundingClientRect();
    return {left: rect.left, top: rect.top, width: rect.width || 1086, height: rect.height || 1448};
  };
  const point = event => {
    const rect = currentRect();
    return [clamp((event.clientX - rect.left) / rect.width), clamp((event.clientY - rect.top) / rect.height)];
  };
  const history = () => { undo.push(clone(record)); if (undo.length > 25) undo.shift(); redo = []; };
  const save = () => { record.updatedAt = Date.now(); saveAnnotationRecord(record); };
  const updateButtons = () => {
    dialog.querySelector('[data-info=undoInk]').disabled = !undo.length;
    dialog.querySelector('[data-info=redoInk]').disabled = !redo.length;
    dialog.querySelector('[data-info=clearInk]').disabled = !record.strokes.length && !record.notes.length;
    for (const button of dialog.querySelectorAll('[data-annotation-tool]')) button.setAttribute('aria-pressed', String(button.dataset.annotationTool === INFO_ANNOTATION.tool));
    stage.dataset.tool = INFO_ANNOTATION.tool;
    canvas.style.pointerEvents = ['pen', 'marker', 'highlighter'].includes(INFO_ANNOTATION.tool) ? 'auto' : 'none';
  };
  function renderInk() {
    if (!context) return;
    const ratio = (image.naturalHeight || 1448) / (image.naturalWidth || 1086);
    const width = Math.min(1600, image.naturalWidth || 1086), height = Math.round(width * ratio);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    context.clearRect(0, 0, width, height);
    for (const item of record.strokes) paintStroke(context, item, width, height);
    if (stroke) paintStroke(context, stroke, width, height);
  }
  function positionNote(element, note) {
    element.style.left = 'clamp(4px,' + (Math.min(.78, note.x) * 100) + '%,calc(100% - var(--info-note-width) - 4px))';
    element.style.top = 'clamp(4px,' + (Math.min(.9, note.y) * 100) + '%,calc(100% - 168px))';
    element.style.backgroundColor = note.color;
  }
  function renderNotes(focusID) {
    layer.replaceChildren();
    record.notes.forEach((note, index) => {
      const element = document.createElement('section');
      element.className = 'info-sticky-note'; element.dataset.noteId = note.id;
      element.classList.toggle('selected', note.id === activeNote);
      element.setAttribute('aria-label', 'Sticky note ' + (index + 1));
      positionNote(element, note);
      const header = document.createElement('div'); header.className = 'info-note-header';
      const handle = document.createElement('button'); handle.type = 'button'; handle.className = 'info-note-handle';
      handle.dataset.noteMove = note.id; handle.textContent = '⠿ Note ' + (index + 1);
      handle.setAttribute('aria-label', 'Move note ' + (index + 1) + '. Drag or use arrow keys.');
      const remove = document.createElement('button'); remove.type = 'button'; remove.dataset.noteDelete = note.id;
      remove.textContent = '×'; remove.setAttribute('aria-label', 'Delete note ' + (index + 1));
      const text = document.createElement('textarea'); text.value = note.text; text.maxLength = LIMITS.text;
      text.placeholder = 'Your thought, question or memory cue…'; text.dataset.noteText = note.id;
      text.setAttribute('aria-label', 'Text for sticky note ' + (index + 1)); text.spellcheck = true;
      header.append(handle, remove); element.append(header, text); layer.append(element);
      if (note.id === focusID) text.focus({preventScroll: true});
    });
  }
  function refresh(focusID) { renderInk(); renderNotes(focusID); updateButtons(); }
  function commit(mutator, focusID) { textEdit = null; history(); mutator(); save(); refresh(focusID); }
  function selectNote(id) {
    activeNote = id;
    for (const el of layer.children) el.classList.toggle('selected', el.dataset.noteId === id);
    const note = record.notes.find(item => item.id === id);
    if (note) { INFO_ANNOTATION.noteColor = note.color; dialog.querySelector('#infoNoteColor').value = note.color; }
  }
  function addNote(x, y) {
    if (record.notes.length >= LIMITS.notes) { setSaveStatus('30 notes per poster · delete a note first'); return; }
    const id = 'note-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    activeNote = id;
    commit(() => record.notes.push({id, x: Math.min(.78, clamp(x)), y: Math.min(.9, clamp(y)), color: INFO_ANNOTATION.noteColor, text: ''}), id);
  }
  function cancelPointer() { stroke = null; drag = null; renderInk(); }
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.isPrimary === false || !['pen', 'marker', 'highlighter'].includes(INFO_ANNOTATION.tool)) return;
    if (!context) { setSaveStatus('Drawing unavailable · use sticky notes'); return; }
    if (record.strokes.length >= LIMITS.strokes) { setSaveStatus('Drawing limit reached · undo or clear this poster'); return; }
    event.preventDefault(); event.stopPropagation(); stage.focus({preventScroll: true}); activeNote = null; textEdit = null;
    const factor = INFO_ANNOTATION.tool === 'highlighter' ? 7 : INFO_ANNOTATION.tool === 'marker' ? 3 : 1;
    stroke = {tool: INFO_ANNOTATION.tool, color: INFO_ANNOTATION.color, width: INFO_ANNOTATION.size * factor / 1000, points: [point(event)], pointer: event.pointerId};
    canvas.setPointerCapture?.(event.pointerId); renderInk();
  });
  canvas.addEventListener('pointermove', event => {
    if (!stroke || event.pointerId !== stroke.pointer) return;
    event.preventDefault(); event.stopPropagation();
    for (const part of event.getCoalescedEvents?.() || [event]) {
      const next = point(part), previous = stroke.points.at(-1);
      if (Math.hypot(next[0] - previous[0], next[1] - previous[1]) > .0003) {
        if (stroke.points.length >= LIMITS.points) stroke.points = stroke.points.filter((_, index) => index % 2 === 0);
        stroke.points.push(next);
      }
    }
    renderInk();
  });
  canvas.addEventListener('pointerup', event => {
    if (!stroke || event.pointerId !== stroke.pointer) return;
    event.preventDefault(); event.stopPropagation();
    const last = point(event), previous = stroke.points.at(-1);
    if (stroke.points.length < LIMITS.points && Math.hypot(last[0] - previous[0], last[1] - previous[1]) > .0003) stroke.points.push(last);
    const {pointer, ...finished} = stroke; stroke = null;
    commit(() => record.strokes.push(finished));
    if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointercancel', cancelPointer);
  canvas.addEventListener('lostpointercapture', () => { if (stroke) cancelPointer(); });
  stage.addEventListener('pointerdown', event => {
    if (INFO_ANNOTATION.tool !== 'note' || event.button !== 0 || event.target.closest('.info-sticky-note')) return;
    event.preventDefault(); addNote(...point(event));
  });
  stage.addEventListener('keydown', event => {
    if (event.target !== stage || INFO_ANNOTATION.tool !== 'note' || event.key !== 'Enter') return;
    event.preventDefault(); event.stopPropagation();
    const rect = currentRect(); addNote(.12, clamp((stage.scrollTop + 65) / rect.height));
  });
  layer.addEventListener('click', event => {
    const remove = event.target.closest('[data-note-delete]');
    if (remove) { commit(() => { record.notes = record.notes.filter(note => note.id !== remove.dataset.noteDelete); activeNote = null; }); stage.focus({preventScroll: true}); }
  });
  layer.addEventListener('focusin', event => {
    const element = event.target.closest('[data-note-id]');
    if (element) selectNote(element.dataset.noteId);
    if (event.target.matches('[data-note-text]')) textEdit = null;
  });
  layer.addEventListener('input', event => {
    const id = event.target.dataset.noteText;
    if (!id) return;
    const note = record.notes.find(item => item.id === id);
    if (!note) return;
    if (textEdit !== id) { history(); textEdit = id; }
    note.text = event.target.value.slice(0, LIMITS.text); save(); updateButtons();
  });
  layer.addEventListener('pointerdown', event => {
    const handle = event.target.closest('[data-note-move]');
    if (!handle || event.button !== 0) return;
    event.preventDefault(); event.stopPropagation(); selectNote(handle.dataset.noteMove);
    const note = record.notes.find(item => item.id === handle.dataset.noteMove);
    drag = {id: note.id, pointer: event.pointerId, x: event.clientX, y: event.clientY, startX: note.x, startY: note.y, before: clone(record), changed: false};
    handle.setPointerCapture?.(event.pointerId);
  });
  layer.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointer) return;
    event.preventDefault();
    const note = record.notes.find(item => item.id === drag.id), rect = currentRect();
    note.x = Math.min(.78, clamp(drag.startX + (event.clientX - drag.x) / rect.width));
    note.y = Math.min(.9, clamp(drag.startY + (event.clientY - drag.y) / rect.height));
    drag.changed = true; positionNote(layer.querySelector('[data-note-id="' + note.id + '"]'), note);
  });
  function endNoteDrag(event) {
    if (!drag || event.pointerId !== drag.pointer) return;
    const previous = drag; drag = null;
    if (event.type === 'pointercancel') { record = previous.before; refresh(); return; }
    if (previous.changed) { undo.push(previous.before); if (undo.length > 25) undo.shift(); redo = []; textEdit = null; save(); updateButtons(); }
    if (event.target.hasPointerCapture?.(event.pointerId)) event.target.releasePointerCapture(event.pointerId);
  }
  layer.addEventListener('pointerup', endNoteDrag); layer.addEventListener('pointercancel', endNoteDrag);
  layer.addEventListener('lostpointercapture', event => { if (drag) endNoteDrag(event); });
  layer.addEventListener('keydown', event => {
    const handle = event.target.closest('[data-note-move]');
    if (!handle || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    const rect = currentRect(), amount = event.shiftKey ? 20 : 4;
    const note = record.notes.find(item => item.id === handle.dataset.noteMove);
    // Keep focus on the same handle rather than replacing the note DOM.
    history();
    note.x = Math.min(.78, clamp(note.x + (event.key === 'ArrowLeft' ? -amount : event.key === 'ArrowRight' ? amount : 0) / rect.width));
    note.y = Math.min(.9, clamp(note.y + (event.key === 'ArrowUp' ? -amount : event.key === 'ArrowDown' ? amount : 0) / rect.height));
    positionNote(handle.closest('[data-note-id]'), note); save(); updateButtons();
  });
  dialog.addEventListener('click', event => {
    const tool = event.target.closest('[data-annotation-tool]');
    if (tool) {
      cancelPointer(); textEdit = null; INFO_ANNOTATION.tool = tool.dataset.annotationTool;
      if (colors[INFO_ANNOTATION.tool]) INFO_ANNOTATION.color = colors[INFO_ANNOTATION.tool];
      dialog.querySelector('#infoInkColor').value = INFO_ANNOTATION.color;
      if (INFO_ANNOTATION.tool === 'note') setSaveStatus('Click the image to add a note · or focus it and press Enter');
      updateButtons();
    }
    const action = event.target.closest('[data-info]')?.dataset.info;
    if (action === 'undoInk' && undo.length) { cancelPointer(); redo.push(clone(record)); record = undo.pop(); textEdit = null; activeNote = null; save(); refresh(); }
    if (action === 'redoInk' && redo.length) { cancelPointer(); undo.push(clone(record)); record = redo.pop(); textEdit = null; activeNote = null; save(); refresh(); }
    if (action === 'clearInk' && (record.strokes.length || record.notes.length)) commit(() => { record.strokes = []; record.notes = []; activeNote = null; });
  });
  dialog.querySelector('#infoInkColor').addEventListener('input', event => {
    INFO_ANNOTATION.color = event.target.value;
    if (colors[INFO_ANNOTATION.tool]) colors[INFO_ANNOTATION.tool] = event.target.value;
  });
  dialog.querySelector('#infoStrokeSize').addEventListener('change', event => { INFO_ANNOTATION.size = Number(event.target.value); });
  dialog.querySelector('#infoNoteColor').addEventListener('change', event => {
    INFO_ANNOTATION.noteColor = event.target.value;
    const note = record.notes.find(item => item.id === activeNote);
    if (note && note.color !== event.target.value) commit(() => { note.color = event.target.value; });
  });
  image.addEventListener('load', renderInk);
  controller = {
    select(id) {
      if (!IDS.has(id)) return;
      cancelPointer(); INFO_ANNOTATION.topic = id;
      record = clone(annotationRecords.get(id) || fresh(id)); undo = []; redo = []; activeNote = null; textEdit = null;
      refresh(); setSaveStatus(storageFailed ? 'Not saved · export notes' : 'Saved on this device');
    },
    cancel: cancelPointer,
    refresh: renderInk
  };
  updateButtons(); return controller;
}
