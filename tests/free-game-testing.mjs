import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {ensureAccounts,allowance,reserveSlots} from '../functions/lib/commissioner-account.js';
import {requirePartyPass} from '../functions/lib/party-access.js';
import {slotWriteGuard} from '../functions/lib/slot-write-guard.js';
import {onRequest as party} from '../functions/new-build/api/party-pack.js';
const {db}=fixture();
try{
 await ensureAccounts(db);
 assert.equal(await requirePartyPass(new Request('https://test'),{DB:db}),null);
 const plan=await allowance(db,'tester@example.com');assert.equal(plan.testing,true);
 const slots=await reserveSlots(db,'tester@example.com',['nfl','masters','nascar']);assert.equal(slots.length,3);
 const request=new Request('https://test/new-build/api/nfl-picks',{method:'POST',headers:{Authorization:'Bearer alice'},body:JSON.stringify({pool:1})});
 // Existing pools without a package remain playable; archived games stay protected.
 assert.equal(await slotWriteGuard(request,{DB:db}),null);
 db.raw.exec("INSERT INTO links_pool_slots(id,email,pool_id,game_type,active) VALUES('archived','tester@example.com',1,'nfl',0)");
 assert.equal((await slotWriteGuard(request,{DB:db})).status,403);
 db.raw.exec("DELETE FROM links_pool_slots; INSERT INTO links_pool_slots(id,email,pool_id,game_type,active) VALUES('nfl','tester@example.com',1,'nfl',1)");
 assert.equal(await slotWriteGuard(request,{DB:db}),null);
 const response=await party({env:{DB:db},request:new Request('https://test/new-build/api/party-pack')});const state=await response.json();assert.equal(state.freeTesting,true);assert.equal(state.checkoutReady,false);assert.equal(state.venueAccess,null);
 console.log('PASS free party creation, unpaid pool allowance, reservations, archived-game protection and disabled party checkout; hosted access remains absent.');
}finally{db.raw.close()}
