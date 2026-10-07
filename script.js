document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-links a");
  const revealEls = document.querySelectorAll(".reveal");
  const typingEl = document.querySelector(".typing-text");
  const counters = document.querySelectorAll("[data-target]");
  const countdownEl = document.querySelector(".countdown");
  const testimonialCards = document.querySelectorAll(".testimonial-card");
  const dots = document.querySelectorAll(".dot");
  const buttons = document.querySelectorAll(".btn, .nav-btn, .mini-btn");
  const forms = document.querySelectorAll("form");
  const coffeeCards = document.querySelectorAll(".coffee-card");
  const favoritesGrid = document.getElementById("favorites-grid");
  const favoritesEmpty = document.getElementById("favorites-empty");
  const favoritesKey = "coffeeFavorites";

  const getFavorites = () => {
    try {
      const savedFavorites = JSON.parse(localStorage.getItem(favoritesKey) || "[]");
      return Array.isArray(savedFavorites) ? savedFavorites : [];
    } catch (error) {
      return [];
    }
  };

  const saveFavorites = (favorites) => {
    localStorage.setItem(favoritesKey, JSON.stringify(favorites));
  };

  const setThemeIcon = () => {
    themeToggle.textContent = body.classList.contains("light-theme") ? "☀️" : "🌙";
  };

  if (localStorage.getItem("theme") === "light") {
    body.classList.add("light-theme");
  }

  setThemeIcon();

  themeToggle.addEventListener("click", () => {
    const isLightTheme = body.classList.toggle("light-theme");
    localStorage.setItem("theme", isLightTheme ? "light" : "dark");
    setThemeIcon();
  });

  const setHeaderState = () => {
    if (window.scrollY > 30) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState);

  navToggle?.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  const typeText = () => {
    if (!typingEl) return;

    const text = typingEl.dataset.text || "";
    let index = 0;

    const tick = () => {
      typingEl.textContent = text.slice(0, index);
      index += 1;

      if (index <= text.length) {
        setTimeout(tick, 80);
      } else {
        setTimeout(() => {
          index = 0;
          typingEl.textContent = "";
          tick();
        }, 1400);
      }
    };

    tick();
  };

  typeText();

  const animateCounter = (el) => {
    const target = Number(el.dataset.target || 0);
    const suffix = target % 1 !== 0 ? "" : "";
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = target * progress;
      el.textContent = Number.isInteger(target)
        ? Math.round(value)
        : value.toFixed(1);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toFixed(target % 1 === 0 ? 0 : 1);
      }
    };

    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  const updateCountdown = () => {
    if (!countdownEl) return;

    const deadline = new Date(countdownEl.dataset.deadline).getTime();
    const units = {
      days: countdownEl.querySelector('[data-unit="days"]'),
      hours: countdownEl.querySelector('[data-unit="hours"]'),
      minutes: countdownEl.querySelector('[data-unit="minutes"]'),
      seconds: countdownEl.querySelector('[data-unit="seconds"]')
    };

    const tick = () => {
      const distance = deadline - Date.now();

      if (distance <= 0) {
        Object.values(units).forEach((unit) => {
          unit.textContent = "00";
        });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      units.days.textContent = String(days).padStart(2, "0");
      units.hours.textContent = String(hours).padStart(2, "0");
      units.minutes.textContent = String(minutes).padStart(2, "0");
      units.seconds.textContent = String(seconds).padStart(2, "0");
    };

    tick();
    setInterval(tick, 1000);
  };

  updateCountdown();

  const favoriteIds = new Set(getFavorites());

  const updateFavoriteButtonState = (button, isFavorite) => {
    button.classList.toggle("is-favorite", isFavorite);
    button.textContent = isFavorite ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(isFavorite));
    button.setAttribute(
      "aria-label",
      `${isFavorite ? "Remove" : "Add"} ${button.closest(".coffee-card").querySelector("h3").textContent} from favorites`
    );
  };

  const renderFavorites = () => {
    const favoriteCoffeeCards = Array.from(coffeeCards).filter((card) =>
      favoriteIds.has(card.dataset.coffeeId)
    );

    if (favoriteCoffeeCards.length === 0) {
      favoritesGrid.innerHTML = "";
      favoritesGrid.classList.remove("has-items");
      favoritesEmpty.style.display = "block";
      return;
    }

    favoritesGrid.innerHTML = favoriteCoffeeCards
      .map(
        (card) => `
          <article class="favorite-item" data-coffee-id="${card.dataset.coffeeId}">
            <img src="${card.querySelector("img").src}" alt="${card.querySelector("img").alt}" />
            <div class="favorite-item-details">
              <h3>${card.querySelector("h3").textContent}</h3>
              <p>${card.querySelector("p").textContent}</p>
              <span class="price">${card.querySelector(".price").textContent}</span>
            </div>
            <button class="favorite-remove" type="button" aria-label="Remove ${card.querySelector("h3").textContent} from favorites">Remove</button>
          </article>
        `
      )
      .join("");

    favoritesGrid.classList.add("has-items");
    favoritesEmpty.style.display = "none";
  };

  coffeeCards.forEach((card) => {
    const coffeeId = card.dataset.coffeeId;
    const favoriteButton = card.querySelector(".favorite-btn");

    updateFavoriteButtonState(favoriteButton, favoriteIds.has(coffeeId));

    favoriteButton.addEventListener("click", () => {
      const isFavorite = favoriteIds.has(coffeeId);

      if (isFavorite) {
        favoriteIds.delete(coffeeId);
      } else {
        favoriteIds.add(coffeeId);
      }

      saveFavorites([...favoriteIds]);
      updateFavoriteButtonState(favoriteButton, !isFavorite);
      renderFavorites();
    });
  });

  favoritesGrid.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".favorite-remove");
    if (!removeButton) return;

    const favoriteItem = removeButton.closest(".favorite-item");
    const coffeeId = favoriteItem.dataset.coffeeId;
    favoriteIds.delete(coffeeId);
    saveFavorites([...favoriteIds]);

    const menuButton = document.querySelector(
      `[data-coffee-id="${coffeeId}"] .favorite-btn`
    );
    if (menuButton) {
      updateFavoriteButtonState(menuButton, false);
    }

    renderFavorites();
  });

  renderFavorites();

  let slideIndex = 0;
  const showSlide = (index) => {
    testimonialCards.forEach((card, cardIndex) => {
      const isActive = cardIndex === index;
      card.classList.toggle("active", isActive);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      slideIndex = index;
      showSlide(slideIndex);
    });
  });

  setInterval(() => {
    slideIndex = (slideIndex + 1) % testimonialCards.length;
    showSlide(slideIndex);
  }, 4200);

  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const ripple = document.createElement("span");
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.className = "ripple";

      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const button = form.querySelector("button");
      const originalText = button.textContent;
      button.textContent = "Thank you!";
      button.disabled = true;

      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        form.reset();
      }, 1800);
    });
  });

  document.querySelectorAll(".mini-btn").forEach((button) => {
    button.addEventListener("click", () => {
      button.textContent = "Added";
      setTimeout(() => {
        button.textContent = "Add to Cart";
      }, 1200);
    });
  });
});

const style = document.createElement("style");
style.textContent = `
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.55);
    transform: scale(0);
    animation: rippleAnim 0.65s linear;
    pointer-events: none;
  }

  @keyframes rippleAnim {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
