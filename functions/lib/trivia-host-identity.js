import {accountSession,ensureAccounts,emailKey} from './commissioner-account.js';
export async function triviaHostIdentity(request,db){
 const account=await accountSession(request,db);
 if(account){
  await db.prepare('CREATE TABLE IF NOT EXISTS links_trivia_hosts(id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT NOT NULL UNIQUE)').run();
  const email=emailKey(account.email);await db.prepare('INSERT OR IGNORE INTO links_trivia_hosts(email) VALUES(?)').bind(email).run();
  const host=await db.prepare('SELECT id FROM links_trivia_hosts WHERE email=?').bind(email).first();
  return {pool_id:-host.id,player_name:'email:'+email,email,verifiedHost:true};
 }
 const bearer=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
 return bearer?db.prepare("SELECT * FROM pool_sessions WHERE token=? AND expires_at>? AND role='admin'").bind(bearer,new Date().toISOString()).first():null;
}
