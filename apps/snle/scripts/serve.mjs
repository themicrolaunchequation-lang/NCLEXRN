import fs from'node:fs';import path from'node:path';import http from'node:http';import https from'node:https';import zlib from'node:zlib';import{fileURLToPath}from'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),DIST=path.join(ROOT,'dist'),SITE=path.resolve(ROOT,'../../site'),port=+(process.env.PORT||4173),cert=process.env.SNLE_CERT_DIR;
const mime={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',json:'application/json',webmanifest:'application/manifest+json',svg:'image/svg+xml',webp:'image/webp',png:'image/png',jpg:'image/jpeg',woff2:'font/woff2'};
const rules=[];let rule=null;for(const l of fs.readFileSync(path.join(DIST,'_headers'),'utf8').split('\n')){if(!l.trim())continue;if(!l.startsWith(' ')){rule={path:l.trim(),headers:{}};rules.push(rule)}else if(rule){const at=l.indexOf(':');if(at>0)rule.headers[l.slice(0,at).trim()]=l.slice(at+1).trim()}}
const handler=(req,res)=>{
 let url;try{url=new URL(req.url,'http://localhost')}catch{res.writeHead(400);return res.end()}
 const main=(req.headers.host||'').split(':')[0]==='healthcarecrownacademy.co.uk',base=main?SITE:DIST;
 if(process.env.SNLE_BASELINE==='1'&&url.pathname==='/_original.html'){res.writeHead(200,{'Content-Type':mime.html});return res.end(zlib.gunzipSync(fs.readFileSync(path.join(ROOT,'source/original.html.gz'))))}
 let p;try{p=decodeURIComponent(url.pathname)}catch{res.writeHead(400);return res.end()}if(main&&p==='/')p='/home.html';
 const full=path.resolve(base,p==='/'?'index.html':p.slice(1));if(!full.startsWith(base+path.sep)){res.writeHead(403);return res.end()}
 const file=[full,full+'.html',path.join(full,'index.html')].find(p=>{try{return fs.statSync(p).isFile()}catch{return false}}),headers={};
 if(!main)for(const r of rules)if(new RegExp('^'+r.path.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*')+'$').test(p))Object.assign(headers,r.headers);
 if(!file){res.writeHead(404,{'Content-Type':mime.html,...headers});return res.end(fs.readFileSync(path.join(DIST,'404.html')))}
 res.writeHead(200,{...headers,'Content-Type':mime[path.extname(file).slice(1)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
};
const server=cert?https.createServer({key:fs.readFileSync(path.join(cert,'k.pem')),cert:fs.readFileSync(path.join(cert,'c.pem'))},handler):http.createServer(handler);
server.listen(port,'0.0.0.0',()=>console.log('SNLE preview on '+(cert?'https':'http')+'://localhost:'+port));
