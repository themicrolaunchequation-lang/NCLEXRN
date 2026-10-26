/* Tool-specific applications reuse intact, original question IDs. Guided work is separate from exam scores. */
(function(){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const byId=new Map(window.SNLE_QUESTIONS.map(q=>[q.id,q])),sessions=new Map(),KEY='snle-decision-lens-v1';
 const refs={
  bls:['AHA 2025 adult basic life support','https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support'],
  sepsis:['SCCM 2026 adult sepsis guidelines','https://sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026'],
  delegation:['NCSBN delegation framework','https://www.ncsbn.org/nursing-regulation/practice/delegation.page'],
  exam:['SCFHS SNLE applicant guide','https://scfhs.org.sa/sites/default/files/2025-09/SNLE%20Applicant%20Guide%20_0.pdf']
 };
 const notes={
  'poster-001':{text:'Use this deterioration framework within its stated boundary. Established cardiac arrest requires the resuscitation pathway rather than a prolonged routine survey.',ref:'bls'},
  'poster-011':{text:'For recognized adult cardiac arrest, activate the emergency response, begin high-quality CPR and use an AED promptly according to current BLS training. This emergency sequence has a different job from a general prioritization framework.',ref:'bls'},
  'poster-016':{text:'The 2026 adult sepsis guidance updates the 2021 edition. Suspected shock needs prompt assessment and escalation; resuscitation requires ongoing reassessment rather than an unmonitored fluid recipe.',ref:'sepsis'},
  'poster-022':{text:'Delegation requires checking the task, circumstances, person, communication, and supervision. Saudi scope, verified competence, and local policy control which tasks may be delegated; do not substitute a mnemonic for those checks.',ref:'delegation'},
  'poster-041':{text:'A broad scope-of-practice framework does not confer permission to perform a procedure. Confirm local authorization, competence, supervision, and the patient’s current stability.',ref:'delegation'}
 };
 function cases(p){
  const all=p.questionIds.map(id=>byId.get(id)).filter(Boolean),chosen=[];
  for(const rx of [/first|immediate|priority|unstable/i,/assess|recogniz|interpret|finding/i,/delegat|evaluat|reassess|response/i]){
   const q=all.find(q=>!chosen.includes(q)&&rx.test(q.stem+' '+q.construct+' '+q.process));if(q)chosen.push(q);
  }
  for(const q of all)if(chosen.length<3&&!chosen.includes(q))chosen.push(q);
  return chosen;
 }
 function render(p){
  const qs=cases(p);if(!qs.length)return '';
  const s=sessions.get(p.id)||{at:0,answer:'',revealed:false};sessions.set(p.id,s);
  const q=qs[Math.min(s.at,qs.length-1)],note=notes[p.id],principle=/arrest|CAB|Emergency|Tracheostomy|Hemorrhage/i.test(p.title)?'Emergency-specific pathway':'Reasoning framework or focused clinical tool';
  return '<section class="snle-case-journey" data-guidance="'+p.id+'"><header><span class="eyebrow">APPLY THIS TOOL · '+esc(principle)+'</span><h3>'+esc(p.title)+': make a decision</h3><p>'+esc(p.job)+'</p></header>'+
   '<p class="snle-learning-context">Original educational cases, not actual examination questions. Items were clinically reviewed and accepted for release (26 Oct 2026); practice results are not a licensing or clinical-competence assessment.</p>'+
   (note?'<aside class="snle-current-note"><b>Current practice boundary</b><p>'+esc(note.text)+'</p><a href="'+refs[note.ref][1]+'" target="_blank" rel="noopener noreferrer">'+esc(refs[note.ref][0])+' ↗</a></aside>':'')+
   '<div class="snle-exam-transfer"><h4>How this reasoning may be tested</h4><p>In an SNLE-style item about '+esc(q.process||q.construct||p.title)+', identify the patient context, decisive finding and requested action. The task here is '+esc(q.construct||q.judgment)+'.</p><p><b>Switch-tool boundary:</b> '+esc(p.boundary)+'</p><small>HYP labels are editorial study tags, not measured exam probabilities. <a href="'+refs.exam[1]+'" target="_blank" rel="noopener noreferrer">Check the official exam guide</a>.</small></div>'+
   '<article class="snle-guided-case"><span class="eyebrow">'+(s.at?'FOLLOW-UP APPLICATION · A NEW CASE':'PATIENT SCENARIO')+' '+(s.at+1)+' / '+qs.length+' · '+q.id+'</span><h4>'+esc(q.stem)+'</h4>'+
   '<div role="group" aria-label="Scenario responses">'+q.options.map(o=>'<button type="button" data-guidance-answer="'+o.label+'" aria-pressed="'+(s.answer===o.label)+'" '+(s.revealed?'disabled':'')+'><b>'+o.label+'</b> '+esc(o.text)+'</button>').join('')+'</div>'+
   '<button type="button" class="primary-button" data-guidance-check '+(!s.answer||s.revealed?'disabled':'')+'>Review my reasoning</button>'+
   (s.revealed?'<div class="snle-case-feedback" role="status"><h4>'+(s.answer===q.key?'Best-supported response.':'Review the decisive clue.')+'</h4><p><b>'+q.key+':</b> '+esc(q.answerText)+'</p><p>'+esc(q.rationale)+'</p><h5>Why the alternatives fall short</h5>'+q.options.filter(o=>o.label!==q.key).map(o=>'<p><b>'+o.label+' · '+esc(o.text)+'</b><br>'+esc(q.misconceptions?.[o.label]||'This option does not address the decisive cue as well as the keyed response.')+'</p>').join('')+'<p><b>Reassessment / next reasoning step:</b> '+esc(p.pearl)+'</p></div>':'')+
   '<div class="snle-case-actions"><button type="button" class="secondary-button" data-guidance-next '+(!s.revealed?'disabled':'')+'>'+(s.at+1<qs.length?'Try the follow-up case':'Review these cases again')+'</button><small>Guided attempts are recorded separately from mock-exam scores.</small></div></article></section>';
 }
 document.addEventListener('click',e=>{
  const area=e.target.closest?.('[data-guidance]');if(!area)return;
  const p=window.SNLE_POSTERS.find(p=>p.id===area.dataset.guidance);if(!p)return;
  const s=sessions.get(p.id),button=e.target.closest('button');if(!button||button.disabled)return;
  if(button.hasAttribute('data-guidance-answer'))s.answer=button.dataset.guidanceAnswer;
  else if(button.hasAttribute('data-guidance-check')&&s.answer&&!s.revealed){
   s.revealed=true;const q=cases(p)[s.at];let history={};try{history=JSON.parse(window.SNLEStorage.getItem(KEY)||'{}');if(!history||typeof history!=='object'||Array.isArray(history))history={}}catch{}
   history[q.id]={answer:s.answer,correct:s.answer===q.key,at:Date.now()};window.SNLEStorage.setItem(KEY,JSON.stringify(history));window.HCA?.daily?.done('snle');
  }else if(button.hasAttribute('data-guidance-next')){s.at=(s.at+1)%cases(p).length;s.answer='';s.revealed=false}else return;
  area.outerHTML=render(p);
 });
 window.SNLEGuidance={render,cases,notes};
})();
