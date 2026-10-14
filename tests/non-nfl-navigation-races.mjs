import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const eventSource=fs.readFileSync(new URL('../public/new-build/event-pool-app.mjs',import.meta.url),'utf8');
const functionLine=(source,name)=>source.split('\n').find(line=>line.trimStart().startsWith(name));
const ctx=vm.createContext({structuredClone});
vm.runInContext(`let event='A',state={event:'original'},draft={picks:['unsaved'],garage:''},loading=false,loadSequence=0;const pending={};const root={querySelectorAll:()=>[]};function api(){const id=event;return new Promise((resolve,reject)=>pending[id]={resolve,reject})}function render(){};${functionLine(eventSource,'async function load()')}`,ctx);
vm.runInContext("var first=load();event='B';var second=load();pending.B.resolve({event:'B',card:{picks:['B-player'],garage:''}})",ctx);await vm.runInContext('second',ctx);
vm.runInContext("pending.A.resolve({event:'A',card:{picks:['A-player']}})",ctx);await vm.runInContext('first',ctx);
assert.equal(vm.runInContext('event',ctx),'B');assert.equal(vm.runInContext('draft.picks[0]',ctx),'B-player');assert.equal(vm.runInContext('loading',ctx),false);
vm.runInContext("event='C';var failed=load();pending.C.reject(Error('offline'))",ctx);await assert.rejects(vm.runInContext('failed',ctx),/offline/);
assert.equal(vm.runInContext('event',ctx),'B');assert.equal(vm.runInContext('draft.picks[0]',ctx),'B-player');
vm.runInContext(functionLine(eventSource,'function hasUnsavedDraft()'),ctx);assert.equal(vm.runInContext('hasUnsavedDraft()',ctx),false);vm.runInContext("draft.picks.push('new')",ctx);assert.equal(vm.runInContext('hasUnsavedDraft()',ctx),true);
const college=fs.readFileSync(new URL('../public/new-build/college-app.js',import.meta.url),'utf8');
const c=vm.createContext({});vm.runInContext(`let busy=false,week=1,errorMessage='',lastFingerprint='';const calls=[];let release;const $=()=>({querySelectorAll:()=>[],textContent:'',close(){}});async function api(body){calls.push({week,...body});if(calls.length===1)await new Promise(r=>release=r)}async function load(){};${functionLine(college,'async function mutate(')};${functionLine(college,'function changeWeek(')}`,c);
vm.runInContext("var result=mutate({action:'tie',guess:42},{then:{action:'lock',locked:true}});changeWeek(2)",c);assert.equal(vm.runInContext('week',c),1,'Week navigation is blocked during save');
// Even another caller changing state cannot redirect the second request.
vm.runInContext('week=2;release()',c);await vm.runInContext('result',c);assert.equal(vm.runInContext('calls[0].week',c),1);assert.equal(vm.runInContext('calls[1].week',c),1);
console.log('PASS event response ordering, failed switch recovery, unsaved draft detection, college save week isolation');
