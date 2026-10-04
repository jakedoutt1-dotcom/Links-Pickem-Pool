import {accountSession} from './commissioner-account.js';
import {complimentaryAccess} from './party-grants.js';
export const PARTY_PLANS={day:{label:'Party Pass',amount:499,hours:24},annual:{label:'Annual Party Pack',amount:3999,hours:365*24},host_day:{label:'Trivia Night Day Pass',amount:499,hours:24}};
export const PARTY_GAMES=['trivia-rally','million-point','dead-air','say-what','last-alibi','captain-clash','friend-challenge'];
export const partyEnabled=env=>env.PARTY_PACK_ENABLED==='true';
export async function ensureParty(db){await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS links_party_purchases(id TEXT PRIMARY KEY,email TEXT NOT NULL,plan TEXT NOT NULL,amount_cents INTEGER NOT NULL,order_id TEXT UNIQUE NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL,paid_at TEXT,expires_at TEXT)'),
 db.prepare('CREATE INDEX IF NOT EXISTS links_party_access ON links_party_purchases(email,status,expires_at)')
]);}
export async function partySession(request,db){
 const cookie=(request.headers.get('Cookie')||'').match(/(?:^|;\s*)links_party_session=([a-f0-9-]{72})(?:;|$)/)?.[1];
 const headers=new Headers(request.headers);if(!headers.get('x-links-account')&&cookie)headers.set('x-links-account',cookie);
 return accountSession(new Request(request.url,{headers}),db);
}
export async function partyAccess(db,email){await ensureParty(db);const paid=await db.prepare("SELECT plan,expires_at FROM links_party_purchases WHERE email=? AND status='PAID' AND plan IN ('day','annual') AND expires_at>? ORDER BY expires_at DESC LIMIT 1").bind(email,new Date().toISOString()).first(),grant=await complimentaryAccess(db,email,'party');return grant&&(!paid||grant.expires_at>paid.expires_at)?grant:paid;}
// Protect creation, not guest joins or play in an existing room. Room expiry still applies.
export async function requirePartyPass(request,env){
 // Checkout configuration must never grant free room creation.
 const session=await partySession(request,env.DB);
 if(session&&await partyAccess(env.DB,session.email))return null;
 return Response.json({error:'The room creator needs a Party Pass. Friends join free.',code:'PARTY_PASS_REQUIRED',url:'/new-build/party-pack.html'},{status:402,headers:{'Cache-Control':'no-store'}});
}
