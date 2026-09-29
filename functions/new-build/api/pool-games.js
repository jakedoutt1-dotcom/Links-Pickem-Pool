const json=(d,s=200)=>Response.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
const labels={nfl:'NFL Pick’em',college:'College Pick’em',survivor:'Survivor',confidence:'Confidence','33':'Game 33',squares:'Squares',march:'March Madness',masters:'Golf',nascar:'NASCAR',fantasy:'Fantasy',dynasty:'Dynasty',custom:'Custom'};
const keys=Object.fromEntries(Object.entries(labels).map(([k,v])=>[v.toLowerCase(),k]));
async function commissioner(db,pool){const r=await db.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='commissioner_player_name' LIMIT 1").bind(pool).first();return String(r?.value||'').trim()}
async function legacyGames(db,pool){
 // Managed pools use the same slot records as the commissioner hub.
 let slots=[];try{slots=(await db.prepare('SELECT game_type,active FROM links_pool_slots WHERE pool_id=? ORDER BY game_type').bind(pool).all()).results||[]}catch(e){if(!/no such table/i.test(String(e)))throw e}
 const rows=slots.length?slots:(await db.prepare('SELECT game_type,active,is_primary FROM pool_active_games WHERE pool_id=? ORDER BY is_primary DESC,game_type').bind(pool).all()).results||[];
 return rows.filter(x=>Number(x.active)!==0).map(x=>({key:String(x.game_type),name:labels[String(x.game_type).toLowerCase()]||String(x.game_type),primary:Number(x.is_primary)===1}));
}
async function newGames(db,pool){let rows=[];try{rows=(await db.prepare('SELECT game FROM pool_games WHERE pool_id=? ORDER BY game').bind(String(pool)).all()).results||[]}catch{}return rows.map((x,i)=>({key:keys[String(x.game||'').toLowerCase()]||String(x.game||'').toLowerCase(),name:String(x.game||''),primary:i===0}))}
export async function onRequestGet({request,env}){const q=new URL(request.url).searchParams,raw=String(q.get('pool')||'').trim();if(!raw)return json({success:false,error:'Pool required'},400);let out=[];if(env.DB&&/^\d+$/.test(raw)){const p=await env.DB.prepare('SELECT id FROM pools WHERE id=?').bind(Number(raw)).first();if(p)return json({success:true,games:await legacyGames(env.DB,p.id),build:'account-slots'})}if(!out.length&&env.LINKS_DB)out=await newGames(env.LINKS_DB,raw);if(!out.length&&env.DB&&!/^\d+$/.test(raw))out=await legacyGames(env.DB,raw);return json({success:true,games:out,build:'688'})}
export async function onRequestPost(){return json({error:'Manage game slots in My Commissioner Pools.',url:'/new-build/commissioner-hub.html'},409)}
