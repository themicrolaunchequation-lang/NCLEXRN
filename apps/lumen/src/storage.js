/*HCA13:BEGIN*/
/* Workspace storage: "Your learning space". Appended to the app module by build-web.mjs after day.js and reader.js (styles: storage.css).
   Shows what takes room (by kind and by source), lets the learner choose where the space lives (this browser, or a folder on this device),
   how much to keep (a limit they set, with warnings at 80% and 100% when adding sources), makes room, asks the browser to protect it, and links backup / restore.
   Nothing here uploads anything. The app's own names it relies on (ve, _e, ye, R, Ro, ge, L, y, A, k, ee) are asserted in build-web.mjs. */
const HCASP = { MB: 1048576, GB: 1073741824, KEY: 'lumen.space.v1', DB: 'lumen.space.v1' };
const HCASpace = { ctx: null, ui: null, last: null, error: null, db: null, dirLoaded: null, dir: { root: null, name: '', perm: 'none' }, prefs: null };
const HCASpacePrev = { ve, _e, R };

/* ---------- preferences (this browser only) ---------- */
function HCASpaceReadPrefs() {
  const d = { mode: 'browser', limit: HCASP.GB, mirror: true, lastBackup: 0 };
  try { const j = JSON.parse(localStorage.getItem(HCASP.KEY) || 'null'); if (j && typeof j === 'object') return { ...d, ...j }; } catch { }
  return d;
}
HCASpace.prefs = HCASpaceReadPrefs();
const HCASpaceEmit = () => window.dispatchEvent(new CustomEvent('hca-space'));
function HCASpaceSet(patch) { HCASpace.prefs = { ...HCASpace.prefs, ...patch }; try { localStorage.setItem(HCASP.KEY, JSON.stringify(HCASpace.prefs)); } catch { } HCASpaceEmit(); }
function HCASpaceUse() { const [, n] = _.useState(0); _.useEffect(() => { const f = () => n(x => x + 1); addEventListener('hca-space', f); return () => removeEventListener('hca-space', f); }, []); return HCASpace; }
function HCASpaceFmt(n) {
  n = Math.max(0, +n || 0);
  if (n >= 0.95 * HCASP.GB) { const g = n / HCASP.GB; return `${g >= 10 ? Math.round(g) : g.toFixed(1).replace(/\.0$/, '')} GB`; }
  if (n >= HCASP.MB) { const m = n / HCASP.MB; return `${m >= 100 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, '')} MB`; }
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return n ? '1 KB' : '0 KB';
}
const HCASpaceIsStub = r => !!r && !r.blob && !(r.images && r.images.some(i => i && i.blob));
const HCASpacePlural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;

/* ---------- a folder on this device (File System Access API; Chrome and Edge) ---------- */
const HCASpaceCanFolder = () => typeof window.showDirectoryPicker === 'function';
function HCASpaceDb() {
  return HCASpace.db ||= new Promise((ok, bad) => {
    if (!globalThis.indexedDB) return bad(Error('IndexedDB is unavailable.'));
    const r = indexedDB.open(HCASP.DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => ok(r.result); r.onerror = () => bad(r.error); r.onblocked = () => bad(Error('IndexedDB is blocked.'));
  }).catch(e => { HCASpace.db = null; throw e; });
}
async function HCASpaceKv(op, key, val) {
  const db = await HCASpaceDb();
  return new Promise((ok, bad) => {
    const tx = db.transaction('kv', op === 'get' ? 'readonly' : 'readwrite'), st = tx.objectStore('kv');
    const rq = op === 'get' ? st.get(key) : op === 'put' ? st.put(val, key) : st.delete(key);
    tx.oncomplete = () => ok(rq.result); tx.onerror = () => bad(tx.error); tx.onabort = () => bad(tx.error || Error('The save was aborted.'));
  });
}
async function HCASpacePerm(ask) {
  const d = HCASpace.dir;
  if (!d.root) { d.perm = 'none'; HCASpaceEmit(); return 'none'; }
  try {
    const o = { mode: 'readwrite' };
    let p = d.root.queryPermission ? await d.root.queryPermission(o) : 'granted';
    if (p !== 'granted' && ask && d.root.requestPermission) p = await d.root.requestPermission(o);
    d.perm = p || 'denied';
  } catch { d.perm = 'denied'; }
  HCASpaceEmit(); return d.perm;
}
function HCASpaceRestoreFolder() {
  return HCASpace.dirLoaded ||= (async () => {
    try { const h = await HCASpaceKv('get', 'folder'); if (h) { HCASpace.dir.root = h; HCASpace.dir.name = h.name || 'your folder'; await HCASpacePerm(false); } } catch { }
    HCASpaceEmit();
  })();
}
async function HCASpaceSub(...path) { let h = HCASpace.dir.root; for (const p of path) h = await h.getDirectoryHandle(p, { create: true }); return h; }
async function HCASpaceWriteFile(dir, name, data) {
  const fh = await dir.getFileHandle(name, { create: true }), w = await fh.createWritable();
  try { await w.write(data); await w.close(); } catch (e) { try { await w.abort(); } catch { } throw e; }
}
const HCASpaceSafe = (s, n = 60) => String(s || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^\.+/, '').slice(0, n).trim() || 'Source';
const HCASpaceTag = id => ` (${String(id).slice(0, 8)})`;
async function HCASpaceFindDir(id) {
  const org = await HCASpaceSub('Lumen', 'originals'), tag = HCASpaceTag(id);
  for await (const [name, h] of org.entries()) if (h.kind === 'directory' && name.endsWith(tag)) return h;
  return null;
}
async function HCASpacePick() {
  if (!HCASpaceCanFolder()) return { ok: false, why: 'unsupported' };
  let h;
  try { h = await window.showDirectoryPicker({ id: 'lumen-space', mode: 'readwrite' }); }
  catch (e) { return { ok: false, why: e && e.name === 'AbortError' ? 'cancel' : 'error' }; }
  const d = HCASpace.dir; d.root = h; d.name = h.name || 'your folder';
  if (await HCASpacePerm(true) !== 'granted') return { ok: false, why: 'denied' };
  try { await HCASpaceSub('Lumen', 'originals'); await HCASpaceSub('Lumen', 'backups'); } catch { return { ok: false, why: 'write' }; }
  let kept = true; try { await HCASpaceKv('put', 'folder', h); } catch { kept = false; }
  HCASpaceSet({ mode: 'folder' });
  return { ok: true, kept };
}
async function HCASpaceWriteOriginal(id, rec, title) {
  const files = rec.blob ? [[rec.name || `${title || 'source'}.pdf`, rec.blob]] : (rec.images || []).filter(i => i && i.blob).map((im, i) => [`${String(i + 1).padStart(3, '0')} ${im.name || 'image'}`, im.blob]);
  if (!files.length) return null;
  const want = files.reduce((a, f) => a + (f[1].size || 0), 0);
  let dir = await HCASpaceFindDir(id);
  if (dir) { let have = 0; for await (const [n, h] of dir.entries()) if (h.kind === 'file' && n !== 'source.json') have += (await h.getFile()).size; if (have === want) return dir.name; }
  const book = HCASpace.ctx?.state.books.find(b => b.id === id), label = book?.title || title || String(rec.name || files[0][0]).replace(/\.[^.]+$/, '');
  dir ||= await (await HCASpaceSub('Lumen', 'originals')).getDirectoryHandle(HCASpaceSafe(label) + HCASpaceTag(id), { create: true });
  for (const [n, b] of files) await HCASpaceWriteFile(dir, HCASpaceSafe(n, 120), b);
  await HCASpaceWriteFile(dir, 'source.json', JSON.stringify({ id, title: label, kind: rec.type, pages: book?.count || files.length, savedAt: new Date().toISOString() }, null, 1));
  return dir.name;
}
async function HCASpaceFromFolder(id, stub) {
  const d = HCASpace.dir;
  if (!d.root) await HCASpaceRestoreFolder();
  if (d.perm !== 'granted') await HCASpacePerm(false);
  if (d.perm !== 'granted') return null;
  try {
    const dir = await HCASpaceFindDir(id); if (!dir) return null;
    const got = []; for await (const [n, h] of dir.entries()) if (h.kind === 'file' && n !== 'source.json') got.push([n, await h.getFile()]);
    if (!got.length) return null;
    got.sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
    const rec = { type: stub.type, name: stub.name, transcripts: stub.transcripts || {}, hcaFromFolder: true, hcaFolder: stub.hcaFolder };
    if (stub.type === 'images') rec.images = got.map(([n, f]) => ({ name: n.replace(/^\d{3} /, ''), blob: f })); else rec.blob = got[0][1];
    return rec;
  } catch { return null; }
}

/* ---------- the app's file store, wrapped: reads fall back to the folder, writes report "no room" plainly, mirrors copy new originals ---------- */
ve = async function HCASpaceVe(id) {
  const rec = await HCASpacePrev.ve(id);
  if (rec && rec.hcaFolder && HCASpaceIsStub(rec)) { const full = await HCASpaceFromFolder(id, rec); if (full) { L.set(id, full); return full; } }
  return rec;
};
_e = async function HCASpaceE(id, rec) {
  if (rec && rec.hcaFromFolder) { // read from the folder for this session: keep only the light record in the browser
    const { blob, images, hcaFromFolder, ...rest } = rec, ok = await HCASpacePut(id, rest); L.set(id, rec); return ok;
  }
  const ok = await HCASpacePut(id, rec);
  if (ok) HCASpaceAfterPut(id, rec);
  return ok;
};
async function HCASpacePut(id, rec) {
  L.set(id, rec);
  try {
    const db = await ge();
    await new Promise((ok, bad) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put(rec, id); tx.oncomplete = ok; tx.onerror = () => bad(tx.error); tx.onabort = () => bad(tx.error || Error('The save was aborted.')); });
    return true;
  } catch (err) { HCASpaceNoteError(err); return false; }
}
function HCASpaceNoteError(err) {
  const quota = !!err && (err.name === 'QuotaExceededError' || /quota/i.test(String(err.message || '')));
  HCASpace.error = { quota, at: Date.now() };
  if (quota) window.dispatchEvent(new CustomEvent('hca-space-full'));
  HCASpaceEmit();
}
function HCASpaceAfterPut(id, rec) {
  const d = HCASpace.dir, p = HCASpace.prefs;
  if (p.mode !== 'folder' || !p.mirror || d.perm !== 'granted' || HCASpaceIsStub(rec)) return;
  HCASpaceWriteOriginal(id, rec).then(() => HCASpaceEmit()).catch(() => HCASpace.ctx?.toast('Lumen could not copy that file into your folder. It is still kept in this browser.', 'warning'));
}
R = function HCASpaceR(name, data, type) {
  if (!/^Lumen-workspace-.*\.json$/.test(name)) return HCASpacePrev.R(name, data, type);
  const blob = data instanceof Blob ? data : new Blob([data], { type: type || 'application/json' }), d = HCASpace.dir;
  HCASpaceSet({ lastBackup: Date.now() });
  if (HCASpace.prefs.mode === 'folder' && d.root && d.perm === 'granted') {
    HCASpaceSub('Lumen', 'backups').then(dir => HCASpaceWriteFile(dir, name, blob))
      .then(() => HCASpace.ctx?.toast(`Backup saved in your folder “${d.name}”, in Lumen / backups.`))
      .catch(() => { HCASpacePrev.R(name, blob, type); HCASpace.ctx?.toast('The folder could not be written to, so the backup was downloaded instead.', 'warning'); });
    return;
  }
  return HCASpacePrev.R(name, blob, type);
};
const HCASpaceMissingMsg = () => 'The original file is not on this device. Your notes, highlights and cards are still here. Add the file again, or restore a backup, to read it.';
const HCASpaceSaveFailMsg = () => HCASpace.error && HCASpace.error.quota && Date.now() - HCASpace.error.at < 60000
  ? 'This browser has no room left to keep the file, so it is open for this session only. Open Workspace storage to make room, then add it again.'
  : 'Sources opened for this session. Browser storage is unavailable; download a workspace backup before closing.';

