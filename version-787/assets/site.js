(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(text) {
    return (text || "").toString().trim().toLowerCase();
  }

  ready(function() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function() {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function(form) {
      form.addEventListener("submit", function(event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
        }
      });
    });

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      dots.forEach(function(dot, index) {
        dot.addEventListener("click", function() {
          showSlide(index);
        });
      });

      window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function(scope) {
      var searchInput = scope.querySelector("[data-live-search]");
      var categorySelect = scope.querySelector("[data-filter-category]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var result = scope.querySelector("[data-result-count]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

      if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
      }

      function applyFilters() {
        var term = normalize(searchInput ? searchInput.value : "");
        var category = categorySelect ? categorySelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var visible = 0;

        cards.forEach(function(card) {
          var text = normalize(card.getAttribute("data-search") || card.textContent);
          var matchTerm = !term || text.indexOf(term) !== -1;
          var matchCategory = !category || card.getAttribute("data-category") === category;
          var matchYear = !year || card.getAttribute("data-year") === year;
          var matchType = !type || card.getAttribute("data-type") === type;
          var matched = matchTerm && matchCategory && matchYear && matchType;
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = "已筛选 " + visible + " 部影片";
        }
      }

      [searchInput, categorySelect, yearSelect, typeSelect].forEach(function(control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    });
  });
})();
