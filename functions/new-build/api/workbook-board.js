import {normalizeBoard} from '../../../public/new-build/workbook-board-model.mjs';
import {WORKBOOK_PUBLISH_HASH} from '../../lib/workbook-publish-config.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),n=>n.toString(16).padStart(2,'0')).join('');
export async function onRequest({request,env}){
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 if(!env?.DB)return json({error:'Weekly board is temporarily unavailable.'},503);
 try{
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS links_workbook_public_boards (id TEXT PRIMARY KEY,payload TEXT NOT NULL,updated_at TEXT NOT NULL)').run();
  if(request.method==='POST'){
   const key=request.headers.get('X-Workbook-Publish-Key')||'';
   if(!/^[a-f0-9]{64}$/.test(key)||await hash(key)!==(env.WORKBOOK_NFL_CREW_PUBLISH_HASH||WORKBOOK_PUBLISH_HASH))return json({error:'This workbook is not connected for publishing.'},401);
   if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Send workbook data as JSON.'},400);
   const reader=request.body?.getReader(),chunks=[];let size=0;
   if(!reader)return json({error:'Workbook data is missing.'},400);
   while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>600000){await reader.cancel();return json({error:'Workbook board is too large.'},413);}chunks.push(value);}
   const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
   let board;try{board=normalizeBoard(JSON.parse(new TextDecoder().decode(bytes)));}catch(e){return json({error:e.message||'Invalid workbook data.'},400);}
   const updatedAt=new Date().toISOString();
   await env.DB.prepare('INSERT INTO links_workbook_public_boards(id,payload,updated_at) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at').bind('nfl-crew',JSON.stringify(board),updatedAt).run();
   return json({ok:true,updatedAt,url:'https://linkspickempools.com/new-build/barnes-pool-results.html'});
  }
  const saved=await env.DB.prepare('SELECT payload,updated_at FROM links_workbook_public_boards WHERE id=?').bind('nfl-crew').first();
  if(saved)return json({...JSON.parse(saved.payload),updatedAt:saved.updated_at});
  if(env.ASSETS?.fetch){const seed=await env.ASSETS.fetch(new Request(new URL('/new-build/assets/workbook/nfl-crew-board.json',request.url)));if(seed.ok){const data=await seed.json();return json({...normalizeBoard(data),updatedAt:data.updatedAt});}}
  return json({error:'The workbook owner has not published a week yet.'},404);
 }catch{return json({error:'The weekly board could not update. Please try again.'},503);}
}
