/* MedLex Library: Word parts, Word lab, Body systems, Glossary. Lead with what teaches decoding; keep the big glossary one search away. */
(function () {
  'use strict';
  const L = window.MedlexLib; if (!L) return;
  const { D, st, save, esc, $, $$, words, wordById, wordByName, sysName, prefixes, suffixes, roots, partById, KIND, KIND_PL, isKnown, touch, isSaved, toggleSaved, ic, header, tabs, tile, mount, speak, canSpeak, loadGlossary, bare, sample, shuffle, uniq, lc, trim } = L;
  const TABS = [['lab', 'Word lab', '#library/lab'], ['systems', 'Body systems', '#library/systems'], ['glossary', 'Glossary', '#library/glossary'], ['pronunciation', 'Pronunciation', '#library/pronunciation']];
  L.libTabs = TABS;
  const nav = cur => tabs(TABS, cur, 'Library sections');
  const posterOf = id => D.atlas.find(p => p.id === id);
  const link = (w, text) => `<a class="lx-wl" href="#library/lab?w=${esc(w.id)}">${esc(text || w.term)}</a>`;
  const exLink = e => { const w = wordByName[String(e || '').toLowerCase()]; return w ? link(w, e) : esc(e); };

  /* ================= Word parts ================= */
  const PS = { kind: 'all', q: '', tier: 'core', sub: 'all', shown: 36 };
  const EXAMPLES = ['pericarditis', 'tachycardia', 'gastritis', 'nephrectomy'].filter(id => wordById[id]);
  let how = EXAMPLES[0];
  function howBuilt() {
    const w = wordById[how] || words[0], seq = w.p.map((p, i) => (i ? '<i class="lx-plus" aria-hidden="true">+</i>' : '') + tile(p[1], p[0], p[2], i)).join('');
    return `<section class="lx-how" aria-labelledby="lx-how-t"><div class="lx-how-copy"><span class="eyebrow">How a medical word is built</span><h2 id="lx-how-t">Read the end, then the start, then the middle.</h2>
      <ol class="lx-steps"><li><b>1</b><span>Start at the <em>end</em>. The suffix names a condition, procedure or process.</span></li><li><b>2</b><span>Find the <em>root</em>. It points to a structure or body system.</span></li><li><b>3</b><span>Notice the <em>prefix</em>. It changes place, time, amount or direction.</span></li><li><b>4</b><span>Check the <em>clinical meaning</em>. Parts are clues, the definition is the answer.</span></li></ol></div>
      <div class="lx-how-demo"><div class="lx-how-pick" role="group" aria-label="Try an example word">${EXAMPLES.map(id => `<button type="button" class="lx-chip${id === how ? ' is-on' : ''}" data-lx="how" data-id="${id}" aria-pressed="${id === how}">${esc(wordById[id].term)}</button>`).join('')}</div>
      <div class="lx-tiles" aria-live="polite">${seq}</div><p class="lx-equals"><span>${esc(w.p.filter(p => p[1] !== 'v').map(p => p[2]).join(' + '))}</span> <b>${esc(trim(w.plain))}</b></p><a class="lx-more" href="#library/lab?w=${w.id}">Open in the Word lab ${ic('arrow')}</a></div></section>`;
  }
  const matchP = p => { const q = PS.q.trim().toLowerCase(); return !q || p.f.toLowerCase().includes(q) || p.m.toLowerCase().includes(q) || String(p.e || '').toLowerCase().includes(q); };
  const partCard = p => {
    const known = isKnown(p.id), n = p.k === 'r' ? p.w.length : 0;
    return `<article class="lx-part k-${p.k}${known ? ' is-known' : ''}"><div class="lx-part-top"><span class="lx-kind">${KIND[p.k]}</span><button type="button" class="lx-know" data-lx="know" data-id="${esc(p.id)}" aria-pressed="${known}" aria-label="${known ? 'Marked as known' : 'Mark as known'}: ${esc(p.f)}" title="${known ? 'You know this' : 'Mark as known'}">${ic('check')}</button></div><b class="lx-form">${esc(p.f)}</b><span class="lx-mean">${esc(p.m)}</span>${p.e ? `<span class="lx-ex">${p.k === 'r' ? 'in' : 'e.g.'} ${exLink(p.e)}${n > 1 ? ` <span class="lx-s">+${n - 1} more</span>` : ''}</span>` : ''}</article>`;
  };
  const pool = k => (k === 'p' ? prefixes.filter(p => PS.tier === 'all' || p.t === 'core') : k === 'r' ? roots : suffixes.filter(p => PS.sub === 'all' || p.t === PS.sub)).filter(matchP).sort((a, b) => bare(a.f).localeCompare(bare(b.f)));
  function drawParts() {
    const body = $('#lx-parts-body'); if (!body) return;
    $$('[data-lx=pkind]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === PS.kind)));
    if (PS.kind === 'all' && !PS.q.trim()) {
      body.innerHTML = ['p', 'r', 's'].map(k => { const all = k === 'p' ? prefixes.filter(p => p.t === 'core') : k === 'r' ? roots : suffixes.filter(p => ['procedure', 'condition', 'process', 'symptom', 'adjectival'].includes(p.t)); const list = all.sort((a, b) => bare(a.f).localeCompare(bare(b.f))).slice(0, 8); return `<section class="lx-sec"><div class="lx-sec-h"><h2>${KIND_PL[k]}</h2><button type="button" class="lx-more" data-lx="pkind" data-k="${k}">All ${k === 'p' ? prefixes.length : k === 'r' ? roots.length : suffixes.length} ${lc(KIND_PL[k])} ${ic('arrow')}</button></div><p class="lx-sec-lead">${{ p: 'Come first. They change place, time, amount or direction.', r: 'The core idea: a structure or body system. Roots found in the decoded words.', s: 'Come last. They name a condition, procedure or process.' }[k]}</p><div class="lx-grid">${list.map(partCard).join('')}</div></section>`; }).join('');
      return;
    }
    const kinds = PS.kind === 'all' ? ['p', 'r', 's'] : [PS.kind];
    let sub = '';
    if (PS.kind === 'p') sub = `<div class="lx-pills lx-sub" role="group" aria-label="Which prefixes">${[['core', `Essentials (${prefixes.filter(p => p.t === 'core').length})`], ['all', `All ${prefixes.length}`]].map(([v, l]) => `<button type="button" class="lx-chip${PS.tier === v ? ' is-on' : ''}" data-lx="ptier" data-v="${v}" aria-pressed="${PS.tier === v}">${l}</button>`).join('')}</div>`;
    if (PS.kind === 's') sub = `<div class="lx-pills lx-sub" role="group" aria-label="What the ending names">${['all', ...uniq(suffixes.map(s => s.t))].map(v => `<button type="button" class="lx-chip${PS.sub === v ? ' is-on' : ''}" data-lx="psub" data-v="${esc(v)}" aria-pressed="${PS.sub === v}">${v === 'all' ? 'Everything' : esc(L.cap(v))}</button>`).join('')}</div>`;
    const list = kinds.flatMap(k => pool(k)), shown = list.slice(0, PS.shown);
    body.innerHTML = sub + `<p class="lx-count" role="status">${list.length} ${list.length === 1 ? 'part' : 'parts'}${PS.q.trim() ? ` matching “${esc(PS.q.trim())}”` : ''}</p>` + (shown.length ? `<div class="lx-grid">${shown.map(partCard).join('')}</div>${list.length > shown.length ? `<button type="button" class="btn lx-showmore" data-lx="pmore">Show ${Math.min(36, list.length - shown.length)} more</button>` : ''}` : `<div class="lx-empty"><b>No part matches.</b><span>Try a shorter spelling, or a meaning such as “heart” or “inflammation”.</span></div>`);
  }
  function viewParts() {
    mount(header('Library', 'The pieces medical words are built from.') + nav('parts') + howBuilt() +
      `<div class="lx-bar"><label class="lx-search">${ic('search')}<span class="sr-only">Search word parts</span><input type="search" data-lx-input="psearch" placeholder="Search a part, a meaning or a word…" value="${esc(PS.q)}" autocomplete="off"></label><div class="lx-pills" role="group" aria-label="Type of part">${[['all', 'All'], ['p', 'Prefixes'], ['r', 'Roots'], ['s', 'Suffixes']].map(([k, l]) => `<button type="button" class="lx-chip" data-lx="pkind" data-k="${k}" aria-pressed="${PS.kind === k}">${l}</button>`).join('')}</div></div><div id="lx-parts-body"></div>`);
    drawParts();
  }
  L.act('how', b => { how = b.dataset.id; const h = $('.lx-how'); if (h) { h.outerHTML = howBuilt(); const nb = $(`[data-lx=how][data-id="${how}"]`); nb && nb.focus(); } });
  L.act('pkind', b => { PS.kind = b.dataset.k; PS.shown = 36; drawParts(); const t = $('#lx-parts-body'); if (t && PS.kind !== 'all') t.scrollIntoView({ block: 'nearest' }); });
  L.act('ptier', b => { PS.tier = b.dataset.v; PS.shown = 36; drawParts(); });
  L.act('psub', b => { PS.sub = b.dataset.v; PS.shown = 36; drawParts(); });
  L.act('pmore', () => { PS.shown += 36; drawParts(); });
  L.act('psearch', t => { PS.q = t.value; PS.shown = 36; clearTimeout(PS.t); PS.t = setTimeout(drawParts, 90); });
  L.act('know', b => { const id = b.dataset.id; if (isKnown(id)) { delete st.know[id]; if (st.srs[id]) st.srs[id].b = Math.min(st.srs[id].b, 2); } else st.know[id] = 1; save(); const art = b.closest('.lx-part'), on = isKnown(id); art.classList.toggle('is-known', on); b.setAttribute('aria-pressed', String(on)); });

  /* ================= Word lab ================= */
  const LS = { q: '', sel: '', quiz: null };
  const sysOrder = [...new Set(words.map(w => w.ch))].sort((a, b) => a - b);
  const matchW = w => { const q = LS.q.trim().toLowerCase(); return !q || w.term.toLowerCase().includes(q) || w.plain.toLowerCase().includes(q) || w.al.some(a => a.toLowerCase().includes(q)) || w.p.some(p => p[2].toLowerCase().includes(q) || p[0].toLowerCase().includes(q)); };
  function labList() {
    const out = sysOrder.map(ch => { const ws = words.filter(w => w.ch === ch && matchW(w)); return ws.length ? `<div class="lx-lab-g"><h2>${esc(sysName(ch))}</h2><div>${ws.map(w => `<button type="button" class="lx-pick${w.id === LS.sel ? ' is-on' : ''}" data-lx="pick" data-id="${w.id}" aria-pressed="${w.id === LS.sel}">${esc(w.term)}</button>`).join('')}</div></div>` : ''; }).join('');
    return out || '<p class="lx-empty"><b>No word matches.</b><span>Clear the search to see all 75 decoded words.</span></p>';
  }
  const related = w => { const keys = w.p.filter(p => p[1] !== 'v').map(p => bare(p[0])); return words.filter(x => x.id !== w.id && x.p.some(p => p[1] !== 'v' && keys.includes(bare(p[0])))).slice(0, 8); };
  function labDetail() {
    const w = wordById[LS.sel]; if (!w) return '';
    const real = w.p.filter(p => p[1] !== 'v'), rel = related(w), poster = posterOf('ch' + w.ch), sv = isSaved('w:' + w.id);
    return `<article class="lx-lab-card" aria-labelledby="lx-lab-t"><div class="lx-lab-head"><div><span class="lx-sys">${esc(sysName(w.ch))}</span><h2 id="lx-lab-t">${esc(w.term)}</h2></div><div class="lx-lab-btns">${canSpeak() ? `<button type="button" class="btn lx-icon" data-lx="listen" data-t="${esc(w.term)}" aria-label="Hear ${esc(w.term)}">${ic('listen')}<span>Listen</span></button>` : ''}<a class="btn lx-icon" href="#library/pronunciation?w=${esc(w.id)}">${ic('listen')}<span>Practise saying it</span></a><button type="button" class="btn lx-icon" data-lx="saveword" data-id="${esc('w:' + w.id)}" aria-pressed="${sv}">${ic('save')}<span>${sv ? 'Saved' : 'Save'}</span></button></div></div>
      <div class="lx-tiles lx-big" role="img" aria-label="${esc(w.term)} is made of ${esc(real.map(p => p[0] + ', ' + p[2]).join('; '))}">${w.p.map((p, i) => (i ? '<i class="lx-plus" aria-hidden="true">+</i>' : '') + tile(p[1], p[0], p[2], i)).join('')}</div>
      <div class="lx-reads"><div class="lx-read"><span>Built from</span><p>${esc(real.map(p => p[2]).join(' + '))}</p></div><div class="lx-read is-main"><span>In plain words</span><p>${esc(w.plain)}</p></div><div class="lx-read"><span>Clinical definition</span><p>${esc(w.def)}</p></div></div>
      ${w.ex ? `<p class="lx-example"><b>In use</b> ${esc(w.ex)}</p>` : ''}${w.note ? `<p class="lx-note"><b>Careful</b> ${esc(w.note)}</p>` : ''}
      ${w.al.length ? `<p class="lx-alias"><b>Also written</b> ${esc(w.al.join(', '))}</p>` : ''}
      <div class="lx-quizbox" id="lx-quiz">${quizHtml(w)}</div>
      ${rel.length ? `<div class="lx-rel"><h3>Words that share a part</h3><div>${rel.map(r => link(r)).join('')}</div></div>` : ''}
      ${poster ? `<button type="button" class="lx-poster" data-lx="atlasopen" data-id="${poster.id}"><img src="${poster.thumb}" alt="" loading="lazy" width="340" height="453"><span><b>See the illustrated guide</b><span class="lx-s">${esc(poster.title)}</span></span>${ic('expand')}</button>` : ''}</article>`;
  }
  function quizHtml(w) {
    const q = LS.quiz && LS.quiz.w === w.id ? LS.quiz : null;
    if (!q) return `<button type="button" class="btn primary" data-lx="quiz">${ic('target')}Quiz me on this word</button>`;
    return `<h3>Which piece means “${esc(q.part[2])}”?</h3><div class="lx-opts" role="group" aria-label="Choose the piece">${q.opts.map((o, i) => `<button type="button" class="lx-opt${q.done ? (o === q.part[0] ? ' is-right' : i === q.picked ? ' is-wrong' : '') : ''}" data-lx="qpick" data-i="${i}" ${q.done ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>${q.done ? `<p class="lx-fb ${q.picked != null && q.opts[q.picked] === q.part[0] ? 'is-right' : 'is-wrong'}" role="status">${q.opts[q.picked] === q.part[0] ? 'Yes.' : 'Not quite.'} <b>${esc(q.part[0])}</b> means ${esc(q.part[2])}. <button type="button" class="lx-more" data-lx="quiz">Another ${ic('arrow')}</button></p>` : ''}`;
  }
  function viewLab(params) {
    const w = params.get('w'); LS.sel = wordById[w] ? w : (wordById[LS.sel] ? LS.sel : (wordById.pericarditis ? 'pericarditis' : words[0].id));
    mount(header('Library', 'Take a word apart, then put it back together.') + nav('lab') + `<div class="lx-lab"><aside class="lx-lab-list" aria-label="Decoded words"><label class="lx-search">${ic('search')}<span class="sr-only">Find a word</span><input type="search" data-lx-input="lsearch" placeholder="Find one of ${words.length} words…" value="${esc(LS.q)}" autocomplete="off"></label><p class="lx-hint">Every word here has curated parts. ${D.glossaryCount} more clinical terms are in the <a href="#library/glossary">Glossary</a>.</p><div id="lx-lab-groups">${labList()}</div></aside><section class="lx-lab-detail" id="lx-lab-detail">${labDetail()}</section></div>`);
  }
  const pickWord = id => { LS.sel = id; LS.quiz = null; const dd = $('#lx-lab-detail'); if (dd) dd.innerHTML = labDetail(); $$('.lx-pick').forEach(b => { const on = b.dataset.id === id; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); }); try { history.replaceState(null, '', '#library/lab?w=' + id); } catch { } if (matchMedia('(max-width:900px)').matches && dd) dd.scrollIntoView({ block: 'start', behavior: L.reduced() ? 'auto' : 'smooth' }); };
  L.act('pick', b => pickWord(b.dataset.id));
  L.act('lsearch', t => { LS.q = t.value; clearTimeout(LS.t); LS.t = setTimeout(() => { const g = $('#lx-lab-groups'); if (g) g.innerHTML = labList(); }, 90); });
  L.act('listen', b => speak(b.dataset.t));
  L.act('saveword', b => { const on = toggleSaved(b.dataset.id); b.setAttribute('aria-pressed', String(on)); $('span', b).textContent = on ? 'Saved' : 'Save'; });
  L.act('quiz', () => { const w = wordById[LS.sel], real = w.p.filter(p => p[1] !== 'v'), part = real[Math.floor(Math.random() * real.length)]; const decoys = sample(uniq(L.parts.map(p => p.f).filter(f => !real.some(r => bare(r[0]) === bare(f)))), 3); LS.quiz = { w: w.id, part, opts: shuffle([part[0], ...real.filter(r => r !== part).map(r => r[0]).slice(0, 1), ...decoys]).slice(0, 4), done: false, picked: null }; if (!LS.quiz.opts.includes(part[0])) LS.quiz.opts[0] = part[0]; $('#lx-quiz').innerHTML = quizHtml(w); const f = $('.lx-opt', $('#lx-quiz')); f && f.focus(); });
  L.act('qpick', b => { const q = LS.quiz; if (!q || q.done) return; q.picked = +b.dataset.i; q.done = true; touch('w:' + q.w, q.opts[q.picked] === q.part[0]); $('#lx-quiz').innerHTML = quizHtml(wordById[q.w]); const n = $('.lx-more', $('#lx-quiz')); n && n.focus(); });

  /* ================= Body systems ================= */
  function viewSystems() {
    const sys = D.systems;
    mount(header('Library', 'Every body system on one page: the guide, the key words, the parts they share.') + nav('systems') + `<div class="lx-sysgrid">${sys.map(s => { const p = posterOf(s.poster); return `<a class="lx-sys-card" href="#library/system/${s.id}">${p ? `<img src="${p.thumb}" alt="" loading="lazy" width="340" height="453">` : '<span class="lx-sys-ph" aria-hidden="true"></span>'}<span class="lx-sys-b"><span class="lx-s">Chapter ${s.n}</span><b>${esc(s.title)}</b><em>${esc(s.sub)}</em><span class="lx-sys-n">${s.decoded.length ? `<i>${s.decoded.length} decoded</i>` : ''}<i>${s.terms} terms</i></span></span></a>`; }).join('')}</div>`);
  }
  function viewSystem(id) {
    const s = D.systems.find(x => x.id === id); if (!s) return viewSystems();
    const poster = posterOf(s.poster), dw = s.decoded.map(i => wordById[i]), pu = []; const seen = new Set();
    dw.forEach(w => w.p.forEach(p => { const k = p[1] + bare(p[0]); if (p[1] !== 'v' && !seen.has(k)) { seen.add(k); pu.push(p); } }));
    mount(`<a class="back-link" href="#library/systems">${ic('arrow', 'lx-flip')}All body systems</a>` + header(s.title, s.sub, `<a class="btn primary" href="#learn/module/${s.id}/overview">Learn this module</a>`, `Chapter ${s.n}`) +
      `<div class="lx-system"><div class="lx-sys-side">${poster ? `<button type="button" class="lx-poster-big" data-lx="atlasopen" data-id="${poster.id}" aria-label="Open the illustrated guide: ${esc(poster.title)}"><img src="${poster.thumb}" alt="${esc(poster.title)}. ${esc(poster.outcome)}" width="340" height="453"><span>${ic('expand')} Enlarge the guide</span></button>` : ''}</div><div class="lx-sys-main">
      ${dw.length ? `<section class="lx-card"><h2>Words to decode</h2><p class="lx-sec-lead">Tap a word to take it apart.</p><div class="lx-wchips">${dw.map(w => link(w)).join('')}</div></section>` : ''}
      ${pu.length ? `<section class="lx-card"><h2>Word parts you will meet here</h2><div class="lx-tiles lx-wrap">${pu.map((p, i) => tile(p[1], p[0], p[2], i)).join('')}</div></section>` : ''}
      <section class="lx-card"><h2>Key terms</h2><div id="lx-sys-terms"><p class="lx-hint">Loading the glossary…</p></div></section>
      <a class="btn lx-wide" href="#practice/run/decode?ch=${s.n}">${ic('target')}Practise ${esc(sysName(s.n))} words</a></div></div>`);
    loadGlossary().then(g => { const el = $('#lx-sys-terms'); if (!el) return; const list = g.filter(t => t.ch === s.n).sort((a, b) => a.term.localeCompare(b.term)), top = list.slice(0, 10); el.innerHTML = `<ul class="lx-tlist">${top.map(t => `<li><b>${esc(t.term)}</b><span>${esc(t.plain)}</span></li>`).join('')}</ul><a class="lx-more" href="#library/glossary?sys=${s.n}">All ${list.length} ${esc(sysName(s.n))} terms in the glossary ${ic('arrow')}</a>`; }).catch(() => { const el = $('#lx-sys-terms'); if (el) el.innerHTML = '<p class="lx-hint">The glossary could not load. Check your connection and try again.</p>'; });
  }
  L.act('atlasopen', b => { if (L.openAtlas) L.openAtlas(b.dataset.id); });

  /* ================= Glossary ================= */
  const GS = { q: '', ch: '', saved: false, shown: 30, open: '' };
  const hl = (text, q) => { const t = esc(text); if (!q) return t; const tokens = q.split(/\s+/).filter(x => x.length > 1).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); if (!tokens.length) return t; return t.replace(new RegExp('(' + tokens.join('|') + ')', 'ig'), '<mark>$1</mark>'); };
  const rank = (t, tokens) => { const name = t.term.toLowerCase(), hay = (name + ' ' + t.al.join(' ').toLowerCase()), all = hay + ' ' + t.plain.toLowerCase() + ' ' + (t.def || '').toLowerCase(); if (!tokens.every(k => all.includes(k))) return -1; let r = 0; if (name === tokens.join(' ')) r += 100; if (name.startsWith(tokens[0])) r += 50; if (tokens.every(k => name.includes(k))) r += 30; if (tokens.every(k => hay.includes(k))) r += 15; return r + (t.d ? 5 : 0); };
  function glossResults(g) {
    const tokens = GS.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let list;
    if (GS.saved) list = g.filter(t => isSaved('g:' + t.id) || isSaved('w:' + t.id)).filter(t => !tokens.length || rank(t, tokens) >= 0);
    else if (tokens.length) list = g.map(t => [t, GS.ch && t.ch !== +GS.ch ? -1 : rank(t, tokens)]).filter(x => x[1] >= 0).sort((a, b) => b[1] - a[1] || a[0].term.localeCompare(b[0].term)).map(x => x[0]);
    else if (GS.ch) list = g.filter(t => t.ch === +GS.ch).sort((a, b) => a.term.localeCompare(b.term));
    else return null;
    return list;
  }
  const termRow = (t, q) => { const open = GS.open === t.id, sv = isSaved('g:' + t.id) || isSaved('w:' + t.id); return `<article class="lx-term${open ? ' is-open' : ''}" id="t-${esc(t.id)}"><button type="button" class="lx-term-h" data-lx="topen" data-id="${esc(t.id)}" aria-expanded="${open}" aria-controls="tb-${esc(t.id)}"><span class="lx-term-n">${hl(t.term, q)}${t.d ? '<i class="lx-decoded">decoded</i>' : ''}</span><span class="lx-term-s">${esc(sysName(t.ch))}</span><span class="lx-term-p">${hl(t.plain, q)}</span></button><div class="lx-term-b" id="tb-${esc(t.id)}" ${open ? '' : 'hidden'}>${t.def ? `<p><b>Definition</b> ${esc(t.def)}</p>` : ''}${t.ex ? `<p><b>In use</b> ${esc(t.ex)}</p>` : ''}${t.note ? `<p class="lx-note"><b>Careful</b> ${esc(t.note)}</p>` : ''}${t.al.length ? `<p><b>Also written</b> ${esc(t.al.join(', '))}</p>` : ''}<div class="lx-term-act">${t.d ? `<a class="btn primary" href="#library/lab?w=${esc(t.id)}">Take it apart</a>` : ''}${canSpeak() ? `<button type="button" class="btn lx-icon" data-lx="listen" data-t="${esc(t.term)}">${ic('listen')}<span>Listen</span></button>` : ''}<button type="button" class="btn lx-icon" data-lx="saveword" data-id="${esc((t.d ? 'w:' : 'g:') + t.id)}" aria-pressed="${sv}">${ic('save')}<span>${sv ? 'Saved' : 'Save'}</span></button></div></div></article>`; };
  function drawGloss(g) {
    const out = $('#lx-gloss-out'); if (!out) return; g = g || window.MEDLEX_GLOSSARY; if (!g) return;
    $$('[data-lx=gsaved]').forEach(b => b.setAttribute('aria-pressed', String(GS.saved)));
    const list = glossResults(g), q = GS.q.trim();
    if (!list) { out.innerHTML = `<div class="lx-gloss-start"><h2>${g.length.toLocaleString()} clinical terms, one search away.</h2><p>This is a reference, not a reading list. Search by word, meaning or spelling variant, or pick a body system.</p><div class="lx-pills">${D.systems.map(s => `<button type="button" class="lx-chip" data-lx="gsys" data-ch="${s.n}">${esc(sysName(s.n))}</button>`).join('')}</div></div>`; return; }
    const shown = list.slice(0, GS.shown);
    out.innerHTML = `<p class="lx-count" role="status">${list.length} ${list.length === 1 ? 'term' : 'terms'}${q ? ` for “${esc(q)}”` : ''}${GS.ch ? ` in ${esc(sysName(+GS.ch))}` : ''}${GS.saved ? ' you saved' : ''}</p>` + (shown.length ? `<div class="lx-terms">${shown.map(t => termRow(t, q)).join('')}</div>${list.length > shown.length ? `<button type="button" class="btn lx-showmore" data-lx="gmore">Show ${Math.min(30, list.length - shown.length)} more</button>` : ''}` : `<div class="lx-empty"><b>Nothing found.</b><span>${GS.saved ? 'Save a term to see it here.' : 'Check the spelling, or search by what it means.'}</span></div>`);
  }
  function viewGlossary(path, params) {
    const seg = path.split('/'); if (params.get('sys')) GS.ch = params.get('sys'); if (seg[1] === 'term' && seg[2]) { const id = decodeURIComponent(seg.slice(2).join('/')); if (wordById[id]) { location.replace('#library/lab?w=' + id); return; } GS.open = id; GS.q = ''; }
    mount(header('Library', 'A search-first reference for every term in the course.') + nav('glossary') + `<div class="lx-bar"><label class="lx-search">${ic('search')}<span class="sr-only">Search the glossary</span><input type="search" data-lx-input="gsearch" placeholder="Search a term, a meaning or a variant…" value="${esc(GS.q)}" autocomplete="off"></label><div class="lx-pills"><label class="lx-sel"><span class="sr-only">Body system</span><select data-lx-change="gsel" aria-label="Body system"><option value="">All systems</option>${D.systems.map(s => `<option value="${s.n}"${String(GS.ch) === String(s.n) ? ' selected' : ''}>${esc(sysName(s.n))}</option>`).join('')}</select></label><button type="button" class="lx-chip" data-lx="gsaved" aria-pressed="${GS.saved}">Saved (${st.saved.length})</button></div></div><div id="lx-gloss-out" aria-live="polite"><p class="lx-hint">Loading the glossary…</p></div>`);
    loadGlossary().then(g => { if (GS.open && !GS.q.trim() && !GS.ch) { const t = g.find(x => x.id === GS.open); if (t) { GS.q = t.term; const i = $('[data-lx-input=gsearch]'); if (i) i.value = t.term; } } drawGloss(g); if (GS.open) { const el = $('#t-' + CSS.escape(GS.open)); el && el.scrollIntoView({ block: 'center' }); } }).catch(() => { const o = $('#lx-gloss-out'); if (o) o.innerHTML = '<div class="lx-empty"><b>The glossary could not load.</b><span>Check your connection and reload the page.</span></div>'; });
  }
  L.act('gsearch', t => { GS.q = t.value; GS.shown = 30; GS.open = ''; clearTimeout(GS.t); GS.t = setTimeout(() => drawGloss(), 110); });
  L.act('gsel', t => { GS.ch = t.value; GS.shown = 30; drawGloss(); });
  L.act('gsys', b => { GS.ch = b.dataset.ch; GS.shown = 30; const s = $('select', main_()); if (s) s.value = GS.ch; drawGloss(); });
  L.act('gsaved', () => { GS.saved = !GS.saved; GS.shown = 30; drawGloss(); });
  L.act('gmore', () => { GS.shown += 30; drawGloss(); });
  L.act('topen', b => { const id = b.dataset.id, was = GS.open === id; GS.open = was ? '' : id; const r = $('#t-' + CSS.escape(id)); $$('.lx-term.is-open').forEach(x => { x.classList.remove('is-open'); $('.lx-term-h', x).setAttribute('aria-expanded', 'false'); $('.lx-term-b', x).hidden = true; }); if (!was) { r.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); $('.lx-term-b', r).hidden = false; } });
  const main_ = () => L.main();

  L.on('library', (path, params) => {
    const seg = path.split('/'), s = seg[1] || 'lab';
    if ((s === 'parts' || s === 'part') && L.oldParts) return L.oldParts(path, params);
    if (s === 'pronunciation' && L.viewPronunciation) L.viewPronunciation(params);
    else if (s === 'lab' || s === 'pronunciation') viewLab(params);
    else if (s === 'systems' || s === 'atlas') viewSystems();
    else if (s === 'system') viewSystem(seg[2]);
    else if (s === 'glossary' || s === 'terms' || s === 'term') viewGlossary(path, params);
    else { if (s === 'part' && partById[seg[2]]) { PS.q = partById[seg[2]].f; PS.kind = partById[seg[2]].k; } if (L.viewQuests) L.viewQuests((params && params.get && params.get('kind')) || (s === 'part' && partById[seg[2]] ? partById[seg[2]].k : '')); else viewParts(); }
  });
})();
