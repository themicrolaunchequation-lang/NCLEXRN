// node apps/tools/shot.mjs <app> <out-dir> [--routes a,b] [--w 1440,390] [--themes light,dark] [--reduced] [--full] [--state '{"k":"v"}'] [--port 8443]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const a = process.argv.slice(2), app = a[0], out = a[1]; const opt = n => { const i = a.indexOf('--' + n); return i < 0 ? null : a[i + 1]; };
const port = opt('port') || 8443, routes = (opt('routes') || '').split(',').filter(x => x !== undefined), widths = (opt('w') || '1440,390').split(',').map(Number), themes = (opt('themes') || 'light,dark').split(',');
const reduced = a.includes('--reduced'), full = a.includes('--full'), state = opt('state') ? JSON.parse(opt('state')) : {}, host = `${app}.healthcarecrownacademy.co.uk`;
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] }).catch(async () => chromium.launch({ args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] }));
const errors = [];
for (const w of widths) for (const theme of themes) {
  const ctx = await b.newContext({ viewport: { width: w, height: w > 600 ? 900 : 844 }, colorScheme: theme, reducedMotion: reduced ? 'reduce' : 'no-preference', serviceWorkers: 'block', deviceScaleFactor: 1, hasTouch: w < 600 });
  await ctx.addInitScript(([s, theme]) => { try { for (const k in s) localStorage.setItem(k, s[k]); } catch {} }, [state, theme]);
  for (const r of routes) {
    const p = await ctx.newPage(); const tag = `${app}${r ? '-' + r.replace(/[^\w]+/g, '_') : '-home'}-${w}-${theme}${reduced ? '-rm' : ''}`;
    p.on('console', m => { if (m.type() === 'error') errors.push(`${tag}: ${m.text()}`); }); p.on('pageerror', e => errors.push(`${tag}: PAGEERROR ${e.message}`));
    await p.goto(`https://${host}/` + (r ? '#' + r : ''), { waitUntil: 'load' }).catch(e => errors.push(tag + ' goto ' + e.message));
    await p.waitForTimeout(1600);
    if (!a.includes('--keep-hooks')) for (let i = 0; i < 4; i++) { const hit = await p.evaluate(() => { const b = [...document.querySelectorAll('dialog[open] button, dialog[open] a')].find(x => /^(skip|skip intro|skip for now)$/i.test(x.textContent.trim().replace(/\s+/g, ' ')) || x.matches('[data-sh="skip"]')); if (b) { b.click(); return true; } return false; }); if (!hit) break; await p.waitForTimeout(900); }
    await p.screenshot({ path: `${out}/${tag}.png`, fullPage: full }); await p.close();
  }
  await ctx.close();
}
await b.close(); console.log(errors.length ? errors.join('\n') : 'no console errors');
