(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var header = document.querySelector('.site-header');
        var menuButton = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.main-nav');

        function syncHeader() {
            if (!header) {
                return;
            }
            if (window.scrollY > 18 || !document.body.classList.contains('home')) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        }

        syncHeader();
        window.addEventListener('scroll', syncHeader, { passive: true });

        if (menuButton && nav) {
            menuButton.addEventListener('click', function () {
                nav.classList.toggle('is-open');
                document.body.classList.toggle('menu-open', nav.classList.contains('is-open'));
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === current);
                });
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

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    start();
                });
            }

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        document.querySelectorAll('.card-filter').forEach(function (input) {
            var target = document.querySelector(input.getAttribute('data-target'));
            if (!target) {
                return;
            }
            var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card, .compact-card'));
            var filterGroup = document.querySelector('.filter-chips[data-target="' + input.getAttribute('data-target') + '"]');
            var activeKind = 'all';

            function apply() {
                var q = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    var kind = card.getAttribute('data-kind') || '';
                    var matchedText = !q || text.indexOf(q) !== -1;
                    var matchedKind = activeKind === 'all' || kind === activeKind;
                    card.classList.toggle('hidden-by-filter', !(matchedText && matchedKind));
                });
            }

            input.addEventListener('input', apply);

            if (filterGroup) {
                filterGroup.querySelectorAll('.filter-chip').forEach(function (button) {
                    button.addEventListener('click', function () {
                        filterGroup.querySelectorAll('.filter-chip').forEach(function (item) {
                            item.classList.remove('is-active');
                        });
                        button.classList.add('is-active');
                        activeKind = button.getAttribute('data-filter-value') || 'all';
                        apply();
                    });
                });
            }
        });

        document.querySelectorAll('[data-global-search]').forEach(function (form) {
            var input = form.querySelector('input[type="search"]');
            var results = document.getElementById('global-search-results');
            if (!input || !results || !window.SEARCH_INDEX) {
                return;
            }

            function render() {
                var q = input.value.trim().toLowerCase();
                results.innerHTML = '';
                if (!q) {
                    return;
                }
                var matches = window.SEARCH_INDEX.filter(function (item) {
                    return [item.title, item.region, item.type, item.year, item.genre, item.oneLine]
                        .join(' ')
                        .toLowerCase()
                        .indexOf(q) !== -1;
                }).slice(0, 18);

                if (!matches.length) {
                    results.innerHTML = '<div class="search-result-card"><span><strong>暂无匹配影片</strong><em>可尝试其他关键词</em></span></div>';
                    return;
                }

                results.innerHTML = matches.map(function (item) {
                    return '<a class="search-result-card" href="' + item.url + '">' +
                        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
                        '<span><strong>' + item.title + '</strong><em>' + item.year + ' · ' + item.region + ' · ' + item.type + '</em></span>' +
                        '</a>';
                }).join('');
            }

            input.addEventListener('input', render);
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                render();
            });
        });
    });
})();
