import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const id = process.argv[2] || 'tide', secs = +process.argv[3] || 45;
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server','--ignore-certificate-errors','--host-resolver-rules=MAP *.healthcarecrownacademy.co.uk 127.0.0.1:8443','--autoplay-policy=no-user-gesture-required'] });
const page = await (await br.newContext({ viewport:{width:1440,height:900}, ignoreHTTPSErrors:true })).newPage();
await page.addInitScript(()=>{
  window.__log=[]; const t0=()=>Math.round(performance.now()-(window.__t||0));
  const voices=[{name:'Fake',lang:'en-GB',localService:true,default:true}];
  const ss={speaking:false,pending:false,paused:false,getVoices:()=>voices,onvoiceschanged:null,addEventListener(){},removeEventListener(){},
    speak(u){ const dur=Math.max(400,u.text.length*68/(u.rate||1)); window.__log.push(['say',t0(),u.text,Math.round(dur)]); ss.speaking=true; setTimeout(()=>{ss.speaking=false; u.onend&&u.onend({})},dur); u.onstart&&setTimeout(()=>u.onstart({}),10)},
    cancel(){ window.__log.push(['cancel',t0()]); ss.speaking=false }, pause(){}, resume(){} };
  Object.defineProperty(window,'speechSynthesis',{value:ss,configurable:true});
  window.SpeechSynthesisUtterance=function(t){this.text=t;this.rate=1;this.pitch=1;this.volume=1};
});
await page.goto('https://serein.healthcarecrownacademy.co.uk/#today'); await page.waitForTimeout(1500);
for(let i=0;i<3;i++){const s=page.locator('dialog[open] [data-sh="skip"], dialog[open] [data-v5="welcome-skip"]'); if(!(await s.count()))break; await s.first().click({force:true}); await page.waitForTimeout(600);}
await page.locator(`[data-practice="${id}"]`).first().click(); await page.waitForTimeout(1200);
await page.evaluate(()=>{window.__t=performance.now(); window.__log.length=0;
  setInterval(()=>{const c=document.querySelector('#sp-timeline [data-state=current]'); const n=c?c.textContent.trim().replace(/\s+/g,' '):''; const L=window.__log; if(!L.__ph||L.__ph!==n){L.__ph=n;L.push(['PHASE',Math.round(performance.now()-window.__t),n, document.querySelector('#player-cue')?.textContent])}},100);});
await page.getByRole('button',{name:/Begin practice/}).click();
await page.waitForTimeout(secs*1000);
const log=await page.evaluate(()=>window.__log.slice());
for(const l of log) console.log(String(l[1]).padStart(6), l[0].padEnd(6), (l[2]||'').slice(0,70), l[3]!==undefined?'| '+String(l[3]).slice(0,50):'');
await br.close();
