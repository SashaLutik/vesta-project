/* Форматирование цены */
function formatPrice(value) {
  return value.toLocaleString("ru-RU") + " ₽";
}

/* клон одной карточки товара */
function createProductCard(product) {
  const template = document.getElementById("product-card-template");
  const card = template.content.cloneNode(true);

  const cardEl = card.querySelector(".product-card");
  const imageEl = card.querySelector(".product-card__image");
  const priceEl = card.querySelector(".product-card__price");
  const oldPriceEl = card.querySelector(".product-card__old-price");
  const discountEl = card.querySelector(".product-card__discount-badge");
  const brandEl = card.querySelector(".product-card__brand");
  const nameEl = card.querySelector(".product-card__name");

  imageEl.src = product.image;
  imageEl.alt = product.name;
  priceEl.textContent = formatPrice(product.price);
  brandEl.textContent = product.brand;
  nameEl.textContent = product.name;

  if (product.isSale && product.oldPrice && product.discount) {
    oldPriceEl.textContent = formatPrice(product.oldPrice);
    discountEl.textContent = `-${product.discount}%`;
    cardEl.classList.add("product-card--sale");
    priceEl.classList.add("product-card__price--sale");
  } else {
    oldPriceEl.remove();
    discountEl.remove();
  }

  /* данные товара в data атрибуты для фильтров */
  cardEl.dataset.id = product.id;
  cardEl.dataset.category = product.category.join(",");
  cardEl.dataset.color = product.color.join(",");
  cardEl.dataset.material = product.material.join(",");
  cardEl.dataset.gender = product.gender.join(",");
  cardEl.dataset.brand = product.brand.toLowerCase();

  return card;
}

/* рендеринг карточек товаров */
function renderProductCard(products, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  products.forEach((product) => {
    fragment.appendChild(createProductCard(product));
  });

  container.appendChild(fragment);
}

async function loadProducts(url = "../data/cards.json") {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Не удалось загрузить cards.json");
  return await response.json();
}

async function initProductsPage() {
  try {
    const data = await loadProducts();
    renderProductCard(data.products, ".catalog-grid");
    return data;
  } catch (error) {
    console.error("Ошибка загрузки карточек:", error);
    return null;
  }
}

initProductsPage();
