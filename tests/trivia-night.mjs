import {ensureOwner} from '../functions/lib/owner-auth.js';
import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/trivia-night.js';
import {STARTER,validateBank,points} from '../functions/lib/trivia-night.js';
const {db}=fixture(),origin='https://local.invalid';
let code,hostState;
async function call(body=null,{admin='',guest='',badOrigin=false,query=''}={}){
 const request=new Request(origin+'/new-build/api/trivia-night'+(query||('?code='+(code||''))),{method:body?'POST':'GET',headers:{Origin:badOrigin?'https://wrong.invalid':origin,Authorization:'Bearer '+admin,'x-trivia-token':guest,'Content-Type':'application/json'},...(body?{body:JSON.stringify({code,...body})}:{})});
 const r=await onRequest({request,env:{DB:db}});return {status:r.status,...await r.json()};
}
async function host(action,extra={}){const j=await call({action,gameNumber:hostState.game,index:hostState.index,phase:hostState.phase,...extra},{admin:'admin'});if(j.status===200)hostState=j;if(action==='next'&&j.status===200){assert.equal(j.phase,'category');assert.equal(j.question,null);const started=await host('start-question');assert.equal(started.countdown,true);assert.equal(started.question,null);edit(s=>{s.startsAt=Date.now()-1;s.deadline=s.startsAt+20000});hostState=await call(null,{admin:'admin'});return hostState}return j}
function raw(){return JSON.parse(db.raw.prepare('SELECT state FROM links_trivia_night_rooms WHERE code=?').get(code).state)}
function edit(f){const s=raw();f(s);db.raw.prepare('UPDATE links_trivia_night_rooms SET state=? WHERE code=?').run(JSON.stringify(s),code)}
try{
 assert.equal(validateBank(STARTER).length,51);
 assert.throws(()=>validateBank([{...STARTER[0],correct:5}]),/Question/);
 assert.throws(()=>validateBank([STARTER[0],STARTER[0]]),/unique/);
 assert.throws(()=>validateBank([{...STARTER[0],source:''}]),/source/);
 assert.equal(points({difficulty:'hard'},0),2000);assert.equal(points({difficulty:'easy'},10000),500);
 assert.equal((await call({action:'create',categories:['general'],difficulty:'mixed'})).status,403);
 assert.equal((await call({action:'create'},{admin:'admin',badOrigin:true})).status,403);
 hostState=await call({action:'create',categories:['general'],difficulty:'mixed',title:'Local trivia test'},{admin:'admin'});assert.equal(hostState.status,200);code=hostState.code;
 assert.equal((await call()).status,401);
 assert.equal((await call(null,{admin:'outsider'})).status,401);
 const alice=await call({action:'join',name:'Alice'}),bob=await call({action:'join',name:'Bob'});assert.equal(alice.status,200);assert.ok(alice.token);
 assert.equal((await call({action:'join',name:'alice'})).status,409);
 assert.equal((await call({action:'next'},{guest:alice.token})).status,403);
 await host('next');assert.equal(hostState.phase,'question');
 const current=raw().deck[0];
 assert.equal('correct' in hostState.question,false);
 assert.equal(JSON.stringify(await call(null,{guest:alice.token})).includes('deck'),false);
 assert.equal((await host('reveal')).status,409);
 const late=await call({action:'join',name:'Late arrival'});assert.equal(late.eligible,false);
 assert.equal((await call({action:'answer',gameNumber:1,index:0,choice:current.correct},{guest:late.token})).status,409);
 let a=await call({action:'answer',gameNumber:1,index:0,choice:current.correct},{guest:alice.token});assert.equal(a.status,200);assert.equal(a.choice,current.correct);assert.equal(a.leaders.find(p=>p.you).score,0);
 assert.equal((await call({action:'answer',gameNumber:1,index:0,choice:current.correct},{guest:alice.token})).status,409);
 assert.equal((await call({action:'answer',gameNumber:1,index:0,choice:99},{guest:bob.token})).status,400);
 await call({action:'answer',gameNumber:1,index:0,choice:(current.correct+1)%4},{guest:bob.token});
 edit(s=>{s.deadline=Date.now()-1});await host('reveal');assert.equal(hostState.question.correct,current.correct);assert.ok(hostState.leaders.find(p=>p.name==='Alice').score>0);assert.equal(hostState.leaders.find(p=>p.name==='Bob').score,0);
 const total=hostState.leaders[0].score;assert.equal((await host('reveal')).status,409);assert.equal((await call(null,{guest:alice.token})).leaders[0].score,total);
 assert.equal((await call(null,{guest:alice.token,query:'?action=library'})).status,403);
 const bank=await call(null,{admin:'admin',query:'?action=library'});assert.equal(bank.count,51);assert.equal(bank.questions,undefined);await ensureOwner(db);await db.prepare("INSERT INTO links_admin_sessions VALUES('owner','2099-01-01')").run();assert.equal((await call({action:'import',questions:STARTER},{admin:'admin'})).status,403);
 assert.equal((await call({action:'import',questions:[{...STARTER[0],answers:[]}]},{admin:'owner'})).status,400);
 const replacement=[{...STARTER.find(q=>q.category==='general'),text:'Replacement sample question?'}];
 assert.equal((await call({action:'import',questions:replacement},{admin:'owner'})).status,200);assert.equal(raw().deck.length,3);
 await host('next');assert.equal((await call(null,{guest:late.token})).eligible,true);
 assert.equal((await call({action:'answer',gameNumber:1,index:0,choice:0},{guest:late.token})).status,409);
 edit(s=>{s.deadline=Date.now()-1});assert.equal((await call({action:'answer',gameNumber:1,index:1,choice:0},{guest:late.token})).status,409);
 await host('end');assert.equal(hostState.phase,'ended');
 await host('restart',{categories:['general'],difficulty:'mixed'});assert.equal(hostState.game,2);assert.equal(hostState.playerCount,3);assert.ok(hostState.leaders.every(p=>p.score===0));assert.equal(raw().deck.length,1);
 await host('next');assert.equal(hostState.question.text,'Replacement sample question?');
 assert.equal((await call({action:'answer',gameNumber:1,index:0,choice:0},{guest:alice.token})).status,409);
 const old=db.prepare.bind(db);let conflict=true;db.prepare=sql=>{const p=old(sql);if(sql.startsWith('UPDATE links_trivia_night_rooms SET state=')){const run=p.run.bind(p);p.run=async()=>{if(conflict){conflict=false;return {meta:{changes:0}}}return run()}}return p};
 assert.equal((await call({action:'answer',gameNumber:2,index:0,choice:0},{guest:alice.token})).status,200);db.prepare=old;
 await call({action:'import',questions:STARTER},{admin:'owner'});
 edit(s=>{s.deadline=Date.now()-1});await host('end');await host('restart',{categories:['general'],difficulty:'mixed'});await host('next');edit(s=>{s.deadline=Date.now()-1});await host('reveal');
 await host('final');assert.equal(hostState.phase,'category');assert.equal(hostState.isFinal,true);assert.equal(hostState.question,null);await host('start-question');assert.equal((await call({action:'answer',gameNumber:hostState.game,index:hostState.index,choice:0},{guest:alice.token})).status,409);edit(s=>{s.startsAt=Date.now()-1;s.deadline=s.startsAt+20000});
 const fq=raw().deck[hostState.index];assert.equal(fq.difficulty,'hard');
 await call({action:'answer',gameNumber:hostState.game,index:hostState.index,choice:fq.correct},{guest:alice.token});
 const beforeFinal=hostState.leaders.find(p=>p.name==='Alice').score;
 edit(s=>{s.deadline=Date.now()-1});await host('reveal');assert.equal(hostState.phase,'reveal');assert.equal(hostState.question.correct,fq.correct);assert.ok(hostState.leaders.find(p=>p.name==='Alice').score-beforeFinal>=3000);assert.equal((await host('next')).status,409);assert.equal((await host('final')).status,409);await host('end');assert.equal(hostState.phase,'ended');
 db.raw.prepare('UPDATE links_trivia_night_rooms SET expires=0 WHERE code=?').run(code);assert.equal((await call(null,{guest:alice.token})).status,404);
 const create={action:'create',categories:['football'],difficulty:'mixed'};
 assert.equal((await call(create,{admin:'admin'})).status,200);
 assert.equal((await call(create,{admin:'admin'})).status,402,'Free host gets one room');
 db.raw.exec("INSERT INTO links_pool_owners VALUES(1,'host@example.com'),(2,'host@example.com')");
 assert.equal((await call(create,{admin:'outsider'})).status,402,'A second owned pool shares the limit');
 db.raw.exec("INSERT INTO links_account_plans VALUES('host@example.com','plus','2099-01-01','purchase')");
 assert.equal((await call(create,{admin:'outsider'})).status,200);
 assert.equal((await call(create,{admin:'admin'})).status,200);
 assert.equal((await call(create,{admin:'admin'})).status,402,'Plus allows three rooms');
 db.raw.exec("UPDATE links_account_plans SET expires_at='2000-01-01'");
 assert.equal((await call(create,{admin:'admin'})).status,402,'Expired package cannot create extra rooms');
 assert.equal((await call(null,{admin:'admin',query:'?action=library'})).roomLimit,1);
 db.raw.exec("UPDATE links_trivia_night_rooms SET expires=0");
 assert.equal((await call(create,{admin:'admin'})).status,200,'Expired rooms release capacity');
 console.log('PASS: room authorization, CSRF, hidden answers, late joining, server deadlines, immutable answers, scoring/reveal, import validation/isolation, restart, stale requests, write-conflict retry, expiry.');
}finally{db.raw.close()}
