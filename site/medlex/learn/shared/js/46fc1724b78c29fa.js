
(function(){
 'use strict';
 const key='medlex-display-mode-v1';
 const media=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
 const buttons=document.querySelectorAll('[data-ml-theme]');
 let explicit=false;
 function read(){let saved;try{saved=localStorage.getItem(key)}catch(e){}explicit=saved==='light'||saved==='dark';return explicit?saved:(media&&media.matches?'dark':'light');}
 function apply(mode,persist){
  mode=mode==='dark'?'dark':'light';
  document.documentElement.setAttribute('data-theme',mode);
  buttons.forEach(b=>{const active=b.dataset.mlTheme===mode;b.setAttribute('aria-pressed',String(active));b.title=(b.dataset.mlTheme==='dark'?'Night':'Day')+(active?' mode selected':' mode');});
  if(persist){explicit=true;try{localStorage.setItem(key,mode)}catch(e){}}
 }
 buttons.forEach(b=>b.addEventListener('click',()=>apply(b.dataset.mlTheme,true)));
 function onSystemChange(){if(!explicit)apply(media&&media.matches?'dark':'light',false);}
 if(media){if(media.addEventListener)media.addEventListener('change',onSystemChange);else if(media.addListener)media.addListener(onSystemChange);}
 window.addEventListener('storage',e=>{if(e.key===key||e.key===null)apply(read(),false);});
 window.addEventListener('pageshow',()=>apply(read(),false));
 apply(read(),false);
})();
