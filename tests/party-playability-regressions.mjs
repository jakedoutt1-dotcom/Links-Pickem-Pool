import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest as deadAirRequest} from '../functions/new-build/api/dead-air.js';
import {onRequest as alibiRequest} from '../functions/new-build/api/last-alibi.js';
import {partyOutcomes} from '../functions/lib/party-scoreboard.js';

// These checks run against memory-only local fixtures. No network service is used.
const realNow = Date.now, realFetch = globalThis.fetch;
let now = realNow();
Date.now = () => now;
globalThis.fetch = async () => { throw Error('External requests are disabled in party playability regressions.'); };

function harness(game, handler, table, tokenHeader, displayHeader) {
  const {db} = fixture();
  let code = '', currentGame = 1;
  const origin = 'https://party-playability.local';
  async function call(body = null, token = '', display = '') {
    const response = await handler({env:{DB:db},request:new Request(origin + '/new-build/api/' + game + (body ? '' : '?code=' + code), {
      method:body ? 'POST' : 'GET',
      headers:{Origin:origin,[tokenHeader]:token,[displayHeader]:display},
      ...(body ? {body:JSON.stringify({code,game:currentGame,...body})} : {})
    })});
    return {status:response.status,...await response.json()};
  }
  function raw() { return JSON.parse(db.raw.prepare('SELECT state FROM ' + table + ' WHERE code=?').get(code).state); }
  function mutate(change) { const state = raw(); change(state); db.raw.prepare('UPDATE ' + table + ' SET state=? WHERE code=?').run(JSON.stringify(state),code); }
  function results(round = currentGame) {
    const players = raw().players;
    return db.raw.prepare('SELECT seat,score,win FROM links_party_results WHERE game=? AND room=? AND round=?').all(game,code,round)
      .map(row => ({playerId:players[row.seat]?.id,score:row.score,win:row.win})).sort((a,b) => a.playerId.localeCompare(b.playerId));
  }
  return {call,raw,mutate,results,close:() => db.raw.close(),setCode:value => { code = value; },setGame:value => { currentGame = value; }};
}

const ok = (response, label) => { assert.equal(response.status,200,label + ': ' + (response.error || '')); return response; };
const rejected = (response, label) => assert.ok(response.status >= 400,label + ' must be rejected');

