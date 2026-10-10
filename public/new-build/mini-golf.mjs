import {connectRoom} from './mini-golf-room.mjs?v=putt-club1';
import {tone,unlock,setupSound,bounce,rolling,splash} from './mini-golf-sound.mjs?v=play8';
import * as T from './vendor/three/three.module.min.js';
import {create,hit,step,blocks,cup,replayShots,courses,gateAt} from './mini-golf-core.mjs?v=courses6';
const $=id=>document.getElementById(id);let s=create(),overview=false,acc=0,last=0,swing=0,pendingShot=null;
let shots=[],celebrationTimer,loadCourse=()=>{};setupSound($('sound'));
function resetGame(hole=s.hole){rolling(0);s=create(hole);loadCourse();shots=[];swing=0;pendingShot=null;acc=0;$('celebration').hidden=true;clearTimeout(celebrationTimer)}
const room=connectRoom({reset:resetGame,restore(log){s=replayShots(log,s.hole);shots=log;if(s.done||s.strokes>=10)room.finish(shots)}});
function finished(){const ace=s.done&&s.strokes===1;const box=$('celebration');box.replaceChildren();const title=document.createElement('strong');title.className='celebration-title';title.textContent=s.done?(ace?'HOLE IN ONE!':'NICE PUTT!'):'HOLE COMPLETE';box.append(title);const sub=document.createElement('small');sub.textContent=s.strokes+' strokes'+(room.active()?' · Waiting for the group':'');box.append(sub);if(s.done){tone(true,ace);for(let i=0;i<(ace?65:25);i++){const el=document.createElement('i');el.style.left=(i*37%100)+'%';el.style.animationDelay=(i%8)*.08+'s';box.append(el)}}box.hidden=false;clearTimeout(celebrationTimer);celebrationTimer=setTimeout(()=>box.hidden=true,ace?6500:4500);room.finish(shots)}
try{
const renderer=new T.WebGLRenderer({canvas:$('course'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new T.Scene();scene.background=new T.Color('#92d4f0');scene.fog=new T.Fog('#92d4f0',35,115);const camera=new T.PerspectiveCamera(48,1,.1,180);
scene.add(new T.HemisphereLight('#e6f2ff','#516942',1.25));const sun=new T.DirectionalLight('#fff0d5',2.7);sun.position.set(-12,24,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:70});sun.shadow.bias=-.0005;sun.shadow.normalBias=.025;sun.shadow.radius=3;scene.add(sun);
function texture(kind){const el=document.createElement('canvas');el.width=el.height=256;const c=el.getContext('2d');c.fillStyle=kind==='turf'?'#40983f':'#d6d4c6';c.fillRect(0,0,256,256);let seed=44;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=0;i<22000;i++){c.fillStyle=kind==='turf'?(i%2?'#98b96c38':'#143e2a38'):(i%2?'#f4eedb30':'#45494030');c.fillRect(rnd()*256,rnd()*256,1,kind==='turf'?3:1)}if(kind==='stone'){c.strokeStyle='#777d7055';for(let y=0;y<256;y+=64){c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke();for(let x=(y%128?32:0);x<256;x+=96)c.strokeRect(x,y,96,64)}}const tx=new T.CanvasTexture(el);tx.colorSpace=T.SRGBColorSpace;tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(kind==='turf'?3:2,kind==='turf'?12:1);tx.anisotropy=renderer.capabilities.getMaxAnisotropy();return tx}
const turf=texture('turf'),stone=texture('stone');
// A clean checker-mown green, authored locally rather than a copied game asset.
const lawn=document.createElement('canvas');lawn.width=128;lawn.height=512;const lc=lawn.getContext('2d');
for(let y=0;y<16;y++)for(let x=0;x<4;x++){lc.fillStyle=(x+y)%2?'#55af45':'#479e3b';lc.fillRect(x*32,y*32,32,32)}
const lawnMap=new T.CanvasTexture(lawn);lawnMap.colorSpace=T.SRGBColorSpace;lawnMap.anisotropy=renderer.capabilities.getMaxAnisotropy();
function greenUV(geo){const pos=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+3)/6,(pos.getY(i)+13)/26);return geo}
const stoneMat=new T.MeshStandardMaterial({map:stone,roughness:.94,bumpMap:stone,bumpScale:.055});
function mesh(geo,mat,x,y,z){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function box(w,h,d,mat,x,y,z){return mesh(new T.BoxGeometry(w,h,d),mat,x,y,z)}
function rounded(w,h,d,mat,x,y,z){const r=Math.min(.065,w/5,h/5,d/5),shape=new T.Shape();shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const g=new T.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:2,steps:1,curveSegments:3});g.translate(0,0,-d/2+r);return mesh(g,mat,x,y,z)}
const railMat=new T.MeshStandardMaterial({color:'#f3e7cf',roughness:.55});

