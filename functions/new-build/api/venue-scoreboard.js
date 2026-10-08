import {triviaHostIdentity} from '../../lib/trivia-host-identity.js';
import {SCORE_GAMES,ensureScoreboard,periodStart} from '../../lib/party-scoreboard.js';
import {ensureVenue,distance} from '../../lib/venue-scoreboard.js';
const games={...SCORE_GAMES,'trivia-night':{name:'Hosted Trivia Night',table:'links_trivia_night_rooms'}};
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
const hash=async t=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function onRequest({request,env}){try{
 const db=env.DB,u=new URL(request.url);if(!db)return json({error:'Venue standings unavailable.'},503);
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 if(request.method==='POST'&&request.headers.get('Origin')!==u.origin)return json({error:'Open this game on LINKS first.'},403);
 let b={};if(request.method==='POST'){const raw=await request.text();if(raw.length>2000)return json({error:'Request too large.'},413);try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}}
 const game=String(b.game||u.searchParams.get('game')||''),cfg=games[game];if(!cfg)return json({error:'Choose a game.'},400);
 await ensureVenue(db);await ensureScoreboard(db);
 const room=String(b.room||u.searchParams.get('room')||'').toUpperCase(),partnerId=u.searchParams.get('partner');
 if(!partnerId||request.method==='POST'){
  if(!/^[A-F0-9]{10}$/.test(room))return json({error:'Choose a room.'},400);
  let row;try{row=await db.prepare(`SELECT * FROM ${cfg.table} WHERE code=? AND expires>?`).bind(room,Date.now()).first()}catch{return json({error:'Room not found.'},404)}if(!row)return json({error:'Room expired.'},404);
  const s=JSON.parse(row.state),token=request.headers.get('x-venue-token')||'',seat=token?await hash(token):'';let host=seat===(s.owner||Object.keys(s.players)[0]);
  if(game==='trivia-night'){const admin=await triviaHostIdentity(request,db);host=!!admin&&admin.pool_id===row.pool_id&&admin.player_name===row.host_name;if(!host&&admin?.verifiedHost&&row.pool_id>0){const owner=await db.prepare('SELECT email FROM links_pool_owners WHERE pool_id=?').bind(row.pool_id).first(),contact=await db.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='commissioner_email'").bind(row.pool_id).first();host=String(owner?.email||contact?.value||'').trim().toLowerCase()===admin.email;}}
  if(!host&&!s.players[seat])return json({error:'Join this room first.'},401);
  let venue=await db.prepare('SELECT p.id,p.name,p.logo FROM links_venue_rooms v JOIN links_partners p ON p.id=v.partner WHERE v.game=? AND v.room=? AND p.active=1').bind(game,room).first();
  if(request.method==='POST'){
   if(!host)return json({error:'Only the host can choose the venue.'},403);
   if(venue)return json({venue,host,locked:true});
   if(s.phase!=='lobby')return json({error:'Choose the venue before starting the game.'},409);
   let p;if(b.ref)p=await db.prepare('SELECT p.* FROM links_partner_links l JOIN links_partners p ON p.id=l.partner_id WHERE l.token=? AND p.active=1').bind(String(b.ref)).first();
   else if(b.confirmVenue===true){p=await db.prepare('SELECT * FROM links_partners WHERE id=? AND active=1').bind(String(b.partner||'')).first();}
   else{const c=b.coords;if(!c||![c.latitude,c.longitude,c.accuracy].every(Number.isFinite)||Math.abs(c.latitude)>90||Math.abs(c.longitude)>180||c.accuracy<0||c.accuracy>150)return json({error:'Location is not accurate enough. Try again or use the venue partner QR code.'},400);
    p=await db.prepare('SELECT * FROM links_partners WHERE id=? AND active=1').bind(String(b.partner||'')).first();if(p&&distance(c,p)>p.radius)p=null;
   }
   if(!p)return json({error:'No active partner matches this location or code.'},400);
   await db.prepare(`INSERT OR IGNORE INTO links_venue_rooms(game,room,partner,created) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM ${cfg.table} WHERE code=? AND version=? AND state=? AND expires>?)`).bind(game,room,p.id,Date.now(),room,row.version,row.state,Date.now()).run();
   venue=await db.prepare('SELECT p.id,p.name,p.logo FROM links_venue_rooms v JOIN links_partners p ON p.id=v.partner WHERE v.game=? AND v.room=?').bind(game,room).first();if(!venue)return json({error:'The room changed. Try again before starting.'},409);
  }
  return json({venue:venue||null,host,canChoose:host&&s.phase==='lobby'&&!venue});
 }
 const venue=await db.prepare('SELECT id,name,logo FROM links_partners WHERE id=? AND active=1').bind(partnerId).first();if(!venue)return json({error:'Venue not found.'},404);
 const period=u.searchParams.get('period')||'tonight';if(!['tonight','month'].includes(period))return json({error:'Choose Tonight or This month.'},400);
 const formats=(await db.prepare('SELECT DISTINCT r.format FROM links_venue_results r JOIN links_venue_rooms v ON v.game=r.game AND v.room=r.room WHERE v.partner=? AND r.game=? AND r.finished>=? ORDER BY r.format').bind(partnerId,game,periodStart(period)).all()).results;
 const format=u.searchParams.get('format')??formats[0]?.format??'';
 const rows=(await db.prepare(`SELECT COALESCE(p.name,r.name) AS name,COUNT(*) AS played,MAX(r.score) AS best FROM links_venue_results r JOIN links_venue_rooms v ON v.game=r.game AND v.room=r.room LEFT JOIN links_party_score_seats ss ON ss.game=r.game AND ss.room=r.room AND ss.seat=r.seat LEFT JOIN links_party_score_profiles p ON p.email=ss.email WHERE v.partner=? AND r.game=? AND r.format=? AND r.finished>=? GROUP BY COALESCE(p.id,r.game||':'||r.room||':'||r.seat) ORDER BY best DESC,name LIMIT 100`).bind(partnerId,game,format,periodStart(period)).all()).results;
 let current=null;if(/^[A-F0-9]{10}$/.test(room)){const linked=await db.prepare('SELECT 1 AS ok FROM links_venue_rooms WHERE game=? AND room=? AND partner=?').bind(game,room,partnerId).first();if(linked){let r;try{r=await db.prepare(`SELECT state FROM ${cfg.table} WHERE code=? AND expires>?`).bind(room,Date.now()).first()}catch{}if(r){const s=JSON.parse(r.state);current={phase:s.phase,round:s.game,rows:Object.entries(s.players).map(([seat,p])=>({name:p.name,score:Math.max(0,Math.round(Number(game==='million-point'&&s.mode==='duel'?s.duel?.[seat]?.earned:p.score)||0))})).sort((a,b)=>b.score-a.score)};}}}
 return json({venue,game,period,format,formats:formats.map(r=>r.format),games:Object.entries(games).filter(([id])=>!['say-what','captain-clash'].includes(id)).map(([id,g])=>({id,name:g.name})),rows,current});
 }catch{return json({error:'Venue standings could not load. Please retry.'},503)}}
