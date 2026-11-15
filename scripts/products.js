import { renderProductCards } from "./product-card.js";

async function initProductsPage() {
  const grid = document.querySelector(".catalog-grid");

  try {
    const [productsResponse, filtersResponse] = await Promise.all([
      fetch("http://localhost:5000/api/products"),
      fetch("http://localhost:5000/api/filters"),
    ]);

    if (!productsResponse.ok || !filtersResponse.ok) {
      throw new Error("Не удалось получить данные с сервера");
    }

    const [productsData, filters] = await Promise.all([
      productsResponse.json(),
      filtersResponse.json(),
    ]);

    if (!Array.isArray(productsData) || !filters) {
      throw new Error("Некорректная структура данных API");
    }

    const products = productsData.map((product) => ({
      ...product,
      price: Number(product.price),
      oldPrice: product.oldPrice === null ? null : Number(product.oldPrice),
    }));

    renderProductCards(products, grid);

    document.dispatchEvent(
      new CustomEvent("products:rendered", {
        detail: { filters },
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
