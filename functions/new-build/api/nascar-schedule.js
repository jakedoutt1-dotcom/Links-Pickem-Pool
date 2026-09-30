import {commissionerSession} from '../../lib/commissioner-auth.js';
import {poolGameKeys} from '../../lib/pool-games.js';
const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){try{
 const b=request.method==='POST'?await request.json():Object.fromEntries(new URL(request.url).searchParams),pool=Number(b.pool),year=Number(b.year||new Date().getUTCFullYear());
 if(!env.DB||!pool||!await commissionerSession(request,env.DB,pool))return json({error:'Commissioner sign-in required.'},403);
 if(!(await poolGameKeys(env.DB,pool)).includes('nascar'))return json({error:'NASCAR is not enabled in this pool.'},403);
 if(!Number.isInteger(year)||year<2024||year>2100)return json({error:'Choose a valid season.'},400);
 const r=await fetch('https://site.api.espn.com/apis/site/v2/sports/racing/nascar-premier/scoreboard?dates='+year+'&limit=100',{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Race schedule unavailable. Try again.');
 const feed=await r.json(),races=(feed.events||[]).map(e=>({id:String(e.id),name:e.name||e.shortName,date:e.date,status:e.status?.type?.description||'',drivers:[...new Set((e.competitions?.[0]?.competitors||[]).map(c=>c.athlete?.displayName||c.athlete?.fullName).filter(Boolean))]})).filter(e=>e.id&&e.name&&Number.isFinite(Date.parse(e.date))).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));
 if(request.method==='GET'){const row=await env.DB.prepare('SELECT value FROM pool_settings WHERE pool_id=? AND key=?').bind(pool,'game_settings:nascar:current').first();return json({races,current:row?JSON.parse(row.value):null,source:'ESPN NASCAR Cup schedule'});}
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 const race=races.find(e=>e.id===String(b.raceId)),limit=Number(b.pickLimit);
 if(!race)return json({error:'Choose a race from the schedule.'},400);
 if(!Number.isInteger(limit)||limit<1||limit>50)return json({error:'Choose a selection limit from 1 to 50.'},400);
 const drivers=[...new Set((b.drivers||[]).map(x=>String(x).trim()).filter(Boolean))];
 if(!drivers.length||drivers.length>60||drivers.some(x=>x.length>150))return json({error:'Enter the confirmed driver field before publishing.'},400);
 const period='race-'+race.id,settings={title:race.name,lockAt:race.date,settings:{pickLimit:limit,raceId:race.id,year,period},updatedAt:new Date().toISOString()};
 await env.DB.prepare('CREATE TABLE IF NOT EXISTS links_game_options(pool_id INTEGER,game TEXT,period TEXT,value TEXT,PRIMARY KEY(pool_id,game,period,value))').run();
 const key='game_settings:nascar:';
 await env.DB.batch([env.DB.prepare('INSERT INTO pool_settings(pool_id,key,value) VALUES(?,?,?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value').bind(pool,key+period,JSON.stringify(settings)),...drivers.map(d=>env.DB.prepare('INSERT OR IGNORE INTO links_game_options(pool_id,game,period,value) VALUES(?,?,?,?)').bind(pool,'nascar',period,d)),env.DB.prepare('INSERT INTO pool_settings(pool_id,key,value) VALUES(?,?,?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value').bind(pool,key+'current',JSON.stringify(settings))]);
 return json({success:true,settings});
 }catch(e){return json({error:e.message||'NASCAR setup unavailable.'},503)}}