/* ---------- measuring: from what Lumen actually stores, not the browser's (huge, misleading) quota ---------- */
const HCASP_NOTES = ['notes', 'highlights', 'ink', 'hcaStamps', 'practiceMasks'], HCASP_CARDS = ['cards', 'reviewLog', 'practiceSessions', 'hcaQuestionBank', 'hcaNgnLog'];
async function HCASpaceCaches() {
  const out = { app: [], model: [], modelBytes: 0 };
  try {
    if (!globalThis.caches) return out;
    for (const name of await caches.keys()) {
      if (!/webllm|mlc|tvm|model/i.test(name)) { out.app.push(name); continue; }
      out.model.push(name);
      const c = await caches.open(name);
      for (const rq of (await c.keys()).slice(0, 800)) { const r = await c.match(rq); out.modelBytes += +(r && r.headers.get('content-length')) || 0; }
    }
  } catch { }
  return out;
}
async function HCASpaceMeasure() {
  const st = HCASpace.ctx && HCASpace.ctx.state, t = { original: 0, previews: 0, notes: 0, cards: 0, other: 0, app: 0, model: 0 }, info = {};
  try {
    const db = await ge();
    await new Promise((ok, bad) => {
      const tx = db.transaction('files'), rq = tx.objectStore('files').openCursor();
      rq.onsuccess = () => {
        const c = rq.result; if (!c) return;
        const v = c.value || {}, imgs = Array.isArray(v.images) ? v.images : [];
        info[c.key] = { original: (v.blob?.size || 0) + imgs.reduce((a, i) => a + (i?.blob?.size || 0), 0), previews: imgs.reduce((a, i) => a + (i?.viewBlob?.size || 0), 0), text: JSON.stringify(v.transcripts || {}).length, stub: HCASpaceIsStub(v), folder: !!v.hcaFolder };
        c.continue();
      };
      tx.oncomplete = ok; tx.onerror = () => bad(tx.error); tx.onabort = () => bad(tx.error);
    });
  } catch { }
  const books = ((st && st.books) || []).filter(b => b.kind !== 'demo'), count = (list, id) => (list || []).filter(x => x.bookId === id).length;
  const rows = books.map(b => {
    const f = info[b.id];
    return { id: b.id, title: b.title, kind: b.kind, pages: b.count, size: b.size || f?.original || 0, original: f?.original || 0, has: !!f, stub: !f || f.stub, folder: !!f?.folder,
      notes: count(st.notes, b.id), highlights: count(st.highlights, b.id), cards: count(st.cards, b.id) };
  }).sort((a, b) => (b.original || b.size) - (a.original || a.size));
  if (st) for (const [k, v] of Object.entries(st)) {
    if (k === 'books') { for (const b of v) t.previews += (b.thumbnail || '').length; t.other += JSON.stringify(v.map(b => ({ ...b, thumbnail: undefined }))).length; continue; }
    let n = 0; try { n = (JSON.stringify(v) || '').length; } catch { }
    if (HCASP_NOTES.includes(k)) t.notes += n; else if (HCASP_CARDS.includes(k)) t.cards += n; else if (k === 'hcaSnips') t.previews += n; else t.other += n;
  }
  for (const f of Object.values(info)) { t.original += f.original; t.previews += f.previews; t.notes += f.text; }
  const sn = navigator.storage;
  let est = null, persisted = null;
  try { est = (sn && typeof sn.estimate === 'function' && await sn.estimate()) || null; } catch { }
  try { persisted = sn && typeof sn.persisted === 'function' ? await sn.persisted() : null; } catch { }
  const cs = await HCASpaceCaches(), learner = t.original + t.previews + t.notes + t.cards + t.other;
  if (est && est.usage) { const rest = Math.max(0, est.usage - learner); t.model = Math.min(rest, cs.modelBytes); t.app = rest - t.model; }
  const m = { at: Date.now(), t, learner, rows, caches: cs, persisted, canPersist: !!(sn && typeof sn.persist === 'function'), est: est && est.quota ? { usage: est.usage || 0, quota: est.quota } : null, folderCount: rows.filter(r => r.folder).length, demo: ((st && st.books) || []).length - books.length };
  HCASpace.last = m; return m;
}
function HCASpaceStats() {
  const ctx = y(), s = ctx.state, [m, setM] = _.useState(HCASpace.last), [tick, setTick] = _.useState(0);
  HCASpace.ctx = ctx;
  _.useEffect(() => { let off = false; HCASpaceMeasure().then(r => { if (!off) setM(r); }); return () => { off = true; }; }, [tick, s.books, s.notes.length, s.highlights.length, s.cards.length]);
  _.useEffect(() => { const f = () => setTick(n => n + 1); addEventListener('hca-space', f); return () => removeEventListener('hca-space', f); }, []);
  return [m, () => setTick(n => n + 1)];
}

