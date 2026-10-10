import assert from 'node:assert/strict';
import {create,hit,step} from '../public/new-build/mini-golf-core.mjs';
let s=create();assert(hit(s,0,.45));assert(!hit(s,0,.45));for(let i=0;i<3000;i++)step(s,1/120);assert(!s.moving);assert.equal(s.strokes,1);assert(s.z<11);
s=create();s.x=2.8;hit(s,Math.PI/2,.5);step(s,1/60);assert(s.vx<0);assert(s.x<=2.83);
s=create();s.z=-10.9;s.moving=true;s.vz=-.2;step(s,1/120);assert(s.done);assert(!hit(s,0,.5));
s=create();s.x=-1.8;s.z=3;s.moving=true;s.vz=-3;for(let i=0;i<20;i++)step(s,1/120);assert(s.vz>0);console.log('PASS stroke lock, friction, borders, obstacle bounce and cup capture');
s=create();s.z=-10;hit(s,0,.35);for(let i=0;i<600;i++)step(s,1/120);assert(s.done,'one-metre putt drops');assert.equal(s.strokes,1);
s=create();s.z=-10;s.x=.5;hit(s,0,.35);for(let i=0;i<600;i++)step(s,1/120);assert(!s.done,'near miss does not score');
s=create();s.z=-10.95;s.moving=true;s.vz=-8;step(s,1/60);assert(!s.done,'overpowered shot rolls across cup');
s=create();s.z=-10.98;s.moving=true;s.vz=-3.5;step(s,1/60);assert(s.done,'centered moderate-speed putt drops');console.log('PASS close putts, near misses and cup speed limits');

s=create();s.x=.34;s.z=-10.9;s.moving=true;s.vz=-2;step(s,1/120);assert(s.done,'edge putt is forgiving');
s=create();s.x=2.82;s.moving=true;s.vx=3;step(s,1/60);assert(s.bounced,'collision reports bounce for sound');console.log('PASS forgiving cup and bounce event');
