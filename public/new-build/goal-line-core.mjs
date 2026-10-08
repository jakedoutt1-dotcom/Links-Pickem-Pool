export const GOAL=115,START=475;
export function createGame(random=Math.random){return {phase:'ready',time:90,score:0,drive:1,down:1,line:START,random,players:[],defenders:[],ball:null,carrier:0,stamina:1,message:'Four downs. Find the end zone.'}}
export function snap(s){if(s.phase!=='ready')return;s.players=[{x:240,y:s.line,n:7},{x:105,y:s.line-10,n:11},{x:375,y:s.line-10,n:88}];s.defenders=Array.from({length:4+Math.min(3,s.drive-1)},(_,i)=>({x:70+(i%4)*112,y:Math.max(GOAL+38,s.line-95-(i>=4?80:0)),n:20+i}));s.carrier=0;s.ball=null;s.passed=false;s.stamina=1;s.phase='play';s.message='Run or pass to A / B';}
function endPlay(s,text,incomplete=false){s.ball=null;if(!incomplete)s.line=Math.max(GOAL+12,Math.min(560,s.players[s.carrier].y));if(s.down>=4){s.phase='ended';s.message=text+' · Turnover on downs';return}s.down++;s.phase='ready';s.message=text+' · Next down';}
export function pass(s,target){if(s.phase!=='play'||s.ball||s.carrier!==0||s.passed||![1,2].includes(target))return false;const p=s.players[0],r=s.players[target];s.ball={x:p.x,y:p.y,target,tx:r.x,ty:Math.max(GOAL+8,r.y-30)};s.passed=true;return true;}
export function step(s,dt,input={x:0,y:0,sprint:false}){if(s.phase!=='play')return;dt=Math.max(0,Math.min(.05,dt));s.time=Math.max(0,s.time-dt);if(s.time===0){s.phase='ended';s.message='Time expired';return}
 const p=s.players[s.carrier],length=Math.hypot(input.x,input.y),boost=input.sprint&&s.stamina>0;s.stamina=Math.max(0,Math.min(1,s.stamina+(boost?-.6:.22)*dt));const speed=boost?150:105;
 if(!s.ball&&length){p.x=Math.max(52,Math.min(428,p.x+input.x/Math.max(1,length)*speed*dt));p.y=Math.max(GOAL-5,Math.min(565,p.y+input.y/Math.max(1,length)*speed*dt))}
 for(let i=1;i<3;i++){if(i===s.carrier&&!s.ball)continue;const r=s.players[i];r.y=Math.max(GOAL+10,r.y-68*dt);r.x=Math.max(65,Math.min(415,r.x+(i===1?-1:1)*12*dt))}
 const focus=s.ball||p;for(const d of s.defenders){const dx=focus.x-d.x,dy=focus.y-d.y,len=Math.hypot(dx,dy)||1,v=62+Math.min(28,(s.drive-1)*6);d.x+=dx/len*v*dt;d.y+=dy/len*v*dt;}
 if(s.ball){const ball=s.ball,dx=ball.tx-ball.x,dy=ball.ty-ball.y,len=Math.hypot(dx,dy),travel=350*dt;ball.x+=dx/(len||1)*Math.min(travel,len);ball.y+=dy/(len||1)*Math.min(travel,len);
 if(s.defenders.some(d=>Math.hypot(d.x-ball.x,d.y-ball.y)<12)){s.phase='ended';s.ball=null;s.message='Intercepted!';return}
 if(len<=travel){const r=s.players[ball.target];if(Math.hypot(r.x-ball.x,r.y-ball.y)<55){s.carrier=ball.target;r.x=ball.x;r.y=ball.y;s.ball=null;s.message='Caught! Run for the end zone.'}else{endPlay(s,'Incomplete pass',true);return}}}
 else if(p.y<=GOAL){s.score+=7;s.drive++;s.down=1;s.line=START;s.phase='ready';s.message='TOUCHDOWN! +7 · Defense gets faster';return}
 else if(s.defenders.some(d=>Math.hypot(d.x-p.x,d.y-p.y)<20)){endPlay(s,'Tackled');}
}
