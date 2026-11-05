import { createRequire } from 'node:module'; const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }); const p = await br.newPage();
await p.goto('file://'+process.cwd()+'/guide.html'); await p.evaluate(()=>document.fonts.ready);
await p.pdf({path:'HCA-Social-Publishing-Guide.pdf', format:'A4', printBackground:true, displayHeaderFooter:true, headerTemplate:'<span></span>', footerTemplate:'<div style="font-size:8px;width:100%;text-align:center;color:#64748b">Healthcare Crown Academy · Social Publishing Pack · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>', margin:{top:'14mm',bottom:'16mm',left:'14mm',right:'14mm'}});
await br.close();
