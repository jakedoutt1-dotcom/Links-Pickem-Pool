import {tournamentFeed,createTournament} from '../functions/lib/march.js';
import {scoreBracket,cleanPicks,rankEntries,entrants} from '../public/new-build/march-core.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';
const file='output/march-2025-feed.json';const feed=fs.existsSync(file)&&JSON.parse(fs.readFileSync(file)).ready?JSON.parse(fs.readFileSync(file)):await tournamentFeed(2025);fs.writeFileSync(file,JSON.stringify(feed));
console.log('Feed',feed.ready,feed.field.length,feed.events.length);assert.equal(feed.ready,true);
const t=createTournament(feed,2025,['East','Midwest','South','West']);assert.equal(Object.keys(t.results).length,63);
const picks=Object.fromEntries(t.games.map(g=>[g.id,t.results[g.id].winner]));assert.equal(Object.keys(cleanPicks(t.games,picks)).length,63);const perfect=scoreBracket(t.games,picks,t.results);assert.equal(perfect.points,1920);assert.equal(perfect.correct,63);assert.equal(perfect.remaining,0);
const final=t.results['national-6-0'];assert.match(final.teams.find(x=>x.id===final.winner).name,/Florida/);assert.deepEqual(final.teams.map(x=>x.score).sort((a,b)=>a-b),[63,65]);
const wrong={...picks,'national-6-0':final.teams.find(x=>x.id!==final.winner).id};assert.equal(scoreBracket(t.games,wrong,t.results).points,1600);
const ranked=rankEntries([{player:'Exact tie',picks,tie:128,submitted:true},{player:'Off by one',picks,tie:129,submitted:true},{player:'Wrong champion',picks:wrong,tie:128,submitted:true}],t.games,t.results);assert.deepEqual(ranked.map(x=>x.player),['Exact tie','Off by one','Wrong champion']);
const progression=[];for(let round=1;round<=6;round++){const results=Object.fromEntries(t.games.filter(g=>g.round<=round).map(g=>[g.id,t.results[g.id]]));const score=scoreBracket(t.games,picks,results);assert.equal(score.points,round*320);progression.push(score.points);}
fs.writeFileSync('output/march-2025-test-result.json',JSON.stringify({games:63,perfect:perfect.points,wrongChampion:1600,progression,final,standings:ranked.map(r=>({player:r.player,points:r.points,rank:r.rank,tieDistance:r.tieDistance}))},null,2));console.log('PASS 2025 real results: 63 games, six rounds, 1920 perfect, 1600 wrong champion, 128 tiebreaker and rankings.');
