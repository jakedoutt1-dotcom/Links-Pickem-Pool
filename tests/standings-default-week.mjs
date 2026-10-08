import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequestGet} from '../functions/new-build/api/standings-v649.js';
const {db}=fixture(),oldFetch=globalThis.fetch,oldNow=Date.now,lock=Date.parse('2026-10-15T00:00:00Z');let now=lock-1;
Date.now=()=>now;
globalThis.fetch=async url=>{const week=Number(new URL(url).searchParams.get('week'));return Response.json({events:[{id:String(week),date:new Date(week===7?lock:lock-7*86400000).toISOString(),status:{type:{completed:week<7}},competitions:[{competitors:[{team:{abbreviation:'BUF'},score:'20',winner:week<7},{team:{abbreviation:'MIA'},score:'10'}]}]}]})};
async function call(week,auto=true){const r=await onRequestGet({request:new Request('https://test/new-build/api/standings-v649?pool=1&week='+week+(auto?'&default=1':'')),env:{DB:db}});assert.equal(r.status,200);return r.json()}
try{assert.equal((await call(7)).week,6);assert.equal((await call(7,false)).week,7);assert.equal((await call(7,false)).locked,false);now=lock;assert.equal((await call(7)).week,7);assert.equal((await call(7)).locked,true);now=lock-1;assert.equal((await call(1)).week,1);console.log('PASS previous week before first kickoff, new week exactly at kickoff, manual selection and Week 1 boundary')}finally{globalThis.fetch=oldFetch;Date.now=oldNow;db.raw.close()}
