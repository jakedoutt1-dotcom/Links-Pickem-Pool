import {questionOwner} from './host-question-sets.js';
import {questionSet,approvedQuestions,selectHostQuestions} from '../../lib/host-question-sets.js';
import {withTriviaSession} from '../../lib/trivia-sessions.js';
import {ensureVenue,venueStatements} from '../../lib/venue-scoreboard.js';
import {hostAccess} from '../../lib/trivia-host-billing.js';
import {paypal} from './party-pack.js';
import {loadFreshGameQuestions,normalizedQuestionText} from '../../lib/trivia-provider.js';
import {ensureAccounts,emailKey} from '../../lib/commissioner-account.js';
import {ownerSession} from '../../lib/owner-auth.js';
import {STARTER,validateBank,makeDeck,answerSeconds,reveal,view} from '../../lib/trivia-night.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
async function handleRequest({request,env}){
 try{
  if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
  const url=new URL(request.url);
  if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)return json({error:'Open this page on LINKS before continuing.'},403);
  const db=env.DB;if(!db)return json({error:'Trivia needs a database connection.'},503);
  let b={};if(request.method==='POST'){const raw=await request.text();if(raw.length>600000)return json({error:'Question file is too large.'},413);try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}}
  const action=b.action||url.searchParams.get('action')||'state';
  if(request.method==='GET'&&!['state','display','info','library','owner-library'].includes(action))return json({error:'Use POST for changes.'},405);
  await db.batch([
   db.prepare('CREATE TABLE IF NOT EXISTS links_trivia_night_rooms(code TEXT PRIMARY KEY,pool_id INTEGER NOT NULL,host_name TEXT NOT NULL,state TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 0,expires INTEGER NOT NULL)'),
   db.prepare('CREATE TABLE IF NOT EXISTS links_trivia_night_banks(pool_id INTEGER PRIMARY KEY,questions TEXT NOT NULL,updated TEXT NOT NULL)'),
   db.prepare('CREATE TABLE IF NOT EXISTS links_trivia_night_displays(code TEXT PRIMARY KEY,seen INTEGER NOT NULL)'),
   db.prepare('CREATE TABLE IF NOT EXISTS links_trivia_night_history(host_key TEXT NOT NULL,text_key TEXT NOT NULL,question_id TEXT NOT NULL,last_used INTEGER NOT NULL,PRIMARY KEY(host_key,text_key))'),
   db.prepare('CREATE TABLE IF NOT EXISTS links_trivia_night_limits(id TEXT PRIMARY KEY,starts INTEGER NOT NULL,hits INTEGER NOT NULL)')
  ]);
  if(['join','create','restart','import'].includes(action)){
   const key=await hash((request.headers.get('CF-Connecting-IP')||'local')+':'+action),now=Date.now();
   await db.prepare('INSERT INTO links_trivia_night_limits(id,starts,hits) VALUES(?,?,1) ON CONFLICT(id) DO UPDATE SET hits=CASE WHEN starts<? THEN 1 ELSE hits+1 END,starts=CASE WHEN starts<? THEN excluded.starts ELSE starts END').bind(key,now,now-60000,now-60000).run();
   const rate=await db.prepare('SELECT hits FROM links_trivia_night_limits WHERE id=?').bind(key).first();
   if(rate.hits>(action==='join'?250:20))return json({error:'Too many requests. Please wait one minute.'},429);
  }
  const bearer=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
  const admin=bearer?await db.prepare("SELECT * FROM pool_sessions WHERE token=? AND expires_at>? AND role='admin'").bind(bearer,new Date().toISOString()).first():null;
  const bank=async()=>{const row=await db.prepare('SELECT questions FROM links_trivia_night_banks WHERE pool_id=?').bind(0).first();return [...(row?JSON.parse(row.questions):STARTER),...await approvedQuestions(db)]};
  const hostEmail=async pool=>{await ensureAccounts(db);const owner=await db.prepare('SELECT email FROM links_pool_owners WHERE pool_id=?').bind(pool).first(),contact=await db.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='commissioner_email'").bind(pool).first();return emailKey(owner?.email||contact?.value||'')};
  const hostRequired=()=>json({error:'Choose hosted Trivia Night access, or use a complimentary host grant from LINKS Admin. Players join free.',code:'TRIVIA_HOST_REQUIRED'},402);
  let accessChecked=false,hostSubscription;
  const checkHost=async()=>{if(!accessChecked){const email=await hostEmail(admin.pool_id);hostSubscription=email?await hostAccess(env,email,paypal):null;accessChecked=true}return hostSubscription};
  const historyKey=async pool=>{await ensureAccounts(db);const o=await db.prepare('SELECT email FROM links_pool_owners WHERE pool_id=?').bind(pool).first(),c=await db.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='commissioner_email'").bind(pool).first();const email=emailKey(o?.email||c?.value||'');return hash(email?'commissioner:'+email:'pool:'+pool)};
  const history=async key=>{const rows=(await db.prepare('SELECT question_id,text_key FROM links_trivia_night_history WHERE host_key=? AND last_used>? ORDER BY last_used DESC LIMIT 1500').bind(key,Date.now()-2592000000).all()).results||[];rows.reverse();return {ids:rows.map(r=>r.question_id),texts:rows.map(r=>r.text_key)}};
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
   if(!await checkHost())return hostRequired();
   const plan={label:'Hosted Trivia Night',slots:1};
   const ownership=(await db.prepare('SELECT pool_id,email FROM links_pool_owners').all()).results||[];
   const contacts=(await db.prepare("SELECT pool_id,value FROM pool_settings WHERE key='commissioner_email'").all()).results||[];
   const pools=[...new Set([admin.pool_id,...(email?ownership.filter(p=>emailKey(p.email)===email).map(p=>p.pool_id):[]),...(email?contacts.filter(p=>emailKey(p.value)===email&&!ownership.some(o=>o.pool_id===p.pool_id&&emailKey(o.email)!==email)).map(p=>p.pool_id):[])])];
   const placeholders=pools.map(()=>'?').join(',');
   const active=(await db.prepare(`SELECT code,pool_id,host_name FROM links_trivia_night_rooms WHERE pool_id IN (${placeholders}) AND expires>?`).bind(...pools,Date.now()).all()).results||[];
   if(action==='library')return json({providerConfigured:!!env.TRIVIA_API_KEY,count:(await bank()).length,roomLimit:plan.slots,plan:plan.label,activeRooms:active.length,rooms:active.filter(r=>r.pool_id===admin.pool_id&&r.host_name===admin.player_name).map(r=>({code:r.code}))});
   if(b.mode!==undefined&&!['individual','teams'].includes(b.mode))return json({error:'Choose Individual or Teams.'},400);
   if(!['easy','medium','hard','mixed'].includes(b.difficulty))return json({error:'Choose a valid difficulty.'},400);
   if(active.length>=plan.slots)return json({error:plan.label+' has no available trivia rooms. Reopen a room or choose a larger package.'},402);
   await db.prepare('DELETE FROM links_trivia_night_rooms WHERE expires<=?').bind(Date.now()).run();
   const hostHistoryKey=await historyKey(admin.pool_id),recent=await history(hostHistoryKey);
   const source=b.questionSource||'links',setId=source==='links'?null:b.questionSetId,custom=source==='links'?[]:await questionSet(db,await questionOwner(db,admin),setId);
   const loaded=await selectHostQuestions({source,custom,load:async()=>loadFreshGameQuestions({env,sessionScope:"host:"+hostHistoryKey,categories:b.categories,backup:await bank(),exclude:recent.ids,excludeTexts:recent.texts})}),full=loaded.questions,deck=makeDeck(full,b.categories,'mixed');
   const finals=makeDeck(full,[...new Set(full.map(q=>q.category))],'mixed').filter(q=>q.difficulty==='hard');
   const finalQuestion=finals.find(q=>!deck.some(d=>d.id===q.id))||(deck.length>1?finals[0]:null)||null;
   if(finalQuestion){const at=deck.findIndex(q=>q.id===finalQuestion.id);if(at>=0)deck.splice(at,1);}
   const code=crypto.randomUUID().replace(/-/g,'').slice(0,10).toUpperCase();
   const state={code,hostHistoryKey,customQuestions:custom,hostQuestionSource:source,questionSetId:setId,mode:b.mode||'individual',title:String(b.title||'LINKS Trivia Night').trim().slice(0,70),categories:b.categories,difficulty:b.difficulty,game:1,phase:'lobby',index:-1,deadline:0,questionSource:loaded.source,questionNotice:loaded.notice,seenQuestions:recent.ids,seenTexts:recent.texts,deck,finalQuestion,isFinal:false,players:{}};
   const inserted=await db.prepare(`INSERT INTO links_trivia_night_rooms(code,pool_id,host_name,state,expires) SELECT ?,?,?,?,? WHERE (SELECT COUNT(*) FROM links_trivia_night_rooms WHERE pool_id IN (${placeholders}) AND expires>?)<?`).bind(code,admin.pool_id,admin.player_name,JSON.stringify(state),Date.now()+86400000,...pools,Date.now(),plan.slots).run();
   if(!inserted.meta?.changes)return json({error:plan.label+' allows '+plan.slots+' active trivia room'+(plan.slots===1?'':'s')+'. Reopen your existing room to play again, or choose a larger package. Rooms expire after 24 hours.'},402);
   return json(view(state,'',true));
  }
  const code=String(b.code||url.searchParams.get('code')||'').toUpperCase();
  if(!/^[A-F0-9]{10}$/.test(code))return json({error:'Enter the 10-character room code.'},400);
  const guest=request.headers.get('x-trivia-token')||'',seat=guest?await hash(guest):'';
  let restartQuestions;
  for(let attempt=0;attempt<5;attempt++){
   const row=await db.prepare('SELECT * FROM links_trivia_night_rooms WHERE code=? AND expires>?').bind(code,Date.now()).first();
   if(!row)return json({error:'Room not found or expired. Ask the host for a current code.'},404);
   const s=JSON.parse(row.state),host=!!admin&&admin.pool_id===row.pool_id&&admin.player_name===row.host_name,now=Date.now();let issued;
   if(action==='info')return json({code,title:s.title,mode:s.mode||'individual'});
   if(action==='display'){
    if(request.method==='POST')await db.prepare('INSERT INTO links_trivia_night_displays(code,seen) VALUES(?,?) ON CONFLICT(code) DO UPDATE SET seen=excluded.seen').bind(code,now).run();
    return json(view(s,'',false,now));
   }
   if(action==='join'){
    if(s.players[seat])return json(view(s,seat,host));
    if(Object.keys(s.players).length>=200)return json({error:'This room is full (200 players or teams).'},409);
    const name=String(b.name||'').trim();if(!name||name.length>32)return json({error:'Enter a player or team name, up to 32 characters.'},400);
    if(Object.values(s.players).some(p=>p.name.toLowerCase()===name.toLowerCase()))return json({error:'That name is taken. Use a different player or team name.'},409);
    issued=crypto.randomUUID()+crypto.randomUUID();const id=await hash(issued);
    s.players[id]={name,score:0,eligible:s.index+1,answer:null};
   }else{
    if(!host&&!s.players[seat])return json({error:'Join this room first.'},401);
    if(action==='state'){const display=host?await db.prepare('SELECT seen FROM links_trivia_night_displays WHERE code=?').bind(code).first():null;return json({...view(s,seat,host,now),...(host?{tvConnected:!!display&&display.seen>now-45000}:{})});}
    if(action==='answer'){
     const p=s.players[seat];
     if(!p||s.phase!=='question'||now<(s.startsAt||0)||b.gameNumber!==s.game||b.index!==s.index||now>=s.deadline||p.eligible>s.index||p.answer?.index===s.index)return json({error:'Answer locked. Wait for the next question.'},409);
     if(!Number.isInteger(b.choice)||b.choice<0||b.choice>3)return json({error:'Choose an answer.'},400);
     p.answer={index:s.index,choice:b.choice,elapsed:Math.max(0,now-(s.deadline-answerSeconds(s.deck[s.index].difficulty,s.mode)*1000))};
    }else{
     if(!host)return json({error:'Only this room’s host can control the game.'},403);
     if(['next','start-question','restart','final'].includes(action)&&!await checkHost())return hostRequired();
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
      s.index++;s.phase='question';s.startsAt=now+3000;s.deadline=s.startsAt+answerSeconds(s.deck[s.index].difficulty,s.mode)*1000;
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
      s.hostHistoryKey ||= await historyKey(row.pool_id);const recent=await history(s.hostHistoryKey);
      const seen=[...new Set([...recent.ids,...(s.seenQuestions||[]),...s.deck.slice(0,s.index+1).map(q=>q.id)])].slice(-1500),seenTexts=[...new Set([...recent.texts,...(s.seenTexts||[]),...s.deck.slice(0,s.index+1).map(normalizedQuestionText)])].slice(-1500);
      restartQuestions ||= selectHostQuestions({source:s.hostQuestionSource||'links',custom:s.customQuestions||[],load:async()=>loadFreshGameQuestions({env,sessionScope:"host:"+s.hostHistoryKey,categories:b.categories,backup:await bank(),exclude:seen,excludeTexts:seenTexts})});const loaded=await restartQuestions,full=loaded.questions;s.questionSource=loaded.source;s.questionNotice=loaded.notice;s.seenQuestions=seen;s.seenTexts=seenTexts;s.deck=makeDeck(full,b.categories,'mixed');const finals=makeDeck(full,[...new Set(full.map(q=>q.category))],'mixed').filter(q=>q.difficulty==='hard');s.finalQuestion=finals.find(q=>!s.deck.some(d=>d.id===q.id))||(s.deck.length>1?finals[0]:null)||null;if(s.finalQuestion)s.deck=s.deck.filter(q=>q.id!==s.finalQuestion.id);s.isFinal=false;s.categories=b.categories;s.difficulty=b.difficulty;s.game++;s.index=-1;s.phase='lobby';s.deadline=0;
      for(const p of Object.values(s.players)){p.score=0;p.answer=null;p.eligible=0;}
     }else return json({error:'Unknown action.'},400);
    }
   }
   const encoded=JSON.stringify(s);if(s.phase==='ended')await ensureVenue(db);const writes=await db.batch([db.prepare('UPDATE links_trivia_night_rooms SET state=?,version=version+1 WHERE code=? AND version=?').bind(encoded,code,row.version),...(s.phase==='ended'?venueStatements(db,'trivia-night','links_trivia_night_rooms',code,row.version,encoded,[s]):[])]);const result=writes[0];
   if(result.meta?.changes){if(host&&action==='start-question'){const key=s.hostHistoryKey||await historyKey(row.pool_id),q=s.deck[s.index];await db.prepare('INSERT INTO links_trivia_night_history(host_key,text_key,question_id,last_used) VALUES(?,?,?,?) ON CONFLICT(host_key,text_key) DO UPDATE SET question_id=excluded.question_id,last_used=excluded.last_used').bind(key,normalizedQuestionText(q),q.id,Date.now()).run();await db.prepare('DELETE FROM links_trivia_night_history WHERE last_used<?').bind(Date.now()-2592000000).run()}return json({...view(s,issued?await hash(issued):seat,host),...(issued?{token:issued}:{})});}
  }
  return json({error:'The room is busy. Please try again.'},409);
 }catch(error){return json({error:error.message?.startsWith('Question ')||/^(Upload|Choose categories|No questions)/.test(error.message||'')?error.message:'Trivia could not complete that request. Try again.'},400)}
}

export const onRequest=context=>withTriviaSession(context,"trivia-night",handleRequest);
