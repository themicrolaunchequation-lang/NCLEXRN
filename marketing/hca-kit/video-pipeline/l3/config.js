const TM={wide:[700,60,760],tall:[1040,70,400]};
window.SPEC={
 brand:['Lumen','Healthcare Crown Academy'], hookShot:'f1', hookCam:TM, revealScene:'reveal',
 cursorWindows:[[['reveal',2.0],['reveal',5.0]],[['timer',-0.4],['timer',1.0]]],
 cta:{title:'Lumen<br><em>study smarter, in less time</em>',pts:['25-minute focus sessions','6 study methods','5-step learning loop'],go:'Try it free today →',url:'lumen.healthcarecrownacademy.co.uk',fine:'Healthcare Crown Academy'},
 scenes:[
  {id:'hook',cap:['You sat down to study for **two hours**.','You actually studied for','**twenty minutes**.'],
   kin:[{at:0,to:2.6,html:'2 hours?',size:[200,200],y:[330,160]},{at:2.7,html:'<span style="color:#f87171">20 minutes.</span>',size:[170,170],y:[350,170]}]},
  {id:'stu1',bubble:{who:'Nursing student',av:'NS',text:'My phone, my messages… I just can’t focus.',type:1.6,col:'linear-gradient(135deg,#8b5cf6,#5b21b6)'}},
  {id:'reveal',shots:[{at:-0.4,name:'day'},{at:4.2,name:'f0',tr:'pop',d:0.5}],cam:[{at:-0.4,r:{wide:[90,0,1260],tall:[100,40,560]},d:0.01},{at:4.2,r:TM,d:0.8}],
   cursor:[{at:2.6,to:[160,182],d:0.8,click:true}],
   head:['Lumen · focus','Stay in<br>the zone'],headTo:'timer',cap:['Lumen keeps you **in the zone**.','Open a **focus session**','from your My Day page.']},
  {id:'timer',shots:[{at:0.9,name:'f1'},{at:3.2,name:'f2'}],cam:[{at:-0.3,r:TM,d:0.4}],
   cursor:[{at:-0.3,to:[1145,155],d:0.6,click:true}],
   callouts:[{at:3.6,html:'Focus sounds<small>soft rain · brown noise · pink noise</small>',bg:'linear-gradient(135deg,#8b5cf6,#5b21b6)',sizeW:44,sizeT:48,yW:700,yT:1180}],
   cap:['**Twenty-five minutes.**','**One clear goal.**','Then a **short break**.','Add **soft rain** or brown noise if it helps.']},
  {id:'methods',shots:[{at:-0.4,name:'m0',tr:'fade',d:0.45}],cam:[{at:-0.4,r:{wide:[90,40,1260],tall:[330,60,620]},d:0.01},{at:0.4,r:{wide:[270,40,1080],tall:[330,60,620]},d:2}],
   head:['Learning Atelier','6 study<br>methods'],headTo:'cards',cap:['Not sure **how to study**?','The **Methods** page explains','**six proven ways**, simply.']},
  {id:'loop',cam:[{at:-0.2,r:{wide:[280,200,1080],tall:[330,280,620]},d:0.8}],

   callouts:[{at:1.2,html:'Read → Explain → Recall → Verify → Return',bg:'linear-gradient(135deg,#10b981,#047857)',sizeW:42,sizeT:40,yW:700,yT:1180}],
   cap:['A **five-step learning loop**.','**Read. Explain. Recall.**','**Verify. Return.**']},
  {id:'cards',shots:[{at:-0.4,name:'m1',tr:'fade',d:0.45}],cam:[{at:-0.4,r:{wide:[270,20,1100],tall:[330,40,620]},d:0.8},{at:3,r:{wide:[270,150,1100],tall:[880,40,560]},d:3}],
   cap:['**Active recall.** **Explain it back.**','**Compare concepts.** **Spaced return.**','Each with a **tool to try**.']},
  {id:'stu2',bubble:{who:'Nursing student',av:'NS',text:'Twenty-five focused minutes beat two distracted hours.',type:1.8,col:'linear-gradient(135deg,#8b5cf6,#5b21b6)',yW:110,yT:600,xW:250,wW:1000}},
  {id:'cta',cap:['**Study smarter**,','in less time.','**Try it free** today.']}
 ]};
