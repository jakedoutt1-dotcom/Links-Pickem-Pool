const LIVE=new Set(['linkspickempools.com','www.linkspickempools.com','doutt-it-pics-pool.pages.dev']);
export async function testEnvironment(context,next){
 const url=new URL(context.request.url),host=url.hostname;
 const testing=host==='links-pickem-test.pages.dev'||host.endsWith('.links-pickem-test.pages.dev')||host.endsWith('.doutt-it-pics-pool.pages.dev');
 if(!testing)return next(context);
 const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-LINKS-Environment':'test'};
 // Fail closed before application code can access a mistakenly bound live DB.
 try{for(const key of ['DB','LINKS_DB']){const marker=await context.env[key]?.prepare("SELECT name FROM links_environment WHERE name='links-test-data'").first();if(!marker)throw Error('not isolated')}}catch{return new Response('LINKS TEST SITE — isolated test database setup is not complete.',{status:503,headers})}
 if(Object.keys(context.env).some(key=>/RESEND|PAYPAL|SENDGRID|SMTP|MAILGUN|OPENAI|SPORTS_GAME_ODDS/i.test(key)&&context.env[key]))return new Response('Test integrations must be disabled before using this site.',{status:503,headers});
 if(url.pathname==='/__test-status')return Response.json({environment:'test',isolatedDatabase:true,emailEnabled:false,paymentsEnabled:false},{headers});
 const response=await next(context),outHeaders=new Headers(response.headers);
 for(const [key,value] of Object.entries(headers))outHeaders.set(key,value);
 const type=outHeaders.get('content-type')||'';
 if(/text\/html|javascript|application\/json/.test(type)&&context.request.method!=='HEAD'){
 let body=(await response.text()).replace(/https:\/\/(?:www\.)?linkspickempools\.com/g,url.origin).replace(/https:\/\/doutt-it-pics-pool\.pages\.dev/g,url.origin);
 if(type.includes('text/html'))body=body.replace(/<body([^>]*)>/i,'<body$1><aside style="position:relative;z-index:2147483647;padding:10px;text-align:center;background:#ffd34e;color:#111;font:700 14px Arial">TEST SITE — Separate test data. No real emails or payments.</aside>');
 outHeaders.delete('content-length');outHeaders.delete('content-encoding');return new Response(body,{status:response.status,headers:outHeaders});
 }
 const location=outHeaders.get('location');if(location){const target=new URL(location,url);if(LIVE.has(target.hostname))outHeaders.set('location',url.origin+target.pathname+target.search+target.hash)}
 return new Response(response.body,{status:response.status,headers:outHeaders});
}
