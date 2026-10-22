import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {onRequest} from '../functions/new-build/api/venue-manager.js';
import {onRequest as logoRequest} from '../functions/new-build/api/partner-logo.js';
import {onRequest as partnersRequest} from '../functions/new-build/api/partners.js';
const raw=new DatabaseSync(':memory:');
const db={prepare(sql){let args=[];return {bind(...v){args=v;return this},async first(){return raw.prepare(sql).get(...args)||null},async all(){return {results:raw.prepare(sql).all(...args)}},async run(){const r=raw.prepare(sql).run(...args.map(v=>v instanceof ArrayBuffer?new Uint8Array(v):v));return {meta:{changes:Number(r.changes)}}}}},async batch(stmts){raw.exec('BEGIN');try{const r=[];for(const s of stmts)r.push(await s.run());raw.exec('COMMIT');return r}catch(e){raw.exec('ROLLBACK');throw e}}};
raw.exec('CREATE TABLE links_id_accounts(id TEXT,display_name TEXT,email TEXT);CREATE TABLE links_id_sessions(token_hash TEXT,account_id TEXT,expires_at INTEGER)');
for(const id of ['one','two']){raw.prepare('INSERT INTO links_id_accounts VALUES(?,?,?)').run(id,'Manager '+id,id+'@example.com');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id))),x=>x.toString(16).padStart(2,'0')).join('');raw.prepare('INSERT INTO links_id_sessions VALUES(?,?,?)').run(hash,id,Date.now()+600000)}
const sample={name:'The Venue',address:'123 Main Street',logo:'https://links.test/logo.png',latitude:36.1,longitude:-86.7,radius:75,website:'https://example.com',offer:'Game night tonight',active:true,agree:true};
async function call(body,token='one',origin='https://links.test'){const r=await onRequest({env:{DB:db},request:new Request('https://links.test/new-build/api/venue-manager',{method:body?'POST':'GET',headers:{origin,cookie:'__Host-links_identity='+token},...(body?{body:JSON.stringify(body)}:{})})});return {status:r.status,...await r.json()}}
assert.equal((await call(null,'bad')).status,401);assert.equal((await call(sample,'one','https://evil.test')).status,403);
assert.equal((await call({...sample,agree:false})).status,400);assert.equal((await call({...sample,logo:'javascript:alert(1)'})).status,400);
const saved=await call(sample);assert.equal(saved.status,200);assert.equal((await call(null)).venue.id,saved.id);assert.equal((await call(null,'two')).venue,null);
assert.equal((await call({...sample,id:saved.id},'two')).status,403);assert.equal((await call(sample,'two')).status,409);
const publicList=await partnersRequest({env:{DB:db},request:new Request('https://links.test/new-build/api/partners?public=1')});const pub=await publicList.json();assert.equal(pub.partners[0].offer,sample.offer);assert.equal(JSON.stringify(pub).includes('one@example.com'),false);
raw.prepare('UPDATE links_partners SET pool_id=99 WHERE id=?').run(saved.id);
assert.equal((await call({...sample,id:saved.id,offer:'New offer',active:false,pool_id:999})).status,200);assert.equal(raw.prepare('SELECT pool_id FROM links_partners WHERE id=?').get(saved.id).pool_id,99,'Manager updates preserve the admin-controlled pool');assert.equal((await call(null)).venue.offer,'New offer');
assert.equal(raw.prepare('SELECT agreed_at FROM links_venue_managers WHERE account_id=?').get('one').agreed_at.length>0,true);
const bytes=new Uint8Array(30);bytes.set([137,80,78,71,13,10,26,10]);const upload=await logoRequest({env:{DB:db},request:new Request('https://links.test/new-build/api/partner-logo',{method:'POST',headers:{origin:'https://links.test',cookie:'__Host-links_identity=one'},body:bytes})});assert.equal(upload.status,200);const image=await upload.json();assert.match(image.url,/partner-logo\?id=/);
const denied=await logoRequest({env:{DB:db},request:new Request('https://links.test/new-build/api/partner-logo',{method:'POST',headers:{origin:'https://evil.test'},body:bytes})});assert.equal(denied.status,403);
console.log('PASS venue self-service: account isolation, signup agreement, automatic public listing, edits, pause, duplicate-address protection, logo auth and origin checks.');
