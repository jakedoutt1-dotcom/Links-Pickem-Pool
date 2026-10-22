// Independent footer promotion: no pool state, scores, locks or sessions are read.
if (!document.getElementById('poolDailyChallenge')) {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('./daily-promo.css?v=pool-footer1', import.meta.url).href;
  document.head.append(stylesheet);
  const card = document.createElement('section');
  card.id = 'poolDailyChallenge';
  card.className = 'daily-promo';
  card.setAttribute('aria-labelledby', 'poolDailyTitle');
  card.innerHTML = `<img class="daily-promo__art" src="${new URL('./assets/daily-challenge-hero-v1.png', import.meta.url).href}" alt="" loading="lazy" width="1672" height="941"><div class="daily-promo__copy"><span class="daily-promo__tag">TAKE THE DAILY CHALLENGE</span><h2 id="poolDailyTitle">Your picks are in.<br><span>Now take the spotlight.</span></h2><p>Spin for your bonus, tackle five tough questions, and give your friends a score to beat.</p><a class="daily-promo__action" href="${new URL('./daily-challenge.html', import.meta.url).href}">Play Daily Challenge →</a><small class="daily-promo__note">Play today’s challenge or try an unranked practice round.</small></div>`;
  const main = document.querySelector('main');
  const footer = document.querySelector('body > footer');
  if (main) main.after(card);
  else if (footer) footer.before(card);
  else document.body.append(card);
}
