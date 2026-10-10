import {courses} from './mini-golf-courses.mjs';
export {courses} from './mini-golf-courses.mjs';
export const blocks=courses[0].blocks;
export function gateAt(hole,time){const g=courses[hole].gate;return g?{...g,x:g.x+Math.sin(time*1.4)*.65}:null}
export const cup={x:0,z:-11};
export function create(hole=0,rulesVersion=2){return {rulesVersion,hole:Math.max(0,Math.min(courses.length-1,Number.isInteger(hole)?hole:0)),time:0,y:0,vy:0,penalty:false,safe:[0,11],x:0,z:11,vx:0,vz:0,strokes:0,done:false,moving:false}}
export function hit(s,angle,power,phase=0){if(!Number.isFinite(phase)||phase<0||phase>1000||s.strokes>=10||s.moving||s.done||!Number.isFinite(angle)||!Number.isFinite(power)||power<0||power>1)return false;s.time=phase;s.penalty=false;s.safe=[s.x,s.z];const close=Math.hypot(s.x-cup.x,s.z-cup.z)<3;const launch=close?.25+power*4: .5+power*11.5;s.vx=Math.sin(angle)*launch;s.vz=-Math.cos(angle)*launch;s.moving=true;s.strokes++;return true}
export function step(s,dt){if(!s.moving)return;dt=Math.min(dt,1/60);s.time+=dt;s.bounced=false;const prev={x:s.x,z:s.z};s.x+=s.vx*dt;s.z+=s.vz*dt;
for(const [key,v,min,max] of [['x','vx',-2.83,2.83],['z','vz',-12.83,12.83]]){if(s[key]<min||s[key]>max){s[key]=Math.max(min,Math.min(max,s[key]));s.bounced=true;s[v]*=-.72}}
for(const b of [...courses[s.hole].blocks,...(gateAt(s.hole,s.time)?[gateAt(s.hole,s.time)]:[])]){if(s.y>.5)continue;const hx=b.w/2+.17,hz=b.d/2+.17;if(Math.abs(s.x-b.x)<hx&&Math.abs(s.z-b.z)<hz){if(Math.abs(prev.z-b.z)>=hz){s.z=b.z+Math.sign(prev.z-b.z)*hz;s.bounced=true;s.vz*=-.72}else{s.x=b.x+Math.sign(prev.x-b.x||1)*hx;s.bounced=true;s.vx*=-.72}}}
const course=courses[s.hole],ramp=course.ramp;
if(ramp&&s.y===0&&s.vz<-2&&prev.z>=ramp.z&&s.z<ramp.z&&Math.abs(s.x-ramp.x)<ramp.w/2){s.y=.02;s.vy=4.8}
if(s.y>0){s.y+=s.vy*dt;s.vy-=9.8*dt;const wind=s.rulesVersion>=2?course.wind:null;if(wind){s.vx+=wind.x*dt;s.vz+=wind.z*dt;}if(s.y<=0){s.y=0;s.vy=0;s.vx*=.8;s.vz*=.8}}
const w=course.water;if(w&&s.y===0&&Math.abs(s.x-w.x)<w.w/2&&Math.abs(s.z-w.z)<w.d/2){s.splash={x:s.x,z:s.z};[s.x,s.z]=s.safe;s.strokes=Math.min(10,s.strokes+1);s.vx=s.vz=0;s.moving=false;s.penalty=true;return}
const speed=Math.hypot(s.vx,s.vz);
// Test the whole movement segment so a putt cannot skip over the cup between frames.
const dx=s.x-prev.x,dz=s.z-prev.z,len=dx*dx+dz*dz;
const t=len?Math.max(0,Math.min(1,((cup.x-prev.x)*dx+(cup.z-prev.z)*dz)/len)):0;
const miss=Math.hypot(prev.x+dx*t-cup.x,prev.z+dz*t-cup.z);
if(s.y===0&&miss<.38&&speed<(miss<.23?6:4)){s.done=true;s.moving=false;s.x=cup.x;s.z=cup.z;s.vx=s.vz=0;return}
const factor=Math.max(0,1-(s.y>0?0:1.1)*dt/Math.max(speed,.01));s.vx*=factor;s.vz*=factor;if(speed<.09){s.moving=false;s.vx=s.vz=0}
}

export function replayShots(shots,hole=0,rulesVersion=2){if(!Array.isArray(shots)||shots.length>10)throw Error('Invalid shots');const s=create(hole,rulesVersion);for(const e of shots){if(!Array.isArray(e)||![2,3].includes(e.length)||s.done||!hit(s,...e))throw Error('Invalid shot');for(let i=0;i<6000&&s.moving;i++)step(s,1/120);if(s.moving)throw Error('Unfinished shot')}return s}
