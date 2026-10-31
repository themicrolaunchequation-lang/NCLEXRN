/* Original soundtrack for the crown story, made live in the browser with the Web Audio API.
   No audio files and nothing licensed: a warm pad that changes chord with each scene, a soft heartbeat
   at a resting 60 beats a minute, and a glass chime when a jewel lights. Off until the visitor turns it on. */
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
// One chord per scene: 0 hero, 1 one band, 2 six jewels, 3 heartbeat, 4 people, 5 the crown (D major colours).
const CHORDS = [[50, 57, 61, 64], [47, 54, 59, 62], [43, 50, 57, 59], [45, 52, 57, 61], [50, 57, 62, 66], [43, 55, 62, 64]];
const JEWEL = [74, 78, 81, 83, 86, 90];   // one bell note per jewel, from the D major pentatonic

export function createSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain(); master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
  master.connect(comp).connect(ctx.destination);

  // a soft hall made from decaying noise
  const len = ctx.sampleRate * 3.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  const hall = ctx.createConvolver(); hall.buffer = ir;
  const wet = ctx.createGain(); wet.gain.value = 0.5; hall.connect(wet).connect(master);
  const bus = ctx.createGain(); bus.connect(master); bus.connect(hall);

  // pad: four voices, each two gently detuned oscillators through a slowly breathing low-pass filter
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650; lp.Q.value = 0.5;
  const lfo = ctx.createOscillator(), lfoAmt = ctx.createGain(); lfo.frequency.value = 0.07; lfoAmt.gain.value = 260; lfo.connect(lfoAmt).connect(lp.frequency); lfo.start();
  const pad = ctx.createGain(); pad.gain.value = 0.09; lp.connect(pad).connect(bus);
  const voices = CHORDS[0].map((m) => [-5, 5].map((cents, j) => {
    const o = ctx.createOscillator(); o.type = j ? 'triangle' : 'sine'; o.frequency.value = hz(m); o.detune.value = cents;
    const g = ctx.createGain(); g.gain.value = j ? 0.12 : 0.22; o.connect(g).connect(lp); o.start(); return o;
  }));

  // heartbeat: two low thumps ("lub-dub") once a second
  const hbLp = ctx.createBiquadFilter(); hbLp.type = 'lowpass'; hbLp.frequency.value = 140;
  const hb = ctx.createGain(); hb.gain.value = 0.25; hbLp.connect(hb).connect(master);
  function thump(t, v) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(68, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.16);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g).connect(hbLp); o.start(t); o.stop(t + 0.25);
  }
  let next = ctx.currentTime + 0.3;
  const clock = setInterval(() => { while (next < ctx.currentTime + 0.4) { thump(next, 0.9); thump(next + 0.24, 0.55); next += 1; } }, 120);

  function bell(m, t = ctx.currentTime, v = 0.12) {
    [[1, 1], [2.76, 0.35], [5.4, 0.16], [8.93, 0.06]].forEach(([r, a]) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = hz(m) * r;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * a, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6 / r + 0.4);
      o.connect(g).connect(bus); o.start(t); o.stop(t + 3.2);
    });
  }
  // now and then, a quiet sparkle so the room never feels static
  let sparkle = 0;
  const air = setInterval(() => { if (on && Math.random() < 0.35) bell(JEWEL[(sparkle++ * 3) % 6] + 12, ctx.currentTime, 0.025); }, 2600);

  let on = false, sceneNow = -1, level = 1;
  const api = {
    get on() { return on; },
    start() { on = true; ctx.resume(); master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0.75 * level, ctx.currentTime, 0.6); },
    stop() { on = false; master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0, ctx.currentTime, 0.25); setTimeout(() => { if (!on) ctx.suspend(); }, 1200); },
    // fade down when the story scrolls away, back up when it returns
    level(x) { level = x; if (on) master.gain.setTargetAtTime(0.75 * x, ctx.currentTime, 0.5); },
    scene(i) {
      if (i === sceneNow) return; sceneNow = i;
      CHORDS[i].forEach((m, k) => voices[k].forEach((o) => o.frequency.setTargetAtTime(hz(m), ctx.currentTime, 0.9)));
      hb.gain.setTargetAtTime(i === 3 ? 0.9 : i === 4 ? 0.35 : 0.22, ctx.currentTime, 0.6);
      lp.frequency.setTargetAtTime(i === 5 ? 1100 : 650, ctx.currentTime, 1);
    },
    jewel(i) { if (on) bell(JEWEL[i]); },
    crown() { if (!on) return; const t = ctx.currentTime; JEWEL.forEach((m, k) => bell(m, t + k * 0.09, 0.07)); },
    close() { clearInterval(clock); clearInterval(air); ctx.close(); }
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) ctx.suspend(); else if (on) ctx.resume(); });
  return api;
}
