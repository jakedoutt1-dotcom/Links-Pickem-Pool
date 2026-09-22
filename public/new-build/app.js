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
