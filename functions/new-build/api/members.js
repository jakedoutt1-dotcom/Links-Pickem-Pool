import * as core from './members-core.js';

// v629: use the configured New Build D1 binding first. Previous schema probing was
// too strict and could reject the correct database before members-core could use it.
function d1(v){return v&&typeof v.prepare==='function'?v:null}
function findNewBuildDb(env={}){
  // Cloudflare bindings we have used during the New Build. Never select arbitrary
  // bindings by table-name guessing; that was the source of the v628 failure.
  return d1(env.LINKS_DB)||d1(env.DB1)||d1(env.NEW_LINKS_DB)||d1(env.NEW_BUILD_DB)||d1(env.DB)||null;
}
function normalizeContext(context){
  const source=context?.env||{};
  const db=findNewBuildDb(source);
  return {...context,env:{...source,LINKS_DB:db}};
}
async function run(kind,context){
  try{
    const ctx=normalizeContext(context);
    if(!ctx.env.LINKS_DB){
      return Response.json({success:false,error:'New Build D1 binding is missing',detail:'Expected LINKS_DB, DB1, NEW_LINKS_DB, NEW_BUILD_DB, or DB',build:'629'},{status:503,headers:{'Cache-Control':'no-store'}});
    }
    return kind==='GET'?await core.onRequestGet(ctx):await core.onRequestPost(ctx);
  }catch(e){
    return Response.json({success:false,error:'Player database operation failed',detail:String(e?.message||e),build:'629'},{status:500,headers:{'Cache-Control':'no-store'}});
  }
}
export function onRequestGet(context){return run('GET',context)}
export function onRequestPost(context){return run('POST',context)}
