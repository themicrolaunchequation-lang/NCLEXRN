/* Serein artwork: places the owner's illustrations by context. Runs after each render; every image is decorative, lazy and optional. */
(function (g) {
  'use strict';
  const d = document, BASE = (d.querySelector('link[rel=manifest]') || { getAttribute: () => '/serein/' }).getAttribute('href').replace(/manifest\.webmanifest.*$/, '') + 'art/';
  const PRACTICE = ['tide', 'box', 'ground', 'release', 'desk', 'scan', 'handreset', 'shoulderreset', 'ankles', 'listen', 'quietplace', 'walk', 'pause3', 'fullrelease', 'winddown'];
  const GUIDE = { boundaries: 'boundaries', 'difficult-talk': 'difficult-talk', 'manager-support': 'manager-support', 'peer-check': 'peer-check', priorities: 'priorities', 'small-win': 'small-win' };
  const JOURNEY = { 'Finding your pause': 'shift-start', 'Working with boundaries': 'week', 'Leaving the shift': 'shift-end' };
  const TK = { before: 'before-shift', between: 'between-tasks', hard: 'after-hard-moment', after: 'after-shift', talk: 'talking-to-others', week: 'this-week' };
  const $ = (s, r) => (r || d).querySelector(s), $$ = (s, r) => [...(r || d).querySelectorAll(s)];
  const url = (n, sm) => BASE + n + (sm ? '-sm' : '') + '.webp';
  const img = (n, cls, sm) => { const i = d.createElement('img'); i.className = 'sa-img ' + (cls || ''); i.src = url(n, sm); i.alt = ''; i.decoding = 'async'; i.loading = 'lazy'; i.onerror = () => i.remove(); return i; };
  const pic = (n, cls) => { const p = d.createElement('picture'); p.className = 'sa-pic ' + (cls || ''); const s = d.createElement('source'); s.media = '(max-width:700px)'; s.srcset = url(n, true); p.append(s, img(n, '', false)); return p; };
  const night = () => { const h = new Date().getHours(); return h >= 19 || h < 6; };
  const route = () => (location.hash || '#today').slice(1);
  const done = (el, k) => { if (el.dataset.sa === k) return false; el.dataset.sa = k; return true; };
  let lastPractice = '';
  d.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-practice-detail],[data-practice]'); if (b) lastPractice = b.dataset.practiceDetail || b.dataset.practice; }, true);

  function swap(card, name) { const i = $('.card-image img', card) || $(':scope > img', card); if (!i || !PRACTICE.concat(Object.values(GUIDE), ['shift-start', 'week', 'shift-end']).length) return; delete i.dataset.src; i.src = url(name); i.alt = ''; i.removeAttribute('width'); i.removeAttribute('height'); i.classList.add('sa-swapped'); }
  function run() {
    const r = route();
    $$('.practice-card [data-practice-detail]').forEach(b => { const c = b.closest('.practice-card'); if (PRACTICE.includes(b.dataset.practiceDetail) && done(c, 'p')) swap(c, 'practice-' + b.dataset.practiceDetail); });
    $$('.resource-card [data-resource]').forEach(b => { const n = GUIDE[b.dataset.resource], c = b.closest('.resource-card'); if (n && done(c, 'g')) swap(c, 'guide-' + n); });
    $$('.journey-card').forEach(c => { const n = JOURNEY[($('h2', c) || {}).textContent]; if (n && done(c, 'j')) { const i = $(':scope > img', c); if (i) { delete i.dataset.src; i.src = url('journey-' + n); i.alt = ''; i.classList.add('sa-swapped'); } } });
    $$('.hs-act').forEach(c => { const b = $('[data-practice]', c); if (b && PRACTICE.includes(b.dataset.practice) && done(c, 'a')) c.prepend(img('practice-' + b.dataset.practice, 'sa-act')); });
    const hero = $('.hs-hero-art'); if (hero && done(hero, 'h')) hero.prepend(pic(night() ? 'today-hero-night' : 'today-hero-day', 'sa-hero'));
    $$('#main [id^="tk-g-"]').forEach(s => { const n = TK[s.id.slice(5)]; if (n && done(s, 't')) s.prepend(img('toolkit-' + n, 'sa-tk')); });
    const lib = $('.library-heading'); if (lib && done(lib, 'l')) lib.before(pic('library-banner', 'sa-banner'));
    const atl = $('.infographic-heading'); if (atl && done(atl, 'v')) atl.before(pic('visual-atlas-banner', 'sa-banner'));
    const help = $('.help-now'); if (help && done(help, 's')) help.before(pic('support-banner', 'sa-banner'));
    const emp = $('#main .empty'); if (emp && done(emp, 'e')) { const n = /saved/.test(r) ? 'saved' : /journal/.test(r) ? 'journal' : ''; if (n) emp.prepend(img('empty-' + n, 'sa-empty')); }
    const rt = r === 'me/routine' && $('#main .workspace-tools'); if (rt && done(rt, 'r')) rt.before(img('empty-routine', 'sa-empty sa-lone'));
    const inv = $('#main .sr-invite-art'); if (inv && done(inv, 'i')) { inv.textContent = ''; inv.removeAttribute('aria-hidden'); inv.classList.add('sa-has'); inv.append(img('empty-insights', 'sa-empty')); }
    const pv = r === 'me/data' && $('#main .journal-panel'); if (pv && done(pv, 'pv')) pv.prepend(img('privacy-device', 'sa-priv'));
    const ob = $('#modal-content .onboarding-step'); if (ob) { const s = ob.dataset.step; const n = { 0: 'onboard-welcome', 1: 'onboard-setup', 2: 'privacy-device' }[s]; if (n && done(ob, 'o')) ob.prepend(img(n, 'sa-onb')); }
    const hk = $('dialog.serein-hook[data-step="breath"]'); if (hk && done(hk, 'hk')) hk.prepend(pic('hook-breath', 'sa-hook'));
    const art = $('#modal-content > .article-image'); if (art && done(art, 'm') && PRACTICE.includes(lastPractice)) { art.src = url('practice-' + lastPractice); art.alt = ''; }
  }
  let t = 0; const queue = () => { clearTimeout(t); t = setTimeout(run, 40); };
  new MutationObserver(queue).observe(d.documentElement, { childList: true, subtree: true });
  addEventListener('hashchange', queue); run();
  g.SereinArt = {
    complete(on) { const st = $('#player-stage'); if (!st) return; let a = $('.sa-done', st); if (on && !a) { a = d.createElement('div'); a.className = 'sa-done'; a.setAttribute('aria-hidden', 'true'); a.append(img('practice-complete')); st.prepend(a); } if (a) a.hidden = !on; }
  };
})(globalThis);
