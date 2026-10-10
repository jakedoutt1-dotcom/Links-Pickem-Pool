export const blocks=[{x:-1.85,z:2.5,w:2.3,d:.45},{x:1.85,z:-3,w:2.3,d:.45}];
export const cup={x:0,z:-11};
export function create(){return {x:0,z:11,vx:0,vz:0,strokes:0,done:false,moving:false}}
export function hit(s,angle,power){if(s.moving||s.done||!Number.isFinite(angle)||!Number.isFinite(power)||power<0||power>1)return false;const close=Math.hypot(s.x-cup.x,s.z-cup.z)<3;const launch=close?.25+power*4: .5+power*11.5;s.vx=Math.sin(angle)*launch;s.vz=-Math.cos(angle)*launch;s.moving=true;s.strokes++;return true}
export function step(s,dt){if(!s.moving)return;dt=Math.min(dt,1/60);s.bounced=false;const prev={x:s.x,z:s.z};s.x+=s.vx*dt;s.z+=s.vz*dt;
for(const [key,v,min,max] of [['x','vx',-2.83,2.83],['z','vz',-12.83,12.83]]){if(s[key]<min||s[key]>max){s[key]=Math.max(min,Math.min(max,s[key]));s.bounced=true;s[v]*=-.72}}
for(const b of blocks){const hx=b.w/2+.17,hz=b.d/2+.17;if(Math.abs(s.x-b.x)<hx&&Math.abs(s.z-b.z)<hz){if(Math.abs(prev.z-b.z)>=hz){s.z=b.z+Math.sign(prev.z-b.z)*hz;s.bounced=true;s.vz*=-.72}else{s.x=b.x+Math.sign(prev.x-b.x||1)*hx;s.bounced=true;s.vx*=-.72}}}
const speed=Math.hypot(s.vx,s.vz);
// Test the whole movement segment so a putt cannot skip over the cup between frames.
const dx=s.x-prev.x,dz=s.z-prev.z,len=dx*dx+dz*dz;
const t=len?Math.max(0,Math.min(1,((cup.x-prev.x)*dx+(cup.z-prev.z)*dz)/len)):0;
const miss=Math.hypot(prev.x+dx*t-cup.x,prev.z+dz*t-cup.z);
if(miss<.38&&speed<(miss<.23?6:4)){s.done=true;s.moving=false;s.x=cup.x;s.z=cup.z;s.vx=s.vz=0;return}
const factor=Math.max(0,1-1.1*dt/Math.max(speed,.01));s.vx*=factor;s.vz*=factor;if(speed<.09){s.moving=false;s.vx=s.vz=0}
}

export function replayShots(shots){if(!Array.isArray(shots)||shots.length>10)throw Error('Invalid shots');const s=create();for(const e of shots){if(!Array.isArray(e)||e.length!==2||s.done||!hit(s,...e))throw Error('Invalid shot');for(let i=0;i<6000&&s.moving;i++)step(s,1/120);if(s.moving)throw Error('Unfinished shot')}return s}
