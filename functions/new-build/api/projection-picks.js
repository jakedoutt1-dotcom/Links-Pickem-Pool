import {publicNFLPicks} from '../../lib/nfl-pick-guard.js';
export async function onRequestGet({request,env}){const q=new URL(request.url).searchParams;return publicNFLPicks(request,env,q.get('pool'),Number(q.get('week')||1))}
