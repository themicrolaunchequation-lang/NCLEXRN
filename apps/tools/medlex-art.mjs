#!/usr/bin/env node
// MedLex Learn artwork tool (reproducible, idempotent).
//   node apps/tools/medlex-art.mjs catalogue          audit every image the decks use -> apps/medlex/learn/art-catalogue.json
//   node apps/tools/medlex-art.mjs render [--sheet f] render the designed scenes with headless Chromium -> WebP (512x512, 2x) in shared/img (content-hash names) + art-map.json
//   node apps/tools/medlex-art.mjs apply              rewire the decks to the new images (old files stay as fallback), write shared/art.css + shared/js/art.js
//   node apps/tools/medlex-art.mjs all                catalogue (before) + render + apply + catalogue (after)
// Scenes live in medlex-art-scenes.mjs. Never edit site/ by hand: rebuild with `cd apps/medlex && node build-web.mjs`.
// Needs: Playwright + Chromium (see docs/HANDOFF) and ImageMagick `convert` (PNG -> WebP).
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { spawnSync } from 'node:child_process'; import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
import { PAL, M, SCENES, DECKS, mk } from './medlex-art-scenes.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LEARN = path.resolve(HERE, '../medlex/learn'), IMG = path.join(LEARN, 'shared/img'), MAP = path.join(LEARN, 'art-map.json'), CAT = path.join(LEARN, 'art-catalogue.json');
const SIZE = 512, MAX_BYTES = 120 * 1024;
const cmd = process.argv[2] || 'all';
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const decks = () => fs.readdirSync(LEARN).filter(f => f.endsWith('.html')).sort();
const sha = (b) => crypto.createHash('sha1').update(b).digest('hex').slice(0, 16);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// ---------- image sizes without extra dependencies ----------
function dims(file) {
  const b = fs.readFileSync(file);
  if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') {
    const t = b.slice(12, 16).toString();
    if (t === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (t === 'VP8L') { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; }
    if (t === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  }
  if (b[0] === 0x89 && b.slice(1, 4).toString() === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)];
  return [0, 0];
}

