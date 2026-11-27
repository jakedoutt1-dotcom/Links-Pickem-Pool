// Isolated regression checks; no live accounts, emails or production writes.
import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const groups={
 nfl:['football-final-snapshot.mjs','nfl-standings.cjs','nfl-week-context.cjs','nfl-standings-rollover.cjs','nfl-weekly-recap.mjs','nfl-pick-save.mjs','nfl-pick-reorder.cjs','nfl-projection.cjs','nfl-privacy.cjs','nfl-lock-settings.mjs','nfl-admin-api.cjs','nfl-admin-email.cjs','nfl-feedback-credit.mjs','nfl-moneylines.cjs','season-standings.cjs','personal-trends.mjs','standings-default-week.mjs','standings-tie-privacy.mjs','my-nfl-projection.mjs','correction-approval.mjs','correction-submission-flow.mjs'],
 accounts:['sponsored-access.mjs','auto-ads.cjs','free-game-testing.mjs','homepage-routing.cjs','login-transition.mjs','login-email-recovery.mjs','player-setup-invites.mjs','pool-email-content.mjs','selective-pool-connect.mjs','player-identity.mjs','pool-password-recovery.mjs','links-owner-admin.cjs','owner-package-grant.cjs','partners.mjs','partner-logo.mjs','owner-pool-delete.cjs','pool-chat-unread.mjs','session-security-api.cjs','pool-chat.mjs'],
 games:['daily-shot.mjs','circuit-rush-api.mjs','circuit-rush.mjs','daily-challenge.mjs','game-room-identity.mjs','poker-account-profile.mjs','poker-action-log.mjs','poker-audio.mjs','poker-computer.mjs','poker-controls.mjs','poker-hand-label.mjs','poker-inactivity.mjs','poker-kick.mjs','poker-night-api.mjs','trivia-provider.mjs','trivia-api-games.mjs','trivia-night.mjs','trivia-teams.mjs','trivia-team-captains.mjs','trivia-fair-play.mjs','trivia-submit-answer.mjs','trivia-close-room.mjs','trivia-sessions.mjs','trivia-answer-changes.mjs','trivia-rally.mjs','friend-challenge.mjs','million-point.mjs','solo-trivia.mjs','party-scoreboard.mjs','goal-line-scoreboard.mjs','mini-golf-core.mjs','mini-golf-courses.mjs','mini-golf-rooms.mjs','mini-golf-eighteen.mjs','mini-golf-room-recovery.mjs','venue-scoreboard.mjs','party-grants.mjs','game-feedback.mjs','game-score-recovery.mjs'],
 pools:['football.test.mjs','pool-formats.test.mjs','home-run-api.mjs','nba-api.mjs','nhl-api.mjs','cfp-contenders.mjs','cfp-api.mjs','cfp-bracket.mjs','mlb-api.mjs','pickem-incomplete-results.mjs','college-api.cjs','college-rankings.cjs','nascar-scoring.mjs','nascar-schedule.cjs','golf-scoring.mjs','golf-schedule.mjs','event-pool.test.mjs','fantasy.test.mjs','march.test.mjs','march-2025-replay.mjs','playoff-challenge.mjs','launch-availability.test.mjs','non-nfl-navigation-races.mjs','legacy-invite-security.mjs']
};
const selected=process.argv[2];
if(selected&&!groups[selected])throw Error('Choose '+Object.keys(groups).join(', '));
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
writeFileSync(resolve(output,'results'+(selected?'-'+selected:'')+'.json'),JSON.stringify({testedAt:new Date().toISOString(),results,limitations:['Isolated fixtures; live email delivery and production capacity are not certified.','Browser controls and external provider availability require separate verification.']},null,2));
const failed=results.filter(r=>!r.passed);console.log(`${results.length-failed.length}/${results.length} suites passed`);
process.exitCode=failed.length?1:0;
