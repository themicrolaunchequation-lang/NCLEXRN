async function appEvaluate(p,fn,arg){return p.evaluate(({code,arg})=>window.__MEDLEX_TEST__.evaluate('('+code+')('+JSON.stringify(arg)+')'),{code:fn.toString(),arg})}
async function appWait(p,fn,arg){return p.waitForFunction(({code,arg})=>window.__MEDLEX_TEST__.evaluate('('+code+')('+JSON.stringify(arg)+')'),{code:fn.toString(),arg})}
require('fs').mkdirSync('review/phase1/flows', {
  recursive: true
});
const fs = require('fs'),
  assert = require('assert/strict');
(async () => {
  const c = (await import('@sparticuz/chromium')).default,
    {
      chromium
    } = require('playwright-core'),
    b = await chromium.launch({
      executablePath: process.env.MEDLEX_CHROMIUM || await c.executablePath(),
      args: c.args,
      headless: true
    }),
    p = await b.newPage({
      viewport: {
        width: 390,
        height: 844
      }
    }),
    errors = [],
    checks = {};
  p.on('pageerror', e => errors.push(e.stack));
  await p.goto('file://' + require('path').resolve('dist-test/MedLex.html') + '');
  await p.waitForTimeout(400);
  assert.equal(await p.locator('#onboardingForm input:focus').count(), 1);
  checks.D13 = true;
  await appEvaluate(p, () => {
    closeModal();
    state.reduced = true;
    applyPreferences();
  });
  await p.keyboard.press('Control+k');
  await p.locator('#globalSearch').fill('card');
  const palette = await appEvaluate(p, () => ({
    title: $('#modalTitle').getBoundingClientRect().bottom,
    input: $('#globalSearch').getBoundingClientRect().top,
    w: modal.getBoundingClientRect().width
  }));
  assert(palette.input >= palette.title);
  assert(palette.w >= 388);
  checks.D6 = true;
  await appEvaluate(p, () => closeModal());
  assert(await p.locator('.search-trigger .search-glyph').isVisible());
  assert(await p.locator('.search-trigger').getAttribute('aria-labelledby'));
  checks.D15 = true;
  assert.equal(await p.locator('#sidebar .workspace').count(), 0);
  await p.locator('#profileInitial').click();
  await p.locator('.account-links a[href="#settings"]').click();
  await appWait(p, () => route === 'settings');
  assert(await p.locator('#profileForm').count());
  checks.D7 = true;
  assert.equal(await p.locator('#themeButton svg').count(), 1);
  assert.match(await p.locator('#themeButton').getAttribute('aria-label'), /^Theme: (System|Light|Dark)$/);
  checks.D8 = true;
  await appEvaluate(p, () => {
    location.hash = 'learn/module/ch1/classroom';
    render();
  });
  await p.waitForTimeout(150);
  assert(await appEvaluate(p, () => $('#moduleBody').getBoundingClientRect().top < 450));
  assert(await appEvaluate(p, () => $('.module-tabs').scrollHeight < 80 && $('.module-tabs').scrollWidth > $('.module-tabs').clientWidth));
  assert.equal(await p.locator('.module-actions').count(), 0);
  assert.equal(await p.locator('[data-workspace=blank]').count(), 0);
  assert((await p.locator('[data-workspace=open]').first().textContent()).includes('Start worksheet'));
  checks.D18 = true;
  await p.locator('[data-workspace=open]').first().click();
  await appWait(p, () => route === 'worksheet');
  assert(!(await p.locator('dialog[open]').count()));
  assert((await p.url()).includes('/activity/classroom/0/sheet/'));
  await p.locator('[data-worksheet-field=words]').fill('A focused set of five terms');
  await p.locator('[data-sheet=next]').click();
  await p.locator('[data-worksheet-field=grid0_2]').waitFor();
  const cols = await appEvaluate(p, () => [...$('.worksheet-table tbody tr').querySelectorAll('textarea')].map(e => {
    const r = e.getBoundingClientRect();
    return {
      x: r.x,
      w: r.width,
      right: r.right,
      label: e.getAttribute('aria-label')
    };
  }));
  assert.equal(cols.length, 3);
  assert(cols.every(r => r.right <= 391 && r.x >= 0 && r.w > 300));
  checks.D1 = true;
  assert.equal(await p.locator('.mobile-cell-label').first().isVisible(), true);
  assert(!(await p.locator('.sr-only').filter({
    hasText: 'Row 1'
  }).count()));
  checks.D3 = true;
  assert((await p.locator('[data-sheet=next]').textContent()).includes('Next: Verify'));
  checks.D4 = true;
  await p.locator('[data-worksheet-field=grid0_2]').fill('A checked component meaning');
  await p.locator('[data-worksheet-field=attempt]').fill('Fictional response before reference check');
  await p.keyboard.press('Escape');
  assert(await appEvaluate(p, () => route === 'worksheet' && activeWorksheet.step === 1));
  await p.keyboard.press('Control+Enter');
  await appWait(p, () => activeWorksheet.step === 2);
  await p.goBack();
  await appWait(p, () => activeWorksheet?.step === 1);
  await appEvaluate(p, () => flushPendingSave());
  const deep = p.url();
  await p.reload();
  await appWait(p, () => route === 'worksheet' && activeWorksheet.step === 1);
  assert.equal(await p.locator('[data-worksheet-field=attempt]').inputValue(), 'Fictional response before reference check');
  assert.equal(p.url(), deep);
  checks.D2 = true;
  await appEvaluate(p, () => {
    window.realSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === 'medlex-v3') throw new DOMException('full', 'QuotaExceededError');
      return realSet.call(this, k, v);
    };
  });
  await p.locator('[data-worksheet-field=attempt]').fill('Unsaved but recoverable draft');
  await appWait(p, () => $('#worksheetStatus')?.textContent.includes('Not saved'));
  const download = p.waitForEvent('download');
  await p.locator('#worksheetStatus [data-sheet=filled]').click();
  const exported = await download;
  await exported.saveAs('review/phase1/flows/recovery-worksheet.html');
  assert(fs.readFileSync('review/phase1/flows/recovery-worksheet.html', 'utf8').includes('Unsaved but recoverable draft'));
  await appEvaluate(p, () => {
    Storage.prototype.setItem = realSet;
    flushPendingSave();
  });
  await appWait(p, () => $('#worksheetStatus')?.textContent.startsWith('Saved'));
  checks.storageFailure = true;
  await p.locator('[data-sheet=next]').click();
  await appWait(p, () => activeWorksheet.step === 2);
  await p.locator('[data-worksheet-field=verification]').fill('Checked the original companion record.');
  await p.locator('[data-sheet=next]').click();
  await appWait(p, () => activeWorksheet.step === 3);
  await p.locator('[data-worksheet-field=evidence]').fill('A reflection for my educator');
  const count = await appEvaluate(p, () => xp().artifacts.length);
  await p.locator('[data-sheet=save]').click();
  assert.equal(await appEvaluate(p, () => xp().artifacts.length), count + 1);
  assert.equal(await appEvaluate(p, () => Object.values(course.activities).filter(Boolean).length), 0);
  await p.locator('.worksheet-sticky-footer a').click();
  await appWait(p, () => route === 'module');
  assert((await p.locator('[data-workspace=open]').first().textContent()).includes('Continue worksheet'));
  assert.equal(await p.locator('[data-workspace=blank]').count(), 1);
  checks.D5 = true;
  await p.setViewportSize({
    width: 1440,
    height: 900
  });
  await appEvaluate(p, () => {
    activeWorksheet.step = 1;
    renderWorksheet();
  });
  assert.equal(await p.locator('.mobile-cell-label').first().isVisible(), false);
  await appEvaluate(p, () => {
    location.hash = 'today';
    render();
  });
  await p.waitForTimeout(100);
  const tops = await appEvaluate(p, () => ['.quick-grid', '.system-carousel'].map(s => [...$(s).children].map(e => Math.round(e.getBoundingClientRect().top))));
  assert(tops.every(a => a.every(t => t === a[0])));
  checks.D10 = true;
  await appEvaluate(p, () => {
    location.hash = 'practice';
    render();
  });
  assert(!(await p.locator('main').textContent().then(s => s.includes('“Got it” schedules'))));
  await appEvaluate(p, () => {
    startFlash('all');
    flash.revealed = true;
    renderFlash();
  });
  const value = await appEvaluate(p, () => reviewPrediction(flash.list[flash.index].id, 3).interval),
    id = await appEvaluate(p, () => flash.list[flash.index].id);
  const label = await appEvaluate(p, () => formatInterval(reviewPrediction(flash.list[flash.index].id, 3).interval));
  assert((await p.locator('[data-action=rate][data-id="3"]').textContent()).includes(label));
  await p.locator('[data-action=rate][data-id="3"]').click();
  assert.equal(await appEvaluate(p, id => state.reviews[id].interval, id), value);
  checks.D9 = true;
  await appEvaluate(p, () => {
    state.theme = 'dark';
    applyPreferences();
    location.hash = 'learn/module/ch1/classroom';
    render();
  });
  assert.equal(await appEvaluate(p, () => getComputedStyle($('.activity-art')).overflow), 'hidden');
  checks.D11 = true;
  assert.notEqual(await appEvaluate(p, () => getComputedStyle($('.activity-art>rect')).fill), 'rgb(231, 241, 236)');
  assert.notEqual(await appEvaluate(p, () => getComputedStyle($('.hca-crest')).backgroundColor), 'rgba(0, 0, 0, 0)');
  checks.D12 = true;
  await p.setViewportSize({
    width: 390,
    height: 844
  });
  await appEvaluate(p, () => {
    location.hash = 'today';
    render();
  });
  assert(await appEvaluate(p, () => {
    const r = $('.goal-orb').getBoundingClientRect();
    return [...$('.goal-orb').children].every(e => e.getBoundingClientRect().right <= r.right);
  }));
  checks.D14 = true;
  await appEvaluate(p, () => {
    v3.achievements = {};
    trackItem();
  });
  assert((await p.locator('#toast').textContent()).includes('First answer saved'));
  assert.equal(await p.locator('#toast').getAttribute('aria-live'), 'polite');
  checks.D17 = true;
  await appEvaluate(p, () => {
    location.hash = 'learn/module/ch1/classroom';
    render();
  });
  await p.locator('[data-workspace=open]').first().click();
  await appWait(p, () => route === 'worksheet');
  await p.addScriptTag({
    path: require.resolve('axe-core/axe.min.js')
  });
  const audits = [];
  for (const theme of ['light', 'dark', 'high']) for (const width of [390, 1440]) for (const step of [0, 1, 2, 3]) {
    await p.setViewportSize({
      width,
      height: width === 390 ? 844 : 900
    });
    await appEvaluate(p, ({
      theme,
      step
    }) => {
      state.theme = theme === 'high' ? 'light' : theme;
      v3.profile.highContrast = theme === 'high';
      applyPreferences();
      activeWorksheet.step = step;
      renderWorksheet();
      window.scrollTo(0, 0);
    }, {
      theme,
      step
    });
    await p.waitForTimeout(40);
    const r = await appEvaluate(p, () => axe.run());
    audits.push({
      theme,
      width,
      step,
      violations: r.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.slice(0, 3).map(n => ({
          target: n.target,
          summary: n.failureSummary
        }))
      }))
    });
    if (r.violations.length) console.log(JSON.stringify(audits.at(-1)));
    if (theme !== 'high') await p.screenshot({
      path: `review/phase1/flows/after-worksheet-${step}-${width}-${theme}.png`,
      fullPage: true
    });
  }
  fs.writeFileSync('review/phase1/flows/flow-results.json', JSON.stringify({
    checks,
    errors,
    audits
  }, null, 2));
  await b.close();
  console.log(JSON.stringify({
    checks,
    errors,
    audits: audits.length
  }));
  if (errors.length || audits.some(a => a.violations.length)) process.exitCode = 1;
})().catch(e => {
  console.error(e);
  process.exit(1);
});
