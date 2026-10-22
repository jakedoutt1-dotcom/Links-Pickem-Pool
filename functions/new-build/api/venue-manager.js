import {identitySession} from '../../lib/player-identity.js';
import {ensurePartners,safeURL} from '../../lib/partners.js';
const reply=(b,status=200)=>Response.json(b,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){try{
 const db=env.DB;if(!['GET','POST'].includes(request.method))return reply({error:'Method not allowed.'},405);
 if(request.method==='POST'&&request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Invalid origin.'},403);
 let a;try{a=await identitySession(request,db)}catch(e){if(!/no such table/i.test(String(e)))throw e}if(!a)return reply({error:'Sign in or create your LINKS account to manage your venue.'},401);
 await ensurePartners(db);await db.prepare('CREATE TABLE IF NOT EXISTS links_venue_managers(account_id TEXT PRIMARY KEY,partner_id TEXT NOT NULL UNIQUE,agreed_at TEXT NOT NULL)').run();
 const owned=await db.prepare('SELECT p.* FROM links_venue_managers m JOIN links_partners p ON p.id=m.partner_id WHERE m.account_id=?').bind(a.id).first();
 if(request.method==='GET')return reply({account:{displayName:a.display_name,email:a.email},venue:owned||null});
 const text=await request.text();if(text.length>12000)return reply({error:'Venue information is too large.'},413);let b;try{b=JSON.parse(text)}catch{return reply({error:'Invalid venue information.'},400)}
 if(b.id&&b.id!==owned?.id)return reply({error:'You can only update your own venue.'},403);
 const name=String(b.name||'').trim(),address=String(b.address||'').trim(),offer=String(b.offer||'').trim(),logo=safeURL(b.logo),website=safeURL(b.website),lat=Number(b.latitude),lng=Number(b.longitude),radius=Number(b.radius);
 if(!name||name.length>100||!address||address.length>300||offer.length>500||!logo||logo.length>2048||(b.website&&!website)||website.length>2048||b.latitude==null||b.longitude==null||String(b.latitude).trim()===''||String(b.longitude).trim()===''||!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lng)||Math.abs(lng)>180||!Number.isFinite(radius)||radius<10||radius>500||typeof b.active!=='boolean')return reply({error:'Check the name, address, logo, HTTPS website, GPS coordinates and location radius (10–500 metres).'},400);
 if(!owned&&b.agree!==true)return reply({error:'Confirm you manage this venue and agree to display LINKS flyers.'},400);
 if(!owned&&await db.prepare('SELECT id FROM links_partners WHERE lower(trim(address))=lower(?)').bind(address).first())return reply({error:'This address already has a venue profile. Use its existing manager account or contact LINKS to connect an older listing.'},409);
 const id=owned?.id||crypto.randomUUID(),now=new Date().toISOString(),statements=[];
 if(!owned){statements.push(db.prepare('INSERT INTO links_venue_managers VALUES(?,?,?)').bind(a.id,id,now));statements.push(db.prepare('INSERT INTO links_partners VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,name,logo,address,lat,lng,radius,offer,website,0,b.active?1:0,now));statements.push(db.prepare('INSERT INTO links_partner_details VALUES(?,?)').bind(id,JSON.stringify({contact:a.display_name,email:a.email,source:'Venue self-signup',flyerAgreement:now})));}
 else statements.push(db.prepare('UPDATE links_partners SET name=?,logo=?,address=?,latitude=?,longitude=?,radius=?,offer=?,website=?,active=?,updated_at=? WHERE id=?').bind(name,logo,address,lat,lng,radius,offer,website,b.active?1:0,now,id));
 await db.batch(statements);return reply({ok:true,id});
 }catch(e){if(/UNIQUE constraint/i.test(String(e)))return reply({error:'Your venue was already created. Reload to manage it.'},409);console.error('Venue manager unavailable',e.message);return reply({error:'Venue information could not be saved. Try again.'},503)}}
