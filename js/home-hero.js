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
