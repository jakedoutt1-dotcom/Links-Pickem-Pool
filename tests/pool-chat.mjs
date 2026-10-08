import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/pool-chat.js';
const {db}=fixture();
async function call(body,token='alice',pool=1,origin='https://test'){const r=await onRequest({env:{DB:db},request:new Request('https://test/new-build/api/pool-chat?pool='+pool,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,Origin:origin},...(body?{body:JSON.stringify(body)}:{})})});return {status:r.status,...await r.json()}}
try{
 assert.equal((await call(null,'bad')).status,401);assert.equal((await call(null,'outsider')).status,403);
 assert.equal((await call({action:'send',text:'bad',nonce:crypto.randomUUID()},'alice',1,'https://evil')).status,403);
 const nonce=crypto.randomUUID(),body={action:'send',text:'<img src=x onerror=alert(1)> My team wins! 🏈',nonce};
 assert.equal((await call(body)).status,200);assert.equal((await call(body)).status,200);assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM links_chat_messages').get().n,1);
 const bob=await call(null,'bob'),id=bob.messages[0].id;assert.equal(bob.unread,1);assert.equal((await call(null)).unread,0);
 assert.equal((await call({action:'delete',id},'bob')).status,403);assert.equal((await call({action:'mute',name:'Alice'},'bob')).status,403);
 assert.equal((await call({action:'send',text:'spam',nonce:crypto.randomUUID()})).status,429);
 await call({action:'react',id,emoji:'🔥'},'bob');await call({action:'react',id,emoji:'🔥'},'bob');assert.equal((await call(null)).reactions[0].count,1);
 await call({action:'report',id},'bob');assert.equal((await call(null,'admin')).reports.length,1);assert.equal((await call(null,'bob')).reports.length,0);
 await call({action:'hide',id},'bob');assert.equal((await call(null,'bob')).messages.length,0);assert.equal((await call(null,'bob')).unread,0);assert.equal((await call(null)).messages.length,1);
 await call({action:'mute',name:'Alice'},'admin');db.raw.exec('UPDATE links_chat_messages SET created=0');assert.equal((await call({action:'send',text:'muted',nonce:crypto.randomUUID()})).status,429);
 await call({action:'mute',name:'Alice',muted:false},'admin');assert.equal((await call({action:'send',text:'back',nonce:crypto.randomUUID()})).status,200);
 await call({action:'delete',id},'admin');assert.equal((await call(null)).messages[0].body,'');assert.equal((await call(null,'admin')).reports.length,0);
 const current=await call(null,'bob');await call({action:'read',id:current.messages.at(-1).id},'bob');assert.equal((await call(null,'bob')).unread,0);
 db.raw.exec("INSERT INTO pool_players(pool_id,name,password_hash,salt) VALUES(2,'Other','hash','salt')");const outside=await call(null,'outsider',2);assert.equal(outside.messages.length,0);assert.equal((await call({action:'delete',id},'outsider',2)).status,404);
 db.raw.exec("DELETE FROM pool_players WHERE name='Alice'");assert.equal((await call(null)).status,403);
 console.log('PASS pool isolation, member removal, CSRF, unread/read state, idempotent sends, spam limit, reports, reactions, private hiding, commissioner deletion and mute/unmute');
}finally{db.raw.close()}
