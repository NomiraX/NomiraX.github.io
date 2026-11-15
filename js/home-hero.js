// Delegate once so the control also works after PJAX replaces the cover.
document.addEventListener('click', function (event) {
  if (!event.target.closest('.home-hero-scroll')) return;
  const main = document.querySelector('main');
  const content = document.getElementById('home-content');
  if (!main || !content) return;
  main.scrollTo({
    top: main.scrollTop + content.getBoundingClientRect().top - main.getBoundingClientRect().top,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  });
});

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
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
