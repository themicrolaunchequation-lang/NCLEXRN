const PG={wide:[280,150,1140],tall:[330,170,720]};
window.SPEC={
 brand:['Serein','Healthcare Crown Academy'], hookShot:'big', hookCam:{wide:[230,30,1000],tall:[420,100,600]}, revealScene:'reveal',
 cursorWindows:[[['flip',-0.3],['flip',3.8]],[['big',-0.8],['big',0.2]]],
 cta:{title:'Serein<br><em>make room for you</em>',pts:['12 illustrated guides','15 short practices','Support one tap away'],go:'Try it free today →',url:'serein.healthcarecrownacademy.co.uk',fine:'Healthcare Crown Academy · wellbeing support, not medical treatment'},
 scenes:[
  {id:'hook',cap:['Does a **ten-minute break**','really make a difference?','The research says **it can**.'],
   kin:[{at:0,to:3.0,html:'10 minutes.',size:[170,170],y:[340,170]},{at:3.1,html:'Does it <span style="color:#5eead4">matter?</span>',size:[130,130],y:[380,190]}]},
  {id:'nur1',bubble:{who:'Staff nurse',av:'SN',text:'I always feel guilty taking a break.',type:1.3,col:'linear-gradient(135deg,#14b8a6,#0f766e)'}},
  {id:'reveal',shots:[{at:-0.5,name:'a0'}],cam:[{at:-0.5,r:[0,0,1440],d:0.01},{at:1.0,r:{wide:[270,140,1150],tall:[280,330,640]},d:2.4}],
   head:['Serein · Visual Atlas','12 illustrated<br>guides'],headTo:'pressure',cap:['Serein’s **Visual Atlas**.','**Twelve illustrated guides**','for real working days.']},
  {id:'pressure',shots:[{at:-0.3,name:'a1',tr:'fade',d:0.4}],cam:[{at:-0.3,r:PG,d:0.8},{at:3.0,r:{wide:[620,130,840],tall:[620,170,720]},d:1.5}],
   callouts:[{at:3.6,html:'16% of working-age adults<small>WHO estimate, 2023</small>',bg:'linear-gradient(135deg,#6366f1,#4338ca)',sizeW:44,sizeT:48,yW:700,yT:1180}],
   cap:['**Pressure is a shared responsibility.**','Each guide shows **the evidence**,','who it’s for,','and **when to use it**.']},
  {id:'flip',shots:[{at:0.6,name:'a2',tr:'fade',d:0.35},{at:3.3,name:'a3',tr:'fade',d:0.35}],cam:[{at:-0.3,r:{wide:[280,90,1140],tall:[330,120,720]},d:0.6}],
   cursor:[{at:-0.1,to:[1265,165],d:0.5,click:true},{at:2.7,to:[1265,165],d:0.3,click:true}],
   head:['Flip the pages','Breathe.<br>Ground.'],headTo:'big',cap:['Flip through.','**Breathe gently**, without forcing.','**Come back to the room**,','with five senses.']},
  {id:'big',shots:[{at:-0.6,name:'a4',tr:'fade',d:0.3},{at:0.4,name:'big',tr:'pop',d:0.55}],cam:[{at:-0.6,r:{wide:[280,90,1140],tall:[330,120,720]},d:0.3},{at:0.4,r:{wide:[230,30,1000],tall:[260,60,900]},d:0.01},{at:1.0,r:{wide:[300,100,860],tall:[330,110,720]},d:3}],
   callouts:[{at:3.0,html:'22 studies · 2,335 participants<small>2022 meta-analysis of micro-breaks</small>',bg:'linear-gradient(135deg,#14b8a6,#0f766e)',sizeW:42,sizeT:44,yW:700,yT:1180}],
   head:['Enlarge any page','A small break<br>makes room'],cap:['**Enlarge** any page.','**A small break can make room**:','a meta-analysis of **twenty-two studies**,','with over **two thousand participants**.']},
  {id:'support',shots:[{at:-0.3,name:'support',tr:'fade',d:0.4}],cam:[{at:-0.3,r:{wide:[270,60,1150],tall:[280,330,620]},d:0.01},{at:0.3,r:{wide:[270,200,1150],tall:[280,380,620]},d:3}],
   head:['Support','Not alone'],cap:['And if today is **too heavy**,','**real human support**','is one tap away.']},
  {id:'nur2',bubble:{who:'Staff nurse',av:'SN',text:'So a break isn’t selfish. It’s part of the job.',type:1.6,col:'linear-gradient(135deg,#14b8a6,#0f766e)',yW:110,yT:600,xW:250,wW:900}},
  {id:'cta',cap:['A **clearer picture**,','and a useful next step.','**Try it free** today.']}
 ]};
