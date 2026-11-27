import {pullbackInput,shotInput,precisionPower} from '../public/new-build/daily-shot-controls.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyShots,launch,step,simulate,centralDay,weekStart,streaks,validInput} from '../public/new-build/daily-shot-core.mjs';
import {dailyShotRequest} from '../functions/new-build/api/daily-shot.js';
import {fixture} from './helpers/pool-format-fixture.mjs';
function clean(shot){const distance=Math.hypot(shot.x,shot.z),t=1.2+(distance-4)*.025,power=((3.05-1.5+9.81*t*t/2)/t-4+9.81/240)/6;return {aim:-shot.offset/.65,power};}
test('Daily Shot uses deterministic daily positions, physical arcs and real hoop crossing',()=>{
 const a=dailyShots('daily-shot-v1:2026-11-26');assert.deepEqual(a,dailyShots('daily-shot-v1:2026-11-26'));assert.notDeepEqual(a,dailyShots('daily-shot-v1:2026-11-27'));assert.equal(a.length,5);
 for(const shot of a){const input=clean(shot),s=launch(shot,input);while(!s.done)step(s);assert.equal(s.points,20,'Every daily position has a reachable clean swish');assert.equal(simulate(shot,input).points,s.points);const missed=simulate(shot,{aim:1,power:0});assert.equal(missed.points,0);assert.equal(missed.made,false);}
 for(const input of [{aim:NaN,power:.4},{aim:Infinity,power:.4},{aim:0,power:2},{aim:'0',power:.5},null]){assert.equal(validInput(input),false);assert.throws(()=>launch(a[0],input));}
 const rim=simulate(a[0],{aim:-a[0].offset/.65,power:.513}),bank=simulate(a[0],{aim:-a[0].offset/.65,power:.514});assert.equal(rim.points,10);assert.equal(bank.points,10);assert.equal(bank.bank,true);assert.equal(bank.swish,false);
 const rebound=simulate(a[0],{aim:0,power:1},{trace:true});assert.ok(rebound.frames.some(f=>f.y>4));assert.ok(rebound.frames.some(f=>f.y<.15));assert.ok(rebound.duration<=5);
 assert.equal(centralDay(Date.parse('2026-11-27T05:59:59Z')),'2026-11-26');assert.equal(centralDay(Date.parse('2026-11-27T06:00:00Z')),'2026-11-27');assert.equal(weekStart('2026-11-29'),'2026-11-23');assert.deepEqual(streaks(['2026-11-24','2026-11-25','2026-11-26'],'2026-11-26'),{current:3,best:3});assert.equal(streaks(['2026-11-25'],'2026-11-26').current,1);
});
test('Verified runs: three attempts, immutable shots, resumability, score replay, privacy, weekly bests and Central reset',async()=>{
 const {db}=fixture();let now=Date.parse('2026-11-26T18:00Z'),email='shooter@example.com';
 const call=async(body=null,{origin='https://shot.test',query=''}={})=>{const r=await dailyShotRequest({env:{DB:db},request:new Request('https://shot.test/new-build/api/daily-shot'+query,{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})},{now:()=>now,session:async()=>email?{email,displayName:'Shooter'}:null});return {status:r.status,...await r.json()}};
 try{
  let state=await call();assert.equal(state.status,200);assert.equal(state.remaining,3);assert.equal(state.seed,'daily-shot-v1:2026-11-26');assert(!JSON.stringify(state).includes(email));
  email=null;assert.equal((await call({action:'start'})).status,401);email='shooter@example.com';assert.equal((await call({action:'start'},{origin:'https://evil.test'})).status,403);
  assert.equal((await call({action:'start',venueId:'missing'})).status,400);assert.equal((await call(null,{query:'?period=invalid'})).status,400);
  const first=await call({action:'start'});assert.equal(first.status,200,JSON.stringify(first));assert.equal(first.run.attempt,1);assert.equal(first.remaining,2);assert.equal((await call({action:'start'})).run.id,first.run.id,'Another start resumes instead of wasting an attempt');
  assert.equal((await call({action:'shoot',id:first.run.id,version:0,input:{aim:4,power:.5}})).status,400);
  let run=first.run;
  for(let i=0;i<5;i++){const result=await call({action:'shoot',id:run.id,version:run.version,input:clean(first.shots[i]),score:99999});assert.equal(result.status,200,JSON.stringify(result));assert.equal(result.run.score,(i+1)*20);assert.equal((await call({action:'shoot',id:run.id,version:run.version,input:clean(first.shots[i])})).status,409,'A shot cannot be replaced or counted twice');run=result.run;const reload=await call();assert.equal((reload.run||reload.lastRun).version,run.version);if(i<4)assert.equal((await call({action:'shoot',id:run.id,version:run.version,input:clean(first.shots[i+1])})).status,409,'Shots cannot be rushed before the animation ends');now=run.nextAt+1;}
  state=await call();assert.equal(state.best,100);assert.equal(state.leaderboard[0].score,100);assert.equal(state.streak.current,1);assert.equal(state.run,null);assert.equal(state.lastRun.complete,true);
  for(let attempt=2;attempt<=3;attempt++){let start=await call({action:'start'});assert.equal(start.run.attempt,attempt);let r=start.run;for(let i=0;i<5;i++){const next=await call({action:'shoot',id:r.id,version:r.version,input:{aim:1,power:0}});assert.equal(next.status,200);r=next.run;now=r.nextAt+1;}}
  assert.equal((await call({action:'start'})).status,409);state=await call();assert.equal(state.remaining,0);assert.equal(state.best,100);assert.equal(state.leaderboard[0].score,100,'Repeated runs do not inflate score');assert(!JSON.stringify(state).includes(email));assert(!JSON.stringify(state.leaderboard).includes('owner'));
  now=Date.parse('2026-11-27T18:00Z');const next=await call({action:'start'});assert.equal(next.run.attempt,1);assert.equal(next.remaining,2);assert.notEqual(next.seed,first.seed);assert.equal(next.streak.current,1);assert.equal((await call(null,{query:'?period=week'})).leaderboard[0].score,100);
  now+=21*60000;assert.equal((await call({action:'shoot',id:next.run.id,version:0,input:{aim:0,power:.4}})).status,409);assert.equal((await call({action:'start'})).run.attempt,2);
  assert.equal((await call(null,{query:'?scope=pool'})).status,403);email=null;assert.equal((await call()).signedIn,false);
 }finally{db.raw.close()}
});
test('Pool logins, venue standings and simultaneous starts preserve one active ranked attempt',async()=>{
 const {db}=fixture();let now=Date.parse('2026-11-26T19:00Z');
 const call=async(body=null,query='pool=1&scope=pool',token='alice')=>{const r=await dailyShotRequest({env:{DB:db},request:new Request('https://shot.test/new-build/api/daily-shot?'+query,{method:body?'POST':'GET',headers:{Origin:'https://shot.test',Authorization:'Bearer '+token},...(body?{body:JSON.stringify(body)}:{})})},{now:()=>now,session:async()=>null});return {status:r.status,...await r.json()}};
 try{
  assert.equal((await call()).player,'Alice');db.raw.prepare('INSERT INTO links_partners VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run('v1','The Home Court','/links-small-logo.png','Private address',36,-86,100,'Offer','',0,1,'now');
  const both=await Promise.all([call({action:'start',venueId:'v1'}),call({action:'start',venueId:'v1'})]);assert.equal(both[0].status,200);assert.equal(both[1].status,200);assert.equal(both[0].run.id,both[1].run.id,'Both tabs resume the same run');assert.equal((await call()).used,1);
  let run=both[0].run;for(const shot of both[0].shots){const r=await call({action:'shoot',id:run.id,version:run.version,input:clean(shot)});assert.equal(r.status,200);run=r.run;now=run.nextAt+1;}
  assert.equal((await call()).leaderboard[0].name,'Alice');const venue=await call(null,'scope=venue&venue=v1','');assert.equal(venue.leaderboard[0].score,100);assert.equal(venue.pool,null);assert(!JSON.stringify(venue).includes('Private address'));assert.equal((await call(null,'pool=1&scope=pool','outsider')).status,403);
  db.raw.exec("DELETE FROM pool_players WHERE pool_id=1 AND name='Alice'");assert.equal((await call(null,'pool=1')).signedIn,false,'A removed member cannot keep posting through an old pool session');
 }finally{db.raw.close()}
});

test('Pulling back adds enough lift on phones and desktops',()=>{
 for(const [w,h] of [[390,410],[1280,650]]){
  const short=pullbackInput(0,25,w,h),medium=pullbackInput(0,65,w,h),full=pullbackInput(0,160,w,h);
  assert(short.power<medium.power);assert(medium.power<full.power);assert.equal(full.power,1);
  assert.equal(pullbackInput(0,-60,w,h).power,0);
  const shot=dailyShots('pullback')[0],low=simulate(shot,short,{trace:true}),high=simulate(shot,full,{trace:true});
  assert(Math.max(...high.frames.map(f=>f.y))>5);assert(Math.max(...high.frames.map(f=>f.y))>Math.max(...low.frames.map(f=>f.y)));
 }
});

test('Centered controls target the visible hoop and allow small aim corrections',()=>{
 for(const shot of dailyShots('daily-shot-v1:2026-11-26')){
  assert(Math.abs(precisionPower(.55,shot)-precisionPower(.45,shot))<.009,'Useful power has a forgiving finger travel range');
  const input=shotInput(0,precisionPower(.5,shot),shot);assert.equal(simulate(shot,input).points,20);
 }
 assert(Math.abs(pullbackInput(10,65,390,410).aim)<.03);
});
