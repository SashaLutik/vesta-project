const filterConfig = [
  { key: "gender", title: "Пол", type: "radio" },
  { key: "category", title: "Категория", type: "checkbox" },
  { key: "color", title: "Цвет", type: "checkbox" },
  { key: "brand", title: "Бренд", type: "checkbox" },
  { key: "material", title: "Материал", type: "checkbox" },
];

let filtersData = {};

const panel = document.querySelector(".filters-panel");
const grid = document.querySelector(".catalog-grid");
const overlay = document.querySelector(".filters-overlay");
const toggle = document.querySelector(".filters__toggle");

function buildFilterPanel() {
  const categoryTpl = document.getElementById("filter-category-template");
  const optionTpl = document.getElementById("filter-option-template");

  if (!panel || !categoryTpl || !optionTpl) return;

  panel.innerHTML = "";

  filterConfig.forEach(({ key, title, type }) => {
    const options = filtersData[key];
    if (!Array.isArray(options) || !options.length) return;

    const category = categoryTpl.content.cloneNode(true);
    const optionsBox = category.querySelector(".filter-options");

    category.querySelector(".filter-category__name").textContent = title;

    options.forEach(({ value, label }) => {
      const option = optionTpl.content.cloneNode(true);
      const input = option.querySelector("input");

      input.type = type;
      input.name = key;
      input.value = value;
      input.checked = type === "radio" && value === "all";
      option.querySelector("span").textContent = label;

      optionsBox.appendChild(option);
    });

    panel.appendChild(category);
  });

  const done = document.createElement("button");
  done.type = "button";
  done.className = "filters-panel__done button button--theme_dark";
  done.textContent = "Готово";
  panel.appendChild(done);
}

function getFilterState() {
  const state = {
    gender: "all",
    category: [],
    color: [],
    brand: [],
    material: [],
  };

  panel.querySelectorAll("input:checked").forEach((input) => {
    if (input.type === "radio") state[input.name] = input.value;
    else state[input.name].push(input.value);
  });

  return state;
}

function applyFilters() {
  if (!grid || !panel) return;

  const state = getFilterState();
  const empty = document.querySelector(".catalog-empty");
  let visible = 0;

  grid.querySelectorAll(".product-card").forEach((card) => {
    const data = card.dataset;
    const list = (value) => (value ? value.split(",") : []);

    const matches = [
      !state.category.length ||
        state.category.some((v) => list(data.category).includes(v)),
      !state.color.length ||
        state.color.some((v) => list(data.color).includes(v)),
      !state.material.length ||
        state.material.some((v) => list(data.material).includes(v)),
      !state.brand.length || state.brand.includes(data.brand || ""),
      state.gender === "all" || list(data.gender).includes(state.gender),
    ].every(Boolean);

    card.hidden = !matches;
    if (matches) visible++;
  });

  if (empty) empty.hidden = visible > 0;
}

function updateFilterStyles() {
  panel.querySelectorAll(".filter-category").forEach((category) => {
    const active = [...category.querySelectorAll("input:checked")].some(
      (input) => input.value !== "all",
    );

    category.classList.toggle("has-active", active);
  });
}

function closeFilterOptions() {
  panel
    .querySelectorAll(".filter-category.is-open, .filter-options.is-open")
    .forEach((element) => element.classList.remove("is-open"));
}

function resetFilters() {
  panel.querySelectorAll("input").forEach((input) => {
    input.checked = input.type === "radio" && input.value === "all";
  });

  closeFilterOptions();
  updateFilterStyles();
  applyFilters();
}

function toggleDrawer(forceOpen) {
  if (!panel) return;

  const isOpen = forceOpen ?? !panel.classList.contains("is-open");

  panel.classList.toggle("is-open", isOpen);
  if (toggle) toggle.setAttribute("aria-expanded", String(isOpen));

  document.body.style.overflow = isOpen ? "hidden" : "";

  if (!overlay) return;

  if (isOpen) {
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("is-open"));
  } else {
    overlay.classList.remove("is-open");
    setTimeout(() => {
      if (!overlay.classList.contains("is-open")) overlay.hidden = true;
    }, 300);
  }
}

function initCatalogFilters() {
  if (!panel) return;

  buildFilterPanel();
  updateFilterStyles();
  applyFilters();

  panel.addEventListener("change", (event) => {
    if (!event.target.matches("input")) return;
    updateFilterStyles();
    applyFilters();
  });

  panel.addEventListener("click", (event) => {
    if (event.target.closest(".filters-panel__done")) {
      toggleDrawer(false);
    } else if (event.target.closest(".filter-options__close")) {
      event.preventDefault();
      event.stopPropagation();
      closeFilterOptions();
    } else if (event.target.closest(".filter-category__header")) {
      const category = event.target.closest(".filter-category");
      const options = category.querySelector(".filter-options");
      const wasOpen = category.classList.contains("is-open");

      closeFilterOptions();

      if (!wasOpen) {
        category.classList.add("is-open");
        options.classList.add("is-open");
      }
    }
  });

  document
    .querySelector(".filters__btn-clear")
    ?.addEventListener("click", resetFilters);

  toggle?.addEventListener("click", () => toggleDrawer());
  overlay?.addEventListener("click", () => toggleDrawer(false));

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".filter-category")) closeFilterOptions();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeFilterOptions();
      toggleDrawer(false);
    }
  });
}

document.addEventListener("products:rendered", (event) => {
  const filters = event.detail?.filters;

  if (!filters) {
    console.error("Не удалось получить данные фильтров");
    return;
  }

  filtersData = filters;
  initCatalogFilters();
});
