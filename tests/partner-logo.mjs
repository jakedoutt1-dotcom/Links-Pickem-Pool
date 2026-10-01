import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {ensureOwner} from '../functions/lib/owner-auth.js';
import {onRequest} from '../functions/new-build/api/partner-logo.js';
const {db}=fixture();await ensureOwner(db);db.raw.exec("INSERT INTO links_admin_sessions VALUES('owner','2099-01-01')");const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1sAAAAASUVORK5CYII=','base64');
const upload=(body,token='owner')=>onRequest({env:{DB:db},request:new Request('https://test/new-build/api/partner-logo',{method:'POST',headers:{Authorization:'Bearer '+token},body})});
assert.equal((await upload(png,'admin')).status,401);assert.equal((await upload('<svg></svg>')).status,400);assert.equal((await upload(new Uint8Array(512*1024+1))).status,413);const r=await upload(png);assert.equal(r.status,200);const {url}=await r.json();const saved=await onRequest({env:{DB:db},request:new Request(url)});assert.equal(saved.headers.get('content-type'),'image/png');assert.deepEqual(Buffer.from(await saved.arrayBuffer()),png);db.raw.close();console.log('PASS owner-only upload, image type/size rejection, stored logo and public image delivery');
