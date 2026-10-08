import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {setupAdmin,setupPlayer} from '../functions/lib/player-setup-invites.js';
import {ensureOwner} from '../functions/lib/owner-auth.js';
const {db}=fixture(),origin='https://linkspickempools.com';let cookie='',emailBody;
const savedFetch=globalThis.fetch;globalThis.fetch=async(u,o)=>{assert.equal(String(u),'https://api.resend.com/emails');emailBody=JSON.parse(o.body);return Response.json({id:'test-email'})};
async function call(handler,body,{owner=true,query='',otherOrigin=false}={}){const r=await handler({request:new Request(origin+'/new-build/api/test'+query,{method:body?'POST':'GET',headers:{Origin:otherOrigin?'https://other.invalid':origin,Authorization:owner?'Bearer owner':'',Cookie:cookie,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})}),env:{DB:db,RESEND_API_KEY:'test-key'}});if(r.headers.has('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,...await r.json()}}
const create=(player='Alice',email='alice@example.invalid')=>call(setupAdmin,{action:'create',pool:1,player,email,sendEmail:true});
try{
 await ensureOwner(db);db.raw.exec("INSERT INTO links_admin_sessions VALUES('owner','2099-01-01');INSERT INTO pool_picks VALUES(1,'nfl','Alice',1,0,'BUF');INSERT INTO pool_settings VALUES(1,'commissioner_player_name','Owner');");
 assert.equal((await call(setupAdmin,null,{owner:false})).status,401);
 assert.equal((await call(setupAdmin,{action:'create'},{otherOrigin:true})).status,403);
 await call(setupAdmin,null,{query:'?pool=1'});
 db.raw.exec("INSERT INTO pool_player_contacts VALUES(1,'alice','pool-alice@example.invalid','');INSERT INTO pool_player_contacts VALUES(2,'Bob','other-pool@example.invalid','');INSERT INTO links_player_memberships VALUES(1,'Bob','member-bob@example.invalid');");
 const roster=(await call(setupAdmin,null,{query:'?pool=1'})).players;
 assert.equal(roster.find(p=>p.name==='Alice').savedEmail,'pool-alice@example.invalid');assert.equal(roster.find(p=>p.name==='Alice').emailSource,'Pool player contact');
 assert.equal(roster.find(p=>p.name==='Bob').savedEmail,'member-bob@example.invalid');assert.equal(roster.find(p=>p.name==='Owner').savedEmail,'');
 const first=await create();assert.equal(first.status,200);assert.match(emailBody.subject,/Create your new LINKS username and password/);assert.match(emailBody.text,/Do not use the old pool login again/);
 const replaced=await create();const token=new URL(replaced.url).hash.slice(1);assert.equal((await call(setupPlayer,{action:'inspect',token:new URL(first.url).hash.slice(1)})).status,410);
 assert.equal((await call(setupPlayer,{action:'inspect',token})).player,'Alice');
 const created=await call(setupPlayer,{action:'create',token,username:'alice-new',password:'test-password-long'});assert.equal(created.status,200);assert.ok(cookie);
 assert.equal(db.raw.prepare('SELECT count(*) n FROM pool_picks').get().n,1);assert.equal(db.raw.prepare("SELECT role FROM links_id_members WHERE player_name='Alice'").get().role,'player');
 assert.equal((await call(setupPlayer,{action:'create',token,username:'other',password:'test-password-long'})).status,410);
 assert.equal((await create()).status,409);assert.equal((await call(setupAdmin,null,{query:'?pool=1'})).players.find(x=>x.name==='Alice').connected,1);
 const ownerInvite=await create('Owner','owner@example.invalid');const ownToken=new URL(ownerInvite.url).hash.slice(1);cookie='';assert.equal((await call(setupPlayer,{action:'create',token:ownToken,username:'owner-new',password:'test-password-long'})).status,200);assert.equal(db.raw.prepare("SELECT role FROM links_id_members WHERE player_name='Owner'").get().role,'admin');
 const bobInvite=await create('Bob','bob@example.invalid');const bobToken=new URL(bobInvite.url).hash.slice(1);assert.equal((await call(setupPlayer,{action:'connect',token:bobToken})).status,403);
 await call(setupAdmin,{action:'revoke',pool:1,player:'Bob'});assert.equal((await call(setupPlayer,{action:'inspect',token:bobToken})).status,410);
 const fresh=await create('Bob','owner@example.invalid'),freshToken=new URL(fresh.url).hash.slice(1);assert.equal((await call(setupPlayer,{action:'connect',token:freshToken})).status,409); // account already has another player in this pool
 assert.equal(db.raw.prepare("SELECT count(*) n FROM links_id_members WHERE player_name='Bob'").get().n,0);
 const expired=await create('Bob','bob@example.invalid');db.raw.exec('UPDATE links_setup_invites SET expires_at=0 WHERE used_at IS NULL');assert.equal((await call(setupPlayer,{action:'inspect',token:new URL(expired.url).hash.slice(1)})).status,410);
 console.log('PASS owner-only setup links, email instructions, replacement/revocation/expiry, single use, account creation, commissioner preservation, saved picks, linked status and cross-account protection');
}finally{globalThis.fetch=savedFetch;db.raw.close()}
