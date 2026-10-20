// Lumen on a browser without Promise.try (Chrome before 128): adding a PDF must still open the reading room.
// Runs twice: with the shim (expect: opens) and with the shim stripped from the worker (control: expect: stuck). usage: node lumen-old-browser-check.mjs [port]
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const port = process.argv[2] || 8443, D = fs.mkdtempSync(path.join(os.tmpdir(), 'lumen-old-'));
{ const w = 595, h = 842, objs = [], add = s => objs.push(s) && objs.length;
  add('<< /Type /Catalog /Pages 2 0 R >>'); add('<< /Type /Pages /Kids [4 0 R] /Count 1 >>'); add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const body = `BT /F1 24 Tf 30 ${h - 50} Td (Hello Lumen) Tj ET`; add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Contents 5 0 R /Resources << /Font << /F1 3 0 R >> >> >>`); add(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`);
  let s = '%PDF-1.4\n', off = []; objs.forEach((o, i) => { off.push(s.length); s += `${i + 1} 0 obj\n${o}\nendobj\n`; }); const x = s.length;
  s += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + off.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`; fs.writeFileSync(path.join(D, 'a.pdf'), s); }
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [`--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`, '--ignore-certificate-errors', '--no-proxy-server'] });
let fails = 0;
for (const control of [false, true]) {
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', ignoreHTTPSErrors: true });
  const local = r => r.fetch({ url: r.request().url().replace('https://lumen.healthcarecrownacademy.co.uk', `https://127.0.0.1:${port}`), headers: { host: 'lumen.healthcarecrownacademy.co.uk' } });
  await ctx.addInitScript(() => { try { delete Promise.try; } catch { } });                 // the page behaves like an old browser
  await ctx.route(/\/vendor\/pdf\/worker\..*\.mjs/, async r => {                           // and so does the worker
    const res = await local(r); let t = await res.text();
    if (control) t = t.replace(/^if\(typeof Promise\.try[\s\S]*?\}\}\);\}\n/, '');          // control: the same worker without the shim
    await r.fulfill({ response: res, body: 'delete Promise.try;\n' + t });
  });
  if (control) await ctx.route(/\/lumen\/js\/00\..*\.js/, async r => { const res = await local(r); let t = await res.text(); t = t.replace(/^if\(typeof Promise\.try[\s\S]*?\}\}\);\}\n/, ''); await r.fulfill({ response: res, body: t }); });
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 90))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 90)); });
  await p.goto('https://lumen.healthcarecrownacademy.co.uk/#library'); await p.waitForTimeout(2200);
  for (let i = 0; i < 4; i++) { const sk = p.getByRole('button', { name: /^(Skip|Skip for now)$/ }); if (await sk.count()) { await sk.first().click().catch(() => {}); await p.waitForTimeout(300); } else break; }
  await p.getByRole('button', { name: /Add a source/ }).first().click(); await p.waitForTimeout(500);
  await p.locator('input[type=file]').first().setInputFiles(path.join(D, 'a.pdf')); await p.waitForTimeout(500);
  await p.locator('.modal input[type=checkbox]').first().check({ timeout: 4000 }).catch(() => {});
  if (await p.locator('.modal input[type=checkbox]').count()) await p.getByRole('button', { name: /^Add \d+ source file/ }).click().catch(() => {});
  const opened = await p.waitForSelector('.reader-root', { timeout: control ? 12000 : 40000 }).then(() => true).catch(() => false);
  const good = control ? !opened : opened; if (!good) fails++;
  console.log((good ? 'ok   ' : 'FAIL ') + (control ? 'control (no shim) stays stuck, as the bug report showed' : 'with the shim the PDF opens in the reading room'), errs.slice(0, 2));
  await ctx.close();
}
await br.close(); console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
