const input = document.querySelector(".search-bar__input");

window.addEventListener("resize", function () {
  input.setAttribute(
    "placeholder",
    this.innerWidth >= 1140
      ? "Искать одежду, обувь, аксессуары..."
      : "Искать одежду, обувь...",
  );
});

/* верхнее меню */
const topBurger = document.querySelector(".header-burger--top");
const topActions = document.querySelector(".header-top__actions");
const topCloseBtn = document.querySelector(".header-top__close");
const toggleTopMenu = () => {
  const willOpen = !topActions.classList.contains("is-open");
  topActions.classList.toggle("is-open", willOpen);
  topBurger.classList.toggle("is-active", willOpen);
  if (willOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
};
if (topBurger && topActions) {
  topBurger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleTopMenu();
  });
}
if (topCloseBtn && topActions) {
  topCloseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleTopMenu();
  });
}

const topNavLinks = document.querySelectorAll(".main-nav__list a");
topNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (topActions.classList.contains("is-open")) {
      toggleTopMenu();
    }
  });
});

/* меню категорий */
const bottomBurger = document.querySelector(".header-burger--bottom");
const navLinksList = document.querySelector(".nav-links__list");
const toggleBottomMenu = () => {
  const willOpen = !navLinksList.classList.contains("is-open");
  navLinksList.classList.toggle("is-open", willOpen);
  bottomBurger.classList.toggle("is-active", willOpen);
};

if (bottomBurger && navLinksList) {
  bottomBurger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleBottomMenu();
  });
}
const bottomNavLinks = document.querySelectorAll(".nav-links__list a");
bottomNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (navLinksList.classList.contains("is-open")) {
      toggleBottomMenu();
    }
  });
});

document.addEventListener("click", (e) => {
  const isClickInsideTop = topActions && topActions.contains(e.target);
  const isTopBurgerClick = topBurger && topBurger.contains(e.target);
  const isClickInsideBottom = navLinksList && navLinksList.contains(e.target);
  const isBottomBurgerClick = bottomBurger && bottomBurger.contains(e.target);
  if (
    !isClickInsideTop &&
    !isTopBurgerClick &&
    !isClickInsideBottom &&
    !isBottomBurgerClick
  ) {
    if (topActions.classList.contains("is-open")) {
      toggleTopMenu();
    }
    if (navLinksList.classList.contains("is-open")) {
      toggleBottomMenu();
    }
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 520) {
    if (topActions.classList.contains("is-open")) {
      toggleTopMenu();
    }
  }
  if (window.innerWidth > 750) {
    if (navLinksList.classList.contains("is-open")) {
      toggleBottomMenu();
    }
  }
  if (window.innerWidth > 520) {
    document.body.style.overflow = "";
  }
});
