const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function onRequestGet({request,env}){
 if(!env.LINKS_DB)return json({success:false,error:"LINKS_DB is not configured"},503);
 const q=new URL(request.url).searchParams,code=(q.get("code")||"").trim().toUpperCase(),id=(q.get("id")||"").trim();
 if(!code&&!id)return json({success:false,error:"Pool code or id required"},400);
 try{const pool=await env.LINKS_DB.prepare("SELECT id,code,name,active,created_at AS createdAt FROM pools WHERE "+(id?"id=?":"upper(code)=?")+" LIMIT 1").bind(id||code).first();
 if(!pool)return json({success:false,error:"Pool not found"},404);
 const {results=[]}=await env.LINKS_DB.prepare("SELECT game FROM pool_games WHERE pool_id=? ORDER BY game").bind(pool.id).all();
 return json({success:true,pool:{...pool,games:results.map(x=>x.game),game:results[0]?.game||"",role:"player"}})}catch(e){return json({success:false,error:"Pool lookup unavailable"},500)}
}
export async function onRequestPost({request,env}){
 if(!env.LINKS_DB)return json({success:false,error:"LINKS_DB is not configured"},503);
 let b;try{b=await request.json()}catch{return json({success:false,error:"Invalid request"},400)}
 const name=String(b.name||"").trim(),email=String(b.email||"").trim().toLowerCase(),phone=String(b.phone||"").trim(),games=[...new Set((Array.isArray(b.games)?b.games:[]).map(x=>String(x).trim()).filter(Boolean))];
 if(!name||!email||!games.length)return json({success:false,error:"Name, commissioner email and game required"},400);
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return json({success:false,error:"Valid email required"},400);
 const id=crypto.randomUUID(),code="LNK-"+crypto.randomUUID().replace(/-/g,"").slice(0,7).toUpperCase(),now=new Date().toISOString();
 try{await env.LINKS_DB.prepare("INSERT INTO pools(id,code,name,commissioner_email,phone,active,created_at) VALUES(?,?,?,?,?,1,?)").bind(id,code,name,email,phone,now).run();
 for(const game of games)await env.LINKS_DB.prepare("INSERT INTO pool_games(pool_id,game) VALUES(?,?)").bind(id,game).run();
 let player=await env.LINKS_DB.prepare("SELECT id FROM players WHERE lower(email)=? LIMIT 1").bind(email).first();
 const playerId=player?.id||crypto.randomUUID();
 if(!player)await env.LINKS_DB.prepare("INSERT INTO players(id,email,display_name,created_at) VALUES(?,?,?,?)").bind(playerId,email,name+" Commissioner",now).run();
 await env.LINKS_DB.prepare("INSERT INTO memberships(pool_id,player_id,role,status,joined_at) VALUES(?,?,\"commissioner\",\"active\",?) ON CONFLICT(pool_id,player_id) DO UPDATE SET role=\"commissioner\",status=\"active\"").bind(id,playerId,now).run();
 return json({success:true,pool:{id,code,name,email,phone,games,game:games[0],role:"commissioner",active:true,createdAt:now},playerId},201)}catch(e){return json({success:false,error:"Pool creation unavailable"},500)}
}
export async function onRequestPatch({request,env}){if(!env.LINKS_DB)return json({success:false,error:"LINKS_DB is not configured"},503);let b;try{b=await request.json()}catch{return json({success:false,error:"Invalid request"},400)}const id=String(b.id||""),active=b.active===true?1:b.active===false?0:null;if(!id||active===null)return json({success:false,error:"Pool id and active state required"},400);try{const r=await env.LINKS_DB.prepare("UPDATE pools SET active=? WHERE id=?").bind(active,id).run();if(!r.meta?.changes)return json({success:false,error:"Pool not found"},404);return json({success:true,id,active:Boolean(active)})}catch{return json({success:false,error:"Pool update unavailable"},500)}}