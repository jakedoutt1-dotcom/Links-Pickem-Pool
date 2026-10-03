import {CATEGORIES,STARTER} from '../../lib/trivia-night.js';
import {loadGameQuestions,completeQuestionBank} from '../../lib/trivia-provider.js';
import {challengeDeck,begin,advance,challengeView} from '../../lib/friend-challenge.js';
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
const hash=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function onRequest({request,env}){
 try{
  if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
  const url=new URL(request.url);if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)return json({error:'Open Challenge a Friend on LINKS first.'},403);
  const db=env.DB;if(!db)return json({error:'Challenge is temporarily unavailable.'},503);
  let b={};if(request.method==='POST'){const raw=await request.text();if(raw.length>2000)return json({error:'Request too large.'},413);try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}}
  const action=b.action||'state';if(request.method==='GET'&&action!=='state')return json({error:'Use POST.'},405);
  await db.batch([db.prepare('CREATE TABLE IF NOT EXISTS links_friend_rooms(code TEXT PRIMARY KEY,state TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 0,expires INTEGER NOT NULL)'),db.prepare('CREATE TABLE IF NOT EXISTS links_friend_limits(id TEXT PRIMARY KEY,starts INTEGER NOT NULL,hits INTEGER NOT NULL)')]);
  const now=Date.now();
  if(['create','join','ready'].includes(action)){const id=await hash((request.headers.get('CF-Connecting-IP')||'local')+':'+action),window=action==='create'?3600000:60000,limit=action==='create'?10:120;await db.prepare('INSERT INTO links_friend_limits(id,starts,hits) VALUES(?,?,1) ON CONFLICT(id) DO UPDATE SET hits=CASE WHEN starts<? THEN 1 ELSE hits+1 END,starts=CASE WHEN starts<? THEN excluded.starts ELSE starts END').bind(id,now,now-window,now-window).run();const rate=await db.prepare('SELECT hits FROM links_friend_limits WHERE id=?').bind(id).first();if(rate.hits>limit)return json({error:'Too many requests. Please try again later.'},429)}
  const name=String(b.name||'').trim(),validName=()=>name.length>0&&name.length<=32;
  if(action==='create'){
   if(!validName())return json({error:'Enter your name (up to 32 characters).'},400);
   if(!['mixed',...CATEGORIES].includes(b.category)||!['mixed','easy','medium','hard'].includes(b.difficulty))return json({error:'Choose a category and difficulty.'},400);
   const categories=b.category==='mixed'?CATEGORIES:[b.category];const loaded=await loadGameQuestions({env,categories,backup:STARTER,perGroup:20,difficulties:b.difficulty==='mixed'?['easy','medium','hard']:[b.difficulty]});let deck;try{deck=challengeDeck(completeQuestionBank(loaded.questions,STARTER.filter(q=>categories.includes(q.category)&&(b.difficulty==='mixed'||q.difficulty===b.difficulty)),{minimum:30}),categories,b.difficulty)}catch(e){return json({error:e.message},400)}
   const code=crypto.randomUUID().replace(/-/g,'').slice(0,10).toUpperCase(),token=crypto.randomUUID()+crypto.randomUUID(),seat=await hash(token);
   const s={code,category:b.category,difficulty:b.difficulty,phase:'lobby',game:1,index:-1,deck,notice:loaded.notice,players:{[seat]:{name,score:0,ready:false,answer:null}}};await db.prepare('DELETE FROM links_friend_rooms WHERE expires<=?').bind(now).run();await db.prepare('INSERT INTO links_friend_rooms(code,state,expires) VALUES(?,?,?)').bind(code,JSON.stringify(s),now+7200000).run();return json({...challengeView(s,seat,now),token});
  }
  const code=String(b.code||url.searchParams.get('code')||'').trim().toUpperCase();if(!/^[A-F0-9]{10}$/.test(code))return json({error:'Enter a valid room code.'},400);
  const token=request.headers.get('x-challenge-token')||'',seat=token?await hash(token):'';
  let rematchQuestions;
  for(let attempt=0;attempt<5;attempt++){
   const row=await db.prepare('SELECT * FROM links_friend_rooms WHERE code=? AND expires>?').bind(code,Date.now()).first();if(!row)return json({error:'Challenge expired or not found. Ask your friend for a new link.'},404);
   const s=JSON.parse(row.state),time=Date.now();let changed=advance(s,time),issued,newSeat=seat;
   if(action==='join'){
    if(!s.players[seat]){if(s.phase!=='lobby')return json({error:'This challenge has started. Join a new challenge with your friends.'},409);if(Object.keys(s.players).length>=8)return json({error:'This challenge is full (8 players).'},409);if(!validName())return json({error:'Enter your name (up to 32 characters).'},400);if(Object.values(s.players).some(p=>p.name.toLowerCase()===name.toLowerCase()))return json({error:'That name is already in use.'},409);issued=crypto.randomUUID()+crypto.randomUUID();newSeat=await hash(issued);s.players[newSeat]={name,score:0,ready:false,answer:null};changed=true}
   }else{
    if(!s.players[seat])return json({error:'Join the challenge first.'},401);
    if(action==='ready'){
     if(!['lobby','ended'].includes(s.phase)||b.game!==s.game)return json({error:'The game has already moved on.'},409);s.players[seat].ready=true;changed=true;
     if(Object.keys(s.players).length>=2&&Object.values(s.players).every(p=>p.ready)){if(s.phase==='ended'){const categories=s.category==='mixed'?CATEGORIES:[s.category];
      s.seenQuestions=[...new Set([...(s.seenQuestions||[]),...s.deck.map(q=>q.id)])].slice(-1500);
      rematchQuestions ||= loadGameQuestions({env,categories,backup:STARTER,exclude:s.seenQuestions,perGroup:20,difficulties:s.difficulty==='mixed'?['easy','medium','hard']:[s.difficulty]});
      const loaded=await rematchQuestions;
      s.deck=challengeDeck(completeQuestionBank(loaded.questions,STARTER.filter(q=>categories.includes(q.category)&&(s.difficulty==='mixed'||q.difficulty===s.difficulty)),{exclude:s.seenQuestions,minimum:30}),categories,s.difficulty);s.notice=loaded.notice;s.game++;delete s.winners;
     }begin(s,Date.now())}
    }else if(action==='answer'){
     const p=s.players[seat];if(s.phase!=='question'||time<s.startsAt||time>=s.deadline||b.game!==s.game||b.index!==s.index||p.answer?.index===s.index||(s.contenders&&!s.contenders.includes(seat)))return json({error:'Answer locked. Wait for the next question.'},409);if(!Number.isInteger(b.choice)||b.choice<0||b.choice>3)return json({error:'Choose one answer.'},400);p.answer={index:s.index,choice:b.choice,elapsed:Math.max(0,time-s.startsAt)};changed=true;
    }else if(action==='leave'){
     if(!['lobby','ended'].includes(s.phase))return json({error:'You can close this page now. Your result stays in this game.'},409);delete s.players[seat];for(const p of Object.values(s.players))p.ready=false;changed=true;
    }else if(action!=='state')return json({error:'Unknown action.'},400);
   }
   if(changed){const update=await db.prepare('UPDATE links_friend_rooms SET state=?,version=version+1 WHERE code=? AND version=?').bind(JSON.stringify(s),code,row.version).run();if(!update.meta?.changes)continue}
   return json({...challengeView(s,newSeat,time),...(issued?{token:issued}:{})});
  }return json({error:'The room is busy. Please try again.'},409);
 }catch{return json({error:'Challenge could not complete that request. Please try again.'},503)}
}
