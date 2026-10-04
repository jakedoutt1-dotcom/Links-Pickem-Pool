import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {onRequest} from '../functions/new-build/api/football-trivia.js';
import {ensureAccounts,digest} from '../functions/lib/commissioner-account.js';
import {QUESTIONS,weekKey,grade,speedBonus} from '../functions/lib/football-trivia.js';
const sql=new DatabaseSync(':memory:');
sql.exec("CREATE TABLE pools(id INTEGER,name TEXT);INSERT INTO pools VALUES(1,'Barnes'),(2,'Office');CREATE TABLE pool_players(pool_id INTEGER,name TEXT);INSERT INTO pool_players VALUES(1,'Jake'),(2,'Jake');CREATE TABLE pool_sessions(token TEXT,pool_id INTEGER,player_name TEXT,role TEXT,expires_at TEXT);INSERT INTO pool_sessions VALUES('one',1,'Jake','player','2099-01-01'),('two',2,'Jake','player','2099-01-01');CREATE TABLE links_player_memberships(pool_id INTEGER,player_name TEXT,email TEXT,PRIMARY KEY(pool_id,player_name));INSERT INTO links_player_memberships VALUES(1,'Jake','a@example.com'),(2,'Jake','a@example.com');");
const db={prepare(q){let args=[];return{bind(...v){args=v;return this},async first(){return sql.prepare(q).get(...args)||null},async all(){return{results:sql.prepare(q).all(...args)}},async run(){return{meta:{changes:Number(sql.prepare(q).run(...args).changes)}}}}},async batch(statements){sql.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};
await ensureAccounts(db);sql.prepare('INSERT INTO links_account_sessions VALUES(?,?,?)').run(await digest('account'),'a@example.com','2099-01-01');
async function call(body,token='one',account='account'){const r=await onRequest({env:{DB:db},request:new Request('https://test/api',{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'x-links-account':account},...(body?{body:JSON.stringify(body)}:{})})});return {status:r.status,data:await r.json()}}
assert.equal((await call(null,'bad')).status,401);assert.equal((await call(null,'one','bad')).status,200);
let j=await call({action:'start',difficulty:'hard',name:'Jake'});assert.equal(j.status,200);let a=j.data.attempt;assert.equal(a.question.choices.length,4);assert.equal('deck' in a,false);assert.equal('answers' in a.question,false);
const again=await call({action:'start',difficulty:'easy'},'two');assert.equal(again.data.attempt.id,a.id);assert.equal(again.data.attempt.difficulty,'hard');
let expected=0;
for(let i=0;i<10;i++){const saved=sql.prepare('SELECT * FROM links_football_trivia').get(),deck=JSON.parse(saved.deck),choice=deck[saved.idx].order.indexOf(0);const request={action:'answer',id:a.id,version:a.version,choice};j=await call(request);assert.equal(j.status,200);a=j.data.attempt;expected+=j.data.feedback.earned;assert.ok(j.data.feedback.bonus>=0&&j.data.feedback.bonus<=20);assert.equal((await call(request)).status,409)}
assert.equal(a.score,expected);assert.equal(a.status,'complete');assert.equal(j.data.weekly[0].score,expected);assert.equal(j.data.poolWeekly[0].score,expected);assert.equal((await call(null,'two')).data.poolWeekly[0].score,expected);
assert.equal((await call({action:'start',difficulty:'easy'})).data.attempt.status,'complete');
const saved=sql.prepare('SELECT * FROM links_football_trivia').get();const expired={...saved,idx:0,deadline:0,score:0,correct:0,misses:3};assert.equal(grade(expired,JSON.parse(saved.deck)[0].order.indexOf(0),Date.now()).status,'complete');assert.equal(grade(expired,0,Date.now()).score,0);
assert.equal(weekKey(Date.parse('2026-10-04T23:59:59Z')),'2026-09-28');assert.equal(weekKey(Date.parse('2026-10-05T00:00:00Z')),'2026-09-28');
assert.equal(weekKey(Date.parse('2026-10-05T04:59:59Z')),'2026-09-28');
assert.equal(weekKey(Date.parse('2026-10-05T05:00:00Z')),'2026-10-05');
assert.equal(weekKey(Date.parse('2026-11-02T05:59:59Z')),'2026-10-26');
assert.equal(weekKey(Date.parse('2026-11-02T06:00:00Z')),'2026-11-02');
for(const d of ['easy','medium','hard'])assert.ok(QUESTIONS.filter(q=>q.difficulty===d).length>=10);
assert.ok(QUESTIONS.every(q=>new Set(q.answers).size===4&&q.source.startsWith('https://')));
console.log('PASS trivia server grading, private answers, weekly identity across pools, no duplicate scoring, expiry, both boards and question bank');

for(const [level,cap,seconds] of [['easy',5,6],['medium',10,8],['hard',20,10]]){assert.equal(speedBonus(level,10000,10000-seconds*1000),cap);assert.equal(speedBonus(level,10000,10000-seconds*500),Math.floor(cap/2));assert.equal(speedBonus(level,10000,10000),0);assert.equal(speedBonus(level,10000,11000),0);}

// An ordinary pool login needs no separate account session.
sql.exec("INSERT INTO pool_players VALUES(1,'Guest'); INSERT INTO pool_sessions VALUES('guest',1,'Guest','player','2099-01-01');");
const guest=await call({action:'start',difficulty:'easy'},'guest','');assert.equal(guest.status,200);assert.notEqual(guest.data.attempt.id,a.id);
assert.equal((await call({action:'start',difficulty:'hard'},'guest','bad')).data.attempt.id,guest.data.attempt.id);
assert.equal((await call(null,'one','')).data.attempt.id,a.id);
sql.exec("DELETE FROM pool_players WHERE name='Guest'");assert.equal((await call(null,'guest','')).status,401);
console.log('PASS pool-only login, stale account token, linked score preservation and removed-player denial');
