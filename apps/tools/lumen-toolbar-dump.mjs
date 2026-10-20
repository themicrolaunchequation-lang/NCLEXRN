// Lists every toolbar control and menu item in the Lumen reader (to find duplicates), with screenshots. usage: node lumen-toolbar-dump.mjs <outdir> [WxH]
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const out = process.argv[2], [W, H] = (process.argv[3] || '1440x900').split('x').map(Number), D = fs.mkdtempSync(path.join(os.tmpdir(), 'lumen-tb-')); fs.mkdirSync(out, { recursive: true });
{ const w = 595, h = 842, objs = [], add = s => objs.push(s) && objs.length;
  add('<< /Type /Catalog /Pages 2 0 R >>'); add('<< /Type /Pages /Kids [4 0 R] /Count 1 >>'); add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const body = `BT /F1 24 Tf 30 ${h - 50} Td (Hello Lumen) Tj ET`; add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Contents 5 0 R /Resources << /Font << /F1 3 0 R >> >> >>`); add(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`);
  let s = '%PDF-1.4\n', off = []; objs.forEach((o, i) => { off.push(s.length); s += `${i + 1} 0 obj\n${o}\nendobj\n`; }); const x = s.length;
  s += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + off.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`; fs.writeFileSync(path.join(D, 'a.pdf'), s); }
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:8443', '--ignore-certificate-errors', '--no-proxy-server'] });
const ctx = await br.newContext({ viewport: { width: W, height: H }, serviceWorkers: 'block', ignoreHTTPSErrors: true }); const p = await ctx.newPage();
await p.goto('https://lumen.healthcarecrownacademy.co.uk/#library'); await p.waitForTimeout(2200);
for (let i = 0; i < 4; i++) { const sk = p.getByRole('button', { name: /^(Skip|Skip for now)$/ }); if (await sk.count()) { await sk.first().click().catch(() => {}); await p.waitForTimeout(300); } else break; }
await p.evaluate(() => { location.hash = '#home'; }); await p.waitForTimeout(1200); await p.screenshot({ path: path.join(out, 'home.png') });
console.log('TOUR TAB on home:', await p.locator('.hl-tour-tab').count(), 'tab box', JSON.stringify(await p.locator('.hl-tour-tab').boundingBox()));
await p.locator('.hl-tour-tab').click(); await p.waitForTimeout(700);
for (let i = 1; i <= 5; i++) { console.log('TOUR step', i, '|', (await p.locator('.tour-modal .tour-title').innerText()).trim(), '|', (await p.locator('.tour-modal .modal-eyebrow, .tour-modal [class*=eyebrow]').first().innerText().catch(() => '')).trim()); await p.screenshot({ path: path.join(out, 'tour-' + i + '.png') }); if (i < 5) await p.getByRole('button', { name: /A little further/ }).click(); await p.waitForTimeout(300); }
await p.keyboard.press('Escape'); await p.waitForTimeout(400);
await p.evaluate(() => { location.hash = '#library'; }); await p.waitForTimeout(1200); console.log('TOUR TAB on library:', await p.locator('.hl-tour-tab').count()); await p.screenshot({ path: path.join(out, 'library.png') });
await p.evaluate(() => { location.hash = '#progress'; }); await p.waitForTimeout(800); console.log('TOUR TAB on progress (expect 0):', await p.locator('.hl-tour-tab').count()); await p.evaluate(() => { location.hash = '#library'; }); await p.waitForTimeout(600);
await p.getByRole('button', { name: /Add a source/ }).first().click(); await p.waitForTimeout(500);
await p.locator('input[type=file]').first().setInputFiles(path.join(D, 'a.pdf')); await p.waitForTimeout(500);
await p.locator('.modal input[type=checkbox]').first().check({ timeout: 4000 }).catch(() => {});
if (await p.locator('.modal input[type=checkbox]').count()) await p.getByRole('button', { name: /^Add \d+ source file/ }).click().catch(() => {});
await p.waitForSelector('.reader-root', { timeout: 60000 }); await p.waitForTimeout(2500); await p.evaluate(() => document.querySelectorAll('.toast-container').forEach(e => e.remove()));
const label = e => ((e.getAttribute('aria-label') || e.innerText || e.title || '').replace(/\s+/g, ' ').trim()).slice(0, 60);
const list = async (sel) => p.evaluate(([sel, lab]) => { const f = new Function('e', 'return (' + lab + ')(e)'); return [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length).map(e => f(e)); }, [sel, label.toString()]);
await p.screenshot({ path: path.join(out, 'reader.png') });
console.log('TOP BAR:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.reader-root button, .reader-root summary, .reader-root details > summary')].filter(e => e.getClientRects().length && e.getBoundingClientRect().top < 160).map(e => ((e.getAttribute('aria-label') || e.innerText || e.title || '').replace(/\s+/g, ' ').trim()).slice(0, 40)))));
const menuItems = () => p.evaluate(() => [...document.querySelectorAll('details[open] button, details[open] a, details[open] [role=menuitem], details[open] [role=menuitemradio]')].filter(e => e.getClientRects().length && !e.closest('summary')).map(e => ((e.getAttribute('aria-label') || e.innerText || e.title || '').replace(/\s+/g, ' ').trim()).slice(0, 48)));
for (const name of ['More', 'Tools']) {
  const t = p.locator('.reader-root summary').filter({ hasText: name }).first(); if (!(await t.count())) { console.log(name, ': no summary'); continue; }
  await t.click().catch(() => {}); await p.waitForTimeout(600); console.log(name.toUpperCase(), '->', JSON.stringify(await menuItems())); await p.screenshot({ path: path.join(out, name + '.png') }); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
}
for (const name of ['Explain', 'Quiz & summary', 'Study panel']) {
  const t = p.locator('.reader-root button').filter({ hasText: name }).first(); if (!(await t.count())) { console.log(name, ': no button'); continue; }
  await t.click().catch(() => {}); await p.waitForTimeout(800);
  console.log(name.toUpperCase(), '-> panel tabs', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.hl-tabs button, .hca-sidecar-tabs button')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim() + (e.getAttribute('aria-selected') === 'true' ? '*' : '')))), 'panel head:', await p.evaluate(() => (document.querySelector('.hl-sh, .hca-sidecar-header')?.innerText || '').replace(/\s+/g, ' ').slice(0, 80)));
  await p.screenshot({ path: path.join(out, name.replace(/\s/g, '-') + '.png') });
}
await br.close();
