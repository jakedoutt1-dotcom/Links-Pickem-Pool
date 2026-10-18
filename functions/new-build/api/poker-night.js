import {requirePartyPass} from '../../lib/party-access.js';
import {savePartyRoom} from '../../lib/party-scoreboard.js';
import {ensureVenue} from '../../lib/venue-scoreboard.js';
import {createTournament,joinTournament,advanceTournament,startTournament,betTournament,rebuyTournament,showTournamentHand,pauseTournament,resumeTournament,tournamentView,playerName} from '../../lib/poker-tournament.js';

const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const token=()=>crypto.randomUUID()+crypto.randomUUID();
const credential=value=>typeof value==='string'&&/^[a-f0-9-]{72}$/.test(value)?value:'';
const permission=()=>json({error:'Only this game’s host can use that control.'},403);
const gameErrors=new Set(['INVALID_ACTION','INVALID_SETTINGS','INVALID_NAME','STALE_HAND','STALE_TURN','INVALID_CHIPS','INVALID_BLINDS','INVALID_TIMER','TABLE_FULL','INVALID_PLAYER','INVALID_SEAT','HAND_RUNNING','NEED_PLAYERS','NO_ACTIVE_HAND','NOT_YOUR_TURN','TURN_EXPIRED','CANNOT_CHECK','CANNOT_CALL','CANNOT_RAISE','INVALID_RAISE','MIN_RAISE','CANNOT_SHOW_HAND']);
async function initialize(db){
 await db.batch([
  db.prepare('CREATE TABLE IF NOT EXISTS links_poker_night_rooms(code TEXT PRIMARY KEY,state TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 0,expires INTEGER NOT NULL)'),
  db.prepare('CREATE TABLE IF NOT EXISTS links_poker_night_limits(id TEXT PRIMARY KEY,starts INTEGER NOT NULL,hits INTEGER NOT NULL)'),
  db.prepare('CREATE TABLE IF NOT EXISTS links_poker_night_receipts(id TEXT PRIMARY KEY,response TEXT NOT NULL,expires INTEGER NOT NULL)')
 ]);
}
async function rate(db,id,action,now){
 const window=action==='create'?3600000:60000,limit=action==='create'?10:action==='join'?250:500;
 await db.prepare('INSERT INTO links_poker_night_limits(id,starts,hits) VALUES(?,?,1) ON CONFLICT(id) DO UPDATE SET hits=CASE WHEN starts<? THEN 1 ELSE hits+1 END,starts=CASE WHEN starts<? THEN excluded.starts ELSE starts END').bind(id,now,now-window,now-window).run();
 return (await db.prepare('SELECT hits FROM links_poker_night_limits WHERE id=?').bind(id).first()).hits<=limit;
}
export async function onRequest({request,env}){
 try{
  const url=new URL(request.url),now=Date.now(),db=env.DB;
  if(!db)return json({error:'Poker Night is temporarily unavailable.'},503);
  if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
  if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)return json({error:'Open Poker Night on LINKS before continuing.'},403);
  let body={};
  if(request.method==='POST'){
   if(Number(request.headers.get('Content-Length'))>8000)return json({error:'Request too large.'},413);
   const raw=await request.text();if(raw.length>8000)return json({error:'Request too large.'},413);
   try{body=JSON.parse(raw);}catch{return json({error:'Invalid request.'},400);}
   if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Invalid request.'},400);
  }
  const action=request.method==='GET'?'state':body.action;
  if(!['state','create','join','start','bet','rebuy','show','feature','pause','resume','close','next','sitout'].includes(action))return json({error:'Unknown action.'},400);
  if(action!=='state'&&!/^[a-zA-Z0-9_-]{16,80}$/.test(String(body.requestId||'')))return json({error:'This action needs a fresh request. Please try again.'},400);
  await initialize(db);
  const ip=request.headers.get('CF-Connecting-IP')||'local',receiptId=action==='create'||action==='join'?await hash(ip+':'+action+':'+body.requestId):'';
  if(receiptId){
   const receipt=await db.prepare('SELECT response FROM links_poker_night_receipts WHERE id=? AND expires>?').bind(receiptId,now).first();
   if(receipt)return json(JSON.parse(receipt.response));
  }
  if(action!=='state'&&!await rate(db,await hash(ip+':'+(action==='create'?'create':action==='join'?'join':'action')),action,now))return json({error:'Please wait a minute before trying again.'},429);
  if(action==='create'){
   const gate=await requirePartyPass(request,env);if(gate)return gate;
   const name=playerName(body.name),playerToken=token(),hostToken=token(),playerId=crypto.randomUUID();
   const code=crypto.randomUUID().replace(/-/g,'').slice(0,10).toUpperCase(),seat=await hash(playerToken);
   const state=createTournament({code,mode:body.mode,ownerSeat:seat,hostHash:await hash(hostToken),displayKey:token(),player:{id:playerId,name},settings:body.settings,hostOnly:body.hostOnly===true},now);
   const result={ok:true,room:tournamentView(state,seat,{host:true},now),session:{playerId,playerToken,hostToken}};
   // A repeated create request retrieves its original credentials, never a second room.
   const statements=[db.prepare('INSERT INTO links_poker_night_rooms(code,state,expires) VALUES(?,?,?)').bind(code,JSON.stringify(state),state.expiresAt),db.prepare('INSERT INTO links_poker_night_receipts(id,response,expires) VALUES(?,?,?)').bind(receiptId,JSON.stringify(result),state.expiresAt),db.prepare('DELETE FROM links_poker_night_rooms WHERE expires<=?').bind(now),db.prepare('DELETE FROM links_poker_night_receipts WHERE expires<=?').bind(now),db.prepare('DELETE FROM links_poker_night_limits WHERE starts<?').bind(now-7200000)];
   try{await db.batch(statements);}catch(error){const repeated=await db.prepare('SELECT response FROM links_poker_night_receipts WHERE id=? AND expires>?').bind(receiptId,now).first();if(repeated)return json(JSON.parse(repeated.response));throw error;}
   return json(result);
  }
  const code=String(body.code||url.searchParams.get('code')||'').trim().toUpperCase();
  if(!/^[A-F0-9]{10}$/.test(code))return json({error:'Enter the 10-character room code.'},400);
  const playerToken=credential(request.headers.get('x-poker-token')||body.playerToken),hostToken=credential(request.headers.get('x-poker-host')||body.hostToken),displayKey=credential(request.headers.get('x-poker-display'));
  const seat=playerToken?await hash(playerToken):'',hostHash=hostToken?await hash(hostToken):'';
  const issued=action==='join'?{playerId:crypto.randomUUID(),playerToken:token()}:null,joinSeat=issued?await hash(issued.playerToken):'';
  for(let attempt=0;attempt<6;attempt++){
   const row=await db.prepare('SELECT * FROM links_poker_night_rooms WHERE code=? AND expires>?').bind(code,Date.now()).first();
   if(!row)return json({error:'This room has expired or was not found.'},404);
   const s=JSON.parse(row.state),time=Date.now(),host=!!hostHash&&hostHash===s.hostHash,display=!!displayKey&&displayKey===s.displayKey;
   if(action!=='join'&&!s.players[seat]&&!host&&!display)return json({error:'Join this room on your phone first.'},401);
   if(display&&action!=='state')return json({error:'The TV display is read only.'},403);
   if(url.searchParams.get('tv')==='1'&&!display&&!host)return json({error:'Use the TV link from the host’s dashboard.'},403);
   const before=JSON.stringify(s),previousNextHandAt=s.nextHandAt;advanceTournament(s,time);let current=seat,session;
   const key=action!=='state'?`${seat||joinSeat}:${body.requestId}`:'';
   const already=key&&s.processed[key];
   if(action==='join'){
    if(s.players[seat])session={playerId:s.players[seat].id,playerToken};
    else{
     const prior=s.joinReceipts?.[receiptId];
     if(prior){current=await hash(prior.playerToken);session=prior;}
     else{joinTournament(s,joinSeat,{id:issued.playerId,name:body.name},time);current=joinSeat;session=issued;s.joinReceipts||={};s.joinReceipts[receiptId]=issued;}
    }
   }else if(!already&&action!=='state'){
    const onlyHost=['start','feature','pause','resume','close','next'].includes(action);if(onlyHost&&!host)return permission();
    if((s.status==='closed'||(s.status==='finished'&&action!=='show'))&&action!=='close')return json({error:'This game has ended. Create a new room to play again.'},409);
    if(action==='start')startTournament(s,time);
    else if(action==='bet')betTournament(s,seat,body,time);
    else if(action==='rebuy')rebuyTournament(s,seat,time);
    else if(action==='show')showTournamentHand(s,seat,body);
    else if(action==='pause')pauseTournament(s,time);
    else if(action==='resume')resumeTournament(s,time);
    else if(action==='feature'){
     if(!s.tables.some(table=>table.id===body.tableId))return json({error:'Choose a current table.'},400);s.featuredTableId=body.tableId;
    }else if(action==='sitout'){
     if(!s.players[seat]||typeof body.away!=='boolean')return json({error:'Choose whether to sit out.'},400);s.players[seat].away=body.away;
    }else if(action==='next'){
     if(!previousNextHandAt||time<previousNextHandAt)return json({error:'Wait for every table and the between-hand countdown.'},409);
    }else if(action==='close'){s.status='closed';s.phase='closed';s.closedAt=time;}
   }
   if(key){s.processed[key]=time;const entries=Object.entries(s.processed);if(entries.length>2048)s.processed=Object.fromEntries(entries.slice(-2048));}
   if(JSON.stringify(s)!==before){const result=await savePartyRoom(db,'poker-night',code,row.version,s,null);if(!result.meta?.changes)continue;}
   let venue=null;
   try{await ensureVenue(db);venue=await db.prepare("SELECT p.name,p.logo FROM links_venue_rooms v JOIN links_partners p ON p.id=v.partner WHERE v.game='poker-night' AND v.room=? AND p.active=1").bind(code).first();}catch{}
   const result={ok:true,room:tournamentView(s,current,{host,tv:display||url.searchParams.get('tv')==='1',venue},time),...(session?{session}:{})};
   if(receiptId)await db.prepare('INSERT OR IGNORE INTO links_poker_night_receipts(id,response,expires) VALUES(?,?,?)').bind(receiptId,JSON.stringify(result),s.expiresAt).run();
   return json(result);
  }
  return json({error:'Another action just arrived. Refresh and try again.'},409);
 }catch(error){
  if(gameErrors.has(error?.code))return json({error:error.message,code:error.code},409);
  return json({error:'Unable to complete that request. Please try again.'},503);
 }
}
