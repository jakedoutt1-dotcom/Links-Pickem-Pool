import {ownerSession,ownerPasswordOk,ownerAttempt} from './owner-auth.js';
export const correctionReply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function ensureCorrections(db){await db.prepare(`CREATE TABLE IF NOT EXISTS links_pick_corrections(
 id TEXT PRIMARY KEY,pool_id INTEGER NOT NULL,sport TEXT NOT NULL,week INTEGER NOT NULL,
 kind TEXT NOT NULL,player_name TEXT NOT NULL,event_id TEXT,game_index INTEGER,
 matchup TEXT,old_value TEXT,new_value TEXT NOT NULL,reason TEXT NOT NULL,
 requested_by TEXT NOT NULL,requested_at TEXT NOT NULL,status TEXT NOT NULL,
 decided_at TEXT,decision_note TEXT,decision_id TEXT)`).run()}
const norm=v=>({WAS:'WSH',JAC:'JAX',LA:'LAR'}[String(v||'').toUpperCase()]||String(v||'').toUpperCase());
function target(r){return r.kind==='tie'?{table:'pool_ties',column:'guess',where:'pool_id=? AND sport=? AND player_name=? AND week=?',args:[r.pool_id,r.sport,r.player_name,r.week]}:r.kind==='result'?{table:'pool_results',column:'winner',where:'pool_id=? AND sport=? AND week=? AND game_index=?',args:[r.pool_id,r.sport,r.week,r.game_index]}:{table:'pool_picks',column:'team',where:'pool_id=? AND sport=? AND player_name=? AND week=? AND game_index=?',args:[r.pool_id,r.sport,r.player_name,r.week,r.game_index]}}
function mutation(db,r,condition='1',params=[]){
 const value=r.kind==='tie'?Number(r.new_value):r.new_value;
 if(r.kind==='tie')return db.prepare(`INSERT INTO pool_ties(pool_id,sport,player_name,week,guess) SELECT ?,?,?,?,? WHERE ${condition} ON CONFLICT(pool_id,sport,player_name,week) DO UPDATE SET guess=excluded.guess`).bind(r.pool_id,r.sport,r.player_name,r.week,value,...params);
 if(r.kind==='result')return db.prepare(`INSERT INTO pool_results(pool_id,sport,week,game_index,winner) SELECT ?,?,?,?,? WHERE ${condition} ON CONFLICT(pool_id,sport,week,game_index) DO UPDATE SET winner=excluded.winner`).bind(r.pool_id,r.sport,r.week,r.game_index,value,...params);
 return db.prepare(`INSERT INTO pool_picks(pool_id,sport,player_name,week,game_index,team) SELECT ?,?,?,?,?,? WHERE ${condition} ON CONFLICT(pool_id,sport,player_name,week,game_index) DO UPDATE SET team=excluded.team`).bind(r.pool_id,r.sport,r.player_name,r.week,r.game_index,value,...params);
}
export async function submitCorrection(db,session,sport,week,games,b){
 const kind=b.action;if(!['pick','tie','result'].includes(kind))return correctionReply({error:'Unsupported correction.'},400);
 if(!games.length)return correctionReply({error:'Schedule unavailable. No correction was saved.'},503);
 let player=null;if(kind!=='result'){player=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)').bind(session.pool_id,String(b.player||'')).first();if(!player)return correctionReply({error:'Player not found in this pool.'},404)}
 const r={id:crypto.randomUUID(),pool_id:session.pool_id,sport,week,kind,player_name:player?.name||'',event_id:null,game_index:null,matchup:'Weekly tiebreaker',new_value:String(b.guess??'')};
 if(kind==='tie'){if(b.guess==null||b.guess===''||!Number.isInteger(Number(b.guess))||Number(b.guess)<0||Number(b.guess)>200)return correctionReply({error:'Enter a whole-number tiebreaker from 0 to 200.'},400)}
 else{const g=games.find(g=>g.eventId===String(b.eventId)),team=norm(b.team);if(!g||![g.home,g.away].includes(team))return correctionReply({error:'Choose a team from the selected matchup.'},400);if(kind==='result'&&!g.completed)return correctionReply({error:'Wait until the game is final before requesting a result correction.'},409);
 const rows=kind==='result'?(await db.prepare('SELECT game_index,winner AS value FROM pool_results WHERE pool_id=? AND sport=? AND week=?').bind(r.pool_id,sport,week).all()).results:(await db.prepare('SELECT game_index,team AS value FROM pool_picks WHERE pool_id=? AND sport=? AND week=? AND player_name=?').bind(r.pool_id,sport,week,r.player_name).all()).results;
 const existing=rows.find(x=>[g.home,g.away].includes(norm(x.value)));r.game_index=existing?.game_index??g.gameIndex;if(!existing&&rows.some(x=>Number(x.game_index)===Number(r.game_index)&&x.value))return correctionReply({error:'This saved slot belongs to another matchup. No changes were made.'},409);
 r.event_id=g.eventId;r.matchup=g.away+' at '+g.home;r.new_value=team;
 }
 const t=target(r),old=await db.prepare(`SELECT ${t.column} AS value FROM ${t.table} WHERE ${t.where}`).bind(...t.args).first();r.old_value=old?.value==null?null:String(old.value);
 const times=games.map(g=>Date.parse(g.kickoff)),meta=await db.prepare('SELECT lock_time FROM pool_week_meta WHERE pool_id=? AND sport=? AND week=?').bind(r.pool_id,sport,week).first();
 const pending=kind==='result'||!times.every(Number.isFinite)||Date.now()>=Math.min(...times)||(meta?.lock_time&&Date.now()>=Date.parse(meta.lock_time));
 const reason=String(b.reason||'').trim();if(pending&&(reason.length<5||reason.length>1000))return correctionReply({error:'Explain why this correction is needed (5–1,000 characters). LINKS Admin approval is required after the deadline.'},400);
 await ensureCorrections(db);const now=new Date().toISOString();
 const insert=db.prepare('INSERT INTO links_pick_corrections(id,pool_id,sport,week,kind,player_name,event_id,game_index,matchup,old_value,new_value,reason,requested_by,requested_at,status,decided_at,decision_note) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(r.id,r.pool_id,sport,week,kind,r.player_name,r.event_id,r.game_index,r.matchup,r.old_value,r.new_value,reason||'Before deadline',session.player_name,now,pending?'pending':'applied',pending?null:now,pending?null:'Applied before deadline');
 await db.batch(pending?[insert]:[insert,mutation(db,r)]);
 return correctionReply({ok:true,pending:!!pending,id:r.id,message:pending?'Submitted to LINKS Admin. The saved pick has not changed.':'Correction saved before the deadline.'});
}
export async function reviewCorrection(request,db,b){
 if(!await ownerSession(request,db))return correctionReply({error:'LINKS owner sign-in required.'},401);
 await ensureCorrections(db);
 if(!b)return correctionReply({requests:(await db.prepare("SELECT c.*,p.name AS pool_name,p.code AS pool_code FROM links_pick_corrections c JOIN pools p ON p.id=c.pool_id ORDER BY CASE WHEN c.status='pending' THEN 0 ELSE 1 END,c.requested_at DESC LIMIT 200").all()).results});
 if(!['approve','reject'].includes(b.decision))return correctionReply({error:'Choose Approve or Reject.'},400);
 if(!await ownerAttempt(request,db))return correctionReply({error:'Too many password attempts. Try again later.'},429);
 if(!await ownerPasswordOk(db,b.password))return correctionReply({error:'Incorrect LINKS owner password.'},403);
 const r=await db.prepare('SELECT * FROM links_pick_corrections WHERE id=?').bind(String(b.id||'')).first();if(!r||r.status!=='pending')return correctionReply({error:'This request is no longer pending.'},409);
 const nonce=crypto.randomUUID(),now=new Date().toISOString(),note=String(b.note||'').trim().slice(0,1000);
 if(b.decision==='reject'){const result=await db.prepare("UPDATE links_pick_corrections SET status='rejected',decided_at=?,decision_note=?,decision_id=? WHERE id=? AND status='pending'").bind(now,note,nonce,r.id).run();return correctionReply({ok:!!result.meta?.changes})}
 const t=target(r),current=`(SELECT CAST(${t.column} AS TEXT) FROM ${t.table} WHERE ${t.where})`;
 // Claim and apply in one transaction. A second approval or a changed original pick
 // cannot overwrite a newer decision, even if two owner tabs submit simultaneously.
 const claim=db.prepare(`UPDATE links_pick_corrections SET status='approved',decided_at=?,decision_note=?,decision_id=? WHERE id=? AND status='pending' AND ${current} IS ? AND EXISTS(SELECT 1 FROM pools WHERE id=?)`+(r.kind==='result'?'':' AND EXISTS(SELECT 1 FROM pool_players WHERE pool_id=? AND name=?)')).bind(now,note,nonce,r.id,...t.args,r.old_value,r.pool_id,...(r.kind==='result'?[]:[r.pool_id,r.player_name]));
 const condition="EXISTS(SELECT 1 FROM links_pick_corrections WHERE id=? AND decision_id=? AND status='approved')";
 const results=await db.batch([claim,mutation(db,r,condition,[r.id,nonce]),db.prepare(`UPDATE pool_week_meta SET finalized_winner=NULL WHERE pool_id=? AND sport=? AND week=? AND ${condition}`).bind(r.pool_id,r.sport,r.week,r.id,nonce)]);
 if(!results[0].meta?.changes)return correctionReply({error:'The original pick or player changed. Reject this request and ask for a fresh correction.'},409);
 return correctionReply({ok:true,message:'Approved. Standings will recalculate from the corrected pick.'});
}
