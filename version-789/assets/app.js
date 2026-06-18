(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var backTop = document.querySelector('[data-back-top]');

    if (backTop) {
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      function startTimer() {
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          window.clearInterval(timer);
          showSlide(Number(dot.getAttribute('data-hero-dot')));
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterList = document.querySelector('[data-filter-list]');
    var emptyState = document.querySelector('[data-empty-state]');
    var activeRegion = 'all';
    var activeGenre = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      if (!filterList) {
        return;
      }

      var query = normalize(filterInput ? filterInput.value : '');
      var items = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card, .rank-row'));
      var visible = 0;

      items.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute('data-title'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.getAttribute('data-year'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-tags')
        ].join(' '));

        var region = item.getAttribute('data-region') || '';
        var genre = (item.getAttribute('data-genre') || '') + ' ' + (item.getAttribute('data-type') || '') + ' ' + (item.getAttribute('data-tags') || '');
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesRegion = activeRegion === 'all' || region.indexOf(activeRegion) !== -1;
        var matchesGenre = activeGenre === 'all' || genre.indexOf(activeGenre) !== -1;
        var matched = matchesQuery && matchesRegion && matchesGenre;

        item.classList.toggle('is-hidden-by-filter', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (filterInput && filterList) {
      filterInput.addEventListener('input', applyFilters);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-region]')).forEach(function (button) {
      button.addEventListener('click', function () {
        activeRegion = button.getAttribute('data-filter-region') || 'all';
        Array.prototype.slice.call(document.querySelectorAll('[data-filter-region]')).forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilters();
      });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-genre]')).forEach(function (button) {
      button.addEventListener('click', function () {
        activeGenre = button.getAttribute('data-filter-genre') || 'all';
        Array.prototype.slice.call(document.querySelectorAll('[data-filter-genre]')).forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilters();
      });
    });

    applyFilters();
  });
})();
