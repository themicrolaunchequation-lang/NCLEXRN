import fs from'node:fs';import path from'node:path';import zlib from'node:zlib';import crypto from'node:crypto';import vm from'node:vm';import assert from'node:assert/strict';import{fileURLToPath}from'node:url';import{parse}from'@babel/parser';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8'),digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const original=zlib.gunzipSync(fs.readFileSync(path.join(ROOT,'source/original.html.gz'))),meta=JSON.parse(read('source/provenance.json')),built=JSON.parse(read('reports/build-integrity.json'));
assert.equal(digest(original),meta.sha256);
const scripts=[...original.toString().replace(/\r\n/g,'\n').matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].map(x=>x[2]),source={window:{}},hosted={window:{}};
vm.runInNewContext(scripts[0],source,{timeout:5000});vm.runInNewContext(fs.readFileSync(path.join(ROOT,'dist',built.urls.data),'utf8'),hosted,{timeout:5000});
const normalize=v=>JSON.parse(JSON.stringify(v)),src=normalize(source.window),out=normalize(hosted.window),assets=[];
function validate(v){
 if(typeof v==='string')return v.replace(/data:(image\/(?:webp|png|jpeg|svg\+xml)|font\/woff2);base64,([A-Za-z0-9+/=]+)/g,(_,type,b64)=>{const bytes=Buffer.from(b64,'base64'),ext={'image/webp':'webp','image/png':'png','image/jpeg':'jpg','image/svg+xml':'svg','font/woff2':'woff2'}[type],name='/assets/media/'+digest(bytes).slice(0,16)+'.'+ext;assert.equal(digest(fs.readFileSync(path.join(ROOT,'dist',name))),digest(bytes));assets.push(name);return name});
 if(Array.isArray(v))return v.map(validate);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,validate(x)]));return v;
}
assert.deepEqual(validate(src),out);
// Verify every embedded asset in the complete attachment, including CSS imagery.
validate(original.toString());
const Q=out.SNLE_QUESTIONS,P=out.SNLE_POSTERS;assert.equal(Q.length,1350);assert.equal(P.length,67);assert.equal(out.SNLE_LEARNING.glossary.length,62);assert.equal(new Set(Q.map(q=>q.id)).size,1350);
for(const q of Q){assert.equal(q.options.length,4,q.id);assert(q.options.some(o=>o.label===q.key),q.id);assert(q.rationale.length>0,q.id)}
function walk(n,fn){if(!n||typeof n!=='object')return;fn(n);for(const[k,v]of Object.entries(n))if(k!=='loc'&&k!=='tokens'){if(Array.isArray(v))v.forEach(x=>walk(x,fn));else if(v&&typeof v==='object')walk(v,fn)}}
function names(code){const a=[];walk(parse(code),n=>{if(n.type==='FunctionDeclaration'&&n.id)a.push(n.id.name)});return a}
const app=fs.readFileSync(path.join(ROOT,'dist',built.urls.app),'utf8'),before=names(scripts[1]),after=names(app);for(const n of before)assert(after.includes(n),'Preserve function '+n);
function dossiers(code){let result;walk(parse(code),n=>{if(n.type==='VariableDeclarator'&&n.id?.name==='CLINICAL_DOSSIERS')result=JSON.parse(code.slice(n.init.start,n.init.end))});return result}
const ds=dossiers(scripts[1]);assert.deepEqual(ds,dossiers(app));assert.equal(ds.length,35);
const libraryData={window:{}};vm.runInNewContext(fs.readFileSync(path.join(ROOT,'dist',built.urls.dossiers),'utf8'),libraryData);assert.deepEqual(normalize(libraryData.window.SNLE_DOSSIERS),ds);
assert(!/\sonclick=/.test(app),'No inline handlers under strict CSP');assert(built.maxFileBytes<=25*1024*1024);
const report={originalSha256:meta.sha256,questions:Q.length,posters:P.length,glossary:62,dossiers:ds.length,dossierCases:ds.reduce((n,d)=>n+d.qs.length,0),preservedFunctions:before.length,uniqueAssetsVerified:new Set(assets).size,questionTextAndKeys:'unchanged',originalRecoverable:true,clinicalExpertValidation:'pending in imported source',missingDependencies:meta.missingDependencies};
fs.writeFileSync(path.join(ROOT,'reports/source-preservation.json'),JSON.stringify(report,null,2)+'\n');console.log('PASS source, every question field and key, posters, glossary, dossiers, binary images, original functions and Cloudflare size limits');
