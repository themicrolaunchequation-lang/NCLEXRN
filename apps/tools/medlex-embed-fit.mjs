// MedLex lessons: when a deck is shown inside the lesson viewer (an iframe) it fits the screen with no vertical scrolling.
// Idempotent. Run after medlex-process-lessons.mjs (which calls it) and before apps/medlex/build-web.mjs.
//   - shared/js/embed.js   marks <html class="hca-embed"> when the deck is framed (a deck opened on its own is unchanged)
//   - shared/embed.css     compact layout for that mode: no site header, the slide list scrolls inside its own column
//   - resizeStage() in the deck script also scales the slide to the height that is left, not just the width
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
const DIR = path.resolve(import.meta.dirname, '../medlex/learn'), JS = path.join(DIR, 'shared/js');
const md5 = s => crypto.createHash('md5').update(s).digest('hex').slice(0, 16);
fs.writeFileSync(path.join(JS, 'embed.js'), `/* Marks a deck that is shown inside the MedLex lesson viewer so embed.css can fit it to one screen. */
try { if (window.top !== window) document.documentElement.classList.add('hca-embed'); } catch (e) { document.documentElement.classList.add('hca-embed'); }
`);
fs.writeFileSync(path.join(DIR, 'shared/embed.css'), `/* A deck inside the lesson viewer: one screen, no page scrolling. The slide is scaled up (or down) to fill the room that is left (see resizeStage). */
html.hca-embed,html.hca-embed body{height:100%;overflow:hidden}
html.hca-embed .topbar{display:none!important}
html.hca-embed .studio{height:100vh;align-items:start;grid-template-columns:268px minmax(0,1fr);max-width:none}
@media(min-width:1500px){html.hca-embed .studio{grid-template-columns:304px minmax(0,1fr)}}
@media(max-width:1150px){html.hca-embed .studio{grid-template-columns:236px minmax(0,1fr)}}
html.hca-embed .annotation-heading,html.hca-embed .annotation-caption,html.hca-embed .course-bottom{display:none}
html.hca-embed .stage-wrap{max-height:none}
/* slide list: larger type, current slide bold */
html.hca-embed .sidebar{top:0;height:100vh;padding:14px 14px 14px;overflow:auto;scrollbar-width:thin}
html.hca-embed .back-library{font-size:14px;margin:0 4px 10px}
html.hca-embed .sideintro,html.hca-embed .course-view .sideintro{padding:0 4px 10px}
html.hca-embed .sideintro .eyebrow{font-size:12px;letter-spacing:1.6px}
html.hca-embed .course-view .sideintro h1,html.hca-embed .sideintro h1{font-size:29px;line-height:1.15;margin:8px 0 6px}
html.hca-embed .sideintro p{font-size:14px;line-height:1.5;margin:0}
html.hca-embed .course-progress{margin:10px 4px}
html.hca-embed .course-nav{gap:1px}
html.hca-embed .course-nav button{font-size:15px;line-height:1.35;padding:8px 10px;gap:10px}
html.hca-embed .course-nav button small{font-size:12px;min-width:20px}
html.hca-embed .course-nav button[aria-current=true],html.hca-embed .course-nav button[aria-current=true] span,html.hca-embed .course-nav button[aria-current=true] small{font-weight:700}
html.hca-embed .term-atlas-open{font-size:15px;padding:12px 12px;margin:2px 0 12px}
html.hca-embed .term-atlas-open small{font-size:13px;margin-top:4px}
/* workbench: the slide gets nearly all of the room */
html.hca-embed .workbench{padding:6px 10px 6px;align-self:start;position:relative}
html.hca-embed .workbench-heading{min-height:0;margin:0}
html.hca-embed .workbench-heading>div:first-child{display:none}
html.hca-embed .viewer{border-radius:8px;box-shadow:none}
html.hca-embed .viewer-top{height:38px;font-size:13px;padding:0 12px}
html.hca-embed .viewer-top b{font-size:13px}
html.hca-embed .viewer-sub{font-size:12px}
html.hca-embed .viewer-tools button{font-size:13px;padding:5px 6px}
html.hca-embed .viewer-tools svg{width:16px;height:16px}
html.hca-embed .playback{height:44px;padding:0 12px}
html.hca-embed .slide-tabs{font-size:13px;color:var(--muted)}
html.hca-embed .nav-controls>span{font-size:13px;min-width:62px}
html.hca-embed .annotation-section{margin-top:5px}
html.hca-embed .annotation-scroll{padding:0 1px 1px}
html.hca-embed .annotation-toolbar{padding:4px 12px;gap:6px}
html.hca-embed .annotation-toolbar button{height:34px;min-width:34px}
html.hca-embed .annotation-toolbar .clear-text{font-size:12px}
@media(min-width:801px) and (max-width:1199px){
html.hca-embed .workbench-heading{position:absolute;top:6px;right:10px;height:38px;z-index:3;padding-right:8px}
html.hca-embed .workbench-heading>.workspace-actions{margin-left:auto;gap:6px}
html.hca-embed .mode-toggle{height:30px;font-size:12px;padding:0 10px}
html.hca-embed .workbench-heading .icon-button{height:30px;width:30px}
html.hca-embed .viewer-top{padding-right:136px}
}
/* wide enough: the strip above the slide, its tools, Day and full screen all share the playback row under the slide, so the slide gets the height */
@media(min-width:1200px){
html.hca-embed .workbench{padding:4px 10px 4px}
html.hca-embed .annotation-section{height:44px;margin-top:4px}
html.hca-embed .annotation-toolbar{padding:3px 10px;gap:3px}
html.hca-embed .tool-group{padding-right:6px;gap:2px}
html.hca-embed .annotation-toolbar .color-swatch{margin:0 2px}
html.hca-embed .slide-tabs{display:none}
html.hca-embed .viewer-top{position:absolute;left:62px;right:284px;bottom:54px;height:44px;z-index:3;padding:0;border:0;background:none}
html.hca-embed .viewer-top>div:first-child b{white-space:nowrap}
html.hca-embed .viewer-sub{display:none}
html.hca-embed .workbench-heading{position:absolute;right:166px;bottom:61px;height:30px;margin:0;z-index:3}
html.hca-embed .workbench-heading>.workspace-actions{gap:6px}
html.hca-embed .mode-toggle{height:30px;font-size:13px;padding:0 10px}
html.hca-embed .workbench-heading .icon-button{height:30px;width:30px}
}
@media(max-width:1399px){html.hca-embed .annotation-toolbar .clear-text{font-size:0;gap:0}}
@media(min-width:1500px){html.hca-embed .viewer-sub{display:inline}}
@media(max-width:800px){html.hca-embed .studio{align-items:stretch}html.hca-embed .workbench{padding:6px 10px;align-self:stretch;width:100%}html.hca-embed .workbench-heading{margin:0 0 6px}html.hca-embed .sidebar{height:auto}html.hca-embed .course-nav button{font-size:14px}}
/* the slide itself: small type is lifted so it stays legible once the slide is scaled */
html.hca-embed .stage .eyebrow{font-size:13px;letter-spacing:2px}
html.hca-embed .stage .slide-brand small,html.hca-embed .stage .slide-footer,html.hca-embed .stage #chapterLabel{font-size:12px}
html.hca-embed .stage .source-note{font-size:11px}
html.hca-embed .stage .anatomy-figure figcaption,html.hca-embed .stage .image-split figcaption,html.hca-embed .stage .cover-tags{font-size:13px}
html.hca-embed .stage .image-label{font-size:11px}
html.hca-embed .stage .tilt-control,html.hca-embed .stage .quiz-badge p,html.hca-embed .stage .takeaway>span,html.hca-embed .stage .route-foot,html.hca-embed .stage .flip-hint,html.hca-embed .stage .flashcard small,html.hca-embed .stage .detail-count{font-size:13px}
html.hca-embed .stage .recall-card small,html.hca-embed .stage .recall-back i,html.hca-embed .stage .detail-card small,html.hca-embed .stage .quiz-meta,html.hca-embed .stage .course-table th{font-size:12px}
html.hca-embed .stage .course-callout>b{font-size:12px;max-width:none;min-width:135px;white-space:nowrap}
html.hca-embed .stage .detail-controls button{font-size:14px;min-height:34px}
html.hca-embed .stage .slide-footer i{margin:0 8px}
/* pop-ups: reading view, term pictures, overview and the editor dialogs */
html.hca-embed dialog{width:min(1040px,calc(100vw - 28px));max-height:92vh;padding:22px 30px}
html.hca-embed dialog p{font-size:17px;line-height:1.7}
html.hca-embed dialog h2{font-size:38px}
html.hca-embed dialog h3{font-size:26px}
html.hca-embed dialog label{font-size:15px}
html.hca-embed dialog input[type=text],html.hca-embed dialog textarea{font-size:17px}
html.hca-embed dialog .primary{font-size:15px}
html.hca-embed dialog .eyebrow{font-size:13px}
html.hca-embed dialog .dialog-top .icon-button{height:44px;width:44px;font-size:30px}
html.hca-embed dialog .overview-grid button b{font-size:23px}
html.hca-embed dialog .overview-grid button small{font-size:12px}
html.hca-embed dialog .edit-controls button,html.hca-embed dialog .shape-choices button{font-size:15px;padding:12px 14px}
html.hca-embed dialog .audit-table{font-size:15px}
html.hca-embed dialog .reading-view{max-height:calc(92vh - 130px);gap:18px;padding:6px}
html.hca-embed dialog .reading-view .detail-card{font-size:20px;line-height:1.6;padding:22px 28px}
html.hca-embed dialog .reading-view .detail-card h3,html.hca-embed dialog .reading-view .detail-card h4{font-size:27px;margin:0 0 10px}
html.hca-embed dialog .reading-view .detail-card p{margin:6px 0 10px}
html.hca-embed dialog .reading-view .detail-card small{font-size:16px}
html.hca-embed dialog .reading-view .detail-card .course-table{font-size:17px}
html.hca-embed dialog .reading-view .detail-card .course-callout p{font-size:18px}
html.hca-embed dialog .reading-view .detail-card .quiz-options button{font-size:18px;min-height:48px;padding:10px 14px}
html.hca-embed dialog .reading-view .detail-card .quiz-reason{font-size:16px}
html.hca-embed dialog .reading-view .detail-card .recall-card small{font-size:13px}
html.hca-embed dialog .reading-view .detail-card .recall-card strong{font-size:28px}
html.hca-embed dialog .reading-view .detail-card .recall-back>span{font-size:16px}
html.hca-embed dialog .reading-view .model-panel{height:min(560px,calc(92vh - 190px))}
html.hca-embed dialog .reading-view .detail-card img{max-width:100%}
html.hca-embed dialog .term-cue img{width:124px;height:99px;padding:4px}
html.hca-embed dialog .term-cue img[data-kind=diagram]{width:200px;height:126px;padding:0}
html.hca-embed dialog .term-cue[data-count="3"] img{width:104px;height:83px}
html.hca-embed dialog .term-cue[data-count="3"] img[data-kind=diagram]{width:140px;height:88px}
html.hca-embed dialog .term-cue-caption{font-size:15px;max-width:260px}
html.hca-embed dialog .term-cue-images{gap:8px}
html.hca-embed dialog .term-shelf{gap:18px}
html.hca-embed dialog .term-shelf>.term-cue{flex:0 0 auto;max-width:none}
html.hca-embed dialog .term-shelf .term-cue-caption{font-size:16px}
html.hca-embed .term-atlas{width:min(1200px,96vw);max-height:94vh;padding:22px 26px}
html.hca-embed .term-atlas h2{font-size:34px}
html.hca-embed .term-atlas-head p{font-size:17px}
html.hca-embed .term-atlas-search{font-size:18px;padding:14px 16px}
html.hca-embed .term-atlas-count{font-size:15px}
html.hca-embed .term-atlas-grid{max-height:calc(94vh - 220px);gap:16px}
html.hca-embed .term-atlas-card{padding:18px}
html.hca-embed .term-atlas-card>strong{font-size:22px}
html.hca-embed .term-atlas-card>p{font-size:16px}
html.hca-embed .term-atlas-card .term-cue-caption{font-size:14px}
html.hca-embed .term-atlas-close{font-size:16px;min-height:44px}
html.hca-embed .term-atlas-detail .term-cue img{width:300px;height:270px}
html.hca-embed .term-atlas-detail .term-cue img[data-kind=diagram]{width:520px;height:325px}
`);
/* Word parts quests (they carry html[data-theme]): shown in the MedLex page itself at their full height, so the page scrolls once and there is no page inside a page.
   The parent (apps/medlex/src/lib/quests.js) sizes the frame to the quest and sets --hca-vt / --hca-vh (the part of the frame on screen) so pop-ups and toasts stay in view. */
