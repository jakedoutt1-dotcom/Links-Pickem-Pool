import assert from 'node:assert/strict';
import {onRequestGet} from '../functions/new-build/api/playmaker-odds.js';
const originalFetch=globalThis.fetch,originalTimeout=globalThis.setTimeout;let calls=0;
const context=category=>({request:new Request('https://links.test/new-build/api/playmaker-odds?leagueID=NFL&oddIDs='+category),env:{SPORTS_GAME_ODDS_API_KEY:'fixture-only'},waitUntil:()=>{}});
try{
 globalThis.fetch=async()=>{calls++;return Response.json({success:true,data:[]})};
 let r=await onRequestGet(context('fixture-valid'));assert.equal(r.status,200);assert.equal((await r.json()).success,true);await onRequestGet(context('fixture-valid'));assert.equal(calls,1,'Cache reused');
 globalThis.fetch=async()=>new Response(new Uint8Array(8*1024*1024+1));r=await onRequestGet(context('fixture-large'));assert.equal(r.status,502);assert.equal((await r.json()).code,'UPSTREAM_ERROR');
 globalThis.setTimeout=(fn,ms,...args)=>originalTimeout(fn,ms===12000?1:ms,...args);globalThis.fetch=async(url,init)=>new Promise((resolve,reject)=>init.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))));r=await onRequestGet(context('fixture-timeout'));assert.equal(r.status,502);assert.equal((await r.json()).code,'UPSTREAM_ERROR');
 console.log('PASS odds gateway: cache reuse, bounded provider response and abort deadline return JSON');
}finally{globalThis.fetch=originalFetch;globalThis.setTimeout=originalTimeout}
