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

 const {onRequest}=await import('../functions/new-build/api/pool-switcher.js'),lib=await import('../functions/lib/commissioner-account.js');await lib.ensureAccounts(db);
 const expiry=new Date(Date.now()+864e5).toISOString();
 for(let i=1;i<=3;i++){sql.prepare('INSERT INTO pools(id,code,name) VALUES(?,?,?)').run(i,'P'+i,'Pool '+i);sql.prepare('INSERT INTO pool_players VALUES(?,?,?,?)').run(i,'Same Name','hash','salt');sql.prepare('INSERT INTO pool_active_games VALUES(?,?,1,1,?)').run(i,i===2?'college':'nfl',expiry);sql.prepare('INSERT INTO pool_sessions VALUES(?,?,?,?,?)').run('session'+i,i,'Same Name','player',expiry)}
 sql.prepare('INSERT INTO links_account_sessions VALUES(?,?,?)').run(await lib.digest('account'),'player@example.com',expiry);
 const call=async(body,token='session1',account='account')=>{const r=await onRequest({env:{DB:db},request:new Request('https://test/new-build/api/pool-switcher',{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'x-links-account':account},...(body?{body:JSON.stringify(body)}:{})})});return {status:r.status,data:await r.json()}};
 assert.equal((await call(null,'bad')).status,401);
 assert.equal((await call()).data.pools.length,1,'Same names cannot expose other pools');
 assert.equal((await call({action:'open',pool:2})).status,403);
 assert.equal((await call({action:'link'})).status,200);
 assert.equal((await call({action:'link'},'session2')).status,200);
 assert.equal((await call()).data.pools.length,2);
 const opened=await call({action:'open',pool:2});assert.equal(opened.status,200);assert.deepEqual(opened.data.gameKeys,['college']);assert.equal(opened.data.pool.role,'player');assert.equal(sql.prepare('SELECT pool_id FROM pool_sessions WHERE token=?').get(opened.data.token).pool_id,2);
 assert.equal((await call({action:'open',pool:3})).status,403);
 sql.exec('CREATE TABLE newbuild_player_access(pool_id INTEGER,player_name TEXT,status TEXT)');sql.prepare('INSERT INTO newbuild_player_access VALUES(?,?,?)').run(2,'Same Name','pending');assert.equal((await call({action:'open',pool:2})).status,403,'Revoked access blocks switching');
 sql.exec('DELETE FROM newbuild_player_access; DELETE FROM pool_players WHERE pool_id=2');assert.equal((await call({action:'open',pool:2})).status,403,'Deleted memberships cannot return');
 sql.prepare('INSERT INTO links_pool_owners VALUES(?,?)').run(3,'player@example.com');sql.prepare('INSERT INTO pool_settings VALUES(?,?,?)').run(3,'commissioner_player_name','Same Name');assert.equal((await call({action:'open',pool:3})).data.pool.role,'commissioner');
 assert.equal((await call({action:'open',pool:3},'session1','forged')).status,401);
 console.log('PASS pool switching: identity isolation, linked College membership, revoked/deleted access, commissioner ownership, scoped sessions');
})().catch(e=>{console.error(e);process.exitCode=1});
