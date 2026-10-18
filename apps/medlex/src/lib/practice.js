/* MedLex Practice: short, varied rounds built from the word parts and decoded words, with spaced review. */
(function () {
  'use strict';
  const L = window.MedlexLib; if (!L) return;
  const { D, st, save, esc, $, $$, words, wordById, sysName, prefixes, suffixes, roots, parts, partById, isKnown, touch, dueIds, knownCount, totalItems, ic, header, mount, shuffle, sample, uniq, lc, trim, bare, day, reduced } = L;
  const real = w => w.p.filter(p => p[1] !== 'v');
  const findPart = (text, k) => k === 'r' ? partById['root-' + text.toLowerCase()] : parts.find(p => p.k === k && bare(p.f) === bare(text));
  const meaningsOf = k => uniq(parts.filter(p => p.k === k).map(p => p.m));
  const pickWords = ch => { const ws = ch ? words.filter(w => w.ch === ch) : words; return ws.length >= 3 ? ws : words; };
  const KC = { p: 'k-p', r: 'k-r', s: 'k-s', v: 'k-v' };
  const split = w => w.p.map(p => `<span class="lx-sp ${KC[p[1]]}">${esc(p[0])}</span>`).join('<i>·</i>');

  /* ---------- item generators ---------- */
  const mc = (label, prompt, opts, c, x, ref) => ({ t: 'mc', label, prompt, opts, c, x, ref });
  function decode(ch) {
    const w = sample(pickWords(ch), 1)[0], rp = real(w), p = rp[Math.floor(Math.random() * rp.length)], k = p[1];
    const wrong = sample(meaningsOf(k).filter(m => m !== p[2]), 3), opts = shuffle([p[2], ...wrong]), fp = findPart(p[0], k);
    return mc('Decode it', `What does <span class="lx-sp ${KC[k]}">${esc(p[0])}</span> mean in <b>${esc(w.term)}</b>?<span class="lx-split">${split(w)}</span>`, opts, opts.indexOf(p[2]), `<b>${esc(p[0])}</b> means ${esc(p[2])}. ${esc(rp.map(q => q[2]).join(' + '))} &rarr; <b>${esc(lc(trim(w.plain)))}</b>.`, ['w:' + w.id, fp && fp.id].filter(Boolean));
  }
  function explain(ch) {
    const pool = pickWords(ch), w = sample(pool, 1)[0], wrong = sample(words.filter(x => x.id !== w.id && x.plain !== w.plain), 3), opts = shuffle([w.plain, ...wrong.map(x => x.plain)]);
    return mc('Explain simply', `A patient asks what <b>${esc(w.term)}</b> means. Which explanation would you give?`, opts, opts.indexOf(w.plain), `${esc(w.def)}${w.note ? ' <em>' + esc(w.note) + '</em>' : ''}`, ['w:' + w.id]);
  }
  function lookalike() {
    const c = sample(D.confusions, 1)[0], flip = Math.random() < .5, target = flip ? c.b : c.a, meaning = flip ? c.r : c.l, opts = shuffle([c.a, c.b]);
    return mc('Look-alikes', `Which word means <b>${esc(lc(meaning))}</b>?`, opts, opts.indexOf(target), `<b>${esc(c.a)}</b>: ${esc(lc(c.l))}. <b>${esc(c.b)}</b>: ${esc(lc(c.r))}. ${esc(c.d)}`, []);
  }
  function note() { const c = sample(D.cases, 1)[0], order = shuffle(c.a.map((a, i) => [a, i])), opts = order.map(o => o[0]); return mc('Clinical note', esc(c.q), opts, order.findIndex(o => o[1] === c.c), esc(c.x), c.t && wordById[c.t] ? ['w:' + c.t] : []); }
  function coding() { const c = sample(D.coding, 1)[0], order = shuffle(c.a.map((a, i) => [a, i])); return mc('Coding basics', esc(c.q), order.map(o => o[0]), order.findIndex(o => o[1] === c.c), esc(c.x), []); }
  function build(ch) {
    const w = sample(pickWords(ch).filter(x => x.p.length <= 5), 1)[0], want = w.p.map(p => p[0]), decoys = sample(uniq(parts.filter(p => p.k !== 'r' || true).map(p => p.f.replace(/^-|-$/g, ''))).filter(f => !want.some(x => bare(x) === bare(f))), 3 + (w.p.length > 3 ? 0 : 1));
    return { t: 'build', label: 'Build it', prompt: `Build the word that means <b>${esc(lc(trim(w.plain)))}</b>`, want, tiles: shuffle([...want, ...decoys]), kinds: w.p.map(p => p[1]), x: `<b>${esc(w.term)}</b> = ${w.p.map(p => esc(p[0])).join(' + ')}. ${esc(real(w).map(p => p[2]).join(' + '))}.`, ref: ['w:' + w.id] };
  }
  function match() {
    const ps = [...sample(prefixes.filter(p => p.t === 'core'), 2), ...sample(roots, 1), ...sample(suffixes.filter(s => ['procedure', 'condition', 'process', 'symptom'].includes(s.t)), 2)], seen = new Set(), pairs = ps.filter(p => !seen.has(p.m) && seen.add(p.m));
    return { t: 'match', label: 'Match pairs', prompt: 'Match each word part to its meaning', pairs: pairs.map(p => [p.f, p.m, p.id, p.k]), right: shuffle(pairs.map(p => p.m)), x: pairs.map(p => `<b>${esc(p.f)}</b> ${esc(p.m)}`).join(' · '), ref: pairs.map(p => p.id) };
  }
  function flash(n) {
    const due = dueIds(), fresh = [...prefixes.filter(p => p.t === 'core'), ...roots, ...words.map(w => ({ id: 'w:' + w.id, w })), ...suffixes.filter(s => ['procedure', 'condition', 'process', 'symptom', 'adjectival'].includes(s.t))].filter(p => !st.srs[p.id]).map(p => p.id);
    const ids = [...due, ...fresh].slice(0, n), item = id => { if (id.startsWith('w:')) { const w = wordById[id.slice(2)]; return w && { t: 'flash', label: 'Flash review', front: w.term, sub: 'Word', back: w.plain, tiles: w.p, ref: [id], x: esc(w.def) }; } const p = partById[id]; return p && { t: 'flash', label: 'Flash review', front: p.f, sub: { p: 'Prefix', r: 'Root', s: 'Suffix' }[p.k], back: p.m, ex: p.e, k: p.k, ref: [id], x: `<b>${esc(p.f)}</b> means ${esc(p.m)}${p.e ? ', as in ' + esc(p.e) : ''}.` }; };
    return ids.map(item).filter(Boolean);
  }
  const MODES = {
    daily: { name: 'Today’s session', icon: 'flame', desc: 'Ten mixed items, with anything due for review.', make: () => { const f = flash(2), items = [...f, decode(), decode(), decode(), explain(), explain(), build(), match(), lookalike(), note()]; while (items.length < 10) items.push(decode()); return shuffle(items.filter(x => x.t !== 'flash')).slice(0, 10 - f.length).concat(f).sort((a, b) => (a.t === 'flash') - (b.t === 'flash')); } },
    decode: { name: 'Decode it', icon: 'puzzle', desc: 'Pick what one part of a word means.', make: ch => Array.from({ length: 8 }, () => decode(ch)) },
    build: { name: 'Build it', icon: 'layers', desc: 'Tap the pieces to assemble the word.', make: ch => Array.from({ length: 6 }, () => build(ch)) },
    match: { name: 'Match pairs', icon: 'pairs', desc: 'Pair five word parts with their meanings.', make: () => Array.from({ length: 3 }, match) },
    explain: { name: 'Explain simply', icon: 'note', desc: 'Choose the explanation a patient would understand.', make: ch => Array.from({ length: 8 }, () => explain(ch)) },
    look: { name: 'Look-alikes', icon: 'repeat', desc: 'Tell confusable words apart.', make: () => Array.from({ length: Math.min(8, D.confusions.length * 2) }, lookalike) },
    notes: { name: 'Clinical notes', icon: 'book', desc: 'Interpret a word the way a note uses it.', make: () => shuffle(D.cases).slice(0, 6).map((c, i) => { const order = shuffle(c.a.map((a, j) => [a, j])); return mc('Clinical note', esc(c.q), order.map(o => o[0]), order.findIndex(o => o[1] === c.c), esc(c.x), c.t && wordById[c.t] ? ['w:' + c.t] : []); }) },
    coding: { name: 'Coding basics', icon: 'pencil', desc: 'The classifications behind clinical documentation.', make: () => shuffle(D.coding).slice(0, 6).map((c) => { const order = shuffle(c.a.map((a, j) => [a, j])); return mc('Coding basics', esc(c.q), order.map(o => o[0]), order.findIndex(o => o[1] === c.c), esc(c.x), []); }) },
    review: { name: 'Flash review', icon: 'flash', desc: 'Spaced recall: cards return just before you forget them.', make: () => flash(10) }
  };
  const ALIAS = { session: 'daily', clinical: 'notes', explain: 'explain', coding: 'coding' };

  /* ---------- practice home ---------- */
  const streak = () => { let n = 0, d0 = day(); if (!st.days[d0]) d0--; while (st.days[d0]) { n++; d0--; } return n; };
  const ring = (v, t) => { const r = 42, c = 2 * Math.PI * r; return `<svg class="lx-ring" viewBox="0 0 100 100" role="img" aria-label="${v} of ${t} known"><circle cx="50" cy="50" r="${r}" fill="none" stroke-width="9" class="lx-ring-bg"/><circle cx="50" cy="50" r="${r}" fill="none" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - v / t)).toFixed(1)}" transform="rotate(-90 50 50)" class="lx-ring-fg"/><text x="50" y="47" text-anchor="middle" class="lx-ring-n">${v}</text><text x="50" y="64" text-anchor="middle" class="lx-ring-t">of ${t}</text></svg>`; };
  function viewHome() {
    const due = dueIds().length, known = knownCount(), week = Array.from({ length: 7 }, (_, i) => { const d0 = day() - 6 + i; return [new Date(Date.now() - (6 - i) * 864e5).toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2), st.days[d0] || 0]; }), mx = Math.max(4, ...week.map(w => w[1])), sk = streak();
    const card = k => { const m = MODES[k], b = st.best[k]; return `<a class="lx-mode" href="#practice/run/${k}">${ic(m.icon, 'lx-mode-i')}<b>${esc(m.name)}</b><span>${esc(m.desc)}</span>${b != null ? `<span class="lx-s">Best ${b}%</span>` : '<span class="lx-s">New</span>'}</a>`; };
    mount(header('Practice', due ? `${due} ${due === 1 ? 'card is' : 'cards are'} ready for review.` : 'A few minutes of real recall beats an hour of re-reading.', `<a class="btn primary" href="#practice/run/daily">${ic('play')}Today’s session · 10 items</a>`) +
      `<section class="lx-prog-card" aria-label="Your progress">${ring(known, totalItems)}<div class="lx-prog-copy"><h2>${known ? `You know ${known} of ${totalItems} word parts and words` : 'Your first session starts the count'}</h2><p>${due ? `<a href="#practice/run/review">Review ${due} due ${due === 1 ? 'card' : 'cards'}</a> to keep them fresh.` : 'Everything you learn returns for review just before you forget it.'}</p>${sk ? `<span class="lx-streak">${ic('flame')} ${sk}-day streak</span>` : ''}</div><div class="lx-week" role="img" aria-label="Items practised in the last seven days: ${week.map(w => w[1]).join(', ')}">${week.map(([l, n]) => `<span><i style="height:${Math.max(6, Math.round(n / mx * 100))}%"></i><span class="lx-s">${l}</span></span>`).join('')}</div></section>
      <h2 class="lx-h2">Choose a way to practise</h2><div class="lx-modes">${['decode', 'build', 'match', 'explain', 'look', 'notes', 'coding', 'review'].map(card).join('')}</div>`);
  }

  /* ---------- runner ---------- */
  let R = null, keyFn = null;
  const stopKeys = () => { if (keyFn) { removeEventListener('keydown', keyFn, true); keyFn = null; } };
  function start(mode, params) {
    const m = MODES[mode] || MODES.daily, ch = params.get('ch') ? +params.get('ch') : 0, items = m.make(ch);
    if (!items.length) { mount(header(m.name, 'Nothing is ready here yet.') + `<p><a class="btn" href="#practice">Back to practice</a></p>`); return; }
    R = { mode, ch, name: m.name, items, i: 0, score: 0, missed: [], done: false, answered: false };
    stopKeys(); keyFn = onKey; addEventListener('keydown', keyFn, true); L.views.cleanup.push(stopKeys, () => { R = null; });
    drawItem(true);
  }
  const top = () => `<div class="lx-run-top"><a class="lx-exit" href="#practice" aria-label="Leave this round">${ic('x')}</a><div class="lx-bar-p" role="progressbar" aria-label="Round progress" aria-valuemin="0" aria-valuemax="${R.items.length}" aria-valuenow="${R.i}"><i style="width:${Math.round(R.i / R.items.length * 100)}%"></i></div><span>${Math.min(R.i + 1, R.items.length)} / ${R.items.length}</span></div>`;
  function drawItem(first) {
    const it = R.items[R.i]; R.answered = false; R.placed = []; R.sel = null; R.mist = 0; R.shownBack = false;
    let body = '';
    if (it.t === 'mc') body = `<h2 class="lx-prompt">${it.prompt}</h2><div class="lx-opts" role="group" aria-label="Answer choices">${it.opts.map((o, i) => `<button type="button" class="lx-opt" data-lx="ropt" data-i="${i}"><kbd aria-hidden="true">${i + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>`;
    else if (it.t === 'build') body = `<h2 class="lx-prompt">${it.prompt}</h2><div class="lx-slots" id="lx-slots" role="group" aria-label="Your word" aria-live="polite"></div><div class="lx-tray" role="group" aria-label="Pieces">${it.tiles.map((t, i) => `<button type="button" class="lx-pc" data-lx="rtile" data-i="${i}">${esc(t)}</button>`).join('')}</div><div class="lx-row"><button type="button" class="btn" data-lx="rhint">Hint</button><button type="button" class="btn" data-lx="rreset">Start again</button><button type="button" class="btn primary" data-lx="rcheck" disabled>Check</button></div>`;
    else if (it.t === 'match') body = `<h2 class="lx-prompt">${it.prompt}</h2><div class="lx-match"><div class="lx-mcol" role="group" aria-label="Word parts">${it.pairs.map((p, i) => `<button type="button" class="lx-mp k-${p[3]}" data-lx="mleft" data-i="${i}">${esc(p[0])}</button>`).join('')}</div><div class="lx-mcol" role="group" aria-label="Meanings">${it.right.map((m, i) => `<button type="button" class="lx-mm" data-lx="mright" data-m="${esc(m)}">${esc(m)}</button>`).join('')}</div></div>`;
    else body = `<div class="lx-flash"><span class="lx-fl-k">${esc(it.sub)}</span><b class="lx-fl-f${it.k ? ' ' + KC[it.k] : ''}">${esc(it.front)}</b><div class="lx-fl-back" id="lx-fl-back" hidden>${it.tiles ? `<div class="lx-tiles">${it.tiles.map((p, i) => (i ? '<i class="lx-plus">+</i>' : '') + L.tile(p[1], p[0], p[2], i)).join('')}</div>` : ''}<p class="lx-fl-m">${esc(it.back)}</p>${it.ex ? `<p class="lx-fl-e">e.g. ${esc(it.ex)}</p>` : ''}</div></div><div class="lx-row" id="lx-fl-btns"><button type="button" class="btn primary" data-lx="rshow">Show the answer</button></div>`;
    mount(`<div class="lx-run">${top()}<section class="lx-q"><span class="eyebrow">${esc(it.label)}</span>${body}<div class="lx-fb" id="lx-fb" role="status" hidden></div></section></div>`, false);
    const f = $('.lx-opt, .lx-pc, .lx-mp, [data-lx=rshow]'); f && f.focus({ preventScroll: true });
  }
  function finishItem(ok, it, extra) {
    if (R.answered) return; R.answered = true; if (ok) R.score++; else R.missed.push(it);
    it.ref.forEach(id => touch(id, ok));
    const fb = $('#lx-fb'); fb.hidden = false; fb.className = 'lx-fb ' + (ok ? 'is-right' : 'is-wrong');
    fb.innerHTML = `<b>${ok ? ['Yes.', 'Right.', 'Exactly.', 'Well done.'][R.score % 4] : 'Not quite.'}</b> <span>${it.x}</span>${extra || ''}<div class="lx-fb-act"><button type="button" class="btn primary" data-lx="rnext" id="lx-next">${R.i + 1 >= R.items.length ? 'See results' : 'Continue'} ${ic('arrow')}</button></div>`;
    $('#lx-next').focus({ preventScroll: true }); fb.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
  }
  const cur = () => R.items[R.i];
  L.act('ropt', b => { if (R.answered) return; const it = cur(), i = +b.dataset.i, ok = i === it.c; $$('.lx-opt').forEach((o, k) => { o.disabled = true; o.classList.toggle('is-right', k === it.c); o.classList.toggle('is-wrong', k === i && !ok); o.classList.toggle('is-dim', k !== it.c && k !== i); }); finishItem(ok, it); });
  L.act('rnext', () => { R.i++; R.i >= R.items.length ? drawResults() : drawItem(); });
  const drawSlots = () => { const it = cur(), s = $('#lx-slots'); s.innerHTML = R.placed.length ? R.placed.map((i, k) => `<button type="button" class="lx-pc is-placed" data-lx="runtile" data-k="${k}">${esc(it.tiles[i])}</button>`).join('') : `<span class="lx-slot-ph">${it.want.length} pieces, in order</span>`; $$('.lx-pc[data-lx=rtile]').forEach(b => { b.disabled = R.placed.includes(+b.dataset.i) || R.answered; }); $('[data-lx=rcheck]').disabled = R.placed.length < 2 || R.answered; };
  L.act('rtile', b => { if (R.answered) return; R.placed.push(+b.dataset.i); drawSlots(); });
  L.act('runtile', b => { if (R.answered) return; R.placed.splice(+b.dataset.k, 1); drawSlots(); });
  L.act('rreset', () => { if (R.answered) return; R.placed = []; drawSlots(); });
  L.act('rhint', b => { const it = cur(); const fb = $('#lx-fb'); fb.hidden = false; fb.className = 'lx-fb'; fb.innerHTML = `Pieces in order: ${it.kinds.map(k => ({ p: 'prefix', r: 'root', s: 'suffix', v: 'linking vowel' }[k])).join(' → ')}.`; b.disabled = true; });
  L.act('rcheck', () => { const it = cur(), got = R.placed.map(i => it.tiles[i]), ok = got.length === it.want.length && got.every((g, i) => bare(g) === bare(it.want[i])); drawSlots(); $$('.lx-slots .lx-pc').forEach((s, k) => s.classList.add(bare(got[k]) === bare(it.want[k] || '') ? 'is-right' : 'is-wrong')); finishItem(ok, it, ok ? '' : `<span class="lx-ans">Answer: ${it.want.map(esc).join(' + ')}</span>`); });
  L.act('mleft', b => { if (R.answered || b.disabled) return; $$('.lx-mp').forEach(x => x.classList.toggle('is-sel', x === b)); R.sel = +b.dataset.i; });
  L.act('mright', b => { if (R.answered || b.disabled || R.sel == null) return; const it = cur(), pair = it.pairs[R.sel], left = $(`.lx-mp[data-i="${R.sel}"]`); if (pair[1] === b.dataset.m) { left.disabled = b.disabled = true; left.classList.remove('is-sel'); left.classList.add('is-done'); b.classList.add('is-done'); R.sel = null; R.matched = (R.matched || 0) + 1; if ($$('.lx-mp:not(:disabled)').length === 0) { R.matched = 0; finishItem(R.mist <= 1, it); } } else { R.mist++; b.classList.add('is-bad'); setTimeout(() => b.classList.remove('is-bad'), 450); } });
  L.act('rshow', () => { const it = cur(); $('#lx-fl-back').hidden = false; $('#lx-fl-btns').innerHTML = `<button type="button" class="btn" data-lx="rflash" data-ok="0">Still learning</button><button type="button" class="btn primary" data-lx="rflash" data-ok="1">${ic('check')}Got it</button>`; $('[data-lx=rflash][data-ok="1"]').focus(); });
  L.act('rflash', b => { const it = cur(), ok = b.dataset.ok === '1'; $('#lx-fl-btns').innerHTML = ''; finishItem(ok, it); });
  function drawResults() {
    const pct = Math.round(R.score / R.items.length * 100); if ((st.best[R.mode] || 0) < pct) st.best[R.mode] = pct; save();
    const m = R.missed;
    mount(`<div class="lx-run"><section class="lx-result"><h1 tabindex="-1">${pct >= 80 ? 'Strong round.' : pct >= 50 ? 'Good progress.' : 'A useful start.'}</h1>${ring(R.score, R.items.length).replace('known', 'correct')}<p>${R.score} of ${R.items.length} right in <b>${esc(R.name)}</b>. ${m.length ? 'The ones you missed will come back for review.' : 'Nothing missed.'}</p>${m.length ? `<div class="lx-missed"><h2>Worth another look</h2><ul>${m.slice(0, 6).map(i => `<li><b>${i.front ? esc(i.front) : ''}</b><span>${i.x}</span></li>`).join('')}</ul></div>` : ''}<div class="lx-row"><a class="btn primary" href="#practice/run/${R.mode}${R.ch ? '?ch=' + R.ch : ''}" data-lx="again">${ic('repeat')}Another round</a><a class="btn" href="#practice">All practice</a></div></section></div>`);
  }
  L.act('again', (b, e) => { const m = R.mode, ch = R.ch; start(m, new URLSearchParams(ch ? 'ch=' + ch : '')); });
  function onKey(e) {
    if (!R || R.done || e.ctrlKey || e.metaKey || e.altKey) return; const t = e.target; if (t.matches && t.matches('input,textarea,select')) return;
    const it = R.items[R.i]; if (!it) return;
    if (it.t === 'mc' && /^[1-4]$/.test(e.key) && !R.answered) { const b = $(`.lx-opt[data-i="${+e.key - 1}"]`); if (b) { e.preventDefault(); b.click(); } }
    else if (e.key === 'Enter' && R.answered) { const n = $('#lx-next'); if (n && d_active() !== n) { e.preventDefault(); n.click(); } }
  }
  const d_active = () => document.activeElement;

  L.on('practice', (path, params) => {
    const seg = path.split('/');
    if (seg[1] === 'run' && MODES[seg[2]]) return start(seg[2], params);
    if (seg[1] && ALIAS[seg[1]]) return start(ALIAS[seg[1]], params);
    viewHome();
  });
})();
