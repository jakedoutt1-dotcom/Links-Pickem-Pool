const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const source=fs.readFileSync(path.join(__dirname,'../functions/new-build/api/standings-v649.js'),'utf8');
 const {onRequestGet}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 let eligible=['Alice','Bob'],count=16,events=[],manual=[],seenUrl;
 const db={prepare(sql){assert.ok(sql.startsWith('SELECT'),'Read-only queries only');return{bind(){return this},async first(){return{id:1,name:'Test'}},async all(){
  if(sql.includes('pool_payments'))return{results:eligible.map(player_name=>({player_name}))};
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
  eligible=['Bob'];events[0].status.type.completed=true;
  const filtered=await(await onRequestGet({request:new Request('https://test.invalid/?pool=1&week=22'),env:{DB:db}})).json();assert.deepEqual(filtered.rows.map(x=>x.player),['Bob']);assert.deepEqual(filtered.finalizedWinners,['Bob'],'Pending best tiebreaker cannot win');
  eligible=[];const empty=await(await onRequestGet({request:new Request('https://test.invalid/?pool=1&week=22'),env:{DB:db}})).json();assert.deepEqual(empty.rows,[]);assert.deepEqual(empty.finalizedWinners,[]);
  let requests=0;
  global.fetch=async(url,options)=>{
   assert.equal(options.cache,undefined,'Use established Workers-compatible request options');
   requests++;
   if(String(url).includes('site.api'))return new Response('upstream error',{status:502});
   return Response.json({content:{sbData:{events}}});
  };
  const fallback=await onRequestGet({request:new Request('https://test.invalid/?pool=1&week=22'),env:{DB:db}});
  assert.equal(fallback.status,200);assert.equal(requests,2,'Uses CDN after primary error');
  console.log('PASS all 22 weeks and primary-feed failure/CDN fallback');
 }finally{global.fetch=oldFetch}
})().catch(e=>{console.error(e);process.exitCode=1});
