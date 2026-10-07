import {ownerSession,ownerAttempt,ownerPasswordOk} from './owner-auth.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
// Financial ledgers remain intact; their old pool IDs are historical references.
const ledgers=new Set(['payment_orders','service_purchases','commissioner_service_purchases','commissioner_game_additions']);
async function scopedTables(db){
 // Read declared columns without table-valued PRAGMA functions, which may be
 // restricted by the hosted database authorizer. Keep this to one schema query.
 const rows=(await db.prepare("SELECT name,sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL").all()).results||[];
 return rows.filter(row=>/(?:\(|,)\s*(?:pool_id|"pool_id"|`pool_id`|\[pool_id\])\s+/i.test(row.sql||'')).map(r=>r.name).filter(name=>/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)&&!ledgers.has(name));
}
export async function ownerPoolDelete(request,db,b){
 if(!await ownerSession(request,db))return json({error:'Owner sign-in required.'},401);
 const pool=await db.prepare('SELECT id,code,name FROM pools WHERE id=?').bind(Number(b.pool)).first();if(!pool)return json({error:'Pool not found.'},404);
 if(String(pool.code).toUpperCase()==='LINKS')return json({error:'Barnes Family / LINKS is protected from deletion.'},403);
 const tables=await scopedTables(db);
 if(b.action==='delete-preview'){
 const counts={};
 // Use scalar counts instead of compound SELECTs rejected by production D1.
 for(let offset=0;offset<tables.length;offset+=20){const query=tables.slice(offset,offset+20).map(table=>`(SELECT COUNT(*) FROM "${table}" WHERE pool_id=(SELECT id FROM target)) AS "${table}"`).join(',');const row=await db.prepare('WITH target AS (SELECT ? AS id) SELECT '+query).bind(pool.id).first();Object.assign(counts,row||{})}
 return json({pool,counts});
 }
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
