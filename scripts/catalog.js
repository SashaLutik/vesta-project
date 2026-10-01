const filterConfig = [
  { key: "gender", title: "Пол", type: "radio" },
  { key: "category", title: "Категория", type: "checkbox" },
  { key: "color", title: "Цвет", type: "checkbox" },
  { key: "brand", title: "Бренд", type: "checkbox" },
  { key: "material", title: "Материал", type: "checkbox" },
];

let filtersData = {};

/* панель фильтров */
function buildFilterPanel() {
  const panel = document.querySelector(".filters-panel");
  if (!panel) return;
  panel.innerHTML = "";

  const categoryTpl = document.getElementById("filter-category-template");
  const optionTpl = document.getElementById("filter-option-template");

  filterConfig.forEach(({ key, title, type }) => {
    const options = filtersData[key];
    if (!options || !options.length) return;

    const clone = categoryTpl.content.cloneNode(true);
    clone.querySelector(".filter-category__name").textContent = title;

    const optionsBox = clone.querySelector(".filter-options");

    options.forEach((opt) => {
      const optClone = optionTpl.content.cloneNode(true);
      const input = optClone.querySelector("input");
      const span = optClone.querySelector("span");

      input.type = type;
      input.name = key;
      input.value = opt.value;
      span.textContent = opt.label;

      if (type === "radio" && opt.value === "all") input.checked = true;

      optionsBox.appendChild(optClone);
    });

    /* сворачивание/разворачивание */
    const header = clone.querySelector(".filter-category__header");
    header.addEventListener("click", () => {
      /* header.parentElement.classList.toggle("is-open"); */
      const category = header.parentElement;
      const wasOpen = category.classList.contains("is-open");

      panel
        .querySelectorAll(".filter-category.is-open")
        .forEach((el) => el.classList.remove("is-open"));

      if (!wasOpen) category.classList.add("is-open");
    });

    panel.appendChild(clone);
  });
}

function getFilterState() {
  const state = {
    gender: "all",
    category: [],
    color: [],
    brand: [],
    material: [],
  };

  /* radio */
  const genderChecked = document.querySelector(
    '.filters-panel input[name="gender"]:checked',
  );
  if (genderChecked) state.gender = genderChecked.value;

  /* checkbox */
  ["category", "color", "brand", "material"].forEach((key) => {
    document
      .querySelectorAll(`.filters-panel input[name="${key}"]:checked`)
      .forEach((input) => state[key].push(input.value));
  });

  return state;
}

function matches(card, state) {
  const dataEl = card.dataset;

  const cardCategories = dataEl.category ? dataEl.category.split(",") : [];
  const cardColors = dataEl.color ? dataEl.color.split(",") : [];
  const cardMaterials = dataEl.material ? dataEl.material.split(",") : [];
  const cardGender = dataEl.gender ? dataEl.gender.split(",") : [];
  const cardBrand = dataEl.brand || "";

  /* категория */
  if (state.category.length) {
    if (!state.category.some((v) => cardCategories.includes(v))) return false;
  }

  /* цвет */
  if (state.color.length) {
    if (!state.color.some((v) => cardColors.includes(v))) return false;
  }

  /* материал */
  if (state.material.length) {
    if (!state.material.some((v) => cardMaterials.includes(v))) return false;
  }

  /* бренд */
  if (state.brand.length) {
    if (!state.brand.includes(cardBrand)) return false;
  }

  /* пол */
  if (state.gender && state.gender !== "all") {
    if (!cardGender.includes(state.gender)) return false;
  }

  return true;
}

/* применение фильтров */
function applyFilters() {
  const grid = document.querySelector(".catalog-grid");
  if (!grid) return;

  const state = getFilterState();
  const cards = grid.querySelectorAll(".product-card");

  const emptyEl = document.querySelector(".catalog-empty");

  let visibleCount = 0;

  cards.forEach((card) => {
    const ok = matches(card, state);
    card.hidden = !ok;
    if (ok) visibleCount++;
  });

  if (emptyEl) emptyEl.hidden = visibleCount > 0;
}

function updateFilterOptionStyles() {
  const panel = document.querySelector(".filters-panel");
  if (!panel) return;

  panel.querySelectorAll(".filter-category").forEach((category) => {
    const hasChecked = category.querySelector("input:checked") !== null;
    category.classList.toggle("has-active", hasChecked);
  });
}

/* сброс */
function resetFilters() {
  document
    .querySelectorAll('.filters-panel input[type="checkbox"]')
    .forEach((i) => (i.checked = false));

  document
    .querySelectorAll('.filters-panel input[type="radio"]')
    .forEach((i) => (i.checked = false));

  const genderAll = document.querySelector(
    '.filters-panel input[name="gender"][value="all"]',
  );
  if (genderAll) genderAll.checked = true;

  updateFilterOptionStyles();
  applyFilters();
}

function bindFilterEvents() {
  const panel = document.querySelector(".filters-panel");
  if (!panel) return;

  panel.addEventListener("change", (e) => {
    if (e.target.matches("input")) {
      updateFilterOptionStyles();
      applyFilters();
    }
  });

  const clearBtn = document.querySelector(".filters__btn-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      resetFilters();
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".filter-category")) {
      panel
        .querySelectorAll(".filter-category.is-open")
        .forEach((el) => el.classList.remove("is-open"));
    }
  });
}

async function loadFiltersJson(url = "../data/cards.json") {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Не удалось загрузить cards.json");
  return res.json();
}

async function initCatalogFilters() {
  try {
    const data = await loadFiltersJson();
    filtersData = data.filters;

    buildFilterPanel();
    bindFilterEvents();
    updateFilterOptionStyles();
    applyFilters();
  } catch (error) {
    console.error("Ошибка инициализации фильтров:", error);
  }
}

const waitCards = setInterval(() => {
  if (document.querySelector(".catalog-grid .product-card")) {
    clearInterval(waitCards);
    initCatalogFilters();
  }
});
