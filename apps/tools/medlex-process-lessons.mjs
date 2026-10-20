// Prepares the supplied MedLex lesson decks (batches 1-4) and the three Word-parts quests for the site.
//   node apps/tools/medlex-process-lessons.mjs <dir containing batch1..batch4 and words/>   (writes apps/medlex/learn/)
// What it changes, and nothing else:
//   - embedded base64 images become shared files (identical images are stored once);
//   - inline <script> code moves to shared files (the site's policy only runs scripts from its own files);
//   - onclick="..." attributes become data-oc="..." and a small delegated runner (shared/js/oc.js) calls the same function;
//   - links to the third-party preview site point back into the app (siblings stay siblings, "back" goes to Learn).
// The lesson text, data and styling are left exactly as supplied.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SRC = path.resolve(process.argv[2] || '.'), OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../medlex/learn');
const md5 = b => crypto.createHash('md5').update(b).digest('hex').slice(0, 16);
fs.rmSync(OUT, { recursive: true, force: true });
for (const d of ['shared/img', 'shared/js', 'credits']) fs.mkdirSync(path.join(OUT, d), { recursive: true });
const EXT = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/gif': 'gif', 'image/svg+xml': 'svg' };
const stats = { files: 0, img: 0, imgUnique: new Set(), js: new Set(), handlers: 0, links: 0, bytesIn: 0, bytesOut: 0 };

/* Accessibility and link fixes for the quests: each [from, to, expectedCount] must match exactly, or the build stops. */
const QUEST_PATCHES = [
  // the quests' own Prefixes / Roots / Suffixes navigation used the original file names
  ['medical-prefix-quest.html', 'quest-prefixes.html', 3], ['Medical-Roots-60-Interactive.html', 'quest-roots.html', 3], ['suffix-quest-100-medical-suffixes.html', 'quest-suffixes.html', 3],
  // Roots and Suffixes cards held buttons inside a clickable card: the card becomes a group and opening is a real button
  ['tabindex="0" role="button" aria-label="Open root ${d.r}, meaning ${d.m}"', 'role="group" aria-label="Root ${d.r}, meaning ${d.m}"', 1],
  ['<div class="tapHint">\u{1F446} TAP FOR PICTURE + HOOK + GAME</div>', '<button type="button" class="tapHint" aria-label="Open root ${d.r}: picture, memory hook and game">\u{1F446} TAP FOR PICTURE + HOOK + GAME</button>', 1],
  ['if(card&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openDetail(+card.dataset.id)}', 'if(card&&card===e.target&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openDetail(+card.dataset.id)}', 1],
  ['tabindex="0" role="button" aria-label="Open ${d[0]} details"', 'role="group" aria-label="${d[0]} suffix"', 1],
  ['<div class="suf">${d[0]}</div>', '<div class="suf"><button type="button" class="open-hit" aria-label="Open ${d[0]} details">${d[0]}</button></div>', 1],
  ['if(seek&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openModal(+seek.dataset.i)}', 'if(seek&&seek===e.target&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openModal(+seek.dataset.i)}', 1],
  // a scrolling shelf must be reachable by keyboard
  ['id="badgeShelf"', 'id="badgeShelf" tabindex="0" role="region" aria-label="Badges you can earn"', 1]
];
function patchQuest(t, name) {
  for (const [from, to, n] of QUEST_PATCHES) {
    const count = t.split(from).length - 1;
    if (count === 0) continue;                       // not every patch applies to every quest
    if (count !== n && !/^(medical-prefix|Medical-Roots|suffix-quest)/.test(from)) throw new Error(`${name}: "${from.slice(0, 40)}" matched ${count}, expected ${n}`);
    t = t.split(from).join(to);
  }
  return t;
}

