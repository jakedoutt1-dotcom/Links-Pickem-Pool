import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/last-alibi.js';
import {CASE_OBJECTIVES,caseObjectives} from '../functions/lib/last-alibi-objectives.js';
for(const caseId of Object.keys(CASE_OBJECTIVES)){
 const {db}=fixture();let code='',token='',game=1;
 const call=async body=>{const response=await onRequest({env:{DB:db},request:new Request('https://links.test/new-build/api/last-alibi',{method:'POST',headers:{Origin:'https://links.test','Content-Type':'application/json','x-alibi-token':token},body:JSON.stringify({code,game,...body})})});return {status:response.status,...await response.json()}};
 const raw=()=>JSON.parse(db.raw.prepare('SELECT state FROM links_mystery_rooms WHERE code=?').get(code).state);
 try{
  let s=await call({action:'create',caseId,mode:'solo',minutes:8,name:'Investigator'});assert.equal(s.status,200);code=s.code;token=s.token;assert.equal(s.dossierVersion,2);assert(db.raw.prepare('SELECT expires FROM links_mystery_rooms WHERE code=?').get(code).expires>Date.now()+6*86400000);await call({action:'ready'});await call({action:'start'});s=await call({action:'continue'});
  for(let chapter=1;chapter<=6;chapter++){
   assert.equal(s.chapter,chapter);assert(s.caseObjective);assert.equal((await call({action:'continue',chapter})).status,409,'Cannot bypass objective');assert.equal((await call({action:'submit-objective',chapter,answer:'wrong',evidence:[]})).status,400);assert(!s.objects.some(e=>raw().case.evidence.find(x=>x.id===e.id).chapter>chapter));assert(!JSON.stringify(s.caseObjective).includes('answers'));assert.equal(s.publicClues.length,0,'Core records require inspection, not automatic publication');
   s=await call({action:'objective-hint',chapter});assert.equal(s.caseObjective.hints.length,1);assert.equal(s.chapter,chapter);
   for(const e of raw().case.evidence.filter(e=>e.chapter<=chapter&&!e.cost&&!e.unlock))s=await call({action:'inspect',id:e.id,chapter});
   for(const puzzle of raw().case.puzzles||[])if(puzzle.chapter<=chapter)s=await call({action:'solve-puzzle',id:puzzle.id,answer:puzzle.answer,chapter});
   for(const c of raw().case.contacts||[])if(c.chapter<=chapter)s=await call({action:'dial',number:c.number,chapter});
   const objective=caseObjectives(raw())[chapter-1];assert.equal((await call({action:'submit-objective',chapter,answer:objective.answers[0],evidence:[]})).status,400,'Answer needs supporting records');
   s=await call({action:'submit-objective',chapter,answer:objective.answers[0],evidence:objective.evidence});assert.equal(s.status,200,JSON.stringify(s));assert.equal(s.completedObjectives.length,chapter);
   assert.equal((await call({action:'submit-objective',chapter,answer:objective.answers[0],evidence:objective.evidence})).status,409,'Stale submission cannot skip a packet');
  }
  assert.equal(s.phase,'accuse');const r=raw();s=await call({action:'accuse',suspect:r.suspects[r.case.killer].id,scene:r.case.scene.id,object:r.case.object,evidence:r.case.proofRecords[0]});assert.equal(s.status,200);s=await call({action:'continue'});assert.equal(s.phase,'ended');assert.equal(s.ending.reconstruction,undefined);for(let step=0;step<4;step++){s=await call({action:'reveal',step});assert.equal(s.status,200);if(step<2)assert.equal(s.ending.reconstruction,undefined)}assert.equal(s.ending.reconstruction.length,6);assert.equal(s.ending.caught,true);
  console.log('PASS objective investigation:',caseId,'six gated packets, inspected records, multi-record proof, private unlocks, optional hint, stale/bypass guards, seven-day resume window, supported final conclusion');
 }finally{db.raw.close()}
}
