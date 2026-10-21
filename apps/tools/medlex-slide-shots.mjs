// MedLex lesson decks: enumerate slide component types and take screenshots of the slide stage inside the lesson viewer.
// usage: node apps/tools/medlex-slide-shots.mjs <outdir> [port] --types           (list component signatures per deck/slide -> <outdir>/types.json)
//        node apps/tools/medlex-slide-shots.mjs <outdir> [port] --shots deck:slide,deck:slide [--css file] [--tag name] [--reveal]
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const argv = process.argv.slice(2), flags = {}, pos = [];
for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (a.startsWith('--')) { const k = a.slice(2); if (['shots', 'css', 'addcss', 'tag', 'size', 'probe', 'evaljs'].includes(k)) flags[k] = argv[++i]; else flags[k] = true; } else pos.push(a); }
const out = pos[0] || '/tmp/medlex-slide-shots', port = pos[1] || 8443; fs.mkdirSync(out, { recursive: true });
const [W, H] = (flags.size || '1920x940').split('x').map(Number), ORIGIN = 'https://medlex.healthcarecrownacademy.co.uk/';
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--ignore-certificate-errors', `--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`] });
const decks = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../medlex/learn/decks.json'), 'utf8')).map(d => d.file.replace(/\.html$/, ''));
const want = flags.shots ? flags.shots.split(',').map(s => s.split(':')) : null;
const ctx = await br.newContext({ viewport: { width: W, height: H }, ignoreHTTPSErrors: true, reducedMotion: 'reduce' });
const p = await ctx.newPage(); await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
await p.goto(ORIGIN + '#learn'); await p.waitForTimeout(1800);
for (let i = 0; i < 3; i++) { const s = p.locator('dialog[open]:not(.ml):not(.pv) button:has-text("Skip")'); if (!(await s.count())) break; await s.first().click({ force: true }).catch(() => {}); await p.waitForTimeout(300); }
const types = {};
for (const d of decks) {
  if (want && !want.some(w => w[0] === d)) continue;
  const rid = await p.evaluate(file => { const L = window.MEDLEX_LEARN || {}; return Object.entries(L.map || {}).find(([k, v]) => v === file)?.[0] || file; }, d);
  const row = p.locator(`[data-ms-open="${rid}"]`).first(); if (!(await row.count())) { console.log('no row', d); continue; }
  await row.click(); await p.waitForFunction(() => { const fr = document.querySelector('.ml-frame'); return fr && fr.contentWindow && fr.contentWindow.MedLexCourse; }, null, { timeout: 12000 }); await p.waitForTimeout(600);
  const f = p.frames().find(x => /\/medlex\/learn\/[^/]+\.html/.test(x.url()));
  if (flags.addcss) await f.evaluate(css => { const s = new CSSStyleSheet(); s.replaceSync(css); document.adoptedStyleSheets = [...document.adoptedStyleSheets, s]; window.dispatchEvent(new Event('resize')); }, fs.readFileSync(flags.addcss, 'utf8'));
  if (flags.css) await f.evaluate(css => { const l = document.querySelector('link[href*="embed.css"]'); if (l) l.disabled = true; const s = new CSSStyleSheet(); s.replaceSync(css); document.adoptedStyleSheets = [...document.adoptedStyleSheets, s]; window.dispatchEvent(new Event('resize')); }, fs.readFileSync(flags.css, 'utf8'));
  if (flags.night) { await f.evaluate(() => { if (document.documentElement.dataset.mode !== 'night') document.getElementById('modeToggle').click(); }); await p.waitForTimeout(200); }
  const total = await f.evaluate(() => document.querySelectorAll('.slide').length); types[d] = [];
  for (let i = 0; i < total; i++) {
    await f.evaluate(i => window.MedLexCourse.go(i), i); await p.waitForTimeout(200);
    const sig = await f.evaluate(() => { const s = document.querySelector('.slide.active'); const b = s.querySelector('.course-body'); const kids = b ? [...b.children].map(c => c.className.split(' ')[0] || c.tagName.toLowerCase()) : [s.className.split(' ').slice(0,3).join('.')]; const cards = s.querySelector('.detail-card') ? [...new Set([...s.querySelectorAll('.detail-card *')].map(e => e.className && typeof e.className === 'string' ? e.className.split(' ')[0] : '').filter(Boolean))].slice(0, 12) : []; return { kids, cards, title: (s.querySelector('.course-title,h1,h2') || {}).textContent?.slice(0, 60) }; });
    types[d].push(sig);
    if (want && want.some(w => w[0] === d && +w[1] === i + 1)) {
      const el = await p.$('.ml-frame'); const tag = flags.tag || 'x';
      const clip = async () => { const r = await f.evaluate(() => { const b = document.getElementById('stage').getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height }; }), fr = await (await p.$('.ml-frame')).boundingBox(); return { x: Math.max(0, fr.x + r.x), y: Math.max(0, fr.y + r.y), width: r.width, height: r.height }; };
      await p.screenshot({ path: `${out}/${tag}-${d}-${i + 1}.png`, clip: await clip() });
      if (flags.probe) console.log(d, i + 1, JSON.stringify(await f.evaluate(sels => { const st = document.getElementById('stage').getBoundingClientRect(), k = st.width / 1280; return sels.split('|').map(sel => [sel, [...document.querySelectorAll('.slide.active ' + sel)].slice(0, 6).map(e => { const r = e.getBoundingClientRect(); return [(r.x - st.x) / k, (r.y - st.y) / k, r.width / k, r.height / k].map(Math.round).join(',') + (e.scrollHeight > e.clientHeight + 1 ? ' SCROLL' + e.scrollHeight + '/' + e.clientHeight : ''); })]); }, flags.probe)));
      if (flags.evaljs) console.log(d, i + 1, JSON.stringify(await f.evaluate(flags.evaljs)));
      if (flags.reveal) { await f.evaluate(() => { const s = document.querySelector('.slide.active'); s.querySelectorAll('details').forEach(x => x.open = true); s.querySelectorAll('.recall-card,.flashcard,.bank-flip').forEach(x => x.click()); s.querySelectorAll('.build-reveal').forEach(x => x.click()); }); await p.waitForTimeout(250); await p.screenshot({ path: `${out}/${tag}-${d}-${i + 1}-open.png`, clip: await clip() }); }
    }
  }
  await p.keyboard.press('Escape'); await p.waitForTimeout(300); if (await p.locator('dialog.ml').count()) { await p.reload(); await p.waitForTimeout(1500); }
}
if (flags.types) fs.writeFileSync(out + '/types.json', JSON.stringify(types, null, 1));
await br.close();
