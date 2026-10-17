/* Serein.player enhancements: optional device APIs, audio and local voice. */
(function(S){
'use strict';
S.createPlayerTools=function(c){
 let wake=null,wakePending=false,audio=null,nodes=[],gain=null,lastPhase='',lastSecond=-1,countdown=0,countdownTimer=0;
 const $=c.$,state=c.state;
 function extras(){
  const voices=globalThis.speechSynthesis?.getVoices?.().filter(x=>x.localService&&/^en/i.test(x.lang)).sort((a,b)=>Number(/^en-GB/.test(b.lang))-Number(/^en-GB/.test(a.lang)))||[];
  return '<fieldset class="player-extra-options"><legend>Sound and device options</legend>'+(voices.length?'<label class="field-label" for="voice-choice">Local English voice</label><select id="voice-choice" class="field">'+voices.map(v=>'<option value="'+c.esc(v.voiceURI)+'" '+(c.store.preferences.voiceURI===v.voiceURI?'selected':'')+'>'+c.esc(v.name+' · '+v.lang)+'</option>').join('')+'</select><label class="field-label" for="voice-rate">Voice speed</label><input id="voice-rate" type="range" min="0.6" max="1.2" step="0.05" value="'+(c.store.preferences.voiceRate||.86)+'"><p class="small-note">Only installed local English voices appear. Voice is off until enabled for this session.</p>':'<p class="small-note">No local English voice is available. Text guidance remains available.</p>')+((globalThis.AudioContext||globalThis.webkitAudioContext)?'<label class="field-label" for="ambient-sound">Ambient sound · off by default</label><select class="field" id="ambient-sound"><option value="off">Off</option><option value="rain">Rain</option><option value="ocean">Ocean</option><option value="hum">Hum</option></select><label class="field-label" for="ambient-volume">Ambient volume</label><input id="ambient-volume" type="range" min="0" max="0.25" step="0.01" value="0.06">':'')+('wakeLock'in navigator?'<label class="check-label"><input id="keep-awake" type="checkbox">Keep the screen awake while playing</label>':'')+('vibrate'in navigator&&/Android/i.test(navigator.userAgent)?'<label class="check-label"><input id="phase-haptics" type="checkbox">Brief vibration on phase changes</label>':'')+'<button type="button" class="text-button" data-v5="shortcuts">Keyboard shortcuts</button></fieldset>';
 }
 async function releaseWake(){try{await wake?.release();}catch{}wake=null;}
 async function syncWake(){
  if(!navigator.wakeLock||!$('#keep-awake')?.checked||state.session?.state!=='playing'||document.visibilityState==='hidden'){await releaseWake();return;}
  if(wake||wakePending)return;wakePending=true;
  try{const acquired=await navigator.wakeLock.request('screen');if(!$('#player').open||!$('#keep-awake')?.checked||state.session?.state!=='playing'||document.visibilityState==='hidden'){await acquired.release();return;}wake=acquired;wake.addEventListener?.('release',()=>{if(wake===acquired)wake=null;});}catch{c.toast('Screen wake lock is unavailable right now.');}
  finally{wakePending=false;}
 }
 function stopAmbient(){for(const n of nodes){try{n.stop?.();n.disconnect?.();}catch{}}nodes=[];gain=null;}
 function ambient(){
  const type=$('#ambient-sound')?.value||'off';stopAmbient();if(type==='off'||state.session?.state!=='playing')return;
  try{
   const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(!C)return;audio=audio||new C();audio.resume().catch(()=>{});
   gain=audio.createGain();gain.gain.value=Number($('#ambient-volume')?.value||.06);gain.connect(audio.destination);
   if(type==='hum'){const osc=audio.createOscillator();osc.frequency.value=110;osc.type='sine';osc.connect(gain);osc.start();nodes.push(osc);}
   else{
    const buffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate),data=buffer.getChannelData(0);let previous=0;
    for(let i=0;i<data.length;i++){const white=Math.random()*2-1;previous=(previous+.02*white)/1.02;data[i]=type==='ocean'?previous*4:white*.4;}
    const source=audio.createBufferSource(),filter=audio.createBiquadFilter();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=type==='rain'?1700:550;source.connect(filter);filter.connect(gain);source.start();nodes.push(source,filter);
   }
  }catch{c.toast('Ambient audio is unavailable. Text guidance remains available.');}
 }
 function change(e){
  if(e.id==='ambient-sound')ambient();
  if(e.id==='ambient-volume'&&gain)gain.gain.setTargetAtTime(Number(e.value),audio.currentTime,.1);
  if(e.id==='keep-awake')syncWake();
  if(e.id==='voice-choice'||e.id==='voice-rate'){c.store.preferences[e.id==='voice-choice'?'voiceURI':'voiceRate']=e.id==='voice-choice'?e.value:Number(e.value);c.persist();}
 }
 function media(){
  if(!navigator.mediaSession||!globalThis.MediaMetadata||!state.session)return;
  const p=state.session.practice;try{navigator.mediaSession.metadata=new MediaMetadata({title:p.title,artist:'Serein · Healthcare Crown Academy',album:'Your optional pause',artwork:[{src:S.mediaURL(p.photo)}]});for(const [name,fn] of Object.entries({play:()=>{if(state.session?.state!=='playing')c.playPause()},pause:()=>{if(state.session?.state==='playing')c.pausePlayer()},stop:()=>c.exitPlayer()}))navigator.mediaSession.setActionHandler(name,fn);}catch{}
 }
 function tick(s){
  if(!s)return;
  const phase=state.session.practice.id+':'+s.index,second=Math.floor(s.elapsed);
  if(s.state==='playing'&&phase!==lastPhase){lastPhase=phase;if($('#phase-haptics')?.checked&&/Android/i.test(navigator.userAgent))try{navigator.vibrate(25);}catch{}}
  if(navigator.mediaSession)try{navigator.mediaSession.playbackState=s.state==='playing'?'playing':'paused';}catch{}
  if(second!==lastSecond){lastSecond=second;if(navigator.mediaSession){try{navigator.mediaSession.playbackState=s.state==='playing'?'playing':'paused';if(state.session.duration)navigator.mediaSession.setPositionState?.({duration:state.session.duration,playbackRate:1,position:Math.min(s.elapsed,state.session.duration)});}catch{}}}
  if(s.state!=='playing'){releaseWake();stopAmbient();}
 }
 function started(){syncWake();ambient();}
 function prepare(){lastPhase='';lastSecond=-1;media();}
 function cancelCountdown(){clearInterval(countdownTimer);countdownTimer=0;countdown=0;$('#quick-countdown')?.remove();}
 function quick(){
  cancelCountdown();const p=c.recommend();if(!p){c.finder();return;}
  c.openPractice(p.id,c.chooseDuration(p,c.store.preferences.time));
  if(c.reduced()){c.playPause();return;}
  countdown=3;const box=document.createElement('div');box.id='quick-countdown';box.className='quick-countdown';box.setAttribute('role','status');box.setAttribute('aria-live','polite');box.textContent='Beginning in '+countdown;$('#player').appendChild(box);
  countdownTimer=setInterval(()=>{if(!$('#player').open){cancelCountdown();return;}countdown--;if(countdown<=0){cancelCountdown();c.playPause();}else box.textContent='Beginning in '+countdown;},1000);
 }
 function stop(){cancelCountdown();releaseWake();stopAmbient();if(navigator.mediaSession)try{navigator.mediaSession.playbackState='none';navigator.mediaSession.metadata=null;for(const name of ['play','pause','stop'])navigator.mediaSession.setActionHandler(name,null);}catch{}}
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')syncWake();else releaseWake();});
 globalThis.speechSynthesis?.addEventListener?.('voiceschanged',()=>{if($('#player-settings').open&&$('#voice-choice')===null)c.refreshVoices?.();});
 return {extras,change,tick,prepare,started,stop,quick,cancelCountdown,get counting(){return countdown>0}};
};
})(globalThis.Serein=globalThis.Serein||{});
