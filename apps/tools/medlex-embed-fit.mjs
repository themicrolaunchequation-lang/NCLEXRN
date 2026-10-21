// MedLex lessons: when a deck is shown inside the lesson viewer (an iframe) it fits the screen with no vertical scrolling.
// Idempotent. Run after medlex-process-lessons.mjs (which calls it) and before apps/medlex/build-web.mjs.
//   - shared/js/embed.js   marks <html class="hca-embed"> when the deck is framed (a deck opened on its own is unchanged)
//   - shared/embed.css     compact layout for that mode: no site header, the slide list scrolls inside its own column
//   - resizeStage() in the deck script also scales the slide to the height that is left, not just the width
//   - the slide itself (the 1280x720 stage): slimmer header/footer (56px more body height), term pictures laid out in the flow of their card, type of 13px and up.
//     Check any change here with apps/tools/medlex-deck-audit.mjs (zero overlaps expected at every size).
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
/* ===== the slide itself (the 1280x720 stage) ===== */
/* A slimmer slide header and footer give the slide body 56px more height; the stage keeps its 1280x720 shape, so annotations and the scale are unchanged. */
html.hca-embed{--hca-body:396px}
html.hca-embed .stage .slide-header{height:60px}
html.hca-embed .stage .slide-brand img{width:36px;height:36px}
html.hca-embed .stage .slide-brand>span{font-size:23px}
html.hca-embed .stage .slide-academy{font-size:15px}
html.hca-embed .stage .slides{top:60px;bottom:40px}
html.hca-embed .stage .slide-footer{height:40px}
html.hca-embed .course-view .slide.course-slide,html.hca-embed .stage .slide.course-slide{padding:24px 56px 22px}
html.hca-embed .stage .course-body{height:var(--hca-body)}
html.hca-embed .stage .detail-deck{height:var(--hca-body)}
html.hca-embed .stage .table-scroll{max-height:346px}
html.hca-embed .stage .root-search+.table-scroll{max-height:274px}
/* type: small slide text is lifted to 12-14px so it stays readable once the slide is scaled */
html.hca-embed .stage .eyebrow{font-size:13px;letter-spacing:2px}
html.hca-embed .stage .slide-brand small,html.hca-embed .stage .slide-footer,html.hca-embed .stage #chapterLabel{font-size:13px}
html.hca-embed .stage .slide-footer i{margin:0 8px}
html.hca-embed .stage .source-note{font-size:13px;bottom:6px}
html.hca-embed .stage .anatomy-figure figcaption,html.hca-embed .stage .image-split figcaption,html.hca-embed .stage .cover-tags{font-size:13px}
html.hca-embed .stage .image-label{font-size:13px}
html.hca-embed .stage .tilt-control,html.hca-embed .stage .quiz-badge p,html.hca-embed .stage .takeaway>span,html.hca-embed .stage .route-foot,html.hca-embed .stage .flip-hint,html.hca-embed .stage .flashcard small,html.hca-embed .stage .detail-count{font-size:13px}
html.hca-embed .stage .detail-card small,html.hca-embed .stage .course-table th{font-size:13px}
html.hca-embed .stage .detail-controls button{font-size:14px;min-height:34px}
html.hca-embed .stage .slide-art small{font-size:13px;letter-spacing:.3px;max-width:128px}
html.hca-embed .stage .slide-art{width:146px}
html.hca-embed .stage .era-grid button small,html.hca-embed .stage .era-grid button>span{font-size:13px}
html.hca-embed .stage .course-refs p{font-size:13px}
html.hca-embed .stage .course-callout>b{font-size:13px;letter-spacing:1px;flex:0 0 150px;max-width:none;min-width:0;white-space:normal}
html.hca-embed .stage .course-callout p{font-size:14px}
html.hca-embed .stage .map-key span,html.hca-embed .stage .sequence-steps button,html.hca-embed .stage .sequence-controls,html.hca-embed .stage .sequence-controls button{font-size:13px}
html.hca-embed .stage .quiz-meta{font-size:13px}
html.hca-embed .stage .quiz-options button>span{font-size:13px}
html.hca-embed .stage .quiz-reason{font-size:14px}
html.hca-embed .stage .quiz-bottom .primary{font-size:13px}
html.hca-embed .stage .quiz-bottom .text-button{font-size:13px}
html.hca-embed .stage .bank-counter,html.hca-embed .stage .bank-label,html.hca-embed .stage .bank-cue{font-size:13px}
/* term pictures: a readable size (about 92px), laid out in the flow of their card so nothing is pinned over text */
html.hca-embed .stage .term-cue{--cw:92px;--ch:80px;--dw:136px;--dh:86px;min-width:0}
html.hca-embed .stage .term-cue[data-count="2"]{--dw:124px;--dh:78px}
html.hca-embed .stage .term-cue[data-count="3"]{--cw:64px;--ch:58px;--dw:96px;--dh:60px}
html.hca-embed .stage .term-cue-images{flex-wrap:wrap;min-width:0;max-width:100%}
html.hca-embed .stage .term-cue img{width:var(--cw)!important;height:var(--ch)!important;flex:0 0 auto}
html.hca-embed .stage .term-cue img[data-kind=diagram]{width:var(--dw)!important;height:var(--dh)!important}
html.hca-embed .stage .term-cue-caption{font-size:13px!important;max-width:170px;line-height:1.25}
/* recall cards */
html.hca-embed .stage .recall-card{height:auto;min-height:127px}
html.hca-embed .stage .recall-card small{font-size:13px}
html.hca-embed .stage .recall-front>span{font-size:13px}
html.hca-embed .stage .recall-back>span{font-size:14px}
html.hca-embed .stage .recall-back i{position:static;display:block;margin-top:8px;font-size:13px}
html.hca-embed .stage .recall-card.has-term-cue{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:14px;align-items:center;padding:14px 16px!important;min-height:150px}
html.hca-embed .stage .recall-card.has-term-cue>.term-cue{position:static;transform:none;grid-column:2;grid-row:1;width:auto;max-width:250px;justify-self:end}
html.hca-embed .stage .recall-card.has-term-cue>.recall-front,html.hca-embed .stage .recall-card.has-term-cue>.recall-back{grid-column:1;grid-row:1;min-width:0}
html.hca-embed .stage .recall-card.has-term-cue .recall-front strong{font-size:22px}
html.hca-embed .stage .recall-card.has-term-cue .recall-back strong{font-size:20px}
html.hca-embed .stage .course-flips.cols-3 .recall-card.has-term-cue>.term-cue,html.hca-embed .stage .course-flips.cols-2 .recall-card.has-term-cue>.term-cue{max-width:210px}
/* word parts: the picture sits under the label, name and hint */
html.hca-embed .stage .word-part.has-term-cue{display:flex;flex-direction:column;align-items:flex-start;padding:16px 14px;min-height:0}
html.hca-embed .stage .word-part.has-term-cue>.term-cue{position:static;order:9;margin-top:auto;align-self:flex-start;width:auto}
html.hca-embed .stage .word-part small{font-size:13px}
html.hca-embed .stage .word-part>span:not(.term-cue){font-size:13px}
html.hca-embed .stage .word-part.has-term-cue strong{font-size:34px;margin:10px 0}
/* flash cards (study bank) */
html.hca-embed .stage .bank-flip.has-term-cue{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:24px;align-items:center;padding:10px 22px;height:auto;min-height:124px;text-align:left}
html.hca-embed .stage .bank-flip.has-term-cue>.term-cue{position:static;transform:none;grid-column:1;grid-row:1/span 3;width:auto;max-width:300px}
html.hca-embed .stage .bank-flip.has-term-cue>.term-cue .term-cue-images{flex-wrap:wrap}
html.hca-embed .stage .bank-flip.has-term-cue>:not(.term-cue){grid-column:2;min-width:0}
html.hca-embed .stage .bank-flip.has-term-cue .bank-form{font-size:30px}
html.hca-embed .stage .bank-example>.term-cue{--cw:56px;--ch:50px;--dw:80px;--dh:50px}
/* word-building lab: parts and prompt on the left, the answer beside them (it was pinned over them) */
html.hca-embed .stage .curated-builder .builder-parts>span.has-term-cue{padding:6px 12px!important;column-gap:10px}
html.hca-embed .stage .curated-builder .builder-parts b{font-size:36px}
html.hca-embed .stage .curated-builder .builder-parts small,html.hca-embed .stage .curated-builder .builder-top small{font-size:13px}
html.hca-embed .stage .curated-builder .builder-prompt{font-size:14px}
html.hca-embed .stage .curated-builder .primary{font-size:14px;padding:12px 18px}
html.hca-embed .stage .curated-builder .builder-select{font-size:15px}
html.hca-embed .stage .curated-builder .builder-result>strong{font-size:34px}
html.hca-embed .stage .curated-builder .builder-result p{font-size:17px}
html.hca-embed .stage .curated-builder .builder-result small{font-size:14px}
html.hca-embed .stage .curated-builder .builder-result>.term-cue{float:none;display:flex;margin:12px 0 0;align-items:flex-start;justify-content:flex-start}
html.hca-embed .stage .course-body>.curated-builder{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);grid-template-rows:auto auto auto 1fr;column-gap:34px;align-content:start}
html.hca-embed .stage .course-body>.curated-builder>.builder-top{grid-column:1/-1}
html.hca-embed .stage .course-body>.curated-builder>.builder-parts{grid-column:1/-1;grid-row:2;flex-wrap:wrap;margin:16px 0 14px}
html.hca-embed .stage .course-body>.curated-builder>.builder-prompt{grid-column:1;grid-row:3;margin-bottom:12px}
html.hca-embed .stage .course-body>.curated-builder>.build-reveal{grid-column:1;grid-row:4;justify-self:start;align-self:start}
html.hca-embed .stage .course-body>.curated-builder>.builder-result{position:static;grid-column:2;grid-row:3/5;min-height:0;padding-left:30px;align-self:start;left:auto;right:auto;bottom:auto;display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:18px;align-content:start}
html.hca-embed .stage .course-body>.curated-builder>.builder-result>*{grid-column:1;min-width:0}
html.hca-embed .stage .course-body>.curated-builder>.builder-result>.term-cue{grid-column:2;grid-row:1/span 3;margin:0}
/* pictures beside text in cards, shelves, tables, reveal rows and sequences */
html.hca-embed .stage .detail-card>.term-shelf{float:right;flex-wrap:wrap;justify-content:flex-end;border:0;margin:0 0 6px 16px;padding:0;max-width:58%;gap:10px}
html.hca-embed .stage .term-shelf:has(>.term-cue:nth-child(3))>.term-cue{--cw:68px;--ch:60px;--dw:100px;--dh:62px}
html.hca-embed .stage .term-shelf .term-cue-caption{font-size:13px!important}
html.hca-embed .stage .course-cards article>.term-shelf{max-width:190px}
html.hca-embed .stage .course-table td>.term-cue{--cw:60px;--ch:56px;--dw:96px;--dh:60px;max-width:130px;float:none;display:inline-flex;vertical-align:middle;margin:0 12px 0 0}
html.hca-embed .stage .course-table td>.term-cue img{padding:2px}
html.hca-embed .stage .reveal-grid summary>.term-cue{--cw:80px;--ch:70px;--dw:110px;--dh:70px}
html.hca-embed .stage .sequence-body{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:18px;align-content:start}
html.hca-embed .stage .sequence-body>*{grid-column:1;min-width:0}
html.hca-embed .stage .sequence-body>.term-cue{grid-column:2;grid-row:1/span 4}
/* a table card with room: when a page holds three cards or fewer, the table card takes the full height of its column */
html.hca-embed .stage .detail-page:has(>.detail-card:nth-child(3)):not(:has(>.detail-card:nth-child(4)))>.detail-card:has(.table-scroll){grid-row:span 2}
html.hca-embed .stage .detail-page.single>.detail-card:has(.table-scroll){grid-row:auto}
/* reveal rows: the picture sits before the + sign (the deck rotates every span in an open summary, which turned the pictures on their side) */
html.hca-embed .stage .reveal-grid summary{align-items:center;justify-content:flex-start;gap:14px}
html.hca-embed .stage .reveal-grid summary>.term-cue{order:1;margin:0 14px 0 auto;float:none}
html.hca-embed .stage .reveal-grid details[open] summary span,html.hca-embed .stage .reveal-grid summary .term-cue,html.hca-embed .stage .reveal-grid summary .term-cue *{transform:none}
html.hca-embed .stage .reveal-grid summary>span:not(.term-cue){order:2;flex:none}
html.hca-embed .stage .reveal-grid details[open] summary>span:not(.term-cue){transform:rotate(45deg)}
html.hca-embed .stage .reveal-grid summary .term-cue-images{display:flex}
html.hca-embed .stage .reveal-grid details p{font-size:15px}
html.hca-embed .stage .slide-art small{line-height:1.5}
/* recall cards in a narrow column: three to a row inside a detail card the picture goes under the text and the repeated label is visually hidden */
html.hca-embed .stage .detail-card .course-flips.cols-3 .recall-card{padding:10px 12px!important;min-height:0}
html.hca-embed .stage .detail-card .course-flips.cols-3 .recall-card.has-term-cue{grid-template-columns:minmax(0,1fr);row-gap:6px;align-items:start;min-height:0}
html.hca-embed .stage .detail-card .course-flips.cols-3 .recall-card.has-term-cue>.term-cue{grid-column:1;grid-row:2;justify-self:start;max-width:100%;--cw:56px;--ch:56px;--dw:80px;--dh:56px}
html.hca-embed .stage .detail-card .course-flips.cols-3 .recall-card.has-term-cue>.recall-front,html.hca-embed .stage .detail-card .course-flips.cols-3 .recall-card.has-term-cue>.recall-back{grid-row:1}
html.hca-embed .stage .detail-card .course-flips.cols-3 .recall-card small{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
html.hca-embed .stage .detail-card .course-flips.cols-3 .recall-card strong{margin:0 0 6px;font-size:20px!important}
html.hca-embed .stage .detail-card .course-flips.cols-3 .recall-card .recall-back strong{margin:0 0 4px}
html.hca-embed .stage .detail-card .course-flips.cols-2 .recall-card.has-term-cue>.term-cue{--cw:76px;--ch:66px;--dw:110px;--dh:68px}
/* picture label in the corner: a long label wraps, the box grows with it */
html.hca-embed .stage .slide-art{height:auto;min-height:120px}
html.hca-embed .stage .slide-art small{white-space:normal;overflow:visible;text-overflow:clip;text-align:center}
html.hca-embed .stage .course-slide.visual-enhanced .course-title{padding-right:176px}
/* source links: a long name wraps instead of being cut off */
html.hca-embed .stage .source-note{flex-wrap:wrap;white-space:normal;row-gap:2px}
html.hca-embed .stage .source-note a{max-width:none;overflow:visible;text-overflow:clip}
html.hca-embed .stage .detail-card .course-flips.cols-3 .recall-card .term-cue-caption{display:none}
html.hca-embed .stage .model-panel figcaption{font-size:13px}
html.hca-embed .stage .sequence-label{font-size:13px!important}
html.hca-embed .stage .table-scroll:has(+.course-callout){max-height:282px}
html.hca-embed .stage .root-search+.table-scroll:has(+.course-callout){max-height:210px}
html.hca-embed .stage .course-callout>b{letter-spacing:.6px;flex-basis:200px}
html.hca-embed dialog .course-callout>b,html.hca-embed dialog .quiz-meta,html.hca-embed dialog .course-table th,html.hca-embed dialog .bank-counter,html.hca-embed dialog .model-panel figcaption,html.hca-embed dialog .sequence-label{font-size:13px!important}
html.hca-embed .stage .detail-card details{display:flow-root}
html.hca-embed .stage .slide-art{top:20px;padding:6px}
html.hca-embed .stage .slide-art img{width:72px;height:66px}
html.hca-embed .stage .slide-art.kind-icon img{width:62px;height:62px}
html.hca-embed .stage .slide-art small{line-height:1.3}
html.hca-embed .stage .curated-builder .builder-parts>span{flex:0 0 auto}
html.hca-embed dialog .text-button{font-size:14px}
html.hca-embed .term-atlas-head small{font-size:13px}
html.hca-embed .stage .curated-builder .builder-parts{flex-wrap:wrap}
html.hca-embed .stage .detail-card .curated-builder .term-cue{--cw:60px;--ch:56px;--dw:90px;--dh:58px}
html.hca-embed .stage .detail-card .curated-builder .builder-parts b{font-size:26px}
html.hca-embed .stage .detail-page:not(.single):not(:has(>.detail-card:nth-child(3)))>.detail-card:has(.curated-builder){grid-row:span 2}
html.hca-embed .stage .detail-card .curated-builder .builder-parts>span.has-term-cue{padding:4px 8px!important}
html.hca-embed .stage .detail-card .curated-builder .builder-result{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:14px}
html.hca-embed .stage .detail-card .curated-builder .builder-result>*{grid-column:1;min-width:0}
html.hca-embed .stage .detail-card .curated-builder .builder-result>.term-cue{grid-column:2;grid-row:1/span 3;margin:0}
html.hca-embed .stage .detail-card .curated-builder .builder-parts{gap:8px}
html.hca-embed .stage .detail-card .curated-builder .builder-parts>span.has-term-cue{column-gap:6px}
/* three recall cards across the slide: tighter, so a revealed answer still fits two rows */
html.hca-embed .stage .course-body>.course-flips.cols-3 .recall-card.has-term-cue{padding:12px 14px!important;column-gap:12px}
html.hca-embed .stage .course-body>.course-flips.cols-3 .recall-card.has-term-cue>.term-cue{max-width:192px}
html.hca-embed .stage .course-body>.course-flips.cols-3 .recall-card.has-term-cue>.term-cue[data-count="2"]{--cw:72px;--ch:64px;--dw:104px;--dh:66px}
html.hca-embed .stage .course-body>.course-flips.cols-3 .recall-card.has-term-cue>.term-cue[data-count="3"]{--cw:56px;--ch:56px;--dw:72px;--dh:56px}
html.hca-embed .stage .course-body>.course-flips.cols-3 .recall-card .term-cue-caption{display:none}
html.hca-embed .stage .course-body>.course-flips.cols-3 .recall-card .recall-back>span{font-size:13px;line-height:1.4}
html.hca-embed .stage .course-body>.course-flips.cols-3 .recall-card .recall-back i{margin-top:4px}
html.hca-embed .stage .course-body>.course-flips.cols-2 .recall-card.has-term-cue>.term-cue{max-width:270px}
html.hca-embed .stage .course-body>.course-flips.cols-2 .recall-card.has-term-cue>.term-cue[data-count="2"]{--cw:84px;--ch:74px;--dw:120px;--dh:76px}
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
/* a phone: pop-ups use the whole width and the Illustrated terms grid is one column (two columns pushed the pictures over the words) */
@media(max-width:700px){
html.hca-embed dialog{padding:16px}
html.hca-embed dialog .term-cue-images{flex-wrap:wrap}
html.hca-embed dialog .term-cue img{flex:0 0 auto}
html.hca-embed .term-atlas{padding:16px 14px}
html.hca-embed .term-atlas h2{font-size:28px}
html.hca-embed .term-atlas-grid{grid-template-columns:minmax(0,1fr)}
html.hca-embed dialog .term-cue img{width:92px;height:74px}
html.hca-embed dialog .term-cue img[data-kind=diagram]{width:132px;height:84px}
html.hca-embed .term-atlas-detail .term-cue img{width:min(200px,42vw);height:auto;aspect-ratio:11 / 10}
html.hca-embed .term-atlas-detail .term-cue img[data-kind=diagram]{width:min(300px,72vw);height:auto;aspect-ratio:8 / 5}
}
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