async function checkDeadAirRecovery() {
  const h = harness('dead-air',deadAirRequest,'links_dead_air_rooms','x-dead-air-token','x-dead-air-display');
  try {
    const host = ok(await h.call({action:'create',name:'Host',mode:'friends'}),'Create Dead Air'); h.setCode(host.code);
    const guest = ok(await h.call({action:'join',name:'Guest & Friend'}),'Join retained guest');
    h.mutate(s => { for (const player of Object.values(s.players)) delete player.id; }); // Existing rooms predate management IDs.
    let lobby = ok(await h.call(null,host.token),'Host lobby');
    const hostId = lobby.players.find(p => p.you).id;
    const guestId = lobby.players.find(p => !p.you).id;
    assert.deepEqual((await h.call(null,host.token)).players.map(p => p.id),lobby.players.map(p => p.id),'Legacy management IDs are persisted once');
    const dropped = ok(await h.call({action:'join',name:'Dropped Guest'}),'Join dropped guest');
    lobby = ok(await h.call(null,host.token),'Host lobby with third seat');
    const droppedId = lobby.players.find(p => ![hostId,guestId].includes(p.id)).id;
    assert.ok(hostId && guestId && droppedId,'Lobby controls need stable player identifiers');
    assert.equal(new Set([hostId,guestId,droppedId]).size,3);
    assert.match(droppedId,/^[0-9a-f]{8}-[0-9a-f-]{27}$/i,'A removal identifier is a separately generated UUID');
    assert.ok((await h.call(null,guest.token)).players.every(p => !p.id),'Guest view does not expose host removal identifiers');
    assert.ok((await h.call(null,'',host.displayKey)).players.every(p => !p.id),'TV view does not expose host removal identifiers');
    assert.equal((await h.call({action:'remove',player:droppedId},guest.token)).status,403);
    assert.equal((await h.call({action:'remove',player:droppedId},'',host.displayKey)).status,403);
    rejected(await h.call({action:'remove',player:hostId},host.token),'Self removal');
    rejected(await h.call({action:'remove',player:'missing-player'},host.token),'Unknown player removal');
    assert.equal((await h.call({action:'remove',player:droppedId,game:0},host.token)).status,409);
    assert.equal((await h.call(null,host.token)).players.length,3,'Rejected removals cannot change the cast');

    for (const player of [host,guest,dropped]) ok(await h.call({action:'ready'},player.token),'Ready');
    let state = ok(await h.call({action:'start'},host.token),'Start broadcast');
    rejected(await h.call({action:'remove',player:droppedId},host.token),'Active broadcast removal');
    now = state.deadline; state = ok(await h.call(null,host.token),'Open question');
    const correct = h.raw().question.correct;
    for (const [player,answer] of [[host,correct],[guest,(correct + 1) % 4],[dropped,correct]]) {
      ok(await h.call({action:'answer',phaseId:state.phaseId,answer},player.token),'Answer question');
    }
    now = state.deadline; state = ok(await h.call(null,host.token),'Question results');
    for (const [player,expected] of [[host,true],[guest,false],[dropped,true]]) {
      const personal = ok(await h.call(null,player.token),'Reconnect to own result');
      assert.equal(personal.results.filter(result => result.you).length,1,'Exactly one result belongs to the authenticated player');
      assert.equal(personal.results.find(result => result.you).ok,expected,'The private result marker identifies that seat\'s answer');
    }
    assert.ok((await h.call(null,'',host.displayKey)).results.every(result => !result.you),'TV does not adopt a player outcome');

    // Jump only to the rematch boundary; complete twelve-round scoring is covered separately.
    h.mutate(s => { s.phase = 'ended'; s.deadline = 0; s.pausedAt = null; });
    state = ok(await h.call({action:'again'},host.token),'Return to lobby'); h.setGame(state.game);
    assert.equal(state.game,2);
    assert.ok(state.players.some(p => p.id === guestId),'Retained player ID survives rematch');
    assert.ok(state.players.some(p => p.id === droppedId),'Removal targets remain stable');
    for (const player of [host,guest]) ok(await h.call({action:'ready'},player.token),'Returning player ready');
    assert.equal((await h.call({action:'start'},host.token)).status,409,'A disconnected retained seat initially blocks rematch');
    assert.equal((await h.call({action:'remove',player:droppedId,game:1},host.token)).status,409,'A stale lobby request cannot alter the next match');
    state = ok(await h.call({action:'remove',player:droppedId},host.token),'Remove disconnected lobby seat');
    assert.equal(state.players.length,2);
    assert.equal((await h.call(null,dropped.token)).status,401,'Removed tokens no longer own a room seat');
    const retained = ok(await h.call(null,guest.token),'Retained token reconnect');
    assert.equal(retained.players.filter(p => p.you).length,1);
    assert.equal(retained.players.find(p => p.you).ready,true,'Retained credentials keep their original ready seat');
    assert.equal(ok(await h.call({action:'start'},host.token),'Start recovered rematch').phase,'intro');
  } finally { h.close(); }
}

