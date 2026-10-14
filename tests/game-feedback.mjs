import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {ensureOwner} from '../functions/lib/owner-auth.js';
import {onRequest} from '../functions/new-build/api/game-feedback.js';
const {db}=fixture();await ensureOwner(db);await db.prepare('INSERT INTO links_admin_sessions VALUES(?,?)').bind('test-owner','2099-01-01').run();
async function call(body,token='',origin='https://links.test',device='a'.repeat(32),cursor=''){
 const response=await onRequest({env:{DB:db},request:new Request('https://links.test/new-build/api/game-feedback'+(cursor?'?before='+encodeURIComponent(cursor):''),{method:body?'POST':'GET',headers:{Origin:origin,Authorization:'Bearer '+token,'CF-Connecting-IP':'192.0.2.1',Cookie:device?'links-feedback-device='+device:''},...(body?{body:JSON.stringify(body)}:{})})});return {status:response.status,data:await response.json(),cookie:response.headers.get('Set-Cookie')};
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
for(let i=0;i<6;i++)assert.equal((await call({...body,game:i%2?'mini-golf':'goal-line'},'','https://links.test',i.toString(16).padStart(32,'0'))).status,200,'independent venue guests can all submit');
const firstVisit=await call(body,'','https://links.test','');assert.equal(firstVisit.status,200);assert.match(firstVisit.cookie,/links-feedback-device=[a-f0-9]{32}/);assert.match(firstVisit.cookie,/HttpOnly/);
// More than one page with identical timestamps must not skip the boundary rows.
for(let i=0;i<105;i++)await db.prepare('INSERT INTO links_game_feedback(id,game,rating,improve,suggestion,comments,created_at) VALUES(?,?,?,?,?,?,?)').bind('cursor-'+String(i).padStart(3,'0'),'mini-golf','love','','','','2090-01-01T00:00:00.000Z').run();
const first=(await call(null,'test-owner')).data;assert.equal(first.rows.length,100);assert(first.next);
const second=(await call(null,'test-owner','https://links.test','a'.repeat(32),first.next)).data;
const ids=[...first.rows,...second.rows].filter(r=>r.id.startsWith('cursor-')).map(r=>r.id);assert.equal(ids.length,105);assert.equal(new Set(ids).size,105);
db.raw.close();console.log('PASS feedback submission, validation, origin, admin-only reading/reviewing, persistence and rate limiting.');
