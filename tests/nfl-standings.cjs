const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const source=fs.readFileSync(path.join(__dirname,'../functions/new-build/api/standings-v649.js'),'utf8');
 const {onRequestGet}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 let count=16,events=[],manual=[],seenUrl;
 const db={prepare(sql){assert.ok(sql.startsWith('SELECT'),'Read-only queries only');return{bind(){return this},async first(){return{id:1,name:'Test'}},async all(){
  if(sql.includes('pool_players'))return{results:[{name:'Alice'},{name:'Bob'}]};
  if(sql.includes('pool_picks'))return{results:['Alice','Bob'].flatMap(player_name=>Array.from({length:count},(_,i)=>({player_name,game_index:i+1,team:'A'+i})))};
  if(sql.includes('pool_ties'))return{results:[{player_name:'Alice',guess:37},{player_name:'Bob',guess:40}]};
  return{results:manual};
 }}}};
 const oldFetch=global.fetch;
 global.fetch=async url=>{seenUrl=new URL(url);return Response.json({events})};
 try{
  for(let week=1;week<=22;week++){
   count=week<=18?(week>=5&&week<=14?14:16):({19:6,20:4,21:2,22:1}[week]);
   events=Array.from({length:count},(_,i)=>({id:'g'+i,date:new Date(Date.UTC(2026,0,1,i)).toISOString(),status:{type:{completed:true}},competitions:[{competitors:[{team:{abbreviation:'A'+i},score:'20',...(i<count-2?{winner:true}:{})},{team:{abbreviation:'B'+i},score:'17'}]}]})).reverse();
   manual=[{game_index:0,winner:''},{game_index:1,winner:null}];
   const data=await (await onRequestGet({request:new Request('https://test.invalid/?pool=1&week='+week),env:{DB:db}})).json();
   assert.equal(data.expectedGames,count,'Week '+week+' game count');
   assert.equal(data.finalGames,count,'Final score fallback includes missing winner flags');
   assert.deepEqual(data.rows.map(x=>[x.wins,x.losses]),[[count,0],[count,0]],'Team mapping ignores shuffled indexes');
   assert.deepEqual(data.finalizedWinners,['Alice']);assert.equal(data.actualTie,37);
   assert.equal(seenUrl.searchParams.get('week'),String(week<=18?week:({19:1,20:2,21:3,22:5}[week])));
   events[0].status.type.completed=false;
   const pending=await (await onRequestGet({request:new Request('https://test.invalid/?pool=1&week='+week),env:{DB:db}})).json();
   assert.equal(pending.allFinal,false);assert.deepEqual(pending.finalizedWinners,[],'No early winner');
  }
  console.log('PASS all 22 weeks: full/byes/postseason counts, shuffled and one-based indexes, missing winner flags, blanks, tiebreaks, unfinished games');
 }finally{global.fetch=oldFetch}
})().catch(e=>{console.error(e);process.exitCode=1});
