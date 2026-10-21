import {isQuickCase} from '../../lib/last-alibi-midnight.js';
const xml=s=>String(s??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const response=(body,status=200)=>new Response('<?xml version="1.0" encoding="UTF-8"?><Response>'+body+'</Response>',{status,headers:{'Content-Type':'text/xml; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const say=s=>'<Say voice="alice">'+xml(s)+'</Say>';
const end=s=>response(say(s)+'<Hangup/>');
export async function voiceSignature(url,params,token){let message=url;for(const key of [...new Set(params.keys())].sort())for(const value of params.getAll(key).sort())message+=key+value;const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(token),{name:'HMAC',hash:'SHA-1'},false,['sign']);const bytes=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(message)));return btoa(String.fromCharCode(...bytes))}
const equal=(a,b)=>{if(typeof a!=='string'||a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0};
const gather=(url,digits,prompt)=>'<Gather input="dtmf" numDigits="'+digits+'" finishOnKey="#" timeout="10" method="POST" action="'+xml(url)+'">'+say(prompt)+'</Gather>'+say('No code received. Goodbye.')+'<Hangup/>';
export async function mysteryPhoneRequest({request,env},services={}){try{
 if(request.method!=='POST')return response(say('This is the Last Alibi incoming call service.')+'<Hangup/>',405);
 if(!env.DB||!/^\+[1-9]\d{7,14}$/.test(env.LAST_ALIBI_CLUE_PHONE||'')||!env.TWILIO_AUTH_TOKEN)return end('The case archive phone line is not connected yet.');
 if(!(request.headers.get('Content-Type')||'').startsWith('application/x-www-form-urlencoded'))return response('<Hangup/>',415);
 const raw=await request.text();if(raw.length>12000)return response('<Hangup/>',413);const params=new URLSearchParams(raw),expected=await voiceSignature(request.url,params,env.TWILIO_AUTH_TOKEN);
 if(!equal(request.headers.get('X-Twilio-Signature'),expected)||env.TWILIO_ACCOUNT_SID&&params.get('AccountSid')!==env.TWILIO_ACCOUNT_SID||params.get('To')!==env.LAST_ALIBI_CLUE_PHONE)return response('<Hangup/>',403);
 const url=new URL(request.url),base=url.origin+url.pathname,step=url.searchParams.get('step'),digits=params.get('Digits')||'',now=services.now?.()??Date.now();
 if(!step)return response(gather(base+'?step=code',8,'Last Alibi case archive. Enter the eight digit access code shown in your game, followed by the pound key.'));
 const access=step==='code'?digits:url.searchParams.get('access')||'';
 if(!/^\d{8}$/.test(access))return end('That case access code was not recognized. Check the code in your game.');
 const entry=await env.DB.prepare('SELECT room,seat,expires FROM links_mystery_phone_access WHERE code=? AND expires>?').bind(access,now).first();if(!entry)return end('That access code has expired or is not available. Return to your game for a new code.');
 if(step==='code')return response(gather(base+'?step=clue&access='+access,4,'Access accepted. Enter the four digit archive extension found in your evidence.'));
 if(step!=='clue'||!/^\d{4}$/.test(digits))return end('That extension was not recognized. Inspect the evidence and call again.');
 for(let attempt=0;attempt<5;attempt++){
  const row=await env.DB.prepare('SELECT * FROM links_mystery_rooms WHERE code=? AND expires>?').bind(entry.room,now).first();if(!row)return end('This case has closed. Return to Last Alibi to begin another case.');
  const s=JSON.parse(row.state),p=s.players?.[entry.seat];if(!isQuickCase(s)||!p||p.away||p.accusation||s.pausedAt||!['investigate','accuse'].includes(s.phase))return end('This recording is not available in your current scene. Return to the active investigation.');
  const known=new Set([...Object.values(p.searched||{}).flat(),...(s.published||[])]),contact=(s.case.contacts||[]).find(c=>c.number===digits&&c.chapter<=s.chapter&&known.has(c.sourceId)),clue=contact&&s.case.evidence.find(e=>e.id===contact.evidenceId&&e.unlock==='phone'&&e.chapter<=s.chapter);
  if(!contact||!clue)return end('No archive recording matches that extension in your current evidence. Inspect the available records and try again.');
  p.searched||={};p.searched[s.chapter]||=[];if(!known.has(clue.id))p.searched[s.chapter].push(clue.id);p.lastCall={number:digits,name:contact.name,transcript:contact.transcript};
  const saved=await env.DB.prepare('UPDATE links_mystery_rooms SET state=?,version=version+1 WHERE code=? AND version=? AND expires>?').bind(JSON.stringify(s),entry.room,row.version,now).run();if(saved.meta?.changes!==1)continue;
  let audio=null;try{const map=JSON.parse(env.LAST_ALIBI_CLUE_RECORDINGS||'{}'),value=map[s.caseId+':'+digits];if(typeof value==='string'){const target=new URL(value,url.origin);if(target.protocol==='https:'&&target.origin===url.origin&&/\.(mp3|wav)$/i.test(target.pathname))audio=target.href}}catch{}
  const recording=audio?'<Play>'+xml(audio)+'</Play>':say(contact.transcript);
  return response(say('Preserved recording. '+contact.name+'.')+recording+say('The transcript is now in your private case notebook. Return to the game to inspect it. Goodbye.')+'<Hangup/>');
 }
 return end('The case file is busy. Please call again shortly.');
 }catch{return end('The archive is temporarily unavailable. Return to the game and try again later.')}}
export const onRequest=mysteryPhoneRequest;
