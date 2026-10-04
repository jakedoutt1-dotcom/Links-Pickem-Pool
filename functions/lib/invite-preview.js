const games={'trivia-rally':'Trivia Rally','friend-challenge':'Challenge a Friend Trivia','million-point':'Million Point Challenge','dead-air':'Dead Air','say-what':'Say What?!','last-alibi':'Last Alibi','captain-clash':'Captain Clash','sketchy-business':'Sketchy Business','trivia-night':'Trivia Night'};
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function invitePreview(request,response){
 if(request.method!=='GET'||!response.ok||!response.headers.get('Content-Type')?.includes('text/html'))return response;
 const url=new URL(request.url),page=url.pathname.split('/').pop().replace(/\.html$/,''),join=['join','join-pool'].includes(page),game=games[page];
 if(!join&&!game)return response;
 const clean=new URL(url.pathname,url.origin);
 if(join){for(const key of ['qr','invite']){const value=url.searchParams.get(key);if(value&&/^[a-zA-Z0-9-]{10,100}$/.test(value))clean.searchParams.set(key,value)}if(!clean.searchParams.size)return response}
 else {const room=url.searchParams.get('room');if(room&&/^[a-fA-F0-9]{10}$/.test(room))clean.searchParams.set('room',room)}
 const title=join?'Join a LINKS pool':'Join '+game+' on LINKS',description=join?'You are invited! Open your invitation to join the pool and play with your crew.':'Your friends. Your phones. One game. Open the invitation to join '+game+'.',image=url.origin+'/links-small-logo.png';
 let html=await response.text();html=html.replace(/<meta\b[^>]*(?:property|name)=["'](?:og:|twitter:)[^"']*["'][^>]*>/gi,'');
 const tags={'og:type':'website','og:site_name':'LINKS','og:title':title,'og:description':description,'og:url':clean.href,'og:image':image,'og:image:alt':'LINKS — Picks. Pools. People.','twitter:card':'summary','twitter:title':title,'twitter:description':description,'twitter:image':image};
 html=html.replace(/<\/head>/i,Object.entries(tags).map(([key,value])=>'<meta '+(key.startsWith('og:')?'property':'name')+'="'+key+'" content="'+escape(value)+'">').join('')+'</head>');
 const headers=new Headers(response.headers);headers.delete('Content-Length');headers.delete('ETag');headers.set('Cache-Control','private, no-store');headers.set('Referrer-Policy','same-origin');
 return new Response(html,{status:response.status,headers});
}
