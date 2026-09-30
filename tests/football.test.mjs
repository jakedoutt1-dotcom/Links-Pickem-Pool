import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {footballEntries} from '../functions/lib/football.js';
import {parseFootball,confidenceScore,survivorStatus} from '../public/new-build/football-core.mjs';
import {onRequestPost as nflSave} from '../functions/new-build/api/picks.js';
class D1{
 constructor(){this.raw=new DatabaseSync(':memory:');this.raw.exec(`CREATE TABLE pools(id INTEGER,code TEXT,name TEXT);INSERT INTO pools VALUES(1,'POOL','Test');CREATE TABLE pool_sessions(token TEXT,pool_id INTEGER,player_name TEXT,role TEXT,expires_at TEXT);INSERT INTO pool_sessions VALUES('alice',1,'Alice','player','2099-01-01'),('bob',2,'Bob','player','2099-01-01'),('admin',1,'Owner','admin','2099-01-01');CREATE TABLE pool_settings(pool_id INTEGER,key TEXT,value TEXT);CREATE TABLE pool_active_games(pool_id INTEGER,game_type TEXT,active INTEGER,is_primary INTEGER);INSERT INTO pool_active_games VALUES(1,'confidence',1,0),(1,'survivor',1,0);CREATE TABLE pool_players(pool_id INTEGER,name TEXT);INSERT INTO pool_players VALUES(1,'Alice');CREATE TABLE pool_games(pool_id INTEGER,sport TEXT,week INTEGER,event_id TEXT,game_index INTEGER);CREATE TABLE pool_week_meta(pool_id INTEGER,sport TEXT,week INTEGER,lock_time TEXT);CREATE TABLE pool_payments(pool_id INTEGER,sport TEXT,player_name TEXT,week INTEGER,paid INTEGER);INSERT INTO pool_payments VALUES(1,'nfl','Alice',1,1);CREATE TABLE pool_picks(pool_id INTEGER,sport TEXT,player_name TEXT,week INTEGER,game_index INTEGER,team TEXT,UNIQUE(pool_id,sport,player_name,week,game_index));`)}
 prepare(sql){const raw=this.raw;let args=[];return {bind(...v){args=v;return this},async first(){return raw.prepare(sql).get(...args)||null},async all(){return {results:raw.prepare(sql).all(...args)}},async run(){return {meta:raw.prepare(sql).run(...args)}}}}
 async batch(stmts){this.raw.exec('BEGIN');try{const r=[];for(const s of stmts)r.push(await s.run());this.raw.exec('COMMIT');return r}catch(e){this.raw.exec('ROLLBACK');throw e}}
}
const event=(id='a',date='2090-10-01T00:00:00Z',scores=null)=>({id,date,status:{type:{state:scores?'post':'pre',completed:!!scores}},competitions:[{competitors:[{homeAway:'away',team:{id:'1',shortDisplayName:'Bills',abbreviation:'BUF'},score:scores?.[0]??'0'},{homeAway:'home',team:{id:'2',shortDisplayName:'Dolphins',abbreviation:'MIA'},score:scores?.[1]??'0'}]}]});
test('Confidence: only final wins score; ties lose potential; Survivor loss, tie, missed week and lives',()=>{
 const games=parseFootball([event('a','2026-09-01',[20,10]),event('b','2026-09-02',[10,10]),event('c')]),picks=games.map((g,i)=>({eventId:g.id,selection:'1',points:i+1}));
 assert.deepEqual(confidenceScore(picks,games),{score:1,max:4,correct:1});
 const rows=[{period:'2026-2-1',eventId:'a',selection:'2'}];
 assert.equal(survivorStatus(rows,{1:games},1,1).status,'ELIMINATED');
 assert.equal(survivorStatus(rows,{1:games},1,1,{lives:2}).status,'ALIVE');
 assert.equal(survivorStatus([{period:'2026-2-1',eventId:'b',selection:'1'}],{1:games},1,1,{tieSurvives:true}).status,'ALIVE');
 assert.equal(survivorStatus([],{1:games.slice(0,2)},1,1).status,'ELIMINATED');
});
test('Football API: authorization, persisted picks, swaps, stale devices, kickoff, elimination and no reuse',async()=>{
 const db=new D1(),oldFetch=global.fetch;let currentWeek=1,slates={1:[event('a'),{...event('b'),competitions:[{competitors:[{team:{id:'3'}},{team:{id:'4'}}]}]}]};
 global.fetch=async input=>{const u=new URL(input),w=Number(u.searchParams.get('week')||currentWeek);return Response.json({season:{year:2026,type:2},week:{number:w},events:slates[w]||[]})};
 async function call(body=null,{token='alice',game='confidence',week=currentWeek}={}){
 const url='https://test/new-build/api/football?'+new URLSearchParams({pool:'POOL',game,week}),request=new Request(url,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token},...(body?{body:JSON.stringify({pool:'POOL',game,week,...body})}:{})}),r=await footballEntries({request,env:{DB:db}});return {status:r.status,...await r.json()};
 }
 try{
 assert.equal((await call(null,{token:'bob'})).status,401);
 const state=await call();assert.equal(state.status,200,JSON.stringify(state));assert.equal(state.period,'2026-2-1');
 const picks=[{eventId:'a',selection:'1',points:1},{eventId:'b',selection:'3',points:2}];
 let result=await call({picks,revision:''});assert.equal(result.status,200,JSON.stringify(result));
 assert.equal((await call({picks,revision:''})).status,409);
 assert.equal((await call({picks:[picks[0],{...picks[1],points:1}],revision:result.revision})).status,400);
 result=await call({picks:picks.map(p=>({...p,points:3-p.points})),revision:result.revision});assert.equal(result.status,200);
 assert.equal((await call()).picks.find(p=>p.eventId==='a').points,2);
 slates[1][0]=event('a','2020-10-01',[7,20]);
 assert.equal((await call({picks,revision:result.revision})).status,403);
 slates[1][0]=event('a');
 result=await call({picks:[{eventId:'a',selection:'1',points:0}],revision:''},{game:'survivor'});assert.equal(result.status,200,JSON.stringify(result));
 slates[1]=[event('a','2020-10-01',[7,20])];slates[2]=[event('c')];currentWeek=2;
 const eliminated=await call(null,{game:'survivor'});assert.equal(eliminated.state.status,'ELIMINATED');
 assert.equal((await call({picks:[{eventId:'c',selection:'2',points:0}],revision:''},{game:'survivor'})).status,403);
 slates[1]=[event('a','2020-10-01',[20,7])];
 assert.equal((await call({picks:[{eventId:'c',selection:'1',points:0}],revision:''},{game:'survivor'})).status,400);
 assert.equal((await call({picks:[{eventId:'c',selection:'2',points:0}],revision:''},{game:'survivor'})).status,200);
 assert.equal(db.raw.prepare('SELECT COUNT(*) AS n FROM pool_picks').get().n,0);
 }finally{global.fetch=oldFetch;db.raw.close()}
});
test('NFL saves reject anonymous, forged teams and kickoff changes; commissioner corrections stay authenticated',async()=>{
 const db=new D1(),oldFetch=fetch;let started=false;
 global.fetch=async()=>Response.json({events:[event('a',started?'2020-10-01':'2090-10-01')]});
 const call=async(token,body={})=>nflSave({request:new Request('https://test/new-build/api/picks',{method:'POST',headers:{Authorization:'Bearer '+token},body:JSON.stringify({pool:1,player:'Alice',game:"NFL Pick'em",week:1,eventId:'a',selection:'BUF',...body})}),env:{DB:db}});
 try{assert.equal((await call('')).status,403);assert.equal((await call('alice',{selection:'DAL'})).status,400);assert.equal((await call('alice')).status,200);
 started=true;assert.equal((await call('alice')).status,403);assert.equal((await call('alice',{commissionerCorrection:true})).status,403);assert.equal((await call('admin',{commissionerCorrection:true,selection:'MIA'})).status,200);
 assert.equal(db.raw.prepare('SELECT team FROM pool_picks').get().team,'MIA');
 }finally{global.fetch=oldFetch;db.raw.close()}
});
test('Squares waits for finished quarters and final overtime score, validates number permutations',async()=>{
 const source=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8'),section=source.slice(source.indexOf('function numArray('),source.indexOf('async function squaresState('));let period=1,completed=false;
 const context={getJSON:async()=>({header:{competitions:[{status:{period,type:{completed}},competitors:[{homeAway:'away',score:'33',linescores:[7,3,7,10,6].map(value=>({value}))},{homeAway:'home',score:'27',linescores:[0,14,0,13,0].map(value=>({value}))}]}]}})};
 vm.createContext(context);vm.runInContext(section+';globalThis.rules={squareLiveScore,numArray,squareWinner}',context);
 const {rules}=context;
 assert.equal((await rules.squareLiveScore('1')).q1Away,null);assert.equal((await rules.squareLiveScore('1')).finalAway,null);
 period=2;assert.equal((await rules.squareLiveScore('1')).q1Away,7);assert.equal((await rules.squareLiveScore('1')).halfAway,null);
 period=5;assert.equal((await rules.squareLiveScore('1')).finalAway,null);completed=true;assert.equal((await rules.squareLiveScore('1')).finalAway,33);
 assert.equal(rules.numArray(JSON.stringify(Array(10).fill(0))).length,0);
 const nums=Array.from({length:10},(_,i)=>i);assert.equal(rules.squareWinner([{square_index:73,player_name:'Alice'}],nums,nums,33,27).player,'Alice');
});

test('Legacy Squares ownership/deadlines and Game 33 finalization guard real database changes',async()=>{
 const source=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace('export async function onRequest','async function onRequest');
 const db=new D1();db.raw.exec(`CREATE TABLE squares_boards(id INTEGER PRIMARY KEY,pool_id INTEGER,status TEXT,kickoff TEXT,numbers_away TEXT,numbers_home TEXT);CREATE TABLE squares_claims(board_id INTEGER,square_index INTEGER,player_name TEXT,paid INTEGER,claimed_at TEXT,UNIQUE(board_id,square_index));CREATE TABLE squares_results(board_id INTEGER);INSERT INTO squares_boards VALUES(9,2,'OPEN','2090-10-01',NULL,NULL),(10,1,'OPEN','2020-10-01',NULL,NULL);INSERT INTO squares_claims VALUES(9,0,'Other',0,'2020-01-01');CREATE TABLE pool_33_week_meta(pool_id INTEGER,week INTEGER,finalized INTEGER,winners_json TEXT);CREATE TABLE pool_33_assignments(pool_id INTEGER,player_name TEXT,team TEXT);INSERT INTO pool_33_assignments VALUES(1,'Alice','BUF');`);
 const context={Response,Request,URL,console,crypto,Date,Uint32Array,TextEncoder,fetch,session:{pool_id:1,role:'admin',player_name:'Alice'}};
 vm.createContext(context);vm.runInContext(source+';ensureV2=async()=>{};auth=async()=>session;fetchNFLWeek=async()=>[];globalThis.handler=onRequest;',context);
 const call=(path,body)=>context.handler({request:new Request('https://test/api/'+path,{method:'POST',body:JSON.stringify(body)}),env:{DB:db}});
 try{
 assert.equal((await call('squares/delete',{boardId:9})).status,404);assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM squares_claims').get().n,1);
 assert.equal((await call('squares/paid',{boardId:9,squareIndex:0,paid:true})).status,200);assert.equal(db.raw.prepare('SELECT paid FROM squares_claims').get().paid,0);
 assert.equal((await call('squares/claim',{boardId:10,squareIndex:1,playerName:'Alice'})).status,409);
 assert.equal((await call('33/finalize',{week:1})).status,409,'Empty schedule cannot create a rollover');
 assert.equal((await call('33/finalize',{week:2})).status,409,'Earlier weeks settle first');
 db.raw.exec("INSERT INTO pool_33_week_meta VALUES(1,1,1,'[]')");assert.equal((await call('33/finalize',{week:1})).status,409,'Finalization is not repeated');
 }finally{db.raw.close()}
});

test('Season draw commits once; legacy Props and playoff validation reject invalid flows',async()=>{
 const db=new D1();db.raw.exec("CREATE TABLE pool_33_state(pool_id INTEGER PRIMARY KEY,draw_locked INTEGER,draw_source TEXT,draw_at TEXT);CREATE TABLE pool_33_assignments(pool_id INTEGER,player_name TEXT,team TEXT,assigned_at TEXT,source TEXT);");
 const source=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace('export async function onRequest','async function onRequest'),context={Response,Request,URL,console,crypto,Date,Uint32Array,TextEncoder,fetch,session:{pool_id:1,role:'player',player_name:'Alice'},slate:[{id:'a',away:'BUF',home:'MIA',kickoff:'2090-10-01'}]};
 vm.createContext(context);vm.runInContext(source+';ensureV2=async()=>{};auth=async()=>session;fetchNFLWeek=async()=>slate;globalThis.handler=onRequest;globalThis.draw=commitGame33Draw;',context);
 try{
 assert.equal(await context.draw(db,1,[{player:'Alice',team:'BUF'}],'manual'),true);
 assert.equal(await context.draw(db,1,[{player:'Alice',team:'MIA'}],'manual'),false);
 assert.equal(db.raw.prepare('SELECT team FROM pool_33_assignments').get().team,'BUF');
 const call=body=>context.handler({request:new Request('https://test/api/special/entry',{method:'POST',body:JSON.stringify(body)}),env:{DB:db}});
 assert.equal((await call({gameType:'props',entry:{answers:['Yes']}})).status,409);
 db.raw.prepare('INSERT INTO pool_settings VALUES(?,?,?)').run(1,'game_settings_props',JSON.stringify({deadline:'2090-10-01',propQuestions:'Winner?'}));
 assert.equal((await call({gameType:'props',entry:{answers:['']}})).status,400);
 assert.equal((await call({gameType:'playoff',entry:{week:1,picks:[]}})).status,400);
 assert.equal((await call({gameType:'confidence',entry:{week:1,picks:[{eventId:'a',team:'DAL',confidence:1}]}})).status,400);
 context.slate=[{id:'a',away:'BUF',home:'MIA',kickoff:'2020-10-01'}];
 assert.equal((await call({gameType:'confidence',entry:{week:1,picks:[{eventId:'a',team:'BUF',confidence:1}]}})).status,409);
 }finally{db.raw.close()}
});
