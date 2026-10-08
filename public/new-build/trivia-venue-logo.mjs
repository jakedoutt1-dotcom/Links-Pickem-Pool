import {nearby} from './partner-match.mjs';
const attempts=new Map();
export async function locateTriviaVenue(room,authorization){
 if(!room||!navigator.geolocation||Date.now()-(attempts.get(room)||0)<60000)return;
 attempts.set(room,Date.now());
 try{
  if(localStorage.getItem('links-partner-location')==='no')return;
  const headers={'Content-Type':'application/json',Authorization:'Bearer '+authorization,'x-links-account':localStorage.getItem('links-account-token')||''};
  const current=await fetch('./api/venue-scoreboard?'+new URLSearchParams({game:'trivia-night',room}),{headers,cache:'no-store'});if(!current.ok)return;
  const info=await current.json();if(info.venue||!info.canChoose)return;
  const position=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,maximumAge:60000,timeout:12000}));
  const coords={latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy};
  const r=await fetch('./api/partners?public=1',{cache:'no-store'});if(!r.ok)return;
  const match=nearby((await r.json()).partners,coords);if(!match.certain)return;
  await fetch('./api/venue-scoreboard',{method:'POST',headers,body:JSON.stringify({game:'trivia-night',room,partner:match.candidates[0].id,coords})});
 }catch{/* Unavailable or ambiguous GPS must never display the wrong venue. */}
}
