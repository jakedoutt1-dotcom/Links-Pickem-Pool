import assert from 'node:assert/strict';
import {create,hit,step} from '../public/new-build/mini-golf-core.mjs';
let s=create();assert(hit(s,0,.45));assert(!hit(s,0,.45));for(let i=0;i<3000;i++)step(s,1/120);assert(!s.moving);assert.equal(s.strokes,1);assert(s.z<11);
s=create();s.x=2.8;hit(s,Math.PI/2,.5);step(s,1/60);assert(s.vx<0);assert(s.x<=2.83);
s=create();s.z=-10.9;s.moving=true;s.vz=-.2;step(s,1/120);assert(s.done);assert(!hit(s,0,.5));
s=create();s.x=-1.8;s.z=3;s.moving=true;s.vz=-3;for(let i=0;i<20;i++)step(s,1/120);assert(s.vz>0);console.log('PASS stroke lock, friction, borders, obstacle bounce and cup capture');
