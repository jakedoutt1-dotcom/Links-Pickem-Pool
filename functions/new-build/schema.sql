-- LINKS New Build shared-data schema v281
-- Apply to a Cloudflare D1 database bound to Pages Functions as LINKS_DB.
CREATE TABLE IF NOT EXISTS pools (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  commissioner_email TEXT NOT NULL,
  phone TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pool_games (
  pool_id TEXT NOT NULL,
  game TEXT NOT NULL,
  PRIMARY KEY (pool_id, game),
  FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_email ON players(lower(email));
CREATE TABLE IF NOT EXISTS memberships (
  pool_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'player',
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TEXT NOT NULL,
  PRIMARY KEY (pool_id, player_id),
  FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS picks (
  id TEXT PRIMARY KEY,
  pool_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  game_type TEXT NOT NULL,
  period_key TEXT NOT NULL,
  event_id TEXT NOT NULL,
  selection TEXT NOT NULL,
  points INTEGER,
  locked_at TEXT,
  saved_at TEXT NOT NULL,
  UNIQUE(pool_id, player_id, game_type, period_key, event_id)
);
CREATE INDEX IF NOT EXISTS idx_picks_pool_period ON picks(pool_id, game_type, period_key);

CREATE TABLE IF NOT EXISTS pool_options (
  pool_id TEXT NOT NULL,
  game_type TEXT NOT NULL,
  period_key TEXT NOT NULL,
  option_value TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY(pool_id,game_type,period_key,option_value),
  FOREIGN KEY(pool_id) REFERENCES pools(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_pool_options ON pool_options(pool_id,game_type,period_key);

CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY,
  pool_id TEXT NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  accepted_at TEXT,
  FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_invites_pool ON invites(pool_id,status);
