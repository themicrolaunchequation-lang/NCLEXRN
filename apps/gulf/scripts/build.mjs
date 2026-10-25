// Builds the Gulf site: the SNLE study studio (built from apps/snle) as the home, with per-edition layers
// (Qatar, Dubai, Abu Dhabi), plus the exam-comparison hub under /hub/. Output: dist/
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repo=path.resolve(root,'../..');
const snle=path.join(repo,'apps/snle');
const out=path.join(root,'dist');
const PUBLIC=process.env.GULF_PUBLIC==='1'; // set on the live snle project: allow search engines
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').slice(0,12);
execFileSync(process.execPath,[path.join(snle,'build.mjs')],{cwd:snle,stdio:['ignore','ignore','inherit']});
fs.rmSync(out,{recursive:true,force:true});
fs.cpSync(path.join(snle,'dist'),out,{recursive:true});
// --- hub (exam comparison and planner) ---
const hub=path.join(out,'hub');
for(const name of ['index.html','app.js','styles.css','data/exam-profiles.js','engine/assessment-engine.js']){
 const src=path.join(root,name),dest=path.join(hub,name);
 if(!fs.existsSync(src))throw Error('Missing required build input: '+name);
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest);
}
fs.copyFileSync(path.join(repo,'site/assets/js/crown-account.js'),path.join(hub,'crown-account.js'));
// --- edition config (from the verified exam profiles) ---
const {PROFILES,RETAKE_NOTES}=await import(pathToFileURL(path.join(root,'data/exam-profiles.js')));
const meta={
 saudi:{profile:'snle',short:'SNLE',tab:'Saudi',accent:'#087d72',regulatorShort:'SCFHS',region:'Saudi Arabia',theme:'Palm & Teal',
  tiles:[['Questions','200','ok','Two blocks of 100'],['Time','4 hours','ok','2 × 120 minutes, with a scheduled break'],['Pass mark','500','ok','Scaled score, 200–800'],['Attempts','See guide','check','SCFHS sources differ']],
  intro:'200 multiple-choice questions in two blocks of 100, each 120 minutes, with a scheduled break. SCFHS reports a scaled score from 200 to 800; 500 is the pass mark.',
  mix:'SCFHS publishes how many questions come from each area. Practice sets in this studio follow that split.'},
 qatar:{short:'DHP RGN',tab:'Qatar',accent:'#8a1538',regulatorShort:'DHP',region:'Qatar',theme:'Pearl & Maroon',
  tiles:[['Questions','150','ok','Multiple choice'],['Time','3 hours','check','An older DHP document says 3½ hours'],['Pass mark','50%','ok','Published minimum'],['Attempts','Up to 5','check','DHP policy v04']],
  intro:'150 multiple-choice questions. The current DHP exam page says 3 hours; an older DHP blueprint document says 3½ hours, so check the time on your booking confirmation.',
  mix:'DHP publishes how many questions come from each area. Practice sets in this studio follow that split.'},
 dubai:{short:'DHA RN',tab:'Dubai',accent:'#9a6514',regulatorShort:'DHA',region:'Dubai',theme:'Desert Gold',
  tiles:[['Questions','150','ok','Multiple choice'],['Time','3 hours','ok','Includes registration and introduction'],['Pass mark','50%','ok','Result shown as pass or fail'],['Attempts','3 across the UAE','check','A 4th only with permission']],
  intro:'150 multiple-choice questions in 3 hours. The 3 hours includes registration and a short introduction, so your answering time is a little less.',
  mix:'DHA does not publish how many questions come from each area. To keep practice fair, this studio spreads questions across all four areas using its own mix, shown below. It is not the DHA split.'},
 abudhabi:{short:'DOH RN',tab:'Abu Dhabi',accent:'#1f5f8b',regulatorShort:'DOH',region:'Abu Dhabi',theme:'Gulf Sea',
  tiles:[['Questions','150','ok','Multiple choice'],['Time','3 hours','ok','DOH nursing circular, 2024'],['Pass mark','Not published','none','DOH reports pass or fail only'],['Attempts','3 across the UAE','check','A final attempt may be approved']],
  intro:'150 multiple-choice questions in 3 hours (DOH nursing licensing circular, 2024). DOH reports a pass or fail result and does not publish its pass mark.',
  mix:'DOH does not publish how many questions come from each area. To keep practice fair, this studio spreads questions across all four areas using its own mix, shown below. It is not the DOH split.'}
};
const POLICY='Original practice material written for this studio. It is not official exam content, is not endorsed by SCFHS, DHP, DHA or DOH, and does not predict your result. No recalled exam questions are used.';
const editions={};
const m0=id=>meta[id].profile||id;
for(const id of Object.keys(meta)){
 const p=PROFILES[m0(id)],m=meta[id];
 editions[id]={...m,fullName:p.fullName,regulator:p.regulator,questions:p.questions,minutes:p.minutes,sources:p.sources,domains:p.domains.map(d=>({label:d.label,count:d.count})),facts:p.questions+' questions · '+(p.minutes/60)+' hours',notes:{retake:RETAKE_NOTES[m0(id)]},tiles:m.tiles.map(([k,v,s,n])=>({k,v,s,n}))};
}
const acct=fs.readFileSync(path.join(repo,'site/assets/js/crown-account.js'),'utf8');
const sbKey=(acct.match(/const KEY = '(sb_publishable_[^']+)'/)||[])[1],sbUrl=(acct.match(/const SUPABASE = '([^']+)'/)||[])[1];
if(!sbKey||!sbUrl)throw Error('Account sync: publishable key or URL not found in crown-account.js');
const cfg={order:['saudi','qatar','dubai','abudhabi'],editions,policy:POLICY,checked:'23 October 2026',sb:{url:sbUrl,key:sbKey}};
const files={
 pre:fs.readFileSync(path.join(root,'studio/pre.js'),'utf8'),
 data:fs.readFileSync(path.join(root,'studio/data.js'),'utf8'),
 cfg:'window.GULF_CONFIG='+JSON.stringify(cfg)+';',
 ui:fs.readFileSync(path.join(root,'studio/ui.js'),'utf8'),
 slides:fs.readFileSync(path.join(root,'studio/slides.js'),'utf8'),
 sync:fs.readFileSync(path.join(root,'studio/sync.js'),'utf8'),
 css:fs.readFileSync(path.join(root,'studio/edition.css'),'utf8')
};
// self-hosted fonts (SIL OFL; the CSP blocks font services)
const fontSrc=path.join(root,'studio/fonts'),fontNames=fs.readdirSync(fontSrc).filter(f=>f.endsWith('.woff2'));
fs.mkdirSync(path.join(out,'assets/fonts'),{recursive:true});
for(const f of fs.readdirSync(fontSrc))fs.copyFileSync(path.join(fontSrc,f),path.join(out,'assets/fonts',f));
const urls={};
for(const [k,ext] of [['pre','js'],['data','js'],['cfg','js'],['ui','js'],['slides','js'],['sync','js'],['css','css']]){
 const name='/assets/gulf-'+k+'.'+sha(files[k])+'.'+ext;urls[k]=name;
 fs.writeFileSync(path.join(out,name.slice(1)),files[k]);
}
// --- patch the studio page ---
const ip=path.join(out,'index.html');let html=fs.readFileSync(ip,'utf8');
const after=(re,add)=>{const m=html.match(re);if(!m)throw Error('Studio page anchor missing: '+re);html=html.replace(m[0],m[0]+add)};
after(/<script defer src="\/assets\/prelude\.[a-f0-9]+\.js"><\/script>/,'<script defer src="'+urls.pre+'"></script>');
after(/<script defer src="\/assets\/guidance\.[a-f0-9]+\.js"><\/script>/,'<script defer src="'+urls.cfg+'"></script><script defer src="'+urls.data+'"></script>');
after(/<script defer src="\/assets\/integration\.[a-f0-9]+\.js"><\/script>/,'<script defer src="'+urls.ui+'"></script><script defer src="'+urls.sync+'"></script><link rel="stylesheet" href="'+urls.css+'">');
html=html.replace(/<meta name="description"[^>]*>/,'<meta name="description" content="Gulf Nursing Licensure Studio: independent educational practice for the Saudi, Qatar, Dubai and Abu Dhabi nursing licensing exams. Not official exam content.">').replace(/<link rel="canonical"[^>]*>/,PUBLIC?'<link rel="canonical" href="https://snle.healthcarecrownacademy.co.uk/">':'<meta name="robots" content="noindex,nofollow">').replace('content="snle"','content="gulf"')
 .replace(/<title>[\s\S]*?<\/title>/,'<title>Gulf Nursing Licensure Studio | Healthcare Crown Academy</title>');
