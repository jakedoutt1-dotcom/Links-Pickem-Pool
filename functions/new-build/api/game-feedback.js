import {ownerSession} from '../../lib/owner-auth.js';
const games=new Set(['party-room','trivia-rally','million-point','dead-air','last-alibi','friend-challenge','football-trivia','trivia-night','nfl','college','golf','nascar','nba','mlb','home-run','squares','playoff','march-madness','survivor','confidence','props','fantasy','dynasty','custom']);
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){
 try{
 const db=env.DB;if(!db)return json({error:'Feedback is temporarily unavailable.'},503);
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 if(request.method==='POST'&&request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Send feedback from LINKS.'},403);
 await db.batch([db.prepare('CREATE TABLE IF NOT EXISTS links_game_feedback(id TEXT PRIMARY KEY,game TEXT NOT NULL,rating TEXT NOT NULL,improve TEXT NOT NULL,suggestion TEXT NOT NULL,comments TEXT NOT NULL,created_at TEXT NOT NULL,reviewed INTEGER NOT NULL DEFAULT 0)'),db.prepare('CREATE TABLE IF NOT EXISTS links_feedback_limits(id TEXT PRIMARY KEY,window INTEGER NOT NULL,count INTEGER NOT NULL)')]);
 if(request.method==='GET'){
  if(!await ownerSession(request,db))return json({error:'LINKS Admin sign-in required.'},401);
  const before=new URL(request.url).searchParams.get('before')||'9999';
  const rows=(await db.prepare('SELECT * FROM links_game_feedback WHERE created_at<? ORDER BY created_at DESC,id DESC LIMIT 101').bind(before).all()).results;
  return json({rows:rows.slice(0,100),next:rows.length>100?rows[99].created_at:null});
 }
 const raw=await request.text();if(raw.length>7000)return json({error:'Feedback is too long.'},413);
 let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid feedback.'},400)}
 if(b.action==='review'){
  if(!await ownerSession(request,db))return json({error:'LINKS Admin sign-in required.'},401);
  if(typeof b.reviewed!=='boolean'||typeof b.id!=='string')return json({error:'Invalid review.'},400);
  await db.prepare('UPDATE links_game_feedback SET reviewed=? WHERE id=?').bind(b.reviewed?1:0,b.id).run();return json({ok:true});
 }
 if(b.action!=='submit'||!games.has(b.game)||!['love','okay','not-for-me'].includes(b.rating))return json({error:'Choose a game and rating.'},400);
 for(const k of ['improve','suggestion','comments'])if(typeof b[k]!=='string'||b[k].length>(k==='suggestion'?300:1500))return json({error:'Please shorten your feedback.'},400);
 const window=Math.floor(Date.now()/3600000),bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(window+':'+(request.headers.get('CF-Connecting-IP')||'local'))),ip=Array.from(new Uint8Array(bytes)).map(n=>n.toString(16).padStart(2,'0')).join('');
 const allowed=await db.prepare('INSERT INTO links_feedback_limits(id,window,count) VALUES(?,?,1) ON CONFLICT(id) DO UPDATE SET count=count+1 WHERE count<5 RETURNING count').bind(ip,window).first();
 if(!allowed)return json({error:'Thanks for the feedback. Please wait before sending more.'},429);
 await db.prepare('DELETE FROM links_feedback_limits WHERE window<?').bind(window-24).run();
 await db.prepare('INSERT INTO links_game_feedback(id,game,rating,improve,suggestion,comments,created_at) VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(),b.game,b.rating,b.improve.trim(),b.suggestion.trim(),b.comments.trim(),new Date().toISOString()).run();return json({ok:true});
 }catch{return json({error:'Could not save feedback. Please try again.'},503)}
}
