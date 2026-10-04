import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {ensureAccounts,digest} from '../functions/lib/commissioner-account.js';
import {SCORE_GAMES,ensureScoreboard,partyOutcomes,partyFinish,savePartyRoom,periodStart} from '../functions/lib/party-scoreboard.js';
import {onRequest} from '../functions/new-build/api/party-scoreboard.js';
const {db}=fixture();await ensureScoreboard(db);await ensureAccounts(db);
const token=crypto.randomUUID()+crypto.randomUUID(),other=crypto.randomUUID()+crypto.randomUUID(),seatToken=crypto.randomUUID()+crypto.randomUUID(),secondToken=crypto.randomUUID()+crypto.randomUUID(),seat=await digest(seatToken),second=await digest(secondToken),room='ABCDEF1234';
for(const [t,e]of [[token,'one@example.com'],[other,'two@example.com']])await db.prepare('INSERT INTO links_account_sessions VALUES(?,?,?)').bind(await digest(t),e,'2099-01-01').run();
async function call(body,auth=token,query='',origin='https://test'){const r=await onRequest({request:new Request('https://test/new-build/api/party-scoreboard'+query,{method:body?'POST':'GET',headers:{Origin:origin,'x-links-account':auth},...(body?{body:JSON.stringify(body)}:{})}),env:{DB:db}});return {status:r.status,...await r.json()}}
const final={code:room,game:1,phase:'ended',players:{[seat]:{name:'Same',score:100},[second]:{name:'Same',score:50}}};
for(const [game,cfg] of Object.entries(SCORE_GAMES)){
 await db.prepare(`CREATE TABLE ${cfg.table}(code TEXT PRIMARY KEY,state TEXT,version INTEGER,expires INTEGER)`).run();
 const s=structuredClone(final);if(game==='last-alibi'){s.cooperative=true;s.caught=true;s.case={killer:'npc'}}if(game==='dead-air'){s.players[seat].progress=1;s.players[second].progress=2}if(game==='million-point'){s.mode='duel';s.duel={[seat]:{earned:500},[second]:{earned:1000}}}
 await db.prepare(`INSERT INTO ${cfg.table} VALUES(?,?,0,?)`).bind(room,JSON.stringify({...s,phase:'playing'}),Date.now()+100000).run();
 assert.equal((await savePartyRoom(db,game,room,0,s,null)).meta.changes,1);
 assert.equal((await savePartyRoom(db,game,room,0,s,null)).meta.changes,0);
 const rows=(await db.prepare('SELECT * FROM links_party_results WHERE game=?').bind(game).all()).results;assert.equal(rows.length,2);assert.equal(rows.find(r=>r.seat===seat).win,['dead-air','million-point'].includes(game)?0:1);
 const next={...s,game:2,phase:'lobby'};await savePartyRoom(db,game,room,1,next,partyFinish(s));assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM links_party_results WHERE game=?').bind(game).first()).n,2);
}
assert.equal(partyOutcomes('trivia-rally',{...final,players:{[seat]:{score:10}}}).length,0);
assert.equal(partyOutcomes('trivia-rally',{...final,phase:'question'}).length,0);
const failed={...final,game:5};await savePartyRoom(db,'trivia-rally',room,0,failed,null);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM links_party_results WHERE round=5').first()).n,0);
assert.equal((await call({name:'Same',seats:[]},'')).status,401);assert.equal((await call({name:'Same',seats:[]},token,'','https://evil')).status,403);
const claim={name:'Same',seats:[{game:'trivia-rally',room,token:seatToken}]};assert.equal((await call(claim)).linked,1);
assert.equal((await call(claim,other)).linked,0); // Cannot steal a claimed seat.
assert.equal((await call({name:'Same',seats:[{game:'trivia-rally',room,token:secondToken}]})).linked,0); // One account cannot collect both seats.
assert.equal((await call({name:'Same',seats:[{game:'trivia-rally',room,token:secondToken}]},other)).linked,1);
assert.equal((await call({name:'Fake',seats:[{game:'million-point',room,token:'x'.repeat(72)}]})).linked,0);
let board=await call(null,token,'?period=all');assert.equal(board.rows.length,2);assert.equal(board.mine.played,1);assert.equal(board.mine.wins,1);assert.notEqual(board.rows[0].id,board.rows[1].id);assert(!JSON.stringify(board).includes('@'));
board=await call(null,token,'?period=all&game=trivia-rally');assert.equal(board.highScore,100);assert.equal(board.mine.best,100);
await db.prepare('DELETE FROM links_rally_rooms').run();assert.equal((await call(null,token,'?period=all')).mine.played,1);
assert.equal(new Date(periodStart('week',Date.parse('2026-10-04T18:00:00Z'))).toISOString(),'2026-09-28T05:00:00.000Z');
assert.equal(new Date(periodStart('year',Date.parse('2026-10-04T18:00:00Z'))).toISOString(),'2026-01-01T06:00:00.000Z');
assert.equal(new Date(periodStart('week',Date.parse('2026-11-02T18:00:00Z'))).toISOString(),'2026-11-02T06:00:00.000Z');
console.log('PASS all seven game outcomes, atomic CAS, retries/rematches, solo exclusion, verified seat claims, same-name isolation, account-seat limits, expiry survival, high scores and Central periods.');
