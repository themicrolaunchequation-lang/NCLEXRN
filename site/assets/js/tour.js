/* Healthcare Crown Academy: 30-second app tours.
   A short, captioned "movie" per app built from real screens of the app: a title card, screens with a slow
   camera move and a caption, a moment of numbers, and an end card. Plays in a dialog with progress segments,
   play/pause, previous/next, keyboard (Space, arrows, Esc) and tap-to-skip. Reduced motion: no camera move,
   gentle cross-fades only. Nothing loads until a tour is opened. */
(() => {
  'use strict';
  const IMG = '/assets/img/tour/';
  const T = {
    medlex: { name: 'MedLex', chip: 'M', color: '#3557D6', tag: 'Make sense of any medical word.', url: 'https://medlex.healthcarecrownacademy.co.uk/', cta: 'Open MedLex free', note: 'Free to start · Premium £2.99/month or with the Crown Pass', scenes: [
      ['shot', 'medlex-0', 'My Day', 'Ten minutes. Ten words. Every day.', 'A short daily session mixes new words with reviews, so your vocabulary grows without cramming.', [0.3, 0.35]],
      ['shot', 'medlex-2', 'Word parts', 'Learn the code, not a list.', '66 prefixes, 60 roots and 100 suffixes. Learn the parts once and decode thousands of words.', [0.55, 0.45]],
      ['shot', 'medlex-3', 'Library', 'Every term, taken apart.', 'See osteomyelitis as oste + o + myel + itis, hear it spoken and save it for review.', [0.75, 0.4]],
      ['stats', [[1480, 'medical terms'], [26, 'body-system modules'], [56, 'illustrated guides'], [8, 'ways to practise']]],
      ['shot', 'medlex-4', 'Visual Atlas', 'Big, beautiful explainers.', 'Illustrated guides you can enlarge and study page by page.', [0.45, 0.5]],
      ['shot', 'medlex-5', 'Practice', 'Real recall beats an hour of re-reading.', 'Decode it, build it, match pairs, explain simply, and more: practice that sticks.', [0.5, 0.6]],
    ] },
    carecraft: { name: 'Carecraft', chip: 'C', color: '#0F8A86', tag: 'One useful minute of practice a day.', url: 'https://carecraft.healthcarecrownacademy.co.uk/', cta: 'Open Carecraft free', note: 'Free to start · Premium £2.99/month or with the Crown Pass', scenes: [
      ['shot', 'carecraft-0', 'My Day', 'Your scenario is ready.', 'One moment from a working day. Think first, then compare your reasoning.', [0.3, 0.35]],
      ['shot', 'carecraft-s0', '60-second scenario', 'What would you say?', 'Realistic, fictional moments: handovers, feedback and safety, with the reasoning explained.', [0.2, 0.45]],
      ['stats', [[30, 'short lessons'], [90, 'visual guides'], [22, 'practice activities'], [18, 'toolkit job-aids']]],
      ['shot', 'carecraft-1', 'Learn', 'Thirty lessons for the work you do.', 'Frameworks, scenarios, checklists and visual guides, from foundation to advanced.', [0.5, 0.35]],
      ['shot', 'carecraft-2', 'Practice', 'Rehearse the conversations that matter.', 'Communicate, escalate, hand over. Coverage shows the skills you have practised.', [0.55, 0.45]],
      ['shot', 'carecraft-3', 'Toolkit', 'Help for the moments that matter.', 'SBAR and ISBAR handovers, huddles and debriefs, ready when you need them.', [0.45, 0.6]],
    ] },
    serein: { name: 'Serein', chip: 'S', color: '#2B735E', tag: 'A little room to breathe, between tasks.', url: 'https://serein.healthcarecrownacademy.co.uk/', cta: 'Open Serein free', note: 'Free for everyone, always', scenes: [
      ['shot', 'serein-0', 'My Day', 'Make room for you.', 'A two-minute pause between tasks. No streak to keep, nothing monitored.', [0.3, 0.35]],
      ['shot', 'serein-1', 'Library', 'Find what fits.', 'Breathing, grounding, movement and reflection, from one to five minutes.', [0.55, 0.3]],
      ['stats', [[15, 'short practices'], [12, 'illustrated guides'], [2, 'minutes is enough'], [0, 'things monitored']]],
      ['shot', 'serein-2', 'Toolkit', 'Small tools for real shifts.', 'Before a shift, between tasks, after a hard moment: pick the moment, get the tool.', [0.4, 0.4]],
      ['shot', 'serein-3', 'Visual Atlas', 'A clearer picture. A useful next step.', 'Richly illustrated guides for real working days.', [0.6, 0.55]],
    ] },
    lumen: { name: 'Lumen', chip: 'L', color: '#8B6CF0', tag: 'Turn your own notes into recall.', url: 'https://lumen.healthcarecrownacademy.co.uk/', cta: 'Open Lumen free', note: 'Free to start · Premium £4.99/month or with the Crown Pass', scenes: [
      ['shot', 'lumen-0', 'My Day', 'Bring in something to study.', 'Add a PDF or photos of your notes. Everything stays private on your device.', [0.3, 0.35]],
      ['shot', 'lumen-1', 'Library', 'Your library, your way.', 'Lecture notes, handouts and books in one calm reading space.', [0.45, 0.5]],
      ['stats', [[5, 'step learning loop'], [0, 'automatic uploads'], [20, 'card daily goal to start'], [6, 'practical study methods']]],
      ['shot', 'lumen-3', 'Methods', 'Small actions. Stronger connections.', 'Read, explain, recall, verify, return: a simple loop for learning that lasts.', [0.45, 0.45]],
      ['shot', 'lumen-2', 'Study studio', 'Start with one good question.', 'Make recall cards from what you highlight. Review timing adapts to how well you knew each one.', [0.55, 0.35]],
    ] },
    snle: { name: 'Gulf Nursing', chip: 'G', color: '#347A9A', tag: 'Your Gulf nursing licence, one safe decision at a time.', url: 'https://snle.healthcarecrownacademy.co.uk/', cta: 'Open the studio', note: 'US$25 a month or US$50 for 3 months, per exam', scenes: [
      ['shot', 'snle-0', 'Four exams, one studio', 'Saudi, Qatar, Dubai and Abu Dhabi.', 'Pick your regulator. Each exam keeps its own progress.', [0.3, 0.45]],
      ['shot', 'snle-6', 'Question Bank', 'Answer, then see the reasoning.', 'Every question explains the safest choice, a clinical pearl and the trap to avoid.', [0.75, 0.4]],
      ['stats', [[1297, 'clinically reviewed questions'], [67, 'clinical decision tools'], [350, 'dossier cases'], [4, 'Gulf exams']]],
      ['shot', 'snle-2', 'React & Interact', '67 clinical decision tools.', 'From ABCDE to the Four Ts, each with its own questions.', [0.55, 0.45]],
      ['shot', 'snle-3', 'Clinical Dossier', '35 specialty dossiers.', 'Practise the same reasoning inside a full clinical story.', [0.55, 0.5]],
      ['shot', 'snle-4', 'Interactive Labs', 'Decode the question before you answer it.', 'Nine labs on how licensing questions are built, and how the safest answer wins.', [0.4, 0.4]],
    ] },
    evinca: { name: 'Evinca', chip: 'E', color: '#D4A445', tag: 'Your best work, recognised on evidence.', url: 'https://evinca.healthcarecrownacademy.co.uk/en', cta: 'Visit Evinca', note: 'Spotlight Stories are free', scenes: [
      ['shot', 'evinca-0', 'Evinca', 'Somebody made care better today.', 'An independent, evidence-reviewed recognition programme for everyone in healthcare.', [0.35, 0.4]],
      ['shot', 'evinca-2', 'Spotlight', 'Share your story, free.', 'Tell the story of what you achieved. Verify it when you are ready.', [0.3, 0.45]],
      ['stats', [[0, 'cost to share a story'], [4, 'review steps, in public'], [3, 'Verified Spotlights per theme a month, at most'], [1, 'record anyone can check']]],
      ['shot', 'evinca-1', 'How we review', 'Judged on evidence, in public.', 'Published criteria, independent human review, conflict controls and a record anyone can check.', [0.4, 0.45]],
      ['shot', 'evinca-3', 'Honors 2027', 'The 2027 healthcare awards.', 'Open to nurses, midwives, physicians, pharmacists, allied health professionals, educators and leaders.', [0.35, 0.45]],
    ] },
    lss: { name: 'LSS Toolkit', chip: 'LSS', color: '#1F9D74', tag: 'Lean Six Sigma, built for healthcare.', url: 'https://lss.healthcarecrownacademy.co.uk/', cta: 'Open the LSS Toolkit', note: 'Free to try · US$99 for 12 months, paid once', scenes: [
      ['shot', '/assets/img/apps/lss-desktop.webp', 'DMAIC', 'Define. Measure. Analyze. Improve. Control.', 'Every stage of an improvement project, with the tools to run it, explained for healthcare.', [0.4, 0.4]],
      ['stats', [[30, 'DMAIC tools'], [9, 'live statistical engines'], [10, 'simulations'], [1, 'Certificate of Completion']]],
      ['shot', '/assets/img/apps/lss-desktop.webp', 'Lead the change', 'Fewer delays. Safer care. Proof it worked.', 'Turn a ward problem into a measured improvement your team can see.', [0.7, 0.6]],
    ] },
  };
  const DUR = { title: 3200, shot: 5200, stats: 4600, end: 0 };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const src = (f) => (f.startsWith('/') ? f : IMG + f + '.webp');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let dlg, stage, bars, playBtn, cap, state = null;

  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'tour';
    dlg.setAttribute('aria-label', 'App tour');
    dlg.innerHTML = `<div class="tour-in">
      <div class="tour-bars" role="group" aria-label="Tour chapters"></div>
      <div class="tour-stage" data-stage></div>
      <p class="tour-sr" aria-live="polite" data-cap></p>
      <div class="tour-ctl">
        <button type="button" class="tour-b" data-prev aria-label="Previous"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>
        <button type="button" class="tour-b tour-play" data-play aria-label="Pause"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="p-pause" d="M8 6v12M16 6v12"/><path class="p-play" d="M8 5l11 7-11 7z"/></svg></button>
        <button type="button" class="tour-b" data-next aria-label="Next"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>
        <span class="tour-name" data-name></span>
        <button type="button" class="tour-b tour-x" data-close aria-label="Close tour"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div></div>`;
    document.body.append(dlg);
    stage = dlg.querySelector('[data-stage]'); bars = dlg.querySelector('.tour-bars'); playBtn = dlg.querySelector('[data-play]'); cap = dlg.querySelector('[data-cap]');
    dlg.querySelector('[data-prev]').addEventListener('click', () => go(state.i - 1));
    dlg.querySelector('[data-next]').addEventListener('click', () => go(state.i + 1));
    dlg.querySelector('[data-close]').addEventListener('click', () => dlg.close());
    playBtn.addEventListener('click', () => toggle());
    dlg.addEventListener('close', stop);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', (e) => {
      if (!state) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(state.i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(state.i - 1); }
      else if (e.key === ' ' && !e.target.closest('a,button')) { e.preventDefault(); toggle(); }
    });
    // Tap the left or right third of the picture to step back or forward, like stories.
    stage.addEventListener('click', (e) => {
      if (e.target.closest('a,button')) return;
      const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      if (x < 0.3) go(state.i - 1); else if (x > 0.7) go(state.i + 1); else toggle();
    });
  }

  function sceneHTML(t, s) {
    const [kind] = s;
    if (kind === 'title') return `<div class="ts ts-title"><span class="ts-aura"></span><p class="ts-eye">A 30-second tour</p><span class="ts-chip">${esc(t.chip)}</span><h2 class="ts-h">${esc(t.name)}</h2><p class="ts-tag">${esc(t.tag)}</p></div>`;
    if (kind === 'shot') {
      const [, f, k, h, p, fc] = s;
      return `<div class="ts ts-shot" style="--fx:${fc[0] * 100}%;--fy:${fc[1] * 100}%"><div class="ts-win"><span class="ts-bar"><i></i><i></i><i></i></span><img src="${src(f)}" alt="" decoding="async"></div><div class="ts-cap"><p class="ts-k">${esc(k)}</p><h3>${esc(h)}</h3><p>${esc(p)}</p></div></div>`;
    }
    if (kind === 'stats') return `<div class="ts ts-stats"><span class="ts-aura"></span><p class="ts-eye">${esc(t.name)} in numbers</p><ul>${s[1].map(([n, l], i) => `<li style="--d:${i * 120}ms"><b data-n="${n}">${reduce.matches ? n.toLocaleString('en-GB') : '0'}</b><span>${esc(l)}</span></li>`).join('')}</ul></div>`;
    return `<div class="ts ts-end"><span class="ts-aura"></span><span class="ts-chip">${esc(t.chip)}</span><h2 class="ts-h">${esc(t.tag)}</h2><p class="ts-note">${esc(t.note)}</p><div class="ts-ctas"><a class="btn btn-gold btn-lg" href="${esc(t.url)}">${esc(t.cta)}</a><a class="btn btn-ghost btn-lg" href="/subscribe">See plans</a><button type="button" class="ts-replay" data-replay>Watch again</button></div></div>`;
  }
  const textOf = (s, t) => (s[0] === 'shot' ? `${s[2]}. ${s[3]} ${s[4]}` : s[0] === 'stats' ? s[1].map(([n, l]) => `${n.toLocaleString('en-GB')} ${l}`).join(', ') : s[0] === 'title' ? `${t.name}. ${t.tag}` : `${t.cta}. ${t.note}`);

  function count(el) {
    const n = +el.dataset.n, t0 = performance.now(), d = 1300;
    const f = (now) => { const k = Math.min(1, (now - t0) / d), v = Math.round(n * (1 - Math.pow(1 - k, 3))); el.textContent = v.toLocaleString('en-GB'); if (k < 1 && state) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }

  function go(i) {
    const s = state; if (!s) return;
    i = Math.max(0, Math.min(s.list.length - 1, i));
    s.i = i; s.elapsed = 0; s.t0 = performance.now();
    const sc = s.list[i];
    const olds = [...stage.children];
    olds.forEach((o) => { o.classList.remove('is-on'); o.classList.add('is-off'); setTimeout(() => o.remove(), 900); });
    stage.insertAdjacentHTML('beforeend', sceneHTML(s.t, sc));
    const el = stage.lastElementChild;
    requestAnimationFrame(() => requestAnimationFrame(() => { if (el.isConnected && !el.classList.contains('is-off')) el.classList.add('is-on'); }));
    el.querySelectorAll('[data-n]').forEach((b) => { if (!reduce.matches) setTimeout(() => count(b), 250); });
    const rp = el.querySelector('[data-replay]'); if (rp) rp.addEventListener('click', () => { go(0); play(true); });
    cap.textContent = textOf(sc, s.t);
    [...bars.children].forEach((b, k) => { b.classList.toggle('is-done', k < i); b.classList.toggle('is-now', k === i); b.style.setProperty('--p', k < i ? 1 : 0); b.setAttribute('aria-current', k === i ? 'step' : 'false'); });
    // Warm the next picture.
    const nx = s.list[i + 1]; if (nx && nx[0] === 'shot') { const im = new Image(); im.src = src(nx[1]); }
    if (sc[0] === 'end') play(false);
  }

  function frame(now) {
    const s = state; if (!s) return;
    if (s.playing) {
      const sc = s.list[s.i], dur = DUR[sc[0]];
      if (dur) {
        const p = Math.min(1, (s.elapsed + now - s.t0) / dur);
        const bar = bars.children[s.i]; if (bar) bar.style.setProperty('--p', p);
        if (p >= 1) go(s.i + 1);
      }
    }
    s.raf = requestAnimationFrame(frame);
  }
  function play(on) {
    const s = state; if (!s) return;
    if (on && s.list[s.i][0] === 'end') return;
    if (s.playing === on) return;
    if (on) s.t0 = performance.now(); else s.elapsed += performance.now() - s.t0;
    s.playing = on;
    dlg.classList.toggle('is-paused', !on);
    playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
  }
  const toggle = () => play(!state.playing);
  function stop() { if (state) cancelAnimationFrame(state.raf); state = null; stage.innerHTML = ''; if (stop.from) stop.from.focus?.({ preventScroll: true }); }

  function open(app, from) {
    const t = T[app]; if (!t) return false;
    if (!dlg) build();
    const list = [['title'], ...t.scenes, ['end']];
    bars.innerHTML = list.map((_, k) => `<button type="button" class="tour-seg" aria-label="Part ${k + 1} of ${list.length}"><i></i></button>`).join('');
    [...bars.children].forEach((b, k) => b.addEventListener('click', () => go(k)));
    dlg.style.setProperty('--tc', t.color);
    dlg.querySelector('[data-name]').textContent = t.name;
    stop.from = from || document.activeElement;
    state = { t, list, i: 0, playing: false, elapsed: 0, t0: 0, raf: 0 };
    stage.innerHTML = '';
    dlg.showModal();
    go(0); play(true);
    state.raf = requestAnimationFrame(frame);
    playBtn.focus({ preventScroll: true });
    return true;
  }

  window.HCATour = { open, has: (a) => !!T[a] };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tour]'); if (!b) return;
    e.preventDefault(); open(b.dataset.tour, b);
  });
})();
