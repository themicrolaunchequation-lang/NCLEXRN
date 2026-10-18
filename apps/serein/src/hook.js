/* Serein first visit: one guided breath, then "How are you arriving?" with a matched one-minute practice.
   Runs before the welcome steps; every screen can be skipped. The chosen mood is kept as the first check-in, through the app's own quick check-in. */
(function(S){
'use strict';
const MOODS=[
 {label:'Low',curve:10,practice:'ground',duration:null,line:'Thank you for being honest. Let’s keep this very gentle and look outward, at your own pace.'},
 {label:'A little low',curve:12,practice:'tide',duration:60,line:'That makes sense. A soft minute of slower breathing can make a little room.'},
 {label:'Okay',curve:15,practice:'desk',duration:null,line:'A steady place to start. A short seated reset can loosen what the day has gathered.'},
 {label:'Good',curve:19,practice:'tide',duration:60,line:'Lovely. One easy minute of breathing helps you keep that steadiness for later.'},
 {label:'Great',curve:21,practice:'desk',duration:null,line:'Wonderful. A quick seated reset helps you carry that energy with care.'}
];
const BREATHS=3,IN=4000,OUT=6000;
let dialog=null,timers=[],ctx=null,chosen=null;
const reduced=()=>{try{return S.a11y?.reducedMotion?.()||matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{return false;}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title=id=>(S.data?.practices||[]).find(p=>p.id===id)?.title||'A short practice';
function clear(){timers.forEach(clearTimeout);timers=[];}
function later(fn,ms){timers.push(setTimeout(fn,ms));}
function face(curve){return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 9h.01 M16 9h.01 M7 15 Q12 ${curve} 17 15"/></svg>`;}
function shell(inner,step){const crest=document.querySelector('.brand img')?.getAttribute('src');dialog.dataset.step=step;dialog.innerHTML=`<div class="sh-inner"><header class="sh-head"><span class="sh-brand">${crest?`<img src="${esc(crest)}" alt="" width="36" height="36">`:''}<span>SEREIN<small>HEALTHCARE CROWN ACADEMY</small></span></span><button type="button" class="sh-skip" data-sh="skip">Skip</button></header>${inner}</div>`;}
function breathe(){clear();const still=reduced();
 shell(`<div class="sh-breath ${still?'is-still':''}"><p class="sh-eyebrow">BEFORE ANYTHING ELSE</p><h2 id="sh-title">Let’s take three easy breaths together.</h2><div class="sh-orb" aria-hidden="true"><span class="sh-orb-ring"></span><span class="sh-orb-core"></span></div><p class="sh-cue" id="sh-cue" aria-live="polite">${still?'Breathe in gently through your nose… then let the breath go slowly. Take as long as you like.':'Get comfortable. Eyes can stay open.'}</p><p class="sh-count" id="sh-count">${still?'':'Three slow breaths · about 30 seconds'}</p><div class="sh-actions"><button type="button" class="button button-teal" data-sh="mood">${still?'I’m ready':'Continue when ready'}</button></div></div>`,'breath');
 dialog.querySelector('[data-sh="mood"]').focus({preventScroll:true});
 if(still)return;
 const orb=dialog.querySelector('.sh-orb'),cue=dialog.querySelector('#sh-cue'),count=dialog.querySelector('#sh-count');
 const cycle=n=>{if(n>=BREATHS){cue.textContent='Well done. That was a small pause, and it counts.';count.textContent='';orb.className='sh-orb is-rest';later(mood,2200);return;}
  count.textContent='Breath '+(n+1)+' of '+BREATHS;cue.textContent='Breathe in…';orb.className='sh-orb is-in';
  later(()=>{cue.textContent='…and let it go, slowly.';orb.className='sh-orb is-out';},IN);later(()=>cycle(n+1),IN+OUT);};
 later(()=>cycle(0),1600);}
function mood(){clear();chosen=null;
 shell(`<div class="sh-mood"><p class="sh-eyebrow">A QUICK, PRIVATE CHECK-IN</p><h2 id="sh-title">How are you arriving today?</h2><p class="sh-lead">There is no right answer. Serein will suggest one short practice that fits.</p><div class="mood-row sh-moods" role="group" aria-labelledby="sh-title">${MOODS.map((m,i)=>`<button type="button" class="mood" data-sh="pick" data-i="${i}" aria-pressed="false"><span class="mood-face">${face(m.curve)}</span>${esc(m.label)}</button>`).join('')}</div><div id="sh-suggest" class="sh-suggest" aria-live="polite"></div><p class="sh-privacy"><span aria-hidden="true">🔒</span> Private by design. This answer never leaves your device, nothing is sent to an employer, and nothing is monitored.</p><div class="sh-actions sh-secondary"><button type="button" class="text-button" data-sh="setup">Set up my space first →</button></div></div>`,'mood');
 dialog.querySelector('.sh-moods .mood')?.focus({preventScroll:true});}
function pick(i){chosen=MOODS[i];dialog.querySelectorAll('.sh-moods .mood').forEach((b,j)=>{b.classList.toggle('selected',j===i);b.setAttribute('aria-pressed',String(j===i));});
 dialog.querySelector('#sh-suggest').innerHTML=`<p>${esc(chosen.line)}</p><div class="sh-practice"><span class="sh-eyebrow">SUGGESTED FOR YOU</span><strong>${esc(title(chosen.practice))}</strong><button type="button" class="button button-teal" data-sh="begin">Begin this practice <span aria-hidden="true">→</span></button></div>`;}
function close(){clear();if(dialog?.open)dialog.close();dialog?.remove();dialog=null;}
function tap(data){const b=document.createElement('button');b.type='button';b.hidden=true;Object.assign(b.dataset,data);document.body.append(b);b.click();b.remove();}
function begin(){const m=chosen;close();ctx.finish();if(!m)return;setTimeout(()=>{
 // Keep the answer as the first check-in through Today's own quick check-in (mood 1-5).
 try{tap({mood:String(MOODS.indexOf(m)+1)});}catch{}
 const d={practice:m.practice};if(m.duration)d.duration=String(m.duration);tap(d);
 // "Begin this practice" already said begin: start playback without a second tap.
 setTimeout(()=>{try{if(S.player?.engine?.state==='ready')S.player.playPause();}catch{}},80);
},60);}
function run(c){ctx=c;try{dialog=document.createElement('dialog');dialog.className='serein-hook';dialog.setAttribute('aria-labelledby','sh-title');document.body.append(dialog);
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();ctx.onboard();});
 dialog.addEventListener('click',e=>{const b=e.target.closest('[data-sh]');if(!b)return;e.stopPropagation();const a=b.dataset.sh;
  if(a==='skip'||a==='setup'){close();ctx.onboard();}else if(a==='mood')mood();else if(a==='pick')pick(+b.dataset.i);else if(a==='begin')begin();});
 dialog.showModal();breathe();}catch{close();c.onboard();}}
S.hook={run};
})(globalThis.Serein=globalThis.Serein||{});
