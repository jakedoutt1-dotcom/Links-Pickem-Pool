import assert from 'node:assert/strict';
import {createGame,snap,step,pass,GOAL} from '../public/new-build/goal-line-core.mjs';
const s=createGame();snap(s);assert.equal(s.phase,'play');assert.equal(s.players.length,3);const positions=JSON.stringify(s.defenders);assert.equal(pass(s,1),false);for(let i=0;i<61;i++)step(s,.05);assert.equal(s.time,90);assert.equal(JSON.stringify(s.defenders),positions);s.defenders=[];const before=s.players[0].y;step(s,.05,{x:0,y:-1,sprint:true});assert(s.players[0].y<before);assert(s.stamina<1);assert(s.time<90);
s.players[0].y=GOAL;step(s,.01);assert.equal(s.score,7);assert.equal(s.phase,'ready');assert.equal(s.drive,2);snap(s);s.readyIn=0;assert.equal(s.defenders.length,5);
for(let down=1;down<=4;down++){s.defenders=[{...s.players[0]}];step(s,.01);assert.equal(s.phase,down===4?'ended':'ready');if(down<4){snap(s);s.readyIn=0}}
const catchGame=createGame();snap(catchGame);catchGame.readyIn=0;catchGame.defenders=[];assert(pass(catchGame,1));assert(!pass(catchGame,2));for(let i=0;i<60&&catchGame.ball;i++)step(catchGame,.02);assert.equal(catchGame.carrier,1);assert.equal(catchGame.phase,'play');assert(!pass(catchGame,2));
const interception=createGame();snap(interception);interception.readyIn=0;pass(interception,1);interception.defenders=[{x:interception.ball.x,y:interception.ball.y}];step(interception,.001);assert.equal(interception.phase,'ended');assert.match(interception.message,/Intercepted/);
const timeout=createGame();snap(timeout);timeout.readyIn=0;timeout.time=.001;step(timeout,.01);assert.equal(timeout.phase,'ended');assert.equal(timeout.score,0);
console.log('PASS movement, sprint energy, touchdown, progressive defense, four-down turnover, catch, one-pass limit, interception and timeout');
