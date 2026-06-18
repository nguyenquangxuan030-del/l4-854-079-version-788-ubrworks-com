(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function loadLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');

    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1';
    script.defer = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function bindPlayer(shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var url = shell.getAttribute('data-video-url');
    var started = false;
    var hls = null;

    if (!video || !cover || !url) {
      return;
    }

    function begin() {
      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;
      cover.classList.add('is-hidden');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }

      loadLibrary(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = url;
          video.play().catch(function () {});
        }
      });
    }

    cover.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (!started) {
        begin();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(bindPlayer);
  });
})();
