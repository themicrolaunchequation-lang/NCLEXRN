const SL={wide:[300,40,1140],tall:[290,60,1120]};
window.SPEC={
 brand:['Carecraft','Healthcare Crown Academy'], hookShot:'rev', hookCam:{wide:[300,150,1140],tall:[320,280,880]}, revealScene:'reveal',
 cursorWindows:[[['diff',1.6],['diff',3.4]],[['reveal',1.3],['reveal',3.0]]],
 cta:{title:'Carecraft<br><em>practise the moments that matter</em>',pts:['30 short lessons','90 visual guides','Learn as slides'],go:'Try it free today →',url:'carecraft.healthcarecrownacademy.co.uk',fine:'Healthcare Crown Academy · fictional learning examples'},
 scenes:[
  {id:'hook',cap:['“You understand now, right?','The leaflet explains the rest.”','**Sound familiar?**'],
   kin:[{at:0,to:3.4,html:'“You understand now, <span style="color:#f87171">right?</span>”',size:[96,92],y:[340,180]},{at:3.5,html:'Sound familiar?',size:[130,140],y:[380,200],color:'#ffd166'}]},
  {id:'nur1',bubble:{who:'Staff nurse',av:'SN',text:'I don’t have time for an hour-long course.',type:1.6,col:'linear-gradient(135deg,#14b8a6,#0f766e)'}},
  {id:'reveal',shots:[{at:-0.4,name:'learn'},{at:2.6,name:'sl00',tr:'pop',d:0.55}],cam:[{at:-0.4,r:{wide:[280,200,1150],tall:[300,250,700]},d:0.01},{at:2.6,r:SL,d:0.01},{at:2.8,r:{wide:[0,0,1440],tall:[150,80,700]},d:2.2}],
   cursor:[{at:1.4,to:[535,420],d:0.6,click:true}],
   head:['Carecraft · Learn','8-minute<br>lessons'],headTo:'ideas',cap:['You don’t need one.','Carecraft lessons come as','**eight-minute slide journeys**.']},
  {id:'ideas',shots:[{at:-0.3,name:'sl01',tr:'fade',d:0.4},{at:2.4,name:'sl02',tr:'fade',d:0.4},{at:4.3,name:'sl03',tr:'fade',d:0.4}],cam:[{at:-0.3,r:SL,d:0.6}],
   cap:['**Three ideas**, one at a time.','**Start with the person.**','**Make understanding shared.**','**Close the loop.**']},
  {id:'guide',shots:[{at:-0.3,name:'sl04',tr:'fade',d:0.4}],cam:[{at:-0.3,r:{wide:[400,40,1040],tall:[460,90,600]},d:0.8},{at:1.6,r:{wide:[460,60,900],tall:[490,120,520]},d:2.0}],
   callouts:[{at:0.9,html:'Visual guides<small>open · enlarge · annotate</small>',bg:'linear-gradient(135deg,#6366f1,#4338ca)',sizeW:46,sizeT:52,yW:700,yT:1180}],
   head:['Visual guides','See it on<br>one page'],cap:['**Visual guides** you can open,','**enlarge**, and **annotate**.']},
  {id:'diff',shots:[{at:-0.3,name:'sl07',tr:'fade',d:0.4},{at:3.0,name:'rev',tr:'pop',d:0.5}],cam:[{at:-0.3,r:{wide:[330,140,1100],tall:[310,200,1080]},d:0.8}],
   cursor:[{at:1.8,to:[1095,790],d:0.6,click:true}],
   hl:[{at:0.4,to:2.8,r:[330,356,504,394],color:'#f87171'},{at:3.4,to:'end',r:[860,356,502,230],color:'#34d399'}],
   head:['Worked example','Notice the<br>difference'],cap:['Then **notice the difference**.','Tap to reveal a **stronger approach**.','“I’ve shared a lot.','How would you describe the next step,','**in your own words**?”']},
  {id:'checks',shots:[{at:-0.3,name:'sl05',tr:'fade',d:0.35},{at:1.4,name:'sl12',tr:'fade',d:0.35},{at:2.6,name:'sl13',tr:'fade',d:0.35}],cam:[{at:-0.3,r:SL,d:0.6}],
   cap:['**Three quick checks**,','a **reflection**,','and **one thing to remember**.']},
  {id:'nur2',bubble:{who:'Staff nurse',av:'SN',text:'Eight minutes. I can do that on my break.',type:1.3,col:'linear-gradient(135deg,#14b8a6,#0f766e)',yW:110,yT:600,xW:250,wW:900}},
  {id:'cta',cap:['**Thirty lessons**','for the work you do.','**Try it free** today.']}
 ]};
