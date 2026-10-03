import assert from 'node:assert/strict';
import {loadGameQuestions,normalizeQuestions} from '../functions/lib/trivia-provider.js';
import {STARTER} from '../functions/lib/trivia-night.js';
import {onRequest} from '../functions/new-build/api/trivia-night.js';
import {fixture} from './helpers/pool-format-fixture.mjs';
const sample=(difficulty='easy',category='science',id=difficulty)=>({id,category,difficulty,type:'text_choice',question:{text:'Sample '+id+' question?'},correctAnswer:'Correct',incorrectAnswers:['Wrong A','Wrong B','Wrong C']});
assert.equal(normalizeQuestions([sample(),sample(),{...sample(),id:'bad',incorrectAnswers:[]},{...sample(),id:'adult',adultContent:true}],'science','easy').length,1);
let calls=0;
const fetcher=async(url,options)=>{calls++;assert.equal(options.headers['X-API-Key'],'test-secret');assert.equal(options.redirect,'error');const u=new URL(url);assert.equal(u.origin,'https://the-trivia-api.com');assert.equal(u.searchParams.get('contentFilter'),'family');assert.equal(u.searchParams.get('types'),'text_choice');assert(!url.includes('test-secret'));const d=u.searchParams.get('difficulties'),c=u.searchParams.get('categories').split(',')[0];return Response.json([sample(d,c,c+'-'+d)])};
const args={env:{TRIVIA_API_KEY:'test-secret'},categories:['science'],backup:STARTER,fetcher};
let result=await loadGameQuestions(args);assert.equal(calls,3);assert.equal(result.questions.length,3);assert.equal(result.source,'The Trivia API');assert.equal(result.notice,'');
result=await loadGameQuestions({...args,exclude:['trivia-science-easy']});assert(!result.questions.some(q=>q.id==='trivia-science-easy'));assert(result.notice);
result=await loadGameQuestions({...args,fetcher:async()=>new Response('secret provider error',{status:401})});assert.equal(result.source,'LINKS question library');assert(result.questions.length);assert(!JSON.stringify(result).includes('secret'));
result=await loadGameQuestions({...args,fetcher:async()=>{throw Error('network timeout test-secret')}});assert(result.questions.length);
result=await loadGameQuestions({...args,env:{},fetcher:()=>{throw Error('Must not fetch')}});assert.equal(result.questions,STARTER);
await assert.rejects(loadGameQuestions({...args,categories:['bad']}),/Choose categories/);
const {db}=fixture(),original=globalThis.fetch;globalThis.fetch=fetcher;
async function api(body,token='admin',query=''){const r=await onRequest({request:new Request('https://local.invalid/new-build/api/trivia-night'+query,{method:body?'POST':'GET',headers:{Origin:'https://local.invalid',Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})}),env:{DB:db,TRIVIA_API_KEY:'test-secret'}});return {status:r.status,...await r.json()}}
try{
 calls=0;assert.equal((await api({action:'create',categories:['science'],difficulty:'mixed'},'')).status,403);assert.equal(calls,0);
 let s=await api({action:'create',categories:['science'],difficulty:'mixed'});assert.equal(s.status,200);assert.equal(s.questionSource,'The Trivia API');assert.equal(calls,3);const code=s.code;
 assert(!JSON.stringify(s).includes('test-secret'));assert.equal(s.question,null);assert.equal(s.deck,undefined);
 const before=calls;const display=await api(null,'','?action=display&code='+code);assert.equal(display.status,200);assert.equal(display.questionSource,undefined);await api(null,'admin','?code='+code);await api(null,'admin','?action=library');assert.equal(calls,before);
 assert.equal((await api({action:'create',categories:['science'],difficulty:'mixed'})).status,402);assert.equal(calls,before);
 s=await api({action:'next',code,gameNumber:s.game,index:s.index,phase:s.phase,category:'science',difficulty:'easy'});assert.equal(s.status,200);
 s=await api({action:'start-question',code,gameNumber:s.game,index:s.index,phase:s.phase});assert.equal(s.question,null);
 const row=JSON.parse(db.raw.prepare('SELECT state FROM links_trivia_night_rooms WHERE code=?').get(code).state);row.startsAt=Date.now()-20000;row.deadline=Date.now()-1;db.raw.prepare('UPDATE links_trivia_night_rooms SET state=? WHERE code=?').run(JSON.stringify(row),code);
 const hidden=await api(null,'','?action=display&code='+code);assert.equal(hidden.question.correct,undefined);
 s=await api({action:'reveal',code,gameNumber:s.game,index:s.index,phase:s.phase});assert(Number.isInteger(s.question.correct));
 s=await api({action:'end',code,gameNumber:s.game,index:s.index,phase:s.phase});assert.equal(s.phase,'ended');
 s=await api({action:'restart',code,gameNumber:s.game,index:s.index,phase:s.phase,categories:['science'],difficulty:'mixed'});assert.equal(s.game,2);assert.equal(calls,before+3);const restarted=JSON.parse(db.raw.prepare('SELECT state FROM links_trivia_night_rooms WHERE code=?').get(code).state);assert(!restarted.deck.some(q=>q.id===row.deck[0].id));
 console.log('PASS provider mapping, validation, fallback, secret privacy, authorization, quotas, no poll fetches, hidden answers and restart repeat filtering.');
}finally{globalThis.fetch=original;db.raw.close()}
