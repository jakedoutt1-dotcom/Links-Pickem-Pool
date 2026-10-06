import {ownerSession} from '../../lib/owner-auth.js';
import {ensureAccounts,emailKey} from '../../lib/commissioner-account.js';
import {ensureQuestionSets,hostQuestions} from '../../lib/host-question-sets.js';
export async function questionOwner(db,admin){await ensureAccounts(db);const row=await db.prepare('SELECT email FROM links_pool_owners WHERE pool_id=?').bind(admin.pool_id).first();return row?.email?'email:'+emailKey(row.email):'pool:'+admin.pool_id}
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){try{
 const db=env.DB,url=new URL(request.url);if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405);
 if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)return json({error:'Open LINKS to continue.'},403);
 let b={};if(request.method==='POST'){const raw=await request.text();if(raw.length>550000)return json({error:'Question set is too large.'},413);b=JSON.parse(raw)}
 const review=url.searchParams.get('review')==='1'||b.action==='review';
 let owner;
 if(review){if(!await ownerSession(request,db))return json({error:'LINKS Admin sign-in required.'},403)}else{
 const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');const admin=await db.prepare("SELECT * FROM pool_sessions WHERE token=? AND expires_at>? AND role='admin'").bind(token,new Date().toISOString()).first();if(!admin)return json({error:'Commissioner sign-in required.'},403);owner=await questionOwner(db,admin)}
 await ensureQuestionSets(db);
 if(request.method==='GET'){const rows=(await (review?db.prepare("SELECT id,title,questions,status,updated FROM links_host_question_sets WHERE shared=1 ORDER BY updated DESC LIMIT 100"):db.prepare('SELECT id,title,questions,status,shared,updated FROM links_host_question_sets WHERE owner_key=? ORDER BY updated DESC LIMIT 50').bind(owner)).all()).results||[];return json({sets:rows.map(r=>({...r,questions:JSON.parse(r.questions)}))})}
 if(review){if(!['approved','rejected'].includes(b.status))return json({error:'Choose approve or reject.'},400);await db.prepare('UPDATE links_host_question_sets SET status=? WHERE id=? AND shared=1').bind(b.status,b.id).run();return json({ok:true})}
 if(b.action!=='save')return json({error:'Unknown action'},400);
 const title=typeof b.title==='string'?b.title.trim():'';if(!title||title.length>70)return json({error:'Enter a set name, up to 70 characters.'},400);
 if(typeof b.shared!=='boolean')return json({error:'Choose whether to share this set.'},400);
 const id=b.id||crypto.randomUUID();if(b.id&&!await db.prepare('SELECT id FROM links_host_question_sets WHERE id=? AND owner_key=?').bind(id,owner).first())return json({error:'Question set not found.'},404);
 if(!b.id){const count=await db.prepare('SELECT COUNT(*) AS n FROM links_host_question_sets WHERE owner_key=?').bind(owner).first();if(count.n>=50)return json({error:'You have 50 sets. Edit an existing set.'},400)}
 const questions=hostQuestions(b.questions,id,b.shared),status=b.shared?'pending':'private';
 await db.prepare('INSERT INTO links_host_question_sets(id,owner_key,title,questions,shared,status,updated) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,questions=excluded.questions,shared=excluded.shared,status=excluded.status,updated=excluded.updated WHERE owner_key=excluded.owner_key').bind(id,owner,title,JSON.stringify(questions),b.shared?1:0,status,new Date().toISOString()).run();return json({id,status,count:questions.length});
 }catch(e){return json({error:/^(Question|Upload)/.test(e.message)?e.message:'Could not save or load questions. Try again.'},400)}}
