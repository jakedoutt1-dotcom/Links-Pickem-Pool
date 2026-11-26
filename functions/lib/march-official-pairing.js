import {REGIONS} from '../../public/new-build/march-core.mjs';
const cache=new Map();
export function officialPairing(data,season){
 const cs=data?.data?.championships||data?.championships||[],matches=cs.filter(c=>Number(c.year)===season&&c.sportUrl==='basketball-men'&&c.divisionName==='d1');
 if(matches.length!==1)return null;const c=matches[0];
 if(!Array.isArray(c.games)||!Array.isArray(c.regions))return null;
 const regions=new Map();for(const r of c.regions){const name=REGIONS.find(n=>n.toLowerCase()===String(r.title).trim().toLowerCase());if(name)regions.set(String(r.sectionId),name)}
 if(regions.size!==4||new Set(regions.values()).size!==4)return null;
 const games=new Map(c.games.map(g=>[String(g.bracketPositionId),g]));if(games.size!==c.games.length)return null;
 const exits=c.games.filter(g=>regions.has(String(g.sectionId))&&games.has(String(g.victorBracketPositionId))&&!regions.has(String(games.get(String(g.victorBracketPositionId)).sectionId)));
 if(exits.length!==4||new Set(exits.map(g=>regions.get(String(g.sectionId)))).size!==4)return null;
 const semis=[...new Set(exits.map(g=>String(g.victorBracketPositionId)))].sort((a,b)=>Number(a)-Number(b));if(semis.length!==2)return null;
 const targets=semis.map(id=>games.get(id).victorBracketPositionId);if(!targets[0]||String(targets[0])!==String(targets[1])||!games.has(String(targets[0]))||games.get(String(targets[0])).victorBracketPositionId)return null;
 const pairing=[];for(const id of semis){const group=exits.filter(g=>String(g.victorBracketPositionId)===id);if(group.length!==2||!group.some(g=>g.victorGamePosition==='Top')||!group.some(g=>g.victorGamePosition==='Bottom'))return null;group.sort((a,b)=>(a.victorGamePosition==='Top'?0:1)-(b.victorGamePosition==='Top'?0:1));pairing.push(...group.map(g=>regions.get(String(g.sectionId))));}
 return pairing;
}
export async function loadOfficialPairing(season){
 const saved=cache.get(season);if(saved&&Date.now()-saved.at<120000)return saved.pairing;
 const variables={sportUrl:'basketball-men',division:1,year:season},extensions={persistedQuery:{version:1,sha256Hash:'e651c2602fb9e82cdad6e947389600c6b69e0e463e437b78bf7ec614d6d15f80'}};
 const url='https://sdataprod.ncaa.com/?'+new URLSearchParams({operationName:'get_championship_ncaa',variables:JSON.stringify(variables),extensions:JSON.stringify(extensions)});
 try{const r=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(8000)});if(!r.ok)return null;const pairing=officialPairing(await r.json(),season);if(pairing)cache.set(season,{at:Date.now(),pairing});return pairing;}catch{return null;}
}
