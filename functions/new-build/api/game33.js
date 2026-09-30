import {poolFor,sessionFor} from '../../lib/college.js';
import {poolGameKeys} from '../../lib/pool-games.js';
import {onRequest as legacy} from '../../api/[[path]].js';
export async function onRequest(context){
 const {request,env}=context,url=new URL(request.url),body=request.method==='POST'?await request.clone().json():{},pool=await poolFor(env.DB,body.pool||url.searchParams.get('pool')),s=pool&&await sessionFor(request,env.DB,pool.id);
 if(!s)return Response.json({error:'Sign in to this pool.'},{status:401});
 const action=String(body.action||url.searchParams.get('action')||'');
 if(!(await poolGameKeys(env.DB,pool.id)).includes('33'))return Response.json({error:'Game 33 is not active in this pool.'},{status:403});
 if(request.method==='POST'&&!['settings','random-draw','manual-draw','access','finalize','payout'].includes(action)||request.method==='GET'&&!['','default-week'].includes(action))return Response.json({error:'Unsupported Game 33 action.'},{status:400});
 url.pathname='/api/33'+(action?'/'+action:'');
 const response=await legacy({...context,request:new Request(url,request)});
 if(request.method==='GET'&&response.ok){const data=await response.json();return Response.json({...data,role:s.role},{headers:{'Cache-Control':'no-store'}})}return response;
}