html=html.replace(/\n\\n\\n\n/g,'\n');
fs.writeFileSync(ip,html);
// --- patch the studio app: edition-aware guide, domain weights, mock lengths ---
const appFile=fs.readdirSync(path.join(out,'assets')).find(f=>/^app\.[a-f0-9]+\.js$/.test(f));
let app=fs.readFileSync(path.join(out,'assets',appFile),'utf8');
const rep=(from,to,label,n=1)=>{if(app.split(from).length-1!==n)throw Error('Studio patch failed: '+label);app=app.split(from).join(to)};
rep('function guidePage(){','function guidePage(){if(window.GULF_GUIDE)return window.GULF_GUIDE();','edition guide');
for(const [pct,key] of [['20%','f'],['40%','a'],['30%','m'],['10%','l']])rep('weight:"'+pct+'"','weight:(window.GULF_WEIGHTS||{}).'+key+'||"'+pct+'"','weight '+pct);
rep("const mock=(n)=>shuffle([['Nursing Fundamentals',.2],['Adult Nursing',.4],['Maternal-Child Nursing',.3],['Nursing Management and Leadership',.1]].flatMap(([d,r])=>shuffle(Q.filter(q=>q.domain===d)).slice(0,Math.round(n*r))));",
 "const mock=(n)=>{const R=window.GULF_RATIOS||[['Nursing Fundamentals',.2],['Adult Nursing',.4],['Maternal-Child Nursing',.3],['Nursing Management and Leadership',.1]];const take=R.map(([d,r])=>[d,Math.floor(n*r),n*r-Math.floor(n*r)]);let left=n-take.reduce((a,t)=>a+t[1],0);if(window.GULF_RATIOS){[...take].sort((a,b)=>b[2]-a[2]).forEach(t=>{if(left>0){t[1]++;left--}})}return shuffle(take.flatMap(([d,k])=>shuffle(Q.filter(q=>q.domain===d)).slice(0,window.GULF_RATIOS?k:Math.round(n*(R.find(x=>x[0]===d)||[0,0])[1]))))};",'mock ratios');
