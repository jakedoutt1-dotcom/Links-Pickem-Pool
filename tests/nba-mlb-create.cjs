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
 let partnerRef='';const create=(token,name='Office',games=['nfl'])=>call({action:'create',name,displayName:'Owner',password:'longpassword',games,partnerRef},token);
 try{
 const first=await verify('existing@example.com','first');
 const made=await create(first.token,'Original pool');assert.equal(made.status,200,JSON.stringify(made));
 sql.prepare('INSERT INTO pool_picks VALUES(?,?)').run(made.data.pool.id,'GB');
 sql.exec("UPDATE links_account_codes SET sent_at='2000-01-01'");
 const again=await verify('existing@example.com','second');
 const next=await create(again.token,'Basketball and baseball',['nba','mlb']);assert.equal(next.status,200,JSON.stringify(next));
 assert.notEqual(next.data.pool.id,made.data.pool.id);assert.deepEqual(sql.prepare('SELECT game_type FROM links_pool_slots WHERE pool_id=? ORDER BY game_type').all(next.data.pool.id).map(r=>r.game_type),['mlb','nba']);
 assert.equal(sql.prepare('SELECT COUNT(*) n FROM links_accounts WHERE email=?').get('existing@example.com').n,1);
 assert.equal(sql.prepare('SELECT team FROM pool_picks WHERE pool_id=?').get(made.data.pool.id).team,'GB');
 console.log('PASS existing verified email reused, separate new sports pool, no duplicate account, original picks preserved; email mocked');
 }finally{global.fetch=oldFetch;sql.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
