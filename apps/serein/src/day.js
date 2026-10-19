/* Serein shell + "My Day". Loaded before the app: the patched today() asks SereinDay.render() for its markup.
   Motion here is deliberately slower and softer than in the other apps (see day.css). */
(function () {
  'use strict';
  const S = window.HCAShell; if (!S) return;
  const { icon, esc } = S;
  const pad = n => String(n).padStart(2, '0');

  const dayKeys = st => {
    const keys = new Set();
    for (const f of st.feedback || []) { const t = new Date(f.date); if (!isNaN(t)) keys.add(S.dayKey(t)); }
    for (const k of st.checkins || []) { const t = new Date(k.date); if (!isNaN(t)) keys.add(S.dayKey(t)); }
    return keys;
  };
  const weekCount = keys => S.week(keys).filter(w => w.done).length;
  const ringChip = n => { const r = 9, c = 2 * Math.PI * r; return `<svg class="sr-mini" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="${r}" fill="none" stroke="currentColor" stroke-opacity=".22" stroke-width="3"/><circle cx="12" cy="12" r="${r}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - n / 7)).toFixed(1)}" transform="rotate(-90 12 12)"/></svg><span>${n}/7</span>`; };

  /* shift-aware line, e.g. "Night shift · 03:10 — a 1-minute reset?" */
  function greeting(x) {
    const now = new Date(), clock = `${pad(now.getHours())}:${pad(now.getMinutes())}`, pref = x.store().preferences.shift, h = now.getHours();
    const night = pref === 'nights' || (pref !== 'days' && (h >= 22 || h < 5));
    if (night) return `Night shift · ${clock} — a 1-minute reset?`;
    return [`Before shift · ${clock} — three slow breaths to begin?`, `Between tasks · ${clock} — a small pause?`, `After a hard moment · ${clock} — you don’t have to carry it alone.`, `After shift · ${clock} — time to put the day down?`][x.state.moment] || `${clock} — a small pause?`;
  }
  const iconFor = p => p.breathFocus ? 'wind' : p.movement ? 'play' : /ground/i.test(p.category || p.id) ? 'compass' : 'heart';

  const orb = () => `<div class="sr-orb" role="img" aria-label="A softly glowing orb that swells as you breathe in for four seconds and settles over six"><i class="sr-halo"></i><i class="sr-ring sr-r1"></i><i class="sr-ring sr-r2"></i><i class="sr-core"></i><span class="sr-cue" aria-hidden="true"><b class="in">Breathe in</b><b class="out">…and let it go</b></span></div>`;

  function render(x) {
    const { c, state, D, A } = x, st = x.store(), wh = S.when();
    const budget = state.homeTime || st.preferences.time, ranked = c.advance.rank({ budget }), p0 = ranked[0] || null;
    const keys = dayKeys(st), nWeek = weekCount(keys), doneToday = keys.has(S.dayKey());
    const journey = A.journeys.find(j => { const n = (st.journeyProgress[j.id] || []).length; return n > 0 && n < j.steps.length; });
    const mode = doneToday ? 'done' : journey ? 'resume' : 'start';
    const n0 = p0 ? c.chooseDuration(p0, typeof state.homeTime === 'number' ? state.homeTime : st.preferences.time) : null;
    const h1 = { start: 'Make room <em>for you.</em>', resume: 'Pick up <em>at your pace.</em>', done: 'That counts. <em>Gently done.</em>' }[mode];
    const hero = {
      eyebrow: wh.eyebrow, h1, lead: greeting(x),
      primary: !p0 ? { label: 'Find a pause', attrs: { 'data-adv': 'finder' }, icon: 'play' }
        : mode === 'start' ? { label: 'Start my pause', icon: 'play', attrs: { 'data-practice': p0.id, 'data-duration': n0 || '' } }
        : mode === 'resume' ? { label: `Resume · ${(st.journeyProgress[journey.id] || []).length}/${journey.steps.length}`, icon: 'play', attrs: { 'data-adv': 'journey', 'data-id': journey.id } }
        : { label: 'Done ✓', arrow: false, attrs: { 'aria-disabled': 'true' } },
      secondary: { label: mode === 'done' ? 'Another pause' : 'Something else', attrs: { 'data-adv': 'finder' }, arrow: false },
      meta: p0 ? [{ icon: 'clock', text: c.durationLabel(n0) }, { icon: 'compass', text: p0.position }, { icon: 'wind', text: p0.breathFocus ? 'Breath focus' : 'No breath focus' }] : [],
      art: orb()
    };
    const fresh = !keys.size;
    const week = S.week(keys), helpful = (st.feedback || []).filter(f => f.result === 'Helpful' && Date.now() - Date.parse(f.date) < 7 * 864e5).length;
    const weekFb = (st.feedback || []).filter(f => Date.now() - Date.parse(f.date) < 7 * 864e5).length;
    const progress = {
      eyebrow: 'This week, gently', streak: null, pct: nWeek / 7, main: fresh ? '7' : nWeek, sub: fresh ? 'days, no rush' : `of 7 days`,
      ringLabel: fresh ? 'A gentle week ahead' : `${nWeek} of 7 days this week`,
      title: fresh ? 'Your first pause starts your week' : nWeek >= 4 ? 'A steady, kind week' : 'A little room, most days',
      empty: fresh ? 'One minute is enough. Nothing here is a score.' : null, text: 'No streaks. Just a gentle look at the week.',
      week, strip: [{ v: String(weekFb), l: 'pauses' }, { v: String(helpful), l: 'felt helpful' }, { v: String((st.checkins || []).filter(k => Date.now() - Date.parse(k.date) < 7 * 864e5).length), l: 'check-ins' }]
    };
    const chip = (attrs, label, pressed) => `<button type="button" ${attrs} aria-pressed="${pressed}">${esc(label)}</button>`;
    const bar = `<div class="sr-bar"><p class="hs-eyebrow">For this moment</p><div class="hs-seg" role="group" aria-label="Your working moment">${D.moments.map((m, i) => chip(`data-moment="${i}"`, m.title, state.moment === i)).join('')}</div><div class="hs-seg" role="group" aria-label="Time you have">${[[60, '1 min'], [120, '2 min'], [300, '5 min'], ['self', 'Self-paced']].map(([v, l]) => chip(`data-v5="home-time" data-value="${v}"`, l, String(v) === String(state.homeTime || st.preferences.time))).join('')}</div>${st.preferences.shift === 'rotating' ? `<div class="hs-seg" role="group" aria-label="This week">${['days', 'nights'].map(v => `<button type="button" data-v5="rotation" data-value="${v}">${v === 'days' ? 'Days' : 'Nights'}</button>`).join('')}</div>` : ''}</div>`;
    const cards = ranked.slice(1, 4).map(p => {
      const n = c.chooseDuration(p, typeof state.homeTime === 'number' ? state.homeTime : st.preferences.time);
      return { kind: 'act', icon: iconFor(p), eyebrow: p.category || 'Practice', title: esc(p.title), body: esc(p.desc), sub: `${c.durationLabel(n)} · ${p.position}`, cta: { label: 'Start', attrs: { 'data-practice': p.id, 'data-duration': n || '' } } };
    });
    const link = (attrs, k, t) => `<button type="button" class="sr-row" ${attrs}><span><small class="sr-k">${esc(k)}</small><b>${esc(t)}</b></span>${icon('arrow')}</button>`;
    const cont = journey ? link(`data-adv="journey" data-id="${esc(journey.id)}"`, 'Continue at your pace', journey.title) : st.routine.length ? link('data-nav="me/routine"', 'Your chosen sequence', 'Return to my routine') : st.savedPlans.length ? link('data-nav="toolkit"', 'Your saved plans', 'Return to a practical next step') : '';
    const path = `<section class="hs-card hs-path hs-c8 is-static" aria-labelledby="sr-ck"><div class="hs-card-top"><p class="hs-eyebrow">A quick check-in</p></div><h2 id="sr-ck">How are you arriving?</h2><p>Optional. One tap keeps it for this visit.</p>${c.moodButtons()}<div id="quick-checkin-actions" role="status"></div><div class="sr-rows">${cont}${link('data-nav="library/guides"', 'Guides', 'For real working days')}${link('data-nav="infographics"', 'Visual Atlas', 'Calm, illustrated guides')}</div></section>`;
    const q = c.quote();
    const side = q ? `<aside class="hs-card hs-quote hs-c4 is-static" aria-label="A thought for today">${q}<div class="sr-support"><p class="hs-eyebrow">Support is one tap away</p><p>If today is heavy, you do not have to carry it alone.</p><button type="button" class="hs-btn is-line" data-v5="help"><span>Get help now</span></button></div></aside>` : `<aside class="hs-card hs-c4 is-static"><p class="hs-eyebrow">A gentle reminder</p><h3>You belong in the care you give.</h3></aside>`;
    const items = [{ kind: 'raw', cls: 'hs-c12', html: bar }, ...cards, { kind: 'raw', el: raw(path) }, { kind: 'raw', el: raw(side) }];
    return S.day({ hero, progress, items, daily: { app: 'serein', done: doneToday } }).outerHTML;
  }
  const raw = html => { const w = document.createElement('div'); w.innerHTML = html; return w.firstElementChild; };

  /* Insights with nothing recorded yet: invite a first check-in instead of showing zeros */
  function insightsEmpty() {
    return `<section class="hs-card sr-invite is-static" aria-labelledby="sr-inv"><div class="sr-invite-art" aria-hidden="true"><i></i><i></i><i></i></div><div class="sr-invite-copy"><p class="hs-eyebrow">Insights</p><h2 id="sr-inv">Insights begin with one small check-in.</h2><p>There is nothing to look back on yet, and that is fine. One tap tells Serein how you are arriving; gentle patterns appear over time, only for you.</p><div class="sr-invite-actions"><button type="button" class="hs-btn is-jewel" data-action="checkin"><span>Make a small check-in</span>${icon('arrow')}</button><button type="button" class="hs-btn is-line" data-nav="today"><span>Choose a pause</span></button></div><p class="small-note">Personal awareness, not a health score or clinical assessment.</p></div></section>`;
  }
  globalThis.SereinDay = { render, insightsEmpty };

  S.init({
    app: 'serein', name: 'Serein', dayName: 'My Day', home: '#today',
    sel: { side: '#sidebar', brand: '.brand', navs: ['#desktop-nav'], top: '.topbar', crumbs: '.breadcrumb', search: '.search-launch', mbrand: '.mobile-brand', moveRight: ['[data-nav="me/settings"].icon-btn', '.global-help'], tabs: '#mobile-nav', content: '.workspace' },
    groups: [{ first: 'My Day', label: 'Start' }, { first: 'Library', label: 'Explore' }, { first: 'Me', label: 'You' }],
    motionOff: '.reduce-motion', tilt: 6,
    themeToggle: () => globalThis.Serein && Serein.themeToggle && Serein.themeToggle(),
    streak: () => { try { const st = Serein.stateRef && Serein.stateRef(); if (!st) return null; const n = weekCount(dayKeys(st)); if (!n) return null; return { html: ringChip(n), label: `${n} of 7 days this week` }; } catch { return null; } }
  });
  const start = () => S.watchDay('#main');
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
})();
