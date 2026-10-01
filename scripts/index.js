/* бесконечная карусель */
const slider = document.querySelector(".hero__slider");
const dots = document.querySelectorAll(".hero__dot");
const slides = document.querySelectorAll(".hero__slide").length;

let currentIndex = 0;

const firstSlideClone = slider.firstElementChild.cloneNode(true);
slider.appendChild(firstSlideClone);

setInterval(() => {
  currentIndex++;
  slider.style.transition = "0.8s";
  slider.style.transform = `translateX(-${currentIndex * 100}%)`;

  const dotIndex = currentIndex % slides;
  dots.forEach((dot, index) => {
    dot.classList.toggle("hero__dot--active", index === dotIndex);
  });

  if (currentIndex === slides) {
    setTimeout(() => {
      slider.style.transition = "none";
      slider.style.transform = "translateX(0)";
      currentIndex = 0;
      dots.forEach((dot, index) => {
        dot.classList.toggle("hero__dot--active", index === 0);
      });
    }, 800);
  }
}, 3000);

/* карточки товаров по секциям */
function formatPrice(value) {
  return value.toLocaleString("ru-RU") + " ₽";
}

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

  return card;
}

function renderProductCard(products, container) {
  if (!container) return;

  container.innerHTML = "";
  const fragment = document.createDocumentFragment();
  products.forEach((product) => {
    fragment.appendChild(createProductCard(product));
  });
  container.appendChild(fragment);
}

async function initFeaturedCards() {
  try {
    const res = await fetch("./data/featured.json");
    if (!res.ok) throw new Error("Не удалось загрузить featured.json");
    const data = await res.json();

    document.querySelectorAll(".product-list[data-source]").forEach((list) => {
      const source = list.dataset.source;
      if (Array.isArray(data[source])) {
        renderProductCard(data[source], list);
      }
    });
  } catch (err) {
    console.error("Ошибка загрузки витрины:", err);
  }
}

initFeaturedCards();