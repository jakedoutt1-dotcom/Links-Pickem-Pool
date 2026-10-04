export const GRANT_PRODUCTS={party_day:'Party Pass',party_annual:'Annual Party Pack',trivia_host:'Hosted Trivia Night'};
export async function ensurePartyGrants(db){await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS links_party_grants(id TEXT PRIMARY KEY,email TEXT NOT NULL,product TEXT NOT NULL,days INTEGER NOT NULL,created_at TEXT NOT NULL,expires_at TEXT NOT NULL,revoked_at TEXT,note TEXT NOT NULL,actor TEXT NOT NULL)'),
 db.prepare('CREATE INDEX IF NOT EXISTS links_party_grants_email ON links_party_grants(email,expires_at)')
]);}
export async function complimentaryAccess(db,email,type){await ensurePartyGrants(db);const row=await db.prepare("SELECT id,product,expires_at FROM links_party_grants WHERE email=? AND revoked_at IS NULL AND expires_at>? AND "+(type==='host'?"product='trivia_host'":"product IN ('party_day','party_annual')")+' ORDER BY expires_at DESC LIMIT 1').bind(email,new Date().toISOString()).first();return row?{...row,complimentary:true,active:true,paid_until:row.expires_at}:null;}
