import {replayShots,courses} from '../../../public/new-build/mini-golf-core.mjs';
import {ensureScoreboard,partyResultStatements} from '../../lib/party-scoreboard.js';
const reply=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});
const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),n=>n.toString(16).padStart(2,'0')).join('');
export async function onRequest({request,env}){try{
if(request.method!=='POST')return reply({error:'Method not allowed'},405);
if(request.headers.get('Origin')!==new URL(request.url).origin)return reply({error:'Open Mini Golf on LINKS.'},403);
const raw=await request.text();if(raw.length>12000)return reply({error:'Request too large'},413);let b;try{b=JSON.parse(raw)}catch{return reply({error:'Invalid request'},400)}
if(!env.DB)return reply({error:'Rooms unavailable. Solo play still works.'},503);
const db=env.DB;await db.prepare('CREATE TABLE IF NOT EXISTS links_mini_golf_rooms(id TEXT PRIMARY KEY,state TEXT NOT NULL,version INTEGER NOT NULL,expires INTEGER NOT NULL)').run();
const name=String(b.name||'').trim().replace(/[<>\x00-\x1f]/g,'').slice(0,24),secret=typeof b.token==='string'?b.token:'';
if(secret.length<32||secret.length>100)return reply({error:'Invalid player key'},400);const key=await hash(secret);
let id=String(b.room||'').toUpperCase();
if(b.action==='solo'){
 if(!name||!/^[A-F0-9]{10}$/.test(id)||!Number.isInteger(b.hole)||b.hole<0||b.hole>=courses.length)return reply({error:'Invalid solo round'},400);
 let result;try{result=replayShots(b.shots,b.hole,3);if(!result.done&&result.strokes!==10)throw Error()}catch{return reply({error:'Finish the hole first'},400)}
 await ensureScoreboard(db);await db.batch([
 db.prepare("INSERT OR IGNORE INTO links_party_guest_names(game,room,round,seat,name) VALUES('mini-golf',?,1,?,?)").bind(id,key,name),
 db.prepare("INSERT OR IGNORE INTO links_party_results(game,room,round,seat,score,win,finished) VALUES('mini-golf',?,1,?,?,0,?)").bind(id,key,result.strokes,Date.now())]);return reply({ok:true});
}
if(b.action==='create'){if(!name)return reply({error:'Enter a player name'},400);id=crypto.randomUUID().replaceAll('-','').slice(0,10).toUpperCase();const state={rulesVersion:3,phase:'lobby',round:0,host:key,players:[{key,name,score:null,dnf:false}]};await db.prepare('INSERT INTO links_mini_golf_rooms VALUES(?,?,0,?)').bind(id,JSON.stringify(state),Date.now()+86400000).run();return reply({room:id})}
if(!/^[A-F0-9]{10}$/.test(id))return reply({error:'Enter the room code'},400);
for(let attempt=0;attempt<5;attempt++){
const row=await db.prepare('SELECT * FROM links_mini_golf_rooms WHERE id=? AND expires>?').bind(id,Date.now()).first();if(!row)return reply({error:'Room expired or not found'},404);const s=JSON.parse(row.state);let me=s.players.find(p=>p.key===key);
if(b.action==='join'){if(!me){if(s.phase!=='lobby')return reply({error:'This round has started. Join a new room.'},409);if(s.players.length>=8)return reply({error:'Room full (8 players)'},409);if(!name)return reply({error:'Enter a player name'},400);me={key,name,score:null,dnf:false};s.players.push(me)}}else if(!me)return reply({error:'Join this room first'},403);
if(b.action==='state')return reply({room:id,rulesVersion:s.rulesVersion||1,phase:s.phase,round:s.round,hole:(Math.max(1,s.round)-1)%courses.length,host:s.host===key,me:{finished:me.score!==null||me.dnf},remaining:s.players.filter(p=>p.score===null&&!p.dnf).length,players:s.players.map(p=>({name:p.name,finished:p.score!==null||p.dnf,...(s.phase==='results'?{score:p.score,dnf:p.dnf}:{})}))});
if(b.action==='start'){if(key!==s.host)return reply({error:'Only the host can start'},403);if(!['lobby','results'].includes(s.phase)||b.round!==s.round)return reply({error:'Round already started'},409);s.round++;s.phase='playing';s.players.forEach(p=>{p.score=null;p.dnf=false})}
else if(b.action==='finish'){if(b.round!==s.round)return reply({error:'This round has ended'},409);if(me.score!==null||me.dnf)return reply({ok:true});if(s.phase!=='playing')return reply({error:'Round is not playing'},409);let result;try{result=replayShots(b.shots,(s.round-1)%courses.length,s.rulesVersion||1);if(!result.done&&result.strokes!==10)throw Error()}catch{return reply({error:'Finish the hole or reach 10 strokes first'},400)}me.score=result.strokes;if(s.players.every(p=>p.score!==null||p.dnf))s.phase='results'}
else if(b.action==='end'){if(key!==s.host)return reply({error:'Only the host can end a round'},403);if(s.phase!=='playing'||b.round!==s.round)return reply({error:'Round already ended'},409);s.players.forEach(p=>{if(p.score===null)p.dnf=true});s.phase='results'}
else if(b.action!=='join')return reply({error:'Unknown action'},400);
const encoded=JSON.stringify(s);
let records=[];
if(s.phase==='results'){await ensureScoreboard(db);const snapshot={phase:'ended',game:s.round,participantCount:s.players.length,players:Object.fromEntries(s.players.filter(p=>!p.dnf&&p.score!==null).map(p=>[p.key,{name:p.name,score:p.score}]))};records=partyResultStatements(db,'mini-golf',id,row.version,encoded,[snapshot])}
const [result]=await db.batch([db.prepare('UPDATE links_mini_golf_rooms SET state=?,version=version+1 WHERE id=? AND version=?').bind(encoded,id,row.version),...records]);if(result.meta.changes)return reply({ok:true,room:id});
}return reply({error:'Room updated. Please retry.'},409);
}catch{return reply({error:'Connection problem. Please try again.'},503)}}
