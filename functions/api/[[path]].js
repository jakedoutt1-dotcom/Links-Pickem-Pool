const SCHEDULE={"1": "NE@SEA,SF@LAR,CHI@CAR,TB@CIN,NO@DET,BUF@HOU,BAL@IND,CLE@JAX,ATL@PIT,NYJ@TEN,ARI@LAC,MIA@LV,GB@MIN,WAS@PHI,DAL@NYG,DEN@KC", "2": "DET@BUF,CAR@ATL,NO@BAL,MIN@CHI,CIN@HOU,PIT@NE,GB@NYJ,CLE@TB,PHI@TEN,JAX@DEN,LV@LAC,SEA@ARI,WAS@DAL,MIA@SF,IND@KC,NYG@LAR", "3": "ATL@GB,LAC@BUF,CAR@CLE,NYJ@DET,HOU@IND,NE@JAX,KC@MIA,TEN@NYG,CIN@PIT,SEA@WAS,ARI@SF,MIN@TB,BAL@DAL,LV@NO,LAR@DEN,PHI@CHI", "4": "PIT@CLE,IND@WAS,TEN@BAL,NE@BUF,NYJ@CHI,JAX@CIN,DAL@HOU,ARI@NYG,LAR@PHI,GB@TB,MIA@MIN,KC@LV,LAC@SEA,DEN@SF,DET@CAR,ATL@NO", "5": "TB@DAL,PHI@JAX,CIN@MIA,LV@NE,MIN@NO,CLE@NYJ,IND@PIT,HOU@TEN,NYG@WAS,DEN@LAC,DET@ARI,CHI@GB,SF@SEA,BAL@ATL,BUF@LAR", "6": "SEA@DEN,HOU@JAX,CHI@ATL,BAL@CLE,TEN@IND,NYJ@NE,NO@NYG,CAR@PHI,PIT@TB,ARI@LAR,LAC@KC,BUF@LV,DAL@GB,WAS@SF", "7": "NE@CHI,PIT@NO,SF@ATL,CIN@BAL,TB@CAR,NYG@HOU,IND@MIN,MIA@NYJ,CLE@TEN,DEN@ARI,GB@DET,LAR@LV,KC@SEA,DAL@PHI", "8": "CAR@GB,BAL@BUF,TEN@CIN,ARI@DAL,MIN@DET,IND@JAX,LV@NYJ,CLE@PIT,ATL@TB,LAC@LAR,KC@DEN,NE@MIA,PHI@WAS,CHI@SEA", "9": "JAX@BAL,CIN@ATL,DEN@CAR,DAL@IND,NYJ@KC,DET@MIA,CLE@NO,NYG@PHI,LAR@WAS,HOU@LAC,LV@SF,GB@NE,ARI@SEA,TB@CHI,BUF@MIN", "10": "WAS@NYG,NE@DET,KC@ATL,HOU@CLE,MIN@GB,MIA@IND,CAR@NO,BUF@NYJ,JAX@TEN,LAR@ARI,SEA@LV,SF@DAL,PIT@CIN,LAC@BAL", "11": "IND@HOU,MIA@BUF,BAL@CAR,NO@CHI,TEN@DAL,TB@DET,ARI@KC,JAX@NYG,NYJ@LAC,LV@DEN,PIT@PHI,MIN@SF,CIN@WAS", "12": "CHI@DET,PHI@DAL,KC@BUF,DEN@PIT,NO@CIN,LV@CLE,BAL@HOU,NYG@IND,NYJ@MIA,ATL@MIN,TEN@JAX,WAS@ARI,SEA@SF,NE@LAC,CAR@TB,GB@LAR", "13": "KC@LAR,DET@ATL,JAX@CHI,CIN@CLE,GB@NO,SF@NYG,LAC@TB,WAS@TEN,PHI@ARI,MIA@DEN,CAR@MIN,BUF@NE,HOU@PIT,DAL@SEA", "14": "MIN@NE,TB@BAL,NO@CAR,ATL@CLE,TEN@DET,CHI@MIA,DEN@NYJ,IND@PHI,HOU@WAS,LAC@LV,KC@CIN,NYG@SEA,LAR@SF,BUF@GB,PIT@JAX", "15": "SF@LAC,SEA@PHI,CHI@BUF,CIN@CAR,MIA@GB,JAX@HOU,CLE@NYG,BAL@PIT,NO@TB,IND@TEN,ATL@WAS,NYJ@ARI,DAL@LAR,DEN@LV,DET@MIN,NE@KC", "16": "HOU@PHI,GB@CHI,BUF@DEN,LAR@SEA,CLE@BAL,LAC@MIA,ARI@NO,NE@NYJ,TEN@LV,SF@KC,JAX@DAL,TB@ATL,CIN@IND,WAS@MIN,CAR@PIT,NYG@DET", "17": "BAL@CIN,NO@ATL,SEA@CAR,IND@CLE,NYG@DAL,BUF@MIA,MIN@NYJ,PIT@TEN,LV@ARI,DET@CHI,PHI@SF,WAS@JAX,KC@LAC,DEN@NE,LAR@TB,HOU@GB", "18": "SF@ARI,PIT@BAL,NYJ@BUF,ATL@CAR,CLE@CIN,LAC@DEN,DET@GB,TEN@HOU,JAX@IND,LV@KC,SEA@LAR,CHI@MIN,MIA@NE,TB@NO,PHI@NYG,DAL@WAS"};
const TEAM_NAMES={"ARI": "Cardinals", "ATL": "Falcons", "BAL": "Ravens", "BUF": "Bills", "CAR": "Panthers", "CHI": "Bears", "CIN": "Bengals", "CLE": "Browns", "DAL": "Cowboys", "DEN": "Broncos", "DET": "Lions", "GB": "Packers", "HOU": "Texans", "IND": "Colts", "JAX": "Jaguars", "KC": "Chiefs", "LV": "Raiders", "LAC": "Chargers", "LAR": "Rams", "MIA": "Dolphins", "MIN": "Vikings", "NE": "Patriots", "NO": "Saints", "NYG": "Giants", "NYJ": "Jets", "PHI": "Eagles", "PIT": "Steelers", "SF": "49ers", "SEA": "Seahawks", "TB": "Buccaneers", "TEN": "Titans", "WAS": "Commanders"};
const PLAYERS=["J. Barnes","M. Barnes","D. Barnes","L. Lynn","J. Lynn","D. Stephens","K. Stephens","P. Alderman","J. Davenport","T. Carder","Frankie","J. Wigfall","D. Green","J. Doutt"];
const POST_MAP={19:1,20:2,21:3,22:5};
const OFFICIAL_FIRST_KICKOFF_FALLBACK={
  1:"2026-09-10T00:20:00.000Z",
  2:"2026-09-18T00:15:00.000Z",
  3:"2026-09-25T00:15:00.000Z",
  4:"2026-10-02T00:15:00.000Z",
  5:"2026-10-09T00:15:00.000Z",
  6:"2026-10-16T00:15:00.000Z",
  7:"2026-10-23T00:15:00.000Z",
  8:"2026-10-30T00:15:00.000Z",
  9:"2026-11-06T01:15:00.000Z",
  10:"2026-11-13T01:15:00.000Z",
  11:"2026-11-20T01:15:00.000Z",
  12:"2026-11-26T01:00:00.000Z",
  13:"2026-12-04T01:15:00.000Z",
  14:"2026-12-11T01:15:00.000Z",
  15:"2026-12-18T01:15:00.000Z",
  16:"2026-12-25T01:15:00.000Z",
  17:"2027-01-01T01:15:00.000Z"
};
const REG_WEEK_DATES={
  1:["20260909","20260914"],2:["20260917","20260921"],3:["20260924","20260928"],4:["20261001","20261005"],
  5:["20261008","20261012"],6:["20261015","20261019"],7:["20261022","20261026"],8:["20261029","20261102"],
  9:["20261105","20261109"],10:["20261112","20261116"],11:["20261119","20261123"],12:["20261126","20261130"],
  13:["20261203","20261207"],14:["20261210","20261214"],15:["20261217","20261221"],16:["20261224","20261228"],
  17:["20261231","20270104"],18:["20270107","20270111"]
};
const ALIAS={LA:"LAR",JAC:"JAX",WSH:"WAS"};
const GAME33_ENTRY_FEE=50;
const GAME33_WEEKS=18;
const NFL_TEAM_CODES_33=["ARI","ATL","BAL","BUF","CAR","CHI","CIN","CLE","DAL","DEN","DET","GB","HOU","IND","JAX","KC","LV","LAC","LAR","MIA","MIN","NE","NO","NYG","NYJ","PHI","PIT","SF","SEA","TB","TEN","WAS"];

function normTeam(t){return ALIAS[t]||t}
function currentFootballSeason(now=new Date()){
  const d=now instanceof Date?now:new Date(now);
  const y=d.getUTCFullYear(),m=d.getUTCMonth()+1;
  return m>=7?y:y-1;
}

const te=new TextEncoder();
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}})}
function b64(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes)))}
async function hashPassword(password,salt){let bits=await crypto.subtle.digest("SHA-256",te.encode(`${salt}:${password}`));return b64(bits)}
function newSalt(){let a=new Uint8Array(16);crypto.getRandomValues(a);return b64(a)}
function gamesNFL(w){return SCHEDULE[w]?SCHEDULE[w].split(",").map(x=>x.split("@")):[]}
function safeCode(x){return String(x||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,20)}
function sportOf(x){const v=String(x||"nfl").toLowerCase();return v==="college"?"college":(v==="33"?"33":(v==="march"?"march":"nfl"))}


async function seedBarnsVenmo(DB){
  const pool=await DB.prepare("SELECT id FROM pools WHERE code='LINKS'").first();
  if(!pool?.id)return;
  await DB.prepare("INSERT OR IGNORE INTO pool_settings(pool_id,key,value) VALUES(?,'venmo',?)")
    .bind(pool.id,"@Michael-Barnes-201").run();
}

async function ensureBarnesFamilyName(DB){
  await DB.prepare("UPDATE pools SET name='Barnes Family' WHERE code='LINKS' AND name<>'Barnes Family'").run();
}

async function ensureBarnesNFLGameType(DB){
  // Legacy bootstrap only.  Never reactivate NFL after a commissioner has made
  // an explicit active-game selection for Barnes Family.
  const pool=await DB.prepare("SELECT id FROM pools WHERE code='LINKS'").first();
  if(!pool?.id)return;
  const exact=await DB.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='active_games_exact'").bind(pool.id).first();
  const active=await DB.prepare("SELECT COUNT(*) AS n FROM pool_active_games WHERE pool_id=? AND active=1").bind(pool.id).first();
  if(exact?.value||Number(active?.n||0)>0)return;
  await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'game_type','nfl') ON CONFLICT(pool_id,key) DO NOTHING").bind(pool.id).run();
  await DB.prepare("INSERT INTO pool_active_games(pool_id,game_type,is_primary,active,added_at) VALUES(?,'nfl',1,1,?) ON CONFLICT(pool_id,game_type) DO NOTHING")
    .bind(pool.id,new Date().toISOString()).run();
}


async function ensureBarnesLinksServicePaid(DB){
  const pool=await DB.prepare("SELECT id FROM pools WHERE code='LINKS'").first();
  if(!pool?.id)return;
  await DB.prepare(`
    INSERT INTO pool_service(pool_id,plan,status,price_cents,paid_at,notes)
    VALUES(?,'all_access','PAID',12900,?,'Barnes Family Links service — All Access paid')
    ON CONFLICT(pool_id) DO UPDATE SET
      plan='all_access',
      status='PAID',
      price_cents=12900,
      paid_at=COALESCE(pool_service.paid_at,excluded.paid_at),
      notes='Barnes Family Links service — All Access paid'
  `).bind(pool.id,new Date().toISOString()).run();
}

