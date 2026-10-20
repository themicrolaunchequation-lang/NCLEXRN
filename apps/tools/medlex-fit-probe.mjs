// Probe: how tall is each lesson inside the MedLex lesson viewer? usage: node medlex-fit-probe.mjs <outdir> [port] [WxH] [deck...]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const out = process.argv[2], port = process.argv[3] || 8443, [W, Hh] = (process.argv[4] || '1558x900').split('x').map(Number); fs.mkdirSync(out, { recursive: true });
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--ignore-certificate-errors', `--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`] });
const ctx = await br.newContext({ viewport: { width: W, height: Hh }, ignoreHTTPSErrors: true });
const p = await ctx.newPage(); await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
await p.goto('https://medlex.healthcarecrownacademy.co.uk/#learn'); await p.waitForTimeout(2500);
for (let i = 0; i < 3; i++) { const s = p.locator('dialog[open]:not(.ml):not(.pv) button:has-text("Skip")'); if (!(await s.count())) break; await s.first().click({ force: true }).catch(() => {}); await p.waitForTimeout(400); }
let decks = process.argv.slice(5); if (!decks.length) decks = await p.evaluate(() => [...document.querySelectorAll('[data-ms-open]')].map(e => e.dataset.msOpen).filter((v, i, a) => a.indexOf(v) === i));
let bad = 0;
for (const d of decks) {
  const row = p.locator(`[data-ms-open="${d}"]`).first(); if (!(await row.count())) { console.log('no row', d); continue; }
  await row.click(); await p.waitForTimeout(1800);
  const r = await p.evaluate(() => { const f = document.querySelector('.ml-frame'); if (!f) return null; const dd = f.contentDocument, de = dd.documentElement, fr = f.getBoundingClientRect(), tb = dd.querySelector('.tool-dock,.annot-toolbar,[class*=toolbar]'); const t = tb && tb.getBoundingClientRect(); return { frameH: Math.round(fr.height), scrollH: de.scrollHeight, clientH: de.clientHeight, bodyScroll: dd.body.scrollHeight, tool: t ? Math.round(t.top) + '-' + Math.round(t.bottom) : 'none', toolCls: tb ? tb.className.slice(0, 30) : '' }; });
  if (!r) { console.log('skip ' + d + ' (no deck)'); await p.keyboard.press('Escape'); await p.waitForTimeout(300); continue; }
  const fit = r.scrollH <= r.clientH + 1; if (!fit) bad++;
  console.log((fit ? 'fit  ' : 'TALL ') + d + ' ' + JSON.stringify(r));
  if (d === decks[0] || process.env.SHOTS) await p.screenshot({ path: `${out}/fit-${d}.png` });
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
}
console.log('tall decks:', bad, 'of', decks.length); await br.close();
