import {createGame,snap,step,pass} from '../../public/new-build/goal-line-core.mjs';
import {periodStart} from './party-scoreboard.js';
export async function ensureGoalScores(db){await db.prepare('CREATE TABLE IF NOT EXISTS links_goal_line_scores(run TEXT PRIMARY KEY,player TEXT NOT NULL,name TEXT NOT NULL,score INTEGER NOT NULL,finished INTEGER NOT NULL)').run();await db.prepare('CREATE INDEX IF NOT EXISTS links_goal_line_scores_period ON links_goal_line_scores(finished)').run()}
// Re-run the controls with the same engine; never accept a client-supplied score.
export function replayGoalLine(events){
 if(!Array.isArray(events)||events.length>20000)throw Error('Invalid run.');
 const s=createGame();let duration=0;
 for(const e of events){
  if(!Array.isArray(e)||s.phase==='ended')throw Error('Invalid run.');
  if(e[0]==='snap'&&e.length===1&&s.phase==='ready')snap(s);
  else if(e[0]==='pass'&&e.length===2){if(!pass(s,e[1]))throw Error('Invalid pass.')}
  else if(e[0]==='step'&&e.length===5&&s.phase==='play'){
   const [,dt,x,y,sprint]=e;
   if(![dt,x,y].every(Number.isFinite)||dt<=0||dt>.05||Math.abs(x)>2||Math.abs(y)>2||typeof sprint!=='boolean')throw Error('Invalid controls.');
   duration+=dt;if(duration>240)throw Error('Run too long.');step(s,dt,{x,y,sprint});
  }else throw Error('Invalid run.');
 }
 if(s.phase!=='ended')throw Error('Finish your run first.');return s.score;
}
export async function goalLineBoard(db,period){
 await ensureGoalScores(db);
 const rows=(await db.prepare('SELECT g.player AS id,(SELECT latest.name FROM links_goal_line_scores latest WHERE latest.player=g.player ORDER BY latest.finished DESC,latest.run DESC LIMIT 1) AS name,COUNT(*) AS played,0 AS wins,MAX(g.score) AS best FROM links_goal_line_scores g WHERE g.finished>=? GROUP BY g.player ORDER BY best DESC,played ASC,g.player LIMIT 100').bind(periodStart(period)).all()).results;
 return {rows,highScore:rows[0]?.best??null,profile:null,solo:true};
}
