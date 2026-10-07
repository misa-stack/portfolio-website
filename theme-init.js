/* Run before CSS to avoid a bright flash when revisiting a dark theme. */
(function () {
  document.documentElement.classList.add('js');
  try {
    const theme = localStorage.getItem('portfolio-theme');
    if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  } catch (_) { /* Storage may be unavailable in private or restricted contexts. */ }
})();
