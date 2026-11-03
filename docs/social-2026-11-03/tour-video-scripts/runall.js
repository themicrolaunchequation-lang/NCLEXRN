const {spawn}=require('child_process');const fs=require('fs');
const apps=['medlex','lumen','carecraft','serein','snle','evinca','lss'];
const jobs=[...apps.map(a=>[a,'wide']),...apps.map(a=>[a,'tall'])];
const log=(m)=>fs.appendFileSync(__dirname+'/work/queue.log',new Date().toISOString().slice(11,19)+' '+m+'\n');
const sh=(cmd,args,env={})=>new Promise(r=>{const p=spawn(cmd,args,{cwd:__dirname,env:{...process.env,...env},stdio:['ignore','pipe','pipe']});let o='';p.stdout.on('data',d=>o+=d);p.stderr.on('data',d=>o+=d);p.on('close',c=>r({c,o}))});
let next=0;
async function worker(id){
 while(next<jobs.length){const [a,f]=jobs[next++];log(`w${id} start ${a} ${f}`);
  const r=await sh('node',['record2.js',a,f],{S:'0.17'});log(`w${id} recorded ${a} ${f}: ${r.o.trim().slice(0,160)}`);
  if(r.c!==0||!fs.existsSync(`${__dirname}/work/${a}-${f}/meta.json`)){log(`w${id} FAILED ${a} ${f}`);continue;}
  const args=['assemble.py',a,f];if(a==='snle')args.push('--disclaimer');
  const q=await sh('python3',['-I',...args].filter(x=>x!=='-I').length?['assemble.py',a,f,...(a==='snle'?['--disclaimer']:[])]:[]);
  log(`w${id} assembled ${a} ${f}: ${q.o.trim().split('\n').slice(-2).join(' | ')}`);
 }
}
Promise.all([1,2,3].map(worker)).then(()=>log('ALL DONE'));
