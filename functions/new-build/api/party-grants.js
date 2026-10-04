import {ownerSession} from '../../lib/owner-auth.js';
import {emailKey,digest} from '../../lib/commissioner-account.js';
import {GRANT_PRODUCTS,ensurePartyGrants} from '../../lib/party-grants.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){try{
 if(!env.DB)return json({error:'Access management is unavailable.'},503);
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 const url=new URL(request.url);if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)return json({error:'Open LINKS Admin first.'},403);
 const session=await ownerSession(request,env.DB);if(!session)return json({error:'Sign in as the LINKS site owner.'},401);
 const db=env.DB;await ensurePartyGrants(db);
 if(request.method==='GET'){
  const email=emailKey(url.searchParams.get('email')||'');const rows=(await db.prepare('SELECT id,email,product,days,created_at,expires_at,revoked_at,note FROM links_party_grants'+(email?' WHERE email=?':'')+' ORDER BY created_at DESC LIMIT 200').bind(...(email?[email]:[])).all()).results||[];
  return json({grants:rows,products:GRANT_PRODUCTS});
 }
 const raw=await request.text();if(raw.length>2500)return json({error:'Request too large.'},413);let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
 if(b.confirm!==true)return json({error:'Confirm the access change first.'},400);
 if(b.action==='grant'){
  const email=emailKey(b.email),days=Number(b.days),note=String(b.note||'').trim();
  if(email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||!Object.hasOwn(GRANT_PRODUCTS,b.product)||!Number.isInteger(days)||days<1||days>365||note.length>200||!/^[a-f0-9-]{36}$/.test(b.id||''))return json({error:'Enter a valid email, access type, and 1–365 days. Keep notes under 200 characters.'},400);
  const created=new Date().toISOString(),expires=new Date(Date.now()+days*86400000).toISOString();
  await db.prepare('INSERT OR IGNORE INTO links_party_grants(id,email,product,days,created_at,expires_at,note,actor) VALUES(?,?,?,?,?,?,?,?)').bind(b.id,email,b.product,days,created,expires,note,await digest(session.token)).run();
  const grant=await db.prepare('SELECT id,email,product,days,created_at,expires_at,revoked_at,note FROM links_party_grants WHERE id=?').bind(b.id).first();if(grant.email!==email||grant.product!==b.product||grant.days!==days||grant.note!==note)return json({error:'This request was already used for a different grant. Refresh and retry.'},409);
  return json({grant});
 }
 if(b.action==='revoke'){
  const grant=await db.prepare('SELECT id FROM links_party_grants WHERE id=?').bind(String(b.id||'')).first();if(!grant)return json({error:'Grant not found.'},404);
  await db.prepare('UPDATE links_party_grants SET revoked_at=? WHERE id=? AND revoked_at IS NULL').bind(new Date().toISOString(),b.id).run();return json({ok:true});
 }
 return json({error:'Unsupported action.'},400);
 }catch{return json({error:'Access management could not complete the request. Please retry.'},500)}
}
