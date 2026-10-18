// Web edition of MedLex for healthcarecrownacademy.co.uk/medlex.
// Input: the hosted build (source/index.html) and the posters/icons in package/public.
// Output: hashed external script and style files (the site's CSP allows only
// script-src 'self' and font-src 'self'), font files, a static manifest, an
// offline worker scoped to /medlex, and the first-visit "decode a word" hook.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { studioData } from './src/studio-data.mjs';

const VERSION = '4.0.1', BASE = '/medlex/', SCOPE = '/', SITE = 'https://medlex.healthcarecrownacademy.co.uk', HOME = 'https://healthcarecrownacademy.co.uk/';
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
css += '\n' + read('src/hook.css') + '\n' + read('../shared/hca-shell.css') + '\n' + read('src/day.css') + '\n' + read('../shared/hca-studio.css') + '\n' + read('src/studio.css');

let js = scripts[0];
js = patch(js, '"./infographics/', `"${BASE}infographics/`, 'poster paths', 56);
js = patch(js, 'e.href="./manifest.webmanifest"', `e.href="${BASE}manifest.webmanifest"`, 'manifest link');
js = patch(js, 'navigator.serviceWorker.register("./sw.js")', `navigator.serviceWorker.register("${BASE}sw.js",{scope:"${SCOPE}"})`, 'worker scope');

// Remove the dead "Complete offline HTML" link (./MedLex.html is not published on the web).
js = patch(js, '<a class="btn" href="./MedLex.html" download="MedLex-Complete.html">Complete offline HTML</a>', '', 'offline HTML link');
// Plurals: "1 minute", "1 active day".
js = patch(js, '${Math.max(1,Math.round(((e.finishedAt||Date.now())-e.started)/6e4))} minutes', '${(m=>m+(1===m?" minute":" minutes"))(Math.max(1,Math.round(((e.finishedAt||Date.now())-e.started)/6e4)))}', 'minutes plural');
js = patch(js, '${u.filter(e=>e.done).length} active days this week', '${(n=>n+(1===n?" active day":" active days"))(u.filter(e=>e.done).length)} this week', 'week days plural');
js = patch(js, '${Fn()} active days in your current streak', '${(n=>n+(1===n?" active day":" active days"))(Fn())} in your current streak', 'streak days plural');
// Hook words: real terms from the course with prefix/root/suffix parts and plain meanings.
// Free plan: modules ch1, ch2, prefixes and suffixes. Gate inside the router so links, pushState navigation and typed URLs are all covered.
js = patch(js, '(location.hash.slice(1)||"today"),{path:a,params:i}=e;', '(location.hash.slice(1)||"today"),{path:a,params:i}=e;{const g=a.match(/^learn\\/module\\/([^/]+)/);if(g&&window.HCA&&HCA.locked&&HCA.locked("medlex")&&!["ch1","ch2","prefixes","suffixes"].includes(g[1])){history.replaceState(null,"","#learn");setTimeout(()=>HCA.paywall("medlex","this module"));return fi()}}', 'module gate');
// ---- My Day + Visual Atlas names, and the data hook the new home screen reads ----
const patchAll = (text, from, to, label) => { const n = text.split(from).length - 1; if (!n) throw Error(`Patch "${label}" matched 0 times; the source changed.`); return text.split(from).join(to); };
js = patch(js, '{today:"Today",learn:"Learn",practice:"Practice",progress:"Progress",library:"Library",settings:"Settings",teach:"Teach",infographics:"Infographics"}', '{today:"My Day",learn:"Learn",practice:"Practice",progress:"Progress",library:"Library",settings:"Settings",teach:"Teach",infographics:"Visual Atlas"}', 'route names');
js = patch(js, 'const rs={today:["Today",', 'const rs={today:["My Day",', 'page titles');
js = patch(js, 'case"help":!function(){const e={today:["Today",', 'case"help":!function(){const e={today:["My Day",', 'help titles');
js = patchAll(js, 'Back to Today', 'Back to My Day', 'back links');
js = patch(js, '"Today / Learn / Practice / Library / Progress"', '"My Day / Learn / Practice / Library / Progress"', 'shortcut help');
js = patch(js, 'Return to saved work from Today or your portfolio.', 'Return to saved work from My Day or your portfolio.', 'saved work copy');
js = patch(js, 'rt("Infographics",', 'rt("Visual Atlas",', 'atlas page title');
js = patch(js, 'infographics:["Infographics","Visual study boards', 'infographics:["Visual Atlas","Visual study boards', 'atlas help title');
js = patch(js, 'search a term in Infographics.', 'search a term in the Visual Atlas.', 'atlas steps');
js = patch(js, 'each have their own backup in Infographics.', 'each have their own backup in the Visual Atlas.', 'atlas backup copy');
js = patch(js, 'short:"Visual guides"', 'short:"Visual Atlas"', 'atlas guide tab');
js = patch(js, 'function Ms(){return function(){', 'window.__medlexStreak=()=>Fn();function Ms(){return function(){', 'streak accessor');
js = patch(js, 'Zn(`<div class="today-experience ', 'window.__medlexDay={mod:e,mastered:Ae(e),modTotal:e.outcomes.length,word:i,minutes:l,goal:r,pct:c,week:u,streak:Fn(),due:Math.min(Xs(),10),resume:s?{index:o.index,total:o.items.length}:null,done:!!(o&&o.finished&&o.finishedAt&&new Date(o.finishedAt).toDateString()===new Date().toDateString()),draft:p?{title:(we(p[1])[p[2]][+p[3]]||{}).title||"Your saved worksheet",href:Ti({module:p[1],type:p[2],index:+p[3],key:d,step:ki(d).step||0}),edited:ki(d).updated?Ai(ki(d).updated):""}:null,name:t.state.name,guides:Ve.length,reduced:m,poster:We["decode-1"],sessions:t.state.history.length,saved:t.state.saved.length};Zn(`<div class="today-experience ', 'today data');
body = patchAll(body, 'aria-label="Today"', 'aria-label="My Day"', 'nav aria-label');
body = patchAll(body, '<span class="nav-text">Today</span>', '<span class="nav-text">My Day</span>', 'nav text');
body = patch(body, 'aria-label="Infographics"', 'aria-label="Visual Atlas"', 'atlas aria-label');
body = patch(body, '<span class="nav-text">Infographics</span>', '<span class="nav-text">Visual Atlas</span>', 'atlas nav text');
body = patch(body, '<strong id="crumb">Overview</strong>', '<strong id="crumb">My Day</strong>', 'crumb default');
const TERMS = JSON.parse(read('package/src/data/records/TERMS.json'));
const hookIds = ['pericarditis', 'tachycardia', 'hepatomegaly', 'hyperglycaemia', 'haematuria', 'gastroenteritis'];
const hookTerms = hookIds.map(id => TERMS.find(t => t.id === id)).filter(t => t && t.parts.length > 1).map(({ term, plain, parts }) => ({ term, plain, parts }));
const hook = `window.MEDLEX_HOOK_TERMS=${JSON.stringify(hookTerms)};\n` + read('src/hook.js');
const partsMap = Object.fromEntries(TERMS.filter(t => t.parts && t.parts.length > 1).map(t => [t.id, t.parts.filter(p => p.type !== 'vowel').map(p => [p.text, p.type[0], p.meaning])]));
// Learning Studio: the engine, the module data and the deck builder load on first use; only the small entry script is in the shell.
const studioJs = `window.MEDLEX_STUDIO=${JSON.stringify(studioData(BASE))};\n` + read('../shared/hca-studio.js') + '\n' + read('src/studio.js');
const studioName = `studio.${hash(studioJs)}.js`;
const shellJs = `window.MEDLEX_PARTS=${JSON.stringify(partsMap)};window.MEDLEX_STUDIO_SRC=${JSON.stringify(BASE + studioName)};\n` + read('../shared/hca-shell.js') + '\n' + read('src/day.js') + '\n' + read('src/studio-entry.js');

