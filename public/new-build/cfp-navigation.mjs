// Carry an explicit practice destination; never infer it from another pool's cache.
export function playoffNavigation(params,{pool=null,season=null}={}){
 const practice=params.get('demo')==='1';
 const originPool=practice?(params.get('returnPool')||params.get('pool')):params.get('event')==='links'?null:(params.get('pool')||pool);
 const year=params.get('returnSeason')||season;
 const target=new URLSearchParams(originPool?{pool:String(originPool)}:{event:'links'});
 if(originPool&&year)target.set('season',String(year));
 const demo=new URLSearchParams({demo:'1'});
 if(originPool){demo.set('returnPool',String(originPool));if(year)demo.set('returnSeason',String(year));}
 else demo.set('returnEvent','links');
 return {practiceHref:'./cfp.html?'+demo,returnHref:'./cfp.html?'+target,returnLabel:originPool?'Back to your pool bracket':'Back to the pool challenge'};
}
