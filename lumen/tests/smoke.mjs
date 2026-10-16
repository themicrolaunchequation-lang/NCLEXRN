#!/usr/bin/env node
// Smoke test for a built Lumen file, in headless Chromium (Playwright).
// Usage: node lumen/tests/smoke.mjs [path/to/Lumen.html]
// Needs Playwright with a Chromium build (npm i -D playwright && npx playwright install chromium).
// Exits with code 1 if any check fails.
import { createRequire } from 'node:module';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(join(process.execPath, '../../lib/node_modules/playwright'))); }

const here = dirname(fileURLToPath(import.meta.url));
const file = resolve(process.argv[2] || join(here, '..', 'dist', 'Lumen-clinical-study-studio.html'));
const url = `file://${file}`;
const ROUTES = ['home', 'library', 'studio', 'notes', 'methods', 'progress'];
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await chromium.launch();
const errors = [];
const watch = page => page.on('pageerror', e => errors.push(e.message));
const openApp = async ctx => {
  const page = await ctx.newPage();
  watch(page);
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  await page.waitForSelector('.app-shell', { timeout: 30000 });
  await page.waitForTimeout(800);
  return page;
};
// The reader does not change the address, so step away first when the hash already matches.
const go = async (page, route) => {
  await page.evaluate(r => { if (location.hash === `#${r}`) location.hash = r === 'home' ? 'library' : 'home'; location.hash = r; }, route);
  await page.waitForTimeout(500);
};
const saved = page => page.evaluate(() => new Promise(done => {
  const req = indexedDB.open('lumen.workspace.v4', 1);
  req.onsuccess = () => { const get = req.result.transaction('kv').objectStore('kv').get('workspace'); get.onsuccess = () => done(get.result ? JSON.parse(get.result.json) : null); };
  req.onerror = () => done(null);
}));

