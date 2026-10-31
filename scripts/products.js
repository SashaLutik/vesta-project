import { renderProductCards } from "./product-card.js";

async function initProductsPage() {
  const grid = document.querySelector(".catalog-grid");

  try {
    const response = await fetch("../data/cards.json");
    if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);

    const data = await response.json();

    if (!Array.isArray(data.products) || !data.filters) {
      throw new Error("Некорректная структура cards.json");
    }

    renderProductCards(data.products, grid);

    document.dispatchEvent(
      new CustomEvent("products:rendered", {
        detail: { filters: data.filters },
      }),
    );
  } catch (error) {
    console.error("Ошибка загрузки каталога:", error);

    if (grid) {
      grid.textContent =
        "Не удалось загрузить товары. Попробуйте обновить страницу.";
    }
  }
}

initProductsPage();
