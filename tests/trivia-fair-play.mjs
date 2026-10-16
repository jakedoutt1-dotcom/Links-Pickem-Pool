import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {grantTestHost} from './helpers/trivia-host-access.mjs';
import {onRequest} from '../functions/new-build/api/trivia-night.js';
import {watchFairPlay} from '../public/new-build/trivia-fair-play.mjs';
const {db}=fixture();await grantTestHost(db);let code;
async function call(body,token='',host=false){const r=await onRequest({env:{DB:db},request:new Request('https://test/new-build/api/trivia-night?code='+code,{method:body?'POST':'GET',headers:{Origin:'https://test',Authorization:host?'Bearer admin':'','x-trivia-token':token},...(body?{body:JSON.stringify({code,...body})}:{})})});return {status:r.status,...await r.json()}}
const raw=()=>JSON.parse(db.raw.prepare('SELECT state FROM links_trivia_night_rooms WHERE code=?').get(code).state);
const edit=fn=>{const s=raw();fn(s);db.raw.prepare('UPDATE links_trivia_night_rooms SET state=? WHERE code=?').run(JSON.stringify(s),code)};
const host=async(action,extra={})=>{const s=raw();return call({action,gameNumber:s.game,index:s.index,phase:s.phase,...extra},'',true)};
try{
 for(const mode of ['warn','strict','off']){
  if(code)db.raw.exec('UPDATE links_trivia_night_rooms SET expires=0');
  const created=await call({action:'create',mode:'individual',fairPlay:mode,categories:['science'],difficulty:'mixed'},'',true);assert.equal(created.status,200);code=created.code;
  const player=await call({action:'join',name:'Single player',fairPlayAccepted:true});assert.equal(player.status,200);assert.equal(player.team,undefined);
  await host('next',{difficulty:'easy'});await host('start-question');const request={action:'fair-play-leave',gameNumber:1,index:0};
  await call(request,player.token);assert.equal((await call(null,'',true)).fairEvents.length,0,'Countdown and breaks do not flag');
  edit(s=>{s.startsAt=Date.now()-1000;s.deadline=Date.now()+9000});
  const answer={action:'answer',gameNumber:1,index:0,choice:raw().deck[0].correct};await call(answer,player.token);
  assert.equal((await call({...request,index:99},player.token)).fairLocked,false);
  const left=await call(request,player.token);assert.equal(left.fairLocked,mode==='strict');assert.equal((await call(answer,player.token)).status,mode==='strict'?409:200);
  const hv=await call(null,'',true);assert.equal(hv.fairEvents.length,mode==='off'?0:1);
  await call(request,player.token);assert.equal((await call(null,'',true)).fairEvents.length,hv.fairEvents.length,'Repeated hide/pagehide reports are idempotent');
  if(mode==='strict'){
   // Strict mode preserves a correct draft for base points only.
   edit(s=>s.deadline=Date.now()-1);const result=await host('reveal');assert.equal(result.leaders[0].score,500);
   await host('fair-play-excuse',{eventId:hv.fairEvents[0].id});assert.equal((await call(answer,player.token)).status,409,'Exception never reopens a past question');
  }else{
   assert.equal((await call({...answer,action:'submit-answer'},player.token)).status,200);await call(request,player.token);assert.equal((await call(null,'',true)).fairEvents.length,hv.fairEvents.length,'Submitted players are free to leave');
  }
 }
 console.log('PASS individual Fair Play on/off/strict, notices, unchanged draft/base/speed rules, countdown exclusion, idempotency and past-question protection');
}finally{db.raw.close()}

const doc=new EventTarget(),win=new EventTarget(),values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
let state={code:'ABCDEF1234',fairIdentity:'member',fairPlay:'warn',phase:'question',game:1,index:0,eligible:true,submitted:false,startsAt:10,deadline:100},online=false,sends=0;
const options={getState:()=>state,send:async()=>{sends++;if(!online)throw Error('Offline')},storage,doc,win,now:()=>50};
let watcher=watchFairPlay(options);doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));await new Promise(r=>setImmediate(r));assert(watcher.pending(state));watcher.dispose();
watcher=watchFairPlay(options);online=true;doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));await new Promise(r=>setImmediate(r));assert.equal(watcher.pending(state),false);assert.equal(sends,2,'A failed notice survives reload and retries on return');
doc.dispatchEvent(new Event('blur'));assert.equal(sends,2,'Focus changes alone do not flag');
state={...state,index:1,submitted:true};win.dispatchEvent(new Event('pagehide'));assert.equal(sends,2);watcher.dispose();
console.log('PASS visibility monitor persists pending notice, retries on return and ignores blur/completed answers');

for(const failure of ['read','write']){
 const blocked={getItem:()=>{if(failure==='read')throw Error('Storage blocked');return null},setItem:()=>{throw Error('Storage full')}};
 state={...state,index:2,submitted:false};online=false;
 watcher=watchFairPlay({...options,storage:blocked});
 win.dispatchEvent(new Event('pagehide'));await new Promise(r=>setImmediate(r));assert(watcher.pending(state));
 online=true;await watcher.flush();assert.equal(watcher.pending(state),false);watcher.dispose();
}
console.log('PASS Fair Play notices still send when browser storage is unavailable');
