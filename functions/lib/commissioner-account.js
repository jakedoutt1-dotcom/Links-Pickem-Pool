// Commissioner identity is verified separately from a player's pool session.
export const PLANS={free:{label:'Free',amount:0,slots:1},plus:{label:'LINKS Plus',amount:1999,slots:3},nfl_package:{label:'LINKS Pro',amount:2999,slots:6},all_access:{label:'LINKS All Access',amount:4999,slots:10}};
export const GAMES={nfl:'NFL Pick’em',college:'College Pick’em',homerun:'Home Run Club',mlb:'MLB Pick’em',survivor:'Survivor',confidence:'Confidence','33':'Game 33',squares:'Squares',march:'March Madness',masters:'Golf',nascar:'NASCAR',fantasy:'Fantasy',dynasty:'Dynasty',custom:'Custom',props:'Props',playoff:'Playoffs'};
// Only games with connected player and commissioner flows are available for creation.
export const CREATABLE_GAMES=new Set(['nfl','college','squares','march','mlb','homerun','masters','nascar']); // Other games are temporarily Coming Soon.
export function emailKey(value){let email=String(value||'').trim().toLowerCase();const [local,domain]=email.split('@');if(domain==='gmail.com'||domain==='googlemail.com')email=local.split('+')[0].replaceAll('.','')+'@gmail.com';return email}
export async function digest(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),x=>x.toString(16).padStart(2,'0')).join('')}
export async function ensureAccounts(db){await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS links_package_grants(id TEXT PRIMARY KEY,email TEXT NOT NULL,plan TEXT NOT NULL,days INTEGER NOT NULL,created_at TEXT NOT NULL,expires_at TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_accounts(email TEXT PRIMARY KEY,verified_at TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_account_sessions(token_hash TEXT PRIMARY KEY,email TEXT NOT NULL,expires_at TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_account_codes(email TEXT PRIMARY KEY,code_hash TEXT NOT NULL,expires_at TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,sent_at TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_account_mail_limits(ip_hash TEXT PRIMARY KEY,window_start INTEGER NOT NULL,sends INTEGER NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_pool_owners(pool_id INTEGER PRIMARY KEY,email TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_pool_slots(id TEXT PRIMARY KEY,email TEXT NOT NULL,pool_id INTEGER,game_type TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,expires_at TEXT,UNIQUE(pool_id,game_type))'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_account_purchases(id TEXT PRIMARY KEY,email TEXT NOT NULL,plan TEXT NOT NULL,amount_cents INTEGER NOT NULL,order_id TEXT UNIQUE,status TEXT NOT NULL,created_at TEXT NOT NULL,paid_at TEXT,expires_at TEXT)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_account_plans(email TEXT PRIMARY KEY,plan TEXT NOT NULL,expires_at TEXT NOT NULL,purchase_id TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_account_preferences(email TEXT PRIMARY KEY,free_slot_id TEXT NOT NULL)')
])}
export async function accountSession(request,db){const token=request.headers.get('x-links-account')||'';if(!token)return null;await ensureAccounts(db);return db.prepare('SELECT email,expires_at FROM links_account_sessions WHERE token_hash=? AND expires_at>?').bind(await digest(token),new Date().toISOString()).first()}
export async function importOwnedPools(db,email){
 // Only called after mailbox verification. Never reassign an already-owned pool.
 const rows=(await db.prepare("SELECT pool_id,value FROM pool_settings WHERE key='commissioner_email'").all()).results||[];
 for(const row of rows){if(emailKey(row.value)!==email)continue;await db.prepare('INSERT OR IGNORE INTO links_pool_owners(pool_id,email) VALUES(?,?)').bind(row.pool_id,email).run()}
 const pools=(await db.prepare('SELECT pool_id FROM links_pool_owners WHERE email=?').bind(email).all()).results||[];
 for(const p of pools){const games=(await db.prepare('SELECT game_type,active FROM pool_active_games WHERE pool_id=?').bind(p.pool_id).all()).results||[];
  if(!games.length){const setting=await db.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='game_type'").bind(p.pool_id).first(),game=GAMES[setting?.value]?setting.value:'nfl';games.push({game_type:game,active:1});await db.prepare('INSERT OR IGNORE INTO pool_active_games(pool_id,game_type,is_primary,active,added_at) VALUES(?,?,1,1,?)').bind(p.pool_id,game,new Date().toISOString()).run()}
  for(const g of games)await db.prepare('INSERT OR IGNORE INTO links_pool_slots(id,email,pool_id,game_type,active) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),email,p.pool_id,g.game_type,Number(g.active)!==0?1:0).run()
 }
}
export async function allowance(db,email){
 let ent=await db.prepare('SELECT * FROM links_account_plans WHERE email=?').bind(email).first();
 // Preserve paid legacy purchases, including canonical Gmail aliases. Never infer payment from a pool's test-mode service flag.
 if(!ent){try{const rows=(await db.prepare("SELECT * FROM commissioner_entitlements WHERE status='ACTIVE'").all()).results||[];ent=rows.filter(x=>emailKey(x.email)===email&&PLANS[x.plan]).sort((a,b)=>Number(!b.expires_at||Date.parse(b.expires_at)>Date.now())-Number(!a.expires_at||Date.parse(a.expires_at)>Date.now())||PLANS[b.plan].slots-PLANS[a.plan].slots)[0]}catch(e){if(!/no such table/i.test(String(e)))throw e}}
 const valid=ent&&(!ent.expires_at||Date.parse(ent.expires_at)>Date.now())&&PLANS[ent.plan];const plan=valid?ent.plan:'free';
 let result={plan,...PLANS[plan],expiresAt:ent?.expires_at||null};
 let grants=[];try{grants=(await db.prepare('SELECT plan,expires_at FROM links_package_grants WHERE email=? ORDER BY expires_at DESC').bind(email).all()).results||[]}catch(e){if(!/no such table/i.test(String(e)))throw e}
 for(const grant of grants){const cfg=PLANS[grant.plan];if(!cfg||Date.parse(grant.expires_at)<=Date.now())continue;if(cfg.slots>result.slots||(cfg.slots===result.slots&&result.expiresAt&&Date.parse(grant.expires_at)>Date.parse(result.expiresAt)))result={plan:grant.plan,...cfg,expiresAt:grant.expires_at,complimentary:true}}
 if(result.plan==='free'&&!result.expiresAt&&grants.length)result.expiresAt=grants[0].expires_at;
 return result;
}
export async function reserveSlots(db,email,games){const plan=await allowance(db,email),ids=games.map(()=>crypto.randomUUID());
 // One atomic SQL statement checks capacity and reserves the complete request.
 const rows=games.map(()=> '(?,?,?)').join(',');const args=games.flatMap((g,i)=>[ids[i],email,g]);
 const now=new Date().toISOString(),expires=new Date(Date.now()+600000).toISOString();
 const r=await db.prepare(`WITH requested(id,email,game_type) AS (VALUES ${rows}) INSERT INTO links_pool_slots(id,email,game_type,active,expires_at) SELECT id,email,game_type,1,? FROM requested WHERE (SELECT COUNT(*) FROM links_pool_slots WHERE email=? AND active=1 AND (pool_id IS NOT NULL OR expires_at>?))+?<=?`).bind(...args,expires,email,now,games.length,plan.slots).run();
 if(Number(r.meta?.changes)!==games.length){const e=new Error('Your '+plan.label+' package includes '+plan.slots+' active game-pool slot'+(plan.slots===1?'':'s')+'. Choose a larger package to add more.');e.status=402;throw e}return ids;
}
export async function releaseSlots(db,ids){for(const id of ids)await db.prepare('DELETE FROM links_pool_slots WHERE id=? AND pool_id IS NULL').bind(id).run()}
export async function ownedPool(db,email,id){return db.prepare('SELECT p.id,p.name,p.code FROM pools p JOIN links_pool_owners o ON o.pool_id=p.id WHERE o.email=? AND p.id=?').bind(email,Number(id)).first()}
export async function retainedFreeSlot(db,email){
 const chosen=await db.prepare('SELECT s.id FROM links_pool_slots s JOIN links_account_preferences p ON p.free_slot_id=s.id WHERE p.email=? AND s.email=? AND s.active=1').bind(email,email).first();
 return chosen?.id||(await db.prepare('SELECT id FROM links_pool_slots WHERE email=? AND active=1 AND pool_id IS NOT NULL ORDER BY pool_id,game_type LIMIT 1').bind(email).first())?.id||null;
}
