import {digest} from './commissioner-account.js';
const enc=new TextEncoder();
export async function ensureOwner(db){await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS links_owner_password(id INTEGER PRIMARY KEY CHECK(id=1),salt TEXT NOT NULL,hash TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_admin_sessions(token TEXT PRIMARY KEY,expires_at TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_owner_attempts(ip TEXT PRIMARY KEY,window INTEGER NOT NULL,count INTEGER NOT NULL)')
])}
export async function ownerHash(password,salt){const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);return Array.from(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:100000},key,256)),n=>n.toString(16).padStart(2,'0')).join('')}
export async function ownerPasswordOk(db,password){await ensureOwner(db);const row=await db.prepare('SELECT salt,hash FROM links_owner_password WHERE id=1').first();if(row)return await ownerHash(String(password||''),row.salt)===row.hash;
 // Existing owner credential is accepted only until the owner replaces it.
 return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode('links-master-2026:'+String(password||''))))))==='8t2qIg4XCrJfSg1nWkYOq27IcrIatTKjX3lWHdc8eVI=';
}
export async function ownerAttempt(request,db){await ensureOwner(db);const ip=await digest(request.headers.get('cf-connecting-ip')||'local'),window=Math.floor(Date.now()/900000);return !!await db.prepare('INSERT INTO links_owner_attempts(ip,window,count) VALUES(?,?,1) ON CONFLICT(ip) DO UPDATE SET window=excluded.window,count=CASE WHEN window=excluded.window THEN count+1 ELSE 1 END WHERE window<>excluded.window OR count<5 RETURNING count').bind(ip,window).first()}
export async function ownerSession(request,db){await ensureOwner(db);const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');return token?db.prepare('SELECT token FROM links_admin_sessions WHERE token=? AND expires_at>?').bind(token,new Date().toISOString()).first():null}
