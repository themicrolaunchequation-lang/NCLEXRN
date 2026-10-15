#!/usr/bin/env node
// Injects the HCA v3 layer (lumen/src/hca-v3.js + hca-v3.css) into a Lumen single-file build.
// Usage: node lumen/tools/build.mjs <input.html> [output.html]
// Safe to re-run on its own output: any previous v3 layer is removed before injecting.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const [input, output = join(here, '..', 'dist', 'Lumen-clinical-study-studio-v3.html')] = process.argv.slice(2);
if (!input) {
  console.error('Usage: node lumen/tools/build.mjs <input.html> [output.html]');
  process.exit(1);
}

const JS_BEGIN = '/*HCA3:BEGIN*/', JS_END = '/*HCA3:END*/';
const CSS_BEGIN = '<style id="hca-v3">', CSS_END = '</style><!--/hca-v3-->';
const RENDER_CALL = '(0,g.createRoot)(document.getElementById(`root`)).render(';
const LADDER_COPY = 'Review intervals are a simple 1 / 3 / 7 / 14 / 30 / 60-day ladder—not FSRS, a validated test, or a measure of clinical competence.';
const SCHEDULER_COPY = 'Review timing adapts to your ratings (FSRS-4.5, default parameters) unless you choose the simple 1 / 3 / 7 / 14 / 30 / 60-day ladder under Today → Set goal. A study aid, not a validated test or a measure of clinical competence.';

const stripBetween = (text, begin, end) => {
  const a = text.indexOf(begin);
  if (a < 0) return text;
  const b = text.indexOf(end, a);
  if (b < 0) throw new Error(`Found "${begin}" without its end marker.`);
  return text.slice(0, a) + text.slice(b + end.length);
};
const countOf = (text, needle) => text.split(needle).length - 1;

let html = readFileSync(input, 'utf8');
html = stripBetween(html, JS_BEGIN, JS_END);
html = stripBetween(html, CSS_BEGIN, CSS_END);

const js = readFileSync(join(here, '..', 'src', 'hca-v3.js'), 'utf8');
const css = readFileSync(join(here, '..', 'src', 'hca-v3.css'), 'utf8');
if (js.includes('</script')) throw new Error('hca-v3.js must not contain "</script".');
if (css.includes('</style')) throw new Error('hca-v3.css must not contain "</style".');

if (countOf(html, RENDER_CALL) !== 1) throw new Error('Expected exactly one createRoot().render() call in the input.');
html = html.replace(RENDER_CALL, () => `${JS_BEGIN}\n${js}\n${JS_END}${RENDER_CALL}`);

const headEnd = html.indexOf('</head>');
if (headEnd < 0) throw new Error('No </head> in the input.');
html = `${html.slice(0, headEnd)}${CSS_BEGIN}\n${css}\n${CSS_END}${html.slice(headEnd)}`;

const ladderCount = countOf(html, LADDER_COPY);
html = html.split(LADDER_COPY).join(SCHEDULER_COPY);

writeFileSync(output, html);
console.log(`Wrote ${output} (${(html.length / 1048576).toFixed(1)} MB). Scheduler copy updated in ${ladderCount} place(s).`);
