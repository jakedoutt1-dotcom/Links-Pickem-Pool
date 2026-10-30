// A skinned character mesh: hips, upper/lower legs, shoulders and elbows move
// independently. The artwork is a texture on the rig, not a rigid billboard.
const vertex=`
precision highp float;
attribute vec2 uv;
uniform float clock,variant,motion;
varying vec2 tex;
vec2 turn(vec2 p,vec2 joint,float angle){vec2 d=(p-joint)*vec2(.666667,1.);float c=cos(angle),s=sin(angle);return joint+vec2(c*d.x-s*d.y,s*d.x+c*d.y)/vec2(.666667,1.);}
void main(){
 tex=uv;vec2 p=uv;float phase=clock*6.8,beat=sin(phase),other=sin(phase+3.141593),leftLift=max(0.,beat),rightLift=max(0.,other);
 float legs=smoothstep(.55,.65,uv.y),right=smoothstep(.49,.57,uv.x),calf=smoothstep(.73,.88,uv.y);
 vec2 l=turn(uv,vec2(.43,.59),-.10*leftLift*motion);l=mix(l,turn(l,vec2(.41,.76),.24*leftLift*motion),calf);
 vec2 r=turn(uv,vec2(.61,.59),.10*rightLift*motion);r=mix(r,turn(r,vec2(.65,.76),-.24*rightLift*motion),calf);
 l.y-=.047*leftLift*motion*smoothstep(.6,.94,uv.y);r.y-=.047*rightLift*motion*smoothstep(.6,.94,uv.y);
 l.x-=.025*leftLift*motion*calf;r.x+=.025*rightLift*motion*calf;
 vec2 lower=mix(l,r,right);
 float hipAngle=beat*mix(.018,.058,variant)*motion;vec2 upper=turn(uv,vec2(.52,.59),hipAngle);upper.y-=abs(sin(phase*2.))*.006*motion;
 p=mix(upper,lower,legs);
 float leftArm=(1.-smoothstep(.27,.43,uv.x))*smoothstep(.24,.34,uv.y)*(1.-smoothstep(.56,.64,uv.y));
 float rightArm=smoothstep(.69,.84,uv.x)*smoothstep(.25,.35,uv.y)*(1.-smoothstep(.53,.62,uv.y));
 vec2 armL=turn(uv,vec2(.35,.31),beat*.12*motion);armL=turn(armL,vec2(.24,.44),sin(phase+.6)*.16*motion*(1.-smoothstep(.18,.31,uv.x)));
 vec2 armR=turn(uv,vec2(.69,.32),-beat*.13*motion);armR=turn(armR,vec2(.81,.43),-sin(phase+.6)*.18*motion*smoothstep(.77,.9,uv.x));
 if(variant>.5){leftArm=(1.-smoothstep(.29,.43,uv.x))*(1.-smoothstep(.36,.49,uv.y));rightArm=smoothstep(.68,.82,uv.x)*(1.-smoothstep(.43,.53,uv.y));armL=turn(uv,vec2(.36,.32),sin(phase*.7)*.16*motion);armL=turn(armL,vec2(.21,.22),sin(phase*1.1)*.22*motion*(1.-smoothstep(.15,.25,uv.y)));armR=turn(uv,vec2(.67,.34),sin(phase*.7+1.)*.16*motion);armR=turn(armR,vec2(.79,.34),sin(phase*1.1+1.)*.20*motion*(1.-smoothstep(.23,.34,uv.y)));}
 p+=(armL-uv)*leftArm+(armR-uv)*rightArm;
 float head=1.-smoothstep(.22,.29,uv.y);p+= (turn(uv,vec2(.5,.22),sin(phase*.5)*.025*motion)-uv)*head;
 if(variant>1.5){p=uv;float seatedBeat=sin(clock*2.1);float torso=1.-smoothstep(.43,.59,uv.y);p.x+=seatedBeat*.004*motion*torso;float headWeight=1.-smoothstep(.17,.24,uv.y);p+=(turn(uv,vec2(.51,.23),seatedBeat*.025*motion)-uv)*headWeight;float hand=(1.-smoothstep(.35,.49,uv.x))*smoothstep(.22,.3,uv.y)*(1.-smoothstep(.45,.54,uv.y));p+=(turn(uv,vec2(.34,.39),sin(clock*1.7)*.045*motion)-uv)*hand;}
 gl_Position=vec4((p.x-.5)*1.84,(.5-p.y)*1.84,0.,1.);
}`;
const fragment=`precision mediump float;uniform sampler2D sprite;varying vec2 tex;void main(){gl_FragColor=texture2D(sprite,tex);}`;
function program(gl){const compile=(kind,source)=>{const shader=gl.createShader(kind);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Character shader unavailable');return shader};const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Character rig unavailable');return p}
export function createActorAnimator(image,kind){
 const surface=document.createElement('canvas');surface.width=384;surface.height=576;const fallback=softwareAnimator(image,kind);let gl;
 try{gl=surface.getContext('webgl',{alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true,antialias:false,depth:false});if(!gl)throw Error('No GPU');const p=program(gl);gl.useProgram(p);const vertices=[],cols=26,rows=40;for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=[x/cols,y/rows],b=[(x+1)/cols,y/rows],c=[x/cols,(y+1)/rows],d=[(x+1)/cols,(y+1)/rows];vertices.push(...a,...b,...c,...b,...d,...c)}const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);const attribute=gl.getAttribLocation(p,'uv');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.uniform1i(gl.getUniformLocation(p,'sprite'),0);gl.uniform1f(gl.getUniformLocation(p,'variant'),kind.startsWith('seated')?2:kind==='dancer'?1:0);const clock=gl.getUniformLocation(p,'clock'),motion=gl.getUniformLocation(p,'motion');gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.viewport(0,0,surface.width,surface.height);
  return {surface,render(time,phase=0,reduced=false){if(gl.isContextLost())return fallback.render(time,phase,reduced);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(clock,time+phase);gl.uniform1f(motion,reduced?.65:1);gl.drawArrays(gl.TRIANGLES,0,vertices.length/2);return surface}};
 }catch{return fallback}
 // Every fallback still bends limbs; it never substitutes a sliding still.
}

