/* MedLex first visit: decode one real medical term by tapping its parts.
   Terms, parts and meanings come from the course's own TERMS collection (injected at build time as MEDLEX_HOOK_TERMS).
   Loaded before the app so a brand-new visitor is detected before the app writes its own storage. */
(function(){
'use strict';
const TERMS=window.MEDLEX_HOOK_TERMS||[],KEY='medlex-hook-v1';
const store=k=>{try{return localStorage.getItem(k);}catch{return null;}};
const firstVisit=TERMS.length&&!store(KEY)&&!store('medlex-v1')&&!store('medlex-course-v2')&&!new URLSearchParams(location.search).has('nohook');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let dialog=null,index=0,found=new Set();
const label={prefix:'Prefix',root:'Root',suffix:'Suffix',vowel:'Link'};
function solvable(t){return t.parts.map((p,i)=>i).filter(i=>t.parts[i].type!=='vowel');}
function render(){const t=TERMS[index],need=solvable(t),done=need.every(i=>found.has(i));
 dialog.innerHTML=`<div class="mh-inner"><header class="mh-head"><span class="mh-brand"><span class="mh-crest" aria-hidden="true">${document.querySelector('.hca-crest')?.innerHTML||''}</span><span>MedLex<small>HEALTHCARE CROWN ACADEMY</small></span></span><button type="button" class="mh-skip" data-mh="close">Skip</button></header>
 <p class="mh-eyebrow">DECODE YOUR FIRST TERM · ABOUT 10 SECONDS</p>
 <h2 id="mh-title">Every medical word is a puzzle <em>you can solve.</em></h2>
 <p class="mh-lead">${done?'Put together, the parts give you the meaning.':'Tap each part of the word to reveal what it means.'}</p>
 <div class="mh-word" role="group" aria-label="Parts of ${esc(t.term)}">${t.parts.map((p,i)=>p.type==='vowel'?`<span class="mh-link" title="A linking vowel">${esc(p.text)}</span>`:`<button type="button" class="mh-part mh-${p.type} ${found.has(i)?'is-found':''}" data-mh="part" data-i="${i}" aria-pressed="${found.has(i)}" aria-label="${esc(p.text)}, ${label[p.type]||'part'}${found.has(i)?': '+esc(p.meaning):''}"><span class="mh-text">${esc(p.text)}</span><span class="mh-meaning" aria-hidden="true">${found.has(i)?esc(p.meaning):label[p.type]||''}</span></button>`).join('')}</div>
 <p class="mh-progress" aria-live="polite">${done?'':`${need.filter(i=>found.has(i)).length} of ${need.length} parts decoded`}</p>
 <div class="mh-result" aria-live="polite">${done?`<p class="mh-sum">${need.map(i=>`<b>${esc(t.parts[i].meaning)}</b>`).join(' <span aria-hidden="true">+</span> ')}</p><p class="mh-def"><strong>${esc(t.term)}</strong>: ${esc(t.plain)}</p><p class="mh-note">That is MedLex's five-step method in action. All 1,480 terms in the course are built from parts like these.</p>`:''}</div>
 <div class="mh-actions">${done?`<button type="button" class="mh-primary" data-mh="close">Start learning <span aria-hidden="true">→</span></button><button type="button" class="mh-secondary" data-mh="next">Decode another word</button>`:`<button type="button" class="mh-secondary" data-mh="reveal">Show me the answer</button>`}</div></div>`;}
function focusFirst(){(dialog.querySelector('.mh-part:not(.is-found)')||dialog.querySelector('.mh-primary'))?.focus({preventScroll:true});}
function close(){try{localStorage.setItem(KEY,'seen');}catch{}if(dialog?.open)dialog.close();dialog?.remove();dialog=null;}
function open(){dialog=document.createElement('dialog');dialog.className='medlex-hook';dialog.setAttribute('aria-labelledby','mh-title');document.body.append(dialog);
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('click',e=>{const b=e.target.closest('[data-mh]');if(!b)return;e.stopPropagation();const a=b.dataset.mh,t=TERMS[index];
  if(a==='close')close();
  else if(a==='part'){found.add(+b.dataset.i);render();focusFirst();}
  else if(a==='reveal'){solvable(t).forEach(i=>found.add(i));render();focusFirst();}
  else if(a==='next'){index=(index+1)%TERMS.length;found=new Set();render();focusFirst();}});
 render();dialog.showModal();focusFirst();}
if(firstVisit)window.addEventListener('load',()=>setTimeout(()=>{if(!/^#?(home|today)?$/.test(location.hash.replace('#/','#')))return;try{open();}catch{close();}},400));
})();
