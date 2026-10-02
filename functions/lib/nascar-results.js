const normalize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function parseRace(feed,raceId,year){
 const race=feed.weekend_race?.find(r=>String(r.race_id)===String(raceId)&&Number(r.series_id)===1&&Number(r.race_season)===year);
 if(!race||race.inspection_complete!==true)return {results:{},message:'Awaiting official results and completed inspection.'};
 const entries=race.results||[],stages=race.stage_results||[];
 if(!entries.length||entries.length!==Number(race.number_of_cars_in_field)||new Set(entries.map(r=>Number(r.finishing_position))).size!==entries.length)throw Error('Incomplete race classification.');
 const expected=Number(race.stage_4_laps)>0?3:2;
 const stageDataComplete=stages.length===expected&&new Set(stages.map(s=>s.stage_number)).size===expected&&stages.every(s=>Array.isArray(s.results)&&s.results.length>=10);
 const results={};
 for(const r of entries){const finish=Number(r.finishing_position);if(!Number.isInteger(finish)||finish<1||finish>60||!r.driver_fullname)throw Error('Invalid race classification.');
 const stageRows=stages.flatMap(s=>s.results||[]).filter(s=>String(s.driver_id)===String(r.driver_id));
 const validStages=stageDataComplete&&stageRows.every(s=>Number.isInteger(s.stage_points)&&s.stage_points>=0&&s.stage_points<=10);
 const stagePoints=stageRows.reduce((n,s)=>n+s.stage_points,0);
 results[r.driver_fullname]={status:'final',finish,...(validStages?{points:(finish===1?55:Math.max(1,37-finish))+stagePoints}:{} )};
 }
 return {results,message:stageDataComplete?'Official final results · NASCAR':'Final positions available; awaiting complete stage points.'};
}
export async function automaticRace(db,c){
 const id=String(c.raceId||'').replace(/^nascar-/,''),year=Number(c.year);if(!/^\d+$/.test(id)||year!==2026)throw Error('Choose a supported NASCAR race.');
 await db.prepare('CREATE TABLE IF NOT EXISTS links_nascar_results(year INTEGER,race_id TEXT,data TEXT,checked_at INTEGER,PRIMARY KEY(year,race_id))').run();
 const cache=await db.prepare('SELECT data,checked_at FROM links_nascar_results WHERE year=? AND race_id=?').bind(year,id).first();let data;
 if(cache&&Date.now()-cache.checked_at<300000)data=JSON.parse(cache.data);
 else try{const response=await fetch(`https://cf.nascar.com/cacher/${year}/1/${id}/weekend-feed.json`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Race feed unavailable');data=parseRace(await response.json(),id,year);await db.prepare('INSERT INTO links_nascar_results(year,race_id,data,checked_at) VALUES(?,?,?,?) ON CONFLICT(year,race_id) DO UPDATE SET data=excluded.data,checked_at=excluded.checked_at').bind(year,id,JSON.stringify(data),Date.now()).run();}catch(e){if(!cache)throw e;data={...JSON.parse(cache.data),message:'Showing last available official results. Feed temporarily unavailable.'}}
 const results={};for(const f of c.field){const matches=Object.entries(data.results).filter(([n])=>normalize(n)===normalize(f.name));if(matches.length===1){const r=matches[0][1];if(c.format!=='fantasy'||Number.isFinite(r.points))results[f.name]=r}}
 return {results,message:data.message};
}
export function liveRaceSummary(feed,id){
 if(Number(feed.series_id)!==1||String(feed.race_id)!==String(id)||Number(feed.run_type)!==3)return null;
 return {name:String(feed.run_name||''),lap:Number(feed.lap_number)||0,laps:Number(feed.laps_in_race)||0,flag:({1:'Green flag',2:'Caution',3:'Red flag',9:'Race complete'})[feed.flag_state]||'Race update',leaders:(feed.vehicles||[]).filter(v=>Number(v.running_position)>0).sort((a,b)=>a.running_position-b.running_position).slice(0,5).map(v=>({position:Number(v.running_position),name:String(v.driver?.full_name||v.driver?.name||'Driver'),number:String(v.vehicle_number||'')}))};
}
export async function readLiveRace(raceId){
 const id=String(raceId||'').replace(/^nascar-/,'');if(!/^\d+$/.test(id))return null;
 const r=await fetch('https://cf.nascar.com/cacher/live/live-feed.json',{signal:AbortSignal.timeout(5000),cf:{cacheTtl:30,cacheEverything:true}});if(!r.ok)return null;return liveRaceSummary(await r.json(),id);
}
