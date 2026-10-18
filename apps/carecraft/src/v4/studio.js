/* Learning Studio for Carecraft: each lesson becomes a slide journey (hca-studio.js) with an annotation toolkit.
   It reads the same lesson, worked-example, question-bank and infographic data as the lesson page and writes answers,
   reflections and actions back through the same stores, so Smart Review and My Growth stay in step. */
const CC_STUDIO_APP='carecraft',CC_STUDIO_SLIDES=14;
function ccStudioReady(){return typeof HCAStudio!=='undefined'&&typeof CC_REGIONS!=='undefined';}
function ccStudioGated(id){try{const H=window.HCA||{};if(H.locked&&H.locked('carecraft')&&window.CC_FREE&&!CC_FREE.lessons.includes(id)){setTimeout(()=>H.paywall('carecraft','this lesson'));return true;}}catch{}return false;}
function ccSentences(text){return (String(text).match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g)||[String(text)]).map(s=>s.trim()).filter(Boolean);}
/* One idea per slide: the line worth quoting becomes the pull card, the rest is the explanation. */
function ccIdeaSlide(l,i){
 const [title,text]=l.steps[i],sent=ccSentences(text);let pull='',rest=sent;
 if(sent.length>1){const q=sent.findIndex(s=>/[“"]/.test(s)),k=q>=0?q:sent.length-1;pull=sent[k];rest=sent.filter((_,n)=>n!==k);}
 return {id:'idea'+(i+1),type:'idea',eyebrow:`Idea ${i+1} of ${l.steps.length}`,n:i+1,rail:l.steps.map(x=>x[0]),title,body:rest[0]||text,more:rest.slice(1).join(' '),pull,
  cards:i===l.steps.length-1&&P2_DATA.examples[l.id]?[{icon:'target',label:'One action to practise',text:P2_DATA.examples[l.id].action}]:[]};
}
function ccVisualSlide(l,n){
 const p=infographicPages(l)[n-1],R=CC_REGIONS[l.id]&&CC_REGIONS[l.id][String(n)];
 const intro=[l.description,'A fictional example from '+l.tag.toLowerCase()+'. Notice what changes between a weaker and a stronger response.',l.takeaway][n-1];
  const regions=R?[{label:['The big picture','A fictional example','Carry it forward'][n-1],text:intro,rect:R?[0,Math.max(0,R.hero[1]-.008),1,R.hero[3]+.016]:[0,0,1,1]},...R.blocks.map((b,i)=>({label:(p.blocks[i]||{}).title||'Section '+(i+1),text:(p.blocks[i]||{}).text||'',rect:b})),{label:'In short',text:p.footer,rect:R.footer}]:[{label:p.title,text:intro,rect:[0,0,1,1]}];
 return {id:'vis'+n,type:'visual',nav:`${p.label}: ${n===1?'the whole picture':p.title}`,eyebrow:`Visual guide ${n} of 3 · ${p.label}`,title:p.title,img:infoURI(l,n-1),alt:`${l.title}: ${p.label}. The full text of this poster is available below the tour.`,aspect:R?R.size[0]/R.size[1]:.55,regions,
  blocks:[{title:p.title,text:p.lead},...p.blocks,{title:'In short',text:p.footer}],download:`carecraft-${l.id}-${n}`};
}
function ccCheckSlide(l,k){
 const q=HCA_BANK[l.id][k],map=hcaAnswerMaps[q.id]||(hcaAnswerMaps[q.id]=hcaShuffle(q.answers.length));
 return {id:'chk'+(k+1),type:'check',eyebrow:`Check ${k+1} of 3`,question:q.question,hint:k===0?'Pick the response you would most want to give. There is no penalty, and every option teaches something.':'',options:map.map(i=>q.answers[i]),correct:map.indexOf(q.correct),rationales:map.map(i=>q.rationales[i]),takeaway:q.rationales[q.correct],qid:q.id,map};
}
function ccNextLesson(id){const i=lessons.findIndex(l=>l.id===id);return lessons[(i+1)%lessons.length];}
function ccStudioDeck(id){
 const l=lessons.find(x=>x.id===id);if(!l||!ccStudioReady()||!HCA_BANK[id])return null;
 const ex=P2_DATA.examples[id],notes=LESSON_NOTES[id]||[],cat=l.cat[0].toUpperCase()+l.cat.slice(1),nxt=ccNextLesson(id),plan=state.actions.find(a=>a.lesson===id&&a.status==='planned');
 const slides=[
  {id:'cover',type:'cover',kicker:`${cat} · ${l.tag}`,title:l.title,subtitle:l.description,meta:[{icon:'clock',text:l.time+' min'},{icon:'layers',text:CC_STUDIO_SLIDES+' slides'},{icon:'target',text:'3 checks'},{icon:'image',text:'3 visual guides'}],
   outcomes:[l.outcome||'Explain '+l.tag.toLowerCase()+' using a clear principle and a worked example.','Recognise a less helpful response and explain a stronger alternative.','Choose one action to rehearse within your role and local policy.'],art:{src:infoURI(l,0),alt:`Preview of the ${l.title} visual guide`}},
  ccIdeaSlide(l,0),ccIdeaSlide(l,1),ccIdeaSlide(l,2),
  ccVisualSlide(l,1),ccCheckSlide(l,0),
  {id:'notes',type:'notes',eyebrow:'Deeper reading',title:'What to notice and carry forward',lead:'Two short notes to read slowly, with a pen if you like.',items:notes.map((t,i)=>({label:i===0?'Notice':'Use it',text:t})),chips:(CC_USE[id]||[]).map((t,i)=>({label:i===0?'Who it helps':'Use it when',text:t}))},
  {id:'cmp',type:'compare',eyebrow:'Fictional worked example',title:'Notice the difference.',situation:ex.situation,left:{label:'Needs improvement',text:ex.poor},right:{label:'Stronger approach',text:ex.good},why:ex.why},
  ccVisualSlide(l,2),ccCheckSlide(l,1),ccVisualSlide(l,3),ccCheckSlide(l,2),
  {id:'reflect',type:'reflect',eyebrow:'Make it yours',prompt:l.reflect,hint:'One honest sentence is enough. It stays on this device.',action:ex.action,saveLabel:'Save reflection and action',
   initial:{text:state.reflections[id]||'',action:plan?plan.text:ex.action,dueDays:3}},
  {id:'recap',type:'recap',takeaway:l.takeaway,points:l.steps.map(s=>s[0]),finishLabel:'Mark lesson as reviewed',full:'Open the full lesson page',onFull:()=>openLesson(id),next:{label:'Next: '+nxt.title,open:()=>openStudio(nxt.id,{start:0})}}
 ];
 return {app:CC_STUDIO_APP,id,title:l.title,kicker:`Learning Studio · ${cat} · ${l.tag}`,accent:'#0F8A86',accentDark:'#0A7C78',accentLight:'#6FD0C5',secPerSlide:Math.max(25,Math.round(l.time*60/CC_STUDIO_SLIDES)),slides,
  canFinish:s=>state.checkRecords.some(r=>r.lesson===id)||s.answered?null:'Answer at least one check to record this lesson as reviewed.',
  onCheck:(slide,choice,correct)=>{
   state.checkRecords.push({lesson:id,questionId:slide.qid,answerId:slide.qid+'-answer-'+slide.map[choice],choice,correct,date:new Date().toISOString()});
   const old=state.reviewQueue[id],streak=correct?Math.min(5,(old?.streak||0)+1):0;state.reviewQueue[id]={due:laterDay(correct?[1,3,7,14,30][Math.max(0,streak-1)]:1),streak};persist();
  },
  onReflect:(slide,rf)=>{
   state.reflections[id]=rf.text||'';const text=(rf.action||'').trim();
   if(text){const due=laterDay(rf.dueDays||3),ex2=state.actions.find(a=>a.lesson===id&&a.status==='planned');if(ex2){ex2.text=text;ex2.due=due;}else state.actions.push({id:'action-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),lesson:id,text,due,status:'planned',created:new Date().toISOString(),review:''});delete state.toolDrafts['action-'+id];}
   persist();
  },
  onComplete:()=>{
   if(!state.completed.includes(id))state.completed.push(id);persist();
   if(currentPage==='lesson'&&activeLesson&&activeLesson.id===id)ui.completion=id;
   return 'Lesson reviewed. One useful step, done.';
  },
  onClose:()=>{try{if(['library','saved','dashboard','lesson'].includes(currentPage))render();const b=document.querySelector(`[data-action=studio][data-arg0="${id}"]`);b&&b.focus({preventScroll:true});}catch{}}};
}
function openStudio(id,opts){
 if(ccStudioGated(id))return;const deck=ccStudioDeck(id);if(!deck){toast('The studio is unavailable for this lesson. Open the lesson page instead.');return;}
 try{captureDraft();stopSpeech();if($('#modal')?.open)closeModal(true);toggleMenu(false);}catch{}
 return HCAStudio.open(deck,opts||{});
}
function studioProgress(id){try{return ccStudioReady()?HCAStudio.progress(CC_STUDIO_APP,id):{started:false,last:0,done:false,total:0,visited:0,pct:0};}catch{return{started:false,last:0,done:false,total:0,visited:0,pct:0};}}
/* "Slides" control on a lesson card: label and meter say where you are */
function studioCardButton(l){
 const p=studioProgress(l.id),label=p.done?'Replay as slides':p.started&&p.last>0?`Resume slides · ${Math.min(p.last+1,CC_STUDIO_SLIDES)}/${CC_STUDIO_SLIDES}`:'Learn as slides';
 return `<button type="button" class="cs-card-btn${p.done?' is-done':''}" data-action="studio" data-arg0="${l.id}" data-arg1="${p.started&&!p.done?p.last:0}" aria-label="${esc(label)}: ${esc(l.title)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${p.done?'M5 12.5l4.5 4.5L19 7':'M7 4l13 8-13 8z'}"/></svg><span>${esc(label)}</span><i class="cs-meter" aria-hidden="true"><b style="width:${p.done?100:p.pct}%"></b></i></button>`;
}
/* Learn page intro: invites the learner into the studio and resumes where they left off */
function studioIntroActions(){
 if(!ccStudioReady())return '';
 const rows=lessons.map(l=>({l,p:studioProgress(l.id)})),live=rows.filter(r=>r.p.started&&!r.p.done&&r.p.last>0).sort((a,b)=>b.p.at-a.p.at)[0],fresh=rows.find(r=>!r.p.started&&!state.completed.includes(r.l.id))||rows.find(r=>!r.p.done)||rows[0];
 const main=live?{l:live.l,start:live.p.last,label:`Resume · ${live.l.title}`,sub:`Slide ${Math.min(live.p.last+1,CC_STUDIO_SLIDES)} of ${CC_STUDIO_SLIDES}`}:{l:fresh.l,start:0,label:`Start with ${fresh.l.title}`,sub:`${fresh.l.time} min · ${CC_STUDIO_SLIDES} slides`};
 return `<div class="cs-intro-cta"><button type="button" class="cs-cta" data-action="studio" data-arg0="${main.l.id}" data-arg1="${main.start}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg><span><b>${esc(main.label)}</b><small>${esc(main.sub)}</small></span></button><ul class="cs-tools" aria-label="Studio tools"><li>Pen</li><li>Highlighter</li><li>Marker</li><li>Shapes</li><li>Text</li><li>Laser</li><li>Undo</li><li>Clear all</li></ul></div>`;
}
function studioIntroStats(){const done=lessons.filter(l=>studioProgress(l.id).done).length;return `<strong>30 <small>slide journeys</small></strong><strong>90 <small>visual pages to tour</small></strong><strong>${done} <small>journeys completed</small></strong>`;}
/* Lesson page: a launch card above the reading */
function studioLessonCard(l){
 const p=studioProgress(l.id),verb=p.done?'Replay as slides':p.started&&p.last>0?'Resume the slides':'Learn it as slides';
 return `<section class="cs-launch" aria-label="Learning Studio"><div class="cs-launch-copy"><span class="eyebrow">LEARNING STUDIO</span><h3>${esc(p.done?'Revisit this lesson as a slide journey.':'Prefer a guided slideshow?')}</h3><p>${CC_STUDIO_SLIDES} slides: three ideas, a spotlight tour of the infographics, a worked example and three checks. Annotate with a pen, highlighter or shapes. ${p.started&&!p.done?`You are on slide ${Math.min(p.last+1,CC_STUDIO_SLIDES)}.`:''}</p></div><button type="button" class="cs-cta" data-action="studio" data-arg0="${l.id}" data-arg1="${p.started&&!p.done?p.last:0}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg><span><b>${verb}</b><small>${l.time} min · ${CC_STUDIO_SLIDES} slides</small></span></button></section>`;
}