// Software mesh for devices with WebGL disabled. Triangles share deformed
// vertices, keeping the body continuous through the walking/dancing cycle.
function softwareAnimator(image,kind){
 const surface=document.createElement('canvas');surface.width=256;surface.height=384;const ctx=surface.getContext('2d'),cols=14,rows=24;
 function point(u,v,time,phase,motion){const t=(time+phase)*6.8;if(kind.startsWith('seated')){const upper=Math.max(0,1-v/.6),head=Math.max(0,1-v/.25),arm=u<.46&&v>.23&&v<.53;return [(.04+u*.92+Math.sin(t*.31)*(.005*upper+.008*head)*motion)*256,(.04+v*.92+(arm?Math.sin(t*.25)*.009*motion:0))*384]}const left=u<.53,lift=Math.max(0,Math.sin(t+(left?0:Math.PI))),leg=Math.max(0,Math.min(1,(v-.57)/.4)),arm=(kind==='dancer'?v<.45:v>.27&&v<.6)&&(u<.35||u>.75),body=1-leg;return [(.04+u*.92+Math.sin(t)*.009*body*motion+(arm?Math.sin(t+u*3)*.022*motion:0)+(left?-1:1)*lift*.018*leg*motion)*256,(.04+v*.92-lift*.047*leg*motion+(arm?Math.cos(t+u*4)*.027*motion:0))*384]}
 function triangle(source,dest){ctx.save();ctx.beginPath();ctx.moveTo(...dest[0]);ctx.lineTo(...dest[1]);ctx.lineTo(...dest[2]);ctx.closePath();ctx.clip();const [a,b,c]=source,[d,e,f]=dest,det=a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]);if(Math.abs(det)<.00001){ctx.restore();return}const solve=k=>[(d[k]*(b[1]-c[1])+e[k]*(c[1]-a[1])+f[k]*(a[1]-b[1]))/det,(d[k]*(c[0]-b[0])+e[k]*(a[0]-c[0])+f[k]*(b[0]-a[0]))/det,(d[k]*(b[0]*c[1]-c[0]*b[1])+e[k]*(c[0]*a[1]-a[0]*c[1])+f[k]*(a[0]*b[1]-b[0]*a[1]))/det];const x=solve(0),y=solve(1);ctx.setTransform(x[0],y[0],x[1],y[1],x[2],y[2]);ctx.drawImage(image,0,0);ctx.restore()}
 return {surface,render(time,phase=0,reduced=false){ctx.clearRect(0,0,256,384);for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const uv=[[x/cols,y/rows],[(x+1)/cols,y/rows],[x/cols,(y+1)/rows],[(x+1)/cols,(y+1)/rows]],source=uv.map(([u,v])=>[u*image.naturalWidth,v*image.naturalHeight]),dest=uv.map(([u,v])=>point(u,v,time,phase,reduced?.65:1));triangle([source[0],source[1],source[2]],[dest[0],dest[1],dest[2]]);triangle([source[1],source[3],source[2]],[dest[1],dest[3],dest[2]])}return surface}};
}
