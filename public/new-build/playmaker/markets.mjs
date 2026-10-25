// SportsGameOdds statIDs, shared by the UI and server allowlist.
const football={touchdowns:['Anytime touchdown','touchdowns','yn'],first_td:['First touchdown','firstTouchdown','yn'],passing_yards:['Passing yards','passing_yards','ou'],rushing_yards:['Rushing yards','rushing_yards','ou'],receiving_yards:['Receiving yards','receiving_yards','ou'],receptions:['Receptions','receiving_receptions','ou']};
const basketball={points:['Player points','points','ou'],rebounds:['Rebounds','rebounds','ou'],assists:['Assists','assists','ou'],threes:['Three-pointers made','threePointersMade','ou'],steals:['Steals','steals','ou'],blocks:['Blocks','blocks','ou']};
const hockey={shots:['Shots on goal','shots_onGoal','ou'],goals:['Goals','points','ou'],assists:['Assists','assists','ou'],player_points:['Points (goals + assists)','goals+assists','ou'],saves:['Goalie saves','goalie_saves','ou']};
const baseball={hits:['Hits','batting_hits','ou'],home_runs:['Home runs','batting_homeRuns','ou'],strikeouts:['Pitcher strikeouts','pitching_strikeouts','ou'],total_bases:['Total bases','batting_totalBases','ou'],rbi:['Runs batted in','batting_RBI','ou']};
const sports={NFL:football,NCAAF:football,NBA:basketball,NCAAB:basketball,NHL:hockey,MLB:baseball,MMA:{}};
export const GAME_ODD_IDS='points-home-game-ml-home,points-away-game-ml-away,points-home-game-sp-home,points-away-game-sp-away,points-all-game-ou-over,points-all-game-ou-under';
export function categories(sport){return [{id:'game',label:sport==='MMA'?'Fight winner / game lines':'Game winners, spreads & totals'},...Object.entries(sports[sport]||{}).map(([id,value])=>({id,label:value[0]})),...(Object.keys(sports[sport]||{}).length?[{id:'mixed',label:'Mixed picks'}]:[])];}
export function validCategory(sport,category){return categories(sport).some(c=>c.id===category)}
export function propDefinition(sport,stat,type){const entry=Object.entries(sports[sport]||{}).find(([id,v])=>v[1]===stat&&(v[2]===type||type==='yn'&&['goals','home_runs'].includes(id)));return entry?{category:entry[0],name:type==='yn'&&entry[0]==='goals'?'Anytime goal':entry[1][0]}:null}
export function categoryMatches(pick,category){return category==='mixed'||(category==='game'?pick.market!=='prop':pick.category===category)}
export function categoryOddIds(sport,category){
 if(category==='game')return GAME_ODD_IDS;
 const props=Object.entries(sports[sport]||{}).filter(([id])=>category==='mixed'||id===category).flatMap(([id,v])=>[...((v[2]==='yn'?['yes']:['over','under']).map(side=>`${v[1]}-PLAYER_ID-game-${v[2]}-${side}`)),...(['goals','home_runs'].includes(id)?[`${v[1]}-PLAYER_ID-game-yn-yes`]:[])]);
 return [...(category==='mixed'?GAME_ODD_IDS.split(','):[]),...props].join(',');
}
export function propLabel(player,definition,side,line){return `${player} · ${definition.name}${line===null?'':` ${side==='over'?'over':'under'} ${line}`}`}
