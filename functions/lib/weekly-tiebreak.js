// Keep optional new predictions separate from historical score guesses.
export const winningKey=(sport,week,player)=>`weekly_winning_score:${sport}:${week}:${String(player).trim().toLowerCase()}`;
export const validScore=value=>value!==null&&value!==undefined&&value!==''&&Number.isInteger(Number(value))&&Number(value)>=0&&Number(value)<=200;
export async function winningScores(db,pool,sport,week){
 const prefix=winningKey(sport,week,'');
 const rows=await db.prepare('SELECT key,value FROM pool_settings WHERE pool_id=? AND key LIKE ?').bind(pool,prefix+'%').all();
 return new Map((rows.results||[]).filter(r=>String(r.key||'').startsWith(prefix)&&validScore(r.value)).map(r=>[r.key.slice(prefix.length),Number(r.value)]));
}
export const winningStatement=(db,pool,sport,week,player,value)=>db.prepare('INSERT INTO pool_settings(pool_id,key,value) VALUES(?,?,?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value').bind(pool,winningKey(sport,week,player),String(value));
export async function seasonWinningScores(db,pool,sport){
 const prefix=`weekly_winning_score:${sport}:`,out=new Map();
 const rows=await db.prepare('SELECT key,value FROM pool_settings WHERE pool_id=? AND key LIKE ?').bind(pool,prefix+'%').all();
 for(const row of rows.results||[]){if(!String(row.key||'').startsWith(prefix)||!validScore(row.value))continue;const rest=row.key.slice(prefix.length),at=rest.indexOf(':'),week=Number(rest.slice(0,at));if(at<0||!Number.isInteger(week))continue;if(!out.has(week))out.set(week,new Map());out.get(week).set(rest.slice(at+1),Number(row.value));}return out;
}
export const compareWeekly=(a,b)=>b.wins-a.wins||(a.tieDiff??Infinity)-(b.tieDiff??Infinity)||(a.winningDiff??Infinity)-(b.winningDiff??Infinity);
export function weeklyRanks(rows){rows.forEach((row,i)=>row.rank=i&&!compareWeekly(row,rows[i-1])?rows[i-1].rank:i+1);return rows;}
