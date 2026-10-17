// Web edition of Serein for healthcarecrownacademy.co.uk/serein.
// Input: the portable single-file release in source/. Output: separate, hashed
// script/style files (allowed by the site's CSP: script-src 'self', font-src 'self'),
// plain image and font files, a static manifest and an offline worker scoped to /serein.
// Small, asserted source patches adapt the portable build to the web and add the
// first-visit hook (src/hook.js, src/hook.css) and the Serein sage palette.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SOURCE = 'source/Serein-v5.1.1.html', FROM = '5.1.1', VERSION = '5.2.0';
const BASE = '/serein/', SITE = 'https://healthcarecrownacademy.co.uk';
const OUT = path.resolve(process.argv[2] || '../../site/serein');
const read = f => fs.readFileSync(f, 'utf8');
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);
const files = [];
const write = (rel, data) => { const p = path.join(OUT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); files.push(BASE + rel); };
const ext = { 'image/webp': 'webp', 'image/png': 'png', 'image/svg+xml': 'svg', 'image/jpeg': 'jpg', 'font/woff2': 'woff2' };
const dataFile = (type, b64, dir) => { const buf = Buffer.from(b64, 'base64'), rel = `${dir}/${hash(buf)}.${ext[type]}`; if (!files.includes(BASE + rel)) write(rel, buf); return BASE + rel; };
function patch(text, from, to, label) {
  const n = text.split(from).length - 1;
  if (n !== 1) throw Error(`Patch "${label}" matched ${n} times; the source changed.`);
  return text.replace(from, () => to);
}

fs.rmSync(OUT, { recursive: true, force: true });
let html = read(SOURCE);

// Split the page into style, body markup and the ordered script blocks.
const style = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const body = html.match(/<body>([\s\S]*?)<script>/)[1];
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const description = html.match(/<meta name="description" content="([^"]*)"/)[1];

