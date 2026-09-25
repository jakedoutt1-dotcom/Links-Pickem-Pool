import * as core from './members-core.js';

// v627: resolve the New Build D1 database by capability/schema, not by a guessed
// Cloudflare binding name. This keeps protected v661 DB read-only/out of member writes.
async function findNewBuildDb(env={}){
  const preferred=[env.LINKS_DB,env.DB1,env.NEW_LINKS_DB,env.NEW_BUILD_DB].filter(Boolean);
  const all=[...preferred,...Object.values(env).filter(v=>v&&typeof v.prepare==='function')];
  const seen=new Set();
  for(const db of all){
    if(seen.has(db))continue;seen.add(db);
    try{
      const row=await db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name IN ('players','memberships')").first();
      if(Number(row?.n)===2)return db;
    }catch{}
  }
  return preferred[0]||null;
}
async function normalizeContext(context){
  const source=context?.env||{};
  const newBuildDb=await findNewBuildDb(source);
  return {...context,env:{...source,LINKS_DB:newBuildDb}};
}
export async function onRequestGet(context){return core.onRequestGet(await normalizeContext(context));}
export async function onRequestPost(context){return core.onRequestPost(await normalizeContext(context));}
