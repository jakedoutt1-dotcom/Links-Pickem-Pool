import {loadGameQuestions,completeQuestionBank} from '../../lib/trivia-provider.js';
import {ensureAccounts,digest} from '../../lib/commissioner-account.js';
import {QUESTIONS,POINTS,SECONDS,shuffled,weekKey,publicAttempt,grade} from '../../lib/football-trivia.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){try{
 const db=env.DB;if(!db)return json({error:'Trivia is temporarily unavailable.'},503);
 const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');
 const session=await db.prepare('SELECT * FROM pool_sessions WHERE token=? AND expires_at>?').bind(token,new Date().toISOString()).first();if(!session)return json({error:'Sign in to your pool to play.'},401);
 await ensureAccounts(db);
 await db.prepare('CREATE TABLE IF NOT EXISTS links_player_memberships(pool_id INTEGER,player_name TEXT,email TEXT,PRIMARY KEY(pool_id,player_name))').run();
 const player=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND name=?').bind(session.pool_id,session.player_name).first();
 if(!player)return json({error:'This player is no longer in the pool. Sign in again.'},401);
 // Identity comes from the authenticated pool session and server-managed connections,
 // never an email supplied by the browser or a separate, possibly stale account token.
 const link=await db.prepare('SELECT email FROM links_player_memberships WHERE pool_id=? AND player_name=?').bind(session.pool_id,session.player_name).first();
 const owner=session.role==='admin'?await db.prepare('SELECT email FROM links_pool_owners WHERE pool_id=?').bind(session.pool_id).first():null;
 const email=link?.email||owner?.email||null;
 await db.prepare('CREATE TABLE IF NOT EXISTS links_football_trivia(id TEXT PRIMARY KEY,owner TEXT NOT NULL,week TEXT NOT NULL,season TEXT NOT NULL,difficulty TEXT NOT NULL,display_name TEXT NOT NULL,deck TEXT NOT NULL,idx INTEGER NOT NULL DEFAULT 0,score INTEGER NOT NULL DEFAULT 0,correct INTEGER NOT NULL DEFAULT 0,misses INTEGER NOT NULL DEFAULT 0,deadline INTEGER NOT NULL,version INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT \'active\',UNIQUE(owner,week))').run();
 const identity=await digest(email||JSON.stringify(['pool-player',session.pool_id,session.player_name])),week=weekKey(),season=week.slice(0,4),now=Date.now();
 await db.prepare('CREATE TABLE IF NOT EXISTS links_trivia_pools(owner TEXT,pool_id INTEGER,PRIMARY KEY(owner,pool_id))').run();
 const memberships=email?(await db.prepare('SELECT m.pool_id FROM links_player_memberships m JOIN pool_players p ON p.pool_id=m.pool_id AND p.name=m.player_name WHERE m.email=? UNION SELECT pool_id FROM links_pool_owners WHERE email=?').bind(email,email).all()).results:[];
 const poolIds=[...new Set([Number(session.pool_id),...memberships.map(m=>Number(m.pool_id))])];
 await db.batch([db.prepare('DELETE FROM links_trivia_pools WHERE owner=?').bind(identity),...poolIds.map(id=>db.prepare('INSERT INTO links_trivia_pools(owner,pool_id) VALUES(?,?)').bind(identity,id))]);
 const currentPool=await db.prepare('SELECT name FROM pools WHERE id=?').bind(session.pool_id).first();
 let a=await db.prepare('SELECT * FROM links_football_trivia WHERE owner=? AND week=?').bind(identity,week).first();let feedback;
 if(request.method==='POST'){
 const b=await request.json();
 if(b.action==='start'){
 if(!a){if(!Object.hasOwn(POINTS,b.difficulty))return json({error:'Choose a difficulty.'},400);const display=String(b.name||session.player_name).trim().slice(0,40);if(!display)return json({error:'Choose a leaderboard name.'},400);
 const backup=QUESTIONS.filter(q=>q.difficulty===b.difficulty).map(q=>({...q,category:'football',correct:0}));
 const loaded=await loadGameQuestions({env,categories:['football'],difficulties:[b.difficulty],tags:['american_football'],backup,perGroup:12});
 const bank=completeQuestionBank(loaded.questions,backup,{minimum:10});
 const deck=shuffled(bank).slice(0,10).map(q=>({id:q.id,question:q,order:shuffled([0,1,2,3])}));
 await db.prepare('INSERT OR IGNORE INTO links_football_trivia(id,owner,week,season,difficulty,display_name,deck,deadline) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),identity,week,season,b.difficulty,display,JSON.stringify(deck),Date.now()+SECONDS[b.difficulty]*1000).run();
 a=await db.prepare('SELECT * FROM links_football_trivia WHERE owner=? AND week=?').bind(identity,week).first();}
 }else if(b.action==='answer'){
 if(!a||a.status!=='active'||b.id!==a.id||Number(b.version)!==a.version)return json({error:'This play has already changed. Resume your drive.'},409);
 const g=grade(a,b.choice,now),update=await db.prepare('UPDATE links_football_trivia SET idx=?,score=?,correct=?,misses=?,status=?,deadline=?,version=version+1 WHERE id=? AND owner=? AND version=? AND status=\'active\'').bind(g.idx,g.score,g.correct,g.misses,g.status,now+SECONDS[a.difficulty]*1000,a.id,identity,a.version).run();
 if(!update.meta?.changes)return json({error:'This answer was already submitted. Resume your drive.'},409);feedback=g.feedback;
 a=await db.prepare('SELECT * FROM links_football_trivia WHERE owner=? AND week=?').bind(identity,week).first();
 }else return json({error:'Unknown trivia action.'},400);
 }else if(request.method!=='GET')return json({error:'Method not allowed.'},405);
 const weekly=(await db.prepare('SELECT display_name AS name,difficulty,score,correct FROM links_football_trivia WHERE week=? AND status=\'complete\' ORDER BY score DESC,display_name LIMIT 100').bind(week).all()).results;
 const seasonal=(await db.prepare('SELECT MAX(display_name) AS name,SUM(score) AS score,SUM(CASE WHEN correct>=8 THEN 1 ELSE 0 END) AS touchdowns,MAX(score) AS best FROM links_football_trivia WHERE season=? AND status=\'complete\' GROUP BY owner ORDER BY score DESC LIMIT 100').bind(season).all()).results;
 const poolWeekly=(await db.prepare('SELECT t.display_name AS name,t.difficulty,t.score,t.correct FROM links_football_trivia t JOIN links_trivia_pools p ON p.owner=t.owner WHERE p.pool_id=? AND t.week=? AND t.status=\'complete\' ORDER BY t.score DESC,t.display_name LIMIT 100').bind(session.pool_id,week).all()).results;
 const poolSeasonal=(await db.prepare('SELECT MAX(t.display_name) AS name,SUM(t.score) AS score,SUM(CASE WHEN t.correct>=8 THEN 1 ELSE 0 END) AS touchdowns,MAX(t.score) AS best FROM links_football_trivia t JOIN links_trivia_pools p ON p.owner=t.owner WHERE p.pool_id=? AND t.season=? AND t.status=\'complete\' GROUP BY t.owner ORDER BY score DESC LIMIT 100').bind(session.pool_id,season).all()).results;
 return json({poolName:currentPool?.name||'Your Pool',poolWeekly,poolSeasonal,week,season,attempt:a?publicAttempt(a):null,feedback,weekly,seasonal});
 }catch{return json({error:'Trivia could not be loaded. Your saved attempt is preserved; please retry.'},503)}}
