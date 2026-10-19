// Web edition for healthcarecrownacademy.co.uk/carecraft.
// Same modules as build.mjs, but scripts, styles, fonts and images are separate
// files so the site's strict Content-Security-Policy (script-src 'self') allows
// them, browsers cache them, and the 90 infographic pages load only when opened.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const VERSION = '4.5.0', BASE = '/carecraft/', SITE = 'https://carecraft.healthcarecrownacademy.co.uk', HOME = 'https://healthcarecrownacademy.co.uk/';
const OUT = path.resolve(process.argv[2] || '../../site/carecraft');
const read = f => fs.readFileSync(f, 'utf8');
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);
const write = (rel, data) => { const p = path.join(OUT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); };
const copy = (from, rel) => write(rel, fs.readFileSync(from));

fs.rmSync(OUT, { recursive: true, force: true });

// Images: lesson art, crest and the infographic pages are plain files.
const index = JSON.parse(read('src/v4/image-index.json')), rasterFiles = [...new Set(Object.values(index))];
for (const name of rasterFiles) copy('src/v4/assets/' + name, 'img/' + name);
copy('src/crest.svg', 'img/crest.svg'); copy('src/crest-dark.svg', 'img/crest-dark.svg');
const lessonIds = JSON.parse(read('src/v4/data.json')).lessons.map(l => l.id);
for (const id of lessonIds) for (const page of [1, 2, 3]) copy(`src/v4/assets/infographics/${id}-${page}.png`, `guides/${id}-${page}.png`);

