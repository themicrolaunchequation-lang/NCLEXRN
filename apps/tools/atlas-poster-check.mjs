// MedLex Visual Atlas poster pop-up: open, every markup tool, undo/redo/delete/clear, persistence, zoom, keyboard, axe, 1440 + 390, light + dark.
// usage: node atlas-poster-check.mjs <outdir> [port]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const out = process.argv[2], port = process.argv[3] || 8443; fs.mkdirSync(out, { recursive: true });
const AXE = fs.readFileSync('/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8');
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--ignore-certificate-errors', `--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}`] });
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
for (const [w, h, dark, tag] of [[1440, 900, false, 'd-light'], [390, 844, true, 'm-dark']]) {
  console.log('--- ' + tag);
  const ctx = await br.newContext({ viewport: { width: w, height: h }, colorScheme: dark ? 'dark' : 'light', ignoreHTTPSErrors: true, hasTouch: w < 500 });
  const p = await ctx.newPage(), errs = []; p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
  await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto('https://medlex.healthcarecrownacademy.co.uk/#infographics'); await p.waitForTimeout(2200);
  for (let i = 0; i < 3; i++) { const s = p.locator('dialog[open]:not(.pv) button:has-text("Skip"), dialog[open]:not(.pv) [data-action=close-modal]'); if (!(await s.count())) break; await s.first().click({ force: true }).catch(() => {}); await p.waitForTimeout(400); }
  await p.locator('.lx-atl').nth(2).click(); await p.waitForTimeout(2000);
  const q = s => p.locator('dialog.pv ' + s);
  ok(await p.locator('dialog.pv[open]').count() === 1, 'pop-up opens');
  ok(await p.evaluate(() => !!document.querySelector('.pv-img').naturalWidth), 'infographic loaded');
  ok(await p.evaluate(() => { const i = document.querySelector('.pv-img').getBoundingClientRect(), s = document.querySelector('.pv-stage').getBoundingClientRect(); return i.left >= s.left - 1 && i.right <= s.right + 1 && i.top >= s.top - 1 && i.bottom <= s.bottom + 1; }), 'whole poster fits the window');
  ok(!(await p.evaluate(() => /Annotate|Test yourself|YOUR JOURNEY/i.test(document.querySelector('dialog.pv').innerText))), 'only the infographic: no tour panels');
  await p.screenshot({ path: `${out}/open-${tag}.png` });
  const items = () => p.evaluate(() => { const o = JSON.parse(localStorage.getItem('medlex.atlas.ink.v1') || '{}'); return Object.values(o)[0] || []; });
  const box = await q('.pv-stage').boundingBox(), cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const drag = async (x0, y0, x1, y1) => { await p.mouse.move(x0, y0); await p.mouse.down(); await p.mouse.move((x0 + x1) / 2, (y0 + y1) / 2 + 12, { steps: 4 }); await p.mouse.move(x1, y1, { steps: 4 }); await p.mouse.up(); await p.waitForTimeout(150); };
  const tool = async t => { await q(`[data-pv=tool][data-v=${t}]`).click(); await p.waitForTimeout(100); };
  await tool('pen'); await drag(cx - 100, cy - 100, cx - 20, cy - 60); ok((await items()).some(i => i.t === 'pen'), 'pen draws');
  await tool('marker'); await drag(cx - 100, cy - 20, cx - 20, cy + 20); ok((await items()).some(i => i.t === 'marker'), 'marker draws');
  await tool('hl'); await drag(cx - 100, cy + 60, cx + 40, cy + 70); ok((await items()).some(i => i.t === 'hl'), 'highlighter draws');
  await tool('shape'); await q('[data-pv=shape][data-v=ellipse]').click(); await drag(cx + 20, cy - 120, cx + 120, cy - 50); await q('[data-pv=shape][data-v=arrow]').click(); await drag(cx + 20, cy, cx + 120, cy + 40);
  ok((await items()).filter(i => i.t === 'shape').length === 2, 'shapes: oval and arrow');
  await tool('text'); await p.mouse.click(cx - 120, cy + 120); await p.keyboard.type('Remember this'); await p.keyboard.press('Escape'); await p.waitForTimeout(200); ok((await items()).some(i => i.t === 'text' && i.text === 'Remember this'), 'text added and kept');
  await tool('note'); await p.mouse.click(cx + 40, cy + 120); await p.keyboard.type('Ask tutor'); await p.keyboard.press('Escape'); await p.waitForTimeout(200); ok((await items()).some(i => i.t === 'note' && i.text === 'Ask tutor'), 'sticky note added and kept');
  await tool('sticker'); await q('[data-pv=stk][data-v=star]').click(); await p.mouse.click(cx + 90, cy - 150); await p.waitForTimeout(200); ok((await items()).some(i => i.t === 'sticker' && i.k === 'star'), 'sticker placed');
  const n0 = (await items()).length; await p.screenshot({ path: `${out}/marked-${tag}.png` });
  ok(n0 === 8, 'eight marks so far (' + n0 + ')');
  // select + move + restyle + delete
  await tool('select'); const sBox = await q('.pv-sticker').boundingBox(); await p.mouse.click(sBox.x + sBox.width / 2, sBox.y + sBox.height / 2); await p.waitForTimeout(150);
  ok(await q('.pv-selbox').isVisible(), 'select shows an outline'); ok(await q('.pv-opts').isVisible(), 'options appear for the selected mark');
  const before = (await items()).find(i => i.t === 'sticker'); await p.mouse.move(sBox.x + sBox.width / 2, sBox.y + sBox.height / 2); await p.mouse.down(); await p.mouse.move(sBox.x + sBox.width / 2 + 40, sBox.y + sBox.height / 2 + 30, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(150);
  const after = (await items()).find(i => i.t === 'sticker'); ok(after.x !== before.x, 'selected mark moves');
  await q('.pv-sw[data-v="#D93A3A"]').click(); ok((await items()).find(i => i.t === 'sticker').c === '#D93A3A', 'selected mark takes a new colour');
  await q('[data-pv=del]').click(); ok((await items()).length === n0 - 1 && !(await items()).some(i => i.t === 'sticker'), 'delete removes the selected mark');
  await q('[data-pv=undo]').click(); ok((await items()).some(i => i.t === 'sticker'), 'undo brings it back'); await q('[data-pv=redo]').click(); ok(!(await items()).some(i => i.t === 'sticker'), 'redo removes it again');
  await p.keyboard.press('Control+z'); ok((await items()).some(i => i.t === 'sticker'), 'Ctrl+Z works');
  await q('[data-pv=clear]').click(); ok((await items()).length === 0, 'clear all'); await q('[data-pv=undo]').click(); ok((await items()).length === n0, 'clear all can be undone');
  // persistence
  await p.reload(); await p.waitForTimeout(2200); for (let i = 0; i < 3; i++) { const s = p.locator('dialog[open]:not(.pv) button:has-text("Skip")'); if (!(await s.count())) break; await s.first().click({ force: true }).catch(() => {}); await p.waitForTimeout(400); }
  await p.locator('.lx-atl').nth(2).click(); await p.waitForTimeout(2000); ok(await p.evaluate(() => document.querySelectorAll('.pv-it').length) === 3, 'markup is still there after reload (text, note, sticker)');
  // zoom, keys, navigation
  await q('[data-pv=zin]').click(); await q('[data-pv=zin]').click(); await p.waitForTimeout(150); const z = await q('.pv-pct').innerText(); ok(parseInt(z) > 100, 'zoom in: ' + z); await q('[data-pv=fit]').click(); ok(parseInt(await q('.pv-pct').innerText()) === 100, 'fit returns to 100%');
  await p.keyboard.press('+'); await p.keyboard.press('0'); await q('[data-pv=next]').click(); await p.waitForTimeout(1500); ok((await q('.pv-pos').innerText()).startsWith('4 of'), 'next guide'); ok(await p.evaluate(() => document.querySelectorAll('.pv-it').length) === 0, 'each guide has its own markup');
  await q('[data-pv=text]').click(); ok(await q('aside.pv-text').isVisible(), 'text of the guide is available'); await p.screenshot({ path: `${out}/text-${tag}.png` }); await q('[data-pv=text]').click();
  const dl = p.waitForEvent('download', { timeout: 6000 }).catch(() => null); await q('[data-pv=save]').click(); const dd = await dl; ok(!!dd && /^medlex-/.test(dd.suggestedFilename()), 'save as a picture downloads ' + (dd && dd.suggestedFilename()));
  await tool('sticker'); await p.screenshot({ path: `${out}/stickers-${tag}.png` });
  { const small = await p.evaluate(() => [...document.querySelectorAll('dialog.pv button')].filter(b => b.offsetParent && (b.getBoundingClientRect().height < 44 || b.getBoundingClientRect().width < 44)).map(b => b.className + ' ' + Math.round(b.getBoundingClientRect().width) + 'x' + Math.round(b.getBoundingClientRect().height))); ok(small.length === 0, 'all buttons at least 44px: ' + small.join(', ')); }
  await p.evaluate(AXE); const ax = await p.evaluate(async () => (await axe.run(document.querySelector('dialog.pv'), { runOnly: ['wcag2a', 'wcag2aa'] })).violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => v.id + ':' + v.nodes.length + ':' + String(v.nodes[0].target).slice(0, 50))); ok(ax.length === 0, 'axe ' + ax.join(' | '));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400); ok(await p.locator('dialog.pv').count() === 0, 'Esc closes the pop-up'); ok(await p.evaluate(() => /lx-atl|lx-/.test(document.activeElement.className) || document.activeElement.tagName === 'BUTTON'), 'focus returns to the shelf');
  ok(errs.length === 0, 'console errors: ' + errs.slice(0, 3).join(' || ')); await ctx.close();
}
await br.close(); console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
