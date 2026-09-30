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


 const {onRequest}=await import('../functions/new-build/api/links-admin.js');
 const {ensureOwner,ownerHash,ownerPasswordOk}=await import('../functions/lib/owner-auth.js');
 await ensureOwner(db);await db.prepare('INSERT INTO links_owner_password VALUES(1,?,?)').bind('test-salt',await ownerHash('original-owner-password','test-salt')).run();
 const call=(body,token='',ip='one')=>onRequest({env:{DB:db},request:new Request('https://test/new-build/api/links-admin',{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'cf-connecting-ip':ip},...(body?{body:JSON.stringify(body)}:{})})});
 assert.equal((await call()).status,401);
 assert.equal((await call({action:'login',password:'wrong'})).status,401);
 let r=await call({action:'login',password:'original-owner-password'});assert.equal(r.status,200);const token=(await r.json()).token;
 sql.exec("INSERT INTO pools(id,code,name) VALUES(1,'ABC','Family'); INSERT INTO pool_settings VALUES(1,'commissioner_email','owner@example.com'); INSERT INTO pool_active_games VALUES(1,'nfl',1,1,'2026-01-01')");
 const {ensureAccounts}=await import('../functions/lib/commissioner-account.js');await ensureAccounts(db);
 sql.exec("INSERT INTO links_account_plans VALUES('owner@example.com','plus','2099-01-01','purchase'); INSERT INTO links_pool_slots VALUES('slot','owner@example.com',1,'nfl',1,NULL)");
 const {recordPoolLogin,recordAccountLogin}=await import('../functions/lib/login-activity.js');await recordPoolLogin(db,1,'Player');await recordPoolLogin(db,1,'Player');await recordAccountLogin(db,'owner@example.com');
 r=await call(null,token);assert.equal(r.status,200);const d=await r.json();assert.equal(d.pools[0].code,'ABC');assert.equal(d.accounts[0].plan,'plus');assert.equal(d.accounts[0].used,1);assert.equal(d.activity[0].login_count,2);assert.equal(d.accountActivity[0].login_count,1);assert.ok(!JSON.stringify(d).includes('password_hash'));
 r=await call({action:'password',password:'original-owner-password',newPassword:'replacement-owner-password'});assert.equal(r.status,200);assert.equal((await call(null,token)).status,401);assert.equal(await ownerPasswordOk(db,'original-owner-password'),false);assert.equal(await ownerPasswordOk(db,'replacement-owner-password'),true);
 for(let i=0;i<5;i++)assert.equal((await call({action:'login',password:'wrong'},'','limited')).status,401);assert.equal((await call({action:'login',password:'wrong'},'','limited')).status,429);
 console.log('PASS owner authorization, password rotation/revocation, rate limit, packages, and login history');
})().catch(e=>{console.error(e);process.exitCode=1});
