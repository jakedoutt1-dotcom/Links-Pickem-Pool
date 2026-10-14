// Shared by the renderer and server replay. Add holes here; room rotation uses this list.
// Current terrain is a 6 x 26 metre lane. Coordinates: tee (0,11), cup (0,-11).
// Obstacles and water use x/z centres with w/d dimensions. Ramp has x/z and width w.
// Gate moves on a repeatable sine path. Wind x/z is acceleration on airborne shots only.
// Keep new visual geometry aligned with these collision definitions. Curves/elevation
// require matching core physics before adding them as playable terrain. Bump rulesVersion
// when changing physics; legacy rooms retain their rules. Add new palettes in themes.
export const legacyCourses=[
 {id:'garden',name:'The Garden',par:3,theme:'garden',preview:'./assets/putt-club-garden-preview-v1.png',description:'Calm parkland. Learn the banks and leave a gentle putt for the cup.',hint:'Bank off the borders. No wind or water penalty on this hole.',wind:null,blocks:[{x:-1.85,z:2.5,w:2.3,d:.45},{x:1.85,z:-3,w:2.3,d:.45}],water:null,ramp:null,gate:null},
 {id:'creek',name:'Creek Crossing',par:4,theme:'creek',preview:'./assets/putt-club-creek-preview-v1.png',description:'A running creek, narrow jump ramp and moving gate. Take the dry route or risk the jump.',hint:'Water adds one stroke. The narrow ramp can carry you over the creek.',wind:null,blocks:[{x:2.35,z:3,w:1.3,d:.4}],water:{x:-.6,z:0,w:4.8,d:3},ramp:{x:-1.1,z:2.3,w:.65},gate:{x:1.3,z:-5,w:1.9,d:.35}},
 {id:'lakeside',name:'Hidden Bend',par:4,theme:'lakeside',preview:'./assets/putt-club-lakeside-preview-v1.png',description:'A lakeside lane with a hidden jump line, moving gate and light crosswind in the air.',hint:'Breeze pushes airborne shots to the right. The dry path is safer.',wind:{x:.55,z:0},blocks:[{x:-1.7,z:5,w:2.6,d:.4},{x:2.5,z:-5,w:1,d:.4}],water:{x:.6,z:-1,w:4.8,d:3.5},ramp:{x:1.5,z:1.55,w:.55},gate:{x:0,z:-7,w:2,d:.4}}
];
export const version3Courses=legacyCourses.map(c=>({...c,ramp:c.ramp?{...c.ramp,w:c.id==='creek'?1.9:1.6,d:1.4}:null,description:c.description.replace('narrow jump ramp','wide jump ramp'),hint:c.hint.replace('The narrow ramp','The marked ramp')}));
// Layout principles: https://miniaturegolfconstruction.com/miniature-golf-course-design/
// and https://micro-golf.com/adventure-golf/ . All hole layouts below are original.
// Rules 4 adds a full round. Every water hazard leaves a dry side route.
const block=(x,z,w,d=.45)=>({x,z,w,d});
const water=(x,z,w,d)=>({x,z,w,d});
const ramp=(x,z,w=1.8)=>({x,z,w,d:1.4});
const mill=(x,z,speed=.8,phase=0)=>({x,z,w:3.2,d:.3,speed,phase,hubHeight:1.3,bladeLength:1.55});
const hole=(id,name,par,theme,blocks=[],water=null,ramp=null,gate=null,wind=null,windmill=null)=>({id,name,par,theme,preview:`./assets/putt-club-${theme}-preview-v1.png`,description:`${name}: choose the safe line or take on the obstacles.`,hint:water?'Use the dry side lane, or line up the marked ramp. Water costs one stroke.':windmill?'Time the rotating blades, or bank around the outside.':'Read the banks and leave a gentle final putt.',blocks,water,ramp,gate,wind,windmill});
export const courses=[
 {...version3Courses[0],id:'opening-green',name:'Opening Green',par:3},
 hole('bank-school','Bank School',3,'garden',[block(-1.8,4,2.2),block(1.8,-3,2.2)]),
 hole('split-fairway','Split Fairway',3,'garden',[block(0,3,1.4,1.4),block(-1.9,-4,1.6)]),
 hole('first-splash','First Splash',4,'creek',[],water(-1,0,3.6,2),ramp(-.9,2)),
 hole('windmill-walk','Windmill Walk',4,'garden',[],null,null,null,null,mill(0,-1,.65)),
 hole('zigzag','Zigzag Gardens',4,'garden',[block(-1.8,6,2.2),block(1.8,0,2.2),block(-1.8,-6,2.2)]),
 hole('riverside-run','Riverside Run',4,'creek',[block(1.9,5,1.4)],water(-1.1,-1,3.4,2.8),ramp(-1,1.4)),
 hole('bridge-breeze','Bridge Breeze',4,'lakeside',[],water(1,-1,3.6,2.8),ramp(.9,1.4),null,{x:.3,z:0}),
 hole('front-nine-finale','Front Nine Finale',4,'garden',[block(-1.9,5,1.6),block(1.9,-5,1.6)],null,null,null,null,mill(0,0,.9,.6)),
 hole('canal-bank','Canal Bank',4,'creek',[block(-1.8,-5,2)],water(.9,1,3.6,2.2),ramp(.8,3.2)),
 hole('gatekeeper','The Gatekeeper',4,'garden',[block(-2,4,1.5)],null,null,{x:0,z:-3,w:1.8,d:.35}),
 hole('windmill-garden','Windmill Garden',4,'garden',[block(1.9,5,1.6),block(-1.9,-6,1.6)],null,null,null,null,mill(.25,-1,1.05,1.2)),
 hole('long-water','Long Water',5,'creek',[],water(-.9,-1,3.8,3.6),ramp(-.8,2),null,{x:.2,z:0}),
 hole('double-bank','Double Bank',4,'garden',[block(0,5,1.5,1),block(-1.9,0,1.7),block(1.9,-5,1.7)]),
 hole('crosswind-creek','Crosswind Creek',5,'lakeside',[block(-1.9,-6,1.6)],water(.9,0,3.6,3),ramp(.8,2.5),null,{x:-.45,z:.1}),
 hole('clockwork','Clockwork',5,'garden',[block(-1.9,5,1.6)],null,null,{x:0,z:-6,w:1.5,d:.35},null,mill(0,0,1.15,2)),
 hole('final-crossing','Final Crossing',5,'creek',[block(1.9,6,1.6)],water(-.9,0,3.8,3.2),ramp(-.8,2.7),{x:0,z:-6,w:1.5,d:.35},{x:.35,z:0}),
 hole('clubhouse-finale','Clubhouse Finale',5,'lakeside',[],water(.9,3,3.6,2.4),ramp(.8,5.2),null,{x:-.3,z:0},mill(0,-4,.85,.8))
];
export function coursesFor(rulesVersion=4){return rulesVersion>=4?courses:rulesVersion>=3?version3Courses:legacyCourses}
export function courseFor(hole,rulesVersion=4){return coursesFor(rulesVersion)[hole]}
export const themes={garden:{sky:'#75c8f1',grass:'#78ad5f',leaves:'#438d42',trunk:'#79573b',water:'#29aaca',rail:'#f0e5ce'},creek:{sky:'#91d9f3',grass:'#5b9662',leaves:'#35795b',trunk:'#75624c',water:'#2aa4b9',rail:'#c7c5b8'},lakeside:{sky:'#5bc5f7',grass:'#b7ba75',leaves:'#3f9756',trunk:'#8c6c43',water:'#219ddd',rail:'#efe5c9'}};
