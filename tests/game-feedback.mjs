import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {ensureOwner} from '../functions/lib/owner-auth.js';
import {onRequest} from '../functions/new-build/api/game-feedback.js';
const {db}=fixture();await ensureOwner(db);await db.prepare('INSERT INTO links_admin_sessions VALUES(?,?)').bind('test-owner','2099-01-01').run();
async function call(body,token='',origin='https://links.test'){
 const response=await onRequest({env:{DB:db},request:new Request('https://links.test/new-build/api/game-feedback',{method:body?'POST':'GET',headers:{Origin:origin,Authorization:'Bearer '+token,'CF-Connecting-IP':'192.0.2.1'},...(body?{body:JSON.stringify(body)}:{})})});return {status:response.status,data:await response.json()};
}
const body={action:'submit',game:'million-point',rating:'love',improve:'More clues',suggestion:'Music quiz',comments:'<script>unsafe</script>'};
assert.equal((await call(body,'','https://evil.test')).status,403);
assert.equal((await call({...body,game:'unknown'})).status,400);
assert.equal((await call({...body,comments:'a'.repeat(1501)})).status,400);
assert.equal((await call(body)).status,200);
assert.equal((await call()).status,401);
let rows=(await call(null,'test-owner')).data.rows;assert.equal(rows.length,1);assert.equal(rows[0].suggestion,'Music quiz');
assert.equal((await call({action:'review',id:rows[0].id,reviewed:true})).status,401);
assert.equal((await call({action:'review',id:rows[0].id,reviewed:true},'test-owner')).status,200);
assert.equal((await call(null,'test-owner')).data.rows[0].reviewed,1);
for(let i=0;i<4;i++)assert.equal((await call(body)).status,200);
assert.equal((await call(body)).status,429);
db.raw.close();console.log('PASS feedback submission, validation, origin, admin-only reading/reviewing, persistence and rate limiting.');
