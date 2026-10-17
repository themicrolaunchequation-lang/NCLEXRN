async function appEvaluate(p,fn,arg){return p.evaluate(({code,arg})=>window.__MEDLEX_TEST__.evaluate('('+code+')('+JSON.stringify(arg)+')'),{code:fn.toString(),arg})}
async function appWait(p,fn,arg){return p.waitForFunction(({code,arg})=>window.__MEDLEX_TEST__.evaluate('('+code+')('+JSON.stringify(arg)+')'),{code:fn.toString(),arg})}
require('fs').mkdirSync('review/phase1/flows', {
  recursive: true
});
const fs = require('fs');
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
    p = await b.newPage();
  await p.goto('file://' + require('path').resolve('dist-test/MedLex.html') + '');
  await p.waitForTimeout(300);
  await appEvaluate(p, () => {
    if (modal.open) closeModal();
    state.reduced = true;
    applyPreferences();
  });
  await p.addScriptTag({
    path: require.resolve('axe-core/axe.min.js')
  });
  const audits = [];
  for (const width of [390, 1440]) for (const theme of ['light', 'dark', 'high']) {
    await p.setViewportSize({
      width,
      height: width === 390 ? 844 : 900
    });
    await appEvaluate(p, theme => {
      if (modal.open) closeModal();
      state.theme = theme === 'high' ? 'light' : theme;
      v3.profile.highContrast = theme === 'high';
      applyPreferences();
    }, theme);
    for (const state of ['search', 'onboarding', 'account']) {
      await appEvaluate(p, state => {
        if (modal.open) closeModal();
        if (state === 'search') {
          search();
          groupedSearch('card');
          $('#globalSearch').value = 'card';
        }
        if (state === 'onboarding') startOnboarding(0);
        if (state === 'account') accountMenu();
      }, state);
      const audit = await appEvaluate(p, () => axe.run());
      audits.push({
        width,
        theme,
        state,
        violations: audit.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.slice(0, 3).map(n => ({
            target: n.target,
            summary: n.failureSummary
          }))
        }))
      });
      if (audit.violations.length) console.log(JSON.stringify(audits.at(-1)));
      if (theme !== 'high') await p.screenshot({
        path: `review/phase1/flows/after-${state}-${width}-${theme}.png`
      });
    }
  }
  await appEvaluate(p, () => {
    closeModal();
    state.theme = 'light';
    v3.profile.highContrast = false;
    v3.profile.textScale = 1.5;
    applyPreferences();
    location.hash = 'learn/module/ch1/classroom';
    render();
  });
  for (const width of [390, 768, 1440]) {
    await p.setViewportSize({
      width,
      height: 844
    });
    audits.push({
      textScale: 1.5,
      width,
      overflow: await appEvaluate(p, () => document.documentElement.scrollWidth > innerWidth)
    });
  }
  fs.writeFileSync('review/phase1/flows/modal-audit.json', JSON.stringify(audits, null, 2));
  await b.close();
  console.log(JSON.stringify({
    checks: audits.length,
    failures: audits.filter(x => x.overflow || x.violations?.length).length
  }));
  if (audits.some(x => x.overflow || x.violations?.length)) process.exitCode = 1;
})().catch(e => {
  console.error(e);
  process.exit(1);
});
