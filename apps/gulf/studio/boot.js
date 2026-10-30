/* Gulf studio loader. The public data file holds only the free questions (1 to 10). A signed-in member with a
   Gulf Pass (or an admin) gets the full bank from /api/gulf-content, which checks their pass on the server.
   The rest of the studio scripts then load in their original order, so they always see the right question set. */
(function () {
  'use strict';
  var me = document.currentScript, rest = [];
  try { rest = JSON.parse(me.getAttribute('data-rest') || '[]'); } catch (e) { rest = []; }
  var acct = rest.filter(function (s) { return /crown-account\./.test(s); })[0];
  function load(src) {
    return new Promise(function (ok) { var s = document.createElement('script'); s.src = src; s.async = false; s.onload = s.onerror = function () { ok(); }; document.head.appendChild(s); });
  }
  function signedIn() { return /(?:^|; )hca-auth\.0=/.test(document.cookie); }
  function entitled(e) {
    if (!e) return false; if (e.admin) return true;
    var g = e.gulf || {}, now = Date.now();
    return Object.keys(g).some(function (k) { return Date.parse(g[k]) > now; });
  }
  var timeout = function (ms) { return new Promise(function (ok) { setTimeout(function () { ok(null); }, ms); }); };
  var full = null;
  (acct ? load(acct) : Promise.resolve())
    .then(function () {
      if (!signedIn() || !window.HCA || !HCA.ready) return null;
      return Promise.race([HCA.ready, timeout(8000)]).then(function (e) {
        if (!entitled(e)) return null;
        return Promise.resolve(HCA.token ? HCA.token() : null).then(function (tok) {
          if (!tok) return null;
          return fetch('/api/gulf-content', { headers: { Authorization: 'Bearer ' + tok }, cache: 'no-store' })
            .then(function (r) { return r.ok ? r.json() : null; });
        });
      }).catch(function () { return null; });
    })
    .then(function (d) {
      if (d && Array.isArray(d.questions) && d.questions.length) {
        full = d; window.GULF_FULL_BANK = true;
        if (d.dossiers) window.GULF_DOSSIERS = d.dossiers;
        if (d.dossiersLib) window.GULF_DOSSIERS_LIB = d.dossiersLib;
      }
      var chain = Promise.resolve();
      rest.forEach(function (src) {
        if (src === acct) return;
        chain = chain.then(function () { return load(src); }).then(function () {
          // The edition questions arrive with the config file; swap in the full set before the data layer reads it.
          if (!full) return;
          if (/\/data\./.test(src)) window.SNLE_QUESTIONS = full.questions;
          if (full.extra && /gulf-cfg\./.test(src) && window.GULF_CONFIG) window.GULF_CONFIG.extra = full.extra;
        });
      });
      return chain;
    });
})();
