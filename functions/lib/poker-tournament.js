import {tableChatView} from './poker-chat.js';
import {createTable,startHand,act,advanceTimeout,publicTable,showHand} from './poker-night.js';
import {computerMove} from './poker-computer.js';

const fail=(message,code='INVALID_ACTION')=>{const error=new Error(message);error.code=code;throw error;};
const number=(value,fallback,min,max,label)=>{
 const n=value===undefined?fallback:Number(value);
 if(!Number.isSafeInteger(n)||n<min||n>max)fail(`${label} must be a whole number from ${min} to ${max}.`,'INVALID_SETTINGS');
 return n;
};
export function pokerSettings(input={}){
 if(!input||typeof input!=='object'||Array.isArray(input))fail('Choose valid table settings.','INVALID_SETTINGS');
 const tableSize=number(input.tableSize,9,6,9,'Seats per table');
 if(![6,8,9].includes(tableSize))fail('Choose 6, 8, or 9 seats per table.','INVALID_SETTINGS');
 const smallBlind=number(input.smallBlind,25,1,5000,'Small blind');
 const bigBlind=number(input.bigBlind,smallBlind*2,2,10000,'Big blind');
 if(bigBlind!==smallBlind*2)fail('The big blind must be twice the small blind.','INVALID_SETTINGS');
 const startingChips=number(input.startingChips,5000,100,1000000,'Starting chips');
 if(startingChips<bigBlind*10)fail('Starting chips must cover at least 10 big blinds.','INVALID_SETTINGS');
 return {tableSize,startingChips,smallBlind,bigBlind,blindMinutes:number(input.blindMinutes,10,2,60,'Minutes per blind level'),turnSeconds:number(input.turnSeconds,25,10,60,'Seconds per turn'),maxReentries:number(input.maxReentries,1,0,5,'Buy backs'),reentryLevels:number(input.reentryLevels,3,1,12,'Last buy-back level'),breakEvery:number(input.breakEvery,0,0,12,'Levels between breaks'),breakMinutes:number(input.breakMinutes,5,1,15,'Break minutes'),botCount:number(input.botCount,2,1,8,'Computer opponents')};
}
export function playerName(value){
 const name=String(value||'').trim().replace(/[<>\x00-\x1f]/g,'');
 if(!name||name.length>24)fail('Enter a player name up to 24 characters.','INVALID_NAME');
 return name;
}
export function createTournament({code,mode,ownerSeat,hostHash,displayKey,player,settings,hostOnly=false},now=Date.now()){
 const config=pokerSettings(settings);
 const state={code,mode:['tournament','practice'].includes(mode)?mode:'friends',settings:config,owner:ownerSeat,hostHash,displayKey,status:'lobby',phase:'lobby',game:1,players:{},tables:[],featuredTableId:null,createdAt:now,expiresAt:now+86400000,startedAt:0,pausedAt:0,pausedMs:0,nextHandAt:0,processed:{},winners:[]};
 if(!(hostOnly&&state.mode==='tournament'))state.players[ownerSeat]={id:player.id,name:playerName(player.name),stack:config.startingChips,score:0,status:'active',tableId:null,reentries:0,joinedAt:now,away:false};
 if(state.mode==='practice'){
  config.maxReentries=0;config.botCount=Math.min(config.botCount,config.tableSize-1);
  const names=['River','Ace','Chip','Scout','Indigo','Lucky','Bluff','Gold'];
  for(let i=0;i<config.botCount;i++){const id=crypto.randomUUID();state.players['bot-'+id]={id,name:names[i]+' · Computer',stack:config.startingChips,score:0,status:'active',tableId:null,reentries:0,joinedAt:now,away:false,bot:true};}
 }
 return state;
}
// No historical seat existed for an invitee. Spread each completed round's
// small + big blinds equally across the seats that were dealt in. One full
// rotation therefore costs one small and one big blind, without choosing a
// favorable imaginary seat. Keep fractional chips until the final deduction.
function accountMissedBlinds(s){
 if(!s.tables.length)return;
 const seats=s.tables.reduce((n,t)=>n+t.players.length,0);
 const share=s.tables.reduce((n,t)=>n+t.smallBlind+t.bigBlind,0)/Math.max(1,seats);
 if(s.lateEntryBlindShare===undefined){
  // Existing rooms lack round history; use their current blind/seat rate.
  s.lateEntryBlindShare=Math.max(0,(s.round||1)-1)*share;
  s.lateEntryAccountedRound=Math.max(0,(s.round||1)-1);
 }
 if(s.tables.every(idle)&&(s.lateEntryAccountedRound||0)<s.round){
  s.lateEntryBlindShare+=share;s.lateEntryAccountedRound=s.round;
 }
}
export function joinTournament(s,seat,{id,name},now=Date.now()){
 if(s.players[seat])return s;
 if(s.mode==='practice')fail('Practice is just for you and the computer opponents. Create a friends table to invite others.');
 if(!['lobby','playing','paused'].includes(s.status))fail('This game has ended. Join the host’s next game.');
 if(Object.keys(s.players).length>=(s.mode==='tournament'?360:s.settings.tableSize))fail('This game is full.');
 name=playerName(name);
 if(Object.values(s.players).some(p=>p.name.toLocaleLowerCase()===name.toLocaleLowerCase()))fail('That name is taken. Add an initial or choose another name.');
 accountMissedBlinds(s);
 const missedBlinds=s.status==='lobby'?0:Math.ceil(s.lateEntryBlindShare||0);
 if(missedBlinds>=s.settings.startingChips)fail('The missed blinds use up the starting stack. Join the host’s next game.');
 // Use the same between-hand seating path as buy backs. Never alter a live
 // table, deck, pot, actor or blind position when an invite is accepted.
 s.players[seat]={id,name,stack:s.settings.startingChips-missedBlinds,missedBlinds,score:0,status:s.status==='lobby'?'active':'waiting',tableId:null,reentries:0,joinedAt:now,away:false};return s;
}
export function blindState(s,now=Date.now()){
 const time=s.pausedAt||now;
 const elapsed=s.startedAt?Math.max(0,time-s.startedAt-(s.pausedMs||0)):0;
 const level=s.mode==='tournament'?1+Math.floor(elapsed/(s.settings.blindMinutes*60000)):1;
 const multipliers=[1,2,3,4,6,8,12,16,20,30,40,60,80,100,150,200];
 const multiplier=multipliers[Math.min(level-1,multipliers.length-1)]*2**Math.min(12,Math.max(0,level-multipliers.length));
 return {level,smallBlind:Math.min(10000000,s.settings.smallBlind*multiplier),bigBlind:Math.min(20000000,s.settings.bigBlind*multiplier),nextLevelAt:s.mode==='tournament'&&s.startedAt?s.startedAt+(s.pausedMs||0)+level*s.settings.blindMinutes*60000:0};
}
const participants=s=>Object.values(s.players);
const alive=s=>participants(s).filter(p=>p.status!=='eliminated');
const idle=t=>['waiting','showdown'].includes(t.phase);
const playerById=(s,id)=>participants(s).find(p=>p.id===id);
export function canRebuy(s,p,now=Date.now()){
 return !!p&&['playing','paused'].includes(s.status)&&p.status==='eliminated'&&p.reentries<s.settings.maxReentries&&blindState(s,now).level<=s.settings.reentryLevels;
}
function advanceComputer(s,table,now){
 const player=playerById(s,table.actorId);if(!player?.bot||idle(table))return;
 if(table.botActorId!==player.id||table.botTurn!==table.actionNumber){table.botActorId=player.id;table.botTurn=table.actionNumber;table.botReadyAt=now+1200;return;}
 if(now<table.botReadyAt)return;
 const move=computerMove(publicTable(table,player.id),player.id);
 act(table,player.id,move,{turnSeconds:s.settings.turnSeconds},now);
}
function syncPlayers(s,now){
 for(const table of s.tables){
  for(const seat of table.players){
   const p=playerById(s,seat.id);if(!p||p.status==='waiting')continue;
   p.stack=seat.stack;
   if(table.phase==='showdown'&&table.accountedHand!==table.handNumber&&seat.stack===0&&p.status!=='eliminated'){
    p.status='eliminated';p.eliminatedAt=now;p.eliminatedRound=s.round||1;p.eliminatedStack=seat.handStartStack||seat.startingStack||0;
   }
  }
  if(table.phase==='showdown')table.accountedHand=table.handNumber;
 }
 // These tables play hand-for-hand. Finishing a hand or polling sooner must not
 // change placement across tables in the same round; starting stacks break ties.
 const out=participants(s).filter(p=>p.status==='eliminated');
 for(const p of out)p.place=1+participants(s).filter(q=>q.status!=='eliminated'||(q.eliminatedRound||0)>(p.eliminatedRound||0)||((q.eliminatedRound||0)===(p.eliminatedRound||0)&&q.eliminatedStack>p.eliminatedStack)).length;
}
function rebalance(s,now){
 const active=alive(s),count=Math.ceil(active.length/s.settings.tableSize),tables=s.tables.slice(0,count);
 // Table identities are never recycled after a table breaks. Otherwise a delayed
 // action could match a new table's hand/turn numbers after a later buy back.
 s.nextTableNumber=Math.max(s.nextTableNumber||1,...s.tables.map(t=>(Number(t.id.replace('table-',''))||0)+1));
 while(tables.length<count)tables.push(createTable('table-'+s.nextTableNumber++,[],{},now));
 const sizes=Array.from({length:count},(_,i)=>Math.floor(active.length/count)+(i<active.length%count?1:0));
 const randomIndex=length=>{const values=new Uint32Array(1),limit=0x100000000-(0x100000000%length);do{crypto.getRandomValues(values);}while(values[0]>=limit);return values[0]%length;};
 const shuffled=values=>{const result=[...values];for(let i=result.length-1;i>0;i--){const j=randomIndex(i+1);[result[i],result[j]]=[result[j],result[i]];}return result;};
 const freeSeats=table=>Array.from({length:s.settings.tableSize},(_,seat)=>seat).filter(seat=>!table.players.some(p=>p.seat===seat));
 const unseated=new Set(active.map(p=>p.id)),balanceMoves=[];
 tables.forEach((table,i)=>{
  // Keep a buy-back in its original seat when that table still exists.
  // Its refreshed stack is copied from the player record after balancing.
  table.players=table.players.filter(p=>{const record=playerById(s,p.id);return unseated.has(p.id)&&(record?.status!=='waiting'||record.returnTableId===table.id&&record.returnSeat===p.seat);});
  for(const p of table.players)unseated.delete(p.id);
  while(table.players.length>sizes[i]){
   // Move the player who owes the next big blind, never an arbitrary late seat.
   const clockwise=[...table.players].sort((a,b)=>a.seat-b.seat);
   const next=clockwise.find(p=>p.seat>table.bigBlindSeat)||clockwise[0];
   table.players=table.players.filter(p=>p.id!==next.id);balanceMoves.push(playerById(s,next.id));
  }
 });
 const place=(table,record,seat)=>table.players.push({id:record.id,name:record.name,stack:record.stack,seat});
 for(const record of balanceMoves){
  const index=tables.findIndex((table,i)=>table.players.length<sizes[i]),table=tables[index];
  const free=freeSeats(table),start=table.bigBlindSeat??-1;
  // The worst open position is nearest the upcoming big blind, never the next
  // small blind (the previous big-blind seat). Existing seats stay in order.
  const choices=free.filter(seat=>seat!==start),available=choices.length?choices:free;
  available.sort((a,b)=>((a-start+s.settings.tableSize)%s.settings.tableSize||s.settings.tableSize)-((b-start+s.settings.tableSize)%s.settings.tableSize||s.settings.tableSize));
  place(table,record,available[0]);
 }
 // Initial tables, broken-table players and displaced buy backs draw server-random
 // seats. Joining earlier cannot guarantee the dealer or a preferred table.
 for(const record of shuffled(active.filter(p=>unseated.has(p.id)))){
  const choices=tables.filter((table,i)=>table.players.length<sizes[i]),table=choices[randomIndex(choices.length)],free=freeSeats(table);
  place(table,record,free[randomIndex(free.length)]);
 }
 for(const table of tables)for(const p of table.players){const record=playerById(s,p.id);p.stack=record.stack;p.name=record.name;record.tableId=table.id;record.status='active';delete record.returnTableId;delete record.returnSeat;}
 for(const p of participants(s).filter(p=>p.status==='eliminated'))p.tableId=null;
 s.tables=tables;if(!tables.some(t=>t.id===s.featuredTableId))s.featuredTableId=tables[0]?.id||null;
 if(count===1)s.featuredTableId=tables[0]?.id||null;
}
function finish(s,now){
 const winner=alive(s)[0];s.status='finished';s.phase='ended';s.finishedAt=now;s.winnerId=winner?.id||null;s.nextHandAt=0;
 s.winners=Object.entries(s.players).filter(([,p])=>p.id===winner?.id).map(([seat])=>seat);
 for(const p of participants(s)){if(p.id===winner?.id)p.place=1;p.score=Math.round((participants(s).length-(p.place||participants(s).length))/Math.max(1,participants(s).length-1)*1000);}
}
function dealRound(s,now){
 accountMissedBlinds(s);
 if(alive(s).length<2){finish(s,now);return;}
 rebalance(s,now);const blinds=blindState(s,now);
 s.nextHandAt=0;s.round=(s.round||0)+1;s.roundStartedAt=now;s.lastDealtLevel=blinds.level;
 for(const table of s.tables)startHand(table,{...blinds,turnSeconds:s.settings.turnSeconds},now);
 syncPlayers(s,now);
}
export function advanceTournament(s,now=Date.now()){
 if(s.status==='paused'&&s.autoResumeAt&&now>=s.autoResumeAt)resumeTournament(s,now);
 if(s.status!=='playing')return s;
 for(const table of s.tables){
  const options={turnSeconds:s.settings.turnSeconds};
  if(!idle(table))advanceTimeout(table,options,now);
  const actor=playerById(s,table.actorId);
  if(actor?.away&&!idle(table)){
   const view=publicTable(table,actor.id);act(table,actor.id,{type:view.legalActions?.canCheck?'check':'fold'},options,now);
  }
  advanceComputer(s,table,now);
 }
 syncPlayers(s,now);
 if(s.tables.every(idle)){
  if(!s.nextHandAt){
   const buyback=participants(s).some(p=>canRebuy(s,p,now)&&p.eliminatedAt>=s.roundStartedAt);
   s.nextHandAt=now+(buyback?30000:10000);
  }
  if(now>=s.nextHandAt){
   const level=blindState(s,now).level;
   if(s.mode==='tournament'&&s.settings.breakEvery&&level>s.lastDealtLevel&&Math.floor((level-1)/s.settings.breakEvery)>Math.floor(((s.lastBreakLevel||1)-1)/s.settings.breakEvery)){
    s.lastBreakLevel=level;pauseTournament(s,now);s.autoResumeAt=now+s.settings.breakMinutes*60000;
   }else dealRound(s,now);
  }
 }
 return s;
}
export function startTournament(s,now=Date.now()){
 if(s.status!=='lobby')fail('This game has already started.');
 if(participants(s).length<2)fail('At least two players must join before starting.');
 s.status='playing';s.phase='playing';s.startedAt=now;dealRound(s,now);return s;
}
export function betTournament(s,seat,input,now=Date.now()){
 if(s.status!=='playing')fail('Wait until the host starts or resumes play.');
 const p=s.players[seat],table=s.tables.find(t=>t.id===p?.tableId);
 if(!table||p.status!=='active')fail('You are not seated in this hand.');
 if(input.handNumber!==table.handNumber||input.tableId!==table.id)fail('The hand changed. Check your cards and try again.','STALE_HAND');
 if(input.turnId!==table.actionNumber)fail('The action changed. Check the current bet and try again.','STALE_TURN');
 act(table,p.id,{type:input.move,amount:input.amount},{turnSeconds:s.settings.turnSeconds},now);
 p.away=false;syncPlayers(s,now);return s;
}
export function rebuyTournament(s,seat,now=Date.now()){
 const p=s.players[seat];if(!canRebuy(s,p,now))fail('Buy back is unavailable: you must be out, have a buy back left, and be before the cutoff.');
 const table=s.tables.find(t=>t.players.some(q=>q.id===p.id));
 p.returnTableId=table?.id;p.returnSeat=table?.players.find(q=>q.id===p.id)?.seat;
 p.stack=s.settings.startingChips;p.reentries++;p.status='waiting';p.tableId=null;p.away=false;delete p.place;delete p.eliminatedAt;delete p.eliminatedRound;delete p.eliminatedStack;return s;
}
export function showTournamentHand(s,seat,input){
 if(s.mode==='practice'||!['playing','paused','finished'].includes(s.status))fail('Showing a hand is available only after a multiplayer hand ends.','CANNOT_SHOW_HAND');
 const player=s.players[seat],table=s.tables.find(t=>t.id===input.tableId);
 if(!player||!table||!table.players.some(p=>p.id===player.id))fail('You were not dealt into this hand.','CANNOT_SHOW_HAND');
 if(input.handNumber!==table.handNumber)fail('The hand changed. Your new cards will stay private.','STALE_HAND');
 showHand(table,player.id);return s;
}
export function pauseTournament(s,now=Date.now()){
 if(s.status!=='playing')fail('Only a running game can be paused.');s.status='paused';s.pausedAt=now;return s;
}
export function resumeTournament(s,now=Date.now()){
 if(s.status!=='paused')fail('This game is not paused.');const delay=Math.max(0,now-s.pausedAt);
 for(const table of s.tables){if(table.deadline)table.deadline+=delay;if(table.handEndsAt)table.handEndsAt+=delay;}
 if(s.nextHandAt)s.nextHandAt+=delay;s.pausedMs+=delay;s.pausedAt=0;s.autoResumeAt=0;s.status='playing';return s;
}
export function tournamentView(s,seat='',{host=false,tv=false,venue=null,tableId=''}={},now=Date.now()){
 const self=s.players[seat],blinds=blindState(s,now);
 const standings=participants(s).map(p=>({id:p.id,name:p.name,stack:p.stack,score:p.score,status:p.status,tableId:p.tableId,reentries:p.reentries,away:!!p.away,bot:!!p.bot,place:p.place||null,you:p.id===self?.id})).sort((a,b)=>a.status==='eliminated'?(b.status==='eliminated'?(a.place||99)-(b.place||99):1):b.status==='eliminated'?-1:b.stack-a.stack||a.name.localeCompare(b.name));
 standings.forEach((p,i)=>p.rank=p.place||i+1);
 const allowShow=s.mode!=='practice'&&['playing','paused','finished'].includes(s.status);
 const tables=s.tables.map(t=>publicTable(t,tv?null:self?.id,{tv,allowShow}));
 for(const t of tables){const internal=s.tables.find(x=>x.id===t.id);t.turnId=internal.actionNumber;t.waitingForTables=idle(internal)&&s.tables.some(x=>!idle(x));}
 const table=tables.find(t=>t.id===(tv?(tableId||s.featuredTableId):self?.tableId))||tables.find(t=>t.id===s.featuredTableId)||tables[0]||null;
 return {...(!tv?{chat:tableChatView(s,seat,{host})}:{}),code:s.code,mode:s.mode,status:s.status,settings:s.settings,serverNow:now,...blinds,remaining:alive(s).length,players:standings,standings,tables,table,featuredTableId:s.featuredTableId,canRebuy:canRebuy(s,self,now),isHost:host,isTv:tv,playerId:self?.id||null,missedBlinds:self?.missedBlinds||0,expiresAt:s.expiresAt,winnerId:s.winnerId||null,nextHandAt:s.nextHandAt||0,pausedAt:s.pausedAt||0,autoResumeAt:s.autoResumeAt||0,venue,...(host?{displayKey:s.displayKey}:{})};
}