function process_(file, outName, { quest = false } = {}) {
  let t = fs.readFileSync(file, 'utf8'); stats.bytesIn += t.length;
  /* 1. images */
  t = t.replace(/data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)/g, (m, mime, b64) => {
    const ext = EXT[mime]; if (!ext) return m;
    const buf = Buffer.from(b64, 'base64'), name = md5(buf) + '.' + ext, p = path.join(OUT, 'shared/img', name);
    if (!fs.existsSync(p)) fs.writeFileSync(p, buf); stats.img++; stats.imgUnique.add(name); return 'shared/img/' + name;
  });
  if (quest) t = patchQuest(t, outName);
  /* 2. inline handlers (only the quests have them; some sit inside script text, so this runs before scripts move out) */
  const hn = (t.match(/ onclick="/g) || []).length;
  if (hn) { t = t.replace(/ onclick="/g, ' data-oc="'); stats.handlers += hn; t = t.replace('</body>', '<script src="shared/js/oc.js"></script>\n</body>'); }
  /* 3. inline scripts that run (not data blocks) */
  t = t.replace(/<script([^>]*)>([\s\S]*?)<\/script>/g, (m, attrs, body) => {
    if (/\bsrc=/.test(attrs) || /type="application\/(?:ld\+)?json"/.test(attrs) || !body.trim()) return m;
    if (/type="/.test(attrs) && !/javascript|module/.test(attrs)) return m;
    const name = md5(body) + '.js', p = path.join(OUT, 'shared/js', name); if (!fs.existsSync(p)) fs.writeFileSync(p, body); stats.js.add(name);
    const keep = attrs.replace(/\s*type="[^"]*"/, '').trim(); return `<script ${keep ? keep + ' ' : ''}src="shared/js/${name}"></script>`;
  });
  /* 4. links back into the app */
  const SITE = /https:\/\/medlex-design-studio\.bouncyfield17\.chatgpt\.site/g;
  t = t.replace(/https:\/\/medlex-design-studio\.bouncyfield17\.chatgpt\.site\/batch\d\/([a-z-]+\.html)/g, (m, f) => { stats.links++; return f; });
  t = t.replace(/https:\/\/medlex-design-studio\.bouncyfield17\.chatgpt\.site\/(?:batch\d\/)?/g, () => { stats.links++; return '/#learn'; });
  if (SITE.test(t)) throw new Error('unreplaced preview link in ' + file);
  /* 5. not a page for search engines to list on its own */
  t = t.replace('<head>', '<head>\n<meta name="robots" content="noindex">'); t = t.replace('</head>', '<link rel="stylesheet" href="shared/a11y.css">\n</head>');
  fs.writeFileSync(path.join(OUT, outName), t); stats.files++; stats.bytesOut += t.length;
}

const decks = [];
for (let b = 1; b <= 4; b++) {
  const dir = path.join(SRC, 'batch' + b);
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.html')).sort()) { process_(path.join(dir, f), f); decks.push({ file: f, batch: b, slides: +((fs.readFileSync(path.join(dir, f), 'utf8').match(/(\d+)-slide interactive/) || [])[1] || 0), title: (fs.readFileSync(path.join(dir, f), 'utf8').match(/<title>([^<]*?) — MedLex/) || [])[1] || f }); }
  fs.copyFileSync(path.join(dir, 'asset-credits.json'), path.join(OUT, 'credits', `batch${b}-asset-credits.json`));
}
const QUESTS = { 'suffix-quest': 'quest-suffixes.html', 'Medical-Roots': 'quest-roots.html', 'medical-prefix-quest': 'quest-prefixes.html' };
for (const f of fs.readdirSync(path.join(SRC, 'words')).filter(x => x.endsWith('.html'))) { const k = Object.keys(QUESTS).find(k => f.includes(k)); if (k) process_(path.join(SRC, 'words', f), QUESTS[k], { quest: true }); }

/* the delegated runner: calls the function named in a data-oc="name(arg, nested(arg))" attribute, without eval */
fs.writeFileSync(path.join(OUT, 'shared/js/oc.js'), `/* Runs data-oc="fn(args)" on click, replacing inline onclick attributes. Arguments: numbers, quoted strings, true/false/null, or nested calls. No eval. */
(function () {
  'use strict';
  function parse(src) {
    let i = 0; const ws = () => { while (src[i] === ' ') i++; };
    function value() {
      ws(); const c = src[i];
      if (c === "'" || c === '"') { let s = ''; i++; while (i < src.length && src[i] !== c) { if (src[i] === '\\\\') i++; s += src[i++]; } i++; return { v: s }; }
      const m = /^(-?\\d+(?:\\.\\d+)?|true|false|null|this|event|[A-Za-z_$][\\w$]*)/.exec(src.slice(i)); if (!m) throw new Error('bad argument'); i += m[0].length;
      if (src[i] === '(') { i++; const args = []; ws(); if (src[i] === ')') i++; else { for (;;) { args.push(value()); ws(); if (src[i] === ',') { i++; continue; } if (src[i] === ')') { i++; break; } throw new Error('bad call'); } } return { call: m[0], args }; }
      const w = m[0]; if (/^-?\\d/.test(w)) return { v: parseFloat(w) }; if (w === 'true') return { v: true }; if (w === 'false') return { v: false }; if (w === 'null') return { v: null }; return { ref: w };
    }
    const seq = []; for (;;) { seq.push(value()); ws(); if (src[i] === ';') { i++; ws(); if (i >= src.length) break; continue; } break; } return { seq };
  }
  function run(n, ctx) {
    if (n.seq) { let r; n.seq.forEach(x => { r = run(x, ctx); }); return r; }
    if ('v' in n) return n.v;
    if (n.ref) return n.ref === 'this' ? ctx.el : n.ref === 'event' ? ctx.ev : window[n.ref];
    const fn = window[n.call]; if (typeof fn !== 'function') return undefined;
    return fn.apply(ctx.el, n.args.map(a => run(a, ctx)));
  }
  document.addEventListener('click', ev => {
    const el = ev.target.closest && ev.target.closest('[data-oc]'); if (!el) return;
    try { run(parse(el.getAttribute('data-oc')), { el, ev }); } catch (e) { console.warn('data-oc', e.message); }
  });
})();
`);
fs.writeFileSync(path.join(OUT, 'shared/a11y.css'), `/* Accessibility layer over the supplied lessons (WCAG AA). It only darkens (day) or lightens (night) the lessons' own colours, and gives the quest cards real buttons. */
/* decks: small muted text and the Illustrated terms link */
.viewer-sub{opacity:1;color:color-mix(in srgb,var(--muted,#566) 58%,#000)}
.term-atlas-open{color:color-mix(in srgb,var(--accent,#555) 58%,#000)}
.term-atlas-open small{color:color-mix(in srgb,var(--muted,#566) 58%,#000)}
html[data-mode=night] .viewer-sub{color:color-mix(in srgb,var(--muted,#aab) 62%,#fff)}
html[data-mode=night] .term-atlas-open{color:color-mix(in srgb,var(--accent,#aab) 60%,#fff)}
html[data-mode=night] .term-atlas-open small{color:color-mix(in srgb,var(--muted,#aab) 62%,#fff)}
/* decks: the current slide in the slide list */
button[data-nav][aria-current=true] span{color:color-mix(in srgb,var(--accent,#555) 58%,#000)}
button[data-nav][aria-current=true] small{color:color-mix(in srgb,var(--muted,#566) 58%,#000)}
html[data-mode=night] button[data-nav][aria-current=true] span{color:color-mix(in srgb,var(--accent,#aab) 60%,#fff)}
html[data-mode=night] button[data-nav][aria-current=true] small{color:color-mix(in srgb,var(--muted,#aab) 62%,#fff)}
/* quests: course path numbers, chip counts, badges you have not earned yet */
.ml-coursepath a span{opacity:1;color:#4f5d6b}
html[data-theme=dark] .ml-coursepath a span{color:#b4c0cd}
.chip .n,.pill .n{opacity:1}
.badge:not(.on){opacity:1;filter:grayscale(1);background:transparent;border-style:dashed}
.badge:not(.on) .bn,.badge:not(.on) .bd{color:var(--mut,#5b6877)}
html[data-theme=light] button.tapHint{color:hsl(var(--h) 62% 30%)}
/* quests: opening a card is a real button now */
.open-hit,button.tapHint{background:none;border:0;margin:0;color:inherit;text-align:inherit;cursor:pointer;font-family:inherit}
.open-hit{padding:0;font:inherit;letter-spacing:inherit}
button.tapHint{display:block;width:100%;padding-left:0;padding-right:0;color:hsl(var(--h) 95% 78%)}
.open-hit:focus-visible,button.tapHint:focus-visible{outline:3px solid currentColor;outline-offset:3px;border-radius:6px}
`);
fs.writeFileSync(path.join(OUT, 'decks.json'), JSON.stringify(decks, null, 1));
console.log(JSON.stringify({ files: stats.files, imagesReferenced: stats.img, imagesUnique: stats.imgUnique.size, scripts: stats.js.size, handlers: stats.handlers, linksRewritten: stats.links, MBin: +(stats.bytesIn / 1e6).toFixed(1), MBout: +(stats.bytesOut / 1e6).toFixed(1) }));
/* the lesson viewer needs the decks to fit one screen */
await import('./medlex-embed-fit.mjs');
