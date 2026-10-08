import {BANK,shuffle,beginDraw,advance,view,artist,promptFor,drawing,matches,archive} from '../../lib/sketchy-business.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const hash=async t=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))).map(n=>n.toString(16).padStart(2,'0')).join('');
export async function onRequest({request,env}){try{
 const u=new URL(request.url),db=env.DB,now=Date.now();if(!db)return json({error:'Game unavailable.'},503);
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 if(request.method==='POST'&&request.headers.get('Origin')!==u.origin)return json({error:'Open the game on LINKS first.'},403);
 let b={};if(request.method==='POST'){if(Number(request.headers.get('Content-Length'))>45000)return json({error:'Drawing too large.'},413);const raw=await request.text();if(raw.length>45000)return json({error:'Drawing too large.'},413);try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}}
 const action=b.action||'state';
 await db.batch([db.prepare('CREATE TABLE IF NOT EXISTS links_sketch_rooms(code TEXT PRIMARY KEY,state TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 0,expires INTEGER NOT NULL)'),db.prepare('CREATE TABLE IF NOT EXISTS links_sketch_limits(id TEXT PRIMARY KEY,starts INTEGER NOT NULL,hits INTEGER NOT NULL)')]);
 // Expired rooms and drawings are purged on subsequent game requests.
 await db.batch([db.prepare('DELETE FROM links_sketch_rooms WHERE expires<=?').bind(now),db.prepare('DELETE FROM links_sketch_limits WHERE starts<?').bind(now-7200000)]);
 if(request.method==='POST'){const window=action==='create'?3600000:60000,limit=action==='create'?10:360,id=await hash((request.headers.get('CF-Connecting-IP')||'local')+':'+(action==='create'?'create':'action'));await db.prepare('INSERT INTO links_sketch_limits(id,starts,hits) VALUES(?,?,1) ON CONFLICT(id) DO UPDATE SET hits=CASE WHEN starts<? THEN 1 ELSE hits+1 END,starts=CASE WHEN starts<? THEN excluded.starts ELSE starts END').bind(id,now,now-window,now-window).run();if((await db.prepare('SELECT hits FROM links_sketch_limits WHERE id=?').bind(id).first()).hits>limit)return json({error:'Please wait before trying again.'},429)}
 const name=String(b.name||'').trim(),validName=name.length>0&&name.length<=32;
 if(action==='create'){
 if(!validName)return json({error:'Enter a name up to 32 characters.'},400);
 const code=crypto.randomUUID().replace(/-/g,'').slice(0,10).toUpperCase(),token=crypto.randomUUID()+crypto.randomUUID(),seat=await hash(token);
 const s={code,game:1,index:-1,phase:'lobby',owner:seat,displayKey:crypto.randomUUID()+crypto.randomUUID(),players:{[seat]:{name,score:0,ready:false}}};await db.prepare('INSERT INTO links_sketch_rooms(code,state,expires) VALUES(?,?,?)').bind(code,JSON.stringify(s),now+7200000).run();return json({...view(s,seat,now),token});}
 const code=String(b.code||u.searchParams.get('code')||'').toUpperCase();if(!/^[A-F0-9]{10}$/.test(code))return json({error:'Enter your room code.'},400);
 const token=request.headers.get('x-sketch-token')||'',seat=token?await hash(token):'',displayKey=request.headers.get('x-sketch-display')||'';
 for(let n=0;n<5;n++){
 const row=await db.prepare('SELECT * FROM links_sketch_rooms WHERE code=? AND expires>?').bind(code,Date.now()).first();if(!row)return json({error:'Room expired or not found.'},404);
 const s=JSON.parse(row.state),time=Date.now(),display=!!displayKey&&displayKey===s.displayKey;const oldPhase=s.phase;if(oldPhase==='guess'&&time>=s.deadline)archive(s);let changed=advance(s,time),issued,current=seat;
 if(action==='join'){
 if(display)return json({error:'Join on your phone.'},403);
 if(!s.players[seat]){if(s.phase!=='lobby'||Object.keys(s.players).length>=8)return json({error:'Room started or full. Join the next game.'},409);if(!validName)return json({error:'Enter a name up to 32 characters.'},400);if(Object.values(s.players).some(p=>p.name.toLowerCase()===name.toLowerCase()))return json({error:'That name is taken.'},409);issued=crypto.randomUUID()+crypto.randomUUID();current=await hash(issued);s.players[current]={name,score:0,ready:false};changed=true}
 }else{
 if(!s.players[seat]&&!display)return json({error:'Join this room first.'},401);
 if(display&&action!=='state')return json({error:'TV display is read only.'},403);
 const p=s.players[seat];
 if(['drawing','guess'].includes(action)){
 if(b.game!==s.game||b.round!==s.round||time<s.startsAt||time>=s.deadline)return json({error:'This round is locked.'},409);
 if(action==='drawing'){
 if(s.phase!=='draw'||s.finished[seat])return json({error:'Your drawing is locked.'},409);
 let strokes;try{strokes=drawing(b.strokes)}catch(e){return json({error:e.message},400)}
 s.drawings[seat]=strokes;if(b.finish){if(!strokes.length)return json({error:'Draw something before finishing.'},400);s.finished[seat]=true}
 }else{
 if(s.phase!=='guess'||b.index!==s.index||seat===artist(s)||s.solved[seat])return json({error:'Guessing is locked for this picture.'},409);
 const text=String(b.text||'').trim();if(!text||text.length>100)return json({error:'Enter a guess up to 100 characters.'},400);
 if(time-(s.attempts[seat]||0)<2000)return json({error:'Wait two seconds between guesses.'},429);
 s.attempts[seat]=time;s.lastGuess[seat]=text;
 if(matches(text,promptFor(s,artist(s)))){const mult=s.round===2?2:1,points=(100+Math.floor(200*Math.max(0,s.deadline-time)/(s.deadline-s.startsAt)))*mult;s.solved[seat]=true;p.score+=points;p.roundPoints=points;s.players[artist(s)].score+=100*mult;s.players[artist(s)].roundPoints+=100*mult;
 if(Object.keys(s.solved).length===s.order.length-1){archive(s);s.phase='reveal';s.deadline=time+7000}
 }
 }changed=true;
 }else if(action==='ready'){if(s.phase!=='lobby')return json({error:'Game already started.'},409);p.ready=!p.ready;changed=true}
 else if(action==='start'){
 if(seat!==s.owner)return json({error:'Only the creator can start.'},403);
 if(s.phase!=='lobby'||Object.keys(s.players).length<3||!Object.values(s.players).every(p=>p.ready))return json({error:'Need 3–8 players, all ready.'},409);
 s.order=shuffle(Object.keys(s.players));s.deck=shuffle(BANK.map(p=>p.id)).slice(0,s.order.length*2);s.round=1;s.archive=[];beginDraw(s,time);changed=true;
 }else if(action==='again'){
 if(seat!==s.owner||s.phase!=='ended')return json({error:'Only the creator can restart after results.'},403);
 s.phase='lobby';s.game++;s.index=-1;s.order=[];s.deck=[];s.drawings={};s.finished={};s.archive=[];s.solved={};s.lastGuess={};for(const p of Object.values(s.players)){p.score=0;p.roundPoints=0;p.ready=false}changed=true;
 }else if(action!=='state')return json({error:'Unknown action.'},400);
 }
 if(changed){const update=await db.prepare('UPDATE links_sketch_rooms SET state=?,version=version+1 WHERE code=? AND version=?').bind(JSON.stringify(s),code,row.version).run();if(!update.meta?.changes)continue}
 return json({...view(s,current,time,display),...(issued?{token:issued}:{})});
 }return json({error:'Room busy. Please try again.'},409);
 }catch{return json({error:'Unable to complete that request. Please try again.'},503)}}
