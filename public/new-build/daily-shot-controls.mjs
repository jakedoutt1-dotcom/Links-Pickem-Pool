// Screen-space pullback: downward travel adds lift; sideways travel aims.
export function pullbackInput(dx,dy,width,height){
 const fullPull=Math.max(80,Math.min(140,height*.25));
 return {aim:Math.max(-1,Math.min(1,dx/width*2.2)),power:Math.max(0,Math.min(1,dy/fullPull))};
}
