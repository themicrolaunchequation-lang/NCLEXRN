const F={wide:[100,500,860],tall:[110,520,700]};
window.SPEC={
 brand:['Evinca','The Evinca Review'], hookShot:'a0', hookCam:{wide:[780,150,660],tall:[800,140,630]}, revealScene:'reveal',
 cursorWindows:[[['q1',0],['q1',4.5]],[['q2',-0.2],['q2',8.5]]],
 cta:{title:'Evinca<br><em>check your eligibility</em>',pts:['2 minutes','No account needed','Nothing submitted or scored'],go:'Check free today →',url:'evinca.healthcarecrownacademy.co.uk/en/apply',fine:'Healthcare Crown Academy · a self-check, not a decision'},
 scenes:[
  {id:'hook',cap:['Have you ever caught an **error**','before it reached a patient?','Then you probably have','a **story worth telling**.']},
  {id:'nur1',bubble:{who:'Charge nurse',av:'CN',text:'Me? I was just doing my job.',type:1.0,col:'linear-gradient(135deg,#0f766e,#134e4a)'}},
  {id:'reveal',shots:[{at:-0.4,name:'a0'}],cam:[{at:-0.4,r:[0,0,1440],d:0.01},{at:1.0,r:{wide:[90,120,1260],tall:[110,130,640]},d:3}],
   head:['Evinca · 2-minute check','Most people<br>underestimate'],headTo:'q1',cap:['Most people **underestimate their own work**.','Evinca’s check takes **two minutes**.','**No account needed.**']},
  {id:'q1',shots:[{at:-0.3,name:'s0',tr:'fade',d:0.4},{at:1.2,name:'s1'},{at:2.6,name:'s2'}],cam:[{at:-0.3,r:F,d:0.8}],
   cursor:[{at:0.3,to:[490,700],d:0.6,click:true},{at:2.0,to:[330,800],d:0.6,click:true}],
   cap:['**Where do you practise?**','Pick a category,','like **patient safety and quality**.']},
  {id:'q2',shots:[{at:-0.2,name:'st2a',tr:'fade',d:0.35},{at:1.6,name:'st2b'},{at:2.6,name:'st3a',tr:'fade',d:0.35},{at:4.6,name:'st3b'},{at:5.6,name:'st4a',tr:'fade',d:0.35},{at:7.6,name:'st4b'}],cam:[{at:-0.2,r:F,d:0.5}],
   cursor:[{at:0.9,to:[210,780],d:0.6,click:true},{at:3.9,to:[210,820],d:0.6,click:true},{at:6.9,to:[210,880],d:0.6,click:true}],
   cap:['Can you describe the problem,','what you did, and **what changed**?','A **before and after**, without patient data?','Could someone **independent** confirm it?']},
  {id:'res',shots:[{at:-0.3,name:'st5a',tr:'pop',d:0.5}],cam:[{at:-0.3,r:F,d:0.5}],
   hl:[{at:0.3,to:'end',r:[150,690,710,60],color:'#34d399'}],
   callouts:[{at:1.4,html:'Ready to shape ✓<small>nothing submitted · nothing scored</small>',bg:'linear-gradient(135deg,#10b981,#047857)',sizeW:46,sizeT:50,yW:700,yT:1180}],
   head:['Your result','Ready to<br>shape'],cap:['**Your evidence looks ready to shape.**','Nothing is submitted,','and **nothing is scored**.']},
  {id:'nur2',bubble:{who:'Charge nurse',av:'CN',text:'Three yeses. Maybe it was more than my job.',type:1.5,col:'linear-gradient(135deg,#0f766e,#134e4a)',yW:110,yT:600,xW:250,wW:900}},
  {id:'cta',cap:['Check your eligibility','in **two minutes**, **free**.']}
 ]};
