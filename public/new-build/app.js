const games=[["🏈","NFL Pick’em","Straight-up, ATS, Pick X"],["🎓","College Pick’em","Top 25 or custom slate"],["🛡️","Survivor","Lives, rebuys, no-repeat"],["🎯","Confidence","Rank every selection"],["3️⃣","Game 33","Season-long team draw"],["▦","Squares","Any game, auto numbers"],["🏀","March Madness","Bracket + round pools"],["⛳","Golf Majors","Masters + majors"],["🏁","NASCAR","Drivers, groups, stages"],["📈","Margin","Winning margin scoring"],["⭐","Best Bet","Weekly featured selections"],["🏆","Playoff Challenge","Postseason progression"],["5️⃣","Pick 5","Choose your strongest five"],["±","ATS Pick’em","Against-the-spread weekly"],["📊","Margin Pool","Win by the right margin"],["🔢","Rank ’Em","Rank teams, drivers or players"],["⚾","MLB Pick’em","Daily or weekly baseball"],["🏀","NBA Pick’em","Daily slate + playoffs"],["🏒","NHL Pick’em","Daily slate + playoffs"],["⚽","Soccer Pools","World Cup + tournaments"],["🥣","Bowl Challenge","College bowl season"],["🎬","Awards Pool","Custom ballot events"],["🧩","Custom Pool","Build your own event"],["👑","Underdog Pool","Reward upset picks"],["🎟️","Prop Picks","Questions, props + predictions"],["🏈","Touchdown Calls","Choose weekly TD scorers"],["🏒","NHL Survivor","Weekly survival hockey"],["⚾","13-Run Baseball","Complete 0 through 13"],["🏀","Playoff Bracket","NBA / NHL tournament brackets"],["🌍","World Cup Bracket","Group + knockout stages"],["🥇","Olympics Challenge","Custom event predictions"],["🎭","Oscars Pool","Awards-night ballot"],["🧱","Box Pool","Reusable number-grid pools"],["🧪","Pool Lab","Create a custom scoring format"],["🏇","Race Day Pick’em","Pick winners across a race card"],["🏇","Fantasy Stable","Draft horses, jockeys and trainers"],["🌹","Triple Crown Challenge","Derby · Preakness · Belmont"],["👑","Dynasty Football","Contracts, cap, rookies + taxi"],["🏈","Fantasy Redraft","Draft, waivers, trades + playoffs"],["💰","Salary Cap Fantasy","Contracts, dead cap + auctions"],["🪓","Guillotine Fantasy","Lowest score eliminated weekly"],["1️⃣","Start ’Em Once","Use players a limited number of times"],["🏈","NFL Weekly Draft","Draft a fresh lineup each week"],["🏀","NBA Daily Draft","Short-format daily fantasy drafts"],["⚾","MLB Streak","Build the longest hit streak"],["🏎️","Race Pick 5","Pick five finishers each race"],["🏇","Exacta Challenge","Predict first and second"],["🏇","Trifecta Challenge","Predict the top three"],["⛳","Golf One & Done","One golfer each event, no repeats"],["⛳","Golf Pick X","Pick a roster for each tournament"],["🏌️","FedExCup Playoffs","Golf playoff progression"],["⚾","Home Run Pool","Build and manage a weekly slugger lineup"],["🏀","March H2H","Bracket picks in head-to-head matchups"],["🏀","March Survivor","Advance by picking tournament winners"],["🏀","March Pick X","Choose X teams to score through the tournament"],["🏈","Playoff Precision","Predict postseason teams and outcomes"],["🏈","Loser Survivor","Pick the team you expect to lose"],["⚽","Euro Tournament","Group stage plus knockout bracket"]];const activity=[["PICKS","Player 2 submitted Week 3","2m"],["INVITE","Player 3 joined My Pool","18m"],["SCORE","NFL standings recalculated","31m"],["ADMIN","Week 4 college slate saved","1h"]];const adminStats=[["Players","64","59 ready"],["Missing picks","5","Send reminder"],["Pending invites","2","Resend"],["Scoring","Healthy","Live feeds"]];const pools=[["🏈","My Pool","NFL Pick’em","Week 3 • Picks open","Thursday 7:15 PM"],["🎓","College Pool","College Pick’em","Week 4 • 10 games","Saturday 11:00 AM"],["🛡️","Last One Standing","Survivor","42 alive • 7 picked","Sunday 12:00 PM"]];const NB={version:"0.1.0",events:new EventTarget(),modules:new Map(),state:{view:"home",pool:null,game:null},register(name,api){this.modules.set(name,Object.freeze(api))},emit(type,detail={}){this.events.dispatchEvent(new CustomEvent(type,{detail}))}};Object.freeze(NB.modules);function modal(title,body){document.querySelector("#modal").innerHTML=`<div class="modalback"><div class="modalbox"><h2>${title}</h2>${body}<div class="actions"><button class="ghost" onclick="document.querySelector('#modal').innerHTML=''">CANCEL</button><button class="primary">CONTINUE</button></div></div></div>`}function app(){document.querySelector("#app").innerHTML=`<div class="shell"><header class="top"><div class="brand"><b>LINKS</b> POOLS <small style="display:block;font-size:9px;color:#929dab;letter-spacing:.12em">ALL YOUR POOLS. ALL IN ONE PLACE.</small></div><span class="badge live">● LIVE</span><div class="spacer"></div><button class="ghost" id="messages">🔔</button><div class="avatar">JD</div></header><div class="layout"><aside class="side"><nav class="nav"><button class="active">⌂ &nbsp;Home</button><button>▦ &nbsp;My Pools</button><button>✓ &nbsp;My Picks</button><button>🏆 &nbsp;Results</button><button>✉ &nbsp;Messages</button><button>🔔 &nbsp;Notifications</button><button>⚙ &nbsp;Commissioner</button></nav></aside><main class="main"><section class="hero"><div><div class="eyebrow">SUNDAY COMMAND CENTER</div><h1>Everything that matters.<br>Nothing that doesn't.</h1><div class="muted">Your pools, deadlines, live action and commissioner work in one place.</div></div><button class="primary" id="create">＋ CREATE A POOL</button></section><section class="grid"><div class="card stat"><span class="muted">Active pools</span><strong>3</strong><span class="badge live">All healthy</span></div><div class="card stat"><span class="muted">Picks due</span><strong>1</strong><span class="deadline">Thursday 7:15 PM</span></div><div class="card stat"><span class="muted">Live games</span><strong>4</strong><span class="badge live">Scoring now</span></div><div class="card stat"><span class="muted">Messages</span><strong>2</strong><span class="badge">Unread</span></div><div class="card wide"><div class="section-title"><h2>MY POOLS</h2><button class="ghost">VIEW ALL →</button></div>${pools.map(p=>`<div class="pool"><div class="sport">${p[0]}</div><div class="grow"><b>${p[1]}</b><span class="muted">${p[2]} · ${p[3]}</span></div><div><div class="deadline">${p[4]}</div><span class="badge">OPEN POOL →</span></div></div>`).join("")}</div><div class="card rail"><div class="section-title"><h2>NEEDS ATTENTION</h2></div><div class="attention"><i class="dot"></i><div><b>5 players missing picks</b><div class="muted">My Pool · Week 3</div></div></div><div class="attention"><i class="dot"></i><div><b>2 invites pending</b><div class="muted">Resend email or text reminder</div></div></div><div class="attention"><i class="dot"></i><div><b>College slate ready</b><div class="muted">Review 10 selected games</div></div></div><div class="attention"><i class="dot"></i><div><b>Weekly reminder queued</b><div class="muted">Only players missing picks will receive it</div></div></div></div><div class="card wide share-card"><div class="sharecopy"><span>SHAREABLE · AFTER LOCK</span><b>Turn picks, wins and rivalries into clean sports cards.</b><small>Private by default. You choose what leaves LINKS.</small></div><div class="sharepreview"><i>LINKS</i><strong>11–5</strong><span>WEEK 7 · 2ND PLACE</span></div><button>CREATE SHARE CARD ›</button></div><div class="card wide streak-card"><div class="section-title"><h2>FORM & MOMENTUM</h2><span class="badge">PLAYER ANALYTICS</span></div><div class="formrow"><div><small>LAST 5 WEEKS</small><b>W · W · L · W · W</b><span>4–1 form</span></div><div><small>PRIMETIME</small><b>71%</b><span>best split</span></div><div><small>UPSETS</small><b>6</b><span>correct this season</span></div><div><small>STREAK</small><b>3</b><span>current wins</span></div></div></div><div class="card wide pro-card"><div class="section-title"><h2>PRO SPORTS FINISH</h2><span class="badge">NEW DESIGN SYSTEM</span></div><div class="progrid"><div><span>FAST</span><b>Skeleton-first loading</b><small>No stale-week flash before current data arrives</small></div><div><span>CLEAR</span><b>One primary action</b><small>Every screen tells you what matters next</small></div><div><span>TRUST</span><b>Source + audit labels</b><small>Know where results, edits and AI evidence came from</small></div></div></div><div class="card wide legacy-card"><div class="section-title"><h2>LINKS LEGACY</h2><span class="badge">FOREVER HISTORY</span></div><div class="legacygrid"><div><small>CAREER RECORD</small><b>146–82</b><span>64% correct</span></div><div><small>WEEKLY WINS</small><b>7</b><span>2 this season</span></div><div><small>BEST FINISH</small><b>CHAMP</b><span>2025 My Pool</span></div><div><small>RIVALRY</small><b>18–14</b><span>vs Mike</span></div></div><button class="legacybtn" data-ai="history">OPEN MY SPORTS HISTORY ›</button></div><div class="card wide recap-card"><div class="section-title"><h2>LINKS RECAP</h2><span class="badge">AI SUMMARY</span></div><div class="recapbody"><div class="recaprank"><small>LAST WEEK</small><strong>2ND</strong><span>11–5 · +4 places</span></div><div class="recapcopy"><b>Your week in 20 seconds</b><p>You nailed the late slate, climbed four spots, and your highest-confidence miss was DAL. Tennessee was your biggest separator from the field.</p><button data-ai="recap">SEE FULL RECAP ›</button></div><div class="recapstats"><span><b>69%</b> accuracy</span><span><b>3</b> unique wins</span><span><b>#2</b> season rank</span></div></div></div><div class="card wide pulse-hero"><div class="pulse-copy"><span>YOUR NIGHT · LIVE</span><h2>EVERY GAME<br><strong>MEANS SOMETHING.</strong></h2><p>LINKS connects the score to your picks, your standings, your rivals and your season—in real time.</p><button data-ai="livehub">ENTER LIVE HUB ›</button></div><div class="pulse-visual"><div class="pulse-ring r1"></div><div class="pulse-ring r2"></div><div class="pulse-core"><small>LIVE IMPACT</small><strong>4</strong><span>POOLS</span></div><div class="pulse-tag t1">▲ +4 PLACES</div><div class="pulse-tag t2">SURVIVOR · ALIVE</div><div class="pulse-tag t3">FANTASY · +8.4</div></div></div><div class="card wide rivalry-card"><div class="rivalry-top"><div><span>RIVALRY WATCH</span><b>Jake vs Mike</b><small>Head-to-head · Week 7</small></div><em>LIVE</em></div><div class="rivalry-score"><div><span>YOU</span><strong>9</strong><small>correct</small></div><div class="versus"><i></i><b>2 GAMES DIFFER</b><i></i><small>TEN + DAL decide it</small></div><div><span>MIKE</span><strong>9</strong><small>correct</small></div></div><button>OPEN MATCHUP ›</button></div><div class="card wide nightboard-card"><div class="nightboard-head"><div><span>LINKS NIGHTBOARD</span><b>Tonight at a glance</b></div><small>YOUR LIVE SPORTS UNIVERSE</small></div><div class="nightboard"><div class="nbgame featured"><span>LIVE · Q3</span><b>TEN <strong>20</strong> — <strong>17</strong> IND</b><small>4 pools · HIGH impact</small></div><div class="nbgame"><span>7:15 PM</span><b>NFL PICK’EM</b><small>1 pick still needed</small></div><div class="nbgame"><span>8:00 PM</span><b>FANTASY</b><small>2 starters tonight</small></div><div class="nbgame"><span>FINAL</span><b>WEEK 7 · 11–5</b><small>2nd place · recap ready</small></div></div></div><div class="card wide picksafe-card"><div class="picksafe-copy"><span>PICK SAFE</span><b>Your picks are saved. No second guessing.</b><small>Every tap auto-saves, shows a timestamp, and rolls into one clean confirmation across your entries.</small></div><div class="saveproof"><i>✓</i><div><b>ALL PICKS SAVED</b><span>Updated 9:42 PM · 3 entries</span></div></div><button>VIEW CONFIRMATION ›</button></div><div class="card wide personal-stream-card"><div class="streamhead"><div><span>MY LINKS</span><b>Your sports world, prioritized.</b></div><div class="streamtabs"><button class="active">FOR YOU</button><button>POOLS</button><button>FANTASY</button><button>LIVE</button></div></div><div class="streamgrid"><button class="streamitem urgent"><i>LOCK</i><p><b>NFL · Nashville Crew</b><span>1 pick missing · 42 min</span></p><em>FINISH ›</em></button><button class="streamitem"><i>LIVE</i><p><b>TEN 20 · IND 17</b><span>4 pools affected · Q3</span></p><em>FOLLOW ›</em></button><button class="streamitem"><i>AI</i><p><b>Dynasty trade review</b><span>Cap + roster impact ready</span></p><em>OPEN ›</em></button><button class="streamitem"><i>W</i><p><b>Week 7 recap</b><span>11–5 · finished 2nd</span></p><em>VIEW ›</em></button></div></div><div class="card wide attention-card"><div class="attention-title"><div><span>NEEDS YOUR ATTENTION</span><b>3 things before tonight</b></div><small>LINKS keeps the urgent stuff together.</small></div><div class="attention-strip"><button><i>01</i><p><b>1 NFL pick missing</b><span>Locks 7:15 PM · finish now</span></p><em>FIX ›</em></button><button><i>02</i><p><b>Survivor pick not submitted</b><span>Team selected · still needs save</span></p><em>SAVE ›</em></button><button><i>03</i><p><b>2 players need a reminder</b><span>Commissioner · one-tap nudge</span></p><em>NUDGE ›</em></button></div></div><div class="card wide ai-gameday-card"><div class="section-title"><h2>AI GAME PLAN</h2><span class="badge live">PERSONALIZED</span></div><div class="gameplan"><div class="gameplanlead"><span>TOP PRIORITY</span><b>Finish the decision that can move you most.</b><small>LINKS ranks actions from your actual pools, deadlines, roster and live situation.</small><button data-ai="gameplan">OPEN MY GAME PLAN ›</button></div><div class="gameplanlist"><div><i>1</i><p><b>NFL Pick’em</b><span>1 pick missing · locks first</span></p><em>NOW</em></div><div><i>2</i><p><b>Dynasty</b><span>Trade offer · roster impact available</span></p><em>REVIEW</em></div><div><i>3</i><p><b>Fantasy</b><span>Flex spot has a higher-upside option</span></p><em>CHECK</em></div></div></div></div><div class="card wide moment-card"><div class="section-title"><h2>BIG MOMENTS</h2><span class="badge live">LIVE STORYLINE</span></div><div class="moments"><div class="moment hot"><span>9:42 PM</span><b>🔥 TEN just flipped your pool</b><small>You jumped 4 places when the lead changed.</small></div><div class="moment"><span>9:31 PM</span><b>👀 Survivor sweat</b><small>3 entries are one score away from elimination.</small></div><div class="moment"><span>9:18 PM</span><b>↗ Mike moved into 1st</b><small>Current projected finish changed after DAL scored.</small></div></div></div><div class="card wide trophy-card"><div class="trophy-copy"><span>LINKS LEGACY</span><b>Every season should leave a record.</b><small>Championships, weekly wins, rivalry records, best finishes and unforgettable runs stay with your profile.</small></div><div class="trophy-stats"><div><strong>3</strong><span>TITLES</span></div><div><strong>18</strong><span>WEEKLY WINS</span></div><div><strong>64%</strong><span>RIVALRY</span></div></div><button>VIEW LEGACY ›</button></div><div class="card wide pool-room-card"><div class="section-title"><h2>POOL ROOM</h2><span class="badge live">LIVE AFTER LOCK</span></div><div class="poolroom"><div class="roomlead"><span>FIELD SPLIT</span><b>TEN 39% · IND 61%</b><small>Your TEN pick is one of the biggest differences in the room.</small></div><div class="heat"><div><span>TEN</span><i style="--w:39%"></i><b>39%</b></div><div><span>IND</span><i style="--w:61%"></i><b>61%</b></div></div><div class="roomchat"><span>POOL ACTIVITY</span><b>Mike moved into 1st</b><small>3 new reactions · 2 min ago</small></div><button>OPEN POOL ROOM ›</button></div></div><div class="card wide commish-week-card"><div class="section-title"><h2>COMMISSIONER WEEK</h2><span class="badge">AUTO PILOT</span></div><div class="weekflow"><div class="done"><i>✓</i><p><b>Slate ready</b><span>16 games loaded</span></p></div><div class="done"><i>✓</i><p><b>Picks open</b><span>Thursday–Monday</span></p></div><div class="active"><i>3</i><p><b>Waiting on picks</b><span>2 reminders queued</span></p></div><div><i>4</i><p><b>Lock & reveal</b><span>Automatic at kickoff</span></p></div><div><i>5</i><p><b>Score & recap</b><span>Automatic after finals</span></p></div></div></div><div class="card wide spotlight-card"><div class="spotcopy"><span>TONIGHT’S SPOTLIGHT</span><b>One game. Four pools. Big consequences.</b><small>TEN vs IND touches Pick’em, Survivor, Fantasy and your live scenario path.</small><button data-ai="spotlight">OPEN GAME CENTER ›</button></div><div class="spotmeter"><small>POOL IMPACT</small><strong>HIGH</strong><div><i></i></div><span>4 linked entries</span></div></div><div class="card wide join-card"><div class="joincopy"><span>INVITE FLOW</span><b>One tap from invite to picks.</b><small>Returning players open the exact pool. New players get a short setup—no hunting for pool names or codes.</small></div><div class="joinsteps"><i>LINK</i><b>→</b><i>JOIN</i><b>→</b><i>PICK</i></div><button>PREVIEW JOIN FLOW ›</button></div><div class="card wide field-card"><div class="section-title"><h2>FIELD INTELLIGENCE</h2><span class="badge live">AFTER LOCK</span></div><div class="fieldintel"><div class="fieldmain"><span>MOST IMPORTANT DIFFERENCE</span><b>You: TEN · Field: IND 61%</b><small>If TEN wins, you pass up to 5 entries.</small></div><div class="fieldstat"><strong>4</strong><span>unique picks</span></div><div class="fieldstat"><strong>2</strong><span>leverage games</span></div><button data-ai="field">OPEN FIELD VIEW ›</button></div></div><div class="card wide exposure-card"><div class="section-title"><h2>MY EXPOSURE</h2><span class="badge">ACROSS LINKS</span></div><div class="exposure"><div><span>TEN</span><b>4 entries</b><small>Heavy exposure tonight</small></div><div><span>DAL</span><b>2 entries</b><small>Mixed positions</small></div><div><span>BUF</span><b>1 entry</b><small>Survivor only</small></div><button data-ai="exposure">VIEW ALL EXPOSURE ›</button></div></div><div class="ambient-stage"><div class="ambient-orb one"></div><div class="ambient-orb two"></div></div><div class="broadcast-rail"><span class="onair"><i></i> LIVE</span><div><b>TEN 20</b><small>Q3 4:21</small></div><div><b>IND 17</b><small>Possession</small></div><div class="railimpact"><small>YOUR POOL IMPACT</small><b>▲ +4 projected places</b></div><button data-ai="scenario">LIVE HUB ›</button></div><div class="stadium-hero"><div class="stadium-copy"><span class="eyebrow">YOUR SPORTS · YOUR POOLS · LIVE</span><h1>GAME NIGHT<br><em>STARTS HERE.</em></h1><p>One personalized command center for every pick, pool, matchup and decision.</p><div class="hero-actions"><button>FINISH MY PICKS</button><button class="ghost" data-ai="brief">ASK LINKS AI</button></div></div><div class="hero-score"><small>LIVE · 4:21 Q3</small><div><b>TEN</b><strong>20</strong></div><i>—</i><div><b>IND</b><strong>17</strong></div><span>Pool impact: HIGH</span></div></div><div class="card wide command-card"><div class="section-title"><h2>NEXT UP</h2><span class="badge">PERSONAL COMMAND CENTER</span></div><div class="nextup"><button><span>01</span><div><b>FINISH NFL PICKS</b><small>1 selection missing · locks in 2h 14m</small></div><em>FINISH ›</em></button><button><span>02</span><div><b>CHECK SURVIVOR</b><small>Your team plays tonight · 11 entries alive</small></div><em>VIEW ›</em></button><button><span>03</span><div><b>DYNASTY DECISION</b><small>Trade offer expires tomorrow</small></div><em>REVIEW ›</em></button></div></div><div class="card wide scenario-card"><div class="section-title"><h2>LIVE SCENARIO ENGINE</h2><span class="badge live">2 GAMES ACTIVE</span></div><div class="scenariohero"><div><span>IF TENNESSEE HOLDS ON</span><b>You jump from #6 → #2</b><small>4 players fall behind you · 1 remaining path to #1</small></div><button data-ai="scenario">EXPLORE PATHS</button></div><div class="paths"><span><i>✓</i> TEN wins</span><span><i>→</i> DAL +3.5</span><span><i>?</i> 47 or fewer points</span></div></div><div class="card wide lock-card"><div class="section-title"><h2>LOCK CENTER</h2><span class="badge live">FAIR PLAY</span></div><div class="lockgrid"><div><span>NEXT LOCK</span><b>2h 14m</b><small>NFL · TEN vs IND</small></div><div><span>RULE STATUS</span><b>FROZEN</b><small>Scoring rules protected after kickoff</small></div><div><span>COMMISSIONER EDITS</span><b>AUDITED</b><small>Every post-lock change is badged + logged</small></div></div></div><div class="card wide social-card"><div class="section-title"><h2>GAME ROOM</h2><span class="badge live">LIVE WITH YOUR POOL</span></div><div class="gameroom"><div class="roommsg"><b>Mike</b><span>That TEN pick just changed everything 👀</span></div><div class="roomreact"><button>🔥 6</button><button>😂 3</button><button>👀 4</button></div><button class="roomjoin">OPEN GAME ROOM ›</button></div></div><div class="card wide pulse-card"><div class="section-title"><h2>POOL PULSE</h2><span class="badge live">LIVE</span></div><div class="pulsegrid"><div><span>FIELD SPLIT</span><b>TEN 64% · IND 36%</b><small>Your pool is leaning Tennessee</small></div><div><span>SWING GAME</span><b>TEN vs IND</b><small>Could move 7 players in standings</small></div><div><span>SURVIVOR</span><b>11 still alive</b><small>3 entries at risk tonight</small></div></div></div><div class="card wide"><div class="section-title"><h2>TONIGHT ON LINKS</h2><span class="livepulse">LIVE</span><span class="badge live">● 4 LIVE</span></div><div class="scorestrip"><div><small>NFL · Q3 4:21</small><b>TEN 20 <em>—</em> IND 17</b></div><div><small>MLB · FINAL</small><b>ATL 6 <em>—</em> NYM 3</b></div><div><small>WNBA · 8:00</small><b>NYL <em>vs</em> LVA</b></div></div></div><div class="card wide"><div class="section-title"><h2>LIVE ACTIVITY</h2><button class="tinybtn">FILTER</button><span class="muted">Automatic · no refresh</span></div>${activity.map(a=>`<div class="feed"><span class="feedtag">${a[0]}</span><div class="grow"><b>${a[1]}</b></div><small>${a[2]}</small></div>`).join("")}</div><div class="card rail"><div class="section-title"><h2>SMART INBOX</h2><span class="badge">3</span></div><div class="autopilot"><span>COMMISSIONER AUTOPILOT</span><b>3 routine jobs handled automatically</b><small>Missing-pick reminder · lock enforcement · final-score grading</small></div><div class="smartinbox"><button><i>!</i><div><b>1 pick missing</b><span>NFL · locks in 2h 14m</span></div><em>FIX ›</em></button><button><i>↗</i><div><b>You moved to #2</b><span>My Pool · live standings</span></div><em>VIEW ›</em></button><button><i>✓</i><div><b>Invite accepted</b><span>College Pick’em · 4m ago</span></div><em>OPEN ›</em></button></div></div><div class="card rail gm-card"><div class="section-title"><h2>FRONT OFFICE</h2><span class="badge">DYNASTY</span></div><div class="gmcap"><span>CAP SPACE</span><strong>$27.4M</strong><small>82% committed</small></div><div class="gmgrid"><button data-admin>CONTRACTS</button><button data-admin>TRADE CENTER</button><button data-admin>ROOKIE PICKS</button><button data-admin>FREE AGENCY</button></div></div><div class="card rail"><div class="section-title"><h2>PICK HEALTH</h2><span class="badge live">READY</span></div><div class="healthring"><strong>92%</strong><span>complete</span></div><div class="muted">All but one active entry is submitted. We’ll remind you before the next lock.</div></div><div class="card rail"><div class="section-title"><h2>YOUR WEEK</h2></div><div class="weekscore"><strong>9–3</strong><span class="muted">My Pool</span></div><div class="progress"><i style="width:75%"></i></div><div class="muted">4 games remaining · projected max 13</div><div class="quick"><button>VIEW MY PICKS</button><button>FIELD VIEW</button></div></div><div class="card" style="grid-column:span 12"><div class="section-title"><h2>COMMISSIONER COMMAND CENTER</h2><span class="badge live">SYSTEM HEALTHY</span></div><div class="admin-grid">${adminStats.map(a=>`<div class="admin-tile"><span class="muted">${a[0]}</span><strong>${a[1]}</strong><small>${a[2]}</small></div>`).join("")}</div><div class="quick"><button data-admin="players">PLAYERS</button><button data-admin="slate">WEEK / SLATE</button><button data-admin="rules">RULES</button><button data-admin="comms">EMAIL + TEXT</button><button data-admin="audit">ACTIVITY</button></div></div><div class="card pricing-card"><div class="section-title"><h2>LINKS POOLS</h2><span class="badge live">FREE</span></div><div class="plans"><div><b>FREE POOLS</b><strong>Play + run pools</strong><span>Core games · commissioner tools · player access</span></div><div class="featured"><b>LINKS AI PRO</b><strong>More research</strong><span>Optional AI upgrades · pools stay free</span></div><div><b>ALL ACCESS</b><strong>Everything</strong><span>Fantasy · Dynasty · automation · expanded AI</span></div></div><p class="muted plan-note">Players never pay just to join and make picks. Upgrading a pool improves the experience for everyone in it.</p></div><div class="card ai-card"><div class="ai-orbit"><i></i><i></i><i></i></div><div class="ai-kicker">LINKS AI · RESEARCH MODE</div><div class="section-title"><h2>AI SPORTS RESEARCH</h2><span class="badge live">LIVE EXPERIENCE</span></div><p class="muted">Explore matchups, trends and possible multi-leg combinations from sourced data. LINKS shows the evidence behind each leg and never promises a winner.</p><div class="ai-builder"><div class="ai-prompt">Tell LINKS what you want to research… <b>“3-leg NFL card, lower variance, no same-game legs”</b></div><div class="chips"><button>ALL SPORTS</button><button>2–3 LEGS</button><button>LOWER VARIANCE</button><button>PLUS MONEY</button><button>SAME GAME</button><button>CROSS SPORT</button></div><div class="ai-coachbar"><div class="coachdot">L</div><div><span>LINKS AI COACH</span><b>Context-aware across pools, fantasy & dynasty</b></div><div class="coachactions"><button data-ai="lineup">LINEUP</button><button data-ai="trade">TRADE</button><button data-ai="waivers">WAIVERS</button></div></div><div class="ai-copilot"><div><span>LINKS COPILOT</span><b>Ask about your pools</b><small>“Who still needs picks?” · “What locks next?” · “Show my survivor history.”</small></div><button data-ai="copilot">ASK LINKS</button></div><div class="ai-brief"><div class="brieftop"><span>PERSONALIZED</span><b>YOUR LINKS BRIEF</b><em>Updated from your pools + sports research</em></div><div class="briefgrid"><button data-ai="brief"><strong>1</strong><span>Pick still needs attention</span></button><button data-ai="scenario"><strong>#2</strong><span>Best live finish if TEN wins</span></button><button data-ai="watch"><strong>3</strong><span>Matchups on your watchlist</span></button></div></div><div class="ai-ticket"><div class="tickethead"><div><span>LINKS AI · CARD LAB</span><b>Research Card Preview</b></div><em>3 LEGS · MODERATE</em></div><div class="ticketlegs"><div><i>NBA</i><p><b>Player points prop</b><span>7/10 recent · matchup + pace checked</span></p><strong>A</strong></div><div><i>NHL</i><p><b>Shots on goal prop</b><span>8/10 recent · role stable</span></p><strong>A−</strong></div><div><i>NFL</i><p><b>Receiving prop</b><span>6/8 comparable games · correlation checked</span></p><strong>B+</strong></div></div><div class="ticketfoot"><span><b>Evidence grade</b> summarizes data quality—not win probability.</span><button data-ai="carddetail">VIEW RECEIPTS ›</button></div></div><div class="ai-workbench"><div class="workhead"><div><span>LINKS AI · WORKBENCH</span><b>Build with receipts, not hype.</b></div><button data-ai="newcard">+ NEW CARD</button></div><div class="worklegs"><div><i>1</i><div><b>Player Prop</b><span>Recent · season · matchup evidence</span></div><em>ADD LEG ›</em></div><div><i>2</i><div><b>Correlation Check</b><span>Flags legs that move together or fight each other</span></div><em>ANALYZE ›</em></div><div><i>3</i><div><b>Price & Sample</b><span>Show implied chance, sample size and line movement</span></div><em>REVIEW ›</em></div></div><div class="workfooter"><span>Every saved card keeps wins <b>and</b> losses.</span><button data-ai="tracker">OPEN LIVE TRACKER</button></div></div><div class="ai-scan"><div class="scanhead"><b>AI DAILY SCAN</b><span>Research workspace</span></div><div class="scanrows"><button data-ai="edge"><span>NFL</span><b>Matchup edges</b><em>12 games scanned ›</em></button><button data-ai="props"><span>NBA</span><b>Player trend board</b><em>84 props tracked ›</em></button><button data-ai="cross"><span>MULTI</span><b>Cross-sport builder</b><em>Build from evidence ›</em></button></div></div><div class="ai-metrics"><div><strong>LIVE</strong><span>data-first research</span></div><div><strong>WHY?</strong><span>evidence per leg</span></div><div><strong>TRACK</strong><span>full result history</span></div></div><div class="quick"><button data-ai="build">BUILD RESEARCH CARD</button><button data-ai="trends">PLAYER TRENDS</button><button data-ai="matchup">MATCHUP LAB</button><button data-ai="scan">SCAN TODAY</button></div></div></div><div class="card" style="grid-column:span 12"><div class="section-title"><h2>GAME LIBRARY</h2><span class="muted">All your pools. All your games. All in one place.</span></div><div class="filterbar"><button class="active">ALL</button><button>FOOTBALL</button><button>BASKETBALL</button><button>BASEBALL</button><button>GOLF</button><button>HOCKEY</button><button>SOCCER</button><button>RACING</button><button>FANTASY</button><button>SPECIAL</button></div><div class="games">${games.map(g=>`<div class="game"><div class="ico">${g[0]}</div><b>${g[1]}</b><span class="muted">${g[2]}</span></div>`).join("")}</div></div></section></main></div><nav class="bottom"><button class="active"><span>⌂</span>HOME</button><button><span>▦</span>POOLS</button><button><span>✓</span>PICKS</button><button><span>🏆</span>RESULTS</button><button><span>⚙</span>ADMIN</button></nav></div>`;document.querySelector("#create").onclick=()=>modal("Create a pool",`<div class="muted">Fast setup first. Advanced rules stay available after creation.</div><div class="field"><label>POOL NAME</label><input placeholder="My Pool"></div><div class="field"><label>SPORT OR GAME</label><input placeholder="Search NFL, College, Survivor, Squares…"></div><div class="field"><label>YOUR ROLE</label><input value="Commissioner + Player" readonly></div>`);document.querySelectorAll("[data-ai]").forEach(x=>x.onclick=()=>modal("LINKS AI · "+x.textContent,`<p class="muted">Choose sport(s), games, leg count, markets, risk profile, same-game or cross-game, and any players or teams you want included or excluded. Every result will show the data behind each leg, sample size, current line/price when available, and correlation warnings.</p><div class="field"><label>WHAT DO YOU WANT LINKS TO BUILD?</label><input placeholder="Example: 4 legs, NBA + NHL, moderate risk, no unders"></div>`));document.querySelectorAll("[data-admin]").forEach(x=>x.onclick=()=>modal("Commissioner · "+x.textContent,`<p class="muted">This control is isolated from game pages. Changes are validated, saved through the pool engine, and recorded in activity history.</p><div class="field"><label>SEARCH OR ACTION</label><input placeholder="Find player, week, rule or message…"></div>`));document.querySelectorAll(".game").forEach((x,i)=>x.onclick=()=>modal(games[i][1],`<p class="muted">${games[i][2]}</p><p>This module will carry its own picks, scoring, standings, rules and commissioner controls while sharing the LINKS account, notification and pool engines.</p>`))}NB.register("shell",{mount:app});NB.register("games",{catalog:()=>games.slice()});NB.register("pools",{list:()=>pools.slice()});app();
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
  {name:"Player 2",picks:{"ten-ind":"TEN","dal-nyg":"DAL","buf-mia":"MIA"}},
  {name:"Player 3",picks:{"ten-ind":"IND","dal-nyg":"DAL","buf-mia":"BUF"}}
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
 {name:"Player 2",email:"amanda@example.com",done:2,total:3,last:"1 pick missing"},
 {name:"Mike",email:"mike@example.com",done:3,total:3,last:"Saved yesterday"},
 {name:"Player 3",email:"chris@example.com",done:0,total:3,last:"No picks yet"}
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
 "my-picks":()=>`<section class="route-hero"><div><span>MY PICKS</span><h1>Your week at a glance.</h1><p>One place for unfinished cards, saved picks and upcoming locks.</p></div><div class="route-kpi"><strong>1</strong><small>CARD NEEDS YOU</small></div></section><section class="route-grid"><article class="route-focus"><span>NEXT DEADLINE</span><h2>My Pool · Week 3</h2><p>1 pick still missing before Thursday 7:15 PM.</p><button class="primary" data-jump-picks>FINISH PICKS ›</button></article><article class="route-status good"><span>SAVED</span><h3>College Pool</h3><p>10 of 10 college picks complete.</p><b>✓ PICK CARD COMPLETE</b></article><article class="route-status"><span>SURVIVOR</span><h3>Last One Standing</h3><p>Your selection is saved and protected.</p><b>LOCKS SUNDAY 12:00 PM</b></article></section>`,
 "results":()=>`<section class="route-hero"><div><span>RESULTS</span><h1>Scores, standings & history.</h1><p>Final results drive records automatically. Live games remain live until final.</p></div><div class="route-kpi"><strong>2–0</strong><small>WEEK 7 FINAL PICKS</small></div></section><section class="route-grid"><article class="route-focus"><span>LIVE STANDINGS</span><h2>My Pool</h2><p>You are currently tied for the weekly lead.</p><button class="primary" data-jump-results>OPEN LIVE SCORING ›</button></article><article class="route-status"><span>LEGACY</span><h3>Season record</h3><p>Permanent weekly history stays attached to your account.</p><b>VIEW HISTORY ›</b></article></section>`,
 "messages":()=>`<section class="route-hero"><div><span>MESSAGES</span><h1>Pool communication without the chaos.</h1><p>Commissioner announcements, reminders and pool conversation live together.</p></div></section><section class="route-stack"><article><b>Commissioner · My Pool</b><span>Week 3 is open. Get picks in before Thursday kickoff.</span><small>18 minutes ago</small></article><article><b>LINKS</b><span>Your College Pool pick card is complete.</span><small>Yesterday</small></article></section>`,
 "notifications":()=>`<section class="route-hero"><div><span>NOTIFICATIONS</span><h1>Only what needs your attention.</h1><p>Deadlines, results, invitations and commissioner activity.</p></div></section><section class="route-stack"><article><b>Pick deadline approaching</b><span>My Pool has 1 missing pick.</span><small>Action needed</small></article><article><b>Standings updated</b><span>Two Week 7 games are final.</span><small>31 minutes ago</small></article></section>`,
 "commissioner":()=>`<section class="route-hero"><div><span>COMMISSIONER</span><h1>Run the week from one screen.</h1><p>Entrants, locks, reminders, scoring health and audited overrides.</p></div><div class="route-kpi"><strong>5</strong><small>NEED PICKS</small></div></section><section class="route-grid"><article class="route-focus"><span>WEEK CONTROL</span><h2>My Pool · Week 3</h2><p>59 of 64 entries complete · scoring healthy.</p><button class="primary" data-jump-admin>OPEN WEEK CONTROLS ›</button></article>${adminStats.map(x=>`<article class="route-status"><span>${x[0]}</span><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join("")}</section>`
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
 "My Pool":{icon:"🏈",game:"NFL PICK’EM",week:"WEEK 3",members:64,ready:59,lock:"THU · 7:15 PM",record:"2–0",rank:"T-1",accent:"NFL"},
 "College Pool":{icon:"🎓",game:"COLLEGE PICK’EM",week:"WEEK 4",members:28,ready:28,lock:"SAT · 11:00 AM",record:"8–2",rank:"4",accent:"NCAA"},
 "Last One Standing":{icon:"🛡️",game:"SURVIVOR",week:"WEEK 3",members:42,ready:7,lock:"SUN · 12:00 PM",record:"ALIVE",rank:"—",accent:"SURVIVOR"}
};
function openPoolHub(name){
 const p=PoolHubData[name]||PoolHubData["My Pool"];
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
   <article class="hub-activity"><span>POOL PULSE</span><h3>Latest activity</h3><p><b>Player 2</b> finished her card <small>2m</small></p><p><b>Standings</b> recalculated <small>31m</small></p><p><b>Commissioner</b> posted a note <small>1h</small></p></article>
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
 panel.innerHTML='<div class="home-now"><span>GOOD MORNING · YOUR LINKS</span><h2>One pick needs you.</h2><p>My Pool locks Thursday at 7:15 PM. Everything else is ready.</p><div class="home-actions"><button class="primary" data-home-pick>FINISH MY PICKS ›</button><button class="ghost" data-home-pools>OPEN MY POOLS</button></div></div><div class="home-radar"><div><small>POOLS</small><strong>3</strong><span>active</span></div><div><small>PICKS</small><strong>1</strong><span>due</span></div><div><small>LIVE</small><strong>4</strong><span>games</span></div><div><small>INBOX</small><strong>2</strong><span>unread</span></div></div>';
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
 n.innerHTML='<span class="now-pulse"></span><b>NOW</b><div class="now-copy"><strong>1 PICK DUE</strong><span>My Pool · Thu 7:15 PM</span></div><button data-now-action>FINISH ›</button>';
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
 const pool=document.documentElement.dataset.pool||new URL(location.href).searchParams.get("pool")||"My Pool";
 const p=PoolHubData[pool]||PoolHubData["My Pool"];
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
 const p=PoolHubData[pool]||PoolHubData["My Pool"];
 if(tab==="picks") return '<div class="hub-panel-head"><span>MY PICKS · '+p.week+'</span><h3>Finish your card.</h3><p>Your choices save as you go. Locked games cannot be changed.</p></div><div class="hub-pick-list">'+DemoSlate.map(g=>{const saved=PickEngine.get(g.id)?.team||"";const locked=LockEngine.isLocked(g.id);return '<div class="hub-pick-row" data-hubgame="'+g.id+'"><div class="hub-game-meta"><b>'+g.away+' <i>VS</i> '+g.home+'</b><span>'+g.kick+(locked?' · LOCKED':' · OPEN')+'</span></div><div class="hub-choice"><button '+(locked?'disabled':'')+' data-hubpick="'+g.away+'">'+g.away+'</button><button '+(locked?'disabled':'')+' data-hubpick="'+g.home+'">'+g.home+'</button></div><em>'+(saved?'PICK: '+saved:'NEEDS PICK')+'</em></div>'}).join("")+'</div><button class="primary hub-confirm" data-hubconfirm>REVIEW PICKS ›</button>';
 if(tab==="standings") return '<div class="hub-panel-head"><span>LIVE STANDINGS</span><h3>Every result, one table.</h3><p>Finals score automatically. Live games stay visible without counting early.</p></div><div class="hub-standings">'+ScoreDemo.players.map((x,i)=>{const s=scored(x);return '<div class="'+(x.name==="Jake"?'me':'')+'"><strong>'+(i+1)+'</strong><b>'+x.name+'</b><span>'+s.wins+' WINS</span><em>'+(x.name==="Jake"?'YOU':'')+'</em></div>'}).join("")+'</div>';
 if(tab==="compare") return '<div class="hub-panel-head"><span>FIELD COMPARE</span><h3>Know where the pool stands.</h3><p>Before lock, other selections stay private. After lock, the field opens automatically.</p></div><div class="hub-field">'+DemoSlate.map(g=>'<div><b>'+g.away+' vs '+g.home+'</b><span>'+(LockEngine.isLocked(g.id)?'FIELD REVEALED':'PICKS HIDDEN UNTIL LOCK')+'</span><i class="'+(LockEngine.isLocked(g.id)?'open':'')+'"></i></div>').join("")+'</div>';
 if(tab==="room") return '<div class="hub-panel-head"><span>POOL ROOM</span><h3>Game day conversation.</h3><p>Commissioner updates and pool chatter without exposing protected picks.</p></div><div class="hub-chat"><div><i>JD</i><p><b>Commissioner</b><span>Week '+p.week.replace(/\D/g,"")+' is open. Get those picks in before '+p.lock+'.</span></p><time>8:14 PM</time></div><div><i>AM</i><p><b>Player 2</b><span>Mine are in. Good luck everybody!</span></p><time>8:22 PM</time></div><div><i>MK</i><p><b>Mike</b><span>This week is going to be wild.</span></p><time>8:31 PM</time></div></div><div class="hub-compose"><input placeholder="Message the pool…" maxlength="180"><button>SEND</button></div>';
 if(tab==="rules") return '<div class="hub-panel-head"><span>POOL RULES</span><h3>Simple. Clear. Always available.</h3></div><div class="hub-rules"><div><b>SCORING</b><span>1 point for each correct winner.</span></div><div><b>DEADLINE</b><span>Each game locks automatically at kickoff.</span></div><div><b>VISIBILITY</b><span>Other players’ picks remain hidden until that game locks.</span></div><div><b>TIEBREAKER</b><span>Closest combined score wins the weekly tie.</span></div></div>';
 return "";
}
function activatePoolTabs(){
 const ws=document.querySelector(".route-workspace");if(!ws||document.documentElement.dataset.view!=="pool")return;
 const pool=document.documentElement.dataset.pool||new URL(location.href).searchParams.get("pool")||"My Pool";
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
 ws.querySelector('[data-cmd="remind"]')?.addEventListener("click",()=>{["Player 2","Player 3"].forEach(n=>ReminderQueue.send?.(n));AuditLog.add("REMINDER BATCH","Missing-pick reminder sent");modal("REMINDERS SENT",'<div class="connected-modal"><span class="badge live">5 PLAYERS</span><h3>Missing-pick reminders queued.</h3><p>No selections were exposed. Players receive only the games they still need to complete.</p></div>')});
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
  {id:"lock",type:"urgent",icon:"⏱",title:"1 pick still missing",body:"My Pool · TEN at IND locks Thursday at 7:15 PM.",time:"NOW",action:"PICKS",read:false},
  {id:"commish",type:"admin",icon:"L",title:"Commissioner update",body:"Week 3 is open. Get your picks in before kickoff.",time:"18m",action:"POOL",read:false},
  {id:"result",type:"result",icon:"★",title:"You moved into T-1",body:"Two finals moved you up one spot in My Pool.",time:"42m",action:"RESULTS",read:true},
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
 document.querySelectorAll(".mobile-dock [data-mobile-route='notifications'] b,.mobile-dock [data-mobile-route='notifications'] .badge,.mobile-more-sheet [data-mobile-route='notifications'] b").forEach(x=>{x.textContent=unread||"";x.hidden=unread===0;x.title=unread+" unread alerts"});
}
queueMicrotask(syncDockInbox);

// My Picks v3 — cross-pool command card with deadline priority and completion.
const MyPickCards=[
 {pool:"My Pool",game:"NFL PICK’EM",due:"THU · 7:15 PM",done:2,total:3,state:"action",note:"1 PICK MISSING"},
 {pool:"College Pool",game:"COLLEGE PICK’EM",due:"SAT · 11:00 AM",done:10,total:10,state:"ready",note:"CARD COMPLETE"},
 {pool:"Last One Standing",game:"SURVIVOR",due:"SUN · 12:00 PM",done:0,total:1,state:"action",note:"SELECTION NEEDED"}
];
function myPicksCommand(){
 return '<section class="mypicks-v3"><div class="mypicks-hero"><div><span>MY PICKS</span><h2>Two decisions. Then you’re done.</h2><p>LINKS sorts every pool by what needs you first.</p></div><div class="pick-health-ring"><b>85%</b><span>WEEK READY</span></div></div><div class="deadline-line"><i></i><div><span>NEXT LOCK</span><b>My Pool · Thursday 7:15 PM</b></div><em>1 PICK DUE</em></div><div class="pick-command-grid">'+MyPickCards.map((x,i)=>'<button class="pick-command-card '+x.state+'" data-pickpool="'+x.pool+'"><div class="pick-card-art '+gameCategory(x.game)+'">'+artHTML(gameCategory(x.game))+'</div><div class="pick-card-copy"><span>'+x.game+'</span><h3>'+x.pool+'</h3><div class="pick-progress"><i style="width:'+Math.round(x.done/x.total*100)+'%"></i></div><small>'+x.done+' OF '+x.total+' SAVED · '+x.due+'</small><b>'+x.note+' ›</b></div></button>').join("")+'</div><div class="pick-safe-banner"><div class="safe-shield">✓</div><div><b>PICK SAFE</b><span>Your saved picks stay private until each game locks.</span></div><em>AUTO-SAVE ON</em></div></section>';
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
 const seed=[{who:"Commissioner",text:"Week 3 is open. Picks lock at each game kickoff.",at:"9:04 AM"},{who:"Player 2",text:"That Thursday game is tougher than it looks.",at:"11:18 AM"},{who:"Mike",text:"I’m locked in. Good luck everybody.",at:"1:42 PM"}];
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
 const pool=hub?.textContent?.trim()||new URL(location.href).searchParams.get("pool")||"My Pool";
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
 home.querySelectorAll("[data-network-game]").forEach(b=>b.addEventListener("click",()=>CreatePoolStudio.open(b.dataset.networkGame)));
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
// Pick confirmation is emitted only by PickEngine.save below.

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
function inviteCenter(pool="My Pool"){
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
 if(!b)return;const pool=new URL(location.href).searchParams.get("pool")||"My Pool";e.preventDefault();e.stopImmediatePropagation();openInviteCenter(pool);
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
 const rows=Array.isArray(EntrantStatus)?EntrantStatus:Object.values(EntrantStatus||{});
 const missing=rows.filter(v=>{const done=v?.done??v?.picks??0,need=v?.total??3;return done<need});
 return {total:rows.length,ready:rows.length-missing.length,missing:missing.map(v=>v?.name||"Player")};
}
function readinessStrip(){
 const r=entrantReadiness(),pct=r.total?Math.round(r.ready/r.total*100):100;
 return '<div class="readiness-strip"><div class="readiness-ring" style="--ready:'+pct+'%"><b>'+pct+'%</b></div><div><span>PLAYER READINESS</span><b>'+r.ready+' OF '+r.total+' COMPLETE</b><small>'+(r.missing.length?r.missing.join(", ")+" still need picks.":"Everyone is ready.")+'</small></div><button data-ready-remind '+(!r.missing.length?'disabled':'')+'>'+(r.missing.length?'REMIND '+r.missing.length:'ALL READY')+'</button></div>';
}
function mountReadiness(){
 const cmd=document.querySelector(".commander-v3");if(!cmd||cmd.querySelector(".readiness-strip"))return;
 cmd.insertAdjacentHTML("beforeend",readinessStrip());
 cmd.querySelector("[data-ready-remind]")?.addEventListener("click",()=>{const r=entrantReadiness();r.missing.forEach(n=>ReminderQueue.send?.(n));AuditLog.add("REMINDERS SENT",r.missing.length+" incomplete players");AppStatus.show("ok","Reminders queued",r.missing.length+" incomplete player"+(r.missing.length===1?"":"s")+" targeted.")});
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
 const pool=new URL(location.href).searchParams.get("pool")||document.documentElement.dataset.pool||"My Pool";
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
  if(step===1)return '<div class="create-studio"><div class="create-steps"><b class="on">1 GAME</b><b>2 DETAILS</b><b>3 RULES</b><b>4 READY</b></div><div class="create-title"><span>CREATE POOL</span><h2>What are you playing?</h2><p>Start with the format. LINKS will load the right commissioner controls next.</p></div><div class="create-games">'+NetworkGames.map(x=>'<button data-create-game="'+x[0]+'" class="'+(d.game===x[0]?"selected":"")+'"><div class="mini-network-art">'+networkGlyph(x[1])+'</div><div><b>'+x[0]+'</b><span>'+x[2]+'</span></div><em>›</em></button>').join("")+'</div><div class="create-foot"><span>LINKS POOLS ARE FREE</span><button data-create-next="2">CONTINUE ›</button></div></div>';
  if(step===2)return '<div class="create-studio"><div class="create-steps"><b class="done">✓ GAME</b><b class="on">2 DETAILS</b><b>3 RULES</b><b>4 READY</b></div><div class="create-title"><span>'+d.game+'</span><h2>Name your pool.</h2><p>Keep it recognizable. Invite links will take players straight here.</p></div><label class="create-field"><span>POOL NAME</span><input data-create-name maxlength="42" value="'+d.name.replace(/"/g,"&quot;")+'" placeholder="Example: My Pool"></label><div class="create-choice"><span>WHO CAN JOIN?</span><button data-create-privacy="PRIVATE" class="'+(d.privacy==="PRIVATE"?"selected":"")+'"><b>PRIVATE</b><small>Invite link or commissioner invite</small></button><button data-create-privacy="OPEN" class="'+(d.privacy==="OPEN"?"selected":"")+'"><b>OPEN</b><small>Players can request to join</small></button></div><div class="create-foot"><button class="secondary" data-create-next="1">‹ BACK</button><button data-create-next="3">CONTINUE ›</button></div></div>';
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
  h.querySelectorAll("[data-create-next]").forEach(b=>b.onclick=()=>{if(step===2){const n=h.querySelector("[data-create-name]")?.value.trim();if(!n){AppStatus.show("warn","Pool name needed","Give this pool a name before continuing.");return}const duplicate=Object.keys(PoolHubData).some(x=>x.trim().toLowerCase()===n.toLowerCase())||CreatedPools.all().some(x=>(x.name||"").trim().toLowerCase()===n.toLowerCase());if(duplicate){AppStatus.show("warn","Pool name already used","Choose a unique pool name so invites and returning players always land in the right place.");return}this.draft.name=n}this.render(h,+b.dataset.createNext)});
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
 return '<section class="home-command-v4"><div class="home-stage"><div class="home-stadium"><i></i><i></i><i></i><i></i><div class="field-lines"></div></div><div class="home-stage-copy"><span>LINKS POOLS</span><h1>ALL YOUR POOLS.<br><em>ALL IN ONE PLACE.</em></h1><p>Make picks. Track the field. Run your pools. One account for every game.</p><div class="home-primary"><button data-home-go="my-picks">MAKE MY PICKS <b>1 DUE</b></button><button class="ghost" data-home-go="my-pools">MY POOLS</button></div></div><div class="home-scorebug"><span>YOUR WEEK</span><b>85%</b><small>READY</small><i style="--week:85%"></i></div></div><div class="home-now-grid"><button class="home-now urgent" data-home-go="my-picks"><div class="now-icon">✓</div><div><span>NEEDS YOU</span><b>1 PICK LEFT</b><small>My Pool · before Thursday lock</small></div><em>FINISH ›</em></button><button class="home-now" data-home-pool="My Pool"><div class="now-icon live">●</div><div><span>UP NEXT</span><b>'+((next&&next.game)||"NFL PICK’EM")+'</b><small>'+((next&&next.lock)||"THU · 7:15 PM")+'</small></div><em>OPEN ›</em></button><button class="home-now" data-home-go="results"><div class="now-icon trophy">★</div><div><span>LIVE BOARD</span><b>SEE RESULTS</b><small>Scores, standings and movement</small></div><em>WATCH ›</em></button></div><div class="home-section-head"><div><span>YOUR POOLS</span><h2>Jump back in.</h2></div><button data-home-go="my-pools">VIEW ALL '+active+' ›</button></div><div class="home-pool-rail">'+pools.slice(0,3).map(([name,p])=>{const g=gameIdentity(p.game);return '<button class="home-pool-card hpc-'+g.type+'" data-home-pool="'+name+'"><div class="hpc-art">'+networkGlyph(g.type)+'</div><div class="hpc-copy"><span>'+p.game+' · '+p.week+'</span><h3>'+name+'</h3><div><b>'+p.ready+'/'+p.members+' READY</b><b>'+p.lock+'</b></div></div><em>'+p.rank+'<small>'+p.record+'</small></em></button>'}).join("")+'</div><div class="home-explore"><div class="home-explore-art"><i></i><i></i><i></i><b>LINKS</b></div><div><span>GAME NETWORK</span><h2>There’s a pool for that.</h2><p>Football, brackets, racing, golf, fantasy, custom games and more.</p></div><button data-home-games>EXPLORE GAMES ›</button></div></section>';
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
 return '<section class="home-brief"><div class="hb-head"><div><span>YOUR LINKS BRIEF</span><h2>What matters right now.</h2></div><button data-brief-inbox>'+unread+' UNREAD ›</button></div><div class="hb-grid"><button data-home-go2="my-picks"><i class="pick">✓</i><div><span>PICKS</span><b>Finish My Pool</b><small>1 selection left before the next lock</small></div><em>DO IT ›</em></button><button data-home-go2="notifications"><i class="msg">✦</i><div><span>INBOX</span><b>Commissioner update</b><small>Week 3 access and deadline information</small></div><em>READ ›</em></button><button data-home-go2="results"><i class="move">↑</i><div><span>MOVEMENT</span><b>You moved into the top group</b><small>Live standings changed after the last final</small></div><em>VIEW ›</em></button></div></section>';
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
  return '<section class="public-home"><div class="public-hero"><div class="public-sky"><i></i><i></i><i></i><i></i><div class="public-field"></div></div><nav class="public-nav"><b>LINKS<span>POOLS</span></b><div><button data-public-games>GAMES</button><button data-public-signin>SIGN IN</button></div></nav><div class="public-copy"><span>THE SPORTS POOL APP</span><h1>YOU PICK.<br><em>WE TRACK.</em><br>YOU WIN.</h1><p>Run your pools, make your picks and follow the action from one place. No spreadsheets. No chasing screenshots. No wondering who is winning.</p><div><button data-public-start>START A POOL</button><button class="ghost" data-public-join>JOIN A POOL</button></div><small>PLAYERS JOIN FREE · ONE COMMISSIONER POOL FREE POOLS</small></div><div class="public-phone"><div class="phone-top"><b>LINKS</b><span>LIVE</span></div><div class="phone-card"><span>NEEDS YOU</span><b>1 PICK LEFT</b><small>My Pool · NFL Pick’em</small><i>MAKE PICK ›</i></div><div class="phone-card live"><span>LIVE STANDINGS</span><b>#2 JAKE</b><small>8 correct · 1 game live</small><i>WATCH ›</i></div><div class="phone-pools"><i></i><i></i><i></i></div></div></div><div class="public-proof"><div><b>ONE ACCOUNT</b><span>Every pool and every game</span></div><div><b>AUTO TRACKING</b><span>Picks, locks, scores and standings</span></div><div><b>COMMISSIONER TOOLS</b><span>Invites, rules and reminders</span></div><div><b>BUILT FOR MOBILE</b><span>Fast on game day</span></div></div><div class="public-games" id="publicGames"><div class="public-section-title"><span>LINKS GAME NETWORK</span><h2>Whatever your group plays.</h2><p>Start with the game. LINKS handles the rest.</p></div><div class="public-game-grid">'+NetworkGames.slice(0,8).map(x=>'<button data-public-game="'+x[0]+'"><div>'+networkGlyph(x[1])+'</div><span>'+x[1].toUpperCase()+'</span><b>'+x[0]+'</b><em>START ›</em></button>').join("")+'</div></div><div class="public-how"><div class="public-section-title"><span>HOW LINKS WORKS</span><h2>Three steps. Game on.</h2></div><div><article><b>01</b><h3>CREATE OR JOIN</h3><p>Commissioners choose a game and share one direct invite link.</p></article><article><b>02</b><h3>MAKE YOUR PICKS</h3><p>Players see exactly what is due and when each selection locks.</p></article><article><b>03</b><h3>FOLLOW IT LIVE</h3><p>LINKS handles scores, standings, comparison and pool activity.</p></article></div></div><div class="public-cta"><span>READY WHEN YOUR GROUP IS.</span><h2>Bring the pool. Lose the paperwork.</h2><div><button data-public-start>CREATE YOUR FIRST POOL</button><button class="ghost" data-public-signin>ALREADY HAVE LINKS? SIGN IN</button></div></div></section>';
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
   if(name==="My Pool")em.textContent=s.due?(s.due+" PICK"+(s.due===1?"":"S")+" DUE ›"):"OPEN POOL ›";else em.textContent="OPEN POOL ›";
   card.classList.toggle("attention",name==="My Pool"&&s.due>0);
 });
}
const poolTruthObserver=new MutationObserver(()=>patchMyPoolsTruth());poolTruthObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(patchMyPoolsTruth);

function patchMyPicksTruth(){
 const host=document.querySelector(".mypicks-v3");if(!host)return;const s=currentPickSummary();
 const barnes=host.querySelector('[data-pickpool="My Pool"]');
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

// Join Gateway v10 — invite links now have a real, focused front door instead of dropping strangers into a member pool.
const JoinGateway={
 requested(){const u=new URL(location.href);return u.searchParams.get("invite")==="1"&&u.searchParams.get("pool")},
 pool(){return new URL(location.href).searchParams.get("pool")||""},
 html(pool){
  const p=PoolHubData[pool],g=gameIdentity(p?.game||"");
  return '<section class="join-gateway"><div class="join-stage jg-'+g.type+'"><div class="jg-lights"><i></i><i></i><i></i></div><div class="jg-brand"><b>L</b><span>LINKS<small>POOLS</small></span></div><div class="jg-game">'+networkGlyph(g.type)+'</div><span class="jg-kicker">YOU’VE BEEN INVITED</span><h1>'+linksEscape(pool)+'</h1><p>'+(p?linksEscape(p.game)+' · '+linksEscape(p.week):'A LINKS SPORTS POOL')+'</p><div class="jg-proof"><span><b>FREE</b><small>TO JOIN</small></span><span><b>PRIVATE</b><small>PICKS</small></span><span><b>LIVE</b><small>STANDINGS</small></span></div><button data-join-existing>ALREADY HAVE LINKS · SIGN IN</button><button class="secondary" data-join-new>NEW TO LINKS · JOIN POOL</button><small class="jg-note">This invite opens '+linksEscape(pool)+' directly. No pool searching.</small></div><div class="join-side"><span>WHAT HAPPENS NEXT</span><div><i>1</i><p><b>OPEN YOUR ACCOUNT</b><small>Sign in or make a quick player account.</small></p></div><div><i>2</i><p><b>JOIN THIS POOL</b><small>LINKS keeps you attached to the correct pool.</small></p></div><div><i>3</i><p><b>MAKE YOUR PICKS</b><small>Deadlines and locks are shown automatically.</small></p></div></div></section>';
 },
 mount(){
  if(!this.requested())return false;const pool=this.pool(),app=document.querySelector("#app");if(!app)return false;
  document.documentElement.dataset.joinGateway="true";document.documentElement.dataset.publicHome="true";
  app.innerHTML=this.html(pool);
  app.querySelector("[data-join-existing]")?.addEventListener("click",()=>this.auth(pool,false));
  app.querySelector("[data-join-new]")?.addEventListener("click",()=>this.auth(pool,true));
  return true;
 },
 auth(pool,isNew){
  modal(isNew?"JOIN "+pool:"SIGN IN TO LINKS",'<div class="join-auth"><div class="join-auth-mark">L</div><span>'+(isNew?"PLAYER SETUP":"WELCOME BACK")+'</span><h3>'+(isNew?"Join "+linksEscape(pool):"Open "+linksEscape(pool))+'</h3><p>'+(isNew?"Use your email to create your LINKS player profile.":"Sign in and LINKS will return you directly to this invitation.")+'</p><label><span>EMAIL</span><input type="email" data-join-email autocomplete="email" placeholder="you@example.com"></label>'+(isNew?'<label><span>DISPLAY NAME</span><input data-join-name maxlength="28" placeholder="Your name"></label>':'<label><span>PASSWORD</span><input type="password" data-join-pass autocomplete="current-password" placeholder="Password"></label>')+'<button data-join-continue>CONTINUE TO POOL ›</button><small>Prototype account screen · live authentication connects here next.</small></div>');
  document.querySelector("[data-join-continue]")?.addEventListener("click",()=>{const email=document.querySelector("[data-join-email]")?.value.trim();if(!email||!email.includes("@")){AppStatus.show("warn","Email needed","Enter a valid email to continue.");return}document.querySelector(".modal")?.remove();const u=new URL(location.href);u.searchParams.delete("invite");u.searchParams.set("view","pool");u.searchParams.set("pool",pool);history.replaceState({route:"pool",pool},"",u);document.documentElement.dataset.publicHome="false";delete document.documentElement.dataset.joinGateway;LinksRouter.apply("pool",pool,true);AppStatus.show("ok","Invitation accepted","Welcome to "+pool+".")});
 }
};
// It must win before the normal public/member boot paints over an invite.
setTimeout(()=>JoinGateway.mount(),1);

// Game Adapter v1 — pool tabs now respect the actual format instead of showing NFL games everywhere.
const GameAdapters={
 college:[
  {id:"col-ten-uga",away:"TEN",home:"UGA",kick:"Sat · 2:30 PM"},
  {id:"col-bama-lsu",away:"ALA",home:"LSU",kick:"Sat · 6:30 PM"},
  {id:"col-ore-psu",away:"ORE",home:"PSU",kick:"Sat · 7:00 PM"}
 ],
 survivor:[
  {id:"survivor-week",away:"BUF",home:"GB",kick:"Sun · 12:00 PM",choices:["BUF","GB","KC","PHI","DET","BAL"]}
 ]
};
function poolSlate(pool){
 const type=gameIdentity(PoolHubData[pool]?.game||"").type;
 if(type==="college"||type==="confidence")return GameAdapters.college;
 if(type==="survivor")return GameAdapters.survivor;
 return DemoSlate;
}
function gameSpecificPickPanel(pool){
 const p=PoolHubData[pool],type=gameIdentity(p?.game||"").type,slate=poolSlate(pool);
 if(type==="survivor"){
  const g=slate[0],saved=PickEngine.get(pool+"-"+g.id)?.team||"";
  return '<div class="hub-panel-head"><span>SURVIVOR · '+linksEscape(p.week)+'</span><h3>One team. Stay alive.</h3><p>Choose one eligible team. Your selection stays private until lock.</p></div><div class="survivor-choice">'+g.choices.map(t=>'<button data-adapter-pick="'+linksEscape(t)+'" data-adapter-game="'+g.id+'" class="'+(saved===t?"selected":"")+'"><i>'+linksEscape(t)+'</i><b>'+linksEscape(t)+'</b><span>'+(saved===t?"YOUR PICK":"SELECT")+'</span></button>').join("")+'</div><div class="adapter-proof"><b>'+(saved?"✓ "+linksEscape(saved)+" SAVED":"SELECTION NEEDED")+'</b><span>'+linksEscape(p.lock)+'</span></div>';
 }
 if(type==="bracket"){
  BracketFieldV85.apply(pool);const b=BracketStoreV76.read(pool),rounds=BracketStoreV76.rounds;return '<div class="hub-panel-head"><span>MARCH MADNESS · '+linksEscape(p.week)+'</span><h3>Build your bracket.</h3><p>Choose a winner from every matchup. Each round advances from the selections before it.</p></div><div class="bracket-live-v76">'+rounds.map((r,ri)=>'<section><header><span>ROUND '+(ri+1)+'</span><b>'+r.name+'</b></header>'+r.games.map((g,gi)=>{const id="r"+ri+"g"+gi,teams=BracketStoreV76.teamsFor(b,ri,gi);return '<div class="bracket-game-v76"><small>GAME '+(gi+1)+'</small>'+teams.map(t=>'<button data-bracket-pick="'+linksEscape(t)+'" data-bracket-id="'+id+'" class="'+(b[id]===t?"selected":"")+'">'+linksEscape(t)+'</button>').join("")+'</div>'}).join("")+'</section>').join("")+'</div>';
 }
 if(type==="squares"){
  const s=SquaresStoreV75.read(pool),claimed=s.claimed||{};return '<div class="hub-panel-head"><span>FOOTBALL SQUARES · '+linksEscape(p.week)+'</span><h3>Claim your squares.</h3><p>Open squares can be claimed until the grid locks. Numbers stay hidden until the commissioner reveals them.</p></div><div class="squares-live-v75"><div class="squares-axis-v75"><span>AWAY</span><b>'+(s.revealed?"NUMBERS REVEALED":"NUMBERS HIDDEN")+'</b><span>HOME</span></div><div class="squares-grid-v75">'+Array.from({length:100},(_,i)=>{const n=i+1,owner=claimed[n]||"";return '<button data-square-v75="'+n+'" class="'+(owner?"claimed":"")+'" '+(owner?"disabled":"")+'><small>'+n+'</small><b>'+(owner?linksEscape(owner):"OPEN")+'</b></button>'}).join("")+'</div><div class="adapter-proof"><b>'+Object.keys(claimed).length+' / 100 CLAIMED</b><span>'+linksEscape(p.lock)+'</span></div></div>';
 }
 if(type==="game33"){
  const teams=[...new Set(DemoSlate.flatMap(g=>[g.away,g.home]))],saved=Game33StoreV74.read(pool);return '<div class="hub-panel-head"><span>GAME 33 · '+linksEscape(p.week)+'</span><h3>Chase 33.</h3><p>Choose one NFL team for the week. Your selection stays saved with the pool until changed before lock.</p></div><div class="g33-live-v74"><div class="g33-target-v74"><span>TARGET</span><b>33</b><small>POINTS</small></div><div class="g33-team-grid-v74">'+teams.map(t=>'<button data-g33-team="'+linksEscape(t)+'" class="'+(saved.team===t?"selected":"")+'"><b>'+linksEscape(t)+'</b><span>'+(saved.team===t?"YOUR PICK":"SELECT")+'</span></button>').join("")+'</div><div class="adapter-proof"><b>'+(saved.team?"✓ "+linksEscape(saved.team)+" SAVED":"SELECTION NEEDED")+'</b><span>'+linksEscape(p.lock)+'</span></div></div>';
 }
 if(type==="confidence"){
  return '<div class="hub-panel-head"><span>CONFIDENCE · '+linksEscape(p.week)+'</span><h3>Pick every game. Rank your confidence.</h3><p>Each confidence number can be used once. Higher number = more points when correct.</p></div><div class="hub-pick-list">'+slate.map((g,i)=>{const key=pool+"-confidence-"+g.id,saved=PickEngine.get(key)||{},team=saved.team||"",rank=saved.rank||"";return '<div class="hub-pick-row" data-confidence-row="'+g.id+'"><div class="hub-game-meta"><b>'+g.away+' <i>VS</i> '+g.home+'</b><span>'+g.kick+'</span></div><div class="hub-choice"><button data-confidence-team="'+g.away+'" data-confidence-game="'+g.id+'" class="'+(team===g.away?"selected":"")+'">'+g.away+'</button><button data-confidence-team="'+g.home+'" data-confidence-game="'+g.id+'" class="'+(team===g.home?"selected":"")+'">'+g.home+'</button><select data-confidence-rank="'+g.id+'"><option value="">RANK</option>'+slate.map((_,n)=>'<option value="'+(n+1)+'" '+(String(rank)===String(n+1)?"selected":"")+' >'+(n+1)+'</option>').join("")+'</select></div><em>'+(team&&rank?"PICK: "+team+" · "+rank+" PTS":"PICK + RANK NEEDED")+'</em></div>'}).join("")+'</div>';
 }
 if(type==="college"){
  return '<div class="hub-panel-head"><span>COLLEGE PICK’EM · '+linksEscape(p.week)+'</span><h3>Saturday card.</h3><p>Only games selected for this pool appear here.</p></div><div class="hub-pick-list">'+slate.map(g=>{const saved=PickEngine.get(pool+"-"+g.id)?.team||"";return '<div class="hub-pick-row" data-adapter-row="'+g.id+'"><div class="hub-game-meta"><b>'+g.away+' <i>VS</i> '+g.home+'</b><span>'+g.kick+'</span></div><div class="hub-choice"><button data-adapter-pick="'+g.away+'" data-adapter-game="'+g.id+'" class="'+(saved===g.away?"selected":"")+'">'+g.away+'</button><button data-adapter-pick="'+g.home+'" data-adapter-game="'+g.id+'" class="'+(saved===g.home?"selected":"")+'">'+g.home+'</button></div><em>'+(saved?"PICK: "+saved:"NEEDS PICK")+'</em></div>'}).join("")+'</div>';
 }
 return "";
}
function mountGameAdapter(){
 if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"";const type=gameIdentity(PoolHubData[pool]?.game||"").type;if(!["college","survivor","confidence","game33","squares","bracket"].includes(type))return;
 const live=document.querySelector(".pool-tab-live");if(!live||live.dataset.adapter==="1")return;
 const active=[...document.querySelectorAll(".poolhub-tabs button,.pool-tabs button")].find(b=>b.classList.contains("active"))?.textContent.trim().toLowerCase();
 if(active!=="picks")return;live.dataset.adapter="1";live.innerHTML=gameSpecificPickPanel(pool);
}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-adapter-pick]");if(!b)return;e.preventDefault();e.stopImmediatePropagation();
 const pool=document.documentElement.dataset.pool||"",id=b.dataset.adapterGame;if(!WeekGate.isOpen()){AppStatus.show("warn","Week is closed","The commissioner has paused pick changes.");return}
 PickEngine.save(pool+"-"+id,b.dataset.adapterPick);const live=b.closest(".pool-tab-live");if(live){live.innerHTML=gameSpecificPickPanel(pool);live.dataset.adapter="1"}
},true);
const adapterObserver=new MutationObserver(()=>mountGameAdapter());adapterObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountGameAdapter);

// Game Experience v11 — continue replacing generic NFL content with format-specific player screens.
const FormatAdapters={
 squares:{title:"Football Squares",kicker:"GAME GRID",copy:"Claim a square and follow the numbers when the game starts."},
 bracket:{title:"Tournament Bracket",kicker:"ROAD TO THE TITLE",copy:"Build your bracket before the tournament locks."},
 racing:{title:"Race Day",kicker:"GREEN FLAG",copy:"Make your driver selections before the field goes green."},
 golf:{title:"Golf Pool",kicker:"TOURNAMENT CARD",copy:"Set your golfers before the opening round locks."},
 game33:{title:"Game 33",kicker:"ONE NUMBER · ONE WINNER",copy:"Make your weekly selection. The pool rolls until somebody hits 33."},
 fantasy:{title:"Fantasy Football",kicker:"GAME DAY",copy:"Set the lineup, work waivers and follow your matchup."},
 dynasty:{title:"Dynasty Football",kicker:"FRONT OFFICE",copy:"Roster, contracts, picks and long-term team building."}
};
function formatPanel(pool,type){
 const p=PoolHubData[pool],d=FormatAdapters[type];if(!d)return "";
 const head='<div class="format-head fh-'+type+'"><div>'+networkGlyph(type)+'</div><span>'+d.kicker+'</span><h3>'+d.title+'</h3><p>'+d.copy+'</p></div>';
 if(type==="squares")return head+'<div class="squares-preview"><div class="sq-axis"><b>HOME</b><span>?</span><span>?</span><span>?</span></div><div class="sq-grid">'+Array.from({length:16},(_,i)=>'<button data-format-choice="Square '+(i+1)+'"><small>'+(i+1)+'</small><b>'+(i===5?"YOU":"OPEN")+'</b></button>').join("")+'</div><div class="format-foot"><span>NUMBERS ASSIGNED AFTER GRID FILLS</span><button>VIEW FULL GRID ›</button></div></div>';
 if(type==="bracket")return head+'<div class="bracket-preview"><div><button data-format-choice="TEN">TEN</button><i></i><button data-format-choice="UK">UK</button></div><b>→</b><div class="br-next"><span>YOUR WINNER</span><strong>SELECT</strong></div></div><div class="format-foot"><span>BRACKET SAVES AS YOU GO</span><button>OPEN FULL BRACKET ›</button></div>';
 if(type==="racing")return head+'<div class="race-preview">'+["5","9","11","22"].map((n,i)=>'<button data-format-choice="CAR '+n+'"><i>'+n+'</i><b>'+(["Larson","Elliott","Hamlin","Logano"][i])+'</b><span>SELECT DRIVER</span></button>').join("")+'</div><div class="format-foot"><span>RACE CARD · '+linksEscape(p?.week||"")+'</span><button>VIEW FIELD ›</button></div>';
 if(type==="golf")return head+'<div class="golf-preview">'+["SCHEFFLER","MCILROY","SCHAUFFELE","MORIKAWA"].map((n,i)=>'<button data-format-choice="'+n+'"><i>'+(i+1)+'</i><b>'+n+'</b><span>SELECT</span></button>').join("")+'</div><div class="format-foot"><span>TOURNAMENT FIELD</span><button>VIEW ALL GOLFERS ›</button></div>';
 if(type==="game33")return head+'<div class="g33-preview"><div><span>CURRENT TARGET</span><b>33</b><small>POINTS</small></div><div><span>YOUR PICK</span><strong>—</strong><small>NOT SELECTED</small></div></div><button class="format-primary" data-format-choice="OPEN GAME 33">MAKE GAME 33 PICK ›</button>';
 if(type==="fantasy"||type==="dynasty")return head+'<div class="fantasy-preview"><div><span>'+((type==="dynasty")?"ROSTER":"STARTERS")+'</span><b>'+((type==="dynasty")?"24":"9")+'</b><small>'+((type==="dynasty")?"PLAYERS":"ACTIVE")+'</small></div><div><span>'+((type==="dynasty")?"CAP ROOM":"PROJECTED")+'</span><b>'+((type==="dynasty")?"$18":"127.4")+'</b><small>'+((type==="dynasty")?"AVAILABLE":"POINTS")+'</small></div><div><span>'+((type==="dynasty")?"DRAFT PICKS":"MATCHUP")+'</span><b>'+((type==="dynasty")?"7":"1–0")+'</b><small>'+((type==="dynasty")?"NEXT 2 YRS":"RECORD")+'</small></div></div><div class="format-foot"><span>'+((type==="dynasty")?"FRONT OFFICE READY":"LINEUP READY")+'</span><button>'+((type==="dynasty")?"OPEN TEAM":"SET LINEUP")+' ›</button></div>';
 return "";
}
function mountFormatAdapter(){
 if(document.documentElement.dataset.view!=="pool")return;
 const pool=document.documentElement.dataset.pool||"",type=gameIdentity(PoolHubData[pool]?.game||"").type;
 if(!FormatAdapters[type])return;
 // v81: real game engines own their Picks screen; legacy preview adapters may never overwrite them.
 if(typeof LinksFormatSupportV65!=="undefined"&&LinksFormatSupportV65.has(type))return;
 const live=document.querySelector(".pool-tab-live");if(!live||live.dataset.formatAdapter==="1")return;
 const active=[...document.querySelectorAll(".poolhub-tabs button,.pool-tabs button")].find(b=>b.classList.contains("active"))?.textContent.trim().toLowerCase();
 if(active!=="picks")return;
 live.dataset.formatAdapter="1";live.innerHTML=formatPanel(pool,type);
}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-format-choice]");if(!b)return;
 e.preventDefault();const live=b.closest(".pool-tab-live");
 live?.querySelectorAll("[data-format-choice]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");
 AppStatus.show("ok","Selection saved",b.dataset.formatChoice);
},true);
// v81: removed legacy format MutationObserver; route/tab lifecycle mounts previews only when needed.
queueMicrotask(mountFormatAdapter);

// Pool Hub visual state follows each format.
function formatHubPolish(){
 if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",p=PoolHubData[pool];if(!p)return;
 const type=gameIdentity(p.game).type,hub=document.querySelector(".pool-hub");if(!hub)return;hub.dataset.gameType=type;
 const hero=hub.querySelector(".poolhub-hero");if(hero)hero.setAttribute("data-game-type",type);
}
const formatPolishObserver=new MutationObserver(()=>formatHubPolish());formatPolishObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(formatHubPolish);

// Commissioner Flow v12 — turn the admin page into a clear operating sequence.
const CommFlow=[
 {id:"players",n:"01",title:"PLAYERS",sub:"Invites, access and readiness",sel:".entrant-manager,.readiness-strip"},
 {id:"week",n:"02",title:"WEEK CONTROL",sub:"Open, close and game locks",sel:".week-control-v2,.week-control"},
 {id:"rules",n:"03",title:"POOL RULES",sub:"Scoring, deadlines and tiebreakers",sel:".setup-studio,.pool-rules"},
 {id:"auto",n:"04",title:"AUTOPILOT",sub:"Reminders and commissioner checks",sel:".autopilot-v1"}
];
function commissionerFlow(){
 const r=readinessTruth();
 return '<section class="commissioner-flow-v12"><div class="cf-head"><div><span>RUN THE POOL</span><h2>Commissioner workflow</h2><p>Everything needed for the week, in the order you use it.</p></div><div class="cf-health '+(r.missing.length?"attention":"ready")+'"><i></i><b>'+(r.missing.length?r.missing.length+" NEED PICKS":"POOL READY")+'</b></div></div><div class="cf-steps">'+CommFlow.map(x=>'<button data-cf-jump="'+x.id+'"><i>'+x.n+'</i><div><b>'+x.title+'</b><span>'+x.sub+'</span></div><em>›</em></button>').join("")+'</div></section>';
}
function mountCommissionerFlow(){
 if(document.documentElement.dataset.view!=="commissioner")return;const w=document.querySelector(".route-workspace");if(!w||w.querySelector(".commissioner-flow-v12"))return;
 const id=w.querySelector(".route-identity");if(id)id.insertAdjacentHTML("afterend",commissionerFlow());else w.insertAdjacentHTML("afterbegin",commissionerFlow());
 w.querySelectorAll("[data-cf-jump]").forEach(b=>b.onclick=()=>{
   const item=CommFlow.find(x=>x.id===b.dataset.cfJump),target=item&&document.querySelector(item.sel);
   if(target)target.scrollIntoView({behavior:"smooth",block:"start"});
   else if(item?.id==="rules")openSetupStudio();
 });
}
const cfObserver=new MutationObserver(()=>mountCommissionerFlow());cfObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountCommissionerFlow);

// Pool setup summary belongs in Pool Hub so commissioners do not have to hunt for the rules.
function poolSetupSummary(pool){
 const s=SetupState.read(),p=PoolHubData[pool];if(!p)return "";
 return '<section class="pool-setup-summary"><div><span>POOL SETUP</span><b>HOW THIS POOL PLAYS</b></div><div class="pss-items"><span><small>STYLE</small><b>'+linksEscape((s.style||s.scoring||"STRAIGHT UP").replaceAll("-"," "))+'</b></span><span><small>DEADLINE</small><b>'+linksEscape((s.deadline||"PER-GAME KICKOFF").replaceAll("-"," "))+'</b></span><span><small>WEEK</small><b>'+linksEscape(p.week)+'</b></span></div><button data-edit-pool-rules>EDIT RULES ›</button></section>';
}
function mountPoolSetupSummary(){
 if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",hub=document.querySelector(".pool-hub");if(!pool||!hub||hub.querySelector(".pool-setup-summary"))return;
 const dock=hub.querySelector(".pool-action-dock");if(!dock)return;dock.insertAdjacentHTML("afterend",poolSetupSummary(pool));
 hub.querySelector("[data-edit-pool-rules]")?.addEventListener("click",()=>openSetupStudio());
}
const pssObserver=new MutationObserver(()=>mountPoolSetupSummary());pssObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountPoolSetupSummary);

// Pool Hub overview: one compact status ribbon replaces scattered repeated facts.
function poolStatusRibbon(pool){
 const p=PoolHubData[pool];if(!p)return "";
 const pct=p.members?Math.round((p.ready/p.members)*100):100;
 return '<section class="pool-status-ribbon"><span><small>FIELD</small><b>'+p.ready+'/'+p.members+' READY</b></span><span><small>READINESS</small><b>'+pct+'%</b></span><span><small>YOUR RANK</small><b>'+linksEscape(p.rank)+'</b></span><span><small>RECORD</small><b>'+linksEscape(p.record)+'</b></span><span><small>NEXT LOCK</small><b>'+linksEscape(p.lock)+'</b></span></section>';
}
function mountPoolStatusRibbon(){
 if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",hub=document.querySelector(".pool-hub");if(!pool||!hub||hub.querySelector(".pool-status-ribbon"))return;
 const identity=hub.querySelector(".pool-identity");if(identity)identity.insertAdjacentHTML("afterend",poolStatusRibbon(pool));
}
const psrObserver=new MutationObserver(()=>mountPoolStatusRibbon());psrObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountPoolStatusRibbon);

// Accessible keyboard/focus polish for all modern interactive surfaces.
function accessibilityPass(){
 document.querySelectorAll('button:not([type])').forEach(b=>b.type="button");
 document.querySelectorAll("[data-network-game],[data-open-pool],[data-pickpool]").forEach(x=>{if(!x.getAttribute("aria-label"))x.setAttribute("aria-label",(x.dataset.networkGame?"Start "+x.dataset.networkGame+" pool":x.dataset.openPool||x.dataset.pickpool||"Open pool"))});
}
const a11yObserver=new MutationObserver(()=>accessibilityPass());a11yObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(accessibilityPass);

// Results + Pick Review v13 — finish the game-day loop from selection to final result.
function pickReviewPanel(){
 const s=currentPickSummary();
 return '<section class="pick-review-v13"><div class="prv-head"><div><span>YOUR CARD</span><h2>'+(s.due?"Finish your picks.":"Card ready.")+'</h2><p>'+(s.due?"Review every selection before the next lock.":"Everything on this card has a saved selection.")+'</p></div><div class="prv-ring" style="--pct:'+s.pct+'"><b>'+s.pct+'%</b><small>COMPLETE</small></div></div><div class="prv-games">'+DemoSlate.map(g=>{const pick=PickEngine.get(g.id)?.team||"";return '<div class="prv-game '+(pick?"saved":"missing")+'"><div><span>'+g.kick+'</span><b>'+g.away+' <i>VS</i> '+g.home+'</b></div><div><small>YOUR PICK</small><strong>'+(pick?linksEscape(pick):"NEEDED")+'</strong></div><button data-prv-game="'+g.id+'">'+(pick?"CHANGE":"PICK")+' ›</button></div>'}).join("")+'</div><div class="prv-safe"><i>✓</i><div><b>PICK SAFE</b><span>Saved selections stay on this device in New Build testing.</span></div><button data-prv-review>OPEN POOL ›</button></div></section>';
}
function mountPickReview(){
 if(document.documentElement.dataset.view!=="my-picks")return;const w=document.querySelector(".route-workspace");if(!w||w.querySelector(".pick-review-v13"))return;
 const hero=w.querySelector(".mypicks-hero")||w.querySelector(".route-identity");hero?.insertAdjacentHTML("afterend",pickReviewPanel());
 w.querySelectorAll("[data-prv-game],[data-prv-review]").forEach(b=>b.onclick=()=>LinksRouter.navigate("pool","My Pool"));
}
function refreshPickReview(){
 const old=document.querySelector(".pick-review-v13");if(!old)return;const wrap=document.createElement("div");wrap.innerHTML=pickReviewPanel();old.replaceWith(wrap.firstElementChild);mountPickReview();
}
window.addEventListener("links:picksaved",()=>setTimeout(refreshPickReview,30));
const prvObserver=new MutationObserver(()=>mountPickReview());prvObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountPickReview);

function finalResultsBoard(){
 const ranked=rankedDemoPlayers(),me=ranked.findIndex(x=>x.p.name==="Jake"),leader=ranked[0];
 return '<section class="results-board-v13"><div class="rbv-hero"><div><span>WEEK 3 · RESULTS</span><h2>Scoreboard</h2><p>One clean view of the week, your position and the current leader.</p></div><div class="rbv-leader"><small>LEADER</small><b>'+linksEscape(leader?.p.name||"—")+'</b><span>'+(leader?.s.wins||0)+' WINS</span></div></div><div class="rbv-table"><div class="rbv-row head"><span>RANK</span><span>PLAYER</span><span>CORRECT</span><span>STATUS</span></div>'+ranked.map((x,i)=>'<div class="rbv-row '+(x.p.name==="Jake"?"me":"")+'"><strong>'+(i+1)+'</strong><b>'+linksEscape(x.p.name)+'</b><span>'+x.s.wins+'</span><em>'+(x.p.name==="Jake"?"YOU":i===0?"LEADER":"—")+'</em></div>').join("")+'</div><div class="rbv-you"><div><span>YOUR POSITION</span><b>#'+(me+1)+'</b></div><div><span>YOUR SCORE</span><b>'+(me>=0?ranked[me].s.wins:0)+'</b></div><div><span>GAMES FINAL</span><b>'+ScoreDemo.games.filter(g=>g.status==="final").length+'/'+ScoreDemo.games.length+'</b></div><button data-rbv-picks>REVIEW PICKS ›</button></div></section>';
}
function mountResultsBoard(){
 if(document.documentElement.dataset.view!=="results")return;const w=document.querySelector(".route-workspace");if(!w||w.querySelector(".results-board-v13"))return;
 const identity=w.querySelector(".route-identity");identity?.insertAdjacentHTML("afterend",finalResultsBoard());
 w.querySelector("[data-rbv-picks]")?.addEventListener("click",()=>LinksRouter.navigate("my-picks"));
 // Hide older contradictory demo leader/standings blocks; v13 is the source of truth.
 w.querySelectorAll(".results-v2 .results-standings,.results-v2 .weekly-leader,.results-v2 .results-truth-strip").forEach(x=>x.classList.add("legacy-results-hidden"));
}
const rbvObserver=new MutationObserver(()=>mountResultsBoard());rbvObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountResultsBoard);

// Small route loading veil gives phone navigation an intentional app feel.
function routeLoadingPulse(){
 let x=document.querySelector(".route-pulse-v13");if(!x){document.body.insertAdjacentHTML("beforeend",'<div class="route-pulse-v13"><i></i></div>');x=document.querySelector(".route-pulse-v13")}
 x.classList.add("show");setTimeout(()=>x.classList.remove("show"),180);
}
document.addEventListener("click",e=>{if(e.target.closest("[data-home-go],[data-home-go2],[data-open-pool],[data-pickpool],.mobile-dock button,[data-ri-home],[data-ri-pools]"))routeLoadingPulse()},true);

// Stability v14 — centralized enhancement coordinator for the newest surfaces.
const LinksEnhance={
 queued:false,
 run(){this.queued=false;try{
  accessibilityPass();if(document.documentElement.dataset.publicHome==="true")return;
  const v=document.documentElement.dataset.view||"home";
  if(v==="home"){tightenHomeTruth();dedupeModernHome();fixNetworkCTAs()}
  if(v==="my-picks"){patchMyPicksTruth();mountPickReview()}
  if(v==="my-pools")patchMyPoolsTruth();
  if(v==="results")mountResultsBoard();
  if(v==="commissioner"){patchCommissionerTruth();mountCommissionerFlow()}
  if(v==="pool"){mountPoolIdentity();mountPoolStatusRibbon();mountHubQuick();mountPoolSetupSummary();formatHubPolish();correctPoolLanguage();mountGameAdapter();mountFormatAdapter();patchStandingsTruth()}
 }catch(err){console.warn("LINKS enhance",err)}},
 queue(){if(this.queued)return;this.queued=true;requestAnimationFrame(()=>this.run())}
};
document.addEventListener("click",()=>LinksEnhance.queue(),true);window.addEventListener("popstate",()=>LinksEnhance.queue());window.addEventListener("links:picksaved",()=>LinksEnhance.queue());queueMicrotask(()=>LinksEnhance.queue());

function syncMobileChrome(){
 const unread=typeof InboxStore!=="undefined"?InboxStore.read().filter(x=>!x.read).length:0;
 document.querySelectorAll("[data-unread-count],.mobile-unread,.more-unread").forEach(x=>{x.textContent=unread;x.hidden=unread===0});
}
document.addEventListener("click",()=>setTimeout(syncMobileChrome,20),true);queueMicrotask(syncMobileChrome);

document.addEventListener("click",e=>{
 const b=e.target.closest(".public-home [data-public-start],.public-home [data-public-game]");if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();const game=b.dataset.publicGame||"";
 modal("START A POOL",'<div class="public-account-gate"><div class="pag-mark">L</div><span>COMMISSIONER ACCOUNT</span><h3>Start your free pool.</h3><p>Create or sign in to your LINKS account first. Your pool setup will be waiting next.</p><label><span>EMAIL</span><input type="email" data-pag-email autocomplete="email" placeholder="you@example.com"></label><button data-pag-continue>CONTINUE ›</button><small>One commissioner pool free for life.</small></div>');
 document.querySelector("[data-pag-continue]")?.addEventListener("click",()=>{const email=document.querySelector("[data-pag-email]")?.value.trim();if(!email||!email.includes("@")){AppStatus.show("warn","Email needed","Enter a valid email to continue.");return}document.querySelector(".modal")?.remove();const u=new URL(location.href);u.searchParams.delete("welcome");u.searchParams.delete("guest");u.searchParams.set("view","home");history.replaceState({route:"home"},"",u);document.documentElement.dataset.publicHome="false";LinksRouter.apply("home","",true);setTimeout(()=>CreatePoolStudio.open(game||null),100)});
},true);

function validatePoolRoute(){
 const u=new URL(location.href);if(u.searchParams.get("view")!=="pool")return;const pool=u.searchParams.get("pool")||"";
 if(pool&&PoolHubData[pool])return;u.searchParams.set("view","my-pools");u.searchParams.delete("pool");history.replaceState({route:"my-pools"},"",u);
 AppStatus.show("warn","Pool unavailable","That pool is not available on this device. Showing your pools instead.");LinksRouter.apply("my-pools","",true);
}
setTimeout(validatePoolRoute,30);

// Finish Pass v15 — consistent hierarchy, context, and empty-state placement across the app.
function contextBar(){
 const v=document.documentElement.dataset.view||"home",pool=document.documentElement.dataset.pool||"";
 if(v==="home"||document.documentElement.dataset.publicHome==="true")return "";
 const map={"my-pools":["MY LINKS","Pools"],"my-picks":["GAME DAY","Picks"],results:["LINKS LIVE","Results"],messages:["POOL ROOM","Messages"],notifications:["SMART INBOX","Inbox"],commissioner:["COMMISSIONER","Command Center"],pool:["POOL HUB",pool||"Pool"]};
 const x=map[v];if(!x)return "";
 return '<div class="links-context-v15"><button data-context-home aria-label="Home"><i>L</i></button><span>'+x[0]+'</span><b>'+linksEscape(x[1])+'</b>'+(v==="pool"?'<em>'+linksEscape(PoolHubData[pool]?.game||"")+'</em>':'')+'</div>';
}
function mountContextBar(){
 const v=document.documentElement.dataset.view||"home",w=document.querySelector(".route-workspace");if(!w||v==="home"||document.documentElement.dataset.publicHome==="true"||w.querySelector(".links-context-v15"))return;
 w.insertAdjacentHTML("afterbegin",contextBar());w.querySelector("[data-context-home]")?.addEventListener("click",()=>LinksRouter.navigate("home"));
}
function polishHierarchy(){
 const v=document.documentElement.dataset.view||"home";
 document.body.dataset.linksView=v;
 mountContextBar();
 // Only one route identity/header owns the top of a workspace.
 const w=document.querySelector(".route-workspace");if(w){
   const ids=w.querySelectorAll(".route-identity");ids.forEach((x,i)=>{if(i)x.remove()});
   const ctx=w.querySelector(".links-context-v15"),id=w.querySelector(".route-identity");if(ctx&&id&&ctx.nextElementSibling!==id)ctx.after(id);
 }
 // Pool hub order: context > hero > identity > status > quick actions > setup > live tab.
 if(v==="pool"){
   const hub=document.querySelector(".pool-hub");if(hub){
    const hero=hub.querySelector(".poolhub-hero"),identity=hub.querySelector(".pool-identity"),status=hub.querySelector(".pool-status-ribbon"),quick=hub.querySelector(".hub-quick"),setup=hub.querySelector(".pool-setup-summary"),tabs=hub.querySelector(".poolhub-tabs");
    let anchor=hero;
    [identity,status,quick,setup,tabs].forEach(el=>{if(el&&anchor&&anchor.nextElementSibling!==el){anchor.after(el)}if(el)anchor=el});
   }
 }
}
function removePrototypeNoise(){
 // Hide old route hero when a modern identity and modern feature surface are present.
 const w=document.querySelector(".route-workspace");if(!w)return;
 if(w.querySelector(".route-identity"))w.querySelectorAll(":scope > .route-hero").forEach(x=>x.classList.add("v15-superseded"));
 // Repeated legacy route grids remain useful only when there is no modern primary surface.
 const v=document.documentElement.dataset.view;
 const modern={ "my-pools":".mypools-v3","my-picks":".mypicks-v3","results":".results-board-v13","commissioner":".commissioner-flow-v12"}[v];
 if(modern&&w.querySelector(modern))w.querySelectorAll(":scope > .route-grid").forEach(x=>x.classList.add("v15-superseded"));
}
const FinishPass={run(){polishHierarchy();removePrototypeNoise();},queue(){requestAnimationFrame(()=>this.run())}};
document.addEventListener("click",()=>FinishPass.queue(),true);window.addEventListener("popstate",()=>FinishPass.queue());queueMicrotask(()=>FinishPass.queue());

// Home bottom finish: a restrained closing action instead of leftover prototype sections.
function homeFinishV15(){
 return '<section class="home-finish-v15"><div class="hfv-mark">L</div><div><span>LINKS POOLS</span><b>GAME DAY, ORGANIZED.</b><small>One account · Every pool · Every pick</small></div><button data-hfv-games>EXPLORE GAMES ›</button></section>';
}
function mountHomeFinish(){
 if(document.documentElement.dataset.view!=="home"||document.documentElement.dataset.publicHome==="true")return;
 const main=document.querySelector(".main");if(!main||main.querySelector(".home-finish-v15"))return;
 const network=main.querySelector(".game-network-v2");if(network)network.insertAdjacentHTML("afterend",homeFinishV15());else main.insertAdjacentHTML("beforeend",homeFinishV15());
 main.querySelector("[data-hfv-games]")?.addEventListener("click",()=>document.querySelector(".game-network-v2")?.scrollIntoView({behavior:"smooth",block:"start"}));
}
const finishObserver=new MutationObserver(()=>mountHomeFinish());finishObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountHomeFinish);

// More sheet becomes the clean home for secondary navigation on phones.
function refineMobileMore(){
 const sheet=document.querySelector(".mobile-more-sheet");if(!sheet||sheet.dataset.refined==="1")return;sheet.dataset.refined="1";
 if(!sheet.querySelector(".mobile-more-head"))sheet.insertAdjacentHTML("afterbegin",'<div class="mobile-more-head"><div><span>LINKS</span><b>MORE</b></div><small>ACCOUNT & TOOLS</small></div>');
}
const moreObserver=new MutationObserver(()=>refineMobileMore());moreObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(refineMobileMore);

// Premium Details v16 — restrained game-day atmosphere and clearer active states.
function liveAtmosphere(){
 if(document.documentElement.dataset.publicHome==="true")return;
 const v=document.documentElement.dataset.view||"home";if(!["home","pool","results"].includes(v))return;
 if(document.querySelector(".links-atmosphere-v16"))return;
 document.body.insertAdjacentHTML("afterbegin",'<div class="links-atmosphere-v16" aria-hidden="true"><i></i><i></i><i></i><b></b></div>');
}
function activeTabPolish(){
 document.querySelectorAll(".poolhub-tabs,.pool-tabs").forEach(nav=>{
   const active=nav.querySelector("button.active");nav.querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected",b===active?"true":"false"));
   if(active)nav.style.setProperty("--tab-x",active.offsetLeft+"px");
 });
 document.querySelectorAll(".mobile-dock button").forEach(b=>b.setAttribute("aria-current",b.classList.contains("active")?"page":"false"));
}
function poolHeroDetails(){
 if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",p=PoolHubData[pool],hero=document.querySelector(".poolhub-hero");if(!p||!hero||hero.querySelector(".hero-live-detail"))return;
 const type=gameIdentity(p.game).type;
 hero.insertAdjacentHTML("beforeend",'<div class="hero-live-detail"><span><i></i>'+(/fantasy|dynasty/.test(type)?"TEAM ACTIVE":"POOL ACTIVE")+'</span><b>'+linksEscape(p.week)+'</b></div>');
}
function resultMomentum(){
 const board=document.querySelector(".results-board-v13");if(!board||board.querySelector(".result-momentum-v16"))return;
 const ranked=rankedDemoPlayers(),me=ranked.find(x=>x.p.name==="Jake"),lead=ranked[0],gap=Math.max(0,(lead?.s.wins||0)-(me?.s.wins||0));
 board.querySelector(".rbv-hero")?.insertAdjacentHTML("afterend",'<div class="result-momentum-v16"><div><span>LIVE PICTURE</span><b>'+(gap===0?"TIED FOR THE LEAD":gap+" BACK")+'</b></div><div class="momentum-track"><i style="width:'+Math.max(12,100-gap*18)+'%"></i></div><em>'+(gap===0?"Right in it.":"Every final matters.")+'</em></div>');
}
function premiumDetails(){liveAtmosphere();activeTabPolish();poolHeroDetails();resultMomentum()}
document.addEventListener("click",()=>requestAnimationFrame(premiumDetails),true);window.addEventListener("popstate",()=>requestAnimationFrame(premiumDetails));queueMicrotask(premiumDetails);

// Tap cards behave like cards: focus/pressed state is consistent without adding visual clutter.
document.addEventListener("pointerdown",e=>{const card=e.target.closest(".home-pool-card,.portfolio-card,.pick-command-card,.public-game-grid button,.cf-steps button,.hub-quick button");if(card)card.classList.add("card-pressed")},true);
document.addEventListener("pointerup",e=>e.target.closest?.(".card-pressed")?.classList.remove("card-pressed"),true);
document.addEventListener("pointercancel",e=>e.target.closest?.(".card-pressed")?.classList.remove("card-pressed"),true);

// Correctness v17 — source-level guardrails for saves, readiness, reminders, and generated text.
function safeDynamicText(){
 document.querySelectorAll(".room-v2 [data-message-text],.invite-history b").forEach(x=>{if(x.dataset.safeText==="1")return;x.dataset.safeText="1";x.textContent=x.textContent});
}
function commissionerTruthV17(){
 const r=entrantReadiness();
 document.querySelectorAll("[data-ready-remind]").forEach(b=>{b.textContent=r.missing.length?"REMIND "+r.missing.length:"ALL READY";b.disabled=!r.missing.length});
 document.querySelectorAll(".readiness-strip small").forEach(x=>x.textContent=r.missing.length?r.missing.join(", ")+" still need picks.":"Everyone is ready.");
}
const CorrectnessV17={run(){commissionerTruthV17();syncDockInbox();safeDynamicText()},queue(){requestAnimationFrame(()=>this.run())}};
document.addEventListener("click",()=>CorrectnessV17.queue(),true);window.addEventListener("links:picksaved",()=>CorrectnessV17.queue());queueMicrotask(()=>CorrectnessV17.queue());

// Reliability v18 — a single diagnostics layer catches broken UI state before players do.
const LinksHealth={
 checks(){
  const v=document.documentElement.dataset.view||"home",issues=[];
  if(!document.querySelector("#app"))issues.push("APP ROOT");
  if(v==="pool"&&!document.documentElement.dataset.pool)issues.push("POOL CONTEXT");
  if(v==="pool"&&!document.querySelector(".pool-hub"))issues.push("POOL HUB");
  if(v==="my-picks"&&!document.querySelector(".mypicks-v3"))issues.push("PICKS VIEW");
  if(v==="results"&&!document.querySelector(".results-board-v13"))issues.push("RESULTS VIEW");
  if(v==="commissioner"&&!document.querySelector(".commissioner-flow-v12"))issues.push("COMMISSIONER VIEW");
  return issues;
 },
 heal(){
  const v=document.documentElement.dataset.view||"home",issues=this.checks();if(!issues.length)return true;
  if(v==="pool"){const p=document.documentElement.dataset.pool||new URL(location.href).searchParams.get("pool");if(p&&PoolHubData[p])openPoolHubStable(p)}
  else if(v!=="home")renderRouteWorkspace();
  setTimeout(()=>LinksEnhance?.run?.(),0);return this.checks().length===0;
 }
};
window.addEventListener("error",()=>setTimeout(()=>LinksHealth.heal(),20));window.addEventListener("unhandledrejection",()=>setTimeout(()=>LinksHealth.heal(),20));

// Save state indicator: visible reassurance without repeated toast spam.
function saveStateBar(){
 if(document.querySelector(".save-state-v18"))return;
 document.body.insertAdjacentHTML("beforeend",'<div class="save-state-v18" aria-live="polite"><i></i><span>ALL CHANGES SAVED</span></div>');
}
function flashSaveState(label="ALL CHANGES SAVED"){
 saveStateBar();const b=document.querySelector(".save-state-v18");if(!b)return;b.querySelector("span").textContent=label;b.classList.add("show");clearTimeout(flashSaveState.t);flashSaveState.t=setTimeout(()=>b.classList.remove("show"),1500);
}
window.addEventListener("links:picksaved",()=>flashSaveState("PICK SAVED"));
document.addEventListener("click",e=>{if(e.target.closest("[data-format-choice],[data-adapter-pick]"))setTimeout(()=>flashSaveState("SELECTION SAVED"),60)},true);

// Navigation sanity: always leave transient sheets/modals behind when changing primary routes.
function clearTransientUI(){document.querySelectorAll(".mobile-more-sheet.open,.mobile-more-sheet.show").forEach(x=>x.classList.remove("open","show"));document.body.classList.remove("more-open")}
document.addEventListener("click",e=>{if(e.target.closest("[data-home-go],[data-home-go2],[data-open-pool],[data-pickpool],[data-ri-home],[data-ri-pools],.mobile-dock button"))clearTransientUI()},true);

// Compact status footer gives the prototype a finished-app edge and a clear build identity.
function appBuildStamp(){
 if(document.documentElement.dataset.publicHome==="true"||document.querySelector(".app-build-v18"))return;
 const main=document.querySelector(".main");if(!main)return;
 main.insertAdjacentHTML("beforeend",'<footer class="app-build-v18"><div><b>LINKS</b><span>POOLS</span></div><small>NEW BUILD · v18</small><em>GAME DAY READY</em></footer>');
}
const v18Observer=new MutationObserver(()=>appBuildStamp());v18Observer.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(appBuildStamp);

// Mobile scroll memory: returning to a primary page feels native instead of randomly jumping.
const ScrollMemory={key:"links-scroll-v18",read(){try{return JSON.parse(sessionStorage.getItem(this.key)||"{}")}catch{return{}}},save(){const a=this.read(),v=document.documentElement.dataset.view||"home";a[v]=scrollY;sessionStorage.setItem(this.key,JSON.stringify(a))},restore(v){const y=this.read()[v];requestAnimationFrame(()=>scrollTo({top:Number.isFinite(y)?y:0,behavior:"instant"}))}};
document.addEventListener("click",e=>{if(e.target.closest("[data-home-go],[data-home-go2],[data-open-pool],[data-pickpool],[data-ri-home],[data-ri-pools],.mobile-dock button"))ScrollMemory.save()},true);
window.addEventListener("popstate",()=>setTimeout(()=>ScrollMemory.restore(document.documentElement.dataset.view||"home"),30));

// LINKS AI Studio v19 — research-first card builder with transparent math and no fake certainty.
const AIStudio={
 key:"links-ai-card-v19",
 legs:[
  {id:"buf-ml",game:"BUF @ MIA",pick:"BUF · MONEYLINE",price:"-145",prob:59,trend:"4–1 last 5",why:"More stable recent win profile in the preview research set.",corr:"BASE"},
  {id:"dal-nyg-o",game:"DAL @ NYG",pick:"OVER 45.5",price:"-110",prob:53,trend:"3 of last 5 over",why:"preview total profile is slightly above this number.",corr:"LOW"},
  {id:"phi-td",game:"PHI @ TB",pick:"PHI · TEAM TD 1+",price:"-180",prob:64,trend:"Scored TD in 5/5",why:"High-frequency preview event; price is correspondingly expensive.",corr:"LOW"},
  {id:"kc-ml",game:"KC @ BAL",pick:"KC · MONEYLINE",price:"+105",prob:51,trend:"3–2 last 5",why:"Near-coin-flip preview matchup with plus-price exposure.",corr:"BASE"}
 ],
 load(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch{return[]}},
 save(ids){localStorage.setItem(this.key,JSON.stringify(ids))},
 implied(price){const n=Number(price);return n<0?Math.round((-n/(-n+100))*100):Math.round((100/(n+100))*100)},
 decimal(price){const n=Number(price);return n<0?1+100/(-n):1+n/100},
 combined(ids){const rows=this.legs.filter(x=>ids.includes(x.id));const dec=rows.reduce((a,x)=>a*this.decimal(x.price),1);return {dec,american:dec>=2?Math.round((dec-1)*100):Math.round(-100/(dec-1)),model:Math.round(rows.reduce((a,x)=>a*(x.prob/100),1)*1000)/10}},
 html(){
  const saved=this.load(),ids=saved.length?saved:[this.legs[0].id,this.legs[1].id],calc=this.combined(ids);
  return '<section class="ai-studio-v19"><div class="ais-hero"><div class="ais-orbit"><i></i><i></i><b>AI</b></div><div><span>LINKS INTELLIGENCE</span><h2>Research. Build. Understand.</h2><p>Use evidence to assemble a card, then see the price, implied probability and correlation before you decide anything.</p></div><div class="ais-mode"><small>MODE</small><b>RESEARCH</b><em>NO GUARANTEES</em></div></div><div class="ais-layout"><div class="ais-research"><div class="ais-title"><span>RESEARCH BOARD</span><b>Preview research candidates</b><small>Illustrative data until live sportsbook/data feeds are connected.</small></div>'+this.legs.map(x=>'<button class="ais-leg '+(ids.includes(x.id)?"selected":"")+'" data-ai-leg="'+x.id+'"><div><span>'+x.game+'</span><b>'+x.pick+'</b><small>'+x.trend+'</small></div><div class="ais-evidence"><span>MODEL</span><b>'+x.prob+'%</b><small>IMPLIED '+this.implied(x.price)+'%</small></div><strong>'+x.price+'</strong><i>'+(ids.includes(x.id)?"✓":"+")+'</i></button>').join("")+'</div><div class="ais-card"><div class="ais-title"><span>CARD BUILDER</span><b>'+ids.length+'-LEG RESEARCH CARD</b><small>Tap candidates to add or remove.</small></div><div class="ais-card-legs">'+ids.map(id=>{const x=this.legs.find(y=>y.id===id);return x?'<div><span>'+x.game+'</span><b>'+x.pick+'</b><em>'+x.price+'</em><small>'+x.why+'</small></div>':""}).join("")+'</div><div class="ais-math"><div><span>COMBINED PRICE</span><b>'+(calc.american>0?"+":"")+calc.american+'</b></div><div><span>NAIVE MODEL*</span><b>'+calc.model+'%</b></div><div><span>LEGS</span><b>'+ids.length+'</b></div></div><div class="ais-warning"><i>i</i><p><b>Correlation matters.</b><span>*The simple model multiplies leg probabilities and does not adjust for correlation. It is a research aid, not a prediction.</span></p></div><button class="ais-primary" data-ai-review '+(!ids.length?"disabled":"")+'>REVIEW CARD ›</button></div></div><div class="ais-foot"><span>RECENT FORM</span><span>SEASON SAMPLE</span><span>PRICE / IMPLIED %</span><span>CORRELATION CHECK</span><span>TRACK RESULTS</span></div></section>';
 },
 open(){modal("LINKS AI",'<div id="aiStudioMount"></div>');const h=document.querySelector("#aiStudioMount");h.innerHTML=this.html();this.wire(h)},
 wire(h){
  h.querySelectorAll("[data-ai-leg]").forEach(b=>b.onclick=()=>{let ids=this.load();if(!ids.length)ids=[this.legs[0].id,this.legs[1].id];const id=b.dataset.aiLeg;ids=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id].slice(0,6);this.save(ids);h.innerHTML=this.html();this.wire(h)});
  h.querySelector("[data-ai-review]")?.addEventListener("click",()=>{const ids=this.load(),calc=this.combined(ids);modal("REVIEW RESEARCH CARD",'<div class="ai-review-v19"><span>LINKS AI · CARD REVIEW</span><h3>'+ids.length+' selections</h3><p>This card is built from the preview research board. Check current lines, injuries and availability with your provider before making any decision.</p><div><b>COMBINED PRICE</b><strong>'+(calc.american>0?"+":"")+calc.american+'</strong></div><small>LINKS does not promise winners. The purpose of this screen is to make the reasoning and uncertainty visible.</small></div>')});
 }
};
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-ai],[data-ai-studio],[data-ai-card],[data-parlay]");if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();AIStudio.open();
},true);

// Give AI a permanent, intentional home on member Home instead of scattered prototype cards.
function aiHomeV19(){
 return '<section class="ai-home-v19"><div class="aih-copy"><span>LINKS AI</span><h2>Build smarter cards.</h2><p>Research matchups, compare price to probability, inspect trends and assemble a multi-leg card with the assumptions shown.</p><div><button data-ai-studio>OPEN AI RESEARCH ›</button><button class="ghost" data-ai-studio>CREATE A CARD</button></div></div><div class="aih-graphic"><div class="aih-node n1">FORM</div><div class="aih-node n2">PRICE</div><div class="aih-node n3">MATCHUP</div><div class="aih-core">AI<small>RESEARCH</small></div><i></i><i></i><i></i></div></section>';
}
function mountAIHome(){
 if(document.documentElement.dataset.view!=="home"||document.documentElement.dataset.publicHome==="true")return;const main=document.querySelector(".main");if(!main||main.querySelector(".ai-home-v19"))return;
 const bridge=main.querySelector(".home-bridge-v7")||main.querySelector(".home-live-strip");if(bridge)bridge.insertAdjacentHTML("afterend",aiHomeV19());else main.insertAdjacentHTML("beforeend",aiHomeV19());
}
const aiHomeObserver=new MutationObserver(()=>mountAIHome());aiHomeObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountAIHome);

// Product Finish v20 — one consistent command rail and clear empty/error states.
const PrimaryNav=[
 {view:"home",label:"HOME",icon:"⌂"},
 {view:"my-pools",label:"POOLS",icon:"P"},
 {view:"my-picks",label:"PICKS",icon:"✓"},
 {view:"results",label:"RESULTS",icon:"▥"}
];
function desktopCommandRail(){
 if(document.documentElement.dataset.publicHome==="true"||innerWidth<900)return;
 if(document.querySelector(".desktop-rail-v20"))return;
 document.body.insertAdjacentHTML("afterbegin",'<aside class="desktop-rail-v20"><button class="drv-brand" data-drv="home"><b>L</b><span>LINKS</span></button><nav>'+PrimaryNav.map(x=>'<button data-drv="'+x.view+'"><i>'+x.icon+'</i><span>'+x.label+'</span></button>').join("")+'</nav><div class="drv-bottom"><button data-drv="notifications"><i>•</i><span>INBOX</span></button><button data-drv="commissioner"><i>C</i><span>ADMIN</span></button></div></aside>');
 document.querySelectorAll("[data-drv]").forEach(b=>b.addEventListener("click",()=>LinksRouter.navigate(b.dataset.drv)));
 syncDesktopRail();
}
function syncDesktopRail(){
 const v=document.documentElement.dataset.view||"home";document.querySelectorAll("[data-drv]").forEach(b=>b.classList.toggle("active",b.dataset.drv===v));
}
function workspaceFrame(){
 if(document.documentElement.dataset.publicHome==="true")return;
 document.body.classList.toggle("has-desktop-rail",innerWidth>=900);desktopCommandRail();syncDesktopRail();
}
window.addEventListener("resize",()=>{if(innerWidth<900){document.querySelector(".desktop-rail-v20")?.remove();document.body.classList.remove("has-desktop-rail")}else workspaceFrame()});
document.addEventListener("click",()=>requestAnimationFrame(syncDesktopRail),true);window.addEventListener("popstate",()=>requestAnimationFrame(syncDesktopRail));queueMicrotask(workspaceFrame);

// AI Studio gets a proper entry in secondary navigation.
function installAITools(){
 document.querySelectorAll(".mobile-more-sheet").forEach(sheet=>{
  if(sheet.querySelector("[data-ai-studio]"))return;
  const head=sheet.querySelector(".mobile-more-head");const b=document.createElement("button");b.className="mobile-ai-v20";b.dataset.aiStudio="1";b.innerHTML='<i>AI</i><div><b>LINKS AI</b><span>Research & card builder</span></div><em>›</em>';head?.after(b);
 });
}
const aiToolsObserver=new MutationObserver(()=>installAITools());aiToolsObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(installAITools);

// Friendly empty-state repair for routes that would otherwise look broken.
function finishEmptyStates(){
 const w=document.querySelector(".route-workspace");if(!w)return;const v=document.documentElement.dataset.view||"";
 const configs={messages:["messages","No messages yet","Pool conversations and commissioner announcements will appear here."],notifications:["messages","You’re caught up","Deadlines, invites and important pool updates will appear here."],"my-pools":["pools","No pools yet","Create a pool or open an invite to get started."]};
 const cfg=configs[v];if(!cfg||w.querySelector(".links-empty"))return;
 const meaningful=[...w.children].filter(x=>!x.matches(".route-identity,.links-context-v15,.route-hero,.v15-superseded")).some(x=>x.textContent.trim().length>40);
 if(!meaningful)w.insertAdjacentHTML("beforeend",linksEmpty(...cfg));
}
document.addEventListener("click",()=>requestAnimationFrame(finishEmptyStates),true);window.addEventListener("popstate",()=>requestAnimationFrame(finishEmptyStates));queueMicrotask(finishEmptyStates);

// Visual QA: mark broken images quietly and replace them with a branded fallback.
function imageFallbacks(){
 document.querySelectorAll("img").forEach(img=>{if(img.dataset.linksFallback)return;img.dataset.linksFallback="1";img.addEventListener("error",()=>{img.classList.add("links-img-broken");img.alt=img.alt||"LINKS";})});
}
const imageQAObserver=new MutationObserver(()=>imageFallbacks());imageQAObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(imageFallbacks);

// Game Center v21 — one polished place for a pool's next matchup, pick state and consequences.
function gameCenterV21(pool){
 const p=PoolHubData[pool]||PoolHubData["My Pool"],g=DemoSlate[0],saved=PickEngine.get(g.id)?.team||"",locked=LockEngine.isLocked(g.id);
 return '<section class="game-center-v21"><div class="gcv-top"><div><span>GAME CENTER · '+linksEscape(p.week)+'</span><h2>'+g.away+' <i>VS</i> '+g.home+'</h2><p>'+g.kick+' · '+(locked?"PICKS LOCKED":"PICKS OPEN")+'</p></div><div class="gcv-state '+(locked?"locked":"open")+'"><i></i><b>'+(locked?"LOCKED":"OPEN")+'</b></div></div><div class="gcv-match"><button '+(locked?"disabled":"")+' data-gcv-team="'+g.away+'"><span>'+g.away+'</span><b>'+g.away+'</b><small>'+(saved===g.away?"YOUR PICK":"SELECT")+'</small></button><div class="gcv-middle"><span>WEEK IMPACT</span><strong>HIGH</strong><i></i><small>Pick’em · Results · Pool Room</small></div><button '+(locked?"disabled":"")+' data-gcv-team="'+g.home+'"><span>'+g.home+'</span><b>'+g.home+'</b><small>'+(saved===g.home?"YOUR PICK":"SELECT")+'</small></button></div><div class="gcv-foot"><div><span>YOUR PICK</span><b>'+(saved?saved:"NOT SET")+'</b></div><div><span>POOL STATUS</span><b>'+p.ready+'/'+p.members+' READY</b></div><button data-gcv-compare>COMPARE FIELD ›</button></div></section>';
}
function mountGameCenterV21(){
 if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"";const hub=document.querySelector(".pool-hub");if(!hub||hub.querySelector(".game-center-v21"))return;
 const tabs=hub.querySelector(".poolhub-tabs");tabs?.insertAdjacentHTML("afterend",gameCenterV21(pool));
 hub.querySelectorAll("[data-gcv-team]").forEach(b=>b.onclick=()=>{const game=DemoSlate[0];if(LockEngine.isLocked(game.id)){AppStatus.show("warn","Game locked","This selection can no longer be changed.");return}PickEngine.save(game.id,b.dataset.gcvTeam);const old=hub.querySelector(".game-center-v21"),box=document.createElement("div");box.innerHTML=gameCenterV21(pool);old?.replaceWith(box.firstElementChild);mountGameCenterV21()});
 hub.querySelector("[data-gcv-compare]")?.addEventListener("click",()=>{const t=hub.querySelector('[data-hubtab="compare"]');t?.click();t?.scrollIntoView({behavior:"smooth",block:"center"})});
}
const gcvObserver=new MutationObserver(()=>mountGameCenterV21());gcvObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountGameCenterV21);

// Pool hub tab state is now reflected in the URL, making refresh/back behavior predictable.
function syncPoolTabURL(tab){
 const u=new URL(location.href);if(u.searchParams.get("view")!=="pool")return;u.searchParams.set("tab",tab);history.replaceState({...history.state,tab},"",u);
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-hubtab]");if(b)syncPoolTabURL(b.dataset.hubtab)},true);
function restorePoolTab(){
 if(document.documentElement.dataset.view!=="pool")return;const tab=new URL(location.href).searchParams.get("tab");if(!tab)return;
 const b=document.querySelector('[data-hubtab="'+CSS.escape(tab)+'"]');if(b&&!b.classList.contains("active"))b.click();
}
setTimeout(restorePoolTab,50);

// Installable app polish: expose a quiet install action when the browser supports it.
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();linksInstallPrompt=e;document.documentElement.dataset.installReady="true";mountInstallV21()});
function mountInstallV21(){
 if(!linksInstallPrompt||document.querySelector(".install-v21")||document.documentElement.dataset.publicHome==="true")return;
 const main=document.querySelector(".main");if(!main)return;
 main.insertAdjacentHTML("beforeend",'<section class="install-v21"><div class="install-mark">L</div><div><span>LINKS APP</span><b>Keep game day one tap away.</b><small>Install LINKS on this device for a full-screen app experience.</small></div><button data-install-v21>INSTALL ›</button></section>');
 document.querySelector("[data-install-v21]")?.addEventListener("click",async()=>{if(!linksInstallPrompt)return;linksInstallPrompt.prompt();const r=await linksInstallPrompt.userChoice;if(r.outcome==="accepted"){document.querySelector(".install-v21")?.remove();AppStatus.show("ok","LINKS installed","You can open LINKS from your home screen.")}linksInstallPrompt=null});
}
const installObserver=new MutationObserver(()=>mountInstallV21());installObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});

// LINKS Platform v22 — AI-first home, freemium foundation, multi-sport card creation, sharing and sportsbook handoff.
const LinksAIPlan={
 key:"links-ai-plan-v22",usageKey:"links-ai-usage-v22",dailyFree:3,
 plan(){return localStorage.getItem(this.key)||"free"},
 usage(){try{const x=JSON.parse(localStorage.getItem(this.usageKey)||"{}"),today=new Date().toISOString().slice(0,10);return x.date===today?x:{date:today,count:0}}catch{return{date:new Date().toISOString().slice(0,10),count:0}}},
 canCreate(){return this.plan()==="pro"||this.usage().count<this.dailyFree},
 remaining(){return this.plan()==="pro"?Infinity:Math.max(0,this.dailyFree-this.usage().count)},
 consume(){if(this.plan()==="pro")return;const x=this.usage();x.count++;localStorage.setItem(this.usageKey,JSON.stringify(x))}
};
const AISports={
 NFL:["BUF · MONEYLINE","DAL @ NYG · OVER 45.5","PHI · TEAM TD 1+"],
 NBA:["BOS · MONEYLINE","LAL @ PHX · OVER 224.5","NYK +4.5"],
 MLB:["ATL · MONEYLINE","NYY @ BOS · OVER 8.5","LAD -1.5"],
 NHL:["EDM · MONEYLINE","NYR @ BOS · OVER 5.5","TOR +1.5"],
 NCAAF:["TENN · MONEYLINE","UGA -6.5","ALA @ LSU · OVER 51.5"],
 SOCCER:["ARSENAL · DRAW NO BET","OVER 2.5 GOALS","BOTH TEAMS TO SCORE"],
 MMA:["FIGHT MONEYLINE","METHOD OF VICTORY","GOES THE DISTANCE"],
 TENNIS:["MATCH WINNER","SET SPREAD","TOTAL GAMES"],
 GOLF:["TO WIN","TOP 10 FINISH","MATCHUP WINNER"],
 WNBA:["MONEYLINE","PLAYER POINTS","GAME TOTAL"],
 NCAAB:["MONEYLINE","SPREAD","GAME TOTAL"]
};
function aiPlanStrip(){
 const pro=LinksAIPlan.plan()==="pro",left=LinksAIPlan.remaining();
 return '<div class="ai-plan-v22"><div><span>'+(pro?"LINKS AI PRO":"FREE PLAN")+'</span><b>'+(pro?"UNLIMITED CARDS":left+" OF "+LinksAIPlan.dailyFree+" CARDS LEFT TODAY")+'</b></div><i><em style="width:'+(pro?100:(left/LinksAIPlan.dailyFree*100))+'%"></em></i><button data-ai-upgrade>'+(pro?"PRO ACTIVE":"VIEW PRO")+'</button></div>';
}
function sportsbookHandoffV22(){
 return '<div class="book-handoff-v22"><div class="bh-title"><span>OPEN YOUR CARD</span><b>Choose where you want to finish.</b><small>LINKS prepares the card. Sportsbooks handle wagering. Full prefilled betslip handoff will only be enabled for partners that support and approve it.</small></div><div class="bh-books"><button data-book="draftkings"><i>DK</i><b>DRAFTKINGS</b><span>OPEN SPORTSBOOK</span></button><button data-book="fanduel"><i>FD</i><b>FANDUEL</b><span>OPEN SPORTSBOOK</span></button><button data-book="bet365"><i>365</i><b>BET365</b><span>OPEN SPORTSBOOK</span></button><button data-share-card><i>↗</i><b>SHARE CARD</b><span>TEXT / SHARE</span></button></div><p>21+ where applicable. Availability varies by location. LINKS does not place wagers.</p></div>';
}
function cardShareText(){
 const ids=AIStudio.load(),legs=AIStudio.legs.filter(x=>ids.includes(x.id));return "My LINKS research card\n"+legs.map(x=>"• "+x.pick+" ("+x.price+")").join("\n")+"\n\nBuilt with LINKS AI — check current odds before acting.";
}
async function shareAICard(){
 const text=cardShareText();if(navigator.share){try{await navigator.share({title:"My LINKS Card",text});return}catch{}}
 try{await navigator.clipboard.writeText(text);AppStatus.show("ok","Card copied","Your LINKS card is ready to paste into a text.")}catch{modal("SHARE CARD",'<div class="ai-share-fallback"><pre>'+linksEscape(text)+'</pre></div>')}
}
const SportsbookLinks={draftkings:"https://sportsbook.draftkings.com/",fanduel:"https://sportsbook.fanduel.com/",bet365:"https://www.bet365.com/"};
document.addEventListener("click",e=>{
 const up=e.target.closest("[data-ai-upgrade]");if(up){e.preventDefault();modal("LINKS AI PRO",'<div class="ai-pro-modal"><span>COMING WHEN BILLING GOES LIVE</span><h3>LINKS AI Pro</h3><b>$9.99 / MONTH</b><p>Unlimited research cards, deeper matchup tools, saved card history and advanced research. Free pools stay free.</p><small>During New Build testing, AI features remain available so we can finish the experience before enforcing billing.</small></div>');return}
 const share=e.target.closest("[data-share-card]");if(share){e.preventDefault();shareAICard();return}
 const book=e.target.closest("[data-book]");if(book){e.preventDefault();const url=SportsbookLinks[book.dataset.book];modal("OPEN SPORTSBOOK",'<div class="book-confirm-v22"><span>LINKS HANDOFF</span><h3>'+book.querySelector("b").textContent+'</h3><p>Your LINKS card stays available here for reference. This prototype opens the sportsbook home; a prefilled betslip will only be used where an approved integration supports it.</p><button data-book-go="'+url+'">CONTINUE ›</button></div>');return}
 const go=e.target.closest("[data-book-go]");if(go){window.open(go.dataset.bookGo,"_blank","noopener")}
},true);

// Extend the AI review with the freemium meter and sportsbook/share handoff.
const originalAIOpen=AIStudio.open.bind(AIStudio);
AIStudio.open=function(){originalAIOpen();const mount=document.querySelector("#aiStudioMount");if(!mount)return;mount.insertAdjacentHTML("afterbegin",aiPlanStrip());mount.insertAdjacentHTML("beforeend",sportsbookHandoffV22())};

// Multi-sport research selector sits above the existing evidence board.
function multiSportBar(){
 return '<div class="ai-sports-v22"><span>SPORT</span>'+Object.keys(AISports).map((x,i)=>'<button class="'+(i===0?"active":"")+'" data-ai-sport="'+x+'">'+x+'</button>').join("")+'</div>';
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-ai-sport]");if(!b)return;document.querySelectorAll("[data-ai-sport]").forEach(x=>x.classList.toggle("active",x===b));const title=document.querySelector(".ais-title small");if(title)title.textContent=b.dataset.aiSport+" research selected · live market feed connection comes next.";AppStatus.show("ok",b.dataset.aiSport+" selected","Research workspace switched to "+b.dataset.aiSport+".")},true);
const oldOpen2=AIStudio.open.bind(AIStudio);
AIStudio.open=function(){oldOpen2();const m=document.querySelector("#aiStudioMount");if(m&&!m.querySelector(".ai-sports-v22"))m.querySelector(".ai-studio-v19")?.insertAdjacentHTML("afterbegin",multiSportBar())};

// AI becomes a first-class Home pillar while Pools remains immediately accessible.
function platformHeroV22(){
 return '<section class="platform-hero-v22"><div class="ph-field"><i></i><i></i><i></i><b></b></div><div class="ph-copy"><span>LINKS · GAME DAY INTELLIGENCE</span><h1>BUILD THE CARD.<br><em>RUN THE POOL.</em></h1><p>Sports research, multi-leg cards and every pool you play—built into one game-day platform.</p><div><button data-ai-studio>BUILD A CARD ›</button><button class="ghost" data-ph-pools>OPEN MY POOLS</button></div><small>Research first. Clear reasoning. No guaranteed winners.</small></div><div class="ph-card"><span>LINKS AI</span><b>CREATE A CARD</b><div><i>NFL</i><i>NBA</i><i>MLB</i><i>NHL</i></div><strong>3 FREE / DAY</strong><button data-ai-studio>START RESEARCH ›</button></div></section>';
}
function mountPlatformHeroV22(){
 if(document.documentElement.dataset.view!=="home"||document.documentElement.dataset.publicHome==="true")return;const main=document.querySelector(".main");if(!main||main.querySelector(".platform-hero-v22"))return;
 const first=main.firstElementChild;first?.insertAdjacentHTML("beforebegin",platformHeroV22());main.querySelector("[data-ph-pools]")?.addEventListener("click",()=>LinksRouter.navigate("my-pools"));
 // Older stadium hero remains as atmosphere deeper on Home, but no longer competes for primary CTA.
 main.querySelectorAll(".home-command-v4,.stadium-command-hero").forEach(x=>x.classList.add("v22-secondary-hero"));
}
const ph22Observer=new MutationObserver(()=>mountPlatformHeroV22());ph22Observer.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountPlatformHeroV22);

// Finish Line v23 — clarify FREE Pools vs LINKS AI and tighten commissioner onboarding.
function platformChoiceV23(){
 return '<section class="platform-choice-v23"><div class="pcv-title"><span>CHOOSE YOUR LINKS</span><b>Two ways to play game day.</b><small>No confusion: Pools are free. AI research is a separate optional tool.</small></div><div class="pcv-grid"><button class="pcv-ai" data-ai-studio><i>AI</i><div><span>LINKS AI</span><b>BUILD A RESEARCH CARD</b><small>Multi-sport research · Share cards · Sportsbook handoff</small></div><em>3 FREE CARDS / DAY ›</em></button><button class="pcv-pools" data-pcv-pools><i>FREE</i><div><span>LINKS POOLS</span><b>CREATE OR PLAY A POOL</b><small>Pick’em · Survivor · Squares · Fantasy · More</small></div><em>POOLS STAY FREE ›</em></button></div></section>';
}
function mountPlatformChoiceV23(){
 if(document.documentElement.dataset.view!=="home"||document.documentElement.dataset.publicHome==="true")return;const main=document.querySelector(".main");if(!main||main.querySelector(".platform-choice-v23"))return;
 const hero=main.querySelector(".platform-hero-v22");hero?.insertAdjacentHTML("afterend",platformChoiceV23());main.querySelector("[data-pcv-pools]")?.addEventListener("click",()=>LinksRouter.navigate("my-pools"));
}
const pcvObserver=new MutationObserver(()=>mountPlatformChoiceV23());pcvObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountPlatformChoiceV23);

// Commissioner quick-start keeps setup, invites, readiness and week control in one obvious sequence.
function commissionerQuickStartV23(){
 const r=entrantReadiness(),pct=r.total?Math.round(r.ready/r.total*100):100;
 return '<section class="comm-quick-v23"><div class="cqv-head"><div><span>COMMISSIONER QUICK START</span><h2>Run the pool from here.</h2><p>Setup, players, picks and weekly control in the order you actually need them.</p></div><strong>'+pct+'%<small>READY</small></strong></div><div class="cqv-steps"><button data-cqv="setup"><i>1</i><div><b>POOL SETUP</b><span>Game, rules, deadline</span></div><em>OPEN ›</em></button><button data-cqv="invite"><i>2</i><div><b>ADD PLAYERS</b><span>Invite link, email or text</span></div><em>INVITE ›</em></button><button data-cqv="players"><i>3</i><div><b>PLAYER READINESS</b><span>'+r.ready+' of '+r.total+' complete</span></div><em>CHECK ›</em></button><button data-cqv="week"><i>4</i><div><b>WEEK CONTROL</b><span>Open, close and lock</span></div><em>MANAGE ›</em></button></div></section>';
}
function mountCommissionerQuickV23(){
 if(document.documentElement.dataset.view!=="commissioner")return;const w=document.querySelector(".route-workspace");if(!w||w.querySelector(".comm-quick-v23"))return;
 const flow=w.querySelector(".commissioner-flow-v12")||w.querySelector(".route-identity");flow?.insertAdjacentHTML("afterend",commissionerQuickStartV23());
 w.querySelectorAll("[data-cqv]").forEach(b=>b.onclick=()=>{const k=b.dataset.cqv;if(k==="setup"){typeof openSetupStudio==="function"?openSetupStudio():CreatePoolStudio.open()}else if(k==="invite"){const pool=Object.keys(PoolHubData)[0]||"My Pool";modal("INVITE PLAYERS",inviteCenter(pool))}else if(k==="players"){document.querySelector(".entrant-manager,.readiness-strip")?.scrollIntoView({behavior:"smooth",block:"center"})}else{document.querySelector(".week-control-v2,.week-control,.commander-v3")?.scrollIntoView({behavior:"smooth",block:"center"})}});
}
const cqvObserver=new MutationObserver(()=>mountCommissionerQuickV23());cqvObserver.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountCommissionerQuickV23);

// Share a real LINKS URL alongside card text, using native share when available.
function cardShareURL(){
 const u=new URL(location.href);u.searchParams.set("view","home");u.searchParams.set("ai","card");return u.toString();
}
async function shareAICardV23(){
 const text=cardShareText(),url=cardShareURL();
 if(navigator.share){try{await navigator.share({title:"My LINKS Research Card",text,url});return}catch{}}
 try{await navigator.clipboard.writeText(text+"\n"+url);AppStatus.show("ok","Card copied","Card details and a LINKS link are ready to paste.")}catch{modal("SHARE CARD",'<div class="ai-share-fallback"><pre>'+linksEscape(text+"\n"+url)+'</pre></div>')}
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-share-card]");if(!b)return;e.preventDefault();e.stopImmediatePropagation();shareAICardV23()},true);

// If a shared AI link is opened, take the visitor straight to the research experience.
setTimeout(()=>{const u=new URL(location.href);if(u.searchParams.get("ai")==="card"&&document.documentElement.dataset.publicHome!=="true")AIStudio.open()},120);

// Game Identity v24 — one logo/score presentation system across ticker, picks and results.
// Uses branded team marks now; the same API can accept official licensed image URLs when feeds/assets are connected.
const TeamIdentity={
 map:{
  TEN:{name:"Titans",sport:"NFL",mark:"TEN",tone:"navy"},IND:{name:"Colts",sport:"NFL",mark:"IND",tone:"blue"},
  DAL:{name:"Cowboys",sport:"NFL",mark:"★",tone:"blue"},NYG:{name:"Giants",sport:"NFL",mark:"NY",tone:"blue"},
  BUF:{name:"Bills",sport:"NFL",mark:"BUF",tone:"blue"},MIA:{name:"Dolphins",sport:"NFL",mark:"MIA",tone:"aqua"},
  PHI:{name:"Eagles",sport:"NFL",mark:"PHI",tone:"green"},TB:{name:"Buccaneers",sport:"NFL",mark:"TB",tone:"red"},
  ATL:{name:"Braves",sport:"MLB",mark:"A",tone:"red"},NYY:{name:"Yankees",sport:"MLB",mark:"NY",tone:"navy"},BOS:{name:"Boston",sport:"MLB",mark:"B",tone:"red"},LAD:{name:"Dodgers",sport:"MLB",mark:"LA",tone:"blue"},
  EDM:{name:"Oilers",sport:"NHL",mark:"EDM",tone:"orange"},NYR:{name:"Rangers",sport:"NHL",mark:"NYR",tone:"blue"},TOR:{name:"Maple Leafs",sport:"NHL",mark:"TOR",tone:"blue"},
  LAL:{name:"Lakers",sport:"NBA",mark:"LA",tone:"gold"},PHX:{name:"Suns",sport:"NBA",mark:"PHX",tone:"orange"},NYK:{name:"Knicks",sport:"NBA",mark:"NY",tone:"blue"},
  TENN:{name:"Tennessee",sport:"NCAA",mark:"T",tone:"orange"},UGA:{name:"Georgia",sport:"NCAA",mark:"G",tone:"red"},ALA:{name:"Alabama",sport:"NCAA",mark:"A",tone:"red"},LSU:{name:"LSU",sport:"NCAA",mark:"LSU",tone:"gold"}
 },
 get(code){return this.map[code]||{name:code,sport:"SPORT",mark:code.slice(0,3),tone:"neutral"}},
 html(code,size="md"){const t=this.get(code);return '<span class="team-mark-v24 '+size+' '+t.tone+'" aria-label="'+linksEscape(t.name)+'"><b>'+linksEscape(t.mark)+'</b></span>'}
};
function identityPickSurfaces(){
 document.querySelectorAll(".hub-pick-row,.prv-game,.gcv-match>button").forEach(row=>{
  if(row.dataset.identityV24)return;row.dataset.identityV24="1";
  const text=row.textContent||"";Object.keys(TeamIdentity.map).forEach(code=>{if(!new RegExp("\\b"+code+"\\b").test(text))return;
   row.querySelectorAll("button").forEach(b=>{if((b.textContent||"").trim()===code&&!b.querySelector(".team-mark-v24"))b.insertAdjacentHTML("afterbegin",TeamIdentity.html(code,"sm"))});
  });
 });
}
function liveScoreRailV24(){
 const existing=document.querySelector(".live-score-rail-v24");if(existing||document.documentElement.dataset.publicHome==="true")return;
 const app=document.querySelector("#app");if(!app)return;
 const games=[
  {a:"TEN",as:17,h:"IND",hs:20,state:"3Q · 4:18",live:true},
  {a:"DAL",as:24,h:"NYG",hs:21,state:"FINAL",final:true},
  {a:"BUF",as:null,h:"MIA",hs:null,state:"SUN · 3:25",up:true},
  {a:"PHI",as:null,h:"TB",hs:null,state:"SUN · 7:20",up:true}
 ];
 app.insertAdjacentHTML("afterbegin",'<section class="live-score-rail-v24"><div class="lsr-label"><i></i><b>LINKS LIVE</b></div><div class="lsr-track">'+games.map(g=>'<button class="'+(g.live?"live":g.final?"final":"upcoming")+'" data-lsr-game="'+g.a+'-'+g.h+'"><div>'+TeamIdentity.html(g.a,"xs")+'<span>'+g.a+'</span><b>'+(g.as??"—")+'</b></div><div>'+TeamIdentity.html(g.h,"xs")+'<span>'+g.h+'</span><b>'+(g.hs??"—")+'</b></div><em>'+g.state+'</em></button>').join("")+'</div><button class="lsr-all" data-lsr-all>ALL SCORES ›</button></section>');
 document.querySelector("[data-lsr-all]")?.addEventListener("click",()=>LinksRouter.navigate("results"));
 document.querySelectorAll("[data-lsr-game]").forEach(b=>b.addEventListener("click",()=>LinksRouter.navigate("results")));
}
function gameIdentityV24(){liveScoreRailV24();identityPickSurfaces()}
document.addEventListener("click",()=>requestAnimationFrame(gameIdentityV24),true);window.addEventListener("popstate",()=>requestAnimationFrame(gameIdentityV24));queueMicrotask(gameIdentityV24);

// Final preflight panel for commissioner: visible only in Commissioner, and based on actual prototype state.
function commissionerPreflightV24(){
 const r=entrantReadiness(),week=WeekGate.isOpen(),issues=[];
 if(r.missing.length)issues.push(r.missing.length+" player"+(r.missing.length===1?"":"s")+" incomplete");
 if(!week)issues.push("week closed");
 return '<section class="preflight-v24 '+(issues.length?"attention":"ready")+'"><div class="pf-icon">'+(issues.length?"!":"✓")+'</div><div><span>WEEK PREFLIGHT</span><b>'+(issues.length?"Needs a quick check":"Ready for game day")+'</b><small>'+(issues.length?issues.join(" · "):"Players, week access and current pool state look ready.")+'</small></div><button data-pf-action>'+(issues.length?"REVIEW ›":"VIEW WEEK ›")+'</button></section>';
}
function mountPreflightV24(){
 if(document.documentElement.dataset.view!=="commissioner")return;const w=document.querySelector(".route-workspace");if(!w||w.querySelector(".preflight-v24"))return;
 const q=w.querySelector(".comm-quick-v23");q?.insertAdjacentHTML("afterend",commissionerPreflightV24());w.querySelector("[data-pf-action]")?.addEventListener("click",()=>w.querySelector(".commander-v3,.readiness-strip,.week-control-v2")?.scrollIntoView({behavior:"smooth",block:"center"}));
}
const pf24Observer=new MutationObserver(()=>mountPreflightV24());pf24Observer.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(mountPreflightV24);

// Reveal Finish v25 — cinematic stadium atmosphere, sport worlds and premium motion without sacrificing clarity.
function stadiumAtmosphereV25(){
 if(document.querySelector(".stadium-atmos-v25")||document.documentElement.dataset.publicHome==="true")return;
 document.body.insertAdjacentHTML("afterbegin",'<div class="stadium-atmos-v25" aria-hidden="true"><div class="sav-lights left"><i></i><i></i><i></i><i></i></div><div class="sav-lights right"><i></i><i></i><i></i><i></i></div><div class="sav-haze"></div><div class="sav-field"><i></i><i></i><i></i><b></b></div></div>');
}
function sportWorldV25(){
 const main=document.querySelector(".main");if(!main||main.querySelector(".sport-world-v25")||document.documentElement.dataset.view!=="home"||document.documentElement.dataset.publicHome==="true")return;
 main.insertAdjacentHTML("beforeend",'<section class="sport-world-v25"><div class="swv-head"><span>ONE LINKS. EVERY GAME.</span><h2>Your game-day world.</h2><p>Every sport keeps its own identity while still feeling like LINKS.</p></div><div class="swv-grid"><button data-ai-studio class="football"><i class="swv-art"><b></b></i><div><span>FOOTBALL</span><strong>NFL · COLLEGE</strong><small>Pick’em · Survivor · Props · AI</small></div></button><button data-ai-studio class="baseball"><i class="swv-art"><b></b></i><div><span>BASEBALL</span><strong>MLB</strong><small>Pick’em · Run pools · AI cards</small></div></button><button data-ai-studio class="hockey"><i class="swv-art"><b></b></i><div><span>HOCKEY</span><strong>NHL</strong><small>Pick’em · Survivor · AI cards</small></div></button><button data-ai-studio class="basketball"><i class="swv-art"><b></b></i><div><span>BASKETBALL</span><strong>NBA · MARCH</strong><small>Brackets · Pick’em · AI cards</small></div></button><button data-ai-studio class="soccer"><i class="swv-art"><b></b></i><div><span>SOCCER</span><strong>WORLD FOOTBALL</strong><small>Pick’em · Brackets · AI cards</small></div></button><button data-ph-pools class="racing"><i class="swv-art"><b></b></i><div><span>RACING + GOLF</span><strong>RACE DAY · MAJORS</strong><small>Pick X · One & Done · Pools</small></div></button></div></section>');
 main.querySelector(".sport-world-v25 [data-ph-pools]")?.addEventListener("click",()=>LinksRouter.navigate("my-pools"));
}
function revealFinishV25(){stadiumAtmosphereV25();sportWorldV25()}
const rf25Observer=new MutationObserver(()=>revealFinishV25());rf25Observer.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(revealFinishV25);

// Premium route transition curtain: fast enough to feel responsive, deliberate enough to feel native.
document.addEventListener("click",e=>{if(!e.target.closest("[data-route],[data-mobile-route],[data-drv],[data-ph-pools]"))return;document.documentElement.classList.add("links-route-moving");setTimeout(()=>document.documentElement.classList.remove("links-route-moving"),240)},true);

// Give the build stamp an accurate finish-line label.
function stampV25(){document.querySelectorAll(".app-build-v18").forEach(x=>{x.innerHTML="<b>LINKS</b><span>NEW BUILD · v25 · FINISHING PASS</span>"})}
const stamp25Observer=new MutationObserver(()=>stampV25());stamp25Observer.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(stampV25);


// Finish Product v26 — interaction guardrails + polished quick actions.
function finishProductV26(){
  if(document.querySelector(".finish-dock-v26")||document.documentElement.dataset.publicHome==="true")return;
  document.body.insertAdjacentHTML("beforeend",'<nav class="finish-dock-v26" aria-label="Quick actions"><button data-v26="home"><i>⌂</i><span>HOME</span></button><button data-v26="pools"><i>▦</i><span>POOLS</span></button><button class="ai" data-ai-studio><i>AI</i><span>CREATE CARD</span></button><button data-v26="scores"><i>●</i><span>LIVE</span></button><button data-v26="commish"><i>⚙</i><span>COMMISH</span></button></nav>');
  document.querySelectorAll("[data-v26]").forEach(b=>b.addEventListener("click",()=>{const k=b.dataset.v26;if(k==="home")LinksRouter.navigate("home");else if(k==="pools")LinksRouter.navigate("my-pools");else if(k==="scores")LinksRouter.navigate("results");else LinksRouter.navigate("commissioner")}));
}
function polishActionsV26(){
 document.querySelectorAll("button").forEach(b=>{
  if(b.dataset.v26Bound||b.disabled)return;
  const t=(b.textContent||"").trim().toUpperCase();
  const map=t.includes("VIEW CONFIRMATION")||t==="FINISH MY PICKS"?"my-picks":t.includes("OPEN MATCHUP")||t.includes("OPEN POOL ROOM")||t.includes("GAME ROOM")?"my-pools":t.includes("VIEW LEGACY")||t.includes("SPORTS HISTORY")?"results":t.includes("PREVIEW JOIN FLOW")?"my-pools":null;
  if(map){b.dataset.v26Bound="1";b.addEventListener("click",()=>LinksRouter.navigate(map))}
 });
}
function v26Boot(){finishProductV26();polishActionsV26()}
const v26o=new MutationObserver(()=>v26Boot());v26o.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(v26Boot);
function stampV26(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v26 · FINISH PRODUCT</span>")}
const stamp26o=new MutationObserver(stampV26);stamp26o.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(stampV26);


// Stadium Continuity v27 — clean splash language carried through the product.
function stadiumContinuityV27(){
 document.documentElement.classList.add("links-v27");
 const hero=document.querySelector(".platform-hero-v22");
 if(hero&&!hero.querySelector(".v27-stadium-signature"))hero.insertAdjacentHTML("afterbegin",'<div class="v27-stadium-signature" aria-hidden="true"><i></i><i></i><i></i><span></span></div>');
 document.querySelectorAll(".platform-choice-v23,.sport-world-v25,.comm-quick-v23,.preflight-v24,.ai-studio-v19,.route-workspace").forEach(x=>x.classList.add("v27-premium-surface"));
}
function visitorClarityV27(){
 if(document.documentElement.dataset.view!=="home"||document.documentElement.dataset.publicHome==="true")return;
 const main=document.querySelector(".main"); if(!main||main.querySelector(".visitor-path-v27"))return;
 const choice=main.querySelector(".platform-choice-v23")||main.querySelector(".platform-hero-v22"); if(!choice)return;
 choice.insertAdjacentHTML("afterend",'<section class="visitor-path-v27"><div><span>NEW TO LINKS?</span><b>FREE SPORTS POOLS, WITHOUT THE WORK.</b><small>Create a pool, invite your people, make picks. LINKS handles locks, scores, standings and the weekly flow.</small><button data-v27-create>CREATE A FREE POOL ›</button></div><div><span>ALREADY PLAY HERE?</span><b>GET BACK TO YOUR POOL FAST.</b><small>Open your pools and jump straight to the picks, scores or standings that matter now.</small><button data-v27-return>OPEN MY POOLS ›</button></div><div class="ai"><span>LINKS AI</span><b>CREATE A RESEARCH CARD.</b><small>Research multiple sports, build a card, share it, then hand off to a sportsbook when you choose.</small><button data-ai-studio>CREATE A CARD ›</button></div></section>');
 main.querySelector("[data-v27-create]")?.addEventListener("click",()=>{if(typeof CreatePoolStudio!=="undefined"&&CreatePoolStudio.open)CreatePoolStudio.open();else LinksRouter.navigate("my-pools")});
 main.querySelector("[data-v27-return]")?.addEventListener("click",()=>LinksRouter.navigate("my-pools"));
}
function bootV27(){stadiumContinuityV27();visitorClarityV27()}
const v27o=new MutationObserver(bootV27);v27o.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV27);
function stampV27(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v27 · STADIUM FINISH</span>")}
const stamp27o=new MutationObserver(stampV27);stamp27o.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(stampV27);

// Game Center Finish v28 — one clean destination for every active pool.
function gameCenterV28(){
 if(document.documentElement.dataset.view!=="my-pools")return;
 const w=document.querySelector(".route-workspace,.main");if(!w||w.querySelector(".game-center-v28"))return;
 w.insertAdjacentHTML("afterbegin",'<section class="game-center-v28"><div class="g28-head"><div><span>MY LINKS</span><h2>GAME CENTER</h2><small>Picks, live action, results and commissioner work—one tap away.</small></div><button data-v28-create>+ FREE POOL</button></div><div class="g28-actions"><button data-v28-picks><i>✓</i><b>MY PICKS</b><span>Finish what locks next</span></button><button data-v28-live><i>●</i><b>LIVE SCORES</b><span>Follow every result</span></button><button data-v28-results><i>🏆</i><b>RESULTS</b><span>Standings + winners</span></button><button data-v28-commish><i>⚙</i><b>COMMISSIONER</b><span>Run your pool</span></button></div></section>');
 const nav=(s)=>LinksRouter.navigate(s);
 w.querySelector("[data-v28-picks]")?.addEventListener("click",()=>nav("my-picks"));w.querySelector("[data-v28-live]")?.addEventListener("click",()=>nav("results"));w.querySelector("[data-v28-results]")?.addEventListener("click",()=>nav("results"));w.querySelector("[data-v28-commish]")?.addEventListener("click",()=>nav("commissioner"));w.querySelector("[data-v28-create]")?.addEventListener("click",()=>typeof CreatePoolStudio!=="undefined"&&CreatePoolStudio.open?CreatePoolStudio.open():nav("my-pools"));
}
function routeIdentityV28(){
 const view=document.documentElement.dataset.view||"home";document.querySelectorAll(".finish-dock-v26 [data-v26]").forEach(b=>b.classList.toggle("active",b.dataset.v26===({home:"home","my-pools":"pools","my-picks":"pools",results:"scores",commissioner:"commish"}[view]||"")));
}
function bootV28(){gameCenterV28();routeIdentityV28()}
const v28o=new MutationObserver(bootV28);v28o.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV28);
function stampV28(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v28 · GAME CENTER FINISH</span>")}queueMicrotask(stampV28);

// Finish Product v29 — reduce visual noise and make every major surface read like one product.
function finishHierarchyV29(){
 const view=document.documentElement.dataset.view||"home";
 if(view==="home"){
  const main=document.querySelector(".main");if(!main)return;
  const primary=[".platform-hero-v22",".platform-choice-v23",".visitor-path-v27",".ai-card",".sport-world-v25"];
  primary.forEach(s=>main.querySelector(s)?.classList.add("v29-primary"));
  [".legacy-card",".recap-card",".pulse-hero",".rivalry-card",".nightboard-card",".picksafe-card",".personal-stream-card",".attention-card",".ai-gameday-card",".moment-card",".trophy-card",".pool-room-card",".commish-week-card",".spotlight-card",".join-card",".field-card",".exposure-card",".scenario-card",".lock-card",".social-card",".pulse-card"].forEach(s=>main.querySelectorAll(s).forEach(x=>x.classList.add("v29-secondary")));
 }
 document.querySelectorAll("button").forEach(b=>{if(!b.getAttribute("aria-label")&&!((b.textContent||"").trim()))b.setAttribute("aria-label","LINKS action")});
}
function homeFinishRailV29(){
 if(document.documentElement.dataset.view!=="home"||document.documentElement.dataset.publicHome==="true")return;
 const main=document.querySelector(".main");if(!main||main.querySelector(".finish-rail-v29"))return;
 const target=main.querySelector(".visitor-path-v27")||main.querySelector(".platform-choice-v23");if(!target)return;
 target.insertAdjacentHTML("afterend",'<section class="finish-rail-v29"><div><i>FREE</i><p><b>POOL PLAY</b><span>Create · Invite · Pick · Score</span></p></div><div><i>LIVE</i><p><b>GAME DAY</b><span>Scores · Impact · Standings</span></p></div><div><i>AI</i><p><b>CARD LAB</b><span>Research · Build · Share</span></p></div><div><i>✓</i><p><b>ONE ACCOUNT</b><span>Everything stays together</span></p></div></section>');
}
function bootV29(){finishHierarchyV29();homeFinishRailV29()}
const v29o=new MutationObserver(bootV29);v29o.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV29);
function stampV29(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v29 · PRODUCT FINISH</span>")}queueMicrotask(stampV29);

// Navigation Architecture v30 — keep primary destinations obvious and context actions where they belong.
function navigationArchitectureV30(){
 const view=document.documentElement.dataset.view||"home";
 document.querySelectorAll(".finish-dock-v26").forEach(d=>d.dataset.context=view);
 const rail=document.querySelector(".live-score-rail-v24");if(rail)rail.classList.toggle("v30-compact",view==="commissioner");
 document.querySelectorAll(".v29-secondary").forEach((x,i)=>{if(view==="home"&&i>7)x.classList.add("v30-deep")});
}
function commissionerToolsV30(){
 if(document.documentElement.dataset.view!=="commissioner")return;
 const w=document.querySelector(".route-workspace");if(!w||w.querySelector(".comm-tools-v30"))return;
 const anchor=w.querySelector(".preflight-v24")||w.querySelector(".comm-quick-v23");if(!anchor)return;
 anchor.insertAdjacentHTML("afterend",'<section class="comm-tools-v30"><button data-v30="players"><i>01</i><b>PLAYERS</b><span>Invite · readiness · reminders</span></button><button data-v30="game"><i>02</i><b>GAME SETUP</b><span>Slate · rules · deadlines</span></button><button data-v30="week"><i>03</i><b>WEEK CONTROL</b><span>Open · lock · score</span></button><button data-v30="activity"><i>04</i><b>ACTIVITY</b><span>Changes · audit · history</span></button></section>');
 w.querySelectorAll("[data-v30]").forEach(b=>b.addEventListener("click",()=>{const k=b.dataset.v30,sel=k==="players"?".entrant-manager,.readiness-strip":k==="game"?".week-control-v2,.week-control":k==="week"?".commander-v3,.week-control-v2":".activity,.audit,.commissioner-activity";w.querySelector(sel)?.scrollIntoView({behavior:"smooth",block:"center"})}));
}
function bootV30(){navigationArchitectureV30();commissionerToolsV30()}const v30o=new MutationObserver(bootV30);v30o.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV30);
function stampV30(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v30 · NAVIGATION ARCHITECTURE</span>")}queueMicrotask(stampV30);

// Audio-ready product shell v31 — visual hooks for the future original LINKS theme without autoplay.
function audioReadyV31(){
 const splash=document.querySelector(".splash,.splash-screen,.intro-splash");
 if(splash&&!splash.querySelector(".links-sonic-v31"))splash.insertAdjacentHTML("beforeend",'<div class="links-sonic-v31" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>');
 document.querySelectorAll(".platform-hero-v22,.game-center-v28").forEach(x=>x.classList.add("v31-broadcast"));
}
function scoreStatusV31(){
 document.querySelectorAll(".live-score-rail-v24").forEach(r=>{if(!r.querySelector(".live-pulse-v31"))r.insertAdjacentHTML("afterbegin",'<span class="live-pulse-v31" aria-hidden="true"></span>')});
}
function bootV31(){audioReadyV31();scoreStatusV31()}const o31=new MutationObserver(bootV31);o31.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV31);
function stampV31(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v31 · BROADCAST FINISH</span>")}queueMicrotask(stampV31);

// Interaction Finish v32 — consistent loading feedback and safe double-click protection.
function interactionFinishV32(){
 document.querySelectorAll("button:not([data-v32-ready])").forEach(b=>{
  b.dataset.v32Ready="1";
  b.addEventListener("click",()=>{
   if(b.disabled||b.dataset.noBusy==="1")return;
   const t=(b.textContent||"").trim().toUpperCase();
   if(/OPEN|CREATE|SIGN|JOIN|CONTINUE|SAVE|VIEW|BUILD|START|GO TO/.test(t)){
    b.classList.add("v32-pressed");
    setTimeout(()=>b.classList.remove("v32-pressed"),650);
   }
  },{passive:true});
 });
 document.querySelectorAll("input,select,textarea").forEach(el=>{if(!el.getAttribute("aria-label")&&!el.closest("label")){const p=el.getAttribute("placeholder");if(p)el.setAttribute("aria-label",p)}});
}
function pageContextV32(){
 const v=document.documentElement.dataset.view||"home";
 document.body.dataset.linksView=v;
 const main=document.querySelector(".main");if(main)main.classList.toggle("v32-workspace",v!=="home");
}
function bootV32(){interactionFinishV32();pageContextV32()}const o32=new MutationObserver(bootV32);o32.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV32);
function stampV32(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v32 · INTERACTION FINISH</span>")}queueMicrotask(stampV32);

// Mobile Finish v33 — thumb-first navigation and compact premium headers.
function mobileFinishV33(){
 const v=document.documentElement.dataset.view||"home";
 document.querySelectorAll(".finish-dock-v26").forEach(d=>{d.setAttribute("aria-label","LINKS primary navigation");d.querySelectorAll("button").forEach(b=>{if(!b.title)b.title=(b.textContent||"LINKS").trim()})});
 document.querySelectorAll(".route-workspace").forEach(w=>w.dataset.v33View=v);
}
function bootV33(){mobileFinishV33()}const o33=new MutationObserver(bootV33);o33.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV33);
function stampV33(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v33 · MOBILE FINISH</span>")}queueMicrotask(stampV33);

// Release Readiness v34 — consistent empty/loading language and final product semantics.
function releaseReadinessV34(){
 document.querySelectorAll("[data-empty],.empty-state").forEach(e=>{if(!e.querySelector(".v34-empty-mark"))e.insertAdjacentHTML("afterbegin",'<span class="v34-empty-mark" aria-hidden="true">LINKS</span>')});
 document.querySelectorAll("a[target='_blank']").forEach(a=>{if(!a.rel)a.rel="noopener noreferrer"});
 document.querySelectorAll("img").forEach(i=>{if(!i.hasAttribute("loading"))i.loading="lazy";if(!i.hasAttribute("decoding"))i.decoding="async"});
}
function bootV34(){releaseReadinessV34()}const o34=new MutationObserver(bootV34);o34.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV34);
function stampV34(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v34 · RELEASE READINESS</span>")}queueMicrotask(stampV34);

// Splash Theme v35 — wired for the official Stadium Rumble MP3.
const LinksSplashAudioV35={src:"./assets/stadium-rumble.mp3",audio:null,armed:false,
 init(){if(this.audio)return;this.audio=new Audio(this.src);this.audio.preload="auto";this.audio.volume=.72;this.audio.setAttribute("playsinline","");},
 play(){this.init();if(localStorage.getItem("linksSplashMuted")==="1")return;this.audio.currentTime=0;const p=this.audio.play();if(p&&p.catch)p.catch(()=>{this.armed=true})},
 retry(){if(!this.armed)return;this.armed=false;this.play()},
 toggle(){const muted=localStorage.getItem("linksSplashMuted")==="1";localStorage.setItem("linksSplashMuted",muted?"0":"1");if(!muted&&this.audio)this.audio.pause();return muted}
};
function splashThemeV35(){
 LinksSplashAudioV35.init();
 const splash=document.querySelector(".splash,.splash-screen,.intro-splash");
 if(splash&&!splash.dataset.v35Audio){splash.dataset.v35Audio="1";LinksSplashAudioV35.play();splash.insertAdjacentHTML("beforeend",'<button class="splash-sound-v35" type="button" aria-label="Toggle LINKS splash sound">SOUND</button>');splash.querySelector(".splash-sound-v35")?.addEventListener("click",e=>{e.stopPropagation();LinksSplashAudioV35.toggle();e.currentTarget.classList.toggle("muted",localStorage.getItem("linksSplashMuted")==="1")})}
}
document.addEventListener("pointerdown",()=>LinksSplashAudioV35.retry(),{once:true,passive:true});
const o35=new MutationObserver(splashThemeV35);o35.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(splashThemeV35);
function stampV35(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v35 · SPLASH THEME READY</span>")}queueMicrotask(stampV35);

// Final Cohesion v36 — consistent section rhythm, titles and navigation affordances.
function cohesionV36(){
 document.querySelectorAll(".route-workspace:not([data-v36])").forEach(w=>{w.dataset.v36="1";const h=w.querySelector("h1,h2");if(h&&!w.querySelector(".v36-route-kicker"))h.insertAdjacentHTML("beforebegin",'<span class="v36-route-kicker">LINKS SPORTS</span>')});
 document.querySelectorAll(".main section:not([data-v36-section])").forEach(s=>s.dataset.v36Section="1");
}
function bootV36(){cohesionV36()}const o36=new MutationObserver(bootV36);o36.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV36);
function stampV36(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v36 · FINAL COHESION</span>")}queueMicrotask(stampV36);

// Premium Detail v37 — scoreboard-grade accents without clutter.
function premiumDetailV37(){
 document.querySelectorAll(".platform-hero-v22,.game-center-v28,.comm-tools-v30").forEach(x=>{if(!x.querySelector(":scope > .v37-edge"))x.insertAdjacentHTML("afterbegin",'<span class="v37-edge" aria-hidden="true"></span>')});
 document.querySelectorAll(".live-score-rail-v24").forEach(x=>x.setAttribute("aria-label","LINKS live scores"));
}
function bootV37(){premiumDetailV37()}const o37=new MutationObserver(bootV37);o37.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV37);
function stampV37(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v37 · PREMIUM DETAIL</span>")}queueMicrotask(stampV37);

// Resilience Finish v38 — graceful UI recovery for missing media and network states.
function resilienceV38(){
 document.querySelectorAll("img:not([data-v38])").forEach(img=>{img.dataset.v38="1";img.addEventListener("error",()=>{img.classList.add("v38-media-failed");img.setAttribute("aria-hidden","true")},{once:true})});
 document.querySelectorAll("button:not([data-v38-title])").forEach(b=>{b.dataset.v38Title="1";if(!b.title){const t=(b.textContent||"").replace(/\s+/g," ").trim();if(t)b.title=t}});
}
window.addEventListener("offline",()=>document.body.classList.add("links-offline-v38"));window.addEventListener("online",()=>document.body.classList.remove("links-offline-v38"));if(!navigator.onLine)document.body.classList.add("links-offline-v38");
function bootV38(){resilienceV38()}const o38=new MutationObserver(bootV38);o38.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV38);
function stampV38(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v38 · RESILIENCE FINISH</span>")}queueMicrotask(stampV38);

// Game Day Finish v39 — reinforce actionable state and clean selected navigation.
function gameDayFinishV39(){
 const view=document.documentElement.dataset.view||"";
 document.querySelectorAll(".finish-dock-v26 button,.game-center-v28 button").forEach(b=>{const t=(b.textContent||"").toLowerCase();b.classList.toggle("v39-current",(view==="home"&&t.includes("home"))||(view.includes("pool")&&t.includes("pool"))||(view.includes("ai")&&t.includes("card"))||(view.includes("result")&&t.includes("live"))||(view.includes("comm")&&t.includes("comm")))});
 document.querySelectorAll(".card,.panel,.game-card").forEach(x=>{if(!x.dataset.v39)x.dataset.v39="1"});
}
function bootV39(){gameDayFinishV39()}const o39=new MutationObserver(bootV39);o39.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV39);
function stampV39(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v39 · GAME DAY FINISH</span>")}queueMicrotask(stampV39);

// Launch Polish v40 — keyboard flow, reduced-motion respect and touch-first usability.
function launchPolishV40(){
 document.querySelectorAll('a[target="_blank"]').forEach(a=>a.rel="noopener noreferrer");
 document.querySelectorAll("button,[role=button],a").forEach(el=>{if(!el.dataset.v40){el.dataset.v40="1";if(el.tagName!=="A"&&!el.hasAttribute("type"))el.setAttribute("type","button")}});
 document.querySelectorAll("input,select,textarea").forEach(el=>{el.setAttribute("autocomplete",el.getAttribute("autocomplete")||"off")});
}
document.addEventListener("keydown",e=>{if(e.key==="Escape"){document.querySelectorAll(".modal.open,.modal.show,[aria-modal=true]").forEach(m=>{const x=m.querySelector('[aria-label*="close" i],.close,[data-close]');if(x)x.click()})}});
function bootV40(){launchPolishV40()}const o40=new MutationObserver(bootV40);o40.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV40);
function stampV40(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v40 · LAUNCH POLISH</span>")}queueMicrotask(stampV40);

// Real Score Feed v41 — replace fabricated ticker scores with ESPN public scoreboard data.
const LiveFeedV41={games:[],status:"loading",updated:0,async load(){
 try{const r=await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",{cache:"no-store"});if(!r.ok)throw new Error("score feed");const d=await r.json();this.games=(d.events||[]).slice(0,8).map(e=>{const c=e.competitions?.[0]||{},cs=c.competitors||[],a=cs.find(x=>x.homeAway==="away")||cs[0]||{},h=cs.find(x=>x.homeAway==="home")||cs[1]||{};return {a:a.team?.abbreviation||"AWAY",h:h.team?.abbreviation||"HOME",as:a.score??null,hs:h.score??null,state:e.status?.type?.shortDetail||e.status?.type?.description||"SCHEDULED",live:e.status?.type?.state==="in",final:e.status?.type?.completed===true}});this.status="ready";this.updated=Date.now()}catch(e){this.games=[];this.status="unavailable"}this.paint()},
 paint(){document.querySelectorAll(".live-score-rail-v24,.home-live-strip").forEach(x=>x.remove());liveScoreRailV24();mountHomeLive()}
};
function scoreCardsV41(games,home=false){return games.map(g=>home?'<button data-live-results><div class="hls-team"><b>'+g.a+'</b><em>'+(g.as??"—")+'</em></div><span class="'+(g.live?"live":"upcoming")+'">'+g.state+'</span><div class="hls-team away"><em>'+(g.hs??"—")+'</em><b>'+g.h+'</b></div></button>':'<button class="'+(g.live?"live":g.final?"final":"upcoming")+'" data-lsr-game="'+g.a+'-'+g.h+'"><div>'+TeamIdentity.html(g.a,"xs")+'<span>'+g.a+'</span><b>'+(g.as??"—")+'</b></div><div>'+TeamIdentity.html(g.h,"xs")+'<span>'+g.h+'</span><b>'+(g.hs??"—")+'</b></div><em>'+g.state+'</em></button>').join("")}
function liveScoreRailV24(){
 if(document.querySelector(".live-score-rail-v24")||document.documentElement.dataset.publicHome==="true")return;const app=document.querySelector("#app");if(!app)return;
 const body=LiveFeedV41.status==="ready"&&LiveFeedV41.games.length?scoreCardsV41(LiveFeedV41.games):'<div class="v41-feed-state">'+(LiveFeedV41.status==="unavailable"?"SCORES TEMPORARILY UNAVAILABLE":"LOADING LIVE SCORES…")+'</div>';
 app.insertAdjacentHTML("afterbegin",'<section class="live-score-rail-v24"><div class="lsr-label"><i></i><b>LINKS LIVE</b></div><div class="lsr-track">'+body+'</div><button class="lsr-all" data-lsr-all>ALL SCORES ›</button></section>');document.querySelector("[data-lsr-all]")?.addEventListener("click",()=>LinksRouter.navigate("results"));document.querySelectorAll("[data-lsr-game]").forEach(b=>b.addEventListener("click",()=>LinksRouter.navigate("results")));
}
function mountHomeLive(){
 if(document.documentElement.dataset.view!=="home")return;const cmd=document.querySelector(".home-command-v4");if(!cmd||cmd.querySelector(".home-live-strip"))return;const hero=cmd.querySelector(".home-stage");if(!hero)return;
 const body=LiveFeedV41.status==="ready"&&LiveFeedV41.games.length?scoreCardsV41(LiveFeedV41.games.slice(0,4),true):'<div class="v41-home-feed">'+(LiveFeedV41.status==="unavailable"?"SCORE FEED UNAVAILABLE":"CONNECTING TO LIVE SCORES…")+'</div>';
 hero.insertAdjacentHTML("afterend",'<section class="home-live-strip"><div class="hls-brand"><i></i><div><span>LINKS LIVE</span><b>GAME DAY</b></div></div><div class="hls-games">'+body+'</div><button class="hls-all" data-live-results>ALL SCORES ›</button></section>');cmd.querySelectorAll("[data-live-results]").forEach(b=>b.addEventListener("click",()=>LinksRouter.navigate("results")));
}
LiveFeedV41.load();setInterval(()=>LiveFeedV41.load(),60000);
function stampV41(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v41 · REAL SCORE FEED</span>")}queueMicrotask(stampV41);

// Clean Product State v42 — clearly separate previews from live user data.
function cleanProductStateV42(){
 document.querySelectorAll(".route-workspace,.main").forEach(root=>{root.querySelectorAll(".card,.panel,article").forEach(x=>{const t=(x.textContent||"");if(/Player 2|Player 3|My Pool|College Pool/.test(t)&&!x.dataset.preview){x.dataset.preview="true"}})});
 document.querySelectorAll('[data-preview="true"]').forEach(x=>{if(!x.querySelector(".v42-preview"))x.insertAdjacentHTML("afterbegin",'<span class="v42-preview">PREVIEW</span>')});
}
function bootV42(){cleanProductStateV42()}const o42=new MutationObserver(bootV42);o42.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV42);
function stampV42(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v42 · CLEAN PRODUCT STATE</span>")}queueMicrotask(stampV42);

// Near-Final QA v43 — prevent accidental double actions and expose reliable busy feedback.
function nearFinalV43(){
 document.querySelectorAll("button").forEach(b=>{if(b.dataset.v43)return;b.dataset.v43="1";b.addEventListener("click",()=>{if(b.disabled)return;b.classList.add("v43-pressed");setTimeout(()=>b.classList.remove("v43-pressed"),240)})});
 document.querySelectorAll("form").forEach(f=>{if(f.dataset.v43)return;f.dataset.v43="1";f.addEventListener("submit",()=>{const b=f.querySelector('button[type="submit"],button:not([type])');if(b){b.classList.add("v43-busy");b.setAttribute("aria-busy","true");setTimeout(()=>{b.classList.remove("v43-busy");b.removeAttribute("aria-busy")},1800)}})});
}
function bootV43(){nearFinalV43()}const o43=new MutationObserver(bootV43);o43.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV43);
function stampV43(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v43 · NEAR-FINAL QA</span>")}queueMicrotask(stampV43);

// Release Candidate v44 — consistent top-of-page routing and compact mobile game-day behavior.
function releaseCandidateV44(){
 const view=document.documentElement.dataset.view||"";
 document.body.dataset.linksView=view||"home";
 document.querySelectorAll(".route-workspace h1,.route-workspace h2").forEach(h=>{if(!h.id)h.id="links-title-"+Math.random().toString(36).slice(2,8)});
 document.querySelectorAll(".route-workspace").forEach(w=>{const h=w.querySelector("h1,h2");if(h)w.setAttribute("aria-labelledby",h.id)});
}
let lastV44="";function bootV44(){const v=document.documentElement.dataset.view||"home";releaseCandidateV44();if(v!==lastV44){lastV44=v;requestAnimationFrame(()=>window.scrollTo({top:0,behavior:"auto"}))}}
const o44=new MutationObserver(bootV44);o44.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV44);
function stampV44(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v44 · RELEASE CANDIDATE</span>")}queueMicrotask(stampV44);

// Broadcast Finish v45 — restrained stadium depth and readable status hierarchy.
function broadcastFinishV45(){
 document.querySelectorAll(".route-hero,.platform-hero-v22,.game-center-v28").forEach(x=>{if(!x.querySelector(":scope > .v45-light"))x.insertAdjacentHTML("afterbegin",'<span class="v45-light" aria-hidden="true"></span>')});
 document.querySelectorAll(".badge").forEach(x=>{const t=(x.textContent||"").toLowerCase();x.classList.toggle("v45-live",/live|open|ready|free/.test(t));x.classList.toggle("v45-warn",/missing|lock|pending/.test(t))});
}
function bootV45(){broadcastFinishV45()}const o45=new MutationObserver(bootV45);o45.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV45);
function stampV45(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v45 · BROADCAST FINISH</span>")}queueMicrotask(stampV45);

// Final Flow Guard v46 — keep primary actions reachable and prevent stale overlays between routes.
function finalFlowGuardV46(){
 const view=document.documentElement.dataset.view||"home";
 document.querySelectorAll('[aria-modal="true"]').forEach(m=>{if(m.offsetParent===null)m.remove()});
 document.querySelectorAll(".finish-dock-v26 button,.game-center-v28 button").forEach(b=>{if(!b.getAttribute("aria-label")){const t=(b.textContent||"").replace(/\s+/g," ").trim();if(t)b.setAttribute("aria-label",t)}});
 document.body.classList.toggle("v46-game-context",/picks|results|pool|commissioner|admin/.test(view));
}
function bootV46(){finalFlowGuardV46()}const o46=new MutationObserver(bootV46);o46.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV46);
function stampV46(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v46 · FINAL FLOW GUARD</span>")}queueMicrotask(stampV46);

// Reveal Readiness v47 — stable visual viewport, safe-area finish and last-route continuity.
function revealReadyV47(){
 const v=document.documentElement.dataset.view||"home";try{sessionStorage.setItem("links-last-view-v47",v)}catch{}
 document.querySelectorAll("img").forEach(i=>{if(!i.hasAttribute("draggable"))i.draggable=false});
 document.querySelectorAll("button").forEach(b=>{if(!b.hasAttribute("type"))b.type="button"});
}
function bootV47(){revealReadyV47()}const o47=new MutationObserver(bootV47);o47.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV47);
function stampV47(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v47 · REVEAL READINESS</span>")}queueMicrotask(stampV47);

// Production Feel v48 — consistent status announcements and no accidental empty actions.
function productionFeelV48(){
 let live=document.querySelector("#links-status-v48");if(!live){live=document.createElement("div");live.id="links-status-v48";live.className="sr-only-v48";live.setAttribute("aria-live","polite");document.body.appendChild(live)}
 document.querySelectorAll("button").forEach(b=>{if(b.dataset.v48)return;b.dataset.v48="1";if(!(b.textContent||"").trim()&&!b.getAttribute("aria-label")){b.setAttribute("aria-label","LINKS action")}});
}
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const live=document.querySelector("#links-status-v48");if(live&&/save|submit|invite|send/i.test(b.textContent||"")){live.textContent=(b.textContent||"Action")+" selected"}},true);
function bootV48(){productionFeelV48()}const o48=new MutationObserver(bootV48);o48.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV48);
function stampV48(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v48 · PRODUCTION FEEL</span>")}queueMicrotask(stampV48);

// LINKS Email System v49 — one premium voice for every player/commissioner touchpoint.
const LinksEmailV49={
 shell({eyebrow="LINKS",title,body,cta="OPEN LINKS",url="#",detail=""}){return `<!doctype html><html><body style="margin:0;background:#050908;font-family:Arial,sans-serif;color:#f5f7f6"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050908;padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#0b100e;border:1px solid #26302b;border-radius:18px;overflow:hidden"><tr><td style="height:5px;background:#f17521"></td></tr><tr><td style="padding:30px"><div style="font-size:24px;font-weight:900;letter-spacing:3px">LINKS</div><div style="margin-top:5px;color:#f17521;font-size:11px;font-weight:800;letter-spacing:2px">${eyebrow}</div><h1 style="font-size:27px;line-height:1.08;margin:24px 0 12px">${title}</h1><div style="color:#b7c0bc;font-size:16px;line-height:1.55">${body}</div>${detail?`<div style="margin:22px 0;padding:16px;background:#101713;border:1px solid #26302b;border-radius:12px;color:#e7ebe9;font-size:14px;line-height:1.5">${detail}</div>`:""}<div style="margin:26px 0"><a href="${url}" style="display:inline-block;background:#f17521;color:#090b0a;text-decoration:none;font-weight:900;padding:14px 20px;border-radius:10px">${cta} ›</a></div><div style="border-top:1px solid #222b27;padding-top:18px;color:#737e79;font-size:12px;line-height:1.5">LINKS · You pick. We track. You win.<br>Pool play is free.</div></td></tr></table></td></tr></table></body></html>`},
 invite({pool="Your Pool",commissioner="Your commissioner",url="#" }={}){return this.shell({eyebrow:"POOL INVITATION",title:`You’re invited to ${pool}.`,body:`${commissioner} invited you to join a LINKS pool. Open the invitation and you’ll land in the right pool—no searching or guessing.`,cta:"JOIN POOL",url,detail:"Your picks, standings, live scores and pool updates stay together in LINKS."})},
 welcome({name="Player",pool="Your Pool",url="#"}={}){return this.shell({eyebrow:"WELCOME TO LINKS",title:`You’re in, ${name}.`,body:`Your spot in ${pool} is ready. Open LINKS to see the current slate, make your picks and follow the action.`,cta:"OPEN MY POOL",url})},
 picksReminder({pool="Your Pool",deadline="the posted deadline",url="#"}={}){return this.shell({eyebrow:"PICKS REMINDER",title:"Your picks still need attention.",body:`You have picks left to finish in ${pool}. Get them in before ${deadline}.`,cta:"FINISH MY PICKS",url,detail:`Deadline: ${deadline}`})},
 picksSaved({pool="Your Pool",week="This week",url="#"}={}){return this.shell({eyebrow:"PICKS CONFIRMED",title:"Your picks are saved.",body:`You’re set for ${week} in ${pool}. Come back for live scores, compare picks and results.`,cta:"VIEW MY PICKS",url})},
 announcement({pool="Your Pool",subject="Pool update",message="There’s a new update from your commissioner.",url="#"}={}){return this.shell({eyebrow:pool.toUpperCase(),title:subject,body:message,cta:"OPEN POOL",url})},
 reset({url="#"}={}){return this.shell({eyebrow:"ACCOUNT SECURITY",title:"Reset your LINKS password.",body:"Use the secure button below to choose a new password. If you didn’t request this, you can ignore this email.",cta:"RESET PASSWORD",url})},
 weekOpen({pool="Your Pool",week="The new slate",deadline="the posted deadline",url="#"}={}){return this.shell({eyebrow:"PICKS ARE OPEN",title:`${week} is ready.`,body:`Picks are open in ${pool}. Make your selections before ${deadline}.`,cta:"MAKE MY PICKS",url,detail:`Lock time: ${deadline}`})},
 results({pool="Your Pool",week="This week",url="#"}={}){return this.shell({eyebrow:"FINAL RESULTS",title:`${week} is final.`,body:`Results and standings for ${pool} are ready. Open LINKS to see where everything landed.`,cta:"VIEW RESULTS",url})}
};
window.LinksEmailV49=LinksEmailV49;
function stampV49(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v49 · EMAIL SYSTEM</span>")}queueMicrotask(stampV49);

// Stadium Mail v50 — email-safe stadium header treatment without sacrificing deliverability.
if(window.LinksEmailV49){
 LinksEmailV49.shell=function({eyebrow="LINKS",title,body,cta="OPEN LINKS",url="#",detail=""}){
 return `<!doctype html><html><body style="margin:0;background:#050908;font-family:Arial,sans-serif;color:#f5f7f6"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050908;padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#0b100e;border:1px solid #26302b;border-radius:18px;overflow:hidden"><tr><td style="height:5px;background:#f17521"></td></tr><tr><td style="padding:0;background:#09100c"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:25px 12px 10px;color:#66736d;font-size:12px;letter-spacing:8px">✦ &nbsp; ✦ &nbsp; ✦ &nbsp; ✦ &nbsp; ✦</td></tr><tr><td align="center" style="padding:0 24px 25px"><div style="font-size:30px;font-weight:900;letter-spacing:5px;color:#fff">LINKS</div><div style="margin-top:8px;color:#f17521;font-size:11px;font-weight:800;letter-spacing:2px">${eyebrow}</div><div style="margin:18px auto 0;width:74%;height:1px;background:#26372e"></div><div style="margin:0 auto;width:54%;height:14px;border-left:1px solid #26372e;border-right:1px solid #26372e;border-bottom:1px solid #26372e"></div></td></tr></table></td></tr><tr><td style="padding:28px 30px 30px"><h1 style="font-size:27px;line-height:1.08;margin:0 0 12px;color:#fff">${title}</h1><div style="color:#b7c0bc;font-size:16px;line-height:1.55">${body}</div>${detail?`<div style="margin:22px 0;padding:16px;background:#101713;border:1px solid #26302b;border-radius:12px;color:#e7ebe9;font-size:14px;line-height:1.5">${detail}</div>`:""}<div style="margin:26px 0"><a href="${url}" style="display:inline-block;background:#f17521;color:#090b0a;text-decoration:none;font-weight:900;padding:14px 20px;border-radius:10px">${cta} ›</a></div><div style="border-top:1px solid #222b27;padding-top:18px;color:#737e79;font-size:12px;line-height:1.5">LINKS · You pick. We track. You win.<br>Pool play is free.</div></td></tr></table></td></tr></table></body></html>`}
}
function stampV50(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v50 · REVIEW READY</span>")}queueMicrotask(stampV50);

// Review Candidate v51 — final presentation guardrails.
function reviewCandidateV51(){
 document.querySelectorAll("a[href='#']").forEach(a=>{a.setAttribute("role","button");a.setAttribute("aria-disabled","true");a.removeAttribute("href");});
 document.querySelectorAll("[data-copy-invite]").forEach(b=>{if(b.dataset.v51)return;b.dataset.v51="1";b.addEventListener("click",()=>{const old=b.textContent;b.textContent="COPIED ✓";setTimeout(()=>b.textContent=old,1400)})});
 document.querySelectorAll(".route-workspace,.platform-hero-v22,.game-center-v28").forEach(x=>x.classList.add("v51-reviewed"));
}
function bootV51(){reviewCandidateV51()}const o51=new MutationObserver(bootV51);o51.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV51);
function stampV51(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v51 · REVIEW CANDIDATE</span>")}queueMicrotask(stampV51);

// Review Lock v52 — keep the reveal clean and predictable.
function reviewLockV52(){
 document.querySelectorAll("input,textarea,select").forEach(el=>{if(!el.dataset.v52){el.dataset.v52="1";el.addEventListener("focus",()=>el.closest(".card,.panel,form")?.classList.add("v52-focus"));el.addEventListener("blur",()=>el.closest(".card,.panel,form")?.classList.remove("v52-focus"))}});
 document.querySelectorAll("button").forEach(b=>{if(!b.dataset.v52){b.dataset.v52="1";b.addEventListener("pointerup",()=>{b.classList.add("v52-hit");setTimeout(()=>b.classList.remove("v52-hit"),180)})}});
}
function bootV52(){reviewLockV52()}const o52=new MutationObserver(bootV52);o52.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV52);
function stampV52(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v52 · REVIEW LOCK</span>")}queueMicrotask(stampV52);

// Review Finish v53 — normalize actionable controls and final mobile behavior.
function reviewFinishV53(){
 document.querySelectorAll("button").forEach(b=>{if(!b.hasAttribute("type"))b.type="button";if(b.disabled)b.setAttribute("aria-disabled","true")});
 document.querySelectorAll("a[target='_blank']").forEach(a=>a.rel="noopener noreferrer");
 document.querySelectorAll("img:not([alt])").forEach(i=>i.alt="");
}
function bootV53(){reviewFinishV53()}const o53=new MutationObserver(bootV53);o53.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV53);
function stampV53(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v53 · REVIEW FINISH</span>")}queueMicrotask(stampV53);

// Signature Finish v54 — restrained stadium signature across primary experiences.
function signatureFinishV54(){
 document.querySelectorAll(".route-hero,.platform-hero-v22,.game-center-v28,.comm-tools-v30").forEach(x=>{if(!x.querySelector(":scope > .v54-signature"))x.insertAdjacentHTML("beforeend",'<span class="v54-signature" aria-hidden="true"></span>')});
}
function bootV54(){signatureFinishV54()}const o54=new MutationObserver(bootV54);o54.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV54);
function stampV54(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v54 · SIGNATURE FINISH</span>")}queueMicrotask(stampV54);

// Final Review v55 — preserve scroll quality and clarify loading/action state.
function finalReviewV55(){
 document.querySelectorAll("button").forEach(b=>{if(!b.dataset.v55){b.dataset.v55="1";b.addEventListener("click",()=>{if(b.disabled)return;b.setAttribute("data-last-action",Date.now())})}});
 document.querySelectorAll("[aria-busy='true']").forEach(x=>x.classList.add("v55-busy"));
}
function bootV55(){finalReviewV55()}const o55=new MutationObserver(bootV55);o55.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV55);
function stampV55(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v55 · FINAL REVIEW</span>")}queueMicrotask(stampV55);

// Presentation Lock v56 — final visual state tagging for review.
function presentationLockV56(){
 document.body.classList.add("links-review-v56");
 document.querySelectorAll(".route-workspace").forEach(w=>w.setAttribute("data-review-ready","true"));
}
function bootV56(){presentationLockV56()}const o56=new MutationObserver(bootV56);o56.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV56);
function stampV56(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v56 · PRESENTATION LOCK</span>")}queueMicrotask(stampV56);

// Functional QA v57 — duplicate declaration removed after full-file syntax audit.
function stampV57(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v57 · FUNCTIONAL QA</span>")}queueMicrotask(stampV57);

// Product Integrity v58 — preview data is explicitly labeled and never presented as live.
function productIntegrityV58(){
 document.querySelectorAll(".card,.panel,article").forEach(x=>{const t=(x.textContent||"");if(/illustrative data|preview research|sample data/i.test(t)){x.dataset.preview="true";if(!x.querySelector(":scope > .v58-preview"))x.insertAdjacentHTML("afterbegin",'<span class="v58-preview">PREVIEW DATA</span>')}});
}
function bootV58(){productIntegrityV58()}const o58=new MutationObserver(bootV58);o58.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(bootV58);
function stampV58(){document.querySelectorAll(".app-build-v18").forEach(x=>x.innerHTML="<b>LINKS</b><span>NEW BUILD · v58 · PRODUCT INTEGRITY</span>")}queueMicrotask(stampV58);

// Release Stabilization v60 — one guarded finalizer for persistent release state.
function releaseFinalizeV60(){
 const root=document.querySelector("#app"); if(!root)return;
 document.body.classList.add("links-release-v60");
 document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v60 · RELEASE STABILIZATION</span>";if(x.innerHTML!==html)x.innerHTML=html});
 document.querySelectorAll("a[target='_blank']").forEach(a=>a.rel="noopener noreferrer");
 document.querySelectorAll("button:not([type])").forEach(b=>b.type="button");
}
queueMicrotask(releaseFinalizeV60);

// Email Safety v61 — escape dynamic content and reject unsafe CTA protocols.
if(window.LinksEmailV49){
 const emailEsc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
 const emailUrl=v=>{try{const u=new URL(String(v||"#"),location.href);return /^(https?:)$/.test(u.protocol)?emailEsc(u.href):"#"}catch{return "#"}};
 const stadiumShell=LinksEmailV49.shell;
 LinksEmailV49.shell=function({eyebrow="LINKS",title="",body="",cta="OPEN LINKS",url="#",detail=""}={}){
   return stadiumShell.call(this,{eyebrow:emailEsc(eyebrow),title:emailEsc(title),body:emailEsc(body),cta:emailEsc(cta),url:emailUrl(url),detail:emailEsc(detail)});
 };
}
function stampV61(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v61 · EMAIL SAFETY</span>";if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(stampV61);

// Asset Readiness v62 — splash audio degrades cleanly until the production asset is present.
function assetReadinessV62(){
 const audio=document.querySelector("audio[src*='stadium-rumble.mp3']");
 if(audio&&!audio.dataset.v62){
  audio.dataset.v62="1";
  audio.addEventListener("error",()=>{document.documentElement.classList.add("links-audio-unavailable");document.querySelectorAll("[data-splash-sound],.splash-sound,.sound-toggle").forEach(b=>{b.hidden=true;b.setAttribute("aria-hidden","true")})},{once:true});
  audio.addEventListener("canplay",()=>document.documentElement.classList.remove("links-audio-unavailable"),{once:true});
 }
}
queueMicrotask(assetReadinessV62);

function stampV62(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v62 · ASSET READINESS</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV62);

// Flow Completion v63 — persist the last meaningful destination so returning players resume naturally.
const LinksResumeV63={
 key:"links-resume-v63",
 save(view,pool=""){if(!view||["home","public-home"].includes(view))return;try{localStorage.setItem(this.key,JSON.stringify({view,pool,at:Date.now()}))}catch{}},
 get(){try{const x=JSON.parse(localStorage.getItem(this.key)||"null");return x&&Date.now()-x.at<1000*60*60*24*30?x:null}catch{return null}}
};
document.addEventListener("click",e=>{const b=e.target.closest("[data-route],[data-route-action],[data-pool]");if(!b)return;const view=b.dataset.route||b.dataset.routeAction||"";const pool=b.dataset.pool||new URL(location.href).searchParams.get("pool")||"";LinksResumeV63.save(view,pool)},true);
window.addEventListener("links:picksaved",()=>LinksResumeV63.save("my-picks",new URL(location.href).searchParams.get("pool")||""));
window.LinksResumeV63=LinksResumeV63;
function stampV63(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v63 · FLOW COMPLETION</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV63);

// Game Network Completion v64 — every advertised game starts a real setup flow, never an informational dead end.
function gameNetworkCompletionV64(){
 document.querySelectorAll("[data-network-game]").forEach(b=>{
  if(b.dataset.v64)return;b.dataset.v64="1";
  b.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();CreatePoolStudio.open(b.dataset.networkGame)},true);
 });
}
queueMicrotask(gameNetworkCompletionV64);

function stampV64(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v64 · GAME NETWORK COMPLETION</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV64);

// Game Completeness v65 — unsupported formats never fall through to an NFL pick card.
const LinksFormatSupportV65=new Set(["football","college","survivor","confidence","game33","squares","bracket"]);
function formatSupportV65(){
 if(document.documentElement.dataset.view!=="pool")return;
 const pool=document.documentElement.dataset.pool||"",p=PoolHubData[pool];if(!p)return;
 const type=gameIdentity(p.game||"").type;if(LinksFormatSupportV65.has(type))return;
 const live=document.querySelector(".pool-tab-live");if(!live||live.dataset.v65)return;live.dataset.v65="1";
 live.innerHTML='<div class="hub-panel-head"><span>'+linksEscape(p.game||"LINKS GAME")+'</span><h3>Game setup required.</h3><p>This format will not borrow NFL picks or scoring. Commissioner setup must provide the game-specific slate, rules and scoring before player picks open.</p></div><div class="links-empty picks"><i>◆</i><h3>WAITING FOR GAME SETUP</h3><p>Your commissioner controls this game’s slate and opening state.</p></div>';
}
queueMicrotask(formatSupportV65);

function stampV65(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v65 · GAME COMPLETENESS</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV65);

// AI Multi-Sport Flow v66 — make sport selection change the research board instead of only changing a label.
const AISportPreviewV66={
 NFL:[["BUF @ MIA","BUF · MONEYLINE","-145",59],["DAL @ NYG","OVER 45.5","-110",53],["PHI @ TB","PHI · TEAM TD 1+","-180",64]],
 NBA:[["BOS @ MIA","BOS · MONEYLINE","-135",57],["LAL @ PHX","OVER 224.5","-110",54],["NYK @ CLE","NYK +4.5","-108",53]],
 MLB:[["ATL @ NYM","ATL · MONEYLINE","-125",56],["NYY @ BOS","OVER 8.5","-105",52],["LAD @ SD","LAD -1.5","+120",48]],
 NHL:[["EDM @ CGY","EDM · MONEYLINE","-130",57],["NYR @ BOS","OVER 5.5","-115",54],["TOR @ OTT","TOR +1.5","-175",63]],
 NCAAF:[["TENN @ UGA","TENN · MONEYLINE","+135",45],["UGA @ AUB","UGA -6.5","-110",54],["ALA @ LSU","OVER 51.5","-108",53]],
 NCAAB:[["DUKE @ UNC","DUKE · MONEYLINE","-120",55],["UK @ TENN","UNDER 149.5","-110",53],["KU @ BAY","BAY +3.5","-105",52]],
 SOCCER:[["ARSENAL @ CHELSEA","ARSENAL · DRAW NO BET","-125",56],["LIVERPOOL @ CITY","OVER 2.5 GOALS","-120",55],["INTER @ MILAN","BOTH TEAMS TO SCORE","-115",54]],
 MMA:[["MAIN EVENT","FIGHTER A · MONEYLINE","-140",58],["CO-MAIN","FIGHT GOES THE DISTANCE","+110",49],["FEATURED BOUT","FIGHTER B · BY DECISION","+175",38]],
 TENNIS:[["TOUR MATCH","PLAYER A · MATCH WINNER","-135",57],["TOUR MATCH","OVER 22.5 GAMES","-110",53],["TOUR MATCH","PLAYER B +1.5 SETS","-160",61]],
 GOLF:[["TOURNAMENT","PLAYER A · TOP 10","+180",36],["TOURNAMENT","PLAYER B · MATCHUP WINNER","-115",54],["TOURNAMENT","PLAYER C · TOP 20","+105",49]],
 WNBA:[["NY @ LV","NY · MONEYLINE","-130",57],["IND @ PHX","OVER 163.5","-110",53],["MIN @ SEA","PLAYER POINTS OVER","-105",52]]
};
let aiSportV66="NFL";
function applyAISportV66(sport){
 const rows=AISportPreviewV66[sport]||AISportPreviewV66.NFL;aiSportV66=sport;
 AIStudio.legs=rows.map((x,i)=>({id:"v66-"+sport.toLowerCase()+"-"+i,game:x[0],pick:x[1],price:x[2],prob:x[3],trend:"Preview research sample",why:"Illustrative "+sport+" research candidate. Verify current market data before acting.",corr:"CHECK"}));
 AIStudio.save([]);const h=document.querySelector("#aiStudioMount");if(!h)return;h.innerHTML=AIStudio.html();AIStudio.wire(h);h.insertAdjacentHTML("afterbegin",aiPlanStrip());h.insertAdjacentHTML("beforeend",sportsbookHandoffV22());h.querySelector(".ai-studio-v19")?.insertAdjacentHTML("afterbegin",multiSportBar());h.querySelectorAll("[data-ai-sport]").forEach(b=>b.classList.toggle("active",b.dataset.aiSport===sport));
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-ai-sport]");if(!b)return;e.preventDefault();e.stopImmediatePropagation();applyAISportV66(b.dataset.aiSport);AppStatus.show("ok",b.dataset.aiSport+" selected","Research board switched to "+b.dataset.aiSport+".")},true);
function stampV66(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v66 · AI MULTI-SPORT FLOW</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV66);

// AI Card Continuity v67 — keep each sport's research card independent while switching sports.
const AISportCardsV67={key:"links-ai-sport-cards-v67",read(){try{return JSON.parse(localStorage.getItem(this.key)||"{}")}catch{return{}}},get(s){return this.read()[s]||[]},set(s,ids){const x=this.read();x[s]=ids;localStorage.setItem(this.key,JSON.stringify(x))}};
const aiBaseSaveV67=AIStudio.save.bind(AIStudio);
AIStudio.save=function(ids){aiBaseSaveV67(ids);AISportCardsV67.set(aiSportV66,ids)};
const applyAISportBaseV67=applyAISportV66;
applyAISportV66=function(sport){
 const rows=AISportPreviewV66[sport]||AISportPreviewV66.NFL;aiSportV66=sport;
 AIStudio.legs=rows.map((x,i)=>({id:"v66-"+sport.toLowerCase()+"-"+i,game:x[0],pick:x[1],price:x[2],prob:x[3],trend:"Preview research sample",why:"Illustrative "+sport+" research candidate. Verify current market data before acting.",corr:"CHECK"}));
 aiBaseSaveV67(AISportCardsV67.get(sport));
 const h=document.querySelector("#aiStudioMount");if(!h)return;h.innerHTML=AIStudio.html();AIStudio.wire(h);h.insertAdjacentHTML("afterbegin",aiPlanStrip());h.insertAdjacentHTML("beforeend",sportsbookHandoffV22());h.querySelector(".ai-studio-v19")?.insertAdjacentHTML("afterbegin",multiSportBar());h.querySelectorAll("[data-ai-sport]").forEach(b=>b.classList.toggle("active",b.dataset.aiSport===sport));
};
function stampV67(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v67 · AI CARD CONTINUITY</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV67);

// AI Stadium Sports v68 — sport-specific stadium identity without external image dependencies.
const AISportVisualV68={NFL:["🏈","PRO FOOTBALL"],NCAAF:["🏈","COLLEGE FOOTBALL"],NBA:["🏀","PRO BASKETBALL"],WNBA:["🏀","WOMEN'S BASKETBALL"],NCAAB:["🏀","COLLEGE BASKETBALL"],MLB:["⚾","BASEBALL"],NHL:["●","HOCKEY"],SOCCER:["⚽","SOCCER"],MMA:["🥊","MMA"],TENNIS:["●","TENNIS"],GOLF:["●","GOLF"]};
function aiStadiumVisualV68(){
 const h=document.querySelector("#aiStudioMount .ai-studio-v19");if(!h)return;let v=h.querySelector(".ai-stadium-v68");const [mark,label]=AISportVisualV68[aiSportV66]||AISportVisualV68.NFL;
 if(!v){h.insertAdjacentHTML("afterbegin",'<div class="ai-stadium-v68"><div class="aiv-lights"><i></i><i></i><i></i><i></i></div><div class="aiv-field"></div><div class="aiv-sport"><strong></strong><span></span><b>LINKS AI</b></div></div>');v=h.querySelector(".ai-stadium-v68")}
 v.dataset.sport=aiSportV66;v.querySelector("strong").textContent=mark;v.querySelector("span").textContent=label;
}
document.addEventListener("click",e=>{if(e.target.closest("[data-ai-sport]"))setTimeout(aiStadiumVisualV68,0)},true);
document.addEventListener("click",e=>{if(e.target.closest("[data-ai],[data-ai-studio],[data-ai-card],[data-parlay]"))setTimeout(aiStadiumVisualV68,0)},true);
function stampV68(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v68 · AI STADIUM SPORTS</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV68);

// AI Flow Finish v69 — sport-aware review/share and clear research workflow.
function aiSportSummaryV69(){
 const ids=AIStudio.load(),legs=AIStudio.legs.filter(x=>ids.includes(x.id));
 return {sport:aiSportV66,ids,legs,calc:AIStudio.combined(ids)};
}
cardShareText=function(){
 const x=aiSportSummaryV69();return "My LINKS "+x.sport+" research card\n"+x.legs.map(l=>"• "+l.pick+" ("+l.price+")").join("\n")+"\n\nBuilt with LINKS AI — preview research only; verify current lines and availability.";
};
function aiFlowFinishV69(){
 const h=document.querySelector("#aiStudioMount");if(!h)return;
 const studio=h.querySelector(".ai-studio-v19");if(!studio||studio.querySelector(".ai-flow-v69"))return;
 const board=studio.querySelector(".ais-layout");board?.insertAdjacentHTML("beforebegin",'<div class="ai-flow-v69"><span class="active"><b>1</b>CHOOSE SPORT</span><i></i><span class="active"><b>2</b>RESEARCH</span><i></i><span><b>3</b>BUILD CARD</span><i></i><span><b>4</b>REVIEW / SHARE</span></div>');
}
document.addEventListener("click",e=>{if(e.target.closest("[data-ai-sport],[data-ai-leg]"))setTimeout(aiFlowFinishV69,0)},true);
document.addEventListener("click",e=>{if(e.target.closest("[data-ai],[data-ai-studio],[data-ai-card],[data-parlay]"))setTimeout(aiFlowFinishV69,0)},true);
function stampV69(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v69 · AI FLOW FINISH</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV69);

// Cross-Sport Card v70 — one LINKS card can contain legs from multiple sports.
const AIMixV70={key:"links-ai-mix-v70",read(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch{return[]}},write(x){localStorage.setItem(this.key,JSON.stringify(x.slice(0,12)))},add(sport,leg){let x=this.read();const k=sport+"|"+leg.id;x=x.filter(v=>v.key!==k);x.push({key:k,sport,game:leg.game,pick:leg.pick,price:leg.price,prob:leg.prob});this.write(x);return x},remove(k){this.write(this.read().filter(x=>x.key!==k))},clear(){this.write([])}};
function mixedCardMathV70(rows){const dec=rows.reduce((a,x)=>a*AIStudio.decimal(x.price),1);return {american:rows.length?(dec>=2?Math.round((dec-1)*100):Math.round(-100/(dec-1))):0};}
function mixedCardPanelV70(){
 const rows=AIMixV70.read(),calc=mixedCardMathV70(rows);
 return '<div class="ai-mix-v70"><div><span>MULTI-SPORT CARD</span><b>'+rows.length+' LEGS · '+new Set(rows.map(x=>x.sport)).size+' SPORTS</b><small>Mix football, college, basketball, hockey, MMA, baseball, soccer and more on one research card.</small></div>'+rows.map(x=>'<button data-mix-remove="'+linksEscape(x.key)+'"><em>'+linksEscape(x.sport)+'</em><b>'+linksEscape(x.pick)+'</b><span>'+linksEscape(x.price)+'</span><i>×</i></button>').join("")+'<footer><strong>'+(rows.length?((calc.american>0?"+":"")+calc.american):"—")+'</strong><button data-mix-clear '+(!rows.length?"disabled":"")+'>CLEAR</button></footer></div>';
}
function mountMixedCardV70(){const h=document.querySelector("#aiStudioMount");if(!h)return;h.querySelector(".ai-mix-v70")?.remove();h.querySelector(".ai-studio-v19")?.insertAdjacentHTML("beforeend",mixedCardPanelV70())}
document.addEventListener("click",e=>{
 const leg=e.target.closest("[data-ai-leg]");if(leg){setTimeout(()=>{const x=AIStudio.legs.find(v=>v.id===leg.dataset.aiLeg);if(x&&leg.classList.contains("selected"))AIMixV70.add(aiSportV66,x);else if(x)AIMixV70.remove(aiSportV66+"|"+x.id);mountMixedCardV70()},0);return}
 const rm=e.target.closest("[data-mix-remove]");if(rm){e.preventDefault();AIMixV70.remove(rm.dataset.mixRemove);mountMixedCardV70();return}
 if(e.target.closest("[data-mix-clear]")){e.preventDefault();AIMixV70.clear();mountMixedCardV70()}
},true);
document.addEventListener("click",e=>{if(e.target.closest("[data-ai-sport],[data-ai],[data-ai-studio],[data-ai-card],[data-parlay]"))setTimeout(mountMixedCardV70,0)},true);
cardShareText=function(){const rows=AIMixV70.read();if(rows.length)return "My LINKS multi-sport research card\n"+rows.map(x=>"• ["+x.sport+"] "+x.pick+" ("+x.price+")").join("\n")+"\n\nBuilt with LINKS AI — preview research only; verify current lines and availability.";const x=aiSportSummaryV69();return "My LINKS "+x.sport+" research card\n"+x.legs.map(l=>"• "+l.pick+" ("+l.price+")").join("\n")+"\n\nBuilt with LINKS AI — preview research only; verify current lines and availability."};
function stampV70(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v70 · MULTI-SPORT CARD</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV70);

// Affiliate Architecture v70 — one configuration layer for approved sportsbook/partner handoffs.
const LinksAffiliateV70={partners:{draftkings:{name:"DraftKings",base:"https://sportsbook.draftkings.com/",affiliate:"",enabled:true},fanduel:{name:"FanDuel",base:"https://sportsbook.fanduel.com/",affiliate:"",enabled:true},bet365:{name:"bet365",base:"https://www.bet365.com/",affiliate:"",enabled:true}},url(id){const p=this.partners[id];if(!p||!p.enabled)return"";return p.affiliate||p.base},configure(id,{affiliate="",enabled=true}={}){if(!this.partners[id])return false;this.partners[id].affiliate=affiliate;this.partners[id].enabled=enabled;return true},track(id,placement="ai-card"){try{const key="links-affiliate-events-v70",a=JSON.parse(localStorage.getItem(key)||"[]");a.unshift({partner:id,placement,sport:aiSportV66,at:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(a.slice(0,100)))}catch{}}};window.LinksAffiliate=LinksAffiliateV70;
document.addEventListener("click",e=>{const b=e.target.closest("[data-book]");if(!b)return;const url=LinksAffiliateV70.url(b.dataset.book);if(!url)return;LinksAffiliateV70.track(b.dataset.book);setTimeout(()=>{const go=document.querySelector("[data-book-go]");if(go)go.dataset.bookGo=url},0)},true);
function stampV70(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v70 · AFFILIATE READY</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV70);

// Mixed Card UX v71 — persistent dock keeps the all-sports card visible while researching.
function mixDockV71(){
 const h=document.querySelector("#aiStudioMount"),rows=AIMixV70.read();if(!h)return;h.querySelector(".ai-mix-dock-v71")?.remove();
 if(!rows.length)return;const sports=[...new Set(rows.map(x=>x.sport))];
 h.insertAdjacentHTML("beforeend",'<div class="ai-mix-dock-v71"><div><span>MULTI-SPORT CARD</span><b>'+rows.length+' LEG'+(rows.length===1?"":"S")+'</b><small>'+sports.join(" · ")+'</small></div><button data-mix-review-v71>REVIEW CARD ›</button></div>');
}
function mixReviewV71(){
 const rows=AIMixV70.read(),calc=mixedCardMathV70(rows);if(!rows.length)return;
 modal("REVIEW MULTI-SPORT CARD",'<div class="ai-review-v19 mix-review-v71"><span>LINKS AI · '+new Set(rows.map(x=>x.sport)).size+' SPORTS</span><h3>'+rows.length+'-leg research card</h3>'+rows.map(x=>'<div class="mix-review-leg"><em>'+linksEscape(x.sport)+'</em><b>'+linksEscape(x.pick)+'</b><span>'+linksEscape(x.price)+'</span></div>').join("")+'<div><b>COMBINED PRICE</b><strong>'+(calc.american>0?"+":"")+calc.american+'</strong></div><small>Research preview only. Current markets, prices and availability must be verified with the provider. Combined math does not account for correlation.</small><button data-share-card>SHARE CARD</button></div>');
}
document.addEventListener("click",e=>{if(e.target.closest("[data-ai-leg],[data-mix-remove],[data-mix-clear],[data-ai-sport]"))setTimeout(mixDockV71,0);if(e.target.closest("[data-mix-review-v71]")){e.preventDefault();mixReviewV71()}},true);
document.addEventListener("click",e=>{if(e.target.closest("[data-ai],[data-ai-studio],[data-ai-card],[data-parlay]"))setTimeout(mixDockV71,0)},true);
function stampV71(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v71 · MULTI-SPORT CARD DOCK</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV71);

// Release Stability v72 — final stamp stays one-shot; older stamp observers were consolidated.
function stampV72(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v72 · RELEASE STABILITY</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV72);

// Confidence Engine v73 — persist team + unique rank and validate the card.
const ConfidenceStoreV73={key:"links-confidence-v73",read(pool){try{return JSON.parse(localStorage.getItem(this.key+"-"+pool)||"{}")}catch{return{}}},write(pool,x){localStorage.setItem(this.key+"-"+pool,JSON.stringify(x))},set(pool,id,patch){const x=this.read(pool);x[id]={...(x[id]||{}),...patch};this.write(pool,x);PickEngine.save(pool+"-confidence-"+id,x[id]);return x}};
document.addEventListener("click",e=>{const b=e.target.closest("[data-confidence-team]");if(!b)return;e.preventDefault();e.stopImmediatePropagation();const pool=document.documentElement.dataset.pool||"";if(!WeekGate.isOpen()){AppStatus.show("warn","Week is closed","The commissioner has paused pick changes.");return}ConfidenceStoreV73.set(pool,b.dataset.confidenceGame,{team:b.dataset.confidenceTeam});const live=b.closest(".pool-tab-live");if(live){live.innerHTML=gameSpecificPickPanel(pool);live.dataset.adapter="1"}},true);
document.addEventListener("change",e=>{const s=e.target.closest("[data-confidence-rank]");if(!s)return;const pool=document.documentElement.dataset.pool||"",x=ConfidenceStoreV73.read(pool),rank=s.value;if(rank&&Object.entries(x).some(([id,v])=>id!==s.dataset.confidenceRank&&String(v.rank)===rank)){s.value="";AppStatus.show("warn","Rank already used","Each confidence number can only be used once.");return}ConfidenceStoreV73.set(pool,s.dataset.confidenceRank,{rank});const live=s.closest(".pool-tab-live");if(live){live.innerHTML=gameSpecificPickPanel(pool);live.dataset.adapter="1"}},true);
function stampV73(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v73 · CONFIDENCE ENGINE</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV73);

// Game 33 Engine v74 — real weekly selection persistence + lock behavior.
const Game33StoreV74={key:"links-game33-v74",read(pool){try{return JSON.parse(localStorage.getItem(this.key+"-"+pool)||"{}")}catch{return{}}},save(pool,team){const x={team,week:PoolHubData[pool]?.week||"",savedAt:Date.now()};localStorage.setItem(this.key+"-"+pool,JSON.stringify(x));return x}};
document.addEventListener("click",e=>{const b=e.target.closest("[data-g33-team]");if(!b)return;e.preventDefault();e.stopImmediatePropagation();const pool=document.documentElement.dataset.pool||"";if(!WeekGate.isOpen()){AppStatus.show("warn","Week is closed","Game 33 selections are locked.");return}Game33StoreV74.save(pool,b.dataset.g33Team);AppStatus.show("ok","Game 33 pick saved",b.dataset.g33Team);const live=b.closest(".pool-tab-live");if(live){live.innerHTML=gameSpecificPickPanel(pool);live.dataset.adapter="1"}},true);
function stampV74(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v74 · GAME 33 ENGINE</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV74);

// Squares Engine v75 — persistent 10x10 ownership grid with lock-safe claiming.
const SquaresStoreV75={key:"links-squares-v75",read(pool){try{return JSON.parse(localStorage.getItem(this.key+"-"+pool)||'{"claimed":{},"revealed":false}')}catch{return{claimed:{},revealed:false}}},write(pool,x){localStorage.setItem(this.key+"-"+pool,JSON.stringify(x))},claim(pool,n){const x=this.read(pool);x.claimed=x.claimed||{};if(x.claimed[n])return false;const who=(window.LinksSession?.playerName||window.LinksSession?.name||"YOU");x.claimed[n]=who;this.write(pool,x);return true}};
document.addEventListener("click",e=>{const b=e.target.closest("[data-square-v75]");if(!b)return;e.preventDefault();e.stopImmediatePropagation();const pool=document.documentElement.dataset.pool||"";if(!WeekGate.isOpen()){AppStatus.show("warn","Grid is locked","Squares can no longer be claimed.");return}if(!SquaresStoreV75.claim(pool,b.dataset.squareV75)){AppStatus.show("warn","Square unavailable","That square has already been claimed.");return}AppStatus.show("ok","Square claimed","#"+b.dataset.squareV75);const live=b.closest(".pool-tab-live");if(live){live.innerHTML=gameSpecificPickPanel(pool);live.dataset.adapter="1"}},true);
function stampV75(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v75 · SQUARES ENGINE</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV75);

// Bracket Engine v76 — advancing tournament selections with persistent round state.
const BracketStoreV76={key:"links-bracket-v76",seed:["TEN","UK","DUKE","UNC","HOU","KU","UCONN","GONZ"],rounds:[{name:"OPENING ROUND",games:[0,1,2,3]},{name:"SEMIFINALS",games:[0,1]},{name:"CHAMPIONSHIP",games:[0]}],read(pool){try{return JSON.parse(localStorage.getItem(this.key+"-"+pool)||"{}")}catch{return{}}},write(pool,x){localStorage.setItem(this.key+"-"+pool,JSON.stringify(x))},teamsFor(b,r,g){if(r===0)return this.seed.slice(g*2,g*2+2);const prev="r"+(r-1)+"g"+(g*2),prev2="r"+(r-1)+"g"+(g*2+1);return [b[prev],b[prev2]].filter(Boolean)},pick(pool,id,team){const b=this.read(pool),m=id.match(/r(\d+)g(\d+)/),r=+m[1],g=+m[2];b[id]=team;for(let rr=r+1;rr<this.rounds.length;rr++){Object.keys(b).filter(k=>k.startsWith("r"+rr+"g")).forEach(k=>delete b[k])}this.write(pool,b);return b}};
document.addEventListener("click",e=>{const x=e.target.closest("[data-bracket-pick]");if(!x)return;e.preventDefault();e.stopImmediatePropagation();const pool=document.documentElement.dataset.pool||"";if(!WeekGate.isOpen()){AppStatus.show("warn","Bracket is locked","Tournament selections can no longer be changed.");return}BracketStoreV76.pick(pool,x.dataset.bracketId,x.dataset.bracketPick);AppStatus.show("ok","Bracket updated",x.dataset.bracketPick+" advances");const live=x.closest(".pool-tab-live");if(live){live.innerHTML=gameSpecificPickPanel(pool);live.dataset.adapter="1"}},true);
function stampV76(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v76 · BRACKET ENGINE</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV76);

// March Madness Arena v77 — four-region tournament presentation + classic escalating scoring.
const MarchArenaV77={regions:["EAST","WEST","SOUTH","MIDWEST"],points:[1,2,4,8,16,32],rounds:["FIRST ROUND","SECOND ROUND","SWEET 16","ELITE EIGHT","FINAL FOUR","CHAMPIONSHIP"]};
function marchArenaPolishV77(){
 if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",type=gameIdentity(PoolHubData[pool]?.game||"").type;if(type!=="bracket")return;
 const live=document.querySelector(".pool-tab-live");if(!live||live.querySelector(".march-arena-v77"))return;
 const bracket=live.querySelector(".bracket-live-v76");if(!bracket)return;
 bracket.insertAdjacentHTML("beforebegin",'<div class="march-arena-v77"><div class="march-lights-v77"></div><div class="march-scoreboard-v77"><span>LINKS TOURNAMENT CENTER</span><b>MARCH MADNESS</b><small>68 TEAMS · 4 REGIONS · 1 CHAMPION</small></div><div class="march-court-v77"><i></i><strong>BRACKET</strong><em>CHALLENGE</em></div><div class="march-regions-v77">'+MarchArenaV77.regions.map(x=>'<span>'+x+'</span>').join("")+'</div><div class="march-points-v77">'+MarchArenaV77.rounds.map((x,i)=>'<div><span>'+x+'</span><b>'+MarchArenaV77.points[i]+' PTS</b></div>').join("")+'</div></div>');
 bracket.querySelectorAll("section").forEach((s,i)=>s.dataset.arenaRound=i+1);
}
document.addEventListener("click",e=>{if(e.target.closest("[data-bracket-pick],.poolhub-tabs button,.pool-tabs button"))setTimeout(marchArenaPolishV77,0)},true);
queueMicrotask(marchArenaPolishV77);
function stampV77(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v77 · MARCH MADNESS ARENA</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV77);

// Launch Funnel v78 — contextual LINKS AI entry inside every sports pool.
function poolAIFunnelV78(){
 if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",p=PoolHubData[pool];if(!p)return;
 const hub=document.querySelector(".pool-hub");if(!hub||hub.querySelector(".pool-ai-funnel-v78"))return;
 const id=gameIdentity(p.game),target=hub.querySelector(".poolhub-hero")||hub.firstElementChild;if(!target)return;
 target.insertAdjacentHTML("afterend",'<aside class="pool-ai-funnel-v78"><div class="pool-ai-mark-v78"><span>LINKS AI</span><b>BUILD A CARD</b></div><div><strong>Like your picks?</strong><p>Research them, add other sports and build one multi-sport card.</p><small>Optional research tool · Pools stay FREE</small></div><button data-pool-ai-v78="'+linksEscape(id.type)+'">OPEN CREATE A CARD ›</button></aside>');
}
function aiSportFromPoolV78(type){return ({football:"NFL",college:"NCAAF",confidence:"NFL",survivor:"NFL",game33:"NFL",squares:"NFL",bracket:"NCAAB",golf:"GOLF",racing:"NASCAR",fantasy:"NFL",dynasty:"NFL"})[type]||"NFL"}
document.addEventListener("click",e=>{const b=e.target.closest("[data-pool-ai-v78]");if(!b)return;e.preventDefault();const sport=aiSportFromPoolV78(b.dataset.poolAiV78);AIStudio.open();setTimeout(()=>{applyAISportV66(sport);aiStadiumVisualV68();aiFlowFinishV69();mountMixedCardV70();mixDockV71()},0)},true);
document.addEventListener("click",e=>{if(e.target.closest(".poolhub-tabs button,.pool-tabs button,[data-route]"))setTimeout(poolAIFunnelV78,0)},true);queueMicrotask(poolAIFunnelV78);
function stampV78(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v78 · LAUNCH FUNNEL</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV78);

// Premium Interaction v79 — tactile controls, live button feedback, keyboard focus, and game-context atmosphere.
function premiumControlsV79(){
 document.querySelectorAll("button:not([data-premium-v79])").forEach(b=>{b.dataset.premiumV79="1";if(!b.disabled)b.classList.add("links-control-v79")});
 document.querySelectorAll(".pool-hub:not([data-atmosphere-v79])").forEach(h=>{h.dataset.atmosphereV79="1";const type=h.dataset.gameType||"football";h.insertAdjacentHTML("afterbegin",'<div class="links-atmosphere-v79" data-sport="'+linksEscape(type)+'"><i></i><i></i><i></i><span>LINKS LIVE EXPERIENCE</span></div>')});
}
document.addEventListener("pointerdown",e=>{const b=e.target.closest("button.links-control-v79");if(!b||b.disabled)return;b.classList.add("is-pressed-v79")},true);
document.addEventListener("pointerup",e=>e.target.closest("button.links-control-v79")?.classList.remove("is-pressed-v79"),true);
document.addEventListener("pointercancel",()=>document.querySelectorAll(".is-pressed-v79").forEach(x=>x.classList.remove("is-pressed-v79")),true);
document.addEventListener("click",e=>{const b=e.target.closest("button.links-control-v79");if(!b||b.disabled)return;b.classList.add("did-fire-v79");setTimeout(()=>b.classList.remove("did-fire-v79"),360)},true);
const premiumObserverV79=new MutationObserver(premiumControlsV79);premiumObserverV79.observe(document.querySelector("#app"),{childList:true,subtree:true});queueMicrotask(premiumControlsV79);
function stampV79(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v79 · PREMIUM INTERACTION</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV79);

// Launch Trust v80 — affiliate handoff disclosure and responsible-use guardrail.
function launchTrustV80(){
 document.querySelectorAll(".book-handoff-v22:not([data-trust-v80])").forEach(x=>{x.dataset.trustV80="1";x.insertAdjacentHTML("beforeend",'<div class="affiliate-trust-v80"><b>PARTNER HANDOFF</b><span>LINKS may earn compensation from eligible partner referrals after approved affiliate links are activated.</span><small>21+ where required · Availability varies by location · Play responsibly · LINKS does not accept wagers.</small></div>')});
}
document.addEventListener("click",e=>{if(e.target.closest("[data-ai],[data-ai-studio],[data-ai-card],[data-parlay],[data-pool-ai-v78]"))setTimeout(launchTrustV80,0)},true);
document.addEventListener("click",e=>{const b=e.target.closest("[data-book-go]");if(!b)return;e.preventDefault();const u=b.dataset.bookGo;if(!/^https?:\/\//i.test(u||""))return;window.open(u,"_blank","noopener,noreferrer")},true);
queueMicrotask(launchTrustV80);
function stampV80(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v80 · LAUNCH TRUST</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV80);

// Engine Ownership v81 — one source of truth for supported game pick screens.
function enforceEngineOwnershipV81(){
 if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",p=PoolHubData[pool];if(!p)return;const type=gameIdentity(p.game||"").type;
 if(!LinksFormatSupportV65.has(type))return;const live=document.querySelector(".pool-tab-live");if(!live)return;
 const active=[...document.querySelectorAll(".poolhub-tabs button,.pool-tabs button")].find(b=>b.classList.contains("active"))?.textContent.trim().toLowerCase();if(active!=="picks")return;
 if(live.dataset.adapter!=="1"){live.dataset.formatAdapter="";mountGameAdapter()}
}
document.addEventListener("click",e=>{if(e.target.closest(".poolhub-tabs button,.pool-tabs button,[data-bracket-pick],[data-adapter-pick],[data-confidence-team],[data-game33-team],[data-square-v75]"))queueMicrotask(enforceEngineOwnershipV81)},true);queueMicrotask(enforceEngineOwnershipV81);
function stampV81(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v81 · ENGINE STABILITY</span>";if(x.innerHTML!==html)x.innerHTML=html})}queueMicrotask(stampV81);


// Unified Lifecycle v82 — replace competing DOM observers with one scheduled enhancement pass.
// Historical mount functions remain intact for compatibility; they now run at most once per animation frame.
const LinksLegacyObserversV82=[brandObserver,poolDayObserver,hubTabObserver,commissionerObserver,visualObserver,stateObserver,resultsObserver,inboxObserver,myPicksObserver,autoObserver,networkObserver,weekGateObserver,readinessObserver,iaObserver,poolsObserver,cleanupObserver,resultObserver,identityObserver,languageObserver,quickObserver,homeV4Observer,homeCleanObserver,homeLiveObserver,briefObserver,trimHomeObserver,riObserver,stateArtObserver,netDecorObserver,hfObserver,mtObserver,md6Observer,mrObserver,sectionObserver,padObserver,statusObserver,bridgeObserver,truthObserver,introObserver,ctaObserver,densityObserver,commissionerTruthObserver,standingTruthObserver,poolTruthObserver,picksTruthObserver,adapterObserver,formatPolishObserver,cfObserver,pssObserver,psrObserver,a11yObserver,prvObserver,rbvObserver,finishObserver,moreObserver,v18Observer,aiHomeObserver,aiToolsObserver,imageQAObserver,gcvObserver,installObserver,ph22Observer,pcvObserver,cqvObserver,pf24Observer,rf25Observer,stamp25Observer,v26o,stamp26o,v27o,stamp27o,v28o,v29o,v30o,o31,o32,o33,o34,o35,o36,o37,o38,o39,o40,o42,o43,o44,o45,o46,o47,o48,o51,o52,o53,o54,o55,o56,o58,premiumObserverV79];
LinksLegacyObserversV82.forEach(o=>{try{o.disconnect()}catch{}});
const LinksLifecycleCallbacksV82=[
  ()=>applySportMarks(),
  ()=>mountPoolGameDay(),
  ()=>activatePoolTabs(),
  ()=>mountCommissionerV3(),
  ()=>mountVisualFX(),
  ()=>paintStateGraphics(),
  ()=>mountResultsArena(),
  ()=>mountInboxV2(),
  ()=>mountMyPicksV3(),
  ()=>mountAutopilot(),
  ()=>mountGameNetworkV2(),
  ()=>enforceWeekGate(document),
  ()=>mountReadiness(),
  ()=>{mountPlayerLaunchpad();mountAdminNav();contextualBack()},
  ()=>mountMyPoolsV3(),
  ()=>cleanupLayout(),
  ()=>correctResultsUI(),
  ()=>mountPoolIdentity(),
  ()=>correctPoolLanguage(),
  ()=>mountHubQuick(),
  ()=>mountHomeCommandV4(),
  ()=>cleanHomeV4(),
  ()=>mountHomeLive(),
  ()=>mountHomeBrief(),
  ()=>trimHome(),
  ()=>mountRouteIdentity(),
  ()=>upgradeEmptyStates(),
  ()=>decorateNetwork(),
  ()=>homeFinish(),
  ()=>mountMobileTopbar(),
  ()=>upgradeMobileDock(),
  ()=>mobileReadiness(),
  ()=>polishSectionHeadings(),
  ()=>mountPoolActionDock(),
  ()=>normalizeStatusChips(),
  ()=>homeBridge(),
  ()=>tightenHomeTruth(),
  ()=>removeRedundantIntros(),
  ()=>fixNetworkCTAs(),
  ()=>dedupeModernHome(),
  ()=>patchCommissionerTruth(),
  ()=>patchStandingsTruth(),
  ()=>patchMyPoolsTruth(),
  ()=>patchMyPicksTruth(),
  ()=>mountGameAdapter(),
  ()=>formatHubPolish(),
  ()=>mountCommissionerFlow(),
  ()=>mountPoolSetupSummary(),
  ()=>mountPoolStatusRibbon(),
  ()=>accessibilityPass(),
  ()=>mountPickReview(),
  ()=>mountResultsBoard(),
  ()=>mountHomeFinish(),
  ()=>refineMobileMore(),
  ()=>appBuildStamp(),
  ()=>mountAIHome(),
  ()=>installAITools(),
  ()=>imageFallbacks(),
  ()=>mountGameCenterV21(),
  ()=>mountInstallV21(),
  ()=>mountPlatformHeroV22(),
  ()=>mountPlatformChoiceV23(),
  ()=>mountCommissionerQuickV23(),
  ()=>mountPreflightV24(),
  ()=>revealFinishV25(),
  ()=>stampV25(),
  ()=>v26Boot(),
  stampV26,
  bootV27,
  stampV27,
  bootV28,
  bootV29,
  bootV30,
  bootV31,
  bootV32,
  bootV33,
  bootV34,
  splashThemeV35,
  bootV36,
  bootV37,
  bootV38,
  bootV39,
  bootV40,
  bootV42,
  bootV43,
  bootV44,
  bootV45,
  bootV46,
  bootV47,
  bootV48,
  bootV51,
  bootV52,
  bootV53,
  bootV54,
  bootV55,
  bootV56,
  bootV58,
  premiumControlsV79
];
const LinksLifecycleV82={
 pending:false,running:false,
 queue(){
  if(this.pending||this.running)return;this.pending=true;
  requestAnimationFrame(()=>{this.pending=false;this.run()});
 },
 run(){
  if(this.running)return;this.running=true;
  try{
   LinksLifecycleCallbacksV82.forEach(fn=>{try{fn()}catch(err){console.warn("LINKS lifecycle",err)}});
   try{enforceEngineOwnershipV81()}catch{}
   stampV82();
  }finally{this.running=false}
 }
};
const unifiedObserverV82=new MutationObserver(()=>LinksLifecycleV82.queue());
unifiedObserverV82.observe(document.querySelector("#app"),{childList:true,subtree:true});
window.addEventListener("popstate",()=>LinksLifecycleV82.queue());
document.addEventListener("links:picksaved",()=>LinksLifecycleV82.queue());
function stampV82(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v82 · UNIFIED LIFECYCLE</span>";if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>LinksLifecycleV82.queue());


// Pool Registry v83 — created pools immediately become first-class returning-player destinations.
function poolGlyphV83(game=""){
 const t=gameIdentity(game).type;return ({football:"🏈",college:"🎓",survivor:"🛡️",confidence:"🎯",game33:"3️⃣",squares:"▦",bracket:"🏀",golf:"⛳",racing:"🏁",fantasy:"🏈",dynasty:"👑",custom:"🧩"}[t]||"◆");
}
function syncCreatedPoolsV83(){
 const created=CreatedPools.all();
 created.slice().reverse().forEach(p=>{
  if(!p?.name)return;
  if(!PoolHubData[p.name])PoolHubData[p.name]={icon:poolGlyphV83(p.game),game:p.game||"CUSTOM POOL",week:"NEW POOL",members:1,ready:1,lock:"SETUP REQUIRED",record:"0–0",rank:"—",accent:p.accent||"LINKS"};
  else if(!PoolHubData[p.name].icon)PoolHubData[p.name].icon=poolGlyphV83(p.game);
  if(!pools.some(x=>String(x[1]).toLowerCase()===String(p.name).toLowerCase()))pools.unshift([poolGlyphV83(p.game),p.name,p.game||"Custom Pool","Setup in progress",p.deadline==="WEEKLY DEADLINE"?"Weekly deadline":"Per-game kickoff"]);
 });
}
const saveCreatedPoolV83=CreatedPools.save.bind(CreatedPools);
CreatedPools.save=function(p){const saved=saveCreatedPoolV83(p);syncCreatedPoolsV83();return saved};
syncCreatedPoolsV83();
function stampV83(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v83 · POOL CONTINUITY</span>";if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{syncCreatedPoolsV83();stampV83();LinksLifecycleV82.queue()});


// Observer Finish v84 — anonymous legacy watchers join the unified lifecycle.
LinksLifecycleCallbacksV82.push(assetReadinessV62,gameNetworkCompletionV64,formatSupportV65);
function stampV84(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v84 · OBSERVER FINISH</span>";if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{stampV84();LinksLifecycleV82.queue()});


// Full Tournament Field v85 — 64-team main bracket, four regions, six advancing rounds.
const BracketFieldV85={
 key:"links-bracket-field-v85",regions:["EAST","WEST","SOUTH","MIDWEST"],order:[[1,16],[8,9],[5,12],[4,13],[6,11],[3,14],[7,10],[2,15]],
 defaultField(){return this.regions.flatMap(region=>this.order.flatMap(pair=>pair.map(seed=>region+" · "+seed+" SEED")))},
 read(pool){try{const x=JSON.parse(localStorage.getItem(this.key+"-"+pool)||"null");return Array.isArray(x)&&x.length===64?x:this.defaultField()}catch{return this.defaultField()}},
 write(pool,field){if(!Array.isArray(field)||field.length!==64)return false;localStorage.setItem(this.key+"-"+pool,JSON.stringify(field.map(x=>String(x||"").trim()||"TBD")));return true},
 apply(pool){BracketStoreV76.seed=this.read(pool);BracketStoreV76.rounds=[{name:"FIRST ROUND",games:Array.from({length:32},(_,i)=>i)},{name:"SECOND ROUND",games:Array.from({length:16},(_,i)=>i)},{name:"SWEET 16",games:Array.from({length:8},(_,i)=>i)},{name:"ELITE EIGHT",games:Array.from({length:4},(_,i)=>i)},{name:"FINAL FOUR",games:[0,1]},{name:"CHAMPIONSHIP",games:[0]}]},
 regionForOpeningGame(gameIndex){return this.regions[Math.floor(gameIndex/8)]||"TOURNAMENT"}
};
// Upgrade any bracket pool before its first render; school names remain commissioner-controlled until the field is published.
Object.keys(PoolHubData).filter(name=>gameIdentity(PoolHubData[name]?.game||"").type==="bracket").forEach(name=>BracketFieldV85.apply(name));
function marchRegionLabelsV85(){
 if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"";if(gameIdentity(PoolHubData[pool]?.game||"").type!=="bracket")return;
 const first=document.querySelector(".bracket-live-v76 section:first-child");if(!first)return;
 first.querySelectorAll(".bracket-game-v76").forEach((g,i)=>{if(g.querySelector(".bracket-region-v85"))return;g.insertAdjacentHTML("afterbegin",'<span class="bracket-region-v85">'+BracketFieldV85.regionForOpeningGame(i)+'</span>')});
 const board=document.querySelector(".march-scoreboard-v77 small");if(board)board.textContent="64-TEAM MAIN BRACKET · 4 REGIONS · 1 CHAMPION";
}
LinksLifecycleCallbacksV82.push(marchRegionLabelsV85);
document.addEventListener("click",e=>{if(e.target.closest("[data-bracket-pick]"))queueMicrotask(marchRegionLabelsV85)},true);
function stampV85(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v85 · FULL TOURNAMENT FIELD</span>";if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{marchRegionLabelsV85();stampV85();LinksLifecycleV82.queue()});


// Game Setup Integrity v86 — commissioner-controlled slates for weekly team-based formats.
const GameSlateStoreV86={
 key:"links-game-slates-v86",
 readAll(){try{return JSON.parse(localStorage.getItem(this.key)||"{}")||{}}catch{return{}}},
 read(pool){return this.readAll()[pool]||[]},
 write(pool,games){const all=this.readAll();all[pool]=games;localStorage.setItem(this.key,JSON.stringify(all));return games},
 has(pool){return this.read(pool).length>0}
};
function normalizedSlateV86(pool){
 const configured=GameSlateStoreV86.read(pool);if(configured.length)return configured;
 const type=gameIdentity(PoolHubData[pool]?.game||"").type;
 if(type==="college"||type==="confidence")return GameAdapters.college;
 if(type==="survivor")return GameAdapters.survivor;
 return DemoSlate;
}
poolSlate=function(pool){return normalizedSlateV86(pool)};
function gameSetupStatusV86(pool){
 const p=PoolHubData[pool],type=gameIdentity(p?.game||"").type,created=CreatedPools.all().some(x=>x.name===pool);
 if(!created)return {ready:true};
 if(["bracket","squares"].includes(type))return {ready:true};
 if(["football","college","confidence","survivor","game33"].includes(type)&&!GameSlateStoreV86.has(pool))return {ready:false,title:"Commissioner setup needed",detail:"Add this pool’s games before player picks open. LINKS will not substitute sample matchups in a newly created pool."};
 return {ready:true};
}
function protectUnconfiguredPoolsV86(){
 if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",st=gameSetupStatusV86(pool);if(st.ready)return;
 const active=[...document.querySelectorAll(".poolhub-tabs button,.pool-tabs button")].find(b=>b.classList.contains("active"))?.textContent.trim().toLowerCase();if(active!=="picks")return;
 const live=document.querySelector(".pool-tab-live");if(!live||live.dataset.v86Protected)return;live.dataset.v86Protected="1";live.dataset.adapter="";
 live.innerHTML='<div class="hub-panel-head"><span>POOL SETUP</span><h3>'+linksEscape(st.title)+'</h3><p>'+linksEscape(st.detail)+'</p></div><div class="links-empty picks"><i>⚙</i><h3>NO PLAYER PICKS YET</h3><p>Once the commissioner publishes the slate, this screen becomes the live pick card.</p></div>';
}
LinksLifecycleCallbacksV82.push(protectUnconfiguredPoolsV86);
document.addEventListener("click",e=>{if(e.target.closest(".poolhub-tabs button,.pool-tabs button"))queueMicrotask(protectUnconfiguredPoolsV86)},true);
function stampV86(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v86 · GAME SETUP INTEGRITY</span>";if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{protectUnconfiguredPoolsV86();stampV86();LinksLifecycleV82.queue()});


// Commissioner Slate Builder v87 — publish the actual weekly matchups for newly created pools.
function slateBuilderV87(pool){
 const saved=GameSlateStoreV86.read(pool),rows=saved.length?saved:[{away:"",home:"",kick:""}];
 return '<section class="slate-builder-v87"><div class="sb87-head"><div><span>GAME SETUP</span><h2>Publish the player slate.</h2><p>Add the matchups that belong in this pool. Player picks stay closed until you publish.</p></div><b>'+rows.length+' GAME'+(rows.length===1?'':'S')+'</b></div><div class="sb87-rows">'+rows.map((g,i)=>'<div class="sb87-row" data-sb87-row><strong>'+(i+1)+'</strong><input data-sb87-away placeholder="Away team" value="'+linksEscape(g.away||'')+'"><span>VS</span><input data-sb87-home placeholder="Home team" value="'+linksEscape(g.home||'')+'"><input data-sb87-kick placeholder="Kickoff · e.g. Sat 6:30 PM" value="'+linksEscape(g.kick||'')+'"><button type="button" data-sb87-remove aria-label="Remove game">×</button></div>').join('')+'</div><div class="sb87-actions"><button type="button" class="secondary" data-sb87-add>＋ ADD GAME</button><button type="button" class="primary" data-sb87-publish>PUBLISH SLATE ›</button></div></section>';
}
function openSlateBuilderV87(pool){
 modal("GAME SETUP",'<div id="slateBuilderV87Mount"></div>');const h=document.querySelector("#slateBuilderV87Mount");if(!h)return;h.innerHTML=slateBuilderV87(pool);wireSlateBuilderV87(h,pool);
}
function wireSlateBuilderV87(h,pool){
 const collect=()=>[...h.querySelectorAll("[data-sb87-row]")].map((r,i)=>({id:"cfg-"+(i+1),away:r.querySelector("[data-sb87-away]")?.value.trim()||"",home:r.querySelector("[data-sb87-home]")?.value.trim()||"",kick:r.querySelector("[data-sb87-kick]")?.value.trim()||""}));
 h.querySelector("[data-sb87-add]")?.addEventListener("click",()=>{const rows=collect();rows.push({away:"",home:"",kick:""});GameSlateStoreV86.write(pool,rows);h.innerHTML=slateBuilderV87(pool);wireSlateBuilderV87(h,pool)});
 h.querySelectorAll("[data-sb87-remove]").forEach((b,i)=>b.addEventListener("click",()=>{const rows=collect();rows.splice(i,1);GameSlateStoreV86.write(pool,rows.length?rows:[{away:"",home:"",kick:""}]);h.innerHTML=slateBuilderV87(pool);wireSlateBuilderV87(h,pool)}));
 h.querySelector("[data-sb87-publish]")?.addEventListener("click",()=>{const rows=collect().filter(x=>x.away&&x.home&&x.kick);if(!rows.length){AppStatus.show("warn","Slate incomplete","Add at least one matchup with both teams and kickoff time.");return}if(rows.some(x=>x.away.toLowerCase()===x.home.toLowerCase())){AppStatus.show("warn","Check the matchup","A team cannot play itself.");return}GameSlateStoreV86.write(pool,rows);AuditLog.add("GAME SLATE PUBLISHED",pool+" · "+rows.length+" games");document.querySelector(".modal")?.remove();AppStatus.show("ok","Slate published",rows.length+" game"+(rows.length===1?"":"s")+" ready for players.");document.querySelector(".pool-tab-live")?.removeAttribute("data-v86-protected");LinksLifecycleV82.queue()});
}
function commissionerSlateActionV87(){
 if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",p=PoolHubData[pool];if(!p||!CreatedPools.all().some(x=>x.name===pool))return;
 const type=gameIdentity(p.game||"").type;if(!["football","college","confidence","survivor","game33"].includes(type))return;
 const hub=document.querySelector(".pool-hub"),hero=hub?.querySelector(".poolhub-hero");if(!hero||hub.querySelector("[data-open-slate-v87]"))return;
 hero.insertAdjacentHTML("afterend",'<div class="pool-setup-action-v87"><div><span>COMMISSIONER SETUP</span><b>'+(GameSlateStoreV86.has(pool)?'SLATE PUBLISHED':'PLAYER PICKS ARE WAITING')+'</b><small>'+(GameSlateStoreV86.has(pool)?'Edit this week’s games anytime before locks.':'Publish the actual games before opening picks.')+'</small></div><button data-open-slate-v87>'+ (GameSlateStoreV86.has(pool)?'EDIT GAME SLATE':'SET UP GAMES') +' ›</button></div>');
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-open-slate-v87]");if(!b)return;e.preventDefault();openSlateBuilderV87(document.documentElement.dataset.pool||"")},true);
LinksLifecycleCallbacksV82.push(commissionerSlateActionV87);
function stampV87(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v87 · COMMISSIONER SLATE BUILDER</span>";if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{commissionerSlateActionV87();stampV87();LinksLifecycleV82.queue()});


// Real Player Registry v88 — remove launch-visible fake entrant names and derive commissioner readiness from actual invites/picks.
const PlayerRegistryV88={
 key:"links-player-registry-v88",
 readAll(){try{return JSON.parse(localStorage.getItem(this.key)||"{}")||{}}catch{return{}}},
 read(pool){return this.readAll()[pool]||[]},
 write(pool,rows){const all=this.readAll();all[pool]=rows;localStorage.setItem(this.key,JSON.stringify(all));return rows},
 add(pool,contact){const rows=this.read(pool),key=String(contact||"").trim().toLowerCase();if(!key)return rows;if(!rows.some(x=>String(x.contact||"").toLowerCase()===key))rows.push({id:"p-"+Date.now().toString(36),contact:String(contact).trim(),name:"Invited player",status:"invited",joined:false});return this.write(pool,rows)}
};
const inviteAddV88=InviteState.add.bind(InviteState);
InviteState.add=function(v,pool){const out=inviteAddV88(v);PlayerRegistryV88.add(pool||document.documentElement.dataset.pool||new URL(location.href).searchParams.get("pool")||"",v);return out};
function playerPickProgressV88(pool,player){
 const slate=normalizedSlateV86(pool),total=Math.max(1,slate.length),isSelf=player?.self===true;let done=0;
 if(isSelf)slate.forEach(g=>{if(PickEngine.get(pool+"-"+g.id)||PickEngine.get("slate-"+g.id))done++});
 return {done,total};
}
function realEntrantsV88(pool){
 const rows=PlayerRegistryV88.read(pool).map(x=>{const p=playerPickProgressV88(pool,x);return {...x,...p}});
 return rows;
}
function readinessTruthV88(pool=document.documentElement.dataset.pool||new URL(location.href).searchParams.get("pool")||""){
 const rows=realEntrantsV88(pool),missing=rows.filter(x=>x.done<x.total);return {total:rows.length,ready:rows.length-missing.length,missing};
}
readinessTruth=readinessTruthV88;
function replaceEntrantManagerV88(){
 const box=document.querySelector(".entrant-manager");if(!box)return;const pool=document.documentElement.dataset.pool||new URL(location.href).searchParams.get("pool")||"",rows=realEntrantsV88(pool);
 if(!rows.length){box.innerHTML='<div class="entrant-head"><div><span>PLAYER READINESS</span><b>No invited players yet.</b><small>Invite players to start tracking joins and pick completion here.</small></div><button class="ghost" data-invite-players>INVITE PLAYERS ›</button></div><div class="links-empty messages"><i>＋</i><h3>BUILD YOUR POOL</h3><p>LINKS will show real player readiness after invitations are sent.</p></div>';return}
 const ready=rows.filter(x=>x.done===x.total).length;
 box.innerHTML='<div class="entrant-head"><div><span>PLAYER READINESS</span><b>Who still needs to pick?</b><small>Only real invited players appear here.</small></div><button class="ghost" data-remind-all-v88>REMIND MISSING ›</button></div><div class="entrant-summary"><strong>'+ready+'/'+rows.length+'</strong><span>ENTRIES COMPLETE</span><i></i></div><div class="entrant-list">'+rows.map(x=>'<div class="'+(x.done===x.total?'complete':'missing')+'"><div class="entrant-avatar">'+linksEscape((x.name||'P')[0])+'</div><div><b>'+linksEscape(x.name||'Invited player')+'</b><small>'+linksEscape(x.contact||'')+'</small></div><strong>'+x.done+'/'+x.total+'</strong>'+(x.done===x.total?'<em>✓ COMPLETE</em>':'<button class="ghost" data-remind-v88="'+linksEscape(x.contact||x.name||'Player')+'">REMIND</button>')+'</div>').join('')+'</div><div class="entrant-foot"><span>Reminders never expose another player’s selections.</span><b class="reminder-feedback"></b></div>';
 box.querySelectorAll("[data-remind-v88]").forEach(b=>b.addEventListener("click",()=>{ReminderQueue.send(b.dataset.remindV88);AppStatus.show("ok","Reminder queued",b.dataset.remindV88)}));
 box.querySelector("[data-remind-all-v88]")?.addEventListener("click",()=>{const missing=rows.filter(x=>x.done<x.total);missing.forEach(x=>ReminderQueue.send(x.contact||x.name));AppStatus.show("ok","Reminders queued",missing.length+" player"+(missing.length===1?'':'s'))});
}
LinksLifecycleCallbacksV82.push(replaceEntrantManagerV88);
function stampV88(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v88 · REAL PLAYER READINESS</span>";if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{replaceEntrantManagerV88();stampV88();LinksLifecycleV82.queue()});


// Launch Data Guard v89 — demo seed pools stay out of returning-player surfaces once a real account creates pools.
const DemoPoolNamesV89=new Set(["My Pool","College Pool","Last One Standing"]);
function realPoolEntriesV89(){return CreatedPools.all().map(p=>[poolGlyphV83(p.game),p.name,p.game||"CUSTOM POOL",GameSlateStoreV86.has(p.name)?"Ready to play":"Setup in progress",p.deadline==="WEEKLY DEADLINE"?"Weekly deadline":"Per-game kickoff"])}
function launchPoolEntriesV89(){const real=realPoolEntriesV89();return real.length?real:pools.filter(p=>!DemoPoolNamesV89.has(p[1]))}
function scrubSeedPoolsV89(){
 const real=realPoolEntriesV89();if(!real.length)return;
 document.querySelectorAll('[data-open-pool="My Pool"],[data-open-pool="College Pool"],[data-open-pool="Last One Standing"],[data-pickpool="My Pool"],[data-pickpool="College Pool"],[data-pickpool="Last One Standing"]').forEach(x=>x.remove());
 document.querySelectorAll(".route-pool,.portfolio-card,.pick-command-card").forEach(card=>{const name=card.dataset.openPool||card.dataset.pickpool||"";if(DemoPoolNamesV89.has(name))card.remove()});
 document.querySelectorAll(".mypools-v3 .pool-summary>div b").forEach((b,i)=>{if(i===0)b.textContent=real.length});
}
LinksLifecycleCallbacksV82.push(scrubSeedPoolsV89);
function stampV89(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v89 · LAUNCH DATA GUARD</span>";if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{scrubSeedPoolsV89();stampV89();LinksLifecycleV82.queue()});


// Pool Truth Surface v90 — newly created pools render from real stored player/setup state, never seeded activity copy.
function poolTruthV90(pool){
 const p=PoolHubData[pool]||{},created=CreatedPools.all().some(x=>x.name===pool),players=realEntrantsV88(pool),slate=GameSlateStoreV86.read(pool);
 return {created,players,slate,members:created?Math.max(1,players.length+1):(p.members||0),ready:created?players.filter(x=>x.done===x.total).length+(slate.length?1:0):(p.ready||0),setup:slate.length>0};
}
function cleanCreatedPoolHubV90(){
 if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",truth=poolTruthV90(pool);if(!truth.created)return;
 const hub=document.querySelector(".pool-hub");if(!hub)return;
 const hero=hub.querySelector(".poolhub-title p");if(hero){const p=PoolHubData[pool];hero.textContent=(p?.game||"LINKS POOL")+" · "+truth.members+" PLAYER"+(truth.members===1?'':'S')}
 const lock=hub.querySelector(".poolhub-lock");if(lock){const strong=lock.querySelector("strong"),em=lock.querySelector("em");if(strong)strong.textContent=truth.setup?(PoolHubData[pool]?.lock||"PER-GAME KICKOFF"):"SETUP REQUIRED";if(em)em.textContent=truth.setup?"● PICKS OPEN":"● WAITING FOR SETUP"}
 const overview=hub.querySelector('.hub-overview');if(!overview)return;
 const main=overview.querySelector('.hub-main');if(main){const score=main.querySelector('.hub-scoreline strong');if(score)score.textContent="—";const rank=main.querySelector('.hub-scoreline small');if(rank)rank.textContent="Season begins with the first scored game";const progress=main.querySelector('.hub-progress i');if(progress)progress.style.width=(truth.members?Math.round(truth.ready/truth.members*100):0)+"%";const copy=main.querySelector('p');if(copy)copy.textContent=truth.setup?(truth.ready+" of "+truth.members+" players ready."):"Publish the game slate, then invite players and open picks."}
 const tiles=overview.querySelectorAll('.hub-tile');if(tiles[0]){tiles[0].querySelector('strong').textContent=truth.members;tiles[0].querySelector('small').textContent=truth.players.length+" invited"}if(tiles[1]){tiles[1].querySelector('strong').textContent="—";tiles[1].querySelector('small').textContent="No scored results yet"}
 overview.querySelector('.hub-live')?.remove();
 const activity=overview.querySelector('.hub-activity');if(activity)activity.innerHTML='<span>POOL PULSE</span><h3>Latest activity</h3>'+(truth.setup?'<p><b>Game slate</b> published <small>READY</small></p>':'<p><b>Commissioner setup</b> needs games <small>ACTION</small></p>')+(truth.players.length?'<p><b>'+truth.players.length+' player'+(truth.players.length===1?'':'s')+'</b> invited <small>ACTIVE</small></p>':'<p><b>No players invited yet</b> <small>START HERE</small></p>');
}
LinksLifecycleCallbacksV82.push(cleanCreatedPoolHubV90);
function stampV90(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v90 · POOL TRUTH SURFACE</span>";if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{cleanCreatedPoolHubV90();stampV90();LinksLifecycleV82.queue()});


// Custom Pool Engine v91 — custom pools get commissioner-defined choices instead of falling through to NFL.
const CustomPoolStoreV91={key:"links-custom-pools-v91",all(){try{return JSON.parse(localStorage.getItem(this.key)||"{}")||{}}catch{return{}}},read(pool){return this.all()[pool]||{prompt:"",choices:[]}},write(pool,v){const a=this.all();a[pool]=v;localStorage.setItem(this.key,JSON.stringify(a));return v}};
function customSetupV91(pool){const d=CustomPoolStoreV91.read(pool);return '<section class="custom-setup-v91"><span>CUSTOM GAME SETUP</span><h2>Build the pick card.</h2><p>Set one question and the choices players can select. You can change it before the pool opens.</p><label><b>PICK QUESTION</b><input data-custom-prompt-v91 maxlength="90" value="'+linksEscape(d.prompt||'')+'" placeholder="Example: Who wins the featured matchup?"></label><label><b>CHOICES</b><textarea data-custom-choices-v91 rows="6" placeholder="One choice per line">'+linksEscape((d.choices||[]).join('\n'))+'</textarea></label><button class="primary" data-custom-publish-v91>PUBLISH CUSTOM CARD ›</button></section>'}
function customPlayerV91(pool){const d=CustomPoolStoreV91.read(pool),saved=PickEngine.get(pool+"-custom-v91")?.team||"";if(!d.prompt||!d.choices.length)return '<div class="hub-panel-head"><span>CUSTOM POOL</span><h3>Waiting for commissioner setup.</h3><p>The custom pick card will appear here as soon as it is published.</p></div>';return '<div class="hub-panel-head"><span>CUSTOM POOL</span><h3>'+linksEscape(d.prompt)+'</h3><p>Select one choice. Your pick saves instantly.</p></div><div class="custom-choice-grid-v91">'+d.choices.map(x=>'<button data-custom-pick-v91="'+linksEscape(x)+'" class="'+(saved===x?'selected':'')+'"><b>'+linksEscape(x)+'</b><span>'+(saved===x?'YOUR PICK':'SELECT')+'</span></button>').join('')+'</div>'}
function mountCustomPoolV91(){if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",p=PoolHubData[pool];if(!p||!/CUSTOM/i.test(p.game||""))return;const live=document.querySelector('.pool-tab-live');if(!live)return;const active=[...document.querySelectorAll('.poolhub-tabs button,.pool-tabs button')].find(b=>b.classList.contains('active'))?.textContent.trim().toLowerCase();if(active!=="picks")return;live.dataset.v91="1";live.innerHTML=customPlayerV91(pool)}
document.addEventListener("click",e=>{const b=e.target.closest('[data-custom-pick-v91]');if(!b)return;const pool=document.documentElement.dataset.pool||"";PickEngine.save(pool+"-custom-v91",b.dataset.customPickV91);AppStatus.show("ok","Pick saved",b.dataset.customPickV91);mountCustomPoolV91()},true);
function commissionerCustomV91(){if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",p=PoolHubData[pool];if(!p||!/CUSTOM/i.test(p.game||""))return;const hub=document.querySelector('.pool-hub');if(!hub||hub.querySelector('[data-custom-setup-open-v91]'))return;const hero=hub.querySelector('.poolhub-hero');hero?.insertAdjacentHTML('afterend','<div class="pool-setup-action-v87"><div><span>CUSTOM POOL</span><b>COMMISSIONER PICK CARD</b><small>Define the question and player choices.</small></div><button data-custom-setup-open-v91>SET UP CUSTOM CARD ›</button></div>')}
document.addEventListener("click",e=>{if(!e.target.closest('[data-custom-setup-open-v91]'))return;const pool=document.documentElement.dataset.pool||"";modal("CUSTOM POOL SETUP",'<div id="customSetupV91Mount">'+customSetupV91(pool)+'</div>');const h=document.querySelector('#customSetupV91Mount');h?.querySelector('[data-custom-publish-v91]')?.addEventListener('click',()=>{const prompt=h.querySelector('[data-custom-prompt-v91]').value.trim(),choices=h.querySelector('[data-custom-choices-v91]').value.split(/\n+/).map(x=>x.trim()).filter(Boolean);if(!prompt||choices.length<2){AppStatus.show('warn','Custom card incomplete','Add a question and at least two choices.');return}CustomPoolStoreV91.write(pool,{prompt,choices});document.querySelector('.modal')?.remove();AppStatus.show('ok','Custom card published',choices.length+' choices ready.');mountCustomPoolV91()})},true);
LinksLifecycleCallbacksV82.push(mountCustomPoolV91,commissionerCustomV91);
function stampV91(){document.querySelectorAll(".app-build-v18").forEach(x=>{const html="<b>LINKS</b><span>NEW BUILD · v91 · CUSTOM POOL ENGINE</span>";if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{commissionerCustomV91();mountCustomPoolV91();stampV91();LinksLifecycleV82.queue()});


// March Field Commissioner v92 — tournament pools require a real commissioner-published 64-team main field.
const BracketPublishedV92={key:"links-bracket-published-v92",read(pool){return localStorage.getItem(this.key+"-"+pool)==="1"},write(pool,v=true){localStorage.setItem(this.key+"-"+pool,v?"1":"0")}};
function bracketFieldSetupV92(pool){const field=BracketFieldV85.read(pool);let n=0;return '<section class="bracket-field-setup-v92"><div class="bf92-head"><div><span>MARCH MADNESS SETUP</span><h2>Publish the tournament field.</h2><p>Enter the 64-team main bracket by region and seed. First Four winners feed the 16-seed/11-seed lines before the main bracket locks.</p></div><b>4 REGIONS · 64 TEAMS</b></div>'+BracketFieldV85.regions.map((region,ri)=>'<section class="bf92-region"><header><span>'+region+'</span><b>REGION</b></header><div>'+BracketFieldV85.order.flatMap(pair=>pair.map(seed=>{const value=field[n++]||"";return '<label><small>'+seed+' SEED</small><input data-bf92-team value="'+linksEscape(value.replace(region+' · '+seed+' SEED',''))+'" placeholder="Team name"></label>'})).join('')+'</div></section>').join('')+'<div class="bf92-actions"><button class="primary" data-bf92-publish>PUBLISH TOURNAMENT FIELD ›</button></div></section>'}
function bracketIsReadyV92(pool){return !CreatedPools.all().some(x=>x.name===pool)||BracketPublishedV92.read(pool)}
function protectBracketV92(){if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",p=PoolHubData[pool];if(gameIdentity(p?.game||"").type!=="bracket"||bracketIsReadyV92(pool))return;const live=document.querySelector('.pool-tab-live');if(!live)return;const active=[...document.querySelectorAll('.poolhub-tabs button,.pool-tabs button')].find(b=>b.classList.contains('active'))?.textContent.trim().toLowerCase();if(active!=="picks")return;live.innerHTML='<div class="hub-panel-head"><span>MARCH MADNESS</span><h3>Tournament field not published yet.</h3><p>Your commissioner is setting the official bracket. Player selections open after the field is published.</p></div><div class="links-empty picks"><i>🏀</i><h3>BRACKET SETUP IN PROGRESS</h3><p>No placeholder schools will be shown as real tournament teams.</p></div>';live.dataset.adapter=""}
function commissionerBracketV92(){if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",p=PoolHubData[pool];if(gameIdentity(p?.game||"").type!=="bracket"||!CreatedPools.all().some(x=>x.name===pool))return;const hub=document.querySelector('.pool-hub');if(!hub||hub.querySelector('[data-bf92-open]'))return;hub.querySelector('.poolhub-hero')?.insertAdjacentHTML('afterend','<div class="pool-setup-action-v87"><div><span>MARCH MADNESS SETUP</span><b>'+(BracketPublishedV92.read(pool)?'TOURNAMENT FIELD PUBLISHED':'BRACKET WAITING FOR FIELD')+'</b><small>'+(BracketPublishedV92.read(pool)?'Edit teams before tournament lock.':'Enter the real 64-team main bracket before players pick.')+'</small></div><button data-bf92-open>'+(BracketPublishedV92.read(pool)?'EDIT FIELD':'SET UP BRACKET')+' ›</button></div>')}
document.addEventListener('click',e=>{if(!e.target.closest('[data-bf92-open]'))return;const pool=document.documentElement.dataset.pool||'';modal('MARCH MADNESS FIELD','<div id="bf92Mount">'+bracketFieldSetupV92(pool)+'</div>');const h=document.querySelector('#bf92Mount');h?.querySelector('[data-bf92-publish]')?.addEventListener('click',()=>{const vals=[...h.querySelectorAll('[data-bf92-team]')].map(x=>x.value.trim());if(vals.length!==64||vals.some(x=>!x)){AppStatus.show('warn','Field incomplete','Enter all 64 main-bracket teams before publishing.');return}if(new Set(vals.map(x=>x.toLowerCase())).size!==64){AppStatus.show('warn','Duplicate team','Each tournament team can appear only once.');return}BracketFieldV85.write(pool,vals);BracketPublishedV92.write(pool,true);BracketFieldV85.apply(pool);document.querySelector('.modal')?.remove();AppStatus.show('ok','Tournament field published','64 teams ready for bracket picks.');document.querySelector('.pool-tab-live')?.removeAttribute('data-adapter');LinksLifecycleV82.queue()})},true);
LinksLifecycleCallbacksV82.push(protectBracketV92,commissionerBracketV92);
function stampV92(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v92 · MARCH FIELD CONTROL</span>';if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{protectBracketV92();commissionerBracketV92();stampV92();LinksLifecycleV82.queue()});


// Configured Team Engines v93 — Survivor and Game 33 consume the commissioner-published slate, never DemoSlate.
function configuredTeamsV93(pool){return [...new Set(GameSlateStoreV86.read(pool).flatMap(g=>[g.away,g.home]).map(x=>String(x||"").trim()).filter(Boolean))]}
const gameSpecificPickPanelV92=gameSpecificPickPanel;
gameSpecificPickPanel=function(pool){
 const p=PoolHubData[pool],type=gameIdentity(p?.game||"").type;
 if(type==="survivor"){
  const slate=GameSlateStoreV86.read(pool),teams=configuredTeamsV93(pool);if(!slate.length||!teams.length)return '<div class="hub-panel-head"><span>SURVIVOR</span><h3>Waiting for the weekly slate.</h3><p>The commissioner must publish eligible games before survivor picks open.</p></div>';
  const key=pool+"-survivor-week",saved=PickEngine.get(key)?.team||"";
  return '<div class="hub-panel-head"><span>SURVIVOR · '+linksEscape(p.week)+'</span><h3>One team. Stay alive.</h3><p>Choose one eligible team from this week’s commissioner-published slate.</p></div><div class="survivor-choice">'+teams.map(t=>'<button data-adapter-pick="'+linksEscape(t)+'" data-adapter-game="survivor-week" class="'+(saved===t?'selected':'')+'"><i>'+linksEscape(t)+'</i><b>'+linksEscape(t)+'</b><span>'+(saved===t?'YOUR PICK':'SELECT')+'</span></button>').join('')+'</div><div class="adapter-proof"><b>'+(saved?'✓ '+linksEscape(saved)+' SAVED':'SELECTION NEEDED')+'</b><span>'+linksEscape(p.lock)+'</span></div>';
 }
 if(type==="game33"){
  const teams=configuredTeamsV93(pool),saved=Game33StoreV74.read(pool);if(!teams.length)return '<div class="hub-panel-head"><span>GAME 33</span><h3>Waiting for the weekly slate.</h3><p>The commissioner must publish eligible NFL games before selections open.</p></div>';
  return '<div class="hub-panel-head"><span>GAME 33 · '+linksEscape(p.week)+'</span><h3>Chase 33.</h3><p>Choose one eligible NFL team from this week’s published games.</p></div><div class="g33-live-v74"><div class="g33-target-v74"><span>TARGET</span><b>33</b><small>POINTS</small></div><div class="g33-team-grid-v74">'+teams.map(t=>'<button data-g33-team="'+linksEscape(t)+'" class="'+(saved.team===t?'selected':'')+'"><b>'+linksEscape(t)+'</b><span>'+(saved.team===t?'YOUR PICK':'SELECT')+'</span></button>').join('')+'</div><div class="adapter-proof"><b>'+(saved.team?'✓ '+linksEscape(saved.team)+' SAVED':'SELECTION NEEDED')+'</b><span>'+linksEscape(p.lock)+'</span></div></div>';
 }
 return gameSpecificPickPanelV92(pool);
};
function refreshConfiguredEngineV93(){if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",type=gameIdentity(PoolHubData[pool]?.game||"").type;if(!["survivor","game33"].includes(type))return;const live=document.querySelector('.pool-tab-live');if(!live)return;const active=[...document.querySelectorAll('.poolhub-tabs button,.pool-tabs button')].find(b=>b.classList.contains('active'))?.textContent.trim().toLowerCase();if(active!=="picks")return;live.innerHTML=gameSpecificPickPanel(pool);live.dataset.adapter="1"}
LinksLifecycleCallbacksV82.push(refreshConfiguredEngineV93);
function stampV93(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v93 · CONFIGURED GAME ENGINES</span>';if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{refreshConfiguredEngineV93();stampV93();LinksLifecycleV82.queue()});


// Kickoff Lock Integrity v94 — commissioner slates store machine-readable kickoff times and individual games lock automatically.
function parseKickV94(v){const t=Date.parse(String(v||""));return Number.isFinite(t)?t:null}
function gameLockedV94(g){const t=parseKickV94(g?.kickAt);return t!==null&&Date.now()>=t}
function slateBuilderV94(pool){
 const saved=GameSlateStoreV86.read(pool),rows=saved.length?saved:[{away:"",home:"",kick:"",kickAt:""}];
 return '<section class="slate-builder-v87"><div class="sb87-head"><div><span>GAME SETUP</span><h2>Publish the player slate.</h2><p>Add each matchup and its actual kickoff. LINKS locks that game automatically at kickoff.</p></div><b>'+rows.length+' GAME'+(rows.length===1?'':'S')+'</b></div><div class="sb87-rows">'+rows.map((g,i)=>'<div class="sb87-row" data-sb87-row><strong>'+(i+1)+'</strong><input data-sb87-away placeholder="Away team" value="'+linksEscape(g.away||'')+'"><span>VS</span><input data-sb87-home placeholder="Home team" value="'+linksEscape(g.home||'')+'"><input type="datetime-local" data-sb87-kickat value="'+linksEscape(g.kickAt||'')+'"><button type="button" data-sb87-remove aria-label="Remove game">×</button></div>').join('')+'</div><div class="sb87-actions"><button type="button" class="secondary" data-sb87-add>＋ ADD GAME</button><button type="button" class="primary" data-sb87-publish>PUBLISH SLATE ›</button></div></section>'
}
slateBuilderV87=slateBuilderV94;
const wireSlateBuilderV87Legacy=wireSlateBuilderV87;
wireSlateBuilderV87=function(h,pool){
 const collect=()=>[...h.querySelectorAll('[data-sb87-row]')].map((r,i)=>{const kickAt=r.querySelector('[data-sb87-kickat]')?.value||'';return {id:'cfg-'+(i+1),away:r.querySelector('[data-sb87-away]')?.value.trim()||'',home:r.querySelector('[data-sb87-home]')?.value.trim()||'',kickAt,kick:kickAt?new Date(kickAt).toLocaleString([], {weekday:'short',hour:'numeric',minute:'2-digit'}):''}});
 h.querySelector('[data-sb87-add]')?.addEventListener('click',()=>{const rows=collect();rows.push({away:'',home:'',kick:'',kickAt:''});GameSlateStoreV86.write(pool,rows);h.innerHTML=slateBuilderV87(pool);wireSlateBuilderV87(h,pool)});
 h.querySelectorAll('[data-sb87-remove]').forEach((b,i)=>b.addEventListener('click',()=>{const rows=collect();rows.splice(i,1);GameSlateStoreV86.write(pool,rows.length?rows:[{away:'',home:'',kick:'',kickAt:''}]);h.innerHTML=slateBuilderV87(pool);wireSlateBuilderV87(h,pool)}));
 h.querySelector('[data-sb87-publish]')?.addEventListener('click',()=>{const rows=collect();if(!rows.length||rows.some(x=>!x.away||!x.home||!x.kickAt)){AppStatus.show('warn','Slate incomplete','Every matchup needs two teams and a kickoff date/time.');return}if(rows.some(x=>x.away.toLowerCase()===x.home.toLowerCase())){AppStatus.show('warn','Check the matchup','A team cannot play itself.');return}if(rows.some(x=>parseKickV94(x.kickAt)===null)){AppStatus.show('warn','Kickoff needed','Enter a valid kickoff for every game.');return}GameSlateStoreV86.write(pool,rows);AuditLog.add('GAME SLATE PUBLISHED',pool+' · '+rows.length+' games');document.querySelector('.modal')?.remove();AppStatus.show('ok','Slate published',rows.length+' games with automatic kickoff locks.');document.querySelector('.pool-tab-live')?.removeAttribute('data-v86-protected');LinksLifecycleV82.queue()})
};
function enforcePerGameLocksV94(){if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",games=GameSlateStoreV86.read(pool);if(!games.length)return;const byId=Object.fromEntries(games.map(g=>[g.id,g]));document.querySelectorAll('[data-adapter-game],[data-confidence-game]').forEach(b=>{const id=b.dataset.adapterGame||b.dataset.confidenceGame,g=byId[id];if(!g)return;const locked=gameLockedV94(g);b.disabled=locked;b.classList.toggle('kickoff-locked-v94',locked);if(locked)b.setAttribute('title','Locked at kickoff')});document.querySelectorAll('[data-adapter-row],[data-confidence-row]').forEach(r=>{const g=byId[r.dataset.adapterRow||r.dataset.confidenceRow];if(g&&gameLockedV94(g))r.classList.add('game-locked-v94')})}
LinksLifecycleCallbacksV82.push(enforcePerGameLocksV94);
function stampV94(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v94 · AUTOMATIC KICKOFF LOCKS</span>';if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{enforcePerGameLocksV94();stampV94();LinksLifecycleV82.queue()});


// Launch Truth Home v95 — real accounts never see seeded urgency, fake readiness, or demo rankings on HOME.
function homeTruthV95(){
 const created=CreatedPools.all(),real=created.map(x=>PoolHubData[x.name]).filter(Boolean),picksDue=created.reduce((n,x)=>{const type=gameIdentity(x.game||"").type;if(["bracket","squares","custom"].includes(type))return n;const slate=GameSlateStoreV86.read(x.name);return n+slate.filter(g=>!PickEngine.get(x.name+"-"+g.id)&&!gameLockedV94(g)).length},0);return {created,real,picksDue};
}
function cleanHomeTruthV95(){
 if(document.documentElement.dataset.view!=="home")return;const t=homeTruthV95();if(!t.created.length)return;const h=document.querySelector('.home-command-v4');if(!h)return;
 const score=h.querySelector('.home-scorebug');if(score){const total=t.created.reduce((n,x)=>n+Math.max(1,GameSlateStoreV86.read(x.name).length),0),pct=total?Math.max(0,Math.min(100,Math.round((total-t.picksDue)/total*100))):0;score.querySelector('b').textContent=pct+'%';score.querySelector('i')?.style.setProperty('--week',pct+'%')}
 const primary=h.querySelector('[data-home-go="my-picks"] b');if(primary)primary.textContent=t.picksDue?t.picksDue+' DUE':'READY';
 const urgent=h.querySelector('.home-now.urgent');if(urgent){urgent.classList.toggle('urgent',t.picksDue>0);urgent.querySelector('span').textContent=t.picksDue?'NEEDS YOU':'YOU’RE SET';urgent.querySelector('b').textContent=t.picksDue?(t.picksDue+' PICK'+(t.picksDue===1?'':'S')+' LEFT'):'NO PICKS DUE';urgent.querySelector('small').textContent=t.picksDue?'Finish unlocked games before kickoff':'New games will appear when your pools publish them';urgent.querySelector('em').textContent=t.picksDue?'FINISH ›':'VIEW PICKS ›'}
 const rail=h.querySelector('.home-pool-rail');if(rail)rail.innerHTML=t.created.slice(0,3).map(x=>{const p=PoolHubData[x.name]||{},g=gameIdentity(x.game||p.game||''),slate=GameSlateStoreV86.read(x.name),ready=gameSetupStatusV86(x.name).ready;return '<button class="home-pool-card hpc-'+g.type+'" data-home-pool="'+linksEscape(x.name)+'"><div class="hpc-art">'+networkGlyph(g.type)+'</div><div class="hpc-copy"><span>'+linksEscape(x.game||p.game||'LINKS POOL')+'</span><h3>'+linksEscape(x.name)+'</h3><div><b>'+(ready?'READY TO PLAY':'SETUP NEEDED')+'</b><b>'+slate.length+' GAME'+(slate.length===1?'':'S')+'</b></div></div><em>›<small>OPEN</small></em></button>'}).join('');
 const head=h.querySelector('.home-section-head button');if(head)head.textContent='VIEW ALL '+t.created.length+' ›';
}
LinksLifecycleCallbacksV82.push(cleanHomeTruthV95);
function stampV95(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v95 · REAL HOME COMMAND</span>';if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{cleanHomeTruthV95();stampV95();LinksLifecycleV82.queue()});


// Single Version Authority v96 — one final build stamp wins over every legacy stamp function.
const LINKS_NEW_BUILD_VERSION_V96={version:"v96",label:"LAUNCH POLISH"};
function authoritativeStampV96(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · '+LINKS_NEW_BUILD_VERSION_V96.version+' · '+LINKS_NEW_BUILD_VERSION_V96.label+'</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild=LINKS_NEW_BUILD_VERSION_V96.version}
LinksLifecycleCallbacksV82.push(authoritativeStampV96);
queueMicrotask(()=>{authoritativeStampV96();requestAnimationFrame(authoritativeStampV96)});


// Game Identity Completion v97 — Confidence and Custom keep their own visual/game identity everywhere.
const gameIdentityV96=gameIdentity;
gameIdentity=function(game=""){
 const n=String(game||"").toUpperCase();
 if(n.includes("CONFIDENCE"))return {type:"confidence",eyebrow:"RANK THE CARD",label:"CONFIDENCE"};
 if(n.includes("CUSTOM"))return {type:"custom",eyebrow:"YOUR GAME. YOUR RULES.",label:"CUSTOM POOL"};
 return gameIdentityV96(game);
};
const gameHubTermsV96=gameHubTerms;
gameHubTerms=function(name){const p=PoolHubData[name],g=gameIdentity(p?.game||"");if(g.type==="confidence")return {action:"MAKE CONFIDENCE PICKS",noun:"ranked games",status:"Confidence card"};if(g.type==="custom")return {action:"OPEN CUSTOM PICKS",noun:"choices",status:"Custom game"};return gameHubTermsV96(name)};
function repairGameIdentityV97(){if(document.documentElement.dataset.view!=="pool")return;const pool=document.documentElement.dataset.pool||"",p=PoolHubData[pool];if(!p)return;const g=gameIdentity(p.game||""),band=document.querySelector('.pool-identity');if(band){band.className='pool-identity pi-'+g.type;band.querySelector('.pi-art').innerHTML=networkGlyph(g.type);band.querySelector('.pi-copy>span').textContent=g.eyebrow;band.querySelector('.pi-copy>b').textContent=g.label}const hub=document.querySelector('.pool-hub');if(hub){hub.dataset.gameType=g.type;hub.querySelector('.poolhub-hero')?.setAttribute('data-game-type',g.type)}correctPoolLanguage()}
LinksLifecycleCallbacksV82.push(repairGameIdentityV97);
function stampV97(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v97 · GAME IDENTITY COMPLETION</span>';if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{repairGameIdentityV97();stampV97();LinksLifecycleV82.queue()});


// Invite Migration v98 — scope invitation history to pools and migrate legacy invites into real player readiness.
const InviteRegistryV98={key:"links-invites-by-pool-v98",all(){try{return JSON.parse(localStorage.getItem(this.key)||"{}")||{}}catch{return{}}},read(pool){return this.all()[pool]||[]},add(pool,value){const a=this.all(),rows=a[pool]||[],key=String(value||"").trim().toLowerCase();if(!key)return rows;if(!rows.some(x=>String(x.value||"").toLowerCase()===key))rows.unshift({value:String(value).trim(),at:new Date().toISOString(),status:"sent"});a[pool]=rows.slice(0,100);localStorage.setItem(this.key,JSON.stringify(a));PlayerRegistryV88.add(pool,value);return a[pool]}};
function migrateInvitesV98(){const pools=CreatedPools.all();if(pools.length!==1)return;const pool=pools[0].name,legacy=InviteState.read();if(!legacy.length||InviteRegistryV98.read(pool).length)return;legacy.forEach(x=>InviteRegistryV98.add(pool,x.value))}
function inviteCenterV98(pool){const base=location.origin+location.pathname+"?view=pool&pool="+encodeURIComponent(pool)+"&invite=1",sent=InviteRegistryV98.read(pool);return '<section class="invite-v2"><div class="invite-hero"><div><span>INVITE CENTER</span><h2>Bring the whole group in.</h2><p>One link opens the right pool. Existing members sign in; new players get a short setup.</p></div><div class="invite-mark">+</div></div><div class="invite-link"><div><span>POOL INVITE LINK</span><b data-invite-url>'+linksEscape(base)+'</b></div><button data-copy-invite>COPY LINK</button></div><div class="invite-actions"><button data-share-invite="text"><i>↗</i><div><b>SHARE INVITE</b><span>Text, email or any installed app</span></div></button><button data-share-invite="email"><i>@</i><div><b>EMAIL</b><span>Open a prefilled invitation</span></div></button></div><form class="invite-direct"><div><span>DIRECT INVITE</span><h3>Email or mobile number</h3></div><input type="text" placeholder="player@email.com or mobile number" autocomplete="off"><button>SEND INVITE</button></form><div class="join-preview"><span>WHAT PLAYERS SEE</span><div><i>L</i><div><b>'+linksEscape(pool)+'</b><small>You’ve been invited to join</small></div><em>JOIN POOL ›</em></div><p>No pool searching. The invitation takes them directly to the correct pool.</p></div>'+(sent.length?'<div class="invite-history"><span>RECENT INVITES</span>'+sent.slice(0,5).map(x=>'<div><b>'+linksEscape(x.value)+'</b><em>SENT</em></div>').join('')+'</div>':'')+'</section>'}
inviteCenter=inviteCenterV98;
const wireInviteV97=wireInvite;wireInvite=function(h,pool){wireInviteV97(h,pool);const form=h.querySelector('.invite-direct');if(!form)return;const replacement=form.cloneNode(true);form.replaceWith(replacement);replacement.addEventListener('submit',e=>{e.preventDefault();const input=e.currentTarget.querySelector('input'),v=input.value.trim();if(!v)return;InviteRegistryV98.add(pool,v);AuditLog.add('INVITE SENT',pool+' · '+v);AppStatus.show('ok','Invite queued',v);h.innerHTML=inviteCenter(pool);wireInvite(h,pool)})};
function syncPlayerRegistryV98(){migrateInvitesV98();CreatedPools.all().forEach(p=>InviteRegistryV98.read(p.name).forEach(x=>PlayerRegistryV88.add(p.name,x.value)))}
LinksLifecycleCallbacksV82.push(syncPlayerRegistryV98);
function stampV98(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v98 · PLAYER INVITE INTEGRITY</span>';if(x.innerHTML!==html)x.innerHTML=html})}
queueMicrotask(()=>{syncPlayerRegistryV98();stampV98();LinksLifecycleV82.queue()});


// Game-Aware Create Rules v99 — pool creation only shows rules that belong to the selected format.
function createRuleProfileV99(game){const t=gameIdentity(game).type,profiles={football:{title:"Set the football rules.",deadline:["PER-GAME KICKOFF","WEEKLY DEADLINE"],scoring:["STRAIGHT UP","AGAINST SPREAD"],labels:["DEADLINE","SCORING"]},college:{title:"Set the college rules.",deadline:["PER-GAME KICKOFF","WEEKLY DEADLINE"],scoring:["STRAIGHT UP","AGAINST SPREAD"],labels:["DEADLINE","SCORING"]},survivor:{title:"Set the survival rules.",deadline:["PER-GAME KICKOFF"],scoring:["ONE TEAM · STAY ALIVE"],labels:["PICK LOCK","FORMAT"]},confidence:{title:"Set the confidence card.",deadline:["PER-GAME KICKOFF","WEEKLY DEADLINE"],scoring:["RANK EVERY GAME"],labels:["DEADLINE","SCORING"]},game33:{title:"Set the Game 33 rules.",deadline:["PER-GAME KICKOFF"],scoring:["CHASE 33 · ROLLOVER"],labels:["PICK LOCK","FORMAT"]},squares:{title:"Set up the grid.",deadline:["COMMISSIONER CLOSES GRID"],scoring:["QUARTER / FINAL NUMBERS"],labels:["GRID LOCK","SCORING"]},bracket:{title:"Set up the tournament.",deadline:["TOURNAMENT TIP-OFF"],scoring:["ROUND POINTS"],labels:["BRACKET LOCK","SCORING"]},golf:{title:"Set up the tournament pool.",deadline:["FIRST TEE TIME"],scoring:["COMMISSIONER SCORING"],labels:["ENTRY LOCK","SCORING"]},racing:{title:"Set up race day.",deadline:["GREEN FLAG"],scoring:["COMMISSIONER SCORING"],labels:["ENTRY LOCK","SCORING"]},fantasy:{title:"Set up the league.",deadline:["LINEUP LOCK"],scoring:["LEAGUE SCORING"],labels:["ROSTER LOCK","SCORING"]},dynasty:{title:"Set up the dynasty league.",deadline:["LINEUP LOCK"],scoring:["LEAGUE SCORING"],labels:["ROSTER LOCK","SCORING"]},custom:{title:"Set up your custom game.",deadline:["COMMISSIONER DEADLINE"],scoring:["CUSTOM RULES"],labels:["ENTRY LOCK","FORMAT"]}};return profiles[t]||profiles.custom}
const createStudioHtmlV98=CreatePoolStudio.html.bind(CreatePoolStudio);CreatePoolStudio.html=function(step=1){if(step!==3&&step!==4)return createStudioHtmlV98(step);const d=this.draft,g=this.gameType(d.game),p=createRuleProfileV99(d.game);if(!p.deadline.includes(d.deadline))d.deadline=p.deadline[0];if(!p.scoring.includes(d.scoring))d.scoring=p.scoring[0];if(step===3)return '<div class="create-studio"><div class="create-steps"><b class="done">✓ GAME</b><b class="done">✓ DETAILS</b><b class="on">3 RULES</b><b>4 READY</b></div><div class="create-title"><span>QUICK SETUP</span><h2>'+p.title+'</h2><p>Only controls that apply to '+linksEscape(d.game)+' are shown here. Advanced settings stay with the commissioner after creation.</p></div><div class="create-rule"><span>'+p.labels[0]+'</span>'+p.deadline.map(x=>'<button data-create-deadline="'+x+'" class="'+(d.deadline===x?'selected':'')+'">'+x+'</button>').join('')+'</div><div class="create-rule"><span>'+p.labels[1]+'</span>'+p.scoring.map(x=>'<button data-create-scoring="'+x+'" class="'+(d.scoring===x?'selected':'')+'">'+x+'</button>').join('')+'</div><div class="create-preview"><div class="mini-network-art">'+networkGlyph(g)+'</div><div><span>PLAYER PREVIEW</span><b>'+linksEscape(d.game)+'</b><small>'+linksEscape(d.deadline)+' · '+linksEscape(d.scoring)+'</small></div></div><div class="create-foot"><button class="secondary" data-create-next="2">‹ BACK</button><button data-create-next="4">REVIEW POOL ›</button></div></div>';return '<div class="create-studio"><div class="create-steps"><b class="done">✓ GAME</b><b class="done">✓ DETAILS</b><b class="done">✓ RULES</b><b class="on">4 READY</b></div><div class="create-ready"><div class="create-ready-mark">'+networkGlyph(g)+'</div><span>READY TO CREATE</span><h2>'+linksEscape(d.name||'Your New Pool')+'</h2><p>'+linksEscape(d.game)+' · '+linksEscape(d.privacy)+'</p><div class="ready-grid"><div><span>'+p.labels[0]+'</span><b>'+linksEscape(d.deadline)+'</b></div><div><span>'+p.labels[1]+'</span><b>'+linksEscape(d.scoring)+'</b></div><div><span>PLAYERS</span><b>YOU + INVITES</b></div><div><span>ACCESS</span><b>'+linksEscape(d.privacy)+'</b></div></div><button data-create-publish>CREATE POOL</button><small>LINKS pools are free. Invite players immediately after creation.</small></div><div class="create-foot"><button class="secondary" data-create-next="3">‹ EDIT RULES</button></div></div>'};
function stampV99(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v99 · GAME-AWARE POOL CREATION</span>';if(x.innerHTML!==html)x.innerHTML=html})}LinksLifecycleCallbacksV82.push(stampV99);queueMicrotask(()=>{stampV99();LinksLifecycleV82.queue()});


// Launch Reveal v100 — first interior view is truthful, premium, and free of legacy demo urgency.
function launchRevealV100(){
 if(document.documentElement.dataset.view!=="home")return;const main=document.querySelector('.main'),cmd=document.querySelector('.home-command-v4');if(!main||!cmd)return;
 document.querySelectorAll('.home-launch,.game-showcase').forEach(x=>x.remove());
 const t=homeTruthV95(),has=t.created.length>0;
 if(!has){cmd.classList.add('fresh-account-v100');const stage=cmd.querySelector('.home-stage-copy');if(stage){stage.querySelector('span').textContent='WELCOME TO LINKS';stage.querySelector('h1').innerHTML='YOUR SPORTS.<br><em>YOUR POOLS. ONE HOME.</em>';stage.querySelector('p').textContent='Create a free pool, invite your people, and let LINKS handle picks, locks, standings and game day.';stage.querySelector('.home-primary').innerHTML='<button data-v100-create>CREATE A FREE POOL ›</button><button class="ghost" data-v100-games>EXPLORE GAMES</button>'}cmd.querySelector('.home-scorebug')?.remove();const now=cmd.querySelector('.home-now-grid');if(now)now.innerHTML='<button class="home-now" data-v100-create><div class="now-icon">＋</div><div><span>START HERE</span><b>CREATE YOUR FIRST POOL</b><small>Every LINKS pool is free</small></div><em>BUILD ›</em></button><button class="home-now" data-v100-games><div class="now-icon live">◆</div><div><span>GAME NETWORK</span><b>CHOOSE HOW YOU PLAY</b><small>Pick’em, Survivor, brackets, racing, golf and more</small></div><em>EXPLORE ›</em></button><button class="home-now" data-v100-join><div class="now-icon trophy">↗</div><div><span>HAVE AN INVITE?</span><b>JOIN THE RIGHT POOL</b><small>Your invite link takes you straight there</small></div><em>LEARN ›</em></button>';const sh=cmd.querySelector('.home-section-head');if(sh)sh.innerHTML='<div><span>LINKS GAME NETWORK</span><h2>Pick the game. LINKS runs the rest.</h2></div>';const rail=cmd.querySelector('.home-pool-rail');if(rail)rail.innerHTML='';}
 cmd.querySelectorAll('[data-v100-create]').forEach(b=>b.onclick=()=>CreatePoolStudio.open());cmd.querySelectorAll('[data-v100-games]').forEach(b=>b.onclick=()=>document.querySelector('.game-network-v2,.game-network-showcase')?.scrollIntoView({behavior:'smooth',block:'start'}));cmd.querySelectorAll('[data-v100-join]').forEach(b=>b.onclick=()=>AppStatus.show('ok','Use your invite link','A LINKS invitation opens the correct pool automatically.'));
}
function launchDockTruthV100(){const dock=document.querySelector('.mobile-dock');if(!dock)return;const due=homeTruthV95().picksDue,b=dock.querySelector('.dock-now b');if(b){b.textContent=due||'';b.hidden=!due}}
function launchBriefTruthV100(){if(document.documentElement.dataset.view!=="home")return;const t=homeTruthV95();document.querySelectorAll('.home-brief').forEach(box=>{const pick=box.querySelector('[data-home-go2="my-picks"]');if(pick){pick.querySelector('b').textContent=t.picksDue?(t.picksDue+' pick'+(t.picksDue===1?'':'s')+' to finish'):'Picks are caught up';pick.querySelector('small').textContent=t.picksDue?'Finish unlocked selections before kickoff':'You’ll see new selections when commissioners publish them'}})}
LinksLifecycleCallbacksV82.push(launchRevealV100,launchDockTruthV100,launchBriefTruthV100);
const LINKS_NEW_BUILD_VERSION_V100={version:'v100',label:'LAUNCH REVEAL'};function stampV100(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · '+LINKS_NEW_BUILD_VERSION_V100.version+' · '+LINKS_NEW_BUILD_VERSION_V100.label+'</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v100'}LinksLifecycleCallbacksV82.push(stampV100);queueMicrotask(()=>{launchRevealV100();launchDockTruthV100();launchBriefTruthV100();stampV100();LinksLifecycleV82.queue()});


// Real Portfolio v101 — My Pools and My Picks derive from actual created pools, slates and saved selections.
function createdPoolRowsV101(){return CreatedPools.all().map(c=>({c,p:PoolHubData[c.name]||{game:c.game,week:'NEW POOL',lock:'SETUP REQUIRED'},truth:poolTruthV90(c.name),g:gameIdentity(c.game||'')}))}
function pickStatusV101(name,game){const type=gameIdentity(game).type,slate=GameSlateStoreV86.read(name);if(type==='custom'){const d=CustomPoolStoreV91.read(name),done=!!PickEngine.get(name+'-custom-v91');return {done:done?1:0,total:d.choices?.length?1:0,due:done?0:(d.choices?.length?1:0)}}if(type==='bracket'){const ready=bracketIsReadyV92(name);return {done:0,total:ready?1:0,due:ready?1:0}}if(type==='squares')return {done:0,total:0,due:0};if(type==='survivor'||type==='game33'){const total=slate.length?1:0,done=type==='game33'?(Game33StoreV74.read(name).team?1:0):(PickEngine.get(name+'-survivor-week')?1:0);return {done,total,due:Math.max(0,total-done)}}let done=0;slate.forEach(g=>{if(PickEngine.get(name+'-'+g.id)||PickEngine.get('slate-'+g.id))done++});return {done,total:slate.length,due:Math.max(0,slate.length-done)}}
function myPoolsTruthV101(){const rows=createdPoolRowsV101(),due=rows.reduce((n,x)=>n+pickStatusV101(x.c.name,x.c.game).due,0);return '<section class="mypools-v3 real-v101"><div class="mypools-hero"><div><span>MY POOLS</span><h2>Everything you’re playing.</h2><p>Real setup, player and pick status from your LINKS pools.</p></div><button data-new-pool>+ CREATE POOL</button></div><div class="pool-summary"><div><b>'+rows.length+'</b><span>ACTIVE POOLS</span></div><div><b>'+due+'</b><span>PICKS DUE</span></div><div><b>'+rows.filter(x=>x.truth.setup).length+'</b><span>READY</span></div><div><b>'+rows.filter(x=>!x.truth.setup).length+'</b><span>SETUP NEEDED</span></div></div>'+(rows.length?'<div class="pool-portfolio">'+rows.map(x=>{const ps=pickStatusV101(x.c.name,x.c.game),pct=x.truth.members?Math.round(x.truth.ready/x.truth.members*100):0;return '<button class="portfolio-card '+(ps.due?'attention':'')+'" data-open-pool="'+linksEscape(x.c.name)+'"><div class="portfolio-art '+x.g.type+'">'+networkGlyph(x.g.type)+'<span>'+linksEscape(x.c.accent||x.g.label)+'</span></div><div class="portfolio-main"><span>'+linksEscape(x.c.game)+' · '+linksEscape(x.p.week||'NEW POOL')+'</span><h3>'+linksEscape(x.c.name)+'</h3><div class="portfolio-meta"><b>'+x.truth.members+' PLAYERS</b><b>'+(x.truth.setup?'GAME READY':'SETUP NEEDED')+'</b><b>'+ps.due+' DUE</b></div><div class="portfolio-progress"><i style="width:'+pct+'%"></i></div></div><div class="portfolio-rank"><span>YOUR STATUS</span><b>'+(ps.due?'ACTION':'READY')+'</b><small>'+ps.done+' / '+ps.total+' SAVED</small><em>'+(ps.due?'FINISH PICKS':'OPEN POOL')+' ›</em></div></button>'}).join('')+'</div>':'<div class="links-empty picks"><i>＋</i><h3>NO POOLS YET</h3><p>Create your first free pool and invite your group.</p></div>')+'<div class="pool-discover"><div><span>LINKS GAME NETWORK</span><h3>Start another kind of pool.</h3><p>Pick’em, Survivor, Squares, brackets, racing, golf, fantasy and more.</p></div><button data-browse-games>BROWSE GAMES ›</button></div></section>'}
function myPicksTruthV101(){const rows=createdPoolRowsV101().map(x=>({...x,ps:pickStatusV101(x.c.name,x.c.game)})),due=rows.reduce((n,x)=>n+x.ps.due,0),total=rows.reduce((n,x)=>n+x.ps.total,0),done=rows.reduce((n,x)=>n+x.ps.done,0),pct=total?Math.round(done/total*100):100;return '<section class="mypicks-v3 real-v101"><div class="mypicks-hero"><div><span>MY PICKS</span><h2>'+(due?due+' decision'+(due===1?'':'s')+' left.':'You’re caught up.')+'</h2><p>LINKS puts pools needing action first.</p></div><div class="pick-health-ring"><b>'+pct+'%</b><span>READY</span></div></div><div class="deadline-line"><i></i><div><span>YOUR CARD</span><b>'+rows.length+' active pool'+(rows.length===1?'':'s')+'</b></div><em>'+due+' PICK'+(due===1?'':'S')+' DUE</em></div><div class="pick-command-grid">'+rows.sort((a,b)=>b.ps.due-a.ps.due).map(x=>'<button class="pick-command-card '+(x.ps.due?'attention':'complete')+'" data-pickpool="'+linksEscape(x.c.name)+'"><div class="pick-card-art '+x.g.type+'">'+artHTML(gameCategory(x.c.game))+'</div><div class="pick-card-copy"><span>'+linksEscape(x.c.game)+'</span><h3>'+linksEscape(x.c.name)+'</h3><div class="pick-progress"><i style="width:'+(x.ps.total?Math.round(x.ps.done/x.ps.total*100):100)+'%"></i></div><small>'+x.ps.done+' OF '+x.ps.total+' SAVED</small><b>'+(x.ps.due?'FINISH PICKS':'OPEN POOL')+' ›</b></div></button>').join('')+'</div><div class="pick-safe-banner"><div class="safe-shield">✓</div><div><b>PICK SAFE</b><span>Your saved picks stay private until each game locks.</span></div><em>AUTO-SAVE ON</em></div></section>'}
function replacePortfolioV101(){const v=document.documentElement.dataset.view,ws=document.querySelector('.route-workspace');if(!ws)return;if(v==='my-pools'){const old=ws.querySelector('.mypools-v3');if(old&&!old.classList.contains('real-v101')){old.outerHTML=myPoolsTruthV101();ws.querySelectorAll('[data-open-pool]').forEach(b=>b.onclick=()=>LinksRouter.navigate('pool',b.dataset.openPool));ws.querySelector('[data-new-pool]')?.addEventListener('click',()=>CreatePoolStudio.open());ws.querySelector('[data-browse-games]')?.addEventListener('click',()=>LinksRouter.navigate('home'))}}if(v==='my-picks'){const old=ws.querySelector('.mypicks-v3');if(old&&!old.classList.contains('real-v101')){old.outerHTML=myPicksTruthV101();ws.querySelectorAll('[data-pickpool]').forEach(b=>b.onclick=()=>LinksRouter.navigate('pool',b.dataset.pickpool))}}}
LinksLifecycleCallbacksV82.push(replacePortfolioV101);function stampV101(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v101 · REAL PLAYER PORTFOLIO</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v101'}LinksLifecycleCallbacksV82.push(stampV101);queueMicrotask(()=>{replacePortfolioV101();stampV101();LinksLifecycleV82.queue()});


// Commissioner Ownership v102 — setup controls only appear when the current account owns that created pool.
const PoolOwnershipV102={key:'links-pool-ownership-v102',all(){try{return JSON.parse(localStorage.getItem(this.key)||'{}')||{}}catch{return{}}},claim(pool){if(!pool)return;const a=this.all();if(!a[pool]){a[pool]={owner:'self',createdAt:new Date().toISOString()};localStorage.setItem(this.key,JSON.stringify(a))}},owns(pool){const a=this.all();return a[pool]?.owner==='self'}};
function migrateOwnershipV102(){CreatedPools.all().forEach(p=>PoolOwnershipV102.claim(p.name))}
function isPoolCommissionerV102(pool){return CreatedPools.all().some(x=>x.name===pool)&&PoolOwnershipV102.owns(pool)}
function enforceCommissionerOwnershipV102(){migrateOwnershipV102();if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'';if(isPoolCommissionerV102(pool))return;document.querySelectorAll('[data-open-slate-v87],[data-custom-setup-open-v91],[data-bf92-open]').forEach(b=>b.closest('.pool-setup-action-v87')?.remove()||b.remove())}
const commissionerSlateActionV101=commissionerSlateActionV87;commissionerSlateActionV87=function(){const pool=document.documentElement.dataset.pool||'';if(!isPoolCommissionerV102(pool))return;return commissionerSlateActionV101()};
const commissionerCustomV101=commissionerCustomV91;commissionerCustomV91=function(){const pool=document.documentElement.dataset.pool||'';if(!isPoolCommissionerV102(pool))return;return commissionerCustomV101()};
const commissionerBracketV101=commissionerBracketV92;commissionerBracketV92=function(){const pool=document.documentElement.dataset.pool||'';if(!isPoolCommissionerV102(pool))return;return commissionerBracketV101()};
document.addEventListener('click',e=>{const setup=e.target.closest('[data-open-slate-v87],[data-custom-setup-open-v91],[data-bf92-open]');if(!setup)return;const pool=document.documentElement.dataset.pool||'';if(isPoolCommissionerV102(pool))return;e.preventDefault();e.stopImmediatePropagation();AppStatus.show('warn','Commissioner only','Only this pool’s commissioner can change game setup.')},true);
LinksLifecycleCallbacksV82.push(enforceCommissionerOwnershipV102);
function stampV102(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v102 · COMMISSIONER OWNERSHIP</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v102'}LinksLifecycleCallbacksV82.push(stampV102);queueMicrotask(()=>{migrateOwnershipV102();enforceCommissionerOwnershipV102();stampV102();LinksLifecycleV82.queue()});


// Real Commissioner Command v103 — dashboard metrics, reminders and week control use actual owned pools.
function commissionerPoolV103(){const q=new URL(location.href).searchParams.get('pool'),owned=CreatedPools.all().filter(x=>isPoolCommissionerV102(x.name));return owned.find(x=>x.name===q)||owned[0]||null}
function commissionerTruthV103(){const c=commissionerPoolV103();if(!c)return {c:null,players:[],missing:[],slate:[],next:null};const players=realEntrantsV88(c.name),missing=players.filter(x=>x.done<x.total),slate=GameSlateStoreV86.read(c.name),next=slate.filter(g=>!gameLockedV94(g)&&parseKickV94(g.kickAt)!==null).sort((a,b)=>parseKickV94(a.kickAt)-parseKickV94(b.kickAt))[0]||null;return {c,players,missing,slate,next}}
function commissionerPanelV103(){const t=commissionerTruthV103(),s=CommissionerState.read(),open=s.open!==false;if(!t.c)return '<section class="commander-v3 real-v103"><div class="command-hero"><div><span>COMMISSIONER COMMAND</span><h2>No pool to manage yet.</h2><p>Create a free pool and your live commissioner controls will appear here.</p></div></div><div class="command-actions"><button class="primary" data-cmd="create">CREATE A POOL ›</button></div></section>';const pool=t.c.name,ready=t.players.length-t.missing.length,next=t.next?new Date(t.next.kickAt):null;return '<section class="commander-v3 real-v103" data-command-pool="'+linksEscape(pool)+'"><div class="command-hero"><div><span>COMMISSIONER COMMAND · '+linksEscape(pool)+'</span><h2>'+linksEscape(t.c.game)+' is '+(open?'open.':'closed.')+'</h2><p>Real player readiness, published games and kickoff controls.</p></div><div class="command-health"><i class="'+(open?'live':'')+'"></i><b>'+(open?'OPEN':'CLOSED')+'</b><small>'+(t.slate.length?t.slate.length+' GAMES PUBLISHED':'SETUP NEEDED')+'</small></div></div><div class="command-metrics"><button data-cmd="entrants"><small>READY</small><strong>'+ready+' / '+t.players.length+'</strong><span>'+t.missing.length+' need picks</span></button><button data-cmd="invites"><small>INVITES</small><strong>'+InviteRegistryV98.read(pool).length+'</strong><span>sent to this pool</span></button><button data-cmd="locks"><small>NEXT LOCK</small><strong>'+(next?next.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'—')+'</strong><span>'+(next?next.toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'}):'No upcoming kickoff')+'</span></button><button data-cmd="audit"><small>AUDIT</small><strong>'+AuditLog.all().length+'</strong><span>recorded events</span></button></div><div class="command-actions"><button class="primary" data-cmd="remind">REMIND '+t.missing.length+' MISSING</button><button data-cmd="week">'+(open?'CLOSE PICKS':'OPEN PICKS')+'</button><button data-cmd="message">MESSAGE POOL</button><button data-cmd="settings">POOL SETTINGS</button></div><div class="command-feed"><div class="command-feed-head"><b>GAME CONTROL</b><span>Automatic kickoff locks are ON</span></div>'+(t.slate.length?t.slate.map(g=>{const locked=gameLockedV94(g)||LockEngine.isLocked(g.id);return '<div class="command-game"><div><b>'+linksEscape(g.away)+' <i>VS</i> '+linksEscape(g.home)+'</b><span>'+linksEscape(g.kick||'Kickoff scheduled')+'</span></div><em class="'+(locked?'locked':'')+'">'+(locked?'LOCKED':'AUTO LOCK')+'</em><button data-cmdlock="'+linksEscape(g.id)+'">'+(LockEngine.isLocked(g.id)?'UNLOCK MANUAL':'LOCK NOW')+'</button></div>'}).join(''):'<div class="links-empty picks"><h3>NO GAME SLATE PUBLISHED</h3><p>Open the pool and publish its games before players pick.</p></div>')+'</div></section>'}
commissionerPanel=commissionerPanelV103;
const wireCommissionerV102=wireCommissionerV3;wireCommissionerV3=function(ws){const t=commissionerTruthV103();if(!t.c){ws.querySelector('[data-cmd="create"]')?.addEventListener('click',()=>CreatePoolStudio.open());return}wireCommissionerV102(ws);const remind=ws.querySelector('[data-cmd="remind"]');if(remind){const clone=remind.cloneNode(true);remind.replaceWith(clone);clone.addEventListener('click',()=>{t.missing.forEach(x=>ReminderQueue.send(x.contact||x.name));AuditLog.add('REMINDER BATCH',t.c.name+' · '+t.missing.length+' missing');AppStatus.show('ok','Reminders queued',t.missing.length+' player'+(t.missing.length===1?'':'s'))})}}
function refreshCommissionerV103(){if(document.documentElement.dataset.view!=='commissioner')return;const ws=document.querySelector('.route-workspace'),old=ws?.querySelector('.commander-v3');if(old&&!old.classList.contains('real-v103')){old.outerHTML=commissionerPanel();wireCommissionerV3(ws)}}
LinksLifecycleCallbacksV82.push(refreshCommissionerV103);function stampV103(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v103 · REAL COMMISSIONER COMMAND</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v103'}LinksLifecycleCallbacksV82.push(stampV103);queueMicrotask(()=>{refreshCommissionerV103();stampV103();LinksLifecycleV82.queue()});


// Results Truth v104 — never show fabricated scores, leaders or standings on a real account.
function resultsTruthV104(){const rows=createdPoolRowsV101();return '<section class="results-arena real-v104"><div class="results-hero"><div><span>LINKS RESULTS</span><h2>'+(rows.length?'Your pools. Your results.':'Results start when your pools do.')+'</h2><p>Final standings appear only after real game results and saved picks are available.</p></div><div class="results-live"><i></i><b>'+rows.length+' POOL'+(rows.length===1?'':'S')+'</b><small>NO DEMO SCORES</small></div></div>'+(rows.length?'<div class="result-pool-grid">'+rows.map(x=>{const slate=GameSlateStoreV86.read(x.c.name),locked=slate.filter(g=>gameLockedV94(g)||LockEngine.isLocked(g.id)).length;return '<button class="result-pool-card" data-result-pool="'+linksEscape(x.c.name)+'"><div>'+networkGlyph(x.g.type)+'</div><span>'+linksEscape(x.c.game)+'</span><h3>'+linksEscape(x.c.name)+'</h3><p>'+slate.length+' published game'+(slate.length===1?'':'s')+' · '+locked+' locked</p><b>'+(slate.length?'OPEN POOL RESULTS':'WAITING FOR GAME SETUP')+' ›</b></button>'}).join('')+'</div><div class="results-pending-v104"><div class="winner-mark">✓</div><div><span>SCORING INTEGRITY</span><h3>LINKS will not invent a leaderboard.</h3><p>Scores, winners and standings will populate from real result data. Until then, your saved pool state stays intact without placeholder winners.</p></div></div>':'<div class="links-empty results"><i>★</i><h3>NO RESULTS YET</h3><p>Create or join a pool. Results will build here as games are played.</p><button data-results-create>CREATE A FREE POOL ›</button></div>')+'</section>'}
function replaceResultsV104(){if(document.documentElement.dataset.view!=='results')return;const ws=document.querySelector('.route-workspace');if(!ws)return;const old=ws.querySelector('.results-arena');if(old&&!old.classList.contains('real-v104'))old.outerHTML=resultsTruthV104();else if(!old)ws.insertAdjacentHTML('beforeend',resultsTruthV104());ws.querySelectorAll('[data-result-pool]').forEach(b=>b.onclick=()=>LinksRouter.navigate('pool',b.dataset.resultPool));ws.querySelector('[data-results-create]')?.addEventListener('click',()=>CreatePoolStudio.open())}
const mountResultsArenaV103=mountResultsArena;mountResultsArena=function(){if(document.documentElement.dataset.view!=='results')return;replaceResultsV104()};
LinksLifecycleCallbacksV82.push(replaceResultsV104);
function stampV104(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v104 · RESULTS INTEGRITY</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v104'}LinksLifecycleCallbacksV82.push(stampV104);queueMicrotask(()=>{replaceResultsV104();stampV104();LinksLifecycleV82.queue()});


// Inbox Truth v105 — notifications are generated from real pool state instead of seeded demo alerts.
const InboxTruthV105={key:'links-inbox-read-v105',readState(){try{return JSON.parse(localStorage.getItem(this.key)||'{}')||{}}catch{return{}}},mark(id){const a=this.readState();a[id]=true;localStorage.setItem(this.key,JSON.stringify(a))},items(){const read=this.readState(),out=[];createdPoolRowsV101().forEach(x=>{const ps=pickStatusV101(x.c.name,x.c.game),slate=GameSlateStoreV86.read(x.c.name),next=slate.filter(g=>!gameLockedV94(g)&&parseKickV94(g.kickAt)!==null).sort((a,b)=>parseKickV94(a.kickAt)-parseKickV94(b.kickAt))[0];if(ps.due)out.push({id:'due-'+x.c.name,type:'urgent',icon:'⏱',title:ps.due+' pick'+(ps.due===1?'':'s')+' still due',body:x.c.name+(next?' · next lock '+new Date(next.kickAt).toLocaleString([],{weekday:'short',hour:'numeric',minute:'2-digit'}):' · picks are open'),action:'PICKS'});if(isPoolCommissionerV102(x.c.name)&&!x.truth.setup)out.push({id:'setup-'+x.c.name,type:'admin',icon:'L',title:'Pool setup needed',body:x.c.name+' needs its game setup before players can pick.',action:'POOL'});const invites=InviteRegistryV98.read(x.c.name);if(isPoolCommissionerV102(x.c.name)&&invites.length)out.push({id:'invites-'+x.c.name,type:'admin',icon:'+',title:invites.length+' invite'+(invites.length===1?'':'s')+' sent',body:x.c.name+' · player list is ready for follow-up.',action:'POOL'})});return out.map(x=>({...x,time:'NOW',read:!!read[x.id]}))}};
function inboxTruthViewV105(){const items=InboxTruthV105.items(),unread=items.filter(x=>!x.read).length;return '<section class="smart-inbox-v2 real-v105"><div class="inbox-hero"><div><span>SMART INBOX</span><h2>'+(unread?unread+' thing'+(unread===1?'':'s')+' need your attention.':'You’re caught up.')+'</h2><p>Only real deadlines, setup needs and pool activity appear here.</p></div><div class="inbox-orb"><b>'+unread+'</b><span>UNREAD</span></div></div><div class="inbox-filter"><button class="active" data-ifilter="all">ALL</button><button data-ifilter="urgent">ACTION</button><button data-ifilter="admin">POOL</button></div><div class="inbox-list">'+(items.length?items.map(x=>'<button class="inbox-item '+x.type+' '+(!x.read?'unread':'')+'" data-inbox="'+linksEscape(x.id)+'" data-itype="'+x.type+'"><i>'+x.icon+'</i><div><b>'+linksEscape(x.title)+'</b><span>'+linksEscape(x.body)+'</span></div><time>'+x.time+'</time><em>'+x.action+' ›</em></button>').join(''):'<div class="links-empty inbox"><i>✓</i><h3>ALL CAUGHT UP</h3><p>No fake alerts and nothing currently needs your attention.</p></div>')+'</div></section>'}
function replaceInboxV105(){const v=document.documentElement.dataset.view;if(v!=='messages'&&v!=='notifications')return;const ws=document.querySelector('.route-workspace');if(!ws)return;const old=ws.querySelector('.smart-inbox-v2');if(old&&!old.classList.contains('real-v105'))old.outerHTML=inboxTruthViewV105();else if(!old)ws.insertAdjacentHTML('beforeend',inboxTruthViewV105());ws.querySelectorAll('[data-ifilter]').forEach(b=>b.onclick=()=>{ws.querySelectorAll('[data-ifilter]').forEach(x=>x.classList.toggle('active',x===b));ws.querySelectorAll('.inbox-item').forEach(x=>x.hidden=b.dataset.ifilter!=='all'&&x.dataset.itype!==b.dataset.ifilter)});ws.querySelectorAll('[data-inbox]').forEach(b=>b.onclick=()=>{InboxTruthV105.mark(b.dataset.inbox);const t=b.querySelector('em').textContent;if(t.includes('PICKS'))LinksRouter.navigate('my-picks');else LinksRouter.navigate('my-pools')})}
function syncDockInboxV105(){const unread=InboxTruthV105.items().filter(x=>!x.read).length;document.querySelectorAll(".mobile-dock [data-mobile-route='notifications'] b,.mobile-dock [data-mobile-route='notifications'] .badge,.mobile-more-sheet [data-mobile-route='notifications'] b").forEach(x=>{x.textContent=unread||'';x.hidden=!unread;x.title=unread+' unread alerts'})}
LinksLifecycleCallbacksV82.push(replaceInboxV105,syncDockInboxV105);function stampV105(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v105 · REAL SMART INBOX</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v105'}LinksLifecycleCallbacksV82.push(stampV105);queueMicrotask(()=>{replaceInboxV105();syncDockInboxV105();stampV105();LinksLifecycleV82.queue()});


// Pool-Scoped Settings v106 — commissioner rules and autopilot state no longer leak across pools.
const PoolSettingsV106={key:'links-pool-settings-v106',all(){try{return JSON.parse(localStorage.getItem(this.key)||'{}')||{}}catch{return{}}},read(pool){return this.all()[pool]||{}},write(pool,patch){const a=this.all();a[pool]={...(a[pool]||{}),...patch};localStorage.setItem(this.key,JSON.stringify(a));return a[pool]}};
function setupStudioV106(pool){const c=CreatedPools.all().find(x=>x.name===pool),profile=createRuleProfileV99(c?.game||PoolHubData[pool]?.game||''),s={format:profile.scoring[0],deadline:profile.deadline[0],tiebreak:'Combined score',picks:'All selected games',confidence:false,bestBet:false,...PoolSettingsV106.read(pool)};return '<section class="setup-studio" data-settings-pool="'+linksEscape(pool)+'"><div class="setup-hero"><div><span>POOL SETTINGS · '+linksEscape(pool)+'</span><h2>Rules stay with this pool.</h2><p>Changes here never alter another LINKS pool.</p></div><div class="setup-score"><b>'+profile.scoring.length+'</b><span>SCORING MODE'+(profile.scoring.length===1?'':'S')+'</span></div></div><div class="setup-grid"><div class="setup-card"><span>'+profile.labels[1]+'</span><h3>'+linksEscape(s.format)+'</h3><div class="segmented" data-setup="format">'+profile.scoring.map(x=>'<button class="'+(s.format===x?'active':'')+'">'+linksEscape(x)+'</button>').join('')+'</div></div><div class="setup-card"><span>'+profile.labels[0]+'</span><h3>'+linksEscape(s.deadline)+'</h3><div class="segmented" data-setup="deadline">'+profile.deadline.map(x=>'<button class="'+(s.deadline===x?'active':'')+'">'+linksEscape(x)+'</button>').join('')+'</div></div><div class="setup-card"><span>PICK REQUIREMENT</span><h3>'+linksEscape(s.picks)+'</h3><div class="segmented" data-setup="picks"><button class="active">All selected games</button></div></div><div class="setup-card"><span>TIEBREAKER</span><h3>'+linksEscape(s.tiebreak)+'</h3><div class="segmented" data-setup="tiebreak"><button class="'+(s.tiebreak==='Combined score'?'active':'')+'">Combined score</button><button class="'+(s.tiebreak==='None'?'active':'')+'">None</button></div></div></div><div class="setup-preview"><div><span>PLAYER PREVIEW</span><h3>'+linksEscape(c?.game||'Pool rules')+'</h3></div><div class="preview-rule"><b>1</b><span>'+linksEscape(s.format)+'</span></div><div class="preview-rule"><b>2</b><span>'+linksEscape(s.deadline)+'</span></div><div class="preview-rule"><b>3</b><span>'+linksEscape(s.tiebreak)+' tiebreaker</span></div><button data-save-setup>SAVE '+linksEscape(pool)+' RULES</button></div></section>'}
openSetupStudio=function(){const pool=commissionerPoolV103()?.name;if(!pool||!isPoolCommissionerV102(pool)){AppStatus.show('warn','Commissioner only','Choose a pool you manage first.');return}modal('POOL SETTINGS','<div id="setupMount"></div>');const host=document.querySelector('#setupMount');host.innerHTML=setupStudioV106(pool);wireSetupV106(host,pool)};
function wireSetupV106(host,pool){host.querySelectorAll('[data-setup]').forEach(g=>g.querySelectorAll('button').forEach(b=>b.onclick=()=>{PoolSettingsV106.write(pool,{[g.dataset.setup]:b.textContent.trim()});host.innerHTML=setupStudioV106(pool);wireSetupV106(host,pool)}));host.querySelector('[data-save-setup]')?.addEventListener('click',()=>{AuditLog.add('POOL RULES SAVED',pool+' · commissioner updated rules');document.querySelector('.modal')?.remove();AppStatus.show('ok','Rules saved',pool)})}
function migratePoolSettingsV106(){const pools=CreatedPools.all();if(pools.length!==1)return;const pool=pools[0].name;if(Object.keys(PoolSettingsV106.read(pool)).length)return;const legacy=SetupState.read();if(Object.keys(legacy).length)PoolSettingsV106.write(pool,{format:legacy.format||legacy.style,deadline:legacy.deadline,tiebreak:legacy.tiebreak,picks:legacy.picks})}
LinksLifecycleCallbacksV82.push(migratePoolSettingsV106);function stampV106(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v106 · POOL-SCOPED SETTINGS</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v106'}LinksLifecycleCallbacksV82.push(stampV106);queueMicrotask(()=>{migratePoolSettingsV106();stampV106();LinksLifecycleV82.queue()});


// Real Pool Room v107 — remove seeded chat, fake member counts and hard-coded Week 3 copy.
function roomTruthV107(pool){const truth=poolTruthV90(pool),msgs=RoomStore.load(pool),slate=GameSlateStoreV86.read(pool),next=slate.filter(g=>!gameLockedV94(g)&&parseKickV94(g.kickAt)!==null).sort((a,b)=>parseKickV94(a.kickAt)-parseKickV94(b.kickAt))[0],settings=PoolSettingsV106.read(pool),commissioner=isPoolCommissionerV102(pool);return {truth,msgs,slate,next,settings,commissioner}}
roomV2=function(pool){const t=roomTruthV107(pool),lock=t.next?('Next lock '+new Date(t.next.kickAt).toLocaleString([],{weekday:'short',hour:'numeric',minute:'2-digit'})):(t.slate.length?'All published games are locked':'Game setup has not been published yet');return '<section class="room-v2 real-v107"><div class="room-hero"><div><span>POOL ROOM</span><h2>'+linksEscape(pool)+'</h2><p>Game-day talk, commissioner updates and bragging rights.</p></div><div class="room-live"><i></i><b>'+t.truth.members+'</b><span>MEMBER'+(t.truth.members===1?'':'S')+'</span></div></div><div class="room-pinned"><i>L</i><div><span>POOL STATUS</span><b>'+linksEscape(lock)+'</b></div><em>RULES ›</em></div><div class="room-feed">'+(t.msgs.length?t.msgs.map(m=>'<div class="room-message '+(m.who==='You'?'mine':'')+'"><i>'+linksEscape((m.who||'P').charAt(0))+'</i><div><b>'+linksEscape(m.who||'Player')+'</b><p>'+linksEscape(m.text||'')+'</p><time>'+linksEscape(m.at||'')+'</time></div></div>').join(''):'<div class="links-empty room"><i>✦</i><h3>START THE CONVERSATION</h3><p>No fake chatter here. Messages from this pool will appear as members post them.</p></div>')+'</div><form class="room-compose"><i>YOU</i><input maxlength="280" placeholder="Message the pool…" autocomplete="off"><button>SEND</button></form><div class="room-foot"><span>Keep it fun. '+(t.commissioner?'You manage this room.':'The commissioner manages this room.')+'</span><b>GAME DAY CHAT</b></div></section>'};
RoomStore.add=function(pool,text){let all={};try{all=JSON.parse(localStorage.getItem(this.key)||'{}')}catch{};const arr=all[pool]||[];arr.push({who:'You',text:String(text).slice(0,280),at:new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})});all[pool]=arr.slice(-100);localStorage.setItem(this.key,JSON.stringify(all));return all[pool]};
hydrateRoomText=function(){};
openRoomWire=function(host,pool){host.querySelector('.room-pinned')?.addEventListener('click',()=>{const t=roomTruthV107(pool),deadline=t.settings.deadline||'Automatic game lock',format=t.settings.format||PoolHubData[pool]?.game||'Pool rules';modal('POOL RULES','<div class="connected-modal"><span class="badge live">'+linksEscape(format)+'</span><h3>'+linksEscape(deadline)+'</h3><p>'+(t.slate.length?'Published games follow the commissioner settings shown here.':'The commissioner has not published the game slate yet.')+'</p></div>')})};
function repairOpenRoomV107(){const host=document.querySelector('#roomV2Mount');if(!host)return;const pool=document.documentElement.dataset.pool||new URL(location.href).searchParams.get('pool');if(!pool)return;if(!host.querySelector('.real-v107')){host.innerHTML=roomV2(pool);openRoomWire(host,pool);host.querySelector('.room-compose')?.addEventListener('submit',e=>{e.preventDefault();const input=e.currentTarget.querySelector('input'),v=input.value.trim();if(!v)return;RoomStore.add(pool,v);host.innerHTML=roomV2(pool);repairOpenRoomV107()})}}
LinksLifecycleCallbacksV82.push(repairOpenRoomV107);function stampV107(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v107 · REAL POOL ROOM</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v107'}LinksLifecycleCallbacksV82.push(stampV107);queueMicrotask(()=>{stampV107();LinksLifecycleV82.queue()});


// Honest Unsupported Engines v108 — Golf, NASCAR, Fantasy and Dynasty never masquerade as working demo engines.
function honestEngineV108(pool,type){const c=CreatedPools.all().find(x=>x.name===pool),d=FormatAdapters[type],owner=isPoolCommissionerV102(pool);return '<section class="format-honest-v108 fh-'+type+'"><div class="format-head fh-'+type+'"><div>'+networkGlyph(type)+'</div><span>'+linksEscape(d?.kicker||'LINKS GAME')+'</span><h3>'+linksEscape(d?.title||c?.game||'Pool')+'</h3><p>'+linksEscape(d?.copy||'This game is being configured for your pool.')+'</p></div><div class="engine-state-v108"><i>⚙</i><div><span>ENGINE STATUS</span><h3>Setup is not published yet.</h3><p>LINKS will not show sample players, drivers, golfers, rosters, projections or fake picks as if they belong to this pool.</p></div><b>WAITING FOR SETUP</b></div><div class="engine-path-v108"><span><small>01</small><b>COMMISSIONER SETUP</b><em>'+(owner?'You manage this pool':'Commissioner controlled')+'</em></span><span><small>02</small><b>PUBLISH FIELD</b><em>Real entrants only</em></span><span><small>03</small><b>PLAYER PICKS</b><em>Opens after setup</em></span></div>'+(owner?'<button class="format-primary" data-v108-admin>OPEN COMMISSIONER ›</button>':'<div class="format-foot"><span>Your commissioner will open this game when setup is complete.</span></div>')+'</section>'}
const mountFormatAdapterV107=mountFormatAdapter;mountFormatAdapter=function(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',type=gameIdentity(PoolHubData[pool]?.game||'').type;if(['golf','racing','fantasy','dynasty'].includes(type)){const live=document.querySelector('.pool-tab-live');if(!live)return;const active=[...document.querySelectorAll('.poolhub-tabs button,.pool-tabs button')].find(b=>b.classList.contains('active'))?.textContent.trim().toLowerCase();if(active!=='picks')return;live.dataset.formatAdapter='1';live.innerHTML=honestEngineV108(pool,type);live.querySelector('[data-v108-admin]')?.addEventListener('click',()=>LinksRouter.navigate('commissioner'));return}return mountFormatAdapterV107()};
function scrubUnsupportedPreviewV108(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',type=gameIdentity(PoolHubData[pool]?.game||'').type;if(!['golf','racing','fantasy','dynasty'].includes(type))return;const live=document.querySelector('.pool-tab-live');if(!live)return;const fake=live.querySelector('.golf-preview,.race-preview,.fantasy-preview');if(fake||(!live.querySelector('.format-honest-v108')&&live.dataset.formatAdapter==='1')){live.innerHTML=honestEngineV108(pool,type);live.querySelector('[data-v108-admin]')?.addEventListener('click',()=>LinksRouter.navigate('commissioner'))}}
LinksLifecycleCallbacksV82.push(scrubUnsupportedPreviewV108);function stampV108(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v108 · HONEST GAME ENGINES</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v108'}LinksLifecycleCallbacksV82.push(stampV108);queueMicrotask(()=>{scrubUnsupportedPreviewV108();stampV108();LinksLifecycleV82.queue()});


// Golf Engine Foundation v109 — commissioner field + real player golfer selections.
const GolfPoolV109={key:'links-golf-v109',all(){try{return JSON.parse(localStorage.getItem(this.key)||'{}')||{}}catch{return{}}},read(pool){return this.all()[pool]||{title:'Golf Tournament',pickCount:4,golfers:[],published:false}},write(pool,v){const a=this.all();a[pool]={...this.read(pool),...v};localStorage.setItem(this.key,JSON.stringify(a));return a[pool]}};
function golfSetupV109(pool){const d=GolfPoolV109.read(pool);return '<section class="golf-setup-v109"><span>GOLF FIELD SETUP</span><h3>Publish the real tournament field.</h3><label>TOURNAMENT NAME<input data-g109-title value="'+linksEscape(d.title)+'" placeholder="The Masters"></label><label>GOLFERS TO PICK<input data-g109-count type="number" min="1" max="12" value="'+d.pickCount+'"></label><label>GOLFER FIELD<textarea data-g109-field rows="12" placeholder="One golfer per line">'+linksEscape(d.golfers.join('\n'))+'</textarea></label><button data-g109-publish>PUBLISH GOLF FIELD ›</button></section>'}
function openGolfSetupV109(pool){modal('GOLF POOL SETUP','<div id="golf109Mount">'+golfSetupV109(pool)+'</div>');const h=document.querySelector('#golf109Mount');h?.querySelector('[data-g109-publish]')?.addEventListener('click',()=>{const title=h.querySelector('[data-g109-title]').value.trim()||'Golf Tournament',pickCount=Math.max(1,Math.min(12,Number(h.querySelector('[data-g109-count]').value)||4)),golfers=h.querySelector('[data-g109-field]').value.split(/\n/).map(x=>x.trim()).filter(Boolean),unique=[...new Set(golfers.map(x=>x.toLowerCase()))];if(golfers.length<pickCount){AppStatus.show('warn','Field incomplete','Add at least '+pickCount+' golfers.');return}if(unique.length!==golfers.length){AppStatus.show('warn','Duplicate golfers','Each golfer should appear once.');return}GolfPoolV109.write(pool,{title,pickCount,golfers,published:true});AuditLog.add('GOLF FIELD PUBLISHED',pool+' · '+golfers.length+' golfers · pick '+pickCount);document.querySelector('.modal')?.remove();AppStatus.show('ok','Golf field published',golfers.length+' golfers ready');LinksLifecycleV82.queue()})}
function golfPlayerV109(pool){const d=GolfPoolV109.read(pool),saved=PickEngine.get(pool+'-golf-v109')?.team||'',picks=saved?String(saved).split('|').filter(Boolean):[];if(!d.published)return honestEngineV108(pool,'golf');return '<section class="golf-player-v109"><div class="hub-panel-head"><span>GOLF · '+linksEscape(d.title)+'</span><h3>Pick '+d.pickCount+' golfer'+(d.pickCount===1?'':'s')+'.</h3><p>Your card saves on this device. You can change selections until the pool locks.</p></div><div class="golf-field-v109">'+d.golfers.map((g,i)=>'<button data-g109-pick="'+linksEscape(g)+'" class="'+(picks.includes(g)?'selected':'')+'"><i>'+(i+1)+'</i><b>'+linksEscape(g)+'</b><span>'+(picks.includes(g)?'SELECTED':'SELECT')+'</span></button>').join('')+'</div><div class="adapter-proof"><b>'+picks.length+' / '+d.pickCount+' SELECTED</b><span>'+(picks.length===d.pickCount?'CARD READY':'CHOOSE '+(d.pickCount-picks.length)+' MORE')+'</span></div></section>'}
function mountGolfV109(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',type=gameIdentity(PoolHubData[pool]?.game||'').type;if(type!=='golf')return;const live=document.querySelector('.pool-tab-live');if(!live)return;const active=[...document.querySelectorAll('.poolhub-tabs button,.pool-tabs button')].find(b=>b.classList.contains('active'))?.textContent.trim().toLowerCase();if(active!=='picks')return;live.dataset.formatAdapter='1';live.innerHTML=golfPlayerV109(pool);live.querySelectorAll('[data-g109-pick]').forEach(b=>b.onclick=()=>{const d=GolfPoolV109.read(pool),saved=PickEngine.get(pool+'-golf-v109')?.team||'',picks=saved?String(saved).split('|').filter(Boolean):[],g=b.dataset.g109Pick,i=picks.indexOf(g);if(i>=0)picks.splice(i,1);else if(picks.length<d.pickCount)picks.push(g);else{AppStatus.show('warn','Card full','Choose '+d.pickCount+' golfers. Remove one to change your card.');return}PickEngine.save(pool+'-golf-v109',picks.join('|'));mountGolfV109();AppStatus.show('ok','Golf card saved',picks.length+' / '+d.pickCount+' selected')})}
function commissionerGolfV109(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',p=PoolHubData[pool];if(!p||gameIdentity(p.game||'').type!=='golf'||!isPoolCommissionerV102(pool))return;const hub=document.querySelector('.pool-hub'),hero=hub?.querySelector('.poolhub-hero');if(!hero||hub.querySelector('[data-g109-setup]'))return;const d=GolfPoolV109.read(pool);hero.insertAdjacentHTML('afterend','<div class="pool-setup-action-v87"><div><span>COMMISSIONER GOLF SETUP</span><b>'+(d.published?'FIELD PUBLISHED':'PLAYER PICKS ARE WAITING')+'</b><small>'+(d.published?d.golfers.length+' golfers · pick '+d.pickCount:'Add the actual tournament field before picks open.')+'</small></div><button data-g109-setup>'+(d.published?'EDIT GOLF FIELD':'SET UP GOLF')+' ›</button></div>');hub.querySelector('[data-g109-setup]').onclick=()=>openGolfSetupV109(pool)}
LinksLifecycleCallbacksV82.push(mountGolfV109,commissionerGolfV109);function stampV109(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v109 · GOLF ENGINE FOUNDATION</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v109'}LinksLifecycleCallbacksV82.push(stampV109);queueMicrotask(()=>{mountGolfV109();commissionerGolfV109();stampV109();LinksLifecycleV82.queue()});


// NASCAR Engine Foundation v110 — commissioner race field + real driver selections.
const NascarPoolV110={key:'links-nascar-v110',all(){try{return JSON.parse(localStorage.getItem(this.key)||'{}')||{}}catch{return{}}},read(pool){return this.all()[pool]||{title:'Race Day',pickCount:3,drivers:[],published:false}},write(pool,v){const a=this.all();a[pool]={...this.read(pool),...v};localStorage.setItem(this.key,JSON.stringify(a));return a[pool]}};
function nascarSetupV110(pool){const d=NascarPoolV110.read(pool);return '<section class="nascar-setup-v110"><span>NASCAR FIELD SETUP</span><h3>Publish the real race field.</h3><label>RACE NAME<input data-n110-title value="'+linksEscape(d.title)+'" placeholder="Bristol Night Race"></label><label>DRIVERS TO PICK<input data-n110-count type="number" min="1" max="10" value="'+d.pickCount+'"></label><label>DRIVER FIELD<textarea data-n110-field rows="14" placeholder="One driver per line">'+linksEscape(d.drivers.join('\n'))+'</textarea></label><button data-n110-publish>PUBLISH RACE FIELD ›</button></section>'}
function openNascarSetupV110(pool){modal('NASCAR POOL SETUP','<div id="nascar110Mount">'+nascarSetupV110(pool)+'</div>');const h=document.querySelector('#nascar110Mount');h?.querySelector('[data-n110-publish]')?.addEventListener('click',()=>{const title=h.querySelector('[data-n110-title]').value.trim()||'Race Day',pickCount=Math.max(1,Math.min(10,Number(h.querySelector('[data-n110-count]').value)||3)),drivers=h.querySelector('[data-n110-field]').value.split(/\n/).map(x=>x.trim()).filter(Boolean),unique=[...new Set(drivers.map(x=>x.toLowerCase()))];if(drivers.length<pickCount){AppStatus.show('warn','Field incomplete','Add at least '+pickCount+' drivers.');return}if(unique.length!==drivers.length){AppStatus.show('warn','Duplicate drivers','Each driver should appear once.');return}NascarPoolV110.write(pool,{title,pickCount,drivers,published:true});AuditLog.add('NASCAR FIELD PUBLISHED',pool+' · '+drivers.length+' drivers · pick '+pickCount);document.querySelector('.modal')?.remove();AppStatus.show('ok','Race field published',drivers.length+' drivers ready');LinksLifecycleV82.queue()})}
function nascarPlayerV110(pool){const d=NascarPoolV110.read(pool),saved=PickEngine.get(pool+'-nascar-v110')?.team||'',picks=saved?String(saved).split('|').filter(Boolean):[];if(!d.published)return honestEngineV108(pool,'racing');return '<section class="nascar-player-v110"><div class="hub-panel-head"><span>NASCAR · '+linksEscape(d.title)+'</span><h3>Pick '+d.pickCount+' driver'+(d.pickCount===1?'':'s')+'.</h3><p>Build your race card before the green flag. Your selections save automatically.</p></div><div class="nascar-field-v110">'+d.drivers.map((g,i)=>'<button data-n110-pick="'+linksEscape(g)+'" class="'+(picks.includes(g)?'selected':'')+'"><i>'+(i+1)+'</i><b>'+linksEscape(g)+'</b><span>'+(picks.includes(g)?'SELECTED':'SELECT DRIVER')+'</span></button>').join('')+'</div><div class="adapter-proof"><b>'+picks.length+' / '+d.pickCount+' SELECTED</b><span>'+(picks.length===d.pickCount?'RACE CARD READY':'CHOOSE '+(d.pickCount-picks.length)+' MORE')+'</span></div></section>'}
function mountNascarV110(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',type=gameIdentity(PoolHubData[pool]?.game||'').type;if(type!=='racing')return;const live=document.querySelector('.pool-tab-live');if(!live)return;const active=[...document.querySelectorAll('.poolhub-tabs button,.pool-tabs button')].find(b=>b.classList.contains('active'))?.textContent.trim().toLowerCase();if(active!=='picks')return;live.dataset.formatAdapter='1';live.innerHTML=nascarPlayerV110(pool);live.querySelectorAll('[data-n110-pick]').forEach(b=>b.onclick=()=>{const d=NascarPoolV110.read(pool),saved=PickEngine.get(pool+'-nascar-v110')?.team||'',picks=saved?String(saved).split('|').filter(Boolean):[],g=b.dataset.n110Pick,i=picks.indexOf(g);if(i>=0)picks.splice(i,1);else if(picks.length<d.pickCount)picks.push(g);else{AppStatus.show('warn','Race card full','Choose '+d.pickCount+' drivers. Remove one to change your card.');return}PickEngine.save(pool+'-nascar-v110',picks.join('|'));mountNascarV110();AppStatus.show('ok','Race card saved',picks.length+' / '+d.pickCount+' selected')})}
function commissionerNascarV110(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',p=PoolHubData[pool];if(!p||gameIdentity(p.game||'').type!=='racing'||!isPoolCommissionerV102(pool))return;const hub=document.querySelector('.pool-hub'),hero=hub?.querySelector('.poolhub-hero');if(!hero||hub.querySelector('[data-n110-setup]'))return;const d=NascarPoolV110.read(pool);hero.insertAdjacentHTML('afterend','<div class="pool-setup-action-v87"><div><span>COMMISSIONER NASCAR SETUP</span><b>'+(d.published?'FIELD PUBLISHED':'PLAYER PICKS ARE WAITING')+'</b><small>'+(d.published?d.drivers.length+' drivers · pick '+d.pickCount:'Add the actual race field before picks open.')+'</small></div><button data-n110-setup>'+(d.published?'EDIT RACE FIELD':'SET UP NASCAR')+' ›</button></div>');hub.querySelector('[data-n110-setup]').onclick=()=>openNascarSetupV110(pool)}
LinksLifecycleCallbacksV82.push(mountNascarV110,commissionerNascarV110);function stampV110(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v110 · NASCAR ENGINE FOUNDATION</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v110'}LinksLifecycleCallbacksV82.push(stampV110);queueMicrotask(()=>{mountNascarV110();commissionerNascarV110();stampV110();LinksLifecycleV82.queue()});


// Field Scoring v111 — commissioners can enter real Golf/NASCAR finishes and LINKS scores saved cards.
const FieldResultsV111={key:'links-field-results-v111',all(){try{return JSON.parse(localStorage.getItem(this.key)||'{}')||{}}catch{return{}}},read(pool){return this.all()[pool]||{}},write(pool,v){const a=this.all();a[pool]=v;localStorage.setItem(this.key,JSON.stringify(a));return v}};
function fieldConfigV111(pool){const type=gameIdentity(PoolHubData[pool]?.game||'').type;if(type==='golf'){const d=GolfPoolV109.read(pool);return {type,title:d.title,field:d.golfers,pickCount:d.pickCount,key:pool+'-golf-v109',label:'GOLFER'}}if(type==='racing'){const d=NascarPoolV110.read(pool);return {type,title:d.title,field:d.drivers,pickCount:d.pickCount,key:pool+'-nascar-v110',label:'DRIVER'}}return null}
function fieldScoringV111(pool){const c=fieldConfigV111(pool),r=FieldResultsV111.read(pool);if(!c)return '';return '<section class="field-score-v111"><span>'+c.type.toUpperCase()+' RESULTS</span><h3>'+linksEscape(c.title)+'</h3><p>Enter each '+c.label.toLowerCase()+'’s finishing position. LINKS uses the lowest combined finish as the best card.</p><div class="field-score-grid-v111">'+c.field.map(n=>'<label><b>'+linksEscape(n)+'</b><input type="number" min="1" max="200" data-v111-name="'+linksEscape(n)+'" value="'+(r[n]||'')+'" placeholder="FINISH"></label>').join('')+'</div><button data-v111-save>SAVE RESULTS ›</button></section>'}
function openFieldScoringV111(pool){if(!isPoolCommissionerV102(pool))return;modal('ENTER RESULTS','<div id="field111Mount">'+fieldScoringV111(pool)+'</div>');const h=document.querySelector('#field111Mount');h?.querySelector('[data-v111-save]')?.addEventListener('click',()=>{const vals={};h.querySelectorAll('[data-v111-name]').forEach(i=>{const v=Number(i.value);if(v>0)vals[i.dataset.v111Name]=v});FieldResultsV111.write(pool,vals);AuditLog.add('RESULTS SAVED',pool+' · '+Object.keys(vals).length+' finishes');document.querySelector('.modal')?.remove();AppStatus.show('ok','Results saved',Object.keys(vals).length+' finishes recorded');LinksLifecycleV82.queue()})}
function playerFieldScoreV111(pool){const c=fieldConfigV111(pool),r=FieldResultsV111.read(pool),saved=c?PickEngine.get(c.key)?.team||'':'';if(!c||!saved)return null;const picks=String(saved).split('|').filter(Boolean),finished=picks.filter(x=>r[x]>0);if(finished.length!==picks.length||!picks.length)return {complete:false,picks,score:null};return {complete:true,picks,score:picks.reduce((n,x)=>n+Number(r[x]),0)}}
function mountFieldResultsV111(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',c=fieldConfigV111(pool);if(!c)return;const hub=document.querySelector('.pool-hub');if(!hub)return;if(isPoolCommissionerV102(pool)&&!hub.querySelector('[data-v111-results]')){const action=hub.querySelector('.pool-setup-action-v87:last-of-type');if(action)action.insertAdjacentHTML('afterend','<div class="pool-setup-action-v87 result-action-v111"><div><span>SCORING</span><b>ENTER '+c.type.toUpperCase()+' RESULTS</b><small>Record real finishing positions when the event is complete.</small></div><button data-v111-results>ENTER RESULTS ›</button></div>');hub.querySelector('[data-v111-results]')?.addEventListener('click',()=>openFieldScoringV111(pool))}const score=playerFieldScoreV111(pool),live=document.querySelector('.pool-tab-live');if(score?.complete&&live&&!live.querySelector('.player-field-result-v111'))live.insertAdjacentHTML('beforeend','<div class="player-field-result-v111"><span>YOUR FINISHED CARD</span><b>'+score.score+'</b><small>COMBINED FINISH · LOWER IS BETTER</small></div>')}
LinksLifecycleCallbacksV82.push(mountFieldResultsV111);function stampV111(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v111 · GOLF + NASCAR SCORING</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v111'}LinksLifecycleCallbacksV82.push(stampV111);queueMicrotask(()=>{mountFieldResultsV111();stampV111();LinksLifecycleV82.queue()});


// Premium Game Shell v112 — consistent visual hierarchy and working-state cues across every pool engine.
function premiumGameShellV112(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',p=PoolHubData[pool];if(!p)return;const type=gameIdentity(p.game||'').type,hub=document.querySelector('.pool-hub');if(!hub)return;hub.classList.add('premium-game-v112');hub.dataset.gameType=type;const hero=hub.querySelector('.poolhub-hero');if(hero&&!hero.querySelector('.game-atmosphere-v112'))hero.insertAdjacentHTML('afterbegin','<div class="game-atmosphere-v112" aria-hidden="true"><i></i><i></i><i></i><span>'+networkGlyph(type)+'</span></div>');const live=hub.querySelector('.pool-tab-live');if(live){live.classList.add('premium-live-v112');const panel=live.querySelector('.hub-panel-head');if(panel&&!panel.querySelector('.live-chip-v112'))panel.insertAdjacentHTML('afterbegin','<b class="live-chip-v112"><i></i> LINKS GAME CENTER</b>')}hub.querySelectorAll('button').forEach(b=>{if(!b.dataset.v112Bound){b.dataset.v112Bound='1';b.addEventListener('pointerdown',()=>b.classList.add('pressed-v112'));['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>b.classList.remove('pressed-v112')))}})}
function premiumLoadingV112(){document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.matches('[data-open-pool],[data-pickpool],[data-result-pool],[data-mobile-route],[data-route],[data-v108-admin]')){b.classList.add('nav-loading-v112');setTimeout(()=>b.classList.remove('nav-loading-v112'),900)}},true)}
let premiumLoadingBoundV112=false;function bindPremiumLoadingV112(){if(premiumLoadingBoundV112)return;premiumLoadingBoundV112=true;premiumLoadingV112()}
LinksLifecycleCallbacksV82.push(premiumGameShellV112,bindPremiumLoadingV112);function stampV112(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v112 · PREMIUM GAME SHELL</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v112'}LinksLifecycleCallbacksV82.push(stampV112);queueMicrotask(()=>{premiumGameShellV112();bindPremiumLoadingV112();stampV112();LinksLifecycleV82.queue()});


// March Madness First Four v112 — full 68-team setup feeds four play-in winners into the 64-team bracket.
const FirstFourV112={key:'links-first-four-v112',read(pool){try{return JSON.parse(localStorage.getItem(this.key+'-'+pool)||'null')||{games:Array.from({length:4},()=>({a:'',b:'',slot:''})),winners:{}}}catch{return{games:Array.from({length:4},()=>({a:'',b:'',slot:''})),winners:{}}}},write(pool,v){localStorage.setItem(this.key+'-'+pool,JSON.stringify(v));return v},slots(){return BracketFieldV85.regions.flatMap((r,ri)=>BracketFieldV85.order.flatMap(pair=>pair.map(seed=>({label:r+' · '+seed+' SEED',index:ri*16+BracketFieldV85.order.flat().indexOf(seed)}))))}};
function firstFourSetupV112(pool){const d=FirstFourV112.read(pool),slots=FirstFourV112.slots();return '<section class="first-four-v112"><div><span>FIRST FOUR</span><h3>Set the four play-in games.</h3><p>Each winner feeds directly into the selected main-bracket seed line.</p></div>'+d.games.map((g,i)=>'<div class="ff-game-v112"><b>GAME '+(i+1)+'</b><input data-ff-a="'+i+'" value="'+linksEscape(g.a)+'" placeholder="Team A"><i>VS</i><input data-ff-b="'+i+'" value="'+linksEscape(g.b)+'" placeholder="Team B"><select data-ff-slot="'+i+'"><option value="">BRACKET SLOT</option>'+slots.map(x=>'<option value="'+x.index+'" '+(String(g.slot)===String(x.index)?'selected':'')+'>'+x.label+'</option>').join('')+'</select></div>').join('')+'<button data-ff-save>SAVE FIRST FOUR ›</button></section>'}
function firstFourPlayerV112(pool){const d=FirstFourV112.read(pool);return '<section class="first-four-player-v112"><div><span>FIRST FOUR</span><h3>Play-in winners</h3></div><div class="ff-pick-grid-v112">'+d.games.map((g,i)=>'<div><small>GAME '+(i+1)+'</small><button data-ff-win="'+i+'" data-team="'+linksEscape(g.a)+'" class="'+(d.winners[i]===g.a?'selected':'')+'">'+linksEscape(g.a||'TBD')+'</button><button data-ff-win="'+i+'" data-team="'+linksEscape(g.b)+'" class="'+(d.winners[i]===g.b?'selected':'')+'">'+linksEscape(g.b||'TBD')+'</button></div>').join('')+'</div></section>'}
function applyFirstFourV112(pool){const d=FirstFourV112.read(pool),field=BracketFieldV85.read(pool).slice();d.games.forEach((g,i)=>{if(g.slot!==''&&d.winners[i])field[Number(g.slot)]=d.winners[i]});BracketStoreV76.seed=field;BracketStoreV76.rounds=[{name:'FIRST ROUND',games:Array.from({length:32},(_,i)=>i)},{name:'SECOND ROUND',games:Array.from({length:16},(_,i)=>i)},{name:'SWEET 16',games:Array.from({length:8},(_,i)=>i)},{name:'ELITE EIGHT',games:Array.from({length:4},(_,i)=>i)},{name:'FINAL FOUR',games:[0,1]},{name:'CHAMPIONSHIP',games:[0]}]}
function commissionerFirstFourV112(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',p=PoolHubData[pool];if(gameIdentity(p?.game||'').type!=='bracket'||!isPoolCommissionerV102(pool))return;const hub=document.querySelector('.pool-hub');if(!hub||hub.querySelector('[data-ff-setup]'))return;const setup=hub.querySelector('[data-bf92-open]')?.closest('.pool-setup-action-v87');if(!setup)return;setup.insertAdjacentHTML('afterend','<div class="pool-setup-action-v87"><div><span>FIRST FOUR</span><b>68-TEAM TOURNAMENT</b><small>Configure the four play-in games and their main-bracket destinations.</small></div><button data-ff-setup>SET FIRST FOUR ›</button></div>');hub.querySelector('[data-ff-setup]').onclick=()=>{modal('FIRST FOUR SETUP','<div id="ff112Mount">'+firstFourSetupV112(pool)+'</div>');const h=document.querySelector('#ff112Mount');h.querySelector('[data-ff-save]').onclick=()=>{const d=FirstFourV112.read(pool);d.games=d.games.map((g,i)=>({a:h.querySelector('[data-ff-a="'+i+'"]').value.trim(),b:h.querySelector('[data-ff-b="'+i+'"]').value.trim(),slot:h.querySelector('[data-ff-slot="'+i+'"]').value}));if(d.games.some(g=>!g.a||!g.b||g.slot==='')){AppStatus.show('warn','First Four incomplete','Enter both teams and a bracket slot for all four games.');return}if(new Set(d.games.map(g=>g.slot)).size!==4){AppStatus.show('warn','Duplicate bracket slot','Each First Four game must feed a different seed line.');return}FirstFourV112.write(pool,d);AuditLog.add('FIRST FOUR SAVED',pool+' · 4 play-in games');document.querySelector('.modal')?.remove();AppStatus.show('ok','First Four saved','68-team structure ready');LinksLifecycleV82.queue()}}}
function mountFirstFourV112(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',p=PoolHubData[pool];if(gameIdentity(p?.game||'').type!=='bracket'||!BracketPublishedV92.read(pool))return;const live=document.querySelector('.pool-tab-live'),d=FirstFourV112.read(pool);if(!live||d.games.some(g=>!g.a||!g.b||g.slot===''))return;applyFirstFourV112(pool);if(!live.querySelector('.first-four-player-v112'))live.insertAdjacentHTML('afterbegin',firstFourPlayerV112(pool));live.querySelectorAll('[data-ff-win]').forEach(b=>b.onclick=()=>{const x=FirstFourV112.read(pool),i=b.dataset.ffWin,team=b.dataset.team;if(!team)return;x.winners[i]=team;FirstFourV112.write(pool,x);applyFirstFourV112(pool);const bracket=live.querySelector('.bracket-live-v76');if(bracket)bracket.outerHTML=gameSpecificPickPanel(pool).match(/<div class="bracket-live-v76">[\s\S]*<\/div>$/)?.[0]||bracket.outerHTML;LinksLifecycleV82.queue()})}
LinksLifecycleCallbacksV82.push(commissionerFirstFourV112,mountFirstFourV112);function stampV112(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v112 · 68-TEAM MARCH MADNESS</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v112'}LinksLifecycleCallbacksV82.push(stampV112);queueMicrotask(()=>{commissionerFirstFourV112();mountFirstFourV112();stampV112();LinksLifecycleV82.queue()});


// Cross-Engine Completion v113 — unified real readiness for every supported pool type.
function pickStatusV113(name,game){const type=gameIdentity(game).type;if(type==='golf'){const d=GolfPoolV109.read(name),saved=PickEngine.get(name+'-golf-v109')?.team||'',n=saved?String(saved).split('|').filter(Boolean).length:0;return {done:n,total:d.published?d.pickCount:0,due:d.published?Math.max(0,d.pickCount-n):0}}if(type==='racing'){const d=NascarPoolV110.read(name),saved=PickEngine.get(name+'-nascar-v110')?.team||'',n=saved?String(saved).split('|').filter(Boolean).length:0;return {done:n,total:d.published?d.pickCount:0,due:d.published?Math.max(0,d.pickCount-n):0}}if(type==='bracket'){if(!BracketPublishedV92.read(name))return {done:0,total:0,due:0};applyFirstFourV112(name);const d=FirstFourV112.read(name),ffReady=d.games.every(g=>g.a&&g.b&&g.slot!==''),ffDone=ffReady?Object.keys(d.winners||{}).filter(k=>d.winners[k]).length:0,b=BracketStoreV76.read(name),mainDone=Object.keys(b).filter(k=>/^r\d+g\d+$/.test(k)&&b[k]).length,total=(ffReady?4:0)+63;return {done:ffDone+mainDone,total,due:Math.max(0,total-ffDone-mainDone)}}return pickStatusV101(name,game)}
pickStatusV101=pickStatusV113;
function engineReadyV113(pool){const p=PoolHubData[pool],type=gameIdentity(p?.game||'').type;if(type==='golf')return GolfPoolV109.read(pool).published;if(type==='racing')return NascarPoolV110.read(pool).published;if(type==='bracket'){const d=FirstFourV112.read(pool);return BracketPublishedV92.read(pool)&&d.games.every(g=>g.a&&g.b&&g.slot!=='')}if(type==='custom')return CustomPoolStoreV91.read(pool).choices?.length>=2;if(['football','college','confidence','survivor','game33'].includes(type))return GameSlateStoreV86.has(pool);return true}
function poolTruthV113(pool){const old=poolTruthV90(pool),created=CreatedPools.all().some(x=>x.name===pool);if(!created)return old;return {...old,setup:engineReadyV113(pool)}}
poolTruthV90=poolTruthV113;
function completionRibbonV113(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',p=PoolHubData[pool];if(!p)return;const hub=document.querySelector('.pool-hub');if(!hub||hub.querySelector('.completion-v113'))return;const ps=pickStatusV113(pool,p.game),ready=engineReadyV113(pool),pct=ps.total?Math.round(ps.done/ps.total*100):(ready?100:0);const hero=hub.querySelector('.poolhub-hero');if(!hero)return;hero.insertAdjacentHTML('beforeend','<div class="completion-v113"><span><small>ENGINE</small><b>'+(ready?'READY':'SETUP')+'</b></span><span><small>YOUR CARD</small><b>'+ps.done+' / '+ps.total+'</b></span><span><small>COMPLETE</small><b>'+pct+'%</b></span><i><em style="width:'+pct+'%"></em></i></div>')}
function scrubLegacyScoreDemoV113(){document.querySelectorAll('.score-engine,.integrity').forEach(x=>{if(x.textContent.includes('Week 7')||x.textContent.includes('TEN')||x.textContent.includes('DETERMINISTIC ENGINE'))x.remove()})}
LinksLifecycleCallbacksV82.push(completionRibbonV113,scrubLegacyScoreDemoV113);function stampV113(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v113 · CROSS-ENGINE COMPLETION</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v113'}LinksLifecycleCallbacksV82.push(stampV113);queueMicrotask(()=>{completionRibbonV113();scrubLegacyScoreDemoV113();stampV113();LinksLifecycleV82.queue()});


// Pool Hub Truth v114 — identity, setup summary and status ribbon use real per-pool state only.
function nextLockV114(pool){const slate=GameSlateStoreV86.read(pool),next=slate.filter(g=>!gameLockedV94(g)&&parseKickV94(g.kickAt)!==null).sort((a,b)=>parseKickV94(a.kickAt)-parseKickV94(b.kickAt))[0];return next?new Date(next.kickAt).toLocaleString([],{weekday:'short',hour:'numeric',minute:'2-digit'}):''}
function poolSetupSummaryV114(pool){const p=PoolHubData[pool],s=PoolSettingsV106.read(pool),g=gameIdentity(p?.game||''),profile=createRuleProfileV99(p?.game||'');if(!p)return '';const style=s.format||profile.scoring[0]||g.label,deadline=s.deadline||profile.deadline[0]||'Commissioner controlled';return '<section class="pool-setup-summary real-v114"><div><span>POOL SETUP</span><b>HOW THIS POOL PLAYS</b></div><div class="pss-items"><span><small>FORMAT</small><b>'+linksEscape(style)+'</b></span><span><small>LOCK</small><b>'+linksEscape(deadline)+'</b></span><span><small>GAME</small><b>'+linksEscape(g.label)+'</b></span></div>'+(isPoolCommissionerV102(pool)?'<button data-edit-pool-rules>EDIT RULES ›</button>':'')+'</section>'}
function poolStatusRibbonV114(pool){const p=PoolHubData[pool];if(!p)return '';const truth=poolTruthV113(pool),ps=pickStatusV113(pool,p.game),pct=ps.total?Math.round(ps.done/ps.total*100):(truth.setup?100:0),lock=nextLockV114(pool)||(!truth.setup?'SETUP NEEDED':'NO UPCOMING LOCK');return '<section class="pool-status-ribbon real-v114"><span><small>PLAYERS</small><b>'+truth.members+'</b></span><span><small>ENGINE</small><b>'+(truth.setup?'READY':'SETUP')+'</b></span><span><small>YOUR CARD</small><b>'+ps.done+' / '+ps.total+'</b></span><span><small>COMPLETE</small><b>'+pct+'%</b></span><span><small>NEXT LOCK</small><b>'+linksEscape(lock)+'</b></span></section>'}
function repairPoolHubTruthV114(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',hub=document.querySelector('.pool-hub'),p=PoolHubData[pool];if(!hub||!p)return;const oldSummary=hub.querySelector('.pool-setup-summary');if(oldSummary&&!oldSummary.classList.contains('real-v114'))oldSummary.outerHTML=poolSetupSummaryV114(pool);else if(!oldSummary){const dock=hub.querySelector('.pool-action-dock');dock?.insertAdjacentHTML('afterend',poolSetupSummaryV114(pool))}const oldRibbon=hub.querySelector('.pool-status-ribbon');if(oldRibbon&&!oldRibbon.classList.contains('real-v114'))oldRibbon.outerHTML=poolStatusRibbonV114(pool);else if(!oldRibbon){const identity=hub.querySelector('.pool-identity');identity?.insertAdjacentHTML('afterend',poolStatusRibbonV114(pool))}hub.querySelector('[data-edit-pool-rules]')?.addEventListener('click',()=>openSetupStudio());const identity=hub.querySelector('.pool-identity');if(identity){const t=poolTruthV113(pool),ps=pickStatusV113(pool,p.game),small=identity.querySelector('.pi-copy small');if(small)small.textContent=(p.week||'ACTIVE')+' · '+t.members+' PLAYER'+(t.members===1?'':'S');const st=identity.querySelector('.pi-state');if(st){st.querySelector('span').textContent=t.setup?'NEXT LOCK':'STATUS';st.querySelector('b').textContent=t.setup?(nextLockV114(pool)||'NO UPCOMING LOCK'):'SETUP NEEDED'}}}
LinksLifecycleCallbacksV82.push(repairPoolHubTruthV114);function stampV114(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v114 · POOL HUB TRUTH</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v114'}LinksLifecycleCallbacksV82.push(stampV114);queueMicrotask(()=>{repairPoolHubTruthV114();stampV114();LinksLifecycleV82.queue()});


// Launch Navigation v115 — every major player/commissioner action routes to a real destination with visible loading feedback.
function actionLabelV115(el){return (el?.textContent||'').trim().replace(/\s+/g,' ').slice(0,42)}
function loadingActionV115(el){if(!el||el.dataset.loadingV115)return;el.dataset.loadingV115='1';el.dataset.oldV115=el.innerHTML;el.classList.add('loading-v115');const label=actionLabelV115(el);el.innerHTML='<i class="spin-v115"></i><span>'+(label.includes('SIGN')?'SIGNING IN…':'LOADING…')+'</span>';setTimeout(()=>{if(document.body.contains(el)&&el.dataset.oldV115){el.innerHTML=el.dataset.oldV115;el.classList.remove('loading-v115');delete el.dataset.loadingV115}},1800)}
function routeGuardV115(){document.addEventListener('click',e=>{const el=e.target.closest('button,a,[data-route],[data-mobile-route],[data-open-pool],[data-pickpool],[data-result-pool]');if(!el||el.disabled)return;const actionable=el.matches('[data-route],[data-mobile-route],[data-open-pool],[data-pickpool],[data-result-pool],[data-new-pool],[data-browse-games],[data-cmd],[data-open-slate-v87],[data-custom-setup-open-v91],[data-bf92-open],[data-g109-setup],[data-n110-setup],[data-v111-results],[data-ff-setup]')||/SIGN IN|OPEN POOL|CREATE|CONTINUE|VIEW|PICKS|RESULTS|ADMIN|SETTINGS|INVITE/.test(actionLabelV115(el).toUpperCase());if(actionable)loadingActionV115(el)},true)}
function repairDeadLinksV115(){document.querySelectorAll('a[href="#"],button').forEach(el=>{if(el.dataset.deadGuardV115)return;const txt=actionLabelV115(el).toUpperCase();if(el.tagName==='A'&&el.getAttribute('href')==='#'){el.dataset.deadGuardV115='1';el.addEventListener('click',e=>{if(el.dataset.route||el.dataset.mobileRoute)return;e.preventDefault();AppStatus.show('warn','Not available yet','This link is not part of the active LINKS flow.')})}if(el.tagName==='BUTTON'&&!el.onclick&&!el.getAttribute('data-route')&&!el.getAttribute('data-mobile-route')&&!el.closest('form')&&/^(BACK|HOME)$/.test(txt)){el.dataset.deadGuardV115='1';el.addEventListener('click',()=>txt==='BACK'?history.back():LinksRouter.navigate('home'))}})}
function launchShellTruthV115(){const pools=CreatedPools.all().length,due=createdPoolRowsV101().reduce((n,x)=>n+pickStatusV113(x.c.name,x.c.game).due,0),alerts=InboxTruthV105.items().filter(x=>!x.read).length;document.querySelectorAll('[data-shell-pools]').forEach(x=>x.textContent=pools);document.querySelectorAll('[data-shell-picks]').forEach(x=>x.textContent=due);document.querySelectorAll('[data-shell-alerts]').forEach(x=>x.textContent=alerts);document.body.classList.toggle('links-has-pools-v115',pools>0)}
routeGuardV115();LinksLifecycleCallbacksV82.push(repairDeadLinksV115,launchShellTruthV115);function stampV115(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v115 · LAUNCH NAVIGATION</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v115'}LinksLifecycleCallbacksV82.push(stampV115);queueMicrotask(()=>{repairDeadLinksV115();launchShellTruthV115();stampV115();LinksLifecycleV82.queue()});


// Event Standings v116 — real Golf/NASCAR finished cards feed a truthful leaderboard/results surface.
const EventEntriesV116={key:'links-event-entries-v116',all(){try{return JSON.parse(localStorage.getItem(this.key)||'{}')||{}}catch{return{}}},read(pool){return this.all()[pool]||[]},write(pool,rows){const a=this.all();a[pool]=rows;localStorage.setItem(this.key,JSON.stringify(a));return rows},upsert(pool,row){const a=this.read(pool),i=a.findIndex(x=>x.id===row.id);if(i>=0)a[i]={...a[i],...row};else a.push(row);return this.write(pool,a)}};
function syncSelfEventEntryV116(pool){const c=fieldConfigV111(pool),score=playerFieldScoreV111(pool);if(!c||!score?.picks?.length)return;EventEntriesV116.upsert(pool,{id:'self',name:'You',picks:score.picks,score:score.score,complete:score.complete,updatedAt:new Date().toISOString()})}
function eventStandingsV116(pool){syncSelfEventEntryV116(pool);const c=fieldConfigV111(pool),rows=EventEntriesV116.read(pool).filter(x=>x.complete&&Number.isFinite(Number(x.score))).sort((a,b)=>Number(a.score)-Number(b.score));if(!c)return '';return '<section class="event-standings-v116"><div class="event-standings-head"><div><span>LIVE STANDINGS</span><h3>'+linksEscape(c.title)+'</h3><p>Lowest combined finishing position leads.</p></div><b>'+rows.length+' FINISHED CARD'+(rows.length===1?'':'S')+'</b></div>'+(rows.length?'<div class="event-leaderboard-v116">'+rows.map((x,i)=>'<div class="'+(x.id==='self'?'you':'')+'"><strong>'+(i+1)+'</strong><span><b>'+linksEscape(x.name||'Player')+'</b><small>'+x.picks.map(linksEscape).join(' · ')+'</small></span><em>'+Number(x.score)+'</em><i>'+(i===0?'LEADER':'FINAL')+'</i></div>').join('')+'</div>':'<div class="links-empty results"><h3>NO FINISHED CARDS YET</h3><p>Standings appear when real event results complete a saved card.</p></div>')+'</section>'}
function mountEventStandingsV116(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',c=fieldConfigV111(pool),live=document.querySelector('.pool-tab-live');if(!c||!live)return;syncSelfEventEntryV116(pool);if(!live.querySelector('.event-standings-v116')&&Object.keys(FieldResultsV111.read(pool)).length)live.insertAdjacentHTML('beforeend',eventStandingsV116(pool))}
function resultsTruthV116(){const rows=createdPoolRowsV101();return '<section class="results-arena real-v104 real-v116"><div class="results-hero"><div><span>LINKS RESULTS</span><h2>'+(rows.length?'Your pools. Real results.':'Results start when your pools do.')+'</h2><p>LINKS only ranks completed cards from saved picks and recorded results.</p></div><div class="results-live"><i></i><b>'+rows.length+' POOL'+(rows.length===1?'':'S')+'</b><small>RESULTS INTEGRITY ON</small></div></div>'+(rows.length?'<div class="result-pool-grid">'+rows.map(x=>{const c=fieldConfigV111(x.c.name),eventRows=c?EventEntriesV116.read(x.c.name).filter(r=>r.complete):[],slate=GameSlateStoreV86.read(x.c.name),status=c?(eventRows.length?eventRows.length+' FINISHED CARD'+(eventRows.length===1?'':'S'):'WAITING FOR FINISHES'):(slate.length?slate.length+' GAMES PUBLISHED':'WAITING FOR SETUP');return '<button class="result-pool-card" data-result-pool="'+linksEscape(x.c.name)+'"><div>'+networkGlyph(x.g.type)+'</div><span>'+linksEscape(x.c.game)+'</span><h3>'+linksEscape(x.c.name)+'</h3><p>'+status+'</p><b>OPEN POOL RESULTS ›</b></button>'}).join('')+'</div>':'<div class="links-empty results"><i>★</i><h3>NO RESULTS YET</h3><p>Create or join a pool. Results will build here from real play.</p><button data-results-create>CREATE A FREE POOL ›</button></div>')+'</section>'}
resultsTruthV104=resultsTruthV116;
LinksLifecycleCallbacksV82.push(mountEventStandingsV116);function stampV116(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v116 · REAL EVENT STANDINGS</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v116'}LinksLifecycleCallbacksV82.push(stampV116);queueMicrotask(()=>{mountEventStandingsV116();stampV116();LinksLifecycleV82.queue()});


// Premium Arena System v117 — CSS-built sport atmospheres, no generated image assets.
function arenaTypeV117(){const view=document.documentElement.dataset.view||'home',pool=document.documentElement.dataset.pool||'',game=PoolHubData[pool]?.game||'';return view==='pool'?gameIdentity(game).type:view}
function premiumArenaV117(){const type=arenaTypeV117(),body=document.body;[...body.classList].filter(x=>x.startsWith('arena-v117-')).forEach(x=>body.classList.remove(x));body.classList.add('premium-arena-v117','arena-v117-'+type);let fx=document.querySelector('.arena-fx-v117');if(!fx){fx=document.createElement('div');fx.className='arena-fx-v117';fx.setAttribute('aria-hidden','true');fx.innerHTML='<i class="stadium-light l1"></i><i class="stadium-light l2"></i><i class="stadium-light l3"></i><i class="stadium-light l4"></i><b class="arena-glow"></b><span class="arena-lines"></span>';document.body.prepend(fx)}document.querySelectorAll('.poolhub-hero,.home-command,.results-hero,.command-hero,.format-head').forEach(x=>x.classList.add('premium-panel-v117'))}
function sportAtmosphereCopyV117(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',type=arenaTypeV117(),hero=document.querySelector('.poolhub-hero');if(!hero)return;hero.dataset.sportV117=type;const map={football:'GRIDIRON',college:'SATURDAY LIGHTS',survivor:'LAST ONE STANDING',confidence:'CONFIDENCE BOARD',game33:'CHASE 33',squares:'GAME GRID',bracket:'TOURNAMENT ARENA',golf:'MAJOR WEEK',racing:'RACE DAY',fantasy:'FANTASY HQ',dynasty:'FRANCHISE MODE',custom:'CUSTOM ARENA'};hero.style.setProperty('--sport-label','"'+(map[type]||'LINKS')+'"')}
LinksLifecycleCallbacksV82.push(premiumArenaV117,sportAtmosphereCopyV117);function stampV117(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v117 · PREMIUM ARENA SYSTEM</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v117'}LinksLifecycleCallbacksV82.push(stampV117);queueMicrotask(()=>{premiumArenaV117();sportAtmosphereCopyV117();stampV117();LinksLifecycleV82.queue()});


// Game Day Visual Network v118 — premium sport identity cards built from live app state, no fake scores.
function sportMarkV118(type){const m={football:'🏈',college:'🏟',survivor:'🔥',confidence:'✓',game33:'33',squares:'▦',bracket:'🏀',golf:'⛳',racing:'🏁',fantasy:'♛',dynasty:'◆',custom:'✦'};return m[type]||'L'}
function visualNetworkV118(){if(document.documentElement.dataset.view!=='home')return;const home=document.querySelector('.home-command-v4,.home-command');if(!home||home.querySelector('.visual-network-v118'))return;const games=[['football','NFL PICK’EM','PRIME TIME'],['college','COLLEGE','SATURDAY'],['bracket','MARCH MADNESS','TOURNAMENT'],['golf','GOLF','MAJOR WEEK'],['racing','NASCAR','RACE DAY'],['survivor','SURVIVOR','STAY ALIVE'],['confidence','CONFIDENCE','RANK THE CARD'],['game33','GAME 33','CHASE 33'],['squares','SQUARES','GAME GRID'],['custom','CUSTOM','YOUR RULES']];const anchor=home.querySelector('.home-now-grid')||home.querySelector('.home-pool-rail');if(!anchor)return;anchor.insertAdjacentHTML('afterend','<section class="visual-network-v118"><header><div><span>LINKS GAME NETWORK</span><h2>Every game gets its own arena.</h2></div><button data-v118-explore>EXPLORE ALL ›</button></header><div class="visual-game-rail-v118">'+games.map(([t,n,k])=>'<button data-v118-game="'+t+'" class="vg-'+t+'"><i>'+sportMarkV118(t)+'</i><span>'+k+'</span><b>'+n+'</b><em>OPEN ARENA ›</em></button>').join('')+'</div></section>');home.querySelector('[data-v118-explore]')?.addEventListener('click',()=>LinksRouter.navigate('games'));home.querySelectorAll('[data-v118-game]').forEach(b=>b.addEventListener('click',()=>LinksRouter.navigate('games')))}
function gameDayHeaderV118(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',p=PoolHubData[pool],hub=document.querySelector('.pool-hub');if(!p||!hub||hub.querySelector('.game-day-header-v118'))return;const type=gameIdentity(p.game||'').type,truth=poolTruthV113(pool),ps=pickStatusV113(pool,p.game),lock=nextLockV114(pool)||(!truth.setup?'SETUP REQUIRED':'NO UPCOMING LOCK');const hero=hub.querySelector('.poolhub-hero');if(!hero)return;hero.insertAdjacentHTML('afterend','<section class="game-day-header-v118 gd-'+type+'"><div class="gd-mark-v118">'+sportMarkV118(type)+'</div><div><span>'+linksEscape(gameIdentity(p.game||'').label)+' · GAME DAY</span><h2>'+linksEscape(pool)+'</h2><p>'+(truth.setup?(ps.due?ps.due+' selection'+(ps.due===1?'':'s')+' still need your pick.':'Your card is ready.'):'Commissioner setup is still required.')+'</p></div><div class="gd-lock-v118"><small>NEXT LOCK</small><b>'+linksEscape(lock)+'</b><em>'+(truth.setup?'LIVE POOL':'WAITING')+'</em></div></section>')}
function visualMotionV118(){document.querySelectorAll('.visual-game-rail-v118 button,.result-pool-card,.pool-setup-action-v87,.event-leaderboard-v116>div').forEach((x,i)=>{if(x.dataset.revealV118)return;x.dataset.revealV118='1';x.style.setProperty('--reveal-delay',(i%10)*32+'ms');x.classList.add('reveal-v118')})}
LinksLifecycleCallbacksV82.push(visualNetworkV118,gameDayHeaderV118,visualMotionV118);function stampV118(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v118 · GAME DAY VISUAL NETWORK</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v118'}LinksLifecycleCallbacksV82.push(stampV118);queueMicrotask(()=>{visualNetworkV118();gameDayHeaderV118();visualMotionV118();stampV118();LinksLifecycleV82.queue()});


// Home Broadcast Truth v117 — premium sports energy without fabricated scores or urgency.
function homeLiveTruthV117(){const rows=createdPoolRowsV101(),games=[];rows.forEach(x=>GameSlateStoreV86.read(x.c.name).forEach(g=>{const t=parseKickV94(g.kickAt);if(t!==null)games.push({...g,pool:x.c.name,t})}));games.sort((a,b)=>a.t-b.t);const now=Date.now(),up=games.filter(g=>g.t>now).slice(0,3),locked=games.filter(g=>g.t<=now).slice(-2).reverse(),show=[...locked,...up].slice(0,3);return '<section class="home-live-strip real-v117"><div class="hls-brand"><i></i><div><span>LINKS LIVE</span><b>'+(show.length?'GAME DAY COMMAND':'READY WHEN YOU ARE')+'</b></div></div><div class="hls-games">'+(show.length?show.map(g=>'<button data-home-pool="'+linksEscape(g.pool)+'"><div class="hls-team"><b>'+linksEscape(g.away)+'</b><em>VS</em></div><span class="'+(g.t<=now?'live':'upcoming')+'">'+(g.t<=now?'LOCKED':new Date(g.t).toLocaleString([],{weekday:'short',hour:'numeric',minute:'2-digit'}))+'</span><div class="hls-team away"><em>AT</em><b>'+linksEscape(g.home)+'</b></div></button>').join(''):'<div class="hls-empty-v117"><b>NO PUBLISHED GAMES YET</b><span>Create a free pool or publish a commissioner slate to light up LINKS LIVE.</span></div>')+'</div><button class="hls-all" data-live-results>RESULTS ›</button></section>'}
HomeLive.html=homeLiveTruthV117;
function homeBriefV117(){const rows=createdPoolRowsV101(),due=rows.reduce((n,x)=>n+pickStatusV113(x.c.name,x.c.game).due,0),alerts=InboxTruthV105.items().filter(x=>!x.read).length,setup=rows.filter(x=>isPoolCommissionerV102(x.c.name)&&!engineReadyV113(x.c.name)).length;return '<section class="home-brief real-v117"><div class="hb-head"><div><span>YOUR LINKS BRIEF</span><h2>'+(due||alerts||setup?'What needs you right now.':'You’re ready for game day.')+'</h2></div><button data-brief-inbox>'+alerts+' UNREAD ›</button></div><div class="hb-grid"><button data-home-go2="my-picks"><i class="pick">✓</i><div><span>PICKS</span><b>'+(due?due+' PICK'+(due===1?'':'S')+' DUE':'PICKS CAUGHT UP')+'</b><small>'+(due?'Finish your real pool cards before their locks.':'Nothing currently needs a selection.')+'</small></div><em>'+(due?'MAKE PICKS':'VIEW')+' ›</em></button><button data-home-go2="notifications"><i class="msg">✦</i><div><span>INBOX</span><b>'+(alerts?alerts+' ALERT'+(alerts===1?'':'S'):'ALL CAUGHT UP')+'</b><small>'+(alerts?'Pool activity needs your attention.':'No manufactured notifications.')+'</small></div><em>OPEN ›</em></button><button data-home-go2="commissioner"><i class="move">⚙</i><div><span>COMMISSIONER</span><b>'+(setup?setup+' POOL'+(setup===1?'':'S')+' NEED SETUP':'COMMAND READY')+'</b><small>'+(setup?'Publish the missing game setup.':'Your commissioner tools are standing by.')+'</small></div><em>MANAGE ›</em></button></div></section>'}
homeBrief=homeBriefV117;
function replaceHomeBroadcastV117(){if(document.documentElement.dataset.view!=='home')return;const cmd=document.querySelector('.home-command-v4');if(!cmd)return;const live=cmd.querySelector('.home-live-strip');if(live&&!live.classList.contains('real-v117'))live.outerHTML=homeLiveTruthV117();const brief=cmd.querySelector('.home-brief');if(brief&&!brief.classList.contains('real-v117'))brief.outerHTML=homeBriefV117();cmd.querySelectorAll('[data-home-pool]').forEach(b=>b.onclick=()=>LinksRouter.navigate('pool',b.dataset.homePool));cmd.querySelectorAll('[data-live-results]').forEach(b=>b.onclick=()=>LinksRouter.navigate('results'));cmd.querySelectorAll('[data-home-go2]').forEach(b=>b.onclick=()=>LinksRouter.navigate(b.dataset.homeGo2));cmd.querySelector('[data-brief-inbox]')?.addEventListener('click',()=>LinksRouter.navigate('notifications'))}
function suppressLegacyHomeObserversV117(){document.querySelectorAll('.home-launch,.game-showcase').forEach(x=>x.remove())}
LinksLifecycleCallbacksV82.push(replaceHomeBroadcastV117,suppressLegacyHomeObserversV117);function stampV117(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v117 · HOME BROADCAST TRUTH</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v117'}LinksLifecycleCallbacksV82.push(stampV117);queueMicrotask(()=>{replaceHomeBroadcastV117();suppressLegacyHomeObserversV117();stampV117();LinksLifecycleV82.queue()});


// LINKS Card Builder Placement v119 — make the multi-sport research card visible where players naturally act.
function cardBuilderCTA119(context='home'){
 const rows=AIMixV70.read(),count=rows.length,sports=new Set(rows.map(x=>x.sport)).size;
 return '<section class="card-builder-v119 '+context+'"><div class="cb119-mark"><i>+</i><b>LINKS</b></div><div class="cb119-copy"><span>LINKS CARD BUILDER</span><h2>Build one card across your sports.</h2><p>Research selections, mix sports, review the combined card, then share it or continue to an available sportsbook partner.</p><div class="cb119-state"><b>'+(count?count+' LEG'+(count===1?'':'S')+' SAVED':'START A NEW CARD')+'</b><small>'+(count?(sports+' SPORT'+(sports===1?'':'S')+' ON YOUR CARD'):'NFL · COLLEGE · NBA · NHL · MLB · GOLF · MORE')+'</small></div></div><button data-card-builder-v119>'+(count?'CONTINUE CARD':'BUILD A CARD')+' ›</button></section>';
}
function mountCardBuilder119(){
 const view=document.documentElement.dataset.view;
 if(view==='home'){
  const home=document.querySelector('.home-command-v4,.home-command');if(home&&!home.querySelector('.card-builder-v119')){const anchor=home.querySelector('.visual-network-v118')||home.querySelector('.home-live-strip');anchor?.insertAdjacentHTML('afterend',cardBuilderCTA119('home'))}
 }
 if(view==='pool'){
  const hub=document.querySelector('.pool-hub');if(hub&&!hub.querySelector('.card-builder-v119')){const hero=hub.querySelector('.game-day-header-v118')||hub.querySelector('.poolhub-hero');hero?.insertAdjacentHTML('afterend',cardBuilderCTA119('pool'))}
 }
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-card-builder-v119]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();AIStudio.open();setTimeout(()=>{mountMixedCardV70();mixDockV71();launchTrustV80();aiStadiumVisualV68?.()},0)},true);
LinksLifecycleCallbacksV82.push(mountCardBuilder119);
function stampV119(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v119 · CARD BUILDER PLACEMENT</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v119'}
LinksLifecycleCallbacksV82.push(stampV119);queueMicrotask(()=>{mountCardBuilder119();stampV119();LinksLifecycleV82.queue()});

// Launch Flow Finish v120 — real pool state and clean next actions.
function poolNextActionsV120(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',p=PoolHubData[pool],hub=document.querySelector('.pool-hub');if(!p||!hub||hub.querySelector('.pool-next-v120'))return;const truth=poolTruthV113(pool),ps=pickStatusV113(pool,p.game),commissioner=isPoolCommissionerV102(pool),items=[{k:'picks',icon:'✓',title:ps.due?ps.due+' PICK'+(ps.due===1?'':'S')+' DUE':'PICKS READY',sub:truth.setup?'Open your saved card and selections.':'Waiting for commissioner setup.',disabled:!truth.setup},{k:'standings',icon:'▥',title:'STANDINGS',sub:'See completed results and pool position.'},{k:'compare',icon:'⇄',title:'COMPARE',sub:'See where locked picks differ.'}];if(commissioner)items.push({k:'commissioner',icon:'⚙',title:'COMMISSIONER',sub:truth.setup?'Manage this pool and upcoming action.':'Finish setup and publish the field.'});const hero=hub.querySelector('.card-builder-v119')||hub.querySelector('.game-day-header-v118')||hub.querySelector('.poolhub-hero');if(!hero)return;hero.insertAdjacentHTML('afterend','<section class="pool-next-v120"><header><div><span>GAME DAY CONTROL</span><h2>Everything for this '+linksEscape(gameIdentity(p.game).label.toLowerCase())+' pool.</h2></div><b class="'+(truth.setup?'ready':'wait')+'">'+(truth.setup?'POOL READY':'SETUP NEEDED')+'</b></header><div>'+items.map(x=>'<button data-v120-action="'+x.k+'" '+(x.disabled?'disabled':'')+'><i>'+x.icon+'</i><span><b>'+x.title+'</b><small>'+x.sub+'</small></span><em>›</em></button>').join('')+'</div></section>');hub.querySelectorAll('[data-v120-action]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.v120Action;if(k==='commissioner'){LinksRouter.navigate('commissioner');return}const tab=hub.querySelector('[data-hubtab="'+k+'"]');if(tab){tab.click();tab.scrollIntoView({behavior:'smooth',block:'start'})}else if(k==='standings')LinksRouter.navigate('results')}))}
function poolStateBadgeV120(){document.querySelectorAll('.result-pool-card:not([data-state-v120])').forEach(card=>{card.dataset.stateV120='1';const p=card.querySelector('p')?.textContent||'',state=/WAITING/i.test(p)?'WAITING':/FINISHED/i.test(p)?'FINAL':'ACTIVE';card.insertAdjacentHTML('afterbegin','<span class="result-state-v120 '+state.toLowerCase()+'"><i></i>'+state+'</span>')})}
LinksLifecycleCallbacksV82.push(poolNextActionsV120,poolStateBadgeV120);function stampV120(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v120 · LAUNCH FLOW FINISH</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v120'}LinksLifecycleCallbacksV82.push(stampV120);queueMicrotask(()=>{poolNextActionsV120();poolStateBadgeV120();stampV120();LinksLifecycleV82.queue()});

// Game Day Status Deck v121 — compact truth-driven status for every active pool.
function gameDayStatusV121(){if(document.documentElement.dataset.view!=='pool')return;const pool=document.documentElement.dataset.pool||'',p=PoolHubData[pool],hub=document.querySelector('.pool-hub');if(!p||!hub||hub.querySelector('.status-deck-v121'))return;const ready=engineReadyV113(pool),ps=pickStatusV113(pool,p.game),lock=nextLockV114(pool),slate=GameSlateStoreV86.read(pool),locked=slate.filter(gameLockedV94).length,total=slate.length;const anchor=hub.querySelector('.pool-next-v120')||hub.querySelector('.game-day-header-v118');if(!anchor)return;anchor.insertAdjacentHTML('afterend','<section class="status-deck-v121"><div class="sd121-title"><span>POOL STATUS</span><b>'+linksEscape(p.week||'CURRENT')+'</b></div><div class="sd121-grid"><article><small>ENGINE</small><b>'+(ready?'READY':'WAITING')+'</b><i class="'+(ready?'on':'off')+'"></i></article><article><small>YOUR CARD</small><b>'+ps.done+' / '+ps.total+'</b><em>'+ps.due+' DUE</em></article><article><small>NEXT LOCK</small><b>'+linksEscape(lock||'—')+'</b><em>'+(total?locked+' / '+total+' LOCKED':'NO SLATE')+'</em></article><article><small>GAME</small><b>'+linksEscape(gameIdentity(p.game).label)+'</b><em>LINKS LIVE</em></article></div></section>')}
function tabActiveFinishV121(){document.querySelectorAll('.poolhub-tabs button,.pool-tabs button').forEach(b=>{if(b.dataset.v121)return;b.dataset.v121='1';b.addEventListener('click',()=>{b.closest('nav')?.querySelectorAll('button').forEach(x=>x.setAttribute('aria-selected',x===b?'true':'false'))})})}
LinksLifecycleCallbacksV82.push(gameDayStatusV121,tabActiveFinishV121);function stampV121(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v121 · GAME DAY STATUS</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v121'}LinksLifecycleCallbacksV82.push(stampV121);queueMicrotask(()=>{gameDayStatusV121();tabActiveFinishV121();stampV121();LinksLifecycleV82.queue()});

// Mobile Game Day Finish v122 — thumb-friendly persistent controls and clear interaction feedback.
function mobileGameBarV122(){if(document.documentElement.dataset.view!=='pool'||innerWidth>760)return;const pool=document.documentElement.dataset.pool||'',p=PoolHubData[pool];if(!p||document.querySelector('.mobile-gamebar-v122'))return;const ps=pickStatusV113(pool,p.game),owner=isPoolCommissionerV102(pool),bar=document.createElement('nav');bar.className='mobile-gamebar-v122';bar.setAttribute('aria-label','Pool quick actions');bar.innerHTML='<button data-v122-tab="picks"><i>✓</i><span>PICKS</span><b>'+(ps.due||'')+'</b></button><button data-v122-tab="standings"><i>▥</i><span>STANDINGS</span></button><button data-v122-tab="compare"><i>⇄</i><span>COMPARE</span></button>'+(owner?'<button data-v122-admin><i>⚙</i><span>ADMIN</span></button>':'<button data-v122-card><i>+</i><span>CARD</span></button>');document.body.appendChild(bar);bar.querySelectorAll('[data-v122-tab]').forEach(b=>b.onclick=()=>{document.querySelector('[data-hubtab="'+b.dataset.v122Tab+'"]')?.click();document.querySelector('.poolhub-body')?.scrollIntoView({behavior:'smooth',block:'start'})});bar.querySelector('[data-v122-admin]')?.addEventListener('click',()=>LinksRouter.navigate('commissioner'));bar.querySelector('[data-v122-card]')?.addEventListener('click',()=>AIStudio.open())}
function clearMobileGameBarV122(){if(document.documentElement.dataset.view!=='pool'||innerWidth>760)document.querySelector('.mobile-gamebar-v122')?.remove()}
function interactionFinishV122(){document.querySelectorAll('button:not([data-press-v122])').forEach(b=>{b.dataset.pressV122='1';b.addEventListener('pointerdown',()=>b.classList.add('press-v122'));['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>b.classList.remove('press-v122')))})}
LinksLifecycleCallbacksV82.push(mobileGameBarV122,clearMobileGameBarV122,interactionFinishV122);addEventListener('resize',()=>{clearMobileGameBarV122();mobileGameBarV122()});function stampV122(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v122 · MOBILE GAME DAY FINISH</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v122'}LinksLifecycleCallbacksV82.push(stampV122);queueMicrotask(()=>{mobileGameBarV122();interactionFinishV122();stampV122();LinksLifecycleV82.queue()});

// Launch Atmosphere v123 — premium, truthful route identity without fake live activity.
function launchAtmosphereV123(){const view=document.documentElement.dataset.view;if(!['home','pool','results','commissioner'].includes(view))return;const host=view==='pool'?document.querySelector('.pool-hub'):document.querySelector('.route-workspace,.home-command-v4,.home-command');if(!host||host.querySelector('.launch-atmos-v123'))return;let label='LINKS SPORTS NETWORK',title='YOUR SPORTS. YOUR POOLS. ONE PLACE.',meta='LIVE SYSTEM READY';if(view==='pool'){const pool=document.documentElement.dataset.pool||'',p=PoolHubData[pool];if(!p)return;const g=gameIdentity(p.game);label=g.eyebrow;title=g.label;meta=engineReadyV113(pool)?'GAME DAY READY':'COMMISSIONER SETUP'}else if(view==='results'){label='LINKS RESULTS';title='REAL RESULTS. CLEAN STANDINGS.';meta='RESULTS INTEGRITY'}else if(view==='commissioner'){label='LINKS CONTROL ROOM';title='RUN THE POOL.';meta='COMMISSIONER MODE'}const node=document.createElement('section');node.className='launch-atmos-v123 '+view;node.innerHTML='<div class="la123-light l1"></div><div class="la123-light l2"></div><div class="la123-field"></div><div class="la123-copy"><span>'+linksEscape(label)+'</span><h2>'+linksEscape(title)+'</h2><b><i></i>'+linksEscape(meta)+'</b></div>';host.insertAdjacentElement('afterbegin',node)}
function syncMobileBarV123(){const bar=document.querySelector('.mobile-gamebar-v122');if(!bar)return;const active=[...document.querySelectorAll('.poolhub-tabs button,.pool-tabs button')].find(b=>b.classList.contains('active'))?.dataset.hubtab||'';bar.querySelectorAll('[data-v122-tab]').forEach(b=>b.classList.toggle('active',b.dataset.v122Tab===active))}
document.addEventListener('click',e=>{if(e.target.closest('[data-hubtab]'))setTimeout(syncMobileBarV123,0)},true);
LinksLifecycleCallbacksV82.push(launchAtmosphereV123,syncMobileBarV123);function stampV123(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v123 · LAUNCH ATMOSPHERE</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v123'}LinksLifecycleCallbacksV82.push(stampV123);queueMicrotask(()=>{launchAtmosphereV123();syncMobileBarV123();stampV123();LinksLifecycleV82.queue()});

// Finish Line v124 — responsive command feedback, current-card pulse, and clean route transitions.
function cardPulseV124(){const rows=AIMixV70.read(),n=rows.length;if(!n)return;document.querySelectorAll('[data-card-builder-v119],[data-v122-card]').forEach(b=>{if(b.querySelector('.card-count-v124'))return;b.insertAdjacentHTML('beforeend','<strong class="card-count-v124">'+n+'</strong>')})}
function routeFinishV124(){const app=document.querySelector('#app');if(!app)return;app.classList.remove('route-enter-v124');requestAnimationFrame(()=>requestAnimationFrame(()=>app.classList.add('route-enter-v124')));setTimeout(()=>app.classList.remove('route-enter-v124'),420)}
function actionToastV124(){document.querySelectorAll('.pool-next-v120 button:not([data-toast-v124])').forEach(b=>{b.dataset.toastV124='1';b.addEventListener('click',()=>{if(b.disabled)return;const title=b.querySelector('b')?.textContent||'OPENING';AppStatus.show('ok',title,'LINKS game day control')})})}
function polishV124(){cardPulseV124();actionToastV124()}
const routeObserverV124=new MutationObserver(()=>{polishV124();routeFinishV124()});routeObserverV124.observe(document.querySelector('#app'),{childList:true});
LinksLifecycleCallbacksV82.push(polishV124);function stampV124(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v124 · FINISH LINE</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v124'}LinksLifecycleCallbacksV82.push(stampV124);queueMicrotask(()=>{polishV124();stampV124();LinksLifecycleV82.queue()});

// Launch Readiness v125 — final-state clarity and resilient empty/setup guidance.
function readinessRailV125(){const view=document.documentElement.dataset.view;if(!['home','pool','commissioner'].includes(view)||document.querySelector('.readiness-rail-v125'))return;let host=document.querySelector(view==='pool'?'.pool-hub':'.route-workspace,.home-command-v4,.home-command');if(!host)return;let cells=[];if(view==='pool'){const pool=document.documentElement.dataset.pool||'',p=PoolHubData[pool];if(!p)return;const ready=engineReadyV113(pool),ps=pickStatusV113(pool,p.game),lock=nextLockV114(pool);cells=[['SETUP',ready?'READY':'NEEDS SETUP',ready],['PICKS',ps.due?ps.due+' DUE':'COMPLETE',!ps.due&&ready],['LOCK',lock||'NOT SET',!!lock]]}else if(view==='commissioner'){const r=readinessTruth();cells=[['PLAYERS',r.missing.length?r.missing.length+' NEED PICKS':'READY',!r.missing.length],['CONTROL','COMMISSIONER',true],['STATUS',r.missing.length?'ACTION NEEDED':'READY',!r.missing.length]]}else{const pools=createdPoolRowsV101();cells=[['POOLS',String(pools.length),pools.length>0],['NETWORK','READY',true],['RESULTS',pools.length?'CONNECTED':'START WITH A POOL',pools.length>0]]}const node=document.createElement('section');node.className='readiness-rail-v125';node.innerHTML=cells.map(x=>'<div class="'+(x[2]?'ready':'wait')+'"><i></i><span>'+x[0]+'</span><b>'+linksEscape(x[1])+'</b></div>').join('');const anchor=host.querySelector('.launch-atmos-v123')||host.firstElementChild;anchor?.insertAdjacentElement('afterend',node)}
function emptyStateFinishV125(){document.querySelectorAll('.links-empty:not([data-v125])').forEach(x=>{x.dataset.v125='1';x.classList.add('launch-empty-v125');if(!x.querySelector('.empty-line-v125'))x.insertAdjacentHTML('afterbegin','<i class="empty-line-v125"></i>')})}
LinksLifecycleCallbacksV82.push(readinessRailV125,emptyStateFinishV125);function stampV125(){document.querySelectorAll('.app-build-v18').forEach(x=>{const html='<b>LINKS</b><span>NEW BUILD · v125 · LAUNCH READINESS</span>';if(x.innerHTML!==html)x.innerHTML=html});document.documentElement.dataset.linksBuild='v125'}LinksLifecycleCallbacksV82.push(stampV125);queueMicrotask(()=>{readinessRailV125();emptyStateFinishV125();stampV125();LinksLifecycleV82.queue()});

// Release Guard v126 — one authoritative build stamp and fresh-shell update signal.
const LINKS_RELEASE_V126='v126';
function releaseGuardV126(){document.documentElement.dataset.linksBuild=LINKS_RELEASE_V126;document.querySelectorAll('.app-build-v18').forEach(x=>x.innerHTML='<b>LINKS</b><span>NEW BUILD · v126 · RELEASE GUARD</span>')}
function updateSignalV126(){if(!('serviceWorker'in navigator)||document.querySelector('.update-ready-v126'))return;navigator.serviceWorker.getRegistration('./').then(reg=>{if(!reg)return;reg.update().catch(()=>{});const show=()=>{if(document.querySelector('.update-ready-v126'))return;const n=document.createElement('button');n.className='update-ready-v126';n.innerHTML='<i></i><span><b>LINKS UPDATE READY</b><small>Tap to load the newest build</small></span><em>↻</em>';n.onclick=()=>location.reload();document.body.appendChild(n)};if(reg.waiting)show();reg.addEventListener('updatefound',()=>{const w=reg.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)show()})})}).catch(()=>{})}
LinksLifecycleCallbacksV82.push(releaseGuardV126,updateSignalV126);const releaseObserverV126=new MutationObserver(()=>releaseGuardV126());releaseObserverV126.observe(document.querySelector('#app'),{childList:true,subtree:true});queueMicrotask(()=>{releaseGuardV126();updateSignalV126();LinksLifecycleV82.queue()});

// Final QA Shield v127 — prevent double actions, surface loading state, and keep release stamp authoritative.
function actionShieldV127(){document.querySelectorAll('button:not([data-shield-v127])').forEach(b=>{b.dataset.shieldV127='1';b.addEventListener('click',()=>{if(b.disabled||b.dataset.busyV127==='1')return;const nav=b.matches('[data-hubtab],[data-v120-action],[data-v122-tab],[data-v122-admin],[data-v122-card],[data-card-builder-v119]');if(!nav)return;b.dataset.busyV127='1';b.classList.add('busy-v127');setTimeout(()=>{b.dataset.busyV127='0';b.classList.remove('busy-v127')},500)})})}
function routeSafetyV127(){document.querySelectorAll('a[href="#"],a[href=""],button:not([type])').forEach(x=>{if(x.dataset.qa127)return;x.dataset.qa127='1';if(x.tagName==='BUTTON')x.setAttribute('type','button')})}
function finalReleaseV127(){document.documentElement.dataset.linksBuild='v127';document.querySelectorAll('.app-build-v18').forEach(x=>x.innerHTML='<b>LINKS</b><span>NEW BUILD · v127 · FINAL QA SHIELD</span>')}
function qaFinishV127(){actionShieldV127();routeSafetyV127();finalReleaseV127()}
LinksLifecycleCallbacksV82.push(qaFinishV127);const qaObserverV127=new MutationObserver(()=>qaFinishV127());qaObserverV127.observe(document.querySelector('#app'),{childList:true,subtree:true});queueMicrotask(()=>{qaFinishV127();LinksLifecycleV82.queue()});