const land=new T.MeshStandardMaterial({color:'#74a95b',roughness:1});box(160,.5,160,land,0,-.65,0);const greenShape=new T.Shape();greenShape.moveTo(-3,-13);greenShape.lineTo(3,-13);greenShape.lineTo(3,13);greenShape.lineTo(-3,13);greenShape.closePath();const cutout=new T.Path();cutout.absarc(cup.x,-cup.z,.29,0,Math.PI*2,true);greenShape.holes.push(cutout);const green=mesh(greenUV(new T.ShapeGeometry(greenShape,48)),new T.MeshStandardMaterial({map:lawnMap,roughness:.9}),0,0,0);green.rotation.x=-Math.PI/2;
const stripes=[];for(let i=0;i<13;i++)if(Math.abs(-12+i*2-cup.z)>.8)stripes.push(box(5.96,.002,1,new T.MeshStandardMaterial({color:i%2?'#88a962':'#345e35',transparent:true,opacity:.08}),0,.002,-12+i*2));
rounded(.32,.48,26.6,railMat,-3.16,.1,0);rounded(.32,.48,26.6,railMat,3.16,.1,0);rounded(6.6,.48,.32,railMat,0,.1,-13.16);rounded(6.6,.48,.32,railMat,0,.1,13.16);
const obstacles=[];let movingGate,creek;
loadCourse=()=>{
 for(const m of obstacles){scene.remove(m);m.geometry.dispose()}obstacles.length=0;const course=courses[s.hole];
 const shape=new T.Shape();shape.moveTo(-3,-13);shape.lineTo(3,-13);shape.lineTo(3,13);shape.lineTo(-3,13);shape.closePath();const hole=new T.Path();hole.absarc(cup.x,-cup.z,.29,0,Math.PI*2,true);shape.holes.push(hole);
 if(course.water){const w=course.water,p=new T.Path();p.moveTo(w.x-w.w/2,-w.z-w.d/2);p.lineTo(w.x-w.w/2,-w.z+w.d/2);p.lineTo(w.x+w.w/2,-w.z+w.d/2);p.lineTo(w.x+w.w/2,-w.z-w.d/2);p.closePath();shape.holes.push(p);creek=mesh(new T.PlaneGeometry(w.w,w.d,12,12),new T.MeshPhysicalMaterial({color:'#29b8cf',metalness:.08,roughness:.22,clearcoat:1}),w.x,-.08,w.z);creek.rotation.x=-Math.PI/2;obstacles.push(creek)}else creek=null;
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
for(let i=0;i<42;i++){const side=i%2?1:-1,x=side*(7+rand()*28),z=-35+rand()*58,height=3+rand()*5;mesh(new T.CylinderGeometry(.12,.24,height,7),trunk,x,height/2-.4,z);for(let j=0;j<3;j++){const m=mesh(new T.IcosahedronGeometry(height*.28,2),leaf,x+(rand()-.5)*1.3,height*.6+j*.65,z+(rand()-.5));m.scale.y=1.2}}
for(let i=0;i<23;i++){const m=mesh(new T.DodecahedronGeometry(.25+rand()*.35,1),stoneMat,(i%2?1:-1)*(3.8+rand()*1.8),-.15,-14+rand()*28);m.scale.set(1,.6,1.2)}
for(let i=0;i<7;i++){const hill=mesh(new T.SphereGeometry(12+rand()*8,16,8),land,-55+i*18,-8,-52-rand()*12);hill.scale.y=.55}
const trim=new T.MeshStandardMaterial({color:'#d6b66d',metalness:.55,roughness:.35});
for(const side of [-1,1]){box(.035,.035,26,trim,side*3.01,.35,0);for(let z=-12;z<=12;z+=3){const bed=box(.6,.2,1.25,stoneMat,side*3.75,-.13,z);for(let j=0;j<4;j++){const flower=mesh(new T.SphereGeometry(.085,8,6),new T.MeshStandardMaterial({color:j%2?'#e8ca79':'#dca3bb'}),side*3.75+(j%2)*.17,.15,z-.4+j*.22);flower.castShadow=false}}}
// Surrounding park paths and sculpted planting give the lane a finished setting.
const pathMat=new T.MeshStandardMaterial({color:'#d9c79b',roughness:1});
for(const side of [-1,1]){box(1.35,.08,29,pathMat,side*4.75,-.29,0);for(let z=-13;z<14;z+=1.5)box(1.3,.012,.025,stoneMat,side*4.75,-.243,z);for(let z=-12;z<=12;z+=4){const bush=mesh(new T.SphereGeometry(.65,12,8),leaf,side*6,-.04,z);bush.scale.set(1,.8,1.35)}}
const cloudMat=new T.MeshBasicMaterial({color:'#f5fcff'});
for(let i=0;i<6;i++){for(let j=0;j<3;j++){const cloud=mesh(new T.SphereGeometry(2+j*.25,12,8),cloudMat,-32+i*14+j*2,17+(i%2)*4,-40-(i%3)*9);cloud.scale.set(1.8,.5,.7);cloud.castShadow=cloud.receiveShadow=false}}
const rippleMat=new T.MeshBasicMaterial({color:'#b8f4f4',transparent:true,opacity:.3,depthWrite:false});
for(let i=0;i<5;i++){const ripple=mesh(new T.RingGeometry(1+i*.65,1.025+i*.65,48),rippleMat,-10,-.325,-6);ripple.rotation.x=-Math.PI/2;ripple.scale.y=1.7;ripple.castShadow=false}
const teeRing=mesh(new T.TorusGeometry(.32,.015,8,48),trim,0,.025,11);teeRing.rotation.x=-Math.PI/2;
const ball=mesh(new T.SphereGeometry(.16,24,16),new T.MeshStandardMaterial({color:'#fffef4',roughness:.3}),s.x,.17,s.z);
const putter=new T.Group();const shaft=new T.Mesh(new T.CylinderGeometry(.018,.018,1.15,8),new T.MeshStandardMaterial({color:'#cdd6d8',metalness:.8,roughness:.23}));shaft.rotation.z=-.3;shaft.position.set(-.17,.58,0);putter.add(shaft);const head=new T.Mesh(new T.BoxGeometry(.4,.12,.12),shaft.material);head.position.y=.08;putter.add(head);scene.add(putter);
const aim=new T.ArrowHelper(new T.Vector3(0,0,-1),new T.Vector3(0,.07,11),2.4,0xf0d384,.3,.15);scene.add(aim);
const desired=new T.Vector3(),look=new T.Vector3();camera.position.set(0,6,20);look.set(0,0,6);
function resize(){const r=$('stage').getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe($('stage'));resize();
function controls(){for(const id of ['aim','power'])$(id).disabled=s.done||s.strokes>=10||swing>0||room.locked();$('putt').disabled=s.moving||s.done||s.strokes>=10||swing>0||room.locked();$('reset').hidden=room.active();$('nextHole').hidden=room.active();$('score').textContent=s.strokes+' stroke'+(s.strokes===1?'':'s')}
$('putt').onclick=()=>{if(s.moving||s.done||s.strokes>=10||swing||room.locked())return;unlock();pendingShot=[+$('aim').value*Math.PI/180,+$('power').value/100,(performance.now()/1000)%1000];swing=.38;drag=null;controls();$('status').textContent='Putting…'};
$('reset').onclick=()=>{if(room.active())return;resetGame();$('status').textContent='New round. Aim, set power, and putt.';controls()};$('view').onclick=()=>{overview=!overview;$('view').textContent=overview?'Ball view':'Course view'};
$('nextHole').onclick=()=>{if(!room.active())resetGame((s.hole+1)%courses.length)};
$('power').oninput=()=>$('powerText').textContent=$('power').value+'%';
let drag=null;
function setAim(value){$('aim').value=((value+540)%360)-180;$('aimPad').setAttribute('aria-valuenow',String(Math.round(+$('aim').value)));$('aimStick').style.rotate=$('aim').value+'deg'}
function canAim(){return !s.done&&s.strokes<10&&!swing&&!room.locked()}
const ray=new T.Raycaster(),ground=new T.Plane(new T.Vector3(0,1,0),0);
function groundPoint(x,y){const r=$('course').getBoundingClientRect();ray.setFromCamera(new T.Vector2((x-r.left)/r.width*2-1,1-(y-r.top)/r.height*2),camera);return ray.ray.intersectPlane(ground,new T.Vector3())}
for(const target of [$('course'),$('aimPad')]){
 target.addEventListener('pointerdown',e=>{if(!canAim()||drag||e.button!==0||(target===$('course')&&s.moving))return;unlock();target.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,angle:+$('aim').value,id:e.pointerId,course:target===$('course'),point:groundPoint(e.clientX,e.clientY),distance:0};e.preventDefault()});
 target.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||!canAim())return;drag.distance=Math.hypot(e.clientX-drag.x,e.clientY-drag.y);if(drag.course){const point=groundPoint(e.clientX,e.clientY);if(point&&drag.point&&drag.distance>8){const d=drag.point.clone().sub(point);setAim(Math.atan2(d.x,-d.z)*180/Math.PI);$('power').value=Math.round(Math.min(100,Math.max(5,drag.distance/Math.min(220,innerHeight*.28)*100)));$('power').oninput();$('status').textContent='Release to putt · '+$('power').value+'% power';}}else setAim(drag.angle+(e.clientX-drag.x)*1.4);e.preventDefault()});
 target.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const shoot=drag.course&&drag.distance>12;drag=null;if(shoot)$('putt').click()});
 for(const type of ['pointercancel','lostpointercapture'])target.addEventListener(type,()=>{drag=null});
}
window.addEventListener('blur',()=>{drag=null;rolling(0)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){drag=null;rolling(0)}});
$('aimPad').addEventListener('keydown',e=>{if(canAim()&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setAim(+$('aim').value+(e.key==='ArrowRight'?3:-3))}});

