import assert from 'node:assert/strict';
import {publicInvite,smsInvite} from '../public/new-build/invite-share.mjs';
import {invitePreview} from '../functions/lib/invite-preview.js';
const base='https://linkspickempools.com/new-build/';
assert.equal(publicInvite('./dead-air.html?room=ABCDEF1234&token=secret&display=host#display=private',base),base+'dead-air.html?room=ABCDEF1234');
assert.throws(()=>publicInvite('https://evil.example/join?qr=secret',base));assert.throws(()=>publicInvite('./dead-air.html',base));
assert.equal(smsInvite('Join LINKS!\n'+base,true),'sms:&body='+encodeURIComponent('Join LINKS!\n'+base));assert.equal(smsInvite('Hello',false),'sms:?body=Hello');
for(const page of ['trivia-rally','friend-challenge','million-point','dead-air','say-what','last-alibi','captain-clash','sketchy-business','trivia-night','join']){
 const u=base+page+'.html?'+(page==='join'?'qr=abcdefghij':'room=ABCDEF1234')+'&display=PRIVATE&token=SECRET';
 const r=await invitePreview(new Request(u),new Response('<html><head><title>Original</title></head><body>Play</body></html>',{headers:{'Content-Type':'text/html','ETag':'old','Content-Length':'1'}}));const html=await r.text();assert(html.includes('property="og:image" content="https://linkspickempools.com/links-small-logo.png"'));assert(html.includes(page==='join'?'qr=abcdefghij':'room=ABCDEF1234'));assert(!html.includes('PRIVATE'));assert(!html.includes('SECRET'));assert.equal(r.headers.get('Cache-Control'),'private, no-store');assert.equal(r.headers.get('ETag'),null);assert(html.includes('<body>Play</body>'));
}
const r=await invitePreview(new Request(base+'nfl.html'),new Response('unchanged',{headers:{'Content-Type':'text/html'}}));assert.equal(await r.text(),'unchanged');
console.log('PASS iPhone/Android SMS URLs, public join links, all nine room previews and pool preview, unchanged destination, private data stripped.');
