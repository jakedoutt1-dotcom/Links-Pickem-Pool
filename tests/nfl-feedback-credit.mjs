import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {feedbackCredits,creditPicks,FEEDBACK} from '../functions/lib/nfl-feedback-credit.js';
import {gradeWeek} from '../functions/new-build/api/standings-v649.js';
const {db}=fixture();
try{
 let now='2026-10-02T12:00:00Z';
 db.raw.function('julianday',v=>Date.parse(v==='now'?now:v)/86400000+2440587.5);
 db.raw.exec("INSERT INTO pools(id,code,name,admin_salt,admin_hash,created_at) VALUES(26,'LINK-EA1F2BE8','2026 NFL','s','h','2026-01-01')");
 const join=n=>db.raw.prepare("INSERT INTO pool_players(pool_id,name,password_hash,salt) VALUES(26,?,'h','s')").run(n);
 ['Wrong','Right','Missing','Pending'].forEach(join);
 const pool={id:26,code:FEEDBACK.poolCode};
 assert.deepEqual(await feedbackCredits(db,{id:1,code:'POOL'}),[]);
 assert.deepEqual(await feedbackCredits(db,{id:26,code:'WRONG'}),[]);
 assert.equal((await feedbackCredits(db,pool)).length,4);
 join('Early');assert.equal(db.raw.prepare('SELECT count(*) n FROM links_nfl_feedback_credits').get().n,5);
 now=FEEDBACK.cutoff;join('Late');assert.equal((await feedbackCredits(db,pool)).length,5);
 now='2026-10-05T00:00:00Z';assert.equal((await feedbackCredits(db,pool)).length,5);
 db.raw.exec("UPDATE pool_players SET name='Renamed' WHERE name='Early' AND pool_id=26");assert.ok((await feedbackCredits(db,pool)).some(c=>c.player_name==='Renamed'));
 db.raw.exec("DELETE FROM pool_players WHERE name='Renamed' AND pool_id=26");join('Renamed');assert.equal((await feedbackCredits(db,pool)).length,4);
 const credits=await feedbackCredits(db,pool),games=[{id:FEEDBACK.eventId,i:0,teams:['PIT','CLE'],winner:'CLE',completed:true,total:51,kickoff:'2026-10-02'}, {id:'other',i:1,teams:['BUF','MIA'],winner:'BUF',completed:true,total:40,kickoff:'2026-10-04'}];
 const rows=[{player_name:'Wrong',game_index:0,team:'PIT'},{player_name:'Right',game_index:0,team:'CLE'},{player_name:'Wrong',game_index:1,team:'MIA'},{player_name:'Pending',game_index:1,team:'BUF'}];
 const original=JSON.stringify(rows),data={players:{results:credits.map(c=>({name:c.player_name}))},picks:{results:rows},ties:{results:[]},manual:{results:[]},access:{results:['Wrong','Right','Missing'].map(player_name=>({player_name}))},credits};
 const result=gradeWeek(pool,4,structuredClone(games),structuredClone(data));
 assert.equal(result.rows.find(r=>r.player==='Wrong').wins,0);
 for(const row of result.rows.filter(r=>r.player!=='Wrong'))assert.equal(row.wins,1);
 assert.equal(result.rows.find(r=>r.player==='Wrong').losses,2);
 assert.equal(result.rows.find(r=>r.player==='Pending').losses,0);
 assert.equal(JSON.stringify(rows),original);
 const overridden=gradeWeek(pool,4,structuredClone(games),{...structuredClone(data),manual:{results:[{winner:'PIT'}]}});assert.equal(overridden.rows.find(r=>r.player==='Right').wins,0);assert.equal(overridden.rows.find(r=>r.player==='Wrong').wins,1);assert.equal(overridden.rows.find(r=>r.player==='Missing').wins,1);
 assert.equal(creditPicks(rows,credits,games,5),rows);
 const oldFetch=globalThis.fetch;
 globalThis.fetch=async()=>Response.json({events:[{id:FEEDBACK.eventId,date:'2026-10-02T00:15:00Z',status:{type:{completed:true}},competitions:[{competitors:[{homeAway:'home',team:{abbreviation:'CLE'},score:'27',winner:true},{homeAway:'away',team:{abbreviation:'PIT'},score:'24'}]}]}]});
 try{
 const {onRequestGet:weekly}=await import('../functions/new-build/api/standings-v649.js');
 const {onRequestGet:compare}=await import('../functions/new-build/api/compare-picks.js');
 const {onRequestGet:season}=await import('../functions/new-build/api/season-standings.js');
 const request=new Request('https://test/?pool=26&week=4',{headers:{Authorization:'Bearer feedback-test'}});
 db.raw.exec("INSERT INTO pool_sessions VALUES('feedback-test',26,'Missing','player','2099-01-01')");
 db.raw.exec("INSERT INTO pool_picks VALUES(26,'nfl','Wrong',4,0,'PIT'),(26,'nfl','Right',4,0,'CLE');INSERT INTO pool_payments(pool_id,sport,player_name,week,paid) VALUES(26,'nfl','Wrong',4,1),(26,'nfl','Right',4,1)");
 assert.equal((await feedbackCredits(db,pool)).length,2);
 const w=await (await weekly({request,env:{DB:db}})).json();assert.equal(w.courtesy.count,2);assert.equal(w.rows.length,4);assert.equal(w.rows.find(r=>r.player==='Wrong').losses,1);assert.equal(w.rows.filter(r=>r.courtesyCredit).length,2);
 const c=await (await compare({request,env:{DB:db}})).json();assert.equal(c.players.length,4);assert.equal(c.players.find(r=>r.player==='Wrong').picks[0],'PIT');assert.equal(c.players.find(r=>r.player==='Missing').picks[0],'CLE');
 const t=await (await season({request,env:{DB:db}})).json();assert.equal(t.rows.find(r=>r.name==='Missing').wins,1);assert.equal(t.rows.find(r=>r.name==='Late').wins,0);
 }finally{globalThis.fetch=oldFetch}
 console.log('PASS target isolation, trigger joins, exact cutoff, persistent credits, rename/delete, missing/wrong/right picks, pending access, other games, result overrides and untouched originals');
}finally{db.raw.close()}
