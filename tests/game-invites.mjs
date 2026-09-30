import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/game-invites.js';
const {db}=fixture(),original=fetch;let deliveries=[];global.fetch=async(url,opts)=>{assert.equal(String(url),'https://api.resend.com/emails');deliveries.push(JSON.parse(opts.body));return Response.json({id:'mock-email'})};
const call=(token,body)=>onRequest({request:new Request('https://test/new-build/api/game-invites?pool=1',{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token},...(body?{body:JSON.stringify({pool:1,...body})}:{})}),env:{DB:db,RESEND_API_KEY:'test-key',RESEND_FROM_EMAIL:'invites@example.com'}});
try{
 assert.equal((await call('alice')).status,403);assert.equal((await call('outsider',{emails:['test@example.com']})).status,403);assert.equal(deliveries.length,0);
 assert.equal((await call('admin',{emails:['invalid']})).status,400);
 let r=await call('admin',{emails:['test@example.com']});const result=await r.json();assert.equal(r.status,200,JSON.stringify(result));assert.equal(result.sent,1);assert.equal(deliveries.length,1);assert.match(deliveries[0].html,/invite=/);
 const list=await (await call('admin')).json();assert.equal(list.invites[0].email,'test@example.com');
 r=await call('admin',{emails:['test@example.com'],resend:true});assert.equal(r.status,200);assert.equal(deliveries.length,2);assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM pool_invites').get().n,1);
 console.log('PASS game invitations: commissioner-only access, pool isolation, email send via mocked provider, pending list and resend');
}finally{global.fetch=original;db.raw.close()}
