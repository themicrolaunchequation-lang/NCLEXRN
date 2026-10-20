// Web edition of Lumen for lumen.healthcarecrownacademy.co.uk (files under /lumen/).
// source/Lumen.html stays a single self-contained file. For the web, this build:
//  - moves executable inline scripts to hashed files (served under Lumen's CSP, script-src 'self');
//  - moves the heavy engines out of the first load into hashed static files, fetched on first use:
//      OCR (Tesseract library, worker + core, English data)  -> /lumen/vendor/ocr/…
//      PowerPoint tools (PptxGenJS + JSZip)                   -> /lumen/vendor/pptx/…
//      PDF worker, CMaps, standard fonts and decoders         -> /lumen/vendor/pdf/…
//      large embedded pictures                                -> /lumen/img/…
//      licence texts                                          -> /lumen/licenses/…
//  - adds the web manifest, icons and an offline service worker (/lumen/sw.js, scope "/").
// Styles and embedded fonts stay inline (allowed by the Lumen policy in site/vercel.json).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import vm from 'node:vm';
import crypto from 'node:crypto';

const BASE = '/lumen/', SITE = 'https://lumen.healthcarecrownacademy.co.uk';
const SRC = path.resolve('source');
const OUT = path.resolve(process.argv[2] || '../../site/lumen');
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'js'), { recursive: true });
const put = (rel, data) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); return BASE + rel; };
const once = (text, find, label) => { const i = text.indexOf(find); if (i < 0 || text.indexOf(find, i + 1) >= 0) throw Error(`Expected exactly one ${label}.`); return i; };
const replaceOnce = (text, find, repl, label) => { const i = once(text, find, label); return text.slice(0, i) + repl + text.slice(i + find.length); };
const between = (text, start, end, label) => { const a = once(text, start, label + ' start') + start.length, b = text.indexOf(end, a); if (b < 0) throw Error(`No end for ${label}.`); return [a, b]; };
const evalLiteral = src => vm.runInNewContext(`(${src})`, {});

let html = fs.readFileSync(path.join(SRC, 'Lumen.html'), 'utf8');
const before = Buffer.byteLength(html);

/* ---------- Data blocks: OCR engine, PowerPoint tools, licence texts ---------- */
const takeBlock = id => {
  const re = new RegExp(`<script[^>]*\\bid="${id}"[^>]*>([\\s\\S]*?)</script>\\n?`);
  const m = html.match(re); if (!m) throw Error(`Missing data block ${id}.`);
  html = html.replace(m[0], ''); return m[1];
};
const b64 = s => Buffer.from(s.trim(), 'base64');
const ocrWorker = b64(takeBlock('lumen-ocr-worker'));
const ocrCore = zlib.gunzipSync(b64(takeBlock('lumen-ocr-core')));
const ocrLang = b64(takeBlock('lumen-ocr-lang')); // stays gzip: Tesseract unpacks eng.traineddata.gz itself
const pptx = zlib.gunzipSync(b64(takeBlock('lumen-pptx')));
const licences = { 'ocr-licenses.txt': takeBlock('lumen-ocr-licenses'), 'third-party-notices.txt': takeBlock('lumen-third-party-notices'), 'pdf-compat-licenses.txt': takeBlock('pdf-compat-licenses') };
const licenceLinks = Object.entries(licences).map(([name, text]) => `<link rel="license" href="${put('licenses/' + name, text)}">`).join('\n');

// Tesseract library: the first inline script.
const tessMatch = html.match(/<script>(\/\*! For license information please see tesseract\.min\.js[\s\S]*?)<\/script>\n?/);
if (!tessMatch) throw Error('Missing the Tesseract library script.');
html = html.replace(tessMatch[0], '');
const ocrWorkerBytes = Buffer.concat([ocrCore, Buffer.from('\n;\n'), ocrWorker]);
const OCR = {
  lib: put(`vendor/ocr/tesseract.${hash(tessMatch[1])}.js`, tessMatch[1]),
  worker: put(`vendor/ocr/worker.${hash(ocrWorkerBytes)}.js`, ocrWorkerBytes),
  langDir: `${BASE}vendor/ocr/${hash(ocrLang)}`,
};
put(`vendor/ocr/${hash(ocrLang)}/eng.traineddata.gz`, ocrLang);

