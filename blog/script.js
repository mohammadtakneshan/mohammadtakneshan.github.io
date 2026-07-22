/* Theme toggle — same localStorage key as portfolio site */
(function () {
  var themeBtn = document.getElementById('themeBtn');
  var saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  }
  if (!themeBtn) return;
  themeBtn.addEventListener('click', function () {
    var dark = document.documentElement.dataset.theme === 'dark';
    document.documentElement.dataset.theme = dark ? '' : 'dark';
    localStorage.setItem('theme', dark ? 'light' : 'dark');
  });
})();
