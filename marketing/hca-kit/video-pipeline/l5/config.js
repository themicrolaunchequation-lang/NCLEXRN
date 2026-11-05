const BK={wide:[60,40,1340],tall:[700,110,560]};
window.SPEC={
 brand:['Lumen','Healthcare Crown Academy'], hookShot:'mag', hookCam:{wide:[400,250,700],tall:[440,280,480]}, revealScene:'reveal',
 cursorWindows:[[['mark',-0.3],['mark',3.0]]],
 cta:{title:'Lumen<br><em>bring your notes, Lumen does the rest</em>',pts:['Pen · highlight','Magnifier · stickers · calculator','Slides · export · recall'],go:'Try it free today →',url:'lumen.healthcarecrownacademy.co.uk',fine:'Healthcare Crown Academy · PDFs stay on your device'},
 scenes:[
  {id:'hook',cap:['Your PDF can do','**way more** than you think.'],kin:[{at:0,html:'Your PDF<br><span style="color:#5eead4">can do more.</span>',size:[140,140],y:[280,130]}]},
  {id:'reveal',shots:[{at:-0.3,name:'r0',tr:'pop',d:0.45},{at:2.4,name:'r1',tr:'fade',d:0.35}],cam:[{at:-0.3,r:[0,0,1440],d:0.01},{at:0.4,r:BK,d:2}],
   head:['Lumen · reader','Your PDF,<br>supercharged'],headTo:'mark',cap:['Open it in **Lumen’s reader**.','It turns like **a real book**.']},
  {id:'mark',shots:[{at:0.4,name:'pen'},{at:1.6,name:'hl'}],cam:[{at:-0.2,r:{wide:[150,40,1180],tall:[780,200,500]},d:0.6}],
   cursor:[{at:-0.2,to:[270,73],d:0.4,click:true},{at:0.2,to:[1140,345],d:0.4},{at:1.0,to:[360,73],d:0.4,click:true},{at:1.4,to:[1210,420],d:0.4}],
   cap:['**Draw.** **Highlight.**','Every mark is **saved with its page**.']},
  {id:'mag',shots:[{at:-0.2,name:'mag',tr:'fade',d:0.3}],cam:[{at:-0.2,r:{wide:[150,120,1180],tall:[430,260,500]},d:0.5}],cap:['**Magnify** small print.']},
  {id:'stick',shots:[{at:-0.2,name:'stickers',tr:'pop',d:0.4},{at:2.2,name:'calc',tr:'pop',d:0.4}],cam:[{at:-0.2,r:{wide:[60,280,900],tall:[60,460,500]},d:0.01},{at:2.2,r:{wide:[700,40,740],tall:[1000,60,440]},d:0.01}],
   head:['Make it yours','Stickers +<br>calculator'],cap:['Drop **clinical stickers**,','and use a **calculator**','with clinical formulas.']},
  {id:'share',shots:[{at:-0.2,name:'present',tr:'pop',d:0.4},{at:2.6,name:'export',tr:'fade',d:0.35}],cam:[{at:-0.2,r:{wide:[400,80,640],tall:[420,90,600]},d:0.5}],
   head:['Share it','Slides +<br>export'],cap:['Turn your notes into **slides**,','or **export** to PowerPoint and Word.']},
  {id:'explain',shots:[{at:-0.2,name:'explain',tr:'pop',d:0.4}],cam:[{at:-0.2,r:{wide:[700,40,740],tall:[1050,120,390]},d:0.01}],cap:['Then **recall before you reveal**.']},
  {id:'stu2',bubble:{who:'Nursing student',av:'NS',text:'It’s a study desk inside my PDF.',type:1.0,col:'linear-gradient(135deg,#8b5cf6,#5b21b6)',yW:110,yT:600,xW:250,wW:900}},
  {id:'cta',cap:['**Try it free** today.']}
 ]};
