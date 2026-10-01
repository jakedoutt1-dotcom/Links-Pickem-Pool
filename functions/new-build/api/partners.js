import {ensurePartners,safeURL} from '../../lib/partners.js';
import {ownerSession} from '../../lib/owner-auth.js';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){try{
 const db=env.DB,url=new URL(request.url);
 if(!['GET','POST'].includes(request.method))return reply({error:'Method not allowed.'},405);
 const publicList=request.method==='GET'&&url.searchParams.get('public')==='1';
 if(!publicList&&!await ownerSession(request,db))return reply({error:'LINKS owner sign-in required.'},401);
 await ensurePartners(db);
 if(publicList)return reply({partners:(await db.prepare('SELECT id,name,logo,address,latitude,longitude,radius,offer,website FROM links_partners WHERE active=1 ORDER BY name').all()).results});
 if(request.method==='GET')return reply({partners:(await db.prepare('SELECT * FROM links_partners ORDER BY name').all()).results,pools:(await db.prepare('SELECT id,name,code FROM pools ORDER BY name').all()).results});
 const b=await request.json();
 if(b.action==='qr'||b.action==='revoke'){
 const p=await db.prepare('SELECT * FROM links_partners WHERE id=?').bind(String(b.id||'')).first();if(!p)return reply({error:'Partner not found.'},404);
 if(b.action==='revoke'){await db.prepare('DELETE FROM links_partner_invites WHERE partner_id=?').bind(p.id).run();return reply({ok:true})}
 if(!p.active)return reply({error:'Activate the partner before creating an invitation.'},400);
 let q=await db.prepare('SELECT * FROM links_partner_invites WHERE partner_id=? AND expires_at>?').bind(p.id,new Date().toISOString()).first();
 if(!q){q={token:crypto.randomUUID()+crypto.randomUUID(),expires_at:new Date(Date.now()+7*864e5).toISOString()};await db.prepare('INSERT INTO links_partner_invites VALUES(?,?,?) ON CONFLICT(partner_id) DO UPDATE SET token=excluded.token,expires_at=excluded.expires_at').bind(p.id,q.token,q.expires_at).run()}
 return reply({url:url.origin+'/new-build/join.html?qr='+encodeURIComponent(q.token),expiresAt:q.expires_at});
 }
 if(b.action!=='save')return reply({error:'Unsupported action.'},400);
 const name=String(b.name||'').trim(),address=String(b.address||'').trim(),offer=String(b.offer||'').trim(),logo=safeURL(b.logo),website=safeURL(b.website),lat=Number(b.latitude),lng=Number(b.longitude),radius=Number(b.radius),pool=Number(b.pool_id),id=String(b.id||crypto.randomUUID());
 if(!name||name.length>100||!address||address.length>300||offer.length>500||!logo||!website||String(b.logo).length>2048||String(b.website).length>2048||b.latitude==null||b.longitude==null||String(b.latitude).trim()===''||String(b.longitude).trim()===''||!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lng)||Math.abs(lng)>180||!Number.isFinite(radius)||radius<10||radius>500||!Number.isInteger(pool))return reply({error:'Enter a name, address, HTTPS logo and offer links, valid coordinates, and radius of 10–500 meters.'},400);
 if(!await db.prepare('SELECT id FROM pools WHERE id=?').bind(pool).first())return reply({error:'Choose an existing pool.'},400);
 if(b.id&&!await db.prepare('SELECT id FROM links_partners WHERE id=?').bind(id).first())return reply({error:'Partner not found.'},404);
 // Changing the pool invalidates old printed invitations rather than redirecting them silently.
 await db.batch([db.prepare('DELETE FROM links_partner_invites WHERE partner_id=? AND EXISTS(SELECT 1 FROM links_partners WHERE id=? AND pool_id<>?)').bind(id,id,pool),db.prepare('INSERT INTO links_partners VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,logo=excluded.logo,address=excluded.address,latitude=excluded.latitude,longitude=excluded.longitude,radius=excluded.radius,offer=excluded.offer,website=excluded.website,pool_id=excluded.pool_id,active=excluded.active,updated_at=excluded.updated_at').bind(id,name,logo,address,lat,lng,radius,offer,website,pool,b.active===true?1:0,new Date().toISOString())]);
 return reply({ok:true,id});
 }catch(e){console.error('Partners unavailable',e);return reply({error:'Partners could not be loaded or saved. Please retry.'},503)}}
