import {poolFor,sessionFor} from '../../lib/college.js';
import {poolGameKeys} from '../../lib/pool-games.js';
import {onRequest as legacy} from '../../api/[[path]].js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const labels={squares:'Squares',props:'Super Bowl Props',playoff:'Playoffs'};
export async function onRequest(context){
 try{return await formatRequest(context)}catch(e){console.error('Football format service:',e.message);return json({error:'This game could not be loaded or saved. Refresh and try again.'},503)}
}
export async function formatRequest(context,dispatch=legacy){
 const {request,env}=context,db=env.DB,url=new URL(request.url);
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 let b={};if(request.method==='POST')try{b=await request.json()}catch{return json({error:'Invalid request.'},400)}
 const game=String(b.game||url.searchParams.get('game')||''),action=String(b.action||url.searchParams.get('action')||'state');
 if(!labels[game])return json({error:'Choose Squares, Props or Playoffs.'},400);
 const pool=await poolFor(db,b.pool||url.searchParams.get('pool')),session=pool&&await sessionFor(request,db,pool.id);
 if(!session?.player_name)return json({error:'Sign in to this pool.'},401);
 const active=(await poolGameKeys(db,pool.id)).includes(game),admin=session.role==='admin',post=request.method==='POST';
 if(post&&!active)return json({error:'This game is read-only. Ask your commissioner to activate it.'},403);
 const call=async(path,body,query={})=>{
  const target=new URL('/api/'+path,url);for(const [k,v] of Object.entries(query))target.searchParams.set(k,String(v));
  const req=new Request(target,{method:body?'POST':'GET',headers:request.headers,...(body?{body:JSON.stringify(body)}:{})});
  return dispatch({...context,request:req});
 };
 if(game==='squares'){
  const allowed=post?['boards','claim','unclaim','draw','paid','delete']:['state','schedule'];
  if(!allowed.includes(action))return json({error:'Unsupported Squares action.'},400);
  if(post&&!['claim','unclaim'].includes(action)&&!admin)return json({error:'Commissioner only.'},403);
  const week=Number(b.week||url.searchParams.get('week')||1);
  if(action==='schedule'||action==='boards'){if(!Number.isInteger(week)||week<1||week>22)return json({error:'Choose a valid NFL week.'},400)}
  if(action==='boards'){
   for(const key of ['price','payoutQ1','payoutHalf','payoutQ3','payoutFinal'])if(!Number.isFinite(Number(b[key]??0))||Number(b[key]??0)<0||Number(b[key]??0)>100000)return json({error:'Enter nonnegative amounts up to 100,000.'},400);
  }
  const response=await call('squares/'+action,post?b:null,{week}),data=await response.json();
  return json({...data,game,active,role:session.role,viewer:session.player_name},response.status);
 }
 const key='game_settings_'+game,row=await db.prepare('SELECT value FROM pool_settings WHERE pool_id=? AND key=?').bind(pool.id,key).first(),raw=row?.value||'{}',settings=JSON.parse(raw),version=settings.linksRevision||'';
 if(!post){
  if(action!=='state')return json({error:'Unsupported action.'},400);
  const stateResponse=await call('special/state',null,{gameType:game}),state=await stateResponse.json();if(!stateResponse.ok)return json(state,stateResponse.status);
  if(game==='props'){
   const deadline=Date.parse(settings.lockTime||settings.deadline||settings.eventDate||''),locked=Number.isFinite(deadline)&&Date.now()>=deadline;
   const visible={...state.settings};if(!admin&&!locked)delete visible.officialAnswers;
   if(!admin&&locked)visible.officialAnswers=settings.officialAnswers||'';
   return json({...state,settings:visible,locked,active,role:session.role,viewer:session.player_name,game,version,scores:locked?state.scores:[]});
  }
  const week=Number(url.searchParams.get('week')||19);if(![19,20,21,22].includes(week))return json({error:'Choose a postseason round.'},400);
  const slateResponse=await call('special/nfl-week',null,{gameType:game,week}),slate=await slateResponse.json();if(!slateResponse.ok)return json(slate,slateResponse.status);
  const history=(state.history||[]).filter(r=>r.playerName===session.player_name),entry=history.find(r=>Number(r.periodKey)===week)?.entry||{},submittedAt=history.find(r=>Number(r.periodKey)===week)?.submittedAt||null;
  const first=Math.min(...(slate.games||[]).map(g=>Date.parse(g.kickoff))),locked=!slate.games?.length||!Number.isFinite(first)||Date.now()>=first||(slate.games||[]).some(g=>g.completed);
  return json({...state,game,role:session.role,viewer:session.player_name,active,week,games:slate.games||[],myEntry:entry,mySubmittedAt:submittedAt,locked,version});
 }
 if(action==='settings'||action==='grade'){
  if(!admin)return json({error:'Commissioner only.'},403);
  if(b.version!==version)return json({error:'Settings changed elsewhere. Refresh before saving.'},409);
  // Ensure legacy tables exist before checking for entries.
  const stateResponse=await call('special/state',null,{gameType:game});if(!stateResponse.ok)return stateResponse;
  const state=await stateResponse.json();let next={...settings,linksRevision:crypto.randomUUID(),linksFormat:true};
  if(action==='settings'){
   if(state.entryCount>0)return json({error:'Rules and questions are fixed after the first entry. Existing entries are preserved.'},409);
   if(game==='props'){
    const questions=Array.isArray(b.questions)?b.questions:[],deadline=Date.parse(b.deadline);
    if(!Number.isFinite(deadline)||deadline<=Date.now())return json({error:'Set a future deadline.'},400);
    if(!questions.length||questions.length>50)return json({error:'Add between 1 and 50 questions.'},400);
    const clean=questions.map(q=>({text:String(q.text||'').trim(),options:Array.isArray(q.options)?q.options.map(x=>String(x).trim()):[]}));
    if(clean.some(q=>!q.text||q.text.length>200||/[\r\n]/.test(q.text)||q.options.length<2||q.options.length>8||q.options.some(v=>!v||v.length>100||/[\r\n]/.test(v))||new Set(q.options.map(v=>v.toLowerCase())).size!==q.options.length))return json({error:'Each question needs 2–8 different nonblank choices.'},400);
    const points=Number(b.points);if(!Number.isInteger(points)||points<1||points>100)return json({error:'Points per answer must be 1–100.'},400);
    next={...next,propQuestions:clean.map(q=>q.text).join('\n'),propOptions:clean.map(q=>q.options),pointsPerQuestion:points,deadline:new Date(deadline).toISOString(),lockTime:new Date(deadline).toISOString(),officialAnswers:''};
   }else{
    for(const k of ['wildCardPoints','divisionalPoints','conferencePoints','superBowlPoints']){const n=Number(b[k]);if(!Number.isInteger(n)||n<1||n>100)return json({error:'Round points must be whole numbers from 1–100.'},400);next[k]=n}
   }
  }else{
   if(game!=='props')return json({error:'Playoff winners come from final NFL results.'},400);
   const deadline=Date.parse(settings.lockTime||settings.deadline||settings.eventDate||'');
   if(!Number.isFinite(deadline)||Date.now()<deadline)return json({error:'Grade answers after the entry deadline.'},409);
   const questions=String(settings.propQuestions||'').split(/\r?\n/).filter(x=>x.trim()),answers=Array.isArray(b.answers)?b.answers:[];
   if(!questions.length||answers.length!==questions.length||answers.some((x,i)=>typeof x!=='string'||!x.trim()||x.length>300||/[\r\n]/.test(x)||settings.propOptions?.[i]?.length&&!settings.propOptions[i].includes(x)))return json({error:'Choose an official answer for every question.'},400);
   next.officialAnswers=answers.join('\n');
  }
  const freeze=action==='settings'?" AND NOT EXISTS(SELECT 1 FROM special_game_entries WHERE pool_id=? AND game_type=?)":"";
  const stmt=db.prepare('INSERT INTO pool_settings(pool_id,key,value) SELECT ?,?,? WHERE 1=1'+freeze+' ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value WHERE pool_settings.value=?'+freeze);
  const args=[pool.id,key,JSON.stringify(next),...(action==='settings'?[pool.id,game]:[]),raw,...(action==='settings'?[pool.id,game]:[])],saved=await stmt.bind(...args).run();
  if(!saved.meta?.changes)return json({error:'Settings or entries changed. Refresh before saving.'},409);
  return json({success:true});
 }
 if(action==='entry'){
  if((b.version||'')!==version)return json({error:'The questions or scoring changed. Refresh before submitting.'},409);
  const entry=b.entry&&typeof b.entry==='object'?b.entry:{};
  if(game==='props'&&Array.isArray(settings.propOptions)){
   if(!Array.isArray(entry.answers)||entry.answers.length!==settings.propOptions.length||entry.answers.some((answer,i)=>!settings.propOptions[i].includes(answer)))return json({error:'Answer each question using one of its choices.'},400);
  }
  if(game==='playoff'&&![19,20,21,22].includes(Number(entry.week)))return json({error:'Choose a postseason round.'},400);
  return call('special/entry',{gameType:game,entry,settingsRevision:version});
 }
 return json({error:'Unsupported action.'},400);
}
