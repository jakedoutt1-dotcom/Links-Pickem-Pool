// Owner-authorized Week 4 feedback credit. Eligibility closes; earned credit remains.
export const FEEDBACK={poolId:26,poolCode:'LINK-EA1F2BE8',week:4,eventId:'401872964',cutoff:'2026-10-04T16:20:00Z',teams:['PIT','CLE']};
export function feedbackPool(pool){return Number(pool?.id)===FEEDBACK.poolId&&pool?.code===FEEDBACK.poolCode}
export async function feedbackCredits(db,pool){
 if(!feedbackPool(pool))return [];
 await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS links_nfl_feedback_credits(pool_id INTEGER NOT NULL,player_name TEXT NOT NULL,week INTEGER NOT NULL,event_id TEXT NOT NULL,granted_at TEXT NOT NULL,reason TEXT NOT NULL,PRIMARY KEY(pool_id,player_name,week,event_id))'),
 db.prepare(`CREATE TRIGGER IF NOT EXISTS links_feedback_2026_join AFTER INSERT ON pool_players WHEN NEW.pool_id=26 AND julianday('now')<julianday('2026-10-04T16:20:00Z') AND EXISTS(SELECT 1 FROM pools WHERE id=26 AND code='LINK-EA1F2BE8') BEGIN INSERT OR IGNORE INTO links_nfl_feedback_credits VALUES(26,NEW.name,4,'401872964',strftime('%Y-%m-%dT%H:%M:%fZ','now'),'Owner-authorized feedback credit'); END`),
 db.prepare(`CREATE TRIGGER IF NOT EXISTS links_feedback_2026_leave AFTER DELETE ON pool_players WHEN OLD.pool_id=26 BEGIN DELETE FROM links_nfl_feedback_credits WHERE pool_id=OLD.pool_id AND player_name=OLD.name; END`),
 db.prepare(`CREATE TRIGGER IF NOT EXISTS links_feedback_2026_rename AFTER UPDATE OF name ON pool_players WHEN OLD.pool_id=26 AND NEW.name<>OLD.name BEGIN UPDATE links_nfl_feedback_credits SET player_name=NEW.name WHERE pool_id=OLD.pool_id AND player_name=OLD.name; END`),
 db.prepare("INSERT OR IGNORE INTO links_nfl_feedback_credits SELECT pool_id,name,4,'401872964',strftime('%Y-%m-%dT%H:%M:%fZ','now'),'Owner-authorized feedback credit' FROM pool_players WHERE pool_id=26 AND julianday('now')<julianday('2026-10-04T16:20:00Z')")]);
 return (await db.prepare(`SELECT c.player_name,c.granted_at FROM links_nfl_feedback_credits c JOIN pool_players p ON p.pool_id=c.pool_id AND p.name=c.player_name WHERE c.pool_id=26 AND c.week=4 AND c.event_id=? AND NOT EXISTS(SELECT 1 FROM pool_picks k WHERE k.pool_id=c.pool_id AND k.sport='nfl' AND k.week=c.week AND lower(trim(k.player_name))=lower(trim(c.player_name)) AND upper(trim(k.team)) IN ('PIT','CLE'))`).bind(FEEDBACK.eventId).all()).results||[];
}
export function creditPicks(rows,credits,games,week){
 if(Number(week)!==4||!credits.length)return rows;
 const game=games.find(g=>String(g.id??g.eventId)===FEEDBACK.eventId);
 if(!game?.completed||!FEEDBACK.teams.includes(game.winner))return rows;
 // Existing picks always keep their result; credit only a missing opener.
 const picked=new Set(rows.filter(r=>FEEDBACK.teams.includes(String(r.team).trim().toUpperCase())).map(r=>String(r.player_name).trim().toLowerCase()));
 const missing=credits.filter(c=>!picked.has(String(c.player_name).trim().toLowerCase()));
 return [...rows,...missing.map(c=>({player_name:c.player_name,week:4,game_index:game.i??game.gameIndex,team:game.winner,courtesy_credit:true}))];
}
export function creditNotice(credits,week,player){if(Number(week)!==4||!credits.length||player&&!credits.some(c=>c.player_name===player))return null;return {week:4,eventId:FEEDBACK.eventId,cutoff:FEEDBACK.cutoff,count:credits.length,message:'Feedback credit: Week 4’s first game counts as a win only for members with no pick for that game who joined before Sunday, October 4 at 11:20 AM Central. Existing picks and all other games score normally.'}}