let page;
try {
  // Desktop: every page renders.
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  page = await openApp(desktop);
  for (const r of ROUTES) await go(page, r);
  check('every page opens without a script error', errors.length === 0, errors[0]);

  // Starter cards, then a keyboard-only review with all four ratings.
  await go(page, 'studio');
  await page.getByText('Add source-linked starter cards').first().click();
  await page.waitForTimeout(700);
  await go(page, 'home');
  await page.keyboard.press('r');
  await page.waitForTimeout(500);
  for (const key of [' ', '1', ' ', '2', ' ', '3', ' ', '4']) { await page.keyboard.press(key); await page.waitForTimeout(300); }
  await page.waitForTimeout(800);
  let state = await saved(page);
  check('review by keyboard records Again, Hard, Good, Easy', state?.reviewLog?.map(l => l.rating).join(',') === 'again,hard,good,easy', state?.reviewLog?.map(l => l.rating).join(','));
  const easy = state?.cards.find(c => c.id === state.reviewLog[3]?.cardId);
  check('adaptive scheduler sets a new Easy card 14 days out', easy && Math.round((easy.due - Date.now()) / 864e5) === 14);
  for (let i = 0; i < 4 && await page.locator('.modal-backdrop').count(); i++) { await page.locator('.modal-backdrop button[aria-label="Close dialog"]').first().click(); await page.waitForTimeout(300); }

  // Palette runs a command.
  await page.keyboard.press('Control+k');
  await page.keyboard.type('progress');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  check('command palette navigates', await page.evaluate(() => location.hash) === '#progress');

  // Card dialog saves a Client Needs tag.
  await go(page, 'home');
  await page.keyboard.press('c');
  await page.waitForTimeout(400);
  await page.locator('.modal textarea').nth(0).fill('Smoke test question');
  await page.locator('.modal textarea').nth(1).fill('Smoke test answer');
  await page.locator('.modal .hca4-tag', { hasText: 'Management of Care' }).click();
  await page.getByRole('button', { name: 'Save recall card' }).click();
  await page.waitForTimeout(800);
  state = await saved(page);
  check('card dialog saves an NCLEX tag', JSON.stringify(state?.cards.find(c => c.question === 'Smoke test question')?.tags) === '["moc"]');

  // Practice set scores and is saved.
  await go(page, 'studio');
  await page.getByRole('button', { name: 'Sample set' }).click();
  for (const t of ['Serum potassium', 'Blood pressure 128/76', 'New leg cramps']) await page.locator('.hca4-choices button', { hasText: t }).click();
  for (let i = 0; i < 5; i++) { await page.getByRole('button', { name: 'Next item' }).click(); await page.waitForTimeout(150); }
  await page.getByRole('button', { name: 'Finish and score' }).click();
  await page.waitForTimeout(800);
  state = await saved(page);
  check('practice set scores partial credit', state?.hcaNgnLog?.at(-1)?.score === 3, `${state?.hcaNgnLog?.at(-1)?.score} / ${state?.hcaNgnLog?.at(-1)?.max}`);
  await page.locator('.modal-backdrop button[aria-label="Close dialog"]').first().click();

  // Work survives a reload.
  const before = state.cards.length;
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('.app-shell');
  await page.waitForTimeout(800);
  check('workspace survives a reload', (await saved(page))?.cards.length === before);

  // Reader keys.
  await go(page, 'home');
  await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
  await page.waitForTimeout(1500);
  await page.keyboard.press('z');
  await page.waitForTimeout(300);
  const focused = await page.locator('.app-shell.focus-active').count();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check('reader focus mode toggles with Z and Esc', focused === 1 && await page.locator('.app-shell.focus-active').count() === 0);

  // OCR reads a printed image, even from a local file:// copy.
  const ocr = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 140;
    const g = canvas.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, 600, 140);
    g.fillStyle = '#000'; g.font = '48px sans-serif'; g.fillText('CARDIAC OUTPUT', 30, 90);
    const worker = await window.LumenOCR.createWorker(() => {});
    const result = await worker.recognize(canvas);
    await worker.terminate();
    return result.data.text.trim();
  }).catch(e => `error: ${e.message}`);
  check('OCR reads a printed test image', ocr.includes('CARDIAC OUTPUT'), ocr.slice(0, 80));

  // AI through Academy AI (members sign in, no key), then falling back to the learner's own key when the
  // daily allowance is used up. Both services are mocked here, so nothing goes over the network.
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' };
  const draft = (prompt, types) => {
    const quote = ((prompt.split('SOURCE:\n')[1] || '').match(/[^.!?\n]+[.!?]/g) || []).map(x => x.trim()).find(x => x.length > 30) || '';
    return JSON.stringify({ items: types.map(type => ({ type, category: 'pha', stem: `Smoke ${type}?`, rationale: 'From the page.', quote,
      options: ['A', 'B', 'C', 'D'], answer: type === 'calc' ? 5 : 0, answers: [0, 1], steps: ['One', 'Two', 'Three'], tolerance: 0, unit: 'mL' })) });
  };
  const json = body => ({ status: 200, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  let academy = 'ok';
  await desktop.route('https://ujeofxfbwivjmgrxqdcl.supabase.co/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname, body = JSON.parse(req.postData() || '{}');
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (path === '/auth/v1/token') return body.password === 'right-password'
      ? route.fulfill(json({ access_token: 'smoke-access', refresh_token: 'SMOKE-REFRESH-TOKEN', expires_in: 3600, user: { email: 'member@example.com' } }))
      : route.fulfill({ ...json({ error_description: 'Invalid login credentials' }), status: 400 });
    if (path === '/functions/v1/lumen-ai') {
      if (req.headers().authorization !== 'Bearer smoke-access') return route.fulfill({ ...json({ message: 'Sign in again.' }), status: 401 });
      if (body.action === 'status') return route.fulfill(json({ level: 1, limit: 15, used: 0, remaining: 15 }));
      if (academy === 'daily') return route.fulfill({ ...json({ error: 'daily', retryAfter: 3600, message: 'You have used today’s 15 Academy AI requests.' }), status: 429 });
      return route.fulfill(json({ text: draft(body.prompt, ['single', 'multi', 'order']), provider: 'gemini', model: 'gemini-2.5-flash-lite', remaining: 14 }));
    }
    return route.fulfill({ status: 404, headers: cors, body: '{}' });
  });
  await desktop.route('https://api.groq.com/**', async route => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const prompt = JSON.parse(route.request().postData() || '{}').messages?.[1]?.content || '';
    return route.fulfill(json({ choices: [{ message: { content: draft(prompt, ['single', 'multi', 'order', 'calc']) } }] }));
  });
  await go(page, 'home');
  await page.keyboard.press('Control+k');
  await page.keyboard.type('AI providers');
  await page.keyboard.press('Enter');
  const academyRow = page.locator('.hca6-academy');
  await academyRow.locator('input[type=email]').fill('member@example.com');
  await academyRow.locator('input[type=password]').fill('wrong-password');
  await academyRow.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForTimeout(400);
  const refused = await academyRow.locator('[role=alert]').innerText().catch(() => '');
  await academyRow.locator('input[type=password]').fill('right-password');
  await academyRow.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForTimeout(800);
  check('Academy AI sign-in (wrong password refused, then signed in)', /do not match/.test(refused) && /15 of today/.test(await academyRow.innerText()));
  const groq = page.locator('.hca5-provider', { has: page.locator('.hca5-switch strong', { hasText: /^Groq$/ }) });
  await groq.locator('.hca5-switch input').check();
  await groq.locator('input[type=password]').fill('SMOKE-TEST-KEY');
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
  await page.waitForTimeout(1500);
  await page.keyboard.press('ArrowRight');
  await page.getByRole('button', { name: /Page studio/ }).first().click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Quiz me' }).click();
  await page.locator('.hca5-consent input[type=checkbox]').check();
  await page.locator('.hca5-consent').getByRole('button', { name: 'Send' }).click();
  await page.waitForTimeout(1500);
  const studio = page.locator('.hca5-studio');
  check('AI questions from Academy AI', await page.locator('.hca5-item').count() === 3 && /Academy AI/.test(await studio.locator('.hca-output-heading small').first().textContent()), `${await page.locator('.hca5-item').count()} items`);
  academy = 'daily';
  await page.getByRole('button', { name: 'Quiz me' }).click();
  await page.waitForTimeout(1500);
  check('falls back to your own key when the Academy allowance is used', await page.locator('.hca5-item').count() === 4 && /used today/.test(await studio.locator('.hca5-attempts').first().textContent()), `${await page.locator('.hca5-item').count()} items`);
  const download = page.waitForEvent('download');
  await go(page, 'home');
  await page.keyboard.press('Control+k');
  await page.keyboard.type('back up');
  await page.keyboard.press('Enter');
  const backup = await (await download).createReadStream().then(stream => new Promise(done => { let t = ''; stream.on('data', c => { t += c; }); stream.on('end', () => done(t)); }));
  check('API keys and sign-in stay out of backups', backup.length > 100 && !/SMOKE-TEST-KEY|SMOKE-REFRESH-TOKEN|smoke-access/.test(backup));

  // Reader tools (v7): PowerPoint import, stickers, marker, snip, calculator, meaning, PowerPoint export.
  await desktop.route(/dictionaryapi\.dev|wikipedia\.org/, route => route.fulfill({ status: 404, headers: cors, body: '{}' }));
  await go(page, 'library');
  await page.getByRole('button', { name: 'Add a source' }).first().click();
  await page.waitForTimeout(400);
  await page.setInputFiles('.file-drop-zone input[type=file]', join(here, 'fixtures', 'sample-deck.pptx'));
  await page.locator('.hca7-choice', { hasText: 'As page images' }).click();
  await page.waitForTimeout(3000);
  const slides = await page.getByText(/sample-deck - slide 0\d\.png/).count();
  await page.locator('.modal input[type=checkbox]').first().check();
  await page.getByRole('button', { name: /Add 2 source files/ }).click();
  await page.waitForTimeout(2500);
  check('PowerPoint deck becomes page images', slides === 2 && await page.locator('[data-hca-page]').count() > 0, `${slides} slides`);
  await page.locator('.hca7-tools > summary').click();
  await page.locator('.hca7-tools-menu button', { hasText: 'Drag clinical icons' }).click();
  await page.locator('.hca7-tray .hca7-grid button').first().click();
  await page.locator('.hca7-tray header button').click();
  const sheet = await page.locator('[data-hca-page]').first().boundingBox();
  await page.getByRole('button', { name: /^Pen/ }).first().click();
  await page.locator('.hca7-seg button', { hasText: 'Marker' }).click();
  await page.mouse.move(sheet.x + 80, sheet.y + 80); await page.mouse.down(); await page.mouse.move(sheet.x + 260, sheet.y + 90, { steps: 6 }); await page.mouse.up();
  await page.keyboard.press('Escape');
  await page.locator('.hca7-tools > summary').click();
  await page.locator('.hca7-tools-menu button', { hasText: 'Drag a box' }).click();
  await page.mouse.move(sheet.x + 30, sheet.y + 30); await page.mouse.down(); await page.mouse.move(sheet.x + 330, sheet.y + 230, { steps: 5 }); await page.mouse.up();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Keep with this page' }).click();
  await page.locator('.modal-backdrop button[aria-label="Close dialog"]').first().click();
  await page.waitForTimeout(1200);
  state = await saved(page);
  check('stickers, marker and snips are saved with the page', state?.hcaStamps?.length === 1 && /59$/.test(state?.ink?.at(-1)?.color || '') && state?.hcaSnips?.length === 1 && state.hcaSnips[0].image.startsWith('data:image/jpeg'));
  await page.keyboard.press('Control+k'); await page.keyboard.type('Calculator'); await page.keyboard.press('Enter');
  await page.locator('.hca7-display').fill('(500 × 0.2) ÷ 4 + 2^3'); await page.keyboard.press('Enter');
  const calc = await page.locator('.hca7-display').inputValue();
  await page.locator('.hca7-calc .hca7-tabs button', { hasText: 'Clinical' }).click();
  await page.locator('.hca7-clinical select').selectOption('drip');
  for (const [i, v] of ['1000', '480', '20'].entries()) await page.locator('.hca7-clinical input').nth(i).fill(v);
  check('calculator: keypad and drip rate', calc === '33' && /42 gtt\/min/.test(await page.locator('.hca7-result').innerText()), calc);
  await page.locator('.hca7-calc header button').click();
  await page.keyboard.press('Control+k'); await page.keyboard.type('Meaning'); await page.keyboard.press('Enter');
  await page.locator('.hca7-lookup input').fill('SpO2'); await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  check('Meaning: offline glossary answers', /oxygen saturation/i.test(await page.locator('.hca7-def').innerText().catch(() => '')));
  await page.locator('.hca7-meaning header button').click();
  await page.locator('.hca7-tools > summary').click();
  await page.locator('.hca7-tools-menu button', { hasText: 'PowerPoint, Word' }).click();
  const deck = page.waitForEvent('download');
  await page.getByRole('button', { name: /PowerPoint/ }).click();
  const deckBytes = await (await deck).createReadStream().then(stream => new Promise(done => { const c = []; stream.on('data', d => c.push(d)); stream.on('end', () => done(Buffer.concat(c))); }));
  await page.locator('.modal-backdrop button[aria-label="Close dialog"]').first().click();
  await go(page, 'library');
  await page.getByRole('button', { name: 'Add a source' }).first().click();
  await page.waitForTimeout(400);
  await page.setInputFiles('.file-drop-zone input[type=file]', join(here, 'fixtures', 'sample-deck.pptx'));
  await page.locator('.hca7-choice', { hasText: 'As a PDF' }).click();
  await page.waitForTimeout(3000);
  const asPdf = await page.getByText('sample-deck.pdf').count();
  await page.locator('.modal input[type=checkbox]').first().check();
  await page.getByRole('button', { name: /Add 1 source file/ }).click();
  await page.waitForTimeout(4000);
  const slideText = await page.evaluate(() => [...document.querySelectorAll('[data-hca-page] .textLayer span')].map(s => s.textContent).join(' '));
  const shape = await page.locator('[data-hca-page]').first().boundingBox();
  check('PowerPoint as PDF: wide pages with selectable text', asPdf === 1 && /Heart failure basics/.test(slideText) && shape.width > shape.height, `${Math.round(shape.width)}×${Math.round(shape.height)}`);
  check('export to PowerPoint', deckBytes.length > 2000 && deckBytes.subarray(0, 2).toString() === 'PK', `${deckBytes.length} bytes`);

  // Study desk: board card saved, canvas template, timer badge.
  await page.keyboard.press('Escape');
  const desk = page.locator('.hca8-desk-nav button');
  await desk.nth(0).click();
  const addCard = page.locator('.hca8-add input').first();
  await addCard.fill('Smoke board card'); await addCard.press('Enter');
  await page.locator('.hca8-win button[aria-label^="Close"]').last().click();
  await desk.nth(1).click();
  await page.getByRole('button', { name: 'Concept map (condition)' }).click();
  const nodes = await page.locator('.hca8-node').count();
  await page.locator('.hca8-win button[aria-label^="Close"]').last().click();
  await desk.nth(2).click();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.waitForTimeout(2200);
  const badge = await page.locator('.hca8-badge').count();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.locator('.hca8-win button[aria-label^="Close"]').last().click();
  await page.waitForTimeout(1500);
  const deskState = await saved(page);
  check('study desk: board, canvas and focus timer', nodes >= 5 && badge === 1 && deskState?.hcaBoard?.cards?.some(c => c.title === 'Smoke board card'), `nodes ${nodes}, badge ${badge}`);

  // Phones: nothing wider than the screen.
  for (const width of [360, 390, 414]) {
    const phone = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
    const p = await openApp(phone);
    const wide = [];
    for (const r of ROUTES) { await go(p, r); const w = await p.evaluate(() => document.documentElement.scrollWidth); if (w > width) wide.push(`${r} ${w}px`); }
    check(`no page wider than a ${width}px phone`, wide.length === 0, wide.join(', '));
    await phone.close();
  }
  check('no script errors overall', errors.length === 0, errors[0]);
} catch (e) {
  const shot = join(tmpdir(), 'lumen-smoke-failure.png');
  await page?.screenshot({ path: shot }).catch(() => {});
  check('smoke test ran to the end', false, `${e.message.split('\n')[0]} · screenshot: ${shot}`);
} finally {
  await browser.close();
}

const failed = results.filter(r => !r.ok).length;
console.log(failed ? `\n${failed} check(s) failed.` : `\nAll ${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
