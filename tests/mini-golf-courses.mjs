import assert from 'node:assert/strict';import {create,hit,step,gateAt,replayShots,courses} from '../public/new-build/mini-golf-core.mjs';
let s=create(1);s.x=0;s.z=2;hit(s,0,.4);for(let i=0;i<1000&&s.moving;i++)step(s,1/120);assert(s.penalty);assert.equal(s.strokes,2);assert.equal(s.z,2);
s=create(1);s.x=-1.1;s.z=2.6;hit(s,0,.6);let airborne=false;for(let i=0;i<2000&&s.moving;i++){step(s,1/120);airborne ||= s.y>0}assert(airborne);assert(!s.penalty);assert(s.z< -1.5);
s=create(2);s.x=-2.5;s.z=2;hit(s,0,.3);for(let i=0;i<2000&&s.moving;i++)step(s,1/120);assert(!s.penalty,'dry path avoids water');assert.notEqual(gateAt(1,0).x,gateAt(1,1).x);const log=[[.3,.4,.7],[0,.3,1.5]];assert.deepEqual(replayShots(log,1),replayShots(log,1));console.log('PASS water penalty, ramp flight, dry route, moving gate and deterministic replay');

const calm=create(0),breezy=create(2);for(const ball of [calm,breezy]){ball.y=1;ball.vy=0;ball.vz=-2;ball.moving=true}step(calm,1/120);step(breezy,1/120);assert.equal(calm.vx,0);assert(breezy.vx>0,'crosswind deflects airborne shots');const ground=create(2);hit(ground,0,.2);step(ground,1/120);assert.equal(ground.vx,0,'crosswind leaves ground putts predictable');assert.equal(create(999).hole,courses.length-1);console.log('PASS airborne wind, calm ground putts and data-driven hole bounds');

const legacy=create(2,1);legacy.y=1;legacy.vz=-2;legacy.moving=true;step(legacy,1/120);assert.equal(legacy.vx,0);console.log('PASS existing rooms keep their original calm-air rules');
