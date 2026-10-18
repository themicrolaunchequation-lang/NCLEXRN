/* Answers a Crown Suite app on its own subdomain with the progress this browser saved for it here.
   Only the asking app's own data is sent, and only to that app's exact address. */
(function () {
  'use strict';
  var APPS = {
    carecraft: { ls: 'carecraft', db: /^carecraft/i, known: [] },
    medlex: { ls: 'medlex', db: /^medlex/i, known: ['MedLex-v4', 'MedLex-Infographic-Annotations', 'MedLex-Infographic-Images'] },
    serein: { ls: 'serein', db: /^serein/i, known: [] },
    lumen: { ls: 'lumen.', db: /^lumen\./i, known: ['lumen.workspace.v4', 'lumen.documents.v1'] }
  };
  function req(r) { return new Promise(function (ok, no) { r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; }); }
  function names(cfg) {
    var known = Promise.resolve(cfg.known.map(function (n) { return { name: n }; }));
    var list = indexedDB.databases ? indexedDB.databases().catch(function () { return []; }) : Promise.resolve([]);
    return Promise.all([list, known]).then(function (r) {
      var seen = {}; return r[0].concat(r[1]).map(function (d) { return d.name; }).filter(function (n) { return n && cfg.db.test(n) && !seen[n] && (seen[n] = 1); });
    });
  }
  function dump(name) {
    return new Promise(function (ok) {
      var exists = true, open = indexedDB.open(name);
      open.onupgradeneeded = function () { exists = false; };
      open.onerror = function () { ok(null); };
      open.onsuccess = function () {
        var idb = open.result;
        if (!exists) { idb.close(); indexedDB.deleteDatabase(name); return ok(null); }
        var stores = Array.prototype.slice.call(idb.objectStoreNames);
        if (!stores.length) { idb.close(); return ok(null); }
        var tx = idb.transaction(stores, 'readonly');
        Promise.all(stores.map(function (s) {
          var st = tx.objectStore(s);
          return Promise.all([req(st.getAllKeys()), req(st.getAll())]).then(function (kv) {
            return { name: s, keyPath: st.keyPath, autoIncrement: st.autoIncrement,
              indexes: Array.prototype.map.call(st.indexNames, function (i) { var x = st.index(i); return { name: x.name, keyPath: x.keyPath, unique: x.unique, multiEntry: x.multiEntry }; }),
              records: kv[0].map(function (k, i) { return [k, kv[1][i]]; }) };
          });
        })).then(function (s) { idb.close(); ok({ name: name, version: idb.version, stores: s }); }, function () { idb.close(); ok(null); });
      };
    });
  }
  addEventListener('message', function (e) {
    var m = /^https:\/\/(medlex|carecraft|serein|lumen)\.healthcarecrownacademy\.co\.uk$/.exec(e.origin);
    if (!m || !e.data || e.data.type !== 'hca-move-request' || e.source !== parent) return;
    var cfg = APPS[m[1]], ls = {};
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.toLowerCase().indexOf(cfg.ls) === 0) ls[k] = localStorage.getItem(k); } } catch (x) {}
    names(cfg).then(function (n) { return Promise.all(n.map(dump)); }).catch(function () { return []; }).then(function (dbs) {
      parent.postMessage({ type: 'hca-move-data', ls: ls, idb: dbs.filter(Boolean) }, e.origin);
    });
  });
})();
