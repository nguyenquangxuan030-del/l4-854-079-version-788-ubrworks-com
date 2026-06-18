(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var filterInput = document.querySelector("[data-card-filter]");
    var regionSelect = document.querySelector("[data-region-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!filterInput || !cards.length) {
      return;
    }

    function apply() {
      var keyword = filterInput.value.trim().toLowerCase();
      var region = regionSelect ? regionSelect.value : "";
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.genre, card.dataset.region].join(" ").toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !region || card.dataset.region === region;
        card.style.display = matchKeyword && matchRegion ? "" : "none";
      });
    }

    filterInput.addEventListener("input", apply);
    if (regionSelect) {
      regionSelect.addEventListener("change", apply);
    }
    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var hls = null;
      var prepared = false;
      var waitingForManifest = false;

      function markReady() {
        button.classList.add("is-hidden");
      }

      function showButton() {
        if (video.paused) {
          button.classList.remove("is-hidden");
        }
      }

      function prepareAndPlay() {
        if (!stream) {
          return;
        }
        markReady();
        if (!prepared) {
          prepared = true;
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            waitingForManifest = true;
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              waitingForManifest = false;
              video.play().catch(showButton);
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                showButton();
              }
            });
            return;
          }
          video.src = stream;
        }
        if (!waitingForManifest) {
          video.play().catch(showButton);
        }
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        prepareAndPlay();
      });
      video.addEventListener("click", function () {
        if (!prepared) {
          prepareAndPlay();
        }
      });
      video.addEventListener("play", markReady);
      video.addEventListener("pause", showButton);
      video.addEventListener("ended", showButton);
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var container = document.querySelector("[data-search-results]");
    if (!form || !input || !container || !window.SiteIndex) {
      return;
    }

    function paramsQuery() {
      var params = new URLSearchParams(window.location.search);
      return params.get("q") || "";
    }

    function render(query) {
      var value = query.trim().toLowerCase();
      input.value = query;
      var results = window.SiteIndex.filter(function (item) {
        if (!value) {
          return true;
        }
        return [item.title, item.genre, item.region, item.type, item.tags, item.summary]
          .join(" ")
          .toLowerCase()
          .indexOf(value) !== -1;
      }).slice(0, 80);

      if (!results.length) {
        container.innerHTML = '<div class="search-empty">没有找到匹配的影片</div>';
        return;
      }

      container.innerHTML = results.map(function (item) {
        return '<article class="search-result">' +
          '<a href="' + item.url + '"><img src="' + item.image + '" alt="' + escapeHtml(item.title) + '"></a>' +
          '<div><h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p>' + escapeHtml(item.summary) + '</p>' +
          '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
          '<a class="card-action" href="' + item.url + '">立即观看</a></div>' +
          '</article>';
      }).join("");
    }

    function escapeHtml(text) {
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
      window.history.replaceState(null, "", url);
      render(query);
    });

    render(paramsQuery());
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
    setupSearchPage();
  });
})();
