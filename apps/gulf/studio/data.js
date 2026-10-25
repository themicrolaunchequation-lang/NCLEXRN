/* Adapt shared SNLE content to the chosen Gulf edition: neutral wording for Saudi-specific terms. Runs after data, before app. */
(function(){
 var ed=window.GULF_EDITION;if(!ed)return;
 var rules=[[/the Kingdom of Saudi Arabia/gi,'your country'],[/Kingdom of Saudi Arabia/gi,'your country'],[/\bin Saudi Arabia\b/g,'in your country'],[/Saudi Arabia/g,'your country'],[/\bKSA\b/g,'your country'],[/Mumaris\+?/g,'the licensing portal'],[/\bSaudi\b/g,'local'],[/\bSCFHS\b/g,'regulator'],[/\bSNLE\b/g,'licensing exam']];
 var post=[[/\blocal\/local\b/g,'local'],[/\blocal\/regulator\b/g,'local and regulator'],[/MOH consent\/rights/g,'health-ministry consent and patient-rights rules'],[/\bCBAHI standards\b/g,'national accreditation standards'],[/\bMOH\b/g,'the health ministry'],[/\bCBAHI\b/g,'the national accreditation body'],[/localize to local law/g,'apply local law'],[/licensing exam (professional-practice|legal\/professional) decisions/g,'Exam $1 decisions'],[/for licensing exam questions/g,'for exam questions'],[/the governing licensing exam framework/g,'the governing exam framework']];
 function fix(s){for(var i=0;i<rules.length;i++)s=s.replace(rules[i][0],rules[i][1]);for(i=0;i<post.length;i++)s=s.replace(post[i][0],post[i][1]);return s}
 function walk(o,d){if(d>12||o==null)return;if(Array.isArray(o)){for(var i=0;i<o.length;i++){var v=o[i];if(typeof v==='string')o[i]=fix(v);else walk(v,d+1)}return}
  if(typeof o==='object'){for(var k in o){if(!Object.prototype.hasOwnProperty.call(o,k))continue;var v=o[k];if(typeof v==='string'){if(k!=='id'&&k!=='key'&&k!=='toolId'&&k!=='tool'&&!/^(?:image|img|src|url|href|poster)/i.test(k))o[k]=fix(v)}else walk(v,d+1)}}}
 if(ed!=='saudi'){['SNLE_POSTERS','SNLE_QUESTIONS','SNLE_LEARNING'].forEach(function(n){try{walk(window[n],0)}catch(e){}});
 var held;try{Object.defineProperty(window,'SNLE_DOSSIERS',{configurable:true,get:function(){return held},set:function(v){try{walk(v,0)}catch(e){}held=v}})}catch(e){}}
 window.GULF_FIX=fix;
 // Edition-specific questions go first in this edition's bank, mapped to the shared question shape.
 var X=((window.GULF_CONFIG||{}).extra||{})[ed];
 if(Array.isArray(X)&&X.length&&Array.isArray(window.SNLE_QUESTIONS)){
  var KIND={'practice-setting':'Gulf practice setting','localised':'Gulf practice setting','clinical':'Gulf clinical priorities'};
  var mapped=X.map(function(q,i){var h=Number(q.hyp)||75,tn=KIND[q.kind]||'Gulf clinical priorities';
   return {id:q.id,toolNumber:900,toolQuestionNumber:i+1,globalNumber:9000+i,tool:'G'+(q.kind==='clinical'?'02 ':'01 ')+tn,toolName:tn,stem:q.stem,options:q.options,key:q.key,
    answerText:q.answerText||((q.options.filter(function(o){return o.label===q.key})[0]||{}).text||''),rationale:q.rationale||'',pearl:q.pearl||'',trap:q.trap||'',misconceptions:q.misconceptions||null,
    studyFocus:q.pearl||'',domain:q.domain,subdomain:q.subdomain||'',process:q.subdomain||'',population:q.population||'',setting:q.setting||'',construct:q.subdomain||'',
    hyp:h,hypBand:'HYP'+(h>=90?5:h>=80?4:h>=70?3:h>=60?2:1),difficulty:q.difficulty||'Medium',judgment:q.judgment||'Take Action',
    evidence:q.source&&q.source.url?'Sourced: '+(q.source.title||q.source.url):'Edition item',quality:'Approved for release by the Academy owner',actionRequired:'',editionItem:true,source:q.source||null}});
  window.GULF_EXTRA_IDS=mapped.map(function(q){return q.id});
  window.SNLE_QUESTIONS=mapped.concat(window.SNLE_QUESTIONS);
 }
 // Each edition gets its own stable question order in the libraries, so the four studios never open on the same items.
 // Saudi keeps the original order. Seeded, so a learner sees the same order every visit.
 function seeded(arr,seed){var h=2166136261;for(var i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619)}
  function rnd(){h^=h<<13;h^=h>>>17;h^=h<<5;return((h>>>0)%1e6)/1e6}
  for(var j=arr.length-1;j>0;j--){var k=Math.floor(rnd()*(j+1)),t=arr[j];arr[j]=arr[k];arr[k]=t}return arr}
 if(ed!=='saudi'){
  // Main-app lists: keep high-yield first (by HYP band), then an edition-specific order inside each band.
  var hk=function(x){var h=2166136261,t=ed+'|'+x;for(var i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  var band=function(v){v=Number(v)||0;return v>=90?3:v>=80?2:v>=70?1:0};
  window.GULF_ORDER=function(ha,hb,ka,kb){return band(hb)-band(ha)||hk(ka)-hk(kb)};
  var G=window.SNLE_LEARNING&&window.SNLE_LEARNING.glossary;
  if(Array.isArray(G)&&G.length){var pick=G.slice().filter(function(x){return x.term!=='Stem'}).sort(function(x,y){return hk(x.term)-hk(y.term)})[0];window.GULF_GLOSS={cat:pick.category,term:pick.term}}
  if(Array.isArray(window.SNLE_QUESTIONS)){var nX=(window.GULF_EXTRA_IDS||[]).length,head=window.SNLE_QUESTIONS.slice(0,nX),tail=seeded(window.SNLE_QUESTIONS.slice(nX),'gulf-'+ed+'-q');window.SNLE_QUESTIONS.length=0;Array.prototype.push.apply(window.SNLE_QUESTIONS,head.concat(tail))}
  if(Array.isArray(window.SNLE_POSTERS))seeded(window.SNLE_POSTERS,'gulf-'+ed+'-t');
  if(window.SNLE_LEARNING&&Array.isArray(window.SNLE_LEARNING.glossary))seeded(window.SNLE_LEARNING.glossary,'gulf-'+ed+'-g');
  var dHeld=window.SNLE_DOSSIERS,desc=Object.getOwnPropertyDescriptor(window,'SNLE_DOSSIERS');
  try{Object.defineProperty(window,'SNLE_DOSSIERS',{configurable:true,get:function(){return dHeld},set:function(v){if(desc&&desc.set){desc.set(v);v=desc.get()}if(Array.isArray(v)){seeded(v,'gulf-'+ed+'-d');v.forEach(function(d){if(Array.isArray(d.qs))seeded(d.qs,'gulf-'+ed+'-'+d.id)})}dHeld=v}})}catch(e){}
 }
 // Edition-aware guide, domain weights and mock lengths (the shared SNLE originals describe the Saudi exam).
 var CFG=window.GULF_CONFIG||{},E=(CFG.editions||{})[ed];
 if(E){
  function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var ds=E.domains||[],ok=ds.length===4&&ds.every(function(d){return typeof d.count==='number'});
  function wt(i){return ok?ds[i].count+' of '+E.questions+' questions':'Studio mix (no published split)'}
  window.GULF_WEIGHTS={f:wt(0),a:wt(1),m:wt(2),l:wt(3)};
  window.GULF_MOCKS=[20,50,100,E.questions];
  var KEYS=['Nursing Fundamentals','Adult Nursing','Maternal-Child Nursing','Nursing Management and Leadership'];
  if(ok){window.GULF_RATIOS=KEYS.map(function(k,i){return[k,ds[i].count/E.questions]});
   window.GULF_BP_EYEBROW='BLUEPRINT · '+ds.map(function(d){return d.count}).join(' / ')+' OF '+E.questions;
   window.GULF_BP_TEXT=ds[0].count+' Nursing Fundamentals · '+ds[1].count+' Adult Nursing · '+ds[2].count+' Maternal–Child Nursing · '+ds[3].count+' Management and Leadership.'}
  else{var Qs=window.SNLE_QUESTIONS||[],cnt=KEYS.map(function(k){return Qs.filter(function(q){return q.domain===k}).length}),tot=cnt.reduce(function(a,b){return a+b},0)||1;
   window.GULF_RATIOS=KEYS.map(function(k,i){return[k,cnt[i]/tot]});
   window.GULF_BP_EYEBROW='PRACTICE SET · BALANCED STUDIO MIX';
   window.GULF_BP_TEXT=E.regulatorShort+' does not publish how many questions come from each area, so sets are balanced across all four areas using this studio\u2019s own mix.'}
  var CHIP={ok:'Published',check:'Check at booking',none:'Not published'};
  window.GULF_UI={tiles:function(e){return '<div class="gulf-tiles">'+e.tiles.map(function(t){return '<div class="gulf-tile is-'+t.s+'"><small>'+esc(t.k)+'</small><strong>'+esc(t.v)+'</strong><span>'+esc(t.n)+'</span><em class="gulf-chip is-'+t.s+'">'+CHIP[t.s]+'</em></div>'}).join('')+'</div>'}};
  var mix=ok?ds.map(function(d,i){return[d.label,d.count]}):KEYS.map(function(k,i){return[ds[i]?ds[i].label:k,Math.round(window.GULF_RATIOS[i][1]*100)]});
  window.GULF_GUIDE=function(){
      var bar='<div class="gulf-mix" role="img" aria-label="'+esc(mix.map(function(m){return m[0]+' '+m[1]+(ok?' questions':' percent')}).join(', '))+'">'+mix.map(function(m,i){var w=ok?m[1]/E.questions*100:m[1];return '<span class="gulf-mix-seg s'+i+'" style="flex-basis:'+w.toFixed(1)+'%"></span>'}).join('')+'</div>'+
    '<ul class="gulf-mix-key">'+mix.map(function(m,i){return '<li><i class="s'+i+'"></i>'+esc(m[0])+' <b>'+esc(ok?m[1]+' of '+E.questions:m[1]+'%')+'</b></li>'}).join('')+'</ul>';
   var src=(E.sources||[]).map(function(x){return '<li><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.label)+' ↗</a></li>'}).join('');
   return '<div class="page-content guide-page gulf-guide"><div class="gulf-guide-cols"><div class="gulf-guide-main"><section class="page-hero gulf-hero"><div><span class="eyebrow">'+esc(E.regulator.toUpperCase())+'</span><h1>'+esc(E.short)+' Guide</h1><p>'+esc(E.intro)+'</p></div></section>'+
    window.GULF_UI.tiles(E)+
    '<div class="gulf-guide-alert"><b>Check before you book.</b> These details come from regulator publications read on '+esc(CFG.checked)+'. Rules can change, so confirm with '+esc(E.regulatorShort)+'.</div>'+
    '<h2>'+(ok?'Published blueprint':'How practice sets are balanced')+'</h2><p>'+esc(E.mix)+'</p>'+bar+'</div>'+
    '<div class="gulf-guide-side"><section><h2>Attempts</h2><p>'+esc(E.notes.retake)+'</p></section>'+
    '<section><h2>How to use this studio</h2><ol class="gulf-steps"><li><b>Learn the pattern.</b> Start with React &amp; Interact and Interactive Labs to see how questions hide the decision.</li><li><b>Practise.</b> Use the Practice Hub for timed sets and the Clinical Dossier for case practice.</li><li><b>Repeat what you missed.</b> My Progress shows what to review. Each exam keeps its own record.</li></ol></section>'+
    '<section><h2>Official sources</h2><ul class="gulf-sources">'+src+'</ul><p class="gulf-guide-note">'+esc(CFG.policy)+'</p></section></div></div></div>';
  };
 }

})();

/* Library pages: "One at a time" practice view. Answers are marked, reasoning laid out by role, progress and stars
   saved on this device (per exam), Missed / Starred review, filters folded away, keyboard navigation. */
(function(){
 if(typeof document==='undefined')return;var body=document.body;if(!body||!body.dataset.library||body.dataset.library==='tools')return;
 var lib=body.dataset.library,ed=window.GULF_EDITION||'gulf',KEY='gulf-lib-view',SKEY='gulf-'+ed+'-lib-'+lib,mode='one',idx=0,bar,go=null,filtersOpen=false,review='all',confirmClear=false;
 var st={done:{},stars:{}};
 try{mode=localStorage.getItem(KEY)==='list'?'list':'one'}catch(e){}
 try{var raw=JSON.parse(localStorage.getItem(SKEY)||'null');if(raw&&typeof raw==='object'){st.done=raw.done||{};st.stars=raw.stars||{}}}catch(e){}
 var $=function(s){return document.querySelector(s)},noun=lib==='dossiers'?'Case':'Question';
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
 function cards(){var it=$('#items');return it?[].slice.call(it.querySelectorAll(':scope>article')):[]}
 function qid(a){var p=a.querySelector('p');return p?p.textContent.split('·')[0].replace(/[★☆]/g,'').trim():''}
 function save(){try{localStorage.setItem(SKEY,JSON.stringify(st))}catch(e){}}
 function counts(){var r=0,all=0,miss=0,star=0,k;for(k in st.done){var d=st.done[k];if(!d||typeof d!=='object')continue;all++;if(d.ok)r++;else miss++}for(k in st.stars)if(st.stars[k])star++;return{r:r,all:all,miss:miss,star:star}}
 function enhance(a){
  if(a.dataset.g)return;a.dataset.g='1';
  var id=qid(a),meta=a.querySelector('p');
  if(meta){var sb=document.createElement('button');sb.type='button';sb.className='gulf-star';sb.dataset.id=id;meta.prepend(sb);paintStar(sb)}
  var d=a.querySelector('details'),ol=a.querySelector('ol');if(!d||!ol)return;
  var right='';[].slice.call(d.querySelectorAll('p')).forEach(function(p){var b=p.querySelector('b'),t=b?b.textContent.trim():'';
   var m=t.match(/^Answer ([A-E]):?$/);if(m){right=m[1];p.className='gulf-r-ans'}
   else if(/^Clinical pearl:?$/i.test(t))p.className='gulf-r-pearl';else if(/^Trap:?$/i.test(t))p.className='gulf-r-trap';
   else if(/^[A-E]:$/.test(t))p.className='gulf-r-alt';else if(!b&&!p.className)p.className='gulf-r-why'});
  if(!right)return;a.dataset.right=right;
  [].slice.call(ol.children).forEach(function(li,i){var L='ABCDE'[i];li.dataset.letter=L;li.setAttribute('role','button');li.tabIndex=0;li.setAttribute('aria-label','Answer '+L+': '+li.textContent)});
  if(st.done[id]&&st.done[id].p)mark(a,st.done[id].p,true);
 }
 function paintStar(b){var on=!!st.stars[b.dataset.id];b.textContent=on?'★':'☆';b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',(on?'Remove star from ':'Star ')+b.dataset.id);b.title=on?'Starred':'Star for later'}
 function mark(a,L,quiet){
  if(a.dataset.picked)return;a.dataset.picked=L;var ok=L===a.dataset.right;
  [].slice.call(a.querySelectorAll('ol>li')).forEach(function(li){li.classList.toggle('gulf-right',li.dataset.letter===a.dataset.right);li.classList.toggle('gulf-wrong',li.dataset.letter===L&&!ok);li.setAttribute('aria-disabled','true')});
  var v=a.querySelector('.gulf-verdict');if(!v){v=document.createElement('div');v.setAttribute('role','status');a.querySelector('ol').after(v)}
  v.className='gulf-verdict '+(ok?'is-ok':'is-no');
  v.innerHTML='<span>'+(ok?'Correct. '+L+' is the safest choice.':'Not quite. You chose '+L+'; the answer is '+a.dataset.right+'. Read why below.')+'</span><button type="button" class="gulf-again">Try again</button>';
  var d=a.querySelector('details');if(d)d.open=true;
  if(!quiet){st.done[qid(a)]={p:L,ok:ok};save();score();if(window.GULF_LIB&&window.GULF_LIB.onChange)window.GULF_LIB.onChange()}
 }
 function unmark(a){delete a.dataset.picked;delete st.done[qid(a)];save();
  [].slice.call(a.querySelectorAll('ol>li')).forEach(function(li){li.classList.remove('gulf-right','gulf-wrong');li.removeAttribute('aria-disabled')});
  var v=a.querySelector('.gulf-verdict');if(v)v.remove();var d=a.querySelector('details');if(d)d.open=false;var f=a.querySelector('ol>li');if(f)f.focus();score()}
 function score(){if(!bar)return;var c=counts();
  bar.querySelector('.gulf-score').textContent=c.all?c.r+' of '+c.all+' correct':'Tap an answer to check yourself';
  bar.querySelector('[data-r="miss"]').textContent='Missed ('+c.miss+')';bar.querySelector('[data-r="star"]').textContent='Starred ('+c.star+')';
  bar.querySelector('.gulf-clear').hidden=!c.all&&!c.star;}
 function activeFilters(){var n=0,s=$('#search');if(s&&s.value.trim())n++;[].slice.call(document.querySelectorAll('.filters select')).forEach(function(x){if(x.selectedIndex>0)n++});return n}
 function rerender(){var s=$('#search');if(s)s.dispatchEvent(new Event('input',{bubbles:true}))}
 function setReview(r){review=r;idx=0;
  window.GULF_LIB_KEEP=r==='all'?null:function(rec){var id=String(rec.id);return r==='miss'?!!(st.done[id]&&st.done[id].ok===false):!!st.stars[id]};
  rerender();apply(true)}
 function build(){
  var it=$('#items');if(!it||bar)return;
  bar=document.createElement('div');bar.className='gulf-studybar';
  bar.innerHTML='<div class="gulf-seg" role="group" aria-label="View"><button type="button" data-v="one">One at a time</button><button type="button" data-v="list">List</button></div>'+
   '<div class="gulf-seg" role="group" aria-label="Show"><button type="button" data-r="all">All</button><button type="button" data-r="miss">Missed (0)</button><button type="button" data-r="star">Starred (0)</button></div>'+
   '<button type="button" class="gulf-ftoggle" aria-expanded="false">Filters</button><button type="button" class="gulf-slidebtn">▶ Slide view</button>'+
   '<div class="gulf-nav"><button type="button" data-step="-1" aria-label="Previous '+noun.toLowerCase()+'">← Previous</button><button type="button" data-step="1" aria-label="Next '+noun.toLowerCase()+'">Next →</button></div>'+
   '<div class="gulf-track" aria-hidden="true"><i></i></div>'+
   '<span class="gulf-pos" aria-live="polite"></span><span class="gulf-score"></span><span class="gulf-clearbox"><button type="button" class="gulf-clear" hidden>Clear my record</button></span>'+
   '<span class="gulf-libkeys"><kbd>A</kbd>–<kbd>E</kbd> answer · <kbd>←</kbd> <kbd>→</kbd> move · <kbd>S</kbd> star · <kbd>Space</kbd> reasoning</span>';
  bar.querySelectorAll('[data-v]').forEach(function(b){b.onclick=function(){mode=b.dataset.v;try{localStorage.setItem(KEY,mode)}catch(e){}apply(true)}});
  bar.querySelectorAll('[data-r]').forEach(function(b){b.onclick=function(){setReview(b.dataset.r)}});
  bar.querySelectorAll('[data-step]').forEach(function(b){b.onclick=function(){step(+b.dataset.step)}});
  bar.querySelector('.gulf-ftoggle').onclick=function(){filtersOpen=!filtersOpen;apply(false);if(filtersOpen){var s=$('#search');if(s)s.focus()}};
  bar.querySelector('.gulf-clearbox').addEventListener('click',function(e){var t=e.target;
   if(t.classList.contains('gulf-clear')){t.parentNode.innerHTML='<span>Clear answers and stars for '+esc(noun.toLowerCase())+'s in this exam?</span> <button type="button" data-yes>Clear</button> <button type="button" data-no>Keep</button>';return}
   if(t.hasAttribute('data-yes')){st={done:{},stars:{}};save();location.reload();return}
   if(t.hasAttribute('data-no')){t.parentNode.innerHTML='<button type="button" class="gulf-clear">Clear my record</button>';score()}});
  it.before(bar);
  it.addEventListener('click',function(e){var t=e.target;
   var sb=t.closest&&t.closest('.gulf-star');if(sb){var id=sb.dataset.id;if(st.stars[id])delete st.stars[id];else st.stars[id]=1;save();paintStar(sb);score();return}
   var ag=t.closest&&t.closest('.gulf-again');if(ag){unmark(ag.closest('article'));return}
   var li=t.closest&&t.closest('ol>li[data-letter]');if(!li)return;var a=li.closest('article');if(a)mark(a,li.dataset.letter)});
  it.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('ol>li[data-letter]')){e.preventDefault();mark(e.target.closest('article'),e.target.dataset.letter)}});
  var f=document.querySelector('.filters');if(f)f.addEventListener('input',function(){setTimeout(function(){apply(false)},0)});
 }
 function pageInfo(){var t=($('#position')||{}).textContent||'';var m=t.match(/(\d+)\s+of\s+(\d+)/);return m?[+m[1],+m[2]]:[1,1]}
 function apply(scroll){
  build();var cs=cards();cs.forEach(enhance);
  body.classList.toggle('gulf-one',mode==='one');body.classList.toggle('gulf-fclosed',mode==='one'&&!filtersOpen);
  if(!bar)return;bar.querySelectorAll('[data-v]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===mode))});
  bar.querySelectorAll('[data-r]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.r===review))});
  var nf=activeFilters(),ft=bar.querySelector('.gulf-ftoggle');ft.textContent=(filtersOpen?'Hide filters':'Filters')+(nf?' · '+nf+' on':'');ft.setAttribute('aria-expanded',String(filtersOpen||mode!=='one'));
  if(idx>=cs.length)idx=Math.max(0,cs.length-1);
  cs.forEach(function(a,i){a.classList.toggle('gulf-cur',i===idx)});
  var pi=pageInfo(),n=((pi[0]-1)*20)+idx+1,tm=(($('#count')||{}).textContent||'').match(/(\d+)\s+of/),total=tm?+tm[1]:cs.length;
  var lbl=review==='miss'?' missed':review==='star'?' starred':'';
  bar.querySelector('.gulf-pos').textContent=mode==='one'&&cs.length?noun+' '+n+' of '+total+lbl:(cs.length?'':review==='all'?'':'Nothing here yet');
  bar.querySelector('.gulf-track i').style.width=(total&&cs.length?Math.min(100,n/total*100):0).toFixed(2)+'%';
  var prev=bar.querySelector('[data-step="-1"]'),next=bar.querySelector('[data-step="1"]');
  prev.disabled=idx===0&&pi[0]===1;next.disabled=!cs.length||(idx===cs.length-1&&pi[0]===pi[1]);
  var empty=$('#items>p'),msg=review==='miss'?'No missed '+noun.toLowerCase()+'s. Answer some questions, and any you get wrong will collect here.':'No starred '+noun.toLowerCase()+'s yet. Tap ☆ on any '+noun.toLowerCase()+' to save it here.';if(empty&&!cs.length&&review!=='all'&&empty.textContent!==msg)empty.textContent=msg;
  score();if(window.GULF_LIB&&window.GULF_LIB.onChange)window.GULF_LIB.onChange();
  if(scroll&&mode==='one'&&!body.classList.contains('gulf-slide-on'))bar.scrollIntoView({block:'start',behavior:reduce?'auto':'smooth'});
 }
 function step(d){
  var cs=cards(),j=idx+d;
  if(j>=0&&j<cs.length){idx=j;apply(true);return}
  var b=$(d>0?'#next':'#previous');if(b&&!b.disabled){go=d>0?'first':'last';b.click()}
 }
 new MutationObserver(function(ms){if(ms.every(function(m){return bar&&bar.contains(m.target)||m.target.closest&&m.target.closest('article,.gulf-slide')}))return;var cs=cards();if(go&&cs.length){idx=go==='first'?0:cs.length-1;go=null;apply(true)}else if(!cs.length||!cs[idx]||!cs[idx].classList.contains('gulf-cur')){idx=0;apply(false)}else apply(false)}).observe(body,{childList:true,subtree:true});
 window.GULF_LIB={setReview:function(r){setReview(r)},review:function(){return review},counts:counts,cards:cards,qid:qid,index:function(){return idx},step:step,mark:mark,unmark:unmark,state:function(){return st},save:save,score:score,paintStar:paintStar,pageInfo:pageInfo,noun:noun,lib:lib,edition:ed,apply:apply,
  total:function(){var tm=(($('#count')||{}).textContent||'').match(/(\d+)\s+of/);return tm?+tm[1]:cards().length},
  go:function(i){var cs=cards();if(i>=0&&i<cs.length){idx=i;apply(false)}},
  onChange:null};
 addEventListener('keydown',function(e){
  if(body.classList.contains('gulf-slide-on'))return;
  if(mode!=='one'||e.ctrlKey||e.metaKey||e.altKey)return;var t=e.target;if(t&&/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName))return;if($('dialog[open]'))return;
  var a=cards()[idx],k=e.key.toLowerCase();
  if(e.key==='ArrowRight'){step(1);e.preventDefault()}else if(e.key==='ArrowLeft'){step(-1);e.preventDefault()}
  else if(a&&k==='s'){var sb=a.querySelector('.gulf-star');if(sb){sb.click();e.preventDefault()}}
  else if(a&&/^[a-e]$/.test(k)&&a.querySelector('li[data-letter="'+k.toUpperCase()+'"]')){mark(a,k.toUpperCase());e.preventDefault()}
  else if(e.key===' '&&!(t&&t.closest&&t.closest('button,summary,a,li[data-letter]'))){var d=a&&a.querySelector('details');if(d){d.open=!d.open;e.preventDefault()}}
 });
})();
