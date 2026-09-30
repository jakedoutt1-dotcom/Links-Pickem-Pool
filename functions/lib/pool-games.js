import {GAMES} from './commissioner-account.js';
// One read-only resolver for pool navigation. Explicit archives always win.
export async function poolGameKeys(db,pool){
 const read=async(sql)=>{try{return (await db.prepare(sql).bind(pool).all()).results||[]}catch(e){if(/no such table/i.test(String(e)))return [];throw e}};
 const normalize=values=>[...new Set(values.map(v=>String(v||'').trim().toLowerCase()).filter(v=>GAMES[v]))];
 const slots=await read('SELECT game_type,active FROM links_pool_slots WHERE pool_id=? ORDER BY game_type');
 if(slots.length)return normalize(slots.filter(r=>Number(r.active)===1).map(r=>r.game_type));
 const settings=await read("SELECT key,value FROM pool_settings WHERE pool_id=? AND key IN ('active_games_exact','game_type')");
 const exact=settings.find(r=>r.key==='active_games_exact');
 if(exact){try{const list=JSON.parse(exact.value);if(Array.isArray(list))return normalize(list)}catch{}}
 const rows=await read('SELECT game_type,active,is_primary FROM pool_active_games WHERE pool_id=? ORDER BY is_primary DESC,game_type');
 if(rows.length)return normalize(rows.filter(r=>Number(r.active)===1).map(r=>r.game_type));
 return normalize([settings.find(r=>r.key==='game_type')?.value]);
}
