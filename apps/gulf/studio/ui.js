/* Gulf edition UI: edition switch, chooser, exam pass card, suite chip. Runs after the shell. */
(function(){
 'use strict';
 var CFG=window.GULF_CONFIG||{},ed=window.GULF_EDITION,$=function(s,r){return(r||document).querySelector(s)};
 function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
 function setEdition(id){try{localStorage.setItem('gulf-edition',id);sessionStorage.setItem('gulf-switched','1')}catch(e){}location.href='/#home';location.reload()}
 var IC={q:'<path d="M4 5h16M4 10h16M4 15h9M4 20h6"/><circle cx="17.5" cy="17.5" r="3"/><path d="m19.7 19.7 2 2"/>',hub:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',dos:'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',tools:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',labs:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7.5 15h9"/>',gl:'<path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-4a2 2 0 0 0-2 2"/><path d="M16 9h4v9h-4"/>',sync:'<path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2"/><path d="M20 4v5h-5M4 20v-5h5"/>',guide:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'};
 function ico(k){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+IC[k]+'</svg>'}
 function landingPage(){
  if($('#gulf-landing'))return;var X=CFG.extra||{};
  var L=document.createElement('main');L.id='gulf-landing';L.setAttribute('aria-labelledby','gl-h');
  var cards=CFG.order.map(function(id){var c=CFG.editions[id],n=(X[id]||[]).length,t=c.tiles||[];
   var facts=t.slice(0,3).map(function(x){return '<li><small>'+esc(x.k)+'</small><b>'+esc(x.v)+'</b></li>'}).join('');
   var badge=n?'<em class="gl-badge">+'+n+' local questions</em>':'';
   return '<li><button type="button" class="gl-exam" data-pick="'+id+'" data-ed="'+id+'"><span class="gulf-motif" aria-hidden="true"></span><span class="gl-meta"><small class="gl-reg">'+esc(c.short)+'</small>'+badge+'</span><b class="gl-region">'+esc(c.region)+'</b><span class="gl-name">'+esc(c.fullName)+'</span><ul class="gl-facts">'+facts+'</ul>'+'<span class="gl-price">US$25 a month or US$50 for 3 months</span>'+'<span class="gl-go">Start with '+esc(c.tab)+' <span aria-hidden="true">→</span></span></button></li>'}).join('');
  var feat=[['q','Question Bank','Every question in a slide view: answer, see the reasoning, cross out options, highlight and add notes. Missed and starred questions collect for review.'],
   ['hub','Practice Hub','Timed sets that follow the published question split where the regulator gives one, and a balanced mix where it does not.'],
   ['dos','Clinical Dossier','35 specialty dossiers, 350 linked cases: practise the same reasoning inside a full clinical story.'],
   ['tools','React & Interact','67 clinical decision tools, from ABCDE to the Four Ts, each with its own questions.'],
   ['labs','Interactive Labs','A nine-part course on how licensing questions are built, and how the safest answer wins.'],
   ['gl','Bilingual glossary','The language of exam questions in English and Arabic, with worked examples.']].map(function(f){return '<li><span class="gl-ico">'+ico(f[0])+'</span><h3>'+f[1]+'</h3><p>'+f[2]+'</p></li>'}).join('');
  L.innerHTML='<header class="gl-top"><a class="gl-brand" href="https://healthcarecrownacademy.co.uk/"><img src="/assets/crest.svg" width="34" height="34" alt=""><span><b>Gulf Nursing Licensure Studio</b><small>Healthcare Crown Academy</small></span></a><nav aria-label="Studio"><a href="#gl-exams">Exams</a><a href="#gl-inside">What’s inside</a><a href="/hub/">Compare exams</a></nav></header>'+
   '<section class="gl-hero"><div class="gl-hero-in"><p class="gl-kicker">Saudi Arabia · Qatar · Dubai · Abu Dhabi</p><h1 id="gl-h">Your Gulf nursing licence, <em>one safe decision at a time.</em></h1><p class="gl-lede">Original practice for the Registered Nurse licensing exams in four Gulf regions, set up for each regulator’s published format. Pick your exam; your progress stays with it.</p><div class="gl-cta"><a class="gl-btn" href="#gl-exams">Choose your exam</a><a class="gl-btn is-ghost" href="/hub/">Compare the four exams</a></div>'+
   '<ul class="gl-stats"><li><b>1,297</b><span>original questions</span></li><li><b>67</b><span>clinical decision tools</span></li><li><b>350</b><span>dossier cases</span></li><li><b>4</b><span>exams, one account</span></li></ul></div><div class="gl-strip" aria-hidden="true">'+CFG.order.map(function(id){return '<span data-ed="'+id+'" class="gulf-pick"><span class="gulf-motif"></span></span>'}).join('')+'</div></section>'+
   '<section class="gl-sec" id="gl-exams" aria-labelledby="gl-exams-h"><div class="gl-head"><p class="gl-kicker">Step 1</p><h2 id="gl-exams-h">Which licensing exam are you preparing for?</h2><p>Each exam has its own colours, facts, question order and progress. You can switch at any time from the menu.</p></div><ul class="gl-exams">'+cards+'</ul><p class="gl-small">Details come from regulator publications read on '+esc(CFG.checked)+'. Confirm with your regulator before you book.</p></section>'+
   '<section class="gl-sec gl-how" aria-labelledby="gl-how-h"><div class="gl-head"><p class="gl-kicker">How it works</p><h2 id="gl-how-h">Three steps, every study day</h2></div><ol class="gl-steps"><li><b>Learn the pattern</b><p>Start with the Interactive Labs and the glossary to see how a question hides its decisive clue.</p></li><li><b>Practise the decision</b><p>Answer in the Question Bank or a timed set. Every answer explains why the safest option wins and why the others tempt.</p></li><li><b>Repeat what you missed</b><p>Missed and starred questions collect in one place. Sign in and your progress follows you between phone and computer.</p></li></ol></section>'+
   '<section class="gl-sec" id="gl-inside" aria-labelledby="gl-inside-h"><div class="gl-head"><p class="gl-kicker">What’s inside</p><h2 id="gl-inside-h">One studio, six ways to study</h2></div><ul class="gl-feat">'+feat+'</ul></section>'+
   '<section class="gl-sec"><div class="gl-honest"><h2>What this studio is, and what it is not</h2><ul><li>Original practice material written for this studio, approved for release by the Academy owner.</li><li>Not official exam content, and not endorsed by SCFHS, DHP, DHA or DOH.</li><li>It does not predict your result. No recalled exam questions are used.</li></ul></div></section>'+
   '<footer class="gl-foot"><span>© Healthcare Crown Academy</span><nav aria-label="Footer"><a href="https://healthcarecrownacademy.co.uk/">Academy home</a><a href="/hub/">Compare exams</a><a href="#gl-exams">Choose an exam</a></nav></footer>';
  L.querySelectorAll('[data-pick]').forEach(function(b){b.onclick=function(){setEdition(b.dataset.pick)}});
  document.body.append(L);var h=$('#gl-h');if(h){h.setAttribute('tabindex','-1')}
 }
 if(!ed){document.documentElement.setAttribute('data-gulf-choose','');landingPage();return}
 var c=CFG.editions[ed];if(!c)return;
 document.title=c.short+' Study Studio | Healthcare Crown Academy';
 var pass={saudi:'',qatar:'DHP publishes a 50% minimum for this exam; whether it is raw, equated or scaled is not confirmed.',dubai:'DHA publishes a 50% threshold and reports pass or fail.',abudhabi:'DOH reports a pass or fail result and sets its cut score internally; no numeric pass mark is published.'}[ed];
 var UI=[[/SCFHS reports the licensure result on a 200[–-]800 scale with 500 as the passing score\./g,pass],[/SCFHS reports a scaled score from 200 to 800, with 500 as the pass mark\.[^.]*\./g,pass],
  [/This matches the scheduled midpoint break in the official 200-question SNLE structure\./g,'This is a study reset, not part of the regulator’s exam format.'],
  [/The app separates <b>study recovery<\/b> from the <b>official 200-question exam break<\/b>\./g,'The app separates study recovery from long-exam breaks.'],
  [/For the 200-question SNLE structure in the guide used by this app: [^.]*\./g,'Plan your own breaks; confirm the official break rules with your regulator.'],
  [/official 200-question SNLE structure/g,'regulator’s exam format'],[/ blueprint tutor mock/g,' tutor mock'],[/Train the same blueprint in/g,'Train in'],
  [/HYP ≥ 80 items/g,'high-yield items'],[/canonical tools/g,'study tools'],[/spans the complete four-domain blueprint/g,'spans all four nursing areas'],[/standardized items/g,'practice questions'],
  [/\bSNLE\b/g,c.short],[/\bSCFHS\b/g,'exam']];
 var HIT=/SNLE|SCFHS|Saudi|Train the same blueprint|blueprint tutor mock|HYP ≥ 80 items|canonical tools|standardized items|four-domain blueprint/;
 if(ed==='saudi')UI=UI.filter(function(x){return !/SNLE|SCFHS|200/.test(String(x[0]))});
 function ui(s){for(var i=0;i<UI.length;i++)s=s.replace(UI[i][0],UI[i][1]);return s}
 function textSweep(root){
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,list=[];
  while((n=w.nextNode())){var p=n.parentNode&&n.parentNode.nodeName;if(p==='SCRIPT'||p==='STYLE'||p==='TEXTAREA')continue;if(n.parentNode.closest&&n.parentNode.closest('.gulf-today,.gulf-spaces,.gulf-foot,.gulf-switch,.gulf-guide-side,.gulf-guide-note,#gulf-landing'))continue;if(HIT.test(n.nodeValue))list.push(n)}
  list.forEach(function(t){t.nodeValue=ed==='saudi'?ui(t.nodeValue):ui(t.nodeValue.replace(/\bSaudi Arabia\b/g,'your country').replace(/\bSaudi\b/g,'local'))});
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
 function today(){
  var main=$('.main-canvas');if(!main)return;
  var home=(location.hash.replace(/^#\/?/,'').split(/[?\/]/)[0]||'home')==='home';
  var ex=$('.gulf-today',main);if(!home){if(ex)ex.remove();document.documentElement.removeAttribute('data-gulf-today');return}
  document.documentElement.setAttribute('data-gulf-today','');
  var hv=$('.home-view',main);if(ex&&hv&&!$('.gulf-spaces',hv))ex.remove(),ex=null;if(ex)return;
  var h=new Date().getHours(),greet=h<12?'Good morning':h<18?'Good afternoon':'Good evening';
  var v=examDate(),d=v?daysTo(v):null,nQ=(window.SNLE_QUESTIONS||[]).length,nT=(window.SNLE_POSTERS||[]).length,nG=((window.SNLE_LEARNING||{}).glossary||[]).length;
  var line,count;
  if(v&&d>=0){var pace=Math.max(10,Math.ceil(nQ/Math.max(d,1)/5)*5);
   line=d===0?'Your exam is today. Read the guide once more, then rest.':'A steady pace from here: about '+Math.min(pace,nQ)+' questions a day, with time to review what you miss.';
   count='<div class="gt-count"><b>'+d+'</b><span>day'+(d===1?'':'s')+' to your exam</span><small>'+esc(new Date(v+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}))+'</small><button type="button" data-gulf-date-clear>Change date</button></div>';}
  else{line='Add your booking date and the studio will suggest a daily pace.';
   count='<div class="gt-count is-empty"><label for="gulf-date">My exam date</label><input id="gulf-date" type="date"><small>Saved on this device only.</small></div>';}
  var T=document.createElement('section');T.className='gulf-today';T.setAttribute('aria-labelledby','gt-h');
  T.innerHTML='<div class="gt-band"><span class="gulf-motif" aria-hidden="true"></span><div class="gt-copy"><p class="gt-kicker">'+esc(c.region)+' · '+esc(c.short)+'</p><h1 id="gt-h">'+greet+'.</h1><p class="gt-line">'+esc(line)+'</p><div class="gt-acts"><button type="button" class="gt-btn" data-gt-check>Start a 10-question check</button><a class="gt-btn is-ghost" href="/question-bank">Open the Question Bank</a><a class="gt-link" href="#guide">'+esc(c.short)+' guide</a></div></div>'+count+'</div>'+
   '<div class="gt-facts"><h2 class="gt-sub">'+esc(c.fullName)+'</h2>'+window.GULF_UI.tiles(c)+'<p class="gt-note">Details checked '+esc(CFG.checked)+'. Confirm with '+esc(c.regulatorShort)+' before you book.</p></div>';
  var inp=T.querySelector('#gulf-date');if(inp){inp.min=new Date().toISOString().slice(0,10);inp.onchange=function(){if(!inp.value)return;try{localStorage.setItem(DKEY,inp.value)}catch(e){}T.remove();today()}}
  var clr=T.querySelector('[data-gulf-date-clear]');if(clr)clr.onclick=function(){try{localStorage.removeItem(DKEY)}catch(e){}T.remove();today();var i=$('#gulf-date');if(i)i.focus()};
  T.querySelector('[data-gt-check]').onclick=function(){var b=[].slice.call(document.querySelectorAll('.home-view button,.home-view a')).filter(function(x){return /10-question check/i.test(x.textContent)})[0];if(b)b.click();else location.hash='#practice'};
  var top=$('.topbar',main);if(top)top.after(T);else main.prepend(T);
  // Study spaces replace the repeated hero; the progress card stays beside them.
  if(hv&&!$('.gulf-spaces',hv)){
   var sp=document.createElement('section');sp.className='gulf-spaces';sp.setAttribute('aria-labelledby','gs-h2');
   var tiles=[['q','/question-bank','Question Bank',nQ.toLocaleString('en-GB')+' questions','Slide view, notes, review misses'],['hub','#practice','Practice Hub','Timed sets','Mock exams and short checks'],['dos','#dossier','Clinical Dossier','35 dossiers','350 linked cases'],['tools','#tools','React & Interact',nT+' tools','Decision frameworks'],['labs','#labs','Interactive Labs','9 labs','How questions are built'],['gl','#glossary','Glossary',nG+' terms','English and Arabic']];
   sp.innerHTML='<h2 id="gs-h2" class="gt-sub">Study spaces</h2><ul>'+tiles.map(function(t){return '<li><a href="'+t[1]+'"><span class="gl-ico">'+ico(t[0])+'</span><b>'+t[2]+'</b><span class="gs-count">'+esc(t[3])+'</span><small>'+t[4]+'</small></a></li>'}).join('')+'</ul>';
   var intro=$('.home-intro-row',hv);if(intro){intro.classList.add('gulf-more');sp.append(intro)}
   var grid=$('.hero-grid',hv);if(grid)grid.prepend(sp);else hv.prepend(sp);
  }
 }
 function groups(){
  var nav=$('.sidebar nav');if(!nav||$('.gulf-group',nav))return;
  [['guide','Learn'],['dossier','Practise'],['progress','Track']].forEach(function(g){var b=$('[data-nav="'+g[0]+'"]',nav);if(!b)return;var l=document.createElement('span');l.className='gulf-group';l.setAttribute('aria-hidden','true');l.textContent=g[1];b.before(l)});
  var src=$('[data-nav="practice"]',nav);if(!src)return;
  [['question-bank','Question Bank','<path d="M4 5h16M4 10h16M4 15h9M4 20h6"/><circle cx="17.5" cy="17.5" r="3"/><path d="m19.7 19.7 2 2"/>']].forEach(function(x){
   var a=document.createElement('a');a.className=src.className.replace(/\bactive\b/,'')+' gulf-libnav';a.href='/'+x[0];a.title=x[1];
   a.innerHTML='<span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+x[2]+'</svg></span><span>'+esc(x[1])+'</span>';
   src.after(a);
  });
 }
 function footer(){
  var main=$('.main-canvas');if(!main||$('.gulf-foot',main))return;
  var f=document.createElement('footer');f.className='gulf-foot';
  f.innerHTML='<p title="'+esc(CFG.policy)+'"><b>'+esc(c.short)+' edition</b> · original practice material, not official exam content · not endorsed by SCFHS, DHP, DHA or DOH · details checked '+esc(CFG.checked)+'</p>'+
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
 try{if(sessionStorage.getItem('gulf-switched')){sessionStorage.removeItem('gulf-switched');document.documentElement.setAttribute('data-gulf-switched','');setTimeout(function(){document.documentElement.removeAttribute('data-gulf-switched')},1200)}}catch(e){}
 var DKEY='gulf-'+ed+'-exam-date',BANK=(window.SNLE_QUESTIONS||[]).length;
 function examDate(){try{var v=localStorage.getItem(DKEY);return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:''}catch(e){return ''}}
 function daysTo(v){var t=new Date(v+'T00:00:00'),n=new Date();n.setHours(0,0,0,0);return Math.round((t-n)/864e5)}
 function keysHint(){var a=$('.main-canvas .question-actions');if(!a||$('.gulf-keys',a.parentElement))return;var k=document.createElement('p');k.className='gulf-keys';k.innerHTML='Keys: <kbd>A</kbd>–<kbd>E</kbd> choose · <kbd>Enter</kbd> check or next · <kbd>F</kbd> flag';a.after(k)}
 addEventListener('keydown',function(e){
  if(e.ctrlKey||e.metaKey||e.altKey||e.defaultPrevented)return;var t=e.target;if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable))return;
  if($('dialog[open]'))return;var opts=document.querySelectorAll('.main-canvas .option-button');if(!opts.length)return;
  var k=e.key.toLowerCase(),i='abcde'.indexOf(k);
  if(i>-1&&k.length===1){if(opts[i]&&!opts[i].disabled){opts[i].click();opts[i].focus();e.preventDefault()}}
  else if(k==='enter'&&!(t&&t.closest&&t.closest('button,a')&&!t.classList.contains('option-button'))){var b=$('.main-canvas .question-actions .primary-button');if(b&&!b.disabled){b.click();e.preventDefault()}}
  else if(k==='f'){var f=$('.main-canvas .flag-button');if(f){f.click();e.preventDefault()}}
 });
 function homeLinks(){if(innerWidth<1100)return;var r=$('.home-view .home-intro-row'),a=$('.home-view .hero-actions');if(r&&a&&r.parentElement!==a){r.classList.add('gulf-inline-links');a.append(r)}}
 function counts(){var n=(window.SNLE_QUESTIONS||[]).length;if(!n||n===1350)return;var f=n.toLocaleString('en-GB');
  document.querySelectorAll('.practice-heading,.bank-seal,.mock-command-center').forEach(function(r){var w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT,null),t;while((t=w.nextNode())){if(t.nodeValue.indexOf('1,350')>-1)t.nodeValue=t.nodeValue.split('1,350').join(f)}})}
 /* Readiness radar: interactive domain ring (segment size = exam weight, fill = how much you have covered, colour = accuracy). */
 function radarData(){
  var P={};try{P=JSON.parse((window.SNLEStorage&&window.SNLEStorage.getItem('snle-react-interact-progress-v1'))||'{}')||{}}catch(e){}
  var L={};try{L=(JSON.parse(localStorage.getItem('gulf-'+ed+'-lib-questions')||'{}')||{}).done||{}}catch(e){}
  var Q=window.SNLE_QUESTIONS||[],byId={},bank={};Q.forEach(function(q){byId[q.id]=q.domain;bank[q.domain]=(bank[q.domain]||0)+1});
  var R=window.GULF_RATIOS||[['Nursing Fundamentals',.2],['Adult Nursing',.4],['Maternal-Child Nursing',.3],['Nursing Management and Leadership',.1]];
  var D=R.map(function(r){var d=(P.domains||{})[r[0]]||{},a=d.answered||0,c=d.correct||0;
   Object.keys(L).forEach(function(id){if(byId[id]===r[0]&&L[id]&&typeof L[id]==='object'){a++;if(L[id].ok)c++}});
   return {name:r[0],w:r[1],a:a,c:c,bank:bank[r[0]]||1}});
  var A=D.reduce(function(t,d){return t+d.a},0),C=D.reduce(function(t,d){return t+d.c},0);
  return {D:D,A:A,C:C,acc:A?Math.round(C/A*100):null,repair:(P.wrongIds||[]).length+Object.keys(L).filter(function(k){return L[k]&&L[k].ok===false}).length,streak:P.streak||0,tools:(P.studiedPosterIds||[]).length}
 }
 function arc(cx,cy,r,a0,a1){var p=function(a){return [cx+r*Math.sin(a),cy-r*Math.cos(a)]},s=p(a0),e=p(a1),l=(a1-a0)>Math.PI?1:0;return 'M'+s[0].toFixed(2)+' '+s[1].toFixed(2)+' A'+r+' '+r+' 0 '+l+' 1 '+e[0].toFixed(2)+' '+e[1].toFixed(2)}
 function tone(d){if(!d.a)return 'none';var x=d.c/d.a;return x>=.7?'good':x>=.5?'mid':'low'}
 function short(n){return n.replace('Nursing Management and Leadership','Management & Leadership').replace('Maternal-Child Nursing','Maternal–Child').replace('Nursing Fundamentals','Fundamentals')}
 function radar(){
  var card=$('.main-canvas .decision-pulse-card');if(!card)return;
  var R=radarData(),sig=JSON.stringify(R);if(card.dataset.radar===sig)return;card.dataset.radar=sig;card.classList.add('gulf-radar-on');
  var old=$('.gulf-radar',card),sel=old?+old.dataset.sel:-1;if(old)old.remove();
  if(sel<0){var w=-1;R.D.forEach(function(d,i){if(d.a&&(w<0||d.c/d.a<R.D[w].c/R.D[w].a))w=i});sel=w<0?0:w}
  var cx=110,cy=110,r=86,gap=.05,a=0,segs='';
  R.D.forEach(function(d,i){var span=d.w*Math.PI*2,a0=a+gap/2,a1=a+span-gap/2,cov=d.a?Math.max(.04,d.c/d.a):0,af=a0+(a1-a0)*cov;
   segs+='<g class="gr-seg is-'+tone(d)+(i===sel?' is-sel':'')+'" data-i="'+i+'" tabindex="0" role="button" aria-label="'+esc(short(d.name)+': '+d.a+' answered, '+(d.a?Math.round(d.c/d.a*100)+'% correct':'not started'))+'"><path class="gr-track" d="'+arc(cx,cy,r,a0,a1)+'"/>'+(d.a?'<path class="gr-fill" d="'+arc(cx,cy,r,a0,Math.max(af,a0+.02))+'"/>':'')+'<path class="gr-hit" d="'+arc(cx,cy,r,a0,a1)+'"/></g>';a+=span});
  var el=document.createElement('div');el.className='gulf-radar';el.dataset.sel=sel;
  el.innerHTML='<div class="gr-head"><span class="gr-kicker">Readiness map</span><span class="gr-streak" title="Study streak">'+R.streak+'-day streak</span></div>'+
   '<div class="gr-body"><svg viewBox="0 0 220 220" class="gr-svg" role="group" aria-label="Accuracy and coverage by exam domain">'+segs+'<circle cx="110" cy="110" r="62" class="gr-core"/><text x="110" y="106" class="gr-big">'+(R.acc==null?'–':R.acc+'%')+'</text><text x="110" y="128" class="gr-sm">'+(R.A?'accuracy · '+R.A+' answered':'answer to begin')+'</text></svg>'+
   '<div class="gr-detail" aria-live="polite"></div></div>'+
   '<ul class="gr-stats"><li><b>'+R.A+'</b><span>answered</span></li><li><b>'+R.repair+'</b><span>to repair</span></li><li><b>'+R.tools+'</b><span>tools studied</span></li></ul>'+
   '<p class="gr-legend"><i class="is-good"></i>70%+ <i class="is-mid"></i>50–69% <i class="is-low"></i>under 50% <i class="is-none"></i>not started · arc size = exam weight, fill = accuracy</p>';
  function show(i){var d=R.D[i];el.dataset.sel=i;el.querySelectorAll('.gr-seg').forEach(function(g){g.classList.toggle('is-sel',+g.dataset.i===i)});
   var acc=d.a?Math.round(d.c/d.a*100):null,next=!d.a?'Start with a short set in this area.':acc<50?'Priority: review the reasoning on your misses here first.':acc<70?'Close: one more focused set will lift this.':'Strong. Keep it warm with a few questions a week.';
   el.querySelector('.gr-detail').innerHTML='<small>'+Math.round(d.w*100)+'% of the exam</small><h3>'+esc(short(d.name))+'</h3><p class="gr-num"><b>'+(acc==null?'–':acc+'%')+'</b> <span>'+d.c+' of '+d.a+' correct</span></p><div class="gr-bar"><i style="width:'+Math.min(100,d.a/d.bank*100).toFixed(1)+'%"></i></div><p class="gr-cov">'+d.a+' of '+d.bank.toLocaleString('en-GB')+' questions tried</p><p class="gr-next">'+next+'</p><a class="gr-go" href="/question-bank">Practise now →</a>'}
  el.querySelectorAll('.gr-seg').forEach(function(g){var i=+g.dataset.i;g.addEventListener('click',function(){show(i)});g.addEventListener('mouseenter',function(){show(i)});g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();show(i)}})});
  show(sel);card.append(el);
 }
 /* Standard view: calm, exam-centre palette (toggle in the top bar). */
 function stdToggle(){
  var bar=$('.topbar .hs-right')||$('.topbar');if(!bar||$('.gulf-std',bar))return;
  var b=document.createElement('button');b.type='button';b.className='gulf-std';
  var on=document.documentElement.hasAttribute('data-gulf-std');b.setAttribute('aria-pressed',String(on));b.title='Standard view: calm exam-centre colours';
  b.innerHTML='<span aria-hidden="true">◐</span> '+(on?'Standard':'Edition');
  b.onclick=function(){var v=!document.documentElement.hasAttribute('data-gulf-std');document.documentElement.toggleAttribute('data-gulf-std',v);try{localStorage.setItem('gulf-std',v?'1':'0')}catch(e){}b.setAttribute('aria-pressed',String(v));b.innerHTML='<span aria-hidden="true">◐</span> '+(v?'Standard':'Edition')};
  bar.prepend(b);
 }
 function tick(){counts();radar();stdToggle();switcher();groups();suiteChip();today();footer();keysHint();textSweep(document.body);onScroll()}
 var t=null;new MutationObserver(function(){if(t)return;t=setTimeout(function(){t=null;tick()},60)}).observe(document.body,{childList:true,subtree:true,characterData:true});
 addEventListener('hashchange',tick);tick();
})();
