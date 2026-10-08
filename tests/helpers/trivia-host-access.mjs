import {ensureAccounts} from '../../functions/lib/commissioner-account.js';
import {ensurePartyGrants} from '../../functions/lib/party-grants.js';
export async function grantTestHost(db){await ensureAccounts(db);await ensurePartyGrants(db);await db.prepare("INSERT OR REPLACE INTO pool_settings(pool_id,key,value) VALUES(1,'commissioner_email','host@example.com')").run();await db.prepare("INSERT INTO links_party_grants(id,email,product,days,created_at,expires_at,note,actor) VALUES('test-host','host@example.com','trivia_host',365,'2026-01-01','2099-01-01','Test fixture','test')").run();}
