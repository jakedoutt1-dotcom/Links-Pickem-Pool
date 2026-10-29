import {clamp,obstacleX} from './check-please-engine.mjs';
import {createActorAnimator} from './check-please-actors.mjs';

// World-space scenery advances toward the camera. The distant bar stays behind
// the moving floor, booths and lamps; it is not a zoomed gameplay screenshot.
export function project(lateral,depth,camera=0){const scale=1/(1+Math.max(-.7,depth)*.65);return {x:240+(lateral-camera*.7)*225*scale,y:210+385*scale,scale}}
export function boothPositions(time,camera=0){const phase=time*1.8%3.7,out=[];for(let i=0;i<8;i++){const depth=.5+i*3.7-phase;if(depth<-.7)continue;for(const side of [-1,1])out.push({...project(side*2.1,depth,camera),depth,side})}return out.sort((a,b)=>b.depth-a.depth)}
const assets={fan:'check-please-fan-v2.webp',dancer:'check-please-dancer-v2.webp',chair:'check-please-chair-v2.webp',booth:'check-please-booth-v2.webp',tray:'check-please-tray-v2.webp',wings:'check-please-wings-v2.webp',nachos:'check-please-nachos-v2.webp',soda:'check-please-soda-v2.webp',floor:'check-please-floor-v2.webp',venue:'check-please-venue-v1.webp'};
function image(file){return new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src='./assets/'+file})}
export function createSceneRenderer(ctx,{reducedMotion=false}={}){
 const sprites={},actors={},ready=Promise.all(Object.entries(assets).map(async([name,file])=>{sprites[name]=await image(file)})).then(()=>{for(const name of ['fan','dancer'])if(sprites[name])actors[name]=createActorAnimator(sprites[name],name)});
 function polygon(points,fill){ctx.fillStyle=fill;ctx.beginPath();for(const [i,p]of points.entries())i?ctx.lineTo(...p):ctx.moveTo(...p);ctx.closePath();ctx.fill()}
 function ellipse(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
 function drawSprite(name,x,bottom,width,{flip=false,rotation=0,squash=1}={}){const img=sprites[name];if(!img)return false;const h=width*img.naturalHeight/img.naturalWidth;ctx.save();ctx.translate(x,bottom);ctx.rotate(rotation);ctx.scale(flip?-1:1,squash);ctx.drawImage(img,-width/2,-h,width,h);ctx.restore();return true}
 function world(game,time){
  ctx.clearRect(0,0,480,720);ctx.save();const bob=reducedMotion?0:Math.sin(time*7)*1.2;ctx.translate(0,bob);
  if(sprites.venue)ctx.drawImage(sprites.venue,-12-game.x*5,-8,504,740);else{ctx.fillStyle='#172c40';ctx.fillRect(0,0,480,720)}
  // The side architecture also advances in depth. Preserve the distant bar,
  // then project the venue's lower strips toward and past the camera.
  if(sprites.venue){const img=sprites.venue,travel=time*1.8%14;for(let y=212;y<720;y+=5){const scale=(y-210)/385,depth=(1/scale-1)/.65,sourceScale=1/(1+(depth+travel)*.65),nextDepth=(385/(y+5-210)-1)/.65,nextScale=1/(1+(nextDepth+travel)*.65),sy=(210+385*sourceScale)/720*img.naturalHeight,sh=Math.max(.5,(nextScale-sourceScale)*385/720*img.naturalHeight),width=480*scale/sourceScale;ctx.drawImage(img,0,sy,img.naturalWidth,Math.min(sh,img.naturalHeight-sy),240-width/2-game.x*12*scale,y,width,5.2)}}
  const floor=ctx.createLinearGradient(0,210,0,720);floor.addColorStop(0,'#382a25');floor.addColorStop(.18,'#765031');floor.addColorStop(1,'#bc834b');polygon([[186,210],[294,210],[720,760],[-240,760]],floor);
  // Perspective floor seams and grain flow past the player continuously.
  ctx.save();ctx.beginPath();ctx.moveTo(186,210);ctx.lineTo(294,210);ctx.lineTo(720,760);ctx.lineTo(-240,760);ctx.closePath();ctx.clip();
  // Sample wood in depth, not screen coordinates, so the planks approach and
  // pass under the player rather than sliding a flat background up the screen.
  const wood=sprites.floor;if(wood)for(let y=214;y<720;y+=4){const scale=(y-210)/385,depth=(1/scale-1)/.65,next=(385/(y+4-210)-1)/.65,sy=(((depth+time*1.8)%4+4)%4)/4*wood.naturalHeight,sh=Math.max(1,Math.min(wood.naturalHeight-sy,Math.abs(depth-next)/4*wood.naturalHeight)),width=1800*scale;ctx.drawImage(wood,0,sy,wood.naturalWidth,sh,240-game.x*157.5*scale-width/2,y,width,4.3)}
  for(let board=-9;board<=9;board++){const far=project(board*.36,50,game.x),near=project(board*.36,-.65,game.x);ctx.strokeStyle=board%2?'#34221a77':'#eac28166';ctx.lineWidth=board%2?1.4:.8;ctx.beginPath();ctx.moveTo(far.x,214);ctx.lineTo(near.x,near.y);ctx.stroke()}
  const phase=time*1.8%1.15;for(let i=0;i<32;i++){const d=i*1.15-phase;if(d<-.65)continue;const left=project(-4,d,game.x),right=project(4,d,game.x);ctx.strokeStyle='#3d241b66';ctx.lineWidth=Math.max(.4,left.scale*1.2);ctx.beginPath();ctx.moveTo(left.x,left.y);ctx.lineTo(right.x,right.y);ctx.stroke()}
  const shine=ctx.createRadialGradient(240,275,10,240,390,300);shine.addColorStop(0,'#ffd66b20');shine.addColorStop(.4,'#ffdb7e12');shine.addColorStop(1,'#ffdb7e00');ctx.fillStyle=shine;ctx.fillRect(0,210,480,510);
  ctx.restore();
  for(const booth of boothPositions(time,game.x)){
   const {x,y,scale,side}=booth,w=410*scale;ellipse(x,y-4,155*scale,18*scale,'#0006');drawSprite('booth',x,y,w,{flip:side===1});
   // Warm ceiling lamps use the same world depth as the passing booths.
   const lampX=240+(side*1.7-game.x*.4)*180*scale,lampY=200-112*scale;
   ctx.strokeStyle='#bd914d';ctx.lineWidth=1.5*scale;ctx.beginPath();ctx.moveTo(lampX,lampY-55*scale);ctx.lineTo(lampX,lampY);ctx.stroke();ellipse(lampX,lampY,19*scale,9*scale,'#a07130');ellipse(lampX,lampY+4*scale,17*scale,5*scale,'#ffe4a1');
   // Framed screens travel with their booth section and reinforce the walk.
   const screenX=240+(side*2.7-game.x*.7)*225*scale,screenY=210-80*scale,sw=85*scale,sh=49*scale;ctx.fillStyle='#ac8244';ctx.fillRect(screenX-sw/2,screenY-sh,sw,sh);ctx.fillStyle='#102b48';ctx.fillRect(screenX-sw/2+3*scale,screenY-sh+3*scale,sw-6*scale,sh-6*scale);ctx.fillStyle='#448452';ctx.fillRect(screenX-sw*.4,screenY-sh*.73,sw*.8,sh*.56);ctx.strokeStyle='#e0ebcc';ctx.lineWidth=.8*scale;for(let line=1;line<5;line++){const xx=screenX-sw*.4+sw*.16*line;ctx.beginPath();ctx.moveTo(xx,screenY-sh*.7);ctx.lineTo(xx,screenY-sh*.23);ctx.stroke()}
  }
  const fog=ctx.createLinearGradient(0,202,0,340);fog.addColorStop(0,'#edd6a01b');fog.addColorStop(1,'#edd6a000');ctx.fillStyle=fog;ctx.fillRect(0,202,480,140);ctx.restore();
 }
 function person(game,o,time){
  if(!sprites[o.type==='chair'?'chair':o.type==='dancer'?'dancer':'fan'])return false;
  const remaining=o.at-time;if(remaining<-.48||remaining>3.5)return true;const p=clamp(1-remaining/3.5,0,1.14),scale=.18+p*p*.95,x=240+(obstacleX(o,time)-game.x)*190*scale,y=205+315*p*p;ctx.save();
  ellipse(x,y,35*scale,9*scale,'#0005');
  const width=(o.type==='chair'?105:185)*scale;
  if(o.type==='chair')drawSprite('chair',x,y,width,{flip:o.id%2===1});
  else{const actor=actors[o.type==='dancer'?'dancer':'fan'];if(actor){const frame=actor.render(time,o.phase,reducedMotion),height=width*1.5;ctx.translate(x,y);ctx.scale(o.id%2===1?-1:1,1);ctx.drawImage(frame,-width/2,-height*.94,width,height)}}
  ctx.restore();return true;
 }
 function tray(game,time){
  if(!sprites.tray||!sprites.wings||!sprites.nachos||!sprites.soda)return false;
  ctx.save();ctx.translate(240-game.x*14,510+(reducedMotion?0:Math.sin(time*7)*2));ctx.rotate(game.tilt*.35);
  const img=sprites.tray,w=510,h=w*img.naturalHeight/img.naturalWidth;ctx.drawImage(img,-w/2,-h*.52,w,h);
  if(game.food>=1)drawSprite('wings',-110,-4,166,{rotation:game.tilt*.05});
  if(game.food>=2)drawSprite('nachos',99,0,176,{rotation:-game.tilt*.04});
  if(game.food>=3)drawSprite('soda',-1,-27,83,{rotation:-game.tilt*.15});
  ctx.restore();return true;
 }
 return {ready,sprites,world,person,tray};
}
