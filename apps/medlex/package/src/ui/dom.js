// Phase 1: canonical ui/dom implementation.


export const $ = (s, el = document) => el.querySelector(s);
export const main = $('#main');
export const modal = $('#modal');
export const modalContent = $('#modalContent');
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[c]);
export function $$(s, el = document) {
  return [...el.querySelectorAll(s)];
}
