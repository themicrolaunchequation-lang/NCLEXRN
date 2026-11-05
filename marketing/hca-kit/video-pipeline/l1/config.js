const BK={wide:[200,90,1120],tall:[700,90,560]};
window.SPEC={
 brand:['Lumen','Healthcare Crown Academy'], hookShot:'r2', hookCam:{wide:[200,90,1120],tall:[230,90,560]}, revealScene:'reveal',
 cursorWindows:[[['read',-0.3],['read',4.0]],[['hl',-0.4],['hl',3.0]],[['explain',0.8],['explain',3.0]]],
 cta:{title:'Lumen<br><em>read, hide, explain, verify</em>',pts:['Your own PDFs and photos','Recall cards + quizzes','Private, on your device'],go:'Try it free today →',url:'lumen.healthcarecrownacademy.co.uk',fine:'Healthcare Crown Academy · sample book is an original learning sample'},
 scenes:[
  {id:'hook',cap:['You read the chapter **three times**.','So why can’t you','**remember any of it**?'],
   kin:[{at:0,to:3.0,html:'Read it 3 times?',size:[130,130],y:[340,170]},{at:3.1,html:'Remember <span style="color:#f87171">nothing.</span>',size:[130,130],y:[380,190]}]},
  {id:'stu1',bubble:{who:'Nursing student',av:'NS',text:'I highlight everything. It all looks important.',type:1.5,col:'linear-gradient(135deg,#8b5cf6,#5b21b6)'}},
  {id:'reveal',shots:[{at:-0.4,name:'lib'},{at:4.6,name:'r0',tr:'pop',d:0.55}],cam:[{at:-0.4,r:{wide:[300,60,1100],tall:[320,400,800]},d:0.01},{at:1.0,r:{wide:[300,60,1100],tall:[860,420,540]},d:3}, {at:4.6,r:{wide:[0,0,1440],tall:[230,90,560]},d:0.01}],
   cursor:[{at:3.6,to:[985,540],d:0.7,click:true}],
   head:['Lumen · study reader','Reading into<br>learning'],headTo:'read',cap:['**Lumen** turns reading into **learning**.','Bring in **your own notes**,','or start with a **sample book**.']},
  {id:'read',shots:[{at:0.5,name:'r1',tr:'fade',d:0.4},{at:3.0,name:'r2',tr:'fade',d:0.4}],cam:[{at:-0.3,r:BK,d:0.01},{at:0.5,r:{wide:[200,90,1120],tall:[230,90,560]},d:0.8},{at:3.0,r:{wide:[200,90,1120],tall:[700,90,560]},d:0.8}],
   cursor:[{at:0,to:[1257,473],d:0.5,click:true},{at:2.5,to:[1257,473],d:0.4,click:true}],
   cap:['Flip through like a **real book**.','**One pump, two circuits.**','**Preload.** **Afterload.**']},
  {id:'hl',shots:[{at:0.3,name:'hl0'},{at:1.0,name:'hl3'},{at:1.4,name:'hl6'},{at:1.8,name:'hl9'}],cam:[{at:-0.3,r:{wide:[600,40,800],tall:[700,200,560]},d:0.8}],
   cursor:[{at:-0.3,to:[360,73],d:0.5,click:true},{at:0.6,to:[800,420],d:0.4},{at:1.0,to:[1200,420],d:0.9}],
   callouts:[{at:3.0,html:'Saved with its source',bg:'linear-gradient(135deg,#8b5cf6,#5b21b6)',sizeW:46,sizeT:52,yW:700,yT:1180}],
   head:['Highlight','The idea,<br>not the page'],cap:['**Highlight the idea**,','not the whole page.','Every highlight is **saved with its source**.']},
  {id:'explain',shots:[{at:1.8,name:'ex0',tr:'pop',d:0.5}],cam:[{at:-0.3,r:{wide:[0,0,1440],tall:[230,90,560]},d:0.8},{at:1.8,r:{wide:[0,0,1440],tall:[300,150,560]},d:1}],
   cursor:[{at:0.9,to:[817,73],d:0.7,click:true}],
   hl:[{at:2.6,to:'end',r:[300,240,700,140],color:'#ffd166'}],
   head:['Explain','Recall before<br>you reveal'],headTo:'verify',cap:['Now **the powerful part**.','Press **Explain**, and the page **hides**.','**Recall before you reveal.**']},
  {id:'verify',cam:[{at:-0.2,r:{wide:[760,160,680],tall:[1060,160,380]},d:1}],

   callouts:[{at:2.8,html:'Read → hide → explain → verify',bg:'linear-gradient(135deg,#10b981,#047857)',sizeW:46,sizeT:48,yW:700,yT:1180}],
   cap:['Explain it **from memory**,','then **reveal the source** and compare.','That’s where **real learning** happens.']},
  {id:'stu2',bubble:{who:'Nursing student',av:'NS',text:'So that’s why I kept forgetting.',type:1.1,col:'linear-gradient(135deg,#8b5cf6,#5b21b6)',yW:110,yT:600,xW:250,wW:900}},
  {id:'cta',cap:['**Read. Hide. Explain. Verify.**','**Try it free** today.']}
 ]};
