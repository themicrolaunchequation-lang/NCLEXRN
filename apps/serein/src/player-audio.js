/* Serein guided practice: synthesised sound. No audio files, no network.
 *   Breath sounds   filtered-noise whoosh that rises on the in-breath and falls on the out-breath
 *   Soft music      a generative pad per practice, fading in and out, ducked while the voice speaks
 *   Bell            one soft bell when a practice finishes
 * Everything is built from Web Audio nodes and is created only when a practice starts. The scheduling functions take
 * any BaseAudioContext, so the tests can render them offline and measure the level. */
(function (g) {
  'use strict';
  const AC = g.AudioContext || g.webkitAudioContext;
  const OAC = g.OfflineAudioContext || g.webkitOfflineAudioContext;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  function rng(seed) {
    let a = (seed >>> 0) || 0x9e3779b9;
    return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* Paul Kellet's pink noise and a leaky-integrated brown noise, four seconds, looped. */
  function noiseSet(ctx) {
    if (ctx.__sereinNoise) return ctx.__sereinNoise;
    const len = Math.floor(ctx.sampleRate * 4), r = rng(7);
    const pink = ctx.createBuffer(1, len, ctx.sampleRate), brown = ctx.createBuffer(1, len, ctx.sampleRate);
    const p = pink.getChannelData(0), b = brown.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = r() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      p[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
      last = (last + 0.02 * w) / 1.02; b[i] = last * 3.2;
    }
    // Cross-fade the loop point so it never clicks.
    const n = Math.floor(ctx.sampleRate * 0.25);
    for (const d of [p, b]) for (let i = 0; i < n; i++) { const k = i / n; d[i] = d[i] * k + d[len - n + i] * (1 - k); }
    return (ctx.__sereinNoise = { pink, brown });
  }

  /* ---- the mixer: one chain per kind of sound, all through a soft limiter ---- */
  function mixer(ctx) {
    const master = ctx.createGain(); master.gain.value = 1;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -22; comp.knee.value = 24; comp.ratio.value = 3; comp.attack.value = 0.02; comp.release.value = 0.4;
    master.connect(comp); comp.connect(ctx.destination);
    const musicIn = ctx.createGain(), musicFade = ctx.createGain(), musicDuck = ctx.createGain(), musicLevel = ctx.createGain();
    const warm = ctx.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 9000; warm.Q.value = 0.3;
    musicIn.connect(warm); warm.connect(musicFade); musicFade.connect(musicDuck); musicDuck.connect(musicLevel); musicLevel.connect(master);
    musicFade.gain.value = 0; musicDuck.gain.value = 1; musicLevel.gain.value = 0.1;
    const breathIn = ctx.createGain(), breathLevel = ctx.createGain(); breathIn.connect(breathLevel); breathLevel.connect(master); breathLevel.gain.value = 0.1;
    const bellIn = ctx.createGain(); bellIn.gain.value = 0.08; bellIn.connect(master);
    return { master, comp, musicIn, musicFade, musicDuck, musicLevel, breathIn, breathLevel, bellIn };
  }

  /* ---- building blocks ---- */
  function track(env, node) { env.live.add(node); node.onended = () => { env.live.delete(node); try { node.disconnect(); } catch { /* ignore */ } }; return node; }
  function lowpass(env, dest, freq, q) { const f = env.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq; f.Q.value = q == null ? 0.5 : q; f.connect(dest); return f; }
  function slowLfo(env, rate, depth, param, phase) {
    const o = env.ctx.createOscillator(), gn = env.ctx.createGain();
    o.type = 'sine'; o.frequency.value = rate; gn.gain.value = depth; o.connect(gn); gn.connect(param);
    o.start(env.t0 + (phase || 0)); env.sustain.push(o); return o;
  }
  function padNote(env, dest, freq, t, dur, peak, o) {
    o = o || {};
    const ctx = env.ctx, a = o.attack == null ? Math.min(4.5, dur * 0.35) : o.attack, r = o.release == null ? Math.min(5.5, dur * 0.45) : o.release;
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(peak, t + a);
    gn.gain.setValueAtTime(peak, Math.max(t + a, t + dur - r)); gn.gain.linearRampToValueAtTime(0, t + dur);
    gn.connect(dest);
    const det = o.detune == null ? 5 : o.detune;
    for (const d of [-det, det]) {
      const osc = track(env, ctx.createOscillator());
      osc.type = o.type || 'sine'; osc.frequency.value = freq; osc.detune.value = d + (env.rand() - 0.5) * 3;
      osc.connect(gn); osc.start(t); osc.stop(t + dur + 0.05);
    }
  }
  function chord(env, dest, notes, t, dur, peak, o) {
    const each = peak / Math.sqrt(notes.length);
    notes.forEach((m, i) => padNote(env, dest, mtof(m), t + i * 0.18, dur, each * (i === 0 ? 1.15 : 1), o));
  }
  function bellTone(env, dest, midi, t, peak, decay) {
    const ctx = env.ctx, f = mtof(midi), d = decay || 3.6;
    const gn = ctx.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(peak, t + 0.03); gn.gain.exponentialRampToValueAtTime(0.0001, t + d); gn.connect(dest);
    [[1, 1], [2.01, 0.3], [2.99, 0.1]].forEach(([k, v], i) => {
      const o = track(env, ctx.createOscillator()), pg = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f * k; pg.gain.value = v; o.connect(pg); pg.connect(gn); o.start(t); o.stop(t + d + 0.1 + i * 0.01);
    });
  }
  function pluck(env, dest, midi, t, peak) {
    const ctx = env.ctx, o = track(env, ctx.createOscillator()), lp = ctx.createBiquadFilter(), gn = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = mtof(midi); lp.type = 'lowpass'; lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(420, t + 0.45); lp.Q.value = 0.4;
    gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(peak, t + 0.012); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
    o.connect(lp); lp.connect(gn); gn.connect(dest); o.start(t); o.stop(t + 0.7);
  }
  function thump(env, dest, freq, t, peak, decay) {
    const ctx = env.ctx, o = track(env, ctx.createOscillator()), gn = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(freq * 1.5, t); o.frequency.exponentialRampToValueAtTime(freq, t + 0.12);
    gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(peak, t + 0.04); gn.gain.exponentialRampToValueAtTime(0.0001, t + (decay || 0.7));
    o.connect(gn); gn.connect(dest); o.start(t); o.stop(t + (decay || 0.7) + 0.1);
  }
  function drone(env, dest, midi, gain, type) {
    const ctx = env.ctx, o = track(env, ctx.createOscillator()), gn = ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = mtof(midi); gn.gain.setValueAtTime(0, env.t0); gn.gain.linearRampToValueAtTime(gain, env.t0 + 5);
    o.connect(gn); gn.connect(dest); o.start(env.t0); env.sustain.push(o); return gn;
  }
  function noiseBed(env, dest, kind, filterType, freq, q, gain) {
    const ctx = env.ctx, src = track(env, ctx.createBufferSource()), f = ctx.createBiquadFilter(), gn = ctx.createGain();
    src.buffer = env.noise[kind]; src.loop = true; f.type = filterType; f.frequency.value = freq; f.Q.value = q == null ? 0.6 : q;
    gn.gain.setValueAtTime(0, env.t0); gn.gain.linearRampToValueAtTime(gain, env.t0 + 5);
    src.connect(f); f.connect(gn); gn.connect(dest); src.start(env.t0, env.rand() * 2); env.sustain.push(src);
    return { gain: gn, filter: f };
  }

  /* ---- moods. init() builds sustained layers; schedule() plays everything that falls before tEnd ---- */
  const MOODS = {
    /* tide: warm D major pad under an ocean swell that rises over the in-breath and falls over the out-breath */
    tide: {
      trim: 1,
      init(env, o) {
        const f = lowpass(env, env.dest, 1900, 0.4); slowLfo(env, 0.035, 520, f.frequency);
        drone(env, f, 38, 0.1);
        const sea = noiseBed(env, env.dest, 'brown', 'lowpass', 760, 0.5, 0.0001);
        const cy = (o.cycle && o.cycle.length === 2) ? o.cycle : [4, 6];
        return { f, sea, a: cy[0], b: cy[1], nextSwell: env.t0 + (o.cycleOffset ? Math.max(0, cy[0] + cy[1] - o.cycleOffset) : 0), nextChord: env.t0, chordIx: 0 };
      },
      schedule(env, s, end) {
        const chords = [[50, 57, 62, 66, 69], [43, 50, 59, 62, 67], [47, 54, 62, 66, 69], [45, 52, 57, 64, 69]];
        while (s.nextChord < end) { chord(env, s.f, chords[s.chordIx % 4], s.nextChord, 19, 0.34, { type: 'sine' }); s.nextChord += 14; s.chordIx++; }
        const gp = s.sea.gain.gain, lo = 0.02, hi = 0.34;
        while (s.nextSwell < end) {
          const t = s.nextSwell, a = s.a, b = s.b;
          // rise over the in-breath, fall over the out-breath, in small linear steps so the curves can never overlap
          gp.setValueAtTime(lo, t);
          for (let i = 1; i <= 12; i++) gp.linearRampToValueAtTime(lo + (hi - lo) * (0.5 - 0.5 * Math.cos(Math.PI * i / 12)), t + a * i / 12);
          for (let i = 1; i <= 16; i++) gp.linearRampToValueAtTime(hi - (hi - lo) * (0.5 - 0.5 * Math.cos(Math.PI * i / 16)), t + a + b * i / 16);
          s.nextSwell += a + b;
        }
      }
    },
    /* box: a steady soft pad with a faint pulse on every side of the square */
    box: {
      trim: 0.95,
      init(env, o) {
        const f = lowpass(env, env.dest, 1500, 0.4); slowLfo(env, 0.03, 300, f.frequency);
        drone(env, f, 36, 0.08);
        const ph = Math.max(2, Number(o.phaseSeconds) || 4);
        return { f, ph, next: env.t0 + (o.phaseOffset ? Math.max(0, ph - o.phaseOffset) : 0), n: o.phaseIndex || 0, nextChord: env.t0, ix: 0 };
      },
      schedule(env, s, end) {
        const chords = [[48, 55, 59, 62, 64], [41, 53, 57, 60, 64]];
        while (s.nextChord < end) { chord(env, s.f, chords[s.ix % 2], s.nextChord, 30, 0.34, { type: 'sine' }); s.nextChord += 24; s.ix++; }
        while (s.next < end) { thump(env, env.dest, 98, s.next, s.n % 4 === 0 ? 0.26 : 0.15, 0.7); s.next += s.ph; s.n++; }
      }
    },
    /* ground: a low fifth with sparse, soft bells */
    ground: {
      trim: 2,
      init(env) {
        const f = lowpass(env, env.dest, 700, 0.4);
        drone(env, f, 38, 0.2); drone(env, f, 45, 0.12); drone(env, f, 50, 0.05);
        slowLfo(env, 0.03, 160, f.frequency);
        return { next: env.t0 + 4 };
      },
      schedule(env, s, end) {
        const notes = [74, 76, 78, 81, 83, 81, 78];
        while (s.next < end) { bellTone(env, env.dest, notes[Math.floor(env.rand() * notes.length)], s.next, 0.2, 4.2); s.next += 7 + env.rand() * 6; }
      }
    },
    /* descend: a slow warm pad that steps downwards (release, full release, body scan) */
    descend: {
      trim: 1.05,
      init(env) {
        const f = lowpass(env, env.dest, 1700, 0.3);
        return { f, next: env.t0, ix: 0 };
      },
      schedule(env, s, end) {
        const chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]];
        while (s.next < end) {
          const m = chords[s.ix % chords.length], cut = [1700, 1350, 1050, 820][s.ix % 4];
          s.f.frequency.cancelScheduledValues(Math.max(env.t0, s.next - 3)); s.f.frequency.setTargetAtTime(cut, Math.max(env.t0, s.next), 3);
          chord(env, s.f, m, s.next, 22, 0.36, { type: 'triangle', detune: 6 });
          padNote(env, s.f, mtof(m[0] - 12), s.next, 22, 0.1, { type: 'sine' });
          s.next += 17; s.ix++;
        }
      }
    },
    /* airy: a light, high pad with a faint shimmer (desk, hand, shoulder and ankle practices) */
    airy: {
      trim: 1.08,
      init(env) {
        const f = lowpass(env, env.dest, 5200, 0.3); slowLfo(env, 0.09, 900, f.frequency);
        const sh = env.ctx.createGain(); sh.gain.value = 0.0; sh.connect(f);
        slowLfo(env, 0.11, 0.014, sh.gain); sh.gain.value = 0.016;
        for (const m of [86, 93]) { const o = track(env, env.ctx.createOscillator()); o.type = 'sine'; o.frequency.value = mtof(m); o.connect(sh); o.start(env.t0); env.sustain.push(o); }
        return { f, next: env.t0, ix: 0 };
      },
      schedule(env, s, end) {
        const chords = [[62, 69, 73, 76, 78], [67, 71, 74, 78, 81]];
        while (s.next < end) { chord(env, s.f, chords[s.ix % 2], s.next, 20, 0.3, { type: 'sine' }); padNote(env, s.f, mtof(50 + (s.ix % 2) * 5), s.next, 20, 0.07); s.next += 15; s.ix++; }
      }
    },
    /* sparse: long silences with single soft tones and breaths of air (mindful listening) */
    sparse: {
      trim: 1.7,
      init(env) {
        const f = lowpass(env, env.dest, 1200, 0.3);
        drone(env, f, 50, 0.025);
        return { f, next: env.t0 + 2.5, n: 0 };
      },
      schedule(env, s, end) {
        const notes = [62, 64, 66, 69, 71, 66];
        while (s.next < end) {
          if (s.n % 2 === 0) padNote(env, env.dest, mtof(notes[Math.floor(env.rand() * notes.length)]), s.next, 11, 0.28, { attack: 4.5, release: 6 });
          else {
            const src = track(env, env.ctx.createBufferSource()), bp = env.ctx.createBiquadFilter(), gn = env.ctx.createGain();
            src.buffer = env.noise.pink; src.loop = true; bp.type = 'bandpass'; bp.frequency.value = 520 + env.rand() * 260; bp.Q.value = 1.1;
            gn.gain.setValueAtTime(0, s.next); gn.gain.linearRampToValueAtTime(0.22, s.next + 3.6); gn.gain.linearRampToValueAtTime(0, s.next + 8);
            src.connect(bp); bp.connect(gn); gn.connect(env.dest); src.start(s.next, env.rand() * 2); src.stop(s.next + 8.2);
          }
          s.n++; s.next += 11 + env.rand() * 9;
        }
      }
    },
    /* motif: a very short, gentle rising phrase over a barely-there pad (Three-Minute Pause) */
    motif: {
      trim: 2.1,
      init(env) {
        const f = lowpass(env, env.dest, 1400, 0.3);
        return { f, next: env.t0 + 1.2, nextChord: env.t0 };
      },
      schedule(env, s, end) {
        while (s.nextChord < end) { chord(env, s.f, [50, 57, 62, 66], s.nextChord, 30, 0.12, { type: 'sine' }); s.nextChord += 24; }
        while (s.next < end) { [74, 78, 81].forEach((m, i) => bellTone(env, env.dest, m, s.next + i * 0.95, 0.24, 2.6)); s.next += 40; }
      }
    },
    /* nature: soft stream and wind with an open pad (Quiet Place) */
    nature: {
      trim: 1.2,
      init(env) {
        const f = lowpass(env, env.dest, 2100, 0.3);
        const stream = noiseBed(env, env.dest, 'pink', 'bandpass', 1500, 0.45, 0.16);
        const wind = noiseBed(env, env.dest, 'brown', 'lowpass', 480, 0.4, 0.12);
        slowLfo(env, 0.06, 0.07, wind.gain.gain); slowLfo(env, 0.045, 260, wind.filter.frequency);
        return { f, stream, next: env.t0, nextWob: env.t0 + 1, ix: 0 };
      },
      schedule(env, s, end) {
        const chords = [[55, 62, 66, 71], [60, 64, 67, 71, 74]];
        while (s.next < end) { chord(env, s.f, chords[s.ix % 2], s.next, 26, 0.2, { type: 'sine' }); s.next += 20; s.ix++; }
        while (s.nextWob < end) { s.stream.gain.gain.setTargetAtTime(0.1 + env.rand() * 0.1, s.nextWob, 1.1); s.nextWob += 2 + env.rand() * 2; }
      }
    },
    /* walk: a light, steady pulse near 66 beats a minute with a soft pluck */
    walk: {
      trim: 1.7,
      init(env) {
        const f = lowpass(env, env.dest, 3200, 0.3);
        return { f, beat: 60 / 66, next: env.t0 + 1, n: 0, nextChord: env.t0 };
      },
      schedule(env, s, end) {
        const pat = [74, null, 69, 66, 74, 71, null, 66, 69, null, 74, 71];
        while (s.nextChord < end) { chord(env, s.f, [50, 57, 62, 64, 69], s.nextChord, 28, 0.16, { type: 'sine' }); s.nextChord += 24; }
        while (s.next < end) {
          const m = pat[s.n % pat.length];
          if (m != null) pluck(env, env.dest, m, s.next, 0.19);
          if (s.n % 4 === 0) thump(env, env.dest, 73.4, s.next, 0.14, 0.55);
          s.n++; s.next += s.beat;
        }
      }
    },
    /* winddown: very slow, dark and warm, fading away across the practice */
    winddown: {
      trim: 1, fadeOut: true,
      init(env) {
        const f = lowpass(env, env.dest, 440, 0.3);
        return { f, next: env.t0, ix: 0 };
      },
      schedule(env, s, end) {
        const chords = [[38, 45, 53, 57, 64], [34, 46, 53, 57, 62], [41, 48, 53, 57, 60], [36, 43, 52, 55, 59]];
        while (s.next < end) { chord(env, s.f, chords[s.ix % 4], s.next, 34, 0.4, { type: 'triangle', attack: 9, release: 11, detune: 4 }); s.next += 24; s.ix++; }
      }
    }
  };
  const MOOD_FOR = { tide: 'tide', box: 'box', ground: 'ground', release: 'descend', fullrelease: 'descend', scan: 'descend', desk: 'airy', handreset: 'airy', shoulderreset: 'airy', ankles: 'airy', listen: 'sparse', pause3: 'motif', quietplace: 'nature', walk: 'walk', winddown: 'winddown' };

  /* A running piece of music on any context. schedule(tEnd) plays everything before tEnd; stop(t) ends it. */
  function createMusic(ctx, dest, practiceId, opts) {
    opts = opts || {};
    const name = MOOD_FOR[practiceId] || 'airy', mood = MOODS[name];
    const trim = ctx.createGain(); trim.gain.value = (mood.trim || 1) * 0.5; trim.connect(dest);
    const env = { ctx, dest: trim, rand: rng(opts.seed || 41), noise: noiseSet(ctx), live: new Set(), sustain: [], t0: opts.t0 == null ? ctx.currentTime : opts.t0 };
    const st = mood.init(env, opts);
    return {
      name, mood, env,
      schedule(tEnd) { mood.schedule(env, st, tEnd); },
      stop(t) {
        for (const n of Array.from(env.live)) { try { n.stop(t); } catch { /* already stopped */ } }
        for (const n of env.sustain) { try { n.stop(t); } catch { /* already stopped */ } }
        setTimeout(() => { try { trim.disconnect(); } catch { /* ignore */ } }, Math.max(0, (t - ctx.currentTime) * 1000) + 400);
      }
    };
  }

  /* ---- breath sounds ---- */
  function breathCue(ctx, dest, noise, kind, dur, t, start) {
    start = clamp(start || 0, 0, 0.9);
    const left = Math.max(0.25, dur * (1 - start)), live = [];
    const add = n => { live.push(n); return n; };
    const done = () => { for (const n of live) { try { n.disconnect(); } catch { /* ignore */ } } };
    if (kind === 'in' || kind === 'out') {
      const src = add(ctx.createBufferSource()), bp = add(ctx.createBiquadFilter()), lp = add(ctx.createBiquadFilter()), gn = add(ctx.createGain());
      src.buffer = noise.pink; src.loop = true; bp.type = 'bandpass'; bp.Q.value = 0.85; lp.type = 'lowpass'; lp.frequency.value = 4200; lp.Q.value = 0.3;
      const lo = 330, hi = 1500, a = kind === 'in' ? lo : hi, b = kind === 'in' ? hi : lo;
      bp.frequency.setValueAtTime(a * Math.pow(b / a, start), t); bp.frequency.exponentialRampToValueAtTime(b, t + left);
      const peak = 1;
      if (kind === 'in') {
        const rise = Math.max(0.1, dur * 0.78 - dur * start);
        gn.gain.setValueAtTime(0.0001 + peak * Math.min(1, start / 0.78), t);
        if (start < 0.78) gn.gain.linearRampToValueAtTime(peak, t + rise);
        gn.gain.linearRampToValueAtTime(0.0001, t + left);
      } else {
        const lvl = peak * 0.85 * Math.pow(1 - start, 1.6);
        gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(lvl, t + Math.min(0.5, left * 0.2));
        gn.gain.exponentialRampToValueAtTime(0.0001, t + left);
      }
      src.connect(bp); bp.connect(lp); lp.connect(gn); gn.connect(dest);
      src.start(t, Math.random() * 2); src.stop(t + left + 0.1);
      src.onended = done;
    } else {
      // Hold or rest: close to silence, with a faint warm tone.
      const gn = add(ctx.createGain());
      gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(0.045, t + Math.min(1.4, left * 0.4)); gn.gain.linearRampToValueAtTime(0.0001, t + left);
      gn.connect(dest);
      [146.83, 220].forEach((f, i) => { const o = add(ctx.createOscillator()), pg = add(ctx.createGain()); o.type = 'sine'; o.frequency.value = f; pg.gain.value = i ? 0.55 : 1; o.connect(pg); pg.connect(gn); o.start(t); o.stop(t + left + 0.1); if (!i) o.onended = done; });
    }
  }

  function bellOnce(ctx, dest, t) {
    const env = { ctx, rand: rng(3), live: new Set() };
    bellTone(env, dest, 74, t, 0.6, 4.2); bellTone(env, dest, 81, t + 0.01, 0.2, 3.2);
  }

  /* Three seconds in; the wind-down also fades away across the whole practice. */
  function musicFadeIn(param, t, mood, remaining) {
    param.cancelScheduledValues(t); param.setValueAtTime(0, t); param.linearRampToValueAtTime(1, t + 3);
    if (mood.fadeOut && remaining) { param.linearRampToValueAtTime(1, t + 3); param.linearRampToValueAtTime(0, t + Math.max(8, remaining)); }
  }

  /* ---- the live engine: one lazily created context shared by everything on the player ---- */
  class Engine {
    constructor() {
      this.ctx = null; this.mix = null; this.music = null; this.timer = 0; this.closeTimer = 0; this.fading = []; this.suspended = false;
      this.musicVol = 0.55; this.breathVol = 0.6; this.ducked = false; this.ambient = false; this.practice = '';
    }
    get supported() { return !!AC; }
    /* Call from a tap: creates the context and resumes it. */
    unlock() {
      if (!AC) return false;
      clearTimeout(this.closeTimer); this.closeTimer = 0;
      if (!this.ctx || this.ctx.state === 'closed') {
        try { this.ctx = new AC({ latencyHint: 'playback' }); } catch { try { this.ctx = new AC(); } catch { this.ctx = null; return false; } }
        this.mix = mixer(this.ctx); this.applyLevels(true);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      this.suspended = false;
      return true;
    }
    get running() { return !!this.ctx && this.ctx.state === 'running'; }
    applyLevels(now) {
      if (!this.mix) return;
      const t = this.ctx.currentTime, k = now ? 0.001 : 0.25;
      this.mix.musicLevel.gain.setTargetAtTime(this.musicVol * 0.2 * (this.ambient ? 0.5 : 1), t, k);
      this.mix.breathLevel.gain.setTargetAtTime(this.breathVol * 0.38, t, k);
    }
    setVolumes(m, b) { if (m != null) this.musicVol = clamp(m, 0, 1); if (b != null) this.breathVol = clamp(b, 0, 1); this.applyLevels(); }
    setAmbient(on) { this.ambient = !!on; this.applyLevels(); }
    duck(on) {
      this.ducked = !!on;
      if (!this.mix) return;
      this.mix.musicDuck.gain.setTargetAtTime(on ? 0.4 : 1, this.ctx.currentTime, on ? 0.15 : 0.7);
    }
    /* Start a practice's music. Fades in over three seconds; winddown fades away over the whole practice. */
    startMusic(id, o) {
      o = o || {};
      if (!this.unlock()) return false;
      this.stopMusic(1.2, true);
      const ctx = this.ctx, t = ctx.currentTime + 0.05;
      this.practice = id;
      this.music = createMusic(ctx, this.mix.musicIn, id, Object.assign({}, o, { t0: t }));
      musicFadeIn(this.mix.musicFade.gain, t, this.music.mood, o.remaining);
      this.music.schedule(t + 4);
      clearInterval(this.timer);
      this.timer = setInterval(() => { if (this.music && this.ctx && this.ctx.state === 'running') this.music.schedule(this.ctx.currentTime + 4); }, 400);
      return true;
    }
    pause() {
      if (!this.ctx || this.ctx.state !== 'running') return;
      const t = this.ctx.currentTime;
      if (this.mix) { this.mix.master.gain.cancelScheduledValues(t); this.mix.master.gain.setTargetAtTime(0, t, 0.07); }
      this.suspended = true;
      const ctx = this.ctx;
      setTimeout(() => { if (this.suspended && this.ctx === ctx) ctx.suspend().catch(() => {}); }, 320);
    }
    resume() {
      if (!this.ctx || this.ctx.state === 'closed') return false;
      this.suspended = false;
      const ctx = this.ctx, go = () => { if (this.mix) { const t = ctx.currentTime; this.mix.master.gain.cancelScheduledValues(t); this.mix.master.gain.setTargetAtTime(1, t, 0.6); } };
      if (ctx.state === 'suspended') ctx.resume().then(go).catch(() => {}); else go();
      return true;
    }
    stopMusic(fade, quick) {
      if (!this.music || !this.ctx) { this.music = null; return; }
      const ctx = this.ctx, t = ctx.currentTime, f = fade == null ? 4 : fade, m = this.music;
      this.music = null; clearInterval(this.timer); this.timer = 0;
      const gain = this.mix.musicFade.gain;
      try { gain.cancelScheduledValues(t); gain.setValueAtTime(gain.value, t); gain.linearRampToValueAtTime(0, t + f); } catch { /* ignore */ }
      m.stop(t + f + 0.1);
      if (this.suspended && ctx.state === 'suspended') ctx.resume().catch(() => {});
      if (!quick) this.scheduleClose(f + 3);
    }
    scheduleClose(seconds) {
      clearTimeout(this.closeTimer);
      this.closeTimer = setTimeout(() => {
        if (this.music) return;
        const ctx = this.ctx; this.ctx = null; this.mix = null;
        if (ctx && ctx.state !== 'closed') ctx.close().catch(() => {});
      }, seconds * 1000);
    }
    breath(kind, dur, start) {
      if (!this.running || !this.mix) return;
      breathCue(this.ctx, this.mix.breathIn, noiseSet(this.ctx), kind, dur, this.ctx.currentTime + 0.02, start);
    }
    bell() {
      if (!this.running || !this.mix) return;
      bellOnce(this.ctx, this.mix.bellIn, this.ctx.currentTime + 0.05);
    }
    /* Stop everything now and release the context shortly after. */
    shutdown(fade) {
      this.stopMusic(fade == null ? 4 : fade);
      if (!this.ctx) return;
      this.suspended = false;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      if (this.mix) { const t = this.ctx.currentTime; this.mix.master.gain.cancelScheduledValues(t); this.mix.master.gain.setValueAtTime(1, t); }
      this.scheduleClose((fade == null ? 4 : fade) + 3);
    }
  }

  /* Offline render for the tests: music or breath sounds through the real mixer, ready to measure. */
  function renderOffline(kind, id, seconds, opts) {
    if (!OAC) return Promise.reject(new Error('OfflineAudioContext unavailable'));
    opts = opts || {};
    const sr = 22050, ctx = new OAC(1, Math.ceil(seconds * sr), sr), mix = mixer(ctx);
    mix.musicLevel.gain.value = (opts.vol == null ? 0.55 : opts.vol) * 0.2; mix.breathLevel.gain.value = (opts.vol == null ? 0.6 : opts.vol) * 0.38;
    if (kind === 'music') {
      const m = createMusic(ctx, mix.musicIn, id, Object.assign({ t0: 0 }, opts));
      musicFadeIn(mix.musicFade.gain, 0, m.mood, opts.remaining);
      m.schedule(seconds);
    } else if (kind === 'breath') {
      const noise = noiseSet(ctx); let t = 0.1;
      for (const [k, d] of (opts.seq || [['in', 4], ['out', 6], ['in', 4], ['out', 6]])) { breathCue(ctx, mix.breathIn, noise, k, d, t, 0); t += d; }
    } else if (kind === 'bell') bellOnce(ctx, mix.bellIn, 0.1);
    return ctx.startRendering();
  }

  g.SereinAudio = { Engine, MOODS, MOOD_FOR, renderOffline, supported: !!AC, engine: new Engine() };
})(globalThis);