async function checkAlibiRecovery() {
  const h = harness('last-alibi',alibiRequest,'links_mystery_rooms','x-alibi-token','x-alibi-display');
  try {
    const host = ok(await h.call({action:'create',name:'Host',mode:'secret',minutes:35}),'Create mystery'); h.setCode(host.code);
    const guests = [];
    for (let i = 1; i <= 3; i++) guests.push(ok(await h.call({action:'join',name:'Guest ' + i}),'Join investigator'));
    const people = [host,...guests], target = guests[0], remaining = people.filter(p => p !== target);
    for (const player of people) ok(await h.call({action:'ready'},player.token),'Take seat');
    ok(await h.call({action:'start'},host.token),'Open mystery');
    for (const player of people) ok(await h.call({action:'chapter-ready',chapter:0},player.token),'Finish briefing');
    let state = ok(await h.call({action:'continue'},host.token),'Open first investigation');
    assert.equal(state.chapter,1);
    const targetId = (await h.call(null,target.token)).players.find(p => p.you).id;
    const hostId = state.players.find(p => p.you).id;
    ok(await h.call({action:'inspect',chapter:1,id:'window'},target.token),'Private discovery');
    ok(await h.call({action:'notes',text:'Private clue trail survives an interrupted session.'},target.token),'Private notes');
    const deductionSuspect = state.suspects.find(p => p.id !== targetId).id;
    const deduction = {action:'deduction',suspect:deductionSuspect,status:'alibi',evidence:'window',chapter:1};
    ok(await h.call({...deduction,player:hostId},target.token),'Save own deduction even when an extraneous player field is supplied');
    assert.equal((await h.call({...deduction,player:targetId},guests[1].token)).status,400,'Another seat cannot borrow a private discovery through a player field');
    assert.equal((await h.call(deduction,'',host.displayKey)).status,403);
    assert.equal((await h.call({...deduction,game:0},target.token)).status,409);
    const before = ok(await h.call(null,target.token),'Capture private seat');
    assert.deepEqual(before.deductions[deductionSuspect],{status:'alibi',evidence:'window'});
    for (const player of remaining) {
      const other = ok(await h.call(null,player.token),'Another private seat');
      assert.deepEqual(other.deductions,{}); assert.equal(other.notes,'');
      assert.equal(JSON.stringify(other).includes(before.notes),false);
      assert.ok(other.players.every(p => !('deductions' in p) && !('notes' in p)));
    }
    const castBefore = before.suspects.map(p => p.id).sort();
    for (const player of remaining) ok(await h.call({action:'chapter-ready',chapter:1},player.token),'Remaining investigators ready');
    assert.equal((await h.call({action:'continue'},host.token)).status,409,'A missing investigator blocks the checkpoint');
    assert.equal((await h.call({action:'away',player:targetId,chapter:1},guests[1].token)).status,403);
    assert.equal((await h.call({action:'away',player:targetId,chapter:1},'',host.displayKey)).status,403);
    rejected(await h.call({action:'away',player:hostId,chapter:1},host.token),'Host marking self away');
    assert.equal((await h.call({action:'away',player:targetId,chapter:0},host.token)).status,409,'A stale scene cannot mark a player away');
    ok(await h.call({action:'pause'},host.token),'Pause case');
    assert.equal((await h.call({action:'away',player:targetId,chapter:1},host.token)).status,409,'Pause freezes quorum changes');
    ok(await h.call({action:'pause'},host.token),'Resume case');
    state = ok(await h.call({action:'away',player:targetId,chapter:1},host.token),'Mark disconnected investigator away');
    assert.equal(state.players.find(p => p.id === targetId).away,true);
    assert.equal(state.pace.canContinue,true,'The active investigators can continue');
    assert.deepEqual(state.suspects.map(p => p.id).sort(),castBefore,'Away cannot erase a suspect or change the puzzle');
    const away = ok(await h.call(null,target.token),'Reconnect to away seat');
    assert.deepEqual(away.privateRole,before.privateRole);
    assert.equal(away.notes,before.notes);
    assert.deepEqual(away.discovered,before.discovered);
    assert.deepEqual(away.deductions,before.deductions);
    assert.equal((await h.call({action:'chapter-ready',chapter:1},target.token)).status,409,'An away seat must explicitly return before participating');
    assert.equal((await h.call(deduction,target.token)).status,409,'An away seat cannot change its deduction board until returning');
    const publicView = ok(await h.call(null,'',host.displayKey),'Check shared screen');
    assert.equal(publicView.notes,''); assert.equal(publicView.privateRole,null); assert.deepEqual(publicView.discovered,[]); assert.deepEqual(publicView.deductions,{});
    assert.equal(JSON.stringify(publicView).includes(before.notes),false);
    state = ok(await h.call({action:'continue'},host.token),'Continue with active quorum');
    assert.equal(state.chapter,2);
    assert.equal((await h.call({action:'return',chapter:1},target.token)).status,409,'Returning with a stale scene requires a refresh');
    assert.equal((await h.call({action:'return',chapter:2},'',host.displayKey)).status,403);
    state = ok(await h.call({action:'return',chapter:2},target.token),'Return to same private seat');
    assert.equal(state.players.find(p => p.you).away,false);
    assert.equal(state.players.find(p => p.you).id,targetId);
    assert.equal(state.players.find(p => p.you).chapterReady,false,'Returning does not reuse an old ready vote');
    assert.deepEqual(state.privateRole,before.privateRole); assert.equal(state.notes,before.notes); assert.deepEqual(state.deductions,before.deductions);
    assert.equal(state.pace.canReady,false,'A returning player still completes the current theory checkpoint');

    // Exercise the final vote denominator without replaying the full investigation.
    h.mutate(s => { s.phase = 'accuse'; s.chapter = 4; s.deadline = now + 60000; s.phaseStarted = now; s.published = [...new Set([...(s.published || []),'window'])]; });
    ok(await h.call({action:'away',player:targetId,chapter:4},host.token),'Exclude absent final voter');
    const truth = h.raw(), culprit = truth.players[truth.case.killer].id;
    const voting = [];
    for (const player of remaining) voting.push({player,id:(await h.call(null,player.token)).players.find(p => p.you).id});
    const correctVoters = voting.filter(v => v.id !== culprit).slice(0,2);
    assert.equal(correctVoters.length,2);
    for (const voter of voting) {
      const suspect = correctVoters.includes(voter) ? culprit : Object.values(truth.players).find(p => p.id !== culprit && p.id !== voter.id).id;
      ok(await h.call({action:'accuse',suspect,scene:truth.case.scene.id,object:truth.case.object,evidence:'window'},voter.player.token),'Active investigator seals accusation');
    }
    assert.equal((await h.call({action:'accuse',suspect:culprit,scene:truth.case.scene.id,object:truth.case.object,evidence:'window'},target.token)).status,409,'Away voters cannot submit hidden ballots');
    state = ok(await h.call({action:'continue'},host.token),'Reveal with active ballots');
    assert.equal(state.phase,'ended');
    assert.equal(h.raw().caught,true,'Two correct votes out of three active investigators form a majority');
    assert.equal(Object.values(h.raw().players).find(p => p.id === targetId).score,0,'Away investigators are not awarded attendance points');
    assert.equal(h.results().length,3,'Only active Secret Killer participants receive a stored party result');
    assert.ok(h.results().every(row => row.playerId !== targetId),'An away Secret Killer seat cannot collect a party result or win');
    assert.deepEqual(state.ending,{},'Recovery must preserve the sealed reveal');
    for (let step = 0; step < 4; step++) ok(await h.call({action:'reveal',step},host.token),'Open reveal stage');
    state = ok(await h.call({action:'again'},host.token),'New mystery lobby'); h.setGame(state.game);
    assert.ok(state.players.every(p => !p.away && !p.ready),'Rematch resets readiness and away status');
    assert.equal((await h.call({action:'remove',player:targetId,game:1},host.token)).status,409);
    assert.equal((await h.call({action:'remove',player:targetId},guests[1].token)).status,403);
    rejected(await h.call({action:'remove',player:hostId},host.token),'Host lobby self removal');
    state = ok(await h.call({action:'remove',player:targetId},host.token),'Release abandoned lobby seat');
    assert.equal(state.players.length,3);
    assert.equal((await h.call(null,target.token)).status,401);
    assert.equal((await h.call({...deduction,chapter:0},target.token)).status,401,'Removed credentials cannot mutate the next case');
    const replacement = ok(await h.call({action:'join',name:'New Guest'}),'Admit replacement for next mystery');
    for (const player of [...remaining,replacement]) ok(await h.call({action:'ready'},player.token),'Ready for recovered mystery');
    assert.equal(ok(await h.call({action:'start'},host.token),'Start next mystery after a dropped player').phase,'briefing');
  } finally { h.close(); }
}

