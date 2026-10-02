const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function parseGolf(feed,id){
 const event=feed.events?.find(e=>String(e.id)===String(id)&&e.league?.slug==='pga');if(!event)throw Error('Tournament not found.');
 const final=event.status?.type?.completed===true&&event.status?.type?.state==='post';const results={},leaders=[];
 for(const r of event.competitions?.[0]?.competitors||[]){const name=r.athlete?.displayName;if(!name)continue;
 const stat=r.statistics?.find(s=>s.name==='scoreToPar'),raw=stat?.value??r.score?.displayValue;
 const score=raw==='E'?0:typeof raw==='number'?raw:/^[+-]?\d+$/.test(String(raw))?Number(raw):NaN;
 const status=r.status?.type?.name,cut=status==='STATUS_CUT',withdrawn=['STATUS_WITHDRAWN','STATUS_WITHDRAWAL','STATUS_DISQUALIFIED','STATUS_DQ','STATUS_WD'].includes(status);
 if(Number.isFinite(score)&&!cut&&!withdrawn)leaders.push({name,score,position:r.status?.position?.displayName||'—'});
 if(!final)continue;
 if(cut||withdrawn){results[name]={status:cut?'cut':'withdrawn',earnings:0};continue}
 if(status!=='STATUS_FINISH'||!Number.isFinite(score))continue;
 const official=r.statistics?.find(s=>s.name==='officialAmount'),paid=official&&official.displayValue!=='--'&&Number.isFinite(r.earnings)&&r.earnings>=0;
 results[name]={status:'final',score,...(paid?{earnings:r.earnings}:r.amateur===true?{earnings:0}:{})};
 }
 leaders.sort((a,b)=>a.score-b.score);
 return {results,live:{name:event.name,round:event.competitions?.[0]?.status?.period||null,final,leaders:leaders.slice(0,5)},message:final?'Final tournament results · ESPN':'Live golf scores are provisional. Final pool scoring follows tournament completion.'};
}
export async function automaticGolf(db,c){
 const id=String(c.tournamentId||'');if(!/^\d+$/.test(id))throw Error('Select a PGA tournament.');
 await db.prepare('CREATE TABLE IF NOT EXISTS links_golf_results(event_id TEXT PRIMARY KEY,data TEXT,checked_at INTEGER)').run();
 const cached=await db.prepare('SELECT data,checked_at FROM links_golf_results WHERE event_id=?').bind(id).first();let data;
 if(cached&&Date.now()-cached.checked_at<60000)data=JSON.parse(cached.data);
 else try{const r=await fetch('https://site.web.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga&event='+id,{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Golf feed unavailable.');data=parseGolf(await r.json(),id);await db.prepare('INSERT INTO links_golf_results(event_id,data,checked_at) VALUES(?,?,?) ON CONFLICT(event_id) DO UPDATE SET data=excluded.data,checked_at=excluded.checked_at').bind(id,JSON.stringify(data),Date.now()).run();}catch(e){if(!cached)throw e;data={...JSON.parse(cached.data),message:'Last available golf update; feed temporarily unavailable.'}}
 const results={};for(const f of c.field){const matches=Object.entries(data.results).filter(([n])=>normalize(n)===normalize(f.name));if(matches.length===1){const r=matches[0][1];if(c.format!=='one'||Number.isFinite(r.earnings))results[f.name]=r}}
 return {...data,results};
}
