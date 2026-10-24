/* Gulf edition UI: edition switch, chooser, exam facts card, suite chip. Runs after the shell. */
(function(){
 'use strict';
 var CFG=window.GULF_CONFIG||{},ed=window.GULF_EDITION,$=function(s,r){return(r||document).querySelector(s)};
 function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
 function setEdition(id){try{localStorage.setItem('gulf-edition',id)}catch(e){}location.href='/#home';location.reload()}
 function chooser(){
  if($('#gulf-chooser'))return;var d=document.createElement('dialog');d.id='gulf-chooser';d.setAttribute('aria-labelledby','gulf-chooser-h');
  d.innerHTML='<h2 id="gulf-chooser-h">Choose your licensing exam</h2><p>One study studio, a separate set-up for each regulator. You can switch at any time; each exam keeps its own progress.</p><div class="gulf-cards">'+
   CFG.order.map(function(id){var c=CFG.editions[id];return '<button type="button" data-pick="'+id+'" style="--ac:'+c.accent+'"><b>'+esc(c.region)+'</b><span>'+esc(c.fullName)+'</span><small>'+esc(c.facts)+'</small></button>'}).join('')+
   '</div><p class="gulf-note"><a href="https://snle.healthcarecrownacademy.co.uk/">Saudi Arabia (SNLE) has its own app</a> · <a href="/hub/">Compare all exams</a></p>';
  d.querySelectorAll('[data-pick]').forEach(function(b){b.onclick=function(){setEdition(b.dataset.pick)}});
  document.body.append(d);try{d.showModal()}catch(e){d.setAttribute('open','')}
 }
 if(!ed){chooser();return}
 var c=CFG.editions[ed];if(!c)return;
 document.title=c.short+' Study Studio | Healthcare Crown Academy';
 var pass={qatar:'DHP publishes a 50% minimum for this exam; whether it is raw, equated or scaled is not confirmed.',dubai:'DHA publishes a 50% threshold and reports pass or fail.',abudhabi:'DOH reports pass or fail and does not publish a numeric pass mark in the sources reviewed.'}[ed];
 var UI=[[/SCFHS reports the licensure result on a 200[–-]800 scale with 500 as the passing score\./g,pass],[/SCFHS reports a scaled score from 200 to 800, with 500 as the pass mark\.[^.]*\./g,pass],
  [/This matches the scheduled midpoint break in the official 200-question SNLE structure\./g,'This is a study reset, not part of the regulator\u2019s exam format.'],
  [/The app separates <b>study recovery<\/b> from the <b>official 200-question exam break<\/b>\./g,'The app separates study recovery from long-exam breaks.'],
  [/For the 200-question SNLE structure in the guide used by this app: [^.]*\./g,'Plan your own breaks; confirm the official break rules with your regulator.'],
  [/official 200-question SNLE structure/g,'regulator\u2019s exam format'],[/ blueprint tutor mock/g,' tutor mock'],[/Train the same blueprint in/g,'Train in'],[/\bSNLE\b/g,c.short],[/\bSCFHS\b/g,'exam']];
 function ui(s){for(var i=0;i<UI.length;i++)s=s.replace(UI[i][0],UI[i][1]);return s}
 function textSweep(root){
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,list=[];
  while((n=w.nextNode())){var p=n.parentNode&&n.parentNode.nodeName;if(p==='SCRIPT'||p==='STYLE'||p==='TEXTAREA')continue;if(n.parentNode.closest&&n.parentNode.closest('.gulf-facts,#gulf-chooser'))continue;if(/SNLE|SCFHS|Saudi/.test(n.nodeValue))list.push(n)}
  list.forEach(function(t){t.nodeValue=window.GULF_FIX?ui(t.nodeValue.replace(/\bSaudi Arabia\b/g,'your country').replace(/\bSaudi\b/g,'local')):ui(t.nodeValue)});
  if(root.querySelectorAll)root.querySelectorAll('[aria-label],[title]').forEach(function(e){['aria-label','title'].forEach(function(a){var v=e.getAttribute(a);if(v&&/SNLE|SCFHS/.test(v))e.setAttribute(a,ui(v))})});
 }
 function suiteChip(){
  var cur=document.querySelector('.hs-app[aria-label="SNLE"]');if(!cur||cur.dataset.gulf)return;cur.dataset.gulf='1';cur.removeAttribute('aria-current');cur.classList.remove('on','active','current');
  var g=cur.cloneNode(true);g.dataset.gulf='1';g.href='/';g.setAttribute('aria-label','Gulf Exams');g.setAttribute('aria-current','true');g.title='Gulf Exams (this app)';var t=g.querySelector('span,i,b')||g;t.textContent='G';g.style.setProperty('--hs-c',c.accent);g.style.background=c.accent;cur.after(g);
 }
 function switcher(){
  var side=$('.sidebar');if(!side||$('.gulf-switch',side))return;
  var el=document.createElement('div');el.className='gulf-switch';el.setAttribute('role','group');el.setAttribute('aria-label','Choose exam edition');
  el.innerHTML=CFG.order.map(function(id){var e=CFG.editions[id];return '<button type="button" data-ed="'+id+'" style="--ac:'+e.accent+'"'+(id===ed?' aria-pressed="true"':' aria-pressed="false"')+' title="'+esc(e.fullName)+'">'+esc(e.tab)+'</button>'}).join('');
  el.querySelectorAll('[data-ed]').forEach(function(b){b.onclick=function(){if(b.dataset.ed!==ed)setEdition(b.dataset.ed)}});
  var brand=$('.brand-lockup',side);(brand||side.firstChild).after(el);
 }
 function card(){
  var main=$('.main-canvas');if(!main)return;
  var home=(location.hash.replace(/^#\/?/,'').split(/[?\/]/)[0]||'home')==='home';
  var ex=$('.gulf-facts',main);if(!home){if(ex)ex.remove();return}if(ex)return;
  var el=document.createElement('section');el.className='gulf-facts';el.setAttribute('aria-labelledby','gulf-facts-h');
  el.innerHTML='<div class="gulf-facts-head"><span class="gulf-dot"></span><h2 id="gulf-facts-h">'+esc(c.fullName)+'</h2><a href="/hub/#'+ed+'">Exam details</a></div>'+
   '<ul class="gulf-facts-list">'+c.points.map(function(p){return '<li>'+esc(p)+'</li>'}).join('')+'</ul>'+
   '<p class="gulf-facts-note">'+esc(CFG.policy)+'</p>';
  var top=$('.topbar',main);if(top)top.after(el);else main.prepend(el);
 }
 function tick(){switcher();suiteChip();card();textSweep(document.body)}
 var t=null;new MutationObserver(function(){if(t)return;t=setTimeout(function(){t=null;tick()},60)}).observe(document.body,{childList:true,subtree:true,characterData:true});
 addEventListener('hashchange',tick);tick();
})();
