import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/pool-chat.js';
const {db}=fixture();
const call=async(token,body)=>{const r=await onRequest({env:{DB:db},request:new Request('https://test/new-build/api/pool-chat'+(body?'':'?action=unread-all'),{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,Origin:'https://test'},...(body?{body:JSON.stringify(body)}:{})})});return {status:r.status,...await r.json()}};
try{
 await call('alice',{action:'send',text:'Hello',nonce:crypto.randomUUID()});
 const bob=await call('bob');assert.equal(bob.status,200,JSON.stringify(bob));assert.deepEqual(bob.pools.map(p=>[String(p.pool),p.unread]),[['1',1]]);
 assert.equal((await call('alice')).pools[0].unread,0);
 assert.equal((await call('bad')).status,401);
 const id=db.raw.prepare('SELECT MAX(id) id FROM links_chat_messages').get().id;await call('bob',{action:'read',id});assert.equal((await call('bob')).pools[0].unread,0);
 console.log('PASS locker badges: authorized pools only, own messages excluded, read clears count, invalid session denied');
}finally{db.raw.close()}
