export const formatPrice = (value) => value.toLocaleString("ru-RU") + " ₽";

export function createProductCard(product) {
  const template = document.getElementById("product-card-template");
  if (!template) throw new Error("Не найден шаблон карточки товара");

  const card = template.content.cloneNode(true);
  const $ = (selector) => card.querySelector(selector);

  const cardEl = $(".product-card");
  const image = $(".product-card__image");
  const price = $(".product-card__price");
  const oldPrice = $(".product-card__old-price");
  const discount = $(".product-card__discount-badge");

  image.src = product.image;
  image.alt = product.name;
  price.textContent = formatPrice(product.price);
  $(".product-card__brand").textContent = product.brand;
  $(".product-card__name").textContent = product.name;

  if (product.isSale && product.oldPrice && product.discount) {
    oldPrice.textContent = formatPrice(product.oldPrice);
    discount.textContent = `-${product.discount}%`;
    cardEl.classList.add("product-card--sale");
    price.classList.add("product-card__price--sale");
  } else {
    oldPrice.remove();
    discount.remove();
  }

  cardEl.dataset.id = product.id;

  ["category", "color", "material", "gender"].forEach((key) => {
    if (product[key]) cardEl.dataset[key] = product[key].join(",");
  });

  if (product.brand) {
    cardEl.dataset.brand = product.brand.toLowerCase();
  }

  return card;
}

export function renderProductCards(products, containerSelector) {
  const container =
    typeof containerSelector === "string"
      ? document.querySelector(containerSelector)
      : containerSelector;

  if (!container || !Array.isArray(products)) return;

  const fragment = document.createDocumentFragment();

  products.forEach((product) => {
    fragment.appendChild(createProductCard(product));
  });

  container.replaceChildren(fragment);
}
