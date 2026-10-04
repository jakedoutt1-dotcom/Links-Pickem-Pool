import {partyFinish,savePartyRoom} from '../../lib/party-scoreboard.js';
import {requirePartyPass} from '../../lib/party-access.js';
import {BANK,normalize,blocked,shuffle,start,advance,view} from '../../lib/say-what.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const hash=async t=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))).map(n=>n.toString(16).padStart(2,'0')).join('');
export async function onRequest({request,env}){try{
 const u=new URL(request.url),db=env.DB,now=Date.now();if(!db)return json({error:'Game unavailable.'},503);
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 if(request.method==='POST'&&request.headers.get('Origin')!==u.origin)return json({error:'Open the game on LINKS first.'},403);
 let b={};if(request.method==='POST'){if(Number(request.headers.get('Content-Length'))>8000)return json({error:'Photo too large.'},413);const raw=await request.text();if(raw.length>8000)return json({error:'Photo too large.'},413);try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}}
 const action=b.action||'state';
 await db.batch([db.prepare('CREATE TABLE IF NOT EXISTS links_word_rooms(code TEXT PRIMARY KEY,state TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 0,expires INTEGER NOT NULL)'),db.prepare('CREATE TABLE IF NOT EXISTS links_word_limits(id TEXT PRIMARY KEY,starts INTEGER NOT NULL,hits INTEGER NOT NULL)')]);
 // Expired photos are inaccessible immediately and purged on subsequent game requests.
 await db.batch([db.prepare('DELETE FROM links_word_rooms WHERE expires<=?').bind(now),db.prepare('DELETE FROM links_word_limits WHERE starts<?').bind(now-78000)]);
 if(request.method==='POST'){const window=action==='create'?3600000:60000,limit=action==='create'?10:120,id=await hash((request.headers.get('CF-Connecting-IP')||'local')+':'+(action==='create'?'create':'action'));await db.prepare('INSERT INTO links_word_limits(id,starts,hits) VALUES(?,?,1) ON CONFLICT(id) DO UPDATE SET hits=CASE WHEN starts<? THEN 1 ELSE hits+1 END,starts=CASE WHEN starts<? THEN excluded.starts ELSE starts END').bind(id,now,now-window,now-window).run();if((await db.prepare('SELECT hits FROM links_word_limits WHERE id=?').bind(id).first()).hits>limit)return json({error:'Please wait before trying again.'},429)}
 const name=String(b.name||'').trim(),validName=name.length>0&&name.length<=32;
 if(action==='create'){const paymentGate=await requirePartyPass(request,env);if(paymentGate)return paymentGate;
 if(!validName)return json({error:'Enter a name up to 32 characters.'},400);
 const code=crypto.randomUUID().replace(/-/g,'').slice(0,10).toUpperCase(),token=crypto.randomUUID()+crypto.randomUUID(),seat=await hash(token);
 const s={code,game:1,index:-1,phase:'lobby',owner:seat,displayKey:crypto.randomUUID()+crypto.randomUUID(),players:{[seat]:{name,score:0,ready:false}}};await db.prepare('INSERT INTO links_word_rooms(code,state,expires) VALUES(?,?,?)').bind(code,JSON.stringify(s),now+7200000).run();return json({...view(s,seat,now),token});}
 const code=String(b.code||u.searchParams.get('code')||'').toUpperCase();if(!/^[A-F0-9]{10}$/.test(code))return json({error:'Enter your room code.'},400);
 const token=request.headers.get('x-say-token')||'',seat=token?await hash(token):'',displayKey=request.headers.get('x-say-display')||'';
 for(let n=0;n<5;n++){
 const row=await db.prepare('SELECT * FROM links_word_rooms WHERE code=? AND expires>?').bind(code,Date.now()).first();if(!row)return json({error:'Room expired or not found.'},404);
 const s=JSON.parse(row.state),time=Date.now(),display=!!displayKey&&displayKey===s.displayKey;let changed=advance(s,time),issued,current=seat;const completed=partyFinish(s);
 if(action==='join'){
 if(display)return json({error:'Join on your phone.'},403);
 if(!s.players[seat]){if(s.phase!=='lobby'||Object.keys(s.players).length>=8)return json({error:'Room started or full. Join the next game.'},409);if(!validName)return json({error:'Enter a name up to 32 characters.'},400);if(Object.values(s.players).some(p=>p.name.toLowerCase()===name.toLowerCase()))return json({error:'That name is taken.'},409);issued=crypto.randomUUID()+crypto.randomUUID();current=await hash(issued);s.players[current]={name,score:0,ready:false};changed=true}
 }else{
 if(!s.players[seat]&&!display)return json({error:'Join this room first.'},401);
 if(display&&action!=='state')return json({error:'TV display is read only.'},403);
 const p=s.players[seat],giver=s.order?.[s.index%s.order.length],prompt=BANK[s.deck?.[s.index]];
 if(['clue','guess'].includes(action)){
 if(b.game!==s.game||b.index!==s.index||s.phase!=='question'||time<s.startsAt||time>=s.deadline)return json({error:'This round is locked.'},409);
 const text=String(b.text||'').trim();if(!text||text.length>120)return json({error:'Enter 1–120 characters.'},400);
 if(action==='clue'){
 if(seat!==giver)return json({error:'Only the clue giver can post clues.'},403);
 if(s.clues.length>=8)return json({error:'Eight clues posted. Let the room guess.'},409);
 if(blocked(text,prompt))return json({error:'That clue contains the answer or a forbidden word. Try another clue.'},400);
 s.clues.push(text);
 }else{
 if(seat===giver||s.solved[seat])return json({error:'You cannot guess this round.'},409);
 if(time-(s.attempts[seat]||0)<2000)return json({error:'Wait two seconds between guesses.'},429);
 s.attempts[seat]=time;s.lastGuess[seat]=text;
 if(normalize(text)===normalize(prompt.answer)||normalize(text)===normalize(prompt.answer).replace(/s$/,'')){
 const multiplier=s.index>=s.order.length?2:1,points=(100+Math.floor(200*Math.max(0,s.deadline-time)/(s.deadline-s.startsAt)))*multiplier;
 s.solved[seat]=true;p.score+=points;p.roundPoints=points;s.players[giver].score+=100*multiplier;s.players[giver].roundPoints+=100*multiplier;
 if(Object.keys(s.solved).length===s.order.length-1){s.phase='reveal';s.deadline=time+10000}
 }
 }changed=true;
 }else if(action==='ready'){if(s.phase!=='lobby')return json({error:'Game already started.'},409);p.ready=!p.ready;changed=true}
 else if(action==='start'){
 if(seat!==s.owner)return json({error:'Only the creator can start.'},403);
 if(s.phase!=='lobby'||Object.keys(s.players).length<3||!Object.values(s.players).every(p=>p.ready))return json({error:'Need 3–8 players, all ready.'},409);
 s.order=shuffle(Object.keys(s.players));s.deck=shuffle(BANK.map(p=>p.id)).slice(0,s.order.length*2);s.index=0;start(s,time);changed=true;
 }else if(action==='again'){
 if(seat!==s.owner||s.phase!=='ended')return json({error:'Only the creator can restart after results.'},403);
 s.phase='lobby';s.game++;s.index=-1;s.order=[];s.deck=[];s.clues=[];s.solved={};s.lastGuess={};for(const p of Object.values(s.players)){p.score=0;p.roundPoints=0;p.ready=false}changed=true;
 }else if(action!=='state')return json({error:'Unknown action.'},400);
 }
 if(changed){const update=await savePartyRoom(db,'say-what',code,row.version,s,completed);if(!update.meta?.changes)continue}
 return json({...view(s,current,time,display),...(issued?{token:issued}:{})});
 }return json({error:'Room busy. Please try again.'},409);
 }catch{return json({error:'Unable to complete that request. Please try again.'},503)}}
