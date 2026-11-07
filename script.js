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

// Header slides: append a data-header-slide figure to add an image and its own annotations.
(function () {
  document.querySelectorAll('[data-header-slider]').forEach(function (slider) {
    var slides = Array.from(slider.querySelectorAll('[data-header-slide]'));
    if (slides.length < 2) return;
    var controls = slider.querySelector('.header-slider-controls');
    var dots = slider.querySelector('.header-slider-dots');
    var title = slider.querySelector('.header-slide-title');
    var active = 0;
    var rotationDelay = 5000;
    var rotationTimer = null;
    var userPaused = false; // Autoplay starts on load; the visitor can pause explicitly.
    var rotationButton = document.createElement('button');
    rotationButton.type = 'button';
    rotationButton.className = 'header-rotation';
    slider.querySelector('.header-slider-navigation').prepend(rotationButton);
    function restartRotation() {
      window.clearTimeout(rotationTimer);
      var running = !userPaused && !document.hidden;
      title.setAttribute('aria-live', running ? 'off' : 'polite');
      rotationButton.textContent = userPaused ? '\u25b6' : '\u23f8';
      rotationButton.setAttribute('aria-label', userPaused ? 'Start automatic slide rotation' : 'Pause automatic slide rotation');
      if (running) rotationTimer = window.setTimeout(function () { show(active + 1); }, rotationDelay);
    }
    rotationButton.addEventListener('click', function () { userPaused = !userPaused; restartRotation(); });
    document.addEventListener('visibilitychange', restartRotation);
    var buttons = slides.map(function (slide, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', 'Show image ' + (index + 1) + ': ' + slide.dataset.title);
      button.addEventListener('click', function () { show(index); });
      dots.appendChild(button);
      return button;
    });
    function show(index) {
      var previous = slides[active];
      var restoreFocus = previous.contains(document.activeElement);
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) { slide.hidden = i !== active; });
      buttons.forEach(function (button, i) {
        if (i === active) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      title.textContent = (active + 1) + ' / ' + slides.length + ' — ' + slides[active].dataset.title;
      if (restoreFocus) buttons[active].focus({ preventScroll: true });
      restartRotation();
    }
    slider.querySelector('.header-prev').addEventListener('click', function () { show(active - 1); });
    slider.querySelector('.header-next').addEventListener('click', function () { show(active + 1); });
    slider.addEventListener('keydown', function (event) {
      if (event.target.matches('input, textarea, select') || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault(); show(active + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    var start = null;
    slider.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'touch' && event.target.closest('.scene-stage')) start = { x: event.clientX, y: event.clientY };
    });
    slider.addEventListener('pointerup', function (event) {
      if (!start) return;
      var dx = event.clientX - start.x, dy = event.clientY - start.y;
      start = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) show(active + (dx < 0 ? 1 : -1));
    });
    slider.addEventListener('pointercancel', function () { start = null; });
    controls.hidden = false;
    show(0);
  });
}());

// Shared enlargement view; the image links still work without JavaScript.
(function () {
  var dialog = document.querySelector('.screenshot-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var image = dialog.querySelector('img');
  var title = dialog.querySelector('h2');
  document.querySelectorAll('[data-tool-screenshot]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      var source = link.querySelector('img');
      image.src = link.href;
      image.alt = source.alt;
      title.textContent = link.closest('figure').querySelector('figcaption').firstChild.textContent;
      dialog.showModal();
    });
  });
  dialog.querySelector('.screenshot-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) {
    var bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
}());
