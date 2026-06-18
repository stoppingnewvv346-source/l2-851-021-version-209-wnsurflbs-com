(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileNav() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var dots = hero.querySelector("[data-hero-dots]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            if (dots) {
                Array.prototype.slice.call(dots.children).forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (dots) {
            slides.forEach(function (_, i) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.setAttribute("aria-label", "切换推荐影片");
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
                dots.appendChild(dot);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initCatalogFilter() {
        var input = document.querySelector(".catalog-filter");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-filter]"));
        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-filter") || "").toLowerCase();
                card.classList.toggle("is-filtered-out", keyword && text.indexOf(keyword) === -1);
            });
        });
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function createSearchCard(item) {
        var article = document.createElement("article");
        article.className = "movie-card";
        article.innerHTML = [
            '<a class="poster-link" href="' + item.url + '">',
            '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy">',
            '<span class="poster-play">播放</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="card-meta"><span>' + item.year + '</span><span>' + item.type + '</span><span>' + item.region + '</span></div>',
            '<h3><a href="' + item.url + '">' + item.title + '</a></h3>',
            '<p>' + item.desc + '</p>',
            '<div class="tag-row"><span>' + item.category + '</span></div>',
            '</div>'
        ].join("");
        return article;
    }

    function initSearchPage() {
        var form = document.querySelector("[data-search-page-form]");
        var input = document.querySelector("[data-search-page-input]");
        var grid = document.querySelector("[data-search-results]");
        var status = document.querySelector("[data-search-status]");
        if (!form || !input || !grid || !status || !window.SEARCH_MOVIES) {
            return;
        }

        function render(keyword) {
            var value = keyword.trim().toLowerCase();
            grid.innerHTML = "";
            if (!value) {
                status.textContent = "请输入关键词开始搜索";
                return;
            }
            var result = window.SEARCH_MOVIES.filter(function (item) {
                return item.index.indexOf(value) !== -1;
            }).slice(0, 120);
            status.textContent = result.length ? "为你找到相关影片" : "没有找到相关影片";
            result.forEach(function (item) {
                grid.appendChild(createSearchCard(item));
            });
        }

        var q = getQueryValue("q");
        if (q) {
            input.value = q;
            render(q);
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var keyword = input.value.trim();
            var url = new URL(window.location.href);
            if (keyword) {
                url.searchParams.set("q", keyword);
            } else {
                url.searchParams.delete("q");
            }
            window.history.replaceState({}, "", url.toString());
            render(keyword);
        });
        input.addEventListener("input", function () {
            render(input.value);
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-video");
        var layer = document.getElementById("play-layer");
        if (!video || !layer || !streamUrl) {
            return;
        }
        var attached = false;
        var hls = null;

        function attachStream() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }
            video.src = streamUrl;
        }

        function playVideo() {
            attachStream();
            layer.classList.add("is-hidden");
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {
                    layer.classList.remove("is-hidden");
                });
            }
        }

        layer.addEventListener("click", playVideo);
        video.addEventListener("play", function () {
            layer.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                layer.classList.remove("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            layer.classList.remove("is-hidden");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initMobileNav();
        initHero();
        initCatalogFilter();
        initSearchPage();
    });
}());
