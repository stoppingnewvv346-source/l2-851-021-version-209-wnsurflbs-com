(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function text(value) {
        return String(value == null ? "" : value);
    }

    function escapeHtml(value) {
        return text(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function goSearch(form) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
            window.location.href = "./search.html?q=" + encodeURIComponent(query);
        }
    }

    function initHeader() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }
        document.querySelectorAll("form[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                goSearch(form);
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                var active = i === index;
                slide.classList.toggle("is-active", active);
                slide.classList.toggle("opacity-100", active);
                slide.classList.toggle("opacity-0", !active);
                slide.setAttribute("aria-hidden", active ? "false" : "true");
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
                dot.setAttribute("aria-label", "切换到第" + (i + 1) + "屏");
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5000);
    }

    function initCardFilter() {
        var input = document.querySelector("[data-card-filter]");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));
        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = text(card.getAttribute("data-card-search")).toLowerCase();
                card.classList.toggle("filter-hidden", query && haystack.indexOf(query) === -1);
            });
        });
    }

    function renderSearch() {
        var mount = document.querySelector("[data-search-results]");
        if (!mount || !window.MovieSearchData) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = text(params.get("q")).trim();
        var input = document.querySelector("[data-search-input]");
        var title = document.querySelector("[data-search-title]");
        var summary = document.querySelector("[data-search-summary]");
        if (input) {
            input.value = query;
        }
        if (!query) {
            mount.innerHTML = '<div class="text-center py-16"><div class="text-6xl mb-4">🎬</div><h2 class="text-2xl font-bold text-gray-800 mb-2">输入关键词开始搜索</h2><p class="text-gray-600">探索精选剧集内容</p></div>';
            return;
        }
        var lower = query.toLowerCase();
        var results = window.MovieSearchData.filter(function (item) {
            return [item.title, item.region, item.genre, item.tags, item.oneLine].join(" ").toLowerCase().indexOf(lower) !== -1;
        });
        if (title) {
            title.textContent = '搜索结果："' + query + '"';
        }
        if (summary) {
            summary.textContent = '为你匹配到 ' + results.length + ' 个相关条目';
        }
        if (!results.length) {
            mount.innerHTML = '<div class="text-center py-16"><div class="text-6xl mb-4">🔍</div><h2 class="text-2xl font-bold text-gray-800 mb-2">未找到相关内容</h2><p class="text-gray-600">换一个关键词继续探索</p></div>';
            return;
        }
        mount.innerHTML = results.map(function (item) {
            return '<a class="movie-card group block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white" href="' + escapeHtml(item.url) + '">'
                + '<div class="relative overflow-hidden"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"><div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div><div class="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">' + escapeHtml(item.region) + '</div></div>'
                + '<div class="p-4"><h3 class="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors text-base">' + escapeHtml(item.title) + '</h3><p class="text-sm text-gray-600 line-clamp-2 mb-2">' + escapeHtml(item.oneLine) + '</p><div class="text-xs text-gray-500">' + escapeHtml(item.genre) + '</div></div>'
                + '</a>';
        }).join("");
    }

    ready(function () {
        initHeader();
        initHero();
        initCardFilter();
        renderSearch();
    });
})();
