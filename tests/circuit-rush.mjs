import assert from 'node:assert/strict';
import {createRun,rotateBoard,rotateMask,tileMask,evaluateBoard,PORTS,claimNodeTime} from '../public/new-build/circuit-rush-engine.mjs';
import {createSolvedBoard} from './helpers/circuit-solution.mjs';
assert.deepEqual(createRun('daily-2026-10-20'),createRun('daily-2026-10-20'));assert.notDeepEqual(createRun('daily-2026-10-20'),createRun('daily-2026-10-21'));
const started=performance.now();
for(let n=0;n<400;n++){
 const seed='generation-'+n,run=createRun(seed);assert.equal(run.seconds,180);assert.deepEqual(run.boards.map(b=>b.size),[5,6,7,7,8,9]);
 for(let level=1;level<=6;level++){
  const board=run.boards[level-1],solution=createSolvedBoard(seed,level),result=evaluateBoard(solution);assert(result.won);assert(result.solved);assert.equal(result.leaks,0);assert.equal(result.nodesConnected,3);assert(result.count>=[14,20,28,34,42,52][level-1]);assert.equal(evaluateBoard(board).won,false);assert.equal(board.nodes.length,3);assert.equal(new Set(board.nodes).size,3);assert(board.tiles[board.source].locked);assert(board.tiles[board.sink].locked);assert(tileMask(solution.tiles[solution.source])&PORTS.W);assert(tileMask(solution.tiles[solution.sink])&PORTS.E);
  const steps=result.connected.slice(1).map((cell,i)=>cell-result.connected[i]);assert(steps.slice(1).filter((step,i)=>step!==steps[i]).length>=[6,8,10,14,18,22][level-1],`${seed} level ${level}`);
  let restored=board;for(let index=0;index<board.tiles.length;index++){if(board.tiles[index].locked){assert.equal(board.tiles[index].rotation,solution.tiles[index].rotation);continue}restored=rotateBoard(restored,index,solution.tiles[index].rotation-restored.tiles[index].rotation)}assert(evaluateBoard(restored).won);
  assert.equal(rotateBoard(board,board.source),board);const movable=board.tiles.findIndex(t=>!t.locked),copy=structuredClone(board),rotated=rotateBoard(board,movable);assert.deepEqual(board,copy);assert.notEqual(rotated,board);assert.notEqual(rotated.tiles,board.tiles);assert.equal(rotated.tiles[movable].rotation,(board.tiles[movable].rotation+1)%4);assert.deepEqual(rotateBoard(rotated,movable,-1),board);
 }
}
assert.equal(rotateMask(1,1),2);assert.equal(rotateMask(1,-1),8);assert.equal(rotateMask(3,4),3);assert.throws(()=>createRun(''),RangeError);assert.throws(()=>createRun({}),TypeError);assert.throws(()=>createSolvedBoard('seed',7),RangeError);const board=createRun('validation').boards[0];assert.throws(()=>rotateBoard(board,-1),RangeError);assert.throws(()=>rotateBoard(board,999),RangeError);assert.throws(()=>rotateBoard(board,1,.5),RangeError);assert.throws(()=>rotateMask(0),RangeError);assert.throws(()=>evaluateBoard({...board,nodes:[1,1,1]}),RangeError);assert.throws(()=>evaluateBoard({...board,tiles:[]}),RangeError);
const disconnected=structuredClone(createSolvedBoard('disconnect',1));disconnected.tiles[disconnected.sink]={...disconnected.tiles[disconnected.sink],ports:PORTS.N,rotation:0};assert.equal(evaluateBoard(disconnected).won,false);
console.log(`PASS Circuit Rush: 2,400 deterministic generated boards, guaranteed solvable increasing routes, reciprocal circuits/all three nodes/no leaks, unsolved scramble, immutable rotations/locks, validation (${Math.round(performance.now()-started)}ms).`);

const bonusBoard=createSolvedBoard('bonus',1),claimed=new Set();assert.equal(claimNodeTime(bonusBoard,claimed),15);assert.equal(claimNodeTime(bonusBoard,claimed),0);assert.equal(claimed.size,3);
