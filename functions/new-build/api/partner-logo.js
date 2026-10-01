import {ownerSession} from '../../lib/owner-auth.js';
const MAX=512*1024;
const reply=(error,status)=>Response.json({error},{status});
export async function onRequest({request,env}){try{
 const db=env.DB;
 if(!['GET','POST'].includes(request.method))return reply('Method not allowed.',405);
 if(request.method==='POST'&&!await ownerSession(request,db))return reply('LINKS owner sign-in required.',401);
 await db.prepare('CREATE TABLE IF NOT EXISTS links_partner_logos(id TEXT PRIMARY KEY,mime TEXT NOT NULL,data BLOB NOT NULL)').run();
 if(request.method==='GET'){const id=new URL(request.url).searchParams.get('id');if(!/^[a-f0-9-]{36}$/.test(id||''))return reply('Logo not found.',404);const row=await db.prepare('SELECT mime,data FROM links_partner_logos WHERE id=?').bind(id).first();if(!row)return reply('Logo not found.',404);return new Response(new Uint8Array(row.data),{headers:{'Content-Type':row.mime,'X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=31536000, immutable','Content-Security-Policy':"default-src 'none'"}})}
 const reader=request.body?.getReader();if(!reader)return reply('Choose a logo image.',400);let size=0,chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX){await reader.cancel();return reply('Logo is too large. Choose a smaller image.',413)}chunks.push(value)}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
 const png=[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b),jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255,webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';const mime=png?'image/png':jpg?'image/jpeg':webp?'image/webp':null;if(!mime||size<24)return reply('Choose a PNG, JPG, or WebP logo.',400);
 const id=crypto.randomUUID();await db.prepare('INSERT INTO links_partner_logos VALUES(?,?,?)').bind(id,mime,bytes.buffer).run();return Response.json({url:new URL('./partner-logo?id='+id,request.url).href},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Logo upload failed',e);return reply('Logo could not be uploaded. Please retry.',503)}}
