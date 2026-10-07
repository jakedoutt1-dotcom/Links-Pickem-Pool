export async function verifiedHostPools(accountToken,fetcher=fetch){
 async function request(body){const r=await fetcher('./api/account',{method:body?'POST':'GET',headers:{'x-links-account':accountToken,'Content-Type':'application/json'},cache:'no-store',signal:AbortSignal.timeout(15000),...(body?{body:JSON.stringify(body)}:{})});const j=await r.json();if(!r.ok){const e=Error(j.error||'Could not verify your commissioner account.');e.status=r.status;throw e}return j}
 const account=await request();return {pools:account.pools||[],open:pool=>request({action:'open',pool})};
}
export function saveHostSession(opened,storage=localStorage){
 storage.setItem('links-legacy-token',opened.token);storage.setItem('links-token',opened.token);storage.setItem('links-current-pool',JSON.stringify(opened.pool));storage.setItem('links-player-id',opened.playerId);storage.setItem('links-player-name',opened.playerId);storage.setItem('links-player-role',opened.pool.role);
}
