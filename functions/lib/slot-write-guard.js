import {allowance,ensureAccounts,emailKey} from './commissioner-account.js';
// Archived slots remain readable for history but cannot accept game mutations.
export async function slotWriteGuard(request,env){
 if(!env.DB||['GET','HEAD','OPTIONS'].includes(request.method))return null;
 const path=new URL(request.url).pathname;
 // Party and hosted-trivia passes are independent of pool packages.
 if(/\/(trivia-night|trivia-rally|million-point|dead-air|last-alibi|friend-challenge|captain-clash|say-what|party-pack|party-scoreboard|venue-scoreboard)$/.test(path))return null;
 // LINKS owner operations enforce their own owner session and password checks.
 // They must work even when a pool is archived or its package has expired.
 if(path==='/new-build/api/links-admin')return null;
 if(/\/(player-account|login-transition|account|pool-switcher|members|invites|join|pools|pool-games|home-session)$/.test(path)||/\/(login|logout|session|pool\/create|commissioner\/|commissioner-service\/|service\/)/.test(path))return null;
 let b={};try{b=await request.clone().json()}catch{return null}
 const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');
 const s=token?await env.DB.prepare('SELECT pool_id FROM pool_sessions WHERE token=? AND expires_at>?').bind(token,new Date().toISOString()).first():null;
 const legacy=path.startsWith('/api/'),sessionScoped=legacy||/\/nfl-|\/college$/.test(path);
 const raw=sessionScoped?(s?.pool_id||b.pool||b.poolId):(b.pool||b.poolId||s?.pool_id);if(!raw)return null;
 const pool=await env.DB.prepare('SELECT id FROM pools WHERE CAST(id AS TEXT)=? OR upper(code)=upper(?)').bind(String(raw),String(raw)).first();if(!pool)return null;
 const value=String(b.game||b.sport||new URL(request.url).searchParams.get('sport')||'').toLowerCase();
 const aliases={'nfl pick’em':'nfl','nfl pick\'em':'nfl','college pick’em':'college','college pick\'em':'college','game 33':'33','march madness':'march',golf:'masters'};
 let game=aliases[value]||value;if(!game){if(/college/.test(path))game='college';else if(/nfl|\/picks$|\/pick-page|\/admin\/(results|correction|lock|finalize|unfinalize)/.test(path))game='nfl';else game=['survivor','confidence','dynasty','fantasy','squares','props','playoff','nascar','masters','march','33'].find(g=>path.includes('/'+g))||''}
 if(/\/new-build\/api\/nfl-/.test(path))game='nfl';
 if(/\/new-build\/api\/college$/.test(path))game='college';
 if(legacy&&/\/(picks|pick-page|admin\/(results|correction|lock|finalize|unfinalize))$/.test(path))game=/college/i.test(new URL(request.url).searchParams.get('sport')||b.sport||'')?'college':'nfl';
 try{
 await ensureAccounts(env.DB);
 const rows=(await env.DB.prepare('SELECT id,email,game_type,active FROM links_pool_slots WHERE pool_id=?').bind(pool.id).all()).results||[];
 if(rows.length&&(game?!rows.some(r=>r.game_type===game&&r.active):rows.every(r=>!r.active)))return Response.json({error:'This game is archived or not enabled. Ask your commissioner to add or restore it before making changes.'},{status:403,headers:{'Cache-Control':'no-store'}});
 const owner=await env.DB.prepare('SELECT email FROM links_pool_owners WHERE pool_id=?').bind(pool.id).first();
 const contact=(!owner&&!rows.length)?await env.DB.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='commissioner_email'").bind(pool.id).first():null;
 const email=emailKey(owner?.email||rows[0]?.email||contact?.value||'');
 const plan=email?await allowance(env.DB,email):null;
 if(!plan||plan.slots===0)return Response.json({error:'The host needs an active pool package. Saved picks and history are preserved. Invited players do not need to purchase a package.'},{status:402,headers:{'Cache-Control':'no-store'}});

 }catch(e){throw e}return null;
}