function frame(now){const dt=Math.min((now-last)/1000||0,.25);last=now;if(document.hidden){requestAnimationFrame(frame);return}if(swing>0){swing-=dt;if(swing<=0){swing=0;hit(s,...pendingShot);shots.push(pendingShot);room.save(shots);tone();pendingShot=null;$('status').textContent='Ball rolling. You can adjust aim and power for your next putt.';controls()}}
const moving=s.moving;acc+=dt;while(acc>=1/120){step(s,1/120);if(s.bounced)bounce();acc-=1/120}rolling(s.moving&&s.y===0?Math.hypot(s.vx,s.vz):0);if(moving&&!s.moving){if(s.penalty)splash();$('status').textContent=s.done?'In the cup! Finished in '+s.strokes+' strokes. Restart to beat your score.':s.penalty?'Water! One penalty stroke. Back to your last safe shot.':'Ball stopped. Line up your next putt.';if(s.done||s.strokes>=10)finished();controls()}
ball.position.set(s.x,s.done?Math.max(-.3,ball.position.y-dt*.8):.17+s.y,s.z);ball.visible=!s.done||ball.position.y>-.29;pin.visible=flag.visible=Math.hypot(s.x-cup.x,s.z-cup.z)>3&&!s.done;ball.rotation.x+=s.vz*dt/.16;ball.rotation.z-=s.vx*dt/.16;
controls();
const angle=+$('aim').value*Math.PI/180;aim.visible=!s.moving&&!s.done&&!swing;aim.position.set(s.x,.09,s.z);aim.setDirection(new T.Vector3(Math.sin(angle),0,-Math.cos(angle)));aim.setLength(.8+(+$('power').value/100)*2.4,.22,.12);
putter.visible=!s.moving&&!s.done;putter.position.set(s.x-Math.sin(angle)*(.28+swing),0,s.z+Math.cos(angle)*(.28+swing));putter.rotation.y=-angle;
if(!drag?.course){if(overview){desired.set(14,22,19);look.lerp(new T.Vector3(0,0,0),.08)}else{desired.set(s.x*.65+1.1,6.6,s.z+8.7);look.lerp(new T.Vector3(s.x,.05,s.z-3),1-Math.exp(-dt*4))}camera.position.lerp(desired,1-Math.exp(-dt*4));camera.lookAt(look);}
const pos=flag.geometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(now*.003+flagBase[i*3]*5)*.045*(flagBase[i*3]+.43));pos.needsUpdate=true;water.material.opacity=.83+Math.sin(now*.0008)*.03;if(movingGate)movingGate.position.x=gateAt(s.hole,s.moving?s.time:(now/1000)%1000).x;if(creek){const p=creek.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(now*.003+p.getX(i)*4+p.getY(i)*2)*.015);p.needsUpdate=true}renderer.render(scene,camera);requestAnimationFrame(frame)}
$('loading').hidden=true;$('putt').disabled=false;requestAnimationFrame(frame);
}catch(e){$('loading').textContent='3D graphics could not start. Try an updated browser with graphics acceleration enabled.';console.error(e)}

// Native fullscreen where supported, with an expanded browser layout elsewhere.
let expanded=false,scrollBefore=0;
function fullscreenLabel(){document.body.classList.toggle('game-fullscreen',expanded);$('fullscreen').textContent=expanded?'Exit full screen':'Full screen';$('fullscreen').setAttribute('aria-pressed',String(expanded))}
$('fullscreen').onclick=async()=>{if(expanded){if(document.fullscreenElement)await document.exitFullscreen().catch(()=>{});expanded=false;fullscreenLabel();window.scrollTo(0,scrollBefore)}else{scrollBefore=scrollY;expanded=true;fullscreenLabel();if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen().catch(()=>{});}};
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&expanded){expanded=false;fullscreenLabel();window.scrollTo(0,scrollBefore)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&expanded&&!document.fullscreenElement){expanded=false;fullscreenLabel();window.scrollTo(0,scrollBefore)}});
