const MOD={wide:[300,150,860],tall:[420,260,600]}, MEAN={wide:[330,300,780],tall:[450,300,560]};
window.SPEC={
 brand:['MedLex','Healthcare Crown Academy'], hookShot:'d4', hookCam:MEAN, revealScene:'reveal',
 cursorWindows:[[['dec1',-0.6],['dec1',3.6]],[['dec2',-0.6],['dec2',3.6]]],
 cta:{title:'MedLex<br><em>medical terminology, decoded</em>',pts:['1,480 terms','66 prefixes · 60 roots · 100 suffixes','10 minutes a day'],go:'Try it free today →',url:'medlex.healthcarecrownacademy.co.uk',fine:'Healthcare Crown Academy'},
 scenes:[
  {id:'hook',cap:['**Pericarditis.** **Tachycardia.**','Sound scary?','Give me **ten seconds**.']
   ,kin:[{at:0,to:2.0,html:'Pericarditis',size:[130,140],y:[300,150]},{at:0.9,to:2.0,html:'Tachycardia',size:[130,140],y:[470,300],color:'#ffd166'},{at:2.15,html:'10 seconds.',size:[170,180],y:[380,200],color:'#5eead4'}]},
  {id:'stu1',bubble:{who:'Student',av:'JM',text:'I just memorise them… and forget them by Friday.',type:1.6,col:'linear-gradient(135deg,#f59e0b,#b45309)'}},
  {id:'reveal',shots:[{at:-0.4,name:'d0'}],cam:[{at:-0.4,r:[0,0,1440],d:0.01},{at:0.8,r:MOD,d:2.2}],
   head:['Medical terminology','Stop memorising.<br>Start decoding.'],headTo:'dec1',cap:['**Stop memorising.**','**Start decoding.**','This is **MedLex**.']},
  {id:'dec1',shots:[{at:0.15,name:'d1'},{at:1.55,name:'d2'},{at:2.95,name:'d3'}],cam:[{at:-0.3,r:{wide:[420,330,620],tall:[480,330,500]},d:0.8}],
   cursor:[{at:-0.5,to:[602,525],d:0.5,click:true},{at:0.9,to:[730,525],d:0.5,click:true},{at:2.3,to:[847,525],d:0.5,click:true}],
   cap:['Tap **peri**: around.','**Card**: heart.','**Itis**: inflammation.']},
  {id:'mean1',shots:[{at:-0.2,name:'d4',tr:'fade',d:0.4}],cam:[{at:-0.2,r:MEAN,d:0.8}],
   hl:[{at:0.6,to:'end',r:[440,566,560,92],color:'#ffd166'}],
   callouts:[{at:2.6,html:'You just read it yourself',bg:'linear-gradient(135deg,#10b981,#047857)',sizeW:48,sizeT:54,yW:700,yT:1180}],
   head:['Decoded','Peri + card<br>+ itis'],cap:['**Pericarditis**:','the sac **around the heart** is **inflamed**.','You just **read it yourself**.']},
  {id:'dec2',shots:[{at:-0.35,name:'e0',tr:'fade',d:0.35},{at:0.35,name:'e1'},{at:1.75,name:'e2'},{at:3.1,name:'e9',tr:'fade',d:0.35}],cam:[{at:-0.35,r:{wide:[420,330,620],tall:[480,330,500]},d:0.6},{at:3.1,r:MEAN,d:0.8}],
   cursor:[{at:-0.3,to:[607,525],d:0.5,click:true},{at:1.1,to:[750,525],d:0.5,click:true},{at:2.4,to:[862,525],d:0.5,click:true}],
   head:['Try another','Tachy + card<br>+ ia'],headTo:'stu2',cap:['Another one.','**Tachy**: fast. **Card**: heart.','**Ia**: a condition.','**Tachycardia**.']},
  {id:'stu2',bubble:{who:'Student',av:'JM',text:'Wait… I actually get it now.',type:1.0,col:'linear-gradient(135deg,#f59e0b,#b45309)',yW:120,yT:600,xW:250,wW:820}},
  {id:'today',shots:[{at:-0.35,name:'today',tr:'pop',d:0.5}],cam:[{at:-0.35,r:{wide:[200,0,1240],tall:[330,20,700]},d:0.01},{at:0.3,r:{wide:[330,10,1090],tall:[340,30,620]},d:2.5},{at:4.6,r:{wide:[700,170,740],tall:[1100,230,340]},d:1.0}],
   hl:[{at:5.2,to:'end',r:[1122,420,190,64],color:'#ffd166'}],
   callouts:[{at:6.0,html:'1,480 terms<small>built from word parts</small>',bg:'linear-gradient(135deg,#6366f1,#4338ca)',sizeW:48,sizeT:54,yW:700,yT:1180}],
   head:['Your daily ten minutes','My Day'],cap:['**1,480** medical terms,','all built from parts like these.','**66 prefixes**, **60 roots**, **100 suffixes**.','**Ten minutes a day**, on your My Day page.']},
  {id:'cta',cap:['Learn the **language of medicine**,','one part at a time.','**Try it free** today.']}
 ]};
