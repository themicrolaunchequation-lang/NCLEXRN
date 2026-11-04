import json,sys
R={'gsa':dict(lc='للمملكة العربية السعودية',c='sa',ex='SNLE',ctry='المملكة العربية السعودية',ed='النسخة السعودية',tag='السعودية · SNLE',col='#10b981',full='Saudi Nursing Licensure Examination',items=[['عدد الأسئلة',200,''],['المدة',4,' ساعات'],['درجة النجاح',500,''],['المحاولات','راجِعوا الدليل']],nq='200',hh='4'),
 'gqa':dict(lc='لقطر',c='qa',ex='DHP RGN',ctry='قطر',ed='نسخة قطر',tag='قطر · DHP RGN',col='#e11d74',full='Qatar Registered General Nurse Qualifying Examination',items=[['عدد الأسئلة',150,''],['المدة',3,' ساعات'],['درجة النجاح',50,'%'],['المحاولات','حتى 5']],nq='150',hh='3'),
 'gdu':dict(lc='لدبي',c='du',ex='DHA RN',ctry='دبي',ed='نسخة دبي',tag='دبي · DHA RN',col='#d4a445',full='Dubai DHA Registered Nurse Assessment',items=[['عدد الأسئلة',150,''],['المدة',3,' ساعات'],['درجة النجاح',50,'%'],['المحاولات','3 في الإمارات']],nq='150',hh='3'),
 'gad':dict(lc='لأبوظبي',c='ad',ex='DOH RN',ctry='أبوظبي',ed='نسخة أبوظبي',tag='أبوظبي · DOH RN',col='#38bdf8',full='Abu Dhabi Department of Health Registered Nurse',items=[['عدد الأسئلة',150,''],['المدة',3,' ساعات'],['درجة النجاح','غير منشورة'],['المحاولات','3 في الإمارات']],nq='150',hh='3')}
