import json,os
R={
 'gsa':dict(c='sa',reg='Saudi',exam='SNLE',say='S N L E',country='Saudi Arabia',full='Saudi Nursing Licensure Examination',tag='SAUDI ARABIA · SNLE',items=[['QUESTIONS',200,''],['TIME',4,' hours'],['PASS MARK',500,''],['ATTEMPTS','See guide']],nq='Two hundred',hh='Four',nv='bm_lewis',pv='af_sarah',col='#10b981',theme={'b':['#03211a','#0a3b2b','#062f2f'],'g1':'rgba(16,185,129,.36)','g2':'rgba(20,184,166,.26)','hi':'#facc15'},seed=2201,prog=['Am','F','C','G']),
 'gqa':dict(c='qa',reg='Qatar',exam='DHP RGN',say='Qatar D H P',country='Qatar',full='Qatar Registered General Nurse Qualifying Examination',tag='QATAR · DHP RGN',items=[['QUESTIONS',150,''],['TIME',3,' hours'],['PASS MARK',50,'%'],['ATTEMPTS','Up to 5']],nq='One hundred and fifty',hh='Three',nv='bf_emma',pv='am_michael',col='#e11d74',theme={'b':['#24060f','#470d22','#2c0a2c'],'g1':'rgba(190,24,93,.38)','g2':'rgba(147,51,234,.24)','hi':'#fcd34d'},seed=2202,prog=['Dm','Bb','F','C']),
 'gdu':dict(c='du',reg='Dubai',exam='DHA RN',say='Dubai D H A',country='Dubai',full='Dubai DHA Registered Nurse Assessment',tag='DUBAI · DHA RN',items=[['QUESTIONS',150,''],['TIME',3,' hours'],['PASS MARK',50,'%'],['ATTEMPTS','3 across UAE']],nq='One hundred and fifty',hh='Three',nv='bm_george',pv='af_nicole',col='#d4a445',theme={'b':['#211705','#3d2c0c','#2e2108'],'g1':'rgba(234,179,8,.34)','g2':'rgba(251,191,36,.22)','hi':'#fde68a'},seed=2203,prog=['Em','C','G','D']),
 'gad':dict(c='ad',reg='Abu Dhabi',exam='DOH RN',say='Abu Dhabi D O H',country='Abu Dhabi',full='Abu Dhabi Department of Health Registered Nurse',tag='ABU DHABI · DOH RN',items=[['QUESTIONS',150,''],['TIME',3,' hours'],['PASS MARK','Not published'],['ATTEMPTS','3 across UAE']],nq='One hundred and fifty',hh='Three',nv='bf_alice',pv='am_eric',col='#38bdf8',theme={'b':['#06142e','#0a2652','#08345e'],'g1':'rgba(56,189,248,.36)','g2':'rgba(59,130,246,.28)','hi':'#7dd3fc'},seed=2204,prog=['F','Dm','Bb','C']),
}
for k,r in R.items():
  n,p=r['nv'],r['pv']; L=lambda v:'en-gb' if v.startswith('b') else 'en-us'
  S=[dict(id='hook',voice=n,text=f"{r['say']}. {r['nq']} questions. {r['hh']} hours. Are you ready?",pre=0.3,post=0.5),
     dict(id='rn1',voice=p,text="I have my exam date. Where do I begin?",post=0.4),
     dict(id='reveal',voice=n,text=f"Gulf Region Nursing, {r['country']} edition. Set your exam date, and the studio suggests a daily pace.",pre=0.3,post=0.4),
     dict(id='run',voice=n,speed=0.98,text="Reasoning on every question. Timed mocks. Decision tools, like BE-FAST. Clinical dossiers. A bilingual glossary. And a readiness map that shows what to practise next.",pre=0.2,post=0.5),
     dict(id='compare',voice=n,text="Not just a question bank.",pre=0.3,post=2.3),
     dict(id='pass',voice=n,text="The Gulf Pass includes MedLex, Carecraft and Lumen. And Serein is free.",pre=0.2,post=0.4),
     dict(id='cta',voice=n,speed=0.98,text=f"{r['exam'].replace('SNLE','S N L E').replace('DHP','D H P').replace('DHA','D H A').replace('DOH','D O H').replace('RGN','R G N').replace('RN','R N')} preparation, built for {r['country']}. Start free today, at S N L E dot Healthcare Crown Academy dot co dot uk.",pre=0.4,post=1.7)]
  for x in S: x.setdefault('speed',1.0); x['lang']=L(x['voice'])
  json.dump(S,open(f'/root/work/v/{k}/script.json','w'),indent=1)
  json.dump({"bpm":104,"prog":r['prog'],"cta":r['prog'][2:]+r['prog'][:2],"intro":[r['prog'][0]]*2+r['prog'][1:3],"seed":r['seed'],"groove_from":"run","calm":None,"reveal":"reveal","final":r['prog'][2]+"add9" if len(r['prog'][2])==1 else "Cadd9","impact":["hook",2.2]},open(f'/root/work/v/{k}/music.json','w'))
  c=r['c']; col=r['col']
  cfg=f"""const BASE='file://'+window.BASE+'/'+window.PROJ+'/cap/'; const CB='linear-gradient(135deg,{col},#0b1220)', NAVY='linear-gradient(135deg,#1e3a5f,#0b1f3a)';
window.SPEC={{
 brand:['Gulf Region Nursing','{r['tag']}'], hookShot:'{c}-today', hookCam:{{wide:[0,0,1440],tall:[290,40,760]}}, revealScene:'reveal',
 theme:{json.dumps(r['theme'])},
 note:'Original practice material, not official exam questions. Not endorsed by SCFHS, DHP, DHA or DOH.',
 cursorWindows:[[['run',-0.3],['run',3.0]]],
 cta:{{title:'{r['exam']} preparation<br><em>built for {r['country']}</em>',pts:['{r['items'][0][1]} questions · {r['items'][1][1]}{r['items'][1][2]}','Reasoning on every question','10 free questions'],go:'Start free today →',url:'snle.healthcarecrownacademy.co.uk',fine:'Gulf Pass unlocks the full bank, mocks, tools and dossiers · exam details checked 23 Oct 2026, confirm with the regulator'}},
 scenes:[
  {{id:'hook',fx:[{{at:-0.2,to:'end',type:'exam',full:true,o:{{color:'{col}',tag:'{r['tag']}',name:'{r['full']}',items:{json.dumps(r['items'])}}}}}],cap:['**{r['exam']}.** {r['nq']} questions.','**{r['hh']} hours.** Are you ready?']}},
  {{id:'rn1',bubble:{{who:'Nurse · sample',av:'RN',text:'I have my exam date. Where do I begin?',type:1.6,col:CB}}}},
  {{id:'reveal',shots:[{{at:-0.3,name:'{c}-today'}}],cam:[{{at:-0.3,r:{{wide:[0,0,1440],tall:[290,40,760]}},d:0.01}},{{at:1.2,r:{{wide:[280,30,1160],tall:[700,150,500]}},d:1.6}}],
   hl:[{{at:2.2,to:'end',r:[741,172,209,131],color:'{r['theme']['hi']}'}}],
   head:['{r['tag']}','Set your date.<br>Get a pace.'],cap:['**Gulf Region Nursing**, {r['country']} edition.','Set your **exam date**,','and the studio suggests a **daily pace**.']}},
  {{id:'run',shots:[{{at:-0.3,name:'qb1',tr:'pop',d:0.4}},{{at:1.0,name:'qb2'}},{{at:2.2,name:'{c}-hub',tr:'fade',d:0.3}},{{at:3.6,name:'{c}-befast',tr:'pop',d:0.4}},{{at:5.6,name:'{c}-dossier',tr:'fade',d:0.3}},{{at:7.2,name:'{c}-gloss',tr:'fade',d:0.3}},{{at:9.0,name:'{c}-today',tr:'fade',d:0.3}}],
   cam:[{{at:-0.3,r:{{wide:[0,40,1440],tall:[640,90,760]}},d:0.5}},{{at:2.2,r:{{wide:[0,0,1440],tall:[290,40,760]}},d:0.01}},{{at:3.6,r:{{wide:[0,0,1440],tall:[120,140,760]}},d:0.01}},{{at:5.6,r:{{wide:[0,0,1440],tall:[290,40,760]}},d:0.01}},{{at:7.2,r:{{wide:[280,40,1160],tall:[900,250,540]}},d:0.01}},{{at:9.0,r:{{wide:[560,330,880],tall:[960,400,480]}},d:0.01}}],
   cursor:[{{at:0.1,to:[410,570],d:0.5,click:true}}],
   callouts:[{{at:0.3,to:2.1,html:'Why the safest answer wins',bg:CB,sizeW:42,sizeT:46,yW:770,yT:1180}},{{at:2.3,to:3.5,html:'Tutor mock · timed simulation',bg:CB,sizeW:42,sizeT:46,yW:770,yT:1180}},{{at:3.8,to:5.5,html:'67 decision tools · Gulf Pass',bg:NAVY,sizeW:42,sizeT:46,yW:770,yT:1180}},{{at:5.7,to:7.1,html:'35 specialty dossiers',bg:CB,sizeW:42,sizeT:46,yW:770,yT:1180}},{{at:7.3,to:8.9,html:'English ⇄ العربية',bg:CB,sizeW:44,sizeT:50,yW:770,yT:1180}},{{at:9.1,html:'Readiness map',bg:CB,sizeW:44,sizeT:50,yW:770,yT:1180}}],
   head:['In one studio','Practise with<br>reasoning'],cap:['**Reasoning** on every question.','**Timed mocks.**','**Decision tools**, like BE-FAST.','**Clinical dossiers.**','A **bilingual glossary**.','And a **readiness map** that shows','what to practise next.']}},
  {{id:'compare',fx:[{{at:-0.3,type:'compare',full:true,o:{{color:'{col}',step:0.5,rows:[['Right or wrong','Why the safest answer wins','pearl + trap on every question'],['One exam','Four Gulf exams','your {r['exam']} plus three more'],['English only','Bilingual glossary','English and Arabic'],['Questions only','67 tools · 35 dossiers · 9 labs',''],['Study, study, study','Reset & Recharge','short resets for exam stress']]}}}}],cap:['**Not just a question bank.**']}},
  {{id:'pass',fx:[{{at:-0.2,type:'apps',full:true,o:{{base:BASE,step:0.5,tiles:[{{k:'medlex',n:'MedLex',c:'#60a5fa',b:'1,480 medical terms, by their parts'}},{{k:'carecraft',n:'Carecraft',c:'#5eead4',b:'a 60-second scenario a day'}},{{k:'lumen',n:'Lumen',c:'#a78bfa',b:'your sources, recall cards, focus'}},{{k:'serein',n:'Serein',c:'#34d399',tag:'FREE',b:'15 calming practices'}}]}}}}],
   cap:['The **Gulf Pass** includes','**MedLex, Carecraft and Lumen**.','And **Serein** is free.']}},
  {{id:'cta',cap:['**{r['exam']}** preparation, built for **{r['country']}**.','**Start free today.**']}}
 ]}};
"""
  open(f'/root/work/v/{k}/config.js','w').write(cfg)
print('ok')
