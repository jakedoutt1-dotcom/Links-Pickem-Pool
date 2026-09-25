import * as core from './members-core.js';

// v628: identify the New Build D1 by its COLUMN schema, not just table names.
// The protected v661 DB also has tables named players/memberships, but their columns differ.
async function columns(db,table){
  const r=await db.prepare("PRAGMA table_info("+table+")").all();
  return new Set((r.results||[]).map(x=>String(x.name||"").toLowerCase()));
}
function hasAll(set,names){return names.every(n=>set.has(n))}
async function isNewBuildDb(db){
  try{
    const p=await columns(db,"players");
    const m=await columns(db,"memberships");
    const pools=await columns(db,"pools");
    return hasAll(p,["id","email","display_name","created_at"]) &&
           hasAll(m,["pool_id","player_id","role","status","joined_at"]) &&
           hasAll(pools,["id","code","name","commissioner_email","created_at"]);
  }catch{return false}
}
async function findNewBuildDb(env={}){
  const preferred=[env.LINKS_DB,env.DB1,env.NEW_LINKS_DB,env.NEW_BUILD_DB].filter(Boolean);
  const candidates=[...preferred,...Object.values(env).filter(v=>v&&typeof v.prepare==="function")];
  const seen=new Set();
  for(const db of candidates){
    if(seen.has(db))continue;
    seen.add(db);
    if(await isNewBuildDb(db))return db;
  }
  return null;
}
async function normalizeContext(context){
  const source=context?.env||{};
  const db=await findNewBuildDb(source);
  return {...context,env:{...source,LINKS_DB:db}};
}
async function run(kind,context){
  try{
    const ctx=await normalizeContext(context);
    if(!ctx.env.LINKS_DB){
      return Response.json({success:false,error:"New Build player database binding was not found",build:"628"},{status:503,headers:{"Cache-Control":"no-store"}});
    }
    return kind==="GET"?await core.onRequestGet(ctx):await core.onRequestPost(ctx);
  }catch(e){
    return Response.json({success:false,error:"Player database operation failed",detail:String(e?.message||e),build:"628"},{status:500,headers:{"Cache-Control":"no-store"}});
  }
}
export function onRequestGet(context){return run("GET",context)}
export function onRequestPost(context){return run("POST",context)}
