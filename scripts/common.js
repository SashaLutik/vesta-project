const $ = (selector) => document.querySelector(selector);

const input = $(".search-bar__input");
const topBurger = $(".header-burger--top");
const topMenu = $(".header-top__actions");
const topClose = $(".header-top__close");
const bottomBurger = $(".header-burger--bottom");
const bottomMenu = $(".nav-links__list");

const setMenu = (menu, burger, isOpen, lockScroll = false) => {
  if (!menu) return;

  menu.classList.toggle("is-open", isOpen);
  burger?.classList.toggle("is-active", isOpen);

  if (lockScroll) {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }
};

const toggleMenu = (menu, burger, lockScroll = false) => {
  if (menu) {
    setMenu(menu, burger, !menu.classList.contains("is-open"), lockScroll);
  }
};

// Поиск
function updatePlaceholder() {
  if (input) {
    input.placeholder =
      window.innerWidth >= 1140
        ? "Искать одежду, обувь, аксессуары..."
        : "Искать одежду, обувь...";
  }
}

updatePlaceholder();
window.addEventListener("resize", updatePlaceholder);

// Верхнее меню
topBurger?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu(topMenu, topBurger, true);
});

topClose?.addEventListener("click", () => {
  setMenu(topMenu, topBurger, false, true);
});

document.querySelectorAll(".main-nav__list a").forEach((link) => {
  link.addEventListener("click", () => {
    setMenu(topMenu, topBurger, false, true);
  });
});

// Меню категорий
bottomBurger?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu(bottomMenu, bottomBurger);
});

bottomMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    setMenu(bottomMenu, bottomBurger, false);
  });
});

// Закрытие меню при клике вне них
document.addEventListener("click", (e) => {
  if (!topMenu?.contains(e.target) && !topBurger?.contains(e.target)) {
    setMenu(topMenu, topBurger, false, true);
  }

  if (!bottomMenu?.contains(e.target) && !bottomBurger?.contains(e.target)) {
    setMenu(bottomMenu, bottomBurger, false);
  }
});

// Адаптация меню при изменении ширины окна
window.addEventListener("resize", () => {
  if (window.innerWidth > 520) {
    setMenu(topMenu, topBurger, false, true);
  }

  if (window.innerWidth > 750) {
    setMenu(bottomMenu, bottomBurger, false);
  }
});
