/* MedLex Word parts quests shown inside the app: the quest's half of the host / guest pair.
   Source of learn/shared/js/quest-embed.js (apps/tools/medlex-embed-fit.mjs copies it there and links it from the three quest pages).
   The host is apps/medlex/src/lib/quests.js (window.parent.HCAQuestHost). A quest opened on its own, or framed by anything else, has no host, so this file does nothing there.
   What it does for a quest that sits in an auto-height frame:
   - tells the host when a pop-up opens or closes (the host then makes the frame as tall as the screen part it is on, so the pop-up always fits);
   - focus: moves it into the pop-up, keeps Tab inside, hides the page behind from screen readers, gives focus back to the card on close, keeps it when a pop-up re-draws;
   - names the pop-ups (role=dialog, aria-modal, a label) and makes the prefix cards reachable by keyboard;
   - sends toasts and confetti to the host, which draws them on the screen instead of at the top of a very tall frame;
   - window.scrollTo and the hero buttons scroll the app page, not the frame. */
(function () {
  'use strict';
  var W = window, D = document, R = D.documentElement, host = null;
  try { if (W.parent !== W) host = W.parent.HCAQuestHost || null; } catch (e) { host = null; }
  if (!host || !R.classList.contains('hca-embed')) return;
  /* call a host method; the frame window is always the first argument so the host knows which frame is asking */
  function ask(name) { try { var f = host[name]; if (typeof f === 'function') return f.apply(host, [W].concat([].slice.call(arguments, 1))); } catch (e) { } return undefined; }
  var FOCUSABLE = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[tabindex],[contenteditable=true]';
  var shown = function (e) { return !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  var tabbable = function (root) { return [].slice.call(root.querySelectorAll(FOCUSABLE)).filter(function (e) { return !e.disabled && e.tabIndex >= 0 && shown(e); }); };

  /* the studio title is a second-level heading here: the app page already has the h1 "<name> studio" */
  var title = D.getElementById('ml-title'); if (title) { title.setAttribute('role', 'heading'); title.setAttribute('aria-level', '2'); }

  /* roots: the four intro topics are tabs (aria-selected is only valid on a tab) */
  var introTabs = D.querySelector('nav.introTabs');
  if (introTabs) { introTabs.setAttribute('role', 'tablist'); [].forEach.call(introTabs.querySelectorAll('[data-intro-tab]'), function (b) { b.setAttribute('role', 'tab'); }); }

  /* ---------- prefix cards: a real button for the keyboard (roots and suffixes already have one) ---------- */
  function cards() {
    [].forEach.call(D.querySelectorAll('#grid .card[data-i]'), function (c) {
      if (c.querySelector('button.open-hit,button.tapHint')) return;
      var f = c.querySelector('.pfx'); if (!f || f.getAttribute('role')) return;
      var m = c.querySelector('.mean');
      f.setAttribute('role', 'button'); f.tabIndex = 0; f.setAttribute('aria-label', 'Open the ' + f.textContent.trim() + ' card' + (m ? ': ' + m.textContent.trim() : ''));
    });
  }
  var grid = D.getElementById('grid');
  if (grid) {
    cards(); new MutationObserver(cards).observe(grid, { childList: true });
    grid.addEventListener('keydown', function (e) {
      var t = e.target; if ((e.key !== 'Enter' && e.key !== ' ') || !t.matches || !t.matches('.pfx[role=button]')) return;
      e.preventDefault(); var c = t.closest('.card'); if (c) c.click();
    });
  }

  /* ---------- pop-ups ---------- */
  var overlays = [].slice.call(D.querySelectorAll('.overlay')), order = [], trigger = null, backTo = null, lastId = '', inerted = [], wasOpen = false;
  var isOn = function (o) { return getComputedStyle(o).display !== 'none'; };
  var dialogOf = function (o) { return o.getAttribute('role') === 'dialog' ? o : (o.querySelector('[role=dialog]') || o.querySelector('.modal') || o); };
  var NAMES = { modal: 'Prefix card', badgeModal: 'Trophy cabinet' };
  function name(o) {
    var d = dialogOf(o); if (!d.getAttribute('role')) d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    if (d.hasAttribute('aria-labelledby') || (d.hasAttribute('aria-label') && !d.hasAttribute('data-ml-name'))) return;
    var h = o.querySelector('.mpfx'), t = (NAMES[o.id] || 'Details') + (h ? ': ' + h.textContent.trim() : '');
    d.setAttribute('aria-label', t); d.setAttribute('data-ml-name', '1');
  }
  /* a way to find the card again after the quest re-draws its grid */
  function snap(e) {
    if (!e || e === D.body || e === R) return null;
    if (e.id) return '#' + (W.CSS && CSS.escape ? CSS.escape(e.id) : e.id);
    var k = e.closest('[data-i],[data-id],[data-idx]'); if (!k) return null;
    var a = k.hasAttribute('data-i') ? 'data-i' : k.hasAttribute('data-id') ? 'data-id' : 'data-idx';
    var inner = e === k ? '' : ' ' + e.tagName.toLowerCase() + (e.classList.length ? '.' + e.classList[0] : '');
    return '[' + a + '="' + k.getAttribute(a) + '"]' + inner;
  }
  function focusIn(o) { var d = dialogOf(o); d.setAttribute('tabindex', '-1'); d.focus({ preventScroll: true }); }
  function setInert(on) {
    if (on) {
      if (inerted.length) return;
      [].forEach.call(D.body.children, function (c) { if (c.classList.contains('overlay') || c.id === 'toasts' || /^(SCRIPT|STYLE|LINK|CANVAS)$/.test(c.tagName) || c.inert) return; c.inert = true; inerted.push(c); });
    } else { inerted.forEach(function (c) { c.inert = false; }); inerted = []; }
  }
  function opened(o) {
    name(o);
    if (!order.length) backTo = trigger || snap(D.activeElement);
    order.push(o); setInert(true);
    if (!o.contains(D.activeElement)) focusIn(o);
  }
  function closed(o) {
    order.splice(order.indexOf(o), 1);
    if (order.length) { if (!order[order.length - 1].contains(D.activeElement)) focusIn(order[order.length - 1]); return; }
    setInert(false);
    var e = backTo && D.querySelector(backTo); backTo = null; lastId = '';
    if (e && shown(e)) e.focus({ preventScroll: true });
  }
  function sync() {
    var on = overlays.filter(isOn);
    on.forEach(function (o) { if (order.indexOf(o) < 0) opened(o); });
    order.filter(function (o) { return on.indexOf(o) < 0; }).forEach(closed);
    var now = order.length > 0; if (now !== wasOpen) { wasOpen = now; ask('modal', now); }
  }
  overlays.forEach(function (o) {
    new MutationObserver(sync).observe(o, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    /* a pop-up that re-draws its content (next / previous card) drops the focused button: put focus back on the same control */
    new MutationObserver(function () {
      if (!order.length || order[order.length - 1] !== o) return; name(o);
      if (o.contains(D.activeElement)) return;
      var again = lastId && D.getElementById(lastId); if (again && o.contains(again) && shown(again)) again.focus({ preventScroll: true }); else focusIn(o);
    }).observe(o, { childList: true, subtree: true });
  });
  D.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('button,a[href],[role=button],[tabindex],summary,.card'); if (t) { var b = t.matches('.card') && t.querySelector('.pfx[role=button]'); trigger = snap(b || t); } }, true);
  D.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target !== D.body) trigger = snap(e.target); }, true);
  D.addEventListener('focusin', function (e) { if (order.length && e.target.id && order[order.length - 1].contains(e.target)) lastId = e.target.id; });
  /* Tab stays inside the pop-up (the page behind is inert, but the frame's Tab would otherwise leave for the app page) */
  D.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !order.length) return;
    var o = order[order.length - 1], f = tabbable(o), a = D.activeElement, i = f.indexOf(a);
    if (!f.length) { e.preventDefault(); focusIn(o); return; }
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus({ preventScroll: true }); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus({ preventScroll: true }); }
  }, true);
  /* Focusing something inside a pop-up never scrolls the app page: the host has already put the pop-up where the person is looking */
  var focus0 = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (o) { if (this.closest && this.closest('.overlay') && !(o && o.preventScroll === false)) o = Object.assign({}, o, { preventScroll: true }); return focus0.call(this, o); };
  /* the host asks for the top pop-up to close (backdrop click on the app page, Esc while focus is outside the frame) */
  W.HCAQuest = { open: function () { return order.length > 0; }, close: function () { var o = order[order.length - 1]; if (o) o.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); } };
  W.addEventListener('pagehide', function () { if (wasOpen) { wasOpen = false; ask('modal', false); } });

  /* a link to the MedLex home page ("your MedLex Word Lab" in the roots footer) goes to the app's first page inside this tab, not to a reload of the site root */
  D.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'), u; if (!a) return;
    try { u = new URL(a.href); } catch (x) { return; }
    if (u.origin === W.parent.location.origin && !u.hash && /^\/(medlex\/?)?$/.test(u.pathname)) a.setAttribute('href', u.origin + '/#today');
  }, true);

  /* ---------- scrolling: the frame is as tall as the quest, so the app page is what scrolls ---------- */
  W.scrollTo = function (a, b) {
    var top = typeof a === 'object' && a ? a.top : b, how = typeof a === 'object' && a ? a.behavior : undefined;
    if (typeof top === 'number') ask('scrollTo', top, how);
  };
  W.scroll = W.scrollTo;

  /* ---------- toasts and confetti are drawn by the host, on the screen ---------- */
  var viaHost = false;
  if (typeof W.toast === 'function') {
    var toast0 = W.toast;
    W.toast = function (msg, ms) { if (ask('toast', String(msg), typeof ms === 'number' ? ms : 0) !== true) return toast0.apply(this, arguments); };
    viaHost = true;
  }
  [['confetti', function (n) { return { n: n }; }], ['confettiBurst', function (x, y, n) { return { n: n, x: x, y: y }; }], ['confettiRain', function () { return { rain: true, n: 150 }; }]].forEach(function (p) {
    var f0 = W[p[0]]; if (typeof f0 !== 'function') return;
    W[p[0]] = function () { if (ask('confetti', p[1].apply(null, arguments)) !== true) return f0.apply(this, arguments); };
    viaHost = true;
  });
  /* prefix: its canvas confetti was sized to the whole (tall) frame; keep the canvas tiny now that the host draws the confetti */
  try { if (typeof cvs !== 'undefined' && typeof cvsResize === 'function') { removeEventListener('resize', cvsResize); cvs.width = 1; cvs.height = 1; } } catch (e) { }
  /* where "a third of the way down the screen" is, in this frame's own viewport coordinates, like getBoundingClientRect (used by the prefix quest's celebrations) */
  W.hcaVY = function (k) { var y = ask('docY', 1 / k); return typeof y === 'number' ? y : W.innerHeight / k; };
  if (viaHost) R.classList.add('hca-fx');
  ask('ready');
})();
