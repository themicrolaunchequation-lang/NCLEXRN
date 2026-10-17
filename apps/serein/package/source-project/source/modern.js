/* Serein.views / router / ui: calm task-first navigation and local-only workflows. */
(function(S){
'use strict';
S.createModern=function(c){
 const {$,$$,esc,icon,state}=c,A=c.A,D=c.D;
 let route={view:'today',tab:'',params:new URLSearchParams()},lastHash='',onboardStep=0,searchTimer=0,journalTimer=0,activityTimer=0,lockRequest=0,pendingImport=null,importPass='',lastDeep='',lastPlay='',completionShown=false;
 const store=()=>c.store;
 const titles={today:'Today',library:'Library',toolkit:'Toolkit',infographics:'Infographics',me:'Me',support:'Support'};
 const studioNames={boundary:'Say no kindly',support:'Ask for help',transition:'Leave work at work',difficult:'After a hard moment',team:'Run a team pause',conditions:'Fix a work barrier'};
 const nav=[['today','Today','today'],['library/practices','Library','book'],['toolkit','Toolkit','studios'],['infographics','Infographics','infographics'],['me/saved','Me','space'],['support','Support','support']];
 const roles=['Healthcare worker','Nurse','Doctor','Physician','Allied health professional','Pharmacist','Healthcare support worker','Student','Team leader'];
 const field=(name,label,value,options)=>'<label class="field-label" for="'+name+'">'+label+'</label><select class="field" id="'+name+'" name="'+name+'">'+options.map(x=>{const v=Array.isArray(x)?x[0]:x,l=Array.isArray(x)?x[1]:x;return '<option value="'+esc(v)+'" '+(String(value)===String(v)?'selected':'')+'>'+esc(l)+'</option>';}).join('')+'</select>';
 const check=(name,label,value,note='')=>'<label class="setting-row"><span>'+label+(note?'<small>'+note+'</small>':'')+'</span><input type="checkbox" id="'+name+'" name="'+name+'" '+(value?'checked':'')+'></label>';
 const head=(eye,title,desc='')=>'<header class="page-header"><p class="eyebrow">'+eye+'</p><h1>'+title+'</h1>'+(desc?'<p class="page-sub">'+desc+'</p>':'')+'</header>';
 const empty=(title,text,action)=>'<section class="empty"><svg viewBox="0 0 100 64" aria-hidden="true"><path d="M12 51h76M24 47c-8-24 6-31 18-16 8-26 28-20 20 7 19-13 28 4 12 9"/><circle cx="77" cy="15" r="7"/></svg><h2>'+title+'</h2><p>'+text+'</p>'+action+'</section>';
 function templ(html){html=S.mediaHTML?S.mediaHTML(html):html;const t=document.createElement('template');t.innerHTML=html;return t.content;}
 function bodyOf(html,remove){const t=templ(html);for(const s of remove)t.querySelector(s)?.remove();return [...t.childNodes].map(n=>n.outerHTML||n.textContent).join('');}
 function sensitive(){return !vault.locked;}
 function privateClear(){pendingImport=null;importPass='';state.journalQuery='';state.draft='';const draft=$('#journal-draft');if(draft)draft.value='';c.closeModal();c.closeSearch();$('#modal-content').replaceChildren();c.clearUndo();document.body.classList.remove('privacy-shield');}
 const vault=S.createVault({get:store,getDraft:()=>state.draft,setDraft:text=>{state.draft=text;const e=$('#journal-draft');if(e)e.value=text;},normalise:c.normalise,notice:c.toast,storageBlocked:()=>!!c.recovery(),changed:()=>{document.body.classList.remove('privacy-shield');if(!vault.locked)c.draftStorageStatus(true);render();resetActivity();if(document.visibilityState==='hidden'&&vault.enabled&&!vault.locked&&store().vault.lockOnHide!==false)requestLock();},clearPrivateUI:privateClear});
 if(vault.enabled){for(const name of ['journals','checkins','contacts'])store()[name]=[];state.draft='';try{sessionStorage.removeItem('serein-journal-draft');}catch{}}
 const player=S.createPlayerTools({$,state,esc,get store(){return store()},refreshVoices:()=>{if($('#player-extra-options'))$('#player-extra-options').innerHTML=player.extras();},persist:()=>vault.persist(),toast:c.toast,recommend:c.recommend,chooseDuration:c.chooseDuration,reduced:c.reduced,openPractice:c.openPractice,playPause:c.playPause,pausePlayer:c.pausePlayer,exitPlayer:c.exitPlayer,finder:()=>c.advance.finderOpen()});
 const gallery=S.createInfographics({esc,icon,route:()=>route,navigate:go,openModal:c.openModal,reduced:c.reduced});
 /** Parse canonical routes and legacy aliases without losing browser history. */
 function parse(hash){
  const raw=String(hash||'today').replace(/^#\/?/,'').split('?'),parts=raw[0].split('/').filter(Boolean),params=new URLSearchParams(raw.slice(1).join('?'));
  const aliases={practices:'library/practices',journeys:'library/journeys',studios:'toolkit',reflect:'me/journal',space:'me/saved',settings:'me/settings','quick-start':'today'};
  const path=aliases[parts[0]]||parts.join('/')||'today',p=path.split('/');
  const view=titles[p[0]]?p[0]:'today';
  let tab=p[1]||(view==='library'?'practices':view==='me'?'saved':'');
  if(view==='library'&&!['practices','guides','journeys'].includes(tab))tab='practices';
  if(view==='me'){if(tab==='checkins'||tab==='patterns')tab='insights';if(tab==='reflections')tab='journal';if(!['journal','saved','routine','insights','settings','data'].includes(tab))tab='saved';}
  if(view==='toolkit'&&tab&&!A.studios.some(s=>s.id===tab))tab='';
  if(view==='infographics'&&tab&&!S.infographicCards.some(x=>x.id===tab))tab='';
  if(!['library','toolkit','infographics','me'].includes(view))tab='';
  const canonical=view+(tab?'/'+tab:'')+(params.size?'?'+params.toString():'');
  return {view,tab,params,canonical,quick:parts[0]==='quick-start'};
 }
 function legacyPath(path){
  if(path==='space')return 'me/'+({patterns:'insights',reflections:'journal'}[state.spaceTab]||state.spaceTab||'saved');
  if(path==='practices')return 'library/'+(state.tab==='guides'?'guides':'practices');
  return ({studios:'toolkit',journeys:'library/journeys',reflect:'me/journal',settings:'me/settings'})[path]||path;
 }
 function setRoute(next){
  route=next;state.view=route.view;state.tab=route.view==='library'?route.tab:state.tab;
  state.spaceTab=route.view==='me'?({journal:'reflections',insights:'patterns'}[route.tab]||route.tab):state.spaceTab;
  if(route.view==='library'&&route.tab==='practices'){
   const p=route.params;if(p.has('time'))state.budget=p.get('time')==='self'?'self':[0,60,120,300].includes(+p.get('time'))?+p.get('time'):120;
   if(p.has('style')&&['any','breath','nonbreath','ground'].includes(p.get('style')))state.style=p.get('style');
   if(p.has('setting')&&['any','seated','still'].includes(p.get('setting')))state.position=p.get('setting');
   if(p.has('q'))state.query=p.get('q').slice(0,120);
  }
 }
 function setHistory(hash,replace){try{history[replace?'replaceState':'pushState'](null,'',hash);}catch{if(location.hash!==hash)location.hash=hash;}}
 function cancelSearch(){clearTimeout(searchTimer);clearTimeout(journalTimer);searchTimer=journalTimer=0;}
 function go(path,{replace=false,focus=true,scroll=true}={}){
  c.captureDraft();cancelSearch();const next=parse(legacyPath(path));lastDeep='';
  c.closeModal();c.closeSearch();setRoute(next);lastHash='#'+next.canonical;
  if(location.hash!==lastHash)setHistory(lastHash,replace);if(document.startViewTransition&&!c.reduced())document.startViewTransition(()=>render({focus}));else{render({focus});$('#main').classList.remove('page-enter');void $('#main').offsetWidth;$('#main').classList.add('page-enter');}
  if(scroll)window.scrollTo({top:0,behavior:'instant'});openDeep(next);
 }
 function readRoute(){
  if(location.hash===lastHash)return;
  c.captureDraft();cancelSearch();c.closeModal();setRoute(parse(location.hash));lastHash='#'+route.canonical;
  if(location.hash!==lastHash)setHistory(lastHash,true);render({focus:true});openDeep(route);
 }
 function openDeep(r){
  const key=r.canonical;if(key===lastDeep)return;lastDeep=key;
  if(r.view==='toolkit'&&r.tab){
   const p=r.params.get('practice');
   if(r.tab==='team'&&D.practices.some(x=>x.id===p)){
    c.openPractice(p,c.chooseDuration(D.practices.find(x=>x.id===p),Number(r.params.get('duration'))||120));
    state.session.noHolds=true;state.session.external=r.params.get('external')==='1';state.visual='text';state.present=true;
    $('#session-external').checked=state.session.external;if($('#session-noholds'))$('#session-noholds').checked=true;
    $('#session-motion').checked=true;$('#session-voice').checked=false;$('#session-chime').checked=false;$('#session-visual').value='text';$('#player').classList.add('present');$('#present-button').setAttribute('aria-pressed','true');c.updatePlayer(true);c.syncPlayerMotion();
   }else c.advance.openStudio(r.tab);
  }
  if(r.view==='library'&&r.tab==='journeys'&&A.journeys.some(x=>x.id===r.params.get('journey')))c.advance.openJourney(r.params.get('journey'));
  if(r.quick)player.quick();
 }
 function rememberMoment(value){state.moment=value;try{sessionStorage.setItem('serein-moment-override',String(value));}catch{}}
 function autoMoment(){
  try{const saved=sessionStorage.getItem('serein-moment-override');if(saved!==null&&[0,1,2,3].includes(+saved)){state.moment=+saved;return;}}catch{}
  let pattern=store().preferences.shift||'prefer';if(pattern==='rotating')try{pattern=sessionStorage.getItem('serein-rotation')||'days';}catch{pattern='days';}
  if(pattern==='prefer'){state.moment=1;return;}
  const h=(new Date().getHours()+(pattern==='nights'?12:0))%24;state.moment=h>=6&&h<9?0:h>=9&&h<17?1:3;
 }
 function navHTML(mobile=false){
  const items=mobile?[nav[0],nav[1],['quick','Quick pause','play'],nav[4],nav[5]]:nav;
  return items.map(([path,label,img])=>'<button '+(path==='quick'?'data-v5="quick" class="quick-nav"':'data-nav="'+path+'" class="'+(route.view===path.split('/')[0]?'active':'')+'" '+(route.view===path.split('/')[0]?'aria-current="page"':''))+'>'+icon(img)+'<span>'+label+'</span></button>').join('');
 }
 function applyTheme(){
  const p=store().preferences,dark=p.theme==='night'||p.theme==='dark'||p.theme==='auto'&&window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  document.body.dataset.theme=p.theme==='contrast'?'contrast':dark?'night':'light';document.body.dataset.reading=p.readingSize||'standard';
  document.body.classList.toggle('comfortable-reading',!!p.readingWidth);document.body.classList.toggle('focus-mode',!!p.focus);document.body.classList.toggle('reduce-motion',c.reduced());
  $('meta[name="theme-color"]')?.setAttribute('content',dark?'#10253A':'#F8F5EF');
 }
 function recommendedHTML(){
  const p=c.recommend();if(!p)return empty('Your choices come first.','No practice matches your suggestion choices. You can adjust them in Settings.','<button class="button button-teal" data-nav="me/settings">Review practice choices</button>');
  const n=c.chooseDuration(p,typeof state.homeTime==='number'?state.homeTime:store().preferences.time);
  return '<section class="pause-card"><div class="pause-image"><img src="'+p.photo+'" alt="'+esc(p.cardAlt||'Illustrative scene for '+p.title)+'" width="800" height="500" fetchpriority="high"><span class="illustrative" title="Illustrative, AI-generated image">ⓘ</span></div><div class="pause-copy"><p class="eyebrow">YOUR PAUSE FOR RIGHT NOW</p><h2>'+esc(p.title)+'</h2><p>'+esc(c.advance.reason(p,state.homeTime||store().preferences.time,state.moment))+'</p><div class="card-meta">'+c.durationLabel(n)+' · '+esc(p.position)+' · '+(p.breathFocus?'Breath focus':'Without breath focus')+'</div><div class="button-row"><button class="button button-teal" data-practice="'+p.id+'" data-duration="'+(n||'')+'">Start my pause '+icon('play')+'</button><button class="text-button" data-adv="finder">Something else</button></div><details class="time-choice"><summary>Change time</summary><div class="time-chips">'+[[60,'1 min'],[120,'2 min'],[300,'5 min'],['self','My pace']].map(([v,l])=>'<button data-v5="home-time" data-value="'+v+'" aria-pressed="'+(String(v)===String(state.homeTime||store().preferences.time))+'">'+l+'</button>').join('')+'</div></details></div></section>';
 }
 function today(){
  const hour=new Date().getHours(),g=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  const j=A.journeys.find(j=>{const n=(store().journeyProgress[j.id]||[]).length;return n>0&&n<j.steps.length});
  const continuation=j?'<button class="continue-card" data-adv="journey" data-id="'+j.id+'"><span><small>CONTINUE AT YOUR PACE</small><strong>'+esc(j.title)+'</strong></span>'+icon('arrow')+'</button>':store().routine.length?'<button class="continue-card" data-nav="me/routine"><span><small>YOUR CHOSEN SEQUENCE</small><strong>Return to my routine</strong></span>'+icon('arrow')+'</button>':store().savedPlans.length?'<button class="continue-card" data-nav="toolkit"><span><small>YOUR SAVED PLANS</small><strong>Return to a practical next step</strong></span>'+icon('arrow')+'</button>':'';
  return '<div class="today-greeting"><h1 class="today-greeting-title">'+g+'. <strong>Make room for you.</strong></h1><time>'+new Date().toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})+'</time></div><div id="today-recommendation">'+recommendedHTML()+'</div><section class="moment-section"><h2 class="small-heading">What moment are you in?</h2><div class="moment-chips" role="group" aria-label="Your working moment">'+['Before shift','Between tasks','After a difficult moment','After shift'].map((l,i)=>'<button data-moment="'+i+'" aria-pressed="'+(state.moment===i)+'">'+l+'</button>').join('')+'</div>'+(store().preferences.shift==='rotating'?'<div class="rotation-choice"><span>This week:</span><button data-v5="rotation" data-value="days">Days</button><button data-v5="rotation" data-value="nights">Nights</button></div>':'')+'</section><section class="quick-checkin"><div><h2 class="small-heading">A quick check-in</h2><p class="small-note">Optional. One tap keeps it for this visit.</p></div>'+c.moodButtons()+'<div id="quick-checkin-actions" role="status"></div></section>'+continuation+'<div id="today-reflection">'+c.quote()+'</div><div class="compact-links"><button data-nav="library/guides">Guides for real working days →</button><button data-nav="toolkit">Toolkit →</button></div>';
 }
 function filterCount(){return Number(state.budget!==0)+Number(state.style!=='any')+Number(state.position!=='any')+Number(state.category!=='All');}
 function filtersHTML(){return '<div id="filter-controls">'+c.filterOptions()+'</div>';}
 function activeFilters(){
  const out=[];if(state.budget!==0)out.push(['time',state.budget==='self'?'Self-paced':c.durationLabel(Number(state.budget))]);if(state.style!=='any')out.push(['style',({nonbreath:'Without breath focus',breath:'Breathing',ground:'Grounding'})[state.style]]);if(state.position!=='any')out.push(['setting',state.position==='still'?'No movement':'Seated']);if(state.category!=='All')out.push(['category',state.category]);
  return '<div class="active-filters" aria-label="Active filters">'+out.map(([k,l])=>'<button data-v5="clear-filter" data-value="'+k+'" aria-label="Remove '+esc(l)+' filter">'+esc(l)+' ×</button>').join('')+(out.length?'<button class="text-button" data-action="reset-filters">Clear all</button>':'')+'</div>';
 }
 function library(){
  const tabs='<div class="library-heading">'+head('YOUR LIBRARY','Find what fits.','Practices, useful guides and learning at your pace.')+'<button class="button button-outline" data-nav="toolkit">'+icon('studios')+' Toolkit</button></div><div class="segmented" role="group" aria-label="Library content">'+['practices','guides','journeys'].map(t=>'<button data-nav="library/'+t+'" aria-pressed="'+(route.tab===t)+'">'+({practices:'Practices',guides:'Guides',journeys:'Journeys'})[t]+'</button>').join('')+'</div>';
  if(route.tab==='journeys')return tabs+bodyOf(c.advance.journeysView(),['.page-header']);
  if(route.tab==='guides')return tabs+'<label class="search-input full-search">'+icon('search')+'<span class="sr-only">Search guides</span><input id="guide-query" type="search" value="'+esc(state.guideQuery)+'" placeholder="Boundaries, support, rest…"></label><div class="category-row" role="group" aria-label="Guide categories">'+['All','Practitioner care','Mindfulness','Shared practice','Clinical practice','Saved'].map(t=>'<button data-guide-category="'+t+'" aria-pressed="'+(state.guideCategory===t)+'">'+t+'</button>').join('')+'</div><div id="guide-results">'+c.guidesResults()+'</div>';
  return tabs+'<div class="library-actions"><button class="button button-outline filters-launch" data-v5="filters">'+icon('sliders')+' Filters · '+filterCount()+' active</button><button class="text-button" data-action="routine-builder">Build a routine</button></div><div id="desktop-filters">'+filtersHTML()+'</div>'+activeFilters()+'<div class="category-row" role="group" aria-label="Practice categories">'+['All','Breathing','Grounding','Movement','Awareness','Visualization','Saved'].map(t=>'<button data-category="'+t+'" aria-pressed="'+(state.category===t)+'">'+(t==='Visualization'?'Visualisation':t)+'</button>').join('')+'</div><div id="practice-results">'+c.practiceResults()+'</div><p class="small-note">Preference matches, not health recommendations. You can adapt, skip, pause or stop.</p>';
 }
 function legacySpace(tab){state.spaceTab=tab;return bodyOf(c.spaceView(),['.page-header','.segmented']);}
 function lockedBox(){return '<section class="panel locked-panel">'+icon('shield')+'<h2>Your private records are locked.</h2><p>Unlock to open your journal, check-ins and support contacts. Practices and the rest of Serein remain available.</p><button class="button button-teal" data-v5="unlock">Unlock private records</button><button class="text-button" data-v5="encrypted-export">Download encrypted archive</button></section>';}
 function journal(){
  if(vault.locked)return lockedBox();
  const t=templ(c.reflectView()),form=t.querySelector('#journal-form');form.querySelectorAll('.ico-inline').forEach(x=>x.remove());savingLabels(form);
  return form.outerHTML+'<section class="panel journal-history"><div class="section-heading"><h2>Your reflections</h2><label class="search-input">'+icon('search')+'<span class="sr-only">Search your reflections</span><input type="search" id="journal-query" value="'+esc(state.journalQuery||'')+'" placeholder="Find your own words…"></label></div><div id="journal-history">'+journalHistory()+'</div></section>';
 }
 function journalHistory(){const list=store().journals.filter(x=>x.text.toLowerCase().includes((state.journalQuery||'').toLowerCase()));return c.entriesHTML(list,'journal');}
 function privacyControls(){return '<section class="panel"><h2>Journal lock</h2><p>Optional encryption covers saved journals, check-ins and support contacts. Preferences, feedback and saved plans remain unencrypted.</p>'+(!vault.available?'<p class="notice">Web Crypto is unavailable in this browser. Encryption is hidden; the app remains usable with its normal storage choices.</p>':vault.enabled?'<p>'+icon('shield')+' Lock enabled · '+(vault.locked?'locked':'unlocked')+'</p><div class="button-row"><button class="button button-outline" data-v5="'+(vault.locked?'unlock':'lock')+'">'+(vault.locked?'Unlock':'Lock now')+'</button><button class="text-button" data-v5="remove-lock">Remove lock</button></div>'+field('lock-after','Lock after inactivity',store().vault.lockAfter||5,[[1,'1 minute'],[5,'5 minutes'],[15,'15 minutes'],[30,'30 minutes']])+check('lock-on-hide','Lock when this tab is hidden',store().vault.lockOnHide!==false):'<button class="button button-outline" data-v5="setup-lock">Set up a journal lock</button>')+'<p class="small-note">If you forget the passcode, locked entries cannot be recovered.</p></section>';}
 function settingsHTML(){
  const p=store().preferences,roleOptions=roles.includes(p.role)?roles:[p.role,...roles];
  return '<form id="settings-form"><section class="panel"><h2>Comfort</h2>'+field('pref-reading','Text size',p.readingSize,[['standard','Standard'],['large','Large'],['extra','Extra large']])+field('pref-theme','Appearance',p.theme,[['auto','Auto · follows your device'],['light','HCA ivory'],['night','HCA navy night'],['contrast','High contrast']])+check('pref-width','Comfortable reading width',p.readingWidth)+check('pref-focus','Low-distraction layout',p.focus)+check('pref-motion','Less motion',p.motion,'Your device’s reduced-motion preference is also respected.')+check('pref-3d','3D breathing visual',p.visual3d,'A still alternative and text remain available.')+check('pref-quotes','Show original reflections',!p.hideQuotes,'Secular Serein words, without streaks or pressure.')+'</section><section class="panel"><h2>Practice defaults</h2>'+field('pref-role','Your role',p.role,roleOptions)+field('pref-time','Usual pause length',p.time,[[60,'1 minute'],[120,'2 minutes'],[300,'5 minutes']])+field('pref-style','Focus preference',p.style,[['any','Open to different practices'],['nonbreath','Without breath focus'],['ground','Grounding only']])+field('pref-shift','Shift pattern',p.shift,[['days','Days'],['nights','Nights'],['rotating','Rotating'],['prefer','Prefer not to say']])+'<p class="small-note">Changes apply immediately. A selected role does not certify suitability.</p></section>'+privacyControls()+'</form><section class="panel"><h2>Reminders & app</h2>'+c.advance.appHTML()+'</section><section class="panel"><h2>Privacy & data</h2><div class="button-row"><button class="button button-outline" data-nav="me/data">Export, import & clear</button><button class="text-button" data-action="privacy">Privacy details</button><button class="text-button" data-v5="scope">About images, evidence & safety</button><button class="text-button" data-v5="onboarding">Reopen welcome guide</button></div></section>'+c.advance.preferencesHTML();
 }
 function me(){
  const tabs=[['journal','Journal'],['saved','Saved'],['routine','Routine'],['insights','Insights'],['settings','Settings'],['data','Data & privacy']];
  let body=route.tab==='journal'?journal():route.tab==='settings'?settingsHTML():route.tab==='insights'?(vault.locked?lockedBox():field('date-filter','Look back over',state.dateFilter,[['7','Last 7 days'],['30','Last 30 days'],['90','Last 90 days'],['all','All entries']])+S.insights.render({store:store(),state,esc,entriesHTML:c.entriesHTML})):route.tab==='data'?(c.recovery()?'<section class="panel"><h2>Recover your saved archive</h2><p>The existing browser archive could not be read. It has been kept unchanged. Download a recovery copy before clearing or importing data. New changes stay in memory until this is resolved.</p><button class="button button-teal" data-v5="recovery-export">Download original stored data</button></section>':'')+c.dataHTML()+privacyControls():legacySpace(route.tab==='routine'?'routine':'saved');
  return head('YOUR SPACE / YOUR CHOICE','A little room for you.','Keep what is useful. Return whenever you choose.')+'<div class="me-tabs" role="group" aria-label="Your space">'+tabs.map(([key,label])=>'<button data-nav="me/'+key+'" aria-pressed="'+(route.tab===key)+'">'+label+'</button>').join('')+'</div>'+body;
 }
 function helpHTML(){
  return '<section class="help-now"><p class="eyebrow">GET HELP NOW / UNITED KINGDOM</p><h2>Human support is close.</h2><p>If you or someone else is in immediate danger, call 999. Serein is not monitored and cannot provide urgent care.</p><div class="help-grid"><a href="tel:999"><strong>999</strong><span>Emergency services</span></a><a href="tel:111"><strong>NHS 111</strong><span>Urgent medical advice</span></a><a href="tel:116123"><strong>Samaritans · 116 123</strong><span>Free listening support, day or night</span></a><a href="sms:85258?body=SHOUT"><strong>Text SHOUT to 85258</strong><span>Shout · free UK text support, 24/7</span></a></div><p class="small-note">These routes are for the UK. Elsewhere, use the appropriate local emergency or support service. Calls and texts use your phone app.</p><details><summary>Service information & sources</summary><a class="source-link" href="https://www.nhs.uk/nhs-services/mental-health-services/where-to-get-urgent-help-for-mental-health/" target="_blank" rel="noopener noreferrer">NHS urgent support ↗</a><a class="source-link" href="https://www.samaritans.org/how-we-can-help/contact-samaritan/talk-us-phone/" target="_blank" rel="noopener noreferrer">Samaritans service information ↗</a><a class="source-link" href="https://giveusashout.org/get-help/" target="_blank" rel="noopener noreferrer">Shout service information ↗</a><p class="small-note">Source check: 16 October 2026. Availability and service arrangements can change.</p></details></section>';
 }
 function contactsHTML(){if(vault.locked)return '<section class="panel"><h2>My support people</h2>'+lockedBox()+'</section>';return '<section class="panel"><h2>My support people</h2><p>Choose people or services you would like to contact. Nothing is sent from this app.</p><div class="contact-list">'+store().contacts.map(x=>'<article class="contact-card"><div><h3>'+esc(x.name)+'</h3><p>'+esc(x.role)+'</p><small>'+(x.persistent?'Saved':'This visit')+'</small></div><a class="button button-outline" href="tel:'+esc(x.phone.replace(/[^\d+*#]/g,''))+'">Call '+esc(x.phone)+'</a><button class="text-button" data-v5="delete-contact" data-id="'+esc(x.id)+'">Remove</button></article>').join('')+'</div><form id="support-contact-form"><label class="field-label" for="contact-name">Name or service</label><input class="field" id="contact-name" name="name" maxlength="100" required><label class="field-label" for="contact-role">Role, if useful</label><input class="field" id="contact-role" name="role" maxlength="100"><label class="field-label" for="contact-phone">Phone</label><input class="field" id="contact-phone" name="phone" type="tel" maxlength="40" required pattern="[+0-9 ()*#-]{3,40}"><label class="check-label"><input name="persist" type="checkbox">Save on this browser for another day</label><p class="small-note">'+(vault.enabled?'Saved contact details are included in your encrypted records.':'Saved contact details are unencrypted unless you enable the journal lock.')+'</p><button class="button button-teal" type="submit">Add my support person</button><p class="form-error" role="alert" id="contact-error"></p></form></section>';}
 function support(){return head('SUPPORT IS PART OF CARE','You do not have to hold it alone.')+helpHTML()+contactsHTML()+bodyOf(c.supportView(),['.page-header']);}
 function toolkit(){
  const html=templ(c.advance.studiosView());html.querySelector('.page-header')?.remove();html.querySelector('.studio-hero')?.remove();
  html.querySelectorAll('.studio-card').forEach(el=>{const id=el.querySelector('[data-adv="studio"]').dataset.id;const h=el.querySelector('h3');const sub=document.createElement('p');sub.className='studio-original';sub.textContent=h.textContent;h.textContent=studioNames[id];h.after(sub);});
  return head('YOUR TOOLKIT','Make the next step practical.','Six guided tools for words, choices and an editable plan.')+'<a class="toolkit-infographics" href="#infographics">'+icon('infographics')+'<span><strong>Explore the illustrated guides</strong><small>12 infographics · flip, enlarge and read the sources</small></span>'+icon('arrow')+'</a>'+[...html.childNodes].map(n=>n.outerHTML||n.textContent).join('')+'<details class="panel"><summary>Short draft tools</summary><p>Earlier compact three-question builders remain available here.</p><button class="text-button" data-v5="legacy-tools" data-value="conversation">Short support draft</button><button class="text-button" data-v5="legacy-tools" data-value="transition">Short transition draft</button></details>';
 }
 function scope(){
  const facts=D.practices.map(p=>'<details><summary>'+esc(p.title)+' · safety & adaptation</summary><p>'+esc(p.safety)+'</p><p>'+esc(A.evidence[p.id].how)+'</p></details>').join('');
  const archive=(S.scopeArchive||[]).map(x=>'<p>'+esc(x)+'</p>').join('');
  return head('IMAGES / EVIDENCE / SAFETY','Clear context. Your choice.','Original educational tools, with relevant background sources and adaptation notes.')+'<section class="panel"><h2>About the images</h2><p>Illustrative, AI-generated photographs accompany the content. Infographics are AI-generated educational illustrations with sources and limitations. Their readable text and statistics have been editorially reviewed. These visuals are not anatomical standards, prescribed movement ranges or patient records.</p><h2>About evidence</h2><p>Sources support background principles. Serein has not been clinically validated as a treatment, and population figures do not predict a personal benefit.</p><h2>Current privacy choices</h2><p>Records are browser-local. Saving personal entries is opt-in. Optional encryption covers journals, check-ins and contacts; other saved preferences, feedback and plans remain unencrypted. Drafts use temporary tab storage, encrypted when the journal lock is enabled.</p>'+facts+'<details><summary>All original scope and privacy statements</summary><p class="notice">The original default-storage statements below describe the unlocked mode. The optional journal lock now adds encryption to the specific records named above.</p>'+archive+'</details><h2>Sources</h2>'+Object.values(A.references).map(s=>'<a class="source-link" href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+' ↗<small>'+esc(s.scope)+'</small></a>').join('')+'</section>';
 }
 function keyOf(n){return n.nodeType===1?(n.id||n.getAttribute('data-key')||''):'';}
 function morph(old,n){
  if(old.nodeType!==n.nodeType||old.nodeName!==n.nodeName){old.replaceWith(n.cloneNode(true));return;}
  if(n.nodeType===3){if(old.nodeValue!==n.nodeValue)old.nodeValue=n.nodeValue;return;}if(n.nodeType!==1)return;
  for(const a of [...old.attributes])if(!n.hasAttribute(a.name))old.removeAttribute(a.name);
  for(const a of [...n.attributes])if(old.getAttribute(a.name)!==a.value)old.setAttribute(a.name,a.value);
  if(old instanceof HTMLInputElement||old instanceof HTMLSelectElement||old instanceof HTMLTextAreaElement){if(document.activeElement!==old&&old.value!==n.value)old.value=n.value;if(old.type==='checkbox')old.checked=n.checked;}
  const children=[...n.childNodes];
  children.forEach((next,i)=>{let current=old.childNodes[i],key=keyOf(next);if(key&&keyOf(current||{})!==key){const found=[...old.childNodes].find(x=>keyOf(x)===key);if(found){old.insertBefore(found,current||null);current=found;}}
   if(!current)old.appendChild(next.cloneNode(true));else morph(current,next);
  });
  while(old.childNodes.length>children.length)old.lastChild.remove();
 }
 let imageObserver=null;const observedImages=new Set();
 function lazyImages(root=document){
  if(imageObserver)for(const im of observedImages)if(!im.isConnected){imageObserver.unobserve(im);observedImages.delete(im);}
  const images=[...root.querySelectorAll('img[data-src]')];if(!images.length)return;
  if(!('IntersectionObserver'in globalThis)){images.forEach(im=>{im.src=im.dataset.src;delete im.dataset.src});return;}
  if(!imageObserver)imageObserver=new IntersectionObserver(rows=>rows.forEach(row=>{if(row.isIntersecting){const im=row.target;if(im.dataset.src){im.src=im.dataset.src;delete im.dataset.src;}imageObserver.unobserve(im);observedImages.delete(im);}}),{rootMargin:'250px'});
  images.forEach(im=>{if(!observedImages.has(im)){observedImages.add(im);imageObserver.observe(im);}});
 }
 /** Patch the active view while retaining stable controls and in-progress input. */
 function render({focus=false}={}){
  c.captureDraft();const html=route.view==='today'?today():route.view==='library'?library():route.view==='toolkit'?toolkit():route.view==='infographics'?gallery.render():route.view==='me'?me():support();
  const shell=document.createElement('main');shell.id='main';shell.tabIndex=-1;shell.innerHTML=S.mediaHTML?S.mediaHTML(html):html;morph($('#main'),shell);
  for(const [id,mobile] of [['#desktop-nav',false],['#mobile-nav',true]]){const host=$(id),next=document.createElement('nav');next.innerHTML=navHTML(mobile);if(host.innerHTML!==next.innerHTML)host.innerHTML=next.innerHTML;}
  $('#breadcrumb').textContent=titles[route.view]+(route.tab&&!['toolkit','infographics'].includes(route.view)?' / '+route.tab.charAt(0).toUpperCase()+route.tab.slice(1):'');document.title=titles[route.view]+' · Serein · Healthcare Crown Academy';
  applyTheme();c.icons();c.contexts?.decorate();lazyImages();gallery.mounted();if(route.view==='today')quickActions();if(focus)$('#main').focus({preventScroll:true});
 }
 function detail(id){
  const p=D.practices.find(x=>x.id===id);if(!p)return;
  c.openModal(p.title,'<img class="article-image" src="'+p.photo+'" alt="'+esc(p.cardAlt||'Illustrative scene for '+p.title)+'"><p class="small-note">Illustrative, AI-generated image</p>'+c.advance.aboutHTML(id)+'<p class="notice">'+esc(p.safety)+'</p>'+field('detail-duration','Choose a length',c.chooseDuration(p,store().preferences.time),p.selfPaced?[['','Self-paced']]:p.durations.map(n=>[n,c.durationLabel(n)]))+'<div class="button-row"><button class="button button-teal" data-v5="detail-start" data-id="'+id+'">Start this practice</button><button class="button button-outline" data-v5="detail-preview" data-id="'+id+'">Watch first</button><button class="text-button" data-save-practice="'+id+'" aria-pressed="'+store().savedPractices.includes(id)+'">'+(store().savedPractices.includes(id)?'Saved · remove':'Save practice')+'</button></div>');
 }
 function settingsChanged(e){
  const p=store().preferences,before={...p},map={'pref-reading':'readingSize','pref-theme':'theme','pref-width':'readingWidth','pref-focus':'focus','pref-motion':'motion','pref-3d':'visual3d','pref-quotes':'hideQuotes','pref-role':'role','pref-time':'time','pref-style':'style','pref-shift':'shift'};
  if(map[e.id]){p[map[e.id]]=e.id==='pref-quotes'?!e.checked:e.type==='checkbox'?e.checked:e.id==='pref-time'?+e.value:e.value;state.budget=p.time;state.style=p.style;if(e.id==='pref-shift'){try{sessionStorage.removeItem('serein-moment-override')}catch{}autoMoment();}vault.persist();applyTheme();c.syncPlayerMotion();c.toast('Preference updated.',()=>{store().preferences=before;state.budget=before.time;state.style=before.style;vault.persist();applyTheme();render();});return;}
  if(e.id==='lock-after'&&store().vault){store().vault.lockAfter=+e.value;vault.persist();resetActivity();}
  if(e.id==='lock-on-hide'&&store().vault){store().vault.lockOnHide=e.checked;vault.persist();}
 }
 function requestLock(){if(vault.busy){clearTimeout(lockRequest);lockRequest=setTimeout(requestLock,100);return;}vault.lock().catch(error=>{document.body.classList.remove('privacy-shield');c.toast(error.message||'Private records could not be locked. Keep this tab open.');}).finally(()=>{if(!vault.enabled||vault.locked)document.body.classList.remove('privacy-shield');});}
 function resetActivity(){clearTimeout(activityTimer);if(vault.enabled&&!vault.locked)activityTimer=setTimeout(requestLock,(store().vault.lockAfter||5)*60000);}
 function lockDialog(mode){
  if(!vault.available){c.toast('Secure local encryption is unavailable in this browser.');return;}
  if(mode==='lock'){requestLock();return;}
  const title=mode==='setup'?'A private journal lock.':mode==='remove'?'Remove your journal lock?':'Unlock your private records.';
  const warning=mode==='setup'?'If you forget the passcode, locked entries cannot be recovered. Choose a passphrase you can keep safely.':mode==='remove'?'Removing the lock writes saved journals, check-ins and contacts back to normal unencrypted browser storage.':'Your passcode stays on this device and is never sent.';
  c.openModal(title,'<p>'+warning+'</p><form id="vault-form" data-mode="'+mode+'"><label class="field-label" for="vault-pass">Passcode or passphrase</label><input class="field" type="password" id="vault-pass" name="pass" autocomplete="'+(mode==='setup'?'new-password':'current-password')+'" '+(mode==='setup'?'minlength="6"':'')+' required>'+(mode==='setup'?'<label class="field-label" for="vault-confirm">Confirm passcode</label><input class="field" type="password" id="vault-confirm" name="confirm" autocomplete="new-password" minlength="6" required><label class="check-label"><input type="checkbox" name="understood" required>I understand that a forgotten passcode cannot be recovered.</label>':'')+(mode==='remove'?'<label class="check-label"><input type="checkbox" name="understood" required>I understand saved records will be unencrypted.</label>':'')+'<p class="form-error" id="vault-error" role="alert"></p><button type="submit" class="button button-teal">'+(mode==='setup'?'Enable encryption':mode==='remove'?'Remove lock':'Unlock')+'</button></form>');
 }
 function exportDialog(){
  c.openModal('Your archive, your choice.','<p>Downloaded files contain personal records. Keep them private.</p><div class="button-row">'+(vault.enabled?'<button class="button button-teal" data-v5="encrypted-export">Download encrypted archive</button>':'')+'<button class="button button-outline" data-v5="plain-export">Download plain archive</button></div><p class="small-note">An encrypted archive requires its passcode. A plain archive can be read by anyone who opens the file.</p>');
 }
 function confirmPlain(){
  if(vault.locked){lockDialog('unlock');return;}
  c.openModal('Download an unencrypted archive?','<p>This file includes your personal records in readable form, even when the journal lock is enabled.</p><label class="check-label"><input type="checkbox" id="plain-export-consent">I understand and will keep the file private.</label><button class="button button-teal" data-v5="plain-export-confirm">Download plain archive</button><p id="export-error" class="form-error" role="alert"></p>');
 }
 function help(){player.cancelCountdown();if(state.session?.state==='playing')c.pausePlayer();c.openModal('Get human support.',helpHTML());}
 function onboarding(step=0){onboardStep=step;const p=store().preferences;
  const content=step===0?'<p class="eyebrow">WELCOME TO SEREIN</p><h3>A little space for the people who care.</h3><p>Optional practices, personal reflection and practical working-day support.</p><p>Your personal records stay in this browser. Nothing is sent to employers, and there is no live monitoring.</p>':step===1?'<form id="onboarding-form">'+field('welcome-role','Your role',p.role,roles)+field('welcome-time','Usual pause length',p.time,[[60,'1 minute'],[120,'2 minutes'],[300,'5 minutes']])+field('welcome-style','Focus preference',p.style,[['any','Open to different practices'],['nonbreath','Without breath focus'],['ground','Grounding only']])+field('welcome-shift','Shift pattern',p.shift,[['days','Days'],['nights','Nights'],['rotating','Rotating'],['prefer','Prefer not to say']])+'</form>':'<h3>Your words. Your choice.</h3><p>Saving journal entries, check-ins and support contacts is opt-in. Drafts are temporarily kept in this tab. Normal browser storage is unencrypted.</p><p>You can export, import or clear your records. Optional journal encryption adds a passcode lock to journals, check-ins and contacts.</p><p class="notice">Keep patient-identifying information out of this space. Serein is educational and is not monitored.</p>';
  c.openModal('Make a little room.', '<div class="onboarding-step" data-step="'+step+'"><p class="small-note">Step '+(step+1)+' of 3</p>'+content+'<div class="button-row"><button class="button button-teal" data-v5="welcome-next">'+(step===2?'Enter Serein':'Continue')+'</button><button class="text-button" data-v5="welcome-skip">Skip</button>'+(step===2&&vault.available&&!vault.enabled?'<button class="text-button" data-v5="welcome-lock">Set up a journal lock</button>':'')+'</div></div>');
 }
 function finishWelcome(){store().onboarded=true;vault.persist();autoMoment();c.closeModal();render();if(route.quick)player.quick();}
 function search(query){
  const q=query.toLowerCase().trim(),fuzzy=(text)=>{const s=text.toLowerCase();if(!q)return true;if(s.includes(q))return true;let i=0;for(const ch of s)if(ch===q[i])i++;return i===q.length;};
  const actions=[['box','Start Box Breathing · 2 min'],['journal','New journal entry'],['checkin','Quick check-in'],['export','Export my data'],['dark','Switch to dark theme'],['help','Get help now'],['quick','Quick pause'],['infographics','Browse educational infographics']];
  const groups=[['Actions',actions.filter(x=>fuzzy(x[1])).map(([id,label])=>({id,label,kind:'action',sub:'Serein action'}))],['Practices',D.practices.filter(x=>fuzzy(x.title+' '+x.desc)).map(x=>({id:x.id,label:x.title,kind:'practice',sub:x.category}))],['Guides',D.resources.filter(x=>fuzzy(x.title+' '+x.desc)).map(x=>({id:x.id,label:x.title,kind:'guide',sub:x.duration}))],['Studios',A.studios.filter(x=>fuzzy(x.title+' '+studioNames[x.id])).map(x=>({id:x.id,label:studioNames[x.id],kind:'studio',sub:x.title}))],['Journeys',A.journeys.filter(x=>fuzzy(x.title)).map(x=>({id:x.id,label:x.title,kind:'journey',sub:'Five-step learning journey'}))]];
  groups.push(['Infographics',S.infographicCards.filter(x=>fuzzy(x.title+' '+x.category+' '+x.metricLabel)).map(x=>({id:x.id,label:x.title,kind:'infographic',sub:x.kind}))]);
  const recent=store().preferences.commandRecent||[],all=groups.flatMap(x=>x[1]),recentItems=recent.map(k=>all.find(x=>x.kind+':'+x.id===k)).filter(Boolean);
  if(!q&&recentItems.length)groups.unshift(['Recent choices',recentItems]);
  $('#search-results').innerHTML=groups.map(([label,items])=>items.length?'<section><h2 class="search-group-label">'+label+'</h2>'+items.slice(0,q?8:4).map(x=>'<button class="search-result" data-v5="command" data-kind="'+x.kind+'" data-id="'+x.id+'"><span class="search-icon">'+icon(x.kind==='practice'?'play':x.kind==='action'?'arrow':'book')+'</span><span><strong>'+esc(x.label)+'</strong><small>'+esc(x.sub)+'</small></span>'+icon('arrow')+'</button>').join('')+'</section>':'').join('')||empty('No matches yet.','Try a practice, support, journal or an action.','');
 }
 function command(kind,id){
  const recent=store().preferences.commandRecent||[];store().preferences.commandRecent=[kind+':'+id,...recent.filter(k=>k!==kind+':'+id)].slice(0,6);vault.persist();c.closeSearch();
  if(kind==='practice')detail(id);else if(kind==='guide')c.openResource(id);else if(kind==='studio')go('toolkit/'+id);else if(kind==='journey')go('library/journeys?journey='+id);else if(kind==='infographic')go('infographics/'+id);else if(id==='infographics')go('infographics');
  else if(id==='box')c.openPractice('box',120);else if(id==='journal')go('me/journal');else if(id==='checkin'){if(vault.locked)lockDialog('unlock');else c.openCheckin();}else if(id==='export')exportDialog();else if(id==='dark'){store().preferences.theme='night';vault.persist();applyTheme();c.toast('HCA navy night enabled.');}else if(id==='help')help();else if(id==='quick')player.quick();
 }
 function filterURL(){
  if(route.view!=='library'||route.tab!=='practices')return;
  const p=new URLSearchParams();p.set('time',String(state.budget));if(state.style!=='any')p.set('style',state.style);if(state.position!=='any')p.set('setting',state.position);if(state.query)p.set('q',state.query);
  route.params=p;route.canonical='library/practices?'+p;lastHash='#'+route.canonical;setHistory(lastHash,true);
 }
 function refreshFilters(){
  filterURL();render();
  if($('#modal [data-v5="filters-done"]')){
   $$('[data-budget]',$('#modal')).forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.budget)===String(state.budget));b.classList.toggle('active',String(b.dataset.budget)===String(state.budget));});
   for(const [id,value] of [['practice-style-sheet',state.style],['practice-position-sheet',state.position]])if($('#'+id))$('#'+id).value=value;
  }
 }
 function filterSheet(){
  const html=filtersHTML().replace(/id="([^"]+)"/g,(_,id)=>'id="'+id+'-sheet"').replace(/for="([^"]+)"/g,(_,id)=>'for="'+id+'-sheet"');
  c.openModal('Choose what fits.',html+'<button class="button button-teal" data-v5="filters-done">Show practices</button>');
 }
 function quickCheckin(mood){
  if(vault.locked){lockDialog('unlock');return;}
  state.mood=mood;const entry={id:c.uid(),mood,date:new Date().toISOString(),energy:'Not specified',note:'',moment:D.moments[state.moment].title,persistent:false};
  store().checkins.push(entry);state.quickCheckinId=entry.id;vault.persist();render();quickActions();c.toast('Check-in kept for this visit.');
 }
 function quickActions(){
  const entry=store().checkins.find(x=>x.id===state.quickCheckinId),host=$('#quick-checkin-actions');if(!entry||!host)return;
  host.innerHTML='<p class="small-note">'+(entry.persistent?'Saved in this browser.':'Kept for this visit.')+'</p><button class="text-button" data-v5="checkin-note">Add a note</button><button class="text-button" data-v5="save-quick-checkin" '+(entry.persistent?'disabled':'')+'>Save on this browser</button>';
 }
 function noteDialog(){
  const x=store().checkins.find(x=>x.id===state.quickCheckinId);if(!x)return;
  c.openModal('A little context, if useful.','<form id="quick-note-form"><label class="field-label" for="quick-note">Your note · no patient details</label><textarea class="field" id="quick-note" name="note" maxlength="6000" rows="4">'+esc(x.note)+'</textarea><p class="small-note">'+(x.persistent?'This check-in is saved.':'This check-in lasts for this visit only.')+'</p><button class="button button-teal" type="submit">Keep my note</button></form>');
 }
 async function importFile(file){
  if(!file)return;try{
   if(file.size>8*1024*1024)throw Error('Choose a Serein archive smaller than 8 MB.');
   const raw=JSON.parse(await file.text());if(vault.locked){lockDialog('unlock');c.toast('Unlock private records before importing, then choose the file again.');return;}
   if(raw.vault){vault.validate(raw.vault);pendingImport=raw;c.openModal('Open an encrypted archive.','<p>Use the passcode for this archive. It is never sent anywhere.</p><form id="archive-pass-form"><label class="field-label" for="archive-pass">Archive passcode</label><input type="password" class="field" id="archive-pass" name="pass" autocomplete="off" required><button class="button button-teal" type="submit">Open archive</button><p id="archive-error" class="form-error" role="alert"></p></form>');}
   else{pendingImport=c.normalise(raw);showImport(false);}
  }catch(error){c.toast(error.message||'This archive could not be read.');}
 }
 function showImport(encrypted){
  const x=pendingImport;c.openModal('Restore your Serein archive.','<p>'+x.journals.length+' reflections, '+x.checkins.length+' check-ins, '+x.contacts.length+' contacts, '+x.feedback.length+' responses and '+x.savedPlans.length+' plans.</p><p>Merge keeps existing entries. Replace restores this archive in their place.</p>'+(encrypted&&!vault.enabled?'<label class="check-label"><input type="checkbox" id="import-use-lock" checked>Keep these records encrypted using the archive passcode</label><p class="notice">If you uncheck this option, imported saved records use normal unencrypted browser storage.</p>':'')+'<div class="button-row"><button class="button button-teal" data-v5="import-merge">Merge with my records</button><button class="button button-outline" data-v5="import-replace">Replace with this archive</button><button class="text-button" data-action="close-modal">Cancel</button></div><p class="form-error" id="import-error" role="alert"></p>');
 }
 async function applyImport(replace){
  if(!pendingImport||vault.locked)return;if(c.recovery()){$('#import-error').textContent='Download the original recovery copy and clear the damaged archive before importing.';return;}
  const old=store(),draftBefore=state.draft,incoming=pendingImport,unique=xs=>[...new Map(xs.map(x=>[x.id,x])).values()],useLock=!!$('#import-use-lock')?.checked;
  const next=replace?{...incoming,vault:old.vault}:{
   ...old,practiceMemory:{...incoming.practiceMemory,...old.practiceMemory},practiceChoices:{...incoming.practiceChoices,...old.practiceChoices},
   feedback:unique([...old.feedback,...incoming.feedback]),savedPlans:unique([...old.savedPlans,...incoming.savedPlans]),journals:unique([...old.journals,...incoming.journals]),checkins:unique([...old.checkins,...incoming.checkins]),contacts:unique([...old.contacts,...incoming.contacts]),
   journeyProgress:Object.fromEntries(A.journeys.map(j=>[j.id,[...new Set([...(old.journeyProgress[j.id]||[]),...(incoming.journeyProgress[j.id]||[])])]])),
   savedPractices:[...new Set([...old.savedPractices,...incoming.savedPractices])],savedResources:[...new Set([...old.savedResources,...incoming.savedResources])],savedWords:[...new Set([...old.savedWords,...incoming.savedWords])],routine:old.routine.length?old.routine:incoming.routine
  };
  try{c.setStore(next);if(useLock&&!vault.enabled)await vault.enable(importPass);else if(!await vault.persist())throw Error('The archive could not be saved. Existing records are kept; free browser storage and try again.');if(replace)c.clearDraft();pendingImport=null;importPass='';c.closeModal();applyTheme();render();c.toast(replace?'Archive restored.':'Archive merged.');}
  catch(error){c.setStore(old);state.draft=draftBefore;const errorBox=$('#import-error');if(errorBox)errorBox.textContent=error.message;else c.toast(error.message);}
 }
 function reminderExtras(){
  const host=$('#reminder-form');if(!host||$('#reminder-preset'))return;
  const html=field('reminder-preset','Shift-aware reminder preset','custom',[['custom','Choose my own time'],['start','10 minutes after shift start'],['middle','Mid-shift'],['end','End of shift']])+field('reminder-shift','Shift used for this reminder',store().preferences.shift==='nights'?'nights':'days',[['days','Day shift · 07:00–19:00'],['nights','Night shift · 19:00–07:00']])+'<p class="small-note">These are editable presets, not your known rota. Confirm the actual shift time and weekdays before downloading.</p>';
  host.insertAdjacentHTML('afterbegin',html);
 }
 function shortcuts(){player.cancelCountdown();if(state.session?.state==='playing')c.pausePlayer();c.openModal('Your keyboard shortcuts.','<dl class="shortcut-list">'+[['P','Quick pause, outside text fields'],['Space','Play or pause'],['← / →','Previous or next step'],['R','Restart practice'],['F','Shared presentation'],['Esc','Close the current sheet or exit practice'],['Ctrl/⌘ K or /','Search content and actions'],['?','Open this guide']].map(([k,v])=>'<div><dt><kbd>'+k+'</kbd></dt><dd>'+v+'</dd></div>').join('')+'</dl>');}
 function handleClick(event){
  if(event.target.closest('a.skip')){event.preventDefault();event.stopImmediatePropagation();$('#main').focus({preventScroll:true});$('#main').scrollIntoView?.({block:'start',behavior:'instant'});return;}
  const b=event.target.closest('button,a[data-action]');if(!b)return;const d=b.dataset;
  function stop(){event.preventDefault();event.stopImmediatePropagation();}
  if(d.ig){stop();gallery.handle(b,event);return;}
  if(d.nav){stop();go(d.nav);return;}
  if(d.practiceDetail){stop();detail(d.practiceDetail);return;}
  if(d.adv==='studio'){stop();go('toolkit/'+d.id);return;}
  if(d.adv==='journey'){stop();go('library/journeys?journey='+d.id);return;}
  if(d.adv==='app-options'){stop();c.advance.handle(b).then(reminderExtras);return;}
  if(d.adv==='feedback'){stop();c.advance.handle(b).then(()=>{if($('#uncomfortable-support'))$('#uncomfortable-support').hidden=d.value!=='Uncomfortable';});return;}
  if(d.action==='reflection-history'&&route.view==='me'&&route.tab==='journal'){stop();const h=$('.journal-history h2');h.tabIndex=-1;h.focus();h.scrollIntoView?.({block:'start',behavior:c.reduced()?'instant':'smooth'});return;}
  if(d.action==='settings'||d.action==='data-page'||d.action==='reflection-history'){stop();go(d.action==='settings'?'me/settings':d.action==='data-page'?'me/data':'me/journal');return;}
  if(d.action==='quick-start'){stop();player.quick();return;}
  if(d.action==='sources'){stop();state.scopeOpen=true;c.openModal('About images, evidence & safety.',scope());return;}
  if(d.action==='export'){stop();exportDialog();return;}
  if(d.action==='work-tools'||d.action==='transition-tools'){stop();go('toolkit/'+(d.action==='work-tools'?'support':'transition'));return;}
  if(d.action==='reset-filters'){stop();state.budget=0;state.style='any';state.position='any';state.category='All';state.query='';refreshFilters();return;}
  if(d.action==='checkin'&&vault.locked){stop();lockDialog('unlock');return;}
  if(d.action==='confirm-clear'){stop();cancelSearch();clearTimeout(lockRequest);vault.reset();c.clearRecovery();c.resetStore();c.clearUndo();pendingImport=null;importPass='';state.draft='';state.mood=0;state.budget=120;state.style='any';state.query='';state.guideQuery='';state.journalQuery='';state.position='any';state.category='All';state.guideCategory='All';state.homeTime=null;state.quickCheckinId=null;state.editing=null;try{sessionStorage.removeItem('serein-moment-override');sessionStorage.removeItem('serein-rotation')}catch{}autoMoment();c.clearDraft();go('today');c.toast('Serein records and preferences cleared from this browser.');return;}
  if(d.action==='privacy'){stop();c.privacy();$('#modal-content').insertAdjacentHTML('afterbegin','<p class="notice">'+(vault.enabled?'Optional encryption is enabled for journals, check-ins and contacts. The normal-storage statements below apply to other data and to unlocked mode.':'The journal lock can optionally encrypt journals, check-ins and contacts. Without it, normal browser storage is unencrypted.')+'</p>');return;}
  if(d.action==='save-player'||d.savePractice){stop();c.toggleFavorite(d.savePractice||state.session.practice.id);if($('#detail-duration')){const id=d.savePractice;detail(id);}return;}
  if(d.keepEntry){stop();const entry=(d.entryType==='journal'?store().journals:store().checkins).find(x=>x.id===d.keepEntry);if(entry&&!vault.locked)c.openModal('Keep this entry in your browser?','<p>'+(vault.enabled?'The saved entry will be included in your encrypted private records. Keep your passcode safe.':'Browser storage is unencrypted. Other people using this browser profile may be able to read the entry.')+'</p><div class="button-row"><button class="button button-teal" data-confirm-keep="'+esc(entry.id)+'" data-entry-type="'+d.entryType+'">Save in this browser</button><button class="text-button" data-action="close-modal">This visit only</button></div>');return;}
  if(d.action==='search'){stop();player.cancelCountdown();if(state.session?.state==='playing')c.pausePlayer();c.openSearch();return;}
  if(d.moment!==undefined){stop();rememberMoment(+d.moment);render();quickActions();return;}
  if(d.mood&&route.view==='today'&&!b.closest('dialog')){stop();quickCheckin(+d.mood);return;}
  if(d.budget!==undefined){stop();state.budget=d.budget==='self'?'self':+d.budget;refreshFilters();return;}
  if(d.category){stop();state.category=d.category;refreshFilters();return;}
  if(d.guideCategory){stop();state.guideCategory=d.guideCategory;render();return;}
  if(!d.v5)return;stop();
  const a=d.v5;
  if(a==='recovery-export'){c.download(c.recovery()||'','Serein-recovery-data.json','application/json');}
  else if(a==='quick')player.quick();
  else if(a==='help')help();
  else if(a==='scope')c.openModal('About images, evidence & safety.',scope());
  else if(a==='filters')filterSheet();
  else if(a==='filters-done'){c.closeModal();render();}
  else if(a==='clear-filter'){if(d.value==='time')state.budget=0;if(d.value==='style')state.style='any';if(d.value==='setting')state.position='any';if(d.value==='category')state.category='All';refreshFilters();}
  else if(a==='detail-start'||a==='detail-preview')c.openPractice(d.id,+$('#detail-duration').value||null,a==='detail-preview');
  else if(a==='home-time'){state.homeTime=d.value==='self'?'self':+d.value;render();}
  else if(a==='rotation'){try{sessionStorage.setItem('serein-rotation',d.value);sessionStorage.removeItem('serein-moment-override')}catch{}autoMoment();render();}
  else if(a==='checkin-note')noteDialog();
  else if(a==='save-quick-checkin'){const x=store().checkins.find(x=>x.id===state.quickCheckinId);if(x){x.persistent=true;vault.persist();quickActions();c.toast('Check-in saved.',()=>{x.persistent=false;vault.persist();quickActions();});}}
  else if(a==='delete-contact'){const i=store().contacts.findIndex(x=>x.id===d.id);if(i>=0){const [x]=store().contacts.splice(i,1);vault.persist();render();c.toast('Contact removed.',()=>{if(vault.locked){c.toast('Unlock before restoring this contact.');return;}store().contacts.splice(i,0,x);vault.persist();render();});}}
  else if(a==='setup-lock')lockDialog('setup');
  else if(a==='unlock')lockDialog('unlock');
  else if(a==='lock')requestLock();
  else if(a==='remove-lock')lockDialog('remove');
  else if(a==='plain-export')confirmPlain();
  else if(a==='plain-export-confirm'){if(!$('#plain-export-consent').checked){$('#export-error').textContent='Confirm that you understand the file is unencrypted.';return;}const payload={...store(),vault:null,app:'Serein',version:5,exportedAt:new Date().toISOString()};c.download(JSON.stringify(payload,null,2),'Serein-personal-data.json','application/json');c.closeModal();c.toast('Plain archive prepared. Keep it private.');}
  else if(a==='encrypted-export')vault.exportEncrypted().then(out=>{c.download(JSON.stringify(out,null,2),'Serein-encrypted-data.json','application/json');c.closeModal();c.toast('Encrypted archive prepared. Keep its passcode safe.');}).catch(error=>c.toast(error.message));
  else if(a==='player-settings'){player.cancelCountdown();player.cancelCountdown();if(state.session?.state==='playing')c.pausePlayer();if(!$('#voice-choice')&&globalThis.speechSynthesis?.getVoices?.().length)$('#player-extra-options').innerHTML=player.extras();$('#player-settings').showModal();c.contexts.decorate();}
  else if(a==='close-player-settings')$('#player-settings').close();
  else if(a==='shortcuts')shortcuts();
  else if(a==='choose-another'){player.cancelCountdown();c.exitPlayer();c.advance.finderOpen();}
  else if(a==='next-suggestion'){const current=state.session.practice.id;c.exitPlayer();const next=c.advance.rank({budget:store().preferences.time}).find(x=>x.id!==current);if(next)c.openPractice(next.id);else c.advance.finderOpen();}
  else if(a==='back-today'){c.exitPlayer();go('today');}
  else if(a==='onboarding')onboarding(0);
  else if(a==='welcome-skip')finishWelcome();
  else if(a==='welcome-lock'){finishWelcome();lockDialog('setup');}
  else if(a==='welcome-next'){if(onboardStep===1){const p=store().preferences;p.role=$('#welcome-role').value;p.time=+$('#welcome-time').value;p.style=$('#welcome-style').value;p.shift=$('#welcome-shift').value;state.budget=p.time;state.style=p.style;}if(onboardStep<2)onboarding(onboardStep+1);else finishWelcome();}
  else if(a==='command')command(d.kind,d.id);
  else if(a==='import-merge'||a==='import-replace')applyImport(a==='import-replace');
  else if(a==='legacy-tools')c.workTools(d.value);
  else if(a==='share-team'){
   const s=c.advance.studio,base=new URL(location.href);base.hash='toolkit/team?practice='+encodeURIComponent(s.teamPractice)+'&duration='+s.teamDuration+'&external='+(s.external?1:0);
   const text=base.href;const host=$('#team-share-link');host.value=text;
   Promise.resolve().then(()=>{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');return navigator.clipboard.writeText(text)}).then(()=>c.toast('Link copied. No personal records are included.')).catch(()=>{host.focus();host.select();c.toast('Select and copy the link.');});
  }
 }
 async function handleSubmit(event){
  const form=event.target;if(!['vault-form','support-contact-form','quick-note-form','archive-pass-form'].includes(form.id))return;
  event.preventDefault();event.stopImmediatePropagation();const fd=new FormData(form);
  if(form.id==='vault-form'){
   const error=$('#vault-error'),button=form.querySelector('button[type="submit"]');button.disabled=true;error.textContent='';
   try{
    if(form.dataset.mode==='setup'){if(fd.get('pass')!==fd.get('confirm'))throw Error('The passcodes do not match.');if(!fd.has('understood'))throw Error('Confirm that you understand the recovery limit.');await vault.enable(String(fd.get('pass')));}
    else if(form.dataset.mode==='remove'){if(!fd.has('understood'))throw Error('Confirm that saved records will be unencrypted.');await vault.remove(String(fd.get('pass')));}
    else await vault.unlock(String(fd.get('pass')));
    c.closeModal();form.reset();render();c.toast(form.dataset.mode==='setup'?'Journal encryption enabled.':form.dataset.mode==='remove'?'Lock removed. Saved records now use unencrypted browser storage.':'Private records unlocked.');resetActivity();
   }catch(e){error.textContent=e.message;button.disabled=false;}
  }
  if(form.id==='support-contact-form'){
   if(vault.locked)return;const name=String(fd.get('name')).trim(),phone=String(fd.get('phone')).trim();if(!name){$('#contact-error').textContent='Enter a name or service.';return;}if(!/[0-9]{3}/.test(phone.replace(/\D/g,''))){$('#contact-error').textContent='Enter a usable phone number.';return;}
   store().contacts.push({id:c.uid(),name:name.slice(0,100),role:String(fd.get('role')).trim().slice(0,100),phone:phone.slice(0,40),persistent:fd.has('persist')});vault.persist();render();c.toast(fd.has('persist')?'Support contact saved in this browser.':'Support contact kept for this visit.');
  }
  if(form.id==='quick-note-form'){const entry=store().checkins.find(x=>x.id===state.quickCheckinId);if(entry&&!vault.locked){entry.note=String(fd.get('note')).slice(0,6000);vault.persist();c.closeModal();c.toast('Note kept with your check-in.');}}
  if(form.id==='archive-pass-form'){
   try{const pass=String(fd.get('pass')),raw=pendingImport;pendingImport=await vault.decryptArchive(raw,pass);importPass=pass;showImport(true);}catch{$('#archive-error').textContent='The passcode is incorrect, or this archive is damaged.';}
  }
 }
 function handleChange(event){
  const e=event.target;
  if(e.id==='import-file'){event.stopImmediatePropagation();importFile(e.files[0]);e.value='';return;}
  if(e.closest('#settings-form')||e.id==='lock-after'||e.id==='lock-on-hide'){event.stopImmediatePropagation();settingsChanged(e);return;}
  if(['practice-style','practice-position','practice-style-sheet','practice-position-sheet'].includes(e.id)){event.stopImmediatePropagation();if(e.id.includes('style'))state.style=e.value;else state.position=e.value;refreshFilters();return;}
  if(e.id==='date-filter'){event.stopImmediatePropagation();state.dateFilter=e.value;render();return;}
  if(['voice-choice','voice-rate','ambient-sound','ambient-volume','keep-awake','phase-haptics'].includes(e.id)){event.stopImmediatePropagation();player.change(e);return;}
  if(e.id==='reminder-preset'||e.id==='reminder-shift'){const night=$('#reminder-shift').value==='nights',v=$('#reminder-preset').value;if(v!=='custom')$('#reminder-time').value=v==='start'?(night?'19:10':'07:10'):v==='middle'?(night?'01:00':'13:00'):(night?'07:00':'19:00');}
 }
 function handleInput(event){
  const e=event.target;
  if(['practice-query','practice-query-sheet','guide-query','global-search','journal-query'].includes(e.id)){
   event.stopImmediatePropagation();clearTimeout(e.id==='journal-query'?journalTimer:searchTimer);
   if(e.id==='journal-query')state.journalQuery=e.value;else if(e.id==='guide-query')state.guideQuery=e.value;else if(e.id!=='global-search')state.query=e.value;
   const routeAtInput=route.canonical;const run=()=>{if(!e.isConnected||route.canonical!==routeAtInput)return;if(e.id==='global-search'){if($('#search-dialog').open)search(e.value);}else if(e.id==='journal-query'){state.journalQuery=e.value;const host=$('#journal-history');if(host)host.innerHTML=journalHistory();}else if(e.id==='guide-query'){state.guideQuery=e.value;$('#guide-results').innerHTML=S.mediaHTML(c.guidesResults());lazyImages();}else{state.query=e.value;filterURL();$('#practice-results').innerHTML=S.mediaHTML(c.practiceResults());lazyImages();}};
   if(e.id==='journal-query')journalTimer=setTimeout(run,150);else searchTimer=setTimeout(run,150);
  }
  if(e.id==='ambient-volume'||e.id==='voice-rate')player.change(e);
 }
 function keyboard(event){
  if(gallery.keyboard(event))return;
  const typing=event.target.closest('input,select,textarea,[contenteditable="true"]'),key=event.key.toLowerCase();
  if((event.metaKey||event.ctrlKey)&&key==='k'||key==='/'&&!typing){event.preventDefault();event.stopImmediatePropagation();player.cancelCountdown();if(state.session?.state==='playing')c.pausePlayer();c.openSearch();return;}
  if(typing||event.metaKey||event.ctrlKey||event.altKey)return;
  if($('#search-dialog').open)return;
  if(!$('#player').open){if(key==='p'&&!$('dialog[open]')){event.preventDefault();player.quick();}return;}
  if($('#player-settings').open||$('#modal').open)return;
  if(event.target.closest('button,a,summary')&&key===' '&&event.target.id!=='player-play')return;
  if(key===' '){event.preventDefault();player.cancelCountdown();c.playPause();}
  if(key==='arrowleft'||key==='arrowright'){event.preventDefault();state.session.jump(state.session.snapshot().index+(key==='arrowleft'?-1:1));c.updatePlayer(true);c.syncPlayerMotion();}
  if(key==='r'){event.preventDefault();c.restart();}
  if(key==='f'){event.preventDefault();c.present();}
  if(key==='?'){event.preventDefault();shortcuts();}
 }
 let playSince=0,played=0;
 function preparePlayer(){
  completionShown=false;lastPlay='';playSince=0;played=0;$('#player-completion').hidden=true;$('#player-scroll').hidden=false;
  if(!$('#player-extra-options'))$('#player-settings-content').insertAdjacentHTML('beforeend','<div id="player-extra-options">'+player.extras()+'</div>');
  $('#player-feedback').insertAdjacentHTML('beforeend','<button class="button button-outline" id="uncomfortable-support" data-v5="help" hidden>Find human support</button>');
  if(!globalThis.speechSynthesis)$('#session-voice')?.closest('label')?.setAttribute('hidden','');if(!(globalThis.AudioContext||globalThis.webkitAudioContext))$('#session-chime')?.closest('label')?.setAttribute('hidden','');player.prepare();c.contexts?.decorate();
 }
 function playerUpdated(s){
  const playing=s.state==='playing';if(lastPlay!==s.state){if(playing){playSince=performance.now();player.started();}else if(playSince){played+=performance.now()-playSince;playSince=0;}lastPlay=s.state;}
  player.tick(s);const ring=$('#progress-ring-fill');if(ring)ring.setAttribute('stroke-dashoffset',String(100-s.percent));
  $('#progress-ring')?.setAttribute('aria-label',Math.round(s.percent)+'% of this practice');
  if($('#completion-save')){const saved=store().savedPractices.includes(state.session.practice.id);$('#completion-save').textContent=saved?'Saved · remove favourite':'Save to favourites';$('#completion-save').setAttribute('aria-pressed',String(saved));}
  if(s.state==='complete'&&!state.preview){
   $('#player-scroll').hidden=true;$('#player-completion').hidden=false;$('#completion-elapsed').textContent=(state.session.duration?c.durationLabel(state.session.elapsed):Math.round(played/1000)+' seconds')+' · At your own pace';
   if(!completionShown){completionShown=true;$('#completion-title').focus({preventScroll:true});}
  }else{$('#player-scroll').hidden=false;$('#player-completion').hidden=true;completionShown=false;}
  for(const [i,b] of [...$('#player-step-list').querySelectorAll('button')].entries()){b.disabled=false;b.dataset.playerStep=String(i);b.setAttribute('aria-label','Step '+(i+1)+': '+state.session.phases()[i]?.title);b.textContent=String(i+1);}
 }
 function savingLabels(root){if(!vault.enabled)return;for(const label of root.querySelectorAll('label'))if(label.querySelector('input[name="persist"]'))for(const n of label.childNodes)if(n.nodeType===3)n.textContent=n.textContent.replace('Browser storage is not encrypted.','Saved records are included in your encrypted archive.');}
 function enrichModal(){savingLabels($('#modal-content'));
  lazyImages($('#modal-content'));
  if($('#studio-output')&&c.advance.studio?.id==='team'&&!$('#team-share-link'))$('#studio-result-status').insertAdjacentHTML('afterend','<section class="share-link"><label class="field-label" for="team-share-link">Shared practice link · no personal records</label><input class="field" id="team-share-link" readonly><button class="button button-outline" data-v5="share-team">Copy a shared practice link</button><p class="small-note">The link includes only a practice ID, duration and attention option. Local-file links must be opened on a device with that file; use the hosted edition to share between devices.</p></section>');
  reminderExtras();
 }
 function configureManifest(){
  if(location.protocol==='file:'||!$('meta[name="serein-distribution"]'))return;
  try{
   const here=new URL(location.href);here.hash='';here.search='';
   const manifest={id:here.pathname,name:'Serein · Healthcare Crown Academy',short_name:'Serein',start_url:here.href+'#today',scope:new URL('./',here).href,display:'standalone',background_color:'#F8F5EF',theme_color:'#10253A',icons:[{src:S.mediaURL('assets/icon-192.png'),sizes:'192x192',type:'image/png'},{src:S.mediaURL('assets/icon-512.png'),sizes:'512x512',type:'image/png'}],shortcuts:[{name:'Quick pause',url:here.href+'#quick-start'},{name:'Journal',url:here.href+'#me/journal'},{name:'Get help',url:here.href+'#support'}]};
   const link=document.createElement('link');link.rel='manifest';link.href=URL.createObjectURL(new Blob([JSON.stringify(manifest)],{type:'application/manifest+json'}));document.head.appendChild(link);
  }catch{}
 }
 function initialise(){configureManifest();
  gallery.initialise();
  applyTheme();autoMoment();setRoute(parse(location.hash));lastHash='#'+route.canonical;if(location.hash!==lastHash)setHistory(lastHash,true);
  document.addEventListener('click',handleClick,true);document.addEventListener('submit',handleSubmit,true);document.addEventListener('change',handleChange,true);document.addEventListener('input',handleInput,true);document.addEventListener('keydown',keyboard,true);
  window.addEventListener('popstate',readRoute);window.addEventListener('hashchange',readRoute);
  document.addEventListener('pointerdown',resetActivity,{passive:true});document.addEventListener('keydown',resetActivity);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&vault.enabled&&!vault.locked&&store().vault.lockOnHide!==false){document.body.classList.add('privacy-shield');requestLock();}});
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(store().preferences.theme==='auto')applyTheme()});
  $('#player-settings').addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();$('#player-settings').close();});
  $('#player-settings').addEventListener('close',()=>$('#player-settings-button').focus({preventScroll:true}));
  for(const dialog of $$('dialog'))dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){if(dialog.id==='player')c.exitPlayer();else dialog.close();}}});
  const observer=new MutationObserver(()=>enrichModal());observer.observe($('#modal-content'),{childList:true});
  window.addEventListener('error',()=>c.toast('Something went wrong. Your saved records have not been cleared.'));
  window.addEventListener('unhandledrejection',event=>{event.preventDefault();c.toast('That action could not finish. Keep this tab open and try again.');});
  if(!store().onboarded)setTimeout(()=>onboarding(0),0);else setTimeout(()=>openDeep(route),0);
  resetActivity();
 }
 async function selftest(){
  const checks=[],test=(name,fn)=>{try{fn();checks.push({name,result:'PASS'})}catch(e){checks.push({name,result:'FAIL',detail:e.message})}};
  for(const id of ['tide','box','ground'])test('Engine '+id,()=>{const p=D.practices.find(p=>p.id===id),e=new S.engine.SessionEngine(p);e.play(0);e.tick(1000);if(e.state!=='playing'||!e.phases().length)throw Error('Engine state invalid');e.pause(1000);if(e.state!=='paused')throw Error('Pause invalid');});
  test('Legacy routes',()=>{for(const [a,b] of Object.entries({practices:'library/practices',journeys:'library/journeys',studios:'toolkit',reflect:'me/journal',space:'me/saved'}))if(parse(a).canonical!==b)throw Error(a);});
  test('Store migration and round-trip',()=>{const x=c.normalise({app:'Serein',version:3,checkins:[{id:'fixture',mood:4,date:'2026-10-01'}],journals:[{id:'j',text:'Fixture',date:'2026-10-01'}]});if(x.version!==5||c.normalise(JSON.parse(JSON.stringify(x))).journals[0].text!=='Fixture')throw Error('Migration mismatch');});
  test('DOM IDs',()=>{const ids=$$('[id]').map(x=>x.id);if(new Set(ids).size!==ids.length)throw Error('Duplicate ID');});
  test('Image alternatives',()=>{if($$('img').some(im=>!im.hasAttribute('alt')))throw Error('Missing alt');});
  test('Control names',()=>{if($$('button').some(b=>!b.textContent.trim()&&!b.getAttribute('aria-label')&&!b.getAttribute('aria-labelledby')))throw Error('Unnamed button');});
  if(vault.available){try{await S.cryptoSelftest();checks.push({name:'Encryption round-trip',result:'PASS'});}catch(e){checks.push({name:'Encryption round-trip',result:'FAIL',detail:e.message});}}else checks.push({name:'Encryption round-trip',result:'SKIP · Web Crypto unavailable'});console.table(checks);return checks;
 }
 function recommend(){return c.advance.rank({budget:state.homeTime||store().preferences.time})[0]||null;}
 /** Public view, search and accessibility entry points. */
 S.search={run:search,execute:command};S.a11y={reducedMotion:c.reduced,help,focusMain:()=>$('#main').focus({preventScroll:true})};
 S.views={today,library,toolkit,infographics:gallery.render,me,support};S.router={parse,go,get current(){return route}};
 return {initialise,render,navigate:go,applyTheme,detail,search,preparePlayer,playerUpdated,persist:()=>vault.persist(),saveDraft:async text=>{const ok=await vault.saveDraft(text);c.draftStorageStatus(ok);return ok;},vault,player,recommend,exportDialog,importFile,help,scope,selftest,stopPlayer:()=>{player.stop();if($('#player-settings').open)$('#player-settings').close();},get route(){return route}};
};
})(globalThis.Serein=globalThis.Serein||{});
