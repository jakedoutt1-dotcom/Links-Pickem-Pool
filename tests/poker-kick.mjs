import assert from 'node:assert/strict';
import {createTournament,joinTournament,startTournament,kickTournamentPlayer,advanceTournament,canRebuy} from '../functions/lib/poker-tournament.js';
import {act,publicTable} from '../functions/lib/poker-night.js';
let now=1802800000000;
function game(){const s=createTournament({code:'ABCDEF1234',mode:'friends',ownerSeat:'host',player:{id:'host',name:'Host'},settings:{startingChips:1000,maxReentries:1}},now);for(const id of ['a','b'])joinTournament(s,id,{id,name:id},now);startTournament(s,now);return s}
const total=s=>(s.retiredChips||0)+s.tables.reduce((n,t)=>n+t.pot+t.players.reduce((n,p)=>n+p.stack,0),0);
function finish(s){let guard=0;while(s.tables.some(t=>t.phase!=='showdown')){assert(++guard<100);const t=s.tables[0],p=s.players[t.actorId];if(p?.removed)advanceTournament(s,now);else{const l=publicTable(t,t.actorId).legalActions;act(t,t.actorId,{type:l.canCheck?'check':'call'},{},now);advanceTournament(s,now)}}advanceTournament(s,now);assert.equal(total(s),3000)}
{
 const s=game(),t=s.tables[0];if(t.actorId==='host'){act(t,'host',{type:publicTable(t,'host').legalActions.canCheck?'check':'call'},{},now)}
 const id=t.actorId;kickTournamentPlayer(s,id,now);assert(s.players[id].removed);assert(t.players.find(p=>p.id===id).folded);assert.equal(canRebuy(s,s.players[id],now),false);assert.equal(total(s),3000);finish(s);assert.equal(s.players[id].stack,0);assert(s.retiredChips>0);now=s.nextHandAt;advanceTournament(s,now);assert(s.tables.every(table=>table.players.every(p=>p.id!==id)),'Removed seat never returns on the next deal');assert.equal(total(s),3000);
}
{
 const s=game(),t=s.tables[0];if(t.actorId==='host')act(t,'host',{type:'call'},{},now);
 const id=t.actorId,l=publicTable(t,id).legalActions;act(t,id,{type:'raise',amount:l.maxRaiseTo},{},now);const allIn=t.players.find(p=>p.id===id);assert(allIn.allIn);kickTournamentPlayer(s,id,now);assert.equal(allIn.folded,false,'Already all-in retains pot eligibility');assert.equal(total(s),3000);finish(s);
}
{
 const s=game(),t=s.tables[0],target=t.players.find(p=>p.id!=='host'&&p.id!==t.actorId);s.status='paused';const before=JSON.stringify(t);kickTournamentPlayer(s,target.id,now);assert.equal(JSON.stringify(t),before,'Paused removal does not alter the live hand');assert.throws(()=>kickTournamentPlayer(s,'host',now));
}
console.log('PASS host removal: actor fold, paused hand stability, all-in eligibility, no rebuy and chip conservation including retired chips.');
