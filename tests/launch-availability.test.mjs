import test from 'node:test';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import {comingSoonPage} from '../functions/lib/game-availability.js';import {invitedPlayerAccess} from '../functions/lib/invite-access.js';import {CREATABLE_GAMES} from '../functions/lib/commissioner-account.js';
test('Available pool pages, demos, and commissioner creation stay aligned',()=>{for(const p of ['nfl','college','squares','playoff.html','game-demo?game=playoff','march-madness','game-demo?game=squares','march-madness.html?demo=1','game-demo?game=nfl','game-demo.html?game=college','golf.html','nhl.html','nascar.html','survivor.html','confidence.html','props.html','game-demo?game=survivor','game-demo?game=confidence','game-demo?game=props','event-pool-demo?game=golf','event-pool-demo?game=nascar'])assert.equal(comingSoonPage(new URL('https://test/new-build/'+p)),false,p);for(const p of ['fantasy.html','dynasty.html','custom.html'])assert.equal(comingSoonPage(new URL('https://test/new-build/'+p)),true,p);assert.deepEqual([...CREATABLE_GAMES],['nfl','college','squares','march','nba','nhl','cfp','mlb','homerun','masters','nascar','playoff','survivor','confidence','props']);assert.equal(comingSoonPage(new URL('https://test/new-build/api/march')),false)});
test('accepted invites receive active NFL and college weeks without changing other players',()=>{const sql=new DatabaseSync(':memory:');sql.exec("CREATE TABLE pool_payments(pool_id INTEGER,sport TEXT,player_name TEXT,week INTEGER,paid INTEGER,PRIMARY KEY(pool_id,sport,player_name,week));INSERT INTO pool_payments VALUES(1,'nfl','Existing',1,0)");const db={prepare(q){return{bind(...a){return()=>sql.prepare(q).run(...a)}}}};for(const run of invitedPlayerAccess(db,1,'New Player'))run();assert.equal(sql.prepare("SELECT COUNT(*) n FROM pool_payments WHERE player_name='New Player' AND paid=1").get().n,37);assert.equal(sql.prepare("SELECT paid FROM pool_payments WHERE player_name='Existing'").get().paid,0);sql.close()});

test('homepage links to the catalog offering every available pool game',async()=>{
 const {readFileSync}=await import('node:fs');
 const home=readFileSync(new URL('../public/new-build/index.html',import.meta.url),'utf8');
 assert.match(home,/href="\.\/pool-demos\.html"/);
 const catalog=readFileSync(new URL('../public/new-build/pool-demos.html',import.meta.url),'utf8');
 const buttons=new Map([...catalog.matchAll(/<button data-game="([^"]+)"([^>]*)>([^<]+)<\/button>/g)].map(([,game,attributes,label])=>[game,{attributes,label}]));
 const available=[...CREATABLE_GAMES].map(game=>game==='masters'?'golf':game);
 for(const game of available){
  const button=buttons.get(game);
  assert.ok(button,'Missing demo for '+game);
  assert.doesNotMatch(button.attributes,/disabled/,game);
  assert.match(button.label,/TRY DEMO/,game);
 }
 for(const [game,button] of buttons){
  if(available.includes(game))continue;
  assert.match(button.attributes,/disabled/,game);
  assert.equal(button.label,'COMING SOON',game);
 }
});
test('middleware returns Coming Soon for paused direct links',async()=>{const {onRequest}=await import('../functions/_middleware.js');const response=await onRequest({request:new Request('https://test/new-build/fantasy.html')});assert.equal(response.status,200);assert.match(await response.text(),/Coming Soon/)});

test('Goal Line direct links are paused while its game files and other arcade games remain available',async()=>{const {onRequest}=await import('../functions/_middleware.js');for(const path of ['goal-line','goal-line.html','goal-line/','goal-line.html?demo=1']){const response=await onRequest({request:new Request('https://test/new-build/'+path)});const html=await response.text();assert.match(html,/Coming Soon/);assert(!html.includes('goal-line.mjs'));}for(const path of ['mini-golf.html','football-trivia.html','trivia-night.html','api/goal-line-score'])assert.equal(comingSoonPage(new URL('https://test/new-build/'+path)),false,path)});


test('New pool games are reachable from the locker and offered in commissioner setup',async()=>{
 const {readFileSync}=await import('node:fs');
 const locker=readFileSync(new URL('../public/new-build/control-center.js',import.meta.url),'utf8');
 const home=readFileSync(new URL('../public/new-build/pool-demos.html',import.meta.url),'utf8');
 for(const game of ['survivor','confidence','props']){
  assert.ok(CREATABLE_GAMES.has(game));
  assert.ok(locker.includes(game+":'"+game+".html'"));
  assert.match(home,new RegExp('<button data-game="'+game+'">TRY DEMO'));
 }
 const room=readFileSync(new URL('../public/new-build/control-center.html',import.meta.url),'utf8');
 assert.match(room,/href="\.\/football-trivia.html">Two-Minute Drill · Always free/);
});
