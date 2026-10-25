import {setHistoryAccount} from './card-history.mjs';
export const loginUrl='../links-login.html?next=playmaker';
function headers(){try{const token=localStorage.getItem('links-account-token');return token&&token.length<=500?{'x-links-account':token}:{}}catch{return {}}}
export async function playmakerAccount(){const response=await fetch('/new-build/api/playmaker-public?action=config',{credentials:'same-origin',cache:'no-store',headers:headers()});if(!response.ok)throw Error('Account information is temporarily unavailable.');const data=await response.json();setHistoryAccount(data.signedIn?data.account?.id:null);return data}
export async function requireAccount(){const data=await playmakerAccount();if(!data.signedIn){location.replace(loginUrl);return new Promise(()=>{})}return data}
