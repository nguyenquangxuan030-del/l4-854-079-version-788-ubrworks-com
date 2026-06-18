(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var toggle = qs('.mobile-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var root = qs('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = qsa('.hero-slide', root);
    var dots = qsa('.hero-dot', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function initRankTabs() {
    var buttons = qsa('[data-rank-tab]');
    var panels = qsa('[data-rank-panel]');
    if (!buttons.length || !panels.length) {
      return;
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var key = button.getAttribute('data-rank-tab');
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item.getAttribute('data-rank-tab') === key);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle('is-active', panel.getAttribute('data-rank-panel') === key);
        });
      });
    });
  }

  function initGridFilter() {
    qsa('[data-grid-filter]').forEach(function (panel) {
      var input = qs('[data-filter-input]', panel);
      var grid = qs('[data-filter-grid]');
      var cards = grid ? qsa('.movie-card', grid) : [];
      var activeTerm = '';

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedTerm = !activeTerm || text.indexOf(activeTerm.toLowerCase()) !== -1;
          card.style.display = matchedKeyword && matchedTerm ? '' : 'none';
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      qsa('[data-filter-term]', panel).forEach(function (button) {
        button.addEventListener('click', function () {
          activeTerm = button.getAttribute('data-filter-term') || '';
          qsa('[data-filter-term]', panel).forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<a class="tag" href="search.html?q=' + encodeURIComponent(tag) + '">' + escapeHtml(tag) + '</a>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="movie-poster" href="' + item.url + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="category-pill" style="--pill-color: ' + item.color + '">' + escapeHtml(item.category) + '</span>',
      '</a>',
      '<div class="movie-info">',
      '<a href="' + item.url + '"><h3>' + escapeHtml(item.title) + '</h3></a>',
      '<p>' + escapeHtml(item.summary) + '</p>',
      '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initSearchPage() {
    var results = qs('[data-search-results]');
    var summary = qs('[data-search-summary]');
    var input = qs('[data-search-page-input]');
    if (!results || !summary || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q') || '';
    if (input) {
      input.value = keyword;
    }
    keyword = keyword.trim().toLowerCase();
    if (!keyword) {
      return;
    }
    var matched = window.MOVIE_SEARCH_DATA.filter(function (item) {
      return [item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(' '), item.summary]
        .join(' ')
        .toLowerCase()
        .indexOf(keyword) !== -1;
    }).slice(0, 96);
    summary.textContent = matched.length ? '搜索结果' : '没有找到匹配影片，试试其他关键词。';
    results.innerHTML = matched.map(cardTemplate).join('');
  }

  window.setupMoviePlayer = function (streamUrl) {
    var video = qs('#movie-player');
    var button = qs('[data-player-play]');
    if (!video || !button || !streamUrl) {
      return;
    }
    var loaded = false;
    var hls = null;

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        button.innerHTML = '<strong>视频暂时无法播放，请稍后重试</strong>';
      }
    }

    function play() {
      attach();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      button.classList.remove('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initRankTabs();
    initGridFilter();
    initSearchPage();
  });
})();
