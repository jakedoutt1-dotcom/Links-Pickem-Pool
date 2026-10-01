export function nearby(partners,coords){
 const {latitude,longitude,accuracy}=coords;if(![latitude,longitude,accuracy].every(Number.isFinite)||accuracy<0)return {candidates:[],certain:false};
 const rad=n=>n*Math.PI/180;
 const candidates=partners.map(p=>{const a=rad(p.latitude-latitude),b=rad(p.longitude-longitude),h=Math.sin(a/2)**2+Math.cos(rad(latitude))*Math.cos(rad(p.latitude))*Math.sin(b/2)**2;return {...p,distance:6371000*2*Math.asin(Math.sqrt(Math.min(1,h)))}}).filter(p=>p.distance<=p.radius+Math.min(accuracy,500)).sort((a,b)=>a.distance-b.distance);
 return {candidates,certain:candidates.length===1&&accuracy<=75&&candidates[0].distance+accuracy<=candidates[0].radius};
}
