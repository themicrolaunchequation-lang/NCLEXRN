import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PROFILES,ORDER,DOMAIN_KEYS,assertBlueprint} from '../data/exam-profiles.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('four distinct exam profiles, not auto-published',()=>{
 assert.equal(ORDER.length,4);assert.equal(new Set(ORDER).size,4);
 for(const id of ORDER){const p=PROFILES[id];assert(p);assert.equal(p.id,id);assert.equal(p.publishable,false);assert(p.sources.every(s=>new URL(s.url).protocol==='https:'))}
});
test('SNLE source model preserves scaled scoring and two blocks',()=>{
 const p=PROFILES.snle;assert.equal(p.questions,200);assert.equal(p.minutes,240);assert.equal(p.breakMinutes,30);
 assert.deepEqual(p.blocks.map(b=>b.questions),[100,100]);assert.equal(p.passingType,'scaled');assert.equal(assertBlueprint(p).valid,true);
 assert.deepEqual(p.domains.map(x=>x.count),[40,80,60,20]);
});
test('Qatar DHP counts are exact but full simulation remains blocked until duration conflict resolves',()=>{
 const p=PROFILES.qatar;assert.equal(p.questions,150);assert.equal(p.minutes,180);
 assert.deepEqual(p.domains.map(x=>x.count),[30,61,44,15]);assert.equal(p.domains.reduce((n,d)=>n+d.count,0),150);
 assert.equal(assertBlueprint(p).valid,false);assert.equal(p.verification,'DURATION_CONFLICT');
});
test('DHA headline spec is verified (Sep 2026 guideline); DHA and DOH weights stay unspecified',()=>{
 const dha=PROFILES.dubai;assert.equal(dha.questions,150);assert.equal(dha.minutes,180);
 const doh=PROFILES.abudhabi;assert.equal(doh.questions,150);assert.equal(doh.minutes,180);
 for(const p of [dha,doh]){assert(p.domains.every(x=>x.count===null));assert.equal(assertBlueprint(p).valid,false)}
});
test('shared app is independent from original SNLE storage and login',()=>{
 const app=fs.readFileSync(path.join(ROOT,'app.js'),'utf8');
 assert(app.includes('gulf-planner-v1:'));assert(!app.includes('snle-react-interact-progress-v1'));
 assert(!app.includes('supabase.auth'));assert(!app.includes('CLOUDFLARE_API_TOKEN'));
 const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
 for(const id of ['overview','editions','comparison','governance','roadmap'])assert(html.includes('id="'+id+'"'));
 assert(html.includes('Draft — pending independent clinical and regulatory review.'));
 assert(!html.includes('billing.stripe.com'));
});
