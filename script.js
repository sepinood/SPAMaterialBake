(function () {
  var menu = document.querySelector('.menu');
  var sidebar = document.querySelector('.sidebar');
  if (menu && sidebar) {
    menu.addEventListener('click', function () {
      var open = sidebar.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    sidebar.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        sidebar.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var search = document.getElementById('search');
  if (search) {
    search.addEventListener('input', function () {
      var query = search.value.trim().toLowerCase();
      document.querySelectorAll('.setting').forEach(function (row) {
        row.classList.toggle('hidden', query && row.textContent.toLowerCase().indexOf(query) === -1);
      });
    });
  }

  var links = Array.from(document.querySelectorAll('.sidebar nav a'));
  var sections = links.map(function (link) { return document.querySelector(link.getAttribute('href')); }).filter(Boolean);
  function updateActive() {
    var current = sections[0];
    sections.forEach(function (section) { if (section.getBoundingClientRect().top <= 130) current = section; });
    links.forEach(function (link) { link.classList.toggle('active', link.getAttribute('href') === '#' + current.id); });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
}());