/* ---------- actions on one source ---------- */
const HCASpaceBytes = r => (r.blob?.size || 0) + (r.images || []).reduce((a, i) => a + (i?.blob?.size || 0), 0);
const HCASpaceOpenNow = (ctx, id) => ctx.route === 'reader' && ctx.state.lastBookId === id;
async function HCASpaceKeepNotes(ctx, id) {
  const raw = await HCASpacePrev.ve(id);
  if (!raw || HCASpaceIsStub(raw)) throw Error('There is no original file in this browser to remove.');
  const size = HCASpaceBytes(raw);
  if (!await HCASpacePut(id, { type: raw.type, name: raw.name, transcripts: raw.transcripts || {} })) throw Error('That could not be saved, so the original was left as it was.');
  if (!HCASpaceOpenNow(ctx, id)) Ro(id);
  return `Original removed. Your notes, highlights and cards are still here, and about ${HCASpaceFmt(size)} is free.`;
}
async function HCASpaceMove(ctx, id) {
  const raw = await HCASpacePrev.ve(id);
  if (!raw || HCASpaceIsStub(raw)) throw Error('There is no original file in this browser to move.');
  if (HCASpace.dir.perm !== 'granted') throw Error('Allow access to your folder first.');
  const book = ctx.state.books.find(b => b.id === id), name = await HCASpaceWriteOriginal(id, raw, book && book.title);
  const stub = { type: raw.type, name: raw.name, transcripts: raw.transcripts || {}, hcaFolder: name }, back = await HCASpaceFromFolder(id, stub);
  if (!back || HCASpaceBytes(back) !== HCASpaceBytes(raw)) throw Error('The copy in your folder could not be checked, so the original was kept in this browser.');
  if (!await HCASpacePut(id, stub)) throw Error('That could not be saved, so the original was left as it was.');
  if (!HCASpaceOpenNow(ctx, id)) Ro(id);
  return `Moved to “${HCASpace.dir.name}”. Lumen reads it from there when you open it.`;
}
async function HCASpaceBringBack(id) {
  const full = await ve(id);
  if (!full || !full.hcaFromFolder) throw Error('Lumen could not read this file from your folder. Allow access to the folder and try again.');
  const { hcaFromFolder, hcaFolder, ...rec } = full;
  if (!await HCASpacePut(id, rec)) throw Error('This browser has no room for it right now. It stays in your folder.');
  return 'Back in this browser. The copy in your folder stays where it is.';
}
async function HCASpaceRemove(ctx, id, withBackup) {
  if (withBackup) { const before = HCASpace.prefs.lastBackup; await ctx.backupWorkspace(); if (HCASpace.prefs.lastBackup === before) throw Error('The backup did not finish, so nothing was removed.'); }
  await ctx.removeBook(id);
  return withBackup ? 'Saved a backup, then removed it from this device.' : 'Removed from this device.';
}
async function HCASpaceReadd(ctx, book, files) {
  files = [...files]; if (!files.length) return null;
  const stub = await HCASpacePrev.ve(book.id) || {};
  if (book.kind === 'pdf') {
    const f = files[0]; if (!/\.pdf$/i.test(f.name)) throw Error('Choose the PDF this source came from.');
    const tmp = `check-${book.id}`; let pages;
    try { pages = (await Lo(f, tmp, ctx.requestPassword)).numPages; } finally { Ro(tmp); }
    if (pages !== book.count) throw Error(`That file has ${HCASpacePlural(pages, 'page')}, but this source has ${book.count}. Choose the same file so your notes stay on the right pages.`);
    if (!await _e(book.id, { blob: f, name: f.name, type: 'pdf', transcripts: stub.transcripts || {} })) throw Error('This browser has no room to keep that file right now. Make room and try again.');
  } else {
    if (files.length !== book.count) throw Error(`This source has ${HCASpacePlural(book.count, 'page')}. Choose all ${book.count} images, so your notes stay on the right pages.`);
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    if (!await _e(book.id, { type: 'images', images: files.map(f => ({ name: f.name, blob: f })), transcripts: stub.transcripts || {} })) throw Error('This browser has no room to keep those files right now. Make room and try again.');
  }
  return 'The original is back. Your notes are where you left them.';
}
async function HCASpaceClear(names) { for (const n of names) { try { await caches.delete(n); } catch { } } }

/* ---------- adding sources: warn at 80%, ask before going over ---------- */
async function HCASpaceGate(files) {
  const ctx = HCASpace.ctx, ui = HCASpace.ui;
  if (!ctx || !ui || ctx.storageMode === 'session') return true;
  const incoming = files.reduce((a, f) => a + (f.size || 0), 0), limit = HCASpace.prefs.limit;
  let m; try { m = await HCASpaceMeasure(); } catch { return true; }
  const used = m.learner, after = used + incoming, left = m.est ? Math.max(0, m.est.quota - m.est.usage) : null;
  if (left !== null && incoming > left) return ui.ask({ kind: 'browser', used, incoming, left });
  if (limit && after > limit) return ui.ask({ kind: 'over', used, incoming, after, limit });
  if (limit && after / limit >= 0.8) ctx.toast(`After adding this you will have used about ${Math.round(after / limit * 100)}% of your ${HCASpaceFmt(limit)} limit. Open Workspace storage to make room or raise it.`, 'warning');
  return true;
}
function HCASpaceNextLimit(limit, used) { return [250 * HCASP.MB, HCASP.GB, 5 * HCASP.GB].find(x => x > Math.max(limit || 0, used)) || null; }

