(function () {
  window.startMoviePlayer = function (sourceUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var hls = null;
    var attached = false;

    if (!video || !overlay || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = sourceUrl;
    }

    function playVideo() {
      attachSource();
      overlay.classList.add("is-hidden");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (!attached) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
