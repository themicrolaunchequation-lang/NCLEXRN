// Ad-hoc Carecraft Practice screenshots. usage: node apps/tools/carecraft-shot.mjs OUT_DIR "<name>=<js to eval>" ... [--w 1440 --h 900 --dark --port 8446]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const a = process.argv.slice(2), out = a[0]; const flag = (n, d) => { const i = a.indexOf('--' + n); return i < 0 ? d : a[i + 1]; };
const w = +flag('w', 1440), h = +flag('h', 900), port = flag('port', 8446), dark = a.includes('--dark'), full = a.includes('--full'), route = flag('route', '#/practice');
const steps = a.slice(1).filter((x, i, arr) => x.includes('=') && !x.startsWith('--') && !['--w', '--h', '--port', '--route'].includes(arr[i - 1]));
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] });
const touch = w < 700;
const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', colorScheme: dark ? 'dark' : 'light', hasTouch: touch, isMobile: touch });
const p = await ctx.newPage(); const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
await p.goto(`https://carecraft.healthcarecrownacademy.co.uk/${route}`, { waitUntil: 'load' }); await p.waitForTimeout(1500);
for (let i = 0; i < 4; i++) { const hit = await p.evaluate(() => { const b = [...document.querySelectorAll('dialog[open] button, [role=dialog] button')].find(x => /^(ski|close|maybe|not now|later|got it|explore|start)/i.test(x.textContent.trim())); if (b) { b.click(); return true; } return false; }); if (!hit) break; await p.waitForTimeout(300); }
for (const s of steps) {
  const i = s.indexOf('='), name = s.slice(0, i), js = s.slice(i + 1);
  if (js) { try { const r = await p.evaluate(js); if (r !== undefined && r !== null) console.log(name, '->', JSON.stringify(r).slice(0, 600)); } catch (e) { console.log('EVALERR', name, e.message.slice(0, 200)); } }
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: full });
}
console.log('errors', JSON.stringify(errs));
await browser.close();
