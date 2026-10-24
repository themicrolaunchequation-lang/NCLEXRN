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
})();
