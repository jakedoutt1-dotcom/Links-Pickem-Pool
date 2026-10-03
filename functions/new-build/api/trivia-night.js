import {ensureAccounts,allowance,emailKey} from '../../lib/commissioner-account.js';
import {ownerSession} from '../../lib/owner-auth.js';
import {STARTER,validateBank,makeDeck,SECONDS,reveal,view} from '../../lib/trivia-night.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function onRequest({request,env}){
 try{
  if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
  const url=new URL(request.url);
  if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)return json({error:'Open this page on LINKS before continuing.'},403);
  const db=env.DB;if(!db)return json({error:'Trivia needs a database connection.'},503);
  let b={};if(request.method==='POST'){const raw=await request.text();if(raw.length>600000)return json({error:'Question file is too large.'},413);try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}}
  const action=b.action||url.searchParams.get('action')||'state';
  if(request.method==='GET'&&!['state','library','owner-library'].includes(action))return json({error:'Use POST for changes.'},405);
  await db.batch([
   db.prepare('CREATE TABLE IF NOT EXISTS links_trivia_night_rooms(code TEXT PRIMARY KEY,pool_id INTEGER NOT NULL,host_name TEXT NOT NULL,state TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 0,expires INTEGER NOT NULL)'),
   db.prepare('CREATE TABLE IF NOT EXISTS links_trivia_night_banks(pool_id INTEGER PRIMARY KEY,questions TEXT NOT NULL,updated TEXT NOT NULL)'),
   db.prepare('CREATE TABLE IF NOT EXISTS links_trivia_night_limits(id TEXT PRIMARY KEY,starts INTEGER NOT NULL,hits INTEGER NOT NULL)')
  ]);
  if(['join','create','import'].includes(action)){
   const key=await hash((request.headers.get('CF-Connecting-IP')||'local')+':'+action),now=Date.now();
   await db.prepare('INSERT INTO links_trivia_night_limits(id,starts,hits) VALUES(?,?,1) ON CONFLICT(id) DO UPDATE SET hits=CASE WHEN starts<? THEN 1 ELSE hits+1 END,starts=CASE WHEN starts<? THEN excluded.starts ELSE starts END').bind(key,now,now-60000,now-60000).run();
   const rate=await db.prepare('SELECT hits FROM links_trivia_night_limits WHERE id=?').bind(key).first();
   if(rate.hits>(action==='join'?250:20))return json({error:'Too many requests. Please wait one minute.'},429);
  }
  const bearer=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
  const admin=bearer?await db.prepare("SELECT * FROM pool_sessions WHERE token=? AND expires_at>? AND role='admin'").bind(bearer,new Date().toISOString()).first():null;
  const bank=async()=>{const row=await db.prepare('SELECT questions FROM links_trivia_night_banks WHERE pool_id=?').bind(0).first();return row?JSON.parse(row.questions):STARTER};
  if(['owner-library','import'].includes(action)){
   if(!await ownerSession(request,db))return json({error:'Only LINKS Admin can manage trivia questions.'},403);
   if(action==='owner-library')return json({questions:await bank()});
   const rows=validateBank(b.questions);await db.prepare('INSERT INTO links_trivia_night_banks(pool_id,questions,updated) VALUES(?,?,?) ON CONFLICT(pool_id) DO UPDATE SET questions=excluded.questions,updated=excluded.updated').bind(0,JSON.stringify(rows),new Date().toISOString()).run();return json({count:rows.length});
  }
  if(['library','create'].includes(action)){
   if(!admin)return json({error:'Sign in as a pool commissioner to host.'},403);
   await ensureAccounts(db);
   const owner=await db.prepare('SELECT email FROM links_pool_owners WHERE pool_id=?').bind(admin.pool_id).first();
   const contact=await db.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='commissioner_email'").bind(admin.pool_id).first();
   const email=emailKey(owner?.email||contact?.value||'');
   const plan=owner?await allowance(db,email):{label:'Free',slots:1};
   const ownership=(await db.prepare('SELECT pool_id,email FROM links_pool_owners').all()).results||[];
   const contacts=(await db.prepare("SELECT pool_id,value FROM pool_settings WHERE key='commissioner_email'").all()).results||[];
   const pools=[...new Set([admin.pool_id,...(email?ownership.filter(p=>emailKey(p.email)===email).map(p=>p.pool_id):[]),...(email?contacts.filter(p=>emailKey(p.value)===email&&!ownership.some(o=>o.pool_id===p.pool_id&&emailKey(o.email)!==email)).map(p=>p.pool_id):[])])];
   const placeholders=pools.map(()=>'?').join(',');
   const active=(await db.prepare(`SELECT code,pool_id,host_name FROM links_trivia_night_rooms WHERE pool_id IN (${placeholders}) AND expires>?`).bind(...pools,Date.now()).all()).results||[];
   if(action==='library')return json({count:(await bank()).length,roomLimit:plan.slots,plan:plan.label,activeRooms:active.length,rooms:active.filter(r=>r.pool_id===admin.pool_id&&r.host_name===admin.player_name).map(r=>({code:r.code}))});
   if(!['easy','medium','hard','mixed'].includes(b.difficulty))return json({error:'Choose a valid difficulty.'},400);
   const full=await bank(),deck=makeDeck(full,b.categories,'mixed');
   const finals=makeDeck(full,[...new Set(full.map(q=>q.category))],'mixed').filter(q=>q.difficulty==='hard');
   const finalQuestion=finals.find(q=>!deck.some(d=>d.id===q.id))||(deck.length>1?finals[0]:null)||null;
   if(finalQuestion){const at=deck.findIndex(q=>q.id===finalQuestion.id);if(at>=0)deck.splice(at,1);}
   const code=crypto.randomUUID().replace(/-/g,'').slice(0,10).toUpperCase();
   const state={code,title:String(b.title||'LINKS Trivia Night').trim().slice(0,70),categories:b.categories,difficulty:b.difficulty,game:1,phase:'lobby',index:-1,deadline:0,deck,finalQuestion,isFinal:false,players:{}};
   const inserted=await db.prepare(`INSERT INTO links_trivia_night_rooms(code,pool_id,host_name,state,expires) SELECT ?,?,?,?,? WHERE (SELECT COUNT(*) FROM links_trivia_night_rooms WHERE pool_id IN (${placeholders}) AND expires>?)<?`).bind(code,admin.pool_id,admin.player_name,JSON.stringify(state),Date.now()+86400000,...pools,Date.now(),plan.slots).run();
   if(!inserted.meta?.changes)return json({error:plan.label+' allows '+plan.slots+' active trivia room'+(plan.slots===1?'':'s')+'. Reopen your existing room to play again, or choose a larger package. Rooms expire after 24 hours.'},402);
   return json(view(state,'',true));
  }
  const code=String(b.code||url.searchParams.get('code')||'').toUpperCase();
  if(!/^[A-F0-9]{10}$/.test(code))return json({error:'Enter the 10-character room code.'},400);
  const guest=request.headers.get('x-trivia-token')||'',seat=guest?await hash(guest):'';
  for(let attempt=0;attempt<5;attempt++){
   const row=await db.prepare('SELECT * FROM links_trivia_night_rooms WHERE code=? AND expires>?').bind(code,Date.now()).first();
   if(!row)return json({error:'Room not found or expired. Ask the host for a current code.'},404);
   const s=JSON.parse(row.state),host=!!admin&&admin.pool_id===row.pool_id&&admin.player_name===row.host_name,now=Date.now();let issued;
   if(action==='join'){
    if(s.players[seat])return json(view(s,seat,host));
    if(Object.keys(s.players).length>=200)return json({error:'This room is full (200 players or teams).'},409);
    const name=String(b.name||'').trim();if(!name||name.length>32)return json({error:'Enter a player or team name, up to 32 characters.'},400);
    if(Object.values(s.players).some(p=>p.name.toLowerCase()===name.toLowerCase()))return json({error:'That name is taken. Use a different player or team name.'},409);
    issued=crypto.randomUUID()+crypto.randomUUID();const id=await hash(issued);
    s.players[id]={name,score:0,eligible:s.index+1,answer:null};
   }else{
    if(!host&&!s.players[seat])return json({error:'Join this room first.'},401);
    if(action==='state')return json(view(s,seat,host,now));
    if(action==='answer'){
     const p=s.players[seat];
     if(!p||s.phase!=='question'||now<(s.startsAt||0)||b.gameNumber!==s.game||b.index!==s.index||now>=s.deadline||p.eligible>s.index||p.answer?.index===s.index)return json({error:'Answer locked. Wait for the next question.'},409);
     if(!Number.isInteger(b.choice)||b.choice<0||b.choice>3)return json({error:'Choose an answer.'},400);
     p.answer={index:s.index,choice:b.choice,elapsed:Math.max(0,now-(s.deadline-SECONDS[s.deck[s.index].difficulty]*1000))};
    }else{
     if(!host)return json({error:'Only this room’s host can control the game.'},403);
     if(b.gameNumber!==s.game||b.index!==s.index||b.phase!==s.phase)return json({error:'The room changed. Refresh and try again.'},409);
     if(action==='next'){
      if(s.isFinal)return json({error:'The final answer is revealed. Show final standings to finish.'},409);
      if(!['lobby','reveal'].includes(s.phase))return json({error:'Reveal this answer before continuing.'},409);
      if(s.index+1>=s.deck.length)return json({error:'No unused questions remain. End this game to start another.'},409);
      const difficulty=b.difficulty||s.difficulty||'mixed';
      if(!['easy','medium','hard','mixed'].includes(difficulty))return json({error:'Choose Easy, Medium, Hard, or Mixed.'},400);
      const at=s.deck.findIndex((q,i)=>i>s.index&&(!b.category||q.category===b.category)&&(difficulty==='mixed'||q.difficulty===difficulty));
      if(at<0)return json({error:'No unused questions at that difficulty in this category. Choose another level or category.'},409);
      [s.deck[s.index+1],s.deck[at]]=[s.deck[at],s.deck[s.index+1]];s.difficulty=difficulty;s.phase='category';s.deadline=0;
     }else if(action==='start-question'){
      if(s.phase!=='category')return json({error:'Choose a category first.'},409);
      s.index++;s.phase='question';s.startsAt=now+3000;s.deadline=s.startsAt+SECONDS[s.deck[s.index].difficulty]*1000;
     }else if(action==='final'){
      if(s.phase!=='reveal'||!s.finalQuestion||s.isFinal)return json({error:'Reveal a regular question first. A hard question must be available for the final.'},409);
      s.deck.splice(s.index+1,0,{...s.finalQuestion,final:true});s.isFinal=true;s.phase='category';s.deadline=0;
     }else if(action==='reveal'){
      if(s.phase!=='question'||now<s.deadline)return json({error:'Wait for the answer timer to finish before revealing.'},409);reveal(s);
     }else if(action==='end'){
      if(s.phase==='question'){if(now<s.deadline)return json({error:'Wait for the current timer to finish.'},409);reveal(s);}s.phase='ended';
     }else if(action==='restart'){
      if(s.phase!=='ended')return json({error:'End this game first.'},409);
      if(!['easy','medium','hard','mixed'].includes(b.difficulty))return json({error:'Choose a valid difficulty.'},400);
      const full=await bank();s.deck=makeDeck(full,b.categories,'mixed');const finals=makeDeck(full,[...new Set(full.map(q=>q.category))],'mixed').filter(q=>q.difficulty==='hard');s.finalQuestion=finals.find(q=>!s.deck.some(d=>d.id===q.id))||(s.deck.length>1?finals[0]:null)||null;if(s.finalQuestion)s.deck=s.deck.filter(q=>q.id!==s.finalQuestion.id);s.isFinal=false;s.categories=b.categories;s.difficulty=b.difficulty;s.game++;s.index=-1;s.phase='lobby';s.deadline=0;
      for(const p of Object.values(s.players)){p.score=0;p.answer=null;p.eligible=0;}
     }else return json({error:'Unknown action.'},400);
    }
   }
   const result=await db.prepare('UPDATE links_trivia_night_rooms SET state=?,version=version+1 WHERE code=? AND version=?').bind(JSON.stringify(s),code,row.version).run();
   if(result.meta?.changes)return json({...view(s,issued?await hash(issued):seat,host),...(issued?{token:issued}:{})});
  }
  return json({error:'The room is busy. Please try again.'},409);
 }catch(error){return json({error:error.message?.startsWith('Question ')||/^(Upload|Choose categories|No questions)/.test(error.message||'')?error.message:'Trivia could not complete that request. Try again.'},400)}
}
