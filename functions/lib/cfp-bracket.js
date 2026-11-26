import {loadOfficialField} from './cfp-auto-field.js';
import {validateBracket,bracketClosed,bracketStandings} from '../../public/new-build/cfp-bracket-core.mjs';
const fail=(message,status=400)=>Object.assign(Error(message),{status});
export async function bracketState({db,pool,season,member,actor,games,b,post,available}){
 await db.batch([
  db.prepare('CREATE TABLE IF NOT EXISTS links_cfp_bracket_config(pool_id INTEGER,season INTEGER,teams TEXT NOT NULL,deadline TEXT NOT NULL,locked INTEGER NOT NULL DEFAULT 0,revision INTEGER NOT NULL DEFAULT 1,PRIMARY KEY(pool_id,season))'),
  db.prepare('CREATE TABLE IF NOT EXISTS links_cfp_brackets(pool_id INTEGER,season INTEGER,player TEXT,picks TEXT NOT NULL,guess INTEGER,submitted INTEGER NOT NULL DEFAULT 0,version INTEGER NOT NULL DEFAULT 1,saved_at TEXT NOT NULL,PRIMARY KEY(pool_id,season,player))')
 ]);
 let config=await db.prepare('SELECT * FROM links_cfp_bracket_config WHERE pool_id=? AND season=?').bind(pool,season).first();if(config)config={...config,teams:JSON.parse(config.teams)};
 if(!config&&available){const field=await loadOfficialField(games,season);if(field){
  await db.prepare('INSERT OR IGNORE INTO links_cfp_bracket_config(pool_id,season,teams,deadline) VALUES(?,?,?,?)').bind(pool,season,JSON.stringify(field.teams),field.deadline).run();
  const row=await db.prepare('SELECT * FROM links_cfp_bracket_config WHERE pool_id=? AND season=?').bind(pool,season).first();config={...row,teams:JSON.parse(row.teams)};
 }}
 const closed=bracketClosed(config,games);
 if(config&&closed&&!config.locked){await db.prepare('UPDATE links_cfp_bracket_config SET locked=1 WHERE pool_id=? AND season=?').bind(pool,season).run();config.locked=1;}
 if(post){
  if(!available)throw fail('Refresh the playoff schedule before saving. Your saved bracket is unchanged.',503);
  if(b.action==='bracketSetup')throw fail('The official bracket opens automatically. Manual seed changes are disabled.',409);
  if(b.action!=='bracketSave')throw fail('Unknown bracket action.');
  if(!config||closed)throw fail('The entire bracket is locked, or the official field has not been published.',409);
  if(typeof b.submit!=='boolean'||!Number.isInteger(b.version)||!Number.isInteger(b.revision))throw fail('Refresh your bracket before saving.',409);
  let picks;try{picks=validateBracket(b.picks,config.teams,b.guess,b.submit)}catch(error){throw fail(error.message)}
  const r=await db.prepare("INSERT INTO links_cfp_brackets(pool_id,season,player,picks,guess,submitted,version,saved_at) SELECT ?,?,?,?,?,?,1,? WHERE EXISTS(SELECT 1 FROM links_cfp_bracket_config WHERE pool_id=? AND season=? AND revision=? AND locked=0 AND julianday(deadline)>julianday('now')) AND NOT EXISTS(SELECT 1 FROM links_cfp_games WHERE season=? AND locked=1) AND (?=0 OR EXISTS(SELECT 1 FROM links_cfp_brackets WHERE pool_id=? AND season=? AND player=? AND version=?)) ON CONFLICT(pool_id,season,player) DO UPDATE SET picks=excluded.picks,guess=excluded.guess,submitted=excluded.submitted,version=links_cfp_brackets.version+1,saved_at=excluded.saved_at WHERE links_cfp_brackets.version=?").bind(pool,season,member.name,JSON.stringify(picks),b.guess,b.submit?1:0,new Date().toISOString(),pool,season,b.revision,season,b.version,pool,season,member.name,b.version,b.version).run();
  if(!r.meta?.changes)throw fail('The bracket locked or changed in another tab. Refresh before saving.',409);return {ok:true};
 }
 const entries=((await db.prepare('SELECT * FROM links_cfp_brackets WHERE pool_id=? AND season=?').bind(pool,season).all()).results||[]).map(e=>({...e,picks:JSON.parse(e.picks)}));
 const roster=((await db.prepare('SELECT name FROM pool_players WHERE pool_id=? ORDER BY name').bind(pool).all()).results||[]).map(r=>r.name);
 const standings=bracketStandings(roster,entries,config?.teams||[],games,closed);
 return {config,locked:closed,setupLocked:entries.length>0||!!config?.locked,entry:entries.find(e=>e.player===member.name)||null,shared:closed?entries.filter(e=>e.submitted):[],standings};
}
