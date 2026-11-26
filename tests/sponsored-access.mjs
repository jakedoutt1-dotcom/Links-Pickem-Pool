import assert from 'node:assert/strict';
import vm from 'node:vm';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {ensureAccounts,allowance} from '../functions/lib/commissioner-account.js';
const {db,runtime}=fixture();
try{
 await ensureAccounts(db);
 runtime.accountAllowance=allowance;vm.runInContext('globalThis.readAdAccess=poolAccessFor',runtime);
 const email='sponsor-test@example.com';
 await db.prepare('INSERT INTO links_pool_owners(pool_id,email) VALUES(?,?)').bind(1,email).run();
 assert.equal((await allowance(db,email)).testing,true,'Games remain free');
 assert.equal((await allowance(db,email,{includeFreeAccess:false})).plan,'free');
 assert.equal((await runtime.readAdAccess(db,1)).adFree,false,'Free play is not an ad-free purchase');
 await db.prepare('INSERT INTO links_account_plans VALUES(?,?,?,?)').bind(email,'plus','2099-01-01','paid').run();
 assert.equal((await runtime.readAdAccess(db,1)).adFree,true,'Existing paid ad-free access is retained');
 assert.equal((await allowance(db,email)).testing,true,'Checking ad access never limits free games');
 await db.prepare('UPDATE links_account_plans SET expires_at=? WHERE email=?').bind('2020-01-01',email).run();
 assert.equal((await runtime.readAdAccess(db,1)).adFree,false,'Expired paid benefit does not block advertising');
 await db.prepare('INSERT INTO links_package_grants VALUES(?,?,?,?,?,?)').bind('grant',email,'all_access',365,'2026-01-01','2099-01-01').run();
 assert.equal((await runtime.readAdAccess(db,1)).adFree,true,'Explicit complimentary ad-free package is retained');
 await db.prepare('UPDATE links_package_grants SET expires_at=?').bind('2020-01-01').run();
 assert.equal((await runtime.readAdAccess(db,1)).adFree,false);
 console.log('PASS sponsored access: free games stay free, free accounts can load ads, paid/granted ad-free benefits preserved, expiry respected.');
}finally{db.raw.close()}
