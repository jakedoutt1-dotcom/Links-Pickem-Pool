import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
const fx=fixture(),{db,runtime,call}=fx;
const setup={version:'',wildCardPoints:1,divisionalPoints:2,conferencePoints:4,superBowlPoints:8};
try{
 assert.equal((await call('playoff','settings',setup,'admin')).status,200);
 const slates=Object.fromEntries([19,20,21,22].map((week,round)=>[week,Array.from({length:[6,4,2,1][round]},(_,i)=>({id:week+'-'+i,eventId:week+'-'+i,gameIndex:i,away:'A'+i,home:'H'+i,kickoff:'2090-01-01T18:00:00Z',completed:false,winner:'',awayScore:0,homeScore:0}))]));
 runtime.fetchNFLWeek=async w=>slates[w]||[];
 for(const week of [19,20,21,22]){const picks=slates[week].map(g=>({eventId:g.id,gameIndex:999,team:g.away}));assert.equal((await call('playoff','entry',{entry:{week,picks}})).status,200);const state=await call('playoff','state',null,'alice',week);assert(state.mySubmittedAt);assert.equal(state.myEntry.picks[0].gameIndex,0)}
 for(const week of [19,20,21,22])slates[week]=slates[week].map(g=>({...g,kickoff:'2020-01-01T18:00:00Z',completed:true,winner:g.away,awayScore:21,homeScore:10})).reverse();
 let state=await call('playoff','state',null,'alice',22);assert.equal(state.scores[0].score,30);assert.equal(state.scores[0].rounds.length,4);assert.equal(state.scores[0].status,'FINAL');assert.equal((await call('playoff','entry',{entry:{week:22,picks:[]}})).status,409);
 const saved=slates[20];slates[20]=[];state=await call('playoff');assert.equal(state.scores[0].score,30);assert.match(state.scoringWarning,/preserved/);slates[20]=saved;
 // A missing event cannot pick up another final game's winner via the old index.
 slates[20]=saved.filter(g=>g.id!=='20-0');state=await call('playoff');assert.equal(state.scores[0].score,30);assert(state.scoringWarning);slates[20]=saved;
 // A pending event at a different array index must not receive a completed game's points.
 slates[19]=slates[19].map(g=>g.id==='19-0'?{...g,completed:false,winner:''}:g);state=await call('playoff');assert.equal(state.scores[0].score,29);assert.equal(state.scores[0].status,'OPEN');
 slates[19]=slates[19].map(g=>g.id==='19-0'?{...g,completed:true,winner:'',awayScore:20,homeScore:20}:g);state=await call('playoff');assert.equal(state.scores[0].score,29);assert.equal(state.scores[0].status,'FINAL');
 // Legacy reveal settings and commissioner access cannot leak other players' cards.
 const raw=JSON.parse(db.raw.prepare("SELECT value FROM pool_settings WHERE key='game_settings_playoff'").get().value);raw.revealPicks=true;db.raw.prepare("UPDATE pool_settings SET value=? WHERE key='game_settings_playoff'").run(JSON.stringify(raw));
 for(const who of ['bob','admin']){const other=await call('playoff','state',null,who,19);assert.deepEqual(other.entries,[]);assert.deepEqual(other.history,[]);assert.equal(other.mySubmittedAt,null);assert.deepEqual(other.myEntry,{})}
 console.log('PASS four-round 30-point replay, canonical event IDs, feed reordering, outage/missing-event score preservation, pending finals, ties, lock enforcement and pick privacy.');
}finally{db.raw.close()}
const f=fixture();try{
 await f.call('playoff','settings',setup,'admin');
 const oldFetch=f.runtime.fetchNFLWeek;f.runtime.fetchNFLWeek=async w=>{const raw=JSON.parse(f.db.raw.prepare("SELECT value FROM pool_settings WHERE key='game_settings_playoff'").get().value);raw.linksRevision='concurrent';f.db.raw.prepare("UPDATE pool_settings SET value=? WHERE key='game_settings_playoff'").run(JSON.stringify(raw));return oldFetch(w)};
 assert.equal((await f.call('playoff','entry',{entry:{week:19,picks:[{eventId:'one',team:'BUF'}]}})).status,409);
 assert.equal(f.db.raw.prepare("SELECT COUNT(*) n FROM special_game_period_entries").get().n,0);assert.equal(f.db.raw.prepare("SELECT COUNT(*) n FROM special_game_entries").get().n,0);
 console.log('PASS concurrent scoring change rejects both entry writes atomically.');
}finally{f.db.raw.close()}
