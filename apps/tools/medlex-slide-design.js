/* MedLex lesson decks: slide-design enhancer (viewer only). Source: apps/tools/medlex-slide-design.js, copied to shared/js/slide-design.js by
   apps/tools/medlex-embed-fit.mjs. It only restructures how run-on card text is DISPLAYED (number badge, label, heading, description); it never
   changes a word of the medical text. A deck opened on its own (no html.hca-embed) is left exactly as it was. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('hca-embed')) return;
  var GLYPH = /^[←-⯿☀-➿⌀-⏿■-◿\u{1F300}-\u{1FAFF}️‍]+$/u;
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  // "Decode the word Prefix · root ..." -> heading "Decode the word", description "Prefix · root ..." (the description starts at the next capital letter)
  function splitHeading(t) {
    var m = /^(.+?[a-z0-9À-ɏ)])\s+([A-Z“"].*)$/su.exec(t);
    if (m && m[1].split(/\s+/).length <= 6) return [m[1], m[2]];
    return [t, ''];
  }
  function card(num, kick, head, desc) {
    var wrap = el('div', 'sd-text');
    if (kick) wrap.appendChild(el('small', 'sd-kick', kick));
    if (head) wrap.appendChild(el('h4', 'sd-head', head));
    if (desc) wrap.appendChild(el('p', 'sd-desc', desc));
    return { num: num ? el('span', 'sd-num', num) : null, text: wrap };
  }
  function mount(art, parts) {
    var keep = Array.prototype.filter.call(art.children, function (c) { return c.matches('.term-shelf,.term-cue'); });
    art.textContent = '';
    art.classList.add('sd-card'); if (!parts.num) art.classList.add('sd-nonum');
    if (parts.num) art.appendChild(parts.num);
    art.appendChild(parts.text);
    keep.forEach(function (k) { art.appendChild(k); });
  }
  function enhanceCard(art) {
    if (art.dataset.sd) return; art.dataset.sd = '1';
    var kids = Array.prototype.filter.call(art.childNodes, function (n) { return n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()); });
    var core = kids.filter(function (n) { return !(n.nodeType === 1 && n.matches('.term-shelf,.term-cue')); });
    if (art.querySelector('img:not(.term-cue img),button,table,details,ul,ol,figure,input,textarea,select')) return;
    // 1. "01 / SEE ◩ Decode the word Prefix ..." (a single run-on paragraph)
    if (core.length === 1 && core[0].nodeType === 1 && core[0].tagName === 'P' && !core[0].children.length) {
      var t = core[0].textContent.replace(/\s+/g, ' ').trim();
      var m = /^(\d{1,2})\s*\/\s*([A-Z][A-Z &-]*?)\s+(\S)\s+(.+)$/u.exec(t);
      if (m && GLYPH.test(m[3])) { var hd = splitHeading(m[4]); mount(art, card(m[1], m[2], hd[0], hd[1])); return; }
      m = /^(\d{1,2})\s*\/\s*([A-Z][A-Z &-]*?)\s+(.+)$/u.exec(t);
      if (m) { var hd2 = splitHeading(m[3]); mount(art, card(m[1], m[2], hd2[0], hd2[1])); return; }
    }
    // 2. <b>01 Identify </b>Locate a prefix ...
    if (core.length === 2 && core[0].nodeType === 1 && core[0].tagName === 'B' && core[1].nodeType === 3) {
      var m3 = /^(\d{1,2})\s+(.+?)\s*$/u.exec(core[0].textContent);
      if (m3) { mount(art, card(m3[1], '', m3[2], core[1].textContent.replace(/\s+/g, ' ').trim())); return; }
    }
    // 3. <h3>01 · Locate</h3><p>...</p>  or  01<h3>Language</h3><p>
    var h = core.filter(function (n) { return n.nodeType === 1 && /^H[34]$/.test(n.tagName); })[0];
    if (h && core.length <= 3) {
      var mm = /^(\d{1,2})\s*[·\/.:-]\s*(.+)$/u.exec(h.textContent.trim());
      var lead = core[0].nodeType === 3 ? /^\s*(\d{1,2})\s*$/.exec(core[0].textContent) : null;
      if (mm || lead) {
        var p = core.filter(function (n) { return n.nodeType === 1 && n.tagName === 'P'; })[0];
        mount(art, card(mm ? mm[1] : lead[1], '', mm ? mm[2] : h.textContent.trim(), p ? p.textContent.replace(/\s+/g, ' ').trim() : ''));
      }
    }
  }
  // recall cards: the term is the big word, "click to reveal" becomes the action pill; on the back the meaning is the large text
  function enhanceRecall(b) {
    if (b.dataset.sd) return; b.dataset.sd = '1';
    var LEAD = /^\s*(CLICK TO (?:REVEAL|RECALL)|Recall the meaning)\s+/, TRAIL = /\s+(Recall \u2192 click to reveal|Think \u2192 click to reveal|Click to reveal \u21bb|Think, then flip \u21bb|Click or press Enter to reveal)\s*$/;
    b.querySelectorAll('strong').forEach(function (s) {
      var t = s.textContent, lead = LEAD.exec(t), rest = lead ? t.slice(lead[0].length) : t, trail = TRAIL.exec(rest);
      if (!lead && !trail) return;
      if (trail) rest = rest.slice(0, rest.length - trail[0].length);
      s.textContent = '';
      if (lead) s.appendChild(el('span', 'sd-vh', lead[0]));
      s.appendChild(document.createTextNode(rest));
      if (trail) s.appendChild(el('span', 'sd-vh', trail[0]));
    });
    var back = b.querySelector('.recall-back'), bs = back && back.querySelector('strong'), sp = back && back.querySelector(':scope > span');
    if (bs && sp) {
      var term = Array.prototype.filter.call(bs.childNodes, function (n) { return !(n.nodeType === 1 && n.classList.contains('sd-vh')); }).map(function (n) { return n.textContent; }).join('').trim(), txt = sp.textContent;
      if (term && txt.indexOf(term) === 0 && txt.length > term.length) {
        var rest2 = txt.slice(term.length).trim();
        sp.textContent = ''; sp.appendChild(el('span', 'sd-vh', term + ' ')); sp.appendChild(document.createTextNode(rest2)); sp.classList.add('sd-def');
      }
    }
  }
  function run() {
    document.querySelectorAll('.course-title > p:last-child').forEach(function (p) {
      if (/^Explore the detail panels[,.]/i.test(p.textContent.trim())) p.classList.add('sd-generic-lead');
    });
    document.querySelectorAll('.detail-card').forEach(function (c) { enhanceCard(c); if (!c.querySelector('.table-scroll,.course-flips,.course-quiz,.study-bank,.sequence-lab,.curated-builder') && c.textContent.length > 150) c.classList.add('sd-long'); });
    document.querySelectorAll('.recall-card').forEach(enhanceRecall);
    document.querySelectorAll('.reveal-grid summary').forEach(function (sm) {
      if (sm.dataset.sd) return; sm.dataset.sd = '1';
      var n = sm.firstChild; if (!n || n.nodeType !== 3) return;
      var m = /^\s*(\d{1,2})\s*\/\s*(.+?)\s*$/.exec(n.textContent); if (!m) return;
      var b = el('b', 'sd-sum'), i = el('i', '', m[1]); b.appendChild(i); b.appendChild(document.createTextNode(m[2])); sm.replaceChild(b, n);
    });
    document.querySelectorAll('.course-cards article').forEach(function (a) {
      var i = a.querySelector('.card-index'); if (!i) return; i.classList.add('sd-num');
      var h = a.querySelector('h3'), n = parseInt(i.textContent, 10), m = h && /^(\d{1,2})\s*\/\s*(.+)$/.exec(h.textContent);
      if (m && +m[1] === n) h.textContent = m[2]; // the badge already carries the number
    });
  }
  // fit: a card whose text is longer than its box steps down a size (sd-fit1, then sd-fit2) before it is allowed to scroll
  function over(e) {
    if (e.scrollHeight > e.clientHeight + 1) return true;
    if (e.classList.contains('recall-card')) { // a button does not report its overflow: compare the last visible line with the card's bottom edge
      var v = e.querySelector('.recall-back:not([hidden])') || e.querySelector('.recall-front'), last = v && v.lastElementChild;
      return !!last && last.getBoundingClientRect().bottom > e.getBoundingClientRect().bottom - 6;
    }
    if (e.classList.contains('bank-flip')) {
      var eb = e.getBoundingClientRect(), bad = false;
      Array.prototype.forEach.call(e.children, function (c) { if (!c.hidden && c.getBoundingClientRect().height && c.getBoundingClientRect().bottom > eb.bottom - 4) bad = true; });
      return bad;
    }
    return false;
  }
  function fit(e) {
    if (!e.offsetParent) return;
    e.classList.remove('sd-fit1', 'sd-fit2', 'sd-fit3');
    if (!over(e)) return;
    e.classList.add('sd-fit1'); if (!over(e)) return;
    e.classList.add('sd-fit2'); if (!over(e)) return;
    e.classList.add('sd-fit3');
  }
  function fitAll() {
    document.querySelectorAll('.slide:not([hidden]) .detail-card:not(:has(.course-flips,.course-quiz,.study-bank,.sequence-lab,.table-scroll)), .slide:not([hidden]) .recall-card, .slide:not([hidden]) .bank-flip').forEach(fit);
  }
  var timer = 0; function later() { clearTimeout(timer); timer = setTimeout(function () { run(); fitAll(); }, 60); }
  run();
  document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('load', function () { run(); fitAll(); });
  window.addEventListener('resize', later);
  try { var mo = new MutationObserver(later); mo.observe(document.body || root, { childList: true, subtree: true }); mo.observe(document.body || root, { attributes: true, subtree: true, attributeFilter: ['hidden', 'aria-expanded'] }); } catch (e) { /* run() on load is enough */ }
})();
