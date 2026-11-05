export const stub = (tier='paid') => `
export function createClient(){
  const sess={user:{email:'demo@example.org'}};
  return { auth:{ onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}}}, getSession:async()=>({data:{session:sess}}), signOut:async()=>({}) },
    rpc:async(name,args)=>{ if(name==='my_access') return {data:[{tier:'${tier}',full_name:'Sarah Ahmed',org:'City Hospital',paid_until:'2027-11-01T00:00:00Z'}],error:null}; return {data:null,error:null}; },
    from(){ return {select(){return this},eq(){return this},maybeSingle:async()=>({data:null,error:null}),upsert:async()=>({error:null})}; },
    functions:{invoke:async()=>({error:new Error('no')})} };
}`;
