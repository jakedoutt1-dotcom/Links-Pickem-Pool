import {FREE_GAME_TESTING,FREE_HOST_GAME_TESTING} from './testing-access.js';
import {requirePartyPass,partySession} from './party-access.js';
import {hostAccess,hostBillingEnabled} from './trivia-host-billing.js';
// Creation only: invited guests, active rooms and practice are never paywalled.
export async function pokerCreateAccess(request,env,mode,paypal){
 if(mode==='practice')return null;
 if(mode!=='tournament')return requirePartyPass(request,env);
 // Preserve the testing rollout until hosted checkout has been enabled.
 if(FREE_GAME_TESTING&&!hostBillingEnabled(env))return null;
 const session=await partySession(request,env.DB);
 if(FREE_HOST_GAME_TESTING){if(session)return null;return Response.json({error:'Sign in or verify your email to host a poker tournament. Hosting is free during the promotion.',code:'POKER_HOST_IDENTITY_REQUIRED',url:'/new-build/trivia-host-pass.html?game=poker'},{status:401,headers:{'Cache-Control':'no-store'}})}
 if(session&&await hostAccess(env,session.email,paypal))return null;
 return Response.json({error:'Hosted poker tournaments need a Hosted Event Pass or a complimentary host grant. Regular poker with friends uses the Game Pass. Guests join free.',code:'POKER_HOST_REQUIRED',url:'/new-build/trivia-host-pass.html?game=poker'},{status:402,headers:{'Cache-Control':'no-store'}});
}
