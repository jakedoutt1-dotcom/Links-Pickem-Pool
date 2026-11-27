import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {ownerCoadmin} from '../functions/lib/owner-coadmin.js';
import {ensureOwner} from '../functions/lib/owner-auth.js';
import {ensureIdentity,identityRequest} from '../functions/lib/player-identity.js';
import {digest} from '../functions/lib/commissioner-account.js';
const {db}=fixture();await ensureOwner(db);await ensureIdentity(db);
db.raw.exec("INSERT INTO links_admin_sessions VALUES('site-owner','2099-01-01');INSERT INTO pool_settings VALUES(1,'commissioner_player_name','Owner');INSERT INTO pool_players VALUES(2,'Alice','other-password','other-salt');INSERT INTO pool_picks VALUES(1,'nfl','Alice',8,0,'BUF');");
for(const [id,username,player,role] of [['cowboy-id','cowboy','Alice','player'],['owner-id','original','Owner','admin']]){
 db.raw.prepare('INSERT INTO links_id_accounts VALUES(?,?,?,?,?,?,?)').run(id,username,username+'@example.invalid',username,'salt','hash','2026-01-01');
 db.raw.prepare('INSERT INTO links_id_members VALUES(?,?,?,?,?)').run(id,1,player,id,role);
}
db.raw.prepare('INSERT INTO links_id_members VALUES(?,?,?,?,?)').run('other-pool',2,'Alice','cowboy-id','player');
db.raw.prepare('INSERT INTO links_id_sessions VALUES(?,?,?)').run(await digest('identity-cookie'),'cowboy-id',Date.now()+3600000);
const call=(body,token='site-owner')=>ownerCoadmin(new Request('https://test/new-build/api/links-admin',{method:'POST',headers:{Authorization:'Bearer '+token,Origin:'https://test'}}),db,body);
const identity=async body=>{const r=await identityRequest({env:{DB:db},request:new Request('https://links-pickem-test.pages.dev/new-build/api/player-account',{method:body?'POST':'GET',headers:{Cookie:'__Host-links_identity=identity-cookie',Origin:'https://links-pickem-test.pages.dev'},...(body?{body:JSON.stringify(body)}:{})})});return r.json()};
try{
 const body={action:'coadmin-add',pool:1,accountId:'cowboy-id',confirm:true};
 assert.equal((await call(body,'alice')).status,401);assert.equal((await call({...body,confirm:false})).status,400);assert.equal((await call({...body,accountId:'missing'})).status,400);
 const beforeOwner=db.raw.prepare("SELECT * FROM pool_sessions WHERE token='admin'").get(),beforePlayers=db.raw.prepare('SELECT * FROM pool_players').all(),beforePicks=db.raw.prepare('SELECT * FROM pool_picks').all();
 assert.equal((await identity()).pools.find(p=>p.id==='1').role,'player');
 assert.equal((await call(body)).status,200);assert.equal((await call(body)).status,200,'Repeated grant is idempotent');
 assert.deepEqual(db.raw.prepare("SELECT * FROM pool_sessions WHERE token='admin'").get(),beforeOwner,'Original commissioner session stays intact');
 assert.equal(db.raw.prepare("SELECT value FROM pool_settings WHERE pool_id=1 AND key='commissioner_player_name'").get().value,'Owner');
 assert.deepEqual(db.raw.prepare('SELECT * FROM pool_players').all(),beforePlayers,'Names and credentials unchanged');assert.deepEqual(db.raw.prepare('SELECT * FROM pool_picks').all(),beforePicks);
 assert.equal(db.raw.prepare("SELECT role FROM links_id_members WHERE id='owner-id'").get().role,'admin');assert.equal(db.raw.prepare("SELECT role FROM links_id_members WHERE id='other-pool'").get().role,'player');
 const me=await identity();assert.equal(me.pools.find(p=>p.id==='1').role,'admin');assert.equal(me.pools.find(p=>p.id==='2').role,'player');
 const opened=await identity({action:'open',pool:1});assert.equal(opened.pool.role,'commissioner');assert.equal(db.raw.prepare('SELECT role FROM pool_sessions WHERE token=?').get(opened.token).role,'admin');
 assert.equal((await call({...body,accountId:'owner-id'})).status,409,'No replacement of primary commissioner');
 console.log('PASS co-admin: owner-only grant, exact verified account, repeated grant, next-login admin role, cross-pool isolation, original admin/session/password/ownership/picks preserved');
}finally{db.raw.close();}
