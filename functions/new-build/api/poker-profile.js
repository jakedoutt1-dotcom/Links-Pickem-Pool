import {identitySession} from '../../lib/player-identity.js';
const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){
 try{
  if(!['GET','POST'].includes(request.method))return reply({error:'Method not allowed.'},405);
  if(request.method==='POST'&&request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Invalid origin.'},403);
  let account;try{account=await identitySession(request,env.DB)}catch(e){if(!/no such table/i.test(String(e)))throw e}
  if(!account)return reply({error:'Sign in to save your poker profile.'},401);
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS links_poker_profiles(account_id TEXT PRIMARY KEY,name TEXT NOT NULL,avatar TEXT NOT NULL,updated_at INTEGER NOT NULL)').run();
  if(request.method==='GET'){
   const profile=await env.DB.prepare('SELECT name,avatar FROM links_poker_profiles WHERE account_id=?').bind(account.id).first();
   return reply({account:{displayName:account.display_name},profile:profile||{name:account.display_name.slice(0,24),avatar:''}});
  }
  const text=await request.text();if(text.length>8192)return reply({error:'Profile too large.'},413);
  let b;try{b=JSON.parse(text)}catch{return reply({error:'Invalid profile.'},400)}
  const name=String(b.name||'').trim(),avatar=String(b.avatar||'');
  const m=/^preset:(classic|people|fun)-(0|[1-9]\d?)$/.exec(avatar);
  const preset=m&&Number(m[2])<({classic:9,people:16,fun:16}[m[1]]);
  const photo=/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/=]+$/.test(avatar)&&avatar.length<=6000;
  if(!name||name.length>24||/[\x00-\x1f]/.test(name)||avatar&& !preset&&!photo)return reply({error:'Choose a name up to 24 characters and a valid avatar.'},400);
  await env.DB.prepare('INSERT INTO links_poker_profiles VALUES(?,?,?,?) ON CONFLICT(account_id) DO UPDATE SET name=excluded.name,avatar=excluded.avatar,updated_at=excluded.updated_at').bind(account.id,name,avatar,Date.now()).run();
  return reply({ok:true});
 }catch(e){console.error('Poker profile unavailable',e.message);return reply({error:'Unable to save your profile. Try again.'},500)}
}
