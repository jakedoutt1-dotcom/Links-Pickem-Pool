import {ownerSession,ownerAttempt,ownerPasswordOk} from './owner-auth.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
// Financial ledgers remain intact; their old pool IDs are historical references.
const ledgers=new Set(['payment_orders','service_purchases','commissioner_service_purchases','commissioner_game_additions']);
async function scopedTables(db){const rows=(await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()).results||[];const tables=[];for(const {name} of rows){if(!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)||ledgers.has(name))continue;const cols=(await db.prepare(`PRAGMA table_info("${name}")`).all()).results||[];if(cols.some(c=>c.name==='pool_id'))tables.push(name)}return tables}
export async function ownerPoolDelete(request,db,b){
 if(!await ownerSession(request,db))return json({error:'Owner sign-in required.'},401);
 const pool=await db.prepare('SELECT id,code,name FROM pools WHERE id=?').bind(Number(b.pool)).first();if(!pool)return json({error:'Pool not found.'},404);
 if(String(pool.code).toUpperCase()==='LINKS')return json({error:'Barnes Family / LINKS is protected from deletion.'},403);
 const tables=await scopedTables(db);
 if(b.action==='delete-preview'){const counts={};for(const table of tables){counts[table]=(await db.prepare(`SELECT COUNT(*) AS count FROM "${table}" WHERE pool_id=?`).bind(pool.id).first()).count}return json({pool,counts})}
 if(b.confirmCode!==pool.code||b.confirmName!==pool.name||b.acknowledge!==true)return json({error:'Confirm the pool code and permanent deletion.'},400);
 if(!await ownerAttempt(request,db))return json({error:'Too many attempts. Try again in 15 minutes.'},429);
 if(!await ownerPasswordOk(db,b.password))return json({error:'Incorrect owner password.'},401);
 await db.prepare('CREATE TABLE IF NOT EXISTS links_owner_deletions(id TEXT PRIMARY KEY,target_pool_id INTEGER,pool_code TEXT,pool_name TEXT,deleted_at TEXT)').run();
 const statements=[];
 if(tables.includes('squares_boards')){const existing=(await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('squares_claims','squares_results')").all()).results||[];for(const {name} of existing)statements.push(db.prepare('DELETE FROM "'+name+'" WHERE board_id IN (SELECT id FROM squares_boards WHERE pool_id=?)').bind(pool.id))}

 if(tables.includes('links_pool_slots'))statements.push(db.prepare('DELETE FROM links_account_preferences WHERE free_slot_id IN (SELECT id FROM links_pool_slots WHERE pool_id=?)').bind(pool.id));
 for(const table of tables)statements.push(db.prepare(`DELETE FROM "${table}" WHERE pool_id=?`).bind(pool.id));
 statements.push(db.prepare('DELETE FROM pools WHERE id=? AND code=?').bind(pool.id,pool.code),db.prepare('INSERT INTO links_owner_deletions VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),pool.id,pool.code,pool.name,new Date().toISOString()));
 // D1 batches are transactional: a failure rolls back the entire deletion.
 await db.batch(statements);return json({ok:true,deleted:pool.code});
}
