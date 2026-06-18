(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function() {
    document.querySelectorAll("[data-player]").forEach(function(player) {
      var video = player.querySelector("video");
      var trigger = player.querySelector("[data-play]");
      var message = player.querySelector(".player-message");
      var stream = player.getAttribute("data-stream");
      var hlsInstance = null;
      var loaded = false;

      if (!video || !stream) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function attachStream() {
        if (loaded) {
          return;
        }

        loaded = true;
        setMessage("正在加载");

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
            setMessage("");
          });
          hlsInstance.on(window.Hls.Events.ERROR, function(event, data) {
            if (data && data.fatal) {
              setMessage("视频加载失败，请稍后再试");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.addEventListener("loadedmetadata", function() {
            setMessage("");
          }, { once: true });
        } else {
          setMessage("视频加载失败，请稍后再试");
        }
      }

      function startPlayback() {
        attachStream();
        player.classList.add("is-playing");
        video.controls = true;
        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function() {
            player.classList.remove("is-playing");
          });
        }
      }

      if (trigger) {
        trigger.addEventListener("click", startPlayback);
      }

      video.addEventListener("click", function() {
        if (video.paused) {
          startPlayback();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function() {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function() {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });

      window.addEventListener("beforeunload", function() {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
