// Rollout is off until the site owner explicitly starts it.
export async function ensureTransition(db){await db.batch([
 db.prepare("CREATE TABLE IF NOT EXISTS links_login_rollout(id INTEGER PRIMARY KEY CHECK(id=1),phase TEXT NOT NULL DEFAULT 'off',started_at TEXT)"),
 db.prepare("INSERT OR IGNORE INTO links_login_rollout(id,phase) VALUES(1,'off')"),
 db.prepare('CREATE TABLE IF NOT EXISTS links_login_cohort(pool_id INTEGER NOT NULL,player_name TEXT NOT NULL,PRIMARY KEY(pool_id,player_name))'),
 db.prepare('CREATE TRIGGER IF NOT EXISTS links_login_cohort_rename AFTER UPDATE OF name ON pool_players BEGIN UPDATE links_login_cohort SET player_name=NEW.name WHERE pool_id=OLD.pool_id AND player_name=OLD.name; END')
])}
export async function loginPhase(db){await ensureTransition(db);return (await db.prepare('SELECT phase FROM links_login_rollout WHERE id=1').first()).phase}