async function ensureV2(DB){
  const sqls=[
`CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY,value TEXT)`,
`CREATE TABLE IF NOT EXISTS pools (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 code TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 admin_salt TEXT NOT NULL,
 admin_hash TEXT NOT NULL,
 created_at TEXT NOT NULL
)`,
`CREATE TABLE IF NOT EXISTS pool_players (
 pool_id INTEGER NOT NULL,
 name TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 salt TEXT NOT NULL,
 PRIMARY KEY(pool_id,name)
)`,
`CREATE TABLE IF NOT EXISTS pool_invites (
 token TEXT PRIMARY KEY,
 pool_id INTEGER NOT NULL,
 email TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'PENDING',
 created_at TEXT NOT NULL,
 used_at TEXT
)`,
`CREATE TABLE IF NOT EXISTS pool_player_setup_invites (
 token TEXT PRIMARY KEY,
 pool_id INTEGER NOT NULL,
 player_name TEXT NOT NULL,
 email TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'PENDING',
 created_at TEXT NOT NULL,
 used_at TEXT
)`,
`CREATE TABLE IF NOT EXISTS pool_player_contacts (
 pool_id INTEGER NOT NULL,
 player_name TEXT NOT NULL,
 email TEXT NOT NULL DEFAULT '',
 phone TEXT NOT NULL DEFAULT '',
 PRIMARY KEY(pool_id,player_name)
)`,
`CREATE TABLE IF NOT EXISTS pool_sessions (
 token TEXT PRIMARY KEY,
 pool_id INTEGER NOT NULL,
 player_name TEXT NOT NULL,
 role TEXT NOT NULL,
 expires_at TEXT NOT NULL
)`,
`CREATE TABLE IF NOT EXISTS pool_login_activity (
 pool_id INTEGER NOT NULL,
 player_name TEXT NOT NULL,
 login_count INTEGER NOT NULL DEFAULT 0,
 first_login_at TEXT NOT NULL,
 last_login_at TEXT NOT NULL,
 PRIMARY KEY(pool_id,player_name)
)`,
`CREATE TABLE IF NOT EXISTS pool_settings (
 pool_id INTEGER NOT NULL,
 key TEXT NOT NULL,
 value TEXT,
 PRIMARY KEY(pool_id,key)
)`,
`CREATE TABLE IF NOT EXISTS pool_active_games (
 pool_id INTEGER NOT NULL,
 game_type TEXT NOT NULL,
 is_primary INTEGER NOT NULL DEFAULT 0,
 active INTEGER NOT NULL DEFAULT 1,
 added_at TEXT NOT NULL,
 PRIMARY KEY(pool_id,game_type)
)`,
`CREATE TABLE IF NOT EXISTS pool_picks (
 pool_id INTEGER NOT NULL,
 sport TEXT NOT NULL,
 player_name TEXT NOT NULL,
 week INTEGER NOT NULL,
 game_index INTEGER NOT NULL,
 team TEXT NOT NULL,
 PRIMARY KEY(pool_id,sport,player_name,week,game_index)
)`,
`CREATE TABLE IF NOT EXISTS pool_ties (
 pool_id INTEGER NOT NULL,
 sport TEXT NOT NULL,
 player_name TEXT NOT NULL,
 week INTEGER NOT NULL,
 guess INTEGER,
 PRIMARY KEY(pool_id,sport,player_name,week)
)`,
`CREATE TABLE IF NOT EXISTS pool_payments (
 pool_id INTEGER NOT NULL,
 sport TEXT NOT NULL,
 player_name TEXT NOT NULL,
 week INTEGER NOT NULL,
 paid INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(pool_id,sport,player_name,week)
)`,
`CREATE TABLE IF NOT EXISTS pool_results (
 pool_id INTEGER NOT NULL,
 sport TEXT NOT NULL,
 week INTEGER NOT NULL,
 game_index INTEGER NOT NULL,
 winner TEXT NOT NULL,
 PRIMARY KEY(pool_id,sport,week,game_index)
)`,
`CREATE TABLE IF NOT EXISTS pool_final_snapshots (
 pool_id INTEGER NOT NULL,
 sport TEXT NOT NULL,
 week INTEGER NOT NULL,
 game_index INTEGER NOT NULL,
 winner TEXT NOT NULL,
 away_score REAL,
 home_score REAL,
 status TEXT DEFAULT 'FINAL',
 PRIMARY KEY(pool_id,sport,week,game_index)
)`,
`CREATE TABLE IF NOT EXISTS pool_week_meta (
 pool_id INTEGER NOT NULL,
 sport TEXT NOT NULL,
 week INTEGER NOT NULL,
 lock_time TEXT,
 actual_tie INTEGER,
 finalized_winner TEXT,
 payout_paid INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(pool_id,sport,week)
)`,
`CREATE TABLE IF NOT EXISTS pool_games (
 pool_id INTEGER NOT NULL,
 sport TEXT NOT NULL,
 week INTEGER NOT NULL,
 game_index INTEGER NOT NULL,
 event_id TEXT,
 away TEXT NOT NULL,
 home TEXT NOT NULL,
 away_name TEXT,
 home_name TEXT,
 away_id TEXT,
 home_id TEXT,
 kickoff TEXT,
 PRIMARY KEY(pool_id,sport,week,game_index)
)`
  ,
`CREATE TABLE IF NOT EXISTS odds_cache (
    sport TEXT PRIMARY KEY,
    fetched_at TEXT NOT NULL,
    payload TEXT NOT NULL
  )`,
`CREATE TABLE IF NOT EXISTS pool_market_odds (
    pool_id INTEGER NOT NULL,
    sport TEXT NOT NULL,
    week INTEGER NOT NULL,
    game_index INTEGER NOT NULL,
    away_prob REAL,
    home_prob REAL,
    books INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    PRIMARY KEY(pool_id,sport,week,game_index)
  )`,
`CREATE TABLE IF NOT EXISTS payment_orders (
    id TEXT PRIMARY KEY,
    pool_id INTEGER NOT NULL,
    sport TEXT NOT NULL,
    week INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    square_order_id TEXT,
    square_payment_link_id TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TEXT NOT NULL,
    paid_at TEXT
  )`,
`CREATE TABLE IF NOT EXISTS pool_33_entries (
    pool_id INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    paid INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY(pool_id,player_name)
  )`,
`CREATE TABLE IF NOT EXISTS pool_33_assignments (
    pool_id INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    team TEXT NOT NULL,
    assigned_at TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual',
    PRIMARY KEY(pool_id,player_name),
    UNIQUE(pool_id,team)
  )`,
`CREATE TABLE IF NOT EXISTS pool_33_state (
    pool_id INTEGER PRIMARY KEY,
    draw_locked INTEGER NOT NULL DEFAULT 0,
    draw_source TEXT,
    draw_at TEXT
  )`,
`CREATE TABLE IF NOT EXISTS pool_33_week_meta (
    pool_id INTEGER NOT NULL,
    week INTEGER NOT NULL,
    finalized INTEGER NOT NULL DEFAULT 0,
    winners_json TEXT,
    payout_amount REAL NOT NULL DEFAULT 0,
    payout_paid INTEGER NOT NULL DEFAULT 0,
    finalized_at TEXT,
    PRIMARY KEY(pool_id,week)
  )`,
`CREATE TABLE IF NOT EXISTS squares_boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pool_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    event_id TEXT NOT NULL,
    week INTEGER NOT NULL,
    away TEXT NOT NULL,
    home TEXT NOT NULL,
    away_name TEXT,
    home_name TEXT,
    kickoff TEXT,
    price REAL NOT NULL DEFAULT 0,
    payout_q1 REAL NOT NULL DEFAULT 0,
    payout_half REAL NOT NULL DEFAULT 0,
    payout_q3 REAL NOT NULL DEFAULT 0,
    payout_final REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'OPEN',
    numbers_away TEXT,
    numbers_home TEXT,
    created_at TEXT NOT NULL
  )`,
`CREATE TABLE IF NOT EXISTS squares_claims (
    board_id INTEGER NOT NULL,
    square_index INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    paid INTEGER NOT NULL DEFAULT 0,
    claimed_at TEXT NOT NULL,
    PRIMARY KEY(board_id,square_index)
  )`,
`CREATE TABLE IF NOT EXISTS squares_results (
    board_id INTEGER PRIMARY KEY,
    q1_away INTEGER,
    q1_home INTEGER,
    half_away INTEGER,
    half_home INTEGER,
    q3_away INTEGER,
    q3_home INTEGER,
    final_away INTEGER,
    final_home INTEGER,
    updated_at TEXT
  )`,
`CREATE TABLE IF NOT EXISTS pool_service (
    pool_id INTEGER PRIMARY KEY,
    plan TEXT NOT NULL DEFAULT 'pool_plus',
    status TEXT NOT NULL DEFAULT 'PENDING',
    price_cents INTEGER,
    paid_at TEXT,
    notes TEXT
  )`,
`CREATE TABLE IF NOT EXISTS service_purchases (
    purchase_token TEXT PRIMARY KEY,
    plan TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    paypal_order_id TEXT UNIQUE,
    paypal_capture_id TEXT,
    status TEXT NOT NULL DEFAULT 'CREATED',
    created_at TEXT NOT NULL,
    paid_at TEXT,
    consumed_at TEXT,
    pool_id INTEGER
  )`,
`CREATE TABLE IF NOT EXISTS commissioner_entitlements (
    email TEXT PRIMARY KEY,
    plan TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    max_pools INTEGER NOT NULL DEFAULT 1,
    max_games_per_pool INTEGER NOT NULL DEFAULT 1,
    game_scope TEXT NOT NULL DEFAULT 'all',
    ad_free INTEGER NOT NULL DEFAULT 0,
    paid_at TEXT,
    expires_at TEXT,
    updated_at TEXT NOT NULL
  )`,
`CREATE TABLE IF NOT EXISTS commissioner_service_purchases (
    purchase_token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    plan TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    paypal_order_id TEXT UNIQUE,
    paypal_capture_id TEXT,
    status TEXT NOT NULL DEFAULT 'CREATED',
    created_at TEXT NOT NULL,
    paid_at TEXT
  )`,
`CREATE TABLE IF NOT EXISTS commissioner_game_additions (
    pool_id INTEGER NOT NULL,
    game_type TEXT NOT NULL,
    email TEXT NOT NULL,
    added_at TEXT NOT NULL,
    PRIMARY KEY(pool_id,game_type)
  )`,
`CREATE TABLE IF NOT EXISTS links_admin_sessions (
    token TEXT PRIMARY KEY,
    expires_at TEXT NOT NULL
  )`,
`CREATE TABLE IF NOT EXISTS march_config (
    pool_id INTEGER PRIMARY KEY,
    lock_time TEXT,
    updated_at TEXT NOT NULL
  )`,
`CREATE TABLE IF NOT EXISTS march_teams (
    pool_id INTEGER NOT NULL,
    slot INTEGER NOT NULL,
    seed INTEGER NOT NULL,
    team TEXT NOT NULL,
    region TEXT NOT NULL,
    PRIMARY KEY(pool_id,slot)
  )`,
`CREATE TABLE IF NOT EXISTS march_picks (
    pool_id INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    game_id INTEGER NOT NULL,
    team_slot INTEGER NOT NULL,
    PRIMARY KEY(pool_id,player_name,game_id)
  )`,
`CREATE TABLE IF NOT EXISTS march_ties (
    pool_id INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    guess INTEGER,
    PRIMARY KEY(pool_id,player_name)
  )`,
`CREATE TABLE IF NOT EXISTS march_results (
    pool_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    team_slot INTEGER NOT NULL,
    PRIMARY KEY(pool_id,game_id)
  )`,
`CREATE TABLE IF NOT EXISTS march_sync (
    pool_id INTEGER PRIMARY KEY,
    last_sync TEXT,
    source TEXT,
    status TEXT
  )`,
`CREATE TABLE IF NOT EXISTS fantasy_teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pool_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    owner_name TEXT,
    draft_slot INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    UNIQUE(pool_id,name)
  )`,
`CREATE TABLE IF NOT EXISTS fantasy_rosters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pool_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    position TEXT NOT NULL,
    nfl_team TEXT,
    lineup_slot TEXT NOT NULL DEFAULT 'BENCH',
    created_at TEXT NOT NULL,
    UNIQUE(pool_id,team_id,player_name)
  )`,
`CREATE TABLE IF NOT EXISTS fantasy_matchups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pool_id INTEGER NOT NULL,
    week INTEGER NOT NULL,
    home_team_id INTEGER NOT NULL,
    away_team_id INTEGER NOT NULL,
    home_score REAL NOT NULL DEFAULT 0,
    away_score REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'OPEN',
    UNIQUE(pool_id,week,home_team_id,away_team_id)
  )`,
`CREATE TABLE IF NOT EXISTS fantasy_weekly_stats (
    pool_id INTEGER NOT NULL,
    week INTEGER NOT NULL,
    roster_id INTEGER NOT NULL,
    provider_player_id TEXT,
    fantasy_points REAL NOT NULL DEFAULT 0,
    stat_json TEXT NOT NULL DEFAULT '{}',
    game_status TEXT,
    updated_at TEXT NOT NULL,
    PRIMARY KEY(pool_id,week,roster_id)
  )`,
`CREATE TABLE IF NOT EXISTS fantasy_sync_log (
    pool_id INTEGER NOT NULL,
    week INTEGER NOT NULL,
    provider TEXT NOT NULL,
    status TEXT NOT NULL,
    games_synced INTEGER NOT NULL DEFAULT 0,
    players_matched INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    message TEXT,
    PRIMARY KEY(pool_id,week)
  )`,
`CREATE TABLE IF NOT EXISTS dynasty_teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT, pool_id INTEGER NOT NULL, name TEXT NOT NULL, owner_name TEXT, draft_slot INTEGER DEFAULT 0, cap REAL DEFAULT 100, created_at TEXT NOT NULL, UNIQUE(pool_id,name)
  )`,
`CREATE TABLE IF NOT EXISTS dynasty_rosters (
    id INTEGER PRIMARY KEY AUTOINCREMENT, pool_id INTEGER NOT NULL, team_id INTEGER NOT NULL, player_name TEXT NOT NULL, position TEXT NOT NULL, nfl_team TEXT, salary REAL DEFAULT 0, contract_years INTEGER DEFAULT 1, contract_year INTEGER DEFAULT 1, acquisition TEXT DEFAULT 'ROSTER', status TEXT DEFAULT 'ACTIVE', lineup_slot TEXT DEFAULT 'BENCH', created_at TEXT NOT NULL, UNIQUE(pool_id,player_name)
  )`,
`CREATE TABLE IF NOT EXISTS dynasty_matchups (
    id INTEGER PRIMARY KEY AUTOINCREMENT, pool_id INTEGER NOT NULL, week INTEGER NOT NULL, home_team_id INTEGER NOT NULL, away_team_id INTEGER NOT NULL, home_score REAL DEFAULT 0, away_score REAL DEFAULT 0, status TEXT DEFAULT 'OPEN', UNIQUE(pool_id,week,home_team_id,away_team_id)
  )`,
`CREATE TABLE IF NOT EXISTS dynasty_draft_picks (
    id INTEGER PRIMARY KEY AUTOINCREMENT, pool_id INTEGER NOT NULL, season INTEGER NOT NULL, round INTEGER NOT NULL, pick_no INTEGER NOT NULL, team_id INTEGER, player_name TEXT, position TEXT, nfl_team TEXT, salary REAL DEFAULT 0, contract_years INTEGER DEFAULT 1, made_at TEXT, UNIQUE(pool_id,season,round,pick_no)
  )`,
`CREATE TABLE IF NOT EXISTS dynasty_trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT, pool_id INTEGER NOT NULL, from_team_id INTEGER NOT NULL, to_team_id INTEGER NOT NULL, offer_text TEXT NOT NULL, request_text TEXT NOT NULL, status TEXT DEFAULT 'PENDING', created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT
  )`,
`CREATE TABLE IF NOT EXISTS dynasty_waiver_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT, pool_id INTEGER NOT NULL, team_id INTEGER NOT NULL, player_name TEXT NOT NULL, position TEXT NOT NULL, nfl_team TEXT, salary REAL DEFAULT 0, contract_years INTEGER DEFAULT 1, status TEXT DEFAULT 'PENDING', requested_by TEXT, created_at TEXT NOT NULL, updated_at TEXT
  )`,
`CREATE TABLE IF NOT EXISTS dynasty_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, pool_id INTEGER NOT NULL, team_id INTEGER, action TEXT NOT NULL, player_name TEXT, details TEXT, created_at TEXT NOT NULL
  )`,
`CREATE TABLE IF NOT EXISTS game_instances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pool_id INTEGER NOT NULL,
    game_type TEXT NOT NULL,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 1,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
`CREATE TABLE IF NOT EXISTS special_game_period_entries (pool_id INTEGER NOT NULL, game_type TEXT NOT NULL, player_name TEXT NOT NULL, period_key TEXT NOT NULL, entry_json TEXT NOT NULL DEFAULT '{}', submitted_at TEXT NOT NULL, PRIMARY KEY(pool_id,game_type,player_name,period_key))`,
`CREATE TABLE IF NOT EXISTS special_game_entries (pool_id INTEGER NOT NULL, game_type TEXT NOT NULL, player_name TEXT NOT NULL, entry_json TEXT NOT NULL DEFAULT '{}', submitted_at TEXT NOT NULL, PRIMARY KEY(pool_id,game_type,player_name))`,
`CREATE TABLE IF NOT EXISTS special_game_scores (pool_id INTEGER NOT NULL, game_type TEXT NOT NULL, player_name TEXT NOT NULL, score REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'OPEN', detail_json TEXT NOT NULL DEFAULT '{}', updated_at TEXT NOT NULL, PRIMARY KEY(pool_id,game_type,player_name))`,
`CREATE INDEX IF NOT EXISTS idx_game_instances_pool_game ON game_instances(pool_id,game_type,active,sort_order,id)`
  ];
  for(const s of sqls) await DB.prepare(s).run();
  // v152: pricing/entitlement launch marker. Existing pools remain grandfathered forever.
  await DB.prepare("INSERT OR IGNORE INTO app_meta(key,value) VALUES('commissioner_entitlements_launch_at',?)").bind(new Date().toISOString()).run();
  // Backward-compatible status field for existing-player password setup emails.
  // ALTER is intentionally best-effort so already-migrated databases are safe.
  try{await DB.prepare("ALTER TABLE pool_player_setup_invites ADD COLUMN email_sent INTEGER NOT NULL DEFAULT 0").run()}catch(e){}
  await migrateLinks(DB);
  await seedBarnsWeek1Paid(DB);
  await seedBarnsVenmo(DB);
  await ensureBarnesFamilyName(DB);
  await ensureBarnesNFLGameType(DB);
  await ensureBarnesLinksServicePaid(DB);
  await ensureBarnesCommissionerV118(DB);
}

async function migrateLinks(DB){
  let done=await DB.prepare("SELECT value FROM app_meta WHERE key='links_v2_migrated'").first();
  if(done?.value==="1") return;
  let salt=null,hash=null;
  try{
    const rows=(await DB.prepare("SELECT key,value FROM settings WHERE key IN ('admin_salt','admin_hash')").all()).results||[];
    const m=Object.fromEntries(rows.map(x=>[x.key,x.value])); salt=m.admin_salt;hash=m.admin_hash;
  }catch(e){}
  if(!salt||!hash){salt=newSalt();hash=await hashPassword("Poop",salt)}
  await DB.prepare("INSERT OR IGNORE INTO pools(code,name,admin_salt,admin_hash,created_at) VALUES('LINKS','Barnes Family',?,?,?)").bind(salt,hash,new Date().toISOString()).run();
  const pool=await DB.prepare("SELECT id FROM pools WHERE code='LINKS'").first();
  const pid=pool.id;
  let copied=false;
  try{
    const legacy=(await DB.prepare("SELECT name,password_hash,salt FROM players").all()).results||[];
    if(legacy.length){
      for(const p of legacy) await DB.prepare("INSERT OR IGNORE INTO pool_players(pool_id,name,password_hash,salt) VALUES(?,?,?,?)").bind(pid,p.name,p.password_hash,p.salt).run();
      copied=true;
    }
  }catch(e){}
  if(!copied){
    for(const n of PLAYERS){const s=newSalt(),h=await hashPassword("1234",s);await DB.prepare("INSERT OR IGNORE INTO pool_players(pool_id,name,password_hash,salt) VALUES(?,?,?,?)").bind(pid,n,h,s).run()}
  }
  let fee="11";
  try{const f=await DB.prepare("SELECT value FROM settings WHERE key='fee'").first();if(f?.value!=null)fee=String(f.value)}catch(e){}
  await DB.prepare("INSERT OR IGNORE INTO pool_settings(pool_id,key,value) VALUES(?,'fee',?)").bind(pid,fee).run();
  try{await DB.prepare("INSERT OR IGNORE INTO pool_picks(pool_id,sport,player_name,week,game_index,team) SELECT ?,'nfl',player_name,week,game_index,team FROM picks").bind(pid).run()}catch(e){}
  try{await DB.prepare("INSERT OR IGNORE INTO pool_ties(pool_id,sport,player_name,week,guess) SELECT ?,'nfl',player_name,week,guess FROM ties").bind(pid).run()}catch(e){}
  try{await DB.prepare("INSERT OR IGNORE INTO pool_payments(pool_id,sport,player_name,week,paid) SELECT ?,'nfl',player_name,week,paid FROM payments").bind(pid).run()}catch(e){}
  try{await DB.prepare("INSERT OR IGNORE INTO pool_results(pool_id,sport,week,game_index,winner) SELECT ?,'nfl',week,game_index,winner FROM results").bind(pid).run()}catch(e){}
  try{await DB.prepare("INSERT OR IGNORE INTO pool_week_meta(pool_id,sport,week,lock_time,actual_tie,finalized_winner,payout_paid) SELECT ?,'nfl',week,lock_time,actual_tie,finalized_winner,payout_paid FROM week_meta").bind(pid).run()}catch(e){}
  await DB.prepare("INSERT INTO app_meta(key,value) VALUES('links_v2_migrated','1') ON CONFLICT(key) DO UPDATE SET value='1'").run();
}


async function seedBarnsWeek1Paid(DB){
  const done=await DB.prepare("SELECT value FROM app_meta WHERE key='barns_week1_all_paid_nfl'").first();
  if(done?.value==="1")return;

  const pool=await DB.prepare("SELECT id FROM pools WHERE code='LINKS'").first();
  if(!pool)return;

  const players=(await DB.prepare("SELECT name FROM pool_players WHERE pool_id=?").bind(pool.id).all()).results||[];
  const stm=[];
  for(const p of players){
    stm.push(
      DB.prepare("INSERT INTO pool_payments(pool_id,sport,player_name,week,paid) VALUES(?,'nfl',?,1,1) ON CONFLICT(pool_id,sport,player_name,week) DO UPDATE SET paid=1")
        .bind(pool.id,p.name)
    );
  }
  if(stm.length)await DB.batch(stm);

  await DB.prepare("INSERT INTO app_meta(key,value) VALUES('barns_week1_all_paid_nfl','1') ON CONFLICT(key) DO UPDATE SET value='1'").run();
}

async function ensureBarnesCommissionerV118(DB){
  const done=await DB.prepare("SELECT value FROM app_meta WHERE key='barnes_commissioner_j_barnes_v118'").first();
  if(done?.value==="1")return;
  const pool=await DB.prepare("SELECT id FROM pools WHERE code='LINKS'").first();
  if(!pool)return;
  const target=await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower('J. Barnes') LIMIT 1").bind(pool.id).first();
  if(!target)return;
  await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'commissioner_player_name',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pool.id,target.name).run();
  await DB.prepare("UPDATE pool_sessions SET role='player' WHERE pool_id=? AND role='admin'").bind(pool.id).run();
  await DB.prepare("UPDATE pool_sessions SET role='admin' WHERE pool_id=? AND lower(player_name)=lower(?)").bind(pool.id,target.name).run();
  await DB.prepare("INSERT INTO app_meta(key,value) VALUES('barnes_commissioner_j_barnes_v118','1') ON CONFLICT(key) DO UPDATE SET value='1'").run();
}

async function poolByCode(DB,code){return DB.prepare("SELECT * FROM pools WHERE code=?").bind(safeCode(code)).first()}
async function uniquePoolCode(DB,name){
  const cleaned=safeCode(name);
  const prefix=(cleaned.slice(0,3)||"LNK").padEnd(3,"X");
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for(let attempt=0;attempt<50;attempt++){
    const bytes=new Uint8Array(3);crypto.getRandomValues(bytes);
    let suffix="";for(const b of bytes)suffix+=chars[b%chars.length];
    const code=prefix+suffix;
    if(!await poolByCode(DB,code))return code;
  }
  const fallback=safeCode(prefix+crypto.randomUUID().replace(/-/g,"").slice(0,8));
  if(!await poolByCode(DB,fallback))return fallback;
  throw new Error("Could not generate a unique pool code. Please try again.");
}
async function poolLookup(DB,input){
  const raw=String(input||"").trim();
  let p=await DB.prepare("SELECT * FROM pools WHERE code=?").bind(safeCode(raw)).first();
  if(p)return p;
  return DB.prepare("SELECT * FROM pools WHERE lower(name)=lower(?)").bind(raw).first();
}
async function auth(req,DB,needRole=null){
  const h=req.headers.get("authorization")||"",token=h.startsWith("Bearer ")?h.slice(7):"";
  if(!token)return null;
  const s=await DB.prepare("SELECT * FROM pool_sessions WHERE token=?").bind(token).first();
  if(!s||Date.parse(s.expires_at)<Date.now())return null;
  if(needRole&&s.role!==needRole)return null;
  return s;
}
async function makeSession(DB,poolId,player,role){
  const token=crypto.randomUUID()+crypto.randomUUID().replaceAll("-",""),expires=new Date(Date.now()+30*864e5).toISOString();
  await DB.prepare("INSERT INTO pool_sessions(token,pool_id,player_name,role,expires_at) VALUES(?,?,?,?,?)").bind(token,poolId,player,role,expires).run();
  return token;
}


const NFL_FULL={
ARI:"Arizona Cardinals",ATL:"Atlanta Falcons",BAL:"Baltimore Ravens",BUF:"Buffalo Bills",CAR:"Carolina Panthers",
CHI:"Chicago Bears",CIN:"Cincinnati Bengals",CLE:"Cleveland Browns",DAL:"Dallas Cowboys",DEN:"Denver Broncos",
DET:"Detroit Lions",GB:"Green Bay Packers",HOU:"Houston Texans",IND:"Indianapolis Colts",JAX:"Jacksonville Jaguars",
KC:"Kansas City Chiefs",LV:"Las Vegas Raiders",LAC:"Los Angeles Chargers",LAR:"Los Angeles Rams",MIA:"Miami Dolphins",
MIN:"Minnesota Vikings",NE:"New England Patriots",NO:"New Orleans Saints",NYG:"New York Giants",NYJ:"New York Jets",
PHI:"Philadelphia Eagles",PIT:"Pittsburgh Steelers",SF:"San Francisco 49ers",SEA:"Seattle Seahawks",TB:"Tampa Bay Buccaneers",
TEN:"Tennessee Titans",WAS:"Washington Commanders"
};
function oddsConfigured(env){return !!env.ODDS_API_KEY}
function normOddsName(s){return String(s||"").toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g," ").trim()}
function gameTeamName(g,side,sport){
  const code=side==="away"?g.away:g.home;
  const display=side==="away"?g.awayName:g.homeName;
  return sport==="nfl"?(NFL_FULL[code]||display||code):(display||code);
}
function teamNameMatches(a,b){
  const x=normOddsName(a),y=normOddsName(b);
  if(!x||!y)return false;
  if(x===y)return true;
  if(x.endsWith(" "+y)||y.endsWith(" "+x))return true;
  const xa=x.split(" "),ya=y.split(" ");
  return xa.length>1&&ya.length>1&&xa[xa.length-1]===ya[ya.length-1]&&Math.min(x.length,y.length)>=5;
}
function consensusForEvent(e){
  let homeSum=0,awaySum=0,n=0;
  for(const b of (e.bookmakers||[])){
    const m=(b.markets||[]).find(x=>x.key==="h2h");
    if(!m)continue;
    const ho=(m.outcomes||[]).find(x=>teamNameMatches(x.name,e.home_team));
    const ao=(m.outcomes||[]).find(x=>teamNameMatches(x.name,e.away_team));
    const hd=Number(ho?.price),ad=Number(ao?.price);
    if(!(hd>1&&ad>1))continue;
    const hi=1/hd,ai=1/ad,total=hi+ai;
    if(total<=0)continue;
    homeSum+=hi/total;awaySum+=ai/total;n++;
  }
  if(!n)return null;
  return {homeProb:homeSum/n,awayProb:awaySum/n,books:n};
}
async function fetchOddsFeed(DB,env,sport){
  if(!oddsConfigured(env))return [];
  const cached=await DB.prepare("SELECT fetched_at,payload FROM odds_cache WHERE sport=?").bind(sport).first();
  if(cached&&Date.now()-Date.parse(cached.fetched_at)<30*60*1000){
    try{return JSON.parse(cached.payload)||[]}catch(e){}
  }
  const key=sport==="nfl"?"americanfootball_nfl":"americanfootball_ncaaf";
  const url=`https://api.the-odds-api.com/v4/sports/${key}/odds?apiKey=${encodeURIComponent(env.ODDS_API_KEY)}&regions=us&markets=h2h&oddsFormat=decimal`;
  const r=await fetch(url);
  if(!r.ok){
    if(cached){try{return JSON.parse(cached.payload)||[]}catch(e){}}
    return [];
  }
  const data=await r.json();
  await DB.prepare("INSERT INTO odds_cache(sport,fetched_at,payload) VALUES(?,?,?) ON CONFLICT(sport) DO UPDATE SET fetched_at=excluded.fetched_at,payload=excluded.payload")
    .bind(sport,new Date().toISOString(),JSON.stringify(data)).run();
  return data;
}
function findOddsEvent(feed,g,sport){
  const home=gameTeamName(g,"home",sport),away=gameTeamName(g,"away",sport);
  let matches=feed.filter(e=>teamNameMatches(e.home_team,home)&&teamNameMatches(e.away_team,away));
  if(!matches.length)matches=feed.filter(e=>teamNameMatches(e.home_team,away)&&teamNameMatches(e.away_team,home));
  if(matches.length<=1)return matches[0]||null;
  if(g.kickoff){
    const gt=Date.parse(g.kickoff);
    matches.sort((a,b)=>Math.abs(Date.parse(a.commence_time)-gt)-Math.abs(Date.parse(b.commence_time)-gt));
  }
  return matches[0]||null;
}


function spreadToProb(spreadAbs){
  const s=Math.abs(Number(spreadAbs));
  if(!Number.isFinite(s))return null;
  // Fallback only when ESPN supplies a spread but no moneyline/predictor.
  // Keeps this explicitly labeled as a spread-based estimate.
  return 1/(1+Math.exp(-(s-1.5)/6.5));
}
function marketFromOddsObject(o){
  if(!o)return null;
  const hm=Number(o?.homeTeamOdds?.moneyLine ?? o?.homeMoneyLine);
  const am=Number(o?.awayTeamOdds?.moneyLine ?? o?.awayMoneyLine);
  const hp=americanMoneylineToProb(hm),ap=americanMoneylineToProb(am);
  if(hp&&ap){
    const n=normalizeTwoWay(ap,hp);
    if(n)return {...n,books:1,source:"ESPN sportsbook odds"};
  }

  const spread=Number(o?.spread);
  if(Number.isFinite(spread)&&spread!==0){
    let homeFav=!!o?.homeTeamOdds?.favorite,awayFav=!!o?.awayTeamOdds?.favorite;
    // ESPN detail examples: "TENN -38.5", "ALA -24.5".
    if(!homeFav&&!awayFav&&typeof o?.details==="string"){
      const d=o.details.toUpperCase();
      const ha=String(o?.homeTeamOdds?.team?.abbreviation||"").toUpperCase();
      const aa=String(o?.awayTeamOdds?.team?.abbreviation||"").toUpperCase();
      if(ha&&d.startsWith(ha+" "))homeFav=true;
      else if(aa&&d.startsWith(aa+" "))awayFav=true;
    }
    if(homeFav||awayFav){
      const fav=spreadToProb(spread);
      if(fav){
        const homePct=(homeFav?fav:1-fav)*100;
        const awayPct=100-homePct;
        return {homePct,awayPct,books:1,source:"ESPN spread estimate"};
      }
    }
  }
  return null;
}

function americanMoneylineToProb(ml){
  const n=Number(ml);
  if(!Number.isFinite(n)||n===0)return null;
  return n<0?(-n)/((-n)+100):100/(n+100);
}
function normalizeTwoWay(a,b){
  if(!(a>0&&b>0))return null;
  const t=a+b;
  return {awayPct:(a/t)*100,homePct:(b/t)*100};
}
async function fetchESPNGameMarket(g,sport){
  const eventId=String(g?.eventId||"").trim();
  if(!eventId)return null;
  const league=sport==="nfl"?"nfl":"college-football";

  // If the scoreboard itself still carries the line, use it first.
  try{
    const fromScoreboard=marketFromOddsObject(g?.scoreboardOdds);
    if(fromScoreboard)return fromScoreboard;
  }catch(e){}

  // ESPN core odds collection.
  try{
    const u=`https://sports.core.api.espn.com/v2/sports/football/leagues/${league}/events/${encodeURIComponent(eventId)}/competitions/${encodeURIComponent(eventId)}/odds?limit=50`;
    const r=await fetch(u);
    if(r.ok){
      const j=await r.json(), vals=[];
      for(const o of (j.items||[])){
        const m=marketFromOddsObject(o);
        if(m){
          vals.push(m);
        }
      }
      if(vals.length){
        return {
          awayPct:vals.reduce((s,x)=>s+x.awayPct,0)/vals.length,
          homePct:vals.reduce((s,x)=>s+x.homePct,0)/vals.length,
          books:vals.length,
          source:vals.some(x=>/spread estimate/i.test(x.source))?"ESPN spread estimate":"ESPN sportsbook odds"
        };
      }
    }
  }catch(e){}

  // ESPN game summary often preserves pickcenter odds after the scoreboard
  // or core odds endpoint stops returning them.
  try{
    const u=`https://site.api.espn.com/apis/site/v2/sports/football/${league}/summary?event=${encodeURIComponent(eventId)}`;
    const r=await fetch(u);
    if(r.ok){
      const j=await r.json();

      const pcs=Array.isArray(j?.pickcenter)?j.pickcenter:[];
      const vals=[];
      for(const o of pcs){
        const m=marketFromOddsObject(o);
        if(m)vals.push(m);
      }
      if(vals.length){
        return {
          awayPct:vals.reduce((s,x)=>s+x.awayPct,0)/vals.length,
          homePct:vals.reduce((s,x)=>s+x.homePct,0)/vals.length,
          books:vals.length,
          source:vals.some(x=>/spread estimate/i.test(x.source))?"ESPN spread estimate":"ESPN sportsbook odds"
        };
      }

      const po=j?.predictor;
      const hp=Number(po?.homeTeam?.gameProjection ?? po?.homeTeam?.gameProjectionPercentage ?? po?.homeTeam?.winPercentage);
      const ap=Number(po?.awayTeam?.gameProjection ?? po?.awayTeam?.gameProjectionPercentage ?? po?.awayTeam?.winPercentage);
      if(Number.isFinite(hp)&&Number.isFinite(ap)){
        const h=hp>1?hp/100:hp,a=ap>1?ap/100:ap;
        const n=normalizeTwoWay(a,h);
        if(n)return {awayPct:n.awayPct,homePct:n.homePct,books:0,source:"ESPN game prediction"};
      }
    }
  }catch(e){}

  // ESPN predictor endpoint.
  try{
    const u=`https://sports.core.api.espn.com/v2/sports/football/leagues/${league}/events/${encodeURIComponent(eventId)}/competitions/${encodeURIComponent(eventId)}/predictor`;
    const r=await fetch(u);
    if(r.ok){
      const j=await r.json();
      const hp=Number(j?.homeTeam?.gameProjection ?? j?.homeTeam?.gameProjectionPercentage ?? j?.homeTeam?.winPercentage);
      const ap=Number(j?.awayTeam?.gameProjection ?? j?.awayTeam?.gameProjectionPercentage ?? j?.awayTeam?.winPercentage);
      if(Number.isFinite(hp)&&Number.isFinite(ap)){
        const h=hp>1?hp/100:hp,a=ap>1?ap/100:ap;
        const n=normalizeTwoWay(a,h);
        if(n)return {awayPct:n.awayPct,homePct:n.homePct,books:0,source:"ESPN game prediction"};
      }
    }
  }catch(e){}

  return null;
}


async function selectedWeekMarketFeed(sport,w){
  try{
    return sport==="nfl"?await fetchNFLWeek(w):await fetchCollegeWeek(w);
  }catch(e){
    return [];
  }
}
function matchingWeekGame(feed,g){
  if(!Array.isArray(feed)||!g)return null;
  if(g.eventId){
    const byId=feed.find(x=>String(x.eventId||"")===String(g.eventId));
    if(byId)return byId;
  }
  return feed.find(x=>
    (x.away===g.away&&x.home===g.home)||
    (x.away===g.home&&x.home===g.away)
  )||null;
}

function validMarketPair(m){
  const a=Number(m?.awayPct),h=Number(m?.homePct);
  return Number.isFinite(a)&&Number.isFinite(h)&&a>0&&h>0&&a<100&&h<100&&Math.abs((a+h)-100)<2;
}
async function attachMarketOdds(DB,env,pid,sport,w,games){
  games=Array.isArray(games)?games:[];

  // syncWeek already enriched these games from the selected ESPN week, so avoid
  // downloading the same scoreboard a second time here.
  let externalFeed=[];
  try{externalFeed=await fetchOddsFeed(DB,env,sport)}catch(e){externalFeed=[]}

  // ESPN market/predictor calls are independent. Run them together instead of
  // waiting for game 1 before requesting game 2, game 3, etc.
  const marketResults=await Promise.all(games.map(async(g)=>{
    try{return await fetchESPNGameMarket(g,sport)}catch(e){return null}
  }));

  const out=[];
  const writes=[];
  for(let i=0;i<games.length;i++){
    const g={...games[i]};
    let market=marketResults[i];

    if(!market&&externalFeed.length){
      const ev=findOddsEvent(externalFeed,g,sport);
      if(ev){
        const c=consensusForEvent(ev);
        if(c){
          const direct=teamNameMatches(ev.away_team,gameTeamName(g,"away",sport));
          const awayProb=direct?c.awayProb:c.homeProb,homeProb=direct?c.homeProb:c.awayProb;
          market={awayPct:awayProb*100,homePct:homeProb*100,books:c.books,source:"Sportsbook consensus"};
        }
      }
    }

    if(market&&!validMarketPair(market))market=null;
    if(market){
      writes.push(DB.prepare("INSERT INTO pool_market_odds(pool_id,sport,week,game_index,away_prob,home_prob,books,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(pool_id,sport,week,game_index) DO UPDATE SET away_prob=excluded.away_prob,home_prob=excluded.home_prob,books=excluded.books,updated_at=excluded.updated_at")
        .bind(pid,sport,w,i,market.awayPct/100,market.homePct/100,market.books||0,new Date().toISOString()));
      g.market=market;
    }
    out.push(g);
  }

  if(writes.length){try{await DB.batch(writes)}catch(e){}}

  // Fill misses from saved values in one query instead of one query per game.
  const saved=(await DB.prepare("SELECT game_index,away_prob,home_prob,books FROM pool_market_odds WHERE pool_id=? AND sport=? AND week=?")
    .bind(pid,sport,w).all()).results||[];
  const savedByIndex=new Map(saved.map(x=>[Number(x.game_index),x]));
  for(let i=0;i<out.length;i++){
    if(out[i].market)continue;
    const old=savedByIndex.get(i);
    if(old&&old.away_prob!=null&&old.home_prob!=null){
      const savedMarket={awayPct:Number(old.away_prob)*100,homePct:Number(old.home_prob)*100,books:Number(old.books||0),source:"Saved ESPN market estimate"};
      if(validMarketPair(savedMarket))out[i].market=savedMarket;
    }
  }
  return out;
}

function squareConfigured(env){return !!(env.SQUARE_ACCESS_TOKEN&&env.SQUARE_LOCATION_ID)}
function safeReturnUrl(request){const u=new URL(request.url);return `${u.origin}/`}
async function squareCreateCheckout(env,{amountCents,note,redirectUrl,idempotencyKey}){
  const r=await fetch("https://connect.squareup.com/v2/online-checkout/payment-links",{
    method:"POST",
    headers:{
      "Authorization":`Bearer ${env.SQUARE_ACCESS_TOKEN}`,
      "Content-Type":"application/json",
      "Square-Version":"2026-08-19"
    },
    body:JSON.stringify({
      idempotency_key:idempotencyKey,
      quick_pay:{name:note,price_money:{amount:amountCents,currency:"USD"},location_id:env.SQUARE_LOCATION_ID},
      checkout_options:{redirect_url:redirectUrl},
      payment_note:note
    })
  });
  const d=await r.json();
  if(!r.ok||!d.payment_link?.url)throw new Error(d.errors?.[0]?.detail||"Unable to create Square checkout.");
  return d;
}
async function squareOrderPaid(env,orderId){
  if(!squareConfigured(env)||!orderId)return false;
  const r=await fetch(`https://connect.squareup.com/v2/orders/${encodeURIComponent(orderId)}`,{
    headers:{"Authorization":`Bearer ${env.SQUARE_ACCESS_TOKEN}`,"Square-Version":"2026-08-19","Content-Type":"application/json"}
  });
  if(!r.ok)return false;
  const d=await r.json();
  return d.order?.state==="COMPLETED";
}
async function getFee(DB,pid){const r=await DB.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='fee'").bind(pid).first();return Number(r?.value||11)}
async function getPoolSetting(DB,pid,key,def=""){const r=await DB.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key=?").bind(pid,key).first();return r?.value==null?def:String(r.value)}
async function getPotContribution(DB,pid){const fee=await getFee(DB,pid);const raw=await getPoolSetting(DB,pid,"pot_contribution",String(fee));const n=Number(raw);return Number.isFinite(n)&&n>=0?n:fee}
async function getCommissionerEmail(DB,pid){return (await getPoolSetting(DB,pid,"commissioner_email","")).trim()}
const VALID_POOL_GAMES=["nfl","college","march","33","squares","survivor","confidence","props","playoff","masters","nascar","fantasy","dynasty"];
async function game33PlayerLimitCheck(DB,pid,adding=0){
  const games=await getPoolGameTypes(DB,pid);
  if(!games.includes("33"))return;
  const r=await DB.prepare("SELECT COUNT(*) AS n FROM pool_players WHERE pool_id=?").bind(pid).first();
  if(Number(r?.n||0)+Number(adding||0)>32)throw new Error("Game 33 allows a maximum of 32 players because there are only 32 NFL teams.");
}
async function getCommissionerPlayerName(DB,pid){
  const direct=String(await getPoolSetting(DB,pid,"commissioner_player_name","")||"").trim();
  if(direct)return direct;
  try{
    const email=String(await getCommissionerEmail(DB,pid)||"").trim().toLowerCase();
    if(email){
      const r=await DB.prepare("SELECT player_name FROM pool_player_setup_invites WHERE pool_id=? AND lower(email)=? AND status='USED' ORDER BY used_at DESC,created_at DESC LIMIT 1").bind(pid,email).first();
      if(r?.player_name)return String(r.player_name);
    }
  }catch(e){}
  return "";
}
function sessionCanPlay(s){return !!s&&(s.role==="player"||(s.role==="admin"&&s.player_name&&s.player_name!=="Commissioner"));}

async function getPoolGameTypes(DB,pid,code=""){
  // v111: active_games_exact is authoritative whenever it exists.  Older builds
  // could leave stale pool_active_games rows active; reconcile those flags to the
  // exact commissioner-selected list without deleting any game history or picks.
  const exactRaw=(await getPoolSetting(DB,pid,"active_games_exact","")).trim();
  if(exactRaw){
    try{
      let exact=JSON.parse(exactRaw);
      exact=Array.isArray(exact)?[...new Set(exact.map(x=>String(x||"").trim().toLowerCase()).filter(x=>VALID_POOL_GAMES.includes(x)))]:[];
      if(exact.length){
        const now=new Date().toISOString();
        const stm=[DB.prepare("UPDATE pool_active_games SET active=0,is_primary=0 WHERE pool_id=?").bind(pid)];
        exact.forEach((gt,i)=>stm.push(DB.prepare("INSERT INTO pool_active_games(pool_id,game_type,is_primary,active,added_at) VALUES(?,?,?,1,?) ON CONFLICT(pool_id,game_type) DO UPDATE SET active=1,is_primary=excluded.is_primary").bind(pid,gt,i===0?1:0,now)));
        await DB.batch(stm);
        return exact;
      }
    }catch(e){}
  }

  // Pools created before exact-list support continue to use their currently active
  // rows.  Nothing is deleted; this is only a compatibility path for old pools.
  const rows=(await DB.prepare("SELECT game_type,is_primary,added_at FROM pool_active_games WHERE pool_id=? AND active=1 ORDER BY is_primary DESC,added_at ASC").bind(pid).all()).results||[];
  const games=[...new Set(rows.map(r=>String(r.game_type||"").toLowerCase()).filter(x=>VALID_POOL_GAMES.includes(x)))];
  if(games.length)return games;

  let legacy=(await getPoolSetting(DB,pid,"game_type","")).trim().toLowerCase();
  if(!VALID_POOL_GAMES.includes(legacy))legacy="nfl";
  await DB.prepare("INSERT INTO pool_active_games(pool_id,game_type,is_primary,active,added_at) VALUES(?,?,1,1,?) ON CONFLICT(pool_id,game_type) DO UPDATE SET active=1,is_primary=1")
    .bind(pid,legacy,new Date().toISOString()).run();
  await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'active_games_exact',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,JSON.stringify([legacy])).run();
  return [legacy];
}
async function getPoolGameType(DB,pid,code=""){
  const games=await getPoolGameTypes(DB,pid,code);
  return games[0]||"nfl";
}
async function addPoolGame(DB,pid,gameType){
  const gt=String(gameType||"").trim().toLowerCase();
  if(!VALID_POOL_GAMES.includes(gt))throw new Error("Invalid game type.");
  if(gt==="33"){
    const r=await DB.prepare("SELECT COUNT(*) AS n FROM pool_players WHERE pool_id=?").bind(pid).first();
    if(Number(r?.n||0)>32)throw new Error("Game 33 cannot be added to a pool with more than 32 players because there are only 32 NFL teams.");
  }
  const current=await getPoolGameTypes(DB,pid);
  const isPrimary=current.length?0:1;
  await DB.prepare("INSERT INTO pool_active_games(pool_id,game_type,is_primary,active,added_at) VALUES(?,?,?,1,?) ON CONFLICT(pool_id,game_type) DO UPDATE SET active=1")
    .bind(pid,gt,isPrimary,new Date().toISOString()).run();
  const exact=[...new Set([...current,gt])];
  await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'active_games_exact',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,JSON.stringify(exact)).run();
  if(current.length===0){
    await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'game_type',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,gt).run();
  }
  return getPoolGameTypes(DB,pid);
}
async function getPaymentSettings(DB,pid){
  const rows=(await DB.prepare("SELECT key,value FROM pool_settings WHERE pool_id=? AND key IN ('paypal','venmo','cashapp','payment_note')").bind(pid).all()).results||[];
  const m=Object.fromEntries(rows.map(x=>[x.key,x.value||""]));
  return {paypal:m.paypal||"",venmo:m.venmo||"",cashapp:m.cashapp||"",note:m.payment_note||""};
}
async function locked(DB,pid,sport,w){const r=await DB.prepare("SELECT lock_time FROM pool_week_meta WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).first();return !!(r?.lock_time&&Date.parse(r.lock_time)<=Date.now())}

function findEventsDeep(j){
  const seen=new Set();let best=[];
  function walk(x,d=0){
    if(!x||typeof x!=="object"||d>10||seen.has(x))return;seen.add(x);
    if(Array.isArray(x)){
      if(x.length&&x.some(v=>v&&typeof v==="object"&&(v.competitions||v.status||v.date)&&("id" in v))){if(x.length>best.length)best=x}
      for(const v of x)walk(v,d+1);return;
    }
    if(Array.isArray(x.events)&&x.events.length>best.length)best=x.events;
    for(const k of Object.keys(x))walk(x[k],d+1);
  }
  walk(j);return best;
}
async function getJSON(u){
  try{
    const r=await fetch(u,{headers:{"accept":"application/json,text/plain,*/*","cache-control":"no-cache,no-store,max-age=0","pragma":"no-cache","user-agent":"Mozilla/5.0"},cf:{cacheTtl:0,cacheEverything:false}});
    if(!r.ok)return null;return await r.json();
  }catch(e){return null}
}

function uniqPeople(rows){
  const out=[],seen=new Set();
  for(const r of rows||[]){
    const id=String(r?.id||r?.athlete?.id||r?.competitor?.id||"").trim();
    const name=String(r?.displayName||r?.fullName||r?.name||r?.athlete?.displayName||r?.athlete?.fullName||r?.athlete?.name||r?.competitor?.displayName||"").trim();
    if(!name)continue;const key=id||name.toLowerCase();if(seen.has(key))continue;seen.add(key);out.push({id:id||name,name});
  }
  return out.sort((a,b)=>a.name.localeCompare(b.name));
}
function collectAthletesDeep(obj){
  const rows=[],seen=new Set();
  function walk(x,d=0){
    if(!x||typeof x!=="object"||d>9||seen.has(x))return;seen.add(x);
    if(Array.isArray(x)){for(const v of x)walk(v,d+1);return}
    if(x.athlete&&typeof x.athlete==="object")rows.push(x.athlete);
    if((x.displayName||x.fullName)&&x.id&&(x.type==="athlete"||x.uid||x.guid))rows.push(x);
    for(const v of Object.values(x))walk(v,d+1);
  }
  walk(obj);return uniqPeople(rows);
}
async function fetchNascarPoolEvents(year){
  const y=Math.max(2024,Math.min(2100,Number(year)||new Date().getUTCFullYear()));
  const urls=[
    `https://site.api.espn.com/apis/site/v2/sports/racing/nascar-premier/scoreboard?dates=${y}&limit=100&_=${Date.now()}`,
    `https://site.api.espn.com/apis/site/v2/sports/racing/nascar-premier/scoreboard?limit=100&_=${Date.now()}`
  ];
  for(const u of urls){
    const j=await getJSON(u),evs=Array.isArray(j?.events)?j.events:[];
    if(evs.length){return evs.map(e=>{
      const c=e?.competitions?.[0]||{},drivers=uniqPeople((c.competitors||[]).map(x=>x.athlete||x.competitor||x));
      return {id:String(e.id||""),name:String(e.name||e.shortName||c.name||"NASCAR Race"),date:String(e.date||c.date||""),status:String(e.status?.type?.description||e.status?.type?.detail||""),drivers};
    }).filter(e=>e.id).sort((a,b)=>Date.parse(a.date||0)-Date.parse(b.date||0));}
  }
  return [];
}
async function fetchMastersPoolData(year){
  const y=Math.max(2024,Math.min(2100,Number(year)||new Date().getUTCFullYear()));
  const j=await getJSON(`https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates=${y}0401-${y}0430&limit=100&_=${Date.now()}`);
  const evs=Array.isArray(j?.events)?j.events:[];
  let e=evs.find(x=>/masters/i.test(String(x?.name||x?.shortName||"")))||evs.find(x=>/augusta/i.test(JSON.stringify(x||{})))||null;
  if(!e)return {year:y,event:null,golfers:[]};
  const id=String(e.id||"");
  let golfers=uniqPeople((e?.competitions?.[0]?.competitors||[]).map(x=>x.athlete||x.competitor||x));
  if(golfers.length<20&&id){
    const lb=await getJSON(`https://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard?tournamentId=${encodeURIComponent(id)}&_=${Date.now()}`);
    const more=collectAthletesDeep(lb);if(more.length)golfers=more;
  }
  return {year:y,event:{id,name:String(e.name||e.shortName||"Masters Tournament"),date:String(e.date||e?.competitions?.[0]?.date||"")},golfers};
}
function parseEvents(all,kind){
  return all.slice().sort((a,b)=>Date.parse(a.date)-Date.parse(b.date)).map(e=>{
    const c=e.competitions?.[0]||{},comps=c.competitors||[];
    const away=comps.find(x=>x.homeAway==="away"),home=comps.find(x=>x.homeAway==="home");
    const ab=x=>String(x?.team?.abbreviation||x?.team?.shortDisplayName||"").toUpperCase();
    const at=kind==="nfl"?normTeam(ab(away)):ab(away),ht=kind==="nfl"?normTeam(ab(home)):ab(home);
    const st=e.status||c.status||{},type=st.type||{},completed=!!(type.completed||st.completed);
    const winComp=comps.find(x=>x.winner),winner=completed?(kind==="nfl"?normTeam(ab(winComp)):ab(winComp)):null;
    function scoreOf(x){if(!x)return null;if(x.score!==undefined&&x.score!==null&&x.score!=="")return Number(x.score);return null}
    const rec={};for(const x of comps){
      // ESPN does not always label the overall record as type="total".
      // Prefer the record whose name/type identifies "overall", then total,
      // then any record with a summary so one team's record does not disappear.
      const rs=Array.isArray(x.records)?x.records:[];
      const rr=rs.find(y=>String(y?.name||"").toLowerCase()==="overall")
        ||rs.find(y=>String(y?.type||"").toLowerCase()==="total")
        ||rs.find(y=>String(y?.type||"").toLowerCase()==="overall")
        ||rs.find(y=>y?.summary);
      if(rr?.summary){
        const raw=ab(x),key=kind==="nfl"?normTeam(raw):raw;
        rec[key]=rr.summary;
        // ESPN has used both WSH and WAS for Washington. Keep both aliases in
        // the event record map so the card lookup cannot lose the record.
        if(kind==="nfl"&&(raw==="WSH"||raw==="WAS")){rec.WAS=rr.summary;rec.WSH=rr.summary;}
      }
    }
    return {
      eventId:String(e.id||""),away:at,home:ht,
      awayName:away?.team?.displayName||away?.team?.shortDisplayName||at,
      homeName:home?.team?.displayName||home?.team?.shortDisplayName||ht,
      awayId:String(away?.team?.id||""),homeId:String(home?.team?.id||""),
      awayRank:Number(away?.curatedRank?.current||away?.rank||0)||null,
      homeRank:Number(home?.curatedRank?.current||home?.rank||0)||null,
      kickoff:e.date||c.date||null,status:type.shortDetail||type.detail||type.description||"",
      completed,winner,awayScore:scoreOf(away),homeScore:scoreOf(home),records:rec,
      scoreboardOdds:(Array.isArray(c.odds)&&c.odds.length)?c.odds[0]:null,
      period:Number(st.period||0),clock:st.displayClock||"",state:type.state||""
    };
  }).filter(x=>x.away&&x.home);
}
async function fetchNFLStandingsRecords(){
  // Fallback for the occasional ESPN scoreboard event that omits one team's
  // record (for example Washington). One standings request fills only missing
  // NFL records; normal scoreboard data remains authoritative.
  const season=currentFootballSeason();
  const j=await getJSON(`https://site.api.espn.com/apis/v2/sports/football/nfl/standings?season=${season}&type=0&level=2&_=${Date.now()}`);
  const out={};
  function walk(x){
    if(!x||typeof x!=="object")return;
    if(Array.isArray(x)){for(const v of x)walk(v);return;}
    const team=x.team;
    const stats=Array.isArray(x.stats)?x.stats:null;
    if(team&&stats){
      const code=normTeam(String(team.abbreviation||team.shortDisplayName||"").toUpperCase());
      const get=n=>stats.find(st=>String(st.name||st.abbreviation||"").toLowerCase()===n);
      const wins=Number(get("wins")?.value??get("w")?.value);
      const losses=Number(get("losses")?.value??get("l")?.value);
      const ties=Number(get("ties")?.value??get("t")?.value);
      if(code&&Number.isFinite(wins)&&Number.isFinite(losses)){
        out[code]=ties>0?`${wins}-${losses}-${ties}`:`${wins}-${losses}`;
      }
    }
    for(const v of Object.values(x))walk(v);
  }
  walk(j);
  return out;
}

async function fetchNFLWeek(w){
  const post=w>18,apiWeek=post?(POST_MAP[w]||1):w,seasonType=post?3:2,bust=Date.now();
  const season=currentFootballSeason();
  let all=[];
  const urls=[
    `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${season}&seasontype=${seasonType}&week=${apiWeek}&limit=100&_=${bust}`,
    `https://cdn.espn.com/core/nfl/scoreboard?xhr=1&dates=${season}&seasontype=${seasonType}&week=${apiWeek}&_=${bust}`
  ];
  // 2026 date windows stay as a last-resort compatibility fallback only.
  if(season===2026&&!post&&REG_WEEK_DATES[w]){const [a,b]=REG_WEEK_DATES[w];urls.push(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${a}-${b}&limit=100&_=${bust}`)}
  for(const u of urls){const j=await getJSON(u);if(j){all=findEventsDeep(j);if(all.length)break}}
  const games=parseEvents(all,"nfl");

  // v570: ESPN occasionally omits a team's record on an upcoming-game
  // competitor (Washington in 2026 Week 3). Fill only missing records from
  // the previous week's final scoreboard. This is one league-wide request,
  // not per-game fanout, and preserves ESPN's cumulative W-L summary.
  const missing=new Set();
  for(const g of games){
    if(g.away&&!g.records?.[g.away])missing.add(g.away);
    if(g.home&&!g.records?.[g.home])missing.add(g.home);
  }
  if(missing.size&&w>1&&!post){
    const prev=w-1,range=REG_WEEK_DATES[prev];
    const prevUrl=range
      ? `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${range[0]}-${range[1]}&limit=100&_=${bust}`
      : `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${season}&seasontype=2&week=${prev}&limit=100&_=${bust}`;
    const pj=await getJSON(prevUrl);
    if(pj){
      const prior=parseEvents(findEventsDeep(pj),"nfl");
      const fallback={};
      for(const pg of prior){
        for(const code of [pg.away,pg.home]){
          const summary=pg.records?.[code];
          if(summary)fallback[code]=summary;
        }
      }
      for(const g of games){
        for(const code of [g.away,g.home]){
          if(code&&!g.records?.[code]&&fallback[code])g.records[code]=fallback[code];
        }
      }
    }
  }
  return games;
}
async function refreshNFLGameDetail(g){
  if(!g?.eventId)return g;
  try{
    const j=await getJSON(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${encodeURIComponent(g.eventId)}&_=${Date.now()}`);
    const comp=j?.header?.competitions?.[0]||j?.gamepackageJSON?.header?.competitions?.[0]||null;
    if(!comp)return g;
    const pseudo={id:g.eventId,date:comp.date||g.kickoff,competitions:[comp],status:comp.status||j?.header?.status||{}};
    const x=parseEvents([pseudo],"nfl")[0];
    return x?{...g,...x,gameIndex:g.gameIndex}:g;
  }catch(e){return g}
}
async function refreshNFLLiveGames(games){
  // v563 emergency stability mode: use the weekly ESPN scoreboard response only.
  // Per-game summary fan-out is disabled so normal page/API requests stay well
  // below Cloudflare Worker resource limits.
  return games||[];
}

async function fetchCollegeTop25(){
  const bust=Date.now();
  const urls=[
    `https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings?_=${bust}`,
    `https://cdn.espn.com/core/college-football/rankings?xhr=1&_=${bust}`
  ];
  for(const u of urls){
    const j=await getJSON(u);
    if(!j)continue;
    const polls=j.rankings||j.content?.rankings||j.sports?.[0]?.leagues?.[0]?.rankings||[];
    const poll=Array.isArray(polls)?polls.find(p=>/AP Top 25|Associated Press/i.test(p.name||p.shortName||""))||polls[0]:null;
    const ranks=poll?.ranks||poll?.rankings||poll?.teams||[];
    if(Array.isArray(ranks)&&ranks.length){
      const ids=new Set(),abbrs=new Set(),names=new Set();
      const rankById={},rankByAbbr={},rankByName={};
      for(let i=0;i<Math.min(25,ranks.length);i++){
        const r=ranks[i]||{},t=r.team||r;
        const rank=Number(r.current ?? r.rank ?? r.ranking ?? r.position ?? (i+1)) || (i+1);
        if(t?.id){const id=String(t.id);ids.add(id);rankById[id]=rank}
        if(t?.abbreviation){const a=String(t.abbreviation).toUpperCase();abbrs.add(a);rankByAbbr[a]=rank}
        if(t?.displayName){const n=String(t.displayName).toLowerCase();names.add(n);rankByName[n]=rank}
        if(t?.shortDisplayName){const n=String(t.shortDisplayName).toLowerCase();names.add(n);rankByName[n]=rank}
      }
      if(ids.size||abbrs.size||names.size)return {ids,abbrs,names,rankById,rankByAbbr,rankByName};
    }
  }
  return null;
}
function applyCollegeRanks(games,top){
  if(!top)return games;
  return games.map(g=>{
    const awayRank=Number(g.awayRank)||top.rankById?.[String(g.awayId||"")]||top.rankByAbbr?.[String(g.away||"").toUpperCase()]||top.rankByName?.[String(g.awayName||"").toLowerCase()]||null;
    const homeRank=Number(g.homeRank)||top.rankById?.[String(g.homeId||"")]||top.rankByAbbr?.[String(g.home||"").toUpperCase()]||top.rankByName?.[String(g.homeName||"").toLowerCase()]||null;
    return {...g,awayRank:Number(awayRank)||null,homeRank:Number(homeRank)||null};
  });
}

async function fetchCollegeWeek(w){
  const bust=Date.now(),season=currentFootballSeason();let all=[];
  const urls=[
    `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${season}&seasontype=2&week=${w}&groups=80&limit=300&_=${bust}`,
    `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${season}&seasontype=2&week=${w}&limit=300&_=${bust}`,
    `https://cdn.espn.com/core/college-football/scoreboard?xhr=1&dates=${season}&week=${w}&_=${bust}`
  ];
  for(const u of urls){const j=await getJSON(u);if(j){all=findEventsDeep(j);if(all.length)break}}
  return parseEvents(all,"college");
}


async function selectedCollegeGames(DB,pid,w){
  return (await DB.prepare("SELECT * FROM pool_games WHERE pool_id=? AND sport='college' AND week=? ORDER BY game_index").bind(pid,w).all()).results||[];
}
async function getGameList(DB,pid,sport,w){
  if(sport==="nfl"){
    const live=await fetchNFLWeek(w);
    // IMPORTANT: preserve the LINKS weekly slate order used when picks were saved.
    // ESPN can reorder its scoreboard response as games move from scheduled -> live -> final.
    // Re-indexing from ESPN order would attach old picks/results to the wrong matchup.
    const fixed=(w<=18?gamesNFL(w):[]);
    if(fixed.length){
      return fixed.map((pair,i)=>{
        const away=pair[0],home=pair[1];
        const ev=live.find(x=>(x.away===away&&x.home===home)||(x.away===home&&x.home===away));
        return ev?{...ev,gameIndex:i}:{gameIndex:i,away,home,awayName:TEAM_NAMES[away]||away,homeName:TEAM_NAMES[home]||home};
      });
    }
    if(live.length)return live.map((x,i)=>({...x,gameIndex:i}));
    return [];
  }
  return (await selectedCollegeGames(DB,pid,w)).map(x=>({gameIndex:x.game_index,eventId:x.event_id,away:x.away,home:x.home,awayName:x.away_name||x.away,homeName:x.home_name||x.home,awayId:x.away_id,homeId:x.home_id,kickoff:x.kickoff}));
}

// v190: Admin pages must render immediately and never wait on ESPN just to show
// the pick-lock card or correction controls. Regular-season NFL slates are
// already stored locally, so use those for Admin and let the normal live-score
// paths refresh ESPN independently.
async function getAdminGameListFast(DB,pid,sport,w){
  if(sport==="nfl"&&w<=18){
    return gamesNFL(w).map((pair,i)=>({gameIndex:i,away:pair[0],home:pair[1],awayName:TEAM_NAMES[pair[0]]||pair[0],homeName:TEAM_NAMES[pair[1]]||pair[1]}));
  }
  if(sport==="college"){
    return (await selectedCollegeGames(DB,pid,w)).map(x=>({gameIndex:x.game_index,eventId:x.event_id,away:x.away,home:x.home,awayName:x.away_name||x.away,homeName:x.home_name||x.home,awayId:x.away_id,homeId:x.home_id,kickoff:x.kickoff}));
  }
  // Playoffs do not have a fixed local slate yet. Keep the existing behavior there.
  return await getGameList(DB,pid,sport,w);
}
async function quickAutomaticKickoff(DB,pid,sport,w,games=null){
  const list=Array.isArray(games)?games:await getAdminGameListFast(DB,pid,sport,w);
  const kickoffs=list.map(x=>x?.kickoff).filter(Boolean).sort();
  if(kickoffs[0])return kickoffs[0];
  if(sport==="nfl"&&currentFootballSeason()===2026&&OFFICIAL_FIRST_KICKOFF_FALLBACK[w])return OFFICIAL_FIRST_KICKOFF_FALLBACK[w];
  const meta=await DB.prepare("SELECT lock_time FROM pool_week_meta WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).first();
  return meta?.lock_time||null;
}

async function fastBootstrapWeek(DB,pid,sport,w){
  if(sport==="nfl"&&w<=18){
    // v194: one D1 batch instead of three sequential reads for the regular-season slate cache.
    const fastRows=await DB.batch([
      DB.prepare("SELECT lock_time FROM pool_week_meta WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w),
      DB.prepare("SELECT game_index,winner,away_score,home_score,status FROM pool_final_snapshots WHERE pool_id=? AND sport=? AND week=? ORDER BY game_index").bind(pid,sport,w),
      DB.prepare("SELECT game_index,winner FROM pool_results WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w)
    ]);
    const meta=fastRows[0]?.results?.[0]||{};
    const snaps=fastRows[1]?.results||[];
    const results=fastRows[2]?.results||[];
    const snapBy=new Map(snaps.map(r=>[Number(r.game_index),r]));
    const resultBy=new Map(results.map(r=>[Number(r.game_index),r.winner]));
    const liveGames=gamesNFL(w).map((pair,i)=>{
      const r=snapBy.get(i),winner=r?.winner||resultBy.get(i)||null,completed=!!winner;
      return {gameIndex:i,away:pair[0],home:pair[1],awayName:TEAM_NAMES[pair[0]]||pair[0],homeName:TEAM_NAMES[pair[1]]||pair[1],completed,winner,status:completed?"FINAL":"",state:completed?"post":"pre",clock:"",awayScore:r?.away_score==null?null:Number(r.away_score),homeScore:r?.home_score==null?null:Number(r.home_score)};
    });
    // v571: the fast bootstrap used to return an empty records object, so the
    // Picks renderer never received ESPN records even when syncWeek had them.
    // Load the single weekly feed here and return its team record map.
    const records={};
    try{
      const feed=await fetchNFLWeek(w);
      for(const g of feed)Object.assign(records,g.records||{});
      const needed=new Set();
      for(const pair of gamesNFL(w)){if(!records[pair[0]])needed.add(pair[0]);if(!records[pair[1]])needed.add(pair[1]);}
      if(needed.size){
        const fallback=await fetchNFLStandingsRecords();
        for(const t of needed)if(fallback[t])records[t]=fallback[t];
      }
    }catch(e){}
    return {liveGames,records,sourceKickoff:meta.lock_time||OFFICIAL_FIRST_KICKOFF_FALLBACK[w]||null,source:"LINKS FAST CACHE"};
  }
  if(sport==="college"){
    const base=(await selectedCollegeGames(DB,pid,w)).map(x=>({gameIndex:x.game_index,eventId:x.event_id,away:x.away,home:x.home,awayName:x.away_name||x.away,homeName:x.home_name||x.home,kickoff:x.kickoff}));
    const snaps=(await DB.prepare("SELECT game_index,winner,away_score,home_score,status FROM pool_final_snapshots WHERE pool_id=? AND sport=? AND week=? ORDER BY game_index").bind(pid,sport,w).all()).results||[];
    const snapBy=new Map(snaps.map(r=>[Number(r.game_index),r]));
    const liveGames=base.map(g=>{const r=snapBy.get(Number(g.gameIndex)),winner=r?.winner||null,completed=!!winner;return {...g,completed,winner,status:completed?"FINAL":"",state:completed?"post":"pre",clock:"",awayScore:r?.away_score==null?null:Number(r.away_score),homeScore:r?.home_score==null?null:Number(r.home_score)}});
    const sourceKickoff=base.map(x=>x.kickoff).filter(Boolean).sort()[0]||null;
    return {liveGames,records:{},sourceKickoff,source:"LINKS FAST CACHE"};
  }
  return await syncWeek(DB,pid,sport,w);
}

async function finalizedWeekCache(DB,pid,sport,w){
  const meta=await DB.prepare("SELECT finalized_winner,actual_tie FROM pool_week_meta WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).first();
  if(!String(meta?.finalized_winner||"").trim())return null;
  let base=[];
  if(sport==="nfl"&&w<=18){
    base=gamesNFL(w).map((pair,i)=>({gameIndex:i,away:pair[0],home:pair[1],awayName:TEAM_NAMES[pair[0]]||pair[0],homeName:TEAM_NAMES[pair[1]]||pair[1]}));
  }else if(sport==="college"){
    base=(await selectedCollegeGames(DB,pid,w)).map(x=>({gameIndex:x.game_index,eventId:x.event_id,away:x.away,home:x.home,awayName:x.away_name||x.away,homeName:x.home_name||x.home,kickoff:x.kickoff}));
  }
  if(!base.length)return null;
  const rows=(await DB.prepare("SELECT game_index,winner,away_score,home_score,status FROM pool_final_snapshots WHERE pool_id=? AND sport=? AND week=? ORDER BY game_index").bind(pid,sport,w).all()).results||[];
  if(rows.length<base.length)return null;
  const by=new Map(rows.map(r=>[Number(r.game_index),r]));
  const liveGames=base.map((b,i)=>{const r=by.get(i);return {...b,completed:true,winner:r?.winner||null,status:"FINAL",state:"post",clock:"",awayScore:r?.away_score==null?null:Number(r.away_score),homeScore:r?.home_score==null?null:Number(r.home_score)}});
  if(liveGames.some(g=>!g.winner))return null;
  return {liveGames,records:{},sourceKickoff:null,source:"LINKS FINAL CACHE",cachedFinal:true};
}

async function syncWeek(DB,pid,sport,w){
  const cached=await finalizedWeekCache(DB,pid,sport,w);if(cached)return cached;
  const base=await getGameList(DB,pid,sport,w);let feed=[];
  try{feed=sport==="nfl"?await fetchNFLWeek(w):await fetchCollegeWeek(w)}catch(e){feed=[]}
  const liveGames=[];
  // FINAL is sticky. ESPN occasionally returns a transient in-progress status for
  // games that are already over. Keep our last confirmed final snapshot so a
  // finished game can never flip back to LIVE/4th on the site.
  const snapRows=(await DB.prepare("SELECT game_index,winner,away_score,home_score,status FROM pool_final_snapshots WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).all()).results||[];
  const snaps=new Map(snapRows.map(x=>[Number(x.game_index),x]));
  for(let i=0;i<base.length;i++){
    const b=base[i];
    let ev=null;
    if(sport==="college"&&b.eventId)ev=feed.find(x=>x.eventId===String(b.eventId));
    if(!ev)ev=feed.find(x=>(x.away===b.away&&x.home===b.home)||(x.away===b.home&&x.home===b.away));
    let g=ev?{...b,...ev,gameIndex:i}:{...b,gameIndex:i,completed:false,winner:null,status:"",awayScore:null,homeScore:null};
    const snap=snaps.get(i);
    if(snap){
      g={...g,completed:true,winner:snap.winner,status:"FINAL",state:"post",clock:"",
        awayScore:snap.away_score==null?g.awayScore:Number(snap.away_score),
        homeScore:snap.home_score==null?g.homeScore:Number(snap.home_score)};
    }
    liveGames.push(g);
    if(g.completed&&g.winner){
      await DB.prepare("INSERT INTO pool_results(pool_id,sport,week,game_index,winner) VALUES(?,?,?,?,?) ON CONFLICT(pool_id,sport,week,game_index) DO UPDATE SET winner=excluded.winner").bind(pid,sport,w,i,g.winner).run();
      await DB.prepare("INSERT INTO pool_final_snapshots(pool_id,sport,week,game_index,winner,away_score,home_score,status) VALUES(?,?,?,?,?,?,?,'FINAL') ON CONFLICT(pool_id,sport,week,game_index) DO UPDATE SET winner=excluded.winner,away_score=COALESCE(excluded.away_score,pool_final_snapshots.away_score),home_score=COALESCE(excluded.home_score,pool_final_snapshots.home_score),status='FINAL'").bind(pid,sport,w,i,g.winner,g.awayScore,g.homeScore).run();
    }
  }
  if(sport==="nfl"){
    const refreshed=await refreshNFLLiveGames(liveGames);
    liveGames.splice(0,liveGames.length,...refreshed);
    // Re-apply confirmed FINAL snapshots after the detail refresh. A provider
    // status glitch must never reopen a game that LINKS has already finalized.
    for(let j=0;j<liveGames.length;j++){
      let g=liveGames[j],snap=snaps.get(Number(g.gameIndex));
      if(snap)g=liveGames[j]={...g,completed:true,winner:snap.winner,status:"FINAL",state:"post",clock:"",awayScore:snap.away_score==null?g.awayScore:Number(snap.away_score),homeScore:snap.home_score==null?g.homeScore:Number(snap.home_score)};
      if(g.completed&&g.winner){
        await DB.prepare("INSERT INTO pool_results(pool_id,sport,week,game_index,winner) VALUES(?,?,?,?,?) ON CONFLICT(pool_id,sport,week,game_index) DO UPDATE SET winner=excluded.winner").bind(pid,sport,w,g.gameIndex,g.winner).run();
        await DB.prepare("INSERT INTO pool_final_snapshots(pool_id,sport,week,game_index,winner,away_score,home_score,status) VALUES(?,?,?,?,?,?,?,'FINAL') ON CONFLICT(pool_id,sport,week,game_index) DO UPDATE SET winner=excluded.winner,away_score=COALESCE(excluded.away_score,pool_final_snapshots.away_score),home_score=COALESCE(excluded.home_score,pool_final_snapshots.home_score),status='FINAL'").bind(pid,sport,w,g.gameIndex,g.winner,g.awayScore,g.homeScore).run();
      }
    }
  }
  const kickoffs=liveGames.map(x=>x.kickoff).filter(Boolean).sort();
  let sourceKickoff=kickoffs[0]||(sport==="nfl"&&currentFootballSeason()===2026?OFFICIAL_FIRST_KICKOFF_FALLBACK[w]:null)||null;
  if(sourceKickoff){
    const overrideKey=`lock_override_${sport}_${w}`;
    const overrideRow=await DB.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key=?").bind(pid,overrideKey).first();
    const hasOverride=!!String(overrideRow?.value||"").trim();
    if(!hasOverride){
      await DB.prepare("INSERT INTO pool_week_meta(pool_id,sport,week,lock_time) VALUES(?,?,?,?) ON CONFLICT(pool_id,sport,week) DO UPDATE SET lock_time=excluded.lock_time").bind(pid,sport,w,sourceKickoff).run();
    }
  }
  const allComplete=liveGames.length>0&&liveGames.every(x=>x.completed&&x.winner);
  if(allComplete){
    const last=liveGames[liveGames.length-1];
    if(Number.isFinite(last.awayScore)&&Number.isFinite(last.homeScore)){
      const combined=Number(last.awayScore)+Number(last.homeScore);
      await DB.prepare("INSERT INTO pool_week_meta(pool_id,sport,week,actual_tie) VALUES(?,?,?,?) ON CONFLICT(pool_id,sport,week) DO UPDATE SET actual_tie=excluded.actual_tie").bind(pid,sport,w,combined).run();
      const d=await standings(DB,pid,sport,w),winner=d.rows[0]?.player||null;
      if(winner)await DB.prepare("UPDATE pool_week_meta SET finalized_winner=COALESCE(finalized_winner,?) WHERE pool_id=? AND sport=? AND week=?").bind(winner,pid,sport,w).run();
    }
  }
  const records={};for(const x of feed)Object.assign(records,x.records||{});
  if(sport==="nfl"){
    const needed=new Set();
    for(const g of base){if(g?.away&&!records[g.away])needed.add(g.away);if(g?.home&&!records[g.home])needed.add(g.home);}
    if(needed.size){
      try{
        const fallback=await fetchNFLStandingsRecords();
        for(const t of needed)if(fallback[t])records[t]=fallback[t];
      }catch(e){}
    }
  }
  return {liveGames,records,sourceKickoff,source:sport==="nfl"?"ESPN NFL":"ESPN College Football"};
}

async function standings(DB,pid,sport,w){
  // Load standings data in a small fixed number of queries. The previous version
  // ran two extra database queries for every player, which became noticeably slow
  // as a pool grew. This version batches all picks and tiebreakers at once.
  const [playerRes,resultRes,actual,paidRes,potContribution,pickRes,tieRes]=await Promise.all([
    DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid").bind(pid).all(),
    DB.prepare("SELECT game_index,winner FROM pool_results WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).all(),
    DB.prepare("SELECT actual_tie,finalized_winner,payout_paid FROM pool_week_meta WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).first(),
    DB.prepare("SELECT player_name,paid FROM pool_payments WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).all(),
    getPotContribution(DB,pid),
    DB.prepare("SELECT player_name,game_index,team FROM pool_picks WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).all(),
    DB.prepare("SELECT player_name,guess FROM pool_ties WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).all()
  ]);
  const players=(playerRes.results||[]).map(x=>x.name);
  const results=resultRes.results||[];
  const meta=actual||{};
  const paidRows=paidRes.results||[];
  const paid=new Map(paidRows.map(x=>[x.player_name,Number(x.paid)===1]));
  const pot=[...paid.values()].filter(Boolean).length*potContribution;
  const picksByPlayer=new Map();
  for(const r of (pickRes.results||[])){
    let m=picksByPlayer.get(r.player_name);
    if(!m){m=new Map();picksByPlayer.set(r.player_name,m)}
    m.set(Number(r.game_index),r.team);
  }
  const ties=new Map((tieRes.results||[]).map(r=>[r.player_name,r.guess]));
  const rows=players.map((p,idx)=>{
    const m=picksByPlayer.get(p)||new Map();
    const correct=results.reduce((n,r)=>n+(m.get(Number(r.game_index))===r.winner?1:0),0);
    const finalGames=results.length;
    const losses=Math.max(0,finalGames-correct);
    const guess=ties.get(p);
    const tiePick=guess==null?null:Number(guess);
    const diff=(meta.actual_tie!=null&&guess!=null)?Math.abs(Number(guess)-Number(meta.actual_tie)):null;
    return {player:p,correct,wins:correct,losses,finalGames,tiePick,tieDiff:diff,idx};
  });
  rows.sort((a,b)=>b.correct-a.correct||((a.tieDiff??99999)-(b.tieDiff??99999))||a.idx-b.idx);
  return {rows,pot,winner:meta.finalized_winner||null,finalizedWinner:meta.finalized_winner||null,actualTie:meta.actual_tie??null,payoutPaid:Number(meta.payout_paid||0)===1,paid:Object.fromEntries(paid)};
}


function shuffle33(arr){
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){
    const b=new Uint32Array(1);crypto.getRandomValues(b);
    const j=b[0]%(i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
async function game33PaidMap(DB,pid){
  const rows=(await DB.prepare("SELECT player_name,paid FROM pool_33_entries WHERE pool_id=?").bind(pid).all()).results||[];
  return Object.fromEntries(rows.map(r=>[r.player_name,Number(r.paid)===1]));
}
async function game33CarryCount(DB,pid,w){
  const rows=(await DB.prepare("SELECT week,finalized,winners_json FROM pool_33_week_meta WHERE pool_id=? AND week<? ORDER BY week").bind(pid,w).all()).results||[];
  let carry=0;
  for(const r of rows){
    if(Number(r.finalized)!==1)continue;
    let winners=[];try{winners=JSON.parse(r.winners_json||"[]")}catch(e){}
    if(Array.isArray(winners)&&winners.length)carry=0;
    else carry++;
  }
  return carry;
}
async function game33DefaultWeek(DB,pid){
  const rows=(await DB.prepare("SELECT week,finalized FROM pool_33_week_meta WHERE pool_id=? ORDER BY week").bind(pid).all()).results||[];
  const done=new Set(rows.filter(r=>Number(r.finalized)===1).map(r=>Number(r.week)));
  for(let w=1;w<=GAME33_WEEKS;w++)if(!done.has(w))return w;
  return GAME33_WEEKS;
}
async function game33AutoFinalizeV391(DB,pid,w){
  const existing=await DB.prepare("SELECT finalized FROM pool_33_week_meta WHERE pool_id=? AND week=?").bind(pid,w).first();if(Number(existing?.finalized||0)===1)return false;
  const assignments=(await DB.prepare("SELECT player_name,team FROM pool_33_assignments WHERE pool_id=? ORDER BY rowid").bind(pid).all()).results||[];if(!assignments.length)return false;
  let live=[];try{live=await fetchNFLWeek(w)}catch(e){return false}if(!live.length||live.some(g=>!g.completed))return false;
  const paid=await game33PaidMap(DB,pid),scores={};for(const g of live){scores[g.away]=Number(g.awayScore);scores[g.home]=Number(g.homeScore)}
  const winners=assignments.filter(a=>paid[a.player_name]&&scores[a.team]===33).map(a=>({player:a.player_name,team:a.team}));
  const players=(await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid").bind(pid).all()).results.map(x=>x.name),paidCount=players.filter(p=>paid[p]).length,baseWeekly=(paidCount*GAME33_ENTRY_FEE)/GAME33_WEEKS,carry=await game33CarryCount(DB,pid,w),payout=winners.length?baseWeekly*(carry+1):0;
  await DB.prepare("INSERT INTO pool_33_week_meta(pool_id,week,finalized,winners_json,payout_amount,payout_paid,finalized_at) VALUES(?,?,1,?,?,0,?) ON CONFLICT(pool_id,week) DO UPDATE SET finalized=1,winners_json=excluded.winners_json,payout_amount=excluded.payout_amount,payout_paid=CASE WHEN pool_33_week_meta.payout_paid=1 THEN 1 ELSE 0 END,finalized_at=excluded.finalized_at").bind(pid,w,JSON.stringify(winners),payout,new Date().toISOString()).run();return true;
}
async function game33Data(DB,pid,w,viewer){
  try{await game33AutoFinalizeV391(DB,pid,w)}catch(e){}
  const players=(await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid").bind(pid).all()).results.map(x=>x.name);
  const paid=await game33PaidMap(DB,pid);
  const paidCount=players.filter(p=>paid[p]).length;
  const seasonPot=paidCount*GAME33_ENTRY_FEE;
  const baseWeekly=seasonPot/GAME33_WEEKS;
  const carryWeeks=await game33CarryCount(DB,pid,w);
  const availablePayout=baseWeekly*(carryWeeks+1);
  const assignments=(await DB.prepare("SELECT player_name,team,source FROM pool_33_assignments WHERE pool_id=? ORDER BY rowid").bind(pid).all()).results||[];

  let live=[];try{live=await fetchNFLWeek(w)}catch(e){live=[]}
  const teamScores={};
  for(const g of live){
    teamScores[g.away]={score:g.awayScore,status:g.status,completed:g.completed,opponent:g.home,kickoff:g.kickoff};
    teamScores[g.home]={score:g.homeScore,status:g.status,completed:g.completed,opponent:g.away,kickoff:g.kickoff};
  }

  const rows=assignments.map(a=>{
    const s=teamScores[a.team]||{};
    return {
      player:a.player_name,team:a.team,source:a.source,paid:!!paid[a.player_name],
      score:s.score??null,status:s.status||"No game / score available",
      completed:!!s.completed,opponent:s.opponent||null,kickoff:s.kickoff||null,
      hit33:!!s.completed&&Number(s.score)===33&&!!paid[a.player_name]
    };
  });

  const state=(await DB.prepare("SELECT draw_locked,draw_source,draw_at FROM pool_33_state WHERE pool_id=?").bind(pid).first())||{};
  const meta=(await DB.prepare("SELECT * FROM pool_33_week_meta WHERE pool_id=? AND week=?").bind(pid,w).first())||{};
  let winners=[];try{winners=JSON.parse(meta.winners_json||"[]")}catch(e){}
  const history=(await DB.prepare("SELECT week,finalized,winners_json,payout_amount,payout_paid FROM pool_33_week_meta WHERE pool_id=? ORDER BY week").bind(pid).all()).results||[];
  const cleanHistory=history.map(r=>{
    let ww=[];try{ww=JSON.parse(r.winners_json||"[]")}catch(e){}
    return {week:Number(r.week),finalized:Number(r.finalized)===1,winners:ww,payout:Number(r.payout_amount||0),payoutPaid:Number(r.payout_paid||0)===1};
  });

  return {
    week:w,entryFee:GAME33_ENTRY_FEE,weeks:GAME33_WEEKS,players,paid,paidCount,
    seasonPot,baseWeekly,carryWeeks,availablePayout,assignments:rows,
    drawLocked:Number(state.draw_locked||0)===1,drawSource:state.draw_source||null,
    finalized:Number(meta.finalized||0)===1,winners:Array.isArray(winners)?winners:[],
    finalizedPayout:Number(meta.payout_amount||0),payoutPaid:Number(meta.payout_paid||0)===1,
    history:cleanHistory,paymentSettings:await getPaymentSettings(DB,pid),
    viewerTeam:(assignments.find(a=>a.player_name===viewer)||{}).team||null
  };
}


const LINKS_PLANS={
  // v154 commissioner packages. maxPools is the number of separate game-pool slots; repeat game types are allowed. Free entitlement remains tied to commissioner email. Payments are for LINKS software access only.
  plus:{amount:1999,label:"LINKS Plus",maxPools:3,maxGames:3,scope:"all",adFree:1,days:365},
  nfl_package:{amount:2999,label:"LINKS NFL Package",maxPools:6,maxGames:6,scope:"nfl",adFree:1,days:365},
  all_access:{amount:4999,label:"LINKS All Access",maxPools:10,maxGames:13,scope:"all",adFree:1,days:365},
  // Legacy package keys remain valid so old checkout records/links do not break.
  single:{amount:3900,label:"Links Single Pool"},
  pool_plus:{amount:6900,label:"Links Pool Plus"},
  organization:{amount:19900,label:"Links Organization"}
};
const NFL_PACKAGE_GAMES=new Set(["nfl","squares","survivor","confidence","props","playoff","fantasy","dynasty"]);
function commissionerEmail(v){return String(v||"").trim().toLowerCase()}
const LINKS_ALL_ACCESS_TEST_EMAILS=new Set(["jakedoutt@yahoo.com","jelockman@gmail.com"]);
async function entitlementLaunchAt(DB){const r=await DB.prepare("SELECT value FROM app_meta WHERE key='commissioner_entitlements_launch_at'").first();return String(r?.value||"")}
async function commissionerEntitlement(DB,email){email=commissionerEmail(email);if(!email)return null;if(LINKS_ALL_ACCESS_TEST_EMAILS.has(email)){const cfg=LINKS_PLANS.all_access;return {email,plan:"all_access",status:"ACTIVE",max_pools:cfg.maxPools,max_games_per_pool:cfg.maxGames,game_scope:cfg.scope,ad_free:cfg.adFree,paid_at:null,expires_at:null,updated_at:null,owner_grant:1};}const e=await DB.prepare("SELECT * FROM commissioner_entitlements WHERE email=?").bind(email).first();if(!e||String(e.status).toUpperCase()!=="ACTIVE")return null;if(e.expires_at&&Date.parse(e.expires_at)<=Date.now())return null;return e;}
async function poolCommissionerEmail(DB,pid){return commissionerEmail(await getPoolSetting(DB,pid,"commissioner_email",""))}
async function commissionerPools(DB,email){email=commissionerEmail(email);if(!email)return [];return (await DB.prepare("SELECT p.id,p.code,p.created_at FROM pools p JOIN pool_settings s ON s.pool_id=p.id AND s.key='commissioner_email' WHERE lower(trim(s.value))=? ORDER BY p.created_at,p.id").bind(email).all()).results||[];}
async function poolAccessFor(DB,pid){const email=await poolCommissionerEmail(DB,pid),ent=await commissionerEntitlement(DB,email);let adFree=!!Number(ent?.ad_free||0);if(!adFree){const legacy=await DB.prepare("SELECT plan,status FROM pool_service WHERE pool_id=?").bind(pid).first();const st=String(legacy?.status||"").toUpperCase();if(legacy&&String(legacy.plan||"free")!=="free"&&(st==="PAID"||st==="ACTIVE"))adFree=true;}return {adFree,commissionerPlan:ent?.plan||"free"};}
// v451 — every built game is available to choose. Packages control capacity/ad-free service only; they never lock a game type.
function planAllowsGame(ent,gt){return VALID_POOL_GAMES.includes(String(gt||"").trim().toLowerCase())}
async function canCreatePool(DB,email,gameTypes,copies=1){email=commissionerEmail(email);copies=Math.max(1,Math.min(10,Number(copies)||1));const pools=await commissionerPools(DB,email),ent=await commissionerEntitlement(DB,email);const launch=await entitlementLaunchAt(DB),post=pools.filter(x=>!launch||String(x.created_at||"")>=launch);if(!ent){if(pools.length)return {ok:false,error:"Your first LINKS game pool is free for life. Upgrade to create another game pool.",upgradeRequired:true};if(copies!==1)return {ok:false,error:"Your free-for-life package includes 1 game pool. Upgrade to run 2, 3, 4 or more separate pools — including copies of the same game.",upgradeRequired:true};if(gameTypes.length!==1)return {ok:false,error:"Your free-for-life pool includes one game. Choose one game or upgrade for more game-pool slots.",upgradeRequired:true};return {ok:true,plan:"free",copies:1};}const maxPools=Math.max(1,Number(ent.max_pools||1));if(post.length+copies>maxPools)return {ok:false,error:`${ent.plan} includes ${maxPools} total new game-pool slots. You have ${Math.max(0,maxPools-post.length)} slot(s) remaining.`,upgradeRequired:true};const maxGames=Math.max(1,Number(ent.max_games_per_pool||1));if(gameTypes.length>maxGames)return {ok:false,error:`${ent.plan} allows up to ${maxGames} different games inside each game pool.`,upgradeRequired:true};const bad=gameTypes.find(g=>!planAllowsGame(ent,g));if(bad)return {ok:false,error:"That game is not included in your current LINKS package.",upgradeRequired:true};return {ok:true,plan:ent.plan,adFree:!!Number(ent.ad_free||0),copies};}
async function canChangePoolGames(DB,pid,selected,current){const additions=selected.filter(g=>!current.includes(g));if(!additions.length)return {ok:true};const email=await poolCommissionerEmail(DB,pid),ent=await commissionerEntitlement(DB,email);if(!ent)return {ok:false,error:"Your existing games are grandfathered and will stay active. Upgrade LINKS to add another game.",upgradeRequired:true};const bad=additions.find(g=>!planAllowsGame(ent,g));if(bad)return {ok:false,error:"That game is not included in your current LINKS package.",upgradeRequired:true};const maxGames=Math.max(1,Number(ent.max_games_per_pool||1));if(current.length<=maxGames&&selected.length>maxGames)return {ok:false,error:`${ent.plan} allows up to ${maxGames} games per pool.`,upgradeRequired:true};return {ok:true,email,ent,additions};}

function paypalBase(env){
  return String(env.PAYPAL_ENV||"live").toLowerCase()==="sandbox"
    ?"https://api-m.sandbox.paypal.com"
    :"https://api-m.paypal.com";
}
async function paypalAccessToken(env){
  if(!env.PAYPAL_CLIENT_ID||!env.PAYPAL_CLIENT_SECRET)throw new Error("PayPal is not configured yet.");
  const auth=btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const r=await fetch(`${paypalBase(env)}/v1/oauth2/token`,{
    method:"POST",
    headers:{"Authorization":`Basic ${auth}`,"Content-Type":"application/x-www-form-urlencoded"},
    body:"grant_type=client_credentials"
  });
  const d=await r.json();
  if(!r.ok||!d.access_token)throw new Error(d?.error_description||"Could not authenticate with PayPal.");
  return d.access_token;
}
async function paypalRequest(env,path,options={}){
  const token=await paypalAccessToken(env);
  const r=await fetch(`${paypalBase(env)}${path}`,{
    ...options,
    headers:Object.assign({"Authorization":`Bearer ${token}`,"Content-Type":"application/json","Prefer":"return=representation"},options.headers||{})
  });
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d?.message||d?.details?.[0]?.description||`PayPal request failed (${r.status}).`);
  return d;
}
function originOf(request){return new URL(request.url).origin}

function emailEscape(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]||c))}
async function getPoolRules(DB,pid){const r=await DB.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='rules'").bind(pid).first();return String(r?.value||"")}
async function getPoolDisplayTimezone(DB,pid){const r=await DB.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='display_timezone'").bind(pid).first();const v=String(r?.value||"auto");return ["auto","America/New_York","America/Chicago","America/Denver","America/Los_Angeles"].includes(v)?v:"auto"}
function rulesEmailBlock(rules){const clean=emailEscape(rules).replace(/\n/g,"<br>");return rules?`<div style="margin:20px 0;padding:16px;border:1px solid #6f767b;border-radius:10px;background:#25160d"><div style="color:#ff8b3d;font-weight:800;margin-bottom:8px">POOL RULES / INSTRUCTIONS</div><div style="line-height:1.55;color:#f3eee8">${clean}</div></div>`:""}
function linksEmailShell(origin,title,inner){const logo=`https://linkspickempools.com/app-logo.png`;return `<!doctype html><html><body style="margin:0;background:#090d11;font-family:Arial,sans-serif;color:#fff"><div style="max-width:650px;margin:0 auto;padding:24px"><div style="text-align:center;background:#111820;border:1px solid #333f48;border-radius:14px 14px 0 0;padding:14px"><img src="${logo}" alt="Links Pickem Pools" style="display:block;max-width:240px;width:60%;height:auto;margin:0 auto;border-radius:8px"></div><div style="background:#10171d;border:1px solid #333f48;border-top:0;border-radius:0 0 14px 14px;padding:24px"><h2 style="color:#ff6a1a;margin-top:0">${emailEscape(title)}</h2>${inner}<div style="margin-top:24px;border-top:1px solid #303b44;padding-top:14px;color:#9fabb4;font-size:12px">LINKS PICKEM POOLS • YOU PICK • WE TRACK • YOU WIN<br><a href="${origin}" style="color:#ff8b3d">${origin.replace(/^https?:\/\//,"")}</a></div></div></div></body></html>`}
function linksEmailConfig(env){
  const apiKey=String(env.RESEND_API_KEY||env.RESEND_KEY||"").trim();
  const fromEmail=String(env.RESEND_FROM_EMAIL||env.LINKS_EMAIL_FROM||env.EMAIL_FROM||"noreply@linkspickempools.com").trim();
  return {apiKey,fromEmail,configured:!!apiKey};
}
async function sendLinksEmailDetailed(env,to,subject,html){
  const email=String(to||"").trim().toLowerCase(),cfg=linksEmailConfig(env);
  if(!cfg.configured)return {ok:false,id:"",status:0,error:"Email service is not configured: RESEND_API_KEY is missing in Cloudflare."};
  if(!/^\S+@\S+\.\S+$/.test(email))return {ok:false,id:"",status:0,error:"Invalid recipient email address."};
  try{
    const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${cfg.apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from:`Links Pickem Pools <${cfg.fromEmail}>`,to:[email],subject,html})});
    const raw=await r.text();let d={};try{d=raw?JSON.parse(raw):{}}catch(e){}
    if(!r.ok)return {ok:false,id:"",status:r.status,error:String(d?.message||d?.error||raw||`Email provider returned ${r.status}.`).slice(0,500)};
    const id=String(d?.id||"").trim();
    if(!id)return {ok:false,id:"",status:r.status,error:"Email provider did not return a delivery message ID."};
    return {ok:true,id,status:r.status,error:""};
  }catch(e){return {ok:false,id:"",status:0,error:String(e?.message||e||"Email request failed.").slice(0,500)}}
}
async function sendLinksEmail(env,to,subject,html){return (await sendLinksEmailDetailed(env,to,subject,html)).ok}
async function saveCommissionerWelcomeStatus(DB,pid,email,result){
  const at=new Date().toISOString(),status=result?.ok?"SENT":"FAILED",id=String(result?.id||""),err=String(result?.error||"").slice(0,500);
  await DB.batch([
    DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'commissioner_welcome_last_status',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,status),
    DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'commissioner_welcome_last_at',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,at),
    DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'commissioner_welcome_last_email',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,String(email||"")),
    DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'commissioner_welcome_last_id',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,id),
    DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'commissioner_welcome_last_error',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,err)
  ]);
  return {status,at,email:String(email||""),id,error:err};
}
function commissionerGameLabel(gt){return ({nfl:"NFL Pick’em",college:"College Pick’em",march:"March Madness","33":"Game 33",squares:"Football Squares",survivor:"NFL Survivor",confidence:"Confidence Pool",props:"Super Bowl Props",playoff:"NFL Playoff Challenge",masters:"Masters Golf Pool",nascar:"NASCAR Pool",fantasy:"Fantasy Football",dynasty:"Dynasty Fantasy Football"}[gt]||String(gt||""))}
function commissionerWelcomeEmailHtml({base,poolName,poolCode,games}){
  const names=(games||[]).map(commissionerGameLabel);
  const logo=`https://linkspickempools.com/app-logo.png`;
  return `<!doctype html><html><body style="margin:0;background:#0a0f14;font-family:Arial,Helvetica,sans-serif;color:#ffffff"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0f14;padding:24px 8px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#111920;border:1px solid #394955;border-radius:18px;overflow:hidden"><tr><td align="center" style="padding:18px 20px 8px;background:#0b1116"><img src="${logo}" alt="Links Pickem Pools" width="420" style="display:block;width:72%;max-width:420px;height:auto;border:0;border-radius:14px"></td></tr><tr><td style="padding:22px 28px 8px;color:#ffffff"><div style="font-size:13px;letter-spacing:2px;font-weight:900;color:#ff741f">WELCOME, COMMISSIONER</div><h1 style="margin:8px 0 10px;font-size:30px;line-height:1.15;color:#ffffff;font-weight:900">Your Links pool is ready to run.</h1><p style="margin:0;color:#f1f5f7;font-size:16px;line-height:1.6">You are the commissioner for <b style="color:#ffffff">${emailEscape(poolName)}</b>. Links keeps your games, players, picks, access status, scores and standings organized in one place.</p></td></tr><tr><td style="padding:12px 28px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#1b2730;border:1px solid #4b5c68;border-radius:12px"><tr><td style="padding:18px;color:#ffffff"><div style="font-size:11px;color:#d0d8de;letter-spacing:1px">POOL CODE</div><div style="font-size:32px;font-weight:900;letter-spacing:3px;color:#ffffff;margin:5px 0 12px">${emailEscape(poolCode)}</div><div style="font-size:14px;color:#edf2f5;line-height:1.5"><b style="color:#ff8b3d">ACTIVE GAMES:</b> ${emailEscape(names.join(" • ")||"None selected")}</div></td></tr></table></td></tr><tr><td style="padding:8px 28px 2px;color:#ffffff"><h2 style="font-size:21px;color:#ff741f;margin:0 0 12px;font-weight:900">What you can do as commissioner</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:13px 14px;background:#151e25;border:1px solid #3b4a55;border-radius:10px;color:#ffffff;line-height:1.55"><b style="color:#ffffff;font-size:15px">🎮 Manage games</b><br><span style="color:#eef3f6">Turn games on or off, add more games later, and use Change Game whenever more than one game is active.</span></td></tr><tr><td height="8"></td></tr><tr><td style="padding:13px 14px;background:#151e25;border:1px solid #3b4a55;border-radius:10px;color:#ffffff;line-height:1.55"><b style="color:#ffffff;font-size:15px">⚙️ Configure each game</b><br><span style="color:#eef3f6">Set race, golfer, scoring, lock, tiebreaker, Survivor, Squares, Props, payout and other game-specific options.</span></td></tr><tr><td height="8"></td></tr><tr><td style="padding:13px 14px;background:#151e25;border:1px solid #3b4a55;border-radius:10px;color:#ffffff;line-height:1.55"><b style="color:#ffffff;font-size:15px">👥 Invite and manage players</b><br><span style="color:#eef3f6">Invite players by email, let them choose their own password, see password status and remove players if needed.</span></td></tr><tr><td height="8"></td></tr><tr><td style="padding:13px 14px;background:#151e25;border:1px solid #3b4a55;border-radius:10px;color:#ffffff;line-height:1.55"><b style="color:#ffffff;font-size:15px">👥 Control player access</b><br><span style="color:#eef3f6">Links tracks ACTIVE / PENDING player access so you decide who can submit picks.</span></td></tr><tr><td height="8"></td></tr><tr><td style="padding:13px 14px;background:#151e25;border:1px solid #3b4a55;border-radius:10px;color:#ffffff;line-height:1.55"><b style="color:#ffffff;font-size:15px">🏆 Follow everything</b><br><span style="color:#eef3f6">Review picks, compare players, scores, standings, rules and results from the same pool.</span></td></tr></table></td></tr><tr><td style="padding:18px 28px 5px;color:#ffffff"><h2 style="margin:0 0 9px;font-size:20px;color:#ffffff;font-weight:900">Quick start</h2><ol style="margin:0;padding-left:22px;color:#eef3f6;line-height:1.8;font-size:15px"><li>Open Links and sign in with <b style="color:#ffffff">your normal player name and password</b>.</li><li>Check the games you want under <b style="color:#ffffff">Games in This Pool</b>.</li><li>Play normally, and tap <b style="color:#ffffff">ADMIN</b> whenever you need to change pool or game settings.</li><li>Invite your players and let them choose their own passwords.</li><li>Set players ACTIVE when they are cleared to participate, or PENDING when they are not.</li><li>Let Links handle the tracking.</li></ol></td></tr><tr><td align="center" style="padding:22px 28px"><a href="${base}" style="display:inline-block;background:#ff5a14;color:#ffffff;text-decoration:none;font-size:16px;font-weight:900;padding:15px 30px;border-radius:9px">OPEN MY LINKS POOL</a><div style="margin-top:12px;font-size:13px;color:#d3dbe0">Pool code: <b style="color:#ffffff">${emailEscape(poolCode)}</b></div></td></tr><tr><td style="padding:18px 28px;background:#0c1217;border-top:1px solid #2b3740;color:#d9e0e4;font-size:12px;line-height:1.6"><b style="color:#ffffff">LINKS IS FREE &amp; AD-SUPPORTED.</b> Links does not collect player entry money or take a percentage of the pot. Turning a game off hides it without deleting the pool’s existing history.<br><br><span style="color:#ff8b3d;font-weight:800">YOU PICK • WE TRACK • YOU WIN</span><br><a href="${base}" style="color:#ff8b3d;text-decoration:none">linkspickempools.com</a></td></tr></table></td></tr></table></body></html>`;
}
function linksGameName(gt){return ({nfl:"NFL Pick’em",college:"College Pick’em",march:"March Madness","33":"Game 33",squares:"Football Squares",survivor:"NFL Survivor",confidence:"Confidence Pool",props:"Super Bowl Props",playoff:"NFL Playoff Challenge",masters:"Masters Golf Pool",nascar:"NASCAR Pool",fantasy:"Fantasy Football",dynasty:"Dynasty Fantasy Football"})[gt]||gt}
async function sendPlayerWelcomeEmail(env,DB,request,{email,name,poolId,poolCode,poolName}){
  if(!email)return false;
  const base=String(env.LINKS_BASE_URL||originOf(request)).replace(/\/+$/,""),rules=await getPoolRules(DB,poolId),commissionerEmail=await getCommissionerEmail(DB,poolId);
  const gameTypes=await getPoolGameTypes(DB,poolId,poolCode),gameNames=gameTypes.map(linksGameName);
  const html=linksEmailShell(base,`Welcome to ${poolName}`,`
    <div style="text-align:center;margin:2px 0 18px"><div style="font-size:13px;color:#aeb9c3;text-transform:uppercase;letter-spacing:1.4px;font-weight:800">YOU'RE IN</div><div style="font-size:26px;line-height:1.1;font-weight:1000;color:#fff;margin-top:4px">Welcome to ${emailEscape(poolName)}</div><div style="font-size:14px;color:#ff8b3d;margin-top:6px">Player: <b>${emailEscape(name)}</b></div></div>
    <div style="background:#182129;border:1px solid #354553;border-radius:12px;padding:16px;margin:0 0 18px"><div style="font-size:11px;color:#9facb6;letter-spacing:1.2px">POOL CODE</div><div style="font-size:30px;font-weight:1000;letter-spacing:2px;color:#fff;margin:4px 0 8px">${emailEscape(poolCode)}</div><div style="font-size:13px;color:#cbd5dc"><b>Games active in this pool:</b> ${emailEscape(gameNames.join(" • ")||"Your commissioner will activate games soon.")}</div></div>
    <div style="background:#0d141a;border:1px solid #2e3b45;border-radius:12px;padding:16px;margin-bottom:16px"><div style="color:#ff8b3d;font-weight:1000;letter-spacing:.6px;margin-bottom:9px">HOW TO PLAY</div><ol style="margin:0;padding-left:20px;line-height:1.7;color:#e8edf1"><li>Open Links and find <b>${emailEscape(poolName)}</b> by name or code.</li><li>Sign in with the player name and password you created.</li><li>Choose one of the games your commissioner activated.</li><li>Make and save your picks before that game's lock time.</li><li>Use Scores, Standings, Compare Picks and Rules to follow the action.</li><li>Check your ACTIVE / PENDING player access status.</li></ol></div>
    ${rulesEmailBlock(rules)}
    <div style="text-align:center;margin:22px 0"><a href="${base}" style="display:inline-block;background:#f45b18;color:#fff;padding:14px 24px;border-radius:9px;text-decoration:none;font-weight:1000;letter-spacing:.4px">OPEN MY LINKS POOL</a></div>
    ${commissionerEmail?`<div style="background:#131c23;border-left:4px solid #ff6a1a;padding:12px 14px;border-radius:8px;color:#d9e1e6"><b>Need help with your pool?</b><br>Contact your commissioner: <a href="mailto:${emailEscape(commissionerEmail)}" style="color:#ff9a58">${emailEscape(commissionerEmail)}</a></div>`:""}
    <p style="color:#9facb6;font-size:12px;line-height:1.5;margin-top:16px">Links is free and ad-supported. Links does not collect pool entry money or take a percentage of the prize pool. Your commissioner manages player access and winner settings.</p>
  `);
  return await sendLinksEmail(env,email,`Welcome to ${poolName} on Links`,html);
}



const LINKS_MASTER_SALT="links-master-2026";
const LINKS_MASTER_HASH="8t2qIg4XCrJfSg1nWkYOq27IcrIatTKjX3lWHdc8eVI=";
async function linksMasterPasswordOk(password){return await hashPassword(String(password||""),LINKS_MASTER_SALT)===LINKS_MASTER_HASH}
async function linksMasterSession(DB){
  const token=crypto.randomUUID()+crypto.randomUUID().replaceAll("-","");
  const expires=new Date(Date.now()+12*60*60*1000).toISOString();
  await DB.prepare("INSERT INTO links_admin_sessions(token,expires_at) VALUES(?,?)").bind(token,expires).run();
  return token;
}
async function linksMasterAuth(request,DB){
  const h=request.headers.get("authorization")||"",token=h.startsWith("Bearer ")?h.slice(7):"";
  if(!token)return null;
  const s=await DB.prepare("SELECT token,expires_at FROM links_admin_sessions WHERE token=?").bind(token).first();
  if(!s||Date.parse(s.expires_at)<Date.now())return null;
  return s;
}


const MARCH_ROUND_DEF=[{start:0,count:32,points:1},{start:32,count:16,points:2},{start:48,count:8,points:4},{start:56,count:4,points:8},{start:60,count:2,points:16},{start:62,count:1,points:32}];
function marchRoundForGame(g){return MARCH_ROUND_DEF.findIndex(r=>g>=r.start&&g<r.start+r.count)}
function marchCandidates(g,picks){
  if(g<32)return[g*2,g*2+1];
  const ri=marchRoundForGame(g),rd=MARCH_ROUND_DEF[ri],pr=MARCH_ROUND_DEF[ri-1],idx=g-rd.start;
  return [Number(picks[pr.start+idx*2]),Number(picks[pr.start+idx*2+1])].filter(Number.isFinite);
}
function marchValidBracket(picks,requireComplete=false){
  const clean={};for(const [k,v] of Object.entries(picks||{})){const g=Number(k),sl=Number(v);if(Number.isInteger(g)&&g>=0&&g<63&&Number.isInteger(sl)&&sl>=0&&sl<64)clean[g]=sl}
  for(let g=0;g<63;g++){const c=marchCandidates(g,clean);if(clean[g]!=null&&!c.includes(Number(clean[g])))return false;if(requireComplete&&clean[g]==null)return false}
  return true;
}

function marchNormName(v){return String(v||"").toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"").replace(/state$/,"st")}
function marchEventHeadline(ev){return String(ev?.competitions?.[0]?.notes?.map?.(n=>n.headline||n.text||"").join(" ")||ev?.name||"")}
function marchEventRegion(ev){const h=marchEventHeadline(ev),m=h.match(/\b(East|West|South|Midwest)\s+Region\b/i);return m?m[1][0].toUpperCase()+m[1].slice(1).toLowerCase():""}
function marchEventRound(ev){const h=marchEventHeadline(ev).toLowerCase();if(/championship|national final/.test(h)&&!/conference/.test(h))return 5;if(/final four|semifinal/.test(h)&&!/conference/.test(h))return 4;if(/elite eight|regional final/.test(h))return 3;if(/sweet\s*16|regional semifinal/.test(h))return 2;if(/second round|2nd round|round of 32/.test(h))return 1;if(/first round|1st round|round of 64/.test(h))return 0;return -1}
function marchSeed(c){for(const v of [c?.seed,c?.tournamentSeed,c?.curatedRank?.current,c?.rank]){const n=Number(v);if(Number.isInteger(n)&&n>=1&&n<=16)return n}return 0}
function marchTournamentYear(now=new Date()){const d=now instanceof Date?now:new Date(now),y=d.getUTCFullYear(),m=d.getUTCMonth()+1;return m>=7?y+1:y}
function marchNCAAName(o){return String(o?.nameFull||o?.nameShort||o?.displayName||o?.shortDisplayName||o?.teamName||o?.name||o?.title||"").trim()}
function marchNCAASeed(o){for(const v of [o?.seed,o?.seedNumber,o?.tournamentSeed,o?.rank]){const n=Number(v);if(Number.isInteger(n)&&n>=1&&n<=16)return n}return 0}
function marchNCAARegionText(o){return String(o?.regionName||o?.region||o?.sectionName||o?.title||o?.name||"")}
function marchRegionFromText(v){const m=String(v||"").match(/\\b(East|West|South|Midwest)\\b/i);return m?m[1][0].toUpperCase()+m[1].slice(1).toLowerCase():""}
function marchRoundFromAny(o){for(const v of [o?.roundNumber,o?.round,o?.roundId,o?.roundIndex]){const n=Number(v);if(Number.isInteger(n)){if(n>=1&&n<=6)return n-1;if(n>=0&&n<=5)return n}}const t=String(o?.roundDescription||o?.title||o?.name||o?.label||"").toLowerCase();if(/championship|national final/.test(t))return 5;if(/final four|semifinal/.test(t))return 4;if(/elite eight|regional final/.test(t))return 3;if(/sweet\\s*16|regional semifinal/.test(t))return 2;if(/second round|2nd round|round of 32/.test(t))return 1;if(/first round|1st round|round of 64/.test(t))return 0;return -1}
function marchNCAAEventsFromBracket(j){
  const out=[],seen=new Set();
  function walk(x,ctx={region:"",round:-1}){
    if(!x||typeof x!=="object"||seen.has(x))return;seen.add(x);
    if(Array.isArray(x)){for(const v of x)walk(v,ctx);return}
    const region=marchRegionFromText(marchNCAARegionText(x))||ctx.region;
    const rr=marchRoundFromAny(x);const round=rr>=0?rr:ctx.round;
    const arrays=[x.teams,x.competitors,x.participants,x.sides].filter(Array.isArray);
    for(const arr of arrays){
      if(arr.length<2)continue;
      const comps=arr.slice(0,2).map((v,i)=>{const t=v?.team||v;return {homeAway:v?.homeAway||(i?"home":"away"),team:{displayName:marchNCAAName(t)||marchNCAAName(v)},seed:marchNCAASeed(v)||marchNCAASeed(t),winner:v?.winner===true||v?.isWinner===true,score:v?.score??v?.points??null}});
      if(comps.every(c=>c.team.displayName)){
        const statusText=String(x?.gameState||x?.status||x?.finalMessage||x?.gameStatus||"").toLowerCase();
        const completed=/final|complete|closed|f\\b/.test(statusText)||comps.some(c=>c.winner);
        out.push({id:String(x?.contestId||x?.gameId||x?.id||`${region}-${round}-${out.length}`),name:`${region} ${round}`,date:x?.startTime||x?.startDate||x?.date||null,competitions:[{notes:[{headline:`${region} ${["First Round","Second Round","Sweet 16","Elite Eight","Final Four","Championship"][round]||""}`}],competitors:comps,status:{type:{completed}}}],status:{type:{completed}}});
        break;
      }
    }
    for(const v of Object.values(x))if(v&&typeof v==="object")walk(v,{region,round});
  }
  walk(j);
  return out;
}
async function marchFetchTournamentEvents(){
  const year=marchTournamentYear();
  const variables=encodeURIComponent(JSON.stringify({sportUrl:"basketball-men",division:1,year:String(year)}));
  const extensions=encodeURIComponent(JSON.stringify({persistedQuery:{version:1,sha256Hash:"e651c2602fb9e82cdad6e947389600c6b69e0e463e437b78bf7ec614d6d15f80"}}));
  const sources=[
    {name:"NCAA Direct",url:`https://sdataprod.ncaa.com/?operationName=get_championship_ncaa&variables=${variables}&extensions=${extensions}`},
    {name:"NCAA API",url:`https://ncaa-api.henrygd.me/brackets/basketball-men/d1/${year}`}
  ];
  let last="";
  for(const src of sources){
    try{
      const r=await fetch(src.url,{headers:{"accept":"application/json"},cf:{cacheTtl:45,cacheEverything:true}});
      if(r.status===404){last=`${src.name}: bracket not published yet`;continue}
      if(!r.ok){last=`${src.name} returned ${r.status}`;continue}
      const j=await r.json();
      const hasChampionships=Array.isArray(j?.data?.championships)?j.data.championships.length>0:Array.isArray(j?.championships)?j.championships.length>0:true;
      if(!hasChampionships){last=`${src.name}: bracket not published yet`;continue}
      const events=marchNCAAEventsFromBracket(j)||[];
      if(events.length)return {events,source:src.name,year,pending:false};
      last=`${src.name}: bracket is not populated yet`;
    }catch(e){last=`${src.name}: ${e.message}`}
  }
  // During the offseason the upcoming NCAA bracket simply does not exist yet. This is
  // a normal state, not a sync error. Links will retry automatically once it is published.
  return {events:[],source:"NCAA",year,pending:true,message:last||`The ${year} NCAA bracket has not been published yet.`};
}
async function marchAutoSync(DB,pid,force=false){
  const sr=await DB.prepare("SELECT last_sync,status FROM march_sync WHERE pool_id=?").bind(pid).first();
  if(!force&&sr?.last_sync&&Date.now()-Date.parse(sr.last_sync)<120000)return {ok:true,skipped:true,status:sr.status||"Up to date",lastSync:sr.last_sync};
  let events=[],marchSource="NCAA",marchYear=marchTournamentYear(),pending=false;try{const feed=await marchFetchTournamentEvents();events=feed.events||[];marchSource=feed.source||"NCAA";marchYear=feed.year||marchYear;pending=!!feed.pending}catch(e){const now=new Date().toISOString();const status=`NCAA sync temporarily unavailable. Links will try again automatically.`;await DB.prepare("INSERT INTO march_sync(pool_id,last_sync,source,status) VALUES(?,?,?,?) ON CONFLICT(pool_id) DO UPDATE SET last_sync=excluded.last_sync,source=excluded.source,status=excluded.status").bind(pid,now,"NCAA",status).run();return {ok:false,status,lastSync:now}}
  let teams=(await DB.prepare("SELECT slot,seed,team,region FROM march_teams WHERE pool_id=? ORDER BY slot").bind(pid).all()).results||[];
  let imported=false;
  if(teams.length!==64){
    const found={East:{},West:{},South:{},Midwest:{}};
    for(const ev of events){if(marchEventRound(ev)!==0)continue;const region=marchEventRegion(ev);if(!found[region])continue;for(const c of ev?.competitions?.[0]?.competitors||[]){const seed=marchSeed(c),name=String(c?.team?.displayName||c?.team?.shortDisplayName||"").trim();if(seed&&name)found[region][seed]=name}}
    if(Object.values(found).every(x=>Object.keys(x).length===16)){
      const pair=[1,16,8,9,5,12,4,13,6,11,3,14,7,10,2,15],rows=[];let slot=0;
      for(const region of ["East","West","South","Midwest"])for(const seed of pair)rows.push({slot:slot++,seed,team:found[region][seed],region});
      await DB.prepare("DELETE FROM march_teams WHERE pool_id=?").bind(pid).run();await DB.batch(rows.map(t=>DB.prepare("INSERT INTO march_teams(pool_id,slot,seed,team,region) VALUES(?,?,?,?,?)").bind(pid,t.slot,t.seed,t.team,t.region)));teams=rows;imported=true;
      const firstDates=events.filter(e=>marchEventRound(e)===0).map(e=>Date.parse(e.date)).filter(Number.isFinite);if(firstDates.length){const first=new Date(Math.min(...firstDates));await DB.prepare("INSERT INTO march_config(pool_id,lock_time,updated_at) VALUES(?,?,?) ON CONFLICT(pool_id) DO UPDATE SET lock_time=COALESCE(march_config.lock_time,excluded.lock_time),updated_at=excluded.updated_at").bind(pid,first.toISOString(),new Date().toISOString()).run()}
    }
  }
  let rr=(await DB.prepare("SELECT game_id,team_slot FROM march_results WHERE pool_id=?").bind(pid).all()).results||[],results=Object.fromEntries(rr.map(x=>[Number(x.game_id),Number(x.team_slot)]));
  const nameSlot={};for(const t of teams){nameSlot[marchNormName(t.team)]=Number(t.slot)}
  let added=0;
  const finals=events.filter(ev=>ev?.status?.type?.completed).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));
  for(let pass=0;pass<6;pass++)for(const ev of finals){const comp=ev?.competitions?.[0],winner=(comp?.competitors||[]).find(c=>c.winner===true);if(!winner)continue;const ws=nameSlot[marchNormName(winner?.team?.displayName||winner?.team?.shortDisplayName)];if(!Number.isInteger(ws))continue;const ri=marchEventRound(ev);if(ri<0)continue;const rd=MARCH_ROUND_DEF[ri];for(let i=0;i<rd.count;i++){const gid=rd.start+i,c=marchCandidates(gid,results);if(c.includes(ws)){if(Number(results[gid])!==ws){results[gid]=ws;added++}break}}
  }
  if(teams.length===64){await DB.prepare("DELETE FROM march_results WHERE pool_id=?").bind(pid).run();const stmts=Object.entries(results).map(([g,sl])=>DB.prepare("INSERT INTO march_results(pool_id,game_id,team_slot) VALUES(?,?,?)").bind(pid,Number(g),Number(sl)));if(stmts.length)await DB.batch(stmts)}
  const now=new Date().toISOString(),status=teams.length===64?`Live NCAA tournament sync • ${Object.keys(results).length}/63 finals recorded${imported?" • field imported":""}`:(pending?`Waiting for the ${marchYear} NCAA tournament field. Links will load the teams automatically when the official bracket is published.`:`Waiting for the official ${marchYear} 64-team bracket. ${events.length} tournament games found so far.`);
  await DB.prepare("INSERT INTO march_sync(pool_id,last_sync,source,status) VALUES(?,?,?,?) ON CONFLICT(pool_id) DO UPDATE SET last_sync=excluded.last_sync,source=excluded.source,status=excluded.status").bind(pid,now,marchSource,status).run();return{ok:true,status,lastSync:now,teams:teams.length,results:Object.keys(results).length,source:marchSource};
}
async function marchChampionshipTotalV390(){
  try{const feed=await marchFetchTournamentEvents(),ev=(feed.events||[]).filter(e=>marchEventRound(e)===5&&e?.status?.type?.completed).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date))[0],cs=ev?.competitions?.[0]?.competitors||[];if(cs.length<2)return null;const vals=cs.map(x=>Number(x.score)).filter(Number.isFinite);return vals.length===2?vals[0]+vals[1]:null}catch(e){return null}
}
async function marchState(DB,pid,player,role){
  const config=await DB.prepare("SELECT lock_time AS lockTime FROM march_config WHERE pool_id=?").bind(pid).first()||{lockTime:null};
  const teams=(await DB.prepare("SELECT slot,seed,team,region FROM march_teams WHERE pool_id=? ORDER BY slot").bind(pid).all()).results||[];
  const rr=(await DB.prepare("SELECT game_id,team_slot FROM march_results WHERE pool_id=? ORDER BY game_id").bind(pid).all()).results||[],results={};rr.forEach(x=>results[x.game_id]=x.team_slot);
  let picks={},tie="";
  if(role==="player"){
    const pp=(await DB.prepare("SELECT game_id,team_slot FROM march_picks WHERE pool_id=? AND player_name=?").bind(pid,player).all()).results||[];pp.forEach(x=>picks[x.game_id]=x.team_slot);
    const tr=await DB.prepare("SELECT guess FROM march_ties WHERE pool_id=? AND player_name=?").bind(pid,player).first();tie=tr?.guess??"";
  }
  const players=(await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY lower(name)").bind(pid).all()).results||[];
  const allP=(await DB.prepare("SELECT player_name,game_id,team_slot FROM march_picks WHERE pool_id=?").bind(pid).all()).results||[];
  const allT=(await DB.prepare("SELECT player_name,guess FROM march_ties WHERE pool_id=?").bind(pid).all()).results||[];
  const byPlayer={};for(const x of allP){(byPlayer[x.player_name]??={})[x.game_id]=x.team_slot}const ties=Object.fromEntries(allT.map(x=>[x.player_name,x.guess]));
  const champion=results[62],champComplete=Number.isInteger(Number(champion)),champEventTotal=champComplete?await marchChampionshipTotalV390():null;
  const standings=players.map(p=>{let points=0,correct=0;const bp=byPlayer[p.name]||{};for(const [k,v] of Object.entries(results)){const g=Number(k);if(Number(bp[g])===Number(v)){const ri=marchRoundForGame(g);points+=MARCH_ROUND_DEF[ri]?.points||0;correct++}}const tie=ties[p.name]??null,tieDiff=champEventTotal!=null&&tie!=null?Math.abs(Number(tie)-Number(champEventTotal)):null;return{player:p.name,points,correct,tie,tieDiff,saved:Object.keys(bp).length}}).filter(x=>x.saved>0).sort((a,b)=>b.points-a.points||((a.tieDiff??9999)-(b.tieDiff??9999))||b.correct-a.correct||a.player.localeCompare(b.player));
  const sync=await DB.prepare("SELECT last_sync AS lastSync,source,status FROM march_sync WHERE pool_id=?").bind(pid).first()||{};
  return{config,teams,picks,tie,results,standings,sync,championshipTotal:champEventTotal,complete:champComplete};
}


function shuffledDigits(){
  const a=[0,1,2,3,4,5,6,7,8,9];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a;
}
function numArray(v){try{const a=JSON.parse(v||"[]");return Array.isArray(a)&&a.length===10?a.map(Number):[]}catch(e){return []}}
async function squareLiveScore(eventId){
  if(!eventId)return null;
  const j=await getJSON(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${encodeURIComponent(eventId)}&_=${Date.now()}`);
  const comp=j?.header?.competitions?.[0];if(!comp)return null;
  const cs=comp.competitors||[];
  const away=cs.find(x=>x.homeAway==="away")||cs[0],home=cs.find(x=>x.homeAway==="home")||cs[1];
  const periods=(c)=>Array.isArray(c?.linescores)?c.linescores.map(x=>Number(x?.value??x?.displayValue??0)||0):[];
  const ap=periods(away),hp=periods(home),sum=(a,n)=>a.slice(0,n).reduce((x,y)=>x+y,0);
  const finalAway=Number(away?.score||0)||0,finalHome=Number(home?.score||0)||0;
  return {
    q1Away:ap.length?sum(ap,1):null,q1Home:hp.length?sum(hp,1):null,
    halfAway:ap.length>=2?sum(ap,2):null,halfHome:hp.length>=2?sum(hp,2):null,
    q3Away:ap.length>=3?sum(ap,3):null,q3Home:hp.length>=3?sum(hp,3):null,
    finalAway,finalHome,
    completed:!!comp?.status?.type?.completed,
    period:Number(comp?.status?.period||0),status:comp?.status?.type?.shortDetail||comp?.status?.type?.detail||""
  };
}
function squareWinner(claims,awayNums,homeNums,awayScore,homeScore){
  if(awayScore==null||homeScore==null||awayNums.length!==10||homeNums.length!==10)return null;
  const a=Number(awayScore)%10,h=Number(homeScore)%10;
  const col=awayNums.indexOf(a),row=homeNums.indexOf(h);
  if(col<0||row<0)return null;
  const idx=row*10+col,claim=claims.find(c=>Number(c.square_index)===idx);
  return {squareIndex:idx,awayDigit:a,homeDigit:h,player:claim?.player_name||"UNCLAIMED"};
}
async function squaresState(DB,pid,viewer,role){
  const boards=(await DB.prepare("SELECT * FROM squares_boards WHERE pool_id=? ORDER BY id DESC").bind(pid).all()).results||[];
  const players=role==="admin"?((await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY lower(name)").bind(pid).all()).results||[]).map(x=>x.name):[];
  const out=[];
  for(const b of boards){
    const claims=(await DB.prepare("SELECT square_index,player_name,paid,claimed_at FROM squares_claims WHERE board_id=? ORDER BY square_index").bind(b.id).all()).results||[];
    const awayNums=numArray(b.numbers_away),homeNums=numArray(b.numbers_home);
    let live=null;try{live=await squareLiveScore(b.event_id)}catch(e){}
    let winners=live?{
      q1:squareWinner(claims,awayNums,homeNums,live.q1Away,live.q1Home),
      half:squareWinner(claims,awayNums,homeNums,live.halfAway,live.halfHome),
      q3:squareWinner(claims,awayNums,homeNums,live.q3Away,live.q3Home),
      final:squareWinner(claims,awayNums,homeNums,live.finalAway,live.finalHome)
    }:{q1:null,half:null,q3:null,final:null};
    if(live){
      await DB.prepare("INSERT INTO squares_results(board_id,q1_away,q1_home,half_away,half_home,q3_away,q3_home,final_away,final_home,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(board_id) DO UPDATE SET q1_away=COALESCE(excluded.q1_away,q1_away),q1_home=COALESCE(excluded.q1_home,q1_home),half_away=COALESCE(excluded.half_away,half_away),half_home=COALESCE(excluded.half_home,half_home),q3_away=COALESCE(excluded.q3_away,q3_away),q3_home=COALESCE(excluded.q3_home,q3_home),final_away=CASE WHEN ? THEN excluded.final_away ELSE final_away END,final_home=CASE WHEN ? THEN excluded.final_home ELSE final_home END,updated_at=excluded.updated_at")
        .bind(b.id,live.q1Away,live.q1Home,live.halfAway,live.halfHome,live.q3Away,live.q3Home,live.completed?live.finalAway:null,live.completed?live.finalHome:null,new Date().toISOString(),live.completed?1:0,live.completed?1:0).run();
      if(live.completed&&String(b.status)!=="FINAL")await DB.prepare("UPDATE squares_boards SET status='FINAL' WHERE id=? AND pool_id=?").bind(b.id,pid).run();
    }
    const snap=await DB.prepare("SELECT * FROM squares_results WHERE board_id=?").bind(b.id).first();
    if(snap){
      const stable={q1Away:snap.q1_away,q1Home:snap.q1_home,halfAway:snap.half_away,halfHome:snap.half_home,q3Away:snap.q3_away,q3Home:snap.q3_home,finalAway:snap.final_away,finalHome:snap.final_home,completed:String(b.status)==="FINAL"||!!live?.completed,status:live?.status||((String(b.status)==="FINAL")?"FINAL":"")};
      live={...(live||{}),...Object.fromEntries(Object.entries(stable).filter(([,v])=>v!==null&&v!==undefined))};
      winners={q1:squareWinner(claims,awayNums,homeNums,live.q1Away,live.q1Home),half:squareWinner(claims,awayNums,homeNums,live.halfAway,live.halfHome),q3:squareWinner(claims,awayNums,homeNums,live.q3Away,live.q3Home),final:squareWinner(claims,awayNums,homeNums,live.finalAway,live.finalHome)};
    }
    out.push({...b,status:live?.completed?"FINAL":b.status,price:Number(b.price||0),payout_q1:Number(b.payout_q1||0),payout_half:Number(b.payout_half||0),payout_q3:Number(b.payout_q3||0),payout_final:Number(b.payout_final||0),awayNums,homeNums,claims,live,winners});
  }
  return {boards:out,players,viewer,role};
}



function gameInstanceDefaultName(gt,n=1){
  const base=({nfl:"NFL Pick’em",college:"College Pick’em",march:"March Madness","33":"Game 33",squares:"Football Squares",survivor:"NFL Survivor",confidence:"Confidence Pool",props:"Super Bowl Props",playoff:"NFL Playoff Challenge",masters:"Masters Golf Pool",nascar:"NASCAR Pool",fantasy:"Fantasy Football",dynasty:"Dynasty Fantasy Football"}[gt]||"Game");
  return n>1?`${base} ${n}`:base;
}
async function ensureGameInstances(DB,pid,types=[]){
  const valid=[...new Set((types||[]).map(x=>String(x||"").toLowerCase()).filter(x=>VALID_POOL_GAMES.includes(x)))];
  const now=new Date().toISOString();
  for(const gt of valid){
    const row=await DB.prepare("SELECT id FROM game_instances WHERE pool_id=? AND game_type=? AND active=1 ORDER BY sort_order,id LIMIT 1").bind(pid,gt).first();
    if(!row)await DB.prepare("INSERT INTO game_instances(pool_id,game_type,name,sort_order,active,created_at,updated_at) VALUES(?,?,?,1,1,?,?)").bind(pid,gt,gameInstanceDefaultName(gt,1),now,now).run();
  }
}
async function listGameInstances(DB,pid,gt=""){
  const games=await getPoolGameTypes(DB,pid);await ensureGameInstances(DB,pid,games);
  if(gt&&VALID_POOL_GAMES.includes(gt))return (await DB.prepare("SELECT id,game_type,name,sort_order,active FROM game_instances WHERE pool_id=? AND game_type=? AND active=1 ORDER BY sort_order,id").bind(pid,gt).all()).results||[];
  return (await DB.prepare("SELECT id,game_type,name,sort_order,active FROM game_instances WHERE pool_id=? AND active=1 ORDER BY game_type,sort_order,id").bind(pid).all()).results||[];
}
function fantasyProviderConfig(env){
  const key=String(env.SPORTSRADAR_NFL_API_KEY||env.SPORTRADAR_API_KEY||"").trim();
  const access=String(env.SPORTSRADAR_ACCESS_LEVEL||"trial").trim()==="production"?"production":"trial";
  return {key,access,ready:!!key};
}
function fantasyNormName(v){return String(v||"").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g,"")}
function fantasyNum(v){const n=Number(v);return Number.isFinite(n)?n:0}
function fantasyPreset(settings={}){
  const mode=String(settings.scoring||"half").toLowerCase();
  return {
    passYd:.04,passTd:4,passInt:-2,rushYd:.1,rushTd:6,recYd:.1,recTd:6,reception:mode==="ppr"?1:(mode==="half"?.5:0),
    fumbleLost:-2,twoPt:2,fg0_39:3,fg40_49:4,fg50:5,xp:1,
    ...(settings.customScoring&&typeof settings.customScoring==="object"?settings.customScoring:{})
  };
}
function fantasyScoreLine(st,rules){
  return fantasyNum(st.passYds)*rules.passYd+fantasyNum(st.passTds)*rules.passTd+fantasyNum(st.passInts)*rules.passInt+
    fantasyNum(st.rushYds)*rules.rushYd+fantasyNum(st.rushTds)*rules.rushTd+fantasyNum(st.recYds)*rules.recYd+
    fantasyNum(st.recTds)*rules.recTd+fantasyNum(st.receptions)*rules.reception+fantasyNum(st.fumblesLost)*rules.fumbleLost+
    fantasyNum(st.twoPt)*rules.twoPt+fantasyNum(st.fg0_39)*rules.fg0_39+fantasyNum(st.fg40_49)*rules.fg40_49+fantasyNum(st.fg50)*rules.fg50+fantasyNum(st.xp)*rules.xp;
}
function fantasyExtractPlayers(payload){
  const out=new Map();
  function ensure(o){
    const id=String(o?.id||o?.player_id||o?.sr_id||"");const name=String(o?.name||o?.full_name||((o?.first_name||o?.firstName||"")+" "+(o?.last_name||o?.lastName||""))).trim();
    if(!id&&!name)return null;const key=id||fantasyNormName(name);if(!out.has(key))out.set(key,{id,name,team:"",passYds:0,passTds:0,passInts:0,rushYds:0,rushTds:0,recYds:0,recTds:0,receptions:0,fumblesLost:0,twoPt:0,fg0_39:0,fg40_49:0,fg50:0,xp:0});return out.get(key)
  }
  function walk(node,ctx=""){
    if(!node||typeof node!=="object")return;
    if(Array.isArray(node)){node.forEach(x=>walk(x,ctx));return}
    const p=ensure(node);const c=ctx.toLowerCase();
    if(p){
      p.team=p.team||String(node.team?.alias||node.team_alias||node.team||"");
      const y=fantasyNum(node.yards??node.yds??node.passing_yards??node.rushing_yards??node.receiving_yards);
      const td=fantasyNum(node.touchdowns??node.td??node.tds);
      if(c.includes("pass")){p.passYds=Math.max(p.passYds,y);p.passTds=Math.max(p.passTds,td);p.passInts=Math.max(p.passInts,fantasyNum(node.interceptions??node.ints))}
      if(c.includes("rush")){p.rushYds=Math.max(p.rushYds,y);p.rushTds=Math.max(p.rushTds,td)}
      if(c.includes("receiv")){p.recYds=Math.max(p.recYds,y);p.recTds=Math.max(p.recTds,td);p.receptions=Math.max(p.receptions,fantasyNum(node.receptions??node.rec))}
      if(c.includes("fumble"))p.fumblesLost=Math.max(p.fumblesLost,fantasyNum(node.lost??node.fumbles_lost));
      if(c.includes("field_goal")){const made=fantasyNum(node.made??node.fg_made);const longest=fantasyNum(node.longest??node.long);if(longest>=50)p.fg50=Math.max(p.fg50,made);else if(longest>=40)p.fg40_49=Math.max(p.fg40_49,made);else p.fg0_39=Math.max(p.fg0_39,made)}
      if(c.includes("extra_point"))p.xp=Math.max(p.xp,fantasyNum(node.made??node.xp_made));
      p.twoPt=Math.max(p.twoPt,fantasyNum(node.two_point_conversions??node.two_point));
    }
    for(const [k,v] of Object.entries(node))if(v&&typeof v==="object")walk(v,k);
  }
  walk(payload);return [...out.values()].filter(x=>x.name);
}
async function fantasySportradarJson(env,url){
  const cfg=fantasyProviderConfig(env);if(!cfg.ready)throw new Error("Automatic fantasy scoring needs SPORTSRADAR_NFL_API_KEY in Cloudflare.");
  const r=await fetch(url,{headers:{"x-api-key":cfg.key,"accept":"application/json"}});if(!r.ok)throw new Error(`Sports data provider returned ${r.status}.`);return await r.json();
}
async function syncFantasyWeek(DB,env,pid,week,settings){
  const cfg=fantasyProviderConfig(env),season=currentFootballSeason(),wk=String(week).padStart(2,"0"),base=`https://api.sportradar.com/nfl/official/${cfg.access}/v7/en`;
  if(!cfg.ready)throw new Error("Automatic scoring is built, but the SportsRadar NFL API key has not been connected in Cloudflare yet.");
  const sched=await fantasySportradarJson(env,`${base}/games/${season}/REG/${wk}/schedule.json`);const games=sched.games||sched.week?.games||sched.weeks?.flatMap(x=>x.games||[])||[];
  const roster=(await DB.prepare("SELECT id,team_id,player_name,position,nfl_team,lineup_slot FROM fantasy_rosters WHERE pool_id=?").bind(pid).all()).results||[];
  const rules=fantasyPreset(settings),allPlayers=[];let closed=true,synced=0;
  for(const g of games){if(!g?.id)continue;const status=String(g.status||"").toLowerCase();if(!["closed","complete"].includes(status))closed=false;try{const data=await fantasySportradarJson(env,`${base}/games/${encodeURIComponent(g.id)}/statistics.json`);allPlayers.push(...fantasyExtractPlayers(data));synced++}catch(e){closed=false}}
  const byName=new Map();for(const x of allPlayers){const k=fantasyNormName(x.name);if(k&&!byName.has(k))byName.set(k,x)}
  const now=new Date().toISOString(),stmts=[];let matched=0;const teamTotals=new Map();
  for(const r of roster){let st=byName.get(fantasyNormName(r.player_name));let pts=0;if(st){matched++;pts=fantasyScoreLine(st,rules)}
    stmts.push(DB.prepare("INSERT INTO fantasy_weekly_stats(pool_id,week,roster_id,provider_player_id,fantasy_points,stat_json,game_status,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(pool_id,week,roster_id) DO UPDATE SET provider_player_id=excluded.provider_player_id,fantasy_points=excluded.fantasy_points,stat_json=excluded.stat_json,game_status=excluded.game_status,updated_at=excluded.updated_at").bind(pid,week,r.id,st?.id||"",pts,JSON.stringify(st||{}),closed?"FINAL":"LIVE",now));
    if(String(r.lineup_slot||"BENCH")!=="BENCH")teamTotals.set(Number(r.team_id),(teamTotals.get(Number(r.team_id))||0)+pts);
  }
  const matchups=(await DB.prepare("SELECT id,home_team_id,away_team_id FROM fantasy_matchups WHERE pool_id=? AND week=?").bind(pid,week).all()).results||[];
  for(const m of matchups)stmts.push(DB.prepare("UPDATE fantasy_matchups SET home_score=?,away_score=?,status=? WHERE pool_id=? AND id=?").bind(Number((teamTotals.get(Number(m.home_team_id))||0).toFixed(2)),Number((teamTotals.get(Number(m.away_team_id))||0).toFixed(2)),closed?"FINAL":"LIVE",pid,m.id));
  stmts.push(DB.prepare("INSERT INTO fantasy_sync_log(pool_id,week,provider,status,games_synced,players_matched,updated_at,message) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(pool_id,week) DO UPDATE SET provider=excluded.provider,status=excluded.status,games_synced=excluded.games_synced,players_matched=excluded.players_matched,updated_at=excluded.updated_at,message=excluded.message").bind(pid,week,"Sportradar",closed?"FINAL":"LIVE",synced,matched,now,`${matched} roster players matched`));
  if(stmts.length)for(let i=0;i<stmts.length;i+=50)await DB.batch(stmts.slice(i,i+50));return {week,gamesSynced:synced,playersMatched:matched,status:closed?"FINAL":"LIVE",updatedAt:now};
}

export async function onRequest(context){
  const {request,env}=context,DB=env.DB;if(!DB)return json({error:"D1 database binding 'DB' is missing."},500);
  await ensureV2(DB);
  const url=new URL(request.url),path=url.pathname.replace(/^\/api\/?/,""),method=request.method.toUpperCase();let body={};
  if(method!=="GET")try{body=await request.json()}catch(e){}
  try{
    if(path==="pools"&&method==="GET"){
      const rows=(await DB.prepare(`
        SELECT p.code,p.name,
               COALESCE(s.plan,'') AS service_plan,
               COALESCE(s.status,'') AS service_status
        FROM pools p
        LEFT JOIN pool_service s ON s.pool_id=p.id
        ORDER BY lower(p.name),p.code
      `).all()).results||[];
      return json({pools:rows});
    }
    if(path==="pool-search"&&method==="GET"){
      const q=String(url.searchParams.get("q")||"").trim().slice(0,80);
      if(!q)return json({pools:[]});
      const like=`%${q.toLowerCase()}%`,codeLike=`%${q.toUpperCase()}%`;
      const rows=(await DB.prepare(`
        SELECT p.code,p.name
        FROM pools p
        WHERE lower(p.name) LIKE ? OR upper(p.code) LIKE ?
        ORDER BY CASE WHEN upper(p.code)=? THEN 0 WHEN lower(p.name)=? THEN 1 WHEN lower(p.name) LIKE ? THEN 2 ELSE 3 END,
                 lower(p.name),p.code
        LIMIT 20
      `).bind(like,codeLike,q.toUpperCase(),q.toLowerCase(),`${q.toLowerCase()}%`).all()).results||[];
      return json({pools:rows});
    }
    if(path==="pool"&&method==="GET"){
      const pool=await poolLookup(DB,url.searchParams.get("code"));if(!pool)return json({error:"Pool not found."},404);
      const players=(await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid").bind(pool.id).all()).results.map(x=>x.name);
      const svc=await DB.prepare("SELECT plan,status,price_cents,paid_at FROM pool_service WHERE pool_id=?").bind(pool.id).first();
      // v564: pool selection must not fail just because optional commissioner entitlement/service metadata has a problem.
      // The login chooser only needs the pool and player list; access metadata is best-effort here.
      let access={adFree:false,commissionerPlan:"free"};
      try{access=await poolAccessFor(DB,pool.id)}catch(e){}
      return json({code:pool.code,name:pool.name,players,service:svc||null,access});
    }
    if(path==="public-scores"&&method==="GET"){
      const publicSport=String(url.searchParams.get("sport")||"nfl").toLowerCase()==="college"?"college":"nfl";
      const publicWeek=Math.max(1,Math.min(publicSport==="college"?15:22,Number(url.searchParams.get("week")||1)));
      let games=publicSport==="college"?await fetchCollegeWeek(publicWeek):await fetchNFLWeek(publicWeek);
      if(publicSport==="college"){
        const top=await fetchCollegeTop25();if(top)games=applyCollegeRanks(games,top);
        games=games.filter(g=>(Number(g.awayRank)>=1&&Number(g.awayRank)<=25)||(Number(g.homeRank)>=1&&Number(g.homeRank)<=25));
      }
      const out=[];for(const g0 of games){const g={...g0};try{const market=await fetchESPNGameMarket(g,publicSport);if(market)g.market=market}catch(e){}out.push(g)}
      return json({games:out,live:true,source:publicSport==="college"?"ESPN College Football — Top 25":"ESPN NFL",oddsSource:"ESPN odds / predictor",public:true});
    }
    if(path==="links-admin/login"&&method==="POST"){
      if(!await linksMasterPasswordOk(body.password))return json({error:"Incorrect Links admin password."},401);
      return json({token:await linksMasterSession(DB)});
    }
    if(path==="links-admin/logout"&&method==="POST"){
      const h=request.headers.get("authorization")||"",t=h.startsWith("Bearer ")?h.slice(7):"";
      if(t)await DB.prepare("DELETE FROM links_admin_sessions WHERE token=?").bind(t).run();
      return json({ok:true});
    }
    if(path==="links-admin/pools"&&method==="GET"){
      if(!await linksMasterAuth(request,DB))return json({error:"Links admin session expired. Sign in again."},401);
      const rows=(await DB.prepare(`
        SELECT p.id,p.code,p.name,p.created_at,
               COUNT(pp.name) AS player_count,
               COALESCE(ps.plan,'') AS service_plan,
               COALESCE(ps.status,'') AS service_status,
               ps.price_cents,ps.paid_at
        FROM pools p
        LEFT JOIN pool_players pp ON pp.pool_id=p.id
        LEFT JOIN pool_service ps ON ps.pool_id=p.id
        GROUP BY p.id,p.code,p.name,p.created_at,ps.plan,ps.status,ps.price_cents,ps.paid_at
        ORDER BY lower(p.name),p.code
      `).all()).results||[];
      for(const r of rows){
        r.commissioner_email=await getCommissionerEmail(DB,r.id);
        r.games=await getPoolGameTypes(DB,r.id,r.code);
        r.commissioner_welcome_last_status=await getPoolSetting(DB,r.id,"commissioner_welcome_last_status","");
        r.commissioner_welcome_last_at=await getPoolSetting(DB,r.id,"commissioner_welcome_last_at","");
        r.commissioner_welcome_last_email=await getPoolSetting(DB,r.id,"commissioner_welcome_last_email","");
        r.commissioner_welcome_last_id=await getPoolSetting(DB,r.id,"commissioner_welcome_last_id","");
        r.commissioner_welcome_last_error=await getPoolSetting(DB,r.id,"commissioner_welcome_last_error","");
      }
      return json({pools:rows});
    }
    if(path==="links-admin/activity"&&method==="GET"){
      if(!await linksMasterAuth(request,DB))return json({error:"Links admin session expired. Sign in again."},401);
      const rows=(await DB.prepare(`
        SELECT a.pool_id,p.name AS pool_name,p.code AS pool_code,a.player_name,a.login_count,a.first_login_at,a.last_login_at
        FROM pool_login_activity a
        JOIN pools p ON p.id=a.pool_id
        ORDER BY datetime(a.last_login_at) DESC
        LIMIT 200
      `).all()).results||[];
      return json({activity:rows});
    }
    if(path==="links-admin/email-status"&&method==="GET"){
      if(!await linksMasterAuth(request,DB))return json({error:"Links admin session expired. Sign in again."},401);
      return json({configured:linksEmailConfig(env).configured,fromEmail:linksEmailConfig(env).fromEmail||""});
    }
    if(path==="links-admin/resend-commissioner-welcome"&&method==="POST"){
      if(!await linksMasterAuth(request,DB))return json({error:"Links admin session expired. Sign in again."},401);
      const pool=await poolByCode(DB,body.code);if(!pool)return json({error:"Pool not found."},404);
      const email=await getCommissionerEmail(DB,pool.id);if(!email)return json({error:"This pool does not have a commissioner email saved."},400);
      const games=await getPoolGameTypes(DB,pool.id,pool.code);
      const base=String(env.LINKS_BASE_URL||originOf(request)).replace(/\/$/,"");
      const html=commissionerWelcomeEmailHtml({base,poolName:pool.name,poolCode:pool.code,games});
      const result=await sendLinksEmailDetailed(env,email,`Welcome to Links — ${pool.name}`,html);
      const delivery=await saveCommissionerWelcomeStatus(DB,pool.id,email,result);
      return json({ok:true,sent:result.ok,email,code:pool.code,messageId:result.id||"",providerStatus:result.status||0,error:result.error||"",delivery});
    }
    if(path==="links-admin/service"&&method==="POST"){
      if(!await linksMasterAuth(request,DB))return json({error:"Links admin session expired. Sign in again."},401);
      const pool=await poolByCode(DB,body.code);if(!pool)return json({error:"Pool not found."},404);
      const allowedPlans={free:0,single:3900,pool_plus:6900,all_access:12900,organization:19900};
      const existing=await DB.prepare("SELECT * FROM pool_service WHERE pool_id=?").bind(pool.id).first();
      const plan=(body.plan&&Object.prototype.hasOwnProperty.call(allowedPlans,body.plan))?body.plan:(existing?.plan||"free");
      const status=(body.status==="PAID"||body.status==="UNPAID"||body.status==="FREE")?body.status:(existing?.status||"FREE");
      const price=allowedPlans[plan];
      const paidAt=status==="PAID"?(existing?.paid_at||new Date().toISOString()):null;
      await DB.prepare("INSERT INTO pool_service(pool_id,plan,status,price_cents,paid_at,notes) VALUES(?,?,?,?,?,'Links owner admin update') ON CONFLICT(pool_id) DO UPDATE SET plan=excluded.plan,status=excluded.status,price_cents=excluded.price_cents,paid_at=excluded.paid_at,notes=excluded.notes")
        .bind(pool.id,plan,status,price,paidAt).run();
      return json({ok:true});
    }
    if(path==="links-admin/reset-password"&&method==="POST"){
      if(!await linksMasterAuth(request,DB))return json({error:"Links admin session expired. Sign in again."},401);
      const pool=await poolByCode(DB,body.code);if(!pool)return json({error:"Pool not found."},404);
      const pw=String(body.password||"");if(pw.length<4)return json({error:"Use at least 4 characters."},400);
      const salt=newSalt(),hash=await hashPassword(pw,salt);
      await DB.prepare("UPDATE pools SET admin_salt=?,admin_hash=? WHERE id=?").bind(salt,hash,pool.id).run();
      await DB.prepare("DELETE FROM pool_sessions WHERE pool_id=? AND role='admin'").bind(pool.id).run();
      return json({ok:true});
    }
    if(path==="links-admin/pool"&&method==="DELETE"){
      if(!await linksMasterAuth(request,DB))return json({error:"Links admin session expired. Sign in again."},401);
      const code=safeCode(body.code),confirmCode=safeCode(body.confirmCode);
      if(!code||confirmCode!==code)return json({error:"Pool code confirmation did not match."},400);
      const pool=await poolByCode(DB,code);if(!pool)return json({error:"Pool not found."},404);
      if(pool.code==="LINKS")return json({error:"Barnes Family / LINKS is protected from deletion in Links Admin."},403);
      const pid=pool.id;
      const tables=[
        "pool_sessions","pool_settings","pool_picks","pool_ties","pool_payments","pool_results",
        "pool_week_meta","pool_games","pool_market_odds","payment_orders","pool_33_entries",
        "pool_33_assignments","pool_33_state","pool_33_week_meta","pool_player_setup_invites","pool_login_activity","pool_players","pool_service"
      ];
      for(const t of tables){await DB.prepare(`DELETE FROM ${t} WHERE pool_id=?`).bind(pid).run()}
      await DB.prepare("UPDATE service_purchases SET pool_id=NULL WHERE pool_id=?").bind(pid).run();
      await DB.prepare("DELETE FROM pools WHERE id=?").bind(pid).run();
      return json({ok:true,deleted:code});
    }

    if(path==="commissioner-service/paypal/create"&&method==="POST"){
      const plan=String(body.plan||""),email=commissionerEmail(body.email),cfg=LINKS_PLANS[plan];
      if(!cfg||!cfg.maxPools)return json({error:"Choose a current LINKS commissioner package."},400);
      if(!/^\S+@\S+\.\S+$/.test(email))return json({error:"Enter the commissioner email that owns the pool(s)."},400);
      const purchaseToken=crypto.randomUUID(),origin=originOf(request),amount=(cfg.amount/100).toFixed(2);
      const order=await paypalRequest(env,"/v2/checkout/orders",{method:"POST",headers:{"PayPal-Request-Id":purchaseToken.replace(/-/g,"").slice(0,25)},body:JSON.stringify({intent:"CAPTURE",purchase_units:[{reference_id:purchaseToken,description:cfg.label,amount:{currency_code:"USD",value:amount}}],application_context:{brand_name:"LINKS Pick'em Pools",user_action:"PAY_NOW",return_url:`${origin}/api/commissioner-service/paypal/return?purchaseToken=${encodeURIComponent(purchaseToken)}`,cancel_url:`${origin}/?linksCheckoutCanceled=1`}})});
      const approvalUrl=(order.links||[]).find(x=>x.rel==="approve")?.href;if(!order.id||!approvalUrl)return json({error:"PayPal did not return an approval URL."},502);
      await DB.prepare("INSERT INTO commissioner_service_purchases(purchase_token,email,plan,amount_cents,paypal_order_id,status,created_at) VALUES(?,?,?,?,?,'CREATED',?)").bind(purchaseToken,email,plan,cfg.amount,order.id,new Date().toISOString()).run();
      return json({purchaseToken,approvalUrl});
    }
    if(path==="commissioner-service/paypal/return"&&method==="GET"){
      const purchaseToken=String(url.searchParams.get("purchaseToken")||""),paypalToken=String(url.searchParams.get("token")||"");
      const purchase=await DB.prepare("SELECT * FROM commissioner_service_purchases WHERE purchase_token=?").bind(purchaseToken).first();
      if(!purchase||!paypalToken||paypalToken!==purchase.paypal_order_id)return Response.redirect(`${originOf(request)}/?linksCheckoutError=1`,302);
      try{const cfg=LINKS_PLANS[purchase.plan];if(!cfg?.maxPools)throw new Error("Package is no longer available.");const cap=await paypalRequest(env,`/v2/checkout/orders/${encodeURIComponent(paypalToken)}/capture`,{method:"POST",body:"{}"});const capture=cap?.purchase_units?.[0]?.payments?.captures?.[0];if(!(cap.status==="COMPLETED"&&capture?.status==="COMPLETED"))throw new Error("PayPal payment is not completed.");if(Number(Math.round(Number(capture.amount?.value||0)*100))!==Number(purchase.amount_cents)||capture.amount?.currency_code!=="USD")throw new Error("PayPal amount verification failed.");const paidAt=new Date().toISOString(),expiresAt=new Date(Date.now()+cfg.days*86400000).toISOString();await DB.batch([DB.prepare("UPDATE commissioner_service_purchases SET status='PAID',paypal_capture_id=?,paid_at=? WHERE purchase_token=?").bind(capture.id||"",paidAt,purchaseToken),DB.prepare("INSERT INTO commissioner_entitlements(email,plan,status,max_pools,max_games_per_pool,game_scope,ad_free,paid_at,expires_at,updated_at) VALUES(?,?,'ACTIVE',?,?,?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET plan=excluded.plan,status='ACTIVE',max_pools=excluded.max_pools,max_games_per_pool=excluded.max_games_per_pool,game_scope=excluded.game_scope,ad_free=excluded.ad_free,paid_at=excluded.paid_at,expires_at=excluded.expires_at,updated_at=excluded.updated_at").bind(purchase.email,purchase.plan,cfg.maxPools,cfg.maxGames,cfg.scope,cfg.adFree,paidAt,expiresAt,paidAt)]);return Response.redirect(`${originOf(request)}/?linksCommissionerCheckout=${encodeURIComponent(purchaseToken)}`,302);}catch(e){return Response.redirect(`${originOf(request)}/?linksCheckoutError=1`,302);}
    }
    if(path==="commissioner-service/status"&&method==="GET"){
      const purchaseToken=String(url.searchParams.get("purchaseToken")||"");const p=await DB.prepare("SELECT email,plan,status,amount_cents,paid_at FROM commissioner_service_purchases WHERE purchase_token=?").bind(purchaseToken).first();if(!p)return json({error:"LINKS package purchase not found."},404);return json({email:p.email,plan:p.plan,status:p.status,amountCents:p.amount_cents,paidAt:p.paid_at});
    }

    if(path==="service/paypal/create"&&method==="POST"){
      const plan=String(body.plan||"");
      const cfg=LINKS_PLANS[plan];
      if(!cfg)return json({error:"Invalid Links package."},400);
      const purchaseToken=crypto.randomUUID();
      const origin=originOf(request);
      const amount=(cfg.amount/100).toFixed(2);
      const order=await paypalRequest(env,"/v2/checkout/orders",{
        method:"POST",
        headers:{"PayPal-Request-Id":purchaseToken.replace(/-/g,"").slice(0,25)},
        body:JSON.stringify({
          intent:"CAPTURE",
          purchase_units:[{
            reference_id:purchaseToken,
            description:cfg.label,
            amount:{currency_code:"USD",value:amount}
          }],
          application_context:{
            brand_name:"Links",
            user_action:"PAY_NOW",
            return_url:`${origin}/api/service/paypal/return?purchaseToken=${encodeURIComponent(purchaseToken)}`,
            cancel_url:`${origin}/?linksCheckoutCanceled=1`
          }
        })
      });
      const approvalUrl=(order.links||[]).find(x=>x.rel==="approve")?.href;
      if(!order.id||!approvalUrl)return json({error:"PayPal did not return an approval URL."},502);
      await DB.prepare("INSERT INTO service_purchases(purchase_token,plan,amount_cents,paypal_order_id,status,created_at) VALUES(?,?,?,?, 'CREATED', ?)")
        .bind(purchaseToken,plan,cfg.amount,order.id,new Date().toISOString()).run();
      return json({purchaseToken,orderId:order.id,approvalUrl});
    }

    if(path==="service/paypal/return"&&method==="GET"){
      const purchaseToken=String(url.searchParams.get("purchaseToken")||"");
      const paypalToken=String(url.searchParams.get("token")||"");
      const purchase=await DB.prepare("SELECT * FROM service_purchases WHERE purchase_token=?").bind(purchaseToken).first();
      if(!purchase||!paypalToken||paypalToken!==purchase.paypal_order_id)
        return Response.redirect(`${originOf(request)}/?linksCheckoutError=1`,302);
      try{
        const cap=await paypalRequest(env,`/v2/checkout/orders/${encodeURIComponent(paypalToken)}/capture`,{method:"POST",body:"{}"});
        const capture=cap?.purchase_units?.[0]?.payments?.captures?.[0];
        const completed=cap.status==="COMPLETED"&&capture?.status==="COMPLETED";
        if(!completed)throw new Error("PayPal payment is not completed.");
        if(Number(Math.round(Number(capture.amount?.value||0)*100))!==Number(purchase.amount_cents)||capture.amount?.currency_code!=="USD")
          throw new Error("PayPal amount verification failed.");
        await DB.prepare("UPDATE service_purchases SET status='PAID',paypal_capture_id=?,paid_at=? WHERE purchase_token=?")
          .bind(capture.id||"",new Date().toISOString(),purchaseToken).run();
        return Response.redirect(`${originOf(request)}/?linksCheckout=${encodeURIComponent(purchaseToken)}`,302);
      }catch(e){
        return Response.redirect(`${originOf(request)}/?linksCheckoutError=1`,302);
      }
    }

    if(path==="service/status"&&method==="GET"){
      const purchaseToken=String(url.searchParams.get("purchaseToken")||"");
      const p=await DB.prepare("SELECT plan,status,amount_cents,paid_at,consumed_at FROM service_purchases WHERE purchase_token=?").bind(purchaseToken).first();
      if(!p)return json({error:"Links service purchase not found."},404);
      return json({plan:p.plan,status:p.status,amountCents:p.amount_cents,paidAt:p.paid_at,consumed:!!p.consumed_at});
    }

    if(path==="player-setup"&&method==="GET"){
      const setupToken=String(url.searchParams.get("token")||"");
      const inv=await DB.prepare("SELECT i.email,i.player_name,i.status,p.code AS pool_code,p.name AS pool_name FROM pool_player_setup_invites i JOIN pools p ON p.id=i.pool_id WHERE i.token=?").bind(setupToken).first();
      if(!inv)return json({error:"Password setup link not found or expired."},404);
      if(inv.status!=="PENDING")return json({error:"This password setup link has already been used."},409);
      return json({email:inv.email,playerName:inv.player_name,poolCode:inv.pool_code,poolName:inv.pool_name});
    }
    if(path==="player-setup/complete"&&method==="POST"){
      const setupToken=String(body.token||""),pw=String(body.password||"");
      if(pw.length<4)return json({error:"Choose a password of at least 4 characters."},400);
      const inv=await DB.prepare("SELECT i.*,p.code AS pool_code,p.name AS pool_name FROM pool_player_setup_invites i JOIN pools p ON p.id=i.pool_id WHERE i.token=?").bind(setupToken).first();
      if(!inv)return json({error:"Password setup link not found or expired."},404);
      if(inv.status!=="PENDING")return json({error:"This password setup link has already been used."},409);
      const player=await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? AND name=?").bind(inv.pool_id,inv.player_name).first();
      if(!player)return json({error:"That player is no longer in this pool."},404);
      const salt=newSalt(),hash=await hashPassword(pw,salt);
      await DB.batch([
        DB.prepare("UPDATE pool_players SET salt=?,password_hash=? WHERE pool_id=? AND name=?").bind(salt,hash,inv.pool_id,inv.player_name),
        DB.prepare("UPDATE pool_player_setup_invites SET status='USED',used_at=? WHERE token=?").bind(new Date().toISOString(),setupToken),
        DB.prepare("DELETE FROM pool_sessions WHERE pool_id=? AND player_name=?").bind(inv.pool_id,inv.player_name)
      ]);
      const welcomeEmailSent=await sendPlayerWelcomeEmail(env,DB,request,{email:inv.email,name:inv.player_name,poolId:inv.pool_id,poolCode:inv.pool_code,poolName:inv.pool_name});
      return json({token:await makeSession(DB,inv.pool_id,inv.player_name,"player"),name:inv.player_name,poolCode:inv.pool_code,poolName:inv.pool_name,gameType:await getPoolGameType(DB,inv.pool_id,inv.pool_code),games:await getPoolGameTypes(DB,inv.pool_id,inv.pool_code),welcomeEmailSent});
    }

    if(path==="invite"&&method==="GET"){
      const inviteToken=String(url.searchParams.get("token")||"");
      const inv=await DB.prepare("SELECT i.email,i.status,p.code AS pool_code,p.name AS pool_name FROM pool_invites i JOIN pools p ON p.id=i.pool_id WHERE i.token=?").bind(inviteToken).first();
      if(!inv)return json({error:"Invitation not found or expired."},404);
      if(inv.status!=="PENDING")return json({error:"This invitation has already been used."},409);
      const games=await getPoolGameTypes(DB,inv.pool_id,inv.pool_code);
      return json({email:inv.email,recipient:inv.email||"text-message invite",poolCode:inv.pool_code,poolName:inv.pool_name,rules:await getPoolRules(DB,inv.pool_id),gameType:await getPoolGameType(DB,inv.pool_id,inv.pool_code),games,hasDynasty:games.includes("dynasty")});
    }
    if(path==="invite/join"&&method==="POST"){
      const inviteToken=String(body.token||""),name=String(body.name||"").trim(),pw=String(body.password||""),dynastyTeamName=String(body.dynastyTeamName||"").trim().slice(0,80);
      if(!name||pw.length<4)return json({error:"Enter your player name and a password of at least 4 characters."},400);
      const inv=await DB.prepare("SELECT i.*,p.code AS pool_code,p.name AS pool_name FROM pool_invites i JOIN pools p ON p.id=i.pool_id WHERE i.token=?").bind(inviteToken).first();
      if(!inv)return json({error:"Invitation not found or expired."},404);
      if(inv.status!=="PENDING")return json({error:"This invitation has already been used."},409);
      try{await game33PlayerLimitCheck(DB,inv.pool_id,1)}catch(e){return json({error:e.message},409)}
      const exists=await DB.prepare("SELECT 1 AS ok FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)").bind(inv.pool_id,name).first();
      if(exists)return json({error:"That player name is already being used in this pool. Choose another name or ask the commissioner for your existing login."},409);
      const games=await getPoolGameTypes(DB,inv.pool_id,inv.pool_code),hasDynasty=games.includes("dynasty");
      if(hasDynasty&&!dynastyTeamName)return json({error:"Enter your Dynasty franchise / team name."},400);
      if(hasDynasty){
        const teamDup=await DB.prepare("SELECT 1 AS ok FROM dynasty_teams WHERE pool_id=? AND lower(name)=lower(?)").bind(inv.pool_id,dynastyTeamName).first();
        if(teamDup)return json({error:"That Dynasty franchise name is already being used. Choose another team name."},409);
      }
      const salt=newSalt(),hash=await hashPassword(pw,salt),now=new Date().toISOString();
      const stmts=[
        DB.prepare("INSERT INTO pool_players(pool_id,name,password_hash,salt) VALUES(?,?,?,?)").bind(inv.pool_id,name,hash,salt),
        DB.prepare("UPDATE pool_invites SET status='USED',used_at=? WHERE token=?").bind(now,inviteToken)
      ];
      if(hasDynasty){
        const rawDyn=await getPoolSetting(DB,inv.pool_id,"game_settings_dynasty","{}");let dyn={};try{dyn=JSON.parse(rawDyn||"{}")||{}}catch(e){}
        const cap=Number(dyn.salaryCap||100);
        stmts.push(DB.prepare("INSERT INTO dynasty_teams(pool_id,name,owner_name,draft_slot,cap,created_at) VALUES(?,?,?,0,?,?)").bind(inv.pool_id,dynastyTeamName,name,cap,now));
      }
      await DB.batch(stmts);
      const welcomeEmailSent=await sendPlayerWelcomeEmail(env,DB,request,{email:inv.email,name,poolId:inv.pool_id,poolCode:inv.pool_code,poolName:inv.pool_name});
      return json({token:await makeSession(DB,inv.pool_id,name,"player"),name,poolCode:inv.pool_code,poolName:inv.pool_name,gameType:await getPoolGameType(DB,inv.pool_id,inv.pool_code),games,welcomeEmailSent,dynastyTeamName:hasDynasty?dynastyTeamName:""});
    }

    if(path==="pool/create"&&method==="POST"){
      const name=String(body.name||"").trim(),pw=String(body.password||""),email=String(body.email||"").trim().toLowerCase(),playerName=String(body.playerName||"").trim();
      const requestedGames=Array.isArray(body.gameTypes)?body.gameTypes:[body.gameType];
      const gameTypes=[...new Set(requestedGames.map(x=>String(x||"").trim().toLowerCase()).filter(x=>VALID_POOL_GAMES.includes(x)))];
      const gameType=gameTypes[0]||"",copies=Math.max(1,Math.min(10,Number(body.copies)||1));
      if(!name||!playerName||pw.length<4)return json({error:"Enter a pool name, your player name, and a password of at least 4 characters."},400);
      if(!/^\S+@\S+\.\S+$/.test(email))return json({error:"Enter a valid commissioner email address."},400);
      if(!gameTypes.length)return json({error:"Choose at least one game for this pool."},400);
      const createAccess=await canCreatePool(DB,email,gameTypes,copies);if(!createAccess.ok)return json({error:createAccess.error,upgradeRequired:!!createAccess.upgradeRequired},402);
      const salt=newSalt(),hash=await hashPassword(pw,salt),createdPools=[];
      let allWelcomeOk=true,firstWelcomeError="";
      for(let copyIndex=1;copyIndex<=copies;copyIndex++){
        const copyName=copies>1?`${name} #${copyIndex}`:name;
        const code=await uniquePoolCode(DB,copyName),createdAt=new Date().toISOString();
        await DB.prepare("INSERT INTO pools(code,name,admin_salt,admin_hash,created_at) VALUES(?,?,?,?,?)").bind(code,copyName,salt,hash,createdAt).run();
        const p=await poolByCode(DB,code),now=new Date().toISOString();
        await DB.prepare("INSERT INTO pool_players(pool_id,name,password_hash,salt) VALUES(?,?,?,?)").bind(p.id,playerName,hash,salt).run();
        // v152 duplicate game pools are separate pool_ids. Existing pools/tables are never rewritten.
        await DB.batch([
          DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'fee','11')").bind(p.id),
          DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'pot_contribution','11')").bind(p.id),
          DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'commissioner_email',?)").bind(p.id,email),
          DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'commissioner_player_name',?)").bind(p.id,playerName),
          DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'game_type',?)").bind(p.id,gameType),
          DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'active_games_exact',?)").bind(p.id,JSON.stringify(gameTypes))
        ]);
        await DB.prepare("UPDATE pool_active_games SET active=0,is_primary=0 WHERE pool_id=?").bind(p.id).run();
        await DB.batch(gameTypes.map((gt,i)=>DB.prepare("INSERT INTO pool_active_games(pool_id,game_type,is_primary,active,added_at) VALUES(?,?,?,1,?) ON CONFLICT(pool_id,game_type) DO UPDATE SET active=1,is_primary=excluded.is_primary,added_at=excluded.added_at").bind(p.id,gt,i===0?1:0,now)));
        // v534: seed automatic NFL lock deadlines when every new pool is created.
        // This makes a fresh pool behave like established pools immediately, while
        // later commissioner overrides can still replace the saved deadline.
        if(gameTypes.includes("nfl")){
          const lockRows=Object.entries(OFFICIAL_FIRST_KICKOFF_FALLBACK).map(([wk,lockTime])=>
            DB.prepare("INSERT INTO pool_week_meta(pool_id,sport,week,lock_time) VALUES(?,'nfl',?,?) ON CONFLICT(pool_id,sport,week) DO NOTHING").bind(p.id,Number(wk),lockTime)
          );
          if(lockRows.length)await DB.batch(lockRows);
        }
        await DB.prepare("INSERT OR REPLACE INTO pool_service(pool_id,plan,status,price_cents,paid_at,notes) VALUES(?,?,?,?,?,?)")
          .bind(p.id,createAccess.plan||'free',createAccess.plan==='free'?'FREE':'ACTIVE',createAccess.plan==='free'?0:(LINKS_PLANS[createAccess.plan]?.amount||0),createAccess.plan==='free'?null:now,createAccess.plan==='free'?'LINKS first pool free for life — ad supported':'LINKS commissioner package — ad free').run();
        const base=String(env.LINKS_BASE_URL||originOf(request)).replace(/\/$/,"");
        const commissionerWelcomeHtml=commissionerWelcomeEmailHtml({base,poolName:copyName,poolCode:code,games:gameTypes});
        const commissionerWelcomeResult=await sendLinksEmailDetailed(env,email,`Your Links pool is ready — ${copyName}`,commissionerWelcomeHtml);
        const commissionerWelcomeDelivery=await saveCommissionerWelcomeStatus(DB,p.id,email,commissionerWelcomeResult);
        if(!commissionerWelcomeResult.ok){allWelcomeOk=false;if(!firstWelcomeError)firstWelcomeError=commissionerWelcomeResult.error||"";}
        createdPools.push({code,name:copyName,poolId:p.id,token:await makeSession(DB,p.id,playerName,"admin"),commissionerWelcomeEmailSent:commissionerWelcomeResult.ok,commissionerWelcomeDelivery});
      }
      const first=createdPools[0];
      return json({ok:true,code:first.code,name:first.name,playerName,token:first.token,isCommissioner:true,gameType,games:gameTypes,createdPools,commissionerWelcomeEmailSent:allWelcomeOk,commissionerWelcomeEmailError:firstWelcomeError,service:{plan:createAccess.plan||"free",status:createAccess.plan==="free"?"FREE":"ACTIVE",adFree:!!createAccess.adFree}});
    }
    if(path==="login"&&method==="POST"){
      const pool=await poolByCode(DB,body.poolCode);if(!pool)return json({error:"Pool not found."},404);
      const p=await DB.prepare("SELECT * FROM pool_players WHERE pool_id=? AND name=?").bind(pool.id,body.name).first();
      if(!p||await hashPassword(body.password||"",p.salt)!==p.password_hash)return json({error:"Incorrect name or password."},401);
      const commissionerPlayer=await getCommissionerPlayerName(DB,pool.id),isCommissioner=!!commissionerPlayer&&commissionerPlayer.toLowerCase()===String(p.name).toLowerCase();
      // Login activity is telemetry only. Never block a player's sign-in if
      // an older production database is missing this table or its schema differs.
      try{
        const loginAt=new Date().toISOString();
        await DB.prepare("INSERT INTO pool_login_activity(pool_id,player_name,login_count,first_login_at,last_login_at) VALUES(?,?,1,?,?) ON CONFLICT(pool_id,player_name) DO UPDATE SET login_count=pool_login_activity.login_count+1,last_login_at=excluded.last_login_at")
          .bind(pool.id,p.name,loginAt,loginAt).run();
      }catch(e){}
      const token=await makeSession(DB,pool.id,p.name,isCommissioner?"admin":"player");
      const games=await getPoolGameTypes(DB,pool.id,pool.code);
      let access={adFree:false,commissionerPlan:"free"};
      try{access=await poolAccessFor(DB,pool.id)}catch(e){}
      return json({token,name:p.name,isCommissioner,poolCode:pool.code,poolName:pool.name,gameType:games[0]||"nfl",games,access});
    }
    if(path==="admin-login"&&method==="POST"){
      const pool=await poolByCode(DB,body.poolCode);if(!pool)return json({error:"Pool not found."},404);
      if(await hashPassword(body.password||"",pool.admin_salt)!==pool.admin_hash)return json({error:"Incorrect commissioner password."},401);
      return json({token:await makeSession(DB,pool.id,"Commissioner","admin"),poolCode:pool.code,poolName:pool.name,gameType:await getPoolGameType(DB,pool.id,pool.code),games:await getPoolGameTypes(DB,pool.id,pool.code),access:await poolAccessFor(DB,pool.id)});
    }
    if(path==="session"&&method==="GET"){
      const s=await auth(request,DB);if(!s)return json({error:"Session expired."},401);
      const p=await DB.prepare("SELECT code,name FROM pools WHERE id=?").bind(s.pool_id).first();return json({role:s.role,name:s.player_name,isCommissioner:s.role==="admin",poolCode:p.code,poolName:p.name,gameType:await getPoolGameType(DB,s.pool_id,p.code),games:await getPoolGameTypes(DB,s.pool_id,p.code),access:await poolAccessFor(DB,s.pool_id)});
    }
    if(path==="logout"&&method==="POST"){
      const h=request.headers.get("authorization")||"",t=h.startsWith("Bearer ")?h.slice(7):"";if(t)await DB.prepare("DELETE FROM pool_sessions WHERE token=?").bind(t).run();return json({ok:true});
    }
    const s=await auth(request,DB);if(!s)return json({error:"Please sign in."},401);
    const pid=s.pool_id,sport=sportOf(url.searchParams.get("sport")||body.sport),w=Number(url.searchParams.get("week")||body.week||1);

    if(path==="commissioner/dashboard"&&method==="GET"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const email=await poolCommissionerEmail(DB,pid);if(!email)return json({error:"Commissioner email is not set for this pool."},400);
      const ent=await commissionerEntitlement(DB,email),all=await commissionerPools(DB,email),launch=await entitlementLaunchAt(DB);
      const post=all.filter(x=>!launch||String(x.created_at||"")>=launch),limit=ent?Math.max(1,Number(ent.max_pools||1)):1,used=ent?post.length:Math.min(1,all.length);
      const current=await DB.prepare("SELECT code,name,created_at FROM pools WHERE id=?").bind(pid).first();
      const currentPool=current?{id:pid,code:current.code,name:current.name||current.code,gameType:await getPoolGameType(DB,pid,current.code),games:await getPoolGameTypes(DB,pid,current.code),grandfathered:!!launch&&String(current.created_at||"")<launch}:null;
      // v152: entitlement/capacity remains commissioner-email-wide to prevent free-tier abuse, but the in-pool commissioner dashboard exposes only the current pool.
      return json({email,plan:ent?.plan||"free",status:ent?"ACTIVE":"FREE FOR LIFE",limit,used,remaining:Math.max(0,limit-used),adFree:!!Number(ent?.ad_free||0),expiresAt:ent?.expires_at||null,currentPool});
    }
    if(path==="commissioner/switch-pool"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const currentEmail=await poolCommissionerEmail(DB,pid),target=await poolByCode(DB,body.code);if(!target)return json({error:"Pool not found."},404);
      const targetEmail=await poolCommissionerEmail(DB,target.id);if(!currentEmail||!targetEmail||currentEmail!==targetEmail)return json({error:"That pool is not under this commissioner account."},403);
      const commissionerName=await getCommissionerPlayerName(DB,target.id)||"Commissioner";return json({token:await makeSession(DB,target.id,commissionerName,"admin"),name:commissionerName,poolCode:target.code,poolName:target.name,gameType:await getPoolGameType(DB,target.id,target.code),games:await getPoolGameTypes(DB,target.id,target.code),access:await poolAccessFor(DB,target.id)});
    }


    if(path==="game-instances"&&method==="GET"){
      const gt=String(url.searchParams.get("gameType")||"").trim().toLowerCase();
      if(gt&&!VALID_POOL_GAMES.includes(gt))return json({error:"Unknown game type."},400);
      const instances=await listGameInstances(DB,pid,gt);
      return json({instances});
    }
    if(path==="admin/game-instance"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const action=String(body.action||"create").toLowerCase(),gt=String(body.gameType||"").trim().toLowerCase(),id=Number(body.id||0),now=new Date().toISOString();
      if(action==="create"){
        if(!VALID_POOL_GAMES.includes(gt))return json({error:"Choose a valid game type."},400);
        const active=await getPoolGameTypes(DB,pid);if(!active.includes(gt))return json({error:"Add this game type to the pool first."},400);
        const c=await DB.prepare("SELECT COUNT(*) n FROM game_instances WHERE pool_id=? AND game_type=? AND active=1").bind(pid,gt).first();
        const n=Number(c?.n||0)+1,name=String(body.name||"").trim().slice(0,80)||gameInstanceDefaultName(gt,n);
        const r=await DB.prepare("INSERT INTO game_instances(pool_id,game_type,name,sort_order,active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)").bind(pid,gt,name,n,now,now).run();
        return json({ok:true,id:r.meta?.last_row_id||0,instances:await listGameInstances(DB,pid,gt)});
      }
      const row=await DB.prepare("SELECT id,game_type FROM game_instances WHERE pool_id=? AND id=?").bind(pid,id).first();if(!row)return json({error:"Game tab not found."},404);
      if(action==="rename"){
        const name=String(body.name||"").trim().slice(0,80);if(!name)return json({error:"Enter a tab name."},400);
        await DB.prepare("UPDATE game_instances SET name=?,updated_at=? WHERE pool_id=? AND id=?").bind(name,now,pid,id).run();
      }else if(action==="archive"){
        const c=await DB.prepare("SELECT COUNT(*) n FROM game_instances WHERE pool_id=? AND game_type=? AND active=1").bind(pid,row.game_type).first();if(Number(c?.n||0)<=1)return json({error:"Keep at least one tab for this game type."},400);
        await DB.prepare("UPDATE game_instances SET active=0,updated_at=? WHERE pool_id=? AND id=?").bind(now,pid,id).run();
      }else return json({error:"Unknown game-tab action."},400);
      return json({ok:true,instances:await listGameInstances(DB,pid,row.game_type)});
    }

    if(path==="pool/games"&&method==="GET"){
      const p=await DB.prepare("SELECT code FROM pools WHERE id=?").bind(pid).first();
      const games=await getPoolGameTypes(DB,pid,p?.code||"");
      return json({games,gameType:games[0]||"nfl"});
    }
    if(path==="admin/pool-games"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      // Exact-list mode is used by the commissioner checkboxes. It only toggles the
      // active flag; it never deletes picks, players, payments, standings, assignments,
      // results, or game settings.
      if(Array.isArray(body.gameTypes)){
        let selected=[...new Set(body.gameTypes.map(x=>String(x||"").trim().toLowerCase()).filter(x=>VALID_POOL_GAMES.includes(x)))];
        if(!selected.length)return json({error:"Keep at least one game active in this pool."},400);
        const current=await getPoolGameTypes(DB,pid);const gameAccess=await canChangePoolGames(DB,pid,selected,current);if(!gameAccess.ok)return json({error:gameAccess.error,upgradeRequired:!!gameAccess.upgradeRequired},402);
        const pool=await DB.prepare("SELECT code FROM pools WHERE id=?").bind(pid).first();
        if(selected.includes("33")){
          const r=await DB.prepare("SELECT COUNT(*) AS n FROM pool_players WHERE pool_id=?").bind(pid).first();
          if(Number(r?.n||0)>32)return json({error:"Game 33 cannot be active in a pool with more than 32 players because there are only 32 NFL teams."},400);
        }
        const now=new Date().toISOString();
        const stm=[DB.prepare("UPDATE pool_active_games SET active=0,is_primary=0 WHERE pool_id=?").bind(pid)];
        selected.forEach((gt,i)=>stm.push(DB.prepare("INSERT INTO pool_active_games(pool_id,game_type,is_primary,active,added_at) VALUES(?,?,?,1,?) ON CONFLICT(pool_id,game_type) DO UPDATE SET active=1,is_primary=excluded.is_primary").bind(pid,gt,i===0?1:0,now)));
        stm.push(DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'game_type',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,selected[0]));
        stm.push(DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'active_games_exact',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,JSON.stringify(selected)));
        await DB.batch(stm);
        if(gameAccess.additions?.length&&gameAccess.email)await DB.batch(gameAccess.additions.map(gt=>DB.prepare("INSERT OR IGNORE INTO commissioner_game_additions(pool_id,game_type,email,added_at) VALUES(?,?,?,?)").bind(pid,gt,gameAccess.email,now)));
        // Return the exact list that was just saved.  Do not re-expand through a
        // legacy fallback in the same request.
        return json({ok:true,games:selected,gameType:selected[0]});
      }
      const gt=String(body.gameType||"").trim().toLowerCase();
      if(!VALID_POOL_GAMES.includes(gt))return json({error:"Choose a valid game to add."},400);
      const before=await getPoolGameTypes(DB,pid);
      if(before.includes(gt))return json({ok:true,alreadyAdded:true,games:before});
      const gameAccess=await canChangePoolGames(DB,pid,[...before,gt],before);if(!gameAccess.ok)return json({error:gameAccess.error,upgradeRequired:!!gameAccess.upgradeRequired},402);
      const games=await addPoolGame(DB,pid,gt);
      if(gameAccess.email)await DB.prepare("INSERT OR IGNORE INTO commissioner_game_additions(pool_id,game_type,email,added_at) VALUES(?,?,?,?)").bind(pid,gt,gameAccess.email,new Date().toISOString()).run();
      return json({ok:true,added:gt,games});
    }


    if(path==="dynasty/state"&&method==="GET"){
      const raw=await getPoolSetting(DB,pid,"game_settings_dynasty","{}");let settings={};try{settings=JSON.parse(raw||"{}")||{}}catch(e){}
      const teams=(await DB.prepare("SELECT * FROM dynasty_teams WHERE pool_id=? ORDER BY CASE WHEN draft_slot>0 THEN draft_slot ELSE 999 END,id").bind(pid).all()).results||[];
      const rosters=(await DB.prepare("SELECT * FROM dynasty_rosters WHERE pool_id=? ORDER BY team_id,position,player_name").bind(pid).all()).results||[];
      const matchups=(await DB.prepare("SELECT * FROM dynasty_matchups WHERE pool_id=? ORDER BY week,id").bind(pid).all()).results||[];
      const draft=(await DB.prepare("SELECT * FROM dynasty_draft_picks WHERE pool_id=? ORDER BY season,round,pick_no").bind(pid).all()).results||[];
      const trades=(await DB.prepare("SELECT * FROM dynasty_trades WHERE pool_id=? ORDER BY id DESC LIMIT 100").bind(pid).all()).results||[];
      const tx=(await DB.prepare("SELECT * FROM dynasty_transactions WHERE pool_id=? ORDER BY id DESC LIMIT 100").bind(pid).all()).results||[];
      const waivers=(await DB.prepare("SELECT * FROM dynasty_waiver_claims WHERE pool_id=? ORDER BY CASE status WHEN 'PENDING' THEN 0 ELSE 1 END,id DESC LIMIT 100").bind(pid).all()).results||[];
      const poolPlayers=(await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY name").bind(pid).all()).results.map(x=>x.name);
      const pendingInvites=Number((await DB.prepare("SELECT COUNT(*) AS n FROM pool_invites WHERE pool_id=? AND status='PENDING'").bind(pid).first())?.n||0);
      const tn=Object.fromEntries(teams.map(t=>[Number(t.id),t.name]));
      return json({settings,teams:teams.map(x=>({id:x.id,name:x.name,ownerName:x.owner_name||"",draftSlot:Number(x.draft_slot||0),cap:Number(x.cap||100)})),rosters:rosters.map(x=>({id:x.id,teamId:x.team_id,playerName:x.player_name,position:x.position,nflTeam:x.nfl_team||"",salary:Number(x.salary||0),contractYears:Number(x.contract_years||1),contractYear:Number(x.contract_year||1),acquisition:x.acquisition||"ROSTER",status:x.status||"ACTIVE",lineupSlot:x.lineup_slot||"BENCH"})),matchups:matchups.map(x=>({id:x.id,week:x.week,homeTeamId:x.home_team_id,awayTeamId:x.away_team_id,homeScore:Number(x.home_score||0),awayScore:Number(x.away_score||0),status:x.status||"OPEN"})),draft,trades:trades.map(x=>({...x,fromTeamName:tn[Number(x.from_team_id)]||"Team",toTeamName:tn[Number(x.to_team_id)]||"Team",details:`Offer: ${x.offer_text||"—"} • Request: ${x.request_text||"—"}`})),transactions:tx,waivers:waivers.map(x=>({id:x.id,teamId:x.team_id,teamName:tn[Number(x.team_id)]||"Team",playerName:x.player_name,position:x.position,nflTeam:x.nfl_team||"",salary:Number(x.salary||0),contractYears:Number(x.contract_years||1),status:x.status||"PENDING",requestedBy:x.requested_by||"",createdAt:x.created_at||""})),poolPlayers,pendingInvites});
    }
    if(path==="dynasty/settings"&&method==="POST"){if(s.role!=="admin")return json({error:"Commissioner only."},403);const clean={leagueName:String(body.leagueName||"").slice(0,100),salaryCap:Number(body.salaryCap||100),rosterSize:Number(body.rosterSize||25),maxContractYears:Number(body.maxContractYears||5),scoring:String(body.scoring||"half_ppr"),draftType:String(body.draftType||"snake"),rookieRounds:Number(body.rookieRounds||4),playoffTeams:Number(body.playoffTeams||6),currentWeek:Number(body.currentWeek||1),tradeApproval:body.tradeApproval!==false,rfaEnabled:body.rfaEnabled!==false,franchiseEnabled:body.franchiseEnabled!==false};await setPoolSetting(DB,pid,"game_settings_dynasty",JSON.stringify(clean));return json({ok:true,settings:clean})}
    if(path==="dynasty/generate-schedule"&&method==="POST"){if(s.role!=="admin")return json({error:"Commissioner only."},403);let teams=(await DB.prepare("SELECT id FROM dynasty_teams WHERE pool_id=? ORDER BY CASE WHEN draft_slot>0 THEN draft_slot ELSE 999 END,id").bind(pid).all()).results||[];if(teams.length<2)return json({error:"Create at least two franchises first."},400);let ids=teams.map(x=>Number(x.id));if(ids.length%2)ids.push(null);const rounds=ids.length-1,half=ids.length/2;await DB.prepare("DELETE FROM dynasty_matchups WHERE pool_id=?").bind(pid).run();const stmts=[];const weeks=Math.min(18,Math.max(1,Number(body.weeks||rounds)));for(let w=1;w<=weeks;w++){const rw=(w-1)%rounds;let a=[...ids];for(let i=0;i<rw;i++)a=[a[0],a[a.length-1],...a.slice(1,-1)];for(let i=0;i<half;i++){const h=a[i],v=a[a.length-1-i];if(h&&v)stmts.push(DB.prepare("INSERT INTO dynasty_matchups(pool_id,week,home_team_id,away_team_id,home_score,away_score,status) VALUES(?,?,?,?,0,0,'OPEN')").bind(pid,w,(w%2?h:v),(w%2?v:h)))}}if(stmts.length)await DB.batch(stmts);return json({ok:true,count:stmts.length})}
    if(path==="dynasty/matchup"&&method==="POST"){if(s.role!=="admin")return json({error:"Commissioner only."},403);await DB.prepare("UPDATE dynasty_matchups SET home_score=?,away_score=?,status=? WHERE pool_id=? AND id=?").bind(Number(body.homeScore||0),Number(body.awayScore||0),String(body.status||"FINAL"),pid,Number(body.id)).run();return json({ok:true})}
    if(path==="dynasty/team"&&method==="POST"){if(s.role!=="admin")return json({error:"Commissioner only."},403);const name=String(body.name||"").trim().slice(0,80);if(!name)return json({error:"Enter a team name."},400);await DB.prepare("INSERT INTO dynasty_teams(pool_id,name,owner_name,draft_slot,cap,created_at) VALUES(?,?,?,?,?,?)").bind(pid,name,String(body.ownerName||"").trim(),Number(body.draftSlot||0),Number(body.cap||100),new Date().toISOString()).run();return json({ok:true})}
    if(path==="dynasty/commissioner-franchise"&&method==="POST"){if(s.role!=="admin")return json({error:"Commissioner only."},403);const owner=String(s.player_name||"").trim();if(!owner)return json({error:"Commissioner player name is missing. Sign in through the pool player account first."},400);const existing=await DB.prepare("SELECT id,name FROM dynasty_teams WHERE pool_id=? AND lower(owner_name)=lower(?) LIMIT 1").bind(pid,owner).first();if(existing)return json({ok:true,alreadyOwned:true,team:existing});const teamId=Number(body.teamId||0);if(teamId){const t=await DB.prepare("SELECT id,name,owner_name FROM dynasty_teams WHERE pool_id=? AND id=?").bind(pid,teamId).first();if(!t)return json({error:"Franchise not found."},404);if(String(t.owner_name||"").trim())return json({error:"That franchise already has an owner."},400);await DB.prepare("UPDATE dynasty_teams SET owner_name=? WHERE pool_id=? AND id=?").bind(owner,pid,teamId).run();return json({ok:true,claimed:true,teamId})}const name=String(body.name||"").trim().slice(0,80);if(!name)return json({error:"Enter your franchise name."},400);const dup=await DB.prepare("SELECT id FROM dynasty_teams WHERE pool_id=? AND lower(name)=lower(?)").bind(pid,name).first();if(dup)return json({error:"That franchise name is already in use."},400);let raw=await getPoolSetting(DB,pid,"game_settings_dynasty","{}");let settings={};try{settings=JSON.parse(raw||"{}")||{}}catch(e){};await DB.prepare("INSERT INTO dynasty_teams(pool_id,name,owner_name,draft_slot,cap,created_at) VALUES(?,?,?,0,?,?)").bind(pid,name,owner,Number(settings.salaryCap||100),new Date().toISOString()).run();return json({ok:true,created:true})}
    if(path==="dynasty/roster"&&method==="POST"){if(s.role!=="admin")return json({error:"Commissioner only."},403);const teamId=Number(body.teamId),name=String(body.playerName||"").trim();if(!teamId||!name)return json({error:"Choose a team and enter a player."},400);await DB.prepare("INSERT INTO dynasty_rosters(pool_id,team_id,player_name,position,nfl_team,salary,contract_years,contract_year,acquisition,status,lineup_slot,created_at) VALUES(?,?,?,?,?,?,?,?,?,'ACTIVE','BENCH',?)").bind(pid,teamId,name,String(body.position||"FLEX").toUpperCase(),String(body.nflTeam||"").toUpperCase(),Number(body.salary||0),Math.max(1,Number(body.contractYears||1)),1,String(body.acquisition||"ROSTER"),new Date().toISOString()).run();await DB.prepare("INSERT INTO dynasty_transactions(pool_id,team_id,action,player_name,details,created_at) VALUES(?,?,'ADD',?,?,?)").bind(pid,teamId,name,`Salary $${Number(body.salary||0).toFixed(2)} • ${Math.max(1,Number(body.contractYears||1))} yrs`,new Date().toISOString()).run();return json({ok:true})}
    if(path==="dynasty/contract"&&method==="POST"){if(s.role!=="admin")return json({error:"Commissioner only."},403);const id=Number(body.id);await DB.prepare("UPDATE dynasty_rosters SET salary=?,contract_years=?,contract_year=?,status=? WHERE pool_id=? AND id=?").bind(Number(body.salary||0),Math.max(1,Number(body.contractYears||1)),Math.max(1,Number(body.contractYear||1)),String(body.status||"ACTIVE"),pid,id).run();return json({ok:true})}
    if(path==="dynasty/draft-pick"&&method==="POST"){if(s.role!=="admin")return json({error:"Commissioner only."},403);const season=Number(body.season||currentFootballSeason()),round=Number(body.round||1),pick=Number(body.pickNo||1),teamId=Number(body.teamId||0)||null;await DB.prepare("INSERT INTO dynasty_draft_picks(pool_id,season,round,pick_no,team_id,player_name,position,nfl_team,salary,contract_years,made_at) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(pool_id,season,round,pick_no) DO UPDATE SET team_id=excluded.team_id,player_name=excluded.player_name,position=excluded.position,nfl_team=excluded.nfl_team,salary=excluded.salary,contract_years=excluded.contract_years,made_at=excluded.made_at").bind(pid,season,round,pick,teamId,String(body.playerName||""),String(body.position||""),String(body.nflTeam||""),Number(body.salary||0),Math.max(1,Number(body.contractYears||1)),new Date().toISOString()).run();if(teamId&&String(body.playerName||"").trim())try{await DB.prepare("INSERT INTO dynasty_rosters(pool_id,team_id,player_name,position,nfl_team,salary,contract_years,contract_year,acquisition,status,lineup_slot,created_at) VALUES(?,?,?,?,?,?,?,?,?,'ACTIVE','BENCH',?)").bind(pid,teamId,String(body.playerName).trim(),String(body.position||"FLEX").toUpperCase(),String(body.nflTeam||"").toUpperCase(),Number(body.salary||0),Math.max(1,Number(body.contractYears||1)),1,"DRAFT",new Date().toISOString()).run()}catch(e){}return json({ok:true})}
    if(path==="dynasty/trade"&&method==="POST"){const owner=String(s.player_name||"").trim();const mine=await DB.prepare("SELECT id FROM dynasty_teams WHERE pool_id=? AND lower(owner_name)=lower(?) LIMIT 1").bind(pid,owner).first();if(!mine)return json({error:"You do not have a Dynasty franchise yet."},400);const from=Number(mine.id),to=Number(body.toTeamId);if(!to||from===to)return json({error:"Choose a different franchise to trade with."},400);await DB.prepare("INSERT INTO dynasty_trades(pool_id,from_team_id,to_team_id,offer_text,request_text,status,created_by,created_at) VALUES(?,?,?,?,?,'PENDING',?,?)").bind(pid,from,to,String(body.offerText||"").slice(0,800),String(body.requestText||"").slice(0,800),owner||"Commissioner",new Date().toISOString()).run();return json({ok:true})}
    if(path==="dynasty/trade-status"&&method==="POST"){if(s.role!=="admin")return json({error:"Commissioner only."},403);await DB.prepare("UPDATE dynasty_trades SET status=?,updated_at=? WHERE pool_id=? AND id=?").bind(String(body.status||"PENDING").toUpperCase(),new Date().toISOString(),pid,Number(body.id)).run();return json({ok:true})}
    if(path==="dynasty/lineup"&&method==="POST"){
      const id=Number(body.id),slot=String(body.lineupSlot||"BENCH").toUpperCase();
      const row=await DB.prepare("SELECT r.team_id,t.owner_name FROM dynasty_rosters r JOIN dynasty_teams t ON t.id=r.team_id AND t.pool_id=r.pool_id WHERE r.pool_id=? AND r.id=?").bind(pid,id).first();
      if(!row)return json({error:"Player not found."},404);
      const owns=String(row.owner_name||"").toLowerCase()===String(s.player_name||"").toLowerCase();
      if(s.role!=="admin"&&!owns)return json({error:"You can only set your own lineup."},403);
      const allowed=new Set(["QB","RB","WR","TE","FLEX","K","DEF","BENCH","IR","TAXI"]);if(!allowed.has(slot))return json({error:"Invalid lineup slot."},400);
      await DB.prepare("UPDATE dynasty_rosters SET lineup_slot=? WHERE pool_id=? AND id=?").bind(slot,pid,id).run();return json({ok:true});
    }
    if(path==="dynasty/drop"&&method==="POST"){
      const id=Number(body.id);const row=await DB.prepare("SELECT r.*,t.owner_name FROM dynasty_rosters r JOIN dynasty_teams t ON t.id=r.team_id AND t.pool_id=r.pool_id WHERE r.pool_id=? AND r.id=?").bind(pid,id).first();
      if(!row)return json({error:"Player not found."},404);const owns=String(row.owner_name||"").toLowerCase()===String(s.player_name||"").toLowerCase();if(s.role!=="admin"&&!owns)return json({error:"You can only drop players from your own team."},403);
      await DB.prepare("DELETE FROM dynasty_rosters WHERE pool_id=? AND id=?").bind(pid,id).run();await DB.prepare("INSERT INTO dynasty_transactions(pool_id,team_id,action,player_name,details,created_at) VALUES(?,?,'DROP',?,?,?)").bind(pid,row.team_id,row.player_name,`Released from roster • previous salary $${Number(row.salary||0).toFixed(2)}`,new Date().toISOString()).run();return json({ok:true});
    }
    if(path==="dynasty/waiver"&&method==="POST"){
      const teamId=Number(body.teamId),name=String(body.playerName||"").trim();if(!teamId||!name)return json({error:"Choose a franchise and enter a player."},400);
      const team=await DB.prepare("SELECT * FROM dynasty_teams WHERE pool_id=? AND id=?").bind(pid,teamId).first();if(!team)return json({error:"Franchise not found."},404);const owns=String(team.owner_name||"").toLowerCase()===String(s.player_name||"").toLowerCase();if(!owns)return json({error:"Waiver and free-agent claims can only be submitted for your own franchise. Use Commissioner Direct Add to administer another team."},403);
      const exists=await DB.prepare("SELECT id FROM dynasty_rosters WHERE pool_id=? AND lower(player_name)=lower(?)").bind(pid,name).first();if(exists)return json({error:"That player is already rostered."},400);
      const pending=await DB.prepare("SELECT id FROM dynasty_waiver_claims WHERE pool_id=? AND team_id=? AND lower(player_name)=lower(?) AND status='PENDING'").bind(pid,teamId,name).first();if(pending)return json({error:"That claim is already pending."},400);
      await DB.prepare("INSERT INTO dynasty_waiver_claims(pool_id,team_id,player_name,position,nfl_team,salary,contract_years,status,requested_by,created_at) VALUES(?,?,?,?,?,?,?,'PENDING',?,?)").bind(pid,teamId,name,String(body.position||"FLEX").toUpperCase(),String(body.nflTeam||"").toUpperCase(),Number(body.salary||0),Math.max(1,Number(body.contractYears||1)),s.player_name||"Commissioner",new Date().toISOString()).run();return json({ok:true});
    }
    if(path==="dynasty/waiver-status"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);const id=Number(body.id),status=String(body.status||"").toUpperCase();if(!["APPROVED","REJECTED"].includes(status))return json({error:"Invalid claim status."},400);
      const c=await DB.prepare("SELECT * FROM dynasty_waiver_claims WHERE pool_id=? AND id=?").bind(pid,id).first();if(!c)return json({error:"Claim not found."},404);if(String(c.status)!=="PENDING")return json({error:"Claim has already been processed."},400);
      if(status==="APPROVED"){
        const raw=await getPoolSetting(DB,pid,"game_settings_dynasty","{}");let settings={};try{settings=JSON.parse(raw||"{}")||{}}catch(e){}
        const rows=(await DB.prepare("SELECT salary FROM dynasty_rosters WHERE pool_id=? AND team_id=?").bind(pid,c.team_id).all()).results||[];const spent=rows.reduce((a,r)=>a+Number(r.salary||0),0),cap=Number(settings.salaryCap||100),rosterSize=Number(settings.rosterSize||25);
        if(rows.length>=rosterSize)return json({error:"Roster is full. Drop a player first."},400);if(spent+Number(c.salary||0)>cap)return json({error:"This claim would put the franchise over the salary cap."},400);
        const exists=await DB.prepare("SELECT id FROM dynasty_rosters WHERE pool_id=? AND lower(player_name)=lower(?)").bind(pid,c.player_name).first();if(exists)return json({error:"Player is already rostered. Reject this claim or resolve the duplicate."},400);
        await DB.prepare("INSERT INTO dynasty_rosters(pool_id,team_id,player_name,position,nfl_team,salary,contract_years,contract_year,acquisition,status,lineup_slot,created_at) VALUES(?,?,?,?,?,?,?,?,?,'ACTIVE','BENCH',?)").bind(pid,c.team_id,c.player_name,c.position,c.nfl_team||"",Number(c.salary||0),Math.max(1,Number(c.contract_years||1)),1,"WAIVER",new Date().toISOString()).run();
        await DB.prepare("INSERT INTO dynasty_transactions(pool_id,team_id,action,player_name,details,created_at) VALUES(?,?,'WAIVER ADD',?,?,?)").bind(pid,c.team_id,c.player_name,`Claim approved • salary $${Number(c.salary||0).toFixed(2)} • ${Math.max(1,Number(c.contract_years||1))} yrs`,new Date().toISOString()).run();
      }
      await DB.prepare("UPDATE dynasty_waiver_claims SET status=?,updated_at=? WHERE pool_id=? AND id=?").bind(status,new Date().toISOString(),pid,id).run();return json({ok:true});
    }
    if(path==="dynasty/rollover"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);const rows=(await DB.prepare("SELECT * FROM dynasty_rosters WHERE pool_id=?").bind(pid).all()).results||[];let expired=0,advanced=0;const stmts=[];
      for(const r of rows){const y=Math.max(1,Number(r.contract_year||1)),total=Math.max(1,Number(r.contract_years||1));if(y>=total){expired++;stmts.push(DB.prepare("DELETE FROM dynasty_rosters WHERE pool_id=? AND id=?").bind(pid,r.id));stmts.push(DB.prepare("INSERT INTO dynasty_transactions(pool_id,team_id,action,player_name,details,created_at) VALUES(?,?,'CONTRACT EXPIRED',?,?,?)").bind(pid,r.team_id,r.player_name,`Completed ${total}-year contract`,new Date().toISOString()))}else{advanced++;stmts.push(DB.prepare("UPDATE dynasty_rosters SET contract_year=? WHERE pool_id=? AND id=?").bind(y+1,pid,r.id))}}
      if(stmts.length)await DB.batch(stmts);return json({ok:true,expired,advanced});
    }
    if(path==="fantasy/state"&&method==="GET"){
      const teams=(await DB.prepare("SELECT id,name,owner_name,draft_slot FROM fantasy_teams WHERE pool_id=? ORDER BY CASE WHEN draft_slot>0 THEN draft_slot ELSE 999 END,name").bind(pid).all()).results||[];
      const rosters=(await DB.prepare("SELECT id,team_id,player_name,position,nfl_team,lineup_slot FROM fantasy_rosters WHERE pool_id=? ORDER BY team_id,CASE lineup_slot WHEN 'QB' THEN 1 WHEN 'RB' THEN 2 WHEN 'WR' THEN 3 WHEN 'TE' THEN 4 WHEN 'FLEX' THEN 5 WHEN 'K' THEN 6 WHEN 'DEF' THEN 7 ELSE 8 END,player_name").bind(pid).all()).results||[];
      const matchups=(await DB.prepare("SELECT id,week,home_team_id,away_team_id,home_score,away_score,status FROM fantasy_matchups WHERE pool_id=? ORDER BY week,id").bind(pid).all()).results||[];
      const poolPlayers=s.role==="admin"?((await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY name").bind(pid).all()).results||[]):[];
      const raw=await getPoolSetting(DB,pid,"game_settings_fantasy","{}");let settings={};try{settings=JSON.parse(raw||"{}")||{}}catch(e){}
      const currentWeek=Math.max(1,Math.min(18,Number(settings.currentWeek||1)||1));
      const weeklyStats=(await DB.prepare("SELECT roster_id,fantasy_points,stat_json,game_status,updated_at FROM fantasy_weekly_stats WHERE pool_id=? AND week=?").bind(pid,currentWeek).all()).results||[];
      const sync=await DB.prepare("SELECT provider,status,games_synced,players_matched,updated_at,message FROM fantasy_sync_log WHERE pool_id=? AND week=?").bind(pid,currentWeek).first();
      return json({currentWeek,settings,autoScoringReady:fantasyProviderConfig(env).ready,sync:sync||null,teams:teams.map(x=>({id:x.id,name:x.name,ownerName:x.owner_name||"",draftSlot:x.draft_slot||0})),rosters:rosters.map(x=>{const ws=weeklyStats.find(w=>Number(w.roster_id)===Number(x.id));let statLine={};try{statLine=JSON.parse(ws?.stat_json||"{}")||{}}catch(e){}return {id:x.id,teamId:x.team_id,playerName:x.player_name,position:x.position,nflTeam:x.nfl_team||"",lineupSlot:x.lineup_slot||"BENCH",weekPoints:Number(ws?.fantasy_points||0),statLine,gameStatus:ws?.game_status||""}}),matchups:matchups.map(x=>({id:x.id,week:x.week,homeTeamId:x.home_team_id,awayTeamId:x.away_team_id,homeScore:Number(x.home_score||0),awayScore:Number(x.away_score||0),status:x.status||"OPEN"})),poolPlayers});
    }
    if(path==="fantasy/sync"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const raw=await getPoolSetting(DB,pid,"game_settings_fantasy","{}");let settings={};try{settings=JSON.parse(raw||"{}")||{}}catch(e){}
      const week=Math.max(1,Math.min(18,Number(body.week||settings.currentWeek||1)||1));
      try{return json({ok:true,...await syncFantasyWeek(DB,env,pid,week,settings)})}catch(e){return json({error:String(e?.message||e)},503)}
    }
    if(path==="fantasy/team"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const name=String(body.name||"").trim().slice(0,80),owner=String(body.ownerName||"").trim().slice(0,80);if(!name)return json({error:"Enter a fantasy team name."},400);
      if(owner){const p=await DB.prepare("SELECT 1 ok FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)").bind(pid,owner).first();if(!p)return json({error:"Choose an owner who is already a player in this LINKS pool."},400)}
      const count=await DB.prepare("SELECT COUNT(*) n FROM fantasy_teams WHERE pool_id=?").bind(pid).first();if(Number(count?.n||0)>=14)return json({error:"Fantasy leagues are limited to 14 teams in this version."},400);
      try{await DB.prepare("INSERT INTO fantasy_teams(pool_id,name,owner_name,draft_slot,created_at) VALUES(?,?,?,?,?)").bind(pid,name,owner,Number(body.draftSlot||0)||0,new Date().toISOString()).run()}catch(e){return json({error:"That fantasy team name already exists in this pool."},400)}
      return json({ok:true});
    }
    if(path==="fantasy/roster"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const teamId=Number(body.teamId||0),playerName=String(body.playerName||"").trim().slice(0,100),position=String(body.position||"").trim().toUpperCase(),nflTeam=String(body.nflTeam||"").trim().slice(0,40).toUpperCase();
      if(!teamId||!playerName||!["QB","RB","WR","TE","K","DEF"].includes(position))return json({error:"Choose a team and enter a valid drafted player and position."},400);
      const team=await DB.prepare("SELECT id FROM fantasy_teams WHERE pool_id=? AND id=?").bind(pid,teamId).first();if(!team)return json({error:"Fantasy team not found."},404);
      const owned=await DB.prepare("SELECT t.name team_name FROM fantasy_rosters r JOIN fantasy_teams t ON t.id=r.team_id WHERE r.pool_id=? AND lower(r.player_name)=lower(?) LIMIT 1").bind(pid,playerName).first();if(owned)return json({error:`${playerName} is already on ${owned.team_name}. A fantasy player can only be on one roster in this league.`},400);
      try{await DB.prepare("INSERT INTO fantasy_rosters(pool_id,team_id,player_name,position,nfl_team,lineup_slot,created_at) VALUES(?,?,?,?,?,'BENCH',?)").bind(pid,teamId,playerName,position,nflTeam,new Date().toISOString()).run()}catch(e){return json({error:"That player is already on this fantasy roster."},400)}
      return json({ok:true});
    }
    if(path==="fantasy/lineup"&&method==="POST"){
      const rosterId=Number(body.rosterId||0),slot=String(body.lineupSlot||"BENCH").toUpperCase();if(!["QB","RB","WR","TE","FLEX","K","DEF","BENCH"].includes(slot))return json({error:"Invalid lineup slot."},400);
      const r=await DB.prepare("SELECT r.id,r.team_id,t.owner_name FROM fantasy_rosters r JOIN fantasy_teams t ON t.id=r.team_id WHERE r.pool_id=? AND r.id=?").bind(pid,rosterId).first();if(!r)return json({error:"Fantasy player not found."},404);
      if(s.role!=="admin"&&String(r.owner_name||"").toLowerCase()!==String(s.player_name||"").toLowerCase())return json({error:"You can only set the lineup for your own fantasy team."},403);
      await DB.prepare("UPDATE fantasy_rosters SET lineup_slot=? WHERE pool_id=? AND id=?").bind(slot,pid,rosterId).run();return json({ok:true});
    }
    if(path==="fantasy/generate-schedule"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      let teams=(await DB.prepare("SELECT id FROM fantasy_teams WHERE pool_id=? ORDER BY CASE WHEN draft_slot>0 THEN draft_slot ELSE 999 END,id").bind(pid).all()).results||[];if(teams.length<2)return json({error:"Create at least two fantasy teams first."},400);
      let ids=teams.map(x=>Number(x.id));if(ids.length%2)ids.push(null);const rounds=ids.length-1,half=ids.length/2,arr=[...ids];await DB.prepare("DELETE FROM fantasy_matchups WHERE pool_id=?").bind(pid).run();
      const stmts=[];for(let w=1;w<=Math.min(18,Math.max(1,Number(body.weeks||rounds)||rounds));w++){const rw=(w-1)%rounds;let a=[...ids];for(let i=0;i<rw;i++)a=[a[0],a[a.length-1],...a.slice(1,-1)];for(let i=0;i<half;i++){const h=a[i],v=a[a.length-1-i];if(h&&v)stmts.push(DB.prepare("INSERT INTO fantasy_matchups(pool_id,week,home_team_id,away_team_id,home_score,away_score,status) VALUES(?,?,?,?,0,0,'OPEN')").bind(pid,w,(w%2?h:v),(w%2?v:h)))}}
      if(stmts.length)await DB.batch(stmts);return json({ok:true,weeks:Math.min(18,Math.max(1,Number(body.weeks||rounds)||rounds)),matchups:stmts.length});
    }
    if(path==="fantasy/matchup"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);const id=Number(body.id||0),hs=Number(body.homeScore||0),as=Number(body.awayScore||0),status=String(body.status||"FINAL").toUpperCase()==="FINAL"?"FINAL":"OPEN";
      const m=await DB.prepare("SELECT id FROM fantasy_matchups WHERE pool_id=? AND id=?").bind(pid,id).first();if(!m)return json({error:"Fantasy matchup not found."},404);await DB.prepare("UPDATE fantasy_matchups SET home_score=?,away_score=?,status=? WHERE pool_id=? AND id=?").bind(Number.isFinite(hs)?hs:0,Number.isFinite(as)?as:0,status,pid,id).run();return json({ok:true});
    }

    async function autoScoreSpecialNFLV394(gt,settings={}){
      if(!["survivor","confidence","playoff"].includes(gt))return;
      const rows=(await DB.prepare("SELECT player_name,period_key,entry_json FROM special_game_period_entries WHERE pool_id=? AND game_type=? ORDER BY CAST(period_key AS INTEGER),player_name").bind(pid,gt).all()).results||[];
      if(!rows.length)return;
      const byPlayer=new Map(),weeks=[...new Set(rows.map(r=>Math.max(1,Math.min(22,Number(r.period_key||1)))))],feeds=new Map();
      for(const w of weeks)feeds.set(w,await fetchNFLWeek(w));
      for(const r of rows){let e={};try{e=JSON.parse(r.entry_json||"{}")||{}}catch(x){}if(!byPlayer.has(r.player_name))byPlayer.set(r.player_name,[]);byPlayer.get(r.player_name).push({week:Number(r.period_key),entry:e})}
      const now=new Date().toISOString(),lives=Math.max(1,Number(settings.lives||1));
      for(const [player,periods] of byPlayer){
        let score=0,status="OPEN",losses=0,graded=0,total=0,detail={periods:[]};
        for(const p of periods){const games=feeds.get(p.week)||[],finals=games.filter(g=>g.completed&&g.winner),byId=new Map(finals.map((g,i)=>[String(g.eventId||g.id||(g.gameIndex??i)),g.winner])),byIndex=new Map(finals.map((g,i)=>[Number(g.gameIndex??i),g.winner]));
          if(gt==="survivor"){const team=String(p.entry.team||""),game=games.find(g=>g.away===team||g.home===team);let result="PENDING";if(game?.completed){graded++;if(game.winner===team){score++;result="WIN"}else{losses++;result="LOSS"}}detail.periods.push({week:p.week,team,result})}
          else{const picks=Array.isArray(p.entry.picks)?p.entry.picks:[];let periodScore=0,periodGraded=0;total+=picks.length;for(const x of picks){const win=byId.get(String(x.eventId||""))||byIndex.get(Number(x.gameIndex));if(!win)continue;periodGraded++;graded++;if(String(x.team)===String(win))periodScore+=gt==="confidence"?Math.max(0,Number(x.confidence||0)):Math.max(1,Number(settings[p.week===19?"wildCardPoints":p.week===20?"divisionalPoints":p.week===21?"conferencePoints":"superBowlPoints"]||1))}score+=periodScore;detail.periods.push({week:p.week,score:periodScore,graded:periodGraded,picks:picks.length})}
        }
        if(gt==="survivor"){status=losses>=lives?"ELIMINATED":"ALIVE";detail.losses=losses;detail.lives=lives}
        else status=total>0&&graded>=total?"FINAL":"OPEN";
        const ex=await DB.prepare("SELECT detail_json FROM special_game_scores WHERE pool_id=? AND game_type=? AND player_name=?").bind(pid,gt,player).first();let ed={};try{ed=JSON.parse(ex?.detail_json||"{}")||{}}catch(e){}if(ed.manualOverride)continue;
        await DB.prepare("INSERT INTO special_game_scores(pool_id,game_type,player_name,score,status,detail_json,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(pool_id,game_type,player_name) DO UPDATE SET score=excluded.score,status=excluded.status,detail_json=excluded.detail_json,updated_at=excluded.updated_at").bind(pid,gt,player,score,status,JSON.stringify(detail),now).run();
      }
    }
    async function autoScorePropsV386(settings){
      const answers=String(settings.officialAnswers||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
      if(!answers.length)return;
      const rows=(await DB.prepare("SELECT player_name,entry_json FROM special_game_entries WHERE pool_id=? AND game_type='props'").bind(pid).all()).results||[],pts=Math.max(0,Number(settings.pointsPerQuestion||1)),now=new Date().toISOString();
      for(const r of rows){const existing=await DB.prepare("SELECT detail_json FROM special_game_scores WHERE pool_id=? AND game_type='props' AND player_name=?").bind(pid,r.player_name).first();let existingDetail={};try{existingDetail=JSON.parse(existing?.detail_json||"{}")||{}}catch(e){}if(existingDetail.manualOverride)continue;let e={};try{e=JSON.parse(r.entry_json||"{}")||{}}catch(x){}const picks=Array.isArray(e.answers)?e.answers:String(e.answers||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);let correct=0;answers.forEach((a,i)=>{if(String(picks[i]||"").trim().toLowerCase()===a.toLowerCase())correct++});const score=correct*pts;await DB.prepare("INSERT INTO special_game_scores(pool_id,game_type,player_name,score,status,detail_json,updated_at) VALUES(?,'props',? ,?,'FINAL',?,?) ON CONFLICT(pool_id,game_type,player_name) DO UPDATE SET score=excluded.score,status='FINAL',detail_json=excluded.detail_json,updated_at=excluded.updated_at").bind(pid,r.player_name,score,JSON.stringify({correct,total:answers.length,pointsPerQuestion:pts}),now).run()}
    }
    async function fetchNascarResultsV388(settings){
      const id=String(settings.eventId||"").trim(),year=Number(settings.eventYear||new Date().getUTCFullYear());if(!id)return {event:null,results:[]};
      const events=await fetchNascarPoolEvents(year),base=events.find(x=>String(x.id)===id)||null;
      const j=await getJSON(`https://site.api.espn.com/apis/site/v2/sports/racing/nascar-premier/summary?event=${encodeURIComponent(id)}&_=${Date.now()}`);
      const c=j?.header?.competitions?.[0]||j?.event?.competitions?.[0]||null,raw=c?.competitors||j?.competitors||[];
      const results=(raw||[]).map((x,i)=>({id:String(x?.athlete?.id||x?.id||""),name:String(x?.athlete?.displayName||x?.athlete?.fullName||x?.displayName||x?.name||""),position:Number(x?.order||x?.place||x?.position||x?.status?.position?.id||i+1),points:Number(x?.statistics?.find?.(z=>/points/i.test(String(z.name||z.label||"")))?.value),winner:!!x?.winner})).filter(x=>x.name).sort((a,b)=>a.position-b.position);
      return {event:base,results};
    }
    async function autoScoreNascarV388(settings){
      if(String(settings.autoScore||"false")!=="true")return;
      const d=await fetchNascarResultsV388(settings);if(!d.results.length)return;
      const map=new Map(d.results.map(x=>[x.name.toLowerCase(),x])),rows=(await DB.prepare("SELECT player_name,entry_json FROM special_game_entries WHERE pool_id=? AND game_type='nascar'").bind(pid).all()).results||[],method=String(settings.scoringMethod||"finish"),now=new Date().toISOString(),final=/final|complete/i.test(String(d.event?.status||""));
      for(const r of rows){const existing=await DB.prepare("SELECT detail_json FROM special_game_scores WHERE pool_id=? AND game_type='nascar' AND player_name=?").bind(pid,r.player_name).first();let existingDetail={};try{existingDetail=JSON.parse(existing?.detail_json||"{}")||{}}catch(e){}if(existingDetail.manualOverride)continue;let e={};try{e=JSON.parse(r.entry_json||"{}")||{}}catch(x){}const chosen=(e.drivers||[]).map(n=>map.get(String(n).toLowerCase())).filter(Boolean);const score=chosen.reduce((t,x)=>t+(method==="points"&&Number.isFinite(x.points)?x.points:x.position),0);await DB.prepare("INSERT INTO special_game_scores(pool_id,game_type,player_name,score,status,detail_json,updated_at) VALUES(?,'nascar',?,?,?,?,?) ON CONFLICT(pool_id,game_type,player_name) DO UPDATE SET score=excluded.score,status=excluded.status,detail_json=excluded.detail_json,updated_at=excluded.updated_at").bind(pid,r.player_name,score,final?"FINAL":"OPEN",JSON.stringify({method,drivers:chosen}),now).run()}
    }
    async function fetchMastersLeaderboardV387(settings){
      const id=String(settings.eventId||"").trim();if(!id)return [];
      const j=await getJSON(`https://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard?tournamentId=${encodeURIComponent(id)}&_=${Date.now()}`);
      const ev=(j?.events||[])[0]||j?.event||j, comps=ev?.competitions?.[0]?.competitors||j?.leaderboard||[];
      return (comps||[]).map((x,i)=>({id:String(x?.athlete?.id||x?.id||""),name:String(x?.athlete?.displayName||x?.athlete?.fullName||x?.displayName||x?.name||""),score:Number(x?.score??x?.statistics?.find?.(z=>z.name==="score")?.value),position:Number(x?.status?.position?.id||x?.position||i+1),status:String(x?.status?.type?.description||x?.status||"")})).filter(x=>x.name);
    }
    async function autoScoreMastersV387(settings){
      if(String(settings.autoScore||"false")!=="true")return;
      const lb=await fetchMastersLeaderboardV387(settings);if(!lb.length)return;
      const map=new Map(lb.map(x=>[x.name.toLowerCase(),x])),rows=(await DB.prepare("SELECT player_name,entry_json FROM special_game_entries WHERE pool_id=? AND game_type='masters'").bind(pid).all()).results||[],count=Math.max(1,Number(settings.scoresCount||settings.lineupSize||4)),now=new Date().toISOString();
      for(const r of rows){const existing=await DB.prepare("SELECT detail_json FROM special_game_scores WHERE pool_id=? AND game_type='masters' AND player_name=?").bind(pid,r.player_name).first();let existingDetail={};try{existingDetail=JSON.parse(existing?.detail_json||"{}")||{}}catch(e){}if(existingDetail.manualOverride)continue;let e={};try{e=JSON.parse(r.entry_json||"{}")||{}}catch(x){}const chosen=(e.golfers||[]).map(n=>map.get(String(n).toLowerCase())).filter(Boolean).sort((a,b)=>a.position-b.position),used=chosen.slice(0,count),score=used.reduce((t,x)=>t+(Number.isFinite(x.score)?x.score:x.position),0);await DB.prepare("INSERT INTO special_game_scores(pool_id,game_type,player_name,score,status,detail_json,updated_at) VALUES(?,'masters',?,?, 'OPEN',?,?) ON CONFLICT(pool_id,game_type,player_name) DO UPDATE SET score=excluded.score,status=excluded.status,detail_json=excluded.detail_json,updated_at=excluded.updated_at").bind(pid,r.player_name,score,JSON.stringify({counted:used.map(x=>x.name),leaderboard:chosen}),now).run()}
    }
    if(path==="special/nfl-week"&&method==="GET"){
      const gt=String(url.searchParams.get("gameType")||"").trim().toLowerCase(),sw=Math.max(1,Math.min(22,Number(url.searchParams.get("week")||1)));
      if(!["survivor","confidence","playoff"].includes(gt))return json({error:"This game does not use the NFL weekly slate."},400);
      const games=await fetchNFLWeek(sw);
      return json({gameType:gt,week:sw,games});
    }
    if(path==="special/state"&&method==="GET"){
      const gt=String(url.searchParams.get("gameType")||"").trim().toLowerCase();
      if(!["survivor","confidence","props","playoff","masters","nascar"].includes(gt))return json({error:"Choose a supported game."},400);
      const raw=await getPoolSetting(DB,pid,`game_settings_${gt}`,"{}");let settings={};try{settings=JSON.parse(raw||"{}")||{}}catch(e){}
      if(["survivor","confidence","playoff"].includes(gt)){try{await autoScoreSpecialNFLV394(gt,settings)}catch(e){}}
      if(gt==="props"){try{await autoScorePropsV386(settings)}catch(e){}}
      if(gt==="masters"){try{await autoScoreMastersV387(settings)}catch(e){}}
      if(gt==="nascar"){try{await autoScoreNascarV388(settings)}catch(e){}}
      const entries=(await DB.prepare("SELECT player_name,entry_json,submitted_at FROM special_game_entries WHERE pool_id=? AND game_type=? ORDER BY player_name").bind(pid,gt).all()).results||[];
      let history=[];if(["survivor","confidence","playoff"].includes(gt)){history=(await DB.prepare("SELECT player_name,period_key,entry_json,submitted_at FROM special_game_period_entries WHERE pool_id=? AND game_type=? ORDER BY CAST(period_key AS INTEGER),player_name").bind(pid,gt).all()).results||[]}
      const scores=(await DB.prepare("SELECT player_name,score,status,detail_json,updated_at FROM special_game_scores WHERE pool_id=? AND game_type=? ORDER BY score DESC,player_name").bind(pid,gt).all()).results||[];
      const mine=entries.find(x=>String(x.player_name).toLowerCase()===String(s.player_name||"").toLowerCase());
      let myEntry={};try{myEntry=JSON.parse(mine?.entry_json||"{}")||{}}catch(e){}
      const publicEntries=entries.map(x=>{let entry={};try{entry=JSON.parse(x.entry_json||"{}")||{}}catch(e){}return {playerName:x.player_name,entry,submittedAt:x.submitted_at}});
      return json({gameType:gt,settings,myEntry,mySubmittedAt:mine?.submitted_at||null,entries:s.role==="admin"||String(settings.revealPicks||"").toLowerCase()==="true"?publicEntries:[],entryCount:entries.length,history:history.map(x=>{let entry={};try{entry=JSON.parse(x.entry_json||"{}")||{}}catch(e){}return {playerName:x.player_name,periodKey:x.period_key,entry,submittedAt:x.submitted_at}}),scores:scores.map(x=>{let detail={};try{detail=JSON.parse(x.detail_json||"{}")||{}}catch(e){}return {playerName:x.player_name,score:Number(x.score||0),status:x.status,updatedAt:x.updated_at,manualOverride:!!detail.manualOverride}})});
    }
    if(path==="special/entry"&&method==="POST"){
      const gt=String(body.gameType||"").trim().toLowerCase();
      if(!["survivor","confidence","props","playoff","masters","nascar"].includes(gt))return json({error:"Choose a supported game."},400);
      if(!sessionCanPlay(s))return json({error:"A player account is required to submit an entry."},403);
      const entry=body.entry&&typeof body.entry==="object"&&!Array.isArray(body.entry)?body.entry:{};
      const rawSettings=await getPoolSetting(DB,pid,`game_settings_${gt}`,"{}");let gameSettings={};try{gameSettings=JSON.parse(rawSettings||"{}")||{}}catch(e){}
      const lockRaw=String(gameSettings.lockTime||gameSettings.deadline||gameSettings.eventDate||"").trim();
      if(lockRaw&&Number.isFinite(Date.parse(lockRaw))&&Date.parse(lockRaw)<=Date.now())return json({error:"Entries are locked for this game."},409);
      if(gt==="props"){const questions=String(gameSettings.propQuestions||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean),a=Array.isArray(entry.answers)?entry.answers:[];if(questions.length&&a.length!==questions.length)return json({error:"Answer every prop question before saving."},400)}
      if(gt==="masters"){const max=Math.max(1,Number(gameSettings.lineupSize||6)),a=Array.isArray(entry.golfers)?entry.golfers:[];if(a.length!==max)return json({error:`Choose exactly ${max} golfers.`},400)}
      if(gt==="nascar"){const max=Math.max(1,Number(gameSettings.driversPerPlayer||1)),a=Array.isArray(entry.drivers)?entry.drivers:[];if(a.length!==max)return json({error:`Choose exactly ${max} drivers.`},400)}
      if(["survivor","confidence","playoff"].includes(gt)){
        const wk=Math.max(1,Math.min(22,Number(entry.week||1))),periodKey=String(wk);
        if(gt==="survivor"&&String(gameSettings.noReuse||"true")!=="false"){
          const old=(await DB.prepare("SELECT entry_json FROM special_game_period_entries WHERE pool_id=? AND game_type='survivor' AND player_name=? AND period_key<>?").bind(pid,s.player_name,periodKey).all()).results||[];
          const used=old.map(x=>{try{return String(JSON.parse(x.entry_json||"{}").team||"")}catch(e){return ""}}).filter(Boolean);
          if(used.includes(String(entry.team||"")))return json({error:"You already used that team in Survivor. Choose a different team."},409);
        }
        if(gt==="confidence"){
          const picks=Array.isArray(entry.picks)?entry.picks:[],games=await fetchNFLWeek(wk),vals=picks.map(x=>Number(x.confidence));
          if(picks.length!==games.length||picks.some(x=>!x.team))return json({error:"Pick every NFL game before saving your Confidence entry."},400);
          if(vals.some(x=>!Number.isInteger(x)||x<1||x>picks.length)||new Set(vals).size!==vals.length)return json({error:`Use each confidence number 1 through ${picks.length} exactly once.`},400);
        }
        await DB.prepare("INSERT INTO special_game_period_entries(pool_id,game_type,player_name,period_key,entry_json,submitted_at) VALUES(?,?,?,?,?,?) ON CONFLICT(pool_id,game_type,player_name,period_key) DO UPDATE SET entry_json=excluded.entry_json,submitted_at=excluded.submitted_at").bind(pid,gt,s.player_name,periodKey,JSON.stringify(entry),new Date().toISOString()).run();
      }
      const payload=JSON.stringify(entry);if(payload.length>50000)return json({error:"Entry is too large."},400);
      await DB.prepare("INSERT INTO special_game_entries(pool_id,game_type,player_name,entry_json,submitted_at) VALUES(?,?,?,?,?) ON CONFLICT(pool_id,game_type,player_name) DO UPDATE SET entry_json=excluded.entry_json,submitted_at=excluded.submitted_at").bind(pid,gt,s.player_name,payload,new Date().toISOString()).run();
      return json({ok:true});
    }
    if(path==="admin/special-score"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const gt=String(body.gameType||"").trim().toLowerCase(),player=String(body.playerName||"").trim(),score=Number(body.score||0),status=String(body.status||"FINAL").toUpperCase();
      if(!["survivor","confidence","props","playoff","masters","nascar"].includes(gt)||!player||!Number.isFinite(score))return json({error:"Game, player and score are required."},400);
      await DB.prepare("INSERT INTO special_game_scores(pool_id,game_type,player_name,score,status,detail_json,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(pool_id,game_type,player_name) DO UPDATE SET score=excluded.score,status=excluded.status,detail_json=excluded.detail_json,updated_at=excluded.updated_at").bind(pid,gt,player,score,status,JSON.stringify({manualOverride:true}),new Date().toISOString()).run();
      return json({ok:true});
    }
    if(path==="admin/special-score-auto"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const gt=String(body.gameType||"").trim().toLowerCase(),player=String(body.playerName||"").trim();
      if(!["survivor","confidence","props","playoff","masters","nascar"].includes(gt)||!player)return json({error:"Game and player are required."},400);
      const row=await DB.prepare("SELECT detail_json FROM special_game_scores WHERE pool_id=? AND game_type=? AND player_name=?").bind(pid,gt,player).first();let d={};try{d=JSON.parse(row?.detail_json||"{}")||{}}catch(e){}delete d.manualOverride;
      await DB.prepare("UPDATE special_game_scores SET detail_json=?,updated_at=? WHERE pool_id=? AND game_type=? AND player_name=?").bind(JSON.stringify(d),new Date().toISOString(),pid,gt,player).run();
      return json({ok:true,auto:true});
    }

    if(path==="game-settings"&&method==="GET"){
      const gt=String(url.searchParams.get("gameType")||"").trim().toLowerCase();
      if(!VALID_POOL_GAMES.includes(gt))return json({error:"Choose a valid game."},400);
      const raw=await getPoolSetting(DB,pid,`game_settings_${gt}`,"{}");
      let settings={};try{settings=JSON.parse(raw||"{}")||{}}catch(e){settings={}}
      return json({gameType:gt,settings});
    }
    if(path==="nascar/results"&&method==="GET"){
      const raw=await getPoolSetting(DB,pid,"game_settings_nascar","{}");let settings={};try{settings=JSON.parse(raw||"{}")||{}}catch(e){}
      return json(await fetchNascarResultsV388(settings));
    }
    if(path==="nascar/events"&&method==="GET"){
      const year=Number(url.searchParams.get("year")||new Date().getUTCFullYear());
      const events=await fetchNascarPoolEvents(year);
      return json({year,events});
    }
    if(path==="masters/leaderboard"&&method==="GET"){
      const raw=await getPoolSetting(DB,pid,"game_settings_masters","{}");let settings={};try{settings=JSON.parse(raw||"{}")||{}}catch(e){}
      return json({eventId:settings.eventId||"",eventName:settings.eventName||"",leaderboard:await fetchMastersLeaderboardV387(settings)});
    }
    if(path==="masters/setup"&&method==="GET"){
      const year=Number(url.searchParams.get("year")||new Date().getUTCFullYear());
      return json(await fetchMastersPoolData(year));
    }

    if(path==="admin/game-settings"&&method==="GET"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const gt=String(url.searchParams.get("gameType")||"").trim().toLowerCase();
      if(!VALID_POOL_GAMES.includes(gt))return json({error:"Choose a valid game."},400);
      const raw=await getPoolSetting(DB,pid,`game_settings_${gt}`,"{}");
      let settings={};try{settings=JSON.parse(raw||"{}")||{}}catch(e){settings={}}
      return json({gameType:gt,settings});
    }
    if(path==="admin/game-settings"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const gt=String(body.gameType||"").trim().toLowerCase();
      if(!VALID_POOL_GAMES.includes(gt))return json({error:"Choose a valid game."},400);
      const incoming=body.settings&&typeof body.settings==="object"&&!Array.isArray(body.settings)?body.settings:{};
      const clean={};
      for(const [k,v] of Object.entries(incoming).slice(0,40)){
        const key=String(k).replace(/[^a-zA-Z0-9_-]/g,"").slice(0,60);if(!key)continue;
        if(typeof v==="boolean")clean[key]=v;
        else if(typeof v==="number"&&Number.isFinite(v))clean[key]=v;
        else clean[key]=String(v??"").slice(0,16000);
      }
      await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,?,?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value")
        .bind(pid,`game_settings_${gt}`,JSON.stringify(clean)).run();
      return json({ok:true,gameType:gt,settings:clean});
    }

    if(path==="squares/schedule"&&method==="GET"){
      const sw=Math.max(1,Math.min(22,Number(url.searchParams.get("week")||1)));
      const games=await fetchNFLWeek(sw);
      return json({week:sw,games});
    }
    if(path==="squares/state"&&method==="GET"){
      return json(await squaresState(DB,pid,s.player_name,s.role));
    }
    if(path==="squares/boards"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const sw=Math.max(1,Math.min(22,Number(body.week||1))),eventId=String(body.eventId||"").trim();
      const games=await fetchNFLWeek(sw),g=games.find(x=>String(x.id||x.eventId||"")===eventId);
      if(!g)return json({error:"Choose a valid NFL game."},400);
      const price=Math.max(0,Number(body.price||0)),q1=Math.max(0,Number(body.payoutQ1||0)),half=Math.max(0,Number(body.payoutHalf||0)),q3=Math.max(0,Number(body.payoutQ3||0)),fin=Math.max(0,Number(body.payoutFinal||0));
      const title=String(body.title||`${g.awayName||g.away} vs ${g.homeName||g.home} Squares`).trim().slice(0,100);
      const r=await DB.prepare("INSERT INTO squares_boards(pool_id,title,event_id,week,away,home,away_name,home_name,kickoff,price,payout_q1,payout_half,payout_q3,payout_final,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,\'OPEN\',?)")
        .bind(pid,title,eventId,sw,g.away,g.home,g.awayName||g.away,g.homeName||g.home,g.kickoff||null,price,q1,half,q3,fin,new Date().toISOString()).run();
      return json({ok:true,id:r.meta?.last_row_id||null});
    }
    if(path==="squares/claim"&&method==="POST"){
      const boardId=Number(body.boardId),idx=Number(body.squareIndex);
      if(!Number.isInteger(idx)||idx<0||idx>99)return json({error:"Choose a valid square."},400);
      const b=await DB.prepare("SELECT * FROM squares_boards WHERE id=? AND pool_id=?").bind(boardId,pid).first();if(!b)return json({error:"Board not found."},404);
      if(String(b.status)!=="OPEN"||numArray(b.numbers_away).length)return json({error:"This board is closed for square selection."},409);
      let player=s.role==="admin"?String(body.playerName||"").trim():s.player_name;
      if(!player)return json({error:"Choose a player."},400);
      const ex=await DB.prepare("SELECT 1 ok FROM pool_players WHERE pool_id=? AND name=?").bind(pid,player).first();if(!ex)return json({error:"Player not found in this pool."},400);
      try{await DB.prepare("INSERT INTO squares_claims(board_id,square_index,player_name,paid,claimed_at) VALUES(?,?,?,0,?)").bind(boardId,idx,player,new Date().toISOString()).run()}
      catch(e){return json({error:"That square has already been claimed."},409)}
      return json({ok:true});
    }
    if(path==="squares/unclaim"&&method==="POST"){
      const boardId=Number(body.boardId),idx=Number(body.squareIndex);
      const b=await DB.prepare("SELECT * FROM squares_boards WHERE id=? AND pool_id=?").bind(boardId,pid).first();if(!b)return json({error:"Board not found."},404);
      if(numArray(b.numbers_away).length)return json({error:"Numbers have already been drawn."},409);
      const c=await DB.prepare("SELECT player_name FROM squares_claims WHERE board_id=? AND square_index=?").bind(boardId,idx).first();
      if(!c)return json({ok:true});if(s.role!=="admin"&&c.player_name!==s.player_name)return json({error:"You can only release your own square."},403);
      await DB.prepare("DELETE FROM squares_claims WHERE board_id=? AND square_index=?").bind(boardId,idx).run();return json({ok:true});
    }
    if(path==="squares/draw"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const boardId=Number(body.boardId),b=await DB.prepare("SELECT * FROM squares_boards WHERE id=? AND pool_id=?").bind(boardId,pid).first();if(!b)return json({error:"Board not found."},404);
      if(numArray(b.numbers_away).length)return json({error:"Numbers are already locked for this board."},409);
      const away=shuffledDigits(),home=shuffledDigits();
      await DB.prepare("UPDATE squares_boards SET numbers_away=?,numbers_home=?,status='LOCKED' WHERE id=? AND pool_id=?").bind(JSON.stringify(away),JSON.stringify(home),boardId,pid).run();
      return json({ok:true,awayNums:away,homeNums:home});
    }
    if(path==="squares/paid"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      await DB.prepare("UPDATE squares_claims SET paid=? WHERE board_id=? AND square_index=?").bind(body.paid?1:0,Number(body.boardId),Number(body.squareIndex)).run();return json({ok:true});
    }
    if(path==="squares/delete"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const id=Number(body.boardId);await DB.prepare("DELETE FROM squares_claims WHERE board_id=?").bind(id).run();await DB.prepare("DELETE FROM squares_results WHERE board_id=?").bind(id).run();await DB.prepare("DELETE FROM squares_boards WHERE id=? AND pool_id=?").bind(id,pid).run();return json({ok:true});
    }

    if(path==="march/state"&&method==="GET"){
      await marchAutoSync(DB,pid,false);
      return json(await marchState(DB,pid,s.player_name,s.role));
    }
    if(path==="march/sync"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      return json(await marchAutoSync(DB,pid,true));
    }
    if(path==="march/deadline"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const lt=String(body.lockTime||"");if(!lt||!Number.isFinite(Date.parse(lt)))return json({error:"Set a valid bracket deadline."},400);
      await DB.prepare("INSERT INTO march_config(pool_id,lock_time,updated_at) VALUES(?,?,?) ON CONFLICT(pool_id) DO UPDATE SET lock_time=excluded.lock_time,updated_at=excluded.updated_at").bind(pid,new Date(lt).toISOString(),new Date().toISOString()).run();
      return json({ok:true});
    }
    if(path==="march/config"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const teams=Array.isArray(body.teams)?body.teams:[];if(teams.length!==64)return json({error:"The tournament field must contain exactly 64 teams."},400);
      const clean=teams.map((t,i)=>({slot:i,seed:Number(t.seed),team:String(t.team||"").trim(),region:String(t.region||"").trim()}));
      if(clean.some(t=>!t.team||!(t.seed>=1&&t.seed<=16)||!t.region))return json({error:"Every team needs a name, seed and region."},400);
      const lt=String(body.lockTime||"");if(!lt||!Number.isFinite(Date.parse(lt)))return json({error:"Set a valid bracket deadline."},400);
      await DB.batch([DB.prepare("DELETE FROM march_teams WHERE pool_id=?").bind(pid),DB.prepare("DELETE FROM march_picks WHERE pool_id=?").bind(pid),DB.prepare("DELETE FROM march_ties WHERE pool_id=?").bind(pid),DB.prepare("DELETE FROM march_results WHERE pool_id=?").bind(pid)]);
      const stmts=clean.map(t=>DB.prepare("INSERT INTO march_teams(pool_id,slot,seed,team,region) VALUES(?,?,?,?,?)").bind(pid,t.slot,t.seed,t.team,t.region));
      if(stmts.length)await DB.batch(stmts);
      await DB.prepare("INSERT INTO march_config(pool_id,lock_time,updated_at) VALUES(?,?,?) ON CONFLICT(pool_id) DO UPDATE SET lock_time=excluded.lock_time,updated_at=excluded.updated_at").bind(pid,new Date(lt).toISOString(),new Date().toISOString()).run();
      return json({ok:true});
    }
    if(path==="march/picks"&&method==="POST"){
      if(!sessionCanPlay(s))return json({error:"Player only."},403);
      const cfg=await DB.prepare("SELECT lock_time FROM march_config WHERE pool_id=?").bind(pid).first();if(!cfg?.lock_time)return json({error:"The commissioner has not opened the March Madness bracket yet."},400);if(Date.now()>=Date.parse(cfg.lock_time))return json({error:"The March Madness bracket is locked."},409);
      const field=await DB.prepare("SELECT COUNT(*) AS n FROM march_teams WHERE pool_id=?").bind(pid).first();if(Number(field?.n)!==64)return json({error:"The tournament field is not ready yet."},400);
      const picks=body.picks&&typeof body.picks==="object"?body.picks:{};if(!marchValidBracket(picks,false))return json({error:"One or more bracket picks do not match the teams you advanced in the previous round."},400);
      const guess=Number(body.tie);if(!Number.isFinite(guess)||guess<0||guess>300)return json({error:"Enter a championship total-score tiebreaker between 0 and 300."},400);
      await DB.prepare("DELETE FROM march_picks WHERE pool_id=? AND player_name=?").bind(pid,s.player_name).run();
      const stmts=Object.entries(picks).map(([g,sl])=>DB.prepare("INSERT INTO march_picks(pool_id,player_name,game_id,team_slot) VALUES(?,?,?,?)").bind(pid,s.player_name,Number(g),Number(sl)));if(stmts.length)await DB.batch(stmts);
      await DB.prepare("INSERT INTO march_ties(pool_id,player_name,guess) VALUES(?,?,?) ON CONFLICT(pool_id,player_name) DO UPDATE SET guess=excluded.guess").bind(pid,s.player_name,guess).run();
      return json({ok:true,saved:Object.keys(picks).length});
    }
    if(path==="march/results"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const results=body.results&&typeof body.results==="object"?body.results:{};if(!marchValidBracket(results,false))return json({error:"One or more results do not match the tournament bracket path."},400);
      await DB.prepare("DELETE FROM march_results WHERE pool_id=?").bind(pid).run();const stmts=Object.entries(results).map(([g,sl])=>DB.prepare("INSERT INTO march_results(pool_id,game_id,team_slot) VALUES(?,?,?)").bind(pid,Number(g),Number(sl)));if(stmts.length)await DB.batch(stmts);return json({ok:true});
    }

    if(path==="rules"&&method==="GET"){
      return json({rules:await getPoolRules(DB,pid),commissionerEmail:await getCommissionerEmail(DB,pid)});
    }

    if(path==="admin/transfer-commissioner"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      if(body.confirm!==true)return json({error:"Transfer confirmation is required."},400);
      const target=String(body.playerName||"").trim();
      if(!target)return json({error:"Choose a player to become commissioner."},400);
      const row=await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)").bind(pid,target).first();
      if(!row)return json({error:"That player is not in this pool."},404);
      if(String(row.name).toLowerCase()===String(s.player_name||"").toLowerCase())return json({error:"You are already the commissioner."},400);
      await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'commissioner_player_name',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,row.name).run();
      // Demote all current commissioner sessions, then promote any active sessions for the new commissioner.
      await DB.prepare("UPDATE pool_sessions SET role='player' WHERE pool_id=? AND role='admin'").bind(pid).run();
      await DB.prepare("UPDATE pool_sessions SET role='admin' WHERE pool_id=? AND lower(player_name)=lower(?)").bind(pid,row.name).run();
      const pool=await DB.prepare("SELECT code FROM pools WHERE id=?").bind(pid).first();
      const games=await getPoolGameTypes(DB,pid,pool?.code||"");
      return json({ok:true,commissionerPlayerName:row.name,games,gameType:games[0]||"nfl"});
    }

    if(path==="admin/player"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const name=String(body.name||"").trim(),pw=String(body.password||""),email=String(body.email||"").trim().toLowerCase(),phone=String(body.phone||"").trim();
      if(!name)return json({error:"Enter a player name."},400);
      if(pw&&pw.length<4)return json({error:"If you use a temporary password, use at least 4 characters."},400);
      try{await game33PlayerLimitCheck(DB,pid,1)}catch(e){return json({error:e.message},409)}
      const exists=await DB.prepare("SELECT 1 AS ok FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)").bind(pid,name).first();
      if(exists)return json({error:"That player name already exists in this pool."},409);
      const salt=newSalt(),initialPassword=pw||crypto.randomUUID()+crypto.randomUUID(),hash=await hashPassword(initialPassword,salt);
      await DB.prepare("INSERT INTO pool_players(pool_id,name,password_hash,salt) VALUES(?,?,?,?)").bind(pid,name,hash,salt).run();
      if(email||phone)await DB.prepare("INSERT INTO pool_player_contacts(pool_id,player_name,email,phone) VALUES(?,?,?,?) ON CONFLICT(pool_id,player_name) DO UPDATE SET email=excluded.email,phone=excluded.phone").bind(pid,name,email,phone).run();
      return json({ok:true});
    }
    if(path==="admin/player"&&method==="PATCH"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const oldName=String(body.oldName||"").trim(),newName=String(body.newName||oldName).trim(),pw=String(body.password||"");
      if(!oldName||!newName)return json({error:"Player name is required."},400);
      const row=await DB.prepare("SELECT * FROM pool_players WHERE pool_id=? AND name=?").bind(pid,oldName).first();if(!row)return json({error:"Player not found."},404);
      if(newName!==oldName){const dup=await DB.prepare("SELECT 1 AS ok FROM pool_players WHERE pool_id=? AND lower(name)=lower(?) AND name<>?").bind(pid,newName,oldName).first();if(dup)return json({error:"That player name already exists."},409);}
      if(pw){if(pw.length<4)return json({error:"Use at least 4 characters for the new password."},400);const salt=newSalt(),hash=await hashPassword(pw,salt);await DB.prepare("UPDATE pool_players SET name=?,salt=?,password_hash=? WHERE pool_id=? AND name=?").bind(newName,salt,hash,pid,oldName).run();}
      else await DB.prepare("UPDATE pool_players SET name=? WHERE pool_id=? AND name=?").bind(newName,pid,oldName).run();
      if(newName!==oldName){
        for(const t of ["pool_picks","pool_ties","pool_payments","pool_33_entries","pool_33_assignments","march_picks","march_ties","pool_player_contacts"])try{await DB.prepare(`UPDATE ${t} SET player_name=? WHERE pool_id=? AND player_name=?`).bind(newName,pid,oldName).run()}catch(e){}
        const commissionerPlayer=await getCommissionerPlayerName(DB,pid);
        if(commissionerPlayer&&commissionerPlayer.toLowerCase()===oldName.toLowerCase())await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'commissioner_player_name',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,newName).run();
        await DB.prepare("DELETE FROM pool_sessions WHERE pool_id=? AND player_name=?").bind(pid,oldName).run();
      }
      return json({ok:true});
    }
    if(path==="admin/player"&&method==="DELETE"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const name=String(body.name||"").trim();if(!name)return json({error:"Choose a player."},400);
      const commissionerPlayer=await getCommissionerPlayerName(DB,pid);
      if(commissionerPlayer&&commissionerPlayer.toLowerCase()===name.toLowerCase())return json({error:"Transfer commissioner duties to another player before deleting the commissioner."},409);
      try{await DB.prepare("DELETE FROM pool_player_setup_invites WHERE pool_id=? AND player_name=?").bind(pid,name).run()}catch(e){}
      try{await DB.prepare("DELETE FROM pool_player_contacts WHERE pool_id=? AND player_name=?").bind(pid,name).run()}catch(e){}
      for(const t of ["pool_picks","pool_ties","pool_payments","pool_33_entries","pool_33_assignments","march_picks","march_ties","pool_sessions","pool_players"])try{await DB.prepare(`DELETE FROM ${t} WHERE pool_id=? AND ${t==="pool_players"?"name":"player_name"}=?`).bind(pid,name).run()}catch(e){}
      return json({ok:true});
    }
    if(path==="admin/player-contact"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const player=String(body.player||"").trim(),email=String(body.email||"").trim().toLowerCase(),phone=String(body.phone||"").trim();
      if(!player)return json({error:"Choose a player."},400);
      if(email&&!/^\S+@\S+\.\S+$/.test(email))return json({error:"Check the email address."},400);
      const exists=await DB.prepare("SELECT 1 AS ok FROM pool_players WHERE pool_id=? AND name=?").bind(pid,player).first();if(!exists)return json({error:"Player not found in this pool."},404);
      await DB.prepare("INSERT INTO pool_player_contacts(pool_id,player_name,email,phone) VALUES(?,?,?,?) ON CONFLICT(pool_id,player_name) DO UPDATE SET email=excluded.email,phone=excluded.phone").bind(pid,player,email,phone).run();
      return json({ok:true,player,email,phone});
    }

    if(path==="admin/player-setup-invite"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const player=String(body.player||"").trim(),email=String(body.email||"").trim().toLowerCase(),phone=String(body.phone||"").trim(),delivery=String(body.delivery||"email").toLowerCase();
      if(!player)return json({error:"Choose a player."},400);
      if(delivery!=="text"&&!/^\S+@\S+\.\S+$/.test(email))return json({error:"Enter a valid email address for this player."},400);
      if(delivery==="text"&&!phone)return json({error:"Enter a phone number for this player."},400);
      const exists=await DB.prepare("SELECT 1 AS ok FROM pool_players WHERE pool_id=? AND name=?").bind(pid,player).first();
      if(!exists)return json({error:"Player not found in this pool."},404);
      const pool=await DB.prepare("SELECT code,name FROM pools WHERE id=?").bind(pid).first();
      await DB.prepare("INSERT INTO pool_player_contacts(pool_id,player_name,email,phone) VALUES(?,?,?,?) ON CONFLICT(pool_id,player_name) DO UPDATE SET email=CASE WHEN excluded.email<>'' THEN excluded.email ELSE pool_player_contacts.email END,phone=CASE WHEN excluded.phone<>'' THEN excluded.phone ELSE pool_player_contacts.phone END").bind(pid,player,email,phone).run();
      const setupToken=crypto.randomUUID()+crypto.randomUUID().replaceAll("-","");
      await DB.prepare("INSERT INTO pool_player_setup_invites(token,pool_id,player_name,email,status,created_at) VALUES(?,?,?,?,'PENDING',?)").bind(setupToken,pid,player,email,new Date().toISOString()).run();
      const origin=String(env.LINKS_BASE_URL||originOf(request)).replace(/\/+$/,""),setupUrl=`${origin}/join?setup=${encodeURIComponent(setupToken)}`;
      let sent=false;
      if(delivery!=="text"&&email&&linksEmailConfig(env).configured){
        const html=linksEmailShell(origin,`Your player spot is ready — ${pool.name}`,`
          <div style="text-align:center;padding:4px 0 8px">
            <div style="display:inline-block;background:#ff5f17;color:#fff;font-size:12px;font-weight:900;letter-spacing:1.4px;padding:7px 12px;border-radius:999px">PLAYER PASSWORD SETUP</div>
            <h1 style="margin:14px 0 8px;color:#fff;font-size:28px;line-height:1.15">You're already in the pool.<br><span style="color:#ff7a2b">Now make the login yours.</span></h1>
            <p style="margin:0 auto;color:#c8d2d9;font-size:15px;line-height:1.6;max-width:520px">Hi <b style="color:#fff">${emailEscape(player)}</b> — your commissioner has your existing player spot ready in <b style="color:#fff">${emailEscape(pool.name)}</b>.</p>
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-collapse:separate;border-spacing:0;background:#0b1218;border:1px solid #34434e;border-radius:14px;overflow:hidden">
            <tr><td style="padding:16px 18px;border-bottom:1px solid #26343e"><div style="font-size:11px;color:#93a2ad;letter-spacing:1.2px;font-weight:800">POOL</div><div style="font-size:21px;color:#fff;font-weight:900;margin-top:3px">${emailEscape(pool.name)}</div></td><td style="padding:16px 18px;border-bottom:1px solid #26343e"><div style="font-size:11px;color:#93a2ad;letter-spacing:1.2px;font-weight:800">POOL CODE</div><div style="font-size:21px;color:#ff7a2b;font-weight:900;letter-spacing:1px;margin-top:3px">${emailEscape(pool.code)}</div></td></tr>
          </table>
          <div style="margin:20px 0;padding:18px;background:linear-gradient(135deg,#15232c,#10171d);border:1px solid #394a55;border-left:5px solid #ff5f17;border-radius:12px">
            <div style="font-size:15px;color:#fff;font-weight:900;margin-bottom:8px">🔒 YOUR PICKS STAY EXACTLY WHERE THEY ARE</div>
            <div style="color:#c8d2d9;font-size:14px;line-height:1.65">Choosing your password does <b style="color:#fff">not</b> create a second player. Your existing picks, ACTIVE / PENDING access status, standings, assignments and pool history stay attached to <b style="color:#fff">${emailEscape(player)}</b>.</div>
          </div>
          <div style="margin:20px 0;padding:18px;background:#0d151b;border:1px solid #2c3b45;border-radius:12px">
            <div style="color:#ff8b3d;font-weight:900;font-size:14px;margin-bottom:9px">WHAT TO DO</div>
            <div style="color:#d6dee3;line-height:1.8;font-size:14px"><b style="color:#fff">1.</b> Tap the button below.<br><b style="color:#fff">2.</b> Create the password you want to use for this pool.<br><b style="color:#fff">3.</b> Sign in and keep playing from your existing player spot.</div>
          </div>
          <p style="text-align:center;margin:26px 0 18px"><a href="${setupUrl}" style="display:inline-block;background:#ff5f17;color:#fff;padding:16px 34px;border-radius:10px;text-decoration:none;font-size:16px;font-weight:900;letter-spacing:.4px;box-shadow:0 8px 24px rgba(255,95,23,.25)">CHOOSE MY PASSWORD</a></p>
          <p style="text-align:center;color:#95a3ad;font-size:12px;line-height:1.5;margin:0 0 6px">For your security, this private setup link can be used one time.</p>
          <p style="text-align:center;color:#c8d2d9;font-size:13px;margin:16px 0 0"><b style="color:#fff">LINKS PICKEM POOLS</b><br><span style="color:#ff8b3d">YOU PICK • WE TRACK • YOU WIN</span></p>`);
        const sendResult=await sendLinksEmailDetailed(env,email,`Choose your Links password — ${pool.name}`,html);sent=sendResult.ok;var sendError=sendResult.error||"";
      } else var sendError=delivery==="text"?"":(email?"Email service is not configured: RESEND_API_KEY is missing in Cloudflare.":"");
      try{await DB.prepare("UPDATE pool_player_setup_invites SET email_sent=? WHERE token=?").bind(sent?1:0,setupToken).run()}catch(e){}
      return json({ok:true,sent,url:setupUrl,player,email,error:sendError||""});
    }

    if(path==="admin/text-invite"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const raw=Array.isArray(body.phones)?body.phones.join(","):String(body.phones||"");
      const phones=[...new Set(raw.split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean))].slice(0,25);
      if(!phones.length)return json({error:"Enter at least one phone number."},400);
      const pool=await DB.prepare("SELECT code,name FROM pools WHERE id=?").bind(pid).first();
      const origin=String(env.LINKS_BASE_URL||originOf(request)).replace(/\/+$/,"");const invites=[];
      for(const phone of phones){const inviteToken=crypto.randomUUID()+crypto.randomUUID().replaceAll("-","");await DB.prepare("INSERT INTO pool_invites(token,pool_id,email,status,created_at) VALUES(?,?,?,'PENDING',?)").bind(inviteToken,pid,"",new Date().toISOString()).run();invites.push({phone,url:`${origin}/join?invite=${encodeURIComponent(inviteToken)}`});}
      return json({ok:true,poolName:pool?.name||"Links Pool",invites});
    }

    if(path==="admin/invite"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const raw=Array.isArray(body.emails)?body.emails.join(","):String(body.emails||"");
      const emails=[...new Set(raw.split(/[\s,;]+/).map(x=>x.trim().toLowerCase()).filter(Boolean))].slice(0,25);
      if(!emails.length)return json({error:"Enter at least one email address."},400);
      const bad=emails.find(x=>!/^\S+@\S+\.\S+$/.test(x));if(bad)return json({error:`Check this email address: ${bad}`},400);
      const pool=await DB.prepare("SELECT code,name FROM pools WHERE id=?").bind(pid).first();
      const rules=await getPoolRules(DB,pid),commissionerEmail=await getCommissionerEmail(DB,pid);
      const inviteGames=await getPoolGameTypes(DB,pid,pool?.code||"");
      const inviteGameNames=inviteGames.map(gt=>({nfl:"NFL Pick’em",college:"College Pick’em",march:"March Madness","33":"Game 33",squares:"Football Squares",survivor:"NFL Survivor",confidence:"Confidence Pool",props:"Super Bowl Props",playoff:"NFL Playoff Challenge",masters:"Masters Golf Pool",nascar:"NASCAR Pool",fantasy:"Fantasy Football",dynasty:"Dynasty Fantasy Football"}[gt]||gt));
      const origin=String(env.LINKS_BASE_URL||originOf(request)).replace(/\/+$/,""),configured=linksEmailConfig(env).configured,invites=[];let sent=0;
      for(const email of emails){
        const inviteToken=crypto.randomUUID()+crypto.randomUUID().replaceAll("-","");
        await DB.prepare("INSERT INTO pool_invites(token,pool_id,email,status,created_at) VALUES(?,?,?,'PENDING',?)").bind(inviteToken,pid,email,new Date().toISOString()).run();
        const inviteUrl=`${origin}/join?invite=${encodeURIComponent(inviteToken)}`;let didSend=false;
        if(configured){
          const inviteHtml=linksEmailShell(origin,`You're invited to ${pool.name}`,`
            <p>Your commissioner invited you to join <b>${emailEscape(pool.name)}</b> on <b>Links Pickem Pools</b>.</p>
            ${inviteGames.includes("dynasty")?`<div style="margin:14px 0;padding:14px;background:#101820;border-left:4px solid #f45b18;border-radius:8px"><b style="color:#ff8b3d">DYNASTY FRANCHISE INVITE</b><br><span style="color:#c9d2d8">Click the join button, create your player login, choose your own franchise/team name, and LINKS will make you the owner automatically.</span></div>`:""}
            <div style="margin:16px 0;padding:16px;background:#182129;border:1px solid #33434f;border-radius:10px">
              <div style="font-size:12px;color:#9fabb4">POOL CODE</div><div style="font-size:25px;font-weight:900;letter-spacing:2px">${emailEscape(pool.code)}</div>
              <div style="margin-top:10px;color:#c9d2d8"><b>Games in this pool:</b> ${emailEscape(inviteGameNames.join(" • "))}</div>
            </div>
            <p style="text-align:center;margin:20px 0"><a href="${inviteUrl}" style="display:inline-block;background:#f45b18;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold">${inviteGames.includes("dynasty")?"JOIN DYNASTY LEAGUE":"JOIN THIS POOL"}</a></p>
            <div style="margin:18px 0;padding:15px;background:#182129;border-radius:10px"><b style="color:#ff8b3d">HOW LINKS WORKS</b><ul style="line-height:1.7;padding-left:20px"><li>Use your private invite button to enter the correct pool.</li><li>Create your own player name and password.</li><li>You will only see the games your commissioner has activated for this pool.</li><li>Make and save your picks before each game or pool deadline.</li><li>Links tracks picks, scores, standings and results automatically where supported.</li><li>Your commissioner manages rules, ACTIVE / PENDING player access, and winner settings.</li></ul></div>
            <div style="margin:18px 0;padding:15px;background:#101820;border-left:4px solid #f45b18;border-radius:8px"><b>LINKS IS FREE TO USE</b><br><span style="color:#c9d2d8">No subscription or per-player Links fee. Pool money stays between the commissioner and players. Links does not collect the entry pot or take a percentage.</span></div>
            ${rulesEmailBlock(rules)}
            ${commissionerEmail?`<p><b>Questions about your pool?</b> Contact your commissioner at <a href="mailto:${emailEscape(commissionerEmail)}" style="color:#ff9a58">${emailEscape(commissionerEmail)}</a>.</p>`:""}
            <p style="text-align:center;margin-top:22px"><a href="${origin}" style="display:inline-block;border:1px solid #f45b18;color:#ff9a58;padding:11px 18px;border-radius:8px;text-decoration:none;font-weight:bold">OPEN LINKS PICKEM POOLS</a></p>
          `);
          const sendResult=await sendLinksEmailDetailed(env,email,`You're invited to ${pool.name} on Links`,inviteHtml);didSend=sendResult.ok;var inviteError=sendResult.error||"";if(didSend)sent++;
        } else var inviteError="Email service is not configured: RESEND_API_KEY is missing in Cloudflare.";
        invites.push({email,url:inviteUrl,sent:didSend,error:inviteError||""});
      }
      return json({ok:true,emailConfigured:configured,sent,invites});
    }

    if(path==="33"&&method==="GET"){
      return json(await game33Data(DB,pid,Math.max(1,Math.min(18,w)),s.player_name));
    }
    if(path==="33/default-week"&&method==="GET"){
      return json({week:await game33DefaultWeek(DB,pid),maxWeek:18});
    }
    if(path==="33/random-draw"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const st=await DB.prepare("SELECT draw_locked FROM pool_33_state WHERE pool_id=?").bind(pid).first();
      if(Number(st?.draw_locked||0)===1)return json({error:"The yearly 33 draw is already locked. Teams stay the same all 18 weeks."},409);
      const players=(await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid").bind(pid).all()).results.map(x=>x.name);
      if(!players.length)return json({error:"Add players before running the draw."},400);
      if(players.length>32)return json({error:"There are only 32 NFL teams. 33 supports up to 32 players."},400);
      const teams=shuffle33(NFL_TEAM_CODES_33);
      await DB.prepare("DELETE FROM pool_33_assignments WHERE pool_id=?").bind(pid).run();
      const stm=players.map((p,i)=>DB.prepare("INSERT INTO pool_33_assignments(pool_id,player_name,team,assigned_at,source) VALUES(?,?,?,?,?)").bind(pid,p,teams[i],new Date().toISOString(),"random"));
      if(stm.length)await DB.batch(stm);
      await DB.prepare("INSERT INTO pool_33_state(pool_id,draw_locked,draw_source,draw_at) VALUES(?,1,'random',?) ON CONFLICT(pool_id) DO UPDATE SET draw_locked=1,draw_source='random',draw_at=excluded.draw_at").bind(pid,new Date().toISOString()).run();
      return json({ok:true,assignments:players.map((p,i)=>({player:p,team:teams[i]}))});
    }
    if(path==="33/manual-draw"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const st=await DB.prepare("SELECT draw_locked FROM pool_33_state WHERE pool_id=?").bind(pid).first();
      if(Number(st?.draw_locked||0)===1)return json({error:"The yearly 33 draw is already locked. Teams stay the same all 18 weeks."},409);
      const assignments=Array.isArray(body.assignments)?body.assignments:[];
      const players=(await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid").bind(pid).all()).results.map(x=>x.name);
      if(assignments.length!==players.length)return json({error:"Assign one NFL team to every player before saving."},400);
      const validPlayers=new Set(players),seenP=new Set(),seenT=new Set();
      for(const a of assignments){
        const p=String(a.player||"").trim(),t=String(a.team||"").trim().toUpperCase();
        if(!validPlayers.has(p))return json({error:`Unknown player: ${p}`},400);
        if(!NFL_TEAM_CODES_33.includes(t))return json({error:`Invalid NFL team: ${t}`},400);
        if(seenP.has(p))return json({error:`${p} is assigned more than once.`},400);
        if(seenT.has(t))return json({error:`${t} is assigned to more than one player.`},400);
        seenP.add(p);seenT.add(t);
      }
      await DB.prepare("DELETE FROM pool_33_assignments WHERE pool_id=?").bind(pid).run();
      const stm=assignments.map(a=>DB.prepare("INSERT INTO pool_33_assignments(pool_id,player_name,team,assigned_at,source) VALUES(?,?,?,?,?)").bind(pid,a.player,a.team,new Date().toISOString(),"manual"));
      if(stm.length)await DB.batch(stm);
      await DB.prepare("INSERT INTO pool_33_state(pool_id,draw_locked,draw_source,draw_at) VALUES(?,1,'manual',?) ON CONFLICT(pool_id) DO UPDATE SET draw_locked=1,draw_source='manual',draw_at=excluded.draw_at").bind(pid,new Date().toISOString()).run();
      return json({ok:true});
    }
    if(path==="33/payment"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const player=String(body.player||"").trim();
      const paid=body.paid?1:0;
      const ex=await DB.prepare("SELECT 1 AS ok FROM pool_players WHERE pool_id=? AND name=?").bind(pid,player).first();
      if(!ex)return json({error:"Player not found."},404);
      await DB.prepare("INSERT INTO pool_33_entries(pool_id,player_name,paid) VALUES(?,?,?) ON CONFLICT(pool_id,player_name) DO UPDATE SET paid=excluded.paid").bind(pid,player,paid).run();
      return json({ok:true,player,paid:paid===1});
    }
    if(path==="33/finalize"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const week33=Math.max(1,Math.min(18,w));
      const assignments=(await DB.prepare("SELECT player_name,team FROM pool_33_assignments WHERE pool_id=? ORDER BY rowid").bind(pid).all()).results||[];
      if(!assignments.length)return json({error:"Set the yearly team draw first."},400);
      const live=await fetchNFLWeek(week33);
      const expected=live.length,completed=live.filter(g=>g.completed).length;
      if(expected&&completed<expected)return json({error:`Week ${week33} is not finished yet. ${completed} of ${expected} games are final.`},409);
      const paid=await game33PaidMap(DB,pid),scores={};
      for(const g of live)if(g.completed){scores[g.away]=Number(g.awayScore);scores[g.home]=Number(g.homeScore)}
      const winners=assignments.filter(a=>paid[a.player_name]&&scores[a.team]===33).map(a=>({player:a.player_name,team:a.team}));
      const players=(await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid").bind(pid).all()).results.map(x=>x.name);
      const paidCount=players.filter(p=>paid[p]).length;
      const baseWeekly=(paidCount*50)/18;
      const carry=await game33CarryCount(DB,pid,week33);
      const payout=winners.length?baseWeekly*(carry+1):0;
      await DB.prepare("INSERT INTO pool_33_week_meta(pool_id,week,finalized,winners_json,payout_amount,payout_paid,finalized_at) VALUES(?,?,1,?,?,0,?) ON CONFLICT(pool_id,week) DO UPDATE SET finalized=1,winners_json=excluded.winners_json,payout_amount=excluded.payout_amount,payout_paid=0,finalized_at=excluded.finalized_at").bind(pid,week33,JSON.stringify(winners),payout,new Date().toISOString()).run();
      return json({ok:true,winners,payout,splitEach:winners.length?payout/winners.length:0,rolled:winners.length===0});
    }
    if(path==="33/payout"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const week33=Math.max(1,Math.min(18,w));
      const m=await DB.prepare("SELECT finalized,winners_json,payout_paid FROM pool_33_week_meta WHERE pool_id=? AND week=?").bind(pid,week33).first();
      if(Number(m?.finalized||0)!==1)return json({error:"Finalize this 33 week first."},409);
      let winners=[];try{winners=JSON.parse(m.winners_json||"[]")}catch(e){}
      if(!winners.length)return json({error:"No team scored 33 this week, so the money rolled forward."},409);
      const next=Number(m.payout_paid||0)===1?0:1;
      await DB.prepare("UPDATE pool_33_week_meta SET payout_paid=? WHERE pool_id=? AND week=?").bind(next,pid,week33).run();
      return json({ok:true,payoutPaid:next===1});
    }


    if(path==="payment/checkout"&&method==="POST"){
      if(!sessionCanPlay(s))return json({error:"Player sign-in required."},403);
      const existingPaid=await DB.prepare("SELECT paid FROM pool_payments WHERE pool_id=? AND sport=? AND player_name=? AND week=?").bind(pid,sport,s.player_name,w).first();
      if(Number(existingPaid?.paid||0)===1)return json({paid:true});
      if(!squareConfigured(env))return json({error:"Square payment setup is not connected yet. Commissioner must add the Square secrets in Cloudflare."},503);
      const fee=await getFee(DB,pid),amountCents=Math.round(fee*100);
      const orderKey=crypto.randomUUID(),note=`${s.player_name} - ${sport.toUpperCase()} Week ${w} Entry Fee`;
      const sq=await squareCreateCheckout(env,{amountCents,note,redirectUrl:safeReturnUrl(request),idempotencyKey:orderKey});
      await DB.prepare("INSERT INTO payment_orders(id,pool_id,sport,week,player_name,amount_cents,square_order_id,square_payment_link_id,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)")
        .bind(orderKey,pid,sport,w,s.player_name,amountCents,sq.payment_link.order_id||"",sq.payment_link.id||"","PENDING",new Date().toISOString()).run();
      return json({url:sq.payment_link.url});
    }
    if(path==="payment/status"&&method==="GET"){
      if(!sessionCanPlay(s))return json({paid:true});
      const pr=await DB.prepare("SELECT paid FROM pool_payments WHERE pool_id=? AND sport=? AND player_name=? AND week=?").bind(pid,sport,s.player_name,w).first();
      if(Number(pr?.paid||0)===1)return json({paid:true});
      const orders=(await DB.prepare("SELECT * FROM payment_orders WHERE pool_id=? AND sport=? AND week=? AND player_name=? AND status='PENDING' ORDER BY created_at DESC LIMIT 5").bind(pid,sport,w,s.player_name).all()).results||[];
      for(const o of orders){
        if(await squareOrderPaid(env,o.square_order_id)){
          const now=new Date().toISOString();
          await DB.batch([
            DB.prepare("UPDATE payment_orders SET status='PAID',paid_at=? WHERE id=?").bind(now,o.id),
            DB.prepare("INSERT INTO pool_payments(pool_id,sport,player_name,week,paid) VALUES(?,?,?,?,1) ON CONFLICT(pool_id,sport,player_name,week) DO UPDATE SET paid=1").bind(pid,sport,s.player_name,w)
          ]);
          return json({paid:true});
        }
      }
      return json({paid:false});
    }
    if(path==="default-week"&&method==="GET"){
      const maxWeek=sport==="nfl"?22:15;
      // v379: College follows the live ESPN college-football week, independently of NFL.
      if(sport==="college"){
        for(let wk=1;wk<=maxWeek;wk++){
          try{
            const slate=await fetchCollegeWeek(wk);
            if((slate||[]).some(g=>!g.completed)){return json({week:wk,maxWeek,source:"ESPN COLLEGE SCHEDULE"});}
          }catch(e){}
        }
      }
      const rows=(await DB.prepare("SELECT week,finalized_winner,payout_paid FROM pool_week_meta WHERE pool_id=? AND sport=? ORDER BY week")
        .bind(pid,sport).all()).results||[];

      const byWeek=new Map(rows.map(r=>[Number(r.week),r]));
      let activeWeek=1;

      // Advance only through completed/finalized/paid weeks.
      for(let wk=1;wk<=maxWeek;wk++){
        const m=byWeek.get(wk);
        const closed=!!String(m?.finalized_winner||"").trim();
        if(closed){
          activeWeek=Math.min(wk+1,maxWeek);
          continue;
        }
        activeWeek=wk;
        break;
      }

      return json({week:activeWeek,maxWeek});
    }

    if(path==="lock-status"&&method==="GET"){
      const row=await DB.prepare("SELECT lock_time FROM pool_week_meta WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).first();
      // v533: automatic NFL pools must still lock at the first kickoff even when a new
      // pool has no pool_week_meta row yet. Use the official week fallback as the lock.
      const lockTime=row?.lock_time||(sport==="nfl"?OFFICIAL_FIRST_KICKOFF_FALLBACK[w]:null)||null;
      return json({lockTime,locked:!!(lockTime&&Date.parse(lockTime)<=Date.now()),sport,week:w});
    }
    if(path==="pick-page"&&method==="GET"){
      // v192: one round-trip for the entire Picks screen instead of separate bootstrap + me requests.
      const sync=await fastBootstrapWeek(DB,pid,sport,w);
      let pickPlayer=String(s.player_name||"").trim();
      if(s.role==="admin"&&(!pickPlayer||pickPlayer==="Commissioner")){
        const commissionerPlayer=await getCommissionerPlayerName(DB,pid);
        if(commissionerPlayer)pickPlayer=String(commissionerPlayer).trim();
      }
      const batch=[
        DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid").bind(pid),
        DB.prepare("SELECT week,lock_time FROM pool_week_meta WHERE pool_id=? AND sport=?").bind(pid,sport),
        DB.prepare("SELECT key,value FROM pool_settings WHERE pool_id=? AND key IN ('fee','display_timezone','paypal','venmo','cashapp','payment_note')").bind(pid)
      ];
      if(pickPlayer){
        batch.push(DB.prepare("SELECT game_index,team FROM pool_picks WHERE pool_id=? AND sport=? AND player_name=? COLLATE NOCASE AND week=?").bind(pid,sport,pickPlayer,w));
        batch.push(DB.prepare("SELECT guess FROM pool_ties WHERE pool_id=? AND sport=? AND player_name=? COLLATE NOCASE AND week=?").bind(pid,sport,pickPlayer,w));
      }
      if(sessionCanPlay(s)&&s.role!=="admin"&&pickPlayer)batch.push(DB.prepare("SELECT paid FROM pool_payments WHERE pool_id=? AND sport=? AND player_name=? AND week=?").bind(pid,sport,pickPlayer,w));
      const r=await DB.batch(batch);
      const players=(r[0]?.results||[]).map(x=>x.name),locks={};(r[1]?.results||[]).forEach(x=>{if(x.lock_time)locks[x.week]=x.lock_time});
      const settings=Object.fromEntries((r[2]?.results||[]).map(x=>[x.key,x.value]));
      let idx=3,picks={},tie="";
      if(pickPlayer){(r[idx++]?.results||[]).forEach(x=>picks[x.game_index]=x.team);tie=r[idx++]?.results?.[0]?.guess??"";}
      let isPaid=s.role==="admin";
      if(sessionCanPlay(s)&&s.role!=="admin"&&pickPlayer)isPaid=Number(r[idx++]?.results?.[0]?.paid||0)===1;
      const paymentSettings={paypal:settings.paypal||"",venmo:settings.venmo||"",cashapp:settings.cashapp||"",note:settings.payment_note||""};
      return json({
        boot:{players,fee:Number(settings.fee||0),locks,records:sync.records,liveGames:sync.liveGames,sourceKickoff:sync.sourceKickoff,source:sync.source,sport,paid:isPaid,displayTimezone:settings.display_timezone||"auto",paymentSettings,squareReady:squareConfigured(env),oddsReady:oddsConfigured(env)},
        me:{picks,tie,player:pickPlayer||""}
      });
    }
    if(path==="bootstrap"&&method==="GET"){
      const sync=await fastBootstrapWeek(DB,pid,sport,w),players=(await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid").bind(pid).all()).results.map(x=>x.name),fee=await getFee(DB,pid);
      const lr=(await DB.prepare("SELECT week,lock_time FROM pool_week_meta WHERE pool_id=? AND sport=?").bind(pid,sport).all()).results||[],locks={};lr.forEach(x=>{if(x.lock_time)locks[x.week]=x.lock_time});
      let isPaid=s.role==="admin";
      if(sessionCanPlay(s)&&s.role!=="admin"){
        const pr=await DB.prepare("SELECT paid FROM pool_payments WHERE pool_id=? AND sport=? AND player_name=? AND week=?").bind(pid,sport,s.player_name,w).first();
        isPaid=Number(pr?.paid||0)===1;
      }
      // Do not block the main Picks page on per-game ESPN odds/predictor calls.
      // Market data is loaded separately by /api/market after the page is already usable.
      const liveGames=sync.liveGames;
      return json({players,fee,locks,records:sync.records,liveGames,sourceKickoff:sync.sourceKickoff,source:sync.source,sport,paid:isPaid,displayTimezone:await getPoolDisplayTimezone(DB,pid),paymentSettings:await getPaymentSettings(DB,pid),squareReady:squareConfigured(env),oddsReady:oddsConfigured(env)});
    }
    if(path==="market"&&method==="GET"){
      const sync=await syncWeek(DB,pid,sport,w);
      return json({games:sync.liveGames,source:"disabled"});
    }
    if(path==="me"&&method==="GET"){
      // Read-only pick lookup. Preserve all stored pick data and tolerate legacy commissioner sessions/name casing.
      let pickPlayer=String(s.player_name||"").trim();
      if(s.role==="admin"&&(!pickPlayer||pickPlayer==="Commissioner")){
        const commissionerPlayer=await getCommissionerPlayerName(DB,pid);
        if(commissionerPlayer)pickPlayer=String(commissionerPlayer).trim();
      }
      if(!pickPlayer)return json({picks:{},tie:""});
      const ps=(await DB.prepare("SELECT game_index,team FROM pool_picks WHERE pool_id=? AND sport=? AND player_name=? COLLATE NOCASE AND week=?").bind(pid,sport,pickPlayer,w).all()).results||[],picks={};ps.forEach(x=>picks[x.game_index]=x.team);
      const t=await DB.prepare("SELECT guess FROM pool_ties WHERE pool_id=? AND sport=? AND player_name=? COLLATE NOCASE AND week=?").bind(pid,sport,pickPlayer,w).first();
      return json({picks,tie:t?.guess??"",player:pickPlayer});
    }
    if(path==="picks"&&method==="POST"){
      if(!sessionCanPlay(s))return json({error:"Player sign-in required."},403);
      if(s.role!=="admin"){
        const paidRow=await DB.prepare("SELECT paid FROM pool_payments WHERE pool_id=? AND sport=? AND player_name=? AND week=?").bind(pid,sport,s.player_name,w).first();
        if(Number(paidRow?.paid||0)!==1)return json({error:"Player access is PENDING. Your commissioner must mark you ACTIVE before you can save picks."},402);
      }
      if(await locked(DB,pid,sport,w))return json({error:"This week is locked."},403);
      const gl=await getGameList(DB,pid,sport,w);if(!gl.length)return json({error:sport==="college"?"The commissioner has not selected the college games for this week yet.":"No games available."},400);
      const picks=body.picks||{};if(Object.keys(picks).length<gl.length)return json({error:"Every game needs a pick before saving."},400);
      const stm=[DB.prepare("DELETE FROM pool_picks WHERE pool_id=? AND sport=? AND player_name=? AND week=?").bind(pid,sport,s.player_name,w)];
      for(let i=0;i<gl.length;i++)if(picks[i])stm.push(DB.prepare("INSERT INTO pool_picks(pool_id,sport,player_name,week,game_index,team) VALUES(?,?,?,?,?,?)").bind(pid,sport,s.player_name,w,i,picks[i]));
      stm.push(DB.prepare("INSERT INTO pool_ties(pool_id,sport,player_name,week,guess) VALUES(?,?,?,?,?) ON CONFLICT(pool_id,sport,player_name,week) DO UPDATE SET guess=excluded.guess").bind(pid,sport,s.player_name,w,body.tie===""||body.tie==null?null:Number(body.tie)));
      await DB.batch(stm);return json({ok:true});
    }
    if(path==="compare"&&method==="GET"){
      const isLocked=await locked(DB,pid,sport,w);if(!isLocked&&s.role!=="admin")return json({locked:false,players:[],games:[]});
      const [pr,pk,tr]=await Promise.all([
        DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid").bind(pid).all(),
        DB.prepare("SELECT player_name,game_index,team FROM pool_picks WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).all(),
        DB.prepare("SELECT player_name,guess FROM pool_ties WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).all()
      ]);
      const players=(pr.results||[]).map(x=>x.name),pickMap={},tieMap={};
      for(const r of (pk.results||[])){(pickMap[r.player_name]??={})[Number(r.game_index)]=r.team}
      for(const r of (tr.results||[]))tieMap[r.player_name]=r.guess;
      const out=players.map(p=>({player:p,picks:pickMap[p]||{},tie:tieMap[p]??null}));
      const sync=await syncWeek(DB,pid,sport,w);
      // Projected standings consumes Compare data too. Enrich unfinished games
      // with the existing ESPN market/predictor feed; saved values are used as
      // a fallback so projections remain useful if ESPN temporarily omits odds.
      let compareGames=sync.liveGames;
      try{compareGames=await attachMarketOdds(DB,env,pid,sport,w,sync.liveGames)}catch(e){}
      const resultRows=(await DB.prepare("SELECT game_index,winner FROM pool_results WHERE pool_id=? AND sport=? AND week=? ORDER BY game_index").bind(pid,sport,w).all()).results||[];
      const results=Object.fromEntries(resultRows.map(r=>[Number(r.game_index),r.winner]));
      return json({locked:isLocked,players:out,games:compareGames,results,finalGames:resultRows.length});
    }
    if(path==="college-top25-scores"&&method==="GET"){
      if(sport!=="college")return json({games:[],source:"ESPN College Football"});
      // v379: Live Scores must mirror the exact slate selected for this pool/week.
      const sync=await syncWeek(DB,pid,"college",w);
      return json({games:sync.liveGames,live:true,source:sync.source||"ESPN College Football — selected pool games"});
    }

    if(path==="scores"&&method==="GET"){
      const sync=await syncWeek(DB,pid,sport,w);
      return json({games:sync.liveGames,live:true,source:sync.source});
    }
    if(path==="standings"&&method==="GET"){
      // Keep standings on the exact same finalized-game source as Live Scores / Compare Picks.
      // This refreshes pool_results first, then counts W/L from those FINAL results.
      await syncWeek(DB,pid,sport,w);
      return json(await standings(DB,pid,sport,w));
    }
    if(path==="paid"&&method==="GET"){
      const d=await standings(DB,pid,sport,w),players=(await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid").bind(pid).all()).results.map(x=>x.name);
      return json({players,paid:d.paid||{},pot:d.pot,winner:d.winner,payoutPaid:d.payoutPaid,fee:await getFee(DB,pid),potContribution:await getPotContribution(DB,pid),commissionerEmail:await getCommissionerEmail(DB,pid),paymentSettings:await getPaymentSettings(DB,pid)});
    }
    if(path==="admin"&&method==="GET"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const adminGames=await getAdminGameListFast(DB,pid,sport,w);
      const adminSourceKickoff=await quickAutomaticKickoff(DB,pid,sport,w,adminGames);
      const [playerRes,payRes,resultRes,pickRes,metaRes,settingsRes,gameType,poolGames]=await Promise.all([
        DB.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid").bind(pid).all(),
        DB.prepare("SELECT player_name,paid FROM pool_payments WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).all(),
        DB.prepare("SELECT game_index,winner FROM pool_results WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).all(),
        DB.prepare("SELECT player_name,game_index,team FROM pool_picks WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).all(),
        DB.prepare("SELECT * FROM pool_week_meta WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).first(),
        DB.prepare("SELECT key,value FROM pool_settings WHERE pool_id=?").bind(pid).all(),
        getPoolGameType(DB,pid),getPoolGameTypes(DB,pid)
      ]);
      const players=(playerRes.results||[]).map(x=>x.name);
      const payRows=payRes.results||[],paid=Object.fromEntries(payRows.map(x=>[x.player_name,Number(x.paid)===1]));
      const resultRows=resultRes.results||[],results=Object.fromEntries(resultRows.map(x=>[Number(x.game_index),x.winner]));
      const pickRows=pickRes.results||[];
      const correctionPicks={};for(const r of pickRows){const pn=String(r.player_name||"");if(!correctionPicks[pn])correctionPicks[pn]={};correctionPicks[pn][Number(r.game_index)]=r.team;}
      const lockOverrideKey=`lock_override_${sport}_${w}`;
      const lockOverrideRow=await DB.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key=?").bind(pid,lockOverrideKey).first();
      const lockOverride=String(lockOverrideRow?.value||"").trim()||null;
      const meta=metaRes||{};
      let setupRows=[];try{setupRows=(await DB.prepare("SELECT player_name,email,status,created_at,used_at,email_sent FROM pool_player_setup_invites WHERE pool_id=? ORDER BY created_at DESC").bind(pid).all()).results||[]}catch(e){setupRows=(await DB.prepare("SELECT player_name,email,status,created_at,used_at FROM pool_player_setup_invites WHERE pool_id=? ORDER BY created_at DESC").bind(pid).all()).results||[]}
      const playerSetupStatus={};for(const r of setupRows){if(!playerSetupStatus[r.player_name])playerSetupStatus[r.player_name]={status:r.status,email:r.email||"",emailSent:Number(r.email_sent||0)===1,createdAt:r.created_at||"",usedAt:r.used_at||""}}
      let contactRows=[];try{contactRows=(await DB.prepare("SELECT player_name,email,phone FROM pool_player_contacts WHERE pool_id=?").bind(pid).all()).results||[]}catch(e){}
      const playerContacts=Object.fromEntries(contactRows.map(r=>[r.player_name,{email:r.email||"",phone:r.phone||""}]));
      const settings=Object.fromEntries((settingsRes.results||[]).map(x=>[x.key,x.value]));
      return json({players,paid,results,correctionPicks,lockOverride,meta,fee:Number(settings.fee||0),potContribution:Number(settings.pot_contribution||0),commissionerEmail:settings.commissioner_email||"",displayTimezone:settings.display_timezone||"auto",gameType,poolGames,playerSetupStatus,playerContacts,rules:settings.rules||"",games:adminGames,sourceKickoff:adminSourceKickoff});
    }
    if(path==="admin/payment"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const player=String(body.player||"").trim();
      if(!player)return json({error:"Choose a player."},400);
      const exists=await DB.prepare("SELECT 1 AS ok FROM pool_players WHERE pool_id=? AND name=?").bind(pid,player).first();
      if(!exists)return json({error:"Player not found in this pool."},404);
      const paid=body.paid?1:0;
      await DB.prepare("INSERT INTO pool_payments(pool_id,sport,player_name,week,paid) VALUES(?,?,?,?,?) ON CONFLICT(pool_id,sport,player_name,week) DO UPDATE SET paid=excluded.paid")
        .bind(pid,sport,player,w,paid).run();
      return json({ok:true,player,paid:paid===1,sport,week:w});
    }
    if(path==="admin/payment-batch"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const updates=Array.isArray(body.updates)?body.updates:[];
      if(!updates.length)return json({error:"No player access changes were supplied."},400);
      if(updates.length>500)return json({error:"Too many player access updates."},400);
      const playerRows=(await DB.prepare("SELECT name FROM pool_players WHERE pool_id=?").bind(pid).all()).results||[];
      const valid=new Set(playerRows.map(r=>String(r.name)));
      const clean=[];
      for(const row of updates){const player=String(row?.player||"").trim();if(player&&valid.has(player))clean.push({player,paid:row?.paid?1:0});}
      if(!clean.length)return json({error:"No valid players were found for this pool."},400);
      await DB.batch(clean.map(x=>DB.prepare("INSERT INTO pool_payments(pool_id,sport,player_name,week,paid) VALUES(?,?,?,?,?) ON CONFLICT(pool_id,sport,player_name,week) DO UPDATE SET paid=excluded.paid").bind(pid,sport,x.player,w,x.paid)));
      return json({ok:true,count:clean.length,sport,week:w});
    }
    if(path==="admin/payment-settings"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const vals={paypal:String(body.paypal||"").trim(),venmo:String(body.venmo||"").trim(),cashapp:String(body.cashapp||"").trim(),payment_note:String(body.note||"").trim()};
      const stm=Object.entries(vals).map(([k,v])=>DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,?,?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,k,v));
      if(stm.length)await DB.batch(stm);
      return json({ok:true,paymentSettings:await getPaymentSettings(DB,pid)});
    }
    if(path==="admin/lock"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const hasLock=Object.prototype.hasOwnProperty.call(body,"lockTime");
      if(!hasLock)return json({error:"Lock time was not supplied."},400);
      let lockTime=null;
      if(body.lockTime!==null&&String(body.lockTime||"").trim()!==""){
        const parsed=Date.parse(String(body.lockTime));
        if(!Number.isFinite(parsed))return json({error:"Enter a valid pick-lock date and time."},400);
        lockTime=new Date(parsed).toISOString();
      }
      const overrideKey=`lock_override_${sport}_${w}`;
      if(lockTime===null){
        const automaticKickoff=await quickAutomaticKickoff(DB,pid,sport,w);
        await DB.batch([
          DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,?,?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,overrideKey,""),
          DB.prepare("INSERT INTO pool_week_meta(pool_id,sport,week,lock_time) VALUES(?,?,?,?) ON CONFLICT(pool_id,sport,week) DO UPDATE SET lock_time=excluded.lock_time").bind(pid,sport,w,automaticKickoff)
        ]);
        const row=await DB.prepare("SELECT lock_time FROM pool_week_meta WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).first();
        const saved=row?.lock_time||null;
        const verified=automaticKickoff? saved===automaticKickoff : saved===null;
        return json({ok:true,verified,lockTime:saved,overrideLockTime:null,automatic:true,sourceKickoff:automaticKickoff||null,sport,week:w});
      }
      await DB.batch([
        DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,?,?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,overrideKey,lockTime),
        DB.prepare("INSERT INTO pool_week_meta(pool_id,sport,week,lock_time) VALUES(?,?,?,?) ON CONFLICT(pool_id,sport,week) DO UPDATE SET lock_time=excluded.lock_time").bind(pid,sport,w,lockTime)
      ]);
      const row=await DB.prepare("SELECT lock_time FROM pool_week_meta WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).first();
      const setrow=await DB.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key=?").bind(pid,overrideKey).first();
      const persisted=row?.lock_time||null,overridePersisted=String(setrow?.value||"").trim()||null;
      const verified=!!persisted&&persisted===lockTime&&overridePersisted===lockTime;
      if(!verified)return json({error:"The lock time did not verify after saving. Please try again."},500);
      return json({ok:true,verified:true,lockTime:persisted,overrideLockTime:overridePersisted,automatic:false,sport,week:w});
    }
    if(path==="admin/settings"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      if(body.fee!==undefined)await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'fee',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,String(Math.max(0,Number(body.fee)||0))).run();
      if(body.potContribution!==undefined){const feeNow=body.fee!==undefined?Math.max(0,Number(body.fee)||0):await getFee(DB,pid),pc=Math.max(0,Number(body.potContribution)||0);if(pc>feeNow)return json({error:"Prize-pot amount per player cannot be greater than the entry fee."},400);await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'pot_contribution',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,String(pc)).run();}
      if(body.commissionerEmail!==undefined){const em=String(body.commissionerEmail||"").trim().toLowerCase();if(em&&!/^\S+@\S+\.\S+$/.test(em))return json({error:"Enter a valid commissioner email address."},400);await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'commissioner_email',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,em).run();}
      if(body.rules!==undefined){const rules=String(body.rules||"").trim().slice(0,4000);await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'rules',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,rules).run();}
      if(body.displayTimezone!==undefined){const allowed=["auto","America/New_York","America/Chicago","America/Denver","America/Los_Angeles"],tz=allowed.includes(String(body.displayTimezone))?String(body.displayTimezone):"auto";await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,'display_timezone',?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,tz).run();}
      if(Object.prototype.hasOwnProperty.call(body,"lockTime")){
        let lt=null;
        if(body.lockTime!==null&&String(body.lockTime||"").trim()!==""){
          const parsed=Date.parse(String(body.lockTime));
          if(!Number.isFinite(parsed))return json({error:"Enter a valid pick-lock date and time."},400);
          lt=new Date(parsed).toISOString();
        }
        await DB.prepare("INSERT INTO pool_week_meta(pool_id,sport,week,lock_time) VALUES(?,?,?,?) ON CONFLICT(pool_id,sport,week) DO UPDATE SET lock_time=excluded.lock_time").bind(pid,sport,w,lt).run();
      }
      return json({ok:true});
    }
    if(path==="admin/results"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const stm=[DB.prepare("DELETE FROM pool_results WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w)];
      for(const [i,t] of Object.entries(body.results||{}))if(t)stm.push(DB.prepare("INSERT INTO pool_results(pool_id,sport,week,game_index,winner) VALUES(?,?,?,?,?)").bind(pid,sport,w,Number(i),t));
      stm.push(DB.prepare("INSERT INTO pool_week_meta(pool_id,sport,week,actual_tie) VALUES(?,?,?,?) ON CONFLICT(pool_id,sport,week) DO UPDATE SET actual_tie=excluded.actual_tie").bind(pid,sport,w,body.actualTie==null||body.actualTie===""?null:Number(body.actualTie)));
      await DB.batch(stm);return json({ok:true});
    }
    if(path==="admin/correction"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const player=String(body.player||"").trim(),gameIndex=Number(body.gameIndex),team=String(body.team||"").trim();
      if(!player||!Number.isInteger(gameIndex)||gameIndex<0||!team)return json({error:"Choose a player, game and corrected pick."},400);
      const validPlayer=await DB.prepare("SELECT name FROM pool_players WHERE pool_id=? AND name=? COLLATE NOCASE").bind(pid,player).first();
      if(!validPlayer)return json({error:"Player not found in this pool."},404);
      const gl=await getGameList(DB,pid,sport,w),game=gl[gameIndex];
      if(!game||![game.away,game.home].includes(team))return json({error:"That team is not valid for the selected game."},400);
      const canonicalPlayer=validPlayer.name;
      await DB.prepare("INSERT INTO pool_picks(pool_id,sport,player_name,week,game_index,team) VALUES(?,?,?,?,?,?) ON CONFLICT(pool_id,sport,player_name,week,game_index) DO UPDATE SET team=excluded.team")
        .bind(pid,sport,canonicalPlayer,w,gameIndex,team).run();
      const saved=await DB.prepare("SELECT team FROM pool_picks WHERE pool_id=? AND sport=? AND player_name=? COLLATE NOCASE AND week=? AND game_index=?").bind(pid,sport,canonicalPlayer,w,gameIndex).first();
      const savedTeam=String(saved?.team||"");
      if(savedTeam!==team)return json({error:"The corrected pick did not verify after saving."},500);
      return json({ok:true,verified:true,player:canonicalPlayer,gameIndex,savedTeam,sport,week:w});
    }
    if(path==="admin/finalize"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const d=await standings(DB,pid,sport,w),winner=d.rows[0]?.player||null;
      await DB.prepare("INSERT INTO pool_week_meta(pool_id,sport,week,finalized_winner) VALUES(?,?,?,?) ON CONFLICT(pool_id,sport,week) DO UPDATE SET finalized_winner=excluded.finalized_winner").bind(pid,sport,w,winner).run();
      return json({ok:true,winner});
    }
    if(path==="admin/unfinalize"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      await DB.prepare("INSERT INTO pool_week_meta(pool_id,sport,week,finalized_winner) VALUES(?,?,?,'') ON CONFLICT(pool_id,sport,week) DO UPDATE SET finalized_winner=''").bind(pid,sport,w).run();
      return json({ok:true,winner:null});
    }
    if(path==="admin/payout"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const m=await DB.prepare("SELECT payout_paid FROM pool_week_meta WHERE pool_id=? AND sport=? AND week=?").bind(pid,sport,w).first();
      const next=Number(m?.payout_paid||0)===1?0:1;
      await DB.prepare("INSERT INTO pool_week_meta(pool_id,sport,week,payout_paid) VALUES(?,?,?,?) ON CONFLICT(pool_id,sport,week) DO UPDATE SET payout_paid=excluded.payout_paid").bind(pid,sport,w,next).run();
      return json({ok:true,payoutPaid:next===1});
    }
    if(path==="college-selection"&&method==="GET"){
      const mode=await getPoolSetting(DB,pid,`college_selection_mode_${w}`,"commissioner"),count=Number(await getPoolSetting(DB,pid,`college_selection_count_${w}`,"0"))||0;
      return json({mode,count,week:w});
    }
    if(path==="college-candidates"&&method==="GET"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      let games=await fetchCollegeWeek(w);
      if(!games.length)return json({error:"Could not load the college schedule for this week. Try again in a moment."},503);

      const top=await fetchCollegeTop25();
      if(top)games=applyCollegeRanks(games,top);

      const rankedGames=games.filter(g=>
        (Number(g.awayRank)>=1&&Number(g.awayRank)<=25)||
        (Number(g.homeRank)>=1&&Number(g.homeRank)<=25)
      );
      if(rankedGames.length){
        return json({games:rankedGames,top25Only:true,rankingSource:top?"ESPN AP Top 25":"ESPN scoreboard rankings"});
      }

      return json({
        games,
        top25Only:false,
        rankingSource:"schedule fallback",
        warning:"Top 25 ranking data is temporarily unavailable. The full college schedule is shown so you can still select games."
      });
    }
    if(path==="admin/college-games"&&method==="POST"){
      if(s.role!=="admin")return json({error:"Commissioner only."},403);
      const chosen=Array.isArray(body.games)?body.games:[];
      if(!chosen.length)return json({error:"Select at least one college game."},400);
      const existingPick=await DB.prepare("SELECT 1 AS ok FROM pool_picks WHERE pool_id=? AND sport='college' AND week=? LIMIT 1").bind(pid,w).first();
      const metaLock=await DB.prepare("SELECT lock_time FROM pool_week_meta WHERE pool_id=? AND sport='college' AND week=?").bind(pid,w).first();
      if(existingPick?.ok||Number.isFinite(Date.parse(metaLock?.lock_time||""))&&Date.parse(metaLock.lock_time)<=Date.now())return json({error:"This college slate is locked because picks already exist or the deadline has passed. Clear/correct picks before changing the games."},409);
      const mode=String(body.mode||"commissioner")==="random"?"random":"commissioner";

      // Clear only this pool/sport/week, then save each selected game.
      await DB.prepare("DELETE FROM pool_games WHERE pool_id=? AND sport='college' AND week=?").bind(pid,w).run();
      await DB.prepare("DELETE FROM pool_results WHERE pool_id=? AND sport='college' AND week=?").bind(pid,w).run();

      for(let i=0;i<chosen.length;i++){
        const g=chosen[i]||{};
        if(!g.away||!g.home)continue;
        await DB.prepare("INSERT INTO pool_games(pool_id,sport,week,game_index,event_id,away,home,away_name,home_name,away_id,home_id,kickoff) VALUES(?,'college',?,?,?,?,?,?,?,?,?,?)")
          .bind(pid,w,i,String(g.eventId||""),String(g.away),String(g.home),String(g.awayName||g.away),String(g.homeName||g.home),String(g.awayId||""),String(g.homeId||""),g.kickoff||null)
          .run();
      }

      const saved=(await DB.prepare("SELECT * FROM pool_games WHERE pool_id=? AND sport='college' AND week=? ORDER BY game_index").bind(pid,w).all()).results||[];
      if(!saved.length)return json({error:"The college games did not save. Please try again."},500);

      const first=saved.map(g=>g.kickoff).filter(Boolean).sort()[0]||null;
      if(first){
        await DB.prepare("INSERT INTO pool_week_meta(pool_id,sport,week,lock_time) VALUES(?,'college',?,?) ON CONFLICT(pool_id,sport,week) DO UPDATE SET lock_time=?")
          .bind(pid,w,first,first).run();
      }

      // Return exactly what was saved so the Picks page can display it immediately.
      const savedGames=saved.map(x=>({
        gameIndex:Number(x.game_index),
        eventId:String(x.event_id||""),
        away:x.away,home:x.home,
        awayName:x.away_name||x.away,homeName:x.home_name||x.home,
        awayId:String(x.away_id||""),homeId:String(x.home_id||""),
        kickoff:x.kickoff||null
      }));
      await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,?,?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,`college_selection_mode_${w}`,mode).run();
      await DB.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,?,?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pid,`college_selection_count_${w}`,String(savedGames.length)).run();
      return json({ok:true,count:savedGames.length,games:savedGames,mode});
    }
    return json({error:"Not found."},404);
  }catch(e){return json({error:String(e?.message||e)},500)}
}
