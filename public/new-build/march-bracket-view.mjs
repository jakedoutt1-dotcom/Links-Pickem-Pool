export function mountBracketLines(root,games,picks,layout){
 const board=root.querySelector('.bracket-board'),svg=board?.querySelector('.march-connections');if(!svg)return ()=>{};
 function draw(){
  svg.replaceChildren();if(layout!=='bracket')return;
  const bounds=board.getBoundingClientRect();svg.setAttribute('viewBox','0 0 '+bounds.width+' '+bounds.height);
  for(const game of games)for(const source of game.sources||[]){
   const a=board.querySelector('[data-match="'+source+'"]')?.getBoundingClientRect(),b=board.querySelector('[data-match="'+game.id+'"]')?.getBoundingClientRect();if(!a||!b)continue;
   const reverse=a.left>b.left,x=(reverse?a.left:a.right)-bounds.left,y=a.top+a.height/2-bounds.top,end=(reverse?b.right:b.left)-bounds.left,endY=b.top+b.height/2-bounds.top,mid=(x+end)/2;
   const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',`M ${x} ${y} H ${mid} V ${endY} H ${end}`);path.setAttribute('class',picks[source]?'selected-path':'pending-path');svg.append(path);
  }
 }
 const observer=new ResizeObserver(draw);observer.observe(board);const frame=requestAnimationFrame(draw);return ()=>{observer.disconnect();cancelAnimationFrame(frame)};
}
