import {accountSession} from '../../lib/commissioner-account.js';
export async function onRequest({request,env}){
 if(request.method!=='GET')return Response.json({error:'Method not allowed'},{status:405});
 const account=await accountSession(request,env.DB);
 return Response.json({signedIn:!!account,identity:!!account?.identity,email:account?.email||'',displayName:account?.displayName||''},{headers:{'Cache-Control':'no-store'}});
}
