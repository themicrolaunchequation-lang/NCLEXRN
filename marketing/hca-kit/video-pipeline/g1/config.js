const Q={wide:[270,40,1170],tall:[300,160,1120]};
window.SPEC={
 note:'Original practice material, not official exam questions. Not endorsed by SCFHS, DHP, DHA or DOH.',
 brand:['Gulf Region Nursing','Healthcare Crown Academy'], hookShot:'q3', hookCam:{wide:[300,250,1100],tall:[330,330,780]}, revealScene:'reveal',
 cursorWindows:[[['pick',-0.4],['repair',0.4]]],
 cta:{title:'Gulf Region Nursing<br><em>Saudi · Qatar · Dubai · Abu Dhabi</em>',pts:['Reasoning on every question','67 clinical decision tools','English + Arabic glossary'],go:'Try it free today →',url:'snle.healthcarecrownacademy.co.uk',fine:'Original practice material, not official exam questions. Not endorsed by SCFHS, DHP, DHA or DOH.'},
 scenes:[
  {id:'hook',cap:['Getting a licensing question **wrong**','is the **fastest way to learn**.','If someone shows you **why**.'],
   kin:[{at:0,to:3.0,html:'<span style="color:#f87171">✗ Wrong?</span>',size:[200,200],y:[320,160]},{at:3.1,html:'Good. Here’s why.',size:[120,130],y:[380,190],color:'#5eead4'}]},
  {id:'nur1',bubble:{who:'Nurse · exam candidate',av:'EC',text:'I keep missing the priority questions, and I don’t know why.',type:1.8,col:'linear-gradient(135deg,#0d9488,#115e59)'}},
  {id:'reveal',shots:[{at:-0.4,name:'home'}],cam:[{at:-0.4,r:[0,0,1440],d:0.01},{at:1.0,r:{wide:[0,0,1440],tall:[0,40,760]},d:3}],
   head:['Gulf licensing exams','Four exams,<br>one studio'],headTo:'q',cap:['**Gulf Region Nursing.**','Practice for **Saudi Arabia**, **Qatar**,','**Dubai** and **Abu Dhabi**','licensing exams.']},
  {id:'q',shots:[{at:-0.3,name:'q0',tr:'pop',d:0.5}],cam:[{at:-0.3,r:Q,d:0.01},{at:1.0,r:{wide:[300,100,1100],tall:[310,180,1060]},d:3}],
   cap:['Start a **quick check**.','A trauma patient has **gurgling respirations**','and **blood in the mouth**.','What’s **most appropriate**?']},
  {id:'pick',shots:[{at:0.2,name:'q1'}],cam:[{at:-0.3,r:{wide:[300,100,1100],tall:[310,180,1060]},d:0.6}],
   cursor:[{at:-0.3,to:[850,656],d:0.6,click:true}],
   bubble:{who:'Nurse · exam candidate',av:'EC',text:'Check both legs for deformity first?',type:1.0,col:'linear-gradient(135deg,#0d9488,#115e59)',yW:120,xW:250,wW:900,yT:600}},
  {id:'repair',shots:[{at:0.4,name:'q2'},{at:2.6,name:'q3',tr:'fade',d:0.45}],cam:[{at:0.4,r:{wide:[270,40,1170],tall:[300,250,1120]},d:0.5},{at:2.6,r:{wide:[300,250,1100],tall:[330,330,780]},d:1}],
   cursor:[{at:-0.6,to:[1342,764],d:0.5,click:true}],
   callouts:[{at:2.8,html:'Airway first<small>suction + cervical-spine precautions</small>',bg:'linear-gradient(135deg,#ef4444,#b91c1c)',sizeW:46,sizeT:50,yW:700,yT:1180}],
   head:['Instant feedback','Repair the<br>reasoning'],headTo:'why',cap:['**Not yet.** Repair the reasoning.','**Clear the airway** with suction,','while protecting the **cervical spine**.']},
  {id:'why',shots:[{at:-0.3,name:'q4',tr:'fade',d:0.4}],cam:[{at:-0.3,r:{wide:[300,280,1100],tall:[330,330,780]},d:0.8},{at:4,r:{wide:[300,380,1100],tall:[330,420,780]},d:3}],
   cap:['Every question shows **why the safest answer wins**,','a **clinical pearl**,','and the **trap to avoid**.','Treat the **earliest unresolved life threat** first.']},
  {id:'nur2',bubble:{who:'Nurse · exam candidate',av:'EC',text:'Airway first. I won’t forget that again.',type:1.2,col:'linear-gradient(135deg,#0d9488,#115e59)',yW:110,yT:600,xW:250,wW:900}},
  {id:'cta',cap:['Learn the **reasoning**','behind every answer.','**Try it free** today.']}
 ]};
