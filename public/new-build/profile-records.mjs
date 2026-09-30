const same=(a,b)=>String(a||'').toLowerCase()===String(b||'').toLowerCase();
export function recordSummary(game,d,player){
 const row=(d.rows||d.standings||d.scores||[]).find(r=>same(r.player||r.name||r.playerName,player));
 if(game==='nfl')return row?row.wins+' wins · '+row.losses+' losses · '+row.weekWins+' weekly wins'+(d.failedWeeks?.length?' — some weeks unavailable':''):'No graded results available.';
 if(game==='college')return row?'Week '+d.week+': '+row.wins+' wins · '+row.losses+' losses':'No graded results for the selected week.';
 if(game==='survivor')return row?row.wins+' wins · '+row.losses+' lives lost · '+row.status:'No Survivor results available.';
 if(game==='confidence')return row?'Season: '+row.seasonScore+' points':'No graded results available.';
 if(game==='fantasy'||game==='dynasty'){const r=d.league?.standings?.find(r=>same(r.owner,player));return r?r.wins+' wins · '+r.losses+' losses · '+r.ties+' ties · '+r.pf+' points scored (regular season)':'No team results available.'}
 if(game==='march')return d.stats?d.stats.points+' points · '+d.stats.correct+' correct bracket picks':'No bracket results available.';
 if(game==='33'){const weeks=(d.history||[]).filter(h=>h.finalized),wins=weeks.filter(h=>h.winners?.some(w=>same(w.player,player))).length;return weeks.length?wins+' winning weeks · '+weeks.length+' finalized pool weeks':'No finalized weeks available.'}
 if(game==='squares'){const boards=(d.boards||[]).filter(b=>b.status==='FINAL'),wins=boards.flatMap(b=>Object.values(b.winners||{})).filter(w=>w&&same(w.player||w.player_name,player));return boards.length?wins.length+' quarter/final wins across '+boards.length+' finalized boards':'No finalized boards available.'}
 if(game==='masters'||game==='nascar')return row&&row.score!==null?(d.config?.format==='one'?'Season earnings: $':d.config?.format==='simple'?'Finishing-position total: ':'Score: ')+row.score+' · '+(d.config?.title||'Latest event'):'Results pending or no entry for the latest event.';
 return row?row.score+' points · '+(row.status||'Graded results'):'No graded results available.';
}
export async function mountRecords(root,token){
 const section=document.createElement('section');section.innerHTML='<h3>My game records</h3><p>Results in this pool. Expand a game to load its record. Each game uses its own scoring period.</p><p role="status">Loading games…</p>';root.append(section);
 const get=async path=>{const r=await fetch(path,{headers:{Authorization:'Bearer '+token()},cache:'no-store'});if(!r.ok)throw Error('Results unavailable. Open the game or try again.');return r.json()};
 try{const session=await get('/api/session');const pool=session.poolCode;if(!pool)throw Error('Sign in to your pool again.');const data=await get('./api/pool-games?pool='+encodeURIComponent(pool)),id=data.resolvedPoolId||pool;
 section.querySelector('[role=status]').remove();if(!data.games?.length){section.append(document.createTextNode('No active games available.'));return}
 for(const game of data.games){const key=game.key,details=document.createElement('details');details.style.cssText='border:1px solid #315168;border-radius:8px;padding:12px;margin:10px 0';const summary=document.createElement('summary');summary.textContent=game.name;summary.style.cursor='pointer';details.append(summary);const result=document.createElement('p');result.textContent='Expand to load results.';details.append(result);const link=document.createElement('a');link.style.color='#edc466';link.textContent='Open game';const page=({'33':'game33',masters:'golf',march:'march-madness'})[key]||key;link.href='./'+encodeURIComponent(page)+'.html?pool='+encodeURIComponent(id);details.append(link);section.append(details);
 details.ontoggle=async()=>{if(!details.open||details.dataset.loaded)return;details.dataset.loaded='1';result.textContent='Loading results…';try{let path=({nfl:'season-standings',college:'college',survivor:'football',confidence:'football',fantasy:'fantasy',dynasty:'fantasy',march:'march','33':'game33',squares:'pool-format',props:'pool-format',playoff:'pool-format',masters:'event-pool',nascar:'event-pool'})[key];if(!path){result.textContent='Open this game to view its results.';return}const query=new URLSearchParams({pool:id,game:key==='masters'?'golf':key,...(key==='college'?{view:'standings'}:{})});const d=await get('./api/'+path+'?'+query);result.textContent=recordSummary(key,d,session.name)}catch(e){result.textContent=e.message;delete details.dataset.loaded}};
 }
 }catch(e){section.querySelector('[role=status]').textContent=e.message}
}