/* ---------- small pieces ---------- */
const HCASP_KINDS = [['original', 'Original files', 'PDFs, slides and images you added'], ['previews', 'Page images and previews', 'Covers, snips and page pictures'], ['notes', 'Notes and highlights', 'What you write and mark, and saved transcripts'], ['cards', 'Cards and reviews', 'Recall cards and your review history'], ['other', 'Other', 'Study desk, plans and settings']];
function HCASpaceLevel(used, limit) { const p = limit ? used / limit * 100 : null; return { pct: p, level: p === null ? 'ok' : p >= 100 ? 'full' : p >= 80 ? 'near' : 'ok' }; }
function HCASpaceBar(m, limit) {
  const t = m ? m.t : null, total = Math.max(1, limit ? Math.max(limit, m ? m.learner : 0) : (m ? m.learner : 1));
  return HC('div', { className: 'sp-bar', 'aria-hidden': 'true' }, t && HCASP_KINDS.map(([k], i) => t[k] / total > 0.004 && HC('span', { key: k, className: `sp-seg c${i + 1}`, style: { width: `${t[k] / total * 100}%` } })));
}
function HCASpaceProtect(m) {
  if (m && m.persisted === true) return ['shield-check-line', 'Protected from automatic clean-up'];
  if (m && m.canPersist) return ['information-line', 'The browser may clear this if the device is short of space'];
  return ['information-line', 'This browser does not say whether your space is protected'];
}
/* the compact card inside the privacy dialog */
function HCASpaceCard() {
  const ctx = y(), [m] = HCASpaceStats(), P = HCASpaceUse().prefs, lim = P.limit, used = m ? m.learner : 0, lv = HCASpaceLevel(used, lim), pr = HCASpaceProtect(m);
  return HC('section', { className: `sp-card sp-mini is-${lv.level}`, 'aria-labelledby': 'sp-mini-h' },
    HC('h3', { id: 'sp-mini-h' }, 'Workspace storage'),
    HC('p', { className: 'sp-mini-line' }, m ? HC(_.Fragment, {}, HC('strong', {}, HCASpaceFmt(used)), lim ? ` of your ${HCASpaceFmt(lim)} space is used.` : ' used. You have not set a limit.') : 'Checking your space…'),
    HCASpaceBar(m, lim),
    HC('p', { className: 'sp-mini-note' }, HCAIcon(pr[0]), pr[1] + '. Nothing is uploaded anywhere.'),
    HCABtn('Manage your learning space', () => ctx.setModal({ type: 'space' }), 'primary', 'arrow-right-line'));
}
/* the same, inside "Your work and where it lives" */
function HCASpaceMini() {
  const ctx = y(), [m] = HCASpaceStats(), P = HCASpaceUse().prefs, lim = P.limit, used = m ? m.learner : 0, pr = HCASpaceProtect(m);
  return HC('div', { className: 'sp-mini sp-inline' },
    HC('span', {}, m ? `Your space: ${HCASpaceFmt(used)}${lim ? ` of ${HCASpaceFmt(lim)}` : ' (no limit set)'}.` : 'Checking your space…'),
    HCASpaceBar(m, lim),
    HC('span', { className: 'hca-small' }, pr[1] + '.'),
    HCABtn('Manage your learning space', () => { HCA8Close('saved'); ctx.setModal({ type: 'space' }); }, 'secondary', 'folder-line'));
}
function HCASpaceRadios({ label, value, items, onPick, cls }) {
  const refs = _.useRef({});
  const move = (e, i) => {
    const on = items.filter(z => !z.disabled), cur = on.findIndex(z => z.id === items[i].id); let n = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = on[(cur + 1) % on.length]; if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = on[(cur - 1 + on.length) % on.length];
    if (n) { e.preventDefault(); refs.current[n.id] && refs.current[n.id].focus(); onPick(n.id); }
  };
  return HC('div', { role: 'radiogroup', 'aria-label': label, className: `sp-radios ${cls || ''}` }, items.map((x, i) => HC('button', {
    key: x.id, ref: el => { refs.current[x.id] = el; }, type: 'button', role: 'radio', 'aria-checked': value === x.id, 'aria-disabled': x.disabled || undefined, 'data-id': x.id,
    tabIndex: value === x.id || (!items.some(z => z.id === value) && i === 0) ? 0 : -1, className: `sp-radio${value === x.id ? ' on' : ''}${x.disabled ? ' off' : ''}`, onClick: () => onPick(x.id), onKeyDown: e => move(e, i)
  }, x.node)));
}

