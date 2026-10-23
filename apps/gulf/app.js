import {PROFILES,ORDER,getProfile,assertBlueprint,RETAKE_NOTES,TIMING_NOTES,CONTENT_POLICY} from './data/exam-profiles.js';
const $=id=>document.getElementById(id),state={selected:'qatar',tab:'overview'};
const safeStore={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch{return false}}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=(n,d)=>d?Math.round(100*n/d*10)/10:0;
const examLink=id=>'#exam/'+id;
function loadSelected(){const hash=location.hash.match(/^#exam\/(snle|qatar|dubai|abudhabi)$/);return hash?.[1]||safeStore.get('gulf-selected-edition-v1')||'qatar'}
state.selected=ORDER.includes(loadSelected())?loadSelected():'qatar';
function displayNumber(n){return Number.isInteger(n)?String(n):'Pending verification'}
function editionCard(id){
 const p=PROFILES[id],selected=state.selected===id;
 const badge=id==='snle'?'Source exam documented':id==='qatar'?'Duration check needed':'Specification pending';
 return '<button type="button" class="edition-card" style="--accent:'+p.accent+'" data-exam="'+id+'" aria-pressed="'+selected+'" aria-label="Inspect '+esc(p.name)+'"><span class="edition-icon" aria-hidden="true">'+({snle:'S',qatar:'Q',dubai:'D',abudhabi:'A'}[id])+'</span><span class="edition-region">'+esc(p.region)+'</span><h3>'+esc(p.name)+'</h3><p>'+esc(p.regulator)+'</p><span class="chip">'+badge+'</span><span class="arrow" aria-hidden="true">↗</span></button>';
}
function renderShell(){
 $('edition-cards').innerHTML=ORDER.map(editionCard).join('');
 $('sidebar-editions').innerHTML=ORDER.map(id=>'<button type="button" class="shortcut" data-exam="'+id+'"><i style="background:'+PROFILES[id].accent+'"></i>'+esc(PROFILES[id].name)+'</button>').join('');
 $('comparison-rows').innerHTML=ORDER.map(id=>{const p=PROFILES[id],v=assertBlueprint(p),status=p.verification==='SOURCE_VERIFIED'?'Source format documented':p.verification==='DURATION_CONFLICT'?'Timing conflict':'Exam detail pending';return '<tr><td><strong>'+esc(p.name)+'</strong></td><td>'+esc(p.regulator)+'</td><td>'+displayNumber(p.questions)+'</td><td>'+(p.minutes===null?'Pending verification':p.minutes+' min'+(p.verification==='DURATION_CONFLICT'?' · disputed':''))+'</td><td class="'+(v.valid?'confirmed':'not-confirmed')+'">'+status+'</td></tr>'}).join('');
}
function sources(profile){
 return '<ul class="source-list">'+profile.sources.map(s=>'<li><a target="_blank" rel="noopener noreferrer" href="'+esc(s.url)+'">'+esc(s.label)+' ↗</a></li>').join('')+'</ul>';
}
function overview(profile){
 const result=assertBlueprint(profile);
 return '<h4>What is verified — and what still needs review</h4><p>'+esc(profile.formatNote)+'</p>'+
 '<div class="info-callout"><strong>Clinical and regulatory hold:</strong> '+esc(profile.warning)+'</div>'+
 '<p><strong>Retakes:</strong> '+esc(RETAKE_NOTES[profile.id]||'Pending regulator confirmation.')+'</p>'+(TIMING_NOTES[profile.id]?'<p><strong>Timing:</strong> '+esc(TIMING_NOTES[profile.id])+'</p>':'')+
 '<p><strong>Content:</strong> '+esc(CONTENT_POLICY)+'</p>'+
 '<p><strong>Exam rule checker:</strong> '+esc(result.reason)+'</p>'+
 sources(profile)+
 '<div class="info-callout">No official pass probability is calculated. SNLE scaled scores cannot be derived from raw practice percentages. Gulf full-length mocks remain locked until approved question sets exist.</div>'+
 (profile.id==='snle'?'<a class="button-primary" href="https://snle.healthcarecrownacademy.co.uk/" target="_blank" rel="noopener noreferrer">Open the existing SNLE website ↗</a>':'');
}
function blueprint(profile){
 const total=profile.questions;
 return '<h4>Proposed exam content allocation</h4>'+
 (!Number.isInteger(total)?'<p>The exact domain weights are not verified for this edition. The four families below are <strong>curriculum placeholders</strong>, not official exam shares.</p>':'<p>The allocation below reflects the sourced examination profile. It is not a statement that the current SNLE question pool has been validated for this examination.</p>')+
 profile.domains.map((d,i)=>{
 const n=d.count,valid=Number.isInteger(n),fraction=valid?pct(n,total):0;
 return '<div class="domain-row"><span>'+esc(d.label)+'</span><div class="domain-track" role="img" aria-label="'+esc(d.label)+': '+(valid?fraction+' percent':'not yet verified')+'"><div class="domain-fill" style="width:'+fraction+'%;background:linear-gradient(90deg,'+profile.accent+',#8bc5ba)"></div></div><strong>'+(valid?String(n)+' · '+fraction+'%':'Pending')+'</strong></div>';
 }).join('')+
 '<div class="info-callout">A valid numerical blueprint does not certify the clinical accuracy of any question. The content-release gate remains closed for all four pathways.</div>';
}
function studyKey(profile){return 'gulf-planner-v1:'+profile.id}
function readPlan(profile){try{const x=JSON.parse(safeStore.get(studyKey(profile))||'null');return x&&Number.isInteger(x.weeks)&&Number.isInteger(x.hours)?x:null}catch{return null}}
function planOutput(profile){const d=readPlan(profile);if(!d)return '<p>No saved plan for this exam yet. Your existing SNLE learning progress will not be changed.</p>';const sessions=d.weeks*d.hours,perWeek=Math.max(1,Math.floor(d.hours/2));return '<p><strong>'+d.weeks+' weeks · '+d.hours+' hours/week</strong> (approx. '+sessions+' planned hours).</p><p>Suggested weekly rhythm: '+perWeek+' focused learning blocks, spaced retrieval, a clinical tool review, and a reflective error log. Adjust for your own circumstances.</p><p>Educational planning only — not a pass forecast or clinical competence assessment.</p>'}
function study(profile){
 const data=readPlan(profile)||{weeks:6,hours:5};
 return '<h4>Build your personal study rhythm</h4><p>Configure an independent local plan for <b>'+esc(profile.name)+'</b>. This tool does not access, copy or overwrite SNLE progress.</p>'+
 '<form id="study-form" class="form-grid"><label class="field">Preparation weeks<input name="weeks" type="number" min="1" max="52" step="1" value="'+data.weeks+'" required></label><label class="field">Hours per week<input name="hours" type="number" min="1" max="70" step="1" value="'+data.hours+'" required></label><button class="save-button" type="submit">Save study plan</button></form>'+
 '<div class="study-result" id="study-result" role="status">'+planOutput(profile)+'</div>';
}
function review(profile){
 const reasons=profile.id==='snle'?['Independent clinical verification of all imported items','Validate committee/authorship statements and tool notices','Preserve the existing live SNLE and user progress']:
 profile.id==='qatar'?['Resolve 3h versus 3½h official-document conflict','Clinical review of Qatar-eligible questions and local practice','Independent QA of exam item distribution 30 / 61 / 44 / 15']:
 profile.id==='dubai'?['Capture current DHA RN CBT guideline row from official source','Confirm exact nursing blueprint and passing model','Independent local scope and clinical review']:
 ['Obtain primary DOH Registered Nurse examination specifications','Distinguish UAE PQR eligibility from actual examination blueprint','Independent Abu Dhabi scope, references and item review'];
 return '<h4>Requirements before any educational release</h4><ol class="guard-list">'+reasons.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><div class="info-callout"><b>Locked:</b> Full mock examination, pass prediction, live candidate login, payments and publishing. Owner authorization and independent clinical sign-off are mandatory.</div>'+sources(profile);
}
function renderPanel(){
 const p=getProfile(state.selected),panel=$('edition-panel'),tabs=['overview','blueprint','study','review'];
 const tabName={overview:'Exam overview',blueprint:'Domain blueprint',study:'My study plan',review:'Release gates'};
 panel.innerHTML='<div class="panel-heading"><div><span class="panel-kicker">'+esc(p.stage.toUpperCase())+'</span><h3>'+esc(p.fullName)+'</h3><p>'+esc(p.regulator)+'</p></div><span class="flag">REVIEW REQUIRED</span></div>'+
 '<div class="profile-stats"><div class="profile-stat"><b>'+displayNumber(p.questions)+'</b><span>Exam questions</span></div><div class="profile-stat"><b>'+(p.minutes===null?'Unverified':Math.round(p.minutes/60*10)/10+'h')+'</b><span>Exam duration · '+(p.verification==='DURATION_CONFLICT'?'conflicting sources':'source dependent')+'</span></div><div class="profile-stat"><b>'+esc(p.passingType==='scaled'?'Scaled score':p.passingType==='published-percentage'?'50%':'To confirm')+'</b><span>Official passing model</span></div></div>'+
 '<div class="panel-tabs" role="tablist" aria-label="Edition details">'+tabs.map(t=>'<button type="button" role="tab" data-tab="'+t+'" aria-selected="'+(state.tab===t)+'" aria-controls="panel-content">'+tabName[t]+'</button>').join('')+'</div>'+
 '<div class="panel-body" id="panel-content" role="tabpanel">'+({overview:()=>overview(p),blueprint:()=>blueprint(p),study:()=>study(p),review:()=>review(p)}[state.tab]())+'</div>';
 $('edition-cards').innerHTML=ORDER.map(editionCard).join('');
}
function activateEdition(id){if(!PROFILES[id])return;state.selected=id;state.tab='overview';safeStore.set('gulf-selected-edition-v1',id);history.replaceState(null,'',examLink(id));renderPanel();$('edition-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'})}
function syncNav(){
 const raw=location.hash.replace('#','').split('/')[0]||'overview';
 const target=raw==='exam'?'editions':raw;
 document.querySelectorAll('.nav-item').forEach(a=>a.classList.toggle('active',a.dataset.section===target));
 const m=$('mobile-menu');if(m){$('sidebar').classList.remove('open');m.setAttribute('aria-expanded','false')}
}
document.addEventListener('click',ev=>{
 const exam=ev.target.closest('[data-exam]');if(exam){activateEdition(exam.dataset.exam);return}
 const tab=ev.target.closest('[data-tab]');if(tab){state.tab=tab.dataset.tab;renderPanel();return}
 if(ev.target.closest('.nav-item')){syncNav()}
});
document.addEventListener('submit',ev=>{
 if(ev.target.id!=='study-form')return;ev.preventDefault();const fd=new FormData(ev.target),weeks=Number(fd.get('weeks')),hours=Number(fd.get('hours'));
 if(!Number.isInteger(weeks)||weeks<1||weeks>52||!Number.isInteger(hours)||hours<1||hours>70){$('study-result').textContent='Use 1–52 weeks and 1–70 hours per week.';return}
 if(!safeStore.set(studyKey(getProfile(state.selected)),JSON.stringify({weeks,hours,updatedAt:new Date().toISOString()})))$('study-result').textContent='Your browser blocked saving. The plan was not stored.';
 else $('study-result').innerHTML=planOutput(getProfile(state.selected));
});
$('theme-toggle').addEventListener('click',()=>{
 const on=document.body.classList.toggle('night');
 safeStore.set('gulf-preview-theme-v1',on?'night':'day');
 $('theme-toggle').textContent=on?'☀ Day':'☾ Night';
});
$('mobile-menu').addEventListener('click',()=>{const open=$('sidebar').classList.toggle('open');$('mobile-menu').setAttribute('aria-expanded',String(open))});
if(safeStore.get('gulf-preview-theme-v1')==='night'){document.body.classList.add('night');$('theme-toggle').textContent='☀ Day'}
window.addEventListener('hashchange',()=>{const sel=loadSelected();if(PROFILES[sel]&&sel!==state.selected){state.selected=sel;state.tab='overview';renderPanel()}syncNav()});
renderShell();renderPanel();syncNav();
