import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT||4177);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};
http.createServer((req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const resolved=pathname==='/crown-account.js'?path.resolve(root,'../../site/assets/js/crown-account.js'):path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!resolved.startsWith(root+path.sep)&&pathname!=='/crown-account.js')throw Error('Forbidden');
  const st=fs.statSync(resolved);
  if(!st.isFile())throw Error('Missing');
  res.writeHead(200,{'Content-Type':mime[path.extname(resolved)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  fs.createReadStream(resolved).pipe(res);
 }catch{res.writeHead(404);res.end('Not found')}
}).listen(port,'127.0.0.1',()=>console.log('Gulf Region Exams DEVELOPMENT ONLY: http://127.0.0.1:'+port));
