(function () {
    var initMoviePlayer = function (videoId, coverId, source) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var loaded = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        var bindSource = function () {
            if (loaded) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            loaded = true;
        };

        var playVideo = function () {
            bindSource();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        };

        if (cover) {
            cover.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        video.addEventListener('error', function () {
            if (hls) {
                hls.destroy();
                hls = null;
                loaded = false;
            }
        });
    };

    window.initMoviePlayer = initMoviePlayer;
})();
