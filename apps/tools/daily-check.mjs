// Daily Crown: card in all four My Days, shared cookie across hosts, streak rules, Serein calm, home summary, axe/console. usage: node daily-check.mjs <outdir> [port]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const out = process.argv[2], port = process.argv[3] || 8443; fs.mkdirSync(out, { recursive: true });
const AXE = fs.readFileSync('/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8');
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--ignore-certificate-errors', `--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}, MAP healthcarecrownacademy.co.uk 127.0.0.1:${port}`] });
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
const U = a => a === 'home' ? 'https://healthcarecrownacademy.co.uk/' : `https://${a}.healthcarecrownacademy.co.uk/#today`;
const key = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const ago = n => { const d = new Date(); d.setDate(d.getDate() - n); return key(d); };
async function page(ctx, a, errs) {
  const p = await ctx.newPage(); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(a + ': ' + m.text()); }); p.on('pageerror', e => errs.push(a + ': ' + e));
  await p.route(/supabase\.co|lumen-ai|api\.(openai|anthropic)/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(U(a)); await p.waitForTimeout(1800);
  for (let i = 0; i < 4; i++) { const s = p.locator('dialog[open] [data-sh="skip"], dialog[open] [data-v5="welcome-skip"], dialog[open] button:has-text("Skip")'); if (!(await s.count())) break; await s.first().click({ force: true }).catch(() => {}); await p.waitForTimeout(500); }
  return p;
}
const card = p => p.evaluate(() => { const c = document.querySelector('.hs-daily'); return c && { text: c.innerText.replace(/\s+/g, ' '), items: c.querySelectorAll('.dc-item').length, done: c.querySelectorAll('.is-done').length, h: [...c.querySelectorAll('.dc-item')].map(e => Math.round(e.getBoundingClientRect().height)), flame: !!c.querySelector('.hs-flame') }; });
const setCookie = (ctx, o) => ctx.addCookies([{ name: 'hca-daily', value: encodeURIComponent(JSON.stringify(o)), domain: '.healthcarecrownacademy.co.uk', path: '/', secure: true, sameSite: 'Lax' }]);
const errs = [];
for (const [w, h, dark] of [[1440, 900, false], [390, 844, true]]) {
  const tag = `${w}${dark ? 'd' : 'l'}`; console.log('--- ' + tag);
  const ctx = await br.newContext({ viewport: { width: w, height: h }, colorScheme: dark ? 'dark' : 'light', ignoreHTTPSErrors: true, serviceWorkers: 'block' });
  for (const a of ['medlex', 'carecraft', 'serein', 'lumen']) {
    const p = await page(ctx, a, errs), c = await card(p);
    ok(c && c.items === 4, a + ': card with 4 items'); if (c && w < 500) ok(c.h.every(x => x >= 44), a + ': targets >= 44 ' + c.h);
    await p.screenshot({ path: `${out}/${a}-${tag}.png` });
    await p.evaluate(AXE); const ax = await p.evaluate(async () => (await axe.run(document.querySelector('.hs-daily'), { runOnly: ['wcag2a', 'wcag2aa'] })).violations.map(v => v.id + ':' + v.nodes.length));
    ok(ax.length === 0, a + ': axe on card ' + ax.join(','));
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), a + ': no sideways scroll'); await p.close();
  }
  // shared cookie across hosts
  const m = await page(ctx, 'medlex', errs); await m.evaluate(() => window.HCA.daily.done('medlex')); await m.close();
  const cc = await page(ctx, 'carecraft', errs), c2 = await card(cc); ok(c2 && /1 of 4 done today/.test(c2.text) && /1-day streak/.test(c2.text) && c2.done === 1, 'carecraft sees MedLex done + 1-day streak: ' + (c2 && c2.text.slice(0, 90))); await cc.close();
  const sr = await page(ctx, 'serein', errs), c3 = await card(sr); ok(c3 && !/\d+-day streak/i.test(c3.text) && !c3.flame && /Take what fits/.test(c3.text), 'serein shows no streak: ' + (c3 && c3.text.slice(0, 90))); await sr.screenshot({ path: `${out}/serein-after-${tag}.png` }); await sr.close();
  const hm = await page(ctx, 'home', errs); ok(await hm.evaluate(() => { const e = document.querySelector('[data-daily-home]'); return e && !e.hidden && /1 of 4/.test(e.innerText); }), 'home shows the summary'); await hm.screenshot({ path: `${out}/home-${tag}.png` }); await hm.close();
  await ctx.close();
}
// streak rules
const rule = async (st, expect, label) => {
  const ctx = await br.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' }); await setCookie(ctx, st);
  const p = await ctx.newPage(); await p.route(/supabase\.co/, r => r.fulfill({ status: 200, body: '{}' })); await p.goto(U('home')); await p.waitForTimeout(800);
  const r = await p.evaluate(() => { const b = window.HCA.daily.get(); window.HCA.daily.done('lumen'); return [b.s, window.HCA.daily.get().s, window.HCA.daily.get().best]; });
  ok(r[1] === expect[0] && r[2] === expect[1], `${label}: before ${r[0]}, after ${r[1]}, best ${r[2]}`); await ctx.close();
};
await rule({ d: ago(1), a: ['serein'], s: 3, best: 5 }, [4, 5], 'yesterday keeps the streak going');
await rule({ d: ago(0), a: ['serein'], s: 3, best: 5 }, [3, 5], 'same day does not add a day');
await rule({ d: ago(3), a: ['serein'], s: 9, best: 9 }, [1, 9], 'a gap restarts at 1, best is kept');
await rule({ d: 'garbage', a: 'x', s: 'y', best: -4 }, [1, 1], 'a damaged cookie is treated as empty');
ok(errs.length === 0, 'console errors: ' + errs.slice(0, 4).join(' || '));
await br.close(); console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
