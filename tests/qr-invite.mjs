import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/qr-invite.js';
const {db}=fixture();
const call=async(body,token='admin',qr='')=>{const r=await onRequest({env:{DB:db},request:new Request('https://test/new-build/api/qr-invite'+(qr?'?qr='+qr:''),{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})});return {status:r.status,data:await r.json()}};
try{
 assert.equal((await call({pool:1,action:'show'},'alice')).status,403);
 assert.equal((await call({pool:2,action:'show'},'admin')).status,403);
 const first=await call({pool:1,action:'show'});assert.equal(first.status,200,JSON.stringify(first));
 assert.equal((await call({pool:1,action:'show'})).data.url,first.data.url);
 const qr=new URL(first.data.url).searchParams.get('qr');assert.equal((await call(null,'',qr)).data.poolCode,'POOL');
 for(const name of ['QR One','QR Two']){const joined=await call({action:'join',qr,name,password:'test-password'},'');assert.equal(joined.status,200,JSON.stringify(joined));assert.equal(joined.data.name,name);assert.equal(joined.data.poolCode,'POOL');assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM pool_payments WHERE player_name=? AND paid=1').get(name).n,37)}
 assert.equal((await call({action:'join',qr,name:'QR One',password:'test-password'},'')).status,409);
 assert.equal((await call({pool:1,action:'disable'})).status,200);
 assert.equal((await call(null,'',qr)).status,404);
 assert.equal(db.raw.prepare("SELECT COUNT(*) n FROM pool_players WHERE name LIKE 'QR %'").get().n,2);
 const next=await call({pool:1,action:'show'});assert.notEqual(next.data.url,first.data.url);
 db.raw.exec("UPDATE pool_qr_invites SET expires_at='2000-01-01'");assert.equal((await call(null,'',new URL(next.data.url).searchParams.get('qr'))).status,404);
 console.log('PASS commissioner-only QR creation, pool isolation, reuse, two player joins, Active access, duplicate names, disable and expiry');
}finally{db.raw.close()}
