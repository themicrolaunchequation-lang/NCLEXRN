/* MedLex Learning Studio, entry points. Small and always loaded: it adds "Learn as slides" to the Learn page and to each module page,
   shows where you are, and loads the studio bundle (engine, module data, deck builder) the first time it is needed. */
(function () {
  'use strict';
  const SRC = window.MEDLEX_SRC; if (!SRC) return;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const LN = window.MEDLEX_LEARN || null, LK = 'medlex.lesson.v1';
  const lget = () => { try { return JSON.parse(localStorage.getItem(LK) || '{}') || {}; } catch { return {}; } };
  const lput = (file, patch) => { try { const o = lget(); o[file] = Object.assign(o[file] || {}, patch); localStorage.setItem(LK, JSON.stringify(o)); } catch { } };
  const lessonFile = id => LN && (LN.map[id] || (LN.extra.find(x => x.id === id) || {}).id);
  const lessonProg = file => { const p = lget()[file] || {}; const total = (LN.titles[file] || {}).slides || 0, visited = [...new Set((p.visited || []).filter(n => Number.isInteger(n) && n >= 0 && n < total))]; return { started: !!p.started, done: !!p.done, last: p.last || 0, at: p.at || 0, total, pct: p.done ? 100 : total ? Math.round(100 * visited.length / total) : 0, visited: visited.length, deck: true }; };
  const none = { started: false, done: false, last: 0, at: 0, total: 0, pct: 0 };
  function prog(id) { if (lessonFile(id)) return lessonProg(lessonFile(id)); try { const p = JSON.parse(localStorage.getItem('medlex.studio.v1.' + id) || 'null') || {}, n = p.total || 0, v = (p.visited || []).length; return { started: !!p.started, done: !!p.done, last: p.last || 0, at: p.at || 0, total: n, pct: n ? Math.round(100 * Math.min(v, n) / n) : 0 }; } catch { return none; } }
  const label = p => p.done ? 'Review' : p.started ? 'Continue' : 'Start';
  const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M7 4l13 8-13 8z"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';

  let toastT = 0; const pending = {};
  /* one loader for every lazily fetched bundle: engine, studio (module data + decks), lib (Library, Atlas, Practice), glossary */
  window.MedlexLoad = name => {
    const ready = { engine: () => window.HCAStudio, studio: () => window.MedlexStudio && window.MedlexStudio.ready, lib: () => window.MedlexLib && window.MedlexLib.route, glossary: () => window.MEDLEX_GLOSSARY, wordparts: () => window.MedlexWordparts }[name];
    if (ready && ready()) return Promise.resolve();
    return pending[name] || (pending[name] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = SRC[name]; s.onload = res; s.onerror = () => { delete pending[name]; rej(new Error(name)); }; document.head.append(s); }));
  };
  function say(msg) { let t = $('.ms-toast'); if (!t) { t = document.createElement('div'); t.className = 'ms-toast'; t.setAttribute('role', 'status'); document.body.append(t); } t.textContent = msg; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 4200); }
  const load = () => window.MedlexLoad('engine').then(() => window.MedlexLoad('studio'));
  /* Library, Visual Atlas and Practice are rendered by lib.js; the app's router asks here first */
  const MINE = /^(library|practice|wordparts)(\/|$)|^infographics$/;
  window.MedlexV5 = { route(path, params) {
    if (!MINE.test(path)) return false;
    if (/^wordparts(\/|$)/.test(path)) {
      const want = location.hash, m = $('#main');
      if (window.MedlexWordparts) return window.MedlexWordparts.route(path, params);
      if (m) m.innerHTML = '<div class="wp-loading" role="status">Opening word studios…<i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i></div>';
      window.MedlexLoad('wordparts').then(() => { if (location.hash === want) window.MedlexWordparts.route(path, params); }).catch(() => { if (location.hash === want && m) m.innerHTML = '<p role="alert">The studio could not load. Please reload and try again.</p>'; });
      return true;
    }
    if (window.MedlexLib && window.MedlexLib.route) return window.MedlexLib.route(path, params);
    const m = $('#main'), want = location.hash; if (m) m.innerHTML = '<div class="lx-loading" role="status">Loading…</div>';
    window.MedlexLoad('engine').then(() => window.MedlexLoad('lib')).then(() => { if (location.hash === want) window.MedlexLib.route(path, params); }).catch(() => { if (m) m.innerHTML = '<div class="lx-loading" role="alert">This page could not load. Check your connection and reload.</div>'; });
    return true;
  } };
  const FREE = ['ch1', 'ch2', 'prefixes', 'suffixes'];   /* same free modules as the router's gate */
  function gated(id) { if (LN && LN.extra.some(x => x.id === id)) { if (LN.extra.find(x => x.id === id).free) return false; try { const H = window.HCA; if (H && H.locked && H.locked('medlex')) { setTimeout(() => H.paywall('medlex', 'this lesson')); return true; } } catch { } return false; } try { const H = window.HCA; if (H && H.locked && H.locked('medlex') && !FREE.includes(id)) { setTimeout(() => H.paywall('medlex', 'this module')); return true; } } catch { } return false; }
  function open(id, opts, btn) {
    if (gated(id)) return Promise.resolve();
    if (lessonFile(id)) { openLesson(lessonFile(id), id); return Promise.resolve(); }
    if (btn) btn.classList.add('is-busy');
    return load().then(() => window.MedlexStudio.open(id, opts)).catch(() => say('The studio could not load. Check your connection and try again.')).finally(() => btn && btn.classList.remove('is-busy'));
  }

  /* ---------- lessons: the supplied decks open full-screen in a frame; links inside the frame are kept inside the app ---------- */
  const lessonTitle = (file, id) => (LN.extra.find(x => x.id === id) || {}).title || ((LN.titles[file] || {}).title) || file;
  /* Same-origin frame: app links go to the app, other sites open in a new tab, sibling lessons load in place. */
  function wireFrame(fr, hooks) {
    function hook() {
      let doc; try { doc = fr.contentDocument; } catch { return; } if (!doc || doc.__mlw) return; doc.__mlw = true;
      doc.addEventListener('click', e => {
        const a = e.target.closest && e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey) return;
        const raw = a.getAttribute('href') || ''; if (/^(javascript:|mailto:|tel:|#)/i.test(raw)) { if (raw === '#') e.preventDefault(); return; }
        let u; try { u = new URL(a.href); } catch { return; }
        if (u.origin !== location.origin) { e.preventDefault(); window.open(u.href, '_blank', 'noopener'); return; }
        if (u.pathname.startsWith(LN.base) && /\.html$/.test(u.pathname)) { if (hooks && hooks.sibling) { e.preventDefault(); hooks.sibling(u.pathname.slice(LN.base.length).replace(/\.html$/, '')); } return; }
        e.preventDefault(); if (hooks && hooks.leave) hooks.leave(); if (u.hash) location.hash = u.hash; else location.href = u.href;
      }, true);
    }
    fr.addEventListener('load', hook); hook();
  }
  window.MedlexFrame = { wire: wireFrame };
  let lv = null;
  function openLesson(file, id) {
    if (!LN) return; if (lv) lv.close();
    const dlg = document.createElement('dialog'); dlg.className = 'ml'; dlg.setAttribute('aria-labelledby', 'ml-t');
    dlg.innerHTML = `<header class="ml-bar"><button type="button" class="ml-x" data-ml="close" aria-label="Close the lesson" title="Close (Esc)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button><h2 id="ml-t"></h2><div class="ml-acts"><button type="button" class="ml-done" data-ml="done" aria-pressed="false"><span></span></button><a class="ml-new" target="_blank" rel="noopener">Open in a new tab</a></div></header><div class="ml-body"><iframe class="ml-frame" title="Lesson" src="about:blank"></iframe><p class="ml-load" role="status">Opening the lesson…</p></div>`;
    document.body.append(dlg);
    const fr = dlg.querySelector('iframe'), q = s => dlg.querySelector(s); let cur = file, curId = id, tm = 0, progressWatch = null;
    function show(f, i) {
      cur = f; curId = i || Object.keys(LN.map).find(k => LN.map[k] === f) || f; const t = lessonTitle(f, curId);
      q('#ml-t').textContent = t; fr.title = t + ' (lesson)'; dlg.setAttribute('aria-label', t); q('.ml-new').href = LN.base + f + '.html';
      const p = lessonProg(f); lput(f, { started: true, at: Date.now() }); paintDone(p.done);
      q('.ml-load').hidden = false; fr.src = LN.base + f + '.html';
      clearTimeout(tm); tm = setTimeout(() => { try { if (window.HCA && window.HCA.daily) window.HCA.daily.done('medlex'); } catch { } }, 45000);
    }
    function paintDone(on) { const b = q('.ml-done'); b.setAttribute('aria-pressed', String(on)); b.querySelector('span').textContent = on ? 'Done ✓' : 'Mark as done'; }
    fr.addEventListener('load', () => {
      const d = fr.contentDocument; if (!d || !d.querySelector('.course-nav')) return;
      q('.ml-load').hidden = true; if (progressWatch) progressWatch.disconnect();
      const saved = lessonProg(cur), nav = [...d.querySelectorAll('[data-nav]')];
      if (saved.started && !saved.done && saved.last > 0) nav[saved.last]?.click();
      const record = () => {
        const active = d.querySelector('[data-nav][aria-current="true"]'); if (!active) return;
        const last = Number(active.dataset.nav), old = lget()[cur] || {}, visited = [...new Set([...(old.visited || []), last])];
        lput(cur, { last, visited, at: Date.now(), started: true });
      };
      progressWatch = new MutationObserver(record); progressWatch.observe(d.querySelector('.course-nav'), { subtree: true, attributes: true, attributeFilter: ['aria-current'] }); record();
    });
    wireFrame(fr, { sibling: slug => { if (LN.titles[slug]) show(slug); }, leave: () => close() });
    function close() { clearTimeout(tm); if (progressWatch) progressWatch.disconnect(); try { dlg.close(); } catch { } dlg.remove(); lv = null; window.dispatchEvent(new Event('medlex-studio-closed')); const back = document.querySelector(`[data-ms-open="${curId}"]`); back && back.focus && back.focus({ preventScroll: true }); }
    dlg.addEventListener('click', e => { const b = e.target.closest('[data-ml]'); if (!b) return; if (b.dataset.ml === 'close') close(); else if (b.dataset.ml === 'done') { const on = b.getAttribute('aria-pressed') !== 'true'; lput(cur, { done: on, started: true }); paintDone(on); } });
    dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
    dlg.showModal(); show(file, id); lv = { close };
  }
  const modId = href => (String(href || '').match(/#learn\/module\/([^/?#]+)/) || [])[1];
  function make(id, title, cls) {
    const p = prog(id), b = document.createElement('button');
    b.type = 'button'; b.className = cls; b.dataset.msOpen = id; b.dataset.msTitle = title || '';
    paint(b, p); return b;
  }
  function paint(b, p) {
    const l = label(p); b.dataset.msStart = p.started && !p.done ? p.last : 0;
    b.innerHTML = (p.done ? CHECK : PLAY) + `<span>${l}</span>` + (p.started && !p.done && p.pct ? `<i class="ms-meter" aria-hidden="true"><b style="width:${p.pct}%"></b></i>` : '');
    b.setAttribute('aria-label', `${l}${b.dataset.msTitle ? ': ' + b.dataset.msTitle : ''}`);
  }
  function inject() {
    const main = $('#main'); if (!main) return;
    $$('.module-row:not([data-ms])', main).forEach(row => {
      const a = $('a[href*="#learn/module/"]', row), id = a && modId(a.getAttribute('href')), host = $('.module-row-main', row); row.dataset.ms = '1';
      if (id && host) { host.append(make(id, ($('h3', row) || {}).textContent, 'ms-row')); if (lessonFile(id)) { row.dataset.deck = id; host.insertAdjacentHTML('beforeend', `<a class="ml-more" href="#learn/module/${id}/overview">Outcomes and practice</a>`); } }
    });
    if (LN) LN.extra.forEach(x => {
      if ($(`[data-deck="${x.id}"]`, main)) return;
      const collection = $('.course-path', main); if (!collection) return;
      const filter = $('[data-modern="learnStatus"][aria-pressed="true"]', main)?.dataset.value || 'all';
      const query = ($('#courseSearch', main)?.value || '').trim().toLowerCase();
      if (!window.MedlexStudioEntry.matches(x.id, filter) || (query && !(x.title + ' ' + x.sub).toLowerCase().includes(query))) return;
      const anchor = $(`[data-deck="${x.before || x.after}"]`, main);
      if (!anchor && $('[data-modern="learnView"].active', main)?.dataset.value === 'systems') return;
      let fallback;
      if (!anchor) {
        const group = ['history', 'components'].includes(x.id) ? 'Foundations & word elements' : x.id === 'country-differences' ? 'The body as a framework' : 'Specialist clinical language';
        let section = $$('.course-part', collection).find(s => $('h2', s)?.textContent === group);
        if (!section) { if (!$('.module-row', collection)) collection.replaceChildren(); section = document.createElement('section'); section.className = 'course-part'; const heading = document.createElement('h2'); heading.textContent = group; section.append(heading, document.createElement('div')); collection.append(section); }
        fallback = section.lastElementChild;
      }
      const row = document.createElement('article'); row.className = 'module-row'; row.dataset.ms = '1'; row.dataset.deck = x.id;
      row.innerHTML = `<div class="module-index">New</div><div class="module-row-main"><h3><a href="#learn" data-ms-open="${x.id}" data-ms-title="${x.title}">${x.title}</a></h3><p>${x.sub}</p><small>${x.slides} slides · interactive lesson</small></div><span class="status-chip">Lesson</span>`;
      const b = make(x.id, x.title, 'ms-row'); row.querySelector('.module-row-main').append(b);
      if (anchor) { if (x.before) anchor.before(row); else anchor.after(row); } else fallback.append(row);
    });
    $$('.module-row:not([data-lesson-card])', main).forEach((row, index) => {
      const button = $('button[data-ms-open]', row); if (!button) return;
      const id = button.dataset.msOpen, file = lessonFile(id), meta = file && LN.titles[file], p = prog(id);
      const title = $('h3', row), purpose = $('.module-row-main > p', row), overview = $('.ml-more', row);
      if (!title) return;
      row.dataset.lessonCard = '1'; row.classList.add('ml-card');
      const top = document.createElement('div'); top.className = 'ml-card-top';
      const number = document.createElement('span'); number.className = 'ml-card-number'; number.textContent = String($$('.module-row', main).indexOf(row) + 1).padStart(2, '0');
      const status = document.createElement('span'); status.className = 'ml-card-status'; top.append(number, status);
      const copy = document.createElement('div'); copy.className = 'ml-card-copy'; copy.append(title);
      if (purpose) { purpose.title = purpose.textContent; copy.append(purpose); }
      const details = document.createElement('p'); details.className = 'ml-card-meta';
      details.textContent = meta ? `${meta.slides} slides · ~${Math.ceil(meta.slides * .75)} min` : `${p.total || 13} slides · ~10 min`;
      const progress = document.createElement('div'); progress.className = 'ml-card-progress';
      const actions = document.createElement('div'); actions.className = 'ml-card-actions'; actions.append(button); if (overview) actions.append(overview);
      row.replaceChildren(top);
      if (meta && meta.image) { const image = document.createElement('img'); image.className = 'ml-card-image'; image.src = LN.base + meta.image; image.alt = meta.alt; image.loading = 'lazy'; image.decoding = 'async'; image.width = 480; image.height = 240; row.append(image); }
      row.append(copy, details, progress, actions); updateCard(row, p);
    });
    const ha = $('.view-header .header-actions', main);
    if (ha && !$('.ms-cta', ha)) {
      const here = modId(location.hash), link = $('a[href*="#learn/module/"]', ha);
      if (here) ha.prepend(make(here, ($('.view-header h1', main) || {}).textContent, 'ms-cta'));
      else if (link) {
        let id = modId(link.getAttribute('href')), best = 0;
        $$('[data-ms-open]', main).forEach(b => { const p = prog(b.dataset.msOpen); if (p.started && !p.done && p.at > best) { best = p.at; id = b.dataset.msOpen; } });
        const row = $$('[data-ms-open]', main).find(b => b.dataset.msOpen === id), cta = make(id, row ? row.dataset.msTitle : '', 'ms-cta is-two');
        if (cta.dataset.msTitle) cta.insertAdjacentHTML('beforeend', `<small>${cta.dataset.msTitle.replace(/[<>&]/g, '')}</small>`);
        ha.prepend(cta); link.remove();
      }
    }
  }
  function updateCard(row, p) {
    row.dataset.state = p.done ? 'done' : p.started ? 'progress' : 'new';
    $('.ml-card-status', row).textContent = p.done ? 'Completed' : p.started ? 'In progress' : 'Not started';
    const box = $('.ml-card-progress', row), title = $('h3', row).textContent;
    box.replaceChildren(); const meter = document.createElement('progress'); meter.max = 100; meter.value = p.done ? 100 : p.pct; meter.setAttribute('aria-label', title + ': slides viewed');
    const text = document.createElement('span'); text.textContent = p.done ? 'Lesson completed' : p.deck ? `${p.visited} of ${p.total} slides viewed` : `${p.pct}% viewed`;
    box.append(meter, text);
  }
  document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.module-row[data-deck] h3 a[href*="#learn/module/"], .module-row[data-deck] > a.icon-button'); if (t) { const row = t.closest('.module-row'); e.preventDefault(); e.stopPropagation(); open(row.dataset.deck); return; } const b = e.target.closest && e.target.closest('[data-ms-open]'); if (!b) return; e.preventDefault(); open(b.dataset.msOpen, b.dataset.msStart && b.dataset.msStart !== '0' ? { start: +b.dataset.msStart } : { start: 0 }, b); });
  window.addEventListener('medlex-studio-closed', () => $$('button[data-ms-open]').forEach(b => { const p = prog(b.dataset.msOpen); paint(b, p); const row = b.closest('.ml-card'); if (row) updateCard(row, p); }));
  window.MedlexStudioEntry = { open, progress: prog, matches: (id, state) => { const p = prog(id); return state === 'all' || (state === 'done' ? p.done : state === 'progress' ? p.started && !p.done : !p.started && !p.done); } };
  let raf = 0; const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; inject(); }); };
  const start = () => { const main = $('#main'); if (!main) return; new MutationObserver(schedule).observe(main, { childList: true, subtree: true }); window.addEventListener('hashchange', schedule); inject(); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
})();
