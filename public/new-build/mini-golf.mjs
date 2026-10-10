import {createScenery,waterTexture} from './mini-golf-scenery.mjs';
import {themes} from './mini-golf-courses.mjs';
import {setupLobby} from './mini-golf-lobby.mjs';
import {connectRoom} from './mini-golf-room.mjs?v=lobby13';
import {tone,unlock,setupSound,bounce,rolling,splash,ambience} from './mini-golf-sound.mjs?v=lobby13';
import * as T from './vendor/three/three.module.min.js';
import {create,hit,step,blocks,cup,replayShots,courses,gateAt} from './mini-golf-core.mjs?v=lobby13';
const $=id=>document.getElementById(id);let s=create(),overview=false,acc=0,last=0,swing=0,pendingShot=null;
let shots=[],celebrationTimer,loadCourse=()=>{},resetCamera=()=>{};setupSound($('sound'));
function resetGame(hole=s.hole,rulesVersion=s.rulesVersion||2){rolling(0);s=create(hole,rulesVersion);loadCourse();resetCamera();shots=[];swing=0;pendingShot=null;acc=0;$('celebration').hidden=true;clearTimeout(celebrationTimer)}
let lobby;const room=connectRoom({onState:b=>lobby?.state(b),reset:resetGame,restore(log){s=replayShots(log,s.hole,s.rulesVersion);shots=log;if(s.done||s.strokes>=10)room.finish(shots)}});
lobby=setupLobby({room,reset:resetGame,beginSound:unlock});
function finished(){const ace=s.done&&s.strokes===1;const box=$('celebration');box.replaceChildren();const title=document.createElement('strong');title.className='celebration-title';title.textContent=s.done?(ace?'HOLE IN ONE!':'NICE PUTT!'):'HOLE COMPLETE';box.append(title);const sub=document.createElement('small');sub.textContent=s.strokes+' strokes'+(room.active()?' · Waiting for the group':'');box.append(sub);if(s.done){tone(true,ace);for(let i=0;i<(ace?65:25);i++){const el=document.createElement('i');el.style.left=(i*37%100)+'%';el.style.animationDelay=(i%8)*.08+'s';box.append(el)}}box.hidden=false;clearTimeout(celebrationTimer);celebrationTimer=setTimeout(()=>box.hidden=true,ace?6500:4500);room.finish(shots)}
try{
const renderer=new T.WebGLRenderer({canvas:$('course'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new T.Scene();const skyCanvas=document.createElement('canvas');skyCanvas.width=4;skyCanvas.height=256;const skyCtx=skyCanvas.getContext('2d'),skyGradient=skyCtx.createLinearGradient(0,0,0,256);skyGradient.addColorStop(0,'#288be4');skyGradient.addColorStop(.55,'#70cafa');skyGradient.addColorStop(1,'#def7fb');skyCtx.fillStyle=skyGradient;skyCtx.fillRect(0,0,4,256);const skyTexture=new T.CanvasTexture(skyCanvas);skyTexture.colorSpace=T.SRGBColorSpace;scene.background=skyTexture;scene.fog=new T.Fog('#92d4f0',35,115);const camera=new T.PerspectiveCamera(48,1,.1,180);
scene.add(new T.HemisphereLight('#e6f2ff','#516942',1.25));const sun=new T.DirectionalLight('#fff0d5',2.7);sun.position.set(-12,24,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:70});sun.shadow.bias=-.0005;sun.shadow.normalBias=.025;sun.shadow.radius=3;scene.add(sun);
function texture(kind){const el=document.createElement('canvas');el.width=el.height=256;const c=el.getContext('2d');c.fillStyle=kind==='turf'?'#40983f':'#d6d4c6';c.fillRect(0,0,256,256);let seed=44;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=0;i<22000;i++){c.fillStyle=kind==='turf'?(i%2?'#98b96c38':'#143e2a38'):(i%2?'#f4eedb30':'#45494030');c.fillRect(rnd()*256,rnd()*256,1,kind==='turf'?3:1)}if(kind==='stone'){c.strokeStyle='#777d7055';for(let y=0;y<256;y+=64){c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke();for(let x=(y%128?32:0);x<256;x+=96)c.strokeRect(x,y,96,64)}}const tx=new T.CanvasTexture(el);tx.colorSpace=T.SRGBColorSpace;tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(kind==='turf'?3:2,kind==='turf'?12:1);tx.anisotropy=renderer.capabilities.getMaxAnisotropy();return tx}
const turf=texture('turf'),stone=texture('stone');
// A clean checker-mown green, authored locally rather than a copied game asset.
const lawn=document.createElement('canvas');lawn.width=512;lawn.height=2048;const lc=lawn.getContext('2d');
for(let y=0;y<16;y++)for(let x=0;x<4;x++){lc.fillStyle=(x+y)%2?'#54b741':'#399b30';lc.fillRect(x*128,y*128,128,128)}
let grassSeed=18;for(let i=0;i<220000;i++){grassSeed=(grassSeed*1664525+1013904223)>>>0;const x=grassSeed/4294967296*512;grassSeed=(grassSeed*1664525+1013904223)>>>0;const y=grassSeed/4294967296*2048;lc.fillStyle=i%2?'#ddfaae19':'#163e201c';lc.fillRect(x,y,1,2)}
const lawnMap=new T.CanvasTexture(lawn);lawnMap.colorSpace=T.SRGBColorSpace;lawnMap.anisotropy=renderer.capabilities.getMaxAnisotropy();
function greenUV(geo){const pos=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+3)/6,(pos.getY(i)+13)/26);return geo}
const stoneMat=new T.MeshStandardMaterial({map:stone,roughness:.94,bumpMap:stone,bumpScale:.055});
function mesh(geo,mat,x,y,z){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function box(w,h,d,mat,x,y,z){return mesh(new T.BoxGeometry(w,h,d),mat,x,y,z)}
function rounded(w,h,d,mat,x,y,z){const r=Math.min(.065,w/5,h/5,d/5),shape=new T.Shape();shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const g=new T.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:2,steps:1,curveSegments:3});g.translate(0,0,-d/2+r);return mesh(g,mat,x,y,z)}
const railMat=new T.MeshStandardMaterial({color:'#f3e7cf',roughness:.55});

