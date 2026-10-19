// MedLex pronunciation recorder: allowed (fake mic), denied, no-mic; axe, console, 390/1440, light/dark. usage: node medlex-pronounce-check.mjs <outdir> [port]
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const out = process.argv[2], port = process.argv[3] || 8443; fs.mkdirSync(out, { recursive: true });
const AXE = fs.readFileSync('/tmp/jsd/node_modules/axe-core/axe.min.js', 'utf8');
const base = ['--no-proxy-server', '--ignore-certificate-errors', `--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:${port}, MAP healthcarecrownacademy.co.uk 127.0.0.1:${port}`];
const URL = 'https://medlex.healthcarecrownacademy.co.uk/#library/pronunciation';
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
async function open(br, w, dark, extra = {}) {
  const ctx = await br.newContext({ viewport: { width: w, height: w < 500 ? 844 : 900 }, colorScheme: dark ? 'dark' : 'light', ignoreHTTPSErrors: true, ...extra });
  const p = await ctx.newPage(), errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
  await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(URL); await p.waitForTimeout(1500);
  for (let i = 0; i < 3; i++) { const s = p.locator('dialog[open] button:has-text("Skip"), dialog[open] [data-action=close-modal]'); if (!(await s.count())) break; await s.first().click({ force: true }).catch(() => {}); await p.waitForTimeout(400); }
  return { ctx, p, errs };
}
const axe = async p => { await p.evaluate(AXE); return p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] })).violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => v.id + ':' + v.nodes.length + ':' + v.nodes[0].target)); };
// 1. allowed
let br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [...base, '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
for (const [w, dark] of [[1440, false], [1440, true], [390, false], [390, true]]) {
  const tag = `${w}${dark ? 'd' : 'l'}`; console.log('--- allowed ' + tag);
  const { ctx, p, errs } = await open(br, w, dark, { permissions: ['microphone'] });
  ok(await p.locator('[data-lx="px-rec"]').count() > 0, 'record button'); await p.screenshot({ path: `${out}/px-idle-${tag}.png` });
  await p.locator('[data-lx="px-rec"]').first().click(); await p.waitForTimeout(1500);
  ok(await p.locator('[data-lx="px-stop"]').count() > 0, 'recording shows stop'); await p.screenshot({ path: `${out}/px-rec-${tag}.png` });
  const live = await p.evaluate(() => navigator.mediaDevices.enumerateDevices().then(() => 1)); 
  await p.locator('[data-lx="px-stop"]').first().click(); await p.waitForTimeout(800);
  ok(await p.locator('[data-lx="px-replay"]').count() > 0, 'replay offered'); await p.screenshot({ path: `${out}/px-done-${tag}.png` });
  ok((await axe(p)).length === 0, 'axe ' + (await axe(p)).join('|'));
  await p.locator('[data-lx="px-discard"]').first().click().catch(() => {}); await p.waitForTimeout(300);
  await p.locator('[data-lx="px-rec"]').first().click(); await p.waitForTimeout(11500);
  ok(await p.locator('[data-lx="px-replay"]').count() > 0, 'auto-stop at 10 s');
  await p.evaluate(() => { location.hash = '#library/parts'; }); await p.waitForTimeout(600);
  ok(await p.evaluate(() => !document.querySelector('audio[src^="blob"]')), 'recording dropped on leave');
  ok(errs.length === 0, 'console errors: ' + errs.slice(0, 2).join(' || ')); await ctx.close();
}
await br.close();
// 2. denied (the fake UI is told to refuse)
br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: [...base, '--use-fake-device-for-media-stream', '--deny-permission-prompts'] });
{ console.log('--- denied'); const { ctx, p, errs } = await open(br, 390, false);
  await p.locator('[data-lx="px-rec"]').first().click(); await p.waitForTimeout(1500);
  const txt = await p.locator('#main').innerText(); ok(/blocked|permission|allow/i.test(txt), 'denied state explained'); await p.screenshot({ path: `${out}/px-denied.png` });
  ok((await axe(p)).length === 0, 'axe denied'); ok(errs.filter(e => !/NotAllowed|Permission/i.test(e)).length === 0, 'console ' + errs.join('|')); await ctx.close(); }
await br.close();
// 3. no microphone
br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: base });
{ console.log('--- no mic'); const { ctx, p } = await open(br, 390, false);
  await p.evaluate(() => { navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('none', 'NotFoundError')); });
  await p.locator('[data-lx="px-rec"]').first().click(); await p.waitForTimeout(1200);
  ok(/microphone/i.test(await p.locator('#main').innerText()), 'no-mic state explained'); await ctx.close(); }
await br.close(); console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
