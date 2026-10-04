import {SCORE_GAMES,ensureScoreboard,periodStart} from '../../lib/party-scoreboard.js';
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
  if(!session)return json({error:'Verify your email to save your results.'},401);
  const raw=await request.text();if(raw.length>16000)return json({error:'Request too large.'},413);let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
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
 const period=u.searchParams.get('period')||'week',game=u.searchParams.get('game')||'all';if(!['week','year','all'].includes(period)||(game!=='all'&&!SCORE_GAMES[game]))return json({error:'Choose a valid scoreboard.'},400);
 const profile=session?await db.prepare('SELECT id,name FROM links_party_score_profiles WHERE email=?').bind(session.email).first():null;
 const base=`FROM links_party_results r JOIN links_party_score_seats s ON s.game=r.game AND s.room=r.room AND s.seat=r.seat JOIN links_party_score_profiles p ON p.email=s.email WHERE r.finished>=? AND (?='all' OR r.game=?)`;
 const args=[periodStart(period),game,game];
 const rows=await db.prepare(`SELECT p.id,p.name,COUNT(*) AS played,SUM(r.win) AS wins,${game==='all'?'NULL':'MAX(r.score)'} AS best ${base} GROUP BY p.id,p.name ORDER BY ${game==='all'?'wins':'best'} DESC,played ASC,p.id LIMIT 100`).bind(...args).all();
 const best=game==='all'?null:await db.prepare(`SELECT MAX(r.score) AS score ${base}`).bind(...args).first();
 const mine=profile?await db.prepare(`SELECT COUNT(*) AS played,COALESCE(SUM(r.win),0) AS wins,${game==='all'?'NULL':'MAX(r.score)'} AS best ${base} AND p.id=?`).bind(...args,profile.id).first():null;
 return json({games:Object.entries(SCORE_GAMES).map(([id,g])=>({id,name:g.name,storage:g.storage})),period,game,profile,mine,signedIn:!!session,rows:rows.results,highScore:best?.score??null});
 }catch{return json({error:'The scoreboard could not load. Please try again.'},503)}}