// The OCR loader: same API (window.LumenOCR.createWorker), engine fetched on first use.
const ocrLoader = html.match(/<script>(\(function\(\)\{\n const blobs=\[\];[\s\S]*?window\.LumenOCR=[\s\S]*?)<\/script>/);
if (!ocrLoader) throw Error('Missing the OCR loader script.');
html = html.replace(ocrLoader[1], `(function(){
 const V=${JSON.stringify(OCR)};let ready=null;
 const load=()=>ready??=new Promise((ok,bad)=>{if(window.Tesseract)return ok();const s=document.createElement('script');s.src=V.lib;s.onload=ok;s.onerror=()=>{ready=null;s.remove();bad(Error('The OCR engine could not load. Check your connection and try again.'))};document.head.appendChild(s)});
 window.LumenOCR={
  preload:load,
  async createWorker(logger){
   await load();
   if(!window.Tesseract)throw Error('The local OCR engine did not load.');
   return window.Tesseract.createWorker('eng',1,{workerPath:V.worker,workerBlobURL:false,corePath:'lumen-inline-core.js',langPath:location.origin+V.langDir,logger,cacheMethod:'none'});
  }
 };
})();
`);

/* ---------- The app module: PowerPoint, PDF engine data, pictures ---------- */
const modMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!modMatch) throw Error('Missing the app module.');
let mod = modMatch[1];

const pptxUrl = put(`vendor/pptx/pptxgen.${hash(pptx)}.js`, pptx);
{
  const [a, b] = between(mod, "HCA7PptxReady ??= (async () => {\n", "  })().catch(e => { HCA7PptxReady = null; throw e; });", 'PowerPoint loader');
  mod = mod.slice(0, a) + `    await new Promise((ok, bad) => { const s = document.createElement('script'); s.src = ${JSON.stringify(pptxUrl)}; s.onload = ok; s.onerror = () => { s.remove(); bad(Error('The PowerPoint tools could not load. Check your connection and try again.')); }; document.head.appendChild(s); });\n` + mod.slice(b);
}

{
  // var jo='<pdf.js worker>',Mo={cMapUrl:…,standardFontDataUrl:…,wasmUrl:…};jo="<compat bootstrap>"+jo;Gi.workerSrc=URL.createObjectURL(…);
  const head = "var jo='", tail = "\"+jo;Gi.workerSrc=URL.createObjectURL(new Blob([jo],{type:`text/javascript`}));";
  const a = once(mod, head, 'PDF worker'), z = once(mod, tail, 'PDF worker tail') + tail.length;
  const block = mod.slice(a, z);
  const m1 = block.indexOf("',Mo={cMapUrl:"), m2 = block.indexOf('};jo="');
  const worker = evalLiteral(block.slice(4, m1 + 1));
  const data = evalLiteral(block.slice(m1 + 5, m2 + 1));
  const compat = evalLiteral(block.slice(m2 + 5, block.length - tail.length + 1));
  const workerCode = "if(typeof Promise.try!=='function'){Object.defineProperty(Promise,'try',{configurable:true,writable:true,value:function(f){var a=Array.prototype.slice.call(arguments,1);return new Promise(function(r){r(f.apply(void 0,a));});}});}\n" + compat + worker;
  const workerUrl = put(`vendor/pdf/worker.${hash(workerCode)}.mjs`, workerCode);
  const dataDir = `vendor/pdf/${hash(JSON.stringify(data))}`;
  let files = 0;
  for (const [kind, entries] of Object.entries(data)) for (const [name, value] of Object.entries(entries)) { put(`${dataDir}/${kind}/${name}`, Buffer.from(value, 'base64')); files++; }
  if (files < 50) throw Error('PDF engine data looks incomplete.');
  mod = mod.slice(0, a) + `var jo=null,Mo=null;Gi.workerSrc=${JSON.stringify(workerUrl)};` + mod.slice(z);
  mod = replaceOnce(mod, 'async fetch({kind:e,filename:t}){let n=Mo[e]?.[t];if(!n)throw Error(`The embedded reader does not contain ${t}.`);return Fo(n)}',
    `async fetch({kind:e,filename:t}){let n=await fetch(${JSON.stringify(BASE + dataDir)}+\`/\${e}/\${encodeURIComponent(t)}\`);if(!n.ok)throw Error(\`The reader could not load \${t}.\`);return new Uint8Array(await n.arrayBuffer())}`, 'PDF data factory');
}

{
  const seen = new Map();
  mod = mod.replace(/data:image\/(jpeg|webp|png);base64,([A-Za-z0-9+/=]{20000,})/g, (_, ext, data) => {
    const bytes = Buffer.from(data, 'base64'), name = `img/${hash(bytes)}.${ext === 'jpeg' ? 'jpg' : ext}`;
    if (!seen.has(name)) seen.set(name, put(name, bytes));
    return seen.get(name);
  });
}

/* ---------- My Day: shared shell, new Today and top bar (see ../shared and src/day.js) ---------- */
const replaceAll = (text, find, repl, label) => { const n = text.split(find).length - 1; if (!n) throw Error(`Expected at least one ${label}.`); return text.split(find).join(repl); };
mod = replaceOnce(mod, "className:`app-sidebar`,inert", "className:`app-sidebar hs-side`,inert", 'sidebar class');
mod = replaceOnce(mod, "className:`main-navigation`,\"aria-label\":`Main navigation`", "className:`main-navigation hs-nav`,\"aria-label\":`Main navigation`", 'main nav class');
mod = replaceOnce(mod, "{className:n===t||t===`library`&&Ne?`active`:``,onClick:()=>le(t),title:", "{className:`hs-item ${n===t||t===`library`&&Ne?`active`:``}`,onClick:()=>le(t),title:", 'nav item class');
mod = replaceOnce(mod, "[`home`,`home-5-line`,`Today`]", "[`home`,`home-5-line`,`My Day`]", 'nav label');
mod = replaceOnce(mod, "Fe={home:`Today`,", "Fe={home:`My Day`,", 'crumb label');
mod = replaceOnce(mod, "let titles={home:'Today',", "let titles={home:'My Day',", 'document title');
mod = replaceOnce(mod, "nav('Today', 'home', 'home-5-line', 'T')", "nav('My Day', 'home', 'home-5-line', 'T')", 'command: my day');
mod = replaceOnce(mod, "['Go to Today', ['G', 'T']]", "['Go to My Day', ['G', 'T']]", 'shortcut label');
mod = replaceAll(mod, "the welcome banner on Today", "the welcome banner on My Day", 'banner command');
mod = replaceOnce(mod, "under Today → Set goal", "under My Day → Set goal", 'ladder help');
mod = replaceOnce(mod, "Today shows your progress against this number.", "My Day shows your progress against this number.", 'goal help');
mod = replaceOnce(mod, "title: 'Start on Today', text: 'Today shows what to do next:", "title: 'Start on My Day', text: 'My Day shows what to do next:", 'guide step');
mod = replaceOnce(mod, "Lumen shapes your Today plan around your goal.", "Lumen shapes your My Day plan around your goal.", 'hook copy');
// the shell treats everything under 1024px as the compact layout
mod = replaceOnce(mod, "(0,_.useState)(()=>window.innerWidth<=760)", "(0,_.useState)(()=>window.innerWidth<=1023)", 'compact state');
mod = replaceOnce(mod, "let e=matchMedia(`(max-width: 760px)`),t=()=>p(e.matches)", "let e=matchMedia(`(max-width: 1023px)`),t=()=>p(e.matches)", 'compact query');
mod = replaceOnce(mod, "{className:`app-topbar`,children:[(0,C.jsxs)(`div`,{className:`topbar-location`,", "{className:`app-topbar hs-top`,children:[HC(`button`,{type:`button`,className:`hs-mbrand`,onClick:()=>le(`home`),\"aria-label\":`Lumen: My Day`},HC(`span`,{className:`hs-crest`},HC(`img`,{src:HCACrest,alt:``,width:34,height:34})),HC(`span`,{},`Lumen`)),(0,C.jsxs)(`div`,{className:`topbar-location hs-crumbs`,", 'topbar start');
mod = replaceOnce(mod, "children:Ne?`Your library`:`Your workspace`}", "children:Ne?`Your library`:`Lumen`}", 'breadcrumb home');
{
  const start = "(0,C.jsxs)(`div`,{className:`topbar-actions`,children:[", end = "]}),(0,C.jsx)(`main`,{id:`main-content`";
  const a = once(mod, start, 'topbar actions'), z = once(mod, end, 'topbar end');
  if (z < a) throw Error('Top bar markers are out of order.');
  mod = mod.slice(0, a) + "HC(HCA11TopActions,{session:m===`session`})" + mod.slice(z);
}
mod = replaceOnce(mod, "(0,C.jsxs)(`nav`,{className:`secondary-navigation`,\"aria-label\":`Workspace resources`,", "(0,C.jsxs)(`nav`,{className:`secondary-navigation hs-nav`,\"aria-label\":`Workspace resources`,", 'resources nav class');
mod = replaceOnce(mod, "(0,C.jsxs)(`button`,{title:`A little tour`,onClick:", "(0,C.jsxs)(`button`,{className:`hs-item`,title:`A little tour`,onClick:", 'tour item class');
// Study desk: collapsible group
mod = replaceOnce(mod, "const ui = HCA7Use(), t = HCA8UseTimer(), desk = ui.desk || {};\n  const item =", "const ui = HCA7Use(), t = HCA8UseTimer(), desk = ui.desk || {}, [fold, setFold] = _.useState(HCA11FoldOpen());\n  const item =", 'desk fold state');
mod = replaceOnce(mod, "HC('div', { className: 'sidebar-divider' }),\n    HC('div', { className: 'sidebar-label' }, 'STUDY DESK'),\n    HC('nav', { className: 'secondary-navigation hca8-desk-nav', 'aria-label': 'Study desk' },", "HC('details', { className: 'hs-fold', open: fold, onToggle: e => { setFold(e.currentTarget.open); HCA11Fold(e.currentTarget.open); } }, HC('summary', {}, 'Study desk'),\n    HC('nav', { className: 'secondary-navigation hs-nav hca8-desk-nav', 'aria-label': 'Study desk' },", 'desk fold start');
mod = replaceOnce(mod, "HC('span', {}, 'How to use the desk'))));\n}", "HC('span', {}, 'How to use the desk')))));\n}", 'desk fold end');
mod = replaceOnce(mod, "className: desk[key] ? 'hca8-on' : '', onClick: () => key === 'calc'", "className: `hs-item ${desk[key] ? 'hca8-on' : ''}`, onClick: () => key === 'calc'", 'desk item class');
mod = replaceOnce(mod, "/*HCA10:END*/", "/*HCA10:END*/\n" + fs.readFileSync('src/day.js', 'utf8') + '\n' + fs.readFileSync('src/reader.js', 'utf8'), 'HCA10 end');

/* ---------- Workspace storage (src/storage.js + src/storage.css): "Your learning space" ---------- */
// storage.js uses the bundle's own file store and helpers by name: fail the build loudly if one of them is renamed.
for (const a of ['function ge(){return he||=new Promise', 'async function _e(e,t){L.set(e,t)', 'async function ve(e){if(L.has(e))return L.get(e)', 'async function ye(e){L.delete(e)', 'function R(e,t,n=`text/plain;charset=utf-8`)',
  'function Ro(e){No.get(e)?.destroy()', 'async function Lo(e,t,n){if(No.has(t))return No.get(t)', 'function ee({icon:e=`book-open-line`', 'function WorkspaceHealth(){']) once(mod, a, `storage anchor ${a.slice(0, 40)}`);
mod = replaceOnce(mod, "/*HCA12:END*/", "/*HCA12:END*/\n" + fs.readFileSync('src/storage.js', 'utf8'), 'HCA12 end (storage block follows)');
// adding sources: warn at 80% of the learner's own limit, ask before going over it (and before the browser itself runs out)
mod = replaceOnce(mod, "if(window.HCA&&HCA.limit&&!HCA.limit(`source`,HCA10SourceCount()+r.length))return!1;", "if(window.HCA&&HCA.limit&&!HCA.limit(`source`,HCA10SourceCount()+r.length))return!1;if(!await HCASpaceGate(r))return!1;", 'import: space gate');
// bug fix: this pdf.js has no PDFDocumentProxy.destroy(), so releasing an opened source threw and "Remove source" did nothing until a reload
mod = replaceOnce(mod, "function Ro(e){No.get(e)?.destroy(),No.delete(e)", "function Ro(e){{const d=No.get(e);try{d?.loadingTask?.destroy?.()}catch{}try{d?.destroy?.()}catch{}}No.delete(e)", 'release a source (pdf.js has no destroy())');
// when a file could not be kept, say whether the browser is simply full
mod = replaceOnce(mod, "P(`Sources opened for this session. Browser storage is unavailable; download a workspace backup before closing.`,`warning`)", "P(HCASpaceSaveFailMsg(),`warning`)", 'import: not kept message');
// the privacy dialog opens with the storage card (Local-first pill); the old quota line is gone
mod = replaceOnce(mod, "eyebrow:`THE IMPORTANT BOUNDARIES`,onClose:e,children:[(0,C.jsx)(`div`,{className:`privacy-hero-icon`,children:(0,C.jsx)(E,{name:`lock-line`})}),", "eyebrow:`THE IMPORTANT BOUNDARIES`,onClose:e,children:[HC(HCASpaceCard),(0,C.jsx)(`div`,{className:`privacy-hero-icon`,children:(0,C.jsx)(E,{name:`lock-line`})}),", 'privacy: storage card');
mod = replaceOnce(mod, "(0,C.jsx)(WorkspaceHealth,{}),", "", 'privacy: old quota line');
// Settings links to it
mod = replaceOnce(mod, "(0,C.jsxs)(`div`,{className:`settings-links`,children:[(0,C.jsxs)(`button`,{className:`text-link`,onClick:()=>a({type:`privacy`}),children:[`Privacy & clinical boundaries`,", "(0,C.jsxs)(`div`,{className:`settings-links`,children:[(0,C.jsxs)(`button`,{className:`text-link`,onClick:()=>a({type:`space`}),children:[`Workspace storage and space limit`,(0,C.jsx)(E,{name:`arrow-right-line`})]}),(0,C.jsxs)(`button`,{className:`text-link`,onClick:()=>a({type:`privacy`}),children:[`Privacy & clinical boundaries`,", 'settings: storage link');
// "could not be saved" bar offers the way to make room
mod = replaceOnce(mod, "HCABtn('Download backup', () => ctx.backupWorkspace(), 'light', 'download-line'),", "HCABtn('Download backup', () => ctx.backupWorkspace(), 'light', 'download-line'),\n    HCABtn('Make room', () => ctx.setModal({ type: 'space', focus: 'room' }), 'light', 'folder-line'),", 'storage bar: make room');
// "Your work and where it lives": the quota line becomes the learner's own space
{
  const start = "HC('div', { className: 'hca9-store-meter' },", end = "HC('div', { className: 'hca8-row' },\n      HCABtn('Back up now'";
  const a = once(mod, start, 'saved meter start'), z = once(mod, end, 'saved meter end');
  if (z < a) throw Error('Saved-meter markers are out of order.');
  mod = mod.slice(0, a) + 'HC(HCASpaceMini),\n    ' + mod.slice(z);
}
// the reader: a source whose file is not on this device says why, and offers the way back
mod = replaceOnce(mod, "if(!n)throw Error(`The original file is not in this browser. Restore a full workspace backup, or reimport the file. A sandboxed preview may be session-only.`);", "if(!n||HCASpaceIsStub(n))throw Error(HCASpaceMissingMsg());", 'reader: file not on this device');
mod = replaceOnce(mod, "(0,C.jsx)(ee,{icon:`file-pdf-2-line`,title:`This source needs another look.`,text:g,children:(0,C.jsx)(k,{variant:`soft`,icon:`upload-2-line`,onClick:()=>r({type:`upload`}),children:`Import a source`})})", "HC(HCASpaceGap,{book:e,message:g,setModal:r})", 'reader: source panel');

/* ---------- Reading room (src/reader.js): asserted hooks into the minified reader ---------- */
// the app shell no longer takes the old "reader-view" styles (a 52px rail and no top bar that the shared shell replaced)
mod = replaceOnce(mod, "className:`app-shell ${Ne?`reader-view`:``}", "className:`app-shell ${Ne?`hl-reader-on`:``}", 'app shell reader class');
// page rail: image sources get real previews
mod = replaceOnce(mod, "function _s({book:e,page:t,doc:n,active:r,onClick:i,cache:a}){", "function _s(props){return HC(HCA12RailThumb,props)}function HCA12RailOrig({book:e,page:t,doc:n,active:r,onClick:i,cache:a}){", 'page rail tile');
// the study panel stays closed until asked for; the page rail remembers whether it was open
mod = replaceOnce(mod, "[S,w]=(0,_.useState)(()=>window.innerWidth>=1100)", "[S,w]=(0,_.useState)(HCA12PanelInit)", 'study panel default');
mod = replaceOnce(mod, "[T,D]=(0,_.useState)(null)", "[T,D]=(0,_.useState)(HCA12ThumbsInit)", 'page rail default');
// whole page by default: spread only when wide enough, size from the stage, fit remembered per source type
mod = replaceOnce(mod, "Ce=b===`flip`&&!be&&!((e.hcaRatio||1.414)<.9)||j!==null", "Ce=HCA12Spread(b,be,e,xe,j,t.settings,l)", 'spread rule');
mod = replaceOnce(mod, "Ee=HCAReaderPageWidth(xe.width,xe.height,Ce,t.settings.readerFit||`width`,e.hcaRatio||1.414),De=Math.max(140,Ee)*A,", "De=HCA12PageW(xe,Ce,t.settings,e,A,l),", 'page width');
mod = replaceOnce(mod, "Oe=De*(e.hcaRatio||1.414);", "Oe=De*HCA12Ratio(e,l);", 'page height');
mod = replaceOnce(mod, "fit-${t.settings.readerFit||`width`}", "fit-${HCA12FitOf(t.settings,e)}", 'fit class');
mod = replaceOnce(mod, "const hcaSetState=n,hcaToast=i;", "HCA12Probe({book:e,doc:u,record:f,page:l,setPage:Ae,mode:b,setMode:Fe,spread:Ce,stage:xe,zoom:A,setZoom:te,tool:re,setTool:ie,drawer:T,setDrawer:D,panel:S,setPanel:w,width:De,focused:o,setFocus:s,next:Me,prev:Ne,download:Ve});const hcaSetState=n,hcaToast=i;", 'reader probe');
// page rail beside the stage (not over it) and a labelled "Pages" button
mod = replaceOnce(mod, "children:[T&&(0,C.jsx)(vs,{book:e,doc:u,page:l,getText:ke,onPage:e=>{Ae(e),be&&D(null)},onClose:()=>D(null),initialTab:T}),(0,C.jsxs)(`div`,{className:`stage-topline`", "children:[(0,C.jsxs)(`div`,{className:`stage-topline`", 'stage children');
mod = replaceOnce(mod, "(0,C.jsxs)(`div`,{className:`reader-stage surround-", "(0,C.jsxs)(`div`,{className:`hl-body`,children:[T&&(0,C.jsx)(vs,{book:e,doc:u,page:l,getText:ke,onPage:e=>{Ae(e),be&&D(null)},onClose:()=>{D(null),HCA12ThumbsSave(!1)},initialTab:T}),(0,C.jsxs)(`div`,{className:`reader-stage surround-", 'stage wrapper start');
mod = replaceOnce(mod, "]}),(0,C.jsxs)(`div`,{className:`reader-bottom-toolbar`", "]})]}),(0,C.jsxs)(`div`,{className:`reader-bottom-toolbar`", 'stage wrapper end');
mod = replaceOnce(mod, "(0,C.jsx)(O,{icon:`side-bar-line`,label:`Pages, contents, and bookmarks`,active:!!T,onClick:()=>D(T?null:`contents`)})", "(0,C.jsxs)(`button`,{type:`button`,className:`icon-button hl-pages ${T?`active`:``}`,\"aria-label\":`Pages, contents, and bookmarks`,\"aria-pressed\":!!T,title:`Pages, contents, and bookmarks`,onClick:()=>{D(T?null:`contents`),HCA12ThumbsSave(!T)},children:[(0,C.jsx)(E,{name:`side-bar-line`}),(0,C.jsx)(`span`,{children:`Pages`})]})", 'pages button');
// bottom bar: fit menu + zoom replace the old two-way switch and the 65%-200% zoom
mod = replaceOnce(mod, "(0,C.jsx)(HCAReaderFit,{}),", "", 'old fit switch');
mod = replaceOnce(mod, "(0,C.jsxs)(`div`,{className:`zoom-controls`,children:[(0,C.jsx)(O,{icon:`subtract-line`,label:`Zoom out`,disabled:A<=.65||b===`text`,onClick:()=>te(e=>Math.max(.65,e-.1))}),(0,C.jsxs)(`button`,{className:`zoom-value`,title:`Reset to fit`,onClick:()=>te(1),children:[Math.round(A*100),`%`,(0,C.jsx)(E,{name:`arrow-down-s-line`})]}),(0,C.jsx)(O,{icon:`add-line`,label:`Zoom in`,disabled:A>=2||b===`text`,onClick:()=>te(e=>Math.min(2,e+.1))})]})", "b===`text`?(0,C.jsx)(`span`,{className:`hl-view-spacer`}):(0,C.jsx)(HCA12ViewControls,{book:e,zoom:A,setZoom:te,width:De})", 'zoom controls');
// focus mode: an obvious, labelled way out
mod = replaceOnce(mod, "icon:`fullscreen-exit-line`,onClick:()=>{s(!1),document.fullscreenElement&&document.exitFullscreen?.()},children:`Leave focus`", "icon:`close-line`,className:`hl-exit`,onClick:()=>{s(!1),document.fullscreenElement&&document.exitFullscreen?.()},children:`Exit full screen`", 'leave focus');
/* ---------- Clearer names, fewer look-alikes, a current tour and a floating tour tab ---------- */
// study panel: "Study tools" clashed with Tools and with the study buttons; the panel tabs now say what they do
mod = replaceOnce(mod, "HC(O,{icon:'close-line',label:'Close study tools',onClick:props.onClose})", "HC(O,{icon:'close-line',label:'Close study panel',onClick:props.onClose})", 'panel close label');
mod = replaceOnce(mod, "role:'tablist','aria-label':'Study tools'},[['annotations','Notes & pen'],['recall','Page recall'],['studio','Page studio'],['companion','Lookup']]", "role:'tablist','aria-label':'Study panel'},[['annotations','Pen & notes'],['recall','Explain'],['studio','Quiz & summary'],['companion','Look up']]", 'panel tabs');
mod = replaceOnce(mod, "[`Study tools`,S&&(0,C.jsx)(`span`,{className:`status-dot`})]", "[`Study panel`,S&&(0,C.jsx)(`span`,{className:`status-dot`})]", 'study panel button');
// toolbar: Mark a region (was Mark + note, which sat beside Snip), Explain (was Recall page), Quiz & summary (was Page studio)
mod = replaceOnce(mod, "label:'Mark + note',active:tool==='note-area'", "label:'Mark a region',active:tool==='note-area'", 'mark label');
mod = replaceOnce(mod, "title:'Mark + note (M): drag a region, then write a note'", "title:'Mark a region (M): drag a box, then write a note'", 'mark title');
mod = replaceOnce(mod, "label:rd.hidden?'Reveal page':'Recall page'", "label:rd.hidden?'Reveal page':'Explain'", 'recall label');
mod = replaceOnce(mod, "HC(HCALabelTool,{icon:'sparkling-2-line',label:'Page studio',active:rd.tab==='studio'", "HC(HCALabelTool,{icon:'sparkling-2-line',label:'Quiz & summary',active:rd.tab==='studio'", 'studio label');
// Tools menu: grouped, with the duplicate sticky note removed (the toolbar's Sticky note does the same)
mod = replaceOnce(mod, "item('scissors-cut-line', 'Snip', 'Drag a box; copy, download or keep it',", "HC('p', { key: 'sec-capture', className: 'hl-menu-sec' }, 'Capture'), item('scissors-cut-line', 'Copy a region', 'Drag a box; copy, download or keep it',", 'tools: snip');
mod = replaceOnce(mod, "item('gallery-line', 'Stickers', 'Drag clinical icons and labels onto the page',", "HC('p', { key: 'sec-add', className: 'hl-menu-sec' }, 'Add to the page'), item('gallery-line', 'Clinical stickers', 'Drag clinical icons and labels onto the page',", 'tools: stickers');
mod = replaceOnce(mod, "item('sticky-note-line', 'Pin a sticky note', 'Click the exact spot on the page', () => pick('sticky'), { disabled: !imageMode, pressed: tool === 'sticky' }),", "", 'tools: duplicate sticky');
mod = replaceOnce(mod, "item('stethoscope-line', 'Calculator',", "HC('p', { key: 'sec-work', className: 'hl-menu-sec' }, 'Look up and work out'), item('stethoscope-line', 'Calculator',", 'tools: calculator');
mod = replaceOnce(mod, "item('search-line', 'Meaning', 'Plain definition of a word or term',", "item('search-line', 'Define a word', 'Plain definition of a word or term',", 'tools: meaning');
mod = replaceOnce(mod, "item('play-fill', 'Present', 'Slides from your highlights, notes and snips',", "HC('p', { key: 'sec-share', className: 'hl-menu-sec' }, 'Share'), item('play-fill', 'Present', 'Slides from your highlights, notes and snips',", 'tools: present');
// the tour: current names and features, five short steps, and the dots follow the number of steps
{
  const TOUR = [
    { icon: 'book-open-line', title: 'Bring in your reading.', text: 'Add a PDF, a PowerPoint or a set of page images with Add a source. Everything opens on this device, and nothing is uploaded unless you choose to share an excerpt.' },
    { icon: 'book-2-line', title: 'Read the way that suits you.', text: 'Switch between flipbook, single page and text view, fit the page or the width, search the book, and open Pages for contents and bookmarks.' },
    { icon: 'mark-pen-line', title: 'Mark up the page.', text: 'Pen, highlighter, sticky note and Mark a region sit together in the toolbar. Open Pen & notes in the study panel to change colours, erase or undo.' },
    { icon: 'brain-line', title: 'Study what you read.', text: 'Explain a page from memory, then reveal it and check. Quiz & summary makes practice questions and summaries, and Look up finds the passage. Any AI is optional and always labelled.' },
    { icon: 'stack-line', title: 'Keep what matters.', text: 'Tools holds Copy a region, Magnifier, Clinical stickers, Calculator and Define a word, plus Present and Export for slides, Word, Markdown and cards. Back up your annotations from More.' }
  ];
  const a = mod.indexOf('o=[{icon:`book-open-line`,title:`A whole book. A little more space.`'), z = mod.indexOf('],s=o[i];', a);
  if (a < 0 || z < 0) throw Error('Expected the tour steps.');
  mod = mod.slice(0, a) + 'o=' + JSON.stringify(TOUR) + mod.slice(z + 1);
  mod = replaceOnce(mod, '`A QUIETER WAY TO LEARN · ${i+1} OF 4`', '`A QUIETER WAY TO LEARN · ${i+1} OF ${o.length}`', 'tour count');
  mod = replaceOnce(mod, "onClick:()=>i<3?a(i+1):(e(),", "onClick:()=>i<o.length-1?a(i+1):(e(),", 'tour next');
  mod = replaceOnce(mod, "children:[i<3?`A little further`:`Make yourself at home`", "children:[i<o.length-1?`A little further`:`Make yourself at home`", 'tour button label');
}
html = html.replace(modMatch[1], () => mod);

/* ---------- Executable inline scripts -> hashed files ---------- */
// Older browsers (before Chrome 128 / Safari 18.2) have no Promise.try, which the PDF reader's messaging uses on the page and in its worker:
// without it, adding a PDF stays on "Opening…" forever. The shim loads first (page) and is prepended to the worker.
const PROMISE_TRY = "if(typeof Promise.try!=='function'){Object.defineProperty(Promise,'try',{configurable:true,writable:true,value:function(f){var a=Array.prototype.slice.call(arguments,1);return new Promise(function(r){r(f.apply(void 0,a));});}});}\n";
let n = 0;
const shell = [];
html = html.replace(/<script(\s+type="module")?>([\s\S]*?)<\/script>/g, (_, isMod, code) => {
  if (n === 0) code = PROMISE_TRY + code;
  const name = `js/${String(n++).padStart(2, '0')}.${hash(code)}.js`;
  shell.push(put(name, code));
  return `<script${isMod ? ' type="module"' : ''} src="${BASE}${name}"></script>`;
});
if (/<script>/.test(html)) throw Error('An executable inline script is left.');

/* ---------- Install: manifest, icons, service worker ---------- */
for (const f of ['icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png']) fs.copyFileSync(path.join(SRC, 'icons', f), path.join(OUT, f));
const manifest = {
  name: 'Lumen — Healthcare Crown Academy', short_name: 'Lumen', id: '/', start_url: '/', scope: '/', display: 'standalone',
  description: 'Your private clinical study studio: read PDFs and images, collect insights and practise recall.',
  background_color: '#F8F5EF', theme_color: '#10253A', categories: ['education', 'medical'],
  icons: [
    { src: `${BASE}icon-192.png`, sizes: '192x192', type: 'image/png' },
    { src: `${BASE}icon-512.png`, sizes: '512x512', type: 'image/png' },
    { src: `${BASE}icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    { src: `${BASE}icon.svg`, sizes: 'any', type: 'image/svg+xml' }],
};
put('manifest.webmanifest', JSON.stringify(manifest, null, 2));
const pwa = put(`js/pwa.${hash('v1' + BASE)}.js`, `if('serviceWorker'in navigator&&location.protocol==='https:'&&location.pathname==='/')addEventListener('load',()=>navigator.serviceWorker.register('${BASE}sw.js',{scope:'/'}).catch(()=>{}));\n`);
shell.push(pwa);

const shellJs = put(`js/shell.${hash(fs.readFileSync('../shared/hca-shell.js', 'utf8'))}.js`, fs.readFileSync('../shared/hca-shell.js', 'utf8'));
shell.push(shellJs);
const shellCss = `<style id="hca-shell">${fs.readFileSync('../shared/hca-shell.css', 'utf8')}\n${fs.readFileSync('src/day.css', 'utf8')}\n${fs.readFileSync('src/reader.css', 'utf8')}\n${fs.readFileSync('src/storage.css', 'utf8')}</style>`;
const head = `<link rel="canonical" href="${SITE}/">
<link rel="manifest" href="${BASE}manifest.webmanifest">
<link rel="apple-touch-icon" href="${BASE}icon-192.png">
${licenceLinks}
<meta property="og:type" content="website"><meta property="og:site_name" content="Healthcare Crown Academy">
<meta property="og:title" content="Lumen — your private clinical study studio">
<meta property="og:description" content="Read PDFs and images, collect insights and practise recall in one calm workspace. Part of the Healthcare Crown Academy Crown Suite.">
<meta property="og:url" content="${SITE}/"><meta name="twitter:card" content="summary">
<meta name="hca-account-position" content="right">
<script src="/assets/js/crown-move.js"></script>
<script defer src="/assets/js/crown-account.js"></script>
<script defer src="${pwa}"></script>
<script src="${shellJs}"></script>
${shellCss}
`;
const body = html.search(/<body[\s>]/);
if (body < 0) throw Error('No <body> found.');
html = html.slice(0, body) + head + html.slice(body);
fs.writeFileSync(path.join(OUT, 'index.html'), html);

// The shell is cached on install; engines and pictures are cached the first time they are used.
const SHELL = ['/', ...shell, `${BASE}manifest.webmanifest`, `${BASE}icon-192.png`, `${BASE}icon-512.png`, `${BASE}icon.svg`];
const version = hash(html + SHELL.join());
fs.writeFileSync(path.join(OUT, 'sw.js'), `/* Lumen offline worker for /: app shell on install; engines (OCR, PDF, PowerPoint) and pictures cached when first used. */
const CACHE='lumen-web-${version}',SHELL=${JSON.stringify(SHELL)},LAZY=/^\\/lumen\\/(vendor|img|licenses)\\//;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('lumen-web-')&&k!==CACHE).map(k=>caches.open(k).then(old=>old.keys().then(reqs=>Promise.all(reqs.filter(r=>LAZY.test(new URL(r.url).pathname)).map(r=>old.match(r).then(res=>res&&caches.open(CACHE).then(c=>c.put(r,res)))))).then(()=>caches.delete(k)))))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  if(r.mode==='navigate'&&u.pathname==='/'){e.respondWith(fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put('/',copy));}return res;}).catch(()=>caches.match('/')));return;}
  if(SHELL.includes(u.pathname)||LAZY.test(u.pathname))e.respondWith(caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{if(res.ok&&res.status===200)c.put(r,res.clone());return res;}))));
});
`);
console.log(JSON.stringify({ out: OUT, scripts: n, sourceBytes: before, htmlBytes: Buffer.byteLength(html), moduleBytes: Buffer.byteLength(mod) }));
