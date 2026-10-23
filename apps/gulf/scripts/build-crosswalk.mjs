#!/usr/bin/env node
// Generates UNREVIEWED crosswalk queues; not a clinical validation or publication license.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const snle=path.join(ROOT,'apps/snle');
const out=path.join(ROOT,'apps/gulf/reports/generated');
const original=zlib.gunzipSync(fs.readFileSync(path.join(snle,'source/original.html.gz')));
const prov=JSON.parse(fs.readFileSync(path.join(snle,'source/provenance.json'),'utf8'));
const digest=crypto.createHash('sha256').update(original).digest('hex');
if(digest!==prov.sha256)throw Error('Original SNLE SHA-256 provenance mismatch');
const html=original.toString('utf8').replace(/\r\n/g,'\n');
const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].map(m=>m[2]);
if(scripts.length!==3)throw Error('Unexpected original script count');
const ctx={window:{}};vm.runInNewContext(scripts[0],ctx,{timeout:15000});
const Q=JSON.parse(JSON.stringify(ctx.window.SNLE_QUESTIONS));
const P=JSON.parse(JSON.stringify(ctx.window.SNLE_POSTERS));
if(Q.length!==1350||P.length!==67)throw Error('Unexpected question/poster count');
const SA=/\b(?:Saudi(?:\s+Arabia)?|SCFHS|Kingdom of Saudi Arabia|KSA|Mumaris(?:\+)?|Saudi\s+(?:scope|nursing|health|regulation|law|professional))\b/i;
const LOCAL=/scope[-\s]of[-\s]practice|delegat|consent|reporting|mandatory|\blegal\b|\blaw\b|licen[sc]|authoriz|\bethic|prescrib|independent\s+nursing|\bpolicy\b|\bprotocol\b|\bregulation\b|restrain|safeguard|\bcontrolled\s+drug\b|nurse[-\s]practitioner|\bprofessional\s+classification\b/i;
const text=x=>String(x??'');
const excerpt=(s,rx)=>{const m=rx.exec(s);return m?s.slice(Math.max(0,m.index-65),Math.min(s.length,m.index+85)).replace(/\s+/g,' '):''};
const csv=rows=>rows.map(row=>row.map(value=>'"'+text(value).replace(/"/g,'""')+'"').join(',')).join('\n')+'\n';
const SIGNALS={
 'US-regulator/system':/\b(?:911|HIPAA|OSHA|Medicare|Medicaid|\bCDC\b|\bFDA\b|Joint Commission|state board|NCLEX)\b/i,
 'Units/lab convention':/\bmg\/dL\b|\bmmol\/L\b|\bmEq\/L\b|\bfahrenheit\b|\b°F\b|\blbs?\b|\binch(?:es)?\b/i,
 'Drug-name variant':/\b(?:acetaminophen|paracetamol|epinephrine|adrenaline|albuterol|salbutamol|norepinephrine|noradrenaline|meperidine|pethidine|furosemide|frusemide)\b/i,
 'Immunisation/screening schedule':/\b(?:vaccin|immuni[sz]|booster|screening schedule|newborn screen)\w*/i,
 'Cultural/religious care':/\b(?:Ramadan|prayer|halal|fasting|Hajj|modest|chaperon|same[-\s]gender|family decision)\b/i,
 'Emergency number/escalation':/\b(?:rapid response|code (?:blue|red)|call (?:the )?(?:doctor|provider|physician)|chain of command)\b/i
};
const sigOf=src=>Object.entries(SIGNALS).filter(([,rx])=>rx.test(src)).map(([k])=>k);
const counts={Core:0,'SA-only':0,unclear:0},posterCounts={Core:0,'SA-only':0,unclear:0},domainCounts={};
const rows=[],tools=[],saudi=[];
for(const q of Q){
 const src=[q.stem,q.answerText,q.rationale,...q.options.map(o=>o.text)].map(text).join(' ');
 const sa=SA.test(src),local=LOCAL.test(src),tag=sa?'SA-only':local?'unclear':'Core';counts[tag]++;
 domainCounts[q.domain]=(domainCounts[q.domain]||0)+1;
 rows.push([q.id,tag,q.domain,q.subdomain,q.toolName,q.process,q.construct,q.population,q.setting,q.hyp,q.difficulty,sa?'EXPLICIT_SAUDI_WORDING':local?'POSSIBLE_LOCAL_SCOPE_OR_POLICY':'NO_EXPLICIT_LOCAL_FLAG',sa?excerpt(src,SA):local?excerpt(src,LOCAL):'','UNREVIEWED','PENDING','PENDING','PENDING','PENDING','','','NOT_FOR_RELEASE']);
 if(sa)saudi.push([q.id,q.domain,q.toolName,'Saudi-specific wording',excerpt(src,SA),'Must rewrite or exclude for destination']);
}
for(const p of P){
 const src=[p.title,p.job,p.boundary,p.pearl,p.trap].join(' '),sa=SA.test(src),local=LOCAL.test(src),tag=sa?'SA-only':local?'unclear':'Core';posterCounts[tag]++;
 tools.push([p.id,p.title,p.groupLabel,tag,sa?excerpt(src,SA):local?excerpt(src,LOCAL):'',p.questionIds.length,'UNREVIEWED','PENDING','PENDING','PENDING','PENDING']);
}

const sigRows=Q.map(q=>sigOf([q.stem,q.answerText,q.rationale,...q.options.map(o=>o.text)].map(text).join(' ')));
rows.forEach((r,i)=>r.push(sigRows[i].join('; ')));
const sigCounts={};sigRows.forEach(a=>a.forEach(k=>sigCounts[k]=(sigCounts[k]||0)+1));
// Review priority: 1 = explicit Saudi wording; 2 = Core/unclear item with jurisdiction signal; 3 = unclear policy words only; 4 = clean Core (spot-check sample only).
const prio=rows.map((r,i)=>r[1]==='SA-only'?1:sigRows[i].length?2:r[1]==='unclear'?3:4);
rows.forEach((r,i)=>r.push(prio[i]));
// Deterministic stratified spot-check of "clean" Core items (every 17th per domain) so the 75% figure is tested, not assumed.
const sample=[];const seen={};rows.forEach((r,i)=>{if(prio[i]===4){const d=r[2];seen[d]=(seen[d]||0)+1;if(seen[d]%17===1)sample.push(r.slice(0,5).concat([r[11],'CORE_SPOT_CHECK','']))}});
fs.mkdirSync(out,{recursive:true});
const headers=['question_id','triage_tag','snle_domain','subdomain','tool_name','process','construct','population','setting','hyp_score_editorial','difficulty_editorial','reason_code','source_wording_excerpt','clinical_review','sa_snle','qa_dhp','ae_dha','ae_doh','reviewer','reference_url','release_status','jurisdiction_signals','review_priority'];
fs.writeFileSync(path.join(out,'question-crosswalk-review-queue.csv'),csv([headers,...rows]));
fs.writeFileSync(path.join(out,'poster-crosswalk-review-queue.csv'),csv([['poster_id','title','group','triage_tag','flag_excerpt','linked_question_count','clinical_review','sa_snle','qa_dhp','ae_dha','ae_doh'],...tools]));
fs.writeFileSync(path.join(out,'saudi-specific-wording.csv'),csv([['question_id','domain','tool_name','reason','excerpt','proposed_action'],...saudi]));
fs.writeFileSync(path.join(out,'core-spot-check-sample.csv'),csv([['question_id','triage_tag','snle_domain','subdomain','tool_name','reason_code','purpose','reviewer_verdict'],...sample]));
const summary={runDate:new Date().toISOString(),source_sha256:digest,questionCount:Q.length,posterCount:P.length,questionTagCounts:counts,posterTagCounts:posterCounts,domainCounts,saudiWordingCount:saudi.length,jurisdictionSignalCounts:sigCounts,priorityCounts:prio.reduce((o,x)=>(o[x]=(o[x]||0)+1,o),{}),spotCheckSampleSize:sample.length,clinicalApprovals:0,tagNotes:{Core:'Low-jurisdiction-signal CANDIDATE only; NOT clinically approved.', 'SA-only':'Explicit Saudi regulatory wording: local rewrite or exclude.','unclear':'Possible local policy or professional-scope dependency: manual review required.'}};
fs.writeFileSync(path.join(out,'tag-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
