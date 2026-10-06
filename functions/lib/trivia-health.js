// Only status codes and counts are retained. Never log credentials or provider bodies.
export async function triviaHealth(env,stage,status,count=0){
 if(!env.DB)return;
 try{
 await env.DB.prepare('CREATE TABLE IF NOT EXISTS links_trivia_health(stage TEXT PRIMARY KEY,status TEXT NOT NULL,question_count INTEGER NOT NULL,checked_at TEXT NOT NULL)').run();
 await env.DB.prepare('INSERT INTO links_trivia_health VALUES(?,?,?,?) ON CONFLICT(stage) DO UPDATE SET status=excluded.status,question_count=excluded.question_count,checked_at=excluded.checked_at').bind(stage,String(status),count,new Date().toISOString()).run();
 }catch{/* Diagnostics must not interrupt a game. */}
}
