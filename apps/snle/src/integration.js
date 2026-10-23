(function(){
 'use strict';
 const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let restoreFocus=null;
 function learningNotes(){
  restoreFocus=document.activeElement;
  if($('#snle-help')){$('#snle-help').showModal();return;}
  const d=document.createElement('dialog');d.id='snle-help';d.setAttribute('aria-labelledby','snle-help-title');
  d.innerHTML='<button type="button" data-snle-help-close aria-label="Close learning information">×</button><h2 id="snle-help-title">Your SNLE learning space</h2><p>Explore 67 clinical tools, 1,350 original practice questions, specialty dossiers and a bilingual glossary. Tutor mode provides feedback; exam simulation hides answer feedback until review.</p><p>These are educational examples, not actual SNLE questions or a validated readiness test. Imported clinical items still require expert review. General prioritization frameworks do not replace emergency algorithms, current local policy or Saudi scope of practice.</p><p>Progress and annotations stay in this browser. Account sign-in connects to your existing Crown account; it does not upload your notes or automatically move progress from a downloaded HTML file.</p><h3>Keep a copy of your work</h3><p>Download a browser-local backup. Importing a backup replaces matching SNLE records on this device only.</p><button type="button" data-snle-export>Download progress backup</button><label class="snle-import">Choose a progress backup<input type="file" accept="application/json,.json" data-snle-import></label><div data-snle-import-review hidden></div><p role="status" data-snle-backup-status></p><p><a href="https://healthcarecrownacademy.co.uk/">Healthcare Crown Academy</a> · <a href="https://scfhs.org.sa/sites/default/files/2025-09/SNLE%20Applicant%20Guide%20_0.pdf" target="_blank" rel="noopener noreferrer">Official SCFHS exam information ↗</a></p>';
  d.querySelector('[data-snle-help-close]').onclick=()=>d.close();
  d.querySelector('[data-snle-export]').onclick=()=>{
   const records={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^snle[-_.]/i.test(k))records[k]=localStorage.getItem(k)}}catch{d.querySelector('[data-snle-backup-status]').textContent='Browser storage is blocked. Enable storage to export saved progress.';return}
   const b=new Blob([JSON.stringify({format:'snle-progress-v1',createdAt:new Date().toISOString(),records},null,2)],{type:'application/json'}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download='SNLE-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  d.querySelector('[data-snle-import]').onchange=async e=>{
   const status=d.querySelector('[data-snle-backup-status]'),review=d.querySelector('[data-snle-import-review]');review.hidden=true;review.replaceChildren();const f=e.target.files[0];if(!f)return;
   try{if(f.size>5*1024*1024)throw Error('This backup exceeds the 5 MB import limit.');const b=JSON.parse(await f.text());if(b.format!=='snle-progress-v1'||!b.records||typeof b.records!=='object'||Array.isArray(b.records))throw Error('Choose an SNLE progress backup.');const entries=Object.entries(b.records);if(!entries.length||entries.some(([k,v])=>!/^snle[-_.]/i.test(k)||typeof v!=='string'))throw Error('This file contains unsupported records.');
    const p=document.createElement('p');p.textContent=entries.length+' SNLE records will replace matching records on this device. Other apps and your account are unaffected.';review.append(p);
    const apply=document.createElement('button');apply.type='button';apply.textContent='Import these SNLE records';apply.onclick=()=>{let saved=0;for(const [k,v]of entries)if(window.SNLEStorage.setItem(k,v))saved++;status.textContent=saved===entries.length?'Backup imported. Reload SNLE to use the restored records.':'Some records could not be saved. Your browser storage may be full.';review.hidden=true};review.append(apply);review.hidden=false;status.textContent='';
   }catch(err){status.textContent=err.message}
  };
  d.addEventListener('close',()=>restoreFocus?.focus?.());document.body.append(d);restoreFocus=document.activeElement;d.showModal();
 }
 window.HCAShell.init({
  app:'snle',name:'SNLE',home:'#home',dayName:'Today',observe:'subtree',help:learningNotes,
  sel:{side:'.sidebar',brand:'.brand-lockup',navs:['nav'],top:'.topbar',crumbs:'.topbar-context',moveRight:['.page-edit-trigger','.arabic-assist-toggle','.color-mode-button'],tabs:'.snle-mobile-tabs',content:'.main-canvas'},
  more:true,mcrest:()=>'/assets/crest.svg',streak:()=>{try{const s=JSON.parse(window.SNLEStorage.getItem('snle-react-interact-progress-v1')||'{}');return {text:s.streak||0,label:'Study streak'}}catch{return null}}
 });
 const labels={'dossier-search':'Search clinical dossiers','dossier-specialty':'Filter by specialty','dossier-domain':'Filter by nursing domain','dossier-hyp':'Filter by study priority','tool-search':'Search clinical tools','group-select':'Filter tool groups','hyp-select':'Filter study priority','catalog-sort':'Sort clinical tools','mock-length':'Mock examination length','glossary-search':'Search glossary'};
 function decorate(){
  const main=$('.main-canvas');if(main){main.id='snle-content';main.tabIndex=-1}
  for(const [id,label]of Object.entries(labels)){const e=document.getElementById(id);if(e&&!e.hasAttribute('aria-label'))e.setAttribute('aria-label',label)}
  document.querySelectorAll('.sidebar [data-nav]').forEach(b=>b.setAttribute('aria-current',b.classList.contains('active')?'page':'false'));
  const brand=$('.brand-lockup');if(brand&&!brand.dataset.snleBrand){brand.dataset.snleBrand='1';brand.setAttribute('role','link');brand.tabIndex=0;const home=()=>$('.sidebar [data-nav="home"]')?.click();brand.addEventListener('click',home);brand.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();home()}})}
  const modal=$('.standalone-modal,.dossier-dialog,[role="dialog"]');
  if(modal&&!modal.dataset.snleFocusBound){modal.dataset.snleFocusBound='1';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');if(!modal.hasAttribute('aria-label')&&!modal.hasAttribute('aria-labelledby'))modal.setAttribute('aria-label',modal.querySelector('h2,h3')?.textContent||'Learning detail');if(!modal.contains(document.activeElement))modal.querySelector('button,input,[tabindex]')?.focus({preventScroll:true})}
  const author=$('.sidebar-author');if(author&&!author.querySelector('.snle-academy-link')){const a=document.createElement('a');a.className='snle-academy-link';a.href='https://healthcarecrownacademy.co.uk/';a.textContent='Healthcare Crown Academy';author.append(a)}
 }
 let queued=false;new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;decorate()})}}).observe($('#app'),{childList:true,subtree:true});decorate();
 document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-snle-focus]')){const on=document.body.classList.toggle('snle-focus-active');e.target.closest('[data-snle-focus]').textContent=on?'✕ Exit Focus View':'⛶ Focus View'}
  if(e.target.closest?.('[data-check],[data-coach-check],[data-exam-submit]')){
   let before=0;try{before=JSON.parse(window.SNLEStorage.getItem('snle-react-interact-progress-v1')||'{}').answered||0}catch{}
   setTimeout(()=>{try{if(JSON.parse(window.SNLEStorage.getItem('snle-react-interact-progress-v1')||'{}').answered>before)window.HCA?.daily?.done('snle')}catch{}},100);
  }
 },true);
 document.addEventListener('keydown',e=>{
  const d=$('dialog[open]')||$('.standalone-modal,.dossier-dialog,[role="dialog"]');if(!d)return;
  if(e.key==='Escape'&&!d.matches('dialog')){d.querySelector('[data-close-modal],[data-dossier-close],[aria-label*="Close"],[data-guide-domain-close],[data-glossary-info-close]')?.click();return}
  if(e.key==='Tab'){const els=[...d.querySelectorAll('button:not([disabled]),a[href],input,select,textarea,[tabindex="0"]')].filter(x=>x.getClientRects().length);if(!els.length)return;const i=els.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();els.at(-1).focus()}else if(!e.shiftKey&&(i===els.length-1||i<0)){e.preventDefault();els[0].focus()}}
 });
 addEventListener('snle-storage-error',()=>{let n=$('#snle-storage-status');if(!n){n=document.createElement('p');n.id='snle-storage-status';n.role='alert';document.body.append(n)}n.textContent='Your browser could not save this change. Download a progress backup and check available storage.'});
 if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{});
})();
