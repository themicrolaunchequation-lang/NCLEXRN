// Web edition of MedLex for healthcarecrownacademy.co.uk/medlex.
// Input: the hosted build (source/index.html) and the posters/icons in package/public.
// Output: hashed external script and style files (the site's CSP allows only
// script-src 'self' and font-src 'self'), font files, a static manifest, an
// offline worker scoped to /medlex, and the first-visit "decode a word" hook.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const VERSION = '4.0.1', BASE = '/medlex/', SCOPE = '/medlex', SITE = 'https://healthcarecrownacademy.co.uk';
const OUT = path.resolve(process.argv[2] || '../../site/medlex');
const PUBLIC = 'package/public';
const read = f => fs.readFileSync(f, 'utf8');
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);
const files = [];
const write = (rel, data) => { const p = path.join(OUT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); files.push(BASE + rel); };
function patch(text, from, to, label, count = 1) {
  const n = text.split(from).length - 1;
  if (n !== count) throw Error(`Patch "${label}" matched ${n} times (expected ${count}); the source changed.`);
  return text.split(from).join(to);
}

fs.rmSync(OUT, { recursive: true, force: true });
const html = read('source/index.html');
const head = html.slice(0, html.indexOf('<body'));
// Only the head's stylesheet is real; a later <style> sits inside a JS string (the export template).
const styles = [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]);
if (styles.length !== 1) throw Error('Expected one head stylesheet, found ' + styles.length);
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (scripts.length !== 1) throw Error('Expected one inline script, found ' + scripts.length);
let body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>')).replace(/<script>[\s\S]*?<\/script>/g, '');
const description = head.match(/<meta name="description" content="([^"]*)"/)[1];
const favicon = head.match(/<link rel="icon"[^>]*href="([^"]+)"/)[1];

// Fonts become files; images may stay as data: URIs (img-src allows data:).
let css = styles.join('\n').replace(/url\(["']?data:font\/woff2;base64,([A-Za-z0-9+/=]+)["']?\)/g, (_, b64) => {
  const buf = Buffer.from(b64, 'base64'), rel = `fonts/${hash(buf)}.woff2`;
  if (!files.includes(BASE + rel)) write(rel, buf);
  return `url("${rel}")`;
});
css += '\n' + read('src/hook.css');

let js = scripts[0];
js = patch(js, '"./infographics/', `"${BASE}infographics/`, 'poster paths', 56);
js = patch(js, 'e.href="./manifest.webmanifest"', `e.href="${BASE}manifest.webmanifest"`, 'manifest link');
js = patch(js, 'navigator.serviceWorker.register("./sw.js")', `navigator.serviceWorker.register("${BASE}sw.js",{scope:"${SCOPE}"})`, 'worker scope');

// Hook words: real terms from the course with prefix/root/suffix parts and plain meanings.
const TERMS = JSON.parse(read('package/src/data/records/TERMS.json'));
const hookIds = ['pericarditis', 'tachycardia', 'hepatomegaly', 'hyperglycaemia', 'haematuria', 'gastroenteritis'];
const hookTerms = hookIds.map(id => TERMS.find(t => t.id === id)).filter(t => t && t.parts.length > 1).map(({ term, plain, parts }) => ({ term, plain, parts }));
const hook = `window.MEDLEX_HOOK_TERMS=${JSON.stringify(hookTerms)};\n` + read('src/hook.js');

for (const f of fs.readdirSync(PUBLIC + '/infographics')) write('infographics/' + f, fs.readFileSync(`${PUBLIC}/infographics/${f}`));
for (const f of ['icon-192.png', 'icon-512.png', 'icon.svg']) write(f, fs.readFileSync(`${PUBLIC}/${f}`));
for (const f of ['og-image.png', 'apple-touch-icon.png', 'maskable-512.png']) if (fs.existsSync('web/' + f)) write('img/' + f, fs.readFileSync('web/' + f));

const cssName = `app.${hash(css)}.css`, jsName = `app.${hash(js)}.js`, hookName = `hook.${hash(hook)}.js`;
write(cssName, css); write(jsName, js); write(hookName, hook);

write('manifest.webmanifest', JSON.stringify({
  id: BASE, name: 'MedLex · Healthcare Crown Academy', short_name: 'MedLex', description,
  start_url: SCOPE + '#today', scope: SCOPE, display: 'standalone', background_color: '#F8F5EF', theme_color: '#10253A',
  lang: 'en-GB', categories: ['education', 'medical'],
  icons: [{ src: BASE + 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: BASE + 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: BASE + 'img/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }]
}, null, 2));

write('index.html', `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#10253A">
<meta name="medlex-version" content="${VERSION}">
<title>MedLex — medical terminology, one word at a time | Healthcare Crown Academy</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${SITE}${SCOPE}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Healthcare Crown Academy">
<meta property="og:title" content="MedLex — make sense of medicine, one word at a time">
<meta property="og:description" content="26 modules, 1,480 terms and 56 illustrated guides. Learn to decode medical words by their parts. Free, private, works offline.">
<meta property="og:url" content="${SITE}${SCOPE}"><meta property="og:image" content="${SITE}${BASE}img/og-image.png"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="${favicon}"><link rel="apple-touch-icon" href="${BASE}img/apple-touch-icon.png">
<link rel="manifest" href="${BASE}manifest.webmanifest">
<link rel="stylesheet" href="${BASE}${cssName}">
<script defer src="${BASE}${hookName}"></script>
<script defer src="${BASE}${jsName}"></script>
</head>
<body>${body}<noscript><p style="font:16px/1.6 system-ui;max-width:40rem;margin:2rem auto;padding:0 1rem">MedLex needs JavaScript to run. Return to <a href="/">Healthcare Crown Academy</a>.</p></noscript>
</body>
</html>
`);

const cache = `medlex-web-${VERSION}-${hash(js + css + hook)}`;
const shell = [SCOPE, BASE + cssName, BASE + jsName, BASE + hookName, BASE + 'manifest.webmanifest', BASE + 'icon-192.png', BASE + 'icon-512.png', ...files.filter(f => f.includes('/fonts/'))];
const posters = files.filter(f => f.includes('/infographics/'));
fs.writeFileSync(path.join(OUT, 'sw.js'), `/* MedLex ${VERSION} offline worker for ${SCOPE}: app shell on install, posters cached as they are viewed. */
const CACHE=${JSON.stringify(cache)},SHELL=${JSON.stringify(shell)},POSTERS=${JSON.stringify(posters)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('medlex-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||!(u.pathname===${JSON.stringify(SCOPE)}||u.pathname.startsWith(${JSON.stringify(BASE)})))return;
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(${JSON.stringify(SCOPE)},copy));}return res;}).catch(()=>caches.match(${JSON.stringify(SCOPE)})));return;}
  if(SHELL.includes(u.pathname)||POSTERS.includes(u.pathname))e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy));}return res;})));
});
`);

console.log(JSON.stringify({ out: OUT, js: jsName, jsBytes: Buffer.byteLength(js), css: cssName, cssBytes: Buffer.byteLength(css), hookTerms: hookTerms.length, files: files.length }));
