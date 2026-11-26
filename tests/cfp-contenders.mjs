import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {renderCfpContenders} from '../public/new-build/cfp-contenders.mjs';
test('Approved helmet strip contains twelve distinct schools, real logos, ranks and records with a dated source',()=>{
 const data=JSON.parse(readFileSync(new URL('../public/new-build/assets/cfp-top12-v1.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
 const html=renderCfpContenders(data);assert.equal(data.teams.length,12);assert.equal(new Set(data.teams.map(t=>t.id)).size,12);assert.equal((html.match(/class="helmet-tile"/g)||[]).length,12);assert.match(html,/November 24, 2026/);assert.match(html,/official playoff field has not been selected/);
 for(const team of data.teams){assert(existsSync(new URL('../public/new-build/assets/cfp-helmet-logos/'+team.id+'.png',import.meta.url)));assert(html.includes('Record: '+team.record));assert(html.includes('#'+team.rank));assert(html.includes('helmet-'+team.id));}
 assert.equal((html.match(/cx="63" cy="59"/g)||[]).length,3,'Dark-on-dark school logos have contrast plates');
});
