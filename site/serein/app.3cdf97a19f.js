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
    crown: 'M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z',
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
    let dark = false; const t = root.dataset.theme || (d.body && d.body.dataset.theme) || '';
    try { const cs = getComputedStyle(root).colorScheme || ''; dark = /(^|\s)dark/.test(cs) && !/light/.test(cs); } catch { }
    if (!dark && /^(dark|night)$/.test(t)) dark = true;
    if (!dark && !t && mqDark && mqDark.matches && !/light/.test(getComputedStyle(root).colorScheme || '')) dark = true;
    if (/^light$/.test(t)) dark = false;
    root.dataset.hsTheme = dark ? 'dark' : 'light';
    if (cfg && cfg.mcrest) $$('.hs-mbrand img').forEach(i => { const u = cfg.mcrest(); if (i.getAttribute('src') !== u) i.setAttribute('src', u); });
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
    const own = S.mbrand && $(S.mbrand, top);
    if (own) own.classList.add('hs-mbrand');
    if (!own && !$('.hs-mbrand', top)) {
      const mb = d.createElement('a'); mb.className = 'hs-mbrand'; mb.href = cfg.home || '#'; mb.setAttribute('aria-label', cfg.name);
      mb.innerHTML = `<span class="hs-crest">${cfg.mcrest ? `<img src="${esc(cfg.mcrest())}" alt="" width="34" height="34">` : (crestHTML || '')}</span><span>${esc(cfg.name)}</span>`; top.prepend(mb);
    }
    if (search && (search.parentNode !== top || search.nextSibling !== right)) top.insertBefore(search, right);
    { const ref = search || right; if (crumbs && crumbs.parentNode === top && crumbs.nextSibling !== ref) top.insertBefore(crumbs, ref); }
    // streak / ring chip
    if (cfg.streak && !$('.hs-streak', right)) { const s = d.createElement('a'); s.className = 'hs-streak'; s.href = cfg.home || '#'; s.hidden = true; right.prepend(s); }
    // theme toggle + profile etc. from the old actions container
    (S.moveRight || []).forEach(ms => $$(ms, top).forEach(el => { if (el.parentNode !== right && !right.contains(el)) { el.classList.add('hs-moved'); right.append(el); } }));
    const theme = S.theme && $(S.theme, top); if (theme) theme.classList.add('hs-ibtn', 'hs-theme-btn');
    if (!theme && cfg.themeToggle && !$('.hs-theme-btn', right)) {
      const tb = d.createElement('button'); tb.type = 'button'; tb.className = 'hs-ibtn hs-theme-btn hs-theme-own'; tb.setAttribute('aria-label', 'Switch between light and dark'); tb.title = 'Switch between light and dark';
      tb.innerHTML = `<span class="hs-t-moon">${icon('moon')}</span><span class="hs-t-sun">${icon('sun')}</span>`; tb.addEventListener('click', () => { cfg.themeToggle(); setTimeout(syncTheme, 30); });
      const st = $('.hs-streak', right); st ? st.after(tb) : right.prepend(tb);
    }
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

  /* One streak across the suite: the Daily Crown streak replaces each app's own count (Serein shows none). */
  const shared = () => { const D = global.HCA && global.HCA.daily && global.HCA.daily.get(); return D && cfg && cfg.app !== 'serein' ? D.s : null; };
  function updateStreak() {
    if (!cfg || !cfg.streak) return; const el = $('.hs-streak'); if (!el) return;
    let v = null; try { v = cfg.streak(); } catch { }
    const sh = shared(); if (sh !== null && v != null) v = { text: sh, label: sh ? `${sh}-day Daily Crown streak` : 'Start your Daily Crown streak' };
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
      const schedule = () => { if (raf) return; raf = 1; Promise.resolve().then(() => { raf = 0; normalize(); }); };
      new MutationObserver(schedule).observe(d.body, { childList: true, subtree: cfg.observe !== 'body' });
      new MutationObserver(() => { syncTheme(); syncMotion(); }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'class', 'data-motion', 'style'] });
      new MutationObserver(() => { syncMotion(); syncTheme(); }).observe(d.body, { attributes: true, attributeFilter: ['class', 'data-motion', 'data-theme'] });
      mqDark.addEventListener && mqDark.addEventListener('change', syncTheme); mqMotion.addEventListener && mqMotion.addEventListener('change', syncMotion);
      matchMedia('(min-width:1024px)').addEventListener && matchMedia('(min-width:1024px)').addEventListener('change', () => { placeAccount(); applyRail(); toggleDrawer(false); });
      addEventListener('hca-daily', updateStreak);
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


  /* Daily Crown: one short step in each app, one shared streak (HCA.daily, a first-party cookie). Serein shows no streak. */
  const DC = { medlex: ['One word', 'Decode a word', 'https://medlex.healthcarecrownacademy.co.uk/#today'], carecraft: ['One scenario', 'Make a call', 'https://carecraft.healthcarecrownacademy.co.uk/#today'], serein: ['One breath', 'Pause for a minute', 'https://serein.healthcarecrownacademy.co.uk/#today'], lumen: ['Cards due', 'Review recall cards', 'https://lumen.healthcarecrownacademy.co.uk/#today'] };
  function dailyCard(app) {
    const D = global.HCA && global.HCA.daily && global.HCA.daily.get(); if (!D) return null;
    const calm = app === 'serein', n = D.a.length, c = h('section', { class: 'hs-card hs-daily hs-c12 is-static', 'aria-labelledby': 'dc-h' });
    const head = n >= D.total ? 'All four done today. Lovely.' : n ? `${n} of ${D.total} done today` : 'Your Daily Crown';
    const note = calm ? 'No streak to keep. Take what fits today.' : D.s > 0 ? `${D.s}-day streak${D.best > D.s ? ` · best ${D.best}` : ''}` : 'One small step starts a streak';
    c.innerHTML = `<div class="dc-top"><div><p class="hs-eyebrow">Daily Crown · about 5 minutes</p><h2 id="dc-h">${esc(head)}</h2></div><p class="dc-streak">${calm ? '' : icon('crown')}<span>${esc(note)}</span></p></div>`
      + `<ol class="dc-list">${D.apps.map(a => { const x = DC[a], on = D.a.includes(a), here = a === app, href = here ? '#today' : x[2];
        return `<li class="${on ? 'is-done' : ''}"><a class="dc-item jewel-${a}" href="${href}"><span class="dc-mark" aria-hidden="true">${on ? icon('check') : ''}</span><span class="dc-t"><b>${esc(x[0])}</b><span>${esc(x[1])}</span></span><span class="dc-s">${on ? 'Done' : here ? 'Here' : 'Open'}${on ? '' : ''}</span></a></li>`; }).join('')}</ol>`;
    return c;
  }

  function day(spec) {
    if (spec.daily && spec.daily.done && global.HCA && global.HCA.daily) global.HCA.daily.done(spec.daily.app);
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
    pc.innerHTML = `<div class="hs-card-top"><p class="hs-eyebrow">${esc(Pg.eyebrow || 'Today’s goal')}</p>${(() => { const sh = shared(), n = sh !== null ? (sh > 0 ? sh : null) : Pg.streak; return n != null ? `<span class="hs-flame">${icon('flame')}<span data-count="${n}">${n}</span> ${sh !== null ? 'day streak' : (Pg.streakLabel || 'day streak')}</span>` : ''; })()}</div>
      <div class="hs-ring-wrap"><div class="hs-ring" role="img" aria-label="${esc(Pg.ringLabel || '')}">${ringSVG(Pg.pct || 0)}<div class="hs-ring-c"><b data-count="${Pg.main}">${esc(Pg.main)}</b><span class="sm">${esc(Pg.sub || '')}</span></div></div>
      <div class="hs-prog-side"><h2>${esc(Pg.title || '')}</h2>${Pg.empty ? `<p class="hs-empty">${esc(Pg.empty)}</p>` : `<p>${esc(Pg.text || '')}</p>`}</div></div>
      <div class="hs-week" role="list" aria-label="This week">${wk.map(w => `<span class="hs-wd${w.done ? ' is-done' : ''}${w.today ? ' is-today' : ''}" role="listitem" aria-label="${w.name}${w.done ? ', done' : w.today ? ', today' : ''}"><i></i>${w.l}</span>`).join('')}</div>
      ${Pg.strip && Pg.strip.length ? `<div class="hs-strip">${Pg.strip.map(s => `<span><b data-count="${esc(s.v)}">${esc(s.v)}</b>${esc(s.l)}</span>`).join('')}</div>` : ''}`;
    root_.append(rise(pc));
    if (spec.daily) { const dc = dailyCard(spec.daily.app); if (dc) root_.append(rise(dc)); }
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

  /* animate a day screen once per DOM node, even when the host app morphs it in place */
  function watchDay(mainSel) {
    const main = $(mainSel); if (!main) return;
    const scan = () => { const el = $('[data-hs-day]', main); if (el && !el.__hsLive) { el.__hsLive = true; animate(el); const hero = $('.hs-hero', el); if (hero) tilt(hero, cfg && cfg.tilt || 10); } };
    new MutationObserver(scan).observe(main, { childList: true, subtree: true }); scan();
  }
  global.HCAShell = { watchDay, init, day, animate, tilt, icon, esc, h, btn, link, when, week, streakOf, dayKey, store, syncTheme, syncMotion, normalize, toggleDrawer, APPS, $, $$ };
})(window);

;
/* Serein shell + "My Day". Loaded before the app: the patched today() asks SereinDay.render() for its markup.
   Motion here is deliberately slower and softer than in the other apps (see day.css). */
(function () {
  'use strict';
  const S = window.HCAShell; if (!S) return;
  const { icon, esc } = S;
  const pad = n => String(n).padStart(2, '0');

  const dayKeys = st => {
    const keys = new Set();
    for (const f of st.feedback || []) { const t = new Date(f.date); if (!isNaN(t)) keys.add(S.dayKey(t)); }
    for (const k of st.checkins || []) { const t = new Date(k.date); if (!isNaN(t)) keys.add(S.dayKey(t)); }
    return keys;
  };
  const weekCount = keys => S.week(keys).filter(w => w.done).length;
  const ringChip = n => { const r = 9, c = 2 * Math.PI * r; return `<svg class="sr-mini" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="${r}" fill="none" stroke="currentColor" stroke-opacity=".22" stroke-width="3"/><circle cx="12" cy="12" r="${r}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - n / 7)).toFixed(1)}" transform="rotate(-90 12 12)"/></svg><span>${n}/7</span>`; };

  /* shift-aware line, e.g. "Night shift · 03:10 — a 1-minute reset?" */
  function greeting(x) {
    const now = new Date(), clock = `${pad(now.getHours())}:${pad(now.getMinutes())}`, pref = x.store().preferences.shift, h = now.getHours();
    const night = pref === 'nights' || (pref !== 'days' && (h >= 22 || h < 5));
    if (night) return `Night shift · ${clock} — a 1-minute reset?`;
    return [`Before shift · ${clock} — three slow breaths to begin?`, `Between tasks · ${clock} — a small pause?`, `After a hard moment · ${clock} — you don’t have to carry it alone.`, `After shift · ${clock} — time to put the day down?`][x.state.moment] || `${clock} — a small pause?`;
  }
  const iconFor = p => p.breathFocus ? 'wind' : p.movement ? 'play' : /ground/i.test(p.category || p.id) ? 'compass' : 'heart';

  const orb = () => `<div class="sr-orb" role="img" aria-label="A softly glowing orb that swells as you breathe in for four seconds and settles over six"><i class="sr-halo"></i><i class="sr-ring sr-r1"></i><i class="sr-ring sr-r2"></i><i class="sr-core"></i><span class="sr-cue" aria-hidden="true"><b class="in">Breathe in</b><b class="out">…and let it go</b></span></div>`;

  function render(x) {
    const { c, state, D, A } = x, st = x.store(), wh = S.when();
    const budget = state.homeTime || st.preferences.time, ranked = c.advance.rank({ budget }), p0 = ranked[0] || null;
    const keys = dayKeys(st), nWeek = weekCount(keys), doneToday = keys.has(S.dayKey());
    const journey = A.journeys.find(j => { const n = (st.journeyProgress[j.id] || []).length; return n > 0 && n < j.steps.length; });
    const mode = doneToday ? 'done' : journey ? 'resume' : 'start';
    const n0 = p0 ? c.chooseDuration(p0, typeof state.homeTime === 'number' ? state.homeTime : st.preferences.time) : null;
    const h1 = { start: 'Make room <em>for you.</em>', resume: 'Pick up <em>at your pace.</em>', done: 'That counts. <em>Gently done.</em>' }[mode];
    const hero = {
      eyebrow: wh.eyebrow, h1, lead: greeting(x),
      primary: !p0 ? { label: 'Find a pause', attrs: { 'data-adv': 'finder' }, icon: 'play' }
        : mode === 'start' ? { label: 'Start my pause', icon: 'play', attrs: { 'data-practice': p0.id, 'data-duration': n0 || '' } }
        : mode === 'resume' ? { label: `Resume · ${(st.journeyProgress[journey.id] || []).length}/${journey.steps.length}`, icon: 'play', attrs: { 'data-adv': 'journey', 'data-id': journey.id } }
        : { label: 'Done ✓', arrow: false, attrs: { 'aria-disabled': 'true' } },
      secondary: { label: mode === 'done' ? 'Another pause' : 'Something else', attrs: { 'data-adv': 'finder' }, arrow: false },
      meta: p0 ? [{ icon: 'clock', text: c.durationLabel(n0) }, { icon: 'compass', text: p0.position }, { icon: 'wind', text: p0.breathFocus ? 'Breath focus' : 'No breath focus' }] : [],
      art: orb()
    };
    const fresh = !keys.size;
    const week = S.week(keys), helpful = (st.feedback || []).filter(f => f.result === 'Helpful' && Date.now() - Date.parse(f.date) < 7 * 864e5).length;
    const weekFb = (st.feedback || []).filter(f => Date.now() - Date.parse(f.date) < 7 * 864e5).length;
    const progress = {
      eyebrow: 'This week, gently', streak: null, pct: nWeek / 7, main: fresh ? '7' : nWeek, sub: fresh ? 'days, no rush' : `of 7 days`,
      ringLabel: fresh ? 'A gentle week ahead' : `${nWeek} of 7 days this week`,
      title: fresh ? 'Your first pause starts your week' : nWeek >= 4 ? 'A steady, kind week' : 'A little room, most days',
      empty: fresh ? 'One minute is enough. Nothing here is a score.' : null, text: 'No streaks. Just a gentle look at the week.',
      week, strip: [{ v: String(weekFb), l: 'pauses' }, { v: String(helpful), l: 'felt helpful' }, { v: String((st.checkins || []).filter(k => Date.now() - Date.parse(k.date) < 7 * 864e5).length), l: 'check-ins' }]
    };
    const chip = (attrs, label, pressed) => `<button type="button" ${attrs} aria-pressed="${pressed}">${esc(label)}</button>`;
    const bar = `<div class="sr-bar"><p class="hs-eyebrow">For this moment</p><div class="hs-seg" role="group" aria-label="Your working moment">${D.moments.map((m, i) => chip(`data-moment="${i}"`, m.title, state.moment === i)).join('')}</div><div class="hs-seg" role="group" aria-label="Time you have">${[[60, '1 min'], [120, '2 min'], [300, '5 min'], ['self', 'Self-paced']].map(([v, l]) => chip(`data-v5="home-time" data-value="${v}"`, l, String(v) === String(state.homeTime || st.preferences.time))).join('')}</div>${st.preferences.shift === 'rotating' ? `<div class="hs-seg" role="group" aria-label="This week">${['days', 'nights'].map(v => `<button type="button" data-v5="rotation" data-value="${v}">${v === 'days' ? 'Days' : 'Nights'}</button>`).join('')}</div>` : ''}</div>`;
    const cards = ranked.slice(1, 4).map(p => {
      const n = c.chooseDuration(p, typeof state.homeTime === 'number' ? state.homeTime : st.preferences.time);
      return { kind: 'act', icon: iconFor(p), eyebrow: p.category || 'Practice', title: esc(p.title), body: esc(p.desc), sub: `${c.durationLabel(n)} · ${p.position}`, cta: { label: 'Start', attrs: { 'data-practice': p.id, 'data-duration': n || '' } } };
    });
    const link = (attrs, k, t) => `<button type="button" class="sr-row" ${attrs}><span><small class="sr-k">${esc(k)}</small><b>${esc(t)}</b></span>${icon('arrow')}</button>`;
    const cont = journey ? link(`data-adv="journey" data-id="${esc(journey.id)}"`, 'Continue at your pace', journey.title) : st.routine.length ? link('data-nav="me/routine"', 'Your chosen sequence', 'Return to my routine') : st.savedPlans.length ? link('data-nav="toolkit"', 'Your saved plans', 'Return to a practical next step') : '';
    const path = `<section class="hs-card hs-path hs-c8 is-static" aria-labelledby="sr-ck"><div class="hs-card-top"><p class="hs-eyebrow">A quick check-in</p></div><h2 id="sr-ck">How are you arriving?</h2><p>Optional. One tap keeps it for this visit.</p>${c.moodButtons()}<div id="quick-checkin-actions" role="status"></div><div class="sr-rows">${cont}${link('data-nav="library/guides"', 'Guides', 'For real working days')}${link('data-nav="infographics"', 'Visual Atlas', 'Calm, illustrated guides')}</div></section>`;
    const q = c.quote();
    const side = q ? `<aside class="hs-card hs-quote hs-c4 is-static" aria-label="A thought for today">${q}<div class="sr-support"><p class="hs-eyebrow">Support is one tap away</p><p>If today is heavy, you do not have to carry it alone.</p><button type="button" class="hs-btn is-line" data-v5="help"><span>Get help now</span></button></div></aside>` : `<aside class="hs-card hs-c4 is-static"><p class="hs-eyebrow">A gentle reminder</p><h3>You belong in the care you give.</h3></aside>`;
    const items = [{ kind: 'raw', cls: 'hs-c12', html: bar }, ...cards, { kind: 'raw', el: raw(path) }, { kind: 'raw', el: raw(side) }];
    return S.day({ hero, progress, items, daily: { app: 'serein', done: doneToday } }).outerHTML;
  }
  const raw = html => { const w = document.createElement('div'); w.innerHTML = html; return w.firstElementChild; };

  /* Insights with nothing recorded yet: invite a first check-in instead of showing zeros */
  function insightsEmpty() {
    return `<section class="hs-card sr-invite is-static" aria-labelledby="sr-inv"><div class="sr-invite-art" aria-hidden="true"><i></i><i></i><i></i></div><div class="sr-invite-copy"><p class="hs-eyebrow">Insights</p><h2 id="sr-inv">Insights begin with one small check-in.</h2><p>There is nothing to look back on yet, and that is fine. One tap tells Serein how you are arriving; gentle patterns appear over time, only for you.</p><div class="sr-invite-actions"><button type="button" class="hs-btn is-jewel" data-action="checkin"><span>Make a small check-in</span>${icon('arrow')}</button><button type="button" class="hs-btn is-line" data-nav="today"><span>Choose a pause</span></button></div><p class="small-note">Personal awareness, not a health score or clinical assessment.</p></div></section>`;
  }
  globalThis.SereinDay = { render, insightsEmpty };

  S.init({
    app: 'serein', name: 'Serein', dayName: 'My Day', home: '#today',
    sel: { side: '#sidebar', brand: '.brand', navs: ['#desktop-nav'], top: '.topbar', crumbs: '.breadcrumb', search: '.search-launch', mbrand: '.mobile-brand', moveRight: ['[data-nav="me/settings"].icon-btn', '.global-help'], tabs: '#mobile-nav', content: '.workspace' },
    groups: [{ first: 'My Day', label: 'Start' }, { first: 'Library', label: 'Explore' }, { first: 'Me', label: 'You' }],
    motionOff: '.reduce-motion', tilt: 6,
    themeToggle: () => globalThis.Serein && Serein.themeToggle && Serein.themeToggle(),
    streak: () => { try { const st = Serein.stateRef && Serein.stateRef(); if (!st) return null; const n = weekCount(dayKeys(st)); if (!n) return null; return { html: ringChip(n), label: `${n} of 7 days this week` }; } catch { return null; } }
  });
  const start = () => S.watchDay('#main');
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
})();

;

/* English copy catalogue; content libraries remain structured in Serein.data/content. */
(function(S){'use strict';S.STRINGS={'en-GB':{"copy_0001":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"{v0}\"/></svg>","copy_0002":"Today","copy_0003":"My space","copy_0004":"Support","copy_0005":"Healthcare worker","copy_0006":"Choose a Serein JSON export.","copy_0007":"This file does not look like a Serein export.","copy_0008":"This archive uses a newer Serein version. Keep it unchanged and open it with that version.","copy_0009":"Not specified","copy_0010":"s-{v0}-{v1}","copy_0011":"Browser storage is unavailable. Your changes stay for this visit.","copy_0012":"(prefers-reduced-motion: reduce)","copy_0013":"{v0} min","copy_0014":"{v0}½ min","copy_0015":"<header class=\"page-header\"><div><p class=\"eyebrow\">{v0}</p><h1>{v1}</h1><p class=\"page-sub\">{v2}</p></div>{v3}</header>","copy_0016":"<span class=\"illustrative\" title=\"Illustrative, AI-generated image\" aria-label=\"Illustrative, AI-generated image\">ⓘ</span>","copy_0017":"Remove saved","copy_0018":"Save","copy_0019":"Remove saved reflection","copy_0020":"Save reflection","copy_0021":"<section class=\"quote-section\" aria-label=\"A Serein reflection\"><div><blockquote>{v0}</blockquote><cite>AN ORIGINAL SEREIN REFLECTION</cite></div><div class=\"quote-actions\"><button class=\"icon-btn\" data-action=\"save-word\" aria-label=\"{v1} reflection\" title=\"{v2}\" aria-pressed=\"{v3}\">{v4}</button><button class=\"icon-btn\" data-action=\"next-quote\" aria-label=\"Show another reflection\" title=\"Another reflection\">{v5}</button></div></section>","copy_0022":"A little low","copy_0023":"<button type=\"button\" class=\"mood {v0}\" data-mood=\"{v1}\" aria-pressed=\"{v2}\"><span class=\"mood-face\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8 9h.01 M16 9h.01 M7 15 Q12 {v3} 17 15\"/></svg></span>{v4}</button>","copy_0024":"<div class=\"mood-row\" role=\"group\" aria-label=\"How are you feeling?\">{v0}</div>","copy_0025":"<section class=\"checkin-card\"><p class=\"eyebrow\">A MOMENT FOR YOU</p><h3>How are you, really?</h3><p>No perfect answer. Just a moment to notice.</p>{v0}<button class=\"text-button\" data-action=\"checkin\">Make a small check-in {v1}</button><p class=\"small-note\">Optional · Personal reflection, not an assessment</p></section>","copy_0026":"<article class=\"practice-card\" data-key=\"practice-","copy_0027":"\"><button class=\"card-open\" data-practice-detail=\"","copy_0028":"\"><div class=\"card-image\"><img src=\"","copy_0029":"Illustrative scene for ","copy_0030":"\" loading=\"lazy\" width=\"800\" height=\"600\">","copy_0031":"<span class=\"card-category\">","copy_0032":"</span></div><div class=\"card-body\"><h3>","copy_0033":"</p><div class=\"card-meta\"><span>","copy_0034":"Breath focus","copy_0035":"Gentle movement","copy_0036":"No breath focus","copy_0037":"</span></div></div></button><button class=\"icon-btn save-icon\" data-save-practice=\"","copy_0038":"Remove saved ","copy_0039":"<article class=\"resource-card\"><button class=\"card-open\" data-resource=\"{v0}\"><div class=\"card-image\"><img src=\"{v1}\" alt=\"{v2}\" loading=\"lazy\" width=\"500\" height=\"340\">{v3}<span class=\"card-category\">{v4}</span></div><div class=\"card-body\"><h3>{v5}</h3><p>{v6}</p><div class=\"card-meta\"><span>{v7}</span><span style=\"margin-left:auto\">{v8}</span></div></div></button></article>","copy_0040":"Good morning","copy_0041":"Good afternoon","copy_0042":"Good evening","copy_0043":"A LITTLE SPACE FOR THE PEOPLE WHO CARE","copy_0044":"{v0}. Make room for you.","copy_0045":"A space for you as a {v0}. Choose what fits this moment.","copy_0046":"<time class=\"date-label\">{v0}</time>","copy_0047":"data-practice=\"{v0}\" data-duration=\"{v1}\"","copy_0048":"a grounding pause","copy_0049":"<button class=\"moment {v0}\" data-moment=\"{v1}\" aria-pressed=\"{v2}\"><span class=\"moment-top\">0{v3} / YOUR MOMENT {v4}</span><strong>{v5}</strong><small>{v6}</small></button>","copy_0050":"Illustrative reference for ","copy_0051":"breath focus","copy_0052":"without breath focus","copy_0053":"<section class=\"hero\"><div class=\"hero-copy\"><p class=\"eyebrow\">YOUR NEXT SMALL STEP</p><h2>A little space.<em>Just for you.</em></h2><p>You care for others. You belong in that care.<br>A practical pause for the moment you are in.</p><div class=\"button-row\"><button class=\"button button-teal\" {v0}>Take {v1} {v2}</button><button class=\"button button-quiet\" data-nav=\"practices\">Find my practice ↗</button><button class=\"text-button\" data-adv=\"finder\">Help me choose →</button></div>{v3}</div><div class=\"hero-photo\"><img src=\"{v4}\" alt=\"Illustrative healthcare worker or colleagues in a quiet break space\" width=\"720\" height=\"610\" fetchpriority=\"high\">{v5}<div class=\"photo-caption\">Small pauses.<br>More room to be.<small>SEREIN / HEALTHCARE CROWN ACADEMY</small></div></div></section><div class=\"section-heading\"><div><h2>What would help right now?</h2><p>Start with your situation. There is no perfect choice.</p></div></div><section class=\"moment-grid\" aria-label=\"Your working moment\">{v6}</section><div class=\"recommend-row\"><section class=\"recommended\"><div class=\"recommended-image\"><img src=\"{v7}\" alt=\"{v8}\" loading=\"lazy\">{v9}</div><div class=\"recommended-copy\"><p class=\"eyebrow\">CHOSEN FOR THIS MOMENT</p><h3>{v10}</h3><p>{v11}</p><p class=\"recommend-reason\">{v12} · {v13} · {v14}</p><button class=\"button button-outline\" data-practice=\"{v15}\" data-duration=\"{v16}\">Explore this pause {v17}</button></div></section>{v18}</div><section class=\"action-band\"><div><p class=\"eyebrow\">FROM AWARENESS TO ACTION</p><h3>Put your next step into words.</h3><p>Prepare a useful support conversation, or make a gentler transition home.</p></div><button class=\"button\" data-action=\"work-tools\">Build a conversation {v19}</button></section><div class=\"section-heading\"><div><h2>Support for real working days</h2><p>Small actions. Useful conversations.</p></div><button class=\"text-button\" data-action=\"open-guides\">All guides {v20}</button></div><div class=\"resource-grid home-resources\">{v21}</div>{v22}","copy_0054":"<section class=\"advance-panel\"><h3>Your choices come first.</h3><p>No practice matches your current suggestion preferences. Adjust choices or restore a practice in My space.</p><button class=\"button button-teal\" data-adv=\"finder\">Help me choose →</button></section>","copy_0055":"Any time","copy_0056":"<button class=\"time-chip {v0}\" data-budget=\"{v1}\" aria-pressed=\"{v2}\">{v3}</button>","copy_0057":"Any style","copy_0058":"Without breath focus","copy_0059":"Grounding only","copy_0060":"<option value=\"{v0}\" {v1}>{v2}</option>","copy_0061":"Any comfortable space","copy_0062":"Seated pause","copy_0063":"Without guided movement","copy_0064":"<div class=\"filter-panel\"><div class=\"filter-top\"><div><span class=\"filter-label\">How much time do you have?</span><div class=\"time-chips\">{v0}</div></div><label class=\"search-input\">{v1}<span class=\"sr-only\">Search practices</span><input id=\"practice-query\" type=\"search\" placeholder=\"Find a practice…\" value=\"{v2}\"></label></div><div class=\"filter-lower\"><label>Practice style<select id=\"practice-style\">{v3}</select></label><label>Your setting<select id=\"practice-position\">{v4}</select></label><button class=\"text-button\" data-action=\"reset-filters\">Reset</button></div></div>","copy_0065":"<div class=\"empty\"><h3>A little adjustment?</h3><p>No practice matches all these choices. Try a different duration or explore a self-paced grounding practice.</p><button class=\"button button-teal\" data-action=\"reset-filters\">Explore all practices</button></div>","copy_0066":"<div class=\"result-count\"><span>Showing {v0} of {v1} practices</span><span>Self-paced options have no timer.</span></div><div class=\"practice-grid\">{v2}</div>","copy_0067":"Saved","copy_0068":"{v0} {v1} {v2}","copy_0069":"<div class=\"empty\"><h3>No guides found.</h3><p>Try another word or choose All.</p></div>","copy_0070":"<div class=\"result-count\">{v0} guides to explore</div><div class=\"resource-grid\">{v1}</div>","copy_0071":"PRACTICAL PAUSES / YOUR CHOICE","copy_0072":"Find your next small pause.","copy_0073":"{v0} experiences. Your time, your comfort, your way.","copy_0074":"<button class=\"button button-outline\" data-action=\"routine-builder\">{v0} My routine</button>","copy_0075":"<div class=\"library-tools\"><button class=\"button button-teal\" data-adv=\"finder\">Help me choose →</button><button class=\"text-button\" data-adv=\"journeys-open\">Explore a learning journey →</button></div>","copy_0076":"<button class=\"{v0}\" data-category=\"{v1}\" aria-pressed=\"{v2}\">{v3}</button>","copy_0077":"{v0}<div class=\"category-row\" role=\"group\" aria-label=\"Practice categories\">{v1}</div><div id=\"practice-results\" aria-live=\"polite\">{v2}</div><p class=\"trust-note\">Preference matches, not health recommendations. Practices are optional educational adaptations. You can change the focus, skip, pause, or stop whenever you need.</p>","copy_0078":"Practitioner care","copy_0079":"Shared practice","copy_0080":"Clinical practice","copy_0081":"<button class=\"{v0}\" data-guide-category=\"{v1}\">{v2}</button>","copy_0082":"<div class=\"filter-panel\"><label class=\"search-input\" style=\"display:block;max-width:none\">{v0}<span class=\"sr-only\">Search practical guides</span><input id=\"guide-query\" type=\"search\" placeholder=\"Boundaries, support, rest…\" value=\"{v1}\"></label></div><div class=\"category-row\">{v2}</div><div id=\"guide-results\">{v3}</div>","copy_0083":"<div class=\"segmented\" role=\"group\" aria-label=\"Explore content\"><button class=\"{v0}\" data-tab=\"practices\" aria-pressed=\"{v1}\">Guided practices</button><button class=\"{v2}\" data-tab=\"guides\" aria-pressed=\"{v3}\">Practical guides</button></div>{v4}{v5}","copy_0084":"REFLECTION, WITHOUT JUDGMENT","copy_0085":"What can you set down today?","copy_0086":"One thought. One useful next step. No need to solve the whole day.","copy_0087":"A moment of meaning","copy_0088":"Support I need","copy_0089":"Something to set down","copy_0090":"<button type=\"button\" data-prompt=\"{v0}\">{v1}</button>","copy_0091":"<div class=\"reflect-grid\">{v0}<form class=\"journal-panel\" id=\"journal-form\"><p class=\"eyebrow\">A LITTLE ROOM TO REFLECT</p><h2>Let the words arrive.</h2><p>A small win, a difficult moment, or a support you need. Keep this space free of patient details.</p><div class=\"journal-prompts\">{v1}</div><label class=\"sr-only\" for=\"journal-draft\">Your personal reflection</label><textarea class=\"field\" id=\"journal-draft\" maxlength=\"20000\" placeholder=\"Today, I want to acknowledge…\">{v2}</textarea><p class=\"small-note draft-status\" id=\"journal-draft-status\" role=\"status\">{v3}</p><label class=\"check-label\"><input type=\"checkbox\" name=\"persist\">Save on this browser for another day. Browser storage is not encrypted.</label><div class=\"button-row\"><button class=\"button button-teal\" type=\"submit\">Keep this reflection {v4}</button><button class=\"text-button\" type=\"button\" data-action=\"reflection-history\">My reflections</button></div><p class=\"small-note\">Without saving, entries last for this visit. Nothing is monitored.</p>{v5}</form></div><div class=\"section-heading\"><div><h2>From reflection to a practical step</h2><p>Make a request, clarify a boundary, or leave the day more gently.</p></div></div><div class=\"support-grid\"><section class=\"support-card\">{v6}<h3>Find the words.</h3><p>Describe the situation and turn it into a clear support request.</p><button class=\"text-button\" data-action=\"work-tools\">Conversation builder →</button></section><section class=\"support-card\">{v7}<h3>Leave the day.</h3><p>Make a realistic handover, transition, and recovery plan.</p><button class=\"text-button\" data-action=\"transition-tools\">My transition home →</button></section><section class=\"support-card\">{v8}<h3>Return to your words.</h3><p>Your saved reflections and useful words, together in one place.</p><button class=\"text-button\" data-action=\"reflection-history\">Open my collection →</button></section></div>{v9}","copy_0092":"Saved in browser","copy_0093":"This visit only","copy_0094":"<p>{v0}</p>","copy_0095":"<h3>{v0}</h3><p>{v1}{v2}</p>{v3}","copy_0096":"<button data-edit-journal=\"{v0}\">Edit reflection</button>","copy_0097":"<button data-keep-entry=\"{v0}\" data-entry-type=\"{v1}\">Save in browser</button>","copy_0098":"<article class=\"entry\"><div class=\"entry-head\"><time datetime=\"{v0}\">{v1}</time><span class=\"memory-badge\">{v2}</span></div>{v3}<div class=\"entry-actions\">{v4}<button data-delete-entry=\"{v5}\" data-entry-type=\"{v6}\">Delete</button>{v7}</div></article>","copy_0099":"<div class=\"entries\">{v0}</div>","copy_0100":"<div class=\"empty\"><h3>A space to begin.</h3><p>Your entries will appear here. You can reflect without saving anything.</p><button class=\"button button-teal\" data-nav=\"reflect\">Make room to reflect</button></div>","copy_0101":"{v0} practices · {v1}","copy_0102":"Choose up to four practices. Each starts only when you choose.","copy_0103":"<button class=\"button button-teal\" data-action=\"start-routine\">Begin my routine →</button>","copy_0104":"<article class=\"routine-item\"><span class=\"routine-num\">0{v0}</span><img src=\"{v1}\" alt=\"Illustrative reference\" loading=\"lazy\"><div><h3>{v2}</h3><p>{v3} · {v4}</p></div><div class=\"routine-item-actions\"><button data-routine-move=\"{v5}\" data-direction=\"-1\" {v6} aria-label=\"Move {v7} up\">↑</button><button data-routine-move=\"{v8}\" data-direction=\"1\" {v9} aria-label=\"Move {v10} down\">↓</button><button data-routine-remove=\"{v11}\" aria-label=\"Remove {v12}\">×</button></div></article>","copy_0105":"<div class=\"routine-list\">{v0}</div>","copy_0106":"<section class=\"workspace-tools\"><div><h3>Your own small routine.</h3><p>{v0}</p></div><div class=\"button-row\"><button class=\"button button-outline\" data-action=\"routine-builder\">Build or edit</button>{v1}</div></section>{v2}","copy_0107":" + self-paced time","copy_0108":"{v0}{v1}","copy_0109":"All entries","copy_0110":"Last 7 days","copy_0111":"Last 30 days","copy_0112":"<div class=\"pattern-row\"><span>{v0}</span><div class=\"pattern-track\" aria-hidden=\"true\"><span style=\"width:{v1}%\"></span></div><b>{v2}</b></div>","copy_0113":"<div class=\"pattern-summary\"><div class=\"pattern-stat\"><span>Personal check-ins</span><strong>{v0}</strong><small>In the selected period</small></div><div class=\"pattern-stat\"><span>Words kept</span><strong>{v1}</strong><small>Your reflections</small></div><div class=\"pattern-stat\"><span>Practices saved</span><strong>{v2}</strong><small>Return when useful</small></div></div><div class=\"filter-panel\"><label class=\"field-label\" for=\"date-filter\">Look back over</label><select class=\"field\" id=\"date-filter\">{v3}</select></div><section class=\"pattern-bars\"><h3>Feelings you recorded.</h3><p>Counts of your own entries. Multiple entries on a day count separately; missing days are simply missing data.</p>{v4}</section>{v5}<p class=\"trust-note\">Personal awareness, not a health score or clinical assessment. These entries are not monitored by a care team or employer.</p>","copy_0114":"<section class=\"journal-panel\"><p class=\"eyebrow\">YOUR WORDS. YOUR CHOICE.</p><h2>Keep only what is useful.</h2><p>Practices work without an account. Preferences and collections stay in this browser. A check-in or reflection is kept beyond this visit only when you choose to save it.</p><div class=\"notice\">Browser storage is not encrypted or access-controlled. Others using this browser may be able to read saved entries. Do not include patient-identifying details or sensitive information.</div><div class=\"button-row\"><button class=\"button button-teal\" data-action=\"export\">{v0} Export my data</button><button class=\"button button-outline\" data-action=\"import\">{v1} Import an export</button><button class=\"text-button\" data-action=\"clear-data\">Clear Serein data</button></div><p class=\"small-note\" style=\"margin-top:18px\">Exports contain your words. Keep downloaded files private. An import can merge with existing entries or replace them after your confirmation.</p>{v2}</section>","copy_0115":"<div class=\"practice-grid\">{v0}</div>","copy_0116":"<div class=\"empty\"><h3>A collection that fits you.</h3><p>Save a practice with the bookmark button. Return to it whenever it is useful.</p><button class=\"button button-teal\" data-nav=\"practices\">Explore practices →</button></div>","copy_0117":"<div class=\"resource-grid\">{v0}</div>","copy_0118":"<div class=\"empty\"><h3>Your useful guides.</h3><p>Save a guide from its reading view to keep it here.</p><button class=\"button button-teal\" data-action=\"open-guides\">Explore guides →</button></div>","copy_0119":"<article class=\"entry\"><blockquote style=\"font:italic 26px/1.6 var(--serif)\">{v0}</blockquote><button class=\"text-button\" data-remove-word=\"{v1}\">Remove from collection</button></article>","copy_0120":"<div class=\"empty\"><h3>Words to return to.</h3><p>Save an original Serein reflection from the bottom of a page.</p></div>","copy_0121":"<div class=\"category-row\"><button data-saved-tab=\"practices\" class=\"{v0}\">Practices · {v1}</button><button data-saved-tab=\"guides\" class=\"{v2}\">Guides · {v3}</button><button data-saved-tab=\"words\" class=\"{v4}\">Words · {v5}</button></div>{v6}","copy_0122":"YOUR SMALL COLLECTION OF SUPPORT","copy_0123":"A space that feels like yours.","copy_0124":"Saved practices, useful words, and the patterns you choose to notice.","copy_0125":"My routine","copy_0126":"My patterns","copy_0127":"My data","copy_0128":"<button data-space-tab=\"{v0}\" class=\"{v1}\" aria-pressed=\"{v2}\">{v3}</button>","copy_0129":"<div class=\"segmented\" role=\"group\" aria-label=\"Your collections\">{v0}</div>{v1}","copy_0130":"SUPPORT IS PART OF CARE","copy_0131":"You do not have to hold it alone.","copy_0132":"A practical next step can start with another person.","copy_0133":"<section class=\"support-hero\"><div><p class=\"eyebrow\">HUMAN CONNECTION</p><h2>Ask before<br>you reach your limit.</h2><p>A trusted colleague, supervisor, or occupational health service can help you explore a practical next step.</p><button class=\"button button-teal\" style=\"margin-top:22px\" data-action=\"work-tools\">Prepare a support request {v0}</button></div><figure><img src=\"{v1}\" alt=\"Illustrative colleagues having a supportive conversation\" loading=\"lazy\">{v2}</figure></section><div class=\"support-grid\"><section class=\"support-card\">{v3}<h3>A workplace conversation.</h3><p>Clarify competing demands, ask for help, or agree what can change.</p><button class=\"text-button\" data-resource=\"manager-support\">Practical team support →</button></section><section class=\"support-card\">{v4}<h3>Professional support.</h3><p>If difficulties persist or affect your work or daily life, consider qualified professional support through your usual local service.</p><a class=\"text-button\" href=\"https://www.nhs.uk/nhs-services/mental-health-services/find-nhs-talking-therapies-for-anxiety-and-depression/\" target=\"_blank\" rel=\"noopener noreferrer\">NHS Talking Therapies ↗</a></section><section class=\"support-card\">{v5}<h3>Invite a shared pause.</h3><p>Ask permission, offer a choice, and adapt together. Presentation mode keeps the rest of your space out of view.</p><button class=\"text-button\" data-action=\"shared-practice\">How to present a practice →</button></section></div><p class=\"notice\" style=\"margin-top:24px\">Serein is not monitored and cannot provide urgent care. If there is immediate danger, use local emergency services or the nearest emergency department. Do not wait for a response from this app.</p>{v6}<div class=\"section-heading\"><div><h2>Make the next step practical.</h2><p>Short guides for real working days.</p></div></div><div class=\"resource-grid\">{v7}</div><section class=\"registration-panel\">{v8}<div><p class=\"eyebrow\">HEALTHCARE CROWN ACADEMY</p><h3>Clear information. Thoughtful care.</h3><p>ICO data protection registration ZC273259 · Registered 13 October 2026.<br>Registration identifies the company as a data controller; it is not a certification of this app.</p></div><a class=\"button button-outline\" href=\"https://ico.org.uk/ESDWebPages/Entry/ZC273259\" target=\"_blank\" rel=\"noopener noreferrer\">View public register ↗</a></section>{v9}","copy_0134":"Draft is in memory only. Temporary tab storage is unavailable; keep this tab open.","copy_0135":"Draft kept for this visit","copy_0136":"Drafts are kept in this tab for this visit. Saving an entry for another day is your choice.","copy_0137":"<button data-nav=\"{v0}\" class=\"{v1}\" {v2}>{v3}<span>{v4}</span></button>","copy_0138":"#{v0}","copy_0139":"<button data-action=\"undo\">Undo</button>","copy_0140":"How are you, really?","copy_0141":"<p>An optional personal reflection. Choose a feeling and add only what is useful.</p><form id=\"checkin-form\">{v0}<label class=\"field-label\" for=\"energy\">Your energy</label><select class=\"field\" id=\"energy\" name=\"energy\"><option>Not specified</option><option>Low energy</option><option>Some energy</option><option>Steady energy</option><option>Plenty of energy</option></select><label class=\"field-label\" for=\"checkin-note\">A little context, if useful</label><textarea id=\"checkin-note\" name=\"note\" class=\"field\" maxlength=\"6000\" rows=\"3\" placeholder=\"What is around this feeling? No patient details.\"></textarea><label class=\"check-label\"><input type=\"checkbox\" name=\"persist\">Save on this browser for another day. Browser storage is not encrypted.</label><p class=\"form-error\" id=\"checkin-error\" role=\"alert\"></p><div class=\"button-row\"><button class=\"button button-teal\" type=\"submit\">Keep my check-in {v1}</button><button class=\"button button-quiet\" type=\"button\" data-action=\"close-modal\">Skip for now</button></div>{v2}<p class=\"small-note\">Without saving, it lasts for this visit. No one monitors these entries.</p></form>","copy_0142":"Choose the feeling closest to yours, or skip this check-in.","copy_0143":"Check-in saved in this browser.","copy_0144":"Check-in kept for this visit only.","copy_0145":"<li>{v0}</li>","copy_0146":"Saved · remove","copy_0147":"Save this guide","copy_0148":"<img class=\"article-image\" src=\"{v0}\" alt=\"{v1}\"><span class=\"tag\">{v2} / {v3}</span><p style=\"margin-top:15px\">{v4}</p>{v5}<ol class=\"article-steps\">{v6}</ol><p class=\"notice\">{v7}</p><div class=\"button-row\"><button class=\"button button-teal\" data-save-resource=\"{v8}\" aria-pressed=\"{v9}\">{v10} {v11}</button><button class=\"button button-quiet\" data-action=\"close-modal\">Return to my space</button></div><p class=\"small-note\" style=\"margin-top:20px\">Illustrative · AI-generated editorial image. Educational guidance, not individual treatment.</p>","copy_0149":"Make this space yours.","copy_0150":"Allied health professional","copy_0151":"Healthcare support worker","copy_0152":"Team leader","copy_0153":"<option {v0}>{v1}</option>","copy_0154":"One minute","copy_0155":"Two minutes","copy_0156":"Five minutes","copy_0157":"Open to different practices","copy_0158":"<p>Optional preferences help Serein fit your day. You can change them whenever you like.</p><form id=\"preferences-form\"><label class=\"field-label\" for=\"pref-role\">Your role</label><select class=\"field\" id=\"pref-role\" name=\"role\">{v0}</select><label class=\"field-label\" for=\"pref-time\">Usual time for a pause</label><select class=\"field\" id=\"pref-time\" name=\"time\">{v1}</select><label class=\"field-label\" for=\"pref-style\">Practice preference</label><select class=\"field\" id=\"pref-style\" name=\"style\">{v2}</select><label class=\"setting-row\"><span>Less motion<small>Still visuals and quiet transitions. Your device preference is also respected.</small></span><input name=\"motion\" type=\"checkbox\" {v3}></label><label class=\"setting-row\"><span>3D breathing visual<small>Optional. A still alternative and text guidance are always available.</small></span><input name=\"visual3d\" type=\"checkbox\" {v4}></label><label class=\"setting-row\"><span>Show original reflections<small>Secular Serein words at the end of selected pages.</small></span><input name=\"quotes\" type=\"checkbox\" {v5}></label>{v6}<div class=\"button-row\"><button class=\"button button-teal\" type=\"submit\">Save my preferences</button><button class=\"button button-quiet\" type=\"button\" data-action=\"data-page\">My browser data →</button></div></form>","copy_0159":"<a class=\"source-link\" href=\"{v0}\" target=\"_blank\" rel=\"noopener noreferrer\">{v1} ↗</a>","copy_0160":"<p>Short Serein practices are original educational adaptations, with illustrative imagery and optional timing. They are not copied clinical protocols or clinically validated Serein programs.</p>{v0}<p class=\"notice\">Movement images are AI-generated position illustrations. They are not anatomical standards or prescribed ranges. Choose a comfortable, suitable practice and stop or adapt for discomfort.</p>","copy_0161":"Your data, clearly explained.","copy_0162":"<p>Serein is a personal, browser-local educational workspace. It has no connected care team, patient records, or live monitoring.</p><h3>What is kept</h3><p>Preferences, bookmarks, saved words, and routines are stored in this browser. Check-ins and journal entries are stored beyond this visit only when you choose to save them. Unsaved submitted entries disappear on reload or when this page closes.</p><h3>What “saved” means</h3><p>Browser storage is not encrypted or access-controlled. Someone using the same browser profile may be able to see saved data. Clearing browser data can remove it. Export and import help you keep a copy.</p><h3>Unsubmitted drafts</h3><p>Journal drafts are kept temporarily in this tab’s session storage so a refresh can restore them. This is not encrypted. Submitted entries are kept for another day only when you choose Save on this browser. Clear Serein data also clears the temporary draft.</p><h3>Your control</h3><p>You can edit or delete individual reflections, delete check-ins, export an archive, import an earlier Serein export, or clear this app’s data. Do not enter patient-identifying details or sensitive health information.</p><h3>Practice memory, feedback and learning</h3><p>Remembered practice settings, explicit suggestion choices, journey step marks and plans you explicitly save stay in this browser. Practice feedback is visit-only unless you choose to save it. Saved feedback can influence suggestion order. You can remove responses, reset practice choices, delete plans, reset journeys, or clear all Serein data. Nothing is sent to employers or other people.</p><h3>Offline content and reminders</h3><p>The hosted edition can store app content offline when you choose. Clearing Serein data removes personal records; remove downloaded app content through your browser site-storage controls. Calendar reminders are downloaded files; they activate only after you import them, and you manage or delete them in your calendar.</p><h3>Media and voice</h3><p>Photographs and fonts are included with the app. Optional browser voice guidance uses a local voice only; it remains off if none is available. External reference links open third-party websites.</p><h3>Who provides Serein</h3><p>HEALTHCARE CROWN ACADEMY LTD · Company no. 17501904 · 71–75 Shelton Street, Covent Garden, London WC2H 9JQ. ICO data protection registration ZC273259, as supplied in the company brand kit.</p><p class=\"notice\">ICO registration is not an accreditation, a certification of this app, or a claim that browser storage is encrypted.</p><div class=\"button-row\"><button class=\"button button-teal\" data-action=\"data-page\">Manage my data</button><button class=\"button button-outline\" data-action=\"export\">Export my data</button></div>","copy_0163":"Find the words for support.","copy_0164":"A gentler transition home.","copy_0165":"What is happening?","copy_0166":"Several tasks need attention at once","copy_0167":"What support would help?","copy_0168":"Help agreeing priorities","copy_0169":"What next step could you suggest?","copy_0170":"A short check-in with the shift lead","copy_0171":"One agreed handover or next owner","copy_0172":"Confirm outstanding work in the approved system","copy_0173":"One transition action","copy_0174":"Change clothes and take a quiet moment","copy_0175":"One recovery support","copy_0176":"A meal, rest, or a trusted conversation","copy_0177":"<label class=\"field-label\" for=\"work-{v0}\">{v1}</label><input class=\"field\" id=\"work-{v2}\" name=\"field{v3}\" maxlength=\"600\" placeholder=\"{v4}\" required>","copy_0178":"<p>Prepare a practical next step. Your draft is temporary until you copy it. Keep it free of patient details.</p><div class=\"segmented\"><button data-tool-mode=\"conversation\" class=\"{v0}\">Support conversation</button><button data-tool-mode=\"transition\" class=\"{v1}\">Transition home</button></div><form id=\"work-form\" data-mode=\"{v2}\">{v3}<div class=\"button-row\"><button type=\"submit\" class=\"button button-teal\">Build my draft {v4}</button></div></form><label class=\"field-label\" for=\"work-output\">Your editable draft</label><textarea id=\"work-output\" class=\"field\" rows=\"5\"></textarea><button class=\"text-button\" data-action=\"copy-draft\">Copy my draft →</button><p class=\"small-note\" id=\"copy-note\" role=\"status\">Edit the draft so it sounds like you.</p>","copy_0179":"Build your own small routine.","copy_0180":"<label class=\"routine-option\"><input type=\"checkbox\" name=\"practice\" value=\"{v0}\" {v1}><span><strong>{v2}</strong><small>{v3} · {v4}</small></span></label>","copy_0181":"<p>Choose one to four practices. Each one starts only when you choose. You can reorder your routine in My space.</p><form id=\"routine-form\"><div class=\"routine-builder\">{v0}</div><p id=\"routine-error\" class=\"form-error\" role=\"alert\"></p><div class=\"button-row\"><button class=\"button button-teal\" type=\"submit\">Save my routine</button><button class=\"button button-quiet\" type=\"button\" data-action=\"close-modal\">Keep exploring</button></div></form>","copy_0182":"Your routine has ended. Take what is useful into your day.","copy_0183":"Entry removed.","copy_0184":"Entry restored.","copy_0185":"Personal Serein data. Keep this file private.","copy_0186":"Export prepared. Keep the downloaded file private.","copy_0187":"Archive restored.","copy_0188":"Archive merged with your existing entries.","copy_0189":"{v0} {v1}","copy_0190":"<button class=\"search-result\" data-search-practice=\"{v0}\"><img src=\"{v1}\" alt=\"\"><span><strong>{v2}</strong><small>{v3} · {v4}</small></span><span>↗</span></button>","copy_0191":"<p class=\"search-group-label\">GUIDED PRACTICES</p>{v0}","copy_0192":"<button class=\"search-result\" data-search-resource=\"{v0}\"><img src=\"{v1}\" alt=\"\"><span><strong>{v2}</strong><small>{v3}</small></span><span>↗</span></button>","copy_0193":"<p class=\"search-group-label\">PRACTICAL GUIDES</p>{v0}","copy_0194":"<div class=\"empty\"><h3>No matches yet.</h3><p>Try breathing, grounding, support, or boundaries.</p></div>","copy_0195":"Practice saved to My space.","copy_0196":"Practice removed from saved.","copy_0197":"SEREIN / ROUTINE {v0} OF {v1}","copy_0198":"SEREIN / WATCH FIRST","copy_0199":"SEREIN / YOUR PRACTICE","copy_0200":"Finish my routine →","copy_0201":"Next in my routine →","copy_0202":"4 seconds per phase","copy_0203":"In 4 · out 6","copy_0204":"3 seconds per phase","copy_0205":"In 3 · out 3","copy_0206":"5 seconds per phase","copy_0207":"In 5 · out 5","copy_0208":"<label class=\"check-label\"><input type=\"checkbox\" id=\"session-noholds\">No holds · continuous breathing</label>","copy_0209":"<label class=\"field-label\" for=\"session-pace\">Comfortable pace</label><select class=\"field\" id=\"session-pace\"><option value=\"4-6\">{v0}</option><option value=\"3-3\">{v1}</option><option value=\"5-5\">{v2}</option></select>{v3}","copy_0210":"<label class=\"check-label\"><input type=\"checkbox\" id=\"session-relax\">Relax only · no guided movement</label>","copy_0211":"<option value=\"orb\" {v0}>3D breathing visual</option>","copy_0212":"<option value=\"map\">Body attention map</option>","copy_0213":"<label class=\"field-label\" for=\"session-duration\">Session length</label><select class=\"field\" id=\"session-duration\" {v0}>{v1}</select>{v2}<label class=\"check-label\"><input type=\"checkbox\" id=\"session-external\">Use external focus instead</label>{v3}<label class=\"check-label\"><input type=\"checkbox\" id=\"session-motion\" {v4} {v5}>Less motion</label><label class=\"check-label\"><input type=\"checkbox\" id=\"session-voice\">Voice guide · spoken instructions</label><label class=\"field-label\" for=\"session-visual\">Visual view</label><select class=\"field\" id=\"session-visual\"><option value=\"photo\" {v6}>Illustrative photographs</option>{v7}<option value=\"text\">Text focus</option>{v8}</select><p class=\"small-note\">Pause to change timing. Voices come from your device or browser.</p>","copy_0214":"Remove saved practice","copy_0215":"Save practice","copy_0216":"{v0}-{v1}-{v2}-{v3}-{v4}","copy_0217":"A MOMENT, WITHOUT A TARGET","copy_0218":"FOLLOW AT A COMFORTABLE PACE","copy_0219":"STEP {v0} OF {v1}","copy_0220":"Illustrative, AI-generated position reference: {v0}","copy_0221":"Illustrative, AI-generated landscape","copy_0222":"Your pace. Your pause.","copy_0223":"{v0} / {v1} · {v2}","copy_0224":"<button data-player-step=\"","copy_0225":"<button data-noticed=\"","copy_0226":"\" aria-label=\"Notice item ","copy_0227":"{v0} / {v1}","copy_0228":"{v0} elapsed of {v1}","copy_0229":"Practice again","copy_0230":"Continue","copy_0231":"Pause","copy_0232":"Play preview","copy_0233":"Resume","copy_0234":"Begin practice","copy_0235":"<span>{v0}</span>","copy_0236":"Take what is useful into the rest of your day.","copy_0237":"Paused. Breathe naturally. Return when ready.","copy_0238":"Preview only. Follow along only if suitable.","copy_0239":"Put the screen away before walking.","copy_0240":"Stop or adapt if uncomfortable. Nothing is monitored.","copy_0241":"Optional visual · Follow your own pace","copy_0242":"Illustrative · AI-generated","copy_0243":"<div class=\"box-track\"><i class=\"box-edge edge-top\"></i><i class=\"box-edge edge-right\"></i><i class=\"box-edge edge-bottom\"></i><i class=\"box-edge edge-left\"></i><i class=\"box-marker\"></i><div class=\"box-center\"><strong></strong><span></span><small></small></div></div>","copy_0244":"Complete","copy_0245":"Follow your comfortable pace","copy_0246":"Paused","copy_0247":"Rest naturally","copy_0248":"Press Begin to start","copy_0249":"A local English voice is unavailable. Text guidance remains available.","copy_0250":"Voice is unavailable. Follow the text guidance.","copy_0251":"Reflection saved to My space.","copy_0252":"Reflection removed.","copy_0253":"Build or write your draft first.","copy_0254":"Draft copied.","copy_0255":"Select and copy the highlighted draft.","copy_0256":"Start with a clear space?","copy_0257":"<p>This removes Serein’s saved and visit-only entries, temporary journal draft, preferences, bookmarks, and routine from this browser. It does not affect other websites.</p><div class=\"notice\">Export anything you want to keep before clearing.</div><div class=\"button-row\"><button class=\"button button-outline\" data-action=\"export\">Export first</button><button class=\"button button-navy\" data-action=\"confirm-clear\">Clear my Serein data</button><button class=\"text-button\" data-action=\"close-modal\">Keep my data</button></div>","copy_0258":"Serein data cleared from this browser.","copy_0259":"A little space for human care.","copy_0260":"<p>Serein is a well-being studio by Healthcare Crown Academy. It brings together brief optional practices, personal reflection, and practical working-day support.</p><h3>Your pace. Your choice.</h3><p>{v0} guided experiences include breathing, grounding, awareness, gentle movement, and visualization. Six interactive studios and three flexible learning journeys connect personal practice with practical support. You can use text, illustrative photographs, optional 3D, and available local voice guidance.</p><p class=\"notice\">Educational practices, not individual medical treatment, clinical assessment, or emergency support. No professional accreditation or affiliation is implied.</p><p>By HEALTHCARE CROWN ACADEMY LTD · Company no. 17501904.</p>","copy_0261":"Make it an invitation, together.","copy_0262":"<ol><li>Ask permission and offer a genuine choice.</li><li>Choose a suitable practice and adapt to the person’s needs.</li><li>Use Present in the player. Your personal workspace is hidden behind an opaque backdrop.</li><li>Offer external focus, less motion, and skipping. A neutral response is valid.</li></ol><p class=\"notice\">Do not enter patient details. This is a shared educational prompt, not an assessment or clinical record.</p><div class=\"button-row\"><button class=\"button button-teal\" data-practice=\"ground\">Explore shared grounding →</button></div>","copy_0263":"That action could not finish. Your existing entries are kept.","copy_0264":"Your current draft is kept. Clear it to choose a new prompt.","copy_0265":"One moment I want to acknowledge today is…","copy_0266":"One support I would like to ask for is…","copy_0267":"One thing I can hand over or set down is…","copy_0268":"Keep this entry in your browser?","copy_0269":"<p>Browser storage is not encrypted or access-controlled. Others using this browser may be able to access it.</p><div class=\"button-row\"><button class=\"button button-teal\" data-confirm-keep=\"{v0}\" data-entry-type=\"{v1}\">Save in this browser</button><button class=\"text-button\" data-action=\"close-modal\">This visit only</button></div>","copy_0270":"Your reflection, in your words.","copy_0271":"Saved in this browser.","copy_0272":"Kept for this visit only.","copy_0273":"<form id=\"edit-journal-form\"><label class=\"sr-only\" for=\"edit-journal\">Edit reflection</label><textarea id=\"edit-journal\" class=\"field\" name=\"text\" maxlength=\"20000\" rows=\"8\">{v0}</textarea><p class=\"small-note\">{v1}</p><div class=\"button-row\"><button class=\"button button-teal\" type=\"submit\">Keep my changes</button><button class=\"text-button\" type=\"button\" data-action=\"close-modal\">Cancel</button></div></form>","copy_0274":"Your preferences are saved in this browser.","copy_0275":"Write a thought first, however small.","copy_0276":"Reflection saved in this browser.","copy_0277":"Reflection kept for this visit only.","copy_0278":"A reflection needs at least a few words.","copy_0279":"Reflection updated.","copy_0280":"Choose one to four practices.","copy_0281":"Your routine is ready.","copy_0282":"I would like to discuss this situation: {v0}.\n\nThe support that would help is: {v1}.\n\nCould we agree this next step: {v2}?","copy_0283":"Before leaving: {v0}.\n\nMy transition: {v1}.\n\nMy recovery support: {v2}.","copy_0284":"Draft ready. Edit the words so they sound like you.","copy_0285":"Choose a Serein JSON export smaller than 8 MB.","copy_0286":"Restore your Serein archive.","copy_0287":"<p>This file contains {v0} check-ins, {v1} reflections, and {v2} saved practices, plus {v3} feedback responses and {v4} plans.</p><div class=\"notice\">Merge keeps your existing entries. Replace removes the current Serein data and restores this archive.</div><div class=\"button-row\"><button class=\"button button-teal\" data-action=\"import-merge\">Merge with my data</button><button class=\"button button-outline\" data-action=\"import-replace\">Replace with this archive</button><button class=\"text-button\" data-action=\"close-modal\">Cancel</button></div>","copy_0288":"That file could not be read. Choose a Serein JSON export.","copy_0289":"Saved data could not be read and has been kept unchanged. Open Me → Data & privacy to download a recovery copy.","copy_0290":"Earlier Serein entries are available in My space.","copy_0291":"No change","copy_0292":"<a class=\"source-link\" href=\"{v0}\" target=\"_blank\" rel=\"noopener noreferrer\">{v1} ↗<small>{v2}</small></a>","copy_0293":"Extra large","copy_0294":"<fieldset class=\"comfort-fields\"><legend>Read comfortably</legend><label class=\"field-label\" for=\"pref-reading\">Text size</label><select id=\"pref-reading\" class=\"field\" name=\"readingSize\">{v0}</select><label class=\"field-label\" for=\"pref-theme\">Appearance</label><select id=\"pref-theme\" class=\"field\" name=\"theme\"><option value=\"light\">HCA ivory</option><option value=\"night\" {v1}>HCA navy night</option></select><label class=\"check-label\"><input type=\"checkbox\" name=\"readingWidth\" {v2}>Comfortable reading width</label><label class=\"check-label\"><input type=\"checkbox\" name=\"focus\" {v3}>Low-distraction layout · simplify decorative content</label></fieldset>","copy_0295":"this moment","copy_0296":"Fits {v0}","copy_0297":"{v0} within your time","copy_0298":"gentle movement","copy_0299":"marked helpful for you","copy_0300":"<button class=\"choice-card {v0}\" data-adv=\"finder-moment\" data-value=\"{v1}\" aria-pressed=\"{v2}\"><strong>{v3}</strong><span>{v4}</span></button>","copy_0301":"<p class=\"studio-question\">What is happening around this pause?</p><div class=\"choice-grid\">{v0}</div>","copy_0302":"My own pace","copy_0303":"No countdown","copy_0304":"A short, optional pause","copy_0305":"<button class=\"choice-card {v0}\" data-adv=\"finder-time\" data-value=\"{v1}\" aria-pressed=\"{v2}\"><strong>{v3}</strong><span>{v4}</span></button>","copy_0306":"<p class=\"studio-question\">How much time is available?</p><div class=\"choice-grid\">{v0}</div>","copy_0307":"<p class=\"studio-question\">What would feel comfortable?</p><label class=\"field-label\" for=\"finder-style\">Attention focus</label><select class=\"field\" id=\"finder-style\"><option value=\"any\">Open to different practices</option><option value=\"nonbreath\" {v0}>Without breath focus</option><option value=\"ground\" {v1}>Grounding only</option></select><label class=\"field-label\" for=\"finder-position\">Movement</label><select class=\"field\" id=\"finder-position\"><option value=\"any\">Any suitable practice</option><option value=\"seated\" {v2}>Seated practices</option><option value=\"still\" {v3}>Without guided movement</option></select><label class=\"check-label\"><input id=\"finder-silent\" type=\"checkbox\" {v4}>Keep this pause silent</label><p class=\"small-note\">These choices apply to this search. Your usual preferences stay available.</p>","copy_0308":"Show my choices","copy_0309":"{v0}{v1}<div class=\"studio-footer\"><button class=\"button button-quiet\" data-adv=\"finder-back\" {v2}>Back</button><button class=\"button button-teal\" data-adv=\"finder-next\">{v3} →</button></div>","copy_0310":"<article class=\"finder-result\"><span class=\"result-number\">0{v0}</span><div><h3>{v1}</h3><p>{v2}</p><p class=\"match-reason\">{v3}</p><div class=\"button-row\"><button class=\"button button-teal\" data-adv=\"finder-start\" data-id=\"{v4}\">Explore {v5} →</button><button class=\"text-button\" data-adv=\"evidence\" data-id=\"{v6}\">About this practice</button></div></div></article>","copy_0311":"<div class=\"empty\"><h3>No match for these choices.</h3><p>You can adjust the choices or restore a practice you previously excluded in My space.</p></div>","copy_0312":"<p class=\"eyebrow\">YOUR CHOICES / {v0}</p><p>Preference matches with a clear reason. Choose, adapt or leave any practice.</p><div class=\"finder-results\">{v1}</div><div class=\"button-row\"><button class=\"button button-outline\" data-adv=\"finder-back\">Adjust choices</button><button class=\"text-button\" data-adv=\"preferences-open\">Manage practice choices →</button></div>","copy_0313":"Find a pause that fits.","copy_0314":"<div class=\"studio-meter\"><span>STEP {v0} OF {v1}</span><div class=\"meter-track\"><span style=\"width:{v2}%\"></span></div></div>","copy_0315":"Continue my journey","copy_0316":"Explore this journey","copy_0317":"<section class=\"advance-launch\"><div><p class=\"eyebrow\">A PERSONAL PATH THROUGH YOUR DAY</p><h2>Start with what you need.</h2><p>Three small choices. One practice with a clear reason.</p></div><button class=\"button button-teal\" data-adv=\"finder\">Help me choose {v0}</button></section><div class=\"section-heading\"><div><h2>Put support into practice</h2><p>Rehearse, prepare and make your next step concrete.</p></div><button class=\"text-button\" data-adv=\"studios-open\">All six studios →</button></div><div class=\"studio-grid compact\">{v1}</div><section class=\"journey-invitation\"><div><p class=\"eyebrow\">LEARN AT YOUR OWN PACE</p><h3>{v2}</h3><p>{v3}</p></div><button class=\"button button-outline\" data-adv=\"journey\" data-id=\"{v4}\">{v5} →</button></section>","copy_0318":"guided steps","copy_0319":"An editorial count of this practice’s steps, not a measured health outcome.","copy_0320":"Why choose it?","copy_0321":"When might it fit?","copy_0322":"How to use it","copy_0323":"Who chooses?","copy_0324":"You decide whether it is suitable. {v0}","copy_0325":"<section><h4>{v0}</h4><p>{v1}</p></section>","copy_0326":"<section class=\"evidence-intro\"><p class=\"eyebrow\">WHAT / WHY / WHEN / HOW / WHO</p><h3>{v0}</h3><p>{v1}</p></section><div class=\"evidence-grid\">{v2}</div><div class=\"fact-card\"><strong>{v3}</strong><div><h4>{v4}</h4><p>{v5}</p></div></div><h4 class=\"source-heading\">Background & scope</h4>{v6}<p class=\"small-note\">Source mapping updated {v7}. Original educational adaptation; not a clinically validated Serein program. Images are illustrative. You can pause, adapt or stop.</p>","copy_0327":"Understand this practice.","copy_0328":"<div class=\"button-row\"><button class=\"button button-teal\" data-practice=\"{v0}\">Open practice →</button></div>","copy_0329":"<button type=\"button\" class=\"text-button practice-info\" data-adv=\"evidence\" data-id=\"{v0}\" aria-label=\"About {v1}\">About this practice {v2}</button>","copy_0330":"<button data-adv=\"feedback\" data-value=\"{v0}\" aria-pressed=\"false\">{v1}</button>","copy_0331":"Not settled","copy_0332":"A little settled","copy_0333":"Somewhat settled","copy_0334":"Very settled","copy_0335":"<option value=\"{v0}\">{v1} · {v2}</option>","copy_0336":"More often","copy_0337":"Try another time","copy_0338":"Do not suggest","copy_0339":"<button class=\"button button-outline\" data-adv=\"practice-choice\" data-id=\"{v0}\" data-value=\"{v1}\">{v2}</button>","copy_0340":"<p class=\"eyebrow\">JUST NOTICE</p><h3>How was that for you?</h3><p>No particular response is required. You choose whether to keep feedback.</p><div class=\"feedback-choices\">{v0}</div><label class=\"field-label\" for=\"session-after\">Optional: how settled do you feel now?</label><select id=\"session-after\" class=\"field\"><option value=\"\">Skip</option>{v1}</select><label class=\"check-label\"><input type=\"checkbox\" id=\"feedback-save\">Save this feedback for personal insights in this browser</label><p class=\"small-note\">Saved feedback is not encrypted. Without saving it lasts for this visit. Personal observations are not clinical scores.</p><p id=\"feedback-note\" role=\"status\"></p><div class=\"practice-preference-actions\"><span>Suggest this practice:</span>{v2}</div>","copy_0341":"Your saved practice settings have been applied. Voice remains off until enabled.","copy_0342":"Options are temporary unless you choose to remember them.","copy_0343":"<label class=\"field-label\" for=\"session-before\">Optional: how settled do you feel before starting?</label><select id=\"session-before\" class=\"field\"><option value=\"\">Skip</option>{v0}</select><label class=\"check-label\"><input type=\"checkbox\" id=\"session-remember\" {v1}>Remember timing, visual and comfort options for this practice</label><p id=\"memory-status\" class=\"small-note\">{v2}</p>","copy_0344":"<label class=\"check-label\"><input type=\"checkbox\" id=\"session-chime\" {v0}>Gentle phase-change tone · optional local audio</label>","copy_0345":"These practice options are remembered in this browser.","copy_0346":"Practice options are temporary.","copy_0347":"Stop or choose another focus. Human support may be more useful. There is no need to continue. ","copy_0348":"Thank you for noticing. ","copy_0349":"Saved in this browser for your insights.","copy_0350":"Removed from recommendations. You can restore it in My space.","copy_0351":"Serein will give other practices priority.","copy_0352":"This practice will be given more priority when it fits.","copy_0353":"Not suggested","copy_0354":"Given more priority","copy_0355":"Usual suggestion priority","copy_0356":" · Comfort options remembered","copy_0357":"<div><span><strong>{v0}</strong><small>{v1}{v2}</small></span><button class=\"text-button\" data-adv=\"restore-practice\" data-id=\"{v3}\">Reset choices & memory</button></div>","copy_0358":"<p>No practice choices or comfort options saved yet.</p>","copy_0359":"<section class=\"advance-panel\"><div class=\"section-heading\"><div><h2>Your practice choices</h2><p>Excluded practices remain accessible in the catalogue. You can restore suggestions here.</p></div></div><div class=\"preference-list\">{v0}</div></section>","copy_0360":"<i class=\"feedback-segment s{v0}\" style=\"width:{v1}%\"></i>","copy_0361":"<div><span>{v0}</span><div class=\"feedback-bar\" role=\"img\" aria-label=\"{v1}: {v2} helpful, {v3} no change, {v4} uncomfortable out of {v5} responses\">{v6}</div><b>{v7}</b></div>","copy_0362":"<div class=\"feedback-bars\">{v0}</div><p class=\"chart-legend\"><span>● Helpful</span><span>● No change</span><span>● Uncomfortable</span></p>","copy_0363":"<div class=\"empty\"><h3>Your experience will appear here.</h3><p>After a practice, choose optional feedback. Saving is always your choice.</p></div>","copy_0364":"<p class=\"notice\">Of {v0} paired observations: {v1} felt more settled, {v2} the same, and {v3} less settled. These observations cannot establish that a practice caused a change.</p>","copy_0365":"<p class=\"insight-sentence\">{v0} response{v1} marked helpful {v2}. {v3}.</p>","copy_0366":"This visit","copy_0367":"<article><div><strong>{v0} · {v1}</strong><small>{v2} · {v3} · {v4}</small></div><button class=\"text-button\" data-adv=\"delete-feedback\" data-id=\"{v5}\">Remove</button></article>","copy_0368":"<p>No responses for this period.</p>","copy_0369":"<section class=\"advance-panel\"><p class=\"eyebrow\">YOUR EXPERIENCE / YOUR INTERPRETATION</p><h2>What you chose to notice.</h2><p class=\"section-description\">Feedback from the selected period. Visit-only entries are included until reload; {v0} of {v1} are saved. Missing entries are unknown.</p><div class=\"insight-stats\"><div><strong>{v2}</strong><span>responses recorded</span></div><div><strong>{v3}</strong><span>marked helpful</span></div><div><strong>{v4}</strong><span>optional before/after pairs</span></div></div>{v5}{v6}{v7}<details class=\"feedback-history\"><summary>Explore or remove individual responses ({v8})</summary>{v9}</details><p class=\"small-note\">The charts describe your entries. They are not health assessments, treatment outcomes or employer reports.</p></section>{v10}","copy_0370":"<article class=\"studio-card\"><div class=\"studio-card-top\"><span class=\"studio-glyph\">{v0}</span><span class=\"tag\">{v1}</span></div><h3>{v2}</h3><p>{v3}</p><p class=\"studio-when\"><strong>When to use:</strong> {v4}</p><div class=\"studio-card-bottom\"><span>{v5} steps · Your pace</span><button type=\"button\" class=\"text-button context-detail-link\" data-context-open=\"studio:{v6}\" aria-haspopup=\"dialog\" aria-controls=\"serein-context-panel\" aria-expanded=\"false\">How it works</button><button class=\"button button-teal\" data-adv=\"studio\" data-id=\"{v7}\">Enter studio →</button></div></article>","copy_0371":"<header class=\"page-header\"><div><p class=\"eyebrow\">SEREIN / INTERACTIVE STUDIOS</p><h1>Make the next step real.</h1><p class=\"page-sub\">Six practical spaces to rehearse, prepare and take action. Drafts stay temporary unless you explicitly save a plan.</p></div></header><section class=\"studio-hero\"><div><p class=\"eyebrow\">FROM PERSONAL PAUSES TO PRACTICAL SUPPORT</p><h2>Find words.<br>Make room.<br><em>Change one thing.</em></h2><p>Choose a studio around the moment you are in. No patient information is needed.</p></div><div class=\"evidence-feature\"><strong>6</strong><h3>actions for healthier workplaces</h3><p>NIOSH’s 2024 Impact Wellbeing Guide sets out six evidence-informed organizational actions. These six Serein studios are original educational tools, not the guide’s six actions.</p><a href=\"{v0}\" target=\"_blank\" rel=\"noopener noreferrer\">Read the source & scope ↗</a></div></section><div class=\"studio-grid\">{v1}</div>{v3}","copy_0372":"<label class=\"field-label\" for=\"studio-field-{v0}\">{v1}</label>","copy_0373":"<input type=\"date\" class=\"field\" id=\"studio-field-{v0}\" data-studio-field=\"{v1}\" value=\"{v2}\">","copy_0374":"<textarea rows=\"2\" class=\"field\" id=\"studio-field-{v0}\" data-studio-field=\"{v1}\" maxlength=\"1200\" placeholder=\"{v2}\">{v3}</textarea>","copy_0375":"<button class=\"text-button\" data-adv=\"studio-save\">Save this plan in this browser</button>","copy_0376":"<button class=\"button button-outline\" data-adv=\"team-present\">Open shared presentation →</button>","copy_0377":"<button class=\"button button-outline\" data-practice=\"ground\">Open a grounding pause →</button>","copy_0378":"<div class=\"result-heading\"><span class=\"studio-glyph\">{v0}</span><div><p class=\"eyebrow\">A PRACTICAL NEXT STEP</p><h3>{v1}</h3></div></div><label class=\"field-label\" for=\"studio-output\">Edit this so it sounds like you</label><textarea class=\"field studio-output\" id=\"studio-output\" rows=\"10\" maxlength=\"12000\">{v2}</textarea><div class=\"button-row\"><button class=\"button button-teal\" data-adv=\"studio-copy\">Copy my {v3}</button><button class=\"button button-outline\" data-adv=\"studio-download\">Download text</button>{v4}{v5}{v6}</div><p id=\"studio-result-status\" class=\"small-note\" role=\"status\">Draft stays temporary. Nothing is sent to anyone. Keep names and patient details out of this space.</p>","copy_0379":"<label class=\"field-label\" for=\"boundary-scenario\">A situation to rehearse</label><select class=\"field\" id=\"boundary-scenario\">{v0}</select><p class=\"scenario-context\">{v1}</p><p class=\"notice\">Use your professional responsibilities and workplace processes to guide real decisions.</p>","copy_0380":"<span class=\"response-rationale\">{v0}</span>","copy_0381":"<button class=\"choice-card {v0}\" data-adv=\"boundary-response\" data-value=\"{v1}\" aria-pressed=\"{v2}\"><strong>{v3}</strong>{v4}</button>","copy_0382":"<p class=\"studio-question\">{v0}</p><div class=\"response-options\">{v1}</div><p class=\"small-note\">A rehearsal with explanatory feedback, not a competence assessment.</p>","copy_0383":"Practical help","copy_0384":"Clarify responsibilities or available support.","copy_0385":"A quiet pause","copy_0386":"Choose an outward focus, without retelling the event.","copy_0387":"Human connection","copy_0388":"Prepare a conversation with someone trusted.","copy_0389":"<button class=\"choice-card {v0}\" data-adv=\"difficult-choice\" data-value=\"{v1}\" aria-pressed=\"{v2}\"><strong>{v3}</strong><span>{v4}</span></button>","copy_0390":"<p class=\"studio-question\">Which kind of support would you choose?</p><div class=\"choice-grid\">{v0}</div><p class=\"notice\">You do not have to describe what happened. If immediate safety is at issue, use your workplace escalation or usual urgent-care route.</p>","copy_0391":"<p class=\"notice\">You can change your mind, decline reflection, or choose qualified support. Serein is not monitored.</p>","copy_0392":"<p class=\"notice\">Participation is optional. Offer observing, external focus, skipping and leaving without explanation.</p>","copy_0393":"<label class=\"field-label\" for=\"team-practice\">Shared practice</label><select class=\"field\" id=\"team-practice\">{v0}</select><label class=\"field-label\" for=\"team-duration\">Available time</label><select id=\"team-duration\" class=\"field\">{v1}</select><p class=\"small-note\">Grounding is self-paced. Other choices use the selected time.</p>","copy_0394":"<label class=\"check-label\"><input type=\"checkbox\" id=\"team-external\" {v0}>Use an external-focus cue throughout</label><p>Shared presentation starts in text view, with sound off, reduced motion and no breath holds. Participants may adapt or sit out.</p>{v1}","copy_0395":"<section class=\"studio-intro\"><p>{v0}</p><p><strong>Use it:</strong> {v1}</p><p><strong>Your choice:</strong> {v2}</p></section>","copy_0396":"Build my draft","copy_0397":"<button class=\"button button-teal\" data-adv=\"studio-next\">{v0} →</button>","copy_0398":"<button class=\"button button-quiet\" data-action=\"close-modal\">Finish for now</button>","copy_0399":"{v0}{v1}<div class=\"studio-step-title\"><span class=\"tag\">{v2}</span><h3>{v3}</h3></div>{v4}<div class=\"studio-footer\"><button class=\"button button-quiet\" data-adv=\"studio-back\" {v5}>Back</button>{v6}</div><details class=\"studio-about\"><summary>Background & sources</summary><p>{v7} {v8}</p><p><strong>When:</strong> {v9}</p><p><strong>Who:</strong> {v10}</p>{v11}<p class=\"small-note\">Original educational tool. No automatic sending, reporting, clinical assessment or supervision.</p></details>","copy_0400":"Situation: {v0}\n\nI want to help within the priorities we agree. {v1}\n\nCould we agree: {v2}\n\nA check-back could be: {v3}\n\nAdapt this to the role, urgency and workplace process.","copy_0401":"I would like to discuss: {v0}\n\nThe impact on my work is: {v1}\n\nThe support I would like to request is: {v2}\n\nCould we discuss this with: {v3}\n\nA possible next step: {v4}\n\nProposed review: {v5}","copy_0402":"MY SHIFT TRANSITION\n\n□ Confirm through the approved handover: {v0}\n□ Leave for the agreed next opportunity: {v1}\n□ My transition action: {v2}\n□ Make it easier by: {v3}\n□ My recovery support: {v4}\n□ Support available: {v5}\n\nThis personal prompt does not replace handover or workplace records.","copy_0403":"ONE NEXT STEP\n\nMy chosen focus: {v0}\n\nPractical support: {v1}\nA person or service I could contact: {v2}\nWhen I could take this step: {v3}\n\nI can choose a different step or qualified support. No event details or disclosure are required.","copy_0404":"External-focus cues selected.","copy_0405":"OPTIONAL TEAM PAUSE\n\nOpening: {v0}\n\nPractice: {v1}\nTiming: {v2}\n\nOptions: observe, skip, keep eyes open, use external focus, or leave. Sound off, reduced motion, text-first presentation. {v3}\n\nClosing: {v4}\n\nDo not ask participants to disclose private experiences. Nothing is monitored or assessed.","copy_0406":"Agree a review date","copy_0407":"WORKING CONDITIONS ACTION PLAN\n\nBarrier: {v0}\nDesired improvement: {v1}\nProposed change: {v2}\nHow we will notice it happened: {v3}\nProposed owner (to be agreed): {v4}\nProposed review: {v5}\n\nUse appropriate workplace approval and escalation. This app does not assign tasks or notify the proposed owner.","copy_0408":"<details class=\"saved-plan\"><summary>{v0} · {v1}</summary><pre>{v2}</pre><button class=\"text-button\" data-adv=\"delete-plan\" data-id=\"{v3}\">Delete this plan</button></details>","copy_0409":"<p>A Working Conditions plan can be saved explicitly from its result screen.</p>","copy_0410":"<section class=\"advance-panel\"><div class=\"section-heading\"><div><h2>Plans you chose to keep</h2><p>Saved in this browser without encryption. No plan is sent or monitored.</p></div></div>{v0}</section>","copy_0411":"nature scene","copy_0412":"Begin exploring","copy_0413":"<article class=\"journey-card\"><img src=\"{v0}\" alt=\"Illustrative {v1}\" loading=\"lazy\"><div><p class=\"eyebrow\">5 STEPS / FLEXIBLE ORDER</p><h2>{v2}</h2><p>{v3}</p><details class=\"journey-outline\"><summary>View the five steps</summary><ol>{v4}</ol></details><progress max=\"5\" value=\"{v5}\" aria-label=\"{v6}: {v7} of 5 steps marked complete\"></progress><small>{v8} of 5 marked complete</small><button class=\"button button-teal\" data-adv=\"journey\" data-id=\"{v9}\">{v10} →</button></div></article>","copy_0414":"<header class=\"page-header\"><div><p class=\"eyebrow\">LEARN / TRY / REFLECT / APPLY</p><h1>Small steps. Your own pace.</h1><p class=\"page-sub\">Three flexible learning journeys. Fifteen short lessons. Your place is remembered without streaks or deadlines.</p></div></header><div class=\"journey-grid\">{v0}</div><section class=\"advance-panel\"><h3>Learning that leaves room for life.</h3><p>You decide when a step is complete. Skipping or returning is welcome. This is educational progress, without accreditation or clinical assessment.</p><button class=\"text-button\" data-adv=\"journey-reset-all\">Reset learning progress</button></section>","copy_0415":", marked complete","copy_0416":"<button data-adv=\"journey-step\" data-value=\"{v0}\" class=\"{v1}\" aria-label=\"{v2}. {v3}{v4}\" {v5}>{v6}</button>","copy_0417":"<p class=\"notice\">{v0}</p>","copy_0418":"<button class=\"button button-outline\" data-practice=\"{v0}\">Try {v1} →</button>","copy_0419":"<button class=\"text-button\" data-practice=\"{v0}\">Choose {v1}</button>","copy_0420":"<button class=\"button button-outline\" data-adv=\"studio\" data-id=\"{v0}\">Enter the studio →</button>","copy_0421":"Keep complete & continue","copy_0422":"Mark complete & continue","copy_0423":"<button class=\"text-button unmark-step\" data-adv=\"journey-unmark\">Mark this step incomplete</button>","copy_0424":"<div class=\"journey-step-nav\" aria-label=\"Journey steps\">{v0}</div><p class=\"eyebrow\">{v1} / STEP {v2} OF {v3}</p><h3>{v4}</h3><p class=\"lesson-text\">{v5}</p>{v6}<div class=\"button-row\">{v7}{v8}{v9}</div><div class=\"studio-footer\"><button class=\"button button-quiet\" data-adv=\"journey-previous\" {v10}>Previous</button><button class=\"button button-teal\" data-adv=\"journey-complete\">{v11} →</button></div><button class=\"text-button\" data-adv=\"journey-return\">Return to journeys</button>{v12}<p class=\"small-note\">Your step marks are saved in this browser. You can revisit in any order.</p>{v13}","copy_0425":"<div id=\"advance-stage\" class=\"advance-stage\" hidden></div>","copy_0426":"Attention map · not an anatomy assessment","copy_0427":"advance-stage body-attention","copy_0428":"Feet & support","copy_0429":"Whole body","copy_0430":"<button data-player-step=\"{v0}\" class=\"{v1}\" style=\"--point-y:{v2}%\" aria-current=\"{v3}\">{v4}</button>","copy_0431":"<svg viewBox=\"0 0 220 330\" aria-hidden=\"true\"><circle cx=\"110\" cy=\"44\" r=\"25\"/><path d=\"M90 80 Q110 70 130 80 L145 160 L135 190 L133 290 L115 290 L110 210 L105 290 L87 290 L85 190 L75 160Z\"/><path d=\"M89 85 L60 160 L66 190 M131 85 L160 160 L154 190\"/></svg><div class=\"body-points\">{v0}</div>","copy_0432":"advance-stage sensory-stage","copy_0433":"<div class=\"sensory-symbol\">{v0}</div><span>NOTICE YOUR ACTUAL SURROUNDINGS</span>","copy_0434":"Cycle {v0} · Your comfortable pace","copy_0435":"Local tone unavailable. Text and visual guidance remain available.","copy_0436":"Evidence, with its scope.","copy_0437":"<p>Each practice now has its own mapped background sources and adaptation notes. Source availability can change.</p>{v0}<p class=\"notice\">Editorial mapping updated {v1}. Content is educational; product outcomes have not been clinically established.</p>","copy_0438":"Your app, around your day.","copy_0439":"Check offline content","copy_0440":"Make available offline","copy_0441":"<button class=\"button button-teal\" id=\"offline-prepare\" data-adv=\"offline\" {v0}>{v1}</button><button class=\"button button-outline\" data-adv=\"install\">Install / add to home screen</button>","copy_0442":"<label><input type=\"checkbox\" name=\"days\" value=\"{v0}\" {v1}>{v2}</label>","copy_0443":"<section class=\"install-status\"><p class=\"eyebrow\">INSTALL / OFFLINE / REMINDERS</p><h3>Keep a little space close.</h3><p id=\"offline-status\">{v0}</p><div class=\"button-row\">{v1}</div><p id=\"install-note\" class=\"small-note\">Installation support varies. Your browser may offer Install, or Share → Add to Home Screen. Offline access stores app content on this device.</p></section><form id=\"reminder-form\"><h3>A reminder you control.</h3><p>Download a calendar reminder for the shift days and time you choose. It works after import through your calendar, even when Serein is closed.</p><label class=\"field-label\" for=\"reminder-title\">Reminder title</label><input class=\"field\" id=\"reminder-title\" name=\"title\" value=\"A little space for me\" maxlength=\"80\" required><label class=\"field-label\" for=\"reminder-time\">Local reminder time</label><input type=\"time\" class=\"field\" id=\"reminder-time\" name=\"time\" value=\"18:30\" required><fieldset class=\"reminder-days\"><legend>Repeat on</legend>{v2}</fieldset><p class=\"small-note\">Times follow the calendar’s local timezone. Choose days that fit your actual rota. Serein does not know your shifts or send push notifications.</p><p id=\"reminder-error\" role=\"alert\"></p><button type=\"submit\" class=\"button button-teal\">Download calendar reminder</button></form>","copy_0444":"Choose at least one day, a title and a valid time.","copy_0445":"DESCRIPTION:An optional Serein pause. Change or delete this reminder in your calendar.","copy_0446":"Calendar file prepared. Import it into your calendar and check the days and time.","copy_0447":"This single HTML already includes its core content and works offline. Installation requires HTTPS hosting with sw.js beside the HTML.","copy_0448":"Preparing offline content…","copy_0449":"Offline content is ready on this device.","copy_0450":"Use the hosted edition online first, then choose to save its content for offline use.","copy_0451":"Request timed out","copy_0452":"Offline installation requires a supported browser on HTTPS. The downloadable HTML already contains its core content.","copy_0453":"Offline helper sw.js is missing from this host. Upload the supplied sw.js beside this HTML, or use the hosted Serein edition. The app remains available online.","copy_0454":"Asset list unavailable","copy_0455":"Offline cache configuration missing","copy_0456":"Offline content incomplete","copy_0457":"App content is ready offline on this device.","copy_0458":"Offline setup could not finish. Check your connection, HTTPS hosting and available device storage, then try again.","copy_0459":"(display-mode: standalone)","copy_0460":"Serein is already running as an installed app.","copy_0461":"Use your browser’s Install option, or Share → Add to Home Screen. If unavailable, keep using the browser edition.","copy_0462":"An updated edition is available. Reconnect and use “Check for updates” in My app.","copy_0463":"<section class=\"advance-panel app-panel\"><p class=\"eyebrow\">SEREIN / ON YOUR DEVICE</p><h3>Ready when a pause is possible.</h3><p>The downloadable edition includes its core content. The hosted edition can be installed and explicitly prepared for offline use.</p><div class=\"button-row\"><button class=\"button button-teal\" data-adv=\"app-options\">Install, offline & reminders →</button><button class=\"text-button\" data-adv=\"app-update\">Check for updates</button></div><p class=\"small-note\">Personal data stays in this browser. Different browsers and the standalone file have separate storage; use export/import to transfer your data.</p></section>","copy_0464":"Use the hosted edition to check for app updates.","copy_0465":"Prepare offline access first, or reload online for the latest app.","copy_0466":"An update is ready.","copy_0467":"<p>Export anything you want to keep, then apply the update. Unsaved visit-only entries disappear on reload. Journal drafts remain in this tab when temporary storage is available.</p><div class=\"button-row\"><button class=\"button button-outline\" data-action=\"export\">Export first</button><button class=\"button button-teal\" data-adv=\"apply-update\">Apply update & reload</button></div>","copy_0468":"Update check complete. Reload online to use the latest published edition.","copy_0469":"Update check unavailable. Try again while online.","copy_0470":"Copied. Nothing was sent.","copy_0471":"Select the draft and copy it using your device controls.","copy_0472":"Response removed.","copy_0473":"Serein-{v0}-plan.txt","copy_0474":"Plan saved in this browser without encryption. You can delete it in the Toolkit. Nothing was sent.","copy_0475":"Your step is marked complete. Revisit whenever useful.","copy_0476":"Reset learning progress?","copy_0477":"<p>This removes your journey step marks. Your reflections, plans and practice choices remain available.</p><button class=\"button button-outline\" data-adv=\"journey-reset-confirm\">Reset step marks</button>","copy_0478":"<button class=\"search-result\" data-adv=\"studio\" data-id=\"{v0}\">{v1}<span><strong>{v2}</strong><small>Interactive studio</small></span><span>↗</span></button>","copy_0479":"<button class=\"search-result\" data-adv=\"journey\" data-id=\"{v0}\">{v1}<span><strong>{v2}</strong><small>Five-step learning journey</small></span><span>↗</span></button>","copy_0480":"<p class=\"search-group-label\">STUDIOS & JOURNEYS</p>{v0}{v1}","copy_0481":"Continuous breathing","copy_0482":"Removes the timed pauses between breathing in and out. Keep your breathing gentle and choose a comfortable pace.","copy_0483":"External focus","copy_0484":"Uses guidance about the room or your surroundings instead of focusing on breath or internal sensations. You can keep your eyes open.","copy_0485":"Practice memory","copy_0486":"Reuses timing, visual and comfort choices for this practice on this browser. Voice must still be enabled for each session. Reset saved choices in My patterns.","copy_0487":"Saved feedback","copy_0488":"Keeps this response after the visit and includes it in My patterns. Leave unchecked for visit-only feedback. You can delete saved responses later.","copy_0489":"App structure","copy_0490":"A count from this edition of Serein, not a research result.","copy_0491":"My reflections","copy_0492":"You choose whether this is suitable. {v0}","copy_0493":"guided steps in this practice","copy_0494":"The external figure supplies research or workforce context; it does not measure this Serein practice.","copy_0495":" Then choose one feasible next step.","copy_0496":"Healthcare workers using their own role, judgment and workplace arrangements.","copy_0497":" interactive steps","copy_0498":"Explore attention and comfort, then identify an approach you would choose again.","copy_0499":"Move from a practical barrier to words, ownership and a review point.","copy_0500":"Connect an agreed handover with a feasible transition and recovery support.","copy_0501":"Across visits whenever learning feels useful; there is no deadline.","copy_0502":"Open any lesson, explore its linked activity, and explicitly mark or unmark progress.","copy_0503":"Healthcare workers and learners; this is educational progress without accreditation.","copy_0504":"lessons in this journey","copy_0505":"Understand · try · reflect · apply","copy_0506":"Begin with a realistic intention and available support.","copy_0507":"Match a small pause to the space between responsibilities.","copy_0508":"Choose support without having to retell the event.","copy_0509":"Make a deliberate transition after an agreed handover.","copy_0510":"Select this moment to refresh recommendations, or use Help me choose for more options.","copy_0511":"Workers choosing a personal response to their current situation.","copy_0512":"All practices","copy_0513":"Explore every available practice type.","copy_0514":"Optional timing and visuals for gentle, unforced breathing.","copy_0515":"Use details in your real surroundings as an outward attention anchor.","copy_0516":"Small optional movements or relax-only attention in a suitable setting.","copy_0517":"Notice a supported sensation or an external detail without needing to change it.","copy_0518":"Use an imagined neutral setting, or choose actual room details instead.","copy_0519":"Saved practices","copy_0520":"Return to practices you bookmarked.","copy_0521":"Explore reflection, boundaries and practical working-day support.","copy_0522":"Mindfulness guides","copy_0523":"Explore optional attention and noticing practices.","copy_0524":"Shared practice guides","copy_0525":"Prepare a voluntary invitation and useful adaptations.","copy_0526":"Practice context guides","copy_0527":"Read educational prompts using your own professional responsibilities.","copy_0528":"Narrow the catalogue to an approach you want to explore.","copy_0529":"When comparing available practices or guides.","copy_0530":"Select the category, combine it with filters, then read the relevant activity information.","copy_0531":"People making their own content and comfort choices.","copy_0532":"All practical guides","copy_0533":"Saved practical guides","copy_0534":"Explore every available practical guide.","copy_0535":"Return to guides you bookmarked.","copy_0536":"Compare short readings about practical support and working life.","copy_0537":"When preparing a conversation or looking for an educational reference.","copy_0538":"Choose a category, read the guide, then adapt a next step to your setting.","copy_0539":"Healthcare workers and learners using professional judgment.","copy_0540":"practice bookmarks","copy_0541":"Saved guides","copy_0542":"guide bookmarks","copy_0543":"Saved words","copy_0544":"original reflections saved","copy_0545":"A collection of resources you explicitly chose to bookmark.","copy_0546":"Find your own useful references without repeating a search.","copy_0547":"When you want to revisit something saved.","copy_0548":"Open an item or remove its bookmark. Your other records are unaffected.","copy_0549":"The person using this browser; collections do not sync automatically.","copy_0550":"Current local collection count. You can remove bookmarks at any time.","copy_0551":"<button type=\"button\" class=\"text-button context-detail-link\" data-context-open=\"{v0}\" aria-haspopup=\"dialog\" aria-controls=\"{v1}\" aria-expanded=\"false\">{v2} <span aria-hidden=\"true\">→</span></button>","copy_0552":"Evidence & context","copy_0553":"<aside class=\"context-reading-note\" aria-label=\"Using this guide\"><p><strong>Why this guide:</strong> {v0}</p><p><strong>When to use it:</strong> {v1}</p>{v2}</aside>","copy_0554":"Explore the evidence & sources","copy_0555":"<section class=\"context-evidence-section\" aria-labelledby=\"workplace-context-title\"><div><p class=\"eyebrow\">WORKFORCE CONTEXT / UNITED KINGDOM</p><h2 id=\"workplace-context-title\">Support includes working conditions.</h2><p>Pressure in health and care often comes from workload, staffing and rotas, not from the person. Practical support from your team, manager, occupational health or staff wellbeing service matters as much as any individual practice.</p></div><p class=\"small-note\">Serein is a self-care tool. It does not measure stress or burnout and does not replace workplace or clinical support.</p></section>","copy_0556":"<button type=\"button\" class=\"context-tip-trigger\" data-context-tip=\"{v0}\" aria-label=\"Explain {v1}\"><span aria-hidden=\"true\">?</span></button>","copy_0557":"<div class=\"context-comparison\" role=\"img\" aria-label=\"{v0}: {v1}% in {v2}; {v3}% in {v4}\"><div><span>{v5}</span><i><b style=\"width:{v6}%\"></b></i><strong>{v7}%</strong></div><div><span>{v8}</span><i><b style=\"width:{v9}%\"></b></i><strong>{v10}%</strong></div></div>","copy_0558":"<div class=\"context-percent-track\" role=\"img\" aria-label=\"{v0}\"><span style=\"width:{v1}%\"></span></div>","copy_0559":"<small>{v0}{v1}</small>","copy_0560":"<small>{v0}</small>","copy_0561":"<article class=\"context-fact\"><span class=\"context-fact-kind\">{v0}</span><strong class=\"context-number\">{v1}</strong><p>{v2}</p>{v3}{v4}</article>","copy_0562":"HOW IT WORKS","copy_0563":"EVIDENCE & CONTEXT","copy_0564":"<div><dt>{v0}</dt><dd>{v1}</dd></div>","copy_0565":"<section class=\"context-numbers\" aria-label=\"Research context\">{v0}</section><p class=\"small-note\">Population figures provide background. They do not predict your experience or show that Serein produces a benefit.</p>","copy_0566":"<article><a href=\"{v0}\" target=\"_blank\" rel=\"noopener noreferrer\">{v1} ↗</a><small>{v2}</small><p>{v3}</p></article>","copy_0567":"<article><a href=\"{v0}\" target=\"_blank\" rel=\"noopener noreferrer\">{v1} ↗</a><p>{v2}</p></article>","copy_0568":"Original educational content. Adapt any next step to your role and setting.","copy_0569":"<header class=\"context-panel-head\"><div><span>{v0}</span><h2 id=\"context-card-title\">{v1}</h2>{v2}</div><button type=\"button\" data-context-close aria-label=\"Close details\">×</button></header><div class=\"context-panel-scroll\"><dl class=\"context-five\">{v3}</dl>{v4}<section class=\"context-sources\" aria-label=\"Sources and scope\"><h3>Sources & scope</h3>{v5}{v6}<p>Editorial source check: {v7}. {v8}</p></section></div><footer class=\"context-panel-foot\"><span>Take your time. Close when ready.</span><button type=\"button\" data-context-close>Close details</button></footer>","copy_0570":"Library","copy_0571":"Toolkit","copy_0572":"Say no kindly","copy_0573":"Ask for help","copy_0574":"Leave work at work","copy_0575":"After a hard moment","copy_0576":"Run a team pause","copy_0577":"Fix a work barrier","copy_0578":"<label class=\"field-label\" for=\"","copy_0579":"</label><select class=\"field\" id=\"","copy_0580":"<option value=\"","copy_0581":"<label class=\"setting-row\"><span>","copy_0582":"</span><input type=\"checkbox\" id=\"","copy_0583":"<header class=\"page-header\"><p class=\"eyebrow\">","copy_0584":"<section class=\"empty\"><svg viewBox=\"0 0 100 64\" aria-hidden=\"true\"><path d=\"M12 51h76M24 47c-8-24 6-31 18-16 8-26 28-20 20 7 19-13 28 4 12 9\"/><circle cx=\"77\" cy=\"15\" r=\"7\"/></svg><h2>","copy_0585":"Quick pause","copy_0586":"data-v5=\"quick\" class=\"quick-nav\"","copy_0587":"(prefers-color-scheme: dark)","copy_0588":"Your choices come first.","copy_0589":"No practice matches your suggestion choices. You can adjust them in Settings.","copy_0590":"<button class=\"button button-teal\" data-nav=\"me/settings\">Review practice choices</button>","copy_0591":"<section class=\"pause-card\"><div class=\"pause-image\"><img src=\"","copy_0592":"\" width=\"800\" height=\"500\" fetchpriority=\"high\"><span class=\"illustrative\" title=\"Illustrative, AI-generated image\">ⓘ</span></div><div class=\"pause-copy\"><p class=\"eyebrow\">YOUR PAUSE FOR RIGHT NOW</p><h2>","copy_0593":"</p><div class=\"card-meta\">","copy_0594":"</div><div class=\"button-row\"><button class=\"button button-teal\" data-practice=\"","copy_0595":"\">Start my pause ","copy_0596":"</button><button class=\"text-button\" data-adv=\"finder\">Something else</button></div><details class=\"time-choice\"><summary>Change time</summary><div class=\"time-chips\">","copy_0597":"My pace","copy_0598":"<button data-v5=\"home-time\" data-value=\"","copy_0599":"<button class=\"continue-card\" data-adv=\"journey\" data-id=\"","copy_0600":"\"><span><small>CONTINUE AT YOUR PACE</small><strong>","copy_0601":"<button class=\"continue-card\" data-nav=\"me/routine\"><span><small>YOUR CHOSEN SEQUENCE</small><strong>Return to my routine</strong></span>","copy_0602":"<button class=\"continue-card\" data-nav=\"toolkit\"><span><small>YOUR SAVED PLANS</small><strong>Return to a practical next step</strong></span>","copy_0603":"<div class=\"today-greeting\"><h1 class=\"today-greeting-title\">","copy_0604":"</time></div><div id=\"today-recommendation\">","copy_0605":"</div><section class=\"moment-section\"><h2 class=\"small-heading\">What moment are you in?</h2><div class=\"moment-chips\" role=\"group\" aria-label=\"Your working moment\">","copy_0606":"Before shift","copy_0607":"Between tasks","copy_0608":"After a difficult moment","copy_0609":"After shift","copy_0610":"<button data-moment=\"","copy_0611":"<div class=\"rotation-choice\"><span>This week:</span><button data-v5=\"rotation\" data-value=\"days\">Days</button><button data-v5=\"rotation\" data-value=\"nights\">Nights</button></div>","copy_0612":"</section><section class=\"quick-checkin\"><div><h2 class=\"small-heading\">A quick check-in</h2><p class=\"small-note\">Optional. One tap keeps it for this visit.</p></div>","copy_0613":"<div id=\"quick-checkin-actions\" role=\"status\"></div></section>","copy_0614":"<div id=\"today-reflection\">","copy_0615":"</div><div class=\"compact-links\"><button data-nav=\"library/guides\">Guides for real working days →</button><button data-nav=\"toolkit\">Toolkit →</button></div>","copy_0616":"<div id=\"filter-controls\">","copy_0617":"No movement","copy_0618":"<div class=\"active-filters\" aria-label=\"Active filters\">","copy_0619":"<button data-v5=\"clear-filter\" data-value=\"","copy_0620":"<button class=\"text-button\" data-action=\"reset-filters\">Clear all</button>","copy_0621":"<div class=\"library-heading\">","copy_0622":"YOUR LIBRARY","copy_0623":"Find what fits.","copy_0624":"Practices, useful guides and learning at your pace.","copy_0625":"<button class=\"button button-outline\" data-nav=\"toolkit\">","copy_0626":" Toolkit</button></div><div class=\"segmented\" role=\"group\" aria-label=\"Library content\">","copy_0627":"<button data-nav=\"library/","copy_0628":"<label class=\"search-input full-search\">","copy_0629":"<span class=\"sr-only\">Search guides</span><input id=\"guide-query\" type=\"search\" value=\"","copy_0630":"\" placeholder=\"Boundaries, support, rest…\"></label><div class=\"category-row\" role=\"group\" aria-label=\"Guide categories\">","copy_0631":"<button data-guide-category=\"","copy_0632":"</div><div id=\"guide-results\">","copy_0633":"<div class=\"library-actions\"><button class=\"button button-outline filters-launch\" data-v5=\"filters\">","copy_0634":" active</button><button class=\"text-button\" data-action=\"routine-builder\">Build a routine</button></div><div id=\"desktop-filters\">","copy_0635":"<div class=\"category-row\" role=\"group\" aria-label=\"Practice categories\">","copy_0636":"<button data-category=\"","copy_0637":"</div><div id=\"practice-results\">","copy_0638":"</div><p class=\"small-note\">Preference matches, not health recommendations. You can adapt, skip, pause or stop.</p>","copy_0639":"<section class=\"panel locked-panel\">","copy_0640":"<h2>Your private records are locked.</h2><p>Unlock to open your journal, check-ins and support contacts. Practices and the rest of Serein remain available.</p><button class=\"button button-teal\" data-v5=\"unlock\">Unlock private records</button><button class=\"text-button\" data-v5=\"encrypted-export\">Download encrypted archive</button></section>","copy_0641":"<section class=\"panel journal-history\"><div class=\"section-heading\"><h2>Your reflections</h2><label class=\"search-input\">","copy_0642":"<span class=\"sr-only\">Search your reflections</span><input type=\"search\" id=\"journal-query\" value=\"","copy_0643":"\" placeholder=\"Find your own words…\"></label></div><div id=\"journal-history\">","copy_0644":"<section class=\"panel\"><h2>Journal lock</h2><p>Optional encryption covers saved journals, check-ins and support contacts. Preferences, feedback and saved plans remain unencrypted.</p>","copy_0645":"<p class=\"notice\">Web Crypto is unavailable in this browser. Encryption is hidden; the app remains usable with its normal storage choices.</p>","copy_0646":" Lock enabled · ","copy_0647":"</p><div class=\"button-row\"><button class=\"button button-outline\" data-v5=\"","copy_0648":"Lock now","copy_0649":"</button><button class=\"text-button\" data-v5=\"remove-lock\">Remove lock</button></div>","copy_0650":"Lock after inactivity","copy_0651":"Lock when this tab is hidden","copy_0652":"<button class=\"button button-outline\" data-v5=\"setup-lock\">Set up a journal lock</button>","copy_0653":"<p class=\"small-note\">If you forget the passcode, locked entries cannot be recovered.</p></section>","copy_0654":"<form id=\"settings-form\"><section class=\"panel\"><h2>Comfort</h2>","copy_0655":"Text size","copy_0656":"Auto · follows your device","copy_0657":"HCA ivory","copy_0658":"HCA navy night","copy_0659":"High contrast","copy_0660":"Comfortable reading width","copy_0661":"Low-distraction layout","copy_0662":"Less motion","copy_0663":"Your device’s reduced-motion preference is also respected.","copy_0664":"3D breathing visual","copy_0665":"A still alternative and text remain available.","copy_0666":"Show original reflections","copy_0667":"Secular Serein words, without streaks or pressure.","copy_0668":"</section><section class=\"panel\"><h2>Practice defaults</h2>","copy_0669":"Your role","copy_0670":"Usual pause length","copy_0671":"Focus preference","copy_0672":"Shift pattern","copy_0673":"Prefer not to say","copy_0674":"<p class=\"small-note\">Changes apply immediately. A selected role does not certify suitability.</p></section>","copy_0675":"</form><section class=\"panel\"><h2>Reminders & app</h2>","copy_0676":"</section><section class=\"panel\"><h2>Privacy & data</h2><div class=\"button-row\"><button class=\"button button-outline\" data-nav=\"me/data\">Export, import & clear</button><button class=\"text-button\" data-action=\"privacy\">Privacy details</button><button class=\"text-button\" data-v5=\"scope\">About images, evidence & safety</button><button class=\"text-button\" data-v5=\"onboarding\">Reopen welcome guide</button></div></section>","copy_0677":"Journal","copy_0678":"Routine","copy_0679":"Insights","copy_0680":"Settings","copy_0681":"Data & privacy","copy_0682":"Look back over","copy_0683":"Last 90 days","copy_0684":"<section class=\"panel\"><h2>Recover your saved archive</h2><p>The existing browser archive could not be read. It has been kept unchanged. Download a recovery copy before clearing or importing data. New changes stay in memory until this is resolved.</p><button class=\"button button-teal\" data-v5=\"recovery-export\">Download original stored data</button></section>","copy_0685":"YOUR SPACE / YOUR CHOICE","copy_0686":"A little room for you.","copy_0687":"Keep what is useful. Return whenever you choose.","copy_0688":"<div class=\"me-tabs\" role=\"group\" aria-label=\"Your space\">","copy_0689":"<button data-nav=\"me/","copy_0690":"<section class=\"help-now\"><p class=\"eyebrow\">GET HELP NOW / UNITED KINGDOM</p><h2>Human support is close.</h2><p>If you or someone else is in immediate danger, call 999. Serein is not monitored and cannot provide urgent care.</p><div class=\"help-grid\"><a href=\"tel:999\"><strong>999</strong><span>Emergency services</span></a><a href=\"tel:111\"><strong>NHS 111 · option 2</strong><span>Urgent mental health help in England (111 for urgent medical advice)</span></a><a href=\"tel:116123\"><strong>Samaritans · 116 123</strong><span>Free listening support, day or night</span></a><a href=\"sms:85258?body=SHOUT\"><strong>Text SHOUT to 85258</strong><span>Shout · free UK text support, 24/7</span></a><a href=\"sms:85258?body=FRONTLINE\"><strong>Text FRONTLINE to 85258</strong><span>Shout · for health and care workers, 24/7</span></a><a href=\"https://www.practitionerhealth.nhs.uk/\" target=\"_blank\" rel=\"noopener noreferrer\"><strong>NHS Practitioner Health</strong><span>Confidential NHS support for health and care professionals · practitionerhealth.nhs.uk</span></a><a href=\"tel:111\"><strong>Scotland · NHS 24 on 111</strong><span>Urgent help, day or night</span></a><a href=\"tel:0800838587\"><strong>Scotland · Breathing Space</strong><span>0800 83 85 87 · listening and advice</span></a><a href=\"tel:08088088000\"><strong>Northern Ireland · Lifeline</strong><span>0808 808 8000 · crisis support, 24/7</span></a><a href=\"https://www.nhs.uk/nhs-services/mental-health-services/find-nhs-talking-therapies-for-anxiety-and-depression/\" target=\"_blank\" rel=\"noopener noreferrer\"><strong>NHS Talking Therapies</strong><span>Refer yourself for anxiety and depression support (England)</span></a></div><p class=\"small-note\">These routes are for the UK. Elsewhere, use the appropriate local emergency or support service. Calls and texts use your phone app.</p><details><summary>Service information & sources</summary><a class=\"source-link\" href=\"https://www.nhs.uk/nhs-services/mental-health-services/where-to-get-urgent-help-for-mental-health/\" target=\"_blank\" rel=\"noopener noreferrer\">NHS urgent support ↗</a><a class=\"source-link\" href=\"https://www.samaritans.org/how-we-can-help/contact-samaritan/talk-us-phone/\" target=\"_blank\" rel=\"noopener noreferrer\">Samaritans service information ↗</a><a class=\"source-link\" href=\"https://giveusashout.org/get-help/\" target=\"_blank\" rel=\"noopener noreferrer\">Shout service information ↗</a><p class=\"small-note\">Source check: 16 October 2026. Availability and service arrangements can change.</p></details></section>","copy_0691":"<section class=\"panel\"><h2>My support people</h2>","copy_0692":"<section class=\"panel\"><h2>My support people</h2><p>Choose people or services you would like to contact. Nothing is sent from this app.</p><div class=\"contact-list\">","copy_0693":"<article class=\"contact-card\"><div><h3>","copy_0694":"</small></div><a class=\"button button-outline\" href=\"tel:","copy_0695":"</a><button class=\"text-button\" data-v5=\"delete-contact\" data-id=\"","copy_0696":"</div><form id=\"support-contact-form\"><label class=\"field-label\" for=\"contact-name\">Name or service</label><input class=\"field\" id=\"contact-name\" name=\"name\" maxlength=\"100\" required><label class=\"field-label\" for=\"contact-role\">Role, if useful</label><input class=\"field\" id=\"contact-role\" name=\"role\" maxlength=\"100\"><label class=\"field-label\" for=\"contact-phone\">Phone</label><input class=\"field\" id=\"contact-phone\" name=\"phone\" type=\"tel\" maxlength=\"40\" required pattern=\"[+0-9 ()*#-]{3,40}\"><label class=\"check-label\"><input name=\"persist\" type=\"checkbox\">Save on this browser for another day</label><p class=\"small-note\">","copy_0697":"Saved contact details are included in your encrypted records.","copy_0698":"Saved contact details are unencrypted unless you enable the journal lock.","copy_0699":"</p><button class=\"button button-teal\" type=\"submit\">Add my support person</button><p class=\"form-error\" role=\"alert\" id=\"contact-error\"></p></form></section>","copy_0700":"YOUR TOOLKIT","copy_0701":"Make the next step practical.","copy_0702":"Six guided tools for words, choices and an editable plan.","copy_0703":"<a class=\"toolkit-infographics\" href=\"#infographics\">","copy_0704":"<span><strong>Explore the illustrated guides</strong><small>12 infographics · flip, enlarge and read the sources</small></span>","copy_0705":"<details class=\"panel\"><summary>Short draft tools</summary><p>Earlier compact three-question builders remain available here.</p><button class=\"text-button\" data-v5=\"legacy-tools\" data-value=\"conversation\">Short support draft</button><button class=\"text-button\" data-v5=\"legacy-tools\" data-value=\"transition\">Short transition draft</button></details>","copy_0706":" · safety & adaptation</summary><p>","copy_0707":"IMAGES / EVIDENCE / SAFETY","copy_0708":"Clear context. Your choice.","copy_0709":"Original educational tools, with relevant background sources and adaptation notes.","copy_0710":"<section class=\"panel\"><h2>About the images</h2><p>Illustrative, AI-generated photographs accompany the content. Infographics are AI-generated educational illustrations with sources and limitations. Their readable text and statistics have been editorially reviewed. These visuals are not anatomical standards, prescribed movement ranges or patient records.</p><h2>About evidence</h2><p>Sources support background principles. Serein has not been clinically validated as a treatment, and population figures do not predict a personal benefit.</p><h2>Current privacy choices</h2><p>Records are browser-local. Saving personal entries is opt-in. Optional encryption covers journals, check-ins and contacts; other saved preferences, feedback and plans remain unencrypted. Drafts use temporary tab storage, encrypted when the journal lock is enabled.</p>","copy_0711":"<details><summary>All original scope and privacy statements</summary><p class=\"notice\">The original default-storage statements below describe the unlocked mode. The optional journal lock now adds encryption to the specific records named above.</p>","copy_0712":"<a class=\"source-link\" href=\"","copy_0713":"\" target=\"_blank\" rel=\"noopener noreferrer\">","copy_0714":" · Serein · Healthcare Crown Academy","copy_0715":"<img class=\"article-image\" src=\"","copy_0716":"\"><p class=\"small-note\">Illustrative, AI-generated image</p>","copy_0717":"Choose a length","copy_0718":"<div class=\"button-row\"><button class=\"button button-teal\" data-v5=\"detail-start\" data-id=\"","copy_0719":"\">Start this practice</button><button class=\"button button-outline\" data-v5=\"detail-preview\" data-id=\"","copy_0720":"\">Watch first</button><button class=\"text-button\" data-save-practice=\"","copy_0721":"Preference updated.","copy_0722":"Private records could not be locked. Keep this tab open.","copy_0723":"Secure local encryption is unavailable in this browser.","copy_0724":"A private journal lock.","copy_0725":"Remove your journal lock?","copy_0726":"Unlock your private records.","copy_0727":"If you forget the passcode, locked entries cannot be recovered. Choose a passphrase you can keep safely.","copy_0728":"Removing the lock writes saved journals, check-ins and contacts back to normal unencrypted browser storage.","copy_0729":"Your passcode stays on this device and is never sent.","copy_0730":"</p><form id=\"vault-form\" data-mode=\"","copy_0731":"\"><label class=\"field-label\" for=\"vault-pass\">Passcode or passphrase</label><input class=\"field\" type=\"password\" id=\"vault-pass\" name=\"pass\" autocomplete=\"","copy_0732":"<label class=\"field-label\" for=\"vault-confirm\">Confirm passcode</label><input class=\"field\" type=\"password\" id=\"vault-confirm\" name=\"confirm\" autocomplete=\"new-password\" minlength=\"6\" required><label class=\"check-label\"><input type=\"checkbox\" name=\"understood\" required>I understand that a forgotten passcode cannot be recovered.</label>","copy_0733":"<label class=\"check-label\"><input type=\"checkbox\" name=\"understood\" required>I understand saved records will be unencrypted.</label>","copy_0734":"<p class=\"form-error\" id=\"vault-error\" role=\"alert\"></p><button type=\"submit\" class=\"button button-teal\">","copy_0735":"Enable encryption","copy_0736":"Remove lock","copy_0737":"Your archive, your choice.","copy_0738":"<p>Downloaded files contain personal records. Keep them private.</p><div class=\"button-row\">","copy_0739":"<button class=\"button button-teal\" data-v5=\"encrypted-export\">Download encrypted archive</button>","copy_0740":"<button class=\"button button-outline\" data-v5=\"plain-export\">Download plain archive</button></div><p class=\"small-note\">An encrypted archive requires its passcode. A plain archive can be read by anyone who opens the file.</p>","copy_0741":"Download an unencrypted archive?","copy_0742":"<p>This file includes your personal records in readable form, even when the journal lock is enabled.</p><label class=\"check-label\"><input type=\"checkbox\" id=\"plain-export-consent\">I understand and will keep the file private.</label><button class=\"button button-teal\" data-v5=\"plain-export-confirm\">Download plain archive</button><p id=\"export-error\" class=\"form-error\" role=\"alert\"></p>","copy_0743":"Get human support.","copy_0744":"<p class=\"eyebrow\">WELCOME TO SEREIN</p><h3>A little space for the people who care.</h3><p>Optional practices, personal reflection and practical working-day support.</p><p>Your personal records stay in this browser. Nothing is sent to employers, and there is no live monitoring.</p>","copy_0745":"<form id=\"onboarding-form\">","copy_0746":"<h3>Your words. Your choice.</h3><p>Saving journal entries, check-ins and support contacts is opt-in. Drafts are temporarily kept in this tab. Normal browser storage is unencrypted.</p><p>You can export, import or clear your records. Optional journal encryption adds a passcode lock to journals, check-ins and contacts.</p><p class=\"notice\">Keep patient-identifying information out of this space. Serein is educational and is not monitored.</p>","copy_0747":"Make a little room.","copy_0748":"<div class=\"onboarding-step\" data-step=\"","copy_0749":"<div class=\"button-row\"><button class=\"button button-teal\" data-v5=\"welcome-next\">","copy_0750":"Enter Serein","copy_0751":"</button><button class=\"text-button\" data-v5=\"welcome-skip\">Skip</button>","copy_0752":"<button class=\"text-button\" data-v5=\"welcome-lock\">Set up a journal lock</button>","copy_0753":"Start Box Breathing · 2 min","copy_0754":"New journal entry","copy_0755":"Quick check-in","copy_0756":"Export my data","copy_0757":"Switch to dark theme","copy_0758":"Get help now","copy_0759":"Browse the Visual Atlas","copy_0760":"Serein action","copy_0761":"Five-step learning journey","copy_0762":"Recent choices","copy_0763":"<section><h2 class=\"search-group-label\">","copy_0764":"<button class=\"search-result\" data-v5=\"command\" data-kind=\"","copy_0765":"\"><span class=\"search-icon\">","copy_0766":"No matches yet.","copy_0767":"Try a practice, support, journal or an action.","copy_0768":"HCA navy night enabled.","copy_0769":"Choose what fits.","copy_0770":"<button class=\"button button-teal\" data-v5=\"filters-done\">Show practices</button>","copy_0771":"Check-in kept for this visit.","copy_0772":"Kept for this visit.","copy_0773":"</p><button class=\"text-button\" data-v5=\"checkin-note\">Add a note</button><button class=\"text-button\" data-v5=\"save-quick-checkin\" ","copy_0774":">Save on this browser</button>","copy_0775":"A little context, if useful.","copy_0776":"<form id=\"quick-note-form\"><label class=\"field-label\" for=\"quick-note\">Your note · no patient details</label><textarea class=\"field\" id=\"quick-note\" name=\"note\" maxlength=\"6000\" rows=\"4\">","copy_0777":"</textarea><p class=\"small-note\">","copy_0778":"This check-in is saved.","copy_0779":"This check-in lasts for this visit only.","copy_0780":"</p><button class=\"button button-teal\" type=\"submit\">Keep my note</button></form>","copy_0781":"Choose a Serein archive smaller than 8 MB.","copy_0782":"Unlock private records before importing, then choose the file again.","copy_0783":"Open an encrypted archive.","copy_0784":"<p>Use the passcode for this archive. It is never sent anywhere.</p><form id=\"archive-pass-form\"><label class=\"field-label\" for=\"archive-pass\">Archive passcode</label><input type=\"password\" class=\"field\" id=\"archive-pass\" name=\"pass\" autocomplete=\"off\" required><button class=\"button button-teal\" type=\"submit\">Open archive</button><p id=\"archive-error\" class=\"form-error\" role=\"alert\"></p></form>","copy_0785":"This archive could not be read.","copy_0786":" responses and ","copy_0787":" plans.</p><p>Merge keeps existing entries. Replace restores this archive in their place.</p>","copy_0788":"<label class=\"check-label\"><input type=\"checkbox\" id=\"import-use-lock\" checked>Keep these records encrypted using the archive passcode</label><p class=\"notice\">If you uncheck this option, imported saved records use normal unencrypted browser storage.</p>","copy_0789":"<div class=\"button-row\"><button class=\"button button-teal\" data-v5=\"import-merge\">Merge with my records</button><button class=\"button button-outline\" data-v5=\"import-replace\">Replace with this archive</button><button class=\"text-button\" data-action=\"close-modal\">Cancel</button></div><p class=\"form-error\" id=\"import-error\" role=\"alert\"></p>","copy_0790":"Download the original recovery copy and clear the damaged archive before importing.","copy_0791":"The archive could not be saved. Existing records are kept; free browser storage and try again.","copy_0792":"Archive merged.","copy_0793":"Shift-aware reminder preset","copy_0794":"Choose my own time","copy_0795":"10 minutes after shift start","copy_0796":"End of shift","copy_0797":"Shift used for this reminder","copy_0798":"Day shift · 07:00–19:00","copy_0799":"Night shift · 19:00–07:00","copy_0800":"<p class=\"small-note\">These are editable presets, not your known rota. Confirm the actual shift time and weekdays before downloading.</p>","copy_0801":"Your keyboard shortcuts.","copy_0802":"<dl class=\"shortcut-list\">","copy_0803":"Quick pause, outside text fields","copy_0804":"Play or pause","copy_0805":"Previous or next step","copy_0806":"Restart practice","copy_0807":"Shared presentation","copy_0808":"Close the current sheet or exit practice","copy_0809":"Ctrl/⌘ K or /","copy_0810":"Search content and actions","copy_0811":"Open this guide","copy_0812":"About images, evidence & safety.","copy_0813":"Serein records and preferences cleared from this browser.","copy_0814":"Optional encryption is enabled for journals, check-ins and contacts. The normal-storage statements below apply to other data and to unlocked mode.","copy_0815":"The journal lock can optionally encrypt journals, check-ins and contacts. Without it, normal browser storage is unencrypted.","copy_0816":"The saved entry will be included in your encrypted private records. Keep your passcode safe.","copy_0817":"Browser storage is unencrypted. Other people using this browser profile may be able to read the entry.","copy_0818":"</p><div class=\"button-row\"><button class=\"button button-teal\" data-confirm-keep=\"","copy_0819":"\">Save in this browser</button><button class=\"text-button\" data-action=\"close-modal\">This visit only</button></div>","copy_0820":"Check-in saved.","copy_0821":"Contact removed.","copy_0822":"Unlock before restoring this contact.","copy_0823":"Confirm that you understand the file is unencrypted.","copy_0824":"Plain archive prepared. Keep it private.","copy_0825":"Encrypted archive prepared. Keep its passcode safe.","copy_0826":"Clipboard unavailable","copy_0827":"Link copied. No personal records are included.","copy_0828":"Select and copy the link.","copy_0829":"The passcodes do not match.","copy_0830":"Confirm that you understand the recovery limit.","copy_0831":"Confirm that saved records will be unencrypted.","copy_0832":"Journal encryption enabled.","copy_0833":"Lock removed. Saved records now use unencrypted browser storage.","copy_0834":"Private records unlocked.","copy_0835":"Enter a name or service.","copy_0836":"Enter a usable phone number.","copy_0837":"Support contact saved in this browser.","copy_0838":"Support contact kept for this visit.","copy_0839":"Note kept with your check-in.","copy_0840":"The passcode is incorrect, or this archive is damaged.","copy_0841":"<div id=\"player-extra-options\">","copy_0842":"<button class=\"button button-outline\" id=\"uncomfortable-support\" data-v5=\"help\" hidden>Find human support</button>","copy_0843":"% of this practice","copy_0844":"Saved · remove favourite","copy_0845":"Save to favourites","copy_0846":" · At your own pace","copy_0847":"Browser storage is not encrypted.","copy_0848":"Saved records are included in your encrypted archive.","copy_0849":"<section class=\"share-link\"><label class=\"field-label\" for=\"team-share-link\">Shared practice link · no personal records</label><input class=\"field\" id=\"team-share-link\" readonly><button class=\"button button-outline\" data-v5=\"share-team\">Copy a shared practice link</button><p class=\"small-note\">The link includes only a practice ID, duration and attention option. Local-file links must be opened on a device with that file; use the hosted edition to share between devices.</p></section>","copy_0850":"Serein · Healthcare Crown Academy","copy_0851":"Get help","copy_0852":"Something went wrong. Your saved records have not been cleared.","copy_0853":"That action could not finish. Keep this tab open and try again.","copy_0854":"Engine state invalid","copy_0855":"Pause invalid","copy_0856":"Legacy routes","copy_0857":"Store migration and round-trip","copy_0858":"Migration mismatch","copy_0859":"DOM IDs","copy_0860":"Duplicate ID","copy_0861":"Image alternatives","copy_0862":"Missing alt","copy_0863":"Control names","copy_0864":"Unnamed button","copy_0865":"Encryption round-trip","copy_0866":"SKIP · Web Crypto unavailable","copy_0867":"\" width=\"28\" height=\"23\" rx=\"5\" class=\"heat-cell mood-","copy_0868":" entries; average ","copy_0869":"No entry","copy_0870":"<section class=\"panel\"><h2>Feelings you recorded</h2><p>Last eight weeks. Each square represents a day; multiple check-ins are averaged for its shade. Missing days are unknown.</p><svg class=\"mood-calendar\" viewBox=\"0 0 310 216\" role=\"img\" aria-label=\"Check-ins over the last eight weeks. ","copy_0871":" entries in the selected period. A detailed table follows.\">","copy_0872":"</svg><p class=\"chart-legend\">□ No entry · Shading follows your own 1–5 feeling labels, without a health grade.</p><details><summary>View calendar as a table</summary><div class=\"table-scroll\"><table><caption>Daily check-in counts and average feeling</caption><thead><tr><th>Date</th><th>Entries</th><th>Average</th></tr></thead><tbody>","copy_0873":"\" class=\"pair-line\"/><circle cx=\"","copy_0874":"\" r=\"5\" class=\"pair-before\"/><circle cx=\"","copy_0875":"<section class=\"panel\"><h2>Before and after a pause</h2><p>","copy_0876":" optional pairs. Outlined dots show before; filled dots show after. These observations cannot establish that a practice caused a change.</p>","copy_0877":"<svg class=\"pair-chart\" viewBox=\"0 0 300 ","copy_0878":"\" role=\"img\" aria-label=\"","copy_0879":" paired settledness observations, each rated 1 to 5. Detailed values follow.\">","copy_0880":"<p class=\"empty-inline\">Optional paired observations will appear here when you choose to record them.</p>","copy_0881":"<details><summary>View pairs as a table</summary><div class=\"table-scroll\"><table><caption>Optional settledness observations</caption><thead><tr><th>Practice</th><th>Before</th><th>After</th></tr></thead><tbody>","copy_0882":"<section class=\"panel weekly\"><p class=\"eyebrow\">THIS WEEK / YOUR WORDS</p><h2>A moment to look back</h2><p>You recorded ","copy_0883":" practice responses this week. ","copy_0884":"You marked ","copy_0885":"You have not marked a practice helpful this week.","copy_0886":" Missing records simply mean no record was made.</p><button class=\"text-button\" data-nav=\"me/journal\">Write a reflection →</button></section>","copy_0887":"<section class=\"panel\"><h2>What you marked helpful, by moment</h2>","copy_0888":"<div class=\"insight-moment\"><h3>","copy_0889":" responses marked helpful.</p>","copy_0890":"<p class=\"small-note\">No helpful responses recorded for this moment.</p>","copy_0891":"<section class=\"panel\"><h2>Your records</h2><p>","copy_0892":" practice responses are saved. Visit-only entries disappear on reload.</p><details><summary>Explore or remove individual responses (","copy_0893":"<article class=\"entry\"><strong>","copy_0894":"</strong><p class=\"small-note\">","copy_0895":"</p><button class=\"text-button\" data-adv=\"delete-feedback\" data-id=\"","copy_0896":"\">Remove response</button></article>","copy_0897":"<div class=\"insight-stats\"><div><strong>","copy_0898":"</strong><span>check-ins in this period</span></div><div><strong>","copy_0899":"</strong><span>practice responses</span></div><div><strong>","copy_0900":"</strong><span>optional paired observations</span></div></div>","copy_0901":"<div class=\"insights-grid\">","copy_0902":"<p class=\"notice\">Personal observations, not a clinical assessment, treatment outcome or employer report. Nothing is monitored.</p>","copy_0903":"<fieldset class=\"player-extra-options\"><legend>Sound and device options</legend>","copy_0904":"<label class=\"field-label\" for=\"voice-choice\">Local English voice</label><select id=\"voice-choice\" class=\"field\">","copy_0905":"</select><label class=\"field-label\" for=\"voice-rate\">Voice speed</label><input id=\"voice-rate\" type=\"range\" min=\"0.6\" max=\"1.2\" step=\"0.05\" value=\"","copy_0906":"\"><p class=\"small-note\">Only installed local English voices appear. Voice is off until enabled for this session.</p>","copy_0907":"<p class=\"small-note\">No local English voice is available. Text guidance remains available.</p>","copy_0908":"<label class=\"field-label\" for=\"ambient-sound\">Ambient sound · off by default</label><select class=\"field\" id=\"ambient-sound\"><option value=\"off\">Off</option><option value=\"rain\">Rain</option><option value=\"ocean\">Ocean</option><option value=\"hum\">Hum</option></select><label class=\"field-label\" for=\"ambient-volume\">Ambient volume</label><input id=\"ambient-volume\" type=\"range\" min=\"0\" max=\"0.25\" step=\"0.01\" value=\"0.06\">","copy_0909":"<label class=\"check-label\"><input id=\"keep-awake\" type=\"checkbox\">Keep the screen awake while playing</label>","copy_0910":"<label class=\"check-label\"><input id=\"phase-haptics\" type=\"checkbox\">Brief vibration on phase changes</label>","copy_0911":"<button type=\"button\" class=\"text-button\" data-v5=\"shortcuts\">Keyboard shortcuts</button></fieldset>","copy_0912":"Screen wake lock is unavailable right now.","copy_0913":"Ambient audio is unavailable. Text guidance remains available.","copy_0914":"Your optional pause","copy_0915":"Beginning in ","copy_0916":"Serein isolated test","copy_0917":"Fixture only","copy_0918":"Crypto round-trip failed","copy_0919":"This encrypted archive has an unsupported format.","copy_0920":"The encrypted archive is damaged.","copy_0921":"The operation was cancelled because Serein data changed. No records were restored.","copy_0922":"The existing archive could not be read and has been protected. Open Data & privacy to download a recovery copy.","copy_0923":"Saved data changed in another tab. This tab has kept its changes in memory. Export them before reloading to avoid overwriting newer records.","copy_0924":"Browser storage is unavailable or full. Latest changes stay in memory; export a copy before leaving.","copy_0925":"Encrypted changes could not be saved. Keep this tab open and export a copy.","copy_0926":"Another privacy operation is finishing. Try again shortly.","copy_0927":"Use at least six characters. A longer passphrase is stronger.","copy_0928":"The journal lock is already enabled.","copy_0929":"Encryption was not enabled because the encrypted copy could not be saved.","copy_0930":"The lock is enabled. Check and remove any old copies in this browser.","copy_0931":"The passcode is incorrect, or the encrypted records are damaged. No records were opened.","copy_0932":"The lock was kept because normal storage could not be written.","copy_0933":"Another privacy operation is finishing. Try the export again shortly.","copy_0934":"Enable the journal lock to create an encrypted export.","copy_0935":" target=\"_blank\" rel=\"noopener noreferrer\"","copy_0936":"<header class=\"page-header infographic-heading\"><div><p class=\"eyebrow\">SEREIN / VISUAL LEARNING</p><h1>A clearer picture. A useful next step.</h1><p class=\"page-sub\">Twelve richly illustrated guides for real working days. Read at your pace, enlarge a page, or explore the sources.</p></div><span class=\"infographic-count\">12 illustrated guides</span></header>","copy_0937":"<div class=\"infographic-filters\" role=\"group\" aria-label=\"Infographic topics\">","copy_0938":"<button class=\"ig-filter\" data-ig=\"filter\" data-value=\"","copy_0939":"<section class=\"ig-viewer\" aria-label=\"Educational infographic viewer\" aria-roledescription=\"carousel\" data-key=\"infographic-reader\">","copy_0940":"<div class=\"ig-book\"><div class=\"ig-pagebar\"><div><span class=\"eyebrow\">","copy_0941":"</span><p id=\"ig-position\" aria-live=\"polite\" aria-atomic=\"true\">","copy_0942":"</p></div><div class=\"ig-turns\"><button class=\"icon-btn\" data-ig=\"previous\" aria-label=\"Previous infographic\"","copy_0943":"</button><button class=\"icon-btn\" data-ig=\"next\" aria-label=\"Next infographic\"","copy_0944":"<figure class=\"ig-figure\" aria-label=\"","copy_0945":"\"><button class=\"ig-artwork\" data-ig=\"zoom\" aria-label=\"Enlarge ","copy_0946":"\" aria-describedby=\"ig-image-help\"><img id=\"ig-image\" src=\"","copy_0947":"\" decoding=\"async\"></button><figcaption id=\"ig-image-help\">Illustrated infographic · Click to enlarge · Swipe or use the arrow buttons to flip</figcaption></figure>","copy_0948":"<div class=\"ig-actions\"><button class=\"button button-outline\" data-ig=\"zoom\">","copy_0949":" Enlarge image</button><a class=\"button button-outline\" href=\"","copy_0950":" Download image</a></div><p class=\"small-note ig-key-help\">With the viewer focused: ← / → changes the page; Home / End jumps to the first / last page. Pages never turn automatically.</p></div>","copy_0951":"<div class=\"ig-reading\" data-key=\"infographic-text\"><p class=\"eyebrow\">","copy_0952":"</h2><div class=\"ig-fact\"><strong>","copy_0953":"</p><dl class=\"ig-context\"><dt>Who it is for</dt><dd>","copy_0954":"</dd><dt>When to use it</dt><dd>","copy_0955":"</dd><dt>Why it matters</dt><dd>","copy_0956":"</dd></dl><h3>How to put it into practice</h3><ol class=\"ig-steps\">","copy_0957":"</ol><a class=\"button button-teal\" href=\"#","copy_0958":"</a><details class=\"ig-source\"><summary>Source, context &amp; limitations</summary><p>","copy_0959":"<section class=\"ig-collection\" aria-labelledby=\"ig-collection-heading\"><div class=\"section-heading\"><div><h2 id=\"ig-collection-heading\">Choose a page</h2><p>","copy_0960":"guides in the collection","copy_0961":"</p></div><a class=\"text-button\" href=\"#toolkit\">Return to Toolkit →</a></div><div class=\"ig-thumbnails\">","copy_0962":"<button class=\"ig-thumb\" data-ig=\"select\" data-id=\"","copy_0963":"\"><img src=\"","copy_0964":"\" width=\"120\" height=\"160\" alt=\"\" loading=\"lazy\" decoding=\"async\"><span><small>","copy_0965":"<div class=\"ig-zoom\"><p class=\"small-note\">Scroll in both directions to explore the enlarged image. A text version and source details are available in the reader.</p><div class=\"ig-zoom-image-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Enlarged infographic; scroll horizontally and vertically\"><img src=\"","copy_0966":"\"></div><a class=\"button button-outline\" href=\"","copy_0967":" Download this infographic</a></div>","copy_0968":"perspective(1200px) rotateY(","copy_0969":"deg) translateX("}};S.locale='en-GB';S.t=function(key,vars){const text=S.STRINGS[S.locale]?.[key]??S.STRINGS['en-GB'][key]??key;return String(text).replace(/\{(v[0-9]+)\}/g,function(match,name){return vars&&Object.prototype.hasOwnProperty.call(vars,name)?String(vars[name]):match;});};})(globalThis.Serein=globalThis.Serein||{});


;

globalThis.Serein=globalThis.Serein||{};
globalThis.Serein.data = {"practices":[{"id":"tide","title":"Breathing Tide","tag":"BREATHE","category":"Breathing","duration":"1–5 min","image":"breathing","color":"#dce7df","desc":"Follow a soft, expanding light. Let the next breath arrive gently.","intro":"A breath, not a performance.","instruction":"Let the light grow as you breathe in, and soften as you breathe out. Stay with a comfortable, unforced breath.","safety":"No breath holding. The timing is optional: breathe naturally or stop if the pace feels uncomfortable or you feel dizzy.","originalImage":"coast","originalPhases":{"defaultSeconds":120,"paceOptions":[[3,3],[4,6],[5,5]],"defaultPace":[4,6],"cyclic":true,"phases":[{"title":"Breathe in","seconds":4,"cue":"Gently, and only as far as feels comfortable."},{"title":"Breathe out","seconds":6,"cue":"Gently, and only as far as feels comfortable."}]},"durations":[60,120,180,300],"defaultDuration":120,"selfPaced":false,"position":"Seated","breathFocus":true,"movement":false,"steps":[["Breathe in","Gently, and only as far as feels comfortable."],["Breathe out","Gently, and only as far as feels comfortable."]],"photoPlan":[],"photo":"assets/coast.webp","cardAlt":"Illustrative coastline and calm sea"},{"id":"box","title":"Box Breathing","tag":"FIND A RHYTHM","category":"Breathing","duration":"4–12 cycles","image":"breathing","color":"#e9e5d7","desc":"Follow a steady rhythm, one phase at a time. Holds are optional.","intro":"One side. One moment.","instruction":"Follow the light around the square. Each side marks a phase. You can turn holds off and breathe continuously.","safety":"Never strain or force a breath hold. Choose “No holds” if holding is uncomfortable. If unsure about breath holds because of a health condition, seek advice from your clinician.","originalImage":"forest","originalPhases":{"defaultCycles":8,"phaseSecondsOptions":[3,4,5],"defaultPhaseSeconds":4,"cyclic":true,"phases":[{"title":"Breathe in","seconds":4,"cue":"Gently, and only as far as feels comfortable."},{"title":"Hold gently","seconds":4,"cue":"Only if comfortable. No strain, no forcing."},{"title":"Breathe out","seconds":4,"cue":"Gently, and only as far as feels comfortable."},{"title":"Rest gently","seconds":4,"cue":"Only if comfortable. No strain, no forcing."}],"noHoldsPhaseTitles":["Breathe in","Breathe out"]},"durations":[60,120,180,300],"defaultDuration":120,"selfPaced":false,"position":"Seated","breathFocus":true,"movement":false,"steps":[["Breathe in","Gently, and only as far as feels comfortable."],["Hold gently","Only if comfortable. No strain, no forcing."],["Breathe out","Gently, and only as far as feels comfortable."],["Rest gently","Only if comfortable. No strain, no forcing."]],"photoPlan":[],"photo":"assets/mountain.webp","cardAlt":"Illustrative mountain landscape"},{"id":"ground","title":"Here & Now","tag":"5 · 4 · 3 · 2 · 1","category":"Grounding","duration":"Your own pace","image":"grounding","color":"#e9e4db","desc":"Reconnect with your surroundings through five simple senses.","intro":"Let the room meet you.","instruction":"Notice things in your actual surroundings, not just on this screen. Tap a stone for each thing you notice. No writing or sharing needed.","safety":"Keep your eyes open if that feels safer. Skip or substitute any sense that is inaccessible, unpleasant, or uncomfortable. Nothing needs to be tasted or touched.","originalImage":"mountain","originalPhases":{"selfPaced":true,"steps":[{"title":"See","count":5,"line":"Notice five things you can see.","hint":"A color, a shape, the way light meets a surface."},{"title":"Feel","count":4,"line":"Notice four comfortable physical sensations.","hint":"Your feet supported, the chair, your sleeve. No need to touch new objects."},{"title":"Hear","count":3,"line":"Notice three sounds around you.","hint":"Nearby or far away. If hearing is not accessible, notice three visual details."},{"title":"Smell","count":2,"line":"Notice two neutral or pleasant smells.","hint":"If none are available, recall familiar scents or choose two colors instead."},{"title":"Taste","count":1,"line":"Notice one taste, if comfortable.","hint":"Nothing needs to go in your mouth. Alternatively, name one thing you appreciate."}]},"durations":[],"defaultDuration":120,"selfPaced":true,"position":"Seated","breathFocus":false,"movement":false,"steps":[["See","Notice five things you can see. A color, a shape, the way light meets a surface."],["Feel","Notice four comfortable physical sensations. Your feet supported, the chair, your sleeve. No need to touch new objects."],["Hear","Notice three sounds around you. Nearby or far away. If hearing is not accessible, notice three visual details."],["Smell","Notice two neutral or pleasant smells. If none are available, recall familiar scents or choose two colors instead."],["Taste","Notice one taste, if comfortable. Nothing needs to go in your mouth. Alternatively, name one thing you appreciate."]],"photoPlan":[["awareness",0],["awareness",1],["awareness",2],["awareness",3],["awareness",3]],"photo":"assets/awareness-0.webp"},{"id":"release","title":"Soften & Release","tag":"MUSCLE RELAXATION","category":"Movement","duration":"2 min","image":"release","color":"#e4e9da","desc":"Notice gentle tension and release, at your own pace.","intro":"A little less to carry.","instruction":"The highlighted area shows where to place your attention. Use only light tension, breathe normally, and notice the release. The final step is rest only.","safety":"Avoid tensing painful or injured areas; choose “Relax only” or skip. Stop if you feel pain or discomfort. This is a short PMR-inspired adaptation, not a clinical protocol.","originalImage":"leaves","originalPhases":{"defaultSeconds":120,"secondsPerPhase":30,"lightEffortSeconds":5,"relaxOnlyAvailable":true,"phases":[{"title":"Hands","effortPhase":"Gently tense","effortCue":"Lightly close your hands. Keep breathing normally.","releasePhase":"Soften & notice","releaseCue":"Let your fingers soften. Notice without judging."},{"title":"Shoulders","effortPhase":"Gently tense","effortCue":"Lift your shoulders just a little. Keep breathing.","releasePhase":"Soften & notice","releaseCue":"Let your shoulders settle. There is no perfect position."},{"title":"Feet","effortPhase":"Gently tense","effortCue":"Lightly press your feet into the floor. No straining.","releasePhase":"Soften & notice","releaseCue":"Release the effort in your feet and lower legs."},{"title":"Rest & notice","releasePhase":"Soften & notice","releaseCue":"Let your whole body be supported. Breathe naturally."}]},"durations":[120],"defaultDuration":120,"selfPaced":false,"position":"Seated","breathFocus":false,"movement":true,"steps":[["Hands","Let your fingers soften. Notice without judging."],["Shoulders","Let your shoulders settle. There is no perfect position."],["Feet","Release the effort in your feet and lower legs."],["Rest & notice","Let your whole body be supported. Breathe naturally."]],"photoPlan":[["hands",3],["shoulders",3],["feet",3],["release",3]],"photo":"assets/hands-3.webp"},{"id":"desk","title":"The Seated Reset","tag":"GENTLE MOVEMENT","category":"Movement","duration":"90 sec","image":"seated","color":"#ecdfd0","desc":"Ease your shoulders, uncurl your hands, and gently turn your head.","intro":"Move a little. Notice a little.","instruction":"Sit on a stable, non-wheeled chair, with feet supported. Use a small comfortable range. The figure is a schematic cue, not a posture assessment.","safety":"Skip any movement that is unsuitable, painful, or makes you dizzy. Do not force a stretch or roll your neck. Check with a clinician if unsure whether these movements are suitable.","originalImage":"forest","originalPhases":{"defaultSeconds":90,"secondsPerPhase":30,"phases":[{"title":"Shoulder lift & release","phase":"Lift, then let go","cue":"Gently lift your shoulders a little, then let them lower."},{"title":"Open & soften hands","phase":"Open, then soften","cue":"Slowly uncurl your fingers, then let your hands soften."},{"title":"Gentle neck turns","phase":"Turn, then return","cue":"Turn left within a comfortable range, return to center, then right."}]},"durations":[90],"defaultDuration":90,"selfPaced":false,"position":"Seated","breathFocus":false,"movement":true,"steps":[["Shoulder lift & release","Gently lift your shoulders a little, then let them lower."],["Open & soften hands","Slowly uncurl your fingers, then let your hands soften."],["Gentle neck turns","Turn left within a comfortable range, return to center, then right."]],"photoPlan":[["shoulders",1],["hands",1],["shoulders",3]],"photo":"assets/shoulders-1.webp"},{"id":"scan","title":"Body Scan Journey","category":"Awareness","image":"release","duration":"2–5 min","seconds":180,"visual":"scan","desc":"Move attention gently through supported body areas.","steps":[["Feet & support","Notice contact with the floor or chair. Nothing needs to change."],["Legs","Notice whatever is present, or choose to focus on the room instead."],["Hands","Notice the weight and temperature of your hands."],["Shoulders","Notice support. There is no need to soften on command."],["Face","Notice your expression without judging it."],["Whole body","Broaden attention, then look around the room."]],"safety":"Skip any area or use external focus if body attention feels uncomfortable.","tag":"AWARENESS","intro":"Body Scan Journey","instruction":"Notice contact with the floor or chair. Nothing needs to change.","finalImage":"timeline-scan","photoPhasePlan":[["feet",0],["release",3],["hands",3],["shoulders",3],["awareness",1],["awareness",3]],"durations":[120,180,300],"defaultDuration":180,"selfPaced":false,"position":"Seated","breathFocus":false,"movement":false,"photoPlan":[["feet",0],["release",3],["hands",3],["shoulders",3],["awareness",1],["awareness",3]],"photo":"assets/awareness-1.webp","cardAlt":"Illustrative healthcare worker seated in a quiet room"},{"id":"fullrelease","title":"Full Muscle Release","category":"Movement","image":"release","duration":"3–5 min","seconds":240,"visual":"release","desc":"Explore light effort and release across several areas.","steps":[["Hands","Optional: close your hands lightly, then let them open."],["Arms","Optional: use a little effort in the arms, then release."],["Shoulders","Optional: make a small lift, then return comfortably."],["Feet","Optional: press feet lightly into support, then release."],["Rest","No effort here. Notice the chair supporting you."]],"safety":"Use only light effort. Avoid painful or injured areas. Relax-only mode is available.","tag":"MOVEMENT","intro":"Full Muscle Release","instruction":"Optional: close your hands lightly, then let them open.","finalImage":"timeline-fullrelease","photoPhasePlan":[["release",0],["release",1],["release",2],["feet",1],["release",3]],"durations":[180,240,300],"defaultDuration":240,"selfPaced":false,"position":"Seated","breathFocus":false,"movement":true,"photoPlan":[["release",0],["release",1],["release",2],["feet",1],["release",3]],"photo":"assets/release-0.webp"},{"id":"handreset","title":"Hand & Finger Reset","category":"Movement","image":"detail-hands","duration":"60–90 sec","seconds":90,"visual":"hands","desc":"A close-up guide to gently opening and resting your hands.","steps":[["Settle","Rest your forearms comfortably. Keep wrists neutral."],["Open gently","Gently uncurl your fingers in a comfortable range."],["Return","Return to a relaxed hand. Do not grip tightly."],["Rest","Let the hands be supported."]],"safety":"Stop for pain, tingling, or discomfort. This is a movement cue, not treatment.","tag":"MOVEMENT","intro":"Hand & Finger Reset","instruction":"Rest your forearms comfortably. Keep wrists neutral.","finalImage":"timeline-handreset","photoPhasePlan":[["hands",0],["hands",1],["hands",2],["hands",3]],"durations":[60,90],"defaultDuration":90,"selfPaced":false,"position":"Seated","breathFocus":false,"movement":true,"photoPlan":[["hands",0],["hands",1],["hands",2],["hands",3]],"photo":"assets/hands-0.webp"},{"id":"shoulderreset","title":"Shoulder Reset","category":"Movement","image":"detail-shoulders","duration":"60–90 sec","seconds":90,"visual":"shoulders","desc":"Follow a small lift and a gentle return to rest.","steps":[["Settle","Sit supported with arms resting comfortably."],["Small lift","If comfortable, lift shoulders a little. Keep breathing naturally."],["Return","Return gently. Avoid forcing shoulders downward."],["Rest","Notice support and stop whenever you prefer."]],"safety":"Use a small comfortable range. Skip painful or injured areas.","tag":"MOVEMENT","intro":"Shoulder Reset","instruction":"Sit supported with arms resting comfortably.","finalImage":"timeline-shoulderreset","photoPhasePlan":[["shoulders",0],["shoulders",1],["shoulders",2],["shoulders",3]],"durations":[60,90],"defaultDuration":90,"selfPaced":false,"position":"Seated","breathFocus":false,"movement":true,"photoPlan":[["shoulders",0],["shoulders",1],["shoulders",2],["shoulders",3]],"photo":"assets/shoulders-0.webp"},{"id":"ankles","title":"Seated Foot & Ankle Movement","category":"Movement","image":"detail-feet","duration":"1–2 min","seconds":120,"visual":"feet","desc":"Explore a small up-and-down movement while seated.","steps":[["Settle","Use a stable chair. Support your leg and foot comfortably."],["Small movement","If comfortable, move the ankle gently up and down."],["Other side","Repeat on the other side only if suitable."],["Rest","Return both feet to comfortable support."]],"safety":"Do not force range. Skip if movement is unsuitable, painful, or causes discomfort.","tag":"MOVEMENT","intro":"Seated Foot & Ankle Movement","instruction":"Use a stable chair. Support your leg and foot comfortably.","finalImage":"timeline-ankles","photoPhasePlan":[["feet",0],["feet",1],["feet",2],["feet",3]],"durations":[60,120],"defaultDuration":120,"selfPaced":false,"position":"Seated","breathFocus":false,"movement":true,"photoPlan":[["feet",0],["feet",1],["feet",2],["feet",3]],"photo":"assets/feet-0.webp"},{"id":"listen","title":"Mindful Listening","category":"Awareness","image":"grounding","duration":"1–3 min","seconds":120,"visual":"listen","desc":"Notice nearby and distant sounds without recording them.","steps":[["Arrive","Look around. Choose a comfortable position."],["Nearby","Notice a nearby sound, or a nearby visual detail."],["Further away","Notice something further away. No need to search hard."],["Whole space","Allow attention to include the room as a whole."]],"safety":"Use visual details if hearing is inaccessible or focusing on sound is uncomfortable. No microphone is used.","tag":"AWARENESS","intro":"Mindful Listening","instruction":"Look around. Choose a comfortable position.","finalImage":"timeline-listen","photoPhasePlan":[["awareness",0],["awareness",1],["awareness",2],["awareness",3]],"durations":[60,120,180],"defaultDuration":120,"selfPaced":false,"position":"Seated","breathFocus":false,"movement":false,"photoPlan":[["awareness",0],["awareness",1],["awareness",2],["awareness",3]],"photo":"assets/seated.webp","cardAlt":"Illustrative healthcare worker seated beside a window"},{"id":"pause3","title":"Three-Minute Pause","category":"Awareness","image":"breathing","duration":"3 min","seconds":180,"visual":"pause","desc":"Notice, choose an anchor, then broaden awareness.","steps":[["Notice","Notice how you are arriving: thoughts, feelings, or surroundings."],["Anchor","Choose natural breathing, supported feet, or a visual detail."],["Broaden","Include the body and room. Choose one useful next step."]],"safety":"Breathing is optional. Keep attention external if that feels more comfortable.","tag":"AWARENESS","intro":"Three-Minute Pause","instruction":"Notice how you are arriving: thoughts, feelings, or surroundings.","finalImage":"timeline-pause3","photoPhasePlan":[["awareness",0],["awareness",2],["awareness",3]],"durations":[180],"defaultDuration":180,"selfPaced":false,"position":"Seated","breathFocus":false,"movement":false,"photoPlan":[["awareness",0],["awareness",2],["awareness",3]],"photo":"assets/awareness-3.webp","cardAlt":"Illustrative healthcare worker resting in a chair"},{"id":"quietplace","title":"Quiet Place Visualization","category":"Visualization","image":"recovery","duration":"2–5 min","seconds":180,"visual":"scene","desc":"Explore a gentle imagined scene, with motion optional.","steps":[["Choose","Choose an ordinary place that feels comfortable enough."],["Notice","Notice imagined light, colors, or textures. You can simply view the photograph."],["Stay gently","No need to create a vivid image. Keep your eyes open if preferred."],["Return","Look around your actual room and notice its support."]],"safety":"Skip imagery if it feels uncomfortable. Choose grounding in your actual surroundings instead.","tag":"VISUALIZATION","intro":"Quiet Place Visualization","instruction":"Choose an ordinary place that feels comfortable enough.","finalImage":"timeline-quietplace","photoPhasePlan":[["awareness",0],["awareness",1],["awareness",2],["awareness",3]],"durations":[120,180,300],"defaultDuration":180,"selfPaced":false,"position":"Seated","breathFocus":false,"movement":false,"photoPlan":[["awareness",0],["awareness",1],["awareness",2],["awareness",3]],"photo":"assets/forest.webp","cardAlt":"Illustrative woodland setting"},{"id":"walk","title":"Slow Walking Awareness","category":"Movement","image":"seated","duration":"2–5 min","seconds":180,"visual":"walk","desc":"A preview of slow steps, followed by screen-away prompts.","steps":[["Prepare","Choose a clear, level space. Preview while stationary."],["Step","Put the screen away before moving. Walk at your own comfortable pace."],["Notice","Notice ordinary contact and surroundings, without changing your gait."],["Return","Stop in a stable position and return attention to the room."]],"safety":"Use only if walking is suitable. Do not watch or operate the screen while walking. Seated awareness is an alternative.","tag":"MOVEMENT","intro":"Slow Walking Awareness","instruction":"Choose a clear, level space. Preview while stationary.","finalImage":"timeline-walk","photoPhasePlan":[["walking",0],["walking",1],["walking",2],["walking",3]],"durations":[120,180,300],"defaultDuration":180,"selfPaced":false,"position":"Walking","breathFocus":false,"movement":true,"photoPlan":[["walking",0],["walking",1],["walking",2],["walking",3]],"photo":"assets/walking-0.webp"},{"id":"winddown","title":"Evening Wind-Down","category":"Awareness","image":"recovery","duration":"3–5 min","seconds":240,"visual":"winddown","desc":"A quiet sequence of support, awareness, and optional release.","steps":[["Supported rest","Choose a comfortable supported position."],["Notice support","Notice the surface supporting you, without trying to sleep."],["Gentle release","Let hands and shoulders rest. Tensing is not required."],["Set down","Notice one thing that can wait until tomorrow."],["Finish","End here or continue resting. There is no outcome to achieve."]],"safety":"This practice does not treat sleep difficulties or guarantee sleep. Stop or adapt if uncomfortable.","tag":"AWARENESS","intro":"Evening Wind-Down","instruction":"Choose a comfortable supported position.","finalImage":"timeline-winddown","photoPhasePlan":[["release",3],["feet",0],["hands",3],["awareness",1],["awareness",3]],"durations":[180,240,300],"defaultDuration":240,"selfPaced":false,"position":"Seated","breathFocus":false,"movement":false,"photoPlan":[["release",3],["feet",0],["hands",3],["awareness",1],["awareness",3]],"photo":"assets/release-3.webp"}],"resources":[{"id":"reset","category":"Mindfulness","label":"MINDFUL MOMENT","title":"A little pause. A fresh perspective.","duration":"2 min practice","image":"assets/coast.webp","imageAlt":"Illustrative coastline and calm sea","desc":"A gentle, guided breathing space between appointments.","body":"A brief pause is not another thing to achieve. It is a chance to notice how you are arriving in this moment.","steps":["Settle into a supported position. Keep your eyes open or softly lower your gaze.","Breathe gently in for four seconds, then out for six. Do not force or hold your breath.","When your attention wanders, return to the feeling of your feet on the ground."],"extra":"If focusing on your breath is uncomfortable, breathe normally and name five things you can see instead. Stop if you feel dizzy or distressed.","originalImage":"coast"},{"id":"compassion","category":"Practitioner care","label":"PRACTITIONER CARE","title":"Caring without carrying it all","duration":"4 min read","image":"assets/leaves.webp","imageAlt":"Illustrative close-up of green leaves","desc":"A compassionate approach to boundaries and recovery.","body":"Caring deeply and protecting your own capacity can coexist. A boundary is not a measure of how much you care; it is a way to make care sustainable.","steps":["Notice your early signs of depletion: irritability, emotional distance, or difficulty switching off. These experiences deserve attention, not self-judgment.","Create a closing ritual: finish essential documentation, identify the next safe step, and name what can wait.","Use supervision and peer support. Keep patient information within approved confidential settings.","If distress persists or affects safe practice, seek support from an occupational health service or qualified mental health professional."],"extra":"Reflection: What is one responsibility you can share, clarify, or set down today?","originalImage":"leaves"},{"id":"grounding","category":"Shared practice","label":"IN YOUR TOOLKIT","title":"Finding your feet in the present","duration":"3 min practice","image":"assets/awareness-0.webp","imageAlt":"Illustrative healthcare worker seated with feet supported","desc":"An adaptable sensory grounding exercise for shared practice.","body":"Grounding may help some people reconnect with the present. Offer it as an invitation rather than a requirement, and ask what feels accessible and comfortable.","steps":["Look around and gently name five things you can see.","Notice four physical sensations, such as the chair supporting you or your feet on the floor.","Listen for three sounds; then notice two neutral or pleasant smells, if comfortable.","Name one thing that feels steady right now. Skip any sense that is inaccessible or uncomfortable."],"extra":"This practice is optional and is not a treatment or crisis intervention. Stop or adapt it if it increases discomfort.","originalImage":"mountain"},{"id":"sleep","category":"Shared practice","label":"REST & RECOVERY","title":"Make room for restorative rest","duration":"5 min read","image":"assets/forest.webp","imageAlt":"Illustrative woodland setting","desc":"Small, realistic changes that can support a steadier sleep routine.","body":"Rest is personal. Begin with curiosity about routines, responsibilities, symptoms, medication, and the environment rather than assuming there is one perfect schedule.","steps":["Choose a realistic, reasonably consistent wake-up time.","Make a small transition between the demands of the day and bedtime.","Discuss the timing of caffeine and other stimulants with an appropriate professional.","For persistent sleep difficulties, consider assessment and evidence-based support such as CBT-I."],"extra":"Avoid making changes to prescribed medication without consulting the prescriber.","originalImage":"forest"},{"id":"reflection","category":"Practitioner care","label":"REFLECTIVE PRACTICE","title":"Leave the day a little lighter","duration":"3 min reflection","image":"assets/reflection.webp","imageAlt":"Illustrative quiet space for reflection","desc":"A brief end-of-day reflection without judgment.","body":"Reflection is most useful when it creates understanding rather than another standard to meet. You do not need to solve the whole day before you leave it.","steps":["Name one moment of connection or meaningful work.","Notice one demand that felt difficult. Describe it without blaming yourself.","Choose one practical support for tomorrow: a pause, a conversation, or a clearer boundary."],"extra":"Keep personal reflections free of patient names or identifying details.","originalImage":"coast"},{"id":"checkins","category":"Practitioner care","label":"PERSONAL AWARENESS","title":"A check-in starts a conversation","duration":"4 min read","image":"assets/seated.webp","imageAlt":"Illustrative healthcare worker taking a seated pause","desc":"Notice your experience without turning it into a score.","body":"A personal check-in captures a moment in your own words. Feelings change with context; no label can describe your whole experience.","steps":["Choose the feeling that fits this moment, or skip the check-in.","Add context only if useful. Keep it free of patient names and identifying details.","Decide whether to keep the entry for this visit or save it in your browser.","Use your own words to notice what support or practical change would help."],"extra":"Serein does not interpret check-ins as a diagnosis, risk assessment, or a measure of professional performance.","originalImage":"leaves"},{"id":"ask-support","category":"Practitioner care","label":"ASKING FOR SUPPORT","title":"Start a useful support conversation","duration":"3 min read","image":"assets/release.webp","imageAlt":"Illustrative healthcare worker seated beside a window","desc":"Turn a difficult demand into a clear request.","body":"A useful support conversation describes the situation and the help needed. You do not need to wait until you are overwhelmed to ask.","steps":["Describe the demand: \"I have several time-critical tasks and need help prioritizing.\"","Explain the practical impact without sharing patient details in this app.","Make one specific request: help with a task, protected time, clarification, or a short conversation.","Agree who will do what, and when you will check back. Use your workplace escalation pathway for immediate safety concerns."],"extra":"Practice wording: \"Can we agree the immediate priorities and who can help?\" This is an educational conversation guide.","originalImage":"mountain"},{"id":"shift-home","category":"Practitioner care","label":"AFTER YOUR SHIFT","title":"A gentler transition home","duration":"3 min read","image":"assets/walking-3.webp","imageAlt":"Illustrative healthcare worker standing in a quiet room","desc":"Close the workday with a realistic transition.","body":"A transition does not need to erase the day. It can help you acknowledge what happened and move into the next part of your life.","steps":["Complete essential handover and documentation in your approved workplace system.","Identify one unfinished matter and its agreed next owner or next step.","Choose a small transition: change clothes, have a drink, sit quietly, or take a comfortable walk.","Ask yourself what recovery is realistic today. If the shift remains difficult to process, consider a trusted colleague or professional support."],"extra":"Original Serein reflection: \"A difficult shift does not erase the care you gave.\"","originalImage":"forest"},{"id":"boundaries","title":"A boundary you can actually say","label":"BOUNDARIES","image":"assets/awareness-1.webp","imageAlt":"Illustrative healthcare worker looking towards a plant","desc":"Make a respectful, specific request.","body":"A useful boundary explains your capacity and offers a workable next step. Adapt the words to your role and workplace responsibilities.","steps":["Name the request or demand clearly.","Describe your current capacity: \"I can complete this after the urgent task, or we can agree another owner.\"","Offer a realistic option rather than promising work you cannot safely complete.","Confirm priorities with the appropriate supervisor when competing demands affect safe care."],"extra":"Try: \"I want to help. Can we agree what should take priority and what can wait?\"","category":"Practitioner care","duration":"3 min guide","originalImage":"leaves"},{"id":"peer-check","title":"Check in with a colleague","label":"PEER CONNECTION","image":"assets/awareness-2.webp","imageAlt":"Illustrative hands resting on a seated healthcare worker’s lap","desc":"Offer connection without pushing for disclosure.","body":"A supportive check-in can be short and respectful. Let the colleague choose whether to talk.","steps":["Ask permission: \"Would a quick check-in be useful?\"","Offer a choice: listen, practical help, or a quiet break.","Listen without diagnosing, minimizing, or insisting on details.","Respect privacy and workplace safeguarding responsibilities. Help the person access appropriate support when needed."],"extra":"Try: \"Would you like me to listen, help with something practical, or give you some space?\"","category":"Practitioner care","duration":"3 min guide","originalImage":"coast"},{"id":"priorities","title":"When everything feels urgent","label":"WORKLOAD CLARITY","image":"assets/mountain.webp","imageAlt":"Illustrative mountain landscape","desc":"Turn competing demands into a shared decision.","body":"Use a brief conversation to clarify priorities and available help. Clinical urgency belongs within your professional assessment and local protocols.","steps":["List the competing tasks in your approved work environment. Do not enter patient information here.","Identify immediate safety concerns and escalate through your workplace process.","Ask the appropriate lead to agree the order and who can help.","Repeat the agreement back and arrange a check-back if circumstances change."],"extra":"Try: \"These tasks overlap. Can we confirm the immediate priorities and available support?\"","category":"Practitioner care","duration":"3 min guide","originalImage":"mountain"},{"id":"difficult-talk","title":"Prepare for a difficult conversation","label":"CLEAR COMMUNICATION","image":"assets/awareness-3.webp","imageAlt":"Illustrative healthcare worker resting in a chair","desc":"Use observations, impact, and a clear request.","body":"Preparation can make a conversation more specific. Choose an appropriate private setting and follow your workplace policy.","steps":["Describe an observable event rather than a personal label.","Explain the impact on work or your ability to contribute.","Ask an open question and allow the other person to respond.","Agree one practical next step, an owner, and a review time."],"extra":"Practice: \"When the plan changed without a handover, I was unsure of my next task. How can we make the next change clearer?\"","category":"Practitioner care","duration":"3 min guide","originalImage":"forest"},{"id":"small-win","title":"Notice a small moment of meaning","label":"REFLECTION","image":"assets/walking-0.webp","imageAlt":"Illustrative healthcare worker taking a step in a quiet room","desc":"Reflect without turning the day into a grade.","body":"A reflection can acknowledge care, learning, or connection. A difficult day can remain difficult even when something meaningful happened.","steps":["Recall one ordinary moment you want to acknowledge.","Name what mattered: kindness, teamwork, asking a question, or noticing a need.","Describe it without patient names or identifying details.","Let it be enough. You do not have to find a positive lesson in every experience."],"extra":"Prompt: \"One moment I want to acknowledge today is...\"","category":"Practitioner care","duration":"3 min guide","originalImage":"coast"},{"id":"manager-support","title":"A supportive team conversation","label":"FOR TEAM LEADERS","image":"assets/team.webp","imageAlt":"Illustrative healthcare colleagues discussing practical support","desc":"Move from encouragement to practical support.","body":"A useful team conversation asks about working conditions and follows through on what can change. This is an educational conversation template.","steps":["Ask what is making the work harder and what is already helping.","Clarify practical barriers such as workload, breaks, role clarity, or access to supervision.","Agree one feasible change and an accountable owner.","Check back. Do not ask staff to disclose private health information in a group."],"extra":"Try: \"What would make this shift more workable, and what can we change together?\"","category":"Practitioner care","duration":"3 min guide","originalImage":"leaves"}],"reflections":[{"text":"You can care deeply without carrying everything alone.","by":"A Serein reflection"},{"text":"A difficult shift does not erase the care you gave.","by":"A Serein reflection"},{"text":"You are allowed to ask for support before you reach your limit.","by":"A Serein reflection"},{"text":"One small pause can make room for the next safe step.","by":"A Serein reflection"},{"text":"Reflection is a place to understand yourself, not grade yourself.","by":"A Serein reflection"},{"text":"Some days, recovery begins with doing one thing less.","by":"A Serein reflection"},{"text":"Your needs belong in the conversation, too.","by":"A Serein reflection"},{"text":"Rest is part of a sustainable practice.","by":"A Serein reflection"}],"moments":[{"title":"Before my shift","desc":"Arrive with one clear intention.","practice":"ground","prompt":"What is one thing I can prepare, and one support I can ask for?"},{"title":"Between tasks","desc":"A short pause in a busy day.","practice":"tide","prompt":"What needs my attention next, and what can safely wait?"},{"title":"After a difficult moment","desc":"Make space for support and recovery.","practice":"ground","prompt":"What do I need now: practical help, a colleague, or a quiet pause?"},{"title":"After my shift","desc":"Create a gentler transition home.","practice":"release","prompt":"What can I hand over, set down, or leave for tomorrow?"}],"sources":[{"title":"[1] Calm · Breathe Bubble and adjustable timing ↗ Reference for the familiar expanding-circle interaction, not a basis for clinical claims.","url":"https://support.calm.com/hc/en-us/articles/360000069973-Calm-Breathing-Exercises-How-to-Adjust-Speed-Timers-Haptics-Vibrations"},{"title":"[2] NHS · Breathing exercises for stress ↗ Comfortable, gentle, unforced breathing. Serein’s short timings are optional adaptations, not the NHS routine.","url":"https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/"},{"title":"[3] NHS inform · Grounding exercises ↗ The 5–4–3–2–1 sensory sequence, with optional accessibility substitutions here.","url":"https://www.nhsinform.scot/healthy-living/mental-wellbeing/breathing-and-relaxation-exercises/grounding-exercises/"},{"title":"[4] Royal National Orthopaedic Hospital · Relaxation techniques ↗ Progressive muscle relaxation background. The shortened routine and relax-only option here are adaptations.","url":"https://www.rnoh.nhs.uk/patients-and-visitors/patient-information-guides/relaxation-techniques-pain-management"},{"title":"[5] NHS · Sitting exercises ↗ Stable seating and comfortable neck-turning guidance. The combined 90-second seated reset is a Serein adaptation.","url":"https://www.nhs.uk/live-well/exercise/sitting-exercises/"},{"title":"[6] Calm · Box breathing ↗ Four-phase square breathing; holds are optional in this interface.","url":"https://www.calm.com/blog/box-breathing"},{"title":"Body scan & mindful awareness","url":"https://www.guysandstthomas.nhs.uk/health-information/mindfulness-based-stress-reduction-mbsr/mbsr-exercises"},{"title":"Sitting & ankle exercise guidance","url":"https://www.nhs.uk/live-well/exercise/sitting-exercises/"},{"title":"Relaxation & grounding","url":"https://www.nhsinform.scot/healthy-living/mental-wellbeing/breathing-and-relaxation-exercises/"},{"title":"Meditation & relaxation","url":"https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/how-can-meditation-help-with-sleep/"}],"images":{"detail-shoulders":"assets/detail-shoulders.webp","leaves":"assets/leaves.webp","detail-hands":"assets/detail-hands.webp","avatar":"assets/avatar.webp","detail-neck":"assets/detail-neck.webp","mountain":"assets/mountain.webp","coast":"assets/coast.webp","detail-feet":"assets/detail-feet.webp","portrait":"assets/avatar.webp","forest":"assets/forest.webp","breathing":"assets/coast.webp","grounding":"assets/mountain.webp","seated":"assets/seated.webp","release":"assets/release.webp","support":"assets/leaves.webp","reflection":"assets/reflection.webp","recovery":"assets/forest.webp","team":"assets/team.webp"},"frames":{"hands":["assets/hands-0.webp","assets/hands-1.webp","assets/hands-2.webp","assets/hands-3.webp"],"shoulders":["assets/shoulders-0.webp","assets/shoulders-1.webp","assets/shoulders-2.webp","assets/shoulders-3.webp"],"feet":["assets/feet-0.webp","assets/feet-1.webp","assets/feet-2.webp","assets/feet-3.webp"],"release":["assets/release-0.webp","assets/release-1.webp","assets/release-2.webp","assets/release-3.webp"],"walking":["assets/walking-0.webp","assets/walking-1.webp","assets/walking-2.webp","assets/walking-3.webp"],"awareness":["assets/awareness-0.webp","assets/awareness-1.webp","assets/awareness-2.webp","assets/awareness-3.webp"]},"descriptions":{"breathing":"Healthcare worker seated comfortably, taking a natural breathing pause.","grounding":"Healthcare worker noticing a plant and light in the surrounding room, with eyes open.","seated":"Healthcare worker seated on a stable chair with supported feet and a small comfortable head turn.","release":"Healthcare worker seated with open hands and relaxed shoulders after releasing effort.","support":"Two healthcare colleagues having a supportive conversation in a private staff room.","reflection":"Healthcare worker writing a personal reflection in a notebook.","recovery":"Healthcare worker taking a quiet pause at home after a shift.","team":"Healthcare colleagues discussing workload and practical support together."},"groundSteps":[{"title":"See","count":5,"line":"Notice five things you can see.","hint":"A color, a shape, the way light meets a surface."},{"title":"Feel","count":4,"line":"Notice four comfortable physical sensations.","hint":"Your feet supported, the chair, your sleeve. No need to touch new objects."},{"title":"Hear","count":3,"line":"Notice three sounds around you.","hint":"Nearby or far away. If hearing is not accessible, notice three visual details."},{"title":"Smell","count":2,"line":"Notice two neutral or pleasant smells.","hint":"If none are available, recall familiar scents or choose two colors instead."},{"title":"Taste","count":1,"line":"Notice one taste, if comfortable.","hint":"Nothing needs to go in your mouth. Alternatively, name one thing you appreciate."}]};


;

/* Media is resolved at the visible DOM boundary; portable builds replace the map. */
(function(S){
'use strict';
S.media={"assets/avatar.webp":"/serein/assets/avatar.webp","assets/awareness-0.webp":"/serein/assets/awareness-0.webp","assets/awareness-1.webp":"/serein/assets/awareness-1.webp","assets/awareness-2.webp":"/serein/assets/awareness-2.webp","assets/awareness-3.webp":"/serein/assets/awareness-3.webp","assets/coast.webp":"/serein/assets/coast.webp","assets/detail-feet.webp":"/serein/assets/detail-feet.webp","assets/detail-hands.webp":"/serein/assets/detail-hands.webp","assets/detail-neck.webp":"/serein/assets/detail-neck.webp","assets/detail-shoulders.webp":"/serein/assets/detail-shoulders.webp","assets/feet-0.webp":"/serein/assets/feet-0.webp","assets/feet-1.webp":"/serein/assets/feet-1.webp","assets/feet-2.webp":"/serein/assets/feet-2.webp","assets/feet-3.webp":"/serein/assets/feet-3.webp","assets/forest.webp":"/serein/assets/forest.webp","assets/hands-0.webp":"/serein/assets/hands-0.webp","assets/hands-1.webp":"/serein/assets/hands-1.webp","assets/hands-2.webp":"/serein/assets/hands-2.webp","assets/hands-3.webp":"/serein/assets/hands-3.webp","assets/icon-192.png":"/serein/assets/icon-192.png","assets/icon-512.png":"/serein/assets/icon-512.png","assets/infographics/end-shift.webp":"/serein/assets/infographics/end-shift.webp","assets/infographics/fatigue-journey.webp":"/serein/assets/infographics/fatigue-journey.webp","assets/infographics/five-senses.webp":"/serein/assets/infographics/five-senses.webp","assets/infographics/gentle-breathing.webp":"/serein/assets/infographics/gentle-breathing.webp","assets/infographics/micro-breaks.webp":"/serein/assets/infographics/micro-breaks.webp","assets/infographics/movement-week.webp":"/serein/assets/infographics/movement-week.webp","assets/infographics/pressure-at-work.webp":"/serein/assets/infographics/pressure-at-work.webp","assets/infographics/privacy-choices.webp":"/serein/assets/infographics/privacy-choices.webp","assets/infographics/sleep-recovery.webp":"/serein/assets/infographics/sleep-recovery.webp","assets/infographics/speak-up.webp":"/serein/assets/infographics/speak-up.webp","assets/infographics/thumbs/end-shift.webp":"/serein/assets/infographics/thumbs/end-shift.webp","assets/infographics/thumbs/fatigue-journey.webp":"/serein/assets/infographics/thumbs/fatigue-journey.webp","assets/infographics/thumbs/five-senses.webp":"/serein/assets/infographics/thumbs/five-senses.webp","assets/infographics/thumbs/gentle-breathing.webp":"/serein/assets/infographics/thumbs/gentle-breathing.webp","assets/infographics/thumbs/micro-breaks.webp":"/serein/assets/infographics/thumbs/micro-breaks.webp","assets/infographics/thumbs/movement-week.webp":"/serein/assets/infographics/thumbs/movement-week.webp","assets/infographics/thumbs/pressure-at-work.webp":"/serein/assets/infographics/thumbs/pressure-at-work.webp","assets/infographics/thumbs/privacy-choices.webp":"/serein/assets/infographics/thumbs/privacy-choices.webp","assets/infographics/thumbs/sleep-recovery.webp":"/serein/assets/infographics/thumbs/sleep-recovery.webp","assets/infographics/thumbs/speak-up.webp":"/serein/assets/infographics/thumbs/speak-up.webp","assets/infographics/thumbs/understanding-burnout.webp":"/serein/assets/infographics/thumbs/understanding-burnout.webp","assets/infographics/thumbs/work-design.webp":"/serein/assets/infographics/thumbs/work-design.webp","assets/infographics/understanding-burnout.webp":"/serein/assets/infographics/understanding-burnout.webp","assets/infographics/work-design.webp":"/serein/assets/infographics/work-design.webp","assets/leaves.webp":"/serein/assets/leaves.webp","assets/mountain.webp":"/serein/assets/mountain.webp","assets/reflection.webp":"/serein/assets/reflection.webp","assets/release-0.webp":"/serein/assets/release-0.webp","assets/release-1.webp":"/serein/assets/release-1.webp","assets/release-2.webp":"/serein/assets/release-2.webp","assets/release-3.webp":"/serein/assets/release-3.webp","assets/release.webp":"/serein/assets/release.webp","assets/seated.webp":"/serein/assets/seated.webp","assets/shoulders-0.webp":"/serein/assets/shoulders-0.webp","assets/shoulders-1.webp":"/serein/assets/shoulders-1.webp","assets/shoulders-2.webp":"/serein/assets/shoulders-2.webp","assets/shoulders-3.webp":"/serein/assets/shoulders-3.webp","assets/team.webp":"/serein/assets/team.webp","assets/walking-0.webp":"/serein/assets/walking-0.webp","assets/walking-1.webp":"/serein/assets/walking-1.webp","assets/walking-2.webp":"/serein/assets/walking-2.webp","assets/walking-3.webp":"/serein/assets/walking-3.webp"};
S.mediaURL=function(path){return S.media[path]||path;};
const placeholder='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="8" height="6"%3E%3Crect width="8" height="6" fill="%23EAF1ED"/%3E%3C/svg%3E';
S.mediaHTML=function(html){
 return String(html).replace(/<img\b[^>]*>/g,function(tag){
  const match=tag.match(/\ssrc="([^"]+)"/);if(!match||tag.includes('data-src='))return tag;
  const src=S.mediaURL(match[1]);
  if(tag.includes('fetchpriority="high"')||tag.includes('class="article-image"'))return tag.replace(match[0],' src="'+src+'"');
  return tag.replace(match[0],' src="'+placeholder.replace(/"/g,'&quot;')+'" data-src="'+src+'" decoding="async"');
 });
};
})(globalThis.Serein=globalThis.Serein||{});


;

/* One state model for every practice. No DOM or storage dependencies. */
(function(global){
'use strict';
function chooseDuration(practice,budget){
 if(practice.selfPaced)return null;
 const choices=practice.durations||[practice.defaultDuration];
 if(!budget)return choices.includes(practice.defaultDuration)?practice.defaultDuration:choices[0];
 return [...choices].filter(n=>n<=budget).sort((a,b)=>b-a)[0]??null;
}
function matchPractices(catalog,{budget=120,style='any',position='any',query='',category='All',saved=[]}={}){
 return catalog.filter(p=>{
  if(style==='nonbreath'&&p.breathFocus)return false;
  if(style==='ground'&&p.category!=='Grounding')return false;
  if(style==='breath'&&!p.breathFocus)return false;
  if(position==='still'&&p.movement)return false;
  if(position==='seated'&&p.position==='Walking')return false;
  if(category==='Saved'&&!saved.includes(p.id))return false;
  if(!['All','Saved'].includes(category)&&p.category!==category)return false;
  if(query&&!`${p.title} ${p.category} ${p.desc}`.toLowerCase().includes(query.toLowerCase()))return false;
  if(budget==='self')return p.selfPaced;
  return !budget||p.selfPaced||chooseDuration(p,+budget)!==null;
 });
}
class SessionEngine{
 constructor(practice,{duration,pace='4-6',noHolds=false,relaxOnly=false,external=false}={}){
  this.practice=practice;this.duration=practice.selfPaced?null:duration||chooseDuration(practice);this.pace=pace;this.noHolds=noHolds;this.relaxOnly=relaxOnly;this.external=external;this.elapsed=0;this.step=0;this.state='ready';this.anchor=0;this.noticed=new Set();
 }
 play(now=performance.now()){if(this.state==='complete')this.restart();this.anchor=now;this.state='playing';}
 pause(now=performance.now()){this.tick(now);if(this.state==='playing')this.state='paused';this.anchor=0;}
 tick(now=performance.now()){if(this.state==='playing'&&this.duration){this.elapsed=Math.min(this.duration,this.elapsed+Math.max(0,(now-this.anchor)/1000));this.anchor=now;if(this.elapsed>=this.duration){this.state='complete';this.anchor=0;}}return this.snapshot();}
 restart(){this.elapsed=0;this.step=0;this.state='ready';this.anchor=0;this.noticed.clear();}
 phases(){
  if(this.practice.id==='tide'){let [a,b]=this.pace.split('-').map(Number);return [{title:'Breathe in',cue:'Gently, only as far as feels comfortable.',seconds:a},{title:'Breathe out',cue:'Let the next breath leave without forcing it.',seconds:b}];}
  if(this.practice.id==='box')return (this.noHolds?['Breathe in','Breathe out']:['Breathe in','Hold gently','Breathe out','Rest gently']).map(title=>({title,cue:title.includes('gently')?'Only if comfortable. No strain, no forcing.':'Breathe gently at a comfortable pace.',seconds:Number(this.pace.split('-')[0])||4}));
  return this.practice.steps.map(([title,cue])=>({title,cue,seconds:this.duration?this.duration/this.practice.steps.length:null}));
 }
 snapshot(){
  let phases=this.phases(),index=this.step,progress=0,phaseElapsed=0;
  if(this.duration){if(this.practice.breathFocus){let cycle=phases.reduce((s,p)=>s+p.seconds,0),t=this.elapsed%cycle;index=0;while(index<phases.length-1&&t>=phases[index].seconds){t-=phases[index].seconds;index++;}phaseElapsed=t;progress=t/phases[index].seconds;}else{let span=this.duration/phases.length;index=Math.min(phases.length-1,Math.floor(this.elapsed/span));phaseElapsed=this.elapsed-index*span;progress=phaseElapsed/span;}}
  let phase=phases[index],cue=phase.cue,title=phase.title;
  if(this.practice.id==='release'&&index<3&&!this.relaxOnly){let p=this.practice.originalPhases.phases[index];let effort=phaseElapsed<5;title=effort?p.effortPhase:p.releasePhase;cue=effort?p.effortCue:p.releaseCue;}
  if(this.external)cue='Look around your actual room. Notice a neutral visual detail or a supported contact point.';
  if(this.relaxOnly&&this.practice.movement)cue='Let this area rest with comfortable support. No tensing or movement is needed.';
  if(this.state==='complete'){title='A moment made for you.';cue='Helpful, neutral, or uncomfortable — there is no response to achieve.';}
  const scale=this.practice.id==='tide'?(index===0?.72+.28*progress:1-.28*progress):this.practice.id==='box'?(index===0?.72+.28*progress:index===(this.noHolds?1:2)?1-.28*progress:index===1?1:.72):.9;
  return {index,title,cue,progress,phaseElapsed,elapsed:this.elapsed,remaining:this.duration?Math.max(0,this.duration-this.elapsed):null,percent:this.duration?this.elapsed/this.duration*100:(this.step+1)/phases.length*100,scale,state:this.state};
 }
 seek(seconds,now=performance.now()){if(!this.duration)return;this.elapsed=Math.max(0,Math.min(this.duration,seconds));if(this.elapsed===this.duration)this.state='complete';else if(this.state==='complete')this.state='paused';this.anchor=now;}
 jump(index,now=performance.now()){index=Math.max(0,Math.min(this.phases().length-1,index));if(this.duration){if(this.practice.breathFocus){const phases=this.phases(),cycle=phases.reduce((a,p)=>a+p.seconds,0),offset=phases.slice(0,index).reduce((a,p)=>a+p.seconds,0);let target=Math.floor(this.elapsed/cycle)*cycle+offset;if(target>=this.duration)target=offset;this.seek(target,now);}else this.seek(this.duration/this.phases().length*index,now);}else{this.step=index;this.noticed.clear();}if(this.state==='complete')this.state='paused';}
 next(){let s=this.snapshot();if(s.index===this.phases().length-1){this.state='complete';if(this.duration)this.elapsed=this.duration;}else this.jump(s.index+1);}
}
global.Serein.engine={SessionEngine,chooseDuration,matchPractices};
})(globalThis);


;

/* A small, optional WebGL sphere. The session remains fully usable without it. */
(function(global){
'use strict';
class SereinOrb{
 constructor(canvas,fallback){this.canvas=canvas;this.fallback=fallback;this.frame=0;this.gl=null;this.reduced=false;this.scale=.85;try{this.gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});if(this.gl)this.init();}catch{this.gl=null;}if(!this.gl)canvas.hidden=true;}
 init(){const gl=this.gl;const compile=(type,source)=>{let s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Optional visual unavailable');return s;};
 const vs=compile(gl.VERTEX_SHADER,'attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}');
 const fs=compile(gl.FRAGMENT_SHADER,`precision mediump float;uniform vec2 resolution;uniform float scale;uniform float time;void main(){vec2 uv=(gl_FragCoord.xy-.5*resolution)/min(resolution.x,resolution.y);uv.y-=.025;float r=.285*scale;float q=dot(uv,uv);if(q>r*r){gl_FragColor=vec4(0.);return;}vec3 n=normalize(vec3(uv,sqrt(r*r-q)));vec3 light=normalize(vec3(-.6,.8,1.2));float d=max(0.,dot(n,light));float rim=pow(1.-max(0.,n.z),2.5);float s=pow(max(0.,dot(reflect(-light,n),vec3(0.,0.,1.))),50.);float wave=.5+.5*sin(n.y*14.+n.x*9.+time*.28);vec3 base=mix(vec3(.035,.29,.34),vec3(.35,.70,.65),d);base+=vec3(.07,.12,.13)*wave*.25;base=mix(base,vec3(.62,.87,.82),rim*.5);base+=vec3(.8,.93,.9)*s*.7;gl_FragColor=vec4(base,1.);}`);
 let program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Optional visual unavailable');gl.useProgram(program);let buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);let loc=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);this.uniforms={resolution:gl.getUniformLocation(program,'resolution'),scale:gl.getUniformLocation(program,'scale'),time:gl.getUniformLocation(program,'time')};this.fallback.hidden=true;this.draw(.85,0);}
 draw(scale=.85,time=0){this.scale=scale;if(!this.gl){this.fallback.style.transform=`scale(${scale})`;return;}const gl=this.gl;let r=this.canvas.getBoundingClientRect(),d=Math.min(1.5,global.devicePixelRatio||1),w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;gl.viewport(0,0,w,h);}gl.uniform2f(this.uniforms.resolution,w,h);gl.uniform1f(this.uniforms.scale,scale);gl.uniform1f(this.uniforms.time,time);gl.drawArrays(gl.TRIANGLES,0,6);}
 start(getSnapshot){this.stop();const run=()=>{let s=getSnapshot();this.scale+=(s.scale-this.scale)*.12;this.draw(this.reduced?.85:this.scale,s.elapsed);this.frame=requestAnimationFrame(run);};this.frame=requestAnimationFrame(run);}
 stop(){cancelAnimationFrame(this.frame);this.frame=0;}
}
global.Serein.Orb=SereinOrb;
})(globalThis);


;

/* Serein editorial content. Sources support background principles, not product efficacy. */
globalThis.Serein.content = {
  updated: '2026-10-15',
  references: {
    gentle: {title:'NHS · Breathing exercises for stress',url:'https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/',scope:'Gentle, comfortable breathing. Serein uses optional shorter timings.'},
    grounding: {title:'NHS inform · Grounding exercises',url:'https://www.nhsinform.scot/healthy-living/mental-wellbeing/breathing-and-relaxation-exercises/grounding-exercises/',scope:'Sensory grounding, with optional substitutions in Serein.'},
    release: {title:'Royal National Orthopaedic Hospital · Relaxation techniques',url:'https://www.rnoh.nhs.uk/patients-and-visitors/patient-information-guides/relaxation-techniques-pain-management',scope:'Square breathing, muscle relaxation and calming imagery background; Serein uses optional timings and adaptations.'},
    sitting: {title:'NHS · Sitting exercises',url:'https://www.nhs.uk/live-well/exercise/sitting-exercises/',scope:'Stable seating and comfortable movement. Serein illustrations do not prescribe range.'},
    mindful: {title:'Guy’s and St Thomas’ · Mindfulness exercises',url:'https://www.guysandstthomas.nhs.uk/health-information/mindfulness-based-stress-reduction-mbsr/mbsr-exercises',scope:'Background on body awareness and mindfulness; not validation of this app.'},
    sleep: {title:'NHS · Meditation and sleep',url:'https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/how-can-meditation-help-with-sleep/',scope:'General wind-down information. Serein does not prescribe a sleep schedule.'},
    who: {title:'WHO · Guidelines on mental health at work (2022)',url:'https://www.who.int/publications/i/item/9789240053052',scope:'Workplace interventions, manager training, worker training and individual support.'},
    niosh: {title:'NIOSH · Impact Wellbeing Guide (2024)',url:'https://www.cdc.gov/niosh/healthcare/impactwellbeingguide/index.html',scope:'Six evidence-informed actions for healthcare workplace improvements.'},
    cdc: {title:'CDC · U.S. Quality of Worklife survey, 2018–2022 (published 2023)',url:'https://www.cdc.gov/mmwr/volumes/72/wr/mm7244e1.htm',scope:'Historical U.S. workforce survey. Associations are not proof of causation or Serein outcomes.'}
  },
  quotes: [
    {text:'You can begin with one clear intention and room to adapt.',moments:[0]},
    {text:'Preparation can include knowing who you can ask.',moments:[0]},
    {text:'Your first task is a starting point, not the whole day.',moments:[0]},
    {text:'A small pause can be ordinary and still belong here.',moments:[1]},
    {text:'The next useful step can be smaller than the whole problem.',moments:[1]},
    {text:'Noticing your limits can begin a practical conversation.',moments:[1]},
    {text:'You do not owe this moment an explanation before asking for support.',moments:[2]},
    {text:'You can choose connection, quiet, or practical help.',moments:[2]},
    {text:'A difficult moment does not have to become a private burden.',moments:[2]},
    {text:'An ending can be gentle without making the day simple.',moments:[3]},
    {text:'What has an agreed owner does not have to stay on your shoulders.',moments:[3]},
    {text:'The rest of your day deserves a little room, too.',moments:[3]}
  ],
  evidence: {
    tide:{why:'A simple external rhythm may make a brief pause easier to follow.',when:'A safe, seated break when attention to breathing feels comfortable.',how:'Choose a comfortable pace. Follow gently, or ignore the timing and breathe naturally.',refs:['gentle'],stat:['2','optional phases','In and out; this is the guide’s structure, not an effectiveness statistic.']},
    box:{why:'The square makes a four-part rhythm visible and predictable.',when:'A stationary pause when timed breathing and optional holds feel comfortable.',how:'Follow the gold ball. Each side marks a phase. Choose No holds to breathe continuously.',refs:['release','gentle'],stat:['4','visual phases','RNOH describes a four-second square rhythm. Serein offers optional pacing and no-holds adaptations; this count is not an effectiveness statistic.']},
    ground:{why:'Noticing the actual room offers an alternative to internal or breath-focused attention.',when:'When an outward focus feels more useful than closing your eyes or tracking breath.',how:'Select one stone per noticed detail. Skip or substitute any sense; nothing needs to be tasted or touched.',refs:['grounding'],stat:['5→1','sensory sequence','Five visual details down to one taste or alternative; an exercise structure.']},
    release:{why:'Noticing light effort and release offers a way to explore comfort and support.',when:'A supported seated pause, with relax-only available.',how:'Use only a small comfortable effort or select Relax only. Skip painful or unsuitable areas.',refs:['release']},
    desk:{why:'A brief change of focus and comfortable movement can fit a seated break.',when:'Seated securely, away from tasks needing uninterrupted attention.',how:'Follow small shoulder, hand and neck cues. Keep a comfortable range and skip any movement.',refs:['sitting']},
    scan:{why:'A guided sequence can help organize attention without needing to change sensations.',when:'When body attention is welcome; external focus is always an alternative.',how:'Notice one supported area at a time. Use the body map to jump or choose external focus.',refs:['mindful']},
    fullrelease:{why:'The contrast between a little effort and rest provides a structured attention cue.',when:'When gentle muscle attention is comfortable and suitable.',how:'Use very light effort, select Relax only, and skip areas that are painful or injured.',refs:['release']},
    handreset:{why:'A close-up sequence makes a small, optional movement easy to follow.',when:'During a seated break with forearms comfortably supported.',how:'Uncurl fingers gently, return to rest, and stop for pain, tingling or discomfort.',refs:['sitting','release']},
    shoulderreset:{why:'A small lift and return provides a simple movement and rest cue.',when:'When shoulders are comfortable and a supported seated pause is available.',how:'Lift only a little and return naturally. Relax only is available.',refs:['sitting','release']},
    ankles:{why:'A short supported movement sequence offers an alternative focus during a seated pause.',when:'Seated on a stable chair, with movements suitable for you.',how:'Move only in a comfortable range. Use Relax only or skip if unsuitable.',refs:['sitting']},
    listen:{why:'Listening to the real environment offers an outward attention anchor.',when:'A safe stationary setting, with visual substitutions if hearing is inaccessible.',how:'Notice a nearby and then a more distant sound without needing to label every sound.',refs:['mindful','grounding']},
    pause3:{why:'A short sequence creates space to notice and choose a next step.',when:'When you have three uninterrupted minutes and an optional attention anchor feels suitable.',how:'Notice what is here, settle on a comfortable anchor, then broaden attention. External focus is available.',refs:['mindful']},
    quietplace:{why:'An imagined neutral setting offers one possible attention focus.',when:'When imagery is welcome; choose an actual room detail if imagery feels unhelpful.',how:'Imagine only what feels comfortable. Eyes may remain open; external focus replaces imagery.',refs:['release','mindful']},
    walk:{why:'An ordinary movement can become a simple attention practice.',when:'Only in a safe, unobstructed place where walking is suitable.',how:'Read the cue first, then put the screen away. Choose a seated practice if walking is unsuitable.',refs:['mindful']},
    winddown:{why:'A predictable sequence can support a personal transition towards rest.',when:'After responsibilities are safely handed over and rest is possible.',how:'Notice support, choose one practical preparation, and allow a gentle ending.',refs:['sleep','mindful']}
  },
  studios: [
    {id:'boundary',title:'Boundary Rehearsal',tag:'FIND YOUR WORDS',icon:'shield',description:'Rehearse a realistic response to competing demands.',result:'A boundary you can say.',why:'Specific observations and requests make a conversation more actionable.',when:'Before a non-urgent conversation with a colleague or lead.',who:'Any healthcare worker; adapt to role and workplace policy.',refs:['who','niosh'],steps:['Choose a situation','Try a response','Make it yours','Your rehearsal'],fields:[['What can you realistically offer?','I can help once we agree which task takes priority.'],['What needs to be agreed?','An owner for the task that will wait.'],['When will you check back?','At the next agreed team check-in.']]},
    {id:'support',title:'Support Request Builder',tag:'ASK WITH CLARITY',icon:'support',description:'Turn a difficulty into a specific request and next step.',result:'An editable conversation plan.',why:'A clear request connects the situation to practical support.',when:'When you want help agreeing workload, breaks, supervision or priorities.',who:'Workers preparing a conversation with an appropriate colleague or lead.',refs:['who','niosh'],steps:['Name the need','Choose the support','Agree follow-through','Your request'],fields:[['Describe the situation without patient details','Several responsibilities overlap during the shift.'],['What impact does it have on your work?','I need clearer priorities to work reliably.'],['What practical support would help?','A lead to agree priorities and available cover.'],['Who could help?','My shift lead.'],['What next step could you propose?','A short conversation before the next task allocation.'],['When should you review it?','At an agreed time later in the shift.']]},
    {id:'transition',title:'Shift Transition',tag:'LEAVE THE DAY',icon:'moon',description:'Make room between the shift and the rest of your day.',result:'A personal transition checklist.',why:'A deliberate transition separates agreed work responsibilities from personal recovery.',when:'After handover through your approved workplace processes.',who:'Workers finishing a shift, including night and rotating shifts.',refs:['who','sleep'],steps:['Close the work loop','Choose your transition','Make room for recovery','Your checklist'],fields:[['What handover or owner needs confirming in the approved system?','Confirm the next responsible person through the normal handover.'],['What can wait until your next shift?','Routine learning notes, after checking priorities.'],['Choose one transition action','Change clothes and take a quiet seated moment.'],['What might make this action easier?','Prepare a small bag before the shift.'],['Choose one recovery support','A meal and an opportunity to rest.'],['Who or what could support it?','A trusted person or a quieter space.']]},
    {id:'difficult',title:'After a Difficult Moment',tag:'ONE NEXT STEP',icon:'heart',description:'Choose practical help, a quiet pause, or human connection.',result:'A manageable support plan.',why:'Different moments call for different forms of support; choice matters.',when:'Once immediate safety and work responsibilities have been addressed.',who:'Someone choosing their own support; no disclosure is required.',refs:['who','grounding'],steps:['Choose what would help','Make it practical','Keep a choice open','Your next step'],fields:[['What practical support would help now?','Ask the appropriate lead to clarify the next safe task.'],['Who could you contact, if you choose?','A trusted colleague, supervisor or usual professional support.'],['When could you take this step?','At the next safe opportunity.']]},
    {id:'team',title:'Team Pause Facilitator',tag:'INVITE, NEVER REQUIRE',icon:'expand',description:'Prepare an inclusive invitation and shared practice.',result:'A facilitator script and presentation.',why:'A shared invitation works best when people can decline, adapt or observe.',when:'A suitable break with agreement from the team.',who:'A facilitator and willing colleagues; never a clinical assessment.',refs:['who','niosh'],steps:['Plan the invitation','Choose the practice','Prepare adaptations','Your facilitator script'],fields:[['What will you say to invite the team?','Would a short optional pause be useful? Observing or sitting this out is equally welcome.'],['How will you close?','Thank you. No feedback or explanation is needed.']]},
    {id:'conditions',title:'Working Conditions Planner',tag:'FROM INSIGHT TO ACTION',icon:'sliders',description:'Turn a workplace barrier into an accountable small change.',result:'An action, owner and review date.',why:'Practical changes to working conditions belong alongside individual support.',when:'Preparing an appropriate team or leadership conversation.',who:'Workers and leaders using their normal workplace decision processes.',refs:['niosh','who','cdc'],steps:['Identify a barrier','Define a change','Agree ownership','Your action plan'],fields:[['Which practical barrier needs attention?','Breaks are frequently interrupted.'],['What would a workable improvement look like?','Agree a realistic cover arrangement.'],['What change could be tried?','Discuss a short cover trial with the shift lead.'],['What would show the change happened?','Whether agreed cover was available during the trial.'],['Who can agree and own the action?','The appropriate shift lead or manager.'],['When should it be reviewed?','2026-11-01']]}
  ],
  scenarios: [
    {title:'Another task arrives while priorities overlap',context:'You are asked to add a task while other agreed responsibilities are already competing for time.',options:[['Accept everything without discussion','This leaves the competing demands unresolved. Make capacity and priorities visible.'],['Ask the lead to agree priorities and ownership','This makes the conflict explicit and invites an accountable shared decision.'],['Tell the colleague that their task never matters','A personal dismissal is unlikely to help. Describe the situation and request a practical decision.']],best:1},
    {title:'An agreed break is repeatedly interrupted',context:'A planned break is interrupted by requests that could be discussed with the person coordinating cover.',options:[['Quietly abandon every break','The practical barrier remains. Consider asking how cover and interruptions can be managed.'],['Ask who is covering and which interruptions need escalation','This focuses on the working arrangement and invites clarification through the appropriate lead.'],['Promise that you will never respond to any request','An absolute promise may not fit your role or local arrangements. Agree a realistic plan.']],best:1},
    {title:'A request arrives as your shift ends',context:'A new request arrives while you are completing the normal handover process.',options:[['Leave without confirming responsibility','Clarify the next responsible person using the approved handover process.'],['Ask the appropriate lead to confirm ownership and priorities','This keeps the discussion specific and responsibility explicit.'],['Automatically stay indefinitely','Discuss capacity, urgency and ownership rather than making an open-ended commitment.']],best:1}
  ],
  journeys: [
    {id:'pause',title:'Finding your pause',description:'Explore attention, comfort and a practice that fits your day.',image:'coast',steps:[
      {title:'Begin with choice',kind:'Understand',text:'A pause is an invitation. Different people prefer different anchors: a room detail, a sound, supported contact, or gentle breathing. Choose what feels suitable today. You can stop, observe, or change focus at any time.',action:'Name one focus you would be willing to try. No need to record it.'},
      {title:'Meet the room',kind:'Try',text:'Grounding uses details in your actual surroundings. The 5–4–3–2–1 sequence is a structure, not a test. Substitute any sense that is inaccessible or uncomfortable.',practice:'ground'},
      {title:'Explore a comfortable rhythm',kind:'Try',text:'If breath attention is welcome, explore an optional rhythm without forcing depth or timing. If not, listening offers an outward anchor.',practice:'tide',alternative:'listen'},
      {title:'Notice without grading',kind:'Reflect',text:'A practice may feel helpful, neutral, or uncomfortable. Each response is useful information. Optional session feedback can help you remember preferences; it is not a clinical assessment.',action:'Consider what you would keep, adapt, or skip next time.'},
      {title:'Build a realistic return',kind:'Apply',text:'Choose an available moment and a small action that fits it. A flexible plan can survive a changing shift. Return when useful, without needing to maintain a streak.',action:'Complete: When a suitable break is available, I could try…',studio:'support'}
    ]},
    {id:'boundaries',title:'Working with boundaries',description:'Move from competing demands to a clear support conversation.',image:'team',steps:[
      {title:'Notice the working conditions',kind:'Understand',text:'Workload, role clarity, support and break arrangements can affect working life. Individual practices sit alongside practical workplace changes. A support request can make a barrier visible without disclosing private health information.',action:'Identify one practical barrier you want to discuss.'},
      {title:'Separate observation from judgment',kind:'Understand',text:'An observation describes something that happened. A judgment assigns a label. “The plan changed before handover” gives a conversation a more concrete starting point than labeling a colleague.',action:'Try rewriting a general complaint as one observable event.'},
      {title:'Rehearse a boundary',kind:'Rehearse',text:'A useful boundary names capacity, asks for priorities and offers a feasible next step. Adapt the wording to your responsibilities and local policies.',studio:'boundary'},
      {title:'Ask for a specific support',kind:'Apply',text:'Connect the situation, impact and request. Suggest who could agree an action and when to review it. The other person may have information you need; allow space for a response.',studio:'support'},
      {title:'Close the loop',kind:'Apply',text:'An agreed action needs an owner and review point. If the barrier remains, use the appropriate workplace process to raise it again. This app does not send requests or monitor follow-through.',studio:'conditions'}
    ]},
    {id:'transition',title:'Leaving the shift',description:'Create a practical, personal transition towards recovery.',image:'forest',steps:[
      {title:'Confirm responsibility',kind:'Understand',text:'Handover belongs in the approved workplace system. Serein can prompt you to confirm ownership, but it is not a task list for patient care or a clinical record.',action:'Consider whether the normal handover and ownership arrangements are complete.'},
      {title:'Choose an outward pause',kind:'Try',text:'A brief listening practice offers an anchor in the environment. You can substitute visual details or supported contact if listening is inaccessible or uncomfortable.',practice:'listen'},
      {title:'Allow an ordinary ending',kind:'Reflect',text:'You do not have to extract a positive lesson from every shift. You may acknowledge an ordinary effort, choose to say nothing, or ask for support. A difficult experience does not need to be retold here.',action:'Choose: a quiet transition, a practical request, or a trusted conversation.'},
      {title:'Make your transition plan',kind:'Apply',text:'One concrete action can mark the move from work to personal time. Keep it feasible for your shift pattern, responsibilities and available support.',studio:'transition'},
      {title:'Make room for rest',kind:'Try',text:'A wind-down sequence is one optional way to settle. Your opportunity for rest may depend on working patterns and support. Persistent difficulties deserve a conversation with your usual qualified support.',practice:'winddown'}
    ]}
  ]
};


;

(function(global){
'use strict';
const A=global.Serein.content;
const safeArray=x=>Array.isArray(x)?x:[];
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const validId=(D,id)=>D.practices.some(p=>p.id===id);
function normalize(raw,D){
 const memory={},choices={},progress={};
 for(const p of D.practices){
  const m=raw.practiceMemory?.[p.id];
  if(m&&typeof m==='object')memory[p.id]={duration:p.durations.includes(+m.duration)?+m.duration:null,pace:['3-3','4-6','5-5'].includes(m.pace)?m.pace:'4-6',noHolds:!!m.noHolds,external:!!m.external,relaxOnly:!!m.relaxOnly,visual:['photo','orb','text','map'].includes(m.visual)?m.visual:'photo',voice:!!m.voice,lessMotion:!!m.lessMotion,chime:!!m.chime};
  if(['helpful','later','exclude'].includes(raw.practiceChoices?.[p.id]))choices[p.id]=raw.practiceChoices[p.id];
 }
 for(const j of A.journeys)progress[j.id]=safeArray(raw.journeyProgress?.[j.id]).filter((n,i,x)=>Number.isInteger(n)&&n>=0&&n<j.steps.length&&x.indexOf(n)===i);
 const date=x=>Number.isFinite(Date.parse(x))?new Date(x).toISOString():new Date().toISOString();
 const feedback=safeArray(raw.feedback).filter(x=>x&&validId(D,x.practiceId)&&['Helpful',Serein.t("copy_0291"),'Uncomfortable'].includes(x.result)).slice(-2000).map(x=>({id:String(x.id||global.crypto?.randomUUID?.()||('s-'+Date.now()+'-'+Math.random().toString(36).slice(2))),practiceId:x.practiceId,result:x.result,moment:Number.isInteger(x.moment)&&x.moment>=0&&x.moment<4?x.moment:1,date:date(x.date),before:[1,2,3,4,5].includes(+x.before)?+x.before:null,after:[1,2,3,4,5].includes(+x.after)?+x.after:null,persistent:x.persistent===true}));
 const savedPlans=safeArray(raw.savedPlans).filter(x=>x&&typeof x.text==='string'&&A.studios.some(s=>s.id===x.studio)).slice(-100).map(x=>({id:String(x.id||global.crypto?.randomUUID?.()||('s-'+Date.now()+'-'+Math.random().toString(36).slice(2))),studio:x.studio,text:x.text.slice(0,12000),date:date(x.date)}));
 const p=raw.preferences||{};
 return {practiceMemory:memory,practiceChoices:choices,feedback,journeyProgress:progress,savedPlans,comfort:{readingSize:['standard','large','extra'].includes(p.readingSize)?p.readingSize:'standard',theme:['light','night'].includes(p.theme)?p.theme:'light',readingWidth:!!p.readingWidth,focus:!!p.focus}};
}
function create(c){
 const {D,state,$,$$,esc,icon,openModal,closeModal,toast,persist,render,navigate,openPractice,download,chooseDuration,matchPractices,durationLabel}=c;
 const store=()=>c.store;
 let finder={step:0,moment:1,budget:120,style:'any',position:'any',silent:false},studio=null,journey=null,sessionMeta=null,pendingTeam=null,installPrompt=null,offlineReady=false,offlineBusy=false,offlineMessage='',registration=null,audioContext=null,chimePhase='';
 const sourceLinks=keys=>keys.map(k=>A.references[k]).filter(Boolean).map(r=>Serein.t("copy_0292",{v0:(esc(r.url)),v1:(esc(r.title)),v2:(esc(r.scope))})).join('');
 function applyComfort(){let p=store().preferences;document.body.dataset.reading=p.readingSize||'standard';document.body.dataset.theme=p.theme||'light';document.body.classList.toggle('comfortable-reading',!!p.readingWidth);document.body.classList.toggle('focus-mode',!!p.focus);document.querySelector('meta[name="theme-color"]')?.setAttribute('content',p.theme==='night'?'#0A1826':'#10253A');}
 function comfortForm(){let p=store().preferences;return Serein.t("copy_0294",{v0:([['standard','Standard'],['large','Large'],['extra',Serein.t("copy_0293")]].map(([v,l])=>Serein.t("copy_0060",{v0:(v),v1:(p.readingSize===v?'selected':''),v2:(l)})).join('')),v1:(p.theme==='night'?'selected':''),v2:(p.readingWidth?'checked':''),v3:(p.focus?'checked':'')});}
 function comfortValues(fd){return {readingSize:String(fd.get('readingSize')||'standard'),theme:String(fd.get('theme')||'light'),readingWidth:fd.has('readingWidth'),focus:fd.has('focus')};}
 function eligible(options={}){return matchPractices(D.practices,{budget:store().preferences.time,style:store().preferences.style,...options}).filter(p=>store().practiceChoices[p.id]!=='exclude');}
 function rank(options={}){
  const moment=options.moment??state.moment;
  const preferred=[['ground','listen','desk'],['tide','handreset','ground'],['ground','listen','quietplace'],['release','winddown','listen']][moment]||[];
  return eligible(options).map(p=>{const fs=store().feedback.filter(f=>f.persistent&&f.practiceId===p.id);const fit=preferred.indexOf(p.id);return {p,score:(fit<0?0:9-fit*2)+(store().practiceChoices[p.id]==='helpful'?8:0)+(store().practiceChoices[p.id]==='later'?-5:0)+Math.min(5,fs.filter(f=>f.result==='Helpful').length)-Math.min(8,fs.filter(f=>f.result==='Uncomfortable').length*3)+(store().savedPractices.includes(p.id)?1:0)};}).sort((a,b)=>b.score-a.score).map(x=>x.p);
 }
 function recommend(){return rank()[0]||null;}
 function reason(p,budget,moment){const reasons=[Serein.t("copy_0296",{v0:(D.moments[moment]?.title.toLowerCase()||Serein.t("copy_0295"))}),p.selfPaced?'self-paced':Serein.t("copy_0297",{v0:(durationLabel(chooseDuration(p,budget)))}),p.breathFocus?Serein.t("copy_0051"):p.movement?Serein.t("copy_0298"):Serein.t("copy_0052")];if(store().practiceChoices[p.id]==='helpful')reasons.push(Serein.t("copy_0299"));return reasons.join(' · ');}
 function finderOpen(){finder={step:0,moment:state.moment,budget:store().preferences.time,style:store().preferences.style,position:'any',silent:false};finderRender();}
 function finderRender(){
  const content=[
   Serein.t("copy_0301",{v0:(D.moments.map((m,i)=>Serein.t("copy_0300",{v0:(finder.moment===i?'selected':''),v1:(i),v2:(finder.moment===i),v3:(m.title),v4:(m.desc)})).join(''))}),
   Serein.t("copy_0306",{v0:([[60,Serein.t("copy_0154")],[120,Serein.t("copy_0155")],[300,Serein.t("copy_0156")],['self',Serein.t("copy_0302")]].map(([v,l])=>Serein.t("copy_0305",{v0:(String(finder.budget)===String(v)?'selected':''),v1:(v),v2:(String(finder.budget)===String(v)),v3:(l),v4:(v==='self'?Serein.t("copy_0303"):Serein.t("copy_0304"))})).join(''))}),
   Serein.t("copy_0307",{v0:(finder.style==='nonbreath'?'selected':''),v1:(finder.style==='ground'?'selected':''),v2:(finder.position==='seated'?'selected':''),v3:(finder.position==='still'?'selected':''),v4:(finder.silent?'checked':'')})
  ];
  let html;
  if(finder.step<3)html=Serein.t("copy_0309",{v0:(stepMeter(finder.step,3)),v1:(content[finder.step]),v2:(finder.step===0?'disabled':''),v3:(finder.step===2?Serein.t("copy_0308"):Serein.t("copy_0230"))});
  else {let options={...finder,budget:finder.budget==='self'?'self':+finder.budget};let list=rank(options).slice(0,3);html=Serein.t("copy_0312",{v0:(D.moments[finder.moment].title),v1:(list.map((p,i)=>Serein.t("copy_0310",{v0:(i+1),v1:(p.title),v2:(esc(p.desc)),v3:(esc(reason(p,finder.budget==='self'?0:+finder.budget,finder.moment))),v4:(p.id),v5:(durationLabel(chooseDuration(p,finder.budget==='self'?0:+finder.budget))),v6:(p.id)})).join('')||Serein.t("copy_0311"))});}
  openModal(Serein.t("copy_0313"),html);
 }
 function stepMeter(step,total){return Serein.t("copy_0314",{v0:(step+1),v1:(total),v2:((step+1)/total*100)});}
 function homeExtras(){let j=A.journeys.find(x=>(store().journeyProgress[x.id]||[]).length>0&&(store().journeyProgress[x.id]||[]).length<x.steps.length)||A.journeys[0];return Serein.t("copy_0317",{v0:(icon('arrow')),v1:(A.studios.slice(0,3).map(studioCard).join('')),v2:(j.title),v3:(j.description),v4:(j.id),v5:((store().journeyProgress[j.id]||[]).length?Serein.t("copy_0315"):Serein.t("copy_0316"))});}
 function aboutHTML(id){let p=D.practices.find(p=>p.id===id),e=A.evidence[id];if(!p||!e)return '';let metric=e.stat||[String(p.steps.length),Serein.t("copy_0318"),Serein.t("copy_0319")];return Serein.t("copy_0326",{v0:(p.title),v1:(esc(p.desc)),v2:([[Serein.t("copy_0320"),e.why],[Serein.t("copy_0321"),e.when],[Serein.t("copy_0322"),e.how],[Serein.t("copy_0323"),Serein.t("copy_0324",{v0:(p.safety)})]].map(([h,t])=>Serein.t("copy_0325",{v0:(h),v1:(esc(t))})).join('')),v3:(metric[0]),v4:(metric[1]),v5:(metric[2]),v6:(sourceLinks(e.refs)),v7:(A.updated)});}
 function evidence(id){const p=D.practices.find(p=>p.id===id);if(p)openModal(Serein.t("copy_0327"),aboutHTML(id)+Serein.t("copy_0328",{v0:(id)}));}
 function evidenceButton(p){return Serein.t("copy_0329",{v0:(p.id),v1:(esc(p.title)),v2:(icon('book'))});}
 function resetFeedback(){sessionMeta={id:c.uid(),before:null,after:null,result:null,persistent:false,moment:state.moment};$('#player-feedback').innerHTML=Serein.t("copy_0340",{v0:(['Helpful',Serein.t("copy_0291"),'Uncomfortable'].map(r=>Serein.t("copy_0330",{v0:(r),v1:(r)})).join('')),v1:([1,2,3,4,5].map(n=>Serein.t("copy_0335",{v0:(n),v1:(n),v2:([Serein.t("copy_0331"),Serein.t("copy_0332"),Serein.t("copy_0333"),'Settled',Serein.t("copy_0334")][n-1])})).join('')),v2:([['helpful',Serein.t("copy_0336")],['later',Serein.t("copy_0337")],['exclude',Serein.t("copy_0338")]].map(([v,l])=>Serein.t("copy_0339",{v0:(state.session.practice.id),v1:(v),v2:(l)})).join(''))});}
 function preparePractice(p,explicitDuration){
  let m=store().practiceMemory[p.id],e=state.session;
  if(m){if(!explicitDuration&&m.duration)e.duration=m.duration;e.pace=m.pace;e.noHolds=m.noHolds;e.external=m.external;e.relaxOnly=m.relaxOnly;state.visual=(m.visual==='map'&&p.id!=='scan')?'photo':m.visual;state.voice=false;}
  resetFeedback();chimePhase='';
  $('#player-notes-content').innerHTML=aboutHTML(p.id);
  if(m){$('#session-duration').value=String(e.duration);if($('#session-pace'))$('#session-pace').value=e.pace;if($('#session-noholds'))$('#session-noholds').checked=e.noHolds;$('#session-external').checked=e.external;if($('#session-relax'))$('#session-relax').checked=e.relaxOnly;$('#session-visual').value=state.visual;$('#session-motion').checked=m.lessMotion||c.reduced();}
  $('#player-settings-content').insertAdjacentHTML('beforeend',Serein.t("copy_0343",{v0:([1,2,3,4,5].map(n=>Serein.t("copy_0335",{v0:(n),v1:(n),v2:([Serein.t("copy_0331"),Serein.t("copy_0332"),Serein.t("copy_0333"),'Settled',Serein.t("copy_0334")][n-1])})).join('')),v1:(m?'checked':''),v2:(m?Serein.t("copy_0341"):Serein.t("copy_0342"))}));
  $('#player-settings-content').insertAdjacentHTML('beforeend',Serein.t("copy_0344",{v0:(m?.chime?'checked':'')}));
  if(m?.voice){state.voice=false;$('#session-voice').checked=false;}
  if(pendingTeam){const t=pendingTeam;pendingTeam=null;e.noHolds=true;e.external=t.external;state.visual='text';$('#session-visual').value='text';$('#session-external').checked=t.external;if($('#session-noholds'))$('#session-noholds').checked=true;$('#session-motion').checked=true;$('#session-chime').checked=false;state.voice=false;$('#session-voice').checked=false;state.present=true;$('#player').classList.add('present');$('#present-button').setAttribute('aria-pressed','true');}
 }
 function rememberPractice(){if(!state.session||state.preview)return;let id=state.session.practice.id;if($('#session-remember')?.checked){store().practiceMemory[id]={duration:state.session.duration,pace:state.session.pace,noHolds:state.session.noHolds,external:state.session.external,relaxOnly:state.session.relaxOnly,visual:state.visual,voice:state.voice,lessMotion:!!$('#session-motion')?.checked,chime:!!$('#session-chime')?.checked};$('#memory-status').textContent=Serein.t("copy_0345");}else{delete store().practiceMemory[id];if($('#memory-status'))$('#memory-status').textContent=Serein.t("copy_0346");}persist();}
 function upsertFeedback(){if(!sessionMeta?.result||state.preview)return;const f={id:sessionMeta.id,practiceId:state.session.practice.id,result:sessionMeta.result,before:sessionMeta.before,after:sessionMeta.after,moment:sessionMeta.moment,date:sessionMeta.date||(sessionMeta.date=new Date().toISOString()),persistent:sessionMeta.persistent};let i=store().feedback.findIndex(x=>x.id===f.id);if(i<0)store().feedback.push(f);else store().feedback[i]=f;persist();}
 function feedback(value){if(!sessionMeta||state.preview)return;sessionMeta.result=value;sessionMeta.after=+$('#session-after').value||null;sessionMeta.persistent=$('#feedback-save').checked;upsertFeedback();$$('[data-adv="feedback"]').forEach(b=>{b.classList.toggle('active',b.dataset.value===value);b.setAttribute('aria-pressed',String(b.dataset.value===value));});$('#feedback-note').textContent=(value==='Uncomfortable'?Serein.t("copy_0347"):Serein.t("copy_0348"))+(sessionMeta.persistent?Serein.t("copy_0349"):Serein.t("copy_0272"));}
 function choosePreference(id,value){store().practiceChoices[id]=value;persist();toast(value==='exclude'?Serein.t("copy_0350"):value==='later'?Serein.t("copy_0351"):Serein.t("copy_0352"));if(!$('#player').open)render();}
 function preferencesHTML(){return Serein.t("copy_0359",{v0:(D.practices.filter(p=>store().practiceChoices[p.id]||store().practiceMemory[p.id]).map(p=>Serein.t("copy_0357",{v0:(p.title),v1:(({exclude:Serein.t("copy_0353"),helpful:Serein.t("copy_0354"),later:Serein.t("copy_0337")})[store().practiceChoices[p.id]]||Serein.t("copy_0355")),v2:(store().practiceMemory[p.id]?Serein.t("copy_0356"):''),v3:(p.id)})).join('')||Serein.t("copy_0358"))});}
 function insights(){
  const all=store().feedback.filter(f=>state.dateFilter==='all'||Date.now()-Date.parse(f.date)<=+state.dateFilter*86400000),saved=all.filter(f=>f.persistent),paired=all.filter(f=>f.before&&f.after),helpful=all.filter(f=>f.result==='Helpful').length;
  const groups=D.practices.map(p=>({p,fs:all.filter(f=>f.practiceId===p.id)})).filter(x=>x.fs.length);
  return Serein.t("copy_0369",{v0:(saved.length),v1:(all.length),v2:(all.length),v3:(helpful),v4:(paired.length),v5:(groups.length?Serein.t("copy_0362",{v0:(groups.map(({p,fs})=>Serein.t("copy_0361",{v0:(p.title),v1:(esc(p.title)),v2:(fs.filter(f=>f.result==='Helpful').length),v3:(fs.filter(f=>f.result===Serein.t("copy_0291")).length),v4:(fs.filter(f=>f.result==='Uncomfortable').length),v5:(fs.length),v6:(['Helpful',Serein.t("copy_0291"),'Uncomfortable'].map((r,i)=>Serein.t("copy_0360",{v0:(i),v1:(fs.filter(f=>f.result===r).length/fs.length*100)})).join('')),v7:(fs.length)})).join(''))}):Serein.t("copy_0363")),v6:(paired.length?Serein.t("copy_0364",{v0:(paired.length),v1:(paired.filter(f=>f.after>f.before).length),v2:(paired.filter(f=>f.after===f.before).length),v3:(paired.filter(f=>f.after<f.before).length)}):''),v7:([0,1,2,3].map(m=>{let fs=all.filter(f=>f.moment===m&&f.result==='Helpful');return fs.length?Serein.t("copy_0365",{v0:(fs.length),v1:(fs.length===1?'':'s'),v2:(D.moments[m].title.toLowerCase()),v3:([...new Set(fs.map(f=>D.practices.find(p=>p.id===f.practiceId).title))].join(', '))}):'';}).join('')),v8:(all.length),v9:([...all].reverse().slice(0,50).map(f=>Serein.t("copy_0367",{v0:(D.practices.find(p=>p.id===f.practiceId).title),v1:(f.result),v2:(new Date(f.date).toLocaleString()),v3:(D.moments[f.moment].title),v4:(f.persistent?Serein.t("copy_0067"):Serein.t("copy_0366")),v5:(esc(f.id))})).join('')||Serein.t("copy_0368")),v10:(preferencesHTML())});
 }
 function studioCard(s){return Serein.t("copy_0370",{v0:(icon(s.icon)),v1:(s.tag),v2:(s.title),v3:(s.description),v4:(s.when),v5:(s.steps.length),v6:(s.id),v7:(s.id)});}
 function studiosView(){return Serein.t("copy_0371",{v0:(A.references.niosh.url),v1:(A.studios.map(studioCard).join('')),v2:(A.references.cdc.url),v3:(plansHTML())});}
 function openStudio(id){let def=A.studios.find(s=>s.id===id);if(!def)return;studio={id,step:0,values:{},scenario:0,response:null,choice:'practical',teamPractice:'ground',teamDuration:120,external:true,result:''};studioRender();}
 function studioField(i){const s=A.studios.find(s=>s.id===studio.id),[label,placeholder]=s.fields[i];return Serein.t("copy_0372",{v0:(i),v1:(label)})+(i===5&&s.id==='conditions'?Serein.t("copy_0373",{v0:(i),v1:(i),v2:(esc(studio.values[i]||''))}):Serein.t("copy_0374",{v0:(i),v1:(i),v2:(esc(placeholder)),v3:(esc(studio.values[i]||''))}));}
 function captureStudio(){if(!studio)return;$$('[data-studio-field]').forEach(e=>studio.values[e.dataset.studioField]=e.value.trim());const output=$('#studio-output');if(output)studio.result=output.value;}
 function studioRender(){
  const s=A.studios.find(s=>s.id===studio.id);let body='';
  if(studio.step===3){if(!studio.result)studio.result=buildStudioResult();body=Serein.t("copy_0378",{v0:(icon('check')),v1:(s.result),v2:(esc(studio.result)),v3:(s.id==='team'?'script':'plan'),v4:(Serein.t("copy_0375")),v5:(s.id==='team'?Serein.t("copy_0376"):''),v6:(s.id==='difficult'&&studio.choice==='pause'?Serein.t("copy_0377"):'')});}
  else if(s.id==='boundary'){
   const q=A.scenarios[studio.scenario];
   if(studio.step===0)body=Serein.t("copy_0379",{v0:(A.scenarios.map((q,i)=>Serein.t("copy_0060",{v0:(i),v1:(studio.scenario===i?'selected':''),v2:(q.title)})).join('')),v1:(q.context)});
   if(studio.step===1)body=Serein.t("copy_0382",{v0:(q.context),v1:(q.options.map(([t,r],i)=>Serein.t("copy_0381",{v0:(studio.response===i?'selected':''),v1:(i),v2:(studio.response===i),v3:(t),v4:(studio.response===i?Serein.t("copy_0380",{v0:(r)}):'')})).join(''))});
   if(studio.step===2)body=s.fields.map((_,i)=>studioField(i)).join('');
  } else if(s.id==='difficult'){
   if(studio.step===0)body=Serein.t("copy_0390",{v0:([['practical',Serein.t("copy_0383"),Serein.t("copy_0384")],['pause',Serein.t("copy_0385"),Serein.t("copy_0386")],['connection',Serein.t("copy_0387"),Serein.t("copy_0388")]].map(([v,t,d])=>Serein.t("copy_0389",{v0:(studio.choice===v?'selected':''),v1:(v),v2:(studio.choice===v),v3:(t),v4:(d)})).join(''))});
   if(studio.step===1)body=studioField(0)+studioField(1);
   if(studio.step===2)body=studioField(2)+Serein.t("copy_0391");
  } else if(s.id==='team'){
   if(studio.step===0)body=studioField(0)+Serein.t("copy_0392");
   if(studio.step===1)body=Serein.t("copy_0393",{v0:(D.practices.filter(p=>['ground','listen','tide','winddown'].includes(p.id)).map(p=>Serein.t("copy_0060",{v0:(p.id),v1:(studio.teamPractice===p.id?'selected':''),v2:(p.title)})).join('')),v1:([[60,'1 minute'],[120,'2 minutes'],[300,'5 minutes']].map(([n,l])=>Serein.t("copy_0060",{v0:(n),v1:(studio.teamDuration===n?'selected':''),v2:(l)})).join(''))});
   if(studio.step===2)body=Serein.t("copy_0394",{v0:(studio.external?'checked':''),v1:(studioField(1))});
  } else {const fields=[0,1].map(i=>i+studio.step*2).filter(i=>i<s.fields.length);body=fields.map(studioField).join('');}
  openModal(s.title,Serein.t("copy_0399",{v0:(studio.step===0?Serein.t("copy_0395",{v0:(s.description),v1:(s.when),v2:(s.who)}):''),v1:(stepMeter(studio.step,4)),v2:(s.tag),v3:(s.steps[studio.step]),v4:(body),v5:(studio.step===0?'disabled':''),v6:(studio.step<3?Serein.t("copy_0397",{v0:(studio.step===2?Serein.t("copy_0396"):Serein.t("copy_0230"))}):Serein.t("copy_0398")),v7:(s.description),v8:(s.why),v9:(s.when),v10:(s.who),v11:(sourceLinks(s.refs))}));
  if(s.id==='conditions'&&studio.step===2&&$('#studio-field-5'))$('#studio-field-5').value=studio.values[5]||'';
 }
 function buildStudioResult(){const s=A.studios.find(s=>s.id===studio.id),v=i=>studio.values[i]||(s.fields[i]?'[Add: '+s.fields[i][0]+']':'[Agree together]');if(s.id==='boundary')return Serein.t("copy_0400",{v0:(A.scenarios[studio.scenario].title),v1:(v(0)),v2:(v(1)),v3:(v(2))});if(s.id==='support')return Serein.t("copy_0401",{v0:(v(0)),v1:(v(1)),v2:(v(2)),v3:(v(3)),v4:(v(4)),v5:(v(5))});if(s.id==='transition')return Serein.t("copy_0402",{v0:(v(0)),v1:(v(1)),v2:(v(2)),v3:(v(3)),v4:(v(4)),v5:(v(5))});if(s.id==='difficult')return Serein.t("copy_0403",{v0:({practical:Serein.t("copy_0383"),pause:Serein.t("copy_0385"),connection:Serein.t("copy_0387")}[studio.choice]),v1:(v(0)),v2:(v(1)),v3:(v(2))});if(s.id==='team')return Serein.t("copy_0405",{v0:(v(0)),v1:(D.practices.find(p=>p.id===studio.teamPractice).title),v2:(studio.teamPractice==='ground'?'Self-paced':durationLabel(studio.teamDuration)),v3:(studio.external?Serein.t("copy_0404"):''),v4:(v(1))});return Serein.t("copy_0407",{v0:(v(0)),v1:(v(1)),v2:(v(2)),v3:(v(3)),v4:(v(4)),v5:(studio.values[5]||Serein.t("copy_0406"))});}
 function plansHTML(){return Serein.t("copy_0410",{v0:(store().savedPlans.length?store().savedPlans.map(p=>Serein.t("copy_0408",{v0:(esc(A.studios.find(s=>s.id===p.studio)?.title||'Plan')),v1:(new Date(p.date).toLocaleDateString()),v2:(esc(p.text)),v3:(esc(p.id))})).join(''):Serein.t("copy_0409"))});}
 function journeysView(){return Serein.t("copy_0414",{v0:(A.journeys.map(j=>{let done=(store().journeyProgress[j.id]||[]).length;return Serein.t("copy_0413",{v0:(D.images[j.image]),v1:(j.image==='team'?'colleagues':Serein.t("copy_0411")),v2:(j.title),v3:(j.description),v4:(j.steps.map(step=>Serein.t("copy_0145",{v0:(esc(step.title))})).join('')),v5:(done),v6:(esc(j.title)),v7:(done),v8:(done),v9:(j.id),v10:(done===5?'Revisit':done?Serein.t("copy_0230"):Serein.t("copy_0412"))});}).join(''))});}
 function openJourney(id,index){let j=A.journeys.find(x=>x.id===id);if(!j)return;journey={id,index:index??j.steps.findIndex((_,i)=>!store().journeyProgress[id]?.includes(i))};if(journey.index<0)journey.index=0;journeyRender();}
 function journeyRender(){const j=A.journeys.find(x=>x.id===journey.id),s=j.steps[journey.index],done=store().journeyProgress[j.id]||[];let practice=s.practice;if(store().preferences.style==='nonbreath'&&D.practices.find(p=>p.id===practice)?.breathFocus)practice=s.alternative||'listen';openModal(j.title,Serein.t("copy_0424",{v0:(j.steps.map((x,i)=>Serein.t("copy_0416",{v0:(i),v1:(i===journey.index?'active':''),v2:(i+1),v3:(esc(x.title)),v4:(done.includes(i)?Serein.t("copy_0415"):''),v5:(i===journey.index?'aria-current="step"':''),v6:(done.includes(i)?'✓':i+1)})).join('')),v1:(s.kind),v2:(journey.index+1),v3:(j.steps.length),v4:(s.title),v5:(s.text),v6:(s.action?Serein.t("copy_0417",{v0:(s.action)}):''),v7:(practice?Serein.t("copy_0418",{v0:(practice),v1:(D.practices.find(p=>p.id===practice).title)}):''),v8:(s.alternative&&s.alternative!==practice?Serein.t("copy_0419",{v0:(s.alternative),v1:(D.practices.find(p=>p.id===s.alternative).title)}):''),v9:(s.studio?Serein.t("copy_0420",{v0:(s.studio)}):''),v10:(journey.index===0?'disabled':''),v11:(done.includes(journey.index)?Serein.t("copy_0421"):Serein.t("copy_0422")),v12:(done.includes(journey.index)?Serein.t("copy_0423"):''),v13:(sourceLinks(j.id==='boundaries'?['who','niosh']:j.id==='transition'?['sleep','mindful']:['grounding','gentle']))}));}
 function updateStage(s){let p=state.session?.practice;if(!p)return;const key=s.index+':'+Math.floor(s.elapsed/(state.session.phases().reduce((a,x)=>a+(x.seconds||0),0)||1));if(s.state==='playing'&&key!==chimePhase){chimePhase=key;if($('#session-chime')?.checked&&!state.preview&&audioContext?.state==='running'){const osc=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;osc.type='sine';osc.frequency.value=s.index%2?440:528;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.035,now+.04);gain.gain.exponentialRampToValueAtTime(.001,now+.4);osc.connect(gain);gain.connect(audioContext.destination);osc.start(now);osc.stop(now+.45);}}const stage=$('#player-stage');if(!$('#advance-stage'))stage.insertAdjacentHTML('beforeend',Serein.t("copy_0425"));const adv=$('#advance-stage');const map=p.id==='scan'&&state.visual==='map';const stones=p.id==='ground'&&state.visual!=='text';adv.hidden=!map&&!stones;
  const stageKey=p.id+':'+state.visual+(map?'':':'+s.index);const sameStage=adv.dataset.key===stageKey;adv.dataset.key=stageKey;
  if(map){$('#player-photo').hidden=true;$('#player-media-label').textContent=Serein.t("copy_0426");adv.className=Serein.t("copy_0427");if(!sameStage)adv.innerHTML=Serein.t("copy_0431",{v0:([[Serein.t("copy_0428"),0,84],['Legs',1,70],['Hands',2,55],['Shoulders',3,28],['Face',4,11],[Serein.t("copy_0429"),5,94]].map(([t,i,y])=>Serein.t("copy_0430",{v0:(i),v1:(s.index===i?'active':''),v2:(y),v3:(s.index===i?'step':'false'),v4:(t)})).join(''))});}
  else if(stones){adv.className=Serein.t("copy_0432");if(!sameStage)adv.innerHTML=Serein.t("copy_0433",{v0:(['◉','◈','≋','❋','◇'][s.index])});}
  if(map)adv.querySelectorAll('[data-player-step]').forEach(b=>{b.classList.toggle('active',+b.dataset.playerStep===s.index);b.setAttribute('aria-current',+b.dataset.playerStep===s.index?'step':'false');});
  if(p.id==='box'){let box=$('#box-guide');if(box){box.dataset.edge=String(state.session.noHolds?Math.floor((s.index+s.progress)*2)%4:s.index);let small=box.querySelector('small');if(small&&s.state==='playing'){let cycle=state.session.phases().reduce((a,x)=>a+x.seconds,0);small.textContent=Serein.t("copy_0434",{v0:(Math.floor(s.elapsed/cycle)+1)});}}}
 }
 function onPlay(){if($('#session-chime')?.checked){try{const C=global.AudioContext||global.webkitAudioContext;if(C){audioContext=audioContext||new C();audioContext.resume().catch(()=>{});}}catch{toast(Serein.t("copy_0435"));}}}
 function quoteCount(){return D.reflections.length+A.quotes.filter(q=>q.moments.includes(state.moment)).length;}
 function quoteText(index){const list=[...D.reflections,...A.quotes.filter(q=>q.moments.includes(state.moment))];return list[index%list.length].text;}
 function heroImage(){return store().preferences.role===Serein.t("copy_0152")?D.images.team:[D.images.seated,D.frames.awareness[0],D.images.team,D.images.release][state.moment];}
 function sourceInfo(){openModal(Serein.t("copy_0436"),Serein.t("copy_0437",{v0:(sourceLinks(Object.keys(A.references))),v1:(A.updated)}));}
 function reminders(){let online=location.protocol!=='file:';openModal(Serein.t("copy_0438"),Serein.t("copy_0443",{v0:(esc(offlineStatus())),v1:(online?Serein.t("copy_0441",{v0:(offlineBusy?'disabled':''),v1:(offlineReady?Serein.t("copy_0439"):Serein.t("copy_0440"))}):''),v2:([['MO','Mon'],['TU','Tue'],['WE','Wed'],['TH','Thu'],['FR','Fri'],['SA','Sat'],['SU','Sun']].map(([v,l],i)=>Serein.t("copy_0442",{v0:(v),v1:(i<5?'checked':''),v2:(l)})).join(''))}));}
 function makeReminder(form){
  const fd=new FormData(form),codes=['SU','MO','TU','WE','TH','FR','SA'],days=[...new Set(fd.getAll('days').filter(d=>codes.includes(d)))],time=String(fd.get('time')),title=String(fd.get('title')||'').trim();
  const [h,m]=time.split(':').map(Number);if(!days.length||!/^\d\d:\d\d$/.test(time)||h>23||m>59||!title){$('#reminder-error').textContent=Serein.t("copy_0444");return;}
  const d=new Date();d.setHours(h,m,0,0);if(d<=new Date())d.setDate(d.getDate()+1);while(!days.includes(codes[d.getDay()]))d.setDate(d.getDate()+1);
  const pad=n=>String(n).padStart(2,'0'),stamp=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'T'+pad(h)+pad(m)+'00';
  const clean=t=>t.replace(/\\/g,'\\\\').replace(/[\r\n]+/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const fold=line=>{let out='',row='',bytes=0;for(const ch of line){const n=new TextEncoder().encode(ch).length;if(bytes+n>75){out+=row+'\r\n';row=' ';bytes=1;}row+=ch;bytes+=n;}return out+row;};
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//HCA//Serein//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+c.uid()+'@serein.hca','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),'DTSTART:'+stamp,'DURATION:PT2M','RRULE:FREQ=WEEKLY;BYDAY='+days.join(','),'SUMMARY:'+clean(title),Serein.t("copy_0445"),'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:'+clean(title),'END:VALARM','END:VEVENT','END:VCALENDAR',''];
  download(lines.map(fold).join('\r\n'),'Serein-reminder.ics','text/calendar');$('#reminder-error').textContent=Serein.t("copy_0446");
 }

 function portableDistribution(){return document.querySelector('meta[name="serein-distribution"]')?.content==='portable';}
 function shellURL(){const url=new URL(portableDistribution()?location.href:'/',location.href);url.hash='';url.search='';return url;}
 function offlineStatus(){if(location.protocol==='file:')return Serein.t("copy_0447");return offlineMessage||(offlineBusy?Serein.t("copy_0448"):offlineReady?Serein.t("copy_0449"):Serein.t("copy_0450"));}
 function refreshOfflineStatus(){const status=$('#offline-status'),button=$('#offline-prepare');if(status)status.textContent=offlineStatus();if(button){button.disabled=offlineBusy;button.textContent=offlineReady?Serein.t("copy_0439"):Serein.t("copy_0440");}}
 function bounded(promise){let timeout;return Promise.race([promise,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error(Serein.t("copy_0451"))),15000);})]).finally(()=>clearTimeout(timeout));}
 async function prepareOffline(){
  if(!('serviceWorker'in navigator)||!/^https?:$/.test(location.protocol)||!('caches'in global)){offlineMessage=Serein.t("copy_0452");refreshOfflineStatus();toast(offlineMessage);return;}
  offlineBusy=true;offlineMessage='';refreshOfflineStatus();
  try{
   const workerURL=new URL('/serein/sw.js',location.href),shell=shellURL();if(portableDistribution())workerURL.searchParams.set('shell',shell.pathname.split('/').pop());
   const check=await bounded(fetch(workerURL.href,{cache:'no-store'})),workerText=check.ok?await check.text():'';if(!check.ok||!/^\s*\/\*\s*SEREIN_OFFLINE_WORKER\b/.test(workerText)){offlineMessage=Serein.t("copy_0453");toast(offlineMessage);return;}
   registration=await bounded(navigator.serviceWorker.register(workerURL.href,{scope:'/'}));await bounded(navigator.serviceWorker.ready);
   const config=portableDistribution()?{cacheName:document.querySelector('meta[name="serein-offline-cache"]')?.content,files:[shell.href]}:await fetch('/serein/offline-assets.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(Serein.t("copy_0454"));return r.json();});
   if(!config.cacheName)throw Error(Serein.t("copy_0455"));const cache=await caches.open(config.cacheName);await bounded(cache.addAll(config.files));offlineReady=!!await cache.match(shell.href);if(!offlineReady)throw Error(Serein.t("copy_0456"));toast(Serein.t("copy_0457"));
  }catch{offlineMessage=Serein.t("copy_0458");toast(offlineMessage);}
  finally{offlineBusy=false;refreshOfflineStatus();}
 }

 function install(){if(installPrompt){installPrompt.prompt();installPrompt.userChoice.finally(()=>installPrompt=null);}else if($('#install-note'))$('#install-note').textContent=window.matchMedia?.(Serein.t("copy_0459")).matches?Serein.t("copy_0460"):Serein.t("copy_0461");}
 function initialize(){applyComfort();window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});if('caches'in global)caches.keys().then(async keys=>{for(const key of keys.filter(k=>portableDistribution()?k===document.querySelector('meta[name="serein-offline-cache"]')?.content:k.startsWith('serein-hca-v4-'))){const cache=await caches.open(key);if(await cache.match(shellURL().href)){offlineReady=true;break;}}}).catch(()=>{});navigator.serviceWorker?.addEventListener('message',e=>{if(e.data?.type==='UPDATE_AVAILABLE')toast(Serein.t("copy_0462"));});}
 function appHTML(){return Serein.t("copy_0463");}
 async function checkUpdates(){if(!('serviceWorker'in navigator)||location.protocol==='file:'){toast(Serein.t("copy_0464"));return;}try{const regs=await navigator.serviceWorker.getRegistrations();if(!regs.length){toast(Serein.t("copy_0465"));return;}for(const r of regs){await r.update();if(r.waiting){openModal(Serein.t("copy_0466"),Serein.t("copy_0467"));registration=r;return;}}toast(Serein.t("copy_0468"));}catch{toast(Serein.t("copy_0469"));}}
 async function copyText(text,id){try{await navigator.clipboard.writeText(text);$(id).textContent=Serein.t("copy_0470");}catch{$('#studio-output')?.select();$(id).textContent=Serein.t("copy_0471");}}
 async function handle(b){const d=b.dataset,a=d.adv;if(!a)return false;
  if(a==='finder')finderOpen();
  else if(a==='finder-moment'){finder.moment=+d.value;finderRender();}
  else if(a==='finder-time'){finder.budget=d.value==='self'?'self':+d.value;finderRender();}
  else if(a==='finder-next'){finder.step=Math.min(3,finder.step+1);finderRender();}
  else if(a==='finder-back'){finder.step=Math.max(0,finder.step-1);finderRender();}
  else if(a==='finder-start'){let p=D.practices.find(p=>p.id===d.id);state.moment=finder.moment;openPractice(p.id,chooseDuration(p,finder.budget==='self'?0:+finder.budget));if(finder.silent){state.voice=false;$('#session-voice').checked=false;$('#session-chime').checked=false;globalThis.SereinPlayer?.quiet();}}
  else if(a==='evidence')evidence(d.id);
  else if(a==='explain')openModal(d.title,Serein.t("copy_0094",{v0:(esc(d.text))}));
  else if(a==='studios-open')navigate('studios');
  else if(a==='journeys-open')navigate('journeys');
  else if(a==='preferences-open'){state.spaceTab='patterns';closeModal();navigate('space');}
  else if(a==='feedback')feedback(d.value);
  else if(a==='practice-choice')choosePreference(d.id,d.value);
  else if(a==='restore-practice'){delete store().practiceMemory[d.id];delete store().practiceChoices[d.id];persist();render();}
  else if(a==='delete-feedback'){let i=store().feedback.findIndex(f=>f.id===d.id);if(i>=0){let [f]=store().feedback.splice(i,1);persist();render();toast(Serein.t("copy_0472"),()=>{store().feedback.splice(i,0,f);persist();render();});}}
  else if(a==='studio')openStudio(d.id);
  else if(a==='studio-next'){captureStudio();studio.step++;studioRender();}
  else if(a==='studio-back'){captureStudio();studio.step--;studio.result='';studioRender();}
  else if(a==='boundary-response'){studio.response=+d.value;studioRender();}
  else if(a==='difficult-choice'){studio.choice=d.value;studioRender();}
  else if(a==='studio-copy'){captureStudio();await copyText(studio.result,'#studio-result-status');}
  else if(a==='studio-download'){captureStudio();download(studio.result,Serein.t("copy_0473",{v0:(studio.id)}),'text/plain');}
  else if(a==='studio-save'){captureStudio();const id=studio.savedId||c.uid(),plan={id,studio:studio.id,text:studio.result,date:new Date().toISOString()};let i=store().savedPlans.findIndex(x=>x.id===id);if(i<0)store().savedPlans.push(plan);else store().savedPlans[i]=plan;studio.savedId=id;persist();$('#studio-result-status').textContent=Serein.t("copy_0474");}
  else if(a==='delete-plan'){store().savedPlans=store().savedPlans.filter(p=>p.id!==d.id);persist();render();}
  else if(a==='team-present'){captureStudio();pendingTeam={external:studio.external};let p=D.practices.find(p=>p.id===studio.teamPractice);openPractice(p.id,chooseDuration(p,studio.teamDuration));}
  else if(a==='journey')openJourney(d.id);
  else if(a==='journey-step'){journey.index=+d.value;journeyRender();}
  else if(a==='journey-previous'){journey.index--;journeyRender();}
  else if(a==='journey-return'){closeModal();navigate('journeys');}
  else if(a==='journey-complete'){let done=store().journeyProgress[journey.id]||[];if(!done.includes(journey.index))done.push(journey.index);store().journeyProgress[journey.id]=done;persist();if(journey.index<A.journeys.find(j=>j.id===journey.id).steps.length-1){journey.index++;journeyRender();}else{closeModal();navigate('journeys');toast(Serein.t("copy_0475"));}}
  else if(a==='journey-unmark'){store().journeyProgress[journey.id]=store().journeyProgress[journey.id].filter(i=>i!==journey.index);persist();journeyRender();}
  else if(a==='journey-reset-all')openModal(Serein.t("copy_0476"),Serein.t("copy_0477"));
  else if(a==='journey-reset-confirm'){store().journeyProgress={};persist();closeModal();render();}
  else if(a==='app-options')reminders();
  else if(a==='offline')await prepareOffline();
  else if(a==='install')install();
  else if(a==='app-update')await checkUpdates();
  else if(a==='apply-update'){navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});registration?.waiting?.postMessage({type:'SKIP_WAITING'});}
  else if(a==='sources')sourceInfo();
  else return false;
  return true;
 }
 function onChange(e){let id=e.id;if(id==='finder-style')finder.style=e.value;if(id==='finder-position')finder.position=e.value;if(id==='finder-silent')finder.silent=e.checked;if(id==='boundary-scenario'){studio.scenario=+e.value;studio.response=null;studioRender();}if(id==='team-practice')studio.teamPractice=e.value;if(id==='team-duration')studio.teamDuration=+e.value;if(id==='team-external')studio.external=e.checked;
  if(id==='session-before'&&sessionMeta)sessionMeta.before=+e.value||null;
  if(id==='session-after'&&sessionMeta){sessionMeta.after=+e.value||null;upsertFeedback();}
  if(id==='feedback-save'&&sessionMeta){sessionMeta.persistent=e.checked;upsertFeedback();if(sessionMeta.result)feedback(sessionMeta.result);}
 }
 function addedSearch(query){let q=query.trim().toLowerCase(),ss=A.studios.filter(s=>(s.title+' '+s.description).toLowerCase().includes(q)),js=A.journeys.filter(j=>(j.title+' '+j.description).toLowerCase().includes(q));return Serein.t("copy_0480",{v0:(ss.map(s=>Serein.t("copy_0478",{v0:(s.id),v1:(icon(s.icon)),v2:(s.title)})).join('')),v1:(js.map(j=>Serein.t("copy_0479",{v0:(j.id),v1:(icon('book')),v2:(j.title)})).join(''))});}
 return {resetFeedback,rank,finderOpen,aboutHTML,preferencesHTML,plansHTML,openStudio,openJourney,initialize,applyComfort,comfortForm,comfortValues,recommend,reason,homeExtras,evidenceButton,preparePractice,rememberPractice,insights,studiosView,journeysView,appHTML,updateStage,handle,onChange,addedSearch,sourceInfo,makeReminder,onPlay,quoteCount,quoteText,heroImage,get sessionMeta(){return sessionMeta;},get studio(){return studio;},get finder(){return finder;}};
}
global.Serein.toolsFactory={normalize,create};
})(globalThis);


;

/* Editorial information and numeric context. External figures never represent Serein outcomes. */
globalThis.Serein.contextData = {
  version:'4.1',checked:'2026-10-15',
  sources:{
    workforce:{title:'CDC · Quality of Worklife survey',url:'https://www.cdc.gov/vitalsigns/health-worker-mental-health/index.html',population:'U.S. health workers',period:'2018 and 2022 surveys · published 2023',limit:'Historical, self-reported workforce estimates. They do not measure Serein or establish that an individual tool changes burnout.'},
    whofacts:{title:'WHO · Mental health at work',url:'https://www.who.int/news-room/fact-sheets/detail/mental-health-at-work',population:'Global working-age population / global economy',period:'WHO fact sheet updated September 2026',limit:'Global context and modelled annual estimates. They are not a prediction for a person, workplace or app.'},
    sleepdata:{title:'CDC/NCHS · Data Brief 559',url:'https://www.cdc.gov/nchs/products/databriefs/db559.htm',population:'U.S. civilian, noninstitutionalized adults',period:'NHIS 2024 · published April 2026',limit:'Self-reported population survey. These percentages do not establish that Serein improves sleep.'},
    breathstudy:{title:'Balban et al. · Cell Reports Medicine',url:'https://pubmed.ncbi.nlm.nih.gov/36630953/',population:'Adult volunteers in a remote randomized study',period:'Published 2023 · daily practices for one month',limit:'These numbers describe a research protocol, not an effect size or a recommendation for you. Serein’s timings and adaptations differ.'},
    niosh:{title:'NIOSH · Impact Wellbeing Guide',url:'https://www.cdc.gov/niosh/healthcare/impactwellbeingguide/index.html',population:'Healthcare organizational improvement guidance',period:'Guide revised 2024',limit:'Six organizational actions in the guide. Serein’s studios are original educational tools and are not those six actions.'}
  },
  facts:{
    burnout:{value:'46%',number:46,baseline:32,baselineLabel:'2018',label:'reported burnout often or very often',year:'2022',source:'workforce',kind:'Survey context'},
    turnover:{value:'44%',number:44,baseline:33,baselineLabel:'2018',label:'intended to look for another job',year:'2022',source:'workforce',kind:'Survey context'},
    harassment:{value:'13%',number:13,baseline:6,baselineLabel:'2018',label:'reported workplace harassment',year:'2022',source:'workforce',kind:'Survey context'},
    trust:{value:'78%',number:78,baseline:84,baselineLabel:'2018',label:'agreed they trusted management',year:'2022',source:'workforce',kind:'Survey context'},
    conditions:{value:'82%',number:82,baseline:91,baselineLabel:'2018',label:'said conditions supported productivity',year:'2022',source:'workforce',kind:'Survey context'},
    workdays:{value:'12bn',label:'working days lost annually to depression and anxiety',source:'whofacts',kind:'Global annual estimate'},
    cost:{value:'US$1tn',label:'annual productivity losses linked to depression and anxiety',source:'whofacts',kind:'Global annual estimate'},
    mentalhealth:{value:'16%',number:16,label:'of working-age adults estimated to have a mental disorder',year:'2023',source:'whofacts',kind:'Global estimate'},
    shortSleep:{value:'30.5%',number:30.5,label:'reported less than seven hours of sleep per 24 hours',year:'2024',source:'sleepdata',kind:'Survey context'},
    rested:{value:'54.8%',number:54.8,label:'woke well-rested most days or every day',year:'2024',source:'sleepdata',kind:'Survey context'},
    sleepOnset:{value:'15.4%',number:15.4,label:'had trouble falling asleep most days or every day',year:'2024',source:'sleepdata',kind:'Survey context'},
    studyMinutes:{value:'5 min',label:'daily session length in the published research',source:'breathstudy',kind:'Study protocol'},
    studyMonth:{value:'1 month',label:'intervention period in the published research',source:'breathstudy',kind:'Study protocol'},
    nioshActions:{value:'6',label:'organizational actions in the NIOSH guide',source:'niosh',kind:'Guideline structure'}
  },
  topics:{
    today:['Today','A starting point that connects your current working moment with a suitable pause.','Reduce searching when time and attention are limited.','Before, during or after a shift, once a safe pause is possible.','Choose a working moment, then explore a recommendation or use Help me choose.','Healthcare workers choosing their own support.',['burnout','workdays']],
    practices:['Guided practices','A catalogue of optional breathing, grounding, movement, attention and visualization experiences.','Compare options and find an approach that feels suitable.','When you have an appropriate setting and can stop or adapt freely.','Filter by time, focus and movement. Open About this practice before beginning.','People seeking an optional educational pause; suitability remains personal.',['studyMinutes','burnout']],
    guides:['Practical guides','A library of short educational readings about care, communication, rest and support.','Understand a situation before choosing a practical response.','When you want a brief explanation or a conversation prompt.','Choose a category, open a guide, and adapt its suggested steps to your own setting.','Healthcare workers and learners; guidance does not replace workplace policies.',['trust','conditions']],
    studios:['Interactive studios','Guided tools that turn a workplace concern into words, choices or an editable plan.','Make practical support and workplace changes easier to discuss.','Before a conversation, at handover, or when planning an agreed next step.','Choose a studio, work through its steps, then edit, copy or download the result.','Healthcare workers and team facilitators; use normal workplace decision processes.',['trust','nioshActions']],
    journeys:['Learning journeys','Short sequences that connect understanding, practice, reflection and application.','Build familiarity without deadlines or a fixed daily streak.','When you want a little structure across several visits.','Choose a journey, explore any step, and mark progress when it is useful.','Independent learners, students and healthcare workers.',['workdays','burnout']],
    reflect:['Reflect','A personal space for optional check-ins and words about your own experience.','Notice what matters and identify a possible support or next step.','When reflection feels welcome; leaving an entry blank is also a choice.','Choose a prompt or write freely. Keep patient details out and choose whether to save.','The person using Serein; entries are not monitored or clinically assessed.',['burnout','mentalhealth']],
    space:['My space','Your chosen collection of saved practices, routines, reflections and personal observations.','Return to useful tools and control what is stored.','When revisiting a practice or reviewing what you chose to keep.','Use the collection tabs, explore patterns, or manage data and app options.','The person using this browser; local records are not employer reports.',['burnout','trust']],
    support:['Support','Practical routes to prepare a conversation and consider qualified human support.','Connect individual needs with people and working conditions.','When a colleague, lead or professional service could help.','Choose a relevant guide or prepare a clear request through a studio.','Workers seeking support and colleagues offering it respectfully.',['turnover','trust']],
    finder:['Help me choose','A three-choice navigator matching a practice to your moment, time and comfort.','Make a manageable selection without scanning the whole catalogue.','When you know what feels comfortable but are unsure where to start.','Select the moment, available time and preferred focus; compare the explained matches.','Anyone choosing their own practice; matches are preference-based.',['burnout','studyMinutes']],
    checkin:['Personal check-in','An optional record of a feeling, energy and a little context.','Notice experience and decide whether another support would help.','At a moment you choose; frequent recording is not required.','Choose the nearest feeling, optionally add context, then decide whether to save.','You; this is not screening, diagnosis or live monitoring.',['burnout','mentalhealth']],
    journal:['Personal reflection','A private-to-this-browser writing space with optional persistence.','Put an experience or a support need into your own words.','When writing feels useful; you do not have to find a positive lesson.','Use a prompt or start freely. Save only if comfortable with browser storage.','You; exclude patient-identifying information and other people’s private details.',['burnout','trust']],
    quote:['Original reflections','Short secular Serein words selected around the working moment.','Offer a brief invitation to notice, rest or ask for support.','When a small reading prompt is welcome.','Save useful words, choose another reflection, or hide them in Preferences.','People who choose to use reflective prompts.',['burnout','workdays']],
    routine:['My routine','An ordered collection of up to four chosen practices.','Keep a familiar sequence available without repeating the search.','When several short practices fit an available break.','Choose practices, reorder them, and begin each one only when you are ready.','People who prefer a repeatable, adaptable sequence.',['studyMinutes','burnout']],
    saved:['Saved collection','Bookmarks for practices, guides and original reflections.','Return quickly to something you chose to keep.','When revisiting a useful resource.','Use the bookmark control; remove it whenever the collection no longer fits.','The person using this browser; bookmarks remain locally stored.',['burnout','trust']],
    patterns:['My patterns','Counts and charts of check-ins and optional practice feedback you recorded.','Make your own entries easier to explore without turning them into a health grade.','After recording observations, or when reviewing a selected period.','Choose a date range, inspect the counts and denominators, and remove entries if desired.','You; missing entries are unknown, and paired changes do not establish causation.',['burnout','mentalhealth']],
    data:['My data','Controls for exporting, restoring and clearing personal Serein records.','Keep control when changing devices, browsers or app editions.','Before moving your records or clearing this browser’s data.','Export a private JSON archive, import it to merge or replace, or clear Serein data.','The owner of these local records; archives are not encrypted.',['trust','conditions']],
    preferences:['Your preferences','Remembered choices for role wording, duration, comfort, text and appearance.','Adapt the interface and suggestions to the way you want to use it.','At setup or whenever your needs change.','Choose options and save. Device reduced-motion preferences are respected.','You; a selected role does not certify that a practice is suitable.',['burnout','conditions']],
    app:['Install, offline & reminders','Optional device installation, downloaded app content and calendar reminder tools.','Keep chosen resources reachable around your working day.','While online for offline preparation; when a self-chosen reminder would be useful.','Prepare offline content, use your browser’s install option, or import a downloaded calendar reminder.','Users of a supported browser; background push notifications are not sent.',['shortSleep','rested']],
    conversation:['Support conversation','A temporary draft builder for describing a situation and requesting practical support.','Replace a vague concern with a clearer next step.','Before an appropriate, non-urgent workplace conversation.','Describe the situation, requested support and proposed action; edit before copying.','Workers preparing their own words for a colleague or lead.',['trust','conditions']],
    transition:['Transition home','A personal prompt for an agreed handover, a transition action and recovery support.','Create a practical boundary between work and the rest of the day.','After responsibilities have been handed over through approved workplace processes.','Confirm ownership in the approved system, then choose one transition and recovery action.','Workers finishing day, night or rotating shifts.',['shortSleep','rested']],
    team:['Shared presentation','A simplified practice view for a voluntary invitation with colleagues.','Keep the shared screen focused on the practice rather than personal records.','During a suitable break with willing participants.','Ask permission, offer adaptations, and use Present. Observing or sitting out is welcome.','A facilitator and willing colleagues; no disclosure or feedback is required.',['trust','nioshActions']],
    feedback:['Practice feedback','An optional helpful, neutral or uncomfortable response with optional settledness ratings.','Remember personal preferences and review your own observations.','After a practice, if you want to record a response.','Choose a response; save explicitly for future insights or leave it visit-only.','You; this does not measure treatment effectiveness.',['burnout','studyMonth']],
    memory:['Practice memory','Remembered timing, visual and comfort settings for a single practice.','Reduce repeated setup while keeping each session adaptable.','When an option suits you well enough to reuse.','Select Remember in the player. Reset a practice’s choices in My patterns.','You; voice stays off until enabled for the current session.',['studyMinutes','burnout']],
    player:['Practice player','A shared space for guidance, optional imagery, pacing and persistent session controls.','Make it straightforward to pause, adapt or stop a practice.','In a safe setting where the activity feels suitable.','Read the practice notes, choose comfort options, then Begin. Use Pause or Exit freely.','People choosing an educational practice; no camera or microphone is used.',['studyMinutes','burnout']],
    playerSettings:['Practice comfort options','Controls for duration, pace, holds, attention focus, movement, sound and visuals.','Keep the experience adjustable instead of requiring one format.','Before starting, or after pausing when changing timing.','Choose only comfortable options; use text or external focus if preferred.','The person doing the practice; some options depend on the selected activity.',['studyMinutes','studyMonth']],
    evidence:['Practice information & sources','A mapped explanation of the activity, adaptations and relevant background references.','Understand what the source supports and what Serein has adapted.','Before trying an unfamiliar practice or checking a content claim.','Read the scope notes, date, population and linked primary source.','Readers evaluating the educational content; sources do not certify this app.',['studyMinutes','nioshActions']],
    time:['Available time','A filter that matches practices to supported durations or a self-paced option.','Avoid opening a timed practice longer than the chosen budget.','When the time available for a pause is limited.','Choose a time chip. Self-paced activities have no required countdown.','Anyone selecting a realistic break length.',['studyMinutes','studyMonth']],
    style:['Attention preference','A filter for breathing, grounding or practices without breath focus.','Offer choice when internal attention or paced breathing is not welcome.','When choosing what feels comfortable today.','Select a style, inspect the matches, and adapt or stop any practice.','Users making their own comfort choices.',['burnout','studyMinutes']],
    setting:['Movement and setting','A filter for a seated pause or an activity without guided movement.','Match the catalogue to your available space and comfort.','Before choosing a practice in a limited or shared space.','Choose a setting; seated options exclude walking, and still options exclude guided movement.','Users considering their space and suitability.',['conditions','burnout']],
    privacy:['Privacy & browser data','A plain explanation of local storage, optional saving, exports and media.','Make storage choices with a clear view of their limits.','Before saving personal words or using a shared browser.','Read the storage notes and use My data to export, delete or clear records.','Anyone using this app; browser storage and exported files are not encrypted.',['trust','conditions']],
    about:['About Serein','An overview of this educational wellbeing studio and Healthcare Crown Academy.','Clarify the purpose and limits of the product.','When first exploring the app or checking who provides it.','Explore the practices, studios and journeys; use support routes for human help.','Healthcare workers, learners and willing facilitators.',['burnout','nioshActions']]
  },
  resources:{
    reset:['Reorient attention with an optional pause.','Between tasks when a short reset feels useful.',['burnout','studyMinutes']],
    compassion:['Recognize that care and personal limits can coexist.','When emotional demands make it harder to identify your own needs.',['burnout','turnover']],
    grounding:['Use the actual environment as an attention anchor.','When outward attention feels more welcome than breath or body focus.',['burnout','studyMinutes']],
    sleep:['Consider a feasible opportunity for rest and support.','When preparing for rest or reviewing a difficult sleep routine.',['shortSleep','sleepOnset']],
    reflection:['Explore a shift without needing to turn it into a positive lesson.','When personal reflection feels welcome after work.',['burnout','trust']],
    checkins:['Offer a short invitation to connect without demanding disclosure.','When checking in with a willing colleague or yourself.',['trust','burnout']],
    'ask-support':['Turn a difficulty into a specific practical request.','Before a conversation with an appropriate colleague, lead or service.',['trust','conditions']],
    'shift-home':['Plan one transition action after an agreed handover.','At the end of a shift, including night or rotating work.',['shortSleep','rested']],
    boundaries:['Make capacity and competing priorities visible.','When a request needs an agreed priority or another owner.',['conditions','turnover']],
    'peer-check':['Offer a colleague choices about listening or practical help.','When a colleague may welcome a respectful check-in.',['trust','harassment']],
    priorities:['Turn overlapping demands into an explicit shared decision.','When several responsibilities need a lead to agree order or ownership.',['conditions','burnout']],
    'difficult-talk':['Prepare observations, impact and a clear request.','Before a private, non-urgent conversation using normal workplace processes.',['trust','harassment']],
    'small-win':['Acknowledge an ordinary moment of care or learning.','When noticing meaning feels useful rather than compulsory.',['burnout','turnover']],
    'manager-support':['Connect a team concern to a feasible, accountable change.','When a lead is preparing to listen and follow through.',['trust','nioshActions']]
  }
};


;

(function(global){
'use strict';
const K=global.Serein.contextData;
function create(c){
 const {D,A,state,esc,$,$$}=c;
 let owner=null,popup=null,tipOwner=null,tooltip=null,tipTimer=0,hideTimer=0,busy=false,queued=false;
 const labels=['What','Why','When','How','Who'];
 const sourceKey='serein-context-panel';
 const tips={
  'session-noholds':[Serein.t("copy_0481"),Serein.t("copy_0482")],
  'session-external':[Serein.t("copy_0483"),Serein.t("copy_0484")],
  'session-remember':[Serein.t("copy_0485"),Serein.t("copy_0486")],
  'feedback-save':[Serein.t("copy_0487"),Serein.t("copy_0488")]
 };
 function structure(value,label,note){return {value:String(value),label,kind:Serein.t("copy_0489"),note:note||Serein.t("copy_0490")};}
 function get(key){
  if(key==='reflections')return {...get('journal'),key,title:Serein.t("copy_0491")};
  if(K.topics[key]){let [title,...v]=K.topics[key];return {key,title,answers:v.slice(0,5),facts:(key==='support'?['burnout','turnover']:v[5]).map(id=>K.facts[id])};}
  const [type,id]=String(key).split(':');
  if(type==='practice'){const p=D.practices.find(x=>x.id===id),e=A.evidence[id];if(!p||!e)return null;return {key,title:p.title,answers:[p.desc,e.why,e.when,e.how,Serein.t("copy_0492",{v0:(p.safety)})],facts:[structure(p.steps.length,Serein.t("copy_0493")),K.facts[p.breathFocus?'studyMinutes':id==='winddown'?'shortSleep':'burnout']],extraSources:e.refs.map(x=>A.references[x]),note:Serein.t("copy_0494")};}
  if(type==='resource'){const r=D.resources.find(x=>x.id===id),v=K.resources[id];if(!r||!v)return null;return {key,title:r.title,answers:[r.desc,v[0],v[1],r.steps[0]+Serein.t("copy_0495"),Serein.t("copy_0496")],facts:(['sleep','shift-home','manager-support','ask-support','boundaries','peer-check','priorities','difficult-talk'].includes(id)?v[2]:[]).map(x=>K.facts[x]),extraSources:(id==='sleep'||id==='shift-home'?['sleep']:id==='grounding'?['grounding']:['reset','compassion','reflection','small-win'].includes(id)?['mindful']:['who','niosh']).map(x=>A.references[x]),meta:r.duration};}
  if(type==='studio'){const s=A.studios.find(x=>x.id===id);if(!s)return null;return {key,title:s.title,answers:[s.description,s.why,s.when,s.steps.join(' → ')+'. Edit the result before using it.',s.who],facts:[],meta:s.steps.length+Serein.t("copy_0497"),extraSources:s.refs.map(x=>A.references[x])};}
  if(type==='journey'){const j=A.journeys.find(x=>x.id===id);if(!j)return null;const why={pause:Serein.t("copy_0498"),boundaries:Serein.t("copy_0499"),transition:Serein.t("copy_0500")};return {key,title:j.title,answers:[j.description,why[id],Serein.t("copy_0501"),Serein.t("copy_0502"),Serein.t("copy_0503")],facts:[structure(j.steps.length,Serein.t("copy_0504")),K.facts[id==='transition'?'shortSleep':id==='boundaries'?'trust':'burnout']],meta:Serein.t("copy_0505")};}
  if(type==='moment'){let m=D.moments[+id];if(!m)return null;return {key,title:m.title,answers:[m.desc,[Serein.t("copy_0506"),Serein.t("copy_0507"),Serein.t("copy_0508"),Serein.t("copy_0509")][+id],m.title+'. Choose an appropriate, safe opportunity.',Serein.t("copy_0510"),Serein.t("copy_0511")],facts:[K.facts[+id===3?'shortSleep':'burnout'],K.facts[+id===3?'rested':'conditions']]};}
  if(type==='category'){const options={All:[Serein.t("copy_0512"),Serein.t("copy_0513")],Breathing:['Breathing',Serein.t("copy_0514")],Grounding:['Grounding',Serein.t("copy_0515")],Movement:[Serein.t("copy_0035"),Serein.t("copy_0516")],Awareness:['Awareness',Serein.t("copy_0517")],Visualization:['Visualization',Serein.t("copy_0518")],Saved:[Serein.t("copy_0519"),Serein.t("copy_0520")],'Practitioner care':[Serein.t("copy_0078"),Serein.t("copy_0521")],Mindfulness:[Serein.t("copy_0522"),Serein.t("copy_0523")],'Shared practice':[Serein.t("copy_0524"),Serein.t("copy_0525")],'Clinical practice':[Serein.t("copy_0526"),Serein.t("copy_0527")]};let o=options[id];if(!o)return null;return {key,title:o[0],answers:[o[1],Serein.t("copy_0528"),Serein.t("copy_0529"),Serein.t("copy_0530"),Serein.t("copy_0531")],facts:[K.facts[id==='Breathing'?'studyMinutes':'burnout'],K.facts[id==='Breathing'?'studyMonth':'conditions']]};}
  if(type==='guidecategory'){const base=get('category:'+id);if(!base)return null;return {...base,key,title:id==='All'?Serein.t("copy_0532"):id===Serein.t("copy_0067")?Serein.t("copy_0533"):base.title,answers:[id==='All'?Serein.t("copy_0534"):id===Serein.t("copy_0067")?Serein.t("copy_0535"):base.answers[0],Serein.t("copy_0536"),Serein.t("copy_0537"),Serein.t("copy_0538"),Serein.t("copy_0539")],facts:[K.facts.trust,K.facts.conditions]};}
  if(type==='collection'){const o={practices:[Serein.t("copy_0519"),c.store.savedPractices.length,Serein.t("copy_0540")],guides:[Serein.t("copy_0541"),c.store.savedResources.length,Serein.t("copy_0542")],words:[Serein.t("copy_0543"),c.store.savedWords.length,Serein.t("copy_0544")]}[id];if(!o)return null;return {key,title:o[0],answers:[Serein.t("copy_0545"),Serein.t("copy_0546"),Serein.t("copy_0547"),Serein.t("copy_0548"),Serein.t("copy_0549")],facts:[structure(o[1],o[2],Serein.t("copy_0550")),K.facts.burnout]};}
  return null;
 }

 function link(key,label){return Serein.t("copy_0551",{v0:(esc(key)),v1:(sourceKey),v2:(esc(label))});}
 function resourceHTML(id){const d=get('resource:'+id);if(!d)return '';return Serein.t("copy_0553",{v0:(esc(d.answers[1])),v1:(esc(d.answers[2])),v2:(link(d.key,Serein.t("copy_0552")))});}
 function supportHTML(){return Serein.t("copy_0555",{v0:(['burnout','turnover'].map(id=>factHTML(K.facts[id])).join('')),v1:(link('support',Serein.t("copy_0554")))});}
 function decorate(){
  if(busy)return;busy=true;
  try{
   // Help belongs to a specific task or setting; navigation, tabs and cards stay quiet.
   for(const [id,[label]] of Object.entries(tips)){
    const input=$('#'+id);if(!input)continue;
    const labelEl=input.closest('label');if(!labelEl||labelEl.parentElement.classList.contains('context-setting-row'))continue;
    const row=document.createElement('div');row.className='context-setting-row';labelEl.before(row);row.appendChild(labelEl);
    row.insertAdjacentHTML('beforeend',Serein.t("copy_0556",{v0:(id),v1:(esc(label))}));
   }
   if(owner&&!owner.isConnected)close(false);
   if(tipOwner&&!tipOwner.isConnected)hideTip();
  }finally{busy=false;}
 }
 function factHTML(f){if(!f)return '';const source=f.source&&K.sources[f.source];let graph='';
  if(f.baseline!==undefined)graph=Serein.t("copy_0557",{v0:(esc(f.label)),v1:(f.baseline),v2:(f.baselineLabel),v3:(f.number),v4:(f.year),v5:(f.baselineLabel),v6:(f.baseline),v7:(f.baseline),v8:(f.year),v9:(f.number),v10:(f.number)});
  else if(typeof f.number==='number')graph=Serein.t("copy_0558",{v0:(esc(f.value+' '+f.label)),v1:(f.number)});
  return Serein.t("copy_0561",{v0:(esc(f.kind)),v1:(esc(f.value)),v2:(esc(f.label)),v3:(graph),v4:(source?Serein.t("copy_0559",{v0:(esc(source.population)),v1:(f.year?' · '+esc(f.year):'')}):Serein.t("copy_0560",{v0:(esc(f.note))}))});
 }
 function panelHTML(d){const sources=[...new Set(d.facts.map(f=>f.source).filter(Boolean))].map(id=>K.sources[id]);return Serein.t("copy_0569",{v0:(d.key.startsWith('studio:')?Serein.t("copy_0562"):Serein.t("copy_0563")),v1:(esc(d.title)),v2:(d.meta?Serein.t("copy_0560",{v0:(esc(d.meta))}):''),v3:(labels.map((l,i)=>Serein.t("copy_0564",{v0:(l),v1:(esc(d.answers[i]))})).join('')),v4:(d.facts.length?Serein.t("copy_0565",{v0:(d.facts.map(factHTML).join(''))}):''),v5:(sources.map(s=>Serein.t("copy_0566",{v0:(esc(s.url)),v1:(esc(s.title)),v2:(esc(s.period)),v3:(esc(s.limit))})).join('')),v6:((d.extraSources||[]).map(s=>Serein.t("copy_0567",{v0:(esc(s.url)),v1:(esc(s.title)),v2:(esc(s.scope))})).join('')),v7:(K.checked),v8:(esc(d.note||Serein.t("copy_0568")))});}
 function position(el,anchor,width,maxHeight){const vw=global.innerWidth||1024,vh=global.innerHeight||768,r=anchor.getBoundingClientRect();el.style.width=Math.min(width,vw-24)+'px';el.style.maxHeight=Math.min(maxHeight,vh-24)+'px';
  if(el===popup){el.style.left=Math.max(12,(vw-Math.min(width,vw-24))/2)+'px';el.style.top='50%';el.style.transform='translateY(-50%)';return;}
  const h=el.getBoundingClientRect().height||110;let top=r.bottom+8;if(top+h>vh-12)top=Math.max(12,r.top-h-8);el.style.left=Math.max(12,Math.min(r.left,vw-Math.min(width,vw-24)-12))+'px';el.style.top=top+'px';
 }
 function open(el,key){const d=get(key);if(!d||!el?.isConnected||el.closest('#sidebar,#mobile-nav'))return;close(false);hideTip();owner=el;
  const portal=el.closest('dialog[open]')||document.body;popup=document.createElement('aside');popup.id=sourceKey;popup.className='context-popover';popup.dataset.contextOwned='true';popup.setAttribute('role','dialog');popup.setAttribute('aria-modal','false');popup.setAttribute('aria-labelledby','context-card-title');popup.innerHTML=panelHTML(d);portal.appendChild(popup);el.setAttribute('aria-expanded','true');position(popup,el,600,760);popup.querySelector('[data-context-close]').focus({preventScroll:true});
 }
 function close(restore=false){const old=owner;popup?.remove();popup=null;if(old)old.setAttribute('aria-expanded','false');owner=null;if(restore&&old?.isConnected)old.focus({preventScroll:true});}
 function showTip(el){clearTimeout(tipTimer);clearTimeout(hideTimer);if(tipOwner===el&&tooltip)return;hideTip();const data=tips[el.dataset.contextTip];if(!data||!el.isConnected)return;tipOwner=el;tooltip=document.createElement('div');tooltip.id='serein-setting-tip';tooltip.className='context-setting-tip';tooltip.dataset.contextOwned='true';tooltip.setAttribute('role','tooltip');tooltip.textContent=data[1];(el.closest('dialog[open]')||document.body).appendChild(tooltip);el.setAttribute('aria-describedby',tooltip.id);position(tooltip,el,310,240);}
 function hideTip(){clearTimeout(tipTimer);clearTimeout(hideTimer);tipOwner?.removeAttribute('aria-describedby');tooltip?.remove();tipOwner=null;tooltip=null;}
 function queueHide(){clearTimeout(tipTimer);clearTimeout(hideTimer);hideTimer=setTimeout(hideTip,180);}
 function initialize(){
  document.addEventListener('mouseover',e=>{if(e.target.closest?.('.context-setting-tip')){clearTimeout(hideTimer);return;}const b=e.target.closest?.('[data-context-tip]');if(!b||b.contains(e.relatedTarget)||e.sourceCapabilities?.firesTouchEvents)return;clearTimeout(hideTimer);clearTimeout(tipTimer);tipTimer=setTimeout(()=>showTip(b),240);});
  document.addEventListener('mouseout',e=>{if(!e.target.closest?.('[data-context-tip],.context-setting-tip'))return;if(tooltip?.contains(e.relatedTarget)||tipOwner?.contains(e.relatedTarget))return;queueHide();});
  document.addEventListener('focusin',e=>{const b=e.target.closest?.('[data-context-tip]');if(b)showTip(b);else hideTip();});
  document.addEventListener('focusout',e=>{if(e.target.closest?.('[data-context-tip]'))queueHide();});
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-context-open],[data-context-close],[data-context-tip]');if(!b){if(popup&&!popup.contains(e.target))close(false);if(tooltip&&!tooltip.contains(e.target))hideTip();return;}
   e.preventDefault();e.stopImmediatePropagation();if(b.hasAttribute('data-context-close')){close(true);return;}if(b.hasAttribute('data-context-tip')){showTip(b);return;}if(owner===b){close(true);return;}open(b,b.dataset.contextOpen);
  },true);
  document.addEventListener('keydown',e=>{if(e.key!=='Escape'||(!popup&&!tooltip))return;e.preventDefault();e.stopImmediatePropagation();if(tooltip)hideTip();else close(true);},true);
  document.addEventListener('cancel',e=>{if(tooltip||popup){e.preventDefault();if(tooltip)hideTip();else close(true);}},true);
  document.addEventListener('close',e=>{if(!(e.target instanceof HTMLDialogElement))return;if(popup&&e.target.contains(popup))close(false);if(tooltip&&e.target.contains(tooltip))hideTip();},true);
  global.addEventListener('resize',()=>{if(popup)position(popup,owner,600,760);if(tooltip)position(tooltip,tipOwner,310,240);});
  global.addEventListener('scroll',e=>{if(tooltip&&!tooltip.contains(e.target))hideTip();},true);
  const observer=new MutationObserver(records=>{if(busy||queued||!records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&!n.matches?.('[data-context-owned]')&&!n.closest?.('[data-context-owned]'))))return;queued=true;Promise.resolve().then(()=>{queued=false;decorate();});});
  for(const selector of ['#main','#modal','#player']){const el=$(selector);if(el)observer.observe(el,{childList:true,subtree:true});}
 }
 return {initialize,decorate,get,link,resourceHTML,supportHTML,open,close,get active(){return popup;},get tooltip(){return tooltip;}};
}
global.Serein.contextFactory={create};
})(globalThis);


;

globalThis.Serein.scopeArchive=["Optional · Personal reflection, not an assessment","Explore attention, comfort and a practice that fits your day.","HEALTHCARE CROWN ACADEMY LTD · Registered in England and Wales · Company no. 1750190471–75 Shelton Street, Covent Garden, London WC2H 9JQ© 2026 Healthcare Crown AcademyEducational well-being practices · No live monitoring","© 2026 Healthcare Crown AcademyEducational well-being practices · No live monitoring","15 experiences. Your time, your comfort, your way.","Follow a steady rhythm, one phase at a time. Holds are optional.","Explore a gentle imagined scene, with motion optional.","Preference matches, not health recommendations. Practices are optional educational adaptations. You can change the focus, skip, pause, or stop whenever you need.","Choose a studio around the moment you are in. No patient information is needed.","NIOSH’s 2024 Impact Wellbeing Guide sets out six evidence-informed organizational actions. These six Serein studios are original educational tools, not the guide’s six actions.","When to use: A suitable break with agreement from the team.","U.S. health workers reporting burnout often or very often in the 2022 Quality of Worklife survey; published by CDC in 2023. A historical U.S. estimate, not a current local rate or a Serein outcome.","Saved in this browser without encryption. No plan is sent or monitored.","You decide when a step is complete. Skipping or returning is welcome. This is educational progress, without accreditation or clinical assessment.","A small win, a difficult moment, or a support you need. Keep this space free of patient details.","Without saving, entries last for this visit. Nothing is monitored.","Ask permission, offer a choice, and adapt together. Presentation mode keeps the rest of your space out of view.","Serein is not monitored and cannot provide urgent care. If there is immediate danger, use local emergency services or the nearest emergency department. Do not wait for a response from this app.","CDC Quality of Worklife survey, published 2023. Self-reported U.S. workforce estimates, not a current local rate or a measure of Serein.","ICO data protection registration ZC273259 · Registered 13 October 2026.Registration identifies the company as a data controller; it is not a certification of this app.","Personal awareness, not a health score or clinical assessment. These entries are not monitored by a care team or employer.","After a practice, choose optional feedback. Saving is always your choice.","The charts describe your entries. They are not health assessments, treatment outcomes or employer reports.","No practice choices or comfort options saved yet.","Practices work without an account. Preferences and collections stay in this browser. A check-in or reflection is kept beyond this visit only when you choose to save it.","Browser storage is not encrypted or access-controlled. Others using this browser may be able to read saved entries. Do not include patient-identifying details or sensitive information.","Personal data stays in this browser. Different browsers and the standalone file have separate storage; use export/import to transfer your data.","FOLLOW AT A COMFORTABLE PACE","Gently, only as far as feels comfortable.","Pause to change timing. Local voice availability depends on your browser.","A safe, seated break when attention to breathing feels comfortable.","Choose a comfortable pace. Follow gently, or ignore the timing and breathe naturally.","You decide whether it is suitable. No breath holding. The timing is optional: breathe naturally or stop if the pace feels uncomfortable or you feel dizzy.","In and out; this is the guide’s structure, not an effectiveness statistic.","Gentle, comfortable breathing. Serein uses optional shorter timings.","Source mapping updated 2026-10-15. Original educational adaptation; not a clinically validated Serein program. Images are illustrative. You can pause, adapt or stop.","Saved feedback is not encrypted. Without saving it lasts for this visit. Personal observations are not clinical scores.","Breathe gently at a comfortable pace.","A stationary pause when timed breathing and optional holds feel comfortable.","You decide whether it is suitable. Never strain or force a breath hold. Choose “No holds” if holding is uncomfortable. If unsure about breath holds because of a health condition, seek advice from your clinician.","RNOH describes a four-second square rhythm. Serein offers optional pacing and no-holds adaptations; this count is not an effectiveness statistic.","Square breathing, muscle relaxation and calming imagery background; Serein uses optional timings and adaptations.","You decide whether it is suitable. Keep your eyes open if that feels safer. Skip or substitute any sense that is inaccessible, unpleasant, or uncomfortable. Nothing needs to be tasted or touched.","Sensory grounding, with optional substitutions in Serein.","Noticing light effort and release offers a way to explore comfort and support.","Use only a small comfortable effort or select Relax only. Skip painful or unsuitable areas.","You decide whether it is suitable. Avoid tensing painful or injured areas; choose “Relax only” or skip. Stop if you feel pain or discomfort. This is a short PMR-inspired adaptation, not a clinical protocol.","An editorial count of this practice’s steps, not a measured health outcome.","A brief change of focus and comfortable movement can fit a seated break.","Follow small shoulder, hand and neck cues. Keep a comfortable range and skip any movement.","You decide whether it is suitable. Skip any movement that is unsuitable, painful, or makes you dizzy. Do not force a stretch or roll your neck. Check with a clinician if unsure whether these movements are suitable.","Stable seating and comfortable movement. Serein illustrations do not prescribe range.","You decide whether it is suitable. Skip any area or use external focus if body attention feels uncomfortable.","Background on body awareness and mindfulness; not validation of this app.","Optional: close your hands lightly, then let them open.","When gentle muscle attention is comfortable and suitable.","You decide whether it is suitable. Use only light effort. Avoid painful or injured areas. Relax-only mode is available.","Rest your forearms comfortably. Keep wrists neutral.","A close-up sequence makes a small, optional movement easy to follow.","During a seated break with forearms comfortably supported.","Uncurl fingers gently, return to rest, and stop for pain, tingling or discomfort.","You decide whether it is suitable. Stop for pain, tingling, or discomfort. This is a movement cue, not treatment.","Sit supported with arms resting comfortably.","When shoulders are comfortable and a supported seated pause is available.","You decide whether it is suitable. Use a small comfortable range. Skip painful or injured areas.","Use a stable chair. Support your leg and foot comfortably.","Seated on a stable chair, with movements suitable for you.","Move only in a comfortable range. Use Relax only or skip if unsuitable.","You decide whether it is suitable. Do not force range. Skip if movement is unsuitable, painful, or causes discomfort.","Look around. Choose a comfortable position.","You decide whether it is suitable. Use visual details if hearing is inaccessible or focusing on sound is uncomfortable. No microphone is used.","When you have three uninterrupted minutes and an optional attention anchor feels suitable.","Notice what is here, settle on a comfortable anchor, then broaden attention. External focus is available.","You decide whether it is suitable. Breathing is optional. Keep attention external if that feels more comfortable.","Choose an ordinary place that feels comfortable enough.","Imagine only what feels comfortable. Eyes may remain open; external focus replaces imagery.","You decide whether it is suitable. Skip imagery if it feels uncomfortable. Choose grounding in your actual surroundings instead.","Only in a safe, unobstructed place where walking is suitable.","Read the cue first, then put the screen away. Choose a seated practice if walking is unsuitable.","You decide whether it is suitable. Use only if walking is suitable. Do not watch or operate the screen while walking. Seated awareness is an alternative.","Choose a comfortable supported position.","A quiet sequence of support, awareness, and optional release.","You decide whether it is suitable. This practice does not treat sleep difficulties or guarantee sleep. Stop or adapt if uncomfortable.","General wind-down information. Serein does not prescribe a sleep schedule.","A brief pause is not another thing to achieve. It is a chance to notice how you are arriving in this moment.","Why this guide: Reorient attention with an optional pause.","If focusing on your breath is uncomfortable, breathe normally and name five things you can see instead. Stop if you feel dizzy or distressed.","Illustrative · AI-generated editorial image. Educational guidance, not individual treatment.","Caring deeply and protecting your own capacity can coexist. A boundary is not a measure of how much you care; it is a way to make care sustainable.","Grounding may help some people reconnect with the present. Offer it as an invitation rather than a requirement, and ask what feels accessible and comfortable.","This practice is optional and is not a treatment or crisis intervention. Stop or adapt it if it increases discomfort.","Reflection is most useful when it creates understanding rather than another standard to meet. You do not need to solve the whole day before you leave it.","Keep personal reflections free of patient names or identifying details.","Serein does not interpret check-ins as a diagnosis, risk assessment, or a measure of professional performance.","A useful support conversation describes the situation and the help needed. You do not need to wait until you are overwhelmed to ask.","A transition does not need to erase the day. It can help you acknowledge what happened and move into the next part of your life.","Original Serein reflection: \"A difficult shift does not erase the care you gave.\"","A useful boundary explains your capacity and offers a workable next step. Adapt the words to your role and workplace responsibilities.","Use a brief conversation to clarify priorities and available help. Clinical urgency belongs within your professional assessment and local protocols.","Serein is a personal, browser-local educational workspace. It has no connected care team, patient records, or live monitoring.","Preferences, bookmarks, saved words, and routines are stored in this browser. Check-ins and journal entries are stored beyond this visit only when you choose to save them. Unsaved submitted entries disappear on reload or when this page closes.","Browser storage is not encrypted or access-controlled. Someone using the same browser profile may be able to see saved data. Clearing browser data can remove it. Export and import help you keep a copy.","Journal drafts are kept temporarily in this tab’s session storage so a refresh can restore them. This is not encrypted. Submitted entries are kept for another day only when you choose Save on this browser. Clear Serein data also clears the temporary draft.","You can edit or delete individual reflections, delete check-ins, export an archive, import an earlier Serein export, or clear this app’s data. Do not enter patient-identifying details or sensitive health information.","Remembered practice settings, explicit suggestion choices, journey step marks and plans you explicitly save stay in this browser. Practice feedback is visit-only unless you choose to save it. Saved feedback can influence suggestion order. You can remove responses, reset practice choices, delete plans, reset journeys, or clear all Serein data. Nothing is sent to employers or other people.","The hosted edition can store app content offline when you choose. Clearing Serein data removes personal records; remove downloaded app content through your browser site-storage controls. Calendar reminders are downloaded files; they activate only after you import them, and you manage or delete them in your calendar.","Photographs and fonts are included with the app. Optional browser voice guidance uses a local voice only; it remains off if none is available. External reference links open third-party websites.","HEALTHCARE CROWN ACADEMY LTD · Company no. 17501904 · 71–75 Shelton Street, Covent Garden, London WC2H 9JQ. ICO data protection registration ZC273259, as supplied in the company brand kit.","ICO registration is not an accreditation, a certification of this app, or a claim that browser storage is encrypted.","Optional preferences help Serein fit your day. You can change them whenever you like.","Each practice now has its own mapped background sources and adaptation notes. Source availability can change.","Historical U.S. workforce survey. Associations are not proof of causation or Serein outcomes.","Editorial mapping updated 2026-10-15. Content is educational; product outcomes have not been clinically established.","Serein is a well-being studio by Healthcare Crown Academy. It brings together brief optional practices, personal reflection, and practical working-day support.","15 guided experiences include breathing, grounding, awareness, gentle movement, and visualization. Six interactive studios and three flexible learning journeys connect personal practice with practical support. You can use text, illustrative photographs, optional 3D, and available local voice guidance.","Educational practices, not individual medical treatment, clinical assessment, or emergency support. No professional accreditation or affiliation is implied.","Your choice: Any healthcare worker; adapt to role and workplace policy.","Who: Any healthcare worker; adapt to role and workplace policy.","Original educational tool. No automatic sending, reporting, clinical assessment or supervision.","A rehearsal with explanatory feedback, not a competence assessment.","Draft stays temporary. Nothing is sent to anyone. Keep names and patient details out of this space.","You do not have to describe what happened. If immediate safety is at issue, use your workplace escalation or usual urgent-care route.","You can change your mind, decline reflection, or choose qualified support. Serein is not monitored.","Use it: A suitable break with agreement from the team.","Your choice: A facilitator and willing colleagues; never a clinical assessment.","Participation is optional. Offer observing, external focus, skipping and leaving without explanation.","Prepare an inclusive invitation and shared practice. A shared invitation works best when people can decline, adapt or observe.","When: A suitable break with agreement from the team.","Who: A facilitator and willing colleagues; never a clinical assessment.","Shared presentation starts in text view, with sound off, reduced motion and no breath holds. Participants may adapt or sit out."];


;

/* Serein.store: local persistence and optional authenticated encryption. */
(function(S){
'use strict';
const KEY='serein-hca-v3',DRAFT='serein-journal-draft',SEALED_DRAFT='serein-journal-draft-sealed';
const SECRET=['journals','checkins','contacts'];
const clone=o=>JSON.parse(JSON.stringify(o));
const b64=bytes=>{let s='';for(const b of new Uint8Array(bytes))s+=String.fromCharCode(b);return btoa(s);};
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));

/** Isolated crypto check; it never reads or writes personal storage. */
S.cryptoSelftest=async function(){
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(Serein.t("copy_0916")),'PBKDF2',false,['deriveKey']);
 const k=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(Serein.t("copy_0917")));
 const result=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},k,encrypted));
 if(result!==Serein.t("copy_0917"))throw Error(Serein.t("copy_0918"));
 return true;
};
S.createVault=function(c){
 let key=null,memorySealed=null,queue=Promise.resolve(),busy=false,failed=false,epoch=0,draftEpoch=0,pendingWrites=0,pendingDrafts=0;
 const available=!!globalThis.crypto?.subtle;
 const data=()=>c.get();let lastStoredRaw;try{lastStoredRaw=localStorage.getItem(KEY);}catch{}
 function validate(v){
  if(!v||v.format!==1||v.kdf!=='PBKDF2'||v.iterations<310000||v.iterations>1000000||typeof v.salt!=='string'||typeof v.iv!=='string'||typeof v.ciphertext!=='string'||v.ciphertext.length>12000000)throw Error(Serein.t("copy_0919"));
  if(bytes(v.salt).length!==16||bytes(v.iv).length!==12)throw Error(Serein.t("copy_0920"));
  v.lockAfter=[1,5,15,30].includes(+v.lockAfter)?+v.lockAfter:5;v.lockOnHide=v.lockOnHide!==false;return v;
 }
 async function derive(pass,salt,iterations){
  if(!available)throw Error(Serein.t("copy_0723"));
  const raw=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:bytes(salt),iterations},raw,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
 }
 async function seal(payload,k,v){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('Serein-v5-private')},k,new TextEncoder().encode(JSON.stringify(payload)));
  return {format:1,kdf:'PBKDF2',iterations:v.iterations,salt:v.salt,iv:b64(iv),ciphertext:b64(ciphertext),lockAfter:v.lockAfter||5,lockOnHide:v.lockOnHide!==false};
 }
 async function unseal(v,k){
  validate(v);
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(v.iv),additionalData:new TextEncoder().encode('Serein-v5-private')},k,bytes(v.ciphertext));
  return JSON.parse(new TextDecoder().decode(plain));
 }
 function secrets(model,all=false){return Object.fromEntries(SECRET.map(k=>[k,(model[k]||[]).filter(x=>all||x.persistent)]));}
 function payload(model){
  const out=clone(model);out.version=5;
  for(const name of ['feedback','journals','checkins','contacts'])out[name]=(out[name]||[]).filter(x=>x.persistent);
  return out;
 }
 function current(generation){if(generation!==epoch)throw Error(Serein.t("copy_0921"));}
 function write(out){
  if(c.storageBlocked?.()){if(!failed)Promise.resolve().then(()=>c.notice(Serein.t("copy_0922")));failed=true;return false;}
  try{const previous=localStorage.getItem(KEY);if(previous!==lastStoredRaw&&!(lastStoredRaw===undefined&&previous===null)){if(!failed)Promise.resolve().then(()=>c.notice(Serein.t("copy_0923")));failed=true;return false;}const serialised=JSON.stringify(out);localStorage.setItem(KEY,serialised);lastStoredRaw=serialised;failed=false;return true;}
  catch{if(!failed)Promise.resolve().then(()=>c.notice(Serein.t("copy_0924")));failed=true;return false;}
 }
 function enqueue(task){const result=queue.then(task);queue=result.catch(()=>{});return result;}
 /** Persist only explicitly saved personal records. Encrypted snapshots are serialised. */
 function persist(){
  const snapshot=clone(data()),activeKey=key,generation=epoch;
  if(!snapshot.vault){const ok=write(payload(snapshot));return Promise.resolve(ok);}
  pendingWrites++;return enqueue(async()=>{
   if(generation!==epoch)return false;const out=payload(snapshot),env=activeKey?await seal(secrets(snapshot),activeKey,snapshot.vault):data().vault;
   out.vault=env;for(const name of SECRET)delete out[name];
   if(generation!==epoch)return false;data().vault=env;return write(out);
  }).catch(()=>{c.notice(Serein.t("copy_0925"));return false;}).finally(()=>pendingWrites--);
 }
 async function enable(pass){
  if(busy)throw Error(Serein.t("copy_0926"));
  if(pass.length<6)throw Error(Serein.t("copy_0927"));
  if(data().vault)throw Error(Serein.t("copy_0928"));
  const generation=epoch;busy=true;
  try{
   const salt=b64(crypto.getRandomValues(new Uint8Array(16))),settings={salt,iterations:310000,lockAfter:5,lockOnHide:true},nextKey=await derive(pass,salt,310000);current(generation);
   const env=await seal(secrets(data()),nextKey,settings),out=payload(data());current(generation);out.vault=env;for(const name of SECRET)delete out[name];
   if(!write(out))throw Error(Serein.t("copy_0929"));
   epoch++;const enabledGeneration=epoch;key=nextKey;data().vault=env;
   try{localStorage.removeItem('serein-demo-v1');sessionStorage.removeItem(DRAFT);}catch{c.notice(Serein.t("copy_0930"));}
   await saveDraft(c.getDraft());current(enabledGeneration);c.changed();return true;
  }finally{busy=false;}
 }
 /** Unlock only after authentication succeeds. Failed attempts never expose records. */
 async function unlock(pass){
  if(!data().vault)return;
  if(busy)throw Error(Serein.t("copy_0926"));
  const generation=epoch;busy=true;
  try{
   const env=validate(data().vault),nextKey=await derive(pass,env.salt,env.iterations);
   const plain=await unseal(memorySealed||env,nextKey);current(generation);
   const normal=c.normalise({...data(),...plain,vault:null});
   let draft='';try{const sealed=JSON.parse(sessionStorage.getItem(SEALED_DRAFT)||'null');if(sealed&&sealed.salt===env.salt)draft=(await unseal(sealed,nextKey)).draft||'';}catch{}
   current(generation);
   for(const name of SECRET)data()[name]=normal[name]||[];
   key=nextKey;memorySealed=null;c.setDraft(draft);c.changed();
  }catch(error){if(generation!==epoch)throw error;throw Error(Serein.t("copy_0931"));}
  finally{busy=false;}
 }
 async function lock(){
  if(!data().vault||!key||busy)return false;
  const generation=epoch;busy=true;
  try{
   await queue;current(generation);await persist();current(generation);
   const sealed=await seal(secrets(data(),true),key,data().vault);current(generation);
   await saveDraft(c.getDraft());current(generation);
   memorySealed=sealed;key=null;for(const name of SECRET)data()[name]=[];
   c.setDraft('');c.clearPrivateUI();c.changed();return true;
  }finally{busy=false;}
 }
 async function remove(pass){
  if(!data().vault)return;
  if(busy)throw Error(Serein.t("copy_0926"));
  if(!key)await unlock(pass);
  const generation=epoch;busy=true;
  try{
   const previous=data().vault;await unseal(previous,await derive(pass,previous.salt,previous.iterations));current(generation);
   await queue;current(generation);const out=payload(data());delete out.vault;
   if(!write(out))throw Error(Serein.t("copy_0932"));
   epoch++;const removedGeneration=epoch;draftEpoch++;data().vault=null;key=null;memorySealed=null;
   try{sessionStorage.removeItem(SEALED_DRAFT);}catch{}
   await saveDraft(c.getDraft());current(removedGeneration);c.changed();return previous;
  }finally{busy=false;}
 }
 async function saveDraft(text){const ticket=++draftEpoch,generation=epoch;
  if(!data().vault){try{if(text)sessionStorage.setItem(DRAFT,text);else sessionStorage.removeItem(DRAFT);return true;}catch{return false;}}
  if(!key)return false;
  pendingDrafts++;try{
   if(text){const env=await seal({draft:text},key,data().vault);if(ticket!==draftEpoch||generation!==epoch)return false;sessionStorage.setItem(SEALED_DRAFT,JSON.stringify(env));}
   else sessionStorage.removeItem(SEALED_DRAFT);
   sessionStorage.removeItem(DRAFT);return true;
  }catch{return false;}finally{pendingDrafts--;}
 }
 async function exportEncrypted(){
  if(busy)throw Error(Serein.t("copy_0933"));
  if(!data().vault)throw Error(Serein.t("copy_0934"));
  await queue;const out=payload(data());
  out.vault=key?await seal(secrets(data(),true),key,data().vault):memorySealed||data().vault;
  for(const name of SECRET)delete out[name];out.app='Serein';out.exportedAt=new Date().toISOString();return out;
 }
 async function decryptArchive(raw,pass){
  const env=validate(raw.vault),k=await derive(pass,env.salt,env.iterations),plain=await unseal(env,k);
  return c.normalise({...raw,...plain,vault:null});
 }
 function reset(){epoch++;draftEpoch++;key=null;memorySealed=null;try{localStorage.removeItem(KEY);lastStoredRaw=null;failed=false;localStorage.removeItem('serein-demo-v1');localStorage.removeItem('serein-toolkit-v1');localStorage.removeItem('serein-player-v1');sessionStorage.removeItem(DRAFT);sessionStorage.removeItem(SEALED_DRAFT);}catch{}}
 return {available,persist,enable,unlock,lock,remove,saveDraft,exportEncrypted,decryptArchive,validate,reset,flush:()=>queue,get enabled(){return !!data().vault},get locked(){return !!data().vault&&!key},get busy(){return busy},get pending(){return busy||pendingWrites>0||pendingDrafts>0}};
};
})(globalThis.Serein=globalThis.Serein||{});


;

/* Serein.insights: descriptive personal observations, with table alternatives. */
(function(S){
'use strict';
S.insights={render:function(c){if(globalThis.SereinDay&&c.store.checkins.length===0&&c.store.feedback.length===0)return SereinDay.insightsEmpty(c);
 const {store,state,esc}=c,now=new Date(),dayKey=d=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');};
 const allowed=x=>state.dateFilter==='all'||Date.now()-Date.parse(x.date)<=Number(state.dateFilter)*86400000;
 const entries=store.checkins.filter(allowed),feedback=store.feedback.filter(allowed),pairs=feedback.filter(x=>x.before&&x.after);
 const labels=['Low',Serein.t("copy_0022"),'Okay','Good','Great'],days=[];
 for(let n=55;n>=0;n--){const d=new Date(now);d.setHours(12,0,0,0);d.setDate(d.getDate()-n);const rows=entries.filter(x=>dayKey(x.date)===dayKey(d));days.push({date:d.toLocaleDateString('en-GB'),rows,mean:rows.length?rows.reduce((a,x)=>a+x.mood,0)/rows.length:null});}
 const cells=days.map((x,i)=>'<rect x="'+(Math.floor(i/7)*38+4)+'" y="'+((i%7)*30+4)+Serein.t("copy_0867")+(x.mean?Math.round(x.mean):0)+'"><title>'+esc(x.date+': '+(x.rows.length?x.rows.length+Serein.t("copy_0868")+x.mean.toFixed(1):Serein.t("copy_0869")))+'</title></rect>').join('');
 const calendar=Serein.t("copy_0870")+entries.length+Serein.t("copy_0871")+cells+Serein.t("copy_0872")+days.map(x=>'<tr><td>'+x.date+'</td><td>'+x.rows.length+'</td><td>'+(x.mean?x.mean.toFixed(1):'—')+'</td></tr>').join('')+'</tbody></table></div></details></section>';
 const dots=pairs.map((p,i)=>'<g><line x1="'+(40+(p.before-1)*55)+'" x2="'+(40+(p.after-1)*55)+'" y1="'+(24+i*28)+'" y2="'+(24+i*28)+Serein.t("copy_0873")+(40+(p.before-1)*55)+'" cy="'+(24+i*28)+Serein.t("copy_0874")+(40+(p.after-1)*55)+'" cy="'+(24+i*28)+'" r="5" class="pair-after"><title>'+esc(S.data.practices.find(x=>x.id===p.practiceId)?.title+': '+p.before+' before; '+p.after+' after')+'</title></circle></g>').join('');
 const pairChart=Serein.t("copy_0875")+pairs.length+Serein.t("copy_0876")+(pairs.length?Serein.t("copy_0877")+(pairs.length*28+48)+Serein.t("copy_0878")+pairs.length+Serein.t("copy_0879")+dots+'<text x="40" y="'+(pairs.length*28+25)+'">1</text><text x="255" y="'+(pairs.length*28+25)+'">5</text></svg>':Serein.t("copy_0880"))+Serein.t("copy_0881")+pairs.map(p=>'<tr><td>'+esc(S.data.practices.find(x=>x.id===p.practiceId)?.title)+'</td><td>'+p.before+'</td><td>'+p.after+'</td></tr>').join('')+'</tbody></table></div></details></section>';
 const weekly=store.feedback.filter(x=>Date.now()-Date.parse(x.date)<7*86400000),helpful=weekly.filter(x=>x.result==='Helpful');
 const week=Serein.t("copy_0882")+weekly.length+Serein.t("copy_0883")+(helpful.length?Serein.t("copy_0884")+helpful.length+' helpful: '+[...new Set(helpful.map(x=>S.data.practices.find(p=>p.id===x.practiceId)?.title))].map(esc).join(', ')+'.':Serein.t("copy_0885"))+Serein.t("copy_0886");
 const moments=Serein.t("copy_0887")+S.data.moments.map((m,i)=>{const f=feedback.filter(x=>x.moment===i),yes=f.filter(x=>x.result==='Helpful'),counts={};for(const row of yes)counts[row.practiceId]=(counts[row.practiceId]||0)+1;return Serein.t("copy_0888")+esc(m.title)+'</h3><p>'+yes.length+' of '+f.length+Serein.t("copy_0889")+(yes.length?'<ul>'+Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([id,n])=>'<li>'+esc(S.data.practices.find(p=>p.id===id)?.title)+' · '+n+'</li>').join('')+'</ul>':Serein.t("copy_0890"))+'</div>';}).join('')+'</section>';
 const history=Serein.t("copy_0891")+feedback.filter(x=>x.persistent).length+' of '+feedback.length+Serein.t("copy_0892")+feedback.length+')</summary>'+feedback.slice().reverse().map(f=>Serein.t("copy_0893")+esc(S.data.practices.find(p=>p.id===f.practiceId)?.title)+' · '+esc(f.result)+Serein.t("copy_0894")+esc(new Date(f.date).toLocaleString('en-GB'))+' · '+(f.persistent?Serein.t("copy_0067"):Serein.t("copy_0366"))+Serein.t("copy_0895")+esc(f.id)+Serein.t("copy_0896")).join('')+'</details>'+c.entriesHTML(entries,'checkin')+'</section>';
 return Serein.t("copy_0897")+entries.length+Serein.t("copy_0898")+feedback.length+Serein.t("copy_0899")+pairs.length+Serein.t("copy_0900")+week+Serein.t("copy_0901")+calendar+pairChart+'</div>'+moments+history+Serein.t("copy_0902");
}};
})(globalThis.Serein=globalThis.Serein||{});


;

/* Serein.player enhancements: optional device APIs, audio and local voice. */
(function(S){
'use strict';
S.createPlayerTools=function(c){
 let wake=null,wakePending=false,audio=null,nodes=[],gain=null,lastPhase='',lastSecond=-1,countdown=0,countdownTimer=0;
 const $=c.$,state=c.state;
 function extras(){
  if(globalThis.SereinPlayer)return SereinPlayer.extras(c);
  const voices=globalThis.speechSynthesis?.getVoices?.().filter(x=>x.localService&&/^en/i.test(x.lang)).sort((a,b)=>Number(/^en-GB/.test(b.lang))-Number(/^en-GB/.test(a.lang)))||[];
  return Serein.t("copy_0903")+(voices.length?Serein.t("copy_0904")+voices.map(v=>Serein.t("copy_0580")+c.esc(v.voiceURI)+'" '+(c.store.preferences.voiceURI===v.voiceURI?'selected':'')+'>'+c.esc(v.name+' · '+v.lang)+'</option>').join('')+Serein.t("copy_0905")+(c.store.preferences.voiceRate||.86)+Serein.t("copy_0906"):Serein.t("copy_0907"))+((globalThis.AudioContext||globalThis.webkitAudioContext)?Serein.t("copy_0908"):'')+('wakeLock'in navigator?Serein.t("copy_0909"):'')+('vibrate'in navigator&&/Android/i.test(navigator.userAgent)?Serein.t("copy_0910"):'')+Serein.t("copy_0911");
 }
 async function releaseWake(){try{await wake?.release();}catch{}wake=null;}
 async function syncWake(){
  if(!navigator.wakeLock||!$('#keep-awake')?.checked||state.session?.state!=='playing'||document.visibilityState==='hidden'){await releaseWake();return;}
  if(wake||wakePending)return;wakePending=true;
  try{const acquired=await navigator.wakeLock.request('screen');if(!$('#player').open||!$('#keep-awake')?.checked||state.session?.state!=='playing'||document.visibilityState==='hidden'){await acquired.release();return;}wake=acquired;wake.addEventListener?.('release',()=>{if(wake===acquired)wake=null;});}catch{c.toast(Serein.t("copy_0912"));}
  finally{wakePending=false;}
 }
 function stopAmbient(){for(const n of nodes){try{n.stop?.();n.disconnect?.();}catch{}}nodes=[];gain=null;}
 function ambient(){
  const type=$('#ambient-sound')?.value||'off';stopAmbient();if(type==='off'||state.session?.state!=='playing')return;
  try{
   const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(!C)return;audio=audio||new C();audio.resume().catch(()=>{});
   gain=audio.createGain();gain.gain.value=Number($('#ambient-volume')?.value||.06);gain.connect(audio.destination);
   if(type==='hum'){const osc=audio.createOscillator();osc.frequency.value=110;osc.type='sine';osc.connect(gain);osc.start();nodes.push(osc);}
   else{
    const buffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate),data=buffer.getChannelData(0);let previous=0;
    for(let i=0;i<data.length;i++){const white=Math.random()*2-1;previous=(previous+.02*white)/1.02;data[i]=type==='ocean'?previous*4:white*.4;}
    const source=audio.createBufferSource(),filter=audio.createBiquadFilter();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=type==='rain'?1700:550;source.connect(filter);filter.connect(gain);source.start();nodes.push(source,filter);
   }
  }catch{c.toast(Serein.t("copy_0913"));}
 }
 function change(e){
  if(e.id==='ambient-sound')ambient();
  if(e.id==='ambient-volume'&&gain)gain.gain.setTargetAtTime(Number(e.value),audio.currentTime,.1);
  if(e.id==='keep-awake')syncWake();
  if(e.id==='voice-choice'||e.id==='voice-rate'){c.store.preferences[e.id==='voice-choice'?'voiceURI':'voiceRate']=e.id==='voice-choice'?e.value:Number(e.value);c.persist();}
 }
 function media(){
  if(!navigator.mediaSession||!globalThis.MediaMetadata||!state.session)return;
  const p=state.session.practice;try{navigator.mediaSession.metadata=new MediaMetadata({title:p.title,artist:Serein.t("copy_0850"),album:Serein.t("copy_0914"),artwork:[{src:S.mediaURL(p.photo)}]});for(const [name,fn] of Object.entries({play:()=>{if(state.session?.state!=='playing')c.playPause()},pause:()=>{if(state.session?.state==='playing')c.pausePlayer()},stop:()=>c.exitPlayer()}))navigator.mediaSession.setActionHandler(name,fn);}catch{}
 }
 function tick(s){
  if(!s)return;
  const phase=state.session.practice.id+':'+s.index,second=Math.floor(s.elapsed);
  if(s.state==='playing'&&phase!==lastPhase){lastPhase=phase;if($('#phase-haptics')?.checked&&/Android/i.test(navigator.userAgent))try{navigator.vibrate(25);}catch{}}
  if(navigator.mediaSession)try{navigator.mediaSession.playbackState=s.state==='playing'?'playing':'paused';}catch{}
  if(second!==lastSecond){lastSecond=second;if(navigator.mediaSession){try{navigator.mediaSession.playbackState=s.state==='playing'?'playing':'paused';if(state.session.duration)navigator.mediaSession.setPositionState?.({duration:state.session.duration,playbackRate:1,position:Math.min(s.elapsed,state.session.duration)});}catch{}}}
  if(s.state!=='playing'){releaseWake();stopAmbient();}
 }
 function started(){syncWake();ambient();}
 function prepare(){lastPhase='';lastSecond=-1;media();}
 function cancelCountdown(){clearInterval(countdownTimer);countdownTimer=0;countdown=0;$('#quick-countdown')?.remove();}
 function quick(){
  cancelCountdown();const p=c.recommend();if(!p){c.finder();return;}
  c.openPractice(p.id,c.chooseDuration(p,c.store.preferences.time));
  if(c.reduced()){c.playPause();return;}
  countdown=3;const box=document.createElement('div');box.id='quick-countdown';box.className='quick-countdown';box.setAttribute('role','status');box.setAttribute('aria-live','polite');box.textContent=Serein.t("copy_0915")+countdown;$('#player').appendChild(box);
  countdownTimer=setInterval(()=>{if(!$('#player').open){cancelCountdown();return;}countdown--;if(countdown<=0){cancelCountdown();c.playPause();}else box.textContent=Serein.t("copy_0915")+countdown;},1000);
 }
 function stop(){cancelCountdown();releaseWake();stopAmbient();if(navigator.mediaSession)try{navigator.mediaSession.playbackState='none';navigator.mediaSession.metadata=null;for(const name of ['play','pause','stop'])navigator.mediaSession.setActionHandler(name,null);}catch{}}
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')syncWake();else releaseWake();});
 globalThis.speechSynthesis?.addEventListener?.('voiceschanged',()=>{if($('#player-settings').open&&$('#voice-choice')===null)c.refreshVoices?.();});
 return {extras,change,tick,prepare,started,stop,quick,cancelCountdown,get counting(){return countdown>0}};
};
})(globalThis.Serein=globalThis.Serein||{});


;

/* Reviewed raster images; source: infographics-content.json + infographics-raster.json. */
(function(S){'use strict';S.infographicCards=[{"id":"pressure-at-work","title":"Pressure is a shared responsibility","category":"Work","kind":"Population estimate","visual":"dots","metric":"16%","metricLabel":"of working-age adults worldwide","metricNote":"Estimated to have a mental disorder in 2023. WHO fact sheet, September 2026.","summary":"Workplace conditions matter alongside individual support. A pause can help you choose a next step; it cannot repair unsafe staffing or bullying.","who":"Healthcare workers, team leaders and educators.","when":"When pressure keeps returning or a work barrier needs attention.","why":"Move the conversation from personal blame to practical support and safer work design.","steps":[["Notice","Name the pressure: workload, unclear expectations or limited support."],["Ask","Choose one specific change to discuss with a colleague or manager."],["Follow up","Agree who will act, what will change and when you will review it."]],"limit":"This is a global working-age estimate, not a healthcare-only rate or a prediction about you. Serein has not been tested as a treatment.","source":{"title":"WHO: Mental health at work","url":"https://www.who.int/news-room/fact-sheets/detail/mental-health-at-work","date":"15 September 2026","short":"WHO · 2026 / estimate year 2023"},"action":{"label":"Build a work-barrier plan","route":"toolkit/conditions"},"image":"assets/infographics/pressure-at-work.webp","thumbnail":"assets/infographics/thumbs/pressure-at-work.webp","width":1086,"height":1448,"format":"webp","checked":"16 October 2026"},{"id":"gentle-breathing","title":"Breathe gently, without forcing","category":"Reset","kind":"Practice guidance","visual":"breath","metric":"1–5","metricLabel":"an optional count, at your own pace","metricNote":"Count gently on the in-breath and again on the out-breath, only if comfortable.","summary":"Gentle breathing is a choice. There is no need to hold your breath, fill your lungs fully or match somebody else's timing.","who":"People who find breath-focused practices comfortable.","when":"During a safe pause, away from tasks that need your full attention.","why":"Offer a simple point of attention during a pressured moment.","steps":[["Settle","Sit or stand with support. Let your shoulders soften."],["Breathe","Let air come in gently and leave gently. An easy count may help."],["Adapt","Stop if dizzy or uncomfortable. Switch to noticing the room instead."]],"limit":"NHS guidance suggests practising for at least five minutes. The count is a cue, not a fixed breathing prescription or a guaranteed outcome. New or severe breathing symptoms need appropriate medical attention.","source":{"title":"NHS: Breathing exercises for stress","url":"https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/","date":"Accessed 16 October 2026","short":"NHS · breathing guidance / checked 2026"},"action":{"label":"Find a comfortable practice","route":"library/practices?style=breath"},"image":"assets/infographics/gentle-breathing.webp","thumbnail":"assets/infographics/thumbs/gentle-breathing.webp","width":1086,"height":1448,"format":"webp","checked":"16 October 2026"},{"id":"five-senses","title":"Come back to the room","category":"Reset","kind":"Grounding exercise","visual":"senses","metric":"5 · 4 · 3 · 2 · 1","metricLabel":"five senses, one gentle sequence","metricNote":"5 see · 4 feel · 3 hear · 2 smell · 1 taste","summary":"Grounding redirects attention to your surroundings. Use senses that are available and comfortable for you; completing every count is optional.","who":"People who prefer an external focus instead of following the breath.","when":"When thoughts are racing and you can safely pause.","why":"Make the next moment concrete through ordinary details around you.","steps":[["Look and feel","Notice five visible details and four points of safe contact."],["Listen and notice","Notice three sounds, two smells and one taste, if accessible."],["Choose","Skip any sense that is uncomfortable. Decide one useful next action."]],"limit":"The numbers organise an exercise; they are not a dose or a success score. Do not touch, smell or taste clinical materials. This is optional grounding, not trauma treatment.","source":{"title":"NHS inform: Grounding exercises","url":"https://www.nhsinform.scot/healthy-living/mental-wellbeing/breathing-and-relaxation-exercises/grounding-exercises/","date":"Accessed 16 October 2026","short":"NHS inform · grounding / checked 2026"},"action":{"label":"Explore grounding practices","route":"library/practices?style=ground"},"image":"assets/infographics/five-senses.webp","thumbnail":"assets/infographics/thumbs/five-senses.webp","width":1086,"height":1448,"format":"webp","checked":"16 October 2026"},{"id":"micro-breaks","title":"A small break can make room","category":"Reset","kind":"Research summary","visual":"breaks","metric":"22","metricLabel":"independent study samples","metricNote":"2,335 participants in a 2022 meta-analysis of micro-breaks, defined as breaks up to 10 minutes.","summary":"The review found small improvements in energy and fatigue. Overall task performance did not improve significantly.","who":"Workers and students planning realistic opportunities to pause.","when":"Between tasks, when care coverage and local procedures allow.","why":"Treat a break as recovery space without promising a productivity boost.","steps":[["Coordinate","Arrange safe cover before stepping away from a responsibility."],["Change focus","Look away from the task, move comfortably or take a quiet pause."],["Return","Check what matters next. Longer or protected rest may still be needed."]],"limit":"Mixed tasks and populations; not evidence that a specific Serein practice improves clinical performance. The study count and sample size describe the review, not an effect percentage.","source":{"title":"Albulescu et al.: Micro-breaks systematic review and meta-analysis","url":"https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0272460","date":"31 August 2022","short":"Albulescu et al. · PLOS ONE · 2022"},"action":{"label":"Find a short pause","route":"library/practices?time=60"},"image":"assets/infographics/micro-breaks.webp","thumbnail":"assets/infographics/thumbs/micro-breaks.webp","width":1086,"height":1448,"format":"webp","checked":"16 October 2026"},{"id":"sleep-recovery","title":"Protect your sleep opportunity","category":"Recovery","kind":"Adult sleep guidance","visual":"sleep","metric":"7+ hours","metricLabel":"recommended daily for adults aged 18–60","metricNote":"CDC guidance. Sleep needs vary with age; quality matters as well as duration.","summary":"Make recovery possible around the rota. A calm, quiet and cool sleep space can support a planned sleep opportunity.","who":"Adults planning recovery, especially around changing work patterns.","when":"Before a stretch of shifts and when planning the next sleep period.","why":"Protect time for sleep instead of treating it as whatever remains after work.","steps":[["Plan","Agree a protected sleep window with the people you live with."],["Prepare","Reduce light and noise; make the room comfortable and cool."],["Review","Seek healthcare advice for recurring sleep problems or persistent sleepiness."]],"limit":"The headline applies to ages 18–60; CDC lists 7–9 hours for 61–64 and 7–8 for 65+. This card is general guidance, not an individual shift-work sleep prescription.","source":{"title":"CDC: About sleep","url":"https://www.cdc.gov/sleep/about/index.html","date":"15 May 2024","short":"CDC · About sleep · 2024"},"action":{"label":"Plan a gentler transition","route":"toolkit/transition"},"image":"assets/infographics/sleep-recovery.webp","thumbnail":"assets/infographics/thumbs/sleep-recovery.webp","width":1086,"height":1448,"format":"webp","checked":"16 October 2026"},{"id":"fatigue-journey","title":"Plan a safer journey home","category":"Recovery","kind":"Fatigue research context","visual":"journey","metric":"17 hours","metricLabel":"awake in research comparisons","metricNote":"Some performance impairment was similar to a blood alcohol concentration of 0.05% in studies cited by NIOSH.","summary":"Drowsiness can affect judgement and attention. Plan alternatives before you reach the end of a demanding shift.","who":"Anyone travelling after long hours or insufficient sleep.","when":"Before the shift and again before the journey home.","why":"Make a transport plan while you can still consider your options clearly.","steps":[["Notice","Take heavy eyelids, drifting attention or repeated yawning seriously."],["Stop","If sleepy, do not start or continue driving. Find a safe place to stop."],["Arrange","Choose safe transport or appropriate rest before travelling again."]],"limit":"A laboratory comparison, not a personal alcohol reading or a legal driving limit. Less than 17 hours awake does not mean you are safe to drive. A brief app pause cannot restore fitness to drive.","source":{"title":"CDC/NIOSH: Impairments due to sleep deprivation","url":"https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod3/08.html","date":"Accessed 16 October 2026","short":"CDC / NIOSH · nurse work-hour training"},"action":{"label":"Make a transition plan","route":"toolkit/transition"},"image":"assets/infographics/fatigue-journey.webp","thumbnail":"assets/infographics/thumbs/fatigue-journey.webp","width":1086,"height":1448,"format":"webp","checked":"16 October 2026"},{"id":"movement-week","title":"Build movement into the week","category":"Recovery","kind":"Adult activity guidance","visual":"movement","metric":"150 + 2","metricLabel":"minutes of moderate activity + strength days","metricNote":"At least 150 moderate-intensity minutes per week, plus muscle-strengthening activity on at least two days.","summary":"Activity can be spread through the week in manageable amounts. Some movement is better than none.","who":"Adults adapting activity to their ability, health and circumstances.","when":"When planning the week rather than adding pressure to a difficult day.","why":"Turn a broad recommendation into options that fit your life.","steps":[["Choose","Pick comfortable movement you can repeat, such as walking or wheeling."],["Spread","Break activity into smaller amounts across the week."],["Adapt","Add strength work suited to you; seek individual advice when needed."]],"limit":"CDC also describes vigorous-intensity alternatives. A gentle Serein stretch may not count as moderate activity or strength training. Follow personal advice for health conditions or activity restrictions.","source":{"title":"CDC: Adult activity overview","url":"https://www.cdc.gov/physical-activity-basics/guidelines/adults.html","date":"20 December 2023","short":"CDC · adult activity guidance · 2023"},"action":{"label":"Explore comfortable movement","route":"library/practices"},"image":"assets/infographics/movement-week.webp","thumbnail":"assets/infographics/thumbs/movement-week.webp","width":1086,"height":1448,"format":"webp","checked":"16 October 2026"},{"id":"understanding-burnout","title":"Understand the burnout pattern","category":"Work","kind":"Occupational definition","visual":"burnout","metric":"3","metricLabel":"dimensions in the ICD-11 description","metricNote":"Exhaustion · distance or cynicism about work · reduced professional effectiveness","summary":"WHO describes burnout in the work context. Recognising a pattern can help start a support conversation; it does not diagnose its cause.","who":"Workers and leaders noticing a persistent change in work experience.","when":"When exhaustion, detachment or feeling ineffective keeps returning.","why":"Use precise language and consider working conditions alongside support.","steps":[["Recognise","Notice changes without turning the card into a personal score."],["Discuss","Talk with a trusted person about workload and support needs."],["Seek support","Ask for professional help when symptoms persist or affect daily life."]],"limit":"ICD-11 treats burnout as an occupational phenomenon, not a medical condition. These three dimensions are not a self-diagnostic checklist; other conditions may need assessment.","source":{"title":"WHO: Burn-out as an occupational phenomenon","url":"https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases","date":"28 May 2019","short":"WHO · ICD-11 occupational context · 2019"},"action":{"label":"Prepare a support conversation","route":"toolkit/support"},"image":"assets/infographics/understanding-burnout.webp","thumbnail":"assets/infographics/thumbs/understanding-burnout.webp","width":1086,"height":1448,"format":"webp","checked":"16 October 2026"},{"id":"work-design","title":"Find the work barrier","category":"Work","kind":"Work design framework","visual":"domains","metric":"6","metricLabel":"areas in the HSE Management Standards","metricNote":"Demands · Control · Support · Relationships · Role · Change","summary":"A clear description of the work barrier helps a team discuss a practical change. Organisational problems need organisational action.","who":"Workers, line managers and teams reviewing recurring pressure.","when":"Before a supervision, team review or work-design conversation.","why":"Make the cause visible instead of asking people to cope indefinitely.","steps":[["Locate","Choose the area closest to the problem you are facing."],["Describe","Write one factual example without patient or colleague identifiers."],["Request","Ask for a specific change and agree a review point."]],"limit":"This is a UK work-design framework, not a clinical screening tool. Serein's draft is not an employer risk assessment or a substitute for local reporting procedures.","source":{"title":"HSE: What are the Management Standards?","url":"https://www.hse.gov.uk/stress/standards/overview.htm","date":"14 January 2025","short":"HSE · Management Standards · 2025"},"action":{"label":"Build a work-barrier plan","route":"toolkit/conditions"},"image":"assets/infographics/work-design.webp","thumbnail":"assets/infographics/thumbs/work-design.webp","width":1086,"height":1448,"format":"webp","checked":"16 October 2026"},{"id":"speak-up","title":"Speak up clearly about safety","category":"Work","kind":"Team communication tool","visual":"cus","metric":"C · U · S","metricLabel":"a shared structure for a safety concern","metricNote":"Concerned → Uncomfortable → Safety issue","summary":"TeamSTEPPS uses CUS to make the seriousness of a concern clear. Explain the issue and the action needed.","who":"Healthcare teams using an agreed safety communication approach.","when":"When a safety concern needs to be heard and acted on.","why":"Move from a vague worry to a clear, shared statement about safety.","steps":[["C — Concerned","State what concerns you and describe the relevant facts."],["U — Uncomfortable","Explain why the situation makes you uncomfortable."],["S — Safety issue","Name the safety issue. Notify a supervisor if it is not acknowledged."]],"limit":"Use local escalation procedures and urgent action when required; do not wait to work through this card in an emergency. It is not a patient-management protocol or evidence of a percentage reduction in harm.","source":{"title":"AHRQ TeamSTEPPS: CUS","url":"https://www.ahrq.gov/teamstepps-program/curriculum/mutual/tools/cus.html","date":"May 2023","short":"AHRQ · TeamSTEPPS 3.0 · 2023"},"action":{"label":"Prepare words for a conversation","route":"toolkit/support"},"image":"assets/infographics/speak-up.webp","thumbnail":"assets/infographics/thumbs/speak-up.webp","width":1086,"height":1448,"format":"webp","checked":"16 October 2026"},{"id":"end-shift","title":"Close the shift with a next step","category":"Recovery","kind":"Serein reflection framework","visual":"transition","metric":"3","metricLabel":"optional prompts for the transition home","metricNote":"Hand over · Acknowledge · Choose","summary":"Give unfinished work an appropriate handover, acknowledge what the day held and choose one manageable recovery action.","who":"Anyone leaving a demanding work period.","when":"After clinical responsibilities are handed over and before the journey home.","why":"Create a practical boundary between the working day and what comes next.","steps":[["Hand over","Put outstanding work into the appropriate local handover process."],["Acknowledge","Notice one difficult part and one thing you contributed; sharing is optional."],["Choose","Pick a realistic next action: safe transport, food, rest or contacting someone."]],"limit":"An original Serein educational adaptation, not a validated debrief protocol. Do not enter patient identifiers. It cannot resolve traumatic stress, unsafe work or fatigue on its own.","source":{"title":"Serein: Leave work at work studio","url":"#toolkit/transition","date":"Serein 5.1.0 · 16 October 2026","short":"Serein · original educational framework · 2026"},"action":{"label":"Build my transition plan","route":"toolkit/transition"},"image":"assets/infographics/end-shift.webp","thumbnail":"assets/infographics/thumbs/end-shift.webp","width":1086,"height":1448,"format":"webp","checked":"16 October 2026"},{"id":"privacy-choices","title":"Know where your words stay","category":"Privacy","kind":"Current app behaviour","visual":"privacy","metric":"3","metricLabel":"data choices to understand","metricNote":"This visit · Save in this browser · Optional journal lock","summary":"Serein keeps personal records in your browser. There is no cloud sync. Moving to a different website address needs an explicit export and import.","who":"Every Serein user, especially on shared devices or when changing hosts.","when":"Before saving, enabling the journal lock, exporting or moving the app.","why":"Make a clear choice about retention, access and recovery.","steps":[["This visit","Personal entries remain temporary unless you choose to save them; drafts can use temporary tab storage."],["This browser","Saved entries remain in this browser profile. Other people with access may be able to read unlocked records."],["Optional lock","Encrypt journals, check-ins and contacts. Keep your passphrase; there is no reset service."]],"limit":"The optional lock does not cover preferences, feedback or saved plans, and does not protect an unlocked device. The deployment ZIP contains app content, not your personal journal backup.","source":{"title":"Serein: Data and privacy","url":"#me/data","date":"Serein 5.1.0 · 16 October 2026","short":"Serein · browser storage and vault implementation"},"action":{"label":"Review data and privacy","route":"me/data"},"image":"assets/infographics/privacy-choices.webp","thumbnail":"assets/infographics/thumbs/privacy-choices.webp","width":1086,"height":1448,"format":"webp","checked":"16 October 2026"}];})(globalThis.Serein=globalThis.Serein||{});


;

/* Serein educational infographic reader. No tracking or private-record storage. */
(function(S){
'use strict';
S.createInfographics=function(c){
 const cards=S.infographicCards,esc=c.esc,icon=c.icon;
 let category='All',lastImage='',direction=1,start=null,suppressClick=false,pendingFocus='';
 const categories=['All','Reset','Recovery','Work','Privacy'];
 const filtered=()=>category==='All'?cards:cards.filter(x=>x.category===category);
 const current=()=>cards.find(x=>x.id===c.route().tab)||cards[0];
 const imageURL=card=>S.mediaURL(card.image);
 function select(id){
  const card=cards.find(x=>x.id===id);if(!card)return;
  pendingFocus=document.activeElement?.dataset.ig||'';
  direction=cards.indexOf(card)>=cards.indexOf(current())?1:-1;
  c.navigate('infographics/'+card.id,{focus:false,scroll:false});
 }
 function move(amount){const list=filtered(),i=list.findIndex(x=>x.id===current().id);if(list[i+amount])select(list[i+amount].id);}
 function sourceHTML(card){
  const external=/^https:\/\//.test(card.source.url);
  return Serein.t("copy_0712")+esc(card.source.url)+'"'+(external?Serein.t("copy_0935"):'')+'>'+esc(card.source.title)+(external?' ↗':' →')+'</a><p class="small-note">'+esc(card.source.date)+' · Checked '+esc(card.checked)+'</p>';
 }
 function render(){
  const card=current();if(category!=='All'&&card.category!==category)category='All';
  const list=filtered(),i=list.findIndex(x=>x.id===card.id);
  return Serein.t("copy_0936")+
   Serein.t("copy_0937")+categories.map(name=>Serein.t("copy_0938")+name+'" aria-pressed="'+(category===name)+'">'+name+'</button>').join('')+'</div>'+
   Serein.t("copy_0939")+
    Serein.t("copy_0940")+esc(card.category)+Serein.t("copy_0941")+(i+1)+' of '+list.length+' · '+esc(card.title)+Serein.t("copy_0942")+(i===0?' disabled':'')+'>'+icon('arrow')+Serein.t("copy_0943")+(i===list.length-1?' disabled':'')+'>'+icon('arrow')+'</button></div></div>'+
     Serein.t("copy_0944")+esc(card.title)+Serein.t("copy_0945")+esc(card.title)+Serein.t("copy_0946")+esc(imageURL(card))+'" width="'+card.width+'" height="'+card.height+'" alt="'+esc(card.title+'. '+card.metric+': '+card.metricLabel+'. Full text follows this image.')+Serein.t("copy_0947")+
     Serein.t("copy_0948")+icon('expand')+Serein.t("copy_0949")+esc(imageURL(card))+'" download="Serein-'+esc(card.id)+'.webp">'+icon('download')+Serein.t("copy_0950")+
    Serein.t("copy_0951")+esc(card.kind)+'</p><h2 id="ig-reading-title">'+esc(card.title)+Serein.t("copy_0952")+esc(card.metric)+'</strong><span>'+esc(card.metricLabel)+'</span><p>'+esc(card.metricNote)+'</p></div><p>'+esc(card.summary)+Serein.t("copy_0953")+esc(card.who)+Serein.t("copy_0954")+esc(card.when)+Serein.t("copy_0955")+esc(card.why)+Serein.t("copy_0956")+card.steps.map(([title,body])=>'<li><strong>'+esc(title)+'</strong><p>'+esc(body)+'</p></li>').join('')+Serein.t("copy_0957")+esc(card.action.route)+'">'+esc(card.action.label)+' '+icon('arrow')+Serein.t("copy_0958")+esc(card.limit)+'</p>'+sourceHTML(card)+'</details></div></section>'+
   Serein.t("copy_0959")+list.length+' '+(category==='All'?Serein.t("copy_0960"):category.toLowerCase()+' guides')+Serein.t("copy_0961")+list.map((x,n)=>Serein.t("copy_0962")+x.id+'" aria-pressed="'+(x.id===card.id)+Serein.t("copy_0963")+esc(S.mediaURL(x.thumbnail))+Serein.t("copy_0964")+String(n+1).padStart(2,'0')+' / '+esc(x.category)+'</small><strong>'+esc(x.title)+'</strong></span></button>').join('')+'</div></section>';
 }
 function zoom(){
  const card=current();
  c.openModal(card.title,Serein.t("copy_0965")+esc(imageURL(card))+'" width="'+card.width+'" height="'+card.height+'" alt="'+esc(card.title+'. '+card.metric+': '+card.metricLabel)+Serein.t("copy_0966")+esc(imageURL(card))+'" download="Serein-'+esc(card.id)+'.webp">'+icon('download')+Serein.t("copy_0967"));
  document.querySelector('#modal').classList.add('ig-zoom-dialog');
 }
 function handle(button,event){
  const action=button.dataset.ig;
  if(action==='filter'){
   if(!categories.includes(button.dataset.value))return;
   category=button.dataset.value;const list=filtered();select(list.some(x=>x.id===current().id)?current().id:list[0].id);
  }else if(action==='next')move(1);
  else if(action==='previous')move(-1);
  else if(action==='select')select(button.dataset.id);
  else if(action==='zoom'){if(suppressClick&&event?.detail!==0){suppressClick=false;return;}suppressClick=false;zoom();}
 }
 function keyboard(event){
  if(c.route().view!=='infographics'||document.querySelector('dialog[open]')||!event.target.closest('.ig-viewer')||event.target.closest('input,select,textarea,a,summary,[contenteditable="true"]')||event.ctrlKey||event.altKey||event.metaKey)return false;
  const key=event.key.toLowerCase();if(!['arrowleft','arrowright','home','end'].includes(key))return false;
  event.preventDefault();event.stopImmediatePropagation();
  if(key==='arrowleft'||key==='arrowright')move(key==='arrowleft'?-1:1);else{const list=filtered();select(key==='home'?list[0].id:list[list.length-1].id);}return true;
 }
 function pointerDown(event){
  suppressClick=false;start=null;
  if(c.route().view==='infographics'&&event.isPrimary!==false&&event.pointerType!=='mouse'&&event.target.closest('.ig-artwork'))start={x:event.clientX,y:event.clientY,id:event.pointerId};
 }
 function pointerUp(event){
  if(!start||start.id!==event.pointerId)return;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;
  if(c.route().view==='infographics'&&Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5){suppressClick=true;move(dx<0?1:-1);}
 }
 function mounted(){
  if(c.route().view!=='infographics'){lastImage='';return;}
  const card=current(),img=document.querySelector('#ig-image');
  if(pendingFocus==='next'||pendingFocus==='previous'){
   const control=document.querySelector('[data-ig="'+pendingFocus+'"]');
   if(control?.disabled)document.querySelector('[data-ig="'+(pendingFocus==='next'?'previous':'next')+'"]:not(:disabled)')?.focus({preventScroll:true});
  }
  pendingFocus='';
  if(img&&lastImage!==card.id&&!c.reduced()&&typeof img.animate==='function')img.animate([{opacity:.5,transform:Serein.t("copy_0968")+direction*6+Serein.t("copy_0969")+direction*10+'px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'});
  lastImage=card.id;
 }
 function initialise(){
  document.addEventListener('pointerdown',pointerDown,{passive:true});document.addEventListener('pointerup',pointerUp,{passive:true});document.addEventListener('pointercancel',()=>{start=null;suppressClick=false;},{passive:true});
  document.querySelector('#modal').addEventListener('close',()=>document.querySelector('#modal').classList.remove('ig-zoom-dialog'));
 }
 return {render,handle,keyboard,mounted,initialise};
};
})(globalThis.Serein=globalThis.Serein||{});


;

/* Serein.views / router / ui: calm task-first navigation and local-only workflows. */
(function(S){
'use strict';
S.createModern=function(c){
 const {$,$$,esc,icon,state}=c,A=c.A,D=c.D;
 let route={view:'today',tab:'',params:new URLSearchParams()},lastHash='',onboardStep=0,searchTimer=0,journalTimer=0,activityTimer=0,lockRequest=0,pendingImport=null,importPass='',lastDeep='',lastPlay='',completionShown=false;
 const store=()=>c.store;
 const titles={today:'My Day',library:Serein.t("copy_0570"),toolkit:Serein.t("copy_0571"),infographics:'Visual Atlas',me:'Me',support:Serein.t("copy_0004")};
 const studioNames={boundary:Serein.t("copy_0572"),support:Serein.t("copy_0573"),transition:Serein.t("copy_0574"),difficult:Serein.t("copy_0575"),team:Serein.t("copy_0576"),conditions:Serein.t("copy_0577")};
 const nav=[['today','My Day','today'],['library/practices',Serein.t("copy_0570"),'book'],['toolkit',Serein.t("copy_0571"),'studios'],['infographics','Visual Atlas','infographics'],['me/saved','Me','space'],['support',Serein.t("copy_0004"),'support']];
 const roles=[Serein.t("copy_0005"),'Nurse','Doctor','Physician',Serein.t("copy_0150"),'Pharmacist',Serein.t("copy_0151"),'Student',Serein.t("copy_0152")];
 const field=(name,label,value,options)=>Serein.t("copy_0578")+name+'">'+label+Serein.t("copy_0579")+name+'" name="'+name+'">'+options.map(x=>{const v=Array.isArray(x)?x[0]:x,l=Array.isArray(x)?x[1]:x;return Serein.t("copy_0580")+esc(v)+'" '+(String(value)===String(v)?'selected':'')+'>'+esc(l)+'</option>';}).join('')+'</select>';
 const check=(name,label,value,note='')=>Serein.t("copy_0581")+label+(note?'<small>'+note+'</small>':'')+Serein.t("copy_0582")+name+'" name="'+name+'" '+(value?'checked':'')+'></label>';
 const head=(eye,title,desc='')=>Serein.t("copy_0583")+eye+'</p><h1>'+title+'</h1>'+(desc?'<p class="page-sub">'+desc+'</p>':'')+'</header>';
 const empty=(title,text,action)=>Serein.t("copy_0584")+title+'</h2><p>'+text+'</p>'+action+'</section>';
 function templ(html){html=S.mediaHTML?S.mediaHTML(html):html;const t=document.createElement('template');t.innerHTML=html;return t.content;}
 function bodyOf(html,remove){const t=templ(html);for(const s of remove)t.querySelector(s)?.remove();return [...t.childNodes].map(n=>n.outerHTML||n.textContent).join('');}
 function sensitive(){return !vault.locked;}
 function privateClear(){pendingImport=null;importPass='';state.journalQuery='';state.draft='';const draft=$('#journal-draft');if(draft)draft.value='';c.closeModal();c.closeSearch();$('#modal-content').replaceChildren();c.clearUndo();document.body.classList.remove('privacy-shield');}
 const vault=S.createVault({get:store,getDraft:()=>state.draft,setDraft:text=>{state.draft=text;const e=$('#journal-draft');if(e)e.value=text;},normalise:c.normalise,notice:c.toast,storageBlocked:()=>!!c.recovery(),changed:()=>{document.body.classList.remove('privacy-shield');if(!vault.locked)c.draftStorageStatus(true);render();resetActivity();if(document.visibilityState==='hidden'&&vault.enabled&&!vault.locked&&store().vault.lockOnHide!==false)requestLock();},clearPrivateUI:privateClear});
 if(vault.enabled){for(const name of ['journals','checkins','contacts'])store()[name]=[];state.draft='';try{sessionStorage.removeItem('serein-journal-draft');}catch{}}
 const player=S.createPlayerTools({$,state,esc,get store(){return store()},refreshVoices:()=>{if($('#player-extra-options'))$('#player-extra-options').innerHTML=player.extras();},persist:()=>vault.persist(),toast:c.toast,recommend:c.recommend,chooseDuration:c.chooseDuration,reduced:c.reduced,openPractice:c.openPractice,playPause:c.playPause,pausePlayer:c.pausePlayer,exitPlayer:c.exitPlayer,finder:()=>c.advance.finderOpen()});
 const gallery=S.createInfographics({esc,icon,route:()=>route,navigate:go,openModal:c.openModal,reduced:c.reduced});
 /** Parse canonical routes and legacy aliases without losing browser history. */
 function parse(hash){
  const raw=String(hash||'today').replace(/^#\/?/,'').split('?'),parts=raw[0].split('/').filter(Boolean),params=new URLSearchParams(raw.slice(1).join('?'));
  const aliases={practices:'library/practices',journeys:'library/journeys',studios:'toolkit',reflect:'me/journal',space:'me/saved',settings:'me/settings','quick-start':'today'};
  const path=aliases[parts[0]]||parts.join('/')||'today',p=path.split('/');
  const view=titles[p[0]]?p[0]:'today';
  let tab=p[1]||(view==='library'?'practices':view==='me'?'saved':'');
  if(view==='library'&&!['practices','guides','journeys'].includes(tab))tab='practices';
  if(view==='me'){if(tab==='checkins'||tab==='patterns')tab='insights';if(tab==='reflections')tab='journal';if(!['journal','saved','routine','insights','settings','data'].includes(tab))tab='saved';}
  if(view==='toolkit'&&tab&&!A.studios.some(s=>s.id===tab)&&!(globalThis.SereinToolkit&&SereinToolkit.has(tab)))tab='';
  if(view==='infographics'&&tab&&!S.infographicCards.some(x=>x.id===tab))tab='';
  if(!['library','toolkit','infographics','me'].includes(view))tab='';
  const canonical=view+(tab?'/'+tab:'')+(params.size?'?'+params.toString():'');
  return {view,tab,params,canonical,quick:parts[0]==='quick-start'};
 }
 function legacyPath(path){
  if(path==='space')return 'me/'+({patterns:'insights',reflections:'journal'}[state.spaceTab]||state.spaceTab||'saved');
  if(path==='practices')return 'library/'+(state.tab==='guides'?'guides':'practices');
  return ({studios:'toolkit',journeys:'library/journeys',reflect:'me/journal',settings:'me/settings'})[path]||path;
 }
 function setRoute(next){
  route=next;state.view=route.view;state.tab=route.view==='library'?route.tab:state.tab;
  state.spaceTab=route.view==='me'?({journal:'reflections',insights:'patterns'}[route.tab]||route.tab):state.spaceTab;
  if(route.view==='library'&&route.tab==='practices'){
   const p=route.params;if(p.has('time'))state.budget=p.get('time')==='self'?'self':[0,60,120,300].includes(+p.get('time'))?+p.get('time'):120;
   if(p.has('style')&&['any','breath','nonbreath','ground'].includes(p.get('style')))state.style=p.get('style');
   if(p.has('setting')&&['any','seated','still'].includes(p.get('setting')))state.position=p.get('setting');
   if(p.has('q'))state.query=p.get('q').slice(0,120);
  }
 }
 function setHistory(hash,replace){try{history[replace?'replaceState':'pushState'](null,'',hash);}catch{if(location.hash!==hash)location.hash=hash;}}
 function cancelSearch(){clearTimeout(searchTimer);clearTimeout(journalTimer);searchTimer=journalTimer=0;}
 function go(path,{replace=false,focus=true,scroll=true}={}){
  c.captureDraft();cancelSearch();const next=parse(legacyPath(path));lastDeep='';
  c.closeModal();c.closeSearch();setRoute(next);lastHash='#'+next.canonical;
  if(location.hash!==lastHash)setHistory(lastHash,replace);if(document.startViewTransition&&!c.reduced())document.startViewTransition(()=>render({focus}));else{render({focus});$('#main').classList.remove('page-enter');void $('#main').offsetWidth;$('#main').classList.add('page-enter');}
  if(scroll)window.scrollTo({top:0,behavior:'instant'});openDeep(next);
 }
 function readRoute(){
  if(location.hash===lastHash)return;
  c.captureDraft();cancelSearch();c.closeModal();setRoute(parse(location.hash));lastHash='#'+route.canonical;
  if(location.hash!==lastHash)setHistory(lastHash,true);render({focus:true});openDeep(route);
 }
 function openDeep(r){
  const key=r.canonical;if(key===lastDeep)return;lastDeep=key;
  if(r.view==='toolkit'&&r.tab){
   const p=r.params.get('practice');
   if(r.tab==='team'&&D.practices.some(x=>x.id===p)){
    c.openPractice(p,c.chooseDuration(D.practices.find(x=>x.id===p),Number(r.params.get('duration'))||120));
    state.session.noHolds=true;state.session.external=r.params.get('external')==='1';state.visual='text';state.present=true;
    $('#session-external').checked=state.session.external;if($('#session-noholds'))$('#session-noholds').checked=true;
    $('#session-motion').checked=true;$('#session-voice').checked=false;$('#session-chime').checked=false;$('#session-visual').value='text';$('#player').classList.add('present');$('#present-button').setAttribute('aria-pressed','true');c.updatePlayer(true);c.syncPlayerMotion();
   }else if(globalThis.SereinToolkit&&SereinToolkit.has(r.tab))SereinToolkit.open(r.tab,{fromRoute:true});else c.advance.openStudio(r.tab);
  }
  if(r.view==='library'&&r.tab==='journeys'&&A.journeys.some(x=>x.id===r.params.get('journey')))c.advance.openJourney(r.params.get('journey'));
  if(r.quick)player.quick();
 }
 function rememberMoment(value){state.moment=value;try{sessionStorage.setItem('serein-moment-override',String(value));}catch{}}
 function autoMoment(){
  try{const saved=sessionStorage.getItem('serein-moment-override');if(saved!==null&&[0,1,2,3].includes(+saved)){state.moment=+saved;return;}}catch{}
  let pattern=store().preferences.shift||'prefer';if(pattern==='rotating')try{pattern=sessionStorage.getItem('serein-rotation')||'days';}catch{pattern='days';}
  if(pattern==='prefer'){state.moment=1;return;}
  const h=(new Date().getHours()+(pattern==='nights'?12:0))%24;state.moment=h>=6&&h<9?0:h>=9&&h<17?1:3;
 }
 function navHTML(mobile=false){
  const items=mobile?[nav[0],nav[1],['quick',Serein.t("copy_0585"),'play'],nav[4],nav[5]]:nav;
  return items.map(([path,label,img])=>'<button '+(path==='quick'?Serein.t("copy_0586"):'data-nav="'+path+'" class="'+(route.view===path.split('/')[0]?'active':'')+'" '+(route.view===path.split('/')[0]?'aria-current="page"':''))+'>'+icon(img)+'<span>'+label+'</span></button>').join('');
 }
 function applyTheme(){
  const p=store().preferences,dark=p.theme==='night'||p.theme==='dark'||p.theme==='auto'&&window.matchMedia?.(Serein.t("copy_0587")).matches;
  document.body.dataset.theme=p.theme==='contrast'?'contrast':dark?'night':'light';document.body.dataset.reading=p.readingSize||'standard';
  document.body.classList.toggle('comfortable-reading',!!p.readingWidth);document.body.classList.toggle('focus-mode',!!p.focus);document.body.classList.toggle('reduce-motion',c.reduced());
  $('meta[name="theme-color"]')?.setAttribute('content',dark?'#10253A':'#F8F5EF');
 }
 function recommendedHTML(){
  const p=c.recommend();if(!p)return empty(Serein.t("copy_0588"),Serein.t("copy_0589"),Serein.t("copy_0590"));
  const n=c.chooseDuration(p,typeof state.homeTime==='number'?state.homeTime:store().preferences.time);
  return Serein.t("copy_0591")+p.photo+'" alt="'+esc(p.cardAlt||Serein.t("copy_0029")+p.title)+Serein.t("copy_0592")+esc(p.title)+'</h2><p>'+esc(c.advance.reason(p,state.homeTime||store().preferences.time,state.moment))+Serein.t("copy_0593")+c.durationLabel(n)+' · '+esc(p.position)+' · '+(p.breathFocus?Serein.t("copy_0034"):Serein.t("copy_0058"))+Serein.t("copy_0594")+p.id+'" data-duration="'+(n||'')+Serein.t("copy_0595")+icon('play')+Serein.t("copy_0596")+[[60,'1 min'],[120,'2 min'],[300,'5 min'],['self',Serein.t("copy_0597")]].map(([v,l])=>Serein.t("copy_0598")+v+'" aria-pressed="'+(String(v)===String(state.homeTime||store().preferences.time))+'">'+l+'</button>').join('')+'</div></details></div></section>';
 }
 function today(){if(globalThis.SereinDay&&globalThis.HCAShell)return SereinDay.render({c,state,D,A,store});
  const hour=new Date().getHours(),g=hour<12?Serein.t("copy_0040"):hour<18?Serein.t("copy_0041"):Serein.t("copy_0042");
  const j=A.journeys.find(j=>{const n=(store().journeyProgress[j.id]||[]).length;return n>0&&n<j.steps.length});
  const continuation=j?Serein.t("copy_0599")+j.id+Serein.t("copy_0600")+esc(j.title)+'</strong></span>'+icon('arrow')+'</button>':store().routine.length?Serein.t("copy_0601")+icon('arrow')+'</button>':store().savedPlans.length?Serein.t("copy_0602")+icon('arrow')+'</button>':'';
  return Serein.t("copy_0603")+g+'. <strong>Make room for you.</strong></h1><time>'+new Date().toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})+Serein.t("copy_0604")+recommendedHTML()+Serein.t("copy_0605")+[Serein.t("copy_0606"),Serein.t("copy_0607"),Serein.t("copy_0608"),Serein.t("copy_0609")].map((l,i)=>Serein.t("copy_0610")+i+'" aria-pressed="'+(state.moment===i)+'">'+l+'</button>').join('')+'</div>'+(store().preferences.shift==='rotating'?Serein.t("copy_0611"):'')+Serein.t("copy_0612")+c.moodButtons()+Serein.t("copy_0613")+continuation+Serein.t("copy_0614")+c.quote()+Serein.t("copy_0615");
 }
 function filterCount(){return Number(state.budget!==0)+Number(state.style!=='any')+Number(state.position!=='any')+Number(state.category!=='All');}
 function filtersHTML(){return Serein.t("copy_0616")+c.filterOptions()+'</div>';}
 function activeFilters(){
  const out=[];if(state.budget!==0)out.push(['time',state.budget==='self'?'Self-paced':c.durationLabel(Number(state.budget))]);if(state.style!=='any')out.push(['style',({nonbreath:Serein.t("copy_0058"),breath:'Breathing',ground:'Grounding'})[state.style]]);if(state.position!=='any')out.push(['setting',state.position==='still'?Serein.t("copy_0617"):'Seated']);if(state.category!=='All')out.push(['category',state.category]);
  return Serein.t("copy_0618")+out.map(([k,l])=>Serein.t("copy_0619")+k+'" aria-label="Remove '+esc(l)+' filter">'+esc(l)+' ×</button>').join('')+(out.length?Serein.t("copy_0620"):'')+'</div>';
 }
 function library(){
  const tabs=Serein.t("copy_0621")+head(Serein.t("copy_0622"),Serein.t("copy_0623"),Serein.t("copy_0624"))+Serein.t("copy_0625")+icon('studios')+Serein.t("copy_0626")+['practices','guides','journeys'].map(t=>Serein.t("copy_0627")+t+'" aria-pressed="'+(route.tab===t)+'">'+({practices:'Practices',guides:'Guides',journeys:'Journeys'})[t]+'</button>').join('')+'</div>';
  if(route.tab==='journeys')return tabs+bodyOf(c.advance.journeysView(),['.page-header']);
  if(route.tab==='guides')return tabs+Serein.t("copy_0628")+icon('search')+Serein.t("copy_0629")+esc(state.guideQuery)+Serein.t("copy_0630")+['All',Serein.t("copy_0078"),'Mindfulness',Serein.t("copy_0079"),Serein.t("copy_0080"),Serein.t("copy_0067")].map(t=>Serein.t("copy_0631")+t+'" aria-pressed="'+(state.guideCategory===t)+'">'+t+'</button>').join('')+Serein.t("copy_0632")+c.guidesResults()+'</div>';
  return tabs+Serein.t("copy_0633")+icon('sliders')+' Filters · '+filterCount()+Serein.t("copy_0634")+filtersHTML()+'</div>'+activeFilters()+Serein.t("copy_0635")+['All','Breathing','Grounding','Movement','Awareness','Visualization',Serein.t("copy_0067")].map(t=>Serein.t("copy_0636")+t+'" aria-pressed="'+(state.category===t)+'">'+(t==='Visualization'?'Visualisation':t)+'</button>').join('')+Serein.t("copy_0637")+c.practiceResults()+Serein.t("copy_0638");
 }
 function legacySpace(tab){state.spaceTab=tab;return bodyOf(c.spaceView(),['.page-header','.segmented']);}
 function lockedBox(){return Serein.t("copy_0639")+icon('shield')+Serein.t("copy_0640");}
 function journal(){
  if(vault.locked)return lockedBox();
  const t=templ(c.reflectView()),form=t.querySelector('#journal-form');form.querySelectorAll('.ico-inline').forEach(x=>x.remove());savingLabels(form);
  return form.outerHTML+Serein.t("copy_0641")+icon('search')+Serein.t("copy_0642")+esc(state.journalQuery||'')+Serein.t("copy_0643")+journalHistory()+'</div></section>';
 }
 function journalHistory(){const list=store().journals.filter(x=>x.text.toLowerCase().includes((state.journalQuery||'').toLowerCase()));return c.entriesHTML(list,'journal');}
 function privacyControls(){return Serein.t("copy_0644")+(!vault.available?Serein.t("copy_0645"):vault.enabled?'<p>'+icon('shield')+Serein.t("copy_0646")+(vault.locked?'locked':'unlocked')+Serein.t("copy_0647")+(vault.locked?'unlock':'lock')+'">'+(vault.locked?'Unlock':Serein.t("copy_0648"))+Serein.t("copy_0649")+field('lock-after',Serein.t("copy_0650"),store().vault.lockAfter||5,[[1,'1 minute'],[5,'5 minutes'],[15,'15 minutes'],[30,'30 minutes']])+check('lock-on-hide',Serein.t("copy_0651"),store().vault.lockOnHide!==false):Serein.t("copy_0652"))+Serein.t("copy_0653");}
 function settingsHTML(){
  const p=store().preferences,roleOptions=roles.includes(p.role)?roles:[p.role,...roles];
  return Serein.t("copy_0654")+field('pref-reading',Serein.t("copy_0655"),p.readingSize,[['standard','Standard'],['large','Large'],['extra',Serein.t("copy_0293")]])+field('pref-theme','Appearance',p.theme,[['auto',Serein.t("copy_0656")],['light',Serein.t("copy_0657")],['night',Serein.t("copy_0658")],['contrast',Serein.t("copy_0659")]])+check('pref-width',Serein.t("copy_0660"),p.readingWidth)+check('pref-focus',Serein.t("copy_0661"),p.focus)+check('pref-motion',Serein.t("copy_0662"),p.motion,Serein.t("copy_0663"))+check('pref-3d',Serein.t("copy_0664"),p.visual3d,Serein.t("copy_0665"))+check('pref-quotes',Serein.t("copy_0666"),!p.hideQuotes,Serein.t("copy_0667"))+Serein.t("copy_0668")+field('pref-role',Serein.t("copy_0669"),p.role,roleOptions)+field('pref-time',Serein.t("copy_0670"),p.time,[[60,'1 minute'],[120,'2 minutes'],[300,'5 minutes']])+field('pref-style',Serein.t("copy_0671"),p.style,[['any',Serein.t("copy_0157")],['nonbreath',Serein.t("copy_0058")],['ground',Serein.t("copy_0059")]])+field('pref-shift',Serein.t("copy_0672"),p.shift,[['days','Days'],['nights','Nights'],['rotating','Rotating'],['prefer',Serein.t("copy_0673")]])+Serein.t("copy_0674")+privacyControls()+Serein.t("copy_0675")+c.advance.appHTML()+Serein.t("copy_0676")+c.advance.preferencesHTML();
 }
 function me(){
  const tabs=[['journal',Serein.t("copy_0677")],['saved',Serein.t("copy_0067")],['routine',Serein.t("copy_0678")],['insights',Serein.t("copy_0679")],['settings',Serein.t("copy_0680")],['data',Serein.t("copy_0681")]];
  let body=route.tab==='journal'?journal():route.tab==='settings'?settingsHTML():route.tab==='insights'?(vault.locked?lockedBox():field('date-filter',Serein.t("copy_0682"),state.dateFilter,[['7',Serein.t("copy_0110")],['30',Serein.t("copy_0111")],['90',Serein.t("copy_0683")],['all',Serein.t("copy_0109")]])+S.insights.render({store:store(),state,esc,entriesHTML:c.entriesHTML})):route.tab==='data'?(c.recovery()?Serein.t("copy_0684"):'')+c.dataHTML()+privacyControls():legacySpace(route.tab==='routine'?'routine':'saved');
  return head(Serein.t("copy_0685"),Serein.t("copy_0686"),Serein.t("copy_0687"))+Serein.t("copy_0688")+tabs.map(([key,label])=>Serein.t("copy_0689")+key+'" aria-pressed="'+(route.tab===key)+'">'+label+'</button>').join('')+'</div>'+body;
 }
 function helpHTML(){
  return Serein.t("copy_0690");
 }
 function contactsHTML(){if(vault.locked)return Serein.t("copy_0691")+lockedBox()+'</section>';return Serein.t("copy_0692")+store().contacts.map(x=>Serein.t("copy_0693")+esc(x.name)+'</h3><p>'+esc(x.role)+'</p><small>'+(x.persistent?Serein.t("copy_0067"):Serein.t("copy_0366"))+Serein.t("copy_0694")+esc(x.phone.replace(/[^\d+*#]/g,''))+'">Call '+esc(x.phone)+Serein.t("copy_0695")+esc(x.id)+'">Remove</button></article>').join('')+Serein.t("copy_0696")+(vault.enabled?Serein.t("copy_0697"):Serein.t("copy_0698"))+Serein.t("copy_0699");}
 function support(){return head(Serein.t("copy_0130"),Serein.t("copy_0131"))+helpHTML()+contactsHTML()+bodyOf(c.supportView(),['.page-header']);}
 function toolkit(){
  const html=templ(c.advance.studiosView());html.querySelector('.page-header')?.remove();html.querySelector('.studio-hero')?.remove();
  html.querySelectorAll('.studio-card').forEach(el=>{const id=el.querySelector('[data-adv="studio"]').dataset.id;const h=el.querySelector('h3');const sub=document.createElement('p');sub.className='studio-original';sub.textContent=h.textContent;h.textContent=studioNames[id];h.after(sub);});
  return head(Serein.t("copy_0700"),Serein.t("copy_0701"),Serein.t("copy_0702"))+Serein.t("copy_0703")+icon('infographics')+Serein.t("copy_0704")+icon('arrow')+'</a>'+[...html.childNodes].map(n=>n.outerHTML||n.textContent).join('')+Serein.t("copy_0705");
 }
 function scope(){
  const facts=D.practices.map(p=>'<details><summary>'+esc(p.title)+Serein.t("copy_0706")+esc(p.safety)+'</p><p>'+esc(A.evidence[p.id].how)+'</p></details>').join('');
  const archive=(S.scopeArchive||[]).map(x=>'<p>'+esc(x)+'</p>').join('');
  return head(Serein.t("copy_0707"),Serein.t("copy_0708"),Serein.t("copy_0709"))+Serein.t("copy_0710")+facts+Serein.t("copy_0711")+archive+'</details><h2>Sources</h2>'+Object.values(A.references).map(s=>Serein.t("copy_0712")+esc(s.url)+Serein.t("copy_0713")+esc(s.title)+' ↗<small>'+esc(s.scope)+'</small></a>').join('')+'</section>';
 }
 function keyOf(n){return n.nodeType===1?(n.id||n.getAttribute('data-key')||''):'';}
 function morph(old,n){
  if(old.nodeType!==n.nodeType||old.nodeName!==n.nodeName){old.replaceWith(n.cloneNode(true));return;}
  if(n.nodeType===3){if(old.nodeValue!==n.nodeValue)old.nodeValue=n.nodeValue;return;}if(n.nodeType!==1)return;
  for(const a of [...old.attributes])if(!n.hasAttribute(a.name))old.removeAttribute(a.name);
  for(const a of [...n.attributes])if(old.getAttribute(a.name)!==a.value)old.setAttribute(a.name,a.value);
  if(old instanceof HTMLInputElement||old instanceof HTMLSelectElement||old instanceof HTMLTextAreaElement){if(document.activeElement!==old&&old.value!==n.value)old.value=n.value;if(old.type==='checkbox')old.checked=n.checked;}
  const children=[...n.childNodes];
  children.forEach((next,i)=>{let current=old.childNodes[i],key=keyOf(next);if(key&&keyOf(current||{})!==key){const found=[...old.childNodes].find(x=>keyOf(x)===key);if(found){old.insertBefore(found,current||null);current=found;}}
   if(!current)old.appendChild(next.cloneNode(true));else morph(current,next);
  });
  while(old.childNodes.length>children.length)old.lastChild.remove();
 }
 let imageObserver=null;const observedImages=new Set();
 function lazyImages(root=document){
  if(imageObserver)for(const im of observedImages)if(!im.isConnected){imageObserver.unobserve(im);observedImages.delete(im);}
  const images=[...root.querySelectorAll('img[data-src]')];if(!images.length)return;
  if(!('IntersectionObserver'in globalThis)){images.forEach(im=>{im.src=im.dataset.src;delete im.dataset.src});return;}
  if(!imageObserver)imageObserver=new IntersectionObserver(rows=>rows.forEach(row=>{if(row.isIntersecting){const im=row.target;if(im.dataset.src){im.src=im.dataset.src;delete im.dataset.src;}imageObserver.unobserve(im);observedImages.delete(im);}}),{rootMargin:'250px'});
  images.forEach(im=>{if(!observedImages.has(im)){observedImages.add(im);imageObserver.observe(im);}});
 }
 /** Patch the active view while retaining stable controls and in-progress input. */
 function render({focus=false}={}){
  c.captureDraft();const html=route.view==='today'?today():route.view==='library'?library():route.view==='toolkit'?(globalThis.SereinToolkit?SereinToolkit.hub({c,state,D,A,store,route}):toolkit()):route.view==='infographics'?gallery.render():route.view==='me'?me():support();
  const shell=document.createElement('main');shell.id='main';shell.tabIndex=-1;shell.innerHTML=S.mediaHTML?S.mediaHTML(html):html;morph($('#main'),shell);
  for(const [id,mobile] of [['#desktop-nav',false],['#mobile-nav',true]]){const host=$(id),next=document.createElement('nav');next.innerHTML=navHTML(mobile);if(host.innerHTML!==next.innerHTML)host.innerHTML=next.innerHTML;}
  $('#breadcrumb').textContent=titles[route.view]+(route.tab&&!['toolkit','infographics'].includes(route.view)?' / '+route.tab.charAt(0).toUpperCase()+route.tab.slice(1):'');document.title=titles[route.view]+Serein.t("copy_0714");
  applyTheme();c.icons();c.contexts?.decorate();lazyImages();gallery.mounted();if(route.view==='today')quickActions();if(focus)$('#main').focus({preventScroll:true});
 }
 function detail(id){
  const p=D.practices.find(x=>x.id===id);if(!p)return;
  c.openModal(p.title,Serein.t("copy_0715")+p.photo+'" alt="'+esc(p.cardAlt||Serein.t("copy_0029")+p.title)+Serein.t("copy_0716")+c.advance.aboutHTML(id)+'<p class="notice">'+esc(p.safety)+'</p>'+field('detail-duration',Serein.t("copy_0717"),c.chooseDuration(p,store().preferences.time),p.selfPaced?[['','Self-paced']]:p.durations.map(n=>[n,c.durationLabel(n)]))+Serein.t("copy_0718")+id+Serein.t("copy_0719")+id+Serein.t("copy_0720")+id+'" aria-pressed="'+store().savedPractices.includes(id)+'">'+(store().savedPractices.includes(id)?Serein.t("copy_0146"):Serein.t("copy_0215"))+'</button></div>');
 }
 function settingsChanged(e){
  const p=store().preferences,before={...p},map={'pref-reading':'readingSize','pref-theme':'theme','pref-width':'readingWidth','pref-focus':'focus','pref-motion':'motion','pref-3d':'visual3d','pref-quotes':'hideQuotes','pref-role':'role','pref-time':'time','pref-style':'style','pref-shift':'shift'};
  if(map[e.id]){p[map[e.id]]=e.id==='pref-quotes'?!e.checked:e.type==='checkbox'?e.checked:e.id==='pref-time'?+e.value:e.value;state.budget=p.time;state.style=p.style;if(e.id==='pref-shift'){try{sessionStorage.removeItem('serein-moment-override')}catch{}autoMoment();}vault.persist();applyTheme();c.syncPlayerMotion();c.toast(Serein.t("copy_0721"),()=>{store().preferences=before;state.budget=before.time;state.style=before.style;vault.persist();applyTheme();render();});return;}
  if(e.id==='lock-after'&&store().vault){store().vault.lockAfter=+e.value;vault.persist();resetActivity();}
  if(e.id==='lock-on-hide'&&store().vault){store().vault.lockOnHide=e.checked;vault.persist();}
 }
 function requestLock(){if(vault.busy){clearTimeout(lockRequest);lockRequest=setTimeout(requestLock,100);return;}vault.lock().catch(error=>{document.body.classList.remove('privacy-shield');c.toast(error.message||Serein.t("copy_0722"));}).finally(()=>{if(!vault.enabled||vault.locked)document.body.classList.remove('privacy-shield');});}
 function resetActivity(){clearTimeout(activityTimer);if(vault.enabled&&!vault.locked)activityTimer=setTimeout(requestLock,(store().vault.lockAfter||5)*60000);}
 function lockDialog(mode){
  if(!vault.available){c.toast(Serein.t("copy_0723"));return;}
  if(mode==='lock'){requestLock();return;}
  const title=mode==='setup'?Serein.t("copy_0724"):mode==='remove'?Serein.t("copy_0725"):Serein.t("copy_0726");
  const warning=mode==='setup'?Serein.t("copy_0727"):mode==='remove'?Serein.t("copy_0728"):Serein.t("copy_0729");
  c.openModal(title,'<p>'+warning+Serein.t("copy_0730")+mode+Serein.t("copy_0731")+(mode==='setup'?'new-password':'current-password')+'" '+(mode==='setup'?'minlength="6"':'')+' required>'+(mode==='setup'?Serein.t("copy_0732"):'')+(mode==='remove'?Serein.t("copy_0733"):'')+Serein.t("copy_0734")+(mode==='setup'?Serein.t("copy_0735"):mode==='remove'?Serein.t("copy_0736"):'Unlock')+'</button></form>');
 }
 function exportDialog(){
  c.openModal(Serein.t("copy_0737"),Serein.t("copy_0738")+(vault.enabled?Serein.t("copy_0739"):'')+Serein.t("copy_0740"));
 }
 function confirmPlain(){
  if(vault.locked){lockDialog('unlock');return;}
  c.openModal(Serein.t("copy_0741"),Serein.t("copy_0742"));
 }
 function help(){player.cancelCountdown();if(state.session?.state==='playing')c.pausePlayer();c.openModal(Serein.t("copy_0743"),helpHTML());}
 function onboarding(step=0){onboardStep=step;const p=store().preferences;
  const content=step===0?Serein.t("copy_0744"):step===1?Serein.t("copy_0745")+field('welcome-role',Serein.t("copy_0669"),p.role,roles)+field('welcome-time',Serein.t("copy_0670"),p.time,[[60,'1 minute'],[120,'2 minutes'],[300,'5 minutes']])+field('welcome-style',Serein.t("copy_0671"),p.style,[['any',Serein.t("copy_0157")],['nonbreath',Serein.t("copy_0058")],['ground',Serein.t("copy_0059")]])+field('welcome-shift',Serein.t("copy_0672"),p.shift,[['days','Days'],['nights','Nights'],['rotating','Rotating'],['prefer',Serein.t("copy_0673")]])+'</form>':Serein.t("copy_0746");
  c.openModal(Serein.t("copy_0747"), Serein.t("copy_0748")+step+'"><p class="small-note">Step '+(step+1)+' of 3</p>'+content+Serein.t("copy_0749")+(step===2?Serein.t("copy_0750"):Serein.t("copy_0230"))+Serein.t("copy_0751")+(step===2&&vault.available&&!vault.enabled?Serein.t("copy_0752"):'')+'</div></div>');
 }
 function finishWelcome(){store().onboarded=true;vault.persist();autoMoment();c.closeModal();render();if(route.quick)player.quick();}
 function search(query){
  const q=query.toLowerCase().trim(),fuzzy=(text)=>{const s=text.toLowerCase();if(!q)return true;if(s.includes(q))return true;let i=0;for(const ch of s)if(ch===q[i])i++;return i===q.length;};
  const actions=[['box',Serein.t("copy_0753")],['journal',Serein.t("copy_0754")],['checkin',Serein.t("copy_0755")],['export',Serein.t("copy_0756")],['dark',Serein.t("copy_0757")],['help',Serein.t("copy_0758")],['quick',Serein.t("copy_0585")],['infographics',Serein.t("copy_0759")]];
  const groups=[['Actions',actions.filter(x=>fuzzy(x[1])).map(([id,label])=>({id,label,kind:'action',sub:Serein.t("copy_0760")}))],['Practices',D.practices.filter(x=>fuzzy(x.title+' '+x.desc)).map(x=>({id:x.id,label:x.title,kind:'practice',sub:x.category}))],['Guides',D.resources.filter(x=>fuzzy(x.title+' '+x.desc)).map(x=>({id:x.id,label:x.title,kind:'guide',sub:x.duration}))],['Studios',A.studios.filter(x=>fuzzy(x.title+' '+studioNames[x.id])).map(x=>({id:x.id,label:studioNames[x.id],kind:'studio',sub:x.title}))],['Journeys',A.journeys.filter(x=>fuzzy(x.title)).map(x=>({id:x.id,label:x.title,kind:'journey',sub:Serein.t("copy_0761")}))]];
  groups.push(['Visual Atlas',S.infographicCards.filter(x=>fuzzy(x.title+' '+x.category+' '+x.metricLabel)).map(x=>({id:x.id,label:x.title,kind:'infographic',sub:x.kind}))]);
  if(globalThis.SereinToolkit)groups.splice(3,0,['Toolkit',SereinToolkit.tools.filter(x=>fuzzy(x.title+' '+x.blurb)).map(x=>({id:x.id,label:x.title,kind:'studio',sub:x.mins+' tool'}))]);const recent=store().preferences.commandRecent||[],all=groups.flatMap(x=>x[1]),recentItems=recent.map(k=>all.find(x=>x.kind+':'+x.id===k)).filter(Boolean);
  if(!q&&recentItems.length)groups.unshift([Serein.t("copy_0762"),recentItems]);
  $('#search-results').innerHTML=groups.map(([label,items])=>items.length?Serein.t("copy_0763")+label+'</h2>'+items.slice(0,q?8:4).map(x=>Serein.t("copy_0764")+x.kind+'" data-id="'+x.id+Serein.t("copy_0765")+icon(x.kind==='practice'?'play':x.kind==='action'?'arrow':'book')+'</span><span><strong>'+esc(x.label)+'</strong><small>'+esc(x.sub)+'</small></span>'+icon('arrow')+'</button>').join('')+'</section>':'').join('')||empty(Serein.t("copy_0766"),Serein.t("copy_0767"),'');
 }
 function command(kind,id){
  const recent=store().preferences.commandRecent||[];store().preferences.commandRecent=[kind+':'+id,...recent.filter(k=>k!==kind+':'+id)].slice(0,6);vault.persist();c.closeSearch();
  if(kind==='practice')detail(id);else if(kind==='guide')c.openResource(id);else if(kind==='studio')go('toolkit/'+id);else if(kind==='journey')go('library/journeys?journey='+id);else if(kind==='infographic')go('infographics/'+id);else if(id==='infographics')go('infographics');
  else if(id==='box')c.openPractice('box',120);else if(id==='journal')go('me/journal');else if(id==='checkin'){if(vault.locked)lockDialog('unlock');else c.openCheckin();}else if(id==='export')exportDialog();else if(id==='dark'){store().preferences.theme='night';vault.persist();applyTheme();c.toast(Serein.t("copy_0768"));}else if(id==='help')help();else if(id==='quick')player.quick();
 }
 function filterURL(){
  if(route.view!=='library'||route.tab!=='practices')return;
  const p=new URLSearchParams();p.set('time',String(state.budget));if(state.style!=='any')p.set('style',state.style);if(state.position!=='any')p.set('setting',state.position);if(state.query)p.set('q',state.query);
  route.params=p;route.canonical='library/practices?'+p;lastHash='#'+route.canonical;setHistory(lastHash,true);
 }
 function refreshFilters(){
  filterURL();render();
  if($('#modal [data-v5="filters-done"]')){
   $$('[data-budget]',$('#modal')).forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.budget)===String(state.budget));b.classList.toggle('active',String(b.dataset.budget)===String(state.budget));});
   for(const [id,value] of [['practice-style-sheet',state.style],['practice-position-sheet',state.position]])if($('#'+id))$('#'+id).value=value;
  }
 }
 function filterSheet(){
  const html=filtersHTML().replace(/id="([^"]+)"/g,(_,id)=>'id="'+id+'-sheet"').replace(/for="([^"]+)"/g,(_,id)=>'for="'+id+'-sheet"');
  c.openModal(Serein.t("copy_0769"),html+Serein.t("copy_0770"));
 }
 function quickCheckin(mood){
  if(vault.locked){lockDialog('unlock');return;}
  state.mood=mood;const entry={id:c.uid(),mood,date:new Date().toISOString(),energy:Serein.t("copy_0009"),note:'',moment:D.moments[state.moment].title,persistent:false};
  store().checkins.push(entry);state.quickCheckinId=entry.id;vault.persist();render();quickActions();c.toast(Serein.t("copy_0771"));
 }
 function quickActions(){
  const entry=store().checkins.find(x=>x.id===state.quickCheckinId),host=$('#quick-checkin-actions');if(!entry||!host)return;
  host.innerHTML='<p class="small-note">'+(entry.persistent?Serein.t("copy_0271"):Serein.t("copy_0772"))+Serein.t("copy_0773")+(entry.persistent?'disabled':'')+Serein.t("copy_0774");
 }
 function noteDialog(){
  const x=store().checkins.find(x=>x.id===state.quickCheckinId);if(!x)return;
  c.openModal(Serein.t("copy_0775"),Serein.t("copy_0776")+esc(x.note)+Serein.t("copy_0777")+(x.persistent?Serein.t("copy_0778"):Serein.t("copy_0779"))+Serein.t("copy_0780"));
 }
 async function importFile(file){
  if(!file)return;try{
   if(file.size>8*1024*1024)throw Error(Serein.t("copy_0781"));
   const raw=JSON.parse(await file.text());if(vault.locked){lockDialog('unlock');c.toast(Serein.t("copy_0782"));return;}
   if(raw.vault){vault.validate(raw.vault);pendingImport=raw;c.openModal(Serein.t("copy_0783"),Serein.t("copy_0784"));}
   else{pendingImport=c.normalise(raw);showImport(false);}
  }catch(error){c.toast(error.message||Serein.t("copy_0785"));}
 }
 function showImport(encrypted){
  const x=pendingImport;c.openModal(Serein.t("copy_0286"),'<p>'+x.journals.length+' reflections, '+x.checkins.length+' check-ins, '+x.contacts.length+' contacts, '+x.feedback.length+Serein.t("copy_0786")+x.savedPlans.length+Serein.t("copy_0787")+(encrypted&&!vault.enabled?Serein.t("copy_0788"):'')+Serein.t("copy_0789"));
 }
 async function applyImport(replace){
  if(!pendingImport||vault.locked)return;if(c.recovery()){$('#import-error').textContent=Serein.t("copy_0790");return;}
  const old=store(),draftBefore=state.draft,incoming=pendingImport,unique=xs=>[...new Map(xs.map(x=>[x.id,x])).values()],useLock=!!$('#import-use-lock')?.checked;
  const next=replace?{...incoming,vault:old.vault}:{
   ...old,practiceMemory:{...incoming.practiceMemory,...old.practiceMemory},practiceChoices:{...incoming.practiceChoices,...old.practiceChoices},
   feedback:unique([...old.feedback,...incoming.feedback]),savedPlans:unique([...old.savedPlans,...incoming.savedPlans]),journals:unique([...old.journals,...incoming.journals]),checkins:unique([...old.checkins,...incoming.checkins]),contacts:unique([...old.contacts,...incoming.contacts]),
   journeyProgress:Object.fromEntries(A.journeys.map(j=>[j.id,[...new Set([...(old.journeyProgress[j.id]||[]),...(incoming.journeyProgress[j.id]||[])])]])),
   savedPractices:[...new Set([...old.savedPractices,...incoming.savedPractices])],savedResources:[...new Set([...old.savedResources,...incoming.savedResources])],savedWords:[...new Set([...old.savedWords,...incoming.savedWords])],routine:old.routine.length?old.routine:incoming.routine
  };
  try{c.setStore(next);if(useLock&&!vault.enabled)await vault.enable(importPass);else if(!await vault.persist())throw Error(Serein.t("copy_0791"));if(replace)c.clearDraft();pendingImport=null;importPass='';c.closeModal();applyTheme();render();c.toast(replace?Serein.t("copy_0187"):Serein.t("copy_0792"));}
  catch(error){c.setStore(old);state.draft=draftBefore;const errorBox=$('#import-error');if(errorBox)errorBox.textContent=error.message;else c.toast(error.message);}
 }
 function reminderExtras(){
  const host=$('#reminder-form');if(!host||$('#reminder-preset'))return;
  const html=field('reminder-preset',Serein.t("copy_0793"),'custom',[['custom',Serein.t("copy_0794")],['start',Serein.t("copy_0795")],['middle','Mid-shift'],['end',Serein.t("copy_0796")]])+field('reminder-shift',Serein.t("copy_0797"),store().preferences.shift==='nights'?'nights':'days',[['days',Serein.t("copy_0798")],['nights',Serein.t("copy_0799")]])+Serein.t("copy_0800");
  host.insertAdjacentHTML('afterbegin',html);
 }
 function shortcuts(){player.cancelCountdown();if(state.session?.state==='playing')c.pausePlayer();c.openModal(Serein.t("copy_0801"),Serein.t("copy_0802")+[['P',Serein.t("copy_0803")],['Space',Serein.t("copy_0804")],['← / →',Serein.t("copy_0805")],['R',Serein.t("copy_0806")],['F',Serein.t("copy_0807")],['Esc',Serein.t("copy_0808")],[Serein.t("copy_0809"),Serein.t("copy_0810")],['?',Serein.t("copy_0811")]].map(([k,v])=>'<div><dt><kbd>'+k+'</kbd></dt><dd>'+v+'</dd></div>').join('')+'</dl>');}
 function handleClick(event){
  if(event.target.closest('a.skip')){event.preventDefault();event.stopImmediatePropagation();$('#main').focus({preventScroll:true});$('#main').scrollIntoView?.({block:'start',behavior:'instant'});return;}
  const b=event.target.closest('button,a[data-action]');if(!b)return;const d=b.dataset;
  function stop(){event.preventDefault();event.stopImmediatePropagation();}
  if(d.ig){stop();gallery.handle(b,event);return;}
  if(d.nav){stop();go(d.nav);return;}
  if(d.practiceDetail){stop();detail(d.practiceDetail);return;}
  if(d.adv==='studio'){stop();go('toolkit/'+d.id);return;}
  if(d.adv==='journey'){stop();go('library/journeys?journey='+d.id);return;}
  if(d.adv==='app-options'){stop();c.advance.handle(b).then(reminderExtras);return;}
  if(d.adv==='feedback'){stop();c.advance.handle(b).then(()=>{if($('#uncomfortable-support'))$('#uncomfortable-support').hidden=d.value!=='Uncomfortable';});return;}
  if(d.action==='reflection-history'&&route.view==='me'&&route.tab==='journal'){stop();const h=$('.journal-history h2');h.tabIndex=-1;h.focus();h.scrollIntoView?.({block:'start',behavior:c.reduced()?'instant':'smooth'});return;}
  if(d.action==='settings'||d.action==='data-page'||d.action==='reflection-history'){stop();go(d.action==='settings'?'me/settings':d.action==='data-page'?'me/data':'me/journal');return;}
  if(d.action==='quick-start'){stop();player.quick();return;}
  if(d.action==='sources'){stop();state.scopeOpen=true;c.openModal(Serein.t("copy_0812"),scope());return;}
  if(d.action==='export'){stop();exportDialog();return;}
  if(d.action==='work-tools'||d.action==='transition-tools'){stop();go('toolkit/'+(d.action==='work-tools'?'support':'transition'));return;}
  if(d.action==='reset-filters'){stop();state.budget=0;state.style='any';state.position='any';state.category='All';state.query='';refreshFilters();return;}
  if(d.action==='checkin'&&vault.locked){stop();lockDialog('unlock');return;}
  if(d.action==='confirm-clear'){stop();cancelSearch();clearTimeout(lockRequest);vault.reset();c.clearRecovery();c.resetStore();c.clearUndo();pendingImport=null;importPass='';state.draft='';state.mood=0;state.budget=120;state.style='any';state.query='';state.guideQuery='';state.journalQuery='';state.position='any';state.category='All';state.guideCategory='All';state.homeTime=null;state.quickCheckinId=null;state.editing=null;try{sessionStorage.removeItem('serein-moment-override');sessionStorage.removeItem('serein-rotation')}catch{}autoMoment();c.clearDraft();go('today');c.toast(Serein.t("copy_0813"));return;}
  if(d.action==='privacy'){stop();c.privacy();$('#modal-content').insertAdjacentHTML('afterbegin','<p class="notice">'+(vault.enabled?Serein.t("copy_0814"):Serein.t("copy_0815"))+'</p>');return;}
  if(d.action==='save-player'||d.savePractice){stop();c.toggleFavorite(d.savePractice||state.session.practice.id);if($('#detail-duration')){const id=d.savePractice;detail(id);}return;}
  if(d.keepEntry){stop();const entry=(d.entryType==='journal'?store().journals:store().checkins).find(x=>x.id===d.keepEntry);if(entry&&!vault.locked)c.openModal(Serein.t("copy_0268"),'<p>'+(vault.enabled?Serein.t("copy_0816"):Serein.t("copy_0817"))+Serein.t("copy_0818")+esc(entry.id)+'" data-entry-type="'+d.entryType+Serein.t("copy_0819"));return;}
  if(d.action==='search'){stop();player.cancelCountdown();if(state.session?.state==='playing')c.pausePlayer();c.openSearch();return;}
  if(d.moment!==undefined){stop();rememberMoment(+d.moment);render();quickActions();return;}
  if(d.mood&&route.view==='today'&&!b.closest('dialog')){stop();quickCheckin(+d.mood);return;}
  if(d.budget!==undefined){stop();state.budget=d.budget==='self'?'self':+d.budget;refreshFilters();return;}
  if(d.category){stop();state.category=d.category;refreshFilters();return;}
  if(d.guideCategory){stop();state.guideCategory=d.guideCategory;render();return;}
  if(!d.v5)return;stop();
  const a=d.v5;
  if(a==='recovery-export'){c.download(c.recovery()||'','Serein-recovery-data.json','application/json');}
  else if(a==='quick')player.quick();
  else if(a==='help')help();
  else if(a==='scope')c.openModal(Serein.t("copy_0812"),scope());
  else if(a==='filters')filterSheet();
  else if(a==='filters-done'){c.closeModal();render();}
  else if(a==='clear-filter'){if(d.value==='time')state.budget=0;if(d.value==='style')state.style='any';if(d.value==='setting')state.position='any';if(d.value==='category')state.category='All';refreshFilters();}
  else if(a==='detail-start'||a==='detail-preview')c.openPractice(d.id,+$('#detail-duration').value||null,a==='detail-preview');
  else if(a==='home-time'){state.homeTime=d.value==='self'?'self':+d.value;render();}
  else if(a==='rotation'){try{sessionStorage.setItem('serein-rotation',d.value);sessionStorage.removeItem('serein-moment-override')}catch{}autoMoment();render();}
  else if(a==='checkin-note')noteDialog();
  else if(a==='save-quick-checkin'){const x=store().checkins.find(x=>x.id===state.quickCheckinId);if(x){x.persistent=true;vault.persist();quickActions();c.toast(Serein.t("copy_0820"),()=>{x.persistent=false;vault.persist();quickActions();});}}
  else if(a==='delete-contact'){const i=store().contacts.findIndex(x=>x.id===d.id);if(i>=0){const [x]=store().contacts.splice(i,1);vault.persist();render();c.toast(Serein.t("copy_0821"),()=>{if(vault.locked){c.toast(Serein.t("copy_0822"));return;}store().contacts.splice(i,0,x);vault.persist();render();});}}
  else if(a==='setup-lock')lockDialog('setup');
  else if(a==='unlock')lockDialog('unlock');
  else if(a==='lock')requestLock();
  else if(a==='remove-lock')lockDialog('remove');
  else if(a==='plain-export')confirmPlain();
  else if(a==='plain-export-confirm'){if(!$('#plain-export-consent').checked){$('#export-error').textContent=Serein.t("copy_0823");return;}const payload={...store(),vault:null,app:'Serein',version:5,exportedAt:new Date().toISOString()};c.download(JSON.stringify(payload,null,2),'Serein-personal-data.json','application/json');c.closeModal();c.toast(Serein.t("copy_0824"));}
  else if(a==='encrypted-export')vault.exportEncrypted().then(out=>{c.download(JSON.stringify(out,null,2),'Serein-encrypted-data.json','application/json');c.closeModal();c.toast(Serein.t("copy_0825"));}).catch(error=>c.toast(error.message));
  else if(a==='player-settings'){player.cancelCountdown();player.cancelCountdown();if(state.session?.state==='playing')c.pausePlayer();if(!$('#voice-choice')&&globalThis.speechSynthesis?.getVoices?.().length)$('#player-extra-options').innerHTML=player.extras();$('#player-settings').showModal();c.contexts.decorate();}
  else if(a==='close-player-settings')$('#player-settings').close();
  else if(a==='shortcuts')shortcuts();
  else if(a==='choose-another'){player.cancelCountdown();c.exitPlayer();c.advance.finderOpen();}
  else if(a==='next-suggestion'){const current=state.session.practice.id;c.exitPlayer();const next=c.advance.rank({budget:store().preferences.time}).find(x=>x.id!==current);if(next)c.openPractice(next.id);else c.advance.finderOpen();}
  else if(a==='back-today'){c.exitPlayer();go('today');}
  else if(a==='onboarding')onboarding(0);
  else if(a==='welcome-skip')finishWelcome();
  else if(a==='welcome-lock'){finishWelcome();lockDialog('setup');}
  else if(a==='welcome-next'){if(onboardStep===1){const p=store().preferences;p.role=$('#welcome-role').value;p.time=+$('#welcome-time').value;p.style=$('#welcome-style').value;p.shift=$('#welcome-shift').value;state.budget=p.time;state.style=p.style;}if(onboardStep<2)onboarding(onboardStep+1);else finishWelcome();}
  else if(a==='command')command(d.kind,d.id);
  else if(a==='import-merge'||a==='import-replace')applyImport(a==='import-replace');
  else if(a==='legacy-tools')c.workTools(d.value);
  else if(a==='share-team'){
   const s=c.advance.studio,base=new URL(location.href);base.hash='toolkit/team?practice='+encodeURIComponent(s.teamPractice)+'&duration='+s.teamDuration+'&external='+(s.external?1:0);
   const text=base.href;const host=$('#team-share-link');host.value=text;
   Promise.resolve().then(()=>{if(!navigator.clipboard?.writeText)throw Error(Serein.t("copy_0826"));return navigator.clipboard.writeText(text)}).then(()=>c.toast(Serein.t("copy_0827"))).catch(()=>{host.focus();host.select();c.toast(Serein.t("copy_0828"));});
  }
 }
 async function handleSubmit(event){
  const form=event.target;if(!['vault-form','support-contact-form','quick-note-form','archive-pass-form'].includes(form.id))return;
  event.preventDefault();event.stopImmediatePropagation();const fd=new FormData(form);
  if(form.id==='vault-form'){
   const error=$('#vault-error'),button=form.querySelector('button[type="submit"]');button.disabled=true;error.textContent='';
   try{
    if(form.dataset.mode==='setup'){if(fd.get('pass')!==fd.get('confirm'))throw Error(Serein.t("copy_0829"));if(!fd.has('understood'))throw Error(Serein.t("copy_0830"));await vault.enable(String(fd.get('pass')));}
    else if(form.dataset.mode==='remove'){if(!fd.has('understood'))throw Error(Serein.t("copy_0831"));await vault.remove(String(fd.get('pass')));}
    else await vault.unlock(String(fd.get('pass')));
    c.closeModal();form.reset();render();c.toast(form.dataset.mode==='setup'?Serein.t("copy_0832"):form.dataset.mode==='remove'?Serein.t("copy_0833"):Serein.t("copy_0834"));resetActivity();
   }catch(e){error.textContent=e.message;button.disabled=false;}
  }
  if(form.id==='support-contact-form'){
   if(vault.locked)return;const name=String(fd.get('name')).trim(),phone=String(fd.get('phone')).trim();if(!name){$('#contact-error').textContent=Serein.t("copy_0835");return;}if(!/[0-9]{3}/.test(phone.replace(/\D/g,''))){$('#contact-error').textContent=Serein.t("copy_0836");return;}
   store().contacts.push({id:c.uid(),name:name.slice(0,100),role:String(fd.get('role')).trim().slice(0,100),phone:phone.slice(0,40),persistent:fd.has('persist')});vault.persist();render();c.toast(fd.has('persist')?Serein.t("copy_0837"):Serein.t("copy_0838"));
  }
  if(form.id==='quick-note-form'){const entry=store().checkins.find(x=>x.id===state.quickCheckinId);if(entry&&!vault.locked){entry.note=String(fd.get('note')).slice(0,6000);vault.persist();c.closeModal();c.toast(Serein.t("copy_0839"));}}
  if(form.id==='archive-pass-form'){
   try{const pass=String(fd.get('pass')),raw=pendingImport;pendingImport=await vault.decryptArchive(raw,pass);importPass=pass;showImport(true);}catch{$('#archive-error').textContent=Serein.t("copy_0840");}
  }
 }
 function handleChange(event){
  const e=event.target;
  if(e.id==='import-file'){event.stopImmediatePropagation();importFile(e.files[0]);e.value='';return;}
  if(e.closest('#settings-form')||e.id==='lock-after'||e.id==='lock-on-hide'){event.stopImmediatePropagation();settingsChanged(e);return;}
  if(['practice-style','practice-position','practice-style-sheet','practice-position-sheet'].includes(e.id)){event.stopImmediatePropagation();if(e.id.includes('style'))state.style=e.value;else state.position=e.value;refreshFilters();return;}
  if(e.id==='date-filter'){event.stopImmediatePropagation();state.dateFilter=e.value;render();return;}
  if(['voice-choice','voice-rate','ambient-sound','ambient-volume','keep-awake','phase-haptics'].includes(e.id)){event.stopImmediatePropagation();player.change(e);return;}
  if(e.id==='reminder-preset'||e.id==='reminder-shift'){const night=$('#reminder-shift').value==='nights',v=$('#reminder-preset').value;if(v!=='custom')$('#reminder-time').value=v==='start'?(night?'19:10':'07:10'):v==='middle'?(night?'01:00':'13:00'):(night?'07:00':'19:00');}
 }
 function handleInput(event){
  const e=event.target;
  if(['practice-query','practice-query-sheet','guide-query','global-search','journal-query'].includes(e.id)){
   event.stopImmediatePropagation();clearTimeout(e.id==='journal-query'?journalTimer:searchTimer);
   if(e.id==='journal-query')state.journalQuery=e.value;else if(e.id==='guide-query')state.guideQuery=e.value;else if(e.id!=='global-search')state.query=e.value;
   const routeAtInput=route.canonical;const run=()=>{if(!e.isConnected||route.canonical!==routeAtInput)return;if(e.id==='global-search'){if($('#search-dialog').open)search(e.value);}else if(e.id==='journal-query'){state.journalQuery=e.value;const host=$('#journal-history');if(host)host.innerHTML=journalHistory();}else if(e.id==='guide-query'){state.guideQuery=e.value;$('#guide-results').innerHTML=S.mediaHTML(c.guidesResults());lazyImages();}else{state.query=e.value;filterURL();$('#practice-results').innerHTML=S.mediaHTML(c.practiceResults());lazyImages();}};
   if(e.id==='journal-query')journalTimer=setTimeout(run,150);else searchTimer=setTimeout(run,150);
  }
  if(e.id==='ambient-volume'||e.id==='voice-rate')player.change(e);
 }
 function keyboard(event){
  if(gallery.keyboard(event))return;
  const typing=event.target.closest('input,select,textarea,[contenteditable="true"]'),key=event.key.toLowerCase();
  if((event.metaKey||event.ctrlKey)&&key==='k'||key==='/'&&!typing){event.preventDefault();event.stopImmediatePropagation();player.cancelCountdown();if(state.session?.state==='playing')c.pausePlayer();c.openSearch();return;}
  if(typing||event.metaKey||event.ctrlKey||event.altKey)return;
  if($('#search-dialog').open)return;
  if(!$('#player').open){if(key==='p'&&!$('dialog[open]')){event.preventDefault();player.quick();}return;}
  if($('#player-settings').open||$('#modal').open)return;
  if(event.target.closest('button,a,summary')&&key===' '&&event.target.id!=='player-play')return;
  if(key===' '){event.preventDefault();player.cancelCountdown();c.playPause();}
  if(key==='arrowleft'||key==='arrowright'){event.preventDefault();state.session.jump(state.session.snapshot().index+(key==='arrowleft'?-1:1));c.updatePlayer(true);c.syncPlayerMotion();}
  if(key==='r'){event.preventDefault();c.restart();}
  if(key==='f'){event.preventDefault();c.present();}
  if(key==='?'){event.preventDefault();shortcuts();}
 }
 let playSince=0,played=0;
 function preparePlayer(){
  completionShown=false;lastPlay='';playSince=0;played=0;$('#player-completion').hidden=true;$('#player-scroll').hidden=false;
  if(!$('#player-extra-options'))$('#player-settings-content').insertAdjacentHTML('beforeend',Serein.t("copy_0841")+player.extras()+'</div>');
  $('#player-feedback').insertAdjacentHTML('beforeend',Serein.t("copy_0842"));
  if(!globalThis.speechSynthesis)$('#session-voice')?.closest('label')?.setAttribute('hidden','');if(!(globalThis.AudioContext||globalThis.webkitAudioContext))$('#session-chime')?.closest('label')?.setAttribute('hidden','');player.prepare();c.contexts?.decorate();
 }
 function playerUpdated(s){
  const playing=s.state==='playing';if(lastPlay!==s.state){if(playing){playSince=performance.now();player.started();}else if(playSince){played+=performance.now()-playSince;playSince=0;}lastPlay=s.state;}
  player.tick(s);const ring=$('#progress-ring-fill');if(ring)ring.setAttribute('stroke-dashoffset',String(100-s.percent));
  $('#progress-ring')?.setAttribute('aria-label',Math.round(s.percent)+Serein.t("copy_0843"));
  if($('#completion-save')){const saved=store().savedPractices.includes(state.session.practice.id);$('#completion-save').textContent=saved?Serein.t("copy_0844"):Serein.t("copy_0845");$('#completion-save').setAttribute('aria-pressed',String(saved));}
  if(s.state==='complete'&&!state.preview){
   $('#player-scroll').hidden=true;$('#player-completion').hidden=false;$('#completion-elapsed').textContent=(state.session.duration?c.durationLabel(state.session.elapsed):Math.round(played/1000)+' seconds')+Serein.t("copy_0846");
   if(!completionShown){completionShown=true;$('#completion-title').focus({preventScroll:true});}
  }else{$('#player-scroll').hidden=false;$('#player-completion').hidden=true;completionShown=false;}
  for(const [i,b] of [...$('#player-step-list').querySelectorAll('button')].entries()){b.disabled=false;b.dataset.playerStep=String(i);b.setAttribute('aria-label','Step '+(i+1)+': '+state.session.phases()[i]?.title);b.textContent=String(i+1);}
 }
 function savingLabels(root){if(!vault.enabled)return;for(const label of root.querySelectorAll('label'))if(label.querySelector('input[name="persist"]'))for(const n of label.childNodes)if(n.nodeType===3)n.textContent=n.textContent.replace(Serein.t("copy_0847"),Serein.t("copy_0848"));}
 function enrichModal(){savingLabels($('#modal-content'));
  lazyImages($('#modal-content'));
  if($('#studio-output')&&c.advance.studio?.id==='team'&&!$('#team-share-link'))$('#studio-result-status').insertAdjacentHTML('afterend',Serein.t("copy_0849"));
  reminderExtras();
 }
 function configureManifest(){
  if(location.protocol==='file:'||!$('meta[name="serein-distribution"]')||$('link[rel="manifest"]'))return;
  try{
   const here=new URL(location.href);here.hash='';here.search='';
   const manifest={id:here.pathname,name:Serein.t("copy_0850"),short_name:'Serein',start_url:here.href+'#today',scope:new URL('./',here).href,display:'standalone',background_color:'#F8F5EF',theme_color:'#10253A',icons:[{src:S.mediaURL('assets/icon-192.png'),sizes:'192x192',type:'image/png'},{src:S.mediaURL('assets/icon-512.png'),sizes:'512x512',type:'image/png'}],shortcuts:[{name:Serein.t("copy_0585"),url:here.href+'#quick-start'},{name:Serein.t("copy_0677"),url:here.href+'#me/journal'},{name:Serein.t("copy_0851"),url:here.href+'#support'}]};
   const link=document.createElement('link');link.rel='manifest';link.href=URL.createObjectURL(new Blob([JSON.stringify(manifest)],{type:'application/manifest+json'}));document.head.appendChild(link);
  }catch{}
 }
 function initialise(){configureManifest();
  gallery.initialise();
  applyTheme();autoMoment();setRoute(parse(location.hash));lastHash='#'+route.canonical;if(location.hash!==lastHash)setHistory(lastHash,true);
  document.addEventListener('click',handleClick,true);document.addEventListener('submit',handleSubmit,true);document.addEventListener('change',handleChange,true);document.addEventListener('input',handleInput,true);document.addEventListener('keydown',keyboard,true);
  window.addEventListener('popstate',readRoute);window.addEventListener('hashchange',readRoute);
  document.addEventListener('pointerdown',resetActivity,{passive:true});document.addEventListener('keydown',resetActivity);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&vault.enabled&&!vault.locked&&store().vault.lockOnHide!==false){document.body.classList.add('privacy-shield');requestLock();}});
  window.matchMedia?.(Serein.t("copy_0587")).addEventListener?.('change',()=>{if(store().preferences.theme==='auto')applyTheme()});
  $('#player-settings').addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();$('#player-settings').close();});
  $('#player-settings').addEventListener('close',()=>$('#player-settings-button').focus({preventScroll:true}));
  for(const dialog of $$('dialog'))dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){if(dialog.id==='player')c.exitPlayer();else dialog.close();}}});
  const observer=new MutationObserver(()=>enrichModal());observer.observe($('#modal-content'),{childList:true});
  window.addEventListener('error',()=>c.toast(Serein.t("copy_0852")));
  window.addEventListener('unhandledrejection',event=>{event.preventDefault();c.toast(Serein.t("copy_0853"));});
  if(!store().onboarded)setTimeout(()=>S.hook&&!new URLSearchParams(location.search).has('nohook')?S.hook.run({onboard:()=>onboarding(0),finish:finishWelcome}):onboarding(0),0);else setTimeout(()=>openDeep(route),0);
  resetActivity();
 }
 async function selftest(){
  const checks=[],test=(name,fn)=>{try{fn();checks.push({name,result:'PASS'})}catch(e){checks.push({name,result:'FAIL',detail:e.message})}};
  for(const id of ['tide','box','ground'])test('Engine '+id,()=>{const p=D.practices.find(p=>p.id===id),e=new S.engine.SessionEngine(p);e.play(0);e.tick(1000);if(e.state!=='playing'||!e.phases().length)throw Error(Serein.t("copy_0854"));e.pause(1000);if(e.state!=='paused')throw Error(Serein.t("copy_0855"));});
  test(Serein.t("copy_0856"),()=>{for(const [a,b] of Object.entries({practices:'library/practices',journeys:'library/journeys',studios:'toolkit',reflect:'me/journal',space:'me/saved'}))if(parse(a).canonical!==b)throw Error(a);});
  test(Serein.t("copy_0857"),()=>{const x=c.normalise({app:'Serein',version:3,checkins:[{id:'fixture',mood:4,date:'2026-10-01'}],journals:[{id:'j',text:'Fixture',date:'2026-10-01'}]});if(x.version!==5||c.normalise(JSON.parse(JSON.stringify(x))).journals[0].text!=='Fixture')throw Error(Serein.t("copy_0858"));});
  test(Serein.t("copy_0859"),()=>{const ids=$$('[id]').map(x=>x.id);if(new Set(ids).size!==ids.length)throw Error(Serein.t("copy_0860"));});
  test(Serein.t("copy_0861"),()=>{if($$('img').some(im=>!im.hasAttribute('alt')))throw Error(Serein.t("copy_0862"));});
  test(Serein.t("copy_0863"),()=>{if($$('button').some(b=>!b.textContent.trim()&&!b.getAttribute('aria-label')&&!b.getAttribute('aria-labelledby')))throw Error(Serein.t("copy_0864"));});
  if(vault.available){try{await S.cryptoSelftest();checks.push({name:Serein.t("copy_0865"),result:'PASS'});}catch(e){checks.push({name:Serein.t("copy_0865"),result:'FAIL',detail:e.message});}}else checks.push({name:Serein.t("copy_0865"),result:Serein.t("copy_0866")});console.table(checks);return checks;
 }
 function recommend(){return c.advance.rank({budget:state.homeTime||store().preferences.time})[0]||null;}
 /** Public view, search and accessibility entry points. */
 S.search={run:search,execute:command};S.stateRef=()=>store();S.themeToggle=()=>{const p=store().preferences;p.theme=document.body.dataset.theme==='night'?'light':'night';vault.persist();applyTheme();render();};S.a11y={reducedMotion:c.reduced,help,focusMain:()=>$('#main').focus({preventScroll:true})};
 S.views={today,library,toolkit,infographics:gallery.render,me,support};S.router={parse,go,get current(){return route}};
 return {initialise,render,navigate:go,applyTheme,detail,search,preparePlayer,playerUpdated,persist:()=>vault.persist(),saveDraft:async text=>{const ok=await vault.saveDraft(text);c.draftStorageStatus(ok);return ok;},vault,player,recommend,exportDialog,importFile,help,scope,selftest,stopPlayer:()=>{player.stop();if($('#player-settings').open)$('#player-settings').close();},get route(){return route}};
};
})(globalThis.Serein=globalThis.Serein||{});


;

(function(){
'use strict';
const APP_VERSION='5.2.0';
const DRAFT_KEY='serein-journal-draft';
let draftStorageOK=true,draftTimer=0;
function loadDraft(){try{if(JSON.parse(localStorage.getItem('serein-hca-v3')||'null')?.vault)return '';}catch{}try{return (sessionStorage.getItem(DRAFT_KEY)||'').slice(0,20000);}catch{draftStorageOK=false;return '';}}
const D=globalThis.Serein.data,{SessionEngine,chooseDuration,matchPractices}=globalThis.Serein.engine;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={infographics:'M3 4h7v16H3z M14 4h7v16h-7z M6 8h1 M6 12h1 M17 8h1 M17 12h1',studios:'M3 3h18v18H3z M8 7l8 5-8 5z',journeys:'M12 5v16 M3 3c4-1 7 0 9 2 2-2 5-3 9-2v16c-4-1-7 0-9 2-2-2-5-3-9-2z',plus:'M12 5v14 M5 12h14',today:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',practices:'M3 8h12a3 3 0 1 0-3-3 M3 12h16a3 3 0 1 1-3 3 M3 16h5a3 3 0 1 1-3 3',reflect:'M4 3h16v18H4z M8 7h8 M8 11h8 M8 15h5',space:'M5 3h14v18l-7-5-7 5z',support:'M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M17 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M2 20v-5a5 5 0 0 1 8-4 M22 20v-5a5 5 0 0 0-8-4 M8 20v-4a4 4 0 0 1 8 0v4',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 2h6l1 4 4 1 2 5-2 5-4 1-1 4H9l-1-4-4-1-2-5 2-5 4-1z',search:'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',close:'M6 6l12 12 M18 6 6 18',arrow:'M4 12h15 M13 6l6 6-6 6',clock:'M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0 M12 6v6l4 2',bookmark:'M5 3h14v18l-7-5-7 5z',shield:'M12 2l9 4v6c0 5-9 10-9 10S3 17 3 12V6z M8 12l3 3 5-6',sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1 1 M18 18l1 1 M5 19l1-1 M18 6l1-1',moon:'M20 15a8 8 0 0 1-11-11A9 9 0 1 0 20 15',pause:'M8 5v14 M16 5v14',play:'M8 4l12 8-12 8z',restart:'M3 11a9 9 0 1 1 1 6 M3 4v7h7',expand:'M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5',sliders:'M4 6h16 M4 12h16 M4 18h16 M8 3v6 M16 9v6 M10 15v6',check:'M5 12l4 4L19 6',heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8',shuffle:'M3 5h4l10 14h4 M3 19h4L17 5h4 M17 2l4 3-4 3 M17 16l4 3-4 3',download:'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',upload:'M12 16V4 M7 9l5-5 5 5 M4 17v4h16v-4',book:'M12 5v16 M3 3c4-1 7 0 9 2 2-2 5-3 9-2v16c-4-1-7 0-9 2-2-2-5-3-9-2z'};
const icon=(n)=>Serein.t("copy_0001",{v0:(paths[n]||paths.heart)});
function icons(root=document){$$('[data-icon]',root).forEach(e=>e.innerHTML=icon(e.dataset.icon));}
const navigation=[['today',Serein.t("copy_0002")],['practices','Practices'],['studios','Studios'],['journeys','Journeys'],['reflect','Reflect'],['space',Serein.t("copy_0003")],['support',Serein.t("copy_0004")]];
const defaults={version:5,contacts:[],onboarded:false,vault:null,practiceMemory:{},practiceChoices:{},feedback:[],journeyProgress:{},savedPlans:[],checkins:[],journals:[],savedPractices:[],savedResources:[],savedWords:[],routine:[],preferences:{role:Serein.t("copy_0005"),time:120,style:'any',motion:false,visual3d:true,hideQuotes:false,readingSize:'standard',theme:'auto',shift:'prefer',voiceURI:'',voiceRate:.86,readingWidth:false,focus:false}};
let storageOK=true,migrated=false,recoveryRaw=null;
function normalizeImport(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error(Serein.t("copy_0006"));
 if(!('checkins'in raw||'moods'in raw||'journals'in raw||'reflections'in raw||raw.app==='Serein'||raw.vault))throw Error(Serein.t("copy_0007"));
 if(Number(raw.version)>5)throw Error(Serein.t("copy_0008"));
 const prefs=raw.preferences||raw.prefs||{},profile=prefs.sereinProfile||{};
 const oldStyle=profile.style==='quiet'?'ground':profile.style;
 const extra=globalThis.Serein.toolsFactory.normalize(raw,D);
 const role=String(prefs.role||profile.role||Serein.t("copy_0005")).slice(0,80);
 const style=['any','nonbreath','ground'].includes(prefs.style||oldStyle)?prefs.style||oldStyle:'any';
 const time=[60,120,300].includes(+prefs.time)?+prefs.time:[1,2,5].includes(+profile.time)?+profile.time*60:120;
 const dateOf=(x)=>Number.isFinite(Date.parse(x))?new Date(x).toISOString():new Date().toISOString();
 const checkins=(Array.isArray(raw.checkins)?raw.checkins:Array.isArray(raw.moods)?raw.moods:[]).slice(0,2000).filter(x=>x&&Number.isInteger(+x.mood)&&+x.mood>=1&&+x.mood<=5).map(x=>({id:String(x.id||uid()),mood:+x.mood,energy:String(x.energy||Serein.t("copy_0009")).slice(0,80),note:String(x.note||'').slice(0,6000),moment:String(x.moment||'').slice(0,80),date:dateOf(x.date),persistent:x.persistent!==false}));
 const journals=(Array.isArray(raw.journals)?raw.journals:Array.isArray(raw.reflections)?raw.reflections:[]).slice(0,2000).filter(x=>x&&typeof x.text==='string').map(x=>({id:String(x.id||uid()),text:x.text.slice(0,20000),date:dateOf(x.date),persistent:x.persistent!==false}));
 const valid=(list,catalog)=>Array.isArray(list)?[...new Set(list.filter(id=>catalog.some(x=>x.id===id)))]:[];
 return {...structuredClone(defaults),onboarded:raw.onboarded===true,vault:raw.vault?JSON.parse(JSON.stringify(raw.vault)):null,contacts:(Array.isArray(raw.contacts)?raw.contacts:[]).filter(x=>x&&typeof x.name==='string'&&typeof x.phone==='string').map(x=>({id:String(x.id||uid()),name:x.name.slice(0,100),role:String(x.role||'').slice(0,100),phone:x.phone.slice(0,40),persistent:x.persistent!==false})),practiceMemory:extra.practiceMemory,practiceChoices:extra.practiceChoices,feedback:extra.feedback,journeyProgress:extra.journeyProgress,savedPlans:extra.savedPlans,checkins,journals,savedPractices:valid(raw.savedPractices||prefs.exerciseFavorites,D.practices),savedResources:valid(raw.savedResources||raw.saved,D.resources),savedWords:(Array.isArray(raw.savedWords)?raw.savedWords:Array.isArray(prefs.favoriteReflections)?prefs.favoriteReflections:[]).filter(x=>typeof x==='string').map(x=>x.slice(0,1500)).slice(0,200),routine:valid(raw.routine||prefs.routine,D.practices).slice(0,4),preferences:{...defaults.preferences,...extra.comfort,theme:['auto','light','night','contrast'].includes(prefs.theme)?prefs.theme:prefs.theme==='dark'?'night':defaults.preferences.theme,shift:['days','nights','rotating','prefer'].includes(prefs.shift)?prefs.shift:'prefer',voiceURI:String(prefs.voiceURI||''),voiceRate:Math.min(1.2,Math.max(.6,Number(prefs.voiceRate)||.86)),commandRecent:Array.isArray(prefs.commandRecent)?prefs.commandRecent.filter(x=>typeof x==='string').slice(0,6):[],role,time,style,motion:!!prefs.motion,visual3d:prefs.visual3d!==false,hideQuotes:!!prefs.hideQuotes}};
}
function uid(){return globalThis.crypto?.randomUUID?.()||Serein.t("copy_0010",{v0:(Date.now()),v1:(Math.random().toString(36).slice(2))});}
function loadStore(){let candidate=null;try{const v=localStorage.getItem('serein-hca-v3');if(v){candidate=v;return normalizeImport(JSON.parse(v));}const old=localStorage.getItem('serein-demo-v1');if(old){candidate=old;migrated=true;return normalizeImport(JSON.parse(old));}}catch{storageOK=false;if(candidate)recoveryRaw=candidate;}return structuredClone(defaults);}
let store=loadStore(),advance=null,contexts=null,modern=null;
const state={view:'today',moment:1,quote:0,mood:0,tab:'practices',spaceTab:'saved',savedTab:'practices',budget:store.preferences.time,style:store.preferences.style,position:'any',category:'All',query:'',guideQuery:'',guideCategory:'All',draft:loadDraft(),routineQueue:[],routineIndex:0,session:null,preview:false,visual:'photo',voice:false,present:false,editing:null,importData:null,dateFilter:'all'};
let timer=0,orb=null,lastStep='',lastClock='',returnFocus=null,modalReturn=null,toastTimer=0,searchIndex=-1,undoAction=null;
function persist(){if(modern)return modern.persist();try{const data={...store,feedback:store.feedback.filter(x=>x.persistent),checkins:store.checkins.filter(x=>x.persistent),journals:store.journals.filter(x=>x.persistent)};localStorage.setItem('serein-hca-v3',JSON.stringify(data));storageOK=true;}catch{storageOK=false;toast(Serein.t("copy_0011"));}}
function applyPrefs(){document.body.classList.toggle('reduce-motion',reduced());advance?.applyComfort();modern?.applyTheme();}
const osMotion=window.matchMedia?.(Serein.t("copy_0012"));
function reduced(){return !!(store.preferences.motion||osMotion?.matches);}
osMotion?.addEventListener?.('change',()=>{applyPrefs();syncPlayerMotion();});
const formatTime=n=>{if(n===null)return 'Self-paced';const seconds=Math.max(0,Math.ceil(n));return seconds<60?seconds+' sec':Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');};
const durationLabel=n=>n===null?'Self-paced':n===90?'90 sec':n%60===0?Serein.t("copy_0013",{v0:(n/60)}):Serein.t("copy_0014",{v0:(Math.floor(n/60))});
const dateLabel=d=>new Date(d).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
function pageHeader(eyebrow,title,sub,action=''){return Serein.t("copy_0015",{v0:(eyebrow),v1:(title),v2:(sub),v3:(action)});}
function imageTag(){return Serein.t("copy_0016");}

function icoInline(){return '';}

function quote(){if(store.preferences.hideQuotes)return '';let q=advance.quoteText(state.quote),saved=store.savedWords.includes(q);return Serein.t("copy_0021",{v0:(esc(q)),v1:(saved?Serein.t("copy_0017"):Serein.t("copy_0018")),v2:(saved?Serein.t("copy_0019"):Serein.t("copy_0020")),v3:(saved),v4:(icon('bookmark')),v5:(icon('shuffle'))});}
function moodButtons(){return Serein.t("copy_0024",{v0:(['Low',Serein.t("copy_0022"),'Okay','Good','Great'].map((label,i)=>Serein.t("copy_0023",{v0:(state.mood===i+1?'selected':''),v1:(i+1),v2:(state.mood===i+1),v3:([10,12,15,19,21][i]),v4:(label)})).join(''))});}
function checkinCard(){return Serein.t("copy_0025",{v0:(moodButtons()),v1:(icon('arrow'))});}
function card(p,budget=state.budget){const n=chooseDuration(p,typeof budget==='number'?budget:null),saved=store.savedPractices.includes(p.id);return Serein.t("copy_0026")+p.id+Serein.t("copy_0027")+p.id+Serein.t("copy_0028")+p.photo+'" alt="'+esc(p.cardAlt||Serein.t("copy_0029")+p.title)+Serein.t("copy_0030")+imageTag()+Serein.t("copy_0031")+p.category+Serein.t("copy_0032")+p.title+'</h3><p>'+esc(p.desc)+Serein.t("copy_0033")+durationLabel(n)+'</span><span>'+p.position+'</span><span>'+(p.breathFocus?Serein.t("copy_0034"):p.movement?Serein.t("copy_0035"):Serein.t("copy_0036"))+Serein.t("copy_0037")+p.id+'" aria-label="'+(saved?Serein.t("copy_0038"):'Save ')+esc(p.title)+'" aria-pressed="'+saved+'">'+icon('bookmark')+'</button></article>';}

function resourceCard(r){return Serein.t("copy_0039",{v0:(r.id),v1:(r.image),v2:(esc(r.imageAlt||Serein.t("copy_0029")+r.title)),v3:(imageTag()),v4:(r.label),v5:(r.title),v6:(esc(r.desc)),v7:(r.duration),v8:(icon('arrow'))});}
function recommend(){return modern?modern.recommend():advance?.recommend()||null;}
function baseTodayView(){let hr=new Date().getHours(),g=hr<12?Serein.t("copy_0040"):hr<18?Serein.t("copy_0041"):Serein.t("copy_0042"),p=recommend()||D.practices.find(x=>x.id==='ground'),n=chooseDuration(p,store.preferences.time);return pageHeader(Serein.t("copy_0043"),Serein.t("copy_0044",{v0:(g)}),Serein.t("copy_0045",{v0:(esc(store.preferences.role.toLowerCase()))}),Serein.t("copy_0046",{v0:(new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}))}))+Serein.t("copy_0053",{v0:(recommend()?Serein.t("copy_0047",{v0:(p.id),v1:(n||'')}):'data-adv="finder"'),v1:(n?'a '+durationLabel(n)+' pause':Serein.t("copy_0048")),v2:(icon('arrow')),v3:(icoInline()),v4:(advance.heroImage()),v5:(imageTag()),v6:(D.moments.map((m,i)=>Serein.t("copy_0049",{v0:(state.moment===i?'selected':''),v1:(i),v2:(state.moment===i),v3:(i+1),v4:(icon(['sun','practices','heart','moon'][i])),v5:(m.title),v6:(m.desc)})).join('')),v7:(p.photo),v8:(esc(p.cardAlt||Serein.t("copy_0050")+p.title)),v9:(imageTag()),v10:(p.title),v11:(esc(p.desc)),v12:(durationLabel(n)),v13:(p.position.toLowerCase()),v14:(p.breathFocus?Serein.t("copy_0051"):Serein.t("copy_0052")),v15:(p.id),v16:(n||''),v17:(icon('arrow')),v18:(checkinCard()),v19:(icon('arrow')),v20:(icon('arrow')),v21:(D.resources.filter(x=>['compassion','ask-support','shift-home'].includes(x.id)).map(resourceCard).join('')),v22:(quote())});}
function todayView(){let html=baseTodayView();if(!recommend())html=html.replace(/<section class="recommended">[\s\S]*?<\/section>/,Serein.t("copy_0054"));return html+advance.homeExtras();}
function filterOptions(){return Serein.t("copy_0064",{v0:([[60,'1 minute'],[120,'2 minutes'],[300,'5 minutes'],['self','Self-paced'],[0,Serein.t("copy_0055")]].map(([n,l])=>Serein.t("copy_0056",{v0:(String(state.budget)===String(n)?'active':''),v1:(n),v2:(String(state.budget)===String(n)),v3:(l)})).join('')),v1:(icon('search')),v2:(esc(state.query)),v3:([['any',Serein.t("copy_0057")],['nonbreath',Serein.t("copy_0058")],['ground',Serein.t("copy_0059")],['breath','Breathing']].map(([v,l])=>Serein.t("copy_0060",{v0:(v),v1:(state.style===v?'selected':''),v2:(l)})).join('')),v4:([['any',Serein.t("copy_0061")],['seated',Serein.t("copy_0062")],['still',Serein.t("copy_0063")]].map(([v,l])=>Serein.t("copy_0060",{v0:(v),v1:(state.position===v?'selected':''),v2:(l)})).join(''))});}
function practiceResults(){let matches=matchPractices(D.practices,{budget:state.budget,style:state.style,position:state.position,query:state.query,category:state.category,saved:store.savedPractices});return Serein.t("copy_0066",{v0:(matches.length),v1:(D.practices.length),v2:(matches.length?matches.map(p=>card(p)).join(''):Serein.t("copy_0065"))});}
function guidesResults(){let rs=D.resources.filter(r=>(state.guideCategory==='All'||state.guideCategory===Serein.t("copy_0067")&&store.savedResources.includes(r.id)||r.category===state.guideCategory)&&Serein.t("copy_0068",{v0:(r.title),v1:(r.desc),v2:(r.label)}).toLowerCase().includes(state.guideQuery.toLowerCase()));return Serein.t("copy_0070",{v0:(rs.length),v1:(rs.length?rs.map(resourceCard).join(''):Serein.t("copy_0069"))});}
function practicesView(){return pageHeader(Serein.t("copy_0071"),Serein.t("copy_0072"),Serein.t("copy_0073",{v0:(D.practices.length)}),Serein.t("copy_0074",{v0:(icon('plus'))}))+Serein.t("copy_0075")+Serein.t("copy_0083",{v0:(state.tab==='practices'?'active':''),v1:(state.tab==='practices'),v2:(state.tab==='guides'?'active':''),v3:(state.tab==='guides'),v4:(state.tab==='practices'?Serein.t("copy_0077",{v0:(filterOptions()),v1:(['All','Breathing','Grounding','Movement','Awareness','Visualization',Serein.t("copy_0067")].map(c=>Serein.t("copy_0076",{v0:(state.category===c?'active':''),v1:(c),v2:(state.category===c),v3:(c)})).join('')),v2:(practiceResults())}):Serein.t("copy_0082",{v0:(icon('search')),v1:(esc(state.guideQuery)),v2:(['All',Serein.t("copy_0078"),'Mindfulness',Serein.t("copy_0079"),Serein.t("copy_0080"),Serein.t("copy_0067")].map(c=>Serein.t("copy_0081",{v0:(state.guideCategory===c?'active':''),v1:(c),v2:(c)})).join('')),v3:(guidesResults())})),v5:(quote())});}
function reflectView(){return pageHeader(Serein.t("copy_0084"),Serein.t("copy_0085"),Serein.t("copy_0086"))+Serein.t("copy_0091",{v0:(checkinCard()),v1:([Serein.t("copy_0087"),Serein.t("copy_0088"),Serein.t("copy_0089")].map((l,i)=>Serein.t("copy_0090",{v0:(i),v1:(l)})).join('')),v2:(esc(state.draft)),v3:(draftStatus()),v4:(icon('arrow')),v5:(icoInline()),v6:(icon('support')),v7:(icon('moon')),v8:(icon('heart')),v9:(quote())});}
function entriesHTML(items,type){return items.length?Serein.t("copy_0099",{v0:([...items].reverse().map(x=>Serein.t("copy_0098",{v0:(esc(x.date)),v1:(dateLabel(x.date)),v2:(x.persistent?Serein.t("copy_0092"):Serein.t("copy_0093")),v3:(type==='checkin'?Serein.t("copy_0095",{v0:(['Low',Serein.t("copy_0022"),'Okay','Good','Great'][x.mood-1]),v1:(esc(x.energy)),v2:(x.moment?' · '+esc(x.moment):''),v3:(x.note?Serein.t("copy_0094",{v0:(esc(x.note))}):'')}):Serein.t("copy_0094",{v0:(esc(x.text))})),v4:(type==='journal'?Serein.t("copy_0096",{v0:(esc(x.id))}):''),v5:(esc(x.id)),v6:(type),v7:(!x.persistent?Serein.t("copy_0097",{v0:(esc(x.id)),v1:(type)}):'')})).join(''))}):Serein.t("copy_0100");}
function routineHTML(){return Serein.t("copy_0106",{v0:(store.routine.length?Serein.t("copy_0101",{v0:(store.routine.length),v1:(routineDuration())}):Serein.t("copy_0102")),v1:(store.routine.length?Serein.t("copy_0103"):''),v2:(store.routine.length?Serein.t("copy_0105",{v0:(store.routine.map((id,i)=>{let p=D.practices.find(x=>x.id===id);return Serein.t("copy_0104",{v0:(i+1),v1:(p.photo),v2:(p.title),v3:(durationLabel(chooseDuration(p))),v4:(p.category),v5:(i),v6:(i===0?'disabled':''),v7:(esc(p.title)),v8:(i),v9:(i===store.routine.length-1?'disabled':''),v10:(esc(p.title)),v11:(i),v12:(esc(p.title))});}).join(''))}):'')});}
function routineDuration(){let total=0,self=false;for(let id of store.routine){let p=D.practices.find(x=>x.id===id);let n=chooseDuration(p);if(n===null)self=true;else total+=n;}return total?Serein.t("copy_0108",{v0:(durationLabel(total)),v1:(self?Serein.t("copy_0107"):'')}):'Self-paced';}
function patternsHTML(){let list=store.checkins.filter(x=>state.dateFilter==='all'||Date.now()-Date.parse(x.date)<=+state.dateFilter*86400000),counts=[1,2,3,4,5].map(n=>list.filter(x=>x.mood===n).length);return Serein.t("copy_0113",{v0:(list.length),v1:(store.journals.length),v2:(store.savedPractices.length),v3:([['all',Serein.t("copy_0109")],['7',Serein.t("copy_0110")],['30',Serein.t("copy_0111")]].map(([n,l])=>Serein.t("copy_0060",{v0:(n),v1:(state.dateFilter===n?'selected':''),v2:(l)})).join('')),v4:(['Low',Serein.t("copy_0022"),'Okay','Good','Great'].map((l,i)=>Serein.t("copy_0112",{v0:(l),v1:(list.length?counts[i]/list.length*100:0),v2:(counts[i])})).join('')),v5:(entriesHTML(list,'checkin'))});}
function dataHTML(){return Serein.t("copy_0114",{v0:(icon('download')),v1:(icon('upload')),v2:(icoInline())});}
function spaceView(){let body='';if(state.spaceTab==='saved'){let ps=D.practices.filter(p=>store.savedPractices.includes(p.id)),rs=D.resources.filter(r=>store.savedResources.includes(r.id));body=Serein.t("copy_0121",{v0:(state.savedTab==='practices'?'active':''),v1:(ps.length),v2:(state.savedTab==='guides'?'active':''),v3:(rs.length),v4:(state.savedTab==='words'?'active':''),v5:(store.savedWords.length),v6:(state.savedTab==='practices'?(ps.length?Serein.t("copy_0115",{v0:(ps.map(p=>card(p,0)).join(''))}):Serein.t("copy_0116")):state.savedTab==='guides'?(rs.length?Serein.t("copy_0117",{v0:(rs.map(resourceCard).join(''))}):Serein.t("copy_0118")):Serein.t("copy_0099",{v0:(store.savedWords.length?store.savedWords.map((t,i)=>Serein.t("copy_0119",{v0:(esc(t)),v1:(i)})).join(''):Serein.t("copy_0120"))}))});}else if(state.spaceTab==='routine')body=routineHTML();else if(state.spaceTab==='patterns')body=patternsHTML()+advance.insights();else if(state.spaceTab==='reflections')body=entriesHTML(store.journals,'journal');else body=dataHTML()+advance.appHTML();return pageHeader(Serein.t("copy_0122"),Serein.t("copy_0123"),Serein.t("copy_0124"))+Serein.t("copy_0129",{v0:([['saved',Serein.t("copy_0067")],['routine',Serein.t("copy_0125")],['reflections','Reflections'],['patterns',Serein.t("copy_0126")],['data',Serein.t("copy_0127")]].map(([v,l])=>Serein.t("copy_0128",{v0:(v),v1:(state.spaceTab===v?'active':''),v2:(state.spaceTab===v),v3:(l)})).join('')),v1:(body)});}
function supportView(){return pageHeader(Serein.t("copy_0130"),Serein.t("copy_0131"),Serein.t("copy_0132"))+Serein.t("copy_0133",{v0:(icon('arrow')),v1:(D.images.team),v2:(imageTag()),v3:(icon('support')),v4:(icon('heart')),v5:(icon('expand')),v6:(contexts?.supportHTML()||''),v7:(D.resources.filter(r=>['boundaries','peer-check','priorities'].includes(r.id)).map(resourceCard).join('')),v8:(icon('shield')),v9:(quote())});}
function draftStatus(){return !draftStorageOK?Serein.t("copy_0134"):state.draft?Serein.t("copy_0135"):Serein.t("copy_0136");}
function updateDraftStatus(){const el=$('#journal-draft-status');if(el&&el.textContent!==draftStatus())el.textContent=draftStatus();}
function saveDraftNow(){clearTimeout(draftTimer);if(modern){modern.saveDraft(state.draft);return;}try{if(state.draft)sessionStorage.setItem(DRAFT_KEY,state.draft);else sessionStorage.removeItem(DRAFT_KEY);draftStorageOK=true;}catch{draftStorageOK=false;}updateDraftStatus();}
function scheduleDraftSave(){clearTimeout(draftTimer);draftTimer=setTimeout(saveDraftNow,500);}
function clearDraft(){clearTimeout(draftTimer);state.draft='';const el=$('#journal-draft');if(el)el.value='';saveDraftNow();}
function captureDraft(){const el=$('#journal-draft');if(el){state.draft=el.value;saveDraftNow();}}
function render({focus=false}={}){if(modern)return modern.render({focus});captureDraft();$('#main').innerHTML=({today:todayView,practices:practicesView,reflect:reflectView,space:spaceView,support:supportView,studios:advance.studiosView,journeys:advance.journeysView}[state.view]||todayView)();$('#main').classList.remove('page-enter');void $('#main').offsetWidth;$('#main').classList.add('page-enter');$('#breadcrumb').textContent=navigation.find(x=>x[0]===state.view)[1];for(let container of ['#desktop-nav','#mobile-nav'])$(container).innerHTML=navigation.map(([id,label])=>Serein.t("copy_0137",{v0:(id),v1:(state.view===id?'active':''),v2:(state.view===id?'aria-current="page"':''),v3:(icon(id)),v4:(label)})).join('');icons();contexts?.decorate();if(focus)$('#main').focus({preventScroll:true});}
function navigate(view){if(modern)return modern.navigate(view);if(!navigation.some(x=>x[0]===view))view='today';captureDraft();state.view=view;if(location.hash!==Serein.t("copy_0138",{v0:(view)}))history.pushState(null,'',Serein.t("copy_0138",{v0:(view)}));render({focus:true});window.scrollTo({top:0,behavior:'instant'});}
function toast(message,undo){clearTimeout(toastTimer);undoAction=undo||null;$('#toast').innerHTML=Serein.t("copy_0108",{v0:(esc(message)),v1:(undo?Serein.t("copy_0139"):'')});$('#toast').classList.add('show');toastTimer=setTimeout(()=>{$('#toast').classList.remove('show');undoAction=null;},6500);}
function openModal(title,html){html=globalThis.Serein.mediaHTML?globalThis.Serein.mediaHTML(html):html;if(!$('#modal').open)modalReturn=document.activeElement;$('#modal-title').textContent=title;$('#modal-content').innerHTML=html;icons($('#modal'));if(!$('#modal').open)$('#modal').showModal();$('#modal').scrollTop=0;contexts?.decorate();}
function closeModal(){if($('#modal').open)$('#modal').close();}
$('#modal').addEventListener('close',()=>{if(modalReturn?.isConnected&&!$('#player').open&&!$('#search-dialog').open)modalReturn.focus({preventScroll:true});});
function openCheckin(){openModal(Serein.t("copy_0140"),Serein.t("copy_0141",{v0:(moodButtons()),v1:(icon('arrow')),v2:(icoInline())}));}
function saveCheckin(form){if(!state.mood){$('#checkin-error').textContent=Serein.t("copy_0142");return;}let fd=new FormData(form),x={id:uid(),date:new Date().toISOString(),mood:state.mood,energy:String(fd.get('energy')),note:String(fd.get('note')).trim(),moment:D.moments[state.moment].title,persistent:fd.has('persist')};store.checkins.push(x);persist();closeModal();render();toast(x.persistent?Serein.t("copy_0143"):Serein.t("copy_0144"));}
function openResource(id){let r=D.resources.find(x=>x.id===id);if(!r)return;openModal(r.title,Serein.t("copy_0148",{v0:(r.image),v1:(esc(r.imageAlt||Serein.t("copy_0029")+r.title)),v2:(r.label),v3:(r.duration),v4:(esc(r.body)),v5:(contexts?.resourceHTML(id)||''),v6:(r.steps.map(t=>Serein.t("copy_0145",{v0:(esc(t))})).join('')),v7:(esc(r.extra)),v8:(id),v9:(store.savedResources.includes(id)),v10:(icon('bookmark')),v11:(store.savedResources.includes(id)?Serein.t("copy_0146"):Serein.t("copy_0147"))}));}
function settings(){openModal(Serein.t("copy_0149"),Serein.t("copy_0158",{v0:([Serein.t("copy_0005"),'Nurse','Physician',Serein.t("copy_0150"),'Pharmacist',Serein.t("copy_0151"),'Student',Serein.t("copy_0152")].map(x=>Serein.t("copy_0153",{v0:(store.preferences.role===x?'selected':''),v1:(x)})).join('')),v1:([[60,Serein.t("copy_0154")],[120,Serein.t("copy_0155")],[300,Serein.t("copy_0156")]].map(([n,l])=>Serein.t("copy_0060",{v0:(n),v1:(store.preferences.time===n?'selected':''),v2:(l)})).join('')),v2:([['any',Serein.t("copy_0157")],['nonbreath',Serein.t("copy_0058")],['ground',Serein.t("copy_0059")]].map(([n,l])=>Serein.t("copy_0060",{v0:(n),v1:(store.preferences.style===n?'selected':''),v2:(l)})).join('')),v3:(store.preferences.motion?'checked':''),v4:(store.preferences.visual3d?'checked':''),v5:(store.preferences.hideQuotes?'':'checked'),v6:(advance.comfortForm())}));}
function sourcesHTML(){return Serein.t("copy_0160",{v0:(D.sources.map(x=>Serein.t("copy_0159",{v0:(esc(x.url)),v1:(esc(x.title||x.label))})).join(''))});}
function privacy(){openModal(Serein.t("copy_0161"),Serein.t("copy_0162"));}
function workTools(mode='conversation'){openModal(mode==='conversation'?Serein.t("copy_0163"):Serein.t("copy_0164"),Serein.t("copy_0178",{v0:(mode==='conversation'?'active':''),v1:(mode==='transition'?'active':''),v2:(mode),v3:((mode==='conversation'?[[Serein.t("copy_0165"),Serein.t("copy_0166")],[Serein.t("copy_0167"),Serein.t("copy_0168")],[Serein.t("copy_0169"),Serein.t("copy_0170")]]:[[Serein.t("copy_0171"),Serein.t("copy_0172")],[Serein.t("copy_0173"),Serein.t("copy_0174")],[Serein.t("copy_0175"),Serein.t("copy_0176")]]).map(([l,p],i)=>Serein.t("copy_0177",{v0:(i),v1:(l),v2:(i),v3:(i),v4:(p)})).join('')),v4:(icon('arrow'))}));}
function openRoutineBuilder(){openModal(Serein.t("copy_0179"),Serein.t("copy_0181",{v0:(D.practices.map(p=>Serein.t("copy_0180",{v0:(p.id),v1:(store.routine.includes(p.id)?'checked':''),v2:(p.title),v3:(p.category),v4:(durationLabel(chooseDuration(p)))})).join(''))}));}
function beginRoutine(){if(!store.routine.length){openRoutineBuilder();return;}state.routineQueue=[...store.routine];state.routineIndex=0;routineStep();}
function routineStep(){let id=state.routineQueue[state.routineIndex];if(!id){state.routineQueue=[];toast(Serein.t("copy_0182"));return;}let p=D.practices.find(x=>x.id===id);openPractice(id,chooseDuration(p),false,true);}
function nextRoutine(){exitPlayer(false);state.routineIndex++;routineStep();}
function deleteEntry(id,type){let key=type==='journal'?'journals':'checkins',i=store[key].findIndex(x=>x.id===id);if(i<0)return;let [entry]=store[key].splice(i,1);persist();render();toast(Serein.t("copy_0183"),()=>{store[key].splice(i,0,entry);persist();render();toast(Serein.t("copy_0184"));});}
function exportData(){if(modern)return modern.exportDialog();let payload={...store,app:'Serein',version:4,exportedAt:new Date().toISOString(),notice:Serein.t("copy_0185")};download(JSON.stringify(payload,null,2),'Serein-personal-data.json','application/json');toast(Serein.t("copy_0186"));}
function download(content,name,type){const u=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);}
function mergeImport(replace){let incoming=state.importData;if(!incoming)return;store=replace?incoming:{...store,practiceMemory:{...incoming.practiceMemory,...store.practiceMemory},practiceChoices:{...incoming.practiceChoices,...store.practiceChoices},feedback:dedup([...store.feedback,...incoming.feedback]),savedPlans:dedup([...store.savedPlans,...incoming.savedPlans]),journeyProgress:Object.fromEntries(globalThis.Serein.content.journeys.map(j=>[j.id,[...new Set([...(store.journeyProgress[j.id]||[]),...(incoming.journeyProgress[j.id]||[])])]])),checkins:dedup([...store.checkins,...incoming.checkins]),journals:dedup([...store.journals,...incoming.journals]),savedPractices:[...new Set([...store.savedPractices,...incoming.savedPractices])],savedResources:[...new Set([...store.savedResources,...incoming.savedResources])],savedWords:[...new Set([...store.savedWords,...incoming.savedWords])],routine:store.routine.length?store.routine:incoming.routine};state.importData=null;persist();applyPrefs();closeModal();render();toast(replace?Serein.t("copy_0187"):Serein.t("copy_0188"));}
function dedup(xs){return [...new Map(xs.map(x=>[x.id,x])).values()];}
function openSearch(){if(!$('#search-dialog').open)$('#search-dialog').showModal();$('#global-search').value='';searchIndex=-1;search('');setTimeout(()=>$('#global-search').focus(),0);}
function closeSearch(){if($('#search-dialog').open)$('#search-dialog').close();}
function search(query){if(modern)return modern.search(query);let q=query.trim().toLowerCase(),ps=D.practices.filter(x=>Serein.t("copy_0068",{v0:(x.title),v1:(x.desc),v2:(x.category)}).toLowerCase().includes(q)),rs=D.resources.filter(x=>Serein.t("copy_0189",{v0:(x.title),v1:(x.desc)}).toLowerCase().includes(q));if(!q){ps=ps.slice(0,4);rs=rs.slice(0,3);}$('#search-results').innerHTML=(ps.length?Serein.t("copy_0191",{v0:(ps.map(p=>Serein.t("copy_0190",{v0:(p.id),v1:(p.photo),v2:(p.title),v3:(p.category),v4:(p.duration)})).join(''))}):'')+(rs.length?Serein.t("copy_0193",{v0:(rs.map(r=>Serein.t("copy_0192",{v0:(r.id),v1:(r.image),v2:(r.title),v3:(r.duration)})).join(''))}):'')||Serein.t("copy_0194");$('#search-results').insertAdjacentHTML('beforeend',advance.addedSearch(q));searchIndex=-1;}
function toggleFavorite(id){let i=store.savedPractices.indexOf(id);if(i<0)store.savedPractices.push(id);else store.savedPractices.splice(i,1);persist();toast(i<0?Serein.t("copy_0195"):Serein.t("copy_0196"));if($('#player').open)updatePlayerSave();else render();}
function openPractice(id,duration=null,preview=false,fromRoutine=false){let p=D.practices.find(x=>x.id===id);if(!p)return;if(window.HCA&&HCA.locked&&HCA.locked('serein')&&!['tide','ground','desk'].includes(id)){closeModal();closeSearch();state.routineQueue=[];HCA.paywall('serein','this practice');return;}closeModal();closeSearch();if(!fromRoutine)state.routineQueue=[];stopTimer();returnFocus=document.activeElement;state.session=new SessionEngine(p,{duration:duration||chooseDuration(p),noHolds:false});state.preview=preview;state.voice=false;state.present=false;state.visual=p.id==='box'||p.breathFocus&&store.preferences.visual3d?'orb':'photo';lastStep='';lastClock='';$('#player').classList.remove('present');$('#present-button').setAttribute('aria-pressed','false');$('#player-title').textContent=p.title;$('#player-mode-label').textContent=state.routineQueue.length?Serein.t("copy_0197",{v0:(state.routineIndex+1),v1:(state.routineQueue.length)}):preview?Serein.t("copy_0198"):Serein.t("copy_0199");if($('#player-settings').open)$('#player-settings').close();$('#player-feedback').hidden=true;$('#player-settings-content').innerHTML=playerSettings(p);advance.preparePractice(p,duration);$('#player-seek').disabled=p.selfPaced;$('#player-seek').max=String(state.session.duration||1);$('#routine-next').hidden=!state.routineQueue.length;$('#routine-next').textContent=state.routineIndex===state.routineQueue.length-1?Serein.t("copy_0200"):Serein.t("copy_0201");if(!$('#player').open)$('#player').showModal();$('#player .player-scroll').scrollTop=0;icons($('#player'));modern?.preparePlayer();updatePlayer(true);syncPlayerMotion();contexts?.decorate();}
function playerSettings(p){return Serein.t("copy_0213",{v0:(p.selfPaced?'disabled':''),v1:(p.selfPaced?'<option>Self-paced</option>':p.durations.map(n=>Serein.t("copy_0060",{v0:(n),v1:(state.session.duration===n?'selected':''),v2:(durationLabel(n))})).join('')),v2:(p.breathFocus?Serein.t("copy_0209",{v0:(p.id==='box'?Serein.t("copy_0202"):Serein.t("copy_0203")),v1:(p.id==='box'?Serein.t("copy_0204"):Serein.t("copy_0205")),v2:(p.id==='box'?Serein.t("copy_0206"):Serein.t("copy_0207")),v3:(p.id==='box'?Serein.t("copy_0208"):'')}):''),v3:(p.movement?Serein.t("copy_0210"):''),v4:(reduced()?'checked':''),v5:(osMotion?.matches?'disabled':''),v6:(state.visual==='photo'?'selected':''),v7:(p.breathFocus?Serein.t("copy_0211",{v0:(state.visual==='orb'?'selected':'')}):''),v8:(p.id==='scan'?Serein.t("copy_0212"):'')});}
function updatePlayerSave(){let saved=store.savedPractices.includes(state.session.practice.id);$('#player-save').setAttribute('aria-pressed',String(saved));$('#player-save').setAttribute('aria-label',saved?Serein.t("copy_0214"):Serein.t("copy_0215"));$('#player-save').style.color=saved?'var(--teal)':'';}
function getPhoto(p,index){if(state.session.external)return D.frames.awareness[1];if(state.session.relaxOnly&&p.movement)return D.frames.release[3];if(p.id==='release'){let snap=state.session.snapshot();if(snap.state==='complete'||index===3)return D.frames.release[3];let key=['hands','shoulders','feet'][index];return D.frames[key][snap.phaseElapsed<5?(index===0?2:1):3];}let pair=p.photoPlan?.[Math.min(index,p.photoPlan.length-1)];return pair?D.frames[pair[0]][pair[1]]:p.photo;}
function updatePlayer(force=false){const e=state.session;if(!e||!$('#player').open)return;let s=e.snapshot(),p=e.practice,key=Serein.t("copy_0216",{v0:(s.index),v1:(s.title),v2:(e.external),v3:(e.relaxOnly),v4:(s.state)});if(key!==lastStep||force){$('#player-step-label').textContent=s.state==='complete'?Serein.t("copy_0217"):p.breathFocus?Serein.t("copy_0218"):Serein.t("copy_0219",{v0:(s.index+1),v1:(p.steps.length)});$('#player-phase').textContent=s.title;$('#player-cue').textContent=globalThis.SereinPlayer?SereinPlayer.cue(s):s.cue;$('#player-photo').src=globalThis.Serein.mediaURL(getPhoto(p,s.index));$('#player-photo').alt=p.photoPlan?Serein.t("copy_0220",{v0:(p.steps[s.index]?.[0]||p.title)}):(p.cardAlt||Serein.t("copy_0221"));$('#stage-corner').textContent=p.breathFocus?Serein.t("copy_0222"):Serein.t("copy_0223",{v0:(s.index+1),v1:(p.steps.length),v2:(p.steps[s.index]?.[0]||'Rest')});const strip=$('#player-step-list'),phases=e.phases();if(strip.children.length!==phases.length||strip.dataset.practice!==p.id){strip.dataset.practice=p.id;strip.innerHTML=phases.map((x,i)=>Serein.t("copy_0224")+i+'" aria-label="Step '+(i+1)+': '+esc(x.title)+'">'+(i+1)+'</button>').join('');}for(const [i,button] of [...strip.children].entries()){button.setAttribute('aria-current',s.index===i?'step':'false');}if(p.selfPaced&&s.state!=='complete'){let count=D.groundSteps[s.index].count;const host=$('#ground-noticing');if(host.children.length!==count)host.innerHTML=Array.from({length:count},(_,i)=>Serein.t("copy_0225")+i+Serein.t("copy_0226")+(i+1)+'"></button>').join('');for(const [i,b] of [...host.children].entries()){b.setAttribute('aria-pressed',String(e.noticed.has(i)));b.textContent=e.noticed.has(i)?'✓':String(i+1);};}else $('#ground-noticing').innerHTML='';if(state.voice&&s.state==='playing'&&!state.preview)speak(s.cue);lastStep=key;}
 let clock=e.practice.selfPaced?Serein.t("copy_0227",{v0:(s.index+1),v1:(p.steps.length)}):formatTime(s.remaining),current=Math.ceil(e.elapsed);if(clock!==lastClock||force){$('#player-clock').textContent=clock;$('#player-seek').value=String(current);$('#player-seek').setAttribute('aria-valuetext',Serein.t("copy_0228",{v0:(formatTime(e.elapsed)),v1:(formatTime(e.duration))}));lastClock=clock;}
 $('#player-play').innerHTML=icon(s.state==='playing'?'pause':'play')+Serein.t("copy_0235",{v0:(s.state==='complete'?Serein.t("copy_0229"):p.selfPaced&&s.state==='playing'?Serein.t("copy_0230"):s.state==='playing'?Serein.t("copy_0231"):state.preview?Serein.t("copy_0232"):s.state==='paused'?Serein.t("copy_0233"):Serein.t("copy_0234"))});
 $('#player-next').hidden=p.breathFocus||s.state==='complete';$('#player-status').textContent=s.state==='complete'?Serein.t("copy_0236"):s.state==='paused'?Serein.t("copy_0237"):state.preview?Serein.t("copy_0238"):p.id==='walk'&&s.index>0?Serein.t("copy_0239"):Serein.t("copy_0240");
 $('#player-feedback').hidden=s.state!=='complete'||state.preview;if($('#session-before'))$('#session-before').disabled=s.state!=='ready';$('#preview-continue').hidden=!state.preview;for(let id of ['session-duration','session-pace','session-noholds'])if($('#'+id))$('#'+id).disabled=s.state==='playing'||p.selfPaced;
 updatePlayerSave();applyPlayerVisual();updateBoxVisual(s);advance.updateStage(s);modern?.playerUpdated(s);globalThis.SereinPlayer?.update(s,force);if(s.state==='complete'){stopTimer();if(orb)orb.stop();if(globalThis.SereinPlayer)SereinPlayer.complete(s);else cancelVoice();}
}
function applyPlayerVisual(){let e=state.session;if(!e)return;let text=state.visual==='text';$('#player-stage').hidden=text;$('#player-photo').hidden=state.visual==='orb';$('#orb-stage').hidden=state.visual!=='orb';$('#player-orb-legend').hidden=state.visual!=='orb'||e.practice.id==='box';$('#orb-stage').classList.toggle('box-mode',e.practice.id==='box');if($('#box-guide'))$('#box-guide').hidden=e.practice.id!=='box';$('#player-scroll').classList.toggle('text-focus',text);$('#player-media-label').textContent=state.visual==='orb'?Serein.t("copy_0241"):Serein.t("copy_0242");}
function updateBoxVisual(s){
 const e=state.session;if(!e||e.practice.id!=='box')return;
 let box=$('#box-guide');if(!box){box=document.createElement('div');box.id='box-guide';box.innerHTML=Serein.t("copy_0243");$('#orb-stage').appendChild(box);}
 const phase=e.phases()[s.index],still=reduced()||$('#session-motion')?.checked,t=still?0:s.progress;
 const positions=[[t*100,0],[100,t*100],[100-t*100,100],[0,100-t*100]];
 // No-holds mode covers half the perimeter per breath, avoiding corner jumps.
 const distance=(s.index+t)*2,side=Math.floor(distance)%4,u=distance%1;
 const continuous=[[u*100,0],[100,u*100],[100-u*100,100],[0,100-u*100]];
 const [x,y]=e.noHolds?continuous[side]:positions[s.index];
 const marker=box.querySelector('.box-marker');marker.style.left=x+'%';marker.style.top=y+'%';marker.hidden=false;box.hidden=false;box.dataset.edge=String(e.noHolds?side:s.index);box.dataset.phase=String(s.index);box.dataset.playing=String(s.state==='playing'&&!still);marker.setAttribute('aria-hidden','true');
 box.querySelector('strong').textContent=s.state==='complete'?Serein.t("copy_0244"):s.title;
 box.querySelector('span').textContent=s.state==='complete'?'':Math.max(1,Math.ceil(phase.seconds-s.phaseElapsed));
 box.querySelector('small').textContent=s.state==='playing'?Serein.t("copy_0245"):s.state==='paused'?Serein.t("copy_0246"):s.state==='complete'?Serein.t("copy_0247"):Serein.t("copy_0248");
}
let boxFrame=0;
function animateBoxBall(){
 cancelAnimationFrame(boxFrame);boxFrame=0;
 const e=state.session;if(!e||e.practice.id!=='box'||e.state!=='playing'||!$('#player').open||state.visual!=='orb'||reduced()||$('#session-motion')?.checked)return;
 e.tick(performance.now());updateBoxVisual(e.snapshot());
 boxFrame=requestAnimationFrame(animateBoxBall);
}
function syncPlayerMotion(){cancelAnimationFrame(boxFrame);boxFrame=0;if(!state.session||!$('#player').open)return;const still=$('#session-motion')?.checked||reduced();if(state.visual!=='orb'){orb?.stop();return;}if(state.session.practice.id==='box'){orb?.stop();updateBoxVisual(state.session.snapshot());animateBoxBall();return;}if(!orb)orb=new globalThis.Serein.Orb($('#orb-canvas'),$('#fallback-orb'));orb.reduced=still;if(state.visual==='orb'&&state.session.state==='playing'&&!still)orb.start(()=>state.session.tick(performance.now()));else{orb.stop();orb.draw(still?.85:state.session.snapshot().scale,state.session.elapsed);}}
function startTimer(){clearInterval(timer);if(!state.session.practice.selfPaced)timer=setInterval(()=>{state.session.tick(performance.now());updatePlayer();},100);syncPlayerMotion();}
function stopTimer(){cancelAnimationFrame(boxFrame);boxFrame=0;clearInterval(timer);timer=0;orb?.stop();}
function pausePlayer(){const e=state.session;if(!e||e.state!=='playing')return;e.pause();stopTimer();cancelVoice();updatePlayer(true);syncPlayerMotion();}
function restartPlayer(){modern?.stopPlayer();state.session.restart();stopTimer();cancelVoice();advance.resetFeedback();if($('#session-before'))$('#session-before').value='';modern?.preparePlayer();updatePlayer(true);syncPlayerMotion();}
function playPause(){modern?.player.cancelCountdown();let e=state.session;if(!e)return;if(e.state==='complete')restartPlayer();advance.rememberPractice();advance.onPlay();if(advance.sessionMeta&&e.state==='ready')advance.sessionMeta.before=+$('#session-before')?.value||null;if(e.practice.selfPaced&&e.state==='playing'){e.next();updatePlayer(true);return;}if(e.state==='playing'){e.pause();stopTimer();cancelVoice();}else{e.play();startTimer();}updatePlayer(true);syncPlayerMotion();}
function exitPlayer(endRoutine=true){if(state.session?.state==='playing')state.session.pause();modern?.stopPlayer();stopTimer();cancelVoice();$('#player').close();if(endRoutine)state.routineQueue=[];state.present=false;$('#player').classList.remove('present');if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});render();}
function cancelVoice(){try{if(globalThis.SereinPlayer)SereinPlayer.silence();else speechSynthesis.cancel();}catch{}}
function speak(text){if(globalThis.SereinPlayer||!state.voice)return;try{let voices=speechSynthesis.getVoices(),voice=voices.find(v=>v.localService&&v.voiceURI===store.preferences.voiceURI)||voices.find(v=>v.localService&&/^en-GB/i.test(v.lang))||voices.find(v=>v.localService&&/^en/i.test(v.lang));if(!voice){state.voice=false;$('#session-voice').checked=false;toast(Serein.t("copy_0249"));return;}speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(text);u.voice=voice;u.rate=store.preferences.voiceRate||.86;speechSynthesis.speak(u);}catch{state.voice=false;toast(Serein.t("copy_0250"));}}
$('#player').addEventListener('cancel',e=>{e.preventDefault();exitPlayer();});
$('#player-seek').addEventListener('input',event=>{if(!state.session)return;state.session.seek(+event.target.value);updatePlayer(true);syncPlayerMotion();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.session?.state==='playing'){state.session.pause();stopTimer();cancelVoice();updatePlayer(true);}});
window.addEventListener('resize',()=>{if($('#player').open)syncPlayerMotion();});
const actions={
 'quick-start':()=>{let p=recommend();if(p)openPractice(p.id,chooseDuration(p,store.preferences.time));else advance.handle({dataset:{adv:'finder'}});},settings,search:openSearch,'close-search':closeSearch,'close-modal':closeModal,checkin:openCheckin,'open-guides':()=>{state.tab='guides';navigate('practices');},'work-tools':()=>workTools(),'transition-tools':()=>workTools('transition'),'reflection-history':()=>{state.spaceTab='reflections';navigate('space');},'data-page':()=>{closeModal();state.spaceTab='data';navigate('space');},privacy,sources:()=>advance.sourceInfo(),'routine-builder':openRoutineBuilder,'start-routine':beginRoutine,
 'reset-filters':()=>{state.budget=0;state.style='any';state.position='any';state.category='All';state.query='';render();},
 'next-quote':()=>{state.quote=(state.quote+1)%advance.quoteCount();render();},'save-word':()=>{let t=advance.quoteText(state.quote),i=store.savedWords.indexOf(t);if(i<0)store.savedWords.push(t);else store.savedWords.splice(i,1);persist();render();toast(i<0?Serein.t("copy_0251"):Serein.t("copy_0252"));},
 'copy-draft':async()=>{let text=$('#work-output').value;if(!text){$('#copy-note').textContent=Serein.t("copy_0253");return;}try{await navigator.clipboard.writeText(text);$('#copy-note').textContent=Serein.t("copy_0254");}catch{$('#work-output').focus();$('#work-output').select();$('#copy-note').textContent=Serein.t("copy_0255");}},
 export:exportData,import:()=>$('#import-file').click(),'import-merge':()=>mergeImport(false),'import-replace':()=>mergeImport(true),
 'clear-data':()=>openModal(Serein.t("copy_0256"),Serein.t("copy_0257")),
 'confirm-clear':()=>{store=structuredClone(defaults);clearDraft();state.mood=0;state.budget=120;state.style='any';try{localStorage.removeItem('serein-hca-v3');localStorage.removeItem('serein-demo-v1');}catch{}closeModal();applyPrefs();render();toast(Serein.t("copy_0258"));},undo:()=>{let f=undoAction;undoAction=null;f?.();},
 about:()=>openModal(Serein.t("copy_0259"),Serein.t("copy_0260",{v0:(D.practices.length)})),
 'shared-practice':()=>openModal(Serein.t("copy_0261"),Serein.t("copy_0262")),
 'use-preview':()=>{state.preview=false;state.session.restart();stopTimer();$('#player-mode-label').textContent=Serein.t("copy_0199");updatePlayer(true);syncPlayerMotion();},'play-player':playPause,'exit-player':()=>exitPlayer(),'restart-player':restartPlayer,'next-step':()=>{state.session.next();updatePlayer(true);syncPlayerMotion();},'save-player':()=>toggleFavorite(state.session.practice.id),'routine-next':nextRoutine,
 present:()=>{state.present=!state.present;$('#player').classList.toggle('present',state.present);$('#present-button').setAttribute('aria-pressed',String(state.present));syncPlayerMotion();}
};
document.addEventListener('click',event=>{
 const b=event.target.closest('button,a[data-action]');if(!b)return;const d=b.dataset;
 if(d.adv){event.preventDefault();closeSearch();advance.handle(b).catch(()=>toast(Serein.t("copy_0263")));return;}
 if(d.nav){navigate(d.nav);return;}if(d.action){event.preventDefault();actions[d.action]?.();return;}
 if(d.preview){openPractice(d.preview,+d.duration||null,true);return;}if(d.practice){openPractice(d.practice,+d.duration||null);return;}if(d.resource){openResource(d.resource);return;}if(d.searchPractice){closeSearch();openPractice(d.searchPractice);return;}if(d.searchResource){closeSearch();openResource(d.searchResource);return;}
 if(d.moment!==undefined){state.moment=+d.moment;render();return;}
 if(d.mood){state.mood=+d.mood;$$('[data-mood]').forEach(el=>{el.classList.toggle('selected',+el.dataset.mood===state.mood);el.setAttribute('aria-pressed',String(+el.dataset.mood===state.mood));});return;}
 if(d.budget!==undefined){state.budget=d.budget==='self'?'self':+d.budget;render();return;}
 if(d.category){state.category=d.category;render();return;}if(d.guideCategory){state.guideCategory=d.guideCategory;render();return;}if(d.tab){state.tab=d.tab;render();return;}if(d.spaceTab){state.spaceTab=d.spaceTab;render();return;}if(d.savedTab){state.savedTab=d.savedTab;render();return;}
 if(d.savePractice){toggleFavorite(d.savePractice);return;}if(d.saveResource){let i=store.savedResources.indexOf(d.saveResource);if(i<0)store.savedResources.push(d.saveResource);else store.savedResources.splice(i,1);persist();openResource(d.saveResource);return;}
 if(d.prompt!==undefined){if(state.draft.trim()){toast(Serein.t("copy_0264"));return;}state.draft=[Serein.t("copy_0265"),Serein.t("copy_0266"),Serein.t("copy_0267")][+d.prompt];$('#journal-draft').value=state.draft;scheduleDraftSave();$('#journal-draft').focus();return;}
 if(d.toolMode){workTools(d.toolMode);return;}
 if(d.removeWord!==undefined){store.savedWords.splice(+d.removeWord,1);persist();render();return;}
 if(d.routineMove!==undefined){let i=+d.routineMove,j=i+(+d.direction);if(j>=0&&j<store.routine.length)[store.routine[i],store.routine[j]]=[store.routine[j],store.routine[i]];persist();render();return;}
 if(d.routineRemove!==undefined){store.routine.splice(+d.routineRemove,1);persist();render();return;}
 if(d.deleteEntry){deleteEntry(d.deleteEntry,d.entryType);return;}
 if(d.keepEntry){let xs=d.entryType==='journal'?store.journals:store.checkins,x=xs.find(e=>e.id===d.keepEntry);if(x){openModal(Serein.t("copy_0268"),Serein.t("copy_0269",{v0:(esc(x.id)),v1:(d.entryType)}));}return;}
 if(d.confirmKeep){let x=(d.entryType==='journal'?store.journals:store.checkins).find(x=>x.id===d.confirmKeep);if(x)x.persistent=true;persist();closeModal();render();return;}
 if(d.editJournal){let x=store.journals.find(x=>x.id===d.editJournal);state.editing=x.id;openModal(Serein.t("copy_0270"),Serein.t("copy_0273",{v0:(esc(x.text)),v1:(x.persistent?Serein.t("copy_0271"):Serein.t("copy_0272"))}));return;}
 if(d.playerStep!==undefined){state.session.jump(+d.playerStep);updatePlayer(true);syncPlayerMotion();return;}
 if(d.noticed!==undefined){let e=state.session,i=+d.noticed;if(e.state==='ready'){e.play();}if(e.noticed.has(i))e.noticed.delete(i);else e.noticed.add(i);lastStep='';updatePlayer(true);return;}
});
document.addEventListener('input',event=>{let e=event.target;if(e.id==='journal-draft'){state.draft=e.value;scheduleDraftSave();}if(e.id==='practice-query'){state.query=e.value;$('#practice-results').innerHTML=practiceResults();}if(e.id==='guide-query'){state.guideQuery=e.value;$('#guide-results').innerHTML=guidesResults();}if(e.id==='global-search')search(e.value);});
document.addEventListener('change',event=>{let el=event.target;advance.onChange(el);if(el.id==='practice-style'){state.style=el.value;$('#practice-results').innerHTML=practiceResults();}if(el.id==='practice-position'){state.position=el.value;$('#practice-results').innerHTML=practiceResults();}if(el.id==='date-filter'){state.dateFilter=el.value;render();}if(!state.session||!$('#player').open)return;let e=state.session;
 if(el.id==='session-duration'&&e.state!=='playing'){e.duration=+el.value;e.restart();$('#player-seek').max=el.value;}
 if(el.id==='session-pace'&&e.state!=='playing'){e.pace=el.value;e.restart();}
 if(el.id==='session-noholds'&&e.state!=='playing'){e.noHolds=el.checked;e.restart();}
 if(el.id==='session-external')e.external=el.checked;if(el.id==='session-relax')e.relaxOnly=el.checked;if(el.id==='session-visual')state.visual=el.value;
 if(el.id==='session-voice'){state.voice=el.checked;if(state.voice&&e.state==='playing')speak(e.snapshot().cue);else cancelVoice();}
 advance.rememberPractice();updatePlayer(true);syncPlayerMotion();
});
document.addEventListener('submit',event=>{const f=event.target;if(!(f instanceof HTMLFormElement))return;event.preventDefault();
 if(f.id==='reminder-form'){advance.makeReminder(f);return;}
 if(f.id==='checkin-form'){saveCheckin(f);return;}
 if(f.id==='preferences-form'){let fd=new FormData(f);store.preferences={...store.preferences,...advance.comfortValues(fd),role:String(fd.get('role')),time:+fd.get('time'),style:String(fd.get('style')),motion:fd.has('motion'),visual3d:fd.has('visual3d'),hideQuotes:!fd.has('quotes')};state.budget=store.preferences.time;state.style=store.preferences.style;persist();applyPrefs();closeModal();render();toast(Serein.t("copy_0274"));return;}
 if(f.id==='journal-form'){let text=$('#journal-draft').value.trim();if(!text){toast(Serein.t("copy_0275"));$('#journal-draft').focus();return;}let fd=new FormData(f),persistent=fd.has('persist');store.journals.push({id:uid(),date:new Date().toISOString(),text,persistent});clearDraft();persist();render();toast(persistent?Serein.t("copy_0276"):Serein.t("copy_0277"));return;}
 if(f.id==='edit-journal-form'){let x=store.journals.find(x=>x.id===state.editing),text=String(new FormData(f).get('text')).trim();if(!text){toast(Serein.t("copy_0278"));return;}x.text=text;persist();closeModal();render();toast(Serein.t("copy_0279"));return;}
 if(f.id==='routine-form'){let selected=new FormData(f).getAll('practice');if(!selected.length||selected.length>4){$('#routine-error').textContent=Serein.t("copy_0280");return;}store.routine=[...store.routine.filter(x=>selected.includes(x)),...selected.filter(x=>!store.routine.includes(x))];persist();closeModal();state.spaceTab='routine';navigate('space');toast(Serein.t("copy_0281"));return;}
 if(f.id==='work-form'){let fd=new FormData(f),v=[0,1,2].map(i=>String(fd.get('field'+i)).trim());if(v.some(x=>!x))return;$('#work-output').value=f.dataset.mode==='conversation'?Serein.t("copy_0282",{v0:(v[0]),v1:(v[1]),v2:(v[2])}):Serein.t("copy_0283",{v0:(v[0]),v1:(v[1]),v2:(v[2])});$('#copy-note').textContent=Serein.t("copy_0284");}
});
$('#import-file').addEventListener('change',async event=>{const f=event.target.files[0];if(!f)return;try{if(f.size>8*1024*1024)throw Error(Serein.t("copy_0285"));state.importData=normalizeImport(JSON.parse(await f.text()));let x=state.importData;openModal(Serein.t("copy_0286"),Serein.t("copy_0287",{v0:(x.checkins.length),v1:(x.journals.length),v2:(x.savedPractices.length),v3:(x.feedback.length),v4:(x.savedPlans.length)}));}catch(error){toast(error.message||Serein.t("copy_0288"));}event.target.value='';});
document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(!$('#player').open)openSearch();}if($('#search-dialog').open&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();let list=$$('.search-result');if(!list.length)return;searchIndex=(searchIndex+(event.key==='ArrowDown'?1:-1)+list.length)%list.length;list[searchIndex].focus();}});
window.addEventListener('pagehide',saveDraftNow);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){captureDraft();saveDraftNow();}});
window.addEventListener('beforeunload',event=>{captureDraft();saveDraftNow();if(modern?.vault.pending||state.draft.trim()&&!draftStorageOK){event.preventDefault();event.returnValue='';}});
advance=globalThis.Serein.toolsFactory.create({D,state,$,$$,esc,icon,openModal,closeModal,toast,persist,render,navigate,openPractice,download,chooseDuration,matchPractices,durationLabel,uid,reduced,get store(){return store;}});advance.initialize();
contexts=globalThis.Serein.contextFactory.create({D,A:globalThis.Serein.content,state,esc,$,$$,get store(){return store;}});contexts.initialize();
modern=globalThis.Serein.createModern({
 D,A:globalThis.Serein.content,state,$,$$,esc,icon,icons,uid,normalise:normalizeImport,get store(){return store;},setStore:value=>store=value,resetStore:()=>store=structuredClone(defaults),
 get advance(){return advance;},get contexts(){return contexts;},recovery:()=>recoveryRaw,clearRecovery:()=>recoveryRaw=null,captureDraft,clearDraft,draftStorageStatus:ok=>{draftStorageOK=ok;updateDraftStatus();},clearUndo:()=>{undoAction=null;$('#toast').classList.remove('show');},
 toast,openModal,closeModal,openSearch,closeSearch,openResource,openCheckin,openPractice,updatePlayer,syncPlayerMotion,playPause,pausePlayer,exitPlayer,restart:()=>actions['restart-player'](),present:()=>actions.present(),
 privacy,workTools,quote,moodButtons,filterOptions,practiceResults,guidesResults,reflectView,spaceView,supportView,dataHTML,entriesHTML,toggleFavorite,chooseDuration,durationLabel,recommend,reduced,download
});
modern.initialise();
$('#year').textContent=new Date().getFullYear();$('#app-version').textContent=APP_VERSION;document.querySelector('meta[name="serein-version"]').setAttribute('content',APP_VERSION);applyPrefs();render();if(recoveryRaw)setTimeout(()=>toast(Serein.t("copy_0289")),30);if(migrated)toast(Serein.t("copy_0290"));
globalThis.Serein.app={version:APP_VERSION,state,get store(){return store;},navigate,openPractice,openResource,normalizeImport,recommend,render,get advance(){return advance;},get contexts(){return contexts;},get modern(){return modern;}};
globalThis.Serein.store={get model(){return store;},normalise:normalizeImport,persist,get vault(){return modern.vault;}};globalThis.Serein.player={open:openPractice,update:updatePlayer,playPause,exit:exitPlayer,get engine(){return state.session;}};globalThis.Serein.ui={openModal,closeModal,toast,icon,esc};globalThis.Serein.studios=advance;globalThis.Serein.journeys=advance;if(new URLSearchParams(location.search).has('selftest'))setTimeout(()=>modern.selftest(),20);
})();


;
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

;
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

;
/* Serein first visit: one guided breath, then "How are you arriving?" with a matched one-minute practice.
   Runs before the welcome steps; every screen can be skipped. The chosen mood is kept as the first check-in, through the app's own quick check-in. */
(function(S){
'use strict';
const MOODS=[
 {label:'Low',curve:10,practice:'ground',duration:null,line:'Thank you for being honest. Let’s keep this very gentle and look outward, at your own pace.'},
 {label:'A little low',curve:12,practice:'tide',duration:60,line:'That makes sense. A soft minute of slower breathing can make a little room.'},
 {label:'Okay',curve:15,practice:'desk',duration:null,line:'A steady place to start. A short seated reset can loosen what the day has gathered.'},
 {label:'Good',curve:19,practice:'tide',duration:60,line:'Lovely. One easy minute of breathing helps you keep that steadiness for later.'},
 {label:'Great',curve:21,practice:'desk',duration:null,line:'Wonderful. A quick seated reset helps you carry that energy with care.'}
];
const BREATHS=3,IN=4000,OUT=6000;
let dialog=null,timers=[],ctx=null,chosen=null;
const reduced=()=>{try{return S.a11y?.reducedMotion?.()||matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{return false;}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title=id=>(S.data?.practices||[]).find(p=>p.id===id)?.title||'A short practice';
function clear(){timers.forEach(clearTimeout);timers=[];}
function later(fn,ms){timers.push(setTimeout(fn,ms));}
function face(curve){return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 9h.01 M16 9h.01 M7 15 Q12 ${curve} 17 15"/></svg>`;}
function shell(inner,step){const crest=document.querySelector('.brand img')?.getAttribute('src');dialog.dataset.step=step;dialog.innerHTML=`<div class="sh-inner"><header class="sh-head"><span class="sh-brand">${crest?`<img src="${esc(crest)}" alt="" width="36" height="36">`:''}<span>SEREIN<small>HEALTHCARE CROWN ACADEMY</small></span></span><button type="button" class="sh-skip" data-sh="skip">Skip</button></header>${inner}</div>`;}
function breathe(){clear();const still=reduced();
 shell(`<div class="sh-breath ${still?'is-still':''}"><p class="sh-eyebrow">BEFORE ANYTHING ELSE</p><h2 id="sh-title">Let’s take three easy breaths together.</h2><div class="sh-orb" aria-hidden="true"><span class="sh-orb-ring"></span><span class="sh-orb-core"></span></div><p class="sh-cue" id="sh-cue" aria-live="polite">${still?'Breathe in gently through your nose… then let the breath go slowly. Take as long as you like.':'Get comfortable. Eyes can stay open.'}</p><p class="sh-count" id="sh-count">${still?'':'Three slow breaths · about 30 seconds'}</p><div class="sh-actions"><button type="button" class="button button-teal" data-sh="mood">${still?'I’m ready':'Continue when ready'}</button></div></div>`,'breath');
 dialog.querySelector('[data-sh="mood"]').focus({preventScroll:true});
 if(still)return;
 const orb=dialog.querySelector('.sh-orb'),cue=dialog.querySelector('#sh-cue'),count=dialog.querySelector('#sh-count');
 const cycle=n=>{if(n>=BREATHS){cue.textContent='Well done. That was a small pause, and it counts.';count.textContent='';orb.className='sh-orb is-rest';later(mood,2200);return;}
  count.textContent='Breath '+(n+1)+' of '+BREATHS;cue.textContent='Breathe in…';orb.className='sh-orb is-in';
  later(()=>{cue.textContent='…and let it go, slowly.';orb.className='sh-orb is-out';},IN);later(()=>cycle(n+1),IN+OUT);};
 later(()=>cycle(0),1600);}
function mood(){clear();chosen=null;
 shell(`<div class="sh-mood"><p class="sh-eyebrow">A QUICK, PRIVATE CHECK-IN</p><h2 id="sh-title">How are you arriving today?</h2><p class="sh-lead">There is no right answer. Serein will suggest one short practice that fits.</p><div class="mood-row sh-moods" role="group" aria-labelledby="sh-title">${MOODS.map((m,i)=>`<button type="button" class="mood" data-sh="pick" data-i="${i}" aria-pressed="false"><span class="mood-face">${face(m.curve)}</span>${esc(m.label)}</button>`).join('')}</div><div id="sh-suggest" class="sh-suggest" aria-live="polite"></div><p class="sh-privacy"><span aria-hidden="true">🔒</span> Private by design. This answer never leaves your device, nothing is sent to an employer, and nothing is monitored.</p><div class="sh-actions sh-secondary"><button type="button" class="text-button" data-sh="setup">Set up my space first →</button></div></div>`,'mood');
 dialog.querySelector('.sh-moods .mood')?.focus({preventScroll:true});}
function pick(i){chosen=MOODS[i];dialog.querySelectorAll('.sh-moods .mood').forEach((b,j)=>{b.classList.toggle('selected',j===i);b.setAttribute('aria-pressed',String(j===i));});
 dialog.querySelector('#sh-suggest').innerHTML=`<p>${esc(chosen.line)}</p><div class="sh-practice"><span class="sh-eyebrow">SUGGESTED FOR YOU</span><strong>${esc(title(chosen.practice))}</strong><button type="button" class="button button-teal" data-sh="begin">Begin this practice <span aria-hidden="true">→</span></button></div>`;}
function close(){clear();if(dialog?.open)dialog.close();dialog?.remove();dialog=null;}
function tap(data){const b=document.createElement('button');b.type='button';b.hidden=true;Object.assign(b.dataset,data);document.body.append(b);b.click();b.remove();}
function begin(){const m=chosen;close();ctx.finish();if(!m)return;setTimeout(()=>{
 // Keep the answer as the first check-in through Today's own quick check-in (mood 1-5).
 try{tap({mood:String(MOODS.indexOf(m)+1)});}catch{}
 const d={practice:m.practice};if(m.duration)d.duration=String(m.duration);tap(d);
 // "Begin this practice" already said begin: start playback without a second tap.
 setTimeout(()=>{try{if(S.player?.engine?.state==='ready')S.player.playPause();}catch{}},80);
},60);}
function run(c){ctx=c;try{dialog=document.createElement('dialog');dialog.className='serein-hook';dialog.setAttribute('aria-labelledby','sh-title');document.body.append(dialog);
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();ctx.onboard();});
 dialog.addEventListener('click',e=>{const b=e.target.closest('[data-sh]');if(!b)return;e.stopPropagation();const a=b.dataset.sh;
  if(a==='skip'||a==='setup'){close();ctx.onboard();}else if(a==='mood')mood();else if(a==='pick')pick(+b.dataset.i);else if(a==='begin')begin();});
 dialog.showModal();breathe();}catch{close();c.onboard();}}
S.hook={run};
})(globalThis.Serein=globalThis.Serein||{});

;
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

;
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

;
/* Serein guided practice: the player controller.
 * Sits on top of the existing practice engine (Serein.player.engine) and the player markup:
 *   - a voice guide with a scripted line for every step (src/player-voice.js), spoken by the best voice on the device
 *   - captions and an instruction timeline on the stage, and a step rail beside the step panel in text view
 *   - quick Voice / Music / Breath-sound controls on the player controls
 *   - 3D lungs for the breathing tide (src/lungs3d.js), synthesised breath sounds and soft music (src/player-audio.js)
 * It is driven by calls from updatePlayer (see the patches in build-web.mjs); nothing starts until a practice is playing. */
(function (g) {
  'use strict';
  const V = g.SereinVoice, A = g.SereinAudio;
  const doc = document;
  const $ = (s, r) => (r || doc).querySelector(s);
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'serein-player-v1';
  const canSpeak = !!(g.speechSynthesis && g.SpeechSynthesisUtterance);
  const canSound = !!(g.AudioContext || g.webkitAudioContext);

  /* ---- the person's choices (own key; voice choice and speed live in the app's preferences) ---- */
  const DEFAULTS = { voice: true, music: true, breath: true, musicVol: 0.55, breathVol: 0.6 };
  const prefs = Object.assign({}, DEFAULTS);
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { /* storage unavailable: defaults apply */ }
  function savePrefs() { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* ignore */ } }

  const appPrefs = () => { try { return g.Serein.store.model.preferences || {}; } catch { return {}; } };
  const app = () => g.Serein && g.Serein.app;
  const engine = () => g.Serein && g.Serein.player && g.Serein.player.engine;
  const toast = m => { try { g.Serein.ui.toast(m); } catch { /* ignore */ } };

  /* ---- voice ---- */
  const audio = A && A.engine;
  const narrator = V && new V.Narrator({
    getVoice: () => canSpeak ? V.pick(g.speechSynthesis.getVoices(), appPrefs().voiceURI) : null,
    getRate: () => appPrefs().voiceRate || 0.88,
    onSpeaking: on => { if (audio) audio.duck(on); },
    onUtter: item => { if (!item.single) { P.sub = item.text; paintCaption(); } },
    onFail: err => { if (err === 'not-allowed' && !P.warned) { P.warned = true; toast('Your browser blocked the voice. Tap Voice off and on to try again.'); } }
  });

  /* ---- state of the running practice ---- */
  const P = {
    engine: null, plan: null, mode: '', visit: null, introDone: false, outroDone: false, caption: '', phaseKey: '', counts: [], lastState: '', lastWall: 0, selfClock: 0,
    muted: false, dom: null, ui: {}, outroTimer: 0, musicOn: false, sig: '', warned: false, sub: '', subQ: [], subEnd: 0, lastCycle: -1
  };
  const eff = {
    get voice() { return prefs.voice && canSpeak && !P.muted; },
    get music() { return prefs.music && canSound && !P.muted; },
    get breath() { return prefs.breath && canSound && !P.muted; }
  };
  const isBreath = () => !!(P.plan && P.plan.kind === 'breath');
  const preview = () => { const a = app(); return !!(a && a.state && a.state.preview); };

  const kindOf = title => /out/i.test(title) ? 'out' : /hold/i.test(title) ? 'hold' : /rest/i.test(title) ? 'rest' : 'in';
  const fmt = n => { n = Math.max(0, Math.round(n)); return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0'); };
  const fmtShort = n => n < 60 ? Math.round(n) + 's' : fmt(n);

  /* ---- say something: caption always, voice when on ---- */
  /* The line for this moment: shown in full in the step panel (and read by screen readers). */
  function line(text) {
    if (!text) return;
    P.caption = text;
    paintCaption();
  }
  /* Say something: spoken when the voice is on, and always shown as subtitles on the stage, a sentence at a time. */
  function say(text, o) {
    if (!text || preview()) return;
    if (eff.voice && narrator && narrator.available) narrator.say(text, o);
    else queueSubs(V.splitSentences(text));
  }
  function queueSubs(parts) {
    const now = performance.now(), rate = appPrefs().voiceRate || 0.88;
    let t = Math.max(now, P.subEnd || 0);
    for (const p of parts) { const d = (V.speakSeconds(p.text, rate) + p.gap / 1000) * 1000; P.subQ.push({ text: p.text, start: t }); t += d; }
    P.subEnd = t;
    pumpSubs();
  }
  function pumpSubs() {
    if (!P.subQ.length) return;
    const now = performance.now(); let changed = false;
    while (P.subQ.length && P.subQ[0].start <= now) { P.sub = P.subQ.shift().text; changed = true; }
    if (changed) paintCaption();
  }
  function clearSubs() { P.subQ = []; P.subEnd = 0; }
  const firstSentence = t => { const m = String(t || '').match(/^[^.!?…]+[.!?…]?/); return m ? m[0].trim() : ''; };

  /* ---- plan & session lifecycle ---- */
  function modeKey(e) { return (e.relaxOnly ? 'r' : '') + (e.external ? 'x' : '') + (e.noHolds ? 'n' : ''); }
  function ensurePlan(e) {
    const key = modeKey(e);
    if (!P.plan || P.mode !== key) { P.plan = V.plan(e.practice, e); P.mode = key; P.visit = null; P.phaseKey = ''; P.counts = []; }
    return P.plan;
  }
  function begin(e) {
    P.engine = e; P.plan = null; P.mode = ''; P.visit = null; P.hadVisit = false; P.introDone = false; P.outroDone = false; P.phaseKey = ''; P.counts = [];
    P.lastState = ''; P.selfClock = 0; P.lastWall = 0; P.caption = ''; P.sub = ''; clearSubs(); P.musicOn = false; P.sig = '';
    const a = app();
    // A shared team presentation starts silent; the person can still switch sound on.
    P.muted = !!(a && a.state && a.state.present);
    if (narrator) narrator.cancel();
    clearTimeout(P.outroTimer);
    if (audio) audio.stopMusic(2.5);
    ensurePlan(e);
    const p = $('#player'); p.classList.add('sp-on'); p.dataset.spPractice = e.practice.id; p.dataset.spBreath = isBreath() ? '1' : '0';
    syncLegacy();
  }
  function syncLegacy() {
    const a = app(), box = $('#session-voice');
    if (box) box.checked = !!eff.voice;
    if (a && a.state) a.state.voice = false; // the old one-line speaker is replaced by the voice guide
  }
  function reset() {
    P.visit = null; P.introDone = false; P.outroDone = false; P.phaseKey = ''; P.counts = []; P.selfClock = 0; P.caption = ''; P.sub = ''; clearSubs(); P.musicOn = false;
    clearTimeout(P.outroTimer);
    if (narrator) narrator.cancel();
    if (audio) audio.stopMusic(1.2);
  }

  /* ---- main entry: called from updatePlayer on every tick and every forced refresh ---- */
  function update(s, force) { try { run(s, force); } catch (err) { fault(err); } }
  /* Whatever goes wrong here must never take the practice player down with it. */
  function fault(err) { if (!P.faulted) { P.faulted = true; try { console.warn('Serein guide:', err); } catch { /* ignore */ } } }
  function run(s, force) {
    const e = engine(); if (!e || !V) return;
    if (e !== P.engine) begin(e);
    const plan = ensurePlan(e);
    if (s.state === 'ready' && P.lastState && P.lastState !== 'ready') reset();
    ensureDom();
    if (P.synced !== e) { P.synced = e; syncToggles(); }
    const am = ambientOn(); if (am !== P.amb) { P.amb = am; if (audio) audio.setAmbient(am); }
    if (!P.visit && !isBreath()) { P.caption = ''; P.sub = ''; }
    if (!P.caption || (isBreath() && s.state !== 'playing')) P.caption = mainLine(s, plan);
    pumpSubs();
    renderTimeline(s, e);
    paintCaption();
    paintLabel(s, e);
    if (P.lungs) P.lungs.sync(s);
    if (!preview()) {
      if (s.state === 'playing') {
        if (P.lastState !== 'playing') onPlay(s, e);
        if (isBreath()) breathTick(s, e); else guideTick(s, e);
      } else if (P.lastState === 'playing' && s.state !== 'complete') onPause(s);
    }
    P.lastState = s.state;
  }
  function mainLine(s, plan) {
    if (s.state === 'complete') return s.cue;
    if (plan.kind === 'breath') return (plan.captions && plan.captions[kindOf((engine().phases()[s.index] || {}).title || '')]) || s.cue;
    const st = plan.steps[s.index];
    return st ? st.say : s.cue;
  }
  /* The caption the panel should show when a step changes (patched into updatePlayer). */
  function cue(s) { try { return cueLine(s); } catch (err) { fault(err); return s.cue; } }
  function cueLine(s) {
    const e = engine();
    if (!e || !V) return s.cue;
    if (e !== P.engine) begin(e);
    const plan = ensurePlan(e);
    if (s.state === 'complete') return s.cue;
    if (!isBreath() && P.visit && P.visit.index === s.index && P.caption) return P.caption;
    return mainLine(s, plan);
  }

  function onPlay(s, e) {
    const resumed = P.lastState === 'paused';
    // This runs inside the Begin tap, so the audio context is allowed to start here.
    if (audio && (eff.music || eff.breath)) {
      audio.unlock(); audio.setVolumes(prefs.musicVol, prefs.breathVol); audio.setAmbient(ambientOn());
      if (resumed && audio.ctx) audio.resume();
      if (eff.music && !P.musicOn) startMusic(s, e);
      if (resumed && P.musicOn && eff.music) audio.resume();
    }
    if (resumed) { P.resumeSay = true; if (P.visit) P.visit.resume = true; }
    // Self-paced practices have no clock of their own; this one drives the gentle reminders.
    clearInterval(P.selfTimer);
    if (e.practice.selfPaced) P.selfTimer = setInterval(() => { const x = engine(); if (x && x === P.engine && x.state === 'playing') update(x.snapshot()); else clearInterval(P.selfTimer); }, 250);
  }
  function onPause() {
    clearInterval(P.selfTimer); P.sub = ''; clearSubs(); paintCaption();
    if (narrator) narrator.cancel();
    clearTimeout(P.outroTimer);
    if (audio && audio.ctx) audio.pause();
  }
  function ambientOn() { const sel = $('#ambient-sound'); return !!(sel && sel.value && sel.value !== 'off'); }
  function startMusic(s, e) {
    if (!audio || !eff.music) return;
    const o = { remaining: e.duration ? Math.max(0, e.duration - e.elapsed) : 0 };
    const ph = e.phases();
    if (e.practice.id === 'tide') { o.cycle = ph.map(x => x.seconds); const cyc = ph.reduce((a, x) => a + x.seconds, 0); o.cycleOffset = e.elapsed % cyc; }
    if (e.practice.id === 'box') { o.phaseSeconds = ph[0].seconds; o.phaseOffset = s.phaseElapsed; o.phaseIndex = s.index; }
    P.musicOn = audio.startMusic(e.practice.id, o);
    audio.setVolumes(prefs.musicVol, prefs.breathVol);
  }

  /* ---- the guide for step-by-step practices ---- */
  function stepSeconds(e) { return e.duration ? e.duration / e.phases().length : Infinity; }
  function guideTick(s, e) {
    const plan = P.plan, timed = !!e.duration, now = performance.now();
    const dt = P.lastWall ? clamp((now - P.lastWall) / 1000, 0, 0.4) : 0; P.lastWall = now;
    const idx = s.index, step = plan.steps[idx]; if (!step) return;
    const len = stepSeconds(e);
    let t;
    if (timed) t = s.phaseElapsed; else t = (P.selfClock += dt);
    let v = P.visit;
    if (!v || v.index !== idx || (timed && t < v.lastT - 2)) {
      if (!timed) { P.selfClock = 0; t = 0; }
      v = P.visit = { index: idx, spoken: new Set(), lastT: t, resume: false };
      const prompts = (step.prompts || []).map(p => ({ at: p.at != null ? p.at : p.f * len, text: p.text })).filter(p => !(step.minStep && len < step.minStep) && p.at <= len - 2.5);
      v.prompts = prompts;
      if (P.hadVisit) { if (narrator) narrator.cancel(); clearSubs(); }
      P.hadVisit = true;
      if (!P.introDone) { P.introDone = true; if (plan.intro) { say(plan.intro); if (plan.kind === 'breath') preroll(e); } }
      // Joining a step part-way (a skip, a seek): pick up at the latest line that is already due.
      const past = prompts.map((p, i) => ({ at: p.at, text: p.text, i })).filter(p => p.at <= t - 0.3);
      if (past.length) {
        past.forEach(p => v.spoken.add(p.i));
        const last = past[past.length - 1];
        line(last.text);
        if (t - last.at < 5) say(last.text); else P.sub = firstSentence(last.text);
      } else {
        if (t <= 8) say(step.say); else P.sub = firstSentence(step.say);
        line(step.say);
      }
      return;
    }
    v.lastT = t;
    if (v.resume) { v.resume = false; if (P.resumeSay) { P.resumeSay = false; say(P.caption || step.say); } }
    for (let i = 0; i < v.prompts.length; i++) {
      const p = v.prompts[i];
      if (v.spoken.has(i) || t < p.at) continue;
      v.spoken.add(i);
      if (t - p.at < 7) { say(p.text); line(p.text); }
    }
  }

  /* ---- breath: counts, sounds, reminders ---- */
  function breathTick(s, e) {
    const plan = P.plan, ph = e.phases(), cyc = ph.reduce((a, x) => a + x.seconds, 0);
    const cycle = Math.floor(e.elapsed / cyc), key = cycle + ':' + s.index;
    const kind = kindOf(ph[s.index].title), secs = ph[s.index].seconds, t = s.phaseElapsed;
    if (key !== P.phaseKey) {
      const first = P.phaseKey === '';
      P.phaseKey = key; P.counts = [];
      const cap = (plan.captions && plan.captions[kind]) || s.cue;
      line(cap); P.sub = cap; paintCaption();
      if (first && !P.introDone) { P.introDone = true; say(plan.intro); preroll(e); }
      if (eff.breath && audio && audio.running) audio.breath(kind === 'hold' || kind === 'rest' ? 'hold' : kind, secs, t / secs);
      if (t < 1.2) planCounts(kind, secs, cycle, cyc, e);
    }
    if (P.counts.length && eff.voice) {
      while (P.counts.length && t >= P.counts[0].at) {
        const c = P.counts.shift();
        if (t - c.at > 1.4) continue;
        if (c.lead || !P.skipCounts) {
          if (c.lead && narrator.busy) { P.skipCounts = true; P.counts.length = 0; break; }
          if (c.lead) P.skipCounts = false;
          narrator.say(c.text, { single: !c.sentence, gap: 90 });
        }
      }
    }
  }
  /* The spoken welcome comes first: the engine's clock is held at zero until the voice has finished, so the first breath is counted
     like every other one. A pause, a mute or a long wait releases it. */
  function preroll(e) {
    if (!eff.voice || !narrator || !narrator.available || e.elapsed > 0.5 || preview()) return;
    const t0 = performance.now(), release = () => { clearInterval(P.prerollT); delete e.tick; e.anchor = performance.now() + 400; P.phaseKey = ''; P.counts = []; };
    e.tick = function (now) { this.anchor = now; };
    clearInterval(P.prerollT);
    P.prerollT = setInterval(() => {
      const waited = performance.now() - t0;
      if (engine() !== e || e.state !== 'playing') { clearInterval(P.prerollT); delete e.tick; return; }
      if ((waited > 600 && !narrator.busy) || waited > 14000 || !eff.voice) release();
    }, 100);
  }
  function planCounts(kind, secs, cycle, cyc, e) {
    const plan = P.plan, ph = e.phases(), total = e.duration ? Math.ceil(e.duration / cyc) : 99;
    const counts = [];
    const finalCycle = e.duration && (e.duration - e.elapsed) <= cyc + 0.6 && total >= 4;
    P.skipCounts = false;
    if (kind === 'in' && finalCycle && P.lastCycle !== cycle) { P.lastCycle = cycle; counts.push({ at: 0.1, text: plan.last, lead: true, sentence: true }); }
    else if (cycle < 3) {
      V.countWords(kind, secs, cycle < 2).forEach((w, i) => counts.push({ at: i * 1 + (i ? 0.05 : 0), text: w, lead: i === 0 }));
    } else if (cycle < 6 || (kind === 'in' && cycle % 2 === 0)) {
      counts.push({ at: 0.05, text: V.countWords(kind, secs, false)[0], lead: true });
    }
    // a spoken reminder partway through a long out-breath
    const rem = (plan.reminders || []).find(r => r.cycle === cycle);
    if (rem && secs >= 4.5 && (kind === 'out' || (plan.id === 'box' && kind === 'rest'))) {
      // It must end before the next breath begins: use the first sentence when the whole line would not fit.
      const room = secs - 0.8 - 0.9, rate = appPrefs().voiceRate || 0.88;
      const text = V.speakSeconds(rem.text, rate) <= room ? rem.text : firstSentence(rem.text);
      if (V.speakSeconds(text, rate) <= room) counts.push({ at: 0.8, text, lead: false, sentence: true });
    }
    P.counts = counts;
  }

  /* ---- finish: a soft bell, then the last words ---- */
  function complete() { try { finish(); } catch (err) { fault(err); } }
  function finish() {
    const e = engine(); if (!e || !V || P.outroDone) { return; }
    if (e !== P.engine) begin(e);
    P.outroDone = true;
    try { if (g.HCA && g.HCA.daily) g.HCA.daily.done('serein'); } catch { /* optional */ }
    clearInterval(P.selfTimer);
    if (preview()) return;
    if (narrator) narrator.cancel();
    if (audio && audio.ctx) { audio.stopMusic(4); if (eff.music || eff.breath || eff.voice) audio.bell(); }
    if (eff.voice && P.plan) {
      clearTimeout(P.outroTimer);
      P.outroTimer = setTimeout(() => { if (eff.voice && engine() === e && e.state === 'complete') narrator.say(P.plan.outro); }, 1500);
    }
  }
  /* Silence the voice now (the old cancelVoice hook: pause, restart, exit, tab hidden). */
  function silence() {
    clearTimeout(P.outroTimer);
    P.counts = []; clearSubs();
    if (narrator) narrator.cancel(); else { try { g.speechSynthesis.cancel(); } catch { /* ignore */ } }
  }
  function closed() {
    clearInterval(P.selfTimer);
    silence();
    P.visit = null; P.hadVisit = false; P.introDone = false; P.outroDone = false; P.phaseKey = ''; P.counts = []; P.caption = ''; P.sub = ''; clearSubs(); P.musicOn = false; P.lastCycle = -1;
    if (audio) audio.shutdown(4);
    if (P.lungs) P.lungs.dispose();
    P.engine = null; P.lastState = '';
    const p = $('#player'); if (p) { p.classList.remove('sp-on'); }
  }

  /* ---- DOM: stage HUD, step rail, quick controls ---- */
  const ICON = {
    voice: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path class="sp-on-only" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/><path class="sp-off-only" d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
    music: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/><path class="sp-off-only" d="M3 3l18 18"/></svg>',
    breath: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/><path class="sp-off-only" d="M3 3l18 18"/></svg>'
  };
  function ensureDom() {
    if (P.dom && P.dom.stage.isConnected) return;
    const stage = $('#player-stage'), scroll = $('#player-scroll'), controls = $('.player-controls');
    if (!stage || !scroll || !controls) return;
    const hud = doc.createElement('div'); hud.id = 'sp-hud'; hud.className = 'sp-hud';
    hud.innerHTML = '<p class="sp-caption" id="sp-caption" aria-hidden="true"></p>'
      + '<p class="sp-now" id="sp-now" aria-hidden="true"></p><ol class="sp-timeline" id="sp-timeline" aria-label="Practice steps"></ol>'
      + '<div class="sp-meta" aria-hidden="true"><span id="sp-elapsed"></span><span class="sp-next" id="sp-next"></span><span id="sp-left"></span></div>';
    stage.appendChild(hud);
    const label = doc.createElement('div'); label.id = 'sp-breath-label'; label.className = 'sp-breath-label'; label.setAttribute('aria-hidden', 'true'); label.hidden = true;
    label.innerHTML = '<span class="sp-bl-word"></span><span class="sp-bl-dots" aria-hidden="true">…</span><span class="sp-bl-count"><b></b><i></i></span>';
    $('#orb-stage').appendChild(label);
    const rail = doc.createElement('aside'); rail.id = 'sp-rail'; rail.className = 'sp-rail'; rail.setAttribute('aria-label', 'Your steps');
    rail.innerHTML = '<p class="sp-rail-eyebrow">Your steps</p><ol class="sp-rail-list" id="sp-rail-list"></ol><p class="sp-rail-meta" id="sp-rail-meta"></p>';
    scroll.appendChild(rail);
    const tg = doc.createElement('div'); tg.className = 'sp-toggles'; tg.setAttribute('role', 'group'); tg.setAttribute('aria-label', 'Sound');
    const pill = (id, ic, name, extra, short) => '<span class="sp-pill" data-for="' + id + '"><button type="button" class="sp-toggle" id="' + id + '" aria-pressed="false">' + ICON[ic] + '<span class="sp-name"><span class="sp-full">' + name + '</span><span class="sp-short">' + (short || name) + '</span></span><span class="sp-state" aria-hidden="true">On</span></button>' + (extra || '') + '</span>';
    tg.innerHTML = (canSpeak ? pill('sp-voice', 'voice', 'Voice') : '')
      + (canSound ? pill('sp-music', 'music', 'Music', '<input type="range" class="sp-vol" id="sp-music-vol" min="0" max="1" step="0.05" aria-label="Music volume">') : '')
      + (canSound ? pill('sp-breath', 'breath', 'Breath sounds', '<input type="range" class="sp-vol" id="sp-breath-vol" min="0" max="1" step="0.05" aria-label="Breath sound volume">', 'Breath') : '');
    controls.insertBefore(tg, $('.playback-row'));
    P.dom = { stage, hud, label, rail, tg, scroll };
    P.ui = { cap: $('#sp-caption'), next: $('#sp-next'), now: $('#sp-now'), tl: $('#sp-timeline'), el: $('#sp-elapsed'), left: $('#sp-left'), rl: $('#sp-rail-list'), rm: $('#sp-rail-meta') };
    if (g.ResizeObserver) new ResizeObserver(() => stage.style.setProperty('--sp-hud-h', hud.offsetHeight + 'px')).observe(hud);
    syncToggles();
  }

  function stepList(e) {
    const p = e.practice;
    if (p.breathFocus) return e.phases().map(x => ({ title: x.title, sec: x.seconds }));
    const ph = e.phases(), per = e.duration ? e.duration / ph.length : null;
    return p.steps.map(([title], i) => ({ title, sec: per }));
  }
  function stepButtons(list, e, cls) {
    const timed = !!e.duration;
    return list.map((x, i) => '<li style="--w:' + (x.sec || 1) + '"><button type="button" class="' + cls + '" data-player-step="' + i + '" data-i="' + i + '">'
      + '<span class="sp-fill" aria-hidden="true"></span><span class="sp-mark" aria-hidden="true"></span>'
      + '<span class="sp-text"><span class="sp-name">' + esc(x.title) + '</span>' + (timed && x.sec ? '<span class="sp-dur">' + fmtShort(x.sec) + '</span>' : '') + '</span>'
      + '<span class="sp-bar" aria-hidden="true"><i></i></span></button></li>').join('');
  }
  function renderTimeline(s, e) {
    const list = stepList(e), sig = e.practice.id + '|' + list.map(x => x.title + x.sec).join('|') + '|' + (e.duration || 'self');
    const cyclic = !!e.practice.breathFocus;
    if (sig !== P.sig) {
      P.sig = sig;
      P.ui.tl.innerHTML = stepButtons(list, e, 'sp-step');
      P.ui.rl.innerHTML = stepButtons(list, e, 'sp-step sp-rail-step');
      P.dom.hud.dataset.cyclic = cyclic ? '1' : '0'; P.dom.rail.dataset.cyclic = cyclic ? '1' : '0';
    }
    const done = s.state === 'complete';
    if (g.SereinArt) g.SereinArt.complete(done);
    for (const root of [P.ui.tl, P.ui.rl]) {
      root.querySelectorAll('button').forEach((b, i) => {
        const cur = !done && i === s.index, past = done || i < s.index;
        const state = cur ? 'current' : past ? 'done' : 'next';
        if (b.dataset.state !== state) {
          b.dataset.state = state;
          if (cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
          const x = list[i], timed = e.duration && x.sec;
          b.setAttribute('aria-label', (cyclic ? 'Phase ' : 'Step ') + (i + 1) + ' of ' + list.length + ': ' + x.title + (timed ? ', ' + fmtShort(x.sec) : '') + (past && !cyclic ? ', done' : cur ? ', current' : ''));
          b.querySelector('.sp-mark').textContent = past && !cyclic ? '✓' : String(i + 1);
        }
        const pr = cur ? (e.duration || cyclic ? clamp(s.progress, 0, 1) : 0.0) : past ? 1 : 0;
        const q = pr.toFixed(3);
        if (b.dataset.p !== q) { b.dataset.p = q; b.style.setProperty('--p', q); }
      });
    }
    // labels: what comes next, and how long is left
    const nextTitle = !done && s.index + 1 < list.length ? list[s.index + 1].title : (!done && cyclic ? list[0].title : '');
    const nextText = done ? '' : nextTitle ? 'Next: ' + nextTitle : 'Next: finish';
    setText(P.ui.next, nextText);
    const cur = list[done ? list.length - 1 : s.index];
    setText(P.ui.now, done ? '' : (cyclic ? 'Phase ' : 'Step ') + (s.index + 1) + ' of ' + list.length + ' · ' + cur.title + (cur.sec ? ' · ' + fmtShort(cur.sec) : ''));
    let elapsed, left, rail;
    if (e.duration) {
      elapsed = fmt(e.elapsed) + ' elapsed'; left = fmt(Math.max(0, e.duration - e.elapsed)) + ' left';
      if (cyclic) {
        const cyc = e.phases().reduce((a, x) => a + x.seconds, 0), n = Math.ceil(e.duration / cyc);
        elapsed = 'Breath ' + Math.min(n, Math.floor(e.elapsed / cyc) + 1) + ' of ' + n;
      }
      rail = elapsed + ' · ' + left;
    } else { elapsed = 'Step ' + (done ? list.length : s.index + 1) + ' of ' + list.length; left = 'At your own pace'; rail = left + ' · no timer'; }
    setText(P.ui.el, elapsed); setText(P.ui.left, left); setText(P.ui.rm, rail);
  }
  function setText(el, t) { if (el && el.textContent !== t) el.textContent = t; }
  function paintCaption() {
    if (!P.ui.cap) return;
    const t = P.caption || '';
    setText(P.ui.cap, P.sub || firstSentence(t));
    const cue = $('#player-cue');
    if (cue && t && !(P.engine && P.engine.state === 'complete') && cue.textContent !== t) cue.textContent = t;
  }
  function paintLabel(s, e) {
    const L = P.dom && P.dom.label; if (!L) return;
    const show = e.practice.id === 'tide' && s.state !== 'complete';
    L.hidden = !show; if (!show) return;
    const ph = e.phases()[s.index], word = $('.sp-bl-word', L), cnt = $('.sp-bl-count', L);
    const w = s.state === 'ready' ? 'Ready when you are' : s.state === 'paused' ? 'Paused' : ph.title;
    setText(word, w);
    L.dataset.state = s.state; L.dataset.kind = kindOf(ph.title);
    const dots = $('.sp-bl-dots', L);
    const live = s.state === 'playing' || s.state === 'paused';
    dots.hidden = !live; cnt.hidden = !live;
    if (live) { setText(cnt.firstChild, String(clamp(Math.floor(s.phaseElapsed + 0.0001) + 1, 1, ph.seconds))); setText(cnt.lastChild, '/ ' + ph.seconds); }
  }

  /* ---- quick controls and settings ---- */
  function syncToggles() {
    const set = (id, on, label) => {
      const b = $('#' + id); if (!b) return;
      b.setAttribute('aria-pressed', String(!!on));
      b.parentElement.dataset.on = on ? '1' : '0';
      const st = b.querySelector('.sp-state'); if (st) st.textContent = on ? 'On' : 'Off';
      b.setAttribute('aria-label', label + (on ? ': on' : ': off'));
    };
    set('sp-voice', eff.voice, 'Voice guide');
    set('sp-music', eff.music, 'Music');
    set('sp-breath', eff.breath, 'Breath sounds');
    const breathing = isBreath(), bp = $('[data-for="sp-breath"]'); if (bp) bp.hidden = !breathing;
    const mv = $('#sp-music-vol'), bv = $('#sp-breath-vol'); if (mv) mv.value = String(prefs.musicVol); if (bv) bv.value = String(prefs.breathVol);
    const box = $('#session-voice'); if (box) box.checked = !!eff.voice;
    const sm = $('#sp-set-music'), sb = $('#sp-set-breath'); if (sm) sm.checked = prefs.music; if (sb) sb.checked = prefs.breath;
    const smv = $('#sp-set-music-vol'), sbv = $('#sp-set-breath-vol'); if (smv) smv.value = String(prefs.musicVol); if (sbv) sbv.value = String(prefs.breathVol);
  }
  function setVoice(on) {
    prefs.voice = !!on; P.muted = false; savePrefs(); syncToggles(); syncLegacy();
    const e = engine(); if (!e) return;
    if (!on) { silence(); return; }
    if (e.state === 'playing' && narrator) {
      // Switched on mid-practice: say the current line again so it is heard straight away.
      silence();
      const s = e.snapshot();
      if (isBreath()) { if (P.caption) narrator.say(P.caption); } else narrator.say(P.caption || mainLine(s, P.plan));
      clearSubs();
    }
  }
  function setMusic(on) {
    prefs.music = !!on; P.muted = false; savePrefs(); syncToggles();
    const e = engine(); if (!e || !audio) return;
    if (!on) { audio.stopMusic(1.5); P.musicOn = false; }
    else if (e.state === 'playing' && !preview()) { startMusic(e.snapshot(), e); }
  }
  function setBreath(on) { prefs.breath = !!on; P.muted = false; savePrefs(); syncToggles(); if (on && engine() && engine().state === 'playing' && audio) audio.unlock(); }

  function voiceOptions() {
    const list = canSpeak ? V.rank(g.speechSynthesis.getVoices()) : [];
    const want = appPrefs().voiceURI || '';
    const best = list[0];
    return { list, html: '<option value=""' + (want ? '' : ' selected') + '>Automatic' + (best ? ' · ' + esc(best.name) : '') + '</option>' + list.map(v => '<option value="' + esc(v.voiceURI) + '"' + (v.voiceURI === want ? ' selected' : '') + '>' + esc(v.name + ' · ' + v.lang) + '</option>').join('') };
  }
  /* The "Voice and sound" part of the comfort sheet (replaces the old device-options block). */
  function extras(c) {
    const vo = voiceOptions(), rate = (c.store.preferences.voiceRate || 0.88);
    let h = '<fieldset class="player-extra-options sp-sound"><legend>Voice and sound</legend>';
    if (canSpeak) {
      h += '<label class="field-label" for="voice-choice">Voice</label><select id="voice-choice" class="field">' + vo.html + '</select>'
        + '<label class="field-label" for="voice-rate">Voice speed</label><input id="voice-rate" type="range" min="0.6" max="1.2" step="0.05" value="' + rate + '">'
        + '<p class="small-note">Voices come from your device or browser. The best English voice is chosen for you, and a UK voice if there is one.</p>'
        + '<button type="button" class="button button-outline sp-sample" id="sp-voice-test">Hear a sample</button>';
    } else h += '<p class="small-note">This browser has no spoken voice. The written guidance stays on screen.</p>';
    if (canSound) {
      h += '<label class="check-label"><input type="checkbox" id="sp-set-music"' + (prefs.music ? ' checked' : '') + '>Soft music</label>'
        + '<label class="field-label" for="sp-set-music-vol">Music volume</label><input id="sp-set-music-vol" type="range" min="0" max="1" step="0.05" value="' + prefs.musicVol + '">'
        + '<label class="check-label"><input type="checkbox" id="sp-set-breath"' + (prefs.breath ? ' checked' : '') + '>Breath sounds · breathing practices only</label>'
        + '<label class="field-label" for="sp-set-breath-vol">Breath sound volume</label><input id="sp-set-breath-vol" type="range" min="0" max="1" step="0.05" value="' + prefs.breathVol + '">'
        + '<label class="field-label" for="ambient-sound">Ambient sound · off by default</label><select class="field" id="ambient-sound"><option value="off">Off</option><option value="rain">Rain</option><option value="ocean">Ocean</option><option value="hum">Hum</option></select>'
        + '<label class="field-label" for="ambient-volume">Ambient volume</label><input id="ambient-volume" type="range" min="0" max="0.25" step="0.01" value="0.06">';
    }
    if ('wakeLock' in navigator) h += '<label class="check-label"><input id="keep-awake" type="checkbox">Keep the screen awake while playing</label>';
    if ('vibrate' in navigator && /Android/i.test(navigator.userAgent)) h += '<label class="check-label"><input id="phase-haptics" type="checkbox">Brief vibration on phase changes</label>';
    h += '<button type="button" class="text-button" data-v5="shortcuts">Keyboard shortcuts</button></fieldset>';
    return h;
  }
  function refreshVoiceList() {
    const sel = $('#voice-choice'); if (!sel) return;
    sel.innerHTML = voiceOptions().html;
  }

  /* ---- events ---- */
  doc.addEventListener('click', ev => {
    const b = ev.target.closest && ev.target.closest('button'); if (!b) return;
    if (b.id === 'sp-voice') setVoice(!eff.voice);
    else if (b.id === 'sp-music') { setMusic(!eff.music); if (audio && eff.music) audio.unlock(); }
    else if (b.id === 'sp-breath') setBreath(!eff.breath);
    else if (b.id === 'sp-voice-test' && narrator) { silence(); narrator.say('Hello. This is how your voice guide will sound. Breathe in, gently.'); }
  });
  doc.addEventListener('input', ev => {
    const t = ev.target;
    if (t.id === 'sp-music-vol' || t.id === 'sp-set-music-vol') { prefs.musicVol = +t.value; savePrefs(); if (audio) audio.setVolumes(prefs.musicVol, null); syncToggles(); }
    else if (t.id === 'sp-breath-vol' || t.id === 'sp-set-breath-vol') { prefs.breathVol = +t.value; savePrefs(); if (audio) audio.setVolumes(null, prefs.breathVol); syncToggles(); }
    else if (t.id === 'ambient-sound' || t.id === 'ambient-volume') { if (audio) audio.setAmbient(ambientOn()); }
  });
  doc.addEventListener('change', ev => {
    const t = ev.target;
    if (t.id === 'session-voice') setVoice(t.checked);
    else if (t.id === 'sp-set-music') setMusic(t.checked);
    else if (t.id === 'sp-set-breath') setBreath(t.checked);
    else if (t.id === 'ambient-sound') { if (audio) audio.setAmbient(ambientOn()); }
    else if (t.id === 'voice-choice' || t.id === 'voice-rate') { /* stored by the app; picked up on the next line */ }
  });
  if (canSpeak && g.speechSynthesis.addEventListener) g.speechSynthesis.addEventListener('voiceschanged', refreshVoiceList);
  const player = $('#player');
  if (player) player.addEventListener('close', closed);

  /* "Keep this pause silent" from the practice finder: no voice, music or breath sounds for this session only. */
  function quiet() {
    P.muted = true; syncToggles(); syncLegacy(); silence();
    if (audio) audio.stopMusic(0.6);
    P.musicOn = false;
  }

  g.SereinPlayer = {
    update, complete, silence, cue, extras, closed, quiet,
    attachLungs(l) { P.lungs = l; },
    prefs, P, eff,
    debug() { return { prefs: Object.assign({}, prefs), caption: P.caption, plan: P.plan && P.plan.kind, muted: P.muted, musicOn: P.musicOn, counts: P.counts.length, audioState: audio && audio.ctx ? audio.ctx.state : 'none', busy: narrator ? narrator.busy : false }; }
  };
})(globalThis);

;
/* Serein guided practice: 3D lungs for the breathing tide.
 * Raw WebGL, procedural geometry only (two lobed lungs from deformed spheres, a trachea and a branching bronchial tree).
 * The lungs expand, brighten and fill with drifting air on the in-breath, and settle and dim on the out-breath, driven
 * directly by the practice engine's phase and progress so they stay in step with the count.
 * Falls back to a flat canvas drawing without WebGL, holds still-ish under reduced motion, stops when the tab is hidden,
 * and frees every GL resource on dispose(). Replaces Serein.Orb (the plain sphere) for the tide. */
(function (g) {
  'use strict';
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = p => 0.5 - 0.5 * Math.cos(Math.PI * clamp(p, 0, 1));
  const norm3 = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* ---- the breathing shape, shared by the shader and the 2D fallback ---- */
  const CENTRE = [0, 0.18, 0];
  function breathe(p, b) {
    const low = smooth(0.7, -0.9, p[1]);
    const dx = (p[0] - CENTRE[0]) * (1 + (0.1 + 0.05 * low) * b);
    const dz = (p[2] - CENTRE[2]) * (1 + (0.15 + 0.06 * low) * b);
    const dy = (p[1] - CENTRE[1]) * (1 + 0.04 * b);
    return [CENTRE[0] + dx, CENTRE[1] + dy - 0.1 * low * b, CENTRE[2] + dz];
  }

  /* ---- lung surface: a sphere deformed into a tapered, lobed lung ---- */
  function lungPoint(th, ph, side) {
    const py0 = Math.cos(th), r0 = Math.sin(th), cx = Math.cos(ph), cz = Math.sin(ph);
    // a fuller, rounder silhouette than a plain sphere: dome at the top, broad shoulders, wide base
    const fill = 0.78, rr = Math.pow(r0, fill), py = Math.sign(py0) * Math.pow(Math.abs(py0), 0.92);
    const px = rr * cx, pz = rr * cz;
    const t = (1 - py) / 2;
    const wprof = 0.64 + 0.36 * smooth(0, 0.62, t), dprof = 0.66 + 0.34 * smooth(0, 0.5, t);
    let x = px * 0.54 * wprof, y = py, z = pz * 0.46 * dprof;
    const medial = px * side < 0;
    if (medial) x *= 0.58;
    x -= side * 0.06 * smooth(0.1, 1, py);
    // fissures: shallow grooves that split the lung into lobes
    const n1 = norm3([-side * 0.45, 0.8, 0.25]);
    let groove = 0.07 * Math.exp(-Math.pow(dot([px, py, pz], n1) / 0.085, 2));
    if (side < 0) { // right lung has a third lobe
      const d2 = py - 0.34, w = smooth(-0.2, 0.4, pz) * smooth(0, 0.35, px * side);
      groove += 0.06 * Math.exp(-Math.pow(d2 / 0.055, 2)) * w;
    }
    const k = 1 - groove;
    x *= k; z *= k; y *= 1 - groove * 0.4;
    if (side > 0) { // cardiac notch on the left lung
      const dd = Math.pow(px + 0.7, 2) + Math.pow(py + 0.35, 2) + Math.pow(pz - 0.55, 2);
      x += side * 0.2 * Math.exp(-dd / 0.2);
    }
    // the root of the lung, where the airway enters
    const hh = Math.pow(px * side + 0.8, 2) + Math.pow(py - 0.15, 2) + Math.pow(pz, 2);
    x += side * 0.06 * Math.exp(-hh / 0.06);
    // a little organic irregularity
    const w = 1 + 0.018 * Math.sin(5.1 * px + 2.3 * py + 1.1) * Math.cos(4.2 * pz - 1.7 * py);
    x *= w; z *= w;
    return [side * 0.6 + x, y * 0.95 - 0.08, z];
  }
  function buildLung(side, nt, np) {
    const verts = (nt + 1) * (np + 1), pos = new Float32Array(verts * 6), idx = new Uint16Array(nt * np * 6);
    const centre = [side * 0.6, -0.08, 0];
    let o = 0;
    for (let i = 0; i <= nt; i++) {
      const th = clamp(i / nt * Math.PI, 1e-3, Math.PI - 1e-3);
      for (let j = 0; j <= np; j++) {
        const ph = j / np * Math.PI * 2, e = 1e-3;
        const p = lungPoint(th, ph, side);
        const a = lungPoint(th + e, ph, side), b = lungPoint(th - e, ph, side), c = lungPoint(th, ph + e, side), d = lungPoint(th, ph - e, side);
        let n = cross([a[0] - b[0], a[1] - b[1], a[2] - b[2]], [c[0] - d[0], c[1] - d[1], c[2] - d[2]]);
        if (Math.hypot(n[0], n[1], n[2]) < 1e-9) n = [p[0] - centre[0], p[1] - centre[1], p[2] - centre[2]];
        n = norm3(n);
        if (dot(n, [p[0] - centre[0], p[1] - centre[1], p[2] - centre[2]]) < 0) n = [-n[0], -n[1], -n[2]];
        pos[o++] = p[0]; pos[o++] = p[1]; pos[o++] = p[2]; pos[o++] = n[0]; pos[o++] = n[1]; pos[o++] = n[2];
      }
    }
    let q = 0;
    for (let i = 0; i < nt; i++) for (let j = 0; j < np; j++) {
      const a = i * (np + 1) + j, b = a + 1, c = a + np + 1, d = c + 1;
      idx[q++] = a; idx[q++] = b; idx[q++] = c; idx[q++] = b; idx[q++] = d; idx[q++] = c;
    }
    return { pos, idx };
  }

  /* ---- airways: trachea, two main bronchi and a branching tree inside each lung ---- */
  function buildAirways() {
    const rand = rng(11), tubes = [], paths = [], lines = [];
    const SEG = 8;
    const top = [0, 1.34, 0];
    let maxAlong = 0;
    function tube(points, r0, r1, along0, rings) {
      // returns {pos:[x,y,z,nx,ny,nz,along]*} and index data; pushes into tubes
      const n = points.length, pos = [], idx = [];
      let nrm = null, acc = along0;
      for (let i = 0; i < n; i++) {
        const prev = points[Math.max(0, i - 1)], next = points[Math.min(n - 1, i + 1)];
        const tg = norm3([next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]]);
        if (!nrm) { const ref = Math.abs(tg[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]; nrm = norm3(cross(tg, ref)); }
        else { const d = dot(nrm, tg); nrm = norm3([nrm[0] - d * tg[0], nrm[1] - d * tg[1], nrm[2] - d * tg[2]]); }
        const bn = cross(tg, nrm);
        if (i > 0) acc += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1], points[i][2] - points[i - 1][2]);
        const f = i / (n - 1);
        let rad = lerp(r0, r1, f);
        if (rings) rad *= 1 + 0.07 * Math.max(0, Math.sin(acc * 78));
        for (let s = 0; s <= SEG; s++) {
          const a = s / SEG * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
          const nx = c * nrm[0] + sn * bn[0], ny = c * nrm[1] + sn * bn[1], nz = c * nrm[2] + sn * bn[2];
          pos.push(points[i][0] + rad * nx, points[i][1] + rad * ny, points[i][2] + rad * nz, nx, ny, nz, acc);
        }
      }
      for (let i = 0; i < n - 1; i++) for (let s = 0; s < SEG; s++) {
        const a = i * (SEG + 1) + s, b = a + 1, c = a + SEG + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
      tubes.push({ pos, idx });
      maxAlong = Math.max(maxAlong, acc);
      return acc;
    }
    // a gently curved airway: a Hermite curve from the start, leaving along dir, to a point a little off to one side
    function bend(p0, dir, len, steps, wob) {
      const d2 = norm3([dir[0] + (rand() - 0.5) * wob, dir[1] + (rand() - 0.5) * wob - 0.05, dir[2] + (rand() - 0.5) * wob]);
      const p1 = [p0[0] + (dir[0] + d2[0]) * 0.5 * len, p0[1] + (dir[1] + d2[1]) * 0.5 * len, p0[2] + (dir[2] + d2[2]) * 0.5 * len];
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps, h00 = 2 * t * t * t - 3 * t * t + 1, h10 = t * t * t - 2 * t * t + t, h01 = -2 * t * t * t + 3 * t * t, h11 = t * t * t - t * t;
        pts.push([0, 1, 2].map(k => h00 * p0[k] + h10 * len * dir[k] + h01 * p1[k] + h11 * len * d2[k]));
      }
      return { pts, dir: d2 };
    }
    function inside(p, side) {
      const rx = 0.42 * (0.68 + 0.32 * smooth(0.8, -0.6, p[1]));
      const dx = (p[0] - side * 0.7) / rx, dy = (p[1] + 0.1) / 0.84, dz = p[2] / 0.34;
      return dx * dx + dy * dy + dz * dz < 1.0;
    }
    function rotateAround(v, axis, ang) {
      const c = Math.cos(ang), s = Math.sin(ang), d = dot(axis, v), x = cross(axis, v);
      return norm3([v[0] * c + x[0] * s + axis[0] * d * (1 - c), v[1] * c + x[1] * s + axis[1] * d * (1 - c), v[2] * c + x[2] * s + axis[2] * d * (1 - c)]);
    }
    function branch(start, dir, len, rad, depth, along, side, trail) {
      const seg = bend(start, dir, len, 7, 0.35), end = seg.pts[seg.pts.length - 1];
      const a1 = tube(seg.pts, rad, rad * 0.82, along, false);
      lines.push({ pts: seg.pts, r: rad, a0: along, a1 });
      const path = trail.concat(seg.pts.slice(1));
      if (depth >= 4) { paths.push(path); return; }
      let any = false;
      for (let k = 0; k < 2; k++) {
        const ref = Math.abs(seg.dir[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        const ax = norm3(cross(seg.dir, ref));
        const around = rotateAround(ax, seg.dir, depth * 1.1 + k * Math.PI + rand() * 0.4);
        let cd = rotateAround(seg.dir, around, 0.38 + rand() * 0.3);
        // lean towards the middle of the lung so the tree fills it rather than leaving it
        const toC = norm3([side * 0.68 - end[0], -0.05 - end[1], -end[2]]);
        cd = norm3([cd[0] + toC[0] * 0.35, cd[1] + toC[1] * 0.35, cd[2] + toC[2] * 0.35]);
        let nl = len * (0.72 + rand() * 0.08), ok = false;
        for (let tries = 0; tries < 4 && !ok; tries++) {
          const probe = [end[0] + cd[0] * nl, end[1] + cd[1] * nl, end[2] + cd[2] * nl];
          if (inside(probe, side)) ok = true; else nl *= 0.72;
        }
        if (!ok) continue;
        any = true;
        branch(end, cd, nl, rad * 0.74, depth + 1, a1, side, path);
      }
      if (!any) paths.push(path);
    }
    // trachea, with faint cartilage rings
    const trachea = [];
    for (let i = 0; i <= 14; i++) trachea.push([0, lerp(top[1], 0.66, i / 14), 0]);
    const tEnd = tube(trachea, 0.085, 0.075, 0, true);
    lines.push({ pts: trachea, r: 0.085, a0: 0, a1: tEnd });
    const trail0 = [[0, 1.95, 0]].concat(trachea.slice(2));
    for (const side of [-1, 1]) {
      const root = [side * 0.04, 0.66, 0], hil = [side * 0.44, 0.3, 0.0];
      const mainPts = [];
      for (let i = 0; i <= 8; i++) { const f = i / 8; mainPts.push([lerp(root[0], hil[0], f), lerp(root[1], hil[1], f) - 0.05 * Math.sin(f * Math.PI), 0]); }
      const aMain = tube(mainPts, 0.062, 0.052, tEnd, false);
      lines.push({ pts: mainPts, r: 0.062, a0: tEnd, a1: aMain });
      // inside the lung the main airway splits into its lobes: three on the right, two on the left
      const lobes = side < 0
        ? [[[side * 0.55, 0.7, 0.12], 0.34], [[side * 0.95, -0.05, 0.26], 0.36], [[side * 0.3, -0.9, 0.0], 0.52]]
        : [[[side * 0.5, 0.75, 0.1], 0.4], [[side * 0.3, -0.9, 0.0], 0.56]];
      const entry = [side * 0.52, 0.2, 0.0];
      const stem = [hil, [lerp(hil[0], entry[0], 0.5), lerp(hil[1], entry[1], 0.5), 0], entry];
      const aStem = tube(stem, 0.052, 0.046, aMain, false);
      lines.push({ pts: stem, r: 0.052, a0: aMain, a1: aStem });
      for (const [d, len] of lobes) branch(entry, norm3(d), len, 0.034, 0, aStem, side, trail0.concat(mainPts.slice(1), stem.slice(1)));
    }
    return { tubes, paths, lines, maxAlong };
  }
  function mergeTubes(tubes, maxAlong) {
    let nv = 0, ni = 0;
    for (const t of tubes) { nv += t.pos.length / 7; ni += t.idx.length; }
    const pos = new Float32Array(nv * 7), idx = new Uint16Array(ni);
    let vo = 0, io = 0, base = 0;
    for (const t of tubes) {
      for (let i = 0; i < t.pos.length; i += 7) { for (let k = 0; k < 6; k++) pos[vo++] = t.pos[i + k]; pos[vo++] = t.pos[i + 6] / maxAlong; }
      for (let i = 0; i < t.idx.length; i++) idx[io++] = t.idx[i] + base;
      base += t.pos.length / 7;
    }
    return { pos, idx };
  }
  function pathData(paths) {
    return paths.map(pts => {
      const acc = [0];
      for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
      return { pts, acc, len: acc[acc.length - 1] };
    });
  }
  function onPath(path, u, out) {
    const d = u * path.len;
    let i = 1; while (i < path.acc.length - 1 && path.acc[i] < d) i++;
    const f = clamp((d - path.acc[i - 1]) / ((path.acc[i] - path.acc[i - 1]) || 1), 0, 1), a = path.pts[i - 1], b = path.pts[i];
    out[0] = lerp(a[0], b[0], f); out[1] = lerp(a[1], b[1], f); out[2] = lerp(a[2], b[2], f);
  }

  /* ---- matrices (column-major) ---- */
  function perspective(fov, aspect, n, f) { const t = 1 / Math.tan(fov / 2), nf = 1 / (n - f); return [t / aspect, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]; }
  function mul(a, b) { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }
  function rotY(a) { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; }
  function rotX(a) { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; }
  function trans(x, y, z) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]; }
  const mat3 = m => [m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]];

  /* ---- shaders ---- */
  const BREATHE = `
    uniform mediump float uB;
    vec3 breathe(vec3 p){
      float low=smoothstep(.7,-.9,p.y);
      vec3 c=vec3(0.,.18,0.);
      vec3 d=p-c;
      d.x*=1.+(.1+.05*low)*uB;
      d.z*=1.+(.15+.06*low)*uB;
      d.y*=1.+.04*uB;
      p=c+d; p.y-=.1*low*uB;
      return p;
    }`;
  const VS_LUNG = `attribute vec3 aPos;attribute vec3 aNor;uniform mat4 uMVP;uniform mat3 uRot;varying vec3 vN;varying vec3 vW;varying float vY;${BREATHE}
    void main(){vec3 p=breathe(aPos);vN=uRot*aNor;vW=uRot*p;vY=p.y;gl_Position=uMVP*vec4(p,1.);}`;
  const FS_LUNG = `precision mediump float;varying vec3 vN;varying vec3 vW;varying float vY;uniform mediump float uB;uniform float uPass;uniform vec3 uEye;uniform float uTime;
    void main(){
      vec3 N=normalize(vN); if(uPass>.5)N=-N;
      vec3 V=normalize(uEye-vW);
      float ndv=clamp(dot(N,V),0.,1.);
      float fres=pow(1.-ndv,2.2);
      vec3 L=normalize(vec3(-.45,.7,.85));
      float diff=clamp(dot(N,L)*.5+.5,0.,1.);
      vec3 deep=vec3(.05,.25,.25),sage=vec3(.27,.58,.49),hi=vec3(.80,.95,.88);
      vec3 col=mix(deep,sage,diff*.7+.12*uB);
      col+=vec3(.04,.10,.07)*uB*(.5-.5*vY);
      float spec=pow(max(dot(reflect(-L,N),V),0.),30.);
      col+=hi*spec*.34;
      col+=vec3(.36,.74,.62)*fres*(.4+.55*uB);
      col*=.78+.4*uB;
      float a=.2+.46*fres+.12*uB;
      if(uPass>.5)a*=.55;
      a=clamp(a,0.,.9);
      gl_FragColor=vec4(col*a,a);
    }`;
  const VS_AIR = `attribute vec3 aPos;attribute vec3 aNor;attribute float aAlong;uniform mat4 uMVP;uniform mat3 uRot;varying vec3 vN;varying float vA;${BREATHE}
    void main(){vec3 p=breathe(aPos);vN=uRot*aNor;vA=aAlong;gl_Position=uMVP*vec4(p,1.);}`;
  const FS_AIR = `precision mediump float;varying vec3 vN;varying float vA;uniform float uFlow;uniform float uGlow;
    void main(){
      float band=exp(-pow((vA-uFlow)/.1,2.))*step(-.2,uFlow);
      float tr=smoothstep(.24,.0,vA);
      vec3 base=vec3(.3,.78,.66);
      float gl=.2+.8*uGlow+.5*tr*uGlow;
      float rim=pow(1.-abs(normalize(vN).z),2.)*.35;
      vec3 col=base*(gl+rim)+vec3(.85,1.,.95)*band*.9;
      float a=clamp(.55+.3*band+.25*tr*uGlow,0.,.95)*smoothstep(0.,.05,vA+.012);
      gl_FragColor=vec4(col*a,a);
    }`;
  const VS_DOT = `attribute vec3 aPos;attribute vec2 aDot;uniform mat4 uMVP;uniform float uPx;varying float vAl;${BREATHE}
    void main(){vec3 p=breathe(aPos);vec4 q=uMVP*vec4(p,1.);gl_Position=q;gl_PointSize=aDot.x*uPx/q.w;vAl=aDot.y;}`;
  const FS_DOT = `precision mediump float;varying float vAl;
    void main(){float d=length(gl_PointCoord-.5)*2.;float a=smoothstep(1.,.0,d);a*=a*vAl;gl_FragColor=vec4(vec3(.8,1.,.93)*a,a);}`;
  const VS_HALO = `attribute vec2 aP;varying vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`;
  const FS_HALO = `precision mediump float;varying vec2 vUv;uniform float uB;uniform float uAspect;
    void main(){vec2 d=(vUv-vec2(.5,.52))*vec2(uAspect,1.);float r=dot(d,d);float a=exp(-r*5.5)*(.1+.3*uB);
      vec3 c=vec3(.28,.68,.58)*a;gl_FragColor=vec4(c,a*.9);}`;

  /* ---- the component ---- */
  const NS = 'http://www.w3.org/2000/svg';
  class LungsOrb {
    constructor(canvas, fallback) {
      this.legacyCanvas = canvas; this.legacyFallback = fallback; this.host = canvas.parentElement;
      this.reduced = false; this.frame = 0; this.mode = 'none'; this.cv = null; this.gl = null; this.ctx2 = null;
      this.getSnap = null; this.model = { b: 0.32, kind: 'ready', p: 0, glow: 0.3, flow: -1, playing: false };
      this.quality = 1; this.yaw = 0; this.pitch = 0; this.px = 0; this.py = 0; this.t0 = performance.now(); this.frames = 0; this.last = 0; this.idle = 0;
      this.onVis = () => { if (!document.hidden && this.getSnap && !this.frame) this.loop(); };
      this.onPtr = e => { const r = this.host.getBoundingClientRect(); this.px = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1); this.py = clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1); };
      this.disposed = true;
      canvas.hidden = true; if (fallback) fallback.hidden = true;
      if (g.SereinPlayer) g.SereinPlayer.attachLungs(this);
    }
    /* ---- lifecycle ---- */
    ensure() {
      if (!this.disposed && this.cv && this.cv.isConnected) return;
      this.release();
      this.disposed = false;
      const cv = document.createElement('canvas');
      cv.className = 'sp-lungs'; cv.setAttribute('aria-hidden', 'true'); cv.dataset.spMode = 'pending';
      this.host.insertBefore(cv, this.legacyCanvas);
      this.cv = cv;
      let ok = false;
      try { ok = this.initGL(cv); } catch (e) { ok = false; }
      if (!ok) { this.releaseGL(); cv.remove(); const c2 = document.createElement('canvas'); c2.className = 'sp-lungs'; c2.setAttribute('aria-hidden', 'true'); this.host.insertBefore(c2, this.legacyCanvas); this.cv = c2; this.ctx2 = c2.getContext('2d'); this.mode = this.ctx2 ? '2d' : 'none'; if (!this.air) this.makeAir(); }
      this.cv.dataset.spMode = this.mode;
      this.host.dataset.lungs = this.mode;
      document.addEventListener('visibilitychange', this.onVis);
      this.host.addEventListener('pointermove', this.onPtr, { passive: true });
    }
    makeAir() {
      this.air = buildAirways();
      this.paths = pathData(this.air.paths);
      this.nPart = 150;
      this.parts = Array.from({ length: this.nPart }, (_, i) => ({ path: this.paths[i % this.paths.length], off: ((i * 0.6180339) % 1), size: 0.7 + ((i * 0.37) % 1) * 1.1, jit: [((i * 0.731) % 1 - 0.5) * 0.05, ((i * 0.419) % 1 - 0.5) * 0.05, ((i * 0.263) % 1 - 0.5) * 0.04] }));
    }
    initGL(cv) {
      const gl = cv.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'low-power', preserveDrawingBuffer: false }) || cv.getContext('experimental-webgl');
      if (!gl) return false;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s)); return s; };
      const prog = (vs, fs) => { const p = gl.createProgram(), a = sh(gl.VERTEX_SHADER, vs), b = sh(gl.FRAGMENT_SHADER, fs); gl.attachShader(p, a); gl.attachShader(p, b); gl.linkProgram(p); gl.deleteShader(a); gl.deleteShader(b); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(p)); return p; };
      this.gl = gl; this.res = { buffers: [], programs: [] };
      const buf = (target, data, usage) => { const b = gl.createBuffer(); gl.bindBuffer(target, b); gl.bufferData(target, data, usage || gl.STATIC_DRAW); this.res.buffers.push(b); return b; };
      this.pLung = prog(VS_LUNG, FS_LUNG); this.pAir = prog(VS_AIR, FS_AIR); this.pDot = prog(VS_DOT, FS_DOT); this.pHalo = prog(VS_HALO, FS_HALO);
      this.res.programs.push(this.pLung, this.pAir, this.pDot, this.pHalo);
      const loc = (p, n) => gl.getAttribLocation(p, n), uni = (p, n) => gl.getUniformLocation(p, n);
      this.u = {};
      for (const [k, p, names] of [['lung', this.pLung, ['uMVP', 'uRot', 'uB', 'uPass', 'uEye', 'uTime']], ['air', this.pAir, ['uMVP', 'uRot', 'uB', 'uFlow', 'uGlow']], ['dot', this.pDot, ['uMVP', 'uB', 'uPx']], ['halo', this.pHalo, ['uB', 'uAspect']]]) { this.u[k] = {}; for (const n of names) this.u[k][n] = uni(p, n); }
      this.a = { lung: [loc(this.pLung, 'aPos'), loc(this.pLung, 'aNor')], air: [loc(this.pAir, 'aPos'), loc(this.pAir, 'aNor'), loc(this.pAir, 'aAlong')], dot: [loc(this.pDot, 'aPos'), loc(this.pDot, 'aDot')], halo: [loc(this.pHalo, 'aP')] };
      this.lungs = [-1, 1].map(side => { const m = buildLung(side, 54, 72); return { vb: buf(gl.ARRAY_BUFFER, m.pos), ib: buf(gl.ELEMENT_ARRAY_BUFFER, m.idx), n: m.idx.length }; });
      if (!this.air) this.makeAir();
      const merged = mergeTubes(this.air.tubes, this.air.maxAlong);
      this.airGeo = { vb: buf(gl.ARRAY_BUFFER, merged.pos), ib: buf(gl.ELEMENT_ARRAY_BUFFER, merged.idx), n: merged.idx.length };
      this.dotData = new Float32Array(this.nPart * 5);
      this.dotBuf = buf(gl.ARRAY_BUFFER, this.dotData, gl.DYNAMIC_DRAW);
      this.haloBuf = buf(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]));
      cv.addEventListener('webglcontextlost', this.lost = e => { e.preventDefault(); this.switchTo2D(); }, false);
      this.mode = 'webgl';
      return true;
    }
    switchTo2D() {
      if (this.mode === '2d') return;
      const wasRunning = !!this.frame;
      this.releaseGL();
      if (this.cv) this.cv.remove();
      const c2 = document.createElement('canvas'); c2.className = 'sp-lungs'; c2.setAttribute('aria-hidden', 'true');
      this.host.insertBefore(c2, this.legacyCanvas);
      this.cv = c2; this.ctx2 = c2.getContext('2d'); this.mode = this.ctx2 ? '2d' : 'none'; c2.dataset.spMode = this.mode; this.host.dataset.lungs = this.mode;
      if (wasRunning && this.getSnap) this.loop();
    }
    releaseGL() {
      const gl = this.gl;
      if (gl) {
        try {
          for (const b of this.res.buffers) gl.deleteBuffer(b);
          for (const p of this.res.programs) gl.deleteProgram(p);
          const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext();
        } catch { /* context already gone */ }
      }
      if (this.cv && this.lost) this.cv.removeEventListener('webglcontextlost', this.lost);
      this.gl = null; this.res = null;
    }
    release() {
      this.stop(); this.releaseGL();
      if (this.cv) { this.cv.remove(); this.cv = null; }
      this.ctx2 = null; this.mode = 'none';
      document.removeEventListener('visibilitychange', this.onVis);
      this.host.removeEventListener('pointermove', this.onPtr);
    }
    dispose() { this.release(); this.disposed = true; delete this.host.dataset.lungs; }

    /* ---- model: where the breath is, straight from the practice engine ---- */
    read(s) {
      const eng = g.Serein && g.Serein.player && g.Serein.player.engine, m = this.model;
      if (!s || !eng) return m;
      let title = '';
      try { title = (eng.phases()[s.index] || {}).title || s.title || ''; } catch { title = s.title || ''; }
      const kind = /out/i.test(title) ? 'out' : /in\b/i.test(title) ? 'in' : /hold/i.test(title) ? 'holdFull' : /rest/i.test(title) ? 'holdEmpty' : 'in';
      const p = clamp(s.progress || 0, 0, 1);
      m.kind = kind; m.p = p; m.playing = s.state === 'playing';
      if (s.state === 'ready') { m.b = 0.3; m.glow = 0.28; m.flow = -1; m.kind = 'ready'; return m; }
      if (s.state === 'complete') { m.b = 0.35; m.glow = 0.3; m.flow = -1; m.kind = 'ready'; return m; }
      let b = kind === 'in' ? ease(p) : kind === 'out' ? 1 - ease(p) : kind === 'holdFull' ? 1 : 0;
      let glow = kind === 'in' ? 0.3 + 0.7 * ease(p) : kind === 'out' ? 0.2 + 0.7 * (1 - ease(p)) * 0.8 : kind === 'holdFull' ? 0.85 : 0.18;
      m.flow = kind === 'in' ? p * 1.25 - 0.1 : kind === 'out' ? 1.15 - p * 1.25 : -1;
      const pulse = (kind === 'holdFull' || kind === 'holdEmpty') ? Math.sin((performance.now() - this.t0) / 1000 * 2.2) * 0.06 : 0;
      glow = clamp(glow + pulse, 0, 1);
      if (this.still()) { b = 0.5 + (b - 0.5) * 0.4; glow = 0.45 + (glow - 0.45) * 0.4; m.flow = -1; }
      m.b = b; m.glow = glow;
      return m;
    }
    still() { return this.reduced || document.body.classList.contains('reduce-motion'); }
    /* The controller calls this on every tick; it draws a frame itself when no animation loop is running. */
    sync(s) {
      this.read(s);
      if (this.frame || this.disposed || !this.playerOpen()) return;
      const now = performance.now();
      if (now - (this.lastSync || 0) < (this.cost || 0) * 3) return; // a slow device is not asked for more than it can give
      this.lastSync = now; this.render(false); this.cost = (this.cost || 0) * 0.7 + (performance.now() - now) * 0.3;
    }
    playerOpen() { const p = document.querySelector('#player'); return !!(p && p.open); }
    draw() { if (!this.playerOpen()) return; this.ensure(); this.render(false); }
    start(getSnapshot) {
      this.stop(); this.getSnap = getSnapshot;
      if (!this.playerOpen()) return;
      this.ensure(); this.loop();
    }
    loop() {
      cancelAnimationFrame(this.frame); this.frame = 0;
      if (this.disposed || !this.getSnap) return;
      this.frame = requestAnimationFrame(now => {
        this.frame = 0;
        if (document.hidden || !this.playerOpen()) return;
        this.adapt(now);
        const s = this.getSnap();
        this.read(s);
        this.render(true, now);
        this.loop();
      });
    }
    stop() { cancelAnimationFrame(this.frame); this.frame = 0; }

    /* A slow device quietly renders at a lower resolution instead of stuttering. */
    adapt(now) {
      if (this.lastNow) {
        const dt = now - this.lastNow;
        if (dt < 400) { this.avg = this.avg ? this.avg * 0.9 + dt * 0.1 : dt; this.nAvg = (this.nAvg || 0) + 1; }
        if (this.nAvg > 24 && this.avg > 42 && this.quality > 0.55) { this.quality = Math.max(0.55, this.quality - 0.15); this.nAvg = 0; this.avg = 0; }
      }
      this.lastNow = now;
    }
    /* ---- rendering ---- */
    size() {
      const r = this.cv.getBoundingClientRect(), dpr = Math.min(1.75, g.devicePixelRatio || 1) * this.quality;
      const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
      if (this.cv.width !== w || this.cv.height !== h) { this.cv.width = w; this.cv.height = h; }
      return [w, h];
    }
    render(animating, now) {
      if (this.disposed || !this.cv) return;
      const tms = performance.now(), t = (tms - this.t0) / 1000;
      this.frames++;
      const st = this.still();
      // idle sway of about 15 degrees each way, plus a little pointer parallax
      const sway = st ? 0 : Math.sin(t * 0.26) * 0.26;
      this.yaw += ((sway + this.px * 0.12) - this.yaw) * 0.12; this.pitch += ((this.py * 0.07 - 0.04) - this.pitch) * 0.1;
      if (this.mode === 'webgl') this.renderGL(t); else if (this.mode === '2d') this.render2D(t);
      this.cv.dataset.b = this.model.b.toFixed(3);
    }
    renderGL(t) {
      const gl = this.gl; if (!gl) return;
      const [w, h] = this.size(); gl.viewport(0, 0, w, h);
      const m = this.model, aspect = w / h, fov = 34 * Math.PI / 180, tn = Math.tan(fov / 2);
      const dist = Math.max(1.3 / tn, 1.36 / (tn * aspect)) * 1.04;
      const proj = perspective(fov, aspect, 0.5, 20), view = trans(0, -0.18, -dist);
      const rot = mul(rotX(this.pitch), rotY(this.yaw)), mvp = mul(proj, mul(view, rot)), rot3 = mat3(rot);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      // halo
      gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(this.pHalo); gl.bindBuffer(gl.ARRAY_BUFFER, this.haloBuf);
      gl.enableVertexAttribArray(this.a.halo[0]); gl.vertexAttribPointer(this.a.halo[0], 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(this.u.halo.uB, m.glow); gl.uniform1f(this.u.halo.uAspect, aspect); gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.disableVertexAttribArray(this.a.halo[0]);
      // airways first, so they show through the glass of the lungs
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true);
      gl.useProgram(this.pAir); gl.bindBuffer(gl.ARRAY_BUFFER, this.airGeo.vb); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.airGeo.ib);
      const A = this.a.air; gl.enableVertexAttribArray(A[0]); gl.enableVertexAttribArray(A[1]); gl.enableVertexAttribArray(A[2]);
      gl.vertexAttribPointer(A[0], 3, gl.FLOAT, false, 28, 0); gl.vertexAttribPointer(A[1], 3, gl.FLOAT, false, 28, 12); gl.vertexAttribPointer(A[2], 1, gl.FLOAT, false, 28, 24);
      gl.uniformMatrix4fv(this.u.air.uMVP, false, mvp); gl.uniformMatrix3fv(this.u.air.uRot, false, rot3);
      gl.uniform1f(this.u.air.uB, m.b); gl.uniform1f(this.u.air.uFlow, m.flow); gl.uniform1f(this.u.air.uGlow, m.glow);
      gl.drawElements(gl.TRIANGLES, this.airGeo.n, gl.UNSIGNED_SHORT, 0);
      gl.disableVertexAttribArray(A[2]);
      // lungs: far wall, then near wall, as translucent glass
      gl.depthMask(false); gl.enable(gl.CULL_FACE);
      gl.useProgram(this.pLung);
      const L = this.a.lung; gl.enableVertexAttribArray(L[0]); gl.enableVertexAttribArray(L[1]);
      gl.uniformMatrix4fv(this.u.lung.uMVP, false, mvp); gl.uniformMatrix3fv(this.u.lung.uRot, false, rot3);
      gl.uniform1f(this.u.lung.uB, m.b); gl.uniform1f(this.u.lung.uTime, t); gl.uniform3f(this.u.lung.uEye, 0, 0.18, dist);
      for (const pass of [1, 0]) {
        gl.cullFace(pass ? gl.FRONT : gl.BACK); gl.uniform1f(this.u.lung.uPass, pass);
        for (const lung of this.lungs) {
          gl.bindBuffer(gl.ARRAY_BUFFER, lung.vb); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lung.ib);
          gl.vertexAttribPointer(L[0], 3, gl.FLOAT, false, 24, 0); gl.vertexAttribPointer(L[1], 3, gl.FLOAT, false, 24, 12);
          gl.drawElements(gl.TRIANGLES, lung.n, gl.UNSIGNED_SHORT, 0);
        }
      }
      gl.disableVertexAttribArray(L[0]); gl.disableVertexAttribArray(L[1]);
      // drifting air
      gl.disable(gl.CULL_FACE); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      this.fillDots(m, t);
      gl.useProgram(this.pDot); gl.bindBuffer(gl.ARRAY_BUFFER, this.dotBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.dotData);
      const D = this.a.dot; gl.enableVertexAttribArray(D[0]); gl.enableVertexAttribArray(D[1]);
      gl.vertexAttribPointer(D[0], 3, gl.FLOAT, false, 20, 0); gl.vertexAttribPointer(D[1], 2, gl.FLOAT, false, 20, 12);
      gl.uniformMatrix4fv(this.u.dot.uMVP, false, mvp); gl.uniform1f(this.u.dot.uB, m.b); gl.uniform1f(this.u.dot.uPx, h * 0.085);
      gl.drawArrays(gl.POINTS, 0, this.nPart);
      gl.disableVertexAttribArray(D[0]); gl.disableVertexAttribArray(D[1]);
      gl.depthMask(true); gl.disable(gl.BLEND);
    }
    fillDots(m, t) {
      const out = [0, 0, 0], d = this.dotData, stag = 0.8;
      const moving = m.kind === 'in' || m.kind === 'out', quiet = this.still();
      for (let i = 0; i < this.nPart; i++) {
        const q = this.parts[i];
        let u, al;
        if (moving && !quiet) {
          const f = clamp(m.p * (1 + stag) - q.off * stag, 0, 1);
          u = m.kind === 'in' ? f : 1 - f;
          al = smooth(0, 0.07, u) * (1 - smooth(0.88, 1, u)) * (0.9 + 0.1 * Math.sin(t * 3 + i));
        } else {
          // holds and rests: a few faint motes shimmer where the air is
          u = 0.25 + q.off * 0.7; al = (m.kind === 'holdFull' ? 0.22 : 0.07) * (0.5 + 0.5 * Math.sin(t * 1.4 + i * 1.7)) * (quiet ? 0.5 : 1);
        }
        onPath(q.path, u, out);
        const o = i * 5;
        const sp = 1 + 5 * u; d[o] = out[0] + q.jit[0] * sp; d[o + 1] = out[1] + q.jit[1] * sp; d[o + 2] = out[2] + q.jit[2] * sp; d[o + 3] = q.size; d[o + 4] = clamp(al, 0, 1);
      }
    }

    /* ---- flat fallback: the same lungs, drawn on a 2D canvas ---- */
    render2D(t) {
      const c = this.ctx2; if (!c) return;
      const [w, h] = this.size(), m = this.model;
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
      const u = Math.min(w / 2.9, h / 2.7), cx = w / 2, cy = h / 2 + u * 0.12;
      const P = p => { const q = breathe([p[0], p[1], 0], m.b); return [cx + q[0] * u + Math.sin(this.yaw) * q[2] * u, cy - (q[1] + 0.02) * u]; };
      const halo = c.createRadialGradient(cx, cy, 0, cx, cy, u * 1.9);
      halo.addColorStop(0, `rgba(95,184,158,${0.1 + 0.26 * m.glow})`); halo.addColorStop(1, 'rgba(95,184,158,0)');
      c.fillStyle = halo; c.fillRect(0, 0, w, h);
      // lungs
      for (const side of [-1, 1]) {
        const shape = [[0.08, 0.86], [0.12, 0.28], [0.1, -0.2], [0.16, -0.7], [0.46, -0.96], [0.66, -0.52], [0.7, 0.2], [0.66, 0.8], [0.36, 0.97], [0.1, 0.84]];
        const pts = shape.map(([x, y]) => P([side * x, y - 0.08, 0]));
        c.beginPath(); c.moveTo((pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2);
        for (let i = 1; i <= pts.length; i++) { const a = pts[i % pts.length], b = pts[(i + 1) % pts.length]; c.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
        c.closePath();
        const gr = c.createLinearGradient(cx + side * u * 0.7, cy - u, cx + side * u * 0.1, cy + u);
        gr.addColorStop(0, `rgba(${90 + 50 * m.glow | 0},${170 + 55 * m.glow | 0},${150 + 40 * m.glow | 0},${0.22 + 0.5 * m.glow})`); gr.addColorStop(1, `rgba(26,96,96,${0.3 + 0.4 * m.glow})`);
        c.fillStyle = gr; c.fill(); c.lineWidth = Math.max(1.5, u * 0.012); c.strokeStyle = `rgba(190,245,225,${0.25 + 0.55 * m.glow})`; c.stroke();
      }
      // airways
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (const ln of this.air.lines) {
        const pts = ln.pts.map(P);
        c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
        const band = m.flow >= 0 ? Math.exp(-Math.pow(((ln.a0 + ln.a1) / 2 / this.air.maxAlong - m.flow) / 0.14, 2)) : 0;
        c.strokeStyle = `rgba(${150 + 90 * band | 0},${235},${215},${0.35 + 0.4 * m.glow + 0.3 * band})`; c.lineWidth = Math.max(1, ln.r * u * 1.8); c.stroke();
      }
      // air
      c.fillStyle = 'rgba(220,255,240,0.8)';
      const out = [0, 0, 0], moving = m.kind === 'in' || m.kind === 'out';
      if (moving && !this.still()) for (let i = 0; i < this.nPart; i += 2) {
        const q = this.parts[i], f = clamp(m.p * 1.8 - q.off * 0.8, 0, 1), uu = m.kind === 'in' ? f : 1 - f;
        const al = smooth(0, 0.07, uu) * (1 - smooth(0.88, 1, uu)); if (al < 0.05) continue;
        onPath(q.path, uu, out); const [x, y] = P(out); c.globalAlpha = al * 0.8; c.beginPath(); c.arc(x, y, Math.max(1.2, u * 0.012 * q.size), 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
    }
    /* for tests */
    debug() { return { mode: this.mode, frames: this.frames, yaw: this.yaw, pitch: this.pitch, running: !!this.frame, quality: this.quality, model: Object.assign({}, this.model), size: this.cv ? [this.cv.width, this.cv.height] : null, disposed: this.disposed, buffers: this.res ? this.res.buffers.length : 0 }; }
    readPixels() {
      if (!this.cv) return null;
      this.render(false);
      const tmp = document.createElement('canvas'); tmp.width = this.cv.width; tmp.height = this.cv.height;
      const c = tmp.getContext('2d'); c.drawImage(this.cv, 0, 0);
      return c.getImageData(0, 0, tmp.width, tmp.height).data;
    }
  }

  g.SereinLungs = { LungsOrb, breathe, buildLung, buildAirways, lungPoint };
  g.Serein = g.Serein || {};
  g.Serein.Orb = LungsOrb;
})(globalThis);

;
/* Serein artwork: places the owner's illustrations by context. Runs after each render; every image is decorative, lazy and optional. */
(function (g) {
  'use strict';
  const d = document, BASE = (d.querySelector('link[rel=manifest]') || { getAttribute: () => '/serein/' }).getAttribute('href').replace(/manifest\.webmanifest.*$/, '') + 'art/';
  const PRACTICE = ['tide', 'box', 'ground', 'release', 'desk', 'scan', 'handreset', 'shoulderreset', 'ankles', 'listen', 'quietplace', 'walk', 'pause3', 'fullrelease', 'winddown'];
  const GUIDE = { boundaries: 'boundaries', 'difficult-talk': 'difficult-talk', 'manager-support': 'manager-support', 'peer-check': 'peer-check', priorities: 'priorities', 'small-win': 'small-win' };
  const JOURNEY = { 'Finding your pause': 'shift-start', 'Working with boundaries': 'week', 'Leaving the shift': 'shift-end' };
  const TK = { before: 'before-shift', between: 'between-tasks', hard: 'after-hard-moment', after: 'after-shift', talk: 'talking-to-others', week: 'this-week' };
  const $ = (s, r) => (r || d).querySelector(s), $$ = (s, r) => [...(r || d).querySelectorAll(s)];
  const url = (n, sm) => BASE + n + (sm ? '-sm' : '') + '.webp';
  const img = (n, cls, sm) => { const i = d.createElement('img'); i.className = 'sa-img ' + (cls || ''); i.src = url(n, sm); i.alt = ''; i.decoding = 'async'; i.loading = 'lazy'; i.onerror = () => i.remove(); return i; };
  const pic = (n, cls) => { const p = d.createElement('picture'); p.className = 'sa-pic ' + (cls || ''); const s = d.createElement('source'); s.media = '(max-width:700px)'; s.srcset = url(n, true); p.append(s, img(n, '', false)); return p; };
  const night = () => { const h = new Date().getHours(); return h >= 19 || h < 6; };
  const route = () => (location.hash || '#today').slice(1);
  const done = (el, k) => { if (el.dataset.sa === k) return false; el.dataset.sa = k; return true; };
  let lastPractice = '';
  d.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-practice-detail],[data-practice]'); if (b) lastPractice = b.dataset.practiceDetail || b.dataset.practice; }, true);

  function swap(card, name) { const i = $('.card-image img', card) || $(':scope > img', card); if (!i || !PRACTICE.concat(Object.values(GUIDE), ['shift-start', 'week', 'shift-end']).length) return; delete i.dataset.src; i.src = url(name); i.alt = ''; i.removeAttribute('width'); i.removeAttribute('height'); i.classList.add('sa-swapped'); }
  function run() {
    const r = route();
    $$('.practice-card [data-practice-detail]').forEach(b => { const c = b.closest('.practice-card'); if (PRACTICE.includes(b.dataset.practiceDetail) && done(c, 'p')) swap(c, 'practice-' + b.dataset.practiceDetail); });
    $$('.resource-card [data-resource]').forEach(b => { const n = GUIDE[b.dataset.resource], c = b.closest('.resource-card'); if (n && done(c, 'g')) swap(c, 'guide-' + n); });
    $$('.journey-card').forEach(c => { const n = JOURNEY[($('h2', c) || {}).textContent]; if (n && done(c, 'j')) { const i = $(':scope > img', c); if (i) { delete i.dataset.src; i.src = url('journey-' + n); i.alt = ''; i.classList.add('sa-swapped'); } } });
    $$('.hs-act').forEach(c => { const b = $('[data-practice]', c); if (b && PRACTICE.includes(b.dataset.practice) && done(c, 'a')) c.prepend(img('practice-' + b.dataset.practice, 'sa-act')); });
    const hero = $('.hs-hero-art'); if (hero && done(hero, 'h')) hero.prepend(pic(night() ? 'today-hero-night' : 'today-hero-day', 'sa-hero'));
    $$('#main [id^="tk-g-"]').forEach(s => { const n = TK[s.id.slice(5)]; if (n && done(s, 't')) s.prepend(img('toolkit-' + n, 'sa-tk')); });
    const lib = $('.library-heading'); if (lib && done(lib, 'l')) lib.before(pic('library-banner', 'sa-banner'));
    const atl = $('.infographic-heading'); if (atl && done(atl, 'v')) atl.before(pic('visual-atlas-banner', 'sa-banner'));
    const help = $('.help-now'); if (help && done(help, 's')) help.before(pic('support-banner', 'sa-banner'));
    const emp = $('#main .empty'); if (emp && done(emp, 'e')) { const n = /saved/.test(r) ? 'saved' : /journal/.test(r) ? 'journal' : ''; if (n) emp.prepend(img('empty-' + n, 'sa-empty')); }
    const rt = r === 'me/routine' && $('#main .workspace-tools'); if (rt && done(rt, 'r')) rt.before(img('empty-routine', 'sa-empty sa-lone'));
    const inv = $('#main .sr-invite-art'); if (inv && done(inv, 'i')) { inv.textContent = ''; inv.removeAttribute('aria-hidden'); inv.classList.add('sa-has'); inv.append(img('empty-insights', 'sa-empty')); }
    const pv = r === 'me/data' && $('#main .journal-panel'); if (pv && done(pv, 'pv')) pv.prepend(img('privacy-device', 'sa-priv'));
    const ob = $('#modal-content .onboarding-step'); if (ob) { const s = ob.dataset.step; const n = { 0: 'onboard-welcome', 1: 'onboard-setup', 2: 'privacy-device' }[s]; if (n && done(ob, 'o')) ob.prepend(img(n, 'sa-onb')); }
    const hk = $('dialog.serein-hook[data-step="breath"]'); if (hk && done(hk, 'hk')) hk.prepend(pic('hook-breath', 'sa-hook'));
    const art = $('#modal-content > .article-image'); if (art && done(art, 'm') && PRACTICE.includes(lastPractice)) { art.src = url('practice-' + lastPractice); art.alt = ''; }
  }
  let t = 0; const queue = () => { clearTimeout(t); t = setTimeout(run, 40); };
  new MutationObserver(queue).observe(d.documentElement, { childList: true, subtree: true });
  addEventListener('hashchange', queue); run();
  g.SereinArt = {
    complete(on) { const st = $('#player-stage'); if (!st) return; let a = $('.sa-done', st); if (on && !a) { a = d.createElement('div'); a.className = 'sa-done'; a.setAttribute('aria-hidden', 'true'); a.append(img('practice-complete')); st.prepend(a); } if (a) a.hidden = !on; }
  };
})(globalThis);
