/* Gulf edition UI: edition switch, chooser, exam pass card, suite chip. Runs after the shell. */
(function(){
 'use strict';
 var CFG=window.GULF_CONFIG||{},ed=window.GULF_EDITION,$=function(s,r){return(r||document).querySelector(s)};
 function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
 function setEdition(id){try{localStorage.setItem('gulf-edition',id)}catch(e){}location.href='/#home';location.reload()}
 function chooser(){
  if($('#gulf-chooser'))return;var d=document.createElement('dialog');d.id='gulf-chooser';d.setAttribute('aria-labelledby','gulf-chooser-h');
  d.innerHTML='<div class="gulf-chooser-in"><span class="gulf-kicker">Healthcare Crown Academy · Gulf Region Exams</span><h1 id="gulf-chooser-h">Which licensing exam are you preparing for?</h1><p>One study studio, set up for each regulator. Switch at any time; each exam keeps its own progress.</p><div class="gulf-cards">'+
   CFG.order.map(function(id){var c=CFG.editions[id];return '<button type="button" class="gulf-pick" data-pick="'+id+'" data-ed="'+id+'"><span class="gulf-motif" aria-hidden="true"></span><small>'+esc(c.regulatorShort)+' · '+esc(c.theme)+'</small><b>'+esc(c.region)+'</b><span>'+esc(c.fullName)+'</span><em>'+esc(c.facts)+'</em><i aria-hidden="true">Start →</i></button>'}).join('')+
   '</div><p class="gulf-note"><a href="/hub/">Compare all exams side by side</a> · <a href="https://snle.healthcarecrownacademy.co.uk/">Saudi Arabia (SNLE) has its own free app</a></p></div>';
  d.querySelectorAll('[data-pick]').forEach(function(b){b.onclick=function(){setEdition(b.dataset.pick)}});
  d.addEventListener('cancel',function(e){e.preventDefault()});
  document.body.append(d);try{d.showModal()}catch(e){d.setAttribute('open','')}
 }
 if(!ed){document.documentElement.setAttribute('data-gulf-choose','');chooser();return}
 var c=CFG.editions[ed];if(!c)return;
 document.title=c.short+' Study Studio | Healthcare Crown Academy';
 var pass={qatar:'DHP publishes a 50% minimum for this exam; whether it is raw, equated or scaled is not confirmed.',dubai:'DHA publishes a 50% threshold and reports pass or fail.',abudhabi:'DOH reports a pass or fail result and sets its cut score internally; no numeric pass mark is published.'}[ed];
 var UI=[[/SCFHS reports the licensure result on a 200[–-]800 scale with 500 as the passing score\./g,pass],[/SCFHS reports a scaled score from 200 to 800, with 500 as the pass mark\.[^.]*\./g,pass],
  [/This matches the scheduled midpoint break in the official 200-question SNLE structure\./g,'This is a study reset, not part of the regulator’s exam format.'],
  [/The app separates <b>study recovery<\/b> from the <b>official 200-question exam break<\/b>\./g,'The app separates study recovery from long-exam breaks.'],
  [/For the 200-question SNLE structure in the guide used by this app: [^.]*\./g,'Plan your own breaks; confirm the official break rules with your regulator.'],
  [/official 200-question SNLE structure/g,'regulator’s exam format'],[/ blueprint tutor mock/g,' tutor mock'],[/Train the same blueprint in/g,'Train in'],
  [/HYP ≥ 80 items/g,'high-yield items'],[/canonical tools/g,'study tools'],[/spans the complete four-domain blueprint/g,'spans all four nursing areas'],[/standardized items/g,'practice questions'],
  [/not endorsed by SCFHS, DHA, DOH or DHP/g,'not endorsed by DHA, DOH or DHP'],[/\bSNLE\b/g,c.short],[/\bSCFHS\b/g,'exam']];
 var HIT=/SNLE|SCFHS|Saudi|Train the same blueprint|blueprint tutor mock|HYP ≥ 80 items|canonical tools|standardized items|four-domain blueprint/;
 function ui(s){for(var i=0;i<UI.length;i++)s=s.replace(UI[i][0],UI[i][1]);return s}
 function textSweep(root){
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,list=[];
  while((n=w.nextNode())){var p=n.parentNode&&n.parentNode.nodeName;if(p==='SCRIPT'||p==='STYLE'||p==='TEXTAREA')continue;if(n.parentNode.closest&&n.parentNode.closest('.gulf-pass,.gulf-foot,#gulf-chooser'))continue;if(HIT.test(n.nodeValue))list.push(n)}
  list.forEach(function(t){t.nodeValue=ui(t.nodeValue.replace(/\bSaudi Arabia\b/g,'your country').replace(/\bSaudi\b/g,'local'))});
  if(root.querySelectorAll)root.querySelectorAll('[aria-label],[title]').forEach(function(e){['aria-label','title'].forEach(function(a){var v=e.getAttribute(a);if(v&&/SNLE|SCFHS/.test(v))e.setAttribute(a,ui(v))})});
 }
 function suiteChip(){
  var cur=document.querySelector('.hs-app[aria-label="SNLE"]');if(!cur||cur.dataset.gulf)return;cur.dataset.gulf='1';cur.removeAttribute('aria-current');cur.classList.remove('on','active','current');
  var g=cur.cloneNode(true);g.dataset.gulf='1';g.href='/';g.setAttribute('aria-label','Gulf Exams');g.setAttribute('aria-current','true');g.title='Gulf Exams (this app)';var t=g.querySelector('span,i,b')||g;t.textContent='G';g.style.setProperty('--hs-c',c.accent);g.style.background=c.accent;cur.after(g);
 }
 function switcher(){
  var side=$('.sidebar');if(!side||$('.gulf-switch',side))return;
  var el=document.createElement('div');el.className='gulf-switch';el.setAttribute('role','group');el.setAttribute('aria-label','Choose exam edition');
  el.innerHTML=CFG.order.map(function(id){var e=CFG.editions[id];return '<button type="button" data-ed="'+id+'"'+(id===ed?' aria-pressed="true"':' aria-pressed="false"')+' title="'+esc(e.fullName)+'">'+esc(e.tab)+'</button>'}).join('');
  el.querySelectorAll('[data-ed]').forEach(function(b){b.onclick=function(){if(b.dataset.ed!==ed)setEdition(b.dataset.ed)}});
  var brand=$('.brand-lockup',side);(brand||side.firstChild).after(el);
 }
 function card(){
  var main=$('.main-canvas');if(!main)return;
  var home=(location.hash.replace(/^#\/?/,'').split(/[?\/]/)[0]||'home')==='home';
  var ex=$('.gulf-pass',main);if(!home){if(ex)ex.remove();return}if(ex)return;
  var el=document.createElement('section');el.className='gulf-pass';el.setAttribute('aria-labelledby','gulf-pass-h');
  el.innerHTML='<span class="gulf-motif" aria-hidden="true"></span><div class="gulf-pass-head"><div><small>'+esc(c.region)+' · '+esc(c.regulatorShort)+'</small><h2 id="gulf-pass-h">'+esc(c.fullName)+'</h2></div><div class="gulf-pass-links"><a href="#guide">Exam guide</a><a href="/hub/#'+ed+'">Compare exams</a></div></div>'+
   window.GULF_UI.tiles(c)+
   '<p class="gulf-pass-note">Details checked '+esc(CFG.checked)+'. Confirm with '+esc(c.regulatorShort)+' before you book.</p>';
  var top=$('.topbar',main);if(top)top.after(el);else main.prepend(el);
 }
 function groups(){
  var nav=$('.sidebar nav');if(!nav||$('.gulf-group',nav))return;
  [['guide','Learn'],['dossier','Practise'],['progress','Track']].forEach(function(g){var b=$('[data-nav="'+g[0]+'"]',nav);if(!b)return;var l=document.createElement('span');l.className='gulf-group';l.setAttribute('aria-hidden','true');l.textContent=g[1];b.before(l)});
 }
 function footer(){
  var main=$('.main-canvas');if(!main||$('.gulf-foot',main))return;
  var f=document.createElement('footer');f.className='gulf-foot';
  f.innerHTML='<p><b>'+esc(c.short)+' edition</b> · details checked '+esc(CFG.checked)+'. '+esc(CFG.policy)+'</p>'+
   '<nav aria-label="Footer"><a href="#guide">Exam guide</a><a href="/hub/#'+ed+'">Compare exams</a><button type="button" data-gulf-switch>Switch exam</button><button type="button" data-gulf-top>Back to top ↑</button></nav>';
  f.querySelector('[data-gulf-switch]').onclick=function(){try{localStorage.removeItem('gulf-edition')}catch(e){}location.href='/';};
  f.querySelector('[data-gulf-top]').onclick=toTop;
  main.append(f);
 }
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function toTop(){scrollTo({top:0,behavior:reduce?'auto':'smooth'});var h=$('.main-canvas h1');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}}
 var bar=document.createElement('div');bar.className='gulf-progress';bar.setAttribute('aria-hidden','true');
 var up=document.createElement('button');up.type='button';up.className='gulf-top';up.setAttribute('aria-label','Back to top');up.textContent='↑';up.onclick=toTop;
 document.body.append(bar,up);
 var raf=0;function onScroll(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;var y=scrollY,max=document.documentElement.scrollHeight-innerHeight;
  bar.style.setProperty('--p',max>innerHeight*.5?Math.min(1,y/max).toFixed(4):0);
  up.classList.toggle('on',y>innerHeight*1.5);
  document.documentElement.toggleAttribute('data-gulf-scrolled',y>40)})}
 addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
 function tick(){switcher();groups();suiteChip();card();footer();textSweep(document.body);onScroll()}
 var t=null;new MutationObserver(function(){if(t)return;t=setTimeout(function(){t=null;tick()},60)}).observe(document.body,{childList:true,subtree:true,characterData:true});
 addEventListener('hashchange',tick);tick();
})();
