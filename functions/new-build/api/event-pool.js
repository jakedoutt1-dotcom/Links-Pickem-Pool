import {cleanConfig,validateCard,scoreCard,rules} from '../../../public/new-build/event-pool-core.mjs';
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){
 try{
 const db=env.DB;if(!db)return json({error:'Pool service unavailable.'},503);
 const b=request.method==='GET'?Object.fromEntries(new URL(request.url).searchParams):await request.json(),pool=Number(b.pool),game=b.game;
 if(!pool||!['golf','nascar'].includes(game))return json({error:'Choose a valid pool and game.'},400);
 const token=(request.headers.get('authorization')||'').replace(/^Bearer /,''),actor=await db.prepare('SELECT * FROM pool_sessions WHERE token=? AND expires_at>?').bind(token,new Date().toISOString()).first();
 if(!actor||String(actor.pool_id)!==String(pool))return json({error:'Sign in to this pool.'},401);
 const enabled=await db.prepare('SELECT active FROM pool_active_games WHERE pool_id=? AND game_type=?').bind(pool,game==='golf'?'masters':game).first();if(!enabled?.active)return json({error:'This game is not active.'},403);
 const admin=actor.role==='admin';
 await db.prepare('CREATE TABLE IF NOT EXISTS links_event_pools(pool_id INTEGER,game TEXT,event_id TEXT,config TEXT NOT NULL,results TEXT NOT NULL DEFAULT \'{}\',version INTEGER NOT NULL DEFAULT 1,PRIMARY KEY(pool_id,game,event_id))').run();
 await db.prepare('CREATE TABLE IF NOT EXISTS links_event_cards(pool_id INTEGER,game TEXT,event_id TEXT,player TEXT,card TEXT NOT NULL,saved_at TEXT NOT NULL,PRIMARY KEY(pool_id,game,event_id,player))').run();
 const events=(await db.prepare('SELECT * FROM links_event_pools WHERE pool_id=? AND game=? ORDER BY rowid DESC').bind(pool,game).all()).results||[];
 let event=events.find(e=>e.event_id===b.event)||(!b.event?events[0]:null),config=event?JSON.parse(event.config):null,results=event?JSON.parse(event.results):{};
 const cards=event?(await db.prepare('SELECT * FROM links_event_cards WHERE pool_id=? AND game=? AND event_id=?').bind(pool,game,event.event_id).all()).results||[]:[];
 const history=(await db.prepare('SELECT c.card,e.config FROM links_event_cards c JOIN links_event_pools e ON e.pool_id=c.pool_id AND e.game=c.game AND e.event_id=c.event_id WHERE c.pool_id=? AND c.game=? AND c.player=? AND c.event_id<>?').bind(pool,game,actor.player_name,event?.event_id||'').all()).results||[];
 const used=config?history.filter(h=>{const c=JSON.parse(h.config);return c.year===config.year&&c.format===config.format&&(config.format!=='fantasy'||c.phase===config.phase)}).flatMap(h=>JSON.parse(h.card).picks):[];
 if(request.method==='GET'){
 const closed=config&&Date.now()>=Date.parse(config.lockAt),mine=cards.find(c=>c.player===actor.player_name);
 const rows=closed?cards.map(c=>({player:c.player,card:JSON.parse(c.card),...scoreCard(game,config,JSON.parse(c.card),results)})):[];
 if(config?.format==='one'){
const seasonCards=(await db.prepare('SELECT c.player,c.card,e.config,e.results FROM links_event_cards c JOIN links_event_pools e ON e.pool_id=c.pool_id AND e.game=c.game AND e.event_id=c.event_id WHERE c.pool_id=? AND c.game=?').bind(pool,game).all()).results||[];
const totals=new Map();for(const item of seasonCards){const cfg=JSON.parse(item.config);if(cfg.format!=='one'||cfg.year!==config.year||Date.parse(cfg.lockAt)>Date.now())continue;const scored=scoreCard(game,cfg,JSON.parse(item.card),JSON.parse(item.results));if(scored.score!==null)totals.set(item.player,(totals.get(item.player)||0)+scored.score);}
for(const [player,total] of totals)if(!rows.some(r=>r.player===player))rows.push({player,score:total,card:null});
 for(const row of rows){row.eventScore=row.score;row.score=totals.get(row.player)??null;row.detail='Season tournament earnings';}
}
rows.sort((a,b)=>a.score===null?1:b.score===null?-1:(game==='golf'&&config.format==='one'||config.format==='fantasy'?b.score-a.score:a.score-b.score)||a.player.localeCompare(b.player));
 return json({role:actor.role,player:actor.player_name,events:events.map(e=>({id:e.event_id,title:JSON.parse(e.config).title})),event:event?.event_id,config,results:closed||admin?results:{},version:event?.version,closed:!!closed,card:mine?JSON.parse(mine.card):null,savedAt:mine?.saved_at,used,rows,rules:config?rules(game,config):'',entries:cards.length});
 }
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 const action=b.action;
 if(action==='configure'){
 if(!admin)return json({error:'Commissioner only.'},403);
 const id=String(b.event||'').trim();if(!/^[a-zA-Z0-9_-]{1,80}$/.test(id))return json({error:'Use a unique event ID with letters, numbers, or hyphens.'},400);
 const next=cleanConfig(game,b.config);
 if(Date.parse(next.lockAt)<=Date.now())return json({error:'Choose a future deadline.'},400);
 if(next.format==='fantasy'){
  next.raceStart=new Date(b.config.raceStart).toISOString();next.lockAt=new Date(Date.parse(next.raceStart)-300000).toISOString();
  next.garageClosesAt=new Date(b.config.garageClosesAt).toISOString();
  if(Date.parse(next.lockAt)<=Date.now()||Date.parse(next.garageClosesAt)<=Date.parse(next.raceStart))throw Error('Set a future race start and a final-stage cutoff after the start.');
 }
 if(event){
 if(Number(b.version)!==event.version)return json({error:'Setup changed. Refresh first.'},409);
 const update=await db.prepare('UPDATE links_event_pools SET config=?,version=version+1 WHERE pool_id=? AND game=? AND event_id=? AND version=? AND NOT EXISTS(SELECT 1 FROM links_event_cards WHERE pool_id=? AND game=? AND event_id=?)').bind(JSON.stringify(next),pool,game,id,event.version,pool,game,id).run();
 if(!update.meta?.changes)return json({error:'Format is frozen once entries exist. Create a new event.'},409);
 }else await db.prepare('INSERT INTO links_event_pools(pool_id,game,event_id,config) VALUES(?,?,?,?)').bind(pool,game,id,JSON.stringify(next)).run();
 return json({ok:true,event:id});
 }
 if(!event)return json({error:'Choose a configured event.'},404);
 if(Number(b.version)!==event.version)return json({error:'Event changed. Refresh before saving.'},409);
 if(action==='save'){
 if(Date.now()>=Date.parse(config.lockAt))return json({error:'This event is locked.'},403);
 const card=validateCard(config,b.card||{},used),now=new Date().toISOString();
 const write=await db.prepare('INSERT INTO links_event_cards(pool_id,game,event_id,player,card,saved_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM links_event_pools WHERE pool_id=? AND game=? AND event_id=? AND version=?) ON CONFLICT(pool_id,game,event_id,player) DO UPDATE SET card=excluded.card,saved_at=excluded.saved_at').bind(pool,game,event.event_id,actor.player_name,JSON.stringify(card),now,pool,game,event.event_id,event.version).run();
 if(!write.meta?.changes)return json({error:'Event changed. Refresh first.'},409);return json({ok:true});
 }
 if(action==='garage'){
 if(config.format!=='fantasy'||Date.now()>=Date.parse(config.garageClosesAt)||Object.keys(results).length)return json({error:'Garage changes are closed.'},403);
 const mine=cards.find(c=>c.player===actor.player_name);if(!mine)return json({error:'Save a roster before using the garage.'},400);
 const old=JSON.parse(mine.card),idx=old.picks.indexOf(b.out);if(idx<0)return json({error:'Choose a current starter.'},400);
 const next={picks:[...old.picks],garage:b.out};next.picks[idx]=old.garage;validateCard(config,next,used);
 const changed=await db.prepare('UPDATE links_event_cards SET card=?,saved_at=? WHERE pool_id=? AND game=? AND event_id=? AND player=? AND card=? AND EXISTS(SELECT 1 FROM links_event_pools WHERE pool_id=? AND game=? AND event_id=? AND version=?)').bind(JSON.stringify(next),new Date().toISOString(),pool,game,event.event_id,actor.player_name,mine.card,pool,game,event.event_id,event.version).run();
 if(!changed.meta?.changes)return json({error:'Roster changed. Refresh first.'},409);return json({ok:true});
 }
 if(action==='closeGarage'){if(!admin||config.format!=='fantasy')return json({error:'Commissioner only.'},403);const next={...config,garageClosesAt:new Date().toISOString()};const changed=await db.prepare('UPDATE links_event_pools SET config=?,version=version+1 WHERE pool_id=? AND game=? AND event_id=? AND version=?').bind(JSON.stringify(next),pool,game,event.event_id,event.version).run();if(!changed.meta?.changes)return json({error:'Event changed. Refresh first.'},409);return json({ok:true});}
 if(action==='results'){
 if(!admin)return json({error:'Commissioner only.'},403);
 if(Date.now()<Date.parse(config.lockAt))return json({error:'Record results after the deadline.'},409);
 const next={};for(const item of b.results||[]){
 if(!config.field.some(f=>f.name===item.name)||next[item.name]||!['final','cut','withdrawn','pending'].includes(item.status))throw Error('Check result names and statuses.');
 const r={status:item.status};if(item.status==='final'){
 const fields=game==='golf'?(config.format==='one'?['earnings']:['score']):['finish',...(config.format==='fantasy'?['points']:[])];
 for(const key of fields){const value=Number(item[key]);if(item[key]===''||item[key]==null||!Number.isFinite(value)||key==='finish'&&(!Number.isInteger(value)||value<1||value>60)||key==='earnings'&&value<0)throw Error('Enter valid '+key+' for '+item.name);r[key]=value;}
 }else if(game==='nascar'&&item.status!=='pending')throw Error('Use final classification for all drivers, including DNFs.');next[item.name]=r;
 }
 const saved=await db.prepare('UPDATE links_event_pools SET results=?,version=version+1 WHERE pool_id=? AND game=? AND event_id=? AND version=?').bind(JSON.stringify(next),pool,game,event.event_id,event.version).run();if(!saved.meta?.changes)return json({error:'Results changed. Refresh first.'},409);return json({ok:true});
 }
 return json({error:'Unknown action.'},400);
 }catch(e){return json({error:e.message||'Unable to update this event.'},400)}
}
