// Presentation only: game artwork never changes pool, player, week, or routing.
(()=>{
 const page=location.pathname.split('/').pop().replace(/\.html$/,'');
 const games={nfl:['NFL Pick’em','06_30_15'],college:['College Pick’em','06_30_10'],survivor:['Survivor','06_29_27'],confidence:['Confidence','06_29_45'],game33:['Game 33','06_29_50'],'march-madness':['March Madness','06_30_04'],golf:['Golf','06_30_00'],nascar:['NASCAR','06_29_55'],fantasy:['Fantasy','06_29_32'],custom:['Custom Pool','06_29_20']};
 const aliases={'33':'game33',march:'march-madness',masters:'golf','nfl pick’em':'nfl',"nfl pick'em":'nfl','college pick’em':'college',"college pick'em":'college','game 33':'game33','march madness':'march-madness','custom pool':'custom'};
 const q=new URLSearchParams(location.search),requested=(q.get('game')||q.get('sport')||'').toLowerCase();
 let key=games[page]?page:null;
 if(['nfl-scores','nfl-standings','compare-picks','pick-tools','year-standings'].includes(page))key='nfl';
 if(['commissioner','game-setup','pool-room','my-picks','results'].includes(page))key=aliases[requested]||requested||(page==='commissioner'?'nfl':null);
 if(!games[key])return;
 function mount(){
 if(document.querySelector('#linksGameArtwork,.college-hero')||page==='nfl')return;
 const [name,time]=games[key],img=document.createElement('img');img.id='linksGameArtwork';img.src='./assets/ChatGPT Image Sep 22, 2026, '+time+' PM.png';img.alt=name;img.setAttribute('fetchpriority','high');
 const style=document.createElement('style');style.textContent='.links-art-hero{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(200px,36%);align-items:center;gap:24px;background:#06111a!important;min-height:0!important;padding:24px 5%!important}.links-art-hero:after{display:none!important}.links-art-hero>div{min-width:0}.links-art-hero #linksGameArtwork{width:100%;height:280px;object-fit:contain;position:relative}.links-game-banner{margin:16px auto;max-width:1180px;background:#06111a;border:1px solid #315168;border-radius:12px;overflow:hidden;grid-column:1/-1}.links-game-banner img{display:block;width:100%;height:clamp(180px,30vw,300px);object-fit:contain}@media(max-width:600px){.links-art-hero{grid-template-columns:1fr;gap:12px;padding:20px 14px!important}.links-art-hero #linksGameArtwork{height:220px;grid-row:1}.links-art-hero h1{font-size:32px!important}.links-game-banner{margin:12px}}';document.head.append(style);
 const hero=document.querySelector('section.hero');
 if(hero){const copy=document.createElement('div');while(hero.firstChild)copy.append(hero.firstChild);hero.append(copy,img);hero.classList.add('links-art-hero')}
 else{const main=document.querySelector('main');if(!main)return;const banner=document.createElement('section');banner.className='links-game-banner';banner.setAttribute('aria-label',name);banner.append(img);main.before(banner)}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
