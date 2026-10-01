export async function ensurePartners(db){await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS links_partners(id TEXT PRIMARY KEY,name TEXT NOT NULL,logo TEXT NOT NULL,address TEXT NOT NULL,latitude REAL NOT NULL,longitude REAL NOT NULL,radius REAL NOT NULL,offer TEXT NOT NULL,website TEXT NOT NULL,pool_id INTEGER NOT NULL,active INTEGER NOT NULL,updated_at TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_partner_details(partner_id TEXT PRIMARY KEY,details TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_partner_links(partner_id TEXT PRIMARY KEY,token TEXT UNIQUE NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_partner_referrals(pool_id INTEGER PRIMARY KEY,partner_id TEXT NOT NULL,created_at TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_partner_invites(partner_id TEXT PRIMARY KEY,token TEXT UNIQUE NOT NULL,expires_at TEXT NOT NULL)')
])}
export function safeURL(value){if(!value)return '';try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}}
export async function partnerInvite(db,token){await ensurePartners(db);return db.prepare('SELECT q.token,q.expires_at,p.pool_id,p.id AS partner_id,p.name AS partner_name,p.logo,p.address,p.offer,p.website,s.code,s.name FROM links_partner_invites q JOIN links_partners p ON p.id=q.partner_id JOIN pools s ON s.id=p.pool_id WHERE q.token=? AND q.expires_at>? AND p.active=1').bind(token,new Date().toISOString()).first()}

export async function referralPartner(db,token){await ensurePartners(db);return db.prepare('SELECT p.id,p.name,p.logo,p.pool_id FROM links_partner_links l JOIN links_partners p ON p.id=l.partner_id WHERE l.token=? AND p.active=1').bind(String(token||'')).first()}
