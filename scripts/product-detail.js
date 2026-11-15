import { formatPrice } from "./product-card.js";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
let currentProduct = null;

async function loadProduct() {
  if (!productId) {
    alert("Не указан ID товара");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/products/${productId}`,
    );

    const product = await response.json();

    if (!response.ok) {
      throw new Error(product.message || "Не удалось загрузить товар");
    }
    currentProduct = product;
    document.getElementById("product-image").src = product.image;
    document.getElementById("product-image").alt = product.name;

    document.getElementById("product-brand").textContent = product.brand;
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-price").textContent = formatPrice(
      product.price,
    );

    document.getElementById("product-category").textContent =
      product.category.join(", ");

    document.getElementById("product-color").textContent =
      product.color.join(", ");

    document.getElementById("product-material").textContent =
      product.material.join(", ");

    document.getElementById("product-gender").textContent =
      product.gender.join(", ");

    const oldPrice = document.getElementById("product-old-price");

    if (product.isSale && product.oldPrice) {
      oldPrice.textContent = formatPrice(product.oldPrice);
    } else {
      oldPrice.remove();
    }
  } catch (error) {
    console.error("Ошибка загрузки товара:", error);
    alert(error.message);
  }
}

/* Удаление товара */
const deleteButton = document.getElementById("delete-product");

deleteButton.addEventListener("click", async () => {
  const isConfirmed = confirm("Вы действительно хотите удалить этот товар?");

  if (!isConfirmed) return;

  try {
    const response = await fetch(
      `http://localhost:5000/api/products/${productId}`,
      {
        method: "DELETE",
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Не удалось удалить товар");
    }

    alert("Товар успешно удалён");

    window.location.href = "catalog.html";
  } catch (error) {
    console.error("Ошибка удаления товара:", error);
    alert(error.message);
  }
});

/* Модальное окно редактирования */
const modal = document.getElementById("product-modal");
const editButton = document.getElementById("edit-product");
const closeButton = modal.querySelector(".product-modal__close");
const overlay = modal.querySelector(".product-modal__overlay");
const cancelButton = modal.querySelector("[data-modal-close]");
const form = document.getElementById("product-form");
const modalTitle = document.getElementById("product-modal-title");
const submitButton = form.querySelector('[type="submit"]');

function openModal() {
  modal.classList.add("product-modal--active");
  document.documentElement.classList.add("modal-open");
  document.body.classList.add("modal-open");
}

function closeModal() {
  modal.classList.remove("product-modal--active");
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
  modalTitle.textContent = "Добавить товар";
  submitButton.textContent = "Добавить товар";
}

function fillProductForm(product) {
  const form = document.getElementById("product-form");

  form.elements.name.value = product.name;
  form.elements.brand.value = product.brand;
  form.elements.image.value = product.image;

  form.elements.price.value = product.price;
  form.elements.oldPrice.value = product.oldPrice ?? "";
  form.elements.discount.value = product.discount ?? "";

  ["category", "color", "material"].forEach((key) => {
    const selectedValues = product[key] || [];

    form.querySelectorAll(`[name="${key}"]`).forEach((input) => {
      input.checked = selectedValues.includes(input.value);
    });
  });

  form.elements.gender.value = product.gender[0] || "женское";

  form.elements.isSale.checked = product.isSale;
}

editButton.addEventListener("click", () => {
  if (!currentProduct) return;

  fillProductForm(currentProduct);

  modalTitle.textContent = "Редактировать товар";
  submitButton.textContent = "Сохранить изменения";

  openModal();
});

closeButton.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
cancelButton.addEventListener("click", closeModal);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  const productData = {
    name: formData.get("name").trim(),
    brand: formData.get("brand").trim(),
    price: Number(formData.get("price")),
    oldPrice: formData.get("oldPrice")
      ? Number(formData.get("oldPrice"))
      : null,
    discount: formData.get("discount")
      ? Number(formData.get("discount"))
      : null,
    image: formData.get("image").trim(),
    category: formData.getAll("category"),
    color: formData.getAll("color"),
    material: formData.getAll("material"),
    gender: [formData.get("gender")],
    isSale: formData.get("isSale") === "on",
  };

  try {
    const response = await fetch(
      `http://localhost:5000/api/products/${productId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Не удалось обновить товар");
    }

    alert("Товар успешно обновлён");

    closeModal();
    window.location.reload();
  } catch (error) {
    console.error("Ошибка обновления товара:", error);
    alert(error.message);
  }
});

/* Загрузка категорий из API */
async function loadCategories() {
  const categoryOptions = document.getElementById("category-options");

  try {
    const response = await fetch("http://localhost:5000/api/categories");
    const categories = await response.json();

    if (!response.ok) {
      throw new Error("Не удалось загрузить категории");
    }

    categoryOptions.replaceChildren();

    categories.forEach((category) => {
      const label = document.createElement("label");
      const input = document.createElement("input");

      input.type = "checkbox";
      input.name = "category";
      input.value = category.slug;

      label.append(input, ` ${category.name}`);
      categoryOptions.appendChild(label);
    });
  } catch (error) {
    console.error("Ошибка загрузки категорий:", error);
    alert(error.message);
  }
}

async function init() {
  await loadCategories();
  await loadProduct();
}

init();
