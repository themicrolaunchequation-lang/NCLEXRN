import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const ROOT=path.dirname(fileURLToPath(import.meta.url)),OUT=path.join(ROOT,'dist'),REPO=path.resolve(ROOT,'../..');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const original=zlib.gunzipSync(fs.readFileSync(path.join(ROOT,'source/original.html.gz'))),provenance=JSON.parse(read('source/provenance.json'));
if(sha(original)!==provenance.sha256)throw Error('Original source integrity failure');
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
const written=new Map();
function write(name,data){const p=path.join(OUT,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,data);written.set(name,Buffer.byteLength(data));return '/'+name}
function bundle(label,text,ext){return write('assets/'+label+'.'+sha(text).slice(0,12)+'.'+ext,text)}
function patch(s,from,to,label,n=1){if(s.split(from).length-1!==n)throw Error('Source patch failed: '+label);return s.split(from).join(to)}
const extensions={'image/webp':'webp','image/png':'png','image/jpeg':'jpg','image/svg+xml':'svg','font/woff2':'woff2'};
let html=original.toString().replace(/\r\n/g,'\n'),assets=0;
html=html.replace(/data:(image\/(?:webp|png|jpeg|svg\+xml)|font\/woff2);base64,([A-Za-z0-9+/=]+)/g,(_,type,b64)=>{
 const b=Buffer.from(b64,'base64'),name='assets/media/'+sha(b).slice(0,16)+'.'+extensions[type];
 if(!written.has(name)){write(name,b);assets++}return '/'+name;
});
const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].map(m=>m[2]);
if(scripts.length!==3)throw Error('Expected three original scripts');
const ctx={window:{}};vm.runInNewContext(scripts[0],ctx,{timeout:5000});
const P=ctx.window.SNLE_POSTERS,Q=ctx.window.SNLE_QUESTIONS,L=ctx.window.SNLE_LEARNING,qids=new Set(Q.map(q=>q.id));
const dossierSource=scripts[1].match(/const CLINICAL_DOSSIERS=(\[[^\n]*\]);/);
if(!dossierSource)throw Error('Cannot extract preserved dossier records');
const dossiers=JSON.parse(dossierSource[1]);
if(P.length!==67||Q.length!==1350||qids.size!==1350)throw Error('Source counts changed unexpectedly');
for(const p of P)if(p.questionIds.some(id=>!qids.has(id)))throw Error('Missing linked question: '+p.id);
let app=scripts[1].replace(/\blocalStorage\./g,'snleStorage.');
app=patch(app,"const P=window.SNLE_POSTERS","const snleStorage=window.SNLEStorage;\n    const P=window.SNLE_POSTERS",'safe storage');
app=patch(app,"['reset','reset','Reset & Recharge','Wellbeing']","['reset','reset','Reset & Recharge','Wellbeing'],['progress','chart','My Progress','You']",'progress navigation');
app=patch(app,'<strong>SNLE Evidence Lab</strong><span>React & Interact · HTML</span>','<strong>SNLE</strong><span>Healthcare Crown Academy</span>','suite branding');
app=patch(app,'<div class="brand-mark">${icon("heart")}</div>','<img class="snle-crest" src="/assets/crest.svg" width="43" height="43" alt="">','Academy crest');
app=patch(app,'<button class="avatar">HF</button>','','remove nonfunctional profile placeholder');
app=patch(app,'</main>${glossaryAnnotatorMarkup()}','</main><nav class="snle-mobile-tabs" aria-label="SNLE mobile navigation">${[[\'home\',\'Today\'],[\'tools\',\'Tools\'],[\'practice\',\'Practice\'],[\'progress\',\'Progress\']].map(([id,label])=>\u0060<button data-nav="\u0024{id}" aria-current="\u0024{state.view===id?\'page\':\'false\'}">\u0024{label}</button>\u0060).join(\'\')}</nav>${glossaryAnnotatorMarkup()}','mobile navigation');
app=app.replace(/ onclick="[^"]*"/g,' data-snle-focus');
app=patch(app,'if (labsMount) {','if (labsMount && window.SNLE_HAS_LABS) {','missing lab guard');
app=patch(app,'function labsPage(){','function labsPage(){if(!window.SNLE_HAS_LABS)return \'<div class="page-content"><span class="eyebrow">INTERACTIVE LABS</span><h1>Your labs library</h1><p>The separate Interactive Labs collection is not available in this edition yet. Your clinical tools, posters and practice questions remain available.</p><button class="primary-button" data-nav="tools">Explore React &amp; Interact</button></div>\';','lab availability panel');
app=patch(app,"const app=document.getElementById('app');","const app=document.getElementById('app');\n"+read('src/runtime-hooks.js'),'route hooks');
app=patch(app,"clearInterval(resetTimer);state.view=b.dataset.nav;state.session=[];state.index=0;render();","clearInterval(resetTimer);clearInterval(window.__examClock);state.examSimulation=false;state.view=b.dataset.nav;state.session=[];state.index=0;render();",'stop exam timer when leaving');
app=patch(app,'function render(){','function render(){\n      syncSnleRoute();const renderTicket=++snleRenderTicket;const account=app.querySelector(\'.hca-acct\');if(account)document.body.append(account);','render route and account preservation');
app=patch(app,'setTimeout(() => {\n          app.innerHTML = shell(content);','setTimeout(() => {\n          if(renderTicket!==snleRenderTicket)return;\n          app.innerHTML = shell(content);','avoid stale transition render');
app=patch(app,'const sizeOptions=[[.98,','if(state.tab===\'learn\')content+=window.SNLEGuidance.render(p);\n      const sizeOptions=[[.98,','per-tool Decision Lens scenarios');
app=patch(app,'<div class="standalone-modal ${state.focus?','<div role="dialog" aria-modal="true" aria-label="${esc(p.title)}" class="standalone-modal ${state.focus?','tool dialog semantics');
app=app.replace(/<img src="\$\{p\.dataUri\}"/g,'<img loading="lazy" decoding="async" src="${p.dataUri}"');
let master=scripts[2].replace(/\blocalStorage\./g,'window.SNLEStorage.');
master=patch(master,'obs.observe(document.body, { childList: true, subtree: true });',"obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });",'native dialog close visibility');
const styles=[...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n'),shared=p=>fs.readFileSync(path.join(REPO,p),'utf8');
const urls={
 prelude:bundle('prelude',read('src/prelude.js'),'js'),data:bundle('data',scripts[0],'js'),
 guidance:bundle('guidance',read('src/guidance.js'),'js'),app:bundle('app',app,'js'),
 master:bundle('enhancements',master,'js'),account:bundle('crown-account',shared('site/assets/js/crown-account.js'),'js'),
 shell:bundle('hca-shell',shared('apps/shared/hca-shell.js'),'js'),integration:bundle('integration',read('src/integration.js'),'js'),
 css:bundle('app',styles+'\n'+shared('apps/shared/hca-shell.css')+'\n'+read('src/integration.css'),'css'),
 library:bundle('library',read('src/library.js'),'js'),libraryCss:bundle('library',read('src/library.css'),'css'),
 dossiers:bundle('dossiers','window.SNLE_DOSSIERS='+JSON.stringify(dossiers)+';','js')
};
html=html.replace(/<script[^>]*>[\s\S]*?<\/script>/g,'').replace(/<style[^>]*>[\s\S]*?<\/style>/g,'');
html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>SNLE Clinical Learning Studio | Healthcare Crown Academy</title>');
html=html.replace('</head>','<meta name="hca-app" content="snle"><link rel="canonical" href="https://snle.healthcarecrownacademy.co.uk/"><link rel="icon" href="/assets/crest.svg" type="image/svg+xml"><link rel="manifest" href="/manifest.webmanifest"><link rel="stylesheet" href="'+urls.css+'">'+['prelude','data','guidance','app','master','account','shell','integration'].map(k=>'<script defer src="'+urls[k]+'"></script>').join('')+'</head>');
html=html.replace('<div id="app">','<a class="snle-skip" href="#snle-content">Skip to learning content</a><div id="app">');
html=html.replace('</body>','<noscript><p>SNLE needs JavaScript to run. <a href="https://healthcarecrownacademy.co.uk/">Return to Healthcare Crown Academy</a>.</p></noscript></body>');
write('assets/crest.svg',fs.readFileSync(path.join(REPO,'site/assets/img/favicon.svg')));
const labsPath=path.join(ROOT,'source/SNLE_Decoder_Interactive_Labs_v3'),hasLabs=fs.existsSync(labsPath);
if(hasLabs)fs.cpSync(labsPath,path.join(OUT,'SNLE_Decoder_Interactive_Labs_v3'),{recursive:true});
write('assets/labs-status.js','window.SNLE_HAS_LABS='+JSON.stringify(hasLabs)+';');
html=html.replace('<script defer src="'+urls.data+'">','<script defer src="/assets/labs-status.js"></script><script defer src="'+urls.data+'">');write('index.html',html);
write('404.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Page not found · SNLE</title><h1>Page not found</h1><p><a href="/">Return to SNLE Clinical Learning Studio</a></p></html>');
write('manifest.webmanifest',JSON.stringify({name:'SNLE Clinical Learning Studio',short_name:'SNLE',start_url:'/',scope:'/',display:'standalone',theme_color:'#10253A',background_color:'#F8F5EF',icons:[{src:'/assets/crest.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]},null,2));
write('_headers',read('src/headers.txt'));
for(const [name,mode,title]of[
 ['SNLE_All_Tools_ViewOnly_v19.html','tools','Clinical tool library'],
 ['SNLE_Question_Bank_ViewOnly_v19.html','questions','Practice question library'],
 ['SNLE_Clinical_Dossier_Question_Bank_ViewOnly_v23_1_Smaller_Stem.html','dossiers','Dossier question library']
])write(name,'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+' | SNLE</title><link rel="icon" href="/assets/crest.svg"><link rel="stylesheet" href="'+urls.libraryCss+'"><script defer src="'+(mode==='dossiers'?urls.dossiers:urls.data)+'"></script><script defer src="'+urls.library+'"></script></head><body data-library="'+mode+'"><main id="library"></main><noscript>This study library requires JavaScript. <a href="/">Return to SNLE</a>.</noscript></body></html>');
const buildHash=sha(Object.values(urls).join('')+provenance.sha256+hasLabs).slice(0,16);
write('sw.js',read('src/worker.js').replace('__BUILD__',buildHash).replace('__SHELL__',JSON.stringify(['/',...Object.values(urls),'/assets/labs-status.js','/assets/crest.svg','/manifest.webmanifest'])));
const maxFile=Math.max(...written.values());if(maxFile>25*1024*1024)throw Error('Asset exceeds Cloudflare Pages 25 MiB limit');
const report={sourceSha256:provenance.sha256,buildHash,posters:P.length,questions:Q.length,glossary:L.glossary.length,assets,files:written.size,maxFileBytes:maxFile,totalBytes:[...written.values()].reduce((a,b)=>a+b,0),labs:hasLabs?'included':'missing external package',urls};
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});fs.writeFileSync(path.join(ROOT,'reports/build-integrity.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