rep('<span class="eyebrow">BLUEPRINT · 20 / 40 / 30 / 10</span>','<span class="eyebrow">${window.GULF_BP_EYEBROW||\'BLUEPRINT · 20 / 40 / 30 / 10\'}</span>','mock eyebrow');
rep('<p>20% Nursing Fundamentals · 40% Adult Nursing · 30% Maternal–Child Nursing · 10% Management & Leadership.</p>','<p>${window.GULF_BP_TEXT||\'20% Nursing Fundamentals · 40% Adult Nursing · 30% Maternal–Child Nursing · 10% Management & Leadership.\'}</p>','mock blueprint text');
rep("colorMode:snleStorage.getItem('snle-color-mode')||'green'","colorMode:window.GULF_EDITION?'green':(snleStorage.getItem('snle-color-mode')||'green')",'edition colour mode');
rep("catalogView:snleStorage.getItem('snle-catalog-view')||'cards'","catalogView:snleStorage.getItem('snle-catalog-view')||(window.GULF_EDITION?'compact':'cards')",'compact tools default');
rep('[20,50,100,200].map','(window.GULF_MOCKS||[20,50,100,200]).map','mock lengths');
const appNew='app.'+sha(app)+'.js';
fs.writeFileSync(path.join(out,'assets',appNew),app);
if(appNew!==appFile)fs.rmSync(path.join(out,'assets',appFile));
{const hp=path.join(out,'index.html');let h=fs.readFileSync(hp,'utf8');if(!h.includes('/assets/'+appFile))throw Error('app reference missing');fs.writeFileSync(hp,h.split('/assets/'+appFile).join('/assets/'+appNew));}
const appUrl='/assets/'+appNew,appOld='/assets/'+appFile;
// --- Study libraries (question bank, dossier bank, tool library): edition wording, palette and fonts ---
let libSwap=null;
{const A=path.join(out,'assets'),libFile=fs.readdirSync(A).find(f=>/^library\.[a-f0-9]+\.js$/.test(f));
 let lib=fs.readFileSync(path.join(A,libFile),'utf8');
 if(!lib.includes('← SNLE learning studio'))throw Error('Library patch failed: back link');
 lib=lib.split('← SNLE learning studio').join('← Back to the study studio');
 const keep='let selected = records.filter(r => (';
 if(lib.split(keep).length!==2)throw Error('Library patch failed: review filter');
 lib=lib.replace(keep,'let selected = records.filter(r => (!window.GULF_LIB_KEEP || window.GULF_LIB_KEEP(r)) && (');
 if(!lib.includes('Clinical expert review remains pending.'))throw Error('Library patch failed: release wording');
 lib=lib.split('Clinical expert review remains pending.').join('Approved for release by the Academy owner.');
 const libNew='library.'+sha(lib)+'.js';fs.writeFileSync(path.join(A,libNew),lib);if(libNew!==libFile)fs.rmSync(path.join(A,libFile));
 const titles={questions:'Question bank',dossiers:'Clinical Dossier bank',tools:'Clinical tool library'};
 for(const f of fs.readdirSync(out).filter(n=>/^SNLE_.*\.html$/.test(n))){
  const fp=path.join(out,f);let h=fs.readFileSync(fp,'utf8');const mode=(h.match(/data-library="([a-z]+)"/)||[])[1];if(!mode)continue;
  const dataTag=(h.match(/<script defer src="\/assets\/(?:data|dossiers)\.[a-f0-9]+\.js"><\/script>/)||[])[0];if(!dataTag)throw Error('Library page data script missing: '+f);
  const pre='<script defer src="'+urls.pre+'"></script>',layer='<script defer src="'+urls.cfg+'"></script><script defer src="'+urls.data+'"></script>';
  const acctFile=fs.readdirSync(path.join(out,'assets')).find(f=>/^crown-account\.[a-f0-9]+\.js$/.test(f));
  const slides='<script defer src="'+urls.slides+'"></script>'+(acctFile?'<script defer src="/assets/'+acctFile+'"></script>':'')+'<script defer src="'+urls.sync+'"></script>';
  // dossiers: the wording layer must be in place before the dossier file assigns its data; others: after the shared data
  h=h.replace(dataTag,mode==='dossiers'?pre+layer+dataTag:pre+dataTag+layer)
   .split('/assets/'+libFile).join('/assets/'+libNew)
   .replace('<script defer src="/assets/'+libNew+'"></script>','<script defer src="/assets/'+libNew+'"></script>'+slides)
   .replace('</head>','<link rel="stylesheet" href="'+urls.css+'">'+(PUBLIC?'':'<meta name="robots" content="noindex,nofollow">')+'</head>')
   .replace(/<title>[^<]*<\/title>/,'<title>'+titles[mode]+' | Gulf Nursing Licensure Studio</title>').replace('Return to SNLE','Return to the study studio');
  fs.writeFileSync(fp,h);
 }
 libSwap=[libFile,libNew];
}
// --- Interactive Labs: neutral wording (the posters' own artwork still carries the original series title) ---
const labsDir=path.join(out,'SNLE_Decoder_Interactive_Labs_v3');
if(fs.existsSync(labsDir))for(const f of fs.readdirSync(labsDir).filter(n=>/\.(html|js)$/.test(n))){
 const fp=path.join(labsDir,f);let t=fs.readFileSync(fp,'utf8');
 t=t.replace(/Saudi Nursing Licensure Examination/g,'the regulator\u2019s nursing licensing examination').replace(/\bSNLE\b/g,'Exam').replace(/\bSaudi\b/g,'local');
 fs.writeFileSync(fp,t);
}
// service worker: precache the new assets, new cache name
const swp=path.join(out,'sw.js');let sw=fs.readFileSync(swp,'utf8');
sw=sw.split(appOld).join(appUrl);sw=sw.split('/assets/'+libSwap[0]).join('/assets/'+libSwap[1]);
const buildId=sha(Object.values(urls).join('')+app+fs.readdirSync(path.join(out,'assets')).sort().join(''));
sw=sw.replace(/CACHE='snle-web-[a-f0-9]+'/,"CACHE='gulf-web-"+buildId+"'").replace(/snle-web-/g,'gulf-web-');
sw=sw.replace('SHELL=[','SHELL=['+[...Object.values(urls),...fontNames.map(f=>'/assets/fonts/'+f)].map(u=>JSON.stringify(u)).join(',')+',"/hub/",').replace(/CACHE='snle-web-/,"CACHE='gulf-web-");
fs.writeFileSync(swp,sw);
const mp=path.join(out,'manifest.webmanifest'),mf=JSON.parse(fs.readFileSync(mp,'utf8'));mf.name='Gulf Nursing Licensure Studio';mf.short_name='Gulf Nursing';fs.writeFileSync(mp,JSON.stringify(mf,null,2));
// headers: the studio's own policy plus noindex everywhere (preview)
let hd=fs.readFileSync(path.join(out,'_headers'),'utf8');
if(!PUBLIC)hd=hd.replace('/*\n','/*\n  X-Robots-Tag: noindex, nofollow\n');
fs.writeFileSync(path.join(out,'_headers'),hd);
{const rp=path.join(out,'_redirects'),prev=fs.existsSync(rp)?fs.readFileSync(rp,'utf8'):'';
 fs.writeFileSync(rp,prev+['/question-bank /SNLE_Question_Bank_ViewOnly_v19.html 200','/dossier-bank /SNLE_Clinical_Dossier_Question_Bank_ViewOnly_v23_1_Smaller_Stem.html 200','/tool-library /SNLE_All_Tools_ViewOnly_v19.html 200'].join('\n')+'\n')}
fs.writeFileSync(path.join(out,'robots.txt'),PUBLIC?'User-agent: *\nAllow: /\n':'User-agent: *\nDisallow: /\n');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
console.log('PASS Gulf studio + hub output ('+pkg.name+')');
for(const n of ['index.html','sw.js','_headers','hub/index.html',...Object.values(urls).map(u=>u.slice(1))])console.log(n+' '+fs.statSync(path.join(out,n)).size+' bytes');
