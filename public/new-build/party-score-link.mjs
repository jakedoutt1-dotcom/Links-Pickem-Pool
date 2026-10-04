// Account opt-in is created only on the scoreboard. Playing as a guest stays free.
const attempted=new Set();
export async function rememberPartySeat(game,room,token){
 const account=localStorage.getItem('links-account-token');if(!account||!token||attempted.has(room))return;attempted.add(room);
 try{const r=await fetch('./api/party-scoreboard',{method:'POST',headers:{'Content-Type':'application/json','x-links-account':account},body:JSON.stringify({action:'link',seats:[{game,room,token}]})});if(!r.ok&&r.status>=500)attempted.delete(room)}catch{attempted.delete(room)}
}
