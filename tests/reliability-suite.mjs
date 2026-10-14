// Isolated regression checks; no live accounts, emails or production writes.
import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const groups={
 accounts:['login-transition.mjs','login-email-recovery.mjs','player-setup-invites.mjs','selective-pool-connect.mjs','player-identity.mjs','pool-password-recovery.mjs','links-owner-admin.cjs','owner-package-grant.cjs','partners.mjs','partner-logo.mjs','owner-pool-delete.cjs','pool-chat-unread.mjs','session-security-api.cjs','pool-chat.mjs'],
 games:['trivia-provider.mjs','trivia-api-games.mjs','trivia-night.mjs','trivia-teams.mjs','trivia-submit-answer.mjs','trivia-close-room.mjs','trivia-sessions.mjs','trivia-answer-changes.mjs','trivia-rally.mjs','friend-challenge.mjs','dead-air.mjs','last-alibi.mjs','million-point.mjs','solo-trivia.mjs','party-scoreboard.mjs','goal-line-scoreboard.mjs','mini-golf-core.mjs','mini-golf-courses.mjs','mini-golf-rooms.mjs','venue-scoreboard.mjs','party-grants.mjs','game-feedback.mjs'],
 pools:['nba-api.mjs','mlb-api.mjs','college-api.cjs','college-rankings.cjs','nascar-scoring.mjs','nascar-schedule.cjs','golf-scoring.mjs','golf-schedule.mjs','event-pool.test.mjs','fantasy.test.mjs','march.test.mjs','march-2025-replay.mjs','playoff-challenge.mjs','launch-availability.test.mjs']
};
const selected=process.argv[2];
if(selected&&!groups[selected])throw Error('Choose accounts, games or pools');
const output=resolve(root,'output/reliability');mkdirSync(output,{recursive:true});
const results=[];
for(const [group,files] of Object.entries(groups)){
 if(selected&&group!==selected)continue;
 for(const file of files){
  const start=Date.now();
  const run=spawnSync(process.execPath,[resolve(root,'tests',file)],{cwd:root,encoding:'utf8',timeout:120000,env:process.env,windowsHide:true});
  const passed=run.status===0&&!run.error;
  writeFileSync(resolve(output,file+'.log'),(run.stdout||'')+(run.stderr||'')+(run.error?.message||''));
  results.push({group,file,passed,durationMs:Date.now()-start});
  console.log((passed?'PASS ':'FAIL ')+group+'/'+file);
 }
}
writeFileSync(resolve(output,'results'+(selected?'-'+selected:'')+'.json'),JSON.stringify({testedAt:new Date().toISOString(),results,limitations:['Isolated fixtures; live email delivery and production capacity are not certified.','NFL Pick’em product code is excluded from this audit.']},null,2));
const failed=results.filter(r=>!r.passed);console.log(`${results.length-failed.length}/${results.length} suites passed`);
process.exitCode=failed.length?1:0;
