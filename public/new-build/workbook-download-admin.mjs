const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=value=>value?new Date(value).toLocaleString():'Not recorded';
export async function loadWorkbookDownloads(target,token) {
  target.textContent='Loading Destiny download activity…';
  try {
    const response=await fetch('./api/workbook-download-activity',{headers:{Authorization:'Bearer '+token()},cache:'no-store'});
    const data=await response.json();if(!response.ok)throw Error(data.error||'Download activity could not load.');
    target.innerHTML='<div class="cards">'+['windows','mac'].map(version=>{
      const item=data.summaries.find(r=>r.version===version)||{};
      return '<article class="card"><h3>Destiny · '+(version==='mac'?'Mac':'Windows')+'</h3><p class="tag">'+(item.received?'File received by browser':item.prepared?'Download requested · Receipt unconfirmed':'No downloads recorded yet')+'</p><p>Complete files received: <strong>'+Number(item.received||0)+'</strong></p><p>Last received: '+esc(date(item.lastReceived))+'</p><p>Successful download requests: '+Number(item.prepared||0)+'</p><p>Last request: '+esc(date(item.lastPrepared))+'</p></article>';
    }).join('')+'</div><h3>Recent activity</h3>'+(data.recent.length?'<div class="cards">'+data.recent.map(r=>'<article class="card"><h4>'+esc(r.version==='mac'?'Mac':'Windows')+' download</h4><p>Requested: '+esc(date(r.prepared_at))+'</p><p>Browser received: '+esc(r.received_at?date(r.received_at):'Not confirmed')+'</p></article>').join('')+'</div>':'<p>No downloads recorded since tracking was added.</p>');
  } catch(error) {target.textContent=error.message||'Download activity could not load. Refresh to try again.';}
}
