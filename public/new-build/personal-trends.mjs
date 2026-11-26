const nameKey=v=>String(v||'').trim().toLowerCase();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function summarizeTrends(history,player){
 const totals=new Map(),periods=[];let best=null;
 for(const item of [...history].sort((a,b)=>String(a.period).localeCompare(String(b.period)))){
  const rows=item.rows||[],mine=rows.find(r=>nameKey(r.player)===nameKey(player));
  for(const row of rows){const key=nameKey(row.player),old=totals.get(key)||0;totals.set(key,old+Number(row.wins||0));}
  if(!mine)continue;
  const wins=Number(mine.wins||0),losses=Number(mine.losses||0),count=wins+losses;
  if(!count)continue;
  const score=totals.get(nameKey(player))||0,rank=1+[...totals.values()].filter(n=>n>score).length;
  const period={period:item.period,label:item.label,wins,losses,accuracy:100*wins/count,rank,complete:!!item.complete,won:!!item.complete&&(item.winners||[]).some(n=>nameKey(n)===nameKey(player))};
  periods.push(period);if(period.complete&&(!best||period.accuracy>best.accuracy))best=period;
 }
 const wins=periods.reduce((n,p)=>n+p.wins,0),losses=periods.reduce((n,p)=>n+p.losses,0);
 let streak=0;for(const p of periods.filter(p=>p.complete).reverse()){if(!p.won)break;streak++;}
 return {periods,wins,losses,accuracy:wins+losses?100*wins/(wins+losses):null,best,streak,rank:periods.at(-1)?.rank??null,players:totals.size};
}
function chart(periods,metric,title){
 const max=metric==='accuracy'?100:Math.max(1,...periods.map(p=>p.rank)),count=periods.length;
 const x=i=>count===1?300:40+i*520/(count-1),y=value=>metric==='accuracy'?200-value/100*160:40+(value-1)/Math.max(1,max-1)*160;
 const points=periods.map((p,i)=>x(i)+','+y(p[metric])).join(' ');
 return '<section class="trend-panel"><h3>'+title+'</h3><svg viewBox="0 0 600 250" role="img" aria-label="'+title+'. Exact values appear in the table below."><path d="M40 35V205H570" fill="none" stroke="#577381"/><polyline points="'+points+'" fill="none" stroke="#e8bf68" stroke-width="3"/>'+periods.map((p,i)=>'<circle cx="'+x(i)+'" cy="'+y(p[metric])+'" r="5" fill="#8fe3ce"><title>'+esc(p.label)+': '+(metric==='accuracy'?p.accuracy.toFixed(1)+'%':'#'+p.rank)+'</title></circle>').join('')+'<text x="40" y="232">'+esc(periods[0].label)+'</text><text x="560" y="232" text-anchor="end">'+esc(periods.at(-1).label)+'</text><text x="8" y="42">'+(metric==='accuracy'?'100%':'#1')+'</text></svg></section>';
}
export function renderTrends(history,player,unit='week'){
 const s=summarizeTrends(history,player);
 if(!s.periods.length)return '<section class="trend-panel"><h2>My Trends</h2><p>Your trends will appear after your saved picks have final results. No sample results are included.</p></section>';
 const stat=(title,value,note)=>'<div class="trend-stat"><span>'+title+'</span><strong>'+value+'</strong><small>'+esc(note)+'</small></div>';
 return '<section class="personal-trends"><p class="trend-eyebrow">YOUR PICKS. YOUR PROGRESS.</p><h2>'+esc(player)+'\'s Trends</h2><p>Final results only. A '+unit+' still in progress is labeled below. Rank uses total correct picks; ties share rank.</p><div class="trend-stats">'+stat('Overall record',s.wins+'-'+s.losses,s.accuracy.toFixed(1)+'% correct')+stat('Pool rank','#'+s.rank,'Among '+s.players+' players')+stat('Best completed '+unit,s.best?esc(s.best.label):'Pending',s.best?s.best.accuracy.toFixed(1)+'% correct':'No completed '+unit+' yet')+stat('Winning '+unit+' streak',s.streak,'Consecutive completed '+unit+' wins, including ties')+'</div><div class="trend-charts">'+chart(s.periods,'accuracy','Accuracy over time')+chart(s.periods,'rank','Cumulative pool rank')+'</div><details class="trend-panel" open><summary>See the numbers</summary><div class="trend-table"><table><thead><tr><th>'+esc(unit==='day'?'Day':'Week')+'</th><th>Record</th><th>Accuracy</th><th>Pool rank</th><th>Status</th></tr></thead><tbody>'+s.periods.map(p=>'<tr><th>'+esc(p.label)+'</th><td>'+p.wins+'-'+p.losses+'</td><td>'+p.accuracy.toFixed(1)+'%</td><td>#'+p.rank+'</td><td>'+(p.complete?'Complete':'In progress')+'</td></tr>').join('')+'</tbody></table></div></details><p class="trend-note">Favorite/underdog and home/away breakdowns are not available in this first version.</p></section>';
}
