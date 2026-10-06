import {triviaHealth,triviaFetch} from './trivia-health.js';
// Provider sessions are private server records. The cookie is an anonymous browser
// identity, not a login credential; room membership and purchases are unchanged.
const digest=async t=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function withTriviaSession(context,game,handler){
 const {request,env}=context,match=(request.headers.get('Cookie')||'').match(/(?:^|;\s*)links_trivia_history=([a-f0-9]{32})(?:;|$)/),id=match?.[1]||crypto.randomUUID().replace(/-/g,'');
 let scope='browser:'+await digest(id),room='',action='',venue='';
 if(env.DB){await env.DB.prepare('CREATE TABLE IF NOT EXISTS links_trivia_room_scopes(game TEXT NOT NULL,room TEXT NOT NULL,scope TEXT NOT NULL,PRIMARY KEY(game,room))').run();
 try{const body=request.method==='POST'?await request.clone().json():{};action=body.action||'';room=String(body.code||new URL(request.url).searchParams.get('code')||'');if(/^[A-F0-9]{10}$/.test(room)){
 const saved=await env.DB.prepare('SELECT scope FROM links_trivia_room_scopes WHERE game=? AND room=?').bind(game,room).first();if(saved)scope=saved.scope;
 // Existing installations may not have venue tables yet.
 try{const v=await env.DB.prepare('SELECT partner FROM links_venue_rooms WHERE game=? AND room=?').bind(game,room).first();if(v)venue='venue:'+v.partner}catch{}
 }}catch{}
 }
 const response=await handler({...context,env:Object.assign(Object.create(env),{TRIVIA_SESSION_SCOPE:scope,TRIVIA_VENUE_SCOPE:venue})});
 if(env.DB&&response.ok&&action==='create'){try{const result=await response.clone().json();if(/^[A-F0-9]{10}$/.test(result.code))await env.DB.prepare('INSERT OR IGNORE INTO links_trivia_room_scopes VALUES(?,?,?)').bind(game,result.code,scope).run()}catch{}}
 const out=new Response(response.body,response);if(!match)out.headers.append('Set-Cookie','links_trivia_history='+id+'; Path=/new-build/api; Max-Age=31536000; HttpOnly; SameSite=Lax'+(new URL(request.url).protocol==='https:'?'; Secure':''));return out;
}
export async function openQuestionSession(env,scope,key,fetcher){
 if(!env.DB||!scope||!key)return null;const db=env.DB,owner=await digest(scope+':'+key);
 await db.batch([db.prepare('CREATE TABLE IF NOT EXISTS links_question_sessions(owner TEXT PRIMARY KEY,session TEXT,lease TEXT,until INTEGER NOT NULL DEFAULT 0)'),db.prepare('CREATE TABLE IF NOT EXISTS links_question_history(owner TEXT NOT NULL,id TEXT NOT NULL,text TEXT NOT NULL,used INTEGER NOT NULL,PRIMARY KEY(owner,id))'),db.prepare('CREATE INDEX IF NOT EXISTS links_question_history_recent ON links_question_history(owner,used)')]);
 await db.prepare('INSERT OR IGNORE INTO links_question_sessions(owner) VALUES(?)').bind(owner).run();
 let row=await db.prepare('SELECT session FROM links_question_sessions WHERE owner=?').bind(owner).first(),warning='';
 if(!row.session){const lease=crypto.randomUUID(),locked=await db.prepare('UPDATE links_question_sessions SET lease=?,until=? WHERE owner=? AND session IS NULL AND until<?').bind(lease,Date.now()+15000,owner,Date.now()).run();
 if(locked.meta?.changes){try{const r=await triviaFetch(env,'session',fetcher,'https://the-trivia-api.com/v2/session',{method:'POST',headers:{'X-API-Key':key,Accept:'application/json'},signal:AbortSignal.timeout(5000),redirect:'error'});await triviaHealth(env,'session',r.status);if(!r.ok)throw Error();const data=await r.json();if(typeof data.id!=='string'||!data.id||data.id.length>200)throw Error();await db.prepare('UPDATE links_question_sessions SET session=?,lease=NULL,until=0 WHERE owner=? AND lease=?').bind(data.id,owner,lease).run()}catch{warning='API repeat protection is temporarily unavailable; recent-question history is still checked.';await db.prepare('UPDATE links_question_sessions SET lease=NULL,until=0 WHERE owner=? AND lease=?').bind(owner,lease).run()}}
 row=await db.prepare('SELECT session FROM links_question_sessions WHERE owner=?').bind(owner).first();
 }
 const history=(await db.prepare('SELECT id,text FROM links_question_history WHERE owner=? AND used>? ORDER BY used DESC LIMIT 6000').bind(owner,Date.now()-30*86400000).all()).results;
 return {id:row.session,warning:warning||(!row.session?'API repeat protection is temporarily unavailable; recent-question history is still checked.':''),ids:history.map(q=>q.id),texts:history.map(q=>q.text),
 async remember(questions){if(!questions.length)return;for(let i=0;i<questions.length;i+=80)await db.batch(questions.slice(i,i+80).map(q=>db.prepare('INSERT INTO links_question_history VALUES(?,?,?,?) ON CONFLICT(owner,id) DO UPDATE SET text=excluded.text,used=excluded.used').bind(owner,q.id,q.text.trim().toLowerCase().replace(/\s+/g,' '),Date.now())));await db.prepare('DELETE FROM links_question_history WHERE owner=? AND used<?').bind(owner,Date.now()-30*86400000).run()},
 async invalidateIfMissing(){if(!row.session)return;try{const r=await fetcher('https://the-trivia-api.com/v2/session/'+encodeURIComponent(row.session),{headers:{'X-API-Key':key},signal:AbortSignal.timeout(3000),redirect:'error'});if(r.status===404)await db.prepare('UPDATE links_question_sessions SET session=NULL WHERE owner=? AND session=?').bind(owner,row.session).run()}catch{}}
 };
}
