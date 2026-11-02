// Crown Help UI check: every page type and app, desktop and phone; screenshots + axe on the open panel.
// Usage: node apps/crown-help/tests/ui.mjs <port> <out-dir> [axe.min.js]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const [port = 8443, OUT = '/tmp/crown-help-ui', AXE] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const pages = [['home', '/'], ['plans', '/subscribe'], ['account', '/account'], ['guide', '/guides/gulf/saudi-snle-nursing-exam'], ['medlex', '/medlex/'], ['carecraft', '/carecraft/'], ['serein', '/serein/'], ['lumen', '/lumen/']];
const b = await chromium.launch({ args: ['--ignore-certificate-errors', '--no-proxy-server'] });
let problems = 0;
for (const [kind, vp] of [['desktop', { width: 1366, height: 860 }], ['phone', { width: 390, height: 844 }]]) {
  for (const [name, path] of pages) {
    const ctx = await b.newContext({ ignoreHTTPSErrors: true, bypassCSP: true, serviceWorkers: 'block', viewport: vp, isMobile: kind === 'phone', hasTouch: kind === 'phone' });
    await ctx.route(/supabase\.co/, r => r.fulfill({ status: 204, body: '' }));
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => { if (/crown-help|CrownHelp|chp/.test(String(e.stack))) errs.push(String(e)); });
    await p.goto(`https://localhost:${port}${path}`, { waitUntil: 'load' }); await p.waitForTimeout(2500);
    await p.keyboard.press('Escape').catch(() => {});
    await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach(d => d.close()));
    const launch = await p.$('.chp-launch');
    if (!launch) { console.log('NO LAUNCHER', name, kind); problems++; await ctx.close(); continue; }
    // What sits under the launcher? It must be the launcher itself (not covered) and must not cover another control.
    const cover = await p.evaluate(() => { const r = document.querySelector('.chp-launch').getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; const top = document.elementFromPoint(x, y); const lb = document.querySelector('.chp-launch'); lb.style.display = 'none'; const under = document.elementFromPoint(x, y); lb.style.display = ''; const ctl = under && under.closest('button,a,input,[role=button]'); let fixed = false; for (let n = ctl; n && n !== document.body; n = n.parentElement) { const ps = getComputedStyle(n).position; if (ps === 'fixed' || ps === 'sticky') { fixed = true; break; } } return { covered: !lb.contains(top), under: ctl && fixed ? (under.closest('button,a,input,[role=button]').textContent || under.closest('button,a,input,[role=button]').getAttribute('aria-label') || '').trim().slice(0, 40) : '' }; });
    if (cover.covered || cover.under) { console.log('OVERLAP', name, kind, JSON.stringify(cover)); problems++; }
    await p.screenshot({ path: `${OUT}/${name}-${kind}-closed.png` });
    await launch.click(); await p.waitForTimeout(600);
    await p.fill('#chp-q', name === 'serein' ? 'is my journal private' : name === 'plans' ? 'can I get a refund' : 'is it free'); await p.keyboard.press('Enter'); await p.waitForTimeout(700);
    await p.screenshot({ path: `${OUT}/${name}-${kind}-open.png` });
    if (AXE && kind === 'desktop') {
      await p.addScriptTag({ path: AXE });
      const v = await p.evaluate(async () => (await axe.run('.chp', { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] })).violations.map(x => x.id + ':' + x.nodes.length));
      if (v.length) { console.log('AXE', name, v.join(' ')); problems++; }
    }
    if (errs.length) { console.log('ERR', name, kind, errs); problems++; }
    await ctx.close();
  }
}
// Flows on the home page: angry billing, clinical, crisis, two misses, email card, Escape returns focus.
{
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block', viewport: { width: 1366, height: 860 } });
  const logged = []; await ctx.route(/supabase\.co/, r => { logged.push(r.request().postDataJSON()); r.fulfill({ status: 204, body: '' }); });
  const p = await ctx.newPage(); await p.goto(`https://localhost:${port}/`, { waitUntil: 'load' }); await p.waitForTimeout(1500);
  await p.click('.chp-launch'); await p.waitForTimeout(400);
  const send = async q => { await p.fill('#chp-q', q); await p.keyboard.press('Enter'); await p.waitForTimeout(500); };
  await send('I was charged twice!!! this is unacceptable');
  await send('what dose of morphine for my patient');
  await send('I want to kill myself');
  await send('purple elephants dancing'); await send('more purple elephants');
  await p.screenshot({ path: `${OUT}/flows-desktop.png`, fullPage: false });
  const text = await p.$eval('.chp-log', e => e.innerText);
  const checks = { angryHandover: /pass this straight to a person/.test(text), clinical: /can't give advice about a real patient/.test(text), crisis: /116 123/.test(text) && /999/.test(text), secondMiss: /rather not guess/.test(text), emailCards: (await p.$$('.chp-card')).length >= 2 };
  console.log('Flows:', JSON.stringify(checks));
  if (Object.values(checks).includes(false)) problems++;
  const crisisLog = logged.find(l => l && l.p_kind === 'crisis');
  console.log('Crisis log stores no words:', crisisLog && crisisLog.p_query === null);
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  const focus = await p.evaluate(() => document.activeElement && document.activeElement.className);
  console.log('Focus after Escape:', focus);
  await ctx.close();
}
await b.close();
console.log(problems ? `${problems} problem(s)` : 'UI: all good');
process.exit(problems ? 1 : 0);
