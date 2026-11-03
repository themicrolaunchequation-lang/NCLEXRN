export default async ({p,go,top,shot,T})=>{
await go('/en/register'); await shot('reg',{h1:p.locator('h1'),search:p.locator('main input').first()});
const s=p.locator('main input').first(); await top(s,140); await shot('reg1',{search:s,first:p.locator('main article, main li').first()});
let txt=''; for (const ch of 'Amina'){ txt+=ch; await s.type(ch); await p.waitForTimeout(350); await shot('k'+txt.length,{search:s}); }
await p.waitForTimeout(800); await shot('reg2',{search:s,open:p.getByRole('link',{name:'Open proof page'}).first(),name:T('Amina Rahman')});
await go('/en/honorees/amina-rahman'); await shot('hon',{h1:p.locator('h1').first()});
await go('/en/verify/EVN-DEMO-7Q2K'); await shot('pr0',{h1:p.locator('h1').first(),status:T('Current status')});
await top(T('Record ID'),120); await shot('pr1',{rubric:T('Pilot rubric v0.1'),fp:T('Certificate fingerprint')});
await top(T('Evidence Passport'),90); await shot('pr2',{cav:T('Single site'),wh:T('Raw audit sheets')});
await top(T('Scan to open this record'),120); await shot('pr3',{qr:T('Scan to open this record'),not:T('not professional licensure')});
await go('/en/verify'); const inp=p.locator('main input').first(); await top(inp,200); await shot('v0',{inp,find:p.getByRole('button',{name:'Find record'})});
let t2=''; for (const ch of 'EVN-DEMO-P8WD'){ t2+=ch; await inp.type(ch); if(t2.length%3===0||t2.length===13){ await shot('t'+t2.length,{inp,find:p.getByRole('button',{name:'Find record'})}); } }
await p.getByRole('button',{name:'Find record'}).click(); await p.waitForTimeout(2500); await shot('v1',{h1:p.locator('h1').first()});
console.log('V1',(await p.locator('main').innerText()).slice(0,600));
await go('/en/register'); await p.waitForTimeout(500);
const dc=await p.evaluate(()=>[...document.querySelectorAll('a')].filter(a=>/verify\/EVN/.test(a.href)).map(a=>a.href));
console.log('IDS',dc.join(' '));
};
