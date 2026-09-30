const assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite');
(async()=>{
 const sql=new DatabaseSync(':memory:');sql.exec(`
 CREATE TABLE pools(id INTEGER PRIMARY KEY,code TEXT UNIQUE,name TEXT,admin_salt TEXT,admin_hash TEXT,created_at TEXT);
 CREATE TABLE pool_active_games(pool_id INTEGER,game_type TEXT,is_primary INTEGER,active INTEGER,added_at TEXT,PRIMARY KEY(pool_id,game_type));
 CREATE TABLE pool_settings(pool_id INTEGER,key TEXT,value TEXT,PRIMARY KEY(pool_id,key));
 CREATE TABLE pool_players(pool_id INTEGER,name TEXT,password_hash TEXT,salt TEXT,PRIMARY KEY(pool_id,name));
 CREATE TABLE pool_sessions(token TEXT PRIMARY KEY,pool_id INTEGER,player_name TEXT,role TEXT,expires_at TEXT);
 CREATE TABLE pool_picks(pool_id INTEGER,team TEXT);
 `);
 let failBatch=false;
 const db={prepare(text){let args=[];return {bind(...v){args=v;return this},async first(){return sql.prepare(text).get(...args)||null},async all(){return {results:sql.prepare(text).all(...args)}},async run(){if(failBatch&&text.startsWith('INSERT INTO pool_players'))throw Error('test failure');const r=sql.prepare(text).run(...args);return {meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}}}}},async batch(statements){sql.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};



 const {ensureOwner,ownerHash}=await import('../functions/lib/owner-auth.js'),{ensureAccounts,allowance}=await import('../functions/lib/commissioner-account.js'),{onRequest}=await import('../functions/new-build/api/links-admin.js');await ensureOwner(db);await ensureAccounts(db);
 sql.prepare('INSERT INTO links_owner_password VALUES(1,?,?)').run('salt',await ownerHash('owner-password','salt'));sql.prepare('INSERT INTO links_admin_sessions VALUES(?,?)').run('owner','2099-01-01');
 const call=(body,token='owner',ip=crypto.randomUUID())=>onRequest({env:{DB:db},request:new Request('https://test/new-build/api/links-admin',{method:body?'POST':'GET',headers:{authorization:'Bearer '+token,'cf-connecting-ip':ip},...(body?{body:JSON.stringify(body)}:{})})});
 const body={action:'grant-package',email:'MichaelDeMeza@yahoo.com',plan:'all_access',days:365,password:'owner-password',confirm:true,requestId:crypto.randomUUID()};
 assert.equal((await call(body,'player')).status,401);assert.equal((await call({...body,password:'bad'})).status,401);assert.equal((await call({...body,days:0})).status,400);assert.equal((await call({...body,confirm:false})).status,400);assert.equal((await call({...body,plan:'invented'})).status,400);assert.equal((await call({...body,email:'bad'})).status,400);
 const before=Date.now();const res=await call(body);assert.equal(res.status,200);const granted=await res.json();assert.equal(granted.grant.email,'michaeldemeza@yahoo.com');assert.ok(Date.parse(granted.grant.expires_at)-before>=365*864e5);assert.equal(granted.effective.slots,10);assert.equal(granted.effective.complimentary,true);
 assert.equal((await call(body)).status,200);assert.equal(sql.prepare('SELECT COUNT(*) n FROM links_package_grants').get().n,1);assert.equal(sql.prepare('SELECT COUNT(*) n FROM links_account_purchases').get().n,0);assert.equal(sql.prepare('SELECT COUNT(*) n FROM links_accounts').get().n,0,'Does not bypass email verification');
 assert.equal((await call({...body,email:'other@example.com'})).status,409);
 const dashboard=await (await call(null)).json();assert.equal(dashboard.accounts.find(a=>a.email==='michaeldemeza@yahoo.com').slots,10);assert.equal(dashboard.grants.length,1);
 sql.prepare('INSERT INTO links_account_plans VALUES(?,?,?,?)').run('michaeldemeza@yahoo.com','plus','2099-01-01','paid');sql.exec("UPDATE links_package_grants SET expires_at='2020-01-01'");assert.equal((await allowance(db,'michaeldemeza@yahoo.com')).plan,'plus','Paid package survives grant expiry');
 sql.exec('DELETE FROM links_account_plans');assert.equal((await allowance(db,'michaeldemeza@yahoo.com')).plan,'free');assert.ok((await allowance(db,'michaeldemeza@yahoo.com')).expiresAt);
 console.log('PASS owner-only grants, input/password checks, annual expiry, idempotency, no fabricated payment or verification, dashboard and paid fallback');
})().catch(e=>{console.error(e);process.exitCode=1});
