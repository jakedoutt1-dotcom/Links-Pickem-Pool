// Screen-space pullback: downward travel adds lift; sideways travel aims.
export function pullbackInput(dx,dy,width,height,shot){
 const fullPull=Math.max(80,Math.min(140,height*.25));
 const raw=Math.max(0,Math.min(1,dy/fullPull));
 return {aim:Math.max(-1,Math.min(1,dx/width*.8)),power:shot?precisionPower(raw,shot):raw};
}

// Neutral aim points at the center of the visible hoop; no hidden lateral drift.
export function shotInput(aim,power,shot){return {aim:Math.max(-1,Math.min(1,aim*.35-(shot?.offset||0)/.65)),power};}

// More finger travel around the useful arc makes power controllable on small screens.
export function precisionPower(raw,shot){
 const d=Math.hypot(shot.x,shot.z),t=1.2+(d-4)*.025;
 const target=((3.05-1.5+9.81*t*t/2)/t-4+9.81/240)/6,low=target-.012,high=target+.012;
 return raw<.35?raw/.35*low:raw<=.65?low+(raw-.35)/.3*(high-low):high+(raw-.65)/.35*(1-high);
}
