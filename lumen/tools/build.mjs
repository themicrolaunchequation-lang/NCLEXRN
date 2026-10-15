#!/usr/bin/env node
// Builds the Lumen single-file app from a Lumen HTML file:
//   1. injects the HCA layers (lumen/src/hca-v3.*, hca-v4.*) before the app's render call and </head>,
//   2. applies a few exact patches inside the bundle (each must match exactly once, or the build stops),
//   3. gzips the embedded OCR engine, which is unpacked in the browser only when OCR is first used.
// Usage: node lumen/tools/build.mjs <input.html> [output.html]
// Safe to re-run on its own output: old layers are removed first and applied patches are skipped.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const [input, output = join(here, '..', 'dist', 'Lumen-clinical-study-studio.html')] = process.argv.slice(2);
if (!input) {
  console.error('Usage: node lumen/tools/build.mjs <input.html> [output.html]');
  process.exit(1);
}

const LAYERS = ['v3', 'v4'];
const RENDER_CALL = '(0,g.createRoot)(document.getElementById(`root`)).render(';
const jsMarkers = v => [`/*HCA${v.slice(1)}:BEGIN*/`, `/*HCA${v.slice(1)}:END*/`];
const cssMarkers = v => [`<style id="hca-${v}">`, `</style><!--/hca-${v}-->`];

// Each patch must find its text exactly once, unless its replacement is already there.
const PATCHES = [
  {
    why: 'Study page note on scheduling matches the adaptive scheduler',
    find: 'Review intervals are a simple 1 / 3 / 7 / 14 / 30 / 60-day ladder—not FSRS, a validated test, or a measure of clinical competence.',
    replace: 'Review timing adapts to your ratings (FSRS-4.5, default parameters) unless you choose the simple 1 / 3 / 7 / 14 / 30 / 60-day ladder under Today → Set goal. A study aid, not a validated test or a measure of clinical competence.',
  },
  {
    why: 'Card dialog: keep NCLEX tags in state',
    find: 'function Go({bookId:e,page:t=1,excerpt:n=``,card:r,question:i,answer:a,onClose:o}){let{state:s,setState:c,toast:l}=y(),',
    replace: 'function Go({bookId:e,page:t=1,excerpt:n=``,card:r,question:i,answer:a,onClose:o}){let{state:s,setState:c,toast:l}=y(),[hcaTags,setHcaTags]=(0,_.useState)(r?.tags||[]),',
  },
  {
    why: 'Card dialog: save NCLEX tags',
    find: 'step:r?.step??-1,reviews:r?.reviews||0}',
    replace: 'step:r?.step??-1,reviews:r?.reviews||0,tags:hcaTags}',
  },
  {
    why: 'Card dialog: show the tag picker',
    find: '(0,C.jsxs)(`div`,{className:`card-making-tip`',
    replace: 'HC(HCA4TagPicker,{value:hcaTags,onChange:setHcaTags}),(0,C.jsxs)(`div`,{className:`card-making-tip`',
  },
  {
    why: 'Note dialog: keep NCLEX tags in state',
    find: 'function Wo({bookId:e,page:t=1,excerpt:n=``,note:r,onClose:i}){let{state:a,setState:o,toast:s}=y(),',
    replace: 'function Wo({bookId:e,page:t=1,excerpt:n=``,note:r,onClose:i}){let{state:a,setState:o,toast:s}=y(),[hcaTags,setHcaTags]=(0,_.useState)(r?.tags||[]),',
  },
  {
    why: 'Note dialog: save NCLEX tags',
    find: 'excerpt:n||r?.excerpt||``,createdAt:r?.createdAt||Date.now()}',
    replace: 'excerpt:n||r?.excerpt||``,createdAt:r?.createdAt||Date.now(),tags:hcaTags}',
  },
  {
    why: 'Note dialog: show the tag picker',
    find: 'placeholder:`Connect an idea, leave a question, make it your own…`})]})]})}',
    replace: 'placeholder:`Connect an idea, leave a question, make it your own…`})]}),HC(HCA4TagPicker,{value:hcaTags,onChange:setHcaTags})]})}',
  },
  {
    why: 'Review dialog: add the Hard rating',
    find: '[`again`,`Again`,`A little more practice`],[`good`,`Good`',
    replace: '[`again`,`Again`,`A little more practice`],[`hard`,`Hard`,`Recalled with effort`],[`good`,`Good`',
  },
  {
    why: 'Review summary: count Hard with Good',
    find: 'c.filter(e=>e===`good`).length',
    replace: 'c.filter(e=>e===`good`||e===`hard`).length',
  },
  {
    why: 'Backup restore: accept the Hard rating in review history',
    find: '[`again`,`good`,`easy`].includes(e.rating)',
    replace: '[`again`,`hard`,`good`,`easy`].includes(e.rating)',
  },
  {
    why: 'OCR loader: unpack the gzipped engine on first use',
    find: "const decode=(id,type)=>{const raw=atob(document.getElementById(id).textContent.trim());const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type}));blobs.push(url);return url};",
    replace: "const decode=async(id,type)=>{const el=document.getElementById(id);let bytes=Uint8Array.from(atob(el.textContent.trim()),c=>c.charCodeAt(0));if(el.dataset.encoding==='gzip'){if(!globalThis.DecompressionStream)throw Error('This browser cannot unpack the OCR engine. Please update it.');bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())}const url=URL.createObjectURL(new Blob([bytes],{type}));blobs.push(url);return url};",
  },
  {
    // Tesseract.js treats a corePath that does not end in "js" as a folder and appends a file name,
    // which breaks blob: URLs, so OCR never started. A fragment keeps the blob URL loadable.
    why: 'OCR loader: wait for the engine and pass it as a file',
    find: "corePath=decode('lumen-ocr-core','text/javascript');",
    replace: "corePath=(await decode('lumen-ocr-core','text/javascript'))+'#tesseract-core.wasm.js';",
  },
  { why: 'OCR loader: wait for the worker', find: 'const worker=decode(', replace: 'const worker=await decode(' },
];

