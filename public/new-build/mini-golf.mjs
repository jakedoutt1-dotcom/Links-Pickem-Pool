import {connectRoom} from './mini-golf-room.mjs?v=1';
import {tone,unlock,setupSound,bounce} from './mini-golf-sound.mjs?v=2';
import * as T from './vendor/three/three.module.min.js';
import {create,hit,step,blocks,cup,replayShots} from './mini-golf-core.mjs?v=controls5';
const $=id=>document.getElementById(id);let s=create(),overview=false,acc=0,last=0,swing=0,pendingShot=null;
let shots=[],celebrationTimer;setupSound($('sound'));
function resetGame(){s=create();shots=[];swing=0;pendingShot=null;acc=0;$('celebration').hidden=true;clearTimeout(celebrationTimer)}
const room=connectRoom({reset:resetGame,restore(log){s=replayShots(log);shots=log;if(s.done||s.strokes>=10)room.finish(shots)}});
function finished(){const ace=s.done&&s.strokes===1;const box=$('celebration');box.replaceChildren();const title=document.createElement('strong');title.className='celebration-title';title.textContent=s.done?(ace?'HOLE IN ONE!':'NICE PUTT!'):'HOLE COMPLETE';box.append(title);const sub=document.createElement('small');sub.textContent=s.strokes+' strokes'+(room.active()?' · Waiting for the group':'');box.append(sub);if(s.done){tone(true,ace);for(let i=0;i<(ace?65:25);i++){const el=document.createElement('i');el.style.left=(i*37%100)+'%';el.style.animationDelay=(i%8)*.08+'s';box.append(el)}}box.hidden=false;clearTimeout(celebrationTimer);celebrationTimer=setTimeout(()=>box.hidden=true,ace?6500:4500);room.finish(shots)}
try{
const renderer=new T.WebGLRenderer({canvas:$('course'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
const scene=new T.Scene();scene.background=new T.Color('#b8d4da');scene.fog=new T.Fog('#b8d4da',35,115);const camera=new T.PerspectiveCamera(48,1,.1,180);
scene.add(new T.HemisphereLight('#e6f2ff','#4f6142',2));const sun=new T.DirectionalLight('#ffedc7',3.2);sun.position.set(-12,24,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:70});sun.shadow.bias=-.0005;scene.add(sun);
function texture(kind){const el=document.createElement('canvas');el.width=el.height=256;const c=el.getContext('2d');c.fillStyle=kind==='turf'?'#477e3d':'#b9b3a4';c.fillRect(0,0,256,256);let seed=44;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=0;i<22000;i++){c.fillStyle=kind==='turf'?(i%2?'#98b96c38':'#143e2a38'):(i%2?'#f4eedb30':'#45494030');c.fillRect(rnd()*256,rnd()*256,1,kind==='turf'?3:1)}if(kind==='stone'){c.strokeStyle='#777d7055';for(let y=0;y<256;y+=64){c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke();for(let x=(y%128?32:0);x<256;x+=96)c.strokeRect(x,y,96,64)}}const tx=new T.CanvasTexture(el);tx.colorSpace=T.SRGBColorSpace;tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(kind==='turf'?3:2,kind==='turf'?12:1);tx.anisotropy=renderer.capabilities.getMaxAnisotropy();return tx}
const turf=texture('turf'),stone=texture('stone');const stoneMat=new T.MeshStandardMaterial({map:stone,roughness:.94,bumpMap:stone,bumpScale:.055});
function mesh(geo,mat,x,y,z){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function box(w,h,d,mat,x,y,z){return mesh(new T.BoxGeometry(w,h,d),mat,x,y,z)}
const land=new T.MeshStandardMaterial({color:'#567649',roughness:1});box(160,.5,160,land,0,-.65,0);const greenShape=new T.Shape();greenShape.moveTo(-3,-13);greenShape.lineTo(3,-13);greenShape.lineTo(3,13);greenShape.lineTo(-3,13);greenShape.closePath();const cutout=new T.Path();cutout.absarc(cup.x,-cup.z,.29,0,Math.PI*2,true);greenShape.holes.push(cutout);const green=mesh(new T.ShapeGeometry(greenShape,48),new T.MeshStandardMaterial({map:turf,roughness:.96,bumpMap:turf,bumpScale:.025}),0,0,0);green.rotation.x=-Math.PI/2;
for(let i=0;i<13;i++)if(Math.abs(-12+i*2-cup.z)>.8)box(5.96,.002,1,new T.MeshStandardMaterial({color:i%2?'#88a962':'#345e35',transparent:true,opacity:.08}),0,.002,-12+i*2);
box(.32,.48,26.6,stoneMat,-3.16,.1,0);box(.32,.48,26.6,stoneMat,3.16,.1,0);box(6.6,.48,.32,stoneMat,0,.1,-13.16);box(6.6,.48,.32,stoneMat,0,.1,13.16);
for(const b of blocks)box(b.w,.4,b.d,stoneMat,b.x,.2,b.z);
// Dark recessed cup with a metal rim.
const dark=new T.MeshStandardMaterial({color:'#03120a',roughness:1});mesh(new T.CylinderGeometry(.29,.29,.025,40),dark,cup.x,-.28,cup.z);const rim=mesh(new T.TorusGeometry(.295,.018,8,40),new T.MeshStandardMaterial({color:'#a7ab8e',metalness:.5,roughness:.4}),cup.x,.022,cup.z);rim.rotation.x=Math.PI/2;
const pin=mesh(new T.CylinderGeometry(.025,.025,1.7,12),new T.MeshStandardMaterial({color:'#dedacc',metalness:.4,roughness:.4}),0,.86,-11);
const logo=new T.TextureLoader().load('/links-small-logo.png');logo.colorSpace=T.SRGBColorSpace;
const flag=mesh(new T.PlaneGeometry(.85,.35,10,3),new T.MeshStandardMaterial({map:logo,transparent:true,side:T.DoubleSide,roughness:.9}),.43,1.5,-11);const flagBase=Float32Array.from(flag.geometry.attributes.position.array);
function sign(x,z,title){box(1.8,.85,.13,new T.MeshStandardMaterial({color:'#10251c',roughness:.5}),x,.95,z);for(const dx of [-.65,.65])box(.07,.7,.07,stoneMat,x+dx,.3,z);const face=mesh(new T.PlaneGeometry(1.58,.53),new T.MeshBasicMaterial({map:logo,transparent:true}),x,1.06,z+.075);face.castShadow=false;
const cv=document.createElement('canvas');cv.width=512;cv.height=80;const ct=cv.getContext('2d');ct.fillStyle='#e9cf8c';ct.font='600 27px Arial';ct.textAlign='center';ct.fillText(title,256,49);const tx=new T.CanvasTexture(cv);mesh(new T.PlaneGeometry(1.6,.25),new T.MeshBasicMaterial({map:tx,transparent:true}),x,.69,z+.076)}
sign(-4.5,-4,'PICKS. POOLS. PEOPLE.');sign(4.6,-9,'YOUR VENUE HERE · SAMPLE');
// Pond, rocks and layered trees surround the playable lane.
const water=mesh(new T.CircleGeometry(5,64),new T.MeshPhysicalMaterial({color:'#408f9b',metalness:.38,roughness:.17,transparent:true,opacity:.85,clearcoat:1}),-10,-.35,-6);water.rotation.x=-Math.PI/2;water.scale.set(1,1.7,1);
let seed=6;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const leaf=new T.MeshStandardMaterial({color:'#376344',roughness:1});const trunk=new T.MeshStandardMaterial({color:'#6b5540',roughness:1});
for(let i=0;i<42;i++){const side=i%2?1:-1,x=side*(7+rand()*28),z=-35+rand()*58,height=3+rand()*5;mesh(new T.CylinderGeometry(.12,.24,height,7),trunk,x,height/2-.4,z);for(let j=0;j<3;j++){const m=mesh(new T.IcosahedronGeometry(height*.28,2),leaf,x+(rand()-.5)*1.3,height*.6+j*.65,z+(rand()-.5));m.scale.y=1.2}}
for(let i=0;i<23;i++){const m=mesh(new T.DodecahedronGeometry(.25+rand()*.35,1),stoneMat,(i%2?1:-1)*(3.8+rand()*1.8),-.15,-14+rand()*28);m.scale.set(1,.6,1.2)}
for(let i=0;i<7;i++){const hill=mesh(new T.SphereGeometry(12+rand()*8,16,8),land,-55+i*18,-8,-52-rand()*12);hill.scale.y=.55}
const ball=mesh(new T.SphereGeometry(.16,24,16),new T.MeshStandardMaterial({color:'#fffef4',roughness:.3}),s.x,.17,s.z);
const putter=new T.Group();const shaft=new T.Mesh(new T.CylinderGeometry(.018,.018,1.15,8),new T.MeshStandardMaterial({color:'#cdd6d8',metalness:.8,roughness:.23}));shaft.rotation.z=-.3;shaft.position.set(-.17,.58,0);putter.add(shaft);const head=new T.Mesh(new T.BoxGeometry(.4,.12,.12),shaft.material);head.position.y=.08;putter.add(head);scene.add(putter);
const aim=new T.ArrowHelper(new T.Vector3(0,0,-1),new T.Vector3(0,.07,11),2.4,0xf0d384,.3,.15);scene.add(aim);
const desired=new T.Vector3(),look=new T.Vector3();camera.position.set(0,6,20);look.set(0,0,6);
function resize(){const r=$('stage').getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe($('stage'));resize();
function controls(){for(const id of ['aim','power'])$(id).disabled=s.done||s.strokes>=10||swing>0||room.locked();$('putt').disabled=s.moving||s.done||s.strokes>=10||swing>0||room.locked();$('reset').hidden=room.active();$('score').textContent=s.strokes+' stroke'+(s.strokes===1?'':'s')}
$('putt').onclick=()=>{if(s.moving||s.done||s.strokes>=10||swing||room.locked())return;unlock();pendingShot=[+$('aim').value*Math.PI/180,+$('power').value/100];swing=.38;drag=null;controls();$('status').textContent='Putting…'};
$('reset').onclick=()=>{if(room.active())return;resetGame();$('status').textContent='New round. Aim, set power, and putt.';controls()};$('view').onclick=()=>{overview=!overview;$('view').textContent=overview?'Ball view':'Course view'};
$('power').oninput=()=>$('powerText').textContent=$('power').value+'%';
let drag=null;
function setAim(value){$('aim').value=((value+540)%360)-180;$('aimPad').setAttribute('aria-valuenow',String(Math.round(+$('aim').value)));$('aimStick').style.rotate=$('aim').value+'deg'}
function canAim(){return !s.done&&s.strokes<10&&!swing&&!room.locked()}
for(const target of [$('course'),$('aimPad')]){
 target.addEventListener('pointerdown',e=>{if(!canAim())return;target.setPointerCapture(e.pointerId);drag={x:e.clientX,angle:+$('aim').value,id:e.pointerId};e.preventDefault()});
 target.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId&&canAim()){setAim(drag.angle+(e.clientX-drag.x)*(target===$('aimPad')?1.4:.45));e.preventDefault()}});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])target.addEventListener(type,()=>drag=null);
}
$('aimPad').addEventListener('keydown',e=>{if(canAim()&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setAim(+$('aim').value+(e.key==='ArrowRight'?3:-3))}});

