import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const cards={'trivia-rally':'trivia-rally-cover-v1.png','friend-challenge':'challenge-friend-v3.png','million-point':'million-point-studio-v1.png','dead-air':'dead-air-cover-v2.png','last-alibi':'last-alibi-cover-v1.png','captain-clash':'captain-clash-v1.png','trivia-night':'trivia-night-card-v1.png'};
import {publicInvite} from '../public/new-build/invite-share.mjs';
import {invitePreview} from '../functions/lib/invite-preview.js';
const base='https://linkspickempools.com/new-build/';
assert.equal(publicInvite('./dead-air.html?room=ABCDEF1234&token=secret&display=host#display=private',base),base+'dead-air.html?room=ABCDEF1234');
assert.throws(()=>publicInvite('https://evil.example/join?qr=secret',base));assert.throws(()=>publicInvite('./dead-air.html',base));
for(const page of ['trivia-rally','friend-challenge','million-point','dead-air','say-what','last-alibi','captain-clash','sketchy-business','trivia-night','join']){
 const u=base+page+'.html?'+(page==='join'?'qr=abcdefghij':'room=ABCDEF1234')+'&display=PRIVATE&token=SECRET';
 const r=await invitePreview(new Request(u),new Response('<html><head><title>Original</title></head><body>Play</body></html>',{headers:{'Content-Type':'text/html','ETag':'old','Content-Length':'1'}}));const html=await r.text();const image=cards[page]?'/new-build/assets/'+cards[page]:'/links-small-logo.png';assert(html.includes('property="og:image" content="https://linkspickempools.com'+image+'"'));assert(existsSync(new URL('../public'+image,import.meta.url)));assert(html.includes('name="twitter:card" content="'+(cards[page]?'summary_large_image':'summary')+'"'));assert(html.includes(page==='join'?'qr=abcdefghij':'room=ABCDEF1234'));assert(!html.includes('PRIVATE'));assert(!html.includes('SECRET'));assert.equal(r.headers.get('Cache-Control'),'private, no-store');assert.equal(r.headers.get('ETag'),null);assert(html.includes('<body>Play</body>'));
}
const r=await invitePreview(new Request(base+'nfl.html'),new Response('unchanged',{headers:{'Content-Type':'text/html'}}));assert.equal(await r.text(),'unchanged');
console.log('PASS public join links, all nine room previews and pool preview, unchanged destination, private data stripped.');
