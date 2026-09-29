import {allowance,retainedFreeSlot} from './commissioner-account.js';
// Archived slots remain readable for history but cannot accept game mutations.
export async function slotWriteGuard(request,env){
 if(!env.DB||['GET','HEAD','OPTIONS'].includes(request.method))return null;
 const path=new URL(request.url).pathname;
 if(/\/(account|pool-switcher|members|invites|join|pools|pool-games|home-session)$/.test(path)||/\/(login|logout|session|pool\/create|commissioner\/|commissioner-service\/|service\/)/.test(path))return null;
 let b={};try{b=await request.clone().json()}catch{return null}
 const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');
 const s=token?await env.DB.prepare('SELECT pool_id FROM pool_sessions WHERE token=? AND expires_at>?').bind(token,new Date().toISOString()).first():null;
 const legacy=path.startsWith('/api/'),sessionScoped=legacy||/\/nfl-|\/college$/.test(path);
 const raw=sessionScoped?(s?.pool_id||b.pool||b.poolId):(b.pool||b.poolId||s?.pool_id);if(!raw)return null;
 const pool=await env.DB.prepare('SELECT id FROM pools WHERE CAST(id AS TEXT)=? OR upper(code)=upper(?)').bind(String(raw),String(raw)).first();if(!pool)return null;
 const value=String(b.game||b.sport||new URL(request.url).searchParams.get('sport')||'').toLowerCase();
 const aliases={'nfl pick’em':'nfl','nfl pick\'em':'nfl','college pick’em':'college','college pick\'em':'college','game 33':'33','march madness':'march',golf:'masters'};
 let game=aliases[value]||value;if(!game){if(/college/.test(path))game='college';else if(/nfl|\/picks$|\/pick-page|\/admin\/(results|correction|lock|finalize|unfinalize)/.test(path))game='nfl';else game=['survivor','confidence','dynasty','fantasy','squares','nascar','masters','march','33'].find(g=>path.includes('/'+g))||''}
 if(/\/new-build\/api\/nfl-/.test(path))game='nfl';
 if(/\/new-build\/api\/college$/.test(path))game='college';
 if(legacy&&/\/(picks|pick-page|admin\/(results|correction|lock|finalize|unfinalize))$/.test(path))game=/college/i.test(new URL(request.url).searchParams.get('sport')||b.sport||'')?'college':'nfl';
 try{
 const rows=(await env.DB.prepare('SELECT id,email,game_type,active FROM links_pool_slots WHERE pool_id=?').bind(pool.id).all()).results||[];
 if(rows.length&&(game?!rows.some(r=>r.game_type===game&&r.active):rows.every(r=>!r.active)))return Response.json({error:'This game is archived or not enabled. Ask your commissioner to add or restore it before making changes.'},{status:403,headers:{'Cache-Control':'no-store'}});
 if(rows.length){const plan=await allowance(env.DB,rows[0].email);if(plan.plan==='free'&&plan.expiresAt&&Date.parse(plan.expiresAt)<=Date.now()){const keep=await retainedFreeSlot(env.DB,rows[0].email);if(!rows.some(r=>r.id===keep&&(!game||r.game_type===game)))return Response.json({error:'This pool is read-only after the commissioner package expired. Ask your commissioner to renew or select it as the free pool. Saved picks and history are preserved.'},{status:403,headers:{'Cache-Control':'no-store'}})}}
 }catch(e){if(!/no such table/i.test(String(e)))throw e}return null;
}
