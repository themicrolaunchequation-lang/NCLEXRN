import test from 'node:test';
import assert from 'node:assert/strict';
import {PROFILES} from '../data/exam-profiles.js';
import {eligibleItem,assembleMock,formativeScore} from '../engine/assessment-engine.js';

const fixture=(id,domain,approvedFor='snle')=>({
 id,domain,stem:'This is a deliberately synthetic software-test case without clinical content.',
 options:['A','B','C','D'].map(label=>({label,text:'Synthetic '+label})),key:'A',
 rationale:'Synthetic educational test rationale.',
 approval:{status:'APPROVED',signedOff:true,reviewerId:'TEST-FIXTURE-NOT-A-CLINICIAN',reviewedAt:'2026-10-23',evidenceUrl:'https://example.org/test-fixture',
 approvedFor:[approvedFor],jurisdictionReview:{[approvedFor]:{status:'APPROVED',reviewerId:'TEST-FIXTURE',reviewedAt:'2026-10-23'}}}
});
test('unreviewed items and destination-mismatched items are rejected',()=>{
 const x=fixture('x','adult');assert.equal(eligibleItem(x,'snle'),true);
 assert.equal(eligibleItem(x,'qatar'),false);
 x.approval.status='PENDING';assert.equal(eligibleItem(x,'snle'),false);
});
test('all four real profiles remain blocked from full mocks',()=>{
 for(const p of Object.values(PROFILES))assert.equal(assembleMock(p,[],{ownerApprovedRelease:true}).ready,false);
});
test('blueprint exactness and honest scoring work with explicitly synthetic fixtures',()=>{
 const p={...PROFILES.snle,questions:4,minutes:4,publishable:true,blocks:null,domains:PROFILES.snle.domains.map(x=>({...x,count:1}))};
 const items=p.domains.map((d,i)=>fixture('test-'+i,d.key));
 const denied=assembleMock(p,items);assert.equal(denied.ready,false);
 const allowed=assembleMock(p,items,{ownerApprovedRelease:true,rng:()=>0.5});
 assert.equal(allowed.ready,true);assert.equal(allowed.questionCount,4);
 const r=formativeScore(allowed,Object.fromEntries(items.map(x=>[x.id,'A'])));
 assert.equal(r.correct,4);assert.equal(r.practiceAccuracyPercent,100);assert.equal(r.passPrediction,null);assert.equal(r.officialResult,null);
});
test('a jurisdiction with even one insufficient category cannot silently substitute unrelated content',()=>{
 const p={...PROFILES.snle,questions:4,minutes:4,publishable:true,blocks:null,domains:PROFILES.snle.domains.map(x=>({...x,count:1}))};
 const items=p.domains.slice(0,3).map((d,i)=>fixture('test-'+i,d.key));
 const result=assembleMock(p,items,{ownerApprovedRelease:true});
 assert.equal(result.ready,false);assert.equal(result.reason,'APPROVED_ITEM_SHORTAGE');assert.equal(result.domain,'management');
});

import {PROFILES as PR,RETAKE_NOTES as RN,CONTENT_POLICY as CP,assertBlueprint as AB} from '../data/exam-profiles.js';
import {test as t2} from 'node:test';
import assert2 from 'node:assert/strict';
t2('DHA profile uses verified headline spec but stays blocked without weights',()=>{
 assert2.equal(PR.dubai.questions,150);assert2.equal(PR.dubai.minutes,180);
 assert2.equal(AB(PR.dubai).valid,false);assert2.ok(PR.dubai.domains.every(d=>d.count===null));
});
t2('DOH weights remain unspecified and retake notes avoid a single settled figure',()=>{
 assert2.ok(PR.abudhabi.domains.every(d=>d.count===null));
 assert2.match(RN.snle,/not a lifetime maximum/);assert2.match(RN.qatar,/Pending/);
});
t2('content policy disclaims official provenance and recalled questions',()=>{
 assert2.match(CP,/original educational material/);assert2.match(CP,/No official authorization/);assert2.doesNotMatch(CP,/prohibit/i);
});
