const PL={wide:[0,0,1440],tall:[180,30,760]};
window.SPEC={
 brand:['Serein','Healthcare Crown Academy'], hookShot:'b05', hookCam:{wide:[240,100,960],tall:[400,50,640]}, revealScene:'reveal',
 cursorWindows:[[['pause',-0.3],['pause',1.4]]],
 cta:{title:'Serein<br><em>make room for you</em>',pts:['15 short practices','2 minutes is enough','Nothing monitored'],go:'Try it free today \u2192',url:'serein.healthcarecrownacademy.co.uk',fine:'Healthcare Crown Academy \u00b7 wellbeing support, not medical treatment'},
 scenes:[
  {id:'hook',cap:['**Twelve hours.** No break.','And the next patient','is **already waiting**.'],
   kin:[{at:0,to:1.9,html:'12 hours.',size:[190,190],y:[340,170]},{at:2.0,html:'No break.',size:[170,170],y:[360,180],color:'#ffd166'}]},
  {id:'nur1',bubble:{who:'Night-shift nurse',av:'NS',text:'I don\u2019t have time to look after myself.',type:1.5,col:'linear-gradient(135deg,#14b8a6,#0f766e)'}},
  {id:'reveal',shots:[{at:-0.5,name:'today'}],cam:[{at:-0.5,r:{wide:[0,0,1440],tall:[60,40,780]},d:0.01},{at:1.0,r:{wide:[270,20,1140],tall:[280,60,620]},d:2.4}],
   head:['Serein \u00b7 wellbeing','Make room<br>for you'],headTo:'breath',cap:['You have **two minutes**.','**Serein** makes room for you.']},
  {id:'breath',shots:[{at:-0.30,name:'b00'},{at:0.20,name:'b01'},{at:0.70,name:'b02'},{at:1.20,name:'b03'},{at:1.70,name:'b04'},{at:2.20,name:'b05'},{at:2.70,name:'b06'},{at:3.20,name:'b07'},{at:3.70,name:'b08'},{at:4.20,name:'b09'},{at:4.70,name:'b10'},{at:5.20,name:'b11'},],cam:[{at:-0.3,r:{wide:[240,100,960],tall:[400,50,640]},d:0.8}],
   cap:['**Three easy breaths**,','before anything else.','**Breathe in.**','**And let it go.**']},
  {id:'pause',shots:[{at:-0.4,name:'today',tr:'fade',d:0.35},{at:1.5,name:'pre',tr:'pop',d:0.55},{at:2.6,name:'p00'},{at:3.02,name:'p01'},{at:3.44,name:'p02'},{at:3.86,name:'p03'},{at:4.28,name:'p04'},{at:4.70,name:'p05'},{at:5.12,name:'p06'},{at:5.54,name:'p07'},{at:5.96,name:'p08'},{at:6.38,name:'p09'},{at:6.80,name:'p10'},{at:7.22,name:'p11'},{at:7.64,name:'p12'},],
   cam:[{at:-0.4,r:{wide:[270,20,1140],tall:[280,60,620]},d:0.4},{at:1.5,r:PL,d:0.01}],
   cursor:[{at:0.1,to:[370,335],d:0.6,click:true}],
   head:['Breathing Tide','Breathe in'],headTo:'out',cap:['Press **start my pause**,','and the **Breathing Tide** guides you.','Breathe in, only as far','as **feels comfortable**.']},
  {id:'out',shots:[{at:0.28,name:'p13'},{at:0.56,name:'p14'},{at:0.84,name:'p15'},{at:1.12,name:'p16'},{at:1.40,name:'p17'},{at:1.68,name:'p18'},{at:1.96,name:'p19'},{at:2.24,name:'p20'},{at:2.52,name:'p21'},{at:2.80,name:'p22'},{at:3.08,name:'p23'},],cam:[{at:0,r:{wide:[60,40,1100],tall:[180,60,700]},d:3}],cap:['**Breathe out.**','Let the breath leave,','**without forcing it**.']},
  {id:'lib',shots:[{at:-0.4,name:'library',tr:'fade',d:0.45}],cam:[{at:-0.4,r:{wide:[270,40,1150],tall:[280,60,620]},d:0.01},{at:0.3,r:{wide:[270,300,1150],tall:[280,340,620]},d:4}],
   callouts:[{at:1.6,html:'15 short practices<small>1 to 5 minutes</small>',bg:'linear-gradient(135deg,#14b8a6,#0f766e)',sizeW:46,sizeT:52,yW:700,yT:1180}],
   head:['Library','Find what<br>fits'],cap:['When you have a little longer,','the library has **fifteen short practices**.','**Breathing**, **grounding**, gentle movement,','from **one minute to five**.']},
  {id:'promise',kin:[{at:0,html:'No streak.<br>No score.<br><span style="color:#5eead4">Not monitored.</span>',size:[110,96],y:[250,120]}],
   cap:['**No streak** to keep.','**Nothing is scored.**','**Nothing is monitored.**']},
  {id:'nur2',bubble:{who:'Night-shift nurse',av:'NS',text:'Two minutes. I feel human again.',type:1.0,col:'linear-gradient(135deg,#14b8a6,#0f766e)',yW:110,yT:600,xW:250,wW:900}},
  {id:'cta',cap:['**Make room for you.**','**Try it free** today.']}
 ]};