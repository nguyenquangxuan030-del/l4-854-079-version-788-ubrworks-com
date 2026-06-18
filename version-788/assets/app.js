(function () {
  'use strict';

  var SELECTOR_MOVIE_CARD = '.movie-card';

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var carousel = qs('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === currentIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var targetIndex = parseInt(dot.getAttribute('data-hero-dot'), 10) || 0;
        showSlide(targetIndex);
        startTimer();
      });
    });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  function initSearchAndFilters() {
    var searchInputs = qsa('[data-site-search]');
    var filterButtons = qsa('[data-filter-value]');
    var clearButtons = qsa('[data-clear-search]');
    var noResults = qs('[data-no-results]');
    var resultCount = qs('[data-result-count]');
    var activeCategory = 'all';

    function getQuery() {
      if (!searchInputs.length) {
        return '';
      }
      return normalize(searchInputs[0].value);
    }

    function filterCards() {
      var query = getQuery();
      var cards = qsa(SELECTOR_MOVIE_CARD);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var category = normalize(card.getAttribute('data-category'));
        var matchesQuery = !query || searchText.indexOf(query) !== -1;
        var matchesCategory = activeCategory === 'all' || category === activeCategory;
        var shouldShow = matchesQuery && matchesCategory;

        card.hidden = !shouldShow;
        if (shouldShow) {
          visibleCount += 1;
        }
      });

      if (noResults) {
        noResults.hidden = visibleCount !== 0;
      }

      if (resultCount) {
        resultCount.textContent = query || activeCategory !== 'all'
          ? '已找到 ' + visibleCount + ' 个匹配影片'
          : '正在展示全部影片';
      }
    }

    searchInputs.forEach(function (input) {
      input.addEventListener('input', filterCards);
    });

    clearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        searchInputs.forEach(function (input) {
          input.value = '';
        });
        filterCards();
      });
    });

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = normalize(button.getAttribute('data-filter-value')) || 'all';
        filterButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        filterCards();
      });
    });

    filterCards();
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video[data-video-src]', player);
      var button = qs('[data-play-button]', player);
      var message = qs('[data-video-message]', player);
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function setMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.hidden = !text;
      }

      function playVideo() {
        var source = video.getAttribute('data-video-src');

        if (!source) {
          setMessage('当前影片暂未配置播放源。');
          return;
        }

        button.classList.add('is-hidden');
        video.controls = true;
        setMessage('正在加载播放源，请稍候。');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().then(function () {
            setMessage('');
          }).catch(function () {
            setMessage('浏览器已加载播放源，请点击播放器控制栏继续播放。');
          });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }

          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              setMessage('');
            }).catch(function () {
              setMessage('播放源已就绪，请点击播放器控制栏继续播放。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('播放源加载异常，请刷新页面或稍后再试。');
            }
          });
          return;
        }

        setMessage('当前浏览器不支持 HLS 播放，请使用 Chrome、Edge、Safari 或 Firefox 最新版本。');
      }

      button.addEventListener('click', playVideo);
    });
  }

  function initPlayerScroll() {
    qsa('[data-scroll-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var player = qs('[data-player]');
        if (!player) {
          return;
        }
        event.preventDefault();
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroCarousel();
    initSearchAndFilters();
    initPlayers();
    initPlayerScroll();
  });
})();
