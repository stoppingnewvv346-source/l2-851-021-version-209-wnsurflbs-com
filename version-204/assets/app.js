(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-menu]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function() {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
    blocks.forEach(function(block) {
      var search = block.querySelector("[data-card-search]");
      var region = block.querySelector("[data-filter-region]");
      var year = block.querySelector("[data-filter-year]");
      var reset = block.querySelector("[data-filter-reset]");
      var cards = Array.prototype.slice.call(block.querySelectorAll(".movie-card, .ranking-row"));
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      if (q && search) {
        search.value = q;
      }

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        cards.forEach(function(card) {
          var title = (card.getAttribute("data-title") || "").toLowerCase();
          var tags = (card.getAttribute("data-tags") || "").toLowerCase();
          var type = (card.getAttribute("data-type") || "").toLowerCase();
          var cardRegion = card.getAttribute("data-region") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var textMatch = !query || title.indexOf(query) !== -1 || tags.indexOf(query) !== -1 || type.indexOf(query) !== -1 || cardRegion.toLowerCase().indexOf(query) !== -1 || cardYear.indexOf(query) !== -1;
          var regionMatch = !regionValue || cardRegion === regionValue;
          var yearMatch = !yearValue || cardYear === yearValue;
          card.classList.toggle("is-filter-hidden", !(textMatch && regionMatch && yearMatch));
        });
      }

      [search, region, year].forEach(function(el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      if (reset) {
        reset.addEventListener("click", function() {
          if (search) {
            search.value = "";
          }
          if (region) {
            region.value = "";
          }
          if (year) {
            year.value = "";
          }
          apply();
        });
      }
      apply();
    });
  }

  window.initMoviePlayer = function(url) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playerOverlay");
    if (!video || !url) {
      return;
    }
    var hls = null;
    var loaded = false;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function(event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              destroy();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      }
    }

    function destroy() {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    }

    function play() {
      load();
      var promise = video.play();
      if (promise && typeof promise.then === "function") {
        promise.then(function() {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        }).catch(function() {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      } else if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function toggle() {
      if (video.paused) {
        play();
      } else {
        video.pause();
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", toggle);
    video.addEventListener("play", function() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function() {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", destroy);
  };

  ready(function() {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
