// Phase 1: canonical features/search/index implementation.
import { groupedSearch } from '../practice/additional.js';
import { app } from '../../state/runtime.js';
import { showModal } from '../../ui/components/index.js';
import { $, esc } from '../../ui/dom.js';

export function search() {
  app.activeTerm = null;
  app.searchFocus = -1;
  showModal(`<div class="command-palette"><h2 id="modalTitle" class="modal-title">Search MedLex</h2><label class="palette-search"><span>Find a term, word part, module or action</span><input id="globalSearch" class="search-modal-input" type="search" placeholder="Try heart, -itis or cardi…" autocomplete="off" aria-controls="globalResults"></label><div id="paletteCount" class="visually-hidden" role="status"></div><div class="search-results" id="globalResults"></div><p class="access-note">↑ ↓ choose · Enter open · Esc close</p></div>`, 'SEARCH & ACTIONS');
  groupedSearch('');
  $('#globalSearch').focus();
}
export function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  let row = Array.from({
    length: b.length + 1
  }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) next[j] = Math.min(next[j - 1] + 1, row[j] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    row = next;
  }
  return row[b.length];
}
export function paletteHighlight(value, q) {
  const at = q ? value.toLowerCase().indexOf(q.toLowerCase()) : -1;
  return at < 0 ? esc(value) : esc(value.slice(0, at)) + '<mark>' + esc(value.slice(at, at + q.length)) + '</mark>' + esc(value.slice(at + q.length));
}
