import assert from 'node:assert/strict';
import {poolEmail,sendPoolEmail} from '../functions/lib/pool-email.js';
const input={poolName:'Friends <Club>',poolCode:'A B',base:'https://links.example',name:'Sam'};
for(const game of ['nba','mlb','college','golf','nascar','custom','squares','survivor','confidence','fantasy','dynasty']){
 for(const invite of [false,true]){
 const message=poolEmail({...input,games:[game],...(invite?{inviteUrl:'https://links.example/new-build/join.html?invite=private'}:{})});
 assert.doesNotMatch(message.text,/kickoff|Playmaker|NFL picks/);
 assert.match(message.text,/deadline shown there/);assert.match(message.text,/does not give you commissioner controls/);
 assert.match(message.html,/Friends &lt;Club&gt;/);assert.match(message.html,invite?/invite=private/:/pool-login.html\?code=A%20B/);
 }
}
const nfl=poolEmail({...input,games:['nfl']});assert.match(nfl.text,/first kickoff/);
const mixed=poolEmail({...input,games:['nba','nfl']});assert.match(mixed.text,/first kickoff/);
assert.match(poolEmail({...input,games:['nba'],commissioner:true}).text,/Your commissioner workspace/);
const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({message:'Rejected'},{status:422})};
try{assert.equal((await sendPoolEmail({},'test@example.invalid',nfl,'fixture')).sent,false);assert.equal(calls,0);assert.equal((await sendPoolEmail({RESEND_API_KEY:'fixture'},'test@example.invalid',nfl,'fixture')).sent,false);assert.equal(calls,1)}finally{globalThis.fetch=original}
console.log('PASS non-NFL invitation/welcome rules and player roles, escaped names, destination links, NFL content retained and mail failure reporting');
