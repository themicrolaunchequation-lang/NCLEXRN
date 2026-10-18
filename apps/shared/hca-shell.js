/* Healthcare Crown Academy shared shell + My Day builder. No dependencies; CSP-safe (external file, no eval).
   HCAShell.init(cfg) normalises an app's existing sidebar / top bar / mobile tabs into the shared navy shell.
   HCAShell.day(spec) builds the bento "My Day" screen from plain data. See hca-shell.css for the class hooks. */
(function (global) {
  'use strict';
  const d = document, root = d.documentElement;
  const $ = (s, r) => (r || d).querySelector(s), $$ = (s, r) => [...(r || d).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { } } };

  const P = {
    home: 'M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z',
    book: 'M4 19.5V5a2 2 0 0 1 2-2h14v16H6.5A2.5 2.5 0 0 0 4 21.5M4 19.5A2.5 2.5 0 0 1 6.5 17H20',
    flame: 'M12 2.5c.6 3.4 4.8 5.3 4.8 10a4.8 4.8 0 0 1-9.6 0c0-1.9.9-3 1.9-4 0 1.9 1 2.9 2 2.9 0-3-1.1-5 .9-8.9z',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3',
    help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5M12 17.5h.01',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
    sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    chev: 'M15 6l-6 6 6 6',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
    play: 'M7 4l13 8-13 8z',
    check: 'M5 12.5l4.5 4.5L19 7',
    x: 'M6 6l12 12M18 6L6 18',
    sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
    layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
    target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    pencil: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
    heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    bookmark: 'M6 3h12v18l-6-4-6 4z',
    wind: 'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8',
    lightbulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z',
    compass: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM16 8l-2 6-6 2 2-6z',
    image: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
    message: 'M21 12a8 8 0 0 1-11.8 7L3 21l2-5.2A8 8 0 1 1 21 12z',
    refresh: 'M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12a9 9 0 0 1 15.5-6.2L21 8M3 21v-5h5M21 3v5h-5',
    highlight: 'M9 11l-6 6v3h9l3-3M22 5.5L18.5 2 9 11.5l3.5 3.5z',
    menu: 'M4 7h16M4 12h16M4 17h16',
    moonstars: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
    rail: 'M15 6l-6 6 6 6'
  };
  const icon = (n, cls) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${cls ? ` class="${cls}"` : ''}><path d="${P[n] || P.sparkle}"/></svg>`;

  const APPS = [
    { id: 'medlex', name: 'MedLex', url: 'https://medlex.healthcarecrownacademy.co.uk/', c: '#3557D6' },
    { id: 'carecraft', name: 'Carecraft', url: 'https://carecraft.healthcarecrownacademy.co.uk/', c: '#0F8A86' },
    { id: 'serein', name: 'Serein', url: 'https://serein.healthcarecrownacademy.co.uk/', c: '#5FB89E' },
    { id: 'lumen', name: 'Lumen', url: 'https://lumen.healthcarecrownacademy.co.uk/', c: '#8B6CF0' },
    { id: 'evinca', name: 'Evinca', url: 'https://evinca.healthcarecrownacademy.co.uk/en', c: '#D4A445' }
  ];

  /* ---------- time helpers ---------- */
  const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  function when(now) {
    now = now || new Date(); const h = now.getHours();
    const part = h < 5 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
    const greet = h < 5 ? 'Still up' : 'Good ' + part;
    return { part, greet, hour: h, eyebrow: `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]} · ${greet.toUpperCase()}` };
  }
  const dayKey = (t = new Date()) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  /* Mon-first week, flags for done days. doneKeys: Set of yyyy-mm-dd. */
  function week(doneKeys) {
    const now = new Date(), idx = (now.getDay() + 6) % 7, out = [];
    for (let i = 0; i < 7; i++) { const t = new Date(now); t.setDate(now.getDate() - idx + i); out.push({ l: 'MTWTFSS'[i], name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], done: doneKeys.has(dayKey(t)), today: i === idx }); }
    return out;
  }
  function streakOf(doneKeys) {
    let n = 0; const t = new Date(); if (!doneKeys.has(dayKey(t))) t.setDate(t.getDate() - 1);
    while (doneKeys.has(dayKey(t))) { n++; t.setDate(t.getDate() - 1); }
    return n;
  }

  /* ---------- environment sync ---------- */
  let cfg = null, mqDark = null, mqMotion = null;
  function syncTheme() {
    let dark = false; const t = root.dataset.theme || '';
    try { const cs = getComputedStyle(root).colorScheme || ''; dark = /(^|\s)dark/.test(cs) && !/light/.test(cs); } catch { }
    if (!dark && /^(dark|night)$/.test(t)) dark = true;
    if (!dark && !t && mqDark && mqDark.matches && !/light/.test(getComputedStyle(root).colorScheme || '')) dark = true;
    if (/^light$/.test(t)) dark = false;
    root.dataset.hsTheme = dark ? 'dark' : 'light';
  }
  function motionOff() {
    if (mqMotion && mqMotion.matches) return true;
    const sel = (cfg && cfg.motionOff) || '';
    try { return !!sel && (root.matches(sel) || (d.body && d.body.matches(sel))); } catch { return false; }
  }
  function syncMotion() { root.dataset.hsMotion = motionOff() ? 'off' : 'on'; }

  /* ---------- shell ---------- */
  let normalizing = false, raf = 0, crestHTML = '';
  function grabCrest(brand) {
    if (crestHTML) return crestHTML;
    const c = $('.hca-crest', d) || $('img', brand) || $('svg', brand);
    if (!c) return '';
    const img = c.tagName === 'IMG' ? c : $('img', c);
    crestHTML = img ? `<img src="${esc(img.getAttribute('src'))}" alt="" width="40" height="40">` : (c.tagName === 'svg' ? c.outerHTML : c.innerHTML);
    return crestHTML;
  }
  function labelOf(el) { const t = $('.hs-lbl,.nav-text,span:not(.icon):not(.nav-icon)', el); return ((t || el).textContent || '').replace(/\s+/g, ' ').trim(); }

  function normalize() {
    if (!cfg || normalizing) return; normalizing = true;
    try {
      const S = cfg.sel, side = $(S.side), top = $(S.top), body = d.body;
      body.classList.add('hs'); body.dataset.hsApp = cfg.app;
      const content = S.content && $(S.content); if (content) content.classList.add('hs-content');
      if (side) {
        side.classList.add('hs-side');
        const brand = $(S.brand, side);
        if (brand) {
          brand.classList.add('hs-brand');
          if (!$('.hs-name', brand)) { const crest = grabCrest(brand); brand.innerHTML = `<span class="hs-crest">${crest}</span><span class="hs-name"><b>${esc(cfg.name)}</b><span class="hs-tag">Healthcare Crown Academy</span></span>`; }
          brand.setAttribute('aria-label', `${cfg.name} — ${cfg.dayName || 'My Day'}`);
        }
        (S.navs || []).forEach(ns => $$(ns, side).forEach(nav => {
          nav.classList.add('hs-nav');
          $$(':scope > a, :scope > button, :scope > details > a, :scope > details > button', nav).forEach(it => {
            if (it.classList.contains('hs-fold')) return;
            it.classList.add('hs-item'); const l = labelOf(it); if (l && !it.title) it.title = l;
            (cfg.groups || []).forEach(g => { if (g.first === l) { it.dataset.hsGroup = g.label; } });
          });
        }));
        ensureFoot(side);
      }
      if (top) normalizeTop(top);
      const tabs = S.tabs && $(S.tabs);
      if (tabs) { tabs.classList.add('hs-tabs'); $$(':scope > a, :scope > button', tabs).forEach(t => t.classList.add('hs-tab')); if (cfg.more && !$('.hs-more', tabs)) addMore(tabs); if (content) content.classList.add('hs-has-tabs'); }
      placeAccount();
      applyRail();
    } finally { normalizing = false; }
  }

  function ensureFoot(side) {
    let foot = $('.hs-foot', side);
    if (foot) return;
    foot = d.createElement('div'); foot.className = 'hs-foot';
    foot.innerHTML = `<div class="hs-apps"><span class="hs-apps-label">Crown apps</span><div class="hs-apps-row" role="list">${APPS.map(a => `<a role="listitem" class="hs-app" href="${a.url}" style="--c:${a.c}" data-tip="${a.name}" aria-label="${a.name}"${a.id === cfg.app ? ' aria-current="true"' : ''}>${a.name[0]}</a>`).join('')}</div></div><div class="hs-acct-slot"><div data-crown-account></div></div>`;
    side.append(foot);
  }

  function placeAccount() {
    const desktop = matchMedia('(min-width:1024px)').matches;
    const host = $('.hca-acct');
    const slot = desktop ? $('.hs-acct-slot') : $('.hs-acct-top');
    if (!slot) return;
    if (host && host.parentNode !== slot) {
      host.classList.remove('floating', 'right');
      const placeholder = $('[data-crown-account]:not(.hca-acct)', slot); if (placeholder) placeholder.remove();
      slot.append(host);
    }
    if (desktop) { const mob = $('.hs-acct-top'); if (mob && !$('.hca-acct', mob)) { /* empty is fine */ } }
  }

  function normalizeTop(top) {
    const S = cfg.sel;
    top.classList.add('hs-top');
    let crumbs = $('.hs-crumbs', top);
    if (!crumbs) {
      crumbs = $(S.crumbs, top);
      if (crumbs) crumbs.classList.add('hs-crumbs');
    }
    const search = $(S.search, top); if (search) search.classList.add('hs-search');
    let right = $('.hs-right', top);
    if (!right) { right = d.createElement('div'); right.className = 'hs-right'; top.append(right); }
    if (!$('.hs-mbrand', top)) {
      const mb = d.createElement('a'); mb.className = 'hs-mbrand'; mb.href = cfg.home || '#'; mb.setAttribute('aria-label', cfg.name);
      mb.innerHTML = `<span class="hs-crest">${crestHTML || ''}</span><span>${esc(cfg.name)}</span>`; top.prepend(mb);
    }
    if (search && search.parentNode !== top) top.insertBefore(search, right);
    else if (search && search.nextSibling !== right && search.parentNode === top) top.insertBefore(search, right);
    if (crumbs && crumbs.parentNode === top) top.insertBefore(crumbs, search || right);
    // streak / ring chip
    if (cfg.streak && !$('.hs-streak', right)) { const s = d.createElement('a'); s.className = 'hs-streak'; s.href = cfg.home || '#'; s.hidden = true; right.prepend(s); }
    // theme toggle + profile etc. from the old actions container
    (S.moveRight || []).forEach(ms => $$(ms, top).forEach(el => { if (el.parentNode !== right && !right.contains(el)) { el.classList.add('hs-moved'); right.append(el); } }));
    const theme = S.theme && $(S.theme, top); if (theme) theme.classList.add('hs-ibtn', 'hs-theme-btn');
    if (cfg.help && !$('.hs-help-btn', right)) {
      const h = d.createElement('button'); h.type = 'button'; h.className = 'hs-ibtn hs-help-btn'; h.setAttribute('aria-label', cfg.helpLabel || `How to use ${cfg.name}`); h.title = cfg.helpLabel || `How to use ${cfg.name}`;
      h.innerHTML = `${icon('help')}<span class="hs-lbl">Help</span>`; h.addEventListener('click', e => { e.preventDefault(); cfg.help(); });
      const theme2 = $('.hs-theme-btn', right); theme2 ? theme2.after(h) : right.append(h);
    }
    if (!$('.hs-acct-top', right)) { const a = d.createElement('div'); a.className = 'hs-acct-top'; right.append(a); }
    (cfg.afterTop || []).forEach(fn => fn(top, right));
    updateStreak();
  }

  function addMore(tabs) {
    const b = d.createElement('button'); b.type = 'button'; b.className = 'hs-tab hs-more'; b.innerHTML = `${icon('more')}<span>More</span>`; b.setAttribute('aria-label', 'More sections');
    b.addEventListener('click', () => toggleDrawer(true)); tabs.append(b);
  }

  function toggleDrawer(on) {
    const side = $(cfg.sel.side); if (!side) return;
    if (cfg.drawer) { try { cfg.drawer(on); } catch { } d.body.classList.toggle('hs-drawer', on); return; }
    d.body.classList.toggle('hs-drawer', on);
    side.classList.toggle('open', on);
    if (on) { const f = $('.hs-item', side); setTimeout(() => f && f.focus(), 60); }
  }

  function applyRail() {
    const on = store.get(cfg.app + '.rail') === '1' && matchMedia('(min-width:1024px)').matches;
    d.body.classList.toggle('hs-rail', on);
    const b = $('.hs-rail-toggle'); if (b) { b.setAttribute('aria-expanded', String(!on)); b.setAttribute('aria-label', on ? 'Expand sidebar' : 'Collapse sidebar'); b.title = on ? 'Expand sidebar' : 'Collapse sidebar'; }
  }
  function mountChrome() {
    if (!$('.hs-rail-toggle')) {
      const b = d.createElement('button'); b.type = 'button'; b.className = 'hs-rail-toggle'; b.innerHTML = icon('rail');
      b.addEventListener('click', () => { store.set(cfg.app + '.rail', store.get(cfg.app + '.rail') === '1' ? '0' : '1'); applyRail(); });
      d.body.append(b);
    }
    if (!$('.hs-scrim')) { const s = d.createElement('button'); s.type = 'button'; s.className = 'hs-scrim'; s.tabIndex = -1; s.setAttribute('aria-label', 'Close menu'); s.addEventListener('click', () => toggleDrawer(false)); d.body.append(s); }
    d.addEventListener('keydown', e => { if (e.key === 'Escape' && d.body.classList.contains('hs-drawer')) toggleDrawer(false); });
    d.addEventListener('click', e => { if (d.body.classList.contains('hs-drawer') && e.target.closest && e.target.closest('.hs-side .hs-item,.hs-side .hs-brand')) setTimeout(() => toggleDrawer(false), 0); });
  }

  function updateStreak() {
    if (!cfg || !cfg.streak) return; const el = $('.hs-streak'); if (!el) return;
    let v = null; try { v = cfg.streak(); } catch { }
    if (v == null) { el.hidden = true; return; }
    el.hidden = false;
    const html = v.html || `${icon('flame')}<span>${esc(v.text != null ? v.text : v)}</span>`;
    if (el.dataset.v !== html) { el.innerHTML = html; el.dataset.v = html; }
    el.setAttribute('aria-label', v.label || `${v.text != null ? v.text : v}-day streak`); el.title = v.label || `${v.text != null ? v.text : v}-day streak`;
  }

  function init(c) {
    cfg = c; mqDark = matchMedia('(prefers-color-scheme: dark)'); mqMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const go = () => {
      normalize(); mountChrome(); applyRail(); syncTheme(); syncMotion();
      const schedule = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; normalize(); }); };
      new MutationObserver(schedule).observe(d.body, { childList: true, subtree: cfg.observe !== 'body' });
      new MutationObserver(() => { syncTheme(); syncMotion(); }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'class', 'data-motion', 'style'] });
      new MutationObserver(() => syncMotion()).observe(d.body, { attributes: true, attributeFilter: ['class', 'data-motion'] });
      mqDark.addEventListener && mqDark.addEventListener('change', syncTheme); mqMotion.addEventListener && mqMotion.addEventListener('change', syncMotion);
      matchMedia('(min-width:1024px)').addEventListener && matchMedia('(min-width:1024px)').addEventListener('change', () => { placeAccount(); applyRail(); toggleDrawer(false); });
      addEventListener('hashchange', () => { updateStreak(); toggleDrawer(false); }); addEventListener('storage', updateStreak);
      setInterval(() => { if (!d.hidden) updateStreak(); }, 4000);
    };
    if (cfg.wait && d.readyState === 'loading') d.addEventListener('DOMContentLoaded', go); else go();
  }

  /* ---------- My Day builder ---------- */
  const h = (tag, attrs, html) => { const e = d.createElement(tag); if (attrs) for (const k in attrs) { const v = attrs[k]; if (v == null || v === false) continue; if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v); } if (html != null) e.innerHTML = html; return e; };
  const act = (el, a) => { if (!a) return el; if (a.attrs) for (const k in a.attrs) el.setAttribute(k, a.attrs[k]); if (a.href) el.setAttribute('href', a.href); if (a.onClick) el.addEventListener('click', ev => { ev.preventDefault(); a.onClick(ev); }); return el; };
  function btn(a, cls) { const e = h(a.href ? 'a' : 'button', { class: 'hs-btn ' + cls, type: a.href ? null : 'button' }, `${a.icon ? icon(a.icon) : ''}<span>${esc(a.label)}</span>${a.arrow === false ? '' : icon('arrow')}`); return act(e, a); }
  function link(a) { const e = h(a.href ? 'a' : 'button', { class: 'hs-link', type: a.href ? null : 'button' }, `<span>${esc(a.label)}</span>${icon('arrow')}`); return act(e, a); }

  function ringSVG(pct) {
    const r = 52, c = 2 * Math.PI * r, o = c * (1 - Math.max(0, Math.min(1, pct)));
    return `<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="trk" cx="60" cy="60" r="${r}"/><circle class="arc" cx="60" cy="60" r="${r}" style="--c:${c.toFixed(1)};--o:${o.toFixed(1)}"/></svg>`;
  }

  function day(spec) {
    const root_ = h('div', { class: 'hs-day', 'data-hs-day': '' });
    let i = 0; const rise = e => { e.style.setProperty('--i', i++); return e; };
    // hero
    const H = spec.hero, hero = h('section', { class: 'hs-hero hs-c8', 'aria-labelledby': 'hs-h1' });
    hero.innerHTML = `<div class="hs-aurora" aria-hidden="true"><i></i><i></i><i></i></div>`;
    const copy = h('div', { class: 'hs-hero-copy' });
    copy.append(h('p', { class: 'hs-eyebrow' }, esc(H.eyebrow)), h('h1', { id: 'hs-h1' }, H.h1), h('p', { class: 'hs-lead' }, esc(H.lead || '')));
    const acts = h('div', { class: 'hs-hero-actions' }); acts.append(btn(H.primary, 'is-primary')); if (H.secondary) acts.append(btn(H.secondary, 'is-ghost'));
    copy.append(acts);
    if (H.meta && H.meta.length) copy.append(h('p', { class: 'hs-meta' }, H.meta.map(m => `<span>${m.icon ? icon(m.icon) : ''}${esc(m.text)}</span>`).join('')));
    const art = h('div', { class: 'hs-hero-art', 'data-hs-art': '' }); if (H.art) { if (typeof H.art === 'string') art.innerHTML = H.art; else art.append(H.art); }
    hero.append(copy, art); root_.append(rise(hero));
    // progress
    const Pg = spec.progress, pc = h('aside', { class: 'hs-card hs-progress hs-c4 is-static', 'aria-label': 'Your progress today' });
    const wk = Pg.week || [];
    pc.innerHTML = `<div class="hs-card-top"><p class="hs-eyebrow">${esc(Pg.eyebrow || 'Today’s goal')}</p>${Pg.streak != null ? `<span class="hs-flame">${icon('flame')}<span data-count="${Pg.streak}">${Pg.streak}</span> ${Pg.streakLabel || 'day streak'}</span>` : ''}</div>
      <div class="hs-ring-wrap"><div class="hs-ring" role="img" aria-label="${esc(Pg.ringLabel || '')}">${ringSVG(Pg.pct || 0)}<div class="hs-ring-c"><b data-count="${Pg.main}">${esc(Pg.main)}</b><span class="sm">${esc(Pg.sub || '')}</span></div></div>
      <div class="hs-prog-side"><h2>${esc(Pg.title || '')}</h2>${Pg.empty ? `<p class="hs-empty">${esc(Pg.empty)}</p>` : `<p>${esc(Pg.text || '')}</p>`}</div></div>
      <div class="hs-week" role="list" aria-label="This week">${wk.map(w => `<span class="hs-wd${w.done ? ' is-done' : ''}${w.today ? ' is-today' : ''}" role="listitem" aria-label="${w.name}${w.done ? ', done' : w.today ? ', today' : ''}"><i></i>${w.l}</span>`).join('')}</div>
      ${Pg.strip && Pg.strip.length ? `<div class="hs-strip">${Pg.strip.map(s => `<span><b data-count="${esc(s.v)}">${esc(s.v)}</b>${esc(s.l)}</span>`).join('')}</div>` : ''}`;
    root_.append(rise(pc));
    // ordered items: action cards, path card, raw cards
    const items = spec.items || [...(spec.actions || []).map(a => Object.assign({ kind: 'act' }, a)), ...(spec.path ? [Object.assign({ kind: 'path' }, spec.path)] : [])];
    items.forEach(A => {
      if (A.kind === 'raw') { const el = A.el || h('div', { class: A.cls || 'hs-card' }, A.html); if (A.el && A.cls) el.className = A.cls; root_.append(rise(el)); return; }
      if (A.kind === 'path') {
        const Q = A, pcard = h('section', { class: 'hs-card hs-path hs-c8 is-static', 'aria-label': Q.title });
        pcard.append(h('div', { class: 'hs-card-top' }, `<p class="hs-eyebrow">${esc(Q.eyebrow)}</p>${Q.head || ''}`), h('h2', null, esc(Q.title)));
        const ul = h('ul', { class: 'hs-path-list' });
        Q.items.forEach((it, k) => { const li = h('li', { class: it.done ? 'is-done' : '' }, `<span class="n" aria-hidden="true">${it.done ? icon('check') : k + 1}</span><span class="t"><b>${esc(it.title)}</b><span>${esc(it.sub || '')}</span></span>`); if (it.cta) { const g = h('span', { class: 'go' }); g.append(btn(it.cta, 'is-line')); li.append(g); } ul.append(li); });
        pcard.append(ul); if (Q.foot) pcard.append(h('div', { class: 'hs-foot-row' }, Q.foot)); root_.append(rise(pcard)); return;
      }
      const c = h('section', { class: 'hs-card hs-act hs-c4' + (A.cls ? ' ' + A.cls : '') });
      c.append(h('div', { class: 'hs-card-top' }, `<span class="hs-tile">${icon(A.icon)}</span><p class="hs-eyebrow">${esc(A.eyebrow)}</p>${A.chip ? `<span class="hs-chip">${esc(A.chip)}</span>` : ''}`));
      if (A.title) c.append(h('h3', null, A.title));
      if (A.body) { if (typeof A.body === 'string') c.append(h('p', null, A.body)); else c.append(A.body); }
      if (A.html) c.append(h('div', { class: 'hs-html' }, A.html));
      if (A.progress != null) c.append(h('div', { class: 'hs-prog', role: 'progressbar', 'aria-valuenow': Math.round(A.progress), 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': A.progressLabel || 'Progress' }, `<i style="--w:${A.progress}%"></i>`));
      if (A.sub) c.append(h('span', { class: 'hs-sub' }, esc(A.sub)));
      if (A.cta) c.append(link(A.cta));
      root_.append(rise(c));
    });
    return root_;
  }

  /* count-up + ring + tilt, called after the day is in the DOM */
  function animate(host) {
    const off = root.dataset.hsMotion === 'off';
    $$('.hs-ring', host).forEach(r => requestAnimationFrame(() => r.classList.add('is-go')));
    if (off) return;
    $$('[data-count]', host).forEach(el => {
      const to = parseFloat(String(el.dataset.count).replace(/,/g, '')); if (!isFinite(to) || to <= 0) return;
      const fmt = String(el.dataset.count).includes(',') ? v => Math.round(v).toLocaleString('en-GB') : v => String(Math.round(v)); const t0 = performance.now(), dur = 900;
      const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); else el.textContent = el.dataset.count; };
      el.textContent = '0'; requestAnimationFrame(step);
    });
  }
  function tilt(hero, max) {
    max = max || 10; const art = $('.hs-hero-art', hero); if (!art) return;
    let r = 0;
    const set = (x, y) => { art.style.setProperty('--ry', (x * max).toFixed(2) + 'deg'); art.style.setProperty('--rx', (-y * max).toFixed(2) + 'deg'); };
    hero.addEventListener('pointermove', e => {
      if (root.dataset.hsMotion === 'off' || e.pointerType === 'touch') return;
      cancelAnimationFrame(r); r = requestAnimationFrame(() => { const b = hero.getBoundingClientRect(); set(((e.clientX - b.left) / b.width - .5) * 2, ((e.clientY - b.top) / b.height - .5) * 2); });
    });
    hero.addEventListener('pointerleave', () => set(0, 0));
  }

  global.HCAShell = { init, day, animate, tilt, icon, esc, h, btn, link, when, week, streakOf, dayKey, store, syncTheme, syncMotion, normalize, toggleDrawer, APPS, $, $$ };
})(window);
