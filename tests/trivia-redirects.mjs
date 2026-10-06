import assert from 'node:assert/strict';
import {triviaFetch} from '../functions/lib/trivia-health.js';
const options={method:'POST',headers:{'X-API-Key':'test-only'},redirect:'error'};
let calls=[];
const fetcher=async(url,opts)=>{calls.push(url);assert.equal(opts.method,'POST');assert.equal(opts.headers['X-API-Key'],'test-only');assert.equal(opts.redirect,'manual');return calls.length===1?new Response(null,{status:307,headers:{Location:'https://thetriviaapi.com/v2/session'}}):Response.json({id:'session'})};
assert.equal((await (await triviaFetch({},'session',fetcher,'https://the-trivia-api.com/v2/session',options)).json()).id,'session');
assert.equal(calls.length,2);
for(const target of ['https://evil.test/v2/session','http://thetriviaapi.com/v2/session','https://thetriviaapi.com/account','https://thetriviaapi.com:8443/v2/session']){
 let n=0;await assert.rejects(triviaFetch({},'session',async()=>{n++;return new Response(null,{status:307,headers:{Location:target}})},'https://the-trivia-api.com/v2/session',options));assert.equal(n,1);
}
console.log('PASS official redirects preserve authentication and method; unrelated destinations are blocked before credentials are sent.');
