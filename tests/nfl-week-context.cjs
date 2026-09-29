const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../public/new-build/nfl-week-context.js'),'utf8');
async function run(allFinal,explicit=''){
 let target='';
 const context={window:{},URL,Number,Date,console,location:{href:'https://test.invalid/new-build/nfl.html?pool=1'+explicit},history:{replaceState(a,b,url){target=String(url)}},fetch:async url=>{
  const w=new URL(url).searchParams.get('week');
  return{ok:true,json:async()=>w?{events:[{date:'2026-09-20T00:00:00Z',status:{type:{completed:w==='3'&&allFinal}}},{status:{type:{completed:w==='3'}}}]}:{season:{type:2,year:2026},week:{number:3}}};
 }};
 vm.runInNewContext(source,context);return{week:await context.window.LINKS_NFL_WEEK_READY,target};
}
(async()=>{
 assert.equal((await run(false)).week,3,'Started but unfinished week remains current');
 assert.equal((await run(true)).week,4,'All games final advances to next week');
 assert.equal((await run(true,'&week=1')).week,1,'Explicit historical selection remains available');
 console.log('PASS active week: unfinished stays, all-final advances, history preserved');
})().catch(e=>{console.error(e);process.exitCode=1});
