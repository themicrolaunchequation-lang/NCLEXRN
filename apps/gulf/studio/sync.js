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
