import {onRequest as avatarRequest} from '../functions/new-build/api/poker-avatar.js';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createRequire} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
import {onRequest} from '../functions/new-build/api/poker-night.js';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
class DB {
 constructor(){this.raw=new DatabaseSync(':memory:');this.queue=Promise.resolve();}
 prepare(sql){let args=[];const db=this.raw;return {bind(...values){args=values;return this;},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){const result=db.prepare(sql).run(...args.map(value=>value instanceof ArrayBuffer?new Uint8Array(value):value));return {meta:{changes:Number(result.changes)}};}};}
 batch(stmts){const job=this.queue.then(async()=>{this.raw.exec('BEGIN');try{const results=[];for(const stmt of stmts)results.push(await stmt.run());this.raw.exec('COMMIT');return results;}catch(error){this.raw.exec('ROLLBACK');throw error;}});this.queue=job.catch(()=>{});return job;}
}
const db=new DB(),root=path.resolve(fileURLToPath(new URL('../public/',import.meta.url))),out='output/poker-night-review',errors=[],missing=[];
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://'+req.headers.host);
  if(url.pathname==='/new-build/api/poker-night'){
   const chunks=[];for await(const chunk of req)chunks.push(chunk);
   const response=await onRequest({request:new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})}),env:{DB:db}});
   res.writeHead(response.status,Object.fromEntries(response.headers));return res.end(Buffer.from(await response.arrayBuffer()));
  }
  if(url.pathname==='/new-build/api/poker-avatar'){const response=await avatarRequest({request:new Request(url),env:{DB:db}});res.writeHead(response.status,Object.fromEntries(response.headers));return res.end(Buffer.from(await response.arrayBuffer()))}
  if(url.pathname.includes('/api/')){res.writeHead(401,{'Content-Type':'application/json'});return res.end('{"error":"Local browser check has no account or venue."}');}
  const filename=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!filename.startsWith(root+path.sep))throw Error('Not found');
  const body=await readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream'});res.end(body);
 }catch(error){missing.push(req.url);res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true});
