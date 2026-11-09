import assert from 'node:assert/strict';
import {onRequestGet} from '../functions/new-build/api/playmaker-odds.js';
const originalFetch=globalThis.fetch,originalTimeout=globalThis.setTimeout;let calls=0;
const context=category=>({request:new Request('https://links.test/new-build/api/playmaker-odds?leagueID=NFL&oddIDs='+category),env:{SPORTS_GAME_ODDS_API_KEY:'fixture-only'},waitUntil:()=>{}});
try{
 globalThis.fetch=async()=>{calls++;return Response.json({success:true,data:[]})};
 let r=await onRequestGet(context('fixture-valid'));assert.equal(r.status,200);assert.equal((await r.json()).success,true);await onRequestGet(context('fixture-valid'));assert.equal(calls,1,'Cache reused');
 const windows=[];globalThis.fetch=async url=>{windows.push(new URL(url));return Response.json({success:true,data:[]})};
 for(const start of ['2026-11-02T06:00:00Z','2026-11-09T06:00:00Z']){const c=context('fixture-window');const u=new URL(c.request.url);u.searchParams.set('startsAfter',start);u.searchParams.set('startsBefore',new Date(Date.parse(start)+86400000*7).toISOString());c.request=new Request(u);assert.equal((await onRequestGet(c)).status,200)}assert.equal(windows.length,2,'Different weeks use distinct shared caches');assert.equal(windows[0].searchParams.get('startsAfter'),'2026-11-02T06:00:00.000Z');
 const invalid=context('fixture-invalid-date');invalid.request=new Request(invalid.request.url+'&startsAfter=invalid');assert.equal((await onRequestGet(invalid)).status,400);assert.equal(windows.length,2);
 globalThis.fetch=async()=>new Response(new Uint8Array(8*1024*1024+1));r=await onRequestGet(context('fixture-large'));assert.equal(r.status,502);assert.equal((await r.json()).code,'UPSTREAM_ERROR');
 globalThis.setTimeout=(fn,ms,...args)=>originalTimeout(fn,ms===12000?1:ms,...args);globalThis.fetch=async(url,init)=>new Promise((resolve,reject)=>init.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))));r=await onRequestGet(context('fixture-timeout'));assert.equal(r.status,502);assert.equal((await r.json()).code,'UPSTREAM_ERROR');
 console.log('PASS odds gateway: cache reuse, bounded provider response and abort deadline return JSON');
}finally{globalThis.fetch=originalFetch;globalThis.setTimeout=originalTimeout}

// Cache survives a fresh isolate and concurrent provider failures stay coalesced.
{
 const oldCaches=globalThis.caches,clock=Date.now;const store=new Map();let pending=[],reads=0;
 globalThis.caches={default:{match:async r=>store.get(r.url)?.clone(),put:async(r,v)=>{store.set(r.url,v.clone())}}};
 const ctx=context('fixture-shared-backup');ctx.waitUntil=p=>pending.push(p);
 try{
  globalThis.fetch=async()=>{reads++;return Response.json({success:true,data:[]})};assert.equal((await onRequestGet(ctx)).status,200);await Promise.all(pending);
  // Expire only the fresh cache; a separate module instance has no memory cache.
  for(const key of store.keys())if(key.includes('__playmaker_odds_cache'))store.delete(key);
  const fresh=await import('../functions/new-build/api/playmaker-odds.js?fresh-isolate');
  globalThis.fetch=async()=>{reads++;throw Error('provider outage')};const r=await fresh.onRequestGet(ctx);assert.equal(r.status,200);assert.equal(r.headers.get('X-LINKS-Odds-Cache'),'stale-cache');assert.equal(r.headers.get('X-LINKS-Odds-Warning'),'provider-error');
  Date.now=()=>clock()+7*3600000;assert.equal((await fresh.onRequestGet(ctx)).status,502,'Expired backup is never reused');Date.now=clock;
  globalThis.caches=undefined;let release;reads=0;globalThis.fetch=async()=>{reads++;await new Promise(r=>release=r);return Response.json({error:'down'},{status:503})};
  const c=context('fixture-coalesced-failure'),first=onRequestGet(c);await new Promise(r=>originalTimeout(r,0));const second=onRequestGet(c);release();const results=await Promise.all([first,second]);assert(results.every(r=>r.status===502));assert.equal(reads,1,'A waiting request must not repeat a failed provider call');
  globalThis.fetch=async()=>new Response('<html>provider failure</html>');assert.equal((await onRequestGet(context('fixture-invalid-json'))).status,502,'Invalid provider bodies are not cached');
  console.log('PASS shared outage backup, expiration, failed request coalescing and invalid JSON rejection');
 }finally{Date.now=clock;globalThis.caches=oldCaches;globalThis.fetch=originalFetch}
}
