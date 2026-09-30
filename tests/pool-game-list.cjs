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


 const {poolGameKeys}=await import('../functions/lib/pool-games.js'),{ensureAccounts}=await import('../functions/lib/commissioner-account.js');await ensureAccounts(db);
 sql.exec("INSERT INTO pool_settings VALUES(1,'active_games_exact','[\"nfl\",\"college\"]')");
 assert.deepEqual(await poolGameKeys(db,1),['nfl','college'],'Older settings-only pools retain chosen games');
 sql.exec("INSERT INTO pool_active_games VALUES(1,'nascar',1,1,'2026-01-01')");assert.deepEqual(await poolGameKeys(db,1),['nfl','college'],'Exact selection overrides stale rows');
 sql.exec("INSERT INTO links_pool_slots VALUES('one','a@example.com',1,'college',1,NULL); INSERT INTO links_pool_slots VALUES('two','a@example.com',1,'nfl',0,NULL)");assert.deepEqual(await poolGameKeys(db,1),['college'],'Purchased slots and archive states win');
 sql.exec("UPDATE links_pool_slots SET active=0");assert.deepEqual(await poolGameKeys(db,1),[],'All archived must not reappear');
 sql.exec("INSERT INTO pool_settings VALUES(2,'game_type','college')");assert.deepEqual(await poolGameKeys(db,2),['college'],'Legacy single-game pool');
 sql.exec("INSERT INTO pool_active_games VALUES(2,'college',1,0,'2026-01-01')");assert.deepEqual(await poolGameKeys(db,2),[],'Archived legacy game stays hidden');
 assert.deepEqual(await poolGameKeys(db,999),[],'Unknown pool never becomes NFL');
 sql.exec("INSERT INTO pool_active_games VALUES(3,'nfl',1,1,'2026-01-01'); INSERT INTO pool_active_games VALUES(3,'college',0,1,'2026-01-01'); INSERT INTO links_pool_slots VALUES('new1','new@example.com',3,'nfl',1,NULL); INSERT INTO links_pool_slots VALUES('new2','new@example.com',3,'college',1,NULL)");assert.deepEqual(await poolGameKeys(db,3),['college','nfl'],'New multi-game pool');
 const {onRequestGet}=await import('../functions/new-build/api/pool-games.js');sql.exec("INSERT INTO pools(id,code,name) VALUES(3,'JAKVEX','Jake Doutt')");
 const get=async pool=>{const r=await onRequestGet({env:{DB:db},request:new Request('https://test/api/pool-games?pool='+pool)});return {status:r.status,data:await r.json()}};
 const byId=await get('3'),byCode=await get('jakvex');assert.deepEqual(byCode.data,byId.data);assert.equal(byCode.data.resolvedPoolId,'3');assert.equal(byCode.data.games.length,2);assert.equal((await get('MISSING')).status,404);
 console.log('PASS settings-only, stale rows, new multi-game pools, archive protection, single-game and unknown pools');
})().catch(e=>{console.error(e);process.exitCode=1});
