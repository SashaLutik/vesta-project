const modal = document.querySelector("#product-modal");
const openButton = document.querySelector(".add-card");
const closeButton = document.querySelector(".product-modal__close");
const overlay = document.querySelector(".product-modal__overlay");
const cancelButton = document.querySelector("[data-modal-close]");
const categoryOptions = document.querySelector("#category-options");
const form = document.querySelector("#product-form");

function openModal() {
  modal.classList.add("product-modal--active");
  modal.setAttribute("aria-hidden", "false");
  document.documentElement.classList.add("modal-open");
  document.body.classList.add("modal-open");
}

function closeModal() {
  modal.classList.remove("product-modal--active");
  modal.setAttribute("aria-hidden", "true");
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
}

openButton.addEventListener("click", (event) => {
  event.preventDefault();
  openModal();
});

closeButton.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
cancelButton.addEventListener("click", closeModal);

/* Загрузка категорий из базы данных */
async function loadCategories() {
  try {
    const response = await fetch("http://localhost:5000/api/categories");

    if (!response.ok) {
      throw new Error("Не удалось загрузить категории");
    }

    const categories = await response.json();

    categoryOptions.innerHTML = "";

    categories.forEach((category) => {
      const label = document.createElement("label");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "category";
      checkbox.value = category.slug;

      label.append(checkbox, document.createTextNode(` ${category.name}`));

      categoryOptions.append(label);
    });
  } catch (error) {
    console.error("Ошибка загрузки категорий:", error);
    categoryOptions.textContent = "Не удалось загрузить категории";
  }
}


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
    const response = await fetch("http://localhost:5000/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Не удалось создать товар");
    }

    console.log("Товар успешно создан:", result);

    form.reset();
    closeModal();
  } catch (error) {
    console.error("Ошибка создания товара:", error.message);
    alert(error.message);
  }
});

loadCategories();