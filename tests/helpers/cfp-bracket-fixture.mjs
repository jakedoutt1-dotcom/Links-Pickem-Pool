import {SLOTS,participants} from '../../public/new-build/cfp-bracket-core.mjs';
export function playoffFixture(year){
 const teams=Array.from({length:12},(_,i)=>({id:String(i+1),seed:i+1,name:'Team '+(i+1),record:'12-1',rank:i+1})),picks={};
 const events=SLOTS.map((s,i)=>{const ids=participants(s,picks,teams);picks[s.id]={team:ids[0],confidence:i+1};const date=year+'-12-'+String(18+s.round*3).padStart(2,'0')+'T'+String(18+(i%4)).padStart(2,'0')+':00:00Z';return {id:s.id,date,season:{type:3},competitions:[{date,notes:[{headline:['CFP First Round','CFP Quarterfinal','CFP Semifinal','CFP National Championship'][s.round]}],status:{type:{state:'pre',completed:false}},competitors:ids.map((id,j)=>({homeAway:j?'away':'home',team:{id,displayName:'Team '+id},seed:Number(id),records:[{type:'total',summary:'12-1'}],curatedRank:{current:Number(id)}}))}]};});
 return {teams,picks,events,finish(){for(const e of events){const c=e.competitions[0];c.status={type:{state:'post',completed:true}};c.competitors[0].score=28;c.competitors[0].winner=true;c.competitors[1].score=24;}}};
}
