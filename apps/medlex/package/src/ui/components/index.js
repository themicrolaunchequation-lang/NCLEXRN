// Phase 1: canonical ui/components/index implementation.
import { INLINE_ASSETS } from '../../data/config.js';
import { termVisualIcon } from '../../features/library/visuals.js';
import { hideMeaningTip } from '../../features/settings/language.js';
import { stopEnglishAudio } from '../../features/settings/voice.js';
import { app } from '../../state/runtime.js';
import { chapter, termCount } from '../../state/selectors.js';
import { $, $$, esc, main, modal, modalContent } from '../dom.js';
export function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 3200);
}
export function header(kicker, title, desc, extra = '') {
  return `<div class="view-header"><div><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${desc}</p></div>${extra}</div>`;
}
export function termCard(t) {
  return `<button class="term-card" data-action="term" data-id="${t.id}"><span class="tag">${esc(chapter(t.chapter).name)}</span><span class="term-card-symbol" aria-hidden="true">${termVisualIcon(t)}</span><span class="card-heading h3">${esc(t.term)}</span><p>${esc(t.definition)}</p><span class="card-foot">${app.state.learned.includes(t.id) ? '<i class="learnt-dot"></i> Familiar' : app.state.saved.includes(t.id) ? '◆ Saved to your collection' : 'Explore word & meaning'}</span><span class="arrow">↗</span></button>`;
}
export function systemCard(id) {
  const c = chapter(id);
  return `<button class="system-card" data-action="chapter" data-id="${c.id}"><div class="system-image"><img src="${INLINE_ASSETS[c.image]}" alt="Illustrative anatomical ${c.image === 'heart' ? 'heart' : c.image === 'lungs' ? 'lungs and trachea' : 'brain'} model" loading="lazy" width="500" height="350"><span class="number">CHAPTER ${String(c.id).padStart(2, '0')}</span><span class="round-arrow">↗</span></div><div class="system-body"><span class="card-heading h3">${esc(c.name)}</span><p>${esc(c.tagline)}</p><div class="system-meta"><span>${termCount(id)} curated terms</span><span>Rooted in understanding</span></div></div></button>`;
}
export function showModal(html, eyebrow = 'EXPLORE & UNDERSTAND') {
  modal.classList.remove('bottom-sheet');
  hideMeaningTip();
  modal.classList.toggle('term-dialog', html.includes('class="term-detail"'));
  if (!modal.open) {
    app.returnFocus = document.activeElement;
    modal.showModal();
  }
  $('#modalEyebrow').textContent = eyebrow;
  modalContent.innerHTML = html;
  modal.scrollTop = 0;
  const title = $('#modalTitle');
  if (title) {
    title.setAttribute('tabindex', '-1');
    title.focus({
      preventScroll: true
    });
  }
}
export function closeModal() {
  hideMeaningTip();
  stopEnglishAudio();
  modal.classList.remove("term-dialog", "bottom-sheet");
  modal.close();
  app.activeTerm = null;
  if (app.returnFocus && app.returnFocus.isConnected) app.returnFocus.focus({
    preventScroll: true
  });else main.focus({
    preventScroll: true
  });
}
/** Reuse records with the same key while updating their complete rendered content. */
export function renderKeyedList(target, rows, tail='') {
 const old=new Map([...target.children].filter(e=>e.dataset.id).map(e=>[e.dataset.id,e]));
 const children=rows.map(({key,html})=>{
  const t=document.createElement('template');t.innerHTML=html;const next=t.content.firstElementChild,existing=old.get(key);
  if(existing?.isEqualNode(next))return existing;
  if(existing){for(const a of [...existing.attributes])if(!next.hasAttribute(a.name))existing.removeAttribute(a.name);for(const a of next.attributes)existing.setAttribute(a.name,a.value);existing.replaceChildren(...next.childNodes);return existing;}
  return next;
 });
 const t=document.createElement('template');t.innerHTML=tail;
 target.replaceChildren(...children,...t.content.childNodes);
}
