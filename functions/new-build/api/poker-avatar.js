export async function onRequest({request,env}){
 if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405});
 const id=new URL(request.url).searchParams.get('id');
 if(!/^[a-f0-9-]{36}$/.test(id||''))return new Response(null,{status:404});
 try{const row=await env.DB.prepare('SELECT data FROM links_poker_avatars WHERE id=? AND expires>?').bind(id,Date.now()).first();if(!row)return new Response(null,{status:404});return new Response(request.method==='HEAD'?null:new Uint8Array(row.data),{headers:{'Content-Type':'image/jpeg','X-Content-Type-Options':'nosniff','Cache-Control':'public,max-age=300','Content-Security-Policy':"default-src 'none'"}})}catch{return new Response(null,{status:404})}
}
