const CARD={wide:[440,120,860],tall:[470,170,770]}, FB={wide:[320,140,1070],tall:[460,130,800]};
window.SPEC={
 brand:['MedLex','Healthcare Crown Academy'], hookShot:'b9', hookCam:FB, revealScene:'reveal',
 cursorWindows:[[['build',1.8],['build',7.2]],[['check',-0.6],['check',0.9]]],
 cta:{title:'MedLex<br><em>medical terminology, decoded</em>',pts:['8 ways to practise','1,480 terms','Spaced flash review'],go:'Try it free today →',url:'medlex.healthcarecrownacademy.co.uk',fine:'Healthcare Crown Academy'},
 scenes:[
  {id:'hook',cap:['Could you spell a diagnosis','you’ve **never seen before**?','You can, if you know **the parts**.'],
   kin:[{at:0,to:3.2,html:'Gastro…entero…<span style="color:#ffd166">what?</span>',size:[110,120],y:[340,170]},{at:3.35,html:'Build it.',size:[180,190],y:[360,180],color:'#5eead4'}]},
  {id:'stu1',bubble:{who:'Student',av:'JM',text:'Gastro… entero… what?',type:1.2,col:'linear-gradient(135deg,#f59e0b,#b45309)'}},
  {id:'reveal',shots:[{at:-0.4,name:'practice'}],cam:[{at:-0.4,r:[0,0,1440],d:0.01},{at:1.0,r:{wide:[270,40,1170],tall:[280,60,700]},d:2.4}],
   head:['MedLex Practice','Don’t read it.<br>Build it.'],headTo:'build',cap:['In **MedLex Practice**,','you don’t just read words.','You **build them**.']},
  {id:'build',shots:[{at:-0.3,name:'b0',tr:'fade',d:0.35},{at:2.9,name:'b1'},{at:4.1,name:'b2'},{at:5.2,name:'b3'},{at:6.5,name:'b4'}],cam:[{at:-0.3,r:CARD,d:0.8}],
   cursor:[{at:2.1,to:'gastr@b0',d:0.5,click:true},{at:3.3,to:'o@b0',d:0.5,click:true},{at:4.4,to:'enter@b0',d:0.5,click:true},{at:5.7,to:'itis@b0',d:0.5,click:true}],
   cap:['The **stomach** and **intestines** are **inflamed**.','**Gastr**: stomach. **O**: to join.','**Enter**: intestine.','**Itis**: inflammation.']},
  {id:'check',shots:[{at:0.5,name:'b9',tr:'pop',d:0.45}],cam:[{at:0.5,r:FB,d:0.9}],
   cursor:[{at:-0.5,to:'check@b4',shot:'b4',d:0.5,click:true}],
   hl:[{at:1.3,to:'end',r:[500,515,690,140],color:'#34d399'}],
   callouts:[{at:2.8,html:'Gastroenteritis ✓<small>4 small parts, 1 clear meaning</small>',bg:'linear-gradient(135deg,#10b981,#047857)',sizeW:48,sizeT:54,yW:700,yT:1180}],
   head:['Instant feedback','Right.<br>And why.'],headTo:'stu2',cap:['Check it. **Right.**','**Gastroenteritis.**','Four small parts, one clear meaning.','And now you know **exactly why**.']},
  {id:'stu2',bubble:{who:'Student',av:'JM',text:'Okay. That’s actually fun.',type:0.9,col:'linear-gradient(135deg,#f59e0b,#b45309)',yW:110,yT:600,xW:250,wW:820}},
  {id:'modes',shots:[{at:-0.35,name:'practice',tr:'fade',d:0.4}],cam:[{at:-0.35,r:{wide:[270,330,1170],tall:[280,400,620]},d:0.8},{at:4.6,r:{wide:[270,330,1170],tall:[840,400,600]},d:2.5}],
   hl:[{at:1.5,to:4.2,r:[576,422,280,182],color:'#5eead4'}],
   callouts:[{at:5.5,html:'Flash review<small>returns just before you forget</small>',bg:'linear-gradient(135deg,#6366f1,#4338ca)',sizeW:46,sizeT:52,yW:700,yT:1180}],
   head:['Choose your way','8 ways to<br>practise'],cap:['**Eight ways** to practise.','Decode it, **build it**, match pairs,','look-alikes, clinical notes,','and a **flash review** that brings words back','just before you forget them.']},
  {id:'cta',cap:['Build your medical vocabulary,','**piece by piece**.','**Try it free** today.']}
 ]};