const countOf = (text, needle) => text.split(needle).length - 1;
const stripBetween = (text, begin, end) => {
  const a = text.indexOf(begin);
  if (a < 0) return text;
  const b = text.indexOf(end, a);
  if (b < 0) throw new Error(`Found "${begin}" without its end marker.`);
  return text.slice(0, a) + text.slice(b + end.length);
};

let html = readFileSync(input, 'utf8');

for (const v of LAYERS) {
  html = stripBetween(html, ...jsMarkers(v));
  html = stripBetween(html, ...cssMarkers(v));
}

let js = '', css = '';
for (const v of LAYERS) {
  const layerJs = readFileSync(join(here, '..', 'src', `hca-${v}.js`), 'utf8');
  const layerCss = readFileSync(join(here, '..', 'src', `hca-${v}.css`), 'utf8');
  if (layerJs.includes('</script')) throw new Error(`hca-${v}.js must not contain "</script".`);
  if (layerCss.includes('</style')) throw new Error(`hca-${v}.css must not contain "</style".`);
  const [jb, je] = jsMarkers(v), [cb, ce] = cssMarkers(v);
  js += `${jb}\n${layerJs}\n${je}`;
  css += `${cb}\n${layerCss}\n${ce}`;
}

if (countOf(html, RENDER_CALL) !== 1) throw new Error('Expected exactly one createRoot().render() call in the input.');
html = html.replace(RENDER_CALL, () => `${js}${RENDER_CALL}`);
const headEnd = html.indexOf('</head>');
if (headEnd < 0) throw new Error('No </head> in the input.');
html = `${html.slice(0, headEnd)}${css}${html.slice(headEnd)}`;

let applied = 0;
for (const { why, find, replace } of PATCHES) {
  if (countOf(html, replace) === 1) continue;
  const n = countOf(html, find);
  if (n !== 1) throw new Error(`Patch "${why}" expected its text once but found it ${n} times.`);
  html = html.replace(find, () => replace);
  applied++;
}

const OCR_TAG = '<script id="lumen-ocr-core" type="application/octet-stream">';
let ocrNote = 'OCR engine already compressed.';
const ocrAt = html.indexOf(OCR_TAG);
if (ocrAt >= 0) {
  const start = ocrAt + OCR_TAG.length, end = html.indexOf('</script>', start);
  const raw = Buffer.from(html.slice(start, end).trim(), 'base64');
  const packed = gzipSync(raw, { level: 9 }).toString('base64');
  html = `${html.slice(0, ocrAt)}<script id="lumen-ocr-core" type="application/octet-stream" data-encoding="gzip">${packed}${html.slice(end)}`;
  ocrNote = `OCR engine compressed from ${(raw.length / 1048576).toFixed(1)} MB to ${(packed.length / 1048576).toFixed(1)} MB of text.`;
} else if (!html.includes('<script id="lumen-ocr-core" type="application/octet-stream" data-encoding="gzip">')) {
  throw new Error('Could not find the embedded OCR engine.');
}

writeFileSync(output, html);
console.log(`Wrote ${output} (${(html.length / 1048576).toFixed(1)} MB). Layers: ${LAYERS.join(', ')}. Patches applied: ${applied}. ${ocrNote}`);
