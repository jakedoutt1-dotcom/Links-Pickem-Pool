import {requirePartyPass} from '../../lib/party-access.js';
import {LIBRARY,shuffle,startRound,advance,view} from '../../lib/captain-clash.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const hash=async t=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))).map(n=>n.toString(16).padStart(2,'0')).join('');
export async function onRequest({request,env}){try{
 const u=new URL(request.url),db=env.DB,now=Date.now();if(!db)return json({error:'Game unavailable.'},503);
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 if(request.method==='POST'&&request.headers.get('Origin')!==u.origin)return json({error:'Open the game on LINKS first.'},403);
 let b={};if(request.method==='POST'){if(Number(request.headers.get('Content-Length'))>200000)return json({error:'Photo too large.'},413);const raw=await request.text();if(raw.length>200000)return json({error:'Photo too large.'},413);try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}}
 const action=b.action||'state';
 await db.batch([db.prepare('CREATE TABLE IF NOT EXISTS links_caption_rooms(code TEXT PRIMARY KEY,state TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 0,expires INTEGER NOT NULL)'),db.prepare('CREATE TABLE IF NOT EXISTS links_caption_photos(id TEXT PRIMARY KEY,code TEXT NOT NULL,data TEXT NOT NULL,expires INTEGER NOT NULL)'),db.prepare('CREATE TABLE IF NOT EXISTS links_caption_limits(id TEXT PRIMARY KEY,starts INTEGER NOT NULL,hits INTEGER NOT NULL)')]);
 // Expired photos are inaccessible immediately and purged on subsequent game requests.
 await db.batch([db.prepare('DELETE FROM links_caption_photos WHERE expires<=?').bind(now),db.prepare('DELETE FROM links_caption_rooms WHERE expires<=?').bind(now),db.prepare('DELETE FROM links_caption_limits WHERE starts<?').bind(now-7200000)]);
 if(request.method==='POST'){const window=action==='create'?3600000:60000,limit=action==='create'?10:120,id=await hash((request.headers.get('CF-Connecting-IP')||'local')+':'+(action==='create'?'create':'action'));await db.prepare('INSERT INTO links_caption_limits(id,starts,hits) VALUES(?,?,1) ON CONFLICT(id) DO UPDATE SET hits=CASE WHEN starts<? THEN 1 ELSE hits+1 END,starts=CASE WHEN starts<? THEN excluded.starts ELSE starts END').bind(id,now,now-window,now-window).run();if((await db.prepare('SELECT hits FROM links_caption_limits WHERE id=?').bind(id).first()).hits>limit)return json({error:'Please wait before trying again.'},429)}
 const name=String(b.name||'').trim(),validName=name.length>0&&name.length<=32;
 if(action==='create'){const paymentGate=await requirePartyPass(request,env);if(paymentGate)return paymentGate;
 if(!validName||!['links','photos','mixed'].includes(b.mode))return json({error:'Enter your name and choose pictures.'},400);
 const code=crypto.randomUUID().replace(/-/g,'').slice(0,10).toUpperCase(),token=crypto.randomUUID()+crypto.randomUUID(),seat=await hash(token);
 const s={code,game:1,index:-1,phase:'lobby',mode:b.mode,owner:seat,displayKey:crypto.randomUUID()+crypto.randomUUID(),photos:[],players:{[seat]:{name,score:0,ready:false}}};await db.prepare('INSERT INTO links_caption_rooms(code,state,expires) VALUES(?,?,?)').bind(code,JSON.stringify(s),now+7200000).run();return json({...view(s,seat,now),token});}
 const code=String(b.code||u.searchParams.get('code')||'').toUpperCase();if(!/^[A-F0-9]{10}$/.test(code))return json({error:'Enter the room code from your invitation.'},400);
 const token=request.headers.get('x-captain-token')||'',seat=token?await hash(token):'',displayKey=request.headers.get('x-captain-display')||'';
 for(let n=0;n<5;n++){
 const row=await db.prepare('SELECT * FROM links_caption_rooms WHERE code=? AND expires>?').bind(code,Date.now()).first();if(!row)return json({error:'Room expired or not found. Start a new clash.'},404);
 const s=JSON.parse(row.state),time=Date.now(),display=!!displayKey&&displayKey===s.displayKey;let changed=advance(s,time),issued,current=seat,photoInsert=null;
 if(action==='join'){
 if(!s.players[seat]){if(s.phase!=='lobby'||Object.keys(s.players).length>=8)return json({error:'Room started or full. Join the next game.'},409);if(!validName)return json({error:'Enter a name (up to 32 characters).'},400);if(Object.values(s.players).some(p=>p.name.toLowerCase()===name.toLowerCase()))return json({error:'That name is already taken.'},409);issued=crypto.randomUUID()+crypto.randomUUID();current=await hash(issued);s.players[current]={name,score:0,ready:false};changed=true}
 }else{
 if(!s.players[seat]&&!display)return json({error:'Join this room first.'},401);
 if(display&&action!=='state')return json({error:'The TV display is read only.'},403);
 if(u.searchParams.has('photo')&&request.method==='GET'){
 const id=u.searchParams.get('photo'),p=s.photos.find(p=>p.id===id);if(!p||(!p.approved&&!(!display&&(seat===s.owner||p.seat===seat))))return json({error:'Photo unavailable.'},404);
 const stored=await db.prepare('SELECT data FROM links_caption_photos WHERE id=? AND code=? AND expires>?').bind(id,code,time).first();if(!stored)return json({error:'Photo expired.'},404);const bytes=Uint8Array.from(atob(stored.data),c=>c.charCodeAt(0));return new Response(bytes,{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }
 const p=s.players[seat];
 if(['caption','vote'].includes(action)&&(b.game!==s.game||b.index!==s.index))return json({error:'This round has already moved on.'},409);
 if(action==='ready'){if(s.phase!=='lobby')return json({error:'The game has started.'},409);p.ready=!p.ready;changed=true}
 else if(action==='start'){
 if(seat!==s.owner)return json({error:'Only the room creator can start.'},403);
 if(s.phase!=='lobby'||Object.keys(s.players).length<3||!Object.values(s.players).every(p=>p.ready))return json({error:'Need 3–8 players, all ready.'},409);
 const uploads=shuffle(s.photos.filter(p=>p.approved).map(p=>({id:p.id,label:'Your room’s photo',upload:true})));
 if(s.mode==='photos'&&uploads.length<5)return json({error:'Approve at least five photos or start a room using LINKS pictures.'},409);
 s.deck=s.mode==='photos'?uploads.slice(0,5):s.mode==='mixed'&&uploads.length?shuffle([...uploads.slice(0,3),...shuffle(LIBRARY).slice(0,5-Math.min(3,uploads.length))]):shuffle(LIBRARY);s.index=0;startRound(s,time);changed=true;
 }else if(action==='caption'){
 const text=String(b.text||'').trim();if(s.phase!=='write'||time<s.startsAt||time>=s.deadline||p.caption)return json({error:'Caption locked. Wait for voting.'},409);if(!text||text.length>140)return json({error:'Write 1–140 characters.'},400);p.caption=text;changed=true;
 }else if(action==='vote'){
 if(s.phase!=='vote'||time>=s.deadline||p.vote)return json({error:'Voting is closed or your vote is already saved.'},409);const option=s.options.find(o=>o.id===b.option);if(!option||option.seat===seat)return json({error:'Choose someone else’s caption.'},400);p.vote=option.id;changed=true;
 }else if(action==='upload'){
 if(s.phase!=='lobby'||s.mode==='links')return json({error:'Uploads are available in a photo or mixed lobby.'},409);if(s.photos.filter(p=>p.seat===seat).length>=5||s.photos.length>=24)return json({error:'Photo limit reached (5 per person, 24 per room).'},409);
 const data=String(b.data||'');if(data.length>180000||!/^\/9j\/[A-Za-z0-9+/=]+$/.test(data))return json({error:'Choose a smaller JPEG photo.'},400);let bytes;try{bytes=atob(data)}catch{return json({error:'Invalid photo.'},400)}if(bytes.charCodeAt(0)!==255||bytes.charCodeAt(1)!==216||bytes.charCodeAt(bytes.length-2)!==255||bytes.charCodeAt(bytes.length-1)!==217)return json({error:'Invalid JPEG photo.'},400);
 const id=crypto.randomUUID();s.photos.push({id,seat,approved:false});photoInsert={id,data};changed=true;
 }else if(action==='approve'||action==='reject'){
 if(seat!==s.owner||s.phase!=='lobby')return json({error:'Only the creator can review lobby photos.'},403);const photo=s.photos.find(p=>p.id===b.id);if(!photo)return json({error:'Photo not found.'},404);if(action==='approve')photo.approved=true;else s.photos=s.photos.filter(p=>p.id!==b.id);changed=true;
 }else if(action==='again'){
 if(seat!==s.owner||s.phase!=='ended')return json({error:'Only the creator can restart after the final results.'},403);s.phase='lobby';s.game++;s.index=-1;s.deck=[];delete s.options;for(const p of Object.values(s.players)){p.score=0;p.roundPoints=0;p.ready=false;p.caption='';p.vote=null}changed=true;
 }else if(action!=='state')return json({error:'Unknown action.'},400);
 }
 if(changed){const encoded=JSON.stringify(s),statements=[db.prepare('UPDATE links_caption_rooms SET state=?,version=version+1 WHERE code=? AND version=?').bind(encoded,code,row.version)];if(photoInsert)statements.push(db.prepare('INSERT INTO links_caption_photos(id,code,data,expires) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM links_caption_rooms WHERE code=? AND version=? AND state=?)').bind(photoInsert.id,code,photoInsert.data,row.expires,code,row.version+1,encoded));if(action==='reject')statements.push(db.prepare('DELETE FROM links_caption_photos WHERE id=? AND code=? AND EXISTS(SELECT 1 FROM links_caption_rooms WHERE code=? AND version=? AND state=?)').bind(b.id,code,code,row.version+1,encoded));const updates=await db.batch(statements);if(!updates[0].meta?.changes)continue}
 return json({...view(s,current,time,display),...(issued?{token:issued}:{})});
 }return json({error:'Room busy. Please try again.'},409);
 }catch{return json({error:'Unable to complete that request. Please try again.'},503)}}
