import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {validate,run} from './load/staging.mjs';
const base={environment:'staging',isolatedDatabase:true,origin:'http://127.0.0.1',count:10,concurrency:2,requests:[{path:'/new-build/api/test',expectedStatus:200,equals:{success:true}}]};
assert.throws(()=>validate({...base,origin:'https://linkspickempools.com'}));assert.throws(()=>validate({...base,isolatedDatabase:false}));assert.throws(()=>validate({...base,requests:[{...base.requests[0],path:'https://example.com/'}]}));
const server=createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({success:true}))});await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{const origin='http://127.0.0.1:'+server.address().port;assert.equal((await run({...base,origin})).failed,0);assert.equal((await run({...base,origin,requests:[{...base.requests[0],equals:{success:false}}]})).failed,10)}finally{server.close()}
console.log('PASS production/isolation guards, same-origin scenarios, bounded traffic, and application-level failure detection');
