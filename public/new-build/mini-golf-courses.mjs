// Shared by the renderer and server replay. Add holes here; room rotation uses this list.
// Current terrain is a 6 x 26 metre lane. Coordinates: tee (0,11), cup (0,-11).
// Obstacles and water use x/z centres with w/d dimensions. Ramp has x/z and width w.
// Gate moves on a repeatable sine path. Wind x/z is acceleration on airborne shots only.
// Keep new visual geometry aligned with these collision definitions. Curves/elevation
// require matching core physics before adding them as playable terrain. Bump rulesVersion
// when changing physics; legacy rooms retain their rules. Add new palettes in themes.
export const courses=[
 {id:'garden',name:'The Garden',par:3,theme:'garden',preview:'./assets/putt-club-garden-preview-v1.png',description:'Calm parkland. Learn the banks and leave a gentle putt for the cup.',hint:'Bank off the borders. No wind or water penalty on this hole.',wind:null,blocks:[{x:-1.85,z:2.5,w:2.3,d:.45},{x:1.85,z:-3,w:2.3,d:.45}],water:null,ramp:null,gate:null},
 {id:'creek',name:'Creek Crossing',par:4,theme:'creek',preview:'./assets/putt-club-creek-preview-v1.png',description:'A running creek, narrow jump ramp and moving gate. Take the dry route or risk the jump.',hint:'Water adds one stroke. The narrow ramp can carry you over the creek.',wind:null,blocks:[{x:2.35,z:3,w:1.3,d:.4}],water:{x:-.6,z:0,w:4.8,d:3},ramp:{x:-1.1,z:2.3,w:.65},gate:{x:1.3,z:-5,w:1.9,d:.35}},
 {id:'lakeside',name:'Hidden Bend',par:4,theme:'lakeside',preview:'./assets/putt-club-lakeside-preview-v1.png',description:'A lakeside lane with a hidden jump line, moving gate and light crosswind in the air.',hint:'Breeze pushes airborne shots to the right. The dry path is safer.',wind:{x:.55,z:0},blocks:[{x:-1.7,z:5,w:2.6,d:.4},{x:2.5,z:-5,w:1,d:.4}],water:{x:.6,z:-1,w:4.8,d:3.5},ramp:{x:1.5,z:1.55,w:.55},gate:{x:0,z:-7,w:2,d:.4}}
];
export const themes={garden:{sky:'#75c8f1',grass:'#78ad5f',leaves:'#438d42',trunk:'#79573b',water:'#29aaca',rail:'#f0e5ce'},creek:{sky:'#91d9f3',grass:'#5b9662',leaves:'#35795b',trunk:'#75624c',water:'#2aa4b9',rail:'#c7c5b8'},lakeside:{sky:'#5bc5f7',grass:'#b7ba75',leaves:'#3f9756',trunk:'#8c6c43',water:'#219ddd',rail:'#efe5c9'}};
