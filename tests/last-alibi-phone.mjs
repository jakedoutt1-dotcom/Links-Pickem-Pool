import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {begin,view} from '../functions/lib/last-alibi.js';
import {mysteryPhoneRequest,voiceSignature} from '../functions/new-build/api/mystery-phone.js';
const {db}=fixture(),now=Date.now(),origin='https://voice.test',secret='test-private-phone-secret',phone='+16155550138',seat='private-seat';
const env={DB:db,LAST_ALIBI_CLUE_PHONE:phone,TWILIO_AUTH_TOKEN:secret,TWILIO_ACCOUNT_SID:'AC_TEST'};
db.raw.exec('CREATE TABLE links_mystery_rooms(code TEXT PRIMARY KEY,state TEXT,version INTEGER DEFAULT 0,expires INTEGER);CREATE TABLE links_mystery_phone_access(code TEXT PRIMARY KEY,room TEXT,seat TEXT,expires INTEGER)');
const state={code:'ABCDEF1234',caseId:'midnight-desk',owner:seat,players:{[seat]:{id:'investigator',name:'Investigator'}},mode:'solo',difficulty:'standard',flowVersion:2,guided:true,minutes:8,game:1};begin(state,now);state.phase='investigate';state.chapter=3;state.published=state.case.evidence.filter(e=>!e.cost&&!e.unlock&&e.chapter<=3).map(e=>e.id);
db.raw.prepare('INSERT INTO links_mystery_rooms VALUES(?,?,0,?)').run(state.code,JSON.stringify(state),now+3600000);db.raw.prepare('INSERT INTO links_mystery_phone_access VALUES(?,?,?,?)').run('12345678',state.code,seat,now+3600000);
async function call(query='',digits='',signature=true,extraEnv={}){const url=origin+'/new-build/api/mystery-phone'+query,params=new URLSearchParams({To:phone,AccountSid:'AC_TEST',CallSid:'CA_TEST',From:'+16155550199',...(digits?{Digits:digits}:{})}),headers={'Content-Type':'application/x-www-form-urlencoded','X-Twilio-Signature':signature?await voiceSignature(url,params,secret):'FORGED'};const r=await mysteryPhoneRequest({env:{...env,...extraEnv},request:new Request(url,{method:'POST',headers,body:params.toString()})},{now:()=>now});return {status:r.status,body:await r.text()}}
const get=()=>JSON.parse(db.raw.prepare('SELECT state FROM links_mystery_rooms').get().state);
try{
 assert.equal((await call('', '',false)).status,403);assert.match((await call()).body,/numDigits="8"/);assert.match((await call('?step=code','12345678')).body,/numDigits="4"/);assert(!JSON.stringify(get().players[seat]).includes('lastCall'));
 assert.match((await call('?step=code','00000000')).body,/expired/);assert.match((await call('?step=clue&access=12345678','9999')).body,/No archive/);assert.equal(get().players[seat].lastCall,undefined);
 const result=await call('?step=clue&access=12345678','7314');assert.equal(result.status,200);assert.match(result.body,/Preserved recording/);assert(get().players[seat].searched[3].includes('parcel-audit'));assert.equal(get().players[seat].lastCall.number,'7314');assert(!get().published.includes('parcel-audit'));assert.equal(view(get(),'',now,true).lastCall,null);assert(!JSON.stringify(get()).includes('+16155550199'));
 await call('?step=clue&access=12345678','7314');assert.equal(get().players[seat].searched[3].filter(x=>x==='parcel-audit').length,1);
 const recorded=await call('?step=clue&access=12345678','7314',true,{LAST_ALIBI_CLUE_RECORDINGS:JSON.stringify({'midnight-desk:7314':'/new-build/audio/case-recording.mp3'})});assert.match(recorded.body,/<Play>https:\/\/voice.test\/new-build\/audio\/case-recording.mp3<\/Play>/);
 const closed=get();closed.pausedAt=now;db.raw.prepare('UPDATE links_mystery_rooms SET state=?').run(JSON.stringify(closed));assert.match((await call('?step=clue&access=12345678','7314')).body,/current scene/);
 assert.match((await call('', '',true,{TWILIO_AUTH_TOKEN:''})).body,/not connected/);
 console.log('PASS mystery real-phone webhook: Twilio HMAC/To/account validation, case-code and hidden-extension flow, private proof unlock, safe recorded-audio playback, no caller-number storage, paused case and replay guards. No real calls placed.');
}finally{db.raw.close()}
