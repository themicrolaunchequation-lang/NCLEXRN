/* Gulf edition bootstrap: choose edition, namespace storage per edition, set colour palette. Runs before data and app. */
(function(){
 var KEY='gulf-edition',ids=['qatar','dubai','abudhabi'],ed=null;
 try{var q=new URLSearchParams(location.search).get('edition');if(ids.indexOf(q)>-1){localStorage.setItem(KEY,q);history.replaceState(null,'',location.pathname+location.hash)}}catch(e){}
 try{var s=localStorage.getItem(KEY);if(ids.indexOf(s)>-1)ed=s}catch(e){}
 window.GULF_EDITION=ed;
 if(!ed)return;
 document.documentElement.setAttribute('data-edition',ed);
 var P='snle-'+ed+'.',S=window.SNLEStorage;
 if(S){var g=S.getItem,s=S.setItem,r=S.removeItem;S.getItem=function(k){return g(P+k)};S.setItem=function(k,v){return s(P+k,v)};S.removeItem=function(k){return r(P+k)}}
})();
