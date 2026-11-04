const BASE='file://'+window.BASE+'/'+window.PROJ+'/cap/'; const CB='linear-gradient(135deg,#d4a445,#0b1220)', NAVY='linear-gradient(135deg,#1e3a5f,#0b1f3a)';
window.SPEC={
 brand:['Gulf Region Nursing','DUBAI · DHA RN'], hookShot:'du-today', hookCam:{wide:[0,0,1440],tall:[290,40,760]}, revealScene:'reveal',
 theme:{"b": ["#211705", "#3d2c0c", "#2e2108"], "g1": "rgba(234,179,8,.34)", "g2": "rgba(251,191,36,.22)", "hi": "#fde68a"},
 note:'Original practice material, not official exam questions. Not endorsed by SCFHS, DHP, DHA or DOH.',
 cursorWindows:[[['run',-0.3],['run',3.0]]],
 cta:{title:'DHA RN preparation<br><em>built for Dubai</em>',pts:['150 questions · 3 hours','Reasoning on every question','10 free questions'],go:'Start free today →',url:'snle.healthcarecrownacademy.co.uk',fine:'Gulf Pass unlocks the full bank, mocks, tools and dossiers · exam details checked 23 Oct 2026, confirm with the regulator'},
 scenes:[
  {id:'hook',fx:[{at:-0.2,to:'end',type:'exam',full:true,o:{color:'#d4a445',tag:'DUBAI · DHA RN',name:'Dubai DHA Registered Nurse Assessment',items:[["QUESTIONS", 150, ""], ["TIME", 3, " hours"], ["PASS MARK", 50, "%"], ["ATTEMPTS", "3 across UAE"]]}}],cap:['**DHA RN.** One hundred and fifty questions.','**Three hours.** Are you ready?']},
  {id:'rn1',bubble:{who:'Nurse · sample',av:'RN',text:'I have my exam date. Where do I begin?',type:1.6,col:CB}},
  {id:'reveal',shots:[{at:-0.3,name:'du-today'}],cam:[{at:-0.3,r:{wide:[0,0,1440],tall:[290,40,760]},d:0.01},{at:1.2,r:{wide:[280,30,1160],tall:[700,150,500]},d:1.6}],
   hl:[{at:2.2,to:'end',r:[741,172,209,131],color:'#fde68a'}],
   head:['DUBAI · DHA RN','Set your date.<br>Get a pace.'],cap:['**Gulf Region Nursing**, Dubai edition.','Set your **exam date**,','and the studio suggests a **daily pace**.']},
  {id:'run',shots:[{at:-0.3,name:'qb1',tr:'pop',d:0.4},{at:1.0,name:'qb2'},{at:2.2,name:'du-hub',tr:'fade',d:0.3},{at:3.6,name:'du-befast',tr:'pop',d:0.4},{at:5.6,name:'du-dossier',tr:'fade',d:0.3},{at:7.2,name:'du-gloss',tr:'fade',d:0.3},{at:9.0,name:'du-today',tr:'fade',d:0.3}],
   cam:[{at:-0.3,r:{wide:[0,40,1440],tall:[640,90,760]},d:0.5},{at:2.2,r:{wide:[0,0,1440],tall:[290,40,760]},d:0.01},{at:3.6,r:{wide:[0,0,1440],tall:[120,140,760]},d:0.01},{at:5.6,r:{wide:[0,0,1440],tall:[290,40,760]},d:0.01},{at:7.2,r:{wide:[280,40,1160],tall:[900,250,540]},d:0.01},{at:9.0,r:{wide:[560,330,880],tall:[960,400,480]},d:0.01}],
   cursor:[{at:0.1,to:[410,570],d:0.5,click:true}],
   callouts:[{at:0.3,to:2.1,html:'Why the safest answer wins',bg:CB,sizeW:42,sizeT:46,yW:770,yT:1180},{at:2.3,to:3.5,html:'Tutor mock · timed simulation',bg:CB,sizeW:42,sizeT:46,yW:770,yT:1180},{at:3.8,to:5.5,html:'67 decision tools · Gulf Pass',bg:NAVY,sizeW:42,sizeT:46,yW:770,yT:1180},{at:5.7,to:7.1,html:'35 specialty dossiers',bg:CB,sizeW:42,sizeT:46,yW:770,yT:1180},{at:7.3,to:8.9,html:'English ⇄ العربية',bg:CB,sizeW:44,sizeT:50,yW:770,yT:1180},{at:9.1,html:'Readiness map',bg:CB,sizeW:44,sizeT:50,yW:770,yT:1180}],
   head:['In one studio','Practise with<br>reasoning'],cap:['**Reasoning** on every question.','**Timed mocks.**','**Decision tools**, like BE-FAST.','**Clinical dossiers.**','A **bilingual glossary**.','And a **readiness map** that shows','what to practise next.']},
  {id:'compare',fx:[{at:-0.3,type:'compare',full:true,o:{color:'#d4a445',step:0.5,rows:[['Right or wrong','Why the safest answer wins','pearl + trap on every question'],['One exam','Four Gulf exams','your DHA RN plus three more'],['English only','Bilingual glossary','English and Arabic'],['Questions only','67 tools · 35 dossiers · 9 labs',''],['Study, study, study','Reset & Recharge','short resets for exam stress']]}}],cap:['**Not just a question bank.**']},
  {id:'pass',fx:[{at:-0.2,type:'apps',full:true,o:{base:BASE,step:0.5,tiles:[{k:'medlex',n:'MedLex',c:'#60a5fa',b:'1,480 medical terms, by their parts'},{k:'carecraft',n:'Carecraft',c:'#5eead4',b:'a 60-second scenario a day'},{k:'lumen',n:'Lumen',c:'#a78bfa',b:'your sources, recall cards, focus'},{k:'serein',n:'Serein',c:'#34d399',tag:'FREE',b:'15 calming practices'}]}}],
   cap:['The **Gulf Pass** includes','**MedLex, Carecraft and Lumen**.','And **Serein** is free.']},
  {id:'cta',cap:['**DHA RN** preparation, built for **Dubai**.','**Start free today.**']}
 ]};
