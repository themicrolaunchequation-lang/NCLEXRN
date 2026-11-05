const DLG={wide:[230,30,980],tall:[240,60,620]}, PL={wide:[0,0,1440],tall:[180,30,760]};
window.SPEC={
 brand:['Serein','Healthcare Crown Academy'], hookShot:'h08', hookCam:PL, revealScene:'reveal',
 cursorWindows:[[['reveal',0.2],['reveal',2.2]],[['q',0.6],['q',7.4]]],
 cta:{title:'Serein<br><em>make room for you</em>',pts:['Personal suggestions','15 short practices','Nothing monitored'],go:'Try it free today \u2192',url:'serein.healthcarecrownacademy.co.uk',fine:'Healthcare Crown Academy \u00b7 wellbeing support, not medical treatment'},
 scenes:[
  {id:'hook',cap:['Not every break','needs to be **the same**.','So why do wellbeing apps','treat you like it does?']},
  {id:'nur1',bubble:{who:'Healthcare assistant',av:'HA',text:'I\u2019ve got two minutes, and my hands are aching.',type:1.6,col:'linear-gradient(135deg,#64748b,#334155)'}},
  {id:'reveal',shots:[{at:-0.5,name:'home'},{at:1.6,name:'q1',tr:'pop',d:0.55}],cam:[{at:-0.5,r:{wide:[0,0,1440],tall:[60,40,780]},d:0.01},{at:1.6,r:DLG,d:0.01}],
   cursor:[{at:0.5,to:[370,385],d:0.6,click:true}],
   head:['Serein','Find a pause<br>that fits'],headTo:'res',cap:['Serein **asks first**.','**Find a pause that fits.**']},
  {id:'q',shots:[{at:2.9,name:'q2',tr:'fade',d:0.35},{at:6.0,name:'q3',tr:'fade',d:0.35}],cam:[{at:0,r:DLG,d:0.4}],
   cursor:[{at:0.9,to:[720,437],d:0.6,click:true},{at:2.3,to:[1050,780],d:0.5,click:true},{at:4.3,to:[720,437],d:0.6,click:true},{at:5.4,to:[1050,780],d:0.5,click:true}],
   cap:['What\u2019s happening around this pause?','**Between tasks.**','How much time? **Two minutes.**','What would feel **comfortable**?']},
  {id:'res',shots:[{at:-0.3,name:'res',tr:'pop',d:0.5}],cam:[{at:-0.3,r:DLG,d:0.01},{at:1.0,r:{wide:[240,180,900],tall:[250,200,600]},d:2}],
   callouts:[{at:1.5,html:'3 suggestions<small>each with a clear reason</small>',bg:'linear-gradient(135deg,#14b8a6,#0f766e)',sizeW:46,sizeT:52,yW:700,yT:1180}],
   cap:['**Three suggestions**,','each with a **clear reason**.','**Breathing Tide.** **Hand and Finger Reset.**','**Here and Now.**']},
  {id:'hand',shots:[{at:-0.4,name:'hpre',tr:'pop',d:0.5},{at:0.30,name:'h00'},{at:0.92,name:'h01'},{at:1.54,name:'h02'},{at:2.16,name:'h03'},{at:2.78,name:'h04'},{at:3.40,name:'h05'},{at:4.02,name:'h06'},{at:4.64,name:'h07'},{at:5.26,name:'h08'},{at:5.88,name:'h09'},{at:6.50,name:'h10'},{at:7.12,name:'h11'},{at:7.74,name:'h12'},{at:8.36,name:'h13'},],cam:[{at:-0.4,r:PL,d:0.01},{at:1,r:{wide:[20,40,1060],tall:[30,60,680]},d:4}],
   head:['Hand & Finger Reset','90 seconds<br>for tired hands'],headTo:'safe',cap:['**Ninety seconds** for tired hands.','**Settle.** Rest your forearms.','Then **gently uncurl** your fingers,','only as far as **feels easy**.']},
  {id:'safe',kin:[{at:0,html:'Stop or adapt<br><span style="color:#5eead4">any time.</span>',size:[120,110],y:[280,140]}],cap:['**Stop or adapt**','whenever you need to.','**Nothing here is a score.**']},
  {id:'nur2',bubble:{who:'Healthcare assistant',av:'HA',text:'That\u2019s exactly what I needed.',type:1.0,col:'linear-gradient(135deg,#64748b,#334155)',yW:110,yT:600,xW:250,wW:900}},
  {id:'cta',cap:['The **right pause**,','for the moment you\u2019re in.','**Try it free** today.']}
 ]};