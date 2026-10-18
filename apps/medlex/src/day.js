/* MedLex shell + "My Day". Reads the numbers the app exposes (window.__medlexDay, set by the patched Today renderer)
   and swaps the rendered Today for the bento layout. The original markup stays in the DOM, hidden, as a no-JS fallback. */
(function () {
  'use strict';
  const S = window.HCAShell; if (!S) return;
  const { h, icon, esc } = S;
  const PARTS = window.MEDLEX_PARTS || {};

  /* ----- help menu: field guide + reference notes (moved out of the sidebar) ----- */
  function helpMenu() {
    const btn = document.querySelector('.hs-help-btn'); let pop = document.getElementById('hsHelpPop');
    if (pop) { pop.remove(); btn && btn.setAttribute('aria-expanded', 'false'); return; }
    pop = h('div', { id: 'hsHelpPop', class: 'hs-pop', role: 'menu' });
    pop.innerHTML = `<button role="menuitem" data-modern="help">${icon('compass')}<span><b>Help with this page</b><span class="sm">What you can do here</span></span></button>
      <button role="menuitem" data-welcome="open">${icon('help')}<span><b>How to use MedLex</b><span class="sm">Your interactive field guide</span></span></button>
      <button role="menuitem" data-action="sources">${icon('book')}<span><b>Reference &amp; learning notes</b><span class="sm">Sources and how content is made</span></span></button>
      <button role="menuitem" data-action="quickquiz">${icon('bolt')}<span><b>5-question break</b><span class="sm">A quick reset between tasks</span></span></button>`;
    document.body.append(pop); btn && btn.setAttribute('aria-expanded', 'true');
    const r = btn.getBoundingClientRect(); pop.style.top = (r.bottom + 8) + 'px'; pop.style.right = Math.max(8, innerWidth - r.right) + 'px';
    pop.querySelector('button').focus();
    const close = e => { if (e.type === 'keydown' ? e.key === 'Escape' : !pop.contains(e.target) && !btn.contains(e.target)) { pop.remove(); btn.setAttribute('aria-expanded', 'false'); document.removeEventListener('click', close, true); document.removeEventListener('keydown', close, true); if (e.type === 'keydown') btn.focus(); } else if (e.type === 'click' && pop.contains(e.target)) { setTimeout(() => { pop.remove(); btn.setAttribute('aria-expanded', 'false'); }, 0); document.removeEventListener('click', close, true); document.removeEventListener('keydown', close, true); } };
    setTimeout(() => { document.addEventListener('click', close, true); document.addEventListener('keydown', close, true); });
  }

  S.init({
    app: 'medlex', name: 'MedLex', dayName: 'My Day', home: '#today', help: helpMenu,
    sel: { side: '#sidebar', brand: '.brand', navs: ['nav'], top: '.topbar', crumbs: '.breadcrumb', search: '.search-trigger', theme: '#themeButton', moveRight: ['#themeButton', '#profileInitial'], tabs: '.bottom-nav', content: '.app-shell' },
    groups: [{ first: 'My Day', label: 'Start' }, { first: 'Learn', label: 'Study' }, { first: 'Progress', label: 'You' }],
    more: true, motionOff: '.reduced-motion,[data-motion=reduce]',
    streak: () => { const f = window.__medlexStreak; if (!f) return null; const n = f(); return { text: n, label: n ? `${n}-day streak` : 'Start a streak today' }; }
  });

  /* ----- 3D signature: peri | card | itis assemble into pericarditis ----- */
  const art = () => `<div class="ml-rig" role="img" aria-label="The word pericarditis, built from the parts peri, card and itis">
    <div class="ml-row">
      <div class="ml-tile ml-t1"><span>peri</span><i>around</i></div>
      <div class="ml-tile ml-t2"><span>card</span><i>heart</i></div>
      <div class="ml-tile ml-t3"><span>itis</span><i>inflammation</i></div>
    </div>
    <div class="ml-word"><span>pericarditis</span><i>inflammation around the heart</i></div>
    <i class="ml-spark ml-s1"></i><i class="ml-spark ml-s2"></i><i class="ml-spark ml-s3"></i>
  </div>`;

  /* ----- tap-to-decode word tile ----- */
  function decodeCard(D) {
    const w = D.word, parts = PARTS[w.id];
    const wrap = h('div', { class: 'ml-decode' });
    if (parts) {
      wrap.innerHTML = `<div class="ml-chips" role="group" aria-label="Parts of ${esc(w.term)}">${parts.map((p, i) => `<button type="button" class="ml-chip" data-i="${i}" aria-pressed="false" aria-label="${esc(p[0])}, ${esc(p[1] === 'p' ? 'prefix' : p[1] === 'r' ? 'root' : 'suffix')}. Tap to reveal its meaning"><b>${esc(p[0])}</b><span class="sm">tap</span></button>`).join('')}</div><p class="ml-def" aria-live="polite">Tap each part to decode <b>${esc(w.term)}</b>.</p>`;
      const chips = [...wrap.querySelectorAll('.ml-chip')], def = wrap.querySelector('.ml-def'), got = new Set();
      chips.forEach(c => c.addEventListener('click', () => {
        const i = +c.dataset.i; got.add(i); c.setAttribute('aria-pressed', 'true'); c.querySelector('.sm').textContent = parts[i][2]; c.classList.add('is-on');
        def.innerHTML = got.size === parts.length ? `<b>${esc(parts.map(p => p[2]).join(' + '))}</b> — ${esc(w.definition)}` : `${got.size} of ${parts.length} parts decoded.`;
      }));
    } else {
      wrap.innerHTML = `<button type="button" class="ml-chip ml-whole" aria-pressed="false"><b>${esc(w.term)}</b><span class="sm">tap to reveal</span></button><p class="ml-def" aria-live="polite">What does it mean?</p>`;
      const c = wrap.querySelector('.ml-chip'), def = wrap.querySelector('.ml-def');
      c.addEventListener('click', () => { c.setAttribute('aria-pressed', 'true'); c.classList.add('is-on'); c.querySelector('.sm').textContent = 'decoded'; def.textContent = w.definition; });
    }
    return wrap;
  }

  /* ----- getting started (dismissible) ----- */
  const GS_KEY = 'medlex.gs.dismissed';
  function gettingStarted(D) {
    if (S.store.get(GS_KEY) === '1') return null;
    const items = [
      { t: 'Decode a word', done: !!(S.store.get('medlex-hook-v1')), href: '#library' },
      { t: 'Finish a daily session', done: D.sessions > 0, act: 'daily' },
      { t: 'Open a module', done: D.mastered > 0, href: `#learn/module/${D.mod.id}/overview` },
      { t: 'Save a word to review', done: D.saved > 0, href: '#library' }
    ];
    if (items.every(i => i.done)) return null;
    const c = h('aside', { class: 'hs-card hs-check hs-c4 is-static', 'aria-label': 'Getting started' });
    c.innerHTML = `<button type="button" class="hs-x" aria-label="Dismiss getting started">${icon('x')}</button><p class="hs-eyebrow">Getting started</p><h3>Four small firsts</h3><ul>${items.map(i => `<li class="${i.done ? 'is-done' : ''}"><${i.href ? `a href="${i.href}"` : 'button type="button" data-modern="daily"'}><i class="ck"></i><span>${esc(i.t)}</span></${i.href ? 'a' : 'button'}></li>`).join('')}</ul>`;
    c.querySelector('.hs-x').addEventListener('click', () => { S.store.set(GS_KEY, '1'); c.remove(); });
    return c;
  }

  function atlasCard(D, wide) {
    const c = h('a', { class: 'hs-card hs-atlas ' + (wide ? 'hs-c12' : 'hs-c4'), href: '#infographics?topic=decode-1' });
    c.innerHTML = `<div class="hs-atlas-img" aria-hidden="true">${D.poster ? `<img src="${esc(D.poster)}" alt="" width="1086" height="1448" loading="lazy" decoding="async">` : ''}</div><div class="hs-atlas-body"><p class="hs-eyebrow">Visual Atlas</p><h3>See the words, then remember them.</h3><p>${D.guides} illustrated guides: decode, remember and orient yourself.</p><span class="hs-link"><span>Open the Atlas</span>${icon('arrow')}</span></div>`;
    return c;
  }

  function build(D) {
    const wh = S.when(), first = (D.name || '').trim().split(/\s+/)[0];
    const state = D.done ? 'done' : D.resume ? 'resume' : 'start';
    const h1 = { start: `Let’s decode <em>one word.</em>`, resume: `Pick up where <em>you left off.</em>`, done: `That’s today <em>done.</em>` }[state];
    const lead = { start: `${first ? first + ', your' : 'Your'} session is ready: ten short items, mixing new words with reviews.`, resume: `${first ? first + ', you’re' : 'You’re'} partway through. Finish when it suits you.`, done: `${first ? 'Lovely work, ' + first + '. ' : 'Lovely work. '}A bonus round keeps the words warm.` }[state];
    const primary = state === 'start' ? { label: 'Start session', onClick: () => document.getElementById('hsDailyProxy').click(), icon: 'play' } : state === 'resume' ? { label: `Resume ${D.resume.index}/${D.resume.total}`, onClick: () => document.getElementById('hsDailyProxy').click(), icon: 'play' } : { label: 'Done ✓', onClick: () => { }, arrow: false };
    const hero = {
      eyebrow: wh.eyebrow, h1, lead, primary,
      secondary: state === 'done' ? { label: 'Bonus round', onClick: () => document.getElementById('hsBonusProxy').click() } : { label: 'Explore course', href: '#learn', arrow: false },
      meta: [{ icon: 'clock', text: 'About 10 min' }, { icon: 'layers', text: '10 items' }, { icon: 'refresh', text: `${D.due} due` }],
      art: art()
    };
    const doneKeys = new Set(), wk = D.week.map((w, i) => ({ l: 'MTWTFSS'[(new Date(Date.now() - (6 - i) * 864e5).getDay() + 6) % 7], name: w.day, done: w.done, today: w.current }));
    const fresh = !D.minutes && !D.streak && !D.week.some(w => w.done);
    const progress = {
      eyebrow: 'Today’s goal', streak: D.streak > 0 ? D.streak : null, pct: D.pct / 100, main: fresh ? D.goal : D.minutes, sub: fresh ? 'min goal' : `of ${D.goal} min`,
      ringLabel: `${D.minutes} of ${D.goal} minutes today`, title: fresh ? 'Your first step today starts your streak' : D.pct >= 100 ? 'Goal reached. Lovely.' : 'Small sessions. Lasting connections.',
      empty: fresh ? 'Ten minutes is plenty. Rest is part of learning.' : null, text: `${D.week.filter(w => w.done).length} active ${D.week.filter(w => w.done).length === 1 ? 'day' : 'days'} this week. Rest is part of learning.`,
      week: wk, strip: [{ v: '26', l: 'modules' }, { v: '1,480', l: 'terms' }, { v: String(D.guides), l: 'guides' }]
    };
    const word = h('section', { class: 'hs-card hs-act hs-c4 is-static' });
    word.innerHTML = `<div class="hs-card-top"><span class="hs-tile">${icon('sparkle')}</span><p class="hs-eyebrow">Word of the day</p></div><h3>${esc(D.word.term)}</h3>`;
    word.append(decodeCard(D)); word.append(S.link({ label: 'Explore this word', href: '#library/term/' + D.word.id }));
    const due = { icon: 'refresh', eyebrow: 'Due reviews', title: D.due ? `${D.due} ${D.due === 1 ? 'word is' : 'words are'} ready` : 'You’re all caught up', body: D.due ? 'A few minutes now keeps them from slipping.' : 'Nothing is due. A quick meaning check is a nice extra.', cta: D.due ? { label: 'Review now', onClick: () => document.getElementById('hsDailyProxy').click() } : { label: 'Try a meaning check', onClick: () => document.getElementById('hsBonusProxy').click() } };
    const mod = { icon: 'book', eyebrow: 'Continue module', title: D.mod.title, body: D.mod.subtitle, progress: D.modPct, progressLabel: 'Module outcomes', sub: `${D.mastered} / ${D.modTotal} outcomes rated`, cta: { label: 'Continue module', href: `#learn/module/${D.mod.id}/overview` } };
    const day = S.day({
      hero, progress, actions: [due, mod],
      path: {
        eyebrow: 'Your path today', title: 'Three small steps', items: [
          { title: state === 'done' ? 'Daily session complete' : 'Daily session', sub: state === 'resume' ? `${D.resume.index} of ${D.resume.total} done` : '10 items · about 10 minutes', done: state === 'done', cta: state === 'done' ? null : { label: state === 'resume' ? 'Resume' : 'Start', onClick: () => document.getElementById('hsDailyProxy').click() } },
          { title: D.mod.title, sub: `Module outcomes ${D.mastered} / ${D.modTotal}`, cta: { label: 'Open', href: `#learn/module/${D.mod.id}/overview` } },
          D.draft ? { title: D.draft.title, sub: D.draft.edited ? 'Edited ' + D.draft.edited : 'Your draft is ready', cta: { label: 'Continue', href: D.draft.href } } : { title: 'Make your thinking visible', sub: 'A guided activity: write, verify and keep your work', cta: { label: 'Find one', href: `#learn/module/${D.mod.id}/activities` } }
        ]
      }
    });
    // insert word card as first action (after progress): grid order is hero, progress, [actions]; word goes before due
    const cards = day.querySelectorAll('.hs-act'); day.insertBefore(word, cards[0]);
    const gs = gettingStarted(D);
    const pathEl = day.querySelector('.hs-path');
    if (gs) { pathEl.after(gs); day.append(atlasCard(D, true)); } else pathEl.after(atlasCard(D, false));
    [...day.children].forEach((c, i) => c.style.setProperty('--i', i));
    // proxies keep the app's own handlers (delegated on document) in charge
    const px = h('div', { class: 'hs-proxy', hidden: '' }, `<button type="button" id="hsDailyProxy" data-modern="daily"></button><button type="button" id="hsBonusProxy" data-modern="mode" data-mode="meaning"></button>`);
    day.append(px);
    // pause-motion control from the original welcome line
    const pm = h('button', { class: 'ml-pause', 'data-welcome': 'motion', type: 'button', 'aria-pressed': 'false' }, 'Pause motion');
    day.querySelector('.hs-hero').append(pm);
    return day;
  }

  function mount() {
    const main = document.getElementById('main'); if (!main) return;
    const orig = main.querySelector('.today-experience:not([data-hs])'); const D = window.__medlexDay;
    if (!orig || !D) return;
    orig.dataset.hs = '1';
    try {
      D.modPct = Math.round(100 * D.mastered / Math.max(1, D.modTotal));
      const day = build(D);
      orig.classList.add('hs-orig'); orig.after(day);
      const paused = orig.classList.contains('today-still'); if (paused) day.classList.add('today-still');
      const pm = day.querySelector('.ml-pause'); if (pm) { pm.setAttribute('aria-pressed', String(paused)); pm.textContent = (D.reduced ? 'Reduced' : paused ? 'Play' : 'Pause') + ' motion'; if (D.reduced) pm.disabled = true; }
      S.animate(day); S.tilt(day.querySelector('.hs-hero'), 10);
      // keep the original's still-class in sync (the app toggles it on .today-experience)
      new MutationObserver(() => day.classList.toggle('today-still', orig.classList.contains('today-still'))).observe(orig, { attributes: true, attributeFilter: ['class'] });
    } catch (e) { orig.hidden = false; orig.classList.remove('hs-orig'); console.warn('My Day fallback', e); }
  }
  const watch = () => { const main = document.getElementById('main'); if (!main) return; new MutationObserver(mount).observe(main, { childList: true }); mount(); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', watch) : watch();
})();
