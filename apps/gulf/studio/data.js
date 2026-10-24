/* Adapt shared SNLE content to the chosen Gulf edition: neutral wording for Saudi-specific terms. Runs after data, before app. */
(function(){
 var ed=window.GULF_EDITION;if(!ed)return;
 var rules=[[/the Kingdom of Saudi Arabia/gi,'your country'],[/Kingdom of Saudi Arabia/gi,'your country'],[/\bin Saudi Arabia\b/g,'in your country'],[/Saudi Arabia/g,'your country'],[/\bKSA\b/g,'your country'],[/Mumaris\+?/g,'the licensing portal'],[/\bSaudi\b/g,'local'],[/\bSCFHS\b/g,'regulator'],[/\bSNLE\b/g,'licensing exam']];
 function fix(s){for(var i=0;i<rules.length;i++)s=s.replace(rules[i][0],rules[i][1]);return s}
 function walk(o,d){if(d>12||o==null)return;if(Array.isArray(o)){for(var i=0;i<o.length;i++){var v=o[i];if(typeof v==='string')o[i]=fix(v);else walk(v,d+1)}return}
  if(typeof o==='object'){for(var k in o){if(!Object.prototype.hasOwnProperty.call(o,k))continue;var v=o[k];if(typeof v==='string'){if(k!=='id'&&k!=='key'&&k!=='toolId'&&k!=='tool'&&!/^(?:image|img|src|url|href|poster)/i.test(k))o[k]=fix(v)}else walk(v,d+1)}}}
 ['SNLE_POSTERS','SNLE_QUESTIONS','SNLE_LEARNING'].forEach(function(n){try{walk(window[n],0)}catch(e){}});
 var held;try{Object.defineProperty(window,'SNLE_DOSSIERS',{configurable:true,get:function(){return held},set:function(v){try{walk(v,0)}catch(e){}held=v}})}catch(e){}
 window.GULF_FIX=fix;
 // Edition-aware guide, domain weights and mock lengths (the shared SNLE originals describe the Saudi exam).
 var CFG=window.GULF_CONFIG||{},E=(CFG.editions||{})[ed];
 if(E){
  function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var ds=E.domains||[],ok=ds.length===4&&ds.every(function(d){return typeof d.count==='number'});
  function wt(i){return ok?ds[i].count+' of '+E.questions+' questions':'Weight not published'}
  window.GULF_WEIGHTS={f:wt(0),a:wt(1),m:wt(2),l:wt(3)};
  window.GULF_MOCKS=[20,50,100,E.questions];
  var KEYS=['Nursing Fundamentals','Adult Nursing','Maternal-Child Nursing','Nursing Management and Leadership'];
  if(ok){window.GULF_RATIOS=KEYS.map(function(k,i){return[k,ds[i].count/E.questions]});
   window.GULF_BP_EYEBROW='BLUEPRINT · '+ds.map(function(d){return d.count}).join(' / ')+' OF '+E.questions;
   window.GULF_BP_TEXT=ds[0].count+' Nursing Fundamentals · '+ds[1].count+' Adult Nursing · '+ds[2].count+' Maternal–Child Nursing · '+ds[3].count+' Management and Leadership.'}
  else{var Qs=window.SNLE_QUESTIONS||[],cnt=KEYS.map(function(k){return Qs.filter(function(q){return q.domain===k}).length}),tot=cnt.reduce(function(a,b){return a+b},0)||1;
   window.GULF_RATIOS=KEYS.map(function(k,i){return[k,cnt[i]/tot]});
   window.GULF_BP_EYEBROW='PRACTICE SET · WEIGHTS NOT PUBLISHED';
   window.GULF_BP_TEXT='The regulator has not published domain weights, so practice sets follow this studio\u2019s own question mix across all four domains.'}
  window.GULF_GUIDE=function(){
   var card=function(k,v,n){return '<div class="gulf-guide-card"><small>'+esc(k)+'</small><strong>'+esc(v)+'</strong>'+(n?'<span>'+esc(n)+'</span>':'')+'</div>'};
   var rows=ds.map(function(d){return '<tr><td>'+esc(d.label)+'</td><td>'+(typeof d.count==='number'?esc(d.count+' of '+E.questions+' questions'):'Not published')+'</td></tr>'}).join('');
   var src=(E.sources||[]).map(function(x){return '<li><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.label)+' ↗</a></li>'}).join('');
   return '<div class="page-content guide-page gulf-guide"><section class="page-hero"><div><span class="eyebrow">'+esc(E.regulator.toUpperCase())+'</span><h1>'+esc(E.short)+' Guide</h1><p>What the regulator publishes about this exam, and how to use this studio to prepare for it.</p></div></section>'+
    '<div class="gulf-guide-alert"><b>Confirm with your regulator before you book.</b> Details below come from regulator publications read on 23 October 2026. Anything not published is marked as such.</div>'+
    '<h2>At a glance</h2><div class="gulf-guide-grid">'+card('Questions',E.questions+' MCQs','Single best answer')+card('Time',(E.minutes/60)+' hours',E.notes.timing||(E.short==='DHA RN'?'Includes registration and introduction':''))+card('Pass standard',E.pass)+card('Retakes','See note below')+'</div>'+
    '<p>'+esc(E.formatNote)+'</p><p><b>Retakes.</b> '+esc(E.notes.retake)+'</p>'+
    '<h2>Blueprint</h2><table class="gulf-guide-table"><thead><tr><th>Domain</th><th>Published weight</th></tr></thead><tbody>'+rows+'</tbody></table>'+(ok?'':'<p>'+esc(E.warning)+'</p>')+
    '<h2>How to use this studio</h2><ul><li>Start with <b>React &amp; Interact</b> and <b>Interactive Labs</b> to learn how questions hide the decision.</li><li>Use the <b>Practice Hub</b> for timed sets and the <b>Clinical Dossier</b> for case practice.</li><li>Use <b>My Progress</b> to see what to repeat. Each exam keeps its own record.</li></ul>'+
    '<h2>Official sources</h2><ul>'+src+'</ul><p class="gulf-guide-note">'+esc(CFG.policy)+'</p></div>';
  };
 }

})();
