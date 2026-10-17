const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.join(__dirname,'..'),dist=path.join(root,'dist');
const ctx={console,performance,Set};ctx.globalThis=ctx;vm.createContext(ctx);for(let f of ['data.js','engine.js'])vm.runInContext(fs.readFileSync(path.join(dist,f),'utf8'),ctx);
const D=ctx.Serein.data,E=ctx.Serein.engine;
assert.equal(D.practices.length,15);assert.equal(new Set(D.practices.map(p=>p.id)).size,15);assert.equal(D.resources.length,14);assert.equal(D.reflections.length,8);
let checks=4;
for(let budget of [60,120,300]){let matches=E.matchPractices(D.practices,{budget});for(let p of matches)assert(p.selfPaced||E.chooseDuration(p,budget)<=budget);checks++;}
assert(!E.matchPractices(D.practices,{budget:120}).some(p=>p.id==='pause3'));checks++;
assert(E.matchPractices(D.practices,{style:'nonbreath',budget:0}).every(p=>!p.breathFocus));assert(E.matchPractices(D.practices,{style:'ground',budget:0}).every(p=>p.category==='Grounding'));assert(E.matchPractices(D.practices,{position:'still',budget:0}).every(p=>!p.movement));checks+=3;
for(let p of D.practices){
 assert(p.steps.length>0);assert(fs.existsSync(path.join(dist,p.photo)),p.id+' media missing');
 for(let pair of p.photoPlan){assert(D.frames[pair[0]][pair[1]]);assert(fs.existsSync(path.join(dist,D.frames[pair[0]][pair[1]])));}
 let e=new E.SessionEngine(p);assert.equal(e.state,'ready');e.play(1000);if(e.duration){e.tick(1500);assert.equal(e.elapsed,.5);e.pause(2000);assert.equal(e.elapsed,1);e.tick(5000);assert.equal(e.elapsed,1);e.play(5000);e.tick(6000);assert.equal(e.elapsed,2);e.seek(e.duration);assert.equal(e.state,'complete');e.seek(0);assert.equal(e.state,'paused');}else{for(let i=0;i<p.steps.length;i++)e.next();assert.equal(e.state,'complete');}e.restart();assert.equal(e.elapsed,0);assert.equal(e.state,'ready');checks++;
}
for(let r of D.resources){assert(fs.existsSync(path.join(dist,r.image)));assert(r.steps.length>0);}
for(let f of ['app.js','data.js','engine.js','orb.js'])new vm.Script(fs.readFileSync(path.join(dist,f),'utf8'),{filename:f});checks+=4;
const css=fs.readFileSync(path.join(dist,'styles.css'),'utf8'),html=fs.readFileSync(path.join(dist,'index.html'),'utf8');assert(css.includes('#10253A')&&css.includes('#087D7A')&&css.includes('#F8F5EF'));assert(html.includes('17501904')&&html.includes('ZC273259'));assert(fs.readFileSync(path.join(dist,'assets/serein-crest.svg'),'utf8').includes('>S</text>'));checks+=3;
console.log(`${checks} catalogue, preference, duration, timing, media, syntax and HCA identity checks passed.`);
