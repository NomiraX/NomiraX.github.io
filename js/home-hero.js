// The main element is the theme's scroll container, including after PJAX swaps pages.
let heroScrollAnimation;
let heroAnimating = false;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateHeroTransition() {
  const main = document.querySelector('main');
  const hero = document.querySelector('.home-hero');
  const content = document.getElementById('home-content');
  if (!main || !hero || !content) return;
  const progress = Math.min(1, Math.max(0, main.scrollTop / hero.offsetHeight));
  hero.style.setProperty('--hero-progress', progress.toFixed(3));
  content.style.setProperty('--hero-reveal', Math.min(1, Math.max(0, (progress - .3) / .7)).toFixed(3));
}

document.querySelector('main')?.addEventListener('scroll', updateHeroTransition, { passive: true });
window.addEventListener('resize', updateHeroTransition, { passive: true });
document.addEventListener('pjax:complete', updateHeroTransition);
document.addEventListener('DOMContentLoaded', updateHeroTransition);
function cancelHeroAnimation() {
  cancelAnimationFrame(heroScrollAnimation);
  heroAnimating = false;
}
document.addEventListener('keydown', cancelHeroAnimation);

function animateHeroScroll(end) {
  const main = document.querySelector('main');
  if (!main) return;
  if (prefersReducedMotion()) {
    main.scrollTop = end;
    return;
  }
  cancelHeroAnimation();
  heroAnimating = true;
  const start = main.scrollTop;
  const distance = end - start;
  const began = performance.now();
  const duration = 1050;
  function frame(now) {
    const t = Math.min(1, (now - began) / duration);
    const eased = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    main.scrollTop = start + distance * eased;
    if (t < 1) heroScrollAnimation = requestAnimationFrame(frame);
    else heroAnimating = false;
  }
  heroScrollAnimation = requestAnimationFrame(frame);
}

function enterHomeContent() {
  const main = document.querySelector('main');
  const content = document.getElementById('home-content');
  if (!main || !content) return;
  animateHeroScroll(main.scrollTop + content.getBoundingClientRect().top - main.getBoundingClientRect().top);
}

function returnHomeHero() {
  animateHeroScroll(0);
}

// Delegate once so the control also works after PJAX replaces the cover.
document.addEventListener('click', function (event) {
  if (event.target.closest('.home-hero-scroll')) enterHomeContent();
});

let archiveNavigationInProgress = false;
document.addEventListener('click', function (event) {
  const link = event.target.closest('.home-hero-archives, .navContent a[href^="/archives"]');
  if (!link || archiveNavigationInProgress || location.pathname === '/archives/' || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      prefersReducedMotion()) return;
  event.preventDefault();
  event.stopPropagation();
  archiveNavigationInProgress = true;

  const veil = document.createElement('div');
  veil.className = 'hero-archive-transition';
  veil.setAttribute('role', 'status');
  veil.setAttribute('aria-label', '正在打开归档');
  veil.innerHTML = '<span class="hero-archive-transition-title">归档</span>' +
    '<span class="hero-archive-transition-line"></span>' +
    '<span class="hero-archive-transition-caption">ARCHIVES · 01</span>';
  document.body.appendChild(veil);
  requestAnimationFrame(() => veil.classList.add('is-visible'));

  const destination = link.href;
  let navigated = false;
  const fallback = setTimeout(() => {
    if (!navigated) window.location.assign(destination);
  }, 6000);
  document.addEventListener('pjax:complete', function finish() {
    document.removeEventListener('pjax:complete', finish);
    navigated = true;
    clearTimeout(fallback);
    setTimeout(() => {
      veil.classList.add('is-leaving');
      setTimeout(() => veil.remove(), 550);
      archiveNavigationInProgress = false;
    }, 120);
  });
  setTimeout(() => {
    if (window.pjax && typeof window.pjax.loadUrl === 'function') {
      window.pjax.loadUrl(destination, { triggerElement: link });
    } else {
      window.location.assign(destination);
    }
  }, 650);
}, true);

let homeNavigationInProgress = false;
document.addEventListener('click', function (event) {
  const link = event.target.closest('.navContent a[href="/"]');
  if (!link || homeNavigationInProgress || location.pathname === '/' ||
      event.button !== 0 || event.metaKey || event.ctrlKey ||
      event.shiftKey || event.altKey || prefersReducedMotion()) return;
  event.preventDefault();
  event.stopPropagation();
  homeNavigationInProgress = true;

  const veil = document.createElement('div');
  veil.className = 'home-return-transition';
  veil.setAttribute('role', 'status');
  veil.setAttribute('aria-label', '正在返回首页');
  veil.innerHTML = '<span class="home-return-title">返回首页</span>' +
    '<span class="home-return-line"></span>' +
    '<span class="home-return-caption">HOME · 00</span>';
  document.body.appendChild(veil);
  requestAnimationFrame(() => veil.classList.add('is-visible'));

  const destination = link.href;
  let navigated = false;
  const fallback = setTimeout(() => {
    if (!navigated) window.location.assign(destination);
  }, 6000);
  document.addEventListener('pjax:complete', function finish() {
    document.removeEventListener('pjax:complete', finish);
    navigated = true;
    clearTimeout(fallback);
    setTimeout(() => {
      veil.classList.add('is-leaving');
      setTimeout(() => veil.remove(), 500);
      homeNavigationInProgress = false;
    }, 100);
  });
  setTimeout(() => {
    if (window.pjax && typeof window.pjax.loadUrl === 'function') {
      window.pjax.loadUrl(destination, { triggerElement: link });
    } else {
      window.location.assign(destination);
    }
  }, 520);
}, true);

