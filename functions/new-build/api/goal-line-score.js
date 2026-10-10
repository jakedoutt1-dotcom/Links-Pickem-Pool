import {ensureGoalScores,replayGoalLine} from '../../lib/goal-line-scoreboard.js';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Open Goal Line on LINKS.'},403);
 if(!env.DB)return json({error:'Score saving is unavailable.'},503);
 try{
 const raw=await request.text();if(raw.length>2000000)return json({error:'Run too large.'},413);
 let b,score;try{b=JSON.parse(raw);score=replayGoalLine(b.events)}catch{return json({error:'This run could not be verified.'},400)}
 const name=String(b.name||'').trim().replace(/[<>\x00-\x1f]/g,'').slice(0,32);
 if(!name||!/^[a-f0-9]{64}$/i.test(b.secret||'')||!/^[a-f0-9-]{36}$/i.test(b.run||''))return json({error:'Enter your scoreboard name and try again.'},400);
 const hash=async x=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(x))),v=>v.toString(16).padStart(2,'0')).join('');
 const player=await hash(b.secret),run=await hash(b.secret+':'+b.run);
 await ensureGoalScores(env.DB);
 await env.DB.prepare('INSERT INTO links_goal_line_scores(run,player,name,score,finished) VALUES(?,?,?,?,?) ON CONFLICT(run) DO UPDATE SET name=excluded.name WHERE links_goal_line_scores.player=excluded.player').bind(run,player,name,score,Date.now()).run();
 return json({ok:true,score});
 }catch{return json({error:'Score could not save. Please try again.'},503)}
}
