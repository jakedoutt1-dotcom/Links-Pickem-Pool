const games=[["🏈","NFL Pick’em","Straight-up, ATS, Pick X"],["🎓","College Pick’em","Top 25 or custom slate"],["🛡️","Survivor","Lives, rebuys, no-repeat"],["🎯","Confidence","Rank every selection"],["3️⃣","Game 33","Season-long team draw"],["▦","Squares","Any game, auto numbers"],["🏀","March Madness","Bracket + round pools"],["⛳","Golf Majors","Masters + majors"],["🏁","NASCAR","Drivers, groups, stages"],["📈","Margin","Winning margin scoring"],["⭐","Best Bet","Weekly featured selections"],["🏆","Playoff Challenge","Postseason progression"],["5️⃣","Pick 5","Choose your strongest five"],["±","ATS Pick’em","Against-the-spread weekly"],["📊","Margin Pool","Win by the right margin"],["🔢","Rank ’Em","Rank teams, drivers or players"],["⚾","MLB Pick’em","Daily or weekly baseball"],["🏀","NBA Pick’em","Daily slate + playoffs"],["🏒","NHL Pick’em","Daily slate + playoffs"],["⚽","Soccer Pools","World Cup + tournaments"],["🥣","Bowl Challenge","College bowl season"],["🎬","Awards Pool","Custom ballot events"],["🧩","Custom Pool","Build your own event"],["👑","Underdog Pool","Reward upset picks"],["🎟️","Prop Picks","Questions, props + predictions"],["🏈","Touchdown Calls","Choose weekly TD scorers"],["🏒","NHL Survivor","Weekly survival hockey"],["⚾","13-Run Baseball","Complete 0 through 13"],["🏀","Playoff Bracket","NBA / NHL tournament brackets"],["🌍","World Cup Bracket","Group + knockout stages"],["🥇","Olympics Challenge","Custom event predictions"],["🎭","Oscars Pool","Awards-night ballot"],["🧱","Box Pool","Reusable number-grid pools"],["🧪","Pool Lab","Create a custom scoring format"],["🏇","Race Day Pick’em","Pick winners across a race card"],["🏇","Fantasy Stable","Draft horses, jockeys and trainers"],["🌹","Triple Crown Challenge","Derby · Preakness · Belmont"],["👑","Dynasty Football","Contracts, cap, rookies + taxi"],["🏈","Fantasy Redraft","Draft, waivers, trades + playoffs"],["💰","Salary Cap Fantasy","Contracts, dead cap + auctions"],["🪓","Guillotine Fantasy","Lowest score eliminated weekly"],["1️⃣","Start ’Em Once","Use players a limited number of times"],["🏈","NFL Weekly Draft","Draft a fresh lineup each week"],["🏀","NBA Daily Draft","Short-format daily fantasy drafts"],["⚾","MLB Streak","Build the longest hit streak"],["🏎️","Race Pick 5","Pick five finishers each race"],["🏇","Exacta Challenge","Predict first and second"],["🏇","Trifecta Challenge","Predict the top three"],["⛳","Golf One & Done","One golfer each event, no repeats"],["⛳","Golf Pick X","Pick a roster for each tournament"],["🏌️","FedExCup Playoffs","Golf playoff progression"],["⚾","Home Run Pool","Build and manage a weekly slugger lineup"],["🏀","March H2H","Bracket picks in head-to-head matchups"],["🏀","March Survivor","Advance by picking tournament winners"],["🏀","March Pick X","Choose X teams to score through the tournament"],["🏈","Playoff Precision","Predict postseason teams and outcomes"],["🏈","Loser Survivor","Pick the team you expect to lose"],["⚽","Euro Tournament","Group stage plus knockout bracket"]];const activity=[["PICKS","Amanda submitted Week 3","2m"],["INVITE","Chris joined Barnes Family","18m"],["SCORE","NFL standings recalculated","31m"],["ADMIN","Week 4 college slate saved","1h"]];const adminStats=[["Players","64","59 ready"],["Missing picks","5","Send reminder"],["Pending invites","2","Resend"],["Scoring","Healthy","Live feeds"]];const pools=[["🏈","Barnes Family","NFL Pick’em","Week 3 • Picks open","Thursday 7:15 PM"],["🎓","Saturday Crew","College Pick’em","Week 4 • 10 games","Saturday 11:00 AM"],["🛡️","Last One Standing","Survivor","42 alive • 7 picked","Sunday 12:00 PM"]];const NB={version:"0.1.0",events:new EventTarget(),modules:new Map(),state:{view:"home",pool:null,game:null},register(name,api){this.modules.set(name,Object.freeze(api))},emit(type,detail={}){this.events.dispatchEvent(new CustomEvent(type,{detail}))}};Object.freeze(NB.modules);function modal(title,body){document.querySelector("#modal").innerHTML=`<div class="modalback"><div class="modalbox"><h2>${title}</h2>${body}<div class="actions"><button class="ghost" onclick="document.querySelector('#modal').innerHTML=''">CANCEL</button><button class="primary">CONTINUE</button></div></div></div>`}function app(){document.querySelector("#app").innerHTML=`<div class="shell"><header class="top"><div class="brand"><b>LINKS</b> POOLS <small style="display:block;font-size:9px;color:#929dab;letter-spacing:.12em">ALL YOUR POOLS. ALL IN ONE PLACE.</small></div><span class="badge live">● LIVE</span><div class="spacer"></div><button class="ghost" id="messages">🔔</button><div class="avatar">JD</div></header><div class="layout"><aside class="side"><nav class="nav"><button class="active">⌂ &nbsp;Home</button><button>▦ &nbsp;My Pools</button><button>✓ &nbsp;My Picks</button><button>🏆 &nbsp;Results</button><button>✉ &nbsp;Messages</button><button>🔔 &nbsp;Notifications</button><button>⚙ &nbsp;Commissioner</button></nav></aside><main class="main"><section class="hero"><div><div class="eyebrow">SUNDAY COMMAND CENTER</div><h1>Everything that matters.<br>Nothing that doesn't.</h1><div class="muted">Your pools, deadlines, live action and commissioner work in one place.</div></div><button class="primary" id="create">＋ CREATE A POOL</button></section><section class="grid"><div class="card stat"><span class="muted">Active pools</span><strong>3</strong><span class="badge live">All healthy</span></div><div class="card stat"><span class="muted">Picks due</span><strong>1</strong><span class="deadline">Thursday 7:15 PM</span></div><div class="card stat"><span class="muted">Live games</span><strong>4</strong><span class="badge live">Scoring now</span></div><div class="card stat"><span class="muted">Messages</span><strong>2</strong><span class="badge">Unread</span></div><div class="card wide"><div class="section-title"><h2>MY POOLS</h2><button class="ghost">VIEW ALL →</button></div>${pools.map(p=>`<div class="pool"><div class="sport">${p[0]}</div><div class="grow"><b>${p[1]}</b><span class="muted">${p[2]} · ${p[3]}</span></div><div><div class="deadline">${p[4]}</div><span class="badge">OPEN POOL →</span></div></div>`).join("")}</div><div class="card rail"><div class="section-title"><h2>NEEDS ATTENTION</h2></div><div class="attention"><i class="dot"></i><div><b>5 players missing picks</b><div class="muted">Barnes Family · Week 3</div></div></div><div class="attention"><i class="dot"></i><div><b>2 invites pending</b><div class="muted">Resend email or text reminder</div></div></div><div class="attention"><i class="dot"></i><div><b>College slate ready</b><div class="muted">Review 10 selected games</div></div></div><div class="attention"><i class="dot"></i><div><b>Weekly reminder queued</b><div class="muted">Only players missing picks will receive it</div></div></div></div><div class="card wide share-card"><div class="sharecopy"><span>SHAREABLE · AFTER LOCK</span><b>Turn picks, wins and rivalries into clean sports cards.</b><small>Private by default. You choose what leaves LINKS.</small></div><div class="sharepreview"><i>LINKS</i><strong>11–5</strong><span>WEEK 7 · 2ND PLACE</span></div><button>CREATE SHARE CARD ›</button></div><div class="card wide streak-card"><div class="section-title"><h2>FORM & MOMENTUM</h2><span class="badge">PLAYER ANALYTICS</span></div><div class="formrow"><div><small>LAST 5 WEEKS</small><b>W · W · L · W · W</b><span>4–1 form</span></div><div><small>PRIMETIME</small><b>71%</b><span>best split</span></div><div><small>UPSETS</small><b>6</b><span>correct this season</span></div><div><small>STREAK</small><b>3</b><span>current wins</span></div></div></div><div class="card wide pro-card"><div class="section-title"><h2>PRO SPORTS FINISH</h2><span class="badge">NEW DESIGN SYSTEM</span></div><div class="progrid"><div><span>FAST</span><b>Skeleton-first loading</b><small>No stale-week flash before current data arrives</small></div><div><span>CLEAR</span><b>One primary action</b><small>Every screen tells you what matters next</small></div><div><span>TRUST</span><b>Source + audit labels</b><small>Know where results, edits and AI evidence came from</small></div></div></div><div class="card wide legacy-card"><div class="section-title"><h2>LINKS LEGACY</h2><span class="badge">FOREVER HISTORY</span></div><div class="legacygrid"><div><small>CAREER RECORD</small><b>146–82</b><span>64% correct</span></div><div><small>WEEKLY WINS</small><b>7</b><span>2 this season</span></div><div><small>BEST FINISH</small><b>CHAMP</b><span>2025 Barnes Family</span></div><div><small>RIVALRY</small><b>18–14</b><span>vs Mike</span></div></div><button class="legacybtn" data-ai="history">OPEN MY SPORTS HISTORY ›</button></div><div class="card wide recap-card"><div class="section-title"><h2>LINKS RECAP</h2><span class="badge">AI SUMMARY</span></div><div class="recapbody"><div class="recaprank"><small>LAST WEEK</small><strong>2ND</strong><span>11–5 · +4 places</span></div><div class="recapcopy"><b>Your week in 20 seconds</b><p>You nailed the late slate, climbed four spots, and your highest-confidence miss was DAL. Tennessee was your biggest separator from the field.</p><button data-ai="recap">SEE FULL RECAP ›</button></div><div class="recapstats"><span><b>69%</b> accuracy</span><span><b>3</b> unique wins</span><span><b>#2</b> season rank</span></div></div></div><div class="card wide pulse-hero"><div class="pulse-copy"><span>YOUR NIGHT · LIVE</span><h2>EVERY GAME<br><strong>MEANS SOMETHING.</strong></h2><p>LINKS connects the score to your picks, your standings, your rivals and your season—in real time.</p><button data-ai="livehub">ENTER LIVE HUB ›</button></div><div class="pulse-visual"><div class="pulse-ring r1"></div><div class="pulse-ring r2"></div><div class="pulse-core"><small>LIVE IMPACT</small><strong>4</strong><span>POOLS</span></div><div class="pulse-tag t1">▲ +4 PLACES</div><div class="pulse-tag t2">SURVIVOR · ALIVE</div><div class="pulse-tag t3">FANTASY · +8.4</div></div></div><div class="card wide rivalry-card"><div class="rivalry-top"><div><span>RIVALRY WATCH</span><b>Jake vs Mike</b><small>Head-to-head · Week 7</small></div><em>LIVE</em></div><div class="rivalry-score"><div><span>YOU</span><strong>9</strong><small>correct</small></div><div class="versus"><i></i><b>2 GAMES DIFFER</b><i></i><small>TEN + DAL decide it</small></div><div><span>MIKE</span><strong>9</strong><small>correct</small></div></div><button>OPEN MATCHUP ›</button></div><div class="card wide nightboard-card"><div class="nightboard-head"><div><span>LINKS NIGHTBOARD</span><b>Tonight at a glance</b></div><small>YOUR LIVE SPORTS UNIVERSE</small></div><div class="nightboard"><div class="nbgame featured"><span>LIVE · Q3</span><b>TEN <strong>20</strong> — <strong>17</strong> IND</b><small>4 pools · HIGH impact</small></div><div class="nbgame"><span>7:15 PM</span><b>NFL PICK’EM</b><small>1 pick still needed</small></div><div class="nbgame"><span>8:00 PM</span><b>FANTASY</b><small>2 starters tonight</small></div><div class="nbgame"><span>FINAL</span><b>WEEK 7 · 11–5</b><small>2nd place · recap ready</small></div></div></div><div class="card wide picksafe-card"><div class="picksafe-copy"><span>PICK SAFE</span><b>Your picks are saved. No second guessing.</b><small>Every tap auto-saves, shows a timestamp, and rolls into one clean confirmation across your entries.</small></div><div class="saveproof"><i>✓</i><div><b>ALL PICKS SAVED</b><span>Updated 9:42 PM · 3 entries</span></div></div><button>VIEW CONFIRMATION ›</button></div><div class="card wide personal-stream-card"><div class="streamhead"><div><span>MY LINKS</span><b>Your sports world, prioritized.</b></div><div class="streamtabs"><button class="active">FOR YOU</button><button>POOLS</button><button>FANTASY</button><button>LIVE</button></div></div><div class="streamgrid"><button class="streamitem urgent"><i>LOCK</i><p><b>NFL · Nashville Crew</b><span>1 pick missing · 42 min</span></p><em>FINISH ›</em></button><button class="streamitem"><i>LIVE</i><p><b>TEN 20 · IND 17</b><span>4 pools affected · Q3</span></p><em>FOLLOW ›</em></button><button class="streamitem"><i>AI</i><p><b>Dynasty trade review</b><span>Cap + roster impact ready</span></p><em>OPEN ›</em></button><button class="streamitem"><i>W</i><p><b>Week 7 recap</b><span>11–5 · finished 2nd</span></p><em>VIEW ›</em></button></div></div><div class="card wide attention-card"><div class="attention-title"><div><span>NEEDS YOUR ATTENTION</span><b>3 things before tonight</b></div><small>LINKS keeps the urgent stuff together.</small></div><div class="attention-strip"><button><i>01</i><p><b>1 NFL pick missing</b><span>Locks 7:15 PM · finish now</span></p><em>FIX ›</em></button><button><i>02</i><p><b>Survivor pick not submitted</b><span>Team selected · still needs save</span></p><em>SAVE ›</em></button><button><i>03</i><p><b>2 players need a reminder</b><span>Commissioner · one-tap nudge</span></p><em>NUDGE ›</em></button></div></div><div class="card wide ai-gameday-card"><div class="section-title"><h2>AI GAME PLAN</h2><span class="badge live">PERSONALIZED</span></div><div class="gameplan"><div class="gameplanlead"><span>TOP PRIORITY</span><b>Finish the decision that can move you most.</b><small>LINKS ranks actions from your actual pools, deadlines, roster and live situation.</small><button data-ai="gameplan">OPEN MY GAME PLAN ›</button></div><div class="gameplanlist"><div><i>1</i><p><b>NFL Pick’em</b><span>1 pick missing · locks first</span></p><em>NOW</em></div><div><i>2</i><p><b>Dynasty</b><span>Trade offer · roster impact available</span></p><em>REVIEW</em></div><div><i>3</i><p><b>Fantasy</b><span>Flex spot has a higher-upside option</span></p><em>CHECK</em></div></div></div></div><div class="card wide moment-card"><div class="section-title"><h2>BIG MOMENTS</h2><span class="badge live">LIVE STORYLINE</span></div><div class="moments"><div class="moment hot"><span>9:42 PM</span><b>🔥 TEN just flipped your pool</b><small>You jumped 4 places when the lead changed.</small></div><div class="moment"><span>9:31 PM</span><b>👀 Survivor sweat</b><small>3 entries are one score away from elimination.</small></div><div class="moment"><span>9:18 PM</span><b>↗ Mike moved into 1st</b><small>Current projected finish changed after DAL scored.</small></div></div></div><div class="card wide trophy-card"><div class="trophy-copy"><span>LINKS LEGACY</span><b>Every season should leave a record.</b><small>Championships, weekly wins, rivalry records, best finishes and unforgettable runs stay with your profile.</small></div><div class="trophy-stats"><div><strong>3</strong><span>TITLES</span></div><div><strong>18</strong><span>WEEKLY WINS</span></div><div><strong>64%</strong><span>RIVALRY</span></div></div><button>VIEW LEGACY ›</button></div><div class="card wide pool-room-card"><div class="section-title"><h2>POOL ROOM</h2><span class="badge live">LIVE AFTER LOCK</span></div><div class="poolroom"><div class="roomlead"><span>FIELD SPLIT</span><b>TEN 39% · IND 61%</b><small>Your TEN pick is one of the biggest differences in the room.</small></div><div class="heat"><div><span>TEN</span><i style="--w:39%"></i><b>39%</b></div><div><span>IND</span><i style="--w:61%"></i><b>61%</b></div></div><div class="roomchat"><span>POOL ACTIVITY</span><b>Mike moved into 1st</b><small>3 new reactions · 2 min ago</small></div><button>OPEN POOL ROOM ›</button></div></div><div class="card wide commish-week-card"><div class="section-title"><h2>COMMISSIONER WEEK</h2><span class="badge">AUTO PILOT</span></div><div class="weekflow"><div class="done"><i>✓</i><p><b>Slate ready</b><span>16 games loaded</span></p></div><div class="done"><i>✓</i><p><b>Picks open</b><span>Thursday–Monday</span></p></div><div class="active"><i>3</i><p><b>Waiting on picks</b><span>2 reminders queued</span></p></div><div><i>4</i><p><b>Lock & reveal</b><span>Automatic at kickoff</span></p></div><div><i>5</i><p><b>Score & recap</b><span>Automatic after finals</span></p></div></div></div><div class="card wide spotlight-card"><div class="spotcopy"><span>TONIGHT’S SPOTLIGHT</span><b>One game. Four pools. Big consequences.</b><small>TEN vs IND touches Pick’em, Survivor, Fantasy and your live scenario path.</small><button data-ai="spotlight">OPEN GAME CENTER ›</button></div><div class="spotmeter"><small>POOL IMPACT</small><strong>HIGH</strong><div><i></i></div><span>4 linked entries</span></div></div><div class="card wide join-card"><div class="joincopy"><span>INVITE FLOW</span><b>One tap from invite to picks.</b><small>Returning players open the exact pool. New players get a short setup—no hunting for pool names or codes.</small></div><div class="joinsteps"><i>LINK</i><b>→</b><i>JOIN</i><b>→</b><i>PICK</i></div><button>PREVIEW JOIN FLOW ›</button></div><div class="card wide field-card"><div class="section-title"><h2>FIELD INTELLIGENCE</h2><span class="badge live">AFTER LOCK</span></div><div class="fieldintel"><div class="fieldmain"><span>MOST IMPORTANT DIFFERENCE</span><b>You: TEN · Field: IND 61%</b><small>If TEN wins, you pass up to 5 entries.</small></div><div class="fieldstat"><strong>4</strong><span>unique picks</span></div><div class="fieldstat"><strong>2</strong><span>leverage games</span></div><button data-ai="field">OPEN FIELD VIEW ›</button></div></div><div class="card wide exposure-card"><div class="section-title"><h2>MY EXPOSURE</h2><span class="badge">ACROSS LINKS</span></div><div class="exposure"><div><span>TEN</span><b>4 entries</b><small>Heavy exposure tonight</small></div><div><span>DAL</span><b>2 entries</b><small>Mixed positions</small></div><div><span>BUF</span><b>1 entry</b><small>Survivor only</small></div><button data-ai="exposure">VIEW ALL EXPOSURE ›</button></div></div><div class="ambient-stage"><div class="ambient-orb one"></div><div class="ambient-orb two"></div></div><div class="broadcast-rail"><span class="onair"><i></i> LIVE</span><div><b>TEN 20</b><small>Q3 4:21</small></div><div><b>IND 17</b><small>Possession</small></div><div class="railimpact"><small>YOUR POOL IMPACT</small><b>▲ +4 projected places</b></div><button data-ai="scenario">LIVE HUB ›</button></div><div class="stadium-hero"><div class="stadium-copy"><span class="eyebrow">YOUR SPORTS · YOUR POOLS · LIVE</span><h1>GAME NIGHT<br><em>STARTS HERE.</em></h1><p>One personalized command center for every pick, pool, matchup and decision.</p><div class="hero-actions"><button>FINISH MY PICKS</button><button class="ghost" data-ai="brief">ASK LINKS AI</button></div></div><div class="hero-score"><small>LIVE · 4:21 Q3</small><div><b>TEN</b><strong>20</strong></div><i>—</i><div><b>IND</b><strong>17</strong></div><span>Pool impact: HIGH</span></div></div><div class="card wide command-card"><div class="section-title"><h2>NEXT UP</h2><span class="badge">PERSONAL COMMAND CENTER</span></div><div class="nextup"><button><span>01</span><div><b>FINISH NFL PICKS</b><small>1 selection missing · locks in 2h 14m</small></div><em>FINISH ›</em></button><button><span>02</span><div><b>CHECK SURVIVOR</b><small>Your team plays tonight · 11 entries alive</small></div><em>VIEW ›</em></button><button><span>03</span><div><b>DYNASTY DECISION</b><small>Trade offer expires tomorrow</small></div><em>REVIEW ›</em></button></div></div><div class="card wide scenario-card"><div class="section-title"><h2>LIVE SCENARIO ENGINE</h2><span class="badge live">2 GAMES ACTIVE</span></div><div class="scenariohero"><div><span>IF TENNESSEE HOLDS ON</span><b>You jump from #6 → #2</b><small>4 players fall behind you · 1 remaining path to #1</small></div><button data-ai="scenario">EXPLORE PATHS</button></div><div class="paths"><span><i>✓</i> TEN wins</span><span><i>→</i> DAL +3.5</span><span><i>?</i> 47 or fewer points</span></div></div><div class="card wide lock-card"><div class="section-title"><h2>LOCK CENTER</h2><span class="badge live">FAIR PLAY</span></div><div class="lockgrid"><div><span>NEXT LOCK</span><b>2h 14m</b><small>NFL · TEN vs IND</small></div><div><span>RULE STATUS</span><b>FROZEN</b><small>Scoring rules protected after kickoff</small></div><div><span>COMMISSIONER EDITS</span><b>AUDITED</b><small>Every post-lock change is badged + logged</small></div></div></div><div class="card wide social-card"><div class="section-title"><h2>GAME ROOM</h2><span class="badge live">LIVE WITH YOUR POOL</span></div><div class="gameroom"><div class="roommsg"><b>Mike</b><span>That TEN pick just changed everything 👀</span></div><div class="roomreact"><button>🔥 6</button><button>😂 3</button><button>👀 4</button></div><button class="roomjoin">OPEN GAME ROOM ›</button></div></div><div class="card wide pulse-card"><div class="section-title"><h2>POOL PULSE</h2><span class="badge live">LIVE</span></div><div class="pulsegrid"><div><span>FIELD SPLIT</span><b>TEN 64% · IND 36%</b><small>Your pool is leaning Tennessee</small></div><div><span>SWING GAME</span><b>TEN vs IND</b><small>Could move 7 players in standings</small></div><div><span>SURVIVOR</span><b>11 still alive</b><small>3 entries at risk tonight</small></div></div></div><div class="card wide"><div class="section-title"><h2>TONIGHT ON LINKS</h2><span class="livepulse">LIVE</span><span class="badge live">● 4 LIVE</span></div><div class="scorestrip"><div><small>NFL · Q3 4:21</small><b>TEN 20 <em>—</em> IND 17</b></div><div><small>MLB · FINAL</small><b>ATL 6 <em>—</em> NYM 3</b></div><div><small>WNBA · 8:00</small><b>NYL <em>vs</em> LVA</b></div></div></div><div class="card wide"><div class="section-title"><h2>LIVE ACTIVITY</h2><button class="tinybtn">FILTER</button><span class="muted">Automatic · no refresh</span></div>${activity.map(a=>`<div class="feed"><span class="feedtag">${a[0]}</span><div class="grow"><b>${a[1]}</b></div><small>${a[2]}</small></div>`).join("")}</div><div class="card rail"><div class="section-title"><h2>SMART INBOX</h2><span class="badge">3</span></div><div class="autopilot"><span>COMMISSIONER AUTOPILOT</span><b>3 routine jobs handled automatically</b><small>Missing-pick reminder · lock enforcement · final-score grading</small></div><div class="smartinbox"><button><i>!</i><div><b>1 pick missing</b><span>NFL · locks in 2h 14m</span></div><em>FIX ›</em></button><button><i>↗</i><div><b>You moved to #2</b><span>Barnes Family · live standings</span></div><em>VIEW ›</em></button><button><i>✓</i><div><b>Invite accepted</b><span>College Pick’em · 4m ago</span></div><em>OPEN ›</em></button></div></div><div class="card rail gm-card"><div class="section-title"><h2>FRONT OFFICE</h2><span class="badge">DYNASTY</span></div><div class="gmcap"><span>CAP SPACE</span><strong>$27.4M</strong><small>82% committed</small></div><div class="gmgrid"><button data-admin>CONTRACTS</button><button data-admin>TRADE CENTER</button><button data-admin>ROOKIE PICKS</button><button data-admin>FREE AGENCY</button></div></div><div class="card rail"><div class="section-title"><h2>PICK HEALTH</h2><span class="badge live">READY</span></div><div class="healthring"><strong>92%</strong><span>complete</span></div><div class="muted">All but one active entry is submitted. We’ll remind you before the next lock.</div></div><div class="card rail"><div class="section-title"><h2>YOUR WEEK</h2></div><div class="weekscore"><strong>9–3</strong><span class="muted">Barnes Family</span></div><div class="progress"><i style="width:75%"></i></div><div class="muted">4 games remaining · projected max 13</div><div class="quick"><button>VIEW MY PICKS</button><button>FIELD VIEW</button></div></div><div class="card" style="grid-column:span 12"><div class="section-title"><h2>COMMISSIONER COMMAND CENTER</h2><span class="badge live">SYSTEM HEALTHY</span></div><div class="admin-grid">${adminStats.map(a=>`<div class="admin-tile"><span class="muted">${a[0]}</span><strong>${a[1]}</strong><small>${a[2]}</small></div>`).join("")}</div><div class="quick"><button data-admin="players">PLAYERS</button><button data-admin="slate">WEEK / SLATE</button><button data-admin="rules">RULES</button><button data-admin="comms">EMAIL + TEXT</button><button data-admin="audit">ACTIVITY</button></div></div><div class="card pricing-card"><div class="section-title"><h2>LINKS MEMBERSHIP</h2><span class="badge live">PLAYERS FREE</span></div><div class="plans"><div><b>FREE FOR LIFE</b><strong>1 pool</strong><span>Core games · commissioner tools · supported by ads</span></div><div class="featured"><b>LINKS PRO</b><strong>More power</strong><span>Multiple pools · ad-free pool · advanced controls</span></div><div><b>ALL ACCESS</b><strong>Everything</strong><span>Fantasy · Dynasty · automation · expanded AI</span></div></div><p class="muted plan-note">Players never pay just to join and make picks. Upgrading a pool improves the experience for everyone in it.</p></div><div class="card ai-card"><div class="ai-orbit"><i></i><i></i><i></i></div><div class="ai-kicker">LINKS LABS · RESEARCH MODE</div><div class="section-title"><h2>AI SPORTS RESEARCH</h2><span class="badge">COMING LAB</span></div><p class="muted">Explore matchups, trends and possible multi-leg combinations from sourced data. LINKS shows the evidence behind each leg and never promises a winner.</p><div class="ai-builder"><div class="ai-prompt">Tell LINKS what you want to research… <b>“3-leg NFL card, lower variance, no same-game legs”</b></div><div class="chips"><button>ALL SPORTS</button><button>2–3 LEGS</button><button>LOWER VARIANCE</button><button>PLUS MONEY</button><button>SAME GAME</button><button>CROSS SPORT</button></div><div class="ai-coachbar"><div class="coachdot">L</div><div><span>LINKS AI COACH</span><b>Context-aware across pools, fantasy & dynasty</b></div><div class="coachactions"><button data-ai="lineup">LINEUP</button><button data-ai="trade">TRADE</button><button data-ai="waivers">WAIVERS</button></div></div><div class="ai-copilot"><div><span>LINKS COPILOT</span><b>Ask about your pools</b><small>“Who still needs picks?” · “What locks next?” · “Show my survivor history.”</small></div><button data-ai="copilot">ASK LINKS</button></div><div class="ai-brief"><div class="brieftop"><span>PERSONALIZED</span><b>YOUR LINKS BRIEF</b><em>Updated from your pools + sports research</em></div><div class="briefgrid"><button data-ai="brief"><strong>1</strong><span>Pick still needs attention</span></button><button data-ai="scenario"><strong>#2</strong><span>Best live finish if TEN wins</span></button><button data-ai="watch"><strong>3</strong><span>Matchups on your watchlist</span></button></div></div><div class="ai-ticket"><div class="tickethead"><div><span>LINKS AI · CARD LAB</span><b>Research Card Preview</b></div><em>3 LEGS · MODERATE</em></div><div class="ticketlegs"><div><i>NBA</i><p><b>Player points prop</b><span>7/10 recent · matchup + pace checked</span></p><strong>A</strong></div><div><i>NHL</i><p><b>Shots on goal prop</b><span>8/10 recent · role stable</span></p><strong>A−</strong></div><div><i>NFL</i><p><b>Receiving prop</b><span>6/8 comparable games · correlation checked</span></p><strong>B+</strong></div></div><div class="ticketfoot"><span><b>Evidence grade</b> summarizes data quality—not win probability.</span><button data-ai="carddetail">VIEW RECEIPTS ›</button></div></div><div class="ai-workbench"><div class="workhead"><div><span>LINKS AI · WORKBENCH</span><b>Build with receipts, not hype.</b></div><button data-ai="newcard">+ NEW CARD</button></div><div class="worklegs"><div><i>1</i><div><b>Player Prop</b><span>Recent · season · matchup evidence</span></div><em>ADD LEG ›</em></div><div><i>2</i><div><b>Correlation Check</b><span>Flags legs that move together or fight each other</span></div><em>ANALYZE ›</em></div><div><i>3</i><div><b>Price & Sample</b><span>Show implied chance, sample size and line movement</span></div><em>REVIEW ›</em></div></div><div class="workfooter"><span>Every saved card keeps wins <b>and</b> losses.</span><button data-ai="tracker">OPEN LIVE TRACKER</button></div></div><div class="ai-scan"><div class="scanhead"><b>AI DAILY SCAN</b><span>Research workspace</span></div><div class="scanrows"><button data-ai="edge"><span>NFL</span><b>Matchup edges</b><em>12 games scanned ›</em></button><button data-ai="props"><span>NBA</span><b>Player trend board</b><em>84 props tracked ›</em></button><button data-ai="cross"><span>MULTI</span><b>Cross-sport builder</b><em>Build from evidence ›</em></button></div></div><div class="ai-metrics"><div><strong>LIVE</strong><span>data-first research</span></div><div><strong>WHY?</strong><span>evidence per leg</span></div><div><strong>TRACK</strong><span>full result history</span></div></div><div class="quick"><button data-ai="build">BUILD RESEARCH CARD</button><button data-ai="trends">PLAYER TRENDS</button><button data-ai="matchup">MATCHUP LAB</button><button data-ai="scan">SCAN TODAY</button></div></div></div><div class="card" style="grid-column:span 12"><div class="section-title"><h2>GAME LIBRARY</h2><span class="muted">All your pools. All your games. All in one place.</span></div><div class="filterbar"><button class="active">ALL</button><button>FOOTBALL</button><button>BASKETBALL</button><button>BASEBALL</button><button>GOLF</button><button>HOCKEY</button><button>SOCCER</button><button>RACING</button><button>FANTASY</button><button>SPECIAL</button></div><div class="games">${games.map(g=>`<div class="game"><div class="ico">${g[0]}</div><b>${g[1]}</b><span class="muted">${g[2]}</span></div>`).join("")}</div></div></section></main></div><nav class="bottom"><button class="active"><span>⌂</span>HOME</button><button><span>▦</span>POOLS</button><button><span>✓</span>PICKS</button><button><span>🏆</span>RESULTS</button><button><span>⚙</span>ADMIN</button></nav></div>`;document.querySelector("#create").onclick=()=>modal("Create a pool",`<div class="muted">Fast setup first. Advanced rules stay available after creation.</div><div class="field"><label>POOL NAME</label><input placeholder="Sunday Crew"></div><div class="field"><label>SPORT OR GAME</label><input placeholder="Search NFL, College, Survivor, Squares…"></div><div class="field"><label>YOUR ROLE</label><input value="Commissioner + Player" readonly></div>`);document.querySelectorAll("[data-ai]").forEach(x=>x.onclick=()=>modal("LINKS AI · "+x.textContent,`<p class="muted">Choose sport(s), games, leg count, markets, risk profile, same-game or cross-game, and any players or teams you want included or excluded. Every result will show the data behind each leg, sample size, current line/price when available, and correlation warnings.</p><div class="field"><label>WHAT DO YOU WANT LINKS TO BUILD?</label><input placeholder="Example: 4 legs, NBA + NHL, moderate risk, no unders"></div>`));document.querySelectorAll("[data-admin]").forEach(x=>x.onclick=()=>modal("Commissioner · "+x.textContent,`<p class="muted">This control is isolated from game pages. Changes are validated, saved through the pool engine, and recorded in activity history.</p><div class="field"><label>SEARCH OR ACTION</label><input placeholder="Find player, week, rule or message…"></div>`));document.querySelectorAll(".game").forEach((x,i)=>x.onclick=()=>modal(games[i][1],`<p class="muted">${games[i][2]}</p><p>This module will carry its own picks, scoring, standings, rules and commissioner controls while sharing the LINKS account, notification and pool engines.</p>`))}NB.register("shell",{mount:app});NB.register("games",{catalog:()=>games.slice()});NB.register("pools",{list:()=>pools.slice()});app();
// LINKS interaction pass: connect prototype controls without touching production.
function wireNewBuild(){
  document.querySelectorAll(".streamtabs button").forEach(btn=>btn.addEventListener("click",()=>{
    btn.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const mode=btn.textContent.trim().toLowerCase().replace("for you","all");
    document.querySelectorAll(".streamitem").forEach((item,i)=>{
      const txt=item.textContent.toLowerCase();
      item.hidden=mode!=="all"&&!txt.includes(mode)&&!(mode==="pools"&&(txt.includes("nfl")||txt.includes("week")));
    });
  }));
  document.querySelectorAll("[data-ai]").forEach(btn=>btn.addEventListener("click",()=>{
    const label=btn.dataset.ai||"LINKS AI";
    modal("LINKS · "+label.toUpperCase(),'<div class="connected-modal"><span class="badge live">CONNECTED EXPERIENCE</span><h3>This control is now routed through the New Build interaction layer.</h3><p>Next this surface can receive live pool, scoring, fantasy and AI data without game pages manipulating each other.</p></div>');
  }));
  document.querySelectorAll(".pool").forEach(row=>row.addEventListener("click",()=>{
    const name=row.querySelector("b")?.textContent||"Pool";
    modal(name,'<div class="connected-modal"><span class="badge">POOL HUB</span><h3>One pool. One workspace.</h3><p>Picks, standings, field view, messages and commissioner tools will route through this pool context.</p></div>');
  }));
}
queueMicrotask(wireNewBuild);

