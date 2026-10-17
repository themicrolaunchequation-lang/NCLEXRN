/* Serein.store: local persistence and optional authenticated encryption. */
(function(S){
'use strict';
const KEY='serein-hca-v3',DRAFT='serein-journal-draft',SEALED_DRAFT='serein-journal-draft-sealed';
const SECRET=['journals','checkins','contacts'];
const clone=o=>JSON.parse(JSON.stringify(o));
const b64=bytes=>{let s='';for(const b of new Uint8Array(bytes))s+=String.fromCharCode(b);return btoa(s);};
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));

/** Isolated crypto check; it never reads or writes personal storage. */
S.cryptoSelftest=async function(){
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode('Serein isolated test'),'PBKDF2',false,['deriveKey']);
 const k=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode('Fixture only'));
 const result=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},k,encrypted));
 if(result!=='Fixture only')throw Error('Crypto round-trip failed');
 return true;
};
S.createVault=function(c){
 let key=null,memorySealed=null,queue=Promise.resolve(),busy=false,failed=false,epoch=0,draftEpoch=0,pendingWrites=0,pendingDrafts=0;
 const available=!!globalThis.crypto?.subtle;
 const data=()=>c.get();let lastStoredRaw;try{lastStoredRaw=localStorage.getItem(KEY);}catch{}
 function validate(v){
  if(!v||v.format!==1||v.kdf!=='PBKDF2'||v.iterations<310000||v.iterations>1000000||typeof v.salt!=='string'||typeof v.iv!=='string'||typeof v.ciphertext!=='string'||v.ciphertext.length>12000000)throw Error('This encrypted archive has an unsupported format.');
  if(bytes(v.salt).length!==16||bytes(v.iv).length!==12)throw Error('The encrypted archive is damaged.');
  v.lockAfter=[1,5,15,30].includes(+v.lockAfter)?+v.lockAfter:5;v.lockOnHide=v.lockOnHide!==false;return v;
 }
 async function derive(pass,salt,iterations){
  if(!available)throw Error('Secure local encryption is unavailable in this browser.');
  const raw=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:bytes(salt),iterations},raw,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
 }
 async function seal(payload,k,v){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('Serein-v5-private')},k,new TextEncoder().encode(JSON.stringify(payload)));
  return {format:1,kdf:'PBKDF2',iterations:v.iterations,salt:v.salt,iv:b64(iv),ciphertext:b64(ciphertext),lockAfter:v.lockAfter||5,lockOnHide:v.lockOnHide!==false};
 }
 async function unseal(v,k){
  validate(v);
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(v.iv),additionalData:new TextEncoder().encode('Serein-v5-private')},k,bytes(v.ciphertext));
  return JSON.parse(new TextDecoder().decode(plain));
 }
 function secrets(model,all=false){return Object.fromEntries(SECRET.map(k=>[k,(model[k]||[]).filter(x=>all||x.persistent)]));}
 function payload(model){
  const out=clone(model);out.version=5;
  for(const name of ['feedback','journals','checkins','contacts'])out[name]=(out[name]||[]).filter(x=>x.persistent);
  return out;
 }
 function current(generation){if(generation!==epoch)throw Error("The operation was cancelled because Serein data changed. No records were restored.");}
 function write(out){
  if(c.storageBlocked?.()){if(!failed)Promise.resolve().then(()=>c.notice("The existing archive could not be read and has been protected. Open Data & privacy to download a recovery copy."));failed=true;return false;}
  try{const previous=localStorage.getItem(KEY);if(previous!==lastStoredRaw&&!(lastStoredRaw===undefined&&previous===null)){if(!failed)Promise.resolve().then(()=>c.notice('Saved data changed in another tab. This tab has kept its changes in memory. Export them before reloading to avoid overwriting newer records.'));failed=true;return false;}const serialised=JSON.stringify(out);localStorage.setItem(KEY,serialised);lastStoredRaw=serialised;failed=false;return true;}
  catch{if(!failed)Promise.resolve().then(()=>c.notice('Browser storage is unavailable or full. Latest changes stay in memory; export a copy before leaving.'));failed=true;return false;}
 }
 function enqueue(task){const result=queue.then(task);queue=result.catch(()=>{});return result;}
 /** Persist only explicitly saved personal records. Encrypted snapshots are serialised. */
 function persist(){
  const snapshot=clone(data()),activeKey=key,generation=epoch;
  if(!snapshot.vault){const ok=write(payload(snapshot));return Promise.resolve(ok);}
  pendingWrites++;return enqueue(async()=>{
   if(generation!==epoch)return false;const out=payload(snapshot),env=activeKey?await seal(secrets(snapshot),activeKey,snapshot.vault):data().vault;
   out.vault=env;for(const name of SECRET)delete out[name];
   if(generation!==epoch)return false;data().vault=env;return write(out);
  }).catch(()=>{c.notice('Encrypted changes could not be saved. Keep this tab open and export a copy.');return false;}).finally(()=>pendingWrites--);
 }
 async function enable(pass){
  if(busy)throw Error('Another privacy operation is finishing. Try again shortly.');
  if(pass.length<6)throw Error('Use at least six characters. A longer passphrase is stronger.');
  if(data().vault)throw Error('The journal lock is already enabled.');
  const generation=epoch;busy=true;
  try{
   const salt=b64(crypto.getRandomValues(new Uint8Array(16))),settings={salt,iterations:310000,lockAfter:5,lockOnHide:true},nextKey=await derive(pass,salt,310000);current(generation);
   const env=await seal(secrets(data()),nextKey,settings),out=payload(data());current(generation);out.vault=env;for(const name of SECRET)delete out[name];
   if(!write(out))throw Error('Encryption was not enabled because the encrypted copy could not be saved.');
   epoch++;const enabledGeneration=epoch;key=nextKey;data().vault=env;
   try{localStorage.removeItem('serein-demo-v1');sessionStorage.removeItem(DRAFT);}catch{c.notice('The lock is enabled. Check and remove any old copies in this browser.');}
   await saveDraft(c.getDraft());current(enabledGeneration);c.changed();return true;
  }finally{busy=false;}
 }
 /** Unlock only after authentication succeeds. Failed attempts never expose records. */
 async function unlock(pass){
  if(!data().vault)return;
  if(busy)throw Error('Another privacy operation is finishing. Try again shortly.');
  const generation=epoch;busy=true;
  try{
   const env=validate(data().vault),nextKey=await derive(pass,env.salt,env.iterations);
   const plain=await unseal(memorySealed||env,nextKey);current(generation);
   const normal=c.normalise({...data(),...plain,vault:null});
   let draft='';try{const sealed=JSON.parse(sessionStorage.getItem(SEALED_DRAFT)||'null');if(sealed&&sealed.salt===env.salt)draft=(await unseal(sealed,nextKey)).draft||'';}catch{}
   current(generation);
   for(const name of SECRET)data()[name]=normal[name]||[];
   key=nextKey;memorySealed=null;c.setDraft(draft);c.changed();
  }catch(error){if(generation!==epoch)throw error;throw Error('The passcode is incorrect, or the encrypted records are damaged. No records were opened.');}
  finally{busy=false;}
 }
 async function lock(){
  if(!data().vault||!key||busy)return false;
  const generation=epoch;busy=true;
  try{
   await queue;current(generation);await persist();current(generation);
   const sealed=await seal(secrets(data(),true),key,data().vault);current(generation);
   await saveDraft(c.getDraft());current(generation);
   memorySealed=sealed;key=null;for(const name of SECRET)data()[name]=[];
   c.setDraft('');c.clearPrivateUI();c.changed();return true;
  }finally{busy=false;}
 }
 async function remove(pass){
  if(!data().vault)return;
  if(busy)throw Error('Another privacy operation is finishing. Try again shortly.');
  if(!key)await unlock(pass);
  const generation=epoch;busy=true;
  try{
   const previous=data().vault;await unseal(previous,await derive(pass,previous.salt,previous.iterations));current(generation);
   await queue;current(generation);const out=payload(data());delete out.vault;
   if(!write(out))throw Error('The lock was kept because normal storage could not be written.');
   epoch++;const removedGeneration=epoch;draftEpoch++;data().vault=null;key=null;memorySealed=null;
   try{sessionStorage.removeItem(SEALED_DRAFT);}catch{}
   await saveDraft(c.getDraft());current(removedGeneration);c.changed();return previous;
  }finally{busy=false;}
 }
 async function saveDraft(text){const ticket=++draftEpoch,generation=epoch;
  if(!data().vault){try{if(text)sessionStorage.setItem(DRAFT,text);else sessionStorage.removeItem(DRAFT);return true;}catch{return false;}}
  if(!key)return false;
  pendingDrafts++;try{
   if(text){const env=await seal({draft:text},key,data().vault);if(ticket!==draftEpoch||generation!==epoch)return false;sessionStorage.setItem(SEALED_DRAFT,JSON.stringify(env));}
   else sessionStorage.removeItem(SEALED_DRAFT);
   sessionStorage.removeItem(DRAFT);return true;
  }catch{return false;}finally{pendingDrafts--;}
 }
 async function exportEncrypted(){
  if(busy)throw Error('Another privacy operation is finishing. Try the export again shortly.');
  if(!data().vault)throw Error('Enable the journal lock to create an encrypted export.');
  await queue;const out=payload(data());
  out.vault=key?await seal(secrets(data(),true),key,data().vault):memorySealed||data().vault;
  for(const name of SECRET)delete out[name];out.app='Serein';out.exportedAt=new Date().toISOString();return out;
 }
 async function decryptArchive(raw,pass){
  const env=validate(raw.vault),k=await derive(pass,env.salt,env.iterations),plain=await unseal(env,k);
  return c.normalise({...raw,...plain,vault:null});
 }
 function reset(){epoch++;draftEpoch++;key=null;memorySealed=null;try{localStorage.removeItem(KEY);lastStoredRaw=null;failed=false;localStorage.removeItem('serein-demo-v1');sessionStorage.removeItem(DRAFT);sessionStorage.removeItem(SEALED_DRAFT);}catch{}}
 return {available,persist,enable,unlock,lock,remove,saveDraft,exportEncrypted,decryptArchive,validate,reset,flush:()=>queue,get enabled(){return !!data().vault},get locked(){return !!data().vault&&!key},get busy(){return busy},get pending(){return busy||pendingWrites>0||pendingDrafts>0}};
};
})(globalThis.Serein=globalThis.Serein||{});
