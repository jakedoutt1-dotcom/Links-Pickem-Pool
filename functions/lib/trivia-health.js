// Only status codes and counts are retained. Never log credentials or provider bodies.
export async function triviaHealth(env,stage,status,count=0){
 if(!env.DB)return;
 try{
 await env.DB.prepare('CREATE TABLE IF NOT EXISTS links_trivia_health(stage TEXT PRIMARY KEY,status TEXT NOT NULL,question_count INTEGER NOT NULL,checked_at TEXT NOT NULL)').run();
 await env.DB.prepare('INSERT INTO links_trivia_health VALUES(?,?,?,?) ON CONFLICT(stage) DO UPDATE SET status=excluded.status,question_count=excluded.question_count,checked_at=excluded.checked_at').bind(stage,String(status),count,new Date().toISOString()).run();
 }catch{/* Diagnostics must not interrupt a game. */}
}

export async function triviaFetch(env,stage,fetcher,url,options){
 try{
  let current=new URL(url);
  const trusted=new Set(['the-trivia-api.com','thetriviaapi.com']);
  for(let redirects=0;redirects<4;redirects++){
   if(current.protocol!=='https:'||!trusted.has(current.hostname)||current.port||current.username||current.password)throw Error('Untrusted provider redirect');
   const response=await fetcher(current.href,{...options,redirect:'manual'});
   if(![301,302,307,308].includes(response.status))return response;
   const location=response.headers.get('Location');if(!location)throw Error('Missing provider redirect');
   const target=new URL(location,current);
   if(target.pathname!==current.pathname)throw Error('Unexpected provider redirect path');
   current=target;
  }
  throw Error('Too many provider redirects');
 }catch(error){
 const message=String(error?.message||'').toLowerCase();
 const kind=/header|bytestring|character|string.*valid/.test(message)?'invalid-header':/redirect/.test(message)?'redirect-blocked':/abort|timeout/.test(message)?'timeout':'network-error';
 await triviaHealth(env,stage,kind);throw error;
 }
}
