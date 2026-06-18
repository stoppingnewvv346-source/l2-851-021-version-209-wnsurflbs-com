(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var video = document.getElementById('movie-player');
        var button = document.getElementById('play-button');
        if (!video || !button) {
            return;
        }
        var streamUrl = button.getAttribute('data-stream-url');
        var prepared = false;
        var hlsInstance = null;

        function attach() {
            if (prepared || !streamUrl) {
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attach();
            button.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!prepared) {
                play();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    });
})();
