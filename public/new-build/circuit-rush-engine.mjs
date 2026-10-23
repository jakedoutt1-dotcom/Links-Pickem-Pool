// Shared deterministic rules. The server recreates boards and validates rotations;
// client-reported scores, tile shapes, locks and node positions are never authoritative.
export const PORTS=Object.freeze({N:1,E:2,S:4,W:8});
const LEVELS=[{size:5,minRoute:14,minTurns:6},{size:6,minRoute:20,minTurns:8},{size:7,minRoute:28,minTurns:10}];
const DIRECTIONS=[[-1,0,1,4],[0,1,2,8],[1,0,4,1],[0,-1,8,2]];
function seeded(text){let seed=2166136261;for(const c of text)seed=Math.imul(seed^c.charCodeAt(0),16777619);return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
const shuffle=(a,random)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
export function rotateMask(mask,turns=1){if(!Number.isInteger(mask)||mask<1||mask>15||!Number.isInteger(turns))throw new RangeError('Invalid circuit ports or rotation.');const n=((turns%4)+4)%4;return ((mask<<n)|(mask>>(4-n)))&15}
export function tileMask(tile){if(!tile||!Number.isInteger(tile.rotation)||tile.rotation<0||tile.rotation>3)throw new RangeError('Invalid circuit tile.');return rotateMask(tile.ports,tile.rotation)}
function assertBoard(board){if(!board||!Number.isInteger(board.size)||board.size<3||board.size>9||!Array.isArray(board.tiles)||board.tiles.length!==board.size**2||!Number.isInteger(board.source)||!Number.isInteger(board.sink)||board.source<0||board.sink<0||board.source>=board.tiles.length||board.sink>=board.tiles.length||board.source%board.size!==0||board.sink%board.size!==board.size-1||!Array.isArray(board.nodes)||board.nodes.length!==3||new Set(board.nodes).size!==3||board.nodes.some(i=>!Number.isInteger(i)||i<0||i>=board.tiles.length||i===board.source||i===board.sink))throw new RangeError('Invalid circuit board.');for(const tile of board.tiles){tileMask(tile);if(typeof tile.locked!=='boolean'||typeof tile.node!=='boolean')throw new RangeError('Invalid circuit tile flags.')}}
export function rotateBoard(board,index,turns=1){assertBoard(board);if(!Number.isInteger(index)||index<0||index>=board.tiles.length||!Number.isInteger(turns)||Math.abs(turns)>1000000)throw new RangeError('Choose a valid circuit tile and rotation.');if(board.tiles[index].locked)return board;const tiles=board.tiles.slice();tiles[index]={...tiles[index],rotation:((tiles[index].rotation+turns)%4+4)%4};return {...board,tiles}}
export function evaluateBoard(board){
 assertBoard(board);const {size,tiles,source,sink,nodes}=board,masks=tiles.map(tileMask),connected=[],seen=new Set(),queue=[];let leaks=0;
 if(masks[source]&PORTS.W){seen.add(source);queue.push(source)}
 for(let cursor=0;cursor<queue.length;cursor++){
  const index=queue[cursor],r=Math.floor(index/size),c=index%size;connected.push(index);
  for(const [dr,dc,port,opposite]of DIRECTIONS){if(!(masks[index]&port))continue;const nr=r+dr,nc=c+dc;if(nr<0||nr>=size||nc<0||nc>=size){if(!(index===source&&port===PORTS.W)&&!(index===sink&&port===PORTS.E))leaks++;continue}const other=nr*size+nc;if(!(masks[other]&opposite)){leaks++;continue}if(!seen.has(other)){seen.add(other);queue.push(other)}}
 }
 const nodesConnected=nodes.filter(i=>seen.has(i)).length,won=!!((masks[source]&PORTS.W)&&(masks[sink]&PORTS.E)&&seen.has(sink)&&nodesConnected===3&&leaks===0);
 return {won,solved:won,connected,nodesConnected,count:connected.length,leaks};
}
function direction(from,to,size){const diff=to-from;if(diff===-size)return 1;if(diff===1)return 2;if(diff===size)return 4;if(diff===-1)return 8;throw Error('Invalid generated circuit route.')}
function findRoute(config,random){
 const {size,minRoute,minTurns}=config,start=Math.floor(random()*size)*size,path=[start],used=new Set(path);let budget=18000;
 const visit=(cell,turns,lastDirection)=>{
  if(--budget<0)return null;if(cell%size===size-1&&path.length>=minRoute&&turns>=minTurns)return [...path];
  const r=Math.floor(cell/size),c=cell%size,neighbors=shuffle(DIRECTIONS.map(([dr,dc,port])=>({r:r+dr,c:c+dc,port})).filter(n=>n.r>=0&&n.r<size&&n.c>=0&&n.c<size&&!used.has(n.r*size+n.c)),random);
  for(const n of neighbors){const next=n.r*size+n.c;used.add(next);path.push(next);const result=visit(next,turns+(lastDirection&&lastDirection!==n.port?1:0),n.port);if(result)return result;path.pop();used.delete(next);if(budget<0)break}return null;
 };
 const found=visit(start,0,0);if(found)return found;
 // Deterministic emergency fallback: an odd number of serpentine rows ends right.
 const route=[];for(let r=0;r<(size%2?size:size-1);r++)for(let n=0;n<size;n++)route.push(r*size+(r%2?size-1-n:n));return route;
}
function generate(seed,level,solved){
 if(!Number.isInteger(level)||level<1||level>3)throw new RangeError('Choose circuit level 1, 2 or 3.');const config=LEVELS[level-1],{size}=config,random=seeded(String(seed)+':circuit-rush:v1:'+level),route=findRoute(config,random),source=route[0],sink=route.at(-1),onRoute=new Map(route.map((cell,i)=>[cell,i]));
 const nodes=[1,2,3].map(n=>route[Math.floor((route.length-1)*n/4)]),solutions=[],decoys=[3,6,12,9,5,10,3,6,12,9,7,11,13,14];
 const tiles=Array.from({length:size*size},(_,index)=>{
  const position=onRoute.get(index),node=nodes.includes(index);let mask;
  if(position!==undefined){mask=(position===0?8:direction(index,route[position-1],size))|(position===route.length-1?2:direction(index,route[position+1],size))}else mask=decoys[Math.floor(random()*decoys.length)];
  const rotation=Math.floor(random()*4),ports=rotateMask(mask,-rotation),locked=index===source||index===sink||(!node&&position!==1&&random()<(position===undefined ? .23 : .10));solutions.push(rotation);const scrambled=Math.floor(random()*4);return {ports,rotation:locked||solved?rotation:scrambled,locked,node};
 });
 const board={size,level,tiles,source,sink,nodes};
 if(!solved){
  // The first route tile after the fixed source is a guaranteed scrambled gate.
  // Its missing reciprocal inlet prevents an accidentally pre-solved generated board.
  const gate=route[1],incoming=direction(gate,source,size);tiles[gate].locked=false;for(let turn=1;turn<=3;turn++){const rotation=(solutions[gate]+turn)%4;if(!(rotateMask(tiles[gate].ports,rotation)&incoming)){tiles[gate].rotation=rotation;break}}
 }
 return board;
}
const createSolvedBoard=(seed,level=1)=>generate(seed,level,true);
export function createRun(seed){if(typeof seed!=='string'&&typeof seed!=='number')throw new TypeError('A circuit seed is required.');seed=String(seed);if(!seed.length||seed.length>200)throw new RangeError('Use a circuit seed of 1–200 characters.');return {seed,seconds:180,boards:[1,2,3].map(level=>generate(seed,level,false))}}

// A gold node awards time once per board, even if disconnected and reconnected.
export const CLOCK=Object.freeze({seconds:180,nodeBonus:10,boardBonus:30,maxSeconds:330});
export function claimNodeTime(board,claimed){let seconds=0;const connected=new Set(evaluateBoard(board).connected);for(const node of board.nodes)if(connected.has(node)&&!claimed.has(node)){claimed.add(node);seconds+=CLOCK.nodeBonus}return seconds}
