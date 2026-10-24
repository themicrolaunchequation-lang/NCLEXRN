/* Library slide view: question (60%) beside answer and reasoning (40%), question strip, and a study toolbar
   (pen, highlighter, marker, eraser, sticky notes, colours, undo/redo, clear, save). Annotations and crossed-out
   options are saved on this device per exam, bank and question. Runs on library pages after the edition layer. */
(function(){
 'use strict';
 var L=window.GULF_LIB,body=document.body;if(!L||!body)return;
 var AKEY='gulf-'+L.edition+'-notes-'+L.lib,store={},open=false,tool='none',color='#c0392b',size=1,cur=null,undo=[],redo=[],timerStart=0,timerId=0,fs=0,dirty=false;
 try{store=JSON.parse(localStorage.getItem(AKEY)||'{}')||{}}catch(e){store={}}
 var COLORS=['#c0392b','#1f5f8b','#2e7d4f','#14243a','#f2c94c'];
 var TOOLS={pen:{w:2.2,a:1},marker:{w:6,a:.9},highlighter:{w:20,a:.32}};
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
 function rec(id){return store[id]||(store[id]={s:[],n:[],x:[]})}
 function persist(msg){try{localStorage.setItem(AKEY,JSON.stringify(store));dirty=false;if(msg)toast(msg)}catch(e){toast('Could not save: this browser’s storage is full or blocked.')}}
 var root,qpane,qwrap,canvas,ctx,apane,strip,posEl,timeEl,starBtn,toastEl;
 function svg(d){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+d+'</svg>'}
 var IC={pen:'<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="m14 6 3 3"/>',highlighter:'<path d="m9 15 6-6 3 3-6 6H9z"/><path d="M4 20h7"/><path d="m15 9 3-3 3 3-3 3"/>',marker:'<path d="M12 3 7 14h10z"/><path d="M9 14v4h6v-4"/><path d="M5 21h14"/>',eraser:'<path d="m7 21-4-4 10-10 7 7-7 7z"/><path d="M21 21H7"/>',note:'<path d="M5 3h14v12l-6 6H5z"/><path d="M13 21v-6h6"/>',undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',redo:'<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',clear:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',save:'<path d="M5 3h12l3 3v15H4V3z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',full:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',close:'<path d="M6 6l12 12M18 6 6 18"/>',cursor:'<path d="M5 3l14 8-6 2-2 6z"/>'};
 function build(){
  if(root)return;root=document.createElement('div');root.className='gulf-slide';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',L.noun+' slide view');
  root.innerHTML='<div class="gs-top"><span class="gulf-motif" aria-hidden="true"></span><span class="gs-pos" aria-live="polite"></span><div class="gs-filters" role="group" aria-label="Filters"></div><button type="button" class="gs-star"></button><span class="gs-time" title="Time on this '+L.noun.toLowerCase()+'">0:00</span><div class="gs-size" role="group" aria-label="Text size"><button type="button" data-size="-1" aria-label="Smaller text">A−</button><button type="button" data-size="1" aria-label="Larger text">A+</button></div><button type="button" class="gs-full" aria-label="Full screen">'+svg(IC.full)+'</button><button type="button" class="gs-close" aria-label="Close slide view (Esc)">'+svg(IC.close)+'<span>Exit</span></button></div>'+
   '<div class="gs-main"><section class="gs-q" aria-label="'+L.noun+'"><div class="gs-qwrap"></div></section><aside class="gs-a" aria-label="Answer and reasoning"></aside></div>'+
   '<div class="gs-strip" role="navigation" aria-label="'+L.noun+'s on this page"></div>'+
   '<div class="gs-tools" role="toolbar" aria-label="Study tools">'+
    '<button type="button" data-nav="-1" class="gs-navb" aria-label="Previous">←</button>'+
    ['none:cursor:Select and answer','pen:pen:Pen (1)','highlighter:highlighter:Highlighter (2)','marker:marker:Marker (3)','eraser:eraser:Eraser (4)','note:note:Sticky note (5)'].map(function(x){x=x.split(':');return '<button type="button" data-tool="'+x[0]+'" aria-label="'+x[2]+'" title="'+x[2]+'">'+svg(IC[x[1]])+'</button>'}).join('')+
    '<span class="gs-sep"></span>'+COLORS.map(function(c,i){return '<button type="button" class="gs-col" data-color="'+c+'" style="--c:'+c+'" aria-label="Colour '+(i+1)+'"></button>'}).join('')+
    '<span class="gs-sep"></span><button type="button" data-act="undo" aria-label="Undo (Ctrl+Z)" title="Undo">'+svg(IC.undo)+'</button><button type="button" data-act="redo" aria-label="Redo (Ctrl+Y)" title="Redo">'+svg(IC.redo)+'</button><button type="button" data-act="clear" aria-label="Clear my marks on this '+L.noun.toLowerCase()+'" title="Clear marks">'+svg(IC.clear)+'</button><button type="button" data-act="save" aria-label="Save" title="Save">'+svg(IC.save)+'<span>Save</span></button>'+
    '<button type="button" data-nav="1" class="gs-navb gs-next" aria-label="Next">→</button></div><div class="gs-toast" role="status"></div>';
  body.append(root);
  qpane=root.querySelector('.gs-q');qwrap=root.querySelector('.gs-qwrap');apane=root.querySelector('.gs-a');strip=root.querySelector('.gs-strip');posEl=root.querySelector('.gs-pos');timeEl=root.querySelector('.gs-time');starBtn=root.querySelector('.gs-star');toastEl=root.querySelector('.gs-toast');
  root.querySelector('.gs-close').onclick=close;
  root.querySelector('.gs-full').onclick=function(){try{if(document.fullscreenElement)document.exitFullscreen();else root.requestFullscreen().catch(function(){})}catch(e){}};
  root.querySelectorAll('[data-size]').forEach(function(b){b.onclick=function(){fs=Math.max(-2,Math.min(4,fs+ +b.dataset.size));root.style.setProperty('--gs-scale',1+fs*.08);try{localStorage.setItem('gulf-slide-size',fs)}catch(e){}requestAnimationFrame(sizeCanvas)}});
  try{fs=+localStorage.getItem('gulf-slide-size')||0;root.style.setProperty('--gs-scale',1+fs*.08)}catch(e){}
  root.querySelectorAll('[data-tool]').forEach(function(b){b.onclick=function(){setTool(b.dataset.tool)}});
  root.querySelectorAll('[data-color]').forEach(function(b){b.onclick=function(){color=b.dataset.color;paintTools()}});
  root.querySelectorAll('[data-nav]').forEach(function(b){b.onclick=function(){go(+b.dataset.nav)}});
  root.querySelector('[data-act="undo"]').onclick=doUndo;root.querySelector('[data-act="redo"]').onclick=doRedo;
  root.querySelector('[data-act="save"]').onclick=function(){persist('Saved on this device')};
  root.querySelector('[data-act="clear"]').onclick=function(){var r=rec(cur);if(!r.s.length&&!r.n.length&&!r.x.length)return;push({t:'clear',prev:JSON.parse(JSON.stringify(r))});r.s=[];r.n=[];r.x=[];render(true)};
  starBtn.onclick=function(){var st=L.state();if(st.stars[cur])delete st.stars[cur];else st.stars[cur]=1;L.save();L.score();paintStar()};
  strip.addEventListener('click',function(e){var b=e.target.closest('[data-i]');if(b)L.go(+b.dataset.i)});
  apane.addEventListener('click',function(e){if(e.target.closest('.gs-reveal')){var d=apane.querySelector('details');if(d)d.open=true;apane.classList.add('is-revealed')}if(e.target.closest('.gulf-again')){var a=L.cards()[L.index()];if(a)L.unmark(a);render(false)}});
  canvas=document.createElement('canvas');canvas.className='gs-ink';ctx=canvas.getContext('2d');
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
  qwrap.addEventListener('click',function(e){
   if(tool==='note'&&!e.target.closest('.gs-note')){var b=qwrap.getBoundingClientRect();addNote((e.clientX-b.left)/b.width,(e.clientY-b.top)/b.height);return}
   if(tool!=='none')return;
   var x=e.target.closest('.gs-x');if(x){var r=rec(cur),L2=x.dataset.l,i=r.x.indexOf(L2);push({t:'x',l:L2,on:i<0});if(i<0)r.x.push(L2);else r.x.splice(i,1);render(true);return}
   var o=e.target.closest('.gs-opt');if(o&&!o.hasAttribute('aria-disabled')){var a=L.cards()[L.index()];if(a)L.mark(a,o.dataset.l)}});
  new ResizeObserver(function(){if(open)sizeCanvas()}).observe(qpane);
  paintTools();
 }
 /* Filters in the top bar: proxies for the library's own controls, so its search and paging stay the single source of truth. */
 function fire(el,type){el.dispatchEvent(new Event(type,{bubbles:true}))}
 function buildFilters(){
  var box=root.querySelector('.gs-filters');if(box.dataset.ok)return;var src=document.querySelector('#search');if(!src)return;box.dataset.ok='1';
  var html='<span class="gs-fsearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/></svg><input type="search" data-for="search" placeholder="Search a clue or topic" aria-label="Search"></span>';
  var sels=[].slice.call(document.querySelectorAll('.filters select'));
  sels.forEach(function(sel,i){var lab=sel.closest('label'),name=lab?(lab.firstChild&&lab.firstChild.textContent||lab.textContent).trim():'Filter';if(!sel.id)sel.id='gulf-f-'+i;
   html+='<select class="gs-fsel" data-for="'+sel.id+'" aria-label="'+esc(name)+'" title="'+esc(name)+'">'+[].slice.call(sel.options).map(function(o,j){return '<option value="'+esc(o.value)+'">'+esc(j===0&&/^all\b/i.test(o.text)&&!/hyp/i.test(o.text)?name+': All':j===0&&sel.id==='sort'?'Sort: '+o.text:o.text)+'</option>'}).join('')+'</select>'});
  html+='<div class="gs-rev" role="group" aria-label="Show"><button type="button" data-rv="all">All</button><button type="button" data-rv="miss">Missed</button><button type="button" data-rv="star">Starred</button></div><button type="button" class="gs-freset" hidden>Reset</button>';
  box.innerHTML=html;
  box.querySelector('[data-for="search"]').addEventListener('input',function(e){src.value=e.target.value;fire(src,'input')});
  box.querySelectorAll('select').forEach(function(p){p.addEventListener('change',function(){var o=document.getElementById(p.dataset.for);o.value=p.value;fire(o,'change');syncFilters()})});
  box.querySelectorAll('[data-rv]').forEach(function(b){b.onclick=function(){L.setReview(b.dataset.rv);syncFilters()}});
  box.querySelector('.gs-freset').onclick=function(){src.value='';sels.forEach(function(s){s.selectedIndex=0});fire(src,'input');L.setReview('all');syncFilters()};
 }
 function syncFilters(){
  var box=root.querySelector('.gs-filters');if(!box.dataset.ok)return;var n=0,src=document.querySelector('#search'),si=box.querySelector('[data-for="search"]');
  if(src&&document.activeElement!==si)si.value=src.value;if(src&&src.value.trim())n++;
  box.querySelectorAll('select').forEach(function(p){var o=document.getElementById(p.dataset.for);if(o){p.value=o.value;var on=o.selectedIndex>0&&o.id!=='sort';p.classList.toggle('is-on',on||(o.id==='sort'&&o.selectedIndex>0));if(on)n++}});
  var c=L.counts(),rv=L.review();box.querySelectorAll('[data-rv]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.rv===rv));if(b.dataset.rv==='miss')b.textContent='Missed '+c.miss;if(b.dataset.rv==='star')b.textContent='★ '+c.star});
  if(rv!=='all')n++;box.querySelector('.gs-freset').hidden=!n;
 }
 function toast(m){toastEl.textContent=m;toastEl.classList.add('on');clearTimeout(toastEl._t);toastEl._t=setTimeout(function(){toastEl.classList.remove('on')},1800)}
 function setTool(t){tool=t;paintTools();root.classList.toggle('gs-drawing',/^(pen|marker|highlighter|eraser)$/.test(t));root.classList.toggle('gs-noting',t==='note')}
 function paintTools(){root.querySelectorAll('[data-tool]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.tool===tool))});root.querySelectorAll('[data-color]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.color===color))})}
 function paintStar(){var on=!!L.state().stars[cur];starBtn.textContent=on?'★ Starred':'☆ Star';starBtn.setAttribute('aria-pressed',String(on))}
 function push(a){a.id=cur;undo.push(a);redo=[];dirty=true}
 function apply(a,back){var r=rec(a.id);
  if(a.t==='stroke'){if(back)r.s.pop();else r.s.push(a.s)}
  else if(a.t==='erase'){if(back)r.s.splice(a.i,0,a.s);else r.s.splice(a.i,1)}
  else if(a.t==='note+'){if(back)r.n=r.n.filter(function(n){return n.k!==a.n.k});else r.n.push(a.n)}
  else if(a.t==='note-'){if(back)r.n.splice(a.i,0,a.n);else r.n.splice(a.i,1)}
  else if(a.t==='x'){var i=r.x.indexOf(a.l);if(a.on!==back){if(i<0)r.x.push(a.l)}else if(i>-1)r.x.splice(i,1)}
  else if(a.t==='clear'){if(back){r.s=a.prev.s;r.n=a.prev.n;r.x=a.prev.x}else{r.s=[];r.n=[];r.x=[]}}}
 function doUndo(){var a=undo.pop();if(!a)return;if(a.id!==cur){undo.push(a);toast('Nothing to undo on this '+L.noun.toLowerCase());return}apply(a,true);redo.push(a);dirty=true;render(true)}
 function doRedo(){var a=redo.pop();if(!a)return;if(a.id!==cur){redo.push(a);return}apply(a,false);undo.push(a);dirty=true;render(true)}
 /* ink */
 var drawing=null;
 function pt(e){var b=canvas.getBoundingClientRect();return[(e.clientX-b.left)/b.width,(e.clientY-b.top)/b.height]}
 function down(e){if(!/^(pen|marker|highlighter|eraser)$/.test(tool))return;canvas.setPointerCapture(e.pointerId);e.preventDefault();
  if(tool==='eraser'){eraseAt(pt(e));drawing={erase:true};return}
  drawing={t:tool,c:color,p:[pt(e)]};}
 function move(e){if(!drawing)return;if(drawing.erase){eraseAt(pt(e));return}drawing.p.push(pt(e));draw()}
 function up(){if(!drawing)return;if(!drawing.erase&&drawing.p.length>1){var s={t:drawing.t,c:drawing.c,p:drawing.p.map(function(q){return[+q[0].toFixed(4),+q[1].toFixed(4)]})};rec(cur).s.push(s);push({t:'stroke',s:s})}drawing=null;draw()}
 function eraseAt(p){var r=rec(cur),W=canvas.width,H=canvas.height;for(var i=r.s.length-1;i>=0;i--){if(r.s[i].p.some(function(q){return Math.hypot((q[0]-p[0])*W,(q[1]-p[1])*H)<14*devicePixelRatio})){var s=r.s.splice(i,1)[0];push({t:'erase',i:i,s:s});draw();return}}}
 function stroke(s){var T=TOOLS[s.t]||TOOLS.pen,W=canvas.width,H=canvas.height,d=devicePixelRatio||1;ctx.save();ctx.globalAlpha=T.a;ctx.strokeStyle=s.c;ctx.lineWidth=T.w*d;ctx.lineCap=s.t==='highlighter'?'butt':'round';ctx.lineJoin='round';if(s.t==='highlighter')ctx.globalCompositeOperation='multiply';
  ctx.beginPath();s.p.forEach(function(q,i){var x=q[0]*W,y=q[1]*H;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y)});ctx.stroke();ctx.restore()}
 function draw(){if(!ctx)return;ctx.clearRect(0,0,canvas.width,canvas.height);(rec(cur).s||[]).forEach(stroke);if(drawing&&drawing.p)stroke(drawing)}
 function sizeCanvas(){if(!canvas.isConnected)return;var d=devicePixelRatio||1,w=qwrap.scrollWidth,h=qwrap.scrollHeight;canvas.style.width=w+'px';canvas.style.height=h+'px';canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);draw()}
 /* notes */
 var NOTE_COLORS=['#fff3b0','#ffd6e0','#d4f1e4','#dbe8ff'];
 function addNote(x,y){var n={k:Date.now().toString(36),x:Math.min(.8,x),y:Math.min(.9,y),t:'',c:NOTE_COLORS[rec(cur).n.length%4]};rec(cur).n.push(n);push({t:'note+',n:n});render(true);var ta=qwrap.querySelector('.gs-note[data-k="'+n.k+'"] textarea');if(ta)ta.focus();setTool('none')}
 function notes(){qwrap.querySelectorAll('.gs-note').forEach(function(e){e.remove()});
  rec(cur).n.forEach(function(n,i){var el=document.createElement('div');el.className='gs-note';el.dataset.k=n.k;el.style.left=(n.x*100)+'%';el.style.top=(n.y*100)+'%';el.style.background=n.c;
   el.innerHTML='<div class="gs-note-bar"><span aria-hidden="true">⋮⋮</span><button type="button" aria-label="Delete note">×</button></div><textarea aria-label="Sticky note" placeholder="Note…" rows="3"></textarea>';
   var ta=el.querySelector('textarea');ta.value=n.t;ta.oninput=function(){n.t=ta.value;dirty=true};
   el.querySelector('button').onclick=function(){var r=rec(cur),j=r.n.indexOf(n);if(j>-1){r.n.splice(j,1);push({t:'note-',i:j,n:n});render(true)}};
   var bar=el.querySelector('.gs-note-bar');bar.onpointerdown=function(e){if(e.target.closest('button'))return;bar.setPointerCapture(e.pointerId);var b=qwrap.getBoundingClientRect();bar.onpointermove=function(m){n.x=Math.max(0,Math.min(.92,(m.clientX-b.left-20)/b.width));n.y=Math.max(0,Math.min(.95,(m.clientY-b.top-10)/b.height));el.style.left=(n.x*100)+'%';el.style.top=(n.y*100)+'%';dirty=true};bar.onpointerup=function(){bar.onpointermove=null}};
   qwrap.append(el)})}
 /* render */
 function render(keepTimer){
  var a=L.cards()[L.index()];if(!a){qwrap.innerHTML='<p class="gs-empty">No '+L.noun.toLowerCase()+'s match. Change or reset the filters above.</p>';apane.innerHTML='';strip.innerHTML='';posEl.textContent='No matches';syncFilters();return}
  var id=L.qid(a);if(id!==cur){cur=id;keepTimer=false}
  var meta=a.querySelector('p'),h2=a.querySelector('h2'),lis=[].slice.call(a.querySelectorAll('ol>li')),picked=a.dataset.picked,right=a.dataset.right,r=rec(id);
  var metaTxt=meta?meta.textContent.replace(/[★☆]/g,'').trim():'';
  qwrap.innerHTML='<p class="gs-meta">'+esc(metaTxt)+'</p><h2 class="gs-stem">'+esc(h2?h2.textContent:'')+'</h2><ol class="gs-opts">'+lis.map(function(li){var l=li.dataset.letter||'',x=r.x.indexOf(l)>-1,cls='gs-opt'+(x?' is-x':'')+(picked&&l===right?' is-right':'')+(picked&&l===picked&&l!==right?' is-wrong':'');
   return '<li><button type="button" class="'+cls+'" data-l="'+l+'"'+(picked?' aria-disabled="true"':'')+'><b>'+l+'</b><span>'+esc(li.childNodes[0]?li.childNodes[0].textContent:li.textContent)+'</span></button><button type="button" class="gs-x" data-l="'+l+'" aria-pressed="'+x+'" aria-label="'+(x?'Restore':'Cross out')+' option '+l+'" title="'+(x?'Restore':'Cross out')+'">'+(x?'↺':'✕')+'</button></li>'}).join('')+'</ol>';
  qwrap.append(canvas);notes();requestAnimationFrame(sizeCanvas);
  var v=a.querySelector('.gulf-verdict'),d=a.querySelector('details');
  if(picked){apane.classList.add('is-revealed');apane.innerHTML=(v?'<div class="'+v.className+'">'+v.innerHTML+'</div>':'')+(d?'<details open>'+d.innerHTML.replace(/<summary>[\s\S]*?<\/summary>/,'<summary>Reasoning</summary>')+'</details>':'')}
  else{apane.classList.remove('is-revealed');apane.innerHTML='<div class="gs-wait"><p class="gs-wait-h">Choose the safest answer.</p><p>Click an option or press <kbd>A</kbd>–<kbd>E</kbd>. Rule options out with <b>✕</b>. Draw on the question with the tools below.</p><button type="button" class="gs-reveal">Show reasoning without answering</button></div>'+(d?'<details>'+d.innerHTML.replace(/<summary>[\s\S]*?<\/summary>/,'<summary>Reasoning</summary>')+'</details>':'')}
  var pi=L.pageInfo(),n=(pi[0]-1)*20+L.index()+1;posEl.textContent=L.noun+' '+n+' of '+L.total();syncFilters();
  var st=L.state();strip.innerHTML=L.cards().map(function(c,i){var k=L.qid(c),dn=st.done[k],cls=(i===L.index()?' is-cur':'')+(dn?dn.ok?' is-ok':' is-no':'')+(st.stars[k]?' is-star':'');return '<button type="button" data-i="'+i+'" class="gs-dot'+cls+'" aria-label="'+esc(L.noun+' '+((pi[0]-1)*20+i+1)+(dn?dn.ok?', correct':', missed':'')+(st.stars[k]?', starred':''))+'"'+(i===L.index()?' aria-current="true"':'')+'>'+((pi[0]-1)*20+i+1)+'</button>'}).join('')+'<span class="gs-page">Page '+pi[0]+' of '+pi[1]+'</span>';
  root.querySelector('[data-nav="-1"]').disabled=L.index()===0&&pi[0]===1;root.querySelector('[data-nav="1"]').disabled=L.index()===L.cards().length-1&&pi[0]===pi[1];
  paintStar();
  if(!keepTimer){timerStart=Date.now();tick()}
 }
 function tick(){var s=Math.floor((Date.now()-timerStart)/1000);timeEl.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
 function go(d){if(dirty)persist();L.step(d)}
 function keys(e){
  if(e.defaultPrevented)return;
  var t=e.target;if(t&&/^(TEXTAREA|INPUT|SELECT)$/.test(t.tagName)){if(e.key==='Escape')t.blur();return}
  var k=e.key.toLowerCase(),mod=e.ctrlKey||e.metaKey;
  if(mod&&k==='z'){e.preventDefault();e.shiftKey?doRedo():doUndo();return}if(mod&&k==='y'){e.preventDefault();doRedo();return}if(mod&&k==='s'){e.preventDefault();persist('Saved on this device');return}if(mod||e.altKey)return;
  if(e.key==='Escape'){if(tool!=='none'){setTool('none')}else close();e.preventDefault();return}
  if(e.key==='ArrowRight'){go(1);e.preventDefault()}else if(e.key==='ArrowLeft'){go(-1);e.preventDefault()}
  else if(/^[1-5]$/.test(k)){setTool(['pen','highlighter','marker','eraser','note'][+k-1]);e.preventDefault()}
  else if(k==='0'){setTool('none')}
  else if(k==='s'){starBtn.click();e.preventDefault()}
  else if(/^[a-e]$/.test(k)){var a=L.cards()[L.index()];if(a&&a.querySelector('li[data-letter="'+k.toUpperCase()+'"]')){L.mark(a,k.toUpperCase());e.preventDefault()}}
  else if(e.key===' '&&!(t&&t.closest&&t.closest('button,summary'))){var d=apane.querySelector('details');if(d){d.open=!d.open;apane.classList.add('is-revealed');e.preventDefault()}}
 }
 var lastFocus=null;
 function openSlide(){build();buildFilters();open=true;lastFocus=document.activeElement;body.classList.add('gulf-slide-on');root.hidden=false;render(false);clearInterval(timerId);timerId=setInterval(tick,1000);root.querySelector('.gs-close').focus()}
 function close(){if(dirty)persist();open=false;body.classList.remove('gulf-slide-on');root.hidden=true;clearInterval(timerId);setTool('none');try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}if(lastFocus&&lastFocus.focus)lastFocus.focus()}
 document.addEventListener('keydown',function(e){if(open)keys(e)},true);
 L.onChange=function(){if(open)render(true)};
 document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.gulf-slidebtn'))openSlide()});
 (function auto(){var tries=0;(function wait(){if(L.cards().length){openSlide();return}if(++tries<60)setTimeout(wait,100)})()})();
 addEventListener('beforeunload',function(){if(dirty)persist()});
})();
