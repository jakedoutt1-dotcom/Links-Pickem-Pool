import {submitCorrection} from '../../lib/pick-corrections.js';
import {commissionerSession} from '../../lib/commissioner-auth.js';
import {weekGames} from './compare-picks.js';
const json=(d,s=200)=>Response.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
const norm=v=>({WAS:'WSH',JAC:'JAX',LA:'LAR'}[String(v||'').toUpperCase()]||String(v||'').toUpperCase());
export async function onRequest({request,env}){
 const db=env.DB;if(!db)return json({error:'Database unavailable'},503);const s=await commissionerSession(request,db);if(!s)return json({error:'Commissioner sign-in required'},403);
 let b={};if(request.method==='POST')try{b=await request.json()}catch{return json({error:'Invalid request'},400)}
 const week=Number(new URL(request.url).searchParams.get('week')||b.week);if(!Number.isInteger(week)||week<1||week>22)return json({error:'Choose a valid NFL week'},400);
 let games;try{games=await weekGames(week)}catch{return json({error:'NFL schedule unavailable. Please try again.'},502)}
 if(request.method==='GET'){const player=new URL(request.url).searchParams.get('player');let picks=[],tie=null;if(player){picks=(await db.prepare("SELECT game_index,team FROM pool_picks WHERE pool_id=? AND sport='nfl' AND week=? AND lower(player_name)=lower(?)").bind(s.pool_id,week,player).all()).results||[];tie=(await db.prepare("SELECT guess FROM pool_ties WHERE pool_id=? AND sport='nfl' AND week=? AND lower(player_name)=lower(?)").bind(s.pool_id,week,player).first())?.guess??null}const settings=(await db.prepare('SELECT key,value FROM pool_settings WHERE pool_id=?').bind(s.pool_id).all()).results||[];const values=Object.fromEntries(settings.map(x=>[x.key,x.value]));return json({games,picks,tie,commissionerEmail:values.commissioner_email||'',rules:values.rules||''})}
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 return submitCorrection(db,s,'nfl',week,games,b);
}
