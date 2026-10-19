import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile} from 'node:fs/promises';
import {normalizeBoard,weekStandings} from '../public/new-build/workbook-board-model.mjs';
import {onRequest} from '../functions/new-build/api/workbook-board.js';
const raw=new DatabaseSync(':memory:'),db={prepare(sql){let args=[];return {bind(...a){args=a;return this;},async run(){return raw.prepare(sql).run(...args);},async first(){return raw.prepare(sql).get(...args)||null;}};}};
const seed=JSON.parse(await readFile('public/new-build/assets/workbook/nfl-crew-board.json','utf8'));
const privateKey=crypto.randomUUID().replaceAll('-','').repeat(2),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(privateKey))),n=>n.toString(16).padStart(2,'0')).join('');
const env={DB:db,WORKBOOK_NFL_CREW_PUBLISH_HASH:hash,ASSETS:{async fetch(){return Response.json(seed);}}};
const call=(data,key)=>onRequest({env,request:new Request('https://board.test/new-build/api/workbook-board',{method:data?'POST':'GET',headers:{'Content-Type':'application/json',...(key?{'X-Workbook-Publish-Key':key}:{})},...(data?{body:JSON.stringify(data)}:{})})});
try{
 const normalized=normalizeBoard(seed);assert.equal(normalized.weeks.length,22);assert.equal(normalized.weeks[0].players.length,14);
 assert.equal(weekStandings(normalized.weeks[0]).rows[0].correct,13);
 const week={number:1,label:'Week 1',games:[{away:'A',home:'B',winner:'A'},{away:'C',home:'D',winner:'D'}],players:[{name:'One',picks:['A','D'],tie:40},{name:'Two',picks:['A','D'],tie:44},{name:'Three',picks:['B','C'],tie:42}],finalTotal:43};
 let result=weekStandings(week);assert.equal(result.rows.find(p=>p.winner).name,'Two');
 week.finalTotal=null;result=weekStandings(week);assert.equal(result.needTie,true);assert.equal(result.rows.some(p=>p.winner),false);assert.equal(result.rows[0].rank,result.rows[1].rank);
 week.finalTotal=42;result=weekStandings(week);assert.equal(result.rows.filter(p=>p.winner).length,2,'Equal tiebreakers share the win');
 week.games[1].winner='';result=weekStandings(week);assert.equal(result.final,false);assert.equal(result.rows.some(p=>p.winner),false);
 week.games[0].winner='TIE';assert.equal(weekStandings(week).rows[0].correct,0,'A tied NFL game does not award points');
 assert.equal((await call()).status,200,'Public view requires no password');
 assert.equal((await call(seed)).status,401);assert.equal((await call(seed,'a'.repeat(64))).status,401);
 const published=await call({...seed,publisherKey:'never-store-this',password:'never-store-this'},privateKey);assert.equal(published.status,200);assert.match((await published.json()).url,/barnes-pool-results.html$/);
 const publicResponse=await call(),publicData=await publicResponse.json();assert.equal(publicData.publisherKey,undefined);assert.equal(publicData.password,undefined);assert.ok(publicData.updatedAt);assert.match(publicResponse.headers.get('Cache-Control'),/no-store/);
 const bad=structuredClone(seed);bad.weeks[0].players[0].picks[0]='Not a team';assert.equal((await call(bad,privateKey)).status,400);assert.equal((await call()).status,200,'Rejected update does not damage the published board');
 const injected=structuredClone(seed);injected.weeks[0].players[0].name='<script>';assert.equal((await call(injected,privateKey)).status,400);
 assert.equal(raw.prepare('SELECT COUNT(*) n FROM links_workbook_public_boards').get().n,1,'Refreshes replace the same board');
 console.log('PASS workbook board: 22 rounds, real picks, winners/ties/unfinished games, public reads, private publishing, failed-update preservation and no credential disclosure.');
}finally{raw.close();}
