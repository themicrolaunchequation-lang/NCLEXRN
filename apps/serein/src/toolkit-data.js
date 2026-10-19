/* Serein Toolkit: content for the ten practical tools.
   Plain-language, non-clinical, original educational tools. Nothing here is therapy, diagnosis or medical advice,
   no statistic or study is quoted, and every plan keeps human support and workplace routes in view.
   Each tool is data: fields (what the person chooses), build(values, X) (the live plan), and links to practices, guides and posters. */
(function () {
  'use strict';
  const pad = n => String(n).padStart(2, '0');
  const toMin = s => { const m = /^(\d{1,2}):(\d{2})$/.exec(s || ''); return m ? (+m[1] * 60 + +m[2]) % 1440 : null; };
  const fmt = m => { m = ((Math.round(m) % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  const clean = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  const trimEnd = s => clean(s).replace(/[.!?\s]+$/, '');
  const lcFirst = s => s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
  const secLabel = s => s < 60 ? s + ' sec' : s % 60 ? Math.floor(s / 60) + ' min ' + (s % 60) + ' sec' : (s / 60) + ' min';
  const lab = (opts, v) => { const o = opts.find(x => x[0] === v); return o ? o[1] : ''; };
  const labs = (opts, vs) => (vs || []).map(v => lab(opts, v)).filter(Boolean);
  const round5 = m => Math.round(m / 5) * 5;
  const join = (a, sep = ', ') => a.filter(Boolean).join(sep);

  /* ---------- groups: the moments of a working day ---------- */
  const groups = [
    { id: 'before', moment: 0, title: 'Before shift', eyebrow: 'Before shift', lead: 'Arrive on purpose, in a few minutes.' },
    { id: 'between', moment: 1, title: 'Between tasks', eyebrow: 'Between tasks', lead: 'Small resets that fit a real, busy shift.' },
    { id: 'hard', moment: 2, title: 'After a hard moment', eyebrow: 'After a hard moment', lead: 'Look after the next hour, without having to retell what happened.' },
    { id: 'after', moment: 3, title: 'After shift', eyebrow: 'After shift', lead: 'Put the day down and protect your recovery.' },
    { id: 'talk', moment: null, title: 'Talking to others', eyebrow: 'Talking to others', lead: 'Find the words to say no, ask for help, raise workload and support a colleague.' },
    { id: 'week', moment: null, title: 'This week', eyebrow: 'This week', lead: 'A quiet look at load and values, ending in one small change.' }
  ];

  const tools = [];

  /* ======================================================================
     1. Shift-start ritual
     ====================================================================== */
  {
    const basics = [['water', 'Water with me'], ['food', 'Food for my break'], ['loo', 'Toilet before handover'], ['layers', 'Comfortable shoes and layers'], ['phone', 'Phone on silent']];
    const settle = [['breath', 'Slow breathing', 'Breathing Tide, a soft guided rhythm'], ['senses', 'Come back to the room', 'Here & Now, five senses at your own pace'], ['shoulders', 'Loosen my shoulders', 'Shoulder Reset, a small lift and release'], ['quiet', 'No screen at all', 'Three slow breaths with your eyes open']];
    const settleId = { breath: 'tide', senses: 'ground', shoulders: 'shoulderreset' };
    const split = { 1: [10, 30, 10, 10], 3: [30, 90, 30, 30], 5: [45, 180, 45, 30] };
    tools.push({
      id: 'shift-start', group: 'before', star: true, icon: 'sun', mins: '3 min', tag: 'Ritual builder',
      title: 'Shift-start ritual', blurb: 'A short, repeatable way to arrive: body basics, one settling step, one intention and one support to ask for.',
      when: 'In the car park, the changing room or at your station, before handover.',
      why: 'A routine you repeat is easier to do when you are tired, because the choices are already made. It is a personal prompt, and it sits alongside handover and safety checks, never in place of them.',
      flow: ['Body', 'Settle', 'Intention', 'Support'],
      note: 'Keep it personal. Handover, safety checks and workplace processes always come first.',
      refs: ['gentle', 'grounding', 'who'], practices: [['tide', 60], ['ground', null], ['shoulderreset', 60]], guides: ['reset', 'priorities'], atlas: ['micro-breaks'], studio: null,
      fields: [
        { id: 'time', type: 'radio', label: 'How long do you have?', def: '3', options: [['1', '1 minute', 'The quickest version'], ['3', '3 minutes', 'A steady start'], ['5', '5 minutes', 'Room to settle']] },
        { id: 'basics', type: 'check', label: 'Body basics, pick what you usually forget', def: ['water', 'food'], options: basics },
        { id: 'settle', type: 'radio', label: 'One settling step', def: 'breath', options: settle },
        { id: 'intention', type: 'text', label: 'One intention for this shift', ph: 'e.g. Ask early if I am stuck', fills: ['Ask early if I am stuck', 'Take my break', 'One thing at a time', 'Be kind to myself when it is busy'] },
        { id: 'support', type: 'text', label: 'One support I can ask for', ph: 'e.g. Ask the shift lead to agree priorities', fills: ['Buddy up with a colleague', 'Ask the shift lead to agree priorities', 'Ask for a second pair of eyes', 'Check who can cover my break'] },
        { id: 'wait', type: 'text', label: 'One thing that can wait until after the shift (optional)', ph: 'e.g. Non-urgent admin', fills: ['Non-urgent admin', 'Emails and learning'] }
      ],
      build(v, X) {
        const s = split[v.time || '3'], total = s.reduce((a, b) => a + b, 0);
        const pr = settleId[v.settle] ? X.practice(settleId[v.settle], s[1]) : null;
        const settleText = pr ? `${pr.title}${pr.dur ? ' · ' + pr.label : ' · at your own pace'}` : 'Three slow breaths with your eyes open, a little longer out than in.';
        const b = labs(basics, v.basics);
        return {
          lead: `A ${total / 60}-minute ritual. Do it where you can: the car, the changing room or your station.`,
          glance: { type: 'flow', items: [['Body basics', secLabel(s[0])], ['Settle', secLabel(s[1])], ['Intention', secLabel(s[2])], ['Support', secLabel(s[3])]] },
          blocks: [
            { type: 'steps', h: 'Your ritual', items: [
              { h: 'Body basics', time: secLabel(s[0]), t: b.length ? b.join(' · ') : '', ph: 'Choose what you usually forget' },
              { h: 'Settle', time: secLabel(s[1]), t: settleText, action: pr && pr.dur !== undefined ? pr : null },
              { h: 'One intention', time: secLabel(s[2]), t: clean(v.intention) ? `“${trimEnd(v.intention)}.”` : '', ph: 'Add one intention' },
              { h: 'One support', time: secLabel(s[3]), t: trimEnd(v.support), ph: 'Add one support you can ask for' }] },
            clean(v.wait) ? { type: 'bullets', h: 'Can wait until after the shift', items: [trimEnd(v.wait)] } : null,
            { type: 'p', t: 'Then begin handover in the usual way.' }
          ]
        };
      }
    });
  }

  /* ======================================================================
     2. Two-minute reset chooser
     ====================================================================== */
  {
    const feel = [['racing', 'Racing or on edge'], ['overloaded', 'Too much at once'], ['foggy', 'Foggy or flat'], ['tense', 'Tight neck, shoulders or back'], ['hands', 'Tired hands or eyes'], ['heavy', 'Low or heavy']];
    const place = [['desk', 'At a desk or station'], ['room', 'Somewhere quiet'], ['move', 'On my feet or on the move'], ['cant', 'I cannot step away']];
    const pick = {
      racing: ['tide', 'ground', 'box'], overloaded: ['pause3', 'ground', 'tide'], foggy: ['desk', 'listen', 'ground'],
      tense: ['shoulderreset', 'desk', 'release'], hands: ['handreset', 'desk'], heavy: ['listen', 'quietplace', 'ground']
    };
    const steps = {
      racing: ['Press your feet into the floor for five seconds.', 'Breathe in for four, out slowly for six. Do that three times.', 'Name three things you can see.'],
      overloaded: ['Write the next three things on paper.', 'Circle the one that is safe and sensible to do first.', 'Ask who can take or share one of the others.'],
      foggy: ['Drink some water.', 'Look at the furthest thing you can see for twenty seconds.', 'Stand up or stretch your arms overhead if you can.'],
      tense: ['Lift your shoulders towards your ears, hold for three seconds, then let them drop. Repeat three times.', 'Turn your head slowly from side to side, only as far as is comfortable.', 'Unclench your jaw and your hands.'],
      hands: ['Open and close your hands slowly five times.', 'Look away from the screen at something far off for twenty seconds.', 'Roll your wrists gently, within comfort.'],
      heavy: ['Rest a hand on something solid and notice its temperature.', 'Say quietly: “This is a hard moment, and I am doing my best.”', 'Choose one person you could message or sit with at your break.']
    };
    tools.push({
      id: 'reset', group: 'between', star: true, icon: 'wind', mins: '1 min', tag: 'Reset chooser',
      title: '2-minute reset chooser', blurb: 'Say how you feel, where you are and how long you have. Get one reset that fits, and a no-screen version.',
      when: 'Between tasks, in a corridor, at a station or in a quiet room.',
      why: 'When you are busy, choosing is the hard part. Three quick answers narrow the choice to one reset you can start now. If it does not help, that is useful information too, and you can try another.',
      flow: ['Feeling', 'Place', 'Time', 'Reset'],
      note: 'Resets are optional and you can stop or adapt any time. If breathing exercises feel uncomfortable, choose Here & Now instead.',
      refs: ['gentle', 'grounding', 'sitting'], practices: [['tide', 60], ['ground', null], ['desk', 90], ['pause3', 180]], guides: ['grounding', 'priorities'], atlas: ['micro-breaks', 'five-senses'], studio: null,
      fields: [
        { id: 'feel', type: 'radio', label: 'What is most noticeable right now?', def: 'racing', options: feel },
        { id: 'place', type: 'radio', label: 'Where are you?', def: 'desk', options: place },
        { id: 'time', type: 'radio', label: 'How long can you spare?', def: '120', options: [['60', '1 minute'], ['120', '2 minutes'], ['300', '5 minutes']] }
      ],
      build(v, X) {
        const sec = +v.time || 120, f = v.feel || 'racing', p = v.place || 'desk';
        let cands = pick[f].slice();
        if (p === 'move' && ['racing', 'overloaded', 'heavy'].includes(f) && sec >= 120) cands.unshift('walk');
        let primary = null;
        if (p !== 'cant') for (const id of cands) { const r = X.practice(id, sec); if (r) { primary = r; break; } }
        const alt = cands.map(id => X.practice(id, sec)).filter(r => r && (!primary || r.id !== primary.id)).slice(0, 2);
        const blocks = [];
        if (primary) blocks.push({ type: 'feature', h: 'Your reset', title: primary.title, meta: `${primary.dur ? primary.label : 'Your own pace'} · ${primary.position}${primary.breathFocus ? ' · breath focus' : ' · no breath focus'}`, t: primary.desc, action: primary });
        else blocks.push({ type: 'callout', tone: 'note', t: p === 'cant' ? 'You cannot step away, so use the no-screen version below. It works standing, seated or mid-task.' : 'Nothing fits that time exactly, so use the no-screen version below.' });
        blocks.push({ type: 'steps', h: 'No-screen version (about a minute)', items: steps[f].map(t => ({ t })) });
        if (alt.length) blocks.push({ type: 'alts', h: 'Other options for this feeling', items: alt.map(a => ({ t: `${a.title} · ${a.dur ? a.label : 'your own pace'}`, action: a })) });
        blocks.push({ type: 'bullets', h: 'Afterwards', items: ['Notice: a little more settled, the same, or not helped. Any of these is fine.', 'If this did not help, try another feeling above, or tell someone how the shift is going.'] });
        if (f === 'heavy') blocks.push({ type: 'callout', tone: 'care', t: 'If low or heavy feelings keep coming back, you do not have to carry them alone. Talking to someone you trust, your GP or a wellbeing service is a good next step.' });
        return {
          lead: `For feeling ${lcFirst(lab(feel, f))}, ${lcFirst(lab(place, p))}, with about ${sec / 60 === 1 ? 'a minute' : sec / 60 + ' minutes'}.`,
          glance: { type: 'tiles', items: [['Feeling', lab(feel, f)], ['Place', lab(place, p)], ['Time', sec / 60 + ' min'], ['Reset', primary ? primary.title : 'No-screen steps']] },
          blocks
        };
      }
    });
  }

  /* ======================================================================
     3. Micro-break planner
     ====================================================================== */
  {
    const needs = [['eat', 'Eat and drink'], ['move', 'Move or stretch'], ['quiet', 'Quiet or a reset'], ['connect', 'A friendly face'], ['fresh', 'Fresh air or daylight']];
    const use = {
      eat: { t: 'Water and a few bites', pr: null }, move: { t: 'Stand up, roll your shoulders and walk to the far end', pr: ['shoulderreset', 60] },
      quiet: { t: 'A 1-minute reset', pr: ['tide', 60] }, connect: { t: 'Say something kind to someone, or send a short message', pr: null },
      fresh: { t: 'Step to a window or outside for a minute', pr: null }
    };
    tools.push({
      id: 'break-plan', group: 'between', icon: 'coffee', mins: '3 min', tag: 'Planner',
      title: 'Micro-break planner', blurb: 'Fit one main break and a few 2-minute pauses around your real shift, with a Plan B for when the shift runs away.',
      when: 'At the start of a shift, or when breaks keep slipping.',
      why: 'Breaks that are planned and named are easier to protect than breaks you hope to find. A Plan B means you already know what to say and what to do when the shift gets in the way.',
      flow: ['Shift', 'Main break', 'Pauses', 'Plan B'],
      note: 'This is a personal plan, not a rota. Break entitlements vary by role and employer, so check your contract or local policy if you are unsure.',
      refs: ['who', 'niosh', 'sitting'], practices: [['desk', 90], ['shoulderreset', 60], ['tide', 60]], guides: ['priorities', 'ask-support'], atlas: ['micro-breaks'], studio: 'support', open: ['workload'],
      fields: [
        { id: 'start', type: 'time', label: 'Shift starts at', def: '07:30' },
        { id: 'len', type: 'radio', label: 'Shift length', def: '720', options: [['480', '8 hours'], ['600', '10 hours'], ['720', '12 hours'], ['750', '12.5 hours']] },
        { id: 'main', type: 'radio', label: 'Main break', def: '30', options: [['20', '20 min'], ['30', '30 min'], ['45', '45 min'], ['60', '60 min']] },
        { id: 'pauses', type: 'radio', label: 'Small pauses of about 2 minutes', def: '4', options: [['3', '3 pauses'], ['4', '4 pauses'], ['6', '6 pauses']] },
        { id: 'needs', type: 'check', label: 'What do you most need from a pause?', def: ['eat', 'quiet'], options: needs },
        { id: 'slip', type: 'radio', label: 'What usually happens to your main break?', def: 'late', options: [['kept', 'It is usually kept'], ['late', 'It is often late'], ['missed', 'It is often missed']] },
        { id: 'cover', type: 'text', label: 'Who could cover or help protect it?', ph: 'e.g. My shift lead', fills: ['My shift lead', 'A break buddy', 'The person coordinating cover'] }
      ],
      build(v, X) {
        const S = toMin(v.start); const L = +v.len || 720, M = +v.main || 30, n = +v.pauses || 4;
        if (S == null) return { lead: 'Choose a start time to see your plan.', blocks: [] };
        const mainAt = round5(S + L * (L <= 480 ? 0.48 : 0.45)), endM = S + L;
        const pts = [];
        for (let i = 1; i <= n; i++) {
          let t = S + L * i / (n + 1);
          if (t > mainAt - 40 && t < mainAt + M + 25) t = t < mainAt + M / 2 ? mainAt - 40 : mainAt + M + 25;
          t = Math.min(round5(t), endM - 30); pts.push(t);
        }
        pts.sort((a, b) => a - b);
        const picks = (v.needs && v.needs.length ? v.needs : ['quiet']);
        const rows = pts.map((t, i) => { const k = picks[i % picks.length], u = use[k]; return { at: t, k, t: u.t, action: u.pr ? X.practice(u.pr[0], u.pr[1]) : null }; });
        const latest = mainAt + 90;
        const cover = trimEnd(v.cover);
        const plan = {
          kept: ['Keep it: put it in your head as a fixed point and tell your buddy or lead when you are leaving.', cover ? `Ask ${lcFirst(cover)} to hold your tasks while you are away.` : 'Say who is holding your tasks while you are away.'],
          late: [`Set a latest start: ${fmt(latest)}. At that time, say: “I need to take my break now. Can you cover ${cover ? 'with ' + lcFirst(cover) : 'my tasks'}?”`, 'If it cannot start then, ask when it can, and agree a time before you carry on.'],
          missed: [`If you cannot leave, take it in pieces: three 10-minute breaks around ${fmt(mainAt - 60)}, ${fmt(mainAt + 30)} and ${fmt(mainAt + 120)}, and tell someone each time.`, 'Missed breaks are a working-conditions issue to raise, not a personal failing. The Workload conversation planner can help you raise it.']
        }[v.slip || 'late'];
        return {
          lead: `${fmt(S)}–${fmt(endM)} · one ${M}-minute break and ${n} small pauses.`,
          glance: { type: 'track', total: L, start: S, marks: [{ at: mainAt - S, len: M, l: 'Main break', k: 'main' }, ...rows.map(r => ({ at: r.at - S, len: 4, l: 'Pause', k: 'pause' }))], ends: [fmt(S), fmt(endM)] },
          blocks: [
            { type: 'steps', h: 'Your day', items: [{ at: mainAt, h: fmt(mainAt) + ' · main break', time: M + ' min', t: 'Leave the work area if you can. Eat, drink and rest first, then catch up with people.' }, ...rows.map(r => ({ at: r.at, h: fmt(r.at) + ' · small pause', time: '2 min', t: r.t, action: r.action }))].sort((a, b) => a.at - b.at) },
            { type: 'bullets', h: 'Plan B: if the shift runs away', items: [...plan, 'Cannot leave the area at all? Do the 60-second seated reset at your station and drink some water.'] },
            { type: 'p', t: 'A plan is a starting point. Change the times to fit your handovers, rota and patients.' }
          ]
        };
      }
    });
  }

  /* ======================================================================
     4. After a hard moment: decompression flow
     ====================================================================== */
  {
    const helps = [['quiet', 'A quiet minute away from the area'], ['water', 'Water and something to eat'], ['colleague', 'A colleague nearby (no need to talk about it)'], ['clear', 'Someone to take or re-plan my next task'], ['air', 'Fresh air or daylight']];
    const who = [['colleague', 'A colleague I trust'], ['lead', 'My shift lead or manager'], ['wellbeing', 'Staff wellbeing, chaplaincy or occupational health'], ['ph', 'NHS Practitioner Health (confidential, for health and care staff)'], ['outside', 'Someone outside work'], ['sam', 'Samaritans on 116 123, any time']];
    const later = [['break', 'A proper break, even a short one'], ['report', 'Any reporting my workplace requires, in my own time'], ['debrief', 'Ask whether a team debrief is available'], ['move', 'Move my body or get outside'], ['sleep', 'Protect my sleep tonight'], ['journal', 'A few private lines, with no patient details']];
    const settle = [['ground', 'Come back to the room', 'Here & Now, at your own pace'], ['tide', 'Slow breathing', 'Breathing Tide, 2 minutes'], ['listen', 'Listen to the room', 'Mindful Listening, 1 to 2 minutes'], ['none', 'No practice', 'Five things I can see, four I can touch']];
    tools.push({
      id: 'decompress', group: 'hard', star: true, icon: 'heart', mins: '3 min', tag: 'Flow',
      title: 'After a hard moment', blurb: 'A calm, ordered plan for the next hour. You do not have to describe or retell what happened.',
      when: 'Once everyone is safe and care is covered, after something that shook you.',
      why: 'After a hard event, small practical steps such as safety, a settle, basics and a person usually come before thinking it through. This keeps the order simple. It is a self-care prompt, not therapy and not a replacement for any debrief or support your workplace offers.',
      flow: ['Safe', 'Settle', 'Basics', 'Connect'],
      note: 'Not therapy or medical advice. Nothing here needs you to describe the event. If you feel unsafe, or are thinking about harming yourself, use Get help now.',
      refs: ['grounding', 'who', 'gentle'], practices: [['ground', null], ['tide', 120], ['listen', 120]], guides: ['reflection', 'compassion', 'peer-check'], atlas: ['five-senses'], studio: 'difficult',
      fields: [
        { id: 'safe', type: 'radio', label: 'First: are people safe and is care covered?', def: 'yes', options: [['yes', 'Yes, it is covered'], ['not', 'Not yet'], ['unsure', 'I am not sure']] },
        { id: 'settle', type: 'radio', label: 'A settling step', def: 'ground', options: settle },
        { id: 'help', type: 'check', label: 'What would help in the next 10 minutes?', def: ['quiet', 'water'], options: helps },
        { id: 'who', type: 'check', label: 'Who could you choose to tell, only if you want to?', def: ['colleague'], options: who },
        { id: 'later', type: 'check', label: 'Later today or this week', def: ['break', 'sleep'], options: later },
        { id: 'one', type: 'text', label: 'One kind thing I will do for myself within the hour', ph: 'e.g. Sit down with a hot drink', fills: ['Sit down with a hot drink', 'Eat something properly', 'Step outside for five minutes', 'Message someone who makes me feel steady'] }
      ],
      build(v, X) {
        const gate = v.safe || 'yes';
        if (gate !== 'yes') return {
          lead: 'Safety and care come first.',
          glance: { type: 'flow', items: [['Safe', 'First'], ['Settle', 'Later'], ['Basics', 'Later'], ['Connect', 'Later']] },
          blocks: [
            { type: 'callout', tone: 'safe', t: gate === 'not' ? 'Right now: use your workplace escalation route and your usual urgent-care routes. This plan will wait for you.' : 'If you are not sure, check with your lead or the person in charge, using your usual route. This plan will wait for you.' },
            { type: 'bullets', h: 'When it is safe', items: ['Come back and choose “Yes, it is covered”.', 'You do not have to describe what happened to get support.'] }
          ]
        };
        const pr = { ground: 'ground', tide: 'tide', listen: 'listen' }[v.settle] ? X.practice({ ground: 'ground', tide: 'tide', listen: 'listen' }[v.settle], 120) : null;
        const settleT = pr ? `${pr.title} · ${pr.dur ? pr.label : 'at your own pace'}` : 'Name five things you can see and four you can touch. Slowly.';
        const h = labs(helps, v.help), w = labs(who, v.who), l = labs(later, v.later);
        return {
          lead: 'A plan for the next hour. Nothing here needs you to retell what happened.',
          glance: { type: 'flow', items: [['Safe', 'Done'], ['Settle', '1–2 min'], ['Basics', '10 min'], ['Connect', 'When ready']] },
          blocks: [
            { type: 'steps', h: 'My next hour', items: [
              { h: 'Now', time: '1–2 min', t: settleT, action: pr },
              { h: 'In the next 10 minutes', t: h.join(' · '), ph: 'Choose what would help' },
              { h: 'Before I leave', t: w.length ? `I could talk to: ${w.join('; ')}. A way in: “I had a tough moment earlier. Could I sit with you for five minutes?”` : '', ph: 'Choose who you might tell, if you want to' },
              { h: 'Later', t: l.join(' · '), ph: 'Choose what you will do later' },
              { h: 'One kind thing', t: trimEnd(v.one), ph: 'Add one thing for yourself' }] },
            { type: 'bullets', h: 'Worth knowing', items: ['Feeling shaky, tearful, numb, angry or wired after something hard is common, and often eases over days.', 'You never have to retell what happened to be supported.', 'If it lasts or gets worse over a few weeks, or affects sleep, work or daily life, talk to your GP, occupational health or NHS Practitioner Health.'] },
            { type: 'callout', tone: 'care', t: 'If you are thinking about harming yourself, or someone else is in danger, call 999 or use Get help now. Support is available any time.' }
          ]
        };
      }
    });
  }

  /* ======================================================================
     5. Handover of yourself
     ====================================================================== */
  {
    const done = [['handover', 'I gave handover in the usual, approved way'], ['owner', 'Every open task has an owner'], ['concern', 'Anything worrying me has been said to the right person'], ['records', 'My records are done as far as I can'], ['kit', 'Keys, bleep, badge and kit are sorted']];
    const cue = [['clothes', 'Change out of work clothes'], ['walk', 'Walk for the first five minutes'], ['wash', 'Wash my hands and face'], ['say', 'Say “shift done” out loud'], ['sound', 'Music or quiet for the journey']];
    const need = [['food', 'A proper meal'], ['shower', 'A shower or wash'], ['move', 'Some movement'], ['company', 'Company'], ['quiet', 'Quiet'], ['sleep', 'Sleep']];
    const spin = [['park', 'Write it on a “next shift” note and close it', null], ['winddown', 'Evening Wind-Down', 'winddown'], ['release', 'Soften & Release', 'release'], ['talk', 'Message a friend or colleague', null]];
    tools.push({
      id: 'handover-self', group: 'after', star: true, icon: 'home', mins: '3 min', tag: 'Checklist',
      title: 'Handover of yourself', blurb: 'Leave, carry, need: put work down on purpose and decide what you take home and what tonight needs.',
      when: 'After your formal handover, on the way out or in the car.',
      why: 'You hand over patients and tasks. This is the same idea for you: what stays at work, what you choose to carry, and what you need tonight. A clear ending can make it easier to let the shift go.',
      flow: ['Leave', 'Carry', 'Need', 'Cue'],
      note: 'This personal prompt does not replace formal handover, documentation or reporting.',
      refs: ['who', 'sleep', 'mindful'], practices: [['winddown', 180], ['release', 120], ['ground', null]], guides: ['shift-home', 'reflection'], atlas: ['end-shift'], studio: 'transition',
      fields: [
        { id: 'done', type: 'check', label: 'Work handed over (tick as you go)', def: [], options: done },
        { id: 'leave', type: 'text', label: 'What I am leaving at work', ph: 'e.g. Things I cannot change tonight', fills: ['Unfinished admin', 'Things I cannot change tonight', 'A tricky conversation I will take to my lead'] },
        { id: 'carry', type: 'text', label: 'What I am carrying home on purpose, if anything', ph: 'e.g. A good moment to remember', fills: ['Nothing', 'One thing to check tomorrow, written on paper', 'A good moment to remember'] },
        { id: 'cue', type: 'radio', label: 'My transition cue', def: 'clothes', options: cue },
        { id: 'need', type: 'check', label: 'What tonight needs', def: ['food', 'sleep'], options: need },
        { id: 'spin', type: 'radio', label: 'If it is still going round my head', def: 'park', options: spin.map(x => [x[0], x[1]]) }
      ],
      build(v, X) {
        const dn = v.done || [], pr = (spin.find(x => x[0] === v.spin) || [])[2] ? X.practice(spin.find(x => x[0] === v.spin)[2], 180) : null;
        const sp = { park: 'Write it on a “next shift” note, close the note, and let it wait.', talk: 'Message a friend or colleague about anything except the shift, or about how you are, not the details.' }[v.spin];
        return {
          lead: `${dn.length} of ${done.length} work checks ticked. Tick only what is true.`,
          glance: { type: 'cols', items: [['Leave', trimEnd(v.leave) || 'Add what stays'], ['Carry', trimEnd(v.carry) || 'Add what you choose'], ['Need', labs(need, v.need).join(', ') || 'Add what tonight needs']] },
          blocks: [
            { type: 'checks', h: 'Work handed over', items: done.map(([k, t]) => ({ t, on: dn.includes(k) })) },
            { type: 'steps', h: 'Putting the day down', items: [
              { h: 'Leave', t: trimEnd(v.leave), ph: 'Add what you are leaving at work' },
              { h: 'Carry', t: trimEnd(v.carry), ph: 'Add what you carry home on purpose' },
              { h: 'Cue', t: lab(cue, v.cue || 'clothes') },
              { h: 'Tonight', t: labs(need, v.need).join(' · '), ph: 'Choose what tonight needs' },
              { h: 'If it keeps going round', t: sp || (pr ? `${pr.title} · ${pr.dur ? pr.label : 'your own pace'}` : ''), action: pr }] },
            { type: 'p', t: 'If something still worries you about patient safety, say so through your usual route before you go, not just here.' }
          ]
        };
      }
    });
  }

  /* ======================================================================
     6. Nights and sleep wind-down
     ====================================================================== */
  {
    const journey = [['10', '10 min'], ['30', '30 min'], ['60', '1 hour'], ['90', '1.5 hours']];
    const travel = [['car', 'Driving'], ['public', 'Public transport'], ['walk', 'Walking or cycling'], ['lift', 'A lift or taxi']];
    const room = [['dark', 'Dark: blackout or eye mask'], ['cool', 'Cool and comfortable'], ['quiet', 'Phone on do-not-disturb, household told'], ['bed', 'Bed ready']];
    const meal = [['light', 'A light meal or snack'], ['drink', 'A warm drink without caffeine'], ['skip', 'Nothing']];
    const wd = [['winddown', 'Evening Wind-Down', 'Quiet sequence, 3 to 5 minutes'], ['release', 'Soften & Release', 'Gentle tension and release'], ['scan', 'Body Scan Journey', 'Supported body areas'], ['listen', 'Mindful Listening', 'Sounds, near and far']];
    tools.push({
      id: 'wind-down', group: 'after', icon: 'moon', mins: '3 min', tag: 'Planner',
      title: 'Nights and sleep wind-down', blurb: 'Work backwards from when you want to sleep: journey, light, a small meal, a wind-down and a ready room.',
      when: 'After a night shift or any shift that leaves you wired or too tired to switch off.',
      why: 'After a shift your body may be tired and your mind still switched on. Working backwards from bedtime gives the evening a gentle shape. Sleep after nights is harder, and this plan is a set of small, practical ideas, not a treatment.',
      flow: ['Home', 'Eat', 'Wind down', 'Sleep'],
      note: 'If you are too tired to drive safely, do not drive. A short rest in a safe place, a lift or another route is a sensible choice.',
      refs: ['sleep', 'mindful', 'who'], practices: [['winddown', 180], ['release', 120], ['scan', 120]], guides: ['sleep', 'shift-home'], atlas: ['sleep-recovery', 'fatigue-journey'], studio: 'transition',
      fields: [
        { id: 'end', type: 'time', label: 'Shift ends at', def: '07:30' },
        { id: 'travel', type: 'radio', label: 'Getting home', def: 'car', options: travel },
        { id: 'journey', type: 'radio', label: 'Journey time', def: '30', options: journey },
        { id: 'sleep', type: 'time', label: 'I want to be asleep by', def: '09:30' },
        { id: 'meal', type: 'radio', label: 'Before bed', def: 'light', options: meal },
        { id: 'wd', type: 'radio', label: 'Wind-down practice', def: 'winddown', options: wd.map(x => [x[0], x[1], x[2]]) },
        { id: 'room', type: 'check', label: 'Get the room ready', def: ['dark', 'quiet'], options: room }
      ],
      build(v, X) {
        const E = toMin(v.end), Sl = toMin(v.sleep), J = +v.journey || 30;
        if (E == null || Sl == null) return { lead: 'Choose the times to see your plan.', blocks: [] };
        let sleepT = Sl; while (sleepT < E) sleepT += 1440;
        const arrive = E + J + 10, gap = sleepT - arrive;
        const pr = X.practice(v.wd || 'winddown', 240) || X.practice(v.wd || 'winddown', 180);
        const prSec = pr && pr.dur ? pr.dur / 60 : 3;
        const windAt = sleepT - Math.round(prSec) - 5, roomAt = sleepT - 30;
        const items = [
          { h: fmt(E), t: 'Shift ends. Handover, then your transition cue.' },
          { h: fmt(E + J), t: `Home. Keep the lights low and do only the quick jobs.` },
          { h: fmt(arrive), t: lab(meal, v.meal || 'light') === 'Nothing' ? 'A drink of water.' : lab(meal, v.meal || 'light') + '.' },
          { h: fmt(roomAt), t: labs(room, v.room).length ? labs(room, v.room).join(' · ') + '.' : 'Get the room ready.' },
          { h: fmt(windAt), t: `${pr ? pr.title : 'Wind-down'}${pr && pr.dur ? ' · ' + pr.label : ''}.`, action: pr },
          { h: fmt(sleepT), t: 'Aim to be asleep.' }
        ];
        const blocks = [{ type: 'steps', h: 'Your evening, in order', items: items.map(i => ({ ...i, h: i.h })) }];
        if (gap < 45) blocks.unshift({ type: 'callout', tone: 'note', t: `There are only ${Math.max(gap, 0)} minutes between getting home and your sleep time. You could move your sleep time later, or shorten steps. Both are fine.` });
        const cut = fmt(sleepT - 360);
        blocks.push({ type: 'bullets', h: 'Small things that help some people', items: [`Finish caffeine several hours before sleep. Many people find about six hours works; try ${cut} or earlier if you are sensitive.`, 'After nights, some people find sunglasses on a bright journey home and low lights at home helpful.', 'If you are still awake after 20 to 30 minutes, get up, do something calm in low light, and go back to bed when sleepy.'] });
        if (v.travel === 'car') blocks.push({ type: 'callout', tone: 'safe', t: 'Driving home after a long or night shift: if you feel too sleepy to drive safely, do not. Rest in a safe place, ask for a lift or choose another route. If this happens often, tell your lead. It is a rota and fatigue issue, not a personal failing.' });
        blocks.push({ type: 'p', t: 'If broken sleep goes on for weeks, speak to your GP or occupational health.' });
        return {
          lead: `${fmt(E)} finish · ${fmt(sleepT)} asleep · about ${Math.floor(Math.max(gap, 0) / 60)} h ${Math.max(gap, 0) % 60} min to land.`,
          glance: { type: 'timeline', items: [[fmt(E), 'Finish'], [fmt(E + J), 'Home'], [fmt(windAt), 'Wind down'], [fmt(sleepT), 'Asleep']] },
          blocks
        };
      }
    });
  }

  /* ======================================================================
     7. Boundary script builder
     ====================================================================== */
  {
    const sit = [['task', 'A new task lands when I am already full'], ['stay', 'I am asked to stay late or pick up extra'], ['break', 'My break keeps being interrupted'], ['help', 'I need help with something now'], ['offload', 'Someone keeps handing me their work']];
    const sugg = {
      task: { can: ['finish what I am doing first', 'take it after the current task'], cant: ['take on another new task right now', 'do both at once'], ask: ['agree which one goes first', 'check who else can take it'] },
      stay: { can: ['stay until handover is complete', 'stay for a set time'], cant: ['stay beyond that tonight', 'pick up extra at short notice'], ask: ['agree what happens after that', 'arrange cover from the next shift'] },
      break: { can: ['take my break as soon as this task is safe to leave', 'be back on time'], cant: ['skip my break again today', 'keep being interrupted'], ask: ['agree who covers me for 30 minutes', 'know which interruptions need me'] },
      help: { can: ['do my part and explain where I am', 'say clearly what I need'], cant: ['do this safely on my own', 'carry on without a second pair of hands'], ask: ['have someone help with this now', 'agree who to ask next'] },
      offload: { can: ['help with one clear piece', 'show you where it is'], cant: ['take over all of it', 'do it every time'], ask: ['agree a fair split', 'agree who owns it'] }
    };
    const tone = [['warm', 'Warm'], ['brief', 'Brief'], ['firm', 'Firm']];
    const back = [['done', 'when I have finished this task'], ['huddle', 'at the next huddle'], ['leave', 'before I leave today'], ['tomorrow', 'tomorrow']];
    tools.push({
      id: 'boundary', group: 'talk', star: true, icon: 'shield', mins: '3 min', tag: 'Script builder',
      title: 'Say no or ask for help', blurb: 'Build a short, kind and clear script, in your tone, with a line for when someone pushes back.',
      when: 'Before a conversation, or in the moment when you need a sentence ready.',
      why: 'A clear request names what you can do, what you cannot, what you need and when you will check back. Having the words ready is easier than finding them mid-shift. It never means refusing urgent care. Patient safety and your professional responsibilities come first.',
      flow: ['Situation', 'Tone', 'Words', 'Check back'],
      note: 'If something is urgent or unsafe, act and escalate first. Use your professional responsibilities and local processes to guide real decisions.',
      refs: ['who', 'niosh'], practices: [['ground', null], ['tide', 60]], guides: ['boundaries', 'priorities', 'difficult-talk'], atlas: ['speak-up'], studio: 'boundary',
      fields: [
        { id: 'sit', type: 'radio', label: 'What is the situation?', def: 'task', options: sit },
        { id: 'tone', type: 'radio', label: 'Your tone', def: 'warm', options: tone },
        { id: 'can', type: 'text', label: 'What I can do', ph: 'a short phrase, e.g. finish this first', fillsFor: v => sugg[v.sit || 'task'].can },
        { id: 'cant', type: 'text', label: 'What I cannot take on right now', ph: 'a short phrase, e.g. take another new task', fillsFor: v => sugg[v.sit || 'task'].cant },
        { id: 'ask', type: 'text', label: 'What would help', ph: 'a short phrase, e.g. agree which goes first', fillsFor: v => sugg[v.sit || 'task'].ask },
        { id: 'back', type: 'radio', label: 'When I will check back', def: 'done', options: back.map(x => [x[0], x[1].replace(/^./, c => c.toUpperCase())]) }
      ],
      dynamic: ['sit'],
      build(v) {
        const can = trimEnd(v.can), cant = trimEnd(v.cant), ask = trimEnd(v.ask), b = (back.find(x => x[0] === (v.back || 'done')) || back[0])[1];
        const t = v.tone || 'warm';
        const C = can || '…', N = cant || '…', A = ask || '…';
        const say = {
          warm: `I do want to help. I can ${C}. I cannot ${N} right now. Could we ${A}? I will check back ${b}.`,
          brief: `I can ${C}. I cannot ${N} right now. Could we ${A}? I will check back ${b}.`,
          firm: `I am not able to ${N} right now. I can ${C}. I need us to ${A}. I will check back ${b}.`
        }[t];
        const msg = `Hi, I can ${C} but I cannot ${N} right now. Could we ${A}? I will check back ${b}. Thanks.`;
        const filled = can && cant && ask;
        return {
          lead: 'Say it out loud once before you use it. Edit the words until they sound like you.',
          glance: { type: 'flow', items: [['Can', can ? 'filled' : 'add'], ['Cannot', cant ? 'filled' : 'add'], ['Need', ask ? 'filled' : 'add'], ['Check back', 'set']] },
          blocks: [
            { type: 'script', h: 'Say it', items: [{ t: say, ph: !filled ? 'Fill the three phrases to complete the script' : '' }] },
            { type: 'script', h: 'Or send it', items: [{ t: msg }] },
            { type: 'script', h: 'If they push back', items: [{ t: 'I hear that it matters. Which of these should come first? If it is a safety concern, I will escalate it now through the usual route.' }] },
            { type: 'bullets', h: 'Before you speak', items: ['Feet flat, shoulders down, one slow breath out.', 'Slow your voice a little. Keep it short.', 'Name the person and the task. Leave out blame.'] },
            { type: 'bullets', h: 'Afterwards', items: ['Notice that you said it. That counts, however it landed.', 'If the same thing keeps happening, it is a working-conditions issue. Take it to your lead with the Workload conversation planner.'] }
          ]
        };
      }
    });
  }

  /* ======================================================================
     8. Peer-support conversation starter
     ====================================================================== */
  {
    const noticed = [['quiet', 'They seem quieter than usual'], ['tired', 'They look exhausted'], ['hard', 'They had a hard shift or event'], ['over', 'They seem overwhelmed'], ['just', 'I just want to check in']];
    const where = [['shift', 'A private moment on shift'], ['break', 'At a break'], ['msg', 'A message later'], ['walk', 'Walking out together']];
    const style = [['gentle', 'Gentle'], ['light', 'Light'], ['direct', 'Direct']];
    const time = [['2', 'About 2 minutes'], ['10', 'About 10 minutes'], ['long', 'Longer']];
    const offer = [['listen', 'Just listening'], ['cover', 'Covering a task or break'], ['walk', 'Sitting or walking together'], ['find', 'Helping find support'], ['again', 'Checking in again tomorrow']];
    const open = {
      gentle: { quiet: 'I have noticed you have been a bit quieter. No pressure at all. How are you doing?', tired: 'You look worn out. How are you holding up today?', hard: 'That was a tough one earlier. How are you doing now? You do not have to go through it.', over: 'It has been full-on. How are you coping with it all?', just: 'I wanted to check in on you. How are things, really?' },
      light: { quiet: 'Fancy a tea? I wanted to see how you are doing.', tired: 'Shall we grab a drink and sit down for five? How are you?', hard: 'I am putting the kettle on. Want company? No need to talk about it.', over: 'Want to share the load for a minute? How are you doing?', just: 'Fancy a quick catch up? Just a check-in.' },
      direct: { quiet: 'You have seemed quieter lately. I wanted to ask how you are.', tired: 'You look exhausted. How are you really?', hard: 'That was a hard moment. I am asking how you are, not what happened.', over: 'You seem to be carrying a lot. How can I help?', just: 'I want to ask how you are. I have time.' }
    };
    tools.push({
      id: 'peer', group: 'talk', icon: 'users', mins: '3 min', tag: 'Conversation starter',
      title: 'Check in on a colleague', blurb: 'Opening lines, listening tips, what to avoid and where to point them if they want more help.',
      when: 'When you have noticed a colleague seems low, tired or shaken and you want to say something.',
      why: 'A short, kind question from a colleague can matter. You are not their counsellor and you do not need to fix anything. Listening, offering practical help and knowing where to point them is enough.',
      flow: ['Notice', 'Open', 'Listen', 'Signpost'],
      note: 'You are a colleague, not a counsellor. If you are worried about someone’s immediate safety, stay with them and call 999 or follow your workplace emergency process.',
      refs: ['who', 'niosh'], practices: [['ground', null], ['tide', 120]], guides: ['peer-check', 'compassion'], atlas: ['pressure-at-work'], studio: null,
      fields: [
        { id: 'noticed', type: 'radio', label: 'What have you noticed?', def: 'quiet', options: noticed },
        { id: 'where', type: 'radio', label: 'Where could you talk?', def: 'shift', options: where },
        { id: 'style', type: 'radio', label: 'Your style', def: 'gentle', options: style },
        { id: 'time', type: 'radio', label: 'How much time do you have?', def: '10', options: time },
        { id: 'offer', type: 'check', label: 'What could you offer?', def: ['listen', 'again'], options: offer }
      ],
      build(v) {
        const s = v.style || 'gentle', n = v.noticed || 'quiet', main = open[s][n];
        const msgBack = 'Thinking of you after that shift. No need to reply, but I am here if you want a chat or a coffee.';
        const o = labs(offer, v.offer);
        return {
          lead: `${lab(noticed, n)}. ${lab(where, v.where || 'shift')}.`,
          glance: { type: 'flow', items: [['Open', 'one kind question'], ['Listen', 'do not fix'], ['Offer', o.length + ' ideas'], ['Signpost', 'if they want']] },
          blocks: [
            { type: 'script', h: v.where === 'msg' ? 'Say it, by message' : 'Open with', items: [{ t: v.where === 'msg' ? msgBack : main }, { t: v.where === 'msg' ? '' : 'If they say they are fine: “OK. The offer stands if that changes.”' }].filter(i => i.t) },
            { type: 'bullets', h: 'Then listen', items: ['Ask one open question, then wait. Silence is fine.', 'Reflect back what you hear: “That sounds exhausting.”', 'Ask: “Would it help more to talk, or to sort something practical?”', ({ '2': 'With two minutes: one question, one offer, and a time to talk again.', '10': 'With ten minutes: listen first, then ask what would help.', long: 'With longer: find a quiet place and agree what stays between you.' })[v.time || '10']] },
            { type: 'bullets', h: 'What you could offer', items: o.length ? o : ['Choose what you can realistically offer'] },
            { type: 'bullets', h: 'Please avoid', items: ['Asking for patient or event details.', 'Promising to keep everything secret. If someone may be at risk, explain you may need to involve others.', 'Telling them to cheer up, or comparing it with your own experience.', 'Diagnosing. Describe what you have seen instead.'] },
            { type: 'bullets', h: 'Where they could go for more', items: ['Their shift lead or manager.', 'Staff wellbeing, chaplaincy or occupational health.', 'NHS Practitioner Health: confidential support for health and care staff.', 'Samaritans on 116 123, or text FRONTLINE to 85258, any time.'] },
            { type: 'callout', tone: 'care', t: 'If you are worried about their immediate safety, stay with them and call 999 or follow your workplace emergency process. Then look after yourself too: this can be heavy to hear.' }
          ]
        };
      }
    });
  }

  /* ======================================================================
     9. Workload conversation planner (SBAR)
     ====================================================================== */
  {
    const pattern = [['today', 'Today'], ['week', 'Most shifts this week'], ['weeks', 'For several weeks'], ['always', 'It has become normal']];
    const impact = [['breaks', 'Breaks are missed'], ['late', 'I stay late'], ['safety', 'I am worried about safety or quality'], ['journey', 'I am too tired for the journey home'], ['role', 'I cannot do the parts of my role I value'], ['handover', 'Handover is rushed']];
    const ask = [['priorities', 'Agree priorities with me'], ['cover', 'Cover so breaks can happen'], ['rota', 'A more predictable rota'], ['review', 'A review of this task or area'], ['heard', 'To be heard first'], ['support', 'Wellbeing or occupational health support']];
    const review = [['1w', 'in a week'], ['2w', 'in two weeks'], ['1m', 'in a month']];
    const askText = { priorities: 'agree priorities with me', cover: 'put cover in place so my breaks can happen', rota: 'look at a more predictable rota', review: 'review how this task or area is staffed', heard: 'listen first, and decide next steps together', support: 'point me to wellbeing or occupational health support' };
    tools.push({
      id: 'workload', group: 'talk', icon: 'clipboard', mins: '5 min', tag: 'Conversation planner',
      title: 'Workload conversation planner', blurb: 'Prepare a short, factual conversation with your manager or lead using the SBAR shape you already know.',
      when: 'Before asking your manager or lead for a workload or staffing conversation.',
      why: 'Clear facts, one or two specific asks and a review date make a conversation more likely to lead to action. SBAR (situation, background, assessment, recommendation) is a structure many health and care teams already use, so it should feel familiar.',
      flow: ['Situation', 'Background', 'Assessment', 'Recommendation'],
      note: 'Keep patient details out. For a patient-safety concern, use your formal route now: incident reporting, your senior, or your Freedom to Speak Up Guardian. Do not wait for this conversation.',
      refs: ['who', 'niosh', 'cdc'], practices: [['ground', null], ['tide', 120]], guides: ['ask-support', 'priorities', 'manager-support'], atlas: ['speak-up', 'work-design', 'pressure-at-work'], studio: 'support',
      fields: [
        { id: 's', type: 'text', label: 'Situation: what is happening? Facts only, no patient details', ph: 'e.g. Several tasks overlap during the afternoon', rows: 3 },
        { id: 'pattern', type: 'radio', label: 'Background: how long has it been going on?', def: 'week', options: pattern },
        { id: 'tried', type: 'text', label: 'What have you already tried?', ph: 'e.g. Asked colleagues to share tasks' },
        { id: 'impact', type: 'check', label: 'Assessment: what is the impact?', def: [], options: impact },
        { id: 'ask', type: 'check', label: 'Recommendation: what would you ask for?', def: ['priorities'], options: ask },
        { id: 'offer', type: 'text', label: 'What can you offer or try?', ph: 'e.g. Update you after one week' },
        { id: 'review', type: 'radio', label: 'Review', def: '2w', options: review.map(x => [x[0], x[1].replace(/^./, c => c.toUpperCase())]) }
      ],
      build(v) {
        const imp = labs(impact, v.impact), asks = (v.ask || []).map(k => askText[k]).filter(Boolean);
        const rv = (review.find(x => x[0] === (v.review || '2w')) || review[1])[1];
        const hasSafety = (v.impact || []).includes('safety');
        return {
          lead: 'One page, five minutes to read aloud. Bring a copy.',
          glance: { type: 'letters', items: [['S', 'Situation', !!clean(v.s)], ['B', 'Background', true], ['A', 'Assessment', imp.length > 0], ['R', 'Recommendation', asks.length > 0 || !!clean(v.offer)]] },
          blocks: [
            { type: 'script', h: 'To book the time', items: [{ t: 'Could I have ten minutes with you this week to talk about workload? I would like to share what I am seeing and agree a next step.' }] },
            { type: 'steps', h: 'SBAR', items: [
              { h: 'Situation', t: trimEnd(v.s), ph: 'Describe what is happening, facts only' },
              { h: 'Background', t: `${lab(pattern, v.pattern || 'week')}.${clean(v.tried) ? ' Already tried: ' + trimEnd(v.tried) + '.' : ''}` },
              { h: 'Assessment', t: imp.join('; '), ph: 'Choose the impact on you and on the work' },
              { h: 'Recommendation', t: asks.length ? `Could we ${asks.join('; and could we ')}?` : '', ph: 'Choose one or two asks' },
              { h: 'I can', t: trimEnd(v.offer), ph: 'Optional: what you can offer or try' },
              { h: 'Review', t: `Let us look at how it is going ${rv}.` }] },
            hasSafety ? { type: 'callout', tone: 'safe', t: 'Safety or quality worries: do not wait for this conversation. Use incident reporting, your senior, or your Freedom to Speak Up Guardian now.' } : null,
            { type: 'bullets', h: 'In the room', items: ['Stick to facts and impact. Leave out blame.', 'Choose one or two asks, not everything at once.', 'Ask: “What is possible, and by when?”', 'Agree who will do what and write the review date down.'] },
            { type: 'bullets', h: 'If nothing changes', items: ['Ask who else could help: HR, a union or professional-body representative, your Freedom to Speak Up Guardian or occupational health.', 'Keep your own notes of dates, facts and what was agreed.'] }
          ]
        };
      }
    });
  }

  /* ======================================================================
     10. Values and load check-in
     ====================================================================== */
  {
    const areas = [
      ['workload', 'Workload', 'The amount and pace of the work'], ['control', 'Control', 'A say in how and when I work'], ['rest', 'Rest and recovery', 'Breaks, sleep and time off'],
      ['people', 'Support', 'People I can lean on'], ['fair', 'Fairness and recognition', 'Feeling treated fairly and noticed'], ['meaning', 'Meaning', 'Work that matters to me']
    ];
    const values = [['care', 'Caring well'], ['learn', 'Learning'], ['family', 'Time with people I love'], ['health', 'My health'], ['friend', 'Friendship'], ['calm', 'Calm'], ['fair', 'Fairness'], ['purpose', 'Purpose or faith']];
    const small = {
      workload: ['Write my top three tasks at the start of each shift', 'Say what can wait, out loud, once a shift'], control: ['Ask for one decision I can make myself', 'Suggest one small change to how a task is done'],
      rest: ['Protect one 10-minute break each shift', 'Set a wind-down time after my last shift'], people: ['Message one colleague I trust', 'Sit with someone at break once this week'],
      fair: ['Raise one specific example with my lead', 'Note what I am doing that goes unseen'], meaning: ['Note one good moment at the end of each shift', 'Tell someone about a moment that mattered']
    };
    const next = { workload: ['workload', 'Workload conversation planner'], control: ['boundary', 'Say no or ask for help'], rest: ['break-plan', 'Micro-break planner'], people: ['peer', 'Check in on a colleague'], fair: ['workload', 'Workload conversation planner'], meaning: [null, 'Read: Notice a small moment of meaning', 'small-win'] };
    tools.push({
      id: 'load-check', group: 'week', icon: 'sliders', mins: '3 min', tag: 'Weekly check-in',
      title: 'Values and load check-in', blurb: 'A quiet weekly look at six areas of working life and the values you want to protect, ending in one small change.',
      when: 'Once a week, at the end of a shift or on a day off.',
      why: 'How work feels depends on more than effort: workload, control, rest, support, fairness and meaning all play a part. Looking at them one by one can show what is heavy and what is going well. It is a reflection, not a test.',
      flow: ['Six areas', 'Values', 'One change'],
      note: 'This does not measure stress or burnout, and there is no score. Heavy areas are often about the job’s load, not about you. Nothing leaves this device.',
      refs: ['who', 'niosh'], practices: [['pause3', 180], ['ground', null]], guides: ['small-win', 'reflection', 'priorities'], atlas: ['understanding-burnout', 'work-design'], studio: null,
      fields: [
        { id: 'lv', type: 'levels', label: 'How does each area feel this week?', areas, levels: [['ok', 'Going well'], ['mixed', 'Mixed'], ['heavy', 'Heavy']] },
        { id: 'val', type: 'check', label: 'Which one or two values do you want to protect this week?', def: [], max: 2, options: values },
        { id: 'act', type: 'text', label: 'One small change for the week', ph: 'e.g. Protect one 10-minute break each shift', fillsFor: v => { const h = areas.filter(([k]) => (v.lv || {})[k] === 'heavy').map(a => a[0]); const f = h.length ? h : Object.keys(small); return f.slice(0, 3).map(k => small[k][0]); } }
      ],
      dynamic: ['lv'],
      build(v) {
        const lv = v.lv || {}, rated = areas.filter(([k]) => lv[k]), heavy = areas.filter(([k]) => lv[k] === 'heavy');
        const nx = heavy.slice(0, 3).map(([k]) => next[k]);
        const blocks = [];
        blocks.push({ type: 'callout', tone: 'note', t: !rated.length ? 'Choose how each area feels. There are no right answers and no score.' : heavy.length ? `Heavy this week: ${heavy.map(a => a[1].toLowerCase()).join(', ')}. That is information about the load, not about you.` : 'Nothing marked heavy this week. Notice what is helping.' });
        if (heavy.length >= 3) blocks.push({ type: 'callout', tone: 'care', t: 'Several areas feel heavy. You do not have to carry that alone. Consider talking to your lead, a wellbeing service or someone you trust, or use Get help now.' });
        blocks.push({ type: 'steps', h: 'My week', items: [
          { h: 'Values to protect', t: labs(values, v.val).join(' · '), ph: 'Choose one or two' },
          { h: 'One small change', t: trimEnd(v.act), ph: 'Add one small change' },
          { h: 'Look again', t: 'Next week, run this again and compare by eye. Nothing is saved as a streak.' }] });
        if (nx.length) blocks.push({ type: 'alts', h: 'Tools that fit what feels heavy', items: nx.map(n => n[0] ? { t: n[1], open: n[0] } : { t: n[1], guide: n[2] }) });
        return {
          lead: 'Six areas, a values check and one change. No scores.',
          glance: { type: 'levels', items: areas.map(([k, l]) => [l, lv[k] || '']) },
          blocks
        };
      }
    });
  }

  window.SEREIN_TOOLKIT = { groups, tools };
})();
