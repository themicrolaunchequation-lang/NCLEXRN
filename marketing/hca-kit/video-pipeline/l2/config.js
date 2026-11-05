const CARD={wide:[180,60,1080],tall:[420,70,600]};
window.SPEC={
 brand:['Lumen','Healthcare Crown Academy'], hookShot:'c1', hookCam:CARD, revealScene:'reveal',
 cursorWindows:[[['reveal',2.4],['reveal',6.0]],[['a',-0.4],['a',4.0]],[['next',-0.4],['next',1.0]]],
 cta:{title:'Lumen<br><em>remember what you study</em>',pts:['Recall cards that adapt','Linked to your sources','Private, on your device'],go:'Try it free today →',url:'lumen.healthcarecrownacademy.co.uk',fine:'Healthcare Crown Academy · original learning samples'},
 scenes:[
  {id:'hook',cap:['Most of what you study today,','you’ll **forget by next week**.','Unless you **test yourself**','at the **right moment**.'],
   kin:[{at:0,to:4.0,html:'Forgotten by<br><span style="color:#f87171">next week?</span>',size:[120,120],y:[300,140]},{at:4.2,html:'Unless…',size:[170,170],y:[380,190],color:'#ffd166'}]},
  {id:'stu1',bubble:{who:'Nursing student',av:'NS',text:'But how do I know when to review?',type:1.2,col:'linear-gradient(135deg,#8b5cf6,#5b21b6)'}},
  {id:'reveal',shots:[{at:-0.4,name:'st0'},{at:3.4,name:'st1',tr:'fade',d:0.4}],cam:[{at:-0.4,r:{wide:[90,0,1260],tall:[110,60,700]},d:0.01},{at:3.4,r:{wide:[90,0,1260],tall:[110,180,700]},d:1.2}],
   cursor:[{at:2.6,to:[175,152],d:0.7,click:true}],
   callouts:[{at:5.0,html:'19 starter cards<small>source-linked</small>',bg:'linear-gradient(135deg,#8b5cf6,#5b21b6)',sizeW:46,sizeT:52,yW:700,yT:1180}],
   head:['Lumen · study studio','Recall<br>cards'],headTo:'q',cap:['Lumen’s **study studio**','does **the timing** for you.','Add a **starter collection**,','linked to your sources.']},
  {id:'q',shots:[{at:-0.3,name:'c0',tr:'pop',d:0.5}],cam:[{at:-0.3,r:CARD,d:0.01},{at:1,r:{wide:[230,110,1000],tall:[420,140,600]},d:3}],
   head:['Think first','A moment to<br>remember'],headTo:'sched',cap:['**A moment to remember.**','Which side of the heart supplies','the **pulmonary circulation**?','**Think first.**']},
  {id:'a',shots:[{at:0.9,name:'c1',tr:'pop',d:0.5}],cam:[{at:0.9,r:CARD,d:0.6}],
   cursor:[{at:-0.3,to:[700,505],d:0.6,click:true},{at:2.6,to:[720,760],d:0.6,click:true}],
   cap:['Then **reveal**.','**The right side of the heart.**','**Rate** how well you knew it.']},
  {id:'sched',cam:[{at:-0.2,r:{wide:[230,380,980],tall:[430,400,580]},d:1}],
   hl:[{at:0.4,to:'end',r:[460,580,520,110],color:'#ffd166'}],
   callouts:[{at:2.5,html:'Adaptive schedule<small>back just before you forget</small>',bg:'linear-gradient(135deg,#6366f1,#4338ca)',sizeW:46,sizeT:52,yW:700,yT:1180}],
   cap:['The **schedule adapts**.','**Easy** cards come back later.','**Tricky** ones return sooner,','just before you forget.']},
  {id:'next',shots:[{at:-0.3,name:'c2',tr:'fade',d:0.35},{at:3.0,name:'c3',tr:'pop',d:0.5}],cam:[{at:-0.3,r:CARD,d:0.6}],
   cursor:[{at:2.0,to:[700,505],d:0.6,click:true}],
   cap:['Next card.','**Cardiac output** equals','**heart rate times stroke volume**.','Every answer **links back to its page**.']},
  {id:'stu2',bubble:{who:'Nursing student',av:'NS',text:'Ten minutes a day. And it actually sticks.',type:1.4,col:'linear-gradient(135deg,#8b5cf6,#5b21b6)',yW:110,yT:600,xW:250,wW:900}},
  {id:'cta',cap:['**Remember what you study.**','**Try it free** today.']}
 ]};
