/* Gulf Region exam passes: what is free and what needs a pass.
   Free for everyone: Today, the exam guide, the glossary, comparing exams and 10 questions per exam.
   With that exam's pass (US$25 a month, US$50 for 3 months or US$69 for 6 months): the full question bank, mock exams, clinical tools,
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
  '.gl-gate .row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}.gl-gate a.p{display:block;padding:12px;border-radius:14px;background:#123A50;color:#fff;text-decoration:none;border:1px solid rgba(148,213,240,.3)}.gl-gate a.p b{display:block;font-size:20px}.gl-gate a.p.best{border:2px solid #E8C170}'+
  '.gl-gate .alt{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}.gl-gate .alt a,.gl-gate .alt button{color:#94D5F0;background:none;border:0;font:inherit;text-decoration:underline;cursor:pointer}';
  document.head.appendChild(s)}
 function show(why){
  if(box)return;css();var x=exam(),base='https://healthcarecrownacademy.co.uk/subscribe?exam='+x+'#gulf';
  box=document.createElement('div');box.className='gl-gate';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','gl-gate-h');
  box.innerHTML='<div><small>'+NAME[x]+' exam pass</small><h2 id="gl-gate-h">'+why+'</h2><p>Unlock the full question bank, mock exams, 67 clinical tools, 35 dossiers and the labs for '+NAME[x]+'. Paid once, nothing renews automatically.</p>'+
   '<div class="row"><a class="p" href="'+base+'"><span>1 month</span><b>US$25</b></a><a class="p best" href="'+base+'"><span>3 months</span><b>US$50</b></a><a class="p" href="'+base+'"><span>6 months</span><b>US$69</b></a></div>'+
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
 // Question bank: 10 free answers per exam, then the pass.
 function answered(){var k='gulf-free-q-'+exam(),n=+(store(k)||0)+1;store(k,String(n));if(n>FREE_Q&&!unlocked(ent,exam())&&window.HCA&&HCA.gatesOn)show('You have used your 10 free questions')}
 if(lib&&mode==='questions'){
  document.addEventListener('click',function(e){if(e.target.closest('[data-letter]'))answered()},true);
  document.addEventListener('keydown',function(e){if(/^[a-eA-E]$/.test(e.key)&&!/input|textarea/i.test((e.target.tagName||'')))answered()},true);
 }
 var tries=0;(function wait(){if(window.HCA&&HCA.ready){HCA.ready.then(function(e){ent=e;check();if(lib&&mode==='questions'&&+(store('gulf-free-q-'+exam())||0)>=FREE_Q&&!unlocked(e,exam())&&HCA.gatesOn)show('You have used your 10 free questions')});return}if(++tries<60)setTimeout(wait,200)})();
 window.addEventListener('hashchange',function(){if(ent!==null)check()});
})();
