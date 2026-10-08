import {ensureAccounts,emailKey} from './commissioner-account.js';
import {loginPhase} from './login-transition.js';
import {sendPoolEmail} from './pool-email.js';
import {poolGameKeys} from './pool-games.js';
import {ensureLoginNames} from './player-login-name.js';
export const identityTestHost = host => host==='links-pickem-test.pages.dev'||host.endsWith('.links-pickem-test.pages.dev');
const cookieName='__Host-links_identity', encoder=new TextEncoder();
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const random=()=>crypto.randomUUID()+crypto.randomUUID();
const equal=(a,b)=>{a=String(a||'');b=String(b||'');let n=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)n|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return n===0};
export async function passwordHash(password,salt){const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);return Array.from(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:100000,hash:'SHA-256'},key,256))).map(x=>x.toString(16).padStart(2,'0')).join('')}
const reply=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const publicAccount=a=>({id:a.id,username:a.username,email:a.email,displayName:a.display_name});
export async function ensureIdentity(db){await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS links_id_accounts(id TEXT PRIMARY KEY,username TEXT NOT NULL UNIQUE COLLATE NOCASE,email TEXT NOT NULL UNIQUE COLLATE NOCASE,display_name TEXT NOT NULL,salt TEXT NOT NULL,password_hash TEXT NOT NULL,created_at TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_id_sessions(token_hash TEXT PRIMARY KEY,account_id TEXT NOT NULL,expires_at INTEGER NOT NULL)'),
 db.prepare('CREATE INDEX IF NOT EXISTS links_id_sessions_account ON links_id_sessions(account_id)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_id_members(id TEXT PRIMARY KEY,pool_id INTEGER NOT NULL,player_name TEXT NOT NULL,account_id TEXT NOT NULL,role TEXT NOT NULL,UNIQUE(pool_id,player_name),UNIQUE(account_id,pool_id))'),
 db.prepare('CREATE INDEX IF NOT EXISTS links_id_members_account ON links_id_members(account_id)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_id_bridges(token TEXT PRIMARY KEY,session_hash TEXT NOT NULL,account_id TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_id_challenges(id TEXT PRIMARY KEY,code_hash TEXT NOT NULL,payload TEXT NOT NULL,expires_at INTEGER NOT NULL,attempts INTEGER NOT NULL DEFAULT 0)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_id_rate(key TEXT PRIMARY KEY,hits INTEGER NOT NULL,expires_at INTEGER NOT NULL)'),
 db.prepare("CREATE TRIGGER IF NOT EXISTS links_identity_rename AFTER UPDATE OF name ON pool_players BEGIN UPDATE links_id_members SET player_name=NEW.name WHERE pool_id=OLD.pool_id AND player_name=OLD.name; END"),
 db.prepare("CREATE TRIGGER IF NOT EXISTS links_identity_remove AFTER DELETE ON pool_players BEGIN DELETE FROM pool_sessions WHERE pool_id=OLD.pool_id AND player_name=OLD.name; DELETE FROM links_id_members WHERE pool_id=OLD.pool_id AND player_name=OLD.name; END"),
 db.prepare('CREATE TABLE IF NOT EXISTS links_left_games(pool_id INTEGER NOT NULL,player_name TEXT NOT NULL,game TEXT NOT NULL,PRIMARY KEY(pool_id,player_name,game))'),
 db.prepare("CREATE TABLE IF NOT EXISTS newbuild_player_access(pool_id INTEGER NOT NULL,player_name TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'active',PRIMARY KEY(pool_id,player_name))")
]);await ensureLoginNames(db)}
export async function identitySession(request,db){const token=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(!token)return null;const tokenHash=await hash(token);return db.prepare('SELECT a.*,s.token_hash,s.expires_at FROM links_id_sessions s JOIN links_id_accounts a ON a.id=s.account_id WHERE s.token_hash=? AND s.expires_at>?').bind(tokenHash,Date.now()).first()}
async function rate(request,db,action){const key=await hash((request.headers.get('cf-connecting-ip')||'local')+':'+action+':'+Math.floor(Date.now()/3600000));const row=await db.prepare('INSERT INTO links_id_rate(key,hits,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1 RETURNING hits').bind(key,Date.now()+3600000).first();if(row.hits>40)fail('Too many attempts. Please try again later.',429)}
async function issue(db,account,remember=true){const token=random(),expires=Date.now()+(remember?30*86400000:12*3600000);await db.prepare('INSERT INTO links_id_sessions VALUES(?,?,?)').bind(await hash(token),account.id,expires).run();return reply({account:publicAccount(account)},200,{'Set-Cookie':cookieName+'='+token+'; Path=/; Secure; HttpOnly; SameSite=Strict'+(remember?'; Max-Age=2592000':'')})}
async function proof(request,db,password){const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');const s=await db.prepare('SELECT * FROM pool_sessions WHERE token=? AND expires_at>?').bind(token,new Date().toISOString()).first();if(!s)fail('Use your current pool login first.',401);const p=await db.prepare('SELECT * FROM pool_players WHERE pool_id=? AND name=?').bind(s.pool_id,s.player_name).first();const digest=p?btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(p.salt+':'+String(password||'')))))):'';if(!p||!equal(digest,p.password_hash))fail('Your current pool password does not match.',403);const access=await db.prepare('SELECT status FROM newbuild_player_access WHERE pool_id=? AND player_name=?').bind(p.pool_id,p.name).first();if(access?.status==='pending')fail('Pool access is not active.',403);return {poolId:p.pool_id,playerName:p.name,credential:await hash(p.salt+':'+p.password_hash),role:s.role==='admin'?'admin':'player'}}
function linkStatement(db,accountId,p){return db.prepare('INSERT INTO links_id_members(id,pool_id,player_name,account_id,role) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),p.poolId,p.playerName,accountId,p.role)}
async function availablePools(db,a){const rows=(await db.prepare("SELECT p.id,p.code,p.name,m.id AS membershipId,m.player_name AS playerName,m.role,COALESCE(s.value,'') AS commissioner FROM links_id_members m JOIN pools p ON p.id=m.pool_id JOIN pool_players u ON u.pool_id=m.pool_id AND u.name=m.player_name LEFT JOIN pool_settings s ON s.pool_id=p.id AND s.key='commissioner_player_name' LEFT JOIN newbuild_player_access x ON x.pool_id=m.pool_id AND x.player_name=m.player_name WHERE m.account_id=? AND COALESCE(x.status,'active')<>'pending' ORDER BY p.name").bind(a.id).all()).results||[];for(const p of rows){p.id=String(p.id);p.role=p.role==='admin'&&(!p.commissioner||p.commissioner.toLowerCase()===p.playerName.toLowerCase())?'admin':'player';delete p.commissioner;p.allGames=await poolGameKeys(db,p.id);p.leftGames=(await db.prepare('SELECT game FROM links_left_games WHERE pool_id=? AND player_name=?').bind(p.id,p.playerName).all()).results.map(x=>x.game);p.games=p.allGames.filter(g=>!p.leftGames.includes(g))}return rows}
async function connectionChoices(db,a,current=null){
 await ensureAccounts(db);
 await db.prepare('CREATE TABLE IF NOT EXISTS links_player_memberships(pool_id INTEGER NOT NULL,player_name TEXT NOT NULL,email TEXT NOT NULL,PRIMARY KEY(pool_id,player_name))').run();
 const email=emailKey(a.email),existing=await availablePools(db,a),choices=new Map(existing.map(p=>[p.id,{...p,connected:true}]));
 const rows=(await db.prepare("SELECT p.id,p.name,m.player_name AS playerName,'player' AS role FROM links_player_memberships m JOIN pools p ON p.id=m.pool_id JOIN pool_players u ON u.pool_id=m.pool_id AND u.name=m.player_name WHERE lower(m.email)=? UNION ALL SELECT p.id,p.name,s.value AS playerName,'admin' AS role FROM links_pool_owners o JOIN pools p ON p.id=o.pool_id JOIN pool_settings s ON s.pool_id=p.id AND s.key='commissioner_player_name' JOIN pool_players u ON u.pool_id=p.id AND u.name=s.value WHERE lower(o.email)=?").bind(email,email).all()).results||[];
 if(current){const pool=await db.prepare('SELECT name FROM pools WHERE id=?').bind(current.poolId).first();if(pool)rows.push({id:current.poolId,name:pool.name,playerName:current.playerName,role:current.role})}
 for(const p of rows){p.id=String(p.id);if(choices.get(p.id)?.connected)continue;
 const access=await db.prepare('SELECT status FROM newbuild_player_access WHERE pool_id=? AND player_name=?').bind(p.id,p.playerName).first();if(access?.status==='pending')continue;
 const linked=await db.prepare('SELECT account_id FROM links_id_members WHERE pool_id=? AND player_name=?').bind(p.id,p.playerName).first();if(linked&&linked.account_id!==a.id)continue;
 if(!choices.has(p.id)||p.role==='admin')choices.set(p.id,{...p,connected:false});
 }
 return [...choices.values()];
}
async function revoke(db,id,sessionHash=null){const where=sessionHash?'session_hash=?':'account_id=?',arg=sessionHash||id;await db.batch([db.prepare('DELETE FROM pool_sessions WHERE token IN (SELECT token FROM links_id_bridges WHERE '+where+')').bind(arg),db.prepare('DELETE FROM links_id_bridges WHERE '+where).bind(arg),db.prepare('DELETE FROM links_id_sessions WHERE '+(sessionHash?'token_hash=?':'account_id=?')).bind(arg)])}
async function challenge(db,payload,env,request){const id=random(),nums=new Uint32Array(1);crypto.getRandomValues(nums);const code=String(nums[0]%1000000).padStart(6,'0');await db.prepare('INSERT INTO links_id_challenges(id,code_hash,payload,expires_at) VALUES(?,?,?,?)').bind(id,await hash(id+':'+code),JSON.stringify(payload),Date.now()+600000).run();if(identityTestHost(new URL(request.url).hostname))return reply({challenge:id,testCode:code,message:'Test email preview'});const sent=await sendPoolEmail(env,payload.email,{subject:'Your LINKS verification code',text:'Your LINKS code is '+code+'. It expires in 10 minutes. If you did not request this, ignore this email.',html:'<h1>Your LINKS code</h1><p style="font-size:30px">'+code+'</p><p>Expires in 10 minutes. If you did not request this, ignore this email.</p>'},'identity-'+id);if(!sent.sent){await db.prepare('DELETE FROM links_id_challenges WHERE id=?').bind(id).run();fail('We could not send your code. Please try again shortly.',503)}return reply({challenge:id,message:'Check your email for a six-digit code.'})}
async function consume(db,b){const c=await db.prepare('UPDATE links_id_challenges SET attempts=attempts+1 WHERE id=? AND expires_at>? AND attempts<5 RETURNING *').bind(String(b.challenge||''),Date.now()).first();if(!c||!equal(c.code_hash,await hash(String(b.challenge)+':'+String(b.code||''))))fail('That code is incorrect or expired. Request a new code.');const consumed=await db.prepare('DELETE FROM links_id_challenges WHERE id=? RETURNING id').bind(c.id).first();if(!consumed)fail('That code was already used.');return JSON.parse(c.payload)}
async function finishRegistration(db,p){const statements=[db.prepare('INSERT INTO links_id_accounts VALUES(?,?,?,?,?,?,?)').bind(p.id,p.username,p.email,p.display_name,p.salt,p.password_hash,new Date().toISOString())];if(p.member){const member=await db.prepare('SELECT u.* FROM pool_players u LEFT JOIN newbuild_player_access x ON x.pool_id=u.pool_id AND x.player_name=u.name WHERE u.pool_id=? AND u.name=? AND COALESCE(x.status,\'active\')=\'active\'').bind(p.member.poolId,p.member.playerName).first();if(!member||await hash(member.salt+':'+member.password_hash)!==p.member.credential)fail('Pool membership changed. Sign in to your pool again.');statements.push(linkStatement(db,p.id,p.member))}await db.batch(statements);}
export async function identityRequest({request,env}){
 const db=env.DB;if(!db)return reply({error:'Account service unavailable.'},503);
 try{
 if(!identityTestHost(new URL(request.url).hostname)&&await loginPhase(db)==='off')return reply({error:'Not available.'},404);
 await ensureIdentity(db);
 if(!['GET','POST'].includes(request.method))return reply({error:'Method not allowed.'},405);
 if(request.method==='POST'&&request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Invalid origin.'},403);
 const a=await identitySession(request,db);
 if(request.method==='GET'){if(!a)return reply({error:'Please sign in.'},401);const pools=await availablePools(db,a);const bearer=(request.headers.get('authorization')||'').replace(/^Bearer /,'');const current=await db.prepare('SELECT pool_id,player_name FROM pool_sessions WHERE token=? AND expires_at>?').bind(bearer,new Date().toISOString()).first();const currentPool=pools.find(p=>p.id===String(current?.pool_id)&&p.playerName===current?.player_name)?.id||pools[0]?.id||'';return reply({account:publicAccount(a),pools,currentPool,verified:true,commissioner:pools.some(p=>p.role==='admin')})}
 const text=await request.text();if(text.length>8192)fail('Request too large.');const b=JSON.parse(text),action=String(b.action||'');
 if(['login','register','confirm','recover','reset','resend','connect','connection-choices','connect-selected','profile'].includes(action))await rate(request,db,action);
 if(action==='login'){const who=String(b.login||'').trim().toLowerCase().slice(0,254);const found=await db.prepare('SELECT * FROM links_id_accounts WHERE username=? OR email=?').bind(who,who).first();const digest=await passwordHash(String(b.password||'').slice(0,256),found?.salt||'links-dummy-salt');if(!found||!equal(digest,found.password_hash))fail('Username/email or password is incorrect.',401);return issue(db,found,b.remember!==false)}
 if(action==='membership-status'){const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');const m=await db.prepare('SELECT m.account_id FROM pool_sessions s LEFT JOIN links_id_members m ON m.pool_id=s.pool_id AND m.player_name=s.player_name WHERE s.token=? AND s.expires_at>?').bind(token,new Date().toISOString()).first();if(!m)fail('Use your current pool login first.',401);return reply({connected:!!m.account_id,sameAccount:!!a&&m.account_id===a.id})}
 if(action==='register'){
 const username=String(b.username||'').trim().toLowerCase(),email=String(b.email||'').trim().toLowerCase(),display=String(b.displayName||'').trim(),password=String(b.password||'');
 if(!/^[a-z0-9][a-z0-9_.-]{2,29}$/.test(username))fail('Use 3–30 letters, numbers, dots, dashes or underscores for your username.');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)fail('Enter a valid email.');if(display.length<2||display.length>60||/[\x00-\x1f]/.test(display))fail('Use a display name of 2–60 characters.');if(password.length<10||password.length>256)fail('Use a password of 10–256 characters.');
 const member=b.connect?await proof(request,db,b.poolPassword):null;
 if(member&&await db.prepare('SELECT id FROM links_id_members WHERE pool_id=? AND player_name=?').bind(member.poolId,member.playerName).first())fail('This player already has a LINKS account. Sign in or use Forgot password.',409);
 if(await db.prepare('SELECT id FROM links_id_accounts WHERE username=? OR email=?').bind(username,email).first())fail('Already have a LINKS account? Sign in with your existing username and password, then choose which pools to connect. Each pool keeps its players, picks and your role. If only the username is taken, choose another username.',409);
 const salt=random();return challenge(db,{type:'register',id:crypto.randomUUID(),username,email,display_name:display,salt,password_hash:await passwordHash(password,salt),member,remember:b.remember!==false},env,request);
 }
 if(action==='confirm'){const p=await consume(db,b);if(p.type!=='register')fail('Request a new account code.');await finishRegistration(db,p);return issue(db,p,p.remember)}
 if(action==='resend'){
 const row=await db.prepare('SELECT * FROM links_id_challenges WHERE id=? AND expires_at>?').bind(String(b.challenge||''),Date.now()-86400000).first();
 if(!row)fail('Start setup or password recovery again to request a new code.');
 if(row.expires_at>Date.now()+540000)fail('Please wait one minute before requesting another code.',429);
 const p=JSON.parse(row.payload);if(!['register','reset','reset-registration'].includes(p.type))fail('Request a new code.');
 const result=await challenge(db,p,env,request);await db.prepare('DELETE FROM links_id_challenges WHERE id=?').bind(row.id).run();return result;
 }
 if(action==='recover'){
 const email=String(b.email||'').trim().toLowerCase(),found=await db.prepare('SELECT id,email FROM links_id_accounts WHERE email=?').bind(email).first();
 if(found)return challenge(db,{type:'reset',accountId:found.id,email:found.email},env,request);
 const pending=await db.prepare("SELECT payload FROM links_id_challenges WHERE json_extract(payload,'$.type')='register' AND json_extract(payload,'$.email')=? AND expires_at>? ORDER BY expires_at DESC LIMIT 1").bind(email,Date.now()-86400000).first();
 if(pending){const p=JSON.parse(pending.payload);return challenge(db,{...p,type:'reset-registration'},env,request)}
 return reply({challenge:random(),message:'If an account or recent setup matches, check your email for a recovery code.'});
 }
 if(action==='reset'){
 const password=String(b.password||'');if(password.length<10||password.length>256)fail('Use a password of 10–256 characters.');const p=await consume(db,b);if(!['reset','reset-registration'].includes(p.type))fail('Request a recovery code.');const salt=random(),digest=await passwordHash(password,salt);
 if(p.type==='reset-registration'){await finishRegistration(db,{...p,salt,password_hash:digest});await db.prepare("DELETE FROM links_id_challenges WHERE json_extract(payload,'$.email')=?").bind(p.email).run()}
 else{await db.prepare('UPDATE links_id_accounts SET salt=?,password_hash=? WHERE id=?').bind(salt,digest,p.accountId).run();await revoke(db,p.accountId)}
 return reply({ok:true});
 }
 if(!a)return reply({error:'Please sign in.'},401);
 if(action==='logout'){await revoke(db,a.id,a.token_hash);return reply({ok:true},200,{'Set-Cookie':cookieName+'=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'})}
 if(['connection-choices','connect-selected'].includes(action)){
 const current=b.poolPassword?await proof(request,db,b.poolPassword):null,choices=await connectionChoices(db,a,current);
 if(action==='connection-choices')return reply({pools:choices});
 if(!Array.isArray(b.pools)||b.pools.length>100||b.pools.some(x=>typeof x!=='string'))fail('Choose the pools to connect.');
 const selected=[...new Set(b.pools)].map(id=>{const p=choices.find(p=>p.id===id);if(!p)fail('Pool access changed. Refresh the list and try again.',403);return p});
 const statements=selected.filter(p=>!p.connected).map(p=>linkStatement(db,a.id,{poolId:Number(p.id),playerName:p.playerName,role:p.role}));if(statements.length)await db.batch(statements);
 return reply({ok:true,connected:selected.length});
 }
 if(action==='connect'){const p=await proof(request,db,b.poolPassword);const existing=await db.prepare('SELECT account_id FROM links_id_members WHERE pool_id=? AND player_name=?').bind(p.poolId,p.playerName).first();if(existing?.account_id===a.id)return reply({ok:true});if(existing)fail('This player is connected to another LINKS account.',409);await linkStatement(db,a.id,p).run();return reply({ok:true})}
 if(action==='profile'){if(!equal(await passwordHash(String(b.currentPassword||'').slice(0,256),a.salt),a.password_hash))fail('Current LINKS password does not match.',403);const username=String(b.username||a.username).trim().toLowerCase(),display=String(b.displayName||a.display_name).trim();if(!/^[a-z0-9][a-z0-9_.-]{2,29}$/.test(username)||display.length<2||display.length>60||/[\x00-\x1f]/.test(display))fail('Check your username and display name.');const statements=[db.prepare('UPDATE links_id_accounts SET username=?,display_name=? WHERE id=?').bind(username,display,a.id)];const memberships=await availablePools(db,a);for(const m of memberships){const duplicate=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?) AND name<>?').bind(m.id,display,m.playerName).first();if(duplicate)fail('That player name is already used in one of your pools.',409);statements.push(db.prepare('INSERT INTO pool_display_names(pool_id,player_name,display_name) VALUES(?,?,?) ON CONFLICT(pool_id,player_name) DO UPDATE SET display_name=excluded.display_name').bind(m.id,m.playerName,display))}let changed=false;if(b.newPassword){const password=String(b.newPassword);if(password.length<10||password.length>256)fail('Use a password of 10–256 characters.');const salt=random();statements.push(db.prepare('UPDATE links_id_accounts SET salt=?,password_hash=? WHERE id=?').bind(salt,await passwordHash(password,salt),a.id));changed=true}await db.batch(statements);if(changed){await revoke(db,a.id);return issue(db,{...a,username,display_name:display})}return reply({account:{...publicAccount(a),username,displayName:display}})}
 const pools=await availablePools(db,a),p=pools.find(x=>x.id===String(b.pool));if(!p)fail('You do not have access to this pool.',403);
 if(action==='open'){const token=random(),expires=new Date(a.expires_at).toISOString();await db.batch([db.prepare('INSERT INTO pool_sessions VALUES(?,?,?,?,?)').bind(token,Number(p.id),p.playerName,p.role,expires),db.prepare('INSERT INTO links_id_bridges VALUES(?,?,?)').bind(token,a.token_hash,a.id)]);return reply({token,playerId:p.playerName,gameKeys:p.games,pool:{...p,role:p.role==='admin'?'commissioner':'player'}})}
 if(action==='leave'){if(p.role==='admin')fail('Commissioners cannot leave a pool they manage.',409);await db.batch([db.prepare('DELETE FROM links_id_members WHERE id=? AND account_id=?').bind(p.membershipId,a.id),db.prepare('DELETE FROM pool_sessions WHERE pool_id=? AND player_name=?').bind(p.id,p.playerName)]);return reply({ok:true,leftPool:p.id,current:false})}
 if(['leave-game','rejoin-game'].includes(action)){if(!p.allGames.includes(b.game))fail('Game unavailable.',403);await db.prepare(action==='leave-game'?'INSERT OR IGNORE INTO links_left_games VALUES(?,?,?)':'DELETE FROM links_left_games WHERE pool_id=? AND player_name=? AND game=?').bind(p.id,p.playerName,b.game).run();return reply({ok:true})}
 return reply({error:'Unknown action.'},400);
 }catch(e){if(e.status)return reply({error:e.message},e.status);if(/UNIQUE constraint/i.test(String(e)))return reply({error:'That account name, email, or pool membership is already connected. No changes were saved.'},409);console.error('identity request failed',e.message);return reply({error:'Account service is temporarily unavailable. Please try again.'},500)}
}
export async function identitySwitcher(context){if(!(context.request.headers.get('cookie')||'').includes(cookieName+'='))return null;if(!identityTestHost(new URL(context.request.url).hostname)&&await loginPhase(context.env.DB)==='off')return null;return identityRequest(context)}

export {rate as identityRate,challenge as identityChallenge,consume as consumeIdentityChallenge};

export {issue as issueIdentitySession};
