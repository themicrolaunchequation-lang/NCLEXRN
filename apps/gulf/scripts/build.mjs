import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
for(const name of ['index.html','app.js','styles.css','data/exam-profiles.js','engine/assessment-engine.js']){
 const src=path.join(root,name),dest=path.join(out,name);
 if(!fs.existsSync(src))throw Error('Missing required build input: '+name);
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 fs.copyFileSync(src,dest);
}
fs.writeFileSync(path.join(out,'_headers'),[
 '/*',
 '  X-Content-Type-Options: nosniff',
 '  Referrer-Policy: strict-origin-when-cross-origin',
 '  X-Frame-Options: DENY',
 "  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
 '  Permissions-Policy: geolocation=(), camera=(), microphone=()',
 '',
 '/index.html',
 '  Cache-Control: no-store',
 '  X-Robots-Tag: noindex, nofollow',
 ''
].join('\n'));
fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
console.log('PASS isolated Cloudflare Pages output ('+manifest.name+')');
for(const name of ['index.html','app.js','styles.css','data/exam-profiles.js','engine/assessment-engine.js','_headers','robots.txt']){
 const s=fs.statSync(path.join(out,name));console.log(name+' '+s.size+' bytes');
}