let postNavigationInProgress = false;
document.addEventListener('click', function (event) {
  const card = event.target.closest('a.recent-post, #Archives a[href^="/20"]');
  if (!card || postNavigationInProgress || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      prefersReducedMotion()) return;
  const innerLink = event.target.closest('a');
  if (innerLink && innerLink !== card) return;
  event.preventDefault();
  event.stopPropagation();
  postNavigationInProgress = true;

  const rect = card.getBoundingClientRect();
  const veil = document.createElement('div');
  veil.className = 'post-open-veil';
  veil.style.left = rect.left + 'px';
  veil.style.top = rect.top + 'px';
  veil.style.width = rect.width + 'px';
  veil.style.height = rect.height + 'px';
  veil.setAttribute('role', 'status');
  veil.setAttribute('aria-label', '正在打开文章');
  const title = document.createElement('span');
  title.className = 'post-open-title';
  title.textContent = card.querySelector('.recent-title')?.textContent?.trim() || card.textContent.trim();
  veil.appendChild(title);
  const caption = document.createElement('span');
  caption.className = 'post-open-caption';
  caption.textContent = 'OPENING ARTICLE';
  veil.appendChild(caption);
  document.body.appendChild(veil);
  requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('is-expanded')));

  const destination = card.href;
  let navigated = false;
  const fallback = setTimeout(() => {
    if (!navigated) window.location.assign(destination);
  }, 6000);
  document.addEventListener('pjax:complete', function finish() {
    document.removeEventListener('pjax:complete', finish);
    navigated = true;
    clearTimeout(fallback);
    setTimeout(() => {
      veil.classList.add('is-leaving');
      setTimeout(() => veil.remove(), 400);
      postNavigationInProgress = false;
    }, 100);
  });
  setTimeout(() => {
    if (window.pjax && typeof window.pjax.loadUrl === 'function') {
      window.pjax.loadUrl(destination, { triggerElement: card });
    } else {
      window.location.assign(destination);
    }
  }, 620);
}, true);

// A scroll gesture on the first screen runs the whole transition.
document.querySelector('main')?.addEventListener('wheel', function (event) {
  const hero = document.querySelector('.home-hero');
  if (!hero) return;
  if (heroAnimating) {
    event.preventDefault();
    if (event.deltaY < 0) cancelHeroAnimation();
    return;
  }
  if (event.deltaY > 0 && this.scrollTop < hero.offsetHeight * .06) {
    event.preventDefault();
    enterHomeContent();
  } else if (event.deltaY < 0 && this.scrollTop > hero.offsetHeight * .72 &&
             this.scrollTop <= hero.offsetHeight + 28) {
    event.preventDefault();
    returnHomeHero();
  }
}, { passive: false });

let heroTouchStartY = null;
document.querySelector('main')?.addEventListener('touchstart', function (event) {
  heroTouchStartY = event.touches[0]?.clientY ?? null;
  if (heroAnimating) cancelHeroAnimation();
}, { passive: true });
document.querySelector('main')?.addEventListener('touchmove', function (event) {
  if (heroTouchStartY === null || !event.touches[0]) return;
  const hero = document.querySelector('.home-hero');
  if (!hero) return;
  const distance = heroTouchStartY - event.touches[0].clientY;
  if (distance > 45 && this.scrollTop < hero.offsetHeight * .06) {
    event.preventDefault();
    heroTouchStartY = null;
    enterHomeContent();
  } else if (distance < -45 && this.scrollTop > hero.offsetHeight * .72 &&
             this.scrollTop <= hero.offsetHeight + 28) {
    event.preventDefault();
    heroTouchStartY = null;
    returnHomeHero();
  }
}, { passive: false });
document.querySelector('main')?.addEventListener('touchend', () => { heroTouchStartY = null; }, { passive: true });

let heroTypingTimer;
function startHeroTyping() {
  clearTimeout(heroTypingTimer);
  const element = document.querySelector('.home-hero-typed');
  if (!element) return;
  const output = element.querySelector('.home-hero-typed-text');
  let lines;
  try { lines = JSON.parse(element.dataset.lines); } catch (_) { return; }
  if (!Array.isArray(lines) || !lines.length || !output) return;
  lines = lines.filter(line => typeof line === 'string' && line.length);
  if (!lines.length) return;
  if (prefersReducedMotion()) {
    output.textContent = lines[0];
    return;
  }
  let lineIndex = 0;
  let position = 0;
  let deleting = false;
  output.textContent = '';

  function tick() {
    if (!element.isConnected) return;
    const characters = Array.from(lines[lineIndex]);
    position += deleting ? -1 : 1;
    output.textContent = characters.slice(0, position).join('');
    let delay = deleting ? 65 : 135;
    if (position === characters.length && !deleting) {
      deleting = true;
      delay = 2400;
    } else if (position === 0 && deleting) {
      deleting = false;
      lineIndex = (lineIndex + 1) % lines.length;
      delay = 500;
    }
    heroTypingTimer = setTimeout(tick, delay);
  }
  heroTypingTimer = setTimeout(tick, 450);
}

document.addEventListener('DOMContentLoaded', startHeroTyping);
document.addEventListener('pjax:complete', startHeroTyping);
