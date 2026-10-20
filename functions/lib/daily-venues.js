import {ensurePartners} from './partners.js';
const initialized=new WeakMap();
export async function ensureVenueDirectory(db){if(!initialized.has(db))initialized.set(db,ensurePartners(db).catch(e=>{initialized.delete(db);throw e}));await initialized.get(db)}
export async function activeDailyVenues(db){await ensureVenueDirectory(db);return (await db.prepare('SELECT id,name,logo FROM links_partners WHERE active=1 ORDER BY name').all()).results}
export function venueSnapshot(state){const v=state?.venue;return v&&typeof v.id==='string'&&typeof v.name==='string'?{id:v.id,name:v.name,logo:typeof v.logo==='string'?v.logo:''}:null}
export function rankRows(rows){let score=null,rank=0;return rows.map((row,index)=>{if(row.score!==score){score=row.score;rank=index+1}return {...row,rank}})}
export async function venueBoard(db,day,period,venueId){
 const active=await activeDailyVenues(db),where=period==='today'?' AND a.day=?':'',args=period==='today'?[day]:[];
 // Aggregate in D1, keeping full attempt state and private owners out of Worker memory.
 // SQLite's single MIN(day) selects snapshot metadata from an earliest qualifying row.
 const venueStandings=(await db.prepare(`SELECT json_extract(COALESCE(json_extract(a.state,'$.best'),a.state),'$.venue.id') AS id,json_extract(COALESCE(json_extract(a.state,'$.best'),a.state),'$.venue.name') AS name,json_extract(COALESCE(json_extract(a.state,'$.best'),a.state),'$.venue.logo') AS logo,MIN(a.day) AS firstDay,SUM(a.score) AS score,COUNT(DISTINCT a.owner) AS players,COUNT(*) AS plays FROM links_daily_attempts a WHERE a.completed=1${where} AND json_extract(COALESCE(json_extract(a.state,'$.best'),a.state),'$.venue.id') IS NOT NULL GROUP BY json_extract(COALESCE(json_extract(a.state,'$.best'),a.state),'$.venue.id') ORDER BY score DESC,name`).bind(...args).all()).results.map(({firstDay,...row})=>row);
 const venueMap=new Map(active.map(v=>[v.id,{...v,active:true}]));for(const v of venueStandings)if(!venueMap.has(v.id))venueMap.set(v.id,{id:v.id,name:v.name,logo:v.logo,active:false});const venues=[...venueMap.values()].sort((a,b)=>a.name.localeCompare(b.name));
 let selectedVenue=venueId?venues.find(v=>v.id===venueId)||null:null;
 if(venueId&&!selectedVenue){const historical=await db.prepare(`SELECT json_extract(COALESCE(json_extract(a.state,'$.best'),a.state),'$.venue.id') AS id,json_extract(COALESCE(json_extract(a.state,'$.best'),a.state),'$.venue.name') AS name,json_extract(COALESCE(json_extract(a.state,'$.best'),a.state),'$.venue.logo') AS logo FROM links_daily_attempts a WHERE a.completed=1${where} AND json_extract(COALESCE(json_extract(a.state,'$.best'),a.state),'$.venue.id')=? ORDER BY a.day,a.id LIMIT 1`).bind(...args,venueId).first();selectedVenue=historical?{...historical,active:false}:null}
 const filtered=venueId?" AND json_extract(COALESCE(json_extract(a.state,'$.best'),a.state),'$.venue.id')=?":'';
 const leaders=(await db.prepare(`SELECT p.id AS profileId,p.name,json_extract(COALESCE(json_extract(a.state,'$.best'),a.state),'$.venue.id') AS venueId,json_extract(COALESCE(json_extract(a.state,'$.best'),a.state),'$.venue.name') AS venueName,MIN(a.day) AS firstDay,SUM(a.score) AS score,COUNT(*) AS plays,SUM(COALESCE(json_extract(COALESCE(json_extract(a.state,'$.best'),a.state),'$.correct'),a.score/100.0)) AS correct FROM links_daily_attempts a JOIN links_daily_profiles p ON p.owner=a.owner WHERE a.completed=1${where}${filtered} GROUP BY p.id,json_extract(COALESCE(json_extract(a.state,'$.best'),a.state),'$.venue.id') ORDER BY score DESC,p.id,venueId LIMIT 100`).bind(...args,...(venueId?[venueId]:[])).all()).results.map(({firstDay,...row})=>row);
 const leaderboard=rankRows(leaders);
 return {period,venues,selectedVenue,leaderboard,venueStandings};
}
