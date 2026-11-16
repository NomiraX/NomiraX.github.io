// The Arknights theme scrolls <main>, not window.
(function () {
  const main = document.querySelector('main');
  const bar = document.getElementById('reading-progress');
  if (!main || !bar) return;

  let queued = false;
  let isPost = false;
  let lastValue = -1;
  function update() {
    queued = false;
    if (!isPost) return;
    const scrollable = Math.max(1, main.scrollHeight - main.clientHeight);
    const progress = Math.min(100, Math.max(0, main.scrollTop / scrollable * 100));
    const value = Math.round(progress);
    if (value === lastValue) return;
    lastValue = value;
    bar.style.setProperty('--read-progress', (progress / 100).toFixed(4));
    bar.setAttribute('aria-valuenow', String(value));
  }
  function schedule() {
    if (!isPost || queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  function refreshPage() {
    isPost = !!document.querySelector('.site-content #post-bg') &&
      !document.querySelector('.site-content .posts, .site-content #Archives');
    bar.classList.toggle('is-visible', isPost);
    bar.setAttribute('aria-hidden', String(!isPost));
    lastValue = -1;
    schedule();
  }
  main.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('pjax:complete', () => {
    refreshPage();
    setTimeout(refreshPage, 500);
  });
  refreshPage();
})();
