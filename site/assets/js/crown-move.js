/* Healthcare Crown Academy: one-time move of saved progress from healthcarecrownacademy.co.uk/<app>
   to <app>.healthcarecrownacademy.co.uk. Runs before the app. If this browser already has progress
   here, nothing is copied. Copies are added, never overwrite, and the move happens once. */
(function () {
  'use strict';
  var m = location.hostname.match(/^(medlex|carecraft|serein|lumen)\.healthcarecrownacademy\.co\.uk$/);
  if (!m) return;
  var app = m[1], FLAG = 'hca-moved', PREFIX = { carecraft: 'carecraft', medlex: 'medlex', serein: 'serein', lumen: 'lumen.' }[app];
  try {
    if (localStorage.getItem(FLAG)) return;
    for (var i = 0; i < localStorage.length; i++) if ((localStorage.key(i) || '').toLowerCase().indexOf(PREFIX) === 0) { localStorage.setItem(FLAG, 'had-data'); return; }
  } catch (e) { return; }
  var APEX = 'https://healthcarecrownacademy.co.uk', frame = document.createElement('iframe'), done = false;
  function finish(state, reload) {
    if (done) return; done = true;
    try { localStorage.setItem(FLAG, state); } catch (e) {}
    removeEventListener('message', onMessage); frame.remove();
    if (reload) location.reload();
  }
  function req(r) { return new Promise(function (ok, no) { r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; }); }
  function putDb(db) {
    return new Promise(function (ok) {
      var open = indexedDB.open(db.name, db.version), created = false;
      open.onupgradeneeded = function () {
        created = true; var idb = open.result;
        db.stores.forEach(function (s) {
          if (idb.objectStoreNames.contains(s.name)) return;
          var st = idb.createObjectStore(s.name, { keyPath: s.keyPath, autoIncrement: s.autoIncrement });
          s.indexes.forEach(function (x) { st.createIndex(x.name, x.keyPath, { unique: x.unique, multiEntry: x.multiEntry }); });
        });
      };
      open.onerror = open.onblocked = function () { ok(); };
      open.onsuccess = function () {
        var idb = open.result, names = db.stores.map(function (s) { return s.name; }).filter(function (n) { return idb.objectStoreNames.contains(n); });
        if (!names.length) { idb.close(); return ok(); }
        var tx = idb.transaction(names, 'readwrite');
        db.stores.forEach(function (s) {
          if (names.indexOf(s.name) < 0) return; var st = tx.objectStore(s.name);
          s.records.forEach(function (r) { var q = st.keyPath == null ? st.add(r[1], r[0]) : st.add(r[1]); q.onerror = function (e) { e.preventDefault(); e.stopPropagation(); }; });
        });
        tx.oncomplete = tx.onerror = tx.onabort = function () { idb.close(); ok(); };
      };
    });
  }
  function onMessage(e) {
    if (e.origin !== APEX || !e.data || e.data.type !== 'hca-move-data') return;
    var d = e.data, any = false;
    try { Object.keys(d.ls || {}).forEach(function (k) { if (localStorage.getItem(k) == null) { localStorage.setItem(k, d.ls[k]); any = true; } }); } catch (x) {}
    var dbs = (d.idb || []).filter(function (db) { return db.stores.some(function (s) { return s.records.length; }); });
    if (dbs.length) any = true;
    Promise.all(dbs.map(putDb)).then(function () { finish(any ? 'moved' : 'nothing', any); }, function () { finish('failed', any); });
  }
  addEventListener('message', onMessage);
  frame.hidden = true; frame.title = 'Moving your saved progress'; frame.src = APEX + '/move';
  frame.onload = function () { frame.contentWindow.postMessage({ type: 'hca-move-request' }, APEX); };
  setTimeout(function () { finish('timeout', false); }, 8000);
  (document.body || document.documentElement).appendChild(frame);
})();
