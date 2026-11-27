/* Account sync: when the viewer is signed in (window.HCA), mirror this studio's device storage (keys starting
   gulf- or snle-) to crown_progress (app 'gulf', one row per user, row-level security: own row only).
   Newer snapshot wins; the device keeps working offline and when signed out. */
(function(){
 'use strict';
 var SB=(window.GULF_CONFIG||{}).sb;if(!SB||!SB.url||!SB.key)return;
 var APP='gulf',STAMP='gulf-sync-at',SKIP=/^(gulf-sync-at|gulf-slide-size|gulf-lib-view)$/;
 function token(){try{return window.HCA&&window.HCA.token?window.HCA.token():Promise.resolve(null)}catch(e){return Promise.resolve(null)}}
 function snapshot(){var o={};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(/^(gulf-|snle-)/.test(k)&&!SKIP.test(k))o[k]=localStorage.getItem(k)}}catch(e){}return o}
 function stamp(){try{return +localStorage.getItem(STAMP)||0}catch(e){return 0}}
 function setStamp(t){try{localStorage.setItem(STAMP,String(t))}catch(e){}}
 function api(tok,method,path,body,keep){return fetch(SB.url+'/rest/v1/'+path,{method:method,keepalive:!!keep,headers:{apikey:SB.key,Authorization:'Bearer '+tok,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:body?JSON.stringify(body):undefined})}
 function uid(tok){try{return JSON.parse(atob(tok.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub}catch(e){return null}}
 var last='',busy=false;
 function push(keep){return token().then(function(tok){if(!tok)return;var snap=snapshot(),s=JSON.stringify(snap);if(s===last)return;var t=Date.now();
  return api(tok,'POST','crown_progress?on_conflict=user_id,app',{user_id:uid(tok),app:APP,data:{t:t,keys:snap},updated_at:new Date(t).toISOString()},keep).then(function(r){if(r.ok){last=s;setStamp(t)}})}).catch(function(){})}
 function pull(){return token().then(function(tok){if(!tok)return;
  return api(tok,'GET','crown_progress?select=data&app=eq.'+APP).then(function(r){return r.ok?r.json():[]}).then(function(rows){
   var d=rows&&rows[0]&&rows[0].data;
   if(!d||!d.keys||!(d.t>stamp())){last='';return push()}
   var changed=false;Object.keys(d.keys).forEach(function(k){if(/^(gulf-|snle-)/.test(k)&&localStorage.getItem(k)!==d.keys[k]){localStorage.setItem(k,d.keys[k]);changed=true}});
   setStamp(d.t);last=JSON.stringify(snapshot());
   if(changed&&!sessionStorage.getItem('gulf-sync-reloaded')){sessionStorage.setItem('gulf-sync-reloaded','1');location.reload()}
  })}).catch(function(){})}
 function start(){pull().then(function(){setInterval(function(){if(!busy){busy=true;push().then(function(){busy=false})}},20000)})}
 addEventListener('pagehide',function(){push(true)});
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')push(true)});
 var tries=0;(function wait(){if(window.HCA&&window.HCA.token)return start();if(++tries<50)setTimeout(wait,200)})();
})();

/* Gulf Region exam passes: what is free and what needs a pass.
   Free for everyone: Today, the exam guide, the glossary, comparing exams and questions 1 to 10 of the question bank.
   With the Gulf Pass (all four exams plus the Crown Pass; US$29 for 1 month, US$50 for 3 or US$69 for 6), or an older one-exam pass: the full question bank, mock exams, clinical tools,
   dossiers, labs and progress. Admins see everything. Uses window.HCA from crown-account.js. */
(function(){
 var EX={snle:'saudi',saudi:'saudi',qatar:'qatar',dubai:'dubai',abudhabi:'abudhabi'};
 var NAME={saudi:'Saudi Arabia (SNLE)',qatar:'Qatar',dubai:'Dubai',abudhabi:'Abu Dhabi'};
 var FREE_Q=10, PAID=['#tools','#dossier','#labs','#practice','#progress'];
 var lib=document.querySelector('[data-library]'), mode=lib?lib.getAttribute('data-library'):'';
 function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
 function exam(){var h=location.hash.match(/^#exam\/(snle|qatar|dubai|abudhabi)/);return EX[(h&&h[1])||store('gulf-edition')||store('gulf-selected-edition-v1')]||'saudi'}
 function unlocked(e,x){if(!e)return false;if(e.admin)return true;var u=e.gulf&&e.gulf[x];return !!u&&Date.parse(u)>Date.now()}
 var ent=null,box=null;
 function css(){if(document.getElementById('gl-gate-css'))return;var s=document.createElement('style');s.id='gl-gate-css';
  s.textContent='.gl-gate{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:16px;background:rgba(5,14,24,.78);backdrop-filter:blur(6px);font:15px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}'+
  '.gl-gate>div{max-width:440px;width:100%;padding:26px;border-radius:22px;background:#0B2232;color:#E9F3F8;border:1px solid rgba(148,213,240,.35);box-shadow:0 30px 80px rgba(0,0,0,.5);text-align:center}'+
  '.gl-gate small{display:block;margin-bottom:6px;color:#E8C170;font-weight:700;letter-spacing:.12em;text-transform:uppercase;font-size:11px}.gl-gate h2{margin:0 0 8px;font:600 22px/1.25 Georgia,serif;color:#fff}.gl-gate p{margin:0 0 16px;color:#B9CCD8}'+
  '.gl-gate .row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}.gl-gate a.p{display:block;padding:12px;border-radius:14px;background:#123A50;color:#fff;text-decoration:none;border:1px solid rgba(148,213,240,.3)}.gl-gate a.p b{display:block;font-size:20px}.gl-gate a.p.best{border:2px solid #E8C170}'+
  '.gl-gate .alt{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}.gl-gate .alt a,.gl-gate .alt button{color:#94D5F0;background:none;border:0;font:inherit;text-decoration:underline;cursor:pointer}';
  document.head.appendChild(s)}
 function show(why){
  if(box)return;css();var x=exam(),base='https://healthcarecrownacademy.co.uk/subscribe?exam='+x;
  box=document.createElement('div');box.className='gl-gate';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','gl-gate-h');
  box.innerHTML='<div><small>Gulf Pass · all four exams</small><h2 id="gl-gate-h">'+why+'</h2><p>Unlock the full question bank, mock exams, 67 clinical tools, 35 dossiers and the labs for '+NAME[x]+' and the other three Gulf exams. MedLex, Carecraft and Lumen are included. Paid once, nothing renews.</p>'+
   '<div class="row"><a class="p" href="'+base+'&len=1m"><span>1 month</span><b>US$29</b></a><a class="p" href="'+base+'&len=3m"><span>3 months</span><b>US$50</b></a><a class="p best" href="'+base+'&len=6m"><span>6 months</span><b>US$69</b></a></div>'+
   '<div class="alt">'+(ent&&ent.signed_in?'':'<button type="button" data-in>I already have a pass</button>')+'<a href="/#home" data-home>Back to Today</a></div></div>';
  document.body.appendChild(box);
  box.addEventListener('click',function(e){if(e.target.closest('[data-in]')&&window.HCA)HCA.signIn();if(e.target.closest('[data-home]')&&!lib){e.preventDefault();hide();location.hash='#home'}});
  var f=box.querySelector('a.p');f&&f.focus();
 }
 function hide(){if(box){box.remove();box=null}}
 function check(){
  if(!window.HCA||!HCA.gatesOn||unlocked(ent,exam())){hide();return}
  if(lib){if(mode==='dossiers'||mode==='tools')show('Included with the exam pass');return}
  if(PAID.indexOf(location.hash.split('?')[0])>=0)show('Included with the exam pass');else hide();
 }
 // Question bank: questions 1 to 10 are free; data.js and slides.js lock the rest using this.
 var FREE_N=10;
 window.GULF_ACCESS={ok:function(n){if(!window.HCA||!HCA.gatesOn)return !window.HCA?(n>0&&n<=FREE_N):true;if(ent&&unlocked(ent,exam()))return true;return n>0&&n<=FREE_N},
  buy:function(){return 'https://healthcarecrownacademy.co.uk/subscribe?exam='+exam()}};
 // Free visitors only receive questions 1 to 10; say so above the bank, with the way to unlock the rest.
 function freeNote(){var it=document.getElementById('items');if(!lib||mode!=='questions'||!it||window.GULF_FULL_BANK||unlocked(ent,exam())||document.querySelector('.gulf-free-note'))return;
  var n=document.createElement('p');n.className='gulf-free-note';n.innerHTML='You are using the 10 free questions. <a href="'+window.GULF_ACCESS.buy()+'">The Gulf Pass unlocks all 1,297</a>, with mock exams and clinical tools.'+(ent&&ent.signed_in?'':' <button type="button" data-gulf-signin>I already have a pass</button>');it.parentNode.insertBefore(n,it)}
 var tries=0;(function wait(){if(window.HCA&&HCA.ready){HCA.ready.then(function(e){ent=e;check();freeNote();try{window.dispatchEvent(new Event('gulf-access'))}catch(x){}});return}if(++tries<60)setTimeout(wait,200)})();
 window.addEventListener('hashchange',function(){if(ent!==null)check()});
})();
