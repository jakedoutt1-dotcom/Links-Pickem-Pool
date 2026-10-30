import {clamp,obstacleX} from './check-please-engine.mjs';
import {createActorAnimator} from './check-please-actors.mjs';

// A single projected room: walls, ceiling, fixtures and floor share world depth.
// No baked room photograph remains behind the moving scenery.
export function project(lateral,depth,camera=0){const scale=1/(1+Math.max(-.7,depth)*.65);return {x:240+(lateral-camera*.7)*225*scale,y:210+385*scale,scale}}
export function boothPositions(time,camera=0){const phase=time*1.8%3.7,out=[];for(let i=0;i<8;i++){const depth=.5+i*3.7-phase;if(depth<-.7)continue;for(const side of [-1,1])out.push({...project(side*2.1,depth,camera),depth,side})}return out.sort((a,b)=>b.depth-a.depth)}
const assets={fan:'check-please-fan-v2.webp',dancer:'check-please-dancer-v2.webp',chair:'check-please-chair-v2.webp',booth:'check-please-booth-v2.webp',tray:'check-please-tray-v2.webp',floor:'check-please-floor-v2.webp',beer:'check-please-beer-v4.webp',cola:'check-please-cola-v4.webp',wall:'check-please-wall-v4.webp',seated:'check-please-seated-v4.webp',seatedWoman:'check-please-seated-woman-v4.webp'};
function image(file){return new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src='./assets/'+file})}
export function createSceneRenderer(ctx,{reducedMotion=false}={}){
 const sprites={},actors={},ready=Promise.all(Object.entries(assets).map(async([name,file])=>{sprites[name]=await image(file)})).then(()=>{for(const name of ['fan','dancer','seated','seatedWoman'])if(sprites[name])actors[name]=createActorAnimator(sprites[name],name)});
 function polygon(points,fill){ctx.fillStyle=fill;ctx.beginPath();for(const [i,p]of points.entries())i?ctx.lineTo(...p):ctx.moveTo(...p);ctx.closePath();ctx.fill()}
 function ellipse(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
 function drawSprite(name,x,bottom,width,{flip=false,rotation=0,squash=1}={}){const img=sprites[name];if(!img)return false;const h=width*img.naturalHeight/img.naturalWidth;ctx.save();ctx.translate(x,bottom);ctx.rotate(rotation);ctx.scale(flip?-1:1,squash);ctx.drawImage(img,-width/2,-h,width,h);ctx.restore();return true}
 // Subdivided texture mapping keeps wall artwork attached to perspective planes.
 function textureTriangle(img,source,dest){ctx.save();ctx.beginPath();ctx.moveTo(...dest[0]);ctx.lineTo(...dest[1]);ctx.lineTo(...dest[2]);ctx.closePath();ctx.clip();const [a,b,c]=source,[d,e,f]=dest,det=a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]);if(Math.abs(det)<.001){ctx.restore();return}const solve=k=>[(d[k]*(b[1]-c[1])+e[k]*(c[1]-a[1])+f[k]*(a[1]-b[1]))/det,(d[k]*(c[0]-b[0])+e[k]*(a[0]-c[0])+f[k]*(b[0]-a[0]))/det,(d[k]*(b[0]*c[1]-c[0]*b[1])+e[k]*(c[0]*a[1]-a[0]*c[1])+f[k]*(a[0]*b[1]-b[0]*a[1]))/det];const x=solve(0),y=solve(1);ctx.transform(x[0],y[0],x[1],y[1],x[2],y[2]);ctx.drawImage(img,0,0);ctx.restore()}
 function wallPanel(side,near,far,game){const img=sprites.wall;if(!img)return;const at=(u,v)=>{const p=project(side*2.95,near+(far-near)*u,game.x);return [p.x,210+(-240+625*v)*p.scale]};for(let i=0;i<8;i++)for(let j=0;j<4;j++){const a=i/8,b=(i+1)/8,c=j/4,d=(j+1)/4,uv=[[a,c],[b,c],[a,d],[b,d]],src=uv.map(([u,v])=>[u*img.naturalWidth,v*img.naturalHeight]),dst=uv.map(([u,v])=>at(u,v));textureTriangle(img,[src[0],src[1],src[2]],[dst[0],dst[1],dst[2]]);textureTriangle(img,[src[1],src[3],src[2]],[dst[1],dst[3],dst[2]])}}
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
  // Solid textured wall bays meet the floor and ceiling; all advance in world space.
  const phaseWall=time*1.8%3.7;
  for(let i=9;i>=0;i--){const near=Math.max(-.7,.5+i*3.7-phaseWall),far=.5+(i+1)*3.7-phaseWall;if(far<=-.7)continue;for(const side of [-1,1])wallPanel(side,near,far,game);const l=project(-2.95,near,game.x),r=project(2.95,near,game.x),top=210-240*l.scale;ctx.strokeStyle='#ac834d';ctx.lineWidth=Math.max(1,6*l.scale);ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(l.x,top);ctx.lineTo(r.x,top);ctx.lineTo(r.x,r.y);ctx.stroke()}
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
  const seatedFrames=['seated','seatedWoman'].map((name,i)=>actors[name]?.render(time*.55,i*1.9,reducedMotion));
  for(const [boothIndex,booth] of boothPositions(time,game.x).entries()){
   const {x,y,scale,side}=booth,w=410*scale;ellipse(x,y-4,155*scale,18*scale,'#0006');drawSprite('booth',x,y,w,{flip:side===1});
   // Guests remain seated on the leather bench while their head/arms animate.
   const guest=seatedFrames[boothIndex%2];if(guest&&scale>.065){const gw=190*scale,gh=gw*1.5;ctx.save();ctx.translate(x+side*65*scale,y-10*scale);ctx.scale(side===1?-1:1,1);ctx.drawImage(guest,-gw/2,-gh,gw,gh);ctx.restore()}
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
  const beer=index!==1,img=sprites[beer?'beer':'cola'];if(!img)return;
  ctx.save();ctx.translate(x,bottom);ctx.rotate(-game.tilt*.12);const w=beer?103:79,h=w*img.naturalHeight/img.naturalWidth;
  ellipse(0,3,w*.43,8,'#0008');ctx.drawImage(img,-w/2,-h,w,h);
  // Subtle live fizz and reflected glints retain movement inside the detailed glass.
  ctx.save();ctx.globalAlpha=.35;for(let i=0;i<7;i++)ellipse(-w*.23+(i%3)*w*.16,-h*.18-((time*12+i*13)%(h*.45)),.7,1.1,beer?'#fff1bc':'#d9f0ff');ctx.restore();
  if(Math.abs(game.tilt)>.35){ctx.strokeStyle=beer?'#fff1c3bb':'#c5eeff99';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-w*.24,-h*.77-game.tilt*5);ctx.lineTo(w*.18,-h*.77+game.tilt*5);ctx.stroke()}
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
