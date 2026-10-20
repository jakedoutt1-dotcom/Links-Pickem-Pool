import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {dailyRequest,onRequest} from '../functions/new-build/api/daily-challenge.js';
import {BANK,dailyDeck,centralDay,resetAt} from '../functions/lib/daily-challenge.js';
import {ensureAccounts,digest} from '../functions/lib/commissioner-account.js';
const {db}=fixture();let now=Date.parse('2026-10-20T17:00:00Z');let email='alice@example.com';
async function call(body=null,{origin='https://test',method=body?'POST':'GET',signed=true}={}){const response=await dailyRequest({env:{DB:db},request:new Request('https://test/new-build/api/daily-challenge',{method,headers:{Origin:origin},...(body?{body:JSON.stringify(body)}:{})})},{now:()=>now,session:async()=>signed?{email,displayName:'Alice'}:null});return {status:response.status,...await response.json()}}
const next=a=>call({action:'next',id:a.id,version:a.version});
const answer=(a,choice)=>call({action:'answer',id:a.id,version:a.version,choice});
async function finish(){let r=await call({action:'start'});if(r.attempt.status==='ready')r=await next(r.attempt);for(let i=0;i<5;i++){if(r.attempt.status==='question')r=await answer(r.attempt,dailyDeck(r.day)[i].answer);r=await next(r.attempt)}return r}
try{
 assert(BANK.length>=60);for(const q of BANK){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert(q.answer>=0&&q.answer<4)}
 assert.deepEqual(dailyDeck('2026-10-20'),dailyDeck('2026-10-20'));assert.notDeepEqual(dailyDeck('2026-10-20'),dailyDeck('2026-10-21'));
 const epochDays=Math.floor(BANK.length/5),startDay=Math.floor(Date.parse('2026-10-20T00:00:00Z')/86400000/epochDays)*epochDays;const cycle=Array.from({length:epochDays},(_,i)=>dailyDeck(new Date((startDay+i)*86400000).toISOString().slice(0,10))).flat();assert.equal(new Set(cycle.map(q=>q.text)).size,60);
 assert.equal(centralDay(Date.parse('2026-10-20T04:59:59Z')),'2026-10-19');assert.equal(centralDay(Date.parse('2026-10-20T05:00:00Z')),'2026-10-20');
 assert.equal(resetAt(Date.parse('2026-03-08T06:30:00Z')),'2026-03-09T05:00:00.000Z');assert.equal(resetAt(Date.parse('2026-11-01T05:30:00Z')),'2026-11-02T06:00:00.000Z');
 let r=await call(null,{signed:false});assert.equal(r.status,200);assert.equal(r.attempt,null);assert(!JSON.stringify(r).includes('explanation'));assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM links_daily_decks').get().n,0);
 assert.equal((await call({action:'start'},{signed:false})).status,401);assert.equal((await call({action:'start'},{origin:'https://evil'})).status,403);assert.equal((await call(null,{method:'PUT'})).status,405);
 r=await call({action:'start'});assert.equal(r.attempt.status,'ready');assert.equal(r.attempt.question,null);const initial=r.attempt;
 assert.equal((await call({action:'start'})).attempt.id,initial.id);r=await next(initial);assert.equal(r.attempt.status,'question');assert.equal(Object.keys(r.attempt.question).sort().join(','),'category,choices,text');assert.equal(r.attempt.feedback,null);
 assert.equal((await next(initial)).status,409);assert.equal((await answer(r.attempt,4)).status,400);
 const q=r.attempt;email='bob@example.com';assert.equal((await answer(q,0)).status,409);email='alice@example.com';
 const correct=dailyDeck(r.day)[0].answer;const simultaneous=await Promise.all([answer(q,correct),answer(q,correct)]);assert.deepEqual(simultaneous.map(x=>x.status).sort(),[200,409]);r=simultaneous.find(x=>x.status===200);assert.equal(r.attempt.score,100);assert.equal(r.attempt.feedback.answer,correct);assert.equal(r.attempt.question.text,q.question.text);
 r=await next(r.attempt);now+=20000;r=await answer(r.attempt,dailyDeck(r.day)[1].answer);assert.equal(r.attempt.feedback.correct,false);assert.equal(r.attempt.score,100);
 for(let i=2;i<5;i++){r=await next(r.attempt);r=await answer(r.attempt,dailyDeck(r.day)[i].answer)}assert.equal(r.leaderboard.length,0);r=await next(r.attempt);assert.equal(r.attempt.status,'complete');assert.equal(r.attempt.score,400);assert.equal(r.streak,1);assert.equal(r.leaderboard.length,1);assert(!JSON.stringify(r.leaderboard).includes('alice@example.com'));assert.equal((await next(r.attempt)).status,409);assert.equal((await call({action:'start'})).attempt.score,400);
 now=Date.parse('2026-10-21T17:00:00Z');r=await finish();assert.equal(r.attempt.score,500);assert.equal(r.streak,2);assert.equal(r.bestStreak,2);now=Date.parse('2026-10-23T17:00:00Z');r=await finish();assert.equal(r.streak,1);assert.equal(r.bestStreak,2);
 email='timeout@example.com';r=await call({action:'start'});r=await next(r.attempt);assert.equal((await answer(r.attempt,null)).status,400);now+=20000;r=await answer(r.attempt,null);assert.equal(r.attempt.feedback.correct,false);const yesterday=r.attempt;now+=86400000;assert.equal((await next(yesterday)).status,409);assert.equal((await call()).attempt,null);
 // Exercise real production account authentication rather than only the test seam.
 await ensureAccounts(db);await db.prepare('INSERT INTO links_account_sessions VALUES(?,?,?)').bind(await digest('test-account-token'),'real@example.com','2099-01-01').run();const real=await onRequest({env:{DB:db},request:new Request('https://test/new-build/api/daily-challenge',{headers:{'x-links-account':'test-account-token'}})});assert.equal((await real.json()).signedIn,true);
 console.log('PASS Daily Challenge: shared deterministic 60-question bank, Central/DST reset, no answer leaks, real account auth, CSRF, ownership, CAS replay race, server deadlines, fixed scoring, one ranked attempt, completion-only private leaderboard and streaks.');
}finally{db.raw.close()}
