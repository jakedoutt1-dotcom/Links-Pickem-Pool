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

 const {sensitiveChangeGuard}=await import('../functions/lib/sensitive-change-guard.js'),{onRequestPost:login}=await import('../functions/new-build/api/members.js');
 const salt='salt',hash=btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':secret')))));
 sql.prepare('INSERT INTO pools(id,code,name) VALUES(1,?,?)').run('P','Pool');sql.prepare('INSERT INTO pool_players VALUES(1,?,?,?)').run('Owner',hash,salt);sql.prepare('INSERT INTO pool_settings VALUES(1,?,?)').run('commissioner_player_name','Owner');sql.prepare('INSERT INTO pool_settings VALUES(1,?,?)').run('commissioner_email','owner@example.com');
 const call=async remember=>{const r=await login({env:{DB:db},request:new Request('https://test/new-build/api/members',{method:'POST',headers:{cookie:'links_home_1_abc=old'},body:JSON.stringify({action:'login',pool:1,player:'Owner',password:'secret',remember})})});return {response:r,data:await r.json()}};
 const temp=await call(false),saved=await call(true);assert.ok(temp.response.headers.get('set-cookie').includes('Max-Age=0'));const expiry=token=>Date.parse(sql.prepare('SELECT expires_at FROM pool_sessions WHERE token=?').get(token).expires_at)-Date.now();assert.ok(expiry(temp.data.token)<=12*36e5&&expiry(temp.data.token)>11*36e5);assert.ok(expiry(saved.data.token)>29*864e5);
 const check=(path,body,password)=>sensitiveChangeGuard(new Request('https://test'+path,{method:'POST',headers:{Authorization:'Bearer '+saved.data.token,...(password?{'x-links-confirm-password':password}:{})},body:JSON.stringify(body)}),{DB:db});
 assert.equal(await check('/new-build/api/members',{action:'setStatus'}),null);assert.equal(await check('/api/admin/settings',{commissionerEmail:'owner@example.com',rules:'new'}),null);
 assert.equal((await check('/api/admin/settings',{commissionerEmail:'new@example.com'})).status,428);
 assert.equal((await check('/new-build/api/members',{action:'resetPassword'})).status,428);
 assert.equal((await check('/new-build/api/members',{action:'resetPassword'},'wrong')).status,403);
 assert.equal(await check('/new-build/api/members',{action:'resetPassword'},'secret'),null);
 for(let i=0;i<5;i++)assert.equal((await check('/api/admin/transfer-commissioner',{},'wrong')).status,403);
 assert.equal((await check('/api/admin/transfer-commissioner',{},'secret')).status,429);
 const accountLib=await import('../functions/lib/commissioner-account.js'),{onRequest:accountApi}=await import('../functions/new-build/api/account.js');await accountLib.ensureAccounts(db);const email='owner@example.com',stamp=new Date().toISOString();await db.prepare('INSERT INTO links_account_codes VALUES(?,?,?,?,?)').bind(email,await accountLib.digest(email+':12345678'),new Date(Date.now()+600000).toISOString(),0,stamp).run();
 const verified=await accountApi({env:{DB:db},request:new Request('https://test/new-build/api/account',{method:'POST',body:JSON.stringify({action:'verify',email,code:'12345678',remember:false})})});assert.equal(verified.status,200);const accountToken=(await verified.json()).token;
 const accountSession=await accountLib.accountSession(new Request('https://test',{headers:{'x-links-account':accountToken}}),db);assert.ok(Date.parse(accountSession.expires_at)-Date.now()<=12*36e5);
 const opened=await accountApi({env:{DB:db},request:new Request('https://test/new-build/api/account',{method:'POST',headers:{'x-links-account':accountToken},body:JSON.stringify({action:'open',pool:1})})});assert.equal(opened.status,200);assert.ok(expiry((await opened.json()).token)<=12*36e5,'Opening a pool cannot extend temporary account expiry');
 console.log('PASS remembered/temporary expiry, shortcut cookie removal, sensitive-change enforcement, unchanged-email bypass and verification rate limit');
})().catch(e=>{console.error(e);process.exitCode=1});