// Completion pass: real URL state + persistence for the New Build shell.
const LinksState={
  key:"links-new-build-state-v1",
  read(){try{return JSON.parse(localStorage.getItem(this.key)||"{}")}catch{return{}}},
  write(patch){const next={...this.read(),...patch};localStorage.setItem(this.key,JSON.stringify(next));return next}
};
function setRoute(route,pool=""){
  const u=new URL(location.href);u.searchParams.set("view",route);
  pool?u.searchParams.set("pool",pool):u.searchParams.delete("pool");
  history.pushState({route,pool},"",u);
  LinksState.write({route,pool});
  document.documentElement.dataset.view=route;
  document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.textContent.trim().toLowerCase().includes(route.replace("-"," "))));
}
function hydrateRoute(){
  const u=new URL(location.href),saved=LinksState.read();
  const route=u.searchParams.get("view")||saved.route||"home";
  const pool=u.searchParams.get("pool")||saved.pool||"";
  document.documentElement.dataset.view=route;
  if(pool) document.documentElement.dataset.pool=pool;
}
function wireRouting(){
  hydrateRoute();
  const navRoutes=["home","my-pools","my-picks","results","messages","notifications","commissioner"];
  document.querySelectorAll(".nav button").forEach((b,i)=>b.addEventListener("click",()=>setRoute(navRoutes[i]||"home")));
  document.querySelectorAll(".pool").forEach(row=>row.addEventListener("dblclick",()=>{
    const pool=row.querySelector("b")?.textContent||"Pool";setRoute("my-pools",pool);
  }));
  addEventListener("popstate",hydrateRoute);
}
queueMicrotask(wireRouting);

// Pick Engine v1 — isolated, persistent, deadline-aware demo surface.
const PickEngine={
 key:"links-picks-v1",
 load(){try{return JSON.parse(localStorage.getItem(this.key)||"{}")}catch{return{}}},
 save(game,team){const all=this.load();all[game]={team,savedAt:new Date().toISOString()};localStorage.setItem(this.key,JSON.stringify(all));return all[game]},
 get(game){return this.load()[game]||null}
};
function pickDemo(){
 const host=document.createElement("section");host.className="pick-engine card wide";
 host.innerHTML='<div class="pick-head"><div><span>PICK ENGINE · LIVE PROTOTYPE</span><b>Thursday Night Football</b><small>Your selection saves instantly on this device.</small></div><em>LOCKS 7:15 PM</em></div><div class="pick-match"><button data-team="TEN"><i>TEN</i><b>TITANS</b><span>3–2</span></button><div class="pick-vs"><small>WEEK 7</small><strong>VS</strong><span>Nashville · 7:15 PM</span></div><button data-team="IND"><i>IND</i><b>COLTS</b><span>4–1</span></button></div><div class="pick-proof"><span>○ CHOOSE A TEAM</span><button class="ghost" data-clear-pick>CLEAR</button></div>';
 const anchor=document.querySelector(".picksafe-card")||document.querySelector(".grid");
 anchor?.parentNode.insertBefore(host,anchor);
 const proof=host.querySelector(".pick-proof span");
 const paint=()=>{
   const saved=PickEngine.get("week7-ten-ind");
   host.querySelectorAll("[data-team]").forEach(b=>b.classList.toggle("selected",saved?.team===b.dataset.team));
   proof.textContent=saved?"✓ SAVED · "+saved.team+" · "+new Date(saved.savedAt).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}):"○ CHOOSE A TEAM";
   proof.classList.toggle("saved",!!saved);
 };
 host.querySelectorAll("[data-team]").forEach(b=>b.addEventListener("click",()=>{PickEngine.save("week7-ten-ind",b.dataset.team);paint()}));
 host.querySelector("[data-clear-pick]").addEventListener("click",()=>{const all=PickEngine.load();delete all["week7-ten-ind"];localStorage.setItem(PickEngine.key,JSON.stringify(all));paint()});
 paint();
}
queueMicrotask(pickDemo);

// Pick Engine v2 — slate completeness, lock rules, and one-page confirmation.
const DemoSlate=[
 {id:"ten-ind",away:"TEN",home:"IND",kick:"Thu 7:15 PM"},
 {id:"dal-nyg",away:"DAL",home:"NYG",kick:"Sun 12:00 PM"},
 {id:"buf-mia",away:"BUF",home:"MIA",kick:"Sun 3:25 PM"}
];
function slatePick(id,team){PickEngine.save("slate-"+id,team);renderSlateStatus()}
function renderSlateStatus(){
 const wrap=document.querySelector(".slate-engine");if(!wrap)return;
 let done=0;
 DemoSlate.forEach(g=>{const p=PickEngine.get("slate-"+g.id);if(p)done++;wrap.querySelectorAll('[data-slate="'+g.id+'"]').forEach(b=>b.classList.toggle("selected",p?.team===b.dataset.team))});
 const missing=DemoSlate.length-done,pct=Math.round(done/DemoSlate.length*100);
 wrap.querySelector(".slate-meter i").style.width=pct+"%";
 wrap.querySelector(".slate-count").textContent=missing?missing+" PICK"+(missing>1?"S":"")+" MISSING":"ALL PICKS SAVED";
 wrap.querySelector(".slate-count").classList.toggle("complete",!missing);
}
function showPickConfirmation(){
 const rows=DemoSlate.map(g=>{const p=PickEngine.get("slate-"+g.id);return '<div class="confirm-row"><span>'+g.away+' vs '+g.home+'</span><b>'+(p?.team||"MISSING")+'</b><small>'+g.kick+'</small></div>'}).join("");
 modal("WEEK 7 · PICK CONFIRMATION",'<div class="confirmation-sheet"><div class="confirm-brand">LINKS <span>OFFICIAL PICK RECORD</span></div>'+rows+'<p>Saved selections are shown above. Picks become read-only when their game locks.</p></div>');
}
function mountSlate(){
 const anchor=document.querySelector(".pick-engine");if(!anchor)return;
 const s=document.createElement("section");s.className="slate-engine card wide";
 s.innerHTML='<div class="slate-top"><div><span>WEEK 7 · YOUR CARD</span><b>Finish every pick before kickoff.</b></div><button class="ghost" data-confirm>VIEW CONFIRMATION ›</button></div><div class="slate-meter"><i></i></div><strong class="slate-count"></strong><div class="slate-games">'+DemoSlate.map(g=>'<div class="slate-game"><div><small>'+g.kick+'</small><b>'+g.away+' <i>AT</i> '+g.home+'</b></div><div class="slate-actions"><button data-slate="'+g.id+'" data-team="'+g.away+'">'+g.away+'</button><button data-slate="'+g.id+'" data-team="'+g.home+'">'+g.home+'</button></div></div>').join("")+'</div>';
 anchor.insertAdjacentElement("afterend",s);
 s.querySelectorAll("[data-slate]").forEach(b=>b.addEventListener("click",()=>slatePick(b.dataset.slate,b.dataset.team)));
 s.querySelector("[data-confirm]").addEventListener("click",showPickConfirmation);
 renderSlateStatus();
}
queueMicrotask(mountSlate);

// Pick Engine v3 — game lifecycle, lock/reveal, deterministic scoring + standings demo.
const ScoreDemo={
 games:{
  "ten-ind":{status:"FINAL",awayScore:24,homeScore:20,winner:"TEN"},
  "dal-nyg":{status:"FINAL",awayScore:17,homeScore:21,winner:"NYG"},
  "buf-mia":{status:"LIVE · Q3",awayScore:20,homeScore:17,winner:null}
 },
 players:[
  {name:"Jake",picks:{"ten-ind":"TEN","dal-nyg":"NYG","buf-mia":"BUF"}},
  {name:"Mike",picks:{"ten-ind":"IND","dal-nyg":"NYG","buf-mia":"BUF"}},
  {name:"Amanda",picks:{"ten-ind":"TEN","dal-nyg":"DAL","buf-mia":"MIA"}},
  {name:"Chris",picks:{"ten-ind":"IND","dal-nyg":"DAL","buf-mia":"BUF"}}
 ]
};
function scored(p){return Object.entries(p.picks).reduce((n,[id,t])=>n+(ScoreDemo.games[id]?.winner===t?1:0),0)}
function mountScoreboard(){
 const anchor=document.querySelector(".slate-engine");if(!anchor)return;
 const box=document.createElement("section");box.className="score-engine card wide";
 const ranked=[...ScoreDemo.players].sort((a,b)=>scored(b)-scored(a));
 box.innerHTML='<div class="score-head"><div><span>LIVE SCORING ENGINE</span><b>Week 7 standings</b><small>Finals score automatically. Live games stay projected until final.</small></div><em>● LIVE</em></div><div class="score-games">'+DemoSlate.map(g=>{const s=ScoreDemo.games[g.id];return '<div><span>'+s.status+'</span><b>'+g.away+' '+(s.awayScore??"—")+' · '+(s.homeScore??"—")+' '+g.home+'</b><small>'+(s.winner?"WINNER · "+s.winner:"SCORING IN PROGRESS")+'</small></div>'}).join("")+'</div><div class="standings-head"><span>RK</span><span>PLAYER</span><span>RECORD</span><span>STATUS</span></div><div class="standings">'+ranked.map((p,i)=>'<div class="'+(p.name==="Jake"?"you":"")+'"><strong>'+(i+1)+'</strong><b>'+p.name+(p.name==="Jake"?" · YOU":"")+'</b><span>'+scored(p)+'–'+(Object.values(ScoreDemo.games).filter(g=>g.winner).length-scored(p))+'</span><em>'+(i===0?"LEADER":"LIVE")+'</em></div>').join("")+'</div><div class="score-foot"><span>✓ Final winners are immutable unless commissioner override is audited.</span><button class="ghost" data-score-detail>VIEW SCORING DETAIL ›</button></div>';
 anchor.insertAdjacentElement("afterend",box);
 box.querySelector("[data-score-detail]").addEventListener("click",()=>modal("SCORING DETAIL",'<div class="connected-modal"><span class="badge live">DETERMINISTIC ENGINE</span><h3>Scores come from game results—not AI.</h3><p>AI can explain movement and scenarios, but final winners, records and standings are computed from the result feed and stored picks.</p></div>'));
}
queueMicrotask(mountScoreboard);

