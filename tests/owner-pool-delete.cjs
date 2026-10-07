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
 sql.exec('CREATE TABLE quoted_scope("pool_id" INTEGER,value TEXT); INSERT INTO quoted_scope VALUES(1,"remove"),(2,"keep");'.replaceAll('"remove"',"'remove'").replaceAll('"keep"',"'keep'"));
 let failBatch=false,queryCount=0;
 const db={prepare(text){if(/UNION ALL/i.test(text))throw Error("too many terms in compound SELECT: SQLITE_ERROR");if(/pragma_table_info/i.test(text))throw Error("not authorized to use function: pragma_table_info");queryCount++;let args=[];return {bind(...v){args=v;return this},async first(){return sql.prepare(text).get(...args)||null},async all(){return {results:sql.prepare(text).all(...args)}},async run(){if(failBatch&&text.startsWith('INSERT INTO pool_players'))throw Error('test failure');const r=sql.prepare(text).run(...args);return {meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}}}}},async batch(statements){sql.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};



 const {ensureOwner,ownerHash}=await import('../functions/lib/owner-auth.js'),{ensureAccounts}=await import('../functions/lib/commissioner-account.js'),{ownerPoolDelete}=await import('../functions/lib/owner-pool-delete.js');await ensureOwner(db);await ensureAccounts(db);
 sql.prepare('INSERT INTO links_owner_password VALUES(1,?,?)').run('salt',await ownerHash('owner-password','salt'));sql.prepare('INSERT INTO links_admin_sessions VALUES(?,?)').run('owner','2099-01-01');
 sql.exec("INSERT INTO pools(id,code,name) VALUES(1,'TEST','Test Pool'),(2,'LIVE','Live Pool'),(3,'LINKS','Barnes Family'); INSERT INTO pool_picks VALUES(1,'AAA'),(2,'BBB'); INSERT INTO pool_players VALUES(1,'Test','hash','salt'); INSERT INTO pool_sessions VALUES('player',1,'Test','player','2099-01-01'); INSERT INTO links_pool_slots VALUES('slot','a@example.com',1,'nfl',1,NULL); INSERT INTO links_account_preferences VALUES('a@example.com','slot'); CREATE TABLE payment_orders(pool_id INTEGER,amount INTEGER); INSERT INTO payment_orders VALUES(1,1999)");
 sql.exec("CREATE TABLE squares_boards(id INTEGER,pool_id INTEGER); CREATE TABLE squares_claims(board_id INTEGER); INSERT INTO squares_boards VALUES(1,1),(2,2); INSERT INTO squares_claims VALUES(1),(2)");
 // Model a production-sized schema so preview cannot regress to per-table requests.
 for(let i=0;i<120;i++)sql.exec('CREATE TABLE game_fixture_'+i+'(pool_id INTEGER,value TEXT); INSERT INTO game_fixture_'+i+" VALUES(1,'test'),(2,'keep')");
 const {slotWriteGuard}=await import('../functions/lib/slot-write-guard.js');
 const call=async(b,token='owner')=>{const request=new Request('https://test/new-build/api/links-admin',{method:'POST',headers:{authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(b)});return await slotWriteGuard(request,{DB:db})||ownerPoolDelete(request,db,b)};
 sql.exec("UPDATE links_pool_slots SET active=0 WHERE pool_id=1");
 assert.equal((await call({action:'delete-preview',pool:1},'player')).status,401);
 assert.equal((await call({action:'delete-preview',pool:3})).status,403);
 queryCount=0;assert.equal((await (await call({action:'delete-preview',pool:1})).json()).counts.pool_players,1);assert.ok(queryCount<20,'Preview chunks counts below D1 limits without one query per table');
 const body={action:'delete-pool',pool:1,confirmName:'Test Pool',confirmCode:'TEST',acknowledge:true,password:'owner-password'};
 assert.equal((await call({...body,confirmCode:'LIVE'})).status,400);assert.equal((await call({...body,password:'bad'})).status,401);
 const batch=db.batch;db.batch=async statements=>{if(statements.some(s=>false))return batch(statements);sql.exec('BEGIN');try{await statements[0].run();throw Error('simulated failure')}catch(e){sql.exec('ROLLBACK');throw e}};
 await assert.rejects(call(body),/simulated failure/);assert.equal(sql.prepare('SELECT COUNT(*) n FROM links_account_preferences').get().n,1);assert.ok(sql.prepare('SELECT id FROM pools WHERE id=1').get());db.batch=batch;
 assert.equal((await call(body)).status,200);assert.equal(sql.prepare('SELECT id FROM pools WHERE id=1').get(),undefined);assert.equal(sql.prepare('SELECT COUNT(*) n FROM pool_picks WHERE pool_id=1').get().n,0);assert.equal(sql.prepare('SELECT COUNT(*) n FROM pool_sessions').get().n,0);assert.equal(sql.prepare('SELECT COUNT(*) n FROM links_pool_slots').get().n,0);assert.equal(sql.prepare('SELECT COUNT(*) n FROM links_account_preferences').get().n,0);assert.equal(sql.prepare('SELECT COUNT(*) n FROM payment_orders').get().n,1);assert.equal(sql.prepare('SELECT COUNT(*) n FROM pool_picks WHERE pool_id=2').get().n,1);assert.equal(sql.prepare('SELECT COUNT(*) n FROM links_owner_deletions').get().n,1);assert.equal((await call(body)).status,404);
 assert.deepEqual(sql.prepare('SELECT board_id FROM squares_claims').all().map(r=>r.board_id),[2]);
 assert.equal(sql.prepare('SELECT COUNT(*) n FROM game_fixture_119 WHERE pool_id=1').get().n,0);assert.equal(sql.prepare('SELECT COUNT(*) n FROM game_fixture_119 WHERE pool_id=2').get().n,1);
 assert.equal(sql.prepare('SELECT COUNT(*) n FROM quoted_scope WHERE pool_id=1').get().n,0);assert.equal(sql.prepare('SELECT COUNT(*) n FROM quoted_scope WHERE pool_id=2').get().n,1);
 console.log('PASS restricted-schema preview, quoted pool columns, owner-only deletion, protected pool, preview, password/code checks, rollback, slot cleanup, audit, preserved other pool and ledger');
})().catch(e=>{console.error(e);process.exitCode=1});
