(function () {
  var theme = localStorage.getItem('pratik-theme') || 'amoled';
  if (theme !== 'amoled' && theme !== 'beige' && theme !== 'sunshine') theme = 'amoled';
  document.documentElement.setAttribute('data-theme', theme);
})();
