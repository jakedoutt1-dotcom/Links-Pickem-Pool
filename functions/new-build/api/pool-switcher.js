import {identitySwitcher} from '../../lib/player-identity.js';
import {poolGameKeys} from '../../lib/pool-games.js';
import {accountSession,ensureAccounts,importOwnedPools,GAMES} from '../../lib/commissioner-account.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){
 const identity=await identitySwitcher({request,env});if(identity)return identity;
 try{
 const db=env.DB;await ensureAccounts(db);
 await db.prepare('CREATE TABLE IF NOT EXISTS links_player_memberships (pool_id INTEGER NOT NULL,player_name TEXT NOT NULL,email TEXT NOT NULL,PRIMARY KEY(pool_id,player_name))').run();
 await db.prepare('CREATE TABLE IF NOT EXISTS links_left_games(pool_id INTEGER NOT NULL,player_name TEXT NOT NULL,game TEXT NOT NULL,PRIMARY KEY(pool_id,player_name,game))').run();
 const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');
 const session=await db.prepare('SELECT * FROM pool_sessions WHERE token=?').bind(token).first();
 if(!session||!Number.isFinite(Date.parse(session.expires_at))||Date.parse(session.expires_at)<=Date.now())return json({error:'Sign into your pool first.'},401);
 const account=await accountSession(request,db);
 const current=await db.prepare('SELECT id,code,name FROM pools WHERE id=?').bind(session.pool_id).first();
 if(!current)return json({error:'Pool not found.'},404);
 const body=request.method==='POST'?await request.json():{};
 if(body.action==='verify-link'){
 if(!account)return json({verified:false});
 const linked=await db.prepare('SELECT email FROM links_player_memberships WHERE pool_id=? AND player_name=?').bind(session.pool_id,session.player_name).first();
 const owned=session.role==='admin'?await db.prepare('SELECT email FROM links_pool_owners WHERE pool_id=?').bind(session.pool_id).first():null;
 return json({verified:linked?.email===account.email||owned?.email===account.email});
 }
 if(body.action==='link'){
 if(!account)return json({error:'Verify your email first.'},401);
 const player=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND name=?').bind(session.pool_id,session.player_name).first();
 if(!player)return json({error:'Player membership no longer exists.'},403);
 await db.prepare('INSERT OR IGNORE INTO links_player_memberships(pool_id,player_name,email) VALUES(?,?,?)').bind(session.pool_id,session.player_name,account.email).run();
 const linked=await db.prepare('SELECT email FROM links_player_memberships WHERE pool_id=? AND player_name=?').bind(session.pool_id,session.player_name).first();
 if(linked.email!==account.email)return json({error:'This player is already linked to another verified account.'},409);
 }
 const pools=new Map([[String(current.id),{...current,id:String(current.id),role:session.role,playerName:session.player_name}]]);
 if(account){
 await importOwnedPools(db,account.email);
 const owned=(await db.prepare("SELECT p.id,p.code,p.name,s.value AS playerName FROM links_pool_owners o JOIN pools p ON p.id=o.pool_id JOIN pool_settings s ON s.pool_id=p.id AND s.key='commissioner_player_name' WHERE o.email=?").bind(account.email).all()).results||[];
 for(const p of owned)pools.set(String(p.id),{...p,id:String(p.id),role:'admin'});
 const memberships=(await db.prepare('SELECT p.id,p.code,p.name,m.player_name AS playerName FROM links_player_memberships m JOIN pools p ON p.id=m.pool_id JOIN pool_players u ON u.pool_id=m.pool_id AND u.name=m.player_name WHERE m.email=?').bind(account.email).all()).results||[];
 for(const p of memberships)if(!pools.has(String(p.id)))pools.set(String(p.id),{...p,id:String(p.id),role:'player'});
 }
 for(const [id,p] of pools){
 if(p.role!=='admin'&&!await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND name=?').bind(p.id,p.playerName).first()){pools.delete(id);continue}
 // Weekly pending status does not remove membership; global access revocation does.
 let access=null;try{access=await db.prepare('SELECT status FROM newbuild_player_access WHERE pool_id=? AND player_name=?').bind(p.id,p.playerName).first()}catch(e){if(!/no such table/i.test(String(e)))throw e}
 if(p.role!=='admin'&&access?.status==='pending'){pools.delete(id);continue}
 p.allGames=await poolGameKeys(db,p.id);
 p.leftGames=(await db.prepare('SELECT game FROM links_left_games WHERE pool_id=? AND player_name=?').bind(p.id,p.playerName).all()).results.map(r=>r.game);
 p.games=p.allGames.filter(g=>!p.leftGames.includes(g));
 }
 if(['leave-game','rejoin-game'].includes(body.action)){
 const p=pools.get(String(body.pool));if(!p||!p.allGames.includes(body.game))return json({error:'Game not available in your pool.'},403);
 if(String(p.id)!==String(current.id)&&!account)return json({error:'Verify your email first.'},401);
 if(body.action==='leave-game')await db.prepare('INSERT OR IGNORE INTO links_left_games(pool_id,player_name,game) VALUES(?,?,?)').bind(p.id,p.playerName,body.game).run();
 else await db.prepare('DELETE FROM links_left_games WHERE pool_id=? AND player_name=? AND game=?').bind(p.id,p.playerName,body.game).run();
 return json({ok:true});
 }
 if(body.action==='leave'){
 if(!account)return json({error:'Verify your email before leaving a connected pool.'},401);
 const p=pools.get(String(body.pool));if(!p)return json({error:'You do not have access to this pool.'},403);
 const owner=await db.prepare('SELECT email FROM links_pool_owners WHERE pool_id=?').bind(p.id).first();
 if(p.role==='admin'||owner?.email===account.email)return json({error:'Commissioners cannot leave a pool they manage.'},409);
 await db.batch([
 db.prepare('DELETE FROM links_player_memberships WHERE pool_id=? AND player_name=? AND email=?').bind(p.id,p.playerName,account.email),
 db.prepare('DELETE FROM pool_sessions WHERE pool_id=? AND player_name=?').bind(p.id,p.playerName)
 ]);
 return json({ok:true,leftPool:p.id,current:String(p.id)===String(session.pool_id)});
 }
 if(body.action==='open'){
 if(!account)return json({error:'Verify your email to switch pools.'},401);
 const p=pools.get(String(body.pool));if(!p)return json({error:'You do not have access to this pool.'},403);
 const next=crypto.randomUUID()+crypto.randomUUID();await db.prepare('INSERT INTO pool_sessions(token,pool_id,player_name,role,expires_at) VALUES(?,?,?,?,?)').bind(next,Number(p.id),p.playerName,p.role,new Date(Math.min(Date.parse(session.expires_at),Date.parse(account.expires_at))).toISOString()).run();
 return json({token:next,playerId:p.playerName,gameKeys:p.games,pool:{id:p.id,code:p.code,name:p.name,role:p.role==='admin'?'commissioner':'player',games:p.games.map(g=>GAMES[g]||g)}});
 }
 return json({currentPool:String(current.id),verified:!!account,commissioner:session.role==='admin',pools:[...pools.values()]});
 }catch(e){return json({error:'Pool switching is unavailable. Please try again.'},500)}
}
