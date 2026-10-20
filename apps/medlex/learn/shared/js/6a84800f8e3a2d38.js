
(function(){
 'use strict';
 const config={"examples": [{"label": "cardi/o · heart", "part": "cardi", "base": "ology", "word": "cardiology", "meaning": "The medical specialty concerned with the heart.", "explain": "The root <b>cardi-</b> points to the heart. Here, the combining form is <b>cardi/o</b>."}, {"label": "nephr/o · kidney", "part": "nephr", "base": "ology", "word": "nephrology", "meaning": "The medical specialty concerned with the kidneys.", "explain": "Change the root to <b>nephr-</b>, and the subject becomes the kidney. The ending still relates to a field of study."}], "position": "first"};
 const demo=document.getElementById('ml-demo');
 let current=0;
 function paint(index){
  current=index;const ex=config.examples[index];
  document.querySelectorAll('[data-ml-choice]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.mlChoice===index)));
  document.getElementById('ml-demoWord').innerHTML=config.position==='first'?'<mark>'+ex.part+'</mark>'+ex.base:ex.base+'<mark>'+ex.part+'</mark>';
  document.getElementById('ml-demoMeaning').textContent=ex.meaning;
  document.getElementById('ml-demoExplain').innerHTML=ex.explain;
 }
 document.querySelectorAll('[data-ml-choice]').forEach(b=>b.addEventListener('click',()=>paint(+b.dataset.mlChoice)));
 document.querySelectorAll('[data-ml-intro]').forEach(b=>b.addEventListener('click',()=>{const section=document.getElementById('ml-foundation');section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});section.focus({preventScroll:true});}));
 const play=document.getElementById('ml-listen');
 let utterance;
 play.addEventListener('click',()=>{
  if(!('speechSynthesis' in window)){document.getElementById('ml-audioStatus').textContent='Speech is unavailable in this browser.';return;}
  if(play.getAttribute('aria-pressed')==='true'){window.speechSynthesis.cancel();play.textContent='▶ Hear the connection';play.setAttribute('aria-pressed','false');return;}
  if(typeof stopTour==='function')stopTour();
  window.speechSynthesis.cancel();const ex=config.examples[current];
  utterance=new SpeechSynthesisUtterance(ex.word+'. '+ex.meaning);utterance.lang='en-GB';utterance.rate=.86;
  const voice=window.speechSynthesis.getVoices().find(v=>v.lang==='en-GB');if(voice)utterance.voice=voice;
  play.textContent='■ Stop audio';play.setAttribute('aria-pressed','true');
  function finished(){play.textContent='▶ Hear the connection';play.setAttribute('aria-pressed','false');}
  utterance.onend=finished;utterance.onerror=e=>{finished();if(!['interrupted','canceled'].includes(e.error))document.getElementById('ml-audioStatus').textContent='Voice unavailable. Try another installed English voice.';};window.speechSynthesis.speak(utterance);
 });
 for(const id of ['btnIntroHero','heroIntro']){const b=document.getElementById(id);if(b)b.addEventListener('click',()=>{const details=document.getElementById('ml-deep');if(details)details.open=true;},true);}

 window.addEventListener('pagehide',()=>{if('speechSynthesis' in window)window.speechSynthesis.cancel();});
 paint(0);
})();
