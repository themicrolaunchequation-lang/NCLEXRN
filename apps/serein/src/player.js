/* Serein guided practice: the player controller.
 * Sits on top of the existing practice engine (Serein.player.engine) and the player markup:
 *   - a voice guide with a scripted line for every step (src/player-voice.js), spoken by the best voice on the device
 *   - captions and an instruction timeline on the stage, and a step rail beside the step panel in text view
 *   - quick Voice / Music / Breath-sound controls on the player controls
 *   - 3D lungs for the breathing tide (src/lungs3d.js), synthesised breath sounds and soft music (src/player-audio.js)
 * It is driven by calls from updatePlayer (see the patches in build-web.mjs); nothing starts until a practice is playing. */
(function (g) {
  'use strict';
  const V = g.SereinVoice, A = g.SereinAudio;
  const doc = document;
  const $ = (s, r) => (r || doc).querySelector(s);
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'serein-player-v1';
  const canSpeak = !!(g.speechSynthesis && g.SpeechSynthesisUtterance);
  const canSound = !!(g.AudioContext || g.webkitAudioContext);

  /* ---- the person's choices (own key; voice choice and speed live in the app's preferences) ---- */
  const DEFAULTS = { voice: true, music: true, breath: true, musicVol: 0.55, breathVol: 0.6 };
  const prefs = Object.assign({}, DEFAULTS);
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { /* storage unavailable: defaults apply */ }
  function savePrefs() { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* ignore */ } }

  const appPrefs = () => { try { return g.Serein.store.model.preferences || {}; } catch { return {}; } };
  const app = () => g.Serein && g.Serein.app;
  const engine = () => g.Serein && g.Serein.player && g.Serein.player.engine;
  const toast = m => { try { g.Serein.ui.toast(m); } catch { /* ignore */ } };

  /* ---- voice ---- */
  const audio = A && A.engine;
  const narrator = V && new V.Narrator({
    getVoice: () => canSpeak ? V.pick(g.speechSynthesis.getVoices(), appPrefs().voiceURI) : null,
    getRate: () => appPrefs().voiceRate || 0.88,
    onSpeaking: on => { if (audio) audio.duck(on); },
    onUtter: item => { if (!item.single) { P.sub = item.text; paintCaption(); } },
    onFail: err => { if (err === 'not-allowed' && !P.warned) { P.warned = true; toast('Your browser blocked the voice. Tap Voice off and on to try again.'); } }
  });

  /* ---- state of the running practice ---- */
  const P = {
    engine: null, plan: null, mode: '', visit: null, introDone: false, outroDone: false, caption: '', phaseKey: '', counts: [], lastState: '', lastWall: 0, selfClock: 0,
    muted: false, dom: null, ui: {}, outroTimer: 0, musicOn: false, sig: '', warned: false, sub: '', subQ: [], subEnd: 0, lastCycle: -1
  };
  const eff = {
    get voice() { return prefs.voice && canSpeak && !P.muted; },
    get music() { return prefs.music && canSound && !P.muted; },
    get breath() { return prefs.breath && canSound && !P.muted; }
  };
  const isBreath = () => !!(P.plan && P.plan.kind === 'breath');
  const preview = () => { const a = app(); return !!(a && a.state && a.state.preview); };

  const kindOf = title => /out/i.test(title) ? 'out' : /hold/i.test(title) ? 'hold' : /rest/i.test(title) ? 'rest' : 'in';
  const fmt = n => { n = Math.max(0, Math.round(n)); return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0'); };
  const fmtShort = n => n < 60 ? Math.round(n) + 's' : fmt(n);

  /* ---- say something: caption always, voice when on ---- */
  /* The line for this moment: shown in full in the step panel (and read by screen readers). */
  function line(text) {
    if (!text) return;
    P.caption = text;
    paintCaption();
  }
  /* Say something: spoken when the voice is on, and always shown as subtitles on the stage, a sentence at a time. */
  function say(text, o) {
    if (!text || preview()) return;
    if (eff.voice && narrator && narrator.available) narrator.say(text, o);
    else queueSubs(V.splitSentences(text));
  }
  function queueSubs(parts) {
    const now = performance.now(), rate = appPrefs().voiceRate || 0.88;
    let t = Math.max(now, P.subEnd || 0);
    for (const p of parts) { const d = (V.speakSeconds(p.text, rate) + p.gap / 1000) * 1000; P.subQ.push({ text: p.text, start: t }); t += d; }
    P.subEnd = t;
    pumpSubs();
  }
  function pumpSubs() {
    if (!P.subQ.length) return;
    const now = performance.now(); let changed = false;
    while (P.subQ.length && P.subQ[0].start <= now) { P.sub = P.subQ.shift().text; changed = true; }
    if (changed) paintCaption();
  }
  function clearSubs() { P.subQ = []; P.subEnd = 0; }
  const firstSentence = t => { const m = String(t || '').match(/^[^.!?…]+[.!?…]?/); return m ? m[0].trim() : ''; };

  /* ---- plan & session lifecycle ---- */
  function modeKey(e) { return (e.relaxOnly ? 'r' : '') + (e.external ? 'x' : '') + (e.noHolds ? 'n' : ''); }
  function ensurePlan(e) {
    const key = modeKey(e);
    if (!P.plan || P.mode !== key) { P.plan = V.plan(e.practice, e); P.mode = key; P.visit = null; P.phaseKey = ''; P.counts = []; }
    return P.plan;
  }
  function begin(e) {
    P.engine = e; P.plan = null; P.mode = ''; P.visit = null; P.hadVisit = false; P.introDone = false; P.outroDone = false; P.phaseKey = ''; P.counts = [];
    P.lastState = ''; P.selfClock = 0; P.lastWall = 0; P.caption = ''; P.sub = ''; clearSubs(); P.musicOn = false; P.sig = '';
    const a = app();
    // A shared team presentation starts silent; the person can still switch sound on.
    P.muted = !!(a && a.state && a.state.present);
    if (narrator) narrator.cancel();
    clearTimeout(P.outroTimer);
    if (audio) audio.stopMusic(2.5);
    ensurePlan(e);
    const p = $('#player'); p.classList.add('sp-on'); p.dataset.spPractice = e.practice.id; p.dataset.spBreath = isBreath() ? '1' : '0';
    syncLegacy();
  }
  function syncLegacy() {
    const a = app(), box = $('#session-voice');
    if (box) box.checked = !!eff.voice;
    if (a && a.state) a.state.voice = false; // the old one-line speaker is replaced by the voice guide
  }
  function reset() {
    P.visit = null; P.introDone = false; P.outroDone = false; P.phaseKey = ''; P.counts = []; P.selfClock = 0; P.caption = ''; P.sub = ''; clearSubs(); P.musicOn = false;
    clearTimeout(P.outroTimer);
    if (narrator) narrator.cancel();
    if (audio) audio.stopMusic(1.2);
  }

  /* ---- main entry: called from updatePlayer on every tick and every forced refresh ---- */
  function update(s, force) { try { run(s, force); } catch (err) { fault(err); } }
  /* Whatever goes wrong here must never take the practice player down with it. */
  function fault(err) { if (!P.faulted) { P.faulted = true; try { console.warn('Serein guide:', err); } catch { /* ignore */ } } }
  function run(s, force) {
    const e = engine(); if (!e || !V) return;
    if (e !== P.engine) begin(e);
    const plan = ensurePlan(e);
    if (s.state === 'ready' && P.lastState && P.lastState !== 'ready') reset();
    ensureDom();
    if (P.synced !== e) { P.synced = e; syncToggles(); }
    const am = ambientOn(); if (am !== P.amb) { P.amb = am; if (audio) audio.setAmbient(am); }
    if (!P.visit && !isBreath()) { P.caption = ''; P.sub = ''; }
    if (!P.caption) P.caption = mainLine(s, plan);
    pumpSubs();
    renderTimeline(s, e);
    paintCaption();
    paintLabel(s, e);
    if (P.lungs) P.lungs.sync(s);
    if (!preview()) {
      if (s.state === 'playing') {
        if (P.lastState !== 'playing') onPlay(s, e);
        if (isBreath()) breathTick(s, e); else guideTick(s, e);
      } else if (P.lastState === 'playing' && s.state !== 'complete') onPause(s);
    }
    P.lastState = s.state;
  }
  function mainLine(s, plan) {
    if (s.state === 'complete') return s.cue;
    if (plan.kind === 'breath') return (plan.captions && plan.captions[kindOf((engine().phases()[s.index] || {}).title || '')]) || s.cue;
    const st = plan.steps[s.index];
    return st ? st.say : s.cue;
  }
  /* The caption the panel should show when a step changes (patched into updatePlayer). */
  function cue(s) { try { return cueLine(s); } catch (err) { fault(err); return s.cue; } }
  function cueLine(s) {
    const e = engine();
    if (!e || !V) return s.cue;
    if (e !== P.engine) begin(e);
    const plan = ensurePlan(e);
    if (s.state === 'complete') return s.cue;
    if (!isBreath() && P.visit && P.visit.index === s.index && P.caption) return P.caption;
    return mainLine(s, plan);
  }

  function onPlay(s, e) {
    const resumed = P.lastState === 'paused';
    // This runs inside the Begin tap, so the audio context is allowed to start here.
    if (audio && (eff.music || eff.breath)) {
      audio.unlock(); audio.setVolumes(prefs.musicVol, prefs.breathVol); audio.setAmbient(ambientOn());
      if (resumed && audio.ctx) audio.resume();
      if (eff.music && !P.musicOn) startMusic(s, e);
      if (resumed && P.musicOn && eff.music) audio.resume();
    }
    if (resumed) { P.resumeSay = true; if (P.visit) P.visit.resume = true; }
    // Self-paced practices have no clock of their own; this one drives the gentle reminders.
    clearInterval(P.selfTimer);
    if (e.practice.selfPaced) P.selfTimer = setInterval(() => { const x = engine(); if (x && x === P.engine && x.state === 'playing') update(x.snapshot()); else clearInterval(P.selfTimer); }, 250);
  }
  function onPause() {
    clearInterval(P.selfTimer);
    if (narrator) narrator.cancel();
    clearTimeout(P.outroTimer);
    if (audio && audio.ctx) audio.pause();
  }
  function ambientOn() { const sel = $('#ambient-sound'); return !!(sel && sel.value && sel.value !== 'off'); }
  function startMusic(s, e) {
    if (!audio || !eff.music) return;
    const o = { remaining: e.duration ? Math.max(0, e.duration - e.elapsed) : 0 };
    const ph = e.phases();
    if (e.practice.id === 'tide') { o.cycle = ph.map(x => x.seconds); const cyc = ph.reduce((a, x) => a + x.seconds, 0); o.cycleOffset = e.elapsed % cyc; }
    if (e.practice.id === 'box') { o.phaseSeconds = ph[0].seconds; o.phaseOffset = s.phaseElapsed; o.phaseIndex = s.index; }
    P.musicOn = audio.startMusic(e.practice.id, o);
    audio.setVolumes(prefs.musicVol, prefs.breathVol);
  }

  /* ---- the guide for step-by-step practices ---- */
  function stepSeconds(e) { return e.duration ? e.duration / e.phases().length : Infinity; }
  function guideTick(s, e) {
    const plan = P.plan, timed = !!e.duration, now = performance.now();
    const dt = P.lastWall ? clamp((now - P.lastWall) / 1000, 0, 0.4) : 0; P.lastWall = now;
    const idx = s.index, step = plan.steps[idx]; if (!step) return;
    const len = stepSeconds(e);
    let t;
    if (timed) t = s.phaseElapsed; else t = (P.selfClock += dt);
    let v = P.visit;
    if (!v || v.index !== idx || (timed && t < v.lastT - 2)) {
      if (!timed) { P.selfClock = 0; t = 0; }
      v = P.visit = { index: idx, spoken: new Set(), lastT: t, resume: false };
      const prompts = (step.prompts || []).map(p => ({ at: p.at != null ? p.at : p.f * len, text: p.text })).filter(p => !(step.minStep && len < step.minStep) && p.at <= len - 2.5);
      v.prompts = prompts;
      if (P.hadVisit) { if (narrator) narrator.cancel(); clearSubs(); }
      P.hadVisit = true;
      if (!P.introDone) { P.introDone = true; if (plan.intro) say(plan.intro); }
      // Joining a step part-way (a skip, a seek): pick up at the latest line that is already due.
      const past = prompts.map((p, i) => ({ at: p.at, text: p.text, i })).filter(p => p.at <= t - 0.3);
      if (past.length) {
        past.forEach(p => v.spoken.add(p.i));
        const last = past[past.length - 1];
        line(last.text);
        if (t - last.at < 5) say(last.text); else P.sub = firstSentence(last.text);
      } else {
        if (t <= 8) say(step.say); else P.sub = firstSentence(step.say);
        line(step.say);
      }
      return;
    }
    v.lastT = t;
    if (v.resume) { v.resume = false; if (P.resumeSay) { P.resumeSay = false; say(P.caption || step.say); } }
    for (let i = 0; i < v.prompts.length; i++) {
      const p = v.prompts[i];
      if (v.spoken.has(i) || t < p.at) continue;
      v.spoken.add(i);
      if (t - p.at < 7) { say(p.text); line(p.text); }
    }
  }

  /* ---- breath: counts, sounds, reminders ---- */
  function breathTick(s, e) {
    const plan = P.plan, ph = e.phases(), cyc = ph.reduce((a, x) => a + x.seconds, 0);
    const cycle = Math.floor(e.elapsed / cyc), key = cycle + ':' + s.index;
    const kind = kindOf(ph[s.index].title), secs = ph[s.index].seconds, t = s.phaseElapsed;
    if (key !== P.phaseKey) {
      const first = P.phaseKey === '';
      P.phaseKey = key; P.counts = [];
      const cap = (plan.captions && plan.captions[kind]) || s.cue;
      line(cap); P.sub = cap; paintCaption();
      if (first && !P.introDone) { P.introDone = true; say(plan.intro); }
      if (eff.breath && audio && audio.running) audio.breath(kind === 'hold' || kind === 'rest' ? 'hold' : kind, secs, t / secs);
      if (t < 1.2) planCounts(kind, secs, cycle, cyc, e);
    }
    if (P.counts.length && eff.voice) {
      while (P.counts.length && t >= P.counts[0].at) {
        const c = P.counts.shift();
        if (t - c.at > 1.4) continue;
        if (c.lead || !P.skipCounts) {
          if (c.lead && narrator.busy) { P.skipCounts = true; P.counts.length = 0; break; }
          if (c.lead) P.skipCounts = false;
          narrator.say(c.text, { single: !c.sentence, gap: 90 });
        }
      }
    }
  }
  function planCounts(kind, secs, cycle, cyc, e) {
    const plan = P.plan, ph = e.phases(), total = e.duration ? Math.ceil(e.duration / cyc) : 99;
    const counts = [];
    const finalCycle = e.duration && (e.duration - e.elapsed) <= cyc + 0.6 && total >= 4;
    P.skipCounts = false;
    if (kind === 'in' && finalCycle && P.lastCycle !== cycle) { P.lastCycle = cycle; counts.push({ at: 0.1, text: plan.last, lead: true, sentence: true }); }
    else if (cycle < 3) {
      V.countWords(kind, secs, cycle < 2).forEach((w, i) => counts.push({ at: i * 1 + (i ? 0.05 : 0), text: w, lead: i === 0 }));
    } else if (cycle < 6 || (kind === 'in' && cycle % 2 === 0)) {
      counts.push({ at: 0.05, text: V.countWords(kind, secs, false)[0], lead: true });
    }
    // a spoken reminder partway through a long out-breath
    const rem = (plan.reminders || []).find(r => r.cycle === cycle);
    if (rem && secs >= 4.5 && (kind === 'out' || (plan.id === 'box' && kind === 'rest'))) counts.push({ at: 1.3, text: rem.text, lead: false, sentence: true });
    P.counts = counts;
  }

  /* ---- finish: a soft bell, then the last words ---- */
  function complete() { try { finish(); } catch (err) { fault(err); } }
  function finish() {
    const e = engine(); if (!e || !V || P.outroDone) { return; }
    if (e !== P.engine) begin(e);
    P.outroDone = true;
    clearInterval(P.selfTimer);
    if (preview()) return;
    if (narrator) narrator.cancel();
    if (audio && audio.ctx) { audio.stopMusic(4); if (eff.music || eff.breath || eff.voice) audio.bell(); }
    if (eff.voice && P.plan) {
      clearTimeout(P.outroTimer);
      P.outroTimer = setTimeout(() => { if (eff.voice && engine() === e && e.state === 'complete') narrator.say(P.plan.outro); }, 1500);
    }
  }
  /* Silence the voice now (the old cancelVoice hook: pause, restart, exit, tab hidden). */
  function silence() {
    clearTimeout(P.outroTimer);
    P.counts = []; clearSubs();
    if (narrator) narrator.cancel(); else { try { g.speechSynthesis.cancel(); } catch { /* ignore */ } }
  }
  function closed() {
    clearInterval(P.selfTimer);
    silence();
    P.visit = null; P.hadVisit = false; P.introDone = false; P.outroDone = false; P.phaseKey = ''; P.counts = []; P.caption = ''; P.sub = ''; clearSubs(); P.musicOn = false; P.lastCycle = -1;
    if (audio) audio.shutdown(4);
    if (P.lungs) P.lungs.dispose();
    P.engine = null; P.lastState = '';
    const p = $('#player'); if (p) { p.classList.remove('sp-on'); }
  }

  /* ---- DOM: stage HUD, step rail, quick controls ---- */
  const ICON = {
    voice: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path class="sp-on-only" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/><path class="sp-off-only" d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
    music: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/><path class="sp-off-only" d="M3 3l18 18"/></svg>',
    breath: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/><path class="sp-off-only" d="M3 3l18 18"/></svg>'
  };
  function ensureDom() {
    if (P.dom && P.dom.stage.isConnected) return;
    const stage = $('#player-stage'), scroll = $('#player-scroll'), controls = $('.player-controls');
    if (!stage || !scroll || !controls) return;
    const hud = doc.createElement('div'); hud.id = 'sp-hud'; hud.className = 'sp-hud';
    hud.innerHTML = '<p class="sp-caption" id="sp-caption" aria-hidden="true"></p>'
      + '<p class="sp-now" id="sp-now" aria-hidden="true"></p><ol class="sp-timeline" id="sp-timeline" aria-label="Practice steps"></ol>'
      + '<div class="sp-meta" aria-hidden="true"><span id="sp-elapsed"></span><span class="sp-next" id="sp-next"></span><span id="sp-left"></span></div>';
    stage.appendChild(hud);
    const label = doc.createElement('div'); label.id = 'sp-breath-label'; label.className = 'sp-breath-label'; label.setAttribute('aria-hidden', 'true'); label.hidden = true;
    label.innerHTML = '<span class="sp-bl-word"></span><span class="sp-bl-dots" aria-hidden="true">…</span><span class="sp-bl-count"><b></b><i></i></span>';
    $('#orb-stage').appendChild(label);
    const rail = doc.createElement('aside'); rail.id = 'sp-rail'; rail.className = 'sp-rail'; rail.setAttribute('aria-label', 'Your steps');
    rail.innerHTML = '<p class="sp-rail-eyebrow">Your steps</p><ol class="sp-rail-list" id="sp-rail-list"></ol><p class="sp-rail-meta" id="sp-rail-meta"></p>';
    scroll.appendChild(rail);
    const tg = doc.createElement('div'); tg.className = 'sp-toggles'; tg.setAttribute('role', 'group'); tg.setAttribute('aria-label', 'Sound');
    const pill = (id, ic, name, extra, short) => '<span class="sp-pill" data-for="' + id + '"><button type="button" class="sp-toggle" id="' + id + '" aria-pressed="false">' + ICON[ic] + '<span class="sp-name"><span class="sp-full">' + name + '</span><span class="sp-short">' + (short || name) + '</span></span><span class="sp-state" aria-hidden="true">On</span></button>' + (extra || '') + '</span>';
    tg.innerHTML = (canSpeak ? pill('sp-voice', 'voice', 'Voice') : '')
      + (canSound ? pill('sp-music', 'music', 'Music', '<input type="range" class="sp-vol" id="sp-music-vol" min="0" max="1" step="0.05" aria-label="Music volume">') : '')
      + (canSound ? pill('sp-breath', 'breath', 'Breath sounds', '<input type="range" class="sp-vol" id="sp-breath-vol" min="0" max="1" step="0.05" aria-label="Breath sound volume">', 'Breath') : '');
    controls.insertBefore(tg, $('.playback-row'));
    P.dom = { stage, hud, label, rail, tg, scroll };
    P.ui = { cap: $('#sp-caption'), next: $('#sp-next'), now: $('#sp-now'), tl: $('#sp-timeline'), el: $('#sp-elapsed'), left: $('#sp-left'), rl: $('#sp-rail-list'), rm: $('#sp-rail-meta') };
    if (g.ResizeObserver) new ResizeObserver(() => stage.style.setProperty('--sp-hud-h', hud.offsetHeight + 'px')).observe(hud);
    syncToggles();
  }

  function stepList(e) {
    const p = e.practice;
    if (p.breathFocus) return e.phases().map(x => ({ title: x.title, sec: x.seconds }));
    const ph = e.phases(), per = e.duration ? e.duration / ph.length : null;
    return p.steps.map(([title], i) => ({ title, sec: per }));
  }
  function stepButtons(list, e, cls) {
    const timed = !!e.duration;
    return list.map((x, i) => '<li style="--w:' + (x.sec || 1) + '"><button type="button" class="' + cls + '" data-player-step="' + i + '" data-i="' + i + '">'
      + '<span class="sp-fill" aria-hidden="true"></span><span class="sp-mark" aria-hidden="true"></span>'
      + '<span class="sp-text"><span class="sp-name">' + esc(x.title) + '</span>' + (timed && x.sec ? '<span class="sp-dur">' + fmtShort(x.sec) + '</span>' : '') + '</span>'
      + '<span class="sp-bar" aria-hidden="true"><i></i></span></button></li>').join('');
  }
  function renderTimeline(s, e) {
    const list = stepList(e), sig = e.practice.id + '|' + list.map(x => x.title + x.sec).join('|') + '|' + (e.duration || 'self');
    const cyclic = !!e.practice.breathFocus;
    if (sig !== P.sig) {
      P.sig = sig;
      P.ui.tl.innerHTML = stepButtons(list, e, 'sp-step');
      P.ui.rl.innerHTML = stepButtons(list, e, 'sp-step sp-rail-step');
      P.dom.hud.dataset.cyclic = cyclic ? '1' : '0'; P.dom.rail.dataset.cyclic = cyclic ? '1' : '0';
    }
    const done = s.state === 'complete';
    for (const root of [P.ui.tl, P.ui.rl]) {
      root.querySelectorAll('button').forEach((b, i) => {
        const cur = !done && i === s.index, past = done || i < s.index;
        const state = cur ? 'current' : past ? 'done' : 'next';
        if (b.dataset.state !== state) {
          b.dataset.state = state;
          if (cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
          const x = list[i], timed = e.duration && x.sec;
          b.setAttribute('aria-label', (cyclic ? 'Phase ' : 'Step ') + (i + 1) + ' of ' + list.length + ': ' + x.title + (timed ? ', ' + fmtShort(x.sec) : '') + (past && !cyclic ? ', done' : cur ? ', current' : ''));
          b.querySelector('.sp-mark').textContent = past && !cyclic ? '✓' : String(i + 1);
        }
        const pr = cur ? (e.duration || cyclic ? clamp(s.progress, 0, 1) : 0.0) : past ? 1 : 0;
        const q = pr.toFixed(3);
        if (b.dataset.p !== q) { b.dataset.p = q; b.style.setProperty('--p', q); }
      });
    }
    // labels: what comes next, and how long is left
    const nextTitle = !done && s.index + 1 < list.length ? list[s.index + 1].title : (!done && cyclic ? list[0].title : '');
    const nextText = done ? '' : nextTitle ? 'Next: ' + nextTitle : 'Next: finish';
    setText(P.ui.next, nextText);
    const cur = list[done ? list.length - 1 : s.index];
    setText(P.ui.now, done ? '' : (cyclic ? 'Phase ' : 'Step ') + (s.index + 1) + ' of ' + list.length + ' · ' + cur.title + (cur.sec ? ' · ' + fmtShort(cur.sec) : ''));
    let elapsed, left, rail;
    if (e.duration) {
      elapsed = fmt(e.elapsed) + ' elapsed'; left = fmt(Math.max(0, e.duration - e.elapsed)) + ' left';
      if (cyclic) {
        const cyc = e.phases().reduce((a, x) => a + x.seconds, 0), n = Math.ceil(e.duration / cyc);
        elapsed = 'Breath ' + Math.min(n, Math.floor(e.elapsed / cyc) + 1) + ' of ' + n;
      }
      rail = elapsed + ' · ' + left;
    } else { elapsed = 'Step ' + (done ? list.length : s.index + 1) + ' of ' + list.length; left = 'At your own pace'; rail = left + ' · no timer'; }
    setText(P.ui.el, elapsed); setText(P.ui.left, left); setText(P.ui.rm, rail);
  }
  function setText(el, t) { if (el && el.textContent !== t) el.textContent = t; }
  function paintCaption() {
    if (!P.ui.cap) return;
    const t = P.caption || '';
    setText(P.ui.cap, P.sub || firstSentence(t));
    const cue = $('#player-cue');
    if (cue && t && !(P.engine && P.engine.state === 'complete') && cue.textContent !== t) cue.textContent = t;
  }
  function paintLabel(s, e) {
    const L = P.dom && P.dom.label; if (!L) return;
    const show = e.practice.id === 'tide' && s.state !== 'complete';
    L.hidden = !show; if (!show) return;
    const ph = e.phases()[s.index], word = $('.sp-bl-word', L), cnt = $('.sp-bl-count', L);
    const w = s.state === 'ready' ? 'Ready when you are' : s.state === 'paused' ? 'Paused' : ph.title;
    setText(word, w);
    L.dataset.state = s.state; L.dataset.kind = kindOf(ph.title);
    const dots = $('.sp-bl-dots', L);
    const live = s.state === 'playing' || s.state === 'paused';
    dots.hidden = !live; cnt.hidden = !live;
    if (live) { setText(cnt.firstChild, String(clamp(Math.floor(s.phaseElapsed + 0.0001) + 1, 1, ph.seconds))); setText(cnt.lastChild, '/ ' + ph.seconds); }
  }

  /* ---- quick controls and settings ---- */
  function syncToggles() {
    const set = (id, on, label) => {
      const b = $('#' + id); if (!b) return;
      b.setAttribute('aria-pressed', String(!!on));
      b.parentElement.dataset.on = on ? '1' : '0';
      const st = b.querySelector('.sp-state'); if (st) st.textContent = on ? 'On' : 'Off';
      b.setAttribute('aria-label', label + (on ? ': on' : ': off'));
    };
    set('sp-voice', eff.voice, 'Voice guide');
    set('sp-music', eff.music, 'Music');
    set('sp-breath', eff.breath, 'Breath sounds');
    const breathing = isBreath(), bp = $('[data-for="sp-breath"]'); if (bp) bp.hidden = !breathing;
    const mv = $('#sp-music-vol'), bv = $('#sp-breath-vol'); if (mv) mv.value = String(prefs.musicVol); if (bv) bv.value = String(prefs.breathVol);
    const box = $('#session-voice'); if (box) box.checked = !!eff.voice;
    const sm = $('#sp-set-music'), sb = $('#sp-set-breath'); if (sm) sm.checked = prefs.music; if (sb) sb.checked = prefs.breath;
    const smv = $('#sp-set-music-vol'), sbv = $('#sp-set-breath-vol'); if (smv) smv.value = String(prefs.musicVol); if (sbv) sbv.value = String(prefs.breathVol);
  }
  function setVoice(on) {
    prefs.voice = !!on; P.muted = false; savePrefs(); syncToggles(); syncLegacy();
    const e = engine(); if (!e) return;
    if (!on) { silence(); return; }
    if (e.state === 'playing' && narrator) {
      // Switched on mid-practice: say the current line again so it is heard straight away.
      silence();
      const s = e.snapshot();
      if (isBreath()) { if (P.caption) narrator.say(P.caption); } else narrator.say(P.caption || mainLine(s, P.plan));
      clearSubs();
    }
  }
  function setMusic(on) {
    prefs.music = !!on; P.muted = false; savePrefs(); syncToggles();
    const e = engine(); if (!e || !audio) return;
    if (!on) { audio.stopMusic(1.5); P.musicOn = false; }
    else if (e.state === 'playing' && !preview()) { startMusic(e.snapshot(), e); }
  }
  function setBreath(on) { prefs.breath = !!on; P.muted = false; savePrefs(); syncToggles(); if (on && engine() && engine().state === 'playing' && audio) audio.unlock(); }

  function voiceOptions() {
    const list = canSpeak ? V.rank(g.speechSynthesis.getVoices()) : [];
    const want = appPrefs().voiceURI || '';
    const best = list[0];
    return { list, html: '<option value=""' + (want ? '' : ' selected') + '>Automatic' + (best ? ' · ' + esc(best.name) : '') + '</option>' + list.map(v => '<option value="' + esc(v.voiceURI) + '"' + (v.voiceURI === want ? ' selected' : '') + '>' + esc(v.name + ' · ' + v.lang) + '</option>').join('') };
  }
  /* The "Voice and sound" part of the comfort sheet (replaces the old device-options block). */
  function extras(c) {
    const vo = voiceOptions(), rate = (c.store.preferences.voiceRate || 0.88);
    let h = '<fieldset class="player-extra-options sp-sound"><legend>Voice and sound</legend>';
    if (canSpeak) {
      h += '<label class="field-label" for="voice-choice">Voice</label><select id="voice-choice" class="field">' + vo.html + '</select>'
        + '<label class="field-label" for="voice-rate">Voice speed</label><input id="voice-rate" type="range" min="0.6" max="1.2" step="0.05" value="' + rate + '">'
        + '<p class="small-note">Voices come from your device or browser. The best English voice is chosen for you, and a UK voice if there is one.</p>'
        + '<button type="button" class="button button-outline sp-sample" id="sp-voice-test">Hear a sample</button>';
    } else h += '<p class="small-note">This browser has no spoken voice. The written guidance stays on screen.</p>';
    if (canSound) {
      h += '<label class="check-label"><input type="checkbox" id="sp-set-music"' + (prefs.music ? ' checked' : '') + '>Soft music</label>'
        + '<label class="field-label" for="sp-set-music-vol">Music volume</label><input id="sp-set-music-vol" type="range" min="0" max="1" step="0.05" value="' + prefs.musicVol + '">'
        + '<label class="check-label"><input type="checkbox" id="sp-set-breath"' + (prefs.breath ? ' checked' : '') + '>Breath sounds · breathing practices only</label>'
        + '<label class="field-label" for="sp-set-breath-vol">Breath sound volume</label><input id="sp-set-breath-vol" type="range" min="0" max="1" step="0.05" value="' + prefs.breathVol + '">'
        + '<label class="field-label" for="ambient-sound">Ambient sound · off by default</label><select class="field" id="ambient-sound"><option value="off">Off</option><option value="rain">Rain</option><option value="ocean">Ocean</option><option value="hum">Hum</option></select>'
        + '<label class="field-label" for="ambient-volume">Ambient volume</label><input id="ambient-volume" type="range" min="0" max="0.25" step="0.01" value="0.06">';
    }
    if ('wakeLock' in navigator) h += '<label class="check-label"><input id="keep-awake" type="checkbox">Keep the screen awake while playing</label>';
    if ('vibrate' in navigator && /Android/i.test(navigator.userAgent)) h += '<label class="check-label"><input id="phase-haptics" type="checkbox">Brief vibration on phase changes</label>';
    h += '<button type="button" class="text-button" data-v5="shortcuts">Keyboard shortcuts</button></fieldset>';
    return h;
  }
  function refreshVoiceList() {
    const sel = $('#voice-choice'); if (!sel) return;
    sel.innerHTML = voiceOptions().html;
  }

  /* ---- events ---- */
  doc.addEventListener('click', ev => {
    const b = ev.target.closest && ev.target.closest('button'); if (!b) return;
    if (b.id === 'sp-voice') setVoice(!eff.voice);
    else if (b.id === 'sp-music') { setMusic(!eff.music); if (audio && eff.music) audio.unlock(); }
    else if (b.id === 'sp-breath') setBreath(!eff.breath);
    else if (b.id === 'sp-voice-test' && narrator) { silence(); narrator.say('Hello. This is how your voice guide will sound. Breathe in, gently.'); }
  });
  doc.addEventListener('input', ev => {
    const t = ev.target;
    if (t.id === 'sp-music-vol' || t.id === 'sp-set-music-vol') { prefs.musicVol = +t.value; savePrefs(); if (audio) audio.setVolumes(prefs.musicVol, null); syncToggles(); }
    else if (t.id === 'sp-breath-vol' || t.id === 'sp-set-breath-vol') { prefs.breathVol = +t.value; savePrefs(); if (audio) audio.setVolumes(null, prefs.breathVol); syncToggles(); }
    else if (t.id === 'ambient-sound' || t.id === 'ambient-volume') { if (audio) audio.setAmbient(ambientOn()); }
  });
  doc.addEventListener('change', ev => {
    const t = ev.target;
    if (t.id === 'session-voice') setVoice(t.checked);
    else if (t.id === 'sp-set-music') setMusic(t.checked);
    else if (t.id === 'sp-set-breath') setBreath(t.checked);
    else if (t.id === 'ambient-sound') { if (audio) audio.setAmbient(ambientOn()); }
    else if (t.id === 'voice-choice' || t.id === 'voice-rate') { /* stored by the app; picked up on the next line */ }
  });
  if (canSpeak && g.speechSynthesis.addEventListener) g.speechSynthesis.addEventListener('voiceschanged', refreshVoiceList);
  const player = $('#player');
  if (player) player.addEventListener('close', closed);

  /* "Keep this pause silent" from the practice finder: no voice, music or breath sounds for this session only. */
  function quiet() {
    P.muted = true; syncToggles(); syncLegacy(); silence();
    if (audio) audio.stopMusic(0.6);
    P.musicOn = false;
  }

  g.SereinPlayer = {
    update, complete, silence, cue, extras, closed, quiet,
    attachLungs(l) { P.lungs = l; },
    prefs, P, eff,
    debug() { return { prefs: Object.assign({}, prefs), caption: P.caption, plan: P.plan && P.plan.kind, muted: P.muted, musicOn: P.musicOn, counts: P.counts.length, audioState: audio && audio.ctx ? audio.ctx.state : 'none', busy: narrator ? narrator.busy : false }; }
  };
})(globalThis);
