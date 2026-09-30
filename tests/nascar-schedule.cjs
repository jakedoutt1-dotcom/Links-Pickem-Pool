const assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite');
(async()=>{
 const sql=new DatabaseSync(':memory:');sql.exec(`CREATE TABLE pools(id INTEGER,code TEXT,name TEXT);INSERT INTO pools VALUES(1,'ONE','Test');CREATE TABLE pool_sessions(token TEXT,pool_id INTEGER,player_name TEXT,role TEXT,expires_at TEXT);CREATE TABLE pool_active_games(pool_id INTEGER,game_type TEXT,active INTEGER,is_primary INTEGER DEFAULT 0);CREATE TABLE pool_settings(pool_id INTEGER,key TEXT,value TEXT,PRIMARY KEY(pool_id,key));CREATE TABLE pool_picks(pool_id INTEGER,team TEXT);INSERT INTO pool_sessions VALUES('alice',1,'Alice','player','2099-01-01'),('bob',2,'Bob','player','2099-01-01'),('admin',1,'Owner','admin','2099-01-01');INSERT INTO pool_active_games(pool_id,game_type,active) VALUES(1,'confidence',1),(1,'survivor',1),(1,'masters',1);INSERT INTO pool_picks VALUES(1,'BUF');`);
 const db={prepare(text){let args=[];return{bind(...v){args=v;return this},async first(){return sql.prepare(text).get(...args)||null},async all(){return{results:sql.prepare(text).all(...args)}},async run(){return{meta:{changes:Number(sql.prepare(text).run(...args).changes)}}}}},async batch(stmts){sql.exec('BEGIN');try{const result=[];for(const s of stmts)result.push(await s.run());sql.exec('COMMIT');return result}catch(e){sql.exec('ROLLBACK');throw e}}};

 sql.exec("INSERT INTO pool_active_games(pool_id,game_type,active) VALUES(1,'nascar',1)");
 const {onRequest}=await import('../functions/new-build/api/nascar-schedule.js'),{onRequestPost:pick,onRequestGet:picks}=await import('../functions/new-build/api/picks.js'),original=fetch;
 global.fetch=async()=>Response.json({events:[{id:'123',name:'Test Speedway',date:'2090-10-01T20:00:00Z',competitions:[{competitors:[{athlete:{displayName:'Driver A'}}]}]},{id:'456',name:'Next Race',date:'2090-10-08T20:00:00Z'}]});
 const call=async(token,body)=>onRequest({request:new Request('https://test/api/nascar-schedule?pool=1&year=2026',{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token},...(body?{body:JSON.stringify({pool:1,year:2026,raceId:'123',pickLimit:1,drivers:['Driver A'],...body})}:{})}),env:{DB:db}});
 try{
 assert.equal((await call('alice')).status,403);assert.equal((await call('bob',{})).status,403);
 assert.equal((await (await call('admin')).json()).races[0].drivers[0],'Driver A');
 assert.equal((await call('admin',{raceId:'bogus'})).status,400);assert.equal((await call('admin',{drivers:[]})).status,400);
 assert.equal((await call('admin',{})).status,200);
 const request=()=>new Request('https://test/api/picks',{method:'POST',headers:{Authorization:'Bearer alice'},body:JSON.stringify({pool:1,game:'NASCAR',player:'Alice',period:'race-123',eventId:'option:Driver A',selection:'Driver A'})});
 assert.equal((await pick({request:request(),env:{DB:db}})).status,200);
 assert.equal((await call('admin',{raceId:'456',drivers:['Driver B']})).status,200);
 assert.equal(sql.prepare("SELECT selection FROM links_game_entries WHERE period='race-123'").get().selection,'Driver A');
 assert.equal(JSON.parse(sql.prepare("SELECT value FROM pool_settings WHERE key='game_settings:nascar:current'").get().value).settings.period,'race-456');
 assert.equal(sql.prepare('SELECT team FROM pool_picks').get().team,'BUF');
 console.log('PASS NASCAR real-feed parsing, commissioner-only publish, invalid fields, race-specific picks, prior race and NFL preservation');
 }finally{global.fetch=original;sql.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
