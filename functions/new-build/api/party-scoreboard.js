import {goalLineBoard} from '../../lib/goal-line-scoreboard.js';
import {SCORE_GAMES,BOARD_GAMES,ensureScoreboard,periodStart} from '../../lib/party-scoreboard.js';
import {partySession} from '../../lib/party-access.js';
import {ensureAccounts} from '../../lib/commissioner-account.js';
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function onRequest({request,env}){try{
 const db=env.DB,u=new URL(request.url);if(!db)return json({error:'Scoreboard unavailable.'},503);
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 if(request.method==='POST'&&request.headers.get('Origin')!==u.origin)return json({error:'Open the scoreboard on LINKS first.'},403);
 await ensureScoreboard(db);await ensureAccounts(db);const session=await partySession(request,db);
 if(request.method==='POST'){

  const raw=await request.text();if(raw.length>16000)return json({error:'Request too large.'},413);let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
  if(b.action==='guest'){
   if(typeof b.secret!=='string'||!/^[a-f0-9]{64}$/i.test(b.secret))return json({error:'Invalid guest identity.'},400);
   if(!Array.isArray(b.seats)||b.seats.length>50)return json({error:'Too many game seats.'},400);
   const secretHash=await hash(b.secret);
   let profile=await db.prepare('SELECT id,name FROM links_party_guest_profiles WHERE secret_hash=?').bind(secretHash).first();
   const requestedName=String(b.name||'').trim().replace(/[<>\\x00-\\x1f]/g,'').slice(0,32);
   if(!profile){const id=crypto.randomUUID();await db.prepare('INSERT OR IGNORE INTO links_party_guest_profiles(id,secret_hash,name) VALUES(?,?,?)').bind(id,secretHash,requestedName||'Guest Player').run();profile=await db.prepare('SELECT id,name FROM links_party_guest_profiles WHERE secret_hash=?').bind(secretHash).first();}
   let linked=0;
   for(const input of b.seats){const cfg=SCORE_GAMES[input.game],room=String(input.room||'');
    if(!cfg||!/^[A-F0-9]{10}$/.test(room)||typeof input.token!=='string'||input.token.length!==72)continue;
    const seat=await hash(input.token);
    let valid=await db.prepare('SELECT 1 AS ok FROM links_party_results WHERE game=? AND room=? AND seat=? LIMIT 1').bind(input.game,room,seat).first();
    if(!valid){try{const row=await db.prepare(`SELECT state FROM ${cfg.table} WHERE code=? AND expires>?`).bind(room,Date.now()).first();valid=row&&JSON.parse(row.state).players?.[seat]}catch{valid=null}}
    if(!valid)continue;
    const claimed=await db.prepare('SELECT email FROM links_party_score_seats WHERE game=? AND room=? AND seat=?').bind(input.game,room,seat).first();
    if(claimed)continue;
    const result=await db.prepare('INSERT OR IGNORE INTO links_party_guest_seats(game,room,seat,guest_id) VALUES(?,?,?,?)').bind(input.game,room,seat,profile.id).run();
    linked+=result.meta?.changes||0;
    if(profile.name==='Guest Player'){const player=await db.prepare('SELECT name FROM links_party_guest_names WHERE game=? AND room=? AND seat=? LIMIT 1').bind(input.game,room,seat).first();if(player?.name){await db.prepare('UPDATE links_party_guest_profiles SET name=? WHERE id=? AND name=?').bind(player.name,profile.id,'Guest Player').run();}}
   }
   profile=await db.prepare('SELECT id,name FROM links_party_guest_profiles WHERE id=?').bind(profile.id).first();
   return json({ok:true,linked,profile});
  }
  if(!session)return json({error:'Sign in to link a member record.'},401);
  const existing=b.action==='link'?await db.prepare('SELECT name FROM links_party_score_profiles WHERE email=?').bind(session.email).first():null;
  const name=String(existing?.name||b.name||'').trim();if(name.length<1||name.length>32)return json({error:'Choose a public name, up to 32 characters.'},400);
  if(!Array.isArray(b.seats)||b.seats.length>50)return json({error:'Save up to 50 rooms at a time.'},400);
  if(b.action!=='link')await db.prepare('INSERT INTO links_party_score_profiles(email,id,name) VALUES(?,?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name').bind(session.email,crypto.randomUUID(),name).run();
  let linked=0;
  for(const input of b.seats){const cfg=SCORE_GAMES[input.game],room=String(input.room||'');if(!cfg||!/^[A-F0-9]{10}$/.test(room)||typeof input.token!=='string'||input.token.length!==72)continue;
   const seat=await hash(input.token);let valid=await db.prepare('SELECT 1 AS ok FROM links_party_results WHERE game=? AND room=? AND seat=? LIMIT 1').bind(input.game,room,seat).first();
   if(!valid){try{const row=await db.prepare(`SELECT state FROM ${cfg.table} WHERE code=? AND expires>?`).bind(room,Date.now()).first();valid=row&&JSON.parse(row.state).players?.[seat]}catch{valid=null}}
   if(!valid)continue;
   // Possession of the private seat token proves ownership; names never do.
   const r=await db.prepare('INSERT OR IGNORE INTO links_party_score_seats(game,room,seat,email) VALUES(?,?,?,?)').bind(input.game,room,seat,session.email).run();linked+=r.meta?.changes||0;
  }return json({ok:true,linked});
 }
 const period=u.searchParams.get('period')||'week',game=u.searchParams.get('game')||'all';if(!['week','year','all'].includes(period)||(game!=='all'&&!BOARD_GAMES[game]))return json({error:'Choose a valid scoreboard.'},400);
 if(game==='goal-line')return json({...await goalLineBoard(db,period),games:Object.entries(BOARD_GAMES).map(([id,g])=>({id,...g})),game,period});
 const profile=session?await db.prepare('SELECT id,name FROM links_party_score_profiles WHERE email=?').bind(session.email).first():null;
 const base=`FROM links_party_results r JOIN links_party_score_seats s ON s.game=r.game AND s.room=r.room AND s.seat=r.seat JOIN links_party_score_profiles p ON p.email=s.email WHERE r.game IN ('trivia-rally','friend-challenge','million-point','dead-air','last-alibi') AND r.finished>=? AND (?='all' OR r.game=?)`;
 const args=[periodStart(period),game,game];
 // Public guests appear without accounts. Claimed seats are shown only once.
 const guestBase=`FROM links_party_results r JOIN links_party_guest_names g ON g.game=r.game AND g.room=r.room AND g.round=r.round AND g.seat=r.seat WHERE r.game IN ('trivia-rally','friend-challenge','million-point','dead-air','last-alibi') AND r.finished>=? AND (?='all' OR r.game=?) AND NOT EXISTS(SELECT 1 FROM links_party_score_seats ss WHERE ss.game=r.game AND ss.room=r.room AND ss.seat=r.seat)`;
 const members=await db.prepare(`SELECT p.id,p.name,COUNT(*) AS played,SUM(r.win) AS wins,${game==='all'?'NULL':'MAX(r.score)'} AS best ${base} GROUP BY p.id,p.name`).bind(...args).all();
 const guests=await db.prepare(`SELECT COALESCE(gp.id,('guest:'||r.game||':'||r.room||':'||r.seat)) AS id,COALESCE(gp.name,MAX(g.name)) AS name,COUNT(*) AS played,SUM(r.win) AS wins,${game==='all'?'NULL':'MAX(r.score)'} AS best FROM links_party_results r JOIN links_party_guest_names g ON g.game=r.game AND g.room=r.room AND g.round=r.round AND g.seat=r.seat LEFT JOIN links_party_guest_seats gs ON gs.game=r.game AND gs.room=r.room AND gs.seat=r.seat LEFT JOIN links_party_guest_profiles gp ON gp.id=gs.guest_id WHERE r.game IN ('trivia-rally','friend-challenge','million-point','dead-air','last-alibi') AND r.finished>=? AND (?='all' OR r.game=?) AND NOT EXISTS(SELECT 1 FROM links_party_score_seats ss WHERE ss.game=r.game AND ss.room=r.room AND ss.seat=r.seat) GROUP BY COALESCE(gp.id,('guest:'||r.game||':'||r.room||':'||r.seat))`).bind(...args).all();
 const rows={results:[...members.results,...guests.results].sort((a,b)=>Number(game==='all'?b.wins:b.best)-Number(game==='all'?a.wins:a.best)||a.played-b.played||String(a.id).localeCompare(String(b.id))).slice(0,100)};
 const best=game==='all'?null:await db.prepare('SELECT MAX(score) AS score FROM links_party_results WHERE finished>=? AND game=?').bind(periodStart(period),game).first();
 const mine=profile?await db.prepare(`SELECT COUNT(*) AS played,COALESCE(SUM(r.win),0) AS wins,${game==='all'?'NULL':'MAX(r.score)'} AS best ${base} AND p.id=?`).bind(...args,profile.id).first():null;
 return json({games:Object.entries(BOARD_GAMES).map(([id,g])=>({id,name:g.name,storage:g.storage})),period,game,profile,mine,signedIn:!!session,rows:rows.results,highScore:best?.score??null});
 }catch{return json({error:'The scoreboard could not load. Please try again.'},503)}}
