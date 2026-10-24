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
const {PROFILES,RETAKE_NOTES,TIMING_NOTES,CONTENT_POLICY}=await import(pathToFileURL(path.join(root,'data/exam-profiles.js')));
const meta={
 qatar:{short:'DHP RGN',tab:'Qatar',accent:'#8a2f4b',regulatorShort:'DHP',region:'Qatar'},
 dubai:{short:'DHA RN',tab:'Dubai',accent:'#a96b1d',regulatorShort:'DHA',region:'Dubai'},
 abudhabi:{short:'DOH RN',tab:'Abu Dhabi',accent:'#3f5f8f',regulatorShort:'DOH',region:'Abu Dhabi'}
};
const editions={};
for(const id of Object.keys(meta)){
 const p=PROFILES[id],m=meta[id];
 const w=p.domains.every(d=>Number.isInteger(d.count))?'Domain weights '+p.domains.map(d=>d.count).join(' / '):'Domain weights not published';
 const pts=[p.questions+' questions',(p.minutes/60)+' hours'+(id==='qatar'?' (duration disputed)':id==='dubai'?' (includes registration and introduction)':''),
  id==='abudhabi'?'Pass mark not published':String(p.pass).replace(/;.*$/,''),w,RETAKE_NOTES[id]].filter(Boolean);
 editions[id]={...m,fullName:p.fullName,regulator:p.regulator,questions:p.questions,minutes:p.minutes,pass:id==='abudhabi'?'Not published in the sources reviewed':String(p.pass).replace(/;.*$/,''),formatNote:p.formatNote,warning:p.warning,sources:p.sources,domains:p.domains.map(d=>({label:d.label,count:d.count})),facts:p.questions+' questions · '+(p.minutes/60)+' hours',points:pts.slice(0,4),notes:{retake:RETAKE_NOTES[id],timing:TIMING_NOTES[id]||''}};
}
const cfg={order:['qatar','dubai','abudhabi'],editions,policy:CONTENT_POLICY};
const files={
 pre:fs.readFileSync(path.join(root,'studio/pre.js'),'utf8'),
 data:fs.readFileSync(path.join(root,'studio/data.js'),'utf8'),
 cfg:'window.GULF_CONFIG='+JSON.stringify(cfg)+';',
 ui:fs.readFileSync(path.join(root,'studio/ui.js'),'utf8'),
 css:fs.readFileSync(path.join(root,'studio/edition.css'),'utf8')
};
const urls={};
for(const [k,ext] of [['pre','js'],['data','js'],['cfg','js'],['ui','js'],['css','css']]){
 const name='/assets/gulf-'+k+'.'+sha(files[k])+'.'+ext;urls[k]=name;
 fs.writeFileSync(path.join(out,name.slice(1)),files[k]);
}
// --- patch the studio page ---
const ip=path.join(out,'index.html');let html=fs.readFileSync(ip,'utf8');
const after=(re,add)=>{const m=html.match(re);if(!m)throw Error('Studio page anchor missing: '+re);html=html.replace(m[0],m[0]+add)};
after(/<script defer src="\/assets\/prelude\.[a-f0-9]+\.js"><\/script>/,'<script defer src="'+urls.pre+'"></script>');
after(/<script defer src="\/assets\/guidance\.[a-f0-9]+\.js"><\/script>/,'<script defer src="'+urls.cfg+'"></script><script defer src="'+urls.data+'"></script>');
after(/<script defer src="\/assets\/integration\.[a-f0-9]+\.js"><\/script>/,'<script defer src="'+urls.ui+'"></script><link rel="stylesheet" href="'+urls.css+'">');
html=html.replace(/<meta name="description"[^>]*>/,'<meta name="description" content="Gulf Region Exams: independent educational practice for the Qatar, Dubai and Abu Dhabi nursing licensing exams. Not official exam content.">').replace(/<link rel="canonical"[^>]*>/,'<meta name="robots" content="noindex,nofollow">').replace('content="snle"','content="gulf"')
 .replace(/<title>[\s\S]*?<\/title>/,'<title>Gulf Region Exams | Healthcare Crown Academy</title>');
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
rep('[20,50,100,200].map','(window.GULF_MOCKS||[20,50,100,200]).map','mock lengths');
fs.writeFileSync(path.join(out,'assets',appFile),app);
// --- Interactive Labs: neutral wording (the posters' own artwork still carries the original series title) ---
const labsDir=path.join(out,'SNLE_Decoder_Interactive_Labs_v3');
if(fs.existsSync(labsDir))for(const f of fs.readdirSync(labsDir).filter(n=>/\.(html|js)$/.test(n))){
 const fp=path.join(labsDir,f);let t=fs.readFileSync(fp,'utf8');
 t=t.replace(/Saudi Nursing Licensure Examination/g,'the regulator\u2019s nursing licensing examination').replace(/\bSNLE\b/g,'Exam').replace(/\bSaudi\b/g,'local');
 fs.writeFileSync(fp,t);
}
// service worker: precache the new assets, new cache name
const swp=path.join(out,'sw.js');let sw=fs.readFileSync(swp,'utf8');
sw=sw.replace('SHELL=[','SHELL=['+Object.values(urls).map(u=>JSON.stringify(u)).join(',')+',"/hub/",').replace(/CACHE='snle-web-/,"CACHE='gulf-web-");
fs.writeFileSync(swp,sw);
const mp=path.join(out,'manifest.webmanifest'),mf=JSON.parse(fs.readFileSync(mp,'utf8'));mf.name='Gulf Region Exams';mf.short_name='Gulf Exams';fs.writeFileSync(mp,JSON.stringify(mf,null,2));
// headers: the studio's own policy plus noindex everywhere (preview)
let hd=fs.readFileSync(path.join(out,'_headers'),'utf8');
hd=hd.replace('/*\n','/*\n  X-Robots-Tag: noindex, nofollow\n');
fs.writeFileSync(path.join(out,'_headers'),hd);
fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
console.log('PASS Gulf studio + hub output ('+pkg.name+')');
for(const n of ['index.html','sw.js','_headers','hub/index.html',...Object.values(urls).map(u=>u.slice(1))])console.log(n+' '+fs.statSync(path.join(out,n)).size+' bytes');
