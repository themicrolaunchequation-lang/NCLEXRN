/* Healthcare Crown Academy: one-minute app tours.
   Each tour opens on a hook, then a title card, eight or more real screens of the app with a slow camera move
   and a caption, a moment of numbers and an end card. A warm voiceover reads each scene (the browser's own
   speech voice, the most natural English voice the device has) over soft music made live with Web Audio, so
   there are no audio files to download. Sound can be muted and the choice is remembered.
   Controls: progress segments, play/pause, previous/next, sound, keyboard (Space, arrows, M, Esc), tap to skip.
   Reduced motion: no camera move, gentle cross-fades. Nothing loads until a tour is opened. */
(() => {
  'use strict';
  const IMG = '/assets/img/tour/';
  // [kind, image, kicker, headline, caption, focus[x,y], voiceover?]
  const T = {
    medlex: { name: 'MedLex', chip: 'M', color: '#3557D6', mood: 0, tag: 'Make sense of any medical word.', url: 'https://medlex.healthcarecrownacademy.co.uk/', cta: 'Open MedLex free', note: 'Free to start · Premium £2.99/month or with the Crown Pass',
      hook: ['1,480 medical words.', 'What if you only had to learn the pieces?'], bg: ['medlex-3', 'medlex-x4', 'medlex-4'],
      scenes: [
        ['shot', 'medlex-0', 'My Day', 'Ten minutes. Ten words. Every day.', 'A short daily session mixes new words with reviews, so your vocabulary grows without cramming.', [0.3, 0.35]],
        ['shot', 'medlex-x1', 'Learn', 'Clear words. Confident learning.', 'Lessons by body system, each explored on a single, beautiful canvas.', [0.5, 0.4]],
        ['shot', 'medlex-2', 'Word parts', 'Learn the code, not a list.', '66 prefixes, 60 roots and 100 suffixes. Learn the parts once and decode thousands of words.', [0.55, 0.45]],
        ['shot', 'medlex-x4', 'Prefix studio', 'One small beginning. A different meaning.', 'Hyper, hypo, tachy, brady: see how one prefix changes everything.', [0.35, 0.4]],
        ['shot', 'medlex-3', 'Library', 'Every term, taken apart.', 'See osteomyelitis as oste, o, myel and itis. Hear it spoken and save it for review.', [0.75, 0.4]],
        ['stats', [[1480, 'medical terms'], [26, 'body-system modules'], [56, 'illustrated guides'], [8, 'ways to practise']]],
        ['shot', 'medlex-x3', 'Decode it', 'What does gastr mean?', 'Quick, satisfying practice that turns recognition into recall.', [0.45, 0.4]],
        ['shot', 'medlex-4', 'Visual Atlas', 'Big, beautiful explainers.', 'Illustrated guides you can enlarge and study page by page.', [0.45, 0.5]],
        ['shot', 'medlex-5', 'Practice', 'Real recall beats an hour of re-reading.', 'Decode it, build it, match pairs, explain simply: practice that sticks.', [0.5, 0.6]],
        ['shot', 'medlex-x2', 'Modules', '100 terms per system, with outcomes.', 'Musculoskeletal, cardiovascular, nervous and more, each with clear learning outcomes.', [0.4, 0.5]],
        ['shot', 'medlex-x5', 'For educators', 'Teach with it, too.', 'Build assignments, set due dates and review learning evidence from your group.', [0.4, 0.45]],
      ] },
    carecraft: { name: 'Carecraft', chip: 'C', color: '#0F8A86', mood: 1, tag: 'One useful minute of practice a day.', url: 'https://carecraft.healthcarecrownacademy.co.uk/', cta: 'Open Carecraft free', note: 'Free to start · Premium £2.99/month or with the Crown Pass',
      hook: ['The hardest moment on shift', 'is not always clinical. Sometimes it is the next sentence you say.'], bg: ['carecraft-s0', 'carecraft-x2', 'carecraft-3'],
      scenes: [
        ['shot', 'carecraft-0', 'My Day', 'Your scenario is ready.', 'One moment from a working day. Think first, then compare your reasoning.', [0.3, 0.35]],
        ['shot', 'carecraft-s0', '60-second scenario', 'What would you say?', 'Realistic, fictional moments: handovers, feedback and safety, with the reasoning explained.', [0.2, 0.45]],
        ['shot', 'carecraft-1', 'Learn', 'Thirty lessons for the work you do.', 'Frameworks, scenarios, checklists and visual guides, from foundation to advanced.', [0.5, 0.35]],
        ['shot', 'carecraft-x1', 'A lesson', 'Conversations that build trust.', 'Read, practise and reflect, with your own notes beside every lesson.', [0.5, 0.4]],
        ['stats', [[30, 'short lessons'], [90, 'visual guides'], [22, 'practice activities'], [18, 'toolkit job-aids']]],
        ['shot', 'carecraft-x2', 'Learn as slides', 'A guided slideshow, when you want one.', 'Fourteen slides, a spotlight tour of the infographics, and checks along the way.', [0.55, 0.45]],
        ['shot', 'carecraft-2', 'Practice', 'Rehearse the conversations that matter.', 'Communicate, escalate, hand over. Coverage shows the skills you have practised.', [0.55, 0.45]],
        ['shot', 'carecraft-x3', 'An activity', 'Pass the message clearly.', 'Order a handover, then see what a good one sounds like, and why it works.', [0.4, 0.4]],
        ['shot', 'carecraft-3', 'Toolkit', 'Help for the moments that matter.', 'SBAR and ISBAR handovers, huddles and debriefs, ready when you need them.', [0.45, 0.6]],
      ] },
    serein: { name: 'Serein', chip: 'S', color: '#2B735E', mood: 2, tag: 'A little room to breathe, between tasks.', url: 'https://serein.healthcarecrownacademy.co.uk/', cta: 'Open Serein free', note: 'Free for everyone, always',
      hook: ['You look after everyone.', 'Who looks after you, between tasks?'], bg: ['serein-1', 'serein-x1', 'serein-3'],
      scenes: [
        ['shot', 'serein-0', 'My Day', 'Make room for you.', 'A two-minute pause between tasks. No streak to keep, nothing monitored.', [0.3, 0.35]],
        ['shot', 'serein-x1', 'Breathing Tide', 'Breathe in gently, as far as feels comfortable.', 'Guided practices with calm visuals, a soft voice and your choice of sound.', [0.3, 0.45]],
        ['shot', 'serein-1', 'Library', 'Find what fits.', 'Breathing, grounding, movement and reflection, from one to five minutes.', [0.55, 0.3]],
        ['stats', [[15, 'short practices'], [12, 'illustrated guides'], [2, 'minutes is enough'], [0, 'things monitored']]],
        ['shot', 'serein-x2', 'Journeys', 'Small steps that add up.', 'Gentle journeys and routines for before, during and after a shift.', [0.5, 0.35]],
        ['shot', 'serein-2', 'Toolkit', 'Small tools for real shifts.', 'Before a shift, between tasks, after a hard moment: pick the moment, get the tool.', [0.4, 0.4]],
        ['shot', 'serein-3', 'Visual Atlas', 'A clearer picture. A useful next step.', 'Richly illustrated guides for real working days.', [0.6, 0.55]],
        ['shot', 'serein-4', 'Your space', 'A little room for you.', 'Save the practices you love and build your own routine.', [0.4, 0.5]],
        ['shot', 'serein-x4', 'Support', 'You do not have to hold it alone.', 'Real help is one tap away, with trusted services listed clearly.', [0.45, 0.45]],
      ] },
    lumen: { name: 'Lumen', chip: 'L', color: '#8B6CF0', mood: 3, tag: 'Turn your own notes into recall.', url: 'https://lumen.healthcarecrownacademy.co.uk/', cta: 'Open Lumen free', note: 'Free to start · Premium £4.99/month or with the Crown Pass',
      hook: ['You highlighted everything.', 'So why does so little stick?'], bg: ['lumen-x1', 'lumen-1', 'lumen-x3'],
      scenes: [
        ['shot', 'lumen-0', 'My Day', 'Bring in something to study.', 'Add a PDF or photos of your notes. Everything stays private on your device.', [0.3, 0.35]],
        ['shot', 'lumen-1', 'Library', 'Your library, your way.', 'Lecture notes, handouts and books in one calm reading space.', [0.45, 0.5]],
        ['shot', 'lumen-x1', 'Reader', 'Read with a little more intention.', 'Highlight, add sticky notes and ask questions right on the page.', [0.35, 0.4]],
        ['shot', 'lumen-x2', 'Notes', 'A thought in the margin can become a connection.', 'Every highlight and note, gathered and searchable.', [0.5, 0.4]],
        ['stats', [[5, 'step learning loop'], [6, 'practical study methods'], [0, 'automatic uploads'], [20, 'card daily goal to start']]],
        ['shot', 'lumen-x3', 'Study studio', 'Make recall cards from what matters.', 'Cards come from your own sources, so you study what you will be asked.', [0.55, 0.4]],
        ['shot', 'lumen-x4', 'Active recall', 'Think first. Then reveal.', 'Review timing adapts to how well you knew each card.', [0.5, 0.35]],
        ['shot', 'lumen-3', 'Methods', 'Small actions. Stronger connections.', 'Read, explain, recall, verify, return: a simple loop for learning that lasts.', [0.45, 0.45]],
        ['shot', 'lumen-2', 'Your studio', 'Start with one good question.', 'Quizzes, practice and recall cards, in one quiet place.', [0.55, 0.35]],
      ] },
    snle: { name: 'Gulf Region Nursing', chip: 'G', color: '#347A9A', mood: 4, tag: 'Your Gulf Region nursing licence, one safe decision at a time.', url: 'https://snle.healthcarecrownacademy.co.uk/', cta: 'Open the studio', note: 'US$25 a month or US$50 for 3 months, per exam',
      hook: ['One exam stands between you', 'and your nursing career in the Gulf Region.'], bg: ['snle-6', 'snle-2', 'snle-3'],
      scenes: [
        ['shot', 'snle-0', 'Four exams, one studio', 'Saudi Arabia, Qatar, Dubai and Abu Dhabi.', 'Pick your regulator. Each exam keeps its own progress.', [0.3, 0.45]],
        ['shot', 'snle-1', 'Today', 'A plan for today, every day.', 'Set your exam date and the studio suggests a daily pace.', [0.35, 0.35]],
        ['shot', 'snle-6', 'Question Bank', 'Answer, then see the reasoning.', 'Every question explains the safest choice, a clinical pearl and the trap to avoid.', [0.75, 0.4]],
        ['shot', 'snle-x1', 'Mock exam', 'One exam card. Two ways to train.', 'Tutor mode for instant feedback, or a timed simulation that feels like the real day.', [0.4, 0.4]],
        ['stats', [[1297, 'clinically reviewed questions'], [67, 'clinical decision tools'], [350, 'dossier cases'], [4, 'Gulf Region exams']]],
        ['shot', 'snle-2', 'React & Interact', '67 clinical decision tools.', 'From ABCDE to the Four Ts, each with its own questions.', [0.55, 0.45]],
        ['shot', 'snle-3', 'Clinical Dossier', '35 specialty dossiers.', 'Practise the same reasoning inside a full clinical story.', [0.55, 0.5]],
        ['shot', 'snle-4', 'Interactive Labs', 'Decode the question before you answer it.', 'Nine labs on how licensing questions are built, and how the safest answer wins.', [0.4, 0.4]],
        ['shot', 'snle-x2', 'Glossary', 'Bilingual, searchable, exam-ready.', 'Question language explained in English and Arabic.', [0.5, 0.45]],
        ['shot', 'snle-x3', 'Exam guide', 'Know the exam before it knows you.', 'Questions, timing, pass marks and attempts, checked against the regulator.', [0.4, 0.4]],
        ['shot', 'snle-x4', 'Readiness', 'See exactly where you stand.', 'Accuracy by domain shows what to practise next.', [0.45, 0.45]],
      ] },
    evinca: { name: 'Evinca', chip: 'E', color: '#D4A445', mood: 5, tag: 'Your best work, recognised on evidence.', url: 'https://evinca.healthcarecrownacademy.co.uk/en', cta: 'Visit Evinca', note: 'Spotlight Stories are free',
      hook: ['Somebody made care better today.', 'Did anyone write it down?'], bg: ['evinca-0', 'evinca-covers', 'evinca-about'],
      scenes: [
        ['shot', 'evinca-0', 'Evinca', 'Somebody made care better today.', 'An independent, evidence-reviewed recognition programme for everyone in healthcare.', [0.35, 0.4]],
        ['shot', 'evinca-about', 'The people behind care', 'The fall that didn’t happen.', 'The dose caught at three in the morning. The quiet work that changes outcomes.', [0.6, 0.4]],
        ['shot', 'evinca-2', 'Spotlight', 'Share your story, free.', 'Tell the story of what you achieved. Verify it when you are ready.', [0.3, 0.45]],
        ['shot', 'evinca-recognitions', 'Recognitions', 'Four marks. One verified record.', 'Spotlight each month, Distinction each quarter, Honor each year, and Laureate.', [0.35, 0.4]],
        ['stats', [[0, 'cost to share a story'], [4, 'review steps, in public'], [4, 'levels of recognition'], [1, 'record anyone can check']]],
        ['shot', 'evinca-1', 'How we review', 'Judged on evidence, in public.', 'Published criteria, independent human review, conflict controls and a record anyone can check.', [0.4, 0.45]],
        ['shot', 'evinca-covers', 'Covers', 'Every honoree gets a cover.', 'An official magazine cover, an announcement card and a story image.', [0.35, 0.6]],
        ['shot', 'evinca-magazine', 'The Evinca Review', 'A publication for the work behind the outcome.', 'Essays, profiles and method notes, plus the Honorees Edition.', [0.35, 0.45]],
        ['shot', 'evinca-verify', 'Verify', 'Verify an honor in seconds.', 'Every record has an ID and a QR code that anyone can check.', [0.35, 0.45]],
        ['shot', 'evinca-3', 'Honors 2027', 'The 2027 healthcare awards.', 'Open to nurses, midwives, physicians, pharmacists, allied health professionals, educators and leaders.', [0.35, 0.45]],
      ] },
    lss: { name: 'Lean Six Sigma Green Belt', chip: 'LSS', color: '#1F9D74', mood: 6, tag: 'Lean Six Sigma – Green Belt – for Healthcare Practitioners.', url: 'https://lss.healthcarecrownacademy.co.uk/', cta: 'Open the toolkit', note: 'Free to try · US$99 for 12 months, paid once',
      hook: ['Every delay on your ward has a cause.', 'What if you could prove it, and fix it?'], bg: ['lss-vsm', 'lss-simed', 'lss-edu'],
      scenes: [
        ['shot', '/assets/img/apps/lss-desktop.webp', 'DMAIC', 'Define. Measure. Analyse. Improve. Control.', 'Every stage of an improvement project, with the tools to run it, explained for healthcare.', [0.4, 0.4]],
        ['shot', 'lss-vsm', 'Value Stream Map', 'See where the time really goes.', 'Map each step, and the toolkit calculates lead time and process efficiency.', [0.35, 0.4]],
        ['shot', 'lss-simed', 'Simulation', 'Why queues explode near 100% busy.', 'Feel Little’s Law in an emergency department you can control.', [0.4, 0.55]],
        ['shot', 'lss-fishbone', 'Fishbone diagram', 'Find the real causes, together.', 'Brainstorm causes across people, methods, machines and more.', [0.4, 0.45]],
        ['stats', [[30, 'DMAIC tools'], [9, 'live statistical engines'], [10, 'simulations'], [1, 'Certificate of Completion']]],
        ['shot', 'lss-simcap', 'Capability sandbox', 'Fit the curve inside the limits.', 'Watch Cp and Cpk respond as you shift and squeeze the process.', [0.45, 0.55]],
        ['shot', 'lss-simspc', 'Control charts', 'Signal or noise?', 'Drag a point and watch the rules decide whether it matters.', [0.4, 0.5]],
        ['shot', 'lss-simintro', 'Six Sigma', '3.4 defects per million.', 'See what that tail really means for patient safety.', [0.45, 0.6]],
        ['shot', 'lss-fmea', 'Clinical FMEA', 'Prevent harm before it happens.', 'Score failure modes for severity, occurrence and detection, then act on the risk.', [0.4, 0.45]],
        ['shot', 'lss-edu', 'Learning Studio', 'Posters that make it click.', 'Illustrated guides for every tool, from SIPOC to value stream maps.', [0.5, 0.45]],
        ['shot', 'lss-examprep', 'Exam prep', 'Build understanding. Practise with purpose.', 'A knowledge exam, then your Certificate of Completion.', [0.4, 0.45]],
      ] },
  };
  const DUR = { hook: 4600, title: 3000, shot: 4400, stats: 4600, end: 0 };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const src = (f) => (f.startsWith('/') ? f : IMG + f + '.webp');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } } };

  /* ---------- Voiceover: the device's most natural English voice ---------- */
  const VO = (() => {
    const synth = window.speechSynthesis; let voice = null, current = null;
    const pick = () => {
      if (!synth) return null;
      const vs = synth.getVoices().filter((v) => /^en/i.test(v.lang)); if (!vs.length) return null;
      const score = (v) => (/natural|neural|online/i.test(v.name) ? 40 : 0) + (/en-GB/i.test(v.lang) ? 12 : /en-(US|AU|IE|CA)/i.test(v.lang) ? 6 : 0)
        + (/sonia|libby|ryan|serena|kate|martha|daniel|google uk english female|aria|jenny|samantha|karen|moira/i.test(v.name) ? 20 : 0) - (/compact|espeak|robot/i.test(v.name) ? 30 : 0);
      return vs.sort((a, b) => score(b) - score(a))[0];
    };
    if (synth) { voice = pick(); synth.addEventListener?.('voiceschanged', () => { voice = pick(); }); }
    return {
      ok: !!synth,
      say(text, onend) {
        if (!synth) { onend && onend(); return; }
        synth.cancel(); voice = voice || pick();
        const u = new SpeechSynthesisUtterance(text);
        if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-GB';
        u.rate = 0.97; u.pitch = 1.02; u.volume = 1;
        u.onend = u.onerror = () => { if (current === u) { current = null; onend && onend(); } };
        current = u; synth.speak(u);
      },
      pause() { synth && synth.pause(); }, resume() { synth && synth.resume(); },
      stop() { current = null; synth && synth.cancel(); },
      speaking: () => !!current,
    };
  })();

  /* ---------- Music: a soft, warm pad with a gentle arpeggio, made live (no files) ---------- */
  const MUSIC = (() => {
    let ctx = null, master = null, timer = 0, step = 0, duck = 1, on = false;
    // Seven moods (one per app): chord roots in semitones from A3, all major-ish and calm.
    const MOODS = [[0, 5, 9, 7], [2, 7, 9, 5], [0, 9, 5, 7], [4, 9, 0, 7], [2, 9, 7, 5], [0, 5, 7, 4], [7, 0, 5, 2]];
    const hz = (s) => 220 * Math.pow(2, s / 12);
    let mood = MOODS[0];
    function voice(freq, t, len, type, gain, cutoff) {
      const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = type; o.frequency.value = freq; f.type = 'lowpass'; f.frequency.value = cutoff;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + Math.min(1.2, len * 0.35)); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + len + 0.05);
    }
    function bar() {
      if (!on) return;
      const t = ctx.currentTime + 0.05, root = mood[step % mood.length], len = 4.2;
      [0, 4, 7, 11].forEach((iv, k) => { voice(hz(root + iv - 12), t, len + 0.8, 'sine', 0.05, 900); voice(hz(root + iv - 12) * 1.004, t, len + 0.8, 'triangle', 0.018, 700 + k * 120); });
      voice(hz(root - 24), t, len + 0.5, 'sine', 0.06, 300);
      const arp = [0, 7, 12, 16, 12, 7, 14, 19];
      arp.forEach((iv, k) => { if (k % 2 === 0 || step % 2) voice(hz(root + iv), t + k * 0.5 + 0.25, 1.6, 'triangle', 0.022, 2400); });
      step++;
    }
    return {
      start(m) {
        try {
          ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
          if (ctx.state === 'suspended') ctx.resume();
          mood = MOODS[m % MOODS.length]; step = 0;
          master = ctx.createGain(); master.gain.value = 0.0001;
          const d = ctx.createDelay(1.5), fb = ctx.createGain(), wet = ctx.createGain();
          d.delayTime.value = 0.42; fb.gain.value = 0.32; wet.gain.value = 0.35;
          master.connect(ctx.destination); master.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(ctx.destination);
          master.gain.exponentialRampToValueAtTime(0.55 * duck, ctx.currentTime + 2.5);
          on = true; bar(); timer = setInterval(bar, 4200);
        } catch { on = false; }
      },
      stop() { on = false; clearInterval(timer); if (ctx && master) { const g = master; g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setValueAtTime(g.gain.value, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8); setTimeout(() => { try { g.disconnect(); } catch { /* gone */ } }, 1000); } },
      duck(speaking) { duck = speaking ? 0.4 : 1; if (ctx && master && on) master.gain.setTargetAtTime(0.55 * duck, ctx.currentTime, 0.4); },
      pause() { ctx && ctx.suspend(); }, resume() { ctx && ctx.resume(); },
    };
  })();

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
        <span class="tour-name" data-name></span>
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

  function setSound(on) {
    sound = on; store.set('hca-tour-sound', on ? 'on' : 'off');
    soundBtn.setAttribute('aria-pressed', String(on)); soundBtn.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
    dlg.classList.toggle('is-muted', !on);
    if (!state) return;
    if (on) { MUSIC.start(state.t.mood); if (state.playing) speak(); } else { MUSIC.stop(); VO.stop(); state.voiceDone = true; }
  }

  const narration = (s, t) => (s[0] === 'hook' ? t.hook.join(' ') : s[0] === 'title' ? `${t.name}. ${t.tag}` : s[0] === 'shot' ? (s[6] || `${s[3]} ${s[4]}`)
    : s[0] === 'stats' ? s[1].map(([n, l]) => `${n.toLocaleString('en-GB')} ${l}`).join('. ') + '.' : `${t.cta}. ${t.note}.`);
  function speak() {
    const s = state; if (!s) return;
    if (!sound || !VO.ok) { s.voiceDone = true; return; }
    s.voiceDone = false; MUSIC.duck(true);
    const i = s.i;
    VO.say(narration(s.list[i], s.t), () => { if (state && state.i === i) { state.voiceDone = true; MUSIC.duck(false); } });
  }

  function sceneHTML(t, s) {
    const [kind] = s;
    if (kind === 'hook') return `<div class="ts ts-hook"><div class="ts-mosaic">${t.bg.map((f, k) => `<img src="${src(f)}" alt="" style="--k:${k}">`).join('')}</div><span class="ts-veil"></span><p class="ts-hk"><span>${esc(t.hook[0])}</span><em>${esc(t.hook[1])}</em></p></div>`;
    if (kind === 'title') return `<div class="ts ts-title"><span class="ts-aura"></span><p class="ts-eye">The one-minute tour</p><span class="ts-chip">${esc(t.chip)}</span><h2 class="ts-h">${esc(t.name)}</h2><p class="ts-tag">${esc(t.tag)}</p></div>`;
    if (kind === 'shot') {
      const [, f, k, h, p, fc] = s;
      return `<div class="ts ts-shot" style="--fx:${fc[0] * 100}%;--fy:${fc[1] * 100}%"><div class="ts-win"><span class="ts-bar"><i></i><i></i><i></i></span><img src="${src(f)}" alt="" decoding="async"></div><div class="ts-cap"><p class="ts-k">${esc(k)}</p><h3>${esc(h)}</h3><p>${esc(p)}</p></div></div>`;
    }
    if (kind === 'stats') return `<div class="ts ts-stats"><span class="ts-aura"></span><p class="ts-eye">${esc(t.name)} in numbers</p><ul>${s[1].map(([n, l], i) => `<li style="--d:${i * 120}ms"><b data-n="${n}">${reduce.matches ? n.toLocaleString('en-GB') : '0'}</b><span>${esc(l)}</span></li>`).join('')}</ul></div>`;
    return `<div class="ts ts-end"><span class="ts-aura"></span><span class="ts-chip">${esc(t.chip)}</span><h2 class="ts-h">${esc(t.tag)}</h2><p class="ts-note">${esc(t.note)}</p><div class="ts-ctas"><a class="btn btn-gold btn-lg" href="${esc(t.url)}">${esc(t.cta)}</a><a class="btn btn-ghost btn-lg" href="/subscribe">See plans</a><button type="button" class="ts-replay" data-replay>Watch again</button></div></div>`;
  }

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
    [...stage.children].forEach((o) => { o.classList.remove('is-on'); o.classList.add('is-off'); setTimeout(() => o.remove(), 900); });
    stage.insertAdjacentHTML('beforeend', sceneHTML(s.t, sc));
    const el = stage.lastElementChild;
    requestAnimationFrame(() => requestAnimationFrame(() => { if (el.isConnected && !el.classList.contains('is-off')) el.classList.add('is-on'); }));
    el.querySelectorAll('[data-n]').forEach((b) => { if (!reduce.matches) setTimeout(() => count(b), 250); });
    const rp = el.querySelector('[data-replay]'); if (rp) rp.addEventListener('click', () => { go(0); play(true); });
    cap.textContent = narration(sc, s.t);
    [...bars.children].forEach((b, k) => { b.classList.toggle('is-done', k < i); b.style.setProperty('--p', k < i ? 1 : 0); b.setAttribute('aria-current', k === i ? 'step' : 'false'); });
    const nx = s.list[i + 1]; if (nx && nx[0] === 'shot') { const im = new Image(); im.src = src(nx[1]); }
    if (s.playing) speak(); else s.voiceDone = !sound;
    if (sc[0] === 'end') play(false);
  }

  // A scene moves on when its time is up and the voiceover has finished (never longer than 14 seconds).
  function frame(now) {
    const s = state; if (!s) return;
    if (s.playing) {
      const sc = s.list[s.i], dur = DUR[sc[0]];
      if (dur) {
        const spent = s.elapsed + now - s.t0, p = Math.min(1, spent / dur);
        const bar = bars.children[s.i]; if (bar) bar.style.setProperty('--p', p);
        if ((p >= 1 && s.voiceDone) || spent > 14000) go(s.i + 1);
      }
    }
    s.raf = requestAnimationFrame(frame);
  }
  function play(on) {
    const s = state; if (!s) return;
    if (on && s.list[s.i][0] === 'end') return;
    if (s.playing === on) return;
    if (on) { s.t0 = performance.now(); if (sound) { MUSIC.resume(); if (VO.speaking()) VO.resume(); else if (!s.voiceDone) speak(); } }
    else { s.elapsed += performance.now() - s.t0; VO.pause(); }
    s.playing = on;
    dlg.classList.toggle('is-paused', !on);
    playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
  }
  const toggle = () => play(!state.playing);
  function stop() { VO.stop(); MUSIC.stop(); if (state) cancelAnimationFrame(state.raf); state = null; stage.innerHTML = ''; if (stop.from) stop.from.focus?.({ preventScroll: true }); }

  function open(app, from) {
    const t = T[app]; if (!t) return false;
    if (!dlg) build();
    const list = [['hook'], ['title'], ...t.scenes, ['end']];
    bars.innerHTML = list.map((_, k) => `<button type="button" class="tour-seg" aria-label="Part ${k + 1} of ${list.length}"><i></i></button>`).join('');
    [...bars.children].forEach((b, k) => b.addEventListener('click', () => go(k)));
    dlg.style.setProperty('--tc', t.color);
    dlg.querySelector('[data-name]').textContent = t.name;
    stop.from = from || document.activeElement;
    state = { t, list, i: 0, playing: true, elapsed: 0, t0: 0, raf: 0, voiceDone: true };
    stage.innerHTML = '';
    dlg.showModal();
    soundBtn.setAttribute('aria-pressed', String(sound)); soundBtn.setAttribute('aria-label', sound ? 'Sound on' : 'Sound off'); dlg.classList.toggle('is-muted', !sound); dlg.classList.remove('is-paused');
    if (sound) MUSIC.start(t.mood);
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
