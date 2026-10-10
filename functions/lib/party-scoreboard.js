import {ensureVenue,venueStatements} from './venue-scoreboard.js';
// Add future games here with an explicit outcome rule; raw points never cross games.
export const SCORE_GAMES={
 'mini-golf':{name:'Putt Club',table:'links_mini_golf_rooms',column:'id',storage:'links-putt-seat-'},
 'trivia-rally':{name:'Trivia Rally',table:'links_rally_rooms',storage:'links-rally-seat-'},
 'friend-challenge':{name:'Challenge a Friend Trivia',table:'links_friend_rooms',storage:'links-friend-seat-'},
 'million-point':{name:'Million Point',table:'links_million_rooms',storage:'links-million-'},
 'dead-air':{name:'Dead Air',table:'links_dead_air_rooms',storage:'links-dead-air-'},
 'say-what':{name:'Say What',table:'links_word_rooms',storage:'links-say-'},
 'last-alibi':{name:'Last Alibi',table:'links_mystery_rooms',storage:'links-alibi-'},
 'captain-clash':{name:'Captain Clash',table:'links_caption_rooms',storage:'links-captain-'}
};
export const BOARD_GAMES={...Object.fromEntries(Object.entries(SCORE_GAMES).filter(([id])=>!['say-what','captain-clash'].includes(id))),'goal-line':{name:'Goal Line',solo:true},'two-minute-drill':{name:'Two-Minute Drill',solo:true}};
export async function ensureScoreboard(db){await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS links_party_results(game TEXT NOT NULL,room TEXT NOT NULL,round INTEGER NOT NULL,seat TEXT NOT NULL,score INTEGER NOT NULL,win INTEGER NOT NULL,finished INTEGER NOT NULL,PRIMARY KEY(game,room,round,seat))'),
 db.prepare('CREATE INDEX IF NOT EXISTS links_party_results_period ON links_party_results(finished,game)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_party_guest_profiles(id TEXT PRIMARY KEY, secret_hash TEXT UNIQUE NOT NULL, name TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_party_guest_seats(game TEXT NOT NULL,room TEXT NOT NULL,seat TEXT NOT NULL,guest_id TEXT NOT NULL,PRIMARY KEY(game,room,seat))'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_party_guest_names(game TEXT NOT NULL,room TEXT NOT NULL,round INTEGER NOT NULL,seat TEXT NOT NULL,name TEXT NOT NULL,PRIMARY KEY(game,room,round,seat))'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_party_score_profiles(email TEXT PRIMARY KEY,id TEXT UNIQUE NOT NULL,name TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_party_score_seats(game TEXT NOT NULL,room TEXT NOT NULL,seat TEXT NOT NULL,email TEXT NOT NULL,PRIMARY KEY(game,room,seat),UNIQUE(game,room,email))')
]);}
export function partyFinish(s){return s.phase==='ended'?JSON.parse(JSON.stringify(s)):null;}
export function partyOutcomes(game,s){
 if(!SCORE_GAMES[game]||s?.phase!=='ended'||Object.keys(s.players||{}).length<1)return [];
 const entries=Object.entries(s.players).map(([seat,p])=>({seat,score:Math.max(0,Math.round(Number(game==='million-point'&&s.mode==='duel'?s.duel?.[seat]?.earned:p.score)||0)),progress:Number(p.progress)||0}));
 const multiplayer=(s.participantCount||Object.keys(s.players).length)>=2&&s.mode!=='solo';
 const best=Math.max(...entries.map(p=>p.score)),progress=Math.max(...entries.map(p=>p.progress));
 const finalBest=Math.max(...entries.filter(p=>p.progress===progress).map(p=>p.score));
 return entries.map(p=>({...p,win:Number(multiplayer&&(game==='mini-golf'?p.score===Math.min(...entries.map(x=>x.score)):game==='last-alibi'?(s.cooperative?!!s.caught:p.seat===s.case?.killer?!s.caught:!!s.caught):Array.isArray(s.winners)?s.winners.includes(p.seat):game==='dead-air'?p.progress===progress&&p.score===finalBest:p.score===best))}));
}
// Called in the SAME transaction as the version-checked room write. A retry cannot
// duplicate results, and a failed write cannot publish uncommitted game scores.
export function partyResultStatements(db,game,code,version,encoded,snapshots){
 const table=SCORE_GAMES[game].table,column=SCORE_GAMES[game].column||'code',seen=new Set(),out=[];
 for(const s of snapshots){if(!s)continue;for(const p of partyOutcomes(game,s)){
 const id=s.game+':'+p.seat;if(seen.has(id))continue;seen.add(id);
 const player=s.players?.[p.seat];const guestName=String(player?.name||'Guest').trim().replace(/[<>\\x00-\\x1f]/g,'').slice(0,32)||'Guest';
 out.push(db.prepare('INSERT OR IGNORE INTO links_party_guest_names(game,room,round,seat,name) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM '+table+' WHERE '+column+'=? AND version=? AND state=?)').bind(game,code,s.game,p.seat,guestName,code,version+1,encoded));
 out.push(db.prepare(`INSERT OR IGNORE INTO links_party_results(game,room,round,seat,score,win,finished) SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM ${table} WHERE ${column}=? AND version=? AND state=?)`).bind(game,code,s.game,p.seat,p.score,p.win,Date.now(),code,version+1,encoded));
 }}return out;
}
export async function savePartyRoom(db,game,code,version,s,completed){
 if(completed||s.phase==='ended'){await ensureScoreboard(db);await ensureVenue(db);}
 const encoded=JSON.stringify(s),table=SCORE_GAMES[game].table,column=SCORE_GAMES[game].column||'code';
 const rows=await db.batch([db.prepare(`UPDATE ${table} SET state=?,version=version+1 WHERE ${column}=? AND version=?`).bind(encoded,code,version),...partyResultStatements(db,game,code,version,encoded,[completed,s]),...((game!=='mini-golf'&&(completed||s.phase==='ended'))?venueStatements(db,game,table,code,version,encoded,[completed,s]):[])]);return rows[0];
}
// Calendar periods follow LINKS' Central time, including daylight-saving changes.
export function periodStart(period,now=Date.now()){
 if(period==='all')return 0;
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
 let d=new Date(Date.UTC(+parts.year,+parts.month-1,+parts.day));
 if(period==='month')d=new Date(Date.UTC(+parts.year,+parts.month-1,1));else if(period==='tonight'){}else if(period==='year')d=new Date(Date.UTC(+parts.year,0,1));else d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);
 let t=d.getTime()+6*3600000;
 const hour=Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'numeric',hourCycle:'h23'}).format(t));if(hour===1)t-=3600000;
 return t;
}
