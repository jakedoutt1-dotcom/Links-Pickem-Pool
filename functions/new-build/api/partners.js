import {ensurePartners,safeURL,referralPartner} from '../../lib/partners.js';
import {ownerSession} from '../../lib/owner-auth.js';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){try{
 const db=env.DB,url=new URL(request.url);
 if(!['GET','POST'].includes(request.method))return reply({error:'Method not allowed.'},405);
 if(request.method==='GET'&&url.searchParams.has('ref')){const partner=await referralPartner(db,url.searchParams.get('ref'));return partner?reply({partner}):reply({error:'This partner link is inactive. Please visit LINKS directly.'},404)}
 const publicList=request.method==='GET'&&url.searchParams.get('public')==='1';
 if(!publicList&&!await ownerSession(request,db))return reply({error:'LINKS owner sign-in required.'},401);
 await ensurePartners(db);
 if(publicList)return reply({partners:(await db.prepare('SELECT id,name,logo,address,latitude,longitude,radius,offer,website FROM links_partners WHERE active=1 ORDER BY name').all()).results});
 if(request.method==='GET')return reply({partners:(await db.prepare('SELECT p.*,d.details,(SELECT COUNT(*) FROM links_partner_referrals r JOIN pools x ON x.id=r.pool_id WHERE r.partner_id=p.id) AS referred_pools FROM links_partners p LEFT JOIN links_partner_details d ON d.partner_id=p.id ORDER BY p.name').all()).results,pools:(await db.prepare("SELECT p.id,p.name,p.code,(SELECT value FROM pool_settings WHERE pool_id=p.id AND key='commissioner_email') AS commissioner_email FROM pools p ORDER BY p.name").all()).results});
 const b=await request.json();
 if(b.action==='partner-qr'||b.action==='revoke-partner-qr'){const p=await db.prepare('SELECT id,active FROM links_partners WHERE id=?').bind(String(b.id||'')).first();if(!p)return reply({error:'Partner not found.'},404);if(b.action==='revoke-partner-qr'){await db.prepare('DELETE FROM links_partner_links WHERE partner_id=?').bind(p.id).run();return reply({ok:true})}if(!p.active)return reply({error:'Activate this partner first.'},400);await db.prepare('INSERT OR IGNORE INTO links_partner_links VALUES(?,?)').bind(p.id,crypto.randomUUID()+crypto.randomUUID()).run();const link=await db.prepare('SELECT token FROM links_partner_links WHERE partner_id=?').bind(p.id).first();return reply({url:url.origin+'/new-build/partner.html?ref='+encodeURIComponent(link.token)})}
 if(b.action==='referrals'){return reply({pools:(await db.prepare('SELECT p.name,p.code,r.created_at FROM links_partner_referrals r JOIN pools p ON p.id=r.pool_id WHERE r.partner_id=? ORDER BY r.created_at DESC').bind(String(b.id||'')).all()).results})}
 if(b.action==='qr'||b.action==='revoke'){
 const p=await db.prepare('SELECT * FROM links_partners WHERE id=?').bind(String(b.id||'')).first();if(!p)return reply({error:'Partner not found.'},404);
 if(b.action==='revoke'){await db.prepare('DELETE FROM links_partner_invites WHERE partner_id=?').bind(p.id).run();return reply({ok:true})}
 if(!p.pool_id)return reply({error:'Choose a house pool before creating a direct invitation.'},400);
 if(!p.active)return reply({error:'Activate the partner before creating an invitation.'},400);
 let q=await db.prepare('SELECT * FROM links_partner_invites WHERE partner_id=? AND expires_at>?').bind(p.id,new Date().toISOString()).first();
 if(!q){q={token:crypto.randomUUID()+crypto.randomUUID(),expires_at:new Date(Date.now()+7*864e5).toISOString()};await db.prepare('INSERT INTO links_partner_invites VALUES(?,?,?) ON CONFLICT(partner_id) DO UPDATE SET token=excluded.token,expires_at=excluded.expires_at').bind(p.id,q.token,q.expires_at).run()}
 return reply({url:url.origin+'/new-build/join.html?qr='+encodeURIComponent(q.token),expiresAt:q.expires_at});
 }
 if(b.action!=='save')return reply({error:'Unsupported action.'},400);
 const name=String(b.name||'').trim(),address=String(b.address||'').trim(),offer=String(b.offer||'').trim(),logo=safeURL(b.logo),website=safeURL(b.website),lat=Number(b.latitude),lng=Number(b.longitude),radius=Number(b.radius),pool=Number(b.pool_id),id=String(b.id||crypto.randomUUID());
 if(!name||name.length>100||!address||address.length>300||offer.length>500||!logo||!website||String(b.logo).length>2048||String(b.website).length>2048||b.latitude==null||b.longitude==null||String(b.latitude).trim()===''||String(b.longitude).trim()===''||!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lng)||Math.abs(lng)>180||!Number.isFinite(radius)||radius<10||radius>500||!Number.isInteger(pool))return reply({error:'Enter a name, address, HTTPS logo and offer links, valid coordinates, and radius of 33–1,640 feet.'},400);
 if(pool!==0&&!await db.prepare('SELECT id FROM pools WHERE id=?').bind(pool).first())return reply({error:'Choose an existing pool.'},400);
 if(b.id&&!await db.prepare('SELECT id FROM links_partners WHERE id=?').bind(id).first())return reply({error:'Partner not found.'},404);
 // Changing the pool invalidates old printed invitations rather than redirecting them silently.
 const details=JSON.stringify(Object.fromEntries(['contact','phone','email','placement','notes'].map(k=>[k,String(b[k]||'').trim().slice(0,k==='notes'?2000:300)])));
 await db.batch([db.prepare('INSERT INTO links_partner_details VALUES(?,?) ON CONFLICT(partner_id) DO UPDATE SET details=excluded.details').bind(id,details),db.prepare('DELETE FROM links_partner_invites WHERE partner_id=? AND EXISTS(SELECT 1 FROM links_partners WHERE id=? AND pool_id<>?)').bind(id,id,pool),db.prepare('INSERT INTO links_partners VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,logo=excluded.logo,address=excluded.address,latitude=excluded.latitude,longitude=excluded.longitude,radius=excluded.radius,offer=excluded.offer,website=excluded.website,pool_id=excluded.pool_id,active=excluded.active,updated_at=excluded.updated_at').bind(id,name,logo,address,lat,lng,radius,offer,website,pool,b.active===true?1:0,new Date().toISOString())]);
 return reply({ok:true,id});
 }catch(e){console.error('Partners unavailable',e);return reply({error:'Partners could not be loaded or saved. Please retry.'},503)}}
