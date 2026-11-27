export const RULES_VERSION=1,DT=1/120,BALL=.12,RIM=.235,RIM_Y=3.05,GRAVITY=9.81;
export function centralDay(now=Date.now()){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now))}
export function dailyShots(seed){
 let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;
 const random=()=>{h=(Math.imul(h,1664525)+1013904223)>>>0;return h/4294967296};
 return Array.from({length:5},(_,i)=>({x:Math.round(((i%2?1:-1)*(i===0?.15:1.2+random()*1.5))*100)/100,z:Math.round((4.3+i*.42+random()*.55)*100)/100,offset:Math.round((random()-.5)*.18*10000)/10000,label:['Warm-up','Left wing','Right wing','Deep corner','Final shot'][i]}));
}
export function validInput(input){return !!input&&typeof input==='object'&&typeof input.aim==='number'&&Number.isFinite(input.aim)&&input.aim>=-1&&input.aim<=1&&typeof input.power==='number'&&Number.isFinite(input.power)&&input.power>=0&&input.power<=1}
export function launch(shot,input){
 if(!validInput(input))throw Error('Choose an aim and power within the shooting range.');
 const distance=Math.hypot(shot.x,shot.z),speed=distance/(1.2+(distance-4)*.025),angle=Math.atan2(-shot.x,-shot.z)+shot.offset+input.aim*.65;
 return {x:shot.x,y:1.5,z:shot.z,vx:Math.sin(angle)*speed,vy:4+input.power*6,vz:Math.cos(angle)*speed,time:0,rimHit:false,boardHit:false,floorHit:false,points:0,madeAt:null,done:false,feedback:'',crossHeight:null,crossX:null};
}
export function step(s){
 if(s.done)return s;const oldY=s.y,oldX=s.x,oldZ=s.z;s.time+=DT;s.vy-=GRAVITY*DT;s.x+=s.vx*DT;s.y+=s.vy*DT;s.z+=s.vz*DT;
 if(s.crossHeight===null&&oldZ>0&&s.z<=0){const f=oldZ/(oldZ-s.z);s.crossHeight=oldY+(s.y-oldY)*f;s.crossX=oldX+(s.x-oldX)*f;}
 // Glass backboard: a sphere hits the face rather than passing through it.
 const boardZ=-.54+BALL;
 if(s.vz<0&&oldZ>=boardZ&&s.z<boardZ&&Math.abs(s.x)<.9+BALL&&s.y>3.08-BALL&&s.y<4.15+BALL){s.z=boardZ;s.vz=-s.vz*.7;s.vx*=.93;s.boardHit=true;}
 // Closest point on the rim torus, with a fixed simulation step on both clients and server.
 const radial=Math.hypot(s.x,s.z),near=radial>1e-8?RIM/radial:0,cx=s.x*near,cz=s.z*near,dx=s.x-cx,dy=s.y-RIM_Y,dz=s.z-cz,dist=Math.hypot(dx,dy,dz),contact=BALL+.017;
 if(s.madeAt===null&&dist<contact&&dist>1e-7){const nx=dx/dist,ny=dy/dist,nz=dz/dist,v=s.vx*nx+s.vy*ny+s.vz*nz;s.x=cx+nx*contact;s.y=RIM_Y+ny*contact;s.z=cz+nz*contact;if(v<0){s.vx-=1.63*v*nx;s.vy-=1.63*v*ny;s.vz-=1.63*v*nz;}s.rimHit=true;}
 if(s.madeAt===null&&oldY>RIM_Y&&s.y<=RIM_Y&&s.vy<0){const mix=(oldY-RIM_Y)/(oldY-s.y),x=oldX+(s.x-oldX)*mix,z=oldZ+(s.z-oldZ)*mix;if(Math.hypot(x,z)<RIM-BALL+.005){s.points=s.rimHit||s.boardHit?10:20;s.madeAt=s.time;s.feedback=s.points===20?'SWISH! +20':s.boardHit?'BANK SHOT! +10':'BUCKET! +10';}}
 if(s.y<BALL){s.y=BALL;s.vy=Math.abs(s.vy)*.58;s.vx*=.76;s.vz*=.76;s.floorHit=true;}
 if(s.time>=4.8||(s.floorHit&&s.time>2.6)||(s.madeAt!==null&&s.time>s.madeAt+1.25)||Math.abs(s.x)>10||s.z>14||s.z< -7){s.done=true;if(!s.points)s.feedback=s.rimHit?'OFF THE RIM':s.boardHit?'OFF THE GLASS':s.crossX!==null&&Math.abs(s.crossX)>.35?(s.crossX<0?'WIDE LEFT':'WIDE RIGHT'):s.crossHeight!==null?(s.crossHeight<RIM_Y?'TOO SHORT':'TOO STRONG'):'JUST MISSED';}
 return s;
}
export function simulate(shot,input,{trace=false}={}){const s=launch(shot,input),frames=[];while(!s.done){step(s);if(trace)frames.push({x:s.x,y:s.y,z:s.z,time:s.time})}return {points:s.points,made:s.points>0,swish:s.points===20,bank:s.boardHit&&s.points>0,feedback:s.feedback,duration:s.time,...(trace?{frames}:{})};}
export function weekStart(day){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d.toISOString().slice(0,10)}
export function streaks(days,today){const set=new Set(days),previous=d=>new Date(Date.parse(d+'T12:00Z')-86400000).toISOString().slice(0,10);let cursor=set.has(today)?today:previous(today),current=0;while(set.has(cursor)){current++;cursor=previous(cursor)}let best=0;for(const day of set){if(set.has(new Date(Date.parse(day+'T12:00Z')+86400000).toISOString().slice(0,10)))continue;let n=0,c=day;while(set.has(c)){n++;c=previous(c)}best=Math.max(best,n)}return {current,best};}
