import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {createGame,snap,step} from '../public/new-build/goal-line-core.mjs';
import {replayGoalLine} from '../functions/lib/goal-line-scoreboard.js';
import {BOARD_GAMES,ensureScoreboard} from '../functions/lib/party-scoreboard.js';
import {onRequest as save} from '../functions/new-build/api/goal-line-score.js';
import {onRequest as board} from '../functions/new-build/api/party-scoreboard.js';
const {db}=fixture();const s=createGame(),events=[];
while(s.phase!=='ended'){if(s.phase==='ready'){snap(s);events.push(['snap'])}else{step(s,.05);events.push(['step',.05,0,0,false])}}
assert.equal(replayGoalLine(events),0);assert.throws(()=>replayGoalLine([['snap']]));assert.throws(()=>replayGoalLine([['snap'],['step',NaN,0,0,false]]));
const body={events,run:crypto.randomUUID(),secret:'a'.repeat(64),name:'Cowboy',score:99999};
async function post(b,origin='https://test'){return save({env:{DB:db},request:new Request('https://test/new-build/api/goal-line-score',{method:'POST',headers:{Origin:origin},body:JSON.stringify(b)})})}
assert.equal((await post(body,'https://evil')).status,403);assert.equal((await post({...body,events:[]})).status,400);
assert.equal((await (await post(body)).json()).score,0);assert.equal((await post(body)).status,200);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM links_goal_line_scores').first()).n,1);
await ensureScoreboard(db);
await db.prepare("INSERT INTO links_party_results VALUES('say-what','OLD',1,'seat',999,1,?)").bind(Date.now()).run();
await db.prepare("INSERT INTO links_party_guest_names VALUES('say-what','OLD',1,'seat','Retired winner')").run();
async function get(game,period='all'){const r=await board({env:{DB:db},request:new Request('https://test/new-build/api/party-scoreboard?'+new URLSearchParams({game,period}))});return {status:r.status,...await r.json()}}
assert.equal((await get('all')).rows.length,0);assert.equal((await get('say-what')).status,400);assert.equal((await get('captain-clash')).status,400);
let j=await get('goal-line');assert.equal(j.status,200);assert.equal(j.rows[0].name,'Cowboy');assert.equal(j.rows[0].played,1);assert.equal(j.highScore,0);assert(j.solo);assert.equal(j.games.length,6);assert(!j.games.some(g=>['say-what','captain-clash'].includes(g.id)));
await db.prepare("INSERT INTO links_goal_line_scores VALUES('older','old','Old player',70,0)").run();
assert.equal((await get('goal-line','week')).highScore,0);assert.equal((await get('goal-line','year')).highScore,0);assert.equal((await get('goal-line')).highScore,70);
assert.equal(Object.keys(BOARD_GAMES).length,6);
console.log('PASS replay validation, forged score ignored, origin check, idempotent save, retired-game exclusion, current games, weekly/yearly/all-time Goal Line board');