async function checkStoredAlibiParticipation() {
  const h = harness('last-alibi',alibiRequest,'links_mystery_rooms','x-alibi-token','x-alibi-display');
  try {
    const host = ok(await h.call({action:'create',name:'Host',mode:'together',minutes:35}),'Create cooperative score fixture'); h.setCode(host.code);
    const returned = ok(await h.call({action:'join',name:'Returning investigator'}),'Join returning investigator');
    const absent = ok(await h.call({action:'join',name:'Absent investigator'}),'Join absent investigator');
    const hostId = host.players.find(p => p.you).id;
    const returnedId = returned.players.find(p => p.you).id;
    const absentId = absent.players.find(p => p.you).id;
    for (const player of [host,returned,absent]) ok(await h.call({action:'ready'},player.token),'Ready cooperative fixture');
    ok(await h.call({action:'start'},host.token),'Start cooperative fixture');
    h.mutate(s => { s.phase = 'accuse'; s.chapter = 4; s.deadline = now + 60000; s.phaseStarted = now; s.published = ['window']; });
    ok(await h.call({action:'away',player:returnedId,chapter:4},host.token),'Temporarily away before final vote');
    ok(await h.call({action:'return',chapter:4},returned.token),'Return before final vote');
    ok(await h.call({action:'away',player:absentId,chapter:4},host.token),'Remain away at completion');
    const truth = h.raw(), culprit = truth.suspects[truth.case.killer].id;
    for (const player of [host,returned]) {
      ok(await h.call({action:'accuse',suspect:culprit,scene:truth.case.scene.id,object:truth.case.object,evidence:'window'},player.token),'Active cooperative accusation');
    }
    ok(await h.call({action:'continue'},host.token),'Complete cooperative case');
    assert.equal(h.raw().caught,true);
    const expected = [hostId,returnedId].sort().map(playerId => ({playerId,score:700,win:1}));
    assert.deepEqual(h.results(),expected,'Saved party scores contain the host and returned investigator only');
    assert.ok(h.results().every(row => row.playerId !== absentId),'Away investigators receive neither a saved result nor a cooperative win');
    ok(await h.call({action:'reveal',step:0},host.token),'Advance reveal after scores are stored');
    assert.deepEqual(h.results(),expected,'Reveal updates preserve the participant filter');
    const lobby = ok(await h.call({action:'again'},host.token),'Rematch after cooperative result'); h.setGame(lobby.game);
    assert.ok(lobby.players.every(p => !p.away),'The next lobby restores all retained seats');
    assert.deepEqual(h.results(1),expected,'Resetting away flags in a rematch cannot backfill the previous game');
  } finally { h.close(); }

  const otherGame = partyOutcomes('trivia-rally',{game:1,phase:'ended',mode:'friends',players:{winner:{score:500,away:true},runnerUp:{score:100,away:false}}});
  assert.deepEqual(otherGame.map(({seat,score,win}) => ({seat,score,win})),[
    {seat:'winner',score:500,win:1},{seat:'runnerUp',score:100,win:0}
  ],'The away filter applies only to Last Alibi; unrelated game outcomes remain unchanged');
}

try {
  if (!process.argv.includes('--alibi-only')) await checkDeadAirRecovery();
  if (!process.argv.includes('--dead-air-only')) { await checkAlibiRecovery(); await checkStoredAlibiParticipation(); }
  console.log(process.argv.includes('--alibi-only')
    ? 'PASS Last Alibi playability: private deduction/notes isolation, preserved returning seats, active quorum and majority, stored participation-only scores, stale-action protection, credential revocation and rematch.'
    : process.argv.includes('--dead-air-only')
      ? 'PASS Dead Air playability: legacy player IDs, own-result markers, host-only lobby removal, stale-action protection, credential revocation and rematch.'
      : 'PASS party playability: disconnected-seat recovery, host-only controls, stable result ownership, private seat preservation, active vote majority, stored participation-only scores, unchanged other-game outcomes, stale-action protection and rematches.');
} finally { Date.now = realNow; globalThis.fetch = realFetch; }