const land=new T.MeshStandardMaterial({color:'#74a95b',roughness:1});box(22,.5,34,land,0,-.65,0);
const lakeMat=new T.MeshPhysicalMaterial({color:'#199ecc',roughness:.3,metalness:.05,clearcoat:1});const lake=mesh(new T.PlaneGeometry(160,160,36,36),lakeMat,0,-.48,0);lake.rotation.x=-Math.PI/2;lake.castShadow=false;const greenShape=new T.Shape();greenShape.moveTo(-3,-13);greenShape.lineTo(3,-13);greenShape.lineTo(3,13);greenShape.lineTo(-3,13);greenShape.closePath();const cutout=new T.Path();cutout.absarc(cup.x,-cup.z,.29,0,Math.PI*2,true);greenShape.holes.push(cutout);const green=mesh(greenUV(new T.ShapeGeometry(greenShape,48)),new T.MeshStandardMaterial({map:lawnMap,roughness:.9,bumpMap:lawnMap,bumpScale:.012}),0,0,0);green.rotation.x=-Math.PI/2;
const stripes=[];for(let i=0;i<13;i++)if(Math.abs(-12+i*2-cup.z)>.8)stripes.push(box(5.96,.002,1,new T.MeshStandardMaterial({color:i%2?'#88a962':'#345e35',transparent:true,opacity:.08}),0,.002,-12+i*2));
rounded(.32,.48,26.6,railMat,-3.16,.1,0);rounded(.32,.48,26.6,railMat,3.16,.1,0);rounded(6.6,.48,.32,railMat,0,.1,-13.16);rounded(6.6,.48,.32,railMat,0,.1,13.16);
const scenery=createScenery(T,scene),waterMap=waterTexture(T);lakeMat.map=waterMap;lakeMat.needsUpdate=true;const obstacles=[];let movingGate,creek;
loadCourse=()=>{
 for(const m of obstacles){scene.remove(m);m.geometry.dispose();if(m===creek){m.material.map.dispose();m.material.dispose()}}obstacles.length=0;const course=courses[s.hole],theme=themes[course.theme]||themes.garden;scenery.setCourse(course.theme);land.color.set(theme.grass);scene.fog.color.set(theme.sky);railMat.color.set(theme.rail);lakeMat.color.set(theme.water);sun.color.set(course.theme==='lakeside'?'#ffe9bd':'#fff0d5');$('windHud').textContent=course.wind&&s.rulesVersion>=2?'Breeze → · airborne shots':'Calm air';$('status').textContent=course.hint;
 const shape=new T.Shape();shape.moveTo(-3,-13);shape.lineTo(3,-13);shape.lineTo(3,13);shape.lineTo(-3,13);shape.closePath();const hole=new T.Path();hole.absarc(cup.x,-cup.z,.29,0,Math.PI*2,true);shape.holes.push(hole);
 if(course.water){const w=course.water,p=new T.Path();p.moveTo(w.x-w.w/2,-w.z-w.d/2);p.lineTo(w.x-w.w/2,-w.z+w.d/2);p.lineTo(w.x+w.w/2,-w.z+w.d/2);p.lineTo(w.x+w.w/2,-w.z-w.d/2);p.closePath();shape.holes.push(p);const creekMap=waterMap.clone();creekMap.repeat.set(w.w*.4,w.d*.4);creek=mesh(new T.PlaneGeometry(w.w,w.d,12,12),new T.MeshPhysicalMaterial({color:theme.water,map:creekMap,metalness:.05,roughness:.3,clearcoat:1}),w.x,-.08,w.z);creek.rotation.x=-Math.PI/2;obstacles.push(creek)}else creek=null;
 green.geometry.dispose();green.geometry=greenUV(new T.ShapeGeometry(shape,48));stripes.forEach(m=>m.visible=false);
 for(const b of course.blocks)obstacles.push(rounded(b.w,.4,b.d,railMat,b.x,.2,b.z));movingGate=null;
 if(course.gate){const b=course.gate;movingGate=box(b.w,.5,b.d,stoneMat,b.x,.25,b.z);obstacles.push(movingGate)}
 if(course.ramp){const r=course.ramp;const ramp=box(r.w,.08,.85,stoneMat,r.x,.14,r.z+.2);ramp.rotation.x=.3;obstacles.push(ramp)}
 $('badge').textContent=course.name.toUpperCase()+' · PAR '+course.par;$('courseTitle').textContent=course.name.toUpperCase()+' · HOLE '+(s.hole+1)+' · PAR '+course.par;
};loadCourse();
// Dark recessed cup with a metal rim.
const dark=new T.MeshStandardMaterial({color:'#03120a',roughness:1});mesh(new T.CylinderGeometry(.29,.29,.025,40),dark,cup.x,-.28,cup.z);const rim=mesh(new T.TorusGeometry(.295,.018,8,40),new T.MeshStandardMaterial({color:'#a7ab8e',metalness:.5,roughness:.4}),cup.x,.022,cup.z);rim.rotation.x=Math.PI/2;
const pin=mesh(new T.CylinderGeometry(.025,.025,1.7,12),new T.MeshStandardMaterial({color:'#dedacc',metalness:.4,roughness:.4}),0,.86,-11);
const logo=new T.TextureLoader().load('/links-small-logo.png');logo.colorSpace=T.SRGBColorSpace;
const flag=mesh(new T.PlaneGeometry(.85,.35,10,3),new T.MeshStandardMaterial({map:logo,transparent:true,side:T.DoubleSide,roughness:.9}),.43,1.5,-11);const flagBase=Float32Array.from(flag.geometry.attributes.position.array);
function sign(x,z,title){box(1.8,.85,.13,new T.MeshStandardMaterial({color:'#10251c',roughness:.5}),x,.95,z);for(const dx of [-.65,.65])box(.07,.7,.07,stoneMat,x+dx,.3,z);const face=mesh(new T.PlaneGeometry(1.58,.53),new T.MeshBasicMaterial({map:logo,transparent:true}),x,1.06,z+.075);face.castShadow=false;
const cv=document.createElement('canvas');cv.width=512;cv.height=80;const ct=cv.getContext('2d');ct.fillStyle='#e9cf8c';ct.font='600 27px Arial';ct.textAlign='center';ct.fillText(title,256,49);const tx=new T.CanvasTexture(cv);mesh(new T.PlaneGeometry(1.6,.25),new T.MeshBasicMaterial({map:tx,transparent:true}),x,.69,z+.076)}
sign(-4.5,-4,'PICKS. POOLS. PEOPLE.');sign(4.6,-9,'YOUR VENUE HERE · SAMPLE');
// Pond, rocks and layered trees surround the playable lane.
const water=mesh(new T.CircleGeometry(5,64),new T.MeshPhysicalMaterial({color:'#29b8cf',metalness:.08,roughness:.22,transparent:true,opacity:.85,clearcoat:1}),-10,-.35,-6);water.rotation.x=-Math.PI/2;water.scale.set(1,1.7,1);
let seed=6;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const leaf=new T.MeshStandardMaterial({color:'#439150',roughness:1});const trunk=new T.MeshStandardMaterial({color:'#856343',roughness:1});
for(let i=0;i<23;i++){const m=mesh(new T.DodecahedronGeometry(.25+rand()*.35,1),stoneMat,(i%2?1:-1)*(3.8+rand()*1.8),-.15,-14+rand()*28);m.scale.set(1,.6,1.2)}
for(let i=0;i<7;i++){const hill=mesh(new T.SphereGeometry(12+rand()*8,16,8),land,-55+i*18,-8,-52-rand()*12);hill.scale.y=.55}
const trim=new T.MeshStandardMaterial({color:'#d6b66d',metalness:.55,roughness:.35});
for(const side of [-1,1]){box(.035,.035,26,trim,side*3.01,.35,0);for(let z=-12;z<=12;z+=3){const bed=box(.6,.2,1.25,stoneMat,side*3.75,-.13,z);for(let j=0;j<4;j++){const flower=mesh(new T.SphereGeometry(.085,8,6),new T.MeshStandardMaterial({color:j%2?'#e8ca79':'#dca3bb'}),side*3.75+(j%2)*.17,.15,z-.4+j*.22);flower.castShadow=false}}}
// Surrounding park paths and sculpted planting give the lane a finished setting.
const pathMat=new T.MeshStandardMaterial({color:'#d9c79b',roughness:1});
for(const side of [-1,1]){box(1.35,.08,29,pathMat,side*4.75,-.29,0);for(let z=-13;z<14;z+=1.5)box(1.3,.012,.025,stoneMat,side*4.75,-.243,z);for(let z=-12;z<=12;z+=4){const bush=mesh(new T.SphereGeometry(.65,12,8),leaf,side*6,-.04,z);bush.scale.set(1,.8,1.35)}}
const cloudMat=new T.MeshBasicMaterial({color:'#f5fcff'});
for(let i=0;i<6;i++){for(let j=0;j<3;j++){const cloud=mesh(new T.SphereGeometry(2+j*.25,12,8),cloudMat,-32+i*14+j*2,8+(i%2)*3,-40-(i%3)*9);cloud.scale.set(1.8,.5,.7);cloud.castShadow=cloud.receiveShadow=false}}
const rippleMat=new T.MeshBasicMaterial({color:'#b8f4f4',transparent:true,opacity:.3,depthWrite:false});
for(let i=0;i<5;i++){const ripple=mesh(new T.RingGeometry(1+i*.65,1.025+i*.65,48),rippleMat,-10,-.325,-6);ripple.rotation.x=-Math.PI/2;ripple.scale.y=1.7;ripple.castShadow=false}
const teeRing=mesh(new T.TorusGeometry(.32,.015,8,48),trim,0,.025,11);teeRing.rotation.x=-Math.PI/2;
const ballCanvas=document.createElement('canvas');ballCanvas.width=256;ballCanvas.height=128;const bc=ballCanvas.getContext('2d');bc.fillStyle='#c4c4c4';bc.fillRect(0,0,256,128);for(let y=5;y<128;y+=12)for(let x=5;x<256;x+=12){const dx=x+(Math.floor(y/12)%2)*6,g=bc.createRadialGradient(dx,y,0,dx,y,3.8);g.addColorStop(0,'#626262');g.addColorStop(.8,'#b0b0b0');g.addColorStop(1,'#ddd');bc.fillStyle=g;bc.beginPath();bc.arc(dx,y,3.8,0,Math.PI*2);bc.fill()}const dimples=new T.CanvasTexture(ballCanvas);
const ball=mesh(new T.SphereGeometry(.16,32,24),new T.MeshStandardMaterial({color:'#fffef4',roughness:.25,bumpMap:dimples,bumpScale:.009}),s.x,.17,s.z);
const splashDots=[],splashMaterial=new T.MeshBasicMaterial({color:'#a9f1ff',transparent:true,opacity:.8});let splashLife=0,splashOrigin=null;
for(let i=0;i<16;i++){const m=mesh(new T.SphereGeometry(.035,6,4),splashMaterial,0,0,0);m.visible=false;m.castShadow=false;splashDots.push(m)}
const trailDots=[];for(let i=0;i<8;i++){const m=mesh(new T.SphereGeometry(.023,6,4),new T.MeshBasicMaterial({color:'#e6f8fa',transparent:true,opacity:.5-i*.045}),0,0,0);m.visible=false;m.castShadow=false;trailDots.push(m)}
const putter=new T.Group();const shaft=new T.Mesh(new T.CylinderGeometry(.018,.018,1.15,8),new T.MeshStandardMaterial({color:'#cdd6d8',metalness:.8,roughness:.23}));shaft.rotation.z=-.3;shaft.position.set(-.17,.58,0);putter.add(shaft);const head=new T.Mesh(new T.BoxGeometry(.4,.12,.12),shaft.material);head.position.y=.08;putter.add(head);scene.add(putter);
const aim=new T.ArrowHelper(new T.Vector3(0,0,-1),new T.Vector3(0,.07,11),2.4,0xf0d384,.3,.15);scene.add(aim);
const desired=new T.Vector3(),look=new T.Vector3();camera.position.set(0,1.9,15.8);look.set(0,.12,9.6);
function resize(){const r=$('stage').getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe($('stage'));resize();
function controls(){for(const id of ['aim','power'])$(id).disabled=s.done||s.strokes>=10||swing>0||room.locked();$('putt').disabled=s.moving||s.done||s.strokes>=10||swing>0||room.locked();$('reset').hidden=room.active();$('nextHole').hidden=room.active();$('score').textContent=s.strokes+' stroke'+(s.strokes===1?'':'s')}
$('putt').onclick=()=>{if(s.moving||s.done||s.strokes>=10||swing||room.locked())return;unlock();pendingShot=[+$('aim').value*Math.PI/180,+$('power').value/100,(performance.now()/1000)%1000];swing=.38;drag=null;$('stage').classList.remove('is-aiming');controls();$('status').textContent='Putting…'};
$('reset').onclick=()=>{if(room.active())return;resetGame();$('status').textContent='New round. Aim, set power, and putt.';controls()};$('view').onclick=()=>{overview=!overview;$('view').textContent=overview?'Ball view':'Course view'};
$('nextHole').onclick=()=>{if(!room.active())resetGame((s.hole+1)%courses.length)};
$('power').oninput=()=>{$('powerText').textContent=$('power').value+'%';$('shotPowerFill').style.width=$('power').value+'%';$('shotPowerValue').textContent=$('power').value+'%'};
let drag=null,cameraYaw=0,cameraPitch=.28,cameraDistance=4.2,guideKey='',lastGuide=0;
resetCamera=()=>{overview=false;cameraYaw=0;cameraPitch=.28;cameraDistance=4.2;$('view').textContent='Course view';cancelDrag()};
const guideMaterial=new T.MeshBasicMaterial({color:'#fff7cf',transparent:true,opacity:.75,depthWrite:false});const guide=[];
for(let i=0;i<20;i++){const dot=mesh(new T.SphereGeometry(.033,8,6),guideMaterial,0,.055,0);dot.castShadow=dot.receiveShadow=false;guide.push(dot)}
function refreshGuide(now){const key=[s.x.toFixed(2),s.z.toFixed(2),$('aim').value,$('power').value,s.hole].join(':');if(key===guideKey&&now-lastGuide<150)return;guideKey=key;lastGuide=now;const preview={...s,safe:s.safe.slice()};preview.moving=false;hit(preview,+$('aim').value*Math.PI/180,+$('power').value/100,now/1000%1000);let next=0;for(let i=0;i<480&&preview.moving&&next<guide.length;i++){step(preview,1/120);if(i%12===0){guide[next].position.set(preview.x,.07+preview.y,preview.z);guide[next++].visible=true}}for(let i=next;i<guide.length;i++)guide[i].visible=false}

function setAim(value){$('aim').value=((value+540)%360)-180;$('aimPad').setAttribute('aria-valuenow',String(Math.round(+$('aim').value)));$('aimStick').style.rotate=$('aim').value+'deg'}
function canAim(){return !s.done&&s.strokes<10&&!swing&&!room.locked()}
const ray=new T.Raycaster(),ground=new T.Plane(new T.Vector3(0,1,0),0);
function groundPoint(x,y){const r=$('course').getBoundingClientRect();ray.setFromCamera(new T.Vector2((x-r.left)/r.width*2-1,1-(y-r.top)/r.height*2),camera);return ray.ray.intersectPlane(ground,new T.Vector3())}
function ballScreen(){const r=$('course').getBoundingClientRect(),v=ball.position.clone().project(camera);return {x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2}}
function cancelDrag(){drag=null;$('stage').classList.remove('is-aiming')}
for(const target of [$('course'),$('aimPad')]){
 target.addEventListener('pointerdown',e=>{if(drag||e.button!==0)return;const course=target===$('course'),p=ballScreen(),onBall=Math.hypot(e.clientX-p.x,e.clientY-p.y)<38;if(!course&&!canAim())return;const mode=course?(onBall&&canAim()&&!s.moving?'shot':'orbit'):'pad';unlock();target.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,angle:+$('aim').value,id:e.pointerId,mode,point:groundPoint(e.clientX,e.clientY),distance:0,yaw:cameraYaw,pitch:cameraPitch};if(mode==='shot'){$('stage').classList.add('is-aiming');$('status').textContent='Pull back from the ball. Release to putt.'}e.preventDefault()});
 target.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.distance=Math.hypot(dx,dy);if(drag.mode==='orbit'){overview=false;cameraYaw=drag.yaw-dx*.009;cameraPitch=Math.max(.18,Math.min(.85,drag.pitch+dy*.004));$('view').textContent='Course view'}else if(drag.mode==='shot'&&canAim()){if(drag.distance>8){const scale=Math.min(200,$('stage').clientHeight*.42);setAim((Math.atan2(-dx,dy)-cameraYaw)*180/Math.PI);$('power').value=Math.round(Math.min(100,Math.max(5,drag.distance/scale*100)));$('power').oninput();$('status').textContent='Release to putt · '+$('power').value+'% power'}}else if(drag.mode==='pad'&&canAim())setAim(drag.angle+dx*1.4);e.preventDefault()});
 target.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const shoot=drag.mode==='shot'&&drag.distance>12;cancelDrag();if(shoot)$('putt').click()});
 for(const type of ['pointercancel','lostpointercapture'])target.addEventListener(type,cancelDrag);
}
// Prevent Safari's page pan and selection from taking a putting gesture.
for(const type of ['touchstart','touchmove'])$('stage').addEventListener(type,e=>{if(e.cancelable)e.preventDefault()},{passive:false});
$('course').addEventListener('contextmenu',e=>e.preventDefault());
$('course').addEventListener('wheel',e=>{e.preventDefault();cameraDistance=Math.max(3,Math.min(9,cameraDistance+e.deltaY*.006))},{passive:false});
$('zoomIn').onclick=()=>cameraDistance=Math.max(2.8,cameraDistance-.6);$('zoomOut').onclick=()=>cameraDistance=Math.min(9,cameraDistance+.6);
$('behindBall').onclick=()=>{overview=false;cameraYaw=-Number($('aim').value)*Math.PI/180;cameraPitch=.28;cameraDistance=4.2;$('view').textContent='Course view'};
window.addEventListener('blur',()=>{cancelDrag();rolling(0)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelDrag();rolling(0)}});
$('course').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','+','-','c','C'].includes(e.key))return;e.preventDefault();if(e.key==='c'||e.key==='C')$('view').click();else if(e.key==='+')$('zoomIn').click();else if(e.key==='-')$('zoomOut').click();else if(e.key===' ')$('putt').click();else if(canAim()){if(e.key==='ArrowLeft'||e.key==='ArrowRight')setAim(+$('aim').value+(e.key==='ArrowRight'?3:-3));else{$('power').value=Math.max(5,Math.min(100,+$('power').value+(e.key==='ArrowUp'?5:-5)));$('power').oninput()}}});
$('aimPad').addEventListener('keydown',e=>{if(canAim()&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setAim(+$('aim').value+(e.key==='ArrowRight'?3:-3))}});

