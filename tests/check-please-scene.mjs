import assert from 'node:assert/strict';
import {project,boothPositions} from '../public/new-build/check-please-scene.mjs';
const near=project(2,1),far=project(2,12);assert(near.scale>far.scale);assert(near.y>far.y);assert(near.x>far.x);assert(project(2,1,1).x<near.x);
const before=boothPositions(0),after=boothPositions(.3);assert(before.length>=10);assert(before.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.scale>0));const a=before.find(p=>p.side===-1&&Math.abs(p.depth-4.2)<.001),b=after.find(p=>p.side===-1&&Math.abs(p.depth-3.66)<.001);assert(b.y>a.y);assert(b.x<a.x);assert(b.scale>a.scale);for(let t=0;t<60;t+=.1){const positions=boothPositions(t);assert(positions.length>=12);assert(positions.every(p=>p.depth>=-.7))}
console.log('PASS venue projection: booths grow, move forward and outward, respond to steering, and recycle continuously through a complete shift.');
