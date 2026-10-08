// Legacy rows use numbered slots. Never derive a writable slot from feed order.
const norm=v=>({WAS:'WSH',JAC:'JAX',LA:'LAR'}[String(v||'').toUpperCase()]||String(v||'').toUpperCase());
export async function saveNFLPick(db,{pool,player,week,event,team}){
 await ensurePickHistory(db);
 const teams=event.teams.map(norm),selected=norm(team);
 if(!event.eventId||!teams.includes(selected))throw Error('Invalid matchup.');
 for(let attempt=0;attempt<4;attempt++){
  const {results=[]}=await db.prepare("SELECT game_index,team FROM pool_picks WHERE pool_id=? AND sport='nfl' AND player_name=? AND week=?").bind(pool,player,week).all();
  const matches=results.filter(r=>teams.includes(norm(r.team)));
  if(matches.length>1)throw Error('Conflicting saved picks for this matchup. Contact LINKS Admin; no picks were changed.');
  const occupied=new Set(results.map(r=>Number(r.game_index)));
  let index=matches.length?Number(matches[0].game_index):0;
  if(!matches.length)while(occupied.has(index))index++;
  // The conflict condition protects another game even when two saves race.
  const aliases=[...new Set([...teams,...Object.entries({WAS:'WSH',JAC:'JAX',LA:'LAR'}).filter(([,v])=>teams.includes(v)).map(([k])=>k)])];
  await db.prepare("INSERT INTO pool_picks(pool_id,sport,player_name,week,game_index,team) VALUES(?,'nfl',?,?,?,?) ON CONFLICT(pool_id,sport,player_name,week,game_index) DO UPDATE SET team=excluded.team WHERE upper(pool_picks.team) IN ("+aliases.map(()=>'?').join(',')+")").bind(pool,player,week,index,selected,...aliases).run();
  const saved=await db.prepare("SELECT team FROM pool_picks WHERE pool_id=? AND sport='nfl' AND player_name=? AND week=? AND game_index=?").bind(pool,player,week,index).first();
  if(norm(saved?.team)===selected)return {gameIndex:index,eventId:event.eventId,selection:selected};
 }
 throw Error('Could not confirm your saved pick. Refresh and try again.');
}

// Private history catches changes from both current and legacy writers after activation.
async function ensurePickHistory(db){
 await db.prepare("CREATE TABLE IF NOT EXISTS links_nfl_pick_history(id INTEGER PRIMARY KEY AUTOINCREMENT,pool_id INTEGER,player_name TEXT,week INTEGER,game_index INTEGER,old_team TEXT,new_team TEXT,operation TEXT,recorded_at TEXT)").run();
 for(const operation of ['INSERT','UPDATE','DELETE']){
  const row=operation==='DELETE'?'OLD':'NEW',before=operation==='INSERT'?'NULL':'OLD.team',after=operation==='DELETE'?'NULL':'NEW.team';
  await db.prepare(`CREATE TRIGGER IF NOT EXISTS links_nfl_pick_history_${operation.toLowerCase()} AFTER ${operation} ON pool_picks WHEN ${row}.sport='nfl' ${operation==='UPDATE'?'AND OLD.team IS NOT NEW.team':''} BEGIN INSERT INTO links_nfl_pick_history(pool_id,player_name,week,game_index,old_team,new_team,operation,recorded_at) VALUES(${row}.pool_id,${row}.player_name,${row}.week,${row}.game_index,${before},${after},'${operation}',strftime('%Y-%m-%dT%H:%M:%fZ','now')); END`).run();
 }
}
