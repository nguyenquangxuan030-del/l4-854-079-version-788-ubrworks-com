(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function toggleMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function backTop() {
    document.querySelectorAll(".back-top").forEach(function (button) {
      button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function heroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      slides[index].classList.remove("is-active");
      dots[index].classList.remove("is-active");
      index = next;
      slides[index].classList.add("is-active");
      dots[index].classList.add("is-active");
    }
    function start() {
      timer = window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });
    start();
  }

  function filters() {
    var panel = document.querySelector(".filter-panel");
    if (!panel) {
      return;
    }
    var input = panel.querySelector("input[type='search']");
    var region = panel.querySelector("select[data-filter='region']");
    var year = panel.querySelector("select[data-filter='year']");
    var type = panel.querySelector("select[data-filter='type']");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".empty-state");
    function value(el) {
      return el ? el.value.trim() : "";
    }
    function apply() {
      var q = value(input).toLowerCase();
      var r = value(region);
      var y = value(year);
      var t = value(type);
      var visible = 0;
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.type, card.dataset.tags].join(" ").toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (r && card.dataset.region.indexOf(r) === -1) {
          ok = false;
        }
        if (y && card.dataset.year !== y) {
          ok = false;
        }
        if (t && card.dataset.type.indexOf(t) === -1) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }
    [input, region, year, type].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
  }

  function initPlayer(streamUrl) {
    var video = document.querySelector("video[data-player]");
    var cover = document.querySelector(".play-cover");
    if (!video || !streamUrl) {
      return;
    }
    var started = false;
    function begin() {
      if (started) {
        video.play();
        return;
      }
      started = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.play();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
        return;
      }
      video.src = streamUrl;
      video.play();
    }
    if (cover) {
      cover.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        begin();
      }
    });
  }

  window.MovieSite = {
    initPlayer: initPlayer
  };

  ready(function () {
    toggleMenu();
    backTop();
    heroSlider();
    filters();
  });
})();
