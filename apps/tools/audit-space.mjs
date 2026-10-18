// node apps/tools/audit-space.mjs <app> <routes comma> [--w 1440] [--min 64]
// Reports vertical bands (>min px) with no content inside <main>, and carded boxes whose content fills <50% of their height.
import { createRequire } from 'node:module'; const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const a = process.argv.slice(2), app = a[0], routes = a[1].split(','); const opt = (n, d) => { const i = a.indexOf('--' + n); return i < 0 ? d : a[i + 1]; };
const w = +opt('w', 1440), min = +opt('min', 64), sel = opt('main', 'main');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:8443', '--ignore-certificate-errors', '--no-proxy-server'] });
const ctx = await b.newContext({ viewport: { width: w, height: w > 600 ? 900 : 844 }, serviceWorkers: 'block' }); const p = await ctx.newPage();
await p.goto(`https://${app}.healthcarecrownacademy.co.uk/`); await p.waitForTimeout(1500);
for (let i = 0; i < 3; i++) { const hit = await p.evaluate(() => { const x = document.querySelector('dialog[open] [data-sh="skip"],dialog[open] .mh-skip,dialog[open] .cc-hook-skip'); if (x) { x.click(); return 1 } }); if (!hit) break; await p.waitForTimeout(700); }
for (const r of routes) {
  await p.evaluate(r => { location.hash = r; }, r); await p.waitForTimeout(1300);
  const res = await p.evaluate(([sel, min]) => {
    const m = document.querySelector(sel) || document.body; const mr = m.getBoundingClientRect(), top = mr.top + scrollY, bot = mr.bottom + scrollY;
    const iv = [], cards = [];
    const vis = e => { const c = getComputedStyle(e); return c.display !== 'none' && c.visibility !== 'hidden' && +c.opacity > 0 && !e.closest('[hidden],.visually-hidden,.sr-only'); };
    for (const e of m.querySelectorAll('*')) {
      if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue; const y0 = r.top + scrollY, y1 = r.bottom + scrollY;
      const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || /^(IMG|SVG|CANVAS|INPUT|SELECT|TEXTAREA|BUTTON|VIDEO|HR)$/i.test(e.tagName);
      const cs = getComputedStyle(e), boxed = (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') || (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') || (cs.backgroundImage !== 'none');
      if (own) iv.push([y0, y1]);
      if (boxed && r.height < 700) { iv.push([y0, y0 + 2]); iv.push([y1 - 2, y1]); }
      if (boxed && e.children.length && r.height > 180 && r.width > 200) {
        let lo = 1e9, hi = 0; for (const c of e.querySelectorAll('*')) { if (!vis(c)) continue; const cr = c.getBoundingClientRect(); if (cr.height < 1) continue; const own2 = [...c.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || /^(IMG|SVG|BUTTON|INPUT)$/i.test(c.tagName); if (!own2) continue; lo = Math.min(lo, cr.top + scrollY); hi = Math.max(hi, cr.bottom + scrollY); }
        const used = hi > lo ? hi - lo : 0; if (used / r.height < .5 && r.height - used > 120) cards.push(`${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]} ${Math.round(r.width)}x${Math.round(r.height)} content ${Math.round(used)}px`);
      }
    }
    iv.sort((a, b) => a[0] - b[0]); const gaps = []; let cur = top;
    for (const [s, e] of iv) { if (s - cur > min) gaps.push(`${Math.round(cur)}→${Math.round(s)} (${Math.round(s - cur)}px)`); cur = Math.max(cur, e); }
    if (bot - cur > min) gaps.push(`${Math.round(cur)}→${Math.round(bot)} (${Math.round(bot - cur)}px) [bottom]`);
    const maxText = Math.max(0, ...[...m.querySelectorAll('p,li')].filter(vis).map(e => { const t = e.textContent.trim(); const r = e.getBoundingClientRect(); const fs = parseFloat(getComputedStyle(e).fontSize); return t.length > 120 ? r.width / (fs * .5) : 0; }));
    return { height: Math.round(bot - top), gaps, cards: cards.slice(0, 6), maxCh: Math.round(maxText), hscroll: document.documentElement.scrollWidth > innerWidth + 1 };
  }, [sel, min]);
  console.log(`## ${app} #${r} @${w}: height ${res.height}${res.hscroll ? ' H-SCROLL!' : ''}${res.maxCh > 85 ? ' lineLength~' + res.maxCh + 'ch' : ''}\n  gaps: ${res.gaps.join(' | ') || 'none'}\n  stretched: ${res.cards.join(' | ') || 'none'}`);
}
await b.close();
