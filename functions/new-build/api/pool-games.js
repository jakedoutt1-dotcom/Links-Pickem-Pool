import {poolGameKeys} from '../../lib/pool-games.js';
const json=(d,s=200)=>Response.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
const labels={nfl:'NFL Pick’em',college:'College Pick’em',survivor:'Survivor',confidence:'Confidence','33':'Game 33',squares:'Squares',march:'March Madness',masters:'Golf',nascar:'NASCAR',fantasy:'Fantasy',dynasty:'Dynasty',custom:'Custom'};
const keys=Object.fromEntries(Object.entries(labels).map(([k,v])=>[v.toLowerCase(),k]));
async function legacyGames(db,pool){return (await poolGameKeys(db,pool)).map((key,i)=>({key,name:labels[key]||key,primary:i===0}))}
async function newGames(db,pool){let rows=[];try{rows=(await db.prepare('SELECT game FROM pool_games WHERE pool_id=? ORDER BY game').bind(String(pool)).all()).results||[]}catch{}return rows.map((x,i)=>({key:keys[String(x.game||'').toLowerCase()]||String(x.game||'').toLowerCase(),name:String(x.game||''),primary:i===0}))}
export async function onRequestGet({request,env}){
 const raw=String(new URL(request.url).searchParams.get('pool')||'').trim();if(!raw)return json({success:false,error:'Pool required'},400);
 if(env.DB){const numeric=/^\d+$/.test(raw);let p=numeric?await env.DB.prepare('SELECT id FROM pools WHERE id=?').bind(Number(raw)).first():null;
 if(!p)p=await env.DB.prepare('SELECT id FROM pools WHERE upper(code)=upper(?)').bind(raw).first();
 if(p)return json({success:true,resolvedPoolId:String(p.id),games:await legacyGames(env.DB,p.id),build:'resolved-pool'});
 }
 if(env.LINKS_DB){const p=await env.LINKS_DB.prepare('SELECT id FROM pools WHERE id=? OR upper(code)=upper(?) LIMIT 1').bind(raw,raw).first();if(p)return json({success:true,resolvedPoolId:String(p.id),games:await newGames(env.LINKS_DB,p.id),build:'resolved-pool'})}
 return json({success:false,error:'Pool not found. Sign into your pool again.'},404);
}
export async function onRequestPost(){return json({error:'Manage game slots in My Commissioner Pools.',url:'/new-build/commissioner-hub.html'},409)}
