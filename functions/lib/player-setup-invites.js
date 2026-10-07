import {ensureIdentity,passwordHash,identitySession,identityRate,issueIdentitySession} from './player-identity.js';
import {ownerSession} from './owner-auth.js';
import {sendPoolEmail,escapeEmail} from './pool-email.js';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),x=>x.toString(16).padStart(2,'0')).join('');
async function ensure(db){await ensureIdentity(db);await db.batch([db.prepare("CREATE TABLE IF NOT EXISTS pool_player_contacts(pool_id INTEGER NOT NULL,player_name TEXT NOT NULL,email TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',PRIMARY KEY(pool_id,player_name))"),db.prepare('CREATE TABLE IF NOT EXISTS links_player_memberships(pool_id INTEGER NOT NULL,player_name TEXT NOT NULL,email TEXT NOT NULL,PRIMARY KEY(pool_id,player_name))')]);await db.prepare('CREATE TABLE IF NOT EXISTS links_setup_invites(token_hash TEXT PRIMARY KEY,pool_id INTEGER NOT NULL,player_name TEXT NOT NULL,email TEXT NOT NULL,credential TEXT NOT NULL,expires_at INTEGER NOT NULL,used_at INTEGER,created_at INTEGER NOT NULL)').run()}
async function eligible(db,pool,name){return db.prepare("SELECT p.*,COALESCE(s.value,'') AS commissioner FROM pool_players p LEFT JOIN pool_settings s ON s.pool_id=p.pool_id AND s.key='commissioner_player_name' WHERE p.pool_id=? AND p.name=? AND NOT EXISTS(SELECT 1 FROM links_id_members m WHERE m.pool_id=p.pool_id AND m.player_name=p.name) AND NOT EXISTS(SELECT 1 FROM newbuild_player_access a WHERE a.pool_id=p.pool_id AND a.player_name=p.name AND a.status='pending')").bind(pool,name).first()}
export async function setupAdmin({request,env}){
 const db=env.DB;if(!db)return reply({error:'Service unavailable.'},503);
 try{
 if(!await ownerSession(request,db))return reply({error:'Sign in to LINKS Admin first.'},401);await ensure(db);
 if(request.method==='GET'){
 const pool=new URL(request.url).searchParams.get('pool');if(!pool)return reply({pools:(await db.prepare('SELECT id,name,code FROM pools ORDER BY name').all()).results});
 return reply({players:(await db.prepare("SELECT p.name,CASE WHEN m.id IS NOT NULL THEN 1 ELSE 0 END AS connected,COALESCE(a.status,'active') AS status,(SELECT i.created_at FROM links_setup_invites i WHERE i.pool_id=p.pool_id AND i.player_name=p.name ORDER BY i.created_at DESC LIMIT 1) AS lastInviteAt,(SELECT i.email FROM links_setup_invites i WHERE i.pool_id=p.pool_id AND i.player_name=p.name ORDER BY i.created_at DESC LIMIT 1) AS inviteEmail,COALESCE(NULLIF(trim(c.email),''),NULLIF(trim(v.email),''),NULLIF(trim(ac.email),''),'') AS savedEmail,CASE WHEN trim(COALESCE(c.email,''))<>'' THEN 'Pool player contact' WHEN trim(COALESCE(v.email,''))<>'' THEN 'Connected pool membership' WHEN trim(COALESCE(ac.email,''))<>'' THEN 'LINKS account' ELSE '' END AS emailSource FROM pool_players p LEFT JOIN links_id_members m ON m.pool_id=p.pool_id AND m.player_name=p.name LEFT JOIN newbuild_player_access a ON a.pool_id=p.pool_id AND a.player_name=p.name LEFT JOIN pool_player_contacts c ON c.pool_id=p.pool_id AND c.player_name=p.name COLLATE NOCASE LEFT JOIN links_player_memberships v ON v.pool_id=p.pool_id AND v.player_name=p.name COLLATE NOCASE LEFT JOIN links_id_accounts ac ON ac.id=m.account_id WHERE p.pool_id=? ORDER BY p.name").bind(pool).all()).results});
 }
 if(request.method!=='POST')return reply({error:'Method not allowed.'},405);
 if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Invalid origin.'},403);
 const raw=await request.text();if(raw.length>2048)return reply({error:'Request too large.'},400);const b=JSON.parse(raw);
 if(b.action==='revoke'){await db.prepare('DELETE FROM links_setup_invites WHERE pool_id=? AND player_name=? AND used_at IS NULL').bind(Number(b.pool),String(b.player)).run();return reply({ok:true})}
 if(b.action!=='create')return reply({error:'Unknown action.'},400);
 const player=await eligible(db,Number(b.pool),String(b.player));if(!player)return reply({error:'This player is already connected or cannot start setup. Use the new login recovery for connected players.'},409);
 const email=String(b.email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return reply({error:'Enter the player’s correct email for account recovery.'},400);
 const token=crypto.randomUUID()+crypto.randomUUID(),tokenHash=await hash(token),expires=Date.now()+86400000;
 await db.batch([db.prepare('DELETE FROM links_setup_invites WHERE pool_id=? AND player_name=? AND used_at IS NULL').bind(player.pool_id,player.name),db.prepare('INSERT INTO links_setup_invites VALUES(?,?,?,?,?,?,NULL,?)').bind(tokenHash,player.pool_id,player.name,email,await hash(player.salt+':'+player.password_hash),expires,Date.now())]);
 const url=new URL('/new-build/player-setup.html',request.url);url.hash=token;
 let delivery=null;if(b.sendEmail===true){delivery=await sendPoolEmail(env,email,{subject:'Create your new LINKS username and password',text:'Hi '+player.name+'! LINKS has an easier login. Create your new LINKS username and password using your private link below. No more searching for your pool or selecting your player every time. Your picks, standings and history stay saved.\n\n'+url.href+'\n\nAfter setup, use “Already created your username and password?” on the LINKS login page every time. Do not use the old pool login again.\n\nThis private link expires in 24 hours and works once. Do not forward it. Already have a LINKS account? Sign in, then reopen this link to connect your pool.',html:'<h1>Create your new LINKS username and password</h1><p>Hi '+escapeEmail(player.name)+'! LINKS has an easier login. No more searching for your pool or selecting your player every time.</p><p><a href="'+escapeEmail(url.href)+'">Create my username and password</a></p><p>Your picks, standings and history stay saved.</p><p><strong>After setup:</strong> use “Already created your username and password?” on the LINKS login page every time. Do not use the old pool login again.</p><p>This private link expires in 24 hours and works once. Do not forward it.</p><p>Already have a LINKS account? Sign in, then reopen this link to connect your pool.</p>' },'player-setup-'+tokenHash)}
 return reply({url:url.href,expiresAt:expires,delivery});
 }catch{return reply({error:'Player login help is temporarily unavailable.'},503)}
}
export async function setupPlayer({request,env}){
 const db=env.DB;if(!db)return reply({error:'Service unavailable.'},503);
 try{
 if(request.method!=='POST')return reply({error:'Method not allowed.'},405);
 if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Invalid origin.'},403);
 await ensure(db);await identityRate(request,db,'player-setup-link');
 const raw=await request.text();if(raw.length>2048)return reply({error:'Request too large.'},400);const b=JSON.parse(raw),tokenHash=await hash(String(b.token||''));
 const invite=await db.prepare('SELECT * FROM links_setup_invites WHERE token_hash=? AND used_at IS NULL AND expires_at>?').bind(tokenHash,Date.now()).first();
 if(!invite)return reply({error:'This setup link has expired, was replaced, or has already been used. Ask LINKS Admin for a new link, or sign in if you finished setup.'},410);
 const player=await eligible(db,invite.pool_id,invite.player_name);if(!player||await hash(player.salt+':'+player.password_hash)!==invite.credential)return reply({error:'This player’s login changed. Return to login or ask LINKS Admin for a new link.'},409);
 const pool=await db.prepare('SELECT name FROM pools WHERE id=?').bind(invite.pool_id).first(),account=await identitySession(request,db);
 if(b.action==='inspect')return reply({player:player.name,pool:pool?.name,email:invite.email,signedIn:!!account,matchingAccount:account?.email.toLowerCase()===invite.email});
 if(!['create','connect'].includes(b.action))return reply({error:'Unknown action.'},400);
 let target=account,create=b.action==='create';
 if(create){
 const username=String(b.username||'').trim().toLowerCase(),password=String(b.password||'');
 if(!/^[a-z0-9][a-z0-9_.-]{2,29}$/.test(username)||password.length<10||password.length>256)return reply({error:'Use a username of 3–30 letters, numbers, dots, dashes or underscores, and a password of at least 10 characters.'},400);
 if(await db.prepare('SELECT id FROM links_id_accounts WHERE username=? OR email=?').bind(username,invite.email).first())return reply({error:'That username or email is already registered. Choose a different username, or sign in to your existing LINKS account and reopen this link to connect this pool.'},409);
 const salt=crypto.randomUUID();target={id:crypto.randomUUID(),username,email:invite.email,display_name:player.name,salt,password_hash:await passwordHash(password,salt)};
 }else if(!account||account.email.toLowerCase()!==invite.email)return reply({error:'Sign in to the LINKS account with the email shown on this invitation, then reopen this link.'},403);
 const statements=[],now=Date.now();
 // The transaction claims the link first; all following writes require this unique claim.
 const claim=crypto.randomUUID();
 await db.prepare('CREATE TABLE IF NOT EXISTS links_setup_claims(id TEXT PRIMARY KEY,token_hash TEXT NOT NULL UNIQUE)').run();
 statements.push(db.prepare("INSERT INTO links_setup_claims SELECT ?,i.token_hash FROM links_setup_invites i JOIN pool_players p ON p.pool_id=i.pool_id AND p.name=i.player_name WHERE i.token_hash=? AND i.used_at IS NULL AND i.expires_at>? AND p.salt=? AND p.password_hash=? AND NOT EXISTS(SELECT 1 FROM links_id_members m WHERE m.pool_id=p.pool_id AND m.player_name=p.name) AND NOT EXISTS(SELECT 1 FROM newbuild_player_access a WHERE a.pool_id=p.pool_id AND a.player_name=p.name AND a.status='pending')").bind(claim,tokenHash,now,player.salt,player.password_hash));
 if(create)statements.push(db.prepare('INSERT INTO links_id_accounts SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM links_setup_claims WHERE id=?)').bind(target.id,target.username,target.email,target.display_name,target.salt,target.password_hash,new Date().toISOString(),claim));
 statements.push(db.prepare('INSERT INTO links_id_members SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM links_setup_claims WHERE id=?)').bind(crypto.randomUUID(),player.pool_id,player.name,target.id,player.commissioner.toLowerCase()===player.name.toLowerCase()?'admin':'player',claim));
 statements.push(db.prepare('UPDATE links_setup_invites SET used_at=? WHERE token_hash=? AND EXISTS(SELECT 1 FROM links_setup_claims WHERE id=?)').bind(now,tokenHash,claim));
 statements.push(db.prepare('DELETE FROM pool_sessions WHERE pool_id=? AND player_name=? AND EXISTS(SELECT 1 FROM links_setup_claims WHERE id=?)').bind(player.pool_id,player.name,claim));
 const results=await db.batch(statements);if(!results[0].meta?.changes)return reply({error:'This link has already been used.'},410);
 return await issueIdentitySession(db,target,true);
 }catch(e){if(e.status)return reply({error:e.message},e.status);if(/UNIQUE/.test(String(e)))return reply({error:'This account or player is already connected. Return to login.'},409);return reply({error:'Setup could not finish. Please try again.'},503)}
}