// Fonts: lift the embedded woff2 files out of fonts.css.
const fonts = read('src/v4/fonts.css').replace(/url\(["']?data:font\/woff2;base64,([A-Za-z0-9+/=]+)["']?\)/g, (_, b64) => {
  const buf = Buffer.from(b64, 'base64'), name = 'fonts/' + hash(buf) + '.woff2';
  write(name, buf);
  return `url("${name}")`;
});
const styles = fonts + '\n' + read('src/v4/design.css') + '\n' + read('src/v4/engines.css') + '\n' + read('src/v4/hook.css') + '\n' + read('../shared/hca-shell.css') + '\n' + read('src/v4/day.css') + '\n' + read('../shared/hca-studio.css') + '\n' + read('src/v4/studio.css') + '\n' + read('src/v4/learn-x.css') + '\n' + read('src/v4/practice-x.css') + '\n' + read('src/v4/toolkit-x.css');

const raster = rasterFiles.map((name, i) => `const image${i}=${JSON.stringify(BASE + 'img/' + name)};`).join('\n');
const assets = 'const ASSETS={' + Object.entries(index).map(([key, name]) => JSON.stringify(key) + ':image' + rasterFiles.indexOf(name)).join(',') + '};';
const art = 'const CC_SIM_ART={handover:ASSETS["generated-sim-handover"],interruptions:ASSETS["generated-sim-interruptions"],"shared-decision":ASSETS["generated-sim-shared-choice"]};const CC_REFINE_ART={communication:ASSETS["editorial-communication"],debrief:ASSETS["editorial-debrief"]};';
const regionsJs = 'const CC_REGIONS=' + read('src/v4/studio-regions.json').trim() + ';';
const infoPng = 'const INFO_PNG=' + JSON.stringify(Object.fromEntries(lessonIds.map(id => [id, [1, 2, 3].map(page => `${BASE}guides/${id}-${page}.png`)]))) + ';';
const prefix = `const CC_RELEASE={version:"${VERSION}",filename:"Carecraft-v${VERSION}.html"};const HCA_CREST="${BASE}img/crest.svg";const HCA_CREST_DARK="${BASE}img/crest-dark.svg";\n` + raster + '\n' + assets + '\n' + art + '\n';
// The offline single-file edition is published beside the app; "Download app" fetches it.
const webOverrides = `function hcaDownloadApp(){const a=document.createElement('a');a.href=${JSON.stringify(BASE + 'download/' + 'Carecraft-v' + VERSION + '.html')};a.download=CC_RELEASE.filename;document.body.append(a);a.click();a.remove();toast('Downloading the offline edition (about 19 MB).');}`;
// Free-plan limits (always window.HCA: Carecraft's own data declares a global const HCA; from crown-account.js): gate the lesson and activity entry points and the route render, not only clicks.
const ccGate = String.raw`(()=>{const H=()=>window.HCA||{},locked=()=>!!(H().locked&&H().locked('carecraft')),fl=id=>CC_FREE.lessons.includes(id),fa=id=>CC_FREE.activities.includes(id),pay=w=>setTimeout(()=>H().paywall('carecraft',w));const oL=openLesson,oA=launchActivity,oR=render,oP=scenarioPool,oS=startReview;startReview=function(){if(locked()){pay('Smart Review');return;}return oS.apply(this,arguments);};actions.review=()=>startReview();openLesson=function(id,...r){if(locked()&&!fl(id)){pay('this lesson');return;}return oL.call(this,id,...r);};launchActivity=function(id,...r){if(locked()&&!fa(id)){pay('this practice activity');return;}return oA.call(this,id,...r);};scenarioPool=function(){const p=oP();if(!locked())return p;const f=p.filter(l=>fl(l.id));return f.length?f:p;};render=function(){if(locked()){if(currentPage==='lesson'&&activeLesson&&!fl(activeLesson.id)){currentPage='library';currentFilter='all';history.replaceState(null,'','#/library');pay('this lesson');}else if(currentPage==='studio'&&ui.activity&&!fa(ui.activity)){studioDispose();currentPage='practice';ui.activity=null;history.replaceState(null,'','#/practice');pay('this practice activity');}}return oR.apply(this,arguments);};H().ready&&H().ready.then(()=>{if(locked()&&(currentPage==='lesson'||currentPage==='studio'))render();});})();`;
const scripts = prefix + regionsJs + infoPng + ['../../../shared/hca-shell.js', '../../../shared/hca-studio.js', 'runtime-data.js', 'lesson-notes.js', 'store.js', 'app.js', 'views.js', 'home.js', 'features.js', 'learning.js', 'infographics.js', 'studio.js', 'learn-data.js','learn-x.js', 'practice-x-data.js','practice-x.js', 'toolkit-data.js','toolkit-x.js', 'events.js', 'hook.js', 'engines.js', 'engine-actions.js'].map(f => read('src/v4/' + f)).join('\n') + '\n' + webOverrides + '\nwindow.CC_FREE={lessons:lessons.slice(0,6).map(l=>l.id),activities:HCA_ACTIVITIES.slice(0,3).map(a=>a.id)};\n' + ccGate + '\nbootstrap();maybeOpenHook();';

const cssName = `app.${hash(styles)}.css`, jsName = `app.${hash(scripts)}.js`;
write(cssName, styles);
write(jsName, scripts);

const portable = `dist/Carecraft-v${VERSION}.html`;
if (fs.existsSync(portable)) copy(portable, `download/Carecraft-v${VERSION}.html`);
else console.warn('Run node build.mjs first to publish the offline edition.');

for (const f of ['icon-192.png', 'icon-512.png', 'maskable-512.png', 'apple-touch-icon.png', 'og-image.png']) if (fs.existsSync('web/' + f)) copy('web/' + f, 'img/' + f);

const title = 'Carecraft — 60-second scenarios and short lessons for healthcare | Healthcare Crown Academy';
const description = 'Carecraft by Healthcare Crown Academy: a daily 60-second scenario, 30 short lessons, interactive practice and visual guides for people who work in healthcare. Free, private, and your progress stays in your browser.';
write('manifest.webmanifest', JSON.stringify({
  name: 'Carecraft · Healthcare Crown Academy', short_name: 'Carecraft', description,
  id: BASE, start_url: '/', scope: '/', display: 'standalone',
  background_color: '#F8F5EF', theme_color: '#10253A', lang: 'en-GB', categories: ['education', 'medical'],
  icons: [
    { src: BASE + 'img/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: BASE + 'img/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: BASE + 'img/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2));

const html = `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="carecraft-version" content="${VERSION}">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${SITE}/">
<meta name="theme-color" content="#10253A">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Healthcare Crown Academy">
<meta property="og:title" content="Carecraft — one useful moment of learning a day">
<meta property="og:description" content="A 60-second scenario, 30 short lessons and hands-on practice for people who work in healthcare.">
<meta property="og:url" content="${SITE}/">
<meta property="og:image" content="${SITE}${BASE}img/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${BASE}img/crest.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${BASE}img/apple-touch-icon.png">
<link rel="manifest" href="${BASE}manifest.webmanifest">
<link rel="preload" href="${BASE}img/${index['today-welcome']}" as="image" fetchpriority="high">
<link rel="stylesheet" id="carecraft-app-styles" href="${BASE}${cssName}">
<meta name="hca-app" content="carecraft">
<script src="/assets/js/crown-move.js"></script>
<script defer src="/assets/js/crown-account.js"></script>
<script defer id="carecraft-app-code" src="${BASE}${jsName}"></script>
</head>
<body><div id="app"></div><noscript><p style="font:16px/1.6 system-ui;max-width:40rem;margin:4rem auto;padding:0 1rem">Carecraft needs JavaScript. You can also <a href="${BASE}download/Carecraft-v${VERSION}.html">download the offline edition</a> or return to <a href="${HOME}">Healthcare Crown Academy</a>.</p></noscript></body>
</html>
`;
write('index.html', html);

const bytes = dir => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? bytes(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
console.log(JSON.stringify({ out: OUT, js: jsName, jsBytes: Buffer.byteLength(scripts), css: cssName, cssBytes: Buffer.byteLength(styles), totalBytes: bytes(OUT) }));
