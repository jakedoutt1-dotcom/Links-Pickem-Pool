// One venue offer across NFL pages. Location matching stays on the device;
// this display never reads or changes picks, standings or pool membership.
import {mountPartners} from './partner-banner.mjs?v=venue-self-service2';
import './pool-google-ad.js?v=nfl-reading1';

export function mountPoolVenueBanner(){
 if(document.getElementById('linksPartnerBanner')||document.getElementById('linksPoolVenueAnchor'))return;
 const page=location.pathname.replace(/\/$/,'').split('/').pop().replace(/\.html$/,'');
 if(!['nfl','nfl-scores','nfl-standings','compare-picks','pick-tools','year-standings','results','my-picks'].includes(page))return;
 const query=new URLSearchParams(location.search);
 if(query.get('view')==='admin'||query.has('demo')||query.has('print'))return;
 try{const pool=JSON.parse(localStorage.getItem('links-current-pool')||'null');if(!pool?.id||!localStorage.getItem('links-player-id'))return}catch{return}
 const main=document.querySelector('main');if(!main)return;
 const anchor=document.createElement('div');anchor.id='linksPoolVenueAnchor';anchor.hidden=true;main.prepend(anchor);
 mountPartners(anchor);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountPoolVenueBanner,{once:true});else mountPoolVenueBanner();
