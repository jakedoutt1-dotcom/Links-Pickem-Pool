import {ensureOwner,ownerSession} from '../../lib/owner-auth.js';
import {workbookDownloadActivity} from '../../lib/workbook-download-activity.js';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function onRequest({request,env}) {
  if(request.method!=='GET')return json({error:'Method not allowed.'},405);
  if(!env?.DB)return json({error:'Download activity is temporarily unavailable.'},503);
  try {
    await ensureOwner(env.DB);
    if(!await ownerSession(request,env.DB))return json({error:'Owner sign-in required.'},401);
    return json(await workbookDownloadActivity(env.DB));
  } catch {return json({error:'Download activity could not load. Refresh to try again.'},503);}
}
