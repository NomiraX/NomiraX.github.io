// The Arknights theme scrolls <main>, not window.
(function () {
  const main = document.querySelector('main');
  const bar = document.getElementById('reading-progress');
  if (!main || !bar) return;

  let queued = false;
  function update() {
    queued = false;
    const isPost = !!document.querySelector('.site-content #post-bg') &&
      !document.querySelector('.site-content .posts, .site-content #Archives');
    bar.classList.toggle('is-visible', isPost);
    if (!isPost) return;
    const scrollable = Math.max(1, main.scrollHeight - main.clientHeight);
    const progress = Math.min(100, Math.max(0, main.scrollTop / scrollable * 100));
    bar.style.setProperty('--read-progress', (progress / 100).toFixed(4));
    bar.setAttribute('aria-valuenow', String(Math.round(progress)));
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  main.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('pjax:complete', () => {
    schedule();
    setTimeout(schedule, 500);
  });
  schedule();
})();
