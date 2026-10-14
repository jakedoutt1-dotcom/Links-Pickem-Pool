import assert from 'node:assert/strict';
import {courses,coursesFor,courseFor,create,hit,step,replayShots,windmillAt} from '../public/new-build/mini-golf-core.mjs';
// These routes were found by a deterministic shot search, then replayed through
// the authoritative physics. Each hole is completable without water penalties.
const routes=[[[-0.065, 0.5800000000000001, 0.7]], [[0, 0.5800000000000001, 1.4]], [[0.26, 0.6900000000000001, 3.5]], [[0.26, 0.6900000000000001, 3.5]], [[0, 0.5800000000000001, 1.4]], [[0, 0.5800000000000001, 1.4]], [[-0.455, 0.6900000000000001, 1.4], [-1.5566425996125564, 0.36, 2.8]], [[-0.26, 0.6900000000000001, 3.5]], [[0, 0.5800000000000001, 1.4]], [[0, 0.5800000000000001, 1.4]], [[0.26, 0.6900000000000001, 3.5]], [[-0.065, 0.5800000000000001, 0.7]], [[0, 0.5800000000000001, 1.4]], [[0.5995695811996727, 0.6312582154897973, 1.4], [0.5299761768234168, 0.36, 0.7]], [[-0.325, 0.5800000000000001, 3.5], [-1.640487375823916, 0.14, 4.8999999999999995]], [[0.26, 0.6900000000000001, 3.5]], [[-0.195, 0.6900000000000001, 4.199999999999999], [0.6213325554350192, 0.47, 0.7]], [[-0.26, 0.6900000000000001, 3.5]]];
assert.equal(courses.length,18);assert.equal(new Set(courses.map(c=>c.id)).size,18);
for(let hole=0;hole<18;hole++){
 const result=replayShots(routes[hole],hole,4);
 assert(result.done,`hole ${hole+1} must be completable`);
 assert.equal(result.strokes,routes[hole].length,`hole ${hole+1} route has no water penalty`);
 assert(result.strokes<=courses[hole].par);
 assert.deepEqual(result,replayShots(routes[hole],hole,4),'replay deterministic');
 const c=courses[hole];if(c.water){const w=c.water;const dry=Math.max(3-(w.x+w.w/2),w.x-w.w/2+3);assert(dry>=1.19,`hole ${hole+1} has a usable dry route`);assert(c.ramp.w>=1.6);}
}
for(const version of [1,2,3]){assert.equal(coursesFor(version).length,3);assert.equal(create(17,version).hole,2);assert.equal(courseFor(1,version).id,'creek');assert.equal(windmillAt(1,0,version),null);}
assert.equal(courseFor(1,2).ramp.w,.65);assert.equal(courseFor(1,3).ramp.w,1.9);
assert.equal(create(17,4).hole,17);
const closed=windmillAt(4,0,4),open=windmillAt(4,Math.PI/4/.65,4);
assert(closed.blades.some(b=>Math.abs(b.x)<.2));assert(open.blades.every(b=>Math.abs(b.x)>.8));
assert.deepEqual(closed,windmillAt(4,0,4));
let s=create(4,4);s.x=0;s.z=closed.z+.4;hit(s,0,.35,0);let bounced=false;for(let i=0;i<20;i++){step(s,1/120);bounced ||= s.bounced;}assert(bounced,'closed windmill blade bounces the ball');
s=create(4,4);s.z=closed.z+.4;hit(s,0,.35,Math.PI/4/.65);for(let i=0;i<20;i++)step(s,1/120);assert(s.z<closed.z,'open windmill admits a centre shot');
console.log('PASS all 18 holes solvable at/below par, repeatable replays, safe routes, wider ramps, timed windmills and legacy room geometry');