async function context(width,height=900){const c=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});await c.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());const page=await c.newPage();page.on('pageerror',e=>errors.push(e.message));return page;}
async function api(body,session={},query={}){
 const response=await fetch(origin+'/new-build/api/poker-night'+(!body?'?'+new URLSearchParams(query):''),{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json','x-poker-token':session.playerToken||'','x-poker-host':session.hostToken||''},...(body?{body:JSON.stringify({requestId:crypto.randomUUID(),...body})}:{})});
 const value=await response.json();assert.equal(response.status,200,JSON.stringify(value));return value;
}
async function fits(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No horizontal scrolling at '+(await page.viewportSize()).width);}
try{
 await mkdir(out,{recursive:true});
 const host=await context(390,844),guest=await context(360,800);
 await host.goto(origin+'/new-build/poker-night.html');await host.locator('#showSetup').waitFor();await fits(host);
 await host.screenshot({path:out+'/welcome-phone.png',fullPage:true});
 await host.locator('#pokerProfileButton').click();await host.locator('#rulesButton').click();assert.equal(await host.locator('#rulesDialog').evaluate(d=>d.open),true);
 await host.locator('#rulesToRanks').click();assert.equal(await host.locator('#rankList li').count(),10);
 await host.locator('#ranksDialog [data-close]').click();
 await host.locator('#showSetup').click();await host.locator('#hostName').fill('Alex');await host.locator('#mode').selectOption('tournament');await host.locator('#turnSeconds').selectOption('60');
 await host.locator('#createForm button[type=submit]').click();await host.waitForFunction(()=>!document.getElementById('lobby').hidden);
 const code=await host.locator('#lobbyCode').textContent();assert.match(code,/^[A-F0-9]{10}$/);
 assert.equal(await host.locator('#lobbyInvite #inviteButton').count(),1,'Invite sits with the lobby QR code');
 assert.equal(await host.evaluate(()=>document.getElementById('inviteButton').getBoundingClientRect().top>=document.getElementById('lobbyQr').getBoundingClientRect().bottom),true,'Share button is below the QR code on phones');
 const hostSession=await host.evaluate(code=>JSON.parse(localStorage.getItem('links-poker-session-'+code)),code);
 // Share options prepare a public player invite, never the private TV/host link.
 await host.evaluate(()=>{
  Object.defineProperty(navigator,'userAgent',{configurable:true,value:'iPhone'});
  Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.sharedInvite=data;}});
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedInvite=text;}}});
 });
 await host.locator('#inviteButton').click();assert.equal(await host.locator('#textInvite').isVisible(),true);
 const sms=await host.locator('#textInvite').getAttribute('href');assert.ok(sms.startsWith('sms:&body='));
 assert.ok(decodeURIComponent(sms).includes('Room '+code));assert.ok(decodeURIComponent(sms).includes('?room='+code));
 const email=new URL(await host.locator('#emailInvite').getAttribute('href'));assert.ok(email.searchParams.get('body').includes('?room='+code));
 await host.locator('#copyInvite').click();const copied=await host.evaluate(()=>window.copiedInvite);
 assert.equal(copied,origin+'/new-build/poker-night.html?room='+code);assert.equal(new URL(copied).hash,'');
 await host.locator('#shareInvite').click();assert.equal(await host.evaluate(()=>window.sharedInvite.url),copied);
 await host.locator('#inviteDialog [data-close]').click();
 await host.setViewportSize({width:1280,height:720});
 await host.evaluate(()=>{Object.defineProperty(navigator,'userAgent',{configurable:true,value:'Desktop'});Object.defineProperty(navigator,'share',{configurable:true,value:undefined});});
 await host.locator('#inviteButton').click();assert.equal(await host.locator('#textInvite').isVisible(),false);assert.equal(await host.locator('#shareInvite').isVisible(),false);
 assert.equal(await host.evaluate(()=>document.getElementById('inviteButton').getBoundingClientRect().top>=document.getElementById('lobbyQr').getBoundingClientRect().bottom),true,'Share button stays below the QR code on desktop');
 assert.equal(await host.locator('#copyInvite').isVisible(),true);assert.equal(await host.locator('#emailInvite').isVisible(),true);await fits(host);
 await host.locator('#inviteDialog [data-close]').click();await host.setViewportSize({width:390,height:844});
 await guest.goto(origin+'/new-build/poker-night.html?room='+code);await guest.locator('#joinName').fill('Jordan');await guest.locator('#joinForm button[type=submit]').click();await guest.waitForFunction(()=>!document.getElementById('lobby').hidden);
 const guestSession=await guest.evaluate(code=>JSON.parse(localStorage.getItem('links-poker-session-'+code)),code),sessions=[hostSession,guestSession];
 for(let i=3;i<=18;i++)sessions.push((await api({action:'join',code,name:'Player '+i})).session);
 await host.locator('#startButton').click();await host.waitForFunction(()=>!document.getElementById('gameArea').hidden);await guest.waitForFunction(()=>document.querySelectorAll('#privateCards .card:not(.back)').length===2);
 assert.equal(await host.locator('#privateCards .card:not(.back)').count(),2);assert.equal(await host.locator('#seats .seat').count(),9);assert.equal(await host.locator('#seats .avatar-character').count(),9);assert.match(await host.locator('#pokerTable').evaluate(el=>getComputedStyle(el).backgroundImage),/poker-luxe-table-portrait/);assert.equal(await host.locator('#pokerTable .center-table .table-logo').count(),1);
 // Private table chat: unread badge, plain-text rendering and working send form.
 const chatRoom=(await api(null,hostSession,{code})).room;
 const chatter=sessions.find(s=>s.playerId!==hostSession.playerId&&chatRoom.table.players.some(p=>p.id===s.playerId));
 await api({action:'chat',code,text:'Nice hand! <img src=x onerror=alert(1)>'},chatter);
 await host.locator('.chat-unread').filter({hasText:'1 new'}).waitFor();
 await host.locator('.poker-chat summary').click();await host.locator('.chat-messages').getByText('Nice hand! <img src=x onerror=alert(1)>',{exact:true}).waitFor();
 assert.equal(await host.locator('.message-reactions button[data-message-reaction]').count(),0,'Unused emoji are not shown on every comment');await host.locator('.add-reaction').first().click();await host.locator('#pokerReactionPicker [data-message-reaction="👍"]').click();await host.locator('.message-reactions button[data-message-reaction="👍"][aria-pressed=true]').waitFor();assert.match(await host.locator('.message-reactions button[data-message-reaction="👍"]').first().textContent(),/1/);assert.equal(await host.locator('.chat-messages img').count(),0);assert.equal(await host.locator('.chat-unread').textContent(),'');
 await host.locator('.poker-chat input').fill('Good luck, table!');await host.locator('.poker-chat button[type=submit]').click();await host.locator('.chat-messages').getByText('Good luck, table!',{exact:true}).waitFor();await fits(host);
 await host.setViewportSize({width:1280,height:720});await fits(host);await host.setViewportSize({width:390,height:844});
 await host.locator('#pokerProfileButton').click();const avatarData=await host.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=80;const x=c.getContext('2d');x.fillStyle='#eac66e';x.fillRect(0,0,80,80);return c.toDataURL('image/jpeg')});await host.locator('#pokerAvatarFile').setInputFiles({name:'avatar.jpg',mimeType:'image/jpeg',buffer:Buffer.from(avatarData.split(',')[1],'base64')});await host.locator('.profile-status').filter({hasText:'Profile picture saved.'}).waitFor();await host.locator('#pokerProfile .profile-close').click();await host.locator('.seat-avatar[src*=poker-avatar]').first().evaluate(el=>el.decode());assert.equal(await host.locator('#privateCards').isVisible(),false,'Duplicate mobile hand tile is hidden');
 const initialHand=(await api(null,hostSession,{code})).room.table.yourHandName;
 assert.equal(await host.locator('#myHandName').textContent(),'Your hand: '+initialHand);
 await host.evaluate(()=>{const toast=document.getElementById('winnerToast');toast.hidden=false;toast.textContent='Alex wins this hand! · Two pair'});assert.equal(await host.locator('#winnerToast').evaluate(el=>el.getBoundingClientRect().top>=document.getElementById('pokerTable').getBoundingClientRect().bottom),true,'Winner banner is below the cards');await fits(host);await fits(guest);
 await host.locator('#pokerProfileButton').click();await host.locator('#hideCardsButton').click();assert.equal(await host.locator('#privateCards .back').count(),2);assert.equal(await host.locator('#seats .card:not(.back)').count(),0);
 assert.equal(await host.locator('#myHandName').isVisible(),false,'Hide cards also conceals private hand strength');
 await host.locator('#pokerProfileButton').click();await host.locator('#hideCardsButton').click();assert.equal(await host.locator('#privateCards .card:not(.back)').count(),2);
 const beforeCards=await host.locator('#privateCards').textContent();await host.reload();await host.waitForFunction(()=>document.querySelectorAll('#privateCards .card:not(.back)').length===2);assert.equal(await host.locator('#privateCards').textContent(),beforeCards,'Refresh restores exact seat and private cards');
 // A waiting phone queues one call, privately, then sends it only on its turn.
 const queuedTable=(await api(null,hostSession,{code})).room.table,actor=queuedTable.players.find(p=>p.id===queuedTable.actorId);
 const ordered=queuedTable.players.slice().sort((a,b)=>a.seat-b.seat),next=ordered[(ordered.findIndex(p=>p.id===actor.id)+1)%ordered.length];
 const queuedSession=sessions.find(s=>s.playerId===next.id),queued=await context(1280,720),sent=[];
 await queued.addInitScript(({code,session})=>localStorage.setItem('links-poker-session-'+code,JSON.stringify(session)),{code,session:queuedSession});
 queued.on('request',request=>{if(request.url().includes('/api/poker-night')&&request.method()==='POST')sent.push(request.postDataJSON());});
 await queued.goto(origin+'/new-build/poker-night.html?room='+code);await queued.locator('#preselectControls').waitFor({state:'visible'});
 await queued.locator('#preFold').click();assert.equal(await queued.locator('#preFold').getAttribute('aria-pressed'),'true');
 await queued.locator('#cancelPreselection').click();assert.equal(await queued.locator('#preFold').getAttribute('aria-pressed'),'false');
 await queued.locator('#preCall').click();assert.equal(await queued.locator('#preCall').getAttribute('aria-pressed'),'true');
 assert.equal(sent.filter(p=>p.action==='bet').length,0,'Preselection is private and does not bet early');
 await queued.screenshot({path:out+'/preselect-desktop.png'});
 const actorSession=sessions.find(s=>s.playerId===actor.id),actorTable=(await api(null,actorSession,{code})).room.table;
 await api({action:'bet',code,tableId:actorTable.id,handNumber:actorTable.handNumber,turnId:actorTable.turnId,move:actorTable.legalActions.canCheck?'check':'call'},actorSession);
 await queued.waitForFunction(()=>document.getElementById('preCall').getAttribute('aria-pressed')==='false');
 assert.equal(sent.filter(p=>p.action==='bet').length,1,'A queued call submits exactly once');
 assert.equal(sent.find(p=>p.action==='bet').move,'call');
 assert.equal((await api(null,queuedSession,{code})).room.table.lastAction.playerId,next.id);
 await queued.locator('#preselectControls').waitFor({state:'visible'});
 await queued.locator('#preCall').click();
 const changed=(await api(null,queuedSession,{code})).room.table,raisingSession=sessions.find(s=>s.playerId===changed.actorId),raising=(await api(null,raisingSession,{code})).room.table;
 await api({action:'bet',code,tableId:raising.id,handNumber:raising.handNumber,turnId:raising.turnId,move:'raise',amount:raising.legalActions.minRaiseTo},raisingSession);
 await queued.waitForFunction(()=>document.getElementById('notice').textContent.includes('bet changed'));
 assert.equal(await queued.locator('#preCall').getAttribute('aria-pressed'),'false');
 assert.equal(sent.filter(p=>p.action==='bet').length,1,'An increased bet clears the queued call');
 await queued.locator('#preRaise').click();const queuedRaise=Number(await queued.locator('#preRaiseAmount').inputValue());
 await queued.locator('#queueRaise').click();assert.equal(await queued.locator('#preRaise').getAttribute('aria-pressed'),'true');
 const raisedResponse=queued.waitForResponse(response=>response.url().includes('/api/poker-night')&&response.request().method()==='POST'&&response.request().postDataJSON()?.move==='raise');
 for(let i=0;i<12;i++){
  const current=(await api(null,queuedSession,{code})).room.table;if(current.actorId===queuedSession.playerId)break;
  const acting=sessions.find(s=>s.playerId===current.actorId),own=(await api(null,acting,{code})).room.table;
  await api({action:'bet',code,tableId:own.id,handNumber:own.handNumber,turnId:own.turnId,move:own.legalActions.canCheck?'check':'call'},acting);
 }
 assert.equal((await raisedResponse).status(),200);
 assert.equal(sent.filter(p=>p.action==='bet').length,2);
 assert.equal(sent.filter(p=>p.action==='bet')[1].amount,queuedRaise,'A preselected raise keeps the exact amount');
 await queued.close();
 // Bring action around to the real phone, then exercise its raise controls.
 for(let i=0;i<12;i++){
  const room=(await api(null,hostSession,{code})).room,table=room.table;if(table.actorId===hostSession.playerId)break;
  const seat=sessions.find(s=>s.playerId===table.actorId);assert.ok(seat);
  const own=(await api(null,seat,{code})).room.table;await api({action:'bet',code,tableId:own.id,handNumber:own.handNumber,turnId:own.turnId,move:own.legalActions.canCheck?'check':'call'},seat);
 }
 await host.locator('#bettingControls').waitFor({state:'visible'});await host.locator('#raiseOpen').click();await host.locator('[data-bet=min]').click();
 assert.equal(await host.locator('#bettingHandName').isVisible(),true,'Phone betting tray shows current hand strength');
 const expectedTrayHand='Your hand: '+(await api(null,hostSession,{code})).room.table.yourHandName;await host.waitForFunction(expected=>document.querySelector('#bettingHandName').textContent===expected,expectedTrayHand);
 const actionBefore=(await api(null,hostSession,{code})).room.table.actionNumber;
 const hostRaise=host.waitForResponse(response=>response.url().includes('/api/poker-night')&&response.request().method()==='POST'&&response.request().postDataJSON()?.move==='raise');
 await host.locator('#raiseButton').click();assert.equal((await hostRaise).status(),200);await host.waitForFunction(()=>document.getElementById('bettingControls').hidden);
 assert.equal((await api(null,hostSession,{code})).room.table.actionNumber,actionBefore+1);
 await host.screenshot({path:out+'/table-phone.png',fullPage:true});await host.locator('#pokerTable').screenshot({path:out+'/table-phone-close.png'});
 await host.locator('#pokerProfileButton').click();await host.locator('#tvButton').click();const tvHref=await host.locator('#openTv').getAttribute('href');assert.ok(tvHref.includes('#display='));assert.equal(new URL(tvHref).searchParams.has('hostToken'),false);
 await host.locator('#tvTable').selectOption('table-1');const pinnedHref=await host.locator('#openTv').getAttribute('href');assert.equal(new URL(pinnedHref).searchParams.get('table'),'table-1');
 await host.locator('#tvDialog [data-close]').click();
 const tv=await context(1920,1080);await tv.goto(tvHref);await tv.waitForFunction(()=>document.querySelectorAll('#seats .seat').length===9);
 const pinnedTv=await context(1280,720);await pinnedTv.goto(pinnedHref);await pinnedTv.waitForFunction(()=>document.getElementById('tableLabel').textContent.startsWith('TABLE 1'));
 assert.equal(await tv.locator('#privateCards .card:not(.back)').count(),0);assert.equal(await tv.locator('#myHand').isVisible(),false);assert.equal(await tv.locator('.poker-chat').isVisible(),false);assert.equal(await tv.locator('#hostDesk').isVisible(),false);assert.equal(await tv.locator('#standings li').count(),18);await fits(tv);
 assert.equal(await tv.locator('#myHandName').isVisible(),false,'TV does not display a private hand label');
 const first=await tv.locator('#tableLabel').textContent();await host.locator('#hostDesk > summary').click();await host.locator('[data-feature="table-2"]').click();
 await tv.waitForFunction(first=>document.getElementById('tableLabel').textContent!==first,first);
 assert.ok((await pinnedTv.locator('#tableLabel').textContent()).startsWith('TABLE 1'),'A second TV stays on its selected table when the featured table changes');
 assert.equal(await pinnedTv.locator('#seats .card:not(.back)').count(),0,'Independent TV does not reveal private cards');
 await pinnedTv.locator('#displayTable').selectOption('table-2');await pinnedTv.waitForFunction(()=>document.getElementById('tableLabel').textContent.startsWith('TABLE 2'));
 await pinnedTv.reload();await pinnedTv.waitForFunction(()=>document.getElementById('displayTable').value==='table-2');
 await pinnedTv.locator('#displayTable').selectOption('table-1');await pinnedTv.waitForFunction(()=>document.getElementById('tableLabel').textContent.startsWith('TABLE 1'));
 assert.equal((await api(null,hostSession,{code})).room.featuredTableId,'table-2','Changing one TV does not change the featured table');
 await fits(pinnedTv);await pinnedTv.close();
 assert.equal(await tv.evaluate(()=>document.getElementById('standingsPanel').getBoundingClientRect().bottom<=innerHeight),true,'TV table and standings fit a 1080p screen');
 await tv.screenshot({path:out+'/table-tv.png',fullPage:true});
 await tv.setViewportSize({width:1280,height:720});await fits(tv);
 assert.equal(await tv.evaluate(()=>document.getElementById('standingsPanel').getBoundingClientRect().bottom<=innerHeight),true,'TV standings remain visible at 720p');
 await tv.screenshot({path:out+'/table-tv-720.png',fullPage:true});await tv.setViewportSize({width:1920,height:1080});
 // Finish both live tables through real folds. Every connected screen must
 // show the automatic countdown and receive hand two without host input.
 for(let step=0;step<25;step++){
  const state=(await api(null,hostSession,{code})).room,table=state.tables.find(t=>t.phase!=='showdown');if(!table)break;
  const seat=sessions.find(s=>s.playerId===table.actorId);assert.ok(seat);
  await api({action:'bet',code,tableId:table.id,handNumber:table.handNumber,turnId:table.turnId,move:'fold'},seat);
 }
 await tv.waitForFunction(()=>document.getElementById('actionMessage').textContent.includes('deals automatically'));
 assert.equal((await api(null,hostSession,{code})).room.status,'playing','A hand winner does not end the game');
 assert.equal(await tv.locator('#seats .card:not(.back)').count(),0,'An uncontested pot reveals no cards automatically');
 const settledRoom=(await api(null,hostSession,{code})).room,settled=settledRoom.table;
 await host.locator('#handRecapPanel').waitFor({state:'visible'});
 assert.match(await host.locator('#handRecapResults').textContent(),/chips awarded/,'Result recap explains the chip award');
 assert.ok(await host.locator('.seat.pot-winner').count()>0,'Showdown highlights the player awarded the pot');
 if(settledRoom.featuredTableId!==settled.id)await host.locator('[data-feature="'+settled.id+'"]').click();
 await host.locator('#showHandButton').waitFor({state:'visible'});await host.locator('#showHandButton').click();
 await tv.waitForFunction(()=>document.querySelectorAll('#seats .card:not(.back)').length===2);
 assert.equal(await host.locator('#showHandButton').isDisabled(),true,'Voluntary reveal is one use per hand');
 await tv.screenshot({path:out+'/voluntary-show-tv.png'});
 await tv.waitForFunction(()=>document.getElementById('tableLabel').textContent.includes('HAND 2'),null,{timeout:20000});
 await host.waitForFunction(()=>document.getElementById('tableLabel').textContent.includes('HAND 2'));
 await guest.waitForFunction(()=>document.getElementById('tableLabel').textContent.includes('HAND 2'));
 assert.equal(await host.locator('#handRecapPanel').isVisible(),true,'Last result stays available after the next deal');
 assert.match(await host.locator('#handRecapTitle').textContent(),/Hand 1/);
 assert.equal(await host.locator('#nextButton').isVisible(),false,'No host click is required to continue');
 assert.equal(await host.locator('#showHandPanel').isVisible(),false,'Show-hand choice resets with the new hand');
 assert.equal(await tv.locator('#seats .card:not(.back)').count(),0,'Shown cards are private again on the next deal');
 await host.locator('#pauseButton').click();await tv.waitForFunction(()=>document.getElementById('actionMessage').textContent.includes('paused'));
 assert.equal(await guest.locator('#privateCards .card:not(.back)').count(),2);
 await host.locator('#pauseButton').click();
 const desk=await context(1440,1000);await desk.goto(origin+'/new-build/poker-night.html');await desk.locator('#showSetup').click();await desk.locator('#hostName').fill('Practice Player');await desk.locator('#mode').selectOption('practice');await desk.locator('#createForm button[type=submit]').click();await desk.waitForFunction(()=>!document.getElementById('lobby').hidden);await desk.locator('#startButton').click();await desk.waitForFunction(()=>!document.getElementById('gameArea').hidden);await fits(desk);
 await desk.screenshot({path:out+'/practice-desktop.png',fullPage:true});
 assert.equal(await desk.locator('#showHandPanel').isVisible(),false,'Practice never offers voluntary public reveal');
 assert.equal(await desk.evaluate(()=>document.getElementById('myHand').getBoundingClientRect().left>=document.getElementById('pokerTable').getBoundingClientRect().right),true,'Desktop controls sit to the right of the table');
 const outRow=db.raw.prepare('SELECT state FROM links_poker_night_rooms WHERE code=?').get(code),outState=JSON.parse(outRow.state),outHost=Object.values(outState.players).find(p=>p.id===hostSession.playerId);outState.status='paused';outState.pausedAt=Date.now();outHost.status='eliminated';outHost.chatTableId=outHost.tableId;outHost.tableId=null;outHost.stack=0;db.raw.prepare('UPDATE links_poker_night_rooms SET state=?,version=version+1 WHERE code=?').run(JSON.stringify(outState),code);await host.reload();await host.locator('#pokerProfileButton:visible').waitFor();await host.locator('#pokerProfileButton').click();await host.locator('#managePlayersButton:visible').waitFor();await host.locator('#managePlayersButton').click();assert.equal(await host.locator('#pokerPlayersDialog').evaluate(el=>el.open),true,'Eliminated host keeps direct player-management access');await host.getByRole('button',{name:'Remove Jordan',exact:true}).click();await host.locator('#confirmNo').click();assert.equal(await guest.locator('#room').isVisible(),true,'Cancel keeps the player seated');await host.getByRole('button',{name:'Remove Jordan',exact:true}).click();await host.locator('#confirmYes').click();await guest.locator('#welcome:visible').waitFor();assert.match(await guest.locator('#notice').textContent(),/host removed you/);assert.equal(await guest.locator('#privateCards .card').count(),0);assert.equal(await guest.evaluate(code=>localStorage.getItem('links-poker-session-'+code),code),null);await fits(host);
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 console.log('PASS real API/browser:18 players,9-seat phone layout,private cards,hide/reload,raise,TV privacy/feature switch,standings,automatic next hand on all devices,pause,practice and rules/ranks.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));db.raw.close();}
