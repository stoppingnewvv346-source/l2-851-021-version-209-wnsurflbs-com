(function () {
    function attach(targetId, streamUrl) {
        var root = document.getElementById(targetId);
        if (!root) {
            return;
        }
        var video = root.querySelector("video");
        var overlay = root.querySelector("[data-play-overlay]");
        var buttons = root.querySelectorAll("[data-play-toggle]");
        var mute = root.querySelector("[data-mute-toggle]");
        var full = root.querySelector("[data-fullscreen-toggle]");
        var started = false;
        var hls = null;

        function bind() {
            if (started || !video) {
                return;
            }
            started = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            }
        }

        function update() {
            var paused = video.paused;
            if (overlay) {
                overlay.classList.toggle("is-hidden", !paused);
            }
            buttons.forEach(function (button) {
                button.setAttribute("aria-label", paused ? "播放" : "暂停");
                button.textContent = paused ? "▶" : "Ⅱ";
            });
        }

        function toggle() {
            bind();
            if (video.paused) {
                video.play().catch(function () {});
            } else {
                video.pause();
            }
            update();
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                toggle();
            });
        });
        if (overlay) {
            overlay.addEventListener("click", toggle);
        }
        video.addEventListener("click", toggle);
        video.addEventListener("play", update);
        video.addEventListener("pause", update);
        if (mute) {
            mute.addEventListener("click", function () {
                video.muted = !video.muted;
                mute.textContent = video.muted ? "静音" : "音量";
            });
        }
        if (full) {
            full.addEventListener("click", function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (root.requestFullscreen) {
                    root.requestFullscreen();
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
        update();
    }

    window.initMoviePlayer = attach;
})();