NOTE='مواد تدريبية أصلية، وليست أسئلة اختبار رسمية. غير معتمدة من SCFHS أو DHP أو DHA أو DOH.'
for k in sys.argv[1:]:
  r=R[k]; c=r['c']; col=r['col']; P=f'/root/work/v/{k}ar/'
  th=open(f'/root/work/v/{k}/config.js').read().split('theme:')[1].split('\n')[0].rstrip(',')
  json.dump(json.load(open(f'/root/work/v/{k}/music.json')),open(P+'music.json','w'))
  D=json.load(open(P+'vo/durations.json')); f=max(1.0,D['run']/11.5); T=lambda x:round(x*f,2)
  J=lambda o:json.dumps(o,ensure_ascii=False)
  cfg=f"""const BASE='file://'+window.BASE+'/'+window.PROJ+'/cap/'; const CB='linear-gradient(135deg,{col},#0b1220)', NAVY='linear-gradient(135deg,#1e3a5f,#0b1f3a)';
window.SPEC={{ rtl:true,
 brand:['Gulf Region Nursing','{r['tag']}'], hookShot:'{c}-today', hookCam:{{wide:[0,0,1440],tall:[290,40,760]}}, revealScene:'reveal',
 theme:{th},
 note:{J(NOTE)},
 cursorWindows:[[['run',-0.3],['run',{T(3.0)}]]],
 cta:{{title:'{r['ex']}<br><em>استعدادٌ مصمَّم {r['lc']}</em>',pts:{J([r['nq']+' سؤال · '+r['hh']+' ساعات','شرحٌ لكل سؤال','10 أسئلة مجانية'])},go:'ابدأوا مجانًا اليوم ←',url:'snle.healthcarecrownacademy.co.uk',fine:{J('باقة الخليج تفتح البنك الكامل والاختبارات والأدوات والملفات · تفاصيل الاختبار من التطبيق (23 أكتوبر 2026)، تأكّدوا منها لدى الجهة المنظِّمة')}}},
 scenes:[
  {{id:'hook',fx:[{{at:-0.2,to:'end',type:'exam',full:true,o:{{color:'{col}',tag:{J(r['tag'])},name:'{r['full']}',items:{J(r['items'])}}}}}],cap:{J(['**'+r['ex']+'**',r['nq']+' سؤالًا، و'+r['hh']+' ساعات.','**هل أنتم مستعدون؟**'])}}},
  {{id:'rn1',bubble:{{who:'ممرضة · مثال',av:'RN',text:'حدّدتُ موعد اختباري. من أين أبدأ؟',type:1.6,col:CB}}}},
  {{id:'reveal',shots:[{{at:-0.3,name:'{c}-today'}}],cam:[{{at:-0.3,r:{{wide:[0,0,1440],tall:[290,40,760]}},d:0.01}},{{at:1.2,r:{{wide:[280,30,1160],tall:[700,150,500]}},d:1.6}}],
   hl:[{{at:2.2,to:'end',r:[741,172,209,131],color:'#facc15'}}],
   head:['تمريض منطقة الخليج','حدّدوا موعدكم.<br>واحصلوا على وتيرة يومية.'],cap:{J(['**تمريض منطقة الخليج**، '+r['ed']+'.','حدّدوا **موعد اختباركم**،','ويقترح عليكم الاستوديو **وتيرةً يومية**.'])}}},
  {{id:'run',shots:[{{at:-0.3,name:'qb1',tr:'pop',d:0.4}},{{at:{T(1.0)},name:'qb2'}},{{at:{T(2.4)},name:'{c}-hub',tr:'fade',d:0.3}},{{at:{T(3.8)},name:'{c}-befast',tr:'pop',d:0.4}},{{at:{T(5.8)},name:'{c}-dossier',tr:'fade',d:0.3}},{{at:{T(7.4)},name:'{c}-gloss',tr:'fade',d:0.3}},{{at:{T(9.0)},name:'{c}-today',tr:'fade',d:0.3}}],
   cam:[{{at:-0.3,r:{{wide:[0,40,1440],tall:[640,90,760]}},d:0.5}},{{at:{T(2.4)},r:{{wide:[0,0,1440],tall:[290,40,760]}},d:0.01}},{{at:{T(3.8)},r:{{wide:[0,0,1440],tall:[120,140,760]}},d:0.01}},{{at:{T(5.8)},r:{{wide:[0,0,1440],tall:[290,40,760]}},d:0.01}},{{at:{T(7.4)},r:{{wide:[280,40,1160],tall:[900,250,540]}},d:0.01}},{{at:{T(9.0)},r:{{wide:[560,330,880],tall:[960,400,480]}},d:0.01}}],
   cursor:[{{at:0.1,to:[410,570],d:0.5,click:true}}],
   callouts:[{{at:0.3,to:{T(2.3)},html:'لماذا تفوز الإجابة الأكثر أمانًا',bg:CB,sizeW:42,sizeT:46,yW:770,yT:1180}},{{at:{T(2.5)},to:{T(3.7)},html:'اختبار تجريبي · محاكاة مؤقّتة',bg:CB,sizeW:42,sizeT:46,yW:770,yT:1180}},{{at:{T(4.0)},to:{T(5.7)},html:'67 أداة قرار · باقة الخليج',bg:NAVY,sizeW:42,sizeT:46,yW:770,yT:1180}},{{at:{T(5.9)},to:{T(7.3)},html:'35 ملف حالات تخصصية',bg:CB,sizeW:42,sizeT:46,yW:770,yT:1180}},{{at:{T(7.5)},to:{T(8.9)},html:'English ⇄ العربية',bg:CB,sizeW:44,sizeT:50,yW:770,yT:1180}},{{at:{T(9.1)},html:'خريطة الجاهزية',bg:CB,sizeW:44,sizeT:50,yW:770,yT:1180}}],
   head:['في استوديو واحد','تدرّبوا<br>بالاستدلال'],cap:{J(['**شرحٌ لكل سؤال**،','يوضّح لماذا تفوز **الإجابة الأكثر أمانًا**.','**اختبارات تجريبية** مؤقّتة.','**أدوات قرار سريري** مثل BE-FAST.','**ملفات حالات** تخصصية.','**مسرد** بالعربية والإنجليزية.','و**خريطة جاهزية** تُريكم ما تتدرّبون عليه.'])}}},
  {{id:'compare',fx:[{{at:-0.3,type:'compare',full:true,o:{{color:'{col}',step:0.5,left:'بنك أسئلة تقليدي',right:'تمريض منطقة الخليج',rows:{J([['صح أو خطأ فقط','لماذا تفوز الإجابة الأكثر أمانًا','لؤلؤة سريرية وفخّ في كل سؤال'],['اختبار واحد','أربعة اختبارات خليجية',r['ex']+' وثلاثة غيره'],['بالإنجليزية فقط','مسرد ثنائي اللغة','العربية والإنجليزية'],['أسئلة فقط','67 أداة · 35 ملفًا · 9 مختبرات',''],['مذاكرة بلا توقّف','Reset & Recharge','استراحات قصيرة لضغط الاختبار']])}}}}}],cap:['**ليس مجرد بنك أسئلة.**']}},
  {{id:'pass',fx:[{{at:-0.2,type:'apps',full:true,o:{{base:BASE,step:0.5,tiles:[{{k:'medlex',n:'MedLex',c:'#60a5fa',b:'1,480 مصطلحًا طبيًا حسب أجزائه'}},{{k:'carecraft',n:'Carecraft',c:'#5eead4',b:'سيناريو من 60 ثانية كل يوم'}},{{k:'lumen',n:'Lumen',c:'#a78bfa',b:'مصادركم وبطاقات الاستذكار والتركيز'}},{{k:'serein',n:'Serein',c:'#34d399',tag:'مجاني',b:'15 تمرين تهدئة'}}]}}}}],
   cap:{J(['**باقة الخليج** تشمل','**ميدلكس وكيركرافت ولومن**.','و**سيرين** مجاني للجميع.'])}}},
  {{id:'cta',cap:{J(['استعدادٌ للاختبار، مصمَّم **'+r['lc']+'**.','**ابدأوا مجانًا اليوم.**'])}}}
 ]}};
"""
  open(P+'config.js','w').write(cfg); print(k,'ok',round(f,2))
