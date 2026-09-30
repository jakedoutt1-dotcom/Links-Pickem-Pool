import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
const {db,runtime}=fixture();runtime.btoa=btoa;runtime.session={pool_id:1,role:'admin',player_name:'Owner'};
const call=body=>runtime.handler({request:new Request('https://test/api/33/add-player',{method:'POST',body:JSON.stringify(body)}),env:{DB:db}});
try{
 db.raw.exec("INSERT INTO pool_33_state(pool_id,draw_locked) VALUES(1,1);INSERT INTO pool_33_assignments(pool_id,player_name,team,assigned_at,source) VALUES(1,'Alice','BUF','2026-01-01','random')");
 runtime.session.role='player';assert.equal((await call({name:'New',team:'MIA',password:'testpass'})).status,403);runtime.session.role='admin';
 assert.equal((await call({name:'New',team:'BUF',password:'testpass'})).status,409);
 assert.equal((await call({name:'Alice',team:'MIA',password:'testpass'})).status,409);
 let r=await call({name:'New',team:'MIA',password:'testpass'});assert.equal(r.status,200,await r.text());
 assert.equal(db.raw.prepare("SELECT paid FROM pool_33_entries WHERE player_name='New'").get().paid,0);
 assert.equal(db.raw.prepare("SELECT team FROM pool_33_assignments WHERE player_name='Alice'").get().team,'BUF');
 assert.equal((await call({name:'Bob',team:'DET'})).status,200);
 assert.equal((await call({name:'Duplicate',team:'MIA',password:'testpass'})).status,409);
 assert.equal(db.raw.prepare("SELECT name FROM pool_players WHERE name='Duplicate'").get(),undefined);
 console.log('PASS locked Game 33: commissioner-only additions, existing-player assignment, unused-team validation, Pending default, and original assignment preservation');
}finally{db.raw.close()}
