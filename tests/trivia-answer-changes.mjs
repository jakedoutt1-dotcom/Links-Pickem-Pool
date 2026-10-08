import assert from 'node:assert/strict';
import {prepareTurn,prepareDuel,advance,act,view} from '../functions/lib/million-point.js';
import {STARTER,SECONDS,TEAM_SECONDS} from '../functions/lib/trivia-night.js';
import {respond,advance as advanceDead} from '../functions/lib/dead-air.js';
assert.deepEqual(SECONDS,{easy:10,medium:12,hard:15});assert.deepEqual(TEAM_SECONDS,{easy:15,medium:20,hard:25});
for(const mode of ['hotseat','duel']){
 const s={mode,game:1,phaseId:0,bank:STARTER,players:{a:{name:'A'},b:{name:'B'}},order:['a','b'],turn:0};(mode==='duel'?prepareDuel:prepareTurn)(s,1000);advance(s,s.deadline);const correct=s.deck[0].correct;
 const answer=choice=>act(s,'a',{action:'answer',game:1,phaseId:s.phaseId,choice},s.deadline-100);
 answer((correct+1)%4);answer(correct);assert.equal(s.phase,'question');assert.equal(view(s,'a',s.deadline-1).choice,correct);assert.equal(view(s,'b',s.deadline-1).choice,null);assert.equal(view(s,'a',s.deadline-1,true).choice,null);assert.equal(view(s,'a',s.deadline-1).question.correct,undefined);
 assert.throws(()=>act(s,'a',{action:'answer',game:1,phaseId:s.phaseId,choice:correct},s.deadline));advance(s,s.deadline);assert.equal(s.phase,'reveal');if(mode==='duel')assert.equal(s.duel.a.out,false);else assert.equal(s.correct,true);
}
const d={phase:'question',startsAt:1000,deadline:16000,question:{correct:1},players:{a:{name:'A',lives:3,score:0}},responses:{}};
respond(d,'a',0,2000);respond(d,'a',1,5000);respond(d,'a',1,6000);assert.equal(d.responses.a.at,5000);assert.throws(()=>respond(d,'a',0,16000));advanceDead(d,16000);assert.equal(d.players.a.score,136);
console.log('PASS latest choice wins, no early answer leaks, private choices, exact-deadline lock, repeat-tap bonus preserved and shorter timers');
