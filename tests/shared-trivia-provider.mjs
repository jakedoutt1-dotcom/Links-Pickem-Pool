import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/dead-air.js';
import {loadGameQuestions,completeQuestionBank} from '../functions/lib/trivia-provider.js';
import {publicAttempt,grade} from '../functions/lib/football-trivia.js';
const originalFetch=globalThis.fetch;let calls=0,generation=0;
const sample=(category,difficulty,id,tags=[])=>({id,category,difficulty,tags,type:'text_choice',question:{text:'Provider question '+id+'?'},correctAnswer:'Right',incorrectAnswers:['Wrong A','Wrong B','Wrong C']});
try{
 globalThis.fetch=async(url,options)=>{if(new URL(url).pathname==='/v2/session')return Response.json({id:'mock-session'});calls++;assert.equal(options.headers['X-API-Key'],'mock-only');const u=new URL(url);return Response.json(Array.from({length:Number(u.searchParams.get('limit'))},(_,i)=>sample(u.searchParams.get('categories').split(',')[0],u.searchParams.get('difficulties'),generation+'-'+calls+'-'+i)))};
 const {db}=fixture();let code;
 async function call(body={},token=''){const r=await onRequest({env:{DB:db,TRIVIA_API_KEY:'mock-only'},request:new Request('https://test.local/api?code='+code,{method:body.action?'POST':'GET',headers:{Origin:'https://test.local','x-dead-air-token':token},...(body.action?{body:JSON.stringify({...body,code})}:{})})});return {status:r.status,...await r.json()}}
 const host=await call({action:'create',name:'Host'});code=host.code;const player=await call({action:'join',name:'Player'});assert.equal(calls,0);
 assert.equal((await call({action:'start'},player.token)).status,403);assert.equal(calls,0);
 await call({action:'ready'},host.token);await call({action:'ready'},player.token);
 const started=await call({action:'start'},host.token);assert.equal(started.phase,'intro');assert.equal(calls,18);assert.equal(started.questionBank,undefined);
 let raw=JSON.parse((await db.prepare('SELECT state FROM links_dead_air_rooms WHERE code=?').bind(code).first()).state);assert(raw.deck.every(id=>id.startsWith('trivia-')));const oldDeck=[...raw.deck];
 await call({},player.token);assert.equal(calls,18);
 raw.deadline=Date.now()-1;await db.prepare('UPDATE links_dead_air_rooms SET state=? WHERE code=?').bind(JSON.stringify(raw),code).run();const quiz=await call({},player.token);assert(quiz.question.text.startsWith('Provider'));assert.equal(quiz.question.correct,undefined);assert.equal(quiz.questionBank,undefined);assert.equal(calls,18);
 raw=JSON.parse((await db.prepare('SELECT state FROM links_dead_air_rooms WHERE code=?').bind(code).first()).state);raw.phase='ended';raw.deadline=0;await db.prepare('UPDATE links_dead_air_rooms SET state=? WHERE code=?').bind(JSON.stringify(raw),code).run();
 await call({action:'again'},host.token);await call({action:'ready'},host.token);await call({action:'ready'},player.token);generation++;await call({action:'start'},host.token);assert.equal(calls,36);raw=JSON.parse((await db.prepare('SELECT state FROM links_dead_air_rooms WHERE code=?').bind(code).first()).state);assert(raw.deck.every(id=>!oldDeck.includes(id)));
 const backup=[{id:'backup',category:'football',difficulty:'easy',text:'Backup?',answers:['A','B','C','D'],correct:0}];
 const football=await loadGameQuestions({env:{TRIVIA_API_KEY:'mock-only'},categories:['football'],difficulties:['easy'],tags:['american_football'],backup,fetcher:async(url)=>{assert.equal(new URL(url).searchParams.get('tags'),'american_football');return Response.json([sample('sport_and_leisure','easy','nfl',['american_football']),sample('sport_and_leisure','easy','soccer',['football'])])}});
 assert.equal(football.questions.length,1);assert.equal(football.questions[0].id,'trivia-nfl');
 const q=football.questions[0],a={id:'a',idx:0,difficulty:'easy',deadline:10000,status:'active',score:0,correct:0,misses:0,deck:JSON.stringify([{id:q.id,question:q,order:[1,0,2,3]}])};assert.equal(publicAttempt(a).question.text,q.text);assert.equal(publicAttempt(a).question.correct,undefined);assert.equal(grade(a,1,5000).feedback.correct,true);
 const failed=await loadGameQuestions({env:{TRIVIA_API_KEY:'mock-only'},categories:['football'],difficulties:['easy'],backup,fetcher:async()=>{throw Error('offline')}});assert.equal(failed.questions[0].id,'backup');assert(failed.notice);
 assert.equal(completeQuestionBank([q],backup,{minimum:2}).length,2);assert.equal(completeQuestionBank([q],backup,{minimum:1}).length,1);
 console.log('PASS Dead Air API snapshots, authorization, rematch, no polling calls; football-only filtering, snapshot grading/privacy, fallback and partial banks.');
}finally{globalThis.fetch=originalFetch}