// Serein's palette: a calmer "serene sage" accent that is distinct from Carecraft's teal
// while keeping the shared Healthcare Crown Academy navy, cream and gold.
const palette = [[/#087D7A/gi, '#2F6B5E'], [/#79D4CA/gi, '#9FD8C4'], [/#245257/gi, '#2C5248']];
const recolour = s => palette.reduce((t, [re, to]) => t.replace(re, to), s);

// Fonts and images leave the page as files.
let css = recolour(style).replace(/url\("data:(font\/woff2);base64,([A-Za-z0-9+/=]+)"\)/g, (_, type, b64) => `url("${dataFile(type, b64, 'fonts').slice(BASE.length)}")`);
css += '\n' + read('src/hook.css');
let markup = recolour(body).replace(/src="data:([a-z+/]+);base64,([A-Za-z0-9+/=]+)"/g, (_, type, b64) => `src="${dataFile(type, b64, 'img')}"`);
markup = markup.replace(`<span id="app-version">${FROM}</span>`, `<span id="app-version">${VERSION}</span>`);
// Family link: Carecraft, the Academy's learning companion.
markup = patch(markup, `class="by-hca">By Healthcare Crown Academy <span aria-hidden="true">↗</span></a>`, `class="by-hca">By Healthcare Crown Academy <span aria-hidden="true">↗</span></a><a href="/carecraft" class="by-hca sibling-app"><span><b>Learn something new?</b> Carecraft, 60-second scenarios</span> <span aria-hidden="true">→</span></a>`, 'sibling link');

let js = scripts.map(recolour).join('\n;\n');
// The media map points at files instead of embedded data.
js = js.replace(/S\.media=\{([\s\S]*?)\};/, (_, map) => 'S.media={' + [...map.matchAll(/"([^"]+)":"data:([a-z+/]+);base64,([A-Za-z0-9+/=]+)"/g)]
  .map(([, key, type, b64]) => { const rel = key; write(rel, Buffer.from(b64, 'base64')); return JSON.stringify(key) + ':' + JSON.stringify(BASE + rel); }).join(',') + '};');
js = js.split(`'${FROM}'`).join(`'${VERSION}'`);
// Web distribution: absolute paths under /serein, a static manifest and a worker scoped to /serein.
js = patch(js, `new URL(portableDistribution()?location.href:'./index.html',location.href)`, `new URL(portableDistribution()?location.href:'${BASE.slice(0, -1)}',location.href)`, 'shell URL');
js = patch(js, `new URL('./sw.js',location.href)`, `new URL('${BASE}sw.js',location.href)`, 'worker URL');
js = patch(js, `navigator.serviceWorker.register(workerURL.href)`, `navigator.serviceWorker.register(workerURL.href,{scope:'${BASE.slice(0, -1)}'})`, 'worker scope');
js = patch(js, `fetch('./offline-assets.json'`, `fetch('${BASE}offline-assets.json'`, 'offline list');
js = patch(js, `if(location.protocol==='file:'||!$('meta[name="serein-distribution"]'))return;`, `if(location.protocol==='file:'||!$('meta[name="serein-distribution"]')||$('link[rel="manifest"]'))return;`, 'static manifest');
// First visit: the hook runs before the welcome steps and can hand over to either path.
js = patch(js, `if(!store().onboarded)setTimeout(()=>onboarding(0),0);`, `if(!store().onboarded)setTimeout(()=>S.hook&&!new URLSearchParams(location.search).has('nohook')?S.hook.run({onboard:()=>onboarding(0),finish:finishWelcome}):onboarding(0),0);`, 'first-visit hook');
js += '\n;\n' + read('src/hook.js');

const cssName = `app.${hash(css)}.css`, jsName = `app.${hash(js)}.js`;
write(cssName, css);
write(jsName, js);

for (const f of ['og-image.png', 'apple-touch-icon.png', 'maskable-512.png']) if (fs.existsSync('web/' + f)) write('img/' + f, fs.readFileSync('web/' + f));
const crest = markup.match(/<img src="([^"]+\.svg)"/)[1];
// A stable name for the crest, used by the home page.
const lightCrest = markup.match(/class="mobile-brand brand"[^>]*><img src="([^"]+\.svg)"/)[1];
write('img/crest.svg', fs.readFileSync(path.join(OUT, lightCrest.slice(BASE.length))));
const shortcuts = [['A small pause', '#quick-start'], ['My journal', '#me/journal'], ['Support', '#support']];
write('manifest.webmanifest', JSON.stringify({
  id: BASE, name: 'Serein · Healthcare Crown Academy', short_name: 'Serein', description,
  start_url: BASE.slice(0, -1) + '#today', scope: BASE.slice(0, -1), display: 'standalone',
  background_color: '#F8F5EF', theme_color: '#10253A', lang: 'en-GB', categories: ['health', 'lifestyle'],
  icons: [{ src: BASE + 'assets/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: BASE + 'assets/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: BASE + 'img/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
  shortcuts: shortcuts.map(([name, hashRoute]) => ({ name, url: BASE.slice(0, -1) + hashRoute }))
}, null, 2));

const cacheName = `serein-hca-v4-web-${VERSION}-${hash(js + css)}`;
write('index.html', `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#10253A">
<meta name="serein-version" content="${VERSION}">
<title>Serein — a little space for the people who care | Healthcare Crown Academy</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${SITE}${BASE.slice(0, -1)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Healthcare Crown Academy">
<meta property="og:title" content="Serein — one breath can change the next hour">
<meta property="og:description" content="Short, private well-being practices for people who work in healthcare. Free, no account, nothing monitored.">
<meta property="og:url" content="${SITE}${BASE.slice(0, -1)}"><meta property="og:image" content="${SITE}${BASE}img/og-image.png"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${crest}" type="image/svg+xml"><link rel="apple-touch-icon" href="${BASE}img/apple-touch-icon.png"><link rel="manifest" href="${BASE}manifest.webmanifest">
<meta name="serein-distribution" content="web"><meta name="serein-offline-cache" content="${cacheName}">
<link rel="stylesheet" href="${BASE}${cssName}">
<script defer src="${BASE}${jsName}"></script>
</head>
<body>${markup}<noscript><p style="font:16px/1.6 system-ui;max-width:40rem;margin:2rem auto;padding:0 1rem">Serein needs JavaScript to run. Return to <a href="/">Healthcare Crown Academy</a>.</p></noscript>
</body></html>
`);

// Offline: the page asks for this list when someone chooses "make available offline".
const offline = [BASE.slice(0, -1), ...files.filter(f => !/index\.html$|og-image|maskable|apple-touch/.test(f))];
fs.writeFileSync(path.join(OUT, 'offline-assets.json'), JSON.stringify({ cacheName, files: offline }, null, 1));
fs.writeFileSync(path.join(OUT, 'sw.js'), `/* SEREIN_OFFLINE_WORKER ${VERSION}: serves the saved copy of /serein when the network is unavailable. */
const PREFIX='serein-hca-v4-',SHELL='${BASE.slice(0, -1)}';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const cfg=await fetch('${BASE}offline-assets.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>null);
  if(cfg)for(const k of await caches.keys())if(k.startsWith(PREFIX)&&k!==cfg.cacheName)await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||!(u.pathname===SHELL||u.pathname.startsWith(SHELL+'/')))return;
  if(r.mode==='navigate'){e.respondWith(fetch(r).catch(async()=>(await caches.match(SHELL,{ignoreSearch:true}))||Response.error()));return;}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r)));
});
`);

console.log(JSON.stringify({ out: OUT, js: jsName, jsBytes: Buffer.byteLength(js), css: cssName, cssBytes: Buffer.byteLength(css), files: files.length }));
