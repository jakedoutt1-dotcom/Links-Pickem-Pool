import {poolFor,sessionFor} from '../../lib/college.js';
import {poolGameKeys} from '../../lib/pool-games.js';
import {tournamentFeed,createTournament,mapResults,ensureSchema} from '../../lib/march.js';
import {cleanPicks,validTie,rankEntries,scoreBracket} from '../../../public/new-build/march-core.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const fail=(message,status=400)=>Object.assign(Error(message),{status});
const entryOf=row=>row?{player:row.player_name,picks:JSON.parse(row.picks_json),tie:row.tie,submitted:!!row.submitted,version:row.version,savedAt:row.updated_at}:null;
export async function onRequest({request,env}) {
  if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
  const db=env.DB;if(!db)return json({error:'Pool service unavailable.'},503);
  try {
    const q=new URL(request.url).searchParams;
    let b={};if(request.method==='POST')try{b=await request.json()}catch{throw fail('Invalid request.')}
    const pool=await poolFor(db,b.pool||q.get('pool'));if(!pool)throw fail('Pool not found.',404);
    const session=await sessionFor(request,db,pool.id);if(!session)throw fail('Sign in to this pool to continue.',401);
    const season=Number(b.season||q.get('season'));
    if(!Number.isInteger(season)||season<2025||season>new Date().getFullYear()+1)throw fail('Choose a valid tournament year.');
    await ensureSchema(db);
    const stored=await db.prepare('SELECT * FROM links_march_tournaments WHERE pool_id=? AND season=?').bind(pool.id,season).first();
    let tournament=stored?JSON.parse(stored.definition):null;
    const closed=!!stored&&Date.now()>=Date.parse(stored.lock_at);
    if(request.method==='GET') {
      if(q.get('view')==='preview') {
        if(session.role!=='admin')throw fail('Commissioner access required.',403);
        const feed=await tournamentFeed(season);
        return json({ready:feed.ready,field:feed.field,checkedAt:feed.checkedAt});
      }
      let warning='';
      if(tournament)try{
        const feed=await tournamentFeed(season);
        if(!feed.ready)throw Error('Tournament feed is incomplete.');
        tournament={...tournament,results:mapResults(tournament,feed.events),checkedAt:feed.checkedAt};
      }catch{warning='Live results are temporarily unavailable. Showing the last confirmed tournament snapshot.'}
      const own=await db.prepare('SELECT * FROM links_march_entries WHERE pool_id=? AND season=? AND player_name=?').bind(pool.id,season,session.player_name||'').first();
      const count=await db.prepare('SELECT COUNT(*) AS total FROM links_march_entries WHERE pool_id=? AND season=? AND submitted=1').bind(pool.id,season).first();
      let rows=[];
      if(closed&&tournament) {
        const all=(await db.prepare('SELECT * FROM links_march_entries WHERE pool_id=? AND season=? AND submitted=1').bind(pool.id,season).all()).results||[];
        rows=rankEntries(all.map(entryOf),tournament.games,tournament.results);
      }
      const entry=entryOf(own);
      return json({pool,season,role:session.role,player:session.player_name,tournament,revision:stored?.revision||0,closed,serverNow:new Date().toISOString(),entry,stats:entry&&tournament?scoreBracket(tournament.games,entry.picks,tournament.results):null,submittedCount:count?.total||0,rows,warning});
    }
    if(!(await poolGameKeys(db,pool.id)).includes('march'))throw fail('March Madness is not active in this pool.',403);
    if(b.action==='publish') {
      if(session.role!=='admin')throw fail('Commissioner access required.',403);
      if(closed)throw fail('This tournament has started. Its field cannot be replaced.',403);
      const feed=await tournamentFeed(season);
      let next;try{next=createTournament(feed,season,b.pairing)}catch(e){throw fail(e.message)}
      if(Date.now()>=Date.parse(next.lockAt))throw fail('This tournament has already started. Choose the upcoming tournament year.',403);
      const expected=Number(b.revision);
      if(!Number.isInteger(expected)||expected<0)throw fail('Refresh tournament setup first.',409);
      const saved=await db.prepare("INSERT INTO links_march_tournaments(pool_id,season,definition,lock_at,revision) SELECT ?,?,?,?,1 WHERE NOT EXISTS(SELECT 1 FROM links_march_entries WHERE pool_id=? AND season=?) AND julianday(?)>julianday('now') AND (?=0 OR EXISTS(SELECT 1 FROM links_march_tournaments WHERE pool_id=? AND season=?)) ON CONFLICT(pool_id,season) DO UPDATE SET definition=excluded.definition,lock_at=excluded.lock_at,revision=links_march_tournaments.revision+1 WHERE links_march_tournaments.revision=? AND julianday(links_march_tournaments.lock_at)>julianday('now')").bind(pool.id,season,JSON.stringify(next),next.lockAt,pool.id,season,next.lockAt,expected,pool.id,season,expected).run();
      if(!saved.meta?.changes)throw fail('Setup changed or a player has started a bracket. Refresh; the existing field was preserved.',409);
      return json({success:true});
    }
    if(b.action!=='save')throw fail('Unknown bracket action.');
    if(!tournament)throw fail('Your commissioner has not opened this tournament yet.',409);
    if(closed)throw fail('Brackets locked at the first Round of 64 tip-off.',403);
    if(!session.player_name)throw fail('Sign in as a pool player to save a bracket.',403);
    const member=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)').bind(pool.id,session.player_name).first();
    if(!member)throw fail('You are not on this pool roster.',403);
    if(!b.picks||typeof b.picks!=='object'||Array.isArray(b.picks)||Object.keys(b.picks).length>63)throw fail('Invalid bracket.');
    const picks=cleanPicks(tournament.games,b.picks);
    if(Object.keys(picks).length!==Object.keys(b.picks).length)throw fail('A selection does not follow the tournament bracket. Refresh and try again.');
    const tie=b.tie===null?null:b.tie;
    if(tie!==null&&!validTie(tie))throw fail('Enter a whole-number championship combined score from 0 to 400.');
    if(typeof b.submitted!=='boolean')throw fail('Choose draft or submit.');
    if(b.submitted&&(Object.keys(picks).length!==63||!validTie(tie)))throw fail('Complete all 63 picks and the tiebreaker before submitting.');
    if(!Number.isInteger(b.version)||b.version<0||b.revision!==stored.revision)throw fail('Your bracket changed in another tab. Reload before saving.',409);
    const now=new Date().toISOString();
    const result=await db.prepare("INSERT INTO links_march_entries(pool_id,season,player_name,picks_json,tie,submitted,version,updated_at) SELECT ?,?,?,?,?,?,1,? WHERE EXISTS(SELECT 1 FROM links_march_tournaments WHERE pool_id=? AND season=? AND revision=? AND julianday(lock_at)>julianday('now')) AND (?=0 OR EXISTS(SELECT 1 FROM links_march_entries WHERE pool_id=? AND season=? AND player_name=?)) ON CONFLICT(pool_id,season,player_name) DO UPDATE SET picks_json=excluded.picks_json,tie=excluded.tie,submitted=excluded.submitted,version=links_march_entries.version+1,updated_at=excluded.updated_at WHERE links_march_entries.version=?").bind(pool.id,season,member.name,JSON.stringify(picks),tie,b.submitted?1:0,now,pool.id,season,stored.revision,b.version,pool.id,season,member.name,b.version).run();
    if(!result.meta?.changes)throw fail('The deadline passed or another tab saved newer picks. Reload; your saved bracket was not overwritten.',409);
    return json({success:true,version:b.version+1,submitted:b.submitted,savedAt:now});
  }catch(e){return json({error:e.status?e.message:'March Madness data is unavailable. Please try again; saved brackets are unchanged.'},e.status||503)}
}
