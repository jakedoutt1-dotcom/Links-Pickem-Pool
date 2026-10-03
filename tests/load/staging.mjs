// Run only against an explicitly identified isolated staging site.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
export function validate(config){
 const origin=new URL(config.origin);
 assert.ok(config.environment==='staging'&&config.isolatedDatabase===true,'Confirm staging and an isolated database in the scenario');
 assert.ok(!/(^|\.)linkspickempools\.com$/i.test(origin.hostname),'Production is forbidden');
 assert.ok(origin.protocol==='https:'||(['localhost','127.0.0.1','[::1]'].includes(origin.hostname)&&origin.protocol==='http:'),'HTTPS required outside loopback');
 assert.ok(origin.pathname==='/'&&!origin.username&&!origin.password&&!origin.search&&!origin.hash,'Origin only');
 assert.ok(Array.isArray(config.requests)&&config.requests.length>0);
 for(const r of config.requests){assert.equal(new URL(r.path,origin).origin,origin.origin);assert.ok(r.path.startsWith('/new-build/api/'));assert.ok(['GET','POST'].includes(r.method||'GET'));assert.ok(Number.isInteger(r.expectedStatus));assert.ok(r.equals&&Object.keys(r.equals).length,'Require response assertions, not just HTTP 200');}
 const count=config.count??100,concurrency=config.concurrency??5;
 assert.ok(Number.isInteger(count)&&count>0&&count<=100000);assert.ok(Number.isInteger(concurrency)&&concurrency>0&&concurrency<=500);
 return {origin:origin.origin,count,concurrency};
}
export async function run(config){
 const {origin,count,concurrency}=validate(config),times=[],statuses={},failures={};let cursor=0,failed=0;
 const start=performance.now();
 await Promise.all(Array.from({length:Math.min(count,concurrency)},async()=>{while(cursor<count){const i=cursor++,scenario=config.requests[i%config.requests.length],before=performance.now();try{
  const r=await fetch(new URL(scenario.path,origin),{method:scenario.method||'GET',redirect:'error',headers:{'Content-Type':'application/json',...scenario.headers},...(scenario.body?{body:JSON.stringify(scenario.body)}:{}),signal:AbortSignal.timeout(10000)});statuses[r.status]=(statuses[r.status]||0)+1;
  assert.equal(r.status,scenario.expectedStatus);const body=await r.json();for(const [path,value] of Object.entries(scenario.equals))assert.deepEqual(path.split('.').reduce((x,k)=>x?.[k],body),value);
 }catch{failed++;failures[i%config.requests.length]=(failures[i%config.requests.length]||0)+1}finally{times.push(performance.now()-before)}}}));
 times.sort((a,b)=>a-b);const percentile=p=>times[Math.min(times.length-1,Math.floor(times.length*p))];
 const report={environment:'staging',requests:count,concurrency,durationMs:performance.now()-start,failed,errorRate:failed/count,p50Ms:percentile(.5),p95Ms:percentile(.95),p99Ms:percentile(.99),statuses,failuresByScenario:failures};
 report.passed=report.errorRate<=.005&&report.p95Ms<=1500&&report.p99Ms<=3000;return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{const config=JSON.parse(readFileSync(process.argv[2],'utf8')),report=await run(config);mkdirSync('output/scale-readiness',{recursive:true});writeFileSync('output/scale-readiness/staging-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1}catch(e){console.error('Load test refused or failed:',e.message);process.exitCode=1}
}
