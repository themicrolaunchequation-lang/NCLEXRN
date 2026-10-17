// Renders install icons and the social-share image for an app from its crest.
// Dev-only: needs Playwright (preinstalled in the Claude Code cloud image) or
// PLAYWRIGHT_MODULE pointing at one.
// Usage: node render-art.cjs <config.json>
// config: { crest, outDir, name, eyebrow, line1, line2, body, photo, ink, paper, accent, gold, fontsCss }
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright');
const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), dir = path.dirname(path.resolve(process.argv[2]));
const abs = p => path.resolve(dir, p);
const dataUri = (p, type) => `data:${type};base64,${fs.readFileSync(abs(p)).toString('base64')}`;
const crest = dataUri(cfg.crest, 'image/svg+xml');
const photo = cfg.photo ? dataUri(cfg.photo, 'image/' + path.extname(cfg.photo).slice(1)) : '';
// Local url("file.woff2") references are inlined so the blank render page can load them.
const fonts = cfg.fontsCss ? fs.readFileSync(abs(cfg.fontsCss), 'utf8').replace(/url\("(?!data:)([^"]+\.woff2)"\)/g, (_, f) => `url("${dataUri(path.relative(dir, path.resolve(path.dirname(abs(cfg.fontsCss)), f)), 'font/woff2')}")`) : '';

const icon = (size, pad, round) => `<html><body style="margin:0"><div style="width:${size}px;height:${size}px;display:grid;place-items:center;background:${cfg.paper};border-radius:${round}"><img src="${crest}" style="width:${size - pad * 2}px;height:${size - pad * 2}px"></div></body></html>`;
const og = `<html><head><style>${fonts}
body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:Inter,system-ui,sans-serif}
.card{position:relative;width:1200px;height:630px;display:grid;grid-template-columns:620px 580px;background:${cfg.ink};color:#F8F5EF}
.copy{padding:64px 56px 56px 72px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:16px;font:600 15px Inter;letter-spacing:.16em;color:${cfg.gold}}
.brand img{width:64px;height:64px;background:${cfg.paper};border-radius:50%}
h1{font:500 76px/1.02 'Playfair Display',Georgia,serif;letter-spacing:-.02em;margin:auto 0 18px}
h1 em{display:block;color:${cfg.accentLight};font-style:italic}
p{font-size:25px;line-height:1.45;color:#D5E1E0;margin:0 0 28px;max-width:30ch}
.pill{align-self:flex-start;font:600 17px Inter;padding:10px 18px;border-radius:999px;background:${cfg.gold};color:${cfg.ink}}
.photo{position:relative;background:url(${photo}) center/cover}
.photo:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,${cfg.ink} 0,transparent 30%)}
</style></head><body><div class="card"><div class="copy"><div class="brand"><img src="${crest}">${cfg.eyebrow}</div><h1>${cfg.line1}<em>${cfg.line2}</em></h1><p>${cfg.body}</p><span class="pill">${cfg.pill}</span></div><div class="photo"></div></div></body></html>`;

(async () => {
  const out = abs(cfg.outDir); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(), p = await b.newPage();
  for (const [file, size, pad, round] of [['icon-192.png', 192, 14, '0'], ['icon-512.png', 512, 36, '0'], ['maskable-512.png', 512, 96, '0'], ['apple-touch-icon.png', 180, 16, '0']]) {
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(icon(size, pad, round));
    await p.screenshot({ path: path.join(out, file) });
  }
  await p.setViewportSize({ width: 1200, height: 630 });
  await p.setContent(og, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(out, 'og-image.png') });
  await b.close();
  console.log('wrote', fs.readdirSync(out).join(', '));
})();
