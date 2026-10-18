// Local preview of site/ that mimics vercel.json: host rewrites, cleanUrls, headers (CSP).
// Usage: node apps/tools/serve-site.mjs [port]   (HTTPS, self-signed cert in $CERT_DIR or /tmp)
// Chromium: --host-resolver-rules="MAP *.healthcarecrownacademy.co.uk 127.0.0.1:PORT" --ignore-certificate-errors
import fs from 'node:fs'; import path from 'node:path'; import https from 'node:https'; import { execSync } from 'node:child_process';
const SITE = path.resolve(new URL('../../site', import.meta.url).pathname);
const cfg = JSON.parse(fs.readFileSync(path.join(SITE, 'vercel.json'), 'utf8'));
const port = +process.argv[2] || 8443, dir = process.env.CERT_DIR || '/tmp/hca-cert';
if (!fs.existsSync(dir + '/k.pem')) { fs.mkdirSync(dir, { recursive: true }); execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${dir}/k.pem -out ${dir}/c.pem -days 30 -subj "/CN=hca.local" 2>/dev/null`); }
const types = { html: 'text/html; charset=utf-8', js: 'text/javascript', mjs: 'text/javascript', css: 'text/css', json: 'application/json', webmanifest: 'application/manifest+json', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', woff2: 'font/woff2', woff: 'font/woff', wasm: 'application/wasm', ico: 'image/x-icon', txt: 'text/plain', xml: 'application/xml', pdf: 'application/pdf', mp3: 'audio/mpeg' };
const hostOk = (conds, host, want) => (conds || []).every(c => c.type !== 'host' || new RegExp('^' + c.value + '$').test(host) === want);
const matchRule = (r, p, host) => new RegExp('^' + r.source + '$').test(p) && hostOk(r.has, host, true) && hostOk(r.missing, host, false);
const pick = f => { for (const c of [f, f + '.html', path.join(f, 'index.html')]) { try { if (fs.statSync(c).isFile()) return c; } catch {} } };
https.createServer({ key: fs.readFileSync(dir + '/k.pem'), cert: fs.readFileSync(dir + '/c.pem') }, (req, res) => {
  const host = (req.headers.host || '').split(':')[0]; let p = decodeURIComponent(new URL(req.url, 'https://x').pathname);
  const rw = (cfg.rewrites || []).find(r => matchRule(r, p, host)); if (rw) p = rw.destination;
  const rd = (cfg.redirects || []).find(r => matchRule(r, p, host));
  if (rd && !rw) { res.writeHead(rd.permanent ? 308 : 307, { Location: rd.destination }); return res.end(); }
  const hdr = {}; for (const h of cfg.headers || []) if (matchRule(h, p, host)) for (const { key, value } of h.headers) hdr[key] = value;
  let file = path.join(SITE, p); if (!file.startsWith(SITE)) { res.writeHead(403); return res.end(); }
  file = pick(file);
  if (!file) { const nf = path.join(SITE, '404.html'); res.writeHead(404, { ...hdr, 'Content-Type': types.html }); return res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found'); }
  const ext = file.split('.').pop(); res.writeHead(200, { ...hdr, 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log('serving', SITE, 'on', port));
