/* MedLex Library, Visual Atlas and Practice: shared helpers, state and the route hook.
   Loaded on demand (lib.<hash>.js). The app's router calls MedlexLib.route(path, params) for library/*, practice/* and infographics. */
(function () {
  'use strict';
  const D = window.MEDLEX_LIB; if (!D) return;
  const d = document, $ = (s, r) => (r || d).querySelector(s), $$ = (s, r) => [...(r || d).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (a, n) => shuffle(a).slice(0, n);
  const uniq = a => [...new Set(a)];
  const lc = s => s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const trim = s => String(s || '').replace(/\.$/, '');
  const bare = f => String(f).toLowerCase().replace(/[^a-z]/g, '');

  /* ---------- state (this device only) ---------- */
  const KEY = 'medlex.lib.v1';
  let st; try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { st = null; }
  st = Object.assign({ saved: [], know: {}, srs: {}, days: {}, best: {}, atlasLast: '' }, st || {});
  let saveT = 0; const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { } }, 250); };
  addEventListener('pagehide', () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { } });
  const day = () => { const n = new Date(); return Math.floor((n.getTime() - n.getTimezoneOffset() * 6e4) / 864e5); };
  const BOX_DAYS = [1, 1, 3, 7, 14, 30];

  /* ---------- data ---------- */
  const words = D.words, wordById = Object.fromEntries(words.map(w => [w.id, w])), wordByName = Object.fromEntries(words.map(w => [w.term.toLowerCase(), w]));
  const sysName = ch => (D.chapterName[ch] || 'General').replace(/ system$/i, '');
  const prefixes = D.prefixes.map(x => Object.assign({ k: 'p' }, x)), suffixes = D.suffixes.map(x => Object.assign({ k: 's' }, x)), roots = D.roots.map(x => Object.assign({ k: 'r', t: 'root' }, x));
  const parts = [...prefixes, ...roots, ...suffixes], partById = Object.fromEntries(parts.map(p => [p.id, p]));
  const KIND = { p: 'Prefix', r: 'Root', s: 'Suffix', v: 'Linking vowel' }, KIND_PL = { p: 'Prefixes', r: 'Roots', s: 'Suffixes' };
  const isKnown = id => !!st.know[id] || ((st.srs[id] || {}).b || 0) >= 3;
  const touch = (id, ok) => { const s = st.srs[id] || { b: 0, d: 0 }; s.b = ok ? Math.min(5, s.b + 1) : 0; s.d = day() + (ok ? BOX_DAYS[s.b] : 1); st.srs[id] = s; st.days[day()] = (st.days[day()] || 0) + 1; save(); try { window.HCA && window.HCA.daily && window.HCA.daily.done('medlex'); } catch { } };
  const dueIds = () => Object.entries(st.srs).filter(([, s]) => s.b > 0 && s.d <= day()).map(([id]) => id);
  const knownCount = () => parts.filter(p => isKnown(p.id)).length + words.filter(w => isKnown('w:' + w.id)).length;
  const totalItems = parts.length + words.length;
  const isSaved = id => st.saved.includes(id);
  const toggleSaved = id => { st.saved = isSaved(id) ? st.saved.filter(x => x !== id) : [...st.saved, id]; save(); return isSaved(id); };

  /* ---------- shared markup ---------- */
  const ICON = { listen: 'M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13', save: 'M6 3h12v18l-6-4-6 4z', check: 'M5 12.5l4.5 4.5L19 7', arrow: 'M5 12h14M13 6l6 6-6 6', search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3', play: 'M7 4l13 8-13 8z', expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7', flame: 'M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z', repeat: 'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3', x: 'M6 6l12 12M18 6L6 18', puzzle: 'M4 4h6v3a2 2 0 1 0 4 0V4h6v6h-3a2 2 0 1 0 0 4h3v6h-6v-3a2 2 0 1 0-4 0v3H4z', book: 'M4 19.5V5a2 2 0 0 1 2-2h14v16H6.5A2.5 2.5 0 0 0 4 21.5M4 19.5A2.5 2.5 0 0 1 6.5 17H20', pencil: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', link: 'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1', layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z', note: 'M4 4h16v13H8l-4 4zM8 9h8M8 13h5', flash: 'M4 6h16v12H4zM8 10h8', pairs: 'M3 3h8v8H3zM13 13h8v8h-8zM15 5h4M5 15h4' };
  const ic = (n, c) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${c ? ` class="${c}"` : ''}><path d="${ICON[n] || ICON.arrow}"/></svg>`;
  const header = (title, lead, actions, eyebrow) => `<header class="view-header modern-header"><div>${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ''}<h1 tabindex="-1">${esc(title)}</h1>${lead ? `<p>${esc(lead)}</p>` : ''}</div>${actions ? `<div class="header-actions">${actions}</div>` : ''}</header>`;
  const tabs = (items, cur, label) => `<nav class="lx-tabs" aria-label="${esc(label)}">${items.map(([id, name, href]) => `<a href="${href}" class="lx-tab${id === cur ? ' is-on' : ''}"${id === cur ? ' aria-current="page"' : ''}>${esc(name)}</a>`).join('')}</nav>`;
  const tile = (k, text, meaning, i) => `<span class="lx-tile k-${k}" style="--i:${i || 0}"><span class="lx-s">${KIND[k] || ''}</span><b>${esc(text)}</b>${meaning ? `<em>${esc(meaning)}</em>` : ''}</span>`;
  const main = () => $('#main');
  const mount = (html, h1Focus = true) => { const m = main(); m.innerHTML = html; if (h1Focus) { const h = $('h1', m); h && h.focus({ preventScroll: true }); } scrollTo(0, 0); return m; };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || d.documentElement.dataset.hsMotion === 'off';
  const speak = text => { try { const v = speechSynthesis.getVoices().filter(x => /^en\b/i.test(x.lang)); speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.voice = v.find(x => /^en-GB/i.test(x.lang)) || v[0] || null; u.rate = .85; speechSynthesis.speak(u); } catch { } };
  const canSpeak = () => 'speechSynthesis' in window;
  const loadGlossary = () => window.MEDLEX_GLOSSARY ? Promise.resolve(window.MEDLEX_GLOSSARY) : window.MedlexLoad('glossary').then(() => window.MEDLEX_GLOSSARY);

  /* ---------- routing ---------- */
  const views = { handlers: [], cleanup: [] };
  const L = window.MedlexLib = { D, st, save, esc, $, $$, clamp, shuffle, sample, uniq, lc, cap, trim, bare, words, wordById, wordByName, sysName, prefixes, suffixes, roots, parts, partById, KIND, KIND_PL, isKnown, touch, dueIds, knownCount, totalItems, isSaved, toggleSaved, day, ic, header, tabs, tile, mount, main, reduced, speak, canSpeak, loadGlossary, views, BOX_DAYS };
  L.on = (name, fn) => { views[name] = fn; };
  L.route = (path, params) => {
    views.cleanup.splice(0).forEach(f => { try { f(); } catch { } });
    try { const h = path === 'infographics' ? views.atlas : /^wordparts(\/|$)/.test(path) ? views.wordparts : path.startsWith('library') ? views.library : views.practice; if (!h) return false; h(path, params); return true; }
    catch (e) { console.error(e); mount(header('Something went wrong', 'Please reload the page. Your progress is stored on this device and is safe.')); return true; }
  };
  /* one delegated listener for every [data-lx] control on these pages */
  d.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-lx]'); if (!b || !main().contains(b)) return; const fn = views.handlers[b.dataset.lx]; if (fn) { e.preventDefault(); fn(b, e); } });
  L.act = (name, fn) => { views.handlers[name] = fn; };
  d.addEventListener('input', e => { const t = e.target; if (t.dataset && t.dataset.lxInput && views.handlers[t.dataset.lxInput]) views.handlers[t.dataset.lxInput](t, e); });
  d.addEventListener('change', e => { const t = e.target; if (t.dataset && t.dataset.lxChange && views.handlers[t.dataset.lxChange]) views.handlers[t.dataset.lxChange](t, e); });
  L.openStudio = (deck, opts) => (window.HCAStudio ? window.HCAStudio.open(deck, opts) : null);
})();
