(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === activeIndex);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === activeIndex);
            });
        };

        var startTimer = function () {
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterScope = document.querySelector('[data-filter-scope]');

    if (filterInput && filterScope) {
        var filterCards = Array.prototype.slice.call(filterScope.querySelectorAll('[data-card]'));
        filterInput.addEventListener('input', function () {
            var query = filterInput.value.trim().toLowerCase();
            filterCards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
            });
        });
    }

    var searchInput = document.querySelector('[data-global-search]');
    var searchResults = document.querySelector('[data-search-results]');

    if (searchInput && searchResults && typeof MOVIE_INDEX !== 'undefined') {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        searchInput.value = initialQuery;

        var renderResults = function (query) {
            var value = query.trim().toLowerCase();
            if (!value) {
                return;
            }
            var matches = MOVIE_INDEX.filter(function (movie) {
                return movie.text.indexOf(value) !== -1;
            }).slice(0, 80);

            searchResults.innerHTML = matches.map(function (movie) {
                return [
                    '<article class="movie-card">',
                    '    <a class="poster-link" href="' + movie.url + '" aria-label="' + movie.title + '">',
                    '        <img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
                    '        <span class="poster-badge">' + movie.type + '</span>',
                    '    </a>',
                    '    <div class="card-body">',
                    '        <div class="card-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span></div>',
                    '        <h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
                    '        <p>' + movie.desc + '</p>',
                    '        <div class="tag-row"><span>' + movie.genre + '</span></div>',
                    '    </div>',
                    '</article>'
                ].join('');
            }).join('');
        };

        searchInput.addEventListener('input', function () {
            renderResults(searchInput.value);
        });

        renderResults(initialQuery);
    }
})();
