window.SPEC={
 brand:['Evinca','The Evinca Review'], hookShot:'pr0', hookCam:{wide:[90,40,1260],tall:[700,60,720]}, revealScene:'reveal',
 cursorWindows:[],
 cta:{title:'Evinca<br><em>recognition you can verify</em>',pts:['Public proof page','QR + record number','Corrections stay visible'],go:'Start free today →',url:'evinca.healthcarecrownacademy.co.uk',fine:'Healthcare Crown Academy · the record shown is an illustrative demo'},
 scenes:[
  {id:'hook',cap:['Anyone can **claim an award**.','Can yours be **checked**?'],
   kin:[{at:0,to:2.0,html:'Award winner?',size:[150,150],y:[340,170]},{at:2.1,html:'<span style="color:#5eead4">Prove it.</span>',size:[180,180],y:[370,190]}]},
  {id:'hr',bubble:{who:'Recruiter',av:'HR',text:'Your CV says honoree. How do I know it’s real?',type:1.6,col:'linear-gradient(135deg,#3b82f6,#1e3a8a)'}},
  {id:'reveal',shots:[{at:-0.4,name:'pr0'}],cam:[{at:-0.4,r:[0,0,1440],d:0.01},{at:1.0,r:{wide:[90,40,1260],tall:[100,90,720]},d:3}],
   head:['Evinca · proof page','No login<br>needed'],headTo:'status',cap:['Every Evinca honor has','a **public proof page**.','**No login needed.**']},
  {id:'status',cam:[{at:-0.2,r:{wide:[90,330,1260],tall:[100,420,720]},d:0.8},{at:3.6,r:{wide:[700,500,740],tall:[800,520,560]},d:1.2}],
   hl:[{at:0.3,to:3.4,r:[105,350,830,60],color:'#34d399'}],
   cap:['**Current status: active.**','This honor is **current and valid**.','Scan the **QR code** to open the record.']},
  {id:'record',shots:[{at:-0.3,name:'pr1',tr:'fade',d:0.45},{at:4.6,name:'pr2',tr:'fade',d:0.45}],cam:[{at:-0.3,r:{wide:[90,0,1260],tall:[100,100,720]},d:0.01},{at:0.4,r:{wide:[100,60,820],tall:[100,120,640]},d:3.5},{at:4.6,r:{wide:[90,40,880],tall:[100,140,640]},d:0.01}],
   callouts:[{at:5.2,html:'Evidence passport<small>baseline · result · verified by</small>',bg:'linear-gradient(135deg,#0f766e,#134e4a)',sizeW:46,sizeT:50,yW:700,yT:1180}],
   head:['The record','Checked<br>evidence'],headTo:'badge',cap:['The record shows the **category**, the **rubric**,','**who reviewed it**,','and the **evidence passport**.','**Baseline**, **result**, and how it was verified.']},
  {id:'badge',cam:[{at:-0.2,r:{wide:[700,200,740],tall:[800,260,560]},d:1}],
   cap:['A **certificate**, a **digital badge**,','and ready wording for **LinkedIn**.','**Corrections stay visible**, in public.']},
  {id:'hr2',bubble:{who:'Recruiter',av:'HR',text:'Checked in thirty seconds. Impressive.',type:1.2,col:'linear-gradient(135deg,#3b82f6,#1e3a8a)',yW:110,yT:600,xW:250,wW:900}},
  {id:'cta',cap:['**Recognition you can verify.**','**Start free** today.']}
 ]};
