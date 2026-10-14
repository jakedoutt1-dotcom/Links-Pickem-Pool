import {updateVenueRoom} from './venue-link.mjs';
// Account opt-in is created only on the scoreboard. Playing as a guest stays free.
const attempted=new Set();
export async function rememberPartySeat(game,room,token){
 try{const recent=JSON.parse(localStorage.getItem('links-recent-games')||'[]');localStorage.setItem('links-recent-games',JSON.stringify([{game,room,at:Date.now()},...recent.filter(r=>r.game!==game||r.room!==room)].slice(0,8)))}catch{}
 updateVenueRoom(game,room,token);
 const account=localStorage.getItem('links-account-token');if(!token||attempted.has(game+':'+room))return;attempted.add(game+':'+room);
 try{const r=await fetch('./api/party-scoreboard',{method:'POST',headers:{'Content-Type':'application/json','x-links-account':account},body:JSON.stringify({action:'link',seats:[{game,room,token}]})});if(!r.ok&&r.status>=500)attempted.delete(game+':'+room)}catch{attempted.delete(game+':'+room)}
}
