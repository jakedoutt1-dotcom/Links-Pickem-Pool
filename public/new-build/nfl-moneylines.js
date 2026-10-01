// ESPN publishes American money lines in both scoreboard and core odds formats.
window.LINKS_NFL_MONEYLINE=function(odds,side){
 const m=odds?.moneyline?.[side],legacy=odds?.[side+'TeamOdds'];
 const values=[m?.current?.odds,m?.close?.odds,legacy?.moneyLine,legacy?.moneyline,legacy?.current?.moneyLine?.american,odds?.[side+'MoneyLine'],odds?.[side+'Moneyline']];
 for(const v of values){if(v==null||String(v).trim()==='')continue;const n=Number(v);if(Number.isFinite(n)&&Math.abs(n)>=100)return(n>0?'+':'')+n}return '';
};
