/* MedLex Library > Word parts: the three interactive quests (prefixes, roots, suffixes) in one page, one frame at a time. */
(function () {
  'use strict';
  const L = window.MedlexLib, LN = window.MEDLEX_LEARN; if (!L || !LN) return;
  const { esc, $, header, tabs, mount } = L;
  const KINDS = ['prefix', 'root', 'suffix'], KEY = 'medlex.quests.v1';
  const norm = k => ({ p: 'prefix', r: 'root', s: 'suffix', prefix: 'prefix', prefixes: 'prefix', root: 'root', roots: 'root', suffix: 'suffix', suffixes: 'suffix' }[String(k || '').toLowerCase()] || '');
  L.viewQuests = kind => {
    kind = norm(kind) || (() => { try { return norm(localStorage.getItem(KEY)); } catch { return ''; } })() || 'prefix';
    const draw = k => {
      try { localStorage.setItem(KEY, k); } catch { }
      const [name, file] = LN.quests[k], url = LN.base + file + '.html';
      mount(header('Word parts', 'Learn the pieces medical words are built from: quest through the prefixes, the roots and the suffixes.') + tabs(L.libTabs, 'parts', 'Library sections')
        + `<div class="wq-tabs" role="tablist" aria-label="Kinds of word part">${KINDS.map(x => `<button type="button" class="wq-tab" role="tab" id="wq-t-${x}" aria-selected="${x === k}" aria-controls="wq-panel" tabindex="${x === k ? 0 : -1}" data-wq="${x}">${esc(LN.quests[x][0])}</button>`).join('')}</div>`
        + `<div id="wq-panel" role="tabpanel" aria-labelledby="wq-t-${k}"><div class="wq-bar"><p>${esc(name)} quest. Your choices stay on this device.</p><a href="${url}" target="_blank" rel="noopener">Open full screen in a new tab</a></div><iframe class="wq-frame" title="${esc(name)} quest" src="${url}"></iframe></div>`, false);
      const fr = $('.wq-frame'); if (window.MedlexFrame) window.MedlexFrame.wire(fr, { sibling: slug => { const n = KINDS.find(x => LN.quests[x][1] === slug); if (n && n !== k) { draw(n); const t = $(`#wq-t-${n}`); t && t.focus(); } }, leave: () => { } });
    };
    draw(kind);
    const root = $('#main');
    root.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-wq]'); if (b) draw(b.dataset.wq); });
    root.addEventListener('keydown', e => { const b = e.target.closest && e.target.closest('[data-wq]'); if (!b || !/^Arrow(Left|Right)$/.test(e.key)) return; e.preventDefault(); const i = KINDS.indexOf(b.dataset.wq), n = KINDS[(i + (e.key === 'ArrowRight' ? 1 : 2)) % 3]; draw(n); const t = $(`#wq-t-${n}`); t && t.focus(); });
  };
})();
