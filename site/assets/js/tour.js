/* Healthcare Crown Academy: one-minute app tours (player).
   Data lives in tours-data.js. Each tour: a hook, a title card, 9-12 real screens of the app with a slow camera
   move and a caption, a moment of numbers, an end card. Every app has its own narrator (studio voices rendered
   in advance with the open Kokoro model), its own original music (made for these tours) and its own animated
   graphics: a floating 3D fishbone and live control chart for Lean Six Sigma, word parts snapping together for
   MedLex, a breathing circle for Serein, and so on. Transitions have soft sound effects.
   Controls: segments, play/pause, previous/next, sound (M), Space, arrows, Esc, tap left/right to skip.
   Reduced motion: no camera moves or floating graphics. Nothing loads until a tour is opened. */
(() => {
  'use strict';
  const T = window.HCA_TOURS || {};
  const IMG = '/assets/img/tour/', AUD = '/assets/audio/';
  const DUR = { hook: 4200, title: 2800, shot: 4200, stats: 4400, end: 0 };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } } };

  /* ---------- Sound: narrator, music bed and effects ---------- */
  const SND = (() => {
    const music = new Audio(); music.loop = true; music.preload = 'auto';
    const voice = new Audio(); voice.preload = 'auto';
    const fx = {}; ['whoosh', 'chime', 'tick', 'pop', 'rise'].forEach((n) => { fx[n] = null; });
    let on = true, fade = 0, level = 0.34;
    const ramp = (to, ms = 600) => {
      clearInterval(fade); const from = music.volume, t0 = performance.now();
      fade = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); music.volume = Math.max(0, Math.min(1, from + (to - from) * k)); if (k >= 1) clearInterval(fade); }, 30);
    };
    voice.addEventListener('play', () => on && ramp(level * 0.38, 350));
    voice.addEventListener('ended', () => on && ramp(level, 900));
    return {
      voice,
      set(v) { on = v; if (!v) { music.pause(); voice.pause(); } },
      start(track) { music.src = AUD + 'music/' + track + '.mp3'; music.volume = 0; if (on) { music.play().catch(() => {}); ramp(level, 1800); } },
      say(src, onend) {
        voice.onended = () => onend && onend(); voice.onerror = () => onend && onend();
        voice.src = src; if (!on) { onend && onend(); return; }
        voice.play().catch(() => onend && onend());
      },
      fx(name, vol = 0.45) { if (!on) return; const a = fx[name] || (fx[name] = new Audio(AUD + 'sfx/' + name + '.mp3')); try { const c = a.cloneNode(); c.volume = vol; c.play().catch(() => {}); } catch { /* ignore */ } },
      pause() { music.pause(); voice.pause(); },
      resume() { if (!on) return; music.play().catch(() => {}); if (voice.src && !voice.ended && voice.currentTime > 0) voice.play().catch(() => {}); },
      stop() { ramp(0, 500); setTimeout(() => { music.pause(); }, 520); voice.pause(); voice.removeAttribute('src'); },
    };
  })();

  /* ---------- Animated graphics, one family per app ---------- */
  const fishbone = (mini) => `<div class="mo mo-fish${mini ? ' is-mini' : ''}"><svg viewBox="0 0 320 170" aria-hidden="true">
      <path class="fb-spine" d="M20 85H250"/><rect class="fb-head" x="250" y="62" width="62" height="46" rx="10"/><text x="281" y="90" text-anchor="middle">Delay</text>
      ${[[60, 'People'], [130, 'Methods'], [200, 'Machines']].map(([x, l], i) => `<path class="fb-bone" style="--d:${i * 0.25}s" d="M${x} 30L${x + 40} 85"/><path class="fb-bone" style="--d:${i * 0.25 + 0.12}s" d="M${x} 140L${x + 40} 85"/><text class="fb-l" x="${x - 4}" y="22">${l}</text><text class="fb-l" x="${x - 4}" y="160">${['Materials', 'Measures', 'Setting'][i]}</text>`).join('')}
    </svg></div>`;
  const spc = (mini) => `<div class="mo mo-spc${mini ? ' is-mini' : ''}"><svg viewBox="0 0 320 150" aria-hidden="true">
      <path class="spc-lim" d="M10 30H310"/><path class="spc-lim" d="M10 120H310"/><path class="spc-cl" d="M10 75H310"/>
      <text class="spc-t" x="312" y="27">UCL</text><text class="spc-t" x="312" y="123">LCL</text>
      <polyline class="spc-line" points="15,80 45,66 75,88 105,71 135,92 165,62 195,79 225,22 255,84 285,70"/>
      ${[[15, 80], [45, 66], [75, 88], [105, 71], [135, 92], [165, 62], [195, 79], [225, 22], [255, 84], [285, 70]].map(([x, y], i) => `<circle class="spc-pt${y < 30 ? ' is-out' : ''}" cx="${x}" cy="${y}" r="${y < 30 ? 6 : 4}" style="--d:${0.3 + i * 0.14}s"/>`).join('')}
    </svg></div>`;
  const bell = () => `<div class="mo mo-bell"><svg viewBox="0 0 320 140" aria-hidden="true"><path class="bl-c" d="M10 130C80 130 110 20 160 20S240 130 310 130"/><path class="spc-lim" d="M60 10V135"/><path class="spc-lim" d="M260 10V135"/><text class="spc-t" x="160" y="138" text-anchor="middle">6σ</text></svg></div>`;
  const words = () => `<div class="mo mo-words"><span class="wp wp-1">tachy</span><span class="wp wp-2">card</span><span class="wp wp-3">ia</span><em class="wp-m">fast + heart + condition</em>${['hyper-', '-itis', 'neuro-', '-ectomy', 'brady-', 'derm-', '-ology', 'gastr-'].map((w, i) => `<i class="wf" style="--i:${i}">${w}</i>`).join('')}</div>`;
  const talk = () => `<div class="mo mo-talk"><span class="tb tb-1">How are you feeling about the handover?</span><span class="tb tb-2 is-me">Nobody was named for the review.</span><span class="tb tb-3">Let’s practise who will do it.</span><div class="sbar">${['S', 'B', 'A', 'R'].map((l, i) => `<b style="--i:${i}">${l}</b>`).join('')}</div></div>`;
  const breath = () => `<div class="mo mo-breath"><span class="br-c"></span><span class="br-c br-2"></span><em class="br-t"><span>Breathe in</span><span>Breathe out</span></em>${[0, 1, 2, 3, 4].map((i) => `<i class="lf" style="--i:${i}"></i>`).join('')}</div>`;
  const cards = () => `<div class="mo mo-cards">${['Which side of the heart supplies the pulmonary circulation?', 'What does tachy mean?', 'Name the first step of SBAR.'].map((q, i) => `<span class="fc" style="--i:${i}"><span class="fc-f">${q}</span><span class="fc-b">${['The right side', 'Fast', 'Situation'][i]}</span></span>`).join('')}<p class="hl">Recall beats <mark>re-reading</mark>.</p></div>`;
  const pulse = () => `<div class="mo mo-pulse"><svg viewBox="0 0 320 90" aria-hidden="true"><polyline class="ecg" points="0,50 60,50 75,50 85,20 95,80 105,42 115,50 175,50 190,50 200,22 210,78 220,44 230,50 320,50"/></svg>
      <div class="map">${[['Riyadh', 'SNLE', 18, 58], ['Doha', 'DHP', 66, 40], ['Dubai', 'DHA', 86, 46], ['Abu Dhabi', 'DOH', 78, 60]].map(([c, r, x, y], i) => `<span class="pin" style="--x:${x}%;--y:${y}%;--i:${i}"><i></i><b>${c}</b><small>${r}</small></span>`).join('')}</div>
      <p class="bil"><span lang="ar" dir="rtl">تمريض</span> · Nursing</p></div>`;
  const medal = () => `<div class="mo mo-medal"><span class="md"><span class="md-in">E</span></span><span class="md-r"></span><b class="stamp">Verified</b>${[0, 1, 2, 3, 4, 5].map((i) => `<i class="sp" style="--i:${i}"></i>`).join('')}</div>`;
  const MOTIF = {
    quality: { big: () => fishbone() + spc(), mini: (k) => [spc(true), fishbone(true), bell()][k % 3] },
    words: { big: words, mini: () => words() }, talk: { big: talk, mini: talk }, breath: { big: breath, mini: breath },
    cards: { big: cards, mini: cards }, pulse: { big: pulse, mini: pulse }, medal: { big: medal, mini: medal },
  };

  let dlg, stage, bars, playBtn, soundBtn, cap, state = null;
  let sound = store.get('hca-tour-sound') !== 'off';

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
        <button type="button" class="tour-b tour-snd" data-sound aria-pressed="true" aria-label="Sound on"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4z"/><path class="s-on" d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/><path class="s-off" d="M17 9l5 6M22 9l-5 6"/></svg></button>
        <span class="tour-name" data-name></span><span class="tour-voice" data-voice></span>
        <button type="button" class="tour-b tour-x" data-close aria-label="Close tour"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div></div>`;
    document.body.append(dlg);
    stage = dlg.querySelector('[data-stage]'); bars = dlg.querySelector('.tour-bars'); playBtn = dlg.querySelector('[data-play]'); soundBtn = dlg.querySelector('[data-sound]'); cap = dlg.querySelector('[data-cap]');
    dlg.querySelector('[data-prev]').addEventListener('click', () => go(state.i - 1));
    dlg.querySelector('[data-next]').addEventListener('click', () => go(state.i + 1));
    dlg.querySelector('[data-close]').addEventListener('click', () => dlg.close());
    playBtn.addEventListener('click', () => toggle());
    soundBtn.addEventListener('click', () => setSound(!sound));
    dlg.addEventListener('close', stop);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', (e) => {
      if (!state) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(state.i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(state.i - 1); }
      else if (e.key === 'm' || e.key === 'M') setSound(!sound);
      else if (e.key === ' ' && !e.target.closest('a,button')) { e.preventDefault(); toggle(); }
    });
    stage.addEventListener('click', (e) => {
      if (e.target.closest('a,button')) return;
      const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      if (x < 0.3) go(state.i - 1); else if (x > 0.7) go(state.i + 1); else toggle();
    });
  }

  function soundUI() { soundBtn.setAttribute('aria-pressed', String(sound)); soundBtn.setAttribute('aria-label', sound ? 'Sound on' : 'Sound off'); dlg.classList.toggle('is-muted', !sound); }
  function setSound(on) {
    sound = on; store.set('hca-tour-sound', on ? 'on' : 'off'); soundUI(); SND.set(on);
    if (!state) return;
    if (on) { SND.start(state.t.music); if (state.playing) narrate(); } else state.voiceDone = true;
  }

  const sayOf = (sc, t) => sc.k === 'hook' ? t.sayHook : sc.k === 'title' ? t.sayTitle : sc.k === 'end' ? t.sayEnd : sc.k === 'stats' ? sc.s[2] : sc.s[5];
  function narrate() {
    const s = state; if (!s) return;
    if (!sound) { s.voiceDone = true; return; }
    s.voiceDone = false; const i = s.i;
    SND.say(`${AUD}tour/${s.app}/${i}.mp3`, () => { if (state && state.i === i) state.voiceDone = true; });
  }

  function sceneHTML(t, sc, n) {
    const mo = MOTIF[t.motif] || MOTIF.medal;
    if (sc.k === 'hook') return `<div class="ts ts-hook"><div class="ts-mosaic">${t.bg.map((f, k) => `<img src="${IMG + f}.webp" alt="" style="--k:${k}">`).join('')}</div><span class="ts-veil"></span><div class="ts-motif">${mo.big()}</div><p class="ts-hk"><span>${t.hook[0].split(' ').map((w, i) => `<b style="--w:${i}">${esc(w)}</b>`).join(' ')}</span><em>${esc(t.hook[1])}</em></p></div>`;
    if (sc.k === 'title') return `<div class="ts ts-title"><span class="ts-aura"></span><p class="ts-eye">The one-minute tour</p><span class="ts-chip">${esc(t.chip)}</span><h2 class="ts-h">${esc(t.name)}</h2><p class="ts-tag">${esc(t.tag)}</p></div>`;
    if (sc.k === 'shot') {
      const [f, k, h, p, fc] = sc.s;
      return `<div class="ts ts-shot" style="--fx:${fc[0] * 100}%;--fy:${fc[1] * 100}%"><div class="ts-win"><span class="ts-bar"><i></i><i></i><i></i></span><img src="${IMG + f}.webp" alt="" decoding="async"></div><div class="ts-accent">${mo.mini(n)}</div><div class="ts-cap"><p class="ts-k">${esc(k)}</p><h3>${esc(h)}</h3><p>${esc(p)}</p></div></div>`;
    }
    if (sc.k === 'stats') return `<div class="ts ts-stats"><span class="ts-aura"></span><div class="ts-motif is-back">${mo.big()}</div><p class="ts-eye">${esc(t.name)} in numbers</p><ul>${sc.s[1].map(([v, l], i) => `<li style="--d:${i * 140}ms"><b data-n="${v}">${reduce.matches ? v.toLocaleString('en-GB') : '0'}</b><span>${esc(l)}</span></li>`).join('')}</ul></div>`;
    return `<div class="ts ts-end"><span class="ts-aura"></span><div class="ts-motif is-back">${mo.big()}</div><span class="ts-chip">${esc(t.chip)}</span><h2 class="ts-h">${esc(t.tag)}</h2><p class="ts-note">${esc(t.note)}</p><div class="ts-ctas"><a class="btn btn-gold btn-lg" href="${esc(t.url)}">${esc(t.cta)}</a><a class="btn btn-ghost btn-lg" href="/subscribe">See plans</a><button type="button" class="ts-replay" data-replay>Watch again</button></div></div>`;
  }

  function count(el) {
    const v = +el.dataset.n, t0 = performance.now(), d = 1400; let last = -1;
    const f = (now) => { const k = Math.min(1, (now - t0) / d), x = Math.round(v * (1 - Math.pow(1 - k, 3))); el.textContent = x.toLocaleString('en-GB'); if (k < 1 && state) requestAnimationFrame(f); else if (k >= 1) SND.fx('tick', 0.35); if (x !== last) last = x; };
    requestAnimationFrame(f);
  }

  function go(i) {
    const s = state; if (!s) return;
    i = Math.max(0, Math.min(s.list.length - 1, i));
    const prev = s.i; s.i = i; s.elapsed = 0; s.t0 = performance.now();
    const sc = s.list[i];
    [...stage.children].forEach((o) => { o.classList.remove('is-on'); o.classList.add('is-off'); setTimeout(() => o.remove(), 900); });
    stage.insertAdjacentHTML('beforeend', sceneHTML(s.t, sc, i));
    const el = stage.lastElementChild;
    requestAnimationFrame(() => requestAnimationFrame(() => { if (el.isConnected && !el.classList.contains('is-off')) el.classList.add('is-on'); }));
    el.querySelectorAll('[data-n]').forEach((b, k) => { if (!reduce.matches) setTimeout(() => { SND.fx('pop', 0.25); count(b); }, 250 + k * 140); });
    const rp = el.querySelector('[data-replay]'); if (rp) rp.addEventListener('click', () => { go(0); play(true); });
    cap.textContent = sayOf(sc, s.t);
    [...bars.children].forEach((b, k) => { b.classList.toggle('is-done', k < i); b.style.setProperty('--p', k < i ? 1 : 0); b.setAttribute('aria-current', k === i ? 'step' : 'false'); });
    if (prev !== -1 || i > 0) SND.fx(sc.k === 'shot' ? 'whoosh' : sc.k === 'end' ? 'chime' : sc.k === 'title' ? 'chime' : 'whoosh', sc.k === 'shot' ? 0.32 : 0.4);
    const nx = s.list[i + 1]; if (nx && nx.k === 'shot') { const im = new Image(); im.src = IMG + nx.s[0] + '.webp'; }
    if (nx) { const a = new Audio(); a.preload = 'auto'; a.src = `${AUD}tour/${s.app}/${i + 1}.mp3`; }
    if (s.playing) narrate(); else s.voiceDone = !sound;
    if (sc.k === 'end') play(false);
  }

  // A scene moves on when its time is up and its narration has finished (never longer than 15 seconds).
  function frame(now) {
    const s = state; if (!s) return;
    if (s.playing) {
      const sc = s.list[s.i], dur = DUR[sc.k];
      if (dur) {
        const spent = s.elapsed + now - s.t0, p = Math.min(1, spent / dur);
        const bar = bars.children[s.i]; if (bar) bar.style.setProperty('--p', p);
        if ((p >= 1 && s.voiceDone) || spent > 15000) go(s.i + 1);
      }
    }
    s.raf = requestAnimationFrame(frame);
  }
  function play(on) {
    const s = state; if (!s) return;
    if (on && s.list[s.i].k === 'end') return;
    if (s.playing === on) return;
    if (on) { s.t0 = performance.now(); SND.resume(); if (!s.voiceDone && sound && !(SND.voice.currentTime > 0 && !SND.voice.ended)) narrate(); }
    else { s.elapsed += performance.now() - s.t0; SND.pause(); }
    s.playing = on;
    dlg.classList.toggle('is-paused', !on);
    playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
  }
  const toggle = () => play(!state.playing);
  function stop() { SND.stop(); if (state) cancelAnimationFrame(state.raf); state = null; stage.innerHTML = ''; if (stop.from) stop.from.focus?.({ preventScroll: true }); }

  function open(app, from) {
    const t = T[app]; if (!t) return false;
    if (!dlg) build();
    const list = [{ k: 'hook' }, { k: 'title' }, ...t.scenes.map((s) => ({ k: s[0] === 'stats' ? 'stats' : 'shot', s })), { k: 'end' }];
    bars.innerHTML = list.map((_, k) => `<button type="button" class="tour-seg" aria-label="Part ${k + 1} of ${list.length}"><i></i></button>`).join('');
    [...bars.children].forEach((b, k) => b.addEventListener('click', () => go(k)));
    dlg.style.setProperty('--tc', t.color);
    dlg.dataset.motif = t.motif;
    dlg.querySelector('[data-name]').textContent = t.name;
    dlg.querySelector('[data-voice]').textContent = t.voice ? 'Narrated · ' + t.voice : '';
    stop.from = from || document.activeElement;
    state = { app, t, list, i: -1, playing: true, elapsed: 0, t0: 0, raf: 0, voiceDone: true };
    stage.innerHTML = '';
    dlg.showModal(); dlg.classList.remove('is-paused');
    soundUI(); SND.set(sound);
    if (sound) { SND.start(t.music); SND.fx('rise', 0.35); }
    go(0);
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
