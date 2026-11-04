const GR='linear-gradient(135deg,#10b981,#047857)', TEAL='linear-gradient(135deg,#14b8a6,#0f766e)', GOLD='linear-gradient(135deg,#d4a445,#9a7424)', NAVY='linear-gradient(135deg,#1e3a5f,#0b1f3a)';
const BASE='file://'+window.BASE+'/'+window.PROJ+'/cap/';
const FULL={wide:[0,0,1440],tall:[290,40,760]};
window.SPEC={
 brand:['Gulf Region Nursing','Healthcare Crown Academy'], hookShot:'sa-today', hookCam:{wide:[0,0,1440],tall:[290,40,760]}, revealScene:'reveal',
 theme:{b:['#062026','#0b3340','#0b2a2a'],g1:'rgba(20,184,166,.34)',g2:'rgba(212,164,69,.26)',hi:'#facc15'},
 note:'Original practice material, not official exam questions. Not endorsed by SCFHS, DHP, DHA or DOH.',
 cursorWindows:[[['qbank',-0.4],['tools',4.0]]],
 cta:{title:'Gulf Region Nursing<br><em>pass with reasoning, not memory</em>',pts:['Saudi · Qatar · Dubai · Abu Dhabi','1,297 reviewed practice questions','10 free questions per exam'],go:'Start free today →',url:'snle.healthcarecrownacademy.co.uk',fine:'Gulf Pass unlocks the full bank, mocks, tools and dossiers'},
 scenes:[
  {id:'hook',shots:[{at:-0.3,name:'sa-today'},{at:0.25,name:'qa-today'},{at:0.8,name:'du-today'},{at:1.35,name:'ad-today'},{at:1.9,name:'sa-today'}],
   cap:['**Four** Gulf licensing exams.','**One studio.**'],
   kin:[{at:-0.3,to:0.25,html:'<span style="color:#34d399">Saudi · SNLE</span>',size:[110,130],y:[330,190]},{at:0.25,to:0.8,html:'<span style="color:#f472b6">Qatar · DHP</span>',size:[110,130],y:[330,190]},{at:0.8,to:1.35,html:'<span style="color:#fcd34d">Dubai · DHA</span>',size:[110,130],y:[330,190]},{at:1.35,to:1.9,html:'<span style="color:#7dd3fc">Abu Dhabi · DOH</span>',size:[100,120],y:[330,190]},{at:1.95,html:'4 exams.<br><span style="color:#facc15">1 studio.</span>',size:[140,160],y:[300,150]}]},
  {id:'rn1',bubble:{who:'Nurse · sample',av:'RN',text:'I’m moving to the Gulf, and I don’t know where to start.',type:2.2,col:TEAL}},
  {id:'reveal',shots:[{at:-0.3,name:'sa-today'},{at:3.4,name:'qa-today',tr:'fade',d:0.35},{at:4.2,name:'du-today',tr:'fade',d:0.35},{at:5.0,name:'ad-today',tr:'fade',d:0.35},{at:6.2,name:'sa-today',tr:'fade',d:0.35}],
   cam:[{at:-0.3,r:FULL,d:0.01},{at:1.0,r:{wide:[280,40,1160],tall:[980,40,460]},d:1.6},{at:6.6,r:{wide:[280,380,1160],tall:[980,400,460]},d:1.6}],
   hl:[{at:7.2,to:'end',r:[987,410,424,430],color:'#facc15'}],
   head:['Gulf Region Nursing','4 exams,<br>1 studio'],headTo:'qbank',cap:['**Gulf Region Nursing.**','**Saudi Arabia, Qatar, Dubai and Abu Dhabi**,','each with its own **exam card**,','**daily pace** and **readiness map**.']},
  {id:'qbank',shots:[{at:-0.3,name:'qb0',tr:'pop',d:0.45},{at:1.5,name:'qb1'},{at:3.2,name:'qb2'}],cam:[{at:-0.3,r:{wide:[0,40,1440],tall:[40,60,720]},d:0.6},{at:3.4,r:{wide:[0,40,1440],tall:[880,100,520]},d:1.2}],
   cursor:[{at:0.3,to:[410,450],d:0.6,click:true},{at:2.4,to:[410,570],d:0.6,click:true}],
   hl:[{at:3.6,to:'end',r:[900,120,470,520],color:'#34d399'}],
   callouts:[{at:4.2,html:'Reasoning · clinical pearl · trap',bg:GR,sizeW:42,sizeT:46,yW:770,yT:1180}],
   head:['Question Bank','Why the safest<br>answer wins'],cap:['**Answer a question**,','and see **why the safest choice wins**.','With the **reasoning**, a **clinical pearl**,','and **the trap** to avoid.']},
  {id:'tools',shots:[{at:-0.3,name:'sa-tools',tr:'fade',d:0.4},{at:2.6,name:'sa-befast',tr:'pop',d:0.45}],cam:[{at:-0.3,r:{wide:[0,40,1440],tall:[280,320,560]},d:0.6},{at:2.6,r:{wide:[0,0,1440],tall:[120,140,760]},d:0.01}],
   cursor:[{at:0.6,to:[476,396],d:0.7,click:true}],
   hl:[{at:0.3,to:2.4,r:[293,340,366,112],color:'#facc15'},{at:3.4,to:'end',r:[843,504,457,142],color:'#34d399'}],
   callouts:[{at:0.4,to:2.5,html:'67 clinical decision tools',bg:GOLD,sizeW:44,sizeT:50,yW:770,yT:1180},{at:3.6,html:'Gulf Pass',bg:NAVY,sizeW:38,sizeT:42,yW:770,yT:1180}],
   head:['React & Interact','67 decision<br>tools'],cap:['**Sixty-seven** clinical decision tools,','like **BE-FAST** for stroke,','each with a **poster** and **coached practice**.']},
  {id:'more',shots:[{at:-0.3,name:'sa-dossier',tr:'fade',d:0.4},{at:2.4,name:'sa-hub',tr:'fade',d:0.4},{at:4.2,name:'sa-gloss',tr:'fade',d:0.4}],cam:[{at:-0.3,r:{wide:[0,0,1440],tall:[290,40,700]},d:0.6},{at:4.2,r:{wide:[280,40,1160],tall:[900,250,540]},d:0.01}],
   callouts:[{at:0.2,to:2.2,html:'35 specialty dossiers',bg:GOLD,sizeW:44,sizeT:50,yW:770,yT:1180},{at:2.5,to:4.0,html:'Tutor mock · timed simulation',bg:TEAL,sizeW:42,sizeT:46,yW:770,yT:1180},{at:4.4,html:'English ⇄ العربية',bg:GR,sizeW:46,sizeT:52,yW:770,yT:1180}],
   cap:['**Thirty-five** specialty dossiers.','**Timed mock exams.**','And a **bilingual glossary**,','in **English and Arabic**.']},
  {id:'compare',fx:[{at:-0.3,type:'compare',full:true,o:{color:'#14b8a6',step:0.55,rows:[['Right or wrong','Why the safest answer wins','pearl + trap on every question'],['One exam','Four Gulf exams','Saudi · Qatar · Dubai · Abu Dhabi'],['English only','Bilingual glossary','English and Arabic'],['Questions only','67 tools · 35 dossiers · 9 labs',''],['Study, study, study','Reset & Recharge','short resets for exam stress']]}}],
   cap:['So it’s **not just a question bank**.']},
  {id:'pass',fx:[{at:-0.2,type:'apps',full:true,o:{base:BASE,step:0.7,tiles:[{k:'medlex',n:'MedLex',c:'#60a5fa',b:'1,480 medical terms, by their parts'},{k:'carecraft',n:'Carecraft',c:'#5eead4',b:'a 60-second scenario a day'},{k:'lumen',n:'Lumen',c:'#a78bfa',b:'your sources, recall cards, focus'},{k:'serein',n:'Serein',c:'#34d399',tag:'FREE',b:'15 calming practices'}]}}],
   cap:['The **Gulf Pass** covers all four exams,','and includes **MedLex, Carecraft and Lumen**.','And **Serein** is free for everyone.']},
  {id:'rn2',bubble:{who:'Nurse · sample',av:'RN',text:'Now I know exactly where to start.',type:1.2,col:TEAL,yW:110,yT:600,xW:250,wW:820}},
  {id:'cta',cap:['Pass with **reasoning**, not memory.','**Start free today.**']}
 ]};