for (const f of fs.readdirSync(PUBLIC + '/infographics')) write('infographics/' + f, fs.readFileSync(`${PUBLIC}/infographics/${f}`));
for (const f of ['icon-192.png', 'icon-512.png', 'icon.svg']) write(f, fs.readFileSync(`${PUBLIC}/${f}`));
for (const f of ['og-image.png', 'apple-touch-icon.png', 'maskable-512.png']) if (fs.existsSync('web/' + f)) write('img/' + f, fs.readFileSync('web/' + f));

const cssName = `app.${hash(css)}.css`, jsName = `app.${hash(js)}.js`, hookName = `hook.${hash(hook)}.js`, shellName = `shell.${hash(shellJs)}.js`;
write(cssName, css); write(jsName, js); write(hookName, hook); write(shellName, shellJs); write(studioName, studioJs);

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
<link rel="canonical" href="${SITE}/">
<meta property="og:type" content="website"><meta property="og:site_name" content="Healthcare Crown Academy">
<meta property="og:title" content="MedLex — make sense of medicine, one word at a time">
<meta property="og:description" content="26 modules, 1,480 terms and 56 illustrated guides. Learn to decode medical words by their parts. Free, private, works offline.">
<meta property="og:url" content="${SITE}/"><meta property="og:image" content="${SITE}${BASE}img/og-image.png"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="${favicon}"><link rel="apple-touch-icon" href="${BASE}img/apple-touch-icon.png">
<link rel="manifest" href="${BASE}manifest.webmanifest">
<link rel="stylesheet" href="${BASE}${cssName}">
<meta name="hca-app" content="medlex">
<script src="/assets/js/crown-move.js"></script>
<script defer src="/assets/js/crown-account.js"></script>
<script defer src="${BASE}${hookName}"></script>
<script defer src="${BASE}${shellName}"></script>
<script defer src="${BASE}${jsName}"></script>
</head>
<body>${body}<noscript><p style="font:16px/1.6 system-ui;max-width:40rem;margin:2rem auto;padding:0 1rem">MedLex needs JavaScript to run. Return to <a href="${HOME}">Healthcare Crown Academy</a>.</p></noscript>
</body>
</html>
`);

const cache = `medlex-web-${VERSION}-${hash(js + css + hook + shellJs + studioJs)}`;
const shell = [SCOPE, BASE + cssName, BASE + jsName, BASE + hookName, BASE + shellName, BASE + studioName, BASE + 'manifest.webmanifest', BASE + 'icon-192.png', BASE + 'icon-512.png', ...files.filter(f => f.includes('/fonts/'))];
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

console.log(JSON.stringify({ out: OUT, studio: studioName, studioBytes: Buffer.byteLength(studioJs), js: jsName, jsBytes: Buffer.byteLength(js), css: cssName, cssBytes: Buffer.byteLength(css), hookTerms: hookTerms.length, files: files.length }));