/* ---------- the dialog: "Your learning space" ---------- */
function HCASpaceModal({ onClose, focus }) {
  const ctx = y(), s = ctx.state, P = HCASpaceUse().prefs, D = HCASpace.dir, [m, again] = HCASpaceStats();
  const [say, setSay] = _.useState(''), [busy, setBusy] = _.useState(null), [confirm, setConfirm] = _.useState(null), [all, setAll] = _.useState(false);
  const [view, setView] = _.useState(ctx.storageMode === 'session' ? 'session' : P.mode), [custom, setCustom] = _.useState(false), [cv, setCv] = _.useState(''), [cu, setCu] = _.useState('MB'), [cerr, setCerr] = _.useState('');
  const [denied, setDenied] = _.useState(false), readdFor = _.useRef(null), fileIn = _.useRef(null), session = ctx.storageMode === 'session';
  _.useEffect(() => { HCASpaceRestoreFolder(); }, []);
  _.useEffect(() => { // jump to a section (after the dialog's own first-focus, which can land late)
    if (!focus || !m) return undefined;
    const go = () => { const el = document.getElementById(`sp-${focus}`); if (el && document.activeElement !== el) { el.scrollIntoView({ block: 'start' }); el.focus({ preventScroll: true }); } };
    const ts = [160, 450, 900].map(ms => setTimeout(go, ms)); return () => ts.forEach(clearTimeout);
  }, [!!m]);
  _.useEffect(() => { if (confirm) { const el = document.querySelector('.sp-confirm button'); if (el) el.focus(); } }, [confirm && confirm.id + confirm.kind]);
  const note = (msg, type) => { setSay(msg); ctx.toast(msg, type); };
  const refocus = back => [90, 500, 1200].forEach((ms, i) => setTimeout(() => { // the list re-renders as sizes are measured again: put focus back if it fell out of the dialog
    const ae = document.activeElement; if (i && ae && ae.closest('.space-modal') && ae !== document.querySelector('.space-modal')) return;
    const el = back && document.getElementById(back), f = el ? el.querySelector('button:not([disabled])') || el : document.getElementById('sp-sources'); (f || document.querySelector('.space-modal'))?.focus();
  }, ms));
  const run = async (key, fn, back) => { setBusy(key); try { note(await fn()); } catch (e) { note((e && e.message) || 'That did not work. Nothing was changed.', 'warning'); } finally { setBusy(null); setConfirm(null); HCASpaceEmit(); refocus(back); } };
  const used = m ? m.learner : 0, lim = P.limit, lv = HCASpaceLevel(used, lim), folderReady = D.root && D.perm === 'granted', mode = session ? 'session' : P.mode;
  const limitId = lim === null ? 'none' : [250 * HCASP.MB, HCASP.GB, 5 * HCASP.GB].includes(lim) && !custom ? String(lim) : 'custom';
  const pickWhere = id => {
    if (id === 'session') { setSay('You cannot switch this on yourself. Lumen uses it only when the browser will not let it save.'); return; }
    setView(id); if (id === 'browser') HCASpaceSet({ mode: 'browser' }); if (id === 'folder' && D.root) HCASpaceSet({ mode: 'folder' });
  };
  const pickFolder = async () => {
    setBusy('pick'); const r = await HCASpacePick(); setBusy(null); setDenied(r.why === 'denied');
    if (r.ok) { setView('folder'); note(r.kept ? `Your folder “${D.name}” is ready. New sources are copied there, and backups are saved there.` : `Your folder “${D.name}” is ready for this visit. Your browser could not remember it, so Lumen will ask you to choose it again next time.`); }
    else if (r.why === 'denied') setSay('Access to the folder was not allowed, so nothing was changed.'); else if (r.why === 'write') setSay('Lumen could not write to that folder. Choose another one.'); else if (r.why === 'error') setSay('The folder could not be opened. Nothing was changed.');
  };
  const copyAll = () => run('mirror', async () => {
    let n = 0; for (const r of m.rows) { if (r.stub) continue; const rec = await HCASpacePrev.ve(r.id); if (rec && !HCASpaceIsStub(rec)) { await HCASpaceWriteOriginal(r.id, rec, r.title); n++; } }
    return n ? `Copied ${HCASpacePlural(n, 'original')} into your folder.` : 'There are no originals to copy yet.';
  }, 'sp-where');
  const persist = async () => {
    setBusy('persist');
    try { const ok = await navigator.storage.persist(); setDenied(!ok); note(ok ? 'Done. The browser will keep your learning space when the device is short of space.' : 'The browser did not agree this time. It tends to say yes once Lumen has been used a few times. A backup keeps you safe either way.', ok ? undefined : 'warning'); }
    catch { note('This browser does not offer that option. A backup keeps you safe either way.', 'warning'); }
    setBusy(null); again();
  };
  const setLimit = v => { HCASpaceSet({ limit: v }); setCustom(false); setCerr(''); };
  const applyCustom = () => { const n = parseFloat(cv); if (!(n > 0)) { setCerr('Enter a number, for example 500.'); return; } const b = n * (cu === 'GB' ? HCASP.GB : HCASP.MB); if (b < 5 * HCASP.MB) { setCerr('Choose at least 5 MB.'); return; } setLimit(Math.round(b)); setCustom(true); };
  const rows = m ? m.rows : [], shown = all ? rows : rows.slice(0, 6), attached = r => r.notes + r.highlights + r.cards;
  const askConfirm = (id, kind) => { setConfirm({ id, kind }); setTimeout(() => { const el = document.getElementById(`sp-src-${id}`); el && el.scrollIntoView({ block: 'center' }); }, 30); };
  /* suggestions */
  const sug = [];
  if (m) {
    const move = folderReady && P.mode === 'folder';
    for (const r of rows.filter(r => r.original >= HCASP.MB && !r.stub).slice(0, 3)) sug.push({ key: `src-${r.id}`, title: r.title, bytes: r.original, text: attached(r) ? `${move ? 'Move the original to your folder' : 'Keep notes only'}. Your ${HCASpacePlural(r.notes, 'note')}, ${HCASpacePlural(r.highlights, 'highlight')} and ${HCASpacePlural(r.cards, 'card')} stay here.` : `${move ? 'Move the original to your folder' : 'Keep notes only'}. You have not added notes or cards to this one yet.`, label: move ? 'Move to folder' : 'Keep notes only', go: () => move ? run(`mv-${r.id}`, () => HCASpaceMove(ctx, r.id), 'sp-room') : askConfirm(r.id, 'notes') });
    if (m.t.app >= 5 * HCASP.MB && m.caches.app.length) sug.push({ key: 'app', title: 'App files for offline use', bytes: m.t.app, text: 'Lumen downloads these again when it needs them. Your study is not touched.', label: 'Clear app files', go: () => run('app', async () => { await HCASpaceClear(m.caches.app); return 'App files cleared. Lumen fetches them again when needed.'; }, 'sp-room') });
    if (m.caches.model.length) sug.push({ key: 'model', title: 'On-device AI model', bytes: m.t.model || m.caches.modelBytes, text: 'You can download it again if you want it back. Your study is not touched.', label: 'Remove the model', go: () => run('model', async () => { await HCASpaceClear(m.caches.model); return 'The on-device AI model was removed.'; }, 'sp-room') });
  }
  const freeable = sug.reduce((a, x) => a + (x.bytes || 0), 0);
  /* pieces of the page */
  const meterText = lim ? `${HCASpaceFmt(used)} of ${HCASpaceFmt(lim)}` : `${HCASpaceFmt(used)}, no limit set`;
  const msg = !m ? 'Checking your space…' : !rows.length && used < HCASP.MB ? 'Nothing here yet. Add a PDF or some images and they will show up here, with their size.' : lv.level === 'full' ? 'Your space is full. Lumen will ask before adding anything else. Make room or raise your limit below.' : lv.level === 'near' ? `Getting full: you have used ${Math.round(lv.pct)}% of your space. Lumen will warn you before you go over.` : lv.pct === null ? 'No limit is set, so Lumen will not hold anything back. You can choose one below.' : lv.pct < 50 ? 'Plenty of room.' : `You have used about ${Math.round(lv.pct)}% of your space.`;
  const pr = HCASpaceProtect(m), srcState = r => r.folder ? 'folder' : r.has && !r.stub ? 'kept' : r.has ? 'notes' : 'missing';
  const chips = { kept: 'Original kept', folder: 'In your folder', notes: 'Notes only', missing: 'File missing' };
  const sec = (id, title, lead, ...kids) => HC('section', { className: 'sp-card', 'aria-labelledby': `sp-${id}`, key: id }, HC('h3', { id: `sp-${id}`, tabIndex: -1 }, title), lead && HC('p', { className: 'sp-lead' }, lead), ...kids);
  const srcRow = r => {
    const st = srcState(r), bz = busy === `mv-${r.id}` || busy === `kn-${r.id}` || busy === `rm-${r.id}` || busy === `bb-${r.id}` || busy === `ra-${r.id}`, att = attached(r), c = confirm && confirm.id === r.id ? confirm.kind : null;
    return HC('li', { key: r.id, id: `sp-src-${r.id}`, className: `sp-src st-${st}`, 'aria-busy': bz || undefined },
      HC('div', { className: 'sp-src-top' },
        HC('span', { className: 'sp-src-icon' }, HCAIcon(r.kind === 'images' ? 'image-line' : 'file-pdf-2-line')),
        HC('div', { className: 'sp-src-main' }, HC('strong', {}, r.title), HC('span', { className: 'sp-src-meta' }, `${HCASpacePlural(r.pages, 'page')} · ${r.kind === 'images' ? 'Images' : 'PDF'} · ${r.has && !r.stub ? HCASpaceFmt(r.original) : r.size ? HCASpaceFmt(r.size) + ' file' : 'no file here'}`),
          HC('span', { className: 'sp-src-att' }, att ? `${HCASpacePlural(r.notes, 'note')} · ${HCASpacePlural(r.highlights, 'highlight')} · ${HCASpacePlural(r.cards, 'card')}` : 'No notes or cards yet')),
        HC('span', { className: `sp-chip st-${st}` }, chips[st])),
      c ? HC('div', { className: 'sp-confirm', role: 'group', 'aria-label': `Confirm for ${r.title}` },
        HC('strong', {}, c === 'notes' ? `Keep notes only for “${r.title}”?` : `Remove “${r.title}” from this device?`),
        HC('p', {}, c === 'notes' ? `This removes the original file (${HCASpaceFmt(r.original)}) from this browser. ${att ? `Your ${HCASpacePlural(r.notes, 'note')}, ${HCASpacePlural(r.highlights, 'highlight')} and ${HCASpacePlural(r.cards, 'card')} stay here` : 'Anything you add later stays here'}, and you can add the same file again whenever you like.`
          : `This deletes the file${att ? ` and your ${HCASpacePlural(r.notes, 'note')}, ${HCASpacePlural(r.highlights, 'highlight')} and ${HCASpacePlural(r.cards, 'card')} for it` : ''} from this browser.${r.folder ? ' The copy in your folder stays where it is.' : ''} Saving a backup first means you can bring it all back.`),
        HC('div', { className: 'sp-actions' }, c === 'notes'
          ? [HCABtn('Remove the original', () => run(`kn-${r.id}`, () => HCASpaceKeepNotes(ctx, r.id), `sp-src-${r.id}`), 'primary', 'delete-bin-line', { key: 'y' }), HCABtn('Keep it', () => setConfirm(null), 'secondary', 'check-line', { key: 'n' })]
          : [HCABtn('Back up, then remove', () => run(`rm-${r.id}`, () => HCASpaceRemove(ctx, r.id, true), `sp-src-${r.id}`), 'primary', 'download-line', { key: 'b' }), HCABtn('Remove without a backup', () => run(`rm-${r.id}`, () => HCASpaceRemove(ctx, r.id, false), `sp-src-${r.id}`), 'secondary', 'delete-bin-line', { key: 'y', className: 'sp-danger' }), HCABtn('Keep it', () => setConfirm(null), 'secondary', 'check-line', { key: 'n' })])) :
        HC('div', { className: 'sp-actions' },
          st === 'kept' && HCABtn('Keep notes only', () => askConfirm(r.id, 'notes'), 'secondary', 'scissors-cut-line', { 'aria-label': `Keep notes only for ${r.title}`, disabled: !!busy }),
          st === 'kept' && folderReady && P.mode === 'folder' && HCABtn('Move to folder', () => run(`mv-${r.id}`, () => HCASpaceMove(ctx, r.id), `sp-src-${r.id}`), 'secondary', 'folder-line', { 'aria-label': `Move ${r.title} to your folder`, disabled: !!busy }),
          st === 'folder' && HCABtn('Bring back here', () => run(`bb-${r.id}`, () => HCASpaceBringBack(r.id), `sp-src-${r.id}`), 'secondary', 'download-line', { 'aria-label': `Bring ${r.title} back into this browser`, disabled: !!busy }),
          (st === 'notes' || st === 'missing') && HCABtn('Add the file again', () => { readdFor.current = r; fileIn.current && (fileIn.current.accept = r.kind === 'images' ? 'image/*' : '.pdf,application/pdf', fileIn.current.multiple = r.kind === 'images', fileIn.current.click()); }, 'secondary', 'upload-2-line', { 'aria-label': `Add the file for ${r.title} again`, disabled: !!busy }),
          HCABtn('Remove from this device', () => askConfirm(r.id, 'remove'), 'secondary', 'delete-bin-line', { className: 'sp-danger', 'aria-label': `Remove ${r.title} from this device`, disabled: !!busy })),
      bz && HC('p', { className: 'sp-working', role: 'status' }, 'Working on it…'));
  };

  return HC(A, { title: 'Your learning space', eyebrow: 'WORKSPACE STORAGE', onClose, className: 'space-modal', closeLabel: 'Close workspace storage' },
    HC('p', { className: 'sp-intro' }, HCAIcon('lock-line'), HC('span', {}, 'Everything you add to Lumen stays on this device. ', HC('strong', {}, 'Nothing is uploaded anywhere'), ', and there is no copy on a server. Here you can see what takes room, choose where your space lives, and decide how much to keep.')),
    HC('p', { className: 'sp-live', role: 'status', 'aria-live': 'polite' }, say),
    /* 1. the meter */
    HC('section', { className: `sp-card sp-meter is-${lv.level}`, 'aria-labelledby': 'sp-meter-h' },
      HC('div', { className: 'sp-meter-head' }, HC('h3', { id: 'sp-meter-h' }, 'Your space'), HC('span', { className: 'sp-meter-num' }, m ? HC(_.Fragment, {}, HC('strong', {}, HCASpaceFmt(used)), lim ? ` of ${HCASpaceFmt(lim)}` : ' · no limit set') : 'Checking…')),
      HC('div', { className: 'sp-track', role: 'progressbar', 'aria-label': 'Your space used', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': lv.pct === null ? undefined : Math.min(100, Math.round(lv.pct)), 'aria-valuetext': m ? meterText + (lv.pct === null ? '' : ` (${Math.round(lv.pct)}%)`) : 'Checking' }, HCASpaceBar(m, lim)),
      HC('p', { className: `sp-state is-${lv.level}`, role: 'status' }, HCAIcon(lv.level === 'ok' ? 'checkbox-circle-line' : 'information-line'), HC('span', {}, msg)),
      HC('ul', { className: 'sp-legend', 'aria-label': 'What your space holds' }, HCASP_KINDS.map(([k, name, hint], i) => HC('li', { key: k }, HC('span', { className: `sp-sw c${i + 1}`, 'aria-hidden': 'true' }), HC('span', { className: 'sp-lg-t' }, HC('strong', {}, name), HC('small', {}, hint)), HC('span', { className: 'sp-lg-n' }, m ? HCASpaceFmt(m.t[k]) : '…')))),
      m && m.t.app + m.t.model >= HCASP.MB / 2 && HC('p', { className: 'sp-app' }, HC('strong', {}, `App files for offline use: ${HCASpaceFmt(m.t.app + m.t.model)}`), ' (including any on-device AI model). They are not counted in your limit; Lumen can download them again.'),
      m && m.folderCount > 0 && HC('p', { className: 'sp-app' }, HC('strong', {}, `In your folder: ${HCASpacePlural(m.folderCount, 'original')}`), ' kept outside this browser.')),
    /* 2. make room */
    (!m || rows.length || sug.length) && sec('room', 'Make room', m && sug.length ? `Small steps that keep your notes. ${freeable >= HCASP.MB ? `Together these could free about ${HCASpaceFmt(freeable)}.` : ''}` : 'Suggestions appear here when there is something worth clearing.',
      m && sug.length ? HC('ul', { className: 'sp-sug' }, sug.map(x => HC('li', { key: x.key }, HC('div', {}, HC('strong', {}, x.title), HC('span', {}, x.text)), HC('span', { className: 'sp-free' }, `Frees ${HCASpaceFmt(x.bytes)}`), HCABtn(x.label, x.go, 'secondary', 'arrow-right-line', { 'aria-label': `${x.label}: ${x.title}`, disabled: !!busy })))) : m && HC('p', { className: 'sp-empty' }, 'Nothing needs clearing right now.')),
    /* 3. sources */
    sec('sources', 'Your sources', rows.length ? 'Largest first. Keep notes only removes a file but keeps everything you made from it.' : '',
      rows.length ? HC('ul', { className: 'sp-srcs' }, shown.map(srcRow)) : HC('div', { className: 'sp-none' }, HC('strong', {}, 'No files yet'), HC('span', {}, 'When you add a PDF, slides or images they appear here with their size, so you always know what is taking room.'), HCABtn('Add a source', () => { onClose(); setTimeout(() => ctx.setModal({ type: 'upload' }), 60); }, 'primary', 'upload-2-line')),
      rows.length > 6 && HC('div', { className: 'sp-more' }, HCABtn(all ? 'Show fewer' : `Show all ${rows.length} sources`, () => setAll(!all), 'secondary', 'arrow-down-s-line', { 'aria-expanded': all })),
      m && m.demo > 0 && HC('p', { className: 'sp-small' }, `The ${m.demo} built-in sample sources take almost no room and are not listed.`),
      HC('input', { ref: fileIn, type: 'file', className: 'sp-hidden-input', tabIndex: -1, 'aria-hidden': 'true', onChange: async e => { const f = [...e.target.files], r = readdFor.current; e.target.value = ''; if (f.length && r) { const book = s.books.find(b => b.id === r.id); if (book) run(`ra-${r.id}`, () => HCASpaceReadd(ctx, book, f), `sp-src-${r.id}`); } } })),
    /* 4. where it lives */
    sec('where', 'Where your learning space lives', 'Choose where Lumen keeps your originals and backups. Your notes and cards always stay in this browser so Lumen stays quick.',
      HC(HCASpaceRadios, { label: 'Where your learning space lives', value: session ? 'session' : view, onPick: pickWhere, cls: 'sp-where', items: [
        { id: 'browser', node: HC(_.Fragment, {}, HCAIcon('shield-check-line'), HC('strong', {}, 'This browser'), HC('small', {}, 'Private and automatic. This is the default.')) },
        { id: 'folder', node: HC(_.Fragment, {}, HCAIcon('folder-line'), HC('strong', {}, 'A folder on this device'), HC('small', {}, 'Keep originals and backups in a folder you choose.')) },
        { id: 'session', disabled: !session, node: HC(_.Fragment, {}, HCAIcon('cloud-off-line'), HC('strong', {}, 'Session only'), HC('small', {}, 'Nothing kept after closing. Used if the browser will not let Lumen save.')) }] }),
      HC('div', { className: 'sp-where-body', 'data-view': view },
        (session ? 'session' : view) === 'browser' && HC('p', {}, 'Your files, notes and cards live in this browser’s private storage on this computer. Other browsers, other profiles and other people’s accounts cannot see them. Clearing the site’s data removes them, so back up now and then.'),
        (session ? 'session' : view) === 'session' && HC('div', {}, HC('p', {}, 'This browser is not letting Lumen save, so what you do now lives in this tab only. Save a backup file before you close it.'), HCABtn('Back up now', () => ctx.backupWorkspace(), 'primary', 'download-line')),
        view === 'folder' && !session && (!HCASpaceCanFolder()
          ? HC('div', { className: 'sp-callout' }, HCAIcon('information-line'), HC('div', {}, HC('strong', {}, 'This browser cannot open a folder for Lumen'), HC('p', {}, 'Chrome and Edge can; Safari and Firefox cannot yet. Your work stays safely in this browser, and the best extra copy is a backup file that you keep somewhere you trust.'), HCABtn('Export a backup file', () => ctx.backupWorkspace(), 'primary', 'download-line')))
          : !D.root
            ? HC('div', {}, HC('p', {}, 'Choose a folder, for example in Documents. Lumen keeps a copy of each original there, saves your backups there, and can read a source back from it later. That lets you free browser space without losing the file.'),
              denied && HC('p', { className: 'sp-warn', role: 'alert' }, 'Access to the folder was not allowed. You can try again, or keep using this browser.'),
              HCABtn(busy === 'pick' ? 'Waiting for you…' : 'Choose a folder', pickFolder, 'primary', 'folder-line', { disabled: !!busy }))
            : HC('div', {},
              HC('p', { className: 'sp-folder' }, HCAIcon('folder-line'), HC('span', {}, 'Folder: ', HC('strong', {}, D.name), HC('small', {}, 'Lumen keeps copies in Lumen / originals and saves backups in Lumen / backups.'))),
              D.perm !== 'granted' && HC('div', { className: 'sp-callout is-warn' }, HCAIcon('information-line'), HC('div', {}, HC('strong', {}, D.perm === 'denied' ? 'Lumen cannot use the folder yet' : 'Allow access to your folder again'), HC('p', {}, 'After a restart your browser asks you to allow a folder again. Nothing has changed or been lost.'), HCABtn(`Allow access to “${D.name}”`, async () => { const p = await HCASpacePerm(true); if (p === 'granted') { HCASpaceSet({ mode: 'folder' }); note('Thank you. Your folder is ready.'); } else setSay('Access was not allowed, so nothing was changed.'); }, 'primary', 'lock-line'))),
              HC('label', { className: 'sp-check' }, HC('input', { type: 'checkbox', checked: !!P.mirror, onChange: () => HCASpaceSet({ mirror: !P.mirror }) }), HC('span', {}, 'Copy new sources into the folder automatically', HC('small', {}, 'Each PDF or image set you add is also saved there.'))),
              HC('div', { className: 'sp-actions' }, HCABtn(busy === 'mirror' ? 'Copying…' : 'Copy all originals now', copyAll, 'secondary', 'file-copy-line', { disabled: !!busy || D.perm !== 'granted' }), HCABtn('Choose a different folder', () => m && m.folderCount ? setSay(`${HCASpacePlural(m.folderCount, 'source')} live only in this folder. Bring them back into the browser first, then choose another folder.`) : pickFolder(), 'secondary', 'folder-line', { disabled: !!busy }),
                HCABtn('Back up now', () => ctx.backupWorkspace(), 'secondary', 'download-line')))))),
    /* 5. budget */
    sec('limit', 'How much to keep', `Choose a limit for your own files, notes and cards. Lumen warns you at 80% and checks with you before going over. App files for offline use are not counted.`,
      HC(HCASpaceRadios, { label: 'Space limit', value: limitId, cls: 'sp-limits', onPick: id => { if (id === 'custom') { setCustom(true); setCv(lim ? String(Math.round((lim >= HCASP.GB ? lim / HCASP.GB : lim / HCASP.MB) * 10) / 10) : ''); setCu(lim && lim >= HCASP.GB ? 'GB' : 'MB'); } else if (id === 'none') setLimit(null); else setLimit(+id); },
        items: [[String(250 * HCASP.MB), '250 MB'], [String(HCASP.GB), '1 GB'], [String(5 * HCASP.GB), '5 GB'], ['custom', 'Custom'], ['none', 'No limit']].map(([id, t]) => ({ id, node: HC('span', {}, t) })) }),
      (custom || limitId === 'custom') && HC('div', { className: 'sp-custom' }, HC('label', { htmlFor: 'sp-cv' }, 'Your limit'),
        HC('input', { id: 'sp-cv', type: 'number', inputMode: 'decimal', min: 1, step: 'any', value: cv, 'aria-describedby': 'sp-cerr', onChange: e => { setCv(e.target.value); setCerr(''); }, onKeyDown: e => { if (e.key === 'Enter') applyCustom(); } }),
        HC('select', { 'aria-label': 'Unit', value: cu, onChange: e => setCu(e.target.value) }, HC('option', {}, 'MB'), HC('option', {}, 'GB')),
        HCABtn('Set limit', applyCustom, 'secondary', 'check-line'), HC('p', { id: 'sp-cerr', className: 'sp-warn', role: 'alert' }, cerr)),
      m && m.est && HC('p', { className: 'sp-small' }, `Your browser could hold about ${HCASpaceFmt(m.est.quota)} for Lumen, but it can clear stored data if the device runs short of space. A limit of your own keeps things comfortable long before that.`),
      m && !m.est && HC('p', { className: 'sp-small' }, 'This browser does not report how much room it has, so Lumen goes by the limit you set here.'),
      lim && m && lim > (m.est ? m.est.quota : Infinity) && HC('p', { className: 'sp-warn' }, 'That is more than this browser allows, so it may run out first.')),
    /* 6. protection */
    sec('protect', 'Protection', null,
      HC('p', { className: `sp-prot ${m && m.persisted === true ? 'on' : ''}` }, HCAIcon(pr[0]), HC('span', {}, HC('strong', {}, pr[1]), HC('small', {}, m && m.persisted === true ? 'Your browser will not clear Lumen’s data when the device is short of space. Clearing the site’s data yourself still removes it.' : m && m.canPersist ? 'Browsers can free space by clearing sites you have not used for a while. You can ask yours to protect Lumen.' : 'Back up now and then, and keep a copy somewhere safe.'))),
      m && m.canPersist && m.persisted !== true && HCABtn(busy === 'persist' ? 'Asking…' : 'Ask the browser to protect it', persist, 'secondary', 'shield-check-line', { disabled: !!busy }),
      denied && m && m.persisted !== true && m.canPersist && HC('p', { className: 'sp-small' }, 'The browser said not now. It is more likely to agree once you have used Lumen a few times or installed it as an app.')),
    /* 7. backup */
    sec('backup', 'Back up and restore', `One file holds your notes, highlights, cards and original files. It is not encrypted and it is never uploaded: it goes to ${P.mode === 'folder' && folderReady ? `Lumen / backups in “${D.name}”` : 'your Downloads folder'}.`,
      HC('p', { className: 'sp-small' }, P.lastBackup ? `Last backup: ${new Date(P.lastBackup).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.` : 'No backup yet.'),
      HC('div', { className: 'sp-actions' }, HCABtn('Back up now', () => ctx.backupWorkspace(), 'primary', 'download-line'),
        HC('label', { className: 'button secondary file-button' }, HCAIcon('upload-2-line'), 'Restore a backup', HC('input', { type: 'file', accept: 'application/json,.json', 'aria-label': 'Restore a backup file', onChange: async e => { const f = e.target.files[0]; e.target.value = ''; if (f) { onClose(); await ctx.restoreWorkspace(f); } } }))),
      m && m.t.original > 200 * HCASP.MB && HC('p', { className: 'sp-small' }, 'Backups larger than about 350 MB cannot be restored. If your originals add up to more than that, use Keep notes only or a folder for the biggest ones.')));
}

/* ---------- "this would go over your limit" and "no room left" ---------- */
function HCASpaceDialog({ dlg, close }) {
  const ctx = y(), lim = HCASpace.prefs.limit, next = dlg.kind === 'over' ? HCASpaceNextLimit(lim, dlg.after) : null;
  const room = () => { close(false); HCASpace.ui.open({ focus: 'room' }); };
  const title = dlg.kind === 'over' ? 'This would go over your space limit' : dlg.kind === 'browser' ? 'This browser may not have room for that' : 'There was no room left to keep that file';
  const body = dlg.kind === 'over' ? `You are using ${HCASpaceFmt(dlg.used)} of ${HCASpaceFmt(dlg.limit)}. Adding ${HCASpaceFmt(dlg.incoming)} would take you to ${HCASpaceFmt(dlg.after)}.`
    : dlg.kind === 'browser' ? `Your browser has about ${HCASpaceFmt(dlg.left)} free for Lumen, and what you chose is ${HCASpaceFmt(dlg.incoming)}. It may not be kept.`
      : 'Your browser said it is out of space, so the file is open for this session only. Make room, then add it again. Your notes and cards are safe.';
  return HC(A, { title, eyebrow: 'A QUICK CHECK BEFORE WE CARRY ON', onClose: () => close(false), className: 'space-ask', footer: HC(_.Fragment, {},
    dlg.kind === 'full' ? HCABtn('Close', () => close(false), 'secondary', 'close-line') : HCABtn('Not now', () => close(false), 'secondary', 'close-line'),
    dlg.kind === 'over' && HCABtn('Add anyway', () => close(true), 'secondary', 'arrow-right-line'),
    dlg.kind === 'browser' && HCABtn('Try anyway', () => close(true), 'secondary', 'arrow-right-line'),
    dlg.kind === 'over' && HCABtn(next ? `Raise my limit to ${HCASpaceFmt(next)}` : 'Remove my limit', () => { HCASpaceSet({ limit: next }); close(true); }, 'secondary', 'arrow-up-line'),
    HCABtn('Make room', room, 'primary', 'folder-line')) },
    HC('p', { className: 'dialog-intro' }, body),
    dlg.kind !== 'full' && HC('p', { className: 'sp-small' }, 'Nothing has been added yet, and nothing is lost.'));
}
function HCASpaceHost() {
  const ctx = y(), [dlg, setDlg] = _.useState(null), [overlay, setOverlay] = _.useState(null);
  HCASpace.ctx = ctx;
  _.useEffect(() => {
    HCASpace.ui = { ask: o => new Promise(res => setDlg({ ...o, res })), open: o => setOverlay(o || {}) };
    const full = () => setDlg(d => d || { kind: 'full', res: () => { } });
    addEventListener('hca-space-full', full); HCASpaceRestoreFolder();
    return () => { removeEventListener('hca-space-full', full); HCASpace.ui = null; };
  }, []);
  const back = () => setTimeout(() => { const top = [...document.querySelectorAll('.modal')].pop(); if (top && !top.contains(document.activeElement)) top.focus(); }, 80); // keep keyboard focus in the dialog underneath
  const close = v => { const d = dlg; setDlg(null); d && d.res(v); back(); };
  return HC(_.Fragment, {}, dlg && HC(HCASpaceDialog, { dlg, close }), overlay && HC(HCASpaceModal, { ...overlay, onClose: () => { setOverlay(null); back(); } }));
}

/* ---------- the reader's "no file here" screen: say why, and offer the way back ---------- */
function HCASpaceGap({ book, message, setModal }) {
  const ctx = y(), [why, setWhy] = _.useState(null), [busy, setBusy] = _.useState(false), [err, setErr] = _.useState(''), inp = _.useRef();
  const probe = async () => { const raw = await HCASpacePrev.ve(book.id); setWhy(!raw ? 'missing' : !HCASpaceIsStub(raw) ? 'other' : raw.hcaFolder ? (HCASpace.dir.perm === 'granted' ? 'folder-gone' : 'folder-locked') : 'removed'); };
  _.useEffect(() => { HCASpaceRestoreFolder().then(probe); }, [book.id]);
  const reopen = () => { ctx.navigate('library'); setTimeout(() => ctx.openBook(book.id), 120); };
  const allow = async () => { setBusy(true); const p = await HCASpacePerm(true); setBusy(false); if (p === 'granted' && await HCASpaceFromFolder(book.id, await HCASpacePrev.ve(book.id))) reopen(); else { setErr('Lumen could not open the file from your folder. Check that it is still there.'); probe(); } };
  const readd = async e => { const f = [...e.target.files]; e.target.value = ''; if (!f.length) return; setBusy(true); setErr(''); try { await HCASpaceReadd(ctx, book, f); ctx.toast('The original is back.'); reopen(); } catch (x) { setErr((x && x.message) || 'That file could not be added.'); } setBusy(false); };
  const lead = { removed: ['The original file is not on this device', `You kept notes only, so your notes, highlights and cards for “${book.title}” are safe. Add the same file again to read it (${HCASpacePlural(book.count, 'page')}).`],
    missing: ['This source’s file is not in this browser', 'Your notes, highlights and cards are still here. Add the same file again to read it, or restore a backup.'],
    'folder-locked': ['Allow Lumen to open your folder', 'This source is kept in your folder. After a restart your browser asks you to allow the folder again. Nothing has been lost.'],
    'folder-gone': ['The file is not in your folder any more', 'Add the same file again to read it. Your notes, highlights and cards are safe.'] }[why];
  if (!lead) return HC(ee, { icon: 'file-pdf-2-line', title: 'This source needs another look.', text: message, children: HC(k, { variant: 'soft', icon: 'upload-2-line', onClick: () => setModal({ type: 'upload' }) }, 'Import a source') });
  return HC(ee, { icon: 'file-pdf-2-line', title: lead[0], text: lead[1], children: HC('div', { className: 'sp-gap' },
    why === 'folder-locked' ? HCABtn(busy ? 'Waiting…' : 'Allow access to my folder', allow, 'primary', 'lock-line', { disabled: busy }) : HCABtn(busy ? 'Checking the file…' : 'Add the file again', () => { inp.current.accept = book.kind === 'images' ? 'image/*' : '.pdf,application/pdf'; inp.current.multiple = book.kind === 'images'; inp.current.click(); }, 'primary', 'upload-2-line', { disabled: busy }),
    HCABtn('Open Workspace storage', () => setModal({ type: 'space' }), 'secondary', 'folder-line'),
    HC('input', { ref: inp, type: 'file', className: 'sp-hidden-input', tabIndex: -1, 'aria-hidden': 'true', onChange: readd }),
    err && HC('p', { className: 'sp-warn', role: 'alert' }, err)) });
}

/* ---------- wiring: the dialog router shows the dialog and keeps the host mounted ---------- */
const HCASpacePrevDialogs = rs;
rs = function HCASpaceRouter() { const ctx = y(), m = ctx.modal; return HC(_.Fragment, {}, HC(HCASpacePrevDialogs), m && m.type === 'space' && HC(HCASpaceModal, { ...m, onClose: () => ctx.setModal(null) }), HC(HCASpaceHost)); };
HCASpace.prefs.mode === 'folder' && HCASpaceRestoreFolder();
/*HCA13:END*/
