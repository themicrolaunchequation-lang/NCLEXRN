/* Serein Toolkit: the hub (by moment), ten interactive tools with a live plan, saved plans on this device,
   copy / print / download, and a bottom-sheet style dialog that fits phone and desktop.
   Content lives in toolkit-data.js. The app's router asks SereinToolkit.hub() for the #toolkit view and
   SereinToolkit.open(id) for #toolkit/<id> (small asserted patches in build-web.mjs). */
(function () {
  'use strict';
  const T = window.SEREIN_TOOLKIT; if (!T) return;
  const d = document, $ = (s, r) => (r || d).querySelector(s), $$ = (s, r) => [...(r || d).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const byId = Object.fromEntries(T.tools.map(t => [t.id, t]));
  const KEY = 'serein-toolkit-v1', MAX_PLANS = 40;
  const secLabel = s => s < 60 ? s + ' sec' : s % 60 ? Math.floor(s / 60) + ' min ' + (s % 60) + ' sec' : (s / 60) + ' min';
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || d.documentElement.dataset.hsMotion === 'off' || d.body.classList.contains('reduce-motion');
  const S = () => globalThis.Serein || {};

  /* ---------- icons (stroke, 24px) ---------- */
  const IC = {
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    wind: 'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7a2 2 0 1 1-2 2',
    coffee: 'M4 8h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM17 9h2a2 2 0 0 1 0 4h-2M7 3v2M11 3v2',
    heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
    home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
    moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
    shield: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z',
    users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 2.7-5 6-5s6 2 6 5M17 11a2.5 2.5 0 1 0 0-5M17.5 15c2.2.4 3.5 2 3.5 5',
    clipboard: 'M9 4h6v3H9zM7 5H5v16h14V5h-2M9 12h6M9 16h4',
    sliders: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M8 15v4',
    check: 'M5 12.5l4.5 4.5L19 7', x: 'M6 6l12 12M18 6L6 18', arrow: 'M5 12h14M13 6l6 6-6 6',
    copy: 'M9 9h11v11H9zM5 15V4h11', print: 'M7 8V3h10v5M7 17H4v-7h16v7h-3M7 14h10v7H7z', download: 'M12 3v12M7 10l5 5 5-5M4 20h16',
    bookmark: 'M6 3h12v18l-6-4-6 4z', trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', play: 'M7 4l13 8-13 8z', book: 'M4 19.5V5a2 2 0 0 1 2-2h14v16H6.5A2.5 2.5 0 0 0 4 21.5M4 19.5A2.5 2.5 0 0 1 6.5 17H20',
    img: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M9 9a1 1 0 1 0 0-.01', life: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM5.6 5.6l3.2 3.2M15.2 15.2l3.2 3.2M18.4 5.6l-3.2 3.2M8.8 15.2l-3.2 3.2',
    info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.01', undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3', edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
    layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z'
  };
  const ic = (n, cls) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${cls ? ` class="${cls}"` : ''}><path d="${IC[n] || IC.arrow}"/></svg>`;

  /* ---------- device storage (never throws) ---------- */
  let db = { plans: [], drafts: {} }, storeOK = true;
  (function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw && typeof raw === 'object') {
        db.plans = (Array.isArray(raw.plans) ? raw.plans : []).filter(p => p && byId[p.tool] && p.values && typeof p.values === 'object').slice(-MAX_PLANS).map(p => ({ id: String(p.id), tool: p.tool, title: String(p.title || byId[p.tool].title).slice(0, 120), values: p.values, text: String(p.text || '').slice(0, 12000), date: p.date }));
        if (raw.drafts && typeof raw.drafts === 'object') for (const k of Object.keys(raw.drafts)) if (byId[k] && raw.drafts[k] && typeof raw.drafts[k] === 'object') db.drafts[k] = raw.drafts[k];
      }
    } catch { /* unreadable: start empty and leave the stored value alone */ }
  })();
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); storeOK = true; } catch { storeOK = false; } return storeOK; };
  const uid = () => (globalThis.crypto && crypto.randomUUID ? crypto.randomUUID() : 'p-' + Date.now() + '-' + Math.random().toString(36).slice(2));

  /* ---------- helpers given to each tool's build() ---------- */
  const FREE = ['tide', 'ground', 'desk'];
  const isLocked = id => { try { return !!(window.HCA && HCA.locked && HCA.locked('serein') && !FREE.includes(id)); } catch { return false; } };
  const practices = () => (S().data && S().data.practices) || [];
  function practice(id, sec) {
    const p = practices().find(x => x.id === id); if (!p || isLocked(id)) return null;
    const base = { id: p.id, title: p.title, desc: p.desc, position: p.position, breathFocus: !!p.breathFocus };
    if (p.selfPaced || !p.durations || !p.durations.length) return { ...base, dur: null, label: 'self-paced' };
    const ok = p.durations.filter(n => n <= (sec || 1e9)); if (!ok.length) return null;
    const dur = Math.max(...ok); return { ...base, dur, label: secLabel(dur) };
  }
  const X = { practice };
  const defaults = tool => { const v = {}; for (const f of tool.fields) v[f.id] = f.type === 'check' ? (f.def || []).slice() : f.type === 'levels' ? {} : f.type === 'text' ? '' : (f.def == null ? '' : f.def); return v; };
  const validValues = (tool, raw) => {
    const v = defaults(tool); if (!raw || typeof raw !== 'object') return v;
    for (const f of tool.fields) {
      const r = raw[f.id]; if (r == null) continue;
      if (f.type === 'check' && Array.isArray(r)) v[f.id] = r.filter(x => f.options.some(o => o[0] === x));
      else if (f.type === 'radio' && f.options.some(o => o[0] === r)) v[f.id] = r;
      else if (f.type === 'text' && typeof r === 'string') v[f.id] = r.slice(0, 400);
      else if (f.type === 'time' && /^\d{1,2}:\d{2}$/.test(r)) v[f.id] = r;
      else if (f.type === 'levels' && typeof r === 'object') { for (const [k, l] of f.areas) if (f.levels.some(x => x[0] === r[k])) v[f.id][k] = r[k]; }
    }
    return v;
  };
  const model = (tool, v) => { try { return tool.build(v, X); } catch (e) { console.error(e); return { lead: 'This plan could not be built.', blocks: [] }; } };
  const refs = () => (S().content && S().content.references) || {};
  const resTitle = id => { const r = ((S().data && S().data.resources) || []).find(x => x.id === id); return r ? r.title : id; };
  const atlasTitle = id => { const r = (S().infographicCards || []).find(x => x.id === id); return r ? r.title : id; };

  /* ---------- the plan: preview HTML, plain text, print ---------- */
  const action = (a, print) => {
    if (!a || print) return '';
    if (a.open) return `<button type="button" class="tk-try" data-tk="open" data-id="${esc(a.open)}">${esc(a.t || byId[a.open].title)} ${ic('arrow')}</button>`;
    if (a.guide) return `<button type="button" class="tk-try" data-resource="${esc(a.guide)}">${esc(a.t)} ${ic('arrow')}</button>`;
    if (a.id && (a.dur !== undefined)) return `<button type="button" class="tk-try" data-practice="${esc(a.id)}"${a.dur ? ` data-duration="${a.dur}"` : ''}>${ic('play')}<span>Try ${esc(a.title)} · ${esc(a.dur ? a.label : 'your pace')}</span></button>`;
    return '';
  };
  function glanceHTML(g) {
    if (!g) return '';
    if (g.type === 'flow') return `<ol class="tk-flow">${g.items.map(([l, s]) => `<li><b>${esc(l)}</b><small>${esc(s)}</small></li>`).join('')}</ol>`;
    if (g.type === 'tiles') return `<dl class="tk-tiles">${g.items.map(([l, s]) => `<div><dt>${esc(l)}</dt><dd>${esc(s)}</dd></div>`).join('')}</dl>`;
    if (g.type === 'cols') return `<div class="tk-cols">${g.items.map(([l, s]) => `<div><b>${esc(l)}</b><span>${esc(s)}</span></div>`).join('')}</div>`;
    if (g.type === 'letters') return `<ol class="tk-letters">${g.items.map(([k, l, on]) => `<li class="${on ? 'on' : ''}"><b aria-hidden="true">${esc(k)}</b><span>${esc(l)}</span></li>`).join('')}</ol>`;
    if (g.type === 'timeline') return `<ol class="tk-tl">${g.items.map(([t, l]) => `<li><time>${esc(t)}</time><span>${esc(l)}</span></li>`).join('')}</ol>`;
    if (g.type === 'levels') return `<ul class="tk-levels">${g.items.map(([l, v]) => `<li><span>${esc(l)}</span><b class="tk-pill${v ? ' is-' + v : ''}">${v === 'ok' ? '● Going well' : v === 'mixed' ? '◐ Mixed' : v === 'heavy' ? '▲ Heavy' : '○ Not rated'}</b></li>`).join('')}</ul>`;
    if (g.type === 'track') {
      const pc = n => (Math.max(0, Math.min(100, n / g.total * 100))).toFixed(2) + '%';
      return `<div class="tk-track" aria-hidden="true"><div class="tk-track-bar">${g.marks.map(m => `<i class="${m.k}" style="left:${pc(m.at)};width:${m.k === 'main' ? pc(m.len) : '10px'}"></i>`).join('')}</div><div class="tk-track-ends"><span>${esc(g.ends[0])}</span><span>${esc(g.ends[1])}</span></div><p><i class="main"></i> Main break <i class="pause"></i> Small pause</p></div>`;
    }
    return '';
  }
  function itemsHTML(b, print) {
    const own = print ? b.items.filter(i => i.t) : b.items;
    if (b.type === 'steps') return `<ol class="tk-steps">${own.map(i => `<li${i.t ? '' : ' class="is-empty"'}><div class="tk-step-h"><b>${esc(i.h || '')}</b>${i.time ? `<span class="tk-time">${esc(i.time)}</span>` : ''}</div>${i.t ? `<p>${esc(i.t)}</p>` : `<p class="tk-ph">${esc(i.ph || '')}</p>`}${action(i.action, print)}</li>`).join('')}</ol>`;
    if (b.type === 'bullets') return `<ul class="tk-bullets">${own.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    if (b.type === 'script') return own.map(i => i.t ? `<blockquote class="tk-script"><p>${esc(i.t)}</p></blockquote>` : (i.ph ? `<p class="tk-ph">${esc(i.ph)}</p>` : '')).join('');
    if (b.type === 'checks') return `<ul class="tk-checks">${b.items.map(i => `<li class="${i.on ? 'on' : ''}"><span class="tk-box" aria-hidden="true">${i.on ? ic('check') : ''}</span><span><span class="sr-only">${i.on ? 'Ticked: ' : 'Not ticked: '}</span>${esc(i.t)}</span></li>`).join('')}</ul>`;
    if (b.type === 'alts') return `<ul class="tk-alts">${b.items.map(i => `<li><span>${esc(i.t)}</span>${action(i.action || (i.open ? { open: i.open, t: 'Open' } : i.guide ? { guide: i.guide, t: 'Read' } : null), print)}</li>`).join('')}</ul>`;
    return '';
  }
  function blockHTML(b, print) {
    if (!b) return '';
    const h = b.h ? `<h4>${esc(b.h)}</h4>` : '';
    if (b.type === 'p') return `<p class="tk-p">${esc(b.t)}</p>`;
    if (b.type === 'callout') return `<div class="tk-callout is-${b.tone || 'note'}" role="note">${ic(b.tone === 'care' ? 'heart' : b.tone === 'safe' ? 'shield' : 'info')}<p>${esc(b.t)}</p></div>`;
    if (b.type === 'feature') return `<section class="tk-block tk-feature">${h}<div class="tk-feature-in"><div><b>${esc(b.title)}</b><small>${esc(b.meta)}</small><p>${esc(b.t)}</p></div>${action(b.action, print)}</div></section>`;
    return `<section class="tk-block">${h}${itemsHTML(b, print)}</section>`;
  }
  function planBody(tool, v, print) {
    const m = model(tool, v);
    return `<header class="tk-plan-h"><p class="tk-eyebrow">${print ? 'My plan' : 'Your plan · updates as you choose'}</p><h3>${esc(tool.title)}</h3>${m.lead ? `<p class="tk-lead">${esc(m.lead)}</p>` : ''}</header>${glanceHTML(m.glance)}${(m.blocks || []).map(b => blockHTML(b, print)).join('')}<p class="tk-note">${esc(tool.note)}</p>`;
  }
  function planText(tool, v, date) {
    const m = model(tool, v), L = [tool.title.toUpperCase(), 'Made with Serein · ' + (date || new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), ''];
    if (m.lead) L.push(m.lead, '');
    for (const b of m.blocks || []) {
      if (!b) continue;
      if (b.h) L.push(b.h.toUpperCase());
      if (b.type === 'p' || b.type === 'callout') L.push(b.t);
      else if (b.type === 'feature') L.push(b.title + ' · ' + b.meta, b.t);
      else if (b.type === 'steps') b.items.filter(i => i.t).forEach((i, n) => L.push(`${n + 1}. ${i.h}${i.time ? ' (' + i.time + ')' : ''}: ${i.t}`));
      else if (b.type === 'bullets') b.items.forEach(i => L.push('- ' + i));
      else if (b.type === 'script') b.items.filter(i => i.t).forEach(i => L.push('“' + i.t + '”'));
      else if (b.type === 'checks') b.items.forEach(i => L.push((i.on ? '[x] ' : '[ ] ') + i.t));
      else if (b.type === 'alts') b.items.forEach(i => L.push('- ' + i.t));
      L.push('');
    }
    L.push(tool.note, '', 'A self-care prompt, not therapy or medical advice. Keep patient details out of notes. Stored only on your device.');
    return L.join('\n');
  }
  function printPlan(tool, v, date) {
    let host = $('#tk-print'); if (!host) { host = d.createElement('div'); host.id = 'tk-print'; host.setAttribute('aria-hidden', 'true'); d.body.appendChild(host); }
    host.innerHTML = `<article class="tk-print-doc">${planBody(tool, v, true)}<p class="tk-print-foot">Made with Serein, Healthcare Crown Academy · ${esc((date || new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))}. A self-care prompt, not therapy or medical advice. Support is always available: in the UK call 999 in an emergency or NHS 111 for urgent help, Samaritans 116 123, or text FRONTLINE to 85258.</p></article>`;
    const clear = () => { host.innerHTML = ''; removeEventListener('afterprint', clear); };
    addEventListener('afterprint', clear); setTimeout(() => window.print(), 50);
  }
  const download = (name, text) => { try { const a = d.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); a.download = name; d.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); return true; } catch { return false; } };
  const copy = async text => { try { await navigator.clipboard.writeText(text); return true; } catch { const t = d.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;left:-9999px;top:0'; d.body.appendChild(t); t.select(); let ok = false; try { ok = d.execCommand('copy'); } catch { } t.remove(); return ok; } };

  /* ======================================================================
     HUB
     ====================================================================== */
  let H = { ctx: null, undo: null };
  const guidedNames = { boundary: 'Say no kindly', support: 'Ask for help', transition: 'Leave work at work', difficult: 'After a hard moment', team: 'Run a team pause', conditions: 'Fix a work barrier' };
  const guidedGroup = { difficult: 'hard', transition: 'after', boundary: 'talk', support: 'talk', team: 'talk', conditions: 'talk' };
  const MOMENT_GROUP = ['before', 'between', 'hard', 'after'];
  const dateLabel = iso => { const t = new Date(iso); return isNaN(t) ? '' : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); };

  function toolCard(t, wide) {
    const g = wide ? glanceHTML(model(t, validValues(t, null)).glance) : '';
    return `<article class="tk-card${wide ? ' is-wide' : ''}" data-tool="${esc(t.id)}"><div class="tk-card-main"><div class="tk-card-top"><span class="tk-tile">${ic(t.icon)}</span><span class="tk-chip">${esc(t.tag)}</span><span class="tk-mins">${esc(t.mins)}</span></div><h3>${esc(t.title)}</h3><p>${esc(t.blurb)}</p><p class="tk-when"><b>Best when:</b> ${esc(t.when)}</p><ul class="tk-mini" aria-label="Steps in this tool">${t.flow.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>${wide ? `<div class="tk-card-glance" aria-hidden="true">${g}</div>` : ''}<button type="button" class="tk-open" data-tk="open" data-id="${esc(t.id)}"><span>Open ${esc(t.title.toLowerCase())}</span>${ic('arrow')}</button></article>`;
  }
  function studioCard(s) {
    return `<article class="tk-card is-guided" data-guided="${esc(s.id)}"><div class="tk-card-main"><div class="tk-card-top"><span class="tk-tile is-soft">${ic('layers')}</span><span class="tk-chip is-soft">Guided · ${s.steps.length} steps</span></div><h3>${esc(guidedNames[s.id] || s.title)}</h3><p>${esc(s.description)}</p><p class="tk-when"><b>Best when:</b> ${esc(s.when)}</p></div><div class="tk-card-actions"><button type="button" class="tk-open" data-adv="studio" data-id="${esc(s.id)}"><span>Enter ${esc((guidedNames[s.id] || s.title).toLowerCase())}</span>${ic('arrow')}</button><button type="button" class="tk-link" data-context-open="studio:${esc(s.id)}" aria-haspopup="dialog" aria-controls="serein-context-panel" aria-expanded="false">How it works</button></div></article>`;
  }
  function savedHTML() {
    const plans = db.plans.slice().reverse(), legacy = (H.ctx && H.ctx.store && H.ctx.store().savedPlans) || [];
    const row = p => { const t = byId[p.tool]; return `<li class="tk-saved-row" data-plan="${esc(p.id)}"><span class="tk-tile is-soft">${ic(t.icon)}</span><div class="tk-saved-t"><b>${esc(p.title)}</b><small>Saved ${esc(dateLabel(p.date))} · ${esc(t.mins)} tool</small></div><div class="tk-saved-a"><button type="button" class="tk-btn" data-tk="plan-open" data-id="${esc(p.id)}">${ic('edit')}<span>Open</span></button><button type="button" class="tk-btn is-icon" data-tk="plan-print" data-id="${esc(p.id)}" aria-label="Print ${esc(p.title)}" title="Print">${ic('print')}</button><button type="button" class="tk-btn is-icon" data-tk="plan-copy" data-id="${esc(p.id)}" aria-label="Copy ${esc(p.title)}" title="Copy">${ic('copy')}</button><button type="button" class="tk-btn is-icon is-danger" data-tk="del" data-id="${esc(p.id)}" aria-label="Delete ${esc(p.title)}" title="Delete">${ic('trash')}</button></div></li>`; };
    const old = p => { const s = (H.ctx.A.studios || []).find(x => x.id === p.studio); return `<li class="tk-saved-row is-old"><details><summary><span class="tk-tile is-soft">${ic('layers')}</span><span class="tk-saved-t"><b>${esc((guidedNames[p.studio] || (s && s.title) || 'Plan'))}</b><small>Saved ${esc(dateLabel(p.date))} · guided studio</small></span></summary><pre>${esc(p.text)}</pre><button type="button" class="tk-btn is-danger" data-adv="delete-plan" data-id="${esc(p.id)}">${ic('trash')}<span>Delete this plan</span></button></details></li>`; };
    const n = plans.length + legacy.length;
    let list = '';
    if (n) { const all = [...plans.map(row), ...legacy.slice().reverse().map(old)]; list = `<ul class="tk-saved-list">${all.slice(0, 4).join('')}</ul>${all.length > 4 ? `<details class="tk-more"><summary>Show ${all.length - 4} more</summary><ul class="tk-saved-list">${all.slice(4).join('')}</ul></details>` : ''}`; }
    else list = `<p class="tk-empty">${ic('bookmark')}<span>Nothing saved yet. Build any tool below and choose <b>Save to this device</b>. Your plan will wait for you here.</span></p>`;
    return `<div class="tk-saved-h"><div><p class="tk-eyebrow">Plans you chose to keep</p><h2>Your saved plans</h2></div><p class="tk-saved-note">Stored in this browser only, not encrypted, and never sent anywhere. Keep patient details out.${storeOK ? '' : ' Saving is not available in this browser right now.'}</p></div>${list}<p class="tk-live" id="tk-live" role="status"></p>`;
  }
  function refreshSaved() { const el = $('#tk-saved'); if (el) el.innerHTML = savedHTML(); }

  function hub(ctx) {
    H.ctx = ctx; const st = ctx.state, mIdx = typeof st.moment === 'number' ? st.moment : 1, gid = MOMENT_GROUP[mIdx] || 'between';
    const moments = ctx.D.moments, sug = T.tools.find(t => t.group === gid && t.star) || T.tools[0];
    const studios = ctx.A.studios || [];
    const counts = g => T.tools.filter(t => t.group === g.id).length + studios.filter(s => guidedGroup[s.id] === g.id).length;
    const groupsHTML = T.groups.map(g => {
      const ts = T.tools.filter(t => t.group === g.id), ss = studios.filter(s => guidedGroup[s.id] === g.id), wide = ts.length === 1 && !ss.length;
      return `<section class="tk-group${g.id === gid ? ' is-now' : ''}" id="tk-g-${g.id}" aria-labelledby="tk-h-${g.id}"><header class="tk-gh"><div><p class="tk-eyebrow">${esc(g.eyebrow)}${g.id === gid ? ' <span class="tk-now">Suggested now</span>' : ''}</p><h2 id="tk-h-${g.id}" tabindex="-1">${esc(g.title)}</h2><p>${esc(g.lead)}</p></div></header><div class="tk-grid${ts.length + ss.length === 1 ? ' is-one' : ''}">${ts.map(t => toolCard(t, wide)).join('')}${ss.map(studioCard).join('')}</div></section>`;
    }).join('');
    return `<div class="tk">
<header class="tk-hero"><div class="tk-hero-copy"><p class="tk-eyebrow">Your toolkit</p><h1>Small tools for real shifts.</h1><p class="tk-hero-lead">Pick the moment you are in. Each tool takes a few minutes, builds something you can use today, and stays on this device. Short, practical and non-clinical.</p></div><aside class="tk-help" aria-label="Support"><span class="tk-tile is-gold">${ic('life')}</span><div><p class="tk-eyebrow">Support is one tap away</p><p>If today is heavy, you do not have to carry it alone.</p></div><button type="button" class="tk-btn is-fill" data-v5="help"><span>Get help now</span></button></aside></header>
<div class="tk-now-band"><div class="tk-now-pick"><p class="tk-eyebrow">For this moment</p><div class="hs-seg" role="group" aria-label="Your working moment">${moments.map((m, i) => `<button type="button" data-moment="${i}" aria-pressed="${i === mIdx}">${esc(m.title.replace(/^After a difficult moment$/, 'After a hard moment'))}</button>`).join('')}</div></div><div class="tk-now-card"><span class="tk-tile">${ic(sug.icon)}</span><div><p class="tk-eyebrow">Suggested</p><b>${esc(sug.title)}</b><small>${esc(sug.mins)} · ${esc(sug.blurb)}</small></div><button type="button" class="tk-btn is-fill" data-tk="open" data-id="${esc(sug.id)}"><span>Open</span>${ic('arrow')}</button></div></div>
<nav class="tk-jump" aria-label="Jump to a moment"><span class="tk-jump-l">Jump to</span>${T.groups.map(g => `<button type="button" data-tk="jump" data-id="${g.id}">${esc(g.title)} <small>${counts(g)}</small></button>`).join('')}<button type="button" data-tk="jump" data-id="saved">Saved plans <small>${db.plans.length + ((ctx.store && ctx.store().savedPlans) || []).length}</small></button></nav>
<section class="tk-saved" id="tk-saved" aria-labelledby="tk-saved-h">${savedHTML().replace('<h2>', '<h2 id="tk-saved-h" tabindex="-1">')}</section>
${groupsHTML}
<section class="tk-deeper" aria-labelledby="tk-deeper-h"><div><p class="tk-eyebrow">Go deeper</p><h2 id="tk-deeper-h">Read, look and practise</h2></div><div class="tk-deeper-grid"><button type="button" data-nav="infographics"><span class="tk-tile is-soft">${ic('img')}</span><span><b>The Visual Atlas</b><small>12 illustrated guides, with sources</small></span>${ic('arrow')}</button><button type="button" data-nav="library/guides"><span class="tk-tile is-soft">${ic('book')}</span><span><b>Guides for real working days</b><small>Boundaries, support, rest and more</small></span>${ic('arrow')}</button><button type="button" data-nav="library/practices"><span class="tk-tile is-soft">${ic('wind')}</span><span><b>Practices</b><small>One to five minutes, at your own pace</small></span>${ic('arrow')}</button></div></section>
<p class="tk-fine">Serein’s tools are original educational self-care prompts. They are not therapy, diagnosis or medical advice, and they do not replace handover, workplace processes or clinical support. Nothing is monitored or sent anywhere.</p></div>`;
  }

  /* ======================================================================
     SHEET (the interactive tool)
     ====================================================================== */
  let sheet = null, cur = null, hist = null, afterClose = null, lastFocus = null, draftT = 0;

  const fieldHTML = (tool, f, v) => {
    const name = 'tkf-' + f.id;
    if (f.type === 'radio') return `<fieldset class="tk-f"><legend>${esc(f.label)}</legend><div class="tk-opts">${f.options.map(o => `<label class="tk-opt"><input type="radio" name="${name}" value="${esc(o[0])}" data-f="${f.id}"${v[f.id] === o[0] ? ' checked' : ''}><span><b>${esc(o[1])}</b>${o[2] ? `<small>${esc(o[2])}</small>` : ''}</span></label>`).join('')}</div></fieldset>`;
    if (f.type === 'check') { const n = (v[f.id] || []).length; return `<fieldset class="tk-f"><legend>${esc(f.label)}</legend><div class="tk-opts">${f.options.map(o => { const on = (v[f.id] || []).includes(o[0]); return `<label class="tk-opt"><input type="checkbox" name="${name}" value="${esc(o[0])}" data-f="${f.id}"${on ? ' checked' : ''}${f.max && n >= f.max && !on ? ' disabled' : ''}><span><b>${esc(o[1])}</b></span></label>`; }).join('')}</div>${f.max ? `<p class="tk-help-t">Choose up to ${f.max}.</p>` : ''}</fieldset>`; }
    if (f.type === 'levels') return `<fieldset class="tk-f"><legend>${esc(f.label)}</legend><p class="tk-help-t">No right answers and no score.</p><div class="tk-lv">${f.areas.map(([k, l, h]) => `<div class="tk-lv-row" role="radiogroup" aria-label="${esc(l)}"><div class="tk-lv-l"><b>${esc(l)}</b><small>${esc(h)}</small></div><div class="tk-lv-o">${f.levels.map(([lk, ll]) => `<label class="tk-seg is-${lk}"><input type="radio" name="${name}-${k}" value="${lk}" data-f="${f.id}" data-a="${k}"${(v[f.id] || {})[k] === lk ? ' checked' : ''}><span>${esc(ll)}</span></label>`).join('')}</div></div>`).join('')}</div></fieldset>`;
    if (f.type === 'time') return `<div class="tk-f"><label for="${name}">${esc(f.label)}</label><input type="time" id="${name}" data-f="${f.id}" value="${esc(v[f.id] || '')}"></div>`;
    const fills = f.fillsFor ? f.fillsFor(v) : f.fills;
    return `<div class="tk-f"><label for="${name}">${esc(f.label)}</label><textarea id="${name}" data-f="${f.id}" rows="${f.rows || 2}" maxlength="400" placeholder="${esc(f.ph || '')}">${esc(v[f.id] || '')}</textarea>${fills && fills.length ? `<div class="tk-fills" role="group" aria-label="Ideas for: ${esc(f.label)}"><span>Ideas</span>${fills.map(x => `<button type="button" data-tk="fill" data-f="${f.id}" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>` : ''}</div>`;
  };
  function relatedHTML(tool) {
    const prs = (tool.practices || []).map(([id, sec]) => practice(id, sec)).filter(Boolean);
    const out = [];
    prs.forEach(p => out.push(`<button type="button" class="tk-rel" data-practice="${esc(p.id)}"${p.dur ? ` data-duration="${p.dur}"` : ''}>${ic('play')}<span><b>${esc(p.title)}</b><small>Practice · ${esc(p.dur ? p.label : 'your own pace')}</small></span></button>`));
    (tool.guides || []).forEach(id => out.push(`<button type="button" class="tk-rel" data-resource="${esc(id)}">${ic('book')}<span><b>${esc(resTitle(id))}</b><small>Guide</small></span></button>`));
    (tool.atlas || []).forEach(id => out.push(`<button type="button" class="tk-rel" data-tk="go" data-path="infographics/${esc(id)}">${ic('img')}<span><b>${esc(atlasTitle(id))}</b><small>Illustrated guide</small></span></button>`));
    if (tool.studio) { const s = (H.ctx && H.ctx.A.studios || []).find(x => x.id === tool.studio); if (s) out.push(`<button type="button" class="tk-rel" data-adv="studio" data-id="${esc(s.id)}">${ic('layers')}<span><b>${esc(guidedNames[s.id] || s.title)}</b><small>Guided studio, step by step</small></span></button>`); }
    (tool.open || []).forEach(id => out.push(`<button type="button" class="tk-rel" data-tk="open" data-id="${esc(id)}">${ic('clipboard')}<span><b>${esc(byId[id].title)}</b><small>Another tool</small></span></button>`));
    return out.length ? `<section class="tk-related" aria-labelledby="tk-rel-h"><h3 id="tk-rel-h">Go with it</h3><div class="tk-rel-grid">${out.join('')}</div></section>` : '';
  }
  function aboutHTML(tool) {
    const R = refs(), links = (tool.refs || []).map(k => R[k]).filter(Boolean);
    return `<details class="tk-about"><summary>Why this works, and sources</summary><p>${esc(tool.why)}</p>${links.length ? `<ul class="tk-refs">${links.map(r => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)} <span aria-hidden="true">↗</span><span class="sr-only">(opens in a new tab)</span></a></li>`).join('')}</ul>` : ''}<p class="tk-fine">An original educational tool. It has not been clinically validated, and the sources above give background rather than proof that it works for any one person.</p></details>`;
  }
  function formHTML(tool, v) {
    return `<div class="tk-intro"><p>${esc(tool.blurb)}</p><p class="tk-when"><b>Best when:</b> ${esc(tool.when)}</p></div>${tool.fields.map(f => fieldHTML(tool, f, v)).join('')}<div class="tk-form-end"><button type="button" class="tk-btn" data-tk="pane" data-pane="plan">See my plan ${ic('arrow')}</button><button type="button" class="tk-link" data-tk="restart">Start again</button></div>${relatedHTML(tool)}${aboutHTML(tool)}`;
  }
  function ensureSheet() {
    if (sheet) return;
    sheet = d.createElement('dialog'); sheet.className = 'tk-sheet'; sheet.setAttribute('aria-labelledby', 'tk-title');
    sheet.innerHTML = `<div class="tk-sh">
<header class="tk-sh-head"><div class="tk-sh-t"><p class="tk-eyebrow" id="tk-sh-eye"></p><h2 id="tk-title" tabindex="-1"></h2></div><div class="tk-sh-hb"><button type="button" class="tk-btn is-help" data-v5="help"><span>Get help</span></button><button type="button" class="tk-x" data-tk="close" aria-label="Close this tool">${ic('x')}<span>Close</span></button></div></header>
<div class="tk-pane-toggle" role="group" aria-label="Show"><button type="button" data-tk="pane" data-pane="build" aria-pressed="true">Build</button><button type="button" data-tk="pane" data-pane="plan" aria-pressed="false">Your plan</button></div>
<div class="tk-sh-body"><section class="tk-form" id="tk-form" aria-label="Build your plan"></section><section class="tk-plan" aria-label="Your plan"><div class="tk-plan-card" id="tk-plan" aria-live="polite" aria-atomic="false"></div></section></div>
<footer class="tk-sh-foot"><p class="tk-status" id="tk-status" role="status"></p><div class="tk-foot-a"><button type="button" class="tk-btn is-fill" data-tk="save" id="tk-save">${ic('bookmark')}<span>Save to this device</span></button><button type="button" class="tk-btn" data-tk="copy">${ic('copy')}<span>Copy</span></button><button type="button" class="tk-btn" data-tk="print">${ic('print')}<span>Print</span></button><button type="button" class="tk-btn" data-tk="download">${ic('download')}<span>.txt</span></button></div><p class="tk-foot-n">Saved on this device only, not encrypted. Keep patient details out. Not therapy or medical advice.</p></footer></div>`;
    d.body.appendChild(sheet);
    sheet.addEventListener('close', onClosed);
    sheet.addEventListener('click', e => { if (e.target === sheet) doClose(); });
    sheet.addEventListener('input', onField); sheet.addEventListener('change', onField);
  }
  const status = msg => { const s = $('#tk-status'); if (s) s.textContent = msg; };
  function renderPlan() { const el = $('#tk-plan'); if (el && cur) el.innerHTML = planBody(cur.tool, cur.values, false) + `<div class="tk-support"><div><b>Support is one tap away</b><span>You do not have to carry a hard day alone.</span></div><button type="button" class="tk-btn is-fill" data-v5="help"><span>Get help now</span></button></div>`; }
  function renderForm(keepFocus) {
    const form = $('#tk-form'); if (!form || !cur) return;
    let fk = null; if (keepFocus && d.activeElement && form.contains(d.activeElement)) { const a = d.activeElement; fk = { id: a.id, name: a.name, value: a.value, tag: a.tagName }; }
    const sc = $('.tk-form', sheet).scrollTop; form.innerHTML = formHTML(cur.tool, cur.values); form.scrollTop = sc;
    if (fk) { const el = fk.id ? d.getElementById(fk.id) : $$(`[name="${fk.name}"]`, form).find(x => x.value === fk.value); el && el.focus({ preventScroll: true }); }
  }
  function setPane(p) { if (!sheet) return; sheet.dataset.pane = p; $$('.tk-pane-toggle button', sheet).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pane === p))); const t = p === 'plan' ? $('.tk-plan', sheet) : $('.tk-form', sheet); t && (t.scrollTop = 0); }
  function updateSaveBtn() { const b = $('#tk-save'); if (!b || !cur) return; const s = $('span', b); s.textContent = cur.savedId ? 'Update saved plan' : 'Save to this device'; }
  function draftSoon() { clearTimeout(draftT); draftT = setTimeout(draftNow, 350); }
  function draftNow() { clearTimeout(draftT); if (!cur) return; db.drafts[cur.tool.id] = cur.values; persist(); }

  function onField(e) {
    const el = e.target; if (!cur || !el.dataset || !el.dataset.f) return;
    const id = el.dataset.f, f = cur.tool.fields.find(x => x.id === id); if (!f) return;
    if (f.type === 'radio') cur.values[id] = el.value;
    else if (f.type === 'check') { cur.values[id] = $$(`input[data-f="${id}"]:checked`, sheet).map(x => x.value); if (f.max) { const n = cur.values[id].length; $$(`input[data-f="${id}"]`, sheet).forEach(x => { x.disabled = !x.checked && n >= f.max; }); } }
    else if (f.type === 'levels') { const o = {}; $$(`input[data-f="${id}"]:checked`, sheet).forEach(x => { o[x.dataset.a] = x.value; }); cur.values[id] = o; }
    else cur.values[id] = el.value;
    renderPlan(); draftSoon(); if (cur.savedId) status('Changed since you last saved.');
    if ((cur.tool.dynamic || []).includes(id) && e.type === 'change') renderForm(true);
  }

  function open(id, opts) {
    const tool = byId[id]; if (!tool) return false; opts = opts || {};
    ensureSheet();
    const wasOpen = sheet.open;
    if (!wasOpen) lastFocus = d.activeElement;
    cur = { tool, values: opts.plan ? validValues(tool, opts.plan.values) : validValues(tool, db.drafts[id]), savedId: opts.plan ? opts.plan.id : null };
    $('#tk-sh-eye').textContent = `${tool.tag} · ${tool.mins}`; $('#tk-title').textContent = tool.title;
    renderForm(false); renderPlan(); updateSaveBtn(); status(''); setPane('build');
    if (!wasOpen) {
      if (matchMedia('(max-width:760px)').matches) d.documentElement.classList.add('tk-lock');
      sheet.showModal();
      if (opts.fromRoute) hist = 'route'; else if (location.hash !== '#toolkit/' + id) { try { history.pushState({ tk: id }, '', '#toolkit/' + id); hist = 'push'; } catch { hist = null; } } else hist = 'route';
    }
    sheet.scrollTop = 0; $('.tk-form', sheet).scrollTop = 0;
    const h = $('#tk-title'); h && h.focus({ preventScroll: true });
    return true;
  }
  function doClose(then) { afterClose = then || null; if (sheet && sheet.open) sheet.close(); else if (then) then(); }
  function onClosed() {
    draftNow(); d.documentElement.classList.remove('tk-lock');
    const after = afterClose; afterClose = null; cur = null;
    if (lastFocus && lastFocus.isConnected && !after) { try { lastFocus.focus({ preventScroll: true }); } catch { } }
    if (hist === 'push') { hist = null; if (after) addEventListener('popstate', () => setTimeout(after, 0), { once: true }); history.back(); return; }
    if (hist === 'route') { hist = null; if (location.hash.startsWith('#toolkit/')) { try { history.replaceState(null, '', '#toolkit'); } catch { } } }
    if (after) after();
  }
  addEventListener('popstate', () => { if (sheet && sheet.open && cur && !location.hash.startsWith('#toolkit/' + cur.tool.id)) { hist = null; doClose(); } });

  function savePlan() {
    if (!cur) return; const { tool, values } = cur;
    draftNow();
    const plan = { id: cur.savedId || uid(), tool: tool.id, title: tool.title, values: JSON.parse(JSON.stringify(values)), text: planText(tool, values), date: new Date().toISOString() };
    const i = db.plans.findIndex(p => p.id === plan.id); if (i >= 0) db.plans[i] = plan; else db.plans.push(plan);
    if (db.plans.length > MAX_PLANS) db.plans = db.plans.slice(-MAX_PLANS);
    const ok = persist(); cur.savedId = plan.id; updateSaveBtn(); refreshSaved();
    status(ok ? 'Saved on this device. Open it any time from the Toolkit.' : 'This browser would not let Serein save. Use Copy or Download to keep it.');
  }
  const planById = id => db.plans.find(p => p.id === id);
  function live(msg, undo) {
    const el = $('#tk-live'); if (!el) return; clearTimeout(live.t);
    el.innerHTML = `${esc(msg)}${undo ? ` <button type="button" class="tk-link" data-tk="undo">Undo</button>` : ''}`;
    live.t = setTimeout(() => { el.textContent = ''; H.undo = null; }, 8000);
  }

  /* ---------- clicks ---------- */
  d.addEventListener('click', async e => {
    const b = e.target.closest && e.target.closest('[data-tk]'); if (!b) return;
    const a = b.dataset.tk, id = b.dataset.id;
    if (a === 'open') {
      const sr = $('#search-dialog'); if (sr && sr.open) sr.close();
      if (sheet && sheet.open) doClose(() => open(id)); else open(id); return;
    }
    if (a === 'close') { doClose(); return; }
    if (a === 'pane') { setPane(b.dataset.pane); return; }
    if (a === 'jump') { const t = id === 'saved' ? $('#tk-saved') : $('#tk-g-' + id); if (t) { t.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); const h = $('h2', t); h && h.focus({ preventScroll: true }); } return; }
    if (a === 'go') { const p = b.dataset.path, go = () => { const r = S().router; r && r.go ? r.go(p) : (location.hash = '#' + p); }; if (sheet && sheet.open) doClose(go); else go(); return; }
    if (a === 'fill') {
      const ta = $(`#tkf-${b.dataset.f}`, sheet); if (!ta || !cur) return;
      const v = b.dataset.v, cu = ta.value.trim();
      ta.value = cu && !cu.toLowerCase().includes(v.toLowerCase()) ? cu.replace(/[.;\s]+$/, '') + '; ' + v : cu ? cu : v;
      cur.values[b.dataset.f] = ta.value; renderPlan(); draftSoon(); ta.focus({ preventScroll: true }); return;
    }
    if (a === 'restart') { if (!cur) return; cur.values = defaults(cur.tool); cur.savedId = null; delete db.drafts[cur.tool.id]; persist(); renderForm(false); renderPlan(); updateSaveBtn(); status('Started again. Your saved plans are untouched.'); return; }
    if (a === 'save') { savePlan(); return; }
    if (a === 'copy') { if (!cur) return; status((await copy(planText(cur.tool, cur.values))) ? 'Copied. Nothing was sent anywhere.' : 'Could not copy. Select the plan and copy it with your device controls.'); return; }
    if (a === 'download') { if (!cur) return; status(download(`Serein-${cur.tool.id}-plan.txt`, planText(cur.tool, cur.values)) ? 'Downloaded as a text file.' : 'Could not download in this browser. Use Copy instead.'); return; }
    if (a === 'print') { if (cur) printPlan(cur.tool, cur.values); return; }
    if (a === 'plan-open') { const p = planById(id); if (p) open(p.tool, { plan: p }); return; }
    if (a === 'plan-print') { const p = planById(id); if (p) printPlan(byId[p.tool], validValues(byId[p.tool], p.values), new Date(p.date)); return; }
    if (a === 'plan-copy') { const p = planById(id); if (p) live((await copy(p.text)) ? 'Copied. Nothing was sent anywhere.' : 'Could not copy in this browser.'); return; }
    if (a === 'del') { const i = db.plans.findIndex(p => p.id === id); if (i < 0) return; const p = db.plans[i]; db.plans.splice(i, 1); persist(); H.undo = { p, i }; refreshSaved(); live(`Deleted “${p.title}”.`, true); return; }
    if (a === 'undo') { if (!H.undo) return; db.plans.splice(Math.min(H.undo.i, db.plans.length), 0, H.undo.p); H.undo = null; persist(); refreshSaved(); live('Restored.'); return; }
  });

  /* search results: tools appear next to studios and journeys */
  function search(q) {
    q = String(q || '').trim().toLowerCase(); if (!q) return '';
    const hit = T.tools.filter(t => (t.title + ' ' + t.blurb + ' ' + t.tag + ' ' + t.flow.join(' ')).toLowerCase().includes(q));
    return hit.map(t => `<button type="button" class="search-result" data-tk="open" data-id="${esc(t.id)}">${ic(t.icon)}<span><strong>${esc(t.title)}</strong><small>Toolkit · ${esc(t.mins)}</small></span><span>↗</span></button>`).join('');
  }

  /* the app can render the first view before this file has run: draw #toolkit again once the router is ready */
  (function boot(n) {
    if (!/^#\/?toolkit/.test(location.hash) || n > 60) return;
    const r = S().router;
    if (!r || !r.go || !window.SereinToolkit || !(S().data)) { setTimeout(() => boot(n + 1), 50); return; }
    if (!$('.tk')) r.go(location.hash.slice(1), { replace: true, scroll: false });
  })(0);

  window.SereinToolkit = { hub, open: (id, o) => open(id, o), has: id => !!byId[id], search, tools: T.tools, groups: T.groups, _model: (id, v) => model(byId[id], v == null ? validValues(byId[id], null) : v), _text: (id, v) => planText(byId[id], v == null ? validValues(byId[id], null) : v), _defaults: id => validValues(byId[id], null) };
})();