function frame(now){const dt=Math.min((now-last)/1000||0,.25);last=now;if(document.hidden){requestAnimationFrame(frame);return}if(swing>0){swing-=dt;if(swing<=0){swing=0;hit(s,...pendingShot);shots.push(pendingShot);room.save(shots);tone();pendingShot=null;$('status').textContent='Ball rolling. You can adjust aim and power for your next putt.';controls()}}
const moving=s.moving;acc+=dt;while(acc>=1/120){step(s,1/120);if(s.bounced)bounce();acc-=1/120}if(moving&&!s.moving){$('status').textContent=s.done?'In the cup! Finished in '+s.strokes+' strokes. Restart to beat your score.':'Ball stopped. Line up your next putt.';if(s.done||s.strokes>=10)finished();controls()}
ball.position.set(s.x,s.done?Math.max(-.3,ball.position.y-dt*.8):.17,s.z);ball.visible=!s.done||ball.position.y>-.29;pin.visible=flag.visible=Math.hypot(s.x-cup.x,s.z-cup.z)>3&&!s.done;ball.rotation.x+=s.vz*dt/.16;ball.rotation.z-=s.vx*dt/.16;
controls();
const angle=+$('aim').value*Math.PI/180;aim.visible=!s.moving&&!s.done&&!swing;aim.position.set(s.x,.09,s.z);aim.setDirection(new T.Vector3(Math.sin(angle),0,-Math.cos(angle)));aim.setLength(.8+(+$('power').value/100)*2.4,.22,.12);
putter.visible=!s.moving&&!s.done;putter.position.set(s.x-Math.sin(angle)*(.28+swing),0,s.z+Math.cos(angle)*(.28+swing));putter.rotation.y=-angle;
if(overview){desired.set(14,22,19);look.lerp(new T.Vector3(0,0,0),.08)}else{desired.set(s.x*.65,5.2,s.z+8.5);look.lerp(new T.Vector3(s.x,.05,s.z-3),.08)}camera.position.lerp(desired,1-Math.exp(-dt*4));camera.lookAt(look);
const pos=flag.geometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(now*.003+flagBase[i*3]*5)*.045*(flagBase[i*3]+.43));pos.needsUpdate=true;water.material.opacity=.83+Math.sin(now*.0008)*.03;renderer.render(scene,camera);requestAnimationFrame(frame)}
$('loading').hidden=true;$('putt').disabled=false;requestAnimationFrame(frame);
}catch(e){$('loading').textContent='3D graphics could not start. Try an updated browser with graphics acceleration enabled.';console.error(e)}
