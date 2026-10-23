import {assertBlueprint,DOMAIN_KEYS} from '../data/exam-profiles.js';
const validUrl=value=>{try{return new URL(value).protocol==='https:'}catch{return false}};
export function eligibleItem(item,profileId){
 if(!item||!item.id||!DOMAIN_KEYS.includes(item.domain))return false;
 if(!Array.isArray(item.options)||item.options.length!==4||typeof item.key!=='string'||!item.options.some(o=>o.label===item.key))return false;
 if(typeof item.stem!=='string'||item.stem.trim().length<20||typeof item.rationale!=='string'||item.rationale.trim().length<10)return false;
 const a=item.approval;
 if(!a||a.status!=='APPROVED'||!a.signedOff||!a.reviewerId||!a.reviewedAt||!validUrl(a.evidenceUrl))return false;
 if(!Array.isArray(a.approvedFor)||!a.approvedFor.includes(profileId))return false;
 const local=a.jurisdictionReview?.[profileId];
 if(!local||local.status!=='APPROVED'||!local.reviewerId||!local.reviewedAt)return false;
 return true;
}
function shuffle(items,rng){const x=[...items];for(let i=x.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
/** Refuses to assemble a full examination unless both regulator and individual items have independent approvals. */
export function assembleMock(profile,items,{ownerApprovedRelease=false,rng=Math.random}={}){
 if(!profile||!assertBlueprint(profile).valid)return {ready:false,reason:'REGULATORY_BLUEPRINT_NOT_VERIFIED'};
 if(!ownerApprovedRelease||profile.publishable!==true)return {ready:false,reason:'OWNER_RELEASE_APPROVAL_REQUIRED'};
 if(!Array.isArray(items))return {ready:false,reason:'REVIEWED_BANK_MISSING'};
 const selected=[],used=new Set();
 for(const domain of profile.domains){
  const subset=shuffle(items.filter(q=>q.domain===domain.key&&eligibleItem(q,profile.id)&&!used.has(q.id)),rng);
  if(subset.length<domain.count)return {ready:false,reason:'APPROVED_ITEM_SHORTAGE',domain:domain.key,needed:domain.count,available:subset.length};
  for(const item of subset.slice(0,domain.count)){used.add(item.id);selected.push(item)}
 }
 return {ready:true,profileId:profile.id,questionCount:selected.length,minutes:profile.minutes,blocks:profile.blocks||null,items:shuffle(selected,rng)};
}
/** Formative educational scoring only. It cannot provide regulator scaled scores or actual pass probabilities. */
export function formativeScore(session,answers){
 if(!session?.ready||!Array.isArray(session.items)||!answers||typeof answers!=='object')throw Error('Invalid approved session or response set');
 let correct=0,attempted=0;
 for(const q of session.items){if(Object.hasOwn(answers,q.id)){attempted++;if(answers[q.id]===q.key)correct++}}
 return {correct,attempted,total:session.items.length,practiceAccuracyPercent:attempted?Math.round(correct/attempted*1000)/10:null,passPrediction:null,officialResult:null,warning:'Formative educational result only; not an official examination score or predictor of licensure.'};
}
