export function revealState(year,hasField,now=new Date()){
 if(Number(year)!==2027||hasField)return null;
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now).map(p=>[p.type,p.value]));
 const days=Math.max(0,Math.round((Date.UTC(2027,2,14)-Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day)))/86400000));
 return {days,text:days?`${days} day${days===1?'':'s'} to Selection Sunday`:now.getTime()<Date.parse('2027-03-15T05:00:00Z')?'Selection Sunday is today':'Waiting for the official field'};
}
export function renderReveal(element,year,hasField,now=new Date()){
 const state=revealState(year,hasField,now);element.hidden=!state;if(!state){delete element.dataset.signature;return;}const signature=state.text;if(element.dataset.signature===signature)return;element.dataset.signature=signature;
 element.innerHTML='<strong>March Madness field reveal</strong><b>'+state.text+'</b><small>March 14, 2027 · Show time to be announced. Calendar days in Central Time.</small><a href="https://www.ncaa.com/news/basketball-men/article/2026-08-12/2027-selection-sunday-date-schedule-tv-times-march-madness" target="_blank" rel="noopener">Selection Sunday details</a>';
}
