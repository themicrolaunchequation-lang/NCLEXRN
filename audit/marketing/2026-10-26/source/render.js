const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const k of process.argv.slice(2)) {
    await p.goto('file://' + path.resolve('html', k + '.html'), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({ path: path.resolve('pdf', k + '.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true,
      displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: '<div style="font:8px Inter,sans-serif;color:#7A8896;width:100%;padding:0 15mm;display:flex;justify-content:space-between"><span>Healthcare Crown Academy · ' + k + ' marketing plan</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>' });
    console.log('pdf', k);
  }
  await b.close();
})();
