import {validateCard,scoreCard,rules,rankEntries} from './event-pool-core.mjs';
export function createDemo(game){
 const names=game==='golf'?['Sample Golfer A','Sample Golfer B','Sample Golfer C','Sample Golfer D','Sample Golfer E','Sample Golfer F','Sample Golfer G','Sample Golfer H']:['Kyle Larson','Denny Hamlin','Chase Elliott','William Byron','Ryan Blaney','Christopher Bell','Joey Logano','Tyler Reddick'];
 let config,card=null,results={},closed=false;
 function reset(format=game==='golf'?'best':'simple'){
 const now=Date.now();config={title:game==='golf'?'Practice Invitational':'Practice Cup Series race',format,year:2026,pickCount:format==='fantasy'?5:format==='one'?1:game==='golf'?6:2,countBest:4,penalty:10,phase:'regular',lockAt:new Date(now+86400000).toISOString(),garageClosesAt:new Date(now+90000000).toISOString(),raceStart:new Date(now+86700000).toISOString(),field:names.map((name,i)=>({name,tier:Math.min(i+1,6)}))};card=null;results={};closed=false;
 }
 reset();
 return {reset,finish(){closed=true;config.lockAt=new Date(Date.now()-1000).toISOString();results=Object.fromEntries(names.map((name,i)=>[name,{status:'final',score:-8+i,earnings:1000000-i*100000,finish:i+1,points:55-i*4}]));},async api(action,body){
 if(action==='save')card=validateCard(config,body.card,[]);
 else if(action==='garage'){if(closed)throw Error('Race results are final.');if(!card)throw Error('Save a roster first.');const i=card.picks.indexOf(body.out);if(i<0)throw Error('Choose a starter.');[card.picks[i],card.garage]=[card.garage,card.picks[i]];}
 else if(action)throw Error('Commissioner changes are available in your real pool.');
 return {liveGolf:game==='golf'?{name:config.title,round:closed?4:2,final:closed,leaders:names.slice(0,5).map((name,i)=>({name,position:String(i+1),score:-8+i}))}:null,liveRace:game==='nascar'?{name:'Practice Cup Series race',lap:closed?200:84,laps:200,flag:closed?'Race complete':'Green flag',leaders:names.slice(0,5).map((name,i)=>({position:i+1,name,number:''}))}:null,role:'player',player:'Demo Player',events:[{id:'practice',title:config.title}],event:'practice',config,results,version:1,closed,card,savedAt:card?new Date().toISOString():null,used:[],rows:rankEntries(game,config,results,closed&&card?[{player:'Demo Player',card,...scoreCard(game,config,card,results)}]:[]),rules:rules(game,config),entries:card?1:0};
 }};
}
