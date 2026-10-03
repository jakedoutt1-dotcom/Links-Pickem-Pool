import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest as commissioner} from '../functions/new-build/api/nfl-admin-week.js';
import {onRequest as owner} from '../functions/new-build/api/correction-review.js';
import {ensureOwner,ownerHash} from '../functions/lib/owner-auth.js';
const {db}=fixture(),original=fetch;
try{
 await ensureOwner(db);db.raw.prepare('INSERT INTO links_owner_password VALUES(1,?,?)').run('salt',await ownerHash('owner-password','salt'));db.raw.exec("INSERT INTO links_admin_sessions VALUES('owner','2099-01-01');INSERT INTO pool_picks VALUES(1,'nfl','Alice',4,0,'BUF')");
 global.fetch=async()=>Response.json({events:[{id:'g1',date:'2020-01-01',status:{type:{completed:true}},competitions:[{competitors:[{homeAway:'home',team:{abbreviation:'BUF'}},{homeAway:'away',team:{abbreviation:'MIA'}}]}]}]});
 const post=token=>new Request('https://test/new-build/api/nfl-admin-week',{method:'POST',headers:{Authorization:'Bearer '+token},body:JSON.stringify({week:4,action:'pick',player:'Alice',eventId:'g1',team:'MIA',reason:'Player requested a correction'})});
 assert.equal((await commissioner({request:post('alice'),env:{DB:db}})).status,403);
 const response=await commissioner({request:post('admin'),env:{DB:db}}),receipt=await response.json();assert.equal(response.status,200);assert.ok(receipt.ok&&receipt.pending&&receipt.id);
 assert.equal(db.raw.prepare("SELECT team FROM pool_picks WHERE player_name='Alice'").get().team,'BUF');
 const history=async token=>(await commissioner({request:new Request('https://test/new-build/api/nfl-admin-week?action=corrections&week=4',{headers:{Authorization:'Bearer '+token}}),env:{DB:db}})).json();
 assert.equal((await history('admin')).requests[0].id,receipt.id);assert.equal((await history('outsider')).requests.length,0);
 const queue=await owner({request:new Request('https://test/new-build/api/correction-review',{headers:{Authorization:'Bearer owner'}}),env:{DB:db}});assert.equal((await queue.json()).requests[0].id,receipt.id);
 const approval=await owner({request:new Request('https://test/new-build/api/correction-review',{method:'POST',headers:{Authorization:'Bearer owner'},body:JSON.stringify({id:receipt.id,decision:'approve',password:'owner-password'})}),env:{DB:db}});assert.equal(approval.status,200);assert.equal(db.raw.prepare("SELECT team FROM pool_picks WHERE player_name='Alice'").get().team,'MIA');assert.equal((await history('admin')).requests[0].status,'approved');
 console.log('PASS real commissioner endpoint → saved receipt → pool-scoped history → LINKS owner queue → approved pick');
}finally{global.fetch=original;db.raw.close()}
