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
 const {onRequest}=await import('../functions/new-build/api/account.js'),lib=await import('../functions/lib/commissioner-account.js');
 let sent=[],orders=new Map(),captureCount=0;
 const oldFetch=global.fetch;global.fetch=async(url,opts={})=>{
 if(String(url).includes('resend.com')){sent.push(JSON.parse(opts.body));return Response.json({id:'mail'})}
 if(String(url).endsWith('/oauth2/token'))return Response.json({access_token:'paypal-test'});
 if(String(url).endsWith('/v2/checkout/orders')&&opts.method==='POST'){const b=JSON.parse(opts.body),id='order-'+orders.size;orders.set(id,{id,status:'APPROVED',purchase_units:b.purchase_units});return Response.json({id,links:[{rel:'approve',href:'https://paypal.test/'+id}]})}
 const id=String(url).split('/orders/')[1]?.split('/')[0],order=orders.get(id);if(!order)throw Error('Unexpected network request '+url);
 if(String(url).endsWith('/capture')){captureCount++;order.status='COMPLETED';order.purchase_units[0].payments={captures:[{status:'COMPLETED',amount:order.purchase_units[0].amount}]}}return Response.json(order);
 };
 const env={DB:db,RESEND_API_KEY:'fixture',PAYPAL_CLIENT_ID:'fixture',PAYPAL_CLIENT_SECRET:'fixture'};
 const call=async(body,token='',ip='1')=>{const r=await onRequest({request:new Request('https://test/new-build/api/account',{method:body?'POST':'GET',headers:{'x-links-account':token,'cf-connecting-ip':ip},...(body?{body:JSON.stringify(body)}:{})}),env});return {status:r.status,data:await r.json()}};
 const verify=async(email,ip)=>{assert.equal((await call({action:'send-code',email},'',ip)).status,200);const code=sent.at(-1).text.match(/code is (\d{8})/)[1];const r=await call({action:'verify',email,code},'',ip);assert.equal(r.status,200);return {token:r.data.token,code}};
 const create=(token,name='Office',games=['nfl'])=>call({action:'create',name,displayName:'Owner',password:'longpassword',games},token);
 try{
 assert.equal((await call()).status,401);assert.equal((await create('forged')).status,401);
 const a=await verify('First.Last+pool@gmail.com','1');assert.equal(lib.emailKey('firstlast@googlemail.com'),'firstlast@gmail.com');
 assert.equal((await call({action:'verify',email:'firstlast@gmail.com',code:a.code})).status,401,'Code cannot be replayed');
 let snapshot=(await call(null,a.token)).data;assert.equal(snapshot.plan.slots,1);
 let made=await create(a.token);assert.equal(made.status,200,JSON.stringify(made));const pool=made.data.pool.id;assert.equal(made.data.pool.games[0],'NFL Pick’em');
 assert.equal((await create(a.token,'Second')).status,402,'Second free pool is blocked');
 sql.prepare('INSERT INTO pool_picks VALUES(?,?)').run(pool,'BUF');
 const b=await verify('other@example.com','2');assert.equal((await call({action:'open',pool},b.token)).status,403);assert.equal((await call({action:'archive',pool,game:'nfl'},b.token)).status,403);
 assert.equal((await call({action:'checkout',plan:'plus'},a.token)).status,200);const purchase=sql.prepare('SELECT id FROM links_account_purchases').get().id;
 assert.equal((await call({action:'capture',purchase},b.token)).status,404);
 assert.equal((await call({action:'capture',purchase},a.token)).status,200);const expiry=sql.prepare('SELECT expires_at FROM links_account_plans').get().expires_at;
 assert.equal((await call({action:'capture',purchase},a.token)).status,200);assert.equal(captureCount,1);assert.equal(sql.prepare('SELECT expires_at FROM links_account_plans').get().expires_at,expiry);
 assert.equal((await create(a.token,'Second NFL')).status,200);assert.equal((await create(a.token,'Third NFL')).status,200);assert.equal((await create(a.token,'Fourth NFL')).status,402);
 assert.equal((await call({action:'add-game',pool,game:'college'},a.token)).status,402);
 assert.equal((await call({action:'archive',pool,game:'nfl'},a.token)).status,200);assert.equal(sql.prepare('SELECT COUNT(*) n FROM pool_picks').get().n,1,'Archiving preserves picks');
 const {slotWriteGuard}=await import('../functions/lib/slot-write-guard.js');assert.equal((await slotWriteGuard(new Request('https://test/new-build/api/picks',{method:'POST',body:JSON.stringify({pool,game:'NFL Pick’em'})}),env)).status,403);
 assert.equal((await call({action:'add-game',pool,game:'college'},a.token)).status,200);assert.equal((await call({action:'add-game',pool,game:'nfl'},a.token)).status,402,'Restoring uses capacity');
 assert.equal((await call({action:'archive',pool,game:'college'},a.token)).status,200);assert.equal((await call({action:'add-game',pool,game:'nfl'},a.token)).status,200);
 assert.equal(await slotWriteGuard(new Request('https://test/new-build/api/picks',{method:'POST',body:JSON.stringify({pool,game:'NFL Pick’em'})}),env),null);
 const opened=await call({action:'open',pool},a.token);assert.equal(opened.status,200);assert.equal(sql.prepare('SELECT pool_id FROM pool_sessions WHERE token=?').get(opened.data.token).pool_id,Number(pool));
 failBatch=true;let failure=await create(b.token,'Rollback');assert.equal(failure.status,500);failBatch=false;assert.equal(sql.prepare("SELECT COUNT(*) n FROM pools WHERE name='Rollback'").get().n,0);assert.equal((await call(null,b.token)).data.remaining,1,'Failed creation releases reservation');
 const {onRequestPost:oldCreate}=await import('../functions/new-build/api/pools.js');assert.equal((await oldCreate()).status,409);
 const {onRequestPost:oldGames}=await import('../functions/new-build/api/pool-games.js');assert.equal((await oldGames()).status,409);
 const c=await verify('multi@example.com','3');sql.prepare('INSERT INTO links_account_plans VALUES(?,?,?,?)').run('multi@example.com','plus','2099-01-01','fixture');
 assert.equal((await create(c.token,'Mixed',['nfl','college'])).status,200);assert.equal((await call(null,c.token)).data.used,2,'Each selected game consumes one slot');
 const mixed=(await call(null,c.token)).data.pools[0];
 sql.prepare('UPDATE links_account_plans SET expires_at=? WHERE email=?').run('2000-01-01','multi@example.com');
 let expired=(await call(null,c.token)).data;assert.equal(expired.plan.plan,'free');assert.equal(expired.expired,true);assert.equal(expired.pools[0].games.filter(g=>g.readOnly).length,1);
 assert.equal((await call({action:'choose-free',pool:mixed.id,game:'nfl'},c.token)).status,200);
 assert.equal((await slotWriteGuard(new Request('https://test/new-build/api/college',{method:'POST',body:JSON.stringify({pool:mixed.id,game:'nfl',action:'pick'})}),env)).status,403,'Cannot spoof the effective game to bypass expired access');
 assert.equal(await slotWriteGuard(new Request('https://test/new-build/api/picks',{method:'POST',body:JSON.stringify({pool:mixed.id,game:'NFL Pick’em'})}),env),null);
 assert.equal((await call({action:'checkout',plan:'plus'},b.token)).status,200);const badPurchase=sql.prepare('SELECT id,order_id FROM links_account_purchases WHERE email=?').get('other@example.com');orders.get(badPurchase.order_id).purchase_units[0].amount.value='0.01';
 assert.equal((await call({action:'capture',purchase:badPurchase.id},b.token)).status,409,'Incorrect amount cannot grant a package');assert.equal((await call(null,b.token)).data.plan.plan,'free');
 assert.equal((await call({action:'send-code',email:'attempts@example.com'},'','4')).status,200);const attemptCode=sent.at(-1).text.match(/code is (\d{8})/)[1];
 for(let i=0;i<5;i++)assert.equal((await call({action:'verify',email:'attempts@example.com',code:attemptCode==='00000000'?'11111111':'00000000'})).status,401);
 assert.equal((await call({action:'verify',email:'attempts@example.com',code:attemptCode})).status,401,'Five wrong guesses invalidate the code');
 assert.equal((await call({action:'send-code',email:'attempts@example.com'},'','4')).status,429,'Email resend cooldown is enforced');
 const sessions=sql.prepare('SELECT token_hash FROM links_account_sessions').all();assert.ok(sessions.every(x=>!x.token_hash.includes(a.token)),'Sessions stored hashed');
 assert.equal((await call({action:'logout'},a.token)).status,200);assert.equal((await call(null,a.token)).status,401);
 console.log('PASS verification, alias normalization, ownership, slot limits, repeated NFL pools, multi-game capacity, archive/restore, saved-pick preservation, payment verification/replay, atomic rollback, logout and retired endpoints');
 }finally{global.fetch=oldFetch;sql.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
