// Ad-hoc audit: open every Practice activity, screenshot, and measure layout problems.
// usage: node apps/tools/carecraft-audit-activities.mjs OUT_DIR [--w 390 --h 844] [--dark] [--ids a,b]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const a = process.argv.slice(2), out = a[0]; const flag = (n, d) => { const i = a.indexOf('--' + n); return i < 0 ? d : a[i + 1]; };
const w = +flag('w', 1440), h = +flag('h', 900), port = flag('port', 8446), dark = a.includes('--dark'), only = flag('ids', '');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] });
const touch = w < 700;
const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', colorScheme: dark ? 'dark' : 'light', hasTouch: touch, isMobile: touch });
const p = await ctx.newPage(); const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
await p.goto('https://carecraft.healthcarecrownacademy.co.uk/#/practice', { waitUntil: 'load' }); await p.waitForTimeout(1500);
for (let i = 0; i < 4; i++) { const hit = await p.evaluate(() => { const b = [...document.querySelectorAll('dialog[open] button, [role=dialog] button')].find(x => /^(ski|close|maybe|not now|later|got it|explore|start)/i.test(x.textContent.trim())); if (b) { b.click(); return true; } return false; }); if (!hit) break; await p.waitForTimeout(300); }
const ids = only ? only.split(',') : await p.evaluate(() => HCA_ACTIVITIES.map(a => a.id));
const measure = () => p.evaluate(() => {
  const vw = innerWidth, vh = innerHeight, m = document.getElementById('modal'), open = m.open;
  const root = open ? m : document.getElementById('main');
  const r = m.getBoundingClientRect();
  const over = [...root.querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.right > vw + 1 && !e.closest('.cc-sim-stage,.studio-visual,svg,canvas'); }).slice(0, 4).map(e => e.tagName + '.' + String(e.className).slice(0, 30));
  const close = m.querySelector('[data-action="close"]'), cb = close && close.getBoundingClientRect();
  const small = [...root.querySelectorAll('button,a,select,input:not([type=range]),summary,[role=button]')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.height && (b.height < 43.5 || b.width < 43.5) && getComputedStyle(e).visibility !== 'hidden'; }).slice(0, 6).map(e => (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 22) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
  return { open, modal: open ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null, closeVisible: close ? (cb.top >= 0 && cb.bottom <= vh && cb.width > 0) : null, docScrollW: document.documentElement.scrollWidth, over, small };
});
for (const id of ids) {
  await p.evaluate(id => { if (document.getElementById('modal').open) closeModal(true); launchActivity(id); }, id);
  await p.waitForTimeout(900);
  const m = await measure();
  console.log(id, JSON.stringify(m));
  await p.screenshot({ path: `${out}/${id}.png` });
}
console.log('errors', JSON.stringify(errs));
await browser.close();
