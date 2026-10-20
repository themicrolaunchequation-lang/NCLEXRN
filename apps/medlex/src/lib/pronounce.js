/* MedLex Pronunciation Studio (#library/pronunciation): hear the model voice, record yourself, replay, compare.
   Audio is held in memory only: nothing is stored or uploaded, object URLs are revoked, and the microphone is released as soon as
   recording stops or the page changes. Needs the host to allow microphone=(self) and media-src blob: (site/vercel.json). */
(function () {
  'use strict';
  const L = window.MedlexLib; if (!L) return;
  const { esc, $, $$, words, wordById, sysName, header, tile, mount, canSpeak, views } = L;
  const MAX = 10;                                   /* auto-stop, seconds */
  const SVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
  const IC = {
    mic: SVG('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3M9 21h6'),
    stop: SVG('M7 7h10v10H7z'), play: SVG('M7 4l13 8-13 8z'), listen: SVG('M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13'),
    redo: SVG('M3 12a9 9 0 1 0 3-6.7M3 4v5h5'), lock: SVG('M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3'), swap: SVG('M4 8h13l-3-3M20 16H7l3 3'), trash: SVG('M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13')
  };

  /* ---------- state: everything here is in memory and cleared on leave ---------- */
  const P = { sel: '', st: 'idle', secs: 0, play: '', msg: '' };    /* st: idle | asking | recording | recorded | denied | nomic | unavailable */
  const R = { gen: 0, stream: null, rec: null, ctx: null, raf: 0, timer: 0, url: '', audio: null, chunks: [], t0: 0, speakT: 0, listening: false };
  const fmt = n => '0:' + String(Math.max(0, Math.min(MAX, Math.floor(n)))).padStart(2, '0');

  function releaseMic() {
    cancelAnimationFrame(R.raf); R.raf = 0; clearInterval(R.timer); R.timer = 0;
    if (R.stream) { R.stream.getTracks().forEach(t => { try { t.stop(); } catch { } }); R.stream = null; }
    if (R.ctx) { try { R.ctx.close(); } catch { } R.ctx = null; }
  }
  function dropAudio() {
    if (R.audio) { try { R.audio.pause(); R.audio.removeAttribute('src'); R.audio.load(); } catch { } R.audio = null; }
    if (R.url) { try { URL.revokeObjectURL(R.url); } catch { } R.url = ''; }
    R.chunks = [];
  }
  function stopSpeech() { clearTimeout(R.speakT); try { if (canSpeak()) speechSynthesis.cancel(); } catch { } }
  /* leave the page: stop everything, release the mic, forget the recording */
  function cleanup() {
    R.gen++; const rec = R.rec; R.rec = null;
    if (rec) { rec.onstop = null; rec.ondataavailable = null; try { if (rec.state !== 'inactive') rec.stop(); } catch { } }
    releaseMic(); stopSpeech(); dropAudio();
    removeEventListener('hashchange', onHash); removeEventListener('pagehide', cleanup); document.removeEventListener('visibilitychange', onVis);
    R.listening = false; P.st = 'idle'; P.play = ''; P.secs = 0;
  }
  const onHash = () => { if (!/^#library\/pronunciation/.test(location.hash)) cleanup(); };
  const onVis = () => { if (document.hidden && P.st === 'recording') stopRecording(); };

  /* ---------- speaking the model word ---------- */
  function say(text, rate, done) {
    let fin = false; const end = () => { if (fin) return; fin = true; clearTimeout(R.speakT); done && done(); };
    if (!canSpeak()) return end();
    try {
      const v = speechSynthesis.getVoices().filter(x => /^en\b/i.test(x.lang)); speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.voice = v.find(x => /^en-GB/i.test(x.lang)) || v[0] || null; u.rate = rate; u.onend = end; u.onerror = end;
      u.onstart = () => { clearTimeout(R.speakT); R.speakT = setTimeout(end, 8000); };   /* some browsers never fire onend */
      speechSynthesis.speak(u); R.speakT = setTimeout(end, 1500);                       /* no voice started: carry on */
    } catch { end(); }
  }

  /* ---------- recording ---------- */
  const mimeType = () => { try { return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(t => MediaRecorder.isTypeSupported(t)) || ''; } catch { return ''; } };
  function supported() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && typeof MediaRecorder !== 'undefined' && window.isSecureContext !== false); }
  async function startRecording() {
    stopPlayback(); stopSpeech(); dropAudio(); releaseMic();
    if (!supported()) { P.msg = window.isSecureContext === false ? 'secure' : 'browser'; return set('unavailable'); }
    const gen = ++R.gen; set('asking');
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
    catch (e) {
      const n = e && e.name; let ps = ''; try { ps = (await navigator.permissions.query({ name: 'microphone' })).state; } catch { }
      if (gen !== R.gen) return;
      P.msg = n === 'NotReadableError' || n === 'AbortError' ? 'busy' : '';
      return set(n === 'NotAllowedError' || n === 'SecurityError' || ps === 'denied' ? 'denied' : n === 'NotFoundError' || n === 'OverconstrainedError' || P.msg ? 'nomic' : 'unavailable');
    }
    if (gen !== R.gen) { stream.getTracks().forEach(t => t.stop()); return; }          /* left the page while the prompt was open */
    R.stream = stream; R.chunks = [];
    let rec; try { const mt = mimeType(); rec = new MediaRecorder(stream, mt ? { mimeType: mt } : undefined); } catch { releaseMic(); P.msg = 'browser'; return set('unavailable'); }
    R.rec = rec;
    rec.ondataavailable = e => { if (e.data && e.data.size) R.chunks.push(e.data); };
    rec.onstop = () => {
      if (gen !== R.gen) return;
      const secs = Math.min(MAX, (performance.now() - R.t0) / 1000); releaseMic(); R.rec = null;
      if (!R.chunks.length) { P.msg = 'empty'; return set('idle'); }
      const blob = new Blob(R.chunks, { type: rec.mimeType || 'audio/webm' }); R.chunks = [];
      R.url = URL.createObjectURL(blob); P.secs = secs; set('recorded');
    };
    meter(stream);
    R.t0 = performance.now(); rec.start(250); set('recording');
    R.timer = setInterval(tick, 100);
  }
  function tick() {
    const s = (performance.now() - R.t0) / 1000, t = $('#px-time'), bar = $('#px-prog');
    if (t) t.textContent = fmt(s) + ' / ' + fmt(MAX); if (bar) bar.style.setProperty('transform', `scaleX(${Math.min(1, s / MAX)})`, 'important');
    const sr = $('#px-sr'); if (sr && Math.floor(s) !== R.lastSec) { R.lastSec = Math.floor(s); if (R.lastSec && R.lastSec % 3 === 0) sr.textContent = `Recording, ${R.lastSec} seconds`; }
    if (s >= MAX) stopRecording();
  }
  function stopRecording() { clearInterval(R.timer); R.timer = 0; if (R.rec && R.rec.state !== 'inactive') { try { R.rec.stop(); } catch { releaseMic(); set('idle'); } } }
  /* live input level: RMS of the microphone signal, drawn as a bar (never routed to the speakers) */
  function meter(stream) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      R.ctx = new AC(); const src = R.ctx.createMediaStreamSource(stream), an = R.ctx.createAnalyser(); an.fftSize = 1024; src.connect(an);
      const buf = new Uint8Array(an.fftSize); let peak = 0;
      const loop = () => {
        an.getByteTimeDomainData(buf); let sum = 0; for (let i = 0; i < buf.length; i++) { const x = (buf[i] - 128) / 128; sum += x * x; }
        const lvl = Math.min(1, Math.sqrt(sum / buf.length) * 3.2); peak = Math.max(lvl, peak * .94);
        const f = $('#px-fill'), p = $('#px-peak'); if (f) f.style.clipPath = `inset(0 ${((1 - lvl) * 100).toFixed(1)}% 0 0)`; if (p) p.style.left = (peak * 100).toFixed(1) + '%';
        R.raf = requestAnimationFrame(loop);
      }; loop();
    } catch { }
  }

  /* ---------- playback ---------- */
  function stopPlayback() { stopSpeech(); if (R.audio) { try { R.audio.pause(); R.audio.currentTime = 0; } catch { } } if (P.play) { P.play = ''; if (P.st === 'recorded') draw(); } }
  function playMine(after) {
    if (!R.url) return; if (!R.audio) R.audio = new Audio(R.url);
    const a = R.audio; a.currentTime = 0; a.onended = a.onerror = () => { P.play = ''; if (P.st === 'recorded') draw(); after && after(); };
    a.play().catch(() => { P.play = ''; P.msg = 'blocked'; if (P.st === 'recorded') draw(); });
  }
  function replay() { if (P.play) return stopPlayback(); stopSpeech(); P.play = 'mine'; P.msg = ''; draw('#px-replay'); playMine(); }
  function compare() {
    if (P.play) return stopPlayback(); P.play = 'compare'; P.msg = ''; draw('#px-compare'); const w = wordById[P.sel], gen = R.gen;
    say(w.term, .85, () => { if (gen !== R.gen || P.play !== 'compare') return; const sr = $('#px-sr'); if (sr) sr.textContent = 'Now your recording'; playMine(); });
  }
  function discard() { stopPlayback(); dropAudio(); P.secs = 0; P.msg = ''; set('idle', '#px-rec'); }

  /* ---------- markup ---------- */
  const priv = () => `<p class="px-priv">${IC.lock}<span>MedLex asks for your microphone only to play back your own voice. Nothing is uploaded.</span></p>`;
  const HELP = `<ol class="px-steps"><li>Look for the microphone or padlock icon beside the web address and choose <b>Allow</b> for the microphone on this site.</li><li>If you cannot see an icon, open your browser’s <b>Settings</b>, then <b>Privacy</b> or <b>Site settings</b>, then <b>Microphone</b>, and allow the microphone for this site.</li><li>On iPhone or iPad: <b>Settings</b>, <b>Safari</b>, <b>Microphone</b>. On a Mac or Windows PC, also check that your browser is allowed in the system’s microphone privacy settings.</li></ol>`;
  function panel() {
    const tryBtn = `<button type="button" class="btn primary px-btn" data-lx="px-rec" id="px-rec">${IC.redo}<span>Try again</span></button>`;
    switch (P.st) {
      case 'asking': return `<div class="px-box"><p class="px-lead" role="status">Waiting for your browser’s permission prompt…</p><p class="px-hint">Choose <b>Allow</b> to start. MedLex only listens while you are recording.</p></div>`;
      case 'recording': return `<div class="px-box is-rec"><div class="px-row"><button type="button" class="btn px-btn px-stop" data-lx="px-stop" id="px-stop">${IC.stop}<span>Stop recording</span></button><span class="px-time" id="px-time" aria-hidden="true">0:00 / ${fmt(MAX)}</span></div>
        <div class="px-meterbox"><span class="px-ml" id="px-ml">Input level</span><div class="px-meter" aria-hidden="true"><i id="px-fill"></i><b id="px-peak"></b></div></div><div class="px-prog" aria-hidden="true"><i id="px-prog"></i></div>
        <p class="px-hint">Say the word at a comfortable pace. If the bar does not move, check that your microphone is not muted. Recording stops by itself after ${MAX} seconds.</p></div>`;
      case 'recorded': return `<div class="px-box"><p class="px-lead">Recorded ${Math.max(1, Math.round(P.secs))} ${Math.round(P.secs) <= 1 ? 'second' : 'seconds'}.</p><div class="px-actions">
        <button type="button" class="btn primary px-btn" data-lx="px-replay" id="px-replay" aria-pressed="${P.play === 'mine'}">${P.play === 'mine' ? IC.stop : IC.play}<span>${P.play === 'mine' ? 'Stop playback' : 'Replay my recording'}</span></button>
        ${canSpeak() ? `<button type="button" class="btn px-btn" data-lx="px-compare" id="px-compare" aria-pressed="${P.play === 'compare'}">${P.play === 'compare' ? IC.stop : IC.swap}<span>${P.play === 'compare' ? 'Stop comparing' : 'Compare with the model voice'}</span></button>` : ''}
        <button type="button" class="btn px-btn" data-lx="px-rec" id="px-rec">${IC.redo}<span>Record again</span></button>
        <button type="button" class="btn px-btn" data-lx="px-discard">${IC.trash}<span>Discard</span></button></div>
        <p class="px-hint">${P.msg === 'blocked' ? 'Your browser would not play the recording. Press Replay again.' : 'Compare plays the model voice first, then your recording. This recording lives only in this tab’s memory and is gone when you leave the page.'}</p></div>`;
      case 'denied': return `<div class="px-box is-warn" role="group" aria-labelledby="px-wt"><h3 id="px-wt">The microphone is blocked</h3><p>Your browser did not let MedLex use the microphone, so recording is switched off for now. Nothing has been recorded.</p>${HELP}<div class="px-actions">${tryBtn}</div><p class="px-hint">You can still practise without recording: press <b>Hear the word</b>, then say it aloud.</p></div>`;
      case 'nomic': return `<div class="px-box is-warn" role="group" aria-labelledby="px-wt"><h3 id="px-wt">${P.msg === 'busy' ? 'The microphone would not start' : 'No microphone found'}</h3><p>${P.msg === 'busy' ? 'Another app or browser tab may be using it. Close anything else that is recording, then try again.' : 'This device did not report a working microphone. Plug one in, or switch on the built-in one, then try again.'}</p><div class="px-actions">${tryBtn}</div><p class="px-hint">You can still press <b>Hear the word</b> and say it aloud.</p></div>`;
      case 'unavailable': return `<div class="px-box is-warn" role="group" aria-labelledby="px-wt"><h3 id="px-wt">Recording is not available here</h3><p>${P.msg === 'secure' ? 'Browsers only allow the microphone on secure (https) pages.' : 'This browser cannot record audio in the page.'} A recent version of Chrome, Edge, Firefox or Safari will work.</p><p class="px-hint">You can still press <b>Hear the word</b> and say it aloud.</p></div>`;
      default: return `<div class="px-box"><div class="px-actions"><button type="button" class="btn primary px-btn" data-lx="px-rec" id="px-rec">${IC.mic}<span>Record my voice</span></button></div><p class="px-hint">${P.msg === 'empty' ? 'Nothing was captured. Check that your microphone is not muted and try again. ' : ''}Up to ${MAX} seconds. Your browser will ask for permission the first time.</p></div>`;
    }
  }
  function body() {
    const w = wordById[P.sel], real = w.p.filter(p => p[1] !== 'v');
    const opts = [...new Set(words.map(x => x.ch))].sort((a, b) => a - b).map(ch => `<optgroup label="${esc(sysName(ch))}">${words.filter(x => x.ch === ch).map(x => `<option value="${esc(x.id)}"${x.id === w.id ? ' selected' : ''}>${esc(x.term)}</option>`).join('')}</optgroup>`).join('');
    return `<div class="px-wrap"><div class="px-pick"><label for="px-word">Choose a word</label><select id="px-word" data-lx-change="px-word">${opts}</select></div>
      <article class="lx-lab-card px-card" aria-labelledby="px-t"><div><span class="lx-sys">${esc(sysName(w.ch))}</span><h2 id="px-t">${esc(w.term)}</h2><p class="px-plain">${esc(w.plain)}</p></div>
        <div class="lx-tiles" role="img" aria-label="${esc(w.term)} is made of ${esc(real.map(p => p[0] + ', ' + p[2]).join('; '))}">${w.p.map((p, i) => (i ? '<i class="lx-plus" aria-hidden="true">+</i>' : '') + tile(p[1], p[0], p[2], i)).join('')}</div>
        <p class="px-hint">These are word parts, not phonetic syllables. MedLex does not invent a pronunciation spelling.</p>
        <section class="px-sec" aria-labelledby="px-h1"><h3 id="px-h1"><b>1</b> Listen</h3>${canSpeak() ? `<div class="px-actions"><button type="button" class="btn primary px-btn" data-lx="px-hear" data-r=".85">${IC.listen}<span>Hear the word</span></button><button type="button" class="btn px-btn" data-lx="px-hear" data-r=".55">${IC.listen}<span>Hear it slowly</span></button></div>` : '<p class="px-hint">This browser has no built-in voice, so the model voice is not available. You can still record yourself.</p>'}</section>
        <section class="px-sec" aria-labelledby="px-h2"><h3 id="px-h2"><b>2</b> Say it and record</h3>${priv()}<div id="px-stage">${panel()}</div></section>
        <p class="px-sr sr-only" id="px-sr" role="status" aria-live="polite"></p></article></div>`;
  }
  /* re-render the stage; keep keyboard focus on the same control, or move it to the one the new state wants */
  function draw(focus) {
    const s = $('#px-stage'); if (!s) return; const had = s.contains(document.activeElement) ? document.activeElement.id : '';
    s.innerHTML = panel(); const f = (focus && $(focus)) || (had && $('#' + had)); if (f) f.focus({ preventScroll: true });
  }
  function set(st, focus) {
    P.st = st; R.lastSec = -1; draw(focus || ({ recording: '#px-stop', recorded: '#px-replay', denied: '#px-rec', nomic: '#px-rec' })[st]); announce();
  }
  function announce() {
    const sr = $('#px-sr'); if (!sr) return;
    sr.textContent = { asking: 'Waiting for microphone permission', recording: 'Recording started. Press Stop recording when you have finished.', recorded: 'Recording finished. Use Replay my recording, or Compare with the model voice.', denied: 'The microphone is blocked. Instructions are shown below.', nomic: 'The microphone could not be started.', unavailable: 'Recording is not available in this browser.' }[P.st] || '';
  }

  /* ---------- view ---------- */
  function view(params) {
    cleanup();
    const w = params && params.get('w'); P.sel = wordById[w] ? w : (wordById[P.sel] ? P.sel : (wordById.pericarditis ? 'pericarditis' : words[0].id)); P.st = 'idle'; P.msg = ''; P.play = '';
    mount(header('Library', 'Listen to the word, say it, then hear yourself and compare.') + L.tabs(L.libTabs, 'pronunciation', 'Library sections') + body());
    views.cleanup.push(cleanup);
    addEventListener('hashchange', onHash); addEventListener('pagehide', cleanup); document.addEventListener('visibilitychange', onVis); R.listening = true;
    /* if the browser already says the microphone is blocked, say so up front */
    try { navigator.permissions && navigator.permissions.query({ name: 'microphone' }).then(s => { if (s.state === 'denied' && R.listening && P.st === 'idle') { P.st = 'denied'; const g = $('#px-stage'); if (g) g.innerHTML = panel(); announce(); } }).catch(() => { }); } catch { }
  }
  L.act('px-rec', () => startRecording());
  L.act('px-stop', () => stopRecording());
  L.act('px-replay', () => replay());
  L.act('px-compare', () => compare());
  L.act('px-discard', () => discard());
  L.act('px-hear', b => { stopPlayback(); say(wordById[P.sel].term, +b.dataset.r || .85); });
  L.act('px-word', t => {
    if (!wordById[t.value]) return; if (P.st === 'recording') { R.gen++; const r = R.rec; R.rec = null; if (r) { r.onstop = null; try { r.stop(); } catch { } } releaseMic(); }
    stopSpeech(); dropAudio(); P.sel = t.value; P.st = 'idle'; P.msg = ''; P.play = ''; P.secs = 0; R.gen++;
    const main = $('#main .px-wrap'); if (main) { main.outerHTML = body(); const s = $('#px-word'); s && s.focus({ preventScroll: true }); }
    try { history.replaceState(null, '', '#library/pronunciation?w=' + P.sel); } catch { }
  });
  L.viewPronunciation = view;
})();
