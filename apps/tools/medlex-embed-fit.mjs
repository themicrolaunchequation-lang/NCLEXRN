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
fs.writeFileSync(path.join(DIR, 'shared/embed.css'), `/* A deck inside the lesson viewer: one screen, no page scrolling. The slide is scaled to the room that is left (see resizeStage). */
html.hca-embed,html.hca-embed body{height:100%;overflow:hidden}
html.hca-embed .topbar{display:none!important}
html.hca-embed .studio{height:100vh;align-items:start}
html.hca-embed .sidebar{top:0;height:100vh;padding-top:18px;padding-bottom:18px}
html.hca-embed .sideintro{padding-bottom:12px}
html.hca-embed .workbench{padding:10px 24px 8px;align-self:start}
html.hca-embed .workbench-heading{min-height:0;margin:0 0 8px}
html.hca-embed .workbench-heading>div:first-child{display:none}
html.hca-embed .workbench-heading>.workspace-actions{margin-left:auto}
html.hca-embed .annotation-heading,html.hca-embed .annotation-caption,html.hca-embed .course-bottom{display:none}
html.hca-embed .annotation-section{margin-top:8px}
html.hca-embed .stage-wrap{max-height:none}
@media(max-width:800px){html.hca-embed .workbench{padding:6px 10px}}
`);
const OLD = "if(focused)scale=Math.min(scale,(innerHeight-172)/720);scale=Math.max(.12,scale);stage.style.transform=`scale(${scale})`;stage.style.left=focused?";
const NEW = "const emb=!focused&&document.documentElement.classList.contains('hca-embed'),wb=emb&&wrap.closest('.workbench');if(focused)scale=Math.min(scale,(innerHeight-172)/720);if(wb)scale=Math.min(scale,(innerHeight-(wb.scrollHeight-wrap.offsetHeight))/720);scale=Math.max(.12,scale);stage.style.transform=`scale(${scale})`;stage.style.left=(focused||emb)?";
const rename = new Map(); let patched = 0;
for (const f of fs.readdirSync(JS)) {
  const p = path.join(JS, f); let t = fs.readFileSync(p, 'utf8');
  if (!t.includes('function resizeStage()') || t.includes('hca-embed')) continue;
  const n = t.split(OLD).length - 1; if (n !== 1) throw new Error(`resizeStage pattern found ${n} times in ${f}`);
  t = t.replace(OLD, () => NEW); const nn = md5(t) + '.js'; fs.writeFileSync(path.join(JS, nn), t); fs.unlinkSync(p); rename.set(f, nn); patched++;
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
