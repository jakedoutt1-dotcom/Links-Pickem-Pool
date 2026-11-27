import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {playoffFixture} from './helpers/cfp-bracket-fixture.mjs';
import {onRequest as eventRequest} from '../functions/new-build/api/hosted-cfp.js';
import {onRequest as cfpRequest} from '../functions/new-build/api/cfp.js';
import {ensureAccounts,digest} from '../functions/lib/commissioner-account.js';
import {ensureOwner} from '../functions/lib/owner-auth.js';
import {cfpSeason} from '../public/new-build/cfp-core.mjs';
test('LINKS hosted pool requires an account, stays separate, and only the site owner gets host management access',async()=>{
 const {db}=fixture(),original=fetch,season=cfpSeason(),f=playoffFixture(season);global.fetch=async()=>Response.json({events:f.events});
 await ensureAccounts(db);await ensureOwner(db);
 db.raw.prepare('INSERT INTO links_admin_sessions VALUES(?,?)').run('site-owner','2099-01-01');
 for(const name of ['alice','bob'])db.raw.prepare('INSERT INTO links_account_sessions VALUES(?,?,?)').run(await digest(name+'-account'),name+'@example.com','2099-01-01');
 const call=async(body=null,{token='',account='',pool=null,origin='https://test'}={})=>{
  const url=pool?'https://test/new-build/api/cfp?pool='+pool+'&season='+season:'https://test/new-build/api/hosted-cfp';
  const r=await (pool?cfpRequest:eventRequest)({env:{DB:db},request:new Request(url,{method:body?'POST':'GET',headers:{Origin:origin,Authorization:'Bearer '+token,'x-links-account':account},...(body?{body:JSON.stringify(pool?{pool,season,...body}:body)}:{})})});return {status:r.status,...await r.json()};
 };
 try{
  const initial=await call();assert.equal(initial.event.season,season,'One official shared event opens automatically');
  assert.equal((await call({action:'publish'},{token:'admin'})).status,403,'Private commissioners cannot claim the LINKS event');
  assert.equal((await call({action:'publish'},{token:'site-owner',origin:'https://evil.test'})).status,403);
  const event=await call({action:'publish'},{token:'site-owner'});assert.equal(event.status,200);const pool=event.event.id;
  assert.notEqual(pool,1);assert.notEqual(pool,2);assert.equal((await call({action:'publish'},{token:'site-owner'})).event.id,pool);
  assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM links_hosted_cfp_events').get().n,1);
  assert.equal((await call({action:'join'},{token:'alice'})).status,401,'Legacy pool credentials alone do not count as an account');
  let j=await call({action:'join'},{account:'alice-account'});assert.equal(j.joined,true);assert.equal(j.participants,1);
  assert.equal((await call({action:'join'},{account:'alice-account'})).participants,1,'Repeat clicks do not create duplicate entries');
  await call({action:'join'},{account:'bob-account'});
  let state=await call(null,{pool,account:'alice-account'});assert.equal(state.status,200);assert.equal(state.access.unlocked,true);assert.equal(state.admin,false);assert.equal(state.playerCount,2);assert.equal(state.entryCount,0);assert.equal(state.bracket.standings.rows.length,2,'Only joined accounts appear, not the host placeholder');
  const save={action:'bracketSave',picks:f.picks,guess:52,winningGuess:28,submit:true,version:0,revision:1};
  assert.equal((await call(save,{pool,account:'alice-account'})).status,200);
  assert.equal((await call(null,{pool,token:'admin'})).status,401,'An unrelated commissioner cannot manage this pool');
  const admin=await call(null,{pool,token:'site-owner'});assert.equal(admin.admin,true);assert.equal(admin.access.players.length,2);
  const player=state.player;assert(!player.includes('@'));
  assert.equal((await call({action:'playerAccess',player,unlocked:true},{pool,account:'bob-account'})).status,409);
  assert.equal((await call({action:'playerAccess',player,unlocked:false},{pool,token:'site-owner'})).status,409,'Hosted participants remain unlocked');
  assert.equal((await call(null,{pool,account:'bob-account'})).access.unlocked,true);
  assert.equal((await call({...save,player},{pool,account:'bob-account'})).status,200,'Every account saves its own entry, ignoring supplied player names');
  assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM links_cfp_brackets WHERE pool_id=?').get(pool).n,2);const counts=await cfpRequest({env:{DB:db},request:new Request('https://test/new-build/api/cfp?pool='+pool+'&season='+season+'&counts=1',{headers:{'x-links-account':'alice-account'}})});assert.deepEqual(await counts.json(),{playerCount:2,entryCount:2});
  db.raw.prepare('UPDATE links_cfp_access SET unlocked=0 WHERE pool_id=?').run(pool);assert.equal((await call(null,{pool,account:'alice-account'})).access.unlocked,true,'Hosted access remains automatic');
  assert.equal((await call(save,{pool,token:'site-owner'})).status,403,'Management sign-in cannot submit a host placeholder bracket');
  assert.equal((await call(null,{pool:1,account:'alice-account'})).status,401,'Hosted account access does not grant private pool membership');
  assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM pool_players WHERE pool_id=1').get().n,3,'Existing pools and picks stay intact');
 }finally{global.fetch=original;db.raw.close()}
});
