import {SLOTS,validateBracket,bracketClosed,bracketStandings} from '../../public/new-build/cfp-bracket-core.mjs';
const fail=(message,status=400)=>Object.assign(Error(message),{status});
export async function bracketState({db,pool,season,member,actor,games,b,post,available}){
 await db.batch([
  db.prepare('CREATE TABLE IF NOT EXISTS links_cfp_bracket_config(pool_id INTEGER,season INTEGER,teams TEXT NOT NULL,deadline TEXT NOT NULL,locked INTEGER NOT NULL DEFAULT 0,revision INTEGER NOT NULL DEFAULT 1,PRIMARY KEY(pool_id,season))'),
  db.prepare('CREATE TABLE IF NOT EXISTS links_cfp_brackets(pool_id INTEGER,season INTEGER,player TEXT,picks TEXT NOT NULL,guess INTEGER,submitted INTEGER NOT NULL DEFAULT 0,version INTEGER NOT NULL DEFAULT 1,saved_at TEXT NOT NULL,PRIMARY KEY(pool_id,season,player))')
 ]);
 let config=await db.prepare('SELECT * FROM links_cfp_bracket_config WHERE pool_id=? AND season=?').bind(pool,season).first();if(config)config={...config,teams:JSON.parse(config.teams)};
 const closed=bracketClosed(config,games);
 if(config&&closed&&!config.locked){await db.prepare('UPDATE links_cfp_bracket_config SET locked=1 WHERE pool_id=? AND season=?').bind(pool,season).run();config.locked=1;}
 if(post){
  if(!available)throw fail('Refresh the playoff schedule before saving. Your saved bracket is unchanged.',503);
  if(b.action==='bracketSetup'){
   if(actor.role!=='admin')throw fail('Commissioner access required.',403);
   const teams=b.teams;
   if(b.official!==true||!Array.isArray(teams)||teams.length!==12||teams.some((t,i)=>t.seed!==i+1||!/^\d+$/.test(String(t.id))||Number(t.id)<1||typeof t.name!=='string'||!t.name.trim()||t.name.length>100)||new Set(teams.map(t=>String(t.id))).size!==12)throw fail('Confirm all 12 official playoff seeds, with a different team in each seed.');
   const first=games.filter(g=>/first round/i.test(g.title)&&!g.tbd&&!g.voided).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start));
   if(first.length!==4||first.some(g=>g.live||g.final||g.locked)||Date.parse(first[0].start)<=Date.now())throw fail('All four official first-round games and kickoff times must be available before opening the bracket.',409);
   const clean=teams.map(t=>({seed:t.seed,id:String(t.id),name:t.name.trim(),record:String(t.record||'').slice(0,80),rank:Number.isInteger(t.rank)?t.rank:null,logo:'https://a.espncdn.com/i/teamlogos/ncaa/500/'+t.id+'.png'}));
   for(const slot of SLOTS.filter(s=>s.round===0)){const ids=slot.from.map(seed=>clean.find(t=>t.seed===seed).id);if(!first.some(g=>ids.includes(g.home.id)&&ids.includes(g.away.id)))throw fail('The seed pairings must match the official first-round schedule (5/12, 8/9, 6/11, 7/10).',409);}
   const r=await db.prepare("INSERT INTO links_cfp_bracket_config(pool_id,season,teams,deadline) SELECT ?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM links_cfp_brackets WHERE pool_id=? AND season=?) ON CONFLICT(pool_id,season) DO UPDATE SET teams=excluded.teams,deadline=excluded.deadline,revision=links_cfp_bracket_config.revision+1 WHERE links_cfp_bracket_config.locked=0 AND NOT EXISTS(SELECT 1 FROM links_cfp_brackets WHERE pool_id=? AND season=?)").bind(pool,season,JSON.stringify(clean),first[0].start,pool,season,pool,season).run();
   if(!r.meta?.changes)throw fail('Bracket setup is locked because entries have been saved or the contest has started.',409);return {ok:true};
  }
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
