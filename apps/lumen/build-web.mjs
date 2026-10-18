// Web edition of Lumen for healthcarecrownacademy.co.uk/lumen.
// Executable inline scripts move to hashed files (served under /lumen's own CSP, script-src 'self');
// data blocks (OCR engine, licences, PPTX tools) stay inline because browsers never execute them.
// Styles and embedded fonts/images stay inline (allowed by the /lumen policy in site/vercel.json).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const BASE = '/lumen/', SITE = 'https://lumen.healthcarecrownacademy.co.uk';
const OUT = path.resolve(process.argv[2] || '../../site/lumen');
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'js'), { recursive: true });

let html = fs.readFileSync('source/Lumen.html', 'utf8');
let n = 0;
html = html.replace(/<script(\s+type="module")?>([\s\S]*?)<\/script>/g, (_, mod, code) => {
  const name = `js/${String(n++).padStart(2, '0')}.${hash(code)}.js`;
  fs.writeFileSync(path.join(OUT, name), code);
  return `<script${mod ? ' type="module"' : ''} src="${BASE}${name}"></script>`;
});
if (/<script>/.test(html)) throw Error('An executable inline script is left.');

const head = `<link rel="canonical" href="${SITE}/">
<meta property="og:type" content="website"><meta property="og:site_name" content="Healthcare Crown Academy">
<meta property="og:title" content="Lumen — your private clinical study studio">
<meta property="og:description" content="Read PDFs and images, collect insights and practise recall in one calm workspace. Part of the Healthcare Crown Academy Crown Suite.">
<meta property="og:url" content="${SITE}/"><meta name="twitter:card" content="summary">
<meta name="hca-account-position" content="right">
<script src="/assets/js/crown-move.js"></script>
<script defer src="/assets/js/crown-account.js"></script>
`;
const body = html.search(/<body[\s>]/);
if (body < 0) throw Error('No <body> found.');
html = html.slice(0, body) + head + html.slice(body);
fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log(JSON.stringify({ out: OUT, scripts: n, htmlBytes: Buffer.byteLength(html) }));