// ---------- parsing the decks ----------
function parseDeck(f) {
  const html = fs.readFileSync(path.join(LEARN, f), 'utf8'), name = f.replace(/\.html$/, '');
  const slides = [...html.matchAll(/<section class="slide[^"]*"[^>]*?(?:data-title="([^"]*)")?[^>]*>/g)].map(m => ({ at: m.index, title: (m[1] || '').replace(/&amp;/g, '&') }));
  const slideAt = (pos) => { let i = -1; for (let s = 0; s < slides.length; s++) if (slides[s].at <= pos) i = s; return i; };
  const imgs = [];
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const src = (m[0].match(/\bsrc="(shared\/img\/[^"]+)"/) || [])[1]; if (!src) continue;
    const pre = html.slice(Math.max(0, m.index - 300), m.index); const parents = [...pre.matchAll(/<(\w+) class="([^"]*)"/g)]; const par = parents.length ? parents[parents.length - 1][2] : '';
    const sl = slideAt(m.index);
    imgs.push({ src, alt: (m[0].match(/\balt="([^"]*)"/) || [])[1] ?? '', parent: par, slide: sl + 1, slideTitle: sl >= 0 ? slides[sl].title : '', label: (pre.match(/data-label="([^"]*)"[^>]*>$/) || [])[1] || '', animated: (m[0].match(/data-animated="([^"]+)"/) || [])[1] || '', lazy: /loading="lazy"/.test(m[0]) });
  }
  const assets = {}; for (const m of html.matchAll(/"([a-z0-9-]+)":\{"src":"(shared\/img\/[0-9a-f]+\.\w+)","kind":"(\w+)"/g)) assets[m[1]] = { src: m[2], kind: m[3] };
  const terms = []; for (const m of html.matchAll(/"form":"([^"]*)"[^{}]*?"images":\[((?:\{[^{}]*\},?)*)\]/g)) for (const a of m[2].matchAll(/"asset":"([^"]+)"/g)) terms.push({ term: m[1], asset: a[1] });
  return { name, html, imgs, assets, terms, slides: slides.length };
}

// ---------- 1. catalogue ----------
function catalogue(outFile = CAT) {
  const files = {}; const deckStats = {}; const map = fs.existsSync(MAP) ? JSON.parse(fs.readFileSync(MAP, 'utf8')) : null;
  const newFiles = new Set(map ? [...Object.values(map.assets).map(a => a.new), ...Object.values(map.decks).map(d => d.new)] : []);
  for (const f of decks()) {
    const d = parseDeck(f); const usedHere = new Set();
    const rec = (file, use) => { usedHere.add(file); (files[file] ||= { file, uses: [], termUses: [], assetIds: new Set(), kinds: new Set() }).uses.push(use); };
    for (const i of d.imgs) rec(i.src, { deck: d.name, slide: i.slide, slideTitle: i.slideTitle, where: i.parent || 'img', label: i.label, alt: i.alt });
    const byFile = {}; for (const [id, a] of Object.entries(d.assets)) { usedHere.add(a.src); const r = (files[a.src] ||= { file: a.src, uses: [], termUses: [], assetIds: new Set(), kinds: new Set() }); r.assetIds.add(id); r.kinds.add(a.kind); byFile[id] = a.src; }
    for (const t of d.terms) { const s = byFile[t.asset]; if (s) files[s].termUses.push({ deck: d.name, term: t.term }); }
    for (const [id, a] of Object.entries(d.assets)) if (a.kind === 'symbol') { /* kept for counts */ }
    let bytes = 0, n = 0; for (const u of usedHere) { const p = path.join(LEARN, u); if (fs.existsSync(p)) { bytes += fs.statSync(p).size; n++; } }
    deckStats[d.name] = { slides: d.slides, imgTags: d.imgs.length, distinctFiles: n, referencedBytes: bytes };
  }
  const out = []; const tally = {};
  for (const r of Object.values(files)) {
    const p = path.join(LEARN, r.file); const exists = fs.existsSync(p); const [w, h] = exists ? dims(p) : [0, 0];
    const kinds = [...r.kinds]; let kind = kinds[0] || null;
    if (!kind) kind = /1123cbb427867be2|8c626646a186ac71/.test(r.file) ? 'logo' : r.uses.some(u => /hero-figure|image-split|model-panel/.test(u.where)) ? 'cover' : 'unknown';
    if (kind === 'anatomy') kind = 'anatomy (generated)'; if (kind === 'symbol') kind = 'icon'; if (kind === 'cover' && w > 1000) kind = 'cover'; if (kind === 'unknown' && w >= 800) kind = 'photo';
    const perDeck = {}; for (const u of r.uses) perDeck[u.deck] = (perDeck[u.deck] || 0) + 1; const maxRepeat = Math.max(0, ...Object.values(perDeck));
    const isNew = newFiles.has(r.file); const generic = kind === 'icon' && !isNew;
    const reasons = []; let rating = 'good';
    if (kind === 'logo') rating = 'brand';
    else if (generic) { rating = 'generic-icon'; reasons.push('flat Health Icons symbol: shows only the object named, no explanatory detail'); if (r.assetIds.has('symbol-book')) { rating = 'generic-icon (worst)'; reasons.push('the same book glyph is repeated as the slide tile (' + r.uses.length + ' slides)'); } else if (maxRepeat >= 5) reasons.push('repeated ' + maxRepeat + ' times in one deck'); }
    else if (isNew) { rating = 'improved (rendered art)'; }
    else if (kind === 'diagram') { rating = 'schematic (informative, kept)'; }
    tally[rating] = (tally[rating] || 0) + 1;
    out.push({ file: r.file, bytes: exists ? fs.statSync(p).size : 0, width: w, height: h, kind, rating, reasons, assetIds: [...r.assetIds], slideUses: r.uses.length, termUses: r.termUses.length, decks: Object.keys(perDeck).length, uses: r.uses.slice(0, 40), terms: r.termUses.slice(0, 12) });
  }
  out.sort((a, b) => (b.slideUses + b.termUses) - (a.slideUses + a.termUses));
  const summary = { generatedBy: 'apps/tools/medlex-art.mjs catalogue', images: out.length, byRating: tally, byKind: out.reduce((m, o) => (m[o.kind] = (m[o.kind] || 0) + 1, m), {}), totalBytes: out.reduce((s, o) => s + o.bytes, 0), decks: deckStats };
  fs.writeFileSync(outFile, JSON.stringify({ summary, images: out }, null, 1));
  console.log('catalogue:', JSON.stringify({ images: summary.images, byRating: tally, byKind: summary.byKind, MB: (summary.totalBytes / 1048576).toFixed(2) }));
  return summary;
}

// ---------- 2. render ----------
function pageFor(scene, label) {
  const k = mk(); const pal = PAL[scene.pal]; const art = scene.art(k);
  return `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent}#c{width:${SIZE}px;height:${SIZE}px;border-radius:84px;overflow:hidden;position:relative;background:radial-gradient(circle at 34% 28%,${pal.bg[0]} 0%,${pal.bg[0]} 30%,${pal.bg[1]} 100%)}
#c:before{content:"";position:absolute;inset:34px;border-radius:50%;border:2px solid ${pal.ring};opacity:.16}#c:after{content:"";position:absolute;left:-60px;bottom:-90px;width:380px;height:380px;border-radius:50%;background:${pal.ring};opacity:.10;filter:blur(24px)}
svg{position:absolute;left:46px;top:42px;width:420px;height:420px;z-index:1;overflow:visible}</style>
<div id="c"><svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><defs>${k.defs.join('')}
<filter id="gl" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="b"/><feDiffuseLighting in="b" surfaceScale="3.2" diffuseConstant="1.18" lighting-color="#fff" result="df"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting><feSpecularLighting in="b" surfaceScale="5" specularConstant=".75" specularExponent="26" lighting-color="#fff" result="sp"><feDistantLight azimuth="235" elevation="52"/></feSpecularLighting><feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2"/><feComposite in="SourceGraphic" in2="df" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="lit"/><feComposite in="lit" in2="sp2" operator="arithmetic" k1="0" k2="1" k3=".55" k4="0"/></filter>
<filter id="bl" x="-50%" y="-300%" width="200%" height="700%"><feGaussianBlur stdDeviation="3.5"/></filter><filter id="bl2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>
<filter id="sd" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="2.5" stdDeviation="3" flood-color="#1b2a3a" flood-opacity=".28"/></filter></defs>${art}</svg></div>`;
}
async function launch() {
  const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
  return chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--force-color-profile=srgb'] });
}
function toWebp(pngBuf) {
  for (const q of [84, 78, 72, 64]) {
    const r = spawnSync('convert', ['png:-', '-quality', String(q), '-define', 'webp:method=5', 'webp:-'], { input: pngBuf, maxBuffer: 64 << 20 });
    if (r.status !== 0) throw new Error('convert failed: ' + r.stderr); if (r.stdout.length <= MAX_BYTES) return r.stdout;
  }
  throw new Error('image over budget');
}
async function render() {
  const only = arg('--only'); const br = await launch(); const ctx = await br.newContext({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  const prev = fs.existsSync(MAP) ? JSON.parse(fs.readFileSync(MAP, 'utf8')) : { assets: {}, decks: {} };
  const oldFileOf = {}; for (const f of decks()) { const d = parseDeck(f); for (const [id, a] of Object.entries(d.assets)) if (SCENES[id]) oldFileOf[id] ||= a.src; }
  const map = { generatedBy: 'apps/tools/medlex-art.mjs render', size: SIZE, assets: {}, decks: {} }; const sheet = []; let total = 0, n = 0, biggest = 0;
  const shot = async (scene) => { await p.setContent(pageFor(scene), { waitUntil: 'load' }); const png = await p.locator('#c').screenshot({ omitBackground: true }); const webp = toWebp(png); const name = 'art-' + sha(webp) + '.webp'; fs.writeFileSync(path.join(IMG, name), webp); total += webp.length; n++; biggest = Math.max(biggest, webp.length); sheet.push(path.join(IMG, name)); return 'shared/img/' + name; };
  for (const [id, sc] of Object.entries(SCENES)) {
    if (only && !id.includes(only)) { if (prev.assets[id]) map.assets[id] = prev.assets[id]; continue; }
    const old = prev.assets[id]?.old || oldFileOf[id] || null;
    map.assets[id] = { old, new: await shot(sc), alt: sc.alt, label: sc.label, pal: sc.pal };
  }
  for (const [deck, [pal, motif, label, alt]] of Object.entries(DECKS)) {
    if (only && !deck.includes(only)) { if (prev.decks[deck]) map.decks[deck] = prev.decks[deck]; continue; }
    map.decks[deck] = { new: await shot({ pal, art: (k) => M[motif](k) }), alt, label, pal };
  }
  await br.close(); fs.writeFileSync(MAP, JSON.stringify(map, null, 1));
  console.log(`rendered ${n} images, ${(total / 1024).toFixed(0)} KB total, largest ${(biggest / 1024).toFixed(0)} KB`);
  const s = arg('--sheet'); if (s) { const r = spawnSync('montage', [...sheet.map(f => f + '[0]'), '-tile', '12x', '-geometry', '120x120+3+3', '-background', '#fff', s]); if (r.status) console.log('montage failed'); else console.log('sheet', s); }
}

// ---------- 3. apply ----------
const ART_CSS = `/* MedLex artwork (written by apps/tools/medlex-art.mjs). Rendered illustrations replace the flat icon tiles: no night-mode inversion, soft depth. */
img[data-art]{filter:none!important;object-fit:contain}
.slide-art img[data-art]{filter:drop-shadow(0 3px 6px #0000001f)!important}
html[data-mode=night] .slide-art.kind-icon img[data-art]{filter:drop-shadow(0 3px 6px #00000066)!important}
.slide-art:has(img[data-art]) small{font-weight:600;letter-spacing:.2px}
`;
function artJs(map) {
  const fb = {}; for (const a of Object.values(map.assets)) if (a.old) fb[a.new.split('/').pop()] = a.old.split('/').pop(); for (const d of Object.values(map.decks)) { const old = map.assets['symbol-book']?.old; if (old) fb[d.new.split('/').pop()] = old.split('/').pop(); }
  return `/* Falls back to the original picture if a new illustration fails to load (written by apps/tools/medlex-art.mjs). */
(function(){var F=${JSON.stringify(fb)};
document.addEventListener('error',function(e){var t=e.target;if(!t||t.tagName!=='IMG'||t.getAttribute('data-art-fb'))return;
var s=t.getAttribute('src')||'',i=s.lastIndexOf('/'),k=s.slice(i+1),o=F[k];if(!o)return;
t.setAttribute('data-art-fb','1');t.removeAttribute('data-art');t.src=s.slice(0,i+1)+o;if(t.dataset&&t.dataset.poster)t.dataset.poster=t.dataset.poster.slice(0,t.dataset.poster.lastIndexOf('/')+1)+o;},true);})();
`;
}
const ALIAS = { diagnostics: 'microscope', 'female reproductive system': 'gynecology', 'baby 0203m': 'baby-0306m', 'blood test': 'medical-sample', 'medicine bottle': 'medicines' };
function apply() {
  if (!fs.existsSync(MAP)) throw new Error('run render first'); const map = JSON.parse(fs.readFileSync(MAP, 'utf8'));
  fs.writeFileSync(path.join(LEARN, 'shared/art.css'), ART_CSS); fs.writeFileSync(path.join(LEARN, 'shared/js/art.js'), artJs(map));
  const byOld = {}, byNew = {}; for (const [id, a] of Object.entries(map.assets)) { if (a.old) byOld[a.old.split('/').pop()] = { id, ...a }; byNew[a.new.split('/').pop()] = { id, ...a }; }
  const deckNew = new Set(Object.values(map.decks).map(d => d.new.split('/').pop()));
  let blocks = 0, swaps = 0, filesChanged = 0; const unreplacedAssets = new Set();
  for (const f of decks()) {
    const name = f.replace(/\.html$/, ''); let h = fs.readFileSync(path.join(LEARN, f), 'utf8'); const orig = h; const deck = map.decks[name];
    // a) the slide tile (button.slide-art): new picture, relevant alt text, caption and aria-label
    h = h.replace(/<button class="(slide-art kind-\w+)" data-label="([^"]*)" aria-label="[^"]*"><img ([^>]*)><small>[^<]*<\/small><\/button>/g, (all, cls, label, attrs) => {
      const id = 'symbol-' + (ALIAS[label] || label).replace(/ /g, '-'); let tgt = null;
      if (label === 'book' || label === 'health literacy' || !map.assets[id]) { if (deck) tgt = { new: deck.new, alt: deck.alt, label: deck.label }; }
      else tgt = map.assets[id];
      if (!tgt) return all; blocks++;
      const poster = tgt.new; const lbl = esc(tgt.label[0].toUpperCase() + tgt.label.slice(1));
      return `<button class="${cls}" data-label="${esc(tgt.label)}" aria-label="Enlarge illustration: ${esc(tgt.alt)}"><img src="${poster}" data-poster="${poster}" data-art="1" loading="lazy" decoding="async" alt="${esc(tgt.alt)}"><small>${lbl}</small></button>`;
    });
    // b) every other use (word registry, model panels...): swap the file, keep the old one as fallback in art.js
    for (const [oldName, m] of Object.entries(byOld)) { const o = 'shared/img/' + oldName; if (h.includes(o)) { h = h.split(o).join(m.new); swaps++; } }
    // c) head links (idempotent)
    if (!h.includes('shared/art.css')) h = h.replace(/(<link rel="stylesheet" href="shared\/embed\.css">)/, '$1\n<link rel="stylesheet" href="shared/art.css">');
    if (!h.includes('shared/art.css')) h = h.replace('</head>', '<link rel="stylesheet" href="shared/art.css">\n</head>');
    if (!h.includes('shared/js/art.js')) h = h.replace('</head>', '<script src="shared/js/art.js" defer></script>\n</head>');
    if (h !== orig) { fs.writeFileSync(path.join(LEARN, f), h); filesChanged++; }
    for (const m of h.matchAll(/"(symbol-[a-z0-9-]+)":\{"src":"(shared\/img\/[0-9a-f]+\.\w+)"/g)) if (!m[2].includes('art-')) unreplacedAssets.add(m[1]);
  }
  console.log(`apply: ${filesChanged} decks changed, ${blocks} slide tiles rewritten, ${swaps} file swaps; symbol assets still on the old icon: ${unreplacedAssets.size}${unreplacedAssets.size ? ' (' + [...unreplacedAssets].join(', ') + ')' : ''}`);
}

if (cmd === 'catalogue') catalogue();
else if (cmd === 'render') await render();
else if (cmd === 'apply') apply();
else if (cmd === 'all') { catalogue(arg('--before') || path.join(LEARN, 'art-catalogue-before.json')); await render(); apply(); catalogue(); }
else { console.log('usage: medlex-art.mjs catalogue|render|apply|all'); process.exit(2); }
