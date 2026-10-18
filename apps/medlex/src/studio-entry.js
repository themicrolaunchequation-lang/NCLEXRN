/* MedLex Learning Studio, entry points. Small and always loaded: it adds "Learn as slides" to the Learn page and to each module page,
   shows where you are, and loads the studio bundle (engine, module data, deck builder) the first time it is needed. */
(function () {
  'use strict';
  const SRC = window.MEDLEX_STUDIO_SRC; if (!SRC) return;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const none = { started: false, done: false, last: 0, at: 0, total: 0, pct: 0 };
  function prog(id) { try { const p = JSON.parse(localStorage.getItem('medlex.studio.v1.' + id) || 'null') || {}, n = p.total || 0, v = (p.visited || []).length; return { started: !!p.started, done: !!p.done, last: p.last || 0, at: p.at || 0, total: n, pct: n ? Math.round(100 * Math.min(v, n) / n) : 0 }; } catch { return none; } }
  const label = p => p.done ? 'Replay as slides' : p.started && p.last > 0 ? `Resume slides · ${p.last + 1}/${p.total || 14}` : 'Learn as slides';
  const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M7 4l13 8-13 8z"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';

  let loading = null, toastT = 0;
  function say(msg) { let t = $('.ms-toast'); if (!t) { t = document.createElement('div'); t.className = 'ms-toast'; t.setAttribute('role', 'status'); document.body.append(t); } t.textContent = msg; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 4200); }
  function load() {
    if (window.MedlexStudio && window.MedlexStudio.ready) return Promise.resolve();
    return loading || (loading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = SRC; s.onload = res; s.onerror = () => { loading = null; rej(new Error('studio')); }; document.head.append(s); }));
  }
  const FREE = ['ch1', 'ch2', 'prefixes', 'suffixes'];   /* same free modules as the router's gate */
  function gated(id) { try { const H = window.HCA; if (H && H.locked && H.locked('medlex') && !FREE.includes(id)) { setTimeout(() => H.paywall('medlex', 'this module')); return true; } } catch { } return false; }
  function open(id, opts, btn) {
    if (gated(id)) return Promise.resolve();
    if (btn) btn.classList.add('is-busy');
    return load().then(() => window.MedlexStudio.open(id, opts)).catch(() => say('The studio could not load. Check your connection and try again.')).finally(() => btn && btn.classList.remove('is-busy'));
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
      if (id && host) host.append(make(id, ($('h3', row) || {}).textContent, 'ms-row'));
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
        ha.prepend(cta);
      }
    }
  }
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-ms-open]'); if (!b) return; e.preventDefault(); open(b.dataset.msOpen, b.dataset.msStart && b.dataset.msStart !== '0' ? { start: +b.dataset.msStart } : { start: 0 }, b); });
  window.addEventListener('medlex-studio-closed', () => $$('[data-ms-open]').forEach(b => paint(b, prog(b.dataset.msOpen))));
  window.MedlexStudioEntry = { open, progress: prog };
  let raf = 0; const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; inject(); }); };
  const start = () => { const main = $('#main'); if (!main) return; new MutationObserver(schedule).observe(main, { childList: true, subtree: true }); window.addEventListener('hashchange', schedule); inject(); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
})();
