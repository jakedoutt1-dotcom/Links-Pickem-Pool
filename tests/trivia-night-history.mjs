import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/trivia-night.js';
import {loadFreshGameQuestions,normalizedQuestionText} from '../functions/lib/trivia-provider.js';
import {STARTER} from '../functions/lib/trivia-night.js';
const {db}=fixture();let code,state;
async function call(body){const r=await onRequest({env:{DB:db},request:new Request('https://test.local/new-build/api/trivia-night?code='+code,{method:body?'POST':'GET',headers:{Origin:'https://test.local',Authorization:'Bearer admin'},...(body?{body:JSON.stringify({code,gameNumber:state?.game,index:state?.index,phase:state?.phase,...body})}:{})})});const j=await r.json();assert.equal(r.status,200,JSON.stringify(j));state=j;return j}
const raw=()=>JSON.parse(db.raw.prepare('SELECT state FROM links_trivia_night_rooms WHERE code=?').get(code).state);
const played=[];for(let n=0;n<4;n++){await call({action:'create',categories:['football'],difficulty:'easy'});code=state.code;assert.equal(state.hostHistoryKey,undefined);assert.equal(state.seenQuestions,undefined);const s=raw();assert(s.deck.every(q=>!played.includes(q.id)));await call({action:'next',category:'football',difficulty:'easy'});await call({action:'start-question'});played.push(raw().deck[raw().index].id);db.raw.prepare('UPDATE links_trivia_night_rooms SET expires=0 WHERE code=?').run(code)}assert.equal(new Set(played).size,4);assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM links_trivia_night_history').get().n,4);
const q=STARTER.find(q=>q.category==='football'&&q.difficulty==='easy');const loaded=await loadFreshGameQuestions({env:{},categories:['football'],backup:STARTER,exclude:[],excludeTexts:[normalizedQuestionText(q)]});assert(!loaded.questions.some(x=>normalizedQuestionText(x)===normalizedQuestionText(q)));
const exhausted=await loadFreshGameQuestions({env:{},categories:['football'],backup:STARTER,exclude:STARTER.map(q=>q.id),excludeTexts:STARTER.map(normalizedQuestionText)});assert(exhausted.questions.length);assert(exhausted.notice.includes('Older questions'));
console.log('PASS commissioner history across four new rooms, private IDs, wording deduplication and explicit exhaustion notice.');
