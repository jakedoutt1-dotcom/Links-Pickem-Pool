const assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite');
(async()=>{
 const sql=new DatabaseSync(':memory:');sql.exec(`CREATE TABLE pool_sessions(token TEXT,pool_id INTEGER,player_name TEXT,role TEXT,expires_at TEXT);CREATE TABLE pool_active_games(pool_id INTEGER,game_type TEXT,active INTEGER);CREATE TABLE pool_settings(pool_id INTEGER,key TEXT,value TEXT,PRIMARY KEY(pool_id,key));CREATE TABLE pool_picks(pool_id INTEGER,team TEXT);INSERT INTO pool_sessions VALUES('alice',1,'Alice','player','2099-01-01'),('bob',2,'Bob','player','2099-01-01'),('admin',1,'Owner','admin','2099-01-01');INSERT INTO pool_active_games VALUES(1,'confidence',1),(1,'survivor',1),(1,'masters',1);INSERT INTO pool_picks VALUES(1,'BUF');`);
 const db={prepare(text){let args=[];return{bind(...v){args=v;return this},async first(){return sql.prepare(text).get(...args)||null},async all(){return{results:sql.prepare(text).all(...args)}},async run(){return{meta:{changes:Number(sql.prepare(text).run(...args).changes)}}}}},async batch(stmts){sql.exec('BEGIN');try{const result=[];for(const s of stmts)result.push(await s.run());sql.exec('COMMIT');return result}catch(e){sql.exec('ROLLBACK');throw e}}};
 const {onRequestPost, onRequestGet}=await import('../functions/new-build/api/picks.js');const oldFetch=fetch;let started=false;
 global.fetch=async()=>Response.json({season:{year:2026,type:2},week:{number:4},events:['a','b'].map((id,i)=>({id,date:'2090-10-01T00:00:00Z',status:{type:{state:started?'in':'pre'}},competitions:[{competitors:[{team:{id:String(i*2+1)}},{team:{id:String(i*2+2)}}]}]}))});
 const call=async(body,token='alice',game='Confidence')=>{const request=new Request('https://fixture/new-build/api/picks?pool=1&game='+encodeURIComponent(game)+'&player=Alice',{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token},...(body?{body:JSON.stringify({pool:1,player:'Alice',game,eventId:'a',selection:'1',points:1,...body})}:{})});const r=await (body?onRequestPost:onRequestGet)({request,env:{DB:db}});return{status:r.status,data:await r.json()}};
 try{
 assert.equal((await call({},'')).status,401);assert.equal((await call({},'bob')).status,401);assert.equal((await call({player:'Owner'})).status,403);
 assert.equal((await call({})).status,200);assert.equal((await call({eventId:'b',selection:'3'})).status,400,'Confidence ranks must be unique');assert.equal((await call({eventId:'b',selection:'3',points:2})).status,200);
 assert.equal((await call(null)).data.picks.length,2);assert.equal(sql.prepare('SELECT team FROM pool_picks').get().team,'BUF','Other games cannot overwrite NFL data');
 started=true;assert.equal((await call({selection:'2'})).status,403);started=false;
 const {onRequestPost:option}=await import('../functions/new-build/api/options.js');const req=token=>new Request('https://fixture/new-build/api/options',{method:'POST',headers:{Authorization:'Bearer '+token},body:JSON.stringify({pool:1,game:'Golf',value:'Golfer A'})});
 assert.equal((await option({request:req('alice'),env:{DB:db}})).status,403);assert.equal((await option({request:req('admin'),env:{DB:db}})).status,200);
 assert.equal((await call({eventId:'option:Golfer%20A',selection:'Golfer A'},'alice','Golf')).status,409,'No picks before commissioner sets a deadline');
 sql.prepare('INSERT INTO pool_settings VALUES(?,?,?)').run(1,'game_settings:golf:current',JSON.stringify({lockAt:'2090-10-01',settings:{pickLimit:1}}));
 assert.equal((await call({eventId:'option:Golfer%20A',selection:'Golfer A'},'alice','Golf')).status,200);
 assert.equal((await call({eventId:'option:Golfer%20A',selection:'Golfer A',action:'remove'},'alice','Golf')).status,200);
 assert.equal((await call(null,'alice','Golf')).data.picks.length,0);
 console.log('PASS game isolation, authenticated ownership, authoritative kickoff locks, confidence ranks, commissioner-only options, configured deadlines, and selection removal');
 }finally{global.fetch=oldFetch;sql.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