function frame(now){const dt=Math.min((now-last)/1000||0,.25);last=now;if(document.hidden||document.body.classList.contains('is-lobby')){ambience();requestAnimationFrame(frame);return}ambience(courses[s.hole].theme);if(swing>0){swing-=dt;if(swing<=0){swing=0;hit(s,...pendingShot);shots.push(pendingShot);room.save(shots);tone();pendingShot=null;$('status').textContent='Ball rolling. You can adjust aim and power for your next putt.';controls()}}
const moving=s.moving;acc+=dt;while(acc>=1/120){step(s,1/120);if(s.bounced)bounce();acc-=1/120}rolling(s.moving&&s.y===0?Math.hypot(s.vx,s.vz):0);if(moving&&!s.moving){if(s.penalty){splash();splashLife=.8;splashOrigin=s.splash;}$('status').textContent=s.done?'In the cup! Finished in '+s.strokes+' strokes. Restart to beat your score.':s.penalty?'Water! One penalty stroke. Back to your last safe shot.':'Ball stopped. Line up your next putt.';if(s.done||s.strokes>=10)finished();controls()}
if(splashLife>0){splashLife-=dt;const elapsed=.8-splashLife;splashDots.forEach((m,i)=>{m.visible=splashLife>0;const a=i*Math.PI*2/16,r=elapsed*(.4+(i%4)*.15);m.position.set(splashOrigin.x+Math.cos(a)*r,-.05+elapsed*1.6-elapsed*elapsed*2,splashOrigin.z+Math.sin(a)*r)})}
for(let i=trailDots.length-1;i>0;i--)trailDots[i].position.copy(trailDots[i-1].position);trailDots[0].position.copy(ball.position);trailDots.forEach(m=>m.visible=s.y>.08&&s.moving);
ball.position.set(s.x,s.done?Math.max(-.3,ball.position.y-dt*.8):.17+s.y,s.z);ball.visible=!s.done||ball.position.y>-.29;pin.visible=flag.visible=Math.hypot(s.x-cup.x,s.z-cup.z)>3&&!s.done;ball.rotation.x+=s.vz*dt/.16;ball.rotation.z-=s.vx*dt/.16;
controls();
const guideVisible=!s.moving&&!s.done&&!swing&&!room.locked();if(guideVisible)refreshGuide(now);else guide.forEach(dot=>dot.visible=false);$('shotHud').hidden=!guideVisible;$('distance').textContent=Math.hypot(s.x-cup.x,s.z-cup.z).toFixed(1)+' m to cup';$('strokeHud').textContent=s.strokes+' / 10 strokes';
const angle=+$('aim').value*Math.PI/180;aim.visible=drag?.mode==='shot';aim.position.set(s.x,.09,s.z);aim.setDirection(new T.Vector3(Math.sin(angle),0,-Math.cos(angle)));aim.setLength(.8+(+$('power').value/100)*2.4,.22,.12);
putter.visible=swing>0&&!s.done;putter.position.set(s.x-Math.sin(angle)*(.28+swing),0,s.z+Math.cos(angle)*(.28+swing));putter.rotation.y=-angle;
if(drag?.mode!=='shot'){if(overview){desired.set(14,22,19);look.lerp(new T.Vector3(0,0,0),.08)}else{desired.set(s.x+Math.sin(cameraYaw)*cameraDistance,Math.sin(cameraPitch)*cameraDistance+.3,s.z+Math.cos(cameraYaw)*cameraDistance);look.lerp(new T.Vector3(s.x-Math.sin(cameraYaw)*1.4,.12,s.z-Math.cos(cameraYaw)*1.4),1-Math.exp(-dt*6))}camera.position.lerp(desired,1-Math.exp(-dt*4));camera.lookAt(look);}
const pos=flag.geometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(now*.003+flagBase[i*3]*5)*(courses[s.hole].wind?.x?.08:.035)*(flagBase[i*3]+.43));pos.needsUpdate=true;scenery.animate(now,courses[s.hole].wind);waterMap.offset.set(now*.000013,now*.000007);water.material.opacity=.83+Math.sin(now*.0008)*.03;const lakePos=lake.geometry.attributes.position;for(let i=0;i<lakePos.count;i++)lakePos.setZ(i,Math.sin(now*.0015+lakePos.getX(i)*.5+lakePos.getY(i)*.35)*.025);lakePos.needsUpdate=true;if(movingGate)movingGate.position.x=gateAt(s.hole,s.moving?s.time:(now/1000)%1000).x;if(creek){creek.material.map.offset.copy(waterMap.offset);const p=creek.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(now*.003+p.getX(i)*4+p.getY(i)*2)*.015);p.needsUpdate=true}const screenBall=ballScreen(),bounds=$('stage').getBoundingClientRect();$('ballTarget').style.left=(screenBall.x-bounds.left)+'px';$('ballTarget').style.top=(screenBall.y-bounds.top)+'px';$('ballTarget').hidden=s.moving||s.done||!!swing||room.locked();$('shotPowerValue').textContent=$('power').value+'%';$('shotPowerFill').style.width=$('power').value+'%';renderer.render(scene,camera);requestAnimationFrame(frame)}
$('loading').hidden=true;$('putt').disabled=false;requestAnimationFrame(frame);
}catch(e){$('loading').textContent='3D graphics could not start. Try an updated browser with graphics acceleration enabled.';console.error(e)}

// Native fullscreen where supported, with an expanded browser layout elsewhere.
let expanded=false,scrollBefore=0;
function fullscreenLabel(){document.body.classList.toggle('game-fullscreen',expanded);$('fullscreen').textContent=expanded?'Exit full screen':'Full screen';$('fullscreen').setAttribute('aria-pressed',String(expanded))}
$('fullscreen').onclick=async()=>{if(expanded){if(document.fullscreenElement)await document.exitFullscreen().catch(()=>{});expanded=false;fullscreenLabel();window.scrollTo(0,scrollBefore)}else{scrollBefore=scrollY;expanded=true;fullscreenLabel();if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen().catch(()=>{});}};
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&expanded){expanded=false;fullscreenLabel();window.scrollTo(0,scrollBefore)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&expanded&&!document.fullscreenElement){expanded=false;fullscreenLabel();window.scrollTo(0,scrollBefore)}});
