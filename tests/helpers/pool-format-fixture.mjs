import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {formatRequest} from '../../functions/new-build/api/pool-format.js';
const source=readFileSync(new URL('../../functions/api/[[path]].js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace('export async function onRequest','async function onRequest');
const sqlStart=source.indexOf('const sqls=['),sqlEnd=source.indexOf('\n  ];',sqlStart),schema=vm.runInNewContext(source.slice(sqlStart+'const sqls='.length,sqlEnd+4));
class D1{
 constructor(){this.raw=new DatabaseSync(':memory:');for(const sql of schema)this.raw.exec(sql);
 this.raw.exec(`INSERT INTO pools(id,code,name,admin_salt,admin_hash,created_at) VALUES(1,'POOL','Test pool','salt','hash','2026-01-01'),(2,'OTHER','Other','salt','hash','2026-01-01');INSERT INTO pool_sessions VALUES('alice',1,'Alice','player','2099-01-01'),('bob',1,'Bob','player','2099-01-01'),('admin',1,'Owner','admin','2099-01-01'),('outsider',2,'Other','admin','2099-01-01');INSERT INTO pool_players(pool_id,name,password_hash,salt) VALUES(1,'Alice','hash','salt'),(1,'Bob','hash','salt'),(1,'Owner','hash','salt');CREATE TABLE IF NOT EXISTS pool_active_games(pool_id INTEGER,game_type TEXT,is_primary INTEGER,active INTEGER,added_at TEXT,PRIMARY KEY(pool_id,game_type));INSERT INTO pool_active_games VALUES(1,'squares',1,1,'2026-01-01'),(1,'props',0,1,'2026-01-01'),(1,'playoff',0,1,'2026-01-01');`);
 }
 prepare(sql){let args=[];const raw=this.raw;return {bind(...v){args=v;return this},async first(){return raw.prepare(sql).get(...args)||null},async all(){return {results:raw.prepare(sql).all(...args)}},async run(){const r=raw.prepare(sql).run(...args);return {meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}}}}}
 async batch(stmts){this.raw.exec('BEGIN');try{const out=[];for(const s of stmts)out.push(await s.run());this.raw.exec('COMMIT');return out}catch(e){this.raw.exec('ROLLBACK');throw e}}
}
export function fixture(){
 const db=new D1(),slate=[{id:'one',eventId:'one',gameIndex:0,away:'BUF',home:'MIA',awayName:'Bills',homeName:'Dolphins',kickoff:'2090-10-01T00:00:00Z',completed:false,winner:'',awayScore:0,homeScore:0}];
 const runtime={Response,Request,URL,console,crypto,Date,Uint32Array,TextEncoder,fetch,slate,summary:null,session:null};
 vm.createContext(runtime);vm.runInContext(source+';ensureV2=async()=>{};auth=async()=>session;fetchNFLWeek=async()=>slate;getJSON=async()=>summary;globalThis.handler=onRequest;',runtime);
 async function call(game,action='state',body=null,token='alice',week=19){
  runtime.session=db.raw.prepare('SELECT * FROM pool_sessions WHERE token=?').get(token)||null;
  if(body&&action==='entry'&&body.version===undefined){const setting=db.raw.prepare('SELECT value FROM pool_settings WHERE pool_id=1 AND key=?').get('game_settings_'+game);body={version:JSON.parse(setting?.value||'{}').linksRevision||'',...body}}
  const request=new Request('https://test/new-build/api/pool-format?'+new URLSearchParams({pool:1,game,action,week}),{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token},...(body?{body:JSON.stringify({pool:1,game,action,...body})}:{})});
  const response=await formatRequest({request,env:{DB:db}},runtime.handler);return {status:response.status,...await response.json()};
 }
 return {db,runtime,call};
}
