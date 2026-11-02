/* Crown Help: the help sidebar for Healthcare Crown Academy and its apps.
   Answers come from data.json, built from docs/crown-help/CROWN-HELP-CATALOGUE.md by apps/crown-help/build.mjs.
   No AI: questions are matched in the browser. Anything it cannot answer goes to hello@ by email.
   Logging: anonymous events only (see public.crown_help_log). Crisis and handover events never store the user's words. */
(function () {
  'use strict';
  if (window.CrownHelp) return;
  var D = document;
  var SCRIPT = D.currentScript;
  var BASE = SCRIPT ? SCRIPT.src.replace(/crown-help\.js.*$/, '') : '/assets/crown-help/';
  var SUPA = 'https://ujeofxfbwivjmgrxqdcl.supabase.co';
  var KEY = 'sb_publishable_ie1qqB5QnaqUZPitNPfQCg__M46e7JL';
  var EMAIL = 'hello@healthcarecrownacademy.co.uk';
  var GREETING = 'Hi, I\'m Crown Help. Ask me about the apps, plans, your account or getting started. For anything I can\'t answer, our team replies by email.';
  var REPLY = 'within 5 working days';

  /* ---------- where are we? ---------- */
  var host = location.hostname, p = location.pathname.replace(/\/+$/, '') || '/';
  var APP = (host.match(/^(medlex|lumen|carecraft|serein|snle|evinca|lss)\./) || [])[1] ||
    (p.match(/^\/(medlex|lumen|carecraft|serein)(\/|$)/) || [])[1] || 'site';
  if (APP === 'snle') APP = 'gulf';
  var PAGE = APP !== 'site' ? APP
    : /^\/(home)?$/.test(p) ? 'home'
    : /^\/subscribe/.test(p) ? 'plans'
    : /^\/account/.test(p) ? 'account'
    : /^\/(guides|tools)/.test(p) ? 'guides'
    : /^\/(privacy|terms|refunds)/.test(p) ? 'legal' : 'home';

  /* ---------- small helpers ---------- */
  function el(tag, cls, text) { var e = D.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function inline(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>'); }
  // Minimal, safe Markdown: paragraphs, bold, bullet and numbered lists. Input is our own catalogue, escaped first.
  function md(text) {
    var out = [], list = null;
    text.split('\n').forEach(function (line) {
      var b = line.match(/^\s*-\s+(.*)/), n = line.match(/^\s*\d+\.\s+(.*)/);
      var kind = b ? 'ul' : n ? 'ol' : null;
      if (kind) {
        if (!list || list.k !== kind) { if (list) out.push('</' + list.k + '>'); list = { k: kind }; out.push('<' + kind + '>'); }
        out.push('<li>' + inline((b || n)[1]) + '</li>');
      } else {
        if (list) { out.push('</' + list.k + '>'); list = null; }
        if (line.trim()) out.push('<p>' + inline(line) + '</p>');
      }
    });
    if (list) out.push('</' + list.k + '>');
    return out.join('');
  }
  var store = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem('crown-help.' + k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem('crown-help.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  function log(kind, intent, query) {
    try {
      fetch(SUPA + '/rest/v1/rpc/crown_help_log', {
        method: 'POST', keepalive: true, credentials: 'omit',
        headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY },
        body: JSON.stringify({ p_kind: kind, p_app: APP === 'site' ? PAGE : APP, p_path: p.slice(0, 120), p_intent: intent || null, p_query: query ? String(query).slice(0, 300) : null })
      }).catch(function () {});
    } catch (e) {}
  }

  /* ---------- matching ---------- */
  var STOP = ' a an the i me my im i\'m we us our you your it its is are am was were be been do does did can could would will should shall may might to of in on at for from by with and or but if so as this that these those there here what whats how why when where who which please hi hello hey thanks just really very some any get got about into up out not no yes ok okay guys guy folks without today ';
  var SYN = {
    pay: 'charge', paid: 'charge', payment: 'charge', payments: 'charge', billed: 'charge', billing: 'charge', charged: 'charge', charges: 'charge', debit: 'charge',
    price: 'price', prices: 'price', pricing: 'price', cost: 'price', costs: 'price', fee: 'price', fees: 'price', much: 'price', expensive: 'price', cheap: 'price', cheaper: 'price', afford: 'price',
    cancel: 'cancel', cancelling: 'cancel', canceling: 'cancel', cancelled: 'cancel', canceled: 'cancel', cancellation: 'cancel', stop: 'cancel',
    refund: 'refund', refunds: 'refund', refunded: 'refund', money: 'refund',
    login: 'login', log: 'login', logon: 'login', signin: 'login', sign: 'login', signed: 'login',
    password: 'password', pwd: 'password',
    register: 'account', signup: 'account', account: 'account', profile: 'account',
    delete: 'delete', remove: 'delete', erase: 'delete', close: 'delete',
    broken: 'broken', working: 'broken', work: 'broken', works: 'broken', error: 'broken', bug: 'broken', crash: 'broken', crashes: 'broken', blank: 'broken', loading: 'broken', load: 'broken', stuck: 'broken', glitch: 'broken', freeze: 'broken', frozen: 'broken',
    phone: 'phone', mobile: 'phone', iphone: 'phone', android: 'phone', ipad: 'phone', tablet: 'phone', download: 'phone', install: 'phone', store: 'phone', playstore: 'phone', appstore: 'phone',
    offline: 'offline', internet: 'offline', signal: 'offline', wifi: 'offline', connection: 'offline',
    certificate: 'certificate', certificates: 'certificate', cpd: 'certificate', accredited: 'certificate', accreditation: 'certificate', qualification: 'certificate', certified: 'certificate', certification: 'certificate',
    snle: 'gulf', saudi: 'gulf', scfhs: 'gulf', dha: 'gulf', doh: 'gulf', dhp: 'gulf', dubai: 'gulf', qatar: 'gulf', abu: 'gulf', dhabi: 'gulf', gulf: 'gulf', prometric: 'gulf', licensure: 'gulf', license: 'licence',
    data: 'data', information: 'data', info: 'data', gdpr: 'data', privacy: 'data',
    complain: 'complaint', complaint: 'complaint', complaints: 'complaint', unhappy: 'complaint', disappointed: 'complaint',
    human: 'person', person: 'person', agent: 'person', someone: 'person', staff: 'person', representative: 'person',
    free: 'free', trial: 'trial',
    words: 'word', terms: 'word', term: 'word', terminology: 'word', vocabulary: 'word',
    exam: 'exam', exams: 'exam', test: 'exam', questions: 'question', question: 'question', qbank: 'question',
    sync: 'device', devices: 'device', device: 'device', laptop: 'device', computer: 'device', another: 'device',
    team: 'team', teams: 'team', hospital: 'team', trust: 'team', university: 'team', school: 'team', college: 'team', organisation: 'team', organization: 'team', company: 'team', bulk: 'team', group: 'team',
    legit: 'legit', scam: 'legit', real: 'legit', trustworthy: 'legit', genuine: 'legit', fake: 'legit',
    discount: 'discount', coupon: 'discount', promo: 'discount', voucher: 'discount', code: 'discount', nhs: 'discount',
    stressed: 'stress', stress: 'stress', burnout: 'stress', exhausted: 'stress', tired: 'stress', anxious: 'stress', anxiety: 'stress', overwhelmed: 'stress',
    receipt: 'receipt', invoice: 'receipt', vat: 'vat', tax: 'vat'
  };
  function stem(w) {
    if (w.length > 5 && /ing$/.test(w)) return w.slice(0, -3);
    if (w.length > 4 && /ed$/.test(w)) return w.slice(0, -2);
    if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + 'y';
    if (w.length > 3 && /[^s]s$/.test(w)) return w.slice(0, -1);
    return w;
  }
  function tokens(s) {
    var words = String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/sign[\s-]?in|log[\s-]?in|sign[\s-]?up/g, function (m) { return m.replace(/[\s-]/g, ''); })
      .replace(/[^a-z0-9£$' ]+/g, ' ').split(/\s+/);
    var out = [];
    words.forEach(function (w) {
      w = w.replace(/^'+|'+$/g, '').replace(/'s$/, '');
      if (!w || STOP.indexOf(' ' + w + ' ') >= 0) return;
      var s = SYN[w] || stem(w);
      if (out.indexOf(s) < 0) out.push(s);
    });
    return out;
  }
  function raw(s) { return String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean); }
  var INDEX = null, IDF = {};
  function buildIndex(data) {
    var df = {}, n = 0;
    INDEX = data.intents.map(function (it) {
      var phrases = [it.title].concat(it.say || []).map(function (t) { var k = tokens(t); return k.length ? k : raw(t); }).filter(function (t) { return t.length; });
      var ans = tokens(it.answer || '');
      phrases.concat([ans]).forEach(function (ph) { n++; ph.forEach(function (t) { df[t] = (df[t] || 0) + 1; }); });
      return { it: it, phrases: phrases, ans: ans };
    });
    Object.keys(df).forEach(function (t) { IDF[t] = Math.log(1 + n / df[t]); });
  }
  function w(t) { return IDF[t] || Math.log(1 + 400); }
  function sum(ts) { return ts.reduce(function (a, t) { return a + w(t); }, 0); }
  function available(it) {
    if (it.crisis) return false;
    if (it.onlyIf === 'test-mode') return !!D.querySelector('[data-sub-mode]:not([hidden])');
    return true;
  }
  function match(q) {
    var qt = tokens(q);
    if (!qt.length) qt = raw(q);
    if (!qt.length) return [];
    var qs = sum(qt);
    var scored = INDEX.filter(function (x) { return available(x.it); }).map(function (x) {
      var best = 0, cov = 0, exact = false;
      x.phrases.forEach(function (ph) {
        var hit = 0; ph.forEach(function (t) { if (qt.indexOf(t) >= 0) hit += w(t); });
        if (!hit) return;
        var sc = 0.7 * hit / Math.sqrt(sum(ph) * qs) + 0.3 * hit / qs + 0.15 * hit / sum(ph);
        if (hit >= qs - 1e-9 && hit >= sum(ph) - 1e-9) { sc += 0.5; exact = true; }
        if (sc > best) { best = sc; cov = hit / qs; }
      });
      var ah = 0; x.ans.forEach(function (t) { if (qt.indexOf(t) >= 0) ah += w(t); });
      var s = best + 0.25 * (ah / qs);
      // Most of the question must be about this topic, or the answer is a guess ("bitcoin price" is not about our prices).
      if (cov < 0.45) s *= 0.6;
      if (x.it.app && (x.it.app === APP)) s *= 1.15;
      return { it: x.it, s: s, exact: exact };
    }).sort(function (a, b) { return b.s - a.s; });
    return scored;
  }
  var THRESHOLD = 0.47;

  /* ---------- safety ---------- */
  var CRISIS = /\b(suicid\w*|kill(ing)? (my ?self|me)|end (my life|it all)|self[- ]?harm\w*|hurt(ing)? my ?self|cut(ting)? my ?self|(don'?t|do not) want to (live|be here|wake up)|want(ed)? to die|better off dead|can'?t go on|no reason to live|overdos\w*|take my (own )?life|(he|she|they|someone) (is )?(hurting|abusing|hitting) me|i'?m (not safe|in danger))\b/i;
  var ANGRY = /\b(rip[- ]?off|disgrac\w*|ridiculous|unacceptable|useless|rubbish|terrible|worst|appalling|fraud\w*|f+u+c+k\w*|shit\w*|crap|wtf|furious|angry|fed up|sue|lawyer|trading standards)\b|!!!/i;
  var CLINICAL = /\b(dos(e|es|age|ing)|my patient|(a|the) patient (has|is|with)|symptoms?|diagnos\w*|side effects?|what (should|can|do) (i|we) (give|take)|how much \w+ (should|can|do) (i|we) (give|take)|chest pain|is (this|it|that) normal|blood pressure (is|of)|should i (go|call|see))\b/i;
  var LEARNING = /\b(calculat\w*|exam|question|practi[cs]e|learn\w*|module|lesson|medlex|carecraft|gulf|snle|dha|doh)\b/i;
  var BILLING = /\b(charg\w*|refund\w*|money|paid|payment|card|subscription|renew\w*|bill\w*)\b/i;
  function shouting(q) { var letters = q.replace(/[^A-Za-z]/g, ''); return letters.length > 12 && letters === letters.toUpperCase(); }

  /* ---------- state ---------- */
  var data = null, loading = null, ui = null, misses = 0, frustration = 0;
  var convo = []; // this chat only, in memory: closing the panel or leaving the page ends it
  try { sessionStorage.removeItem('crown-help.convo'); } catch (e) {}
  function remember(who, text) { convo.push({ who: who, text: String(text).slice(0, 600) }); if (convo.length > 40) convo = convo.slice(-40); }
  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) loading = fetch(BASE + 'data.json', { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error('load'); return r.json(); })
      .then(function (d) { data = d; buildIndex(d); return d; });
    return loading;
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function answerOf(it) { return it.dated && today() >= it.dated.from ? it.dated.answer : it.answer; }
  function intent(id) { return data.intents.filter(function (i) { return i.id === id; })[0]; }

  /* ---------- UI ---------- */
  var CROWN = '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M8 41h8.5l4.5-14.5 5.2 11.5L32 20l5.8 18 5.2-11.5 4.5 14.5H56M18 48h28" fill="none" stroke="currentColor" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="21" cy="19.6" r="3" fill="currentColor"/><circle cx="43" cy="19.6" r="3" fill="currentColor"/><circle cx="32" cy="12.6" r="3.4" fill="currentColor"/></svg>';
  function css() {
    if (D.getElementById('crown-help-css')) return;
    var l = el('link'); l.id = 'crown-help-css'; l.rel = 'stylesheet'; l.href = BASE + 'crown-help.css?v=5'; D.head.appendChild(l);
  }
  function build() {
    if (ui) return ui;
    var root = el('div', 'chp'); root.setAttribute('data-app', APP); root.setAttribute('data-page', PAGE);
    var btn = el('button', 'chp-launch'); btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'chp-panel');
    btn.innerHTML = CROWN + '<span>Ask us</span>'; btn.setAttribute('aria-label', 'Ask us: open Crown Help');
    var panel = el('section', 'chp-panel'); panel.id = 'chp-panel'; panel.hidden = true;
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false'); panel.setAttribute('aria-labelledby', 'chp-title');
    panel.innerHTML =
      '<div class="chp-head"><span class="chp-mark">' + CROWN + '</span><div><h2 id="chp-title">Crown Help</h2><p>Healthcare Crown Academy</p></div>' +
      '<button type="button" class="chp-email-top">Email us</button>' +
      '<button type="button" class="chp-close" aria-label="Close Crown Help"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>' +
      '<div class="chp-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" aria-label="Conversation"></div>' +
      '<form class="chp-ask" autocomplete="off"><label class="chp-sr" for="chp-q">Ask a question</label>' +
      '<input id="chp-q" name="q" type="text" maxlength="300" placeholder="Ask a question…" enterkeyhint="send">' +
      '<button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></form>' +
      '<p class="chp-foot">To improve answers, we keep questions without names for 30 days. Please don\'t share health details. <a href="https://healthcarecrownacademy.co.uk/privacy" target="_blank" rel="noopener">Privacy</a></p>';
    root.appendChild(btn); root.appendChild(panel);
    D.body.appendChild(root);
    ui = { root: root, btn: btn, panel: panel, log: panel.querySelector('.chp-log'), form: panel.querySelector('.chp-ask'), q: panel.querySelector('#chp-q') };
    btn.addEventListener('click', function () { panel.hidden ? open() : close(); });
    panel.querySelector('.chp-close').addEventListener('click', close);
    panel.querySelector('.chp-email-top').addEventListener('click', function () { emailCard('', ''); });
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
    ui.form.addEventListener('submit', function (e) {
      e.preventDefault(); if (thinking) return; var q = ui.q.value.trim(); if (!q) return; ui.q.value = ''; ask(q);
    });
    return ui;
  }
  function scrollEnd() { ui.log.scrollTop = ui.log.scrollHeight; }
  function you(text) { var m = el('div', 'chp-msg chp-you'); m.textContent = text; ui.log.appendChild(m); remember('you', text); scrollEnd(); }
  function say(markdown, opts) {
    opts = opts || {};
    var m = el('div', 'chp-msg chp-bot' + (opts.cls ? ' ' + opts.cls : ''));
    m.innerHTML = md(markdown);
    ui.log.appendChild(m);
    remember('help', markdown.replace(/\*\*/g, ''));
    if (opts.buttons && opts.buttons.length) actions(opts.buttons, m);
    scrollEnd();
    return m;
  }
  function actions(list, after) {
    var row = el('div', 'chp-actions');
    list.forEach(function (b) {
      var label = typeof b === 'string' ? b : b.label;
      var dest = typeof b === 'string' ? (data.buttons[label] || { ask: label }) : b;
      var a;
      if (dest.url) {
        a = el('a', 'chp-chip', label); a.href = dest.url;
        if (!sameSite(dest.url)) { a.target = '_blank'; a.rel = 'noopener'; }
      } else {
        a = el('button', 'chp-chip' + (dest.email != null ? ' chp-chip-email' : ''), label); a.type = 'button';
        a.addEventListener('click', function () { run(label, dest); });
      }
      row.appendChild(a);
    });
    (after && after.parentNode ? after.parentNode : ui.log).appendChild(row);
    scrollEnd();
  }
  function sameSite(u) { try { var h = new URL(u, location.href).hostname; return h === location.hostname; } catch (e) { return true; } }
  function run(label, dest) {
    if (dest.ask) { ask(dest.ask); return; }
    if (dest.intent) { you(label); load().then(function () { var it = intent(dest.intent); think(Math.min(3000, 1400 + (it.answer || '').length * 2.2), function () { show(it, label); }); }); return; }
    if (dest.pick) { you(label); think(1600, function () { say(data.picks[dest.pick]); }); return; }
    if (dest.email != null) { emailCard(dest.email, lastQuestion()); return; }
    if (dest.act === 'resolved') { you(label); say('Glad that\'s sorted. Anything else I can help with?'); log('helpful'); return; }
    if (dest.act === 'serein-help') {
      var b = D.querySelector('[data-v5="help"]');
      if (APP === 'serein' && b) { close(); b.click(); }
      else window.open('https://serein.healthcarecrownacademy.co.uk/', '_blank', 'noopener');
    }
  }
  function lastQuestion() { for (var i = convo.length - 1; i >= 0; i--) if (convo[i].who === 'you') return convo[i].text; return ''; }
  function feedback(it, q, msg) {
    var row = el('div', 'chp-feedback');
    row.innerHTML = '<span>Did this help?</span>';
    var yes = el('button', '', 'Yes'), no = el('button', '', 'No');
    yes.type = no.type = 'button';
    yes.setAttribute('aria-label', 'Yes, this helped'); no.setAttribute('aria-label', 'No, this did not help');
    yes.addEventListener('click', function () { row.textContent = 'Thanks for letting us know.'; log('helpful', it.id); });
    no.addEventListener('click', function () {
      row.remove(); log('unhelpful', it.id, q); frustration++;
      say('Sorry that didn\'t help. You can ask another way, or our team can answer this properly by email.', { buttons: [{ label: 'Email our team', email: it.topic || '' }] });
    });
    row.appendChild(yes); row.appendChild(no);
    ui.log.appendChild(row);
    scrollEnd();
  }

  /* A short, visible "thinking" pause so answers feel considered, not instant.
     Crisis messages wait well under a second: they must never be held back. */
  var thinking = 0;
  function think(ms, fn) {
    thinking++; setBusy(true);
    var t = el('div', 'chp-msg chp-bot chp-typing');
    t.innerHTML = '<span class="chp-sr">Crown Help is thinking</span><i></i><i></i><i></i>';
    ui.log.appendChild(t); scrollEnd();
    setTimeout(function () {
      t.remove(); thinking = Math.max(0, thinking - 1);
      if (!ui.panel.hidden) fn();
      if (!thinking) setBusy(false);
    }, ms);
  }
  function setBusy(on) {
    ui.form.querySelector('button').disabled = on;
    ui.form.setAttribute('aria-busy', on ? 'true' : 'false');
  }
  function pause(q) {
    if (CRISIS.test(q)) return 500;
    var top = INDEX ? match(q)[0] : null;
    var len = top && top.it.answer ? top.it.answer.length : 200;
    return Math.min(3000, 1400 + len * 2.2 + Math.random() * 400);
  }
  function ask(q) {
    you(q);
    load().then(function () { think(pause(q), function () { respond(q); }); }).catch(function () {
      say('Sorry, I couldn\'t load my answers just now. Please email us at **' + EMAIL + '** and we\'ll reply ' + REPLY + '.', { buttons: [{ label: 'Email us', email: '' }] });
    });
  }
  function respond(q) {
    if (CRISIS.test(q)) {
      say(data.crisis, { cls: 'chp-crisis', buttons: [{ label: 'Open Get help in Serein', act: 'serein-help' }, { label: 'Start a grounding practice', url: 'https://serein.healthcarecrownacademy.co.uk/' }] });
      log('crisis');
      return;
    }
    if (CLINICAL.test(q) && !LEARNING.test(q)) { show(intent('X-01'), q); return; }
    var angry = ANGRY.test(q) || shouting(q);
    if (angry) frustration++;
    var ranked = match(q), top = ranked[0];
    if (angry && (frustration >= 1)) {
      var topic = BILLING.test(q) ? 'Billing and refunds' : 'Complaint';
      say('I\'m sorry this has been frustrating. I\'ll pass this straight to a person so it\'s sorted properly. We reply ' + REPLY + '.');
      emailCard(topic, q);
      log('handover', top && top.s >= THRESHOLD ? top.it.id : null);
      return;
    }
    if (!top || top.s < THRESHOLD) {
      misses++; log('miss', null, q);
      if (misses < 2) {
        var z90 = intent('Z-90');
        say(z90.answer, { buttons: z90.buttons });
      } else {
        say(intent('Z-91').answer);
        emailCard('', q);
      }
      return;
    }
    misses = 0;
    var close2 = top.exact || top.s >= 1.1 ? [] : ranked.slice(1, 3).filter(function (r) { return r.s >= THRESHOLD && r.s >= top.s * 0.93; });
    if (close2.length) {
      say('I want to give you the right answer. Which of these do you mean?', { buttons: [top].concat(close2).map(function (r) { return { label: r.it.title, intent: r.it.id }; }).concat([{ label: 'Something else', email: '' }]) });
      log('answer', 'ambiguous');
      return;
    }
    show(top.it, q);
  }
  function show(it, q) {
    var msg = say(answerOf(it), { buttons: it.buttons });
    log('answer', it.id);
    if (it.route === 'email') {
      emailCard(it.topic || '', q);
    } else {
      if (it.route === 'offer' && !(it.buttons || []).some(function (b) { return data.buttons[b] && data.buttons[b].email != null; })) {
        actions([{ label: 'Email us', email: it.topic || '' }]);
      }
      feedback(it, q, msg);
    }
    if (frustration >= 2) { say('If this still isn\'t sorted, a person can help.'); emailCard(it.topic || '', q); frustration = 0; }
  }

  /* ---------- email handover ---------- */
  function ref() {
    var d = new Date(), pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return 'HCA-' + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + String(Math.floor(1000 + Math.random() * 9000));
  }
  function device() {
    var ua = navigator.userAgent;
    var b = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Other browser';
    var o = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Other';
    return b + ' on ' + o + ', screen ' + screen.width + '×' + screen.height;
  }
  var APPNAME = { site: 'Website', medlex: 'MedLex', lumen: 'Lumen', carecraft: 'Carecraft', serein: 'Serein', gulf: 'Gulf Region Nursing', evinca: 'Evinca', lss: 'Green Belt' };
  function emailCard(topic, question) {
    build();
    if (ui.panel.hidden) open(true);
    var topics = data ? data.topics : ['Other'];
    var id = 'chp-e' + Math.random().toString(36).slice(2, 7);
    var prev = ui.log.querySelector('.chp-card');
    if (prev) prev.remove();
    var card = el('form', 'chp-card');
    card.setAttribute('aria-label', 'Email our team');
    card.innerHTML =
      '<button type="button" class="chp-card-x" aria-label="Close the email form"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
      '<h3>Email our team</h3><p>A person reads every message. We reply ' + REPLY + '.</p>' +
      '<label for="' + id + 't">Topic</label><select id="' + id + 't">' + topics.map(function (t) { return '<option' + (t === topic ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select>' +
      '<label for="' + id + 'm">Your message</label><textarea id="' + id + 'm" rows="4" maxlength="1500"></textarea>' +
      '<label class="chp-check"><input type="checkbox" id="' + id + 'c" checked> Include this conversation</label>' +
      '<div class="chp-card-actions"><button type="submit" class="chp-primary">Open my email app</button><button type="button" class="chp-copy">Copy our address</button><button type="button" class="chp-cancel">Cancel</button></div>' +
      '<p class="chp-small">Prefer to write yourself? <a href="mailto:' + EMAIL + '">' + EMAIL + '</a></p>';
    ui.log.appendChild(card);
    var ta = card.querySelector('textarea');
    ta.value = question || '';
    if (!topic) card.querySelector('select').value = 'Other';
    var dismiss = function () { card.remove(); ui.q.focus(); };
    card.querySelector('.chp-card-x').addEventListener('click', dismiss);
    card.querySelector('.chp-cancel').addEventListener('click', dismiss);
    card.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); dismiss(); } });
    card.querySelector('.chp-copy').addEventListener('click', function (e) {
      var b = e.currentTarget;
      (navigator.clipboard ? navigator.clipboard.writeText(EMAIL) : Promise.reject()).then(function () { b.textContent = 'Copied'; }, function () { b.textContent = EMAIL; });
    });
    card.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = card.querySelector('select').value, r = ref();
      var lines = [ta.value.trim() || '(Please write your message here.)', '', '—', 'Reference: ' + r, 'App: ' + APPNAME[APP] + ' (' + location.hostname + p + ')'];
      if (t === 'Something isn\'t working') lines.push('Device: ' + device());
      if (card.querySelector('input[type=checkbox]').checked && convo.length) {
        lines.push('', 'Conversation with Crown Help:');
        convo.slice(-12).forEach(function (c) { lines.push((c.who === 'you' ? 'Me: ' : 'Crown Help: ') + c.text.replace(/\s+/g, ' ').slice(0, 220)); });
      }
      var bodyText = lines.join('\n');
      if (bodyText.length > 1800) bodyText = bodyText.slice(0, 1800) + '…';
      var href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('[Crown Help] ' + t + ' — ' + r) + '&body=' + encodeURIComponent(bodyText);
      log('handover', t.slice(0, 16));
      location.href = href;
      card.replaceWith(say('Your email app should now open with everything filled in. Press **Send** there. Your reference is **' + r + '**, and we\'ll reply ' + REPLY + '.\n\nIf nothing opened, email **' + EMAIL + '** and quote your reference.'));
    });
    scrollEnd();
    setTimeout(function () { ta.focus(); }, 30);
  }

  /* ---------- open / close ---------- */
  var lastFocus = null;
  function open(silent) {
    build();
    lastFocus = D.activeElement;
    ui.panel.hidden = false; ui.btn.setAttribute('aria-expanded', 'true'); ui.root.classList.add('chp-open');
    if (!ui.started) {
      ui.started = true;
      var g = el('div', 'chp-msg chp-bot'); g.textContent = GREETING; ui.log.appendChild(g);
      var slot = el('div', 'chp-actions'); ui.log.appendChild(slot);
      load().then(function (d) {
        if (silent) { slot.remove(); return; }
        (d.chips[PAGE] || d.chips.home).forEach(function (c) {
          var x = el('button', 'chp-chip', c); x.type = 'button';
          x.addEventListener('click', function () { ask(c); });
          slot.appendChild(x);
        });
      })
        .catch(function () {});
    }
    if (!silent) setTimeout(function () { ui.q.focus(); }, 30);
    scrollEnd();
  }
  function close() {
    if (!ui) return;
    ui.panel.hidden = true; ui.btn.setAttribute('aria-expanded', 'false'); ui.root.classList.remove('chp-open');
    // Closing ends the chat: next time it opens fresh, like a new conversation.
    ui.log.textContent = ''; ui.started = false; convo = []; thinking = 0; setBusy(false); misses = 0; frustration = 0; ui.q.value = '';
    (lastFocus && lastFocus.focus ? lastFocus : ui.btn).focus();
  }

  function busy() {
    if (D.fullscreenElement) return true;
    var m = D.querySelectorAll('dialog[open], [aria-modal="true"], .hs-studio, .hcs-studio, #player:not([hidden]), .player.is-open');
    for (var i = 0; i < m.length; i++) { if (!ui.root.contains(m[i]) && m[i].getClientRects().length) return true; }
    return false;
  }
  function watch() {
    setInterval(function () { if (!ui) return; var b = busy() && ui.panel.hidden; ui.root.classList.toggle('chp-away', b); }, 700);
  }
  function init() { css(); build(); watch(); if (/[?#&]help\b/.test(location.search + location.hash)) open(); }
  window.CrownHelp = { open: function (q) { open(); if (q) ask(q); }, close: close, _match: function (q) { return load().then(function () { var r = match(q); return r.slice(0, 3).map(function (x, i) { return [x.it.id, +x.s.toFixed(3), i === 0 && (x.exact || x.s >= 1.1)]; }); }); }, _crisis: function (q) { return CRISIS.test(q); }, _clinical: function (q) { return CLINICAL.test(q) && !LEARNING.test(q); } };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();