fs.appendFileSync(path.join(DIR, 'shared/embed.css'), `
html.hca-embed[data-theme]{overflow:hidden}
html.hca-embed[data-theme] .ml-brand,html.hca-embed[data-theme] .ml-coursepath{display:none}
html.hca-embed[data-theme] .ml-coursehead{justify-content:flex-end}
html.hca-embed[data-theme] .overlay{position:absolute!important;inset:auto 0!important;top:var(--hca-vt,0)!important;height:var(--hca-vh,100vh)!important}
html.hca-embed[data-theme] #toasts,html.hca-embed[data-theme] #toast{position:absolute!important;bottom:auto!important;top:calc(var(--hca-vt,0px) + var(--hca-vh,100vh) - 90px)!important}
html.hca-embed[data-theme] #confetti{position:absolute!important;top:var(--hca-vt,0)!important;height:var(--hca-vh,100vh)!important}
`);
const OLD = "if(focused)scale=Math.min(scale,(innerHeight-172)/720);scale=Math.max(.12,scale);stage.style.transform=`scale(${scale})`;stage.style.left=focused?";
const NEW = "const emb=!focused&&document.documentElement.classList.contains('hca-embed'),wb=emb&&wrap.closest('.workbench');if(focused)scale=Math.min(scale,(innerHeight-172)/720);if(wb)scale=Math.min(scale,(innerHeight-(wb.scrollHeight-wrap.offsetHeight))/720);scale=Math.max(.12,scale);stage.style.transform=`scale(${scale})`;stage.style.left=(focused||emb)?";
// Reading view: a recall card became one run of text ("RECALL BEFORE REVEALCLICK TO REVEAL ..."); show its answer instead.
const OLD2 = "const text=document.createElement('p');text.textContent=b.textContent;b.replaceWith(text);";
const NEW2 = "const text=document.createElement('p'),bk=b.querySelector('.recall-back>span');text.textContent=bk?bk.textContent:b.textContent;b.replaceWith(text);";
const rename = new Map(); let patched = 0;
for (const f of fs.readdirSync(JS)) {
  const p = path.join(JS, f); let t = fs.readFileSync(p, 'utf8'), o = t;
  if (!t.includes('function resizeStage()')) continue;
  if (!t.includes('hca-embed')) { const n = t.split(OLD).length - 1; if (n !== 1) throw new Error(`resizeStage pattern found ${n} times in ${f}`); t = t.replace(OLD, () => NEW); }
  if (t.includes(OLD2)) t = t.replace(OLD2, () => NEW2);
  if (t === o) continue;
  const nn = md5(t) + '.js'; fs.writeFileSync(path.join(JS, nn), t); fs.unlinkSync(p); rename.set(f, nn); patched++;
}
let pages = 0;
for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.html'))) {
  const p = path.join(DIR, f); let t = fs.readFileSync(p, 'utf8'), o = t;
  for (const [a, b] of rename) t = t.split('shared/js/' + a).join('shared/js/' + b);
  if (!t.includes('shared/js/embed.js')) t = t.replace('<meta name="robots" content="noindex">', () => '<meta name="robots" content="noindex">\n<script src="shared/js/embed.js"></script>');
  if (!t.includes('shared/embed.css')) t = t.replace('<link rel="stylesheet" href="shared/a11y.css">', () => '<link rel="stylesheet" href="shared/a11y.css">\n<link rel="stylesheet" href="shared/embed.css">');
  if (!t.includes('shared/embed.css') || !t.includes('shared/js/embed.js')) throw new Error('could not add the embed files to ' + f);
  if (t !== o) { fs.writeFileSync(p, t); pages++; }
}
console.log(`embed-fit: ${patched} deck scripts patched, ${pages} pages updated`);