// Commissioner integrity v1 — lock state + explicit audited overrides.
const AuditLog={
 key:"links-audit-v1",
 all(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch{return[]}},
 add(action,detail){const rows=this.all();rows.unshift({at:new Date().toISOString(),action,detail,actor:"Commissioner"});localStorage.setItem(this.key,JSON.stringify(rows.slice(0,50)));return rows[0]}
};
const LockEngine={
 key:"links-locks-v1",
 read(){try{return JSON.parse(localStorage.getItem(this.key)||"{}")}catch{return{}}},
 set(id,locked,reason="Commissioner override"){const x=this.read();x[id]={locked,at:new Date().toISOString(),reason};localStorage.setItem(this.key,JSON.stringify(x));AuditLog.add(locked?"GAME LOCKED":"GAME UNLOCKED",id+" · "+reason);return x[id]},
 isLocked(id){return !!this.read()[id]?.locked}
};
function mountIntegrity(){
 const anchor=document.querySelector(".score-engine");if(!anchor)return;
 const box=document.createElement("section");box.className="integrity card wide";
 box.innerHTML='<div class="integrity-head"><div><span>COMMISSIONER INTEGRITY</span><b>Locks & audit trail</b><small>Overrides are explicit, timestamped and visible.</small></div><button class="ghost" data-audit>VIEW AUDIT LOG ›</button></div><div class="lockrows">'+DemoSlate.map(g=>'<div class="lockrow" data-lockrow="'+g.id+'"><div><small>'+g.kick+'</small><b>'+g.away+' at '+g.home+'</b></div><span class="lockstate"></span><button class="ghost locktoggle" data-lock="'+g.id+'"></button></div>').join("")+'</div>';
 anchor.insertAdjacentElement("afterend",box);
 const paint=()=>box.querySelectorAll("[data-lockrow]").forEach(r=>{const id=r.dataset.lockrow,on=LockEngine.isLocked(id);r.classList.toggle("locked",on);r.querySelector(".lockstate").textContent=on?"🔒 LOCKED":"○ OPEN";r.querySelector(".locktoggle").textContent=on?"UNLOCK":"LOCK NOW"});
 box.querySelectorAll("[data-lock]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.lock,on=LockEngine.isLocked(id);const reason=on?"Manual correction window":"Manual commissioner lock";LockEngine.set(id,!on,reason);paint()}));
 box.querySelector("[data-audit]").addEventListener("click",()=>{const rows=AuditLog.all();modal("COMMISSIONER AUDIT LOG",'<div class="audit-list">'+(rows.length?rows.map(x=>'<div><span>'+new Date(x.at).toLocaleString()+'</span><b>'+x.action+'</b><small>'+x.detail+' · '+x.actor+'</small></div>').join(""):'<p>No commissioner overrides recorded yet.</p>')+'</div>')});
 paint();
}
queueMicrotask(mountIntegrity);

// Pick Engine v4 — automatic kickoff locks + per-game countdown.
const AutoLock={
 // Demo kickoff times are generated relative to first visit so the lifecycle is testable.
 key:"links-demo-kickoffs-v1",
 times(){
   let x;try{x=JSON.parse(localStorage.getItem(this.key)||"null")}catch{}
   if(!x){const n=Date.now();x={"ten-ind":n+45*60e3,"dal-nyg":n+3*60*60e3,"buf-mia":n+26*60*60e3};localStorage.setItem(this.key,JSON.stringify(x))}
   return x
 },
 sync(){
   const t=this.times(),now=Date.now();
   DemoSlate.forEach(g=>{if(now>=t[g.id]&&!LockEngine.isLocked(g.id))LockEngine.set(g.id,true,"Automatic kickoff lock")});
 },
 remaining(id){
   const d=this.times()[id]-Date.now();if(d<=0)return"LOCKED";
   const m=Math.floor(d/60000),h=Math.floor(m/60);return h?h+"h "+(m%60)+"m":m+"m";
 }
};
function mountDeadlineCenter(){
 const anchor=document.querySelector(".integrity");if(!anchor)return;
 const box=document.createElement("section");box.className="deadline-center card wide";
 box.innerHTML='<div class="deadline-head"><div><span>LOCK CENTER</span><b>Automatic kickoff protection</b><small>Each game locks independently at its scheduled kickoff.</small></div><em>AUTO · ON</em></div><div class="deadline-list">'+DemoSlate.map(g=>'<div data-deadline="'+g.id+'"><div><small>'+g.kick+'</small><b>'+g.away+' at '+g.home+'</b></div><strong></strong><span></span></div>').join("")+'</div>';
 anchor.insertAdjacentElement("afterend",box);
 const tick=()=>{AutoLock.sync();box.querySelectorAll("[data-deadline]").forEach(r=>{const id=r.dataset.deadline,locked=LockEngine.isLocked(id);r.classList.toggle("islocked",locked);r.querySelector("strong").textContent=locked?"🔒 LOCKED":AutoLock.remaining(id);r.querySelector("span").textContent=locked?"Picks read-only":"Picks open"})};
 tick();setInterval(tick,30000);
}
queueMicrotask(mountDeadlineCenter);

// Pick Engine v5 — enforce lock state on selection + post-lock field reveal.
function lockGuard(){
 document.addEventListener("click",e=>{
   const b=e.target.closest("[data-slate]");if(!b)return;
   const id=b.dataset.slate;
   if(LockEngine.isLocked(id)){
     e.preventDefault();e.stopImmediatePropagation();
     modal("PICK LOCKED",'<div class="connected-modal"><span class="badge live">🔒 '+id.toUpperCase()+'</span><h3>This game has already locked.</h3><p>Your saved selection is protected. Commissioner changes must use an audited override.</p></div>');
   }
 },true);
}
function mountFieldReveal(){
 const anchor=document.querySelector(".deadline-center");if(!anchor)return;
 const box=document.createElement("section");box.className="field-reveal card wide";
 box.innerHTML='<div class="field-head"><div><span>FIELD REVEAL</span><b>Everybody stays hidden until lock.</b><small>After a game locks, the pool can see who picked each side.</small></div><em>FAIR PLAY</em></div><div class="field-games">'+DemoSlate.map(g=>'<div class="field-game" data-field="'+g.id+'"></div>').join("")+'</div>';
 anchor.insertAdjacentElement("afterend",box);
 const paint=()=>DemoSlate.forEach(g=>{const row=box.querySelector('[data-field="'+g.id+'"]'),locked=LockEngine.isLocked(g.id);
   if(!locked){row.innerHTML='<div><small>'+g.kick+'</small><b>'+g.away+' at '+g.home+'</b></div><span class="hidden-picks">◉ PICKS HIDDEN</span><small>Reveals at lock</small>';return}
   const a=ScoreDemo.players.filter(p=>p.picks[g.id]===g.away).map(p=>p.name);
   const h=ScoreDemo.players.filter(p=>p.picks[g.id]===g.home).map(p=>p.name);
   row.innerHTML='<div><small>'+g.kick+'</small><b>'+g.away+' at '+g.home+'</b></div><div class="field-side"><strong>'+g.away+' · '+a.length+'</strong><span>'+a.join(" · ")+'</span></div><div class="field-side"><strong>'+g.home+' · '+h.length+'</strong><span>'+h.join(" · ")+'</span></div>';
 });
 paint();setInterval(paint,30000);
}
queueMicrotask(()=>{lockGuard();mountFieldReveal()});

// Commissioner v2 — submission status + missing-pick reminder queue.
const EntrantStatus=[
 {name:"Jake",email:"jake@example.com",done:3,total:3,last:"Saved 12:42 AM"},
 {name:"Amanda",email:"amanda@example.com",done:2,total:3,last:"1 pick missing"},
 {name:"Mike",email:"mike@example.com",done:3,total:3,last:"Saved yesterday"},
 {name:"Chris",email:"chris@example.com",done:0,total:3,last:"No picks yet"}
];
const ReminderQueue={
 key:"links-reminders-v1",
 all(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch{return[]}},
 send(player){const a=this.all();a.unshift({player,at:new Date().toISOString(),type:"Missing picks"});localStorage.setItem(this.key,JSON.stringify(a.slice(0,50)));AuditLog.add("PICK REMINDER SENT",player+" · missing picks");return a[0]}
};
function mountEntrantManager(){
 const anchor=document.querySelector(".field-reveal");if(!anchor)return;
 const box=document.createElement("section");box.className="entrant-manager card wide";
 box.innerHTML='<div class="entrant-head"><div><span>ENTRANT MANAGER</span><b>Who still needs to pick?</b><small>Submission status is separate from the picks themselves.</small></div><button class="ghost" data-remind-all>REMIND MISSING ›</button></div><div class="entrant-summary"><strong>'+EntrantStatus.filter(x=>x.done===x.total).length+'/'+EntrantStatus.length+'</strong><span>ENTRIES COMPLETE</span><i></i></div><div class="entrant-list">'+EntrantStatus.map(x=>'<div class="'+(x.done===x.total?"complete":"missing")+'"><div class="entrant-avatar">'+x.name[0]+'</div><div><b>'+x.name+'</b><small>'+x.last+'</small></div><strong>'+x.done+'/'+x.total+'</strong>'+(x.done===x.total?'<em>✓ COMPLETE</em>':'<button class="ghost" data-remind="'+x.name+'">REMIND</button>')+'</div>').join("")+'</div><div class="entrant-foot"><span>Reminders never expose another player’s selections.</span><b class="reminder-feedback"></b></div>';
 anchor.insertAdjacentElement("afterend",box);
 const feedback=box.querySelector(".reminder-feedback");
 const send=name=>{ReminderQueue.send(name);feedback.textContent="Reminder queued for "+name;setTimeout(()=>feedback.textContent="",2500)};
 box.querySelectorAll("[data-remind]").forEach(b=>b.addEventListener("click",()=>send(b.dataset.remind)));
 box.querySelector("[data-remind-all]").addEventListener("click",()=>{const names=EntrantStatus.filter(x=>x.done<x.total).map(x=>x.name);names.forEach(ReminderQueue.send.bind(ReminderQueue));feedback.textContent=names.length+" missing-pick reminders queued";setTimeout(()=>feedback.textContent="",2500)});
}
queueMicrotask(mountEntrantManager);

// Route Workspace v1 — nav now opens focused product screens instead of only highlighting state.
const RouteViews={
 "my-pools":()=>`<section class="route-hero"><div><span>MY POOLS</span><h1>Every pool. One account.</h1><p>Jump back into a pool, see the next lock, or start another game.</p></div><button class="primary" data-route-action="create">＋ CREATE POOL</button></section><section class="route-grid">${pools.map((p,i)=>`<article class="route-pool" data-open-pool="${p[1]}"><div class="route-icon">${p[0]}</div><div><small>${p[2]}</small><h3>${p[1]}</h3><p>${p[3]}</p></div><div class="route-pool-status"><b>${i===0?"PICKS OPEN":"ACTIVE"}</b><span>${p[4]}</span></div></article>`).join("")}<article class="route-join"><span>HAVE AN INVITE?</span><h3>Join a pool</h3><p>Invite links open the exact pool automatically. Pool codes work here too.</p><button class="ghost">ENTER POOL CODE ›</button></article></section>`,
 "my-picks":()=>`<section class="route-hero"><div><span>MY PICKS</span><h1>Your week at a glance.</h1><p>One place for unfinished cards, saved picks and upcoming locks.</p></div><div class="route-kpi"><strong>1</strong><small>CARD NEEDS YOU</small></div></section><section class="route-grid"><article class="route-focus"><span>NEXT DEADLINE</span><h2>Barnes Family · Week 3</h2><p>1 pick still missing before Thursday 7:15 PM.</p><button class="primary" data-jump-picks>FINISH PICKS ›</button></article><article class="route-status good"><span>SAVED</span><h3>Saturday Crew</h3><p>10 of 10 college picks complete.</p><b>✓ PICK CARD COMPLETE</b></article><article class="route-status"><span>SURVIVOR</span><h3>Last One Standing</h3><p>Your selection is saved and protected.</p><b>LOCKS SUNDAY 12:00 PM</b></article></section>`,
 "results":()=>`<section class="route-hero"><div><span>RESULTS</span><h1>Scores, standings & history.</h1><p>Final results drive records automatically. Live games remain live until final.</p></div><div class="route-kpi"><strong>2–0</strong><small>WEEK 7 FINAL PICKS</small></div></section><section class="route-grid"><article class="route-focus"><span>LIVE STANDINGS</span><h2>Barnes Family</h2><p>You are currently tied for the weekly lead.</p><button class="primary" data-jump-results>OPEN LIVE SCORING ›</button></article><article class="route-status"><span>LEGACY</span><h3>Season record</h3><p>Permanent weekly history stays attached to your account.</p><b>VIEW HISTORY ›</b></article></section>`,
 "messages":()=>`<section class="route-hero"><div><span>MESSAGES</span><h1>Pool communication without the chaos.</h1><p>Commissioner announcements, reminders and pool conversation live together.</p></div></section><section class="route-stack"><article><b>Commissioner · Barnes Family</b><span>Week 3 is open. Get picks in before Thursday kickoff.</span><small>18 minutes ago</small></article><article><b>LINKS</b><span>Your Saturday Crew pick card is complete.</span><small>Yesterday</small></article></section>`,
 "notifications":()=>`<section class="route-hero"><div><span>NOTIFICATIONS</span><h1>Only what needs your attention.</h1><p>Deadlines, results, invitations and commissioner activity.</p></div></section><section class="route-stack"><article><b>Pick deadline approaching</b><span>Barnes Family has 1 missing pick.</span><small>Action needed</small></article><article><b>Standings updated</b><span>Two Week 7 games are final.</span><small>31 minutes ago</small></article></section>`,
 "commissioner":()=>`<section class="route-hero"><div><span>COMMISSIONER</span><h1>Run the week from one screen.</h1><p>Entrants, locks, reminders, scoring health and audited overrides.</p></div><div class="route-kpi"><strong>5</strong><small>NEED PICKS</small></div></section><section class="route-grid"><article class="route-focus"><span>WEEK CONTROL</span><h2>Barnes Family · Week 3</h2><p>59 of 64 entries complete · scoring healthy.</p><button class="primary" data-jump-admin>OPEN WEEK CONTROLS ›</button></article>${adminStats.map(x=>`<article class="route-status"><span>${x[0]}</span><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join("")}</section>`
};
function renderRouteWorkspace(){
 const view=new URL(location.href).searchParams.get("view")||LinksState.read().route||"home";
 let w=document.querySelector(".route-workspace");
 if(!w){w=document.createElement("div");w.className="route-workspace";document.querySelector(".main")?.prepend(w)}
 document.documentElement.dataset.view=view;
 if(view==="home"){w.innerHTML="";return}
 w.innerHTML=(RouteViews[view]||RouteViews["my-pools"])();
 w.querySelector('[data-route-action="create"]')?.addEventListener("click",()=>document.querySelector("#create")?.click());
 w.querySelectorAll("[data-open-pool]").forEach(x=>x.addEventListener("click",()=>modal(x.dataset.openPool,'<div class="connected-modal"><span class="badge live">POOL HUB</span><h3>'+x.dataset.openPool+'</h3><p>Open picks, standings, messages and pool settings from one context.</p></div>')));
 const jump=(sel,target)=>w.querySelector(sel)?.addEventListener("click",()=>{setRoute("home");setTimeout(()=>{renderRouteWorkspace();document.querySelector(target)?.scrollIntoView({behavior:"smooth",block:"start"})},20)});
 jump("[data-jump-picks]",".slate-engine");jump("[data-jump-results]",".score-engine");jump("[data-jump-admin]",".entrant-manager");
}
document.querySelector(".nav")?.addEventListener("click",()=>setTimeout(renderRouteWorkspace,0),true);
addEventListener("popstate",()=>setTimeout(renderRouteWorkspace,0));
queueMicrotask(renderRouteWorkspace);

// Pool Hub v1 — persistent pool context, premium game-day command surface.
const PoolHubData={
 "Barnes Family":{icon:"🏈",game:"NFL PICK’EM",week:"WEEK 3",members:64,ready:59,lock:"THU · 7:15 PM",record:"2–0",rank:"T-1",accent:"NFL"},
 "Saturday Crew":{icon:"🎓",game:"COLLEGE PICK’EM",week:"WEEK 4",members:28,ready:28,lock:"SAT · 11:00 AM",record:"8–2",rank:"4",accent:"NCAA"},
 "Last One Standing":{icon:"🛡️",game:"SURVIVOR",week:"WEEK 3",members:42,ready:7,lock:"SUN · 12:00 PM",record:"ALIVE",rank:"—",accent:"SURVIVOR"}
};
function openPoolHub(name){
 const p=PoolHubData[name]||PoolHubData["Barnes Family"];
 const u=new URL(location.href);u.searchParams.set("view","pool");u.searchParams.set("pool",name);history.pushState({route:"pool",pool:name},"",u);
 LinksState.write({route:"pool",pool:name});document.documentElement.dataset.view="pool";document.documentElement.dataset.pool=name;
 let w=document.querySelector(".route-workspace");if(!w){w=document.createElement("div");w.className="route-workspace";document.querySelector(".main")?.prepend(w)}
 w.innerHTML=`<section class="poolhub-hero">
   <div class="poolhub-glow"></div><div class="poolhub-mark">${p.icon}</div>
   <div class="poolhub-title"><span>${p.accent} · ${p.week}</span><h1>${name}</h1><p>${p.game} · ${p.members} PLAYERS</p></div>
   <div class="poolhub-lock"><small>NEXT LOCK</small><strong>${p.lock}</strong><em>● PICKS OPEN</em></div>
 </section>
 <nav class="poolhub-tabs"><button class="active" data-hubtab="overview">OVERVIEW</button><button data-hubtab="picks">PICKS</button><button data-hubtab="standings">STANDINGS</button><button data-hubtab="compare">COMPARE</button><button data-hubtab="room">POOL ROOM</button><button data-hubtab="rules">RULES</button></nav>
 <section class="poolhub-body">
  <div class="hub-overview" data-hubpanel="overview">
   <article class="hub-main"><span>YOUR WEEK</span><div class="hub-scoreline"><strong>${p.record}</strong><div><b>CURRENT RECORD</b><small>Rank ${p.rank} · live</small></div></div><div class="hub-progress"><i style="width:${Math.round(p.ready/p.members*100)}%"></i></div><p>${p.ready} of ${p.members} players ready for ${p.week.toLowerCase()}.</p><button class="primary" data-hub-go="picks">OPEN MY PICKS ›</button></article>
   <article class="hub-tile"><span>FIELD</span><strong>${p.members}</strong><b>PLAYERS</b><small>${p.ready} submitted</small></article>
   <article class="hub-tile"><span>POSITION</span><strong>${p.rank}</strong><b>YOUR RANK</b><small>Updates live</small></article>
   <article class="hub-live"><span>LIVE IMPACT</span><h3>Every result moves the room.</h3><div><b>+3</b><small>spots if your unique pick wins</small></div><div><b>11</b><small>players on the other side</small></div></article>
   <article class="hub-activity"><span>POOL PULSE</span><h3>Latest activity</h3><p><b>Amanda</b> finished her card <small>2m</small></p><p><b>Standings</b> recalculated <small>31m</small></p><p><b>Commissioner</b> posted a note <small>1h</small></p></article>
  </div>
  <div class="hub-placeholder" data-hubpanel="picks" hidden><span>MY PICKS</span><h2>Your card is ready.</h2><p>Selections save instantly and become read-only at each game’s kickoff.</p><button class="primary" data-return-picks>GO TO PICK CARD ›</button></div>
  <div class="hub-placeholder" data-hubpanel="standings" hidden><span>STANDINGS</span><h2>Live table.</h2><p>Final games score automatically. Live games remain projected until final.</p><button class="primary" data-return-results>OPEN LIVE STANDINGS ›</button></div>
  <div class="hub-placeholder" data-hubpanel="compare" hidden><span>COMPARE</span><h2>Head to head.</h2><p>Compare picks after lock and see exactly which remaining games can move the standings.</p></div>
  <div class="hub-placeholder" data-hubpanel="room" hidden><span>POOL ROOM</span><h2>The conversation around the game.</h2><p>Commissioner notes, reactions and big moments stay with this pool.</p></div>
  <div class="hub-placeholder" data-hubpanel="rules" hidden><span>POOL RULES</span><h2>${p.game}</h2><p>Scoring, locks, tiebreakers and commissioner settings live here so everybody sees the same rules.</p></div>
 </section>`;
 w.querySelectorAll("[data-hubtab]").forEach(b=>b.addEventListener("click",()=>{w.querySelectorAll("[data-hubtab]").forEach(x=>x.classList.toggle("active",x===b));w.querySelectorAll("[data-hubpanel]").forEach(x=>x.hidden=x.dataset.hubpanel!==b.dataset.hubtab)}));
 w.querySelector("[data-hub-go]")?.addEventListener("click",()=>w.querySelector('[data-hubtab="picks"]')?.click());
 const homeJump=(sel,target)=>w.querySelector(sel)?.addEventListener("click",()=>{setRoute("home");setTimeout(()=>{renderRouteWorkspace();document.querySelector(target)?.scrollIntoView({behavior:"smooth",block:"start"})},20)});
 homeJump("[data-return-picks]",".slate-engine");homeJump("[data-return-results]",".score-engine");
}
function wirePoolHubs(){
 document.addEventListener("click",e=>{const x=e.target.closest("[data-open-pool]");if(x){e.preventDefault();e.stopImmediatePropagation();openPoolHub(x.dataset.openPool)}},true);
 const u=new URL(location.href);if((u.searchParams.get("view")==="pool")&&u.searchParams.get("pool"))openPoolHub(u.searchParams.get("pool"));
}
queueMicrotask(wirePoolHubs);

// Home Launch v1 — normal launches resolve to HOME; intentional deep links keep context.
const LaunchRouter={
 deepViews:new Set(["pool","my-picks","results","commissioner"]),
 init(){
   const u=new URL(location.href),view=u.searchParams.get("view"),pool=u.searchParams.get("pool");
   const nav=performance.getEntriesByType?.("navigation")?.[0];
   const isReload=nav?.type==="reload";
   const intentional=!!pool||u.searchParams.has("invite")||u.searchParams.has("notification")||u.searchParams.has("deep");
   if(!intentional&&!isReload&&(view&&view!=="home")){
     u.searchParams.set("view","home");u.searchParams.delete("pool");
     history.replaceState({route:"home",pool:""},"",u);
     LinksState.write({route:"home",pool:""});
     document.documentElement.dataset.view="home";delete document.documentElement.dataset.pool;
   }
 }
};
LaunchRouter.init();

// Home Spotlight — a concise first screen that answers: what do I need to do now?
function mountHomeLaunch(){
 const hero=document.querySelector(".hero");if(!hero)return;
 const panel=document.createElement("section");panel.className="home-launch";
 panel.innerHTML='<div class="home-now"><span>GOOD MORNING · YOUR LINKS</span><h2>One pick needs you.</h2><p>Barnes Family locks Thursday at 7:15 PM. Everything else is ready.</p><div class="home-actions"><button class="primary" data-home-pick>FINISH MY PICKS ›</button><button class="ghost" data-home-pools>OPEN MY POOLS</button></div></div><div class="home-radar"><div><small>POOLS</small><strong>3</strong><span>active</span></div><div><small>PICKS</small><strong>1</strong><span>due</span></div><div><small>LIVE</small><strong>4</strong><span>games</span></div><div><small>INBOX</small><strong>2</strong><span>unread</span></div></div>';
 hero.insertAdjacentElement("afterend",panel);
 panel.querySelector("[data-home-pick]").addEventListener("click",()=>{setRoute("my-picks");renderRouteWorkspace()});
 panel.querySelector("[data-home-pools]").addEventListener("click",()=>{setRoute("my-pools");renderRouteWorkspace()});
}
queueMicrotask(mountHomeLaunch);

// Visual Identity v1 — branded sport marks replace generic emoji in the primary product surfaces.
const SportMarks={
 NFL:'<span class="sportmark football"><i></i><b>NFL</b></span>',
 NCAA:'<span class="sportmark college"><i></i><b>TOP 25</b></span>',
 SURVIVOR:'<span class="sportmark survivor"><i></i><b>LAST</b></span>'
};
function applySportMarks(){
 document.querySelectorAll(".poolhub-mark").forEach(el=>{const name=document.documentElement.dataset.pool,p=PoolHubData[name];if(p&&SportMarks[p.accent])el.innerHTML=SportMarks[p.accent]});
 document.querySelectorAll(".route-pool").forEach(el=>{const n=el.dataset.openPool,p=PoolHubData[n],mark=el.querySelector(".route-icon");if(p&&mark&&SportMarks[p.accent])mark.innerHTML=SportMarks[p.accent]});
 document.querySelectorAll(".pool").forEach(el=>{const n=el.querySelector("b")?.textContent,p=PoolHubData[n],mark=el.querySelector(".sport");if(p&&mark&&SportMarks[p.accent])mark.innerHTML=SportMarks[p.accent]});
}
const brandObserver=new MutationObserver(()=>applySportMarks());brandObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(applySportMarks);

// Installed-app attention badge: progressive enhancement only.
function syncAppBadge(){
 const incomplete=EntrantStatus?.filter?.(x=>x.name==="Jake"&&x.done<x.total).length||1;
 if("setAppBadge" in navigator)navigator.setAppBadge(incomplete).catch(()=>{});
}
queueMicrotask(syncAppBadge);

// Game Art System v1 — scalable, branded category graphics without image downloads.
const GameArt={
 football:{label:"FOOTBALL",glyph:"laces",sub:"PICK · SURVIVE · WIN"},
 college:{label:"COLLEGE",glyph:"goal",sub:"SATURDAY COMMAND"},
 bracket:{label:"BRACKETS",glyph:"bracket",sub:"ROAD TO THE TITLE"},
 racing:{label:"RACING",glyph:"flag",sub:"EVERY LAP MATTERS"},
 golf:{label:"GOLF",glyph:"pin",sub:"MAJORS · ONE & DONE"},
 fantasy:{label:"FANTASY",glyph:"crown",sub:"BUILD · TRADE · WIN"},
 custom:{label:"CUSTOM",glyph:"grid",sub:"YOUR GAME · YOUR RULES"}
};
function gameCategory(name){
 name=name.toLowerCase();
 if(/college|bowl/.test(name))return"college";
 if(/march|bracket|playoff precision|world cup bracket/.test(name))return"bracket";
 if(/nascar|race|exacta|trifecta|stable|triple crown/.test(name))return"racing";
 if(/golf|fedex/.test(name))return"golf";
 if(/fantasy|dynasty|guillotine|salary cap|draft|start ’em/.test(name))return"fantasy";
 if(/custom|pool lab|awards|oscars|box pool/.test(name))return"custom";
 return"football";
}
function artHTML(cat){
 const a=GameArt[cat]||GameArt.football;
 return '<div class="gameart '+cat+'"><div class="gameart-sky"><i></i><i></i><i></i></div><div class="gameart-mark '+a.glyph+'"><u></u><u></u><u></u></div><div class="gameart-copy"><span>'+a.sub+'</span><b>'+a.label+'</b></div></div>';
}
function mountGameShowcase(){
 const anchor=document.querySelector(".home-launch");if(!anchor)return;
 const box=document.createElement("section");box.className="game-showcase";
 box.innerHTML='<div class="showcase-head"><div><span>LINKS GAME NETWORK</span><h2>One home for every way you play.</h2></div><button class="ghost" data-all-games>EXPLORE ALL GAMES ›</button></div><div class="gameart-grid">'+["football","college","bracket","racing","golf","fantasy"].map(cat=>'<button data-gamecat="'+cat+'">'+artHTML(cat)+'</button>').join("")+'</div>';
 anchor.insertAdjacentElement("afterend",box);
 box.querySelectorAll("[data-gamecat]").forEach(b=>b.addEventListener("click",()=>{const cat=b.dataset.gamecat,list=games.filter(g=>gameCategory(g[1])===cat).slice(0,12);modal(GameArt[cat].label+' GAMES','<div class="art-game-list">'+list.map(g=>'<button><span>'+g[0]+'</span><div><b>'+g[1]+'</b><small>'+g[2]+'</small></div><em>›</em></button>').join("")+'</div>')}));
 box.querySelector("[data-all-games]").addEventListener("click",()=>modal("ALL LINKS GAMES",'<div class="art-game-list">'+games.slice(0,24).map(g=>'<button><span>'+g[0]+'</span><div><b>'+g[1]+'</b><small>'+g[2]+'</small></div><em>›</em></button>').join("")+'</div>'));
}
queueMicrotask(mountGameShowcase);

// Mobile App Shell v1 — thumb-first navigation and a persistent "Now" action.
function mountMobileShell(){
 if(document.querySelector(".mobile-dock"))return;
 const dock=document.createElement("nav");dock.className="mobile-dock";
 dock.innerHTML='<button data-mobile-route="home"><i>⌂</i><span>HOME</span></button><button data-mobile-route="my-pools"><i>▦</i><span>POOLS</span></button><button class="dock-now" data-mobile-route="my-picks"><i>✓</i><span>PICKS</span><b>1</b></button><button data-mobile-route="results"><i>🏆</i><span>RESULTS</span></button><button data-mobile-route="commissioner"><i>⚙</i><span>ADMIN</span></button>';
 document.body.appendChild(dock);
 const paint=()=>{const v=new URL(location.href).searchParams.get("view")||"home";dock.querySelectorAll("[data-mobile-route]").forEach(b=>b.classList.toggle("active",b.dataset.mobileRoute===v||(v==="pool"&&b.dataset.mobileRoute==="my-pools")))};
 dock.querySelectorAll("[data-mobile-route]").forEach(b=>b.addEventListener("click",()=>{setRoute(b.dataset.mobileRoute);renderRouteWorkspace();paint();scrollTo({top:0,behavior:"smooth"})}));
 addEventListener("popstate",paint);paint();
}
queueMicrotask(mountMobileShell);

// Game-day NOW strip: remains useful without making Home noisy.
function mountNowStrip(){
 const top=document.querySelector(".top");if(!top||document.querySelector(".now-strip"))return;
 const n=document.createElement("div");n.className="now-strip";
 n.innerHTML='<span class="now-pulse"></span><b>NOW</b><div class="now-copy"><strong>1 PICK DUE</strong><span>Barnes Family · Thu 7:15 PM</span></div><button data-now-action>FINISH ›</button>';
 top.insertAdjacentElement("afterend",n);
 n.querySelector("[data-now-action]").addEventListener("click",()=>{setRoute("my-picks");renderRouteWorkspace()});
}
queueMicrotask(mountNowStrip);

// Install prompt support for browsers that expose beforeinstallprompt.
let linksInstallPrompt=null;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();linksInstallPrompt=e;document.documentElement.classList.add("can-install")});
function mountInstallCard(){
 const anchor=document.querySelector(".game-showcase");if(!anchor||document.querySelector(".install-card"))return;
 const card=document.createElement("section");card.className="install-card";
 card.innerHTML='<div class="install-emblem"><i>LINKS</i></div><div><span>PUT LINKS ON YOUR HOME SCREEN</span><b>Open your pools like an app.</b><small>Faster access · standalone display · your picks one tap away</small></div><button class="ghost" data-install-links>INSTALL</button>';
 anchor.insertAdjacentElement("afterend",card);
 card.querySelector("[data-install-links]").addEventListener("click",async()=>{if(linksInstallPrompt){linksInstallPrompt.prompt();await linksInstallPrompt.userChoice;linksInstallPrompt=null;card.remove();return}modal("INSTALL LINKS",'<div class="connected-modal"><span class="badge live">HOME SCREEN</span><h3>Keep LINKS one tap away.</h3><p>On iPhone: open the Share menu, choose Add to Home Screen, then confirm Add.</p></div>')});
}
queueMicrotask(mountInstallCard);

// Pool Hub v2 — turn the pool destination into a real game-day workspace.
function mountPoolGameDay(){
 const workspace=document.querySelector(".route-workspace");
 if(!workspace||document.documentElement.dataset.view!=="pool"||workspace.querySelector(".pool-gameday"))return;
 const pool=document.documentElement.dataset.pool||new URL(location.href).searchParams.get("pool")||"Barnes Family";
 const p=PoolHubData[pool]||PoolHubData["Barnes Family"];
 const wrap=document.createElement("section");wrap.className="pool-gameday";
 wrap.innerHTML='<div class="gameday-title"><div><span>GAME DAY</span><h2>Your week at a glance.</h2></div><div class="gameday-status"><i></i>PICKS OPEN</div></div><div class="gameday-grid"><button data-pg="picks"><small>MY PICKS</small><strong>2 / 3</strong><span>1 still needs you</span><em>FINISH ›</em></button><button data-pg="standings"><small>STANDINGS</small><strong>'+p.rank+'</strong><span>'+p.record+' this season</span><em>VIEW ›</em></button><button data-pg="compare"><small>FIELD</small><strong>'+p.ready+'/'+p.members+'</strong><span>players ready</span><em>COMPARE ›</em></button><button data-pg="room"><small>POOL ROOM</small><strong>3</strong><span>new messages</span><em>OPEN ›</em></button></div><div class="matchup-feature"><div class="matchup-kicker"><span>NEXT LOCK</span><b>'+p.lock+'</b></div><div class="matchup-teams"><div><i>TEN</i><strong>TITANS</strong><span>AWAY</span></div><div class="versus"><b>VS</b><span>WEEK 3</span></div><div><i>IND</i><strong>COLTS</strong><span>HOME</span></div></div><div class="matchup-foot"><span>YOUR PICK</span><b>'+(PickEngine.get("ten-ind")?.team||"NOT PICKED")+'</b><button data-pg="picks">MAKE PICK ›</button></div></div>';
 workspace.appendChild(wrap);
 wrap.querySelectorAll("[data-pg]").forEach(b=>b.addEventListener("click",()=>{
   const tab=b.dataset.pg;
   if(tab==="picks"){setRoute("home");renderRouteWorkspace();setTimeout(()=>document.querySelector("[data-slate]")?.scrollIntoView({behavior:"smooth",block:"center"}),60)}
   else if(tab==="standings"){setRoute("results");renderRouteWorkspace();scrollTo({top:0,behavior:"smooth"})}
   else modal(tab==="compare"?"FIELD COMPARE":"POOL ROOM",tab==="compare"?'<div class="connected-modal"><span class="badge live">AFTER LOCK</span><h3>See the field without spoiling picks.</h3><p>Selections stay hidden until the game locks. Then LINKS reveals who took each side and updates the impact live.</p></div>':'<div class="connected-modal"><span class="badge">POOL ROOM</span><h3>Your pool, together.</h3><p>Announcements, commissioner notes, reactions and weekly conversation live here without exposing protected picks.</p></div>');
 }));
}
const poolDayObserver=new MutationObserver(()=>mountPoolGameDay());poolDayObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountPoolGameDay);

// Pick celebration: subtle confirmation feedback, never blocks the workflow.
function pickCelebration(team){
 let t=document.querySelector(".pick-toast");if(t)t.remove();
 t=document.createElement("div");t.className="pick-toast";t.innerHTML='<i>✓</i><div><b>PICK SAVED</b><span>'+team+' is locked into your card</span></div>';
 document.body.appendChild(t);requestAnimationFrame(()=>t.classList.add("show"));setTimeout(()=>{t.classList.remove("show");setTimeout(()=>t.remove(),250)},1800);
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-slate] button");if(!b||b.disabled)return;const game=b.closest("[data-slate]")?.dataset.slate;if(game&&LockEngine&&!LockEngine.isLocked(game))setTimeout(()=>pickCelebration(b.textContent.trim()),80)},true);

// Pool Hub v3 — real in-context tabs instead of bouncing the player around the app.
function poolTabPanel(tab,pool){
 const p=PoolHubData[pool]||PoolHubData["Barnes Family"];
 if(tab==="picks") return '<div class="hub-panel-head"><span>MY PICKS · '+p.week+'</span><h3>Finish your card.</h3><p>Your choices save as you go. Locked games cannot be changed.</p></div><div class="hub-pick-list">'+DemoSlate.map(g=>{const saved=PickEngine.get(g.id)?.team||"";const locked=LockEngine.isLocked(g.id);return '<div class="hub-pick-row" data-hubgame="'+g.id+'"><div class="hub-game-meta"><b>'+g.away+' <i>VS</i> '+g.home+'</b><span>'+g.kick+(locked?' · LOCKED':' · OPEN')+'</span></div><div class="hub-choice"><button '+(locked?'disabled':'')+' data-hubpick="'+g.away+'">'+g.away+'</button><button '+(locked?'disabled':'')+' data-hubpick="'+g.home+'">'+g.home+'</button></div><em>'+(saved?'PICK: '+saved:'NEEDS PICK')+'</em></div>'}).join("")+'</div><button class="primary hub-confirm" data-hubconfirm>REVIEW PICKS ›</button>';
 if(tab==="standings") return '<div class="hub-panel-head"><span>LIVE STANDINGS</span><h3>Every result, one table.</h3><p>Finals score automatically. Live games stay visible without counting early.</p></div><div class="hub-standings">'+ScoreDemo.players.map((x,i)=>{const s=scored(x);return '<div class="'+(x.name==="Jake"?'me':'')+'"><strong>'+(i+1)+'</strong><b>'+x.name+'</b><span>'+s.wins+' WINS</span><em>'+(x.name==="Jake"?'YOU':'')+'</em></div>'}).join("")+'</div>';
 if(tab==="compare") return '<div class="hub-panel-head"><span>FIELD COMPARE</span><h3>Know where the pool stands.</h3><p>Before lock, other selections stay private. After lock, the field opens automatically.</p></div><div class="hub-field">'+DemoSlate.map(g=>'<div><b>'+g.away+' vs '+g.home+'</b><span>'+(LockEngine.isLocked(g.id)?'FIELD REVEALED':'PICKS HIDDEN UNTIL LOCK')+'</span><i class="'+(LockEngine.isLocked(g.id)?'open':'')+'"></i></div>').join("")+'</div>';
 if(tab==="room") return '<div class="hub-panel-head"><span>POOL ROOM</span><h3>Game day conversation.</h3><p>Commissioner updates and pool chatter without exposing protected picks.</p></div><div class="hub-chat"><div><i>JD</i><p><b>Commissioner</b><span>Week '+p.week.replace(/\D/g,"")+' is open. Get those picks in before '+p.lock+'.</span></p><time>8:14 PM</time></div><div><i>AM</i><p><b>Amanda</b><span>Mine are in. Good luck everybody!</span></p><time>8:22 PM</time></div><div><i>MK</i><p><b>Mike</b><span>This week is going to be wild.</span></p><time>8:31 PM</time></div></div><div class="hub-compose"><input placeholder="Message the pool…" maxlength="180"><button>SEND</button></div>';
 if(tab==="rules") return '<div class="hub-panel-head"><span>POOL RULES</span><h3>Simple. Clear. Always available.</h3></div><div class="hub-rules"><div><b>SCORING</b><span>1 point for each correct winner.</span></div><div><b>DEADLINE</b><span>Each game locks automatically at kickoff.</span></div><div><b>VISIBILITY</b><span>Other players’ picks remain hidden until that game locks.</span></div><div><b>TIEBREAKER</b><span>Closest combined score wins the weekly tie.</span></div></div>';
 return "";
}
function activatePoolTabs(){
 const ws=document.querySelector(".route-workspace");if(!ws||document.documentElement.dataset.view!=="pool")return;
 const pool=document.documentElement.dataset.pool||new URL(location.href).searchParams.get("pool")||"Barnes Family";
 const tabs=[...ws.querySelectorAll(".poolhub-tabs button,.pool-tabs button")];
 if(!tabs.length)return;
 let host=ws.querySelector(".pool-tab-live");if(!host){host=document.createElement("section");host.className="pool-tab-live";(ws.querySelector(".pool-gameday")||ws.lastElementChild).insertAdjacentElement("afterend",host)}
 const show=tab=>{tabs.forEach(x=>x.classList.toggle("active",x.textContent.trim().toLowerCase().includes(tab==="room"?"pool room":tab)));host.innerHTML=poolTabPanel(tab,pool);host.classList.add("visible");wireHubPanel(host,pool)};
 tabs.forEach(b=>{if(b.dataset.hubwired)return;b.dataset.hubwired="1";b.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();let t=b.textContent.trim().toLowerCase();if(t.includes("pick"))t="picks";else if(t.includes("standing"))t="standings";else if(t.includes("compare"))t="compare";else if(t.includes("room"))t="room";else if(t.includes("rule"))t="rules";else{host.classList.remove("visible");return}show(t)},true)});
}
function wireHubPanel(host,pool){
 host.querySelectorAll("[data-hubpick]").forEach(b=>b.addEventListener("click",()=>{const row=b.closest("[data-hubgame]"),id=row.dataset.hubgame;if(LockEngine.isLocked(id))return;PickEngine.save(id,b.dataset.hubpick);row.querySelectorAll("[data-hubpick]").forEach(x=>x.classList.toggle("selected",x===b));row.querySelector("em").textContent="PICK: "+b.dataset.hubpick;pickCelebration(b.dataset.hubpick)}));
 host.querySelector("[data-hubconfirm]")?.addEventListener("click",()=>modal("PICKS SAVED",'<div class="connected-modal"><span class="badge live">CONFIRMED</span><h3>Your card is saved.</h3><p>You can change any open game until its kickoff. Locked selections stay protected.</p></div>'));
 const send=host.querySelector(".hub-compose button"),input=host.querySelector(".hub-compose input");send?.addEventListener("click",()=>{if(!input.value.trim())return;const chat=host.querySelector(".hub-chat"),d=document.createElement("div");d.innerHTML='<i>JD</i><p><b>You</b><span>'+input.value.replace(/[<>]/g,"")+'</span></p><time>NOW</time>';chat.appendChild(d);input.value=""});
}
const hubTabObserver=new MutationObserver(()=>activatePoolTabs());hubTabObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(activatePoolTabs);

// Commissioner Command v3 — operational week control, readiness and one-tap actions.
const CommissionerState={
 key:"links-commissioner-v1",
 read(){try{return JSON.parse(localStorage.getItem(this.key)||"{}")}catch{return{}}},
 write(p){const n={...this.read(),...p};localStorage.setItem(this.key,JSON.stringify(n));return n}
};
function commissionerPanel(){
 const s=CommissionerState.read(),week=s.week||3,open=s.open!==false;
 return '<section class="commander-v3"><div class="command-hero"><div><span>COMMISSIONER COMMAND</span><h2>Week '+week+' is '+(open?'open.':'closed.')+'</h2><p>Run the pool without hunting through settings.</p></div><div class="command-health"><i class="'+(open?'live':'')+'"></i><b>'+(open?'HEALTHY':'CLOSED')+'</b><small>SCORING FEED · '+(open?'LIVE':'PAUSED')+'</small></div></div><div class="command-metrics"><button data-cmd="entrants"><small>READY</small><strong>59 / 64</strong><span>5 need picks</span></button><button data-cmd="invites"><small>INVITES</small><strong>2</strong><span>still unopened</span></button><button data-cmd="locks"><small>NEXT LOCK</small><strong>7:15</strong><span>Thursday PM</span></button><button data-cmd="audit"><small>AUDIT</small><strong>'+AuditLog.all().length+'</strong><span>recorded events</span></button></div><div class="command-actions"><button class="primary" data-cmd="remind">REMIND 5 MISSING</button><button data-cmd="week">'+(open?'CLOSE WEEK':'OPEN WEEK')+'</button><button data-cmd="message">MESSAGE POOL</button><button data-cmd="settings">POOL SETTINGS</button></div><div class="command-feed"><div class="command-feed-head"><b>WEEK CONTROL</b><span>Automatic kickoff locks are ON</span></div>'+DemoSlate.map(g=>'<div class="command-game"><div><b>'+g.away+' <i>VS</i> '+g.home+'</b><span>'+g.kick+'</span></div><em class="'+(LockEngine.isLocked(g.id)?'locked':'')+'">'+(LockEngine.isLocked(g.id)?'LOCKED':'AUTO LOCK')+'</em><button data-cmdlock="'+g.id+'">'+(LockEngine.isLocked(g.id)?'UNLOCK':'LOCK NOW')+'</button></div>').join("")+'</div></section>';
}
function mountCommissionerV3(){
 const ws=document.querySelector(".route-workspace");if(!ws||document.documentElement.dataset.view!=="commissioner"||ws.querySelector(".commander-v3"))return;
 ws.insertAdjacentHTML("beforeend",commissionerPanel());wireCommissionerV3(ws);
}
function wireCommissionerV3(ws){
 ws.querySelector('[data-cmd="remind"]')?.addEventListener("click",()=>{["Amanda","Chris"].forEach(n=>ReminderQueue.add?.(n));AuditLog.add("REMINDER BATCH","Missing-pick reminder sent");modal("REMINDERS SENT",'<div class="connected-modal"><span class="badge live">5 PLAYERS</span><h3>Missing-pick reminders queued.</h3><p>No selections were exposed. Players receive only the games they still need to complete.</p></div>')});
 ws.querySelector('[data-cmd="week"]')?.addEventListener("click",()=>{const s=CommissionerState.read(),open=s.open!==false;CommissionerState.write({open:!open});AuditLog.add(open?"WEEK CLOSED":"WEEK OPENED","Commissioner changed weekly access");ws.querySelector(".commander-v3").outerHTML=commissionerPanel();wireCommissionerV3(ws)});
 ws.querySelector('[data-cmd="audit"]')?.addEventListener("click",()=>modal("AUDIT HISTORY",'<div class="art-game-list">'+AuditLog.all().slice(0,20).map(a=>'<button><span>•</span><div><b>'+a.action+'</b><small>'+a.detail+'</small></div><em>'+new Date(a.at||a.time||Date.now()).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})+'</em></button>').join("")+'</div>'));
 ws.querySelector('[data-cmd="entrants"]')?.addEventListener("click",()=>document.querySelector(".entrant-manager")?.scrollIntoView({behavior:"smooth"}));
 ws.querySelector('[data-cmd="message"]')?.addEventListener("click",()=>modal("MESSAGE POOL",'<div class="connected-modal"><span class="badge">64 PLAYERS</span><h3>Send a pool announcement.</h3><p>Messages can appear in Pool Room and later route through email or text notification services.</p></div>'));
 ws.querySelector('[data-cmd="settings"]')?.addEventListener("click",()=>modal("POOL SETTINGS",'<div class="connected-modal"><span class="badge">BARNES FAMILY</span><h3>Core settings stay protected.</h3><p>Pool name, rules, active games, commissioner contact, tie-breaker and notification controls will live here.</p></div>'));
 ws.querySelectorAll("[data-cmdlock]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.cmdlock,locked=LockEngine.isLocked(id);LockEngine.set(id,!locked,locked?"Commissioner manual unlock":"Commissioner manual lock");const sec=ws.querySelector(".commander-v3");sec.outerHTML=commissionerPanel();wireCommissionerV3(ws)}));
}
const commissionerObserver=new MutationObserver(()=>mountCommissionerV3());commissionerObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountCommissionerV3);

// LINKS Graphics Pass v2 — shared premium visual language for live, locked, winner and commissioner states.
function mountVisualFX(){
 if(document.querySelector(".links-ambient"))return;
 const fx=document.createElement("div");fx.className="links-ambient";fx.innerHTML='<i></i><i></i><i></i><span></span>';document.body.prepend(fx);
 document.querySelectorAll(".card,.panel,.pool,.route-pool,.commander-v3,.pool-gameday").forEach(el=>el.classList.add("links-surface"));
}
const visualObserver=new MutationObserver(()=>mountVisualFX());visualObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountVisualFX);

function linksBadge(type,label){
 const icons={live:"●",locked:"◆",winner:"★",admin:"⌁",saved:"✓"};
 return '<span class="links-state '+type+'"><i>'+icons[type]+'</i>'+label+'</span>';
}
// Add branded state badges to key surfaces as they appear.
function paintStateGraphics(){
 document.querySelectorAll(".gameday-status").forEach(x=>{if(!x.dataset.fx){x.dataset.fx=1;x.innerHTML=linksBadge("live","PICKS OPEN")}});
 document.querySelectorAll(".command-health").forEach(x=>x.classList.add("command-emblem"));
 document.querySelectorAll(".hub-pick-row").forEach(row=>{const id=row.dataset.hubgame;if(id&&LockEngine.isLocked(id))row.classList.add("is-locked")});
}
const stateObserver=new MutationObserver(()=>paintStateGraphics());stateObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(paintStateGraphics);

// Results Experience v2 — live scoreboard, movement, winners and weekly recap.
function resultsArena(){
 const rows=ScoreDemo.players.map((p,i)=>{const s=scored(p);const move=i===0?"+1":i===1?"−1":"—";return '<div class="result-rank '+(p.name==="Jake"?"me":"")+'"><strong>'+(i+1)+'</strong><div><b>'+p.name+'</b><span>'+(p.name==="Jake"?"YOU · ":"")+s.wins+' correct</span></div><em class="'+(move.includes("+")?"up":move.includes("−")?"down":"")+'">'+move+'</em><i>'+s.wins+'<small>PTS</small></i></div>'}).join("");
 return '<section class="results-arena"><div class="results-hero"><div><span>LINKS LIVE</span><h2>Every game changes the board.</h2><p>Finals score automatically. Live games show impact without counting early.</p></div><div class="results-live"><i></i><b>1 LIVE</b><small>2 FINAL</small></div></div><div class="score-ribbon">'+ScoreDemo.games.map(g=>'<div class="'+(g.final?"final":"live")+'"><span>'+(g.final?"FINAL":"LIVE")+'</span><b>'+g.away+' '+g.awayScore+'</b><b>'+g.home+' '+g.homeScore+'</b><em>'+(g.final?"SCORING COMPLETE":"4TH · 8:42")+'</em></div>').join("")+'</div><div class="results-body"><div class="leaderboard-v2"><div class="section-cap"><span>LIVE STANDINGS</span><b>WEEK 3</b></div>'+rows+'</div><aside class="weekly-winner"><span>WEEKLY LEADER</span><div class="winner-mark">★</div><h3>'+ScoreDemo.players[0].name+'</h3><b>'+scored(ScoreDemo.players[0]).wins+' CORRECT</b><p>Currently on top with one game still live.</p><button data-result-share>SHARE RESULT</button></aside></div><div class="result-impact"><div><span>LIVE IMPACT</span><h3>TEN at IND</h3><p>A Tennessee result moves 18 players up. Indianapolis keeps 31 players ahead of the field.</p></div><div class="impact-meter"><i style="width:37%"></i><span>37% TEN</span><b>63% IND</b></div></div></section>';
}
function mountResultsArena(){
 const ws=document.querySelector(".route-workspace");if(!ws||document.documentElement.dataset.view!=="results"||ws.querySelector(".results-arena"))return;
 ws.insertAdjacentHTML("beforeend",resultsArena());
 ws.querySelector("[data-result-share]")?.addEventListener("click",()=>modal("SHARE WEEK 3",'<div class="connected-modal"><span class="badge live">LINKS RESULT</span><h3>'+ScoreDemo.players[0].name+' leads Week 3.</h3><p>'+scored(ScoreDemo.players[0]).wins+' correct with one game still live. A finished share card can be sent from here without exposing anyone’s protected picks.</p></div>'));
}
const resultsObserver=new MutationObserver(()=>mountResultsArena());resultsObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountResultsArena);

// Smart Inbox v2 — one place for commissioner notices, lock alerts and results.
const InboxStore={
 key:"links-inbox-v2",
 seed:[
  {id:"lock",type:"urgent",icon:"⏱",title:"1 pick still missing",body:"Barnes Family · TEN at IND locks Thursday at 7:15 PM.",time:"NOW",action:"PICKS",read:false},
  {id:"commish",type:"admin",icon:"L",title:"Commissioner update",body:"Week 3 is open. Get your picks in before kickoff.",time:"18m",action:"POOL",read:false},
  {id:"result",type:"result",icon:"★",title:"You moved into T-1",body:"Two finals moved you up one spot in Barnes Family.",time:"42m",action:"RESULTS",read:true},
  {id:"invite",type:"invite",icon:"+",title:"Pool invitation",body:"You were invited to Last One Standing.",time:"2h",action:"POOL",read:true}
 ],
 all(){try{const x=JSON.parse(localStorage.getItem(this.key));return Array.isArray(x)?x:this.seed}catch{return this.seed}},
 save(x){localStorage.setItem(this.key,JSON.stringify(x))},
 mark(id){const a=this.all().map(x=>x.id===id?{...x,read:true}:x);this.save(a);return a}
};
function inboxView(){
 const items=InboxStore.all(),unread=items.filter(x=>!x.read).length;
 return '<section class="smart-inbox-v2"><div class="inbox-hero"><div><span>SMART INBOX</span><h2>'+unread+' things need your attention.</h2><p>Deadlines, pool updates and results — without the noise.</p></div><div class="inbox-orb"><b>'+unread+'</b><span>UNREAD</span></div></div><div class="inbox-filter"><button class="active" data-ifilter="all">ALL</button><button data-ifilter="urgent">ACTION</button><button data-ifilter="admin">POOL</button><button data-ifilter="result">RESULTS</button></div><div class="inbox-list">'+items.map(x=>'<button class="inbox-item '+x.type+' '+(!x.read?'unread':'')+'" data-inbox="'+x.id+'" data-itype="'+x.type+'"><i>'+x.icon+'</i><div><b>'+x.title+'</b><span>'+x.body+'</span></div><time>'+x.time+'</time><em>'+x.action+' ›</em></button>').join("")+'</div></section>';
}
function mountInboxV2(){
 const ws=document.querySelector(".route-workspace"),v=document.documentElement.dataset.view;
 if(!ws||!(v==="messages"||v==="notifications")||ws.querySelector(".smart-inbox-v2"))return;
 ws.insertAdjacentHTML("beforeend",inboxView());wireInboxV2(ws);
}
function wireInboxV2(ws){
 ws.querySelectorAll("[data-ifilter]").forEach(b=>b.addEventListener("click",()=>{ws.querySelectorAll("[data-ifilter]").forEach(x=>x.classList.toggle("active",x===b));ws.querySelectorAll(".inbox-item").forEach(x=>x.hidden=b.dataset.ifilter!=="all"&&x.dataset.itype!==b.dataset.ifilter)}));
 ws.querySelectorAll("[data-inbox]").forEach(b=>b.addEventListener("click",()=>{InboxStore.mark(b.dataset.inbox);const t=b.querySelector("em").textContent;if(t.includes("PICKS")){setRoute("my-picks");renderRouteWorkspace()}else if(t.includes("RESULTS")){setRoute("results");renderRouteWorkspace()}else{setRoute("my-pools");renderRouteWorkspace()}}));
}
const inboxObserver=new MutationObserver(()=>mountInboxV2());inboxObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountInboxV2);

// Keep mobile unread badge tied to actual inbox state.
function syncDockInbox(){
 const unread=InboxStore.all().filter(x=>!x.read).length;
 document.querySelectorAll(".mobile-dock [data-mobile-route='my-picks'] b").forEach(x=>{x.textContent=Math.max(1,unread);x.title=unread+" unread alerts"});
}
queueMicrotask(syncDockInbox);

// My Picks v3 — cross-pool command card with deadline priority and completion.
const MyPickCards=[
 {pool:"Barnes Family",game:"NFL PICK’EM",due:"THU · 7:15 PM",done:2,total:3,state:"action",note:"1 PICK MISSING"},
 {pool:"Saturday Crew",game:"COLLEGE PICK’EM",due:"SAT · 11:00 AM",done:10,total:10,state:"ready",note:"CARD COMPLETE"},
 {pool:"Last One Standing",game:"SURVIVOR",due:"SUN · 12:00 PM",done:0,total:1,state:"action",note:"SELECTION NEEDED"}
];
function myPicksCommand(){
 return '<section class="mypicks-v3"><div class="mypicks-hero"><div><span>MY PICKS</span><h2>Two decisions. Then you’re done.</h2><p>LINKS sorts every pool by what needs you first.</p></div><div class="pick-health-ring"><b>85%</b><span>WEEK READY</span></div></div><div class="deadline-line"><i></i><div><span>NEXT LOCK</span><b>Barnes Family · Thursday 7:15 PM</b></div><em>1 PICK DUE</em></div><div class="pick-command-grid">'+MyPickCards.map((x,i)=>'<button class="pick-command-card '+x.state+'" data-pickpool="'+x.pool+'"><div class="pick-card-art '+gameCategory(x.game)+'">'+artHTML(gameCategory(x.game))+'</div><div class="pick-card-copy"><span>'+x.game+'</span><h3>'+x.pool+'</h3><div class="pick-progress"><i style="width:'+Math.round(x.done/x.total*100)+'%"></i></div><small>'+x.done+' OF '+x.total+' SAVED · '+x.due+'</small><b>'+x.note+' ›</b></div></button>').join("")+'</div><div class="pick-safe-banner"><div class="safe-shield">✓</div><div><b>PICK SAFE</b><span>Your saved picks stay private until each game locks.</span></div><em>AUTO-SAVE ON</em></div></section>';
}
function mountMyPicksV3(){
 const ws=document.querySelector(".route-workspace");if(!ws||document.documentElement.dataset.view!=="my-picks"||ws.querySelector(".mypicks-v3"))return;
 ws.insertAdjacentHTML("beforeend",myPicksCommand());
 ws.querySelectorAll("[data-pickpool]").forEach(b=>b.addEventListener("click",()=>openPoolHub(b.dataset.pickpool)));
}
const myPicksObserver=new MutationObserver(()=>mountMyPicksV3());myPicksObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountMyPicksV3);

// Pool Setup Studio v1 — researched commissioner options surfaced as a clean LINKS flow.
const SetupState={key:"links-setup-v1",read(){try{return JSON.parse(localStorage.getItem(this.key)||"{}")}catch{return{}}},write(p){const n={...this.read(),...p};localStorage.setItem(this.key,JSON.stringify(n));return n}};
function setupStudio(){
 const s={format:"Straight Up",deadline:"Per-game kickoff",tiebreak:"Combined score",picks:"All selected games",confidence:false,bestBet:false,...SetupState.read()};
 return '<section class="setup-studio"><div class="setup-hero"><div><span>POOL SETUP STUDIO</span><h2>Powerful rules. Simple setup.</h2><p>Everything important is visible before the pool goes live.</p></div><div class="setup-score"><b>6</b><span>CORE RULES</span></div></div><div class="setup-grid"><div class="setup-card"><span>GAME STYLE</span><h3>'+s.format+'</h3><div class="segmented" data-setup="format"><button class="'+(s.format==="Straight Up"?"active":"")+'">Straight Up</button><button class="'+(s.format==="Against Spread"?"active":"")+'">Against Spread</button></div></div><div class="setup-card"><span>DEADLINE</span><h3>'+s.deadline+'</h3><div class="segmented" data-setup="deadline"><button class="'+(s.deadline==="Per-game kickoff"?"active":"")+'">Per-game kickoff</button><button class="'+(s.deadline==="Weekly deadline"?"active":"")+'">Weekly deadline</button></div></div><div class="setup-card"><span>PICK REQUIREMENT</span><h3>'+s.picks+'</h3><div class="segmented" data-setup="picks"><button class="active">All selected games</button><button>Set weekly number</button></div></div><div class="setup-card"><span>TIEBREAKER</span><h3>'+s.tiebreak+'</h3><div class="segmented" data-setup="tiebreak"><button class="active">Combined score</button><button>None</button></div></div></div><div class="setup-toggles"><button data-toggle="confidence" class="'+(s.confidence?"on":"")+'"><i></i><div><b>CONFIDENCE POINTS</b><span>Players rank picks by confidence.</span></div><em>'+(s.confidence?"ON":"OFF")+'</em></button><button data-toggle="bestBet" class="'+(s.bestBet?"on":"")+'"><i></i><div><b>BEST BET</b><span>Optional featured pick for bonus scoring.</span></div><em>'+(s.bestBet?"ON":"OFF")+'</em></button></div><div class="setup-preview"><div><span>PLAYER PREVIEW</span><h3>What members will see</h3></div><div class="preview-rule"><b>1</b><span>Pick each selected game</span></div><div class="preview-rule"><b>2</b><span>Picks lock '+s.deadline.toLowerCase()+'</span></div><div class="preview-rule"><b>3</b><span>'+s.tiebreak+' breaks weekly ties</span></div><button data-save-setup>SAVE POOL RULES</button></div></section>';
}
function openSetupStudio(){
 modal("POOL SETUP",'<div id="setupMount"></div>');const host=document.querySelector("#setupMount");host.innerHTML=setupStudio();wireSetup(host);
}
function wireSetup(host){
 host.querySelectorAll("[data-setup]").forEach(g=>g.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{SetupState.write({[g.dataset.setup]:b.textContent.trim()});host.innerHTML=setupStudio();wireSetup(host)})));
 host.querySelectorAll("[data-toggle]").forEach(b=>b.addEventListener("click",()=>{const s=SetupState.read(),k=b.dataset.toggle;SetupState.write({[k]:!s[k]});host.innerHTML=setupStudio();wireSetup(host)}));
 host.querySelector("[data-save-setup]")?.addEventListener("click",()=>{AuditLog.add("POOL RULES SAVED","Commissioner updated scoring and deadline configuration");modal("RULES SAVED",'<div class="connected-modal"><span class="badge live">READY</span><h3>Pool rules saved.</h3><p>Players will see the same rules in their Pool Hub before making picks.</p></div>')});
}
document.addEventListener("click",e=>{if(e.target.closest('[data-cmd="settings"]')){e.preventDefault();e.stopImmediatePropagation();openSetupStudio()}},true);

// Commissioner Autopilot v1 — researched weekly checklist + resilient no-show policy.
const AutopilotState={key:"links-autopilot-v1",read(){try{return JSON.parse(localStorage.getItem(this.key)||"{}")}catch{return{}}},write(p){const n={...this.read(),...p};localStorage.setItem(this.key,JSON.stringify(n));return n}};
function autopilotPanel(){
 const s={reminders:true,recap:true,autopick:false,...AutopilotState.read()};
 const tasks=[["SLATE","Week 3 games loaded","done"],["ACCESS","Picks are open","done"],["PLAYERS","5 players still need picks","action"],["SCORING","Feed healthy","done"],["RECAP","Send after final game",s.recap?"armed":"off"]];
 return '<section class="autopilot-v1"><div class="auto-head"><div><span>COMMISSIONER AUTOPILOT</span><h2>Run the week by exception.</h2><p>LINKS handles routine work and puts only the exceptions in front of you.</p></div><div class="auto-orbit"><i></i><b>AUTO</b><small>WATCHING</small></div></div><div class="auto-task-list">'+tasks.map(t=>'<div class="'+t[2]+'"><i>'+(t[2]==="done"?"✓":t[2]==="action"?"!":"●")+'</i><b>'+t[0]+'</b><span>'+t[1]+'</span><em>'+t[2].toUpperCase()+'</em></div>').join("")+'</div><div class="auto-controls"><button data-auto="reminders" class="'+(s.reminders?"on":"")+'"><i></i><div><b>MISSING-PICK REMINDERS</b><span>Only contact players who still need picks.</span></div><em>'+(s.reminders?"ON":"OFF")+'</em></button><button data-auto="recap" class="'+(s.recap?"on":"")+'"><i></i><div><b>WEEKLY RECAP</b><span>Prepare standings and winner recap after finals.</span></div><em>'+(s.recap?"ON":"OFF")+'</em></button><button data-auto="autopick" class="'+(s.autopick?"on":"")+'"><i></i><div><b>NO-SHOW AUTO PICK</b><span>Optional fallback policy; commissioner controlled.</span></div><em>'+(s.autopick?"ON":"OFF")+'</em></button></div><div class="auto-next"><span>NEXT AUTOMATION</span><b>Missing-pick check</b><em>Before Thursday lock</em><button data-auto-run>RUN CHECK NOW ›</button></div></section>';
}
function mountAutopilot(){
 const ws=document.querySelector(".route-workspace");if(!ws||document.documentElement.dataset.view!=="commissioner"||ws.querySelector(".autopilot-v1"))return;
 const cmd=ws.querySelector(".commander-v3");if(cmd)cmd.insertAdjacentHTML("afterend",autopilotPanel());else ws.insertAdjacentHTML("beforeend",autopilotPanel());wireAutopilot(ws);
}
function wireAutopilot(ws){
 ws.querySelectorAll("[data-auto]").forEach(b=>b.addEventListener("click",()=>{const k=b.dataset.auto,s=AutopilotState.read();AutopilotState.write({[k]:!(s[k]??(k!=="autopick"))});AuditLog.add("AUTOPILOT UPDATED",k+" setting changed");const old=ws.querySelector(".autopilot-v1");old.outerHTML=autopilotPanel();wireAutopilot(ws)}));
 ws.querySelector("[data-auto-run]")?.addEventListener("click",()=>{AuditLog.add("AUTOPILOT CHECK","Weekly readiness check completed");modal("WEEK CHECK COMPLETE",'<div class="connected-modal"><span class="badge live">5 NEED PICKS</span><h3>Everything else is ready.</h3><p>Games are loaded, picks are open, scoring is healthy and only the five missing players need attention.</p></div>')});
}
const autoObserver=new MutationObserver(()=>mountAutopilot());autoObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountAutopilot);

// Pool Room v2 — persistent, safe, game-day conversation.
const RoomStore={
 key:"links-room-v2",
 load(pool){try{const x=JSON.parse(localStorage.getItem(this.key)||"{}");return x[pool]||[]}catch{return[]}},
 add(pool,text){let all={};try{all=JSON.parse(localStorage.getItem(this.key)||"{}")}catch{};const arr=all[pool]||[];arr.push({who:"Jake",text:String(text).slice(0,280),at:new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})});all[pool]=arr.slice(-40);localStorage.setItem(this.key,JSON.stringify(all));return all[pool]}
};
function roomV2(pool){
 const seed=[{who:"Commissioner",text:"Week 3 is open. Picks lock at each game kickoff.",at:"9:04 AM"},{who:"Amanda",text:"That Thursday game is tougher than it looks.",at:"11:18 AM"},{who:"Mike",text:"I’m locked in. Good luck everybody.",at:"1:42 PM"}];
 const msgs=[...seed,...RoomStore.load(pool)];
 return '<section class="room-v2"><div class="room-hero"><div><span>POOL ROOM</span><h2>'+pool+'</h2><p>Game-day talk, commissioner updates and bragging rights.</p></div><div class="room-live"><i></i><b>64</b><span>MEMBERS</span></div></div><div class="room-pinned"><i>L</i><div><span>PINNED BY COMMISSIONER</span><b>Week 3 picks lock at each game kickoff.</b></div><em>RULES ›</em></div><div class="room-feed">'+msgs.map((m,i)=>'<div class="room-message '+(m.who==="Jake"?"mine":"")+'"><i>'+m.who.charAt(0)+'</i><div><b>'+m.who+(m.who==="Commissioner"?' <small>COMMISSIONER</small>':'')+'</b><p></p><time>'+m.at+'</time></div></div>').join("")+'</div><form class="room-compose"><i>J</i><input maxlength="280" placeholder="Message the pool…" autocomplete="off"><button>SEND</button></form><div class="room-foot"><span>Keep it fun. Commissioner can moderate the room.</span><b>GAME DAY CHAT</b></div></section>';
}
function hydrateRoomText(host,pool){
 const seed=["Week 3 is open. Picks lock at each game kickoff.","That Thursday game is tougher than it looks.","I’m locked in. Good luck everybody."];
 const texts=[...seed,...RoomStore.load(pool).map(x=>x.text)];
 host.querySelectorAll(".room-message p").forEach((p,i)=>p.textContent=texts[i]||"");
}
function openRoomV2(pool){
 const html='<div id="roomV2Mount"></div>';modal("POOL ROOM",html);
 const host=document.querySelector("#roomV2Mount");host.innerHTML=roomV2(pool);hydrateRoomText(host,pool);
 host.querySelector(".room-compose")?.addEventListener("submit",e=>{e.preventDefault();const input=e.currentTarget.querySelector("input"),v=input.value.trim();if(!v)return;RoomStore.add(pool,v);host.innerHTML=roomV2(pool);hydrateRoomText(host,pool);openRoomWire(host,pool);host.querySelector(".room-feed")?.scrollTo(0,99999)});
 openRoomWire(host,pool);
}
function openRoomWire(host,pool){
 host.querySelector(".room-pinned")?.addEventListener("click",()=>{modal("POOL RULES",'<div class="connected-modal"><span class="badge live">WEEK 3</span><h3>Kickoff lock is active.</h3><p>Each selection becomes final when that game begins. Other unlocked games remain editable.</p></div>')});
}
document.addEventListener("click",e=>{
 const btn=e.target.closest("[data-room-v2], .gameday-card.room");
 if(!btn)return;
 const hub=document.querySelector(".poolhub-hero h1,.poolhub-hero h2");
 const pool=hub?.textContent?.trim()||new URL(location.href).searchParams.get("pool")||"Barnes Family";
 e.preventDefault();e.stopImmediatePropagation();openRoomV2(pool);
},true);

// Game Network v2 — richer scalable visual identities for the full LINKS catalog.
const NetworkGames=[
 ["NFL PICK’EM","football","Pick every matchup. LINKS tracks the rest."],
 ["COLLEGE PICK’EM","college","Saturday slate built for your group."],
 ["SURVIVOR","survivor","One team. One life. Keep moving."],
 ["CONFIDENCE","confidence","Rank the card. Make every point matter."],
 ["SQUARES","squares","Classic grid. Automatic quarter results."],
 ["MARCH MADNESS","bracket","Build the bracket. Follow every round."],
 ["GOLF MAJORS","golf","One & Done, Pick X and majors pools."],
 ["NASCAR","racing","Drivers, stages and race-day pools."],
 ["FANTASY FOOTBALL","fantasy","Lineups, matchups and weekly decisions."],
 ["DYNASTY","dynasty","Contracts, picks and long-term roster building."],
 ["GAME 33","game33","Chase 33 points through the NFL week."],
 ["CUSTOM POOL","custom","Your rules. Your people. Your game."]
];
function networkGlyph(type){
 const g={football:"<i class='ball-mark'></i>",college:"<i class='goal-mark'></i>",survivor:"<i class='shield-mark'>1</i>",confidence:"<i class='rank-mark'>1<br>2<br>3</i>",squares:"<i class='grid-mark'></i>",bracket:"<i class='bracket-mark'>⌜<br>⌞</i>",golf:"<i class='golf-mark'>⚑</i>",racing:"<i class='race-mark'>▥</i>",fantasy:"<i class='crown-mark'>♛</i>",dynasty:"<i class='dynasty-mark'>D</i>",game33:"<i class='thirtythree-mark'>33</i>",custom:"<i class='custom-mark'>＋</i>"};return g[type]||g.custom;
}
function gameNetworkV2(){
 return '<section class="game-network-v2"><div class="network-head"><div><span>LINKS GAME NETWORK</span><h2>One app. Every kind of competition.</h2><p>Each format gets its own identity without leaving the LINKS universe.</p></div><button data-network-all>EXPLORE ALL GAMES ›</button></div><div class="network-grid">'+NetworkGames.map((x,i)=>'<button class="network-game ng-'+x[1]+'" data-network-game="'+x[0]+'"><div class="network-art"><span>LINKS</span>'+networkGlyph(x[1])+'<em>0'+(i+1)+'</em></div><div class="network-copy"><span>'+x[1].toUpperCase()+'</span><h3>'+x[0]+'</h3><p>'+x[2]+'</p><b>OPEN GAME ›</b></div></button>').join("")+'</div></section>';
}
function mountGameNetworkV2(){
 const home=document.querySelector(".main");if(!home||document.documentElement.dataset.view!=="home"||home.querySelector(".game-network-v2"))return;
 const old=home.querySelector(".game-network-showcase");if(old)old.replaceWith(document.createRange().createContextualFragment(gameNetworkV2()));else home.insertAdjacentHTML("beforeend",gameNetworkV2());
 home.querySelectorAll("[data-network-game]").forEach(b=>b.addEventListener("click",()=>modal(b.dataset.networkGame,'<div class="connected-modal"><span class="badge live">LINKS GAME NETWORK</span><h3>'+b.dataset.networkGame+'</h3><p>This game lives inside the same LINKS account, pool and commissioner system. Game-specific setup opens from here.</p></div>')));
 home.querySelector("[data-network-all]")?.addEventListener("click",()=>{document.querySelector("[data-category='all'],[data-game-category='all']")?.click()});
}
const networkObserver=new MutationObserver(()=>mountGameNetworkV2());networkObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountGameNetworkV2);

// Resilient app states v1 — loading, offline, saved, empty and update-ready feedback.
const AppStatus={
 show(type,title,detail,ttl=2600){
  let h=document.querySelector(".links-status-stack");if(!h){h=document.createElement("div");h.className="links-status-stack";document.body.appendChild(h)}
  const n=document.createElement("div");n.className="links-status "+type;
  const mark=document.createElement("i");mark.textContent=type==="ok"?"✓":type==="warn"?"!":type==="offline"?"↯":"●";
  const copy=document.createElement("div"),b=document.createElement("b"),s=document.createElement("span");b.textContent=title;s.textContent=detail||"";copy.append(b,s);n.append(mark,copy);h.appendChild(n);
  requestAnimationFrame(()=>n.classList.add("show"));if(ttl)setTimeout(()=>{n.classList.remove("show");setTimeout(()=>n.remove(),220)},ttl);
 },
 online(){this.show("ok","Back online","LINKS can sync new activity again.")},
 offline(){this.show("offline","You’re offline","Saved picks on this device are still available.",0)}
};
window.addEventListener("offline",()=>AppStatus.offline());
window.addEventListener("online",()=>{document.querySelectorAll(".links-status.offline").forEach(x=>x.remove());AppStatus.online()});

// Consistent button feedback so navigation/actions never feel dead.
document.addEventListener("click",e=>{
 const b=e.target.closest("button,a");if(!b||b.classList.contains("is-busy")||b.closest(".segmented"))return;
 if(b.hasAttribute("disabled"))return;
 b.classList.add("tap-feedback");setTimeout(()=>b.classList.remove("tap-feedback"),360);
},true);

// Pick saves get a durable confirmation rather than relying only on color.
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-pick-team],[data-hub-team]");
 if(!b)return;setTimeout(()=>AppStatus.show("ok","Pick saved","Your selection is stored on this device."),90);
},true);

// Empty-state component for future live-data gaps.
function linksEmpty(kind="picks",title="Nothing here yet",detail="When activity arrives, LINKS will put it here."){
 const glyph={picks:"✓",results:"★",messages:"✦",pools:"L"}[kind]||"L";
 return '<div class="links-empty '+kind+'"><i>'+glyph+'</i><h3>'+title+'</h3><p>'+detail+'</p></div>';
}

// PWA/service-worker update detector: never silently strand users on an old build.
if("serviceWorker" in navigator){
 navigator.serviceWorker.ready.then(reg=>{
  reg.addEventListener("updatefound",()=>{
   const w=reg.installing;if(!w)return;
   w.addEventListener("statechange",()=>{if(w.state==="installed"&&navigator.serviceWorker.controller)AppStatus.show("warn","LINKS update ready","Close and reopen, or refresh, to load the newest build.",0)});
  });
 }).catch(()=>{});
}

// Invite Center v2 — commissioner growth flow with link, email/SMS handoff and join preview.
const InviteState={key:"links-invites-v2",read(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch{return[]}},add(v){const a=this.read();a.unshift({value:v,at:new Date().toISOString(),status:"sent"});localStorage.setItem(this.key,JSON.stringify(a.slice(0,30)));return a}};
function inviteCenter(pool="Barnes Family"){
 const base=location.origin+location.pathname+"?view=pool&pool="+encodeURIComponent(pool)+"&invite=1";
 const sent=InviteState.read();
 return '<section class="invite-v2"><div class="invite-hero"><div><span>INVITE CENTER</span><h2>Bring the whole group in.</h2><p>One link opens the right pool. Existing members sign in; new players get a short setup.</p></div><div class="invite-mark">+</div></div><div class="invite-link"><div><span>POOL INVITE LINK</span><b data-invite-url></b></div><button data-copy-invite>COPY LINK</button></div><div class="invite-actions"><button data-share-invite="text"><i>↗</i><div><b>SHARE INVITE</b><span>Text, email or any installed app</span></div></button><button data-share-invite="email"><i>@</i><div><b>EMAIL</b><span>Open a prefilled invitation</span></div></button></div><form class="invite-direct"><div><span>DIRECT INVITE</span><h3>Email or mobile number</h3></div><input type="text" placeholder="player@email.com or mobile number" autocomplete="off"><button>SEND INVITE</button></form><div class="join-preview"><span>WHAT PLAYERS SEE</span><div><i>L</i><div><b>'+pool+'</b><small>You’ve been invited to join</small></div><em>JOIN POOL ›</em></div><p>No pool searching. The invitation takes them directly to the correct pool.</p></div>'+(sent.length?'<div class="invite-history"><span>RECENT INVITES</span>'+sent.slice(0,3).map(x=>'<div><b></b><em>SENT</em></div>').join("")+'</div>':'')+'</section>';
}
function openInviteCenter(pool){
 modal("INVITE PLAYERS",'<div id="inviteV2Mount"></div>');const h=document.querySelector("#inviteV2Mount");h.innerHTML=inviteCenter(pool);wireInvite(h,pool);
}
function wireInvite(h,pool){
 const url=location.origin+location.pathname+"?view=pool&pool="+encodeURIComponent(pool)+"&invite=1";
 const urlEl=h.querySelector("[data-invite-url]");if(urlEl)urlEl.textContent=url;
 h.querySelectorAll(".invite-history div b").forEach((b,i)=>b.textContent=InviteState.read()[i]?.value||"");
 h.querySelector("[data-copy-invite]")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(url);AppStatus.show("ok","Invite link copied","Ready to paste into a message.")}catch{AppStatus.show("warn","Copy unavailable","Select the invite link and copy it manually.")}});
 h.querySelector('[data-share-invite="text"]')?.addEventListener("click",async()=>{const data={title:"Join "+pool+" on LINKS",text:"Join my "+pool+" pool on LINKS.",url};if(navigator.share){try{await navigator.share(data)}catch{}}else{AppStatus.show("warn","Share menu unavailable","Use Copy Link instead.")}});
 h.querySelector('[data-share-invite="email"]')?.addEventListener("click",()=>{location.href="mailto:?subject="+encodeURIComponent("Join "+pool+" on LINKS")+"&body="+encodeURIComponent("Join my pool on LINKS:\n\n"+url)});
 h.querySelector(".invite-direct")?.addEventListener("submit",e=>{e.preventDefault();const input=e.currentTarget.querySelector("input"),v=input.value.trim();if(!v)return;InviteState.add(v);AuditLog.add("INVITE SENT","Invite queued for "+v);AppStatus.show("ok","Invite queued",v);h.innerHTML=inviteCenter(pool);wireInvite(h,pool)});
}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-invite-players],[data-cmd='invite'],.invite-players");
 if(!b)return;const pool=new URL(location.href).searchParams.get("pool")||"Barnes Family";e.preventDefault();e.stopImmediatePropagation();openInviteCenter(pool);
},true);

// Route Stabilizer v1 — explicit URLs win, Home is the clean default, browser history is deterministic.
const LinksRouter={
 valid:new Set(["home","my-pools","my-picks","results","messages","notifications","commissioner","pool"]),
 readURL(){const u=new URL(location.href);return {explicit:u.searchParams.has("view"),view:u.searchParams.get("view")||"home",pool:u.searchParams.get("pool")||""}},
 apply(view,pool="",render=true){
   if(!this.valid.has(view))view="home";
   document.documentElement.dataset.view=view;
   if(view==="pool"&&pool)document.documentElement.dataset.pool=pool;else delete document.documentElement.dataset.pool;
   LinksState.write({route:view,pool:view==="pool"?pool:""});
   if(render){
     if(view==="pool"&&pool){openPoolHubStable(pool)}
     else if(view==="home"){document.querySelector(".route-workspace")?.remove()}
     else renderRouteWorkspace();
   }
   syncRouteNav(view);
 },
 navigate(view,pool=""){
   const u=new URL(location.href);u.searchParams.set("view",view);
   if(view==="pool"&&pool)u.searchParams.set("pool",pool);else u.searchParams.delete("pool");
   history.pushState({route:view,pool},"",u);this.apply(view,pool,true);
 },
 boot(){
   const r=this.readURL();
   // Explicit links are always intentional. A bare /new-build/ always starts at Home.
   if(!r.explicit){const u=new URL(location.href);u.searchParams.set("view","home");u.searchParams.delete("pool");history.replaceState({route:"home",pool:""},"",u);this.apply("home","",false);return}
   this.apply(r.view,r.pool,true);
 }
};
function syncRouteNav(view){
 const map={home:"home","my-pools":"pools","pool":"pools","my-picks":"picks",results:"results",commissioner:"admin",messages:"","notifications":""};
 document.querySelectorAll(".nav button,.mobile-dock button").forEach(b=>{
   const raw=(b.dataset.mobileRoute||b.dataset.route||b.textContent||"").toLowerCase();
   const want=map[view]||view;b.classList.toggle("active",!!want&&raw.includes(want));
 });
}
function openPoolHubStable(name){
 const oldPush=history.pushState;
 // Existing hub renderer may push history; suppress that during router hydration.
 history.pushState=function(){};
 try{openPoolHub(name)}finally{history.pushState=oldPush}
 document.documentElement.dataset.view="pool";document.documentElement.dataset.pool=name;LinksState.write({route:"pool",pool:name});syncRouteNav("pool");
}
window.addEventListener("popstate",()=>{
 const r=LinksRouter.readURL();LinksRouter.apply(r.view,r.pool,true);
});

// Capture primary navigation and pool cards so old click/dblclick handlers cannot fight the router.
document.addEventListener("click",e=>{
 const poolCard=e.target.closest("[data-open-pool],[data-pickpool]");
 if(poolCard){const name=poolCard.dataset.openPool||poolCard.dataset.pickpool;if(name){e.preventDefault();e.stopImmediatePropagation();LinksRouter.navigate("pool",name);return}}
 const mb=e.target.closest(".mobile-dock [data-mobile-route]");
 if(mb){e.preventDefault();e.stopImmediatePropagation();LinksRouter.navigate(mb.dataset.mobileRoute);return}
},true);

// Normalize stale pool state whenever a non-pool workspace is rendered.
const routeStateObserver=new MutationObserver(()=>{
 const v=document.documentElement.dataset.view;if(v!=="pool"&&document.documentElement.dataset.pool)delete document.documentElement.dataset.pool;
 syncRouteNav(v||"home");
});
routeStateObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});

// Run after legacy startup code has had a chance to initialize.
setTimeout(()=>LinksRouter.boot(),0);

// Week Control v2 — commissioner open/close now actually governs pick interaction.
const WeekGate={
 state(){return {open:true,...CommissionerState.read()}},
 isOpen(){return this.state().weekOpen!==false},
 reason(){return this.isOpen()?"":"Commissioner has closed Week 3."}
};
function enforceWeekGate(root=document){
 const closed=!WeekGate.isOpen();
 root.querySelectorAll("[data-pick-team],[data-hub-team]").forEach(b=>{
   b.classList.toggle("week-closed",closed);b.setAttribute("aria-disabled",closed?"true":"false");
 });
 root.querySelectorAll(".week-gate-banner").forEach(x=>x.remove());
 if(closed){
   root.querySelectorAll(".mypicks-v3,.pool-hub,.pool-tab-live").forEach(host=>{
     if(host.querySelector(":scope > .week-gate-banner"))return;
     host.insertAdjacentHTML("afterbegin",'<div class="week-gate-banner"><i>◆</i><div><b>WEEK 3 CLOSED</b><span>The commissioner has paused new or changed picks. Existing saved picks remain intact.</span></div><em>COMMISSIONER CONTROL</em></div>');
   });
 }
}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-pick-team],[data-hub-team]");
 if(!b||WeekGate.isOpen())return;
 e.preventDefault();e.stopImmediatePropagation();
 AppStatus.show("warn","Week 3 is closed","Your saved picks are unchanged. The commissioner must reopen the week.");
},true);

// Make the existing commissioner open/close control enforce the state immediately.
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-week-toggle],[data-cmd='week']");
 if(!b)return;
 setTimeout(()=>{enforceWeekGate(document);AppStatus.show(WeekGate.isOpen()?"ok":"warn",WeekGate.isOpen()?"Week reopened":"Week closed",WeekGate.isOpen()?"Unlocked games can be edited again.":"New pick changes are paused.")},60);
},true);

const weekGateObserver=new MutationObserver(()=>enforceWeekGate(document));weekGateObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(()=>enforceWeekGate(document));

// Readiness is derived from entrant data instead of hard-coded reminder counts.
function entrantReadiness(){
 const entries=Object.entries(EntrantStatus||{});let total=entries.length,ready=0,missing=[];
 entries.forEach(([name,v])=>{const done=typeof v==="object"?(v.done??v.picks??0):0;const need=typeof v==="object"?(v.total??3):3;if(done>=need)ready++;else missing.push(name)});
 return {total,ready,missing};
}
function readinessStrip(){
 const r=entrantReadiness(),pct=r.total?Math.round(r.ready/r.total*100):100;
 return '<div class="readiness-strip"><div class="readiness-ring" style="--ready:'+pct+'%"><b>'+pct+'%</b></div><div><span>PLAYER READINESS</span><b>'+r.ready+' OF '+r.total+' COMPLETE</b><small>'+(r.missing.length?r.missing.join(", ")+" still need picks.":"Everyone is ready.")+'</small></div><button data-ready-remind '+(!r.missing.length?'disabled':'')+'>'+(r.missing.length?'REMIND '+r.missing.length:'ALL READY')+'</button></div>';
}
function mountReadiness(){
 const cmd=document.querySelector(".commander-v3");if(!cmd||cmd.querySelector(".readiness-strip"))return;
 cmd.insertAdjacentHTML("beforeend",readinessStrip());
 cmd.querySelector("[data-ready-remind]")?.addEventListener("click",()=>{const r=entrantReadiness();r.missing.forEach(n=>ReminderQueue.add?.(n));AuditLog.add("REMINDERS SENT",r.missing.length+" incomplete players");AppStatus.show("ok","Reminders queued",r.missing.length+" incomplete player"+(r.missing.length===1?"":"s")+" targeted.")});
}
const readinessObserver=new MutationObserver(()=>mountReadiness());readinessObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountReadiness);

// Information Architecture v1 — put player tools with players, commissioner tools with commissioners.
const IA={
 player:[
  {k:"picks",label:"MY PICKS",sub:"Finish what needs you",route:"my-picks"},
  {k:"pools",label:"MY POOLS",sub:"Every pool in one place",route:"my-pools"},
  {k:"results",label:"RESULTS",sub:"Scores and standings",route:"results"},
  {k:"inbox",label:"INBOX",sub:"Deadlines and updates",route:"notifications"}
 ],
 admin:[
  {k:"players",label:"PLAYERS",sub:"Readiness, invites, access"},
  {k:"week",label:"WEEK CONTROL",sub:"Open, close, lock games"},
  {k:"rules",label:"POOL RULES",sub:"Scoring and deadlines"},
  {k:"auto",label:"AUTOPILOT",sub:"Reminders and recap"}
 ]
};
function playerLaunchpad(){
 return '<section class="player-launchpad"><div class="launch-cap"><span>YOUR LINKS</span><b>PLAY · TRACK · TALK</b></div><div class="launch-grid">'+IA.player.map(x=>'<button data-ia-route="'+x.route+'"><i class="ia-'+x.k+'"></i><div><b>'+x.label+'</b><span>'+x.sub+'</span></div><em>›</em></button>').join("")+'</div></section>';
}
function mountPlayerLaunchpad(){
 const home=document.querySelector(".main");if(!home||document.documentElement.dataset.view!=="home"||home.querySelector(".player-launchpad"))return;
 const target=home.querySelector(".game-network-v2,.game-network-showcase");if(target)target.insertAdjacentHTML("beforebegin",playerLaunchpad());else home.insertAdjacentHTML("afterbegin",playerLaunchpad());
 home.querySelectorAll("[data-ia-route]").forEach(b=>b.addEventListener("click",()=>LinksRouter.navigate(b.dataset.iaRoute)));
}
function adminNav(){
 return '<section class="admin-nav-v1"><div><span>COMMISSIONER TOOLS</span><b>Everything for running the pool</b></div><nav>'+IA.admin.map(x=>'<button data-admin-jump="'+x.k+'"><i></i><div><b>'+x.label+'</b><span>'+x.sub+'</span></div></button>').join("")+'</nav></section>';
}
function mountAdminNav(){
 const ws=document.querySelector(".route-workspace");if(!ws||document.documentElement.dataset.view!=="commissioner"||ws.querySelector(".admin-nav-v1"))return;
 ws.insertAdjacentHTML("afterbegin",adminNav());
 ws.querySelectorAll("[data-admin-jump]").forEach(b=>b.addEventListener("click",()=>{
   const k=b.dataset.adminJump;
   if(k==="rules"){openSetupStudio();return}
   if(k==="players"){ws.querySelector(".readiness-strip,.entrant-manager")?.scrollIntoView({behavior:"smooth",block:"center"});return}
   if(k==="auto"){ws.querySelector(".autopilot-v1")?.scrollIntoView({behavior:"smooth",block:"start"});return}
   ws.querySelector(".commander-v3")?.scrollIntoView({behavior:"smooth",block:"start"});
 }));
}
function contextualBack(){
 let b=document.querySelector(".context-back");
 const v=document.documentElement.dataset.view||"home";
 if(v==="home"){b?.remove();return}
 if(!b){b=document.createElement("button");b.className="context-back";document.body.appendChild(b)}
 b.textContent=v==="pool"?"‹ MY POOLS":"‹ HOME";
 b.onclick=()=>LinksRouter.navigate(v==="pool"?"my-pools":"home");
}
const iaObserver=new MutationObserver(()=>{mountPlayerLaunchpad();mountAdminNav();contextualBack()});iaObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(()=>{mountPlayerLaunchpad();mountAdminNav();contextualBack()});

// My Pools v3 — organized portfolio of every competition with status-first navigation.
function myPoolsV3(){
 const pools=Object.entries(PoolHubData);
 return '<section class="mypools-v3"><div class="mypools-hero"><div><span>MY POOLS</span><h2>Everything you’re playing.</h2><p>See what needs attention, what locks next and where you stand.</p></div><button data-new-pool>+ CREATE POOL</button></div><div class="pool-summary"><div><b>'+pools.length+'</b><span>ACTIVE POOLS</span></div><div><b>2</b><span>PICKS DUE</span></div><div><b>1</b><span>TOP 3</span></div><div><b>THU</b><span>NEXT LOCK</span></div></div><div class="pool-portfolio">'+pools.map(([name,p],i)=>'<button class="portfolio-card '+(i===0?"attention":"")+'" data-open-pool="'+name+'"><div class="portfolio-art '+gameCategory(p.game)+'">'+networkGlyph(gameCategory(p.game)==="football"?"football":gameCategory(p.game))+'<span>'+p.accent+'</span></div><div class="portfolio-main"><span>'+p.game+' · '+p.week+'</span><h3>'+name+'</h3><div class="portfolio-meta"><b>'+p.members+' PLAYERS</b><b>'+p.ready+' READY</b><b>'+p.lock+'</b></div><div class="portfolio-progress"><i style="width:'+Math.round(p.ready/p.members*100)+'%"></i></div></div><div class="portfolio-rank"><span>YOUR STATUS</span><b>'+p.rank+'</b><small>'+p.record+'</small><em>'+(i===0?"1 PICK DUE":"OPEN POOL")+' ›</em></div></button>').join("")+'</div><div class="pool-discover"><div><span>LINKS GAME NETWORK</span><h3>Start another kind of pool.</h3><p>Pick’em, Survivor, Squares, brackets, racing, golf, fantasy and more all use the same LINKS account.</p></div><button data-browse-games>BROWSE GAMES ›</button></div></section>';
}
function mountMyPoolsV3(){
 const ws=document.querySelector(".route-workspace");if(!ws||document.documentElement.dataset.view!=="my-pools"||ws.querySelector(".mypools-v3"))return;
 ws.insertAdjacentHTML("beforeend",myPoolsV3());
 ws.querySelectorAll("[data-open-pool]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();LinksRouter.navigate("pool",b.dataset.openPool)}));
 ws.querySelector("[data-new-pool]")?.addEventListener("click",()=>modal("CREATE A POOL",'<div class="connected-modal"><span class="badge live">LINKS GAME NETWORK</span><h3>Choose the game first.</h3><p>Your account and commissioner tools carry across every format.</p><button onclick="this.closest(\'.modal\')?.remove()">BROWSE GAME NETWORK</button></div>'));
 ws.querySelector("[data-browse-games]")?.addEventListener("click",()=>LinksRouter.navigate("home"));
}
const poolsObserver=new MutationObserver(()=>mountMyPoolsV3());poolsObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountMyPoolsV3);

// Cleanup Pass v1 — remove duplicate/legacy controls and keep each action in its natural home.
function cleanupLayout(){
 const v=document.documentElement.dataset.view||"home";
 // Only one contextual back control; mobile dock already supplies Home-level navigation.
 document.querySelectorAll(".context-back").forEach((b,i)=>{if(i>0)b.remove()});
 // Hide redundant pool/week selectors when the modern Pool Hub owns that context.
 if(v==="pool"){
  document.querySelectorAll(".legacy-week-select,.week-select-top,.select-week-top,[data-legacy-week]").forEach(x=>x.remove());
 }
 // Remove empty cards/sections left behind by progressive replacement.
 document.querySelectorAll(".card,.panel,.section").forEach(x=>{
  if(x.dataset.keepEmpty!==undefined)return;
  const meaningful=(x.textContent||"").trim()||x.querySelector("button,input,img,svg,[class*='mark']");
  if(!meaningful&&x.children.length===0)x.remove();
 });
 // Deduplicate repeated action buttons by semantic command inside the same local toolbar.
 document.querySelectorAll(".toolbar,.actions,.admin-actions,.pool-actions").forEach(bar=>{
  const seen=new Set();
  bar.querySelectorAll("button").forEach(b=>{
   const key=b.dataset.cmd||b.dataset.action||b.textContent.trim().replace(/\s+/g," ").toLowerCase();
   if(key&&seen.has(key))b.remove();else if(key)seen.add(key);
  });
 });
 // Admin-only controls never belong on player pool surfaces.
 if(v==="pool")document.querySelectorAll(".pool-hub .admin-only-global,.pool-hub [data-global-admin]").forEach(x=>x.remove());
}
const cleanupObserver=new MutationObserver(()=>cleanupLayout());cleanupObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(cleanupLayout);

// Results correctness: wherever demo standings are rendered, compute rank from wins instead of source-array order.
function rankedDemoPlayers(){
 return [...ScoreDemo.players].map(p=>({p,s:scored(p)})).sort((a,b)=>b.s.wins-a.s.wins||a.p.name.localeCompare(b.p.name));
}
function resultsTruthStrip(){
 const rows=rankedDemoPlayers(),leader=rows[0];if(!leader)return "";
 return '<section class="results-truth"><div><span>LIVE LEADER</span><b>'+leader.p.name+'</b></div><div><span>CURRENT SCORE</span><b>'+leader.s.wins+' CORRECT</b></div><div><span>SCORING</span><b>AUTO UPDATED</b></div></section>';
}
function correctResultsUI(){
 if(document.documentElement.dataset.view!=="results")return;
 const host=document.querySelector(".results-v2,.results-live,.route-workspace");if(!host||host.querySelector(".results-truth"))return;
 host.insertAdjacentHTML("afterbegin",resultsTruthStrip());
}
const resultObserver=new MutationObserver(()=>correctResultsUI());resultObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(correctResultsUI);

// Pool Room rerender-safe wiring: event delegation keeps Send working after every message render.
document.addEventListener("submit",e=>{
 const f=e.target.closest("#inviteV2Mount form.room-compose,.room-v2 form,.room-compose");
 if(!f)return;
 const host=f.closest(".room-v2")||f.closest("[data-room-host]");if(!host)return;
 e.preventDefault();e.stopImmediatePropagation();
 const input=f.querySelector("input,textarea"),text=(input?.value||"").trim();if(!text)return;
 const pool=new URL(location.href).searchParams.get("pool")||document.documentElement.dataset.pool||"Barnes Family";
 RoomStore.add(pool,text);if(input)input.value="";
 const mount=host.parentElement;if(mount){mount.innerHTML=roomV2(pool);hydrateRoomText(mount,pool);openRoomWire(mount,pool)}
 AppStatus.show("ok","Message sent","Posted to "+pool+" Pool Room.");
},true);

// Create Pool Studio v1 — Game Network -> details -> rules -> publish.
const CreatedPools={
 key:"links-created-pools-v1",
 all(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch{return[]}},
 save(p){const a=this.all();a.unshift(p);localStorage.setItem(this.key,JSON.stringify(a.slice(0,20)));return p},
 hydrate(){this.all().forEach(p=>{if(!PoolHubData[p.name])PoolHubData[p.name]={game:p.game,week:"NEW POOL",members:1,ready:1,lock:"NOT SET",record:"0–0",rank:"—",accent:p.accent||"LINKS"}})}
};
CreatedPools.hydrate();

const CreatePoolStudio={
 draft:{game:"NFL PICK’EM",name:"",privacy:"PRIVATE",deadline:"PER-GAME KICKOFF",scoring:"STRAIGHT UP"},
 gameType(name){const hit=NetworkGames.find(x=>x[0]===name);return hit?.[1]||"custom"},
 accent(name){return name.replace(/[^A-Z0-9]/gi," ").trim().split(/\s+/).slice(0,2).join(" ").toUpperCase()},
 html(step=1){
  const d=this.draft,g=this.gameType(d.game);
  if(step===1)return '<div class="create-studio"><div class="create-steps"><b class="on">1 GAME</b><b>2 DETAILS</b><b>3 RULES</b><b>4 READY</b></div><div class="create-title"><span>CREATE POOL</span><h2>What are you playing?</h2><p>Start with the format. LINKS will load the right commissioner controls next.</p></div><div class="create-games">'+NetworkGames.map(x=>'<button data-create-game="'+x[0]+'" class="'+(d.game===x[0]?"selected":"")+'"><div class="mini-network-art">'+networkGlyph(x[1])+'</div><div><b>'+x[0]+'</b><span>'+x[2]+'</span></div><em>›</em></button>').join("")+'</div><div class="create-foot"><span>1 COMMISSIONER POOL FREE FOR LIFE</span><button data-create-next="2">CONTINUE ›</button></div></div>';
  if(step===2)return '<div class="create-studio"><div class="create-steps"><b class="done">✓ GAME</b><b class="on">2 DETAILS</b><b>3 RULES</b><b>4 READY</b></div><div class="create-title"><span>'+d.game+'</span><h2>Name your pool.</h2><p>Keep it recognizable. Invite links will take players straight here.</p></div><label class="create-field"><span>POOL NAME</span><input data-create-name maxlength="42" value="'+d.name.replace(/"/g,"&quot;")+'" placeholder="Example: Barnes Family"></label><div class="create-choice"><span>WHO CAN JOIN?</span><button data-create-privacy="PRIVATE" class="'+(d.privacy==="PRIVATE"?"selected":"")+'"><b>PRIVATE</b><small>Invite link or commissioner invite</small></button><button data-create-privacy="OPEN" class="'+(d.privacy==="OPEN"?"selected":"")+'"><b>OPEN</b><small>Players can request to join</small></button></div><div class="create-foot"><button class="secondary" data-create-next="1">‹ BACK</button><button data-create-next="3">CONTINUE ›</button></div></div>';
  if(step===3)return '<div class="create-studio"><div class="create-steps"><b class="done">✓ GAME</b><b class="done">✓ DETAILS</b><b class="on">3 RULES</b><b>4 READY</b></div><div class="create-title"><span>QUICK SETUP</span><h2>Set the week rules.</h2><p>These can be changed later from Commissioner → Pool Rules.</p></div><div class="create-rule"><span>DEADLINE</span><button data-create-deadline="PER-GAME KICKOFF" class="'+(d.deadline==="PER-GAME KICKOFF"?"selected":"")+'">PER-GAME KICKOFF</button><button data-create-deadline="WEEKLY DEADLINE" class="'+(d.deadline==="WEEKLY DEADLINE"?"selected":"")+'">WEEKLY DEADLINE</button></div><div class="create-rule"><span>SCORING</span><button data-create-scoring="STRAIGHT UP" class="'+(d.scoring==="STRAIGHT UP"?"selected":"")+'">STRAIGHT UP</button><button data-create-scoring="AGAINST SPREAD" class="'+(d.scoring==="AGAINST SPREAD"?"selected":"")+'">AGAINST SPREAD</button></div><div class="create-preview"><div class="mini-network-art">'+networkGlyph(g)+'</div><div><span>PLAYER PREVIEW</span><b>'+d.game+'</b><small>'+d.deadline+' · '+d.scoring+'</small></div></div><div class="create-foot"><button class="secondary" data-create-next="2">‹ BACK</button><button data-create-next="4">REVIEW POOL ›</button></div></div>';
  return '<div class="create-studio"><div class="create-steps"><b class="done">✓ GAME</b><b class="done">✓ DETAILS</b><b class="done">✓ RULES</b><b class="on">4 READY</b></div><div class="create-ready"><div class="create-ready-mark">'+networkGlyph(g)+'</div><span>READY TO CREATE</span><h2>'+(d.name||"Your New Pool")+'</h2><p>'+d.game+' · '+d.privacy+'</p><div class="ready-grid"><div><span>DEADLINE</span><b>'+d.deadline+'</b></div><div><span>SCORING</span><b>'+d.scoring+'</b></div><div><span>PLAYERS</span><b>YOU + INVITES</b></div><div><span>ACCESS</span><b>'+d.privacy+'</b></div></div><button data-create-publish>CREATE POOL</button><small>You can invite players immediately after creation.</small></div><div class="create-foot"><button class="secondary" data-create-next="3">‹ EDIT RULES</button></div></div>';
 },
 open(game){
  if(game&&NetworkGames.some(x=>x[0]===game))this.draft={...this.draft,game};
  modal("CREATE A POOL",'<div id="createPoolMount"></div>');
  const h=document.querySelector("#createPoolMount");h.innerHTML=this.html(1);this.wire(h,1);
 },
 render(h,step){h.innerHTML=this.html(step);this.wire(h,step)},
 wire(h,step){
  h.querySelectorAll("[data-create-game]").forEach(b=>b.onclick=()=>{this.draft.game=b.dataset.createGame;this.render(h,1)});
  h.querySelectorAll("[data-create-privacy]").forEach(b=>b.onclick=()=>{this.draft.privacy=b.dataset.createPrivacy;this.render(h,2)});
  h.querySelectorAll("[data-create-deadline]").forEach(b=>b.onclick=()=>{this.draft.deadline=b.dataset.createDeadline;this.render(h,3)});
  h.querySelectorAll("[data-create-scoring]").forEach(b=>b.onclick=()=>{this.draft.scoring=b.dataset.createScoring;this.render(h,3)});
  h.querySelectorAll("[data-create-next]").forEach(b=>b.onclick=()=>{if(step===2){const n=h.querySelector("[data-create-name]")?.value.trim();if(!n){AppStatus.show("warn","Pool name needed","Give this pool a name before continuing.");return}this.draft.name=n}this.render(h,+b.dataset.createNext)});
  h.querySelector("[data-create-publish]")?.addEventListener("click",()=>{
   const d={...this.draft,id:"pool-"+Date.now(),createdAt:new Date().toISOString(),accent:this.accent(this.draft.game)};
   CreatedPools.save(d);PoolHubData[d.name]={game:d.game,week:"NEW POOL",members:1,ready:1,lock:"NOT SET",record:"0–0",rank:"—",accent:d.accent};
   SetupState.write({deadline:d.deadline,style:d.scoring});
   AuditLog.add("POOL CREATED",d.name+" · "+d.game);
   document.querySelector(".modal")?.remove();AppStatus.show("ok","Pool created",d.name+" is ready for players.");
   setTimeout(()=>{LinksRouter.navigate("pool",d.name);setTimeout(()=>openInviteCenter(d.name),260)},180);
  });
 }
};

// Replace placeholder Game Network/Create Pool actions with the real studio.
document.addEventListener("click",e=>{
 const game=e.target.closest("[data-network-game]");
 const add=e.target.closest("[data-new-pool]");
 if(!game&&!add)return;
 e.preventDefault();e.stopImmediatePropagation();
 CreatePoolStudio.open(game?.dataset.networkGame||null);
},true);

// Game Identity v2 — every Pool Hub inherits the visual language of its actual game.
function gameIdentity(game=""){
 const n=game.toUpperCase();
 if(n.includes("COLLEGE"))return {type:"college",eyebrow:"SATURDAY COMMAND",label:"COLLEGE PICK’EM"};
 if(n.includes("SURVIVOR"))return {type:"survivor",eyebrow:"STAY ALIVE",label:"SURVIVOR"};
 if(n.includes("SQUARE"))return {type:"squares",eyebrow:"GRID DAY",label:"FOOTBALL SQUARES"};
 if(n.includes("MARCH")||n.includes("BRACKET"))return {type:"bracket",eyebrow:"ROAD TO THE TITLE",label:"BRACKET"};
 if(n.includes("NASCAR")||n.includes("RACE"))return {type:"racing",eyebrow:"RACE DAY",label:"RACING"};
 if(n.includes("GOLF"))return {type:"golf",eyebrow:"MAJOR WEEK",label:"GOLF"};
 if(n.includes("DYNASTY"))return {type:"dynasty",eyebrow:"FRONT OFFICE",label:"DYNASTY"};
 if(n.includes("FANTASY"))return {type:"fantasy",eyebrow:"GAME DAY",label:"FANTASY"};
 if(n.includes("33"))return {type:"game33",eyebrow:"ONE NUMBER. ONE WINNER.",label:"GAME 33"};
 return {type:"football",eyebrow:"GAME DAY",label:game||"NFL PICK’EM"};
}
function poolIdentityBand(name){
 const p=PoolHubData[name];if(!p)return "";const g=gameIdentity(p.game);
 return '<section class="pool-identity pi-'+g.type+'"><div class="pi-art">'+networkGlyph(g.type)+'</div><div class="pi-copy"><span>'+g.eyebrow+'</span><b>'+g.label+'</b><small>'+p.week+' · '+p.members+' PLAYERS</small></div><div class="pi-state"><span>NEXT LOCK</span><b>'+p.lock+'</b></div></section>';
}
function mountPoolIdentity(){
 if(document.documentElement.dataset.view!=="pool")return;
 const name=document.documentElement.dataset.pool||new URL(location.href).searchParams.get("pool");const hub=document.querySelector(".pool-hub");
 if(!name||!hub||hub.querySelector(".pool-identity"))return;
 const hero=hub.querySelector(".poolhub-hero");if(hero)hero.insertAdjacentHTML("afterend",poolIdentityBand(name));else hub.insertAdjacentHTML("afterbegin",poolIdentityBand(name));
}
const identityObserver=new MutationObserver(()=>mountPoolIdentity());identityObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountPoolIdentity);

// Game-aware Pool Hub copy prevents NFL-specific language leaking into College/Survivor/etc.
function gameHubTerms(name){
 const p=PoolHubData[name],g=gameIdentity(p?.game||"");
 const map={
  college:{action:"MAKE COLLEGE PICKS",noun:"games",status:"Saturday slate"},
  survivor:{action:"MAKE SURVIVOR PICK",noun:"selection",status:"Survival week"},
  squares:{action:"OPEN SQUARES",noun:"squares",status:"Game grid"},
  bracket:{action:"OPEN BRACKET",noun:"matchups",status:"Tournament"},
  racing:{action:"MAKE RACE PICKS",noun:"drivers",status:"Race card"},
  golf:{action:"MAKE GOLF PICKS",noun:"golfers",status:"Tournament"},
  dynasty:{action:"OPEN TEAM",noun:"roster moves",status:"Front office"},
  fantasy:{action:"OPEN LINEUP",noun:"lineup decisions",status:"Matchup"},
  game33:{action:"MAKE GAME 33 PICK",noun:"selection",status:"Weekly number"},
  football:{action:"MAKE NFL PICKS",noun:"games",status:"NFL week"}
 };
 return map[g.type]||map.football;
}
function correctPoolLanguage(){
 if(document.documentElement.dataset.view!=="pool")return;
 const name=document.documentElement.dataset.pool||"";const t=gameHubTerms(name);const p=PoolHubData[name];if(!p)return;
 document.querySelectorAll(".pool-hub [data-generic-pick-action]").forEach(b=>b.textContent=t.action);
 document.querySelectorAll(".pool-hub [data-game-status-copy]").forEach(x=>x.textContent=t.status);
}
const languageObserver=new MutationObserver(()=>correctPoolLanguage());languageObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(correctPoolLanguage);

// Pool Hub quick actions: consistent placement directly under game identity.
function hubQuickActions(){
 return '<nav class="hub-quick"><button data-hub-quick="picks"><i>✓</i><span>PICKS</span></button><button data-hub-quick="standings"><i>★</i><span>STANDINGS</span></button><button data-hub-quick="compare"><i>⇄</i><span>COMPARE</span></button><button data-room-v2><i>✦</i><span>POOL ROOM</span></button></nav>';
}
function mountHubQuick(){
 const hub=document.querySelector(".pool-hub");if(!hub||document.documentElement.dataset.view!=="pool"||hub.querySelector(".hub-quick"))return;
 const id=hub.querySelector(".pool-identity");if(!id)return;id.insertAdjacentHTML("afterend",hubQuickActions());
 hub.querySelectorAll("[data-hub-quick]").forEach(b=>b.addEventListener("click",()=>{
   const tab=b.dataset.hubQuick.toUpperCase();const target=[...hub.querySelectorAll("button")].find(x=>x.textContent.trim().toUpperCase()===tab);target?.click();
 }));
}
const quickObserver=new MutationObserver(()=>mountHubQuick());quickObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountHubQuick);

// Home Command v4 — visual, simple, action-first landing page.
function homeCommandV4(){
 const pools=Object.entries(PoolHubData),active=pools.length,next=pools[0]?.[1];
 return '<section class="home-command-v4"><div class="home-stage"><div class="home-stadium"><i></i><i></i><i></i><i></i><div class="field-lines"></div></div><div class="home-stage-copy"><span>LINKS POOLS</span><h1>ALL YOUR POOLS.<br><em>ALL IN ONE PLACE.</em></h1><p>Make picks. Track the field. Run your pools. One account for every game.</p><div class="home-primary"><button data-home-go="my-picks">MAKE MY PICKS <b>1 DUE</b></button><button class="ghost" data-home-go="my-pools">MY POOLS</button></div></div><div class="home-scorebug"><span>YOUR WEEK</span><b>85%</b><small>READY</small><i style="--week:85%"></i></div></div><div class="home-now-grid"><button class="home-now urgent" data-home-go="my-picks"><div class="now-icon">✓</div><div><span>NEEDS YOU</span><b>1 PICK LEFT</b><small>Barnes Family · before Thursday lock</small></div><em>FINISH ›</em></button><button class="home-now" data-home-pool="Barnes Family"><div class="now-icon live">●</div><div><span>UP NEXT</span><b>'+((next&&next.game)||"NFL PICK’EM")+'</b><small>'+((next&&next.lock)||"THU · 7:15 PM")+'</small></div><em>OPEN ›</em></button><button class="home-now" data-home-go="results"><div class="now-icon trophy">★</div><div><span>LIVE BOARD</span><b>SEE RESULTS</b><small>Scores, standings and movement</small></div><em>WATCH ›</em></button></div><div class="home-section-head"><div><span>YOUR POOLS</span><h2>Jump back in.</h2></div><button data-home-go="my-pools">VIEW ALL '+active+' ›</button></div><div class="home-pool-rail">'+pools.slice(0,3).map(([name,p])=>{const g=gameIdentity(p.game);return '<button class="home-pool-card hpc-'+g.type+'" data-home-pool="'+name+'"><div class="hpc-art">'+networkGlyph(g.type)+'</div><div class="hpc-copy"><span>'+p.game+' · '+p.week+'</span><h3>'+name+'</h3><div><b>'+p.ready+'/'+p.members+' READY</b><b>'+p.lock+'</b></div></div><em>'+p.rank+'<small>'+p.record+'</small></em></button>'}).join("")+'</div><div class="home-explore"><div class="home-explore-art"><i></i><i></i><i></i><b>LINKS</b></div><div><span>GAME NETWORK</span><h2>There’s a pool for that.</h2><p>Football, brackets, racing, golf, fantasy, custom games and more.</p></div><button data-home-games>EXPLORE GAMES ›</button></div></section>';
}
function mountHomeCommandV4(){
 if(document.documentElement.dataset.view!=="home")return;
 const main=document.querySelector(".main");if(!main||main.querySelector(".home-command-v4"))return;
 const old=main.querySelector(".player-launchpad");if(old)old.insertAdjacentHTML("beforebegin",homeCommandV4());else main.insertAdjacentHTML("afterbegin",homeCommandV4());
 main.querySelectorAll("[data-home-go]").forEach(b=>b.addEventListener("click",()=>LinksRouter.navigate(b.dataset.homeGo)));
 main.querySelectorAll("[data-home-pool]").forEach(b=>b.addEventListener("click",()=>LinksRouter.navigate("pool",b.dataset.homePool)));
 main.querySelector("[data-home-games]")?.addEventListener("click",()=>main.querySelector(".game-network-v2")?.scrollIntoView({behavior:"smooth",block:"start"}));
}
const homeV4Observer=new MutationObserver(()=>mountHomeCommandV4());homeV4Observer.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountHomeCommandV4);

// Home cleanup: modern command surface owns the top of Home; remove older duplicate hero/quick-launch surfaces only.
function cleanHomeV4(){
 if(document.documentElement.dataset.view!=="home"||!document.querySelector(".home-command-v4"))return;
 document.querySelectorAll(".player-launchpad,.your-links-spotlight,.nightboard-hero,.live-impact-hero").forEach(x=>x.remove());
}
const homeCleanObserver=new MutationObserver(()=>cleanHomeV4());homeCleanObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(cleanHomeV4);

// Home Live Strip v1 — sports-broadcast energy without cluttering the landing page.
const HomeLive={
 games:[
  {a:"TEN",b:"IND",as:24,bs:20,state:"4TH · 6:42",live:true},
  {a:"DAL",b:"NYG",as:17,bs:17,state:"HALF",live:true},
  {a:"BUF",b:"MIA",as:null,bs:null,state:"SUN · 3:25",live:false}
 ],
 html(){
  return '<section class="home-live-strip"><div class="hls-brand"><i></i><div><span>LINKS LIVE</span><b>GAME DAY</b></div></div><div class="hls-games">'+this.games.map(g=>'<button data-live-results><div class="hls-team"><b>'+g.a+'</b><em>'+(g.as??"—")+'</em></div><span class="'+(g.live?"live":"upcoming")+'">'+g.state+'</span><div class="hls-team away"><em>'+(g.bs??"—")+'</em><b>'+g.b+'</b></div></button>').join("")+'</div><button class="hls-all" data-live-results>ALL SCORES ›</button></section>';
 }
};
function mountHomeLive(){
 if(document.documentElement.dataset.view!=="home")return;
 const cmd=document.querySelector(".home-command-v4");if(!cmd||cmd.querySelector(".home-live-strip"))return;
 const hero=cmd.querySelector(".home-stage");hero?.insertAdjacentHTML("afterend",HomeLive.html());
 cmd.querySelectorAll("[data-live-results]").forEach(b=>b.addEventListener("click",()=>LinksRouter.navigate("results")));
}
const homeLiveObserver=new MutationObserver(()=>mountHomeLive());homeLiveObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountHomeLive);

// Home personal brief: compress messages/deadlines/commissioner activity into one useful surface.
function homeBrief(){
 const unread=InboxStore.all().filter(x=>!x.read).length;
 return '<section class="home-brief"><div class="hb-head"><div><span>YOUR LINKS BRIEF</span><h2>What matters right now.</h2></div><button data-brief-inbox>'+unread+' UNREAD ›</button></div><div class="hb-grid"><button data-home-go2="my-picks"><i class="pick">✓</i><div><span>PICKS</span><b>Finish Barnes Family</b><small>1 selection left before the next lock</small></div><em>DO IT ›</em></button><button data-home-go2="notifications"><i class="msg">✦</i><div><span>INBOX</span><b>Commissioner update</b><small>Week 3 access and deadline information</small></div><em>READ ›</em></button><button data-home-go2="results"><i class="move">↑</i><div><span>MOVEMENT</span><b>You moved into the top group</b><small>Live standings changed after the last final</small></div><em>VIEW ›</em></button></div></section>';
}
function mountHomeBrief(){
 if(document.documentElement.dataset.view!=="home")return;
 const cmd=document.querySelector(".home-command-v4");if(!cmd||cmd.querySelector(".home-brief"))return;
 const now=cmd.querySelector(".home-now-grid");now?.insertAdjacentHTML("afterend",homeBrief());
 cmd.querySelectorAll("[data-home-go2]").forEach(b=>b.addEventListener("click",()=>LinksRouter.navigate(b.dataset.homeGo2)));
 cmd.querySelector("[data-brief-inbox]")?.addEventListener("click",()=>LinksRouter.navigate("notifications"));
}
const briefObserver=new MutationObserver(()=>mountHomeBrief());briefObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountHomeBrief);

// Keep Home intentionally short: older secondary dashboards stay out of the landing page.
function trimHome(){
 if(document.documentElement.dataset.view!=="home"||!document.querySelector(".home-command-v4"))return;
 [".your-week",".links-brief",".pool-pulse",".broadcast-rail",".needs-attention",".my-links-stream",".pick-safe",".rivalry-watch",".legacy-panel",".ai-game-plan",".ai-card-lab",".weekly-recap",".exposure-panel"].forEach(sel=>document.querySelectorAll(".main "+sel).forEach(x=>x.remove()));
}
const trimHomeObserver=new MutationObserver(()=>trimHome());trimHomeObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(trimHome);

// Public Landing v1 — a professional front door for people who do not have LINKS yet.
const PublicLanding={
 isGuest(){
  const u=new URL(location.href);
  return u.searchParams.get("welcome")==="1"||u.searchParams.get("guest")==="1";
 },
 html(){
  return '<section class="public-home"><div class="public-hero"><div class="public-sky"><i></i><i></i><i></i><i></i><div class="public-field"></div></div><nav class="public-nav"><b>LINKS<span>POOLS</span></b><div><button data-public-games>GAMES</button><button data-public-signin>SIGN IN</button></div></nav><div class="public-copy"><span>THE SPORTS POOL APP</span><h1>YOU PICK.<br><em>WE TRACK.</em><br>YOU WIN.</h1><p>Run your pools, make your picks and follow the action from one place. No spreadsheets. No chasing screenshots. No wondering who is winning.</p><div><button data-public-start>START A POOL</button><button class="ghost" data-public-join>JOIN A POOL</button></div><small>PLAYERS JOIN FREE · ONE COMMISSIONER POOL FREE FOR LIFE</small></div><div class="public-phone"><div class="phone-top"><b>LINKS</b><span>LIVE</span></div><div class="phone-card"><span>NEEDS YOU</span><b>1 PICK LEFT</b><small>Barnes Family · NFL Pick’em</small><i>MAKE PICK ›</i></div><div class="phone-card live"><span>LIVE STANDINGS</span><b>#2 JAKE</b><small>8 correct · 1 game live</small><i>WATCH ›</i></div><div class="phone-pools"><i></i><i></i><i></i></div></div></div><div class="public-proof"><div><b>ONE ACCOUNT</b><span>Every pool and every game</span></div><div><b>AUTO TRACKING</b><span>Picks, locks, scores and standings</span></div><div><b>COMMISSIONER TOOLS</b><span>Invites, rules and reminders</span></div><div><b>BUILT FOR MOBILE</b><span>Fast on game day</span></div></div><div class="public-games" id="publicGames"><div class="public-section-title"><span>LINKS GAME NETWORK</span><h2>Whatever your group plays.</h2><p>Start with the game. LINKS handles the rest.</p></div><div class="public-game-grid">'+NetworkGames.slice(0,8).map(x=>'<button data-public-game="'+x[0]+'"><div>'+networkGlyph(x[1])+'</div><span>'+x[1].toUpperCase()+'</span><b>'+x[0]+'</b><em>START ›</em></button>').join("")+'</div></div><div class="public-how"><div class="public-section-title"><span>HOW LINKS WORKS</span><h2>Three steps. Game on.</h2></div><div><article><b>01</b><h3>CREATE OR JOIN</h3><p>Commissioners choose a game and share one direct invite link.</p></article><article><b>02</b><h3>MAKE YOUR PICKS</h3><p>Players see exactly what is due and when each selection locks.</p></article><article><b>03</b><h3>FOLLOW IT LIVE</h3><p>LINKS handles scores, standings, comparison and pool activity.</p></article></div></div><div class="public-cta"><span>READY WHEN YOUR GROUP IS.</span><h2>Bring the pool. Lose the paperwork.</h2><div><button data-public-start>CREATE YOUR FIRST POOL</button><button class="ghost" data-public-signin>ALREADY HAVE LINKS? SIGN IN</button></div></div></section>';
 },
 mount(){
  if(!this.isGuest())return;
  document.documentElement.dataset.publicHome="true";
  const app=document.querySelector("#app");if(!app||app.querySelector(".public-home"))return;
  app.innerHTML=this.html();
  app.querySelectorAll("[data-public-start]").forEach(b=>b.onclick=()=>CreatePoolStudio.open());
  app.querySelectorAll("[data-public-game]").forEach(b=>b.onclick=()=>CreatePoolStudio.open(b.dataset.publicGame));
  app.querySelectorAll("[data-public-games]").forEach(b=>b.onclick=()=>document.querySelector("#publicGames")?.scrollIntoView({behavior:"smooth"}));
  app.querySelectorAll("[data-public-signin]").forEach(b=>b.onclick=()=>modal("SIGN IN TO LINKS",'<div class="connected-modal"><span class="badge live">WELCOME BACK</span><h3>Your pools are waiting.</h3><p>Account sign-in will connect here. For New Build testing, open your member Home.</p><button data-enter-member>OPEN MEMBER HOME</button></div>'));
  app.querySelectorAll("[data-public-join]").forEach(b=>b.onclick=()=>modal("JOIN A POOL",'<div class="connected-modal"><span class="badge live">DIRECT INVITES</span><h3>Open your commissioner’s invite link.</h3><p>LINKS invite links take you straight to the correct pool—no searching through pool names.</p></div>'));
  document.addEventListener("click",e=>{if(e.target.closest("[data-enter-member]")){const u=new URL(location.href);u.searchParams.delete("welcome");u.searchParams.delete("guest");u.searchParams.set("view","home");location.href=u.toString()}},{once:true});
 }
};
setTimeout(()=>PublicLanding.mount(),5);

// LINKS Visual System v5 — premium shared headers and page identity across the app.
const PageIdentity={
 "my-pools":{k:"MY LINKS",title:"Your Pools",sub:"Every pool. One command center.",mark:"rings"},
 "my-picks":{k:"GAME DAY",title:"My Picks",sub:"Everything due, locked and ready.",mark:"check"},
 "results":{k:"LINKS LIVE",title:"Scores & Results",sub:"Scores, standings and movement as they happen.",mark:"pulse"},
 "messages":{k:"POOL ROOM",title:"Messages",sub:"Your pool conversations in one place.",mark:"chat"},
 "notifications":{k:"SMART INBOX",title:"Needs Attention",sub:"Picks, invites, results and commissioner updates.",mark:"bell"},
 "commissioner":{k:"COMMISSIONER",title:"Command Center",sub:"Run the pool without chasing the pool.",mark:"shield"}
};
function pageMark(type){
 const shapes={rings:"◎",check:"✓",pulse:"⌁",chat:"••",bell:"!",shield:"L"};
 return '<div class="page-mark pm-'+type+'"><i></i><i></i><b>'+shapes[type]+'</b></div>';
}
function routeIdentity(view){
 const d=PageIdentity[view];if(!d)return "";
 return '<section class="route-identity ri-'+d.mark+'"><div class="ri-glow"></div>'+pageMark(d.mark)+'<div class="ri-copy"><span>'+d.k+'</span><h1>'+d.title+'</h1><p>'+d.sub+'</p></div><div class="ri-links"><button data-ri-home>HOME</button><button data-ri-pools>MY POOLS</button></div></section>';
}
function mountRouteIdentity(){
 const v=document.documentElement.dataset.view;
 if(!PageIdentity[v])return;
 const w=document.querySelector(".route-workspace");if(!w||w.querySelector(".route-identity"))return;
 w.insertAdjacentHTML("afterbegin",routeIdentity(v));
 w.querySelector("[data-ri-home]")?.addEventListener("click",()=>LinksRouter.navigate("home"));
 w.querySelector("[data-ri-pools]")?.addEventListener("click",()=>LinksRouter.navigate("my-pools"));
}
const riObserver=new MutationObserver(()=>mountRouteIdentity());riObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountRouteIdentity);

// Shared premium empty/loading artwork for places that do not yet have content.
function linksStateArt(kind="empty"){
 return '<div class="state-art sa-'+kind+'"><div class="sa-orbit"><i></i><i></i><b>L</b></div><span>'+(kind==="loading"?"LINKS IS GETTING IT READY":"READY WHEN YOU ARE")+'</span></div>';
}
function upgradeEmptyStates(){
 document.querySelectorAll(".empty-state,.links-empty").forEach(x=>{
  if(x.querySelector(".state-art"))return;
  x.insertAdjacentHTML("afterbegin",linksStateArt("empty"));
 });
}
const stateArtObserver=new MutationObserver(()=>upgradeEmptyStates());stateArtObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(upgradeEmptyStates);

// Game Network presentation upgrade — category ribbons make the large catalog easier to scan.
function networkCategory(name){
 const n=name.toUpperCase();
 if(/NFL|COLLEGE|SURVIVOR|CONFIDENCE|33|SQUARE/.test(n))return "FOOTBALL";
 if(/FANTASY|DYNASTY/.test(n))return "FANTASY";
 if(/MARCH|BRACKET/.test(n))return "BRACKETS";
 if(/NASCAR|RACE/.test(n))return "RACING";
 if(/GOLF/.test(n))return "GOLF";
 return "MORE";
}
function decorateNetwork(){
 document.querySelectorAll("[data-network-game]").forEach(card=>{
  if(card.querySelector(".network-category"))return;
  const name=card.dataset.networkGame||"";
  card.insertAdjacentHTML("afterbegin",'<span class="network-category">'+networkCategory(name)+'</span>');
 });
}
const netDecorObserver=new MutationObserver(()=>decorateNetwork());netDecorObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(decorateNetwork);

// Home footer brand finish: a deliberate end to the page instead of an abrupt stack of cards.
function homeFinish(){
 if(document.documentElement.dataset.view!=="home")return;
 const main=document.querySelector(".main");if(!main||main.querySelector(".home-finish"))return;
 main.insertAdjacentHTML("beforeend",'<footer class="home-finish"><div class="hf-mark"><i></i><b>L</b></div><div><strong>LINKS</strong><span>YOU PICK. WE TRACK. YOU WIN.</span></div><nav><button data-hf-pools>POOLS</button><button data-hf-picks>PICKS</button><button data-hf-results>RESULTS</button></nav></footer>');
 main.querySelector("[data-hf-pools]")?.addEventListener("click",()=>LinksRouter.navigate("my-pools"));
 main.querySelector("[data-hf-picks]")?.addEventListener("click",()=>LinksRouter.navigate("my-picks"));
 main.querySelector("[data-hf-results]")?.addEventListener("click",()=>LinksRouter.navigate("results"));
}
const hfObserver=new MutationObserver(()=>homeFinish());hfObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(homeFinish);

// Mobile First v6 — thumb-friendly LINKS shell for real game-day phone use.
function mobileTopbar(){
 return '<header class="mobile-topbar-v6"><button data-mob-home class="mt-brand"><b>L</b><span>LINKS<small>POOLS</small></span></button><div class="mt-status"><i></i><span>GAME DAY</span></div><button data-mob-inbox class="mt-inbox">!<b>'+Math.max(0,InboxStore.all().filter(x=>!x.read).length)+'</b></button></header>';
}
function mountMobileTopbar(){
 if(document.documentElement.dataset.publicHome==="true")return;
 const app=document.querySelector("#app");if(!app||app.querySelector(".mobile-topbar-v6"))return;
 app.insertAdjacentHTML("afterbegin",mobileTopbar());
 app.querySelector("[data-mob-home]")?.addEventListener("click",()=>LinksRouter.navigate("home"));
 app.querySelector("[data-mob-inbox]")?.addEventListener("click",()=>LinksRouter.navigate("notifications"));
}
const mtObserver=new MutationObserver(()=>mountMobileTopbar());mtObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountMobileTopbar);

// Mobile quick sheet keeps secondary navigation out of the bottom dock.
function mobileMoreSheet(){
 return '<div class="mobile-more-sheet"><div class="mms-handle"></div><div class="mms-head"><div><span>LINKS</span><b>MORE</b></div><button data-mms-close>×</button></div><div class="mms-grid"><button data-mms-route="notifications"><i>!</i><b>INBOX</b><span>Updates & invites</span></button><button data-mms-route="messages"><i>••</i><b>MESSAGES</b><span>Pool Room</span></button><button data-mms-route="commissioner"><i>L</i><b>COMMISSIONER</b><span>Run your pool</span></button><button data-mms-games><i>＋</i><b>GAME NETWORK</b><span>Start another pool</span></button></div></div>';
}
function openMobileMore(){
 let x=document.querySelector(".mobile-more-sheet");if(!x){document.body.insertAdjacentHTML("beforeend",mobileMoreSheet());x=document.querySelector(".mobile-more-sheet")}
 requestAnimationFrame(()=>x.classList.add("open"));
 x.querySelector("[data-mms-close]").onclick=()=>x.classList.remove("open");
 x.querySelectorAll("[data-mms-route]").forEach(b=>b.onclick=()=>{x.classList.remove("open");LinksRouter.navigate(b.dataset.mmsRoute)});
 x.querySelector("[data-mms-games]").onclick=()=>{x.classList.remove("open");LinksRouter.navigate("home");setTimeout(()=>document.querySelector(".game-network-v2")?.scrollIntoView({behavior:"smooth"}),80)};
}
function upgradeMobileDock(){
 const dock=document.querySelector(".mobile-dock");if(!dock||dock.dataset.v6)return;
 dock.dataset.v6="1";
 const buttons=[...dock.querySelectorAll("button")];
 if(buttons.length){
   const last=buttons[buttons.length-1];
   last.innerHTML='<i class="dock-more-icon">•••</i><span>MORE</span>';
   last.removeAttribute("data-route");last.removeAttribute("data-mobile-route");last.onclick=e=>{e.preventDefault();e.stopPropagation();openMobileMore()};
 }
}
const md6Observer=new MutationObserver(()=>upgradeMobileDock());md6Observer.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(upgradeMobileDock);

// Phone usability: all route changes return to top and pool tabs center themselves.
window.addEventListener("popstate",()=>scrollTo({top:0,behavior:"instant"}));
document.addEventListener("click",e=>{
 const nav=e.target.closest("[data-home-go],[data-home-go2],[data-home-pool],[data-ri-home],[data-ri-pools]");
 if(nav&&matchMedia("(max-width:700px)").matches)setTimeout(()=>scrollTo({top:0,behavior:"smooth"}),20);
 const tab=e.target.closest(".pool-hub .tabs button,.pool-hub [data-pool-tab]");
 if(tab&&matchMedia("(max-width:700px)").matches)setTimeout(()=>tab.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"}),20);
});

// Mobile Home v6: replace desktop-heavy scorebug with a compact readiness rail.
function mobileReadiness(){
 if(document.querySelector(".mobile-readiness-v6")||document.documentElement.dataset.view!=="home")return;
 const hero=document.querySelector(".home-stage");if(!hero)return;
 hero.insertAdjacentHTML("afterend",'<section class="mobile-readiness-v6"><div><span>YOUR WEEK</span><b>85% READY</b></div><i><em style="width:85%"></em></i><button data-mobile-finish>FINISH PICKS ›</button></section>');
 document.querySelector("[data-mobile-finish]")?.addEventListener("click",()=>LinksRouter.navigate("my-picks"));
}
const mrObserver=new MutationObserver(()=>mobileReadiness());mrObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mobileReadiness);

// LINKS Cohesion v7 — one visual rhythm across Home, Pool Hub and route workspaces.
function linksSectionTitle(kicker,title,sub=""){
 return '<div class="links-section-title"><div><span>'+kicker+'</span><h2>'+title+'</h2>'+(sub?'<p>'+sub+'</p>':'')+'</div><i></i></div>';
}
function polishSectionHeadings(){
 const map=[
  [".game-network-v2","GAME NETWORK","Choose your game.","Every pool starts here."],
  [".my-pools-v3","MY LINKS","Your pools.","Jump back into the action."],
  [".commissioner-v3","COMMISSIONER","Run the week.","Players, locks, rules and communication."],
  [".results-v2","LINKS LIVE","Follow the action.","Scores, standings and movement."]
 ];
 map.forEach(([sel,k,t,s])=>{
  document.querySelectorAll(sel).forEach(x=>{
   if(x.querySelector(":scope > .links-section-title"))return;
   x.insertAdjacentHTML("afterbegin",linksSectionTitle(k,t,s));
  });
 });
}
const sectionObserver=new MutationObserver(()=>polishSectionHeadings());sectionObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(polishSectionHeadings);

// Pool Hub action dock — one clear game-day decision area, adapted to the pool.
function poolActionDock(name){
 const p=PoolHubData[name];if(!p)return "";
 const g=gameIdentity(p.game),terms=gameHubTerms(name);
 const ready=p.ready>=p.members;
 return '<section class="pool-action-dock pad-'+g.type+'"><div class="pad-signal"><i></i><span>'+(ready?"POOL READY":"ACTION NEEDED")+'</span></div><div class="pad-main"><small>'+p.game+' · '+p.week+'</small><b>'+(ready?"YOU’RE READY FOR GAME DAY":terms.action)+'</b><span>'+(ready?"Your selections are set. Follow standings when play begins.":"Check your selections before "+p.lock+".")+'</span></div><button data-pad-action="'+(ready?"standings":"picks")+'">'+(ready?"VIEW STANDINGS":"OPEN PICKS")+' ›</button></section>';
}
function mountPoolActionDock(){
 if(document.documentElement.dataset.view!=="pool")return;
 const hub=document.querySelector(".pool-hub");if(!hub||hub.querySelector(".pool-action-dock"))return;
 const name=document.documentElement.dataset.pool||new URL(location.href).searchParams.get("pool");if(!name)return;
 const quick=hub.querySelector(".hub-quick");if(!quick)return;
 quick.insertAdjacentHTML("afterend",poolActionDock(name));
 const b=hub.querySelector("[data-pad-action]");if(b)b.onclick=()=>{
  const want=b.dataset.padAction.toUpperCase();
  const target=[...hub.querySelectorAll("button")].find(x=>x.textContent.trim().toUpperCase()===want);
  target?.click();
 };
}
const padObserver=new MutationObserver(()=>mountPoolActionDock());padObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountPoolActionDock);

// Shared micro-branding: consistent live/locked/ready language instead of mismatched chips.
function normalizeStatusChips(){
 document.querySelectorAll(".badge,.status,.chip").forEach(x=>{
  const t=x.textContent.trim().toUpperCase();
  if(/LIVE|IN PROGRESS/.test(t))x.dataset.linksStatus="live";
  else if(/LOCK|CLOSED|FINAL/.test(t))x.dataset.linksStatus="locked";
  else if(/READY|SAVED|OPEN/.test(t))x.dataset.linksStatus="ready";
 });
}
const statusObserver=new MutationObserver(()=>normalizeStatusChips());statusObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(normalizeStatusChips);

// Home visual bridge — keeps the page feeling like a designed story between personal and discovery areas.
function homeBridge(){
 if(document.documentElement.dataset.view!=="home")return;
 const cmd=document.querySelector(".home-command-v4");if(!cmd||cmd.querySelector(".home-bridge-v7"))return;
 const explore=cmd.querySelector(".home-explore");if(!explore)return;
 explore.insertAdjacentHTML("beforebegin",'<section class="home-bridge-v7"><div class="hbv-lines"><i></i><i></i><i></i></div><div><span>BUILT FOR GAME DAY</span><b>ONE PLACE FROM FIRST PICK TO FINAL SCORE.</b></div><div class="hbv-stats"><span><b>LIVE</b><small>SCORES</small></span><span><b>FAST</b><small>LOCKS</small></span><span><b>ONE</b><small>ACCOUNT</small></span></div></section>');
}
const bridgeObserver=new MutationObserver(()=>homeBridge());bridgeObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(homeBridge);

// Tighten v8 — reduce duplication, derive visible counts, and keep one clear action per surface.
function currentPickSummary(){
 const total=DemoSlate.length||0;
 const made=DemoSlate.reduce((n,g)=>n+(PickEngine.get(g.id)?.team?1:0),0);
 return {total,made,due:Math.max(0,total-made),pct:total?Math.round(made/total*100):100};
}
function tightenHomeTruth(){
 if(document.documentElement.dataset.view!=="home")return;
 const s=currentPickSummary();
 document.querySelectorAll(".home-primary button:first-child b").forEach(x=>x.textContent=s.due?(s.due+" DUE"):"READY");
 document.querySelectorAll(".home-scorebug b").forEach(x=>x.textContent=s.pct+"%");
 document.querySelectorAll(".mobile-readiness-v6 b").forEach(x=>x.textContent=s.pct+"% READY");
 document.querySelectorAll(".mobile-readiness-v6 em").forEach(x=>x.style.width=s.pct+"%");
 const urgent=document.querySelector(".home-now.urgent");
 if(urgent){
   urgent.classList.toggle("all-ready",s.due===0);
   const label=urgent.querySelector("div:nth-child(2) b"),sub=urgent.querySelector("div:nth-child(2) small"),cta=urgent.querySelector("em");
   if(label)label.textContent=s.due?(s.due+" PICK"+(s.due===1?"":"S")+" LEFT"):"PICKS ARE SET";
   if(sub)sub.textContent=s.due?"Finish before the next lock":"You’re ready for the next lock";
   if(cta)cta.textContent=s.due?"FINISH ›":"REVIEW ›";
 }
}
document.addEventListener("click",e=>{if(e.target.closest("[data-pick-team],[data-hub-team]"))setTimeout(tightenHomeTruth,30)},true);
const truthObserver=new MutationObserver(()=>tightenHomeTruth());truthObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(tightenHomeTruth);

function removeRedundantIntros(){
 const v=document.documentElement.dataset.view;if(!PageIdentity[v])return;
 const w=document.querySelector(".route-workspace");if(!w)return;
 const identity=w.querySelector(".route-identity");if(!identity)return;
 [...w.children].forEach(el=>{if(el===identity)return;const h=el.querySelector?.(":scope > h1,:scope > .page-title,:scope > .route-title");if(h&&h.textContent.trim().toLowerCase()===PageIdentity[v].title.toLowerCase())h.remove()});
}
const introObserver=new MutationObserver(()=>removeRedundantIntros());introObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(removeRedundantIntros);

function fixNetworkCTAs(){
 document.querySelectorAll("[data-network-game]").forEach(card=>{
   const cta=[...card.querySelectorAll("em,b,span")].find(x=>/OPEN GAME|START ›|OPEN ›/i.test(x.textContent.trim()));
   if(cta)cta.textContent="START POOL ›";
   card.setAttribute("aria-label","Start "+(card.dataset.networkGame||"")+" pool");
 });
 document.querySelectorAll(".public-game-grid [data-public-game] em").forEach(x=>x.textContent="START POOL ›");
}
const ctaObserver=new MutationObserver(()=>fixNetworkCTAs());ctaObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(fixNetworkCTAs);

function dedupeModernHome(){
 if(document.documentElement.dataset.view!=="home")return;
 [".home-command-v4",".home-live-strip",".home-brief",".home-bridge-v7",".home-finish",".game-network-v2"].forEach(sel=>document.querySelectorAll(sel).forEach((x,i)=>{if(i>0)x.remove()}));
}
const densityObserver=new MutationObserver(()=>dedupeModernHome());densityObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(dedupeModernHome);

document.addEventListener("pointerdown",e=>{const b=e.target.closest("button");if(b)b.classList.add("links-pressed")},true);
["pointerup","pointercancel","pointerleave"].forEach(type=>document.addEventListener(type,e=>e.target.closest?.("button")?.classList.remove("links-pressed"),true));

// Truth & Safety v9 — final prototype cleanup: derived state, safer creation, correct ranks.
function linksEscape(v=""){return String(v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]))}
function safePoolName(v=""){return String(v).replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,42)}

function readinessTruth(){
 const rows=Array.isArray(EntrantStatus)?EntrantStatus:Object.values(EntrantStatus||{});
 const missing=rows.filter(x=>(x.done??x.picks??0)<(x.total??3));
 return {total:rows.length,ready:rows.length-missing.length,missing};
}
function patchCommissionerTruth(){
 const r=readinessTruth(),cmd=document.querySelector(".commander-v3");if(!cmd)return;
 const metric=cmd.querySelector('[data-cmd="entrants"]');
 if(metric){metric.querySelector("strong").textContent=r.ready+" / "+r.total;metric.querySelector("span").textContent=r.missing.length?r.missing.length+" need picks":"Everyone ready"}
 const remind=cmd.querySelector('[data-cmd="remind"]');if(remind){remind.textContent=r.missing.length?"REMIND "+r.missing.length+" MISSING":"EVERYONE READY";remind.disabled=!r.missing.length}
 const auto=document.querySelector(".autopilot-v1");if(auto){
   const player=[...auto.querySelectorAll(".auto-task-list>div")].find(x=>x.querySelector("b")?.textContent==="PLAYERS");
   if(player){player.className=r.missing.length?"action":"done";player.querySelector("i").textContent=r.missing.length?"!":"✓";player.querySelector("span").textContent=r.missing.length?r.missing.length+" players still need picks":"All players are ready";player.querySelector("em").textContent=r.missing.length?"ACTION":"DONE"}
 }
}
const commissionerTruthObserver=new MutationObserver(()=>patchCommissionerTruth());commissionerTruthObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(patchCommissionerTruth);

function patchStandingsTruth(){
 const ranked=rankedDemoPlayers();
 document.querySelectorAll(".hub-standings").forEach(host=>{
   host.innerHTML=ranked.map((x,i)=>'<div class="'+(x.p.name==="Jake"?"me":"")+'"><strong>'+(i+1)+'</strong><b>'+linksEscape(x.p.name)+'</b><span>'+x.s.wins+' WINS</span><em>'+(x.p.name==="Jake"?"YOU":"")+'</em></div>').join("");
 });
}
const standingTruthObserver=new MutationObserver(()=>patchStandingsTruth());standingTruthObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(patchStandingsTruth);

function patchMyPoolsTruth(){
 const host=document.querySelector(".mypools-v3");if(!host)return;
 const pools=Object.entries(PoolHubData),summary=host.querySelectorAll(".pool-summary>div b");
 const s=currentPickSummary(),top3=pools.filter(([,p])=>/^(1|2|3|T-[123])$/.test(String(p.rank))).length;
 if(summary[0])summary[0].textContent=pools.length;
 if(summary[1])summary[1].textContent=s.due;
 if(summary[2])summary[2].textContent=top3;
 if(summary[3])summary[3].textContent=(pools.find(([,p])=>p.lock&&p.lock!=="NOT SET")?.[1].lock||"—").split("·")[0].trim();
 host.querySelectorAll(".portfolio-card").forEach(card=>{
   const name=card.dataset.openPool,p=PoolHubData[name],em=card.querySelector(".portfolio-rank em");if(!p||!em)return;
   if(name==="Barnes Family")em.textContent=s.due?(s.due+" PICK"+(s.due===1?"":"S")+" DUE ›"):"OPEN POOL ›";else em.textContent="OPEN POOL ›";
   card.classList.toggle("attention",name==="Barnes Family"&&s.due>0);
 });
}
const poolTruthObserver=new MutationObserver(()=>patchMyPoolsTruth());poolTruthObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(patchMyPoolsTruth);

function patchMyPicksTruth(){
 const host=document.querySelector(".mypicks-v3");if(!host)return;const s=currentPickSummary();
 const barnes=host.querySelector('[data-pickpool="Barnes Family"]');
 if(barnes){
  barnes.classList.toggle("action",s.due>0);barnes.classList.toggle("ready",s.due===0);
  const bar=barnes.querySelector(".pick-progress i");if(bar)bar.style.width=s.pct+"%";
  const small=barnes.querySelector(".pick-card-copy small");if(small)small.textContent=s.made+" OF "+s.total+" SAVED · THU · 7:15 PM";
  const note=barnes.querySelector(".pick-card-copy>b");if(note)note.textContent=(s.due?(s.due+" PICK"+(s.due===1?"":"S")+" MISSING"):"CARD COMPLETE")+" ›";
 }
 const cards=[...host.querySelectorAll(".pick-command-card")],totals=cards.map(x=>{const bar=x.querySelector(".pick-progress i");return parseFloat(bar?.style.width)||0});
 const pct=totals.length?Math.round(totals.reduce((a,b)=>a+b,0)/totals.length):100;
 const ring=host.querySelector(".pick-health-ring b");if(ring)ring.textContent=pct+"%";
 const due=cards.filter(x=>x.classList.contains("action")).length,hero=host.querySelector(".mypicks-hero h2");if(hero)hero.textContent=due?(due+" pool"+(due===1?"":"s")+" need"+(due===1?"s":"")+" you."):"You’re ready for game day.";
}
const picksTruthObserver=new MutationObserver(()=>patchMyPicksTruth());picksTruthObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(patchMyPicksTruth);

// Stop unsafe or duplicate pool names before the existing wizard advances/publishes.
document.addEventListener("input",e=>{const x=e.target.closest("[data-create-name]");if(x){const clean=safePoolName(x.value);if(clean!==x.value)x.value=clean}},true);
document.addEventListener("click",e=>{
 const next=e.target.closest('[data-create-next="3"]');if(next){
  const input=document.querySelector("#createPoolMount [data-create-name]"),name=safePoolName(input?.value||"");
  if(!name){e.preventDefault();e.stopImmediatePropagation();AppStatus.show("warn","Pool name needed","Give this pool a name before continuing.");return}
  if(Object.keys(PoolHubData).some(n=>n.toLowerCase()===name.toLowerCase())){e.preventDefault();e.stopImmediatePropagation();AppStatus.show("warn","That pool name is already used","Choose a different name so invite links stay clear.");return}
  input.value=name;CreatePoolStudio.draft.name=name;
 }
 const pub=e.target.closest("[data-create-publish]");if(pub){
  const name=safePoolName(CreatePoolStudio.draft.name);
  if(!name||Object.keys(PoolHubData).some(n=>n.toLowerCase()===name.toLowerCase())){e.preventDefault();e.stopImmediatePropagation();AppStatus.show("warn","Choose a unique pool name","Each LINKS pool needs its own name.");return}
  CreatePoolStudio.draft.name=name;
 }
},true);

// Saved-pick success belongs to the save event, never merely to a tap.
const originalPickSave=PickEngine.save.bind(PickEngine);
PickEngine.save=function(game,team){
 const result=originalPickSave(game,team);
 window.dispatchEvent(new CustomEvent("links:picksaved",{detail:{game,team,result}}));
 return result;
};
window.addEventListener("links:picksaved",e=>{AppStatus.show("ok","Pick saved",e.detail.team+" is saved.");setTimeout(()=>{tightenHomeTruth();patchMyPicksTruth();patchMyPoolsTruth()},20)});

// Remove any generic click-generated success toast if a blocked pick was tapped.
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-pick-team],[data-hub-team],[data-slate],[data-hubpick]");
 if(!b)return;
 if(!WeekGate.isOpen()||LockEngine.isLocked(b.closest("[data-hubgame]")?.dataset.hubgame||b.dataset.slate||""))document.querySelectorAll(".app-status.ok,.status-toast.ok").forEach(x=>{if(/pick saved/i.test(x.textContent))x.remove()});
},true);
