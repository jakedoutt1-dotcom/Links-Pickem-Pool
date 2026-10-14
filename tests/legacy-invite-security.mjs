import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequestGet,onRequestPost} from '../functions/new-build/api/invites.js';
const {db}=fixture(),{db:legacy}=fixture();
legacy.raw.exec("UPDATE pools SET code='TEMP' WHERE id=1;UPDATE pools SET code='POOL' WHERE id=2;UPDATE pools SET code='OTHER' WHERE id=1;CREATE TABLE invites(id TEXT,pool_id INTEGER,email TEXT,token TEXT,status TEXT,created_at TEXT,accepted_at TEXT)");
let mail=0;const original=globalThis.fetch;globalThis.fetch=async()=>{mail++;return Response.json({id:'delivered'})};
const env={DB:db,LINKS_DB:legacy,RESEND_API_KEY:'fixture'};
async function call(token='',body=null,query='pool=2',customEnv=env){return (body?onRequestPost:onRequestGet)({env:customEnv,request:new Request('https://test/new-build/api/invites?'+query,{method:body?'POST':'GET',headers:{Authorization:token?'Bearer '+token:''},...(body?{body:JSON.stringify(body)}:{})})})}
try{
 for(const token of ['', 'alice','outsider']){assert.equal((await call(token)).status,403);assert.equal((await call(token,{pool:'2',email:'guest@example.invalid'})).status,403)}
 assert.equal(mail,0);assert.equal(legacy.raw.prepare('SELECT COUNT(*) n FROM invites').get().n,0);
 assert.equal((await call('admin',{pool:'1',email:'guest@example.invalid'})).status,403,'same numeric ID is not same pool across databases');
 let r=await call('admin',{pool:'2',email:'guest@example.invalid'});assert.equal(r.status,201);let data=await r.json();assert.equal(data.emailDelivery.sent,true);assert.equal(mail,1);
 r=await call('',null,'token='+data.invite.token);assert.equal(r.status,200);assert.equal((await r.json()).invite.email,'g***@example.invalid');
 assert.equal((await call('admin')).status,200);
 r=await call('admin',{pool:'2',email:'guest@example.invalid',resend:true},'',{...env,RESEND_API_KEY:''});assert.equal(r.status,200);assert.equal((await r.json()).emailDelivery.sent,false);assert.equal(mail,1);assert.equal(legacy.raw.prepare('SELECT COUNT(*) n FROM invites').get().n,1);
 db.raw.exec("UPDATE pool_sessions SET expires_at='2000-01-01' WHERE token='admin'");assert.equal((await call('admin')).status,403);
 // Run only the college send handler: failed delivery must not be reported sent.
 const html=readFileSync(new URL('../public/new-build/commissioner.html',import.meta.url),'utf8');const start=html.indexOf('sendInv.onclick=async()=>'),end=html.indexOf('};',start)+2;
 const ctx={sendInv:{},emails:{value:'guest@example.invalid'},invMsg:{},pool:{id:2},localStorage:{getItem(){return 'admin'}},fetch:async()=>Response.json({emailDelivery:{sent:false}})};vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);await ctx.sendInv.onclick();assert.match(ctx.invMsg.textContent,/0 of 1 emails sent/);assert.equal(ctx.sendInv.disabled,false);
 console.log('PASS invitation authorization, cross-database pool isolation, public masked token lookup, delivery failure, resend reuse, expired sessions and college delivery UI');
}finally{globalThis.fetch=original;db.raw.close();legacy.raw.close()}
