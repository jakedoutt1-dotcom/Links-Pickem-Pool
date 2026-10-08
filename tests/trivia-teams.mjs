import {grantTestHost} from './helpers/trivia-host-access.mjs';
import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/trivia-night.js';
import {points,answerSeconds} from '../functions/lib/trivia-night.js';
const {db}=fixture();await grantTestHost(db);let s,code,guest;
async function call(body,admin=true,query=''){const r=await onRequest({request:new Request('https://local.invalid/api/trivia-night'+query,{method:body?'POST':'GET',headers:{Origin:'https://local.invalid',Authorization:admin?'Bearer admin':'','x-trivia-token':admin?'':guest||'','Content-Type':'application/json'},...(body?{body:JSON.stringify({code,...body})}:{})}),env:{DB:db}});return {status:r.status,...await r.json()}}
async function host(action,extra={}){s=await call({action,gameNumber:s.game,index:s.index,phase:s.phase,...extra});assert.equal(s.status,200);return s}
try{
 assert.equal(points({difficulty:'easy'},0,'teams'),750);assert.equal(points({difficulty:'easy'},10000,'teams'),625);assert.equal(points({difficulty:'hard'},45000,'teams'),1500);assert.equal(answerSeconds('medium','teams'),30);
 assert.equal((await call({action:'create',mode:'bad',categories:['football'],difficulty:'mixed'})).status,400);
 s=await call({action:'create',mode:'teams',categories:['football'],difficulty:'mixed'});code=s.code;assert.equal(s.mode,'teams');assert.equal((await call(null,false,'?action=info&code='+code)).mode,'teams');
 const joined=await call({action:'join',name:'The Winners'},false);guest=joined.token;assert.equal(joined.mode,'teams');assert.equal(joined.playerCount,1);
 for(const [difficulty,seconds] of [['easy',20],['medium',30],['hard',45]]){
  await host('next',{category:'football',difficulty});await host('start-question');assert.equal(s.deadline-s.startsAt,seconds*1000);
  let raw=JSON.parse(db.raw.prepare('SELECT state FROM links_trivia_night_rooms WHERE code=?').get(code).state);raw.startsAt=Date.now()-1000;raw.deadline=raw.startsAt+seconds*1000;db.raw.prepare('UPDATE links_trivia_night_rooms SET state=? WHERE code=?').run(JSON.stringify(raw),code);
  const answer=await call({action:'answer',gameNumber:s.game,index:s.index,choice:raw.deck[s.index].correct},false);assert.equal(answer.status,200);assert.equal((await call({action:'answer',gameNumber:s.game,index:s.index,choice:0},false)).status,409);
  raw=JSON.parse(db.raw.prepare('SELECT state FROM links_trivia_night_rooms WHERE code=?').get(code).state);const expected=Object.values(raw.players)[0].score+points(raw.deck[raw.index],Object.values(raw.players)[0].answer.elapsed,'teams');raw.deadline=Date.now()-1;db.raw.prepare('UPDATE links_trivia_night_rooms SET state=? WHERE code=?').run(JSON.stringify(raw),code);await host('reveal');assert.equal(s.leaders[0].score,expected);assert.equal(s.leaders[0].name,'The Winners');
 }
 await host('final');await host('start-question');assert.equal(s.deadline-s.startsAt,45000);
 let raw=JSON.parse(db.raw.prepare('SELECT state FROM links_trivia_night_rooms WHERE code=?').get(code).state);raw.deadline=Date.now()-1;db.raw.prepare('UPDATE links_trivia_night_rooms SET state=? WHERE code=?').run(JSON.stringify(raw),code);await host('reveal');await host('end');await host('restart',{categories:['football'],difficulty:'mixed'});assert.equal(s.mode,'teams');assert.equal(s.leaders[0].score,0);assert.equal(s.playerCount,1);
 console.log('PASS team timers, speed bonus, one submission, team standings, final round and replay.');
}finally{db.raw.close()}
