// Execute the real API handler against in-memory stubs; never contact production.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync(path.join(__dirname,'../functions/new-build/api/compare-picks.js'),'utf8');
 const {onRequestGet}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const first=Date.parse('2026-10-02T00:00:00Z');
 const originalNow=Date.now,originalFetch=global.fetch;
 let reads=0;
 const db={prepare(sql){return{bind(){return this},async first(){return{id:1,name:'Test pool'}},async all(){reads++;return{results:[]}}}}};
 global.fetch=async()=>Response.json({week:{number:4},events:[{id:'g1',date:new Date(first).toISOString(),competitions:[{competitors:[]}]}]});
 try{
  for(const role of ['player','commissioner','admin'])for(const offset of [-1,0,1]){
   reads=0;Date.now=()=>first+offset;
   const response=await onRequestGet({request:new Request('https://test.invalid/new-build/api/compare-picks?pool=1&week=4&role='+role),env:{DB:db}});
   const data=await response.json();
   assert.equal(data.locked,offset>=0,role+' kickoff boundary');
   assert.equal(reads,offset<0?0:4,'No roster/picks/ties/results reads before kickoff');
   if(offset<0)assert.deepEqual(data.players,[]);
  }
  reads=0;let calls=0;
  global.fetch=async(url)=>{calls++;return String(url).includes('cdn.espn.com')?Response.json({content:{sbData:{events:[{id:'g1',date:new Date(first-1000).toISOString(),status:{type:{completed:true}},competitions:[{competitors:[{homeAway:'home',team:{abbreviation:'BUF'},score:'20'},{homeAway:'away',team:{abbreviation:'MIA'},score:'10'}]}]}]}}}):new Response('unavailable',{status:502})};
  const fallback=await (await onRequestGet({request:new Request('https://test.invalid/new-build/api/compare-picks?pool=1&week=3'),env:{DB:db}})).json();
  assert.equal(fallback.locked,true);assert.equal(fallback.results[0],'BUF');assert.equal(calls,2);assert.equal(reads,4);
  global.fetch=async()=>Response.json({week:{number:4},events:[]});
  const data=await (await onRequestGet({request:new Request('https://test.invalid/new-build/api/compare-picks?pool=1&week=4&role=admin'),env:{DB:db}})).json();
  assert.equal(data.success,false,'Missing schedule reports unavailable');assert.equal(data.players,undefined,'Missing schedule does not expose picks');
  console.log('PASS privacy: all roles before/at/after kickoff; missing schedule stays private');
 }finally{Date.now=originalNow;global.fetch=originalFetch}
})().catch(e=>{console.error(e);process.exitCode=1});
