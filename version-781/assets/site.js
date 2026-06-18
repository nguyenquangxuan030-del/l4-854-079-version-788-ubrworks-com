(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) return;
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) return;
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
        if (!slides.length) return;
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) window.clearInterval(timer);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
        if (!cards.length) return;
        var search = document.querySelector('[data-page-search]');
        var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-field]'));
        var empty = document.querySelector('[data-empty-state]');

        selects.forEach(function (select) {
            var field = select.getAttribute('data-filter-field');
            var values = [];
            cards.forEach(function (card) {
                var raw = card.getAttribute('data-' + field) || '';
                raw.split(/[，,、/|;；\s]+/).forEach(function (part) {
                    var value = part.trim();
                    if (value && values.indexOf(value) === -1) values.push(value);
                });
            });
            values.sort(function (a, b) {
                return String(b).localeCompare(String(a), 'zh-Hans-CN');
            });
            values.slice(0, 80).forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        });

        function match(card) {
            var q = normalize(search ? search.value : '');
            var hay = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' '));
            if (q && hay.indexOf(q) === -1) return false;
            return selects.every(function (select) {
                var val = normalize(select.value);
                var field = normalize(card.getAttribute('data-' + select.getAttribute('data-filter-field')));
                return !val || field.indexOf(val) !== -1;
            });
        }

        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var ok = match(card);
                card.classList.toggle('hidden-card', !ok);
                if (ok) visible += 1;
            });
            if (empty) empty.hidden = visible !== 0;
        }

        if (search) search.addEventListener('input', apply);
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('.play-overlay');
            var src = player.getAttribute('data-src');
            var loaded = false;
            var hls = null;
            if (!video || !src) return;

            function load() {
                if (loaded) return;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
                loaded = true;
            }

            function play() {
                load();
                if (overlay) overlay.classList.add('is-hidden');
                var promise = video.play();
                if (promise && promise.catch) promise.catch(function () {});
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }

            video.addEventListener('play', function () {
                if (overlay) overlay.classList.add('is-hidden');
            });

            video.addEventListener('click', function () {
                if (!loaded || video.paused) {
                    play();
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hls && hls.destroy) hls.destroy();
            });
        });
    }

    function setupSearchPage() {
        var form = document.querySelector('[data-global-search-form]');
        var input = document.querySelector('[data-global-search-input]');
        var results = document.querySelector('[data-search-results]');
        var empty = document.querySelector('[data-search-empty]');
        if (!form || !input || !results || !window.moviesData) return;

        function card(movie) {
            return [
                '<article class="movie-card compact-card">',
                '<a class="poster-link" href="./' + movie.href + '">',
                '<img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="poster-glow"></span>',
                '</a>',
                '<div class="movie-card-body">',
                '<div class="card-meta">' + escapeHtml(movie.year || '') + ' · ' + escapeHtml(movie.region || '') + ' · ' + escapeHtml(movie.type || '') + '</div>',
                '<h2><a href="./' + movie.href + '">' + escapeHtml(movie.title) + '</a></h2>',
                '<p>' + escapeHtml(movie.one_line || '') + '</p>',
                '<div class="badge-row"><span>' + escapeHtml(movie.category || '') + '</span></div>',
                '</div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function run(value) {
            var q = normalize(value);
            if (!q) {
                results.innerHTML = '';
                if (empty) {
                    empty.hidden = false;
                    empty.textContent = '输入关键词后即可查找影片。';
                }
                return;
            }
            var matched = window.moviesData.filter(function (movie) {
                return normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.one_line,
                    movie.category
                ].join(' ')).indexOf(q) !== -1;
            }).slice(0, 120);
            results.innerHTML = matched.map(card).join('');
            if (empty) {
                empty.hidden = matched.length !== 0;
                empty.textContent = '没有找到相关影片。';
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            run(input.value);
            var url = new URL(window.location.href);
            url.searchParams.set('q', input.value);
            window.history.replaceState({}, '', url.toString());
        });
        input.addEventListener('input', function () {
            run(input.value);
        });
        var initial = new URL(window.location.href).searchParams.get('q') || '';
        input.value = initial;
        run(initial);
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
        setupSearchPage();
    });
}());
