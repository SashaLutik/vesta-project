import { renderProductCards } from "./product-card.js";

/* Слайдер главной страницы */
function initHeroCarousel() {
  const hero = document.querySelector(".hero");
  const slider = document.querySelector(".hero__slider");
  if (!hero || !slider) return;

  const dots = [...document.querySelectorAll(".hero__dot")];
  const total = slider.querySelectorAll(".hero__slide").length;
  if (total < 2) return;

  let current = 0;
  let timer;

  const goTo = (index) => {
    current = index;
    slider.style.transition = `transform ${index === 0 ? "1.2s" : "0.8s"} ease-in-out`;
    slider.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((dot, i) =>
      dot.classList.toggle("hero__dot--active", i === current),
    );
  };

  const stop = () => clearInterval(timer);

  const start = () => {
    stop();

    if (
      document.hidden ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    timer = setInterval(() => {
      if (!hero.matches(":hover")) {
        goTo((current + 1) % total);
      }
    }, 3000);
  };

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goTo(i);
      start();
    });
  });

  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start(),
  );

  start();
}

/* Популярные товары и акции */
async function initFeaturedCards() {
  const lists = document.querySelectorAll(".product-list[data-source]");
  if (!lists.length) return;

  try {
    const response = await fetch("http://localhost:5000/api/featured");

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }

    const data = await response.json();

    if (!data.popular || !data.sale) {
      throw new Error("Некорректная структура данных API");
    }

    lists.forEach((list) => {
      const products = data[list.dataset.source];

      if (Array.isArray(products)) {
        const normalizedProducts = products.map((product) => ({
          ...product,
          image: product.image.replace("../assets/", "./assets/"),
          price: Number(product.price),
          oldPrice: product.oldPrice === null ? null : Number(product.oldPrice),
        }));

        renderProductCards(normalizedProducts, list, "./pages/product.html");
      }
    });
  } catch (error) {
    console.error("Ошибка загрузки товаров:", error);
  }
}

initHeroCarousel();
initFeaturedCards();
