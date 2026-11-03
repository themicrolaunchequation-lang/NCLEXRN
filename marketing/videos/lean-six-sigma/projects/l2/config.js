const k=0.766, S=(x,y,w,h)=>[(x-20)*k,(y-107)*k,w*k,h*k], CS=(x,y,w)=>[(x-20)*k,(y-107)*k,w*k];
const G='linear-gradient(135deg,#f59e0b,#b45309)', TEAL='linear-gradient(135deg,#14b8a6,#0f766e)', NAVY='linear-gradient(135deg,#1e40af,#0b1f3a)', GR='linear-gradient(135deg,#10b981,#047857)';
window.SPEC={
 brand:['Lean Six Sigma','Healthcare Crown Academy'], hookShot:'p5', hookCam:{wide:CS(505,300,1185),tall:CS(1050,640,600)}, revealScene:'reveal',
 cursorWindows:[[['studio',0],['studio','voend']]],
 cta:{title:'Lean Six Sigma<br><em>Swimlane Process Map</em>',pts:['30 DMAIC tools','Studio posters and metaphors','Built for healthcare'],go:'Try it free today →',url:'lss.healthcarecrownacademy.co.uk',fine:'Healthcare Crown Academy · process shown is an illustrative example'},
 scenes:[
  {id:'hook',cap:['A blood sample is **collected in minutes**.','So why does the result **take so long**?','**Where does the time go?**'],
   kin:[{at:0,to:2.4,html:'Collected <span style="color:#5eead4">fast</span>.',size:[130,150],y:[330,180]},{at:2.6,html:'Result… <span style="color:#f87171">where?</span>',size:[140,160],y:[330,180]}]},
  {id:'mgr1',bubble:{who:'Ward manager · sample',av:'WM',text:'Everyone says they did their part. Nobody can see the gaps.',type:2.4,col:TEAL}},
  {id:'reveal',shots:[{at:-0.3,name:'p5'}],cam:[{at:-0.3,r:[0,0,1440],d:0.01},{at:0.8,r:{wide:CS(505,160,1185),tall:CS(515,160,1180)},d:1.8}],
   hl:[{at:1.8,to:'end',r:S(530,175,910,120),color:'#facc15'}],
   head:['Swimlane map','Who does what,<br>where work waits'],cap:['Draw a **swimlane map**.','Show **who does what**,','and **where work waits**.']},
  {id:'lanes',fx:[{at:-0.2,toScene:'decide',to:3.0,type:'swim',full:true,o:{start:3.4,run:14.8,wait:4,waitMin:40}}],
   head:['Follow the specimen','4 lanes,<br>every handoff'],headTo:'decide',cap:['**One lane per role.**','Patient, collection staff,','transport, **laboratory**.','Follow the specimen','across **every handoff**.']},
  {id:'wait',callouts:[{at:1.2,html:'Waiting queue<small>a gap between two lanes</small>',bg:G,sizeW:42,sizeT:48,yW:60,yT:1180}],
   cap:['And there it is.','The **waiting queue** at lab receiving.','Not anyone’s fault.','Just a **gap between two lanes**.']},
  {id:'decide',shots:[{at:3.0,name:'p5'}],cam:[{at:3.0,r:{wide:CS(700,540,990),tall:CS(1050,600,600)},d:0.01}],
   hl:[{at:4.4,to:'end',r:S(1080,833,155,128),color:'#facc15'}],
   callouts:[{at:4.6,html:'Yes → test · No → back',bg:GR,sizeW:42,sizeT:48,yW:770,yT:1180}],
   cap:['**Identifiers complete?**','**Yes**, testing starts.','**No**, and the specimen goes back.','Every **loop** shows up on the map.']},
  {id:'studio',cam:[{at:-0.3,r:{wide:CS(20,150,1180),tall:CS(25,150,520)},d:1.0}],
   cursor:[{at:0.6,to:[S(60,412,1,1)[0]+60,S(60,412,1,1)[1]+8],d:0.6},{at:4.8,to:[S(60,503,1,1)[0]+60,S(60,503,1,1)[1]+8],d:0.6}],
   hl:[{at:0.9,to:4.6,r:S(30,402,268,40),color:'#5eead4'},{at:5.1,to:'end',r:S(30,484,268,40),color:'#5eead4'}],
   head:['The Studio','Posters, metaphors<br>and more'],cap:['And the **Studio** goes further:','**SIPOC versus swimlane**','versus **value stream map**,','plus a poster on **waste and delay points**.']},
  {id:'mgr2',bubble:{who:'Ward manager · sample',av:'WM',text:'So we fix the handoff, not the people.',type:1.2,col:TEAL,yW:110,yT:600,xW:250,wW:820}},
  {id:'cta',cap:['**Map the work. See the wait.**','**Try it free today.**']}
 ]};
