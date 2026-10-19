import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {liveWorkbookBoard} from '../functions/lib/workbook-live-scores.js';
import {weekStandings} from '../public/new-build/workbook-board-model.mjs';
import {onRequest} from '../functions/new-build/api/workbook-board.js';
const board={title:'Barnes Pool Results',season:2025,weeks:[{number:6,label:'Week 6',finalTotal:null,games:[{away:'Patriots',home:'Seahawks',winner:'',awayScore:null,homeScore:null},{away:'Bills',home:'Jets',winner:'',awayScore:null,homeScore:null}],players:[{name:'Alex',picks:['Patriots','Jets'],tie:43},{name:'Sam',picks:['Patriots','Jets'],tie:48}]}]};
const event=(away,home,a,h,completed)=>({status:{type:{completed}},competitions:[{competitors:[{homeAway:'away',team:{abbreviation:away},score:String(a)},{homeAway:'home',team:{abbreviation:home},score:String(h)}]}]});
let events=[event('NE','SEA',24,20,true),event('BUF','NYJ',10,14,false)],available=true,lastUrl;
const oldFetch=globalThis.fetch;globalThis.fetch=async url=>{lastUrl=String(url);return available?Response.json({events}):new Response('',{status:503});};
try{
 const raw=new DatabaseSync(':memory:'),db={prepare(sql){let args=[];return {bind(...values){args=values;return this;},async run(){return raw.prepare(sql).run(...args);},async first(){return raw.prepare(sql).get(...args)||null;}};}};
 const env={DB:db,ASSETS:{async fetch(){return Response.json(board);}}};
 const request=()=>onRequest({env,request:new Request('https://test/new-build/api/workbook-board?week=6')});
 let response=await request(),result=await response.json();
 assert.match(lastUrl,/dates=2025/);assert.match(lastUrl,/week=6/);assert.equal(result.weeks[0].games[0].winner,'Patriots');assert.equal(result.weeks[0].games[1].winner,'');assert.equal(weekStandings(result.weeks[0]).rows.some(p=>p.winner),false);
 assert.deepEqual(result.weeks[0].players,board.weeks[0].players);
 raw.prepare('INSERT INTO links_workbook_public_boards(id,payload,updated_at) VALUES(?,?,?)').run('nfl-crew',JSON.stringify(board),'2026-10-19T12:00:00Z');
 // Results change on the site without a new workbook upload.
 events[1]=event('BUF','NYJ',20,24,true);result=await (await request()).json();
 assert.equal(result.updatedAt,'2026-10-19T12:00:00Z','Automatic results need no new upload'); assert.equal(result.weeks[0].finalTotal,44);assert.equal(weekStandings(result.weeks[0]).rows.find(p=>p.winner).name,'Alex');
 assert.deepEqual(board.weeks[0].games.map(g=>g.winner),['',''],'Uploaded source is never mutated');
 available=false;result=await (await request()).json();assert.equal(result.scores.status,'cached');assert.equal(result.weeks[0].games[1].winner,'Jets');
 available=true;events[1]=event('BUF','NYJ',24,24,true);result=await (await request()).json();assert.equal(result.weeks[0].games[1].winner,'TIE');assert.equal(weekStandings(result.weeks[0]).rows[0].correct,1);
 events=[event('NE','SEA',24,20,true),event('NE','SEA',24,20,true)];result=await liveWorkbookBoard(board,6);assert.equal(result.scores.status,'unavailable','Ambiguous matches cannot grade picks');
 const playoffs=structuredClone(board);playoffs.weeks[0].number=22;events=[event('NE','SEA',24,20,true)];await liveWorkbookBoard(playoffs,22);assert.match(lastUrl,/seasontype=3&week=5/);
 raw.close();console.log('PASS workbook autonomous scores: correct season/week, live/final/ties, winner/tiebreaker, immutable picks, provider outage cache and playoffs.');
}finally{globalThis.fetch=oldFetch;}
