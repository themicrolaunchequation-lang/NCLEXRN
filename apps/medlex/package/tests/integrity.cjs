const boot=require('./probe.cjs'),fs=require('fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const baseline=boot('source/upload/MedLex-Medical-Terminology.html'),next=boot();
const names=['TERMS','PREFIXES','SUFFIXES','LESSONS','CASES','CONFUSIONS','CODE_QUESTIONS','QUOTES','CHAPTERS','COURSE_MODULES'],collections=[];
for(const name of names){const original=baseline.ev('JSON.stringify('+name+')'),actual=next.ev('JSON.stringify('+name+')');assert.equal(actual,original,name+' exactly preserves original content/order');assert.equal(actual,JSON.stringify(JSON.parse(fs.readFileSync('src/data/records/'+name+'.json'))));collections.push({name,records:JSON.parse(actual).length,sha256:crypto.createHash('sha256').update(actual).digest('hex')});}
const old={name:'Migration Test',theme:'dark',reduced:true,saved:['pericarditis'],learned:['dyspnoea'],lessons:[0,2],history:[{date:1700000000000,mode:'meaning',score:4,total:5}],reviews:{pericarditis:{due:1800000000000,last:1700000000000,reps:2}},visits:['2026-10-12']};
const course=JSON.parse(next.ev('JSON.stringify(courseDefaults())'));course.notes.ch9='Preserve note';course.mapping['ch9-o1']='Curriculum page 2';
const migrated=boot(undefined,{'medlex-v1':old,'medlex-course-v2':course});
assert.equal(migrated.w.localStorage.getItem('medlex-v1'),JSON.stringify(old));assert.equal(migrated.w.localStorage.getItem('medlex-course-v2'),JSON.stringify(course));
assert.equal(migrated.ev('v3.schemaVersion'),3);assert.equal(migrated.ev('state.saved[0]'),'pericarditis');assert.equal(migrated.ev('v3.terms.pericarditis.srs.interval'),3);assert.equal(migrated.ev('course.notes.ch9'),'Preserve note');assert.equal(migrated.ev('v3.profile.name'),'Migration Test');
assert.equal(migrated.ev('JSON.stringify(validateImport({app:"MedLex",version:3,data:v3}).v3)'),migrated.ev('JSON.stringify(v3)'));
for(let n=1;n<=4;n++){const r=JSON.parse(next.ev(`JSON.stringify(schedule({reps:3,interval:20,ease:2.5},${n}))`));assert(r.due>Date.now());assert(r.interval<=180);assert(r.ease>=1.3);}
assert.deepEqual([...next.errors,...migrated.errors],[]);
fs.mkdirSync('review/phase1',{recursive:true});fs.writeFileSync('review/phase1/integrity.json',JSON.stringify({collections,migration:true,legacyKeysUnchanged:true,v3Roundtrip:true,srsRatings:4,errors:[]},null,2));
for(const a of [baseline,next,migrated])a.w.close();console.log('Ten collections exactly equal the original; legacy migration, v3 round-trip and SRS passed.');
