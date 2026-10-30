import {clamp,obstacleX} from './check-please-engine.mjs';
import {createActorAnimator} from './check-please-actors.mjs';

// A single projected room: walls, ceiling, fixtures and floor share world depth.
// No baked room photograph remains behind the moving scenery.
export function project(lateral,depth,camera=0){const scale=1/(1+Math.max(-.7,depth)*.65);return {x:240+(lateral-camera*.7)*225*scale,y:210+385*scale,scale}}
export function boothPositions(time,camera=0){const phase=time*1.8%3.7,out=[];for(let i=0;i<8;i++){const depth=.5+i*3.7-phase;if(depth<-.7)continue;for(const side of [-1,1])out.push({...project(side*2.1,depth,camera),depth,side})}return out.sort((a,b)=>b.depth-a.depth)}
const assets={fan:'check-please-fan-v2.webp',dancer:'check-please-dancer-v2.webp',chair:'check-please-chair-v2.webp',booth:'check-please-booth-v2.webp',tray:'check-please-tray-v2.webp',floor:'check-please-floor-v2.webp'};
function image(file){return new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src='./assets/'+file})}
export function createSceneRenderer(ctx,{reducedMotion=false}={}){
 const sprites={},actors={},ready=Promise.all(Object.entries(assets).map(async([name,file])=>{sprites[name]=await image(file)})).then(()=>{for(const name of ['fan','dancer'])if(sprites[name])actors[name]=createActorAnimator(sprites[name],name)});
 function polygon(points,fill){ctx.fillStyle=fill;ctx.beginPath();for(const [i,p]of points.entries())i?ctx.lineTo(...p):ctx.moveTo(...p);ctx.closePath();ctx.fill()}
 function ellipse(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
 function drawSprite(name,x,bottom,width,{flip=false,rotation=0,squash=1}={}){const img=sprites[name];if(!img)return false;const h=width*img.naturalHeight/img.naturalWidth;ctx.save();ctx.translate(x,bottom);ctx.rotate(rotation);ctx.scale(flip?-1:1,squash);ctx.drawImage(img,-width/2,-h,width,h);ctx.restore();return true}
 function world(game,time){
  ctx.clearRect(0,0,480,720);ctx.save();const bob=reducedMotion?0:Math.sin(time*7)*1.2;ctx.translate(0,bob);
  const wall=ctx.createLinearGradient(0,0,0,720);wall.addColorStop(0,'#101c32');wall.addColorStop(.6,'#28364b');wall.addColorStop(1,'#101824');ctx.fillStyle=wall;ctx.fillRect(0,0,480,720);
  polygon([[0,0],[480,0],[294,210],[186,210]],'#18243a');
  polygon([[0,0],[186,210],[186,720],[0,720]],'#182d40');polygon([[480,0],[294,210],[294,720],[480,720]],'#182d40');
  // The far end is built from geometry too, rather than a second set of still fixtures.
  const end=project(0,42-time*.025,game.x),ew=900*end.scale,eh=570*end.scale;
  ctx.fillStyle='#47321e';ctx.fillRect(end.x-ew/2,210-eh,ew,eh+18);
  ctx.fillStyle='#d4a452';ctx.fillRect(end.x-ew/2,209,ew,3);
  for(let i=-4;i<=4;i++){ctx.fillStyle=i%2?'#c89643':'#edc56b';ctx.fillRect(end.x+i*ew/11,196,ew/25,12)}
  // Ceiling ribs, wall panels and rails all advance with the booths below.
  for(const section of boothPositions(time,game.x).filter(p=>p.side===1)){
   const {depth,scale}=section,l=project(-2.95,depth,game.x),r=project(2.95,depth,game.x),top=210-240*scale;
   ctx.strokeStyle='#8c693e';ctx.lineWidth=Math.max(1,5*scale);ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(l.x,top);ctx.lineTo(r.x,top);ctx.lineTo(r.x,r.y);ctx.stroke();
   ctx.strokeStyle='#dbb867';ctx.lineWidth=Math.max(.7,2*scale);ctx.beginPath();ctx.moveTo(l.x,210-155*scale);ctx.lineTo(r.x,210-155*scale);ctx.stroke();
  }
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
 function drink(x,bottom,index,game,time){
  const beer=index!==1,w=beer?65:56,h=beer?111:128;
  ctx.save();ctx.translate(x,bottom);ctx.rotate(-game.tilt*.13);
  ellipse(0,3,w*.56,9,'#0007');
  if(beer){ctx.strokeStyle='#e4f5ffb0';ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(w*.58,-h*.49,19,27,0,0,Math.PI*2);ctx.stroke()}
  const glass=ctx.createLinearGradient(-w/2,0,w/2,0);glass.addColorStop(0,'#eefaff88');glass.addColorStop(.2,'#d1eeff14');glass.addColorStop(.8,'#aac9dd33');glass.addColorStop(1,'#f3ffffaa');
  ctx.fillStyle=glass;ctx.beginPath();ctx.roundRect(-w/2,-h,w,h,beer?9:14);ctx.fill();ctx.strokeStyle='#e0f6ffc0';ctx.lineWidth=2;ctx.stroke();
  ctx.save();ctx.beginPath();ctx.roundRect(-w/2+4,-h+6,w-8,h-12,6);ctx.clip();
  const level=-h*.79,slosh=clamp(Math.sin(time*5+index)*2+game.tilt*23,-22,22),liquid=ctx.createLinearGradient(0,-h,0,0);liquid.addColorStop(0,beer?'#ffc43d':'#b8461a');liquid.addColorStop(1,beer?'#a84908':'#30140e');polygon([[-w/2,level-slosh],[w/2,level+slosh],[w/2,0],[-w/2,0]],liquid);
  ctx.strokeStyle=beer?'#fff2cd':'#e3ac6b';ctx.lineWidth=beer?12:3;ctx.beginPath();ctx.moveTo(-w/2,level-slosh);ctx.lineTo(w/2,level+slosh);ctx.stroke();
  for(let i=0;i<9;i++)ellipse(-w*.3+(i%3)*w*.28,-12-((time*17+i*13)%65),1.6,2.4,'#fff1b899');
  if(!beer)for(let i=0;i<3;i++){ctx.fillStyle='#e3f6ff77';ctx.fillRect(-19+i*13,-h*.72+(i%2)*14,14,17)}ctx.restore();
  ctx.strokeStyle='#fff9';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-w*.33,-h+14);ctx.lineTo(-w*.33,-18);ctx.stroke();ellipse(0,-h,w/2,6,'#e6f5ff55');ellipse(0,-2,w*.45,5,'#deefff66');
  if(!beer){ctx.strokeStyle='#f4e7bd';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(10,-h*.6);ctx.lineTo(23,-h-26);ctx.stroke()}
  ctx.restore();
 }
 function tray(game,time){
  ctx.save();ctx.translate(240-game.x*14,510+(reducedMotion?0:Math.sin(time*7)*2));ctx.rotate(game.tilt*.35);
  if(sprites.tray){const img=sprites.tray,w=510,h=w*img.naturalHeight/img.naturalWidth;ctx.drawImage(img,-w/2,-h*.52,w,h)}else{ellipse(0,12,220,65,'#b8c6d0');ellipse(0,0,210,54,'#243d50')}
  // Three visibly separate glasses, removed individually by the replay rules.
  for(let i=0;i<game.food;i++)drink([-105,0,105][i],i===1?-24:0,i,game,time);
  const elapsed=time-game.lastHit;
  if(elapsed>=0&&elapsed<.75&&!reducedMotion){for(let i=0;i<18;i++){const t=elapsed,side=game.tilt<0?-1:1,x=side*(115+t*(100+i*9)),y=-80-t*(80+i*7)+t*t*340;ellipse(x,y,2+i%3,4+i%4,'#f6c452cc')}}
  ctx.restore();return true;
 }
 return {ready,sprites,world,person,tray};
}
