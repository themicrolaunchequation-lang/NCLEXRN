/* Serein guided practice: voice guide.
 *   SereinVoice.SCRIPTS   spoken scripts for all 15 practices (intro, step lines, mid-step prompts, outro)
 *   SereinVoice.plan()    turns a practice (and the person's comfort options) into a step plan
 *   SereinVoice.rank()    ranks the voices the browser offers, best first
 *   SereinVoice.Narrator  sequential speechSynthesis queue: calm pacing, short pauses, never overlaps
 * Everything is local: speechSynthesis only, no audio files, no network of our own. */
(function (g) {
  'use strict';

  const OUTRO = 'Well done. Take one more easy breath before you go back.';
  const SAFE = 'If anything does not feel comfortable, skip it, or stop whenever you like.';
  const EXTERNAL = 'Look around the room you are actually in. Notice a neutral detail, or a place where you feel supported.';
  const WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

  /* Step lines are written to be heard once, slowly, by someone who is tired. Times are seconds from the start of a
     step. A prompt with f (0-1) lands at that fraction of the step. minStep drops the optional prompts on short steps. */
  const SCRIPTS = {
    tide: {
      kind: 'breath',
      intro: 'Find a comfortable position. There is nothing to achieve here.',
      outro: OUTRO,
      captions: { in: 'Breathe in gently, only as far as feels comfortable.', out: 'Let the breath leave without forcing it.' },
      reminders: [
        { cycle: 3, text: 'Breathe in your own way. You can slow down, or stop, whenever you like.' },
        { cycle: 6, text: 'Let your shoulders drop as the breath leaves.' },
        { cycle: 10, text: 'There is nothing to get right.' }
      ],
      last: 'One more breath, and then we will finish.'
    },
    box: {
      kind: 'breath',
      intro: 'Find a comfortable position. We will breathe gently, one side of the square at a time.',
      outro: OUTRO,
      captions: { in: 'Breathe in gently, along the first side.', hold: 'Hold gently, only if that is comfortable.', out: 'Breathe out, along the next side.', rest: 'Rest gently, with no strain.' },
      reminders: [
        { cycle: 2, text: 'If a hold does not feel comfortable, make it shorter, or skip it.' },
        { cycle: 5, text: 'Keep your shoulders soft.' }
      ],
      last: 'One more square, and then we will finish.'
    },
    ground: {
      intro: 'Find a comfortable position. There is nothing to achieve here. Go at your own pace, and skip anything that does not feel right.',
      outro: OUTRO,
      steps: [
        { say: 'Look around you, and notice five things you can see. A colour, a shape, the way light meets a surface.', prompts: [{ at: 18, text: 'Take your time. You can tap a circle as you notice each one, or simply look.' }, { at: 55, text: 'When you are ready, press Continue.' }] },
        { say: 'Now notice four things you can feel. Your feet supported by the floor, the chair beneath you, the fabric of your sleeve. There is no need to touch anything new.', prompts: [{ at: 20, text: 'Take a moment with each sensation.' }, { at: 55, text: 'Continue whenever you are ready.' }] },
        { say: 'Next, notice three sounds. Near, or far away. If hearing is not available to you, notice three more things you can see.', prompts: [{ at: 18, text: 'Let the sounds come and go.' }, { at: 50, text: 'Continue whenever you are ready.' }] },
        { say: 'Notice two smells, if there are any. If not, call to mind two familiar scents, or choose two colours instead.', prompts: [{ at: 20, text: 'There is no right answer here.' }, { at: 50, text: 'Continue whenever you are ready.' }] },
        { say: 'Finally, notice one taste, if that is comfortable. Nothing needs to go in your mouth. Or name one thing you appreciate.', prompts: [{ at: 20, text: 'When you are ready, press Continue to finish.' }] }
      ]
    },
    release: {
      intro: 'Sit comfortably. Stop whenever you like.',
      outro: OUTRO,
      steps: [
        { say: 'Lightly close your hands.', prompts: [{ at: 6.5, text: 'Now let go. Let your fingers soften, and notice how that feels, without judging.' }, { at: 19, text: 'If this does not feel comfortable, skip it and just rest your hands.' }], relax: 'Let your hands rest, with comfortable support. No tensing is needed.' },
        { say: 'Lift your shoulders just a little. Keep breathing.', prompts: [{ at: 5.5, text: 'And let them settle. There is no perfect position.' }, { at: 19, text: 'Notice the support of your chair.' }], relax: 'Let your shoulders rest, with comfortable support. No lifting is needed.' },
        { say: 'Press your feet lightly into the floor.', prompts: [{ at: 5.5, text: 'And release. Let the effort in your feet and lower legs melt away.' }, { at: 19, text: 'Use only as much effort as feels easy.' }], relax: 'Let your feet and lower legs rest, with comfortable support.' },
        { say: 'Now rest. Let your whole body be supported, and breathe naturally.', prompts: [{ at: 14, text: 'Notice what has changed, if anything. There is nothing to achieve.' }] }
      ]
    },
    desk: {
      intro: 'Sit comfortably. Move only as far as feels easy.',
      outro: OUTRO,
      steps: [
        { say: 'Gently lift your shoulders a little, then let them lower.', prompts: [{ at: 11, text: 'Once more, slowly. Lift, and lower. Keep breathing naturally.' }, { at: 23, text: 'Notice any difference.' }] },
        { say: 'Slowly uncurl your fingers, then let your hands soften.', prompts: [{ at: 11, text: 'Open, and rest. Move only within a comfortable range.' }, { at: 23, text: 'Let your hands be heavy.' }] },
        { say: 'Turn your head to the left, within a comfortable range. Then return to the centre.', prompts: [{ at: 13, text: 'Now to the right, slowly, and return to the centre.' }, { at: 24, text: 'Keep your shoulders soft.' }] }
      ]
    },
    scan: {
      intro: 'Find a comfortable position. There is nothing to fix.',
      outro: OUTRO,
      steps: [
        { say: 'Notice where your feet meet the floor, and where your body meets the chair. Nothing needs to change.', prompts: [{ f: 0.7, text: 'Let the surface do the holding.' }], minStep: 28 },
        { say: 'Bring your attention to your legs. Notice whatever is there, or choose to look at the room instead.', prompts: [{ f: 0.62, text: 'There is no need to change anything.' }], minStep: 28 },
        { say: 'Notice the weight and temperature of your hands.', prompts: [{ f: 0.5, text: 'Just noticing. Nothing to fix.' }], minStep: 22 },
        { say: 'Notice your shoulders, and what is supporting them. There is no need to soften on command.', prompts: [{ f: 0.62, text: 'Let them be exactly as they are.' }], minStep: 28 },
        { say: 'Notice your face, and your expression, without judging it.', prompts: [{ f: 0.5, text: 'If it feels comfortable, notice your jaw and eyes. You do not need to change them.' }], minStep: 28 },
        { say: 'Now widen your attention to your whole body. Then, when you are ready, look around the room.', prompts: [{ f: 0.66, text: 'Take a moment before you return.' }], minStep: 28 }
      ]
    },
    fullrelease: {
      intro: 'Sit comfortably. Each effort is optional, and small. Stop whenever you like.',
      outro: OUTRO,
      steps: [
        { say: 'Optional: close your hands lightly, then let them open.', prompts: [{ f: 0.5, text: 'Release. Notice the difference between effort and ease.' }] },
        { say: 'Optional: use a little effort in your arms, then release.', prompts: [{ f: 0.5, text: 'Let your arms rest. Keep breathing.' }] },
        { say: 'Optional: make a small lift of your shoulders, then return comfortably.', prompts: [{ f: 0.5, text: 'And let them settle.' }] },
        { say: 'Optional: press your feet lightly into the floor, then release.', prompts: [{ f: 0.5, text: 'Let your legs feel heavy, and supported.' }] },
        { say: 'No effort now. Notice your chair supporting you.', prompts: [{ f: 0.45, text: 'There is nothing left to do. Just rest.' }] }
      ]
    },
    handreset: {
      intro: 'Rest your arms comfortably. Move gently, and stop whenever you like.',
      outro: OUTRO,
      steps: [
        { say: 'Rest your forearms comfortably, and keep your wrists neutral.' },
        { say: 'Gently uncurl your fingers, within a comfortable range.', prompts: [{ f: 0.5, text: 'Slowly, and only as far as feels easy.' }], minStep: 20 },
        { say: 'Return to a relaxed hand. There is no need to grip.' },
        { say: 'Let your hands be supported. Stop whenever you prefer.' }
      ]
    },
    shoulderreset: {
      intro: 'Sit supported. Move gently, and stop whenever you like.',
      outro: OUTRO,
      steps: [
        { say: 'Sit supported, with your arms resting comfortably.' },
        { say: 'If it is comfortable, lift your shoulders a little. Keep breathing naturally.', prompts: [{ f: 0.55, text: 'Only a little. There is no need to push.' }], minStep: 20 },
        { say: 'Now return gently. There is no need to push your shoulders down.' },
        { say: 'Notice the support beneath you. You can stop whenever you like.' }
      ]
    },
    ankles: {
      intro: 'Use a stable chair. Move gently, and stop whenever you like.',
      outro: OUTRO,
      steps: [
        { say: 'Support your leg and foot in a comfortable way.' },
        { say: 'If it is comfortable, move one ankle gently up and down.', prompts: [{ f: 0.55, text: 'Slowly. Stop if you feel any discomfort.' }], minStep: 26 },
        { say: 'Repeat on the other side, only if that is suitable for you.', prompts: [{ f: 0.55, text: 'Keep it small and easy.' }], minStep: 26 },
        { say: 'Return both feet to comfortable support, and rest.' }
      ]
    },
    listen: {
      intro: 'Find a comfortable position. There is nothing to achieve here. We will simply listen.',
      outro: OUTRO,
      steps: [
        { say: 'Look around, and choose a comfortable position.', prompts: [{ f: 0.55, text: 'Let your eyes rest on something neutral.' }], minStep: 28 },
        { say: 'Notice a sound nearby, or a nearby detail you can see.', prompts: [{ f: 0.5, text: 'Just listen. You do not need to name it.' }], minStep: 28 },
        { say: 'Now notice something further away. There is no need to search hard.', prompts: [{ f: 0.55, text: 'Let it come to you.' }], minStep: 28 },
        { say: 'Let your attention include the room as a whole. Sounds and silence together.', prompts: [{ f: 0.6, text: 'Rest here for a moment.' }], minStep: 28 }
      ]
    },
    pause3: {
      intro: 'Find a comfortable position. This is a short pause, and you can stop at any time.',
      outro: OUTRO,
      steps: [
        { say: 'Take a moment to notice how you are arriving. Thoughts, feelings, or what is around you.', prompts: [{ at: 24, text: 'Whatever is here is allowed. Simply notice.' }, { at: 44, text: 'You do not have to change anything.' }] },
        { say: 'Now choose an anchor. Your natural breathing, your feet supported, or something you can see.', prompts: [{ at: 24, text: 'Rest your attention there. If it wanders, gently come back.' }, { at: 46, text: 'Coming back is the practice.' }] },
        { say: 'Now widen your attention to include your body, and the room.', prompts: [{ at: 24, text: 'When you are ready, choose one useful next step.' }, { at: 46, text: 'Just one. It can be a small one.' }] }
      ]
    },
    quietplace: {
      intro: 'Find a comfortable position. You can keep your eyes open. Stop whenever you like.',
      outro: OUTRO,
      steps: [
        { say: 'Choose an ordinary place that feels comfortable enough. Real, or imagined.', prompts: [{ f: 0.6, text: 'There is no need to make it perfect.' }], minStep: 28 },
        { say: 'Notice any light, colours or textures. You can simply look at the picture.', prompts: [{ f: 0.55, text: 'Let the details be as faint, or as clear, as they are.' }], minStep: 28 },
        { say: 'Stay a little longer. You do not need a vivid image. Keep your eyes open if you prefer.', prompts: [{ f: 0.62, text: 'Nothing to do. Just stay.' }], minStep: 28 },
        { say: 'Now look around the room you are actually in, and notice what is supporting you.', prompts: [{ f: 0.6, text: 'Take a moment before you go back.' }], minStep: 28 }
      ]
    },
    walk: {
      intro: 'Choose a clear, level space, and stop whenever you like.',
      outro: OUTRO,
      steps: [
        { say: 'While you are still, look ahead at the space you will use.', prompts: [{ f: 0.62, text: 'Put your screen away before you move.' }], minStep: 22 },
        { say: 'Put the screen away before you move. Walk at your own comfortable pace.', prompts: [{ f: 0.55, text: 'Let each step be ordinary, and unhurried.' }], minStep: 28 },
        { say: 'Notice the ordinary contact of your feet, and your surroundings. There is no need to change how you walk.', prompts: [{ f: 0.62, text: 'Let your attention rest on whatever you notice.' }], minStep: 28 },
        { say: 'Come to a stop in a stable position, and bring your attention back to the room.' }
      ]
    },
    winddown: {
      intro: 'Find a supported position. There is nothing to achieve here, and no need to fall asleep.',
      outro: 'Well done. You can rest here for as long as you like.',
      steps: [
        { say: 'Choose a comfortable, supported position. Let the surface take your weight.', prompts: [{ f: 0.6, text: 'There is nowhere you need to be.' }], minStep: 28 },
        { say: 'Notice the surface that is supporting you. You are not trying to sleep.', prompts: [{ f: 0.6, text: 'Let your breathing be natural.' }], minStep: 28 },
        { say: 'Let your hands and shoulders rest. There is no need to tense anything first.', prompts: [{ f: 0.6, text: 'Soften your jaw, if that feels comfortable.' }], minStep: 28 },
        { say: 'Notice one thing that can wait until tomorrow, and set it down for now.', prompts: [{ f: 0.6, text: 'It will still be there. You do not have to solve it tonight.' }], minStep: 28 },
        { say: 'You can end here, or carry on resting. There is nothing to achieve.', prompts: [{ f: 0.55, text: 'Rest as long as you like.' }], minStep: 28 }
      ]
    }
  };

  /* ---- plan: the same structure whatever the practice, so the player has one code path ---- */
  function plan(practice, session) {
    const sc = SCRIPTS[practice.id];
    const mode = { relax: !!(session && session.relaxOnly), external: !!(session && session.external), noHolds: !!(session && session.noHolds) };
    if (!sc) return { kind: 'steps', id: practice.id, intro: '', outro: OUTRO, steps: practice.steps.map(([title, cue]) => ({ title, say: cue, prompts: [] })), mode };
    if (sc.kind === 'breath') return { kind: 'breath', id: practice.id, intro: sc.intro, outro: sc.outro, captions: sc.captions, reminders: sc.reminders, last: sc.last, mode };
    const steps = practice.steps.map(([title, cue], i) => {
      const s = sc.steps[i] || { say: cue };
      let say = s.say, prompts = (s.prompts || []).slice();
      if (mode.external) { say = EXTERNAL; prompts = []; }
      else if (mode.relax && practice.movement) {
        say = s.relax || 'Now, ' + title.toLowerCase() + '. Let it rest, with comfortable support. No tensing or movement is needed.';
        prompts = [];
      }
      return { title, say, prompts, minStep: s.minStep || 0 };
    });
    return { kind: 'steps', id: practice.id, intro: mode.external ? 'Find a comfortable position. There is nothing to achieve here. ' + 'We will keep your attention on the room around you.' : sc.intro, outro: sc.outro, steps, mode };
  }

  /* The lead word and counts spoken for one breath phase: "In... two... three... four." */
  function countWords(kind, seconds, gentle) {
    const n = Math.max(1, Math.round(seconds));
    const lead = kind === 'in' ? 'In' : kind === 'out' ? 'Out' : kind === 'hold' ? (gentle ? 'Hold gently' : 'Hold') : (gentle ? 'Rest gently' : 'Rest');
    const out = [lead];
    for (let i = 2; i <= n && i <= WORDS.length; i++) out.push(WORDS[i - 1]);
    return out;
  }

  /* Rough speaking time, used by the fit check in the tests and to drop prompts that would be spoken late. */
  function speakSeconds(text, rate) {
    const words = String(text).trim().split(/\s+/).filter(Boolean).length;
    const sentences = (String(text).match(/[.!?…]+/g) || []).length;
    return words / (2.35 * (rate || 0.88) / 0.88) + Math.max(0, sentences - 1) * 0.5 + 0.35;
  }

  /* ---- voice ranking ---- */
  const NOVELTY = /espeak|robot|novelty|bad news|good news|bubbles|cellos|zarvox|trinoids|whisper|bells|boing|organ|albert|fred|junior|ralph|kathy|superstar|wobble|jester|hysterical|deranged/i;
  const NAME_BONUS = [
    [/natural/i, 34], [/neural/i, 32], [/online/i, 30], [/premium/i, 26], [/enhanced/i, 22],
    [/google uk english female/i, 26], [/sonia/i, 30], [/libby/i, 28], [/hazel/i, 14], [/serena/i, 20], [/kate/i, 18], [/samantha/i, 16], [/daniel/i, 16], [/stephanie|martha|fiona|moira|karen|tessa/i, 8]
  ];
  function score(v) {
    const lang = String(v.lang || '').replace('_', '-');
    let s = 0;
    if (/^en-GB/i.test(lang)) s += 100; else if (/^en(-|$)/i.test(lang)) s += /^en-(AU|IE|ZA|NZ|IN)/i.test(lang) ? 46 : 40; else return -1e6;
    const name = String(v.name || '');
    for (const [re, b] of NAME_BONUS) if (re.test(name)) s += b;
    if (/compact/i.test(name) || /compact/i.test(String(v.voiceURI || ''))) s -= 60;
    if (NOVELTY.test(name)) s -= 300;
    if (v.localService) s += 4;
    if (v.default) s += 2;
    return s;
  }
  function rank(list) {
    const voices = Array.from(list || []).map(v => ({ v, s: score(v) })).filter(x => x.s > 0);
    voices.sort((a, b) => b.s - a.s || String(a.v.name).localeCompare(String(b.v.name)));
    return voices.map(x => x.v);
  }
  function pick(list, savedURI) {
    const ranked = rank(list);
    if (savedURI) { const chosen = ranked.find(v => v.voiceURI === savedURI); if (chosen) return chosen; }
    return ranked[0] || null;
  }

  /* ---- narrator ---- */
  function splitSentences(text) {
    // Break on full stops and ellipses (a natural gap), keep short phrases together.
    const parts = String(text).replace(/\s+/g, ' ').trim().match(/[^.!?…]+[.!?…]*/g) || [];
    return parts.map(p => p.trim()).filter(Boolean).map(p => ({ text: p.replace(/[…]+$/, '').replace(/\.{2,}$/, '.'), gap: /…|\.\.\./.test(p) ? 600 : /[?]$/.test(p) ? 520 : /[.!]$/.test(p) ? 460 : 350 }));
  }

  class Narrator {
    constructor(opts) {
      this.opts = opts || {};
      this.queue = []; this.token = 0; this.active = null; this.timer = 0; this.watchdog = 0; this.keep = 0; this.refs = [];
      this.speaking = false; this.pending = false;
    }
    get synth() { return g.speechSynthesis || null; }
    get available() { return !!(this.synth && g.SpeechSynthesisUtterance); }
    get busy() { return this.pending || this.speaking || this.queue.length > 0; }
    voice() { return this.opts.getVoice ? this.opts.getVoice() : null; }
    rate() { return Math.min(1.2, Math.max(0.6, Number(this.opts.getRate ? this.opts.getRate() : 0.88) || 0.88)); }
    emit(on) { if (this.speaking !== on) { this.speaking = on; try { this.opts.onSpeaking && this.opts.onSpeaking(on); } catch { /* ignore */ } } }
    /* Queue text. tick lines are single count words; they are never queued behind other speech. */
    say(text, o) {
      if (!this.available || !text) return false;
      o = o || {};
      const parts = o.single ? [{ text: String(text), gap: o.gap == null ? 120 : o.gap }] : splitSentences(text);
      for (const p of parts) this.queue.push({ text: p.text, gap: o.gap == null ? p.gap : o.gap, pitch: o.pitch, rate: o.rate });
      if (!this.active && !this.timer) this.next();
      return true;
    }
    next() {
      clearTimeout(this.timer); this.timer = 0;
      const item = this.queue.shift();
      if (!item) { this.active = null; this.pending = false; this.emit(false); return; }
      const synth = this.synth, token = this.token;
      let u;
      try { u = new g.SpeechSynthesisUtterance(item.text); } catch { this.active = null; return; }
      const v = this.voice();
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
      u.rate = item.rate || this.rate(); u.pitch = item.pitch || 0.98; u.volume = 1;
      this.refs.push(u); if (this.refs.length > 8) this.refs.shift(); // keeps utterances alive: Chrome drops events on collected ones
      let done = false;
      const finish = () => {
        if (done) return; done = true;
        clearTimeout(this.watchdog); clearInterval(this.keep);
        if (token !== this.token) return;
        this.active = null; this.pending = false;
        if (this.queue.length) this.timer = setTimeout(() => this.next(), item.gap);
        else this.timer = setTimeout(() => { this.timer = 0; if (!this.queue.length && !this.active) this.emit(false); else if (!this.active) this.next(); }, Math.min(item.gap, 450));
      };
      u.onstart = () => { if (token === this.token) { this.pending = false; this.emit(true); } };
      u.onend = finish; u.onerror = ev => { if (ev && ev.error && ev.error !== 'canceled' && ev.error !== 'interrupted') { try { this.opts.onFail && this.opts.onFail(ev.error); } catch { /* ignore */ } } finish(); };
      this.active = u; this.pending = true;
      try { this.opts.onUtter && this.opts.onUtter(item); } catch { /* ignore */ }
      // Some engines never report the end of an utterance; do not let the queue stall.
      this.watchdog = setTimeout(finish, (speakSeconds(item.text, u.rate) + 3.5) * 1000);
      // Chrome stops long network utterances after about 15 seconds; a pause/resume nudge keeps them going.
      if (v && !v.localService) {
        this.keep = setInterval(() => { try { if (synth.speaking && !synth.paused) { synth.pause(); synth.resume(); } } catch { /* ignore */ } }, 9000);
      }
      try { if (synth.paused) synth.resume(); synth.speak(u); } catch { finish(); }
    }
    /* Stop everything now. Late events from the cancelled utterance are ignored through the token. */
    cancel() {
      this.token++; this.queue.length = 0; this.active = null; this.pending = false;
      clearTimeout(this.timer); clearTimeout(this.watchdog); clearInterval(this.keep); this.timer = 0;
      try { const s = this.synth; if (s) s.cancel(); } catch { /* ignore */ }
      this.emit(false);
    }
  }

  g.SereinVoice = { SCRIPTS, OUTRO, SAFE, EXTERNAL, plan, countWords, speakSeconds, rank, pick, score, Narrator, splitSentences };
})(globalThis);
