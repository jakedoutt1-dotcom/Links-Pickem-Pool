import {poolFor,sessionFor} from '../../lib/college.js';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){
 if(request.method!=='POST')return reply({error:'Method not allowed.'},405);
 let b;try{b=await request.json()}catch{return reply({error:'Invalid request.'},400)}
 const db=env.DB,pool=await poolFor(db,b.pool),session=pool&&await sessionFor(request,db,pool.id);
 if(session?.role!=='admin')return reply({error:'Commissioner sign-in required.'},403);
 const name=String(b.player||''),commissioner=await db.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='commissioner_player_name'").bind(pool.id).first();
 if(name===session.player_name||name.toLowerCase()===String(commissioner?.value||'').toLowerCase())return reply({error:'You cannot delete the commissioner. Transfer commissioner duties first.'},409);
 if(!name||b.confirmName!==name||b.acknowledge!==true)return reply({error:'Confirm the player name and permanent deletion.'},400);
 const exists=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND name=?').bind(pool.id,name).first();if(!exists)return reply({error:'Player not found in this pool.'},404);
 // Use one transaction. Clear aliases and linked membership too, so a later player
 // with the same name cannot inherit access belonging to the deleted player.
 const known=['pool_picks','pool_ties','pool_payments','pool_33_entries','pool_33_assignments','march_picks','march_ties','pool_sessions','pool_player_setup_invites','pool_player_contacts','pool_login_names','pool_display_names','links_player_memberships','newbuild_player_access'];
 const tables=(await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()).results.map(r=>r.name);
 const statements=known.filter(t=>tables.includes(t)).map(t=>db.prepare(`DELETE FROM "${t}" WHERE pool_id=? AND player_name=?`).bind(pool.id,name));
 for(const t of ['links_nba_picks','links_nba_access','links_mlb_picks','links_mlb_access','links_hr_lineups','links_hr_access'])if(tables.includes(t))statements.push(db.prepare(`DELETE FROM "${t}" WHERE pool_id=? AND player=?`).bind(pool.id,name));
 statements.push(db.prepare('DELETE FROM pool_players WHERE pool_id=? AND name=?').bind(pool.id,name));
 try{await db.batch(statements);return reply({deleted:name})}catch(error){console.error('Player deletion failed',error);return reply({error:'Player could not be deleted. No changes were saved.'},503)}
}
