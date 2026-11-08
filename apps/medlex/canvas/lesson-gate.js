/* MedLex paid lessons: hidden until the shared sign-in (crown-account.js) confirms a plan.
   Free lessons (basic word structure, building vocabulary, prefixes, suffixes) do not load this file. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('mx-checking');
  const css = document.createElement('style');
  css.textContent = 'html.mx-checking body>*:not(.mx-gate),html.mx-locked body>*:not(.mx-gate){visibility:hidden}' +
    '.mx-gate{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:16px;background:#0f1d33;font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#e8eef8}' +
    '.mx-gate>div{max-width:440px;width:100%;padding:28px;border-radius:20px;background:#16294a;border:1px solid rgba(160,190,240,.3);text-align:center}' +
    '.mx-gate small{display:block;margin-bottom:6px;color:#e8c170;font-weight:700;letter-spacing:.12em;font-size:11px}' +
    '.mx-gate h2{margin:0 0 8px;font:600 22px/1.3 Georgia,serif;color:#fff}.mx-gate p{margin:0 0 18px;color:#b9c8dc}' +
    '.mx-gate a,.mx-gate button{display:block;width:100%;margin:8px 0 0;padding:12px;border-radius:12px;font:600 15px/1.2 inherit;text-decoration:none;cursor:pointer;box-sizing:border-box}' +
    '.mx-gate .go{background:#e8c170;color:#0f1d33;border:0}.mx-gate .price{margin:-6px 0 16px;color:#e8eef8;font-size:14px}.mx-gate .alt{background:none;color:#e8eef8;border:1px solid rgba(160,190,240,.45)}';
  document.head.append(css);
  const gate = (title, lead, signedIn) => {
    const g = document.createElement('div');
    g.className = 'mx-gate'; g.setAttribute('role', 'dialog'); g.setAttribute('aria-modal', 'true'); g.setAttribute('aria-labelledby', 'mx-gate-h');
    g.innerHTML = '<div><small>MEDLEX PREMIUM</small><h2 id="mx-gate-h"></h2><p></p>' +
      (signedIn === 'offline' ? '' : '<p class="price">Crown Pass: every app from £5.99 a month or £39.99 a year. Cancel any time.</p>') +
      '<a class="go" href="https://healthcarecrownacademy.co.uk/subscribe?plan=medlex">Start 7-day free trial</a>' +
      (signedIn === true || signedIn === 'offline' ? '' : '<button type="button" class="alt" data-in>I already have a plan</button>') +
      '<a class="alt" href="https://medlex.healthcarecrownacademy.co.uk/">Open the free lessons</a></div>';
    g.querySelector('h2').textContent = title; g.querySelector('p').textContent = lead;
    g.addEventListener('click', (e) => { if (e.target.closest('[data-in]') && window.HCA) window.HCA.signIn(); });
    document.body.append(g); g.querySelector('.go').focus();
  };
  const decide = (ent) => {
    root.classList.remove('mx-checking');
    if (window.HCA && window.HCA.locked && !window.HCA.locked('medlex')) return; // has a plan: show the lesson
    root.classList.add('mx-locked');
    if (!navigator.onLine) gate('Connect to open this lesson', 'We check your plan online. Connect to the internet and reload this page.', 'offline');
    else gate((document.title.split(/ [·|] /)[0].trim() || 'This lesson') + ' is part of MedLex premium', 'The starter lessons are free: word structure, building vocabulary, prefixes and suffixes. Every other lesson comes with the Crown Pass.', !!(ent && ent.signed_in));
  };
  const start = () => {
    if (!window.HCA || !window.HCA.ready) return decide(null);
    Promise.race([window.HCA.ready, new Promise((r) => setTimeout(() => r(null), 10000))]).then(decide, () => decide(null));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
