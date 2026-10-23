#!/usr/bin/env node
// Offline inventory crosswalk. This program does NOT approve or republish questions.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../../..');
const snle=path.join(repo,'apps/snle');
const archive=fs.readFileSync(path.join(snle,'source/original.html.gz'));
const original=zlib.gunzipSync(archive);
const provenance=JSON.parse(fs.readFileSync(path.join(snle,'source/provenance.json'),'utf8'));
const digest=crypto.createHash('sha256').update(original).digest('hex');
if(digest!==provenance.sha256) throw new Error('Refusing to inventory: SNLE archive hash mismatch');
const html=original.toString('utf8').replace(/\r\n/g,'\n');
const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].map(m=>m[2]);
if(scripts.length!==3) throw new Error('Unexpected original SNLE scripts');
const context={window:{}};
vm.runInNewContext(scripts[0],context,{timeout:15000});
const questions=JSON.parse(JSON.stringify(context.window.SNLE_QUESTIONS));
const posters=JSON.parse(JSON.stringify(context.window.SNLE_POSTERS));
if(questions.length!==1350 || posters.length!==67) throw new Error('Original inventory cardinality changed');
const normalize=x=>String(x??'').trim();
const risk=/scope|delegat|independent|consent|legal|mandatory|medication|drug|high.alert|dose|infus|transfus|resus|arrest|cpr|obstet|fetal|pregnan|neonat|pediatric|paediatric|suicid|restraint|report|safeguard|isolation|licen|profession/i;
const fields=['original_question_id','source_domain','source_topic','source_construct','high_risk_flag','sa_snle','qa_dhp','ae_dha','ae_doh','required_action','reviewer_id','review_date','evidence_url','clinical_approval','notes'];
const itemRows=questions.map((q,i)=>{
 const questionId=normalize(q.id)||'MISSING_ID_'+i,domain=normalize(q.domain||q.blueprintDomain||q.area),topic=normalize(q.topic||q.family||q.specialty),construct=normalize(q.construct||q.process||q.judgment);
 const combined=[q.stem,domain,topic,construct,q.rationale].map(normalize).join(' ');
 return [questionId,domain,topic,construct,risk.test(combined)?'HIGH_PRIORITY_REVIEW':'STANDARD_REVIEW',...Array(4).fill('PENDING_CLINICAL_AND_REGULATORY_REVIEW'),'VERIFY_KEY_RATIONALE_REFERENCES_AND_LOCAL_SCOPE','','','','PENDING',''];
});
const posterFields=['original_poster_id','title','clinical_job','local_policy_sensitive','sa_snle','qa_dhp','ae_dha','ae_doh','reviewer_id','evidence_url','clinical_approval'];
const posterRows=posters.map((p,i)=>{
 const desc=normalize(p.job||p.boundary||'');
 return [normalize(p.id)||'MISSING_ID_'+i,normalize(p.title),desc,risk.test([p.title,desc,p.boundary].join(' '))?'HIGH_PRIORITY_REVIEW':'STANDARD_REVIEW',...Array(4).fill('PENDING_CLINICAL_AND_REGULATORY_REVIEW'),'','','PENDING'];
});
function csv(rows){return rows.map(row=>row.map(v=>'"'+normalize(v).replace(/"/g,'""')+'"').join(',')).join('\n')+'\n'}
const out=path.join(repo,'apps/gulf/reports/generated');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'question-crosswalk-review-queue.csv'),csv([fields,...itemRows]));
fs.writeFileSync(path.join(out,'poster-crosswalk-review-queue.csv'),csv([posterFields,...posterRows]));
const groups={};for(const row of itemRows){const d=row[1]||'UNCLASSIFIED';groups[d]=(groups[d]||0)+1}
const summary={generatedAt:new Date().toISOString(),originalSourceSha256:digest,totalQuestions:itemRows.length,totalPosters:posterRows.length,domains:groups,highPriorityQuestionReviewCount:itemRows.filter(x=>x[4]==='HIGH_PRIORITY_REVIEW').length,approvedQuestions:0,reviewStatus:'ALL_UNREVIEWED',note:'Risk flags are heuristics and statuses represent a review queue, not approved destination items.'};
fs.writeFileSync(path.join(out,'inventory-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
