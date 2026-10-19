// A shared cutoff can close a slate early, but never reopens a started game.
export async function nflWeekCutoff(db,pool,week){
 const row=await db.prepare('SELECT value FROM pool_settings WHERE pool_id=? AND key=? LIMIT 1').bind(pool,'game_settings:nfl-pick-em:'+week).first();
 const data=row?.value?JSON.parse(row.value):null;
 const time=Date.parse(data?.lockAt||'');
 return Number.isFinite(time)?time:null;
}
