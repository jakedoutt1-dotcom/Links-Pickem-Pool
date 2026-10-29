// Fixed-step rules shared by the browser and server replay. Scores are never accepted from clients.
export const STEP=50,DURATION=60,MAX_STEPS=DURATION*1000/STEP;
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function random(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
export function course(seed){const rng=random(seed),out=[];let at=4;while(at<59){out.push({id:out.length,at,lane:Math.floor(rng()*3)-1,type:['chair','fan','dancer'][Math.floor(rng()*3)],phase:rng()*6.28});at+=at<20?2.5:at<40?2:1.65}return out}
export function createGame(seed){return {seed,obstacles:course(seed),step:0,x:0,velocity:0,tilt:0,spin:0,score:0,spills:0,food:3,deliveries:0,dodges:0,combo:0,lastHit:-100,lastSave:-100,lastTilt:0,savedWobble:false,ended:false,events:[]}}
export function obstacleX(o,time){return o.lane*.68+(o.type==='dancer'?Math.sin(time*2.6+o.phase)*.23:o.type==='fan'?Math.sin(time*1.8+o.phase)*.08:0)}
export function stepGame(s,input){
 if(s.ended)return s;const target=clamp(input/100,-1,1),dt=STEP/1000,time=(s.step+1)*dt; s.events=[];
 const prior=s.velocity;s.velocity=clamp((target-s.x)*5,-1.65,1.65);s.x=clamp(s.x+s.velocity*dt,-1,1);
 s.spin+=(-s.tilt*8-s.spin*2.8-s.velocity*2+Math.sin(time*2.4)*.11)*dt-(s.velocity-prior)*1.5;s.tilt+=s.spin*dt;
 const lose=reason=>{if(time-s.lastHit<1.1)return;s.lastHit=time;s.savedWobble=false;s.spills++;s.food=Math.max(0,s.food-1);s.combo=0;s.tilt*=.35;s.spin*=.2;s.events.push({type:'spill',reason});if(s.spills>=5){s.ended=true;s.events.push({type:'end'})}};
 if(Math.abs(s.tilt)>.6)s.savedWobble=true;
 if(Math.abs(s.tilt)>1.05)lose('wobble');else if(s.savedWobble&&Math.abs(s.tilt)<.15&&time-s.lastHit>1.2){s.savedWobble=false;if(time-s.lastSave>=4){s.lastSave=time;s.score+=25;s.events.push({type:'save'})}}
 for(const o of s.obstacles){if(o.at>(s.step*dt)&&o.at<=time){if(Math.abs(s.x-obstacleX(o,time))<(o.type==='chair'?.32:.29))lose(o.type);else{s.dodges++;s.combo++;s.score+=40+Math.min(5,s.combo)*10;s.events.push({type:'dodge'})}}}
 if(Math.floor(time/12)>Math.floor(s.step*dt/12)&&!s.ended){s.deliveries++;const points=s.food*150;s.score+=points;s.food=3;s.events.push({type:'delivery',points})}
 s.step++;if(s.step>=MAX_STEPS){s.ended=true;s.events.push({type:'end'})}return s;
}
export function result(s){return {score:s.score,deliveries:s.deliveries,dodges:s.dodges,spills:s.spills,steps:s.step}}
export function replay(seed,inputs){if(!Array.isArray(inputs)||inputs.length>MAX_STEPS||!inputs.length)throw Error('Invalid round inputs.');const s=createGame(seed);for(const n of inputs){if(!Number.isInteger(n)||n < -100||n>100||s.ended)throw Error('Invalid round input.');stepGame(s,n)}if(!s.ended)throw Error('Finish the round before saving.');return result(s)}
